# Faces added for more expressions (512x512 transparent; eyes ~y200 at x 175/337, brows ~y130, mouth ~y330).
# Run from the repo root: python3 tools/faces4.py  -> engine/faces/*.png + faces4_preview.png (in the scratch dir passed as argv[1])
import math, os, sys
from PIL import Image, ImageDraw
S=512; K=(20,20,20,255); W=(255,255,255,255); RED=(230,90,100,255); PINK=(240,120,140,150); TEAR=(110,185,255,235); SWEAT=(140,200,255,230)
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","engine","faces")
def base(): im=Image.new("RGBA",(S,S),(0,0,0,0)); return im, ImageDraw.Draw(im)
def dot(d,cx,y=200,rx=24,ry=38,look=(0,0)):
    d.ellipse([cx-rx,y-ry,cx+rx,y+ry],fill=K); d.ellipse([cx-10+look[0],y-28+look[1],cx+4+look[0],y-12+look[1]],fill=W)
def closed_happy(d,cx,y=200): d.arc([cx-38,y-30,cx+38,y+40],200,340,fill=K,width=16)
def closed_flat(d,cx,y=205): d.line([cx-32,y,cx+32,y],fill=K,width=14)
def closed_down(d,cx,y=195): d.arc([cx-36,y-36,cx+36,y+24],20,160,fill=K,width=14)
def brow(d,x0,y0,x1,y1,w=14): d.line([x0,y0,x1,y1],fill=K,width=w)
def heart(d,cx,cy,s,col=(230,50,80,255)):
    d.ellipse([cx-s,cy-s*0.8,cx,cy+s*0.2],fill=col); d.ellipse([cx,cy-s*0.8,cx+s,cy+s*0.2],fill=col)
    d.polygon([(cx-s*0.97,cy-s*0.15),(cx+s*0.97,cy-s*0.15),(cx,cy+s)],fill=col)
def star(d,cx,cy,r,col=(255,205,40,255)):
    pts=[(cx+(r if i%2==0 else r*0.45)*math.sin(i*math.pi/5),cy-(r if i%2==0 else r*0.45)*math.cos(i*math.pi/5)) for i in range(10)]
    d.polygon(pts,fill=col,outline=K); d.line(pts+[pts[0]],fill=K,width=6)
def drop(d,x,y,s=1.0,col=SWEAT):
    d.polygon([(x,y-28*s),(x-14*s,y),(x+14*s,y)],fill=col); d.ellipse([x-14*s,y-12*s,x+14*s,y+16*s],fill=col)
def mouth_open(d,box,tongue=True):
    d.chord(box,0,180,fill=K)
    if tongue: x0,y0,x1,y1=box; d.chord([x0+(x1-x0)*0.25,y0+(y1-y0)*0.55,x1-(x1-x0)*0.25,y1-4],0,180,fill=RED)
