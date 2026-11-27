"""Render faces/characters on real heads:  python3 tools/face_lineup.py out.jpg [face ...]
Each entry: 'face' or 'face@style+beard+color+details' where details is any of w(rinkles) f(reckles) r(osy), e.g. 'proud@balding+full+gray+w'.
Two entries per tile row-pair (first half / second half of each shot). Uses a throwaway episodes/_facetest. ANIM=b shows every face mid-blink, ANIM=o with the talking mouth (checks the automatic facial animation on new faces). CLOSE=1 also saves full-res close-ups of the first shot as <out>_1.png / <out>_2.png."""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); EP = os.path.join(ROOT, "episodes/_facetest")
OUT = sys.argv[1]; E = sys.argv[2:]
if len(E) % 2: E.append(E[-1])
pairs = [E[i:i + 2] for i in range(0, len(E), 2)]
os.makedirs(EP + "/out", exist_ok=True)
open(EP + "/script.txt", "w").write("\n".join(" / ".join(p) for p in pairs) + "\n")
json.dump([{"line": " / ".join(p), "start": i * 2.0, "end": i * 2.0 + 1.8} for i, p in enumerate(pairs)], open(EP + "/out/timing.json", "w"))
open(EP + "/shots.js", "w").write("""import { makeAvatar, add, camPath, kidRoomDay, D, HAIR_COLORS } from '../../engine/kit.js';
const P = %s, SK = ['brown', 'tan', 'light', 'yellow', 'pale'];
function spec(e, k) { const [face, rest] = e.split('@'); const [hair, beard, col, det] = (rest || 'short').split('+');
  return { skin: SK[k %% 5], shirt: 0x4a8ad0, shirtStyle: 'shirt', face, hair: hair === '_' ? null : hair, beard: beard && beard !== '_' ? beard : null,
    hairCol: col && col !== '_' ? HAIR_COLORS[col] : 0x2a1708, wrinkles: /w/.test(det || ''), freckles: /f/.test(det || ''), rosy: /r/.test(det || ''), name: 'a' + k }; }
export const SHOTS = P.map((p, k) => (S, cam) => {
  kidRoomDay(S); const A = [0, 1].map(i => { const a = add(S, makeAvatar(spec(p[i], 2 * k + i)), [0, 0, -3], 15); a.root.visible = i === 0; return a; });
  const AN = %s; if (AN) S.userData.faceAnim = false;
  return (t, dur) => { const b = t > dur / 2; A[0].root.visible = !b; A[1].root.visible = b; if (AN) A.forEach(a => a.anim && a.anim(AN[0], AN[1])); camPath(cam, 0, [0, 4.75, 2.6], [0, 4.75, 2.6], [0, 4.5, -3], [0, 4.5, -3], 34); };
});
""" % (json.dumps(pairs), json.dumps({"b": [1, 0], "o": [0, 1]}.get(os.environ.get("ANIM", ""))) ))
try:
    r = subprocess.run(["python3", "engine/render.py", EP, "stills"], cwd=ROOT, capture_output=True, text=True)
    errs = [l for l in r.stdout.splitlines() if "PAGEERROR" in l]
    if errs or r.returncode: print("\n".join(errs) or r.stderr[-2000:]); sys.exit(1)
    from PIL import Image
    im = Image.open(EP + "/out/preview.jpg"); im.resize((im.width * 2 // 3, im.height * 2 // 3)).save(OUT, quality=90); print("faces ->", OUT)
    if os.environ.get("CLOSE"):
        for j, f in enumerate(("0.2", "0.8")):
            subprocess.run(["python3", "engine/render.py", EP, "frame", "1", f], cwd=ROOT, capture_output=True)
            Image.open(EP + "/out/frame_1.png").crop((190, 330, 890, 1030)).save(os.path.splitext(OUT)[0] + f"_{j + 1}.png")
finally:
    shutil.rmtree(EP, ignore_errors=True)
