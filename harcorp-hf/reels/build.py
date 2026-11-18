"""Generate a HyperFrames vertical reel (1080x1920) from <reel>/timing.json.
Layout contract: every shot lives in the STAGE (x 60..980, y stage_top..1140).
The CAPTION band (y 1190..1430) is reserved for subtitles only. Nothing else is drawn
below y 1140 except the subtitles, so nothing can collide with them."""
import json
import math
import shutil
import sys

import numpy as np
from PIL import Image

W, H = 1080, 1920
STAGE_BOTTOM = 1140
CAP_Y = 1310  # caption centre line
L = json.load(open('/home/user/AkshatFlix/harcorp-hf/film/assets/logo.json'))


def h(n):
    x = math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)


def mark_svg(uid):
    m = L['mark']
    pieces = ''.join(f'<path class="mp mp-{k}" d="{d}"/>' for k, d in m.items())
    return (
        f'<svg class="mark" viewBox="40 0 920 900" fill="#E4ECE7"><defs><mask id="rm{uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="900">'
        f'<circle class="ringdraw" cx="497" cy="450" r="425" fill="none" stroke="#fff" stroke-width="150" stroke-dasharray="2671 2671" stroke-dashoffset="2671" transform="rotate(40 497 450)"/></mask></defs>'
        f'<path d="{L["ring"]}" mask="url(#rm{uid})"/>{pieces}</svg>'
    )


def lockup_svg():
    parts = ''.join(f'<path d="{d}"/>' for d in L['mark'].values()) + f'<path d="{L["ring"]}"/>'
    for i, ds in enumerate(L['letters']):
        parts += f'<g class="lt">' + ''.join(f'<path d="{d}"/>' for d in ds) + '</g>'
    ind = ''.join(f'<text class="ind" x="{(1012 + i * (3922 - 1012) / 9) / 0.94:.1f}" y="735.8" transform="scale(.94 1)">{c}</text>' for i, c in enumerate('INDUSTRIES'))
    return f'<svg class="lockup" viewBox="0 0 4160 875" fill="#E4ECE7">{parts}<g class="inds">{ind}</g></svg>'


