// Episode 019 (THE FOG, Part 3) — re-exports the series cast + small helpers (copied from 014's common.js).
import * as THREE from 'three';
import { D, camPath, pinky } from '../../engine/kit.js';
export { YOU, NELL, ABE, PELL, PIP, DOT, you, nell, abe, pell, pip, dot, biscuit, mk } from '../series/fog/cast.js';
import { CAST as SCAST } from '../series/fog/cast.js';
export const CAST_SET = 'night';
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
export const RUN = (t, k = 1, sp = 15) => { const w = { rLeg: Math.sin(t * sp) * 55, lLeg: -Math.sin(t * sp) * 55, rFwd: -Math.sin(t * sp) * 60, lFwd: Math.sin(t * sp) * 60, bob: Math.abs(Math.cos(t * sp)) * 0.25, lean: 14 };
  for (const k2 in w) w[k2] *= k; return w; };
export const shake = (cam, t, t0, k = 1) => { const u = t - t0; if (u < 0 || u > 0.7) return; const a = Math.exp(-u * 6) * 0.25 * k; cam.position.x += Math.sin(u * 60) * a; cam.position.y += Math.sin(u * 47 + 1) * a; };
export const far = (cam, f = 900) => { if (cam.far !== f) { cam.far = f; cam.updateProjectionMatrix(); } };
// Part 2 extras (one-offs, not series cast): the fogged mailman, jogger, dog walker (+ his dog), young Abe (flashback, 30 years ago), pier crowd
import { makeAvatar, add, pup } from '../../engine/kit.js';
export const MAIL = { skin: 'brown', shirt: 0x7aa8d8, shirtStyle: 'uniform', pants: 0x1e2a4a, pantsStyle: 'plain', hair: 'crew', hairCol: 0x1a1210, beard: 'stubble',
  outfit: [['cap', { col: 0x1e2a4a }], ['satchel', { col: 0x6a4a2a }], ['boots', { col: 0x1a1a1a }]] };
export const JOG = { skin: 'yellow', shirt: 0x8ad82a, shirtStyle: 'tee', pants: 0x1a1a22, pantsStyle: 'plain', hair: 'ponytail', hairCol: 0x1a1a1a,
  outfit: [['headband', { col: 0xf2f2f2 }], ['wristband', { col: 0x8ad82a }]] };
export const WALKER = { skin: 'light', shirt: 0xa84a2a, shirtStyle: 'plaid', pants: 0x4a4a3a, pantsStyle: 'jeans', hair: 'receding', hairCol: 0x9a9aa0, beard: 'full', beardCol: 0x9a9aa0, wrinkles: true,
  outfit: [['vest', { col: 0xf28a3a }], ['boots', { col: 0x3a2a1a }]] };
export const YOUNGABE = { skin: 'brown', shirt: 0x2a3a6a, shirtStyle: 'jacket', pants: 0x3a3a44, pantsStyle: 'plain', hair: 'crew', hairCol: 0x1a1210, beard: 'mustache', beardCol: 0x1a1210,
  outfit: [['hardhat', { col: 0xf2c420, hair: true }], ['badge', { col: 0xf2f2f2 }], ['boots', { col: 0x3a2a1a }]] };
export const CROWD = [
  { skin: 'tan', shirt: 0xd86a8a, shirtStyle: 'sweater', pants: 0x3a3a5a, hair: 'bob', hairCol: 0x6a3a1a },
  { skin: 'light', shirt: 0x3a8a6a, shirtStyle: 'hoodie', pants: 0x2a2a3a, hair: 'swoop', hairCol: 0xd8b060 },
  { skin: 'brown', shirt: 0xf2c84a, shirtStyle: 'shirt', pants: 0x4a3a2a, hair: 'afro', hairCol: 0x1a1210 }];
export const mail = (S, face, pos, ry = 0) => add(S, makeAvatar({ ...MAIL, name: 'mailman', face }), pos, ry);
export const jogger = (S, face, pos, ry = 0) => add(S, makeAvatar({ ...JOG, name: 'jogger', face }), pos, ry);
export const walker = (S, face, pos, ry = 0) => add(S, makeAvatar({ ...WALKER, name: 'walker', face }), pos, ry);
export const youngAbe = (S, face, pos, ry = 0) => { const A = add(S, makeAvatar({ ...YOUNGABE, name: 'youngabe', face }), pos, ry); A.root.scale.setScalar(1.05); return A; };
export const crowd = (S, i, face, pos, ry = 0) => add(S, makeAvatar({ ...CROWD[i], pantsStyle: 'plain', name: 'crowd' + i, face }), pos, ry);
export const walkerDog = (S) => pup(S, { name: 'walkerdog', col: 0xf2efe6, spot: 0x2a2a2e });
export const CAST = { You: SCAST.You, Abe: SCAST.Abe, Dot: SCAST.Dot, Nell: SCAST.Nell, Pip: SCAST.Pip, 'Young Abe': YOUNGABE };
// ---- animation-pass helpers (Fable 5.2 update, 2026-11-26) ----
import { addPose as _add, lookAt as _look, walk as _walk } from '../../engine/kit.js';
export const ps = (...a) => a.reduce((x, y) => _add(x, y), {});
// scaled eyeline: head turn/nod toward a world point (k < 1 keeps faces readable)
export const eyes = (A, p, k = 0.6) => { const l = _look(A, p); return { turn: l.turn * k, nod: l.nod * k }; };
// the dog's head follows a world point (call after B.update)
export const dogLook = (B, p, k = 1) => { B.root.updateMatrixWorld(true); const l = B.root.worldToLocal(new THREE.Vector3(p[0], p[1], p[2])); B.head.rotation.y = clamp01(k) * Math.max(-1.1, Math.min(1.1, Math.atan2(l.x, l.z))); B.head.rotation.x += -clamp01(k) * Math.max(-0.5, Math.min(0.7, Math.atan2(l.y - 1.9, Math.hypot(l.x, l.z)))); };
// careful steps while carrying something: legs + bob only, speed v in studs/s matched to the stride (no foot sliding)
export const carryWalk = (t, v = 1, amp = 14) => { const w = _walk(t, v / 2.47, amp); return { rLeg: w.rLeg, lLeg: w.lLeg, bob: w.bob * 0.7, tilt: Math.sin(t * 8 * v / 2.47) * 2, lean: 5 }; };
