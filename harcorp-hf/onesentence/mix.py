"""ONE SENTENCE mix — VO, a building cinematic score, and SFX locked to the world/main timings."""
import json
import sys

sys.path.insert(0, '/home/user/AkshatFlix/harcorp/audio')
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from scipy.signal import resample_poly  # noqa: E402
from music import *  # noqa: E402,F403
from sfx import *  # noqa: E402,F403

T = json.load(open('timing.json'))
P = {p['id']: p for p in T['ph']}
LEN = T['total'] + 0.2
m = Mix(LEN)


def load(p):
    a, sr = sf.read(p)
    a = a.mean(1) if a.ndim > 1 else a
    if sr != SR:
        a = resample_poly(a, SR, sr)
    a = hp(a, 90)
    return a / (np.max(np.abs(a)) + 1e-9)


duck = np.zeros(m.n)
for p in T['ph']:
    for v in p['vo']:
        a = load(v['file'])
        m.add(v['at'], a, -1.5 if v['spk'] == 'N' else -2.5, 0, 0.05)
        i = int(v['at'] * SR)
        duck[max(0, i - int(0.1 * SR)):i + len(a) + int(0.15 * SR)] = 1
k = int(0.2 * SR)
duck = np.clip(np.convolve(duck, np.ones(k) / k, 'same'), 0, 1)

D0, R0, V0, E0 = P['dive']['start'], P['rebuild']['start'], P['reveal']['start'], P['end']['start']
CLIMAX = V0 + 1.9

# ---------- score: builds through the dive & rebuild, silence before the reveal climax ----------
music = Mix(LEN)
secs = [
    (P['voice']['start'], D0, 'Dm9', {'pad', 'soft'}),
    (D0, D0 + 2.0, 'Dm9', {'pad', 'bass', 'kick2', 'hat8'}),
    (D0 + 2.0, R0, 'Bbmaj7', {'pad', 'bass', 'kick', 'hat', 'arp'}),
    (R0, R0 + 2.0, 'Gm9', {'pad', 'bass', 'kick', 'hat', 'arp', 'bright'}),
    (R0 + 2.0, V0 + 0.4, 'Bbmaj7', {'pad', 'bass', 'kick', 'hat', 'arp', 'bright'}),
]
score(music, LEN, secs)
g = (1 - 0.55 * duck) * 10 ** (-3 / 20)
for a_ in ('L', 'R', 'vL', 'vR'):
    setattr(m, a_, getattr(m, a_) + getattr(music, a_) * g)

# ---------- hook ----------
hw = P['hook']['vo'][0]['words']
for t, big in ((hw[0]['t'] - 0.05, False), (hw[2]['t'], True), (hw[4]['t'], True)):
    m.add(t, kick(), -9 if big else -13, 0, 0.04)
    m.add(t, sub_hit(95, 40, 0.8 if big else 0.5, 0.3), -12 if big else -17, 0, 0.05)
    m.add(t, stamp(0.09, 150), -16, 0, 0.12)
    m.add_stereo(t, whoosh(0.3, 6000, 1200, q=0.9, shape='fall'), -23, verb=0.25)
m.add_stereo(P['hook']['start'] + P['hook']['dur'] - 0.25, whoosh(0.3, 5000, 400, q=0.9, shape='fall'), -22, verb=0.2)

# ---------- voice: listening + the beam shooting down ----------
vs = P['voice']['start']
ve = vs + P['voice']['dur']
m.add(vs + 0.05, chime([N(81), N(88)], 0.07, 0.5, 0.1), -20, 0.2, 0.35)
m.add_stereo(ve - 0.55, whoosh(0.45, 3000, 300, q=1.3, shape='fall'), -20, verb=0.2)  # squeeze
m.add(ve - 0.1, sub_hit(120, 30, 1.2, 0.45), -11, 0, 0.1)  # beam drop
m.add_stereo(ve - 0.12, whoosh(0.9, 9000, 150, q=0.8, shape='fall'), -17, verb=0.35)

