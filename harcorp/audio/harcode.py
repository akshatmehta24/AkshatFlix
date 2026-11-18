import sys
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from sfx import *
from music import *

F = lambda fr: fr / 30.0
LEN = 15.0
VO1, VO2 = F(64), F(280)


def load_vo(p):
    a, sr = sf.read(p)
    if a.ndim > 1:
        a = a.mean(1)
    if sr != SR:
        a = resample_poly(a, SR, sr)
    a = hp(a, 90)
    return a / (np.max(np.abs(a)) + 1e-9)


def envelope(n, segs):
    e = np.zeros(n)
    for s, x in segs:
        i = int(s * SR)
        env = np.abs(x)
        k = int(0.08 * SR)
        env = np.convolve(env, np.ones(k) / k, 'same')
        env = np.clip(env / (env.max() + 1e-9) * 2.0, 0, 1)
        e[i:i + len(env)] = np.maximum(e[i:i + len(env)], env[: n - i])
    # smooth release
    k = int(0.25 * SR)
    return np.clip(np.convolve(e, np.ones(k) / k, 'same') * 1.4, 0, 1)



if __name__ == '__main__':
    OUT = sys.argv[1]
    m = Mix(LEN)
    v1 = load_vo('vo/l1.wav')
    v2 = load_vo('vo/l2.wav')
    duck = envelope(m.n, [(VO1, v1), (VO2, v2)])

    # ---- music ----
    score(
        m,
        LEN,
        [
            (0.0, 2.0, 'Dm9', {'pad', 'soft', 'hat8'}),
            (2.0, 4.0, 'Dm9', {'pad', 'bass', 'hat8', 'kick2'}),
            (4.0, 5.5, 'Bbmaj7', {'pad', 'bass', 'hat8', 'kick2'}),
            (5.5, 7.5, 'Bbmaj7', {'pad', 'bass', 'hat', 'kick2', 'arp'}),
            (7.5, 9.5, 'Gm9', {'pad', 'bass', 'hat', 'kick', 'arp', 'bright'}),
            (9.5, 11.5, 'Gm9', {'pad', 'bass', 'hat', 'kick', 'arp', 'bright'}),
        ],
        vo_env=duck,
    )
    # breakdown riser into the end card, then the brand resolve
    m.add_stereo(F(336), whoosh(0.75, 400, 7000, q=1.2, shape='rise', curve=1.4), -17, verb=0.2)
    m.add(F(360), sub_hit(70, 36, 3.0, 0.8), -12, 0, 0.1)
    m.add(F(360), kick(), -10, 0, 0.05)
    m.add_stereo(F(360), chord([N(n) for n in CH['Dadd9']], 3.6, attack=0.02, decay=1.8), -13, verb=0.45)
    m.add_stereo(F(360), pad([N(n) for n in CH['Dadd9']], 3.0, attack=0.6, release=1.2, cutoff=1300), -20, verb=0.3)

    # ---- voice ----
    m.add(VO1, v1, -3.5, 0, 0.06)
    m.add(VO2, v2, -3.5, 0, 0.06)

    # ---- sfx ----
    m.add_stereo(F(2), whoosh(0.45, 600, 4000, q=1.0), -27, verb=0.2)
    m.add(F(4), tick(3600, 0.03), -26, -0.4, 0.2)
    m.add(F(8), tick(3000, 0.03), -28, 0.5, 0.2)
    for i in range(7):  # typing "harcode"
        m.add(F(10) + i * 0.058 + (0.01 if i % 2 else 0), key_click(i), -21, -0.1 + 0.03 * i, 0.08)
    m.add(F(25), enter_key(), -17, 0, 0.1)
    m.add_stereo(F(28), data_chatter(0.35, 40, seed=2), -30, verb=0.1)
    m.add_stereo(F(36), data_chatter(0.2, 30, seed=3), -32, verb=0.1)
    m.add(F(50), tick(3400, 0.03), -27, 0, 0.2)
    m.add(F(62), chime([N(81), N(88)], 0.08, 0.5, 0.1), -21, 0.15, 0.35)  # listening on
    # thinking
    m.add(F(166), chime([N(88), N(84)], 0.07, 0.45, 0.09), -23, -0.15, 0.3)
    m.add_stereo(F(168), data_chatter(1.9, 22, seed=5, lo=2800, hi=5600), -31, verb=0.15)
    for i in range(15):
        m.add(F(160 + 8) + i * 0.05, tick(4400, 0.02, 0.002, 0.1), -35, 0.4 + 0.03 * i, 0.15)
    m.add(F(176), blip(1760, 0.1, 0.02), -27, 0.5, 0.2)
    m.add(F(194), blip(2093, 0.1, 0.02), -27, 0.5, 0.2)
    # code being written: one soft tick per diff line + chatter under the stream
    for fr in (228, 234, 246, 260, 267):
        m.add(F(fr), stamp(0.07, 210), -22, -0.2, 0.15)
    m.add_stereo(F(234), data_chatter(1.5, 26, seed=8, lo=2500, hi=5000), -31, verb=0.15)
    m.add(F(278), chime([N(81), N(88)], 0.08, 0.5, 0.1), -22, 0.15, 0.35)  # listening again
    m.add(F(324), chime([N(88), N(84)], 0.07, 0.45, 0.09), -25, -0.15, 0.3)
    for i in range(12):  # tests running
        m.add(F(302) + i * 0.07, tick(3000 + 60 * i, 0.02, 0.002, 0.15), -30, 0.35, 0.15)
    m.add(F(332), chime([N(84), N(88), N(91)], 0.06, 0.7, 0.14), -18, 0, 0.4)  # success
    # build-off
    m.add_stereo(F(342), whoosh(0.5, 5000, 500, q=0.9, shape='fall'), -24, verb=0.25)
    # end card
    m.add_stereo(F(362), data_chatter(0.5, 50, seed=12, lo=3000, hi=6000), -29, verb=0.2)
    for i in range(7):
        m.add(F(384 + i * 1.5), tick(2600, 0.03, 0.004, 0.2), -27, -0.4 + 0.13 * i, 0.2)

    m.render(f'{OUT}/harcode.wav', rt=1.8)
    print('ok')
