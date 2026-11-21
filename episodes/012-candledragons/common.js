// Episode 012 (Candle Dragons) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, flameDragon } from '../../engine/kit.js';

// Wren, 10→11 (narrator): the Queen's granddaughter — emerald tunic, short red cape, silver circlet with a green gem, dark-brown pigtails, freckles, brown boots + belt.
export const WREN = { skin: 'tan', shirt: 0x1f7a5a, shirtStyle: 'sweater', pants: 0x4a3426, pantsStyle: 'plain', hair: 'pigtails', hairCol: 0x2a1408, freckles: true, rosy: true,
  outfit: [['circlet', { col: 0xd8dce4, gem: 0x3ad0a0 }], ['cape', { col: 0xc8302a }], ['belt', { col: 0x5a3a1e }], ['boots', { col: 0x6a4224 }]] };
// Grandma, the Queen: royal purple robe, gold crown, white bun, wrinkles, ermine-white sash.
export const GRAN = { skin: 'light', shirt: 0x5a2a8a, shirtStyle: 'blazer', pants: 0x4a1a6a, pantsStyle: 'plain', hair: 'bun', hairCol: 0xf2f0ea, wrinkles: true, rosy: true,
  outfit: [['crown', { col: 0xf2c420 }], ['cape', { col: 0x3a1a6a }], ['sash', { col: 0xf4f0e8 }]] };
// Baker Hob: big chef hat, white apron over a cream shirt, black walrus mustache, brown skin.
export const HOB = { skin: 'brown', shirt: 0xf0e2c8, shirtStyle: 'shirt', pants: 0x5a4030, pantsStyle: 'plain', hair: 'crew', hairCol: 0x1a120c, beard: 'walrus', beardCol: 0x1a120c,
  outfit: ['chefhat', ['apron', { col: 0xfafaf4 }]] };
// Sir Bram: open-face knight helm with a red plume, armour, full ginger beard, blue surcoat.
export const BRAM = { skin: 'yellow', shirt: 0x2a4ab8, shirtStyle: 'knight', pants: 0x3a3a44, pantsStyle: 'plain', hair: 'crew', hairCol: 0xc8521a, beard: 'full', beardCol: 0xc8521a,
  outfit: [['knighthelm', { plume: 0xd8302a }], ['armor', { col: 0xb8bcc8 }], ['gloves', { col: 0x5a3a20 }], ['boots', { col: 0x3a2a1a }]] };
// castle guards / knights (no lines)
export const GUARDS = [
  { skin: 'brown', shirt: 0x8a1a2a, shirtStyle: 'knight', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'buzz', hairCol: 0x120a06, beard: 'goatee', beardCol: 0x120a06, outfit: [['knighthelm', { plume: 0xf2c420 }], 'boots'] },
  { skin: 'pale', shirt: 0x2a6a3a, shirtStyle: 'knight', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'crew', hairCol: 0x6a4a2a, beard: 'stubble', outfit: [['knighthelm', { plume: 0x2a8ae8 }], 'boots'] },
];
export const CAST = { Wren: WREN, 'Grandma (the Queen)': GRAN, 'Baker Hob': HOB, 'Sir Bram': BRAM, 'Guard A': GUARDS[0], 'Guard B': GUARDS[1] };
export const CAST_SET = 'night';

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const wren = (S, face, pos, ry = 0) => mk(S, WREN, 'wren', face, pos, ry, 0.92);
export const gran = (S, face, pos, ry = 0) => mk(S, GRAN, 'gran', face, pos, ry, 1.02);
export const hob = (S, face, pos, ry = 0) => mk(S, HOB, 'hob', face, pos, ry, 1.08);
export const bram = (S, face, pos, ry = 0) => mk(S, BRAM, 'bram', face, pos, ry, 1.1);
export const guard = (S, i, face, pos, ry = 0) => mk(S, GUARDS[i], 'guard' + i, face, pos, ry, 1.05);
// dragons: tiny (s 0.14), grown (0.5), giant (5)
export const DCOLS = [0xff6a1a, 0xff4a2a, 0xff8a1a, 0xf25a3a, 0xffa020, 0xff5a10, 0xe8501a, 0xff7a30, 0xff3a1a, 0xffb030, 0xff6a2a];
export const dragon = (S, i = 0, s = 0.14, light = 0) => flameDragon(S, { name: 'dragon' + i, s, body: DCOLS[i % DCOLS.length], seed: i * 1.7 + 1, light, dist: s < 0.3 ? 5 : undefined });
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
// blowing out candles: cheeks-forward lean, hands behind (k 0..1)
export const BLOW = (k) => ({ lean: 14 * k, nod: 10 * k, rFwd: -10 * k, lFwd: -10 * k, bob: -0.1 * k });
// a dragon flight path: smooth figure-of-8 / orbit around c
export const orbit = (t, c, r = 2, h = 0.6, sp = 1, ph = 0) => new THREE.Vector3(c[0] + Math.cos(t * sp + ph) * r, c[1] + Math.sin(t * sp * 2 + ph) * h, c[2] + Math.sin(t * sp + ph) * r * 0.7);
// point a dragon along its velocity (root rotation) — call with the previous and the new position
export function steer(d, p, prev) { const v = p.clone().sub(prev); if (v.lengthSq() > 1e-6) d.root.rotation.y = Math.atan2(v.x, v.z); d.root.position.copy(p); }
