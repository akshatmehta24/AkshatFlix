p = 'build.py'
s = open(p).read()
s = s.replace("PCX, PCY = 460 + 497 * 1000 / 4160, 330 + 450 * 1000 / 4160", "LKX, LKY, LKW = 560, 450, 800\nMARK_PX = 1024 * LKW / 4160\nPCX, PCY = LKX + 497 * LKW / 4160, LKY + 450 * LKW / 4160")
s = s.replace(".lockup {{ position:absolute; left:460px; top:330px; width:1000px; opacity:0; }}", ".lockup {{ position:absolute; left:560px; top:450px; width:800px; opacity:0; }}")
s = s.replace(".tag {{ position:absolute; left:0; right:0; top:640px;", ".tag {{ position:absolute; left:0; right:0; top:700px;")
s = s.replace(
    ".hc {{ position:absolute; left:0; right:0; top:250px; text-align:center; font: 400 26px Dep, monospace; letter-spacing:.8em; color: var(--ink); opacity:0; }}",
    ".hc {{ position:absolute; left:0; right:0; top:230px; text-align:center; font: 400 128px Dep, monospace; letter-spacing:.2em; color: var(--ink); }}\n.hc span {{ display:inline-block; opacity:0; }}",
)
s = s.replace(
    '<div class="tag" id="tag"><b>HARCODE</b>  ·  TALK TO YOUR TERMINAL</div>',
    '<div class="hc" id="hc">\' + \'\'.join(f\'<span>{c}</span>\' for c in \'HARCODE\') + \'</div><div class="tag" id="tag">TALK TO YOUR <b>TERMINAL</b></div>',
)
s = s.replace('<div class="sweep" id="esweep" style="top:300px;height:300px"></div>', '<div class="sweep" id="esweep" style="top:200px;height:460px"></div>')
open(p, 'w').write(s)

p = 'film/film.js'
s = open(p).read()
if '#hc span' not in s:
    s = s.replace(
        "    tl.fromTo('#tag', {opacity: 0, y: 20}",
        "    $$('#hc span').forEach((el, i) => tl.fromTo(el, {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.45, ease: 'expo.out'}, s + 0.95 + i * 0.06));\n    tl.fromTo('#tag', {opacity: 0, y: 20}",
    )
open(p, 'w').write(s)
print('patched')
