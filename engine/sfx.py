"""Small procedural sound effects mixed under the narration (no music, no samples: every sound is synthesized here).

  python3 engine/sfx.py episodes/NNN-slug            -> out/sfx.wav + out/mix.wav (render.py uses mix.wav when it exists)
  python3 engine/sfx.py episodes/NNN-slug --remux    -> also swaps the audio of an already-rendered out/final.mp4 (no re-render)
  python3 engine/sfx.py --demo                       -> /tmp/sfx_demo.wav with every sound, one after another

Cues live in episodes/NNN-slug/sfx.json, a list of [line, at, name] or [line, at, name, gain_db]:
  line   = script line number (1-based, same as shots/bubbles)
  at     = seconds after that shot starts, or "50%" of the shot's length
  name   = one of SOUNDS below;  gain_db = optional trim (-6 .. +4), 0 = house level
House level: each cue sits ~14 dB under the voice (clearly audible, never competing) and ducks a further 4 dB while
the narrator is speaking. Keep it sparse: about one cue per 1-3 shots, on actions (pops, steps, snaps, whooshes, chimes).
"""
import json, os, sys, subprocess
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
RNG = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.2, shape=4.0):  # attack (s) then exponential-ish release over the rest
    x = np.ones(n); na = max(1, int(a * SR)); x[:na] = np.linspace(0, 1, na)
    rest = n - na
    if rest > 0: x[na:] = np.exp(-shape * np.linspace(0, 1, rest) * (len(x) / SR) / max(r, 1e-3))
    return x
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def sweep(f0, f1, d, curve=1.0):
    tt = t_(d); f = f0 + (f1 - f0) * (tt / d) ** curve; return np.sin(2 * np.pi * np.cumsum(f) / SR)
def noise(d): return RNG.standard_normal(int(d * SR))
def cat(*xs, gap=0.0):
    out = []
    for x in xs: out += [x, np.zeros(int(gap * SR))]
    return np.concatenate(out)

def pop():      d = 0.09; return sweep(380, 950, d, 0.6) * env(len(t_(d)), 0.002, 0.05)
def boing():
    d = 0.45; tt = t_(d); f = 180 + 260 * (1 - np.exp(-tt * 18)) + 25 * np.sin(tt * 55) * np.exp(-tt * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.003, 0.25)
def whoosh(d=0.45, up=False):
    n = noise(d); n = bp(n, 300, 3500); e = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    lo = np.linspace(400, 2200, len(n)) if up else np.linspace(2200, 400, len(n))
    return lp(n * e, 2600) * (0.6 + 0.4 * lo / 2200)
def swoosh_up(): return whoosh(0.6, up=True)
def snap():      # string snapping: sharp click + falling twang
    d = 0.5; tt = t_(d); ks = karplus(220, d) ; click = hp(noise(0.012), 2000) * np.linspace(1, 0, int(0.012 * SR))
    out = ks * 0.8; click = lp(click, 6000); out[:len(click)] += click * 1.5; f = sweep(900, 160, 0.18, 0.5) * env(int(0.18 * SR), 0.001, 0.1); out[:len(f)] += f * 0.5; return out
def twang():    return karplus(330, 0.6)
def karplus(f, d):
    n = int(d * SR); p = int(SR / f); buf = RNG.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return lp(out, 2600) * env(n, 0.001, d * 0.5, 2.0)
def chime():     # bright magical chime (3 bell partials, staggered)
    d = 1.1; out = np.zeros(int(d * SR))
    for k, (f, st) in enumerate([(1568, 0), (2093, 0.07), (2637, 0.14)]):
        x = (np.sin(2 * np.pi * f * t_(d - st)) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t_(d - st))) * env(int((d - st) * SR), 0.002, 0.35)
        out[int(st * SR):] += x * (1 - 0.15 * k)
    return out
def sparkle():
    d = 0.9; out = np.zeros(int(d * SR))
    for k in range(9):
        st = k * 0.08 + RNG.uniform(0, 0.03); f = RNG.uniform(2400, 4200); dd = 0.25
        x = np.sin(2 * np.pi * f * t_(dd)) * env(int(dd * SR), 0.001, 0.08); i = int(st * SR); out[i:i + len(x)] += x[:len(out) - i] * (1 - k / 12)
    return out
def glow():      # soft rising magic pad
    d = 1.4; tt = t_(d); f = 220 * (1 + tt / d); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3.01 * ph); e = np.sin(np.linspace(0, np.pi, len(tt))) ** 1.5
    sp = sparkle(); sp = np.pad(sp, (0, max(0, len(tt) - len(sp))))[:len(tt)]; return lp(x * e, 1800) + 0.3 * sp
