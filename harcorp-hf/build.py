"""Builds film/index.html (HyperFrames composition) from audio/timing.json + logo vectors."""
import json
import math

import numpy as np
from PIL import Image

T = json.load(open('audio/timing.json'))
B = {b['id']: b for b in T['beats']}
L = json.load(open('film/assets/logo.json'))
TOTAL = T['total']


def h(n):
    x = math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)


# ---------- logo svg ----------
def lockup_svg(cls='lockup', fill='#E4ECE7'):
    parts = ''.join(f'<path d="{d}"/>' for d in L['mark'].values())
    parts += f'<path d="{L["ring"]}"/>'
    for i, ds in enumerate(L['letters']):
        parts += f'<g class="lt lt{i}">' + ''.join(f'<path d="{d}"/>' for d in ds) + '</g>'
    ind = ''
    for i, ch in enumerate('INDUSTRIES'):
        x = (1012 + i * (3922 - 1012) / 9) / 0.94
        ind += f'<text class="ind" x="{x:.1f}" y="735.8" transform="scale(.94 1)">{ch}</text>'
    return f'<svg class="{cls}" viewBox="0 0 4160 875" fill="{fill}">{parts}<g class="inds">{ind}</g></svg>'


def mark_svg(cls='mark'):
    m = L['mark']
    pieces = ''.join(f'<path class="mp mp-{k}" d="{d}"/>' for k, d in m.items())
    return (
        f'<svg class="{cls}" viewBox="40 0 920 900" fill="#E4ECE7">'
        f'<defs><mask id="ringmask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="900">'
        f'<circle class="ringdraw" cx="497" cy="450" r="425" fill="none" stroke="#fff" stroke-width="150" '
        f'stroke-dasharray="2671 2671" stroke-dashoffset="2671" transform="rotate(40 497 450)"/></mask></defs>'
        f'<path d="{L["ring"]}" mask="url(#ringmask)"/>{pieces}</svg>'
    )


