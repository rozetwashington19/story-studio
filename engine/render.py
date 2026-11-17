"""Render an episode with three.js in headless Chrome.
  python3 engine/render.py episodes/NNN-slug stills [line numbers...]   -> out/preview.jpg (2 frames per shot, 8 per row)
  python3 engine/render.py episodes/NNN-slug clips [lines...]         -> collision report (must be 0 before rendering)
  python3 engine/render.py episodes/NNN-slug frame 12 0.5            -> out/frame_12.png (full-res check of one shot)
  python3 engine/render.py episodes/NNN-slug video                      -> out/episode.mp4 (+ compressed out/final.mp4)
Narration + small sound effects (episodes/NNN/sfx.json, engine/sfx.py); no music (user preference)."""
import sys, os, time, subprocess, base64, io, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from captions import Episode
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPDIR = os.path.abspath(sys.argv[1]); EPID = os.path.basename(EPDIR); MODE = sys.argv[2]; OUT = os.path.join(EPDIR, "out")
FPS = 30; PORT = 8765
E = Episode(EPDIR)
json_faces = sorted(os.path.basename(p)[:-4] for p in glob.glob(os.path.join(ROOT, "engine/faces/*.png")))
open(os.path.join(ROOT, "engine/faces/index.json"), "w").write(__import__("json").dumps(json_faces))
srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
def chrome():
    for p in ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]:
        if os.path.exists(p): return p
    return None
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=chrome(), args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.on("console", lambda m: print("console:", m.text) if "GPU stall" not in m.text and "404" not in m.text else None)
        pg.on("pageerror", lambda e: print("PAGEERROR:", e))
        pg.goto(f"http://localhost:{PORT}/engine/main.html?ep={EPID}&q={os.environ.get('Q', '0' if MODE == 'clips' else '1')}"); pg.wait_for_function("window.ready===true", timeout=120000)
        n = pg.evaluate("window.NSHOTS")
        if n != len(E.timing): print(f"WARNING: {n} shots but {len(E.timing)} script lines")
        grab = lambda i, lt, d: Image.open(io.BytesIO(base64.b64decode(pg.evaluate(f"renderShot({i},{lt},{d})").split(",")[1])))
        if MODE == "clips":   # collision check: 7 sample times per shot -> out/clips.txt
            ids = [int(x) for x in sys.argv[3:]] or list(range(1, len(E.timing) + 1)); report = []
            for k in ids:
                s, e = E.spans[k - 1]; found = {}
                for f in (0.0, 0.15, 0.3, 0.5, 0.7, 0.85, 0.99):
                    for h in pg.evaluate(f"clipsAt({k-1},{(e-s)*f},{e-s})"): found.setdefault(h, f)
                for h, f in found.items(): report.append(f"line {k:3d} @{f:.0%}: {h}")
            open(os.path.join(OUT, "clips.txt"), "w").write("\n".join(report) + "\n")
            print("\n".join(report)); print(f"CLIPS: {len(report)} problems in {len(set(l[:8] for l in report))} shots -> out/clips.txt")
        elif MODE == "frame":   # full-resolution single frame: frame <line> <fraction 0-1>
            k = int(sys.argv[3]); f = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5; s, e = E.spans[k - 1]; t = s + (e - s) * f
            E.overlay(grab(k - 1, t - s, e - s), t, k - 1).save(os.path.join(OUT, f"frame_{k}.png")); print("frame ->", os.path.join(OUT, f"frame_{k}.png"))
        elif MODE == "stills":
            ids = [int(x) for x in sys.argv[3:]] or list(range(1, len(E.timing) + 1)); ims = []
            for k in ids:
                s, e = E.spans[k - 1]
                for f in (0.15, 0.85):
                    t = s + (e - s) * f; ims.append(E.overlay(grab(k - 1, t - s, e - s), t, k - 1).resize((216, 384)))
            cols = 8; sheet = Image.new("RGB", (216 * cols, 384 * ((len(ims) + cols - 1) // cols)))
            for j, im in enumerate(ims): sheet.paste(im, ((j % cols) * 216, (j // cols) * 384))
            sheet.save(os.path.join(OUT, "preview.jpg")); print("preview ->", os.path.join(OUT, "preview.jpg"), "shots:", ids)
        else:
            if os.path.exists(os.path.join(EPDIR, "sfx.json")): subprocess.run(["python3", os.path.join(ROOT, "engine/sfx.py"), EPDIR], check=True)
            AUDIO = os.path.join(OUT, "mix.wav") if os.path.exists(os.path.join(EPDIR, "sfx.json")) else os.path.join(OUT, "narration.wav")   # narration + sound effects
            mp4 = os.path.join(OUT, "episode.mp4")
            ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1080x1920", "-r", str(FPS), "-i", "-",
                                   "-i", AUDIO, "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p",
                                   "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", mp4], stdin=subprocess.PIPE)
            N = int(E.total * FPS); t0 = time.time()
            for f in range(N):
                t = f / FPS; i, lt, d = E.shot_at(t)
                ff.stdin.write(E.overlay(grab(i, lt, d), t, i).tobytes())
                if f % 150 == 0: print(f"frame {f}/{N} {time.time()-t0:.0f}s", flush=True)
            ff.stdin.close(); ff.wait()
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-c:v", "libx264", "-preset", "veryfast", "-crf", "25", "-maxrate", "6M", "-bufsize", "12M",
                            "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", os.path.join(OUT, "final.mp4")], check=True)
            print("done ->", os.path.join(OUT, "final.mp4"))
        b.close()
finally:
    srv.terminate()
