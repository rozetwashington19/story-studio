// Episode 014 kit (Cabin Seven): a mountain cable-car town — four new environments + props.
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   alpineVillage(S, { time })  Kell village street (morning): cobbled street along x (free x -18..18, z -8..8), chalet fronts at z = -14
//       (x -30, -16, -2 = POST office with yellow mailbox at (4.6, -10.4), 12, 26), lamps at z -9.5 (x -22, 8, 21), fountain (-24, -3), bench (16, -10),
//       snowy peaks + the cable line across the sky with moving cabins (env.cable).
//   logCabin(S, { time: 'night'|'morning', bed: 'sol'|'mom' })  open-plan log cabin: walls x ±11, back z -9, ceiling 10, front wall z 12.
//       Bed back-left x -10.2..-5.6, z -8.8..-2.6, mattress top 1.9 (sit: sitOn(A, 1.9) at x -7.9; lie: env.lie(A)); nightstand lamp (-4.6, -8.2).
//       Big back window x -2..4.4 (mountain + cable view, moon at night). Kitchen right: dining table top 2.6 at (3.6, -2.2) (x 1.4..5.8, z -3.5..-0.9),
//       counter top 3.0 along the back x 6..11 (front z -7), wood stove (9.4, -2.6) (env.stove light), door + coat hooks on the right wall (x 11, z 3..6).
//       Free floor x -5..6, z 0..10. bed 'sol' = blue quilt + soccer posters/trophies; 'mom' = red quilt + photos + lift map.
//   liftStation(S, { icy, stuck })  the Mount Kell base station (day): concrete hall x ±18, z -16..12, roof y 15; giant horizontal bullwheel at (0, 10, -8) r 6.5
//       turning (env.spin(k)), cabins circling it; console (top 2.6) at x 5.5..12.5, z -2.0..-0.4 — operator stands at (9, -3.4) facing +z (levers env.levers,
//       radio env.radio at (11.4, 2.6, -1.2), red STOP button); Otto's workbench along the left wall (top 3.0, x -17.6..-15.2, z -2..8; thermos + mugs + steam);
//       oil drums, spare wheel, CABIN STATUS board (env.board(n) lights). The line leaves through the open back (z -16) up the slope: cableY(z) = 12 + (-8 - z)·0.24.
//       icy: icicles + frost on the cables near the mouth. stuck: a cabin with tourists stuck at z -46 (env.stuck, swaying).
//   kellValley(S, { time: 'golden'|'night', focus: 'pitch'|'cabin' })  the valley soccer pitch under the cable line + CABIN 7 hanging above it.
//       Pitch x ±30, z -22..2 (centre z -10), goals at x ±30 (mouth z -15..-5, h 6), bleachers + crowd behind (z -32..-26), scoreboard (22, -34),
//       benches front-left. Cable along x at z -10: y = VALLEY.cableY(x) (≈42 at x 0). Cabin 7 interior: VALLEY.cab = { x0: 0, x1: 12, z0: -15, z1: -5, y: 30 }
//       (floor top y 30, glass from y 32.4 to 37.4, roof 38); benches along the side walls (seat top 31.7, x 0.3..1.7 and 10.3..11.7, z -14..-6);
//       writing on the back glass (z -14.85, faces +z, env.write), env.newLine(k) reveals "MOM'S FIRST GOAL!", binoculars env.binos (left bench), radio, scarf, photo.
//       focus 'cabin' moves the sun's shadow box to the cabin. Night: stars, moon, lit village, lantern in the cabin (env.lantern).
//   Props: gondola(S, { num, col, people }) cabin (origin = cable grip; body hangs 4.5 below) · stroller(S, { col }) giant pram (seat top 2.3, solid 'stroller*')
//       · letterStack(S, n) · soccerBall(S) · fan(S, [x,y,z], { col, skin, seed, seated }) cheap blocky crowd person (.update(t, cheer)) · binoMask(S) binocular
//       vignette glued in front of the camera (.update(cam)) · marker(S, col) · mountains(S, { z, n, seed }) · pine(S, [x,z], h) · chalet(S, [x,z], opts).
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
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
const noiseFill = (c, w, h, a = 0.08, n = 3000) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); } };
const cache = {}; const once = (k, f) => cache[k] || (cache[k] = f());
const tmat = (t, rx, ry, o = {}) => { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return std({ map: c, roughness: 0.85, ...o }); };
const basic = (col, o = {}) => new THREE.MeshBasicMaterial({ color: col, ...o });
const M = (col, o = {}) => std({ color: col, roughness: 0.6, ...o });
const rb = (w, h, d, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const clamp01 = x => Math.max(0, Math.min(1, x));
const hx = c => '#' + new THREE.Color(c).getHexString();

// ---------- textures ----------
const logTex = (col = '#9a6438') => once('log' + col, () => ctex(512, 512, (c, w, h) => {
  const n = 8, lh = h / n; for (let i = 0; i < n; i++) { const g = c.createLinearGradient(0, i * lh, 0, (i + 1) * lh);
    g.addColorStop(0, 'rgba(40,20,8,1)'); g.addColorStop(0.12, col); g.addColorStop(0.5, '#c08a58'); g.addColorStop(0.88, col); g.addColorStop(1, 'rgba(40,20,8,1)'); c.fillStyle = g; c.fillRect(0, i * lh, w, lh);
    for (let k = 0; k < 14; k++) { c.strokeStyle = 'rgba(70,35,12,0.25)'; c.lineWidth = 1.5; c.beginPath(); const y = i * lh + 8 + Math.random() * (lh - 16); c.moveTo(0, y); c.bezierCurveTo(w / 3, y + 4, 2 * w / 3, y - 4, w, y); c.stroke(); }
    c.fillStyle = 'rgba(40,20,8,0.5)'; const kx = Math.random() * w; c.beginPath(); c.ellipse(kx, i * lh + lh / 2, 10, 6, 0, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.06);
}));
const cobbleTex = () => once('cob', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#6a625a'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 20; x < w + 40; x += 40) { const k = 120 + Math.random() * 60; c.fillStyle = `rgb(${k},${k - 6},${k - 14})`; c.beginPath(); c.ellipse(x, y + 16, 18, 13, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.ellipse(x - 4, y + 11, 9, 5, 0, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.08); }));
const stoneTex = (col = '#a8a090') => once('st' + col, () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#5a554e'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 48) for (let x = (y / 48 % 2) * 40; x < w + 80; x += 80) { const k = 0.8 + Math.random() * 0.35; const cc = new THREE.Color(col).multiplyScalar(k); c.fillStyle = '#' + cc.getHexString(); c.beginPath(); c.roundRect(x - 36, y + 4, 72 + Math.random() * 6, 40, 10); c.fill(); }
  noiseFill(c, w, h, 0.1); }));
const timberTex = (col = '#e8dcc0', beam = '#5a3418') => once('tb' + col + beam, () => ctex(512, 512, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.05);
  c.fillStyle = beam; c.fillRect(0, 0, w, 22); c.fillRect(0, h - 22, w, 22); for (let x = 0; x < w; x += 128) c.fillRect(x, 0, 20, h);
  c.strokeStyle = beam; c.lineWidth = 16; for (let x = 0; x < w; x += 256) { c.beginPath(); c.moveTo(x + 10, h); c.lineTo(x + 138, 0); c.stroke(); } }));
const shingleTex = (col = '#5a3a2a') => once('sh' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#2a1a12'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 20) for (let x = (y / 20 % 2) * 16; x < w + 32; x += 32) { const k = 0.75 + Math.random() * 0.4; c.fillStyle = '#' + new THREE.Color(col).multiplyScalar(k).getHexString(); c.fillRect(x, y, 30, 18); }
  noiseFill(c, w, h, 0.06, 800); }));
const pitchTex = () => once('pitch', () => ctex(1024, 512, (c, w, h) => { for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#4f9a3a' : '#5aa844'; c.fillRect(i * w / 12, 0, w / 12, h); }
  noiseFill(c, w, h, 0.05, 6000); c.strokeStyle = 'rgba(255,255,255,0.92)'; c.lineWidth = 6; const m = 14; c.strokeRect(m, m, w - 2 * m, h - 2 * m); c.beginPath(); c.moveTo(w / 2, m); c.lineTo(w / 2, h - m); c.stroke();
  c.beginPath(); c.arc(w / 2, h / 2, 70, 0, 7); c.stroke(); c.strokeRect(m, h / 2 - 130, 130, 260); c.strokeRect(w - m - 130, h / 2 - 130, 130, 260); c.strokeRect(m, h / 2 - 60, 50, 120); c.strokeRect(w - m - 50, h / 2 - 60, 50, 120);
  c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, h / 2, 6, 0, 7); c.fill(); }));
const meadowTex = () => once('mead', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#6a9a48'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 90 + Math.random() * 80; c.fillStyle = `rgba(${g * 0.55},${g},${g * 0.35},0.5)`; c.fillRect(Math.random() * w, Math.random() * h, 2, 3 + Math.random() * 4); }
  for (let i = 0; i < 160; i++) { c.fillStyle = ['#f2e85a', '#ffffff', '#e87ab8', '#8ab8f2'][i % 4]; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 2.5, 0, 7); c.fill(); } }));
const quiltTex = (a, b) => once('q' + a + b, () => ctex(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? a : b; c.fillRect(i * 64, j * 64, 64, 64); }
  c.strokeStyle = 'rgba(255,255,255,0.5)'; c.setLineDash([6, 6]); c.lineWidth = 2; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } noiseFill(c, w, h, 0.05, 600); }));
