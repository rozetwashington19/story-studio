"""Render every hair style (front 3/4 + back 3/4) into one sheet:  python3 tools/hair_lineup.py [out.jpg] [style ...]
Listing styles also saves full-resolution front close-ups as <out>_<style>.png.
Uses a throwaway episode folder (episodes/_hairtest) that is deleted afterwards."""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); EP = os.path.join(ROOT, "episodes/_hairtest")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "hair_lineup.jpg"); CLOSE = sys.argv[2:]
STYLES = ['short', 'swoop', 'spiky', 'buzz', 'mohawk', 'curly', 'afro', 'bun', 'ponytail', 'pigtails', 'long', 'bob', 'braids', 'puffs']
os.makedirs(EP + "/out", exist_ok=True)
open(EP + "/script.txt", "w").write("\n".join(STYLES) + "\n")
json.dump([{"line": s, "start": i * 2.0, "end": i * 2.0 + 1.8} for i, s in enumerate(STYLES)], open(EP + "/out/timing.json", "w"))
open(EP + "/shots.js", "w").write("""import { makeAvatar, add, camPath, kidRoomDay, D } from '../../engine/kit.js';
const ST = %s, LOOK = [['brown',0x1a0d05],['tan',0x6a3a1a],['light',0xd9a441],['yellow',0x222222],['pale',0xc0502a]];
export const SHOTS = ST.map((st, k) => (S, cam) => {
  kidRoomDay(S); const [sk, hc] = LOOK[k %% 5];
  const A = add(S, makeAvatar({ skin: sk, shirt: 0xf0b52e, shirtStyle: 'hoodie', hair: st, hairCol: hc, name: st, face: 'smile' }), [0, 0, -3], 0);
  return (t, dur) => { A.root.rotation.y = (t > dur / 2 ? 150 : 25) * D; camPath(cam, 0, [0, 4.6, 2.2], [0, 4.6, 2.2], [0, 4.3, -3], [0, 4.3, -3], 30); };
});
""" % json.dumps(STYLES))
try:
    r = subprocess.run(["python3", "engine/render.py", EP, "stills"], cwd=ROOT, capture_output=True, text=True)
    errs = [l for l in r.stdout.splitlines() if "PAGEERROR" in l]
    if errs or r.returncode: print("\n".join(errs) or r.stderr[-2000:]); sys.exit(1)
    from PIL import Image
    im = Image.open(EP + "/out/preview.jpg"); im.resize((im.width * 2 // 3, im.height * 2 // 3)).save(OUT, quality=90); print("lineup ->", OUT)
    for st in CLOSE:
        k = STYLES.index(st) + 1; subprocess.run(["python3", "engine/render.py", EP, "frame", str(k), "0.2"], cwd=ROOT, capture_output=True)
        o = os.path.splitext(OUT)[0] + f"_{st}.png"; Image.open(EP + f"/out/frame_{k}.png").crop((100, 120, 980, 1060)).save(o); print("close-up ->", o)
finally:
    shutil.rmtree(EP, ignore_errors=True)
