"""Mix narrated films from src/tl_<film>.json: voice, ducked score, scene SFX.
Usage: python film_audio.py <film> <outdir>"""
import json
import sys

import numpy as np
from harcode import load_vo
from music import *
from sfx import *

film, OUT = sys.argv[1], sys.argv[2]
tl = json.load(open(f'../src/tl_{film}.json'))
FPS = tl['fps']
LEN = tl['total'] / FPS + 0.3
F = lambda fr: fr / FPS
m = Mix(LEN)

# ---------------- voice ----------------
duck = np.zeros(m.n)
for s in tl['scenes']:
    for v in s['vo']:
        a = load_vo(v['file'])
        t0 = F(v['at'])
        m.add(t0, a, -2.5 if v['spk'] == 'N' else -3.5, 0, 0.05)
        i = int(t0 * SR)
        duck[max(0, i - int(0.15 * SR)):i + len(a) + int(0.25 * SR)] = 1
k = int(0.3 * SR)
duck = np.clip(np.convolve(duck, np.ones(k) / k, 'same'), 0, 1)

# ---------------- score: chord per scene, layers build through the film ----------------
prog_cyc = ['Dm9', 'Bbmaj7', 'Gm9', 'Bbmaj7']
secs = []
n = len(tl['scenes'])
for i, s in enumerate(tl['scenes']):
    t0 = F(s['start'])
    t1 = F(s['start'] + s['dur'])
    if s['id'] in ('end', 'outro'):
        continue
    layers = {'pad', 'hat8'}
    if i >= 1:
        layers |= {'bass', 'kick2'}
    if i >= n * 0.45:
        layers |= {'arp', 'hat'}
    if i >= n * 0.7:
        layers |= {'bright'}
    if i == 0:
        layers = {'pad', 'soft'}
    secs.append((t0, t1, prog_cyc[i % 4], layers))
music = Mix(LEN)
score(music, LEN, secs)
g = (1 - 0.62 * duck) * 10 ** (-5 / 20)  # music sits ~-13 dB under the voice while it speaks
m.L += music.L * g
m.R += music.R * g
m.vL += music.vL * g
m.vR += music.vR * g

# end resolve
last = tl['scenes'][-1]
T_END = F(last['start'])
hit = T_END + F(16) if last['id'] == 'end' else T_END + F(4)
m.add(hit, sub_hit(70, 36, 3.0, 0.8), -13, 0, 0.1)
m.add_stereo(hit, chord([N(x) for x in CH['Dadd9']], 3.6, attack=0.02, decay=1.8), -15, verb=0.45)


# ---------------- SFX helpers ----------------
def typing(t0, n_chars, cps, gain=-26, seed=0):
    for i in range(n_chars):
        m.add(t0 + F(i / cps), key_click(seed + i), gain, 0, 0.06)


def swoosh_in(t0, g=-27):
    m.add_stereo(t0, whoosh(0.45, 500, 4200, q=1.0), g, verb=0.2)


def lines_draw(t0, g=-30):
    m.add_stereo(t0, whoosh(0.35, 2000, 7000, q=2.0, shape='fall'), g, verb=0.15)


def tick_seq(t0, n, step, f0=3000, df=80, g=-30):
    for i in range(n):
        m.add(t0 + i * step, tick(f0 + df * i, 0.03, 0.004, 0.15), g, -0.6 + 1.2 * i / max(1, n - 1), 0.15)


def ok(t0, g=-25):
    m.add(t0, blip(1568, 0.12, 0.03), g, 0.25, 0.25)


def success(t0, g=-21):
    m.add(t0, chime([N(84), N(88), N(91)], 0.06, 0.7, 0.14), g, 0, 0.4)


def listen_on(t0, g=-24):
    m.add(t0, chime([N(81), N(88)], 0.08, 0.5, 0.1), g, 0.1, 0.35)


def think(t0, g=-25):
    m.add(t0, chime([N(88), N(84)], 0.07, 0.45, 0.09), g, -0.1, 0.3)


def ascii_logo(S):
    m.add_stereo(F(S), data_chatter(0.6, 80, seed=S, lo=3000, hi=7000), -28, width=0.9, verb=0.3)
    m.add(F(S + 16), stamp(0.09, 150), -22, 0, 0.15)


def end_card(S):
    ascii_logo(S)
    typing(F(S + 30), 7, 0.8, -25, 90)
    m.add_stereo(F(S + 40), data_chatter(0.5, 40, seed=S + 1), -31, verb=0.15)