const sign = (text, bg = '#2a4a2a', fg = '#f6eed8', w = 512, h = 128, font = 64) => ctex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = fg; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
  c.fillStyle = fg; c.font = `900 ${font}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 2); });
const planeSign = (S, tex, [w, h], pos, ry = 0) => { const m = put(S, new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ map: tex, roughness: 0.7 })), pos, [0, ry, 0]); return m; };

// ---------- shared scenery ----------
export function pine(S, [x, z], h = 10, col = 0x2a5a32, y = 0) { const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  put(g, mesh(new THREE.CylinderGeometry(0.25 * h / 10, 0.4 * h / 10, h * 0.3, 6), M(0x5a3a22)), [0, h * 0.15, 0]);
  for (let i = 0; i < 3; i++) put(g, mesh(new THREE.ConeGeometry(h * (0.3 - i * 0.07), h * 0.45, 7), std({ color: col, roughness: 0.9, flatShading: true })), [0, h * (0.35 + i * 0.2), 0]);
  return g; }
export function mountains(S, { z = -230, n = 9, seed = 3, x = 340, h = [70, 150], snow = 0xf6f8ff, rock = 0x6a7488, night = false } = {}) { const R = rng(seed);
  const rockM = std({ color: night ? 0x2a3248 : rock, roughness: 1, flatShading: true }), snowM = std({ color: night ? 0x9aa8c8 : snow, roughness: 0.8, flatShading: true, emissive: night ? 0x1a2238 : 0x000000 });
  for (let i = 0; i < n; i++) { const H = h[0] + R() * (h[1] - h[0]), r = H * (0.7 + R() * 0.3), px = -x + (2 * x) * (i + R() * 0.6) / n, pz = z - R() * 60;
    const g = new THREE.Group(); g.position.set(px, -2, pz); g.rotation.y = R() * 3; S.add(g);
    put(g, mesh(new THREE.ConeGeometry(r, H, 7, 1), rockM, false), [0, H / 2, 0]);
    put(g, mesh(new THREE.ConeGeometry(r * 0.34, H * 0.34 + 0.4, 7, 1), snowM, false), [0, H - H * 0.17 + 0.2, 0]); }
}
export function chalet(S, [x, z], { w = 12, d = 10, h1 = 5, h2 = 5, wall = '#e8dcc0', beam = '#5a3418', roof = '#5a3a2a', shutter = 0x2a7a4a, ry = 0, balcony = true, lit = 0, door = 0x7a4a22, name = 'chalet' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry * D; S.add(g);
  const base = put(g, mesh(new THREE.BoxGeometry(w, h1, d), tmat(stoneTex(), w / 6, h1 / 4)), [0, h1 / 2, -d / 2]);
  put(g, mesh(new THREE.BoxGeometry(w, h2, d), tmat(timberTex(wall, beam), w / 8, 1)), [0, h1 + h2 / 2, -d / 2]);
  // gable roof along x, ridge over the middle, overhangs
  const rh = 4.5, ov = 1.6, sl = Math.hypot(d / 2 + ov, rh), ang = Math.atan2(rh, d / 2 + ov), rm = tmat(shingleTex(roof), w / 3, sl / 3);
  for (const s of [-1, 1]) put(g, mesh(new THREE.BoxGeometry(w + 2 * ov, 0.35, sl), rm), [0, h1 + h2 + rh / 2, -d / 2 + s * (d / 2 + ov) / 2], [s * ang, 0, 0]);
  const gab = new THREE.Shape(); gab.moveTo(-d / 2, 0); gab.lineTo(d / 2, 0); gab.lineTo(0, rh); gab.closePath();
  for (const s of [-1, 1]) put(g, mesh(new THREE.ShapeGeometry(gab), M(new THREE.Color(wall).getHex(), { side: THREE.DoubleSide })), [s * w / 2 * 1.001, h1 + h2, -d / 2], [0, Math.PI / 2, 0]);
  const glass = lit ? std({ color: 0xffd08a, emissive: 0xffb050, emissiveIntensity: 0.9 * lit }) : std({ color: 0x3a5068, roughness: 0.15, metalness: 0.4 });
  const sh = M(shutter);
  const win = (wx, wy) => { put(g, mesh(rb(1.8, 2.2, 0.2, 0.05), glass, false), [wx, wy, 0.05]); put(g, mesh(rb(2.2, 0.3, 0.5, 0.05), M(0xeeeae0), false), [wx, wy - 1.2, 0.2]);
    for (const s of [-1, 1]) put(g, mesh(rb(0.9, 2.3, 0.12, 0.04), sh, false), [wx + s * 1.45, wy, 0.1]);
    put(g, mesh(rb(2.0, 0.45, 0.6, 0.08), M(0x7a4a22), false), [wx, wy - 1.55, 0.4]);
    const R = rng(Math.round(wx * 7 + wy)); for (let i = 0; i < 6; i++) put(g, mesh(new THREE.SphereGeometry(0.22, 8, 6), M([0xe8302a, 0xf2c420, 0xf27ab8, 0xffffff][i % 4])), [wx - 0.8 + i * 0.32, wy - 1.2 + R() * 0.15, 0.45]); };
  for (const wx of [-w / 3, w / 3]) win(wx, h1 * 0.55);
  for (const wx of [-w / 3, 0, w / 3]) win(wx, h1 + h2 * 0.5);
  put(g, mesh(rb(2.4, 3.8, 0.3, 0.1), M(door)), [0, 1.9, 0.1]); put(g, mesh(new THREE.SphereGeometry(0.12, 8, 6), M(0xd8b04a, { metalness: 0.8 })), [0.8, 1.9, 0.3]);
  if (balcony) { put(g, mesh(new THREE.BoxGeometry(w * 0.8, 0.3, 1.6), M(0x6a4020)), [0, h1 + 0.3, 0.8]);
    for (let i = 0; i <= 12; i++) put(g, mesh(new THREE.BoxGeometry(0.22, 1.4, 0.12), M(0x7a4a22)), [-w * 0.4 + i * w * 0.8 / 12, h1 + 1.1, 1.55]);
    put(g, mesh(new THREE.BoxGeometry(w * 0.8, 0.2, 0.2), M(0x5a3418)), [0, h1 + 1.85, 1.55]); }
  box(S, [w, h1 + h2, d], [x, (h1 + h2) / 2, z - d / 2], basic(0, { visible: false }), { r: 0, cast: false, name });
  return g;
}
export function gondola(S, { num = 1, col = 0xd8302a, people = 0, s = 1, seed = 1 } = {}) {
  const g = new THREE.Group(); S.add(g); const b = new THREE.Group(); b.scale.setScalar(s); g.add(b);
  const steel = M(0x8a8e96, { metalness: 0.7, roughness: 0.35 });
  put(b, mesh(new THREE.BoxGeometry(0.8, 0.5, 1.1), steel), [0, -0.2, 0]); put(b, mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.0, 8), steel), [0, -1.8, 0]);
  put(b, mesh(new THREE.BoxGeometry(2.6, 0.18, 0.18), steel), [0, -3.2, 0]);
  const body = M(col, { roughness: 0.35, metalness: 0.2 });
  put(b, mesh(rb(3.6, 1.6, 3.4, 0.3), body), [0, -7.3, 0]); put(b, mesh(rb(3.8, 0.5, 3.6, 0.2), body), [0, -3.7, 0]);
  put(b, mesh(new THREE.BoxGeometry(3.5, 2.2, 3.3), std({ color: 0x1e2a38, roughness: 0.08, metalness: 0.6 })), [0, -5.3, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(b, mesh(new THREE.BoxGeometry(0.2, 2.3, 0.2), body), [sx * 1.7, -5.3, sz * 1.6]);
  const nt = ctex(128, 128, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 56, 0, 7); c.fill(); c.fillStyle = '#1a1a1e'; c.font = '900 84px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(num), 64, 70); });
  for (const sz of [-1, 1]) put(b, new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), std({ map: nt })), [0, -7.3, sz * 1.72], [0, sz < 0 ? Math.PI : 0, 0]);
  const R = rng(seed); for (let i = 0; i < people; i++) { const p = new THREE.Group(); put(b, p, [-1.0 + i * 0.9, -6.0, (R() - 0.5) * 1.2]);
    put(p, mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), M([0xf2c8a0, 0xc88a5a, 0x8a5a3a, 0xffd8b8][i % 4])), [0, 0.5, 0]); put(p, mesh(new THREE.BoxGeometry(0.75, 0.9, 0.5), M([0x3a6ae8, 0xf27a1a, 0x8a3ab8, 0x2aa84a][(i + seed) % 4])), [0, -0.3, 0]); }
  g.userData.body = b; return g;
}
export function stroller(S, { col = 0x5ab8e8, name = 'stroller' } = {}) {
  const g = new THREE.Group(); S.add(g); const m = M(col, { roughness: 0.5 }), dark = M(0x2a2a2e), chrome = M(0xd8dce4, { metalness: 0.9, roughness: 0.2 });
  put(g, mesh(rb(4.4, 1.6, 4.0, 0.5), m), [0, 1.9, 0]);                       // basket
  put(g, mesh(rb(4.0, 0.4, 3.4, 0.2), M(0xfaf6ec)), [0, 2.55, 0.1]);          // cushion edge
  const hood = put(g, mesh(new THREE.SphereGeometry(1.9, 20, 12, 0, Math.PI, 0, Math.PI / 2), M(col, { side: THREE.DoubleSide })), [0, 2.7, -1.9], [0, Math.PI / 2, -Math.PI / 2 * 0]);
  hood.rotation.set(-Math.PI / 2, 0, 0); hood.scale.set(1, 1, 0.9);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { put(g, mesh(new THREE.TorusGeometry(0.75, 0.18, 8, 20), dark), [sx * 2.1, 0.8, sz * 1.5], [0, Math.PI / 2, 0]); put(g, mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 10), chrome), [sx * 2.1, 0.8, sz * 1.5], [0, 0, Math.PI / 2]); }
  for (const sx of [-1, 1]) put(g, mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 8), chrome), [sx * 2.0, 2.6, -2.9], [0.55, 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.2, 10), dark), [0, 4.0, -3.8], [0, 0, Math.PI / 2]);
  box(g, [4.4, 1.6, 4.0], [0, 1.9, 0], basic(0, { visible: false }), { r: 0, cast: false, name });
  return g;
}
export function letterStack(S, n = 12, seed = 4) { const g = new THREE.Group(); S.add(g); const R = rng(seed);
  const env = std({ map: ctex(64, 40, (c, w, h) => { c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c8c0b0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w / 2, h / 2); c.lineTo(w, 0); c.stroke(); c.fillStyle = '#d8302a'; c.fillRect(w - 14, 4, 10, 10); }) });
  for (let i = 0; i < n; i++) { const l = put(g, mesh(new THREE.BoxGeometry(1.1, 0.09, 0.7), env), [(R() - 0.5) * 0.25, i * 0.1, (R() - 0.5) * 0.2]); l.rotation.y = (R() - 0.5) * 0.5; }
  return g; }
export function soccerBall(S, r = 0.55) { const t = ctex(256, 128, (c, w, h) => { c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1e';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { const x = i * 32 + (j % 2) * 16, y = 20 + j * 42; c.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); } c.fill(); } });
  return put(S, mesh(new THREE.SphereGeometry(r, 20, 14), std({ map: t, roughness: 0.5 })), [0, r, 0]); }
export function marker(S, col = 0x2a6ae8) { const g = new THREE.Group(); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 10), M(0xf6f6f2)), [0, 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 10), M(col)), [0, 0.42, 0]); put(g, mesh(new THREE.ConeGeometry(0.06, 0.15, 8), M(col)), [0, -0.42, 0], [Math.PI, 0, 0]); return g; }
// cheap blocky crowd person (background only): body, head, arms; seated = legs folded
export function fan(S, [x, y, z], { col = 0x2a8a4a, skin, seed = 1, seated = true, hat } = {}) { const R = rng(seed);
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g); const sk = skin ?? [0xf2c8a0, 0xc88a5a, 0x8a5a3a, 0xffd8b8, 0xe8b888][Math.floor(R() * 5)];
  const torso = put(g, mesh(rb(1.6, 1.8, 0.9, 0.12), M(col)), [0, seated ? 1.5 : 3.0, 0]);
  const head = put(g, mesh(rb(1.1, 1.1, 1.1, 0.3), M(sk)), [0, seated ? 3.0 : 4.5, 0]);
  const eye = basic(0x1a1a1e); for (const s of [-1, 1]) put(head, new THREE.Mesh(new THREE.CircleGeometry(0.08, 8), eye), [s * 0.2, 0.08, 0.56]);
  put(head, new THREE.Mesh(new THREE.CircleGeometry(0.16, 12, Math.PI, Math.PI), eye), [0, -0.15, 0.56]);
  if (hat ?? R() < 0.4) put(head, mesh(new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M([0xd8302a, 0xf2c420, 0x2a6ae8, 0xffffff][Math.floor(R() * 4)])), [0, 0.3, 0]);
  else put(head, mesh(new THREE.BoxGeometry(1.15, 0.35, 1.15), M([0x2a1a10, 0x8a5a2a, 0xe8c060, 0x1a1a1a][Math.floor(R() * 4)])), [0, 0.45, -0.02]);
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); put(torso, a, [s * 0.95, 0.7, 0]); put(a, mesh(rb(0.45, 1.5, 0.45, 0.1), M(col)), [0, -0.7, 0]); return a; });
  if (!seated) for (const s of [-1, 1]) put(g, mesh(rb(0.7, 2.0, 0.7, 0.1), M(0x2a2a3a)), [s * 0.4, 1.0, 0]);
  else for (const s of [-1, 1]) put(g, mesh(rb(0.7, 0.6, 1.6, 0.1), M(0x2a2a3a)), [s * 0.4, 0.5, 0.5]);
  const ph = R() * 6;
  g.update = (t, cheer = 0) => { const c = cheer * (0.7 + 0.3 * Math.sin(ph)); arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (0.15 + c * 2.6) + Math.sin(t * 9 + ph + i) * 0.25 * c; });
    g.position.y = y + Math.abs(Math.sin(t * 7 + ph)) * 0.35 * c; head.rotation.y = Math.sin(t * 0.6 + ph) * 0.25 * (1 - c); };
  return g;
}
// binocular vignette glued in front of the camera: call .update(cam) after camPath
export function binoMask(S) { const t = ctex(512, 910, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-out';
    for (const s of [-1, 1]) { const g = c.createRadialGradient(w / 2 + s * 105, h / 2, 120, w / 2 + s * 105, h / 2, 200); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(w / 2 + s * 105, h / 2, 200, 0, 7); c.fill(); } });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 999; m.frustumCulled = false; S.add(m);
  m.update = (cam) => { const d = 0.5, hh = 2 * d * Math.tan(cam.fov * D / 2), ww = hh * cam.aspect; m.scale.set(ww * 1.02, hh * 1.02, 1); m.position.copy(cam.position).add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(d)); m.quaternion.copy(cam.quaternion); };
  return m; }

// ---------- alpine village street ----------
export function alpineVillage(S, { time = 'morning' } = {}) {
  S.background = T.sky('#4a86d8', '#cfe4f6'); S.fog = new THREE.Fog(0xd8e6f2, 90, 420);
  box(S, [260, 0.3, 60], [0, -0.15, 0], tmat(cobbleTex(), 40, 9, { roughness: 0.9 }), { r: 0, cast: false, name: 'street' });
  box(S, [260, 0.3, 5], [0, 0.02, -11.5], tmat(stoneTex('#c8c0b0'), 60, 1.2), { r: 0, cast: false, solid: false, name: 'sidewalk' });
  box(S, [600, 0.3, 500], [0, -0.3, -280], tmat(meadowTex(), 60, 50), { r: 0, cast: false, solid: false });
  const cols = [['#f2e6c8', '#5a3418', 0x2a7a4a], ['#f6d8c8', '#4a2a14', 0xc8302a], ['#fff2a8', '#5a3418', 0x2a5ab8], ['#e8f0f6', '#3a2412', 0x2a7a4a], ['#f2dcb8', '#5a3418', 0xb8302a]];
  [-30, -16, -2, 12, 26].forEach((x, i) => chalet(S, [x, -14], { wall: cols[i][0], beam: cols[i][1], shutter: cols[i][2], h2: 4.6 + (i % 2) * 1.2, roof: i % 2 ? '#6a4a3a' : '#4a3a3a', name: 'chalet' + i }));
  [-44, 40, 54].forEach((x, i) => chalet(S, [x, -16 - i * 2], { wall: cols[(i + 2) % 5][0], shutter: cols[i][2], name: 'chaletB' + i }));
  planeSign(S, sign('POST', '#f2c420', '#1a1a1e', 256, 96, 64), [3.2, 1.2], [-2, 5.6, -13.75]);
  planeSign(S, sign('BÄCKEREI KELL', '#5a3418', '#f6eed8', 512, 96, 52), [5, 0.95], [12, 5.6, -13.75]);
  // yellow mailbox, lamps, bench, fountain, flower tubs, cart of letters
  const mb = new THREE.Group(); mb.position.set(4.6, 0, -10.4); S.add(mb); put(mb, mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8), M(0x2a2a2a)), [0, 1.2, 0]);
  put(mb, mesh(rb(1.3, 1.5, 0.9, 0.2), M(0xf2c420)), [0, 3.0, 0]); put(mb, mesh(new THREE.BoxGeometry(0.8, 0.1, 0.1), M(0x1a1a1a)), [0, 3.4, 0.46]);
  box(S, [1.3, 3.8, 0.9], [4.6, 1.9, -10.4], basic(0, { visible: false }), { r: 0, cast: false, name: 'mailbox' });
  const lamps = [];
  for (const x of [-22, 8, 21]) { put(S, mesh(new THREE.CylinderGeometry(0.15, 0.22, 7, 8), M(0x2a2e2a, { metalness: 0.5 })), [x, 3.5, -9.5]);
    put(S, mesh(rb(0.9, 1.1, 0.9, 0.1), std({ color: 0xfff2c8, emissive: 0xffd890, emissiveIntensity: 0.4 })), [x, 7.4, -9.5]); put(S, mesh(new THREE.ConeGeometry(0.8, 0.5, 4), M(0x2a2e2a)), [x, 8.2, -9.5], [0, Math.PI / 4, 0]); }
  box(S, [4.4, 0.3, 1.2], [16, 1.6, -10.2], M(0x7a4a22), { r: 0.05, name: 'bench' }); box(S, [4.4, 1.2, 0.2], [16, 2.4, -10.8], M(0x7a4a22), { r: 0.05, name: 'bench back' });
  for (const s of [-1, 1]) box(S, [0.2, 1.5, 1.0], [16 + s * 2, 0.75, -10.2], M(0x2a2a2a), { r: 0.03, name: 'bench leg' });
  const fnt = new THREE.Group(); fnt.position.set(-24, 0, -3); S.add(fnt); put(fnt, mesh(new THREE.CylinderGeometry(3.0, 3.2, 1.4, 20), tmat(stoneTex('#b8b0a0'), 4, 1)), [0, 0.7, 0]);
  const water = put(fnt, mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.1, 24), std({ color: 0x5aa0c8, roughness: 0.1, metalness: 0.3 }), false), [0, 1.3, 0]);
  put(fnt, mesh(new THREE.CylinderGeometry(0.4, 0.6, 3.6, 10), tmat(stoneTex('#b8b0a0'), 1, 1)), [0, 2.4, 0]); put(fnt, mesh(new THREE.SphereGeometry(0.9, 14, 10), M(0xc8c0b0)), [0, 4.4, 0]);
  const jets = []; for (let i = 0; i < 4; i++) jets.push(put(fnt, mesh(new THREE.SphereGeometry(0.12, 6, 4), std({ color: 0xcfe8ff, roughness: 0.1, transparent: true, opacity: 0.8 }), false), [0, 4, 0]));
  box(S, [6.2, 1.4, 6.2], [-24, 0.7, -3], basic(0, { visible: false }), { r: 0, cast: false, name: 'fountain' });
  for (const [x, z] of [[-9.5, -10.8], [10, -10.8], [-35, -10.5], [24, -10.8]]) { put(S, mesh(new THREE.CylinderGeometry(0.9, 0.7, 1.2, 12), M(0x8a5a3a)), [x, 0.6, z]); for (let i = 0; i < 7; i++) put(S, mesh(new THREE.SphereGeometry(0.35, 8, 6), M([0xe8302a, 0xf2c420, 0xf27ab8, 0xffffff, 0x8a3ab8][i % 5])), [x + Math.cos(i) * 0.5, 1.4 + (i % 2) * 0.2, z + Math.sin(i) * 0.5]); }
  // bunting across the street, high
  const bunt = []; for (let i = 0; i < 26; i++) { const f = put(S, mesh(new THREE.ConeGeometry(0.4, 0.9, 3), M([0xd8302a, 0xfafafa, 0x2a7a4a][i % 3], { side: THREE.DoubleSide }), false), [-26 + i * 2.1, 11.2 - Math.sin(i / 25 * Math.PI) * 1.4, -12.6], [Math.PI, 0, 0]); f.scale.z = 0.2; bunt.push(f); }
  for (let i = 0; i < 30; i++) { const R = rng(i + 3); pine(S, [-130 + i * 9 + R() * 4, -40 - R() * 40], 12 + R() * 10); }
  mountains(S, { z: -230, seed: 5 }); mountains(S, { z: -330, n: 7, seed: 9, h: [120, 190], rock: 0x7a86a0 });
  clouds(S, { y: [60, 110], z: [-160, -280], x: 260, size: 3 });
  // the cable line crossing the sky
  const A = new THREE.Vector3(-260, 40, -110), B = new THREE.Vector3(260, 120, -150), cable = new THREE.Group(); S.add(cable);
  for (const dz of [-0.6, 0.6]) { const c = mesh(new THREE.CylinderGeometry(0.12, 0.12, A.distanceTo(B), 6), M(0x2a2a2e), false); c.position.copy(A).add(B).multiplyScalar(0.5); c.position.z += dz; c.lookAt(B.x, B.y, B.z + dz); c.rotateX(Math.PI / 2); cable.add(c); }
  const cabs = [0, 1, 2, 3, 4].map(i => { const gg = gondola(S, { num: i * 2 + 3, col: i % 2 ? 0xd8302a : 0xf2c420, s: 1.6 }); return gg; });
  const sun = new THREE.DirectionalLight(0xffe2b8, 3.4); sun.position.set(30, 40, 30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 30, bottom: -30, near: 1, far: 140 }); sun.target.position.set(0, 0, -6); S.add(sun, sun.target);
  S.add(new THREE.HemisphereLight(0xcfe0ff, 0x6a5a40, 0.95));
  const fillL = new THREE.DirectionalLight(0xa8c0ff, 0.5); fillL.position.set(-20, 10, 20); S.add(fillL);
  return { cable, cabs, update(t) { cabs.forEach((c, i) => { const u = ((t * 0.012 + i / 5) % 1); c.position.lerpVectors(A, B, u); c.userData.body.rotation.x = Math.sin(t * 1.3 + i) * 0.03; });
    water.position.y = 1.3 + Math.sin(t * 3) * 0.02; jets.forEach((j, i) => { const u = ((t * 0.8 + i / 4) % 1); const a = i / 4 * Math.PI * 2; j.position.set(Math.cos(a) * u * 2.2, 4.3 + u * 1.2 - u * u * 4, Math.sin(a) * u * 2.2); });
    bunt.forEach((f, i) => { f.rotation.x = Math.PI + Math.sin(t * 3 + i) * 0.25; }); } };
}

// ---------- log cabin (home) ----------
export function logCabin(S, { time = 'night', bed = 'sol' } = {}) {
  const night = time === 'night'; const W = 11, Z0 = -9, Z1 = 12, H = 10;
  S.background = new THREE.Color(night ? 0x0a0e1a : 0xcfe4f6);
  box(S, [2 * W, 0.3, Z1 - Z0], [0, -0.15, (Z0 + Z1) / 2], tmat(T.planks(0x9a6a40), 4, 4, { roughness: 0.7 }), { r: 0, cast: false, name: 'floor' });
  const logs = tmat(logTex(), 3, 1.25);
  // back wall with a window hole x -2..4.4, y 2.8..8.2
  const wx0 = -2, wx1 = 4.4, wy0 = 2.8, wy1 = 8.2;
  box(S, [wx0 + W, H, 0.6], [(-W + wx0) / 2, H / 2, Z0 - 0.3], tmat(logTex(), 1.8, 1.25), { r: 0, cast: false, name: 'back wall L' });
  box(S, [W - wx1, H, 0.6], [(W + wx1) / 2, H / 2, Z0 - 0.3], tmat(logTex(), 1.1, 1.25), { r: 0, cast: false, name: 'back wall R' });
  box(S, [wx1 - wx0, wy0, 0.6], [(wx0 + wx1) / 2, wy0 / 2, Z0 - 0.3], tmat(logTex(), 0.8, 0.35), { r: 0, cast: false, name: 'back wall sill' });
  box(S, [wx1 - wx0, H - wy1, 0.6], [(wx0 + wx1) / 2, (H + wy1) / 2, Z0 - 0.3], tmat(logTex(), 0.8, 0.2), { r: 0, cast: false, name: 'back wall top' });
  const frameM = M(0xf2eee0); box(S, [wx1 - wx0 + 0.4, 0.3, 0.9], [(wx0 + wx1) / 2, wy0 - 0.1, Z0 + 0.1], frameM, { r: 0.05, cast: false, solid: false });
  box(S, [wx1 - wx0 + 0.4, 0.25, 0.7], [(wx0 + wx1) / 2, wy1, Z0 - 0.2], frameM, { r: 0.05, cast: false, solid: false });
  box(S, [0.2, wy1 - wy0, 0.3], [(wx0 + wx1) / 2, (wy0 + wy1) / 2, Z0 - 0.3], frameM, { r: 0, cast: false, solid: false });
  box(S, [wx1 - wx0, 0.2, 0.3], [(wx0 + wx1) / 2, (wy0 + wy1) / 2, Z0 - 0.3], frameM, { r: 0, cast: false, solid: false });
  // the view: painted mountains + cable line + tiny cabins, moon at night
  const view = ctex(1024, 768, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); if (night) { g.addColorStop(0, '#0a1030'); g.addColorStop(1, '#2a3a6a'); } else { g.addColorStop(0, '#6a9ae0'); g.addColorStop(1, '#f6d8c0'); }
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (night) { for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; c.fillRect(Math.random() * w, Math.random() * h * 0.6, 2, 2); } c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(760, 150, 46, 0, 7); c.fill(); }
    const peaks = (col, snow, base, amp, seed) => { const R = rng(seed); c.fillStyle = col; c.beginPath(); c.moveTo(0, h); let x = 0; const pts = []; while (x <= w + 100) { const y = base - R() * amp; pts.push([x, y]); x += 110 + R() * 90; } pts.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(w, h); c.fill();
      c.fillStyle = snow; pts.forEach(([x, y], i) => { if (i % 2 === 0 && base - y > amp * 0.45) { c.beginPath(); c.moveTo(x - 40, y + 50); c.lineTo(x, y); c.lineTo(x + 40, y + 50); c.fill(); } }); };
    peaks(night ? '#1a2440' : '#8a9ab8', night ? '#8a98c0' : '#ffffff', 420, 260, 3); peaks(night ? '#121a30' : '#5a7a6a', night ? '#6a78a0' : '#e8f0f6', 560, 160, 8);
    c.fillStyle = night ? '#0a1420' : '#3a5a3a'; for (let x = 0; x < w; x += 22) { const hh = 40 + Math.random() * 40; c.beginPath(); c.moveTo(x, h - 60); c.lineTo(x + 11, h - 60 - hh); c.lineTo(x + 22, h - 60); c.fill(); } c.fillRect(0, h - 62, w, 62);
    c.strokeStyle = night ? '#4a5070' : '#2a2a2e'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 520); c.lineTo(w, 120); c.stroke();
    for (const u of [0.2, 0.55, 0.85]) { const x = u * w, y = 520 - u * 400; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 26); c.stroke(); c.fillStyle = night ? '#ffd890' : '#d8302a'; c.fillRect(x - 13, y + 26, 26, 22); }
    if (night) { c.fillStyle = '#ffd890'; for (let i = 0; i < 40; i++) c.fillRect(Math.random() * w, h - 50 - Math.random() * 20, 4, 4); } });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(26, 19.5), basic(0xffffff, { map: view, fog: false })), [1.2, 6, Z0 - 7]);
  for (const sx of [-1, 1]) box(S, [0.6, H, Z1 - Z0], [sx * (W + 0.3), H / 2, (Z0 + Z1) / 2], tmat(logTex(), 4, 1.25), { r: 0, cast: false, name: 'side wall' });
  box(S, [2 * W, H, 0.6], [0, H / 2, Z1 + 0.3], tmat(logTex(), 4, 1.25), { r: 0, cast: false, solid: false, name: 'front wall' });
  box(S, [2 * W + 1, 0.4, Z1 - Z0 + 1], [0, H + 0.2, (Z0 + Z1) / 2], tmat(T.planks(0x7a5030), 4, 4), { r: 0, cast: false, solid: false });
  for (let z = Z0 + 2; z < Z1; z += 5) box(S, [2 * W, 0.8, 0.8], [0, H - 0.4, z], M(0x5a3418), { r: 0.1, cast: false, solid: false });
  // bed (back-left)
  const quilt = bed === 'mom' ? quiltTex('#c8302a', '#e8a8a0') : quiltTex('#2a5ab8', '#8ab0e8');
  box(S, [4.6, 1.0, 6.2], [-7.9, 0.9, -5.7], M(0x6a4020), { r: 0.08, name: 'bed frame' });
  box(S, [4.4, 0.6, 6.0], [-7.9, 1.6, -5.7], M(0xf6f2e8), { r: 0.15, cast: false, solid: false, name: 'mattress' });
  const blanket = box(S, [4.6, 0.3, 4.0], [-7.9, 2.0, -4.6], std({ map: quilt, roughness: 1 }), { r: 0.12, cast: false, solid: false, name: 'quilt' });
  box(S, [3.0, 0.6, 1.3], [-7.9, 2.15, -8.0], M(0xffffff), { r: 0.25, cast: false, solid: false, name: 'pillow' });
  box(S, [4.8, 3.6, 0.4], [-7.9, 1.8, -8.85], M(0x5a3418), { r: 0.1, name: 'headboard' });
  box(S, [1.6, 2.0, 1.6], [-4.6, 1.0, -8.0], M(0x7a4a22), { r: 0.08, name: 'nightstand' });
  put(S, mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.0, 10), M(0x3a6a8a)), [-4.6, 2.5, -8.0]);
  put(S, mesh(new THREE.CylinderGeometry(0.4, 0.65, 0.8, 14, 1, true), std({ color: 0xfff0d0, emissive: 0xffd090, emissiveIntensity: night ? 0.9 : 0.2, side: THREE.DoubleSide }), false), [-4.6, 3.3, -8.0]);
  // wall decor by bed owner (left wall x -10.98 faces +x; back wall above bed z -8.98)
  const deco = (tex, [w, h], pos, ry) => put(S, new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ map: tex, roughness: 0.8 })), pos, [0, ry, 0]);
  if (bed === 'sol') {
    deco(ctex(256, 360, (c, w, h) => { c.fillStyle = '#2a8a4a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 200px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('7', w / 2, 230); c.font = '900 36px Inter, sans-serif'; c.fillText('KELL FC', w / 2, 320); }), [2.4, 3.4], [-10.68, 6.0, -5.8], Math.PI / 2);
    deco(ctex(512, 160, (c, w, h) => { c.fillStyle = '#2a8a4a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h / 2); c.lineTo(0, h); c.fill(); c.fillStyle = '#fff'; c.font = '900 64px Inter, sans-serif'; c.fillText('KELL FC', 30, h / 2 + 22); }), [4.4, 1.4], [-10.68, 6.5, -1.6], Math.PI / 2);
    box(S, [4.2, 0.2, 1.0], [-7.9, 6.0, -8.5], M(0x6a4020), { r: 0.03, cast: false, solid: false });
    for (let i = 0; i < 3; i++) { const tg = new THREE.Group(); tg.position.set(-9.3 + i * 1.3, 6.1, -8.5); S.add(tg); const gold = M(0xe8b830, { metalness: 0.8, roughness: 0.3 });
      put(tg, mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), M(0x3a2a1a)), [0, 0.15, 0]); put(tg, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5 + i * 0.15, 6), gold), [0, 0.5, 0]); put(tg, mesh(new THREE.CylinderGeometry(0.32, 0.12, 0.5, 12), gold), [0, 0.95 + i * 0.08, 0]); }
    const ball = soccerBall(S, 0.6); ball.position.set(-4.2, 0.6, -1.2);
    deco(ctex(400, 300, (c, w, h) => { c.fillStyle = '#e8eef2'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1e'; c.font = '900 44px Inter, sans-serif'; c.fillText('FINAL', 30, 70); c.font = '700 34px Inter, sans-serif'; c.fillText('SATURDAY · 2 PM', 30, 130); c.fillStyle = '#d8302a'; c.font = '900 60px Inter, sans-serif'; c.fillText('★ ★ ★', 30, 230); }), [2.4, 1.8], [-10.68, 4.4, -2.0], Math.PI / 2);
  } else {
    for (let i = 0; i < 4; i++) { const f = new THREE.Group(); f.position.set(-10.7, 5.2 + (i % 2) * 2.2, -7.2 + Math.floor(i / 2) * 2.6 + (i % 2) * 0.4); f.rotation.y = Math.PI / 2; S.add(f);
      put(f, mesh(new THREE.BoxGeometry(1.7, 1.4, 0.12), M(0x3a2a1a)), [0, 0, 0]);
      put(f, new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), std({ map: ctex(140, 110, (c, w, h) => { c.fillStyle = ['#8ab0e8', '#f2c8a0', '#a8d8a0', '#f2e0a0'][i]; c.fillRect(0, 0, w, h); c.fillStyle = '#c88a5a'; c.beginPath(); c.arc(w / 2, h * 0.45, 20 + i * 3, 0, 7); c.fill(); c.fillStyle = '#2a8a4a'; c.fillRect(w / 2 - 26, h * 0.62, 52, 60); }) })), [0, 0, 0.07]); }
    deco(ctex(512, 360, (c, w, h) => { c.fillStyle = '#f2ead6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1a1a1e'; c.lineWidth = 4; c.beginPath(); c.moveTo(40, 320); c.lineTo(470, 60); c.stroke();
      c.fillStyle = '#d8302a'; [0.15, 0.35, 0.55, 0.75].forEach((u, i) => { c.fillRect(40 + u * 430 - 10, 320 - u * 260 + 6, 20, 16); }); c.fillStyle = '#1a1a1e'; c.font = '900 40px Inter, sans-serif'; c.fillText('MT. KELL LIFT', 40, 50); }), [3.6, 2.5], [-10.68, 6.2, -2.4], Math.PI / 2);
    const hook2 = put(S, mesh(new THREE.BoxGeometry(0.15, 0.15, 0.6), M(0x2a2a2a)), [-6.0, 6.8, -8.7]);
    put(S, mesh(rb(1.6, 1.0, 0.8, 0.15), M(0x5a6a5a)), [-4.6, 2.5 + 0.0, -7.2]).visible = false;
  }
  // kitchen right: table, chairs, counter, stove, door, coat hooks
  const wood = M(0x8a5a30, { roughness: 0.7 });
  box(S, [4.4, 0.25, 2.6], [3.6, 2.5, -2.2], wood, { r: 0.05, name: 'table' });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(S, [0.25, 2.4, 0.25], [3.6 + sx * 1.9, 1.2, -2.2 + sz * 1.0], wood, { r: 0.03, name: 'table leg' });
  const chair = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g); put(g, mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), wood), [0, 1.6, 0]); put(g, mesh(new THREE.BoxGeometry(1.6, 2.0, 0.2), wood), [0, 2.6, -0.75]); for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(g, mesh(new THREE.BoxGeometry(0.18, 1.6, 0.18), wood), [sx * 0.65, 0.8, sz * 0.65]); };
  chair(3.6, -4.6, 0); chair(6.9, -2.2, -Math.PI / 2);
  const mug = (x, z, c) => { put(S, mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.45, 12), M(c)), [x, 2.85, z]); };
  mug(2.6, -2.6, 0xd8302a); mug(4.2, -1.8, 0x2a8a4a);
  put(S, mesh(new THREE.CylinderGeometry(0.6, 0.5, 0.25, 14), M(0xf2ead6)), [3.8, 2.75, -2.6]); for (let i = 0; i < 3; i++) put(S, mesh(new THREE.SphereGeometry(0.22, 8, 6), M([0xe8302a, 0xf2a020, 0x8ac83a][i])), [3.6 + i * 0.25, 2.95, -2.6]);
  box(S, [5.0, 3.0, 1.8], [8.5, 1.5, -7.9], tmat(T.planks(0x6a8aa0), 1, 1), { r: 0.05, name: 'counter' }); box(S, [5.2, 0.2, 2.0], [8.5, 3.1, -7.9], M(0xe8e2d6, { roughness: 0.4 }), { r: 0.03, name: 'counter top' });
  box(S, [5.0, 2.2, 1.0], [8.5, 6.4, -8.4], tmat(T.planks(0x6a8aa0), 1, 1), { r: 0.05, cast: false, solid: false, name: 'cupboard' });
  for (let i = 0; i < 4; i++) put(S, mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 10), M([0xf2c420, 0xd8302a, 0xfafafa, 0x2a6ae8][i])), [6.6 + i * 1.1, 3.5, -8.2]);
  const kettle = put(S, mesh(new THREE.SphereGeometry(0.55, 14, 10), M(0xd8302a, { metalness: 0.3, roughness: 0.3 })), [10.0, 3.7, -7.8]);
  // wood stove + pipe
  const st = new THREE.Group(); st.position.set(9.4, 0, -2.6); S.add(st); const iron = M(0x2a2a2e, { metalness: 0.6, roughness: 0.5 });
  put(st, mesh(rb(2.4, 2.6, 2.2, 0.15), iron), [0, 1.6, 0]); for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(st, mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), iron), [sx, 0.2, sz * 0.9]);
  const fireM = std({ color: 0xff8a2a, emissive: 0xff6a1a, emissiveIntensity: 2.2 }); put(st, mesh(new THREE.PlaneGeometry(1.2, 0.8), fireM, false), [-1.21, 1.6, 0], [0, -Math.PI / 2, 0]);
  put(st, mesh(new THREE.CylinderGeometry(0.3, 0.3, 7.6, 10), iron), [0, 6.6, 0]);
  box(S, [2.4, 2.8, 2.2], [9.4, 1.4, -2.6], basic(0, { visible: false }), { r: 0, cast: false, name: 'stove' });
  for (let i = 0; i < 5; i++) put(S, mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 8), M(0x8a5a30)), [10.3, 0.35 + (i % 2) * 0.55, 1.5 + (i >> 1) * 0.62], [Math.PI / 2, 0, 0]);
  // door + hooks + jacket on the right wall
  box(S, [0.3, 7, 3.6], [10.9, 3.5, 4.6], tmat(T.planks(0x6a4020), 1, 2), { r: 0.04, cast: false, solid: false, name: 'door' });
  for (let i = 0; i < 3; i++) put(S, mesh(new THREE.BoxGeometry(0.6, 0.15, 0.15), M(0x2a2a2a)), [10.6, 6.0, 7.6 + i * 1.2]);
  if (bed === 'sol') put(S, mesh(rb(0.5, 2.6, 1.6, 0.2), M(0xd8302a)), [10.4, 4.8, 7.6]);   // Mom's red jacket on the hook
  put(S, mesh(rb(0.5, 2.0, 1.4, 0.2), M(0x2a5a8a)), [10.4, 5.0, 8.8]);
  box(S, [4.0, 0.06, 2.6], [9.2, 0.03, 6.6], std({ color: 0x8a3a2a, roughness: 1 }), { r: 0.02, cast: false, solid: false, name: 'mat' });
  // rug + armchair-free middle, plant, lantern, skis on wall
  put(S, new THREE.Mesh(new THREE.CircleGeometry(4.0, 30), std({ map: ctex(256, 256, (c, w, h) => { for (let r = 128; r > 0; r -= 16) { c.fillStyle = ['#c8302a', '#f2e6c8', '#2a5a8a', '#e8a820'][(r / 16) % 4]; c.beginPath(); c.arc(128, 128, r, 0, 7); c.fill(); } }), roughness: 1 })), [-1.2, 0.03, 3.0], [-Math.PI / 2, 0, 0]);
  const plant = new THREE.Group(); plant.position.set(-9.6, 0, 6); S.add(plant); put(plant, mesh(new THREE.CylinderGeometry(0.8, 0.6, 1.5, 12), M(0xc87a4a)), [0, 0.75, 0]); for (let i = 0; i < 9; i++) put(plant, mesh(new THREE.SphereGeometry(0.7, 8, 6), M(0x3a8a3a)), [Math.cos(i) * 0.6, 2.0 + (i % 3) * 0.6, Math.sin(i) * 0.6]);
  for (const s of [-1, 1]) put(S, mesh(new THREE.BoxGeometry(0.15, 7.5, 0.5), M(s < 0 ? 0xd8302a : 0xf2c420)), [-10.75, 5.2, 8 + s * 0.5], [0, 0, 0.08 * s]);
  // lights
  S.add(new THREE.HemisphereLight(night ? 0x4a5a8a : 0xfff4e0, 0x4a3020, night ? 0.35 : 0.9));
  const pend = new THREE.PointLight(0xffc880, night ? 34 : 10, 22, 1.6); pend.position.set(3.6, 7.6, -2.0); pend.castShadow = true; pend.shadow.mapSize.set(1024, 1024); pend.shadow.bias = -0.003; S.add(pend);
  put(S, mesh(new THREE.ConeGeometry(1.0, 0.9, 16, 1, true), std({ color: 0x2a4a2a, side: THREE.DoubleSide })), [3.6, 8.3, -2.0]); put(S, mesh(new THREE.SphereGeometry(0.3, 10, 8), basic(0xfff0c0)), [3.6, 7.95, -2.0]);
  put(S, mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), M(0x1a1a1a)), [3.6, 9.4, -2.0]);
  const bedLamp = new THREE.PointLight(0xffb870, night ? 9 : 2, 12, 1.8); bedLamp.position.set(-4.6, 4.0, -7.0); S.add(bedLamp);
  const stove = new THREE.PointLight(0xff7a2a, night ? 14 : 5, 12, 1.8); stove.position.set(7.6, 1.8, -2.6); S.add(stove);
  const moon = new THREE.DirectionalLight(night ? 0x8aa8ff : 0xffe8c8, night ? 1.2 : 3.2); moon.position.set(2, night ? 12 : 14, -26); moon.target.position.set(0, 0, 2); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0008; Object.assign(moon.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 }); S.add(moon, moon.target);
  const front = new THREE.PointLight(night ? 0x8aa0d8 : 0xfff0d8, night ? 6 : 10, 26, 1.4); front.position.set(0, 7, 9); S.add(front);
  if (night) S.userData.look = 'night';
  return { stove, pend, blanket, kettle, update(t) { stove.intensity = (night ? 14 : 5) * (0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.07); fireM.emissiveIntensity = 2.0 + Math.sin(t * 11) * 0.4; } };
}

// ---------- lift base station ----------
export const STATION = { cableY: z => 12 + (-8 - z) * 0.24 };
export function liftStation(S, { icy = false, stuck = false } = {}) {
  S.background = T.sky('#3a7ad0', '#d8e8f4'); S.fog = new THREE.Fog(0xd8e6f2, 80, 380);
  box(S, [36, 0.3, 44], [0, -0.15, 6], tmat(T.concrete(0xa8a49c), 5, 6, { roughness: 0.8 }), { r: 0, cast: false, name: 'floor' });
  for (let i = -2; i <= 2; i++) box(S, [0.3, 0.02, 28], [i * 7, 0.01, -1], basic(0xf2c420), { r: 0, cast: false, solid: false });
  // slope beyond the open back
  const slope = put(S, mesh(new THREE.PlaneGeometry(500, 420), tmat(meadowTex(), 50, 42), false), [0, 30, -220], [-Math.PI / 2 + 0.16, 0, 0]); slope.receiveShadow = true;
  for (let i = 0; i < 46; i++) { const R = rng(i * 3 + 1); const z = -30 - R() * 180, x = (R() < 0.5 ? -1 : 1) * (14 + R() * 120); pine(S, [x, z], 10 + R() * 9, 0x2a5a32, -2 + (-16 - z) * 0.16); }
  mountains(S, { z: -320, seed: 11, h: [140, 210] }); clouds(S, { y: [80, 140], z: [-200, -300], x: 260, size: 3 });
  // structure: columns, roof, left wall, sign
  const steel = M(0x3a4a5a, { metalness: 0.6, roughness: 0.4 }), yel = M(0xf2c420, { roughness: 0.5 });
  for (const x of [-17.4, 17.4]) for (const z of [-15.4, 11.4]) box(S, [1.0, 15, 1.0], [x, 7.5, z], steel, { r: 0.05, name: 'column' });
  box(S, [37, 1.2, 28], [0, 15.6, -2], M(0x5a6a7a), { r: 0.05, cast: true, solid: false, name: 'roof' });
  box(S, [37, 1.6, 0.6], [0, 14.4, -15.6], M(0xd8302a), { r: 0.05, cast: false, solid: false });
  planeSign(S, sign('MOUNT KELL CABLE CAR · EST. 1962', '#d8302a', '#ffffff', 1024, 64, 40), [24, 1.5], [0, 14.4, -15.25]);
  box(S, [0.6, 15, 27], [-18.2, 7.5, -2], tmat(ctex(256, 256, (c, w, h) => { c.fillStyle = '#8a9aa8'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, 0, 5, h); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(x + 7, 0, 3, h); } noiseFill(c, w, h, 0.06, 800); }), 6, 2), { r: 0, cast: false, name: 'left wall' });
  box(S, [0.6, 15, 27], [18.2, 7.5, -2], tmat(ctex(256, 256, (c, w, h) => { c.fillStyle = '#8a9aa8'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, 0, 5, h); } }), 6, 2), { r: 0, cast: false, name: 'right wall' });
  // bullwheel + drive tower
  const wheel = new THREE.Group(); wheel.position.set(0, 10, -8); S.add(wheel);
  put(wheel, mesh(new THREE.TorusGeometry(6.5, 0.45, 10, 48), yel), [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) { const sp = put(wheel, mesh(new THREE.BoxGeometry(13, 0.35, 0.5), yel), [0, 0, 0]); sp.rotation.y = i * Math.PI / 8; }
  put(wheel, mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.2, 20), M(0x2a2a2e, { metalness: 0.6 })), [0, 0, 0]);
  box(S, [2.6, 9.4, 2.6], [0, 4.7, -8], tmat(T.concrete(0x8a8a88), 1, 2), { r: 0.1, name: 'drive tower' });
  box(S, [4, 1.0, 4], [0, 0.5, -8], M(0x5a5a5a), { r: 0.1, name: 'drive base' });
  put(S, mesh(new THREE.CylinderGeometry(0.15, 0.15, 5.5, 8), steel), [0, 12.8, -8]);
  // rail loop the cabins ride around the wheel + outgoing cables up the slope
  const railR = 6.5, railY = 12.6; put(S, mesh(new THREE.TorusGeometry(railR, 0.2, 8, 48), steel, false), [0, railY, -8], [Math.PI / 2, 0, 0]);
  const cy = STATION.cableY, cables = [];
  for (const sx of [-1, 1]) { const a = new THREE.Vector3(sx * railR, railY, -8), b = new THREE.Vector3(sx * railR, cy(-300), -300); const c = mesh(new THREE.CylinderGeometry(0.14, 0.14, a.distanceTo(b), 6), M(0x1a1a1e, { metalness: 0.5 }), false);
    c.position.copy(a).add(b).multiplyScalar(0.5); c.lookAt(b); c.rotateX(Math.PI / 2); S.add(c); cables.push([a, b]); }
  for (const z of [-90, -190]) { const ty = cy(z); const tw = new THREE.Group(); tw.position.set(0, -2 + (-16 - z) * 0.16, z); S.add(tw); const hgt = ty - tw.position.y;
    put(tw, mesh(new THREE.CylinderGeometry(0.8, 1.4, hgt, 8), M(0x6a7a88, { metalness: 0.5 })), [0, hgt / 2, 0]); put(tw, mesh(new THREE.BoxGeometry(16, 0.8, 1.2), M(0x6a7a88, { metalness: 0.5 })), [0, hgt + 0.2, 0]); }
  const cabs = [0, 1, 2, 3].map(i => gondola(S, { num: [3, 5, 9, 11][i], col: i % 2 ? 0xf2c420 : 0xd8302a, people: i % 2 ? 2 : 0, seed: i + 2 }));
  const outs = [0, 1, 2, 3, 4, 5].map(i => gondola(S, { num: 12 + i, col: i % 2 ? 0xd8302a : 0xf2c420, people: 2, seed: i + 7 }));
  // icicles + frost on the cables near the mouth
  const ice = []; if (icy) { const im = std({ color: 0xe8f6ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85, emissive: 0x8ab8e8, emissiveIntensity: 0.25 });
    for (const sx of [-1, 1]) for (let i = 0; i < 40; i++) { const z = -14 - i * 0.7, R = rng(i * 13 + sx * 5); const len = 0.4 + R() * 1.4; const ic = put(S, mesh(new THREE.ConeGeometry(0.09 + R() * 0.07, len, 6), im, false), [sx * railR + (R() - 0.5) * 0.1, cy(z) - 0.12 - len / 2, z], [Math.PI, 0, 0]); ice.push(ic); }
    for (const sx of [-1, 1]) { const a = new THREE.Vector3(sx * railR, cy(-14), -14), b = new THREE.Vector3(sx * railR, cy(-48), -48); const c = mesh(new THREE.CylinderGeometry(0.26, 0.26, a.distanceTo(b), 8), im, false); c.position.copy(a).add(b).multiplyScalar(0.5); c.lookAt(b); c.rotateX(Math.PI / 2); S.add(c); } }
  // stuck cabin with tourists
  let stuckG = null; if (stuck) { stuckG = gondola(S, { num: 4, col: 0xd8302a, people: 4, seed: 3, s: 1.3 }); stuckG.position.set(railR, cy(-46), -46); }
  // console (operator stands at (9, -3.4) facing +z)
  const con = new THREE.Group(); con.position.set(9, 0, -1.2); S.add(con);
  put(con, mesh(rb(7, 2.4, 1.6, 0.1), M(0x4a5a6a, { metalness: 0.3 })), [0, 1.2, 0]);
  const top = put(con, mesh(rb(7.2, 0.25, 1.9, 0.05), M(0x2a3238, { metalness: 0.4 })), [0, 2.5, -0.05]); top.rotation.x = -0.18;
  box(S, [7, 2.6, 1.6], [9, 1.3, -1.2], basic(0, { visible: false }), { r: 0, cast: false, name: 'console' });
  const levers = []; for (let i = 0; i < 4; i++) { const lv = new THREE.Group(); lv.position.set(-2.6 + i * 0.9, 2.6, -0.2); con.add(lv); put(lv, mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), M(0xd8dce4, { metalness: 0.9, roughness: 0.2 })), [0, 0.55, 0]);
    put(lv, mesh(new THREE.SphereGeometry(0.2, 12, 8), M([0xd8302a, 0xf2c420, 0x2aa84a, 0x2a6ae8][i])), [0, 1.15, 0]); levers.push(lv); }
  const btn = put(con, mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 20), std({ color: 0xff2a1a, emissive: 0xff2a1a, emissiveIntensity: 0.5 })), [1.4, 2.72, -0.1]);
  put(con, mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 20), M(0xf2c420)), [1.4, 2.6, -0.1]);
  for (let i = 0; i < 3; i++) put(con, mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 18), std({ color: 0xf6f2e0, emissive: 0xfff6d8, emissiveIntensity: 0.3 })), [-2.4 + i * 1.0, 2.68, 0.45], [0, 0, 0]);
  // radio (vintage transceiver + handset + antenna)
  const radio = new THREE.Group(); radio.position.set(2.6, 2.7, 0.2); con.add(radio);
  put(radio, mesh(rb(1.4, 0.9, 0.9, 0.1), M(0x3a4a3a)), [0, 0.45, 0]); put(radio, mesh(new THREE.PlaneGeometry(0.9, 0.35), std({ color: 0xffe08a, emissive: 0xffc040, emissiveIntensity: 0.9 })), [0, 0.6, -0.46], [0, Math.PI, 0]);
  put(radio, mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), M(0x1a1a1a)), [0.5, 2.0, 0]); const rled = put(radio, mesh(new THREE.SphereGeometry(0.08, 8, 6), basic(0xff3a2a)), [-0.5, 0.82, -0.3]);
  // status board on a post behind the console (faces -z toward the operator? no: faces +z to camera)
  const bt = ctex(512, 256, (c, w, h) => { c.fillStyle = '#1a2228'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2c420'; c.font = '900 34px Inter, sans-serif'; c.fillText('CABIN STATUS', 20, 42);
    c.font = '700 26px Inter, sans-serif'; for (let i = 0; i < 12; i++) { const x = 30 + (i % 6) * 80, y = 100 + Math.floor(i / 6) * 90; c.fillStyle = '#ddd'; c.fillText(String(i + 1), x, y); } });
  const board = new THREE.Group(); board.position.set(14.8, 5.4, -4.2); S.add(board);
  put(board, new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), std({ map: bt, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: 0.25 })), [0, 0, 0]);
  const dots = []; for (let i = 0; i < 12; i++) dots.push(put(board, new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), basic(0x2aff5a)), [-2.15 + (i % 6) * 0.78 + 0.45, 0.45 - Math.floor(i / 6) * 0.88, 0.02]));
  put(S, mesh(new THREE.BoxGeometry(5.3, 2.8, 0.2), M(0x2a2a2e)), [14.8, 5.4, -4.32]); put(S, mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.2, 8), M(0x2a2a2e)), [14.8, 2.1, -4.4]);
  // Otto's workbench (left wall)
  box(S, [2.4, 0.3, 10], [-16.4, 3.0, 3], M(0x8a5a30), { r: 0.04, name: 'workbench' }); for (const z of [-1.6, 7.6]) box(S, [2.2, 2.9, 0.3], [-16.4, 1.45, z], M(0x5a3a20), { r: 0.03, name: 'workbench leg' });
  const peg = ctex(512, 256, (c, w, h) => { c.fillStyle = '#c8a878'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = 10; x < w; x += 20) for (let y = 10; y < h; y += 20) { c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.fill(); }
    c.fillStyle = '#5a5a5a'; c.fillRect(60, 40, 16, 140); c.fillRect(40, 30, 56, 24); c.fillStyle = '#d8302a'; c.fillRect(140, 40, 18, 120); c.fillStyle = '#4a4a4a'; c.beginPath(); c.arc(149, 40, 22, 0, 7); c.fill();
    c.fillStyle = '#f2c420'; c.fillRect(220, 60, 120, 18); c.fillStyle = '#2a2a2a'; c.fillRect(380, 40, 14, 150); c.fillRect(370, 40, 34, 20); c.strokeStyle = '#3a3a3a'; c.lineWidth = 8; c.beginPath(); c.arc(300, 170, 40, 0, 7); c.stroke(); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), std({ map: peg })), [-17.85, 6.2, 3], [0, Math.PI / 2, 0]);
  const thermos = put(S, mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.4, 14), M(0x2a7a4a, { metalness: 0.4, roughness: 0.3 })), [-16.2, 3.85, 0.6]);
  put(S, mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 14), M(0xd8dce4, { metalness: 0.8 })), [-16.2, 4.65, 0.6]);
  const mugs = [[-16.0, 1.6, 0xfafafa], [-16.4, 2.3, 0xd8302a]].map(([x, z, c]) => put(S, mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.5, 12), M(c)), [x, 3.4, z]));
  const steam = []; for (let i = 0; i < 8; i++) steam.push(put(S, mesh(new THREE.SphereGeometry(0.16, 8, 6), std({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }), false), [-16, 3.8, 1.6]));
  put(S, mesh(rb(2.0, 1.0, 1.0, 0.1), M(0xd8302a)), [-16.4, 3.65, 5.2]); put(S, mesh(new THREE.TorusGeometry(0.8, 0.25, 8, 20), M(0x2a2a2a)), [-16.2, 3.4, 7.2], [Math.PI / 2, 0, 0]);
  // drums, spare wheel, rope coil, traffic cones, ski rack
  for (const [x, z, c] of [[-15, -12.5, 0x2a6ae8], [-12.8, -13.2, 0xd8302a], [-14.2, -10.4, 0x2a6ae8]]) box(S, [1.8, 2.8, 1.8], [x, 1.4, z], M(c, { metalness: 0.3, roughness: 0.5 }), { r: 0.6, name: 'drum' });
  put(S, mesh(new THREE.TorusGeometry(1.6, 0.35, 10, 28), M(0x2a2a2e)), [13.5, 1.8, -12.6], [0, 0.3, 0]);
  put(S, mesh(new THREE.TorusGeometry(0.9, 0.3, 8, 20), M(0xc8a060)), [-9, 0.3, 9.5], [Math.PI / 2, 0, 0]);
  for (const x of [-6, -4.6]) { put(S, mesh(new THREE.ConeGeometry(0.5, 1.4, 12), M(0xff7a1a)), [x, 0.7, 10.2]); }
  // lights: sun outside (late morning), strip lights under the roof, console glow on the operator's face
  const sun = new THREE.DirectionalLight(0xffe8c8, 3.2); sun.position.set(30, 50, -40); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 160 }); sun.target.position.set(0, 0, -10); S.add(sun, sun.target);
  S.add(new THREE.HemisphereLight(0xcfe0ff, 0x6a6058, 1.1));
  for (const [x, z] of [[-8, 0], [8, 0], [0, 6]]) { const p = new THREE.PointLight(0xf6f2e8, 26, 26, 1.5); p.position.set(x, 13.5, z); S.add(p); put(S, mesh(new THREE.BoxGeometry(5, 0.25, 0.5), basic(0xfafaf2)), [x, 14.9, z]); }
  const glow = new THREE.PointLight(0xffd8a0, 8, 8, 1.6); glow.position.set(9, 3.6, -2.4); S.add(glow);
  const front = new THREE.DirectionalLight(0xfff0e0, 1.2); front.position.set(-10, 12, 30); S.add(front);
  const env = { wheel, levers, radio, btn, cabs, outs, stuck: stuckG, thermos, mugs, ice, cableY: cy, glow,
    spinK: 1, spin(k) { env.spinK = k; },
    board(n, col = 0xff3a2a) { dots.forEach((d, i) => d.material.color.setHex(i === n - 1 ? col : 0x2aff5a)); },
    update(t) { const a = t * 0.12 * env.spinK; wheel.rotation.y = a;
      cabs.forEach((c, i) => { const th = a + i * Math.PI / 2; c.position.set(Math.cos(th) * railR, railY, -8 + Math.sin(th) * railR); c.rotation.y = -th; c.userData.body.rotation.z = Math.sin(t * 1.5 + i) * 0.02; });
      outs.forEach((c, i) => { const sx = i % 2 ? 1 : -1; const u = ((t * 0.01 * env.spinK * sx + i / 6) % 1 + 1) % 1; const z = -16 - u * 260; c.position.set(sx * railR, cy(z), z); c.userData.body.rotation.x = Math.sin(t + i) * 0.03; });
      if (stuckG) { stuckG.userData.body.rotation.x = Math.sin(t * 1.6) * 0.08; stuckG.userData.body.rotation.z = Math.sin(t * 1.1) * 0.05; }
      steam.forEach((s, i) => { const u = (t * 0.4 + i / 8) % 1; s.position.set(-16 + Math.sin(u * 6 + i) * 0.2, 3.7 + u * 2.2, 1.6 + Math.cos(u * 5) * 0.15); s.scale.setScalar(0.6 + u * 1.6); s.material.opacity = 0.35 * (1 - u); });
      rled.material.color.setHex(Math.sin(t * 8) > 0 ? 0xff3a2a : 0x3a0a0a); glow.intensity = 8 + Math.sin(t * 5) * 0.6; } };
  return env;
}

// ---------- the valley pitch + cabin 7 ----------
export const VALLEY = { cableY: x => 42 + x * 0.11, cableZ: -10, cab: { x0: 0, x1: 12, z0: -15, z1: -5, y: 30 } };
export function kellValley(S, { time = 'golden', focus = 'pitch' } = {}) {
  const night = time === 'night'; const C = VALLEY.cab, cx = (C.x0 + C.x1) / 2, cz = (C.z0 + C.z1) / 2;
  S.background = night ? T.sky('#05081a', '#1e2a52') : T.sky('#4a7ad0', '#ffd0a0'); S.fog = new THREE.Fog(night ? 0x141c38 : 0xf2d8b8, 110, 520);
  box(S, [900, 0.3, 900], [0, -0.16, -200], tmat(meadowTex(), 90, 90), { r: 0, cast: false, solid: false, name: 'meadow' });
  box(S, [60, 0.06, 24], [0, 0.0, -10], std({ map: pitchTex(), roughness: 0.95 }), { r: 0, cast: false, solid: false, name: 'pitch' });
  // goals with nets
  const netT = ctex(128, 128, (c, w, h) => { c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3; for (let i = 0; i <= w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } });
  const netM = std({ map: netT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 1 }), post = M(0xfafafa, { roughness: 0.3 });
  const goals = []; for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 30, 0, -10); S.add(g); goals.push(g);
    for (const z of [-5, 5]) put(g, mesh(new THREE.CylinderGeometry(0.2, 0.2, 6, 10), post), [0, 3, z]); put(g, mesh(new THREE.CylinderGeometry(0.2, 0.2, 10.4, 10), post), [0, 6, 0], [Math.PI / 2, 0, 0]);
    const back = put(g, mesh(new THREE.PlaneGeometry(10, 6), std({ ...netM.clone() }), false), [s * 3, 3, 0], [0, Math.PI / 2, 0]); back.material = netM; back.material.map.repeat.set(4, 2.4);
    put(g, mesh(new THREE.PlaneGeometry(3, 10), netM, false), [s * 1.5, 6, 0], [Math.PI / 2, 0, Math.PI / 2]);
    for (const z of [-5, 5]) put(g, mesh(new THREE.PlaneGeometry(3, 6), netM, false), [s * 1.5, 3, z]); }
  // bleachers + crowd behind the pitch, scoreboard, flags, banner
  const bench = tmat(T.planks(0x8a5a30), 6, 1);
  for (let r = 0; r < 4; r++) box(S, [40, 0.8 * (r + 1), 1.6], [0, 0.4 * (r + 1), -26 - r * 1.6], bench, { r: 0.04, name: 'bleacher' + r });
  const crowd = []; const CR = rng(21); for (let r = 0; r < 4; r++) for (let i = 0; i < 17; i++) { if (CR() < 0.2) continue; const f = fan(S, [-18.5 + i * 2.3 + (CR() - 0.5) * 0.4, 0.8 * (r + 1), -26 - r * 1.6], { col: CR() < 0.6 ? 0x2a8a4a : [0xf27a1a, 0xfafafa, 0x2a6ae8, 0xd8302a][Math.floor(CR() * 4)], seed: r * 20 + i }); f.rotation.y = 0; crowd.push(f); }
  const scT = ctex(512, 256, (c, w, h) => { c.fillStyle = '#1a2a1a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2c420'; c.font = '900 40px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('KELL   1 : 1   PINE', w / 2, 90); c.fillStyle = '#ff5a3a'; c.font = '900 70px Inter, sans-serif'; c.fillText("89'", w / 2, 190); });
  const sb = new THREE.Group(); sb.position.set(24, 0, -33); S.add(sb); for (const s of [-1, 1]) put(sb, mesh(new THREE.BoxGeometry(0.5, 9, 0.5), M(0x5a3a20)), [s * 3.6, 4.5, 0]);
  put(sb, mesh(new THREE.BoxGeometry(8, 4.2, 0.4), M(0x5a3a20)), [0, 8, 0]); const scoreFace = put(sb, new THREE.Mesh(new THREE.PlaneGeometry(7.4, 3.7), std({ map: scT, emissive: 0xffffff, emissiveMap: scT, emissiveIntensity: night ? 0.6 : 0.3 })), [0, 8, 0.21]);
  planeSign(S, sign('KELL VALLEY CUP · FINAL', '#2a8a4a', '#ffffff', 1024, 96, 56), [18, 1.7], [-2, 6.4, -33.2]);
  for (const s of [-1, 1]) put(S, mesh(new THREE.CylinderGeometry(0.12, 0.12, 8, 6), M(0xd8dce4)), [-20 * s - 2, 4, -33.4]);
  const flags = []; for (const [x, z] of [[-30, 3], [30, 3], [-30, -23], [30, -23]]) { put(S, mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), M(0xf2c420)), [x, 1.3, z]); flags.push(put(S, mesh(new THREE.PlaneGeometry(1.0, 0.7), M(0xd8302a, { side: THREE.DoubleSide }), false), [x + 0.5, 2.25, z])); }
  // team benches front-left (dugout)
  box(S, [8, 0.3, 1.4], [-18, 1.5, 6.5], M(0x2a8a4a), { r: 0.05, name: 'team bench' }); box(S, [8, 0.4, 2.2], [-18, 4.6, 6.6], std({ color: 0xd8f0ff, transparent: true, opacity: 0.35, roughness: 0.1 }), { r: 0.05, cast: false, solid: false });
  for (const s of [-1, 1]) box(S, [0.2, 4.6, 0.2], [-18 + s * 3.9, 2.3, 7.6], M(0xd8dce4), { r: 0.03, name: 'bench post' });
  // village + pines + mountains around
  const wallC = ['#f2e6c8', '#f6d8c8', '#fff2a8', '#e8f0f6', '#f2dcb8'];
  for (let i = 0; i < 9; i++) { const R = rng(i + 40); chalet(S, [-64 + i * 16 + R() * 4, -56 - R() * 14], { wall: wallC[i % 5], shutter: [0x2a7a4a, 0xc8302a, 0x2a5ab8][i % 3], lit: night ? 1 : 0, h2: 4 + R() * 2, name: 'vchalet' + i }); }
  for (let i = 0; i < 60; i++) { const R = rng(i * 7 + 3); const a = R() * Math.PI * 2, r = 70 + R() * 90; pine(S, [Math.cos(a) * r, -40 + Math.sin(a) * r * 0.8], 12 + R() * 12); }
  mountains(S, { z: -240, seed: 14, night }); mountains(S, { z: -340, n: 7, seed: 19, h: [140, 220], rock: 0x7a86a0, night });
  if (!night) clouds(S, { y: [70, 130], z: [-180, -300], x: 300, size: 3, tint: 0xffd8b8 }); else clouds(S, { night: true, y: [80, 130], z: [-200, -300], x: 300, size: 3 });
  // cable line + pylons + background cabins
  const cY = VALLEY.cableY, cZ = VALLEY.cableZ;
  for (const dz of [-0.35, 0.35]) { const a = new THREE.Vector3(-260, cY(-260), cZ + dz), b = new THREE.Vector3(260, cY(260), cZ + dz); const c = mesh(new THREE.CylinderGeometry(0.13, 0.13, a.distanceTo(b), 6), M(0x1a1a1e, { metalness: 0.5 }), false); c.position.copy(a).add(b).multiplyScalar(0.5); c.lookAt(b); c.rotateX(Math.PI / 2); S.add(c); }
  for (const x of [-120, 130]) { const top = cY(x) + 1.5; put(S, mesh(new THREE.CylinderGeometry(1.0, 1.8, top, 8), M(0x6a7a88, { metalness: 0.5 })), [x, top / 2, cZ]); put(S, mesh(new THREE.BoxGeometry(2, 1, 10), M(0x6a7a88)), [x, top, cZ]); }
  const bgCabs = [-80, -40, 52, 92].map((x, i) => { const g = gondola(S, { num: [3, 5, 9, 11][i], col: i % 2 ? 0xf2c420 : 0xd8302a, s: 1.4, people: night ? 0 : 2, seed: i }); g.position.set(x, cY(x), cZ); return g; });
  // ---- CABIN 7 (interior, glass all round) ----
  const cab = new THREE.Group(); S.add(cab); const red = M(0xd8302a, { roughness: 0.35, metalness: 0.2 }), dark = M(0x2a2a2e, { metalness: 0.5 });
  box(cab, [C.x1 - C.x0 + 0.6, 0.6, C.z1 - C.z0 + 0.6], [cx, C.y - 0.3, cz], tmat(T.planks(0x6a5040), 2, 2), { r: 0.1, name: 'cab floor' });
  box(cab, [C.x1 - C.x0 + 0.8, 2.4, C.z1 - C.z0 + 0.8], [cx, C.y - 1.0, cz], red, { r: 0.4, cast: true, solid: false, name: 'cab belly' });
  for (const [w, d, x, z] of [[C.x1 - C.x0, 0.3, cx, C.z0], [C.x1 - C.x0, 0.3, cx, C.z1], [0.3, C.z1 - C.z0, C.x0, cz], [0.3, C.z1 - C.z0, C.x1, cz]]) box(cab, [w, 2.4, d], [x, C.y + 1.2, z], red, { r: 0.08, name: 'cab wall' });
  box(cab, [C.x1 - C.x0 + 0.8, 0.7, C.z1 - C.z0 + 0.8], [cx, C.y + 8.0, cz], red, { r: 0.3, cast: true, solid: false, name: 'cab roof' });
  box(cab, [C.x1 - C.x0 - 1, 0.3, C.z1 - C.z0 - 1], [cx, C.y + 7.55, cz], M(0xf2ead6), { r: 0.05, cast: false, solid: false });
  for (const x of [C.x0, cx, C.x1]) for (const z of [C.z0, C.z1]) box(cab, [0.3, 5.4, 0.3], [x, C.y + 5.0, z], red, { r: 0.05, solid: false, name: 'cab post' });
  for (const z of [C.z0 + 3.3, C.z1 - 3.3]) for (const x of [C.x0, C.x1]) box(cab, [0.3, 5.4, 0.3], [x, C.y + 5.0, z], red, { r: 0.05, solid: false, name: 'cab post' });
  const glass = new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
  for (const z of [C.z0, C.z1]) put(cab, new THREE.Mesh(new THREE.PlaneGeometry(C.x1 - C.x0, 5.0), glass), [cx, C.y + 4.9, z]);
  for (const x of [C.x0, C.x1]) put(cab, new THREE.Mesh(new THREE.PlaneGeometry(C.z1 - C.z0, 5.0), glass), [x, C.y + 4.9, cz], [0, Math.PI / 2, 0]);
  // number plates outside + hanger to the cable
  const nt = ctex(128, 128, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 58, 0, 7); c.fill(); c.fillStyle = '#d8302a'; c.font = '900 92px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7', 64, 70); });
  for (const [x, z, ry] of [[cx, C.z1 + 0.42, 0], [cx, C.z0 - 0.42, Math.PI], [C.x1 + 0.42, cz, Math.PI / 2], [C.x0 - 0.42, cz, -Math.PI / 2]]) put(cab, new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), std({ map: nt })), [x, C.y + 1.0, z], [0, ry, 0]);
  const gy = cY(cx); put(cab, mesh(new THREE.CylinderGeometry(0.22, 0.22, gy - C.y - 8.3, 8), dark), [cx, (gy + C.y + 8.3) / 2, cz]); put(cab, mesh(new THREE.BoxGeometry(1.4, 0.8, 1.6), dark), [cx, gy - 0.2, cZ]);
  box(cab, [4.5, 0.3, 0.3], [cx, C.y + 8.6, cz], dark, { r: 0.05, solid: false });
  // benches along the side walls (seat top y+1.7)
  for (const x of [C.x0 + 1.0, C.x1 - 1.0]) { box(cab, [1.4, 0.3, 8], [x, C.y + 1.55, cz], M(0x8a5a30), { r: 0.05, name: 'cab bench' }); box(cab, [1.2, 1.4, 7.6], [x, C.y + 0.7, cz], M(0x5a3a20), { r: 0.05, name: 'cab bench base' }); }
  // writing on the back glass (inner side, faces +z)
  const wT = ctex(1600, 700, (c, w, h) => { c.clearRect(0, 0, w, h); const R = rng(77); const cols = ['#e8302a', '#2a5ad8', '#1a1a1e', '#2a9a4a'];
    const hand = (txt, x, y, size, col, rot = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.font = `italic 700 ${size}px "Comic Neue", "Segoe Print", "Inter", sans-serif`; c.fillText(txt, 0, 0); c.restore(); };
    const games = [['SEP 6', '2-1', 'Mateo scored!!'], ['SEP 13', '0-2', 'next time ♥'], ['SEP 20', '3-3', 'great pass'], ['SEP 27', '1-0', 'MATEO!!!'], ['OCT 4', '2-2', 'so fast'], ['OCT 11', '1-3', 'proud anyway'], ['OCT 18', '4-1', 'header!?'], ['OCT 25', '2-0', 'Mateo 2 goals'], ['NOV 1', '1-1', 'rain :('], ['NOV 8', '3-2', 'WE WON']];
    games.forEach(([d, s, n], i) => { const col = i < 5 ? 30 : 1080; const y = 60 + (i % 5) * 62; hand(`${d}  ${s}  ${n}`, col, y, 40, cols[i % 4], (R() - 0.5) * 0.05); });
    for (let g = 0; g < 8; g++) { const x0 = 40 + g * 120, y0 = 640; c.strokeStyle = '#1a1a1e'; c.lineWidth = 6; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x0 + k * 18, y0 - 60); c.lineTo(x0 + k * 18 + 3, y0); c.stroke(); } c.beginPath(); c.moveTo(x0 - 8, y0 - 10); c.lineTo(x0 + 68, y0 - 50); c.stroke(); }
    c.save(); c.translate(560, 420); c.rotate(-0.05); c.fillStyle = '#e8302a'; c.font = 'italic 900 88px "Comic Neue", "Inter", sans-serif'; c.textAlign = 'center'; c.fillText("MATEO'S FIRST GOAL!", 0, 0);
    c.strokeStyle = '#e8302a'; c.lineWidth = 7; c.beginPath(); c.ellipse(0, -30, 590, 105, 0, 0, Math.PI * 2); c.stroke(); c.restore();
    const heart = (x, y, s) => { c.fillStyle = '#e8302a'; c.beginPath(); c.moveTo(x, y + s * 0.3); c.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * 0.3); c.bezierCurveTo(x - s / 2, y + s * 0.6, x, y + s * 0.8, x, y + s); c.bezierCurveTo(x, y + s * 0.8, x + s / 2, y + s * 0.6, x + s / 2, y + s * 0.3); c.bezierCurveTo(x + s / 2, y, x, y, x, y + s * 0.3); c.fill(); };
    heart(1130, 330, 70); heart(70, 360, 50); heart(1500, 520, 44); hand('Mateo #7', 1260, 440, 50, '#2a9a4a', 0.06); });
  wT.wrapS = wT.wrapT = THREE.ClampToEdgeWrapping;
  const write = put(cab, new THREE.Mesh(new THREE.PlaneGeometry(10.6, 4.6), new THREE.MeshBasicMaterial({ map: wT, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, color: 0xe8e8e8 })), [cx, C.y + 4.85, C.z0 + 0.12]);
  write.renderOrder = 2;
  const nT = ctex(1024, 160, (c, w, h) => { c.fillStyle = '#2a5ad8'; c.font = 'italic 900 92px "Comic Neue", "Inter", sans-serif'; c.fillText("MOM'S FIRST GOAL! ♥", 20, 110); }); nT.wrapS = nT.wrapT = THREE.ClampToEdgeWrapping;
  const nl = put(cab, new THREE.Mesh(new THREE.PlaneGeometry(5.0, 0.78), new THREE.MeshBasicMaterial({ map: nT, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, color: 0xe8e8e8 })), [cx + 3.3, C.y + 3.3, C.z0 + 0.16]); nl.renderOrder = 3;
  const newLine = (k) => { k = clamp01(k); nl.visible = k > 0.001; nl.scale.x = Math.max(0.001, k); nl.position.x = cx + 0.8 + 2.5 * k; nT.repeat.x = Math.max(0.001, k); nT.offset.x = 0; };
  newLine(0);
  // props: binoculars, radio, thermos, scarf, photo, cushion
  const binos = new THREE.Group(); binos.position.set(C.x0 + 1.0, C.y + 1.85, cz + 1.5); cab.add(binos);
  for (const s of [-1, 1]) { put(binos, mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.7, 14), dark), [s * 0.25, 0, 0], [Math.PI / 2, 0, 0]); put(binos, mesh(new THREE.CircleGeometry(0.2, 14), std({ color: 0x6a9ac8, metalness: 0.8, roughness: 0.1 })), [s * 0.25, 0, -0.36], [0, Math.PI, 0]); }
  put(binos, mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), dark), [0, 0, 0]);
  const radioC = new THREE.Group(); radioC.position.set(C.x1 - 1.0, C.y + 1.7, cz - 2.2); cab.add(radioC);
  put(radioC, mesh(rb(1.2, 0.8, 0.6, 0.1), M(0x8a5a30)), [0, 0.4, 0]); put(radioC, mesh(new THREE.CircleGeometry(0.25, 16), M(0x2a2a2a)), [-0.25, 0.42, 0.31]); put(radioC, mesh(new THREE.PlaneGeometry(0.4, 0.25), std({ color: 0xffe08a, emissive: 0xffc040, emissiveIntensity: 0.6 })), [0.3, 0.45, 0.31]);
  put(radioC, mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 5), M(0xd8dce4)), [0.45, 1.3, 0], [0, 0, -0.3]);
  put(cab, mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12), M(0x2a7a4a, { metalness: 0.4 })), [C.x1 - 1.0, C.y + 2.3, cz + 0.8]);
  box(cab, [1.2, 0.4, 2.4], [C.x0 + 1.0, C.y + 1.9, cz - 2.4], std({ map: quiltTex('#c8302a', '#e8a8a0'), roughness: 1 }), { r: 0.15, cast: false, solid: false });
  const scarf = put(cab, mesh(new THREE.BoxGeometry(0.6, 3.0, 0.08), std({ map: ctex(32, 256, (c, w, h) => { for (let y = 0; y < h; y += 32) { c.fillStyle = (y / 32) % 2 ? '#2a8a4a' : '#ffffff'; c.fillRect(0, y, w, 32); } }) })), [C.x1 - 0.3, C.y + 5.4, C.z0 + 1.0], [0, Math.PI / 2, 0.05]);
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.15), std({ map: ctex(90, 115, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#8ab0e8'; c.fillRect(6, 6, w - 12, h - 30); c.fillStyle = '#c88a5a'; c.beginPath(); c.arc(w / 2, 40, 14, 0, 7); c.fill(); c.fillStyle = '#2a8a4a'; c.fillRect(w / 2 - 16, 54, 32, 30); }) })), [cx + 4.3, C.y + 6.6, C.z0 + 0.16]);
  // lights
  const sunPos = night ? [-60, 90, -40] : [120, 70, 90];
  const sun = new THREE.DirectionalLight(night ? 0x8aa8ff : 0xffc890, night ? 0.6 : 3.6); const tgt = focus === 'cabin' ? new THREE.Vector3(cx, C.y, cz) : new THREE.Vector3(0, 0, -10);
  sun.position.set(tgt.x + sunPos[0] * 0.4, tgt.y + sunPos[1] * 0.4, tgt.z + sunPos[2] * 0.4); sun.target.position.copy(tgt); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  const ar = focus === 'cabin' ? 16 : 40; Object.assign(sun.shadow.camera, { left: -ar, right: ar, top: ar, bottom: -ar, near: 1, far: 200 }); S.add(sun, sun.target);
  S.add(new THREE.HemisphereLight(night ? 0x3a4a7a : 0xcfe0ff, night ? 0x1a1a22 : 0x6a5a40, night ? 0.35 : 0.95));
  const fillL = new THREE.DirectionalLight(night ? 0x5a6aa8 : 0xa8c0ff, night ? 0.3 : 0.6); fillL.position.set(-40, 30, 60); S.add(fillL);
  const inner = new THREE.PointLight(night ? 0xffb860 : 0xffe0b8, night ? 18 : 8, 16, 1.6); inner.position.set(cx, C.y + 6.5, cz + 1.5); S.add(inner);
  let lantern = null; if (night) { lantern = new THREE.Group(); lantern.position.set(C.x1 - 1.0, C.y + 1.7, cz + 2.4); cab.add(lantern); put(lantern, mesh(rb(0.6, 0.9, 0.6, 0.1), dark), [0, 0.45, 0]);
    put(lantern, mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 10), basic(0xffd890)), [0, 0.5, 0]);
    const stars = new THREE.Group(); S.add(stars); const R = rng(5); for (let i = 0; i < 260; i++) { const a = R() * Math.PI * 2, e = 0.15 + R() * 1.2; put(stars, new THREE.Mesh(new THREE.SphereGeometry(0.6 + R() * 0.6, 4, 3), basic(0xffffff, { fog: false })), [Math.cos(a) * 420 * Math.cos(e), 420 * Math.sin(e), -120 + Math.sin(a) * 420 * Math.cos(e)]); }
    put(S, new THREE.Mesh(new THREE.SphereGeometry(14, 20, 14), basic(0xfff4d8, { fog: false })), [-120, 190, -360]);
    S.userData.look = 'night'; }
  else put(S, new THREE.Mesh(new THREE.SphereGeometry(18, 20, 14), basic(0xffe0a0, { fog: false })), [260, 60, -380]);
  const env = { cab, write, newLine, binos, radio: radioC, scarf, crowd, goals, scoreFace, bgCabs, inner, lantern, sun, C, cx, cz,
    update(t, cheer = 0) { crowd.forEach(f => f.update(t, cheer)); flags.forEach((f, i) => { f.rotation.y = Math.sin(t * 3 + i) * 0.4; });
      cab.rotation.x = 0; cab.position.y = Math.sin(t * 0.9) * 0.04; scarf.rotation.z = 0.05 + Math.sin(t * 1.3) * 0.05;
      bgCabs.forEach((g, i) => { g.userData.body.rotation.x = Math.sin(t * 0.8 + i) * 0.03; }); if (lantern) inner.intensity = 18 * (0.92 + Math.sin(t * 9) * 0.05); } };
  return env;
}
