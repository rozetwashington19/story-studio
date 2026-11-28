// Episode 024 (My Cat Got My Promotion) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, addPose, houseCat, bigPup, toteBag, HAIR_COLORS } from '../../engine/kit.js';

// Nina, 26 (narrator): curly space buns (owner model `curlybuns`), freckles, mustard sweater, jeans, rust boots, teal wristband. Interview look: teal blazer + visitor badge.
export const NINA = { skin: 'tan', shirt: 0xe8a820, shirtStyle: 'sweater', pants: 0x3a4a7a, pantsStyle: 'jeans', hair: 'curlybuns', hairCol: HAIR_COLORS.darkbrown, freckles: true,
  outfit: [['boots', { col: 0x8a3a22 }], ['wristband', { col: 0x2aa8a0 }], ['belt', { col: 0x5a3a22 }]] };
export const NINA_WORK = { ...NINA, shirt: 0x1f8a8a, shirtStyle: 'blazer', pants: 0x26282e, pantsStyle: 'plain', outfit: [['boots', { col: 0x1a1a1e }], ['wristband', { col: 0x1a1a1e }], ['badge', { col: 0xf2c420 }]] };
// Mrs. Stone, 50s (CEO, fires people for blinking): very long platinum hair over one shoulder (owner model `overshoulder`), crimson power blazer, black trousers, glasses, gold belt.
export const STONE = { skin: 'light', shirt: 0x8a1e28, shirtStyle: 'blazer', pants: 0x1a1a1e, pantsStyle: 'plain', hair: 'overshoulder', hairCol: HAIR_COLORS.platinum, wrinkles: true,
  outfit: ['glasses', ['belt', { col: 0xd8a848 }], ['boots', { col: 0x1a1a1e }]] };
// Dr. Moon, 30s (the vet, deadpan goth): blunt black bangs + spiked lace headdress (owner model `gothic`), pale, purple scrubs, lab coat, blue exam gloves.
export const VET = { skin: 0xf0dccf, shirt: 0x6a3a9a, shirtStyle: 'tee', pants: 0x4a2a6a, pantsStyle: 'plain', hair: 'gothic', hairCol: HAIR_COLORS.black,
  outfit: ['labcoat', ['gloves', { col: 0x7ac8e8 }], ['badge', { col: 0xc8ccd4 }], ['boots', { col: 0x1a1a1e }]] };
// Mr. Finch, 70s (the neighbour who wanted sugar): neat grey crop (owner model `crop`), walrus moustache, wrinkles, green cardigan-sweater, tan trousers, bow tie, vest.
export const FINCH = { skin: 'light', shirt: 0x4a8a5a, shirtStyle: 'sweater', pants: 0xb89a6a, pantsStyle: 'plain', hair: 'crop', hairCol: HAIR_COLORS.gray, beard: 'walrus', wrinkles: true, rosy: true,
  outfit: [['bowtie', { col: 0xd8302a }], ['vest', { col: 0x3a6a48 }], ['boots', { col: 0x5a3a22 }]] };
// Dev, 20s (Mrs. Stone's assistant, never takes the headphones off): ginger curly mop + grey headphones (owner models `curlymop` + `grayphones`), lime hoodie, grey jeans.
export const DEV = { skin: 'yellow', shirt: 0x7ad84a, shirtStyle: 'hoodie', pants: 0x4a4e5a, pantsStyle: 'jeans', hair: 'curlymop', hairCol: HAIR_COLORS.ginger,
  outfit: ['grayphones', ['boots', { col: 0xf2f2ee }], ['wristband', { col: 0x1a1a1e }]] };
export const CAST = { Nina: NINA, 'Nina (interview)': NINA_WORK, 'Mrs. Stone': STONE, 'Dr. Moon': VET, 'Mr. Finch': FINCH, Dev: DEV };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); A.s = scale; return A; };
export const nina = (S, face, pos, ry = 0, work = false) => mk(S, work ? NINA_WORK : NINA, 'nina', face, pos, ry, 1.0);
export const stone = (S, face, pos, ry = 0) => mk(S, STONE, 'stone', face, pos, ry, 1.04);
export const vet = (S, face, pos, ry = 0) => mk(S, VET, 'vet', face, pos, ry, 1.0);
export const finch = (S, face, pos, ry = 0) => mk(S, FINCH, 'finch', face, pos, ry, 0.98);
export const dev = (S, face, pos, ry = 0) => mk(S, DEV, 'dev', face, pos, ry, 0.98);
export const cat = (S, face, pos, ry = 0, s = 1) => { const c = houseCat(S, { name: 'beans', face, s }); c.root.position.set(...pos); c.root.rotation.y = ry * D; return c; };
export const poodle = (S, pos, ry = 0, s = 0.42) => { const d = bigPup(S, { name: 'poodle', s, col: 0xf6f2ea, ear: 0xe0d4c0, snout: 0xffffff, collar: 0xd8302a }); d.root.position.set(...pos); d.root.rotation.y = ry * D; return d; };
// the pet tote with the cat riding in it (cat head pokes out of the open top). `.at(x, y, z, ry)`, `.cat`, `.bag`
export function catBag(S, face = 'grumpy') { const bag = toteBag(S); bag.scale.setScalar(1.15); const c = houseCat(S, { name: 'beans', face, s: 0.78 }); const o = { bag, cat: c, up: 0,
  at: (x, y, z, ry = 0) => { bag.position.set(x, y, z); bag.rotation.y = ry * D; c.root.position.set(x, y + 0.2 + o.up, z - 0.15); c.root.rotation.y = ry * D; } }; return o; }

export const ps = (...a) => a.reduce((x, y) => addPose(x, y), {});
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const sm = (t, a, b) => { const x = ramp(t, a, b); return x * x * (3 - 2 * x); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const V = (a) => new THREE.Vector3(...a);
export const headOf = (A) => { A.root.updateMatrixWorld(true); return A.headMesh.getWorldPosition(new THREE.Vector3()); };
export const place = (A, x, y, z, ry) => { A.root.position.set(x, y, z); if (ry !== undefined) A.root.rotation.y = ry * D; };
// close-up from the front / 3-4 of a head at h, facing ry
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
export const look = (l, k = 0.45) => ({ turn: l.turn * k, nod: l.nod * k });
// a human body with a cat driving: sitting on the floor like a cat (use with root y −1.5), paws planted between the knees
export const CATSIT = { rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, rUp: -8, lUp: -8, lean: 12 };
// standing "paws up" (wrists at the chest), a little hunched
export const PAWS = { rFwd: 62, lFwd: 62, rUp: -10, lUp: -10, lean: 8, nod: -4 };
export const catIdle = (t) => ({ tilt: Math.sin(t * 1.3) * 7, turn: Math.sin(t * 0.8) * 6, bob: Math.sin(t * 2.4) * 0.03 });
