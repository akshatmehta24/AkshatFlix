"""Generate narration with Kokoro, measure it, and build frame-accurate scene timelines.
Usage: python make_vo.py <kokoro_dir>
Writes audio/vo3/*.wav and src/tl_<film>.json"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

from scripts import FILMS

FPS = 30
KD = sys.argv[1]
k = Kokoro(f'{KD}/kokoro.onnx', f'{KD}/voices.bin')
VOICE = {'N': ('af_heart', 1.0), 'D': ('am_michael', 1.02)}
LEAD = 0.45  # seconds into a scene before the first line (visual builds first)
GAP = 0.35  # between lines inside a scene
HOLD = 0.95  # after the last line, before the cut
os.makedirs('vo3', exist_ok=True)


def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - 240)
    e = min(len(a), idx[-1] + 2400)
    return a[s:e]


for film, scenes in FILMS.items():
    t = 0.0
    out = []
    for si, (sid, lines, min_d) in enumerate(scenes):
        cur = t + LEAD
        vos = []
        for li, (spk, text) in enumerate(lines):
            v, sp = VOICE[spk]
            a, sr = k.create(text, voice=v, speed=sp, lang='en-us')
            a = trim(a)
            fn = f'vo3/{film}_{si:02d}_{li}.wav'
            sf.write(fn, a, sr)
            d = len(a) / sr
            # envelope per frame (for waveform visuals)
            hop = sr // FPS
            env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
            m = max(env) + 1e-9
            env = [round(min(1, e / m * 1.15), 3) for e in env]
            vos.append({'spk': spk, 'text': text, 'file': fn, 'at': round(cur * FPS), 'dur': round(d * FPS), 'env': env})
            cur += d + GAP
        end = cur - GAP + HOLD
        dur = max(end - t, min_d)
        if sid == 'end' or sid == 'outro':
            dur = max(dur, end - t + 1.2)
        out.append({'id': sid, 'start': round(t * FPS), 'dur': round(dur * FPS), 'vo': vos})
        t += dur
    total = round(t * FPS)
    json.dump({'fps': FPS, 'total': total, 'scenes': out}, open(f'../src/tl_{film}.json', 'w'))
    print(film, f'{t:.1f}s', [(s['id'], round(s['dur'] / FPS, 1)) for s in out])
