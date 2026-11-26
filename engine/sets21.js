// Episode 021 kit (Lost Property): a grand railway station's lost-property office, the platform with the NIGHT TRAIN, the driver's cab and a mail car full of letters.
// All sets: characters face +Z, camera at +Z unless noted. Sets return env with update(t) — call it every frame.
//
//   stationClock(S, [x,y,z], { r, cube, rod })  hanging station clock (faces ±z, and ±x when cube) → .set(h, m), .update(t) (second hand), .g
//   lostHall(S, { time: 'evening'|'morning', h, m })  LOST PROPERTY office: walls x ±13, back z -10, front z 16 (double door x ±2.2, env.door.open(k)), ceiling 12.
//       Counter x -6.2..4.2, z -3.6..-2.0, top 3.0 (solid 'counter'): clerk stands behind at z -5.3, customers in front at z ≥ -0.2.
//       Shelves of lost things on the back wall (front z -8.5; boards y 2.6/4.8/7.0/9.2), empty slot env.slot (3.2, 4.88, -9.2). Hanging clock (2.9, 8.5, -6) env.clock,
//       LOST PROPERTY sign (-2.6, 9.9, -2.8), pendant lamps x -3.6 / 0.9 / 5.6 at z -3.2, banker's lamp (-5.3), bell env.bell (1.3, 3.08, -2.6), PA mic env.mic (3.4, 3.08, -2.7),
//       arched window left wall (evening sun shafts), cart doorway in the right wall (z 0..4), bench left, trunks front-right. env.key face light, env.lamps.
//   grandStation(S, { time: 'sunset'|'day'|'dusk', sign, clockX, train, trainX, h, m })  platform under an iron-and-glass roof, along x.
//       Platform top y 0, z -5..14 (edge z -5); track centre z -8; far platform + arcade wall z -21; LOST PROPERTY doorway in the end wall x -58 (z 2..8, faces +x);
//       open arch + sky at +x. Hanging cube clock (clockX, 11, 3) env.clock, PLATFORM sign (clockX-9, 9.2, 3), speaker pole (clockX+6, 0, 9.5) env.speaker,
//       lamps, benches (z 12), trunks, pigeons env.pigeons. env.train = nightTrain (nose at trainX). env.follow(x) moves the sun's shadow box + key light. env.key.
//   nightTrain(S)  navy-and-gold steam loco (x -8..8, faces +x, wheels r 2, cab floor y 3.4: driver at local (-4.4, 3.4, 0.4); cab window z +2.6, x -5.6..-2.4, y 6.2..8.8;
//       cab door x -7.7..-6.3 with steps (1.2 / 2.3) + 3 cars behind (first = mail car with a sliding LOST PROPERTY door). → .g (position it; track centre z),
//       .update(t, { dist, steam, whistle, door }) (dist rolls the wheels; move .g.position.x yourself), .cabDoor (local point), .lamp.
//   trainCab(S)  inside the loco cab (walls x ±5.5, back z -4, open to the camera, ceiling 9): back wall windows with scenery streaming (env.update(t, { dist })),
//       console + windshield on the right (x 3.8..5.5; brake lever env.brake(k)), sliding MAIL door in the left wall (z -1.4..1.6) env.door.open(k),
//       bench under the windows (seat top 1.7, x -4.9..1.9, sit at z -3.0), stove env.fire back-right, hanging lantern, photo, calendar. env.key.
//   letterCar(S)  the mail car beyond the cab's left wall (x -30..-5.9, z -4.2..4.2, ceiling 9): racks of envelopes floor to ceiling, drifts, bundles, sacks,
//       3 swaying lamps (x -10 / -17.5 / -25), falling letters. Aisle z -1.6..1.6. Same coordinate space as trainCab (build both in one shot).
//   Props: envelope(S, { text, wet, s }) (.userData.update(t) drips) · letterPaper(S, text, { w }) · tagCard(S, [[label, hand], …], { s }) · portersCart(S) (.roll(dist), deck top 1.15)
//       · temperJar(S, { s }) (.update(t, 'sulk'|'rage'|'chomp'), .m monster) · thoughtTrain(S, { n }) (.update(t, { cx, cz, rx, rz, lap })) · hourglass(S, { s, light }) (.update(t, k))
//       · keyRing(S) · teddy(S, col) · coffeeCup(S, col) · pigeon(S) (.update(t, 'peck'|'walk'|'fly')) · hornSpeaker(S) (.ring(t, k)) · framedPhoto(S)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { std, box } from './sets.js';
import { monster } from './themes.js';

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
const M = (col, o = {}) => std({ color: col, roughness: 0.7, ...o });
const brass = () => once('brass', () => M(0xd8a83a, { metalness: 0.85, roughness: 0.28 }));
const rb = (w, h, d, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const clamp01 = x => Math.max(0, Math.min(1, x));
const hex = c => '#' + new THREE.Color(c).getHexString();
const HAND = '"Comic Relief", "Comic Sans MS", cursive';

// ---------- textures ----------
const checkerTex = (a, b) => once('chk' + a + b, () => ctex(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? a : b; c.fillRect(i * 64, j * 64, 64, 64); c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(i * 64 + 3, j * 64 + 3, 58, 5); }
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } noiseFill(c, w, h, 0.07, 1500); }));
const glazedTex = (col) => once('glz' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#2a2420'; c.fillRect(0, 0, w, h); const b = new THREE.Color(col);
  for (let r = 0; r < 8; r++) for (let i = -1; i < 4; i++) { const x = i * 64 + (r % 2) * 32, y = r * 32; c.fillStyle = hex(b.clone().multiplyScalar(0.82 + Math.random() * 0.3)); c.fillRect(x + 2, y + 2, 60, 28); c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(x + 5, y + 4, 40, 4); }
  noiseFill(c, w, h, 0.05, 800); }));
const brickTex = (col = 0x9a4a32) => once('brk' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#cdbfa8'; c.fillRect(0, 0, w, h); const b = new THREE.Color(col);
  for (let r = 0; r < 8; r++) for (let i = -1; i < 4; i++) { const x = i * 64 + (r % 2) * 32, y = r * 32; c.fillStyle = hex(b.clone().multiplyScalar(0.75 + Math.random() * 0.45)); c.fillRect(x + 2, y + 2, 60, 28); }
  noiseFill(c, w, h, 0.1, 2500); }));
const plasterTex = (col) => once('pl' + col, () => ctex(256, 256, (c, w, h) => { const b = new THREE.Color(col); c.fillStyle = hex(b); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 120; i++) { c.fillStyle = hex(b.clone().multiplyScalar(0.9 + Math.random() * 0.16)); c.globalAlpha = 0.35; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 14 + Math.random() * 40, 8 + Math.random() * 20, Math.random() * 3, 0, 7); c.fill(); }
  c.globalAlpha = 1; noiseFill(c, w, h, 0.06, 2500); }));
