// Episode 006 (Day Creatures) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, creature, outfit } from '../../engine/kit.js';

// Ivy, 11 (narrator): a night-town kid — sage field jacket, headlamp, orange backpack, boots, dark braids
export const IVY = { skin: 'brown', shirt: 0x4a7a5a, shirtStyle: 'jacket', pants: 0x2a2a3e, hair: 'braids', hairCol: 0x24140a, rosy: true,
  outfit: ['headlamp', ['backpack', { col: 0xe8743a }], ['boots', { col: 0x5a3a22 }]] };
export const IVY_BED = { ...IVY, outfit: [] };
// Pip, 6: yellow sun-striped pajamas, curly hair, freckles (sunglasses when he finally goes out)
export const PIP = { skin: 'brown', shirt: 0xf2c420, shirtStyle: 'stripes', pants: 0xf2c420, pantsStyle: 'plain', hair: 'curly', hairCol: 0x120a06, freckles: true, rosy: true };
export const PIP_OUT = { ...PIP, outfit: [['sunglasses', {}]] };
// Grandma Rue: moon-tanning grandma — white perm, wrinkles, sunglasses, pink tee, teal shorts
export const RUE = { skin: 'light', shirt: 0xf27aa8, shirtStyle: 'tee', pants: 0x3ab0c0, pantsStyle: 'plain', hair: 'perm', hairCol: 0xf2f2ee, wrinkles: true, outfit: ['sunglasses'] };
// Ms. Pike: night-school teacher — black bun, glasses, plum blazer, scarf
export const PIKE = { skin: 'yellow', shirt: 0x6a2a5a, shirtStyle: 'blazer', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'bun', hairCol: 0x0a0a0a, outfit: ['glasses', ['scarf', { col: 0xf2b830 }]] };
// townsfolk
export const FARMER = { skin: 'tan', shirt: 0xb83a2a, shirtStyle: 'plaid', pants: 0x3a5a8a, hair: 'crew', hairCol: 0x6a4a2a, beard: 'full', beardCol: 0x6a4a2a, outfit: ['cowboyhat', 'overalls'] };
export const KIDS = [
  { skin: 'pale', shirt: 0x3a8ad8, shirtStyle: 'hoodie', pants: 0x2a3a2a, hair: 'pigtails', hairCol: 0xe8b860, freckles: true, outfit: [['beanie', { col: 0xe8584a }]] },
  { skin: 'yellow', shirt: 0xe8584a, shirtStyle: 'tee', pants: 0x2a2a3a, hair: 'short', hairCol: 0x1a1a1a, outfit: [['cap', { col: 0x2a6ae8, back: true }]] },
  { skin: 'tan', shirt: 0x8a5ad8, shirtStyle: 'sweater', pants: 0x3a3a3a, hair: 'ponytail', hairCol: 0x6a2a10 },
];
export const CAST = { Ivy: IVY, Pip: PIP_OUT, 'Grandma Rue': RUE, 'Ms. Pike': PIKE, Farmer: FARMER, 'Kid 1': KIDS[0], 'Kid 2': KIDS[1] };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const pip = (S, face, pos, ry = 0, out = true) => mk(S, out ? PIP_OUT : PIP, 'pip', face, pos, ry, 0.74);
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
export const allowGround = (S, ...names) => { S.userData.allowContact = [...(S.userData.allowContact || []), ...names.flatMap(n => [[n, 'ground'], [n, 'road'], [n, 'box 200x0.3*'], [n, 'box 260x0.3*']])]; };

// the day creature (owner's R2 reference, 'husk'). frozen(k): 0 = awake (eyes lit), 1 = frozen stiff in shade (eyes dark, desaturated)
export function husk(S, name = 'husk', { size = 1, seed = 1 } = {}) {
  allowGround(S, name);
  const c = creature(S, { kind: 'husk', name, size, seed });
  const mats = new Set(); c.root.traverse(m => { if (m.isMesh && m.material.isMeshStandardMaterial) mats.add(m.material); });
  const base = [...mats].map(m => [m, m.color.clone()]);
  let freezeT = null, lastMood = 'lurk';
  c.freeze = (k) => { c.eyesOn(1 - k); base.forEach(([m, col]) => { m.color.copy(col).lerp(new THREE.Color(0x6a6a70).multiply(col).multiplyScalar(1.2), k * 0.55); }); };
  // move(t, mood, frozenAt): animate, but hold the pose from frozenAt on (stiff, no breathing)
  c.move = (t, mood = 'lurk', frozenAt = null) => { const tt = frozenAt != null && t > frozenAt ? frozenAt : t; c.animate(tt, mood); };
  return c;
}
// arms straight out like a scarecrow, head lolled (call after animate/move)
export function scarecrow(c, tilt = 0.35) { c.joints.arms.forEach(({ sh, el }, i) => { const s = i ? 1 : -1; sh.rotation.z = s * 1.42; sh.rotation.x = 0; el.rotation.x = -0.1; }); c.head.rotation.z = tilt; c.head.rotation.x = 0.25; }
// lying in bed on your back, head toward -z: head at (x, y+?, zHead)
export function lie(A, x, zHead, top = 1.7, s = 1) { A.root.rotation.set(-Math.PI / 2, 0, 0); A.root.position.set(x, top + 0.5 * s, zHead + 4.64 * s); }
export const RUN = (t, k = 1) => { const w = { rLeg: Math.sin(t * 15) * 55, lLeg: -Math.sin(t * 15) * 55, rFwd: -Math.sin(t * 15) * 60, lFwd: Math.sin(t * 15) * 60, bob: Math.abs(Math.cos(t * 15)) * 0.25, lean: 14 };
  for (const k2 in w) w[k2] *= k; return w; };
// sit up in bed: k 0 = lying on the back (head toward -z at zHead), 1 = sitting upright, legs along the mattress. Pivots at the hips.
export function sitUp(A, x, zHead, k, top = 1.7) { const th = -Math.PI / 2 * (1 - k), hz = zHead + 2.64, hy = top + 0.5;
  A.root.rotation.set(th, 0, 0); A.root.position.set(x, hy - 2 * Math.cos(th), hz - 2 * Math.sin(th)); return { rLeg: 90 * k, lLeg: 90 * k }; }
