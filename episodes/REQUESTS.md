# Story requests from the owner

The next run takes the first OPEN request instead of rolling a random mode (see RUNBOOK step 1).
Statuses: OPEN → CLAIMED (episode NNN, date) → DONE (episode NNN).

---

## R1 — The Year Trader — DONE (episode 005)
Requested 2026-11-17 by the owner.

**Premise (owner's words):** In a world where people can exchange years of their lives for money, a desperate boy makes
the ultimate sacrifice to save his mother. But his mother has a secret.

**Visual style (owner's words):** Cinematic Roblox animation, dramatic shadows, rainy environments, expressive character animations.

**Mode:** heartfelt (dramatic). Use the full 1:30 — this is the emotional kind with a search + reveal.
Opening still follows the formula ("In this world, …" + the rule + "You see, …"), but keep any gags short and in tone
(e.g. a rich neighbor who looks 200 years young, a kid who sold a year for a gaming console and instantly regrets it).

**Story guidance (build the plot yourself; these are guardrails, not a script):**
- Make the rule visual and readable: e.g. everyone has a glowing life-clock (years left) — on the wrist or floating above the head —
  and a rain-soaked "Time Exchange" pawn shop where years are traded for coins/bills that drain from the clock with a glow.
- The boy (new name, new look) needs money to save his mom (she's sick / about to lose their home — choose one). He trades a huge
  chunk of his years. Show the cost visually without anything scary or graphic (his clock drops, his hair goes grey at the temples,
  he walks slower) — kid-friendly, no on-screen death.
- **The mother's secret must be a real twist that recontextualizes earlier scenes.** Plant 2–3 clues early that only make sense at
  the end (she always hides her own clock under a sleeve/scarf, she knows the shopkeeper by name, she leaves at night in the rain…).
  Decide the secret yourself — it should hit hard emotionally (e.g. she already traded her years long ago to save HIM, and has been
  quietly buying his years back) — then resolve it hopefully or bittersweetly, not tragically.
- End on a short line that lands.

**Visual direction (do all of these):**
- Build a reusable **rain system** and add it to `engine/themes.js` (exported, documented in KIT.md) so future episodes can use it:
  falling rain streaks around the camera (instanced, cheap), splash ripples on the ground, wet reflective ground/streets, rain running
  down windows, optional lightning flash (brief light spike + thunder sfx on the action). Ambient motion in every rainy shot.
- Most exterior shots at night or dusk in the rain (`cityNight` + rain is a good base; the Time Exchange shop front with a glowing
  sign). Interiors: dim, warm practical lamps vs. cold blue window light streaked with rain.
- **Dramatic shadows:** low-key lighting, strong single key light + rim light, deep shadows on faces in tense moments,
  streetlamp pools, window-blind/rain shadow patterns where possible. Keep faces readable in close-ups (RUNBOOK night rule).
- **Expressive animation:** more acting than usual — hesitation before signing, trembling hands, slumped walk home in the rain,
  running, head in hands, a big hug at the end. Use the full range of faces.
- Rain/thunder ambience as subtle sfx under the narration (per the sfx rules), never louder than the voice. Still no music.

---

## R2 — Day Creatures — DONE (episode 006)
Requested 2026-11-18 by the owner.

**Premise (owner's words):** "Every morning creatures attack during the day, and it's only safe at night."
Flip the usual horror rule: daylight is dangerous, night is the safe time. Use a **cold open** (no "In this world") and open with the hook.

**Mode:** wild (spooky + adventure). Go big and wild — this is the owner's example of the "wilder stories" they want.

**Creature design (owner's reference):** https://skfb.ly/pyIVQ (Sketchfab "Creepy Monster" by Regulator, free, no credit required).
The owner's screenshot is `episodes/requests/R2-creature.png`: a tall, emaciated humanoid — bald elongated skull with deep dark eye sockets and a
closed thin mouth, visible ribs and collarbones, sunken stomach, very long thin arms hanging past the hips with long clawed fingers, thin legs,
mottled ochre/olive-brown skin with dark creases. Already built as a reusable creature: `creature(S, { kind: 'husk' })` in engine/themes.js
(~9 tall; moods lurk/stalk/lunge/roar/hide; `eyesOn()` lights pinpoint eyes). First look: `episodes/requests/R2-creature-husk-v1.jpg`.
Compare it with the reference before building shots and refine the face if needed (aim: creepy and gaunt, not cute — keep the sockets dark and the
mouth a thin slit). **Kid-friendly: no blood, no gore, no open wounds** (the reference's red/open belly is replaced by a darker sunken stomach),
nobody gets hurt, the kids win by being clever.

**Guidance:** bright, sunny daytime sets that feel *threatening* (long hard shadows, creatures in the sunlight, boarded windows), and warm, cozy,
safe night scenes (lanterns, stars, kids finally playing outside) — the opposite of normal. Clouds in every sky. Plant the twist early.

---

## R3 — Launch Day (GTA 6 release) — OPEN
Requested 2026-11-19 by the owner: "For the next animation make it themed based on / around the release of GTA 6."
Context: Grand Theft Auto VI launched on November 19, 2026 (Rockstar Newswire), after years of waiting and two delays.

**Theme:** the hype and the long wait around the GTA 6 release — told as an original, kid-friendly "In this world…"/cold-open story.
The series is kid-friendly and GTA is an M-rated crime game, so the story is about the *release* (the countdown, the waiting, the
delays, midnight launch, the whole town counting down, friends/family who waited together), never about crime, guns, police chases or
violence from the game. Roll the mode as usual; a wild premise built on the wait suits it (e.g. a rule tied to the countdown, the
"delays", or the day the game arrives), but heartfelt works too (e.g. someone who has waited since they were little).

**Visual direction (owner update 2026-11-19: "Do a vice city style setting"):** a Vice City-style world — a 1980s Miami-inspired
neon beach city. Art-deco hotels in pastel pink, mint and peach with glowing neon trim along an ocean-front drive; rows of tall palm
trees; white sand and turquoise water; a huge sunset sky in pink/orange/purple fading to a starry violet night; neon signs in
hot pink and cyan; shiny retro sports cars and convertibles parked along the curb; wet streets reflecting the neon at night; a giant
neon "6" countdown billboard over the beach. Kids' outfits fit the vibe (pastel tees, Hawaiian shirts, sunglasses, sneakers).
Build it as a new reusable themed world in `engine/themes.js` (e.g. `neonBeach(S, { sunset, night })`) with clouds in the sky and ambient
motion: swaying palms, flickering/pulsing neon, rolling waves, cars' headlights. Mostly golden-hour and night shots; contrast it with
everyday sets (bedroom, living room with a console, a midnight line outside a game store on the neon strip).
Give the city an original name (not "Vice City" itself) and keep it a fun, safe place — no crime, chases or violence.

**Story (outline shared with the owner 2026-11-19 — build the script from this):** mode wild (silly, with a warm ending), cold open.
- Hook: "It was taller than the hotels." (flash-forward of the giant Waiting creature looming over the neon strip at midnight).
- Rule: in Palm Bay, when lots of people wait for the same thing, the waiting turns into a creature. Every check of the countdown feeds it.
- Gags: Grandpa Sal has waited so long he roller-skates the boardwalk in a "DAY 1 FAN" Hawaiian shirt he bought years ago (it's faded);
  big sister Lulu works at the Pixel Palace game shop and has answered "Is it out yet?" ten thousand times (her own little waiting-blob
  follows her around); the beach crowd all stares at the giant neon "6" countdown billboard instead of the sunset.
- Narrator: Rico, 11 — "I was eight when they showed the first trailer." He checks the countdown every few minutes. Every delay made the
  town's creature, "the Wait", grow: first a cute pink blob on the billboard, then flamingo-sized, then a building-sized neon blob.
- Launch night: the whole town lines up outside Pixel Palace. The Wait is now taller than the hotels, and it plops onto the power lines —
  every neon sign on the strip goes dark ten minutes before midnight. Nobody can play anything.
- Twist/clever fix: Rico notices it shrinks a tiny bit whenever someone looks away from the clock (Grandpa laughing at a joke, Lulu
  skating). The Wait eats waiting — so the kids make everyone *stop* waiting: Rico starts a beach party right there in the line (a boombox
  of sound effects, a conga line, sandcastles, Grandpa's skate show). Nobody looks at the countdown; the Wait shrinks back to a tiny
  blob, rolls off the wires, and the neon blazes back on — exactly at midnight.
- Ending: Rico, Lulu and Grandpa play together on the couch at sunrise. Callback: the tiny Wait blob curls up on top of the console —
  "It's already waiting for GTA 7." Final line lands warm: the best part of the wait was who he waited with.
Cast designs: Rico (pastel-teal Hawaiian shirt, white tee, shorts, sneakers, sunglasses pushed up), Lulu (Pixel Palace staff polo + cap,
roller skates feel), Grandpa Sal (faded flamingo Hawaiian shirt, white hair, mustache, kneepads/wristbands for skating), best friend
Dani (neon windbreaker, headphones). The Wait: a cute-blocky `monster()` blob in neon pink with big eyes — silly, never scary.

**Go further with GTA 6 (owner approved 2026-11-19 — overrides the "original city name" line above):**
- Name the real setting: the town is **Vice City, Leonida** (where GTA 6 is set) — use it in narration/captions and on made-up signs
  ("Welcome to Vice City"), instead of "Palm Bay". Still an original-looking city; not a copy of the game's map or key art.
- The delays drive the plot: the game was delayed twice — each delay announcement makes the Wait grow a size (show it: a phone buzz /
  TV news ticker "DELAYED", the crowd groans, the blob puffs up with a boing). Rico's age line: "I was eight when the first trailer dropped."
- Fan-recognizable moments, done as original kid-safe gags (pick 2–3 for the opening/side beats): an alligator wandering into a
  convenience store (it just wants a slushie), flamingos everywhere (Grandpa skates through a flock), a Florida swamp with an airboat,
  jet skis / a boat party off the beach, a kid with a sign "GTA 6 BEFORE MY HOMEWORK", the whole town replaying the first trailer.
- Game-world touches: a short original radio-jingle style sfx cue (no copyrighted music — sfx.py synth only), a big neon minimap-style
  countdown sign (circle with a "6" blip), retro sports cars *cruising* the strip at golden hour (never chasing), pastel neon everywhere.
- Launch night payoff: the kids boot it up on the couch — show the console, the TV glow on their faces and their reactions; the TV screen
  itself shows only an original abstract neon glow / loading bar with a "6", never game footage, logo or characters.
Still out: crime, heists, guns, police chases, wanted stars, Lucia/Jason, Rockstar logo, box/key art, trailer shots, real store brands.

**Rules (important):** the game may be named in the narration/captions ("GTA 6"), but do **not** recreate Rockstar's logo, the game's
box art or key art, its characters (Lucia/Jason), or any real store or brand logos — use an original "6" countdown display and made-up
shop names. No real people. New narrator, new cast (2b), one hook, sfx as usual, 1:20–1:30.
