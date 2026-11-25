# Toolkit reference (`engine/kit.js` — import everything from `'../../engine/kit.js'`)

Coordinates: y up, characters stand on y=0 facing +Z, camera usually at +Z looking toward -Z. 1 unit = 1 Roblox stud.
Avatar: 5.3 tall. Head center y≈4.64, torso y 2–4, legs 0–2. Sitting on the ground: `root.position.y = -1.45` + `SIT` pose.

## Characters
`makeAvatar(opts)` → `A` with `A.root` (Group), joints `A.body A.neck A.armR A.armL A.legR A.legL`, `A.headMesh`,
`A.pose(p)`, `A.setFace(name)`, `A.blob` (contact shadow).
opts: `skin` ('tan'|'light'|'brown'|'yellow'|'pale'), `shirt` (hex), `shirtStyle` ('plain'|'hoodie'|'shirt'|'blazer'|'tee'),
`pants` (hex), `pantsStyle` ('jeans'|'plain'), `hair` (see below), `hairCol`, `hairSeed` (varies part side / spike layout; default from `name`), `hat` (bool, top hat), `hatCol`,
`face`, `name` (required — used by the collision checker), `blob` (false = no contact shadow), `cast` (cast real shadows).
`add(S, A, [x,y,z], rotYdeg)` places it. Presets: `LEO TEACH DAD COUS EX[0..4]` (episode 001 — make new ones).

Pose object (degrees, all optional): `rUp lUp` (arm raised sideways, 150 = overhead; negative = inward),
`rFwd lFwd` (arm forward; 90 = pointing; 125 = hand to mouth), `rLeg lLeg` (leg forward), `rLegOut lLegOut`,
`nod` (+ = look down), `turn` (head yaw, + = to its left/screen right), `tilt` (head roll), `lean` (body forward),
`bodyTurn bodyTilt`, `bob` (body up/down).
Sitting: `sitOn(A, seatTopY)`, `sitGround(A)`. Spacing minimums: `SPACING` (sideBySide 4.3, armsOut 6.5, facing 2.6, facingArmsForward 4.6).
Collision check: `engine/clips.js` (`render.py … clips`); whitelist intended touches with `S.userData.allowContact`.
Library: `POSES.rest hips armsup wave point shrug slump shock spit sprawl`, `SIT HUDDLE HUG`.
Helpers: `addPose(a,b)` sum, `lerpPose(a,b,t)`, `track([[t0,pose],[t1,pose],…], t, easeFn)` keyframes,
`idle(t,k,seed)`, `walk(t,speed,amp)`, `sob(t,k)` crying shake, `ease`, `snap` (fast-out).