def dev_voice_marks(s):
    for v in s['vo']:
        if v['spk'] == 'D':
            listen_on(F(v['at'] - 8))
            think(F(v['at'] + v['dur'] + 4), -27)


# ---------------- per-film cues ----------------
def demo(s):
    S, D, id = s['start'], s['dur'], s['id']
    if id == 'title':
        tick_seq(F(S), 4, 0.03, 3800, 120, -28)
        typing(F(S + 8), 7, 0.55, -24)
        m.add_stereo(F(S + D - 16), whoosh(0.35, 3000, 900, q=1.0, shape='fall'), -28, verb=0.2)
    elif id == 'voice':
        swoosh_in(F(S))
        dev_voice_marks(s)
    elif id == 'files':
        for i in range(5):
            m.add_stereo(F(S + 4 + 5 * i), whoosh(0.3, 1200 + 300 * i, 4000 + 400 * i, q=1.8), -31, verb=0.2)
            m.add(F(S + 14 + 5 * i), tick(2900 + 180 * i, 0.03, 0.004, 0.15), -28, 0.5, 0.2)
    elif id == 'read':
        m.add(F(S), stamp(0.1, 140), -21, 0, 0.12)
        lines_draw(F(S))
        tick_seq(F(S + 4), 14, 0.06, 3300, 0, -33)
        m.add_stereo(F(S + 40), whoosh(0.5, 300, 1800, q=0.9), -25, verb=0.2)
        typing(F(S + 52), 12, 1.4, -27, 30)
    elif id == 'editor':
        swoosh_in(F(S), -25)
        for at in (14, 30, 62):
            m.add_stereo(F(S + at), data_chatter(0.35, 40, seed=at), -31, verb=0.08)
            ok(F(S + at + 12))
        m.add(F(S + 46), bass_note(N(41), 0.25, 900), -23, 0, 0.1)
        m.add(F(S + 46), blip(392, 0.18, 0.06, 0.4), -27, 0, 0.15)
        m.add_stereo(F(S + 84), whoosh(0.25, 5000, 1500, q=1.4, shape='fall'), -30, verb=0.1)
        dev_voice_marks(s)
    elif id == 'tests':
        m.add(F(S), stamp(0.09, 160), -22, 0, 0.12)
        for i in range(5):
            ok(F(S + 26 + i * 3), -28)
        tick_seq(F(S + 44), 14, 0.036, 2200, 80, -25)
        success(F(S + 62))
    elif id == 'end':
        end_card(S)


def reel(s):
    S, D, id = s['start'], s['dur'], s['id']
    at = lambda n: S + round(n * D / 150)
    if id == 'intro':
        typing(F(S + 2), 7, 0.8, -26)
        lines_draw(F(S + 10))
        return
    if id == 'outro':
        m.add(F(S + 2), stamp(0.09, 150), -22, 0, 0.15)
        return
    typing(F(S + 2), 10, 1.4, -31, S)
    m.add_stereo(F(at(4)), whoosh(0.5, 500, 4500, q=1.0), -26, verb=0.2)
    m.add_stereo(F(at(128)), whoosh(0.45, 4500, 500, q=0.9, shape='fall'), -27, verb=0.2)
    if id == 'c1':
        air = lp(hp(rng.standard_normal(int(F(D - 40) * SR)), 300), 3000)
        air *= np.sin(np.linspace(0, np.pi, len(air))) ** 0.5
        m.add_stereo(F(at(20)), air, -44, verb=0)
        listen_on(F(at(18)))
    elif id == 'c2':
        listen_on(F(at(52)))
        think(F(at(88)))
        m.add_stereo(F(at(90)), data_chatter(F(at(118) - at(90)), 18, seed=31), -33, verb=0.15)
    elif id == 'c3':
        for fr in (10, 24, 42, 56):
            m.add_stereo(F(at(fr)), data_chatter(0.35, 45, seed=fr), -30, verb=0.08)
        for fr in (66, 74, 84, 90):
            ok(F(at(fr + 8)), -26)
        success(F(at(96)), -22)
    elif id == 'c4':
        for j in range(7):
            m.add_stereo(F(at(14 + 3 * j)), whoosh(0.28, 1200 + 250 * j, 4200 + 300 * j, q=1.8), -32, verb=0.2)
            m.add(F(at(26 + 3 * j)), tick(2900 + 150 * j, 0.03, 0.004, 0.15), -29, 0.5, 0.2)
        for k2, fr in enumerate((62, 74, 84, 92)):
            m.add(F(at(fr)), blip(1760 + 120 * k2, 0.12, 0.025), -25, 0.4, 0.3)
    elif id == 'c5':
        for st, du in ((10, 14), (20, 22), (34, 26), (52, 30), (74, 14)):
            ok(F(at(st + du)), -26)
        tick_seq(F(at(92)), 14, 0.03, 2200, 80, -25)
    elif id == 'c6':
        for j in range(3):
            m.add(F(at(46)) + j * 0.4, alarm(0.3), -21, 0, 0.2)
        m.add(F(at(46)), glitch(0.06), -27, 0.2, 0.1)
        success(F(at(82)), -21)


