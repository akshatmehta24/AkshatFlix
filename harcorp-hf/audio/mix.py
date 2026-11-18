"""Premium mix for the HyperFrames film: VO + score + SFX, all frame-locked to film.js times."""
import json
import sys

sys.path.insert(0, '/home/user/AkshatFlix/harcorp/audio')
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from scipy.signal import resample_poly  # noqa: E402
from music import *  # noqa: E402,F403
from sfx import *  # noqa: E402,F403

T = json.load(open('timing.json'))
B = {b['id']: b for b in T['beats']}
LEN = T['total'] + 0.2
m = Mix(LEN)


def load(p):
    a, sr = sf.read('../film/' + p)
    if a.ndim > 1:
        a = a.mean(1)
    if sr != SR:
        a = resample_poly(a, SR, sr)
    a = hp(a, 85)
    return a / (np.max(np.abs(a)) + 1e-9)


def word_times(v):
    acc = 0
    out = []
    for w in v['text'].split(' '):
        out.append(v['at'] + acc / len(v['text']) * v['dur'] * 0.93)
        acc += len(w) + 1
    return out


# ---------------- voice ----------------
duck = np.zeros(m.n)
for b in T['beats']:
    for v in b['vo']:
        a = load(v['file'])
        m.add(v['at'], a, -2.0 if v['spk'] == 'N' else -3.0, 0, 0.05)
        i = int(v['at'] * SR)
        duck[max(0, i - int(0.12 * SR)):i + len(a) + int(0.2 * SR)] = 1
k = int(0.25 * SR)
duck = np.clip(np.convolve(duck, np.ones(k) / k, 'same'), 0, 1)

# ---------------- score ----------------
music = Mix(LEN)
secs = [
    (0.0, B['meet']['start'], 'Dm9', {'pad', 'soft', 'hat8'}),
    (B['meet']['start'], B['voice']['start'], 'Dm9', {'pad', 'bass', 'kick2', 'hat8'}),
    (B['voice']['start'], B['reads']['start'], 'Bbmaj7', {'pad', 'bass', 'kick2', 'hat8'}),
    (B['reads']['start'], B['writes']['start'], 'Gm9', {'pad', 'bass', 'kick', 'hat', 'arp'}),
    (B['writes']['start'], B['platform']['start'], 'Bbmaj7', {'pad', 'bass', 'kick', 'hat', 'arp', 'bright'}),
    (B['platform']['start'], B['end']['start'] - 0.5, 'Gm9', {'pad', 'bass', 'kick', 'hat', 'arp', 'bright'}),
]
score(music, LEN, secs)
g = (1 - 0.6 * duck) * 10 ** (-4 / 20)
for a_, b_ in (('L', 'L'), ('R', 'R'), ('vL', 'vL'), ('vR', 'vR')):
    setattr(m, a_, getattr(m, a_) + getattr(music, b_) * g)


def shimmer(t, dur=0.6, g=-30):
    m.add_stereo(t, whoosh(dur, 4000, 11000, q=2.0, shape='swell'), g, verb=0.4)


def impact(t, g=-11):
    m.add(t, sub_hit(85, 38, 1.4, 0.4), g, 0, 0.08)
    m.add_stereo(t, whoosh(0.5, 7000, 800, q=0.8, shape='fall'), g - 12, verb=0.3)


def pixel_sweep(t):
    # granular cascade of tiny ticks + air, centred on the cut
    r = np.random.default_rng(int(t * 100))
    for i in range(46):
        tt = t - 0.36 + i * 0.016 + r.uniform(0, 0.01)
        m.add(tt, tick(r.uniform(2500, 7000), 0.02, 0.002, 0.15), -31, r.uniform(-0.9, 0.9), 0.25)
    m.add_stereo(t - 0.4, whoosh(0.8, 300, 6000, q=1.0, shape='swell'), -21, verb=0.25)
    m.add(t, sub_hit(70, 36, 1.0, 0.25), -15, 0, 0.05)


# ---------------- 1. chaos ----------------
s = B['chaos']['start']
for i in range(40):  # tab windows landing: soft, quick, slightly varied
    m.add(s + 0.1 + i * 0.045, tick(1800 + (i % 7) * 140, 0.035, 0.006, 0.35), -27 - (i % 3), -0.8 + 1.6 * ((i * 7) % 40) / 40, 0.12)
m.add_stereo(s, whoosh(2.2, 120, 1400, q=0.6, shape='rise'), -24, verb=0.1)
wt = word_times(B['chaos']['vo'][0])
for idx, gain in ((0, -14), (2, -14), (4, -11)):
    m.add(wt[idx], kick(), gain, 0, 0.05)
    m.add(wt[idx], stamp(0.1, 170), gain - 6, 0, 0.15)
for kk in range(3):
    m.add(wt[6] + kk * 0.44, tick(1500, 0.03, 0.006, 0.2), -24, 0, 0.2)
pixel_sweep(B['meet']['start'])

# ---------------- 2. meet ----------------
s = B['meet']['start']
m.add_stereo(s + 0.05, whoosh(0.9, 300, 3000, q=2.2, shape='swell', curve=0.8), -21, verb=0.3)
for i in range(5):
    m.add(s + 0.35 + i * 0.09, stamp(0.08, 150 + 20 * i), -18, -0.3 + 0.15 * i, 0.15)
for i in range(7):
    m.add(s + 1.2 + i * 0.06, tick(2600 + i * 90, 0.03, 0.005, 0.25), -23, -0.5 + i * 0.16, 0.2)