## Hair, facial hair and age (`engine/hair.js`)
Sculpted, one merged mesh per avatar. `hair:` style, `hairCol:` color (`HAIR_COLORS.black darkbrown brown auburn ginger blonde
platinum saltpepper gray silver white`), `beard:` `stubble` `mustache` `goatee` `full` `walrus` (`beardCol` optional),
face details `wrinkles: true` (forehead lines, crow's feet, smile lines), `freckles: true`, `rosy: true` (pink cheeks).
Pick by age group — give every character in an episode a different style + color:
| age | hair styles | extras |
|---|---|---|
| baby / toddler | `tuft` | `rosy` |
| kids (6–12) | `short` `spiky` `curly` `pigtails` `puffs` `ponytail` `bob` `braids` `swoop` | `freckles`, `rosy` |
| teens | `swoop` `spiky` `mohawk` `long` `ponytail` `braids` `buzz` `afro` | — |
| adults | `slick` `crew` `receding` `bun` `lowbun` `long` `bob` `afro` `buzz` `braids` | `stubble` `mustache` `goatee` `full`; a few gray strands = `saltpepper` |
| elderly | `balding` `combover` `perm` `lowbun` `bun` `slick` `bob` (gray/silver/white) | `wrinkles`, `full` `walrus` `mustache` |
New styles: add a `case` in `hairGeometry()` using `shell({line, upper, thick, flare, edge, clumps, swirl})`, `lock(points, r)`, `cone`,
`ball`, `ring` (head-local: front +Z, top y=0.61, brows y≈0.28, mouth y≈-0.13 — keep fringes above y≈0.32 and beards below -0.22 in front).
Textures: streaky glossy clumps by default; `COILY` styles (afro curly puffs braids perm) get a coily texture.
Check: `python3 tools/hair_lineup.py out.jpg [style …]` (`SET=new` = age-group set) and `python3 tools/face_lineup.py out.jpg face@style+beard+color+wfr …`.

## Shadows / silhouettes
`wallShadow(S, opts, [x, z], {profile, size, mat})` flat black figure on a wall facing +Z (put z just in front of the wall);
`.flat` group (move it), `.pose()`, `.root.rotation.y` to flip profile. `flat.position.y = -1.45` for a sitting silhouette.
`floorShadow(S, opts, [x, z], dirYdeg, size)` lies on the floor extending toward +Z; `inner.rotation.x = -PI/2` to extend toward -Z.
Shared materials: `shadowMatWall`, `shadowMatFloor` (clone one to fade a single silhouette).

## Camera
`camPath(cam, p, fromPos, toPos, lookFrom, lookTo, lensA, lensB?)` — p = t/dur (eased). Lens 22 wide … 50 tight.
`seg(t, dur, [0.5])` → `[segmentIndex, localProgress]` for internal cuts. Can build several mini-sets in one shot by
offsetting Groups (e.g. x = ±200) and cutting between them (see 001 line 49).

## Sets (each adds geometry + lights to S)
Day exteriors: `dayLight(S,{sunPos,intensity})` + `street(S,{farBuildings})`, `wall(S, brickColor)` (brick wall, front z=-2.5),
`bakery`, `field` (soccer), `backyard` (fence front z≈-4.75, picnic blanket), `ocean` (returns airplane).
Interiors: `room(S,{w,d,h,wallCol,floorTex,zBack})`, `classroom(S,desks)`, `dining`, `kitchen` (dining + fridge),
`kidRoomDay`, `hallway` (lockers), `stage` (spelling bee), `cafeteria`, `bus`, `airport`.
Night: `bedroom` (door, window, moon, spot on back wall), `playground` (swings, wall front z=-6; returns swing groups), `porch`.
Props: `trophy(S,pos)`, `cookieJar(S,pos)`, `airplane(S,pos,scale)`, `crumbs(A)`.
Primitives: `box(S,[w,h,d],[x,y,z],material,{r,cast,rot})`, `std({...MeshStandardMaterial})`, `repeatMat(tex,rx,ry)`,
textures `T.brick T.planks T.tiles T.concrete T.asphalt T.plaster T.facade T.chalkboard(lines) T.sky(top,bottom)`,
`T2.lockers T2.grass T2.sand T2.siding T2.fence T2.sign(text,bg,fg) T2.hands T2.calendar`.

## Episode 003 kit (`engine/sets4.js`)
`promiseString(S,{col,r,glow})` glowing tube: `.set(a,b,{sag,fade,r,snap})` (snap 0..1 = broken halves fall), `.path(pts)`, `.at(u)`, `.color(c)`, `.hide()`.
`pinky(A,'R'|'L')` world position of a hand's tip. `kite(S,pos,{s,c1,c2,done,dusty,drawings,tail})` + `kiteFlutter(g,t,k)`, `spool`, `bird` (`userData.flap(t)`),
`birdNest`, `ladder`, `sink(S,[x,z])` (returns `{drip}`), `laundryItem(S,kind,col)`, `phone(S,title,sub)`, `fedora(A,col)` (detachable hat), `glueJar`, `dust` (floating motes updater).
Sets: `hill(S,{sunset,cottage,trees})` + `hillY(x,z)` ground height (flat top r=16 at y=0), `cottage(S,pos)`, `bridge(S)`, `livingRoom(S,{night,sunset,kiteDone,dusty})` (armchair seat top 1.7 at (-1.2,-5.6)).
Framing lesson from 003: two-shots need lens 26 at distance ≥ 15 (or lens 22 at ~12); close-ups at distance ≥ 6.4 with lens ≤ 34 so buns/hats fit. For a close-up of someone not facing +z, use
`faceCam` (episodes/003-kite/common.js) which places the camera along the character's facing direction. Rooms have no front wall: if the camera looks toward +z, add one.

## Themed worlds + monsters (`engine/themes.js`, for wild episodes)
`const env = forest(S, {night})` · `spooky(S)` · `space(S)` · `underwater(S)` · `candy(S)` · `castle(S, {night})` · `cityNight(S)` ·
`snow(S)` · `desert(S)` · `lab(S)` (also `WORLDS[name]`). Each builds floor, backdrop, sky, fog and lights, keeps the play area
(x ±7, z -4..8) and the camera corridor clear, and returns `env.update(t)` for ambient motion (fireflies, bubbles, snow,
waving banners, glowing tanks) — call it in the shot's update. Night worlds set `look='night'` and include a face key light.
`monster(S, { name, col, belly, shape: 'blob'|'box'|'tall', eyes: 1-3, horns, teeth, arms, tentacles, size, spots, seed })` →
`m.root` (position/rotate it), `m.animate(t, 'idle'|'bounce'|'chase'|'scared'|'wave')`, `m.look(vec3)` (pupils follow),
`m.blink(0..1)`. Height ≈ 4 × size, feet on y=0, faces +Z, tagged for the collision checker (keep 4+ units from avatars).
**Scary creatures** (kid-horror, Roblox-horror style — creepy, never gory): `creature(S, { kind, name, col, eyeCol, size, seed })`,
kinds `stalker` (tall, hunched, long clawed arms, too-wide jagged grin, blank glowing eyes) · `brute` (hulking, horns, slit eyes, tusks)
· `crawler` (spider-thing, cluster of glowing eyes) · `shade` (floating hooded shadow, red eyes). `c.animate(t, 'lurk'|'stalk'|'lunge'|'roar'|'hide')`,
`c.look(vec3)` (head snaps toward a target), `c.eyesOn(0..1)` (eyes appear out of the dark). Best in dark worlds (spooky, forest night,
cityNight, castle night, lab); stalker is ~7.5 tall — frame from low angles for menace.
Previews: `python3 tools/world_lineup.py out.jpg [world …]`.

## Sound (engine/sfx.py) — 2026-11-25 additions
heartbeat door roofcreak woodsteps roomtone crowd rumble splash glass bigwhoosh; the effects bus gets a short room reverb. Voice: engine/voice.py uses
VOICE_GUIDANCE (3.0) + mood-shaped reference prompts per delivery tag (MOOD_REF; owner clips engine/voice/narrator_ref_<mood>.wav override) + MASTER chain.

## Look / grade
Compositing (2026-11-25, in the Grade pass at q=1): unsharp mask, highlight halation, anamorphic streaks on practicals, edge chromatic fringe — `S.userData.comp` scales it (`?comp=0` URL param = off).
Set `S.userData.look = 'night'` or `'flash'` (flashback). Post: bloom, split-tone grade, vignette, grain (engine/main.html).

## Faces
**Facial animation (2026-11-25, automatic):** engine/main.html blinks every avatar (~every 2.5–5 s, per-name rhythm; closed-eye faces skip it) and flaps the
mouth while the pose contains `talk(t)` (it now returns `mouth: k`; > 0.3 = talking). `A.anim(blink, mouthOpen)` paints the variants (eyes closed / open mouth found
automatically in each face PNG — works with new faces too). Turn off per scene with `S.userData.faceAnim = false`; thumbnails/lineups render with `blink=0`.
**Face fill (2026-11-25):** at q=1 a soft light rides between camera and subject (`S.userData.faceFill = false | scale`).
Faces are painted into the head's skin texture (cylindrical mapping, seam at the back of the head) — never add face decals/planes.
`A.setFace(name)` swaps the expression instantly.
`engine/faces/*.png` are loaded automatically. Current (33): smile grin shock sad smirk neutral worried cry teary fakesmile determined softsmile
wink awe blush angry laugh scared sleepy sleeping love starstruck confused thinking nervous mischief proud bored disgusted silly pout relieved delighted.
New faces: draw with PIL like `tools/faces4.py`. Swap expressions mid-shot with `A.setFace()` for reactions (e.g. smile -> shock -> laugh).

## Rain + Episode 005 kit (`engine/themes.js` rain section, `engine/sets6.js`)
**Rain system** (themes.js, reusable for any rainy scene): `const R = rain(S, { n, radius, top, speed, len, col, opacity, wind, splashes, ground, lightning: [t…], lightMax })`
then call `R.update(t, cam)` in the shot update **after** `camPath` (streaks and splash rings follow the camera; `ground: null` = no splashes, e.g. interiors;
`n: 0` = lightning only). Lightning: list shot-local strike times → double-flash light spike (pair with a `thunder` sfx at the same time); `R.flash(t)` → 0..1.
Helpers: `wetFloor(S, {area, puddles, col})` glossy street with mirror-dark puddles · `lightStreak(S, [x,z], col, {len, w, k})` vertical light reflection on wet
ground · `rainGlass(S, [w,h], [x,y,z], ryDeg)` drops + running streaks on a window (returns `update(t)`) · `patternLight(S, {pos, target, col, intensity, angle,
pattern: 'blinds'|'rain'|'window'})` SpotLight with a cookie texture (blind stripes / rain-streak shadows on walls and faces).
**Sets (sets6.js)** — all return `{ update(t, cam) }` (call every frame): `shopFront(S, {lightning})` rainy neon street + "TIME EXCHANGE" storefront (facade z=-6, door x 2.2..4.8);
`shopInside(S, {lightning})` (counter top y 3.0, front face z=-2.4; shopkeeper z≈-5.9, customer z≈0.2 facing 180; jar shelves, banker's lamp `env.key`, rain window
`env.cold` (`cold.userData.base` = intensity), front wall z=11.6 for reverse shots); `apartment(S, {morning, lightning, lamp})` (couch seat top 1.6 at x=-3.5 z≈-5.3,
table top 2.6 at (4.5,-2.5), door on right wall `env.door`, rainy/sunny back window); `stoop(S, {morning, lightning})` rowhouse door + landing (top 1.5) + 2 steps
(tops 1.0/0.5, z -5.1..-3.5), rails x=±3, streetlamp; `rainStreet(S, {lightning, rainOpts})`.
**Props/helpers**: `lifeClock(A, {side, years, col, light})` glowing wrist clock (`.set(n, col)`, `.glow(k)`, `.hide(b)`, `.world()`); `longSleeve(A, side, col)` (`.pull(0..1)`);
`grayHair(A, k)`; `umbrella(S, col, r)` (hold with `{rFwd: 65, rUp: -22}`, place at `pinky(A,'R')`); `coinBag`, `coinPour(S, from, [x,y,z], n)` → `update(k)`;
`lightStream(S, col, n)` → `update(a, b, k, t, arc)` particles flowing a→b; `yearJar(S, pos, col, {s, light})`; `paperSheet`, `pen`, `broom`, `consoleBox`.
Render cost (005): cityNight + rain + several shadow-casting spot lights renders ≈4.5–5 s/frame at q=1 (vs ≈2 s for daylight sets) — budget ≈3 h for an all-rainy episode, or use fewer point lights.
Lesson from 005: cyan practical lights on 'yellow' skin read green — keep coloured face lights weak (≤1.5) or lerp them toward white (lifeClock does).

## Clouds (`engine/clouds.js`) — every outdoor sky has them
`clouds(S, { n, y: [min,max], z: [near,far], x, size, speed, tint, night, opacity, seed, front })` → puffy low-poly clouds in a band far behind the set
(plus a few on the camera side for reverse shots), unaffected by fog, drifting slowly. Already called by `dayLight`, `rig()` (all themed worlds; `cloud: false`
for space/underwater, `cloud: {…}` to pass options), `hill` (sunset tint), `ocean`, `stoop`, `cityNight`. Drift runs through `S.userData.tickers` (functions of shot time,
run every frame by engine/main.html) — usable for any other ambient motion too.

## Outfits + cast lineup (`engine/outfits.js`, `tools/cast_lineup.py`)
`makeAvatar({ ...preset, outfit: ['cap', ['backpack', { col: 0x2a6ae8 }], 'boots'] })` (or `outfit(A, items)` later). Items: head — cap {col, back} beanie
helmet {visor} spacehelmet hardhat headband headlamp {light} crown wizardhat cowboyhat piratehat bandana goggles glasses sunglasses bow headphones antennae hood;
body — backpack cape scarf vest apron belt badge armor overalls labcoat tie bowtie sash satchel lifevest jetpack; limbs — gloves boots wristband kneepads.
beanie/helmet/hardhat/bandana/hood hide the hair (`{ hair: true }` keeps it). All pieces are tagged for the collision checker (a backpack/cape needs room behind).
Extra shirt styles: stripes plaid jacket sweater uniform spacesuit knight. Skin also accepts any hex (e.g. 0xa3a2a5 classic gray).
`python3 tools/cast_lineup.py episodes/NNN-slug out.jpg` renders `CAST` from the episode's common.js (front + 3/4, labelled).

## Episode 006 kit — farm town that lives at night (`engine/sets7.js`)
Sets (all return `{ update(t) }`, call every frame): `fernway(S, { night, dawn, sunPos, balloon, busstop })` main street — boarded houses back-left (front z=-14),
cornfield behind a fence (x > 5, z < -7), bus-stop shelter at (-12, -2.6) (roof y 5.4 over x -15.2..-8.8, z -4.8..-0.4), lamp posts, string lights at night, Moon Fair
balloon tethered at (-1.5, -8.8) (`env.balloon`, glows at night; `env.corn.sway(t, k)` for a rustle). `cornfield(S, { night, dawn, sunPos })` dirt clearing (x ±8, z > -9)
+ path (|x| < 4.2) in corn, sun disc at dawn. `park(S, { sunPos })` wide open meadow, corn far away. `bedroomDay(S, { night })` two beds (x -5 / 4.5, mattress top 1.7),
boarded window with sunlight slits (patternLight), `env.door.open(k)` floods sunlight in, `env.blankets`. `nightClass(S)` classroom at 9 PM.
Props: `cornRows(S, { x, z, step, dx, night })` alpha-tested crossed-plane corn with shadows (`.sway(t, k)`), `moonBalloon(S, { glow, r })` (`.userData.rope(a, b, sag)`),
`busStop`, `lawnChair(S, [x,z], ry)` (seat top ≈1.1, lean -40 to lounge), `beachUmbrella(S, [x,y,z], col, r)`, `stringLights(S, a, b, n)`, `boardedWindow`, `sunDisc`, `stars`.
Day lighting tip: put the sun where its shadow lands where the story needs shade (the shadow offset per unit height is −sun.x/sun.y, −sun.z/sun.y);
directional-light shadows only include objects in front of the light position, so for tall props (balloons) use a far sun position (e.g. [10, 40, 14]).
Husk v2 (themes.js): deeper slanted sockets under a brow ridge, cheekbones, sunken cheeks, dim eye glow (no more "pumpkin" face light).
Freeze/unfreeze helpers and the scarecrow pose live in episodes/006-daycreatures/common.js (`husk()`, `scarecrow()`, `sitUp()`, `lie()`).

## Episode 007 kit — fading people + family home (`engine/sets8.js`)
`fade(A, k | { body, head, armR, armL, legR, legL }, { glow, glowK, keep })` makes an avatar see-through with a faint ghost glow (k 1 = solid, ~0.1 = a faint glowing
outline, 0.015 = nearly gone); parts listed in `keep` (default `['outfit boots']`) stay solid — e.g. only the sneakers walk around. Per-limb values let someone fade in
or out piece by piece (hands first, then the face). In bright scenes keep the head ~0.3 more solid than the body so the face stays readable (`ghost()` in
episodes/007-seethrough/common.js). `aura(A, k, col)` warm inner glow on a solid avatar (keep k ≤ 0.3 — bloom blows it out). `thoughts(S, col, n)` →
`(from, to, k, t, arc)` golden motes streaming from a thinker's head to someone. `dimLights(S, f)` scales every light in a set.
Sets (all return `{ update(t) }`): `familyKitchen(S, { morning, night, flash })` = kitchen (dining table top 2.75 at (0,-2.8), x ±3.25, z -4.5..-1.1; stand behind it at
z ≤ -6.2 when arms reach forward) + counter/cabinets/cookie jar on the left (front z -6.8), window, fridge drawings. `nursery(S, { night })` crib at (2.5,-6.8)
(solid collider 'crib' — whitelist a baby lying in it), spinning star mobile, rocking chair, bunting. `nightStairs(S, { lamp, day })` wide staircase (x ±5) climbing to -z:
step i top 0.7(i+1), z -(i+1)..-i; sit with `sitOn(A, 1.4)` at z -1.42 (step 1), whitelist 'step*'; moonlit window, warm lamp, banisters. `carInside(S, { sunset })`
two front seats (seat top 1.6) at x ±2.3 facing +z, dash/wheel in front, scenery streaming past; frame through the windshield at z ≈ 9, lens 26–28.
Props: `mug`, `cerealBowl`, `plate`, `pizzaTray` (+`slice`), `crib`, `dinoPancake`, `strawberry`, `strawberryBowl`, `swaddle(A)` (blanket around a small baby avatar), `handMirror`, `pan`.

## Episode 008 kit — neon beach city + the Wait (`engine/sets9.js`)
`neonBeach(S, { time: 'sunset'|'night'|'dark'|'dawn', view: 'strip'|'beach', shop, wires, billboard: [x,y,z], board: {text, sub}, cars, palms, sign: {x,y,z}, signText, signSub })` → env
- strip: pastel art-deco hotels (fronts z=-16, 12–22 tall, neon trim + vertical neon name fins, awnings), street z -13..-6 with retro cars cruising along x (`cars:false` = empty),
  pastel-tile promenade (characters at z > -6), palms at z=-5 (x ±9, ±21, ±33), deco lamps x ±15. `shop:true` = Pixel Palace storefront at x 0 (door x ±1.4, sign y 6.4, front z -16).
  `wires:true` = poles x ±18 at z -7, three wires at y≈12 → `env.wires.sag(k, atX)`. Night: neon point lights + lit windows; `dark` = power cut (neon off, dim moonlight — add phone torches/fills for faces).
- beach: sand to the waterline (z≈-22), rolling ocean, giant sun disc at sunset/dawn, palms, pastel lifeguard tower (-17,-12), umbrellas + towels, distant pastel skyline.
- `env.neon(k)` neon power 0..1 (signs, trims, windows, billboard, neon lights) — animate it for blackouts/power-ups; `env.board` (countdown), `env.key` face light, `env.update(t)` (palms, waves, cars).
`countdown(S, {pos, scale, text, sub, col})` minimap-style "6" billboard: `.set(text, sub, col)`, `.power(k)`, `.top` (y of top edge), `.group`.
`waitBlob(S, {name, size, glow, light})` neon-pink cute blob (monster-based, height ≈ 4×size): `.grow(s)`, `.squash(k)` (k>1 = flattened), `.glow(k)`, `.animate/look/blink`.
`flamingo(S, [x,z], ry, s)` (`.update(t, 'stand'|'walk'|'flap')`, `.head`), `retroCar(S, col, {lights})` (8 long, faces +x), `palm(S, [x,z], h, seed)` (`.sway(t)`), `powerLines(S, {x,z,y})`,
`boombox(S)` (`.pulse(t,k)`), `tvSet(S)` (`.screen('off'|'glow'|'load'|'seven', k, t)` — original abstract graphics only), `gameConsole(S)`, `controller(S, col)`.
`gameRoom(S, { dawn, flash, night })` living room: 3-seat couch along the back (seat top 2.0, seats x -4.6/0/4.6, sit at z -7.0, whitelist 'couch*' + 'box*'), TV (centre y 5.2) + console
(top y 2.1 at (-2.2, 10.6)) on the camera-side wall z 12.2, sunrise window, posters, plant, lamp, rug, ceiling. Camera for the couch wide: (0, 6, 11) lens 22.
Shirt styles: `hawaiian` (hibiscus print all round), `flamingo` (faded flamingo print), `polo` (staff polo + chest logo). Outfit: `skates {col, wheel}`, `sunglasses {up, frame}`.
Episode helpers (episodes/008-launchday/common.js): `SKATE(t)`, `DANCE(t,k,ph)`, `hold(prop, A, side)`, `PHONE_UP`, `hn()` numeric overshoot keys (hit() only works on pose objects!).

## Episode 009 kit — living snowmen + snowy town (`engine/sets10.js`)
`snowman(S, { name, size, scarf, earmuffs, hat: 'top'|'cap'|'bobble', hatCol, glasses, bag, crooked })` living snowman (≈4.6 × size tall, faces +Z; size 4.5 = a
21-stud giant). `.pose({ rUp lUp rFwd lFwd nod turn tilt lean bob hop squash bodyTurn })` stick arms work like avatar arms (rest ≈45); `.face({ mouth -1..1, open 0..1
(roar "O"), brows + angry / − worried, sleep 0..1 })`; `.hand('R'|'L')` world tip of a stick hand; `.head`, `.root`. Tagged for the collision checker (OBBs of the big
spheres are boxy — keep avatars ~1 unit further away than it looks). `catSnowman(S, {name, s})` (`.update(t, 'sit'|'wag'|'hide')`), `pup(S, {name, col})` blocky dog
(`.update(t, 'run'|'sit'|'bark')`), `knitting(S, col)` (needles + crooked scarf, `.click(t)`), `snoreZ(S)` (`.update(t, pos, k)`), `snowBurst(S, {n, size})` (`.fire(origin, t0,
{up, spread, scale})` + `.update(t)` every frame), `snowAngel(S, [x,z], size)` imprint (`.set(k)`), `mailbox`, `bucket`, `rosette` (prize ribbon), `shovel`, `snowMat(rx, ry)`.
Sets (all return `{ update(t) }`): `snowTown(S, { time: 'day'|'morning'|'sunset', mailbox: [x,z], bunting, lamps, fences })` snowy street — houses fronts z=-16 with thick
roof snow (`env.roofSnow(k)` slides it all off), plowed road z -12..-6 (room for a giant at z≈-10 with `lamps:false, fences:false, bunting:false`), chimney smoke, snowfall.
`snowPorch(S)` house front (wall z=-5.2), porch deck top 0.86 (z -5.2..-1.2), bench seat top 2.07 at (-2.6, -4.3) (sitOn + whitelist 'bench*'), icicles, sled.
`frostFair(S, { time: 'day'|'sunset', clear: [[x,z,r]], arch, archX })` = `snow()` world + FROST FAIR banner arch (z -12, x archX±9), bunting, judges' table (top 2.4 at (8,-3.5)),
entry snowmen; `clear` hides trees/rocks around big actors; sunset re-grades sky + sun (pink-gold, front-lit so snow stays white).
Outfit: `earmuffs {col}`. Episode helpers (episodes/009-copycat/common.js): `giant()`, `stompK()` (hop + slam), `shake(cam, t, t0, k)`, `kidStomp()`, `fallBack(A, x, zFeet, k)`, `ANGEL(t)` snow-angel sweep.
Framing lesson from 009: half-width ≈ 0.28 × distance × (30/lens) — two people 6 apart need distance ≥ 16 at lens 24; for a 21-tall giant + a kid use lens 22 at distance 20+.

## Episode 010 kit — missing-you petals + care home (`engine/sets11.js`)
`petals(S, { n, size, seed })` → `update(t, center, { k, r, top, floor, wind: [x,z], speed, spin })` flutter-falling petals in a column over `center` (spawn at center.y+top, land flat on `floor`,
appear out of nowhere); episode helper `shower(S, A, opts)` (episodes/010-petals/common.js) follows a character's head. `petalRiver(S, pts, { n, width, speed, size })` → `update(t, k)` a ribbon of
petals flowing along a CatmullRom path (`.reach(u)`). `petalPile(S, [x,y,z], { rx, rz, h })` (`.set(k)`) textured pink mound (forts, buried beds), `petalCarpet(S, [x,y,z], [w,d], { density })`
(`.set(k)`) petals lying on floors/tables, `onePetal(S)` hero petal. Props: `fishbowl(S, pos, s)` (`.update(t, look)`), `stopSign(S)` (hold at hand, off [0,-0.75,0.1]),
`drawing(S, kind, w)` crayon drawings (rocket sun family flower grandpa cat house rainbow), `drawingStack`.
Sets: `sunnyPines(S, { time: 'day'|'sunset', grandpaWin })` care-home front (building front z=-14, lit window `env.winPos` at x 9 y 4.6, path x ±2.5, lamps x ±4.5 z -4 — keep cameras off that line).
`careRoom(S, { time: 'sunset'|'day' })` room with a big window (x -2.5, back wall z -9, sky plane `env.sky`), armchair seat top 1.7 at (-3.6,-5.3), wooden chair seat top 1.7 at (1.6,-5.4), lamp, bed on the
right (x 4.5..8.7, z -3..4.75 — walk paths must stay at x < 2.6), front wall z 11.2. Seated two-shot: camera (-1, 7, 10) lens 24 looking at (-1, 4.3, -5.3).
Lesson from 010: `street()` has no lights — call `dayLight()` first. Rooms are open toward +z: a far wide camera sees past the floor/ceiling edges (black bars) — extend them (`extendRoom` in 010 shots_a.js).

## Episode 011 kit — worry stones, island ferry + lighthouse (`engine/sets12.js`)
`worryStone(S, text, { s, seed, glow })` grey pebble with a handwritten word on top (`.glow(k)`, `.userData.label`); `stonePile(S, [x,y,z], { n, r, h, labels, s })` (`.set(k)` shows the first k·n, `.stones`).
`bigPack(A, { col, s, anchor })` backpack on an avatar's back that GROWS: `.grow(s)` (1 = school bag, 3.2 = fridge-sized), `.open(k)` flap, `.stuffed(k)` bulge, `.anchor` (ship's anchor hanging below — rescale it with `anchor.scale.setScalar(0.62 / s)`);
tagged as the avatar's outfit for the clip checker. `packProp(S, { col, s })` the same pack as a free prop (bottom y=0, back face z=0, body extends to −z; rotate PI to face the camera). Drop a stone into a pack: `dropper()` in episodes/011-worrystones/shots_a.js.
`lighthouse(S, [x,y,z], { s, night, beam })` red/white tower (18·s tall + lantern) with sweeping beam cones (`.update(t)`); `sea(S, { y, night, speed, dir })` animated sea plane → update(t); `gull(S, s)` (`.update(t, 'fly'|'stand')`).
Sets (all return `{ update(t) }`): `ferryDeck(S, { time: 'morning'|'sunset' })` island ferry deck along x (planks y=0, x ±24, z −8.6..11; back rail z −8.6 with benches seat top 1.6 at z −7.2, x ±(6..13); wheelhouse x −24..−15; mast/pennants, crates, lifebuoys; island + lighthouse on the horizon; camera z ≤ 10.4 (front rail z 11.2)).
`keeperAttic(S, { night })` A-frame attic bedroom (kneewalls x ±9, ridge y 10.5, back wall z −8 with a ROUND window centre (0, 5.2) looking at the lighthouse whose beam sweeps the room; bed left x −7.8..−4.2, desk + lamp right z −5.6, moving boxes x 5–8 z 1.6–6.4; floor free x −3..4, z −4..6).
`lighthouseCliff(S, { time: 'day'|'sunset'|'night' })` cliff top: lighthouse (−11, 0, −19), keeper cottage (14, 0, −17), gravel path curve `x = −11·clamp((10−z)/26)^1.6`, bench seat top 1.6 at (3, −9.6) (sit at z −9.2), lamps (`env.lamps` PointLights), fence at the cliff edge z −25.5, sea far below, stars + moon at night.
`lanternRoom(S)` inside the lighthouse lantern at night: round room r 8 (keep the camera at r < 7.4, or outside the glass at r > 9 looking in), giant turning lens at (0, 0, −3.2) (pedestal top 2.2; beams sweep out), floor hatch `env.hatch` (4.4, 0, 4.0) + `env.lid`, oil lantern practical, logbook desk, glass all round. Two seated kids: June (−2.2, 0.8), Milo (2.2, 0.8).
Lessons from 011: the real 9:16 frame is narrower than the old rule of thumb — width ≈ 2 × distance × 0.5625 × 12/lens (lens 24 at 10 units ≈ 5.6 wide); two seated people 4.4 apart need lens 16–18 inside a small room. A lit near-mirror material (roughness ≤ 0.05) right next to a strong point light can output NaN pixels, which bloom smears into big black blocks — make glowing glass unlit (MeshBasicMaterial).


