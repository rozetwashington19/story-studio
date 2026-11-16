# Daily episode runbook

Goal: one new, original ~2:20 vertical (1080×1920) 3D Roblox-style story short per day, in the
"In this world…" format. New premise, new characters every day. **Narration only, no music.**

Total time budget ≈ 2.75 h: setup 8 min · story 15 min · narration 15 min · shots 40 min · previews/fixes 20 min · render ~80 min · delivery 5 min.

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
Formula (measured from the reference videos):
1. Line 1: "In this world," — line 2: the rule.
2. "You see, …" explains how it works (1–2 lines).
3. 3–4 quick gags showing the rule on side characters (teacher, parent, sibling, neighbor…), 2 lines each: setup + punchline.
4. "I'm <Name>. I'm <age>." + a hook that breaks the rule for the narrator.
5. Fun at first (2–3 beats), then it goes wrong (2–3 beats).
6. A search or problem escalates; a discovery.
7. Emotional reveal (what the rule was really about for the narrator), a sacrifice or choice.
8. Resolution + a callback to an earlier gag + a short final line that lands emotionally.
- 70–80 lines, 460–500 words → about 2:15–2:35 at the narrator's pace. One line = one shot. Keep lines short (≤ 12 words).
- First-person kid narrator. Dialogue goes in "double quotes" and also gets a speech bubble.
- End a line with ` [pause]` for a dramatic beat (use ~8–12 times: big reveals, sad moments, final line).
- Write `notes.md`: premise, characters (name, look), sets needed, one-sentence logline.

Then run `python3 engine/voice.py episodes/NNN-slug` (≈12–15 min; run it with nohup and poll) → prints duration.
Adjust the script if outside 2:05–2:40. voice.py speaks each line in context with the previous one (smoother flow), trims tails
cleanly (no ringing), and checks every line with Whisper (`~/models/sherpa-onnx-whisper-base.en`, from setup.sh). Read the
`CHECK:` lines it prints: most are spelling quirks ("Juneau", "10"), but if a line is garbled or contains a word from the
previous line, redo just those lines solo: `ONLY=51,55 python3 engine/voice.py episodes/NNN-slug` (keeps all other lines).

## 3. Write `bubbles.json`
`{"<line number>": ["Bubble text", x 0–1, y 0–1]}` — x is the bubble center, y the top edge
(0.06–0.17 typical; keep above the speaker's head, never over the caption zone at y≈0.55–0.65).

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
- New characters: vary skin (tan, light, brown, yellow, pale), shirt colors/styles, pants, hair style (14 styles, see KIT.md —
  no two characters in an episode share a style) and hair color, and hats. Give the narrator a distinct look from previous episodes.

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
≈1.1 s per frame (≈75–80 min for 2:20). Poll the log. Output: `out/final.mp4` (~50 MB).
Sanity check: `ffprobe` duration ≈ narration duration; extract a 30-frame contact sheet and look at it.

## 7. Deliver
- Send `out/final.mp4` to the user with a one-line caption: title + logline.
- Add a line to `episodes/INDEX.md`: `NNN | date | title | premise | narrator name | logline`.
- Commit the episode source (script, bubbles, notes, shots, any new faces/sets — not `out/`) and push.
  Two episodes are made per day by separate runs, so before pushing: `git fetch --depth=50 origin main` and
  `git rebase origin/main`. If another run already added an episode with your number, rename your folder to the next free
  number, fix its INDEX line, and also make sure your premise isn't the one it just added (if it is, say so in the final message).
  Resolve INDEX.md conflicts by keeping both lines.
- Final message: the logline and 1–2 honest notes about any weak shots.
