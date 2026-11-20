// Episode 010 (Petals) shared cast + helpers
// Ada, 11 (narrator): mustard-yellow raincoat-style jacket (pops against the pink petals), teal pants, high black ponytail, freckles,
// red crayon satchel (she draws), white sneakers
export const ADA = { skin: 'tan', shirt: 0xf2b42a, shirtStyle: 'jacket', pants: 0x2a6a7a, hair: 'ponytail', hairCol: 0x1a0e08, freckles: true, rosy: true,
  outfit: [['satchel', { col: 0xd8302a }], ['boots', { col: 0xf4f4f4 }]] };
// Grandpa Walt: olive cardigan, white balding hair + short white beard, round glasses, wrinkles, brown slippers
export const WALT = { skin: 'pale', shirt: 0x7a8a4a, shirtStyle: 'sweater', pants: 0x5a4a3a, pantsStyle: 'plain', hair: 'balding', hairCol: 0xf2f2f2, beard: 'full', beardCol: 0xf0f0f0, wrinkles: true,
  outfit: ['glasses', ['boots', { col: 0x7a4a2a }]] };
// Dad: blue hoodie, buzz cut, goatee
export const DAD10 = { skin: 'brown', shirt: 0x3a5ab8, shirtStyle: 'hoodie', pants: 0x4a4a52, hair: 'buzz', hairCol: 0x120a06, beard: 'goatee', beardCol: 0x120a06 };
// Mom: plum blazer, low bun
export const MOM10 = { skin: 'tan', shirt: 0x7a3a6a, shirtStyle: 'blazer', pants: 0x2a2a34, pantsStyle: 'plain', hair: 'lowbun', hairCol: 0x2a160c, outfit: [['glasses', { col: 0x2a2a2a }]] };
// Mister Bell, crossing guard: orange safety vest over white shirt, orange cap, white gloves, gray mustache
export const BELL = { skin: 'brown', shirt: 0xf2f2ee, shirtStyle: 'shirt', pants: 0x2a3a5a, pantsStyle: 'plain', hair: 'crew', hairCol: 0x8a8a8a, beard: 'mustache', beardCol: 0x9a9a9a, wrinkles: true,
  outfit: [['vest', { col: 0xff7a1a }], ['cap', { col: 0xff7a1a }], ['gloves', { col: 0xffffff }], ['boots', { col: 0x1a1a1a }]] };
// Miss Dale, teacher on summer break: teal hawaiian shirt, sunglasses pushed up, auburn bob, white shorts-ish pants
export const DALE = { skin: 'yellow', shirt: 0x2ab0b0, shirtStyle: 'hawaiian', pants: 0xf2eee0, pantsStyle: 'plain', hair: 'bob', hairCol: 0x8a3a1a,
  outfit: [['sunglasses', { up: true }]] };
// townsfolk (no lines)
export const TOWN = [
  { skin: 'light', shirt: 0x5ac85a, shirtStyle: 'tee', pants: 0x3a3a5a, hair: 'pigtails', hairCol: 0xe8c860, freckles: true, outfit: [['backpack', { col: 0x8a5ad8 }]] },
  { skin: 'brown', shirt: 0xe8584a, shirtStyle: 'uniform', pants: 0x3a3a3a, pantsStyle: 'plain', hair: 'afro', hairCol: 0x1a1008, outfit: [['apron', { col: 0xf6f2ea }]] },
  { skin: 'yellow', shirt: 0x3a8ae8, shirtStyle: 'hoodie', pants: 0x2a2a2a, hair: 'spiky', hairCol: 0x0a0a0a, outfit: [['backpack', { col: 0xf2c420 }]] },
];
export const CAST = { Ada: ADA, 'Grandpa Walt': WALT, Dad: DAD10, Mom: MOM10, 'Mister Bell': BELL, 'Miss Dale': DALE, 'Kid': TOWN[0], 'Baker': TOWN[1] };

import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, petals } from '../../engine/kit.js';

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const ada = (S, face, pos, ry = 0) => mk(S, ADA, 'ada', face, pos, ry);
export const walt = (S, face, pos, ry = 0) => mk(S, WALT, 'walt', face, pos, ry);
export const dad = (S, face, pos, ry = 0) => mk(S, DAD10, 'dad', face, pos, ry);
export const mom = (S, face, pos, ry = 0) => mk(S, MOM10, 'mom', face, pos, ry);
export const bell = (S, face, pos, ry = 0) => mk(S, BELL, 'bell', face, pos, ry);
export const dale = (S, face, pos, ry = 0) => mk(S, DALE, 'dale', face, pos, ry);
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const sm = (t, a, b) => { const x = ramp(t, a, b); return x * x * (3 - 2 * x); };
export const V = (a) => new THREE.Vector3(...a);
export const headOf = (A) => { A.root.updateMatrixWorld(true); return A.headMesh.getWorldPosition(new THREE.Vector3()); };
// close-up from the direction a character FACES (ry deg). h = head centre.
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffd8b0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };
export const allowGround = (S, ...names) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...names.flatMap(n => [[n, 'ground'], [n, 'path'], [n, 'floor']])]; };
export const allow = (S, ...pairs) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...pairs]; };
export const hold = (g, A, side = 'R', off = [0, -0.3, 0.2]) => { const p = pinky(A, side); g.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); };
const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
export function hn(keys, t, fn = backOut) { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return a + (b - a) * fn((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1]; }
export const RUN = (t, k = 1) => { const w = { rLeg: Math.sin(t * 15) * 55, lLeg: -Math.sin(t * 15) * 55, rFwd: -Math.sin(t * 15) * 60, lFwd: Math.sin(t * 15) * 60, bob: Math.abs(Math.cos(t * 15)) * 0.25, lean: 14 };
  for (const k2 in w) w[k2] *= k; return w; };
// a column of petals that follows someone's head: sh(t, k, opts) — floor = ground under them
export function shower(S, A, { n = 120, size = 0.3, seed = 3, r = 1.5, top = 3.4, floor = 0, speed = 1, wind = [0, 0] } = {}) {
  const P = petals(S, { n, size, seed });
  return (t, k = 1, o = {}) => { const h = headOf(A); P(t, h, { k, r, top, floor, speed, wind, ...o }); };
}
// pink petal burst colour for snowBurst
export const PINK = 0xff9ec4;
export const SIT_CHAIR = { rLeg: 90, lLeg: 90 };
