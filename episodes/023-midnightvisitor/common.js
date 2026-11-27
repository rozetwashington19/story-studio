// Episode 023 (The Midnight Visitor) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, addPose, visorHelmet, feelers, bigPup } from '../../engine/kit.js';

// Opal, 14 (narrator): the only one who isn't scared — long auburn hair under a mustard beanie, lilac hoodie, teal scarf, jeans, plum boots. Notebook.
export const OPAL = { skin: 'tan', shirt: 0xa884e0, shirtStyle: 'hoodie', pants: 0x2f3a5a, pantsStyle: 'jeans', hair: 'long', hairCol: 0x8a3a1e, freckles: true,
  outfit: [['beanie', { col: 0xe8b020, hair: true }], ['scarf', { col: 0x2a9a98 }], ['boots', { col: 0x5a2a4a }]] };
// Dad, 40s: trap builder, nine-year mower repair — green rancher hat, black mustache, red plaid shirt, tool belt, work gloves. Wrench.
export const DADM = { skin: 'tan', shirt: 0xc8382a, shirtStyle: 'plaid', pants: 0x5a4a3c, pantsStyle: 'plain', hair: 'crew', hairCol: 0x1a1210, beard: 'mustache',
  outfit: [['cowboyhat', { col: 0x2f7a4a }], ['belt', { col: 0x3a2414 }], ['gloves', { col: 0xc8a050 }], ['boots', { col: 0x3a2414 }]] };
// Finn, 7 (little brother): yellow hoodie, blue bike helmet he never takes off, freckles, blue shorts-jeans, red boots.
export const FINN = { skin: 'tan', shirt: 0xf2c420, shirtStyle: 'hoodie', pants: 0x3a6ab8, pantsStyle: 'jeans', hair: 'short', hairCol: 0x8a3a1e, freckles: true, rosy: true,
  outfit: [['helmet', { col: 0x2a8ae8 }], ['boots', { col: 0xd8302a }]] };
// Mrs. Bell, 70s (neighbour, prize roses): silver perm under a purple head scarf, glasses, rose-pink sweater, green garden apron, yellow gloves.
export const BELL = { skin: 'light', shirt: 0xd86a9a, shirtStyle: 'sweater', pants: 0x6a5a78, pantsStyle: 'plain', hair: 'perm', hairCol: 0xc8c8d0, wrinkles: true, rosy: true,
  outfit: [['bandana', { col: 0x6a3a9a, hair: true }], 'glasses', ['apron', { col: 0x3a8a5a }], ['gloves', { col: 0xf2d040 }]] };
// The mailman: brown skin, buzz cut, stubble, blue uniform + cap, satchel.
export const MAIL = { skin: 'brown', shirt: 0x3a5a9a, shirtStyle: 'uniform', pants: 0x2a3a5a, pantsStyle: 'plain', hair: 'buzz', hairCol: 0x1a1210, beard: 'stubble',
  outfit: [['cap', { col: 0x2a4a8a }], ['satchel', { col: 0x8a5a2a }], ['boots', { col: 0x1a1a1e }]] };
// The visitor: white suit with an orange stripe, life-support pack, grey gloves/boots, white helmet with a gold visor (visorHelmet). Under it: messy brown hair, stubble.
export const ASTRO = { skin: 'light', shirt: 0xe8502a, shirtStyle: 'spacesuit', pants: 0xe4e6ea, pantsStyle: 'plain', hair: 'swoop', hairCol: 0x5a3a22, beard: 'stubble',
  outfit: [['backpack', { col: 0xe4e6ea }], ['gloves', { col: 0x9aa0a8 }], ['boots', { col: 0xb8bcc4 }], ['belt', { col: 0x8a8e96 }]] };
