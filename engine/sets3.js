// Sets + props added in episode 002 (Thank You): flowers, cactuses, pots with labels, house front, garage,
// home stairway, toaster, cake, bike, giant sunflower. All exported via kit.js.
import * as THREE from 'three';
import { T, std, box, dayLight, interiorLight, room, repeatMat } from './sets.js';
import { T2 } from './sets2.js';
import { noise } from './avatar.js';

const D = Math.PI / 180;
function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const MC = {}; const mat = (k, o) => MC[k] || (MC[k] = std(o));
const STEM = () => mat('stem', { color: 0x3f9a3a, roughness: 0.7 });

export const FLOWER_COLS = [0xf2f2f2, 0xe8484f, 0xf2c230, 0xe86ab0, 0x8a5ad8, 0xf28a30, 0x4a8ae8];

// A flower standing on y=0 at pos. kind: 'daisy' | 'rose' | 'tulip' | 'sun'. Returns a Group; animate grow with g.scale.
// size 1 = about 1.6 tall. g.userData.head is the bloom group (spin/sway it).
export function flower(S, [x, y, z], { kind = 'daisy', col = 0xf2f2f2, size = 1, ry = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry * D;
  const h = 1.4;
  const stem = mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 8), STEM()); stem.position.y = h / 2; g.add(stem);
  for (const s of [-1, 1]) {
    const lf = mesh(new THREE.SphereGeometry(0.22, 12, 8), STEM()); lf.scale.set(1, 0.25, 0.5); lf.position.set(0.2 * s, h * 0.35 + (s > 0 ? 0.15 : 0), 0); lf.rotation.z = -25 * s * D; g.add(lf);
  }
  const head = new THREE.Group(); head.position.y = h; g.add(head); g.userData.head = head;
  const pm = mat('p' + col + kind, { color: col, roughness: 0.6 });
  if (kind === 'daisy' || kind === 'sun') {
    const n = kind === 'sun' ? 16 : 10, r = kind === 'sun' ? 0.42 : 0.3;
    const ctr = mesh(new THREE.SphereGeometry(kind === 'sun' ? 0.26 : 0.13, 16, 10), mat('ctr' + kind, { color: kind === 'sun' ? 0x5a3214 : 0xf2c230 }));
    ctr.scale.z = 0.5; ctr.position.z = 0.04; head.add(ctr);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2; const p = mesh(new THREE.SphereGeometry(0.12, 10, 6), pm);
      p.scale.set(kind === 'sun' ? 1.0 : 0.8, kind === 'sun' ? 2.0 : 1.6, 0.35); p.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); p.rotation.z = a - Math.PI / 2; head.add(p);
    }
    head.rotation.x = -15 * D;
  } else if (kind === 'rose') {
    const b = mesh(new THREE.SphereGeometry(0.26, 16, 12), pm); b.scale.y = 0.9; head.add(b);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const p = mesh(new THREE.SphereGeometry(0.16, 10, 8), pm); p.position.set(Math.cos(a) * 0.17, -0.06, Math.sin(a) * 0.17); head.add(p); }
  } else { // tulip
    const cup = mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.42, 6, 1, true), mat('tc' + col, { color: col, roughness: 0.6, side: THREE.DoubleSide })); cup.position.y = 0.12; head.add(cup);
    const bot = mesh(new THREE.SphereGeometry(0.17, 12, 8), pm); bot.position.y = -0.08; head.add(bot);
  }
  g.scale.setScalar(size); S.add(g); return g;
}
// grow helper: 0..1 progress -> overshooting scale
export function growScale(p) { if (p <= 0) return 0.001; if (p >= 1) return 1; const s = 1 - Math.pow(1 - p, 3); return s + Math.sin(p * Math.PI) * 0.18; }