F={}
# angry: V brows, narrowed eyes, gritted frown
im,d=base(); dot(d,175,210,22,26); dot(d,337,210,22,26); d.polygon([(140,170),(215,195),(140,195)],fill=(0,0,0,0))
brow(d,128,140,215,180,16); brow(d,297,180,384,140,16); d.arc([196,320,316,400],200,340,fill=K,width=16); F["angry"]=im
# laugh: squeezed-shut eyes, huge open mouth, tears of joy
im,d=base(); d.line([140,180,180,200,140,220],fill=K,width=15,joint="curve"); d.line([372,180,332,200,372,220],fill=K,width=15,joint="curve")
mouth_open(d,[156,250,356,450]); drop(d,128,250,0.8,TEAR); drop(d,384,250,0.8,TEAR); F["laugh"]=im
# scared: tiny pupils in big whites, wobbly open mouth, sweat drop
im,d=base()
for cx in (175,337): d.ellipse([cx-40,155,cx+40,250],fill=W,outline=K,width=9); d.ellipse([cx-9,195,cx+9,215],fill=K)
brow(d,135,140,212,118,12); brow(d,300,118,377,140,12); d.line([200,360,225,340,256,360,287,340,312,360],fill=K,width=12,joint="curve"); drop(d,410,150); F["scared"]=im
# sleepy: half-closed heavy lids, small yawn
im,d=base()
for cx in (175,337): d.chord([cx-28,185,cx+28,245],0,180,fill=K); d.line([cx-34,212,cx+34,212],fill=K,width=12)
d.ellipse([236,320,276,370],fill=K); F["sleepy"]=im
# sleeping: closed arcs, little o mouth
im,d=base(); closed_down(d,175); closed_down(d,337); d.ellipse([240,330,272,362],outline=K,width=10); F["sleeping"]=im
# love: heart eyes, big smile
im,d=base(); heart(d,175,205,42); heart(d,337,205,42); d.arc([176,250,336,380],20,160,fill=K,width=16); F["love"]=im
# starstruck: star eyes, open grin
im,d=base(); star(d,175,200,46); star(d,337,200,46); mouth_open(d,[186,280,326,400]); F["starstruck"]=im
# confused: one brow up, one down, eyes different sizes, squiggle mouth
im,d=base(); dot(d,175,205,20,30); dot(d,337,200,26,42); brow(d,135,160,212,150,12); d.arc([292,95,382,155],200,340,fill=K,width=12)
d.line([200,345,230,330,260,348,290,330,315,340],fill=K,width=12,joint="curve"); F["confused"]=im
# thinking: eyes looking up-left, mouth pushed to one side
im,d=base(); dot(d,175,200,24,36,(-8,-6)); dot(d,337,200,24,36,(-8,-6)); brow(d,135,140,212,135,12); brow(d,297,120,377,135,12)
d.line([250,340,320,325],fill=K,width=14); F["thinking"]=im
# nervous: grimace with teeth, sweat drop, worried brows
im,d=base(); dot(d,175,205,22,32); dot(d,337,205,22,32); brow(d,135,160,212,135,12); brow(d,300,135,377,160,12)
d.rounded_rectangle([186,310,326,370],radius=18,fill=W,outline=K,width=10); d.line([186,340,326,340],fill=K,width=6)
for x in (221,256,291): d.line([x,310,x,370],fill=K,width=5)
drop(d,400,170); F["nervous"]=im
# mischief: sly half-lidded eyes, angled brows, sharp grin
im,d=base()
for cx,s in ((175,1),(337,-1)): d.chord([cx-28,185,cx+28,245],0,180,fill=K)
brow(d,135,160,212,175,13); brow(d,300,175,377,160,13); d.chord([180,270,340,380],10,170,fill=K); d.polygon([(205,300),(325,300),(300,322),(230,322)],fill=W)
F["mischief"]=im
# proud: closed happy eyes, chin-up smile
im,d=base(); closed_happy(d,175); closed_happy(d,337); brow(d,135,125,212,118,11); brow(d,300,118,377,125,11)
d.arc([196,280,316,360],20,160,fill=K,width=15); F["proud"]=im
# bored: flat half lids, flat mouth
im,d=base()
for cx in (175,337): d.chord([cx-24,190,cx+24,245],0,180,fill=K); d.line([cx-30,212,cx+30,212],fill=K,width=10)
d.line([216,340,300,345],fill=K,width=13); F["bored"]=im
# disgusted: squint, wavy grimace with tongue out
im,d=base(); d.line([140,195,212,210],fill=K,width=14); dot(d,337,205,22,30); brow(d,135,165,212,175,12); brow(d,300,140,377,150,12)
d.line([196,335,226,320,256,335,286,320,316,335],fill=K,width=13,joint="curve"); d.chord([236,320,286,390],0,180,fill=RED); F["disgusted"]=im
# silly: wink + tongue out
im,d=base(); dot(d,175,200); closed_happy(d,337); d.arc([186,260,326,370],20,160,fill=K,width=16); d.chord([236,320,296,400],0,180,fill=RED)
d.line([266,330,266,380],fill=(180,60,70,255),width=4); F["silly"]=im
# pout: puffed lips, sad brows looking aside
im,d=base(); dot(d,175,205,22,32,(8,0)); dot(d,337,205,22,32,(8,0)); brow(d,135,150,212,140,12); brow(d,300,140,377,150,12)
d.ellipse([230,320,282,362],outline=K,width=12); F["pout"]=im
# relieved: closed eyes, soft smile, sweat drop on forehead
im,d=base(); closed_down(d,175); closed_down(d,337); d.arc([200,280,312,360],20,160,fill=K,width=14); drop(d,380,110,0.8); F["relieved"]=im
# gasp-happy: big sparkly eyes, open smile
im,d=base()
for cx in (175,337): d.ellipse([cx-32,160,cx+32,245],fill=K); d.ellipse([cx-16,172,cx+4,196],fill=W); d.ellipse([cx+8,215,cx+18,228],fill=W)
mouth_open(d,[206,290,306,380]); F["delighted"]=im
for k,v in F.items(): v.save(os.path.join(OUT,f"{k}.png"))
if len(sys.argv) > 1:
    sheet=Image.new("RGBA",(S*6,S*((len(F)+5)//6)),(217,160,102,255))
    for i,(k,v) in enumerate(F.items()):
        sheet.alpha_composite(v,((i%6)*S,(i//6)*S)); ImageDraw.Draw(sheet).text(((i%6)*S+20,(i//6)*S+20),k,fill=(0,0,0,255))
    sheet.convert("RGB").resize((S*6//3,S*((len(F)+5)//6)//3)).save(sys.argv[1])
print("saved", len(F), "faces:", ", ".join(F))