# ---------- dive: city rises, letters rain & hit ----------
m.add_stereo(D0, whoosh(1.2, 100, 1800, q=0.6, shape='swell'), -19, verb=0.25)
for i in range(30):
    t0 = D0 + 0.15 + i * 0.045
    dur = 0.75 + (np.sin(i * 127.1 + 311.7) * 43758.5453 % 1) * 0.25
    m.add(t0, tick(4500 + 60 * (i % 8), 0.02, 0.002, 0.08), -33, -0.7 + 1.4 * (i % 5) / 4, 0.3)
    m.add(t0 + dur, blip(1400 + 110 * (i % 4), 0.07, 0.015, 0.2), -27, -0.4 + 0.27 * (i % 4), 0.25)
for kk in range(4):
    m.add(D0 + 1.1 + kk * 0.12, stamp(0.08, 170 + 20 * kk), -20, -0.45 + 0.3 * kk, 0.12)

# ---------- rebuild: floors stacking, red error then fixed, test sweep ----------
for j in range(16):
    m.add(R0 + 0.1 + j * 0.08, stamp(0.06, 200 + (j % 4) * 25), -25, -0.6 + 0.08 * j, 0.1)
m.add(R0 + 0.5, alarm(0.28), -19, 0.3, 0.2)
m.add(R0 + 0.5, glitch(0.1), -24, 0.3, 0.1)
m.add(R0 + 1.4, chime([N(84), N(88)], 0.06, 0.5, 0.1), -20, 0.3, 0.3)
m.add_stereo(R0 + 1.5, whoosh(1.5, 300, 6000, q=1.6, shape='swell'), -19, verb=0.3)
for j in range(14):
    m.add(R0 + 1.5 + j * 0.105, tick(2600 + 90 * j, 0.03, 0.004, 0.2), -24, -0.7 + 0.1 * j, 0.15)
m.add(R0 + 3.0, chime([N(84), N(88), N(91)], 0.05, 0.8, 0.15), -16, 0, 0.4)

# ---------- reveal: rocket up, drop out, massive hit ----------
m.add_stereo(V0, whoosh(1.9, 150, 10000, q=1.2, shape='rise', curve=1.5), -15, verb=0.3)
m.add(V0, glide(80, 600, 1.85), -24, 0, 0.1)
vw = P['reveal']['vo'][0]['words']
m.add(vw[0]['t'], kick(), -13, 0, 0.05)
m.add(vw[3]['t'], kick(), -11, 0, 0.05)
m.add(vw[3]['t'], sub_hit(90, 40, 0.6, 0.2), -16, 0, 0.05)
m.add(CLIMAX, sub_hit(70, 30, 4.0, 1.2), -7, 0, 0.12)
m.add(CLIMAX, kick(), -9, 0, 0.05)
m.add_stereo(CLIMAX, chord([N(n) for n in CH['Dadd9']], 4.5, attack=0.012, decay=2.2), -11, verb=0.55)
m.add_stereo(CLIMAX, pad([N(n) for n in CH['Dadd9']], 5.5, attack=0.4, release=2.0, cutoff=1600), -17, verb=0.4)
m.add_stereo(CLIMAX + 0.05, whoosh(1.6, 9000, 2500, q=0.8, shape='fall'), -22, verb=0.5)
m.add_stereo(V0 + 1.5, whoosh(0.9, 2500, 9000, q=2.2, shape='swell'), -25, verb=0.4)  # ring trace shimmer

# ---------- end ----------
for j in range(7):
    m.add(E0 + 0.35 + j * 0.05, tick(2400 + 90 * j, 0.03, 0.005, 0.25), -23, -0.5 + 0.16 * j, 0.25)
m.add(E0 + 1.1, kick(), -12, 0, 0.05)
m.add(E0 + 1.1, stamp(0.1, 140), -17, 0, 0.15)

m.render('assets/audio/mix_raw.wav', rt=2.0)
print('ok', LEN)