# particles for logo shot: mark centred at (540, 560), size 420
im = Image.open('/tmp/claude-0/-home-user-AkshatFlix/d5b9577c-5670-54ab-b4fe-fab40bf58d9f/scratchpad/assets/Harcorp Assets/harcorp_logo_trans.png').convert('RGBA').resize((110, 110))
a = np.array(im)[:, :, 3]
PTS = [(x, y) for y in range(110) for x in range(110) if a[y, x] > 128 and math.hypot(x - 54.5, y - 54.5) < 110 * 0.445]
PTS = PTS[:: max(1, len(PTS) // 480)]


def stage_mid(st):
    return (st + STAGE_BOTTOM) / 2


def shot_html(s, st):
    k = s['kind']
    p = s['params']
    i = s['i']
    mid = stage_mid(st)
    if k == 'slam':
        words = p['words']
        n = len(words)
        size = 210 if n == 1 and not p.get('small') else (150 if max(len(w) for w in words) > 8 else 190)
        if p.get('small'):
            size = 130
        lh = size * 1.02
        y0 = mid - n * lh / 2
        keys = ''
        if p.get('keys'):
            KS = 'QWERTYUIOPASDFGHJKLZXCVBNM{}();=<>'
            for j in range(34):
                keys += f'<div class="key" data-j="{j}" style="left:{540 - 46}px;top:{mid - 46:.0f}px">{KS[j % len(KS)]}</div>'
        ws = ''.join(
            f'<div class="sw{" acc" if j == p.get("accent", -1) else ""}" style="top:{y0 + j * lh:.0f}px;font-size:{size}px">{w}</div>' for j, w in enumerate(words)
        )
        sub = f'<div class="sub" style="top:{y0 + n * lh + 30:.0f}px">{p["sub"]}</div>' if p.get('sub') else ''
        return f'<div class="keys">{keys}</div><div class="slamwrap">{ws}{sub}</div>'
    if k == 'wave':
        bars = ''.join(f'<div class="bar" style="left:{90 + j * 17}px;top:{mid}px"></div>' for j in range(54))
        return f'<div class="wtag" style="top:{st + 40}px"><u></u>{p["tag"]}</div><div class="wglow" style="top:{mid - 260}px"></div>{bars}<div class="wmeta" style="top:{mid + 250}px">MIC-01 · 48 KHZ · VOICE MODEL ONLINE</div>'
    if k == 'net':
        nodes = [(110 + h(i * 31 + j * 3.3) * 820, st + 120 + h(i * 17 + j * 5.1 + 2) * (STAGE_BOTTOM - st - 200)) for j in range(42)]
        edges = set()
        for j, (x, y) in enumerate(nodes):
            d = sorted(range(len(nodes)), key=lambda q: (nodes[q][0] - x) ** 2 + (nodes[q][1] - y) ** 2)
            for q in d[1:3]:
                edges.add(tuple(sorted((j, q))))
        targets = []
        for tx, ty in [(300, st + 360), (760, mid + 40), (330, STAGE_BOTTOM - 140)]:
            targets.append(min((q for q in range(len(nodes)) if q not in targets), key=lambda q: (nodes[q][0] - tx) ** 2 + (nodes[q][1] - ty) ** 2))
        names = ['routes/auth.ts', 'middleware/rateLimit.ts', 'lib/redis.ts']
        e = ''.join(f'<line class="edge" x1="{nodes[a_][0]:.0f}" y1="{nodes[a_][1]:.0f}" x2="{nodes[b_][0]:.0f}" y2="{nodes[b_][1]:.0f}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>' for a_, b_ in sorted(edges))
        nd = ''.join(f'<circle class="node{" tnode" if j in targets else ""}" cx="{x:.0f}" cy="{y:.0f}" r="{7 if j in targets else 4}"/>' for j, (x, y) in enumerate(nodes))
        pd = 'M' + 'L'.join(f'{nodes[q][0]:.0f} {nodes[q][1]:.0f}' for q in targets)
        locks = ''.join(
            f'<div class="lock" style="left:{nodes[q][0] - 28:.0f}px;top:{nodes[q][1] - 28:.0f}px"><span></span><em class="{"lft" if nodes[q][0] > 640 else ""}">{nm}</em></div>' for q, nm in zip(targets, names)
        )
        return f'<svg class="netsvg" width="1080" height="1920">{e}<path class="tpath" d="{pd}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>{nd}</svg>{locks}<div class="sbar" style="top:{st}px;height:{STAGE_BOTTOM - st}px"></div><div class="count" style="top:{st + 30}px">FILES READ<b class="cnt">000</b></div>'
    if k == 'diff':
        if p.get('retry'):
            rows = [('ctx', 'async function retry(fn, attempt) {'), ('add', '  const wait = Math.min('), ('add', '    BASE_MS * 2 ** attempt,'), ('add', '    30_000)'), ('del', '  await sleep(1000)'), ('add', '  await sleep(wait)'), ('ctx', '}')]
            fname = 'lib/retry.ts'
        else:
            rows = [('ctx', "import { Router } from 'express'"), ('add', "import { rateLimit } from './mw'"), ('add', 'const limit = rateLimit({ max: 5 })'), ('del', "router.post('/login', login)"), ('add', "router.post('/login', limit, login)"), ('ctx', 'export default router')]
            fname = 'routes/auth.ts'
        top = mid - (len(rows) * 70 + 80) / 2
        lines = ''.join(f'<div class="ln {kk}"><span class="hl"></span><span class="no">{j + 1}</span><span class="tx">{t}</span>{"<span class=ck>✓</span>" if kk == "add" else ""}{"<span class=strike></span>" if kk == "del" else ""}</div>' for j, (kk, t) in enumerate(rows))
        return f'<div class="term" style="top:{top:.0f}px"><div class="tt"><i></i><i></i><i></i>&nbsp;&nbsp;{fname}</div>{lines}</div>'
    if k == 'tests':
        rows = ['login · 5 attempts', 'login · 6th → 429', 'reset after 60s', 'per-IP buckets']
        top = mid - 300
        tr = ''.join(f'<div class="trow"><span>✓</span>{r}<div class="tb"><i></i></div></div>' for r in rows)
        return f'<div class="tests" style="top:{top:.0f}px">{tr}</div><div class="badge" style="top:{top + 430:.0f}px">✓ 14 PASSED</div><div class="ringfx" style="top:{top + 430 - 120:.0f}px"></div>'
    if k == 'boot':
        lines = ['> harcode --listen', '[ OK ] microphone', '[ OK ] repo · 214 files', '[ OK ] voice model']
        bl = ''.join(f'<div class="bl">{t}</div>' for t in lines)
        return f'<div class="boot" style="top:{st + 60}px">{bl}</div><div class="big" style="top:{mid + 60}px"><span class="g1">IT\'S</span><br/><span class="g2">LISTENING.</span></div><div class="micdot" style="top:{mid - 40}px"></div>'
    if k == 'mark':
        return f'<div class="bloom" style="top:{mid - 420}px"></div><div class="markwrap" style="top:{mid - 330}px">{mark_svg(i)}</div><div class="word" style="top:{mid + 170}px">' + ''.join(f'<span>{c}</span>' for c in 'HARCODE') + f'</div><div class="sweep" style="top:{mid + 120}px"></div>'
    if k == 'alert':
        fail = p['state'] == 'fail'
        title = 'TEST<br/>FAILED' if fail else 'FIXED.'
        sub = 'auth.spec.ts:42 — expected 429, got 200' if fail else 'patched rateLimit.ts · 14/14 passing'
        return f'<div class="redwash{"" if fail else " ok"}"></div><div class="card{" ok" if not fail else ""}" style="top:{mid - 250}px"><div class="ct">{title}</div><div class="cs">{sub}</div></div><div class="asc" style="top:{mid - 420}px">{"ERR" if fail else "OK"} · {"0x0429" if fail else "RESOLVED"}</div>'
    if k == 'logo':
        st = 230  # end card always gets the full stage (timer is gone by then)
        cx, cy, size = 540, st + 300, 440
        pts = ''.join(f'<div class="pt" style="left:{cx + (x / 110 - 0.5) * size * 1.11:.1f}px;top:{cy + (y / 110 - 0.5) * size * 1.11:.1f}px"></div>' for x, y in PTS)
        return f'<div class="bloom" style="top:{cy - 360}px;opacity:.6"></div><div class="pts">{pts}</div><div class="markwrap end" style="top:{cy - 220}px">{mark_svg(i)}</div><div class="hcw" style="top:{cy + 270}px">' + ''.join(f'<span>{c}</span>' for c in 'HARCODE') + f'</div><div class="tag" style="top:{cy + 430}px">TALK TO YOUR <b>TERMINAL</b></div><div class="lkw" style="top:{cy + 520}px">{lockup_svg()}</div><div class="sweep" style="top:{cy + 220}px"></div>'
    return ''


def captions(T):
    out = ''
    ci = 0
    for s in T['shots']:
        for v in s['vo']:
            ws = v['words']
            chunks = []
            cur = []
            for w in ws:
                cur.append(w)
                if len(cur) >= 3 or w['w'][-1] in '.,?!' or (len(cur) >= 2 and len(' '.join(x['w'] for x in cur)) > 15):
                    chunks.append(cur)
                    cur = []
            if cur:
                chunks.append(cur)
            for c_i, c in enumerate(chunks):
                st = c[0]['t'] - 0.05
                en = chunks[c_i + 1][0]['t'] - 0.05 if c_i + 1 < len(chunks) else v['at'] + v['dur'] + 0.12
                spans = ''.join(f'<span class="cw" data-t="{w["t"]:.3f}">{w["w"]}</span> ' for w in c)
                dev = ' dev' if v['spk'] == 'D' else ''
                out += f'<div class="cap clip{dev}" data-start="{st:.3f}" data-duration="{max(0.2, en - st):.3f}"><div class="cl">{spans.strip()}</div></div>'
                ci += 1
    return out


def build(d):
    T = json.load(open(f'{d}/timing.json'))
    st = T['stage_top']
    scenes = ''.join(
        f'<div id="s{s["i"]}" class="scene clip k-{s["kind"]}" data-start="{s["start"]:.3f}" data-duration="{s["dur"]:.3f}">{shot_html(s, st)}</div>' for s in T['shots']
    )
    timer = ''
    if T['timer']:
        tend = T['shots'][-1]['start']
        timer = '<div id="timer" class="clip" data-start="0" data-duration="%.3f"><div class="tlab">TIME TO SHIP</div><div class="tdig" id="tdig">00:00.00</div><div class="tsplit" id="tsplit"></div></div>' % tend
    pix = ''.join(f'<div class="px" style="left:{(q % 12) * 90}px;top:{(q // 12) * 90}px"></div>' for q in range(12 * 22))
    html = open('template.html').read()
    html = html.replace('%TOTAL%', f'{T["total"]:.3f}').replace('%SCENES%', scenes).replace('%CAPS%', captions(T)).replace('%TIMER%', timer).replace('%PIX%', pix).replace('%TITLE%', T['title'])
    open(f'{d}/index.html', 'w').write(html)
    open(f'{d}/timing.js', 'w').write('window.R = ' + json.dumps(T) + ';')
    for sub in ('vendor', 'fonts'):
        shutil.copytree(f'/home/user/AkshatFlix/harcorp-hf/film/assets/{sub}', f'{d}/assets/{sub}', dirs_exist_ok=True)
    shutil.copy('reel.js', f'{d}/reel.js')
    print('built', d, T['total'])


if __name__ == '__main__':
    for d in sys.argv[1:]:
        build(d)
