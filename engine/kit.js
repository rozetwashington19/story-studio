// Shared toolkit for episodes: characters presets, camera/pose helpers, interior sets.
// Episodes import everything from '../../engine/kit.js'.
import * as THREE from 'three';
import { makeAvatar, makeShadow, POSES, lerpPose, addPose, ease, snap, idle, walk, D, shadowMatWall } from './avatar.js';
export * from './avatar.js';
import { T, std, box, dayLight, interiorLight, street, wall, room, repeatMat } from './sets.js';
export * from './sets.js';
export * from './sets2.js';
export * from './sets3.js';
export * from './sets4.js';
export * from './sets5.js';
export * from './sets6.js';
export * from './sets7.js';
export * from './clouds.js';
export * from './outfits.js';
export * from './themes.js';

export const LEO = { skin: 'tan', shirt: 0xc0262b, shirtStyle: 'hoodie', pants: 0x24304f, hair: 'short', hairCol: 0x2a1708 };
export const TEACH = { skin: 'brown', shirt: 0x1d1d22, shirtStyle: 'blazer', pants: 0x1d1d22, pantsStyle: 'plain', hair: 'bun', hairCol: 0x1a0f08 };
export const DAD = { skin: 'light', shirt: 0x3a62a8, shirtStyle: 'shirt', pants: 0x5a4a3c, pantsStyle: 'plain', hair: 'short', hairCol: 0x1a120c };
export const COUS = { skin: 'yellow', shirt: 0x2f8a4e, shirtStyle: 'tee', pants: 0x1c1c1c, hair: 'spiky', hairCol: 0xf07a18 };
export const EX = [
  { skin: 'light', shirt: 0xe6c53a, shirtStyle: 'tee', pants: 0x2b3f8a, hair: 'short', hairCol: 0x7a4a1a },
  { skin: 'brown', shirt: 0x7a3a9a, shirtStyle: 'plain', pants: 0x202020, hair: 'bun', hairCol: 0x120a05 },
  { skin: 'tan', shirt: 0xf2f2f2, shirtStyle: 'shirt', pants: 0x4a4d57, hair: 'short', hairCol: 0x151515 },
  { skin: 'pale', shirt: 0xd9708a, shirtStyle: 'hoodie', pants: 0x3a3028, hair: 'long', hairCol: 0xd9a441 },
  { skin: 'yellow', shirt: 0x3a9ad0, shirtStyle: 'tee', pants: 0x1a1a1a },
];