## Episode 012 kit — candle dragons + castle at night (`engine/sets13.js`)
`flameDragon(S, { name, s, body, belly, light, seed, dist })` cute glowing fire dragon (s 1 ≈ 4 long, 3 tall, faces +Z, feet y 0; tiny 0.13–0.2, grown 0.5, giant 3.6):
`.root` (position/rotate), `.g` (inner group, scale it for grow/shrink), `.head`, `.update(t, 'fly'|'hover'|'perch'|'roar'|'curl'|'eat', k)`, `.look(vec3)`, `.jaw(k)`, `.breath(k)` fire cone, `.glow(k)`, `.blink(k)`, `.mouth()`.
`flame(parent, { s, col, core })` teardrop flame (`.set(k)` 0 = out, `.update(t)`) · `torch(S, [x,y,z], { ry, lit, light, dist })` iron wall sconce (sticks out along its facing; `.set(k)`, `.tip`, `.update(t)`)
· `candle(S, [x,y,z], { h, r, col, lit, light })` · `cake(S, [x,y,z], { n, s, lit })` two-tier birthday cake with n candles (`.candles`, `.set(k)`) · `spark(S)` (`.set(pos, k)`) · `embers(S, n)` trail (`.update(t, pos, k)`)
· `shield(S, col)` · `flourSack(S, [x,y,z], { s, open })` (open = someone can hide inside) · `marshmallowStick(S)` (`.toast(k)`, `.tipLocal`) · `loaf(S, [x,y,z], toastK)`.
Sets (all return `{ update(t) }`): `castleKitchen(S)` stone kitchen at night — bread oven left (glow light `env.oven`), bread table top 2.6 at (0.4, -2.6) x ±3.2 z ±1.1, candle `env.candle` at (2.9, 2.6, -1.9), copper pots, shelves, flour sacks right.
`greatHall(S, { dark, cake, lit })` banquet hall: walls x ±11, back wall z -26 with rose window + throne dais (top 0.6, z -25.8..-21.8; stand at z -22.2, y 0.6), 10 torches (`env.torches`: 0–7 on side walls z -20/-14/-8/-2, even = left; 8–9 back wall), banquet table x -5.5 (top 2.6, z -18..-2), chandelier `env.chL`/`env.chC`, `env.set(k)` all lights; `cake:true` = low round table (top 1.6) at (2.5, -4.2), `env.cake`. Free floor x -2.5..8, z -22..8.
`towerRoom(S)` round tower bedroom (wall r 9.5, arched moon window at the back, canopy bed left, nightstand candle `env.candle`, toy chest, bookshelf, tapestry, round rug at (1.6, 0.8)).
`battlements(S, { lit })` castle courtyard at night: curtain wall front z -14 (h 10, wall-walk y 10 at z -17..-14), stair along the wall face climbing toward -x (step i x 11-0.5i, top 0.5(i+1), walk at z -12.2),
towers x ±17, keep behind, 8 torches (`env.torches`, `env.set(k)`), well (-8, -4), cart (10.5, -2.5), barrels, banners, moon + stars + clouds. Giant dragon perch: (-6, 10, -16.5).
Outfits: `chefhat`, `knighthelm { col, plume }` (open face), `circlet { col, gem }`.
Lessons from 012: bump maps on big boxes seen at grazing angles produced NaN pixels that bloom smeared into huge black rectangles — sets13 uses no bump maps. Keep point lights out of geometry (a light inside a head overflows half-float buffers).
Two-shots: `lookAt` turns heads up to 70°, which can hide faces from a front camera — scale it (×0.45) when both characters should stay readable.

