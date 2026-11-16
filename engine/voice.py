"""Narration: one TTS clip per script line -> out/narration.wav + out/timing.json.
Voice: Kokoro 'am_adam' (sid 5), pitched up 1.55x and sped 1.22x -> young boy narrator (~4.4 words/s).
Script format: one line per shot. End a line with ' [pause]' for a long dramatic pause after it.
Text in "quotes" is read by the same narrator (dialogue also appears as a speech bubble)."""
import sys, os, json, subprocess, numpy as np, soundfile as sf, sherpa_onnx
EP = sys.argv[1]; OUT = os.path.join(EP, "out"); os.makedirs(OUT + "/lines", exist_ok=True)
M = os.environ.get("KOKORO_DIR", os.path.expanduser("~/models/kokoro-en-v0_19")) + "/"
cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
    model=M + "model.onnx", voices=M + "voices.bin", tokens=M + "tokens.txt", data_dir=M + "espeak-ng-data"), num_threads=2))
tts = sherpa_onnx.OfflineTts(cfg)
CHAIN = ("rubberband=pitch=1.55:tempo=1.22:pitchq=quality,highpass=f=90,lowpass=f=11500,afftdn=nf=-35,"
         "equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2.5,deesser=i=0.3,"
         "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,aresample=48000")
raw = [l.rstrip("\n") for l in open(os.path.join(EP, "script.txt")) if l.strip()]
lines, long_pause = [], []
for l in raw:
    lp = l.strip().endswith("[pause]"); lines.append(l.replace("[pause]", "").strip()); long_pause.append(lp)
segs = []
for i, l in enumerate(lines):
    a = tts.generate(l.replace('"', ''), sid=5, speed=1.0); y = np.array(a.samples)
    idx = np.where(np.abs(y) > 0.01)[0]; y = y[max(0, idx[0] - 240): idx[-1] + 480]
    rp = f"{OUT}/lines/raw{i:03d}.wav"; lp = f"{OUT}/lines/l{i:03d}.wav"
    sf.write(rp, y, a.sample_rate)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", rp, "-af", CHAIN, "-ar", "48000", "-ac", "1", lp], check=True)
    segs.append(sf.read(lp)[0])
out = [np.zeros(int(48000 * 0.25))]; timing = []; t = 0.25
for i, z in enumerate(segs):
    d = len(z) / 48000; timing.append({"line": lines[i], "start": round(t, 3), "end": round(t + d, 3)})
    p = 0.6 if long_pause[i] else (0.12 if lines[i].endswith(",") else 0.22)
    out += [z, np.zeros(int(48000 * p))]; t += d + p
sf.write(f"{OUT}/narr_pre.wav", np.concatenate(out), 48000)
json.dump(timing, open(f"{OUT}/timing.json", "w"), indent=1)
TAIL = 2.0; total = t + TAIL
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/narr_pre.wav", "-af", f"apad,atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5:LRA=7",
                "-ar", "48000", f"{OUT}/narration.wav"], check=True)
words = sum(len(l.split()) for l in lines)
print(f"lines={len(lines)} words={words} duration={total:.1f}s")
