from PIL import Image, ImageDraw
S=512; K=(20,20,20,255); W=(255,255,255,255); TEAR=(110,185,255,235)
def base(): im=Image.new("RGBA",(S,S),(0,0,0,0)); return im, ImageDraw.Draw(im)
def tear(d,x,y0,y1,w=26):
    d.rounded_rectangle([x-w//2,y0,x+w//2,y1],radius=w//2,fill=TEAR)
faces={}
# cry: squeezed shut eyes, wailing mouth, tear streams
im,d=base()
for cx,s in ((175,1),(337,-1)):
    d.line([cx-40,180,cx,205,cx-40,230] if s==1 else [cx+40,180,cx,205,cx+40,230],fill=K,width=16,joint="curve")
d.line([125,140,215,160],fill=K,width=14); d.line([297,160,387,140],fill=K,width=14)
d.chord([176,280,336,440],180,360,fill=K); d.ellipse([206,330,306,400],fill=K); d.ellipse([226,360,286,400],fill=(230,90,100,255))
tear(d,150,225,420); tear(d,362,225,420); faces["cry"]=im
# teary: sad eyes with shine + single tear + wobbly frown
im,d=base()
for cx in (175,337):
    d.ellipse([cx-28,160,cx+28,240],fill=K); d.ellipse([cx-14,170,cx+2,190],fill=W); d.ellipse([cx+4,205,cx+14,218],fill=W)
d.line([130,145,215,120],fill=K,width=13); d.line([297,120,382,145],fill=K,width=13)
d.line([196,360,226,342,256,356,286,342,316,360],fill=K,width=12,joint="curve")
tear(d,200,240,320,22); faces["teary"]=im
# fakesmile: big smile but sad brows
im,d=base()
for cx in (175,337): d.ellipse([cx-24,165,cx+24,240],fill=K); d.ellipse([cx-10,175,cx+4,191],fill=W)
d.line([130,150,215,125],fill=K,width=13); d.line([297,125,382,150],fill=K,width=13)
d.chord([176,270,336,400],0,180,fill=K); d.rectangle([186,272,326,300],fill=W)
faces["fakesmile"]=im
# determined
im,d=base()
for cx in (175,337): d.ellipse([cx-22,175,cx+22,240],fill=K); d.ellipse([cx-9,185,cx+3,199],fill=W)
d.line([130,135,215,165],fill=K,width=15); d.line([297,165,382,135],fill=K,width=15)
d.line([206,340,306,330],fill=K,width=15); faces["determined"]=im
# softsmile (teary but smiling)
im,d=base()
for cx in (175,337): d.arc([cx-38,170,cx+38,240],200,340,fill=K,width=15)
d.arc([186,260,326,370],20,160,fill=K,width=15); tear(d,145,215,300,20); tear(d,367,215,290,20)
faces["softsmile"]=im
for k,v in faces.items(): v.save(f"faces/{k}.png"); v.save(f"/home/claude/rt/faces/{k}.png")
sheet=Image.new("RGBA",(S*len(faces),S),(217,160,102,255))
for i,v in enumerate(faces.values()): sheet.alpha_composite(v,(i*S,0))
sheet.convert("RGB").resize((S*len(faces)//4,S//4)).save("faces2_preview.png")
