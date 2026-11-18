// Sets + props added in episode 003 (The Kite String): glowing promise strings (sag, fade, snap), kites, spool,
// bird nest + birds, ladder, sink, laundry, phone, fedora hat, hill (with slope helper), cottage, bridge,
// cozy living room. All exported via kit.js.
import * as THREE from 'three';
import { T, std, box, dayLight, interiorLight, room, repeatMat } from './sets.js';
import { T2 } from './sets2.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const V3 = (a) => Array.isArray(a) ? new THREE.Vector3(...a) : a.clone();

// ---------- promise string ----------
// const s = promiseString(S, { col }); each frame call ONE of:
//   s.set(a, b, { sag, fade, r, snap })   a/b = [x,y,z] or Vector3; sag = droop at the middle (units);
//                                          fade 0..1 (opacity+glow); snap 0..1 = string broken, halves fall away
//   s.path(points, { fade, r })           explicit polyline (smoothed)
// s.at(u) -> Vector3 on the last curve (0..1), for hanging things on it. s.mat.color/emissive can be changed (gold!).
export function promiseString(S, { col = 0xffc864, r = 0.06, glow = 2.2, seg = 64 } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: glow, transparent: true, roughness: 0.4, depthWrite: true });
  const halo = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
  const parts = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); const h = new THREE.Mesh(new THREE.BufferGeometry(), halo); m.castShadow = false; S.add(m, h); return [m, h]; });
  let curve = null;
  const build = (k, pts, rad) => {
    const [m, h] = parts[k]; m.geometry.dispose(); h.geometry.dispose();
    if (!pts) { m.visible = h.visible = false; return; }
    const c = new THREE.CatmullRomCurve3(pts); if (k === 0) curve = c;
    m.geometry = new THREE.TubeGeometry(c, seg, rad, 6, false); h.geometry = new THREE.TubeGeometry(c, seg, rad * 3.2, 6, false); m.visible = h.visible = true;
  };
  const o = {
    mat, halo, glow,
    set(a, b, { sag = 1, fade = 1, r: rr = r, snap = 0, n = 24 } = {}) {
      a = V3(a); b = V3(b); this.fadeTo(fade);
      const P = u => a.clone().lerp(b, u).add(new THREE.Vector3(0, -sag * 4 * u * (1 - u), 0));
      if (snap <= 0) { const pts = []; for (let i = 0; i <= n; i++) pts.push(P(i / n)); build(0, pts, rr); build(1, null); return this; }
      // broken: each half hangs from its anchor and swings down; free ends drop with gravity
      const half = (anchor, sign) => { const pts = []; for (let i = 0; i <= n / 2; i++) { const u = i / n; const q = sign > 0 ? P(u) : P(1 - u); const w = (u / 0.5);
        q.lerp(anchor, Math.min(1, snap * 0.75) * w * 0.85); q.y -= snap * 3.2 * w * w; pts.push(q); } return pts; };
      build(0, half(a, 1), rr); build(1, half(b, -1), rr); return this;
    },
    path(pts, { fade = 1, r: rr = r } = {}) { this.fadeTo(fade); build(0, pts.map(V3), rr); build(1, null); return this; },
    fadeTo(f) { mat.opacity = Math.min(1, 0.15 + f); mat.emissiveIntensity = o.glow * f; halo.opacity = 0.22 * f; mat.transparent = f < 1; },
    color(c) { mat.color.set(c); mat.emissive.set(c); halo.color.set(c); },
    at(u) { return curve ? curve.getPoint(u) : new THREE.Vector3(); },
    hide() { parts.forEach(([m, h]) => m.visible = h.visible = false); },
  };
  return o;
}
// world position of an avatar's pinky (bottom of the hand). side 'R' | 'L'
const _p = new THREE.Vector3();
export function pinky(A, side = 'R') { A.root.updateMatrixWorld(true); return (side === 'R' ? A.armR : A.armL).localToWorld(_p.set(0, -1.5, 0)).clone(); }