## Episode 013 kit — living science-fair projects + school (`engine/sets14.js`)
`spongeBuddy(S, { name, s })` cute living kitchen sponge (s 1 ≈ 1.65 tall, 1.5 wide; feet y 0, faces +Z): `.update(t, 'idle'|'hop'|'shy'|'yawn'|'giggle'|'drink'|'wave'|'tug'|'squeeze'|'sleep', k)`,
`.plain(1)` = an ordinary sponge (no face/limbs, flat on its plate), `.look(vec3)`, `.face('smile'|'open'|'o'|'grin')`, `.eyes(k)`, `.body` (rotate it to bow). Scales to bus size (s 6+).
`foamMonster(S, { name, s })` bubbly foam creature (s 1 ≈ 6.5 tall, base radius 2.6·s): `.rise(k)` (0 = foam puddle → 1 standing), `.eyesOn(k)`, `.mouth(k)`, `.update(t, 'idle'|'roar'|'chomp'|'reach', k)`, `.look(v)`, `.head`.
`foamPuffs(S, n)` → `(t, origin, k, { up, spread, size, fall })` bubbling eruption · `foamCarpet(S, [x,y,z], [w,d], { n, size })` `.set(k)` floor foam spreading from the centre.
`volcano(S, [x,y,z], s)` paper-mache MEGA VOLCANO with sleepy eyes: `.wake(k)`, `.burp(k)`, `.update(t)`, `.crater` · `potatoClock(S, s)` (`.update(t, 'idle'|'walk'|'hop')`) · `robotMop(S, s)` bucket robot with a mop
(`.update(t, 'idle'|'mop'|'roll')`; mop head at local (0.75, 0, 1.95)) · `robotArm(S, [x,y,z], s)` `.pose(base, shoulder, elbow, wrist)` · `paperPlane(S, col)` (+ `fly()` in episodes/013-sponge/shots_a.js) ·
`handBell(S)` (`.ring(t, k)`) · `triPoster(S, [x,y,z], title, col, ry, s)` · `fairTable(S, [x,z], { w, d, cloth })` (top 2.6, solid) · `eyeDropper(S)` (`.drop`) · `trophy2`.
Sets (all return `{ update(t) }`): `fairGym(S, { clean })` school gym science fair — floor x ±16, z -16..26, ceiling 16; back wall: hoop + SCIENCE FAIR banner + scoreboard; bleachers on the left (x -16..-9);
sun shafts from high right windows; tables: Dex (0,-8.3) with `env.volcano`, Benji (8,-2) (plate (8, 2.68, -1.7), `env.poster`), Priya (-6,-3), robot arm (-5,-9.5) `env.arm`, solar oven, bean maze; `env.foam` carpet; `clean:true` = no tables.
`schoolFront(S)` Sparkhill School from the lawn (building front z -20, entrance block x ±6 front z -18, `env.windows`, flagpole, trees, marquee, bench) — a giant (foamMonster s 5.2) behind the roof at (0, 0, -36).
`bathTest(S)` teal-tiled bathroom with a clawfoot tub (x -4.5..1.5, z -6.6..-3.8, `env.water`, `env.bub`, `env.duck`), test sponges on the rim, sink + mirror, chart; stand at (3, 0, -4.3) facing -x, camera from (-2.5, 4.8, -0.5).
Framing lesson from 013: in a 9:16 frame, a medium of one standing kid needs distance ≥ 9 at lens 26–28; first-pass cameras at 6–8 units were all too tight. Rooms must extend behind the camera (fairGym runs to z 26).