export const CAST = { Opal: OPAL, Dad: DADM, Finn: FINN, 'Mrs. Bell': BELL, Mailman: MAIL, 'The visitor': ASTRO };
export const CAST_SET = 'night';

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); A.s = scale; return A; };
const withFeel = (A, col) => { A.feel = feelers(A, { col }); return A; };
export const opal = (S, face, pos, ry = 0) => withFeel(mk(S, OPAL, 'opal', face, pos, ry, 0.95), 0x7af27a);
export const dad = (S, face, pos, ry = 0) => withFeel(mk(S, DADM, 'dad', face, pos, ry, 1.06), 0xf2e25a);
export const finn = (S, face, pos, ry = 0) => withFeel(mk(S, FINN, 'finn', face, pos, ry, 0.7), 0xff9a5a);
export const bell = (S, face, pos, ry = 0) => withFeel(mk(S, BELL, 'bell', face, pos, ry, 0.96), 0xff8ad0);
export const mail = (S, face, pos, ry = 0) => mk(S, MAIL, 'mailman', face, pos, ry, 1.0);
export const astro = (S, pos, ry = 0, face = 'smile') => { const A = mk(S, ASTRO, 'visitor', face, pos, ry, 1.1); A.helm = visorHelmet(A); if (A.hairMesh) A.hairMesh.visible = false; return A; };
export const dog = (S, pos, ry = 0) => { const d = bigPup(S, { name: 'dog', s: 0.42, col: 0x8a8e9a, ear: 0x4a4e5a, snout: 0xe8e8ee, collar: 0xe8502a }); d.root.position.set(...pos); d.root.rotation.y = ry * D; return d; };

export const ps = (...a) => a.reduce((x, y) => addPose(x, y), {});
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const sm = (t, a, b) => { const x = ramp(t, a, b); return x * x * (3 - 2 * x); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const V = (a) => new THREE.Vector3(...a);
export const headOf = (A) => { A.root.updateMatrixWorld(true); return A.headMesh.getWorldPosition(new THREE.Vector3()); };
// close-up from the front / 3-4 of a character whose head is at h, facing ry
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffe0c0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };
export const allow = (S, ...pairs) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...pairs]; };
export const hold = (g, A, side = 'R', off = [0, -0.3, 0.2]) => { const p = pinky(A, side); g.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); return p; };
export const hands = (A) => { const a = pinky(A, 'R'), b = pinky(A, 'L'); return a.add(b).multiplyScalar(0.5); };
const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
// numeric keyframes with overshoot (hit() only works on pose objects)
export function hn(keys, t, fn = backOut) { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return a + (b - a) * fn((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1]; }
export const shake = (cam, t, t0, k = 1) => { const u = t - t0; if (u < 0 || u > 0.7) return; const a = Math.exp(-u * 6) * 0.25 * k; cam.position.x += Math.sin(u * 60) * a; cam.position.y += Math.sin(u * 47 + 1) * a; };
export const arc = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * h, lerp(a[2], b[2], u)];
export const eye = (A, dy = 4.64) => [A.root.position.x, A.root.position.y + dy * A.root.scale.y, A.root.position.z];
// low-gravity bounce: the visitor's walk — big slow hops. Returns { y, pose } for hop phase; `n` hops over [t0, t1]
export function bounce(t, t0, t1, n, h = 1.5) { const u = clamp01((t - t0) / (t1 - t0)) * n, f = u % 1, air = Math.sin(f * Math.PI), on = t > t0 && t < t1;
  return { u: clamp01((t - t0) / (t1 - t0)), y: on ? air * h : 0, pose: on ? { rLeg: 24 * air, lLeg: -14 * air, rUp: 22 + 26 * air, lUp: 22 + 26 * air, rFwd: 14 * air, lFwd: 14 * air, lean: 8 - 6 * air, bob: f < 0.12 || f > 0.9 ? -0.12 : 0, nod: -4 * air } : { rUp: 14, lUp: 14 } }; }
// slow heavy breathing for the suit
export const breathe = (t) => ({ bob: Math.sin(t * 2.2) * 0.035, lean: Math.sin(t * 2.2) * 1.2, rUp: 12 + Math.sin(t * 2.2) * 2, lUp: 12 + Math.sin(t * 2.2) * 2 });
// eyeline scaled for two-shots
export const look = (l, k = 0.45) => ({ turn: l.turn * k, nod: l.nod * k });
