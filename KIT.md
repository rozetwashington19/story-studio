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

## Look / grade
Set `S.userData.look = 'night'` or `'flash'` (flashback). Post: bloom, split-tone grade, vignette, grain (engine/main.html).

## Faces
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