def step():      d = 0.07; return lp(noise(d), 500) * env(int(d * SR), 0.002, 0.03) + 0.6 * np.sin(2 * np.pi * 70 * t_(d)) * env(int(d * SR), 0.002, 0.03)
def steps(n=4, gap=0.32): return cat(*[step() * (0.85 + 0.15 * (i % 2)) for i in range(n)], gap=gap)
def thud():      d = 0.3; return (np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(d * SR))) / SR) + 0.3 * lp(noise(d), 300)) * env(int(d * SR), 0.002, 0.12)
def knock():     return cat(thud()[:int(0.12 * SR)] , thud()[:int(0.12 * SR)], gap=0.12)
def chirp():
    parts = []
    for k in range(3): parts.append(sweep(2600 + 300 * k, 4200, 0.07, 0.7) * env(int(0.07 * SR), 0.003, 0.04))
    return cat(*parts, gap=0.06)
def flap():      d = 0.5; n = bp(noise(d), 200, 1500); m = (np.sin(2 * np.pi * 18 * t_(d)) > 0.3) * 1.0; return lp(n * m, 1500) * env(int(d * SR), 0.01, 0.3)
def drip():      d = 0.18; return sweep(1400, 520, d, 0.4) * env(int(d * SR), 0.001, 0.06)
def buzz():      # phone vibrating twice
    d = 0.32; tt = t_(d); b = np.sign(np.sin(2 * np.pi * 175 * tt)) * 0.6 + np.sin(2 * np.pi * 350 * tt) * 0.4
    one = lp(b, 900) * np.minimum(1, np.minimum(tt / 0.02, (d - tt) / 0.02)); return cat(one, one, gap=0.12)
def tap():       d = 0.03; return bp(noise(d), 1200, 5000) * env(int(d * SR), 0.0005, 0.01)
def typing():    return cat(*[tap() * RNG.uniform(0.6, 1) for _ in range(7)], gap=0.09)
def ding():      d = 0.9; return (np.sin(2 * np.pi * 1320 * t_(d)) + 0.4 * np.sin(2 * np.pi * 3960 * t_(d))) * env(int(d * SR), 0.002, 0.3)
def rustle():    d = 0.5; return bp(noise(d) * (RNG.random(int(d * SR)) > 0.7), 1800, 6500) * np.sin(np.linspace(0, np.pi, int(d * SR)))
def wind():      d = 2.5; n = lp(noise(d), 700); m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t_(d)); return n * m * np.sin(np.linspace(0, np.pi, int(d * SR)))
def gasp():      d = 0.35; return bp(noise(d), 600, 2400) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2
def zip_():      d = 0.7; return bp(noise(d), 1200, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(np.linspace(30, 60, int(d * SR))) / SR)) * np.sin(np.linspace(0, np.pi, int(d * SR)))
def tada():      return cat(chime()[:int(0.5 * SR)], sparkle(), gap=0.0)
# ep 005 (rain): ambient rain bed, thunder, coins, pen scribble, door creak
def rain(d=3.0):  # soft hiss + scattered droplet ticks, fades in/out (use as a bed at -6..-9, one cue per shot)
    n = lp(hp(noise(d), 400), 5200) * 0.55; drops = np.zeros(int(d * SR))
    for _ in range(int(d * 38)):
        i = RNG.integers(0, len(drops) - 2000); f = RNG.uniform(1800, 4200); dd = 0.02
        drops[i:i + int(dd * SR)] += np.sin(2 * np.pi * f * t_(dd)) * env(int(dd * SR), 0.0005, 0.008) * RNG.uniform(0.2, 0.7)
    fade = np.minimum(1, np.minimum(t_(d) / 0.4, (d - t_(d)) / 0.6)); return (n + drops) * fade
def thunder():   # distant crack + long low rumble
    d = 3.2; tt = t_(d); r = lp(noise(d), 160, 3) * (np.exp(-tt * 1.1) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * tt) * np.sin(2 * np.pi * 0.9 * tt)))
    crack = bp(noise(0.25), 300, 2400) * env(int(0.25 * SR), 0.002, 0.08); r[:len(crack)] += crack * 0.6; return r * np.minimum(1, tt / 0.03)