const woodTex = (col = 0x7a4a26) => once('wd' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(30,15,5,${0.1 + Math.random() * 0.2})`; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 3); c.stroke(); }
  for (let x = 0; x < w; x += 64) { c.fillStyle = 'rgba(20,10,0,0.4)'; c.fillRect(x, 0, 2, h); } noiseFill(c, w, h, 0.06, 1200); }));
const paverTex = () => once('pav', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#6a625c'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 4; r++) for (let i = -1; i < 4; i++) { const x = i * 64 + (r % 2) * 32, y = r * 64; c.fillStyle = hex(new THREE.Color(0xb8aa98).multiplyScalar(0.8 + Math.random() * 0.3)); c.fillRect(x + 2, y + 2, 60, 60); }
  for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(40,30,20,0.16)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 10, 0, 7); c.fill(); } noiseFill(c, w, h, 0.08, 2500); }));
const steelTex = (col = 0x4a5058) => once('stl' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 3; c.beginPath(); const x = i * 44 + 12, y = j * 44 + 12; if ((i + j) % 2) { c.moveTo(x, y); c.lineTo(x + 18, y + 18); } else { c.moveTo(x + 18, y); c.lineTo(x, y + 18); } c.stroke(); }
  noiseFill(c, w, h, 0.07, 1500); }));
const rivetTex = (col = 0x1c2a52) => once('riv' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4);
  for (let i = 0; i < 8; i++) for (const [x, y] of [[16 + i * 32, 12], [16 + i * 32, h - 12], [12, 16 + i * 32], [w - 12, 16 + i * 32]]) { c.fillStyle = 'rgba(255,255,255,0.28)'; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(x + 1.5, y + 1.5, 3, 0, 7); c.fill(); }
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0.14)'); c.fillStyle = g; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.05, 1200); }));
function textTex(lines, { w = 512, h = 128, bg = '#1c4a48', fg = '#f2c860', font = '800 76px "Inter", sans-serif', border = '#f2c860', pad = 0 } = {}) {
  return ctex(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } if (border) { c.strokeStyle = border; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); }
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = font; const arr = Array.isArray(lines) ? lines : [lines]; arr.forEach((l, i) => c.fillText(l, w / 2, h * (i + 0.5) / arr.length + pad)); });
}
const envTex = (text = 'Mara', wet = false) => once('env' + text + wet, () => ctex(512, 320, (c, w, h) => { c.fillStyle = wet ? '#d9cfb8' : '#f4ecd8'; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(120,90,50,0.35)'; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, h - 8);
  c.fillStyle = '#b8402a'; c.fillRect(w - 96, 22, 70, 84); c.fillStyle = '#f4ecd8'; c.fillRect(w - 86, 32, 50, 64); c.fillStyle = '#2a4a8a'; c.beginPath(); c.arc(w - 61, 64, 16, 0, 7); c.fill();
  c.save(); c.translate(w * 0.44, h * 0.6); c.rotate(-0.06); c.fillStyle = '#1c2a5a'; c.font = `700 124px ${HAND}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (wet) { c.shadowColor = 'rgba(28,42,90,0.75)'; c.shadowBlur = 16; c.fillText(text, 3, 5); c.shadowBlur = 0; } c.fillText(text, 0, 0); c.restore();
  if (wet) { for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(70,80,110,${0.1 + Math.random() * 0.14})`; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 50, 14 + Math.random() * 30, Math.random() * 3, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(28,42,90,0.4)'; c.lineWidth = 5; for (const x of [150, 236, 300]) { c.beginPath(); c.moveTo(x, 210); c.lineTo(x + 3, 250 + Math.random() * 50); c.stroke(); }
    c.strokeStyle = 'rgba(90,70,40,0.4)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); let x = Math.random() * w, y = Math.random() * h; c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (Math.random() - 0.5) * 120; y += (Math.random() - 0.5) * 90; c.lineTo(x, y); } c.stroke(); } }
  noiseFill(c, w, h, 0.05, 900); }));
const rackTex = () => once('rack', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#3a2414'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let i = 0; i < 8; i++) { const x = i * 64, y = r * 64; c.fillStyle = '#1e120a'; c.fillRect(x + 4, y + 4, 56, 56);
    const n = 3 + Math.floor(Math.random() * 5); for (let k = 0; k < n; k++) { c.fillStyle = hex(new THREE.Color(0xf4ecd8).multiplyScalar(0.72 + Math.random() * 0.3)); c.save(); c.translate(x + 10 + k * 7 + Math.random() * 4, y + 58); c.rotate((Math.random() - 0.5) * 0.24); c.fillRect(0, -44 - Math.random() * 8, 5, 46); c.restore(); } }
  noiseFill(c, w, h, 0.06, 2000); }));

// ---------- small props ----------
export function stationClock(S, [x, y, z], { r = 1.35, cube = false, rod = 3 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  const face = once('clockface', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#f6efdc'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.strokeStyle = '#2a2420'; c.lineWidth = 10; c.beginPath(); c.arc(256, 256, 236, 0, 7); c.stroke();
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, big = i % 5 === 0; c.lineWidth = big ? 14 : 4; c.beginPath(); c.moveTo(256 + Math.sin(a) * (big ? 176 : 204), 256 - Math.cos(a) * (big ? 176 : 204)); c.lineTo(256 + Math.sin(a) * 224, 256 - Math.cos(a) * 224); c.stroke(); }
    c.fillStyle = '#2a2420'; c.font = '800 64px "Inter", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; [[12, 0], [3, 1], [6, 2], [9, 3]].forEach(([n, q]) => { const a = q * Math.PI / 2; c.fillText(String(n), 256 + Math.sin(a) * 132, 256 - Math.cos(a) * 132); }); }));
  const dark = M(0x1e1a18, { metalness: 0.5, roughness: 0.4 });
  if (cube) put(g, mesh(rb(r * 2.3, r * 2.3, r * 2.3, 0.22), M(0x1c4a48, { roughness: 0.5 })), [0, 0, 0]); else put(g, mesh(new THREE.CylinderGeometry(r * 1.1, r * 1.1, 0.5, 32), dark), [0, 0, 0], [Math.PI / 2, 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.07, 0.07, rod, 6), dark, false), [0, r * 1.15 + rod / 2, 0]);
  const hands = [];
  const sides = cube ? [[0, 0], [0, Math.PI], [Math.PI / 2, 0], [-Math.PI / 2, 0]] : [[0, 0], [0, Math.PI]];
  const off = cube ? r * 1.16 : 0.26;
  sides.forEach(([ry, ry2]) => { const f = new THREE.Group(); f.rotation.y = ry + ry2; g.add(f);
    put(f, new THREE.Mesh(new THREE.CircleGeometry(r, 40), std({ map: face, emissive: 0xffe8b0, emissiveMap: face, emissiveIntensity: 0.55, roughness: 0.6 })), [0, 0, off]);
    put(f, mesh(new THREE.TorusGeometry(r, 0.09, 8, 40), brass(), false), [0, 0, off]);
    const hh = new THREE.Group(), mh = new THREE.Group(), sh = new THREE.Group(); [hh, mh, sh].forEach(p => { p.position.z = off + 0.03; f.add(p); });
    put(hh, new THREE.Mesh(new THREE.BoxGeometry(0.13 * r, 0.56 * r, 0.02), basic(0x1a1614)), [0, 0.22 * r, 0]); put(mh, new THREE.Mesh(new THREE.BoxGeometry(0.09 * r, 0.86 * r, 0.02), basic(0x1a1614)), [0, 0.36 * r, 0.012]);
    put(sh, new THREE.Mesh(new THREE.BoxGeometry(0.035 * r, 0.9 * r, 0.02), basic(0xc8302a)), [0, 0.34 * r, 0.024]); put(f, new THREE.Mesh(new THREE.CircleGeometry(0.08 * r, 12), basic(0xc8302a)), [0, 0, off + 0.06]);
    hands.push([hh, mh, sh]); });
  const o = { g, r, h: 5, m: 50,
    set(h, m) { o.h = h; o.m = m; hands.forEach(([hh, mh]) => { hh.rotation.z = -((h % 12) + m / 60) * Math.PI / 6; mh.rotation.z = -m * Math.PI / 30; }); },
    update(t) { hands.forEach(([, , sh]) => { sh.rotation.z = -Math.floor(t * 1) * Math.PI / 30 - 0.05 * Math.exp(-((t % 1) * 9)); }); } };
  o.set(5, 50); return o;
}
export function envelope(S, { text = 'Mara', wet = false, s = 1 } = {}) {
  const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); const paper = M(wet ? 0xd9cfb8 : 0xf4ecd8, { roughness: wet ? 0.35 : 0.9 });
  const front = std({ map: envTex(text, wet), roughness: wet ? 0.35 : 0.9 });
  const b = mesh(new THREE.BoxGeometry(1.15, 0.72, 0.035), [paper, paper, paper, paper, front, paper]); g.add(b);
  const flap = new THREE.Shape(); flap.moveTo(-0.575, 0.36); flap.lineTo(0.575, 0.36); flap.lineTo(0, -0.02); flap.closePath();
  put(g, new THREE.Mesh(new THREE.ShapeGeometry(flap), M(wet ? 0xcbbfa4 : 0xe6dcc4, { side: THREE.DoubleSide })), [0, 0, -0.02], [0, Math.PI, 0]);
  if (wet) { b.geometry.translate(0, 0, 0); const pos = b.geometry.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + Math.sin(pos.getX(i) * 5) * 0.025 + Math.sin(pos.getY(i) * 7) * 0.02); pos.needsUpdate = true; }
  const drops = []; if (wet) for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), std({ color: 0xbfe0ff, roughness: 0.1, transparent: true, opacity: 0.85 })); d.scale.y = 1.6; g.add(d); drops.push(d); }
  g.userData.update = (t, fall = 2.2) => drops.forEach((d, i) => { const u = ((t * 0.9 + i * 0.37) % 1); d.position.set(-0.35 + i * 0.32, -0.36 - u * u * fall, 0.02); d.visible = u < 0.9; });
  return g;
}
export function letterPaper(S, text = "I'm sorry.", { w = 1.5, sign = '— Cal' } = {}) {
  const tex = once('paper' + text + sign, () => ctex(512, 640, (c, W, H) => { c.fillStyle = '#fbf6e6'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(90,130,190,0.35)'; c.lineWidth = 2; for (let y = 90; y < H; y += 62) { c.beginPath(); c.moveTo(30, y); c.lineTo(W - 30, y); c.stroke(); }
    c.strokeStyle = 'rgba(200,80,80,0.4)'; c.beginPath(); c.moveTo(70, 0); c.lineTo(70, H); c.stroke();
    c.save(); c.translate(W / 2 + 12, H * 0.42); c.rotate(-0.05); c.fillStyle = '#101a44'; c.font = `700 108px ${HAND}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 0); c.fillText(text, 1.5, 1); c.restore();
    if (sign) { c.fillStyle = '#101a44'; c.font = `700 60px ${HAND}`; c.textAlign = 'right'; c.fillText(sign, W - 60, H * 0.72); } noiseFill(c, W, H, 0.03, 600); }));
  const g = new THREE.Group(); S.add(g); const geo = new THREE.PlaneGeometry(w, w * 1.25, 6, 6); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getY(i) * 3.2) * 0.03 * w);
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, std({ map: tex, side: THREE.DoubleSide, roughness: 0.95, color: 0xd8d4c8 })); m.castShadow = true; g.add(m); return g;
}
// luggage tag: rows = [[printed label, handwritten value], ...]
export function tagCard(S, rows = [['LOST:', 'one brother'], ['CLAIMED BY:', 'Mara']], { s = 1 } = {}) {
  const key = 'tag' + JSON.stringify(rows);
  const tex = once(key, () => ctex(640, 384, (c, W, H) => { c.fillStyle = '#e8c88a'; c.fillRect(0, 0, W, H); c.strokeStyle = '#8a5a2a'; c.lineWidth = 8; c.strokeRect(10, 10, W - 20, H - 20);
    rows.forEach(([lab, val], i) => { const y = H * (0.3 + i * 0.42); c.fillStyle = '#7a3a1a'; c.font = '800 40px "Inter", sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(lab, 110, y - 44);
      c.strokeStyle = 'rgba(90,50,20,0.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(110, y + 40); c.lineTo(W - 40, y + 40); c.stroke();
      if (val) { c.save(); c.translate(120, y + 6); c.rotate(-0.03); c.fillStyle = '#1c2a5a'; c.font = `700 78px ${HAND}`; c.fillText(val, 0, 0); c.restore(); } });
    noiseFill(c, W, H, 0.05, 900); }));
  const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); const back = M(0xe0bc7a);
  g.add(mesh(new THREE.BoxGeometry(1.6, 0.96, 0.03), [back, back, back, back, std({ map: tex, roughness: 0.9, emissive: 0xffe8c0, emissiveMap: tex, emissiveIntensity: 0.15 }), back]));
  put(g, mesh(new THREE.TorusGeometry(0.07, 0.025, 6, 14), brass(), false), [-0.62, 0, 0.02]);
  put(g, mesh(new THREE.TorusGeometry(0.2, 0.012, 5, 16), M(0xc8302a), false), [-0.82, 0, 0], [0, 0, 0]);
  return g;
}
export function keyRing(S) { const g = new THREE.Group(); S.add(g); put(g, mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 18), brass()), [0, 0, 0], [Math.PI / 2, 0, 0]);
  [[0.2, 0.2, 0xd8a83a], [0.26, -0.5, 0xb8b8c0], [0.14, 1.0, 0xc87a3a]].forEach(([l, a, col]) => { const k = new THREE.Group(); k.rotation.y = a; g.add(k); put(k, mesh(new THREE.BoxGeometry(0.06, 0.03, 0.3 + l), M(col, { metalness: 0.8, roughness: 0.3 })), [0, 0, 0.3]); put(k, mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10), M(col, { metalness: 0.8, roughness: 0.3 })), [0, 0, 0.14]); put(k, mesh(new THREE.BoxGeometry(0.12, 0.03, 0.06), M(col, { metalness: 0.8, roughness: 0.3 })), [0.06, 0, 0.42 + l * 0.5]); });
  put(g, mesh(rb(0.22, 0.05, 0.34, 0.03), M(0xc8302a)), [-0.22, 0, 0.1], [0, 0.6, 0]); return g; }
export function teddy(S, col = 0xb8824a) { const g = new THREE.Group(); S.add(g); const m = std({ color: col, roughness: 1 }), l = std({ color: 0xe8cfa0, roughness: 1 });
  put(g, mesh(new THREE.SphereGeometry(0.42, 14, 10), m), [0, 0.45, 0]).scale.set(1, 1.1, 0.9); put(g, mesh(new THREE.SphereGeometry(0.34, 14, 10), m), [0, 1.08, 0]);
  for (const s of [-1, 1]) { put(g, mesh(new THREE.SphereGeometry(0.13, 8, 6), m), [s * 0.26, 1.38, 0]); put(g, mesh(new THREE.SphereGeometry(0.15, 8, 6), m), [s * 0.44, 0.62, 0.1]); put(g, mesh(new THREE.SphereGeometry(0.17, 8, 6), m), [s * 0.28, 0.14, 0.3]); put(g, new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), basic(0x1a1210)), [s * 0.13, 1.14, 0.3]); }
  put(g, mesh(new THREE.SphereGeometry(0.14, 8, 6), l), [0, 1.0, 0.28]); put(g, mesh(rb(0.5, 0.12, 0.3, 0.05), M(0xc8302a)), [0, 0.8, 0.12]); return g; }
export function coffeeCup(S, col = 0xfbf6ea) { const g = new THREE.Group(); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.48, 14), M(col)), [0, 0.24, 0]); put(g, mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.07, 14), M(0x3a2a22)), [0, 0.5, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.2, 14), M(0xb8703a)), [0, 0.24, 0]); return g; }
export function framedPhoto(S) { const g = new THREE.Group(); S.add(g);
  const tex = once('photo', () => ctex(256, 200, (c, w, h) => { c.fillStyle = '#c8dce8'; c.fillRect(0, 0, w, h); c.fillStyle = '#9ab87a'; c.fillRect(0, 140, w, 60);
    [[86, '#1c8a84', '#7a3a1a'], [166, '#1c2a52', '#2a1a12']].forEach(([x, shirt, hair], i) => { c.fillStyle = shirt; c.fillRect(x - 26, 108, 52, 62); c.fillStyle = '#e8b88a'; c.fillRect(x - 22, 60, 44, 46); c.fillStyle = hair; c.fillRect(x - 24, 52, 48, 16); if (!i) c.fillRect(x - 28, 56, 8, 44);
      c.fillStyle = '#1a1210'; c.fillRect(x - 11, 78, 5, 6); c.fillRect(x + 6, 78, 5, 6); c.strokeStyle = '#1a1210'; c.lineWidth = 3; c.beginPath(); c.arc(x, 88, 10, 0.2, Math.PI - 0.2); c.stroke(); });
    c.fillStyle = '#e8b88a'; c.fillRect(110, 118, 32, 10); noiseFill(c, w, h, 0.05, 400); }));
  g.add(mesh(rb(1.0, 0.82, 0.08, 0.04), M(0x6a3a1a))); put(g, new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.66), std({ map: tex, roughness: 0.5 })), [0, 0, 0.045]);
  put(g, mesh(new THREE.BoxGeometry(0.08, 0.7, 0.04), M(0x6a3a1a)), [0, -0.05, -0.2], [0.5, 0, 0]); return g; }
export function hourglass(S, { s = 1, light = 0 } = {}) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s);
  for (const y of [0, 1.5]) put(g, mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 18), brass()), [0, y + 0.05, 0]);
  for (let i = 0; i < 3; i++) { const a = i * 2.094; put(g, mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.42, 6), brass()), [Math.sin(a) * 0.4, 0.8, Math.cos(a) * 0.4]); }
  const glass = std({ color: 0xcfeaf0, transparent: true, opacity: 0.28, roughness: 0.05, depthWrite: false });
  put(g, new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.68, 18, 1, true), glass), [0, 1.14, 0], [Math.PI, 0, 0]); put(g, new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.68, 18, 1, true), glass), [0, 0.46, 0]);
  const gold = basic(0xffd060); const top = put(g, new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.56, 16), gold), [0, 1.12, 0], [Math.PI, 0, 0]); const bot = put(g, new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 16), gold), [0, 0.3, 0]);
  const stream = put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 5), gold), [0, 0.6, 0]);
  const halo = put(g, new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 10), basic(0xffc84a, { transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending })), [0, 0.8, 0]);
  const L = light ? new THREE.PointLight(0xffc860, light, 9, 1.6) : null; if (L) { L.position.set(0, 0.9, 0.5); g.add(L); }
  g.userData.update = (t, k = 0.5, glow = 1) => { const a = clamp01(k); top.scale.set(1 - a * 0.85, 1 - a * 0.85, 1 - a * 0.85); top.position.y = 0.84 + 0.28 * (1 - a * 0.85); bot.scale.setScalar(0.25 + a * 0.75); bot.position.y = 0.1 + 0.2 * (0.25 + a * 0.75);
    stream.visible = a > 0.01 && a < 0.99; halo.material.opacity = (0.1 + Math.sin(t * 2.4) * 0.03) * glow; halo.scale.setScalar(1 + Math.sin(t * 2.4) * 0.05); if (L) L.intensity = light * glow * (0.9 + Math.sin(t * 2.4) * 0.1); };
  g.userData.update(0, 0.5); g.userData.light = L; return g; }
export function portersCart(S, { col = 0xb8302a } = {}) { const g = new THREE.Group(); S.add(g); const iron = M(0x2a2a2e, { metalness: 0.6, roughness: 0.4 });
  put(g, mesh(rb(5.0, 0.25, 2.8, 0.06), tmat(woodTex(0x8a5a2e), 2, 1)), [0, 1.02, 0]); put(g, mesh(rb(5.2, 0.3, 3.0, 0.06), M(col)), [0, 0.78, 0]);
  const wheels = []; for (const x of [-1.8, 1.8]) for (const z of [-1.5, 1.5]) { const w = put(g, mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.2, 14), iron), [x, 0.46, z], [Math.PI / 2, 0, 0]); put(w, mesh(new THREE.BoxGeometry(0.7, 0.24, 0.08), brass()), [0, 0, 0]); wheels.push(w); }
  for (const z of [-1.25, 1.25]) put(g, mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.9, 6), iron), [-2.55, 2.3, z], [0, 0, 0.12]);
  put(g, mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.7, 6), brass()), [-2.72, 3.72, 0], [Math.PI / 2, 0, 0]);
  for (const z of [-1.4, 1.4]) put(g, mesh(new THREE.BoxGeometry(4.8, 0.08, 0.06), brass()), [0, 1.6, z]); for (const x of [-2.3, 0, 2.3]) for (const z of [-1.4, 1.4]) put(g, mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), iron), [x, 1.38, z]);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), std({ map: textTex('LOST PROPERTY', { w: 512, h: 128, font: '800 54px "Inter", sans-serif', bg: '#f4ecd8', fg: '#7a1a14', border: '#7a1a14' }) })), [0, 0.78, 1.52]);
  g.userData.roll = (dist) => wheels.forEach(w => { w.rotation.y = -dist / 0.46; }); g.userData.deck = 1.15; return g; }
