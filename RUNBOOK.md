# Daily episode runbook

Goal: one new, original **1:20–1:30** vertical (1080×1920) 3D Roblox-style story short per day, in the
"In this world…" format (or a cold open — see step 1). New premise, new characters every day. **Narration + small sound effects, no music.**

**Owner feedback (2026-11-18) — applies to every episode:**
- Keep: the lighting on the models (motivated key + rim, practical lights on faces) and the clean animation. Keep improving the writing.
- Fixed in the engine: narration must sound natural — no robotic delivery, random silences, clipped endings or repeated words (voice.py now records each
  passage as one continuous take and Whisper-checks it; see step 2). The voice should match the scene: use delivery tags (step 2).
- Captions now sit lower (70% height). Every episode opens with a 1–2 s **hook** (flash-forward of the climax). More **wild** stories (~60%), and only
  about half the episodes open with "In this world" (`pick_mode.py` rolls the OPENER).

**Owner rule (2026-11-20) — brand-new environments every episode:** "Always generate a new environment / background for the story.
I don't want to see backgrounds used in previous videos." Never build a shot on a set/world listed in `episodes/SETS.md` (not even for a
one-line gag). Every location in the episode is a new environment you build for it (step 4d), then you add them to SETS.md at delivery.
This overrides older advice below to reuse everyday sets (bedroom, kitchen, street…) or the themed worlds already used.

**Owner request (2026-11-21) — three growth habits from "Shorts stuck at 1K views", built into the steps below:**
- **Different ideas, same niche (step 1):** `pick_mode.py` now also rolls a story ANGLE (escalation, mystery, chase, secret-helper…) that
  wasn't used in the last 3 episodes, and doubles down on any episode the owner marks **WINNER** in `episodes/PERFORMANCE.md`.
- **Win the first 3–4 seconds (steps 2, 3b, 3c):** frame 0 is already mid-action on the climax, with a bold title card (`hook.json`), an
  `impact` hit sound on frame 0, and a fast, visual line 2. No slow establishing shots before second 4.
- **Custom thumbnail (step 6b):** every episode ships `out/thumbnail.jpg` (`thumb.json` + `render.py … thumb`), sent with the video.

**Owner rule (2026-11-22) — stories for all ages, not only kids:** "Maintain the current Roblox style we have and make the story for all ages,
not only for kids. In fact, moving forward don't make the animation stories to be only meant for kids." Same Roblox look; but the stories,
stakes and narrators can be teens or adults, with real tension, real scares, grown-up worries and humour adults enjoy too. Still YouTube-safe:
no gore, blood, graphic violence, weapons violence or swearing. This overrides every "kid-friendly" / "kid narrator" line below and in the
scheduled prompts.

**Owner rule (2026-11-22, evening) — HOLD: no new videos while a vote is pending.** "Wait for results before generating any new videos!"
While `episodes/series/fog/SERIES.md` shows a vote result of `?` for the latest delivered part, **no run makes any video — not a series part and not a standalone
episode, midday or evening.** This overrides the "make a normal standalone episode instead" line in RUNBOOK and in the scheduled prompts. Such a run only: `git pull`,
check SERIES.md, send the owner one push notification ("Waiting for your Part N vote — no video made"), and stop. As soon as the owner reports the result, record it
(see below), and the next run makes the next part.

