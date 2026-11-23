# Series S1 — THE FOG (choose-your-path, 5 parts) — owner request 2026-11-22

Owner: "For the next few episodes (5) can you create a choose-a-path / vote story line? … When the series is done transition back to what
we've been doing so far." "Maintain the current Roblox style we have and make the story for all ages, not only for kids."
"After each video, I'll let you know of the results and we'll continue from there."
Reference the owner shared (format only — never copy its story): a second-person ("Imagine you wake up…") 80-second disaster short with a
countdown, a stranger everyone laughs at who turns out to be prepared, on-screen "rules", a phone text that forces a choice, and an end card
with two options (A red / B green) + "FOLLOW FOR PART 2".

## Who makes the parts, and when
- **Owner 2026-11-23:** the FIRST run (midday or evening) after the owner reports a vote result makes the next part — one part per day. The owner posts each part at
  4 PM Eastern (11 AM on weekends) and sends the vote result by ~11:30 AM the next day, so the 12:10 PM midday run builds the next part in time.
  (Old rule: only the evening run made parts.)
- The evening run makes **Part N** when Part N−1's vote result is filled in below (Part 1 needs nothing). If the result is still `?`, the
  evening run makes a normal standalone episode instead and says in its final message that the series is waiting for the Part N−1 vote.
- **Recording a result:** whenever the owner tells any session a result ("Part 1: B", "B won", "they picked the truck"), write it in the
  table below (letter + the option text + date), commit and push that change straight away, before anything else.
- After Part 5 is delivered, set the status line to DONE; every run then goes back to normal episodes (RUNBOOK as before).

Status: ACTIVE — next: Part 2 (waiting for the Part 1 vote). Daily schedule while the series runs: one Fog part (posted 4 PM ET) + one standalone (posted ~7:30 PM ET) — see the owner schedule at the top of RUNBOOK.md.

| part | episode | choice offered at the end (A / B) | vote result |
|---|---|---|---|
| 1 | 015 | A: STAY IN ABE'S TRUCK · B: RUN TO NELL | ? |
| 2 | — | (decided by the Part 2 run) | ? |
| 3 | — | (decided by the Part 3 run) | ? |
| 4 | — | (decided by the Part 4 run) | ? |
| 5 | — | finale — no vote ("comment what you would have done") | — |

## Format (every part)
- **Second person**, narrated in the owner's cloned voice (engine/voice.py, defaults): "You wake up…", "You run.", "Do you…". The viewer is the hero:
  the on-screen YOU avatar (cast.js) is the same in every part. Dialogue from other characters in "quotes" + bubbles as usual.
- **All ages, not only kids** (owner 2026-11-22): real tension, real stakes, genuinely scary moments, adult characters with adult worries.
  Still no gore, blood, weapons violence or swearing — the danger is the fog and losing yourself in it, not injuries.
- Same Roblox look and all the usual quality rules (RUNBOOK 2–6b). Length 1:20–1:30. Every part opens with the 1–2 s hook (hook.json).
- **Part 2–5 line 2 recaps the vote in one line**: "You chose the truck." / "Most of you said run." — then the story continues from that choice
  as if it was always the plan. Keep the recap to one line; no "previously on".
- **On-screen clock**: say the time in narration at key beats ("5:42 AM.", "Nine minutes left.") — countdown pressure is the engine of the format.
- **End card**: `vote.json` in the episode folder (engine/captions.py): `{"badge": "PART 1 / 5", "from": <question line>, "a": "…", "b": "…",
  "title": ["FOLLOW FOR", "PART 2"]}`. The second-to-last line asks the question ("Do you stay in the truck…"), the last line says
  "Or do you run to Nell? Follow for part two." The shot under those lines holds a readable, slow, tense image (the hatch, the bridge, a face)
  and leaves the frame centre (y 0.33–0.62) free for the boxes. Option text ≤ 22 characters, all caps. Both options must be genuinely tempting
  and lead somewhere different — never an obviously "right" answer. Finale: badge "PART 5 / 5 — FINAL", no a/b/title.
- Episode folder `episodes/NNN-fog-partN/`, INDEX mode `series:fog P<N>`, notes.md lists the vote that led here and the two options offered.
- **Sets:** each part builds at least two brand-new locations (owner rule 2026-11-20). For continuity a part may revisit ONE location from an
  earlier part of THIS series (e.g. Harbor Street), seen from a new angle / new time / fogged — never one from a standalone episode.
  Put the series' sets + fog kit in `engine/sets_fog.js` (export from kit.js, document in KIT.md) so every part reuses them.
- **Cast:** import from `episodes/series/fog/cast.js` (never change an existing look; add new recurring people there).

