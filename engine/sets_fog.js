// Series kit — THE FOG (choose-your-path, episodes/series/fog). Shared by every part. First built for Part 1 (episode 015).
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   fogBank(S, { n, area: [x0, x1, z0, z1], y: [lo, hi], size: [min, max], col, opacity, seed })  the memory fog: soft unlit puffs filling an area.
//       .update(t, mask) — mask(x, z) → 0..1 density at a point (fogFront / fogRing build masks); puffs drift, curl and fade with the mask.
//   fogFront(x, soft, dir) mask: fog where (x - front)·dir > 0 (rolls along x) · fogRing(cx, cz, r, soft) mask: fog everywhere outside a clear circle
//   fogTouch(A, k)  a person the fog touched: colour drains toward grey-blue (k 0..1); pair with face 'blank' (new) and a stop mid-step.
//   fogPhone(S)  your phone: .screen('alerts'|'nell1'|'nell2'|'lock', k) (k = how much of the message is shown), .glow light for the face.
//   iceTruck(S, { lights })  ABE'S ICE CREAM truck: origin at ground centre, faces +x (x -6.5..6.5, z ±2.6, roof 7.6), serving window on the +z side,
//       roof cone + speaker horn, marquee bulbs. .update(t, { jingle 0..1, head 0..1 }) blinks the bulbs to the jingle; tagged solid 'truck*'.
//   harborStreet(S, { time: 'predawn'|'day', truck: [x, z] | false, siren })  Harbor Street, Harbor Point: houses fronts z -14 at x -36 -24 -12 0 (YOU, green door,
//       porch top 0.9 z -14..-11.4, door x ±1.2) 12; road z -10..6, sidewalks; lamps at z -11 (x -30, -6, 18); PELL's house x 12 (door x 10.8, porch z -14..-11.4 top 0.9) + trash cans (16.4, -11.4) (17.3, -9.6); siren pole (21, -11);
//       a gap x 18..60 shows the bay, the long BRIDGE to the mainland (lamps) and KESSLER HILL with the radio tower (red light); shops across the street (z 24, for reverse shots).
//       env.truck (if truck), env.siren(k) red beacon power, env.lamps, env.update(t).
//   harborFlat(S, { tv })  your little flat over Harbor Street (pre-dawn): walls x ±10, back z -9, ceiling 9, front wall z 12 (open for cameras at z < 12).
//       Bed back-left (x -9.6..-5.2, z -8.8..-2.6, mattress top 1.9; sit on its edge with sitOn(A, 1.9) at (-7.4, z -1.6)); TV on a low cabinet (screen centre (-0.8, 4.4, -8.5),
//       3.8 × 2.3, env.tv(mode, k, t): 'off'|'advisory'|'forget'|'map'); window x 3.2..8.2, y 3..7.6 on the back wall (red siren flashes through it);
//       front door on the right wall x 10, z 2.6..6.2 (env.door.open(k), env.under(k) fog curling in under it); free floor x -4..8, z -6..10.
//   truckCab(S, { ring })  inside Abe's truck: seats facing +z at x -2.4 (Abe, driver) / 2.4 (you), seat top 1.6 at z -0.6 (sitOn(A, 1.6), whitelist 'seat*');
//       dash top 3.2 (z 2.6..4.2) with the JINGLE switch (env.sw), speaker grille + battery LCD (env.meter(text, red)), Abe's old KESSLER HILL badge (env.badge, at (2.7, 3.44, 3.2), faces up toward you); switch at x -0.9, LCD centre (0.8, 3.95, 2.64);
//       steering wheel; windshield (z 4.4, y 3.3..7.1) looks out at the fog ring (env.fog — fogRing around the truck, r ≈ 15), Mr. Pell standing in the fog (env.pell spot (-7, 0, 26));
//       the ice-cream back behind the seats (freezer, cone menu, string lights). Cameras: outside the windshield at z 8–12 looking -z, or behind the seats looking +z.
//   hospitalRoof(S)  Mainland General roof at night: deck x ±18, z -16..10, parapet (h 1.4) + rail on the back and sides, helipad H at (5, -4), stair hut (-11.5, -11) with a
//       lit door + EXIT light, humming AC units right, red aviation lights; the fog sea below rises (env.rise(k)) and spills over the parapet; across the bay the town lights,
//       the bridge and the tower's red light.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { std, box, T } from './sets.js';
import { T2 } from './sets2.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const put = (parent, o, [x = 0, y = 0, z = 0] = [], rot) => { o.position.set(x, y, z); if (rot) o.rotation.set(...rot); parent.add(o); return o; };
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; t.userData = { c }; return t; }
const noiseFill = (c, w, h, a = 0.08, n = 3000) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); } };
const cache = {}; const once = (k, f) => cache[k] || (cache[k] = f());
const tmat = (t, rx, ry, o = {}) => { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return std({ map: c, roughness: 0.85, ...o }); };
const basic = (col, o = {}) => new THREE.MeshBasicMaterial({ color: col, ...o });
const M = (col, o = {}) => std({ color: col, roughness: 0.6, ...o });
const rb = (w, h, d, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const clamp01 = x => Math.max(0, Math.min(1, x));
const sm = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const solidify = (o, name) => { o.traverse(m => { if (m.isMesh) { m.userData.solid = true; m.name = name; } }); return o; };
const glow = (col, k = 1) => new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: k, roughness: 0.4 });

// ---------- textures ----------
const puffTex = () => once('puff', () => ctex(256, 256, (c, w, h) => { const R = rng(11);
  for (let i = 0; i < 9; i++) { const x = 70 + R() * 116, y = 80 + R() * 96, r = 40 + R() * 58; const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.55, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); } }));
const sidingTex = (col) => once('sid' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(0, y + 13, w, 3); c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(0, y, w, 3); } noiseFill(c, w, h, 0.05, 1200); }));
const shingleTex = (col) => once('shg' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 20) for (let x = (y / 20 % 2) * 16; x < w + 32; x += 32) { c.fillStyle = `rgba(0,0,0,${0.12 + Math.random() * 0.18})`; c.fillRect(x - 15, y, 30, 18); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - 16, y + 17, 32, 3); } }));
const wallpaperTex = () => once('wp', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#4a6a78'; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x, 0, 14, h); }
  c.fillStyle = 'rgba(240,230,200,0.18)'; for (let y = 16; y < h; y += 64) for (let x = 16; x < w; x += 64) { c.beginPath(); c.moveTo(x, y - 7); c.lineTo(x + 5, y); c.lineTo(x, y + 7); c.lineTo(x - 5, y); c.fill(); } noiseFill(c, w, h, 0.04, 800); }));