// Mr. Abel's lost temper: a small furious red monster under a glass dome
export function temperJar(S, { s = 1, name = 'temper' } = {}) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s);
  put(g, mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.22, 24), tmat(woodTex(0x5a3418), 1, 1)), [0, 0.11, 0]);
  const inner = new THREE.Group(); inner.position.y = 0.22; g.add(inner);
  const m = monster(inner, { name, col: 0xe83a2a, belly: 0xff8a4a, shape: 'blob', eyes: 2, horns: true, teeth: true, arms: true, size: 0.36, seed: 5 });
  m.root.traverse(o => { if (o.isMesh) { delete o.userData.avatar; delete o.userData.part; } });
  const brows = [-1, 1].map(sx => put(m.body, mesh(new THREE.BoxGeometry(0.62, 0.14, 0.14), M(0x5a0a0a)), [sx * 0.5, 2.78, 1.2], [0, 0, sx * -0.5]));
  const dome = put(g, new THREE.Mesh(new THREE.SphereGeometry(0.92, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: 0xdff4ff, transparent: true, opacity: 0.2, roughness: 0.04, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide })), [0, 1.0, 0]);
  const wall = put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.8, 24, 1, true), dome.material), [0, 0.6, 0]);
  const knob = put(g, mesh(new THREE.SphereGeometry(0.1, 10, 8), brass()), [0, 1.95, 0]);
  const steam = [0, 1].map(i => put(g, new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), basic(0xffffff, { transparent: true, opacity: 0.7 })), [0, 0, 0]));
  const o = { g, m, dome, lid: [dome, wall, knob],
    update(t, mode = 'sulk', k = 1) { const rage = mode === 'rage' || mode === 'chomp'; m.animate(t, rage ? 'bounce' : 'idle'); m.root.position.x = rage ? Math.sin(t * 23) * 0.12 * k : 0; m.root.position.y = rage ? Math.abs(Math.sin(t * 11)) * 0.18 * k : 0;
      m.root.rotation.y = rage ? Math.sin(t * 7) * 0.5 : Math.sin(t * 1.2) * 0.2; g.rotation.z = rage ? Math.sin(t * 31) * 0.035 * k : 0; brows.forEach((b, i) => { b.position.y = 2.78 + (rage ? Math.sin(t * 13 + i) * 0.05 : 0); });
      steam.forEach((p, i) => { const u = (t * 1.6 + i * 0.5) % 1; p.visible = rage; p.position.set((i ? 0.3 : -0.3) + Math.sin(u * 4) * 0.05, 1.1 + u * 0.5, 0.2); p.scale.setScalar(0.5 + u * 1.2); p.material.opacity = 0.7 * (1 - u); }); } };
  return o; }
// the mayor's lost train of thought: a toy loco pulling fluffy thought-clouds round a loop
export function thoughtTrain(S, { n = 4, s = 1 } = {}) { const cars = []; const cloud = std({ color: 0xffffff, roughness: 1, emissive: 0xdfe8ff, emissiveIntensity: 0.35 });
  const icons = ['?', '!', '…', '?', '!'];
  for (let i = 0; i < n; i++) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); const body = new THREE.Group(); g.add(body);
    if (i === 0) { put(body, mesh(rb(1.3, 0.6, 0.8, 0.12), M(0xd8302a)), [0, 0.55, 0]); put(body, mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 14), M(0xf2c420)), [0.25, 0.95, 0], [0, 0, Math.PI / 2]); put(body, mesh(rb(0.5, 0.75, 0.78, 0.08), M(0xd8302a)), [-0.45, 1.1, 0]);
      put(body, mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.4, 8), M(0x2a2a2e)), [0.5, 1.45, 0]); put(body, new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), basic(0xfff2a0)), [0.74, 0.95, 0]); }
    else { put(body, mesh(rb(1.15, 0.3, 0.8, 0.08), M([0xf2c420, 0x2ab8a8, 0xf27a4a][i % 3])), [0, 0.45, 0]); const c = new THREE.Group(); c.position.set(0, 1.05, 0); body.add(c);
      [[0, 0, 0.42], [-0.34, -0.06, 0.3], [0.34, -0.06, 0.32], [0.1, 0.22, 0.3]].forEach(([x, y, r]) => put(c, mesh(new THREE.SphereGeometry(r, 12, 9), cloud), [x, y, 0]));
      const t = textTex(icons[i % icons.length], { w: 128, h: 128, bg: null, border: null, fg: '#5a2ab8', font: '900 96px "Inter", sans-serif' }); for (const sz of [1, -1]) put(c, new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), basic(0xffffff, { map: t, transparent: true })), [0, 0.02, sz * 0.44], [0, sz < 0 ? Math.PI : 0, 0]); g.userData.cloud = c; }
    const wh = []; for (const x of [-0.38, 0.38]) for (const z of [-0.42, 0.42]) wh.push(put(body, mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10), M(0x2a2a2e)), [x, 0.2, z], [Math.PI / 2, 0, 0])); g.userData.wh = wh; cars.push(g); }
  const puffs = [0, 1, 2].map(() => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), basic(0xffffff, { transparent: true, opacity: 0.8 })); S.add(p); return p; });
  return { cars, update(t, { cx = 0, cz = 0, rx = 4, rz = 2.5, lap = t * 0.25, y = 0 } = {}) {
    cars.forEach((g, i) => { const a = (lap - i * (1.55 * s) / (Math.PI * (rx + rz))) * Math.PI * 2; g.position.set(cx + Math.cos(a) * rx, y + Math.abs(Math.sin(t * 14 + i)) * 0.04, cz - Math.sin(a) * rz); g.rotation.y = Math.atan2(Math.cos(a) * rz, -Math.sin(a) * rx); g.userData.wh.forEach(w => { w.rotation.y = -t * 12; }); if (g.userData.cloud) { g.userData.cloud.position.y = 1.05 + Math.sin(t * 5 + i * 1.3) * 0.08; g.userData.cloud.scale.setScalar(1 + Math.sin(t * 4 + i) * 0.05); } });
    puffs.forEach((p, i) => { const u = (t * 1.5 + i / 3) % 1; const c0 = cars[0]; p.position.set(c0.position.x, c0.position.y + (1.7 + u * 1.2) * s, c0.position.z); p.scale.setScalar((0.6 + u * 1.5) * s); p.material.opacity = 0.8 * (1 - u); }); } }; }
export function pigeon(S, { s = 1 } = {}) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); const grey = M(0x8a90a0), dk = M(0x5a6070);
  const body = put(g, mesh(new THREE.SphereGeometry(0.3, 12, 9), grey), [0, 0.42, 0]); body.scale.set(0.85, 0.85, 1.25); const neck = new THREE.Group(); neck.position.set(0, 0.56, 0.24); g.add(neck);
  put(neck, mesh(new THREE.SphereGeometry(0.16, 10, 8), M(0x4a7a6a, { metalness: 0.4, roughness: 0.4 })), [0, 0.18, 0.04]); put(neck, mesh(new THREE.ConeGeometry(0.05, 0.16, 6), M(0xe8a83a)), [0, 0.17, 0.22], [Math.PI / 2, 0, 0]);
  for (const sx of [-1, 1]) put(neck, new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), basic(0xff7a2a)), [sx * 0.1, 0.22, 0.13]);
  const wings = [-1, 1].map(sx => { const w = new THREE.Group(); w.position.set(sx * 0.22, 0.5, 0); g.add(w); put(w, mesh(rb(0.08, 0.26, 0.62, 0.03), dk), [sx * 0.03, -0.06, -0.06]); return w; });
  put(g, mesh(rb(0.26, 0.05, 0.36, 0.02), dk), [0, 0.38, -0.46], [0.3, 0, 0]); const legs = [-1, 1].map(sx => put(g, mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5), M(0xe86a5a)), [sx * 0.1, 0.1, 0]));
  g.userData.update = (t, mode = 'peck', seed = 0) => { const u = t + seed; if (mode === 'fly') { wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (0.9 + Math.sin(u * 30) * 1.0); }); neck.rotation.x = 0.3; return; }
    wings.forEach(w => { w.rotation.z = 0; }); const peck = mode === 'peck' ? Math.max(0, Math.sin(u * 3.1)) ** 6 : 0; neck.rotation.x = peck * 1.3 + (mode === 'walk' ? Math.sin(u * 12) * 0.22 : 0); g.position.y = mode === 'walk' ? Math.abs(Math.sin(u * 12)) * 0.04 : 0; legs.forEach((l, i) => { l.rotation.x = mode === 'walk' ? Math.sin(u * 12 + i * Math.PI) * 0.6 : 0; }); };
  return g; }
export function hornSpeaker(S) { const g = new THREE.Group(); S.add(g); const grey = M(0x9aa0a8, { metalness: 0.5, roughness: 0.4 });
  put(g, mesh(new THREE.CylinderGeometry(0.16, 0.2, 9, 8), M(0x1c4a48)), [0, 4.5, 0]); const horns = [-1, 1].map(sx => { const h = new THREE.Group(); h.position.set(sx * 0.5, 8.6, 0); h.rotation.z = sx * -Math.PI / 2; h.rotation.y = 0; g.add(h);
    put(h, mesh(new THREE.ConeGeometry(0.75, 1.3, 18, 1, true), std({ color: 0x9aa0a8, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })), [0, 0.5, 0], [Math.PI, 0, 0]); put(h, mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 10), grey), [0, -0.2, 0]); return h; });
  const rings = []; for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 6, 24), basic(0xfff2c0, { transparent: true, opacity: 0.8, depthWrite: false })); r.rotation.y = Math.PI / 2; g.add(r); rings.push(r); }
  g.userData.ring = (t, k = 1) => { horns.forEach((h, i) => { h.scale.setScalar(1 + Math.sin(t * 40 + i) * 0.05 * k); }); rings.forEach((r, i) => { const sx = i % 2 ? 1 : -1; const u = (t * 1.3 + Math.floor(i / 2) / 3) % 1; r.visible = k > 0.05; r.position.set(sx * (1.6 + u * 3.2), 8.6, 0); r.scale.setScalar(0.8 + u * 2.2); r.material.opacity = 0.8 * (1 - u) * k; }); };
  g.userData.ring(0, 0); return g; }

// ---------- lost things for the shelves ----------
function tagOn(g, x, y, z) { const t = put(g, new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), std({ color: 0xe8c88a, side: THREE.DoubleSide })), [x, y, z]); t.userData.tag = true; return t; }
function lostItem(kind, R) { const g = new THREE.Group(); const cols = [0x8a4a2a, 0x2a6a8a, 0xb8302a, 0x3a7a4a, 0xd8a83a, 0x6a3a7a, 0x3a3a44, 0xc87a3a]; const col = cols[Math.floor(R() * cols.length)];
  if (kind === 0) { const w = 1.1 + R() * 0.5, h = 0.8 + R() * 0.4; put(g, mesh(rb(w, h, 0.5, 0.08), M(col)), [0, h / 2, 0]); for (const sx of [-0.3, 0.3]) put(g, mesh(new THREE.BoxGeometry(0.1, h + 0.02, 0.52), M(0x3a2414)), [sx * w, h / 2, 0]); put(g, mesh(new THREE.TorusGeometry(0.14, 0.03, 5, 10, Math.PI), M(0x2a1a10)), [0, h, 0]); tagOn(g, w * 0.3, h * 0.6, 0.27); }
  else if (kind === 1) { put(g, mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.55, 18), M(col)), [0, 0.28, 0]); put(g, mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.12, 18), M(0xf4ecd8)), [0, 0.6, 0]); tagOn(g, 0.2, 0.3, 0.51); }
  else if (kind === 2) { put(g, mesh(new THREE.CylinderGeometry(0.07, 0.03, 1.7, 8), M(col)), [0, 0.85, 0], [0, 0, 0.22]); put(g, mesh(new THREE.TorusGeometry(0.1, 0.025, 5, 10, Math.PI), M(0x3a2414)), [-0.28, 1.72, 0]); tagOn(g, -0.1, 1.1, 0.1); }
  else if (kind === 3) { const t = teddy(g, [0xb8824a, 0x8a5a3a, 0xe8cfa0][Math.floor(R() * 3)]); t.scale.setScalar(0.8); tagOn(g, 0.3, 0.5, 0.36); }
  else if (kind === 4) { put(g, mesh(new THREE.SphereGeometry(0.42, 16, 12), M([0x2a6ab8, 0xd8302a, 0xf2c420][Math.floor(R() * 3)], { roughness: 0.4 })), [0, 0.42, 0]); tagOn(g, 0.25, 0.2, 0.4); }
  else if (kind === 5) { for (let i = 0; i < 4; i++) put(g, mesh(rb(0.8 - i * 0.05, 0.16, 0.56, 0.02), M(cols[(i * 3 + Math.floor(R() * 8)) % 8])), [(R() - 0.5) * 0.1, 0.08 + i * 0.17, 0], [0, (R() - 0.5) * 0.4, 0]); tagOn(g, 0.2, 0.4, 0.3); }
  else if (kind === 6) { put(g, mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.5, 14), M(0x1a1a1e)), [0, 0.3, 0]); put(g, mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 18), M(0x1a1a1e)), [0, 0.05, 0]); put(g, mesh(new THREE.CylinderGeometry(0.31, 0.345, 0.1, 14), M(col)), [0, 0.13, 0]); tagOn(g, 0.3, 0.2, 0.36); }
  else if (kind === 7) { put(g, mesh(new THREE.SphereGeometry(0.36, 14, 10), M(0x3a8ab8, { roughness: 0.4 })), [0, 0.62, 0]); put(g, mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), brass()), [0, 0.2, 0]); put(g, mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.08, 12), brass()), [0, 0.04, 0]); put(g, mesh(new THREE.TorusGeometry(0.4, 0.02, 5, 20), brass()), [0, 0.62, 0], [0.4, 0, 0]); }
  else if (kind === 8) { for (const sx of [-0.22, 0.22]) { put(g, mesh(rb(0.3, 0.7, 0.34, 0.08), M(col)), [sx, 0.35, -0.05]); put(g, mesh(rb(0.3, 0.22, 0.62, 0.08), M(col)), [sx, 0.11, 0.1]); } tagOn(g, 0.1, 0.5, 0.2); }
  else { put(g, mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 14), brass()), [0, 0.03, 0]); for (let i = 0; i < 10; i++) { const a = i * 0.628; put(g, mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 4), brass(), false), [Math.sin(a) * 0.38, 0.5, Math.cos(a) * 0.38]); } put(g, mesh(new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: 0xd8a83a, metalness: 0.8, roughness: 0.3, wireframe: true })), [0, 0.95, 0]); put(g, mesh(new THREE.SphereGeometry(0.1, 8, 6), M(0xf2c420)), [0, 0.4, 0]); }
  return g; }

