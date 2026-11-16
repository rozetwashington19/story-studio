// Episode 003 shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, std, box, camPath, promiseString, pinky, kidRoomDay, bedroom, kitchen, houseFront, T2, fedora } from '../../engine/kit.js';

export const ROSA = { skin: 'light', shirt: 0x2fa89a, shirtStyle: 'tee', pants: 0x5a3a8a, hair: 'bun', hairCol: 0xb5501e };
export const GRAMPS = { skin: 'light', shirt: 0xd8a83a, shirtStyle: 'blazer', pants: 0x5a4a3a, pantsStyle: 'plain', hair: 'short', hairCol: 0xe8e8e8 };
export const MOM = { skin: 'light', shirt: 0x8a3a6a, shirtStyle: 'shirt', pants: 0x2c2c38, pantsStyle: 'plain', hair: 'long', hairCol: 0x161010 };
export const DAD = { skin: 'light', shirt: 0x3a8a4a, shirtStyle: 'shirt', pants: 0x4a4036, pantsStyle: 'plain', hair: 'short', hairCol: 0x5a3a1a };
export const BENNY = { skin: 'light', shirt: 0xf28a30, shirtStyle: 'tee', pants: 0x2a4a8a, hair: 'spiky', hairCol: 0xb5501e };
export const ORTIZ = { skin: 'brown', shirt: 0x3a6ab8, shirtStyle: 'shirt', pants: 0x2a3a5a, pantsStyle: 'plain', hair: null };
export const PRIYA = { skin: 'brown', shirt: 0xe86ab0, shirtStyle: 'hoodie', pants: 0x1a1a2a, hair: 'long', hairCol: 0x0a0505 };
export const KIDS = [
  { skin: 'yellow', shirt: 0x6a4ad0, shirtStyle: 'tee', pants: 0x3a3a3a, hair: 'short', hairCol: 0x222222 },
  { skin: 'tan', shirt: 0xe8c040, shirtStyle: 'hoodie', pants: 0x2a4a6a, hair: 'long', hairCol: 0x4a2a10 },
  { skin: 'pale', shirt: 0x4ab06a, shirtStyle: 'plain', pants: 0x4a3a2a, hair: 'spiky', hairCol: 0xe8c66a },
  { skin: 'brown', shirt: 0xd84a4a, shirtStyle: 'tee', pants: 0x1a1a2a, hair: 'bun', hairCol: 0x120a05 },
];
export const SCALE = { benny: 0.8, little: 0.66 };

// mk(S, preset, name, face, pos, ry, scale)
export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); A.root.scale.setScalar(scale); return A; };
export const grampsHat = (A) => fedora(A, 0x6a4a32);
export const head = (x, z, y = 4.64) => [x, y, z];
// face close-up on head h=[x,y,z], camera from +z side
export const close = (cam, p, h, { side = 0.4, dist = 6.6, lens = 34, push = 0.8, up = 0.2 } = {}) => (dist = Math.max(dist, 6.4),
  camPath(cam, p, [h[0] + side, h[1] + up, h[2] + dist], [h[0] + side * 0.7, h[1] + up - 0.05, h[2] + dist - push], [h[0], h[1] - 0.3, h[2]], [h[0], h[1] - 0.28, h[2]], lens));