const boardTex = (col = '#8a6a4a') => once('brd' + col, () => ctex(512, 512, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 64) { c.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.1})`; c.fillRect(x, 0, 64, h); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x, 0, 3, h);
    for (let k = 0; k < 6; k++) { c.strokeStyle = 'rgba(40,20,8,0.2)'; c.beginPath(); const xx = x + 8 + Math.random() * 48; c.moveTo(xx, 0); c.bezierCurveTo(xx + 6, h / 3, xx - 6, 2 * h / 3, xx + 3, h); c.stroke(); } } noiseFill(c, w, h, 0.05); }));
const roofTex = () => once('rooft', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#6a6c70'; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.12, 9000);
  c.strokeStyle = 'rgba(30,30,34,0.5)'; c.lineWidth = 3; for (let x = 0; x < w; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.fillStyle = 'rgba(20,20,24,0.25)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 40, 12 + Math.random() * 20, Math.random() * 3, 0, 7); c.fill(); } }));
const truckTex = () => once('truck', () => ctex(1024, 512, (c, w, h) => {
  c.fillStyle = '#fbf6f0'; c.fillRect(0, 0, w, h);
  for (let x = -h; x < w + h; x += 90) { c.fillStyle = '#f39ab8'; c.beginPath(); c.moveTo(x, h); c.lineTo(x + 45, h); c.lineTo(x + 45 + 140, h - 140); c.lineTo(x + 140, h - 140); c.fill(); }
  c.fillStyle = '#f39ab8'; c.fillRect(0, 0, w, 54); c.fillStyle = '#7ad0d8'; c.fillRect(0, 54, w, 14);
  c.fillStyle = '#d8302a'; c.font = '900 92px Inter, sans-serif'; c.textAlign = 'center'; c.fillText("ABE'S", w * 0.27, 190); c.font = '800 56px Inter, sans-serif'; c.fillStyle = '#3a2a5a'; c.fillText('ICE CREAM', w * 0.27, 262);
  const cone = (x, y, s, col) => { c.fillStyle = '#d89a4a'; c.beginPath(); c.moveTo(x - 26 * s, y); c.lineTo(x + 26 * s, y); c.lineTo(x, y + 80 * s); c.fill(); c.strokeStyle = 'rgba(120,70,20,0.6)'; c.lineWidth = 2; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 10 * s, y); c.lineTo(x, y + 80 * s); c.stroke(); }
    c.fillStyle = col; c.beginPath(); c.arc(x, y - 6 * s, 30 * s, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(x - 10 * s, y - 16 * s, 9 * s, 0, 7); c.fill(); };
  cone(w * 0.62, 150, 1.2, '#f6c8d8'); cone(w * 0.74, 170, 1.0, '#a8e0b8'); cone(w * 0.85, 150, 1.2, '#7a4a2a');
  c.fillStyle = '#3a2a5a'; c.font = '700 34px Inter, sans-serif'; c.fillText('SINCE 1979', w * 0.27, 316); noiseFill(c, w, h, 0.04, 2000); }));

// ---------- fog kit ----------
export const fogFront = (front, soft = 6, dir = 1) => (x, z) => sm(-soft, soft * 0.4, (x - front) * dir);
export const fogRing = (cx, cz, r, soft = 5) => (x, z) => sm(r, r + soft, Math.hypot(x - cx, z - cz));
export function fogBank(S, { n = 360, area = [-60, 60, -30, 20], y = [0.5, 9], size = [5, 11], col = 0xc8d2de, opacity = 0.5, seed = 7, speed = 1 } = {}) {
  const R = rng(seed), g = new THREE.Group(); S.add(g); const ps = [];
  for (let i = 0; i < n; i++) { const m = new THREE.SpriteMaterial({ map: puffTex(), color: col, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const s = new THREE.Sprite(m); const sz = size[0] + R() * (size[1] - size[0]); s.scale.set(sz * 1.4, sz, 1); s.renderOrder = 5; g.add(s);
    ps.push({ s, x: area[0] + R() * (area[1] - area[0]), z: area[2] + R() * (area[3] - area[2]), y: y[0] + Math.pow(R(), 1.4) * (y[1] - y[0]), ph: R() * 6.28, sp: 0.3 + R() * 0.7, a: 0.6 + R() * 0.4 }); }
  g.update = (t, mask = () => 1, { k = 1, drift = [0, 0] } = {}) => { for (const p of ps) {
    const x = p.x + Math.sin(t * 0.25 * p.sp * speed + p.ph) * 1.6 + drift[0] * t, z = p.z + Math.cos(t * 0.2 * p.sp * speed + p.ph) * 1.2 + drift[1] * t;
    const d = mask(x, z) * k; p.s.visible = d > 0.01; p.s.position.set(x, p.y + Math.sin(t * 0.5 * p.sp + p.ph) * 0.4 + (1 - d) * -1.2, z);
    p.s.material.opacity = opacity * p.a * d; p.s.material.rotation = p.ph + t * 0.05 * p.sp; } };
  g.update(0); return g;
}
// curl of fog at a point (under a door, around feet): a few small puffs
export function fogWisp(S, n = 10, col = 0xc8d2de, size = 2.2, seed = 3) { return fogBank(S, { n, area: [-1, 1, -1, 1], y: [0.2, 1.4], size: [size * 0.6, size], col, opacity: 0.6, seed }); }
export function fogTouch(A, k) {
  A.root.traverse(m => { if (!m.isMesh || !m.material || !m.material.color) return;
    if (!m.userData.fogOrig) { m.material = m.material.clone(); m.userData.fogOrig = m.material.color.clone(); }
    m.material.color.copy(m.userData.fogOrig).lerp(new THREE.Color(0x9aa6b8), k * 0.55); });
}

// ---------- props ----------
export function fogPhone(S) {
  const g = new THREE.Group(); S.add(g);
  g.add(mesh(rb(0.46, 0.86, 0.07, 0.06), std({ color: 0x1a1c22, roughness: 0.3 })));
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 480; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.78), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); sc.position.z = 0.04; g.add(sc);
  const light = new THREE.PointLight(0xbfd6ff, 3, 4, 1.6); light.position.set(0, 0, 0.6); g.add(light); g.glow = light;
  let last = '';
  g.screen = (mode, k = 1, o = {}) => { const key = mode + Math.round(k * 20) + JSON.stringify(o); if (key === last) return; last = key; const c = cv.getContext('2d');
    const bg = c.createLinearGradient(0, 0, 0, 480); bg.addColorStop(0, '#1a2440'); bg.addColorStop(1, '#0a0e1a'); c.fillStyle = bg; c.fillRect(0, 0, 256, 480);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '800 46px Inter, sans-serif'; c.fillText(o.time || ('5:4' + (mode === 'nell2' ? '9' : '0')), 128, 70);
    const card = (y, hh, col, title, body, a = 1) => { c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.roundRect(14, y, 228, hh, 16); c.fill(); c.fillStyle = '#1a1a22'; c.textAlign = 'left';
      c.font = '800 19px Inter, sans-serif'; c.fillText(title, 26, y + 28); c.font = '600 18px Inter, sans-serif'; body.forEach((l, i) => c.fillText(l, 26, y + 54 + i * 22)); c.globalAlpha = 1; };
    if (mode === 'alerts') { const n = Math.round(1 + k * 22);
      for (let i = 0; i < Math.min(5, n); i++) card(100 + i * 62, 54, '#ffd8d0', '⚠ EMERGENCY ALERT', [], 1);
      c.fillStyle = '#ff3a3a'; c.beginPath(); c.arc(206, 110, 34, 0, 7); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '900 34px Inter, sans-serif'; c.fillText(String(n), 206, 122);
      c.font = '800 22px Inter, sans-serif'; c.fillText(n + ' ALERTS', 128, 440); }
    if (mode === 'nell1' || mode === 'nell2') { c.fillStyle = '#9ab0d8'; c.font = '700 20px Inter, sans-serif'; c.fillText('NELL', 128, 120);
      const msg = mode === 'nell1' ? ['Whatever you do,', "don't go outside."] : ["Fog's at the", 'hospital. On the', 'roof. Please.'];
      c.globalAlpha = clamp01(k * 2); c.fillStyle = '#3a8aff'; c.beginPath(); c.roundRect(20, 150, 216, 40 + msg.length * 32, 20); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = '800 24px Inter, sans-serif';
      msg.forEach((l, i) => c.fillText(l, 36, 186 + i * 32)); c.globalAlpha = 1; }
    if (mode === 'chat') { c.fillStyle = '#9ab0d8'; c.font = '700 20px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('NELL', 128, 112); let y = 132; const ms = o.msgs || [];   // o.msgs: [[me?, [lines]], …]; the last one types in with k
      ms.forEach(([me, lines], i) => { const a = i === ms.length - 1 ? clamp01(k * 2) : 1, hh = 22 + lines.length * 28; c.globalAlpha = a; c.fillStyle = me ? '#3ad86a' : '#3a8aff'; c.beginPath(); c.roundRect(me ? 52 : 14, y, 190, hh, 18); c.fill();
        c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = '800 21px Inter, sans-serif'; lines.forEach((l, j) => c.fillText(l, (me ? 64 : 26), y + 32 + j * 28)); c.globalAlpha = 1; y += hh + 12; }); }
    if (mode === 'lock') { c.font = '600 20px Inter, sans-serif'; c.fillText('Thursday', 128, 100); }
    t.needsUpdate = true; };
  g.screen('lock'); return g;
}
export function iceTruck(S, { lights = true } = {}) {
  const g = new THREE.Group(); S.add(g); const body = tmat(truckTex(), 1, 1, { roughness: 0.45 }), white = M(0xfaf6f0, { roughness: 0.4 }), chrome = M(0xd8dce2, { metalness: 0.8, roughness: 0.25 }), dark = M(0x1a1a1e);
  const side = (zs) => { const p = mesh(new THREE.PlaneGeometry(9.4, 5.6), body); p.position.set(-1.75, 4.6, zs * 2.61); if (zs < 0) p.rotation.y = Math.PI; g.add(p); };
  solidify(put(g, mesh(rb(9.6, 6.0, 5.2, 0.35), white), [-1.7, 4.6, 0]), 'truck box'); side(1); side(-1);
  solidify(put(g, mesh(rb(3.8, 3.0, 5.0, 0.4), M(0xf39ab8, { roughness: 0.4 })), [4.6, 2.9, 0]), 'truck hood');
  put(g, mesh(rb(3.0, 2.4, 4.8, 0.3), white), [4.0, 5.4, 0]);
  const glass = basic(0x1a2a3a); put(g, mesh(new THREE.PlaneGeometry(4.2, 1.9), glass), [5.52, 5.4, 0], [0, Math.PI / 2, 0]).rotation.order = 'YXZ';
  put(g, mesh(rb(1.0, 1.0, 5.3, 0.2), chrome), [6.6, 1.8, 0]);
  for (const zs of [-1, 1]) { put(g, mesh(new THREE.CircleGeometry(0.42, 16), glow(0xfff4d0, 1.6)), [6.52, 3.1, zs * 1.8], [0, Math.PI / 2, 0]);
    for (const x of [-4.6, 4.2]) { const w = put(g, mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.8, 20), dark), [x, 1.15, zs * 2.35], [Math.PI / 2, 0, 0]); put(g, mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.84, 12), chrome), [x, 1.15, zs * 2.35], [Math.PI / 2, 0, 0]); } }
  // serving window (+z side) with an awning + counter
  put(g, mesh(new THREE.PlaneGeometry(4.6, 2.2), glow(0xffe0b0, 0.7)), [-2.6, 4.6, 2.63]);
  put(g, mesh(new THREE.BoxGeometry(5.2, 0.2, 0.9), chrome), [-2.6, 3.4, 2.9]);
  const awn = ctex(256, 64, (c, w, h) => { for (let x = 0; x < w; x += 32) { c.fillStyle = (x / 32) % 2 ? '#f39ab8' : '#fbf6f0'; c.fillRect(x, 0, 32, h); } });
  put(g, mesh(new THREE.BoxGeometry(5.6, 0.12, 1.6), std({ map: awn })), [-2.6, 6.1, 3.3], [0.35, 0, 0]);
  // roof: giant cone + speaker horn + marquee bulbs
  const cone = new THREE.Group(); cone.position.set(-2.0, 7.6, 0); g.add(cone);
  put(cone, mesh(new THREE.ConeGeometry(1.0, 2.6, 16), M(0xd89a4a)), [0, 1.3, 0], [Math.PI, 0, 0]); put(cone, mesh(new THREE.SphereGeometry(1.15, 18, 14), M(0xf6c8d8, { roughness: 0.5 })), [0, 2.8, 0]);
  put(cone, mesh(new THREE.SphereGeometry(0.25, 10, 8), M(0xd8302a)), [0.1, 4.0, 0]);
  const horn = new THREE.Group(); horn.position.set(2.0, 7.6, 0); g.add(horn); put(horn, mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.9, 8), chrome), [0, 0.45, 0]);
  put(horn, mesh(new THREE.CylinderGeometry(0.9, 0.25, 1.4, 16, 1, true), std({ color: 0xd8dce2, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide })), [0.6, 1.2, 0], [0, 0, -Math.PI / 2]);
  const bulbs = []; const bm = (i) => glow(i % 2 ? 0xffd86a : 0xff7ab0, 0.2);
  for (let i = 0; i < 14; i++) { const b = put(g, mesh(new THREE.SphereGeometry(0.16, 8, 6), bm(i), false), [-6.3 + i * 0.94, 7.75, 2.62]); bulbs.push(b); const b2 = put(g, mesh(new THREE.SphereGeometry(0.16, 8, 6), bm(i), false), [-6.3 + i * 0.94, 7.75, -2.62]); bulbs.push(b2); }
  const pl = new THREE.PointLight(0xffa8d0, 0, 18, 1.6); pl.position.set(-1.7, 9.5, 3.5); g.add(pl);
  const head = new THREE.SpotLight(0xfff0d0, 0, 60, 0.5, 0.6, 1.2); head.position.set(6.8, 3.1, 0); head.target.position.set(30, 0, 0); g.add(head); g.add(head.target);
  g.update = (t, { jingle = 0, head: hk = lights ? 1 : 0 } = {}) => { bulbs.forEach((b, i) => { const on = jingle > 0 ? (Math.sin(t * 9 + i * 0.9) > 0 ? 1 : 0.15) : 0.15; b.material.emissiveIntensity = 0.2 + on * 2.4 * Math.max(jingle, 0.05); });
    pl.intensity = 14 * jingle * (0.8 + 0.2 * Math.sin(t * 9)); head.intensity = 80 * hk; horn.rotation.z = jingle * Math.sin(t * 30) * 0.02; };
  g.update(0); return g;
}
function house(S, [x, z], { w = 11, col = '#7ab0c8', trim = 0xf6f2ea, door = 0x2a5a3a, lit = [], porch = true, name = 'house', R = rng(1), night = true } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const h1 = 11, d = 9;
  solidify(put(g, mesh(new THREE.BoxGeometry(w, h1, d), tmat(sidingTex(col), w / 5, h1 / 5)), [0, h1 / 2, -d / 2]), name);
  const roof = new THREE.Shape(); roof.moveTo(-w / 2 - 0.6, 0); roof.lineTo(0, 4.6); roof.lineTo(w / 2 + 0.6, 0); roof.lineTo(-w / 2 - 0.6, 0);
  const rg = new THREE.ExtrudeGeometry(roof, { depth: d + 1, bevelEnabled: false }); const r = put(g, mesh(rg, tmat(shingleTex('#4a4a56'), 0.2, 0.2)), [0, h1, -d - 0.5]);
  const tr = M(trim); put(g, mesh(new THREE.BoxGeometry(w + 0.3, 0.4, 0.3), tr), [0, h1, 0.1]); for (const sx of [-1, 1]) put(g, mesh(new THREE.BoxGeometry(0.35, h1, 0.35), tr), [sx * w / 2, h1 / 2, 0.05]);
  const win = (wx, wy, on) => { put(g, mesh(new THREE.BoxGeometry(2.4, 3.0, 0.2), tr), [wx, wy, 0.05]);
    put(g, mesh(new THREE.PlaneGeometry(2.0, 2.6), on ? glow(0xffc878, night ? 1.1 : 0.15) : M(night ? 0x1a2230 : 0x5a7a9a, { roughness: 0.15, metalness: 0.3 })), [wx, wy, 0.17]);
    put(g, mesh(new THREE.BoxGeometry(0.12, 2.6, 0.05), tr), [wx, wy, 0.2]); put(g, mesh(new THREE.BoxGeometry(2.0, 0.12, 0.05), tr), [wx, wy, 0.2]); };
  win(-w / 2 + 2.3, 8.0, lit.includes(0)); win(w / 2 - 2.3, 8.0, lit.includes(1)); win(w / 2 - 2.3, 3.6, lit.includes(2));
  // door + porch
  put(g, mesh(new THREE.BoxGeometry(3.0, 6.0, 0.25), tr), [-1.2, 3.9, 0.1]); const dm = put(g, mesh(new THREE.BoxGeometry(2.4, 5.4, 0.2), M(door, { roughness: 0.5 })), [-1.2, 3.6, 0.2]); dm.name = name + ' door';
  put(g, mesh(new THREE.SphereGeometry(0.13, 8, 6), M(0xd8b048, { metalness: 0.7, roughness: 0.3 })), [-0.3, 3.4, 0.38]);
  if (porch) { solidify(put(g, mesh(new THREE.BoxGeometry(6.4, 0.9, 2.6), tmat(boardTex('#8a7a6a'), 1, 0.5)), [-1.2, 0.45, 1.3]), name + ' porch');
    const lamp = put(g, mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), glow(0xffd08a, night ? 1.4 : 0.1)), [1.0, 6.0, 0.4]);
    if (night) { const p = new THREE.PointLight(0xffc070, 6, 10, 1.6); p.position.set(1.0, 5.6, 1.4); g.add(p); } }
  // little details: mailbox, planter, house number
  put(g, mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), M(0x2a2a30)), [2.4, 4.2, 0.3]); put(g, mesh(new THREE.BoxGeometry(1.8, 0.7, 0.7), M(0x8a5a3a)), [w / 2 - 2.3, 1.9, 0.5]);
  for (let i = 0; i < 4; i++) put(g, mesh(new THREE.SphereGeometry(0.35, 8, 6), M([0xd8506a, 0xf2c84a, 0x6ab04a][i % 3])), [w / 2 - 3 + i * 0.5, 2.4, 0.5]);
  return g;
}
function lampPost(S, [x, z], { night = true, col = 0xffb860, i = 22 } = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const m = M(0x2a3038, { metalness: 0.5, roughness: 0.5 });
  solidify(put(g, mesh(new THREE.CylinderGeometry(0.18, 0.26, 9, 10), m), [0, 4.5, 0]), 'lamp post'); put(g, mesh(new THREE.BoxGeometry(2.0, 0.2, 0.3), m), [0.8, 8.9, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.2, 0.6, 0.6, 12), m), [1.6, 8.6, 0]); const bulb = put(g, mesh(new THREE.SphereGeometry(0.32, 10, 8), glow(col, night ? 2.4 : 0.1), false), [1.6, 8.3, 0]);
  let p = null; if (night) { p = new THREE.PointLight(col, i, 22, 1.5); p.position.set(1.6, 7.9, 0.4); g.add(p); } g.light = p; g.bulb = bulb; return g; }
function radioTower(S, [x, y, z], { h = 70, night = true } = {}) { const g = new THREE.Group(); g.position.set(x, y, z); S.add(g); const m = basic(night ? 0x1a1e2a : 0x8a8a90, { fog: false });
  for (let i = 0; i < 3; i++) { const a = i * 2.094, l = put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.6, h, 4), m), [Math.cos(a) * 1.6, h / 2, Math.sin(a) * 1.6]); l.rotation.z = -Math.cos(a) * 0.022; l.rotation.x = Math.sin(a) * 0.022; }
  for (let yy = 4; yy < h; yy += 6) put(g, new THREE.Mesh(new THREE.TorusGeometry(1.6 * (1 - yy / h * 0.6), 0.12, 4, 3), m), [0, yy, 0], [Math.PI / 2, 0, 0]);
  const red = put(g, new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), basic(0xff2a2a, { fog: false, toneMapped: false })), [0, h + 0.6, 0]); g.red = red; return g; }
function bridge(S, { night = true, from = [24, -40], to = [70, -420] } = {}) { const g = new THREE.Group(); S.add(g); const n = 22;
  const deck = basic(night ? 0x20242e : 0x8a8a90, { fog: true }); const lampM = basic(0xffc070, { toneMapped: false });
  for (let i = 0; i < n; i++) { const u = i / n, x = from[0] + (to[0] - from[0]) * u, z = from[1] + (to[1] - from[1]) * u, y = 6 + Math.sin(u * Math.PI) * 10;
    const seg = put(g, new THREE.Mesh(new THREE.BoxGeometry(5, 0.8, 20), deck), [x, y, z]); seg.rotation.y = Math.atan2(to[0] - from[0], to[1] - from[1]);
    put(g, new THREE.Mesh(new THREE.BoxGeometry(1.2, y, 1.2), deck), [x, y / 2 - 2, z]);
    if (i % 2 === 0) for (const s of [-1, 1]) put(g, new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 6), lampM), [x + s * 2.6, y + 3, z]); }
  return g; }
function sky(S, { night = true, day = false } = {}) { const c = ctex(16, 512, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h);
    if (day) { gg.addColorStop(0, '#5a8ad8'); gg.addColorStop(1, '#ffe2c0'); } else { gg.addColorStop(0, '#060a18'); gg.addColorStop(0.55, '#1a2a4a'); gg.addColorStop(0.85, '#3a5a72'); gg.addColorStop(1, '#5a7a8a'); }
    x.fillStyle = gg; x.fillRect(0, 0, w, h); }); S.background = c; clouds(S, day ? {} : { night: true }); }
function water(S, { y = -1.5, z0 = -18, z1 = -500, x0 = 16, x1 = 300, night = true } = {}) {
  const t = ctex(256, 256, (c, w, h) => { c.fillStyle = night ? '#0e1a2a' : '#2a6a8a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${night ? '120,150,190' : '200,230,255'},${Math.random() * 0.25})`; c.fillRect(Math.random() * w, Math.random() * h, 10 + Math.random() * 20, 2); } }, [20, 30]);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z0 - z1), std({ map: t, roughness: 0.25, metalness: 0.2 })); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); S.add(m); return m; }

