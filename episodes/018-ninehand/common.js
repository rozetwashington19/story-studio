// Episode 018 (The Hand at Nine) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky } from '../../engine/kit.js';

// Clove, 17 (narrator): the icer's granddaughter — peppermint-striped red shirt, mint apron, long dark hair with a big pink bow, white boots.
export const CLOVE = { skin: 'tan', shirt: 0xe23a4a, shirtStyle: 'stripes', pants: 0x3a2a4a, pantsStyle: 'jeans', hair: 'long', hairCol: 0x2a160c,
  outfit: [['apron', { col: 0x8ae0c0 }], ['bow', { col: 0xff5aa8 }], ['boots', { col: 0xf6f2ee }]] };
export const CLOVE_NOBOW = { ...CLOVE, outfit: [['apron', { col: 0x8ae0c0 }], ['boots', { col: 0xf6f2ee }]] };
// Grandpa Gus, the master icer: brown skin, white balding hair + walrus mustache, wrinkles, teal plaid shirt, icing-stained cream apron, round glasses, red scarf.
export const GUS = { skin: 'brown', shirt: 0x2a8a8a, shirtStyle: 'plaid', pants: 0x5a3a24, pantsStyle: 'plain', hair: 'balding', hairCol: 0xf2f2ee, beard: 'walrus', beardCol: 0xf2f2ee, wrinkles: true,
  outfit: [['apron', { col: 0xf2e6d0 }], 'glasses', ['scarf', { col: 0xc8302a }], ['boots', { col: 0x4a2a1a }]] };
// Mister Fudd, the baker with the ugliest house: pale, black slick hair + mustache, chef hat, white baker's uniform, flour-grey apron.
export const FUDD = { skin: 'pale', shirt: 0xf2f0ea, shirtStyle: 'uniform', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'slick', hairCol: 0x16100c, beard: 'mustache', beardCol: 0x16100c,
  outfit: ['chefhat', ['apron', { col: 0xb8b4ac }], ['boots', { col: 0x1a1a1e }]] };
// The Mayor (no lines): yellow skin, silver bob, purple blazer, gold sash, sunglasses.
export const MAYOR = { skin: 'yellow', shirt: 0x6a3aa8, shirtStyle: 'blazer', pants: 0x3a2a5a, pantsStyle: 'plain', hair: 'bob', hairCol: 0xc8ccd4,
  outfit: [['sash', { col: 0xf2c420 }], ['sunglasses', { col: 0x1a1a1a }], ['boots', { col: 0x2a1a3a }]] };
// The giant kid (reveal, no name): light skin, ginger puffs, red holiday sweater, green pajama pants.
export const KID = { skin: 'light', shirt: 0xc8202a, shirtStyle: 'sweater', pants: 0x2a7a4a, pantsStyle: 'plain', hair: 'puffs', hairCol: 0xc8601a, freckles: true, rosy: true };
// The giant grandma (reveal): pale, white perm, wrinkles, green cardigan, glasses, oven mitt.
export const GRAN = { skin: 'pale', shirt: 0x3a7a4a, shirtStyle: 'sweater', pants: 0x6a5a7a, pantsStyle: 'plain', hair: 'perm', hairCol: 0xf0eee8, wrinkles: true,
  outfit: ['glasses', ['gloves', { col: 0xe86a3a }]] };
export const CAST = { Clove: CLOVE, 'Grandpa Gus': GUS, 'Mister Fudd': FUDD, Mayor: MAYOR, 'Giant kid': KID, 'Giant grandma': GRAN };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const clove = (S, face, pos, ry = 0, o = CLOVE) => mk(S, o, 'clove', face, pos, ry, 0.95);
export const gus = (S, face, pos, ry = 0) => mk(S, GUS, 'gus', face, pos, ry, 0.97);
export const fudd = (S, face, pos, ry = 0) => mk(S, FUDD, 'fudd', face, pos, ry, 1.02);
export const mayor = (S, face, pos, ry = 0) => mk(S, MAYOR, 'mayor', face, pos, ry, 1.0);

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
export const RUN = (t, k = 1) => { const w = { rLeg: Math.sin(t * 15) * 55, lLeg: -Math.sin(t * 15) * 55, rFwd: -Math.sin(t * 15) * 60, lFwd: Math.sin(t * 15) * 60, bob: Math.abs(Math.cos(t * 15)) * 0.25, lean: 14 };
  for (const k2 in w) w[k2] *= k; return w; };
export const shake = (cam, t, t0, k = 1) => { const u = t - t0; if (u < 0 || u > 0.7) return; const a = Math.exp(-u * 6) * 0.25 * k; cam.position.x += Math.sin(u * 60) * a; cam.position.y += Math.sin(u * 47 + 1) * a; };
export const rumble = (cam, t, k = 1) => { cam.position.x += Math.sin(t * 31) * 0.06 * k; cam.position.y += Math.sin(t * 27 + 1) * 0.06 * k; };
// Townsfolk extras (no lines)
export const TOWN = [
  { skin: 'light', shirt: 0xffb8d8, shirtStyle: 'sweater', pants: 0x5a3a6a, pantsStyle: 'plain', hair: 'ponytail', hairCol: 0xe8c060, outfit: [['scarf', { col: 0x3ad8a8 }]] },
  { skin: 'brown', shirt: 0x3a8ad8, shirtStyle: 'hoodie', pants: 0x2a2a3a, pantsStyle: 'jeans', hair: 'buzz', hairCol: 0x1a120c, outfit: [['beanie', { col: 0xffd23a }]] },
  { skin: 'tan', shirt: 0x8a5ad8, shirtStyle: 'jacket', pants: 0x3a3a3a, pantsStyle: 'plain', hair: 'crew', hairCol: 0x6a3a1a, beard: 'stubble', beardCol: 0x6a3a1a, outfit: [['cap', { col: 0xff5a3a }]] },
  { skin: 'pale', shirt: 0xff8a3a, shirtStyle: 'tee', pants: 0x2a5a8a, pantsStyle: 'jeans', hair: 'bob', hairCol: 0x8a2a1a, outfit: [['earmuffs', { col: 0xff8ad0 }]] },
];
export const towny = (S, i, face, pos, ry = 0) => mk(S, TOWN[i % TOWN.length], 'town' + i, face, pos, ry, 0.97);
// Clove's loose bow (pops off in the hug)
export function looseBow(S, col = 0xff5aa8) { const g = new THREE.Group(); S.add(g); const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 });
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 4), m); c.position.set(s * 0.18, 0, 0); c.rotation.z = s * Math.PI / 2; g.add(c); }
  const k = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), m); g.add(k); return g; }
// piping bag held in a hand (tip points along -y of the group)
export function pipingBag(S, col = 0xfbf8f2) { const g = new THREE.Group(); S.add(g); const b = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.1, 12), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }));
  b.rotation.x = Math.PI; g.add(b); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), new THREE.MeshStandardMaterial({ color: 0xd8dce4, metalness: 0.8, roughness: 0.3 })); tip.position.y = -0.62; tip.rotation.x = Math.PI; g.add(tip); return g; }
// the Sugarby street's key places (see engine/sets18.js)
export const GUS_Z = -15, DECK_Y = 12.65, CHIM = [5.3, 15.05, -15];
