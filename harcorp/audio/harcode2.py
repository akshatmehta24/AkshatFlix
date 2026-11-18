"""HARCODE demo v2 (reference style) — score, voice and SFX, all frame-locked to Harcode2.tsx."""
import sys
import numpy as np
from sfx import *
from music import *
from harcode import load_vo, envelope

OUT = sys.argv[1]
F = lambda fr: fr / 30.0
LEN = 15.0
S2, VO1, S3, S4, VO2, S5, S6 = 44, 64, 152, 218, 280, 336, 392
HIT = S6 + 18  # ascii -> solid logo

m = Mix(LEN)
v1 = load_vo('vo/l1.wav')
v2 = load_vo('vo/l2.wav')
duck = envelope(m.n, [(F(VO1), v1), (F(VO2), v2)])

# ---------------- score ----------------
score(
    m,
    LEN,
    [
        (0.0, 1.5, 'Dm9', {'pad', 'soft'}),
        (1.5, 3.5, 'Dm9', {'pad', 'soft', 'hat8', 'bass'}),
        (3.5, 5.0, 'Dm9', {'pad', 'hat8', 'bass', 'kick2'}),
        (5.0, 7.0, 'Bbmaj7', {'pad', 'bass', 'hat', 'kick2', 'arp'}),
        (7.0, 9.0, 'Gm9', {'pad', 'bass', 'hat', 'kick', 'arp', 'bright'}),
        (9.0, 11.0, 'Gm9', {'pad', 'bass', 'hat', 'kick', 'arp', 'bright'}),
        (11.0, 13.0, 'Bbmaj7', {'pad', 'bass', 'hat', 'kick', 'arp', 'bright'}),
    ],
    vo_env=duck,
)
m.add_stereo(F(HIT) - 0.85, whoosh(0.85, 400, 7500, q=1.2, shape='rise', curve=1.4), -18, verb=0.2)
m.add(F(HIT), sub_hit(70, 36, 3.0, 0.8), -12, 0, 0.1)
m.add(F(HIT), kick(), -11, 0, 0.05)
m.add_stereo(F(HIT), chord([N(n) for n in CH['Dadd9']], 3.6, attack=0.02, decay=1.8), -13, verb=0.45)
m.add_stereo(F(HIT), pad([N(n) for n in CH['Dadd9']], 1.6, attack=0.4, release=1.0, cutoff=1300), -21, verb=0.3)

# ---------------- voice ----------------
m.add(F(VO1), v1, -3.5, 0, 0.06)
m.add(F(VO2), v2, -3.5, 0, 0.06)

# ---------------- S1: title ----------------
for k, fr in enumerate((2, 3, 4, 5)):
    m.add(F(fr), tick(3800 + 120 * k, 0.03, 0.003, 0.1), -28, [-0.5, 0.5, -0.5, 0.5][k], 0.2)
for i in range(7):  # typing HARCODE
    m.add(F(6 + i * 1.43), key_click(i), -22, 0, 0.08)
m.add_stereo(F(32), whoosh(0.35, 3000, 900, q=1.0, shape='fall'), -27, verb=0.2)
m.add(F(40), stamp(0.08, 190), -22, 0, 0.15)

# ---------------- S2: voice ----------------
m.add_stereo(F(S2), whoosh(0.6, 300, 3000, q=1.0), -24, verb=0.25)
m.add_stereo(F(S2 + 8), data_chatter(0.3, 35, seed=21), -31, verb=0.1)
m.add(F(60), chime([N(81), N(88)], 0.08, 0.5, 0.1), -22, 0.15, 0.35)
for k in range(5):  # curves fan out to files
    m.add_stereo(F(VO1 + 50 + 6 * k), whoosh(0.3, 1200 + 300 * k, 4000 + 400 * k, q=1.8), -31, verb=0.2)
    m.add(F(VO1 + 60 + 6 * k), tick(2900 + 180 * k, 0.03, 0.004, 0.15), -27, 0.5, 0.2)

# ---------------- S3: boxes ----------------
m.add(F(S3), stamp(0.1, 140), -18, 0, 0.12)
m.add_stereo(F(S3), whoosh(0.4, 2000, 6000, q=2.0, shape='fall'), -29, verb=0.15)
for i in range(16):  # counter ticking up
    m.add(F(S3 + 6) + i * 0.045, tick(3300, 0.02, 0.002, 0.1), -33, -0.2, 0.1)
m.add_stereo(F(S3 + 34), whoosh(0.5, 300, 1800, q=0.9), -24, verb=0.2)  # camera pan
for i in range(10):
    m.add(F(S3 + 44) + i * 0.028, key_click(30 + i), -27, 0.3, 0.08)
m.add_stereo(F(S3 + 40), data_chatter(0.6, 30, seed=33), -32, verb=0.1)

# ---------------- S4: editor ----------------
m.add_stereo(F(S4), whoosh(0.55, 200, 2500, q=0.8), -23, verb=0.25)
for fr in (S4 + 10, S4 + 22, S4 + 48):  # lines typed then highlighted green
    m.add_stereo(F(fr), data_chatter(0.4, 40, seed=fr), -30, verb=0.08)
    m.add(F(fr + 10), blip(1568, 0.12, 0.03), -24, 0.3, 0.25)
m.add(F(S4 + 34), bass_note(N(41), 0.25, 900), -22, 0, 0.1)  # red line: soft low "error" thud
m.add(F(S4 + 34), blip(392, 0.18, 0.06, 0.4), -26, 0, 0.15)
m.add_stereo(F(S4 + 62), whoosh(0.25, 5000, 1500, q=1.4, shape='fall'), -29, verb=0.1)  # red line removed
m.add(F(VO2 - 4), chime([N(81), N(88)], 0.08, 0.5, 0.1), -24, 0.15, 0.35)

# ---------------- S5: tests ----------------
m.add(F(S5), stamp(0.09, 160), -21, 0, 0.12)
for i in range(7):
    m.add(F(S5 + 6 + i * 2), tick(3000 + 90 * i, 0.03, 0.004, 0.15), -27, -0.5 + 0.15 * i, 0.15)
for i in range(14):  # orange blocks sweep
    m.add(F(S5 + 34) + i * 0.038, tick(2200 + i * 80, 0.03, 0.005, 0.25), -24, -0.8 + 0.12 * i, 0.15)
m.add(F(S5 + 52), chime([N(84), N(88), N(91)], 0.06, 0.7, 0.14), -18, 0, 0.4)

# ---------------- S6: logo ----------------
sp = data_chatter(0.6, 90, seed=61, lo=3000, hi=7000)
m.add_stereo(F(S6), sp, -26, width=0.9, verb=0.3)
for i in range(7):
    m.add(F(S6 + 30 + i * 1.25), key_click(70 + i), -24, 0, 0.1)
m.add_stereo(F(S6 + 38), data_chatter(0.45, 40, seed=63), -31, verb=0.15)
m.add(F(S6 + 44), tick(2600, 0.04, 0.006, 0.2), -26, 0, 0.3)

m.render(f'{OUT}/harcode2.wav', rt=1.8)
print('ok')