// ---------- sets ----------
export function harborStreet(S, { time = 'predawn', truck = false, siren = true, pellLit = true } = {}) {
  const night = time !== 'day', R = rng(5); sky(S, { night, day: !night });
  S.fog = new THREE.Fog(night ? 0x1a2636 : 0xf2dcc0, 40, 220);
  S.add(new THREE.HemisphereLight(night ? 0x5a6a9a : 0xcfe0ff, night ? 0x1a1a22 : 0x6a5a40, night ? 0.5 : 1.0));
  const moon = new THREE.DirectionalLight(night ? 0x9ab4ff : 0xffe8c8, night ? 1.0 : 3.2); moon.position.set(night ? -30 : 30, 40, night ? 20 : 30); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02; Object.assign(moon.shadow.camera, { left: -45, right: 45, top: 30, bottom: -30, far: 160 }); S.add(moon);
  const fill = new THREE.DirectionalLight(night ? 0x6a7ab8 : 0xa8c0ff, night ? 0.35 : 0.5); fill.position.set(10, 10, 40); S.add(fill);
  box(S, [200, 0.3, 120], [0, -0.15, 20], tmat(T.asphalt(), 40, 24, { roughness: 0.75 }), { r: 0, cast: false, solid: false, name: 'road' });
  box(S, [120, 0.3, 4.2], [-28, 0.0, -12.1], tmat(T.concrete(0xa8a29a), 30, 1), { r: 0, cast: false, solid: false, name: 'sidewalk' });
  box(S, [200, 0.3, 4], [0, 0.0, 8], tmat(T.concrete(0xa8a29a), 50, 1), { r: 0, cast: false, solid: false, name: 'sidewalk2' });
  for (let x = -60; x < 60; x += 7) put(S, mesh(new THREE.BoxGeometry(3.2, 0.03, 0.3), basic(0xd8c86a)), [x, 0.02, -2]);
  const H = [[-36, '#c88a6a', 0x7a2a2a, [0]], [-24, '#e8d6a8', 0x3a4a7a, [1, 2]], [-12, '#7aa8c8', 0x2a3a5a, [2]], [0, '#e8e2d8', 0x2a6a4a, [0]], [12, '#d88a8a', 0x5a3a2a, pellLit ? [1, 2] : [1]]];
  H.forEach(([x, col, door, lit], i) => house(S, [x, -14], { col, door, lit, name: 'house' + i, night }));
  // the gap: seawall + bay + bridge + Kessler Hill
  box(S, [60, 1.6, 1.0], [48, 0.8, -14.5], tmat(T.concrete(0x8a8680), 12, 0.4), { r: 0.05, name: 'seawall' });
  for (let x = 20; x < 78; x += 5) put(S, mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 6), M(0x3a3e46)), [x, 2.2, -14.5]);
  put(S, mesh(new THREE.BoxGeometry(60, 0.1, 0.1), M(0x3a3e46)), [48, 3.2, -14.5]);
  water(S, { night }); bridge(S, { night });
  const hill = new THREE.Mesh(new THREE.SphereGeometry(80, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), basic(night ? 0x0e1420 : 0x5a7a5a, { fog: false })); hill.scale.set(1.4, 0.45, 1); hill.position.set(-90, -4, -260); S.add(hill);
  const tower = radioTower(S, [-80, 30, -250], { h: 62, night });
  const far = new THREE.Mesh(new THREE.PlaneGeometry(260, 30), basic(night ? 0x0a0e18 : 0x7a8a9a, { fog: false })); far.position.set(150, 6, -430); S.add(far);
  if (night) for (let i = 0; i < 40; i++) put(S, new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 4), basic(0xffd890, { toneMapped: false })), [60 + R() * 180, 3 + R() * 14, -425]);
  // hospital on the mainland: lit block at the end of the bridge
  const hosp = put(S, new THREE.Mesh(new THREE.BoxGeometry(30, 22, 10), basic(night ? 0x1a2030 : 0xd8d8d0, { fog: false })), [80, 12, -440]);
  if (night) for (let i = 0; i < 24; i++) put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), basic(0xbfe0ff, { toneMapped: false })), [68 + (i % 8) * 3.4, 6 + Math.floor(i / 8) * 5, -434.9]);
  // lamps, cans, siren, hydrant, parked car, shops across the street
  const lamps = [[-30, -11], [-6, -10.8], [18, -11], [-18, 7.2], [10, 7.2]].map(p => lampPost(S, p, { night }));
  for (const [x, z, c] of [[16.4, -11.4, 0x3a5a3a], [17.3, -9.6, 0x2a3a5a]]) { solidify(put(S, mesh(new THREE.CylinderGeometry(0.75, 0.65, 2.4, 14), M(c, { roughness: 0.5 })), [x, 1.2, z]), 'trash can');
    put(S, mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.25, 14), M(c)), [x, 2.5, z]); }
  const sp = new THREE.Group(); sp.position.set(21, 0, -11); S.add(sp); solidify(put(sp, mesh(new THREE.CylinderGeometry(0.3, 0.35, 13, 8), M(0x6a5a4a)), [0, 6.5, 0]), 'siren pole');
  for (const a of [0, 1.6, 3.2]) put(sp, mesh(new THREE.CylinderGeometry(0.7, 0.2, 1.4, 12), M(0x8a8e96, { metalness: 0.6 })), [Math.cos(a) * 0.8, 12, Math.sin(a) * 0.8], [0, -a, Math.PI / 2]);
  const beacon = put(sp, mesh(new THREE.SphereGeometry(0.5, 10, 8), glow(0xff2a1a, 0.5), false), [0, 13.4, 0]);
  const red = new THREE.PointLight(0xff2a1a, 0, 34, 1.6); red.position.set(19.5, 12.5, -8); S.add(red);
  put(S, mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.6, 10), M(0xd8302a)), [-20, 0.8, -11.4]);
  const car = new THREE.Group(); car.position.set(-30, 0, -6.5); S.add(car); solidify(put(car, mesh(rb(9, 2.4, 4, 0.5), M(0x3a5a8a, { roughness: 0.35 })), [0, 1.8, 0]), 'car');
  put(car, mesh(rb(5, 2, 3.6, 0.5), M(0x2a3a50, { roughness: 0.2 })), [-0.5, 3.6, 0]); for (const [x, z] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) put(car, mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 14), M(0x1a1a1e)), [x, 0.9, z], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 6; i++) { const x = -40 + i * 15; const sh = put(S, mesh(new THREE.BoxGeometry(13, 8 + (i % 3) * 2, 6), tmat(sidingTex(['#5a6a8a', '#8a6a5a', '#6a8a7a'][i % 3]), 2, 2)), [x, 4 + (i % 3), 27]);
    put(S, mesh(new THREE.PlaneGeometry(6, 2.6), i % 2 ? glow(0xffc070, night ? 0.9 : 0.1) : M(0x1a2230)), [x, 3, 23.95], [0, Math.PI, 0]); }
  const env = { lamps, tower, hill };
  if (truck) { const tr = iceTruck(S); tr.position.set(truck[0], 0, truck[1]); env.truck = tr; }
  let sirenK = siren ? 1 : 0; env.siren = k => { sirenK = k; };
  env.update = (t) => { const ph = (Math.sin(t * 5) + 1) / 2; red.intensity = night ? sirenK * 55 * Math.pow(ph, 2) : 0; beacon.material.emissiveIntensity = 0.3 + sirenK * 3 * ph;
    red.position.set(21 + Math.cos(t * 5) * 3, 12.5, -11 + Math.sin(t * 5) * 3); tower.red.visible = Math.sin(t * 2.2) > -0.3; };
  return env;
}