## Growth kit (owner request 2026-11-21) — hook title card, impact hit, thumbnails, story angles
`hook.json` → bold two-line title (+ optional red arrow) over the hook shot (engine/captions.py `title_layer`, `arrow_on`); sfx `impact` = frame-0 boom (may be louder than other cues).
`thumb.json` + `python3 engine/render.py episodes/NNN-slug thumb` → `out/thumbnail.jpg` (engine/thumbnail.py: clean frame, contrast, title top/bottom, arrow, ring, emoji sticker, punch-in zoom).
`tools/pick_mode.py` also rolls an ANGLE (not used in the last 3 notes.md) and doubles down on WINNER rows in `episodes/PERFORMANCE.md`.
`vote.json` (choose-your-path series, owner 2026-11-22) → "PART N / 5" badge top-left all video + red A / green B choice boxes at ~40–55 % height from script line `from`,
with an optional "FOLLOW FOR / PART N+1" title above them (engine/captions.py `badge_layer`, `choice_layer`). Keep that part of the frame calm in the last shot.
Series cast: `episodes/series/fog/cast.js` (YOU, NELL, ABE, BISCUIT) — import it from series parts.

## Episode 014 kit — mountain cable-car town (`engine/sets15.js`)
Sets (all return `{ update(t) }`): `alpineVillage(S)` Kell village street (cobbles along x, free x -18..18 / z -8..8; timber chalets fronts z -14 at x -30/-16/-2 (POST)/12/26, yellow mailbox (4.6,-10.4),
fountain (-24,-3), bench (16,-10.2), lamps, bunting, peaks + cable line with moving cabins). `logCabin(S, { time: 'night'|'morning', bed: 'sol'|'mom' })` open-plan log cabin (walls x ±11, back z -9,
ceiling 10, front wall z 12): bed back-left (x -10.2..-5.6, z -8.8..-2.6, mattress top 1.9; sit on its edge at z -2.0 with root y 0.4), big painted mountain window x -2..4.4, dining table top 2.6 at (3.6,-2.2),
counter (back right), wood stove (9.4,-2.6) `env.stove`, door + coat hooks on the right wall; 'sol' = soccer posters/trophies + blue quilt, 'mom' = photos/lift map + red quilt; `env.blanket`.
`liftStation(S, { icy, stuck })` cable-car base station: open hall x ±18 (floor to z 26, roof y 15 over z -16..12), giant bullwheel (0,10,-8) turning (`env.spin(k)`), cabins circling, outgoing line up the slope
(`env.cableY(z)` = 12 + (-8 - z)·0.24, cabins `env.outs`), console top 2.6 at x 5.5..12.5 z -2..-0.4 (operator at (9,-3.4) facing +z; `env.levers[i].rotation.x`, `env.btn`, `env.radio`), CABIN STATUS board
(`env.board(n)` lights cabin n red), Otto's workbench along the left wall (top 3.0, x -17.6..-15.2, z -2..8, thermos + steaming mugs), drums, spare wheel. `icy` = icicles + frosted cables; `stuck` = swaying cabin of tourists `env.stuck`.
`kellValley(S, { time: 'golden'|'night', focus: 'pitch'|'cabin' })` valley soccer pitch (x ±30, z -22..2, goals x ±30 mouth z -15..-5 `env.goals`), bleachers + blocky crowd `env.update(t, cheer 0..1)`, scoreboard,
village ring, mountains; cable along x at z -10 (`VALLEY.cableY(x)`); CABIN 7 hangs above the field with a full interior (`VALLEY.cab` = { x0 0, x1 12, z0 -15, z1 -5, y 30 }: floor top y 30, glass
y 32.4–37.4, side benches seat top 31.7) — handwritten window on the back glass (`env.write`, readable from inside, mirrored from outside), `env.newLine(k)` reveals a new written line, `env.binos`, `env.radio`,
`env.lantern` (night). `focus: 'cabin'` moves the sun's shadow box to the cabin. Night = stars, moon, lit village windows.
Props: `gondola(S, { num, col, people, s })` (origin = cable grip, body hangs ~8 below; `.userData.body` to sway), `stroller(S, { col })` giant pram (seat top 2.7, solid 'stroller'), `letterStack(S, n)`,
`soccerBall(S, r)`, `fan(S, [x,y,z], { col, seated })` cheap blocky crowd person (`.update(t, cheer)`), `binoMask(S)` binocular vignette glued to the camera (`.update(cam)` after camPath; set `S.userData.dof = false`),
`marker(S, col)`, `mountains(S, { z, n, h, night })`, `pine(S, [x,z], h)`, `chalet(S, [x,z], opts)`.
Shirt style `jerseyN` (avatar.js): soccer jersey with a white V-collar + big number N. Episode helpers (episodes/014-cabinseven): `swapper()` (two avatars, one visible — outfit swap on a poof), `poof()` sparkle ring,
`far(cam)` (camera far plane 900 for big valleys), HEAD/BODY outfit swap presets in common.js. Voice: `PAUSE_GAP=0.45` shortens the silence after [pause] passages (default 0.75).

