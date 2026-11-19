// Episode 009 (Copycat Snow) shared cast + helpers
// Nora, 10 (narrator): red puffer jacket, pink earmuffs, mustard scarf, teal mittens, white boots, black pigtails
export const NORA = { skin: 'brown', shirt: 0xd8302a, shirtStyle: 'jacket', pants: 0x2a2a4a, hair: 'pigtails', hairCol: 0x120a06, rosy: true,
  outfit: [['earmuffs', { col: 0xff7ac8 }], ['scarf', { col: 0xf2b02a }], ['gloves', { col: 0x2ab8b0 }], ['boots', { col: 0xf2f2f6 }]] };
// Otis, 10 (rival): green bobble beanie, round glasses, navy sweater, striped scarf
export const OTIS = { skin: 'light', shirt: 0x2a3a6a, shirtStyle: 'sweater', pants: 0x6a5a4a, hair: 'curly', hairCol: 0xd8682a, freckles: true,
  outfit: [['beanie', { col: 0x3aa85a }], 'glasses', ['scarf', { col: 0xf2f2f2 }], ['boots', { col: 0x5a3a22 }]] };
// Dad: red plaid flannel, crew cut + stubble
export const DAD9 = { skin: 'tan', shirt: 0xb8302a, shirtStyle: 'plaid', pants: 0x3a4a6a, hair: 'crew', hairCol: 0x2a1a10, beard: 'stubble', outfit: [['boots', { col: 0x6a4428 }]] };
// Grandma Bea: lavender sweater, white bun, glasses, wrinkles
export const BEA = { skin: 'pale', shirt: 0xb89ae0, shirtStyle: 'sweater', pants: 0x4a3a5a, pantsStyle: 'plain', hair: 'bun', hairCol: 0xf2f2f2, wrinkles: true,
  outfit: ['glasses', ['scarf', { col: 0xff6ad0 }], ['boots', { col: 0x7a4a5a }]] };
// Mr. Plum, the mailman: navy uniform, mail cap, satchel, gray mustache
export const PLUM = { skin: 'brown', shirt: 0x2a3a7a, shirtStyle: 'uniform', pants: 0x2a3a7a, pantsStyle: 'plain', hair: 'receding', hairCol: 0x8a8a8a, beard: 'mustache', beardCol: 0x9a9a9a,
  outfit: [['cap', { col: 0x2a3a7a }], ['satchel', { col: 0x8a5a2a }], ['boots', { col: 0x1a1a1a }]] };
// Mayor Fern (judge, no lines): top hat, green coat
export const FERN = { skin: 'yellow', shirt: 0x2a6a4a, shirtStyle: 'blazer', pants: 0x2a2a2a, pantsStyle: 'plain', hair: 'bob', hairCol: 0x1a1008, hat: true, hatCol: 0x1a1a1a, outfit: [['bowtie', { col: 0xd83a3a }]] };
export const TOWN = [
  { skin: 'light', shirt: 0x3a8ae8, shirtStyle: 'jacket', pants: 0x2a2a3a, hair: 'short', hairCol: 0x6a4a2a, outfit: [['beanie', { col: 0xffd23a }], ['scarf', { col: 0xe83a3a }]] },
  { skin: 'tan', shirt: 0xff8a3a, shirtStyle: 'sweater', pants: 0x3a3a5a, hair: 'ponytail', hairCol: 0x2a1a10, outfit: [['earmuffs', { col: 0x5aaaff }]] },
  { skin: 'yellow', shirt: 0x8a3ad8, shirtStyle: 'jacket', pants: 0x2a2a2a, hair: 'spiky', hairCol: 0x0a0a0a, outfit: [['scarf', { col: 0x5ac85a }]] },
  { skin: 'brown', shirt: 0x5ac8a0, shirtStyle: 'hoodie', pants: 0x4a3a2a, hair: 'afro', hairCol: 0x1a1008 },
  { skin: 'pale', shirt: 0xe8e0d0, shirtStyle: 'sweater', pants: 0x5a3a2a, hair: 'slick', hairCol: 0xc8a050, beard: 'full', beardCol: 0xc8a050, outfit: [['beanie', { col: 0xc83a3a }]] },
];
export const CAST = { Nora: NORA, Otis: OTIS, Dad: DAD9, 'Grandma Bea': BEA, 'Mr. Plum': PLUM, 'Mayor Fern': FERN, 'Town 1': TOWN[0], 'Town 2': TOWN[1] };

import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky } from '../../engine/kit.js';


export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const sm = (t, a, b) => { const x = ramp(t, a, b); return x * x * (3 - 2 * x); };
export const V = (a) => new THREE.Vector3(...a);
// close-up from the direction a character FACES (ry deg). h = head centre.
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffd8b0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };
export const allowGround = (S, ...names) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...names.flatMap(n => [[n, 'ground'], [n, 'road'], [n, 'floor']])]; };
export const RUN = (t, k = 1) => { const w = { rLeg: Math.sin(t * 15) * 55, lLeg: -Math.sin(t * 15) * 55, rFwd: -Math.sin(t * 15) * 60, lFwd: Math.sin(t * 15) * 60, bob: Math.abs(Math.cos(t * 15)) * 0.25, lean: 14 };
  for (const k2 in w) w[k2] *= k; return w; };