export function harborFlat(S, { tv = 'off' } = {}) {
  const W = 10, Z0 = -9, Z1 = 12, H = 9;
  S.background = new THREE.Color(0x0a0e1a);
  box(S, [2 * W, 0.3, Z1 - Z0], [0, -0.15, (Z0 + Z1) / 2], tmat(boardTex('#8a6448'), 3, 3, { roughness: 0.6 }), { r: 0, cast: false, name: 'floor' });
  const wp = (rx) => tmat(wallpaperTex(), rx, 2.2);
  const wx0 = 3.2, wx1 = 8.2, wy0 = 3, wy1 = 7.6;
  box(S, [wx0 + W, H, 0.5], [(-W + wx0) / 2, H / 2, Z0 - 0.25], wp(4), { r: 0, cast: false, name: 'back wall L' });
  box(S, [W - wx1, H, 0.5], [(W + wx1) / 2, H / 2, Z0 - 0.25], wp(0.6), { r: 0, cast: false, name: 'back wall R' });
  box(S, [wx1 - wx0, wy0, 0.5], [(wx0 + wx1) / 2, wy0 / 2, Z0 - 0.25], wp(1), { r: 0, cast: false, name: 'back wall sill' });
  box(S, [wx1 - wx0, H - wy1, 0.5], [(wx0 + wx1) / 2, (H + wy1) / 2, Z0 - 0.25], wp(1), { r: 0, cast: false, name: 'back wall top' });
  const frameM = M(0xf2eee0); box(S, [wx1 - wx0 + 0.5, 0.3, 0.9], [(wx0 + wx1) / 2, wy0 - 0.1, Z0 + 0.15], frameM, { r: 0.05, cast: false, solid: false });
  box(S, [0.18, wy1 - wy0, 0.25], [(wx0 + wx1) / 2, (wy0 + wy1) / 2, Z0 - 0.25], frameM, { r: 0, cast: false, solid: false });
  box(S, [wx1 - wx0, 0.18, 0.25], [(wx0 + wx1) / 2, (wy0 + wy1) / 2 + 0.6, Z0 - 0.25], frameM, { r: 0, cast: false, solid: false });
  // curtains
  for (const sx of [-1, 1]) box(S, [1.3, 5.8, 0.25], [sx < 0 ? wx0 - 0.4 : wx1 + 0.4, 5.1, Z0 + 0.35], M(0xb84a3a, { roughness: 1 }), { r: 0.12, cast: false, solid: false, name: 'curtain' });
  // the view: houses across the street at pre-dawn, streetlamp, red siren glow
  const view = ctex(512, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#3a5a72'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#121a26'; c.fillRect(0, 230, 170, 282); c.fillRect(190, 260, 160, 252); c.fillRect(370, 210, 160, 302);
    c.beginPath(); c.moveTo(-10, 232); c.lineTo(85, 160); c.lineTo(180, 232); c.fill(); c.beginPath(); c.moveTo(360, 212); c.lineTo(450, 140); c.lineTo(540, 212); c.fill();
    c.fillStyle = '#ffc070'; [[40, 300], [110, 380], [230, 320], [420, 280], [470, 380]].forEach(([x, y]) => c.fillRect(x, y, 34, 40));
    c.fillStyle = 'rgba(255,190,110,0.35)'; c.beginPath(); c.arc(330, 250, 60, 0, 7); c.fill(); c.fillStyle = '#ffe0a0'; c.beginPath(); c.arc(330, 250, 10, 0, 7); c.fill(); });
  const viewM = basic(0xffffff, { map: view, fog: false }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(14, 14), viewM), [(wx0 + wx1) / 2, 5, Z0 - 4]);
  const redPane = put(S, new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0, fog: false })), [(wx0 + wx1) / 2, 5, Z0 - 3.9]);
  box(S, [0.5, H, Z1 - Z0], [-(W + 0.25), H / 2, (Z0 + Z1) / 2], wp(6), { r: 0, cast: false, name: 'side wall' });
  // right wall with the doorway (z 2.6..6.2, h 7.4)
  box(S, [0.5, H, 2.6 - Z0], [W + 0.25, H / 2, (Z0 + 2.6) / 2], wp(3), { r: 0, cast: false, name: 'side wall R1' });
  box(S, [0.5, H, Z1 - 6.2], [W + 0.25, H / 2, (6.2 + Z1) / 2], wp(2), { r: 0, cast: false, name: 'side wall R2' });
  box(S, [0.5, H - 7.4, 3.6], [W + 0.25, (H + 7.4) / 2, 4.4], wp(0.6), { r: 0, cast: false, name: 'side wall R3' });
  box(S, [2 * W, H, 0.5], [0, H / 2, Z1 + 0.25], wp(6), { r: 0, cast: false, solid: false, name: 'front wall' });
  box(S, [2 * W + 1, 0.4, Z1 - Z0 + 1], [0, H + 0.2, (Z0 + Z1) / 2], M(0xe8e2d4, { roughness: 1 }), { r: 0, cast: false, solid: false });
  box(S, [2 * W, 0.5, 0.2], [0, 0.25, Z0 + 0.1], M(0xf2eee0), { r: 0, cast: false, solid: false }); // skirting
  // bed (iron frame, sailor-stripe duvet)
  const duvet = ctex(256, 256, (c, w, h) => { c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 40) { c.fillStyle = '#2a3a6a'; c.fillRect(0, y, w, 18); } });
  const iron = M(0xe8e8e2, { metalness: 0.4, roughness: 0.4 });
  box(S, [4.4, 0.8, 6.0], [-7.4, 0.9, -5.7], M(0x5a4a3a), { r: 0.05, name: 'bed frame' });
  box(S, [4.3, 0.6, 5.9], [-7.4, 1.6, -5.7], M(0xf6f2e8), { r: 0.15, cast: false, solid: false, name: 'mattress' });
  const blanket = box(S, [4.5, 0.3, 4.0], [-7.4, 2.0, -4.6], std({ map: duvet, roughness: 1 }), { r: 0.12, cast: false, solid: false, name: 'duvet' });
  box(S, [3.0, 0.6, 1.3], [-7.4, 2.15, -8.0], M(0xffffff), { r: 0.25, cast: false, solid: false, name: 'pillow' });
  for (const z of [-8.75, -2.7]) { for (const x of [-9.5, -5.3]) put(S, mesh(new THREE.CylinderGeometry(0.12, 0.12, z < -5 ? 4.4 : 2.8, 8), iron), [x, z < -5 ? 2.2 : 1.4, z]);
    for (const y of z < -5 ? [2.6, 3.4, 4.2] : [1.9, 2.6]) put(S, mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.2, 6), iron), [-7.4, y, z], [0, 0, Math.PI / 2]); }
  // nightstand + lamp (warm practical) + glass
  box(S, [1.6, 2.0, 1.6], [-4.2, 1.0, -8.0], M(0x6a4a2a), { r: 0.08, name: 'nightstand' });
  put(S, mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.0, 10), M(0x2a6a7a)), [-4.2, 2.5, -8.0]);
  put(S, mesh(new THREE.CylinderGeometry(0.4, 0.65, 0.8, 14, 1, true), std({ color: 0xfff0d0, emissive: 0xffd090, emissiveIntensity: 0.9, side: THREE.DoubleSide }), false), [-4.2, 3.3, -8.0]);
  put(S, mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.45, 10), std({ color: 0xcfe8ff, transparent: true, opacity: 0.5, roughness: 0.05 })), [-3.7, 2.22, -7.6]);
  // TV cabinet + TV
  box(S, [4.6, 2.2, 1.4], [-0.8, 1.1, -8.2], tmat(boardTex('#5a3a22'), 1, 0.5), { r: 0.06, name: 'tv cabinet' });
  put(S, mesh(rb(4.2, 2.7, 0.3, 0.1), M(0x15161a, { roughness: 0.3 })), [-0.8, 4.4, -8.4]);
  const tcv = document.createElement('canvas'); tcv.width = 512; tcv.height = 310; const ttex = new THREE.CanvasTexture(tcv); ttex.colorSpace = THREE.SRGBColorSpace;
  const scr = put(S, new THREE.Mesh(new THREE.PlaneGeometry(3.9, 2.36), new THREE.MeshBasicMaterial({ map: ttex, toneMapped: false })), [-0.8, 4.4, -8.23]);
  const tvL = new THREE.PointLight(0x9ab8ff, 0, 14, 1.6); tvL.position.set(-0.8, 4.4, -6.4); S.add(tvL);
  for (let i = 0; i < 5; i++) put(S, mesh(new THREE.BoxGeometry(0.4, 1.2 + (i % 2) * 0.2, 0.9), M([0xd8302a, 0x2a5a8a, 0xf2c84a, 0x3a8a5a, 0xe8e2d4][i])), [-2.6 + i * 0.45, 2.8, -8.1]);
  // ship in a bottle, framed photo (you + Nell), regatta poster, life ring, rope coil, plant, dog bed, coat hooks + shelf
  put(S, mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.5, 12), std({ color: 0xcfe8d8, transparent: true, opacity: 0.4, roughness: 0.05 })), [0.9, 2.55, -8.0], [0, 0, Math.PI / 2]);
  put(S, mesh(new THREE.BoxGeometry(0.8, 0.5, 0.1), M(0x6a3a1a)), [0.9, 2.55, -8.0]);
  const photo = ctex(256, 200, (c, w, h) => { c.fillStyle = '#f2e8d0'; c.fillRect(0, 0, w, h); c.fillStyle = '#8ab0d0'; c.fillRect(14, 14, w - 28, h - 28); c.fillStyle = '#4a7a5a'; c.fillRect(14, 130, w - 28, 56);
    const fig = (x, col, hair) => { c.fillStyle = col; c.fillRect(x - 22, 90, 44, 70); c.fillStyle = '#c89a6a'; c.fillRect(x - 17, 52, 34, 36); c.fillStyle = hair; c.fillRect(x - 18, 46, 36, 12); };
    fig(100, '#1f3a6a', '#2a1a0e'); fig(160, '#2f5a3a', '#8a8e96'); c.fillStyle = '#d8892a'; c.fillRect(120, 150, 30, 18); });
  put(S, mesh(new THREE.BoxGeometry(1.9, 1.5, 0.12), M(0x3a2a1a)), [-4.4, 6.0, -8.95]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.25), std({ map: photo })), [-4.4, 6.0, -8.88]);
  const poster = ctex(256, 360, (c, w, h) => { c.fillStyle = '#f2e2c0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a3a6a'; c.beginPath(); c.moveTo(128, 60); c.lineTo(128, 230); c.lineTo(40, 230); c.fill();
    c.fillStyle = '#d8302a'; c.beginPath(); c.moveTo(136, 90); c.lineTo(136, 230); c.lineTo(210, 230); c.fill(); c.fillStyle = '#3a6a8a'; c.fillRect(20, 240, 216, 30);
    c.fillStyle = '#1a3a6a'; c.font = '900 30px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('HARBOR POINT', 128, 310); c.font = '700 22px Inter, sans-serif'; c.fillText('REGATTA', 128, 340); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.4), std({ map: poster })), [-9.72, 5.4, -1.0], [0, Math.PI / 2, 0]);
  put(S, mesh(new THREE.TorusGeometry(0.9, 0.28, 10, 20), M(0xf2f2ea)), [-1.2, 6.9, -8.8]); for (let i = 0; i < 4; i++) put(S, mesh(new THREE.TorusGeometry(0.9, 0.3, 6, 4, 0.5), M(0xd8302a)), [-1.2, 6.9, -8.75], [0, 0, i * Math.PI / 2 + 0.3]);
  put(S, mesh(new THREE.TorusGeometry(0.8, 0.3, 8, 18), M(0xc8a878, { roughness: 1 })), [6.8, 0.3, -7.6], [Math.PI / 2, 0, 0]);
  box(S, [1.2, 1.4, 1.2], [8.9, 0.7, -7.9], M(0x8a5a3a), { r: 0.1, name: 'pot' }); for (let i = 0; i < 7; i++) put(S, mesh(new THREE.SphereGeometry(0.6, 8, 6), M(0x3a7a3a)), [8.9 + Math.sin(i) * 0.5, 2.0 + i * 0.35, -7.9 + Math.cos(i) * 0.4]);
  put(S, mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.5, 16), M(0x8a3a3a, { roughness: 1 })), [7.4, 0.25, 7.6]);
  box(S, [0.4, 0.4, 3.4], [9.75, 6.6, 8.0], M(0x6a4a2a), { r: 0.05, solid: false });
  put(S, mesh(rb(1.6, 2.8, 0.7, 0.3), M(0x2f5a3a)), [9.3, 5.0, 8.6], [0, Math.PI / 2, 0]); put(S, mesh(rb(0.9, 3.2, 0.3, 0.1), M(0xf2c84a)), [9.5, 4.6, 7.2], [0, Math.PI / 2, 0]);
  const rug = ctex(256, 256, (c, w, h) => { c.fillStyle = '#2a4a6a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8d8b0'; c.lineWidth = 10; for (let r = 30; r < 128; r += 26) { c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); } });
  put(S, new THREE.Mesh(new THREE.CircleGeometry(4.2, 32), std({ map: rug, roughness: 1 })), [1.6, 0.02, 1.5], [-Math.PI / 2, 0, 0]);
  // front door on the right wall (x = 10), z 2.6..6.2
  for (const z of [2.45, 6.35]) box(S, [0.7, 7.6, 0.3], [10.0, 3.8, z], M(0xf2eee0), { r: 0, cast: false, solid: false }); box(S, [0.7, 0.3, 4.2], [10.0, 7.5, 4.4], M(0xf2eee0), { r: 0, cast: false, solid: false });
  const door = new THREE.Group(); door.position.set(9.7, 0, 6.2); S.add(door); const dm = put(door, mesh(new THREE.BoxGeometry(0.25, 6.9, 3.6), M(0x2a6a4a, { roughness: 0.5 })), [0, 3.45, -1.8]); dm.name = 'front door';
  for (const y of [1.8, 5.0]) put(door, mesh(new THREE.BoxGeometry(0.1, 2.2, 2.6), M(0x245a40)), [-0.15, y, -1.8]);
  put(door, mesh(new THREE.SphereGeometry(0.15, 8, 6), M(0xd8b048, { metalness: 0.7, roughness: 0.3 })), [-0.25, 3.4, -3.2]);
  const crack = put(S, new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.14), basic(0xffd8a0)), [9.55, 0.08, 4.4], [0, -Math.PI / 2, 0]);
  const coldL = new THREE.PointLight(0xc8d8ff, 0, 7, 1.6); coldL.position.set(8.4, 1.2, 4.4); S.add(coldL);
  door.open = k => { door.rotation.y = k * 80 * D; };
  // the landing outside the door (seen when it opens): x 10..17, bulb, banister, stairs down
  box(S, [7, 0.3, 8], [13.6, -0.15, 4.4], tmat(boardTex('#6a5040'), 1, 1), { r: 0, cast: false, solid: false });
  box(S, [0.4, 9, 8], [17.2, 4.5, 4.4], tmat(sidingTex('#8a7a62'), 2, 2), { r: 0, cast: false, solid: false }); box(S, [7, 9, 0.4], [13.6, 4.5, 0.2], tmat(sidingTex('#8a7a62'), 2, 2), { r: 0, cast: false, solid: false });
  box(S, [7, 9, 0.4], [13.6, 4.5, 8.6], tmat(sidingTex('#8a7a62'), 2, 2), { r: 0, cast: false, solid: false }); box(S, [7, 0.3, 8], [13.6, 9.1, 4.4], M(0x5a5048), { r: 0, cast: false, solid: false });
  put(S, mesh(new THREE.BoxGeometry(0.2, 3, 0.2), M(0x3a2a1a)), [15.5, 1.5, 1.4]); put(S, mesh(new THREE.BoxGeometry(0.2, 0.2, 5), M(0x3a2a1a)), [15.5, 3.0, 3.8], [0.3, 0, 0]);
  put(S, mesh(new THREE.SphereGeometry(0.3, 10, 8), glow(0xffd090, 2), false), [13.6, 8.4, 4.4]); const landL = new THREE.PointLight(0xffc070, 10, 12, 1.6); landL.position.set(13.2, 7.8, 4.4); S.add(landL);
  const under = fogWisp(S, 14, 0xb8c4d4, 1.8, 5); under.position.set(9.0, 0, 4.4);
  // lights
  S.add(new THREE.HemisphereLight(0x4a5a8a, 0x2a2020, 0.45));
  const lamp = new THREE.PointLight(0xffb870, 16, 16, 1.7); lamp.position.set(-4.2, 4.2, -7.0); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.003; S.add(lamp);
  const moon = new THREE.SpotLight(0x8aa8ff, 120, 40, 0.5, 0.7, 1.3); moon.position.set(5.7, 7, Z0 - 3); moon.target.position.set(1, 0, 2); S.add(moon); S.add(moon.target);
  const red = new THREE.PointLight(0xff2a1a, 0, 22, 1.4); red.position.set(5.7, 5.5, Z0 + 0.6); S.add(red);
  const front = new THREE.PointLight(0x8aa0d8, 7, 26, 1.4); front.position.set(0, 7, 9); S.add(front);
  const doorFill = new THREE.PointLight(0x9ab0e0, 10, 16, 1.5); doorFill.position.set(5.5, 6.5, 6.5); S.add(doorFill);
  let tvMode = tv, tvK = 1, last = '';
  const drawTV = (mode, k, t) => { const key = mode + Math.round(k * 30) + (mode === 'map' ? Math.floor(t * 4) : ''); if (key === last) return; last = key; const c = tcv.getContext('2d'), w = 512, h = 310;
    if (mode === 'off') { c.fillStyle = '#0a0c10'; c.fillRect(0, 0, w, h); ttex.needsUpdate = true; return; }
    const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1a2a4a'); bg.addColorStop(1, '#0a1428'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d8202a'; c.fillRect(0, 0, w, 56); c.fillStyle = '#fff'; c.font = '900 34px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('⚠ FOG ADVISORY', w / 2, 40);
    c.fillStyle = '#f2c420'; c.fillRect(0, h - 40, w, 40); c.fillStyle = '#1a1a1a'; c.font = '800 22px Inter, sans-serif'; c.fillText('DO NOT ENTER THE FOG · STAY INDOORS', w / 2, h - 13);
    if (mode === 'advisory') { for (let i = 0; i < 14; i++) { const x = (i * 53 + k * 140) % (w + 80) - 40, y = 150 + Math.sin(i * 1.7) * 40; const g = c.createRadialGradient(x, y, 0, x, y, 70); g.addColorStop(0, 'rgba(230,236,244,0.8)'); g.addColorStop(1, 'rgba(230,236,244,0)'); c.fillStyle = g; c.fillRect(0, 56, w, h - 96); }
      c.fillStyle = '#fff'; c.font = '900 38px Inter, sans-serif'; c.fillText('HARBOR POINT', w / 2, 140); c.font = '700 24px Inter, sans-serif'; c.fillText('MEMORY LOSS REPORTED', w / 2, 180); }
    if (mode === 'forget') { const words = ['PLANS', 'PEOPLE', 'NAME']; words.forEach((wd, i) => { const a = clamp01(k * 3 - i); c.globalAlpha = a; c.fillStyle = '#fff'; c.font = '900 44px Inter, sans-serif'; c.fillText(wd, w / 2, 112 + i * 58);
        c.strokeStyle = '#ff3a3a'; c.lineWidth = 6; const tw = c.measureText(wd).width; c.beginPath(); c.moveTo(w / 2 - tw / 2 - 8, 98 + i * 58); c.lineTo(w / 2 - tw / 2 - 8 + (tw + 16) * clamp01(a * 1.5 - 0.4), 98 + i * 58); c.stroke(); c.globalAlpha = 1; }); }
    if (mode === 'map') { c.fillStyle = '#2a4a3a'; c.fillRect(30, 70, w - 60, 190); c.fillStyle = '#1a3a5a'; c.fillRect(330, 70, w - 360, 190); c.fillStyle = '#5a5a5a'; c.fillRect(30, 160, 300, 10);
      c.fillStyle = '#fff'; c.font = '800 18px Inter, sans-serif'; c.textAlign = 'left'; c.fillText('HARBOR ST', 60, 152); c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(150, 165, 9, 0, 7); c.fill();
      const fx = 330 - k * 120; const g = c.createLinearGradient(fx - 40, 0, fx + 30, 0); g.addColorStop(0, 'rgba(240,244,250,0)'); g.addColorStop(1, 'rgba(240,244,250,0.95)'); c.fillStyle = g; c.fillRect(fx - 40, 70, w - 30 - fx + 40, 190);
      c.fillStyle = '#ff3a3a'; c.textAlign = 'center'; c.font = '900 40px Inter, sans-serif'; if (Math.floor(t * 4) % 2 === 0) c.fillText('12 MIN', 240, 236); }
    ttex.needsUpdate = true; };
  const env = { door, tvL, lamp, red, scr };
  env.tv = (mode, k = 1, t = 0) => { tvMode = mode; tvK = k; drawTV(mode, k, t); tvL.intensity = mode === 'off' ? 0 : 7 + Math.sin(t * 13) * 0.8; tvL.color.set(mode === 'off' ? 0x9ab8ff : 0xc8d0ff); };
  env.tv(tv, 1, 0);
  let underK = 0; env.under = k => { underK = k; };
  let sirenK = 1; env.siren = k => { sirenK = k; };
  env.update = (t) => { const ph = Math.pow((Math.sin(t * 5) + 1) / 2, 2); red.intensity = 16 * ph * sirenK; redPane.material.opacity = 0.3 * ph * sirenK;
    under.update(t, () => 1, { k: underK }); coldL.intensity = underK * 6; crack.material.color.set(underK > 0.3 ? 0xb8c4d4 : 0xffd8a0); };
  return env;
}

