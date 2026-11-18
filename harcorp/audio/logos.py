import sys
import numpy as np
from sfx import *

F = lambda fr: fr / 30.0
OUT = sys.argv[1]

# brand resolve chord (D: D2 A2 D3 F#3? -> keep open & calm: D, A, E (add9))
BRAND = [73.42, 110.0, 146.83, 220.0, 329.63]


def logo_a():
    m = Mix(5.0)
    # low bed: dark drone rising gently, cut by the resolve
    m.add_stereo(0, pad([36.71, 55.0, 73.42], 3.9, attack=1.2, release=0.35, cutoff=500), -27, verb=0.1)
    # crosshair lines draw: airy shimmer
    m.add_stereo(F(0), whoosh(0.6, 3000, 9000, q=1.5, shape='swell'), -30, verb=0.3)
    m.add(F(0), tick(4200, 0.03), -24, 0, 0.3)
    # reticle fly-in
    m.add_stereo(F(8), whoosh(0.55, 500, 3500, q=1.0, shape='swell'), -22, verb=0.2)
    # tick ring populates
    for i in range(18):
        m.add(F(12) + i * 0.033, tick(3800 + 40 * i, 0.02, 0.002, 0.1), -34, -0.6 + i * 0.07, 0.2)
    # radar sweep draws the ring
    m.add_stereo(F(24), whoosh(0.78, 300, 2600, q=2.2, shape='swell', curve=0.8), -22, verb=0.25)
    m.add(F(24), glide(420, 880, 0.75), -30, 0.2, 0.3)
    # H parts placed
    for fr, pan in ((42, -0.25), (48, 0.0), (54, 0.25)):
        m.add(F(fr), stamp(), -12, pan, 0.18)
    # dots
    m.add(F(61), blip(1760, 0.12, 0.025), -20, 0.2, 0.3)
    m.add(F(65), blip(1320, 0.12, 0.025), -20, -0.2, 0.3)
    # LOCK
    m.add(F(72), blip(1320, 0.1, 0.03), -14, 0, 0.3)
    m.add(F(72) + 0.07, blip(1980, 0.16, 0.05), -14, 0, 0.35)
    m.add(F(72), sub_hit(80, 40, 1.0, 0.25), -12, 0, 0.05)
    m.add(F(73), glitch(0.07), -28, 0.3, 0.1)
    # slide to lockup position
    m.add_stereo(F(80), whoosh(0.7, 200, 1400, q=0.8, shape='swell'), -24, verb=0.2)
    # wordmark prints
    for i in range(7):
        m.add(F(94 + i * 2.5), tick(2700 - i * 60, 0.03, 0.005, 0.25), -18, -0.5 + i * 0.16, 0.15)
    for i in range(10):
        m.add(F(110 + i), tick(5200, 0.02, 0.002, 0.1), -30, -0.6 + i * 0.13, 0.2)
    # resolve
    m.add(F(112), sub_hit(70, 36, 2.2, 0.7), -12, 0, 0.1)
    m.add_stereo(F(112), chord(BRAND, 2.6, attack=0.03, decay=1.3), -15, verb=0.35)
    m.add(F(112), ping(2200, 1.4), -32, 0.0, 0.5)
    return m.render(f'{OUT}/logoA.wav', rt=1.8)


def logo_b():
    m = Mix(5.0)
    # the point
    m.add(F(4), ping(1480, 1.4), -18, 0, 0.6)
    m.add_stereo(F(4), glide(2900, 3100, 0.45), -40, verb=0.4)
    m.add_stereo(0.05, whoosh(0.5, 60, 160, q=0.5, shape='rise'), -26, verb=0.0)
    # burst: soft air impact + sub + granular sparkle
    m.add(F(16), sub_hit(110, 42, 1.3, 0.35), -12, 0, 0.05)
    m.add_stereo(F(16), whoosh(0.9, 6000, 600, q=0.7, shape='fall'), -18, verb=0.3)
    sparkle = data_chatter(1.0, density=90, seed=4, lo=3000, hi=7000)
    sparkle *= np.exp(-np.arange(len(sparkle)) / SR / 0.45)
    m.add_stereo(F(17), sparkle, -24, width=0.9, verb=0.3)
    # low bed of matter
    m.add_stereo(F(16), pad([41.2, 61.74, 82.41], 2.6, attack=0.4, release=0.5, cutoff=420), -27, verb=0.1)
    # condense: suction riser into the logo
    m.add_stereo(F(44), whoosh(1.06, 300, 5200, q=1.4, shape='rise', curve=1.3), -19, verb=0.15)
    m.add(F(44), glide(110, 440, 1.06), -30, 0, 0.1)
    # lock scan: printing ticks, rising pitch
    for i in range(14):
        m.add(F(76) + i * 0.038, tick(2200 + i * 110, 0.025, 0.003, 0.2), -22, -0.7 + i * 0.1, 0.2)
    # resolve
    m.add(F(92), sub_hit(70, 36, 2.2, 0.7), -11, 0, 0.1)
    m.add_stereo(F(92), chord(BRAND, 2.9, attack=0.02, decay=1.4), -15, verb=0.4)
    m.add_stereo(F(92), whoosh(0.5, 8000, 2000, q=0.7, shape='fall'), -28, verb=0.4)
    return m.render(f'{OUT}/logoB.wav', rt=2.0)


if __name__ == '__main__':
    print(logo_a(), logo_b())
