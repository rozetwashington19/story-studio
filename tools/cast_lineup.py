"""Cast lineup: render an episode's whole cast side by side (front + 3/4 view) with name labels, to check the designs before writing shots.
  python3 tools/cast_lineup.py episodes/NNN-slug out.jpg
The episode's common.js must export CAST = { 'Name': preset, ... } (presets may include outfit: [...], see engine/outfits.js).
Optional: export CAST_SET = 'day' | 'night' (lighting of the lineup)."""
import base64, json, os, shutil, subprocess, sys, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.path.abspath(sys.argv[1]); OUT = sys.argv[2]; TMP = os.path.join(ROOT, "episodes/_castlineup")
W, H, LENS, DIST = 2400, 1100, 40, 12
os.makedirs(TMP, exist_ok=True)
open(os.path.join(TMP, "shots.js"), "w").write(f"""import * as THREE from 'three';
import {{ makeAvatar, add, camPath, idle, D }} from '../../engine/kit.js';
import * as C from '../{os.path.basename(EP)}/common.js';
const names = Object.keys(C.CAST); window.CAST_NAMES = names;
const lineup = (ry) => (S, cam) => {{
  const night = C.CAST_SET === 'night'; S.background = new THREE.Color(night ? 0x141a2a : 0xdfe6ee);
  S.add(new THREE.HemisphereLight(0xffffff, 0x6a6a70, night ? 0.7 : 1.3)); const k = new THREE.DirectionalLight(0xfff0e0, night ? 1.6 : 2.6); k.position.set(-6, 10, 14); S.add(k);
  const f = new THREE.DirectionalLight(0xb0c8ff, 0.8); f.position.set(8, 5, 6); S.add(f);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), new THREE.MeshStandardMaterial({{ color: night ? 0x22283a : 0xc8d0da }})); fl.rotation.x = -Math.PI / 2; S.add(fl);
  const n = names.length, gap = 5.2;
  names.forEach((nm, i) => {{ const A = add(S, makeAvatar({{ ...C.CAST[nm], name: 'c' + i, face: C.CAST[nm].face || 'smile' }}), [(i - (n - 1) / 2) * gap, 0, 0], ry); A.pose(idle(0.6, 0.4, i)); }});
  S.userData.dof = false; S.userData.handheld = false;
  const span = Math.max(1, n * gap / 2 + 1.2), d = Math.max({DIST}, span / ({W / H} * 12 / {LENS}) * 1.02);
  return () => camPath(cam, 0, [0, 3.2, d], [0, 3.2, d], [0, 2.9, 0], [0, 2.9, 0], {LENS});
}};
export const SHOTS = [lineup(0), lineup(-35)];
""")
srv = subprocess.Popen(["python3", "-m", "http.server", "8767"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    faces = sorted(os.path.basename(p)[:-4] for p in os.listdir(os.path.join(ROOT, "engine/faces")) if p.endswith(".png"))
    open(os.path.join(ROOT, "engine/faces/index.json"), "w").write(json.dumps(faces))
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = b.new_page(viewport={"width": W, "height": H}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"http://localhost:8767/engine/main.html?ep=_castlineup&w={W}&h={H}&q=1&grade=0"); pg.wait_for_function("window.ready===true", timeout=120000)
        ims = [Image.open(__import__("io").BytesIO(base64.b64decode(pg.evaluate(f"renderShot({k}, 0.5, 1.0)").split(",")[1]))) for k in (0, 1)]
        names = pg.evaluate("window.CAST_NAMES"); b.close()
        if errs: print("\n".join("PAGEERROR: " + e for e in errs))
finally:
    srv.terminate(); shutil.rmtree(TMP, ignore_errors=True)
f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Black.otf", 34)
n = len(names); gap = 5.2; span = max(1, n * gap / 2 + 1.2); d = max(DIST, span / (W / H * 12 / LENS) * 1.02); ppu = (H / 2) / (d * 12 / LENS)
sheet = Image.new("RGB", (W, H * 2)); sheet.paste(ims[0], (0, 0)); sheet.paste(ims[1], (0, H)); dr = ImageDraw.Draw(sheet)
for i, nm in enumerate(names):
    x = W / 2 + (i - (n - 1) / 2) * gap * ppu; tw = f.getlength(nm)
    y = H / 2 + 3.4 * ppu
    for k, part in enumerate(nm.split(' ')): tw = f.getlength(part); dr.text((x - tw / 2, y + k * 40), part, font=f, fill="white", stroke_width=5, stroke_fill="black")
sheet.resize((W // 2, H)).save(OUT, quality=90); print("cast ->", OUT, names)