export function truckCab(S, { ring = 15 } = {}) {
  S.background = new THREE.Color(0x1a2230); S.fog = new THREE.Fog(0x9aa6b6, 18, 60);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), tmat(T.asphalt(), 40, 40)); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.6; S.add(ground);
  const road = new THREE.Group(); S.add(road); for (let x = -60; x < 60; x += 7) put(road, mesh(new THREE.BoxGeometry(0.3, 0.03, 3.2), basic(0xd8c86a)), [3, -1.57, x]);
  // floor + walls
  box(S, [9.4, 0.3, 17], [0, -0.15, -3.5], tmat(T.tiles(0xe8e2d6, 0xd8a8b8), 3, 5), { r: 0, cast: false, name: 'cab floor' });
  const shell = M(0xfaf6f0, { roughness: 0.5 }), pink = M(0xf39ab8, { roughness: 0.45 });
  for (const sx of [-1, 1]) { box(S, [0.4, 3.3, 17], [sx * 4.8, 1.5, -3.5], shell, { r: 0, cast: false, name: 'side wall low' });
    box(S, [0.4, 1.0, 17], [sx * 4.8, 7.6, -3.5], shell, { r: 0, cast: false, solid: false });
    box(S, [0.4, 4.3, 0.6], [sx * 4.8, 5.0, 3.9], pink, { r: 0, cast: false, solid: false }); box(S, [0.4, 4.3, 8], [sx * 4.8, 5.0, -8], shell, { r: 0, cast: false, solid: false });
    put(S, new THREE.Mesh(new THREE.PlaneGeometry(10, 4.3), std({ color: 0x4a5a6a, transparent: true, opacity: 0.12, roughness: 0.05 })), [sx * 4.75, 5.0, -1], [0, Math.PI / 2, 0]); }
  box(S, [10, 0.4, 17], [0, 8.2, -3.5], shell, { r: 0, cast: false, solid: false, name: 'roof' });
  box(S, [9.6, 8, 0.4], [0, 4, -12.2], tmat(boardTex('#e8a8c0'), 2, 2), { r: 0, cast: false, name: 'back wall' });
  // dash + windshield
  box(S, [9.2, 3.2, 1.6], [0, 1.6, 3.4], M(0x2a2c32, { roughness: 0.6 }), { r: 0.15, name: 'dash' });
  box(S, [9.2, 0.3, 1.9], [0, 3.25, 3.3], M(0x1e2026, { roughness: 0.5 }), { r: 0.12, solid: false, name: 'dash top' });
  box(S, [9.6, 0.5, 0.5], [0, 7.6, 4.3], pink, { r: 0.1, cast: false, solid: false });
  const glass = put(S, new THREE.Mesh(new THREE.PlaneGeometry(9.2, 4.2), std({ color: 0x9ab8d0, transparent: true, opacity: 0.08, roughness: 0.02, metalness: 0.2 })), [0, 5.3, 4.45]);
  box(S, [9.2, 4.4, 3.6], [0, 0.6, 6.2], M(0xf39ab8, { roughness: 0.4 }), { r: 0.6, cast: false, solid: false, name: 'hood' });
  for (const sx of [-1, 1]) put(S, mesh(new THREE.CircleGeometry(0.5, 16), glow(0xfff4d0, 1.6)), [sx * 3.2, 1.6, 8.02]);
  // steering wheel (Abe's side)
  const wheel = new THREE.Group(); wheel.position.set(-2.4, 4.0, 2.4); wheel.rotation.x = -0.9; S.add(wheel);
  put(wheel, mesh(new THREE.TorusGeometry(1.0, 0.12, 8, 24), M(0x1a1a1e)), [0, 0, 0]); put(wheel, mesh(new THREE.BoxGeometry(2.0, 0.14, 0.14), M(0x1a1a1e)), [0, 0, 0]);
  put(S, mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8), M(0x1a1a1e)), [-2.4, 3.6, 2.9], [0.7, 0, 0]);
  // JINGLE switch panel, speaker + battery LCD, badge, bobble cone
  const panel = put(S, mesh(new THREE.BoxGeometry(1.4, 0.9, 0.3), M(0xd8d8d0, { metalness: 0.5 })), [-0.9, 3.75, 2.75], [-0.3, 0, 0]);
  const swPivot = new THREE.Group(); swPivot.position.set(-0.9, 3.75, 2.55); S.add(swPivot); const sw = put(swPivot, mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.6, 8), M(0xd8302a)), [0, 0.25, 0]); swPivot.rotation.x = -0.5;
  const lab = ctex(128, 32, (c, w, h) => { c.fillStyle = '#d8d8d0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = '900 22px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('JINGLE', w / 2, 24); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), basic(0xffffff, { map: lab })), [-0.9, 3.45, 2.58], [0.3, Math.PI, 0]);
  const spk = new THREE.Group(); spk.position.set(0.8, 3.3, 3.2); S.add(spk); put(spk, mesh(rb(1.7, 0.6, 0.9, 0.12), M(0x3a3a40)), [0, 0.3, 0]);
  const grille = ctex(128, 128, (c, w, h) => { c.fillStyle = '#1a1a1e'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a5a62'; for (let y = 8; y < h; y += 14) for (let x = 8; x < w; x += 14) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); } });
  put(spk, new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), std({ map: grille })), [0, 0.3, 0.46]);
  const lcv = document.createElement('canvas'); lcv.width = 256; lcv.height = 128; const ltex = new THREE.CanvasTexture(lcv); ltex.colorSpace = THREE.SRGBColorSpace;
  const lcd = put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), new THREE.MeshBasicMaterial({ map: ltex, toneMapped: false })), [0.8, 3.95, 2.64], [0.25, Math.PI, 0]);
  put(S, mesh(rb(1.7, 0.95, 0.2, 0.06), M(0x2a2a30)), [0.8, 3.95, 2.76], [0.25, Math.PI, 0]);
  let lastM = ''; const meter = (text = '10:00', red = false, k = 1) => { const key = text + red + Math.round(k * 10); if (key === lastM) return; lastM = key; const c = lcv.getContext('2d');
    c.fillStyle = '#0a140e'; c.fillRect(0, 0, 256, 128); const col = red ? '#ff4a3a' : '#7aff9a'; c.fillStyle = col; c.font = '700 20px monospace'; c.textAlign = 'left'; c.fillText('BATTERY', 14, 28);
    c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(150, 12, 90, 22); c.fillRect(153, 15, 84 * k, 16); c.font = '900 64px monospace'; c.textAlign = 'center'; c.fillText(text, 128, 106); ltex.needsUpdate = true; };
  meter();
  const lcdL = new THREE.PointLight(0x7aff9a, 1.5, 5, 1.6); lcdL.position.set(0.8, 4.2, 1.9); S.add(lcdL);
  const badgeT = ctex(512, 320, (c, w, h) => { c.fillStyle = '#e8e2cc'; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.12, 2500); c.fillStyle = '#2a3a6a'; c.fillRect(0, 0, w, 70);
    c.fillStyle = '#fff'; c.font = '900 36px Inter, sans-serif'; c.textAlign = 'left'; c.fillText('KESSLER HILL TOWER', 24, 48);
    c.fillStyle = '#8ab0c8'; c.fillRect(24, 92, 150, 190); c.fillStyle = '#6a4630'; c.fillRect(54, 140, 90, 100); c.fillStyle = '#3a2a1a'; c.fillRect(54, 130, 90, 22); c.fillStyle = '#1a1a1a'; c.fillRect(74, 178, 12, 12); c.fillRect(112, 178, 12, 12);
    c.fillStyle = '#2a1a10'; c.fillRect(74, 212, 50, 10); c.fillStyle = '#f4f4f0'; c.fillRect(44, 240, 110, 42);
    c.fillStyle = '#1a1a22'; c.font = '800 30px Inter, sans-serif'; c.fillText('CHIEF ENGINEER', 196, 140); c.font = '700 28px Inter, sans-serif'; c.fillText('A. MORROW', 196, 190);
    c.font = '600 22px Inter, sans-serif'; c.fillStyle = '#5a5a5a'; c.fillText('ID 0447 · ALL ACCESS', 196, 236); c.fillStyle = '#d8302a'; c.fillRect(196, 258, 290, 20); });
  const badge = new THREE.Group(); badge.position.set(2.7, 3.44, 3.2); badge.rotation.set(1.12, Math.PI, 0); S.add(badge);
  put(badge, mesh(new THREE.BoxGeometry(1.32, 0.84, 0.04), M(0xf2f2ea)), [0, 0, 0]); put(badge, new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.78), std({ map: badgeT, roughness: 0.4 })), [0, 0, 0.025]);
  const bob = new THREE.Group(); bob.position.set(-0.2, 3.4, 3.8); S.add(bob); put(bob, mesh(new THREE.ConeGeometry(0.22, 0.6, 10), M(0xd89a4a)), [0, 0.3, 0], [Math.PI, 0, 0]); const bh = put(bob, mesh(new THREE.SphereGeometry(0.28, 10, 8), M(0xa8e0b8)), [0, 0.75, 0]);
  // seats
  const seatM = M(0xd8302a, { roughness: 0.55 });
  for (const [x, n] of [[-2.4, 'seat abe'], [2.4, 'seat you']]) { box(S, [2.8, 1.2, 2.6], [x, 1.0, -0.6], seatM, { r: 0.3, name: n }); box(S, [2.8, 3.8, 0.7], [x, 3.4, -2.1], seatM, { r: 0.3, name: n + ' back' });
    box(S, [1.6, 0.9, 0.5], [x, 5.7, -2.15], seatM, { r: 0.2, solid: false }); }
  // the ice-cream back: freezer, cone rack, menu board, string lights
  box(S, [8.6, 2.8, 2.4], [0, 1.4, -10.6], M(0xf2f2ec, { roughness: 0.3 }), { r: 0.12, name: 'freezer' });
  for (let i = 0; i < 6; i++) put(S, mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.15, 14), M([0xf6c8d8, 0xa8e0b8, 0x7a4a2a, 0xf6e8a8, 0xc8a8e8, 0xffffff][i])), [-3.3 + i * 1.3, 2.86, -10.6]);
  const menu = ctex(512, 256, (c, w, h) => { c.fillStyle = '#3a2a5a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 34px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('★ MENU ★', w / 2, 44);
    [['VANILLA', '#f6e8a8'], ['MINT', '#a8e0b8'], ['COCOA', '#7a4a2a'], ['BERRY', '#f39ab8']].forEach(([n, col], i) => { const x = 70 + i * 124; c.fillStyle = col; c.beginPath(); c.arc(x, 110, 34, 0, 7); c.fill(); c.fillStyle = '#d89a4a'; c.beginPath(); c.moveTo(x - 28, 126); c.lineTo(x + 28, 126); c.lineTo(x, 196); c.fill();
      c.fillStyle = '#fff'; c.font = '800 20px Inter, sans-serif'; c.fillText(n, x, 230); }); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), std({ map: menu, emissive: 0xffffff, emissiveMap: menu, emissiveIntensity: 0.2 })), [0, 5.2, -11.95]);
  for (let i = 0; i < 6; i++) { const c = put(S, mesh(new THREE.ConeGeometry(0.25, 0.8, 10), M(0xd89a4a)), [-4.4, 3.4 + (i % 3) * 0.9, -9.5 + Math.floor(i / 3) * 0.7], [Math.PI, 0, 0]); }
  const bulbs = []; for (let i = 0; i < 18; i++) { const u = i / 17, b = put(S, mesh(new THREE.SphereGeometry(0.13, 8, 6), glow(i % 2 ? 0xffd86a : 0xff7ab0, 1.2), false), [-4.3 + u * 8.6, 7.7 - Math.sin(u * Math.PI * 3) * 0.25, -6]); bulbs.push(b); }
  for (let i = 0; i < 10; i++) { const u = i / 9, b = put(S, mesh(new THREE.SphereGeometry(0.13, 8, 6), glow(i % 2 ? 0xffd86a : 0xff7ab0, 1.2), false), [4.4, 7.6 - Math.sin(u * Math.PI * 2) * 0.2, -11 + u * 10]); bulbs.push(b); }
  // lights
  S.add(new THREE.HemisphereLight(0x8a9ab8, 0x2a2024, 0.5));
  const dome = new THREE.PointLight(0xffc8b0, 9, 16, 1.6); dome.position.set(0, 5.8, -4.5); dome.castShadow = true; dome.shadow.mapSize.set(1024, 1024); dome.shadow.bias = -0.003; S.add(dome);
  const pinkL = new THREE.PointLight(0xff8ab8, 8, 14, 1.6); pinkL.position.set(0, 6.8, -9); S.add(pinkL);
  const dashL = new THREE.PointLight(0xa8c8ff, 5, 10, 1.6); dashL.position.set(0, 4.8, 3.6); S.add(dashL);
  const outL = new THREE.PointLight(0xdfe6f0, 14, 30, 1.4); outL.position.set(0, 8, 12); S.add(outL);
  // outside: the clear circle + the fog wall, a streetlamp, Mr. Pell standing in the fog
  const fog = fogBank(S, { n: 340, area: [-60, 60, -60, 70], y: [-1.5, 12], size: [7, 14], col: 0xc0cad8, opacity: 0.55, seed: 21 });
  lampPost(S, [12, 24], { col: 0xffc070, i: 18 });
  const env = { sw: swPivot, meter, badge, fog, glass, lcd, lcdL, wheel, dome, bulbs, spk, road };
  env.update = (t, { jingle = 1, r = ring, flicker = 0, drive = 0 } = {}) => { fog.update(t, fogRing(0, -2, r, 6), { drift: [0, -drive] }); road.position.z = -((drive * t) % 7);
    bulbs.forEach((b, i) => { b.material.emissiveIntensity = 0.6 + (jingle > 0 ? (Math.sin(t * 9 + i) > 0 ? 1.4 : 0.2) * jingle : 0); });
    bh.position.x = Math.sin(t * 7) * 0.06 * jingle; spk.scale.y = 1 + Math.max(0, Math.sin(t * 22)) * 0.06 * jingle;
    const fl = flicker > 0 ? (Math.sin(t * 47) > 0.2 ? 1 : 0.25) : 1; lcdL.intensity = 1.5 * fl; lcd.material.color.setScalar(fl); };
  return env;
}