export const fov = lens => 2 * Math.atan(12 / lens) / D;
const V = (a) => new THREE.Vector3(...a);
export function camPath(cam, p, from, to, lookFrom, lookTo, lensA, lensB = lensA) {
  const e = ease(p);
  cam.position.copy(V(from).lerp(V(to), e));
  cam.fov = fov(lensA + (lensB - lensA) * e); cam.updateProjectionMatrix();
  const tg = V(lookFrom).lerp(V(lookTo), e); cam.lookAt(tg); cam.userData.target = tg;   // target = DOF focus point
}
// keyframed pose track: [[time, poseObj], ...] with ease between
export function track(keys, t, fn = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) return lerpPose(a, b, fn((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}
export function add(S, A, [x, y, z] = [0, 0, 0], ry = 0) { A.root.position.set(x, y, z); A.root.rotation.y = ry * D; S.add(A.root); return A; }
export function wallShadow(S, opts, [x, z], { profile = false, size = 1.12, mat } = {}) {
  const A = makeShadow(mat ? { ...opts, shadowMatOverride: mat } : opts, 'wall');
  A.flat.position.set(x, 0, z); A.flat.scale.x = size; A.flat.scale.y = size; if (profile) A.root.rotation.y = 90 * D;
  S.add(A.flat); return A;
}
export function floorShadow(S, opts, [x, z], dirY = 0, size = 1.0) {
  const A = makeShadow(opts, 'floor'); A.flat.position.x = x; A.flat.position.z = z; A.flat.rotation.y = dirY * D;
  A.flat.scale.x = size; A.flat.scale.z = size; S.add(A.flat); return A;
}

// ---- interiors ----
export function classroom(S, desks = true) {
  room(S, { wallCol: 0xcfdcc4, floorTex: repeatMat(T.tiles(), 6, 5), zBack: -9 });
  interiorLight(S, { col: 0xfff4e0, pos: [1, 8, -3], intensity: 70, hemi: 1.4 });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.8), std({ map: T.chalkboard([['MONDAY', 150, 200], ['Spelling test!', 90, 360]]) }));
  board.position.set(0, 5, -8.7); S.add(board);
  box(S, [9.5, 4.3, 0.2], [0, 5, -8.85], std({ color: 0x8a5a33 }), { r: 0.05, cast: false });
  box(S, [9.6, 0.15, 0.4], [0, 2.85, -8.6], std({ color: 0x8a5a33 }), { r: 0.03 });
  const win = std({ color: 0xcfe8ff, emissive: 0xcfe8ff, emissiveIntensity: 1.2 });
  box(S, [0.1, 3.5, 3.5], [-8.75, 5, -4], win, { r: 0, cast: false });
  box(S, [0.2, 3.9, 0.2], [-8.7, 5, -4], std({ color: 0xffffff }), { r: 0, cast: false });
  const sunIn = new THREE.DirectionalLight(0xfff0d0, 1.4); sunIn.position.set(-12, 9, -2); sunIn.target.position.set(0, 0, -4); S.add(sunIn, sunIn.target);
  // posters
  [[-6, 0xe85a4f], [6, 0x4f8ee8]].forEach(([x, c]) => box(S, [2, 2.6, 0.06], [x, 5.5, -8.95], std({ color: c }), { r: 0, cast: false }));
  if (desks) {
    const wd = std({ map: T.planks(0xb07a48) }), mt = std({ color: 0x555a60, metalness: 0.4, roughness: 0.5 });
    for (const x of [-5, 0, 5]) { box(S, [3.4, 0.2, 2.2], [x, 2.4, 1.2], wd); box(S, [0.25, 2.3, 0.25], [x, 1.15, 1.2], mt); }
  }
}
export function dining(S) {
  room(S, { wallCol: 0xe3b98a, floorTex: repeatMat(T.planks(0x7a4a2a), 3, 3), zBack: -9 });
  interiorLight(S, { col: 0xffd29a, pos: [0, 7.2, -3.5], intensity: 36, hemi: 1.0, hemiSky: 0xffe6c8 });
  const wd = std({ map: T.planks(0x6b3d1f) });
  box(S, [6.5, 0.25, 3.4], [0, 2.6, -2.8], wd);
  box(S, [6.7, 0.06, 3.5], [0, 2.75, -2.8], std({ color: 0xf2eee4 }), { r: 0.02 });
  for (const [x, z] of [[-3, -1.3], [3, -1.3], [-3, -4.3], [3, -4.3]]) box(S, [0.3, 2.5, 0.3], [x, 1.25, z], wd);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.8, 0.1, 40), std({ color: 0xfafafa, roughness: 0.25 }));
  plate.position.set(0.3, 2.83, -2.6); plate.receiveShadow = plate.castShadow = true; S.add(plate);
  box(S, [1.1, 0.55, 0.65], [0.3, 3.15, -2.6], std({ color: 0x5a2a12, roughness: 0.7 }), { r: 0.18 });
  box(S, [0.9, 0.06, 0.9], [-2, 2.8, -2.2], std({ color: 0xe86a6a }), { r: 0.02 });
  box(S, [0.5, 0.8, 0.5], [2.2, 3.2, -3.2], std({ color: 0xbfe4ff, transparent: true, opacity: 0.6, roughness: 0.1 }), { r: 0.08 });
  box(S, [2.6, 1.9, 0.1], [-4, 5.6, -8.85], std({ color: 0x6aa0b8 }), { r: 0.02, cast: false });
  box(S, [2.9, 2.2, 0.08], [-4, 5.6, -8.9], std({ color: 0xf0e8d8 }), { r: 0.02, cast: false });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.8, 32, 1, true), std({ color: 0xffe0a8, emissive: 0xffc070, emissiveIntensity: 0.8, side: THREE.DoubleSide }));
  shade.position.set(0, 7.6, -3.5); S.add(shade);
}
export function bedroom(S) {
  S.userData.look = 'night';
  room(S, { wallCol: 0x7a88c0, floorTex: repeatMat(T.planks(0x6b4a30), 3, 3), zBack: -9, trim: 0xd8d8e8 });
  S.background = new THREE.Color(0x05060c);
  S.add(new THREE.HemisphereLight(0x6078c0, 0x181820, 0.9));
  const moon = new THREE.DirectionalLight(0x8aa8ff, 2.0); moon.position.set(-6, 10, 6); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); S.add(moon);
  const spot = new THREE.SpotLight(0xa8c0ff, 260, 0, 0.45, 0.7, 1.6); spot.position.set(-1, 7, 5); spot.target.position.set(1.8, 3.6, -9); S.add(spot, spot.target);
  const lamp = new THREE.PointLight(0xffb070, 10, 12, 2); lamp.position.set(-7, 3.2, -7.5); S.add(lamp);
  box(S, [3, 3, 0.1], [-3.5, 5.5, -8.85], std({ color: 0x3d5aa8, emissive: 0x2a3f80, emissiveIntensity: 1.3 }), { r: 0, cast: false });
  box(S, [3.4, 3.4, 0.08], [-3.5, 5.5, -8.9], std({ color: 0xe8e8f0 }), { r: 0, cast: false });
  box(S, [0.12, 3.0, 0.12], [-3.5, 5.5, -8.78], std({ color: 0xe8e8f0 }), { r: 0, cast: false });
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); m.position.set(-2.6, 6.2, -8.75); S.add(m);
  box(S, [2.8, 6.6, 0.2], [4.5, 3.3, -8.8], std({ map: T.planks(0x8a5a30) }), { r: 0.04, cast: false });
  box(S, [0.25, 0.25, 0.25], [3.4, 3.2, -8.6], std({ color: 0xe0b840, metalness: 1, roughness: 0.3 }), { r: 0.08 });
  const bed = std({ map: T.planks(0x5a3a22) });
  box(S, [4, 1.4, 7], [-3.5, 0.7, -3.6], bed);
  box(S, [4.4, 3.4, 0.4], [-3.5, 1.7, -7.2], bed);
  box(S, [3.8, 0.6, 6.8], [-3.5, 1.6, -3.6], std({ color: 0xeef0f8 }), { r: 0.15 });
  box(S, [2.6, 0.5, 1.2], [-3.5, 2.15, -6.2], std({ color: 0xf8f8ff }), { r: 0.22 });
  box(S, [1.6, 2.0, 1.4], [-7, 1.0, -7.4], std({ map: T.planks(0x7a5a3a) }));
}


