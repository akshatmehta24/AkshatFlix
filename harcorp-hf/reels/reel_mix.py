"""Punchy reel mix: VO + driving score + hit-on-every-cut SFX, frame-locked to reel.js. Usage: reel_mix.py <reel>"""
import json
import sys

sys.path.insert(0, '/home/user/AkshatFlix/harcorp/audio')
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from scipy.signal import resample_poly  # noqa: E402
from music import *  # noqa: E402,F403
from sfx import *  # noqa: E402,F403

d = sys.argv[1]
R = json.load(open(f'{d}/timing.json'))
LEN = R['total'] + 0.15
m = Mix(LEN)
shots = R['shots']
last = shots[-1]


def load(p):
    a, sr = sf.read(f'{d}/{p}')
    a = a.mean(1) if a.ndim > 1 else a
    if sr != SR:
        a = resample_poly(a, SR, sr)
    a = hp(a, 90)
    return a / (np.max(np.abs(a)) + 1e-9)


# ---------- voice ----------
duck = np.zeros(m.n)
for s in shots:
    for v in s['vo']:
        a = load(v['file'])
        m.add(v['at'], a, -1.5 if v['spk'] == 'N' else -2.5, 0, 0.04)
        i = int(v['at'] * SR)
        duck[max(0, i - int(0.08 * SR)):i + len(a) + int(0.12 * SR)] = 1
k = int(0.15 * SR)
duck = np.clip(np.convolve(duck, np.ones(k) / k, 'same'), 0, 1)

# ---------- score: drives from the first cut, drops out right before the end hit ----------
music = Mix(LEN)
drop = last['start'] - 0.35
cyc = ['Dm9', 'Bbmaj7', 'Gm9', 'Bbmaj7']
secs = []
t = 0.0
k2 = 0
while t < drop - 0.01:
    t1 = min(drop, t + 2.0)
    layers = {'pad', 'bass', 'kick', 'hat'} | ({'arp', 'bright'} if t >= 2.0 else set())
    secs.append((t, t1, cyc[k2 % 4], layers))
    t = t1
    k2 += 1
score(music, LEN, secs)
g = (1 - 0.55 * duck) * 10 ** (-3 / 20)
for a_ in ('L', 'R', 'vL', 'vR'):
    setattr(m, a_, getattr(m, a_) + getattr(music, a_) * g)


def cut(t, g=-24):
    m.add_stereo(t - 0.06, whoosh(0.22, 800, 6000, q=1.1, shape='swell'), g, verb=0.15)
    m.add(t, tick(3200, 0.03, 0.004, 0.3), g - 3, 0, 0.1)


def slam_hit(t, big=False):
    m.add(t, kick(), -9 if big else -12, 0, 0.04)
    m.add(t, sub_hit(95, 40, 0.9 if big else 0.6, 0.3 if big else 0.18), -12 if big else -16, 0, 0.05)
    m.add(t, stamp(0.09, 160), -17, 0, 0.12)
    m.add_stereo(t, whoosh(0.3, 6000, 1200, q=0.9, shape='fall'), -24, verb=0.25)


def lock(t, f0=1760):
    m.add(t, blip(f0, 0.1, 0.022, 0.2), -20, 0.3, 0.25)
    m.add(t, tick(5200, 0.02, 0.002, 0.2), -26, 0.3, 0.2)


def success(t):
    m.add(t, chime([N(84), N(88), N(91)], 0.05, 0.7, 0.14), -16, 0, 0.4)
    m.add(t, sub_hit(90, 45, 0.7, 0.18), -17, 0, 0.05)


