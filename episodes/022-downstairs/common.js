// Episode 022 (The Tenant Downstairs) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, addPose } from '../../engine/kit.js';

// Dana, 29 (narrator): line cook who always cooks too much — afro + orange headband, mustard sweater, teal apron, jeans, burgundy boots.
export const DANA = { skin: 'brown', shirt: 0xd8a030, shirtStyle: 'sweater', pants: 0x2f4a78, pantsStyle: 'jeans', hair: 'afro', hairCol: 0x1a1210,
  outfit: [['headband', { col: 0xe8602a }], ['apron', { col: 0x1f7a78 }], ['boots', { col: 0x6a1e2a }]] };
// Mr. Crane, 50s (the landlord): tall, pale, grey comb-over, mustache, plum blazer, lime tie, glasses.
export const CRANE = { skin: 'pale', shirt: 0x5a2a5e, shirtStyle: 'blazer', pants: 0x2a2430, pantsStyle: 'plain', hair: 'combover', hairCol: 0x8a8a92, beard: 'mustache', beardCol: 0x6a6a72, wrinkles: true,
  outfit: ['glasses', ['tie', { col: 0xb8c820 }], ['belt', { col: 0x1a1a1e }], ['boots', { col: 0x1a1a1e }]] };
// Madame Odette (the opera singer who sings the basement to sleep): platinum bun, crimson gown, gold cape, circlet.
export const DIVA = { skin: 'light', shirt: 0xb01e3a, shirtStyle: 'plain', pants: 0xb01e3a, pantsStyle: 'plain', hair: 'bun', hairCol: 0xf0e2b8, rosy: true,
  outfit: [['circlet', { col: 0xe8c040, gem: 0x40d0ff }], ['cape', { col: 0xd8a83a }], ['gloves', { col: 0xf6f2ea }]] };
// Mr. Ferris (the neighbour who is always one sock short): receding brown hair, stubble, sky-blue robe-sweater, striped pyjama legs, pink slippers.
export const FERRIS = { skin: 'tan', shirt: 0x7ab0d8, shirtStyle: 'sweater', pants: 0xd8d8e8, pantsStyle: 'plain', hair: 'receding', hairCol: 0x6a4426, beard: 'stubble',
  outfit: [['scarf', { col: 0x4a80b0 }], ['boots', { col: 0xf08ab0 }]] };
export const CAST = { Dana: DANA, 'Mr. Crane': CRANE, 'Madame Odette': DIVA, 'Mr. Ferris': FERRIS };
export const CAST_SET = 'night';

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const dana = (S, face, pos, ry = 0) => mk(S, DANA, 'dana', face, pos, ry, 1.0);
export const crane = (S, face, pos, ry = 0) => mk(S, CRANE, 'crane', face, pos, ry, 1.07);
export const diva = (S, face, pos, ry = 0) => mk(S, DIVA, 'diva', face, pos, ry, 1.02);
export const ferris = (S, face, pos, ry = 0) => mk(S, FERRIS, 'ferris', face, pos, ry, 1.0);

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
export const rumble = (cam, t, k = 1) => { cam.position.x += Math.sin(t * 31) * 0.05 * k; cam.position.y += Math.sin(t * 27 + 1) * 0.05 * k; };
export const arc = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * h, lerp(a[2], b[2], u)];
// world-space head-height point of a standing avatar (for eyelines before matrices are fresh)
export const eye = (A, dy = 4.64) => [A.root.position.x, A.root.position.y + dy * A.root.scale.y, A.root.position.z];
