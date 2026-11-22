// Episode 013 kit (The Sponge): living science-fair projects + three new environments (school gym science fair, school front lawn, bathroom).
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   spongeBuddy(S, { name, s })  cute living kitchen sponge (s 1 ≈ 1.65 tall, 1.5 wide; feet y 0, faces +Z): .root .body .update(t, mode, k)
//       modes 'idle'|'hop'|'shy'|'yawn'|'giggle'|'drink'|'wave'|'tug'|'squeeze'|'sleep' (k 0..1 strength) · .look(vec3) · .face('smile'|'open'|'o'|'grin'|'closed') · .eyes(k 0 shut..1 open)
//       Front face z ≈ 0.47·s, eyes y ≈ 1.0·s.
//   foamMonster(S, { name, s, seed })  bubbly foam creature (s 1 ≈ 6.5 tall, feet y 0, faces +Z): .root (scale = s) .update(t, mode, k)
//       modes 'idle'|'rise'|'roar'|'chomp'|'reach'|'shrink'; .rise(k) 0 = flat foam puddle → 1 standing; .mouth(k); .eyesOn(k) (eyes appear); .look(vec3). Eyes y ≈ 5.0·s.
//   foamPuffs(S, n)  → update(t, origin(Vector3), k, {up, spread, size}) bubbling eruption particles · foamCarpet(S, [x,y,z], [w,d], { n, seed }) → .set(k) floor foam
//   volcano(S, [x,y,z], s)  paper-mâché Mega Volcano (s 1: 5 tall, base r 2.3) with sleepy eyes: .wake(k) .burp(k) .update(t) .crater (world Vector3) .group
//   potatoClock(S, s) walking potato clock (s 1 ≈ 1.1 tall) .update(t, 'idle'|'walk'|'hop') .group · robotMop(S, s) bucket robot with a mop (s 1 ≈ 2.6 tall) .update(t, 'idle'|'mop'|'roll') .group
//   robotArm(S, [x,y,z], s) table robot arm: .pose(base, shoulder, elbow, wrist in deg) .hand (world pos) .group · paperPlane(S, col) · handBell(S) (.ring(t,k)) · triPoster(S, [x,y,z], title, col, ry)
//   fairTable(S, [x,z], { w, d, cloth, name }) skirted table, top y 2.6 (solid box) · eyeDropper(S) · trophy2(S, [x,y,z], s)
//   fairGym(S, { clean })  school gym science fair (daylight): floor x ±16, z -16..14, ceiling 16. Back wall z -16 (hoop + SCIENCE FAIR banner), bleachers on the LEFT
//       (x -16..-9, rows top 0.8·(i+1), z -14..6), high windows on the right wall with sun shafts. Tables (top 2.6): Dex (0,-8.3) x ±2.7 z -10.3..-6.3 (env.volcano s 0.9 on it: eyes (0, 5.2, -7.3), crater y 6.5), Benji (8,-2) x 6.3..9.7
//       (sponge plate at (8, 2.6, -1.7), poster behind), Priya (-6,-3), robot arm (-5,-9) (env.arm), solar oven (7,-10), plant maze (12,-6). Free floor x -8..14 / z -1..12 (minus Benji's table).
//       clean: no tables (end of the episode). env.foam(k) floor foam carpet.
//   schoolFront(S, { time })  Sparkhill School from the front lawn (day): building front z -20 (x ±28, 12 tall; entrance block x ±6, front z -18, 16 tall, doors x ±2.4),
//       env.windows (centres of the 16 front windows), walkway x ±3, flagpole (-11,-12), trees, bushes, bike rack, bench, marquee sign. Free lawn x -9..9, z -9..14. Giant foam spot: (0, 0, -34).
//   bathTest(S)  Benji's bathroom (flashback-friendly): walls x ±7, back z -7, h 9; clawfoot tub x -4.5..1.5, z -6.6..-3.8 (rim y 2.4, water env.water), sponge row on the rim,
//       sink + mirror right, towel rack left, window, test chart. Stand at the tub's right end (x ≈ 3.2, z ≈ -5.2) facing -x.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { std, box, T, dayLight } from './sets.js';
import { T2 } from './sets2.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const put = (parent, o, [x = 0, y = 0, z = 0] = [], rot) => { o.position.set(x, y, z); if (rot) o.rotation.set(...rot); parent.add(o); return o; };
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
const noiseFill = (c, w, h, a = 0.08, n = 3000) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); } };
const cache = {}; const once = (k, f) => cache[k] || (cache[k] = f());
const tmat = (t, rx, ry, o = {}) => { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return std({ map: c, roughness: 0.85, ...o }); };
const basic = (col, o = {}) => new THREE.MeshBasicMaterial({ color: col, ...o });
const M = (col, o = {}) => std({ color: col, roughness: 0.6, ...o });
const rb = (w, h, d, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const clamp01 = x => Math.max(0, Math.min(1, x));

// ---------------- textures ----------------
const courtTex = () => once('court', () => ctex(512, 512, (c, w, h) => { for (let i = 0; i < 16; i++) { const k = 0.88 + Math.random() * 0.2;
  c.fillStyle = `rgb(${Math.round(214 * k)},${Math.round(160 * k)},${Math.round(98 * k)})`; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(80,40,10,0.35)'; c.fillRect(0, i * 32, w, 1.5);
  for (let x = (i % 3) * 60; x < w; x += 180) c.fillRect(x, i * 32, 1.5, 32); for (let k2 = 0; k2 < 5; k2++) { c.strokeStyle = 'rgba(120,60,20,0.12)'; c.beginPath(); c.moveTo(0, i * 32 + 5 + k2 * 5); c.bezierCurveTo(w * 0.3, i * 32 + 3 + k2 * 5, w * 0.7, i * 32 + 9 + k2 * 5, w, i * 32 + 5 + k2 * 5); c.stroke(); } }
  noiseFill(c, w, h, 0.05, 2500); }));
const courtLines = () => once('lines', () => ctex(1024, 1024, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(250,250,245,0.9)'; c.lineWidth = 10;
  c.beginPath(); c.arc(w / 2, h * 0.55, 150, 0, 7); c.stroke(); c.beginPath(); c.moveTo(0, h * 0.55); c.lineTo(w, h * 0.55); c.stroke();
  c.strokeStyle = 'rgba(30,110,200,0.85)'; c.lineWidth = 14; c.strokeRect(w * 0.33, 0, w * 0.34, h * 0.3); c.beginPath(); c.arc(w / 2, h * 0.3, w * 0.17, 0, Math.PI); c.stroke();
  c.fillStyle = 'rgba(30,110,200,0.85)'; c.beginPath(); c.arc(w / 2, h * 0.55, 70, 0, 7); c.fill(); c.fillStyle = '#ffd23a'; c.font = '900 64px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('S', w / 2, h * 0.55 + 22); }));
const blockTex = (col = '#efe6d2', band) => once('blk' + col + band, () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#b8ae9a'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let x = -(r % 2) * 64; x < w; x += 128) { const b = new THREE.Color(col).multiplyScalar(0.95 + Math.random() * 0.07); c.fillStyle = '#' + b.getHexString(); c.fillRect(x + 3, r * 64 + 3, 122, 58); }
  if (band) { c.fillStyle = band; c.fillRect(0, h * 0.62, w, h * 0.12); } noiseFill(c, w, h, 0.05, 2000); }));
const wordTex = (lines, bg, fg, { w = 1024, h = 256, font = 900, stroke } = {}) => ctex(w, h, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach(([t, size, y, col]) => { c.font = `${font} ${size}px Inter, sans-serif`; if (stroke) { c.lineWidth = size * 0.12; c.strokeStyle = stroke; c.strokeText(t, W / 2, y * H); } c.fillStyle = col || fg; c.fillText(t, W / 2, y * H); }); });
const sponge = () => once('sponge', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#f6cf3a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { const r = 2 + Math.random() * 7;
  c.fillStyle = `rgba(${170 + Math.random() * 30},${120 + Math.random() * 20},10,${0.35 + Math.random() * 0.4})`; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, r, r * (0.6 + Math.random() * 0.5), Math.random() * 3, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.06, 1500); }));
const scrub = () => once('scrub', () => ctex(128, 128, (c, w, h) => { c.fillStyle = '#2f8a3a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(10,60,20,0.5)' : 'rgba(120,200,110,0.45)'; c.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1); } }));
const tileTex = (a = '#3aa8a0', g = '#e8f2f0', n = 8) => once('tile' + a + n, () => ctex(256, 256, (c, w, h) => { c.fillStyle = g; c.fillRect(0, 0, w, h); const s = w / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const b = new THREE.Color(a).multiplyScalar(0.92 + Math.random() * 0.14); c.fillStyle = '#' + b.getHexString(); c.fillRect(x * s + 2, y * s + 2, s - 4, s - 4); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x * s + 3, y * s + 3, s * 0.5, 3); } }));
const checkTex = () => once('check', () => ctex(256, 256, (c, w, h) => { const s = 32; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#2a2e36' : '#f2efe6'; c.fillRect(x * s, y * s, s, s); } noiseFill(c, w, h, 0.05, 800); }));
const stuccoTex = (col = '#f2e6cc') => once('stucco' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.07, 5000); }));
const posterTex = (title, col) => ctex(512, 384, (c, w, h) => { c.fillStyle = '#fbfaf4'; c.fillRect(0, 0, w, h); c.fillStyle = col; c.fillRect(0, 0, w, 70);
  c.fillStyle = '#fff'; c.font = '900 40px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(title, w / 2, 37);
  const R = rng(title.length); for (let i = 0; i < 4; i++) { c.fillStyle = ['#e8eef8', '#fff1d0', '#e2f6e4', '#fde4e8'][i]; const x = 30 + (i % 2) * 240, y = 95 + Math.floor(i / 2) * 140; c.fillRect(x, y, 210, 120);
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); for (let k = 0; k < 6; k++) c.lineTo(x + 15 + k * 36, y + 100 - R() * 70); c.stroke(); c.fillStyle = '#555'; for (let k = 0; k < 3; k++) c.fillRect(x + 12, y + 10 + k * 10, 80 + R() * 90, 4); } });

