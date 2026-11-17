# Faces added in episode 004 (512x512 transparent; eyes ~y200 at x 175/337, mouth ~y330).
# Run from the repo root: python3 tools/faces5.py [preview.png]
import os, sys
from PIL import Image, ImageDraw
S=512; K=(20,20,20,255); W=(255,255,255,255); RED=(230,90,100,255); TEAR=(110,185,255,235)
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","engine","faces")
def base(): im=Image.new("RGBA",(S,S),(0,0,0,0)); return im, ImageDraw.Draw(im)
F={}
# yawn: eyes squeezed shut, raised brows, tall open oval mouth, a little tear
im,d=base()
d.line([140,195,175,212,210,195],fill=K,width=14,joint="curve"); d.line([302,195,337,212,372,195],fill=K,width=14,joint="curve")
d.arc([130,110,215,170],200,340,fill=K,width=12); d.arc([297,110,382,170],200,340,fill=K,width=12)
d.ellipse([206,270,306,440],fill=K); d.chord([226,370,286,432],0,180,fill=RED)
d.polygon([(212,225),(202,245),(222,245)],fill=TEAR); d.ellipse([202,238,222,256],fill=TEAR); F["yawn"]=im
# whisper: soft half-lidded eyes, small rounded "shh" mouth
im,d=base()
for cx in (175,337): d.ellipse([cx-24,178,cx+24,238],fill=K); d.chord([cx-30,170,cx+30,214],180,360,fill=(0,0,0,0)); d.line([cx-30,196,cx+30,196],fill=K,width=10); d.ellipse([cx-8,206,cx+4,218],fill=W)
d.arc([140,140,212,170],200,340,fill=K,width=10); d.arc([300,140,372,170],200,340,fill=K,width=10)
d.ellipse([236,318,276,352],fill=K); F["whisper"]=im
for k,v in F.items(): v.save(os.path.join(OUT,k+".png"))
if len(sys.argv)>1:
    pv=Image.new("RGBA",(S*len(F),S),(235,190,150,255))
    for i,v in enumerate(F.values()): pv.alpha_composite(v,(i*S,0))
    pv.save(sys.argv[1])
print("faces:",list(F))