shimmer(s + 1.75, 0.9, -25)
impact(s + 1.2, -14)
m.add_stereo(s + B['meet']['dur'] - 0.3, whoosh(0.3, 5000, 1200, q=1.2, shape='fall'), -27, verb=0.2)

# ---------------- 3. voice ----------------
b = B['voice']
s = b['start']
dev = b['vo'][1]
m.add_stereo(s, whoosh(0.4, 600, 4000, q=1.2), -25, verb=0.2)
m.add(dev['at'] - 0.15, chime([N(81), N(88)], 0.08, 0.5, 0.1), -21, 0.2, 0.35)
m.add(dev['at'] + dev['dur'] + 0.05, chime([N(88), N(84)], 0.07, 0.45, 0.09), -22, -0.2, 0.3)
m.add_stereo(dev['at'] + dev['dur'] + 0.1, data_chatter(0.7, 30, seed=9), -31, verb=0.1)

# ---------------- 4. reads ----------------
s = B['reads']['start']
r = np.random.default_rng(4)
for i in range(30):
    m.add(s + 0.05 + r.uniform(0, 0.6), blip(r.uniform(1800, 3600), 0.06, 0.012, 0.1), -32, r.uniform(-0.8, 0.8), 0.3)
m.add_stereo(s + 0.3, whoosh(1.3, 500, 7000, q=2.2, shape='swell'), -22, verb=0.2)
for i in range(18):
    m.add(s + 0.2 + i * 0.09, tick(3400, 0.02, 0.002, 0.1), -32, 0.6, 0.1)
for i in range(4):
    m.add(s + 1.6 + i * 0.22, blip(1568 + 196 * i, 0.12, 0.03, 0.2), -20, -0.4 + 0.27 * i, 0.3)
    m.add(s + 1.6 + i * 0.22, tick(4800, 0.03, 0.003, 0.2), -26, -0.4 + 0.27 * i, 0.2)

# ---------------- 5. writes ----------------
s = B['writes']['start']
m.add_stereo(s, whoosh(0.5, 400, 3500, q=1.0), -24, verb=0.2)
for t in (s + 0.35, s + 0.75, s + 1.7):
    m.add_stereo(t, data_chatter(0.35, 60, seed=int(t * 10)), -28, verb=0.05)
    m.add(t + 0.35, blip(1760, 0.1, 0.025), -22, 0.3, 0.25)
m.add(s + 1.1, bass_note(N(41), 0.3, 900), -21, 0, 0.1)
m.add(s + 1.1, blip(330, 0.2, 0.06, 0.5), -25, 0, 0.15)
m.add_stereo(s + 1.4, whoosh(0.25, 6000, 2000, q=1.6, shape='fall'), -26, verb=0.1)
for i in range(5):
    m.add(s + 2.0 + i * 0.16, tick(2400 + 200 * i, 0.03, 0.005, 0.2), -25, 0.5, 0.2)
m.add(s + 2.9, chime([N(84), N(88), N(91)], 0.06, 0.8, 0.16), -16, 0.3, 0.4)
m.add(s + 2.9, sub_hit(90, 45, 0.8, 0.2), -18, 0, 0.05)

# ---------------- 6. platform ----------------
b = B['platform']
s = b['start']
m.add_stereo(s, whoosh(0.6, 250, 2500, q=0.9), -22, verb=0.25)
t1 = s + max(1.4, b['dur'] * 0.34)
t2 = s + max(2.8, b['dur'] * 0.62)
for t in (t1, t2):  # layout morph: mechanical slide + settle clicks
    m.add_stereo(t, whoosh(0.7, 180, 1800, q=0.7, shape='swell'), -20, verb=0.2)
    for i in range(4):
        m.add(t + 0.55 + i * 0.04, stamp(0.07, 190 + 15 * i), -24, -0.45 + 0.3 * i, 0.12)
for i in range(28):
    m.add(t2 + 0.4 + (i % 7) * 0.05 + (i // 7) * 0.02, tick(2000 + (i % 7) * 160, 0.025, 0.003, 0.12), -31, -0.6 + 0.04 * i, 0.15)
shimmer(t2 + 0.9, 1.2, -29)
pixel_sweep(B['end']['start'])

# ---------------- 7. end ----------------
s = B['end']['start']
m.add_stereo(s, whoosh(1.15, 200, 9000, q=1.4, shape='rise', curve=1.3), -18, verb=0.25)
sp = data_chatter(1.1, 110, seed=71, lo=3500, hi=8000)
sp *= np.linspace(0.3, 1.0, len(sp))
m.add_stereo(s + 0.05, sp, -27, width=0.9, verb=0.35)
HIT = s + 1.2
m.add(HIT, sub_hit(70, 34, 3.2, 0.9), -10, 0, 0.1)
m.add(HIT, kick(), -12, 0, 0.05)
m.add_stereo(HIT, chord([N(n) for n in CH['Dadd9']], 3.2, attack=0.015, decay=1.8), -12, verb=0.5)
m.add_stereo(HIT, pad([N(n) for n in CH['Dadd9']], 3.0, attack=0.3, release=1.4, cutoff=1500), -19, verb=0.35)
for i in range(7):
    m.add(s + 0.95 + i * 0.06, tick(2400 + 80 * i, 0.03, 0.005, 0.25), -24, -0.5 + 0.16 * i, 0.25)
shimmer(s + 1.75, 1.0, -24)

m.render('../film/assets/audio/mix_raw.wav', rt=2.0)
print('ok', round(LEN, 2))