// ---------- LOST PROPERTY office ----------
export function lostHall(S, { time = 'evening', h = 5, m = 50 } = {}) {
  const morning = time === 'morning';
  S.background = new THREE.Color(0x100c0a);
  box(S, [27, 0.3, 27], [0, -0.15, 3], tmat(checkerTex('#1c4a48', '#efe6d0'), 5, 5, { roughness: 0.45, metalness: 0.05 }), { r: 0, cast: false, name: 'floor' });
  const lower = (rx) => tmat(glazedTex(0x1c6a64), rx, 2.2, { roughness: 0.3 }), upper = (rx) => tmat(plasterTex(0xe8dcc0), rx, 2);
  const wallPair = (size, pos, rx, name, horiz) => { const [w, , d] = size; box(S, horiz ? [w, 4.2, d] : [w, 4.2, d], [pos[0], 2.1, pos[2]], lower(rx), { r: 0, cast: false, name }); box(S, [w, 7.8, d], [pos[0], 8.1, pos[2]], upper(rx / 2), { r: 0, cast: false, name });
    const trim = horiz ? [w, 0.22, d + 0.16] : [w + 0.16, 0.22, d]; box(S, trim, [pos[0], 4.25, pos[2]], M(0x3a2414), { r: 0.04, cast: false, solid: false }); };
  wallPair([27, 12, 0.4], [0, 6, -10.2], 9, 'back wall', true);
  wallPair([0.4, 12, 27], [-13.2, 6, 3], 9, 'left wall', false);
  // right wall with the cart doorway (z 0..4, y 0..7)
  wallPair([0.4, 12, 10.2], [13.2, 6, -5.1], 3.4, 'right wall', false); wallPair([0.4, 12, 12.2], [13.2, 6, 10.1], 4, 'right wall', false);
  box(S, [0.4, 5, 4], [13.2, 9.5, 2], upper(1), { r: 0, cast: false, name: 'right wall' }); box(S, [0.7, 7.3, 0.4], [13.1, 3.65, -0.1], M(0x3a2414), { r: 0.04, cast: false, solid: false }); box(S, [0.7, 7.3, 0.4], [13.1, 3.65, 4.1], M(0x3a2414), { r: 0.04, cast: false, solid: false }); box(S, [0.7, 0.4, 4.6], [13.1, 7.2, 2], M(0x3a2414), { r: 0.04, cast: false, solid: false });
  box(S, [6, 8, 6], [17.5, 4, 2], M(0x2a1e16), { r: 0, cast: false, solid: false }); const corr = new THREE.PointLight(0xffb070, 10, 10, 1.6); corr.position.set(15.5, 5, 2); S.add(corr);
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.6), std({ map: textTex('CARTS', { w: 256, h: 64, font: '800 40px "Inter", sans-serif' }), emissive: 0x3a2a10, emissiveIntensity: 0.4 })), [12.95, 7.9, 2], [0, -Math.PI / 2, 0]);
  // ceiling + beams
  box(S, [27, 0.4, 27], [0, 12.2, 3], tmat(woodTex(0x4a2e18), 4, 4), { r: 0, cast: false, solid: false }); for (const z of [-6, 0, 6, 12]) box(S, [27, 0.7, 0.6], [0, 11.7, z], M(0x3a2414), { r: 0.04, cast: false, solid: false });
  // front wall with a double door (x ±2.2, y 0..7.6)
  const fw = (w, x) => { box(S, [w, 4.2, 0.4], [x, 2.1, 16.2], lower(w / 3), { r: 0, cast: false, name: 'front wall' }); box(S, [w, 7.8, 0.4], [x, 8.1, 16.2], upper(w / 6), { r: 0, cast: false, name: 'front wall' }); };
  fw(11, -7.7); fw(11, 7.7); box(S, [4.4, 4.4, 0.4], [0, 9.8, 16.2], upper(1), { r: 0, cast: false, name: 'front wall' });
  const outside = put(S, new THREE.Mesh(new THREE.PlaneGeometry(14, 12), basic(morning ? 0xffe8c0 : 0xffa860)), [0, 5, 19.5], [0, Math.PI, 0]);
  const leaves = [-1, 1].map(sx => { const p = new THREE.Group(); p.position.set(sx * 2.2, 0, 16.05); S.add(p); put(p, mesh(rb(2.15, 7.5, 0.18, 0.05), tmat(woodTex(0x1c4a48), 1, 2)), [-sx * 1.1, 3.75, 0]);
    put(p, new THREE.Mesh(new THREE.PlaneGeometry(1.4, 3.0), std({ color: 0xfff0d0, emissive: morning ? 0xffe8c0 : 0xffa860, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 })), [-sx * 1.1, 5.0, -0.1], [0, Math.PI, 0]); put(p, mesh(new THREE.SphereGeometry(0.12, 8, 6), brass()), [-sx * 1.9, 3.5, -0.18]); return p; });
  for (const x of [-7.5, 7.5]) { put(S, new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.6), std({ color: 0xfff0d0, emissive: morning ? 0xffe8c0 : 0xffa860, emissiveIntensity: 1.0 })), [x, 7.2, 15.95], [0, Math.PI, 0]);
    for (const dx of [-1.1, 0, 1.1]) box(S, [0.16, 4.8, 0.14], [x + dx, 7.2, 15.9], M(0x3a2414), { r: 0, cast: false, solid: false }); box(S, [4.7, 0.16, 0.14], [x, 7.2, 15.9], M(0x3a2414), { r: 0, cast: false, solid: false }); }
  const door = { open(k) { leaves.forEach((p, i) => { p.rotation.y = (i ? -1 : 1) * k * 1.75; }); } };
  const doorSun = new THREE.SpotLight(morning ? 0xffe2b0 : 0xff9a50, morning ? 260 : 60, 60, 0.42, 0.6, 1.4); doorSun.position.set(0, 9, 30); doorSun.target.position.set(0, 0, 2); S.add(doorSun, doorSun.target);
  // arched window in the left wall + evening shafts
  const winCol = morning ? 0xfff2d8 : 0xffb870;
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6), std({ color: 0xffffff, emissive: winCol, emissiveIntensity: 1.5 })), [-12.95, 7.2, 0], [0, Math.PI / 2, 0]);
  put(S, new THREE.Mesh(new THREE.CircleGeometry(3.2, 24, 0, Math.PI), std({ color: 0xffffff, emissive: winCol, emissiveIntensity: 1.5 })), [-12.95, 10.2, 0], [0, Math.PI / 2, 0]);
  for (const z of [-3.2, -1.6, 0, 1.6, 3.2]) box(S, [0.2, z === 0 ? 9.2 : 6.6, 0.16], [-12.9, z === 0 ? 8.8 : 7.4, z], M(0x2a1a10), { r: 0, cast: false, solid: false }); for (const y of [4.2, 6.2, 8.2, 10.2]) box(S, [0.2, 0.16, 6.6], [-12.9, y, 0], M(0x2a1a10), { r: 0, cast: false, solid: false });
  const sun = new THREE.SpotLight(morning ? 0xffe6c0 : 0xff9848, morning ? 420 : 520, 70, 0.34, 0.5, 1.3); sun.position.set(-30, 17, 4); sun.target.position.set(1, 1, -3.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.001; S.add(sun, sun.target);
  const shafts = [0, 1, 2].map(i => { const sh = put(S, new THREE.Mesh(new THREE.PlaneGeometry(22, 2.2), basic(morning ? 0xfff0d0 : 0xffb060, { transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), [-3.5, 4.6, -2.6 + i * 2.6], [0.25 * (i - 1), 0, -0.36]); return sh; });
  S.add(new THREE.HemisphereLight(morning ? 0xfff0dc : 0xffd8b0, 0x3a2a22, morning ? 0.95 : 0.6));
  // shelves on the back wall
  const wood = tmat(woodTex(0x6a4022), 3, 1), woodV = tmat(woodTex(0x5a3418), 1, 3);
  for (const x of [-12.6, -8.1, -3.6, 0.9, 5.4, 9.9, 12.6]) box(S, [0.3, 11.2, 1.6], [x, 5.6, -9.25], woodV, { r: 0.03, name: 'shelf post' });
  for (const y of [0.4, 2.6, 4.8, 7.0, 9.2, 11.1]) box(S, [25.4, 0.22, 1.6], [0, y - 0.11, -9.25], wood, { r: 0.03, name: 'shelf' });
  const R = rng(21); const tags = [];
  const bays = [-10.35, -5.85, -1.35, 3.15, 7.65, 11.25];
  bays.forEach((bx, bi) => [0.4, 2.6, 4.8, 7.0, 9.2].forEach((sy, si) => { if (bi === 3 && si === 2) return; const n = bi === 5 ? 1 : 2 + (R() > 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) { const it = lostItem(Math.floor(R() * 10), R); const span = bi === 5 ? 1.4 : 3.4; it.position.set(bx - span / 2 + (i + 0.5) * span / n + (R() - 0.5) * 0.25, sy, -9.15 + (R() - 0.5) * 0.3); it.rotation.y = (R() - 0.5) * 0.7; it.scale.setScalar(0.95 + R() * 0.35); S.add(it);
      it.traverse(o => { if (o.userData.tag) tags.push(o); }); } }));
  const slot = [3.15, 4.8, -9.15];
  put(S, mesh(new THREE.BoxGeometry(1.4, 0.3, 0.04), brass()), [3.15, 4.56, -8.42]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.2), basic(0xf4ecd8)), [3.15, 4.56, -8.39]);
  // counter
  box(S, [10.4, 3.0, 1.6], [-1, 1.5, -2.8], tmat(woodTex(0x6a3a1a), 4, 1, { roughness: 0.5 }), { r: 0.06, name: 'counter' });
  box(S, [10.8, 0.16, 1.9], [-1, 3.0, -2.8], tmat(woodTex(0x3a1e0e), 4, 1, { roughness: 0.3 }), { r: 0.05, solid: false });
  for (let i = 0; i < 4; i++) box(S, [2.2, 2.0, 0.08], [-4.75 + i * 2.5, 1.6, -1.98], tmat(woodTex(0x7a4a26), 1, 1), { r: 0.04, cast: false, solid: false });
  put(S, mesh(new THREE.CylinderGeometry(0.07, 0.07, 10.2, 8), brass()), [-1, 0.45, -1.75], [0, 0, Math.PI / 2]);
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), std({ map: textTex('CLAIMS', { w: 256, h: 64, font: '800 40px "Inter", sans-serif' }), roughness: 0.5 })), [-1, 2.72, -1.93]);
  // counter things
  const bellG = new THREE.Group(); bellG.position.set(1.3, 3.08, -2.6); S.add(bellG); put(bellG, mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.06, 16), M(0x2a1a10)), [0, 0.03, 0]); put(bellG, mesh(new THREE.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), brass()), [0, 0.06, 0]); const bellBtn = put(bellG, mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 8), brass()), [0, 0.42, 0]);
  put(S, mesh(rb(1.3, 0.14, 0.95, 0.03), M(0x7a1a14)), [-3.3, 3.15, -2.7], [0, 0.15, 0]); put(S, mesh(rb(1.2, 0.04, 0.85, 0.01), M(0xf4ecd8)), [-3.3, 3.24, -2.7], [0, 0.15, 0]);
  const bl = new THREE.Group(); bl.position.set(-5.3, 3.08, -2.9); S.add(bl); put(bl, mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 14), brass()), [0, 0.04, 0]); put(bl, mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), brass()), [0, 0.55, 0]);
  put(bl, mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.9, 12, 1, false, 0, Math.PI), std({ color: 0x1c8a5a, roughness: 0.3, emissive: 0x0a4a2a, emissiveIntensity: 0.5, side: THREE.DoubleSide })), [0, 1.1, 0.1], [0, -Math.PI / 2, Math.PI / 2]);
  put(bl, new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), basic(0xfff2c0)), [0, 1.02, 0.1]); const blL = new THREE.PointLight(0xffd890, 7, 8, 1.6); blL.position.set(-5.2, 3.9, -2.4); S.add(blL);
  put(S, mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 10), M(0x2a1a10)), [2.3, 3.11, -2.5]); put(S, mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 4), M(0x9a9aa0, { metalness: 0.8 })), [2.3, 3.45, -2.5]);
  for (let i = 0; i < 5; i++) put(S, mesh(new THREE.BoxGeometry(0.42, 0.015, 0.26), M(0xe8c88a)), [2.3, 3.2 + i * 0.07, -2.5], [0, i * 0.7, 0]);
  const mic = new THREE.Group(); mic.position.set(3.4, 3.08, -2.7); S.add(mic); put(mic, mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 14), M(0x2a2a2e)), [0, 0.05, 0]); put(mic, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 6), M(0x9a9aa0, { metalness: 0.8, roughness: 0.3 })), [0, 0.42, -0.06], [-0.2, 0, 0]);
  put(mic, mesh(rb(0.36, 0.5, 0.26, 0.1), M(0xb8b8c0, { metalness: 0.8, roughness: 0.3 })), [0, 0.95, -0.14]); put(mic, mesh(new THREE.TorusGeometry(0.26, 0.03, 6, 16), brass()), [0, 0.95, -0.14]);
  // hanging sign + clock + pendant lamps
  const signT = textTex('LOST PROPERTY', { w: 1024, h: 220, font: '800 118px "Inter", sans-serif' });
  box(S, [6.6, 1.4, 0.2], [-2.6, 9.9, -2.8], [0, 1, 2, 3, 4, 5].map(i => i === 4 ? std({ map: signT, emissive: 0xffffff, emissiveMap: signT, emissiveIntensity: 0.35, roughness: 0.5 }) : M(0x143a38)), { r: 0, cast: false, solid: false });
  for (const x of [-5.4, 0.2]) put(S, mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 4), M(0x1a1a1a), false), [x, 11.3, -2.8]);
  const clock = stationClock(S, [2.9, 8.5, -6.0], { r: 1.35, rod: 2.0 }); clock.set(h, m);
  const lamps = []; for (const [x, z] of [[-3.6, -3.2], [0.9, -3.2], [5.6, -3.2], [-6, 6], [6, 7]]) { put(S, mesh(new THREE.CylinderGeometry(0.02, 0.02, 4.2, 4), M(0x1a1a1a), false), [x, 9.9, z]);
    put(S, mesh(new THREE.ConeGeometry(0.85, 0.7, 18, 1, true), std({ color: 0x1c6a50, metalness: 0.3, roughness: 0.35, side: THREE.DoubleSide })), [x, 7.75, z]); put(S, new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), basic(0xfff0c8)), [x, 7.45, z]);
    const p = new THREE.PointLight(0xffc880, morning ? 9 : 17, 17, 1.6); p.position.set(x, 7.0, z); S.add(p); lamps.push(p); }
  const key = new THREE.PointLight(0xffe2c0, morning ? 14 : 11, 16, 1.6); key.position.set(-0.5, 6.2, 1.5); S.add(key);
  // customer side: bench, trunks, coat stand, queue posts, notice board
  box(S, [1.6, 0.3, 6], [-11.8, 1.5, 6.5], tmat(woodTex(0x7a4a26), 1, 3), { r: 0.06, name: 'bench' }); for (const z of [4, 9]) box(S, [1.4, 1.4, 0.3], [-11.8, 0.7, z], M(0x2a2a2e), { r: 0.04, name: 'bench leg' }); box(S, [0.25, 2.2, 6], [-12.7, 2.6, 6.5], tmat(woodTex(0x7a4a26), 1, 3), { r: 0.06, solid: false });
  box(S, [3.0, 1.8, 2.0], [10.6, 0.9, 7.4], tmat(woodTex(0x5a3a22), 1, 1), { r: 0.1, name: 'trunk' }); box(S, [2.4, 1.3, 1.7], [10.7, 2.45, 7.3], M(0x2a5a7a), { r: 0.1, name: 'trunk' }); box(S, [1.6, 1.4, 1.4], [8.4, 0.7, 8.6], M(0x8a3a2a), { r: 0.1, name: 'trunk', rot: [0, 0.3, 0] });
  for (const sx of [-0.8, 0.8]) put(S, mesh(new THREE.BoxGeometry(0.14, 1.34, 1.74), brass()), [10.7 + sx, 2.45, 7.3]);
  const cs = new THREE.Group(); cs.position.set(10.8, 0, -6.2); S.add(cs); put(cs, mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.4, 8), M(0x3a2414)), [0, 3.2, 0]); put(cs, mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.14, 12), M(0x3a2414)), [0, 0.07, 0]);
  for (let i = 0; i < 4; i++) put(cs, mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 5), M(0x3a2414)), [Math.sin(i * 1.57) * 0.3, 6.1, Math.cos(i * 1.57) * 0.3], [Math.cos(i * 1.57) * 0.9, 0, -Math.sin(i * 1.57) * 0.9]);
  put(cs, mesh(rb(1.0, 2.6, 0.5, 0.2), M(0x8a6a3a)), [0.25, 4.4, 0.35]); put(cs, mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 14), M(0x2a2a30)), [-0.3, 6.1, 0.35]);
  const nb = textTex(['RULE 1', 'ONLY THE OWNER', 'MAY CLAIM IT'], { w: 512, h: 384, bg: '#f4ecd8', fg: '#3a2414', border: '#7a1a14', font: '800 50px "Inter", sans-serif' });
  box(S, [3.2, 2.4, 0.12], [8.4, 6.4, -9.96 + 1.62], M(0x6a3a1a), { r: 0.03, cast: false, solid: false }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.1), std({ map: nb, roughness: 0.9 })), [8.4, 6.4, -8.26]);
  // dust motes in the shafts
  const motes = []; const mm = basic(0xfff0d0, { transparent: true, opacity: 0.55 }); for (let i = 0; i < 60; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.022 + (i % 3) * 0.01, 5, 4), mm); p.userData.o = [-9 + R() * 14, 2 + R() * 7, -6 + R() * 9, R() * 6]; S.add(p); motes.push(p); }
  return { clock, key, lamps, door, slot, sun, bell: [1.3, 3.08, -2.6], mic: [3.4, 4.5, -2.92], top: 3.08, bellBtn,
    ding(t, t0) { const u = t - t0; bellBtn.position.y = 0.42 - (u > 0 && u < 0.12 ? 0.07 : 0); bellG.rotation.z = u > 0 && u < 0.5 ? Math.sin(u * 60) * 0.03 * (1 - u * 2) : 0; },
    update(t) { clock.update(t); motes.forEach(p => { const [a, b, c, s] = p.userData.o; p.position.set(a + Math.sin(t * 0.4 + s) * 0.4, b + Math.sin(t * 0.27 + s * 2) * 0.5, c + Math.cos(t * 0.3 + s) * 0.3); });
      tags.forEach((g, i) => { g.rotation.z = Math.sin(t * 1.6 + i * 1.7) * 0.18; }); shafts.forEach((s, i) => { s.material.opacity = 0.06 + Math.sin(t * 0.5 + i * 2) * 0.015; }); lamps.forEach((p, i) => { p.intensity = (morning ? 9 : 17) * (1 + Math.sin(t * 9 + i * 3) * 0.015); }); } };
}

