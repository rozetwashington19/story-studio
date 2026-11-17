// Sets + props added in episode 004 (The Echo Woods): camping (tent, campfire with flickering light, log seat,
// lantern), lasagna pan, whistle, sound rings (visible yells), floating "Z"s, blanket, tiny glowing "wisp" creature.
// All exported via kit.js.
import * as THREE from 'three';
import { std, box } from './sets.js';

const D = Math.PI / 180;
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const tag = (g, name) => { g.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = 'prop'; } }); return g; };

// ---------- tent: A-frame, door facing +Z (rotate g) ; footprint ~ w x d ----------
const tentTex = {};
export function tent(S, [x, z], { col = 0xe8743a, ry = 0, w = 4.2, d = 4.6, h = 3.4, name = 'tent', glow = false } = {}) {
  const key = col; if (!tentTex[key]) tentTex[key] = ctex(256, 256, (c, W, H) => { const base = new THREE.Color(col);
    c.fillStyle = '#' + base.getHexString(); c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 3;
    for (let i = 0; i < W; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, H); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(0, H * 0.88, W, H * 0.06); });
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry * D; S.add(g);
  const m = std({ map: tentTex[key], roughness: 0.9, side: THREE.DoubleSide, emissive: glow ? 0xffa040 : 0x000000, emissiveIntensity: glow ? 0.25 : 0 });
  const half = w / 2, sl = Math.hypot(half, h);
  const th = Math.atan2(h, half);
  for (const s of [-1, 1]) { const p = mesh(new THREE.PlaneGeometry(sl, d), m); p.geometry.rotateX(-Math.PI / 2); p.rotation.z = s < 0 ? th : -th; p.position.set(s * half / 2, h / 2, 0); g.add(p); }
  // back triangle + front door flaps (dark opening)
  const tri = new THREE.Shape(); tri.moveTo(-half, 0); tri.lineTo(half, 0); tri.lineTo(0, h); tri.lineTo(-half, 0);
  const back = mesh(new THREE.ShapeGeometry(tri), m); back.position.z = -d / 2; g.add(back);
  const door = new THREE.Shape(); door.moveTo(-half * 0.55, 0); door.lineTo(half * 0.55, 0); door.lineTo(0, h * 0.62); door.lineTo(-half * 0.55, 0);
  const dk = new THREE.Mesh(new THREE.ShapeGeometry(door), new THREE.MeshBasicMaterial({ color: glow ? 0xffc070 : 0x1a1008 })); dk.position.set(0, 0, d / 2 + 0.01); g.add(dk);
  for (const s of [-1, 1]) { const f = new THREE.Shape(); f.moveTo(s * half * 0.55, 0); f.lineTo(s * half, 0); f.lineTo(0, h); f.lineTo(0, h * 0.62); f.lineTo(s * half * 0.55, 0);
    const fl = mesh(new THREE.ShapeGeometry(f), m); fl.position.z = d / 2; g.add(fl); }
  const pole = std({ color: 0x5a4a3a }); box(g, [0.12, 0.6, 0.12], [0, h + 0.2, d / 2], pole, { r: 0, solid: false }); box(g, [0.12, 0.6, 0.12], [0, h + 0.2, -d / 2], pole, { r: 0, solid: false });
  const rope = std({ color: 0xe8e0c8 }); for (const s of [-1, 1]) { const r = box(g, [0.04, 0.04, 1.6], [0, h * 0.75, s * (d / 2 + 0.6)], rope, { r: 0, solid: false, cast: false }); r.rotation.x = s * 0.9; }
  if (glow) { const l = new THREE.PointLight(0xffb060, 5, 7, 2); l.position.set(0, 1.2, 0); g.add(l); }
  box(S, [w, 2.4, d], [x, 1.2, z], std({ visible: false }), { r: 0, cast: false, name, rot: [0, ry * D, 0] });
  return g;
}

