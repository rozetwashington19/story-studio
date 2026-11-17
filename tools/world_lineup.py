"""Render every themed world (engine/themes.js) with a kid and a monster:  python3 tools/world_lineup.py out.jpg [world ...]
Two frames per world: wide establishing shot + reverse-angle medium. Uses a throwaway episodes/_worldtest."""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); EP = os.path.join(ROOT, "episodes/_worldtest")
OUT = sys.argv[1]; W = sys.argv[2:] or ['forest', 'forestNight', 'spooky', 'space', 'underwater', 'candy', 'castle', 'castleNight', 'cityNight', 'snow', 'desert', 'lab']
os.makedirs(EP + "/out", exist_ok=True)
open(EP + "/script.txt", "w").write("\n".join(W) + "\n")
json.dump([{"line": w, "start": i * 3.0, "end": i * 3.0 + 2.8} for i, w in enumerate(W)], open(EP + "/out/timing.json", "w"))
open(EP + "/shots.js", "w").write("""import { makeAvatar, add, camPath, D, WORLDS, monster, idle } from '../../engine/kit.js';
const L = %s;
const mons = [{ col: 0x6ad86a, belly: 0xd8f0a0, eyes: 1 }, { col: 0xa86ad8, eyes: 3, shape: 'tall', spots: true }, { col: 0xff8a4a, belly: 0xffe0b0, shape: 'box', tentacles: true }];
export const SHOTS = L.map((w, k) => (S, cam) => {
  const night = /Night$/.test(w) && w !== 'cityNight'; const env = WORLDS[w.replace(/Night$/, w === 'cityNight' ? 'Night' : '')](S, { night });
  const kid = add(S, makeAvatar({ skin: 'brown', shirt: 0xf0b52e, shirtStyle: 'hoodie', hair: 'puffs', hairCol: 0x24110a, name: 'kid', face: 'awe' }), [-2.6, 0, 1], 30);
  const m = monster(S, { name: 'mon', seed: k, ...mons[k %% 3] }); m.root.position.set(2.8, 0, -1); m.root.rotation.y = -25 * D;
  return (t, dur) => { env.update(t); kid.pose(idle(t)); m.look(kid.root.position.clone().setY(4.6)); m.animate(t, ['idle', 'bounce', 'wave'][k %% 3]);
    if (t < dur / 2) camPath(cam, 0, [0, 6, 19], [0, 6, 19], [0, 4.5, -4], [0, 4.5, -4], 24);
    else camPath(cam, 0, [-4, 4.2, 9], [-4, 4.2, 9], [1.5, 3.4, -1], [1.5, 3.4, -1], 30); };
});
""" % json.dumps(W))
try:
    r = subprocess.run(["python3", "engine/render.py", EP, "stills"], cwd=ROOT, capture_output=True, text=True)
    errs = [l for l in r.stdout.splitlines() if "PAGEERROR" in l]
    if errs or r.returncode: print("\n".join(errs) or r.stderr[-2000:]); sys.exit(1)
    from PIL import Image
    im = Image.open(EP + "/out/preview.jpg"); im.resize((im.width * 2 // 3, im.height * 2 // 3)).save(OUT, quality=90); print("worlds ->", OUT)
finally:
    shutil.rmtree(EP, ignore_errors=True)
