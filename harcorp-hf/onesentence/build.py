import json

T = json.load(open('timing.json'))
P = {p['id']: p for p in T['ph']}
MASK = json.load(open('mask.json'))

caps = ''
for p in T['ph']:
    if p['id'] in ('hook', 'reveal', 'end'):
        continue  # big kinetic type carries these lines
    for v in p['vo']:
        ws = v['words']
        chunks, cur = [], []
        for w in ws:
            cur.append(w)
            if len(cur) >= 3 or w['w'][-1] in '.,?!':
                chunks.append(cur)
                cur = []
        if cur:
            chunks.append(cur)
        for i, c in enumerate(chunks):
            st = c[0]['t'] - 0.05
            en = chunks[i + 1][0]['t'] - 0.05 if i + 1 < len(chunks) else v['at'] + v['dur'] + 0.15
            spans = ' '.join(f'<span class="cw" data-t="{w["t"]:.3f}">{w["w"]}</span>' for w in c)
            caps += f'<div class="cap clip{" dev" if v["spk"] == "D" else ""}" data-start="{st:.3f}" data-duration="{max(0.2, en - st):.3f}"><div class="cl">{spans}</div></div>'

labels = ''.join(f'<div class="lab" id="lab{k}"><i>✓ </i>{n}</div>' for k, n in enumerate(['routes/auth.ts', 'middleware/rateLimit.ts', 'lib/redis.ts', 'tests/auth.spec.ts']))

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>ONE SENTENCE — HARCODE</title>
<script src="assets/vendor/gsap.min.js"></script>
<script src="timing.js"></script>
<script>window.MASK = {json.dumps(MASK)};</script>
<style>
@font-face {{ font-family: Dep; src: url(assets/fonts/DepartureMono-Regular.woff2); }}
@font-face {{ font-family: JB; src: url(assets/fonts/jetbrains-mono-latin-700-normal.woff2); font-weight: 700; }}
@font-face {{ font-family: JB; src: url(assets/fonts/jetbrains-mono-latin-400-normal.woff2); font-weight: 400; }}
@font-face {{ font-family: LS; src: url(assets/fonts/LiberationSans-Bold.ttf); font-weight: 700; }}
:root {{ --ink:#E4ECE7; --dim:rgba(228,236,231,.5); --mint:#5DF2C6; --red:#FF3B3B; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:1080px; height:1920px; overflow:hidden; background:#040506; color:var(--ink); font-family: LS, Arial, sans-serif; }}
.layer, .clip {{ position:absolute; inset:0; }}
#bg {{ background: radial-gradient(ellipse 110% 60% at 50% 46%, #0b1716 0%, #040506 65%); }}
#stars {{ background-image: radial-gradient(1.2px 1.2px at 20% 30%, rgba(255,255,255,.5), transparent), radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,.4), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,.35), transparent), radial-gradient(1.4px 1.4px at 85% 60%, rgba(255,255,255,.45), transparent); background-size: 300px 300px; opacity:.35; }}
#world {{ position:absolute; left:0; top:0; }}
#vig {{ background: radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,.85) 100%); z-index:30; }}
#scan {{ background: repeating-linear-gradient(0deg, rgba(0,0,0,.1) 0 1px, transparent 1px 3px); z-index:31; }}
#flash {{ background:#eafff8; opacity:0; z-index:40; }}
/* hook */
.hk {{ position:absolute; left:0; right:0; text-align:center; font-weight:700; letter-spacing:-.05em; line-height:.92; opacity:0; text-shadow: 0 10px 60px rgba(0,0,0,.9); }}
#h1 {{ top:470px; font-size:120px; color: var(--dim); }}
#h2 {{ top:620px; font-size:188px; }}
#h3 {{ top:1060px; font-size:150px; color: var(--mint); text-shadow: 0 0 50px rgba(93,242,198,.5); }}
/* voice */
#tag {{ position:absolute; left:0; right:0; top:560px; text-align:center; font: 400 34px Dep, monospace; letter-spacing:.35em; color: var(--mint); opacity:0; }}
#tag u {{ display:inline-block; width:18px; height:18px; border-radius:9px; background: var(--red); margin-right:16px; box-shadow: 0 0 14px var(--red); vertical-align:2px; }}
/* labels */
.lab {{ position:absolute; transform: translateX(-50%); white-space:nowrap; font: 700 26px JB, monospace; color:#04110d; background: var(--mint); padding: 6px 14px; opacity:0; z-index:20; box-shadow: 0 0 30px rgba(93,242,198,.6); }}
.lab::after {{ content:''; position:absolute; left:50%; top:100%; width:2px; height:36px; background: var(--mint); }}
.lab.bad {{ background: var(--red); color:#fff; box-shadow: 0 0 30px rgba(255,59,59,.7); }}
.lab.bad::after {{ background: var(--red); }}
.lab i {{ font-style:normal; }}
/* hud */
.hud {{ position:absolute; top:150px; font: 400 20px Dep, monospace; letter-spacing:.28em; color: var(--dim); z-index:25; }}
#ph {{ right:60px; text-align:right; color: var(--mint); }}
#tests {{ position:absolute; left:0; right:0; top:260px; text-align:center; font: 700 64px JB, monospace; color: var(--ink); opacity:0; z-index:25; text-shadow: 0 6px 30px #000; }}
#tests small {{ display:block; font: 400 22px Dep, monospace; letter-spacing:.35em; color: var(--dim); margin-bottom: 10px; }}
/* reveal + end */
#rv1, #rv2 {{ position:absolute; left:0; right:0; text-align:center; font-weight:700; letter-spacing:-.04em; opacity:0; z-index:26; text-shadow: 0 8px 40px #000; }}
#rv1 {{ top:250px; font-size:96px; }}
#rv2 {{ top:1390px; font-size:96px; color: var(--mint); }}
#mk {{ position:absolute; left:160px; top:520px; width:760px; height:760px; opacity:0; z-index:27; filter: drop-shadow(0 0 30px rgba(93,242,198,.55)); }}
#hc {{ position:absolute; left:0; right:0; top:1000px; text-align:center; font: 400 150px Dep, monospace; letter-spacing:.12em; z-index:27; }}
#hc span {{ display:inline-block; opacity:0; }}
#lk {{ position:absolute; left:0; right:0; top:1190px; text-align:center; font: 400 30px Dep, monospace; letter-spacing:.42em; color: var(--dim); opacity:0; z-index:27; }}
#lk b {{ color: var(--mint); font-weight:400; }}
#tg {{ position:absolute; left:0; right:0; top:1330px; text-align:center; font: 700 110px LS; letter-spacing:-.04em; line-height:.95; opacity:0; z-index:27; }}
#tg b {{ color: var(--mint); }}
/* captions */
.cap {{ z-index: 50; }}
.cl {{ position:absolute; left:80px; right:80px; top:1540px; text-align:center; font: 700 76px LS; line-height:1.05; letter-spacing:-.02em; text-transform: uppercase; color:#fff; opacity:0;
  text-shadow: 0 0 2px #000, 0 4px 0 #000, 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 0 30px rgba(0,0,0,.9); }}
.cw {{ display:inline-block; margin: 0 .12em; }}
.cap.dev .cl {{ font-style: italic; }}
#grain {{ z-index:60; opacity:.06; mix-blend-mode: screen; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{T['total']:.3f}" data-width="1080" data-height="1920">
  <div class="layer" id="bg"></div>
  <div class="layer" id="stars"></div>
  <canvas id="world" width="1080" height="1920"></canvas>
  <div class="hk" id="h1">WATCH WHAT</div>
  <div class="hk" id="h2">ONE<br/>SENTENCE</div>
  <div class="hk" id="h3">CAN DO.</div>
  <div id="tag"><u></u>LISTENING</div>
  {labels}
  <div class="hud" style="left:60px">HARCORP // HARCODE</div>
  <div class="hud" id="ph">01 · HOOK</div>
  <div id="tests"><small>TESTS</small><span id="tn">00</span> / 14</div>
  <div id="rv1">ONE SENTENCE IN.</div>
  <div id="rv2">WORKING CODE OUT.</div>
  <img id="mk" src="assets/img/mark_white.png" />
  <div id="hc">{''.join(f'<span>{c}</span>' for c in 'HARCODE')}</div>
  <div id="lk">BY <b>HARCORP</b> INDUSTRIES</div>
  <div id="tg">TALK TO YOUR<br/><b>TERMINAL.</b></div>
  {caps}
  <div class="layer" id="flash"></div>
  <div class="layer" id="vig"></div>
  <div class="layer" id="scan"></div>
  <svg class="layer" id="grain" width="1080" height="1920"><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/></filter><rect id="grect" width="1300" height="2150" x="-110" y="-110" filter="url(#gn)"/></svg>
  <audio id="mix" class="clip" src="assets/audio/mix.wav" data-start="0" data-duration="{T['total']:.3f}" data-volume="1"></audio>
</div>
<script src="world.js"></script>
<script src="main.js"></script>
</body>
</html>
'''
open('index.html', 'w').write(html)
print('ok')
