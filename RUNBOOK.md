# Daily episode runbook

Goal: one new, original **1:20–1:30** vertical (1080×1920) 3D Roblox-style story short per day, in the
"In this world…" format. New premise, new characters every day. **Narration + small sound effects, no music.**

**Length: 1:20–1:30 (80–90 s), chosen per story.** Owner decision 2026-11-17: shorter than the old ~2:20, but long enough for a real arc.
Lighter/funny premises land near 1:20; emotional ones with a search + reveal can use the full 1:30. Never under 1:15 or over 1:35.
This overrides any older length in a scheduled prompt or earlier episode. Episodes 001–003 are the old 2:20 format — copy their code patterns, not their length.

Total time budget ≈ 2.75 h: setup 8 min · story 12 min · narration 9 min · shots 45 min · previews/fixes 20 min · render ~90 min · delivery 5 min.
The time saved by the shorter format goes into **quality**: fewer shots, each one richer (see §4c), and a higher-quality render.

**Narrator voice:** the series is narrated in the owner's own voice, cloned locally by `engine/voice.py` from
`engine/voice/narrator_ref.wav`. Never replace or edit that reference. Pace is deliberately relaxed (owner: "don't make it
too fast") — keep `VOICE_TEMPO` at its default 1.08. The Kokoro fallback is used only if the clone model fails; if that
happens, say so in the final message.
Long renders: run them in the background with `nohup … &` and poll the log with `sleep 590; tail -1 log` in
foreground calls (each foreground call is capped at 10 minutes). Never end your turn while a render is running.

## 0. Setup
```
./setup.sh
```
Read `KIT.md` (toolkit API) and skim `episodes/001-shadow/` (a complete worked example: script.txt, bubbles.json, shots_a.js, shots_b.js).

## 1. Pick a premise
- `git pull` first (another run may have added an episode since you cloned), then read `episodes/INDEX.md`. Never reuse a premise, main character name, or core twist listed there.
- A premise is one impossible rule about the world that is visual and has emotional potential
  (examples of the *kind*: "every word costs money", "rumors come true", "the sea drains every 100 years",
  "your shadow shows how you really feel"). Do not copy the example premises.
- Kid-friendly. Original story — never retell an existing film, book, show or someone else's video.

## 2. Write `episodes/NNN-slug/script.txt` (NNN = next number)
Formula (80–90 s version — the full arc, kept tight):
1. Line 1: "In this world," — line 2: the rule.
2. "You see, …" explains how it works (1 line).
3. 2–3 quick gags showing the rule on side characters (teacher, parent, sibling, neighbor…), 2 lines each: setup + punchline.
4. "I'm <Name>. I'm <age>." + a hook that breaks the rule for the narrator.
5. Fun at first (2 beats), then it goes wrong (2 beats).
6. A search or escalation (3–4 lines); a discovery.
7. Emotional reveal + a choice or sacrifice (4–6 lines, give it room — this is what the extra time is for).
8. Resolution + a callback to one gag + a short final line that lands emotionally.
- 42–50 lines, 260–300 words → about 1:20–1:30 at the narrator's pace (≈3.4 words/s incl. pauses; ~265 words ≈ 1:20, ~295 ≈ 1:30). One line = one shot. Keep lines short (≤ 10 words).
- Every line must earn its place: one idea per line, no recap lines, at most 3 speaking characters besides the narrator.
- First-person kid narrator. Dialogue goes in "double quotes" and also gets a speech bubble.
- End a line with ` [pause]` for a dramatic beat (use ~6–8 times: big reveals, sad moments, final line).
- Write `notes.md`: premise, characters (name, look), sets needed, one-sentence logline.

Then run `python3 engine/voice.py episodes/NNN-slug` (≈7–10 min; run it with nohup and poll) → prints duration.
Adjust the script if outside 1:15–1:35. voice.py speaks each line in context with the previous one (smoother flow), trims tails
cleanly (no ringing), and checks every line with Whisper (`~/models/sherpa-onnx-whisper-base.en`, from setup.sh). Read the
`CHECK:` lines it prints: most are spelling quirks ("Juneau", "10"), but if a line is garbled or contains a word from the
previous line, redo just those lines solo: `ONLY=51,55 python3 engine/voice.py episodes/NNN-slug` (keeps all other lines).

## 3. Write `bubbles.json`
`{"<line number>": ["Bubble text", x 0–1, y 0–1]}` — x is the bubble center, y the top edge
(0.06–0.17 typical; keep above the speaker's head, never over the caption zone at y≈0.55–0.65).

## 3b. Write `sfx.json` (small sound effects — mandatory)
The owner wants light sound effects on the animations: noticeable, but never competing with the voice. `engine/sfx.py` synthesizes
them (no samples, no music) and mixes them ~14 dB under the narration, ducking a further 4 dB while the narrator speaks.
`[[line, at, name, gain_db?], …]` — `line` = script line, `at` = seconds after that shot starts or `"40%"` of the shot, `gain_db` = trim (-10…+3).
Sounds: pop boing whoosh swoosh_up snap twang chime sparkle glow step steps thud knock chirp flap drip buzz tap typing ding rustle wind gasp zip tada.
- Put cues on visible actions, timed to the animation (a snap when a string breaks, steps while walking, a whoosh on a fast move,
  a chime/sparkle/glow on magic, a buzz on a phone, wind outdoors). About one cue per 1–3 shots (~20–35 per episode). Silence on
  the saddest lines and on the final line is fine — leave room for the voice.
- Ambient beds (`wind`) at -6 to -8; frequent sounds (`steps`, `rustle`) at -4 to -6; the big moments (the twist, the climax) at 0 to +2.
- `render.py video` mixes it automatically (out/mix.wav). To fix levels after a render without re-rendering: edit sfx.json, then
  `python3 engine/sfx.py episodes/NNN-slug --remux`. Worked example: `episodes/003-kite/sfx.json`.

## 4. Write `shots.js` (export `SHOTS`, exactly one function per script line)
Copy the pattern from `episodes/001-shadow/shots_b.js`. Each entry `(S, cam) => { build set + actors; return (t, dur) => { animate } }`.
Split into `shots_a.js` / `shots_b.js` if long. Lessons learned (follow these):
- **Everything moves.** Every shot has a camera move (`camPath` push-in/pan/drift) AND character motion
  (idle sway, gestures via `track` keyframes, walk cycles, `sob`, jumps). No frozen frames.
- **Cut rhythm:** lines longer than ~2.2 s get an internal cut with `seg(t, dur, [0.5])` (different angle).
- **Framing (9:16 is narrow!):** horizontal half-width ≈ distance × 0.28 at lens 30. Face close-up: lens 40–50 at
  distance 4.5–6 from the head (head center y≈4.6 standing, ≈3.1 sitting on the ground). Two people side by side:
  distance ≥ 9 at lens 30. Never put the camera closer than 3 units to a head.
- **Characters face +Z** (toward a camera at +Z). Rotation `ry` in degrees turns them; 180 = back to camera.
  Avoid back-of-head shots for emotional lines — use a 3/4 angle instead.
- **Wall shadows / silhouettes:** `wallShadow(S, opts, [x, wallFrontZ+0.03])`; `profile:true` for side poses
  (walking, bending, huddling). Floor shadows: `floorShadow`. Make silhouette poses readable in profile.
- **Night scenes** must keep faces lit: `playground()`/`porch()`/`bedroom()` include key lights; for any other
  night set add a soft PointLight between the subject and the camera side. Check previews for black faces.
- Interiors: the camera must stay inside the room (room walls at x=±w/2, back wall z=zBack, ceiling y=h).
- Use `S.userData.look = 'flash'` for flashbacks (warm faded grade), `'night'` for night.
- New sets: build from `box()`, procedural canvas textures (`T`, `T2`), rounded boxes; add detail props.
  Put reusable new sets/helpers into `engine/kit.js` or `engine/sets2.js` so future episodes can use them.
- New faces: draw with PIL like `tools/faces2.py` (512×512 transparent PNG, eyes ≈ y 200, mouth ≈ y 330),
  save to `engine/faces/<name>.png`. Existing: smile grin shock sad smirk neutral worried cry teary fakesmile determined softsmile.
- New characters: vary skin (tan, light, brown, yellow, pale), shirt colors/styles, pants, hair style and hair color (see the
  age table in KIT.md — no two characters in an episode share a style), and hats. Make ages read at a glance: grandparents get
  gray/white hair + `wrinkles` (+ beard/mustache for grandpas), dads/teachers adult styles, kids `freckles`/`rosy`.
- Use the full range of expressions (33 faces, KIT.md); switch faces mid-shot for reactions instead of holding one face. Give the narrator a distinct look from previous episodes.

## 4c. Cinematic quality (mandatory — this is where the extra time goes)
The renderer now adds automatically (engine/main.html, `q=1`): SMAA anti-aliasing, a rim light behind the subject (edge highlights),
depth of field on lenses ≥ 30 (focus = the camPath look-at point, so aim it at the face), and a subtle handheld drift.
Per scene you can tune: `S.userData.rimIntensity`, `S.userData.rim = false`, `S.userData.dofScale` (2 = stronger blur), `S.userData.dof = false`,
`S.userData.handheld = false` (for locked-off shots). Optional, slower: `&ibl=1` (flatter), `&ao=1` (+2.4 s/frame), `&msaa=4` (+2 s/frame).
Your job per shot:
- **Lighting:** every set has a motivated key (sun/lamp/window) plus a warm/cool contrast. Emotional climaxes at golden hour or by a lamp;
  night shots get a practical light near the faces. Check previews for flat, evenly-lit frames and add a key `PointLight`/`SpotLight` if needed.
- **Lenses:** establishing 22–26, mediums 28–30, close-ups 34–40 (DOF kicks in). At least 1/3 of shots are close-ups on faces.
- **Camera:** always moving with intent — slow push-in on emotional lines, low angle for triumph, dolly alongside walkers, a reveal
  (tilt/pan) for discoveries. Use `faceCam` (episodes/003-kite/common.js) so close-ups are from the front or 3/4.
- **Animation:** pose hits use `hit()` (overshoot-and-settle) not linear; add `anticipate()` before jumps/throws; the speaker during a
  dialogue line gets `talk(t)` added; eyelines use `lookAt(A, point)` (characters look at each other / at the thing that matters);
  stagger timing between characters (offset `t` per character); everybody breathes (`idle`). No character is ever frozen.
- **Expressions:** change faces within a shot when the emotion turns (`setFace` at the right moment), and use the full face library.
- **Textures/props:** dress every set with 3+ detail props (frames, plants, toys, clutter) so no wall or floor is empty; prefer textured materials
  (`T`, `T2`, `repeatMat`) over flat colors for large surfaces.
- Drafts: `Q=0 python3 engine/render.py … stills` renders previews fast without the quality passes; do the final preview pass at `q=1`.

## 4b. No clipping (mandatory)
Characters must never pass through each other or through objects. Rules:
- Give every avatar a name: `makeAvatar({ ...MIA, name: 'mia' })` — the checker reports by name.
- Spacing (centre to centre, see `SPACING` in kit.js): side by side ≥ 4.3 (an avatar is 4 wide with arms);
  arms raised sideways ≥ 6.5; facing each other ≥ 2.6; facing with arms forward ≥ 4.6. Group shots: line people up
  with these gaps and widen the camera instead of squeezing them together.
- Arms reaching forward/inward (`rFwd`, negative `rUp`) must not reach into a neighbour or a table/wall — check the pose.
- Sitting: `sitOn(A, seatTopY)` (ground: `sitGround(A)`). Legs stick 2 units forward from the hips, so leave that space
  clear (no seat backs, tables or people in front closer than 2.2). In vehicles/benches give each seat 4.3 of width.
- Walk paths: walkers must not cross through other characters or props; keep 1+ unit of clearance from walls/furniture.
- Props held in a hand go at the hand position (see 001 line 26), never through the body.
- Intended contact only (a hug, a hand on a shoulder): whitelist it in that shot with
  `S.userData.allowContact = [['mom', 'leo']]`.
Run the checker after writing shots and fix until it reports **0** problems:
```
python3 engine/render.py episodes/NNN-slug clips            # all shots, 7 moments each -> out/clips.txt
python3 engine/render.py episodes/NNN-slug clips 12 30      # re-check specific lines
```
Fix by moving characters apart, changing poses, moving props, or (last resort) cutting to a tighter angle that
leaves the other character out. Never "fix" by whitelisting accidental overlaps.

## 5. Preview and fix (mandatory)
```
python3 engine/render.py episodes/NNN-slug stills            # all shots, 2 frames each -> out/preview.jpg
python3 engine/render.py episodes/NNN-slug stills 12 13 40   # specific lines
```
Crop the sheet into rows (Pillow) and look at every frame. Fix: characters cut off / out of frame, camera inside
geometry, black or blown-out faces, unreadable silhouettes, bubble covering a face, wrong set for the line,
console `PAGEERROR`s, and anything visibly clipping that the checker missed (it only knows box() props). Re-preview fixed shots. Up to 3 fix rounds.
For close-ups, also check 2–3 frames at full resolution: `python3 engine/render.py episodes/NNN-slug frame <line> 0.5` → `out/frame_<line>.png`
(look for face artifacts, hair detail, caption/bubble overlap).

## 6. Render (only after clips = 0 and previews pass)
```
nohup python3 engine/render.py episodes/NNN-slug video > episodes/NNN-slug/out/render.log 2>&1 &
```
≈2.0–2.3 s per frame with the quality passes (≈85–105 min for 1:20–1:30). Keep the quality passes on (`q=1`, the default). Poll the log. Output: `out/final.mp4` (~50 MB).
Sanity check: `ffprobe` duration ≈ narration duration; extract a 30-frame contact sheet and look at it.

## 7. Deliver
- Send `out/final.mp4` to the user with a one-line caption: title + logline.
- Add a line to `episodes/INDEX.md`: `NNN | date | title | premise | narrator name | logline`.
- Commit the episode source (script, bubbles, sfx.json, notes, shots, any new faces/sets — not `out/`) and push.
  Two episodes are made per day by separate runs, so before pushing: `git fetch --depth=50 origin main` and
  `git rebase origin/main`. If another run already added an episode with your number, rename your folder to the next free
  number, fix its INDEX line, and also make sure your premise isn't the one it just added (if it is, say so in the final message).
  Resolve INDEX.md conflicts by keeping both lines.
- Final message: the logline and 1–2 honest notes about any weak shots.
