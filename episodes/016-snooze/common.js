// Episode 016 (Snooze) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky, alarmClock } from '../../engine/kit.js';

// Dash, 16 (narrator): the clockmaker's sleepy son — orange track jacket, big black afro, teal headphones, yellow wristband, white sneakers.
export const DASH = { skin: 'brown', shirt: 0xf2761a, shirtStyle: 'jacket', pants: 0x2a3a5a, pantsStyle: 'jeans', hair: 'afro', hairCol: 0x16100c,
  outfit: [['headphones', { col: 0x2a8a9a }], ['wristband', { col: 0xf2c420 }], ['boots', { col: 0xf6f6f2 }]] };
export const DASH_SHADES = { ...DASH, outfit: [...DASH.outfit, ['sunglasses', { col: 0x111111 }]] };
// Dad, the clockmaker: light-blue shirt, leather apron, goggles on the forehead, salt-and-pepper crew cut + goatee, PINK FLUFFY SLIPPERS.
export const DAD = { skin: 'brown', shirt: 0x8ab0d8, shirtStyle: 'shirt', pants: 0x4a3a2a, pantsStyle: 'plain', hair: 'crew', hairCol: 0x8a8680, beard: 'goatee', beardCol: 0x8a8680,
  outfit: [['apron', { col: 0x7a4a24 }], ['goggles', { col: 0x5a3a1a }], ['boots', { col: 0xf6a8c8 }]] };
// Grandma Opal: mustard cardigan, white bun, wrinkles, teal scarf, glasses.
export const OPAL = { skin: 'brown', shirt: 0xd8a020, shirtStyle: 'sweater', pants: 0x6a4a6a, pantsStyle: 'plain', hair: 'bun', hairCol: 0xf2f2f0, wrinkles: true,
  outfit: [['scarf', { col: 0x2a8a9a }], 'glasses', ['boots', { col: 0x6a2a3a }]] };
// Mr. Bram, next door: lime running tee, ginger receding hair + full beard, red headband + wristbands, blue running shoes.
export const BRAM = { skin: 'pale', shirt: 0x8ad83a, shirtStyle: 'tee', pants: 0x3a3a4a, pantsStyle: 'plain', hair: 'receding', hairCol: 0xc85a1a, beard: 'full', beardCol: 0xc85a1a,
  outfit: [['headband', { col: 0xd8302a }], ['wristband', { col: 0xd8302a }], ['boots', { col: 0x2a6ae8 }]] };
// Ms. Vance, driving examiner: navy blazer, sleek black bob, gold badge, sunglasses pushed up.
export const VANCE = { skin: 'light', shirt: 0x1a2a5a, shirtStyle: 'blazer', pants: 0x1a2a5a, pantsStyle: 'plain', hair: 'bob', hairCol: 0x120a06,
  outfit: [['badge', { col: 0xf2c030 }], ['sunglasses', { up: true, col: 0x1a1a1a }]] };
// commuter (no lines): striped pajamas, messy blond spiky hair, bunny slippers
export const COMMUTER = { skin: 'light', shirt: 0x8ab8f2, shirtStyle: 'stripes', pants: 0x8ab8f2, pantsStyle: 'plain', hair: 'spiky', hairCol: 0xe8c060, beard: 'stubble', beardCol: 0xc8a050,
  outfit: [['boots', { col: 0xf6f6f2 }], ['tie', { col: 0xd8302a }]] };
export const CAST = { Dash: DASH, Dad: DAD, 'Grandma Opal': OPAL, 'Mr. Bram': BRAM, 'Ms. Vance': VANCE, Commuter: COMMUTER };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const dash = (S, face, pos, ry = 0, o = DASH) => mk(S, o, 'dash', face, pos, ry, 0.95);
export const dad = (S, face, pos, ry = 0) => mk(S, DAD, 'dad', face, pos, ry, 1.05);
export const opal = (S, face, pos, ry = 0) => mk(S, OPAL, 'opal', face, pos, ry, 0.92);
export const bram = (S, face, pos, ry = 0) => mk(S, BRAM, 'bram', face, pos, ry, 1.0);
export const vance = (S, face, pos, ry = 0) => mk(S, VANCE, 'vance', face, pos, ry, 1.0);
export const commuter = (S, face, pos, ry = 0) => mk(S, COMMUTER, 'commuter', face, pos, ry, 1.0);
// clocks
export const GIANT = 6;
export const dashClock = (S, s = 0.5, name = 'clock') => { if (name === 'giant') S.userData.allowContact = [...(S.userData.allowContact || []), ['giant', 'road'], ['giant', 'lot'], ['giant', 'roof']]; return alarmClock(S, { name, s, col: 0xd8302a, bell: 0xf2c030, seed: 3 }); };
export const dadClock = (S, s = 0.6) => alarmClock(S, { name: 'dadclock', s, col: 0x2a6ae8, bell: 0xdfe3ea, seed: 5 });
export const bramClock = (S, i, s = 0.55) => alarmClock(S, { name: 'bramclock' + i, s, col: i ? 0x2aa84a : 0x5ac85a, bell: 0xf2c030, seed: 7 + i });
export const opalClock = (S, s = 0.42) => alarmClock(S, { name: 'opalclock', s, col: 0x9a7ac8, bell: 0xe8d8b0, glasses: true, seed: 9 });
export const commuterClock = (S, s = 0.55) => alarmClock(S, { name: 'cclock', s, col: 0xf2a020, bell: 0xdfe3ea, seed: 11 });

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
export const JOG = (t, k = 1) => { const w = { rLeg: Math.sin(t * 9) * 35, lLeg: -Math.sin(t * 9) * 35, rFwd: 70 - Math.sin(t * 9) * 25, lFwd: 70 + Math.sin(t * 9) * 25, rUp: -10, lUp: -10, bob: Math.abs(Math.cos(t * 9)) * 0.15, lean: 6 };
  for (const k2 in w) w[k2] *= k; return w; };
export const shake = (cam, t, t0, k = 1) => { const u = t - t0; if (u < 0 || u > 0.7) return; const a = Math.exp(-u * 6) * 0.25 * k; cam.position.x += Math.sin(u * 60) * a; cam.position.y += Math.sin(u * 47 + 1) * a; };
export const rumble = (cam, t, k = 1) => { cam.position.x += Math.sin(t * 31) * 0.06 * k; cam.position.y += Math.sin(t * 27 + 1) * 0.06 * k; };
export const arc = (a, b, u, h = 1) => new THREE.Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + Math.sin(Math.PI * clamp01(u)) * h, a[2] + (b[2] - a[2]) * u);
// lying on the back in bed, head toward -z
export function lie(A, x, zHead, top = 1.9, s = 0.95) { A.root.rotation.set(-Math.PI / 2, 0, 0); A.root.position.set(x, top + 0.5 * s, zHead + 4.64 * s); }
// a seated rider on top of the giant clock (between the bells): returns world pos of the seat
export function riderSeat(C) { C.root.updateMatrixWorld(true); return new THREE.Vector3(0, 1.25, 0.1).applyMatrix4(C.body.matrixWorld); }
