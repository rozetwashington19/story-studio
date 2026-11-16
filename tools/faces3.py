# Faces added in episode 002: wink, awe, blush (512x512 transparent, eyes ~y200, mouth ~y330)
from PIL import Image, ImageDraw
import os
S=512; K=(20,20,20,255); W=(255,255,255,255); PINK=(240,120,140,150)
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","engine","faces")
def base(): im=Image.new("RGBA",(S,S),(0,0,0,0)); return im, ImageDraw.Draw(im)
faces={}
# wink: left eye open, right eye closed arc, big smile
im,d=base()
d.ellipse([147,165,203,240],fill=K); d.ellipse([160,175,176,193],fill=W)
d.arc([300,180,375,230],200,340,fill=K,width=15)
d.line([130,145,212,135],fill=K,width=13); d.line([298,150,382,140],fill=K,width=13)
d.chord([186,270,336,390],0,180,fill=K); d.rectangle([196,272,326,296],fill=W)
faces["wink"]=im
# awe: big round sparkly eyes, small round open mouth
im,d=base()
for cx in (175,337):
    d.ellipse([cx-34,160,cx+34,245],fill=K); d.ellipse([cx-18,172,cx+2,196],fill=W); d.ellipse([cx+8,214,cx+18,226],fill=W)
d.line([130,128,212,118],fill=K,width=12); d.line([300,118,382,128],fill=K,width=12)
d.ellipse([226,312,286,382],fill=K); d.ellipse([240,350,272,378],fill=(230,90,100,255))
faces["awe"]=im
# blush: embarrassed - eyes looking aside, pink cheeks, wobbly small smile
im,d=base()
for cx in (175,337): d.ellipse([cx-22,175,cx+22,235],fill=K); d.ellipse([cx+2,183,cx+14,197],fill=W)
d.line([135,150,212,160],fill=K,width=12); d.line([300,160,377,150],fill=K,width=12)
for cx in (140,372): d.ellipse([cx-42,255,cx+42,295],fill=PINK)
d.line([216,338,236,348,256,340,276,348,296,338],fill=K,width=11,joint="curve")
faces["blush"]=im
for k,v in faces.items(): v.save(os.path.join(OUT,f"{k}.png"))
print("saved", list(faces))
