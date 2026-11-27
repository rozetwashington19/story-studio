"""Import an owner-supplied hair model (owner 2026-11-27: OBJ + MTL + diffuse PNG, e.g. Roblox hair accessories) into engine/hairs/.
  python3 tools/import_hair.py <name> <model.obj> [texture.png]  [ROT=180 SCALE=1 OFF=0,0,0 TINT=1]
Then use it like any other style: makeAvatar({ hair: '<name>', hairCol: … }).
- Geometry: vertices welded, smooth normals recomputed, re-centred like a Roblox head accessory (the head is 1.2 studs; ours is R 0.62, top y 0.61).
  Very low-poly meshes (< 3000 triangles) get one Loop-style midpoint subdivision + smoothing so silhouettes stay round in close-ups.
- Texture: low-res maps (< 512 px) are upscaled to 1024 seamlessly (tiled 3×3 → LANCZOS → centre crop) and, with TINT=1 (default), turned into a
  neutral luminance detail map around 0.8 so `hairCol` tints it per character. TINT=0 keeps the original colours (fixed-colour hair).
- Fit: ROT (degrees about y; Roblox faces −Z, ours +Z, so 180 by default), SCALE and OFF are stored in engine/hairs/index.json and applied at load
  (edit the JSON and re-render with tools/hair_lineup.py to adjust — no re-import needed)."""
import sys, os, json, re
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); HD = os.path.join(ROOT, "engine/hairs"); os.makedirs(HD, exist_ok=True)
name, obj = sys.argv[1], sys.argv[2]; tex = sys.argv[3] if len(sys.argv) > 3 else None
V, VT, F = [], [], []
for l in open(obj, errors="ignore"):
    p = l.split()
    if not p: continue
    if p[0] == "v": V.append([float(x) for x in p[1:4]])
    elif p[0] == "vt": VT.append([float(x) for x in p[1:3]])
    elif p[0] == "f":
        idx = [[int(k) if k else 0 for k in (c.split("/") + ["", ""])[:2]] for c in p[1:]]
        for i in range(1, len(idx) - 1): F.append([idx[0], idx[i], idx[i + 1]])
V = np.array(V, np.float64); VT = np.array(VT if VT else [[0, 0]], np.float64); F = np.array(F)   # F[t, corner] = (v, vt) 1-based
# weld by (position, uv): keeps UV seams, merges the duplicated corners Roblox exports
keys = {}; P, UV, T = [], [], []
for tri in F:
    t = []
    for v, vt in tri:
        k = (tuple(np.round(V[v - 1], 5)), tuple(np.round(VT[vt - 1], 5)) if vt else (0, 0))
        if k not in keys: keys[k] = len(P); P.append(V[v - 1]); UV.append(VT[vt - 1] if vt else [0, 0])
        t.append(keys[k])
    if len(set(t)) == 3: T.append(t)
P = np.array(P); UV = np.array(UV); T = np.array(T)
def subdivide(P, UV, T):   # midpoint split (each triangle -> 4) + one Laplacian smoothing pass over positions that share a location
    edge = {}; P2, UV2 = list(P), list(UV); out = []
    def mid(a, b):
        k = (min(a, b), max(a, b))
        if k not in edge: edge[k] = len(P2); P2.append((P[a] + P[b]) / 2); UV2.append((UV[a] + UV[b]) / 2)
        return edge[k]
    for a, b, c in T: ab, bc, ca = mid(a, b), mid(b, c), mid(c, a); out += [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]]
    P2 = np.array(P2); T2 = np.array(out)
    loc = {}; [loc.setdefault(tuple(np.round(p, 5)), []).append(i) for i, p in enumerate(P2)]   # positions shared across UV seams move together
    nb = {}; [nb.setdefault(tuple(np.round(P2[i], 5)), set()).update(tuple(np.round(P2[j], 5)) for j in tri if j != i) for tri in T2 for i in tri]
    newp = {k: 0.5 * np.array(k) + 0.5 * np.mean([np.array(n) for n in v], axis=0) for k, v in nb.items()}
    return np.array([newp[tuple(np.round(p, 5))] for p in P2]), np.array(UV2), T2
if len(T) < 3000 and os.environ.get("SUBDIV", "1") != "0": P, UV, T = subdivide(P, UV, T)
c = (P.min(0) + P.max(0)) / 2; c[1] = 0; P = P - c   # centre in x/z (Roblox exports are already centred on the accessory)
with open(os.path.join(HD, name + ".obj"), "w") as f:
    f.write(f"# {name}: imported from {os.path.basename(obj)} by tools/import_hair.py ({len(T)} triangles)\n")
    f.writelines(f"v {x:.5f} {y:.5f} {z:.5f}\n" for x, y, z in P); f.writelines(f"vt {u:.5f} {v:.5f}\n" for u, v in UV)
    f.writelines(f"f {a+1}/{a+1} {b+1}/{b+1} {c_+1}/{c_+1}\n" for a, b, c_ in T)
tint = os.environ.get("TINT", "1") != "0"; texname = None
if tex:
    im = Image.open(tex).convert("RGBA"); a = np.array(im).astype(np.float32)
    if min(im.size) < 512:   # seamless upscale: tile 3x3, resize, crop the middle tile
        n = 1024; big = Image.fromarray(np.tile(a, (3, 3, 1)).clip(0, 255).astype(np.uint8)).resize((3 * n, 3 * n), Image.LANCZOS)
        a = np.array(big).astype(np.float32)[n:2 * n, n:2 * n]
    if tint:
        L = a[..., :3].mean(-1); s = L.std() + 1e-3; d = np.clip(0.8 + (L - L.mean()) / s * 0.1, 0.45, 1.0) * 255
        a[..., :3] = d[..., None]
    texname = name + ".png"; Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(os.path.join(HD, texname))
idx_p = os.path.join(HD, "index.json"); idx = json.load(open(idx_p)) if os.path.exists(idx_p) else {}
old = idx.get(name, {})
idx[name] = {"obj": name + ".obj", "tex": texname, "tint": tint, "rot": float(os.environ.get("ROT", old.get("rot", 180))),
             "scale": float(os.environ.get("SCALE", old.get("scale", 1.0))), "off": [float(x) for x in os.environ.get("OFF", ",".join(map(str, old.get("off", [0, 0, 0])))).split(",")],
             "source": os.path.basename(obj)}
json.dump(idx, open(idx_p, "w"), indent=1); print(name, f"{len(T)} tris", "bounds", P.min(0).round(3), P.max(0).round(3), "tex", texname, "->", idx_p)