// close-up from the direction a character FACES (rotation ry in degrees). h = head centre [x,y,z]. side = offset to the character's left (+) / right (-)
export function faceCam(cam, p, h, ry, { dist = 6.8, lens = 34, side = 0.8, up = 0.2, push = 0.8, look = -0.3 } = {}) {
  const fx = Math.sin(ry * D), fz = Math.cos(ry * D), rx = fz, rz = -fx;
  const at = d => [h[0] + fx * d + rx * side, h[1] + up, h[2] + fz * d + rz * side];
  camPath(cam, p, at(dist), at(dist - push), [h[0], h[1] + look, h[2]], [h[0], h[1] + look + 0.02, h[2]], lens);
}
export const fill = (S, pos, i = 6, col = 0xffd8b0) => { const p = new THREE.PointLight(col, i, 14, 1.6); p.position.set(...pos); S.add(p); return p; };
// Rosa's room string exits through the bedroom window (kidRoomDay/bedroom window at x=-3.5, y=5.5, back wall)
export const WINDOW_OUT = [-3.5, 5.6, -10];
// string from an avatar's pinky to a point, with sag
export function tie(S, A, to, { sag = 0.8, fade = 1, side = 'R', col, r } = {}) {
  const s = promiseString(S, col ? { col } : {});
  const o = { s, update(opts = {}) { s.set(pinky(A, side), to, { sag, fade, r: r ?? 0.06, ...opts }); return s; } };
  return o;
}
// string between two avatars' pinkies
export function link(S, A, B, { sag = 0.6, sideA = 'R', sideB = 'R', col } = {}) {
  const s = promiseString(S, col ? { col } : {});
  return { s, update(opts = {}) { s.set(pinky(A, sideA), pinky(B, sideB), { sag, ...opts }); return s; } };
}
// crayon drawing sheet (plane) — kind 0 stick family, 1 sun, 2 house, 3 kite
const drawTex = {};
export function drawing(S, kind = 0, w = 1.0) {
  if (!drawTex[kind]) {
    const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d');
    x.fillStyle = ['#fffaf0', '#fff6d8', '#eef6ff', '#fff0f4'][kind]; x.fillRect(0, 0, 192, 192); x.lineWidth = 8; x.lineCap = 'round'; x.lineJoin = 'round';
    const L = (col, pts) => { x.strokeStyle = col; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); };
    if (kind === 0) { for (const [cx, s] of [[60, 1], [130, 0.75]]) { x.strokeStyle = '#3a6ad8'; x.beginPath(); x.arc(cx, 70 + (1 - s) * 50, 18 * s, 0, 7); x.stroke(); L('#3a6ad8', [[cx, 90 + (1 - s) * 50], [cx, 150]]); L('#3a6ad8', [[cx - 22 * s, 115], [cx + 22 * s, 115]]); } }
    else if (kind === 1) { x.strokeStyle = '#f2a030'; x.beginPath(); x.arc(96, 96, 34, 0, 7); x.stroke(); for (let k = 0; k < 10; k++) L('#f2a030', [[96 + Math.cos(k * .63) * 48, 96 + Math.sin(k * .63) * 48], [96 + Math.cos(k * .63) * 70, 96 + Math.sin(k * .63) * 70]]); }
    else if (kind === 2) { L('#d8302a', [[40, 100], [96, 50], [152, 100]]); L('#3a3a3a', [[50, 100], [50, 160], [142, 160], [142, 100]]); L('#3a9a3a', [[10, 175], [182, 175]]); }
    else { L('#d8302a', [[96, 30], [140, 90], [96, 160], [52, 90], [96, 30]]); L('#f2b830', [[96, 160], [110, 185]]); L('#3a6ad8', [[30, 185], [70, 130]]); }
    x.fillStyle = 'rgba(255,255,255,0.75)'; x.fillRect(76, 0, 40, 16);
    drawTex[kind] = new THREE.CanvasTexture(c); drawTex[kind].colorSpace = THREE.SRGBColorSpace;
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w), std({ map: drawTex[kind], side: THREE.DoubleSide, roughness: 0.8 })); S.add(m); return m;
}
// autumn leaves drifting down in a volume; returns updater
export function leaves(S, [x0, x1], [y0, y1], [z0, z1], n = 40, wind = 0) {
  const cols = [0xe8702a, 0xd8a030, 0xc0402a, 0xf2c040]; const L = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.25), std({ color: cols[i % 4], side: THREE.DoubleSide })); S.add(m);
    m.userData.o = [x0 + ((i * 37) % 100) / 100 * (x1 - x0), ((i * 61) % 100) / 100, z0 + ((i * 53) % 100) / 100 * (z1 - z0)]; L.push(m); }
  return t => L.forEach((m, i) => { const [x, f, z] = m.userData.o; const yy = y1 - (((f * (y1 - y0)) + t * 1.4) % (y1 - y0));
    m.position.set(x + Math.sin(t * 1.5 + i) * 0.6 + wind * t, yy, z + Math.cos(t + i) * 0.3); m.rotation.set(t * 2 + i, t * 1.3 + i, t + i); });
}
// school frontage: a brick building with a SCHOOL sign, placed at z (front face)
export function schoolFront(S, x, z) {
  const brick = std({ color: 0xb8583a, roughness: 0.9 });
  box(S, [26, 12, 6], [x, 6, z - 3], brick, { r: 0, cast: false, solid: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.4), std({ map: T2.sign('SCHOOL', '#1f3f7a', '#ffe14a') })); sign.position.set(x, 9.6, z + 0.05); S.add(sign);
  const win = std({ color: 0xa8c8e8, emissive: 0x5a7aa0, emissiveIntensity: 0.4 });
  for (const wx of [-9, -4.5, 4.5, 9]) box(S, [3, 3, 0.1], [x + wx, 5.2, z + 0.05], win, { r: 0, cast: false, solid: false });
  box(S, [4, 6, 0.1], [x, 3, z + 0.05], std({ color: 0x3a5a8a }), { r: 0, cast: false, solid: false });
}
// kitchen with a counter run + sink on the back wall (room front at z=11). Sink basin centre (0, 3, -7.6).
import { room, repeatMat, T, interiorLight, sink, ladder } from '../../engine/kit.js';
export function sinkKitchen(S) {
  room(S, { wallCol: 0xe8d8a8, floorTex: repeatMat(T.tiles(0xf2efe6, 0x6a9ab8), 8, 8), zBack: -9, d: 20 });
  interiorLight(S, { col: 0xfff0d8, pos: [0, 8, -1], intensity: 60, hemi: 1.25 });
  const cab = std({ color: 0x6a9a8a }), top = std({ color: 0xe8e4dc, roughness: 0.4 });
  for (const [x, w] of [[-5.25, 6.5], [4.0, 4]]) { box(S, [w, 2.8, 1.8], [x, 1.4, -7.6], cab, { r: 0.04, name: 'cabinet' }); box(S, [w, 0.2, 2.0], [x, 2.9, -7.6], top, { r: 0.03, name: 'counter' }); }
  const d = sink(S, [0, -7.6]);
  box(S, [3.6, 2.6, 0.1], [0, 6.0, -8.85], std({ color: 0xcfe8ff, emissive: 0xbfe0ff, emissiveIntensity: 1.1 }), { r: 0, cast: false, solid: false });
  box(S, [4.0, 3.0, 0.08], [0, 6.0, -8.9], std({ color: 0xffffff }), { r: 0, cast: false, solid: false });
  box(S, [2.6, 7.2, 2.2], [7.4, 3.6, -7.8], std({ color: 0xf2f4f6, roughness: 0.35 }), { r: 0.15, name: 'fridge' });
  box(S, [6, 0.25, 1.0], [-5.5, 6.3, -8.4], std({ map: T.planks(0x9a6a40) }), { r: 0.03, solid: false });
  [0xd84a3a, 0x3a8ad8, 0xf2c230].forEach((c, i) => box(S, [0.7, 0.9, 0.7], [-7 + i * 1.4, 6.9, -8.4], std({ color: c }), { r: 0.2, solid: false }));
  // toolbox Dad never opened
  box(S, [1.6, 0.9, 0.8], [-6.5, 3.45, -7.6], std({ color: 0xc8302a }), { r: 0.08, solid: false });
  return d;
}