// cactus (Roblox-y blocky), optional pink bloom on top. Returns Group (height ~ 1.8*s).
export function cactus(S, [x, y, z], { s = 1, bloom = false, ry = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry * D;
  const cm = mat('cactus', { color: 0x4f8a3a, roughness: 0.75 });
  const body = mesh(new THREE.CapsuleGeometry(0.32, 1.1, 6, 14), cm); body.position.y = 0.87; g.add(body);
  for (const [sx, yy, hh] of [[-1, 0.8, 0.45], [1, 1.05, 0.38]]) {
    const arm = mesh(new THREE.CapsuleGeometry(0.17, 0.3, 4, 10), cm); arm.rotation.z = 90 * D; arm.position.set(sx * 0.48, yy, 0); g.add(arm);
    const up = mesh(new THREE.CapsuleGeometry(0.17, hh, 4, 10), cm); up.position.set(sx * 0.68, yy + hh / 2 + 0.05, 0); g.add(up);
  }
  const sp = mat('spine', { color: 0xf4f0d8 });
  for (let i = 0; i < 14; i++) { const d = mesh(new THREE.SphereGeometry(0.035, 6, 4), sp, false); const a = i * 2.4; d.position.set(Math.cos(a) * 0.33, 0.4 + (i % 7) * 0.18, Math.sin(a) * 0.33); g.add(d); }
  if (bloom) {
    const b = new THREE.Group(); b.position.y = 1.78; g.add(b); g.userData.bloom = b;
    const pm = mat('bloomP', { color: 0xff6aa8, roughness: 0.5, emissive: 0x401020 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const p = mesh(new THREE.SphereGeometry(0.12, 10, 6), pm); p.scale.set(0.8, 1.7, 0.4); p.position.set(Math.cos(a) * 0.16, 0.1, Math.sin(a) * 0.16); p.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); b.add(p); }
    const c = mesh(new THREE.SphereGeometry(0.08, 8, 6), mat('ctr', { color: 0xf2c230 })); c.position.y = 0.12; b.add(c);
  }
  g.scale.setScalar(s); S.add(g); return g;
}
// terracotta pot (top at y + 0.7*s) with optional flower/cactus and a label tag
export function labelTex(text) {
  return ctex(256, 128, (x, w, h) => {
    x.fillStyle = '#fbf6e4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8b890'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
    x.fillStyle = '#2a2a6a'; x.font = 'italic 700 40px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const words = text.split(' '); if (words.length > 1 && x.measureText(text).width > 230) { x.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), w / 2, 42); x.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), w / 2, 88); }
    else x.fillText(text, w / 2, h / 2 + 2);
  });
}
export function pot(S, [x, y, z], { s = 1, kind = 'daisy', col = 0xf2f2f2, label = null, fsize = 1, ry = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry * D;
  const pm = mat('pot', { color: 0xc0623a, roughness: 0.8 });
  const p = mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.7, 16), pm); p.position.y = 0.35; g.add(p);
  const rim = mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.14, 16), pm); rim.position.y = 0.68; g.add(rim);
  const soil = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 16), mat('soil', { color: 0x3a2618 })); soil.position.y = 0.72; g.add(soil);
  if (kind === 'cactus') g.userData.plant = cactus(g, [0, 0.7, 0], { s: 0.55 * fsize });
  else if (kind) g.userData.plant = flower(g, [0, 0.7, 0], { kind, col, size: 0.8 * fsize });
  if (label) {
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshStandardMaterial({ map: labelTex(label), roughness: 0.8 }));
    lb.position.set(0, 0.36, 0.43); lb.rotation.x = -8 * D; g.add(lb); g.userData.label = lb;
  }
  g.scale.setScalar(s); S.add(g); return g;
}
// a dense random bed of flowers inside rect [x0,x1]x[z0,z1] (deterministic). Returns array of groups.
export function flowerBed(S, [x0, x1], [z0, z1], n = 30, { seed = 1, size = [0.8, 1.4], kinds = ['daisy', 'rose', 'tulip', 'daisy'], y = 0 } = {}) {
  let r = seed * 9301 + 49297; const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = kinds[Math.floor(rnd() * kinds.length)];
    out.push(flower(S, [x0 + rnd() * (x1 - x0), y, z0 + rnd() * (z1 - z0)], { kind: k, col: FLOWER_COLS[Math.floor(rnd() * FLOWER_COLS.length)], size: size[0] + rnd() * (size[1] - size[0]), ry: rnd() * 60 - 30 }));
  }
  return out;
}
// giant sunflower (stem height h). Returns {g, head}
export function sunflower(S, [x, y, z], h = 20) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const st = mesh(new THREE.CylinderGeometry(0.6, 0.9, h, 16), mat('bigstem', { color: 0x3f8a32, roughness: 0.7 })); st.position.y = h / 2; g.add(st);
  for (let i = 0; i < 4; i++) { const lf = mesh(new THREE.SphereGeometry(1.6, 16, 10), STEM()); lf.scale.set(1.6, 0.25, 0.8); const s = i % 2 ? 1 : -1; lf.position.set(s * 2.0, h * (0.3 + i * 0.15), 0); lf.rotation.z = -s * 20 * D; g.add(lf); }
  const head = new THREE.Group(); head.position.y = h; g.add(head);
  const ctr = mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.8, 32), mat('sunctr', { color: 0x5a3214, roughness: 0.9 })); ctr.rotation.x = 90 * D; head.add(ctr);
  const pm = mat('sunpet', { color: 0xf6c21a, roughness: 0.55, emissive: 0x3a2800 });
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; const p = mesh(new THREE.SphereGeometry(0.7, 12, 8), pm); p.scale.set(0.9, 2.3, 0.3); p.position.set(Math.cos(a) * 3.6, Math.sin(a) * 3.6, -0.1); p.rotation.z = a - Math.PI / 2; head.add(p); }
  head.rotation.x = -12 * D; S.add(g); return { g, head, stem: st };
}