// ---------------- props ----------------
export function fairTable(S, [x, z], { w = 4, d = 2, cloth = 0x2a6ae8, name = 'table' } = {}) {
  box(S, [w, 2.5, d], [x, 1.25, z], M(cloth, { roughness: 0.95 }), { r: 0.04, name: name + ' skirt' });
  box(S, [w + 0.2, 0.12, d + 0.2], [x, 2.54, z], M(0xf6f4ee, { roughness: 0.8 }), { r: 0.03, name: name + ' top' });
  for (let i = 0; i < Math.round(w * 2); i++) put(S, mesh(new THREE.BoxGeometry(0.04, 2.3, 0.02), M(new THREE.Color(cloth).multiplyScalar(0.75).getHex())), [x - w / 2 + 0.25 + i * 0.5, 1.2, z + d / 2 + 0.02]);
}
export function triPoster(S, [x, y, z], title, col = 0x2a6ae8, ry = 0, s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry * D; g.scale.setScalar(s); S.add(g);
  const tx = posterTex(title, '#' + new THREE.Color(col).getHexString()); const m = std({ map: tx, roughness: 0.9 }); const side = M(0xfbfaf4, { roughness: 0.9 });
  put(g, mesh(new THREE.BoxGeometry(2.4, 1.8, 0.04), [side, side, side, side, m, side]), [0, 0.9, 0]);
  for (const sx of [-1, 1]) { const p = put(g, new THREE.Group(), [sx * 1.2, 0, 0]); p.rotation.y = -sx * 0.6; put(p, mesh(new THREE.BoxGeometry(1.2, 1.8, 0.04), M(new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.6).getHex())), [sx * 0.6, 0.9, 0]); }
  return g;
}
export function paperPlane(S, col = 0xffffff) {
  const g = new THREE.Group(); S.add(g); const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.9, -0.55, 0.06, -0.5, 0, -0.1, -0.45, 0, 0, 0.9, 0, -0.1, -0.45, 0.55, 0.06, -0.5, 0, 0, 0.9, 0, -0.1, -0.45, 0, -0.32, -0.4], 3)); geo.computeVertexNormals();
  put(g, mesh(geo, M(col, { side: THREE.DoubleSide, roughness: 0.8 })), [0, 0, 0]); return g;
}
export function handBell(S) { const g = new THREE.Group(); S.add(g); const gold = M(0xe8b830, { metalness: 0.8, roughness: 0.25 });
  const b = put(g, mesh(new THREE.CylinderGeometry(0.12, 0.42, 0.55, 20, 1, true), std({ color: 0xe8b830, metalness: 0.8, roughness: 0.25, side: THREE.DoubleSide })), [0, 0, 0]);
  put(g, mesh(new THREE.SphereGeometry(0.13, 10, 8), gold), [0, 0.3, 0]); put(g, mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.6, 10), M(0x3a2414)), [0, 0.65, 0]);
  const cl = put(g, mesh(new THREE.SphereGeometry(0.08, 8, 6), M(0x5a4a2a)), [0, -0.28, 0]);
  g.ring = (t, k) => { b.rotation.z = Math.sin(t * 40) * 0.25 * k; cl.position.x = Math.sin(t * 40 + 1) * 0.12 * k; }; return g; }
export function eyeDropper(S) { const g = new THREE.Group(); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.06, 0.02, 0.7, 10), std({ color: 0xd8f0ff, transparent: true, opacity: 0.6, roughness: 0.1 })), [0, 0, 0]);
  put(g, mesh(new THREE.SphereGeometry(0.11, 10, 8), M(0xd8302a)), [0, 0.42, 0]).scale.y = 1.4; const drop = put(g, mesh(new THREE.SphereGeometry(0.07, 10, 8), std({ color: 0x8ad0ff, roughness: 0.05, transparent: true, opacity: 0.85 })), [0, -0.4, 0]);
  g.drop = drop; return g; }
export function trophy2(S, [x, y, z], s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g); const gold = M(0xf2c030, { metalness: 0.85, roughness: 0.25 });
  put(g, mesh(new THREE.BoxGeometry(0.6, 0.25, 0.6), M(0x2a2a30)), [0, 0.12, 0]); put(g, mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.45, 10), gold), [0, 0.45, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.38, 0.14, 0.55, 20), gold), [0, 0.95, 0]); for (const sx of [-1, 1]) put(g, mesh(new THREE.TorusGeometry(0.15, 0.04, 6, 14), gold), [sx * 0.4, 1.0, 0], [0, 0, 0]); return g; }

// ---------------- living projects ----------------
export function spongeBuddy(S, { name = 'sponge', s = 1, seed = 1 } = {}) {
  const root = new THREE.Group(); root.scale.setScalar(s); S.add(root); const body = put(root, new THREE.Group(), [0, 0.4, 0]);
  const sp = std({ map: sponge(), roughness: 0.95 }); const blk = put(body, mesh(rb(1.5, 1.0, 0.92, 0.14), sp), [0, 0.5, 0]);
  put(body, mesh(rb(1.52, 0.26, 0.94, 0.08), std({ map: scrub(), roughness: 1 })), [0, 1.12, 0]);
  const white = M(0xffffff, { roughness: 0.25 }), black = M(0x141414, { roughness: 0.2 }), lidM = std({ map: sponge(), roughness: 0.95 });
  const E = [-0.3, 0.3].map(x => { const g = put(body, new THREE.Group(), [x, 0.62, 0.42]); const wh = put(g, mesh(new THREE.SphereGeometry(0.21, 18, 14), white), [0, 0, 0]); wh.scale.z = 0.7;
    const pu = put(g, mesh(new THREE.SphereGeometry(0.1, 12, 10), black), [0, 0, 0.13]); put(pu, new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), basic(0xffffff)), [0.03, 0.04, 0.08]);
    const lid = put(g, mesh(new THREE.SphereGeometry(0.225, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), lidM), [0, 0, 0]); lid.scale.z = 0.75; return { g, pu, lid }; });
  const mouthG = put(body, new THREE.Group(), [0, 0.3, 0.465]); const mo = put(mouthG, new THREE.Mesh(new THREE.CircleGeometry(0.16, 20, Math.PI, Math.PI), basic(0x5a1a1a)), [0, 0, 0]);
  const tongue = put(mouthG, new THREE.Mesh(new THREE.CircleGeometry(0.08, 14), basic(0xe86a7a)), [0, -0.1, 0.002]);
  const cheeks = [-0.5, 0.5].map(x => put(body, new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), basic(0xf2907a, { transparent: true, opacity: 0.7 })), [x, 0.4, 0.465]));
  const arms = [-1, 1].map(sx => { const g = put(body, new THREE.Group(), [sx * 0.78, 0.55, 0]); put(g, mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8), M(0xe8b830)), [0, -0.27, 0]);
    put(g, mesh(new THREE.SphereGeometry(0.11, 10, 8), M(0xffffff)), [0, -0.56, 0]); return g; });
  const legs = [-1, 1].map(sx => { const g = put(root, new THREE.Group(), [sx * 0.35, 0.42, 0]); put(g, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.34, 8), M(0xe8b830)), [0, -0.2, 0]);
    put(g, mesh(rb(0.24, 0.12, 0.34, 0.05), M(0x8a3a2a)), [0, -0.37, 0.06]); return g; });
  root.traverse(m => { if (m.isMesh) { m.userData.creature = name; } });
  const target = new THREE.Vector3(0, 2, 30), tmp = new THREE.Vector3(); let faceMode = 'smile', eyeK = 1, forcedEyes = null, plainK = 0;
  const B = { root, body, name, legs, arms,
    plain(k) { plainK = k; },   // 1 = an ordinary sponge (no face/limbs, sitting flat); 0 = alive
    look(v) { target.copy(v); }, eyes(k) { forcedEyes = k; }, face(f) { faceMode = f; },
    update(t, mode = 'idle', k = 1) {
      const br = Math.sin(t * 2.6 + seed); let sq = 1 + br * 0.02, rz = Math.sin(t * 1.7 + seed) * 0.03, rx = 0, by = 0, mouthOpen = faceMode === 'open' ? 0.8 : faceMode === 'o' ? 0.55 : faceMode === 'grin' ? 0.5 : 0.25;
      let aR = 0.25 + Math.sin(t * 2 + 1) * 0.08, aL = -0.25 - Math.sin(t * 2) * 0.08, axR = 0, axL = 0; let lg = 0; let ek = 1;
      if (mode === 'hop') { const ph = (t * 2.4) % 1; const air = Math.sin(ph * Math.PI); by = air * 0.9 * k; sq = ph < 0.12 ? 0.8 : 1 + air * 0.12; aR = 0.9 * air + 0.3; aL = -aR; lg = air * 0.4; }
      if (mode === 'shy') { rx = -0.12 * k; axR = -1.6 * k; axL = -1.6 * k; aR = 0.6 * k; aL = -0.6 * k; mouthOpen = 0.12; sq = 0.96; }
      if (mode === 'yawn') { mouthOpen = 0.25 + 1.0 * k; aR = 0.3 + 2.4 * k; aL = -aR; sq = 1 + 0.12 * k; ek = 1 - 0.85 * k; rx = -0.1 * k; }
      if (mode === 'giggle') { rz = Math.sin(t * 28) * 0.12 * k; sq = 1 + Math.abs(Math.sin(t * 14)) * 0.08 * k; mouthOpen = 0.5 + Math.abs(Math.sin(t * 14)) * 0.4 * k; ek = 0.35; aR = 0.6; aL = -0.6; axR = axL = -1.2 * k; }
      if (mode === 'drink') { mouthOpen = 0.9; sq = 1 + Math.sin(t * 9) * 0.1 * k; rx = 0.15 * k; aR = 1.2; aL = -1.2; }
      if (mode === 'wave') { aR = 2.6 + Math.sin(t * 10) * 0.35; }
      if (mode === 'tug') { rx = -0.25 * k; axR = axL = -1.3; by = 0; lg = 0.3 * k; sq = 1 + Math.sin(t * 12) * 0.04; }
      if (mode === 'squeeze') { sq = 1 - 0.35 * k; aR = 1.4 * k; aL = -aR; axR = axL = -0.6 * k; mouthOpen = 0.6 * k; ek = 1 - 0.8 * k; }
      if (mode === 'sleep') { ek = 0; mouthOpen = 0.08; sq = 1 + br * 0.03; }
      const pl = plainK > 0.5; [...E.map(e => e.g), mouthG, ...cheeks, ...arms, ...legs].forEach(o => o.visible = !pl); if (pl) { by = -0.4; sq = 1; rz = 0; rx = 0; }
      body.position.y = 0.4 + by; body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); body.rotation.set(rx, 0, rz);
      arms[1].rotation.set(axR, 0, aR); arms[0].rotation.set(axL, 0, aL); legs[0].rotation.x = lg; legs[1].rotation.x = -lg; legs.forEach(l => l.position.y = 0.42 + by * 0.8);
      mo.scale.set(1, Math.max(0.15, mouthOpen * 1.6), 1); mo.rotation.z = faceMode === 'o' || mode === 'yawn' || mode === 'drink' ? 0 : 0; tongue.visible = mouthOpen > 0.45; tongue.scale.setScalar(0.6 + mouthOpen * 0.4);
      const blink = ((t + seed) % 3.3) < 0.12 ? 0 : 1; eyeK = (forcedEyes ?? 1) * ek * blink;
      root.updateMatrixWorld(true); if (pl) return;
      E.forEach(e => { e.lid.rotation.x = -Math.PI / 2 - 0.15 + (1 - eyeK) * (Math.PI + 0.15); e.lid.visible = eyeK < 0.97; e.g.worldToLocal(tmp.copy(target)); tmp.normalize(); e.pu.position.set(tmp.x * 0.09, tmp.y * 0.09, 0.13); });
    } };
  return B;
}

