// Episode 007 (See-Through) shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, camPath, fade, swaddle } from '../../engine/kit.js';

// Hazel, 10 (narrator): teal striped tee, auburn puffs with a yellow bow, freckles, and bright red sneakers (the last thing left of her when she fades)
export const HAZEL = { skin: 'tan', shirt: 0x2ab0a0, shirtStyle: 'stripes', pants: 0x34405a, hair: 'puffs', hairCol: 0x7a2a12, freckles: true, rosy: true,
  outfit: [['bow', { col: 0xf2c420 }], ['boots', { col: 0xe8302a }]] };
// Mom: tired new mom — lavender cardigan, long auburn hair, slippers
export const MOM = { skin: 'light', shirt: 0x9a82c8, shirtStyle: 'sweater', pants: 0x3a3a52, pantsStyle: 'plain', hair: 'long', hairCol: 0x6a2a14 };
// Dad: green plaid, crew cut, stubble, glasses
export const DAD = { skin: 'tan', shirt: 0x3a7a4a, shirtStyle: 'plaid', pants: 0x5a4a3a, pantsStyle: 'plain', hair: 'crew', hairCol: 0x1a120c, beard: 'stubble', outfit: ['glasses'] };
// Bo: baby brother in a blue swaddle
export const BO = { skin: 'tan', shirt: 0x9ad0f2, shirtStyle: 'plain', pants: 0x9ad0f2, pantsStyle: 'plain', hair: 'tuft', hairCol: 0x5a2a14, rosy: true };
// Mister Fig: vain old neighbour — silver combover, walrus mustache, wrinkles, mustard vest + bow tie, hand mirror
export const FIG = { skin: 'pale', shirt: 0xf2eee0, shirtStyle: 'shirt', pants: 0x5a4a6a, pantsStyle: 'plain', hair: 'combover', hairCol: 0xc8c8cc, beard: 'walrus', beardCol: 0xd8d8dc, wrinkles: true,
  outfit: [['vest', { col: 0xd8a030 }], ['bowtie', { col: 0xc82a3a }]] };
// Miss Dottie: lunch lady — brown skin, salt-and-pepper afro under a hairnet-style headband, red apron, white uniform
export const DOTTIE = { skin: 'brown', shirt: 0xf6f4ee, shirtStyle: 'uniform', pants: 0x2a2a34, pantsStyle: 'plain', hair: 'afro', hairCol: 0x8a8682, rosy: true,
  outfit: [['apron', { col: 0xd83a3a }], ['headband', { col: 0xf2f2f2 }]] };
// Mr. Ortiz: teacher — navy blazer, tie, receding hair
export const ORTIZ = { skin: 'yellow', shirt: 0x2a3a6a, shirtStyle: 'blazer', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'receding', hairCol: 0x1a1a1a, outfit: [['tie', { col: 0xd8a030 }]] };
export const KIDS = [
  { skin: 'pale', shirt: 0xe8743a, shirtStyle: 'hoodie', pants: 0x2a3a5a, hair: 'swoop', hairCol: 0xe8c860, outfit: [['backpack', { col: 0x3a8ad8 }]] },
  { skin: 'brown', shirt: 0xd85a9a, shirtStyle: 'tee', pants: 0x3a3a3a, hair: 'braids', hairCol: 0x120a06 },
  { skin: 'light', shirt: 0x6a5ad8, shirtStyle: 'sweater', pants: 0x2a2a2a, hair: 'short', hairCol: 0x4a2a14, freckles: true, outfit: ['glasses'] },
];
export const CAST = { Hazel: HAZEL, Mom: MOM, Dad: DAD, 'Mister Fig': FIG, 'Miss Dottie': DOTTIE, 'Mr. Ortiz': ORTIZ, 'Kid 1': KIDS[0], 'Kid 2': KIDS[1] };

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const hazel = (S, face, pos, ry = 0, k = 1) => { const A = mk(S, HAZEL, 'hazel', face, pos, ry); if (k !== 1) ghost(A, k); return A; };
// a fading person whose face stays a little more readable than the body (k = body solidity)
export const ghost = (A, k, glowK = 0.7) => fade(A, { head: Math.min(1, k + 0.3), body: k, armR: k, armL: k, legR: k, legL: k }, { glowK });
export const mom = (S, face, pos, ry = 0, k = 1) => { const A = mk(S, MOM, 'mom', face, pos, ry); if (k !== 1) fade(A, k); return A; };
export const dad = (S, face, pos, ry = 0) => mk(S, DAD, 'dad', face, pos, ry);
export const fig = (S, face, pos, ry = 0, legs = 0.05) => { const A = mk(S, FIG, 'fig', face, pos, ry); fade(A, { legR: legs, legL: legs }); return A; };
// baby Bo, swaddled, small (scale 0.42): held in arms, the bundle sits at the holder's chest
export const bo = (S, face, pos, ry = 0, s = 0.42) => { const A = mk(S, BO, 'bo', face, pos, ry, s); swaddle(A); A.pose({ rFwd: 60, lFwd: 60, rUp: -20, lUp: -20 }); return A; };
// put Bo in someone's arms (A facing ry): bundle lies across the chest
export function cradle(B, A, k = 0) { A.root.updateMatrixWorld(true); const p = A.body.localToWorld(new THREE.Vector3(0.0, 1.0, 1.25 + k));
  B.root.position.copy(p).add(new THREE.Vector3(0, -2.0 * B.root.scale.x, 0)); B.root.rotation.set(0, A.root.rotation.y, 0); B.root.rotateZ(1.2); B.root.position.y += 0.4; }
export const HOLD = { rFwd: 70, lFwd: 70, rUp: -32, lUp: -32, nod: 16 };   // arms cradling a baby
export const head = (x, z, y = 4.64) => [x, y, z];
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const V = (a) => new THREE.Vector3(...a);
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffd8b0, dist = 14) => { const p = new THREE.PointLight(col, i, dist, 1.6); p.position.set(...pos); S.add(p); return p; };
export const headOf = (A) => { A.root.updateMatrixWorld(true); return A.headMesh.getWorldPosition(new THREE.Vector3()); };