// ---------- the NIGHT TRAIN ----------
export function nightTrain(S, { cars = 3 } = {}) {
  const g = new THREE.Group(); S.add(g); const navy = tmat(rivetTex(0x1c2a52), 2, 1, { roughness: 0.45, metalness: 0.25 }), navyP = M(0x1c2a52, { roughness: 0.45, metalness: 0.25 }), gold = brass(), iron = M(0x1a1a20, { metalness: 0.6, roughness: 0.45 }), red = M(0xb8302a, { roughness: 0.5 });
  const wheels = []; const mkWheel = (x, r, z) => { const w = new THREE.Group(); w.position.set(x, r - 1.1, z); g.add(w); put(w, mesh(new THREE.CylinderGeometry(r, r, 0.3, 24), iron), [0, 0, 0], [Math.PI / 2, 0, 0]); put(w, mesh(new THREE.TorusGeometry(r * 0.92, 0.09, 6, 24), red), [0, 0, 0.14]);
    for (let i = 0; i < 4; i++) put(w, mesh(new THREE.BoxGeometry(r * 1.8, 0.14, 0.1), red), [0, 0, 0.16], [0, 0, i * Math.PI / 4]); put(w, mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.5, 10), gold), [0, 0, 0.1], [Math.PI / 2, 0, 0]); w.userData.r = r; wheels.push(w); return w; };
  // loco: frame, boiler, cab
  put(g, mesh(rb(16, 0.6, 4.6, 0.1), iron), [0, 3.1, 0]);
  put(g, mesh(new THREE.CylinderGeometry(2.25, 2.25, 8.4, 28), navyP), [2.6, 5.7, 0], [0, 0, Math.PI / 2]); put(g, mesh(new THREE.SphereGeometry(2.25, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), navyP), [6.8, 5.7, 0], [0, 0, -Math.PI / 2]).scale.set(1, 0.55, 1);
  for (const x of [-1.2, 1.4, 4.0, 6.6]) put(g, mesh(new THREE.TorusGeometry(2.27, 0.07, 6, 28), gold, false), [x, 5.7, 0], [0, Math.PI / 2, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.7, 14), iron), [5.2, 8.6, 0]); put(g, mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.3, 14), gold), [5.2, 9.5, 0]); put(g, mesh(new THREE.SphereGeometry(0.85, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), gold), [1.8, 7.75, 0]);
  const lamp = put(g, new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), basic(0xfff2c0)), [8.0, 6.2, 0]); put(g, mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 14), gold), [7.75, 6.2, 0], [0, 0, Math.PI / 2]);
  const lampL = new THREE.PointLight(0xffe0a0, 30, 26, 1.6); lampL.position.set(9.6, 6.2, 0); g.add(lampL);
  put(g, mesh(new THREE.BoxGeometry(3.4, 1.6, 4.9), red), [7.6, 2.4, 0], [0, 0, 0.5]);   // cow-catcher
  const plate = textTex('NIGHT TRAIN', { w: 1024, h: 180, bg: '#141e3e', fg: '#f2c860', border: '#f2c860', font: '800 110px "Inter", sans-serif' });
  for (const sz of [1, -1]) put(g, new THREE.Mesh(new THREE.PlaneGeometry(6.2, 1.1), std({ map: plate, roughness: 0.4, emissive: 0xffffff, emissiveMap: plate, emissiveIntensity: 0.25 })), [2.6, 5.9, sz * 2.3], [0, sz < 0 ? Math.PI : 0, 0]);
  for (const sz of [1, -1]) { put(g, mesh(rb(9.5, 0.2, 0.9, 0.05), iron), [2.6, 3.5, sz * 2.6]); put(g, mesh(rb(5.4, 1.2, 0.3, 0.1), navyP), [1.6, 3.2, sz * 2.45]); }
  mkWheel(-0.5, 2.0, 2.45); mkWheel(3.7, 2.0, 2.45); mkWheel(-0.5, 2.0, -2.45); mkWheel(3.7, 2.0, -2.45); mkWheel(6.9, 1.0, 2.45); mkWheel(6.9, 1.0, -2.45); mkWheel(-5.4, 1.2, 2.45); mkWheel(-5.4, 1.2, -2.45);
  const rod = put(g, mesh(rb(5.0, 0.26, 0.14, 0.05), M(0xb8b8c0, { metalness: 0.8, roughness: 0.3 })), [1.6, 0.9, 2.82]);
  // cab x -8..-1.6, floor 3.4, roof 10
  const C = (size, pos) => put(g, mesh(new THREE.BoxGeometry(...size), navy), pos);
  C([6.4, 0.3, 5.2], [-4.8, 3.4 - 0.15, 0]); C([6.4, 6.6, 0.2], [-4.8, 6.7, -2.5]); C([0.2, 6.6, 5.2], [-1.7, 6.7, 0]); C([0.2, 6.6, 5.2], [-7.9, 6.7, 0]);
  C([4.6, 2.8, 0.2], [-3.9, 4.8, 2.5]); C([6.4, 1.2, 0.2], [-4.8, 9.4, 2.5]); C([0.6, 2.6, 0.2], [-5.9, 7.5, 2.5]); C([0.8, 2.6, 0.2], [-2.0, 7.5, 2.5]); C([0.3, 5.4, 0.2], [-7.85, 6.1, 2.5]);
  put(g, mesh(rb(7.2, 0.4, 6.0, 0.2), iron), [-4.8, 10.2, 0]); put(g, mesh(new THREE.BoxGeometry(3.3, 0.14, 0.3), gold), [-4.0, 6.15, 2.6]); put(g, mesh(new THREE.BoxGeometry(6.4, 0.2, 0.24), gold), [-4.8, 3.9, 2.58]);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.4), basic(0x2a1c14)), [-4.8, 6.7, -2.38]); put(g, new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.0), basic(0xffb060)), [-4.2, 7.4, -2.36]);
  const cabL = new THREE.PointLight(0xffc080, 16, 9, 1.6); cabL.position.set(-4.2, 8.6, 1.2); g.add(cabL);
  for (const [y, z] of [[1.2, 3.1], [2.3, 2.9]]) put(g, mesh(rb(1.5, 0.16, 0.7, 0.04), iron), [-7.0, y - 0.08, z]);
  for (const x of [-7.75, -6.25]) put(g, mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 6), gold), [x, 5.3, 2.72]);
  const whistleG = new THREE.Group(); whistleG.position.set(-3.2, 10.4, 0.8); g.add(whistleG); put(whistleG, mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 8), gold), [0, 0.35, 0]);
  const jets = [0, 1, 2, 3].map(() => put(whistleG, new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), basic(0xffffff, { transparent: true, opacity: 0.85, depthWrite: false })), [0, 0.8, 0]));
  const puffs = [0, 1, 2, 3, 4, 5, 6].map(() => put(g, new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), std({ color: 0xfff4ea, emissive: 0xffd8b8, emissiveIntensity: 0.5, transparent: true, opacity: 0.7, depthWrite: false, roughness: 1 })), [5.2, 10, 0]));
  const hiss = [0, 1, 2, 3].map(() => put(g, new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), basic(0xffffff, { transparent: true, opacity: 0.5, depthWrite: false })), [5, 0.6, 3.4]));
  // cars
  let mailDoor = null; const winMat = std({ color: 0xfff0c8, emissive: 0xffc870, emissiveIntensity: 1.2 });
  for (let i = 0; i < cars; i++) { const cx = -8 - 0.9 - 9 - i * 18.9; const c = new THREE.Group(); c.position.x = cx; g.add(c);
    put(c, mesh(rb(18, 7.8, 5.2, 0.25), navy), [0, 4.7, 0]); put(c, mesh(rb(18.3, 0.5, 5.6, 0.2), iron), [0, 8.8, 0]); put(c, mesh(rb(17.6, 0.5, 4.6, 0.1), iron), [0, 0.6, 0]);
    for (const sz of [1, -1]) { put(c, mesh(new THREE.BoxGeometry(18.05, 0.22, 0.1), gold), [0, 3.6, sz * 2.62]); put(c, mesh(new THREE.BoxGeometry(18.05, 0.12, 0.1), gold), [0, 7.9, sz * 2.62]); }
    for (const x of [-6.5, 6.5]) for (const z of [-2.3, 2.3]) for (const dx of [-1.1, 1.1]) mkWheel(cx + x + dx, 0.95, z);
    put(c, mesh(new THREE.BoxGeometry(0.9, 0.5, 1.0), iron), [9.4, 1.6, 0]);
    if (i === 0) { const lp = textTex('LOST PROPERTY', { w: 1024, h: 160, bg: '#141e3e', fg: '#f2c860', border: null, font: '800 104px "Inter", sans-serif' }); put(c, new THREE.Mesh(new THREE.PlaneGeometry(7.4, 1.1), std({ map: lp, roughness: 0.5, emissive: 0xffffff, emissiveMap: lp, emissiveIntensity: 0.2 })), [-4.4, 5.9, 2.63]);
      put(c, new THREE.Mesh(new THREE.PlaneGeometry(4.2, 6.2), basic(0xffb868)), [3.6, 4.4, 2.615]); for (let k = 0; k < 5; k++) put(c, mesh(rb(0.9 + (k % 2) * 0.4, 0.8, 0.5, 0.05), M([0x8a5a2e, 0x6a3a1a, 0xb8824a][k % 3])), [2.4 + (k % 3) * 1.0, 1.8 + Math.floor(k / 3) * 0.85, 2.5]);
      mailDoor = put(c, mesh(rb(4.5, 6.5, 0.2, 0.06), tmat(rivetTex(0x24346a), 1, 1.5, { roughness: 0.45, metalness: 0.25 })), [3.6, 4.4, 2.76]); put(mailDoor, mesh(new THREE.BoxGeometry(0.14, 1.2, 0.14), gold), [-1.8, 0, 0.12]); put(c, mesh(new THREE.BoxGeometry(9.6, 0.16, 0.2), iron), [5.6, 7.75, 2.8]); }
    else for (let k = 0; k < 5; k++) { put(c, new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.4), winMat), [-7 + k * 3.5, 5.7, 2.615]); put(c, new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.4), winMat), [-7 + k * 3.5, 5.7, -2.615], [0, Math.PI, 0]); } }
  const o = { g, lamp, lampL, cabL, wheels, cabDoor: new THREE.Vector3(-7.0, 3.4, 2.2), driver: new THREE.Vector3(-4.2, 3.4, 0.5),
    update(t, { dist = 0, steam = 0.5, whistle = 0, door = 0 } = {}) {
      wheels.forEach(w => { w.rotation.z = -dist / w.userData.r; }); const a = -dist / 2.0; rod.position.set(1.6 + Math.cos(a + 1.57) * 1.1, 0.9 + Math.sin(a + 1.57) * 1.1, 2.82);
      puffs.forEach((p, i) => { const u = (t * 0.45 + i / 7) % 1; p.position.set(5.2 - u * (3 + steam * 5), 10 + u * (5 + steam * 3), Math.sin(i * 2.3 + u * 3) * 0.6); p.scale.setScalar((0.5 + u * 2.4) * (0.5 + steam)); p.material.opacity = 0.75 * (1 - u) * Math.min(1, steam * 2); });
      hiss.forEach((p, i) => { const u = (t * 1.1 + i / 4) % 1; p.position.set(4.6 + (i % 2) * 1.2, 0.5 + u * 1.2, 3.2 + u * 2.4); p.scale.setScalar(0.4 + u * 1.8); p.material.opacity = 0.5 * (1 - u) * clamp01(steam * 1.5 - 0.3); });
      jets.forEach((p, i) => { const u = (t * 2.6 + i / 4) % 1; p.visible = whistle > 0.02; p.position.set(Math.sin(i * 2 + u) * 0.5 * u, 0.8 + u * 5.5 * whistle, 0); p.scale.setScalar((0.4 + u * 1.5) * whistle); p.material.opacity = 0.85 * (1 - u); });
      if (mailDoor) mailDoor.position.x = 3.6 + door * 4.4; lamp.scale.setScalar(1 + Math.sin(t * 20) * 0.02); } };
  o.update(0, {}); return o;
}

