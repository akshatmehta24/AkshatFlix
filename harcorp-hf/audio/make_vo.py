"""VO + timing for the 30s HyperFrames film. Writes film/assets/audio/vo_*.wav and film/timing.js"""
import json
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

KD = sys.argv[1]
k = Kokoro(f'{KD}/kokoro.onnx', f'{KD}/voices.bin')
V = {'N': ('af_heart', 1.04), 'D': ('am_michael', 1.06)}

BEATS = [
    ('chaos', [('N', 'Forty tabs. Six drafts. One idea, stuck somewhere in between.')], 0.25, 0.6),
    ('meet', [('N', 'Meet HARCODE, from Harcorp Industries.')], 0.35, 0.55),
    ('voice', [('N', 'Just say what you need.'), ('D', 'Add rate limiting to the login route.')], 0.3, 0.55),
    ('reads', [('N', 'It reads your codebase, and finds every file the change will touch.')], 0.3, 0.5),
    ('writes', [('N', 'It writes the code, runs your tests, and you review every edit.')], 0.3, 0.55),
    ('platform', [('N', 'And powered by HARC-OM, the Harcorp AI Platform reshapes itself to fit your task.')], 0.3, 0.55),
    ('end', [('N', 'HARCODE. Talk to your terminal.')], 0.5, 2.0),
]
GAP = 0.28


def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 200):min(len(a), idx[-1] + 1800)]


t = 0.0
out = []
for bi, (bid, lines, lead, hold) in enumerate(BEATS):
    cur = t + lead
    vos = []
    for li, (spk, text) in enumerate(lines):
        v, sp = V[spk]
        a, sr = k.create(text, voice=v, speed=sp, lang='en-us')
        a = trim(a)
        fn = f'assets/audio/vo_{bi}_{li}.wav'
        sf.write('../film/' + fn, a, sr)
        d = len(a) / sr
        hop = sr // 30
        env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        m = max(env)
        env = [round(min(1, e / m * 1.15), 3) for e in env]
        vos.append({'spk': spk, 'text': text, 'file': fn, 'at': round(cur, 3), 'dur': round(d, 3), 'env': env})
        cur += d + GAP
    end = cur - GAP + hold
    out.append({'id': bid, 'start': round(t, 3), 'dur': round(end - t, 3), 'vo': vos})
    t = end
T = {'total': round(t, 3), 'beats': out}
open('../film/timing.js', 'w').write('window.T = ' + json.dumps(T) + ';\n')
json.dump(T, open('timing.json', 'w'))
print(round(t, 2), [(b['id'], round(b['start'], 2), round(b['dur'], 2)) for b in out])