// ---------- props ----------
// diamond kite (h ≈ 3.2*s tall), faces +Z. opts: done (all 4 panels) | dusty (grey film) | drawings (crayon sheets taped on)
export function kite(S, [x, y, z], { s = 1, c1 = 0xd8302a, c2 = 0xf2b830, done = true, dusty = false, drawings = false, tail = true } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s);
  const top = [0, 1.9], bot = [0, -2.6], l = [-1.5, 0.3], r = [1.5, 0.3], c = [0, 0.3];
  const tri = (a, b, col) => { const sh = new THREE.Shape(); sh.moveTo(...c); sh.lineTo(...a); sh.lineTo(...b); sh.lineTo(...c);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), std({ color: col, side: THREE.DoubleSide, roughness: 0.6 })); m.castShadow = true; g.add(m);
    if (dusty) m.material.color.lerp(new THREE.Color(0x9a948a), 0.45); return m; };
  tri(top, l, c1); tri(top, r, c2); if (done) { tri(l, bot, c2); tri(r, bot, c1); }
  const wood = std({ color: 0x8a6a42 });
  const sp = (len, rz, py) => { const m = mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 8), wood); m.rotation.z = rz; m.position.set(0, py, 0.03); g.add(m); };
  sp(4.5, 0, -0.35); sp(3.0, Math.PI / 2, 0.3);
  if (drawings) [[-0.75, 0.9, 0xf8f4e8, -8], [0.7, 0.7, 0xfff2c0, 10], [0.15, -0.5, 0xeaf4ff, 3]].forEach(([px, py, pc, rz], i) => {
    const t = ctex(128, 128, (x2) => { x2.fillStyle = '#' + pc.toString(16).padStart(6, '0'); x2.fillRect(0, 0, 128, 128); x2.lineWidth = 7; x2.lineCap = 'round';
      const cols = ['#e8484f', '#3a7ad8', '#3a9a3a', '#f2a030']; x2.strokeStyle = cols[i]; x2.beginPath();
      if (i === 0) { x2.arc(64, 54, 24, 0, Math.PI * 2); x2.moveTo(64, 78); x2.lineTo(64, 112); x2.moveTo(38, 92); x2.lineTo(90, 92); }   // stick person
      else if (i === 1) { x2.arc(64, 64, 26, 0, Math.PI * 2); for (let k = 0; k < 8; k++) { x2.moveTo(64 + Math.cos(k) * 34, 64 + Math.sin(k) * 34); x2.lineTo(64 + Math.cos(k) * 50, 64 + Math.sin(k) * 50); } } // sun
      else { x2.moveTo(20, 100); x2.lineTo(64, 30); x2.lineTo(108, 100); x2.lineTo(20, 100); }   // hill
      x2.stroke(); x2.fillStyle = 'rgba(255,255,255,0.7)'; x2.fillRect(44, 0, 40, 14); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), std({ map: t, side: THREE.DoubleSide, roughness: 0.8 })); m.position.set(px, py, 0.07); m.rotation.z = rz * D; g.add(m); });
  g.userData.bows = [];
  if (tail) { const bm = std({ color: 0xf2f2f2, roughness: 0.7 });
    for (let i = 0; i < 5; i++) { const b = new THREE.Group(); const w = mesh(new THREE.BoxGeometry(0.5, 0.18, 0.05), std({ color: i % 2 ? c1 : c2 })); b.add(w); b.position.set(0, -2.9 - i * 0.6, 0); g.add(b); g.userData.bows.push(b); }
    const tl = mesh(new THREE.CylinderGeometry(0.015, 0.015, 3.2, 4), bm, false); tl.position.set(0, -4.1, 0); g.add(tl); g.userData.tailLine = tl; }
  S.add(g); return g;
}
export function kiteFlutter(g, t, k = 1) {
  g.userData.bows.forEach((b, i) => { b.position.x = Math.sin(t * 6 - i * 0.9) * 0.18 * (i + 1) * k; b.rotation.z = Math.sin(t * 7 - i) * 0.5 * k; });
  if (g.userData.tailLine) g.userData.tailLine.rotation.z = Math.sin(t * 6) * 0.06 * k;
}
export function spool(S) {
  const g = new THREE.Group(); const wd = std({ color: 0xb08050 });
  const c = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.55, 20), std({ color: 0xffd060, emissive: 0xffb030, emissiveIntensity: 0.6 })); c.rotation.z = Math.PI / 2; g.add(c);
  for (const x of [-0.32, 0.32]) { const d = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 24), wd); d.rotation.z = Math.PI / 2; d.position.x = x; g.add(d); }
  S.add(g); return g;
}
export function bird(S, col = 0x4a7ad0) {
  const g = new THREE.Group(); const m = std({ color: col, roughness: 0.6 });
  const b = mesh(new THREE.SphereGeometry(0.3, 16, 12), m); b.scale.set(1, 0.85, 1.25); g.add(b);
  const h = mesh(new THREE.SphereGeometry(0.2, 14, 10), m); h.position.set(0, 0.22, 0.25); g.add(h);
  const beak = mesh(new THREE.ConeGeometry(0.07, 0.2, 8), std({ color: 0xf2a030 })); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.2, 0.48); g.add(beak);
  for (const sx of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.04, 8, 6), std({ color: 0x111111 })); e.position.set(sx * 0.1, 0.28, 0.42); g.add(e); }
  g.userData.wings = [-1, 1].map(sx => { const p = new THREE.Group(); p.position.set(sx * 0.25, 0.05, 0); const w = mesh(new THREE.BoxGeometry(0.45, 0.06, 0.32), m); w.position.x = sx * 0.22; p.add(w); g.add(p); return p; });
  g.userData.flap = (t, k = 1) => g.userData.wings.forEach((p, i) => p.rotation.z = (i ? 1 : -1) * Math.sin(t * 24) * 0.8 * k);
  S.add(g); return g;
}
export function birdNest(S) {
  const g = new THREE.Group();
  const n = mesh(new THREE.TorusGeometry(0.55, 0.25, 10, 20), std({ color: 0x7a5a32, roughness: 1 })); n.rotation.x = Math.PI / 2; g.add(n);
  const base = mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.2, 16), std({ color: 0x6a4a28 })); base.position.y = -0.12; g.add(base);
  for (let i = 0; i < 10; i++) { const st = mesh(new THREE.BoxGeometry(0.8, 0.04, 0.04), std({ color: 0x9a7a4a })); st.position.set(Math.cos(i) * 0.55, 0.05, Math.sin(i) * 0.55); st.rotation.y = i * 0.7; g.add(st); }
  S.add(g); return g;
}
export function ladder(S, h = 7, col = 0xb8bcc2) {
  const g = new THREE.Group(); const m = std({ color: col, metalness: 0.5, roughness: 0.4 });
  for (const x of [-0.6, 0.6]) { const r = mesh(new THREE.BoxGeometry(0.14, h, 0.2), m); r.position.set(x, h / 2, 0); g.add(r); }
  for (let y = 0.6; y < h; y += 0.9) { const r = mesh(new THREE.BoxGeometry(1.2, 0.1, 0.16), m); r.position.set(0, y, 0); g.add(r); }
  S.add(g); return g;
}
// kitchen sink unit: cabinet front at z+0.9, basin top y=3. Returns { drip } (animate drip.position.y)
export function sink(S, [x, z]) {
  box(S, [4, 2.8, 1.8], [x, 1.4, z], std({ color: 0xe8e4da }), { r: 0.05, name: 'sink cabinet' });
  box(S, [4.2, 0.2, 2.0], [x, 2.9, z], std({ color: 0x8a8f96, roughness: 0.3 }), { r: 0.03, name: 'sink top' });
  box(S, [1.8, 0.05, 1.1], [x, 3.01, z], std({ color: 0x5a6068, metalness: 0.7, roughness: 0.2 }), { r: 0, solid: false });
  const fm = std({ color: 0xc8ccd2, metalness: 0.9, roughness: 0.2 });
  box(S, [0.18, 1.0, 0.18], [x, 3.5, z - 0.75], fm, { r: 0.05, solid: false }); box(S, [0.16, 0.16, 0.8], [x, 4.0, z - 0.4], fm, { r: 0.05, solid: false });
  const drip = mesh(new THREE.SphereGeometry(0.08, 10, 8), std({ color: 0x8ac8ff, transparent: true, opacity: 0.8, roughness: 0.05 })); drip.position.set(x, 3.8, z - 0.05); S.add(drip);
  return { drip, top: [x, 4.0, z - 0.05] };
}
export function laundryItem(S, kind = 0, col = 0x4a8ae8) {
  const g = new THREE.Group(); const m = std({ color: col, side: THREE.DoubleSide, roughness: 0.9 });
  if (kind === 0) { const b = mesh(new THREE.PlaneGeometry(0.9, 1.0), m); b.position.y = -0.5; g.add(b); for (const sx of [-1, 1]) { const s = mesh(new THREE.PlaneGeometry(0.4, 0.35), m); s.position.set(sx * 0.6, -0.2, 0); g.add(s); } } // tee
  else if (kind === 1) { for (const sx of [-1, 1]) { const s = mesh(new THREE.PlaneGeometry(0.22, 0.75), m); s.position.set(sx * 0.15, -0.38, 0); g.add(s); const f = mesh(new THREE.PlaneGeometry(0.35, 0.18), m); f.position.set(sx * 0.15 + sx * 0.08, -0.72, 0); g.add(f); } } // socks
  else { const b = mesh(new THREE.PlaneGeometry(0.8, 1.2), m); b.position.y = -0.6; g.add(b); } // towel
  const pin = mesh(new THREE.BoxGeometry(0.06, 0.18, 0.08), std({ color: 0xf2c230 })); g.add(pin);
  S.add(g); return g;
}
export function phone(S, text = 'PRIYA', sub = 'Party in 1 hour!') {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.8, 0.06), std({ color: 0x1a1a1e, roughness: 0.3 })));
  const t = ctex(256, 480, (x) => { x.fillStyle = '#e8f0ff'; x.fillRect(0, 0, 256, 480); x.fillStyle = '#ff5a8a'; x.beginPath(); x.roundRect(16, 140, 224, 180, 24); x.fill();
    x.fillStyle = '#fff'; x.font = '800 40px Inter'; x.textAlign = 'center'; x.fillText(text, 128, 205); x.font = '600 28px Inter'; x.fillText(sub, 128, 260); x.fillText('🎈', 128, 300); });
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.72), new THREE.MeshBasicMaterial({ map: t })); sc.position.z = 0.032; g.add(sc);
  S.add(g); return g;
}
// felt fedora on an avatar's head (not tagged for the clip checker). Returns the hat group (detach with S.attach(hat)).
export function fedora(A, col = 0x6a4a32) {
  const g = new THREE.Group(); const m = std({ color: col, roughness: 0.8 });
  g.add(mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.07, 32), m));
  const c = mesh(new THREE.CylinderGeometry(0.6, 0.68, 0.62, 32), m); c.position.y = 0.32; g.add(c);
  const band = mesh(new THREE.CylinderGeometry(0.69, 0.69, 0.14, 32), std({ color: 0x2a1a12 })); band.position.y = 0.1; g.add(band);
  g.position.y = 0.68; A.headMesh.add(g); return g;
}