// ---------- the platform ----------
export function grandStation(S, { time = 'sunset', sign = '9', clockX = 0, train = true, trainX = 20, h = 5, m = 57, cars = 3 } = {}) {
  const day = time === 'day', dusk = time === 'dusk';
  const skyT = ctex(16, 512, (c, w, hh) => { const g = c.createLinearGradient(0, 0, 0, hh); if (day) { g.addColorStop(0, '#5a96e0'); g.addColorStop(1, '#dff0ff'); } else if (dusk) { g.addColorStop(0, '#141a3a'); g.addColorStop(0.6, '#4a3a6a'); g.addColorStop(1, '#c86a5a'); } else { g.addColorStop(0, '#3a4a8a'); g.addColorStop(0.45, '#e88a5a'); g.addColorStop(0.8, '#ffc86a'); g.addColorStop(1, '#ffe2a0'); } c.fillStyle = g; c.fillRect(0, 0, w, hh); }); skyT.wrapS = skyT.wrapT = THREE.ClampToEdgeWrapping;
  S.background = skyT; const haze = day ? 0xdfeaf4 : dusk ? 0x5a4a6a : 0xffb880; S.fog = new THREE.Fog(haze, 45, 210);
  // floors
  box(S, [170, 1.2, 19], [5, -0.6, 4.5], tmat(paverTex(), 40, 5, { roughness: 0.7 }), { r: 0, cast: false, name: 'platform' });
  box(S, [170, 0.06, 0.5], [5, 0.02, -4.1], M(0xf2c420), { r: 0, cast: false, solid: false }); box(S, [170, 0.3, 0.5], [5, -0.14, -4.76], M(0xf4f0e6), { r: 0.04, cast: false, solid: false });
  box(S, [170, 0.4, 8], [5, -1.5, -9], M(0x3a322c, { roughness: 1 }), { r: 0, cast: false, solid: false });
  for (const z of [-6.55, -9.45]) box(S, [170, 0.2, 0.22], [5, -1.2, z], M(0x8a8a92, { metalness: 0.8, roughness: 0.35 }), { r: 0, cast: false, solid: false });
  const slp = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.16, 4.4), M(0x4a3222), 84); const mx = new THREE.Matrix4(); for (let i = 0; i < 84; i++) { mx.setPosition(-80 + i * 2.0, -1.28, -8); slp.setMatrixAt(i, mx); } slp.receiveShadow = true; S.add(slp);
  box(S, [170, 1.2, 8], [5, -0.6, -17], tmat(paverTex(), 40, 2), { r: 0, cast: false, solid: false });
  // arcade wall behind + camera-side wall
  const arc = ctex(512, 512, (c, w, hh) => { c.drawImage(brickTex(0x8a4630).image, 0, 0, w, hh); c.drawImage(brickTex(0x8a4630).image, 0, 0, w / 2, hh / 2); c.drawImage(brickTex(0x8a4630).image, w / 2, 0, w / 2, hh / 2); c.drawImage(brickTex(0x8a4630).image, 0, hh / 2, w / 2, hh / 2); c.drawImage(brickTex(0x8a4630).image, w / 2, hh / 2, w / 2, hh / 2);
    c.fillStyle = '#d8ccb4'; c.fillRect(0, 0, w, 26); c.fillRect(0, hh - 60, w, 60); const g = c.createLinearGradient(0, 110, 0, 420); if (day) { g.addColorStop(0, '#bfe0ff'); g.addColorStop(1, '#f4faff'); } else if (dusk) { g.addColorStop(0, '#2a2a5a'); g.addColorStop(1, '#8a5a6a'); } else { g.addColorStop(0, '#ffb060'); g.addColorStop(1, '#ffe6a8'); }
    c.fillStyle = '#d8ccb4'; c.beginPath(); c.moveTo(126, 440); c.lineTo(126, 230); c.arc(256, 230, 130, Math.PI, 0); c.lineTo(386, 440); c.fill(); c.fillStyle = g; c.beginPath(); c.moveTo(142, 440); c.lineTo(142, 230); c.arc(256, 230, 114, Math.PI, 0); c.lineTo(370, 440); c.fill();
    c.strokeStyle = '#2a2420'; c.lineWidth = 7; for (const x of [199, 256, 313]) { c.beginPath(); c.moveTo(x, 120); c.lineTo(x, 440); c.stroke(); } for (const y of [230, 300, 370]) { c.beginPath(); c.moveTo(142, y); c.lineTo(370, y); c.stroke(); } });
  const arcM = (rx) => { const t = arc.clone(); t.repeat.set(rx, 1); t.needsUpdate = true; return std({ map: t, roughness: 0.8, emissive: day ? 0x8a9aa8 : dusk ? 0x3a2a4a : 0xc8703a, emissiveMap: t, emissiveIntensity: day ? 0.25 : 0.42 }); };
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(170, 20), arcM(10)), [5, 10, -21]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(170, 20), arcM(10)), [5, 10, 14.5], [0, Math.PI, 0]);
  // iron-and-glass roof (half cylinder along x, axis y 6, z -3.25, radius 17.9)
  const glassT = ctex(256, 512, (c, w, hh) => { const g = c.createLinearGradient(0, 0, 0, hh); if (day) { g.addColorStop(0, '#dff0ff'); g.addColorStop(0.5, '#9ac8f4'); g.addColorStop(1, '#dff0ff'); } else if (dusk) { g.addColorStop(0, '#5a4a7a'); g.addColorStop(0.5, '#1e2448'); g.addColorStop(1, '#5a4a7a'); } else { g.addColorStop(0, '#ffc070'); g.addColorStop(0.5, '#e87a6a'); g.addColorStop(1, '#ffc070'); } c.fillStyle = g; c.fillRect(0, 0, w, hh);
    for (let i = 0; i < 9; i++) { c.fillStyle = day ? 'rgba(255,255,255,0.75)' : dusk ? 'rgba(120,110,160,0.5)' : 'rgba(255,226,190,0.7)'; const x = Math.random() * w, y = 120 + Math.random() * 270; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + k * 16 - 24, y + Math.sin(k * 2) * 6, 22, 11, 0, 0, 7); c.fill(); } }
    c.strokeStyle = 'rgba(26,22,20,0.9)'; c.lineWidth = 4; for (let y = 0; y <= hh; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.lineWidth = 3; for (let x = 0; x <= w; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, hh); c.stroke(); } }, [40, 1]);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(17.9, 17.9, 170, 40, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshBasicMaterial({ map: glassT, side: THREE.BackSide, fog: false })); roof.rotation.z = Math.PI / 2; roof.rotation.y = 0; roof.position.set(5, 6, -3.25); S.add(roof);
  const ironM = M(0x1e2a2a, { metalness: 0.5, roughness: 0.5 });
  for (let x = -66; x <= 76; x += 14.2) { const a = new THREE.Mesh(new THREE.TorusGeometry(17.6, 0.32, 6, 30, Math.PI), ironM); a.rotation.y = Math.PI / 2; a.position.set(x, 6, -3.25); S.add(a); for (const z of [-20.7, 14.2]) put(S, mesh(new THREE.BoxGeometry(0.7, 6.2, 0.7), ironM, false), [x, 3.1, z]); }
  for (const [y, z] of [[23.6, -3.25], [20.4, 6.2], [20.4, -12.7], [14.4, 12.1], [14.4, -18.6]]) put(S, mesh(new THREE.BoxGeometry(170, 0.3, 0.3), ironM, false), [5, y, z]);
  // +x end: open arch, sun, clouds; -x end: brick wall with the LOST PROPERTY doorway
  if (!day) put(S, new THREE.Mesh(new THREE.CircleGeometry(dusk ? 6 : 9, 32), basic(dusk ? 0xff9a7a : 0xfff0b0, { fog: false })), [190, dusk ? 3 : 13, -6], [0, -Math.PI / 2, 0]);
  const cl = new THREE.Group(); S.add(cl); const cm = new THREE.MeshBasicMaterial({ color: day ? 0xffffff : dusk ? 0x8a6a9a : 0xffd0b0, fog: false }); const R = rng(9);
  for (let i = 0; i < 9; i++) { const c = new THREE.Group(); c.position.set(150 + R() * 30, 12 + R() * 34, -52 + R() * 96); cl.add(c); for (let k = 0; k < 5; k++) put(c, new THREE.Mesh(new THREE.SphereGeometry(3 + R() * 3, 8, 6), cm), [0, (R() - 0.5) * 2, (k - 2) * 4.5]).scale.y = 0.6; }
  const endM = tmat(brickTex(0x8a4630), 9, 6); box(S, [0.8, 26, 36], [-58.4, 13, -3.25], endM, { r: 0, cast: false, name: 'end wall' });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(6, 5.4), basic(0xffd088)), [-57.95, 2.7, 5], [0, Math.PI / 2, 0]); put(S, new THREE.Mesh(new THREE.CircleGeometry(3, 24, 0, Math.PI), basic(0xffd088)), [-57.95, 5.4, 5], [0, Math.PI / 2, 0]);
  for (const z of [2, 8]) box(S, [0.5, 5.6, 0.5], [-57.8, 2.8, z], M(0xd8ccb4), { r: 0.05, cast: false, solid: false }); { const a = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.28, 6, 24, Math.PI), M(0xd8ccb4)); a.rotation.y = Math.PI / 2; a.position.set(-57.8, 5.4, 5); S.add(a); }
  for (const z of [3.5, 5, 6.5]) box(S, [0.12, 8.2, 0.12], [-57.9, 4.1, z], M(0x2a1a10), { r: 0, cast: false, solid: false }); box(S, [0.12, 0.12, 6], [-57.9, 5.4, 5], M(0x2a1a10), { r: 0, cast: false, solid: false });
  const lpT = textTex('LOST PROPERTY', { w: 1024, h: 200, font: '800 112px "Inter", sans-serif' }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.6), std({ map: lpT, emissive: 0xffffff, emissiveMap: lpT, emissiveIntensity: 0.7 })), [-57.9, 10.2, 5], [0, Math.PI / 2, 0]);
  const doorL = new THREE.PointLight(0xffc070, 30, 22, 1.6); doorL.position.set(-54.5, 4.5, 5); S.add(doorL);
  // hanging clock + platform sign + speakers
  const clock = stationClock(S, [clockX, 11, 3], { r: 1.5, cube: true, rod: 9 }); clock.set(h, m);
  const psT = textTex('PLATFORM ' + sign, { w: 1024, h: 220, bg: '#143a38', font: '800 124px "Inter", sans-serif' }); const psM = std({ map: psT, emissive: 0xffffff, emissiveMap: psT, emissiveIntensity: 0.4, roughness: 0.5 });
  const ps = new THREE.Group(); ps.position.set(clockX - 9, 9.2, 3); S.add(ps); ps.add(mesh(new THREE.BoxGeometry(7.4, 1.5, 0.2), [0, 1, 2, 3, 4, 5].map(i => i >= 4 ? psM : M(0x143a38)))); for (const x of [-3, 3]) put(ps, mesh(new THREE.CylinderGeometry(0.04, 0.04, 9, 4), ironM, false), [x, 5.2, 0]);
  const speaker = hornSpeaker(S); speaker.position.set(clockX + 6, 0, 9.5);
  // lamps, benches, trunks, mail sacks
  const globes = []; for (let x = -52; x <= 70; x += 14.2) for (const z of [12.6, -14.6]) { put(S, mesh(new THREE.CylinderGeometry(0.12, 0.18, 6.6, 8), ironM), [x + 7, 3.3, z]); const gl = put(S, new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), basic(day ? 0xf4f0e0 : 0xffe6b0)), [x + 7, 7.0, z]); globes.push(gl); }
  const lampLs = day ? [] : [-14, 14].map(dx => { const p = new THREE.PointLight(0xffd090, dusk ? 46 : 22, 30, 1.6); p.position.set(clockX + dx, 7.2, 11.6); S.add(p); return p; });
  for (const x of [clockX - 20, clockX + 18]) { box(S, [5, 0.3, 1.4], [x, 1.5, 12.6], tmat(woodTex(0x7a4a26), 2, 1), { r: 0.06, name: 'bench' }); box(S, [5, 2.0, 0.25], [x, 2.7, 13.3], tmat(woodTex(0x7a4a26), 2, 1), { r: 0.06, solid: false }); for (const dx of [-2.1, 2.1]) box(S, [0.3, 1.4, 1.3], [x + dx, 0.7, 12.6], ironM, { r: 0.04, solid: false }); }
  for (const [x, z, c, s] of [[clockX - 13.5, 12.2, 0x5a3a22, 1], [clockX - 11.6, 12.4, 0x2a5a7a, 0.8], [clockX + 11, 12.3, 0x8a3a2a, 0.9], [clockX + 26, 12, 0x3a7a4a, 1]]) box(S, [2.2 * s, 1.5 * s, 1.5 * s], [x, 0.75 * s, z], M(c), { r: 0.1, name: 'trunk' });
  for (const [x, z] of [[clockX + 12.6, 11.2], [clockX - 26, 12.2], [clockX + 30, 12.4]]) { const sk = put(S, mesh(new THREE.SphereGeometry(0.9, 12, 10), std({ color: 0xc8b890, roughness: 1 })), [x, 0.85, z]); sk.scale.set(1, 1.15, 0.9); put(S, mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.4, 8), std({ color: 0xc8b890, roughness: 1 })), [x, 1.95, z]); }
  const pigeons = [[clockX - 4, 10.2], [clockX - 2.6, 11], [clockX + 3.5, 10.6]].map(([x, z], i) => { const p = pigeon(S); p.position.set(x, 0, z); p.rotation.y = i * 2.1; return p; });
  // light
  S.add(new THREE.HemisphereLight(day ? 0xdfeeff : dusk ? 0x6a78c8 : 0xffcfa0, day ? 0x6a6058 : 0x3a2a3a, day ? 1.15 : dusk ? 0.5 : 0.85));
  const sun = new THREE.DirectionalLight(day ? 0xfff2dc : dusk ? 0xc87a8a : 0xff9a50, day ? 2.6 : dusk ? 0.8 : 3.0); const sOff = day ? [14, 34, 16] : [44, 15, 12]; sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 140 }); S.add(sun, sun.target);
  const fillL = new THREE.DirectionalLight(day ? 0xbfd8ff : 0x8a9aff, day ? 0.5 : 0.45); fillL.position.set(-10, 8, 14); S.add(fillL);
  const key = new THREE.PointLight(day ? 0xfff4e4 : 0xffd8b0, day ? 6 : dusk ? 16 : 12, 22, 1.6); S.add(key);
  const tr = train ? nightTrain(S, { cars }) : null; if (tr) { tr.g.position.set(trainX - 8, 0, -8); }
  const env = { clock, speaker, pigeons, sun, key, train: tr, lampLs,
    follow(x, z = 0) { sun.target.position.set(x, 0, z); sun.position.set(x + sOff[0], sOff[1], z + sOff[2]); sun.target.updateMatrixWorld(); key.position.set(x + 2, 6.5, z + 7); },
    update(t, o = {}) { clock.update(t); pigeons.forEach((p, i) => p.userData.update(t, 'peck', i * 1.7)); cl.position.z = Math.sin(t * 0.05) * 3; if (tr) tr.update(t, o); globes.forEach((g, i) => { g.scale.setScalar(1 + Math.sin(t * 7 + i) * 0.012); }); } };
  env.follow(clockX); return env;
}

