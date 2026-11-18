// Themed worlds for "wild" episodes (and any episode whose premise lives somewhere unusual).
// Every world: big floor + backdrop + sky + fog + lighting, a clear play area around the origin (x ±7, z -4..8,
// characters face +Z, camera at +Z), and returns { update(t) } for ambient motion (snow, bubbles, fireflies...).
// Call env.update(t) inside the shot's update. Also: monster(S, opts) - cute blocky creatures.
//   forest({night})  spooky()  space()  underwater()  candy()  castle({night})  cityNight()  snow()  desert()  lab()
import * as THREE from 'three';
import { T, std, box, repeatMat } from './sets.js';
import { T2 } from './sets2.js';
import { noise } from './avatar.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function ctex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
const M = (o) => std(o);
const glow = (col) => new THREE.MeshBasicMaterial({ color: col });
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const skyTex = (stops) => ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const floorTex = (base, speck, amt = 1.5) => ctex(512, 512, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); noise(x, w, h, amt, 0.12);
  if (speck) { x.fillStyle = speck; for (let i = 0; i < 400; i++) x.fillRect(Math.random() * w, Math.random() * h, 3, 3); } });

// lighting rig: key sun with shadows + hemisphere + rim, and sky/fog
function rig(S, { sky, fog, hemi = [0xbcd4ff, 0x404040, 0.9], sun = [0xffffff, 3.0, [-8, 12, 10]], rim = [0xffc890, 1.2], look = null, area = 22, cloud = {} }) {
  S.background = skyTex(sky); if (fog) S.fog = new THREE.Fog(...fog);
  if (cloud !== false) clouds(S, look === 'night' ? { night: true, ...cloud } : cloud);   // every outdoor sky gets clouds (cloud:false = none)
  S.add(new THREE.HemisphereLight(...hemi));
  const r = new THREE.DirectionalLight(rim[0], rim[1]); r.position.set(6, 7, -12); S.add(r);
  const k = new THREE.DirectionalLight(sun[0], sun[1]); k.position.set(...sun[2]); k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
  k.shadow.bias = -0.0005; Object.assign(k.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 90 }); S.add(k, k.target);
  if (look) S.userData.look = look; return k;
}
const ground = (S, mat, size = 160) => box(S, [size, 0.3, size], [0, -0.15, -size / 2 + 30], mat, { r: 0, cast: false, name: 'ground' });
// floating particles (snow, bubbles, fireflies, embers, stars): returns update(t)
function particles(S, n, { col = 0xffffff, size = 0.12, box: [x0, x1, y0, y1, z0, z1] = [-16, 16, 0, 14, -20, 10], fall = 0, rise = 0, wobble = 0.3, emissive = true, seed = 3 } = {}) {
  const R = rng(seed), g = new THREE.SphereGeometry(size, 6, 4), m = emissive ? glow(col) : M({ color: col, transparent: true, opacity: 0.6, roughness: 0.1 });
  const im = new THREE.InstancedMesh(g, m, n); const P = [...Array(n)].map(() => [x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), z0 + R() * (z1 - z0), R() * 6.3]);
  const o = new THREE.Object3D(); S.add(im);
  return (t) => { P.forEach(([x, y, z, ph], i) => { const h = y1 - y0; let yy = y - fall * t + rise * t; yy = y0 + (((yy - y0) % h) + h) % h;
    o.position.set(x + Math.sin(t * 0.8 + ph) * wobble, yy, z + Math.cos(t * 0.6 + ph) * wobble); o.scale.setScalar(emissive ? 0.6 + 0.4 * Math.sin(t * 3 + ph) : 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.instanceMatrix.needsUpdate = true; };
}
function tree(S, [x, z], { h = 7, trunk = 0x6a4428, leaf = 0x3f8a3a, kind = 'round', s = 1 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); S.add(g);
  const bk = tm(TX.bark(trunk), 1, h / 4, { bump: 3 }); const tr = mesh(new THREE.CylinderGeometry(0.35, 0.5, h, 10), bk); tr.position.y = h / 2; g.add(tr);
  const lm = tm(TX.leaf(leaf), 2, 2, { bump: 2.5, roughness: 0.85 });
  if (kind === 'pine') for (let i = 0; i < 4; i++) { const c = mesh(new THREE.ConeGeometry(2.6 - i * 0.5, 2.6, 9), lm); c.position.y = h * 0.45 + i * 1.5; g.add(c); }
  else if (kind === 'dead') for (let i = 0; i < 4; i++) { const b = mesh(new THREE.CylinderGeometry(0.08, 0.18, 2.6, 6), bk); b.position.set(Math.cos(i * 1.7) * 0.6, h * (0.55 + i * 0.1), Math.sin(i * 1.7) * 0.6); b.rotation.set(Math.sin(i * 1.7) * 0.9, 0, -Math.cos(i * 1.7) * 0.9); g.add(b); }
  else for (const [dx, dy, dz, r] of [[0, h, 0, 2.2], [1.3, h - 0.6, 0.4, 1.5], [-1.2, h - 0.5, -0.3, 1.6], [0.2, h + 1.2, 0, 1.4]]) { const b = mesh(new THREE.IcosahedronGeometry(r, 1), lm); b.position.set(dx, dy, dz); g.add(b); }
  return g;
}
// ring of things around the play area (keeps the origin clear)
const around = (n, rMin, rMax, seed, f, { front = false } = {}) => { const R = rng(seed); for (let i = 0; i < n; i++) {
  const a = (front ? -Math.PI : -Math.PI * 0.85) + R() * Math.PI * (front ? 2 : 1.7), r = rMin + R() * (rMax - rMin);
  const x = Math.sin(a) * r, z = -Math.cos(a) * r - 2; if (z > 6 || (z > -5 && Math.abs(x) < 8.5)) continue; f(x, z, R, i); } };   // keep play area + camera corridor clear

// ---------------- procedural surface textures (color + same canvas as bump map) ----------------
const TXC = {};
const hx = c => '#' + new THREE.Color(c).getHexString();
const shd = (c, f) => { const k = new THREE.Color(c); k.multiplyScalar(f); return '#' + k.getHexString(); };
const tx = (key, w, h, draw) => TXC[key] || (TXC[key] = ctex(w, h, draw));
// textured material: t = canvas texture, (rx, ry) repeats, bump = relief strength
function tm(t, rx = 1, ry = 1, { bump = 1.5, ...o } = {}) { const m = t.clone(); m.repeat.set(rx, ry); m.needsUpdate = true; return M({ map: m, bumpMap: m, bumpScale: bump, ...o }); }
export const TX = {
  bark: (col = 0x6a4428) => tx('bark' + col, 256, 512, (x, w, h) => { x.fillStyle = hx(col); x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x0 = Math.random() * w; x.strokeStyle = Math.random() < 0.6 ? shd(col, 0.55) : shd(col, 1.3); x.lineWidth = 2 + Math.random() * 5;
      x.beginPath(); x.moveTo(x0, 0); for (let y = 0; y <= h; y += 32) x.lineTo(x0 + Math.sin(y * 0.03 + i) * 6, y); x.stroke(); }
    for (let i = 0; i < 5; i++) { x.fillStyle = shd(col, 0.45); x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 8, 14, 0, 0, 7); x.fill(); } noise(x, w, h, 1, 0.1); }),
  leaf: (col = 0x3f8a3a) => tx('leaf' + col, 256, 256, (x, w, h) => { x.fillStyle = shd(col, 0.8); x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.fillStyle = shd(col, 0.6 + Math.random() * 0.75); x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 5 + Math.random() * 7, 3 + Math.random() * 4, Math.random() * 3, 0, 7); x.fill(); } }),
  stone: (col = 0x8a8478) => tx('stone' + col, 512, 512, (x, w, h) => { x.fillStyle = shd(col, 0.45); x.fillRect(0, 0, w, h);
    for (let r = 0; r < 8; r++) { let px = -Math.random() * 60; while (px < w) { const bw = 50 + Math.random() * 60; x.fillStyle = shd(col, 0.8 + Math.random() * 0.4);
      x.beginPath(); x.roundRect(px + 3, r * 64 + 3, bw - 6, 58, 8); x.fill(); px += bw; } }
    x.strokeStyle = shd(col, 0.4); x.lineWidth = 2; for (let i = 0; i < 25; i++) { let a = Math.random() * w, b = Math.random() * h; x.beginPath(); x.moveTo(a, b); for (let k = 0; k < 4; k++) { a += (Math.random() - 0.5) * 30; b += Math.random() * 20; x.lineTo(a, b); } x.stroke(); }
    noise(x, w, h, 1.5, 0.12); }),
  cobble: (col = 0x9a9488) => tx('cob' + col, 512, 512, (x, w, h) => { x.fillStyle = shd(col, 0.4); x.fillRect(0, 0, w, h);
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) { const cx = c * 51 + (r % 2) * 25 + (Math.random() - 0.5) * 8, cy = r * 51 + (Math.random() - 0.5) * 8;
      const g = x.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 26); g.addColorStop(0, shd(col, 1.25)); g.addColorStop(1, shd(col, 0.7 + Math.random() * 0.2)); x.fillStyle = g;
      x.beginPath(); x.ellipse(cx, cy, 21 + Math.random() * 4, 19 + Math.random() * 4, Math.random(), 0, 7); x.fill(); } noise(x, w, h, 1, 0.1); }),
  shingle: (col = 0x3a4aa8) => tx('sh' + col, 256, 256, (x, w, h) => { x.fillStyle = shd(col, 0.5); x.fillRect(0, 0, w, h);
    for (let r = 0; r < 9; r++) for (let c = -1; c < 9; c++) { const cx = c * 32 + (r % 2) * 16, cy = r * 30; x.fillStyle = shd(col, 0.8 + Math.random() * 0.35);
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + 30, cy); x.lineTo(cx + 30, cy + 20); x.arc(cx + 15, cy + 20, 15, 0, Math.PI); x.closePath(); x.fill(); } noise(x, w, h, 0.8, 0.1); }),
  strata: (col = 0xc8703a) => tx('st' + col, 256, 512, (x, w, h) => { let y = 0; while (y < h) { const bh = 8 + Math.random() * 30; x.fillStyle = shd(col, 0.75 + Math.random() * 0.45); x.fillRect(0, y, w, bh); y += bh; }
    x.strokeStyle = shd(col, 0.5); x.lineWidth = 2; for (let i = 0; i < 18; i++) { const a = Math.random() * w; x.beginPath(); x.moveTo(a, Math.random() * h); x.lineTo(a + (Math.random() - 0.5) * 20, Math.random() * h); x.stroke(); } noise(x, w, h, 2, 0.12); }),
  snow: () => tx('snow', 512, 512, (x, w, h) => { x.fillStyle = '#e4ecf6'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 80); g.addColorStop(0, 'rgba(160,185,220,0.35)'); g.addColorStop(1, 'rgba(160,185,220,0)'); x.save(); x.translate(Math.random() * w, Math.random() * h); x.scale(2.2, 0.6); x.fillStyle = g; x.fillRect(-80, -80, 160, 160); x.restore(); }
    for (let i = 0; i < 500; i++) { x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } noise(x, w, h, 0.8, 0.05); }),
  dune: (col = 0xe2c288) => tx('dune' + col, 512, 512, (x, w, h) => { x.fillStyle = hx(col); x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 9) { x.strokeStyle = Math.floor(y / 9) % 2 ? shd(col, 0.82) : shd(col, 1.12); x.lineWidth = 3; x.beginPath(); for (let px = 0; px <= w; px += 16) x.lineTo(px, y + Math.sin(px * 0.03 + y * 0.05) * 5); x.stroke(); } noise(x, w, h, 2, 0.12); }),
  metal: (col = 0x3a4450) => tx('met' + col, 512, 512, (x, w, h) => { x.fillStyle = hx(col); x.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`; x.fillRect(0, Math.random() * h, w, 1); }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { x.strokeStyle = shd(col, 0.5); x.lineWidth = 4; x.strokeRect(c * 256 + 2, r * 128 + 2, 252, 124); x.fillStyle = shd(col, 1.5);
      for (const [a, b] of [[10, 10], [242, 10], [10, 114], [242, 114]]) { x.beginPath(); x.arc(c * 256 + a, r * 128 + b, 4, 0, 7); x.fill(); } }
    for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(60,40,20,0.25)'; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 20, 6, 1.4, 0, 7); x.fill(); } }),
  wetAsphalt: () => tx('wasp', 512, 512, (x, w, h) => { x.fillStyle = '#1a1a22'; x.fillRect(0, 0, w, h); noise(x, w, h, 3, 0.18);
    for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(120,110,170,0.22)'; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 50, 10 + Math.random() * 20, Math.random(), 0, 7); x.fill(); }
    x.strokeStyle = '#0a0a10'; x.lineWidth = 2; for (let i = 0; i < 10; i++) { let a = Math.random() * w, b = Math.random() * h; x.beginPath(); x.moveTo(a, b); for (let k = 0; k < 5; k++) { a += (Math.random() - 0.5) * 40; b += (Math.random() - 0.5) * 40; x.lineTo(a, b); } x.stroke(); } }),
  meadow: (col = 0x4f9a3c) => tx('mead' + col, 512, 512, (x, w, h) => { x.fillStyle = shd(col, 0.9); x.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(110,80,40,0.25)'; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 40, 20 + Math.random() * 25, Math.random(), 0, 7); x.fill(); }
    for (let i = 0; i < 6000; i++) { const px = Math.random() * w, py = Math.random() * h; x.strokeStyle = shd(col, 0.6 + Math.random() * 0.75); x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() - 0.5) * 4, py - 4 - Math.random() * 6); x.stroke(); }
    for (let i = 0; i < 40; i++) { x.fillStyle = ['#ffffff', '#ffe060', '#ff90c0'][i % 3]; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 2, 0, 7); x.fill(); } }),
  deadGrass: () => tx('dg', 512, 512, (x, w, h) => { x.fillStyle = '#3a3428'; x.fillRect(0, 0, w, h); noise(x, w, h, 2, 0.15);
    for (let i = 0; i < 3500; i++) { const px = Math.random() * w, py = Math.random() * h; x.strokeStyle = shd(0x6a6040, 0.5 + Math.random() * 0.6); x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() - 0.5) * 8, py - 3 - Math.random() * 7); x.stroke(); } }),
  moon: () => tx('moon', 512, 512, (x, w, h) => { x.fillStyle = '#8a8a90'; x.fillRect(0, 0, w, h); noise(x, w, h, 3, 0.15);
    for (let i = 0; i < 45; i++) { const cx = Math.random() * w, cy = Math.random() * h, r = 3 + Math.random() * 18; x.fillStyle = 'rgba(40,40,50,0.35)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
      x.strokeStyle = 'rgba(220,220,230,0.35)'; x.lineWidth = 2; x.beginPath(); x.arc(cx + 1, cy + 1, r, 0.5, 3.2); x.stroke(); } }),
  spots: (col, dot = '#ffffff', n = 30, r = [6, 14]) => tx('sp' + col + dot + n, 256, 256, (x, w, h) => { x.fillStyle = hx(col); x.fillRect(0, 0, w, h); noise(x, w, h, 0.6, 0.08);
    for (let i = 0; i < n; i++) { x.fillStyle = dot; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, r[0] + Math.random() * (r[1] - r[0]), 0, 7); x.fill(); } }),
  boards: (col = 0x3a3040) => tx('bd' + col, 256, 256, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = shd(col, 0.75 + Math.random() * 0.45); x.fillRect(i * 32, 0, 32, h); x.fillStyle = shd(col, 0.4); x.fillRect(i * 32, 0, 3, h); }
    for (let i = 0; i < 20; i++) { x.fillStyle = shd(col, 0.35); x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 3, 0, 7); x.fill(); } noise(x, w, h, 1, 0.12); }),
};
// scattered low-poly rocks (textured) and grass tufts (instanced), outside the play area
function rocks(S, n, rMin, rMax, seed, col = 0x8a8478, s = 1) {
  const mat = tm(TX.stone(col), 0.6, 0.6, { bump: 2 });
  around(n, rMin, rMax, seed, (x, z, R) => { const g = new THREE.IcosahedronGeometry(0.5 + R() * 0.9, 1); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = 0.8 + R() * 0.4; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.7, p.getZ(i) * k); } g.computeVertexNormals();
    const m = mesh(g, mat); m.position.set(x, 0.15 * s, z); m.scale.setScalar(s); m.rotation.y = R() * 6; S.add(m); });
}
function tufts(S, n, col = 0x4f9a3c, seed = 2, h = 0.5) {
  const R = rng(seed), g = new THREE.ConeGeometry(0.05, h, 4); g.translate(0, h / 2, 0); const im = new THREE.InstancedMesh(g, M({ color: col, roughness: 0.9 }), n * 5);
  const o = new THREE.Object3D(); let k = 0;
  for (let i = 0; i < n; i++) { let x = (R() - 0.5) * 40, z = -30 + R() * 36; if (Math.abs(x) < 4 && z > -3 && z < 6) x += Math.sign(x || 1) * 5;
    for (let j = 0; j < 5; j++) { o.position.set(x + (R() - 0.5) * 0.3, 0, z + (R() - 0.5) * 0.3); o.rotation.set((R() - 0.5) * 0.6, R() * 3, (R() - 0.5) * 0.6); o.scale.set(1, 0.6 + R() * 0.8, 1); o.updateMatrix(); im.setMatrixAt(k++, o.matrix); } }
  im.instanceColor = null; S.add(im); return im;
}

// ---------------- worlds ----------------
export function forest(S, { night = false } = {}) {
  rig(S, night ? { sky: [[0, '#0a1030'], [1, '#2a3a6a']], fog: [0x1a2448, 22, 90], hemi: [0x5a70c0, 0x101018, 0.7], sun: [0x9ab0ff, 1.4, [-8, 14, 8]], rim: [0x80a0ff, 1.0], look: 'night' }
    : { sky: [[0, '#6ab0e8'], [1, '#d8f0c8']], fog: [0xbfe0b8, 45, 150], hemi: [0xd0f0ff, 0x405030, 0.9], sun: [0xfff0c8, 3.0, [-8, 14, 10]] });
  ground(S, tm(TX.meadow(night ? 0x2f6a3a : 0x4f9a3c), 22, 22, { bump: 1.2 })); rocks(S, 14, 8, 30, 17, 0x8a8a80); tufts(S, 140, night ? 0x2a5a3a : 0x5aa846, 3);
  { const Rf = rng(77); for (let i = 0; i < 34; i++) tree(S, [-80 + i * 4.8 + Rf() * 3, -55 - Rf() * 25], { h: 7 + Rf() * 5, leaf: night ? 0x22483a : [0x3a7a3a, 0x2f6a34, 0x4a8a3c][i % 3], s: 1.2 + Rf() * 0.8 }); }   // distant tree line
  around(26, 11, 34, 4, (x, z, R) => tree(S, [x, z], { h: 6 + R() * 4, leaf: night ? 0x2a5a3a : [0x3f8a3a, 0x4f9a3c, 0x2f7a3a][Math.floor(R() * 3)], s: 0.9 + R() * 0.5 }));
  around(12, 7, 14, 9, (x, z, R) => { const s = 0.5 + R() * 0.6; const st = mesh(new THREE.CylinderGeometry(0.18 * s, 0.22 * s, 0.7 * s, 8), M({ color: 0xf2ead8 })); st.position.set(x, 0.35 * s, z); S.add(st);
    const cap = mesh(new THREE.SphereGeometry(0.6 * s, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), tm(TX.spots(R() < 0.5 ? 0xd83a3a : 0xc87a3a, '#fff4e0', 14, [8, 16]), 2, 1, { bump: 0.5 })); cap.position.set(x, 0.7 * s, z); S.add(cap); });
  if (night) { const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), glow(0xfff4d0)); moon.position.set(-14, 22, -60); S.add(moon);
    const key = new THREE.PointLight(0xffd8a0, 18, 16, 1.6); key.position.set(0, 6, 5); S.add(key); }
  const up = night ? particles(S, 60, { col: 0xd8ff70, size: 0.09, box: [-12, 12, 0.5, 6, -12, 6], wobble: 0.8 }) : particles(S, 30, { col: 0xfff8d0, size: 0.05, box: [-10, 10, 1, 8, -10, 6], wobble: 0.6 });
  return { update: up };
}
export function spooky(S) {   // haunted hill: kid-friendly spooky (purple sky, big moon, dead trees, graves, crooked house)
  rig(S, { sky: [[0, '#1a0a30'], [0.7, '#5a2a6a'], [1, '#c86a5a']], fog: [0x3a2050, 26, 100], hemi: [0x8a70d0, 0x201018, 0.8], sun: [0xb0a0ff, 1.6, [-10, 12, 8]], rim: [0xff9a60, 1.4], look: 'night' });
  ground(S, tm(TX.deadGrass(), 20, 20, { bump: 1.5, color: 0x9a9080 })); rocks(S, 10, 9, 28, 23, 0x6a6a70); tufts(S, 90, 0x5a5238, 5, 0.6);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), glow(0xffe8b0)); moon.position.set(10, 26, -70); S.add(moon);
  around(10, 12, 30, 7, (x, z, R) => tree(S, [x, z], { h: 6 + R() * 3, trunk: 0x2a1a20, kind: 'dead' }));
  const stone = tm(TX.stone(0x8a8a90), 0.5, 0.6, { bump: 2.5 });
  around(12, 7, 16, 11, (x, z, R) => { box(S, [1.2, 1.6 + R() * 0.6, 0.35], [x, 0.8, z], stone, { r: 0.4, rot: [0, 0, (R() - 0.5) * 0.3], name: 'grave' }); });
  const hs = tm(TX.boards(0x3a3040), 3, 3, { bump: 2 }); box(S, [10, 9, 8], [-6, 4.5, -38], hs, { r: 0, cast: false, rot: [0, 0, 0.04], solid: false }); box(S, [11, 0.6, 9], [-6, 9.2, -38], tm(TX.shingle(0x2a2030), 4, 3), { r: 0, rot: [0, 0, -0.1], solid: false });
  box(S, [3, 7, 3], [-2, 11, -38], hs, { r: 0, rot: [0, 0, 0.1], solid: false });
  for (const [x, y] of [[-8.5, 5], [-4, 5], [-6, 7.2], [-2, 12]]) box(S, [1.4, 1.6, 0.1], [x, y, -33.9], glow(0xffc860), { r: 0, cast: false, solid: false });
  const key = new THREE.PointLight(0xffb070, 22, 18, 1.6); key.position.set(1, 6, 6); S.add(key);
  const pumpkins = []; around(5, 5, 9, 13, (x, z) => { const p = mesh(new THREE.SphereGeometry(0.6, 16, 10), tm(tx('pump', 256, 128, (c, w, h) => { c.fillStyle = '#f07a1a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = '#c85a10'; c.fillRect(i * 32, 0, 5, h); } noise(c, w, h, 1, 0.1); }), 1, 1, { bump: 2 })); p.scale.y = 0.8; p.position.set(x, 0.48, z); S.add(p);
    const l = new THREE.PointLight(0xff8a30, 3, 4, 2); l.position.set(x, 0.9, z + 0.5); S.add(l); });
  return { update: particles(S, 40, { col: 0xc0a0ff, size: 0.07, box: [-14, 14, 0.5, 8, -16, 6], wobble: 1.0 }) };
}
export function space(S) {    // moon surface: craters, starfield, ringed planet, distant earth
  rig(S, { sky: [[0, '#000006'], [1, '#0a0a24']], fog: null, hemi: [0x8090c0, 0x202024, 0.6], sun: [0xffffff, 3.4, [-12, 9, 6]], rim: [0x6a8aff, 1.6], look: 'night', cloud: false });
  ground(S, tm(TX.moon(), 14, 14, { bump: 3, roughness: 1 })); rocks(S, 18, 7, 36, 31, 0x8a8a90);
  const R = rng(5), cm = tm(TX.moon(), 1, 1, { bump: 3, roughness: 1, color: 0xb0b0b8 });
  around(16, 7, 40, 21, (x, z, Rr) => { const s = 1 + Rr() * 2.5; const c = mesh(new THREE.TorusGeometry(s, s * 0.22, 6, 20), cm); c.rotation.x = Math.PI / 2; c.position.set(x, 0, z); c.scale.z = 0.6; S.add(c); });
  const sg = new THREE.BufferGeometry(), sp = []; for (let i = 0; i < 1500; i++) { const a = R() * Math.PI * 2, b = R() * Math.PI * 0.48, r = 250; sp.push(Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false })));
  const pl = new THREE.Group(); pl.position.set(18, 30, -110); S.add(pl);
  pl.add(new THREE.Mesh(new THREE.SphereGeometry(14, 32, 20), M({ map: ctex(256, 128, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = ['#e8a86a', '#d88a5a', '#f2c890', '#c8784a'][i % 4]; x.fillRect(0, i * 8, w, 8); } }), emissive: 0x3a2010 })));
  const ring = new THREE.Mesh(new THREE.RingGeometry(18, 26, 64), new THREE.MeshBasicMaterial({ color: 0xe8d0a8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })); ring.rotation.x = -1.2; ring.rotation.y = 0.3; pl.add(ring);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(4, 24, 16), M({ map: ctex(256, 128, (c, w, h) => { c.fillStyle = '#2a6ad0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { c.fillStyle = i % 3 ? '#3a9a4a' : '#e8e8e8'; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 24, 6 + Math.random() * 12, Math.random(), 0, 7); c.fill(); } }), emissive: 0x10305a })); earth.position.set(-26, 22, -90); S.add(earth);
  const flag = new THREE.Group(); flag.position.set(-6, 0, -6); S.add(flag); flag.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), M({ color: 0xdddddd })));
  flag.children[0].position.y = 2; const fl = mesh(new THREE.PlaneGeometry(1.8, 1.1), M({ color: 0xe84a4a, side: THREE.DoubleSide })); fl.position.set(0.9, 3.4, 0); flag.add(fl);
  return { update: (t) => { pl.rotation.y = t * 0.02; earth.rotation.y = t * 0.1; } };
}
export function underwater(S) {   // sea floor: sand, kelp, coral, light shafts, bubbles
  rig(S, { sky: [[0, '#0a6aa8'], [1, '#04304a']], fog: [0x0a5a88, 8, 48], hemi: [0x6ad0ff, 0x0a2a3a, 1.0], sun: [0xb8f0ff, 2.2, [-4, 16, 6]], rim: [0x40c0ff, 1.0], cloud: false });
  ground(S, tm(TX.dune(0xd8c08a), 18, 18, { bump: 1.5 })); rocks(S, 16, 6, 24, 41, 0x6a8a8a);
  const kelp = []; around(18, 6, 26, 3, (x, z, R) => { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const h = 4 + R() * 6, m = tm(TX.leaf(R() < 0.5 ? 0x3a8a3a : 0x5a9a2a), 0.5, 1, { bump: 1.5 });
    for (let i = 0; i < 6; i++) { const seg = mesh(new THREE.BoxGeometry(0.35, h / 6, 0.12), m); seg.position.y = h / 12 + i * h / 6; g.add(seg); } kelp.push(g); });
  const cols = [0xff6a8a, 0xffa040, 0xb06ad8, 0xff4a5a];
  around(14, 6, 14, 8, (x, z, R) => { const m = tm(TX.spots(cols[Math.floor(R() * 4)], 'rgba(255,255,255,0.45)', 60, [2, 5]), 1, 1, { bump: 3, roughness: 0.6 }); for (let i = 0; i < 4; i++) { const b = mesh(new THREE.CylinderGeometry(0.12, 0.2, 1 + R(), 6), m); b.position.set(x + (R() - 0.5), 0.5, z + (R() - 0.5)); b.rotation.set((R() - 0.5) * 0.8, 0, (R() - 0.5) * 0.8); S.add(b); }
    const ball = mesh(new THREE.IcosahedronGeometry(0.5, 1), m); ball.position.set(x + 0.7, 0.4, z); S.add(ball); });
  const shaft = new THREE.MeshBasicMaterial({ color: 0xbff0ff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 40), shaft); p.position.set(-12 + i * 5, 14, -14 + (i % 2) * 4); p.rotation.z = 0.35; S.add(p); }
  const bub = particles(S, 50, { col: 0xd8f8ff, size: 0.12, rise: 1.4, box: [-12, 12, 0, 14, -14, 6], emissive: false });
  return { update: (t) => { bub(t); kelp.forEach((g, i) => g.children.forEach((c, k) => { c.rotation.z = Math.sin(t * 1.2 + i + k * 0.5) * 0.12 * k; c.position.x = Math.sin(t * 1.2 + i) * 0.04 * k * k; })); } };
}
export function candy(S) {    // candy land: pink ground, lollipop trees, gumdrops, candy canes, cotton-candy clouds
  rig(S, { sky: [[0, '#ff9ad8'], [1, '#ffe8f6']], fog: [0xffd8f0, 45, 150], hemi: [0xffe0f8, 0x8a4a7a, 1.0], sun: [0xfff0f8, 3.0, [-8, 14, 10]], rim: [0xffc0e0, 1.2], cloud: { tint: 0xfff0fa } });
  ground(S, M({ map: (() => { const t = ctex(256, 256, (x, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#ffb8e0' : '#ffe0f2'; x.fillRect(i * 32, j * 32, 32, 32); } }); t.repeat.set(30, 30); return t; })() }));
  const cols = [0xff4a8a, 0x4ad8c8, 0xffd84a, 0xa86aff, 0xff8a3a];
  around(14, 9, 28, 6, (x, z, R) => { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const h = 4 + R() * 3; const stick = mesh(new THREE.CylinderGeometry(0.15, 0.15, h, 8), M({ color: 0xf8f8f8 })); stick.position.y = h / 2; g.add(stick);
    const pop = mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.4, 32), M({ map: ctex(256, 256, (c, w, hh) => { for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#' + new THREE.Color(cols[Math.floor(R() * 5)]).getHexString(); c.beginPath(); c.arc(128, 128, 128 - k * 21, 0, 7); c.fill(); } }) }));
    pop.rotation.x = Math.PI / 2; pop.position.y = h + 1.2; g.add(pop); });
  around(16, 6, 13, 9, (x, z, R) => { const d = mesh(new THREE.SphereGeometry(0.7, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), tm(TX.spots(cols[Math.floor(R() * 5)], 'rgba(255,255,255,0.8)', 260, [1, 2]), 2, 1, { bump: 1.2, roughness: 0.3 })); d.position.set(x, 0, z); d.scale.y = 1.3; S.add(d); });
  const cl = M({ color: 0xffd0f0, roughness: 1 }); for (let i = 0; i < 6; i++) { const c = new THREE.Group(); c.position.set(-30 + i * 12, 16 + (i % 3) * 3, -50); S.add(c); for (let k = 0; k < 4; k++) { const b = mesh(new THREE.SphereGeometry(2.4, 14, 10), cl, false); b.position.set(k * 2.2 - 3.3, Math.sin(k) * 0.6, 0); c.add(b); } }
  return { update: particles(S, 40, { col: 0xffffff, size: 0.08, box: [-12, 12, 1, 10, -12, 6], wobble: 0.5 }) };
}
export function castle(S, { night = false } = {}) {   // stone courtyard in front of a castle with towers and banners
  rig(S, night ? { sky: [[0, '#0a1030'], [1, '#3a3a6a']], fog: [0x2a2a4a, 25, 90], hemi: [0x6a7ac0, 0x201818, 0.7], sun: [0xa0b0ff, 1.4, [-8, 14, 8]], rim: [0xffb070, 1.0], look: 'night' }
    : { sky: [[0, '#4f86d8'], [1, '#ffe0b8']], fog: [0xf0d8b8, 55, 180], hemi: [0xd0e0ff, 0x504030, 0.9], sun: [0xffe8c0, 3.2, [-8, 14, 10]] });
  ground(S, tm(TX.cobble(0x9a9488), 24, 24, { bump: 2.5 }));
  const st = tm(TX.stone(0x8a8478), 6, 2, { bump: 2.5 });
  box(S, [60, 12, 3], [0, 6, -22], st, { r: 0, cast: false, solid: false });
  for (let x = -29; x <= 29; x += 2.4) box(S, [1.4, 1.4, 3], [x, 12.7, -22], st, { r: 0, cast: false, solid: false });
  for (const x of [-16, 16, 0]) { const h = x ? 20 : 26, rr = x ? 4 : 5; const tw = mesh(new THREE.CylinderGeometry(rr, rr, h, 24), tm(TX.stone(0x8a8478), rr * 1.2, h / 5, { bump: 2.5 }), false); tw.position.set(x, h / 2, -24); S.add(tw);
    const roof = mesh(new THREE.ConeGeometry(rr + 0.8, 7, 24), tm(TX.shingle(0x3a4aa8), 4, 2, { bump: 2 }), false); roof.position.set(x, h + 3.5, -24); S.add(roof);
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.2), night ? glow(0xffc860) : M({ color: 0x1a1a2a })); win.position.set(x, h - 5, -24 + rr); S.add(win); }
  const gate = box(S, [7, 9, 0.6], [0, 4.5, -20.4], M({ map: T.planks(0x5a3a22) }), { r: 0.1, cast: false, solid: false });
  const flags = []; for (const x of [-8, 8]) { box(S, [0.2, 8, 0.2], [x, 4, -6], M({ color: 0x4a4a4a, metalness: 0.5 }), { r: 0.05, name: 'banner pole' });
    const f = mesh(new THREE.PlaneGeometry(2, 3, 8, 1), M({ side: THREE.DoubleSide, map: ctex(128, 192, (c, w, h) => { c.fillStyle = x < 0 ? '#c0302a' : '#2a5ac0'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2c83a'; c.fillRect(0, 0, w, 12); c.fillRect(0, h - 12, w, 12); c.beginPath(); c.moveTo(w / 2, 50); c.lineTo(w / 2 + 30, 96); c.lineTo(w / 2, 142); c.lineTo(w / 2 - 30, 96); c.fill(); noise(c, w, h, 1, 0.1); }) })); f.position.set(x + 1.05, 6.4, -6); S.add(f); flags.push(f); }
  if (night) for (const x of [-4.5, 4.5]) { const l = new THREE.PointLight(0xff9a40, 14, 12, 1.6); l.position.set(x, 6, -19.5); S.add(l); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), glow(0xffb050)); fl.position.copy(l.position); S.add(fl); }
  return { update: (t) => flags.forEach((f, i) => { const p = f.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k); p.setZ(k, Math.sin(t * 4 + x * 2 + i) * 0.15 * (x + 1)); } p.needsUpdate = true; }) };
}
export function cityNight(S) {    // neon street at night: lit windows, glowing signs, wet asphalt
  rig(S, { sky: [[0, '#05051a'], [1, '#2a1a4a']], fog: [0x1a1030, 20, 80], hemi: [0x6a5ac0, 0x101018, 0.6], sun: [0x8a9aff, 1.0, [-6, 14, 8]], rim: [0xff4ad8, 1.6], look: 'night' });
  ground(S, tm(TX.wetAsphalt(), 16, 16, { bump: 1, roughness: 0.3, metalness: 0.35 }));
  box(S, [80, 0.32, 8], [0, -0.13, -4], repeatMat(T.tiles(0x5a5a62, 0x4a4a52), 40, 4), { r: 0, cast: false, solid: false });
  const R = rng(4), neon = [0xff3ad8, 0x3ae8ff, 0xffe83a, 0x6aff6a, 0xff6a3a]; let x = -40;
  while (x < 40) { const w = 7 + R() * 5, h = 14 + R() * 18;
    const wt = ctex(256, 512, (c, cw, ch) => { c.fillStyle = '#000000'; c.fillRect(0, 0, cw, ch); for (let yy = 10; yy < ch; yy += 34) for (let xx = 10; xx < cw; xx += 40) { c.fillStyle = Math.random() < 0.4 ? '#ffd890' : '#000000'; c.fillRect(xx, yy, 24, 20); } });
    wt.repeat.set(w / 8, h / 16); box(S, [w - 0.4, h, 8], [x + w / 2, h / 2, -14], M({ color: [0x2a2a40, 0x3a2a3a, 0x22303a][Math.floor(R() * 3)], emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 1.1 }), { r: 0, cast: false, solid: false });
    const nc = neon[Math.floor(R() * 5)]; box(S, [w * 0.6, 1.2, 0.2], [x + w / 2, 5 + R() * 6, -9.9], glow(nc), { r: 0.05, cast: false, solid: false });
    const nl = new THREE.PointLight(nc, 10, 14, 1.8); nl.position.set(x + w / 2, 5, -7); S.add(nl); x += w; }
  for (const lx of [-9, 9]) { box(S, [0.3, 8, 0.3], [lx, 4, -1.5], M({ color: 0x2a2a30, metalness: 0.6 }), { r: 0.05, name: 'lamp post' }); const l = new THREE.PointLight(0xffd8a0, 30, 16, 1.6); l.position.set(lx, 7.6, -1); S.add(l);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), glow(0xfff0c0)); b.position.set(lx, 7.9, -1.5); S.add(b); }
  const key = new THREE.PointLight(0xffe0c0, 16, 16, 1.6); key.position.set(0, 6, 7); S.add(key);
  return { update: particles(S, 30, { col: 0xff9ae8, size: 0.05, box: [-14, 14, 1, 10, -10, 6], wobble: 0.4 }) };
}
export function snow(S) {    // snowy hill: pines, snowmen, falling snow, mountains
  rig(S, { sky: [[0, '#6a9ad0'], [1, '#d8e6f4']], fog: [0xc8d8e8, 55, 190], hemi: [0xd8e4ff, 0x6a7890, 0.75], sun: [0xfff0e0, 1.9, [-8, 14, 10]] });
  ground(S, tm(TX.snow(), 7, 7, { bump: 2.5, roughness: 0.95 })); rocks(S, 10, 9, 30, 51, 0x7a8090);
  around(22, 10, 34, 5, (x, z, R) => { const g = tree(S, [x, z], { h: 3 + R() * 2, kind: 'pine', leaf: 0x2a5a3a, s: 1 + R() * 0.6 }); g.children.slice(1).forEach(c => { const sc = mesh(new THREE.ConeGeometry(c.geometry.parameters.radius * 0.7, 1.0, 9), M({ color: 0xffffff })); sc.position.copy(c.position); sc.position.y += 0.9; g.add(sc); }); });
  for (const [x, z] of [[-6, -5], [7, -7]]) { const w = tm(TX.snow(), 1, 1, { bump: 2 }); [[0.9, 0.9], [0.65, 2.25], [0.45, 3.2]].forEach(([r, y]) => { const b = mesh(new THREE.SphereGeometry(r, 16, 12), w); b.position.set(x, y, z); S.add(b); });
    const n = mesh(new THREE.ConeGeometry(0.08, 0.5, 8), M({ color: 0xff8a2a })); n.rotation.x = Math.PI / 2; n.position.set(x, 3.2, z + 0.65); S.add(n); }
  const mt = tm(TX.strata(0x8a90a0), 6, 3, { bump: 2, roughness: 1 }); [[-40, 30], [-10, 40], [25, 34], [50, 28]].forEach(([x, h]) => { const m = mesh(new THREE.ConeGeometry(h * 0.8, h, 7), mt, false); m.position.set(x, h / 2 - 2, -80); S.add(m);
    const cap = mesh(new THREE.ConeGeometry(h * 0.28, h * 0.35, 7), tm(TX.snow(), 2, 2, { bump: 2 }), false); cap.position.set(x, h - 2 - h * 0.17, -80); S.add(cap); });
  return { update: particles(S, 260, { col: 0xffffff, size: 0.07, fall: 1.2, box: [-16, 16, 0, 14, -16, 8], wobble: 0.5, emissive: false }) };
}
export function desert(S) {    // dunes, mesas, cacti, heat-haze sky
  rig(S, { sky: [[0, '#5aa0e0'], [1, '#ffd8a0']], fog: [0xf8d8a8, 70, 220], hemi: [0xfff0d0, 0x8a6030, 1.0], sun: [0xfff0c0, 3.6, [-10, 16, 8]] });
  ground(S, tm(TX.dune(), 16, 16, { bump: 2 })); rocks(S, 12, 8, 30, 61, 0xb07a4a);
  const R = rng(8), sm = tm(TX.dune(0xe8c080), 6, 3, { bump: 2 }); for (let i = 0; i < 9; i++) { const d = mesh(new THREE.SphereGeometry(8 + R() * 6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), sm, false); d.scale.y = 0.25; d.position.set(-50 + i * 12, -0.5, -30 - R() * 20); S.add(d); }
  const mm = tm(TX.strata(0xc8703a), 3, 1, { bump: 3 }); [[-34, 14, 11], [-12, 9, 7], [20, 18, 12], [46, 12, 9]].forEach(([x, h, r], i) => { const g = new THREE.CylinderGeometry(r * 0.78, r, h, 7, 3); const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const a = Math.atan2(p.getX(k), p.getZ(k)); const f = 1 + 0.12 * Math.sin(a * 3 + i) + (p.getY(k) > h / 2 - 0.01 ? 0 : 0.05 * Math.sin(p.getY(k) * 1.3 + a)); p.setX(k, p.getX(k) * f); p.setZ(k, p.getZ(k) * f); }
    g.computeVertexNormals(); const m = mesh(g, mm, false); m.position.set(x, h / 2, -70 - (i % 2) * 12); S.add(m); });
  const cm = tm(ctex(128, 128, (c, w, h) => { c.fillStyle = '#4f8a3a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = '#3a6a2a'; c.fillRect(i * 16, 0, 4, h); } for (let i = 0; i < 60; i++) { c.fillStyle = '#f4f0d8'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }), 1, 1, { bump: 3 }); around(10, 8, 24, 3, (x, z, Rr) => { const h = 2.5 + Rr() * 2.5; const b = mesh(new THREE.CapsuleGeometry(0.4, h, 6, 12), cm); b.position.set(x, h / 2 + 0.4, z); S.add(b);
    const a = mesh(new THREE.CapsuleGeometry(0.25, 1.0, 4, 10), cm); a.position.set(x + 0.7, h * 0.6 + 0.5, z); S.add(a); });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), glow(0xfff4c0)); sun.position.set(-30, 40, -120); S.add(sun);
  return { update: particles(S, 25, { col: 0xe8c890, size: 0.06, box: [-14, 14, 0.2, 3, -10, 6], wobble: 2, emissive: false }) };
}
export function lab(S) {    // mad-science lab interior: glowing tanks, consoles, pipes (back wall z=-9, walls x=±10, h 10)
  S.background = new THREE.Color(0x0a0f14);
  box(S, [20, 0.3, 18], [0, -0.15, 0], M({ map: (() => { const t = ctex(256, 256, (x, w, h) => { x.fillStyle = '#3a4048'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2e34'; x.lineWidth = 4; for (let i = 0; i <= w; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }); t.repeat.set(5, 5); return t; })(), metalness: 0.3, roughness: 0.5 }), { r: 0, cast: false, name: 'floor' });
  const wm = tm(TX.metal(0x3a4450), 2, 1, { bump: 1.5, metalness: 0.4, roughness: 0.55 });
  box(S, [20, 10, 0.4], [0, 5, -9.2], wm, { r: 0, cast: false, name: 'back wall' }); box(S, [0.4, 10, 18], [-10.2, 5, 0], wm, { r: 0, cast: false, name: 'wall' }); box(S, [0.4, 10, 18], [10.2, 5, 0], wm, { r: 0, cast: false, name: 'wall' });
  S.add(new THREE.HemisphereLight(0x8ad0ff, 0x10141a, 0.9));
  const key = new THREE.PointLight(0xe8f4ff, 40, 0, 1.6); key.position.set(0, 9, 3); key.castShadow = true; S.add(key);
  const tanks = []; for (const [x, c] of [[-7, 0x3aff8a], [-3.5, 0x3ac8ff], [3.5, 0xff4ad8], [7, 0x3aff8a]]) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 5, 24, 1, true), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    g.position.set(x, 3.3, -7.6); S.add(g); box(S, [2.6, 0.8, 2.6], [x, 0.4, -7.6], M({ color: 0x5a6068, metalness: 0.7 }), { r: 0.1, name: 'tank base' }); box(S, [2.6, 0.6, 2.6], [x, 6.1, -7.6], M({ color: 0x5a6068, metalness: 0.7 }), { r: 0.1, name: 'tank top' });
    const l = new THREE.PointLight(c, 8, 8, 2); l.position.set(x, 3, -5.8); S.add(l); tanks.push(g); }
  for (const z of [-4, 1]) { box(S, [2, 2.4, 3], [-8.8, 1.2, z], tm(TX.metal(0x4a525c), 0.5, 0.5, { metalness: 0.5 }), { r: 0.08, name: 'console' }); box(S, [0.1, 1.2, 2.2], [-7.78, 2.6, z], glow(0x3ae8ff), { r: 0, cast: false, solid: false }); }
  for (const y of [8.4, 9.0]) box(S, [20, 0.35, 0.35], [0, y, -8.6], M({ color: 0x8a6a3a, metalness: 0.8, roughness: 0.3 }), { r: 0.15, cast: false, solid: false });
  return { update: (t) => tanks.forEach((g, i) => { g.material.emissiveIntensity = 0.5 + 0.25 * Math.sin(t * 3 + i * 2); }) };
}
export const WORLDS = { forest, spooky, space, underwater, candy, castle, cityNight, snow, desert, lab };

// ---------------- creatures ----------------
// monster(S, { name, col, shape: 'blob'|'box'|'tall', eyes: 1-3, horns, teeth, arms, tentacles, size, spots })
// Cute-blocky, kid-friendly. Returns { root, body, eyes[], arms[], look(target), animate(t, mood) } - mood 'idle'|'bounce'|'chase'|'scared'|'wave'.
// Parts are tagged for the collision checker under `name`. Height ≈ 4 * size (feet at y=0, faces +Z).
export function monster(S, { name = 'monster', col = 0x6ad86a, belly = null, shape = 'blob', eyes = 2, horns = true, teeth = true, arms = true, tentacles = false, size = 1, spots = false, seed = 1 } = {}) {
  const R = rng(seed); const root = new THREE.Group(); root.scale.setScalar(size); S.add(root);
  const body = new THREE.Group(); root.add(body); const bm = M({ color: col, roughness: 0.55 }), dark = M({ color: new THREE.Color(col).multiplyScalar(0.55), roughness: 0.6 });
  const geo = shape === 'box' ? new THREE.BoxGeometry(2.8, 2.6, 2.2, 4, 4, 4) : shape === 'tall' ? new THREE.CapsuleGeometry(1.0, 2.0, 8, 20) : new THREE.SphereGeometry(1.5, 28, 20);
  const b = mesh(geo, bm); b.position.y = shape === 'tall' ? 2.5 : 1.9; if (shape === 'blob') b.scale.set(1, 0.9, 0.85); body.add(b);
  if (belly !== null) { const bl = mesh(new THREE.SphereGeometry(shape === 'tall' ? 0.8 : 1.05, 20, 14), M({ color: belly })); bl.scale.set(1, 1.1, 0.4); bl.position.set(0, b.position.y - 0.35, shape === 'box' ? 1.0 : 1.05); body.add(bl); }
  if (spots) for (let i = 0; i < 7; i++) { const a = R() * Math.PI * 1.6 - 2.4, y = b.position.y + (R() - 0.3) * 1.6; const sp = mesh(new THREE.SphereGeometry(0.18 + R() * 0.12, 10, 8), dark); sp.scale.z = 0.3; sp.position.set(Math.sin(a) * 1.35, y, Math.cos(a) * 1.15); sp.lookAt(0, y, 0); body.add(sp); }
  const top = shape === 'tall' ? 4.0 : 3.2, ey = top - (shape === 'tall' ? 0.9 : 0.95), ez = shape === 'box' ? 1.12 : shape === 'tall' ? 0.92 : 1.18;
  const E = []; const xs = eyes === 1 ? [0] : eyes === 2 ? [-0.5, 0.5] : [-0.75, 0, 0.75];
  xs.forEach((x, i) => { const s = eyes === 1 ? 0.62 : eyes === 3 && i === 1 ? 0.42 : 0.38; const g = new THREE.Group(); g.position.set(x, ey + (eyes === 3 && i === 1 ? 0.3 : 0), ez - 0.15); body.add(g);
    const wh = mesh(new THREE.SphereGeometry(s, 18, 14), M({ color: 0xffffff, roughness: 0.2 })); g.add(wh); const pu = mesh(new THREE.SphereGeometry(s * 0.5, 14, 10), M({ color: 0x111111, roughness: 0.2 })); pu.position.z = s * 0.62; g.add(pu);
    const sh = new THREE.Mesh(new THREE.SphereGeometry(s * 0.14, 8, 6), glow(0xffffff)); sh.position.set(s * 0.15, s * 0.18, s * 0.9); g.add(sh);
    const lid = mesh(new THREE.SphereGeometry(s * 1.05, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), bm); lid.scale.y = 0.05; g.add(lid); g.userData = { pu, lid, s }; E.push(g); });
  const mouthY = ey - (eyes === 1 ? 0.95 : 0.75); const mouth = mesh(new THREE.SphereGeometry(0.5, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M({ color: 0x3a0a14 }));
  mouth.scale.set(1.3, 0.8, 0.5); mouth.rotation.x = Math.PI; mouth.position.set(0, mouthY, ez - 0.2); body.add(mouth);
  if (teeth) for (const x of [-0.32, 0.32]) { const t = mesh(new THREE.ConeGeometry(0.11, 0.28, 6), M({ color: 0xfffff0 })); t.rotation.x = Math.PI; t.position.set(x, mouthY - 0.1, ez + 0.03); body.add(t); }
  if (horns) for (const s of [-1, 1]) { const h = mesh(new THREE.ConeGeometry(0.22, 0.9, 10), M({ color: 0xf2e8c8 })); h.position.set(s * 0.75, top + 0.2, 0); h.rotation.z = -s * 0.35; body.add(h); }
  const A = [];
  if (arms) for (const s of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(s * (shape === 'box' ? 1.45 : 1.3), b.position.y + 0.1, 0); body.add(sh); const a = mesh(new THREE.CapsuleGeometry(0.28, 1.0, 4, 10), bm); a.position.y = -0.75; sh.add(a); A.push(sh); }
  const L = [];
  if (tentacles) for (let i = 0; i < 5; i++) { const g = new THREE.Group(); const a = (i / 5) * Math.PI * 2; g.position.set(Math.sin(a) * 0.9, 0.9, Math.cos(a) * 0.7); root.add(g); for (let k = 0; k < 4; k++) { const seg = mesh(new THREE.SphereGeometry(0.3 - k * 0.05, 10, 8), bm); seg.position.set(0, -k * 0.28, k * 0.12); g.add(seg); } L.push(g); }
  else for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 0.65, shape === 'tall' ? 1.1 : 0.75, 0); root.add(g); const l = mesh(new THREE.CapsuleGeometry(0.32, 0.5, 4, 10), dark); l.position.y = -0.45; g.add(l); L.push(g); }
  if (!tentacles && shape !== 'tall') body.position.y = 0.1;
  root.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = 'monster'; } });
  const target = new THREE.Vector3(0, 4, 20), tmp = new THREE.Vector3();
  const M2 = { root, body, eyes: E, arms: A, legs: L, name,
    look(v) { target.copy(v); },
    blink(amount) { E.forEach(g => { g.userData.lid.scale.y = 0.05 + amount * 0.95; g.userData.lid.rotation.x = amount > 0.5 ? 0 : 0; }); },
    animate(t, mood = 'idle') {
      const k = mood === 'chase' ? 2.2 : mood === 'bounce' ? 1.6 : 1;
      body.position.y = (shape === 'tall' || tentacles ? 0 : 0.1) + (mood === 'bounce' || mood === 'chase' ? Math.abs(Math.sin(t * 6 * k / 1.6)) * 0.45 : Math.sin(t * 2) * 0.05);
      body.rotation.z = Math.sin(t * 3 * k) * (mood === 'scared' ? 0.12 : 0.05); body.scale.set(1, mood === 'scared' ? 0.92 + Math.sin(t * 30) * 0.02 : 1 + Math.sin(t * 2) * 0.02, 1);
      A.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (mood === 'wave' && i ? 2.4 + Math.sin(t * 10) * 0.4 : mood === 'chase' ? 1.4 : mood === 'scared' ? 2.6 : 0.3 + Math.sin(t * 2 + i) * 0.1); a.rotation.x = mood === 'chase' ? -1.2 : 0; });
      L.forEach((l, i) => { l.rotation.x = tentacles ? Math.sin(t * 4 + i) * 0.4 : Math.sin(t * 8 * k / 1.6 + i * Math.PI) * (mood === 'chase' || mood === 'bounce' ? 0.6 : 0.05); });
      root.updateMatrixWorld(true);
      E.forEach(g => { g.worldToLocal(tmp.copy(target)); tmp.normalize(); g.userData.pu.position.set(tmp.x * g.userData.s * 0.45, tmp.y * g.userData.s * 0.45, g.userData.s * 0.62); });
      const bl = (t % 3.7) < 0.12 ? 1 : 0; if (mood !== 'scared') M2.blink(bl);
    } };
  return M2;
}

// ---------------- scary creatures (kid-horror: creepy, not gory) ----------------
// creature(S, { kind: 'stalker'|'brute'|'crawler'|'shade', name, col, eyeCol, size, seed })
//   stalker: very tall + thin, hunched, dangling long arms with claws, too-wide jagged grin, blank glowing eyes
//   brute:   hulking hunched shoulders, curved horns, glowing slit eyes, tusks, big clawed fists
//   crawler: low spider-thing with jointed legs and a cluster of glowing eyes
//   shade:   floating hooded shadow, void face with glowing eyes + grin, trailing wisps
//   husk:    owner's R2 reference (sketchfab 'Creepy Monster'): ~9 tall emaciated humanoid, elongated bald skull, deep dark eye sockets with
//            pinpoint eyes, ribs, sunken belly, very long thin arms + long clawed fingers, mottled ochre skin. Works in daylight too. No gore.
// Returns { root, head, animate(t, mood), look(vec3), eyesOn(0..1) }  mood: 'lurk'|'stalk'|'lunge'|'roar'|'hide'
// Glowing eyes + bloom read best in dark worlds (spooky, forest night, cityNight, castle night, lab). Feet on y=0, faces +Z.
export function creature(S, { kind = 'stalker', name = 'creature', col, eyeCol, size = 1, seed = 1 } = {}) {
  const R = rng(seed + 11); const root = new THREE.Group(); root.scale.setScalar(size); S.add(root);
  const C = col ?? { stalker: 0x2a2630, brute: 0x3a2a2a, crawler: 0x1e2a22, shade: 0x0c0a12, husk: 0xa87a42 }[kind];
  const E = eyeCol ?? { stalker: 0xf4f4ff, brute: 0xff7a1a, crawler: 0xd8ff3a, shade: 0xff2a3a, husk: 0xffb040 }[kind];
  const skin = M({ color: C, roughness: 0.85 }), dark = M({ color: new THREE.Color(C).multiplyScalar(0.5), roughness: 0.9 });
  const bone = M({ color: 0xe8e0c8, roughness: 0.5 }), maw = M({ color: 0x120206, roughness: 0.9 });
  const eyeM = new THREE.MeshBasicMaterial({ color: E }), eyes = [];
  const G = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const part = (parent, geo, mat, x = 0, y = 0, z = 0) => { const m = mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const grin = (parent, w, y, z, n = 9) => {   // too-wide jagged grin: dark slit with interlocking teeth
    const g = G(parent, 0, y, z); const sl = part(g, new THREE.BoxGeometry(w, 0.32, 0.12), maw); sl.scale.y = 1;
    for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n;
      const up = part(g, new THREE.ConeGeometry(w / n * 0.42, 0.24, 4), bone, x, 0.06, 0.05); up.rotation.x = Math.PI;
      const dn = part(g, new THREE.ConeGeometry(w / n * 0.42, 0.24, 4), bone, x + w / n / 2, -0.06, 0.05); }
    g.userData.open = (k) => { sl.scale.y = 1 + k * 1.6; g.children.forEach((c, i) => { if (i) c.position.y = (c.rotation.x ? 1 : -1) * (0.06 + k * 0.22); }); }; return g; };
  const eye = (parent, x, y, z, r, slit = false) => { const e = part(parent, new THREE.SphereGeometry(r, 14, 10), eyeM, x, y, z); if (slit) e.scale.set(1.3, 0.38, 0.6); eyes.push(e); return e; };
  const claws = (hand, n = 3, len = 0.6) => { for (let i = 0; i < n; i++) { const c = part(hand, new THREE.ConeGeometry(0.07, len, 6), bone, (i - (n - 1) / 2) * 0.16, -len / 2, 0.05); c.rotation.x = Math.PI + 0.25; } };
  const J = {};   // joints for animation
  let head;
  if (kind === 'stalker') {
    J.hips = G(root, 0, 3.6, 0); J.body = G(J.hips);
    part(J.body, new THREE.BoxGeometry(1.3, 2.8, 0.7), skin, 0, 1.4, 0);
    J.neck = G(J.body, 0, 2.9, 0.15); head = G(J.neck, 0, 0.55, 0.2);
    const hd = part(head, new THREE.BoxGeometry(1.0, 1.3, 0.9), skin); hd.scale.set(1, 1, 1);
    eye(head, -0.25, 0.25, 0.46, 0.13); eye(head, 0.25, 0.25, 0.46, 0.13); grin(head, 0.95, -0.25, 0.46, 9);
    J.arms = [-1, 1].map(s => { const sh = G(J.body, s * 0.85, 2.6, 0); part(sh, new THREE.BoxGeometry(0.32, 2.4, 0.32), skin, 0, -1.2, 0);
      const el = G(sh, 0, -2.4, 0); part(el, new THREE.BoxGeometry(0.28, 2.2, 0.28), skin, 0, -1.1, 0); const hn = G(el, 0, -2.25, 0); claws(hn, 4, 0.7); return { sh, el }; });
    J.legs = [-1, 1].map(s => { const hp = G(root, s * 0.4, 3.6, 0); part(hp, new THREE.BoxGeometry(0.38, 3.6, 0.38), dark, 0, -1.8, 0); return hp; });
    J.body.rotation.x = 0.35; J.neck.rotation.x = -0.25;
  } else if (kind === 'brute') {
    J.hips = G(root, 0, 2.2, 0); J.body = G(J.hips);
    const tor = part(J.body, new THREE.SphereGeometry(1.6, 20, 14), skin, 0, 1.5, 0); tor.scale.set(1.35, 1.0, 0.95);
    for (let i = 0; i < 5; i++) { const sp = part(J.body, new THREE.ConeGeometry(0.16, 0.6, 6), bone, 0, 2.4 - i * 0.4, -1.3 + i * 0.05); sp.rotation.x = -1.1; }
    J.neck = G(J.body, 0, 2.55, 1.15); head = G(J.neck, 0, 0.1, 0.45);
    part(head, new THREE.BoxGeometry(1.5, 1.25, 1.2), skin);
    eye(head, -0.36, 0.18, 0.6, 0.15, true); eye(head, 0.36, 0.18, 0.6, 0.15, true);
    const brow = part(head, new THREE.BoxGeometry(1.55, 0.22, 0.35), dark, 0, 0.4, 0.55); brow.rotation.x = 0.3;
    for (const s of [-1, 1]) { const h = part(head, new THREE.TorusGeometry(0.5, 0.12, 8, 16, Math.PI * 0.9), bone, s * 0.7, 0.8, 0); h.rotation.set(0, Math.PI / 2, s > 0 ? 0.3 : Math.PI - 0.3);
      const tk = part(head, new THREE.ConeGeometry(0.09, 0.4, 6), bone, s * 0.4, -0.22, 0.62); }
    grin(head, 1.1, -0.32, 0.6, 7);
    J.arms = [-1, 1].map(s => { const sh = G(J.body, s * 2.1, 2.0, 0.2); part(sh, new THREE.SphereGeometry(0.75, 14, 10), skin);
      part(sh, new THREE.BoxGeometry(0.75, 2.0, 0.75), skin, 0, -1.2, 0); const el = G(sh, 0, -2.2, 0); part(el, new THREE.BoxGeometry(0.85, 1.4, 0.85), skin, 0, -0.6, 0);
      const fist = G(el, 0, -1.45, 0); part(fist, new THREE.BoxGeometry(1.1, 0.9, 1.0), dark); claws(fist, 3, 0.5); return { sh, el }; });
    J.legs = [-1, 1].map(s => { const hp = G(root, s * 0.9, 2.2, 0); part(hp, new THREE.BoxGeometry(0.9, 2.2, 0.9), dark, 0, -1.1, 0); return hp; });
    J.body.rotation.x = 0.3;
  } else if (kind === 'crawler') {
    J.hips = G(root, 0, 1.3, 0); J.body = G(J.hips);
    const bd = part(J.body, new THREE.SphereGeometry(1.3, 18, 12), skin); bd.scale.set(1.2, 0.6, 1.5);
    const ab = part(J.body, new THREE.SphereGeometry(1.0, 16, 12), dark, 0, 0.3, -1.8); ab.scale.set(1.1, 0.9, 1.2);
    head = G(J.body, 0, 0.1, 1.7); part(head, new THREE.SphereGeometry(0.7, 16, 12), skin).scale.set(1.1, 0.75, 0.9);
    for (const [x, y, r] of [[-0.28, 0.25, 0.13], [0.28, 0.25, 0.13], [-0.5, 0.1, 0.09], [0.5, 0.1, 0.09], [-0.14, 0.42, 0.08], [0.14, 0.42, 0.08]]) eye(head, x, y, 0.55, r);
    for (const s of [-1, 1]) { const f = part(head, new THREE.ConeGeometry(0.09, 0.5, 6), bone, s * 0.18, -0.35, 0.5); f.rotation.x = Math.PI - 0.4; }
    J.legs = []; for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, k = Math.floor(i / 2); const hp = G(J.body, s * 1.1, 0, 0.9 - k * 0.9); hp.rotation.y = s * (0.5 - k * 0.5);
      const up = G(hp); part(up, new THREE.BoxGeometry(1.8, 0.18, 0.18), dark, s * 0.9, 0, 0); up.rotation.z = s * 0.7;
      const kn = G(up, s * 1.8, 0, 0); const lo = G(kn); part(lo, new THREE.BoxGeometry(0.16, 2.1, 0.16), dark, 0, -1.0, 0); lo.rotation.z = -s * 0.5; J.legs.push({ hp, up, lo, s, k }); }
    J.arms = [];
  } else if (kind === 'husk') {
    // owner's reference creature (R2, sketchfab "Creepy Monster"): ~9 tall, gaunt and emaciated, bald elongated skull with deep dark eye sockets,
    // visible ribs, sunken belly, very long thin arms with long clawed fingers, thin legs; mottled ochre-brown skin with dark creases. No blood/gore.
    const mott = ctex(256, 256, (x, w, h) => { x.fillStyle = '#' + new THREE.Color(C).getHexString(); x.fillRect(0, 0, w, h); noise(x, w, h, 1.0, 0.1);
      for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${90 + Math.random() * 60},${50 + Math.random() * 30},20,${0.2 + Math.random() * 0.25})`; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 12 + Math.random() * 30, 8 + Math.random() * 20, Math.random() * 3, 0, 7); x.fill(); }
      for (let i = 0; i < 22; i++) { x.strokeStyle = `rgba(${40 + Math.random() * 30},${18 + Math.random() * 12},8,${0.25 + Math.random() * 0.35})`; x.lineWidth = 1 + Math.random() * 2.5;
        x.beginPath(); let px = Math.random() * w, py = Math.random() * h; x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (Math.random() - 0.5) * 30; py += Math.random() * 22; x.lineTo(px, py); } x.stroke(); }
      for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(230,200,140,${Math.random() * 0.25})`; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 4 + Math.random() * 10, 2 + Math.random() * 6, Math.random() * 3, 0, 7); x.fill(); } });
    const hs = M({ map: mott, bumpMap: mott, bumpScale: 1.2, roughness: 0.5, metalness: 0.05 }), hd2 = M({ map: mott, bumpMap: mott, bumpScale: 1.2, color: 0xe8c890, roughness: 0.45 });
    const crease = M({ color: 0x2a1408, roughness: 1 });
    const limb = (parent, r0, r1, len, mat = hs) => { const m = part(parent, new THREE.CylinderGeometry(r0, r1, len, 10, 4), mat, 0, -len / 2, 0); return m; };
    J.hips = G(root, 0, 4.2, 0); J.body = G(J.hips);
    // torso: wide bony chest tapering to a thin waist
    const chest = part(J.body, new THREE.CylinderGeometry(0.95, 0.5, 2.4, 14, 6), hs, 0, 2.0, 0); chest.scale.z = 0.62;
    part(J.body, new THREE.CylinderGeometry(0.5, 0.55, 0.9, 12), hs, 0, 0.45, 0).scale.z = 0.7;
    part(J.body, new THREE.SphereGeometry(0.95, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), hs, 0, 3.18, 0).scale.set(1, 0.32, 0.62);   // rounded shoulders
    for (let i = 0; i < 6; i++) { const y = 2.85 - i * 0.28, r = 0.5 + (y - 0.8) / 2.4 * 0.45 + 0.05;   // ribs: raised arcs across the front of the chest
      for (const [mat, dy, th] of [[hd2, 0, 0.038], [crease, -0.1, 0.026]]) { const g = G(J.body, 0, y + dy, 0); g.rotation.x = Math.PI / 2; g.scale.set(1, 0.66, 1);
        const rb = mesh(new THREE.TorusGeometry(r, th, 6, 20, Math.PI * 0.6), mat); rb.rotation.z = Math.PI * 0.2; g.add(rb); } }
    const belly = part(J.body, new THREE.SphereGeometry(0.34, 12, 10), M({ color: 0x5a3a1e, roughness: 1 }), 0, 1.05, 0.22); belly.scale.set(0.9, 1.4, 0.3);   // sunken stomach (dark, no gore)
    const coll = part(J.body, new THREE.BoxGeometry(1.7, 0.16, 0.3), hd2, 0, 3.15, 0.18); coll.rotation.x = 0.2;   // collarbones
    J.neck = G(J.body, 0, 3.25, 0.05); part(J.neck, new THREE.CylinderGeometry(0.2, 0.26, 0.7, 10), hs, 0, 0.3, 0);
    head = G(J.neck, 0, 1.15, 0.05);
    const skull = part(head, new THREE.SphereGeometry(0.62, 18, 14), hs); skull.scale.set(0.8, 1.3, 0.9);
    const jaw = part(head, new THREE.SphereGeometry(0.42, 14, 10), hs, 0, -0.5, 0.12); jaw.scale.set(0.72, 1.0, 0.8);
    for (const sx of [-1, 1]) { const so = part(head, new THREE.SphereGeometry(0.11, 12, 10), M({ color: 0x1a0c05, roughness: 1 }), sx * 0.16, 0.08, 0.49); so.scale.set(0.85, 1.45, 0.45); so.rotation.z = -sx * 0.4;   // slanted sockets, inner corners down (menacing)
      eye(head, sx * 0.16, 0.05, 0.53, 0.016); }
    const nose = part(head, new THREE.ConeGeometry(0.05, 0.16, 4), crease, 0, -0.2, 0.55); nose.scale.z = 0.5;
    const hm = grin(head, 0.3, -0.6, 0.45, 5); hm.scale.set(1, 0.25, 1); const ho = hm.userData.open;   // closed thin mouth; teeth only show when it opens
    hm.userData.open = (k) => { ho(k); hm.children.forEach((c, i) => { if (i) c.visible = k > 0.25; }); };
    J.arms = [-1, 1].map(s => { const sh = G(J.body, s * 1.0, 2.95, 0); part(sh, new THREE.SphereGeometry(0.28, 10, 8), hs);
      limb(sh, 0.22, 0.15, 2.9); const el = G(sh, 0, -2.9, 0); part(el, new THREE.SphereGeometry(0.17, 8, 6), hs); limb(el, 0.16, 0.13, 2.7);
      const hn = G(el, 0, -2.75, 0); const palm = part(hn, new THREE.BoxGeometry(0.34, 0.5, 0.14), hs, 0, -0.2, 0);
      for (let f = 0; f < 4; f++) { const fg = G(hn, (f - 1.5) * 0.1, -0.42, 0); fg.rotation.z = (f - 1.5) * 0.12; limb(fg, 0.045, 0.03, 0.75);
        const cl = part(fg, new THREE.ConeGeometry(0.035, 0.22, 5), bone, 0, -0.85, 0); cl.rotation.x = Math.PI; }
      return { sh, el }; });
    J.legs = [-1, 1].map(s => { const hp = G(root, s * 0.36, 4.2, 0); limb(hp, 0.26, 0.17, 2.2); const kn = G(hp, 0, -2.2, 0); part(kn, new THREE.SphereGeometry(0.19, 8, 6), hs);
      limb(kn, 0.17, 0.12, 2.0); const ft = part(kn, new THREE.BoxGeometry(0.3, 0.16, 0.7), hs, 0, -2.0, 0.2); return hp; });
    J.body.rotation.x = 0.12; J.neck.rotation.x = 0.1;
  } else {   // shade
    J.hips = G(root, 0, 0.6, 0); J.body = G(J.hips);
    const cloak = new THREE.ConeGeometry(1.4, 4.4, 14, 6, true); const p = cloak.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) < -2.1) p.setY(i, p.getY(i) + Math.sin(Math.atan2(p.getX(i), p.getZ(i)) * 7) * 0.35 - 0.2);
    cloak.computeVertexNormals(); part(J.body, cloak, M({ color: C, roughness: 1, side: THREE.DoubleSide }), 0, 2.2, 0);
    head = G(J.body, 0, 4.2, 0.1); const hood = part(head, new THREE.SphereGeometry(0.85, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), M({ color: C, roughness: 1, side: THREE.DoubleSide })); hood.rotation.x = -0.5;
    const voidF = part(head, new THREE.SphereGeometry(0.62, 16, 12), new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, -0.05, 0.25); voidF.scale.z = 0.6;
    eye(head, -0.22, 0.05, 0.6, 0.09, true); eye(head, 0.22, 0.05, 0.6, 0.09, true); grin(head, 0.55, -0.28, 0.6, 7);
    J.arms = [-1, 1].map(s => { const sh = G(J.body, s * 0.9, 3.4, 0.2); const sl = part(sh, new THREE.ConeGeometry(0.35, 1.8, 8, 1, true), M({ color: C, side: THREE.DoubleSide }), 0, -0.9, 0); sl.rotation.x = Math.PI;
      const el = G(sh, 0, -1.8, 0); const hn = G(el); part(hn, new THREE.BoxGeometry(0.3, 0.4, 0.15), M({ color: 0x8a8a90 })); claws(hn, 4, 0.55); return { sh, el }; });
    J.legs = [];
  }
  const glowL = new THREE.PointLight(E, 4, 6, 2); head.add(glowL); glowL.position.set(0, 0, 1.2);
  const mouthG = head.children.find(c => c.userData && c.userData.open);
  root.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = kind; } });
  const target = new THREE.Vector3(0, 4.6, 20), tmp = new THREE.Vector3();
  const api = { root, head, joints: J, kind, name,
    look(v) { target.copy(v); },
    eyesOn(k) { eyes.forEach(e => e.visible = k > 0.5); glowL.intensity = 4 * k; },
    animate(t, mood = 'lurk') {
      const L = J.legs || [], A = J.arms || [];
      const walkK = mood === 'stalk' ? 1 : mood === 'lunge' ? 2.2 : 0;
      const sw = Math.sin(t * (kind === 'crawler' ? 9 : 3.2) * Math.max(walkK, 0.001));
      if (kind === 'crawler') L.forEach(({ up, lo, s, k }, i) => { const ph = t * 9 * Math.max(walkK, 0.2) + i * 1.9; up.rotation.z = s * (0.7 + Math.max(0, Math.sin(ph)) * 0.35 * (walkK ? 1 : 0.15)); up.rotation.y = Math.cos(ph) * 0.3 * (walkK ? 1 : 0.1); });
      else if (kind !== 'shade') L.forEach((l, i) => { l.rotation.x = (i ? 1 : -1) * sw * 0.5 * Math.min(walkK, 1); });
      J.hips.position.y = (kind === 'stalker' ? 3.6 : kind === 'husk' ? 4.2 : kind === 'brute' ? 2.2 : kind === 'crawler' ? 1.3 : 0.6 + Math.sin(t * 1.8) * 0.25) + (walkK ? Math.abs(sw) * 0.12 : 0);
      const lean = { lurk: 0, stalk: 0.12, lunge: 0.45, roar: -0.25, hide: -0.15 }[mood] ?? 0;
      J.body.rotation.x = (kind === 'stalker' ? 0.35 : kind === 'husk' ? 0.12 : kind === 'brute' ? 0.3 : 0) + lean + (mood === 'roar' ? Math.sin(t * 40) * 0.02 : 0);
      J.body.rotation.z = mood === 'lurk' ? Math.sin(t * 0.9) * 0.06 : 0;
      A.forEach(({ sh, el }, i) => { const s = i ? 1 : -1;
        if (mood === 'lunge') { sh.rotation.x = -1.35 - lean + Math.sin(t * 6 + i) * 0.1; el.rotation.x = -0.25; sh.rotation.z = s * 0.2; }
        else if (mood === 'roar') { sh.rotation.x = -0.4; sh.rotation.z = s * (1.7 + Math.sin(t * 20) * 0.05); el.rotation.x = -0.9; }
        else { sh.rotation.x = (walkK ? -sw * s * 0.3 : 0) + Math.sin(t * 1.3 + i) * 0.06; sh.rotation.z = s * 0.12; el.rotation.x = kind === 'shade' ? -0.6 : -0.15; } });
      if (mouthG) mouthG.userData.open(mood === 'roar' ? 0.8 + Math.sin(t * 25) * 0.1 : mood === 'lunge' ? 0.6 : 0.05);
      // head: creepy tilt + snap toward the target (lurk adds sudden twitches)
      root.updateMatrixWorld(true); head.parent.worldToLocal(tmp.copy(target)); tmp.sub(head.position);
      const yaw = Math.max(-1, Math.min(1, Math.atan2(tmp.x, tmp.z))), pitch = Math.max(-0.6, Math.min(0.6, -Math.atan2(tmp.y, Math.hypot(tmp.x, tmp.z))));
      const tw = mood === 'lurk' && (t % 2.3) < 0.15 ? 0.45 : 0;
      head.rotation.set(pitch, yaw, (mood === 'lurk' ? 0.25 + tw : mood === 'hide' ? 0.4 : 0) * (kind === 'stalker' || kind === 'shade' || kind === 'husk' ? 1 : 0.4));
    } };
  return api;
}

// ---------------- rain (episode 005) ----------------
// const R = rain(S, opts); then in the shot's update, AFTER camPath:  R.update(t, cam)
//   streaks: instanced thin lines in a box that follows the camera (cheap, always "around" the lens)
//   splashes: little expanding rings on the ground in front of the camera; opts.ground = floor height (null = none, e.g. interiors)
//   lightning: opts.lightning = [t0, t1, ...] shot-local strike times -> brief double-flash light spike (add a 'thunder' sfx on it);
//              R.flash(t) returns the 0..1 flash level if you want to brighten other things (sky, window) yourself.
//   opts: n (streak count), radius, top, speed, len, col, opacity, wind (tilt, radians), splashes (count), lightCol, lightning
// Pair with: wetFloor(S, opts) (glossy puddled street), lightStreak(S, [x,z], col) (light reflections on wet ground),
//            rainGlass(S, [w,h], [x,y,z], ry) (rain running down a window, returns update(t)),
//            patternLight(S, {pos, target, pattern:'blinds'|'rain'|'window'}) (projected window / rain shadows).
export function rain(S, { n = 1500, radius = 14, top = 16, speed = 28, len = 0.9, col = 0xb8c8e8, opacity = 0.3, wind = 0.12, splashes = 160,
  ground = 0, lightning = [], lightCol = 0xcfdcff, lightMax = 5, seed = 11 } = {}) {
  const R = rng(seed);
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.011, 0.011, len, 3, 1, true),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity, depthWrite: false }), n);
  im.frustumCulled = false; im.userData.fx = true; S.add(im);
  const P = [...Array(n)].map(() => [R() * 2 - 1, R() * 2 - 1, R(), 0.8 + R() * 0.45]);
  const o = new THREE.Object3D(), fwd = new THREE.Vector3();
  let sp = null, SPL = [];
  if (splashes && ground !== null) {
    sp = new THREE.InstancedMesh(new THREE.RingGeometry(0.06, 0.1, 14).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), splashes);
    sp.frustumCulled = false; sp.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(splashes * 3), 3); S.add(sp);
    SPL = [...Array(splashes)].map(() => [R(), 0.35 + R() * 0.3]);
  }
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const flashL = new THREE.DirectionalLight(lightCol, 0); flashL.position.set(-10, 30, -20); S.add(flashL);
  const flashH = new THREE.HemisphereLight(lightCol, 0x202030, 0); S.add(flashH);
  const flash = (t) => { let k = 0; for (const t0 of lightning) { const u = t - t0; if (u < 0 || u > 0.6) continue;
    k = Math.max(k, Math.exp(-u * 22) + (u > 0.12 ? 0.75 * Math.exp(-(u - 0.12) * 14) : 0)); } return Math.min(1, k); };
  const c = new THREE.Color();
  return {
    flash,
    update(t, cam) {
      const cp = cam.position; cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
      const cx = cp.x + fwd.x * radius * 0.55, cz = cp.z + fwd.z * radius * 0.55, y0 = Math.min(ground ?? 0, cp.y - top * 0.5);
      for (let i = 0; i < n; i++) { const [u, v, ph, s] = P[i];
        const yy = y0 + ((ph * top - t * speed * s) % top + top) % top;
        o.position.set(cx + u * radius + (yy - y0) * wind, yy, cz + v * radius); o.rotation.set(0, 0, wind); o.scale.set(1, s, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
      im.instanceMatrix.needsUpdate = true;
      if (sp) { const gx = cp.x + fwd.x * 9, gz = cp.z + fwd.z * 9;
        SPL.forEach(([ph, per], i) => { const cyc = Math.floor(t / per + ph), a = (t / per + ph) - cyc;
          o.position.set(gx + (hash(i, cyc) * 2 - 1) * 11, (ground ?? 0) + 0.03, gz + (hash(cyc, i + 7) * 2 - 1) * 8); o.rotation.set(0, 0, 0);
          o.scale.setScalar(0.4 + a * 3.2); o.updateMatrix(); sp.setMatrixAt(i, o.matrix); c.setScalar(Math.max(0, 1 - a) * 0.9); sp.setColorAt(i, c); });
        sp.instanceMatrix.needsUpdate = true; sp.instanceColor.needsUpdate = true; }
      const f = flash(t); flashL.intensity = f * lightMax; flashH.intensity = f * lightMax * 0.5;
    },
  };
}
// glossy wet street with darker mirror-like puddles (size x size, centred at [x,z])
export function wetFloor(S, { size = 120, x = 0, z = -20, puddles = 18, seed = 5, col = '#1a1a22', area = [-12, 12, -8, 10] } = {}) {
  const t = ctex(512, 512, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); noise(c, w, h, 2.4, 0.16);
    c.strokeStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.moveTo(Math.random() * w, Math.random() * h); c.lineTo(Math.random() * w, Math.random() * h); c.stroke(); } });
  t.repeat.set(size / 8, size / 8);
  box(S, [size, 0.3, size], [x, -0.15, z], M({ map: t, bumpMap: t, bumpScale: 0.6, roughness: 0.22, metalness: 0.45 }), { r: 0, cast: false, name: 'ground' });
  const R = rng(seed), pm = M({ color: 0x0a0c12, roughness: 0.04, metalness: 0.8 });
  for (let i = 0; i < puddles; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(1, 24), pm); p.rotation.x = -Math.PI / 2;
    p.scale.set(0.8 + R() * 2.4, 0.5 + R() * 1.4, 1); p.position.set(area[0] + R() * (area[1] - area[0]), 0.012, area[2] + R() * (area[3] - area[2])); p.receiveShadow = true; S.add(p); }
}
// vertical light reflection on wet ground (streetlamp / neon / window glow), stretched toward +z (the camera)
const streakTex = () => TXC.streak || (TXC.streak = ctex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const r = c.createLinearGradient(0, 0, w, 0); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(0.5, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,1)');
  c.globalCompositeOperation = 'destination-out'; c.fillStyle = r; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.5})`; c.fillRect(0, y, w, 3); } }));
