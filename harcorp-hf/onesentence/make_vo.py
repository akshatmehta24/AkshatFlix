"""VO + phase timing for ONE SENTENCE. Writes assets/audio/vo_*.wav, timing.json, timing.js"""
import json
import re
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

k = Kokoro(f'{sys.argv[1]}/kokoro.onnx', f'{sys.argv[1]}/voices.bin')
V = {'N': ('af_heart', 1.06), 'D': ('am_michael', 1.04)}
# phase, lines, lead, min_dur
PH = [
    ('hook', [('N', 'Watch what one sentence can do.')], 0.15, 2.3),
    ('voice', [('D', 'Add rate limiting to the login route.')], 0.25, 3.0),
    ('dive', [('N', 'HARCODE hears it, and finds the four files it touches.')], 0.2, 3.6),
    ('rebuild', [('N', 'Rebuilds them. Tests everything.')], 0.25, 3.4),
    ('reveal', [('N', 'One sentence in. Working code out.')], 0.9, 3.9),
    ('end', [('N', 'HARCODE. By Harcorp.')], 0.4, 3.4),
]


def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 150):min(len(a), idx[-1] + 1400)]


def syl(w):
    w = re.sub('[^a-z]', '', w.lower())
    return max(1, len(re.findall('[aeiouy]+', w)) - (1 if w.endswith('e') and len(w) > 3 else 0))


t = 0.0
out = []
for pi, (pid, lines, lead, mind) in enumerate(PH):
    cur = t + lead
    vos = []
    for li, (spk, text) in enumerate(lines):
        v, sp = V[spk]
        a, sr = k.create(text, voice=v, speed=sp, lang='en-us')
        a = trim(a)
        fn = f'assets/audio/vo_{pi}_{li}.wav'
        sf.write(fn, a, sr)
        dur = len(a) / sr
        hop = sr // 30
        env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        mx = max(env)
        env = [round(min(1, e / mx * 1.15), 3) for e in env]
        ws = text.split(' ')
        wts = [syl(w) + (0.8 if w[-1] in '.,?!' else 0) for w in ws]
        tot = sum(wts)
        acc = 0
        words = []
        for w, wt in zip(ws, wts):
            words.append({'w': w, 't': round(cur + 0.03 + acc / tot * dur * 0.94, 3)})
            acc += wt
        vos.append({'spk': spk, 'text': text, 'file': fn, 'at': round(cur, 3), 'dur': round(dur, 3), 'env': env, 'words': words})
        cur += dur + 0.15
    dur = max(cur - 0.15 + 0.25 - t, mind)
    out.append({'id': pid, 'start': round(t, 3), 'dur': round(dur, 3), 'vo': vos})
    t += dur
T = {'total': round(t, 3), 'ph': out}
json.dump(T, open('timing.json', 'w'))
open('timing.js', 'w').write('window.T = ' + json.dumps(T) + ';')
print(round(t, 2), [(p['id'], p['start'], p['dur']) for p in out])
