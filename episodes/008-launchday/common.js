// Episode 008 (Launch Day) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky } from '../../engine/kit.js';

// Rico, 11 (narrator): pastel-teal hawaiian shirt, white pants, white sneakers, swoop hair
export const RICO = { skin: 'tan', shirt: 0x4fd0c0, shirtStyle: 'hawaiian', pants: 0xf2eee4, pantsStyle: 'plain', hair: 'swoop', hairCol: 0x2a170c, rosy: true,
  outfit: [['boots', { col: 0xf6f6f2 }]] };
// Lulu, 16: Pixel Palace staff polo (purple, PP logo), hot-pink cap, name badge, high ponytail
export const LULU = { skin: 'brown', shirt: 0x7a3ad8, shirtStyle: 'polo', pants: 0x26263e, hair: 'ponytail', hairCol: 0x120a06,
  outfit: [['cap', { col: 0xff3ab8 }], ['badge', { col: 0xffe23a }], ['boots', { col: 0x2ae8ff }]] };
// Grandpa Sal: faded flamingo "Day One" shirt, white mustache, roller skates, kneepads + wristband
export const SAL = { skin: 'light', shirt: 0xe8cfc0, shirtStyle: 'flamingo', pants: 0xd8c8a0, pantsStyle: 'plain', hair: 'balding', hairCol: 0xf2f2ee, beard: 'mustache', wrinkles: true,
  outfit: [['skates', { col: 0xf6f0e8, wheel: 0xff4ab8 }], ['kneepads', { col: 0x2ab8b0 }], ['wristband', { col: 0xff4ab8 }]] };
export const SAL_SHOES = { ...SAL, outfit: [['kneepads', { col: 0x2ab8b0 }], ['wristband', { col: 0xff4ab8 }], ['boots', { col: 0xf6f0e8 }]] };
// Dani, 11 (best friend): neon-orange windbreaker, big headphones, puffs
export const DANI = { skin: 'yellow', shirt: 0xff7a2a, shirtStyle: 'jacket', pants: 0x3a2a7a, hair: 'puffs', hairCol: 0x1a1008, freckles: true, outfit: ['headphones', ['boots', { col: 0xb05aff }]] };
// side characters
export const SIGNKID = { skin: 'pale', shirt: 0xffd23a, shirtStyle: 'tee', pants: 0x2a4a8a, hair: 'spiky', hairCol: 0xe8c060, freckles: true };
export const CROWD = [
  { skin: 'brown', shirt: 0xff9ab8, shirtStyle: 'hawaiian', pants: 0x2a2a3a, hair: 'afro', hairCol: 0x1a1008 },
  { skin: 'light', shirt: 0x9ee6cf, shirtStyle: 'tee', pants: 0x5a4a8a, hair: 'bob', hairCol: 0xc84a2a, outfit: ['sunglasses'] },
  { skin: 'tan', shirt: 0xc9b2f2, shirtStyle: 'stripes', pants: 0x2a3a3a, hair: 'crew', hairCol: 0x2a1a10, beard: 'stubble' },
  { skin: 'yellow', shirt: 0xffc79e, shirtStyle: 'hoodie', pants: 0x3a2a2a, hair: 'long', hairCol: 0x0a0a0a },
  { skin: 'pale', shirt: 0x2ae8ff, shirtStyle: 'hawaiian', pants: 0xf2e8d8, pantsStyle: 'plain', hair: 'slick', hairCol: 0x6a4a2a, outfit: ['sunglasses'] },
  { skin: 'brown', shirt: 0xffe07a, shirtStyle: 'plain', pants: 0x2a2a5a, hair: 'braids', hairCol: 0x1a1008, outfit: [['cap', { col: 0xb05aff }]] },
];
export const CAST = { Rico: RICO, Lulu: LULU, 'Grandpa Sal': SAL, Dani: DANI, 'Sign kid': SIGNKID, 'Fan 1': CROWD[0], 'Fan 2': CROWD[1] };
export const CAST_SET = 'night';

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
