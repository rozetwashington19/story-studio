// Episode 014 (Cabin Seven) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, pinky } from '../../engine/kit.js';

// Sol, 15 (narrator): striker for Kell FC — green #7 jersey with a white V-collar, black shorts-pants, black cleats, white wristband, black mohawk.
export const SOL = { skin: 'tan', shirt: 0x23884a, shirtStyle: 'jersey7', pants: 0x1c1c22, pantsStyle: 'plain', hair: 'mohawk', hairCol: 0xf0c860,
  outfit: [['boots', { col: 0x1a1a1e }], ['wristband', { col: 0xf6f6f2 }]] };
// Mom (Ines), the cable-car operator: red work jacket with a gold badge, dark trousers, brown boots, dark-brown low bun.
export const MOM = { skin: 'tan', shirt: 0xd02a26, shirtStyle: 'jacket', pants: 0x2a2a36, pantsStyle: 'plain', hair: 'lowbun', hairCol: 0x2a1408,
  outfit: [['badge', { col: 0xf2c420 }], ['boots', { col: 0x6a3a1a }], ['scarf', { col: 0x2a3a5a }]] };
// the swap: you keep your face (head + hair); everything else is theirs
const HEAD = ({ skin, hair, hairCol, beard, wrinkles, freckles, rosy }) => ({ skin, hair, hairCol, beard, wrinkles, freckles, rosy });
const BODY = ({ shirt, shirtStyle, pants, pantsStyle, outfit }) => ({ shirt, shirtStyle, pants, pantsStyle, outfit });
export const SOL_AS_MOM = { ...BODY(MOM), ...HEAD(SOL) };
export const MOM_AS_SOL = { ...BODY(SOL), ...HEAD(MOM) };
// Otto, the old lift mechanic: mustard beanie, big white beard, orange overalls over a blue plaid shirt, work gloves.
export const OTTO = { skin: 'pale', shirt: 0x2a5a9a, shirtStyle: 'plaid', pants: 0x4a3a2a, pantsStyle: 'plain', hair: 'balding', hairCol: 0xe8e8e8, beard: 'full', beardCol: 0xf2f2f2, wrinkles: true,
  outfit: [['beanie', { col: 0xd8a020 }], ['overalls', { col: 0xd8702a }], ['gloves', { col: 0x7a5a3a }], ['boots', { col: 0x3a2414 }]] };
// Mrs. Pike: silver perm, glasses, pink cardigan. Swapped: the mailman's blue uniform, cap and satchel.
export const PIKE = { skin: 'light', shirt: 0xe87aa8, shirtStyle: 'sweater', pants: 0x6a5a7a, pantsStyle: 'plain', hair: 'perm', hairCol: 0xc8c8cc, wrinkles: true, outfit: ['glasses'] };
export const MAIL = { skin: 'brown', shirt: 0x2a4a8a, shirtStyle: 'uniform', pants: 0x2a3450, pantsStyle: 'plain', hair: 'crew', hairCol: 0x120a06, beard: 'mustache',
  outfit: [['cap', { col: 0x2a4a8a }], ['satchel', { col: 0x8a5a2a }]] };
export const PIKE_AS_MAIL = { ...BODY(MAIL), ...HEAD(PIKE), outfit: ['glasses', ['cap', { col: 0x2a4a8a }], ['satchel', { col: 0x8a5a2a }]] };
// Mr. Dunn: ginger slick hair + stubble, grey suit, red tie. Baby Dunn: ginger tuft, yellow onesie. Swapped: Dad in the onesie + bonnet bow, baby in the suit.
export const DUNN = { skin: 'light', shirt: 0x5a5e6a, shirtStyle: 'blazer', pants: 0x4a4e58, pantsStyle: 'plain', hair: 'slick', hairCol: 0xc85a1a, beard: 'stubble', beardCol: 0xa84a1a,
  outfit: [['tie', { col: 0xc8302a }]] };
export const BABY = { skin: 'light', shirt: 0xf6e08a, shirtStyle: 'plain', pants: 0xf6e08a, pantsStyle: 'plain', hair: 'tuft', hairCol: 0xd8702a, rosy: true };
export const DUNN_AS_BABY = { ...BODY(BABY), ...HEAD(DUNN), outfit: [['bow', { col: 0x8ad0f2 }]] };
export const BABY_AS_DUNN = { ...BODY(DUNN), ...HEAD(BABY) };
// players + ref (no lines)
export const MATES = [
  { skin: 'brown', shirt: 0x23884a, shirtStyle: 'jersey4', pants: 0x1c1c22, pantsStyle: 'plain', hair: 'buzz', hairCol: 0x120a06, outfit: [['boots', { col: 0xf6f6f2 }]] },
  { skin: 'pale', shirt: 0x23884a, shirtStyle: 'jersey10', pants: 0x1c1c22, pantsStyle: 'plain', hair: 'ponytail', hairCol: 0xe8c060, outfit: [['boots', { col: 0x1a1a1e }]] },
  { skin: 'yellow', shirt: 0xf27a1a, shirtStyle: 'jersey9', pants: 0xfafafa, pantsStyle: 'plain', hair: 'spiky', hairCol: 0x2a1a10, outfit: [['boots', { col: 0x1a1a1e }]] },
  { skin: 0x8a5a3a, shirt: 0xf27a1a, shirtStyle: 'jersey1', pants: 0xfafafa, pantsStyle: 'plain', hair: 'afro', hairCol: 0x120a06, outfit: [['gloves', { col: 0x2ad84a }]] },
];
export const CAST = { Sol: SOL, Mom: MOM, 'Sol (as Mom)': SOL_AS_MOM, 'Mom (as Sol)': MOM_AS_SOL, Otto: OTTO, 'Mrs. Pike': PIKE, Mailman: MAIL, 'Pike (swapped)': PIKE_AS_MAIL,
  'Mr. Dunn': DUNN, 'Dunn (swapped)': DUNN_AS_BABY, Baby: BABY };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const sol = (S, face, pos, ry = 0, swapped = false) => mk(S, swapped ? SOL_AS_MOM : SOL, 'sol', face, pos, ry, 0.95);
export const mom = (S, face, pos, ry = 0, swapped = false) => mk(S, swapped ? MOM_AS_SOL : MOM, 'mom', face, pos, ry, 1.0);
export const otto = (S, face, pos, ry = 0) => mk(S, OTTO, 'otto', face, pos, ry, 1.03);
export const mate = (S, i, face, pos, ry = 0) => mk(S, MATES[i], 'mate' + i, face, pos, ry, 0.95);

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
// a swap "poof": expanding sparkle ring at a point (k 0..1)
export function poof(S, n = 18, col = 0xfff2b0) { const g = new THREE.Group(); S.add(g); const ps = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), new THREE.MeshBasicMaterial({ color: col, transparent: true })); g.add(m); ps.push(m); }
  g.set = (pos, k) => { g.visible = k > 0 && k < 1; ps.forEach((m, i) => { const a = i / n * Math.PI * 2, r = 0.6 + k * 3.2; m.position.set(pos.x + Math.cos(a) * r, pos.y + Math.sin(a * 2 + i) * 0.8 * k + (i % 3 - 1) * k * 1.5, pos.z + Math.sin(a) * r * 0.6);
    m.scale.setScalar(1.4 * (1 - k)); m.rotation.set(k * 6 + i, k * 4, 0); m.material.opacity = 1 - k; }); };
  g.set(new THREE.Vector3(), 0); return g; }