// ---- generic helpers (from episode 001) ----
// split a shot into internal cuts: returns [segmentIndex, localProgress]
export function seg(t, dur, cuts) {
  const b = [0, ...cuts.map(c => c * dur), dur];
  for (let i = 0; i < b.length - 1; i++) if (t < b[i + 1] || i === b.length - 2) return [i, (t - b[i]) / (b[i + 1] - b[i])];
}
export const sitGround = (A) => { A.root.position.y = -1.5; };
// Sit on a seat whose TOP surface is at seatTopY: thighs rest on it, torso bottom at seatTopY + 0.5.
// The seat must extend at least 2 units in front of the character (legs stick forward 2 units).
export const sitOn = (A, seatTopY) => { A.root.position.y = seatTopY - 1.5; };
// Minimum centre-to-centre spacing between two avatars so they never clip:
export const SPACING = { sideBySide: 4.3, armsOut: 6.5, facing: 2.6, facingArmsForward: 4.6 };
export const SIT = { rLeg: 90, lLeg: 90 };
export const HUDDLE = { rLeg: 80, lLeg: 80, rFwd: 55, lFwd: 55, nod: 35, lean: 10 };
export const HUG = { rFwd: 85, lFwd: 85, rUp: -22, lUp: -22, nod: 12 };
export function sob(t, k = 1) { return { bob: Math.abs(Math.sin(t * 9)) * 0.06 * k, nod: Math.sin(t * 9) * 4 * k, tilt: Math.sin(t * 4.5) * 3 * k }; }

