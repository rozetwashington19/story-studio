"""Overlays: one-word pop captions (70% height), wrapped speech bubbles and the hook title card. Loaded per episode.
hook.json (optional, owner request 2026-11-21 "win the first 3-4 seconds"): {"title": ["ELEVEN CANDLES.", "ONE GIANT DRAGON."], "arrow": [x, y, angle_deg]}
  -> a bold yellow/black title punches in at the top of the frame on frame 0 and stays for the whole hook shot (line 1);
     optional red arrow (tip at x, y in 0-1 frame coords, angle = direction it points, 90 = down) bobs toward the thing to look at.
vote.json (optional, choose-your-path series, owner request 2026-11-22):
  {"badge": "PART 1 / 5", "from": 44, "a": "STAY IN THE BUNKER", "b": "RUN TO YOUR MOM", "title": ["FOLLOW FOR", "PART 2"]}
  -> a small "PART 1 / 5" tag in the top-left corner for the whole video; from script line `from` (default: the last line) a red "A" and a
     green "B" choice box slide in at ~42% height, and `title` (omit it on the finale) punches in above them once both boxes are in."""
import json, os, re
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1080, 1920
FONT_DIR = "/usr/share/fonts/opentype/inter/"
BUB = ImageFont.truetype(FONT_DIR + "Inter-SemiBoldItalic.otf", 70)
def ease(x): return x * x * (3 - 2 * x)

class Episode:
    def __init__(self, ep):
        self.timing = json.load(open(os.path.join(ep, "out/timing.json")))
        self.total = self.timing[-1]["end"] + 2.0
        bp = os.path.join(ep, "bubbles.json")
        self.bubbles = {int(k): v for k, v in json.load(open(bp)).items()} if os.path.exists(bp) else {}
        hp = os.path.join(ep, "hook.json"); self.hook = json.load(open(hp)) if os.path.exists(hp) else None
        vp = os.path.join(ep, "vote.json"); self.vote = json.load(open(vp)) if os.path.exists(vp) else None
        self.spans = []
        for i, t in enumerate(self.timing):
            st = 0.0 if i == 0 else t["start"]; en = self.timing[i + 1]["start"] if i + 1 < len(self.timing) else self.total
            self.spans.append((st, en))
        self.words = []
        for t in self.timing:
            ws = t["line"].replace('"', '').split(); wt = [len(re.sub(r"[^\w']", "", w)) + 2.5 for w in ws]; tot = sum(wt); cur = t["start"]
            for w, k in zip(ws, wt):
                d = (t["end"] - t["start"]) * k / tot; self.words.append((cur, cur + d, re.sub(r"[.,!?;:]+$", "", w))); cur += d
    def shot_at(self, t):
        for k, (s, e) in enumerate(self.spans):
            if s <= t < e or k == len(self.spans) - 1: return k, t - s, e - s
    def overlay(self, fr, t, i):
        fr = fr.convert("RGBA"); s = self.spans[i][0]
        if i == 0 and self.hook:
            e = self.spans[0][1]; age, left = t - s, e - t
            if self.hook.get("arrow"): ax, ay, ang = self.hook["arrow"]; arrow_on(fr, ax * W, ay * H, ang, age)
            tl = title_layer(self.hook["title"], age); fade = min(1.0, max(0.0, left / 0.18))
            if fade < 1: tl.putalpha(tl.getchannel("A").point(lambda v: int(v * fade)))
            fr.alpha_composite(tl, (int(W / 2 - tl.width / 2), int(H * 0.085)))
        if self.vote:
            if self.vote.get("badge"): b = badge_layer(self.vote["badge"]); fr.alpha_composite(b, (36, 40))
            vf = int(self.vote.get("from", len(self.spans))) - 1
            if i >= vf and self.vote.get("a"):
                age = t - self.spans[vf][0]
                for k, key in enumerate(("a", "b")):
                    a = ease(min(1.0, max(0.0, (age - 0.25 * k) / 0.3)))
                    if a <= 0: continue
                    cl = choice_layer(key.upper(), self.vote[key], k); cl.putalpha(cl.getchannel("A").point(lambda v: int(v * a)))
                    fr.alpha_composite(cl, (int(W / 2 - cl.width / 2 + (1 - a) * (-140 if k == 0 else 140)), int(H * 0.40 + k * 150)))
                if self.vote.get("title") and age > 0.6:
                    tl = title_layer(self.vote["title"], age - 0.6, size=100); fr.alpha_composite(tl, (int(W / 2 - tl.width / 2), int(H * 0.40 - tl.height - 10)))
        if (i + 1) in self.bubbles:
            txt, bx, by = self.bubbles[i + 1]; bl = bubble_layer(txt, t - s)
            fr.alpha_composite(bl, (int(W * bx - bl.width / 2), int(H * by)))
        cur = [w for w in self.words if w[0] <= t < w[1]] or [w for w in self.words if w[1] <= t and t - w[1] < 0.15][-1:]
        if cur:
            ws, we, wd = cur[0]; cl = caption_layer(wd, t - ws)
            fr.alpha_composite(cl, (int(W / 2 - cl.width / 2), int(H * 0.7 - cl.height / 2)))
        return fr.convert("RGB")

