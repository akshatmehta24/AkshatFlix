import sys
from PIL import Image
pre=sys.argv[1]; fr=sys.argv[2].split(','); cols=int(sys.argv[3]) if len(sys.argv)>3 else 2
ims=[Image.open(f'{pre}_{f}.png') for f in fr]; W,H=ims[0].size
rows=(len(ims)+cols-1)//cols; sh=Image.new('RGB',(W*cols,H*rows),(255,0,0))
for i,im in enumerate(ims): sh.paste(im,((i%cols)*W,(i//cols)*H))
sh.save(pre+'_sheet.png')
