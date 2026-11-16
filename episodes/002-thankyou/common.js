// Episode 002 shared cast + helpers
import * as THREE from 'three';
import { makeAvatar, add, D, growScale, std, box, room, repeatMat, T, interiorLight } from '../../engine/kit.js';

export const JUNO = { skin: 'brown', shirt: 0xf0b52e, shirtStyle: 'hoodie', pants: 0x3a5a8a, hair: 'long', hairCol: 0x24110a };
export const SWEATER = { ...JUNO, shirt: 0x5f9a3a, shirtStyle: 'plain' };
export const THEO = { skin: 'brown', shirt: 0x3c3f46, shirtStyle: 'hoodie', pants: 0x1d1d22, hair: 'spiky', hairCol: 0x111111 };
export const MOM = { skin: 'brown', shirt: 0x2f8f6f, shirtStyle: 'shirt', pants: 0x2c2c38, pantsStyle: 'plain', hair: 'bun', hairCol: 0x1a0d05 };
export const DAD = { skin: 'brown', shirt: 0xd4683a, shirtStyle: 'tee', pants: 0x4a4036, pantsStyle: 'plain', hair: 'short', hairCol: 0x111111 };
export const GRAN = { skin: 'brown', shirt: 0xb04a8a, shirtStyle: 'blazer', pants: 0x5a4a5a, pantsStyle: 'plain', hair: 'bun', hairCol: 0xdedede };
export const TEACHER = { skin: 'yellow', shirt: 0x4a8ad0, shirtStyle: 'shirt', pants: 0x2a2a30, pantsStyle: 'plain', hair: 'long', hairCol: 0x101010 };
export const LUNCH = { skin: 'pale', shirt: 0xf4f4f4, shirtStyle: 'plain', pants: 0x6a8aa8, pantsStyle: 'plain', hair: 'bun', hairCol: 0xc0502a };
export const BEA = { skin: 'light', shirt: 0xe05a8a, shirtStyle: 'plain', pants: 0x3a3a5a, pantsStyle: 'plain', hair: 'long', hairCol: 0xe8c66a };
export const POST = { skin: 'tan', shirt: 0x2a4a8a, shirtStyle: 'shirt', pants: 0x2a4a8a, pantsStyle: 'plain', hair: 'short', hairCol: 0x3a2410, hat: false };
export const KIDS = [
  { skin: 'light', shirt: 0x8ad04a, shirtStyle: 'tee', pants: 0x2b3f8a, hair: 'short', hairCol: 0xa8541a },
  { skin: 'tan', shirt: 0xd04a6a, shirtStyle: 'hoodie', pants: 0x202020, hair: 'bun', hairCol: 0x2a1a0a },
  { skin: 'yellow', shirt: 0x6a4ad0, shirtStyle: 'tee', pants: 0x4a4d57, hair: 'spiky', hairCol: 0x222222 },
  { skin: 'pale', shirt: 0x3ab0b0, shirtStyle: 'plain', pants: 0x3a3028, hair: 'long', hairCol: 0x6a3a1a },
];

export const mk = (S, o, name, face, pos, ry = 0, extra = {}) => add(S, makeAvatar({ ...o, name, face, ...extra }), pos, ry);
// scale-in a prop/flower: base size stored at first call
export function pop(g, t, t0, d = 0.4) {
  if (g.userData.base === undefined) g.userData.base = g.scale.x;
  g.scale.setScalar(g.userData.base * growScale((t - t0) / d));
  if (g.userData.head) g.userData.head.rotation.z = Math.sin(t * 2.2 + g.position.x) * 0.12;
}
export function sway(gs, t) { gs.forEach((g, i) => { if (g.userData.head) g.userData.head.rotation.z = Math.sin(t * 1.8 + i * 1.7) * 0.12; g.rotation.z = Math.sin(t * 1.3 + i) * 0.03; }); }
const _v = new THREE.Vector3();
export function hand(A, side = 'R') { A.root.updateMatrixWorld(true); (side === 'R' ? A.armR : A.armL).children[1].getWorldPosition(_v); return _v.clone(); }
// school lunch line: counter (top y 2.6, front z=-4.4) with trays of food. Lunch lady stands behind at z≈-6.5.
export function lunchLine(S) {
  room(S, { wallCol: 0xf0e2b8, floorTex: repeatMat(T.tiles(0xf2efe6, 0xd96b5a), 8, 6), zBack: -9, w: 22, d: 20 });
  interiorLight(S, { col: 0xfff6e8, pos: [0, 8, -1], intensity: 75, hemi: 1.3 });
  const steel = std({ color: 0xb8bcc2, metalness: 0.6, roughness: 0.35 });
  box(S, [10, 2.5, 1.6], [-1, 1.25, -5.2], steel, { r: 0.05, name: 'counter' });
  box(S, [10.4, 0.15, 1.9], [-1, 2.55, -5.2], std({ color: 0xd8dce0, metalness: 0.5, roughness: 0.3 }), { r: 0.03, name: 'counter top' });
  const glass = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.3, roughness: 0.05 });
  box(S, [10, 0.08, 1.2], [-1, 4.0, -5.0], glass, { r: 0, cast: false, solid: false, rot: [-0.3, 0, 0] });
  for (const [x, c] of [[-4, 0xf2c230], [-1.5, 0x8a5a2a], [1, 0x6ab04a], [3, 0xe8e0d0]]) box(S, [1.8, 0.2, 1.0], [x, 2.7, -5.3], std({ color: c, roughness: 0.6 }), { r: 0.05, solid: false });
  box(S, [8, 1.4, 0.1], [-1, 6.5, -8.85], std({ map: (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 180; const x = c.getContext('2d'); x.fillStyle = '#2a6a3a'; x.fillRect(0, 0, 1024, 180); x.fillStyle = '#fff4c0'; x.font = '700 110px Inter'; x.textAlign = 'center'; x.fillText('LUNCH', 512, 135); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() }), { r: 0, cast: false, solid: false });
}
// little tray of fries held in a hand
export function fries(S) {
  const g = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.4), std({ color: 0xd8302a })); g.add(cup);
  const fm = std({ color: 0xf2c84a, roughness: 0.6 });
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.08), fm); f.position.set(-0.22 + (i % 5) * 0.11, 0.4 + (i % 3) * 0.05, (i % 2) * 0.12 - 0.06); f.rotation.z = (i % 3 - 1) * 0.15; g.add(f); }
  S.add(g); return g;
}
export function sandwich(S) {
  const g = new THREE.Group(); const br = std({ color: 0xe8c890 });
  [[0, br], [0.1, std({ color: 0x6ab04a })], [0.17, std({ color: 0xe86a4a })], [0.27, br]].forEach(([y, m]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), m); b.position.y = y; g.add(b); });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.6, 0.05, 24), std({ color: 0xfafafa })); plate.position.y = -0.08; g.add(plate);
  S.add(g); return g;
}
export function clockSign(S, text, pos, s = 1) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 220; const x = c.getContext('2d');
  x.fillStyle = '#111'; x.fillRect(0, 0, 512, 220); x.fillStyle = '#ff4a3a'; x.font = '700 150px Inter'; x.textAlign = 'center'; x.fillText(text, 256, 165);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4 * s, 1.0 * s), new THREE.MeshBasicMaterial({ map: t })); m.position.set(...pos); S.add(m); return m;
}
