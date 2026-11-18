import sys
import numpy as np
from sfx import *
from music import *

OUT = sys.argv[1]
F = lambda fr: fr / 30.0
LEN = 975 / 30.0
S = lambda i: F(30 + 150 * i)
m = Mix(LEN)

# ambient bed: slow pad cycle with a soft pulse (keeps it calm under the UI sounds)
secs = []
cyc = ['Dm9', 'Bbmaj7', 'Gm9', 'Bbmaj7']
t = 0.0
k = 0
while t < 30.0:
    secs.append((t, min(t + 4.0, 30.0), cyc[k % 4], {'pad', 'soft', 'hat8'} | ({'bass', 'kick2'} if 2 <= k < 7 else set())))
    t += 4.0
    k += 1
score(m, LEN, secs, base_gain=-3)
# outro resolve
m.add(S(6) + F(2), sub_hit(70, 36, 2.4, 0.7), -13, 0, 0.1)
m.add_stereo(S(6) + F(2), chord([N(n) for n in CH['Dadd9']], 2.6, attack=0.02, decay=1.3), -14, verb=0.45)

# intro title
m.add_stereo(F(2), data_chatter(0.5, 45, seed=1), -27, verb=0.15)
m.add_stereo(F(26), whoosh(0.4, 5000, 600, q=0.9, shape='fall'), -28, verb=0.2)


def build_on(t0):
    m.add_stereo(t0, whoosh(0.5, 500, 4500, q=1.0), -25, verb=0.2)
    m.add(t0 + F(2), tick(3600, 0.03), -24, -0.3, 0.2)
    m.add(t0 + F(6), tick(3100, 0.03), -26, 0.3, 0.2)
    m.add_stereo(t0 + F(4), data_chatter(0.45, 40, seed=int(t0 * 10)), -30, verb=0.15)


def build_off(t0):
    m.add_stereo(t0, whoosh(0.45, 4500, 500, q=0.9, shape='fall'), -26, verb=0.2)
    m.add(t0 + F(10), tick(2400, 0.03), -28, 0, 0.2)


for i in range(6):
    build_on(S(i) + F(4))
    build_off(S(i) + F(120))

# C-01 waveform: faint mic-noise floor while it listens
mic = lp(hp(rng.standard_normal(int(2.6 * SR)), 300), 3000)
mic *= np.sin(np.linspace(0, np.pi, len(mic))) ** 0.5
m.add_stereo(S(0) + F(30), mic, -46, verb=0)
# C-02 states
m.add(S(1) + F(50), chime([N(81), N(88)], 0.08, 0.5, 0.1), -21, 0.15, 0.35)
m.add(S(1) + F(86), chime([N(88), N(84)], 0.07, 0.45, 0.09), -22, -0.15, 0.3)
m.add_stereo(S(1) + F(88), data_chatter(1.0, 20, seed=31), -31, verb=0.15)
# C-03 words land, then code lines
for j in range(11):
    m.add(S(2) + F(22 + j * 3.2), tick(4200, 0.02, 0.002, 0.1), -32, -0.6, 0.15)
for fr in (62, 70, 79, 84):
    m.add(S(2) + F(fr), stamp(0.07, 210), -23, 0.3, 0.15)
m.add(S(2) + F(92), chime([N(84), N(88), N(91)], 0.06, 0.6, 0.12), -21, 0, 0.35)
# C-04 nodes appear, focus locks
for j in range(15):
    m.add(S(3) + F(8 + j * 1.6), tick(3200 + 50 * j, 0.02, 0.002, 0.1), -32, -0.6 + 0.08 * j, 0.15)
m.add(S(3) + F(62), blip(1760, 0.12, 0.025), -23, 0.3, 0.3)
m.add(S(3) + F(80), blip(2093, 0.12, 0.025), -23, 0.4, 0.3)
# C-05 tasks complete
for st, du in ((30, 14), (40, 20), (54, 24), (74, 26), (96, 12)):
    m.add(S(4) + F(st + du), blip(1568, 0.1, 0.02), -24, 0.2, 0.25)
    m.add_stereo(S(4) + F(st), data_chatter(du / 30, 30, seed=st), -33, verb=0.1)
# C-06 alert -> fix -> resolved
for j in range(3):
    m.add(S(5) + F(48) + j * 0.4, alarm(0.3), -19, 0, 0.2)
m.add(S(5) + F(48), glitch(0.06), -26, 0.2, 0.1)
m.add(S(5) + F(80), chime([N(88), N(84)], 0.07, 0.45, 0.09), -23, 0, 0.3)
m.add_stereo(S(5) + F(80), data_chatter(0.7, 30, seed=77), -31, verb=0.1)
m.add(S(5) + F(102), chime([N(84), N(88), N(91)], 0.06, 0.7, 0.14), -19, 0, 0.4)

m.render(f'{OUT}/reel.wav', rt=1.8)
print('ok')
