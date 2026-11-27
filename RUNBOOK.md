# Daily episode runbook

Goal: one new, original **2:00–2:10** vertical (1080×1920) 3D Roblox-style story short per day, in the
"In this world…" format (or a cold open — see step 1). New premise, new characters every day. **Narration + small sound effects, no music.**

**Owner feedback (2026-11-27) — "my videos' pacing is too slow compared to other videos in my niche… they don't always cover heartfelt stories. They make up
random wacky scenarios with a fun hook." Owner chose: cut the pauses + get to the story faster + mostly wacky (voice speed and the 2:00–2:10 length stay as they are).
This overrides the formula, pause counts, word counts and mode split wherever they appear below, and applies to THE FOG Parts 4–5 too:**
- **Measured problem (episode 022):** 27 s of a 2:04 video was silence (28 `[pause]`s ≈ 0.9 s each) and the plot only started at ~25 s. The voice itself (≈4 words/s while speaking) is fine — don't touch `VOICE_TEMPO`.
- **Pauses:** at most **4 `[pause]`s per episode** (the hook cut, the big reveal, the twist, the final line). `PAUSE_GAP` now defaults to 0.4 s (was 0.75). Every other line runs straight into the next;
  passages still split by themselves every 5 lines / 26 words (0.3 s breath). After `voice.py`, check: total silence ≤ 12 s; if more, remove pauses.
- **Get to the story by ~10 s:** line 1 hook → line 2 the rule (≤ 9 words, "In this world" or cold-open as rolled) → ONE quick gag (2 lines, the funniest one) → "I'm <Name>" + the problem, all by ~10–12 s.
  No "You see, …" explanation line, no second/third warm-up gag before the plot — put the other gags INSIDE the story as escalation beats. Something new must happen on every line: no line may only describe a feeling or restate the last one.
- **Density:** same length, more story. With the pauses gone, 2:00–2:10 needs about **440–470 words in 66–74 lines** (estimate — measure the first episode and correct this line). Use the extra lines for more turns
  (a second complication, a bigger escalation, a final gag), never for padding. Average shot ≈ 1.7–1.9 s; any line over 2.2 s still gets an internal cut.
- **Story mix:** `pick_mode.py` now rolls **wild ~85% / heartfelt ~15%**. Wild = a random wacky scenario with a fun, instantly clear hook ("my monster paid my rent", "every lie turns into a tiny dragon") and a funny twist ending;
  a small warm beat at the end is welcome, a tearjerker is not. Delivery tags: mostly untagged/`{excited}`/`{tense}`; use `{slow}`/`{soft}` on 3 lines at most (they slow the read).
- **Fog Parts 4–5:** same pause budget and no slow recap — line 2 recaps the vote in one line, then straight into action. Suspense comes from the countdown and what happens, not from silence.

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

**Owner feedback (2026-11-25) — YouTube's analysis said the voiceover "feels synthetic and lacks emotional weight" and asked for richer SFX
(creaking roofs, thuds). Owner: "improve the narrator's audio quality in terms of emotion, natural speaking", "improve the overall video quality
(animations, lighting, environment designs, textures, facial animations, character designs)". Since 2026-11-26 both scheduled runs use Fable 5.2 (see the animation block below); every upgrade here is in the engine/runbook, so it applies whichever model runs. Built in:**
- **Voice (engine/voice.py, automatic):** guidance 3.0 + mood-matched reference prompts per delivery tag (A/B-tested, owner picked it; moods never speed
  the voice up — the owner disliked fast excited lines) + a light narration master (warmth/presence EQ, de-ess, glue compression, tiny room).
  Your part is the WRITING (step 2): tag EVERY passage with the mood it needs ({tense} {excited} {slow} {soft} {whisper}; untagged = neutral, use it only
  for plain info), put a [pause] wherever the mood changes, write the way people talk (contractions, short sentences, a question now and then),
  and use punctuation for delivery: "…" for a hesitant trail, "!" for real surprise (max ~4 per episode), commas for breath. No lists of three flat facts in a row.
  Listen-check the QUALITY line as before. Real mood clips recorded by the owner (engine/voice/narrator_ref_<mood>.wav + .txt) replace the shaped ones automatically.
- **SFX (step 3b):** 35–50 cues now. Every shot gets an ambience bed (wind/rain/crowd outdoors, `roomtone` indoors at -9..-12) plus the actions.
  New sounds: heartbeat (tension), door, roofcreak (slow timber groan), woodsteps, roomtone, crowd, rumble (something huge), splash, glass, bigwhoosh.
  Effects now get a short room reverb automatically so they sit in the space.