// ---------- props ----------
export function toaster(S, [x, y, z]) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const m = std({ color: 0xd8dce2, metalness: 0.3, roughness: 0.3 });
  const b = mesh(new RoundBox(1.4, 0.9, 0.8), m); b.position.y = 0.45; g.add(b);
  for (const dx of [-0.3, 0.3]) { const s = mesh(new THREE.BoxGeometry(0.22, 0.05, 0.6), std({ color: 0x111111 })); s.position.set(dx, 0.91, 0); g.add(s); }
  const lever = mesh(new THREE.BoxGeometry(0.1, 0.12, 0.2), std({ color: 0x222222 })); lever.position.set(0.72, 0.6, 0); g.add(lever);
  S.add(g); return g;
}
function RoundBox(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
export function cake(S, [x, y, z], s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const ch = std({ color: 0x5a2e18, roughness: 0.7 }), ic = std({ color: 0xf6e8e0, roughness: 0.5 });
  const t1 = mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 32), ch); t1.position.y = 0.3; g.add(t1);
  const t2 = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 32), ch); t2.position.y = 0.85; g.add(t2);
  const ri = mesh(new THREE.TorusGeometry(0.9, 0.07, 8, 32), ic); ri.rotation.x = 90 * D; ri.position.y = 0.6; g.add(ri);
  const r2 = mesh(new THREE.TorusGeometry(0.62, 0.06, 8, 32), ic); r2.rotation.x = 90 * D; r2.position.y = 1.1; g.add(r2);
  const plate = mesh(new THREE.CylinderGeometry(1.15, 1.05, 0.08, 32), std({ color: 0xfafafa, roughness: 0.3 })); plate.position.y = 0.0; g.add(plate);
  const flame = new THREE.MeshBasicMaterial({ color: 0xffd070 });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const c = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), std({ color: [0xe84a6a, 0x4a8ae8, 0xf2c230][i % 3] })); c.position.set(Math.cos(a) * 0.35, 1.25, Math.sin(a) * 0.35); g.add(c);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), flame); f.scale.y = 1.6; f.position.set(Math.cos(a) * 0.35, 1.46, Math.sin(a) * 0.35); g.add(f); }
  g.scale.setScalar(s); S.add(g); return g;
}
export function bike(S, [x, y, z], { ry = 0, col = 0x2fa8d8, flat = false } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry * D;
  const tire = std({ color: 0x1a1a1a, roughness: 0.8 }), fr = std({ color: col, metalness: 0.4, roughness: 0.4 }), mt = std({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.3 });
  for (const dx of [-1.3, 1.3]) {
    const w = mesh(new THREE.TorusGeometry(0.8, 0.1, 10, 32), tire); w.position.set(dx, 0.9, 0); g.add(w);
    if (flat && dx > 0) { w.scale.y = 0.72; w.position.y = 0.68; }
    const hub = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 10), mt); hub.rotation.x = 90 * D; hub.position.set(dx, w.position.y, 0); g.add(hub);
  }
  const bar = (a, b) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const L = A.distanceTo(B);
    const m = mesh(new THREE.CylinderGeometry(0.07, 0.07, L, 8), fr); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); g.add(m); };
  bar([-1.3, 0.9, 0], [0, 0.9, 0]); bar([0, 0.9, 0], [1.0, 1.9, 0]); bar([-0.4, 1.95, 0], [0, 0.9, 0]); bar([-1.3, 0.9, 0], [-0.4, 1.95, 0]); bar([-0.4, 1.95, 0], [1.0, 1.9, 0]); bar([1.3, 0.9, 0], [1.0, 1.9, 0]); bar([1.0, 1.9, 0], [0.9, 2.3, 0]);
  const hb = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), mt); hb.rotation.x = 90 * D; hb.position.set(0.9, 2.3, 0); g.add(hb);
  const seat = mesh(new THREE.BoxGeometry(0.6, 0.12, 0.3), std({ color: 0x222222 })); seat.position.set(-0.45, 2.1, 0); g.add(seat);
  S.add(g); return g;
}
export function flashlight(S) {
  const g = new THREE.Group();
  const b = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 12), std({ color: 0xd83a2a, roughness: 0.4 })); b.rotation.x = 90 * D; g.add(b);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0xfff6d0 })); lens.rotation.x = 90 * D; lens.position.z = 0.36; g.add(lens);
  const sp = new THREE.SpotLight(0xfff0c8, 160, 30, 0.42, 0.5, 1.2); sp.position.set(0, 0, 0.4); const tg = new THREE.Object3D(); tg.position.set(0, 0, 6); g.add(sp, tg); sp.target = tg;
  g.userData.spot = sp; S.add(g); return g;
}

