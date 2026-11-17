// Episode 004 (The Echo Woods) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, std, box, camPath, forest, creature, monster, tent, campfire, logSeat, lantern } from '../../engine/kit.js';

export const TOBI = { skin: 'brown', shirt: 0xf2b420, shirtStyle: 'hoodie', pants: 0x2a5a4a, hair: 'curly', hairCol: 0x120a06, rosy: true };
export const WREN = { skin: 'pale', shirt: 0xe8584a, shirtStyle: 'shirt', pants: 0x2a3a6a, hair: 'pigtails', hairCol: 0xe8c66a, freckles: true };
export const BRAM = { skin: 'tan', shirt: 0x5a6a3a, shirtStyle: 'shirt', pants: 0x9a8a62, pantsStyle: 'plain', hair: 'crew', hairCol: 0x3a2414, beard: 'full' };
export const DAD = { skin: 'brown', shirt: 0x3a6ab8, shirtStyle: 'shirt', pants: 0x3a3a40, pantsStyle: 'plain', hair: 'buzz', hairCol: 0x0a0806, beard: 'mustache' };
export const DARA = { skin: 'yellow', shirt: 0xd8302a, shirtStyle: 'tee', pants: 0x1a1a2a, pantsStyle: 'plain', hair: 'bob', hairCol: 0x0a0a0a };
export const KIDS = [
  { skin: 'tan', shirt: 0x3aa8d8, shirtStyle: 'tee', pants: 0x3a3a3a, hair: 'swoop', hairCol: 0xb5501e },
  { skin: 'light', shirt: 0x8a4ad0, shirtStyle: 'hoodie', pants: 0x2a4a6a, hair: 'braids', hairCol: 0x4a2a10 },
  { skin: 'yellow', shirt: 0x4ab06a, shirtStyle: 'tee', pants: 0x4a3a2a, hair: 'spiky', hairCol: 0x1a1a1a },
  { skin: 'brown', shirt: 0xf27a9a, shirtStyle: 'hoodie', pants: 0x1a1a2a, hair: 'ponytail', hairCol: 0x120a05 },
];
// mk(S, preset, name, face, pos, ry)
export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const head = (x, z, y = 4.64) => [x, y, z];
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
// close-up from the direction a character FACES (ry deg). h = head centre. side = offset to the character's left (+) / right (-)
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffd8b0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };

// feet resting on the floor is intended contact for creatures
export const allowGround = (S, ...names) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...names.flatMap(n => [[n, 'ground'], [n, 'box 120x0.3*'], [n, 'box 18x0.3*']])]; };
// echo creatures
export const blob = (S, name = 'blob') => (allowGround(S, name), monster(S, { name, col: 0xf28a3a, belly: 0xffe0b0, eyes: 1, horns: false, teeth: true, size: 1.25, seed: 4 }));
export const fluff = (S, name = 'fluff', size = 1.25) => (allowGround(S, name), monster(S, { name, col: 0x9a6ad8, belly: 0xd8c0ff, eyes: 2, horns: true, teeth: false, spots: true, size, seed: 7 }));
export const calm = (S, name = 'calm') => (allowGround(S, name), monster(S, { name, col: 0x8ad0ea, belly: 0xe0f6ff, shape: 'tall', eyes: 2, horns: false, teeth: false, size: 0.75, seed: 9 }));

// the giant "Nothing scares me" echo (brute). Extra controls: heavy(k) eyelids 0..1, sleep(k) curl-up 0..1, breathe(t)
export function giant(S, { size = 1.75 } = {}) {
  allowGround(S, 'giant');
  const g = creature(S, { kind: 'brute', name: 'giant', col: 0x3a2c4a, eyeCol: 0xffd040, size, seed: 4 });
  const eyes = []; g.head.traverse(m => { if (m.isMesh && m.material.isMeshBasicMaterial && m.material.color.getHex() === 0xffd040) eyes.push(m); });
  const base = eyes.map(e => e.scale.clone()); const J = g.joints; let sleepK = 0;
  g.heavy = (k) => eyes.forEach((e, i) => { e.scale.set(base[i].x, Math.max(0.02, base[i].y * (1 - k * 0.95)), base[i].z); });
  // call AFTER animate(): sits down and curls up
  g.sleep = (k, t = 0) => { sleepK = k; if (k <= 0) return;
    J.hips.position.y = J.hips.position.y * (1 - k) + 0.9 * k + Math.sin(t * 1.6) * 0.06 * k;
    J.legs.forEach((l, i) => { l.position.y = 2.2 * (1 - k) + 1.0 * k; l.rotation.x = -1.4 * k; l.rotation.z = (i ? 1 : -1) * 0.4 * k; });
    J.body.rotation.x = J.body.rotation.x * (1 - k) + 0.75 * k; J.body.scale.setScalar(1 + Math.sin(t * 1.6) * 0.03 * k);
    J.arms.forEach(({ sh, el }, i) => { sh.rotation.x = sh.rotation.x * (1 - k) - 0.9 * k; sh.rotation.z = sh.rotation.z * (1 - k) + (i ? -0.35 : 0.35) * k; el.rotation.x = el.rotation.x * (1 - k) - 1.2 * k; });
    g.head.rotation.x = g.head.rotation.x * (1 - k) + 0.35 * k; g.head.rotation.z = g.head.rotation.z * (1 - k) + 0.25 * k; };
  return g;
}

// simple pine (for filling views toward +z, where the forest world has no trees)
export function pine(S, [x, z], h = 9, col = 0x22483a) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, h * 0.35, 8), std({ color: 0x3a2a1a })); tr.position.y = h * 0.17; g.add(tr);
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(h * (0.3 - i * 0.07), h * 0.42, 9), std({ color: col, roughness: 0.9 })); c.position.y = h * (0.38 + i * 0.2); c.castShadow = true; g.add(c); }
  return g;
}

// night camp in the Echo Woods. Log seat along x at z=-2.2 (seat top 1.0), fire at (0, 2.3), tents at the sides.
export function camp(S, { tents = true, fire = true, frontTrees = false } = {}) {
  const env = forest(S, { night: true });
  let cf = null; if (fire) cf = campfire(S, [0, 2.6]);
  if (tents) { tent(S, [-9.8, -6.5], { col: 0xe8743a, ry: 25, name: 'tentA', glow: true }); tent(S, [9.8, -7], { col: 0x4a9a6a, ry: -25, name: 'tentB' }); }
  logSeat(S, [0, -2.2], { len: 7.6 });
  lantern(S, [-4.6, 0, -1.2], { intensity: 5 });
  box(S, [1.0, 0.6, 0.7], [6.0, 0.3, -1.8], std({ color: 0x3a6ab8 }), { r: 0.15, name: 'backpack' });
  box(S, [0.9, 0.5, 0.6], [6.8, 0.25, -0.9], std({ color: 0xd85a3a }), { r: 0.15, name: 'backpack2' });
  for (const [x, z, c] of [[-6.5, 1.5, 0x6a3a8a], [6.8, 1.8, 0x3a8a8a]]) box(S, [2.2, 0.35, 4.2], [x, 0.18, z], std({ color: c, roughness: 0.95 }), { r: 0.15, solid: false });   // sleeping bags
  if (frontTrees) for (const [x, z, h] of [[-10, 16, 10], [-5, 21, 11], [2, 24, 12], [8, 19, 10], [13, 14, 9], [-14, 12, 9], [16, 22, 12], [-18, 20, 11]]) pine(S, [x, z], h);
  return { update: (t) => { env.update(t); if (cf) cf.userData.update(t); }, fire: cf };
}
