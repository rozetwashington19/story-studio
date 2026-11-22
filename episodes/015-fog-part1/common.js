// Episode 015 (THE FOG, Part 1) — re-exports the series cast + small helpers (copied from 014's common.js).
import * as THREE from 'three';
import { D, camPath, pinky } from '../../engine/kit.js';
export { YOU, NELL, ABE, PELL, PIP, you, nell, abe, pell, pip, biscuit, mk } from '../series/fog/cast.js';
import { CAST as SCAST } from '../series/fog/cast.js';
export const CAST = SCAST; export const CAST_SET = 'night';
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