// ---------- sets ----------
const sidingTex = (col) => T2.siding(col);
// Suburban house front (day). House face at z=-6 (x -14..4), garage at x 4..13 (door face z=-6). Grass lawn + driveway.
// opts: { col: siding css color, garageDoor: bool, porch: bool }
export function houseFront(S, { col = '#e9dcc6', porch = true, sunPos = [-8, 14, 12] } = {}) {
  dayLight(S, { sunPos, area: 26 });
  box(S, [120, 0.3, 80], [0, -0.15, 10], repeatMat(T2.grass(), 14, 10), { r: 0, cast: false });
  box(S, [8.4, 0.31, 24], [8.5, -0.14, 6], repeatMat(T.concrete(0xc0b8ac), 2, 6), { r: 0, cast: false, solid: false });
  box(S, [120, 0.32, 8], [0, -0.13, 22], repeatMat(T.asphalt(), 20, 2), { r: 0, cast: false, solid: false });
  const sid = std({ map: repeatMat(sidingTex(col), 4, 3).map });
  box(S, [18, 10, 10], [-5, 5, -11], sid, { r: 0, cast: false });
  const roof = std({ color: 0x6a3a32, roughness: 0.8 });
  box(S, [19, 0.6, 7.6], [-5, 12.4, -8.2], roof, { r: 0.05, rot: [-38 * D, 0, 0], cast: false });
  box(S, [19, 0.6, 7.6], [-5, 12.4, -13.8], roof, { r: 0.05, rot: [38 * D, 0, 0], cast: false });
  box(S, [9.4, 7.5, 10], [8.6, 3.75, -11], sid, { r: 0, cast: false, name: 'garage' });
  box(S, [10, 0.5, 10.6], [8.6, 7.75, -11], roof, { r: 0.05, cast: false, name: 'garage roof' });
  // garage door
  const gd = std({ color: 0xf4f2ec, roughness: 0.5 });
  box(S, [7, 5.6, 0.2], [8.6, 2.8, -5.92], gd, { r: 0.02, cast: false, name: 'garage door' });
  for (let i = 1; i < 4; i++) box(S, [7, 0.08, 0.06], [8.6, i * 1.4, -5.8], std({ color: 0xc8c6c0 }), { r: 0, cast: false, solid: false });
  // front door + windows
  box(S, [3, 6.4, 0.3], [-1.5, 3.4, -5.9], std({ map: T.planks(0x2f6a8a) }), { r: 0.04, cast: false, name: 'front door' });
  box(S, [3.5, 6.9, 0.2], [-1.5, 3.5, -5.95], std({ color: 0xf6f2ea }), { r: 0.04, cast: false, solid: false });
  const win = std({ color: 0x9ac0e0, emissive: 0x5a7aa0, emissiveIntensity: 0.4, roughness: 0.1 });
  for (const x of [-9, -5.5]) { box(S, [2.8, 2.8, 0.2], [x, 5.2, -5.9], win, { r: 0, cast: false, solid: false }); box(S, [3.2, 3.2, 0.15], [x, 5.2, -5.95], std({ color: 0xf6f2ea }), { r: 0, cast: false, solid: false }); }
  if (porch) {
    box(S, [12, 0.6, 4.2], [-5, 0.3, -3.9], std({ map: repeatMat(T.planks(0x9a7a5a), 2, 1).map }), { r: 0.03, cast: false, name: 'porch deck' });
    for (const x of [-10.6, 0.6]) box(S, [0.4, 6.5, 0.4], [x, 3.55, -2.1], std({ color: 0xf6f2ea }), { r: 0.05, name: 'porch post' });
    box(S, [12, 0.4, 4.4], [-5, 6.9, -4], std({ color: 0x6a3a32 }), { r: 0.04, cast: false, name: 'porch roof' });
  }
  // background trees + fences
  const trunk = std({ color: 0x6a4428 }), leaf = std({ color: 0x3f8a3a });
  for (const [x, z] of [[-24, -14], [22, -16], [-30, -4]]) { box(S, [1, 8, 1], [x, 4, z], trunk, { r: 0.1, solid: false }); box(S, [6, 5, 6], [x, 9, z], leaf, { r: 1.2, solid: false }); }
}
// garage interior: back wall z=-9, side walls x=±9, h 8.5. Door (front) is behind camera. night: dark + moonlight.
export function garage(S, { night = false } = {}) {
  room(S, { w: 18, d: 16, h: 8.5, wallCol: 0x9aa0a4, floorTex: repeatMat(T.concrete(0x8e8a84), 4, 4), zBack: -9, trim: 0x6a6e72 });
  if (night) {
    S.userData.look = 'night'; S.background = new THREE.Color(0x05060c);
    S.add(new THREE.HemisphereLight(0x4a5a90, 0x101018, 0.55));
    const moon = new THREE.DirectionalLight(0x8aa0ff, 0.7); moon.position.set(-8, 7, 4); S.add(moon);
  } else {
    interiorLight(S, { col: 0xfff2d8, pos: [0, 7.8, -3], intensity: 55, hemi: 1.2 });
  }
  // bulb fixture
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), new THREE.MeshBasicMaterial({ color: night ? 0x555555 : 0xfff2c8 })); bulb.position.set(0, 7.9, -3); S.add(bulb);
  const wd = std({ map: T.planks(0x8a6a4a) }), mt = std({ color: 0x5a5e62, metalness: 0.5, roughness: 0.5 });
  // back shelves (3 levels)
  for (const y of [1.6, 3.6, 5.6]) box(S, [16, 0.18, 1.4], [0, y, -8.2], wd, { r: 0.02, name: 'shelf' });
  for (const x of [-7.8, 0, 7.8]) box(S, [0.2, 7.0, 1.4], [x, 3.5, -8.2], mt, { r: 0.02, name: 'shelf post' });
  // workbench right
  box(S, [2.4, 0.25, 6], [7.6, 2.6, -3.5], wd, { r: 0.03, name: 'bench' });
  for (const z of [-6, -1]) box(S, [2.2, 2.5, 0.25], [7.6, 1.25, z], mt, { r: 0.02, name: 'bench leg' });
  box(S, [0.15, 3, 5], [8.75, 5, -3.5], std({ color: 0xb08a5a }), { r: 0, cast: false, name: 'pegboard' });
  // window on left wall
  box(S, [0.1, 2.4, 3], [-8.75, 5.2, -3], std({ color: night ? 0x2a3a70 : 0xcfe8ff, emissive: night ? 0x1a2a60 : 0xbfe0ff, emissiveIntensity: 1.0 }), { r: 0, cast: false, solid: false });
}
// fill the garage with labeled pots: shelves + floor rows left/right, aisle |x|<3 kept clear. Returns all pot groups.
export function garageFlowers(S, labels = []) {
  const out = []; let i = 0;
  const K = ['daisy', 'rose', 'tulip', 'daisy', 'sun'];
  for (const y of [1.69, 3.69, 5.69]) for (let x = -7.2; x <= 7.2; x += 1.15) {
    if (Math.abs(x) < 0.4) continue;
    out.push(pot(S, [x, y, -8.1], { s: 0.85, kind: K[i % 5], col: FLOWER_COLS[(i * 3) % 7], fsize: 0.8 + (i % 3) * 0.15 })); i++;
  }
  for (const z of [-6.4, -5.0, -3.6, -2.2, -0.8, 0.6]) for (const x of [-7.6, -6.3, -5.0, -3.7]) {
    out.push(pot(S, [x, 0, z], { s: 1, kind: K[i % 5], col: FLOWER_COLS[(i * 5) % 7], fsize: 1 + (i % 4) * 0.2 })); i++;
  }
  for (const z of [-6.4, -5.2, -4.0, -2.8, -1.6, -0.4]) { out.push(pot(S, [7.6, 2.72, z], { s: 0.75, kind: K[i % 5], col: FLOWER_COLS[(i * 5) % 7] })); i++; }
  for (const z of [-0.4, 1.0]) for (const x of [4.4, 5.7]) { out.push(pot(S, [x, 0, z], { s: 1, kind: K[i % 5], col: FLOWER_COLS[(i * 2) % 7], fsize: 1.2 })); i++; }
  // labeled pots: labels = [[text, x, z], ...] (front of the floor rows by default)
  labels.forEach(([l, x, z], k) => out.push(pot(S, [x, 0, z], { s: 1.1, kind: K[k], col: FLOWER_COLS[k + 1], label: l, fsize: 1.1 })));
  return out;
}
// home stairway: stairs climb toward -z along left wall, hallway carpet runner. Floor y=0, back wall z=-9.
export function homeStairs(S) {
  room(S, { wallCol: 0xd8c8a8, floorTex: repeatMat(T.planks(0x8a5a36), 3, 3), zBack: -9 });
  interiorLight(S, { col: 0xffe2b8, pos: [1, 7.5, -2], intensity: 50, hemi: 1.15 });
  const st = std({ map: T.planks(0x7a4a2a) }), carpet = std({ color: 0x8a2a3a, roughness: 0.95 });
  for (let i = 0; i < 9; i++) { box(S, [3.6, 0.7 * (i + 1), 1.0], [-6.8, 0.35 * (i + 1), 2 - i * 1.0], st, { r: 0.02, name: 'stair' }); box(S, [2.2, 0.04, 1.0], [-6.8, 0.7 * (i + 1) + 0.02, 2 - i * 1.0], carpet, { r: 0, cast: false, solid: false }); }
  box(S, [0.2, 3.2, 9.5], [-4.9, 4.2, -2.2], std({ color: 0xf2eee4 }), { r: 0.04, rot: [-35 * D, 0, 0], solid: false });
  box(S, [5, 0.04, 12], [1.5, 0.02, -2.5], std({ color: 0x3a5a8a, roughness: 0.95 }), { r: 0, cast: false, solid: false });
  // picture frames
  for (const [x, c] of [[2, 0x6aa0b8], [5.5, 0xe8a04a]]) { box(S, [2.2, 1.7, 0.1], [x, 5.4, -8.85], std({ color: c }), { r: 0, cast: false, solid: false }); box(S, [2.5, 2.0, 0.08], [x, 5.4, -8.9], std({ color: 0x3a2a1a }), { r: 0, cast: false, solid: false }); }
}
