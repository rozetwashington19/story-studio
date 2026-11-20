// Episode 011 (Worry Stones) shared cast + helpers
// Milo, 10 (narrator): island kid — navy/white sailor-stripe tee, rust-orange pants, ginger curls, freckles, yellow rain boots. His backpack: teal.
export const MILO = { skin: 'light', shirt: 0x24366a, shirtStyle: 'stripes', pants: 0xc0582a, hair: 'curly', hairCol: 0xc8521a, freckles: true, rosy: true,
  outfit: [['boots', { col: 0xf2c420 }]] };
// June, 15 (big sister): sage cardigan, long black braids, round glasses, headphones, plum pants. Her backpack: coral, fridge-sized.
export const JUNE = { skin: 'brown', shirt: 0x8aa88a, shirtStyle: 'sweater', pants: 0x5a2a4a, hair: 'braids', hairCol: 0x120a06,
  outfit: [['glasses', { col: 0x3a2a1a }], ['headphones', { col: 0xf4f0e8 }], ['boots', { col: 0x3a2a24 }]] };
// Captain Moss: ferry captain — navy uniform, white captain cap, full grey beard, wrinkles, life vest. Backpack: dark green + anchor.
export const MOSS = { skin: 'pale', shirt: 0x1e2a4a, shirtStyle: 'uniform', pants: 0x1e2a4a, pantsStyle: 'plain', hair: 'crew', hairCol: 0x9a9a9a, beard: 'full', beardCol: 0xb8b8b8, wrinkles: true,
  outfit: [['cap', { col: 0xf4f4f0 }], ['lifevest', { col: 0xf27a1a }], ['boots', { col: 0x1a1a1a }]] };
// Aunt Rae (Benny's mom, no lines): teal plaid jacket, auburn bob
export const RAE = { skin: 'tan', shirt: 0x2a8a8a, shirtStyle: 'plaid', pants: 0x3a3a48, pantsStyle: 'plain', hair: 'bob', hairCol: 0x8a3a1a, outfit: [['scarf', { col: 0xf2c45a }]] };
// Baby Benny: yellow skin, tuft, rosy, little red hoodie (scaled 0.55)
export const BENNY = { skin: 'yellow', shirt: 0xe8402a, shirtStyle: 'hoodie', pants: 0x3a6ab8, hair: 'tuft', hairCol: 0x2a1a0a, rosy: true };
// deckhands (crew): white sailor shirts, red beanie / bandana
export const CREW = [
  { skin: 'brown', shirt: 0xf4f4f0, shirtStyle: 'uniform', pants: 0x2a3a6a, pantsStyle: 'plain', hair: 'buzz', hairCol: 0x120a06, beard: 'goatee', beardCol: 0x120a06, outfit: [['beanie', { col: 0xc8302a }], 'gloves'] },
  { skin: 'tan', shirt: 0xf2c420, shirtStyle: 'jacket', pants: 0x2a2a2a, pantsStyle: 'plain', hair: 'ponytail', hairCol: 0x3a1a0a, outfit: [['bandana', { col: 0x2a6ab8 }], ['boots', { col: 0x2a2a2a }]] },
];
// ferry kids (no lines)
export const KIDS = [
  { skin: 'yellow', shirt: 0xf27aa8, shirtStyle: 'tee', pants: 0x2a2a4a, hair: 'puffs', hairCol: 0x1a0e08 },
  { skin: 'tan', shirt: 0x4aa84a, shirtStyle: 'hoodie', pants: 0x5a4a3a, hair: 'spiky', hairCol: 0x5a3a1a },
];
export const PACK = { milo: 0x2aa8a0, june: 0xf06a5a, moss: 0x2a5a3a, benny: 0xf2c420, rae: 0x8a5ad8, k0: 0x6a5ad8, k1: 0xe8a020, c0: 0x3a6ab8, c1: 0xc8302a };
export const CAST = { Milo: MILO, June: JUNE, 'Captain Moss': MOSS, Benny: BENNY, 'Deckhand A': CREW[0], 'Deckhand B': CREW[1], 'Kid A': KIDS[0], 'Kid B': KIDS[1] };

import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, bigPack } from '../../engine/kit.js';

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const milo = (S, face, pos, ry = 0) => mk(S, MILO, 'milo', face, pos, ry);
export const june = (S, face, pos, ry = 0) => mk(S, JUNE, 'june', face, pos, ry, 1.07);
export const moss = (S, face, pos, ry = 0) => mk(S, MOSS, 'moss', face, pos, ry, 1.05);
export const rae = (S, face, pos, ry = 0) => mk(S, RAE, 'rae', face, pos, ry);
export const benny = (S, face, pos, ry = 0) => mk(S, BENNY, 'benny', face, pos, ry, 0.55);
// pack(A, key, s) → bigPack on A's back in that character's colour
export const pack = (A, key, s = 1, o = {}) => bigPack(A, { col: PACK[key], s, ...o });
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
export const allow = (S, ...pairs) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...pairs]; };
export const hold = (g, A, side = 'R', off = [0, -0.3, 0.2]) => { const p = pinky(A, side); g.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); };
const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
export function hn(keys, t, fn = backOut) { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return a + (b - a) * fn((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1]; }
export const RUN = (t, k = 1) => { const w = { rLeg: Math.sin(t * 15) * 55, lLeg: -Math.sin(t * 15) * 55, rFwd: -Math.sin(t * 15) * 60, lFwd: Math.sin(t * 15) * 60, bob: Math.abs(Math.cos(t * 15)) * 0.25, lean: 14 };
  for (const k2 in w) w[k2] *= k; return w; };
// heavy trudge: slow steps, bent forward under a load
export const TRUDGE = (t, k = 1) => ({ rLeg: Math.sin(t * 4) * 22 * k, lLeg: -Math.sin(t * 4) * 22 * k, rFwd: 20 + Math.sin(t * 4) * 8, lFwd: 20 - Math.sin(t * 4) * 8, lean: 22 * k, nod: 8 * k, bob: -Math.abs(Math.sin(t * 4)) * 0.1 });
// thumbs under the straps
export const STRAPS = { rFwd: 30, lFwd: 30, rUp: -24, lUp: -24 };
export const SIT_FLOOR = { rLeg: 90, lLeg: 90 };
