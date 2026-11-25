// Episode 020 (Noodle) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, bigPup } from '../../engine/kit.js';

// Tess, 15 (narrator): new in town — mustard hoodie (coin in the pocket), teal jeans, black braids, teal headphones round her neck, white sneakers.
export const TESS = { skin: 'brown', shirt: 0xe8a82a, shirtStyle: 'hoodie', pants: 0x1e5a64, pantsStyle: 'jeans', hair: 'braids', hairCol: 0x15100c,
  outfit: [['headphones', { col: 0x2aa8a8 }], ['boots', { col: 0xf6f2ee }], ['wristband', { col: 0x2aa8a8 }]] };
// Mrs. Pell, 70s (a million followers): pale, silver bun, wrinkles, hot-pink blazer, sunglasses pushed up, pearl-white scarf.
export const PELL = { skin: 'pale', shirt: 0xff4a9a, shirtStyle: 'blazer', pants: 0xf2e8f0, pantsStyle: 'plain', hair: 'bun', hairCol: 0xd8dce4, wrinkles: true,
  outfit: [['sunglasses', { up: true, frame: 0xff4a9a }], ['scarf', { col: 0xfbf8f2 }], ['boots', { col: 0xff4a9a }]] };
// The baker (endless bread): tan, big black beard, red bandana, blue-white striped shirt, floury apron.
export const BAKER = { skin: 'tan', shirt: 0x2a5ab8, shirtStyle: 'stripes', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'receding', hairCol: 0x16100c, beard: 'full', beardCol: 0x16100c,
  outfit: [['bandana', { col: 0xe83a3a }], ['apron', { col: 0xf6f0e4 }], ['boots', { col: 0x3a2418 }]] };
// Mayor Hollis: light skin, grey walrus mustache, white cowboy hat, tan blazer, turquoise bolo tie, boots.
export const MAYOR = { skin: 'light', shirt: 0xc8a06a, shirtStyle: 'blazer', pants: 0x4a3a2a, pantsStyle: 'plain', hair: 'slick', hairCol: 0x9a9aa0, beard: 'walrus', beardCol: 0xa8a8ae, wrinkles: true,
  outfit: [['cowboyhat', { col: 0xf6f2ea }], ['tie', { col: 0x2ac8b8 }], ['boots', { col: 0x5a3018 }]] };
// classmates (no lines)
export const KIDS = [
  { skin: 'yellow', shirt: 0xd8302a, shirtStyle: 'tee', pants: 0x2a2a3a, pantsStyle: 'jeans', hair: 'spiky', hairCol: 0x1a2a4a, outfit: [['cap', { col: 0x2a2a3a, back: true }], ['boots', { col: 0xf2f2f2 }]] },
  { skin: 'pale', shirt: 0x3aa85a, shirtStyle: 'sweater', pants: 0x5a4a7a, pantsStyle: 'plain', hair: 'ponytail', hairCol: 0xc8601a, freckles: true, outfit: ['glasses', ['boots', { col: 0x5a3a2a }]] },
  { skin: 'tan', shirt: 0x8a4ad8, shirtStyle: 'jacket', pants: 0x2a3a5a, pantsStyle: 'jeans', hair: 'afro', hairCol: 0x3a2214, outfit: [['backpack', { col: 0xff8a2a }], ['boots', { col: 0xf2f2f2 }]] },
];
// townsfolk (no lines)
export const TOWN = [
  { skin: 'brown', shirt: 0x6a8a3a, shirtStyle: 'plaid', pants: 0x3a5a8a, pantsStyle: 'jeans', hair: 'crew', hairCol: 0x1a120c, beard: 'stubble', outfit: [['cap', { col: 0xe8a82a }], 'overalls'] },
  { skin: 'light', shirt: 0xff8a5a, shirtStyle: 'shirt', pants: 0x5a3a2a, pantsStyle: 'plain', hair: 'lowbun', hairCol: 0x8a4a1a, outfit: [['apron', { col: 0x2a9a9a }]] },
  { skin: 'yellow', shirt: 0x3a6ab8, shirtStyle: 'polo', pants: 0x2a2a2a, pantsStyle: 'plain', hair: 'buzz', hairCol: 0x2a2a2a, outfit: ['sunglasses'] },
];
export const CAST = { Tess: TESS, 'Mrs. Pell': PELL, Baker: BAKER, 'Mayor Hollis': MAYOR, 'Kid A': KIDS[0], 'Kid B': KIDS[1], 'Kid C': KIDS[2], 'Town 1': TOWN[0], 'Town 2': TOWN[1] };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const tess = (S, face, pos, ry = 0) => mk(S, TESS, 'tess', face, pos, ry, 0.95);
export const pell = (S, face, pos, ry = 0) => mk(S, PELL, 'pell', face, pos, ry, 0.93);
export const baker = (S, face, pos, ry = 0) => mk(S, BAKER, 'baker', face, pos, ry, 1.06);
export const mayor = (S, face, pos, ry = 0) => mk(S, MAYOR, 'mayor', face, pos, ry, 1.0);
export const kid = (S, i, face, pos, ry = 0) => mk(S, KIDS[i], 'kid' + i, face, pos, ry, 0.92);
export const towny = (S, i, face, pos, ry = 0) => mk(S, TOWN[i % TOWN.length], 'town' + i, face, pos, ry, 1.0);
export const noodle = (S, s, pos, ry = 0) => { const p = bigPup(S, { name: 'noodle', s }); p.root.position.set(...pos); p.root.rotation.y = ry * D; return p; };

export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const sm = (t, a, b) => { const x = ramp(t, a, b); return x * x * (3 - 2 * x); };
export const V = (a) => new THREE.Vector3(...a);
export const headOf = (A) => { A.root.updateMatrixWorld(true); return A.headMesh.getWorldPosition(new THREE.Vector3()); };
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffe0c0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };
export const allow = (S, ...pairs) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...pairs]; };
export const hold = (g, A, side = 'R', off = [0, -0.3, 0.2]) => { const p = pinky(A, side); g.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); };
const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
export function hn(keys, t, fn = backOut) { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return a + (b - a) * fn((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1]; }
export const shake = (cam, t, t0, k = 1) => { const u = t - t0; if (u < 0 || u > 0.7) return; const a = Math.exp(-u * 6) * 0.25 * k; cam.position.x += Math.sin(u * 60) * a; cam.position.y += Math.sin(u * 47 + 1) * a; };
export const rumble = (cam, t, k = 1) => { cam.position.x += Math.sin(t * 31) * 0.06 * k; cam.position.y += Math.sin(t * 27 + 1) * 0.06 * k; };
// a seated rider on the dog's back: put avatar A at the dog's back top, offset along the dog's length
export function ride(P, A, along = 0, side = 0) { P.root.updateMatrixWorld(true); const b = P.world('back'); const s = P.g.scale.x; const ry = P.root.rotation.y;
  const fx = Math.sin(ry), fz = Math.cos(ry); A.root.position.set(b.x + fx * along * s + fz * side, b.y + 0.85 * s - 1.5 * 0.92 + 0.1, b.z + fz * along * s - fx * side); A.root.rotation.y = ry; }