## Series kit — THE FOG (`engine/sets_fog.js`, first used in episode 015)
Fog: `fogBank(S, { n, area: [x0,x1,z0,z1], y, size, col, opacity, seed })` soft unlit puffs → `.update(t, mask, { k, drift })` with masks `fogFront(x, soft, dir)` (wall rolling along x)
and `fogRing(cx, cz, r, soft)` (clear circle); `fogWisp(S, n, col, size)` small curl (position it, e.g. under a door or around feet); `fogTouch(A, k)` drains a person's colour (pair with face `sleepy`).
Props: `fogPhone(S)` (`.screen('alerts'|'nell1'|'nell2'|'lock', k)`, `.glow`; hold it with `rotation.set(0.5, Math.PI, 0)` so the screen faces the holder; POV camera = head + (0, 0.1, 1.0));
`iceTruck(S)` ABE'S ICE CREAM truck (faces +x, x ±6.5, z ±2.6, `.update(t, { jingle, head })` blinking bulbs).
Sets (all return `{ update(t) }`): `harborStreet(S, { time: 'predawn'|'day', truck: [x,z], siren, pellLit })` · `harborFlat(S, { tv })` (env.tv(mode, k, t), env.door.open(k), env.under(k), landing behind the door) ·
`truckCab(S, { ring })` (two seats facing +z, env.sw switch, env.meter(text, red, k), env.badge, env.spk; `env.update(t, { jingle, r, flicker })`; windshield two-shot: camera (0, 5.3, 9.6) lens 20–22) ·
`hospitalRoof(S)` (env.rise(k) fog sea). Layout details are in the file header. Lessons from 015: the 9:16 frame needs lens ≤ 22 for a two-shot through a windshield; any wall a door opens in needs a real hole;
keep coloured siren lights weak (≤ 55 at 34 range) or the whole street turns red; cameras inside the fog bank white out — keep them inside the clear area.
Part 2 additions (episode 017): `harborFront(S, { truck, flash })` Front Street along the water (road z -4..6, boardwalk z -14..-4, boats, pier x 44..50, DOT'S RECORDS x 26..42 front z -13 with `env.shopDoor.open(k)`,
camera-side houses fronts z 18; `flash` = thirty years ago, everything lit) · `recordShop(S)` inside Dot's, power out (glass shopfront = back wall z -9 looking at `env.truck` (0, 0, -22); counter x 3.6..9.6 top 3.0, Dot at (6.8, 0, -3.8);
bins, jukebox `env.juke(k)`, gramophone table (top 2.4) at (-7.6, 6.6) with `env.gram` under a dust sheet `env.cloth(k)`; `env.update(t, { jingle, ring, inside, music, spin, crank, cam })` — pass `cam` (after camPath) to clear a pocket for cameras outside) ·
`gramophone(S)` wind-up record player (`.update(t, { spin, crank })`, `.bellPos()`, `.knobPos()`) · `musicNotes(S, n)` (`.update(t, origin, k, { up, spread, size })`) · `boat(S, [x, z], opts)` (`.bob(t)`) ·
`fogPhone.screen('chat', k, { time, msgs: [[me, [lines]], …] })` text thread · `truckCab` `env.update(t, { drive })` scrolls the road and streams the fog past.
Lessons from 017: an exterior fog bank needs a clear pocket around the camera too (`fmask` in episodes/017-fog-part2/shots_a.js = ring around the truck ∩ pocket around the camera, updated AFTER camPath — stills render single frames);
a held prop with a tall part (the gramophone horn) must sit below chin height or it covers the face; for the vote end card a low camera (y ≈ 1.8) looking slightly down puts heads above the choice boxes.