// ---------- sets ----------
// hill: flat grassy top (radius 16) at y=0 centred on origin, slopes down to y=-20 at radius 60. Town far below at -z.
// hillY(x,z) gives the ground height anywhere. opts: sunset (warm low sun + orange sky), cottage (Grandpa's house at z=-10)
export const hillY = (x, z) => { const r = Math.hypot(x, z); return r <= 16 ? 0 : -Math.min(20, (r - 16) * 20 / 44); };
export function hill(S, { sunset = false, cottage: withCottage = false, trees = true } = {}) {
  if (sunset) {
    S.background = T.sky('#3a3a8a', '#ffa860'); S.fog = new THREE.Fog(0xf0a070, 50, 170); clouds(S, { tint: 0xffc8a0 });
    S.add(new THREE.HemisphereLight(0xffc0a0, 0x4a3a5a, 1.0));
    const sun = new THREE.DirectionalLight(0xffa860, 3.0); sun.position.set(-14, 6, -20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 0.5, far: 90 }); S.add(sun);
    const front = new THREE.DirectionalLight(0xffd8b8, 1.2); front.position.set(6, 6, 16); S.add(front);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(7, 40), new THREE.MeshBasicMaterial({ color: 0xffe0a0, fog: false })); disc.position.set(-40, 10, -140); disc.lookAt(0, 4, 0); S.add(disc);
  } else dayLight(S, { sunPos: [-10, 15, 12], area: 26 });
  S.fog = S.fog || new THREE.Fog(0xd8e0f0, 50, 170);
  const grass = repeatMat(T2.grass(), 22, 22).map; const gm = std({ map: grass, color: sunset ? 0xffd8b0 : 0xffffff });
  const top = mesh(new THREE.CylinderGeometry(16, 60, 20, 64, 1), gm, false); top.position.y = -10; S.add(top);
  const far = std({ color: sunset ? 0x7a6a7a : 0x7aa86a, roughness: 1 });
  for (const [x, z, r, h] of [[-90, -140, 60, 22], [70, -150, 70, 30], [0, -190, 90, 26], [140, -90, 50, 18], [-150, -60, 50, 16]]) { const m = mesh(new THREE.SphereGeometry(r, 32, 16), far, false); m.scale.y = h / r; m.position.set(x, -20, z); S.add(m); }
  const low = mesh(new THREE.PlaneGeometry(500, 500), std({ color: sunset ? 0x8a7a5a : 0x8ab86a }), false); low.rotation.x = -Math.PI / 2; low.position.y = -20; S.add(low);
  // tiny town far below
  const cols = [0xd8a080, 0xa8c0d8, 0xe8d8a0, 0xc08a8a, 0x9ac09a];
  for (let i = 0; i < 26; i++) { const x = -70 + (i * 37) % 140, z = -70 - (i * 23) % 50; const h = 2 + (i % 4);
    const m = mesh(new THREE.BoxGeometry(4, h, 4), std({ color: cols[i % 5] }), false); m.position.set(x, -20 + h / 2, z); S.add(m);
    const r = mesh(new THREE.ConeGeometry(3.2, 2, 4), std({ color: 0x8a3a32 }), false); r.rotation.y = Math.PI / 4; r.position.set(x, -20 + h + 1, z); S.add(r); }
  if (trees) { const trunk = std({ color: 0x6a4428 }), leaf = std({ color: sunset ? 0x5a7a3a : 0x3f8a3a });
    for (const [x, z] of [[13, -6], [-13, 4], [-11, -9]]) { box(S, [1, 7, 1], [x, 3.5, z], trunk, { r: 0.1, name: 'tree trunk' }); box(S, [5.5, 4.5, 5.5], [x, 8.5, z], leaf, { r: 1.2, solid: false }); } }
  if (withCottage) cottage(S, [0, 0, -10]);
}
// small cottage, front face at z0+3 (door at x0+1.8, window at x0-2.4, sill y 2.6..5). Fence posts optional.
export function cottage(S, [x, y, z]) {
  const wallM = std({ map: repeatMat(T2.siding('#f2e6c8'), 2, 2).map });
  box(S, [10, 7, 6], [x, y + 3.5, z], wallM, { r: 0, name: 'cottage wall' });
  const roof = std({ color: 0x3a5a7a, roughness: 0.8 });
  box(S, [11, 0.5, 4.6], [x, y + 8.4, z + 1.6], roof, { r: 0.05, rot: [-36 * D, 0, 0], cast: false, name: 'cottage roof' });
  box(S, [11, 0.5, 4.6], [x, y + 8.4, z - 1.6], roof, { r: 0.05, rot: [36 * D, 0, 0], cast: false, name: 'cottage roof' });
  box(S, [10, 2.6, 0.2], [x, y + 8.2, z + 0.0], wallM, { r: 0, solid: false });
  box(S, [1.2, 3, 1.2], [x + 3, y + 9.5, z - 1], std({ map: T.brick(0x9a4a3a) }), { r: 0.03, solid: false });
  box(S, [2.4, 5, 0.25], [x + 2.2, y + 2.5, z + 3.05], std({ map: T.planks(0x9a3a2a) }), { r: 0.04, name: 'cottage door' });
  const glass = std({ color: 0xffe2a8, emissive: 0xffc070, emissiveIntensity: 0.9, roughness: 0.1 });
  box(S, [3.2, 2.6, 0.15], [x - 2.4, y + 3.9, z + 3.04], glass, { r: 0, solid: false, name: 'cottage window' });
  box(S, [3.6, 3.0, 0.1], [x - 2.4, y + 3.9, z + 3.0], std({ color: 0xffffff }), { r: 0, solid: false });
  box(S, [0.12, 2.6, 0.2], [x - 2.4, y + 3.9, z + 3.12], std({ color: 0xffffff }), { r: 0, solid: false });
  box(S, [3.8, 0.2, 0.5], [x - 2.4, y + 2.5, z + 3.25], std({ color: 0xffffff }), { r: 0.03, name: 'window sill' });
  box(S, [3.4, 0.5, 0.6], [x - 2.4, y + 2.75, z + 3.4], std({ color: 0x8a4a2a }), { r: 0.05, solid: false });
  [0xe8484f, 0xf2c230, 0xe86ab0].forEach((c, i) => box(S, [0.45, 0.45, 0.45], [x - 3.4 + i, y + 3.15, z + 3.4], std({ color: c }), { r: 0.2, solid: false }));
  box(S, [3, 0.3, 1.6], [x + 2.2, y + 0.15, z + 3.9], std({ color: 0xb0a898 }), { r: 0.03, name: 'doorstep' });
}
// wooden footbridge along x (deck y=0, |z|<2.6, x -16..16), stream below, grassy banks beyond |x|>16
export function bridge(S) {
  dayLight(S, { sunPos: [-10, 15, 12], area: 26 });
  const wd = std({ map: T.planks(0x8a6a4a) });
  box(S, [32, 0.4, 5.4], [0, -0.2, 0], wd, { r: 0.03, cast: false, name: 'bridge deck' });
  for (const z of [-2.6, 2.6]) { box(S, [32, 0.3, 0.3], [0, 2.4, z], wd, { r: 0.05, name: 'rail' });
    for (let x = -16; x <= 16; x += 4) box(S, [0.4, 2.6, 0.4], [x, 1.2, z], wd, { r: 0.05, name: 'post' }); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), std({ color: 0x3a8ab8, roughness: 0.15, metalness: 0.2 })); water.rotation.x = -Math.PI / 2; water.position.y = -4; S.add(water); S.userData.water = water;
  const gm = repeatMat(T2.grass(), 8, 8);
  box(S, [60, 4, 120], [-46, -2, 0], gm, { r: 0, cast: false, name: 'bank' }); box(S, [60, 4, 120], [46, -2, 0], gm, { r: 0, cast: false, name: 'bank' });
  const trunk = std({ color: 0x6a4428 }), leaf = std({ color: 0x4a9a3a });
  for (const [x, z] of [[-22, -14], [24, -18], [-30, -30], [34, -8], [-20, 10]]) { box(S, [1, 7, 1], [x, 3.5, z], trunk, { r: 0.1, solid: false }); box(S, [6, 5, 6], [x, 8.5, z], leaf, { r: 1.2, solid: false }); }
  const rock = std({ color: 0x8a8a84 });
  for (const [x, z, s] of [[-12, -8, 1.5], [9, 9, 1.2], [3, -14, 2]]) box(S, [s * 2, s, s * 1.6], [x, -3.6, z], rock, { r: 0.4, solid: false });
}
// Grandpa's living room: back wall z=-9, window on back wall at x=-4 (y 3..6.4), armchair (seat top y 1.7) at (-1.2, -5.6) facing +z,
// kite easel at x=5, low table at (2.2, -3.4) top y 2.4. Warm light.
export function livingRoom(S, { night = false, sunset = false, kiteDone = false, dusty = true } = {}) {
  room(S, { wallCol: 0xc8a888, floorTex: repeatMat(T.planks(0x7a5236), 3, 3), zBack: -9, trim: 0xf2e8d8 });
  interiorLight(S, { col: sunset ? 0xffb070 : 0xffdcb0, pos: [1, 7.6, -2], intensity: night ? 30 : 48, hemi: night ? 0.7 : 1.1 });
  const sky = night ? 0x1a2a5a : sunset ? 0xffa060 : 0xcfe8ff;
  box(S, [3.6, 3.4, 0.1], [-4, 4.8, -8.85], std({ color: sky, emissive: sky, emissiveIntensity: 1.1 }), { r: 0, cast: false, solid: false, name: 'window' });
  box(S, [4.0, 3.8, 0.08], [-4, 4.8, -8.9], std({ color: 0xf6f0e4 }), { r: 0, cast: false, solid: false });
  box(S, [0.12, 3.4, 0.14], [-4, 4.8, -8.78], std({ color: 0xf6f0e4 }), { r: 0, cast: false, solid: false });
  box(S, [4.4, 0.2, 0.6], [-4, 3.0, -8.6], std({ color: 0xf6f0e4 }), { r: 0.03, name: 'sill' });
  const sunIn = new THREE.DirectionalLight(sunset ? 0xffa060 : 0xfff0d0, night ? 0.3 : 1.2); sunIn.position.set(-4, 7, -14); sunIn.target.position.set(0, 0, 0); S.add(sunIn, sunIn.target);
  // armchair (seat top y 1.9) at (-1.2, -5.6); seat extends to z -3.6 so legs have room
  const fab = std({ color: 0x5a7a4a, roughness: 0.95 });
  box(S, [4.6, 1.3, 3.0], [-1.2, 0.65, -5.4], fab, { r: 0.2, name: 'chair seat' });
  box(S, [5.4, 3.8, 0.8], [-1.2, 1.9, -7.2], fab, { r: 0.3, name: 'chair back' });
  for (const sx of [-1, 1]) box(S, [0.6, 2.2, 3.4], [-1.2 + sx * 2.5, 1.1, -5.6], fab, { r: 0.25, name: 'chair arm' });
  box(S, [4.2, 0.4, 2.6], [-1.2, 1.5, -5.2], std({ color: 0x6a8a5a }), { r: 0.18, name: 'cushion' });
  // rug, low table with glue jar
  box(S, [9, 0.04, 6], [0.5, 0.02, -2.5], std({ color: 0x9a3a3a, roughness: 1 }), { r: 0, cast: false, solid: false });
  const wd = std({ map: T.planks(0x6a4428) });
  box(S, [3.6, 0.2, 2.2], [2.6, 2.3, -3.4], wd, { r: 0.04, name: 'table' });
  for (const [dx, dz] of [[-1.6, -0.9], [1.6, -0.9], [-1.6, 0.9], [1.6, 0.9]]) box(S, [0.22, 2.2, 0.22], [2.6 + dx, 1.1, -3.4 + dz], wd, { r: 0.03, name: 'table leg' });
  // bookshelf, framed photos, lamp
  box(S, [3, 7, 1.2], [7.2, 3.5, -8.2], std({ map: T.planks(0x7a5a3a) }), { r: 0.04, name: 'bookshelf' });
  [0xd8302a, 0x3a6ab8, 0xf2b830, 0x3a9a5a, 0x8a5ab8].forEach((c, i) => box(S, [0.4, 1.3, 0.9], [6.1 + i * 0.5, 4.6, -8.0], std({ color: c }), { r: 0.03, solid: false }));
  [[2.6, 5.4, 0xe8c8a0], [4.0, 6.2, 0xa8c8e8]].forEach(([px, py, c]) => { box(S, [1.1, 1.3, 0.1], [px, py, -8.85], std({ color: c }), { r: 0, solid: false, cast: false }); box(S, [1.3, 1.5, 0.06], [px, py, -8.9], std({ color: 0x5a3a20 }), { r: 0, solid: false, cast: false }); });
  const lamp = new THREE.PointLight(0xffb060, night ? 18 : 6, 12, 1.8); lamp.position.set(-5.6, 4.2, -6.6); S.add(lamp);
  box(S, [0.2, 4, 0.2], [-5.6, 2, -6.8], std({ color: 0x2a2a2a }), { r: 0.05, name: 'lamp pole' });
  const sh = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.9, 24, 1, true), std({ color: 0xfff0d0, emissive: 0xffc070, emissiveIntensity: 0.7, side: THREE.DoubleSide })); sh.position.set(-5.6, 4.4, -6.8); S.add(sh);
  // kite on an easel (right side)
  box(S, [0.2, 6.5, 0.2], [5.0, 3.2, -5.6], wd, { r: 0.03, name: 'easel', rot: [-8 * D, 0, 0] });
  const k = kite(S, [5.0, 5.0, -5.15], { s: 0.95, done: kiteDone, dusty, drawings: true, tail: kiteDone });
  k.rotation.x = -8 * D; S.userData.kite = k; return k;
}
// little glass jar of glue sticks
export function glueJar(S, [x, y, z]) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const j = mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 24), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.45, roughness: 0.05 })); j.position.y = 0.5; g.add(j);
  [0xe8484f, 0x8a5ad8, 0x3a9ae8, 0xf2c230, 0x3ab06a].forEach((c, i) => { const s = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 12), std({ color: c })); s.position.set(Math.cos(i * 1.3) * 0.2, 0.55 + (i % 2) * 0.12, Math.sin(i * 1.3) * 0.2); s.rotation.z = Math.cos(i) * 0.15; g.add(s);
    const cap = mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.18, 12), std({ color: 0xffffff })); cap.position.y = 0.45; s.add(cap); });
  const lab = mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.3, 24, 1, true), std({ map: ctex(256, 64, (x2) => { x2.fillStyle = '#fff4d8'; x2.fillRect(0, 0, 256, 64); x2.fillStyle = '#c03a2a'; x2.font = '700 34px Inter'; x2.textAlign = 'center'; x2.fillText("ROSA'S", 128, 45); }) })); lab.position.y = 0.45; g.add(lab);
  S.add(g); return g;
}
// floating dust motes (returns updater)
export function dust(S, [x, y, z], n = 40, spread = 3) {
  const m = new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.6 }); const ps = [];
  for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 3) * 0.01, 6, 4), m); p.userData.o = [x + ((i * 73) % 100 / 50 - 1) * spread, y + ((i * 37) % 100 / 50 - 1) * spread, z + ((i * 51) % 100 / 50 - 1) * spread * 0.4]; S.add(p); ps.push(p); }
  return t => ps.forEach((p, i) => { const [a, b, c] = p.userData.o; p.position.set(a + Math.sin(t * 0.5 + i) * 0.3, b + Math.sin(t * 0.3 + i * 2) * 0.4, c); });
}