# ---------- particle targets from the mark ----------
im = Image.open('/tmp/claude-0/-home-user-AkshatFlix/d5b9577c-5670-54ab-b4fe-fab40bf58d9f/scratchpad/assets/Harcorp Assets/harcorp_logo_trans.png').convert('RGBA')
im = im.resize((120, 120))
a = np.array(im)[:, :, 3]
pts = [(x, y) for y in range(120) for x in range(120) if a[y, x] > 128 and ((x - 59.5) ** 2 + (y - 59.5) ** 2) ** 0.5 < 120 * 0.445]
pts = pts[:: max(1, len(pts) // 520)]
MARK_PX = 1024 * 1000 / 4160
LKX, LKY, LKW = 560, 450, 800
MARK_PX = 1024 * LKW / 4160
PCX, PCY = LKX + 497 * LKW / 4160, LKY + 450 * LKW / 4160
particles = [(PCX + (x / 120 - 0.5) * MARK_PX, PCY + (y / 120 - 0.5) * MARK_PX) for x, y in pts]

# ---------- chaos: tab windows ----------
tabs = ''
names = ['zsh — acme-api', 'draft_v6.ts', 'auth.ts', 'notes.md', 'retry_FINAL.ts', 'zsh — tests', 'rateLimit?', 'login.spec.ts', 'scratch.py', 'TODO.txt']
for i in range(40):
    x = 40 + h(i) * 1580
    y = 40 + h(i + 50) * 760
    r = (h(i + 9) - 0.5) * 14
    lines = ''.join(f'<i style="width:{40 + h(i * 7 + j) * 55:.0f}%"></i>' for j in range(5))
    tabs += f'<div class="tab" style="left:{x:.0f}px;top:{y:.0f}px;--r:{r:.1f}deg"><b>{names[i % len(names)]}</b>{lines}</div>'

# ---------- reads: constellation ----------
nodes = []
for i in range(72):
    cx = 220 + h(i * 3.3) * 1480
    cy = 170 + h(i * 5.1 + 2) * 660
    nodes.append((cx, cy))
def nearest(px, py, used):
    return min((i for i in range(len(nodes)) if i not in used), key=lambda i: (nodes[i][0] - px) ** 2 + (nodes[i][1] - py) ** 2)
_u = []
for px, py in [(560, 300), (980, 640), (1380, 330), (1560, 760)]:
    _u.append(nearest(px, py, _u))
TARGETS = dict(zip(_u, ['routes/auth.ts', 'middleware/rateLimit.ts', 'lib/redis.ts', 'tests/auth.spec.ts']))
edges = set()
for i, (x, y) in enumerate(nodes):
    d = sorted(range(len(nodes)), key=lambda j: (nodes[j][0] - x) ** 2 + (nodes[j][1] - y) ** 2)
    for j in d[1:3]:
        edges.add(tuple(sorted((i, j))))
tpath = list(TARGETS.keys())
edge_svg = ''.join(
    f'<line class="edge" x1="{nodes[a_][0]:.0f}" y1="{nodes[a_][1]:.0f}" x2="{nodes[b_][0]:.0f}" y2="{nodes[b_][1]:.0f}" '
    f'pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>'
    for a_, b_ in sorted(edges)
)
path_d = 'M' + 'L'.join(f'{nodes[i][0]:.0f} {nodes[i][1]:.0f}' for i in tpath)
node_svg = ''.join(f'<circle class="node{" tnode" if i in TARGETS else ""}" data-x="{x:.0f}" cx="{x:.0f}" cy="{y:.0f}" r="{6 if i in TARGETS else 3.5}"/>' for i, (x, y) in enumerate(nodes))
target_html = ''.join(
    f'<div class="lock" style="left:{nodes[i][0] - 26:.0f}px;top:{nodes[i][1] - 26:.0f}px"><span></span><em>{name}</em></div>' for i, name in TARGETS.items()
)

# ---------- voice bars ----------
bars = ''.join(f'<div class="bar" style="left:{i * 19}px"></div>' for i in range(80))

# ---------- captions ----------
caps = ''
ACC = {
    0: ['idea'],
    1: ['HARCODE'],
    2: ['say', 'login'],
    3: ['codebase'],
    4: ['review'],
    5: ['HARC-OM', 'reshapes'],
    6: ['terminal'],
}
ci = 0
for bi, b in enumerate(T['beats']):
    for v in b['vo']:
        words = []
        for w in v['text'].split(' '):
            ww = w.strip('.,')
            words.append(f'<span class="acc">{w}</span>' if ww in ACC.get(bi, []) else w)
        txt = ' '.join(words)
        if v['spk'] == 'D':
            txt = f'<span class="dev">Developer</span> “{txt}”'
        st = max(0, v['at'] - 0.12)
        caps += f'<div class="cap clip" id="cap{ci}" data-start="{st:.3f}" data-duration="{v["dur"] + 0.35:.3f}"><div class="pill">{txt}</div></div>'
        ci += 1

# pixel overlay
pix = ''.join(f'<div class="px" style="left:{(i % 32) * 60}px;top:{(i // 32) * 60}px"></div>' for i in range(32 * 18))


def scene(id_, inner):
    b = B[id_]
    return f'<div id="s-{id_}" class="scene clip" data-start="{b["start"]:.3f}" data-duration="{b["dur"]:.3f}">{inner}</div>'


html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>HARCODE — Harcorp Industries</title>
<script src="assets/vendor/gsap.min.js"></script>
<script src="timing.js"></script>
<style>
@font-face {{ font-family: Dep; src: url(assets/fonts/DepartureMono-Regular.woff2); }}
@font-face {{ font-family: JB; src: url(assets/fonts/jetbrains-mono-latin-400-normal.woff2); font-weight: 400; }}
@font-face {{ font-family: JB; src: url(assets/fonts/jetbrains-mono-latin-700-normal.woff2); font-weight: 700; }}
@font-face {{ font-family: LS; src: url(assets/fonts/LiberationSans-Bold.ttf); font-weight: 700; }}
@font-face {{ font-family: LS; src: url(assets/fonts/LiberationSans-Regular.ttf); font-weight: 400; }}
:root {{ --bg:#050607; --ink:#E4ECE7; --dim:rgba(228,236,231,.5); --faint:rgba(228,236,231,.16); --mint:#5DF2C6; --red:#FF3B3B; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:1920px; height:1080px; overflow:hidden; background:var(--bg); color:var(--ink); font-family: LS, Arial, sans-serif; }}
.clip, .scene {{ position:absolute; inset:0; }}
.layer {{ position:absolute; inset:0; pointer-events:none; }}
#bg {{ background: radial-gradient(ellipse at 50% 45%, #0b1414 0%, #050607 60%); }}
#grid {{ background-image: linear-gradient(rgba(228,236,231,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(228,236,231,.045) 1px, transparent 1px); background-size: 80px 80px; }}
#vig {{ background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.75) 100%); }}
#scan {{ background: repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 1px, transparent 1px 3px); }}
.hud {{ font-family: Dep, monospace; font-size: 14px; letter-spacing: .24em; color: var(--dim); position:absolute; text-transform: uppercase; }}
.br {{ position:absolute; width:26px; height:26px; border-color: var(--ink); border-style: solid; opacity:.6; }}
/* chaos */
.tab {{ position:absolute; width:300px; height:186px; background:#0d1112; border:1px solid rgba(228,236,231,.14); border-radius:8px; padding:36px 16px 0; transform: rotate(var(--r)); box-shadow: 0 20px 50px rgba(0,0,0,.6); opacity:0; }}
.tab b {{ position:absolute; top:0; left:0; right:0; height:26px; border-bottom:1px solid rgba(228,236,231,.1); font: 400 12px JB, monospace; color: var(--dim); padding: 6px 12px; }}
.tab i {{ display:block; height:7px; background: rgba(228,236,231,.14); margin: 12px 0; border-radius: 3px; }}
.kin {{ position:absolute; font: 700 150px LS; letter-spacing:-.04em; opacity:0; text-shadow: 0 10px 60px rgba(0,0,0,.9); }}
.cursor {{ position:absolute; left:930px; top:880px; width:34px; height:60px; background: var(--ink); opacity:0; }}
/* meet */
.mark {{ position:absolute; width:420px; height:410px; left:750px; top:210px; }}
.bloom {{ position:absolute; left:660px; top:120px; width:600px; height:600px; border-radius:50%; background: radial-gradient(circle, rgba(93,242,198,.35), transparent 65%); opacity:0; }}
.word {{ position:absolute; left:0; right:0; top:660px; text-align:center; font: 400 120px Dep, monospace; letter-spacing:.22em; }}
.word span {{ display:inline-block; opacity:0; }}
.by {{ position:absolute; left:0; right:0; top:820px; text-align:center; font: 400 22px Dep, monospace; letter-spacing:.5em; color: var(--dim); opacity:0; }}
.sweep {{ position:absolute; top:600px; width:260px; height:280px; left:-300px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); mix-blend-mode: screen; transform: skewX(-18deg); }}
/* voice */
.wave {{ position:absolute; left:200px; top:360px; width:1520px; height:300px; }}
.bar {{ position:absolute; bottom:150px; width:9px; height:2px; border-radius:5px; background: var(--mint); box-shadow: 0 0 18px rgba(93,242,198,.65); transform-origin: 50% 50%; top:149px; }}
.state {{ position:absolute; left:120px; top:130px; font: 400 22px Dep, monospace; letter-spacing:.3em; }}
.state em {{ font-style:normal; color: var(--mint); }}
.ring {{ position:absolute; left:1620px; top:110px; width:180px; height:180px; }}
.tscript {{ position:absolute; left:200px; top:700px; width:1520px; font: 400 50px JB, monospace; color: var(--ink); text-align:center; min-height:70px; }}
/* reads */
.net {{ position:absolute; inset:0; transform-origin: 1000px 500px; }}
.edge {{ stroke: rgba(228,236,231,.28); stroke-width:1.2; fill:none; }}
.node {{ fill: rgba(228,236,231,.7); }}
.tnode {{ fill: var(--mint); }}
.tpath {{ stroke: var(--mint); stroke-width:3; fill:none; filter: drop-shadow(0 0 8px rgba(93,242,198,.8)); }}
.lock {{ position:absolute; width:52px; height:52px; opacity:0; }}
.lock span {{ position:absolute; inset:0; border:2px solid var(--mint); clip-path: polygon(0 0,35% 0,35% 4px,4px 4px,4px 35%,0 35%,0 0, 65% 0,100% 0,100% 35%,calc(100% - 4px) 35%,calc(100% - 4px) 4px,65% 4px, 100% 65%,100% 100%,65% 100%,65% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 65%, 0 65%,4px 65%,4px calc(100% - 4px),35% calc(100% - 4px),35% 100%,0 100%); }}
.lock em {{ position:absolute; left:64px; top:12px; white-space:nowrap; font: 400 24px JB, monospace; font-style:normal; color: var(--ink); background: rgba(5,6,7,.8); padding: 2px 10px; border-left:2px solid var(--mint); }}
.sbar {{ position:absolute; top:0; bottom:0; width:220px; left:-240px; background: linear-gradient(90deg, transparent, rgba(93,242,198,.25), rgba(93,242,198,.6)); }}
.count {{ position:absolute; left:120px; top:120px; font: 400 22px Dep, monospace; letter-spacing:.3em; }}
.count b {{ font: 700 84px JB, monospace; letter-spacing:0; display:block; margin-top:14px; color: var(--ink); }}
/* writes */
.term {{ position:absolute; left:150px; top:170px; width:1140px; height:620px; background: rgba(10,14,15,.92); border:1px solid rgba(228,236,231,.14); border-radius:14px; box-shadow: 0 40px 120px rgba(0,0,0,.7); overflow:hidden; opacity:0; }}
.term .tt {{ height:46px; border-bottom:1px solid rgba(228,236,231,.1); display:flex; align-items:center; gap:10px; padding: 0 18px; font: 400 15px JB, monospace; color: var(--dim); }}
.term .tt i {{ width:12px; height:12px; border-radius:6px; background:#333; display:inline-block; }}
.ln {{ position:relative; height:52px; display:flex; align-items:center; font: 400 26px JB, monospace; color:#c9d1d6; padding-left:26px; white-space:pre; }}
.ln .no {{ width:54px; color: rgba(228,236,231,.3); font-size:18px; }}
.ln .tx {{ position:relative; overflow:hidden; display:inline-block; }}
.ln.add .tx {{ color:#06110d; }}
.ln.add .hl {{ position:absolute; left:80px; top:8px; height:36px; background: var(--mint); transform-origin: 0 50%; }}
.ln.del .hl {{ position:absolute; left:80px; top:8px; height:36px; background: rgba(255,59,59,.85); transform-origin: 0 50%; }}
.ln.del .tx {{ color:#1a0505; }}
.ln .ck {{ margin-left:16px; color: var(--mint); font: 700 30px LS; opacity:0; }}
.strike {{ position:absolute; left:80px; top:25px; height:3px; background:#fff; transform-origin: 0 50%; }}
.tests {{ position:absolute; left:1340px; top:200px; width:440px; }}
.trow {{ font: 400 18px Dep, monospace; letter-spacing:.14em; color: var(--dim); margin-bottom: 26px; opacity:0; }}
.trow .tb {{ height:10px; background: rgba(228,236,231,.1); margin-top:10px; position:relative; }}
.trow .tb i {{ position:absolute; left:0; top:0; bottom:0; width:100%; background: var(--mint); transform-origin: 0 50%; transform: scaleX(0); }}
.badge {{ position:absolute; left:1340px; top:640px; padding: 18px 28px; border:2px solid var(--mint); font: 700 54px JB, monospace; color: var(--mint); opacity:0; background: rgba(93,242,198,.08); }}
/* platform */
.app {{ position:absolute; left:210px; top:140px; width:1500px; height:760px; border-radius:18px; background: rgba(12,16,17,.95); border:1px solid rgba(228,236,231,.14); overflow:hidden; box-shadow: 0 50px 140px rgba(0,0,0,.7); opacity:0; }}
.app .side {{ position:absolute; left:0; top:0; bottom:0; width:220px; border-right:1px solid rgba(228,236,231,.08); padding: 70px 24px; }}
.app .side i {{ display:block; height:12px; border-radius:4px; background: rgba(228,236,231,.12); margin-bottom: 22px; }}
.app .bar2 {{ position:absolute; left:220px; right:0; top:0; height:56px; border-bottom:1px solid rgba(228,236,231,.08); display:flex; align-items:center; padding: 0 26px; gap: 30px; font: 400 16px Dep, monospace; letter-spacing:.22em; color: var(--dim); }}
.mode {{ color: var(--ink); }}
.chip {{ margin-left:auto; border:1px solid var(--mint); color: var(--mint); padding: 6px 14px; display:flex; align-items:center; gap:10px; }}
.chip u {{ width:8px; height:8px; border-radius:4px; background: var(--mint); display:inline-block; box-shadow: 0 0 10px var(--mint); }}
.pn {{ position:absolute; border:1px solid rgba(228,236,231,.14); border-radius:10px; background: rgba(228,236,231,.03); overflow:hidden; }}
.pn .c {{ position:absolute; inset: 16px; }}
.pn .c i {{ display:block; height:9px; border-radius:3px; background: rgba(228,236,231,.16); margin-bottom: 14px; }}
.pn .c .g {{ background: rgba(93,242,198,.55); }}
.bars3 {{ position:absolute; left:16px; right:16px; bottom:16px; top:16px; display:flex; align-items:flex-end; gap:10px; }}
.bars3 b {{ flex:1; background: rgba(93,242,198,.6); transform-origin: 50% 100%; }}
.spot {{ position:absolute; inset:0; background: radial-gradient(ellipse 420px 300px at var(--sx,50%) var(--sy,50%), transparent 0%, rgba(0,0,0,.55) 100%); opacity:0; }}
.ptitle {{ position:absolute; left:210px; top:96px; font: 400 20px Dep, monospace; letter-spacing:.32em; color: var(--dim); }}
/* end */
.pt {{ position:absolute; width:5px; height:5px; border-radius:50%; background: var(--ink); box-shadow: 0 0 6px rgba(228,236,231,.6); }}
.lockup {{ position:absolute; left:560px; top:450px; width:800px; opacity:0; }}
.lockup .ind {{ font: 700 111px LS; }}
.tag {{ position:absolute; left:0; right:0; top:700px; text-align:center; font: 400 30px Dep, monospace; letter-spacing:.34em; color: var(--dim); opacity:0; }}
.tag b {{ color: var(--mint); font-weight:400; }}
.hc {{ position:absolute; left:0; right:0; top:230px; text-align:center; font: 400 128px Dep, monospace; letter-spacing:.2em; color: var(--ink); }}
.hc span {{ display:inline-block; opacity:0; }}
/* captions */
.cap {{ z-index: 50; }}
.pill {{ position:absolute; left:50%; bottom:64px; transform: translateX(-50%); background: rgba(14,18,19,.82); border:1px solid rgba(228,236,231,.14); border-radius: 40px; padding: 14px 30px; font: 400 30px LS; color:#fff; white-space:nowrap; backdrop-filter: blur(8px); opacity:0; }}
.pill .acc {{ color: var(--mint); }}
.pill .dev {{ font: 400 16px Dep, monospace; letter-spacing:.2em; color: var(--dim); margin-right: 12px; text-transform: uppercase; }}
/* pixel transition */
#pix {{ z-index: 60; }}
.px {{ position:absolute; width:60px; height:60px; background: var(--mint); opacity:0; transform: scale(.2); }}
#grain {{ z-index: 70; opacity:.05; mix-blend-mode: screen; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.3f}" data-width="1920" data-height="1080">
  <div class="layer" id="bg"></div>
  <div class="layer" id="grid"></div>

  {scene('chaos', f'<div id="tabs" class="layer">{tabs}</div><div class="kin" id="k1" style="left:150px;top:150px">40 tabs.</div><div class="kin" id="k2" style="left:620px;top:420px">6 drafts.</div><div class="kin" id="k3" style="left:1100px;top:690px;color:var(--mint)">1 idea.</div><div class="cursor" id="cur"></div>')}

  {scene('meet', f'<div class="bloom" id="bloom"></div>{mark_svg()}<div class="word" id="word">{"".join(f"<span>{c}</span>" for c in "HARCODE")}</div><div class="by" id="by">from Harcorp Industries</div><div class="sweep" id="sweep"></div>')}

  {scene('voice', f'<div class="state" id="st">STATE&nbsp;&nbsp;<em id="stv">IDLE</em></div><svg class="ring" viewBox="0 0 180 180"><circle cx="90" cy="90" r="70" fill="none" stroke="rgba(228,236,231,.2)" stroke-width="2"/><circle id="ringarc" cx="90" cy="90" r="70" fill="none" stroke="#5DF2C6" stroke-width="4" stroke-dasharray="110 330" transform-origin="90 90"/><circle id="ringdot" cx="90" cy="90" r="10" fill="#5DF2C6"/></svg><div class="wave" id="wave">{bars}</div><div class="tscript" id="ts"></div>')}

  {scene('reads', f'<div class="net" id="net"><svg width="1920" height="1080" style="position:absolute;inset:0">{edge_svg}<path class="tpath" id="tpath" d="{path_d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>{node_svg}</svg>{target_html}</div><div class="sbar" id="sbar"></div><div class="count">FILES INDEXED<b id="cnt">000</b></div>')}

  {scene('writes', '<div class="term" id="term"><div class="tt"><i></i><i></i><i></i>&nbsp;&nbsp;routes/auth.ts — acme-api</div>'
        + '<div class="ln"><span class="no">1</span><span class="tx">import { Router } from \'express\'</span></div>'
        + '<div class="ln add" id="l1"><span class="hl"></span><span class="no">2</span><span class="tx">import { rateLimit } from \'../middleware\'</span><span class="ck">✓</span></div>'
        + '<div class="ln"><span class="no">3</span><span class="tx">const router = Router()</span></div>'
        + '<div class="ln add" id="l2"><span class="hl"></span><span class="no">4</span><span class="tx">const limiter = rateLimit({ max: 5, window: \'1m\' })</span><span class="ck">✓</span></div>'
        + '<div class="ln del" id="l3"><span class="hl"></span><span class="no">5</span><span class="tx">router.post(\'/login\', login)</span><span class="strike"></span></div>'
        + '<div class="ln add" id="l4"><span class="hl"></span><span class="no">5</span><span class="tx">router.post(\'/login\', limiter, login)</span><span class="ck">✓</span></div>'
        + '<div class="ln"><span class="no">6</span><span class="tx">export default router</span></div></div>'
        + '<div class="tests" id="tests">' + ''.join(f'<div class="trow">{n}<div class="tb"><i></i></div></div>' for n in ['LOGIN · 5 ATTEMPTS', 'LOGIN · 6TH → 429', 'RESET AFTER 60S', 'PER-IP BUCKETS', 'SESSION · OK']) + '</div><div class="badge" id="badge">✓ 14 PASSED</div>')}

  {scene('platform', '<div class="ptitle" id="ptitle">HARCORP AI PLATFORM</div><div class="app" id="app"><div class="side"><i style="width:70%"></i><i style="width:55%"></i><i style="width:80%"></i><i style="width:60%"></i><i style="width:40%"></i></div>'
        + '<div class="bar2"><span>MODE</span><span class="mode" id="mode">CODE</span><span class="chip"><u></u>HARC-OM</span></div>'
        + ''.join(f'<div class="pn" id="p{i}"><div class="c c-code">' + ''.join(f'<i class="{"g" if (i + j) % 4 == 0 else ""}" style="width:{30 + h(i * 9 + j) * 60:.0f}%"></i>' for j in range(9)) + '</div>'
                  + '<div class="c c-docs" style="opacity:0">' + ''.join(f'<i style="width:{75 + h(i * 3 + j) * 25:.0f}%;height:7px"></i>' for j in range(10)) + '</div>'
                  + '<div class="c c-data" style="opacity:0"><div class="bars3">' + ''.join(f'<b style="height:{20 + h(i * 5 + j) * 75:.0f}%"></b>' for j in range(7)) + '</div></div></div>' for i in range(4))
        + '<div class="spot" id="spot"></div></div>')}

  {scene('end', '<div id="pts">' + ''.join(f'<div class="pt" style="left:{x:.1f}px;top:{y:.1f}px"></div>' for x, y in particles) + '</div>' + '<svg class="lockup lockmark" viewBox="0 0 4160 875" style="display:none"></svg>' + lockup_svg() + '<div class="sweep" id="esweep" style="top:200px;height:460px"></div><div class="hc" id="hc">' + ''.join(f'<span>{c}</span>' for c in 'HARCODE') + '</div><div class="tag" id="tag">TALK TO YOUR <b>TERMINAL</b></div>')}

  {caps}
  <div class="layer" id="pix">{pix}</div>
  <div class="layer" id="vig"></div>
  <div class="layer" id="scan"></div>
  <svg class="layer" id="grain" width="1920" height="1080"><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/></filter><rect id="grect" width="2100" height="1260" x="-90" y="-90" filter="url(#gn)"/></svg>
  <div class="layer" id="hudl">
    <div class="br" style="left:40px;top:40px;border-width:2px 0 0 2px"></div>
    <div class="br" style="right:40px;top:40px;border-width:2px 2px 0 0"></div>
    <div class="br" style="left:40px;bottom:40px;border-width:0 0 2px 2px"></div>
    <div class="br" style="right:40px;bottom:40px;border-width:0 2px 2px 0"></div>
    <div class="hud" style="left:84px;top:46px">HARCORP // HARCODE 0.1</div>
    <div class="hud" id="tc" style="right:84px;top:46px">T+00.00</div>
  </div>
  <audio id="mix" class="clip" src="assets/audio/mix.wav" data-start="0" data-duration="{TOTAL:.3f}" data-volume="1"></audio>
</div>
<script src="film.js"></script>
</body>
</html>
'''
open('film/index.html', 'w').write(html)
json.dump({'nodes': nodes, 'targets': list(TARGETS.keys()), 'np': len(particles)}, open('film/build_meta.json', 'w'))
print('ok', len(particles), 'particles', len(edges), 'edges')