const foamM = () => std({ color: 0xf6f9ff, roughness: 0.32, emissive: 0x8fa4c4, emissiveIntensity: 0.12 });
export function foamMonster(S, { name = 'foam', s = 1, seed = 2 } = {}) {
  const R = rng(seed); const root = new THREE.Group(); root.scale.setScalar(s); S.add(root); const mat = foamM();
  const blobs = [[0, 0.8, 0, 2.6, 1.0], [0, 2.6, 0, 2.1, 1.0], [0, 4.6, 0.1, 1.75, 1.0], [-1.2, 1.2, 0.8, 1.2, 1], [1.3, 1.0, 0.9, 1.1, 1], [0.9, 5.6, 0, 0.9, 1], [-0.8, 5.8, -0.2, 0.8, 1]];
  const parts = []; const body = put(root, new THREE.Group(), [0, 0, 0]);
  const sg = new THREE.IcosahedronGeometry(1, 3);
  blobs.forEach(([x, y, z, r], i) => { const m = put(body, mesh(sg, mat), [x, y, z]); m.scale.setScalar(r); m.userData.base = [x, y, z, r]; parts.push(m);
    const n = Math.round(r * 9); for (let k = 0; k < n; k++) { const th = R() * Math.PI * 2, ph = Math.acos(2 * R() - 1); const br = r * (0.25 + R() * 0.3);
      const b = put(body, mesh(sg, mat), [x + Math.sin(ph) * Math.cos(th) * r * 0.9, y + Math.cos(ph) * r * 0.85, z + Math.sin(ph) * Math.sin(th) * r * 0.9]); b.scale.setScalar(br); b.userData.base = [b.position.x, b.position.y, b.position.z, br]; b.userData.ph = R() * 7; parts.push(b); } });
  const arms = [-1, 1].map(sx => { const g = put(body, new THREE.Group(), [sx * 1.7, 3.3, 0.2]); for (let k = 0; k < 4; k++) { const b = put(g, mesh(sg, mat), [sx * (0.4 + k * 0.55), -k * 0.45, 0.1 * k]); b.scale.setScalar(0.75 - k * 0.08); }
    return g; });
  const head = put(body, new THREE.Group(), [0, 4.8, 1.2]);
  const white = M(0xffffff, { roughness: 0.2 }), black = M(0x101418, { roughness: 0.2 });
  const E = [-0.62, 0.62].map(x => { const g = put(head, new THREE.Group(), [x, 0.35, 0.35]); const w = put(g, mesh(new THREE.SphereGeometry(0.5, 20, 14), white), [0, 0, 0]);
    const pu = put(g, mesh(new THREE.SphereGeometry(0.24, 14, 10), black), [0, 0, 0.36]); put(pu, new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), basic(0xffffff)), [0.07, 0.08, 0.17]);
    const brow = put(g, mesh(rb(0.75, 0.2, 0.25, 0.08), mat), [0, 0.6, 0.1]); brow.rotation.z = x < 0 ? -0.35 : 0.35; return { g, pu, brow }; });
  const mouth = put(head, mesh(new THREE.SphereGeometry(0.75, 24, 14), M(0x2a3448, { roughness: 0.9 })), [0, -0.75, 0.15]); mouth.scale.set(1.2, 0.35, 0.5);
  const teeth = [-0.35, 0, 0.35].map(x => put(head, mesh(rb(0.22, 0.2, 0.1, 0.04), white), [x, -0.55, 0.5]));
  const target = new THREE.Vector3(0, 3, 40), tmp = new THREE.Vector3(); let riseK = 1, mouthK = 0.2, eyeK = 1;
  const F = { root, body, head, name, arms,
    rise(k) { riseK = k; }, mouth(k) { mouthK = k; }, eyesOn(k) { eyeK = k; }, look(v) { target.copy(v); },
    update(t, mode = 'idle', k = 1) {
      parts.forEach((p, i) => { const [x, y, z, r] = p.userData.base; const ph = p.userData.ph ?? i; const w = 1 + Math.sin(t * 3.1 + ph) * 0.05 + Math.sin(t * 7.3 + ph * 2) * 0.025;
        p.position.set(x, y * (0.18 + 0.82 * riseK), z); p.scale.setScalar(r * w * (0.85 + 0.15 * riseK)); });
      const roar = mode === 'roar' ? k : 0, chomp = mode === 'chomp' ? k : 0;
      body.rotation.z = Math.sin(t * 1.4) * 0.04; body.rotation.x = -0.12 * roar + 0.18 * chomp; body.scale.set(1 + Math.sin(t * 2) * 0.02, 1 + Math.sin(t * 2 + 1) * 0.02, 1);
      head.position.y = 4.8 * (0.15 + 0.85 * riseK); head.visible = riseK > 0.25; head.scale.setScalar(clamp01((riseK - 0.25) / 0.4) * (1 + roar * 0.1));
      const mk = Math.max(mouthK, roar * (0.85 + Math.sin(t * 20) * 0.08), chomp * Math.abs(Math.sin(t * 6)));
      mouth.scale.set(1.2 + mk * 0.2, 0.25 + mk * 1.1, 0.5); teeth.forEach(tt => { tt.position.y = -0.55 + 0.02 - mk * 0.0; tt.visible = mk > 0.3; });
      const reach = mode === 'reach' ? k : chomp;
      arms.forEach((a, i) => { const sx = i ? 1 : -1; a.rotation.z = sx * (-0.2 + Math.sin(t * 2 + i) * 0.15 + roar * 0.9); a.rotation.x = -reach * 1.2; a.scale.setScalar(clamp01((riseK - 0.4) / 0.4)); });
      root.updateMatrixWorld(true);
      E.forEach(e => { e.g.scale.setScalar(Math.max(0.0001, eyeK)); e.g.worldToLocal(tmp.copy(target)); tmp.normalize(); e.pu.position.set(tmp.x * 0.22, tmp.y * 0.22, 0.36); e.brow.position.y = 0.6 + roar * 0.1; });
      const bl = ((t + 1.3) % 4.1) < 0.12 ? 0.1 : 1; E.forEach(e => e.g.scale.y = Math.max(0.0001, eyeK * bl));
    } };
  return F;
}
export function foamPuffs(S, n = 30, seed = 5) { const R = rng(seed); const mat = foamM(); const sg = new THREE.IcosahedronGeometry(1, 2); const P = [];
  for (let i = 0; i < n; i++) { const m = mesh(sg, mat, false); m.visible = false; S.add(m); P.push({ m, a: R() * 7, sp: 0.6 + R() * 0.8, life: 0.9 + R() * 0.8, sz: 0.5 + R() * 0.7, off: R() }); }
  return (t, o, k = 1, { up = 3, spread = 1.5, size = 0.5, fall = 0 } = {}) => P.forEach((p, i) => { const u = ((t * p.sp + p.off) % p.life) / p.life; p.m.visible = k > 0.02;
    if (!p.m.visible) return; p.m.position.set(o.x + Math.cos(p.a) * spread * u, o.y + Math.sin(u * Math.PI) * up * (1 - fall) + (fall ? -u * fall * up : 0) + u * up * 0.2, o.z + Math.sin(p.a) * spread * u * 0.8);
    p.m.scale.setScalar(Math.max(0.0001, size * p.sz * k * (0.6 + u * 0.8))); }); }