// skating: a long glide stride with arms swinging wide
export const SKATE = (t, k = 1) => { const s = Math.sin(t * 4); return { rLegOut: Math.max(0, s) * 22 * k, lLegOut: Math.max(0, -s) * 22 * k, rUp: 30 + s * 20 * k, lUp: 30 - s * 20 * k, rFwd: -s * 25 * k, lFwd: s * 25 * k, lean: 10 * k, bodyTilt: s * 4 * k, bob: Math.abs(s) * 0.08 }; };
// dancing bounce
export const DANCE = (t, k = 1, ph = 0) => { const s = Math.sin(t * 7 + ph), c = Math.cos(t * 3.5 + ph); return { bob: Math.abs(s) * 0.22 * k, rUp: 60 + c * 70 * k, lUp: 60 - c * 70 * k, bodyTilt: c * 6 * k, turn: c * 14 * k, rLeg: Math.max(0, s) * 18 * k, tilt: -c * 6 * k }; };
// hold a prop in the right (or left) hand
export const hold = (g, A, side = 'R', off = [0, -0.3, 0.2]) => { const p = pinky(A, side); g.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); };
// phone held up to the face (pose) — put the phone with hold(ph, A, 'R', [0, 0.2, 0.3])
export const PHONE_UP = { rFwd: 110, rUp: -12, nod: 12 };
// numeric keyframes with overshoot (hit() is for pose objects): hn([[t0, 0], [t1, 1]], t)
const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
export function hn(keys, t, fn = backOut) { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return a + (b - a) * fn((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1]; }

// ---------------- episode 009 helpers ----------------
import { snowman } from '../../engine/kit.js';
export const GSIZE = 4.5;
// Nora's giant: matching mustard scarf + pink earmuffs
export const giant = (S, size = GSIZE) => snowman(S, { name: 'giant', size, scarf: 0xf2b02a, earmuffs: 0xff7ac8, seed: 9 });
export const dadSM = (S, s = 0.95) => snowman(S, { name: 'dadsm', size: s, scarf: 0xb8302a, hat: 'cap', hatCol: 0xb8302a, seed: 2 });
export const beaSM = (S, s = 0.95) => snowman(S, { name: 'beasm', size: s, scarf: 0xff6ad0, crooked: true, glasses: true, seed: 3 });
export const plumSM = (S, s = 0.9) => snowman(S, { name: 'plumsm', size: s, hat: 'cap', hatCol: 0x2a3a7a, bag: 0x8a5a2a, seed: 4 });
// head centre of a snowman (world)
export const smHead = (m) => { m.root.updateMatrixWorld(true); return m.head.localToWorld(new THREE.Vector3(0, 0.55, 0)); };
// stomp curve: lift then slam at t0 (returns { hop, squash }) — hop in snowman-local units
export function stompK(t, t0, up = 0.9, dur = 0.42) { const u = (t - (t0 - dur)) / dur; if (u < 0) return { hop: 0, squash: 0 };
  if (u < 1) return { hop: Math.sin(u * Math.PI / 2) * up * (1 - u * u), squash: -0.08 * Math.sin(u * Math.PI) };
  const v = t - t0; return { hop: 0, squash: v < 0.35 ? 0.22 * Math.sin(v / 0.35 * Math.PI) * (1 - v / 0.35) : 0 }; }
// camera shake after an impact at t0
export function shake(cam, t, t0, k = 0.5, len = 0.6) { const v = t - t0; if (v < 0 || v > len) return; const a = k * (1 - v / len);
  cam.position.x += Math.sin(v * 70) * a; cam.position.y += Math.sin(v * 53 + 1) * a * 0.8; }
// avatar stomp (leg lift then slam at t0)
export function kidStomp(t, t0, side = 'r') { const u = t - (t0 - 0.3); if (u < 0) return {}; const k = u < 0.3 ? Math.sin(u / 0.3 * Math.PI / 2) : Math.max(0, 1 - (u - 0.3) / 0.08);
  const o = { bob: u > 0.3 && u < 0.5 ? -0.08 : 0, lean: 6 * k, nod: 8 * k }; o[side + 'Leg'] = 70 * k; return o; }
// lie on the back (feet toward +z), k = 0 standing .. 1 lying; ground y = 0
export function fallBack(A, x, zFeet, k) { const th = -Math.PI / 2 * k; A.root.rotation.set(th, A.root.rotation.y, 0); A.root.position.set(x, 0.5 * Math.sin(-th), zFeet); }
// snow-angel sweep (arms + legs) for someone lying
export const ANGEL = (t, k = 1) => { const s = (Math.sin(t * 3.2) + 1) / 2; return { rUp: (25 + s * 120) * k, lUp: (25 + s * 120) * k, rLegOut: s * 28 * k, lLegOut: s * 28 * k }; };
export const CROSS = { rFwd: 70, lFwd: 70, rUp: -38, lUp: -38 };   // arms crossed
export const FISTS = { rUp: 18, lUp: 18, rFwd: 10, lFwd: 10 };
