"""Import an owner-supplied hair model (owner 2026-11-27: OBJ + MTL + diffuse PNG, e.g. Roblox hair accessories) into engine/hairs/.
  python3 tools/import_hair.py <name> <model.obj> [texture.png]  [ROT=180 SCALE=1 OFF=0,0,0 TINT=1]
DIR=accessories imports into engine/accessories (used as outfit items). PARTS=largest keeps only the biggest part, PARTS=rest everything except it (e.g. the glasses baked into a hair); SKIP_PARTS=i,j drops individual parts (indices are printed). PARTS=largest drops extra parts baked into the accessory (glasses, clips). Then use it like any other style: makeAvatar({ hair: '<name>', hairCol: … }).
- Geometry: vertices welded, smooth normals recomputed, re-centred like a Roblox head accessory (the head is 1.2 studs; ours is R 0.62, top y 0.61).
  Very low-poly meshes (< 3000 triangles) get one Loop-style midpoint subdivision + smoothing so silhouettes stay round in close-ups.
- Texture: maps under 1024 px are upscaled to 1024 seamlessly (tiled 3×3 → LANCZOS → centre crop) and, with TINT=1 (default), turned into a
  neutral luminance detail map around 0.8 so `hairCol` tints it per character. TINT=0 keeps the original colours (fixed-colour hair).
  A flat one-colour texture (or UVs collapsed onto one texel) gets cylindrical UVs + a generated strand texture (STRANDS=0 turns that off).
- Fit: ROT (degrees about y; Roblox faces −Z, ours +Z, so 180 by default), SCALE and OFF are stored in engine/hairs/index.json and applied at load
  (edit the JSON and re-render with tools/hair_lineup.py to adjust — no re-import needed)."""
import sys, os, json, re
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); HD = os.path.join(ROOT, "engine", os.environ.get("DIR", "hairs")); os.makedirs(HD, exist_ok=True)
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
# split into connected parts (by shared position). Parts whose UVs collapse to one point are inverted-hull OUTLINE shells (Roblox toon hair ships one
# per part, slightly larger, meant to render back faces in near-black) -> written as `o outline` and drawn as a dark rim by the engine.
# PARTS=largest keeps only the biggest real part (+ its outline): drops glasses, clips, hats baked into the hair accessory.
par = list(range(len(P))); kpos = {}
def find(i):
    while par[i] != i: par[i] = par[par[i]]; i = par[i]
    return i
for i, p_ in enumerate(P):
    k = tuple(np.round(p_, 4))
    if k in kpos: par[find(i)] = find(kpos[k])
    else: kpos[k] = i
for a_, b_, c_ in T: par[find(b_)] = find(a_); par[find(c_)] = find(a_)
comp = {}
for ti, t in enumerate(T): comp.setdefault(find(t[0]), []).append(ti)
is_ol = {r: np.ptp(UV[np.unique(T[ts])], 0).max() < 1e-3 for r, ts in comp.items()}
real = sorted([r for r in comp if not is_ol[r]], key=lambda r: -len(comp[r]))
for i_, r in enumerate(real): q_ = P[np.unique(T[comp[r]])]; print(f"  part {i_}: {len(comp[r])} tris, x {q_[:,0].min():.2f}..{q_[:,0].max():.2f} y {q_[:,1].min():.2f}..{q_[:,1].max():.2f} z {q_[:,2].min():.2f}..{q_[:,2].max():.2f}")
PM = os.environ.get("PARTS", "all"); keep = set(real[:1]) if PM == "largest" else set(real[1:]) if PM == "rest" else set(real)
keep -= {real[int(i_)] for i_ in os.environ.get("SKIP_PARTS", "").split(",") if i_.strip()}   # SKIP_PARTS=8,9: drop parts by the index printed above
# an outline shell belongs to a kept part when it has the same triangle count and (almost) the same centre
cen = {r: P[np.unique(T[ts])].mean(0) for r, ts in comp.items()}
keep |= {r for r in comp if is_ol[r] and any(len(comp[r]) == len(comp[k]) and np.linalg.norm(cen[r] - cen[k]) < 0.05 for k in keep)}
OL = [ti for r in comp if r in keep and is_ol[r] for ti in comp[r]]; MAIN = [ti for r in comp if r in keep and not is_ol[r] for ti in comp[r]]
dropped = len(T) - len(OL) - len(MAIN); T_ol = T[OL] if OL else np.zeros((0, 3), int); T = T[MAIN]
print(f"parts: {len(real)} real, {sum(is_ol.values())} outline shells; kept {len(MAIN)} + {len(OL)} outline tris, dropped {dropped}")
if len(T) < 3000 and os.environ.get("SUBDIV", "1") != "0" and not len(T_ol): P, UV, T = subdivide(P, UV, T)
used_v = np.unique(np.concatenate([T.ravel(), T_ol.ravel()])); c = (P[used_v].min(0) + P[used_v].max(0)) / 2; c[1] = 0
if os.environ.get("NOCENTER"): c[:] = 0   # keep the source coordinates (e.g. glasses taken out of a hair keep their place relative to it)
P = P - c   # centre in x/z (Roblox exports are already centred on the accessory)
with open(os.path.join(HD, name + ".obj"), "w") as f:
    f.write(f"# {name}: imported from {os.path.basename(obj)} by tools/import_hair.py ({len(T)} triangles)\n")
    f.writelines(f"v {x:.5f} {y:.5f} {z:.5f}\n" for x, y, z in P); f.writelines(f"vt {u:.5f} {v:.5f}\n" for u, v in UV)
    f.write("o hair\n"); f.writelines(f"f {a+1}/{a+1} {b+1}/{b+1} {c_+1}/{c_+1}\n" for a, b, c_ in T)
    if len(T_ol): f.write("o outline\n"); f.writelines(f"f {a+1}/{a+1} {b+1}/{b+1} {c_+1}/{c_+1}\n" for a, b, c_ in T_ol)
