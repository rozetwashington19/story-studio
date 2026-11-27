"""Import owner-supplied face images into engine/faces (owner 2026-11-27: "add these faces moving forward").
  python3 tools/import_faces.py name=path.png [name=path.png …]     [SCALE=0.92 DY=-14]
Any size, transparent background (a plain white background is keyed out). Output: engine/faces/<name>.png, 512×512 RGBA, upscaled with
LANCZOS (low-res sources are first rebuilt with crisp edges by enhance(); ENHANCE=0 turns that off) and placed like the hand-drawn faces (eyes ≈ y 200, mouth ≈ y 330). Check with tools/face_lineup.py."""
import sys, os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); S = float(os.environ.get("SCALE", "0.92")); DY = int(os.environ.get("DY", "-14"))
def enhance(im, big=2048):
    """Low-res line art -> crisp: upscale to 2048 (premultiplied, bicubic), smooth the stair-steps, then re-harden the alpha edge and the black/white
    boundaries with a steep curve, so the downsample to 512 has clean anti-aliased lines instead of blur. Flat mid-tones (grey shading, pink, blue) are kept."""
    from scipy import ndimage as ndi
    a = np.array(im).astype(np.float32) / 255; a[..., :3] *= a[..., 3:4]; z = big / a.shape[0]
    up = np.stack([ndi.gaussian_filter(ndi.zoom(a[..., k], z, order=3), z * 0.45) for k in range(4)], -1).clip(0, 1)
    al = up[..., 3]; rgb = (up[..., :3] / np.maximum(al[..., None], 1e-4)).clip(0, 1)
    hard = lambda x, k: np.clip((x - 0.5) * k + 0.5, 0, 1)
    lum = rgb.mean(-1); sat = rgb.max(-1) - rgb.min(-1)
    contrast = ndi.maximum_filter(lum, 17) - ndi.minimum_filter(lum, 17)      # ink next to white fill -> high; flat grey areas -> low
    w = (np.clip(1 - sat * 4, 0, 1) * np.clip((contrast - 0.45) * 4, 0, 1))[..., None]
    rgb = rgb * (1 - w) + hard(rgb, 3.0) * w
    k = int(z * 1.3) | 1; lo, hi = ndi.minimum_filter(al, k), ndi.maximum_filter(al, k); rng_ = np.maximum(hi - lo, 1e-3)   # harden each edge between its own local levels,
    al2 = np.where(hi - lo > 0.15, lo + rng_ * hard((al - lo) / rng_, 3.5), al)                                              # so flat semi-transparent shading survives
    out = np.concatenate([rgb, al2[..., None]], -1)
    return Image.fromarray((out * 255).round().astype(np.uint8), "RGBA")
for arg in sys.argv[1:]:
    name, path = arg.split("=", 1); im = Image.open(path).convert("RGBA"); a = np.array(im)
    if a[..., 3].min() > 250:   # opaque: key out white
        w = a[..., :3].min(axis=2).astype(int); a[..., 3] = np.clip((255 - w) * 6, 0, 255).astype(np.uint8); im = Image.fromarray(a)
    if min(im.size) < 480 and os.environ.get("ENHANCE", "1") != "0": im = enhance(im)   # low-res source: rebuild crisp edges
    n = int(512 * S); im = im.resize((n, n), Image.LANCZOS); out = Image.new("RGBA", (512, 512), (0, 0, 0, 0)); out.alpha_composite(im, ((512 - n) // 2, (512 - n) // 2 + DY))
    out.save(os.path.join(ROOT, "engine/faces", name + ".png")); print(name, "<-", os.path.basename(path), out.getbbox())
