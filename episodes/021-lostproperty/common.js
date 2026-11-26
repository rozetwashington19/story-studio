// Episode 021 (Lost Property) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky } from '../../engine/kit.js';

// Mara, 31 (narrator): lost-property clerk — teal uniform, brass badge, red tie, auburn low bun, satchel of tags.
export const MARA = { skin: 'tan', shirt: 0x1c8a84, shirtStyle: 'uniform', pants: 0x2a2a36, pantsStyle: 'plain', hair: 'lowbun', hairCol: 0x8a3a1a,
  outfit: [['badge', { col: 0xf2c420 }], ['tie', { col: 0xc8302a }], ['satchel', { col: 0x8a5a2a }], ['boots', { col: 0x4a2a1a }]] };
// Cal, 34 (her brother, drives the Night Train): navy jacket, driver's cap, red scarf, work gloves, stubble.
export const CAL = { skin: 'tan', shirt: 0x1c2a52, shirtStyle: 'jacket', pants: 0x23232e, pantsStyle: 'plain', hair: 'buzz', hairCol: 0x2a1a12, beard: 'stubble',
  outfit: [['cap', { col: 0x16203e }], ['scarf', { col: 0xc8302a }], ['gloves', { col: 0x9a7a4a }], ['boots', { col: 0x1a1a1e }]] };
// Pip, 19 (porter): pale, freckles, big straw-blond swoop, red uniform, gold vest, white gloves.
export const PIP = { skin: 'pale', shirt: 0xc8302a, shirtStyle: 'uniform', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'swoop', hairCol: 0xe8c050, freckles: true,
  outfit: [['vest', { col: 0xd8a83a }], ['gloves', { col: 0xf6f2ea }], ['boots', { col: 0x1a1a1e }]] };
// Mr. Abel, 60s (lost his keys, then his temper): balding, grey walrus mustache, green plaid, yellow bow tie.
export const ABEL = { skin: 'light', shirt: 0x4a7a3a, shirtStyle: 'plaid', pants: 0x5a4030, pantsStyle: 'plain', hair: 'balding', hairCol: 0xb0b0b6, beard: 'walrus', beardCol: 0xb8b8be, wrinkles: true,
  outfit: [['bowtie', { col: 0xf2c420 }], ['boots', { col: 0x3a2418 }]] };
// The mayor (lost her train of thought): brown skin, silver bun, glasses, purple blazer, gold sash.
export const MAYOR = { skin: 'brown', shirt: 0x6a3aa8, shirtStyle: 'blazer', pants: 0xe8e0d0, pantsStyle: 'plain', hair: 'bun', hairCol: 0xd8dce4, wrinkles: true,
  outfit: ['glasses', ['sash', { col: 0xf2c420 }], ['boots', { col: 0x2a1a3a }]] };
// a kid collecting her teddy (no lines)
export const KID = { skin: 'yellow', shirt: 0xff8ab0, shirtStyle: 'tee', pants: 0x3a6ab8, pantsStyle: 'jeans', hair: 'pigtails', hairCol: 0x1a1210, rosy: true, outfit: [['overalls', { col: 0x3a6ab8 }], ['boots', { col: 0xf2c420 }]] };
export const CAST = { Mara: MARA, Cal: CAL, Pip: PIP, 'Mr. Abel': ABEL, Mayor: MAYOR, Kid: KID };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const mara = (S, face, pos, ry = 0) => mk(S, MARA, 'mara', face, pos, ry, 1.0);
export const cal = (S, face, pos, ry = 0) => mk(S, CAL, 'cal', face, pos, ry, 1.05);
export const pip = (S, face, pos, ry = 0) => mk(S, PIP, 'pip', face, pos, ry, 0.97);
export const abel = (S, face, pos, ry = 0) => mk(S, ABEL, 'abel', face, pos, ry, 1.0);
export const mayor = (S, face, pos, ry = 0) => mk(S, MAYOR, 'mayor', face, pos, ry, 0.96);
export const kid = (S, face, pos, ry = 0) => mk(S, KID, 'kid', face, pos, ry, 0.72);

export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const sm = (t, a, b) => { const x = ramp(t, a, b); return x * x * (3 - 2 * x); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const V = (a) => new THREE.Vector3(...a);
export const headOf = (A) => { A.root.updateMatrixWorld(true); return A.headMesh.getWorldPosition(new THREE.Vector3()); };
// close-up from the front / 3-4 of a character standing at h (head position) facing ry
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffe0c0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };
export const allow = (S, ...pairs) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...pairs]; };
// put a prop in a hand
export const hold = (g, A, side = 'R', off = [0, -0.3, 0.2]) => { const p = pinky(A, side); g.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); return p; };
// midpoint between both hands (two-handed props)
export const hands = (A) => { const a = pinky(A, 'R'), b = pinky(A, 'L'); return a.add(b).multiplyScalar(0.5); };
const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
// numeric keyframes with overshoot (hit() only works on pose objects)
export function hn(keys, t, fn = backOut) { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return a + (b - a) * fn((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1]; }
export const shake = (cam, t, t0, k = 1) => { const u = t - t0; if (u < 0 || u > 0.7) return; const a = Math.exp(-u * 6) * 0.25 * k; cam.position.x += Math.sin(u * 60) * a; cam.position.y += Math.sin(u * 47 + 1) * a; };
export const rumble = (cam, t, k = 1) => { cam.position.x += Math.sin(t * 31) * 0.05 * k; cam.position.y += Math.sin(t * 27 + 1) * 0.05 * k; };
export const arc = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * h, lerp(a[2], b[2], u)];