def caption_layer(word, age):
    sc = 1.0 + 0.25 * max(0, 1 - age / 0.1)
    font = ImageFont.truetype(FONT_DIR + "Inter-Black.otf", int(104 * sc))
    tw = font.getbbox(word, stroke_width=12); w, h = tw[2] - tw[0], tw[3] - tw[1]
    lay = Image.new("RGBA", (w + 60, h + 60), (0, 0, 0, 0)); sh = Image.new("RGBA", lay.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((30 - tw[0] + 4, 30 - tw[1] + 8), word, font=font, fill=(0, 0, 0, 150), stroke_width=12, stroke_fill=(0, 0, 0, 150))
    lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    ImageDraw.Draw(lay).text((30 - tw[0], 30 - tw[1]), word, font=font, fill=(255, 255, 255, 255), stroke_width=12, stroke_fill=(15, 15, 20, 255))
    return lay

def wrap(text, maxw=760):
    out, line = [], ""
    for w in text.split():
        tl = (line + " " + w).strip()
        if BUB.getlength(tl) > maxw and line: out.append(line); line = w
        else: line = tl
    out.append(line); return out

def bubble_layer(text, age):
    a = min(1, age / 0.12); sc = 0.85 + 0.15 * ease(a)
    lines = wrap(text); lh = 84; tw = max(BUB.getlength(l) for l in lines); bw, bh = int(tw) + 90, lh * len(lines) + 50
    lay = Image.new("RGBA", (bw + 40, bh + 80), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.rounded_rectangle([24, 24, 24 + bw, 24 + bh], radius=44, fill=(0, 0, 0, 60))
    d.rounded_rectangle([20, 16, 20 + bw, 16 + bh], radius=44, fill=(250, 248, 240, 255))
    cx = 20 + bw // 2; d.polygon([(cx - 26, 16 + bh - 2), (cx + 26, 16 + bh - 2), (cx, 16 + bh + 40)], fill=(250, 248, 240, 255))
    for k, l in enumerate(lines): d.text((20 + bw / 2, 16 + 25 + k * lh + lh / 2), l, font=BUB, fill=(35, 35, 45, 255), anchor="mm")
    if sc != 1: lay = lay.resize((int(lay.width * sc), int(lay.height * sc)), Image.LANCZOS)
    if a < 1: lay.putalpha(lay.getchannel("A").point(lambda v: int(v * a)))
    return lay

TITLE = FONT_DIR + "Inter-Black.otf"
def title_layer(lines, age, size=112, fill=(255, 214, 0, 255), maxw=0.8):
    """Big two-line hook title: yellow Inter Black, thick dark stroke + drop shadow; punches in (1.15x -> 1x in 0.16 s), always inside the frame."""
    if isinstance(lines, str): lines = [lines]
    font = ImageFont.truetype(TITLE, size)
    while max(font.getlength(l) for l in lines) > W * maxw and size > 60: size -= 6; font = ImageFont.truetype(TITLE, size)
    lh = int(size * 1.12); bw = int(max(font.getlength(l) for l in lines)) + 80; bh = lh * len(lines) + 70
    lay = Image.new("RGBA", (bw, bh), (0, 0, 0, 0)); sh = Image.new("RGBA", lay.size, (0, 0, 0, 0))
    for k, l in enumerate(lines):
        ImageDraw.Draw(sh).text((bw / 2 + 6, 35 + k * lh + lh / 2 + 10), l, font=font, fill=(0, 0, 0, 170), anchor="mm", stroke_width=16, stroke_fill=(0, 0, 0, 170))
    lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    d = ImageDraw.Draw(lay)
    for k, l in enumerate(lines):
        d.text((bw / 2, 35 + k * lh + lh / 2), l, font=font, fill=fill if k == len(lines) - 1 else (255, 255, 255, 255), anchor="mm", stroke_width=14, stroke_fill=(12, 10, 16, 255))
    sc = 1.0 + 0.15 * max(0.0, 1 - age / 0.16)
    if sc != 1: lay = lay.resize((int(bw * sc), int(bh * sc)), Image.LANCZOS)
    return lay

def arrow_on(fr, x, y, ang, age, col=(235, 30, 40, 255), size=150):
    """Red scroll-stopping arrow, tip at (x, y), pointing along ang (deg, 0 = right, 90 = down); bobs toward the tip."""
    import math
    a = math.radians(ang); bob = 18 * abs(math.sin(age * 7)); ux, uy = math.cos(a), math.sin(a); px, py = -uy, ux
    tx, ty = x - ux * bob, y - uy * bob
    pts = [(0, 0), (-0.55, 0.42), (-0.55, 0.16), (-1.25, 0.16), (-1.25, -0.16), (-0.55, -0.16), (-0.55, -0.42)]
    poly = [(tx + (u * ux + v * px) * size, ty + (u * uy + v * py) * size) for u, v in pts]
    lay = Image.new("RGBA", fr.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.polygon([(p[0] + 6, p[1] + 8) for p in poly], fill=(0, 0, 0, 120)); lay = lay.filter(ImageFilter.GaussianBlur(5)); d = ImageDraw.Draw(lay)
    d.polygon(poly, fill=col, outline=(255, 255, 255, 255), width=8)
    fr.alpha_composite(lay)

def badge_layer(text):
    font = ImageFont.truetype(TITLE, 44); tw = int(font.getlength(text)); lay = Image.new("RGBA", (tw + 56, 80), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.rounded_rectangle([0, 0, tw + 52, 74], radius=16, fill=(15, 15, 20, 190)); d.rounded_rectangle([0, 0, 14, 74], radius=6, fill=(235, 40, 50, 255))
    d.text((34, 37), text, font=font, fill=(255, 255, 255, 255), anchor="lm"); return lay

def choice_layer(letter, text, k):
    """Vote option box: dark panel with a coloured border (A red, B green) and a letter tab."""
    col = (230, 45, 55, 255) if k == 0 else (40, 190, 90, 255)
    font = ImageFont.truetype(TITLE, 58); size = 58
    while font.getlength(text) > W * 0.62 and size > 36: size -= 4; font = ImageFont.truetype(TITLE, size)
    bw, bh = int(W * 0.84), 124; lay = Image.new("RGBA", (bw + 20, bh + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.rounded_rectangle([8, 12, bw + 8, bh + 12], radius=22, fill=(0, 0, 0, 110))
    d.rounded_rectangle([0, 0, bw, bh], radius=22, fill=(18, 18, 24, 235), outline=col, width=8)
    d.rounded_rectangle([18, 18, 18 + bh - 36, bh - 18], radius=14, fill=col)
    d.text((18 + (bh - 36) / 2, bh / 2), letter, font=ImageFont.truetype(TITLE, 64), fill=(255, 255, 255, 255), anchor="mm")
    d.text((bh + 16, bh / 2), text, font=font, fill=(255, 255, 255, 255), anchor="lm"); return lay