export function hospitalRoof(S) {
  sky(S, { night: true }); S.fog = new THREE.Fog(0x1a2636, 40, 260);
  box(S, [36, 0.4, 26], [0, -0.2, -3], tmat(roofTex(), 4, 3, { roughness: 0.9 }), { r: 0, cast: false, solid: false, name: 'roof deck' });
  box(S, [36, 40, 26], [0, -20.6, -3], tmat(T.concrete(0xb8b4ac), 6, 6), { r: 0, cast: false, solid: false, name: 'building' });
  const par = tmat(T.concrete(0xb8b4ac), 8, 0.4);
  box(S, [36, 1.4, 0.8], [0, 0.7, -16.2], par, { r: 0.05, name: 'parapet back' }); for (const sx of [-1, 1]) box(S, [0.8, 1.4, 26], [sx * 18.2, 0.7, -3], par, { r: 0.05, name: 'parapet side' });
  const railM = M(0xd8c020, { metalness: 0.4, roughness: 0.5 });
  put(S, mesh(new THREE.BoxGeometry(36, 0.15, 0.15), railM), [0, 2.9, -16.2]); for (let x = -17; x <= 17; x += 2.5) put(S, mesh(new THREE.BoxGeometry(0.12, 1.5, 0.12), railM), [x, 2.15, -16.2]);
  // helipad
  const hp = ctex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#f2f2ea'; c.lineWidth = 22; c.beginPath(); c.arc(256, 256, 220, 0, 7); c.stroke(); c.fillStyle = '#f2f2ea'; c.font = '900 300px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('H', 256, 360); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(12, 12), std({ map: hp, transparent: true, roughness: 0.9 })), [5, 0.03, -4], [-Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(S, mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8), glow(0x3ad86a, 1.4), false), [5 + Math.cos(a) * 6.6, 0.08, -4 + Math.sin(a) * 6.6]); }
  // stair hut + door + EXIT
  box(S, [7, 7, 6], [-11.5, 3.5, -11], tmat(T.concrete(0xa8a49c), 2, 2), { r: 0.05, name: 'stair hut' });
  put(S, mesh(new THREE.BoxGeometry(2.6, 5, 0.2), M(0x5a6a7a, { metalness: 0.5, roughness: 0.4 })), [-11.5, 2.5, -7.95]);
  const ex = ctex(128, 48, (c, w, h) => { c.fillStyle = '#d8202a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 34px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('EXIT', w / 2, 36); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), basic(0xffffff, { map: ex, toneMapped: false })), [-11.5, 5.6, -7.88]);
  const doorL = new THREE.PointLight(0xffe8c8, 22, 16, 1.6); doorL.position.set(-11.5, 6.4, -6.8); S.add(doorL); put(S, mesh(new THREE.BoxGeometry(1, 0.3, 0.6), glow(0xfff0d8, 2), false), [-11.5, 6.4, -7.6]);
  // AC units with spinning fans, pipes, vents
  const fans = [];
  for (const [x, z] of [[13, -12], [13, -6]]) { box(S, [5, 3, 4.4], [x, 1.5, z], M(0xc8ccd0, { metalness: 0.4, roughness: 0.5 }), { r: 0.1, name: 'ac unit' });
    const f = new THREE.Group(); f.position.set(x, 3.05, z); S.add(f); put(f, mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 20), M(0x2a2a30)), [0, 0, 0]);
    for (let i = 0; i < 4; i++) put(f, mesh(new THREE.BoxGeometry(2.6, 0.06, 0.5), M(0x8a8e96)), [0, 0.08, 0], [0, i * Math.PI / 4, 0.2]); fans.push(f); }
  put(S, mesh(new THREE.CylinderGeometry(0.4, 0.4, 20, 10), M(0x8a8e96, { metalness: 0.5 })), [16.5, 0.6, -3], [Math.PI / 2, 0, 0]);
  for (const x of [-4, -16]) put(S, mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 10), M(0x9a9ea6)), [x, 1.1, 6]);
  const reds = []; for (const [x, z] of [[-17.6, -15.6], [17.6, -15.6], [-17.6, 9.4], [17.6, 9.4]]) { reds.push(put(S, mesh(new THREE.SphereGeometry(0.3, 8, 6), glow(0xff2a1a, 2), false), [x, 1.7, z])); }
  // view: town across the bay, the bridge back to Harbor Point, the tower's red light
  water(S, { y: -40, z0: -20, z1: -600, x0: -300, x1: 300 });
  const town = new THREE.Mesh(new THREE.PlaneGeometry(320, 40), basic(0x0a0e18, { fog: false })); town.position.set(-40, -30, -420); S.add(town);
  const R = rng(8); for (let i = 0; i < 70; i++) put(S, new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 4), basic(0xffd890, { toneMapped: false })), [-180 + R() * 280, -28 + R() * 14, -418]);
  bridge(S, { from: [20, -60], to: [-60, -400] }).position.y = -44;
  const hill = new THREE.Mesh(new THREE.SphereGeometry(80, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), basic(0x0c1220, { fog: false })); hill.scale.set(1.3, 0.5, 1); hill.position.set(-140, -35, -470); S.add(hill);
  const tower = radioTower(S, [-130, 0, -460], { h: 60 });
  // fog sea below, rising
  const sea = fogBank(S, { n: 260, area: [-110, 110, -150, -22], y: [-34, -10], size: [12, 24], col: 0xb8c4d4, opacity: 0.5, seed: 31 });
  const lip = fogBank(S, { n: 60, area: [-20, 20, -21, -16.5], y: [-1, 2.4], size: [3, 5], col: 0xc8d2de, opacity: 0.45, seed: 33 });
  S.add(new THREE.HemisphereLight(0x4a5a8a, 0x1a1a22, 0.5));
  const moon = new THREE.DirectionalLight(0x9ab4ff, 1.1); moon.position.set(20, 30, -30); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02;
  Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 25, bottom: -25, far: 120 }); S.add(moon);
  const flood = new THREE.SpotLight(0xf2f6ff, 160, 50, 0.7, 0.6, 1.3); flood.position.set(-8, 9, 6); flood.target.position.set(0, 2, -8); flood.castShadow = true; flood.shadow.mapSize.set(1024, 1024); S.add(flood); S.add(flood.target);
  const front = new THREE.PointLight(0x8aa0d8, 6, 30, 1.4); front.position.set(0, 7, 12); S.add(front);
  let riseK = 0; const env = { tower, sea, lip, rise: k => { riseK = k; } };
  env.update = (t) => { fans.forEach((f, i) => f.rotation.y = t * (6 + i)); reds.forEach(r => r.material.emissiveIntensity = Math.sin(t * 2.5) > 0 ? 2.2 : 0.2); tower.red.visible = Math.sin(t * 2.2) > -0.3;
    sea.position.y = riseK * 12; sea.update(t); lip.update(t, () => 1, { k: clamp01(riseK * 1.5 - 0.3) }); };
  return env;
}

// =====================================================================================================================================
// Part 2 additions (episode 017): harborFront (the waterfront road + DOT'S RECORDS at the pier), recordShop (inside Dot's, power out),
// gramophone (portable wind-up record player), musicNotes, boat.
//   harborFront(S, { truck: [x, z] | false, flash })  Front Street along the water, pre-dawn: road z -4..6 (lane line z 1), boardwalk planks z -14..-4 (top 0.15),
//       railing z -14 (gap x 26..44 = DOT'S RECORDS, building x 26..42, front z -13, door centre (34, -13), env.shopDoor.open(k)), pier going out at x 44..50, fishing boats
//       moored at z -22..-34 (bob), BAIT & TACKLE shack x -40..-26, lamps on the boardwalk (x -30 -10 10 lit; the pier side is dark — power out), houses facing -z on the
//       camera side (fronts z 18) for reverse shots, Kessler Hill tower + bridge far away. env.truck (faces +x), env.lamps, env.update(t). flash = 30 years ago (dusk, all lamps lit).
//   recordShop(S)  inside DOT'S RECORDS, power out: walls x ±10, ceiling 9, the shopfront glass is the BACK wall z -9 (door x -2.2..1.2 → env.door.open(k); windows x -9.4..-3 and
//       2.4..9.4, y 1.4..7.4) looking out at the truck (env.truck at (0, 0, -21), faces +x) in the fog (env.fog). Counter x 3.6..9.6, z -2.2..-0.6, top 3.0 (Dot stands at (6.8, 0, -3.8));
//       record bins (top 2.2) at (-5.6, -4) and (-5.6, 1.4); jukebox (-8.3, 0, -7.2) (env.juke(k) lights it); gramophone table (top 2.4) at (-7.6, 6.6) with env.gram under a dust
//       cloth (env.cloth(k) pulls it off toward +x); front wall z 12. Free floor x -3..3.4, z -8..10. env.update(t, { jingle, ring, inside, music }): inside 0..1 = fog crept in
//       under the door, music 0..1 = warm gramophone glow + notes.
export function musicNotes(S, n = 14, col = 0xffd27a) {
  const tex = ['♪', '♫', '♩'].map(ch => ctex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 100px serif'; c.textAlign = 'center'; c.fillText(ch, 64, 100); }));
  const g = new THREE.Group(); S.add(g); const ns = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex[i % 3], color: col, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false })); s.renderOrder = 6; g.add(s); ns.push({ s, ph: i / n, sx: Math.sin(i * 2.3), sz: Math.cos(i * 1.7) }); }
  g.update = (t, o, k = 1, { up = 4, spread = 2.5, size = 0.5, speed = 0.35 } = {}) => { for (const p of ns) { const u = (t * speed + p.ph) % 1;
    p.s.position.set(o.x + p.sx * spread * u + Math.sin(t * 2 + p.ph * 9) * 0.25, o.y + u * up, o.z + p.sz * spread * u); p.s.scale.setScalar(size * (0.6 + u * 0.6));
    p.s.material.opacity = k * Math.sin(u * Math.PI) * 0.95; p.s.visible = k > 0.01; } };
  return g;
}
export function gramophone(S, { s = 1 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(s); S.add(g); const wood = std({ map: boardTex('#6a3a1e'), roughness: 0.55 }), brass = M(0xd8a848, { metalness: 0.75, roughness: 0.3 });
  solidify(put(g, mesh(rb(1.7, 0.7, 1.4, 0.08), wood), [0, 0.35, 0]), 'gramophone');
  put(g, mesh(new THREE.BoxGeometry(1.74, 0.08, 1.44), brass), [0, 0.06, 0]);
  const disc = new THREE.Group(); disc.position.set(-0.1, 0.74, 0); g.add(disc); put(disc, mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.04, 32), M(0x2a2a2a)), [0, 0, 0]);
  put(disc, mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.03, 32), M(0x0e0e10, { roughness: 0.25 })), [0, 0.03, 0]); put(disc, mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 20), M(0xd8302a)), [0, 0.035, 0]);
  put(disc, mesh(new THREE.BoxGeometry(0.06, 0.04, 0.2), M(0xf2e2b0)), [0.1, 0.05, 0]);
  const arm = new THREE.Group(); arm.position.set(0.62, 0.78, -0.45); g.add(arm); put(arm, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), brass), [0, 0, 0]);
  put(arm, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8), brass), [-0.3, 0.08, 0.3], [Math.PI / 2, 0, Math.PI / 4]); put(arm, mesh(new THREE.BoxGeometry(0.12, 0.1, 0.16), brass), [-0.6, 0.04, 0.6]);
  // horn: rises from the back-left, bell opening forward + up
  const horn = new THREE.Group(); horn.position.set(-0.55, 0.7, -0.45); g.add(horn);
  put(horn, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), brass), [0, 0.45, 0]);
  const bell = put(horn, mesh(new THREE.CylinderGeometry(0.85, 0.08, 1.5, 24, 1, true), std({ color: 0xd8a848, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide })), [0, 1.35, 0.55], [-1.0, 0, 0]);
  put(horn, mesh(new THREE.TorusGeometry(0.85, 0.05, 6, 24), brass), [0, 1.35 + Math.cos(1.0) * 0.75, 0.55 + Math.sin(1.0) * 0.75], [Math.PI / 2 - 1.0, 0, 0]);
  const crank = new THREE.Group(); crank.position.set(0.88, 0.38, 0.1); g.add(crank); put(crank, mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), brass), [0.15, 0, 0], [0, 0, Math.PI / 2]);
  put(crank, mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), brass), [0.3, 0.25, 0]); const knob = put(crank, mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8), M(0x1a1a1a)), [0.42, 0.5, 0], [0, 0, Math.PI / 2]);
  g.disc = disc; g.crank = crank; g.horn = horn; g.knob = knob;
  g.bellPos = () => { g.updateMatrixWorld(true); return horn.localToWorld(new THREE.Vector3(0, 1.35 + Math.cos(1.0) * 0.75, 0.55 + Math.sin(1.0) * 0.75)); };
  g.knobPos = () => { g.updateMatrixWorld(true); return knob.getWorldPosition(new THREE.Vector3()); };
  let ang = 0, lastT = 0; g.update = (t, { spin = 0, crank: ca = null } = {}) => { const dt = Math.max(0, Math.min(0.1, t - lastT)); lastT = t; ang += dt * spin * 3.5; disc.rotation.y = -ang; if (ca !== null) crank.rotation.x = ca; };
  return g;
}
export function boat(S, [x, z], { col = 0xd8d2c4, trim = 0x2a5a8a, name = 'boat', ry = 0, s = 1 } = {}) {
  const g = new THREE.Group(); g.position.set(x, -1.6, z); g.rotation.y = ry; g.scale.setScalar(s); S.add(g);
  put(g, mesh(rb(12, 2.6, 4.4, 0.8), M(col, { roughness: 0.5 })), [0, 0.9, 0]); put(g, mesh(new THREE.BoxGeometry(12.1, 0.5, 4.5), M(trim)), [0, 1.9, 0]);
  put(g, mesh(new THREE.ConeGeometry(2.25, 3.4, 4), M(col, { roughness: 0.5 })), [7.4, 0.9, 0], [0, Math.PI / 4, -Math.PI / 2]).scale.set(1, 1, 0.7);
  put(g, mesh(rb(4, 3, 3.4, 0.2), M(0xf2efe6)), [-2, 3.6, 0]); for (const sz of [-1, 1]) put(g, mesh(new THREE.PlaneGeometry(2.8, 1.2), basic(0x1a2230)), [-2, 4.2, sz * 1.72], [0, sz < 0 ? Math.PI : 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.12, 0.15, 8, 8), M(0x8a6a4a)), [1.6, 6, 0]); put(g, mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 6), M(0x8a6a4a)), [3.2, 4.6, 0], [0, 0, 1.1]);
  put(g, mesh(new THREE.TorusGeometry(0.5, 0.15, 6, 14), M(0xf2f2f2)), [-2, 3.0, 1.75]); put(g, mesh(new THREE.TorusGeometry(0.5, 0.151, 6, 4), M(0xd8302a)), [-2, 3.0, 1.76]);
  const lamp = put(g, mesh(new THREE.SphereGeometry(0.2, 8, 6), glow(0x3ad86a, 1.6), false), [-2, 5.3, 1.5]);
  g.bob = (t, k = 1) => { g.position.y = -1.6 + Math.sin(t * 0.9 + x) * 0.18 * k; g.rotation.z = Math.sin(t * 0.7 + z) * 0.03 * k; g.rotation.x = Math.sin(t * 0.8 + x * 0.3) * 0.02 * k; };
  return g;
}
const signTex = (text, sub, { bg = '#2a1a3a', fg = '#ffd27a', w = 1024, h = 256, mirror = false } = {}) => ctex(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } else c.clearRect(0, 0, w, h);
  if (mirror) { c.translate(w, 0); c.scale(-1, 1); } c.fillStyle = fg; c.textAlign = 'center'; c.font = `900 ${Math.round(h * 0.46)}px Inter, sans-serif`; c.fillText(text, w / 2, h * (sub ? 0.55 : 0.66));
  if (sub) { c.font = `700 ${Math.round(h * 0.17)}px Inter, sans-serif`; c.fillText(sub, w / 2, h * 0.84); }
  c.strokeStyle = fg; c.lineWidth = 6; if (bg) c.strokeRect(10, 10, w - 20, h - 20); });
const coversTex = (seed = 1, n = [8, 4]) => once('cov' + seed, () => ctex(1024, 512, (c, w, h) => { const R = rng(seed); c.fillStyle = '#2a2024'; c.fillRect(0, 0, w, h);
  const cw = w / n[0], ch = h / n[1]; const pal = ['#d8302a', '#f2c84a', '#3a8ad8', '#2a9a6a', '#e86ab0', '#f28a3a', '#8a5ad8', '#f2f2ea', '#1a1a22', '#6ad8d8'];
  for (let i = 0; i < n[0]; i++) for (let j = 0; j < n[1]; j++) { const x = i * cw + 6, y = j * ch + 6, s = Math.min(cw, ch) - 12; c.fillStyle = pal[Math.floor(R() * pal.length)]; c.fillRect(x, y, s, s);
    const k = Math.floor(R() * 4); c.fillStyle = pal[Math.floor(R() * pal.length)];
    if (k === 0) { c.beginPath(); c.arc(x + s / 2, y + s / 2, s * 0.32, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + s / 2, y + s / 2, s * 0.06, 0, 7); c.fill(); }
    else if (k === 1) { for (let q = 0; q < 4; q++) c.fillRect(x, y + s * (0.15 + q * 0.2), s, s * 0.08); }
    else if (k === 2) { c.beginPath(); c.moveTo(x + s * 0.1, y + s * 0.9); c.lineTo(x + s / 2, y + s * 0.15); c.lineTo(x + s * 0.9, y + s * 0.9); c.fill(); }
    else { c.fillRect(x + s * 0.2, y + s * 0.2, s * 0.6, s * 0.6); }
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(x + 6, y + s - 18, s * 0.6, 8); } noiseFill(c, w, h, 0.06, 1500); }));
function recordBin(S, [x, z], name = 'bin', seed = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const R = rng(seed);
  solidify(put(g, mesh(rb(3.4, 1.8, 2.4, 0.08), std({ map: boardTex('#7a5232'), roughness: 0.7 })), [0, 0.9, 0]), name); put(g, mesh(new THREE.BoxGeometry(3.4, 0.2, 2.4), M(0x4a2e1a)), [0, 1.9, 0]);
  const pal = [0xd8302a, 0xf2c84a, 0x3a8ad8, 0x2a9a6a, 0xe86ab0, 0xf28a3a, 0x8a5ad8, 0xf2f2ea, 0x1a1a22];
  for (const row of [-0.55, 0.55]) for (let i = 0; i < 14; i++) put(g, mesh(new THREE.BoxGeometry(1.05, 1.05, 0.04), M(pal[Math.floor(R() * pal.length)], { roughness: 0.6 })), [row, 2.35, -1.0 + i * 0.15], [-0.25 + R() * 0.1, 0, 0]);
  return g; }
