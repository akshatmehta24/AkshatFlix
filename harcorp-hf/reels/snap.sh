#!/bin/bash
# snap.sh <reel> : snapshot mid + near-end of every shot, make contact sheet
r=$1
AT=$(python3 -c "
import json;T=json.load(open('$r/timing.json'));print(','.join(f\"{s['start']+s['dur']*k:.2f}\" for s in T['shots'] for k in (0.5,0.9)))")
cd $r && rm -rf snap && npx --prefix ../.. hyperframes snapshot --at $AT -o snap >/dev/null 2>&1
python3 - <<PY
from PIL import Image; import glob
fs=sorted(glob.glob('snap/frame*.png'));ims=[Image.open(f).convert('RGB').resize((270,480)) for f in fs]
sh=Image.new('RGB',(270*8,480*((len(ims)+7)//8)),(255,0,0))
for i,im in enumerate(ims): sh.paste(im,((i%8)*270,(i//8)*480))
sh.save('sheet.png'); print(len(ims))
PY
