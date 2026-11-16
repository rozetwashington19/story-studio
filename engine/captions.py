"""Overlays: one-word pop captions (60% height) and wrapped speech bubbles. Loaded per episode."""
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
        if (i + 1) in self.bubbles:
            txt, bx, by = self.bubbles[i + 1]; bl = bubble_layer(txt, t - s)
            fr.alpha_composite(bl, (int(W * bx - bl.width / 2), int(H * by)))
        cur = [w for w in self.words if w[0] <= t < w[1]] or [w for w in self.words if w[1] <= t and t - w[1] < 0.15][-1:]
        if cur:
            ws, we, wd = cur[0]; cl = caption_layer(wd, t - ws)
            fr.alpha_composite(cl, (int(W / 2 - cl.width / 2), int(H * 0.6 - cl.height / 2)))
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
