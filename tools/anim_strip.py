"""Animation QC strip: several frames of chosen shots on one sheet (RUNBOOK step 5, "Animation QC").
  python3 tools/anim_strip.py episodes/NNN-slug out.jpg 33 34 52          # 4 frames each at 10/40/70/95 % of the shot
  FR=0.05,0.3,0.5,0.7,0.95 Q=1 python3 tools/anim_strip.py ...            # custom fractions / with the quality passes (default Q=0, fast)
One page load for all frames (much faster than repeated `render.py frame` calls). Rows = shots, columns = time."""
import sys, os, time, subprocess, base64, io
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(ROOT, "engine"))
from captions import Episode
from PIL import Image
from playwright.sync_api import sync_playwright
EP = os.path.abspath(sys.argv[1]); OUT = sys.argv[2]; IDS = [int(x) for x in sys.argv[3:]]; PORT = 8767
FR = [float(x) for x in os.environ.get("FR", "0.1,0.4,0.7,0.95").split(",")]; E = Episode(EP)
srv = subprocess.Popen(["python3", "-m", "http.server", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.on("pageerror", lambda e: print("PAGEERROR:", e))
        pg.goto(f"http://localhost:{PORT}/engine/main.html?ep={os.path.basename(EP)}&q={os.environ.get('Q', '0')}"); pg.wait_for_function("window.ready===true", timeout=120000)
        W, H = 270, 480; sheet = Image.new("RGB", (W * len(FR), H * len(IDS)))
        for r, k in enumerate(IDS):
            s, e = E.spans[k - 1]
            for c, f in enumerate(FR):
                im = Image.open(io.BytesIO(base64.b64decode(pg.evaluate(f"renderShot({k-1},{(e-s)*f},{e-s})").split(",")[1])))
                sheet.paste(E.overlay(im, s + (e - s) * f, k - 1).resize((W, H)), (c * W, r * H))
        sheet.save(OUT, quality=88); print("strip ->", OUT, "shots", IDS, "fractions", FR); b.close()
finally:
    srv.terminate()