export function lightStreak(S, [x, z], col = 0xffd8a0, { len = 8, w = 1.4, k = 0.7 } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshBasicMaterial({ map: streakTex(), color: new THREE.Color(col).multiplyScalar(k), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z + len * 0.35); S.add(m); return m;
}
// rain on a window pane: static droplets + streaks that run down (transparent overlay). Returns update(t).
export function rainGlass(S, [w, h], [x, y, z], ry = 0, { tint = 0x9ab8e8, opacity = 0.9 } = {}) {
  const drops = ctex(256, 256, (c, W, H) => { c.clearRect(0, 0, W, H); for (let i = 0; i < 260; i++) { const px = Math.random() * W, py = Math.random() * H, r = 0.8 + Math.random() * 2.6;
    c.fillStyle = `rgba(220,235,255,${0.25 + Math.random() * 0.4})`; c.beginPath(); c.ellipse(px, py, r, r * 1.25, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(px - r * 0.3, py - r * 0.5, 1, 1); } }, [w / 3, h / 3]);
  const runs = ctex(256, 512, (c, W, H) => { c.clearRect(0, 0, W, H); for (let i = 0; i < 26; i++) { let px = Math.random() * W; const py = Math.random() * H, L = 40 + Math.random() * 160;
    c.strokeStyle = `rgba(200,225,255,${0.25 + Math.random() * 0.35})`; c.lineWidth = 1 + Math.random() * 1.8; c.beginPath(); c.moveTo(px, py);
    for (let s = 0; s < L; s += 8) { px += (Math.random() - 0.5) * 3; c.lineTo(px, py + s); } c.stroke(); c.fillStyle = 'rgba(235,245,255,0.8)'; c.beginPath(); c.arc(px, py + L, 2.4, 0, 7); c.fill(); } }, [w / 4, h / 6]);
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry * D; S.add(g);
  const mk = (map, dz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, color: tint, transparent: true, opacity, roughness: 0.05, metalness: 0.1, depthWrite: false, emissive: tint, emissiveMap: map, emissiveIntensity: 0.25 }));
    m.position.z = dz; g.add(m); return m; };
  mk(drops, 0.01); const rm = mk(runs, 0.02);
  return (t) => { rm.material.map.offset.y = t * 0.09; };
}
// projected light through a window: SpotLight with a cookie texture -> blinds stripes or rain-streaked window shadows on walls/faces
export function patternLight(S, { pos = [6, 8, 6], target = [0, 3, -4], col = 0x8ab0ff, intensity = 60, angle = 0.5, pattern = 'blinds', dist = 40 } = {}) {
  const key = 'pl_' + pattern; const tex = TXC[key] || (TXC[key] = ctex(256, 256, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2; const g = c.createRadialGradient(cx, cy, 10, cx, cy, w / 2); g.addColorStop(0, '#fff'); g.addColorStop(0.75, '#ddd'); g.addColorStop(1, '#000');
    c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#000';
    if (pattern === 'blinds') for (let y = 0; y < h; y += 22) c.fillRect(0, y, w, 9);
    if (pattern === 'window' || pattern === 'rain') { c.fillRect(w / 2 - 5, 0, 10, h); c.fillRect(0, h / 2 - 5, w, 10); }
    if (pattern === 'rain') for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(0,0,0,${0.3 + Math.random() * 0.5})`; let px = Math.random() * w, py = Math.random() * h; const L = 10 + Math.random() * 50;
      for (let s = 0; s < L; s += 3) { px += (Math.random() - 0.5) * 1.5; c.fillRect(px, py + s, 2.2, 3); } } }));
  const s = new THREE.SpotLight(col, intensity, dist, angle, 0.35, 1.4); s.position.set(...pos); s.target.position.set(...target);
  s.map = tex; s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0008; S.add(s, s.target); return s;
}
