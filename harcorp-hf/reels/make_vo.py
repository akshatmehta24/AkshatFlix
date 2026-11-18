"""TTS per line, measured; shot timing for fast reels. Writes <reel>/assets/audio/*.wav and <reel>/timing.json"""
import json
import os
import re
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

from spec import REELS

k = Kokoro(f'{sys.argv[1]}/kokoro.onnx', f'{sys.argv[1]}/voices.bin')
V = {'N': ('af_heart', 1.12), 'D': ('am_michael', 1.1)}
LEAD, GAP, HOLD = 0.12, 0.12, 0.22


def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 150):min(len(a), idx[-1] + 1200)]


def syl(w):
    w = re.sub('[^a-z]', '', w.lower())
    return max(1, len(re.findall('[aeiouy]+', w)) - (1 if w.endswith('e') and len(w) > 3 else 0))


for R in REELS:
    d = R['name']
    os.makedirs(f'{d}/assets/audio', exist_ok=True)
    t = 0.0
    shots = []
    for si, (kind, lines, mind, params) in enumerate(R['shots']):
        cur = t + LEAD
        vos = []
        for li, (spk, text) in enumerate(lines):
            v, sp = V[spk]
            a, sr = k.create(text, voice=v, speed=sp, lang='en-us')
            a = trim(a)
            fn = f'assets/audio/vo_{si}_{li}.wav'
            sf.write(f'{d}/{fn}', a, sr)
            dur = len(a) / sr
            hop = sr // 30
            env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
            m = max(env)
            env = [round(min(1, e / m * 1.15), 3) for e in env]
            # word timing by syllables, punctuation adds a pause weight
            ws = text.split(' ')
            wts = [syl(w) + (0.8 if w[-1] in '.,?!' else 0) for w in ws]
            tot = sum(wts)
            acc = 0
            words = []
            for w, wt in zip(ws, wts):
                words.append({'w': w, 't': round(cur + 0.03 + acc / tot * dur * 0.94, 3)})
                acc += wt
            vos.append({'spk': spk, 'text': text, 'file': fn, 'at': round(cur, 3), 'dur': round(dur, 3), 'env': env, 'words': words})
            cur += dur + GAP
        end = cur - GAP + HOLD
        dur = max(end - t, mind)
        shots.append({'i': si, 'kind': kind, 'params': params, 'start': round(t, 3), 'dur': round(dur, 3), 'vo': vos})
        t += dur
    out = {'name': d, 'title': R['title'], 'stage_top': R['stage_top'], 'timer': R.get('timer', False), 'total': round(t, 3), 'shots': shots}
    json.dump(out, open(f'{d}/timing.json', 'w'))
    print(d, round(t, 1), [(s['kind'], s['dur']) for s in shots])