def concept(s):
    S, D, id, vo = s['start'], s['dur'], s['id'], s['vo']
    if id == 'cursor':
        typing(F(S + 16), 12, 0.25, -22)
        fall = data_chatter(F(D - 50), 26, seed=5, lo=1500, hi=4000)
        fall *= np.linspace(0.2, 1, len(fall))
        m.add_stereo(F(S + 50), fall, -30, width=0.9, verb=0.25)
    elif id == 'count':
        lines_draw(F(S))
        tick_seq(F(S + 2), 30, 0.075, 3600, 0, -33)
        m.add(F(S), sub_hit(90, 40, 1.2, 0.3), -18, 0, 0.05)
    elif id == 'race':
        m.add_stereo(F(S + 8), whoosh(1.0, 300, 6000, q=1.6, shape='swell'), -25, verb=0.2)
        typing(F(S + 8), 18, 0.15, -27, 40)
        m.add(F(S + 46), stamp(0.08, 200), -24, 0, 0.15)
    elif id == 'listen':
        m.add(F(S), ping(1480, 1.2), -24, 0, 0.5)
        qAt = vo[0]['at'] + round(vo[0]['dur'] * 0.42)
        typing(F(qAt), 36, 1.1, -25, 50)
        listen_on(F(qAt + 30))
    elif id == 'meet':
        ascii_logo(S)
        m.add(F(S + 34), tick(2400, 0.04, 0.005, 0.2), -26, 0, 0.3)
        typing(F(S + 38), 7, 0.8, -24, 70)
        m.add(F(S + 18), sub_hit(70, 38, 1.6, 0.5), -15, 0, 0.1)
    elif id == 'speak':
        swoosh_in(F(S))
        dev_voice_marks(s)
        after = vo[2]['at']
        m.add_stereo(F(after - 10), whoosh(0.5, 300, 2400, q=0.9), -26, verb=0.2)
        for i in range(4):
            ok(F(after + 8 + i * 10 + 14), -26)
    elif id == 'city':
        m.add_stereo(F(S), whoosh(1.2, 120, 900, q=0.7, shape='swell'), -24, verb=0.2)
        tick_seq(F(S + 4), 16, 0.05, 2400, 40, -33)
        for k2 in range(4):
            m.add(F(S + 40 + k2 * 14), blip(1320 + 160 * k2, 0.12, 0.025), -25, -0.3 + 0.2 * k2, 0.3)
    elif id == 'ship':
        for at, n_ch in ((4, 40), (22, 40), (44, 22), (64, 25)):
            m.add_stereo(F(S + at), data_chatter(n_ch / 2.4 / FPS, 50, seed=at), -29, verb=0.08)
        ok(F(S + 54))
        tick_seq(F(S + 72), 14, 0.04, 2200, 80, -25)
        success(F(S + 92), -22)
    elif id == 'alert':
        m.add(F(S + 6), glitch(0.07), -25, 0.2, 0.1)
        for j in range(2):
            m.add(F(S + 6) + j * 0.4, alarm(0.3), -21, 0, 0.2)
        R = vo[0]['at'] + round(vo[0]['dur'] * 0.62)
        success(F(R), -21)
    elif id == 'less':
        sw = vo[0]['at'] + round(vo[0]['dur'] * 0.48)
        m.add(F(S + 2), stamp(0.09, 130), -22, 0, 0.12)
        m.add(F(sw), sub_hit(80, 40, 1.0, 0.25), -15, 0, 0.08)
        m.add(F(sw), kick(), -16, 0, 0.05)
    elif id == 'end':
        end_card(S)


cue = {'demo': demo, 'reel': reel, 'concept': concept}[film]
for s in tl['scenes']:
    cue(s)
m.render(f'{OUT}/{film}3.wav', rt=1.8)
print('ok', film, round(LEN, 1))