export function foamCarpet(S, [x, y, z], [w, d], { n = 160, seed = 9, size = 0.7 } = {}) { const R = rng(seed); const mat = foamM(); const sg = new THREE.IcosahedronGeometry(1, 2); const g = new THREE.Group(); g.position.set(x, y, z); S.add(g); const P = [];
  for (let i = 0; i < n; i++) { const m = mesh(sg, mat, false); const px = (R() - 0.5) * w, pz = (R() - 0.5) * d; m.position.set(px, 0, pz); const dd = Math.hypot(px / (w / 2), pz / (d / 2)); P.push({ m, dd, s: size * (0.5 + R() * 0.9) }); g.add(m); }
  g.set = (k) => P.forEach(p => { const v = clamp01((k * 1.25 - p.dd) * 3); p.m.visible = v > 0.01; p.m.scale.set(p.s * v, p.s * v * 0.75, p.s * v); }); g.set(0); return g; }

export function volcano(S, [x, y, z], s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  const tex = once('volc', () => ctex(512, 256, (c, w, h) => { c.fillStyle = '#7a5434'; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.18, 6000);
    c.fillStyle = '#4f8a3a'; for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(Math.random() * w, h * 0.75 + Math.random() * h * 0.25, 30, 14, 0, 0, 7); c.fill(); }
    c.strokeStyle = '#e8501a'; c.lineWidth = 14; for (let i = 0; i < 6; i++) { const x0 = i * 90 + 20; c.beginPath(); c.moveTo(x0, 0); c.bezierCurveTo(x0 + 20, 50, x0 - 20, 90, x0 + 10, 140 + (i % 3) * 20); c.stroke(); } }));
  const cone = put(g, mesh(new THREE.CylinderGeometry(0.75, 2.3, 4.2, 28, 6), std({ map: tex, roughness: 0.95 })), [0, 2.1, 0]);
  const p = cone.geometry.attributes.position; const R = rng(4); for (let i = 0; i < p.count; i++) { const k = 1 + (R() - 0.5) * 0.08; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } cone.geometry.computeVertexNormals();
  put(g, mesh(new THREE.TorusGeometry(0.72, 0.18, 10, 24), M(0x5a3a22)), [0, 4.2, 0], [Math.PI / 2, 0, 0]);
  put(g, mesh(new THREE.CircleGeometry(0.62, 24), M(0x2a1a10)), [0, 4.15, 0], [-Math.PI / 2, 0, 0]);
  const foamTop = put(g, mesh(new THREE.IcosahedronGeometry(0.6, 3), foamM()), [0, 4.2, 0]); foamTop.scale.set(1, 0.3, 1);
  const white = M(0xffffff, { roughness: 0.2 }), black = M(0x111111);
  const E = [-0.55, 0.55].map(ex => { const e = put(g, new THREE.Group(), [ex, 2.9, 1.08]); e.rotation.x = -0.27; put(e, mesh(new THREE.SphereGeometry(0.36, 16, 12), white), [0, 0, 0]).scale.z = 0.6;
    const pu = put(e, mesh(new THREE.SphereGeometry(0.17, 12, 10), black), [0, -0.02, 0.18]); const lid = put(e, mesh(new THREE.SphereGeometry(0.38, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ map: tex })), [0, 0, 0]); lid.scale.z = 0.65; return { e, pu, lid }; });
  const mouth = put(g, mesh(new THREE.SphereGeometry(0.4, 16, 10), M(0x2a0e08)), [0, 2.05, 1.32]); mouth.scale.set(1.3, 0.12, 0.3); mouth.rotation.x = -0.27;
  const sign = put(g, new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), std({ map: wordTex([['MEGA VOLCANO', 116, 0.55, '#fff']], '#c8262a', '#fff', { stroke: '#5a0a0a' }) })), [0, 0.9, 2.02]); sign.rotation.x = -0.1;
  let wakeK = 0, burpK = 0;
  return { group: g, crater: new THREE.Vector3(), foamTop,
    wake(k) { wakeK = k; }, burp(k) { burpK = k; },
    update(t) { E.forEach(({ lid, pu }) => { lid.rotation.x = Math.PI / 2 - wakeK * (Math.PI + 0.3) + 0.06 * Math.sin(t * 3) * wakeK; pu.position.x = Math.sin(t * 0.9) * 0.06 * wakeK; });
      mouth.scale.set(1.3 + burpK * 0.3, 0.12 + burpK * 0.9, 0.3); cone.scale.set(1 + burpK * 0.08, 1 - burpK * 0.06 + Math.sin(t * 18) * 0.01 * wakeK, 1 + burpK * 0.08);
      foamTop.scale.set(1 + burpK * 0.4, 0.3 + burpK * 0.9 + Math.sin(t * 6) * 0.05, 1 + burpK * 0.4); g.updateMatrixWorld(true); this.crater.set(0, 4.3, 0).applyMatrix4(g.matrixWorld); } };
}
export function potatoClock(S, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s); S.add(g); const body = put(g, new THREE.Group(), [0, 0.25, 0]);
  const pm = M(0xb8864a, { roughness: 0.95 }); const pot = put(body, mesh(new THREE.SphereGeometry(0.55, 20, 14), pm), [0, 0.45, 0]); pot.scale.set(1.15, 0.85, 0.85);
  const R = rng(7); for (let i = 0; i < 8; i++) { const a = R() * 6.28, b = R() * 1.2 - 0.3; put(body, mesh(new THREE.SphereGeometry(0.05, 6, 4), M(0x6a4a24)), [Math.cos(a) * 0.6 * Math.cos(b), 0.45 + Math.sin(b) * 0.45, Math.sin(a) * 0.46 * Math.cos(b)]); }
  const lcd = ctex(256, 128, (c, w, h) => { c.fillStyle = '#1a2a1a'; c.fillRect(0, 0, w, h); c.fillStyle = '#6aff6a'; c.font = '700 84px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7:00', w / 2, h / 2 + 4); });
  put(body, mesh(rb(0.62, 0.32, 0.1, 0.03), M(0x2a2a30)), [0, 0.5, 0.46]); put(body, new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.25), basic(0xffffff, { map: lcd })), [0, 0.5, 0.515]);
  for (const [x, c] of [[-0.3, 0xd83a2a], [0.3, 0x2a2a2a]]) { const w = put(body, mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 16, Math.PI), M(c)), [x, 0.85, 0.15]); w.rotation.z = 0; }
  const eyes = [-0.16, 0.16].map(x => { const e = put(body, mesh(new THREE.SphereGeometry(0.1, 12, 10), M(0xffffff, { roughness: 0.2 })), [x, 0.82, 0.38]); put(e, mesh(new THREE.SphereGeometry(0.05, 8, 6), M(0x111111)), [0, 0, 0.07]); return e; });
  const legs = [-0.25, 0.25].map(x => { const l = put(g, new THREE.Group(), [x, 0.3, 0]); put(l, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 6), M(0xb8864a)), [0, -0.14, 0]); put(l, mesh(rb(0.14, 0.07, 0.2, 0.03), M(0x3a2a1a)), [0, -0.28, 0.04]); return l; });
  g.update = (t, mode = 'idle') => { const w = mode === 'walk' ? 1 : 0; const hp = mode === 'hop' ? Math.abs(Math.sin(t * 7)) * 0.35 : 0;
    legs.forEach((l, i) => l.rotation.x = Math.sin(t * 12 + i * Math.PI) * 0.6 * w); body.position.y = 0.25 + Math.abs(Math.sin(t * 12)) * 0.05 * w + hp; body.rotation.z = Math.sin(t * 12) * 0.08 * w + Math.sin(t * 2) * 0.03;
    eyes.forEach(e => e.scale.y = ((t + 0.4) % 2.9) < 0.1 ? 0.15 : 1); };
  return g;
}
export function robotMop(S, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s); S.add(g); const blue = M(0x2a7ad8, { roughness: 0.4, metalness: 0.2 }), grey = M(0x9aa2ac, { metalness: 0.6, roughness: 0.35 });
  const body = put(g, new THREE.Group(), [0, 0, 0]);
  put(body, mesh(new THREE.CylinderGeometry(0.75, 0.6, 1.3, 20), blue), [0, 0.95, 0]); put(body, mesh(new THREE.TorusGeometry(0.76, 0.05, 6, 20), grey), [0, 1.6, 0], [Math.PI / 2, 0, 0]);
  for (const [x, z] of [[-0.45, 0.35], [0.45, 0.35], [0, -0.5]]) put(g, mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12), M(0x222222)), [x, 0.18, z], [0, 0, Math.PI / 2]);
  put(body, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), grey), [0, 1.85, 0]);
  const scr = ctex(256, 160, (c, w, h) => { c.fillStyle = '#10161e'; c.fillRect(0, 0, w, h); c.fillStyle = '#5ae8ff'; c.beginPath(); c.ellipse(80, 70, 22, 30, 0, 0, 7); c.ellipse(176, 70, 22, 30, 0, 0, 7); c.fill();
    c.strokeStyle = '#5ae8ff'; c.lineWidth = 8; c.beginPath(); c.arc(128, 100, 34, 0.2, Math.PI - 0.2); c.stroke(); });
  const head = put(body, new THREE.Group(), [0, 2.25, 0]); put(head, mesh(rb(1.0, 0.62, 0.5, 0.1), M(0xe8ecf0, { roughness: 0.4 })), [0, 0, 0]);
  put(head, new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.48), basic(0xffffff, { map: scr })), [0, 0, 0.255]);
  const ant = put(head, mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff4a3a })), [0.3, 0.45, 0]);
  const arm = put(body, new THREE.Group(), [0.75, 1.3, 0.2]); put(arm, mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), M(0xc8a070)), [0, -0.5, 0.7], [1.0, 0, 0]);
  const mop = put(arm, new THREE.Group(), [0, -1.25, 1.75]); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; const st = put(mop, mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.6, 5), M(0xe8e4dc, { roughness: 1 })), [Math.cos(a) * 0.18, -0.25, Math.sin(a) * 0.18]); st.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); }
  g.update = (t, mode = 'idle') => { const m = mode === 'mop' ? 1 : 0; arm.rotation.y = Math.sin(t * 8) * 0.5 * m; arm.rotation.x = Math.sin(t * 16) * 0.08 * m; body.rotation.y = Math.sin(t * 4) * 0.12 * m;
    head.rotation.z = Math.sin(t * 3) * 0.06; ant.material.color.setHex(Math.sin(t * 6) > 0 ? 0xff4a3a : 0x5a1a1a); body.position.y = mode === 'roll' ? Math.abs(Math.sin(t * 14)) * 0.04 : 0; };
  g.arm = arm; g.head = head; return g;
}
export function robotArm(S, [x, y, z], s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g); const org = M(0xf28a1a, { roughness: 0.4, metalness: 0.2 }), dk = M(0x2a2e36, { metalness: 0.5, roughness: 0.4 });
  put(g, mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.35, 20), dk), [0, 0.17, 0]); const base = put(g, new THREE.Group(), [0, 0.35, 0]);
  put(base, mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.4, 16), org), [0, 0.2, 0]); const sh = put(base, new THREE.Group(), [0, 0.45, 0]); put(sh, mesh(new THREE.SphereGeometry(0.28, 12, 10), dk), [0, 0, 0]);
  put(sh, mesh(rb(0.3, 1.6, 0.3, 0.1), org), [0, 0.8, 0]); const el = put(sh, new THREE.Group(), [0, 1.6, 0]); put(el, mesh(new THREE.SphereGeometry(0.22, 12, 10), dk), [0, 0, 0]);
  put(el, mesh(rb(0.24, 1.3, 0.24, 0.09), org), [0, 0.65, 0]); const wr = put(el, new THREE.Group(), [0, 1.3, 0]); put(wr, mesh(new THREE.SphereGeometry(0.16, 10, 8), dk), [0, 0, 0]);
  put(wr, mesh(rb(0.55, 0.62, 0.12, 0.05), M(0xe8ecf0, { roughness: 0.4 })), [0, 0.38, 0]); for (let i = 0; i < 3; i++) put(wr, mesh(rb(0.12, 0.32, 0.1, 0.04), M(0xe8ecf0)), [-0.18 + i * 0.18, 0.82, 0]);
  put(wr, mesh(rb(0.1, 0.28, 0.1, 0.04), M(0xe8ecf0)), [0.33, 0.5, 0], [0, 0, -0.6]);
  const hand = new THREE.Vector3();
  return { group: g, hand, pose(b = 0, a = 0, e = 0, w = 0) { base.rotation.y = b * D; sh.rotation.x = a * D; el.rotation.x = e * D; wr.rotation.x = w * D; g.updateMatrixWorld(true); hand.set(0, 0.5, 0).applyMatrix4(wr.matrixWorld); } };
}

