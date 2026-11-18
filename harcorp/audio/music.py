"""Original score + extra kit pieces for HARCODE demo and component reel."""
import numpy as np
from sfx import *

BEAT = 0.5  # 120 bpm -> 15 frames per beat
N = lambda midi: 440.0 * 2 ** ((midi - 69) / 12)

# chords (midi): Dm9, Bbmaj7, Gm9, D5add9 (brand)
CH = {
    'Dm9': [50, 53, 57, 60, 64],
    'Bbmaj7': [46, 53, 57, 62, 65],
    'Gm9': [43, 50, 53, 57, 58],
    'Dadd9': [50, 57, 62, 64, 69],
}
ROOT = {'Dm9': 38, 'Bbmaj7': 34, 'Gm9': 31, 'Dadd9': 38}


def key_click(seed=0):
    r = np.random.default_rng(seed)
    n = int(0.05 * SR)
    x = bp(r.standard_normal(n), 1800, 7000) * env_exp(n, 0.006, 0.0003)
    t = np.arange(n) / SR
    x += 0.5 * np.sin(2 * np.pi * r.uniform(280, 360) * t) * env_exp(n, 0.008)
    return norm(x, 1)


def enter_key():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    x = 0.6 * bp(rng.standard_normal(n), 900, 5000) * env_exp(n, 0.01, 0.0003)
    x += np.sin(2 * np.pi * 150 * t) * env_exp(n, 0.03)
    return norm(x, 1)


def chime(notes, gap=0.07, dur=0.5, decay=0.12):
    n = int((gap * len(notes) + dur) * SR)
    out = np.zeros(n)
    for i, f in enumerate(notes):
        b = blip(f, dur, decay, 0.15)
        s = int(i * gap * SR)
        out[s:s + len(b)] += b
    return norm(out, 1)


def alarm(dur=0.32):
    """alert two-tone, softened square (not harsh)"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = np.where(t < dur / 2, 988, 740)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.tanh(3 * np.sin(ph))
    x = lp(x, 3500, 2)
    e = np.clip(t / 0.004, 0, 1) * np.clip((dur - t) / 0.02, 0, 1)
    return norm(x * e, 1)


def pluck(freq, dur=0.25, cutoff=2500):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ph = (freq * t) % 1.0
    x = (2 * ph - 1) * 0.6 + np.sin(2 * np.pi * freq * t)
    x = sweep_filter(x * env_exp(n, 0.09, 0.002), cutoff, 300, kind='lp', block=128)
    return norm(x, 1)


def score(m: Mix, length, sections, vo_env=None, base_gain=0.0):
    """sections: list of (t0, t1, chord, layers set)"""
    music = Mix(length)
    for (t0, t1, ch, layers) in sections:
        d = t1 - t0
        if 'pad' in layers:
            music.add_stereo(t0, pad([N(n) for n in CH[ch]], d + 0.6, attack=0.5 if 'soft' in layers else 0.15, release=0.6, cutoff=1500 if 'bright' in layers else 900), -17, verb=0.25)
        beats = int(round(d / BEAT))
        for b in range(beats):
            tb = t0 + b * BEAT
            if 'kick' in layers:
                music.add(tb, kick(), -14, 0, 0.02)
            if 'kick2' in layers and b % 2 == 0:
                music.add(tb, kick(), -16, 0, 0.02)
            if 'bass' in layers:
                for e in (0, 0.25):
                    music.add(tb + e, bass_note(N(ROOT[ch]), 0.24, 380 if e == 0 else 300), -18 if e == 0 else -22, 0, 0.0)
            if 'hat' in layers:
                for k in range(4):
                    music.add(tb + k * BEAT / 4, hat(0.05, 0.01 if k % 2 else 0.02), -31 if k % 2 else -27, 0.3 if k % 2 else -0.3, 0.1)
            if 'hat8' in layers:
                music.add(tb + BEAT / 2, hat(0.06, 0.015), -28, 0.25, 0.15)
            if 'arp' in layers:
                notes = CH[ch][1:] + [CH[ch][2] + 12]
                for k in range(4):
                    nn = notes[(b * 4 + k) % len(notes)] + 12
                    music.add(tb + k * BEAT / 4, pluck(N(nn), 0.22, 3200 if 'bright' in layers else 1800), -25, -0.4 + 0.8 * ((b * 4 + k) % 3) / 2, 0.3)
    L, R = music.L, music.R
    vL, vR = music.vL, music.vR
    if vo_env is not None:
        g = 1 - 0.45 * vo_env  # duck ~ -5 dB under the voice
        L, R, vL, vR = L * g, R * g, vL * g, vR * g
    gg = 10 ** (base_gain / 20)
    m.L += L * gg
    m.R += R * gg
    m.vL += vL * gg
    m.vR += vR * gg