// ---------- campfire: stones, logs, animated flames + flickering light. update(t) ----------
export function campfire(S, [x, z], { s = 1, intensity = 26 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); S.add(g);
  const st = std({ color: 0x7a7670, roughness: 1 });
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const r = mesh(new THREE.DodecahedronGeometry(0.32, 0), st); r.position.set(Math.cos(a) * 1.05, 0.15, Math.sin(a) * 1.05); r.rotation.set(i, i * 2, 0); g.add(r); }
  const wd = std({ color: 0x5a3a22, roughness: 1 }), ch = std({ color: 0x1a1210, emissive: 0xff4a10, emissiveIntensity: 0.6 });
  for (let i = 0; i < 4; i++) { const l = mesh(new THREE.CylinderGeometry(0.13, 0.15, 1.6, 8), i % 2 ? ch : wd); l.rotation.set(0.5, i * Math.PI / 2 + 0.4, Math.PI / 2 - 0.5); l.position.y = 0.35; g.add(l); }
  const fl = []; const fm = [0xffe070, 0xff9a30, 0xff5a20];
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.3 - (i % 3) * 0.06, 1.2, 8), new THREE.MeshBasicMaterial({ color: fm[i % 3], transparent: true, opacity: 0.9 }));
    f.position.set(Math.cos(i * 2.1) * 0.22, 0.75, Math.sin(i * 2.1) * 0.22); g.add(f); fl.push(f); }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff0b0 })); core.position.y = 0.45; g.add(core);
  const L = new THREE.PointLight(0xff9a4a, intensity, 22, 1.5); L.position.set(0, 1.8, 0); g.add(L);
  const sparks = []; for (let i = 0; i < 12; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffc060 })); g.add(p); sparks.push(p); }
  box(S, [2.4, 0.6, 2.4], [x, 0.3, z], std({ visible: false }), { r: 0, cast: false, name: 'campfire' });
  g.userData.update = (t) => {
    fl.forEach((f, i) => { const k = 0.75 + 0.35 * Math.sin(t * (9 + i) + i * 1.7) * Math.sin(t * 4.3 + i); f.scale.set(1, k, 1); f.position.y = 0.45 + 0.6 * k; f.rotation.z = Math.sin(t * 6 + i) * 0.15; });
    L.intensity = intensity * (0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 7.3));
    sparks.forEach((p, i) => { const u = ((t * 0.6 + i / sparks.length) % 1); p.position.set(Math.sin(i * 3 + t) * 0.4 * u, 0.8 + u * 3.2, Math.cos(i * 5 + t) * 0.4 * u); p.visible = u < 0.9; });
  };
  return g;
}

// log seat (length along x)
export function logSeat(S, [x, z], { len = 4, ry = 0, name = 'log' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry * D; S.add(g);
  const bark = std({ color: 0x6a4a30, roughness: 1 }), ring = std({ color: 0xc8a070 });
  const l = mesh(new THREE.CylinderGeometry(0.5, 0.55, len, 14), bark); l.rotation.z = Math.PI / 2; l.position.y = 0.5; g.add(l);
  for (const s of [-1, 1]) { const c = mesh(new THREE.CircleGeometry(0.48, 14), ring); c.position.set(s * (len / 2 + 0.01), 0.5, 0); c.rotation.y = s * Math.PI / 2; g.add(c); }
  return g;   // seat top y = 1.0
}

// camping lantern (warm practical light); returns group
export function lantern(S, [x, y, z], { col = 0xffc070, intensity = 6 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  const mt = std({ color: 0x2a3a2a, metalness: 0.5, roughness: 0.4 });
  g.add(mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 12), mt)).position.y = 0;
  const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 12), new THREE.MeshBasicMaterial({ color: 0xffe0a0 })); gl.position.y = 0.32; g.add(gl);
  const top = mesh(new THREE.ConeGeometry(0.32, 0.25, 12), mt); top.position.y = 0.7; g.add(top);
  const L = new THREE.PointLight(col, intensity, 9, 1.8); L.position.y = 0.4; g.add(L);
  return g;
}

// lasagna in a baking dish (top at y + 0.5); .userData.eat(k) 0..1 removes the lasagna
export function lasagna(S, [x, y, z]) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  box(g, [1.8, 0.4, 1.2], [0, 0.2, 0], std({ color: 0xf2f0ea, roughness: 0.3 }), { r: 0.06, solid: false });
  const food = new THREE.Group(); food.position.y = 0.42; g.add(food);
  const lay = [0xe8c070, 0xc8402a, 0xf2e0a0, 0xc8402a];
  lay.forEach((c, i) => box(food, [1.6, 0.06, 1.0], [0, i * 0.06, 0], std({ color: c }), { r: 0.01, solid: false, cast: false }));
  box(food, [1.6, 0.05, 1.0], [0, 0.26, 0], std({ color: 0xf0b850, roughness: 0.5 }), { r: 0.02, solid: false, cast: false });
  g.userData.eat = (k) => { food.scale.set(Math.max(0.001, 1 - k), 1, 1); food.position.x = -k * 0.8; food.visible = k < 0.98; };
  return g;
}

// coach's whistle (hang at a hand / mouth)
export function whistle(S) {
  const g = new THREE.Group(); const m = std({ color: 0xd8dce0, metalness: 0.8, roughness: 0.25 });
  const b = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 14), m); b.rotation.z = Math.PI / 2; g.add(b);
  const n = mesh(new THREE.BoxGeometry(0.1, 0.12, 0.3), m); n.position.set(0, 0.06, 0.2); g.add(n);
  S.add(g); return g;
}