// ---- set variants ----
export function kidRoomDay(S) {
  room(S, { wallCol: 0x9fc2e6, floorTex: repeatMat(T.planks(0x9a6a40), 3, 3), zBack: -9 });
  S.add(new THREE.HemisphereLight(0xfff4e6, 0x6a5040, 1.0));
  const sun = new THREE.DirectionalLight(0xffdcae, 2.4); sun.position.set(-8, 9, 4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); S.add(sun);
  box(S, [3, 3, 0.1], [-3.5, 5.5, -8.85], std({ color: 0xcfe8ff, emissive: 0xbfe0ff, emissiveIntensity: 1.2 }), { r: 0, cast: false });
  box(S, [3.4, 3.4, 0.08], [-3.5, 5.5, -8.9], std({ color: 0xf6f6f6 }), { r: 0, cast: false });
  const bed = std({ map: T.planks(0x5a3a22) });
  box(S, [4, 1.4, 7], [-5, 0.7, -4.6], bed); box(S, [3.8, 0.6, 6.8], [-5, 1.6, -4.6], std({ color: 0x3f6fb8 }), { r: 0.15 });
  box(S, [2.6, 0.5, 1.2], [-5, 2.15, -7.4], std({ color: 0xf8f8ff }), { r: 0.22 });
  box(S, [3.2, 6.8, 0.25], [4.5, 3.4, -8.85], std({ map: T.planks(0xc8a070) }), { r: 0.04, cast: false });
  box(S, [0.25, 0.25, 0.25], [3.3, 3.4, -8.65], std({ color: 0xe0b840, metalness: 1 }), { r: 0.08 });
  box(S, [3.4, 0.2, 1.8], [1, 2.5, -7.8], std({ map: T.planks(0xb07a48) })); box(S, [0.25, 2.4, 1.6], [-0.5, 1.2, -7.8], std({ color: 0x6a4a30 })); box(S, [0.25, 2.4, 1.6], [2.5, 1.2, -7.8], std({ color: 0x6a4a30 }));
  box(S, [1.6, 0.15, 1.1], [1, 2.68, -7.8], std({ color: 0xfafafa }), { r: 0.02 });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.6), std({ color: 0xf2a33a })); poster.position.set(1, 6, -8.78); S.add(poster);
}
export function kitchen(S) {
  dining(S);
  box(S, [2.6, 7.2, 2.2], [6.2, 3.6, -7.6], std({ color: 0xf2f4f6, roughness: 0.35 }), { r: 0.15 });
  box(S, [0.15, 1.6, 0.2], [5.2, 4.8, -6.45], std({ color: 0x9aa0a8, metalness: 0.7 }), { r: 0.05 });
  box(S, [0.15, 1.2, 0.2], [5.2, 2.2, -6.45], std({ color: 0x9aa0a8, metalness: 0.7 }), { r: 0.05 });
  box(S, [2.4, 0.06, 0.1], [6.2, 3.2, -6.45], std({ color: 0xd0d4d8 }), { r: 0 });
}
export function cookieJar(S, pos) {
  const g = new THREE.Group();
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 32), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.5, roughness: 0.05 })); jar.position.y = 0.45; g.add(jar);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 32), std({ color: 0xc23a30 })); lid.position.y = 0.95; g.add(lid);
  const crumb = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16), std({ color: 0x9a6a3a })); crumb.position.y = 0.05; g.add(crumb);
  g.position.set(...pos); S.add(g); return g;
}
export function crumbs(A) { const m = std({ color: 0x8a5a2a }); [[0.25, -0.25], [-0.1, -0.35], [0.05, -0.18], [-0.3, -0.28]].forEach(([x, y]) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.05), m); c.position.set(x, y, 0.64); A.headMesh.add(c); }); }

export const L = (look) => (S) => { S.userData.look = look; };


// ---- animation quality helpers (added with the 1-minute format) ----
// overshoot-and-settle easing: pose hits feel snappy and alive instead of linear
export const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
// keyframes with overshoot: hit([[0, POSES.rest], [0.4, POSES.wave]], t)
export const hit = (keys, t) => track(keys, t, backOut);
// talking: layered head motion for whoever is speaking during their dialogue line (add to their pose)
export function talk(t, k = 1) { return { nod: (Math.sin(t * 9) * 2.5 + Math.sin(t * 14.3) * 1.5) * k, tilt: Math.sin(t * 4.1) * 2.5 * k, turn: Math.sin(t * 2.3) * 3 * k, bob: Math.abs(Math.sin(t * 9)) * 0.02 * k }; }
// eyelines: head turn/nod so avatar A looks at world point p (returns {turn, nod}; add to the pose)
export function lookAt(A, p) {
  A.root.updateMatrixWorld(true); const l = A.root.worldToLocal(new THREE.Vector3(...(Array.isArray(p) ? p : [p.x, p.y, p.z])));
  const dx = l.x, dy = l.y - 4.64, dz = l.z, cl = (v, m) => Math.max(-m, Math.min(m, v));
  return { turn: cl(Math.atan2(dx, dz) / D, 70), nod: cl(-Math.atan2(dy, Math.hypot(dx, dz)) / D, 40) };
}
// anticipation: a small opposite dip right before an action at time t0 (add to the pose), e.g. before a jump or a throw
export function anticipate(t, t0, k = 1) { const u = (t - (t0 - 0.25)) / 0.25; if (u < 0 || u > 1) return {}; const s = Math.sin(u * Math.PI); return { bob: -0.12 * s * k, lean: 6 * s * k, nod: 4 * s * k }; }

// ---- hook (owner request 2026-11-18): open every episode with a 1–2 s flash-forward of the climax ----
// SHOTS = [hook(SHOTS_B[9], { at: 1.2, len: 3.5 }), ...SHOTS_A, ...SHOTS_B]  — reuses the climax shot's builder for script line 1,
// playing it from `at` s of an assumed `len`-s shot (pick the most dramatic moment). Put a 'rewind' sfx at the end of line 1.
export const hook = (shotFn, { at = 0.8, len = 3.0, speed = 1 } = {}) => (S, cam) => { const u = shotFn(S, cam); S.userData.hook = true; return (t, dur) => u(at + t * speed, len); };
