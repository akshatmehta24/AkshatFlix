p = 'build.py'
s = open(p).read()
s = s.replace("""    if k == 'logo':
        cx, cy, size = 540, st + 300, 440""", """    if k == 'logo':
        st = 230  # end card always gets the full stage (timer is gone by then)
        cx, cy, size = 540, st + 300, 440""")
s = s.replace(
    """        timer = '<div id="timer" class="clip" data-start="0" data-duration="%.3f"><div class="tlab">TIME TO SHIP</div><div class="tdig" id="tdig">00:00.00</div><div class="tsplit" id="tsplit"></div></div>' % T['total']""",
    """        tend = T['shots'][-1]['start']
        timer = '<div id="timer" class="clip" data-start="0" data-duration="%.3f"><div class="tlab">TIME TO SHIP</div><div class="tdig" id="tdig">00:00.00</div><div class="tsplit" id="tsplit"></div></div>' % tend""",
)
open(p, 'w').write(s)
print('ok', s.count('st = 230'), s.count('tend ='))