def coins():     # bag of coins jingling / pouring
    d = 1.0; out = np.zeros(int(d * SR))
    for k in range(16):
        st = RNG.uniform(0, 0.7); f = RNG.uniform(3200, 6200); dd = 0.12
        x = (np.sin(2 * np.pi * f * t_(dd)) + 0.5 * np.sin(2 * np.pi * f * 1.51 * t_(dd))) * env(int(dd * SR), 0.0005, 0.04); i = int(st * SR); out[i:i + len(x)] += x[:len(out) - i]
    return out
def scribble():  d = 0.8; return bp(noise(d), 1500, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(5 + 4 * np.sin(2 * np.pi * 1.3 * t_(d))) / SR)) * np.sin(np.linspace(0, np.pi, int(d * SR)))
def rewind():    # tape-rewind swish for the cut from the hook back to the start
    d = 0.55; tt = t_(d); w = whoosh(d, up=True)[::-1]; warble = np.sin(2 * np.pi * np.cumsum(900 - 700 * tt / d + 80 * np.sin(2 * np.pi * 14 * tt)) / SR) * 0.25
    return (w + warble) * np.sin(np.linspace(0, np.pi, len(tt)))
def impact():    # scroll-stopping hit for frame 0 of the hook (owner 2026-11-21): sub boom + cinematic crack + bright air
    d = 1.1; tt = t_(d); boom = np.sin(2 * np.pi * np.cumsum(np.linspace(95, 32, len(tt))) / SR) * env(len(tt), 0.001, 0.45)
    crack = hp(noise(d), 2500) * env(len(tt), 0.0005, 0.05); body = lp(noise(d), 900) * env(len(tt), 0.001, 0.18)
    return boom + 0.55 * crack + 0.5 * body
def creak():     d = 0.7; tt = t_(d); f = 140 + 60 * np.sin(2 * np.pi * 1.4 * tt); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (np.sin(2 * np.pi * 31 * tt) > 0); return bp(x, 300, 2200) * np.sin(np.linspace(0, np.pi, len(tt)))

# ---- richer palette (owner 2026-11-25: "richer sound effects like creaking roofs or thuds would boost immersion") ----
def heartbeat(n=3, gap=0.62):   # lub-dub thumps for tension (use as a bed at -6..-3 under scary beats)
    beat = lambda f: np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 0.6, int(0.12 * SR))) / SR) * env(int(0.12 * SR), 0.003, 0.05)
    one = cat(beat(62), beat(52) * 0.7, gap=0.08); return cat(*[one] * n, gap=gap)
def door():      return cat(creak()[:int(0.55 * SR)] * 0.8, thud()[:int(0.18 * SR)], gap=0.02)   # creaky door swinging + latch thump
def roofcreak(): d = 1.6; tt = t_(d); f = 70 + 25 * np.sin(2 * np.pi * 0.6 * tt); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (np.sin(2 * np.pi * 17 * tt) > -0.2); return bp(x, 150, 1400) * np.sin(np.linspace(0, np.pi, len(tt))) ** 1.5   # slow, low timber groan
def woodsteps(n=4, gap=0.34):   # footsteps on boards: thump + board knock
    st = lambda: lp(noise(0.09), 900) * env(int(0.09 * SR), 0.002, 0.04) + 0.7 * np.sin(2 * np.pi * 95 * t_(0.09)) * env(int(0.09 * SR), 0.002, 0.04)
    return cat(*[st() * (0.8 + 0.2 * (i % 2)) for i in range(n)], gap=gap)
def roomtone(d=3.0):   # quiet indoor air/hum bed (use at -8..-12, one cue per indoor shot) so interiors aren't dead silent
    n = lp(noise(d), 400) * 0.6 + 0.25 * np.sin(2 * np.pi * 60 * t_(d)) + 0.1 * np.sin(2 * np.pi * 120 * t_(d)); return n * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 0.3
def crowd(d=2.5):      # distant crowd murmur (bandpassed babble)
    x = sum(bp(noise(d), 300 + 120 * k, 900 + 200 * k) * (0.5 + 0.5 * np.sin(2 * np.pi * (2 + k * 0.7) * t_(d) + k)) for k in range(5)); return x * np.sin(np.linspace(0, np.pi, int(d * SR)))
def rumble(d=2.0):     # deep rumble for something huge moving / earth shaking
    return lp(noise(d), 120) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t_(d))) * np.sin(np.linspace(0, np.pi, int(d * SR)))
