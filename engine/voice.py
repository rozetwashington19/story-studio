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
    chain = (f"atempo={TEMPO}," if abs(TEMPO - 1) > 1e-3 else "") + POLISH   # atempo (WSOLA): no tonal smear/ring at line ends
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

# ---- quality helpers (added ep 002): context generation, clean trims, ASR check ----
import difflib, re
def rms_db(y, sr, hop_s=0.01):
    h = max(1, int(sr * hop_s)); n = len(y) // h
    e = np.sqrt(np.mean(y[:n * h].reshape(n, h) ** 2, axis=1) + 1e-12); return 20 * np.log10(e), h
def clean_trim(y, sr, rel=-32):
    """cut leading/trailing low-level tails (vocoder hum / smear) and fade the edges so nothing rings or clicks"""
    db, h = rms_db(y, sr); on = np.where(db > db.max() + rel)[0]
    if len(on) == 0: return y
    a = max(0, on[0] * h - int(0.02 * sr)); b = min(len(y), (on[-1] + 1) * h + int(0.06 * sr)); y = y[a:b].copy()
    fi, fo = int(0.01 * sr), min(int(0.05 * sr), len(y) // 3)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo) ** 1.5; return y
def split_after_prev(y, sr, prev, cur):
    """y = speech of 'prev cur'; return the part that is 'cur', cut in the pause nearest the expected boundary"""
    db, h = rms_db(y, sr); thr = db.max() - 38; sil = db < thr
    runs, k = [], 0
    while k < len(sil):
        if sil[k]:
            j = k
            while j < len(sil) and sil[j]: j += 1
            if j - k >= 6 and k > 0 and j < len(sil): runs.append((k, j))
            k = j
        else: k += 1
    if not runs: return None
    exp = len(db) * (len(prev) + 0.5) / (len(prev) + len(cur) + 1)
    k, j = min(runs, key=lambda r: abs((r[0] + r[1]) / 2 - exp))
    if abs((k + j) / 2 - exp) > 0.22 * len(db): return None
    return y[max(0, j * h - int(0.03 * sr)):]
ASR = None
def asr_score(y, sr, text):
    global ASR
    try:
        if ASR is None:
            W = os.path.expanduser(os.environ.get("WHISPER_DIR", "~/models/sherpa-onnx-whisper-base.en")) + "/"
            ASR = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=W + "base.en-encoder.int8.onnx", decoder=W + "base.en-decoder.int8.onnx",
                                                              tokens=W + "base.en-tokens.txt", language="en", task="transcribe", num_threads=2)
        st = ASR.create_stream(); st.accept_waveform(sr, np.concatenate([np.zeros(int(0.3 * sr)), np.asarray(y, dtype=np.float32), np.zeros(int(0.5 * sr))]).astype(np.float32)); ASR.decode_stream(st); hyp = st.result.text
    except Exception as e:
        return 1.0, f"(asr unavailable: {e})"
    norm = lambda s: re.sub(r"[^a-z0-9' ]", " ", s.lower().replace("-", " ")).split()
    return difflib.SequenceMatcher(None, norm(text), norm(hyp)).ratio(), hyp

segs = []
# ONLY="51,55": regenerate just these line numbers (solo takes), reuse out/lines/lNNN.wav for the rest
ONLY = {int(x) for x in os.environ.get("ONLY", "").split(",") if x.strip()}
for i, l in enumerate(lines):
    if ONLY and (i + 1) not in ONLY:
        segs.append(sf.read(f"{OUT}/lines/l{i:03d}.wav")[0].astype(np.float32)); continue
    txt = l.replace('"', '')
    prev = lines[i - 1].replace('"', '') if i > 0 and engine == "clone" and not ONLY else None
    best = None
    # try: in context with the previous line (natural flow) x2, then alone x2; keep the best ASR match
    for attempt, ctx in enumerate([prev, prev, None, None] + ([None] * 3 if ONLY else [])):
        if attempt < 2 and ctx is None: continue
        a = gen((ctx + " " + txt) if ctx else txt); sr = a.sample_rate; y = np.array(a.samples, dtype=np.float32)
        if ctx:
            y = split_after_prev(y, sr, ctx, txt)
            if y is None: continue
        y = clean_trim(y, sr)
        if len(y) < 0.2 * sr: continue
        sc, hyp = asr_score(y, sr, txt)
        if best is None or sc > best[0]: best = (sc, y, sr, hyp, "ctx" if ctx else "solo")
        if sc >= (0.99 if ONLY else 0.92): break
    if best is None: raise SystemExit(f"could not generate line {i+1}: {l}")
    sc, y, sr, hyp, mode = best
    rp = f"{OUT}/lines/raw{i:03d}.wav"; lp = f"{OUT}/lines/l{i:03d}.wav"
    sf.write(rp, y, sr)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", rp, "-af", chain, "-ar", "48000", "-ac", "1", lp], check=True)
    z = clean_trim(sf.read(lp)[0].astype(np.float32), 48000, rel=-40)
    segs.append(z); print(f"line {i+1}/{len(lines)} [{mode}] asr={sc:.2f}" + ("" if sc >= 0.92 else f"  CHECK: heard '{hyp}'"), flush=True)
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