- **Facial animation (automatic, engine/main.html):** everyone blinks; anyone whose pose includes `talk(t)` flaps their mouth. So EVERY dialogue line must add
  `talk(t)` to the speaker's pose (and only the speaker's). Still switch faces with `setFace` on every emotional turn — at least one face change in 1/2 of the shots.
- **Lighting:** a soft camera-riding face fill is on by default at q=1 (`S.userData.faceFill = false | 0.5 | 1.5`). Still build each set with a motivated key +
  practicals + rim; no shot may have a face darker than the background (check the q=1 stills, step 5).
- **Environments/textures/characters — the quality bar for every new set and cast:** 10+ detail props per set in three depth layers (foreground framing piece,
  midground action, background silhouette/sky), every large surface textured (no flat colour bigger than a door), one ambient motion (`update(t)`) per set,
  atmosphere (dust motes, fog, rain, steam, fireflies, drifting leaves) in most shots. Characters: a signature silhouette (hat/hair), 3–4 outfit pieces + a hand prop,
  a 2–3 colour personal palette that differs from everyone else in the episode, and age detail (wrinkles/freckles/beard).
- **Animation:** every character in frame breathes (`idle`), shifts weight, and reacts (head turns to sounds/speakers via `lookAt`); every big move gets
  `anticipate()` + `hit()` overshoot; add follow-through (a settle or a small second motion after the hit). Walks use `walk()` with body bob, never sliding.
- **Compositing (automatic at q=1, owner 2026-11-25 follow-up):** the final grade adds a light unsharp mask (crisper edges/textures), warm halation
  glow around highlights, anamorphic streaks on bright practicals (lamps, candles, neon, screens) and a faint lens fringe at the frame edges. So give
  night/interior sets real practical lights in frame — they now flare nicely. `S.userData.comp` scales it per shot (0 = off, 1.5 = dreamy flashback).
- **SFX level:** +3 dB louder than before (HOUSE_DB -14, ceiling -11 dB under the voice) — the owner wants them clearly audible but never over the narrator;
  keep beds at their listed trims and don't push action cues above +2.
- **Mandatory q=1 check (step 5):** after the Q=0 preview pass, render the 6 most important shots at q=1 (`python3 engine/render.py … stills 1 a b c d e`) and
  look at faces, lighting and texture there; fix before the full render.