tint = os.environ.get("TINT", "1") != "0"; texname = None
# flat texture (one colour) or UVs collapsed onto a single texel: there is no strand detail to keep, so give the model cylindrical UVs
# (u around the head, v down it) and a generated strand texture, so it shades like real hair instead of a plastic shell
if tex:
    _a = np.array(Image.open(tex).convert("RGB")).astype(np.float32); _uvs = np.ptp(UV, 0).max() * max(_a.shape[:2])
    if (_a.std() < 2.0 or _uvs < 2.0) and os.environ.get("STRANDS", "1") != "0":
        UV = np.stack([(np.arctan2(P[:, 0], P[:, 2]) / (2 * np.pi) + 0.5) * 6.0, (P[:, 1] - P[:, 1].min()) / np.ptp(P[:, 1])], 1)
        R_ = np.random.default_rng(7); n = 1024; cols = np.zeros(n)
        for w in (1, 2, 4, 9): cols += np.repeat(R_.normal(0, 1, n // w + 2), w)[:n] / w ** 0.3   # strands of several widths
        cols = (cols - cols.mean()) / cols.std(); yy = np.linspace(0, 1, n)[:, None]
        L = 0.82 + 0.035 * cols[None, :]   # soft fine strands (no gradient, no noise -> no seam, no shimmer)
        img = np.clip(L, 0.45, 1.0)[..., None].repeat(3, 2) * 255
        tex = os.path.join(HD, name + "_strands_src.png"); Image.fromarray(img.astype(np.uint8)).save(tex); print("flat/collapsed texture -> cylindrical UVs + generated strand texture")
if tex:
    im = Image.open(tex).convert("RGBA"); a = np.array(im).astype(np.float32)
    uvpx = [(min(im.size[0] - 1, int(u % 1 * im.size[0])), min(im.size[1] - 1, int((1 - v % 1) * im.size[1]))) for u, v in UV]   # texels the model actually uses (atlases hold other parts too)
    if min(im.size) < 1024:   # seamless upscale to 1024: tile 3x3, resize, crop the middle tile, light unsharp mask
        n = 1024; big = Image.fromarray(np.tile(a, (3, 3, 1)).clip(0, 255).astype(np.uint8)).resize((3 * n, 3 * n), Image.LANCZOS)
        from PIL import ImageFilter
        big = big.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2)); sc = n / im.size[0]; uvpx = [(int(x * sc), int(y * sc)) for x, y in uvpx]
        a = np.array(big).astype(np.float32)[n:2 * n, n:2 * n]
    if tint and not tex.endswith("_strands_src.png"):   # (the generated strand texture is already a luminance map: don't stretch its contrast)
        L = a[..., :3].mean(-1); used = np.array([L[y, x] for x, y in uvpx]); m0, s = np.median(used), used.std() + 1e-3   # normalise on the texels the hair uses
        d = np.clip(0.8 + (L - m0) / s * 0.1, 0.45, 1.0) * 255
        a[..., :3] = d[..., None]
    texname = name + ".png"; Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(os.path.join(HD, texname))
    if tex.endswith("_strands_src.png"):
        os.remove(tex); src = open(os.path.join(HD, name + ".obj")).read().split("\n"); it = iter(UV)
        open(os.path.join(HD, name + ".obj"), "w").write("\n".join((lambda u: f"vt {u[0]:.5f} {u[1]:.5f}")(next(it)) if l.startswith("vt ") else l for l in src))
idx_p = os.path.join(HD, "index.json"); idx = json.load(open(idx_p)) if os.path.exists(idx_p) else {}
old = idx.get(name, {})
idx[name] = {"obj": name + ".obj", "tex": texname, "tint": tint, "rot": float(os.environ.get("ROT", old.get("rot", 180))),
             "scale": (lambda v: [float(x) for x in v.split(",")] if "," in v else float(v))(os.environ.get("SCALE", ",".join(map(str, old["scale"])) if isinstance(old.get("scale"), list) else str(old.get("scale", 1.0)))), "off": [float(x) for x in os.environ.get("OFF", ",".join(map(str, old.get("off", [0, 0, 0])))).split(",")],
             "source": os.path.basename(obj)}
idx[name]["outline"] = bool(len(T_ol)); idx[name]["note"] = old.get("note", "")
json.dump(idx, open(idx_p, "w"), indent=1); print(name, f"{len(T)} tris", "bounds", P.min(0).round(3), P.max(0).round(3), "tex", texname, "->", idx_p)