## Episode 016 kit — living alarm clocks + clockmaker's town (`engine/sets16.js`)
`alarmClock(S, { name, s, col, bell, glasses, seed })` living twin-bell alarm clock (s 1 ≈ 4.6 tall, feet y 0, faces +Z; tiny 0.16, giant 6–8.5): `.update(t, 'idle'|'run'|'stomp'|'crawl'|'ring'|'knock'|'knit'|'wave'|'cheer'|'squeeze', k)`,
`.time(h, m)`, `.spin(turns)` (extra whirl of the hands), `.face('smile'|'grin'|'o'|'flat'|'frown', brow -1 angry..+1 worried)`, `.look(vec3)`, `.blink(k)`, `.ringK` (ring arcs), `.hand('R'|'L')`, `.legs/.arms` pivots (scale legs 0→1 to "grow legs"),
`.root .g .body .shell`. A rider sits on top at body-local (0, 1.25, 0.1) (`riderSeat()` in episodes/016-snooze/common.js — call `root.updateMatrixWorld(true)` first). Sinking a giant into the ground (`root.y < 0`) works as a crouch.
Props: `phoneBooth(S, [x,z])` (`.open(k)`, glass with crossbars at y 2.1/6.7 so faces stay clear), `testCar(S, { col })` open-top hatchback facing +x (`.drive(dist)`, `.seat(-1 driver | 1 passenger)` world seat, top 1.7), `cone(S, [x,z])` (`.knock(k, dirDeg)`),
`clipboard(S)`, `knitScarf(S, text, { len, col })` (curved knitted scarf with big lettering, `.set(k)`), `tinyGear(S, r, col)`.
Sets (all return `{ update(t) }`): `clockLoft(S, { time })` brick loft inside a clock tower — round mirrored clock window centre (2, 5.8, -8.35) r 3.6 (`env.hands.set(h,m)`), bed left (mattress top 1.9, room for tiny clocks underneath),
nightstand top 2.2 at (-4.3, -6.9), desk + car posters right, rug, string lights, gear mobile, `env.blanket`, `env.sunK(k)`. `clockShop(S, { time: 'morning'|'night' })` Tick & Sons: wall of ticking clocks (`env.update(t, shakeK)` rattles them),
grandfather clocks, counter top 3.0 (z -6.2..-4.6), workbench right, rocking chair seat top 1.7 at (-7.2, -2.0) ry 35 (sit at (-7.35, -2.2), `env.rock(t)`), footstool top 1.0 at (-4.2, -1.0), big left window, spiral stair, pendant lamps.
`tickStreet(S)` brick road along x, Dutch-gable pastel townhouses (fronts z -14), the TICK & SONS clock tower at x 4 (tower clock = `env.hands`, centre (4, 19.6, -14.45); rotate it about y to swing it open), door `env.door.open(k)`,
flower market x -36..-14, teal phone booth `env.booth` at (-47, -10.6), lamps, planters, bunting, pigeons (`env.pigeonsFly(t, k)`). `roofscape(S)` row of flat roofs along x at z 0 (top `ROOF.y` 14) with gabled roofs all round; call `env.follow(x)` (moves the sun's
shadow box) + `env.update(t, x)`. `testLot(S)` DRIVING TEST CENTER: asphalt lot, cone slalom (`env.cones`, first 10 at x -12..15, z 2±0.6), test car `env.car`, wall clock `env.wallClock.set(h,m)`, flags, fence, gate.
Lesson from 016: `body.updateMatrixWorld(true)` does NOT refresh a stale parent — use `root.updateMatrixWorld(true)` before reading child positions (stills jump between frames). Houses ~16–20 tall hide anything behind them from a street-level camera: a giant "over the roofs" needs s ≥ 8 and a camera 45+ units back.