// ---------------- sets ----------------
function sunShaft(S, from, to, w = 2.4, op = 0.07) {
  const len = from.distanceTo(to); const m = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.6, w, len, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  m.position.copy(from).lerp(to, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize()); S.add(m); return m;
}
export function fairGym(S, { clean = false } = {}) {
  S.background = new THREE.Color(0xf0e6d0);
  const W = 16, Z0 = -16, Z1 = 26, H = 16;
  box(S, [2 * W, 0.3, Z1 - Z0], [0, -0.15, (Z0 + Z1) / 2], tmat(courtTex(), 4, 4, { roughness: 0.45 }), { r: 0, cast: false, name: 'floor' });
  const ln = put(S, new THREE.Mesh(new THREE.PlaneGeometry(2 * W - 2, Z1 - Z0 - 2), new THREE.MeshStandardMaterial({ map: courtLines(), transparent: true, roughness: 0.45, depthWrite: false })), [0, 0.012, (Z0 + Z1) / 2 - 1], [-Math.PI / 2, 0, 0]); ln.receiveShadow = true;
  const wm = tmat(blockTex('#efe6d2', '#2a6ad0'), 6, 3.2);
  box(S, [2 * W, H, 0.5], [0, H / 2, Z0 - 0.25], wm, { r: 0, cast: false, name: 'back wall' });
  for (const sx of [-1, 1]) box(S, [0.5, H, Z1 - Z0], [sx * (W + 0.25), H / 2, (Z0 + Z1) / 2], tmat(blockTex('#efe6d2', '#2a6ad0'), 6, 3.2), { r: 0, cast: false, name: 'side wall' });
  box(S, [2 * W, H, 0.5], [0, H / 2, Z1 + 0.25], wm, { r: 0, cast: false, solid: false });
  box(S, [2 * W, 0.4, Z1 - Z0], [0, H + 0.2, (Z0 + Z1) / 2], M(0x6a6e76, { roughness: 0.9 }), { r: 0, cast: false, solid: false });
  // steel trusses + hanging dome lights
  const steel = M(0x3a4250, { metalness: 0.5, roughness: 0.5 }); for (let z = -12; z < 14; z += 6) { box(S, [2 * W, 0.5, 0.3], [0, H - 1.0, z], steel, { r: 0, cast: false, solid: false }); for (let x = -14; x <= 14; x += 4) put(S, mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), steel, false), [x, H - 0.5, z], [0, 0, 0.6]); }
  const lamps = []; for (const z of [-10, -2, 6]) for (const x of [-9, 0, 9]) { put(S, mesh(new THREE.CylinderGeometry(0.03, 0.03, 2, 4), steel, false), [x, H - 2, z]);
    put(S, mesh(new THREE.SphereGeometry(0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x4a5260, { side: THREE.DoubleSide, metalness: 0.4 }), false), [x, H - 3, z]); const b = put(S, new THREE.Mesh(new THREE.CircleGeometry(0.75, 16), basic(0xfff6e0)), [x, H - 3.02, z], [Math.PI / 2, 0, 0]); lamps.push(b); }
  S.add(new THREE.HemisphereLight(0xfff4e0, 0x8a6a48, 1.25));
  const top = new THREE.PointLight(0xfff0d8, 70, 40, 1.4); top.position.set(0, 12, -2); S.add(top);
  const top2 = new THREE.PointLight(0xfff0d8, 40, 34, 1.5); top2.position.set(-2, 11, 8); S.add(top2);
  // sun from the high right windows
  const sun = new THREE.DirectionalLight(0xffe2b0, 3.0); sun.position.set(26, 26, 6); sun.target.position.set(0, 0, -4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 }); S.add(sun, sun.target);
  const winM = std({ color: 0xdff0ff, emissive: 0xcfe6ff, emissiveIntensity: 1.3 });
  for (const z of [-11, -5, 1, 7]) { box(S, [0.1, 3.6, 4.2], [W - 0.05, 11.2, z], winM, { r: 0, cast: false, solid: false }); for (const dz of [-1.05, 0, 1.05]) box(S, [0.14, 3.6, 0.1], [W - 0.08, 11.2, z + dz], M(0xf4f4f4), { r: 0, cast: false, solid: false });
    sunShaft(S, new THREE.Vector3(W - 0.5, 11, z), new THREE.Vector3(W - 13, 0.2, z - 3), 2.0, 0.05); }
  for (const x of [-11, -5.5, 5.5, 11]) { box(S, [3.6, 2.4, 0.1], [x, 13.4, Z0 + 0.05], winM, { r: 0, cast: false, solid: false }); }
  // hoop + backboard + banner on the back wall
  box(S, [6, 3.6, 0.2], [0, 10.4, Z0 + 0.8], std({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.2 }), { r: 0.05, cast: false, solid: false });
  box(S, [2.2, 1.6, 0.22], [0, 9.6, Z0 + 0.82], std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.0, roughness: 0.4 }), { r: 0, cast: false, solid: false });
  put(S, mesh(new THREE.TorusGeometry(0.85, 0.07, 8, 24), M(0xf25a1a, { metalness: 0.4 })), [0, 8.9, Z0 + 1.9], [Math.PI / 2, 0, 0]);
  const net = put(S, mesh(new THREE.CylinderGeometry(0.85, 0.55, 1.2, 16, 1, true), std({ color: 0xffffff, wireframe: true })), [0, 8.3, Z0 + 1.9]);
  box(S, [0.5, 2, 1.6], [0, 9.2, Z0 + 0.9], steel, { r: 0, cast: false, solid: false });
  const ban = put(S, new THREE.Mesh(new THREE.PlaneGeometry(16, 2.6), std({ map: wordTex([['SCIENCE FAIR', 150, 0.52, '#ffd23a']], '#1f4fb0', '#fff', { stroke: '#0a2a6a' }), roughness: 0.9 })), [0, 13.8, Z0 + 0.3]);
  const banHang = [-7.8, 7.8].map(x => put(S, mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 4), steel, false), [x, 15.6, Z0 + 0.3]));
  // mascot circle + scoreboard
  put(S, new THREE.Mesh(new THREE.CircleGeometry(2.4, 40), std({ map: wordTex([['SPARKHILL', 76, 0.4, '#fff'], ['SPARKS', 110, 0.62, '#ffd23a']], '#c8262a', '#fff', { w: 512, h: 512 }) })), [-10.5, 6.2, Z0 + 0.02]);
  box(S, [5, 2.4, 0.4], [10.5, 7.2, Z0 + 0.25], M(0x16181c), { r: 0.05, cast: false, solid: false });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.9), basic(0xffffff, { map: wordTex([['HOME 24   AWAY 21', 110, 0.5, '#ff5a2a']], '#0a0a0a', '#f00', { w: 1024, h: 420, font: 800 }) })), [10.5, 7.2, Z0 + 0.47]);
  // bleachers on the left wall
  const seat = std({ map: once('bl', () => ctex(256, 64, (c, w, h) => { c.fillStyle = '#c89a5a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, i * 16, w, 1.5); } noiseFill(c, w, h, 0.08, 400); })), roughness: 0.6 });
  for (let i = 0; i < 5; i++) { const x1 = -9 - i * 1.4; box(S, [1.4, 0.8 * (i + 1), 20], [x1 - 0.7, 0.4 * (i + 1), -4], M(0x2a3a5a, { roughness: 0.6 }), { r: 0.02, cast: true, name: 'bleacher' + i });
    box(S, [1.45, 0.14, 20.05], [x1 - 0.7, 0.8 * (i + 1) + 0.02, -4], seat, { r: 0.03, cast: false, solid: false }); }
  box(S, [0.12, 1.4, 20], [-8.9, 1.5, -4], M(0xc8ccd4, { metalness: 0.7 }), { r: 0.04, cast: false, solid: false });
  // padded wall mats under the windows + water fountain + ball cart
  for (let z = -12; z < 12; z += 4.1) box(S, [0.3, 3.2, 4], [W - 0.15, 1.6, z], M(0x2a5ab8, { roughness: 0.7 }), { r: 0.08, cast: false, name: 'mat' });
  const cart = new THREE.Group(); cart.position.set(13, 0, 9); S.add(cart); put(cart, mesh(new THREE.BoxGeometry(2, 1.6, 1.4), M(0x3a3e46, { metalness: 0.5, wireframe: false, transparent: true, opacity: 0.25 })), [0, 1.0, 0]);
  [[0xf25a1a, -0.5, 0], [0xf25a1a, 0.5, 0.1], [0xf2f2f2, 0, -0.3], [0x2a6ad8, 0.1, 0.35]].forEach(([c, x, z], i) => put(cart, mesh(new THREE.SphereGeometry(0.45, 16, 12), M(c, { roughness: 0.6 })), [x, 1.4 + (i > 1 ? 0.5 : 0), z]));
  // ---- the science fair ----
  const env = { sun, lamps, banner: ban };
  if (!clean) {
    fairTable(S, [0, -8.3], { w: 5.4, d: 4.0, cloth: 0xc8262a, name: 'dex table' });
    env.volcano = volcano(S, [0, 2.6, -8.3], 0.9); trophy2(S, [-2.35, 2.6, -6.9], 0.6); trophy2(S, [2.35, 2.6, -7.0], 0.55); trophy2(S, [2.3, 2.6, -9.6], 0.45);
    fairTable(S, [8, -2], { w: 3.4, d: 1.8, cloth: 0x2a8ad8, name: 'benji table' });
    env.poster = triPoster(S, [8, 2.6, -2.7], 'THE AMAZING SPONGE', 0xe8a81a, 0, 0.9);
    put(S, mesh(new THREE.CylinderGeometry(0.85, 0.7, 0.08, 24), M(0xffffff, { roughness: 0.25 })), [8, 2.64, -1.7]);
    put(S, mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.5, 14), std({ color: 0xcfe8ff, transparent: true, opacity: 0.45, roughness: 0.05 })), [9.3, 2.85, -1.6]);
    fairTable(S, [-6, -3], { w: 3.4, d: 1.8, cloth: 0x7a3ab8, name: 'priya table' }); triPoster(S, [-6, 2.6, -3.7], 'POTATO POWER', 0x7a3ab8, 0, 0.9);
    for (let i = 0; i < 4; i++) { const p = put(S, mesh(new THREE.SphereGeometry(0.3, 12, 10), M(0xb8864a, { roughness: 0.95 })), [-7.2 + i * 0.5, 2.85, -2.6]); p.scale.set(1.2, 0.8, 0.9); }
    fairTable(S, [-5, -9.5], { w: 3.6, d: 2.0, cloth: 0x2a9a5a, name: 'arm table' }); triPoster(S, [-5, 2.6, -10.3], 'ROBO HELPER', 0x2a9a5a, 0, 0.9); env.arm = robotArm(S, [-4.0, 2.6, -9.3], 0.8); env.arm.pose(0, 0, 0, 0);
    fairTable(S, [7.5, -10], { w: 3.4, d: 1.8, cloth: 0xf2a81a, name: 'solar table' }); triPoster(S, [7.5, 2.6, -10.7], 'SOLAR OVEN', 0xe8501a, 0, 0.9);
    const so = put(S, mesh(new THREE.BoxGeometry(1.2, 0.6, 0.9), M(0x2a2a2a)), [7.5, 2.9, -9.8]); put(S, mesh(new THREE.BoxGeometry(1.2, 0.02, 0.9), std({ color: 0xe8eef4, metalness: 1, roughness: 0.15 })), [7.5, 3.5, -10.1], [-0.6, 0, 0]);
    fairTable(S, [12.6, -5], { w: 3.0, d: 1.8, cloth: 0x2ab8a8, name: 'plant table' }); triPoster(S, [12.6, 2.6, -5.7], 'BEAN MAZE', 0x2a9a4a, 0, 0.8);
    put(S, mesh(new THREE.BoxGeometry(1.2, 1.2, 0.9), M(0xc8a070)), [12.4, 3.2, -4.9]); for (let i = 0; i < 5; i++) put(S, mesh(new THREE.SphereGeometry(0.16, 8, 6), M(0x4aa83a)), [12.0 + i * 0.2, 3.9 + (i % 2) * 0.2, -4.6]);
    env.foam = foamCarpet(S, [0, 0.05, -2], [22, 22], { n: 220, size: 0.9 }); env.foam.set(0);
  }
  return Object.assign(env, { update(t) { if (env.volcano) env.volcano.update(t); net.rotation.y = Math.sin(t * 0.5) * 0.03; } });
}

function tree(S, [x, z], h = 7, col = 0x4a9a3a, seed = 1) { const R = rng(seed); const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
  put(g, mesh(new THREE.CylinderGeometry(0.35, 0.5, h * 0.55, 8), M(0x6a4a2a, { roughness: 1 })), [0, h * 0.27, 0]);
  const leaves = []; for (let i = 0; i < 5; i++) leaves.push(put(g, mesh(new THREE.IcosahedronGeometry(h * (0.2 + R() * 0.1), 1), M(new THREE.Color(col).multiplyScalar(0.85 + R() * 0.3).getHex(), { roughness: 0.9, flatShading: true })), [(R() - 0.5) * h * 0.4, h * (0.62 + R() * 0.25), (R() - 0.5) * h * 0.4]));
  g.sway = t => leaves.forEach((l, i) => l.rotation.z = Math.sin(t * 1.3 + i) * 0.04); return g; }
export function schoolFront(S, { time = 'day' } = {}) {
  const sun = dayLight(S, { sunPos: [-14, 22, 16], intensity: 3.2, area: 34 });
  S.background = T.sky('#4a8ae0', '#cfe6ff'); S.fog = new THREE.Fog(0xd8e8f6, 60, 180);
  box(S, [200, 0.3, 160], [0, -0.15, -30], tmat(T2.grass(), 22, 18), { r: 0, cast: false, name: 'lawn' });
  const conc = tmat(T.concrete(), 2, 10, { roughness: 0.9 });
  box(S, [6, 0.06, 40], [0, 0.03, 0], conc, { r: 0, cast: false, solid: false, name: 'walk' }); box(S, [90, 0.06, 4], [0, 0.03, 9.5], conc, { r: 0, cast: false, solid: false });
  box(S, [40, 0.08, 6], [0, 0.04, -15.5], conc, { r: 0, cast: false, solid: false });
  // building
  const stucco = tmat(stuccoTex('#f2e6cc'), 6, 2), trim = M(0x1f8a8a, { roughness: 0.6 }), white = M(0xf8f8f4, { roughness: 0.5 });
  box(S, [56, 12, 8], [0, 6, -24], stucco, { r: 0, cast: true, name: 'school' });
  box(S, [56.4, 0.8, 8.4], [0, 12.2, -24], trim, { r: 0, cast: false, solid: false }); box(S, [56.2, 0.5, 0.2], [0, 6.6, -19.95], trim, { r: 0, cast: false, solid: false });
  box(S, [12, 16, 6], [0, 8, -21], tmat(stuccoTex('#e85a3a'), 2, 3), { r: 0, cast: true, name: 'entrance' }); box(S, [12.4, 0.8, 6.4], [0, 16.2, -21], white, { r: 0, cast: false, solid: false });
  const winM = std({ color: 0x9ac8f0, emissive: 0x7ab0e0, emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.3 });
  const windows = [];
  for (const sx of [-1, 1]) for (const x of [9, 14, 19, 24]) for (const y of [3.4, 9.0]) { box(S, [3.4, 3.2, 0.1], [sx * x, y, -19.95], winM, { r: 0, cast: false, solid: false });
    box(S, [3.8, 0.3, 0.4], [sx * x, y - 1.75, -19.8], white, { r: 0, cast: false, solid: false }); box(S, [0.14, 3.2, 0.14], [sx * x, y, -19.88], white, { r: 0, cast: false, solid: false }); windows.push(new THREE.Vector3(sx * x, y, -19.7)); }
  // doors + canopy + sign + clock
  box(S, [4.8, 5, 0.1], [0, 2.5, -17.95], std({ color: 0x5a8ab0, emissive: 0x2a4a6a, emissiveIntensity: 0.3, roughness: 0.1, metalness: 0.4 }), { r: 0, cast: false, solid: false });
  box(S, [0.2, 5, 0.18], [0, 2.5, -17.9], white, { r: 0, cast: false, solid: false }); box(S, [5.4, 0.3, 0.3], [0, 5.1, -17.9], white, { r: 0, cast: false, solid: false });
  box(S, [8, 0.35, 3], [0, 6.2, -16.6], white, { r: 0.05, cast: true, solid: false }); for (const sx of [-1, 1]) box(S, [0.25, 6.2, 0.25], [sx * 3.6, 3.1, -15.4], white, { r: 0.04, name: 'post' });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(10, 1.6), std({ map: wordTex([['SPARKHILL SCHOOL', 94, 0.55, '#ffffff']], '#c8402a', '#fff'), transparent: false })), [0, 10.2, -17.94]);
  const clk = put(S, new THREE.Group(), [0, 13.6, -17.9]); put(clk, mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 32), white), [0, 0, 0], [Math.PI / 2, 0, 0]);
  put(clk, mesh(new THREE.TorusGeometry(1.3, 0.1, 8, 32), M(0x2a2a2a)), [0, 0, 0.05]); const hands = [put(clk, mesh(new THREE.BoxGeometry(0.1, 0.8, 0.05), M(0x111111)), [0, 0.35, 0.14]), put(clk, mesh(new THREE.BoxGeometry(0.08, 1.1, 0.05), M(0x111111)), [0, 0.5, 0.15])];
  // rooftop units
  for (const [x, w] of [[-18, 3], [16, 4], [22, 2.4]]) box(S, [w, 1.6, 2.4], [x, 13.4, -25], M(0xaab0b8, { metalness: 0.4 }), { r: 0.05, cast: false, solid: false });
  // bushes along the front
  for (let i = -26; i <= 26; i += 2.6) if (Math.abs(i) > 6.5) put(S, mesh(new THREE.IcosahedronGeometry(1.1, 1), M(0x3a8a3a, { flatShading: true, roughness: 0.9 })), [i, 0.7, -18.8]).scale.set(1.2, 0.8, 0.9);
  // flagpole + flag
  put(S, mesh(new THREE.CylinderGeometry(0.12, 0.16, 16, 10), M(0xd8dce0, { metalness: 0.8, roughness: 0.3 })), [-11, 8, -12]);
  const flagT = ctex(256, 160, (c, w, h) => { c.fillStyle = '#1f4fb0'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 22 : 52; c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.fill(); });
  const flag = put(S, new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2, 12, 1), std({ map: flagT, side: THREE.DoubleSide })), [-9.2, 14.6, -12]); const fp = flag.geometry.attributes.position; const fx = Float32Array.from(fp.array);
  // trees, bench, bike rack, marquee sign, trash can
  const trees = [tree(S, [-20, -11], 9, 0x4a9a3a, 2), tree(S, [21, -12], 10, 0x5aa83a, 3), tree(S, [-30, -2], 11, 0x3a8a3a, 4), tree(S, [31, -3], 9, 0x4a9a4a, 5), tree(S, [-40, -16], 12, 0x3a7a3a, 6), tree(S, [42, -14], 11, 0x4a8a3a, 7)];
  const wood = M(0x9a6a3a); box(S, [4, 0.2, 1.1], [15, 1.6, -8], wood, { r: 0.04, name: 'bench' }); box(S, [4, 1.0, 0.2], [15, 2.3, -8.6], wood, { r: 0.04, name: 'bench back' }); for (const sx of [-1.7, 1.7]) box(S, [0.2, 1.5, 1], [15 + sx, 0.75, -8], M(0x2a2a2a), { r: 0.03, name: 'bench leg' });
  for (let i = 0; i < 5; i++) put(S, mesh(new THREE.TorusGeometry(0.9, 0.08, 6, 16, Math.PI), M(0x2a6ad8, { metalness: 0.5 })), [19 + i * 1.1, 0, -15], [0, Math.PI / 2, 0]);
  box(S, [6, 3, 0.4], [-14, 3.5, -5], M(0x2a2e36), { r: 0.08, name: 'marquee' }); for (const sx of [-2.4, 2.4]) box(S, [0.3, 2.2, 0.3], [-14 + sx, 1.1, -5], M(0x2a2e36), { r: 0.03, name: 'marquee leg' });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.5), basic(0xffffff, { map: wordTex([['SCIENCE FAIR', 120, 0.33, '#ffd23a'], ['TODAY!', 120, 0.72, '#ffffff']], '#101418', '#fff', { w: 1024, h: 480 }) })), [-14, 3.5, -4.78]);
  put(S, mesh(new THREE.CylinderGeometry(0.6, 0.5, 1.6, 14), M(0x2a7a4a)), [5.5, 0.8, -15]);
  clouds(S, { n: 10, y: [30, 55], seed: 13 });
  return { sun, windows, flag, trees, update(t) { for (let i = 0; i < fp.count; i++) { const x0 = fx[i * 3]; const u = (x0 + 1.8) / 3.6; fp.setZ(i, Math.sin(t * 5 - x0 * 2.2) * 0.25 * u); } fp.needsUpdate = true;
    trees.forEach(tr => tr.sway(t)); hands[1].rotation.z = -t * 0.3; } };
}

