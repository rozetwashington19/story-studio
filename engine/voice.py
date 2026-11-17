"""Narration: one clip per script line -> out/narration.wav + out/timing.json.

Default VOICE_MODE=passage: lines are read together in breath-sized passages (<=4 lines, break after [pause]) so intonation
flows like a real reading, then cut apart at the natural pauses (gaps kept as spoken). VOICE_MODE=line = old one-line-at-a-time mode.

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
    return (lambda text, speed=1.0, steps=8: tts.generate(text, pt, ref, 24000, speed=speed, num_steps=steps)), chain

def kokoro_engine():
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
        model=KK + "model.onnx", voices=KK + "voices.bin", tokens=KK + "tokens.txt", data_dir=KK + "espeak-ng-data"), num_threads=2))
    tts = sherpa_onnx.OfflineTts(cfg)
    return (lambda text, speed=1.0, steps=0: tts.generate(text, sid=5, speed=1.0)), ("rubberband=pitch=1.55:tempo=1.22:pitchq=quality,afftdn=nf=-35," + POLISH)

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

VMODE = os.environ.get("VOICE_MODE", "passage") if engine == "clone" and not os.environ.get("ONLY") else "line"
STEPS = int(os.environ.get("VOICE_STEPS", "8"))   # 16 is not better with the distilled model
LIGHT = (f"atempo={TEMPO}," if abs(TEMPO - 1) > 1e-3 else "") + "highpass=f=70,lowpass=f=12500,aresample=48000"   # passage mode: gentle tempo, no compressor
# NOTE: never pass speed != 1.0 to ZipVoice - it truncates and garbles sentence endings (tested 2026-11-17)

def write_out(pieces):
    """pieces: [(audio48k, speech_onset_s, speech_end_s, gap_after_s)] -> narration.wav + timing.json"""
    out = [np.zeros(int(48000 * 0.25))]; timing = []; t = 0.25
    for i, (z, on, off, gap) in enumerate(pieces):
        timing.append({"line": lines[i], "start": round(t + on, 3), "end": round(t + off, 3)})
        out += [z, np.zeros(int(48000 * gap))]; t += len(z) / 48000 + gap
    sf.write(f"{OUT}/narr_pre.wav", np.concatenate(out), 48000)
    json.dump(timing, open(f"{OUT}/timing.json", "w"), indent=1)
    total = t + 2.0
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/narr_pre.wav", "-af", f"apad,atrim=0:{total:.3f},loudnorm=I=-15:TP=-1.5:LRA=11",
                    "-ar", "48000", f"{OUT}/narration.wav"], check=True)
    print(f"voice={engine} mode={VMODE} lines={len(lines)} words={sum(len(l.split()) for l in lines)} duration={total:.1f}s")

def speech_bounds(z, sr=48000):
    db, h = rms_db(z, sr); on = np.where(db > db.max() - 32)[0]
    return (0.0, len(z) / sr) if len(on) == 0 else (on[0] * h / sr, (on[-1] + 1) * h / sr)

def split_passage(y, sr, texts):
    """cut a multi-line take into len(texts) pieces at the pauses closest to the expected boundaries (DP); keeps natural gaps"""
    n = len(texts)
    if n == 1: return [y]
    db, h = rms_db(y, sr); sil = db < db.max() - 36; runs, k = [], 0
    while k < len(sil):
        if sil[k]:
            j = k
            while j < len(sil) and sil[j]: j += 1
            if j - k >= 5 and k > 0 and j < len(sil): runs.append((k + j) / 2)
            k = j
        else: k += 1
    w = [len(x) + 2 for x in texts]; tot = sum(w); exp = [len(db) * sum(w[:i + 1]) / tot for i in range(n - 1)]
    lim = 0.2 * len(db); INF = 1e18
    if len(runs) < n - 1: return None
    dp = [[INF] * len(runs) for _ in range(n - 1)]; bk = [[-1] * len(runs) for _ in range(n - 1)]
    for r, c in enumerate(runs):
        if abs(c - exp[0]) < lim: dp[0][r] = abs(c - exp[0])
    for i in range(1, n - 1):
        for r, c in enumerate(runs):
            if abs(c - exp[i]) >= lim: continue
            for q in range(r):
                if dp[i - 1][q] + abs(c - exp[i]) < dp[i][r]: dp[i][r] = dp[i - 1][q] + abs(c - exp[i]); bk[i][r] = q
    r = min(range(len(runs)), key=lambda r: dp[n - 2][r])
    if dp[n - 2][r] >= INF: return None
    cuts = []
    for i in range(n - 2, -1, -1): cuts.append(int(runs[r] * h)); r = bk[i][r]
    cuts = [0] + cuts[::-1] + [len(y)]
    return [y[cuts[i]:cuts[i + 1]] for i in range(n)]

def to48(y, sr, chain):
    rp = f"{OUT}/lines/_tmp.wav"; lp = f"{OUT}/lines/_tmp48.wav"; sf.write(rp, y, sr)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", rp, "-af", chain, "-ar", "48000", "-ac", "1", lp], check=True)
    return sf.read(lp)[0].astype(np.float32)

if VMODE == "passage":
    # group lines into breath-sized passages: <= 4 lines / ~18 words, and always break after a [pause] line
    groups, cur = [], []
    for i, l in enumerate(lines):
        cur.append(i)
        if long_pause[i] or len(cur) >= 4 or sum(len(lines[j].split()) for j in cur) >= 18: groups.append(cur); cur = []
    if cur: groups.append(cur)
    pieces = [None] * len(lines)
    for gi, g in enumerate(groups):
        texts = [lines[i].replace('"', '') for i in g]; best = None
        for attempt in range(3):
            a = gen(" ".join(texts), speed=1.0, steps=STEPS); y = clean_trim(np.array(a.samples, dtype=np.float32), a.sample_rate, rel=-40)
            z = to48(y, a.sample_rate, LIGHT); parts = split_passage(z, 48000, texts)
            if parts is None: continue
            scores = [asr_score(p, 48000, t) for p, t in zip(parts, texts)]; worst = min(s for s, _ in scores)
            if best is None or worst > best[0]: best = (worst, parts, scores)
            if worst >= 0.9: break
        if best is None or best[0] < 0.75:   # passage could not be split cleanly: single-line takes for this group
            parts = []
            for t in texts:
                a = gen(t, speed=1.0, steps=STEPS); parts.append(to48(clean_trim(np.array(a.samples, dtype=np.float32), a.sample_rate), a.sample_rate, LIGHT))
            scores = [asr_score(p, 48000, t) for p, t in zip(parts, texts)]; tag = "solo"
        else: parts, scores, tag = best[1], best[2], "passage"
        for k, (i, z) in enumerate(zip(g, parts)):
            fi = int(0.008 * 48000); z = z.copy(); z[:fi] *= np.linspace(0, 1, fi)
            last = k == len(g) - 1
            if last or tag == "solo": z = clean_trim(z, 48000, rel=-40)
            on, off = speech_bounds(z); gap = (0.6 if long_pause[i] else 0.28) if (last or tag == "solo") else 0.0
            if tag == "solo" and not last: gap = 0.18
            pieces[i] = (z, on, off, gap); sf.write(f"{OUT}/lines/l{i:03d}.wav", z, 48000)
            sc, hyp = scores[k]; print(f"line {i+1}/{len(lines)} [{tag}] asr={sc:.2f}" + ("" if sc >= 0.9 else f"  CHECK: heard '{hyp}'"), flush=True)
    write_out(pieces); raise SystemExit(0)

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