**Owner request (2026-11-26) — runs now use Fable 5.2: "I'd like to see improvements in the animation."** Put the extra capability into the animation itself, not into more
shots per line. Format and voice stay the same (length changed separately — see Length, owner 2026-11-26); the gains come from better shot code. Every episode:
- **Block before you code (step 4):** for each shot write a one-line blocking note in the shot comment: who stands where, who looks at whom, the main action beat and
  its second, the camera move and why. Work out sightlines on paper first: what sits between the camera and each face (posts, trees, rollers, flags, other people,
  the narrator's own head). Most of episode 020's preview rounds went on cameras inside trees/buildings, views blocked by the well's posts, and a giant's face out of frame.
  Goal: no more than 2 preview rounds.
- **Acting, not posing:** every character in frame does something specific to the line (a reaction, a fidget, a look away and back), not only `idle`.
  Layer motion: a main beat (with `anticipate` + `hit` overshoot) + a delayed follow-through (head and arms settle 0.1–0.2 s after the body) + breathing. Stagger reactions:
  listeners react 0.2–0.4 s after the cause, never all on the same frame. Each emotional shot gets 2 face changes (e.g. worried → shock → determined), timed to the words.
- **Eyelines everywhere:** speakers look at who they talk to; listeners look at the speaker, then at the thing being talked about (`lookAt`, scaled ×0.45 in two-shots).
  Creatures and animals get eyelines too (`look()` or head yaw toward the narrator or the action).
- **Walks and weight:** speed matches the stride (no foot sliding: tune `walk()` speed to the distance covered), add a body lean into starts and stops, and ease into
  and out of every move (no linear slides). Big creatures move slowly with a heavy settle and camera rumble; small ones are quick and bouncy.
- **Camera choreography:** each move is motivated (push in on realisation, pull back on a reveal, track with a runner, low angle for size). Cuts inside a long line
  (`seg`) change both angle and lens. Hold the subject on the rule of thirds and keep the caption band (y 0.62–0.78) free of faces.
- **Scale and continuity:** a creature or prop keeps one size across a scene unless the story changes it (020 had to cheat the dog's head size between window shots;
  plan the set so that isn't needed). Keep screen direction consistent across cuts (who's on the left stays on the left).
- **Don't drop ambitious shots:** if a hero shot fails (020's view from the bottom of the well with the dog's face filling the sky stayed black), debug it with a
  `frame` render + a `console.log` of positions before replacing it. Common causes: a stale parent matrixWorld, the subject hidden by set geometry, a light inside the mesh.
- **Animation QC (step 5, in addition to the stills):** for the 6 most important shots, also render a 4-frame strip (`python3 tools/anim_strip.py episodes/NNN-slug out.jpg <lines…>` does all of them in one page load; or `frame <line> 0.1/0.4/0.7/0.95`) and check that the motion
  actually reads: no frozen character, no pop between frames, faces visible on the key words. In the final message, name the shots that most improved and the weakest one.

**Owner override (2026-11-26, today only):** no Fog part today. The 11:40 AM midday run makes a regular standalone episode (even if the Part 3 vote result is filled in), and the 3:20 PM evening run makes a second standalone as usual — two standalones are allowed on 2026-11-26 only. Part 4 waits for the owner's Part 3 vote result: once it is reported (on a later day), the first run after that builds Part 4 under the normal rules — until then, standalones only.

**Owner schedule (2026-11-23) — while THE FOG series is ACTIVE: at most ONE Fog part + ONE standalone episode per day** (replaces the 2026-11-22 HOLD rule).
Owner posts the Fog part at 4 PM Eastern (11 AM on weekends) and the standalone at ~7:30 PM Eastern. Runs start 11:40 AM ET (midday, right after the ~11:30 vote) and 3:20 PM ET (evening) so the longer 2:00–2:10 episodes (~4 h) are ready in time (owner 2026-11-26). Every run (midday or evening), after `git pull`:
1. If the previous part's vote result is filled in SERIES.md and the next part isn't in INDEX.md yet → make that Fog part.
2. Otherwise, if no standalone episode has been added to INDEX.md today (Eastern date) → make a normal standalone episode.
3. Otherwise → make no video; send one push notification ("Waiting for your Part N vote — today's standalone is done") and stop.
Never two standalones in one day while the series runs. When SERIES.md is DONE, this rule ends and the normal two-standalones-a-day schedule returns.

**Owner request (2026-11-22) — choose-your-path series (5 parts), then back to normal:** an ACTIVE series lives in `episodes/series/<name>/SERIES.md`
(currently `episodes/series/fog/`). Read it at step 1 on every run:
- **Owner 2026-11-23 — whichever run comes first:** once the owner has reported the previous part's vote, the NEXT run (midday or evening, whichever fires first) makes the next part,
  so it is ready for the owner's 4 PM Eastern post (owner sends the result by ~11:30 AM; the 11:40 AM midday run builds it). The other run that day does not make another series part.
  Before building, `git pull` and check SERIES.md/INDEX.md so two runs never make the same part.
- **(older rule, superseded above) Evening run only:** if a series is ACTIVE and its next part is unlocked (Part 1, or the previous part's vote result is filled in), make that part,
  following SERIES.md (it overrides the premise, narrator, cast and opener steps; everything else in this runbook still applies) and write `vote.json`
  (end card, engine/captions.py). If the next part is locked (vote result still `?`), make a normal standalone episode and say in the final message that the
  series is waiting for the owner's Part N−1 vote. (Superseded 2026-11-23: the midday run makes the series part when a result came in before it fires.)
- **Any run:** if the owner tells you a vote result, record it in SERIES.md, commit and push it before anything else.
- After the final part, SERIES.md is set to DONE and all runs go back to normal episodes.

**Length: 2:00–2:10 (120–130 s), chosen per story.** Owner decision 2026-11-26 (replaces the 1:20–1:30 rule of 2026-11-17). Lighter/funny premises land near
2:00; emotional ones with a search + reveal can use the full 2:10. Never under 1:58 or over 2:12. Spend the extra ~40 s on story (a third gag, a real midpoint
setback, a longer reveal) and on letting key moments breathe — not on padding or slower narration.
This overrides any older length in a scheduled prompt or earlier episode. Episodes 001–003 are the old 2:20 format — copy their code patterns, not their length.

Total time budget ≈ 3.75 h: setup 8 min · story 15 min · narration 12 min · shots 65 min · previews/fixes 25 min · render ~80–120 min · delivery 5 min.
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
- **Roll the story mode:** `python3 tools/pick_mode.py` → `wild` (~85%) or `heartfelt` (~15%, owner 2026-11-27), the OPENER (`in-this-world` or `cold-open`) and the
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
Formula (120–130 s version — the full arc with room to breathe):
0. **Line 1 = the hook** (1–2 s, ≤ 6 words): a flash-forward of the climax, spoken over the climax shot (`hook()` in kit.js reuses that shot),
   e.g. "Forty years. That's what I traded." / "It was right behind me." End it with a `rewind` sfx, then the story starts from the beginning.
   **The first 3–4 seconds decide whether YouTube keeps pushing the short (owner 2026-11-21):** the hook line is a curiosity gap (a shocking
   fact, a number, a threat — never a greeting or setup); pick `hook(…, { at })` so frame 0 is already mid-action on the most striking image
   (a creature's face, the big reveal), never a wide establishing frame; line 2 (the rule) is ≤ 9 words and its shot is the most visual
   demonstration of the rule with motion in the first 10 frames. Lines 1–2 together should end by ~4 s.
1. Opener per the rolled OPENER — `in-this-world`: line 2 "In this world," — line 3: the rule. `cold-open`: state the rule as a fact in one punchy
   line, no "In this world" (e.g. "Every morning, the creatures come."), then go on.
2. One line explains how it works ("You see, …" or any natural phrasing).
3. 3 quick gags showing the rule on side characters (teacher, parent, sibling, neighbor…), 2 lines each: setup + punchline.
4. "I'm <Name>. I'm <age>." + a hook that breaks the rule for the narrator.
5. Fun at first (3 beats), then it goes wrong (3 beats, escalating).
6. A search or escalation (5–7 lines) with a midpoint setback (a plan that fails) before the discovery.
7. Emotional reveal + a choice or sacrifice (6–8 lines, give it room — this is what the extra time is for).
   Wild mode: the big twist / clever trick that beats the chaos instead (a small heartfelt beat is optional).
8. Resolution + a callback to one gag + a short final line that lands emotionally.
- **Superseded 2026-11-27 (see top): ~66–74 lines, ~440–470 words now that the pauses are gone.** Old figures, with 28 pauses: 58–66 lines (incl. the hook), 370–400 words → about 2:00–2:10 at the narrator's measured pace (≈3.1 words/s incl. pauses at the default PAUSE_GAP; ~372 words ≈ 2:00, ~400 ≈ 2:10 — episode 020: 296 words = 94.8 s). One line = one shot. Keep lines short (≤ 10 words).
- Every line must earn its place: one idea per line, no recap lines, at most 3 speaking characters besides the narrator.
- First-person narrator (any age — a kid, a teen, a grandparent, a bus driver…; series parts use SERIES.md's voice). Dialogue goes in "double quotes" and also gets a speech bubble.
- End a line with ` [pause]` for a dramatic beat (**at most 4 per episode**, owner 2026-11-27: hook cut, big reveal, twist, final line). Lines up to a [pause] are read as one
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
(other passages are reused from out/passages/). Adjust the script (add/cut lines, not pause length) if the duration is outside 1:58–2:12. **Listen-check:** do not deliver with a
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
Hook: put `[1, 0.0, "impact", 0]` and `[1, "92%", "rewind", -2]` on line 1. Sounds: pop boing whoosh swoosh_up bigwhoosh snap twang chime sparkle glow step steps woodsteps thud knock door chirp flap drip buzz tap typing ding rustle wind gasp zip tada rain (bed, -6..-10) roomtone (indoor bed, -9..-12) crowd (bed) thunder (on lightning) rumble heartbeat (tension bed) roofcreak creak coins scribble splash glass rewind (hook cut) impact (frame 0 of the hook only).
- Put cues on visible actions, timed to the animation (a snap when a string breaks, steps while walking, a whoosh on a fast move,
  a chime/sparkle/glow on magic, a buzz on a phone, wind outdoors). An ambience bed on every shot plus the actions (~35–50 cues per episode, owner 2026-11-25). Silence on
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
The render is resumable (finished 300-frame chunks are kept in out/parts/ and skipped on a re-run — if the container restarts, just run the same command again). ≈2.0–2.3 s per frame with the quality passes (rainy night sets with many lights: ≈4.5 s) (≈80–120 min for 2:00–2:10). Keep the quality passes on (`q=1`, the default). Poll the log. Output: `out/final.mp4` (~50 MB).
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