def splash():  d = 0.6; return bp(noise(d), 400, 5000) * env(int(d * SR), 0.004, 0.22) + 0.4 * sweep(500, 140, d, 0.5) * env(int(d * SR), 0.002, 0.1)
def glass():   return cat(*[np.sin(2 * np.pi * f * t_(0.25)) * env(int(0.25 * SR), 0.001, 0.08) for f in (2900, 3600, 4400)], gap=0.04)   # glassy clink/tinkle
def bigwhoosh(): return whoosh(0.9) + 0.6 * lp(noise(0.9), 250) * np.sin(np.linspace(0, np.pi, int(0.9 * SR)))

# ---- railway + clock palette (episode 021) ----
def whistle(d=1.3):    # steam train whistle: three slightly detuned reedy tones + breath, quick swell, falling tail
    tt = t_(d); bend = 1 - 0.035 * np.clip((tt - d * 0.6) / (d * 0.4), 0, 1)
    x = sum(a * np.sign(np.sin(2 * np.pi * np.cumsum(f * bend) / SR)) for f, a in ((392, 1.0), (494, 0.8), (587, 0.6)))
    x = bp(x, 300, 2600) + 0.5 * bp(noise(d), 1500, 6000); e = np.minimum(1, tt / 0.08) * np.minimum(1, (d - tt) / 0.35); return x * e
def chuff(n=5, gap=0.3):   # steam loco pulling away: breathy chuffs that speed up
    one = lambda k: bp(noise(0.22), 200, 2400) * env(int(0.22 * SR), 0.01, 0.09) + 0.5 * np.sin(2 * np.pi * 60 * t_(0.22)) * env(int(0.22 * SR), 0.004, 0.06)
    out = np.zeros(0)
    for k in range(n): out = np.concatenate([out, one(k) * (0.75 + 0.25 * (k % 2)), np.zeros(int(max(0.05, gap * (0.9 ** k)) * SR))])
    return out
def hiss(d=1.0):       return bp(noise(d), 2500, 9000) * np.minimum(1, t_(d) / 0.05) * np.exp(-2.2 * t_(d) / d)   # steam release / brakes
def ticktock(n=4, gap=0.5):   # big station clock: alternating woody tick and lower tock
    tk = lambda f: (bp(noise(0.03), f, f * 3) * env(int(0.03 * SR), 0.0005, 0.012) + 0.5 * np.sin(2 * np.pi * f * 0.5 * t_(0.03)) * env(int(0.03 * SR), 0.001, 0.01))
    return cat(*[tk(1500 if i % 2 == 0 else 1100) for i in range(n)], gap=gap - 0.03)
def clunk():           return cat(tap() * 0.8, thud()[:int(0.16 * SR)], gap=0.0)   # a heavy clock hand / latch dropping into place

SOUNDS = {'pop': pop, 'boing': boing, 'whoosh': whoosh, 'swoosh_up': swoosh_up, 'snap': snap, 'twang': twang, 'chime': chime, 'sparkle': sparkle,
          'glow': glow, 'step': step, 'steps': steps, 'thud': thud, 'knock': knock, 'chirp': chirp, 'flap': flap, 'drip': drip, 'buzz': buzz,
          'tap': tap, 'typing': typing, 'ding': ding, 'rustle': rustle, 'wind': wind, 'gasp': gasp, 'zip': zip_, 'tada': tada,
          'rain': rain, 'thunder': thunder, 'coins': coins, 'scribble': scribble, 'creak': creak, 'rewind': rewind, 'impact': impact,
          'heartbeat': heartbeat, 'door': door, 'roofcreak': roofcreak, 'woodsteps': woodsteps, 'roomtone': roomtone, 'crowd': crowd, 'rumble': rumble,
          'splash': splash, 'glass': glass, 'bigwhoosh': bigwhoosh,
          'whistle': whistle, 'chuff': chuff, 'hiss': hiss, 'ticktock': ticktock, 'clunk': clunk}

# Owner feedback (2026-11-17): effects must stay subtle background sounds that never cover the narrator.
HOUSE_DB = -14.0      # owner 2026-11-25: +3 dB (louder, still under the voice) — cue loudness relative to the narration's speech RMS (between lines: clearly audible)
# Owner: effects play exactly on the action and overlap the narration like normal SFX — never moved into pauses —
# but they must not drown the voice. So under speech they are only gently ducked, thinned in the speech band, and capped.
DUCK_DB = -4.0        # gentle reduction while the narrator is talking (starts 80 ms before each word)
CEIL_DB = -11.0       # while talking, effects never get closer than this to the voice's moment-to-moment level
def active_rms(x):
    a = np.abs(x); m = a > a.max() * 0.08; return float(np.sqrt(np.mean(x[m] ** 2))) if m.any() else 1e-6
def db(v): return 10 ** (v / 20)

