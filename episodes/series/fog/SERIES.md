# Series S1 — THE FOG (choose-your-path, 5 parts) — owner request 2026-11-22

Owner: "For the next few episodes (5) can you create a choose-a-path / vote story line? … When the series is done transition back to what
we've been doing so far." "Maintain the current Roblox style we have and make the story for all ages, not only for kids."
"After each video, I'll let you know of the results and we'll continue from there."
Reference the owner shared (format only — never copy its story): a second-person ("Imagine you wake up…") 80-second disaster short with a
countdown, a stranger everyone laughs at who turns out to be prepared, on-screen "rules", a phone text that forces a choice, and an end card
with two options (A red / B green) + "FOLLOW FOR PART 2".

## Who makes the parts, and when
- **Owner 2026-11-23:** the FIRST run (midday or evening) after the owner reports a vote result makes the next part — one part per day. The owner posts each part at
  4 PM Eastern (11 AM on weekends) and sends the vote result by ~11:30 AM the next day, so the 11:40 AM midday run builds the next part in time.
  (Old rule: only the evening run made parts.)
- The evening run makes **Part N** when Part N−1's vote result is filled in below (Part 1 needs nothing). If the result is still `?`, the
  evening run makes a normal standalone episode instead and says in its final message that the series is waiting for the Part N−1 vote.
- **Recording a result:** whenever the owner tells any session a result ("Part 1: B", "B won", "they picked the truck"), write it in the
  table below (letter + the option text + date), commit and push that change straight away, before anything else.
- After Part 5 is delivered, set the status line to DONE; every run then goes back to normal episodes (RUNBOOK as before).

**Owner override (2026-11-26, today only):** no Fog part today. The 11:40 AM midday run makes a regular standalone episode (even if the Part 3 vote result is filled in), and the 3:20 PM evening run makes a second standalone as usual — two standalones are allowed on 2026-11-26 only. Part 4 waits for the owner's Part 3 vote result: once it is reported (on a later day), the first run after that builds Part 4 under the normal rules — until then, standalones only.

Status: ACTIVE — next: Part 4 (locked until the owner reports the Part 3 vote). Daily schedule while the series runs: one Fog part (posted 4 PM ET) + one standalone (posted ~7:30 PM ET) — see the owner schedule at the top of RUNBOOK.md.

| part | episode | choice offered at the end (A / B) | vote result |
|---|---|---|---|
| 1 | 015 | A: STAY IN ABE'S TRUCK · B: RUN TO NELL | A: STAY IN ABE'S TRUCK (owner, 2026-11-24) |
| 2 | 017 | A: CARRY MUSIC TO ABE · B: TAKE DOT'S BOAT | A: CARRY MUSIC TO ABE (owner, 2026-11-25) |
| 3 | 019 | A: DRIVE TO THE TOWER · B: SAVE NELL FIRST | ? |
| 4 | — | (decided by the Part 4 run) | ? |
| 5 | — | finale — no vote ("comment what you would have done") | — |

## Format (every part)
- **Second person**, narrated in the owner's cloned voice (engine/voice.py, defaults): "You wake up…", "You run.", "Do you…". The viewer is the hero:
  the on-screen YOU avatar (cast.js) is the same in every part. Dialogue from other characters in "quotes" + bubbles as usual.
- **All ages, not only kids** (owner 2026-11-22): real tension, real stakes, genuinely scary moments, adult characters with adult worries.
  Still no gore, blood, weapons violence or swearing — the danger is the fog and losing yourself in it, not injuries.
- Same Roblox look and all the usual quality rules (RUNBOOK 2–6b). Length 2:00–2:10 (owner 2026-11-26). Every part opens with the 1–2 s hook (hook.json).
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

## Part 2 as made (episode 017, 2026-11-24) — continuity for Part 3
- Vote A (stay in the truck). Time: doors locked 5:48; Front Street + Dot's at 5:51 (battery 1:00); the jingle dies ~5:52; Part 2 ends 5:53.
- Where everyone is: YOU + BISCUIT inside DOT'S RECORDS (base of the pier, Front Street) with a wound-up portable record player playing (~2 minutes of song left at 5:53) — it keeps a clear bubble in the shop;
  DOT (new recurring, cast.js: record-shop owner, silver perm, headphones, purple stripes, teal scarf) is back to herself, knows Abe ("Abe Morrow"), says "Only Abe knows how to stop it",
  and has a boat on the pier that can reach the hospital (orange-float boat keys). ABE is fogged (grey, blank) in the driver's seat of the truck parked outside the shop (battery 0:00).
  NELL + PIP: Nell texted "Fog's at the roof door. Pip is scared." → you: "Hold on. I'm coming." → Nell: "It's under the door."
- Told so far: Abe: "Thirty years ago, this fog took the pier. One night. Everyone on it. Nobody believed me." (flashback: young Abe in a hard hat on the pier, dancers frozen in fog) and
  "It doesn't come from the sea, kid." (still no tower reveal). Shown: music brings a fogged person back after a little while (Dot); a fogged person's dog still knows him.
- Options: A: CARRY MUSIC TO ABE (walk the record player out into the fog to wake Abe — he knows how to stop it; costs the song's last minutes / time for Nell) ·
  B: TAKE DOT'S BOAT (cross the bay to the hospital roof with Dot; Abe stays fogged in the truck).
- Sets: engine/sets_fog.js harborFront (Front Street, boats, pier, DOT'S RECORDS exterior; flash = 30 years ago), recordShop (interior, power out), gramophone, musicNotes, boat. Part 3 may revisit ONE series location.

## Part 3 as made (episode 019, 2026-11-25) — continuity for Part 4
- Vote A (carry the music to Abe). 5:53 → 5:55. You carried the wind-up record player through the fog (its music = a small clear bubble), the needle skipped once, Abe came back.
- Abe: "This fog doesn't come from the sea. It comes from Kessler Hill. From my tower." / "Only I can shut it down." Flashback shown: young Abe (hard hat, navy jacket, black mustache) in the
  Kessler Hill transmitter room at dusk, the VU needle shaking in the red, two engineers laughing — "I told them it was broken. They laughed." (WHY it makes fog = still for Part 4.)
- Cost: DOT is fogged again (grey, in her shop doorway) because you took her music. Truck engine running, record player on the dash (needs cranking, ~2 minutes per wind). Your phone at 3%.
- NELL + PIP: top-floor stairwell of Mainland General, fog climbing the steps, "Top floor. One door left. Where are you?"
- Options: A: DRIVE TO THE TOWER (Abe shuts the transmitter down — ends it for everyone, but Nell has one door) · B: SAVE NELL FIRST (cross the bridge to the hospital with the music; the tower keeps humming).
- Sets: fogBoardwalk, towerControl, hospitalStairs (engine/sets_fog.js). Part 4 may revisit ONE series location (e.g. towerControl in the present, fogged).