// sound rings: expanding glowing rings from a point toward a direction (visible yell). update(t, origin, dirYdeg, power 0..1)
export function soundRings(S, { col = 0xbfe8ff, n = 4 } = {}) {
  const R = []; for (let i = 0; i < n; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false })); S.add(r); R.push(r); }
  return { rings: R, update(t, [x, y, z], dirY = 0, power = 1) {
    const fx = Math.sin(dirY * D), fz = Math.cos(dirY * D);
    R.forEach((r, i) => { const u = (t * 1.6 + i / n) % 1; const d = 0.4 + u * 3.2 * (0.6 + power * 0.6);
      r.position.set(x + fx * d, y, z + fz * d); r.rotation.set(0, dirY * D, 0); r.scale.setScalar((0.35 + u * 1.3) * (0.6 + power * 0.5));
      r.material.opacity = power * (1 - u) * 0.7; r.visible = power > 0.02; }); } };
}

// floating "Z"s rising from a point. update(t, [x,y,z], on 0..1)
const zTex = {};
export function zzz(S, { n = 3, size = 1, col = '#e8f0ff' } = {}) {
  if (!zTex[col]) zTex[col] = ctex(128, 128, (c, w, h) => { c.font = 'bold 110px Inter, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#1a2040'; c.strokeText('Z', 64, 68); c.fillStyle = col; c.fillText('Z', 64, 68); });
  const Z = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex[col], transparent: true, depthWrite: false })); s.scale.setScalar(size); S.add(s); Z.push(s); }
  return { update(t, [x, y, z], on = 1) { Z.forEach((s, i) => { const u = (t * 0.45 + i / n) % 1; s.position.set(x + u * 1.6 + Math.sin(t * 2 + i) * 0.3, y + u * 3, z); s.scale.setScalar(size * (0.5 + u)); s.material.opacity = on * Math.sin(u * Math.PI); s.visible = on > 0.02; }); } };
}

// patchwork blanket: a soft plane draped from y; .userData.cover(k) unrolls 0..1 (k=1 full w x d)
const blTex = {};
export function blanket(S, { w = 8, d = 6, cols = ['#e86a6a', '#f2c24a', '#6ab0e8', '#7ad08a'] } = {}) {
  const key = cols.join(); if (!blTex[key]) blTex[key] = ctex(256, 256, (c, W, H) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = cols[(i + j * 3) % cols.length]; c.fillRect(i * 64, j * 64, 64, 64); }
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.setLineDash([8, 8]); c.lineWidth = 4; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, H); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(W, i * 64); c.stroke(); } });
  const geo = new THREE.PlaneGeometry(w, d, 16, 12); const m = mesh(geo, std({ map: blTex[key], side: THREE.DoubleSide, roughness: 0.95 }));
  const g = new THREE.Group(); g.add(m); S.add(g); const p = geo.attributes.position, orig = p.array.slice();
  g.userData.cover = (k, t = 0) => { for (let i = 0; i < p.count; i++) { const ox = orig[i * 3], oy = orig[i * 3 + 1]; const v = (oy / d + 0.5);   // 0 bottom .. 1 top
    const shown = v > 1 - k; const yy = shown ? oy : d / 2 - (1 - k) * d; p.setXYZ(i, ox, Math.max(yy, oy), Math.sin(ox * 1.3 + oy * 0.9 + t) * 0.12 + (shown ? 0 : 0.05)); }
    p.needsUpdate = true; geo.computeVertexNormals(); m.visible = k > 0.01; };
  g.userData.mesh = m; return g;
}

// tiny glowing wisp creature (a whispered echo): round glowing body, two dot eyes, little arms. update(t)
export function wisp(S, { col = 0xbfe8ff, size = 1, light = 5 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(size); S.add(g);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.6, roughness: 0.4 })); g.add(b);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 10), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, depthWrite: false })); g.add(halo);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1a2040 })); e.position.set(s * 0.15, 0.08, 0.41); e.scale.y = 1.4; g.add(e); }
  const sm = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0x1a2040 })); sm.rotation.z = Math.PI; sm.position.set(0, -0.08, 0.42); g.add(sm);
  const arms = [-1, 1].map(s => { const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.25, 4, 8), b.material); a.position.set(s * 0.45, -0.05, 0.1); a.rotation.z = s * 1.0; g.add(a); return a; });
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 12), b.material); tail.rotation.x = Math.PI; tail.position.y = -0.5; g.add(tail);
  const L = new THREE.PointLight(col, light, 7, 1.8); g.add(L);
  g.userData.update = (t, wave = 0) => { b.scale.setScalar(1 + Math.sin(t * 5) * 0.04); halo.scale.setScalar(1 + Math.sin(t * 3) * 0.1); tail.rotation.z = Math.sin(t * 6) * 0.3;
    arms.forEach((a, i) => a.rotation.z = (i ? 1 : -1) * (1.0 + (wave && i ? 1.2 + Math.sin(t * 12) * 0.4 : Math.sin(t * 4 + i) * 0.2))); };
  g.userData.light = L; return g;
}