def build(ep):
    out = os.path.join(ep, 'out'); timing = json.load(open(os.path.join(out, 'timing.json')))
    voice, sr = sf.read(os.path.join(out, 'narration.wav')); assert sr == SR, sr
    if voice.ndim > 1: voice = voice.mean(1)
    total = len(voice) + int(2.0 * SR)
    starts = [0.0] + [t['start'] for t in timing[1:]]; ends = starts[1:] + [total / SR]
    cues = json.load(open(os.path.join(ep, 'sfx.json'))) if os.path.exists(os.path.join(ep, 'sfx.json')) else []
    bus = np.zeros(total)
    vrms = active_rms(voice)
    # where is the narrator speaking? (50 ms envelope, 80 ms look-ahead so ducks begin before the word, 200 ms hold after)
    v = np.concatenate([voice, np.zeros(total - len(voice))]); w = int(0.05 * SR)
    envv = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, 'same')); speech = envv > vrms * 0.2
    la, hold = int(0.08 * SR), int(0.2 * SR)
    sp = np.convolve(speech.astype(float), np.ones(la + hold), 'full')[hold:hold + total] > 0
    for c in cues:
        line, at, name = c[0], c[1], c[2]; g = c[3] if len(c) > 3 else 0.0
        if name not in SOUNDS: print('unknown sfx', name); continue
        s, e = starts[line - 1], ends[line - 1]
        off = (e - s) * float(at[:-1]) / 100 if isinstance(at, str) and at.endswith('%') else float(at)
        x = SOUNDS[name](); x = x / (np.abs(x).max() + 1e-9); x *= vrms * db(HOUSE_DB + g) / active_rms(x)
        lim = db(-3) if name == 'impact' else db(-8)   # the frame-0 hook hit may punch harder than ordinary cues (it lands before the first word)
        if name == 'impact': x *= db(9)
        x = np.clip(x, -lim, lim); i = int((s + off) * SR)   # exactly on the action
        if i >= total: continue
        bus[i:i + len(x)] += x[:total - i]
    # space: short synthetic room reverb (owner 2026-11-25 immersion) — 20% wet, 0.4 s decay
    ir_n = int(0.4 * SR); ir = RNG.standard_normal(ir_n) * np.exp(-np.linspace(0, 7, ir_n)); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    from scipy.signal import fftconvolve
    if bus.any(): wet = fftconvolve(bus, ir)[:total]; bus = bus + 0.2 * wet * active_rms(bus) / (active_rms(wet) + 1e-9)
    # under speech: duck, carve the speech band (1-4 kHz) out of the effects, and cap them under the voice's level
    sm = int(0.06 * SR); talking = np.convolve(sp.astype(float), np.ones(sm) / sm, 'same')
    bus = bus - 0.35 * bp(bus, 1000, 4000) * talking
    bus *= 1 + (db(DUCK_DB) - 1) * talking
    envs = np.sqrt(np.convolve(bus ** 2, np.ones(w) / w, 'same')) + 1e-9
    ceil = np.where(sp, np.minimum(1.0, (envv + vrms * 0.05) * db(CEIL_DB) / envs), 1.0)
    g = np.convolve(ceil, np.ones(sm) / sm, 'same'); bus *= np.minimum(1.0, g)
    mix = v + bus; pk = np.abs(mix).max()
    if pk > db(-1): mix *= db(-1) / pk
    sf.write(os.path.join(out, 'sfx.wav'), bus.astype(np.float32), SR); sf.write(os.path.join(out, 'mix.wav'), mix.astype(np.float32), SR)
    print(f'sfx: {len(cues)} cues -> out/mix.wav ({total / SR:.1f}s)')

def remux(ep):
    out = os.path.join(ep, 'out')
    for name in ('final.mp4', 'episode.mp4'):
        f = os.path.join(out, name)
        if not os.path.exists(f): continue
        tmp = f[:-4] + '_tmp.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-i', os.path.join(out, 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                        '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
        os.replace(tmp, f); print('remuxed', f)

if __name__ == '__main__':
    if sys.argv[1] == '--demo':
        sf.write('/tmp/sfx_demo.wav', np.concatenate([np.concatenate([SOUNDS[k]() / (np.abs(SOUNDS[k]()).max() + 1e-9) * 0.5, np.zeros(SR // 2)]) for k in SOUNDS]).astype(np.float32), SR)
        print('demo ->/tmp/sfx_demo.wav', list(SOUNDS))
    else:
        build(sys.argv[1])
        if '--remux' in sys.argv: remux(sys.argv[1])