**Owner request (2026-11-22) — choose-your-path series (5 parts), then back to normal:** an ACTIVE series lives in `episodes/series/<name>/SERIES.md`
(currently `episodes/series/fog/`). Read it at step 1 on every run:
- **Evening run only:** if a series is ACTIVE and its next part is unlocked (Part 1, or the previous part's vote result is filled in), make that part,
  following SERIES.md (it overrides the premise, narrator, cast and opener steps; everything else in this runbook still applies) and write `vote.json`
  (end card, engine/captions.py). If the next part is locked (vote result still `?`), make a normal standalone episode and say in the final message that the
  series is waiting for the owner's Part N−1 vote. The midday run always makes normal standalone episodes.
- **Any run:** if the owner tells you a vote result, record it in SERIES.md, commit and push it before anything else.
- After the final part, SERIES.md is set to DONE and all runs go back to normal episodes.

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

## 1. Roll the mode, then pick a premise
- `git pull` first (another run may have added an episode since you cloned), then read `episodes/INDEX.md`. Never reuse a premise, main character name, or core twist listed there.
- **Owner requests come first:** read `episodes/REQUESTS.md`. If any request is `OPEN`, take the first one instead of rolling a
  random mode: immediately change its status to `CLAIMED (episode NNN, date)`, commit and push that one-line change *before doing
  anything else* (so the other daily run can't take the same request), then build the episode from it. The request's premise,
  visual style and guidance override the random mode and premise steps below (all other runbook rules still apply). At delivery,
  set it to `DONE (episode NNN)`. If no request is OPEN, continue with the random mode below.
- **Read `episodes/PERFORMANCE.md`** (the owner's view counts). If it marks a WINNER, `pick_mode.py` may print `DOUBLE DOWN on winner NNN`:
  then copy that episode's mode, tone, pacing and story shape (read its script + notes for *why* it worked) with a brand-new premise, cast and sets.
- **Roll the story mode:** `python3 tools/pick_mode.py` → `wild` (~60%) or `heartfelt` (~40%), the OPENER (`in-this-world` or `cold-open`) and the
  story ANGLE. Build the premise around the angle so consecutive episodes feel different (record `Angle:` in notes.md — the next runs avoid it).
  Variety check before writing: the premise must not share its core twist type, setting type or main gag with the last 3 episodes in INDEX.md,
  and it needs at least one genuinely surprising beat (a gag or reveal a viewer would not predict from the first 10 s).
  It is random on purpose so the series mixes both; don't override it. Owner wants wilder stories: go big — bigger creatures, bigger stakes,
  stranger rules (owner's example of the kind: "Every morning creatures attack during the day, and it's only safe at night"). Record it in `notes.md` (`Mode:` line) and in the INDEX `mode` column.
- **heartfelt:** one impossible rule about the world that is visual and has emotional potential
  (examples of the *kind*: "every word costs money", "rumors come true", "the sea drains every 100 years",
  "your shadow shows how you really feel"). Everyday settings (home, school, street). Ends on an emotional beat.
- **wild:** a fun, high-concept rule with creatures, magic or sci-fi that escalates fast and visually
  (the *kind*: "every time you blink, a monster appears", "your pet can shrink you", "gravity flips at lunch",
  "every lie turns into a tiny dragon"). Pick the tone that fits the premise:
  *spooky* — creepy Roblox-horror creatures (`creature()`: stalker/brute/crawler/shade) in a dark world, real suspense, glowing eyes
  in the dark, chases, a jump-scare on the action (with a sfx hit) — but never gory, no blood, no one gets hurt, and the kids win
  by being clever; or *silly* — cute-blocky `monster()`s that end up friendly or outsmarted. Mix both when it suits the story. Bigger stakes, chases, set pieces and jokes; the
  ending is a clever or funny twist (a small heartfelt touch is welcome but not required). Use the same script formula,
  with gags that show the rule's chaos instead of sad side characters.
  **Backgrounds must match the theme:** build most shots in a themed world from `engine/themes.js` (pick_mode suggests two
  that weren't used recently — use one of them unless the premise clearly needs another) and contrast it with everyday sets
  (e.g. the bedroom where it starts). Use the world's `update(t)` for ambient motion in every shot that uses it.
- Do not copy the example premises. For all ages (owner rule 2026-11-22), YouTube-safe. Original story — never retell an existing film, book, show or someone else's video.

## 2. Write `episodes/NNN-slug/script.txt` (NNN = next number)
Formula (80–90 s version — the full arc, kept tight):
0. **Line 1 = the hook** (1–2 s, ≤ 6 words): a flash-forward of the climax, spoken over the climax shot (`hook()` in kit.js reuses that shot),
   e.g. "Forty years. That's what I traded." / "It was right behind me." End it with a `rewind` sfx, then the story starts from the beginning.
   **The first 3–4 seconds decide whether YouTube keeps pushing the short (owner 2026-11-21):** the hook line is a curiosity gap (a shocking
   fact, a number, a threat — never a greeting or setup); pick `hook(…, { at })` so frame 0 is already mid-action on the most striking image
   (a creature's face, the big reveal), never a wide establishing frame; line 2 (the rule) is ≤ 9 words and its shot is the most visual
   demonstration of the rule with motion in the first 10 frames. Lines 1–2 together should end by ~4 s.
1. Opener per the rolled OPENER — `in-this-world`: line 2 "In this world," — line 3: the rule. `cold-open`: state the rule as a fact in one punchy
   line, no "In this world" (e.g. "Every morning, the creatures come."), then go on.
2. One line explains how it works ("You see, …" or any natural phrasing).
3. 2–3 quick gags showing the rule on side characters (teacher, parent, sibling, neighbor…), 2 lines each: setup + punchline.
4. "I'm <Name>. I'm <age>." + a hook that breaks the rule for the narrator.
5. Fun at first (2 beats), then it goes wrong (2 beats).
6. A search or escalation (3–4 lines); a discovery.
7. Emotional reveal + a choice or sacrifice (4–6 lines, give it room — this is what the extra time is for).
   Wild mode: the big twist / clever trick that beats the chaos instead (a small heartfelt beat is optional).
8. Resolution + a callback to one gag + a short final line that lands emotionally.
- 43–51 lines (incl. the hook), 260–300 words → about 1:20–1:30 at the narrator's pace (≈3.4 words/s incl. pauses; ~265 words ≈ 1:20, ~295 ≈ 1:30). One line = one shot. Keep lines short (≤ 10 words).
- Every line must earn its place: one idea per line, no recap lines, at most 3 speaking characters besides the narrator.
- First-person narrator (any age — a kid, a teen, a grandparent, a bus driver…; series parts use SERIES.md's voice). Dialogue goes in "double quotes" and also gets a speech bubble.
- End a line with ` [pause]` for a dramatic beat (use ~6–8 times: big reveals, sad moments, final line). Lines up to a [pause] are read as one
  continuous passage (≤ 5 lines / 26 words), so write them to flow as connected sentences.
- **Delivery tags** (make the voice match what is on screen): add `{excited}` (chases, surprises), `{tense}` (creeping danger), `{slow}` (sad/awed),
  `{soft}` (tender), `{whisper}` anywhere on a line; it applies to that line's whole passage, so put a [pause] before/after a mood change.
  Tags are stripped from the spoken text and the captions.
- Avoid words the voice model stumbles on: spell numbers out ("forty"), keep names simple, avoid strings of short words that blur together.
- Write `notes.md`: mode, premise, characters (name, look), sets needed, one-sentence logline.

Then run `python3 engine/voice.py episodes/NNN-slug` (≈7–12 min; run it with nohup and poll) → prints duration and a QUALITY line.
Narration (`VOICE_MODE=passage`, default): each passage is generated as ONE continuous take (never cut apart, never re-spaced), checked with
Whisper and regenerated up to 6× if it has repeated/missing words; silences > 0.5 s inside a take are shortened and endings are never clipped. Line
boundaries are only timestamps for the cuts. Read the `passage … CHECK:` lines and the final `QUALITY:` line: number spellings are fine, but if a
passage is still flagged (REPEAT or wrong words), reword those lines and rerun just them: `ONLY=12,13 python3 engine/voice.py episodes/NNN-slug`
(other passages are reused from out/passages/). Adjust the script if the duration is outside 1:15–1:35. **Listen-check:** do not deliver with a
flagged passage.

## 2b. Design the cast for this story (mandatory — owner request 2026-11-18)
Every episode gets a brand-new cast whose **designs come from the theme and the story**, not just new colours:
- Give each named character a **signature look** that says who they are in this world: a shirt style (`plain hoodie shirt blazer tee stripes plaid jacket
  sweater uniform spacesuit knight`) + 2–4 outfit pieces from `engine/outfits.js` (`outfit: [...]` in the preset). Examples of the idea: space → spacesuit +
  spacehelmet + jetpack; pirates → piratehat/bandana + sash + boots; knights → knight shirt + armor + cape/crown; survival/creatures → headlamp + backpack +
  boots + gloves; lab/science → labcoat + goggles; farm → overalls + cowboyhat; winter → beanie + scarf + gloves; school → backpack/tie/glasses.
  Side characters get role props too (a ranger's badge + hat, a chef's apron, a coach's cap).
- Readable at a glance: every character has a different silhouette (hat/hair shape), a different main colour, and fits the age table (KIT.md).
  Don't reuse an earlier episode's exact look.
- New pieces are welcome: if the story needs a costume piece that doesn't exist, add it to `engine/outfits.js` (reusable).
- Put the cast in `common.js` as `export const CAST = { 'Name': preset, … }` (+ `CAST_SET = 'night'` for a dark lineup), list it in notes.md (name, role, look),
  then render and look at it: `python3 tools/cast_lineup.py episodes/NNN-slug out/cast.jpg`. Fix clashes (hair poking through hats, same colours) before shots.
  Example lineup: `episodes/requests/cast-example.jpg` (a survivor cast for a creature story).

## 3. Write `bubbles.json`
`{"<line number>": ["Bubble text", x 0–1, y 0–1]}` — x is the bubble center, y the top edge
(0.06–0.17 typical; keep above the speaker's head, never over the caption zone at y≈0.65–0.75 — captions sit at 70% height).

## 3b. Write `sfx.json` (small sound effects — mandatory)
The owner wants sound effects that play exactly on the action and overlap the narration like normal SFX, as subtle background
sounds that never drown the voice. `engine/sfx.py` synthesizes them (no samples, no music) and mixes them ~17 dB under the voice;
while the narrator speaks they duck 5 dB, are thinned in the 1–4 kHz speech band, and are capped 13 dB under the voice.
Time every cue to its action — never shift a cue into a pause to make room for the voice.
`[[line, at, name, gain_db?], …]` — `line` = script line, `at` = seconds after that shot starts or `"40%"` of the shot, `gain_db` = trim (-10…+3).
Hook: put `[1, 0.0, "impact", 0]` and `[1, "92%", "rewind", -2]` on line 1. Sounds: pop boing whoosh swoosh_up snap twang chime sparkle glow step steps thud knock chirp flap drip buzz tap typing ding rustle wind gasp zip tada rain (bed, -6..-10) thunder (on lightning) coins scribble creak rewind (hook cut) impact (frame 0 of the hook only).
- Put cues on visible actions, timed to the animation (a snap when a string breaks, steps while walking, a whoosh on a fast move,
  a chime/sparkle/glow on magic, a buzz on a phone, wind outdoors). About one cue per 1–3 shots (~20–35 per episode). Silence on
  the saddest lines and on the final line is fine — leave room for the voice.
- Ambient beds (`wind`) at -6 to -8; frequent sounds (`steps`, `rustle`) at -4 to -6; the big moments (the twist, the climax) at 0 (never above +2).
- `render.py video` mixes it automatically (out/mix.wav). To fix levels after a render without re-rendering: edit sfx.json, then
  `python3 engine/sfx.py episodes/NNN-slug --remux`. Worked example: `episodes/003-kite/sfx.json`.

## 3c. Write `hook.json` (title card on the hook — mandatory)
`{"title": ["ELEVEN CANDLES.", "ONE GIANT DRAGON."], "arrow": [0.62, 0.42, 120]}` — 2 short lines, ≤ 18 characters each, all caps; the last line
is yellow. It punches in on frame 0 at the top of the frame for the whole hook shot and fades out on the cut. It can echo the hook line or tease
what the viewer will see ("HE SOLD 40 YEARS", "DON'T BLINK"). Optional `arrow` (tip x, y in 0–1 frame coords, direction in degrees, 90 = down)
points at the thing to look at — keep it off faces and out of the caption zone (y 0.62–0.78). Check it in the stills/frame of line 1.
In `sfx.json` put `[1, 0.0, "impact", 0]` (a scroll-stopping boom on frame 0, before the first word) next to the usual `rewind` at 92%.

## 4. Write `shots.js` (export `SHOTS`, exactly one function per script line)
Copy the pattern from `episodes/001-shadow/shots_b.js`. Line 1 is the hook: `export const SHOTS = [hook(SHOTS_B[k], { at, len }), ...SHOTS_A, ...SHOTS_B]`
(k = the climax shot, `at` = its most dramatic second). Each entry `(S, cam) => { build set + actors; return (t, dur) => { animate } }`.
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
- New characters (see 2b for themed costumes): vary skin (tan, light, brown, yellow, pale, or any hex), shirt colors/styles, pants, hair style and hair color (see the
  age table in KIT.md — no two characters in an episode share a style), and hats. Make ages read at a glance: grandparents get
  gray/white hair + `wrinkles` (+ beard/mustache for grandpas), dads/teachers adult styles, kids `freckles`/`rosy`.
- Use the full range of expressions (33 faces, KIT.md); switch faces mid-shot for reactions instead of holding one face. Give the narrator a distinct look from previous episodes.

## 4d. New environments (mandatory — owner rule 2026-11-20)
- Read `episodes/SETS.md` first. Plan the episode around **3–5 new locations** (fewer, richer sets beat many thin ones) and build each as a
  new exported set function in a new `engine/setsNN.js` (export it from kit.js, document it in KIT.md). Pick settings that haven't appeared:
  e.g. a lighthouse, a laundromat, a rooftop garden, a ferry deck, a train carriage, an aquarium tunnel, a treehouse, a night market, a
  mountain cable car, a library tower, a bowling alley, a greenhouse — whatever the story needs.
- An "everyday" home or school still has to be a new one: new architecture, layout, colour palette, textures and all-new dressing (e.g. an
  attic bedroom with a round window instead of the kidRoomDay box; a houseboat kitchen instead of familyKitchen). `room()` is fine as a shell only.
- Each new set: motivated key + practical lights, clouds in any visible sky, 6+ detail props, textured large surfaces, ambient motion via `update(t)`.
  Render a quick look at each new set before shots (a still of the first shot that uses it) and fix bare or flat areas.
- Budget: the new sets take ~25 min of the shots time; keep the shot count tight so the time fits.
- At delivery, add the episode's environments to the table in `episodes/SETS.md`.

## 4c. Cinematic quality (mandatory — this is where the extra time goes)
The renderer now adds automatically (engine/main.html, `q=1`): SMAA anti-aliasing, a rim light behind the subject (edge highlights),
depth of field on lenses ≥ 30 (focus = the camPath look-at point, so aim it at the face), and a subtle handheld drift.
Per scene you can tune: `S.userData.rimIntensity`, `S.userData.rim = false`, `S.userData.dofScale` (2 = stronger blur), `S.userData.dof = false`,
`S.userData.handheld = false` (for locked-off shots). Optional, slower: `&ibl=1` (flatter), `&ao=1` (+2.4 s/frame), `&msaa=4` (+2 s/frame).
Your job per shot:
- **Lighting:** every set has a motivated key (sun/lamp/window) plus a warm/cool contrast. Emotional climaxes at golden hour or by a lamp;
  night shots get a practical light near the faces. Check previews for flat, evenly-lit frames and add a key `PointLight`/`SpotLight` if needed.
- **Clouds in every sky** (owner request 2026-11-18): every outdoor shot with visible sky shows clouds. They are automatic in `dayLight()`, all themed
  worlds (day and night), `hill`, `ocean`, `stoop` and `cityNight`, and drift on their own. For any custom sky call `clouds(S)` (`{ night: true }` at night,
  `{ tint: 0xffc8a0 }` at sunset). Frame establishing/exterior shots so some sky shows; check clouds are visible in the previews.
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
The render is resumable (finished 300-frame chunks are kept in out/parts/ and skipped on a re-run — if the container restarts, just run the same command again). ≈2.0–2.3 s per frame with the quality passes (rainy night sets with many lights: ≈4.5 s) (≈85–105 min for 1:20–1:30). Keep the quality passes on (`q=1`, the default). Poll the log. Output: `out/final.mp4` (~50 MB).
Sanity check: `ffprobe` duration ≈ narration duration; extract a 30-frame contact sheet and look at it.

## 6b. Custom thumbnail (mandatory — owner request 2026-11-21)
Shorts surface on the home page and in search, where a strong thumbnail wins new viewers (and can revive a stuck short).
Write `thumb.json` (format in `engine/thumbnail.py`) and run `python3 engine/render.py episodes/NNN-slug thumb` → `out/thumbnail.jpg` (1080×1920, clean
frame without captions, contrast boost, big two-line title, optional red arrow / ring / emoji sticker, optional punch-in `zoom` + `focus`).
- Pick the frame with the strongest emotion on a readable face plus the story's hook object (the creature, the glowing thing) — not the hook frame itself.
- Title = 2–4 words of curiosity that the video answers ("SHE FORGOT TO WISH", "WHO TOOK MY WORRIES?"), not the episode title.
- Keep faces and the title clear of each other and nothing important in the bottom 20 % (YouTube's buttons). Look at it at phone size (270 px wide)
  and fix until the title reads instantly. It can run while the video renders (after the stills pass), or after.

## 7. Deliver
- Send `out/final.mp4` to the user with a one-line caption: title + logline, then send `out/thumbnail.jpg` (caption: "Thumbnail — set it in the YouTube app
  when uploading the short"). Commit `hook.json` and `thumb.json` with the episode source.
- Add a line to `episodes/INDEX.md`: `NNN | date | title | premise | narrator name | logline | mode` (mode = `heartfelt`, `wild:<world>` or `series:<name> P<N>`).
- Series part: fill in the `episode` column of SERIES.md's table and the choice you offered (the vote result stays `?` until the owner reports it); send the thumbnail as usual.
- Add the episode's environments to `episodes/SETS.md`.
- Commit the episode source (script, bubbles, sfx.json, notes, shots, any new faces/sets, SETS.md — not `out/`) and push.
  Two episodes are made per day by separate runs, so before pushing: `git fetch --depth=50 origin main` and
  `git rebase origin/main`. If another run already added an episode with your number, rename your folder to the next free
  number, fix its INDEX line, and also make sure your premise isn't the one it just added (if it is, say so in the final message).
  Resolve INDEX.md conflicts by keeping both lines.
- Final message: the logline and 1–2 honest notes about any weak shots.