// ---------- inside the loco cab + the mail car ----------
function sceneryTex() { return once('scenery', () => { const t = ctex(1024, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a5a9a'); g.addColorStop(0.5, '#e88a5a'); g.addColorStop(0.82, '#ffd27a'); g.addColorStop(1, '#ffe6a8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,230,200,0.75)'; for (let i = 0; i < 7; i++) { const x = Math.random() * w, y = 30 + Math.random() * 80; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + k * 22, y + Math.sin(k) * 5, 26, 10, 0, 0, 7); c.fill(); } }
    c.fillStyle = '#6a3a5a'; let x = 0; while (x < w) { const bw = 30 + Math.random() * 60, bh = 40 + Math.random() * 90; c.fillRect(x, h - bh - 30, bw, bh + 30); c.fillStyle = '#ffd890'; for (let k = 0; k < 4; k++) if (Math.random() > 0.4) c.fillRect(x + 6 + (k % 2) * (bw * 0.45), h - bh - 20 + Math.floor(k / 2) * 22, 7, 10); c.fillStyle = '#6a3a5a'; x += bw + Math.random() * 14; }
    c.fillStyle = '#3a2238'; c.fillRect(0, h - 34, w, 34); for (let px = 20; px < w; px += 128) { c.fillRect(px, h - 110, 6, 110); c.fillStyle = '#fff0b0'; c.beginPath(); c.arc(px + 3, h - 112, 8, 0, 7); c.fill(); c.fillStyle = '#3a2238'; } }); return t; }); }