## The world (fixed lore — every branch must respect it)
- Harbor Point, a small foggy seaside town with a long bridge to the mainland, the old KESSLER HILL radio tower above it, a hospital on the
  mainland side. Late November, before dawn.
- **The fog:** a thick white wall rolls in off the bay at 5:40 AM. Anyone it touches **forgets** — first their plans, then the people they love,
  then their own name — and stands still, blank-eyed, staring at nothing (show it: face goes `neutral`/`sleepy`, colour drains a little, they stop
  mid-step). They are not hurt; they come back if the fog lifts. The fog moves like a slow tide, curls under doors, and goes quiet before it moves.
- **Rule 1 (Part 1):** the fog backs away from music — ABE's ice-cream truck jingle keeps a bubble of clear air around the truck.
  (No music on the soundtrack: the jingle is a short synthesized sfx cue — `chime`/`ding` patterns — and the narration describes it.)
- **The secret (reveal by Part 4):** the fog started when the Kessler Hill tower's broken transmitter began humming a low note across town.
  Abe used to be the tower's engineer; he was laughed out of town years ago for saying it was dangerous. Shutting the tower down (or drowning
  its note out with something louder and warmer — the whole town singing, every car radio at once) ends it in Part 5.
- Branch freely inside that lore: who comes along, who gets fogged (and later rescued), which route, what is sacrificed. At least one choice
  should cost the viewer something real. The finale can be hopeful or bittersweet — never hopeless.

## Cast (episodes/series/fog/cast.js)
- **YOU** — the viewer. Teen / young adult; dark-green rain jacket, grey beanie, backpack, jeans, boots. Lives on Harbor Street with BISCUIT.
- **BISCUIT** — your orange corgi-ish dog (`pup`). Barks at the fog before anyone sees it.
- **NELL** — your older sister, a paramedic on the night shift at Mainland General, across the bridge. Navy uniform, hi-vis vest, dark low bun.
- **ABE** — the old ice-cream-truck man the whole street laughs at (his truck plays its jingle in November). White shirt, red bow tie, white cap,
  pink striped apron, white mustache. Calm, knows far more than he says.
- New people per part are fine (a fogged neighbour, a kid hiding on the bridge, a tower guard) — add them to cast.js if they recur.

## Part 1 plan (the first evening run builds this; adjust details freely)
Hook: "The fog took the whole street." (frame 0: a wall of white swallowing a row of houses, a neighbour frozen mid-step).
"Imagine you wake up at 5:40 AM, and the town siren is going off." Phone: 23 alerts, one text from Nell: "Whatever you do, don't go outside."
TV: FOG ADVISORY — residents who enter the fog lose their memory; it reaches Harbor Street in twelve minutes. At the window: Mr. Pell from
next door carrying out his trash — the fog rolls over him and he just… stops. He doesn't know where he is. Biscuit growls at the door.
A knock: Abe, the ice-cream man everyone laughs at. "Why me?" — you're the only one who ever bought something from his truck in winter.
His truck sits in a perfect circle of clear air while it plays its jingle — RULE ONE: the fog hates music. The speaker crackles; the battery
says 10 minutes. On the dashboard: an old Kessler Hill tower ID badge with Abe's photo on it. Then your phone buzzes — Nell: "Fog's at the
hospital. I'm on the roof with a little girl. Please." The bridge is six minutes away. The jingle has ten minutes left. Abe is reaching to close
the door. Do you STAY IN ABE'S TRUCK, or RUN TO NELL? Follow for part two.

## Part 1 as made (episode 015, 2026-11-22) — continuity for Part 2
- Time: the fog hits Harbor Street at ~5:46; the truck's battery reads 10:00 at ~5:47 and 9:51 when Part 1 ends (so ~9 min of jingle left).
- Where everyone is: YOU + BISCUIT in Abe's truck (passenger seat) parked mid-road on Harbor Street inside a ~15-stud ring of clear air; ABE at the wheel, gripping your arm,
  promising to tell you "what's really out there" if you stay; MR. PELL frozen and grey by his trash cans, just outside the ring; NELL + PIP (a little girl in a yellow raincoat
  she found) on the Mainland General roof with the fog rising up the building; the bridge is ~6 minutes away on foot.
- Planted: Abe's old badge "KESSLER HILL TOWER · CHIEF ENGINEER · A. MORROW" (you have it now); the tower's red light blinks above the town; the street laughed at Abe for years.
- Sets/kit: engine/sets_fog.js (harborStreet, harborFlat, truckCab, hospitalRoof, iceTruck, fogBank/fogFront/fogRing/fogTouch/fogPhone). Part 2 may revisit ONE of these (new angle/time).