export function harborFront(S, { truck = [0, 1], flash = false } = {}) {
  const R = rng(17); sky(S, { night: true }); S.fog = new THREE.Fog(flash ? 0x3a3040 : 0x1a2636, 50, 240);
  S.add(new THREE.HemisphereLight(0x5a6a9a, 0x1a1a22, flash ? 0.8 : 0.5));
  const moon = new THREE.DirectionalLight(flash ? 0xffc8a0 : 0x9ab4ff, flash ? 1.4 : 1.0); moon.position.set(-25, 40, -30); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02; Object.assign(moon.shadow.camera, { left: -55, right: 55, top: 35, bottom: -35, far: 180 }); S.add(moon);
  const fillL = new THREE.DirectionalLight(0x6a7ab8, 0.4); fillL.position.set(10, 12, 40); S.add(fillL);
  box(S, [260, 0.3, 100], [0, -0.15, 36], tmat(T.asphalt(), 52, 20, { roughness: 0.7 }), { r: 0, cast: false, solid: false, name: 'road' });
  box(S, [260, 0.3, 10], [0, 0.0, -9], tmat(boardTex('#7a6a58'), 40, 1.6, { roughness: 0.85 }), { r: 0, cast: false, solid: false, name: 'boardwalk' });
  box(S, [260, 0.32, 3.4], [0, 0.02, 9.7], tmat(T.concrete(0x9a968e), 60, 1), { r: 0, cast: false, solid: false, name: 'sidewalk' });
  for (let x = -120; x < 130; x += 7) put(S, mesh(new THREE.BoxGeometry(3.2, 0.03, 0.3), basic(0xd8c86a)), [x, 0.02, 1]);
  // railing with a gap for Dot's shop
  const railM = M(0x3a3e46, { metalness: 0.4, roughness: 0.5 });
  for (const [x0, x1] of [[-120, 26], [50, 130]]) { put(S, mesh(new THREE.BoxGeometry(x1 - x0, 0.16, 0.16), railM), [(x0 + x1) / 2, 3.0, -14]); put(S, mesh(new THREE.BoxGeometry(x1 - x0, 0.1, 0.1), railM), [(x0 + x1) / 2, 1.8, -14]);
    for (let x = x0; x <= x1; x += 4) solidify(put(S, mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.0, 6), railM), [x, 1.5, -14]), 'rail'); }
  water(S, { y: -2, z0: -14, z1: -520, x0: -260, x1: 300 });
  // boats, pier
  const boats = [boat(S, [-46, -24], { col: 0xd8d2c4, trim: 0x2a5a8a, ry: 0.1 }), boat(S, [-20, -28], { col: 0xc84a3a, trim: 0xf2f2ea, ry: -0.08, s: 0.9 }), boat(S, [4, -23], { col: 0x3a6a5a, trim: 0xf2c84a, ry: 0.05 }),
    boat(S, [62, -30], { col: 0xf2efe6, trim: 0xd8302a, ry: Math.PI + 0.1 }), boat(S, [-72, -30], { col: 0x2a4a7a, trim: 0xf2efe6, ry: 0.2, s: 0.9 })];
  const pierM = tmat(boardTex('#6a5a4a'), 2, 18, { roughness: 0.9 });
  box(S, [7, 0.5, 90], [47, -0.1, -58], pierM, { r: 0, cast: false, solid: false, name: 'pier' });
  for (let z = -16; z > -104; z -= 6) for (const sx of [-1, 1]) put(S, mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 8), M(0x3a2e24)), [47 + sx * 3.2, -2.6, z]);
  const pierLamps = []; for (let z = -20; z > -100; z -= 14) { const l = lampPost(S, [44, z], { night: flash, col: 0xffc070, i: 14 }); pierLamps.push(l); }
  // DOT'S RECORDS (x 26..42, front z -13)
  const shop = new THREE.Group(); S.add(shop);
  solidify(put(shop, mesh(new THREE.BoxGeometry(16, 11, 11), tmat(sidingTex('#3a7a78'), 3, 2.2)), [34, 5.5, -18.5]), 'dot shop');
  const roofSh = new THREE.Shape(); roofSh.moveTo(-8.6, 0); roofSh.lineTo(0, 4); roofSh.lineTo(8.6, 0); roofSh.lineTo(-8.6, 0);
  put(shop, mesh(new THREE.ExtrudeGeometry(roofSh, { depth: 12, bevelEnabled: false }), tmat(shingleTex('#3a2e3a'), 0.2, 0.2)), [34, 11, -24.5]);
  const trim = M(0xf2efe6); put(shop, mesh(new THREE.BoxGeometry(16.4, 0.4, 0.4), trim), [34, 11, -12.9]);
  // window (records display) + door
  put(shop, mesh(new THREE.BoxGeometry(8.4, 5.6, 0.25), trim), [29.6, 4.4, -12.95]); put(shop, mesh(new THREE.PlaneGeometry(7.8, 5.0), std({ map: coversTex(3, [6, 4]), emissive: 0xffffff, emissiveMap: coversTex(3, [6, 4]), emissiveIntensity: flash ? 0.5 : 0.04, roughness: 0.2 })), [29.6, 4.4, -12.8]);
  put(shop, mesh(new THREE.PlaneGeometry(7.8, 5.0), std({ color: 0x9ab8d0, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.3 })), [29.6, 4.4, -12.7]);
  put(shop, mesh(new THREE.BoxGeometry(3.6, 6.6, 0.3), trim), [36.4, 3.3, -12.95]);
  const doorP = new THREE.Group(); doorP.position.set(35.0, 0, -12.8); shop.add(doorP); const dm = put(doorP, mesh(new THREE.BoxGeometry(2.8, 6.0, 0.18), M(0x7a2a3a, { roughness: 0.45 })), [1.4, 3.0, 0]); dm.name = 'dot door';
  put(doorP, mesh(new THREE.PlaneGeometry(1.8, 2.6), std({ color: 0x1a2230, roughness: 0.1 })), [1.4, 4.2, 0.1]); put(doorP, mesh(new THREE.SphereGeometry(0.12, 8, 6), M(0xd8b048, { metalness: 0.7 })), [2.5, 3.0, 0.15]);
  const ot = put(shop, mesh(new THREE.BoxGeometry(2.4, 0.8, 0.1), M(0xf2efe6)), [36.4, 5.6, -12.7]); ot.material = std({ map: signTex('OPEN', '', { bg: '#f2efe6', fg: '#7a2a3a', w: 256, h: 96 }) });
  const sign = put(shop, mesh(new THREE.BoxGeometry(12, 2.6, 0.3), std({ map: signTex("DOT'S RECORDS", 'BUY · SELL · LISTEN', { bg: '#2a1a3a', fg: '#ffd27a' }), emissive: 0xffd27a, emissiveMap: signTex("DOT'S RECORDS", 'BUY · SELL · LISTEN', { bg: '#2a1a3a', fg: '#ffd27a' }), emissiveIntensity: flash ? 0.9 : 0.06 })), [34, 9.0, -12.8]);
  const awnT = ctex(256, 64, (c, w, h) => { for (let x = 0; x < w; x += 32) { c.fillStyle = (x / 32) % 2 ? '#7a2a3a' : '#f2efe6'; c.fillRect(x, 0, 32, h); } });
  put(shop, mesh(new THREE.BoxGeometry(9.0, 0.12, 2.0), std({ map: awnT })), [29.6, 7.6, -12.2], [0.35, 0, 0]);
  // giant record on the roof (sign) + crates of records outside
  const rec = new THREE.Group(); rec.position.set(34, 14.6, -18); shop.add(rec); put(rec, mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.3, 32), M(0x141416, { roughness: 0.3 })), [0, 0, 0], [Math.PI / 2, 0, 0]);
  put(rec, mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.32, 24), M(0xd8302a)), [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (const [x, z] of [[26.8, -11.6], [41.0, -11.4]]) { solidify(put(S, mesh(new THREE.BoxGeometry(1.8, 1.2, 1.4), std({ map: boardTex('#8a6a3a') })), [x, 0.75, z]), 'crate');
    for (let i = 0; i < 6; i++) put(S, mesh(new THREE.BoxGeometry(1.05, 1.05, 0.04), M([0xd8302a, 0xf2c84a, 0x3a8ad8, 0xe86ab0][i % 4])), [x, 1.6, z - 0.5 + i * 0.18], [-0.2, 0, 0]); }
  // BAIT & TACKLE shack + traps, nets, buoys
  solidify(put(S, mesh(new THREE.BoxGeometry(14, 8, 9), tmat(boardTex('#5a4a3a'), 3, 2)), [-33, 4, -19]), 'bait shack');
  put(S, mesh(new THREE.BoxGeometry(10, 2, 0.3), std({ map: signTex('BAIT & TACKLE', '', { bg: '#f2efe6', fg: '#2a4a6a', w: 512, h: 128 }) })), [-33, 6.6, -14.4]);
  for (let i = 0; i < 6; i++) solidify(put(S, mesh(new THREE.BoxGeometry(2.2, 1.4, 1.6), M(i % 2 ? 0x3a6a4a : 0xc8a050, { roughness: 0.8, wireframe: false })), [-24 + (i % 3) * 2.3, 0.85 + Math.floor(i / 3) * 1.4, -11.8]), 'traps');
  for (let i = 0; i < 5; i++) put(S, mesh(new THREE.SphereGeometry(0.45, 10, 8), M([0xf28a3a, 0xd8302a, 0xf2c84a][i % 3])), [-38 + i * 1.2, 5.0 + Math.sin(i) * 0.4, -14.4]);
  // camera-side houses facing -z (fronts z 18) for reverse shots
  [[-40, '#c88a6a', 0x7a2a2a, [0]], [-24, '#e8d6a8', 0x3a4a7a, []], [-8, '#8aa8a0', 0x2a3a5a, [2]], [8, '#e2b8c8', 0x2a6a4a, []], [24, '#a8b8d8', 0x5a3a2a, [1]], [40, '#d8c890', 0x3a3a5a, []]]
    .forEach(([x, col, door, lit], i) => { const h = house(S, [x, 0], { col, door, lit: flash ? [0, 1, 2] : lit, name: 'fronthouse' + i }); h.rotation.y = Math.PI; h.position.z = 18; });
  const lamps = [[-30, -12.4], [-10, -12.4], [10, -12.4], [-20, 11.6], [0, 11.6], [20, 11.6]].map(p => lampPost(S, p, { col: 0xffc070, i: 18 }));
  const deadLamp = lampPost(S, [24, -12.4], { night: flash, col: 0xffc070, i: 16 });
  // benches, bollards, hydrant, newspaper box
  for (const x of [-18, 2, 18]) { solidify(put(S, mesh(new THREE.BoxGeometry(4, 0.3, 1.2), std({ map: boardTex('#7a5a3a') })), [x, 1.6, -12.6]), 'bench'); put(S, mesh(new THREE.BoxGeometry(4, 1.2, 0.2), std({ map: boardTex('#7a5a3a') })), [x, 2.4, -13.2]);
    for (const sx of [-1.6, 1.6]) put(S, mesh(new THREE.BoxGeometry(0.15, 1.5, 1.2), M(0x2a2e36)), [x + sx, 0.85, -12.7]); }
  for (let x = -110; x < 120; x += 9) solidify(put(S, mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.4, 10), M(0x2a2e36, { metalness: 0.4 })), [x + 4.5, 0.7, -5.2]), 'bollard');
  put(S, mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.6, 10), M(0xd8302a)), [-14, 0.8, 10]); put(S, mesh(new THREE.BoxGeometry(1.2, 2.2, 1.0), M(0x2a5aa8)), [6, 1.1, 10.4]);
  // far: Kessler Hill + tower, the bridge, mainland lights
  const hill = new THREE.Mesh(new THREE.SphereGeometry(80, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), basic(0x0e1420, { fog: false })); hill.scale.set(1.4, 0.45, 1); hill.position.set(-120, -4, -300); S.add(hill);
  const tower = radioTower(S, [-110, 30, -290], { h: 62 }); bridge(S, { from: [110, -60], to: [170, -440] });
  const farM = new THREE.Mesh(new THREE.PlaneGeometry(360, 30), basic(0x0a0e18, { fog: false })); farM.position.set(80, 6, -450); S.add(farM);
  for (let i = 0; i < 40; i++) put(S, new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 4), basic(0xffd890, { toneMapped: false })), [-60 + R() * 260, 3 + R() * 14, -445]);
  const env = { lamps, tower, boats, shop, deadLamp, pierLamps, shopDoor: { open: k => { doorP.rotation.y = -k * 1.6; } } };
  if (truck) { const tr = iceTruck(S); tr.position.set(truck[0], 0, truck[1]); env.truck = tr; }
  env.update = (t) => { boats.forEach(b => b.bob(t)); tower.red.visible = Math.sin(t * 2.2) > -0.3; rec.rotation.z = flash ? t * 0.5 : 0; };
  return env;
}
export function recordShop(S) {
  S.background = new THREE.Color(0x10141e); S.fog = new THREE.Fog(0x2a3444, 30, 90);
  const floorT = ctex(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#1e1c20' : '#d8d2c4'; c.fillRect(i * 64, j * 64, 64, 64); } noiseFill(c, w, h, 0.08, 2500); });
  box(S, [20, 0.3, 24], [0, -0.15, 1.5], tmat(floorT, 5, 6, { roughness: 0.45 }), { r: 0, cast: false, solid: false, name: 'shop floor' });
  const wallM = tmat(wallpaperTex(), 4, 2), wood = tmat(boardTex('#5a3a2a'), 4, 1);
  for (const sx of [-1, 1]) box(S, [0.4, 9, 24], [sx * 10.2, 4.5, 1.5], sx < 0 ? tmat(coversTex(5, [12, 6]), 1, 1) : wallM, { r: 0, cast: false, name: 'side wall' });
  box(S, [20.8, 0.4, 24], [0, 9.2, 1.5], M(0x2a2228), { r: 0, cast: false, solid: false, name: 'ceiling' });
  box(S, [20.8, 9, 0.4], [0, 4.5, 13.7], tmat(coversTex(7, [10, 4]), 1, 1), { r: 0, cast: false, solid: false, name: 'front wall' });
  for (const sx of [-1, 1]) box(S, [0.2, 1.2, 24], [sx * 9.9, 0.6, 1.5], wood, { r: 0, cast: false, solid: false });
  // shopfront (back wall z -9) with holes: windows x -9.4..-3 / 2.4..9.4 (y 1.4..7.4), door x -2.2..1.2 (y 0..6.6)
  const fr = M(0x3a2a34, { roughness: 0.6 }), z0 = -9.2;
  for (const [x0, x1] of [[-10.4, -9.4], [-3, -2.2], [1.2, 2.4], [9.4, 10.4]]) box(S, [x1 - x0, 9, 0.4], [(x0 + x1) / 2, 4.5, z0], fr, { r: 0, cast: false, name: 'shopfront' });
  for (const [x0, x1] of [[-9.4, -3], [2.4, 9.4]]) { box(S, [x1 - x0, 1.4, 0.4], [(x0 + x1) / 2, 0.7, z0], fr, { r: 0, cast: false, name: 'shopfront low' }); box(S, [x1 - x0, 1.6, 0.4], [(x0 + x1) / 2, 8.2, z0], fr, { r: 0, cast: false, solid: false }); }
  box(S, [3.4, 2.4, 0.4], [-0.5, 7.8, z0], fr, { r: 0, cast: false, solid: false });
  const gl = std({ color: 0xa8c0d8, transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0.3 });
  for (const [x, w] of [[-6.2, 6.4], [5.9, 7.0]]) { put(S, new THREE.Mesh(new THREE.PlaneGeometry(w, 6), gl), [x, 4.4, z0]); put(S, mesh(new THREE.BoxGeometry(0.15, 6, 0.2), fr), [x, 4.4, z0 + 0.05]); }
  const letters = put(S, new THREE.Mesh(new THREE.PlaneGeometry(6.0, 1.5), new THREE.MeshBasicMaterial({ map: signTex("DOT'S RECORDS", '', { bg: null, fg: '#e8b84a', mirror: true }), transparent: true, depthWrite: false })), [-6.2, 6.4, z0 + 0.12]);
  const doorP = new THREE.Group(); doorP.position.set(1.2, 0, z0); S.add(doorP); const df = M(0x7a2a3a, { roughness: 0.45 });
  for (const [x, y, w, h] of [[-1.7, 0.4, 3.4, 0.8], [-1.7, 6.3, 3.4, 0.6], [-0.15, 3.3, 0.3, 6.6], [-3.25, 3.3, 0.3, 6.6]]) { const b = put(doorP, mesh(new THREE.BoxGeometry(w, h, 0.2), df), [x, y, 0]); b.name = 'shop door'; }
  put(doorP, new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.2), gl), [-1.7, 3.4, 0]); put(doorP, mesh(new THREE.BoxGeometry(0.5, 0.12, 0.3), M(0xd8b048, { metalness: 0.7 })), [-2.8, 3.2, 0.2]);
  const bellG = put(S, mesh(new THREE.SphereGeometry(0.22, 10, 8, 0, 7, 0, 1.8), M(0xd8b048, { metalness: 0.8, roughness: 0.3 })), [0.6, 6.9, -8.7]);
  // outside: boardwalk, rail, the truck in the fog, far lights
  box(S, [80, 0.3, 50], [0, -0.17, -34], tmat(boardTex('#5a5048'), 12, 8, { roughness: 0.9 }), { r: 0, cast: false, solid: false, name: 'outside ground' });
  const tr = iceTruck(S); tr.position.set(0, 0, -22);
  for (const x of [-18, 18]) lampPost(S, [x, -14], { col: 0xffc070, i: 12 });
  const fog = fogBank(S, { n: 260, area: [-40, 40, -60, -9.6], y: [0, 11], size: [5, 11], col: 0xc0cad8, opacity: 0.55, seed: 41 });
  const wisp = fogBank(S, { n: 46, area: [-4, 3, -9.2, -1], y: [0.1, 1.1], size: [1.6, 3.0], col: 0xc8d2de, opacity: 0.5, seed: 43 });
  // counter (x 3.6..9.6, z -2.2..-0.6, top 3.0), register, candle, records
  box(S, [6, 2.9, 1.6], [6.6, 1.45, -1.4], tmat(boardTex('#6a4228'), 2, 1), { r: 0.06, name: 'counter' }); box(S, [6.3, 0.2, 1.9], [6.6, 3.0, -1.4], M(0x2a1e1a, { roughness: 0.4 }), { r: 0.04, solid: false });
  put(S, mesh(rb(1.4, 1.0, 1.0, 0.1), M(0x8a8a90, { metalness: 0.6, roughness: 0.35 })), [8.6, 3.6, -1.5]); put(S, mesh(new THREE.BoxGeometry(1.2, 0.5, 0.2), M(0x2a2a30)), [8.6, 4.2, -1.9], [-0.4, 0, 0]);
  const cnd = new THREE.Group(); cnd.position.set(4.6, 3.1, -1.2); S.add(cnd); put(cnd, mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 10), M(0xf2ead6)), [0, 0.3, 0]);
  const flameM = put(cnd, mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc860, toneMapped: false }), false), [0, 0.72, 0]); flameM.scale.set(1, 1.9, 1);
  const candleL = new THREE.PointLight(0xffa850, 9, 14, 1.6); candleL.position.set(4.6, 4.2, -0.6); S.add(candleL);
  for (let i = 0; i < 5; i++) put(S, mesh(new THREE.BoxGeometry(1.05, 0.04, 1.05), M([0xd8302a, 0xf2c84a, 0x3a8ad8, 0xe86ab0, 0x2a9a6a][i])), [6.6, 3.12 + i * 0.045, -1.4], [0, i * 0.2, 0]);
  // back shelves behind the counter + radios on the right wall
  box(S, [0.6, 7, 8], [9.6, 3.5, -4.6], wood, { r: 0, cast: false, name: 'shelf right' });
  for (let i = 0; i < 6; i++) { const y = 2.4 + Math.floor(i / 2) * 2, z = -6.6 + (i % 2) * 3.4; put(S, mesh(rb(0.9, 1.3, 2.2, 0.15), M([0x8a5a2a, 0xd8c8a0, 0x3a6a5a][i % 3], { roughness: 0.5 })), [9.2, y, z]);
    put(S, mesh(new THREE.CircleGeometry(0.4, 16), M(0x2a2a2a)), [8.74, y, z - 0.4], [0, -Math.PI / 2, 0]); put(S, mesh(new THREE.PlaneGeometry(0.9, 0.4), M(0xf2e2b0)), [8.74, y + 0.2, z + 0.5], [0, -Math.PI / 2, 0]); }
  // record bins, jukebox, gramophone table + cloth
  recordBin(S, [-5.6, -4], 'bin back', 3); recordBin(S, [-5.6, 1.4], 'bin front', 5);
  const juke = new THREE.Group(); juke.position.set(-8.3, 0, -7.2); juke.rotation.y = 0.6; S.add(juke);
  solidify(put(juke, mesh(rb(2.6, 5.2, 1.6, 0.3), M(0x7a2a3a, { roughness: 0.35 })), [0, 2.6, 0]), 'jukebox');
  const arch = put(juke, mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.6, 24, 1, false, -Math.PI / 2, Math.PI), M(0x7a2a3a, { roughness: 0.35 })), [0, 5.2, 0], [Math.PI / 2, 0, 0]); arch.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  const jg = glow(0xffa84a, 0.03); put(juke, mesh(new THREE.BoxGeometry(2.0, 1.6, 0.1), jg), [0, 4.0, 0.81]); const jg2 = glow(0xff6ab0, 0.03); for (const sx of [-1, 1]) put(juke, mesh(new THREE.BoxGeometry(0.25, 3.4, 0.1), jg2), [sx * 1.15, 2.6, 0.81]);
  put(juke, mesh(new THREE.BoxGeometry(1.8, 0.8, 0.1), M(0xd8dce2, { metalness: 0.8, roughness: 0.2 })), [0, 2.4, 0.81]); for (let i = 0; i < 6; i++) put(juke, mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), M(0xf2f2ea)), [-0.75 + i * 0.3, 1.6, 0.85]);
  const jl = new THREE.PointLight(0xffa860, 0, 10, 1.6); jl.position.set(-7.0, 4, -5.6); S.add(jl);
  box(S, [2.4, 0.2, 2.4], [-7.6, 2.3, 6.6], M(0x4a2e1a, { roughness: 0.5 }), { r: 0.08, name: 'gram table' }); put(S, mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.2, 10), M(0x3a2418)), [-7.6, 1.1, 6.6]);
  const gram = gramophone(S); gram.position.set(-7.6, 2.4, 6.6); gram.rotation.y = Math.PI / 2;
  const clothM = std({ color: 0xb8ac98, roughness: 1, side: THREE.DoubleSide }); const cloth = new THREE.Group(); S.add(cloth);
  const cl1 = put(cloth, mesh(new THREE.SphereGeometry(1.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), clothM), [0, 0, 0]); cl1.scale.set(1.15, 1.6, 1.15);
  put(cloth, mesh(new THREE.CylinderGeometry(1.72, 1.9, 0.9, 16, 1, true), clothM), [0, -0.4, 0]);
  // stool, plant, rug, posters, hanging bulbs, ceiling fan
  put(S, mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 14), M(0xd8302a)), [2.4, 2.2, -3.6]); put(S, mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.1, 8), M(0xc8ccd2, { metalness: 0.7 })), [2.4, 1.1, -3.6]);
  put(S, mesh(new THREE.CylinderGeometry(0.7, 0.55, 1.2, 12), M(0xb85a3a)), [8.6, 0.6, 9.6]); for (let i = 0; i < 7; i++) put(S, mesh(new THREE.ConeGeometry(0.35, 2.6, 6), M(0x2a7a4a)), [8.6 + Math.sin(i * 0.9) * 0.6, 2.2, 9.6 + Math.cos(i * 0.9) * 0.6], [Math.sin(i * 0.9) * 0.4, 0, Math.cos(i * 0.9) * 0.4]);
  const rugT = ctex(256, 256, (c, w, h) => { c.fillStyle = '#6a2a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8b84a'; c.lineWidth = 8; c.strokeRect(14, 14, w - 28, h - 28); c.strokeRect(40, 40, w - 80, h - 80); noiseFill(c, w, h, 0.1, 1500); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(6, 8), std({ map: rugT, roughness: 1 })), [0.2, 0.02, 2.4], [-Math.PI / 2, 0, 0]);
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.4), std({ map: signTex('JAZZ', 'HARBOR HALL · 1994', { bg: '#1a3a5a', fg: '#f2c84a', w: 512, h: 700 }) })), [9.95, 5.2, 5.0], [0, -Math.PI / 2, 0]);
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.4), std({ map: signTex('SOUL', 'PIER DANCE · SAT', { bg: '#d8302a', fg: '#f2efe6', w: 512, h: 700 }) })), [9.95, 5.2, 9.4], [0, -Math.PI / 2, 0]);
  for (const [x, z] of [[-4, -2], [0, 3], [4, 6], [-4, 8]]) { put(S, mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 4), M(0x1a1a1a)), [x, 7.9, z]); put(S, mesh(new THREE.SphereGeometry(0.26, 10, 8), M(0xe8dcc0, { roughness: 0.3 })), [x, 6.7, z]); }
  const fan = new THREE.Group(); fan.position.set(0, 8.6, 1); S.add(fan); for (let i = 0; i < 4; i++) put(fan, mesh(new THREE.BoxGeometry(3.4, 0.06, 0.6), M(0x5a3a2a)), [0, 0, 0], [0, i * Math.PI / 2, 0]);
  // lights: cold fog glow through the glass (key from behind), candle, truck pink spill, a soft camera-side fill, the gramophone's warm glow
  S.add(new THREE.HemisphereLight(0x7a8ab8, 0x2a2026, 0.95));
  const top = new THREE.PointLight(0xb8c4e8, 7, 26, 1.4); top.position.set(-2, 8.2, 2); S.add(top);
  const corner = new THREE.PointLight(0xc8d0f0, 6, 14, 1.5); corner.position.set(-5.5, 6.5, 5.5); S.add(corner);
  const cold = new THREE.SpotLight(0xc8d8f2, 60, 40, 0.9, 0.6, 1.4); cold.position.set(-1, 7.5, -13); cold.target.position.set(0, 1, 4); cold.castShadow = true; cold.shadow.mapSize.set(1024, 1024); cold.shadow.bias = -0.002; S.add(cold); S.add(cold.target);
  const pinkL = new THREE.PointLight(0xff8ac0, 0, 22, 1.5); pinkL.position.set(0, 5, -12); S.add(pinkL);
  const camFill = new THREE.PointLight(0xbfcbe8, 12, 30, 1.4); camFill.position.set(1, 6.5, 10); S.add(camFill);
  const warm = new THREE.PointLight(0xffb060, 0, 16, 1.5); warm.position.set(-6.4, 4.6, 6.0); S.add(warm);
  const notes = musicNotes(S, 16);
  const env = { truck: tr, fog, wisp, gram, cloth: null, cold, pinkL, warm, camFill, candleL, notes, door: { open: k => { doorP.rotation.y = k * 1.5; } } };
  let clothK = 0; env.cloth = k => { clothK = k; }; env.juke = k => { jg.emissiveIntensity = 0.03 + 1.6 * k; jg2.emissiveIntensity = 0.03 + 1.4 * k; jl.intensity = 6 * k; };
  env.update = (t, { jingle = 1, ring = 12, inside = 0, music = 0, spin = 0, crank = null, cam = null } = {}) => {
    tr.update(t, { jingle, head: jingle > 0.05 ? 1 : 0 }); pinkL.intensity = 9 * jingle * (0.8 + 0.2 * Math.sin(t * 9));
    const rm = fogRing(0, -22, ring, 6); fog.update(t, cam ? (x, z) => Math.min(rm(x, z), sm(5, 10, Math.hypot(x - cam.position.x, z - cam.position.z))) : rm); wisp.update(t, (x, z) => sm(-0.5, 1.5, (-9 + inside * 8) - z) * (inside > 0.01 ? 1 : 0));
    const cp = gram.position; cloth.position.set(cp.x + clothK * 3.2, cp.y + 0.5 - clothK * 2.9, cp.z + clothK * 0.6); cloth.rotation.z = -clothK * 1.3; cloth.visible = clothK < 0.98;
    gram.update(t, { spin, crank }); warm.intensity = 14 * music * (0.9 + 0.1 * Math.sin(t * 6)); notes.update(t, gram.bellPos(), music, { up: 4.5, spread: 3.5, size: 0.55 });
    flameM.scale.set(1 + Math.sin(t * 13) * 0.08, 1.9 + Math.sin(t * 17) * 0.2, 1); candleL.intensity = 9 * (0.9 + 0.1 * Math.sin(t * 13)); fan.rotation.y = t * 0.05; bellG.rotation.z = 0; };
  env.bell = bellG;
  return env;
}