export function bathTest(S) {
  S.background = new THREE.Color(0xf4efe0);
  const W = 7, Z0 = -7, Z1 = 10, H = 9;
  box(S, [2 * W, 0.3, Z1 - Z0], [0, -0.15, (Z0 + Z1) / 2], tmat(checkTex(), 4, 5, { roughness: 0.4 }), { r: 0, cast: false, name: 'floor' });
  const tl = tmat(tileTex('#3aa8a0'), 4, 1.3, { roughness: 0.35 }), paint = tmat(stuccoTex('#f8e8a8'), 3, 2);
  box(S, [2 * W, 4.2, 0.4], [0, 2.1, Z0 - 0.2], tl, { r: 0, cast: false, name: 'back wall' }); box(S, [2 * W, H - 4.2, 0.4], [0, 4.2 + (H - 4.2) / 2, Z0 - 0.2], paint, { r: 0, cast: false, name: 'back wall up' });
  for (const sx of [-1, 1]) { box(S, [0.4, 4.2, Z1 - Z0], [sx * (W + 0.2), 2.1, (Z0 + Z1) / 2], tmat(tileTex('#3aa8a0'), 6, 1.3, { roughness: 0.35 }), { r: 0, cast: false, name: 'side wall' }); box(S, [0.4, H - 4.2, Z1 - Z0], [sx * (W + 0.2), 4.2 + (H - 4.2) / 2, (Z0 + Z1) / 2], paint, { r: 0, cast: false, name: 'side wall up' }); }
  box(S, [2 * W, 0.3, 0.3], [0, 4.3, Z0 + 0.05], M(0xffffff), { r: 0.03, cast: false, solid: false });
  box(S, [2 * W, 0.4, Z1 - Z0], [0, H + 0.2, (Z0 + Z1) / 2], M(0xfaf6ec), { r: 0, cast: false, solid: false });
  box(S, [2 * W, H, 0.4], [0, H / 2, Z1 + 0.2], paint, { r: 0, cast: false, solid: false });
  // clawfoot tub
  const enamel = M(0xffffff, { roughness: 0.2 }), gold = M(0xe8b830, { metalness: 0.8, roughness: 0.3 });
  const tub = new THREE.Group(); tub.position.set(-1.5, 0, -5.2); S.add(tub);
  const shp = new THREE.Shape(); shp.absellipse(0, 0, 3.0, 1.4, 0, Math.PI * 2); const hole = new THREE.Path(); hole.absellipse(0, 0, 2.75, 1.15, 0, Math.PI * 2); shp.holes.push(hole);
  const rim = put(tub, mesh(new THREE.ExtrudeGeometry(shp, { depth: 1.7, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 }), std({ color: 0x2a8a9a, roughness: 0.3 })), [0, 2.35, 0], [Math.PI / 2, 0, 0]);
  const inner = put(tub, mesh(new THREE.CylinderGeometry(2.75, 2.75, 1.6, 32), enamel), [0, 1.5, 0]); inner.scale.z = 1.15 / 2.75;
  const water = put(tub, new THREE.Mesh(new THREE.CircleGeometry(2.72, 32), std({ color: 0x8ad0e8, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 })), [0, 2.1, 0], [-Math.PI / 2, 0, 0]); water.scale.y = 1.12 / 2.72;
  for (const [x, z] of [[-2.3, -0.9], [2.3, -0.9], [-2.3, 0.9], [2.3, 0.9]]) put(tub, mesh(new THREE.SphereGeometry(0.28, 10, 8), gold), [x, 0.4, z]);
  box(S, [6.4, 2.4, 3.0], [-1.5, 1.25, -5.2], new THREE.MeshBasicMaterial({ visible: false }), { r: 0, cast: false, name: 'tub' });
  put(tub, mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8), gold), [-2.9, 3.0, -0.9]); put(tub, mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), gold), [-2.6, 3.65, -0.9], [0, 0, Math.PI / 2]);
  const bub = []; const R = rng(3); for (let i = 0; i < 26; i++) { const b = put(tub, mesh(new THREE.IcosahedronGeometry(0.25 + R() * 0.25, 2), foamM(), false), [(R() - 0.5) * 4.6, 2.15, (R() - 0.5) * 1.6]); bub.push(b); }
  const duck = new THREE.Group(); tub.add(duck); duck.position.set(0.9, 2.15, 0.2); put(duck, mesh(new THREE.SphereGeometry(0.3, 14, 10), M(0xffd21a)), [0, 0.15, 0]).scale.set(1.2, 0.8, 1);
  put(duck, mesh(new THREE.SphereGeometry(0.2, 12, 10), M(0xffd21a)), [0, 0.45, 0.2]); put(duck, mesh(new THREE.ConeGeometry(0.08, 0.2, 8), M(0xf27a1a)), [0, 0.42, 0.42], [Math.PI / 2, 0, 0]);
  // sponges on the rim (test subjects)
  const cols = [0xf6cf3a, 0xe8604a, 0x4aa8e8, 0x8ad04a, 0xd85ab8, 0xf29a2a, 0xf6cf3a];
  cols.forEach((c, i) => { const s = put(S, mesh(rb(0.55, 0.32, 0.4, 0.06), std({ map: sponge(), color: c, roughness: 0.95 })), [-3.9 + i * 0.75, 2.62, -3.9]); s.rotation.y = (i % 3 - 1) * 0.15; });
  // sink + mirror right, towels left, window, chart, shelf, bucket of sponges, bath mat, lamp
  box(S, [2.6, 0.4, 1.8], [5.2, 3.2, -6.0], enamel, { r: 0.15, name: 'sink' }); box(S, [0.6, 3.0, 0.6], [5.2, 1.5, -6.2], enamel, { r: 0.1, name: 'sink stand' });
  put(S, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), gold), [5.2, 3.7, -6.6]);
  box(S, [2.4, 2.8, 0.1], [5.2, 6.0, -6.75], std({ color: 0xdde8ee, metalness: 0.9, roughness: 0.08 }), { r: 0.05, cast: false, solid: false }); box(S, [2.7, 3.1, 0.06], [5.2, 6.0, -6.8], gold, { r: 0.05, cast: false, solid: false });
  box(S, [0.15, 0.12, 3], [-6.75, 5.0, 0], gold, { r: 0.03, cast: false, solid: false });
  const towel = std({ map: ctex(64, 128, (c, w, h) => { c.fillStyle = '#e85a5a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; for (let y = 10; y < h; y += 30) c.fillRect(0, y, w, 8); }), roughness: 1 });
  box(S, [0.2, 3.0, 2.4], [-6.7, 3.6, 0], towel, { r: 0.08, cast: false, name: 'towel' });
  box(S, [2.6, 2.0, 0.1], [-4.0, 6.6, -6.85], std({ color: 0xeaf6ff, emissive: 0xdff0ff, emissiveIntensity: 1.2 }), { r: 0, cast: false, solid: false }); box(S, [2.9, 2.3, 0.06], [-4.0, 6.6, -6.9], M(0xffffff), { r: 0, cast: false, solid: false });
  const chartT = ctex(384, 512, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8a81a'; c.fillRect(0, 0, w, 70); c.fillStyle = '#fff'; c.font = '900 38px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('SPONGE TEST', w / 2, 48);
    c.font = '600 26px Inter, sans-serif'; c.textAlign = 'left'; for (let i = 0; i < 10; i++) { c.fillStyle = '#333'; c.fillText('#' + (31 + i), 20, 110 + i * 40); c.fillStyle = i === 9 ? '#2aa84a' : '#d83a2a'; c.fillText(i === 9 ? '✓ WOW!' : '✗', 140, 110 + i * 40); } });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.1), std({ map: chartT })), [1.4, 6.3, -6.98]);
  box(S, [2.4, 0.15, 0.6], [-1.0, 5.0, -6.7], M(0xffffff), { r: 0.03, cast: false, solid: false }); [0xe85a8a, 0x5ab8e8, 0x8ad05a, 0xf2c23a].forEach((c, i) => put(S, mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6 + (i % 2) * 0.2, 12), M(c, { roughness: 0.3 })), [-1.8 + i * 0.5, 5.4, -6.7]));
  const bucket = new THREE.Group(); bucket.position.set(4.6, 0, -2.6); S.add(bucket); put(bucket, mesh(new THREE.CylinderGeometry(0.8, 0.65, 1.3, 18), M(0x2a7ad8)), [0, 0.65, 0]);
  for (let i = 0; i < 6; i++) put(bucket, mesh(rb(0.5, 0.3, 0.36, 0.05), std({ map: sponge(), color: cols[i], roughness: 0.95 })), [Math.cos(i) * 0.35, 1.35 + (i % 2) * 0.15, Math.sin(i) * 0.3], [0.3 * i, i, 0]);
  box(S, [4, 0.06, 2], [-1.2, 0.03, -2.5], std({ color: 0x5ab8b0, roughness: 1 }), { r: 0.02, cast: false, solid: false });
  S.add(new THREE.HemisphereLight(0xfff4e0, 0x5a7a7a, 1.0));
  const win = new THREE.DirectionalLight(0xffe8c0, 2.6); win.position.set(-6, 12, 10); win.target.position.set(-1, 0, -4); win.castShadow = true; win.shadow.mapSize.set(2048, 2048); win.shadow.bias = -0.0005;
  Object.assign(win.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 }); S.add(win, win.target);
  const lamp = new THREE.PointLight(0xffd8a0, 26, 18, 1.5); lamp.position.set(2, 8, 2); S.add(lamp);
  put(S, mesh(new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: 0xfff4d8, emissive: 0xffe0a0, emissiveIntensity: 1.2, side: THREE.DoubleSide }), false), [2, 8.8, 2], [Math.PI, 0, 0]);
  return { water, tub, bub, duck, update(t) { bub.forEach((b, i) => { b.position.y = 2.15 + Math.sin(t * 2 + i) * 0.04; }); duck.rotation.y = Math.sin(t * 0.8) * 0.4; duck.position.y = 2.1 + Math.sin(t * 2.2) * 0.04; } };
}
