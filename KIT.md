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

## Hair (`engine/hair.js`)
Sculpted, one merged mesh per avatar. Styles (`HAIR_STYLES`): `short` (side-swept fringe) `swoop` (quiff) `spiky` `buzz` `mohawk`
`curly` `afro` `bun` `ponytail` `pigtails` `long` (curtain bangs, falls past shoulders) `bob` `braids` `puffs`, or `null` (bald).
Give every character in an episode a different style + color; vary the narrator's look from previous episodes.
New styles: add a `case` in `hairGeometry()` using `shell({line, thick, flare, edge})`, `lock(points, r)`, `cone`, `ball`, `ring`
(head-local: front +Z, top y=0.61, brows y≈0.28 — keep fringes above y≈0.32 across the face).
Textures: streaky glossy clumps by default; `COILY` styles (afro curly puffs braids) get a coily texture.
Check changes with `python3 tools/hair_lineup.py out.jpg [style …]` (all styles front/back + full-res close-ups).

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

## Look / grade
Set `S.userData.look = 'night'` or `'flash'` (flashback). Post: bloom, split-tone grade, vignette, grain (engine/main.html).

## Faces
Faces are painted into the head's skin texture (cylindrical mapping, seam at the back of the head) — never add face decals/planes.
`A.setFace(name)` swaps the expression instantly.
`engine/faces/*.png` are loaded automatically. Current: smile grin shock sad smirk neutral worried cry teary fakesmile determined softsmile.