for si, s in enumerate(shots):
    S, D, kind, p, vo = s['start'], s['dur'], s['kind'], s['params'], s['vo']
    words = [w for v in vo for w in v['words']]
    if si > 0 and kind != 'logo':
        cut(S)
    if kind == 'slam':
        n = len(p['words'])
        for j in range(n):
            wi = min(len(words) - 1, round(j * len(words) / n))
            t = S + 0.02 if j == 0 else max(S + 0.05, words[wi]['t'])
            slam_hit(t, j == p.get('accent', -1))
        if p.get('keys'):
            r = np.random.default_rng(si)
            for j in range(26):
                m.add(S + 0.03 + r.uniform(0, 0.25), key_click(j), -22, r.uniform(-0.9, 0.9), 0.1)
    elif kind == 'wave':
        m.add(S + 0.05, chime([N(81), N(88)], 0.07, 0.45, 0.09), -20, 0.2, 0.3)
        air = lp(hp(rng.standard_normal(int(D * SR)), 300), 3000) * np.sin(np.linspace(0, np.pi, int(D * SR))) ** 0.5
        m.add_stereo(S, air, -42, verb=0)
    elif kind == 'net':
        r = np.random.default_rng(7 + si)
        for j in range(22):
            m.add(S + 0.02 + r.uniform(0, 0.35), blip(r.uniform(1800, 3600), 0.05, 0.01, 0.1), -30, r.uniform(-0.8, 0.8), 0.25)
        m.add_stereo(S + 0.1, whoosh(0.8, 500, 7000, q=2.0, shape='swell'), -22, verb=0.2)
        for j in range(12):
            m.add(S + 0.05 + j * 0.07, tick(3400, 0.02, 0.002, 0.1), -30, 0.6, 0.1)
        lt = S + min(0.75, D * 0.38)
        for j in range(3):
            lock(lt + j * 0.14, 1568 + 220 * j)
    elif kind == 'diff':
        lines = 6 if not p.get('retry') else 7
        nact = 5
        step = min(0.16, (D - 0.5) / lines)
        for j in range(nact):
            m.add(S + 0.2 + j * step, blip(1568 + 120 * j, 0.08, 0.018), -22, -0.3 + 0.15 * j, 0.2)
        m.add_stereo(S + 0.2, data_chatter(0.8, 60, seed=si), -28, verb=0.05)
    elif kind == 'tests':
        for j in range(4):
            m.add(S + 0.18 + j * 0.08, tick(2600 + 200 * j, 0.03, 0.004, 0.2), -24, 0.4, 0.15)
        success(S + min(0.75, D * 0.5))
    elif kind == 'boot':
        for j in range(4):
            for c in range(5):
                m.add(S + 0.05 + j * 0.16 + c * 0.025, key_click(j * 10 + c), -27, -0.3, 0.06)
        bt = S + max(0.75, D * 0.42)
        slam_hit(bt, False)
        slam_hit(bt + 0.18, True)
        m.add(bt + 0.4, glitch(0.15), -24, 0.2, 0.1)
        for kk in range(3):
            m.add(S + 0.9 + kk * 0.36, blip(880, 0.08, 0.02), -28, 0, 0.3)
    elif kind == 'mark':
        m.add_stereo(S, whoosh(0.6, 300, 3500, q=2.2, shape='swell'), -20, verb=0.3)
        for j in range(5):
            m.add(S + 0.15 + j * 0.05, stamp(0.07, 150 + 25 * j), -18, -0.3 + 0.15 * j, 0.12)
        slam_hit(S + 0.4, True)
        m.add_stereo(S + 0.7, whoosh(0.6, 4000, 11000, q=2.0, shape='swell'), -27, verb=0.4)
    elif kind == 'alert':
        if p['state'] == 'fail':
            m.add(S + 0.02, alarm(0.3), -17, 0, 0.2)
            m.add(S + 0.42, alarm(0.3), -19, 0, 0.2)
            m.add(S + 0.1, glitch(0.12), -22, 0.2, 0.1)
            m.add(S + 0.02, sub_hit(70, 35, 0.8, 0.25), -14, 0, 0.05)
        else:
            success(S + 0.04)
            slam_hit(S + 0.04, False)
    elif kind == 'logo':
        m.add_stereo(S - 0.7, whoosh(0.75, 200, 9000, q=1.4, shape='rise', curve=1.3), -17, verb=0.25)
        rr = np.random.default_rng(99)
        for j in range(40):
            m.add(S - 0.26 + j * 0.014, tick(rr.uniform(2500, 7000), 0.02, 0.002, 0.15), -30, rr.uniform(-0.9, 0.9), 0.25)
        sp = data_chatter(0.8, 110, seed=5, lo=3500, hi=8000)
        m.add_stereo(S, sp * np.linspace(0.3, 1, len(sp)), -27, width=0.9, verb=0.35)
        hit = S + 0.85
        m.add(hit, sub_hit(70, 34, 2.6, 0.9), -9, 0, 0.1)
        m.add(hit, kick(), -10, 0, 0.05)
        m.add_stereo(hit, chord([N(n) for n in CH['Dadd9']], 2.6, attack=0.015, decay=1.5), -12, verb=0.5)
        for j in range(7):
            m.add(hit + 0.1 + j * 0.045, tick(2400 + 80 * j, 0.03, 0.005, 0.25), -24, -0.5 + 0.16 * j, 0.25)
        m.add_stereo(hit + 0.5, whoosh(0.7, 4000, 11000, q=2.0, shape='swell'), -26, verb=0.4)
    # reel 3: split stamp when the clock passes a milestone
    if R['timer'] and p.get('split'):
        m.add(S + 0.02, blip(2093, 0.12, 0.03, 0.3), -21, -0.5, 0.3)
        if p.get('stop'):
            m.add(S + 0.02, chime([N(88), N(91), N(96)], 0.05, 0.9, 0.18), -17, 0, 0.4)

# reel 3: soft clock ticks while the timer runs
if R['timer']:
    t0 = [s['start'] for s in shots if s['params'].get('split')][0]
    t1 = [s['start'] for s in shots if s['params'].get('stop')][0]
    t = t0
    while t < t1:
        m.add(t, tick(4200, 0.015, 0.0015, 0.05), -33, 0.55, 0.05)
        t += 0.125

m.render(f'{d}/assets/audio/mix_raw.wav', rt=1.6)
print('ok', d)
