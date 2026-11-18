"""Component reel v2 (reference style) — frame-locked to Reel2.tsx."""
import sys
import numpy as np
from sfx import *
from music import *

OUT = sys.argv[1]
F = lambda fr: fr / 30.0
LEN = 975 / 30.0
S = lambda i: F(30 + 150 * i)
m = Mix(LEN)

secs = []
cyc = ['Dm9', 'Bbmaj7', 'Gm9', 'Bbmaj7']
t, k = 0.0, 0
while t < 30.0:
    secs.append((t, min(t + 4.0, 30.0), cyc[k % 4], {'pad', 'soft', 'hat8'} | ({'bass', 'kick2'} if 1 <= k < 7 else set())))
    t += 4.0
    k += 1
score(m, LEN, secs, base_gain=-3)
m.add(S(6) + F(4), sub_hit(70, 36, 2.4, 0.7), -13, 0, 0.1)
m.add_stereo(S(6) + F(4), chord([N(n) for n in CH['Dadd9']], 2.6, attack=0.02, decay=1.3), -14, verb=0.45)
for i in range(12):
    m.add(S(6) + F(12) + i * 0.03, key_click(200 + i), -30, 0, 0.08)

# intro typing
for i in range(14):
    m.add(F(2) + i * 0.017 * 1.0 + i * 0.0, key_click(i), -30, 0, 0.08)
m.add_stereo(F(4), whoosh(0.4, 600, 4000, q=1.2), -28, verb=0.2)
m.add_stereo(F(22), whoosh(0.3, 4000, 600, q=1.0, shape='fall'), -29, verb=0.2)


def label(t0):
    for i in range(10):
        m.add(t0 + i * 0.024, key_click(int(t0 * 100) + i), -32, -0.6, 0.06)


def build_on(t0):
    m.add_stereo(t0, whoosh(0.5, 500, 4500, q=1.0), -25, verb=0.2)
    m.add(t0 + F(4), tick(3400, 0.03), -27, 0, 0.2)


def build_off(t0):
    m.add_stereo(t0, whoosh(0.45, 4500, 500, q=0.9, shape='fall'), -26, verb=0.2)
    m.add(t0 + F(14), tick(2400, 0.03), -29, 0, 0.2)


for i in range(6):
    label(S(i) + F(2))
    build_on(S(i) + F(4))
    build_off(S(i) + F(118))

# C-01: a soft breath of air under the voice line
air = lp(hp(rng.standard_normal(int(2.6 * SR)), 300), 3000) * np.sin(np.linspace(0, np.pi, int(2.6 * SR))) ** 0.5
m.add_stereo(S(0) + F(30), air, -44, verb=0)
m.add(S(0) + F(18), chime([N(81), N(88)], 0.08, 0.5, 0.1), -24, 0.1, 0.35)
# C-02
m.add(S(1) + F(52), chime([N(81), N(88)], 0.08, 0.5, 0.1), -21, 0.1, 0.35)
m.add(S(1) + F(88), chime([N(88), N(84)], 0.07, 0.45, 0.09), -22, -0.1, 0.3)
m.add_stereo(S(1) + F(90), data_chatter(0.9, 18, seed=31), -32, verb=0.15)
# C-03
for fr, dur in ((10, 0.3), (24, 0.5), (42, 0.4), (56, 0.3)):
    m.add_stereo(S(2) + F(fr), data_chatter(dur, 45, seed=fr), -29, verb=0.08)
for fr in (66, 74, 84, 90):
    m.add(S(2) + F(fr + 8), blip(1568, 0.12, 0.03), -25, 0.3, 0.25)
m.add(S(2) + F(96), chime([N(84), N(88), N(91)], 0.06, 0.6, 0.12), -21, 0, 0.35)
# C-04
for j in range(7):
    m.add_stereo(S(3) + F(14 + 3 * j), whoosh(0.28, 1200 + 250 * j, 4200 + 300 * j, q=1.8), -32, verb=0.2)
    m.add(S(3) + F(26 + 3 * j), tick(2900 + 150 * j, 0.03, 0.004, 0.15), -29, 0.5, 0.2)
for k2, fr in enumerate((62, 74, 84, 92)):
    m.add(S(3) + F(fr), blip(1760 + 120 * k2, 0.12, 0.025), -24, 0.4, 0.3)
# C-05
for st, du in ((10, 14), (20, 22), (34, 26), (52, 30), (74, 14)):
    m.add(S(4) + F(st + du), blip(1568, 0.1, 0.02), -24, 0.2, 0.25)
    m.add_stereo(S(4) + F(st), data_chatter(du / 30, 28, seed=st), -33, verb=0.1)
for i in range(14):
    m.add(S(4) + F(92) + i * 0.033, tick(2200 + i * 80, 0.03, 0.005, 0.25), -24, -0.8 + 0.12 * i, 0.15)
# C-06
m.add_stereo(S(5) + F(6), data_chatter(0.8, 20, seed=70), -33, verb=0.1)
for j in range(3):
    m.add(S(5) + F(46) + j * 0.4, alarm(0.3), -19, 0, 0.2)
m.add(S(5) + F(46), glitch(0.06), -26, 0.2, 0.1)
m.add(S(5) + F(82), chime([N(84), N(88), N(91)], 0.06, 0.7, 0.14), -19, 0, 0.4)

m.render(f'{OUT}/reel2.wav', rt=1.8)
print('ok')
