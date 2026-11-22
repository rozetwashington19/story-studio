// Episode 013 (The Sponge) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, spongeBuddy, foamMonster } from '../../engine/kit.js';

// Benji, 10 (narrator): the quiet science kid — oversized white lab coat over a sponge-yellow tee, round glasses, black curly hair, freckles, red sneakers-boots.
export const BENJI = { skin: 'brown', shirt: 0xf2c230, shirtStyle: 'tee', pants: 0x34507a, pantsStyle: 'jeans', hair: 'curly', hairCol: 0x15100c, freckles: true,
  outfit: [['labcoat', { col: 0xf6f6f2 }], 'glasses', ['boots', { col: 0xc8302a }]] };
// Dex, 11: the kid who wins every year — red varsity jacket, backwards black cap, sunglasses pushed up, blond swoop, gold wristband.
export const DEX = { skin: 'light', shirt: 0xc8262a, shirtStyle: 'jacket', pants: 0x1c1e24, pantsStyle: 'jeans', hair: 'swoop', hairCol: 0xe8c060, rosy: true,
  outfit: [['cap', { col: 0x1a1a1e, back: true }], ['wristband', { col: 0xf2c030 }]] };
// Priya, 10: potato-clock inventor — purple hoodie, black ponytail, pink headband, teal backpack.
export const PRIYA = { skin: 'tan', shirt: 0x7a3ab8, shirtStyle: 'hoodie', pants: 0x2a2a3a, pantsStyle: 'plain', hair: 'ponytail', hairCol: 0x120a06, rosy: true,
  outfit: [['headband', { col: 0xff6aa8 }], ['backpack', { col: 0x2ab8a0 }]] };
// Mr. Gus, the janitor: navy work uniform, navy cap, salt-and-pepper hair + big mustache, yellow rubber gloves, key badge.
export const GUS = { skin: 'pale', shirt: 0x2a4a6a, shirtStyle: 'uniform', pants: 0x2a3440, pantsStyle: 'plain', hair: 'receding', hairCol: 0x8a8680, beard: 'walrus', beardCol: 0x9a948a, wrinkles: true,
  outfit: [['cap', { col: 0x3a5a7a }], ['gloves', { col: 0xf2c020 }], ['badge', { col: 0xd8dce0 }], ['boots', { col: 0x2a2a2a }]] };
// Judge Dr. Okafor: teal blazer, silver bob, glasses, bow tie, judge badge.
export const JUDGE = { skin: 0x7a4a2e, shirt: 0x1a7a7a, shirtStyle: 'blazer', pants: 0x1a2a2a, pantsStyle: 'plain', hair: 'bob', hairCol: 0xc8c8cc,
  outfit: ['glasses', ['bowtie', { col: 0xf2c030 }], ['badge', { col: 0xf2c030 }]] };
// background kids (no lines)
export const KIDS = [
  { skin: 'yellow', shirt: 0x2aa84a, shirtStyle: 'stripes', pants: 0x2a2a2a, pantsStyle: 'jeans', hair: 'spiky', hairCol: 0x3a2412, outfit: [['backpack', { col: 0xf25a1a }]] },
  { skin: 'pale', shirt: 0xf27aa8, shirtStyle: 'tee', pants: 0x3a3a5a, pantsStyle: 'plain', hair: 'puffs', hairCol: 0xc85a1a, freckles: true },
];
export const CAST = { Benji: BENJI, Dex: DEX, Priya: PRIYA, 'Mr. Gus': GUS, 'Judge Okafor': JUDGE, 'Kid A': KIDS[0], 'Kid B': KIDS[1] };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const benji = (S, face, pos, ry = 0) => mk(S, BENJI, 'benji', face, pos, ry, 0.9);
export const dex = (S, face, pos, ry = 0) => mk(S, DEX, 'dex', face, pos, ry, 0.97);
export const priya = (S, face, pos, ry = 0) => mk(S, PRIYA, 'priya', face, pos, ry, 0.88);
export const gus = (S, face, pos, ry = 0) => mk(S, GUS, 'gus', face, pos, ry, 1.08);
export const judge = (S, face, pos, ry = 0) => mk(S, JUDGE, 'judge', face, pos, ry, 1.04);
export const kid = (S, i, face, pos, ry = 0) => mk(S, KIDS[i], 'kid' + i, face, pos, ry, 0.88);
export const buddy = (S, s = 0.55, name = 'sponge') => spongeBuddy(S, { name, s });
export const foam = (S, s = 1) => foamMonster(S, { name: 'foam', s });

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
// hop arc between two points (u 0..1), height h
export const arc = (a, b, u, h = 1) => new THREE.Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + Math.sin(Math.PI * clamp01(u)) * h, a[2] + (b[2] - a[2]) * u);
