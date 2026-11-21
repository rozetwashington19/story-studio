"""Custom Shorts thumbnail (owner request 2026-11-21, "make custom thumbnails"): out/thumbnail.jpg, 1080x1920.
  python3 engine/render.py episodes/NNN-slug thumb        # renders the clean frame (no captions) + composes the thumbnail
thumb.json in the episode folder:
  {"line": 32, "at": 0.6,                       # which shot + fraction of it to grab (pick the most dramatic, readable frame)
   "title": ["SHE FORGOT", "TO WISH"],          # 2-4 BIG words in 1-2 lines (last line yellow); curiosity, not a summary
   "pos": "top" | "bottom",                     # where the title goes (keep it off the faces)
   "arrow": [x, y, angle],                      # optional red arrow, tip at x,y (0-1 frame coords), angle deg (0 right, 90 down)
   "circle": [x, y, r],                         # optional red ring around the thing to look at (r in 0-1 of width)
   "emoji": ["😱", x, y, size],                  # optional emoji sticker (Noto Color Emoji)
   "zoom": 1.15, "focus": [x, y]}               # optional punch-in crop centred on focus (0-1) — faces should fill the frame
Rules: one clear subject, a face showing a strong emotion, high contrast, nothing important in the bottom 20 % (YouTube UI)."""
import json, os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from captions import title_layer, arrow_on
W, H = 1080, 1920
EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

def compose(raw_path, cfg, out_path):
    im = Image.open(raw_path).convert("RGB").resize((W, H), Image.LANCZOS)
    z = cfg.get("zoom", 1.0)
    if z > 1:
        fx, fy = cfg.get("focus", [0.5, 0.45]); cw, ch = W / z, H / z
        x0 = min(max(0, fx * W - cw / 2), W - cw); y0 = min(max(0, fy * H - ch / 2), H - ch)
        im = im.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.LANCZOS)
    im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.18)
    fr = im.convert("RGBA")
    # darken the title band a little so the text pops on any background
    top = cfg.get("pos", "top") == "top"; band = Image.new("L", (W, H), 0); bd = ImageDraw.Draw(band)
    for y in range(H):
        k = (1 - y / (H * 0.38)) if top else (y - H * 0.55) / (H * 0.25)
        if 0 < k: bd.line([(0, y), (W, y)], fill=int(150 * min(1, k)))
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 255)); shade.putalpha(band); fr.alpha_composite(shade)
    if cfg.get("circle"):
        cx, cy, r = cfg["circle"]; lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay); R = r * W
        d.ellipse([cx * W - R + 5, cy * H - R + 7, cx * W + R + 5, cy * H + R + 7], outline=(0, 0, 0, 140), width=18)
        lay = lay.filter(ImageFilter.GaussianBlur(4)); d = ImageDraw.Draw(lay)
        d.ellipse([cx * W - R, cy * H - R, cx * W + R, cy * H + R], outline=(235, 30, 40, 255), width=16); fr.alpha_composite(lay)
    if cfg.get("arrow"):
        ax, ay, ang = cfg["arrow"]; arrow_on(fr, ax * W, ay * H, ang, 0.0, size=200)
    if cfg.get("emoji"):
        e, ex, ey, es = cfg["emoji"]
        try:
            f = ImageFont.truetype(EMOJI, 109); t = Image.new("RGBA", (160, 160), (0, 0, 0, 0)); ImageDraw.Draw(t).text((80, 80), e, font=f, embedded_color=True, anchor="mm")
            t = t.resize((int(es * W), int(es * W)), Image.LANCZOS).rotate(-12, expand=True, resample=Image.BICUBIC)
            fr.alpha_composite(t, (int(ex * W - t.width / 2), int(ey * H - t.height / 2)))
        except Exception as ex_:
            print("emoji skipped:", ex_)
    tl = title_layer(cfg["title"], 1.0, size=cfg.get("size", 150), maxw=0.86)
    fr.alpha_composite(tl, (int(W / 2 - tl.width / 2), int(H * 0.06) if top else int(H * 0.78 - tl.height)))
    fr.convert("RGB").save(out_path, quality=92); return out_path

if __name__ == "__main__":
    import sys
    ep = sys.argv[1]; cfg = json.load(open(os.path.join(ep, "thumb.json")))
    print("thumbnail ->", compose(os.path.join(ep, "out", "thumb_raw.png"), cfg, os.path.join(ep, "out", "thumbnail.jpg")))
