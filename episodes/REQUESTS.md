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

## R2 — Day Creatures — OPEN
Requested 2026-11-18 by the owner.

**Premise (owner's words):** "Every morning creatures attack during the day, and it's only safe at night."
Flip the usual horror rule: daylight is dangerous, night is the safe time. Use a **cold open** (no "In this world") and open with the hook.

**Mode:** wild (spooky + adventure). Go big and wild — this is the owner's example of the "wilder stories" they want.

**Creature design (owner's reference):** https://skfb.ly/pyIVQ — Sketchfab "Creepy Monster 3D Model" by Regulator (free, no credit
required). The page itself has no description; its tags are creepy / uncanny / horror / flesh / realistic / low-poly. The preview image could not
be loaded from the cloud workspace (host blocked), so match it from those tags — or from a screenshot if the owner adds one to this folder as
`episodes/requests/R2-creature.png` (check for it first). Build it as a new `creature()` kind in engine/themes.js (reusable): an uncanny,
gaunt, pale flesh-toned humanoid with long limbs and an unsettling face. **Kid-friendly: no blood, no gore** (ignore the "bloody" tags), nobody gets
hurt, the kids win by being clever.

**Guidance:** bright, sunny daytime sets that feel *threatening* (long hard shadows, creatures in the sunlight, boarded windows), and warm, cozy,
safe night scenes (lanterns, stars, kids finally playing outside) — the opposite of normal. Clouds in every sky. Plant the twist early.
