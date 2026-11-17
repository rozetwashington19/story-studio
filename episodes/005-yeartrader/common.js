// Episode 005 (The Year Trader) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, addPose, idle, lifeClock, longSleeve, grayHair, pinky } from '../../engine/kit.js';

export const KAI = { skin: 'light', shirt: 0x2a8a8a, shirtStyle: 'hoodie', pants: 0x2a2a34, hair: 'short', hairCol: 0x1a120c, rosy: true };
export const MOM = { skin: 'brown', shirt: 0x7a3a4a, shirtStyle: 'shirt', pants: 0x34344a, pantsStyle: 'plain', hair: 'lowbun', hairCol: 0x120a06 };
export const VESPER = { skin: 'pale', shirt: 0x2a4a3a, shirtStyle: 'blazer', pants: 0x22222a, pantsStyle: 'plain', hair: 'balding', hairCol: 0xeeeeea, beard: 'walrus', wrinkles: true };
export const GOLDWIN = { skin: 'light', shirt: 0xe85a9a, shirtStyle: 'blazer', pants: 0xf2f0ea, pantsStyle: 'plain', hair: 'perm', hairCol: 0xe8dcb0, rosy: true };
export const BENNY = { skin: 'tan', shirt: 0xd83a2a, shirtStyle: 'tee', pants: 0x3a5a8a, hair: 'spiky', hairCol: 0xc0502a, freckles: true, beard: 'mustache', beardCol: 0xc0502a };
export const STRANGER = { skin: 'brown', shirt: 0x5a5a62, shirtStyle: 'blazer', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'receding', hairCol: 0x6e6a66, beard: 'stubble' };
export const EXTRAS = [
  { skin: 'light', shirt: 0x3a5a9a, shirtStyle: 'shirt', pants: 0x3a3a3a, pantsStyle: 'plain', hair: 'bob', hairCol: 0x8a3a1a },
  { skin: 'tan', shirt: 0xc8a050, shirtStyle: 'hoodie', pants: 0x2a2a3a, hair: 'buzz', hairCol: 0x141010 },
  { skin: 'pale', shirt: 0x6a3a8a, shirtStyle: 'tee', pants: 0x2a3a2a, hair: 'ponytail', hairCol: 0xd9a441 },
];
export const BABY = { skin: 'yellow', shirt: 0xf2e8a0, shirtStyle: 'plain', pants: 0xf2e8a0, pantsStyle: 'plain', hair: 'tuft', hairCol: 0x1a120c, rosy: true };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
// cast with their clocks
export function kai(S, face, pos, ry = 0, { years = 90, gray = 0, light = 1.2 } = {}) { const A = mk(S, KAI, 'kai', face, pos, ry); A.clock = lifeClock(A, { years, light }); if (gray) grayHair(A, gray); return A; }
export function mom(S, face, pos, ry = 0, { years = 3, sleeve = 0, gray = 0.0, light = 1.2 } = {}) { const A = mk(S, MOM, 'mom', face, pos, ry);
  A.clock = lifeClock(A, { years, col: years < 10 ? 0xff5a4a : 0x5ae8ff, light }); A.sleeve = longSleeve(A, 'L', 0x7a3a4a); const pl = A.sleeve.pull; A.sleeve.pull = (k) => { pl(k); A.clock.hide(k < 0.3); if (A.clock.light) A.clock.light.visible = k >= 0.3; }; A.sleeve.pull(sleeve); if (gray) grayHair(A, gray); return A; }
export function vesper(S, face, pos, ry = 0) { const A = mk(S, VESPER, 'vesper', face, pos, ry); A.clock = lifeClock(A, { years: 12, light: 0 }); return A; }
export const clockOf = (A, years, opts = {}) => (A.clock = lifeClock(A, { years, light: 0, ...opts }));

export const head = (x, z, y = 4.64) => [x, y, z];
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const V = (a) => new THREE.Vector3(...a);
// close-up from the direction a character FACES (ry deg). h = head centre. side = offset to the character's left (+) / right (-)
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffd8b0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };
// poses
export const WRIST = { lFwd: 72, lUp: -28, nod: 20, turn: 14 };            // looking down at the left-wrist clock
export const SHOW = { lFwd: 95, lUp: -12, nod: 6 };                         // holding the wrist up toward the camera
export const SHIVER = (t, k = 1) => ({ bob: Math.sin(t * 31) * 0.012 * k, tilt: Math.sin(t * 27) * 1.2 * k });
export const tremble = (t, k = 1) => ({ rUp: Math.sin(t * 38) * 2.5 * k, rFwd: Math.sin(t * 33) * 2 * k });
export const holdAt = (obj, A, side = 'R', off = [0, 0, 0]) => { const p = pinky(A, side); obj.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); };
