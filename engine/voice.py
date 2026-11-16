"""Narration: one clip per script line -> out/narration.wav + out/timing.json.

Default voice = the series narrator (the owner's own voice), cloned locally with ZipVoice from
engine/voice/narrator_ref.wav + narrator_ref.txt (exact transcript of that clip). Generated at the model's
natural pace, then sped up VOICE_TEMPO (default 1.08 — the owner asked for "not too fast") without changing pitch.
Fallback (only if the clone model is missing or fails): Kokoro am_adam pitched up 1.55x.

  python3 engine/voice.py episodes/NNN-slug            # VOICE=clone (default) | VOICE=kokoro
Script format: one line per shot; end a line with ' [pause]' for a long dramatic pause after it.
"""
import sys, os, json, subprocess, numpy as np, soundfile as sf, sherpa_onnx
EP = sys.argv[1]; OUT = os.path.join(EP, "out"); os.makedirs(OUT + "/lines", exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = os.environ.get("VOICE", "clone"); TEMPO = float(os.environ.get("VOICE_TEMPO", "1.08"))
ZV = os.path.expanduser(os.environ.get("ZIPVOICE_DIR", "~/models/sherpa-onnx-zipvoice-distill-zh-en-emilia")) + "/"
KK = os.path.expanduser(os.environ.get("KOKORO_DIR", "~/models/kokoro-en-v0_19")) + "/"
POLISH = ("highpass=f=80,lowpass=f=12000,deesser=i=0.25,"
          "acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80:makeup=2,aresample=48000")

def clone_engine():
    import librosa
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(
        tokens=ZV + "tokens.txt", encoder=ZV + "text_encoder.onnx", decoder=ZV + "fm_decoder.onnx", vocoder=ZV + "vocos_24khz.onnx",
        data_dir=ZV + "espeak-ng-data", lexicon=ZV + "pinyin.raw"), num_threads=2))
    tts = sherpa_onnx.OfflineTts(cfg)
    ref, _ = librosa.load(os.path.join(HERE, "voice/narrator_ref.wav"), sr=24000); ref = ref.tolist()
    pt = open(os.path.join(HERE, "voice/narrator_ref.txt")).read().strip()
    chain = (f"rubberband=tempo={TEMPO}:pitchq=quality," if abs(TEMPO - 1) > 1e-3 else "") + POLISH
    return (lambda text: tts.generate(text, pt, ref, 24000, speed=1.0, num_steps=8)), chain

def kokoro_engine():
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
        model=KK + "model.onnx", voices=KK + "voices.bin", tokens=KK + "tokens.txt", data_dir=KK + "espeak-ng-data"), num_threads=2))
    tts = sherpa_onnx.OfflineTts(cfg)
    return (lambda text: tts.generate(text, sid=5, speed=1.0)), ("rubberband=pitch=1.55:tempo=1.22:pitchq=quality,afftdn=nf=-35," + POLISH)

engine = None
if VOICE == "clone":
    try: gen, chain = clone_engine(); engine = "clone"
    except Exception as e: print("WARNING: voice clone unavailable, falling back to Kokoro:", e)
if engine is None: gen, chain = kokoro_engine(); engine = "kokoro"

raw = [l.rstrip("\n") for l in open(os.path.join(EP, "script.txt")) if l.strip()]
lines, long_pause = [], []
for l in raw:
    lines.append(l.replace("[pause]", "").strip()); long_pause.append(l.strip().endswith("[pause]"))
segs = []
for i, l in enumerate(lines):
    a = gen(l.replace('"', '')); y = np.array(a.samples, dtype=np.float32)
    idx = np.where(np.abs(y) > 0.01)[0]
    if len(idx) == 0: raise SystemExit(f"empty audio for line {i+1}: {l}")
    y = y[max(0, idx[0] - 240): idx[-1] + 480]
    rp = f"{OUT}/lines/raw{i:03d}.wav"; lp = f"{OUT}/lines/l{i:03d}.wav"
    sf.write(rp, y, a.sample_rate)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", rp, "-af", chain, "-ar", "48000", "-ac", "1", lp], check=True)
    segs.append(sf.read(lp)[0]); print(f"line {i+1}/{len(lines)}", flush=True)
out = [np.zeros(int(48000 * 0.25))]; timing = []; t = 0.25
for i, z in enumerate(segs):
    d = len(z) / 48000; timing.append({"line": lines[i], "start": round(t, 3), "end": round(t + d, 3)})
    p = 0.6 if long_pause[i] else (0.12 if lines[i].endswith(",") else 0.22)
    out += [z, np.zeros(int(48000 * p))]; t += d + p
sf.write(f"{OUT}/narr_pre.wav", np.concatenate(out), 48000)
json.dump(timing, open(f"{OUT}/timing.json", "w"), indent=1)
total = t + 2.0
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/narr_pre.wav", "-af", f"apad,atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5:LRA=7",
                "-ar", "48000", f"{OUT}/narration.wav"], check=True)
print(f"voice={engine} lines={len(lines)} words={sum(len(l.split()) for l in lines)} duration={total:.1f}s")
