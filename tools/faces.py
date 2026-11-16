from PIL import Image, ImageDraw
S=512; K=(20,20,20,255); W=(255,255,255,255)
def base(): 
    im=Image.new("RGBA",(S,S),(0,0,0,0)); return im, ImageDraw.Draw(im)
def eyes(d,kind="dot",y=200):
    for cx in (175,337):
        if kind=="dot": d.ellipse([cx-24,y-38,cx+24,y+38],fill=K); d.ellipse([cx-10,y-28,cx+4,y-12],fill=W)
        if kind=="wide": d.ellipse([cx-42,y-48,cx+42,y+48],fill=W,outline=K,width=10); d.ellipse([cx-16,y-16,cx+16,y+16],fill=K)
        if kind=="happy": d.arc([cx-38,y-30,cx+38,y+40],200,340,fill=K,width=16)
        if kind=="sad": d.ellipse([cx-22,y-30,cx+22,y+38],fill=K); d.ellipse([cx-9,y-20,cx+3,y-8],fill=W)
        if kind=="half": d.ellipse([cx-24,y-30,cx+24,y+38],fill=K); d.rectangle([cx-30,y-40,cx+30,y],fill=(0,0,0,0)); d.line([cx-30,y,cx+30,y],fill=K,width=10)
def brows(d,kind,y=130):
    if kind=="sad": d.line([130,y+10,215,y-15],fill=K,width=14); d.line([297,y-15,382,y+10],fill=K,width=14)
    if kind=="angry": d.line([130,y-15,215,y+15],fill=K,width=14); d.line([297,y+15,382,y-15],fill=K,width=14)
    if kind=="up": d.arc([130,y-40,220,y+10],200,340,fill=K,width=12); d.arc([292,y-40,382,y+10],200,340,fill=K,width=12)
faces={}
im,d=base(); eyes(d); d.arc([176,250,336,370],20,160,fill=K,width=16); faces["smile"]=im
im,d=base(); eyes(d,"happy"); d.chord([166,260,346,420],0,180,fill=K); d.chord([206,350,306,415],0,180,fill=(230,90,100,255)); faces["grin"]=im
im,d=base(); eyes(d,"wide"); brows(d,"up",110); d.ellipse([216,300,296,400],fill=K); faces["shock"]=im
im,d=base(); eyes(d,"sad"); brows(d,"sad"); d.arc([186,320,326,420],200,340,fill=K,width=16); faces["sad"]=im
im,d=base(); eyes(d,"half"); d.arc([200,250,350,350],20,120,fill=K,width=16); faces["smirk"]=im
im,d=base(); eyes(d,"dot"); d.line([196,330,316,330],fill=K,width=16); faces["neutral"]=im
im,d=base(); eyes(d,"wide"); brows(d,"sad",115); d.line([196,350,226,330,256,350,286,330,316,350],fill=K,width=12,joint="curve"); faces["worried"]=im
for k,v in faces.items(): v.save(f"faces/{k}.png")
# preview
sheet=Image.new("RGBA",(S*len(faces),S),(232,190,120,255))
for i,v in enumerate(faces.values()): sheet.alpha_composite(v,(i*S,0))
sheet.convert("RGB").resize((S*len(faces)//4,S//4)).save("faces_preview.png")
