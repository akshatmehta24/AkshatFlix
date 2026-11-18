"""Harcorp sound kit — every sound synthesised from scratch (royalty-free by construction).
Clean, precise UI sounds: no cartoon boings, no harsh noise."""
import numpy as np
from scipy.signal import butter, lfilter, sosfilt, fftconvolve
import soundfile as sf

SR = 48000
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env_exp(n, decay, attack=0.002):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def hp(x, f, order=2):
    sos = butter(order, f, 'hp', fs=SR, output='sos')
    return sosfilt(sos, x)


def lp(x, f, order=2):
    sos = butter(order, f, 'lp', fs=SR, output='sos')
    return sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], 'bp', fs=SR, output='sos')
    return sosfilt(sos, x)


def sweep_filter(x, f0, f1, q=1.2, kind='bp', block=256, curve=1.0):
    """time-varying filter: cutoff moves exponentially from f0 to f1"""
    out = np.zeros_like(x)
    n = len(x)
    zi = None
    for s in range(0, n, block):
        p = (s / max(n - 1, 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        if kind == 'bp':
            lo, hi = fc / (1 + 0.5 / q), min(fc * (1 + 0.5 / q), SR / 2 - 100)
            b, a = butter(2, [lo, hi], 'bp', fs=SR)
        else:
            b, a = butter(2, min(fc, SR / 2 - 100), kind, fs=SR)
        if zi is None or len(zi) != max(len(a), len(b)) - 1:
            zi = np.zeros(max(len(a), len(b)) - 1)
        out[s:s + block], zi = lfilter(b, a, x[s:s + block], zi=zi)
    return out


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


# ---------------- primitives (mono) ----------------

def tick(freq=3200, dur=0.03, decay=0.004, click=0.25):
    """crisp interface tick"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) * env_exp(n, decay, 0.0005)
    s += click * hp(rng.standard_normal(n), 4000) * env_exp(n, 0.0015, 0.0002)
    return norm(s, 1)


def stamp(dur=0.09, body=170):
    """mechanical part-placement: tick + short low body"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = 0.7 * tick(2600, dur, 0.006, 0.3)[:n]
    s += 0.9 * np.sin(2 * np.pi * body * t * (1 - 0.25 * t / dur)) * env_exp(n, 0.025, 0.001)
    return norm(s, 1)


def blip(freq=1600, dur=0.12, decay=0.03, harm=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + harm * np.sin(2 * np.pi * 2 * freq * t)
    return norm(s * env_exp(n, decay, 0.001), 1)


def ping(freq=1480, dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.12 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / 0.15)
    return norm(s * env_exp(n, 0.35, 0.002), 1)


def sub_hit(f_hi=90, f_lo=38, dur=1.6, decay=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    fr = f_lo + (f_hi - f_lo) * np.exp(-t / 0.08)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.tanh(1.6 * np.sin(ph)) * env_exp(n, decay, 0.004)
    return norm(s, 1)


def whoosh(dur=0.6, f0=400, f1=4000, q=0.9, shape='swell', curve=1.0):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    y = sweep_filter(x, f0, f1, q=q, curve=curve)
    t = np.linspace(0, 1, n)
    if shape == 'swell':
        e = np.sin(np.pi * t) ** 1.5
    elif shape == 'rise':
        e = t ** 2.2 * (1 - np.clip((t - 0.96) / 0.04, 0, 1))
    else:  # fall
        e = (1 - t) ** 2 * np.clip(t / 0.02, 0, 1)
    return norm(y * e, 1)


def glide(f0, f1, dur, decay=None, wave='sine'):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    fr = f0 * (f1 / f0) ** t
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph)
    e = np.sin(np.pi * t) if decay is None else env_exp(n, decay)
    return norm(s * e, 1)


def glitch(dur=0.08):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    # sample-and-hold bitcrush
    hold = 24
    x = np.repeat(x[::hold], hold)[:n]
    x = np.round(x * 3) / 3
    x = bp(x, 600, 6000)
    e = np.ones(n)
    e[: int(0.002 * SR)] = np.linspace(0, 1, int(0.002 * SR))
    e[-int(0.01 * SR):] = np.linspace(1, 0, int(0.01 * SR))
    return norm(x * e, 1)


def chord(freqs, dur=3.0, attack=0.04, decay=1.4, bright=0.15, detune=0.0015):
    """warm brand resolve: soft sines + gentle 2nd harmonic, slow decay"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for i, f in enumerate(freqs):
        for d in (-detune, detune):
            s += np.sin(2 * np.pi * f * (1 + d) * t + i)
            s += bright * np.sin(2 * np.pi * 2 * f * (1 + d) * t) * np.exp(-t / 0.4)
    e = np.clip(t / attack, 0, 1) * np.exp(-t / decay)
    return norm(lp(s * e, 5000), 1)


def pad(freqs, dur, attack=1.0, release=1.0, cutoff=1400, wobble=0.15):
    """soft analog-like pad from detuned saws through a lowpass"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for d in (-0.003, 0, 0.0035):
            ph = (f * (1 + d) * t + rng.random()) % 1.0
            s += 2 * ph - 1
    s = lp(s, cutoff, 4)
    lfo = 1 + wobble * np.sin(2 * np.pi * 0.25 * t)
    e = np.clip(t / attack, 0, 1) * np.clip((dur - t) / release, 0, 1)
    return norm(s * e * lfo, 1)


def kick(dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    fr = 45 + 110 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) * env_exp(n, 0.12, 0.001)
    s += 0.15 * hp(rng.standard_normal(n), 3000) * env_exp(n, 0.003)
    return norm(np.tanh(1.4 * s), 1)


def hat(dur=0.06, decay=0.012):
    n = int(dur * SR)
    x = hp(rng.standard_normal(n), 7000, 4)
    return norm(x * env_exp(n, decay, 0.0005), 1)


def bass_note(freq, dur, cutoff=420):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ph = (freq * t) % 1.0
    s = (2 * ph - 1) + 0.6 * np.sin(2 * np.pi * freq * t)
    s = lp(s, cutoff, 4)
    e = np.clip(t / 0.004, 0, 1) * np.exp(-t / (dur * 0.6))
    return norm(s * e, 1)


def data_chatter(dur, density=40, seed=1, lo=2200, hi=5200):
    """sparse random micro-ticks: texture for scrambling text"""
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros(n)
    k = int(dur * density)
    for _ in range(k):
        p = int(r.random() * (n - 2000))
        tk = tick(r.uniform(lo, hi), 0.02, 0.0025, 0.1) * r.uniform(0.3, 1)
        out[p:p + len(tk)] += tk
    return out


# ---------------- mixing ----------------

class Mix:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)
        self.vL = np.zeros(self.n)  # reverb send
        self.vR = np.zeros(self.n)

    def add(self, t, x, gain_db=0.0, pan=0.0, verb=0.15, xR=None):
        g = 10 ** (gain_db / 20)
        s = int(t * SR)
        if s >= self.n:
            return
        xl = x
        xr = x if xR is None else xR
        m = min(len(xl), self.n - s)
        lg = g * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        rg = g * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.L[s:s + m] += xl[:m] * lg
        self.R[s:s + m] += xr[:m] * rg
        self.vL[s:s + m] += xl[:m] * lg * verb
        self.vR[s:s + m] += xr[:m] * rg * verb

    def add_stereo(self, t, x, gain_db=0, width=0.6, verb=0.15, delay_ms=11):
        """pseudo-stereo by short decorrelating delay"""
        d = int(delay_ms * SR / 1000)
        xr = np.concatenate([np.zeros(d), x])[: len(x)]
        xl = x
        self.add(t, (xl * (1 + width) + xr * (1 - width)) / 2, gain_db, -0.0, verb, xR=(xr * (1 + width) + xl * (1 - width)) / 2)

    def render(self, path, rt=1.6, wet=1.0, duck=None):
        # stereo reverb from decaying filtered noise
        n = int(rt * SR)
        t = np.arange(n) / SR
        r = np.random.default_rng(3)
        irL = lp(r.standard_normal(n), 6000) * np.exp(-t / (rt / 6.9) * 1.0)
        irR = lp(r.standard_normal(n), 6000) * np.exp(-t / (rt / 6.9) * 1.0)
        irL[: int(0.012 * SR)] = 0
        irR[: int(0.017 * SR)] = 0
        irL /= np.sqrt(np.sum(irL ** 2))
        irR /= np.sqrt(np.sum(irR ** 2))
        wL = fftconvolve(self.vL, irL)[: self.n]
        wR = fftconvolve(self.vR, irR)[: self.n]
        L = self.L + wet * wL * 0.6
        R = self.R + wet * wR * 0.6
        st = np.stack([L, R], 1)
        st = hp(st.T, 22).T if False else st
        # DC/rumble cleanup
        st[:, 0] = hp(st[:, 0], 25)
        st[:, 1] = hp(st[:, 1], 25)
        # gentle bus soft-clip after normalising to -3 dBFS peak
        st = st / (np.max(np.abs(st)) + 1e-9) * 0.7
        st = np.tanh(st * 1.2) / np.tanh(1.2)
        # fade edges
        f = int(0.004 * SR)
        st[:f] *= np.linspace(0, 1, f)[:, None]
        st[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))[:, None]
        sf.write(path, st.astype(np.float32), SR, subtype='FLOAT')
        return path