export function trainCab(S) {
  S.background = new THREE.Color(0x0e0a10);
  box(S, [11.4, 0.3, 18.4], [0, -0.15, 5], tmat(steelTex(0x4a5058), 3, 5, { roughness: 0.5, metalness: 0.4 }), { r: 0, cast: false, name: 'floor' });
  box(S, [11.4, 0.4, 18.4], [0, 9.2, 5], tmat(rivetTex(0x16203e), 3, 5), { r: 0, cast: false, solid: false }); for (const z of [-2, 2, 6, 10]) box(S, [11, 0.3, 0.3], [0, 8.85, z], M(0x10182e), { r: 0.03, cast: false, solid: false });
  const navy = (rx, ry) => tmat(rivetTex(0x1c2a52), rx, ry, { roughness: 0.5, metalness: 0.2 }), wain = (rx) => tmat(woodTex(0x6a3a1a), rx, 1, { roughness: 0.5 });
  // back wall with two windows (x ±0.7..3.9, y 3.6..7.4)
  box(S, [11.4, 3.3, 0.3], [0, 1.65, -4.15], wain(4), { r: 0, cast: false, name: 'back wall' }); box(S, [11.4, 0.3, 0.3], [0, 3.45, -4.15], navy(4, 0.2), { r: 0, cast: false, name: 'back wall' }); box(S, [11.4, 1.6, 0.3], [0, 8.2, -4.15], navy(4, 0.5), { r: 0, cast: false, name: 'back wall' });
  for (const [x, w] of [[-4.75, 1.9], [0, 1.4], [4.75, 1.9]]) box(S, [w, 3.8, 0.3], [x, 5.5, -4.15], navy(w / 3, 1), { r: 0, cast: false, name: 'back wall' });
  for (const x of [-2.3, 2.3]) { for (const y of [3.6, 7.4]) put(S, mesh(new THREE.BoxGeometry(3.4, 0.16, 0.4), brass()), [x, y, -4.1]); for (const dx of [-1.6, 1.6]) put(S, mesh(new THREE.BoxGeometry(0.16, 3.9, 0.4), brass()), [x + dx, 5.5, -4.1]); }
  const scT = sceneryTex().clone(); scT.repeat.set(0.22, 1); scT.needsUpdate = true; const view = put(S, new THREE.Mesh(new THREE.PlaneGeometry(22, 9), new THREE.MeshBasicMaterial({ map: scT })), [0, 5.6, -8.5]);
  const posts = [0, 1, 2].map(() => put(S, new THREE.Mesh(new THREE.BoxGeometry(0.3, 12, 0.3), basic(0x2a1a2a)), [0, 5, -6]));
  // side walls: left with the sliding door to the mail car, right with windshield + console
  box(S, [0.3, 9, 2.6], [-5.65, 4.5, -2.7], navy(1, 2), { r: 0, cast: false, name: 'left wall' }); box(S, [0.3, 9, 12.4], [-5.65, 4.5, 7.8], navy(4, 2), { r: 0, cast: false, name: 'left wall' }); box(S, [0.3, 1.6, 3.0], [-5.65, 8.2, 0.1], navy(1, 0.4), { r: 0, cast: false, name: 'left wall' });
  const doorG = new THREE.Group(); doorG.position.set(-5.5, 0, 0.1); S.add(doorG); put(doorG, mesh(rb(0.2, 7.5, 3.2, 0.05), tmat(rivetTex(0x2a3a6e), 1, 2, { roughness: 0.45, metalness: 0.3 })), [0, 3.75, 0]);
  put(doorG, mesh(new THREE.TorusGeometry(0.55, 0.09, 8, 20), brass()), [0.12, 5.2, 0], [0, Math.PI / 2, 0]); put(doorG, new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), basic(0xffc070)), [0.115, 5.2, 0], [0, Math.PI / 2, 0]); put(doorG, mesh(new THREE.BoxGeometry(0.16, 1.0, 0.14), brass()), [0.16, 3.6, 1.1]);
  const mailT = textTex('MAIL', { w: 256, h: 96, font: '800 64px "Inter", sans-serif' }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.7), std({ map: mailT, emissive: 0xffffff, emissiveMap: mailT, emissiveIntensity: 0.3 })), [-5.48, 8.1, 0.1], [0, Math.PI / 2, 0]);
  box(S, [0.3, 3.6, 18.4], [5.65, 1.8, 5], navy(5, 1), { r: 0, cast: false, name: 'right wall' }); box(S, [0.3, 1.6, 18.4], [5.65, 8.2, 5], navy(5, 0.4), { r: 0, cast: false, name: 'right wall' }); box(S, [0.3, 3.8, 9.6], [5.65, 5.5, 9.4], navy(3, 1), { r: 0, cast: false, name: 'right wall' });
  for (const z of [-3.9, 0.1, 4.4]) box(S, [0.4, 3.9, 0.4], [5.6, 5.5, z], M(0x10182e), { r: 0.04, cast: false, solid: false });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(8.4, 3.8), basic(0xffc070)), [6.4, 5.5, 0.3], [0, -Math.PI / 2, 0]);
  box(S, [1.7, 3.2, 8.0], [4.6, 1.6, 0.5], tmat(rivetTex(0x24346a), 1, 3, { roughness: 0.45, metalness: 0.3 }), { r: 0.08, name: 'console' }); box(S, [1.9, 0.14, 8.2], [4.55, 3.27, 0.5], tmat(woodTex(0x3a1e0e), 1, 3), { r: 0.04, solid: false });
  const gauges = []; for (let i = 0; i < 4; i++) { const gz = -2.4 + i * 1.5; put(S, mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 20), brass()), [5.3, 4.0, gz], [0, 0, Math.PI / 2]); put(S, new THREE.Mesh(new THREE.CircleGeometry(0.36, 20), basic(0xfff0c8)), [5.23, 4.0, gz], [0, -Math.PI / 2, 0]);
    const n = new THREE.Group(); n.position.set(5.21, 4.0, gz); n.rotation.y = -Math.PI / 2; S.add(n); put(n, new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.3, 0.01), basic(0xc8302a)), [0, 0.13, 0]); gauges.push(n); }
  const brakeP = new THREE.Group(); brakeP.position.set(4.3, 3.3, 3.2); S.add(brakeP); put(brakeP, mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 8), M(0x9a9aa0, { metalness: 0.8, roughness: 0.3 })), [0, 0.95, 0]); put(brakeP, mesh(new THREE.SphereGeometry(0.24, 12, 10), M(0xc8302a, { roughness: 0.3 })), [0, 1.95, 0]);
  const thr = new THREE.Group(); thr.position.set(4.3, 3.3, 1.9); S.add(thr); put(thr, mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), brass()), [0, 0.6, 0]); put(thr, mesh(new THREE.SphereGeometry(0.16, 10, 8), brass()), [0, 1.25, 0]); thr.rotation.x = 0.4;
  put(S, mesh(new THREE.TorusGeometry(0.5, 0.07, 8, 20), M(0xc8302a)), [4.2, 3.9, -1.6], [0, Math.PI / 2, 0.3]); put(S, mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 10), M(0x2a6a5a)), [4.4, 3.8, 0.4]); put(S, mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 10), M(0xd8d8de, { metalness: 0.7, roughness: 0.3 })), [4.4, 4.35, 0.4]);
  for (const z of [-0.2, 1.0]) { const c = coffeeCup(S, 0x2a5a8a); c.position.set(4.25, 3.34, z); c.scale.setScalar(0.9); }
  // bench under the windows, stove, lantern, photo, calendar, pipes, toolbox
  box(S, [6.8, 0.3, 1.3], [-1.5, 1.55, -3.25], tmat(woodTex(0x7a4a26), 3, 1, { roughness: 0.5 }), { r: 0.06, name: 'bench' }); for (const x of [-4.6, -1.5, 1.6]) box(S, [0.3, 1.4, 1.2], [x, 0.7, -3.25], M(0x2a2a2e), { r: 0.04, name: 'bench leg' });
  put(S, mesh(rb(6.6, 0.16, 1.1, 0.07), M(0x8a2a2a)), [-1.5, 1.74, -3.25]);
  box(S, [1.7, 3.0, 1.5], [4.4, 1.5, -3.15], M(0x2a2a30, { metalness: 0.5, roughness: 0.5 }), { r: 0.1, name: 'stove' }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), basic(0xff7a2a)), [4.4, 1.3, -2.38]); for (const dx of [-0.3, 0, 0.3]) put(S, mesh(new THREE.BoxGeometry(0.07, 0.85, 0.06), M(0x1a1a1e)), [4.4 + dx, 1.3, -2.36]);
  put(S, mesh(new THREE.CylinderGeometry(0.3, 0.3, 6, 10), M(0x2a2a30, { metalness: 0.5 })), [4.6, 6, -3.4]);
  const fire = new THREE.PointLight(0xff7a30, 14, 9, 1.6); fire.position.set(4.3, 1.6, -1.6); S.add(fire);
  const lan = new THREE.Group(); lan.position.set(0.4, 8.9, 0.6); S.add(lan); put(lan, mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), M(0x1a1a1a), false), [0, -0.6, 0]); put(lan, mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.16, 10), brass(), false), [0, -1.24, 0]); put(lan, mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.14, 10), brass(), false), [0, -1.92, 0]);
  put(lan, new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.56, 10), basic(0xffe2a0)), [0, -1.58, 0]); const lanL = new THREE.PointLight(0xffc880, 20, 15, 1.6); lanL.position.set(0, -1.9, 0); lan.add(lanL);
  const ph = framedPhoto(S); ph.position.set(0, 5.6, -3.95); ph.scale.setScalar(1.1);
  const calT = ctex(256, 320, (c, w, h) => { c.fillStyle = '#f4ecd8'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8302a'; c.fillRect(0, 0, w, 56); c.strokeStyle = '#8a8a8a'; c.lineWidth = 1; for (let r = 0; r < 5; r++) for (let i = 0; i < 6; i++) { const x = 14 + i * 39, y = 70 + r * 48; c.strokeRect(x, y, 34, 42); c.strokeStyle = '#1c2a5a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 5, y + 6); c.lineTo(x + 29, y + 36); c.moveTo(x + 29, y + 6); c.lineTo(x + 5, y + 36); c.stroke(); c.strokeStyle = '#8a8a8a'; c.lineWidth = 1; } });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), std({ map: calT, roughness: 0.9 })), [-4.75, 5.6, -3.98]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.4), std({ color: 0xe8dcc0, roughness: 0.9 })), [4.75, 5.8, -3.98]);
  for (const [y, z] of [[8.5, -3.2], [8.3, -2.6]]) put(S, mesh(new THREE.CylinderGeometry(0.12, 0.12, 11, 8), M(0x8a5a3a, { metalness: 0.7, roughness: 0.35 }), false), [0, y, z], [0, 0, Math.PI / 2]);
  box(S, [1.4, 0.7, 0.8], [2.8, 0.35, -3.3], M(0xb8302a), { r: 0.06, name: 'toolbox' });
  S.add(new THREE.HemisphereLight(0xffd0a8, 0x2a2030, 0.6)); const sun = new THREE.DirectionalLight(0xff9a50, 2.2); sun.position.set(-5, 7, -16); S.add(sun);
  const key = new THREE.PointLight(0xffe6cc, 16, 18, 1.6); key.position.set(0, 6, 5.5); S.add(key);
  const env = { key, fire, lanL, lan, view,
    door: { open(k) { doorG.position.z = 0.1 - k * 3.1; } }, brake(k) { brakeP.rotation.x = -0.45 + k * 1.05; },
    update(t, { dist = 0, sway = 0 } = {}) { scT.offset.x = dist * 0.012; posts.forEach((p, i) => { const u = ((dist * 0.09 + i / 3) % 1 + 1) % 1; p.position.x = 9 - u * 18; p.visible = dist !== 0 || i === 0; });
      fire.intensity = 14 + Math.sin(t * 13) * 2.5 + Math.sin(t * 7.3) * 2; lan.rotation.z = Math.sin(t * 2.1) * (0.03 + sway * 0.12); lan.rotation.x = Math.cos(t * 1.7) * sway * 0.06; gauges.forEach((n, i) => { n.rotation.z = -0.8 + i * 0.5 + Math.sin(t * (3 + i) + i) * 0.08 + sway * 0.6; }); } };
  env.brake(0); env.update(0); return env;
}
export function letterCar(S, { front = true } = {}) {
  const R = rng(4); const rack = (rx, ry) => tmat(rackTex(), rx, ry, { roughness: 0.9 }); const SZ = () => front ? (R() > 0.5 ? 1 : -1) : -1;
  box(S, [24.4, 0.3, front ? 8.8 : 18.6], [-18, -0.15, front ? 0 : 4.9], tmat(woodTex(0x5a3a22), 6, front ? 2 : 4), { r: 0, cast: false, name: 'car floor' }); box(S, [24.4, 0.4, front ? 8.8 : 18.6], [-18, 9.2, front ? 0 : 4.9], tmat(woodTex(0x3a2414), 6, 2), { r: 0, cast: false, solid: false });
  box(S, [24.4, 9, 0.4], [-18, 4.5, -4.4], rack(6, 2.2), { r: 0, cast: false, name: 'car wall' }); if (front) box(S, [24.4, 9, 0.4], [-18, 4.5, 4.4], rack(6, 2.2), { r: 0, cast: false, name: 'car wall' }); box(S, [0.4, 9, front ? 8.8 : 18.6], [-30.2, 4.5, front ? 0 : 4.9], rack(front ? 2.2 : 4.4, 2.2), { r: 0, cast: false, name: 'car wall' });
  box(S, [0.3, 9, 2.7], [-5.95, 4.5, -3.0], rack(0.7, 2.2), { r: 0, cast: false, solid: false }); if (front) box(S, [0.3, 9, 2.7], [-5.95, 4.5, 3.0], rack(0.7, 2.2), { r: 0, cast: false, solid: false });
  // loose envelopes: instanced, sticking out of the racks + drifts on the floor + stacks
  const em = std({ map: envTex('Mara', false), roughness: 0.9 }); const N = 900; const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.03, 0.6), em, N); inst.castShadow = false; inst.receiveShadow = true; const o = new THREE.Object3D();
  for (let i = 0; i < N; i++) { const kind = i % 3; const x = -29.6 + R() * 23.2;
    if (kind === 0) { const sz = SZ(); o.position.set(x, 0.6 + R() * 8.2, sz * (4.05 - R() * 0.25)); o.rotation.set((R() - 0.5) * 0.5, sz > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI / 2 + (R() - 0.5) * 0.6); }
    else if (kind === 1) { const sz = SZ(); const d = R(); o.position.set(x, 0.05 + (1 - d) * (1.6 + Math.sin(x * 1.3) * 0.8) + R() * 0.1, sz * (3.9 - d * 2.1)); o.rotation.set((R() - 0.5) * 0.7, R() * 6.28, (R() - 0.5) * 0.7 + sz * 0.5); }
    else { o.position.set(x, 0.03 + R() * 0.06, front ? (R() - 0.5) * 3.4 : -1.8 + R() * 7); o.rotation.set(0, R() * 6.28, 0); }
    o.scale.setScalar(0.85 + R() * 0.4); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); } S.add(inst);
  const heap = std({ color: 0xe6dcc4, roughness: 1 }); for (let i = 0; i < 14; i++) { const sz = front ? (i % 2 ? 1 : -1) : -1; const hm = put(S, mesh(new THREE.SphereGeometry(1, 12, 8), heap), [-29 + i * 1.75 + R(), 0, sz * (3.4 + R() * 0.4)]); hm.scale.set(1.6 + R(), 1.1 + R() * 1.3, 1.1); }
  for (let i = 0; i < 9; i++) { const sz = front ? (i % 2 ? 1 : -1) : -1; const x = -28.5 + i * 2.6 + R(); const hgt = 2 + Math.floor(R() * 9); for (let k = 0; k < hgt; k++) { const b = put(S, mesh(rb(1.0, 0.42, 0.66, 0.04), M(0xf0e6ce)), [x + (R() - 0.5) * 0.12, 0.25 + k * 0.44, sz * 2.75 + (R() - 0.5) * 0.1], [0, (R() - 0.5) * 0.3, 0]); put(b, mesh(new THREE.BoxGeometry(1.02, 0.44, 0.05), M(0xc8302a), false), [0, 0, 0]); put(b, mesh(new THREE.BoxGeometry(0.05, 0.44, 0.68), M(0xc8302a), false), [0, 0, 0]); } }
  for (const [x, z] of [[-8.2, -3.0], [-27.5, front ? 2.6 : -2.6], [-21, -3.1]]) { const sk = put(S, mesh(new THREE.SphereGeometry(0.95, 12, 10), std({ color: 0xc8b890, roughness: 1 })), [x, 0.9, z]); sk.scale.set(1, 1.2, 0.9); put(S, mesh(new THREE.CylinderGeometry(0.3, 0.5, 0.45, 8), std({ color: 0xc8b890, roughness: 1 })), [x, 2.1, z]); }
  const lamps = [-10, -17.5, -25].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 9, 0); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 4), M(0x1a1a1a), false), [0, -0.65, 0]); put(g, mesh(new THREE.ConeGeometry(0.6, 0.5, 14, 1, true), std({ color: 0x1c6a50, side: THREE.DoubleSide, roughness: 0.4 })), [0, -1.4, 0]);
    put(g, new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), basic(0xfff0c8)), [0, -1.6, 0]); const p = new THREE.PointLight(0xffc880, 22, 15, 1.6); p.position.set(0, -2.0, 0); g.add(p); g.userData.p = p; return g; });
  const fall = []; for (let i = 0; i < 10; i++) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.02, 0.6), em); e.userData.o = [-28 + R() * 20, front ? (R() - 0.5) * 5 : -3 + R() * 5, R() * 10, 0.5 + R() * 0.5]; S.add(e); fall.push(e); }
  S.add(new THREE.AmbientLight(0xffd8b0, 0.25));
  return { lamps, update(t, { sway = 0.3 } = {}) { lamps.forEach((g, i) => { g.rotation.z = Math.sin(t * 1.9 + i) * 0.05 * (0.4 + sway); g.rotation.x = Math.cos(t * 1.5 + i * 2) * 0.04 * sway; });
    fall.forEach((e, i) => { const [x, z, ph, sp] = e.userData.o; const u = ((t * 0.16 * sp + ph) % 1); e.position.set(x + Math.sin(u * 9 + i) * 0.6, 8.8 - u * 8.7, z + Math.cos(u * 7 + i) * 0.5); e.rotation.set(Math.sin(u * 11 + i) * 0.8, u * 5 + i, Math.cos(u * 9) * 0.6); }); } };
}