## Episode 018 kit — gingerbread village + the giant hand + the kitchen it sits in (`engine/sets18.js`)
`gingerHouse(S, { name, w, d, h, style: 'pretty'|'plain'|'ugly'|'mayor', col, seed, deck, lit })` gingerbread house (origin = footprint centre, front wall z +d/2, ridge along x at `.ridgeY` = h + 0.42·d):
icing-scallop eaves, gumdrop ridge, candy-glass windows (`.light(k)`), candy canes, swirls, peppermints; `deck: true` = flat roof deck on the ridge (top `.deckY`, x ±3.6, z ±1.9, candy-cane rail, hatch) + chimney at x +5.3 (`.chimney` local top);
`.frost(k)` silver frost + sparkles over the roof (call `.update(t)`), `.scrape(k)` bare patch on the front wall, `.pretty(k)` (ugly style) swaps to a pretty dressing, 'mayor' has a roof sign `.sign` (NOT THIS ONE). `.g` group (lift/rotate it).
`giantHand(S, { skin, sleeve, s })` blocky Roblox hand hanging from a knitted snowflake sleeve that runs 160 up into the sky (`.root` = wrist; `.grip(k)` curls the fingers toward local −z; has its own fill light).
Grip a chimney from behind so cameras in front stay clear: `handAt()` in episodes/018-ninehand/shots_a.js (root at top + (0, 9, −2.8), rotation.y = π). `skyCrack(S, [x,y,z], { w, h })` glowing seam in the night sky (`.open(k, power)`, `.g` — tilt `.g.rotation.x ≈ 0.55` to face the street, `.light` SpotLight).
Sets (all return `{ update(t) }`): `sugarStreet(S, { time: 'day'|'morning'|'dusk'|'night', frost })` Sugarby: chocolate-cobble road along x (z −4..6), houses fronts z −10: BAKERY x −41 (giant cupcake), FUDD (ugly) −20, GUS (pretty + deck) 0 (`GUS_Z` −15, deck top 12.65), MAYOR 20, h40/h60/h80/hm40;
far row z ≈ −45, camera-side row fronts z 26 (keep cameras at z < 24!), candy-cane lamps x ±10/±30 z −6 (`env.lamps`), still moon at night (`env.moon`). `env.houses.{fudd,gus,mayor,h40,h60,…}`.
`gingerParlor(S, { night })` inside Gus's house (walls x ±10, back z −9, ceiling 10, front z 13; workbench back-left top 2.8, fireplace back-right `env.fire`, rocking chair (6.4, 1.5) (solid 'rocking chair'), door on the right wall `env.door.open(k)`, `env.tilt(deg)` tips the whole room, jars slide).
`giantKitchen(S)` the real kitchen at night (walls x ±18, back z −16, deep-blue ceiling 17): table top 3.0 (x ±7.5, z −7..1) with the whole village on a cake board scaled `VILLAGE_S` (0.055; `env.mini`), pendant lamp = the moon (`env.lamp`, globe (0, 11.5, −3), `env.halo`), coffee maker + steam,
plates/forks/milk, `env.eaten` = the Mayor's house on a plate (4.6, 3, −5.6). Stand behind the table at z ≤ −9.4. Lessons: avatar ratio — a scale-1 kid's head is only ~2 above a 3.0 table, so frame the reveal from y ≈ 5.5; a giant head peeking down (`giantHead()` in shots_b.js: avatar with only its head visible) must sit clear of the arm's sleeve line.
