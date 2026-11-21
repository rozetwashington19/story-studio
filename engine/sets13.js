// Episode 012 kit (Candle Dragons): living flame dragons, flames/torches/candles that can go out, a birthday cake, castle props,
// and four new castle environments. All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   flame(parent, { s, col, core })  teardrop flame (unlit, blooms) · .update(t) flicker · .set(k) size 0..1 (0 = out) · .group
//   torch(S, [x,y,z], { ry, lit, light, dist })  iron wall sconce + torch (sticks out toward its facing ry) · .set(k) · .update(t) · .tip (world Vector3) · .light
//   candle(S, [x,y,z], { h, r, col, lit, light })  wax candle · .set(k) · .update(t) · .tip
//   cake(S, [x,y,z], { n, s })  two-tier birthday cake with n candles on top · .candles · .set(k) all · .update(t) · .group (top of top tier y ≈ 1.25·s)
//   flameDragon(S, { name, s, body, belly, light, seed })  cute glowing fire dragon (s=1: ≈4 long, 3 tall; faces +Z, feet on y=0)
//       .root · .update(t, mode 'fly'|'hover'|'perch'|'roar'|'curl'|'eat', k) · .look(vec3) · .jaw(k) · .breath(k) · .glow(k) · .blink(k) · .mouth() world pos
//   spark(S, { col, s })  glowing ember (for dragons turning into sparks) · .group · .set(pos, k)
//   shield(S, col)  kite shield prop (hold at a hand; front +Z) · flourSack(S, [x,y,z], { s, open })  · marshmallowStick(S) (.toast(k), .group) · loaf(S, [x,y,z], k toast)
//   castleKitchen(S)  vaulted stone kitchen at night: domed bread oven left (mouth glows, x -6, z -7), long bread table centre (top 2.6, x -3..3, z -3.5..-1.5),
//       copper pots on a beam, shelves + jars, flour sacks right (x 6..8), hanging herbs, small window. Free floor z > -0.5. env.oven (glow light), env.candle.
//   greatHall(S, { dark, cake })  long banquet hall: side walls x ±11, back wall z -26 (throne dais + round rose window), banners, 8 wall torches (env.torches,
//       x ±10.6, z -20..-2 step 6; env.set(k) lights them all), banquet table along x = -5.5 (top 2.6, z -18..-2), candle chandelier, tall moonlit windows.
//       dark: torches out (moonlight only). cake: Wren's cake on a low round table at (2.5, 0, -4.2) (top 1.6, r 1.7; env.cake, candle tips at y ≈ 3.4). Free floor x -2.5..8, z -22..8.
//   towerRoom(S)  round tower bedroom at night: wall r 9.5 (camera inside r < 9), arched window at the back (moon + stars), canopy bed left (mattress top 1.7,
//       x -7.2..-3.2, z -5.6..0.4), nightstand candle, toy chest + toy knight right, rug, bookshelf, tapestry. Free floor x -2..6, z -4..6. env.candle, env.moon.
//   battlements(S, { lit })  castle courtyard at night: curtain wall front face z -14 (height 10, wall-walk top y 10 from z -17 to -14, parapet behind),
//       stone stair up the wall face from (11, 0) to (1.5, 10) (step i: x 11-i·0.5, top 0.5(i+1), z -14..-11.4; walk at z -12.2), towers at x ±16 (conical roofs), the keep behind,
//       8 torches (env.torches: 0-3 on the wall face x -10.5/-7/-3.5/0, 4-5 on the tower fronts x ∓17, 6-7 on posts at (∓12.5, 1.5); env.set(k)), well (-8, 0, -4), cart + barrels left, hay right, banners, moon, stars, clouds.
//       The giant dragon (s 3.6) perches on the wall top at (-6, 10, -16.5). Courtyard free area x -12..12, z -12..10.
import * as THREE from 'three';
import { std, box, T } from './sets.js';
import { TX } from './themes.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const put = (parent, o, [x = 0, y = 0, z = 0] = [], rot) => { o.position.set(x, y, z); if (rot) o.rotation.set(...rot); parent.add(o); return o; };
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
const noiseFill = (c, w, h, a = 0.08, n = 3000) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); } };
const cache = {}; const once = (k, f) => cache[k] || (cache[k] = f());
// no bump maps: bump mapping on big boxes seen at grazing angles can output NaN pixels (bloom smears them into black blocks)
const tmat = (t, rx, ry, o = {}) => { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return std({ map: c, roughness: 0.9, ...o }); };
const basic = (col, o = {}) => new THREE.MeshBasicMaterial({ color: col, ...o });

// ---------------- textures ----------------
const flagTex = (col = '#6a645c') => once('flag' + col, () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#2a2622'; c.fillRect(0, 0, w, h); const R = rng(3);
  for (let y = 0; y < h; y += 128) for (let x = -64 * ((y / 128) % 2); x < w; x += 128) { const k = 0.8 + R() * 0.4; const b = new THREE.Color(col).multiplyScalar(k);
    c.fillStyle = '#' + b.getHexString(); c.beginPath(); c.roundRect(x + 4, y + 4, 120, 120, 10); c.fill(); }
  noiseFill(c, w, h, 0.1, 6000); }));
const ashlarTex = (col = '#8a7e6e') => once('ash' + col, () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#3a342c'; c.fillRect(0, 0, w, h); const R = rng(7);
  for (let r = 0; r < 8; r++) { let x = -R() * 80; while (x < w) { const bw = 70 + R() * 70; const b = new THREE.Color(col).multiplyScalar(0.78 + R() * 0.4);
    c.fillStyle = '#' + b.getHexString(); c.beginPath(); c.roundRect(x + 3, r * 64 + 3, bw - 6, 58, 6); c.fill(); x += bw; } }
  c.strokeStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 30; i++) { let a = R() * w, b = R() * h; c.beginPath(); c.moveTo(a, b); for (let k = 0; k < 4; k++) { a += (R() - 0.5) * 24; b += R() * 16; c.lineTo(a, b); } c.stroke(); }
  for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(70,90,50,0.18)'; c.beginPath(); c.ellipse(R() * w, R() * h, 20 + R() * 30, 8 + R() * 10, R(), 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.1, 5000); }));
const plankTex = (col = '#6a4428') => once('pl' + col, () => ctex(256, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { const b = new THREE.Color(col).multiplyScalar(0.8 + Math.random() * 0.35);
  c.fillStyle = '#' + b.getHexString(); c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, i * 32, w, 2);
  for (let k = 0; k < 6; k++) { c.strokeStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(0, i * 32 + 6 + k * 4); c.bezierCurveTo(w * 0.3, i * 32 + 4 + k * 4, w * 0.6, i * 32 + 10 + k * 4, w, i * 32 + 6 + k * 4); c.stroke(); } } noiseFill(c, w, h, 0.08, 1500); }));
const brickTex = () => once('brk', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#4a2a1a'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 12; r++) for (let x = -(r % 2) * 16; x < w; x += 32) { c.fillStyle = `hsl(${12 + Math.random() * 10},${45 + Math.random() * 15}%,${30 + Math.random() * 12}%)`; c.fillRect(x + 1.5, r * 21.3 + 1.5, 29, 18); }
  noiseFill(c, w, h, 0.1, 1500); }));
const bannerTex = (bg, fg, kind = 'flame') => once('ban' + bg + fg + kind, () => ctex(128, 256, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.fillStyle = fg; c.fillRect(0, 0, w, 10); c.fillRect(8, 14, 4, h - 40); c.fillRect(w - 12, 14, 4, h - 40);
  if (kind === 'flame') { c.beginPath(); c.moveTo(64, 70); c.bezierCurveTo(100, 110, 96, 170, 64, 180); c.bezierCurveTo(32, 170, 28, 120, 52, 100); c.bezierCurveTo(54, 120, 60, 124, 64, 70); c.fill(); }
  else { c.beginPath(); c.arc(64, 120, 34, 0, 7); c.fill(); c.fillStyle = bg; c.beginPath(); c.arc(64, 120, 22, 0, 7); c.fill(); c.fillStyle = fg; for (let i = 0; i < 5; i++) { c.fillRect(44 + i * 10, 74, 6, 18); } }
  c.beginPath(); c.moveTo(0, h - 26); c.lineTo(w / 2, h); c.lineTo(w, h - 26); c.lineTo(w, h); c.lineTo(0, h); c.fillStyle = '#00000000'; noiseFill(c, w, h, 0.06, 800); }));
const skyNight = () => once('skyN', () => ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#040818'); g.addColorStop(0.55, '#14204a'); g.addColorStop(1, '#3a3a6a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }));
function nightSky(parent, { w = 200, h = 90, y = 30, z = -80, stars = 120, moon = [30, 40], moonR = 4, seed = 4 } = {}) {
  const sky = put(parent, new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic(0xffffff, { map: skyNight(), fog: false })), [0, y, z]);
  const R = rng(seed); const sg = new THREE.SphereGeometry(1, 5, 4); const sm = basic(0xffffff, { fog: false });
  for (let i = 0; i < stars; i++) { const s = put(parent, new THREE.Mesh(sg, sm), [(R() - 0.5) * w * 0.9, y - h * 0.15 + R() * h * 0.6, z + 1]); s.scale.setScalar(0.08 + R() * 0.16); }
  const moonM = put(parent, new THREE.Mesh(new THREE.CircleGeometry(moonR, 40), basic(0xfff4d8, { fog: false })), [moon[0], moon[1], z + 2]);
  const halo = put(parent, new THREE.Mesh(new THREE.CircleGeometry(moonR * 2.2, 40), basic(0x8aa0e0, { fog: false, transparent: true, opacity: 0.18 })), [moon[0], moon[1], z + 1.5]);
  return { sky, moon: moonM, halo };
}

// ---------------- flames ----------------
const flameGeo = once('fg', () => { const g = new THREE.SphereGeometry(0.5, 16, 12); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = y > 0 ? 1 - y * 1.1 : 1; p.setXYZ(i, p.getX(i) * Math.max(0.05, k), y > 0 ? y * 2.4 : y, p.getZ(i) * Math.max(0.05, k)); }
  g.translate(0, 0.5, 0); g.computeVertexNormals(); return g; });
export function flame(parent, { s = 1, col = 0xff7a1a, core = 0xfff0a0, seed = 1 } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const o = put(g, new THREE.Mesh(flameGeo, basic(col, { transparent: true, opacity: 0.92 })), [0, 0, 0]);
  const i = put(g, new THREE.Mesh(flameGeo, basic(core)), [0, 0.02, 0]); i.scale.setScalar(0.55);
  let k = 1; g.scale.setScalar(s);
  return { group: g, set(v) { k = v; g.visible = v > 0.01; }, update(t) { const f = 1 + Math.sin(t * 17 + seed) * 0.08 + Math.sin(t * 29 + seed * 3) * 0.06;
    g.scale.set(s * k * (1 - (f - 1) * 0.6), s * k * f, s * k * (1 - (f - 1) * 0.6)); o.rotation.z = Math.sin(t * 9 + seed) * 0.08; }, get k() { return k; } };
}
export function torch(S, [x, y, z], { ry = 0, lit = 1, light = 10, dist = 12, s = 1, col = 0xff9a40 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry * D; S.add(g);
  const iron = std({ color: 0x2a2624, metalness: 0.7, roughness: 0.45 });
  put(g, mesh(new THREE.BoxGeometry(0.5 * s, 0.9 * s, 0.12 * s), iron), [0, 0, 0.06 * s]);
  put(g, mesh(new THREE.BoxGeometry(0.14 * s, 0.14 * s, 0.6 * s), iron), [0, -0.1 * s, 0.35 * s]);
  const stick = put(g, mesh(new THREE.CylinderGeometry(0.11 * s, 0.07 * s, 1.5 * s, 8), std({ color: 0x5a3a1e, roughness: 0.9 })), [0, 0.35 * s, 0.62 * s], [0.35, 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.2 * s, 0.13 * s, 0.32 * s, 10), iron), [0, 1.0 * s, 0.86 * s], [0.35, 0, 0]);
  const f = flame(g, { s: 0.75 * s, seed: x * 3 + z }); f.group.position.set(0, 1.12 * s, 0.9 * s);
  const L = light ? new THREE.PointLight(col, light, dist, 1.6) : null; if (L) { L.position.set(0, 1.6 * s, 1.2 * s); g.add(L); }
  const tip = () => { g.updateMatrixWorld(true); return f.group.getWorldPosition(new THREE.Vector3()); };
  let k = lit; f.set(k);
  return { group: g, flame: f, light: L, get tip() { return tip(); }, set(v) { k = v; f.set(v); if (L) L.intensity = light * v; }, update(t) { f.update(t); if (L) L.intensity = light * k * (0.88 + Math.sin(t * 13 + x) * 0.08 + Math.sin(t * 23 + z) * 0.05); } };
}
export function candle(S, [x, y, z], { h = 0.6, r = 0.09, col = 0xf4ead0, lit = 1, light = 0, dist = 6, fs = 0.32 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  put(g, mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 12), std({ color: col, roughness: 0.6, emissive: col, emissiveIntensity: 0.05 })), [0, h / 2, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 4), basic(0x1a1a1a)), [0, h + 0.05, 0]);
  const f = flame(g, { s: fs, seed: x * 7 + z * 3 }); f.group.position.set(0, h + 0.04, 0);
  const L = light ? new THREE.PointLight(0xffa850, light, dist, 1.8) : null; if (L) { L.position.set(0, h + 0.4, 0); g.add(L); }
  let k = lit; f.set(k);
  return { group: g, flame: f, light: L, get tip() { g.updateMatrixWorld(true); return f.group.getWorldPosition(new THREE.Vector3()); },
    set(v) { k = v; f.set(v); if (L) L.intensity = light * v; }, update(t) { f.update(t); if (L) L.intensity = light * k * (0.9 + Math.sin(t * 15 + x) * 0.1); } };
}
export function cake(S, [x, y, z], { n = 11, s = 1, lit = 1 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  const frost = once('frost', () => ctex(512, 128, (c, w, h) => { c.fillStyle = '#f6d8e4'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff6fa'; c.fillRect(0, 0, w, 30);
    for (let i = 0; i < 24; i++) { const dx = i * w / 24 + 6, dh = 20 + Math.random() * 40; c.beginPath(); c.roundRect(dx, 10, 14, dh, 7); c.fill(); }
    const cs = ['#ff5a7a', '#5ab0ff', '#ffd040', '#6ad06a']; for (let i = 0; i < 60; i++) { c.fillStyle = cs[i % 4]; c.fillRect(Math.random() * w, 60 + Math.random() * 60, 6, 3); } }));
  put(g, mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.08, 40), std({ color: 0xe8e4dc, metalness: 0.5, roughness: 0.3 })), [0, 0.04, 0]);
  put(g, mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.7, 40), std({ map: frost, roughness: 0.6 })), [0, 0.43, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.5, 40), std({ map: frost, roughness: 0.6 })), [0, 1.03, 0]);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; put(g, mesh(new THREE.SphereGeometry(0.1, 8, 6), std({ color: 0xfff6fa })), [Math.cos(a) * 1.08, 0.8, Math.sin(a) * 1.08]); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(g, mesh(new THREE.SphereGeometry(0.08, 8, 6), std({ color: 0xd8203a, roughness: 0.3 })), [Math.cos(a) * 0.72, 1.3, Math.sin(a) * 0.72]); }
  const cols = [0xff6a8a, 0x6ab8ff, 0xffd04a, 0x8ae07a, 0xc08aff];
  const candles = []; for (let i = 0; i < n; i++) { const ring = i < n - 1; const a = (i / (n - 1)) * Math.PI * 2; const rr = ring ? 0.52 : 0;
    candles.push(candle(g, [Math.cos(a) * rr, 1.28, Math.sin(a) * rr], { h: 0.42, r: 0.045, col: cols[i % 5], fs: 0.22, lit })); }
  return { group: g, candles, set(k) { candles.forEach(c => c.set(k)); }, update(t) { candles.forEach(c => c.update(t)); } };
}

// ---------------- flame dragon ----------------
export function flameDragon(S, { name = 'dragon', s = 1, body = 0xff6a1a, belly = 0xffd04a, light = 0, seed = 1, dist } = {}) {
  const root = new THREE.Group(); root.name = name; S.add(root); const g = new THREE.Group(); g.scale.setScalar(s); root.add(g);
  const mB = std({ color: body, emissive: 0xff3a00, emissiveIntensity: 0.55, roughness: 0.45 });
  const mBel = std({ color: belly, emissive: 0xffa020, emissiveIntensity: 0.6, roughness: 0.5 });
  const mDark = std({ color: 0xb8300a, emissive: 0x801800, emissiveIntensity: 0.5, roughness: 0.5 });
  const mWing = std({ color: 0xffa040, emissive: 0xff6010, emissiveIntensity: 0.6, transparent: true, opacity: 0.88, side: THREE.DoubleSide, roughness: 0.6 });
  const mats = [mB, mBel, mDark, mWing]; const base = mats.map(m => m.emissiveIntensity);
  const torso = put(g, mesh(new THREE.SphereGeometry(1, 24, 18), mB), [0, 1.35, 0]); torso.scale.set(0.85, 0.8, 1.15);
  const bel = put(g, mesh(new THREE.SphereGeometry(0.8, 20, 14), mBel), [0, 1.2, 0.35]); bel.scale.set(0.72, 0.72, 0.85);
  const neck = put(g, mesh(new THREE.CylinderGeometry(0.36, 0.5, 1.1, 14), mB), [0, 2.05, 0.85], [0.6, 0, 0]);
  const head = new THREE.Group(); head.position.set(0, 2.65, 1.3); g.add(head);
  const skull = put(head, mesh(new THREE.SphereGeometry(0.62, 22, 16), mB), [0, 0, 0]); skull.scale.set(1, 0.9, 1);
  put(head, mesh(new THREE.BoxGeometry(0.72, 0.42, 0.62), mB), [0, -0.12, 0.55]);
  put(head, mesh(new THREE.SphereGeometry(0.36, 14, 10), mB), [0, -0.1, 0.82]).scale.set(1, 0.6, 0.6);
  for (const sx of [-1, 1]) put(head, mesh(new THREE.SphereGeometry(0.05, 6, 5), basic(0x3a0a00)), [sx * 0.13, 0.0, 1.0]);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.3, 0.2); head.add(jaw);
  put(jaw, mesh(new THREE.BoxGeometry(0.62, 0.14, 0.72), mBel), [0, -0.02, 0.35]);
  const mouthIn = put(head, new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.6), basic(0xffe080)), [0, -0.3, 0.55]);
  const eyes = [], pupils = [];
  for (const sx of [-1, 1]) { const e = put(head, mesh(new THREE.SphereGeometry(0.21, 16, 12), std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.2 }), false), [sx * 0.3, 0.14, 0.42]); eyes.push(e);
    const p = put(e, new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), basic(0x1a0800)), [sx * 0.02, 0.0, 0.13]); pupils.push(p);
    put(p, new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), basic(0xffffff)), [-0.03, 0.04, 0.1]);
    put(head, mesh(new THREE.ConeGeometry(0.09, 0.55, 8), mDark), [sx * 0.26, 0.5, -0.3], [-0.9, 0, sx * -0.3]); }
  const crest = []; for (let i = 0; i < 3; i++) { const f = flame(head, { s: 0.38 - i * 0.07, seed: i + seed, col: 0xffa020, core: 0xfff4c0 }); f.group.position.set(0, 0.48 - i * 0.05, 0.05 - i * 0.28); f.group.rotation.x = -0.5; crest.push(f); }
  for (let i = 0; i < 5; i++) put(g, mesh(new THREE.ConeGeometry(0.13 - i * 0.012, 0.42, 6), mDark), [0, 2.0 - i * 0.06, 0.25 - i * 0.38], [-0.4, 0, 0]);
  // wings
  const wingShape = new THREE.Shape(); [[0, 0.3], [1.2, 0.9], [2.6, 1.1], [2.9, 0.2], [2.3, -0.3], [1.9, 0.05], [1.5, -0.55], [1.0, -0.15], [0.5, -0.7], [0, -0.5]].forEach(([a, b], i) => i ? wingShape.lineTo(a, b) : wingShape.moveTo(a, b));
  const wg = new THREE.ShapeGeometry(wingShape); wg.rotateX(-Math.PI / 2);
  const wings = [-1, 1].map(sx => { const w = new THREE.Group(); w.position.set(sx * 0.55, 2.0, 0.1); g.add(w); const m = put(w, mesh(wg, mWing), [0, 0, 0]); m.scale.x = sx;
    const bone = put(w, mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.7, 6), mDark), [sx * 1.3, 0.02, -0.5], [0, 0, Math.PI / 2]); bone.rotation.y = sx * -0.35; return w; });
  // tail: chained segments
  const tail = []; let par = g, pos = [0, 1.15, -1.0];
  for (let i = 0; i < 6; i++) { const j = new THREE.Group(); j.position.set(...pos); par.add(j); put(j, mesh(new THREE.SphereGeometry(0.42 - i * 0.055, 12, 10), mB), [0, 0, -0.25]).scale.set(1, 0.9, 1.4); tail.push(j); par = j; pos = [0, i < 2 ? -0.08 : 0.06, -0.5]; }
  const tailF = flame(par, { s: 0.55, seed: seed + 9, col: 0xff8a20 }); tailF.group.position.set(0, 0.05, -0.55); tailF.group.rotation.x = -1.3;
  // legs
  const legs = []; for (const [sx, sz] of [[-1, 0.6], [1, 0.6], [-1, -0.55], [1, -0.55]]) { const L = new THREE.Group(); L.position.set(sx * 0.55, 0.85, sz); g.add(L);
    put(L, mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.8, 10), mB), [0, -0.38, 0]); put(L, mesh(new THREE.SphereGeometry(0.24, 10, 8), mBel), [0, -0.78, 0.08]).scale.set(1, 0.6, 1.3);
    for (const cx of [-0.1, 0, 0.1]) put(L, mesh(new THREE.ConeGeometry(0.04, 0.14, 5), basic(0xfff0d0)), [cx, -0.8, 0.36], [Math.PI / 2, 0, 0]); legs.push(L); }
  // breath
  const br = new THREE.Group(); br.position.set(0, -0.15, 1.0); head.add(br);
  const brO = put(br, new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.4, 18, 1, true), basic(0xff7a1a, { transparent: true, opacity: 0.75, side: THREE.DoubleSide })), [0, 0, 1.7], [-Math.PI / 2, 0, 0]);
  const brI = put(br, new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.8, 14, 1, true), basic(0xfff0a0, { side: THREE.DoubleSide })), [0, 0, 1.45], [-Math.PI / 2, 0, 0]); br.visible = false;
  const L = light ? new THREE.PointLight(0xff8a30, light, dist ?? 12 * Math.max(1, s), 1.5) : null; if (L) { L.position.set(0, 1.4 * s, 2.0 * s); root.add(L); }   // in front of the belly: never inside the head (half-float overflow -> black bloom blocks)
  let glowK = 1, jawK = 0, brK = 0, blinkK = 0, lookV = null;
  const d = { root, g, head, jaw: k => { jawK = k; }, breath: k => { brK = k; }, glow: k => { glowK = k; }, blink: k => { blinkK = k; }, look: v => { lookV = v; }, light: L, wings, tail,
    mouth() { root.updateMatrixWorld(true); return head.localToWorld(new THREE.Vector3(0, -0.15, 1.0)); },
    update(t, mode = 'hover', k = 1) {
      const ph = t + seed * 1.37; let flap = 0, bob = 0, headUp = 0, wingFold = 0, tailAmp = 0.25, legTuck = 0, hx = 0, roll = 0;
      if (mode === 'fly') { flap = Math.sin(ph * 13) * 0.75; bob = Math.sin(ph * 13 - 1) * 0.12; legTuck = 1; tailAmp = 0.35; roll = Math.sin(ph * 2) * 0.1; hx = -0.15; }
      else if (mode === 'hover') { flap = Math.sin(ph * 8) * 0.55; bob = 0.15 + Math.sin(ph * 8 - 1) * 0.1; legTuck = 0.6; }
      else if (mode === 'perch') { wingFold = 1; flap = Math.sin(ph * 1.2) * 0.05; bob = Math.sin(ph * 1.6) * 0.03; tailAmp = 0.15; }
      else if (mode === 'roar') { flap = -0.25 + Math.sin(ph * 3) * 0.08; headUp = 0.5 * k; tailAmp = 0.4; }
      else if (mode === 'curl') { wingFold = 1.2; headUp = -0.45; bob = -0.15 + Math.sin(ph * 1.3) * 0.02; tailAmp = 0.06; }
      else if (mode === 'eat') { flap = Math.sin(ph * 9) * 0.45; bob = 0.15; legTuck = 0.6; hx = 0.25; }
      g.position.y = bob; g.rotation.z = roll;
      wings.forEach((w, i) => { const sx = i ? 1 : -1; w.rotation.z = sx * (flap + wingFold * 0.95); w.rotation.y = -sx * wingFold * 0.75; });
      tail.forEach((j, i) => { j.rotation.y = Math.sin(ph * 2.6 - i * 0.7) * tailAmp; j.rotation.x = (mode === 'curl' ? 0.1 : -0.05) + Math.sin(ph * 1.9 - i * 0.5) * 0.05; });
      legs.forEach((l, i) => { l.rotation.x = legTuck * (i < 2 ? 0.7 : -0.9); });
      neck.rotation.x = 0.6 - headUp * 0.5 + hx * 0.3;
      let ry = 0, rx = -headUp + hx + Math.sin(ph * 2.1) * 0.04;
      if (lookV) { root.updateMatrixWorld(true); const l = g.worldToLocal(lookV.clone()).sub(head.position); ry = THREE.MathUtils.clamp(Math.atan2(l.x, l.z), -0.9, 0.9); rx = THREE.MathUtils.clamp(-Math.atan2(l.y, Math.hypot(l.x, l.z)), -0.7, 0.6) + hx; }
      head.rotation.set(rx, ry, Math.sin(ph * 1.7) * 0.05);
      jaw.rotation.x = jawK * 0.6 + (mode === 'roar' ? 0.5 * k : 0); mouthIn.visible = jaw.rotation.x > 0.15;
      eyes.forEach(e => e.scale.set(1, Math.max(0.08, 1 - blinkK), 1));
      crest.forEach((f, i) => { f.update(t + i); f.set(glowK); }); tailF.update(t); tailF.set(Math.max(0.2, glowK));
      br.visible = brK > 0.02; br.scale.set(brK, brK, brK * (1 + Math.sin(t * 30) * 0.06)); brO.rotation.y = t * 4;
      mats.forEach((m, i) => { m.emissiveIntensity = base[i] * glowK; });
      if (L) L.intensity = light * glowK * (0.9 + Math.sin(t * 11 + seed) * 0.08) + light * 0.8 * brK;
    } };
  d.update(0); return d;
}
export function spark(S, { col = 0xffb030, s = 0.35 } = {}) {
  const g = new THREE.Group(); S.add(g); const c = put(g, new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), basic(0xfff4c0)), []); const h = put(g, new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), basic(col, { transparent: true, opacity: 0.45 })), []);
  g.scale.setScalar(s); return { group: g, set(p, k = 1) { g.position.copy(p); g.scale.setScalar(s * k); g.visible = k > 0.01; } };
}
// trail of fading embers following a moving point: e = embers(S, n); e.update(t, pos)
export function embers(S, n = 14, { col = 0xffa030, s = 0.08 } = {}) {
  const ms = []; const hist = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 5), basic(col, { transparent: true })); S.add(m); ms.push(m); }
  return { update(t, p, k = 1) { hist.unshift(p.clone()); if (hist.length > n * 2) hist.pop(); ms.forEach((m, i) => { const h = hist[Math.min(hist.length - 1, i * 2)]; m.position.copy(h).add(new THREE.Vector3(Math.sin(i * 7 + t * 3) * 0.1, Math.sin(i * 3) * 0.1 - i * 0.02, 0));
      m.scale.setScalar(s * (1 - i / n) * k); m.material.opacity = (1 - i / n) * k; m.visible = k > 0.01; }); } };
}

// ---------------- props ----------------
export function shield(S, col = 0x2a4ab8) {
  const g = new THREE.Group(); S.add(g); const sh = new THREE.Shape(); sh.moveTo(-0.9, 0.9); sh.lineTo(0.9, 0.9); sh.quadraticCurveTo(0.95, -0.3, 0, -1.2); sh.quadraticCurveTo(-0.95, -0.3, -0.9, 0.9);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 2 }); geo.translate(0, 0, -0.06);
  const face = ctex(256, 256, (c, w, h) => { c.fillStyle = '#' + new THREE.Color(col).getHexString(); c.fillRect(0, 0, w, h); c.fillStyle = '#f2c83a'; c.fillRect(w / 2 - 14, 0, 28, h); c.fillRect(0, h * 0.38, w, 28);
    c.beginPath(); c.arc(w / 2, h * 0.44, 34, 0, 7); c.fill(); noiseFill(c, w, h, 0.08, 800); }); face.repeat.set(0.55, 0.55); face.offset.set(0.5, 0.6);
  put(g, mesh(geo, std({ map: face, metalness: 0.3, roughness: 0.5 })), []); return g;
}
export function flourSack(S, [x, y, z], { s = 1, open = false, name = 'sack' } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  const tex = once('flour', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#d8c8a0'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(90,70,40,0.25)'; for (let i = 0; i < w; i += 6) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); }
    c.fillStyle = '#6a4a2a'; c.font = 'bold 54px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('FLOUR', w / 2, h * 0.55); c.beginPath(); c.arc(w / 2, h * 0.3, 22, 0, 7); c.fill(); noiseFill(c, w, h, 0.08, 1000); }));
  const geo = new THREE.CylinderGeometry(open ? 1.15 : 0.7, 1.2, 2.4, 20, 4, open); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const yy = p.getY(i); const b = 1 + 0.12 * Math.cos(yy * 1.3); p.setX(i, p.getX(i) * b); p.setZ(i, p.getZ(i) * b); } geo.computeVertexNormals();
  const m = put(g, mesh(geo, std({ map: tex, roughness: 1, side: open ? THREE.DoubleSide : THREE.FrontSide })), [0, 1.2, 0]); m.name = name;
  if (!open) put(g, mesh(new THREE.CylinderGeometry(0.15, 0.6, 0.5, 12), std({ map: tex, roughness: 1 })), [0, 2.6, 0]);
  else put(g, mesh(new THREE.CircleGeometry(1.1, 20), std({ color: 0xf4f0e8, roughness: 1 })), [0, 1.9, 0], [-Math.PI / 2, 0, 0]);
  return g;
}
export function marshmallowStick(S) {
  const g = new THREE.Group(); S.add(g);
  put(g, mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.2, 6), std({ color: 0x7a5a30 })), [0, 0, 1.1], [Math.PI / 2, 0, 0]);
  const mm = std({ color: 0xfaf6ee, roughness: 0.8 }); const m = put(g, mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 14), mm), [0, 0, 2.25], [Math.PI / 2, 0, 0]);
  const a = new THREE.Color(0xfaf6ee), b = new THREE.Color(0xc8803a);
  return { group: g, tipLocal: new THREE.Vector3(0, 0, 2.25), toast(k) { mm.color.copy(a).lerp(b, k); } };
}
export function loaf(S, [x, y, z], k = 0, ry = 0) {
  const c = new THREE.Color(0xe8b060).lerp(new THREE.Color(0x4a2a14), k); const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; S.add(g);
  const l = put(g, mesh(new THREE.SphereGeometry(0.5, 16, 12), std({ color: c, roughness: 0.7 })), [0, 0.22, 0]); l.scale.set(1.5, 0.6, 0.8);
  for (let i = -1; i <= 1; i++) put(g, mesh(new THREE.BoxGeometry(0.08, 0.06, 0.6), std({ color: c.clone().multiplyScalar(0.6) })), [i * 0.35, 0.5, 0], [0, 0, 0.4]);
  return g;
}
function shelf(S, [x, y, z], w, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; S.add(g); put(g, mesh(new THREE.BoxGeometry(w, 0.15, 0.9), std({ map: plankTex('#6a4428') })), []); return g; }
function jar(parent, [x, y, z], col, h = 0.6) { put(parent, mesh(new THREE.CylinderGeometry(0.22, 0.24, h, 12), std({ color: col, roughness: 0.3, transparent: true, opacity: 0.85 })), [x, y + h / 2, z]);
  put(parent, mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), std({ color: 0x8a6a40 })), [x, y + h + 0.04, z]); }
function pot(parent, [x, y, z], r = 0.5) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const cu = std({ color: 0xc8703a, metalness: 0.85, roughness: 0.3 });
  put(g, mesh(new THREE.CylinderGeometry(r, r * 0.8, r * 1.1, 16), cu), [0, -r * 0.55, 0]); put(g, mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4), std({ color: 0x2a2a2a })), [0, 0.3, 0]);
  put(g, mesh(new THREE.TorusGeometry(r * 0.3, 0.04, 6, 12), cu), [r, -r * 0.3, 0], [0, Math.PI / 2, 0]); return g; }
function barrel(S, [x, y, z], s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  const geo = new THREE.CylinderGeometry(0.8, 0.8, 2, 18, 6); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + 0.15 * Math.cos(p.getY(i) * 1.4); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } geo.computeVertexNormals();
  const bt = once('bar', () => ctex(256, 128, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = `hsl(28,45%,${22 + Math.random() * 12}%)`; c.fillRect(i * 16, 0, 16, h); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(i * 16, 0, 2, h); } }));
  put(g, mesh(geo, std({ map: bt, roughness: 0.85 })), [0, 1, 0]); for (const yy of [0.3, 1.7]) put(g, mesh(new THREE.TorusGeometry(0.88, 0.05, 6, 24), std({ color: 0x2a2a2a, metalness: 0.6 })), [0, yy, 0], [Math.PI / 2, 0, 0]);
  return g; }
function banner(S, [x, y, z], [w, h], tex, ry = 0) { const geo = new THREE.PlaneGeometry(w, h, 6, 8); const m = mesh(geo, std({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }), true);
  m.position.set(x, y, z); m.rotation.y = ry; S.add(m); const rod = mesh(new THREE.CylinderGeometry(0.06, 0.06, w + 0.5, 6), std({ color: 0xc8a040, metalness: 0.8, roughness: 0.3 }));
  rod.rotation.z = Math.PI / 2; rod.rotation.y = ry; rod.position.set(x, y + h / 2 + 0.05, z); S.add(rod);
  const p0 = geo.attributes.position.array.slice();
  return (t) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p0[i * 3 + 1]; const k = (h / 2 - yy) / h; p.setZ(i, Math.sin(t * 1.6 + p0[i * 3] * 1.5 + x) * 0.08 * k); } p.needsUpdate = true; };
}
function archWindow(S, [x, y, z], [w, h], ry = 0, { col = 0x6a8ae8, glow = 0.9, frame = 0x4a4038, panes = true } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; S.add(g);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h - w / 2); sh.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); sh.lineTo(-w / 2, 0);
  const gl = put(g, new THREE.Mesh(new THREE.ShapeGeometry(sh), std({ color: col, emissive: col, emissiveIntensity: glow, roughness: 0.3 })), [0, 0, 0]);
  const fr = std({ color: frame, roughness: 0.8 });
  if (panes) { put(g, mesh(new THREE.BoxGeometry(0.12, h, 0.12), fr), [0, h / 2, 0.06]); for (let yy = h * 0.3; yy < h - 0.3; yy += h * 0.25) put(g, mesh(new THREE.BoxGeometry(w, 0.1, 0.1), fr), [0, yy, 0.06]); }
  const ring = new THREE.Shape(); ring.moveTo(-w / 2 - 0.35, -0.3); ring.lineTo(w / 2 + 0.35, -0.3); ring.lineTo(w / 2 + 0.35, h - w / 2); ring.absarc(0, h - w / 2, w / 2 + 0.35, 0, Math.PI, false); ring.lineTo(-w / 2 - 0.35, -0.3);
  const hole = new THREE.Path(); hole.moveTo(-w / 2, 0); hole.lineTo(w / 2, 0); hole.lineTo(w / 2, h - w / 2); hole.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); hole.lineTo(-w / 2, 0); ring.holes.push(hole);
  put(g, mesh(new THREE.ExtrudeGeometry(ring, { depth: 0.3, bevelEnabled: false }), std({ map: ashlarTex('#a89a86').clone(), roughness: 0.9 })), [0, 0, -0.1]);
  return { group: g, glass: gl };
}

// ---------------- sets ----------------
export function castleKitchen(S) {
  S.userData.look = 'night'; S.background = new THREE.Color(0x0a0806);
  const W = 10, Z0 = -9, Z1 = 12, H = 10;
  box(S, [2 * W, 0.3, Z1 - Z0], [0, -0.15, (Z0 + Z1) / 2], tmat(flagTex('#7a6a58'), 5, 5), { r: 0, cast: false, name: 'floor' });
  const wm = tmat(ashlarTex('#9a8a74'), 4, 2);
  box(S, [2 * W, H, 0.5], [0, H / 2, Z0 - 0.25], wm, { r: 0, cast: false, name: 'back wall' });
  for (const sx of [-1, 1]) box(S, [0.5, H, Z1 - Z0], [sx * (W + 0.25), H / 2, (Z0 + Z1) / 2], wm, { r: 0, cast: false, name: 'side wall' });
  box(S, [2 * W, 0.5, Z1 - Z0], [0, H + 0.25, (Z0 + Z1) / 2], std({ map: plankTex('#3a2414'), roughness: 1 }), { r: 0, cast: false, solid: false });
  for (let z = Z0 + 2; z < Z1; z += 4.5) box(S, [2 * W, 0.6, 0.6], [0, H - 0.3, z], std({ map: plankTex('#4a2c18') }), { r: 0.05, cast: false, solid: false });
  box(S, [2 * W, H, 0.5], [0, H / 2, Z1 + 0.25], wm, { r: 0, cast: false, solid: false });
  // domed bread oven (left back corner)
  const ov = new THREE.Group(); ov.position.set(-6.2, 0, -6.8); S.add(ov);
  put(ov, mesh(new THREE.BoxGeometry(6, 2.2, 4.2), tmat(ashlarTex('#8a7a66'), 2, 1)), [0, 1.1, 0]);
  const dome = put(ov, mesh(new THREE.SphereGeometry(2.6, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), std({ map: brickTex(), roughness: 0.9 })), [0, 2.2, -0.2]); dome.scale.set(1.05, 1.0, 0.85);
  const mouthSh = new THREE.Shape(); mouthSh.moveTo(-1, 0); mouthSh.lineTo(1, 0); mouthSh.absarc(0, 0, 1, 0, Math.PI, false);
  const mouth = put(ov, new THREE.Mesh(new THREE.ShapeGeometry(mouthSh), basic(0xff8a2a)), [0, 2.3, 2.0]);
  put(ov, mesh(new THREE.TorusGeometry(1.1, 0.18, 8, 20, Math.PI), std({ map: brickTex() })), [0, 2.3, 2.0]);
  const embersG = []; for (let i = 0; i < 5; i++) { const f = flame(ov, { s: 0.5 + (i % 2) * 0.2, seed: i * 2 }); f.group.position.set(-0.6 + i * 0.3, 2.25, 1.6); embersG.push(f); }
  box(S, [0.7, 4, 0.7], [-6.2, 7.5, -7.6], std({ map: brickTex() }), { r: 0.05, cast: false, solid: false });
  const oven = new THREE.PointLight(0xff7a2a, 30, 16, 1.5); oven.position.set(-5.6, 3.0, -3.8); oven.castShadow = true; oven.shadow.mapSize.set(1024, 1024); oven.shadow.bias = -0.003; S.add(oven);
  // peel leaning on the oven, wood pile
  put(S, mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.5, 6), std({ color: 0x8a6a3a })), [-2.9, 2.2, -4.6], [0.2, 0, -0.25]);
  for (let i = 0; i < 7; i++) put(S, mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 8), std({ map: plankTex('#6a4a2a') })), [-9.0 + (i % 3) * 0.48, 0.25 + Math.floor(i / 3) * 0.42, -3.2], [0, 0, Math.PI / 2]);
  // bread table (centre)
  const tbl = std({ map: plankTex('#8a5a30') });
  box(S, [6.4, 0.3, 2.2], [0.4, 2.45, -2.6], tbl, { r: 0.04, name: 'bread table' });
  for (const [dx, dz] of [[-2.9, -0.85], [2.9, -0.85], [-2.9, 0.85], [2.9, 0.85]]) box(S, [0.3, 2.3, 0.3], [0.4 + dx, 1.15, -2.6 + dz], tbl, { r: 0.04, name: 'table leg' });
  const loaves = []; [[-1.8, -2.9], [-0.6, -2.3], [0.6, -2.9], [1.8, -2.3], [2.6, -3.0]].forEach(([lx, lz], i) => loaves.push(loaf(S, [lx, 2.6, lz], 0.85, i * 0.5)));
  put(S, mesh(new THREE.CylinderGeometry(0.6, 0.5, 0.35, 16), std({ color: 0xc8b8a0 })), [-0.2, 2.78, -1.9]);
  // copper pots on a rack
  const rack = box(S, [8, 0.2, 0.2], [1.5, 7.2, -4.5], std({ color: 0x2a2624, metalness: 0.6 }), { r: 0.05, cast: false, solid: false });
  const pots = [-1.5, 0, 1.4, 2.8, 4.2].map((px, i) => pot(S, [px, 6.7, -4.5], 0.35 + (i % 3) * 0.1));
  // hanging herbs + garlic
  for (let i = 0; i < 6; i++) { const hx = -3 + i * 0.6; put(S, mesh(new THREE.ConeGeometry(0.22, 0.9, 6), std({ color: i % 2 ? 0x5a8a3a : 0x7a9a4a, roughness: 1 })), [hx, 8.3, -8.6], [Math.PI, 0, 0]); }
  // shelves with jars (right back)
  const sh1 = shelf(S, [5.5, 4.2, -8.4], 6); const sh2 = shelf(S, [5.5, 5.8, -8.4], 6);
  [0xc8402a, 0xe8c040, 0x6a9a4a, 0xd8d0c0, 0x8a4a8a, 0x3a7ab8].forEach((c, i) => { jar(S, [3.2 + i * 0.85, 4.28, -8.4], c, 0.5 + (i % 3) * 0.15); jar(S, [3.4 + i * 0.85, 5.88, -8.4], [0xd8a050, 0x9a3a2a, 0xe8e0c8][i % 3], 0.45); });
  // small barred window (moonlight)
  const win = archWindow(S, [5.5, 6.6, -8.95], [2.2, 2.6], 0, { col: 0x5a78c8, glow: 0.7 });
  const moon = new THREE.SpotLight(0x8aa8ff, 120, 30, 0.45, 0.6, 1.5); moon.position.set(5.5, 8, -7); moon.target.position.set(2, 0, 2); S.add(moon, moon.target);
  // flour sacks (right)
  const sacks = [flourSack(S, [7.6, 0, -6.5], { s: 1.0 }), flourSack(S, [8.6, 0, -3.8], { s: 0.85 }), flourSack(S, [6.6, 0, -4.4], { s: 0.75 })];
  barrel(S, [8.4, 0, 1.0], 1.0);
  // candles on the table and the wall
  const cds = [candle(S, [2.9, 2.6, -1.9], { h: 0.7, light: 6, dist: 8 }), candle(S, [-2.4, 2.6, -1.8], { h: 0.5 })];
  S.add(new THREE.HemisphereLight(0xffd0a0, 0x2a1a10, 0.45));
  const fill = new THREE.PointLight(0xffc890, 10, 18, 1.6); fill.position.set(2, 6, 6); S.add(fill);
  return { oven, candle: cds[0], loaves, sacks, update(t) { embersG.forEach(f => f.update(t)); cds.forEach(c => c.update(t)); oven.intensity = 30 * (0.9 + Math.sin(t * 7) * 0.06 + Math.sin(t * 17) * 0.04);
    pots.forEach((p, i) => { p.rotation.z = Math.sin(t * 1.2 + i) * 0.03; }); mouth.material.color.setHSL(0.07, 1, 0.55 + Math.sin(t * 9) * 0.04); } };
}

export function greatHall(S, { dark = false, cake: withCake = false, lit } = {}) {
  S.userData.look = 'night'; S.background = new THREE.Color(0x07070c);
  const W = 11, Z0 = -26, Z1 = 12, H = 14;
  const floorT = once('hallFloor', () => ctex(512, 512, (c, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#3a3430' : '#8a8070'; c.fillRect(i * 64, j * 64, 64, 64); } noiseFill(c, w, h, 0.1, 5000);
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }));
  box(S, [2 * W, 0.3, Z1 - Z0], [0, -0.15, (Z0 + Z1) / 2], std({ map: (() => { const t = floorT.clone(); t.repeat.set(2.5, 5); t.needsUpdate = true; return t; })(), roughness: 0.35, metalness: 0.1 }), { r: 0, cast: false, name: 'floor' });
  // red carpet runner
  box(S, [3.2, 0.04, 30], [2.6, 0.02, -11], std({ color: 0x8a1a22, roughness: 1 }), { r: 0, cast: false, solid: false });
  box(S, [3.6, 0.03, 30], [2.6, 0.01, -11], std({ color: 0xd8a83a, roughness: 0.6, metalness: 0.4 }), { r: 0, cast: false, solid: false });
  const wm = tmat(ashlarTex('#a0927e'), 6, 3);
  for (const sx of [-1, 1]) box(S, [0.6, H, Z1 - Z0], [sx * (W + 0.3), H / 2, (Z0 + Z1) / 2], wm, { r: 0, cast: false, name: 'side wall' });
  box(S, [2 * W, H, 0.6], [0, H / 2, Z0 - 0.3], wm, { r: 0, cast: false, name: 'back wall' });
  box(S, [2 * W, H, 0.6], [0, H / 2, Z1 + 0.3], wm, { r: 0, cast: false, solid: false });
  // ceiling beams + trusses
  box(S, [2 * W, 0.4, Z1 - Z0], [0, H + 0.2, (Z0 + Z1) / 2], std({ map: plankTex('#2a1a10') }), { r: 0, cast: false, solid: false });
  for (let z = Z0 + 3; z < Z1; z += 5) { box(S, [2 * W, 0.8, 0.8], [0, H - 0.6, z], std({ map: plankTex('#4a2c18') }), { r: 0.05, cast: false, solid: false });
    for (const sx of [-1, 1]) box(S, [0.6, 3, 0.6], [sx * (W - 0.4), H - 2.2, z], std({ map: plankTex('#4a2c18') }), { r: 0.05, cast: false, solid: false }); }
  // tall moonlit windows on the left wall + rose window at the back
  const wins = []; for (let z = Z0 + 6; z < 0; z += 8) wins.push(archWindow(S, [-W + 0.05, 5.5, z], [2.4, 6], Math.PI / 2, { col: 0x5a7ad8, glow: dark ? 1.0 : 0.7 }));
  const rose = put(S, new THREE.Mesh(new THREE.CircleGeometry(2.6, 40), std({ map: once('rose', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#1a1a3a'; c.fillRect(0, 0, w, h);
    const cs = ['#d83a3a', '#3a6ad8', '#e8c040', '#3ab06a', '#a04ad8']; for (let r = 5; r > 0; r--) for (let i = 0; i < 12; i++) { c.fillStyle = cs[(i + r) % 5]; c.beginPath(); c.moveTo(128, 128); c.arc(128, 128, r * 25, i / 12 * 6.283, (i + 0.85) / 12 * 6.283); c.fill(); }
    c.strokeStyle = '#1a1a1a'; c.lineWidth = 4; for (let r = 1; r <= 5; r++) { c.beginPath(); c.arc(128, 128, r * 25, 0, 7); c.stroke(); } })), emissive: 0xffffff, emissiveIntensity: 0.6 })), [0, 10.2, Z0 + 0.02]);
  rose.material.emissiveMap = rose.material.map; rose.material.needsUpdate = true;
  put(S, mesh(new THREE.TorusGeometry(2.7, 0.3, 10, 40), std({ map: ashlarTex('#b8a892') })), [0, 10.2, Z0 + 0.1]);
  // throne dais
  box(S, [9, 0.6, 4], [0, 0.3, Z0 + 2.2], std({ map: ashlarTex('#b0a28c').clone(), roughness: 0.8 }), { r: 0.05, name: 'dais' });
  box(S, [7, 0.6, 2.6], [0, 0.9, Z0 + 1.6], std({ color: 0x8a1a22, roughness: 1 }), { r: 0.05, name: 'dais' });
  const gold = std({ color: 0xd8a83a, metalness: 0.85, roughness: 0.3 });
  box(S, [2.6, 1.0, 2.0], [0, 1.7, Z0 + 1.5], std({ color: 0x6a1a2a, roughness: 0.8 }), { r: 0.15, name: 'throne' });
  box(S, [2.8, 4.6, 0.4], [0, 3.5, Z0 + 0.6], gold, { r: 0.1, name: 'throne back' });
  for (const sx of [-1, 1]) box(S, [0.4, 1.8, 2.0], [sx * 1.4, 2.0, Z0 + 1.5], gold, { r: 0.08, name: 'throne arm' });
  // banners on the side walls
  const flutter = []; let bi = 0;
  for (let z = Z0 + 3; z < 4; z += 6) for (const sx of [-1, 1]) { if (sx < 0 && Math.abs(((z - (Z0 + 6)) % 8)) < 2.5) continue; bi++;
    flutter.push(banner(S, [sx * (W - 0.15), 9.0, z], [2.0, 4.4], bannerTex(bi % 2 ? '#8a1a2a' : '#1a3a7a', '#e8b840', bi % 2 ? 'flame' : 'crown'), sx * -Math.PI / 2)); }
  flutter.push(banner(S, [-6, 7.6, Z0 + 0.4], [2.6, 6], bannerTex('#8a1a2a', '#e8b840', 'flame'))); flutter.push(banner(S, [6, 7.6, Z0 + 0.4], [2.6, 6], bannerTex('#8a1a2a', '#e8b840', 'flame')));
  // torches along both walls
  const torches = []; for (let z = -20; z <= -2; z += 6) for (const sx of [-1, 1]) torches.push(torch(S, [sx * (W - 0.05), 5.2, z], { ry: sx * -90, lit: dark ? 0 : 1, light: 14, dist: 14 }));
  torches.push(torch(S, [-3.6, 4.6, Z0 + 0.05], { lit: dark ? 0 : 1, light: 10 }), torch(S, [3.6, 4.6, Z0 + 0.05], { lit: dark ? 0 : 1, light: 10 }));
  // banquet table (left)
  const tw = std({ map: plankTex('#7a4a28') });
  box(S, [3.0, 0.3, 16], [-5.5, 2.45, -10], tw, { r: 0.05, name: 'banquet table' });
  box(S, [3.1, 0.05, 16.1], [-5.5, 2.62, -10], std({ color: 0xf2ead8, roughness: 0.9 }), { r: 0, name: 'tablecloth' });
  for (const z of [-17.5, -10, -2.5]) for (const dx of [-1.2, 1.2]) box(S, [0.35, 2.3, 0.35], [-5.5 + dx, 1.15, z], tw, { r: 0.04, name: 'table leg' });
  for (let z = -17; z <= -3; z += 2.8) { box(S, [1.4, 0.2, 1.4], [-8.2, 1.6, z], tw, { r: 0.04, name: 'stool' }); box(S, [0.3, 1.5, 0.3], [-8.2, 0.75, z], tw, { r: 0.03, name: 'stool leg' }); }
  const R = rng(5); const tableC = [];
  for (let z = -17; z <= -3; z += 2.2) { put(S, mesh(new THREE.CylinderGeometry(0.45, 0.4, 0.08, 16), std({ color: 0xe8e4dc, metalness: 0.4, roughness: 0.3 })), [-5.5 + (R() - 0.5) * 1.2, 2.69, z]);
    if (R() < 0.6) put(S, mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.45, 10), gold), [-6.3, 2.87, z + 0.6]);
    if (R() < 0.4) loaf(S, [-4.9, 2.65, z + 0.9], 0.2, R() * 3); }
  [-15, -9, -4].forEach(z => tableC.push(candle(S, [-5.5, 2.65, z], { h: 0.8, r: 0.12, lit: dark ? 0 : 1, light: dark ? 0 : 3, dist: 6 })));
  put(S, mesh(new THREE.SphereGeometry(0.5, 14, 10), std({ color: 0xc8302a, roughness: 0.4 })), [-5.5, 2.95, -12]).scale.set(1, 0.6, 1);
  // candle chandelier (centre)
  const ch = new THREE.Group(); ch.position.set(2.5, 10, -10); S.add(ch);
  put(ch, mesh(new THREE.TorusGeometry(2.4, 0.12, 8, 32), std({ color: 0x2a2624, metalness: 0.7, roughness: 0.4 })), [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 3; i++) put(ch, mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.4, 4), std({ color: 0x2a2624 })), [Math.cos(i * 2.1) * 1.2, 2.0, Math.sin(i * 2.1) * 1.2], [Math.sin(i * 2.1) * 0.5, 0, -Math.cos(i * 2.1) * 0.5]);
  const chC = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; chC.push(candle(ch, [Math.cos(a) * 2.4, 0.1, Math.sin(a) * 2.4], { h: 0.5, lit: dark ? 0 : 1 })); }
  const chL = new THREE.PointLight(0xffb060, dark ? 0 : 26, 26, 1.4); chL.position.set(2.5, 8.6, -10); chL.castShadow = true; chL.shadow.mapSize.set(1024, 1024); chL.shadow.bias = -0.003; S.add(chL);
  // moonlight through the windows + ambient
  S.add(new THREE.HemisphereLight(dark ? 0x4a5a9a : 0xffd0a0, 0x1a1410, dark ? 0.55 : 0.4));
  const moon = new THREE.DirectionalLight(0x8aa8ff, dark ? 1.6 : 0.7); moon.position.set(-20, 16, -4); moon.target.position.set(3, 0, -10); moon.castShadow = true;
  Object.assign(moon.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25 }); S.add(moon, moon.target);
  const key = new THREE.PointLight(dark ? 0x8aa0e0 : 0xffc890, dark ? 8 : 12, 18, 1.6); key.position.set(4, 6.5, 4); S.add(key);
  // cake on a little round table
  let ck = null; if (withCake) { const ct = std({ color: 0xf2ead8, roughness: 0.9 });
    put(S, mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.2, 28), std({ map: plankTex('#7a4a28') })), [2.5, 1.5, -4.2]);
    put(S, mesh(new THREE.CylinderGeometry(1.75, 1.6, 1.4, 28, 1, true), ct), [2.5, 0.7, -4.2]);
    ck = cake(S, [2.5, 1.6, -4.2], { n: 11, lit: lit ?? 1 }); }
  const all = [...torches, ...tableC];
  return { torches, tableC, chC, chL, cake: ck, moon, key,
    set(k) { all.forEach(t => t.set(k)); chC.forEach(c => c.set(k)); chL.intensity = 26 * k; },
    update(t) { torches.forEach(x => x.update(t)); tableC.forEach(x => x.update(t)); chC.forEach(x => x.update(t)); flutter.forEach(f => f(t)); if (ck) ck.update(t); ch.rotation.y = Math.sin(t * 0.4) * 0.03; } };
}

export function towerRoom(S) {
  S.userData.look = 'night'; S.background = new THREE.Color(0x05060c);
  const Rr = 9.5, H = 11;
  box(S, [24, 0.3, 24], [0, -0.15, 0], tmat(plankTex('#7a5232'), 5, 5), { r: 0, cast: false, name: 'floor' });
  // round wall with an arched window gap at the back
  const wallT = ashlarTex('#b8a890').clone(); wallT.repeat.set(8, 2); wallT.needsUpdate = true;
  const wall = mesh(new THREE.CylinderGeometry(Rr, Rr, H, 64, 1, true, Math.PI + 0.16, Math.PI * 2 - 0.32), std({ map: wallT, side: THREE.BackSide, roughness: 0.95 }), false);
  wall.position.y = H / 2; S.add(wall);
  // window: deep arched opening at the back (z = -Rr)
  const winW = 3.0; box(S, [winW + 1, 3.6, 1.2], [0, 1.8, -Rr - 0.2], tmat(ashlarTex('#b8a890'), 1, 1), { r: 0, cast: false, name: 'window wall' });
  box(S, [winW + 1, 1.4, 1.2], [0, H - 0.7, -Rr - 0.2], tmat(ashlarTex('#b8a890'), 1, 1), { r: 0, cast: false, solid: false });
  box(S, [winW + 0.4, 0.3, 1.6], [0, 3.75, -Rr + 0.1], std({ map: ashlarTex('#c8b8a0') }), { r: 0.05, name: 'sill' });
  const outside = new THREE.Group(); S.add(outside); const sky = nightSky(outside, { w: 60, h: 40, y: 10, z: -40, moon: [3.5, 12], moonR: 2.2, stars: 80 });
  clouds(S, { night: true, n: 6, y: [10, 18], z: [-38, -32], x: 20 });
  // distant towers through the window
  for (const [tx, h] of [[-6, 10], [8, 8]]) { const t2 = put(outside, mesh(new THREE.CylinderGeometry(2, 2, h, 16), std({ color: 0x2a2a40 })), [tx, h / 2 - 2, -34]); put(outside, mesh(new THREE.ConeGeometry(2.6, 4, 16), std({ color: 0x1a2050 })), [tx, h, -34]);
    put(outside, new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1), basic(0xffc860)), [tx, h - 3, -31.9]); }
  // ceiling: conical wooden roof
  const roof = mesh(new THREE.ConeGeometry(Rr + 0.5, 6, 32, 1, true), std({ map: plankTex('#5a3a20'), side: THREE.BackSide }), false); roof.position.y = H + 3; S.add(roof);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const b = box(S, [0.4, 0.4, Rr], [Math.sin(a) * Rr / 2, H + 2.6, Math.cos(a) * Rr / 2], std({ map: plankTex('#3a2414') }), { r: 0.04, cast: false, solid: false }); b.rotation.y = a; b.rotation.x = 0.55; }
  // canopy bed (left)
  const wd = std({ map: plankTex('#6a3a1e') });
  box(S, [4.0, 1.1, 6.4], [-5.2, 0.55, -2.6], wd, { r: 0.08, name: 'bed frame' });
  box(S, [3.8, 0.55, 6.2], [-5.2, 1.4, -2.6], std({ color: 0xf2ece0 }), { r: 0.18, name: 'mattress' });
  const quilt = ctex(256, 256, (c, w, h) => { c.fillStyle = '#2a6a5a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8b840'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { c.beginPath(); c.moveTo(i * 32 + 16, j * 32 + 4); c.lineTo(i * 32 + 28, j * 32 + 16); c.lineTo(i * 32 + 16, j * 32 + 28); c.lineTo(i * 32 + 4, j * 32 + 16); c.fill(); } noiseFill(c, w, h, 0.08, 800); });
  box(S, [4.0, 0.3, 4.2], [-5.2, 1.78, -1.4], std({ map: quilt, roughness: 1 }), { r: 0.12, name: 'quilt' });
  box(S, [2.6, 0.55, 1.1], [-5.2, 1.95, -5.0], std({ color: 0xffffff }), { r: 0.22, name: 'pillow' });
  for (const [px, pz] of [[-7.1, -5.7], [-3.3, -5.7], [-7.1, 0.5], [-3.3, 0.5]]) box(S, [0.3, 7.2, 0.3], [px, 3.6, pz], wd, { r: 0.04, name: 'bedpost' });
  box(S, [4.4, 0.3, 6.8], [-5.2, 7.3, -2.6], std({ color: 0x7a1a3a, roughness: 1 }), { r: 0.05, cast: false, solid: false });
  for (const sx of [-1, 1]) { const cur = mesh(new THREE.PlaneGeometry(1.4, 5.6, 4, 1), std({ color: 0x9a2a4a, side: THREE.DoubleSide, roughness: 1 })); cur.position.set(-5.2 + sx * 2.1, 4.4, -5.7); S.add(cur); }
  // nightstand with candle + book
  box(S, [1.4, 1.8, 1.4], [-1.9, 0.9, -5.3], wd, { r: 0.06, name: 'nightstand' });
  const cd = candle(S, [-1.7, 1.8, -5.1], { h: 0.7, light: 7, dist: 10 });
  box(S, [0.8, 0.2, 1.0], [-2.2, 1.9, -5.5], std({ color: 0x3a5ab8 }), { r: 0.04, solid: false });
  // toy chest + toy knight + wooden sword (right)
  box(S, [3.0, 1.6, 1.8], [6.0, 0.8, -4.8], std({ map: plankTex('#8a5a2a') }), { r: 0.1, name: 'toy chest' });
  box(S, [3.1, 0.2, 1.9], [6.0, 1.65, -4.8], std({ color: 0x3a2a1a }), { r: 0.06, name: 'chest lid' });
  const toyK = new THREE.Group(); toyK.position.set(6.6, 1.75, -4.8); S.add(toyK); const tm2 = std({ color: 0xb8bcc8, metalness: 0.7, roughness: 0.3 });
  put(toyK, mesh(new THREE.BoxGeometry(0.5, 0.6, 0.35), tm2), [0, 0.5, 0]); put(toyK, mesh(new THREE.SphereGeometry(0.22, 10, 8), tm2), [0, 0.98, 0]); put(toyK, mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), std({ color: 0x3a2a1a })), [-0.12, 0.1, 0]); put(toyK, mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), std({ color: 0x3a2a1a })), [0.12, 0.1, 0]);
  put(toyK, mesh(new THREE.ConeGeometry(0.08, 0.3, 6), std({ color: 0xc8302a })), [0, 1.25, 0]);
  put(S, mesh(new THREE.BoxGeometry(0.15, 2.0, 0.08), std({ map: plankTex('#a07a4a') })), [5.0, 2.6, -4.6], [0, 0, 0.3]);
  // bookshelf (right wall) + tapestry
  const bs = new THREE.Group(); bs.position.set(8.4, 0, 0.2); bs.rotation.y = -Math.PI / 2 + 0.25; S.add(bs);
  put(bs, mesh(new THREE.BoxGeometry(3.4, 6, 0.9), std({ map: plankTex('#5a3a20') })), [0, 3, 0]);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) put(bs, mesh(new THREE.BoxGeometry(0.32, 0.9 + (i % 3) * 0.15, 0.6), std({ color: [0xc8402a, 0x2a6aa8, 0xe8b830, 0x4a8a4a, 0x8a4a8a][(i + r) % 5] })), [-1.3 + i * 0.42, 0.8 + r * 1.45, 0.25]);
  const tap = mesh(new THREE.PlaneGeometry(3.6, 4.8), std({ map: ctex(192, 256, (c, w, h) => { c.fillStyle = '#3a2a6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8b840'; c.fillRect(6, 6, w - 12, 6); c.fillRect(6, h - 12, w - 12, 6);
    c.fillStyle = '#d8603a'; c.beginPath(); c.ellipse(96, 140, 50, 26, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(60, 130); c.lineTo(20, 80); c.lineTo(80, 118); c.fill(); c.beginPath(); c.moveTo(130, 130); c.lineTo(176, 80); c.lineTo(112, 118); c.fill();
    c.beginPath(); c.arc(150, 112, 18, 0, 7); c.fill(); c.fillStyle = '#ffd04a'; c.beginPath(); c.moveTo(160, 100); c.lineTo(185, 92); c.lineTo(166, 112); c.fill(); noiseFill(c, w, h, 0.1, 1200); }), roughness: 1, side: THREE.DoubleSide }), false);
  tap.position.set(-8.3, 6.4, 3.8); tap.rotation.y = Math.PI / 2 - 0.4; S.add(tap);
  // rug
  const rug = mesh(new THREE.CircleGeometry(3.6, 40), std({ map: ctex(256, 256, (c, w, h) => { for (let r = 8; r > 0; r--) { c.fillStyle = ['#8a2a3a', '#e8b840', '#2a5a7a', '#f2e8d0'][r % 4]; c.beginPath(); c.arc(128, 128, r * 16, 0, 7); c.fill(); } noiseFill(c, w, h, 0.1, 1500); }), roughness: 1 }), false);
  rug.rotation.x = -Math.PI / 2; rug.position.set(1.6, 0.02, 0.8); S.add(rug);
  // wall sconce torch (unlit by default) + lights
  const tor = torch(S, [8.6, 5.0, -3.6], { ry: -68, lit: 0, light: 10 });
  S.add(new THREE.HemisphereLight(0x5a6aa8, 0x1a1410, 0.5));
  const moon = new THREE.SpotLight(0x9ab0ff, 260, 40, 0.38, 0.7, 1.4); moon.position.set(1.5, 9, -14); moon.target.position.set(0.5, 0, 1); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); S.add(moon, moon.target);
  const fill = new THREE.PointLight(0xffb878, 5, 16, 1.6); fill.position.set(2, 6, 7); S.add(fill);
  return { candle: cd, moon, torch: tor, update(t) { cd.update(t); tor.update(t); } };
}

export function battlements(S, { lit = 1 } = {}) {
  S.userData.look = 'night'; S.background = new THREE.Color(0x060a1c); S.fog = new THREE.Fog(0x1a2040, 40, 140);
  const sky = nightSky(S, { w: 260, h: 120, y: 40, z: -100, moon: [-26, 46], moonR: 5, stars: 160 });
  clouds(S, { night: true, n: 10, y: [30, 52], z: [-95, -70], x: 90 });
  const ZW = -14, HW = 10, TW = 3;
  box(S, [120, 0.3, 80], [0, -0.15, 10], tmat(TX.cobble(0x8a8478), 24, 16, {}), { r: 0, cast: false, name: 'ground' });
  const wm = tmat(ashlarTex('#9a8e7c'), 10, 2);
  box(S, [60, HW, TW], [0, HW / 2, ZW - TW / 2], wm, { r: 0, cast: false, name: 'curtain wall' });
  for (let x = -29; x <= 29; x += 2.2) box(S, [1.3, 1.5, 0.7], [x, HW + 0.75, ZW - TW + 0.35], wm, { r: 0.03, cast: false, solid: false });
  // stair up the wall face
  for (let i = 0; i < 20; i++) box(S, [0.55, 0.5 * (i + 1), 2.6], [11 - i * 0.5, 0.25 * (i + 1), ZW + 1.3], tmat(ashlarTex('#a89a86'), 0.3, 0.4), { r: 0.02, cast: false, name: 'step' + i });
  // towers + keep
  const tws = [];
  for (const [tx, r, h] of [[-17, 4.5, 18], [17, 4.5, 18]]) { const tw = mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 28), tmat(ashlarTex('#948874'), 3, 3), true); tw.position.set(tx, h / 2, ZW - 1.5); S.add(tw);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; put(S, mesh(new THREE.BoxGeometry(1.2, 1.4, 0.8), wm), [tx + Math.sin(a) * r, h + 0.7, ZW - 1.5 + Math.cos(a) * r], [0, a, 0]); }
    const rf = put(S, mesh(new THREE.ConeGeometry(r + 0.8, 8, 28), tmat(TX.shingle(0x2a3a8a), 5, 2)), [tx, h + 5.5, ZW - 1.5]);
    put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2), basic(0xffc860)), [tx + (tx < 0 ? 1.2 : -1.2), h - 6, ZW - 1.5 + r + 0.05]);
    const fp = put(S, mesh(new THREE.PlaneGeometry(1.6, 1.0), std({ color: 0xc8302a, side: THREE.DoubleSide })), [tx + 0.85, h + 11, ZW - 1.5]); tws.push(fp); }
  const keep = mesh(new THREE.BoxGeometry(22, 26, 12), tmat(ashlarTex('#80766a'), 4, 4)); keep.position.set(4, 13, -30); S.add(keep);
  for (let x = -6; x <= 14; x += 4) for (const y of [14, 20]) put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2), basic((x + y) % 3 ? 0xffc060 : 0x2a2a3a)), [x, y, -23.9]);
  const kr = put(S, mesh(new THREE.ConeGeometry(5, 10, 4), tmat(TX.shingle(0x2a3a8a), 4, 2)), [-4, 31, -30], [0, Math.PI / 4, 0]);
  put(S, mesh(new THREE.CylinderGeometry(3, 3, 30, 20), tmat(ashlarTex('#80766a'), 2, 4)), [-4, 15, -30]);
  // banners hanging on the wall face
  const flutter = [banner(S, [-9, 6.5, ZW + 0.05], [2.2, 5], bannerTex('#8a1a2a', '#e8b840', 'flame')), banner(S, [2, 6.5, ZW + 0.05], [2.2, 5], bannerTex('#1a3a7a', '#e8b840', 'crown'))];
  // torches on the wall face
  const torches = []; for (const x of [-10.5, -7, -3.5, 0]) torches.push(torch(S, [x, 4.6, ZW + 0.02], { lit, light: 16, dist: 16 }));
  for (const sx of [-1, 1]) torches.push(torch(S, [sx * 17, 5.0, ZW - 1.5 + 4.52], { lit, light: 16, dist: 16 }));
  for (const sx of [-1, 1]) { const px = sx * 12.5, pz = 1.5; box(S, [0.5, 5.2, 0.5], [px, 2.6, pz], std({ color: 0x2a2624, metalness: 0.6, roughness: 0.5 }), { r: 0.05, name: 'torch post' });
    torches.push(torch(S, [px, 4.0, pz + 0.27], { lit, light: 16, dist: 16 })); }
  // gate
  const gate = new THREE.Shape(); gate.moveTo(-3, 0); gate.lineTo(3, 0); gate.lineTo(3, 4.5); gate.absarc(0, 4.5, 3, 0, Math.PI, false); gate.lineTo(-3, 0);
  put(S, mesh(new THREE.ShapeGeometry(gate), std({ map: plankTex('#4a2c18'), roughness: 0.9 })), [-27, 0, ZW + 0.03]);
  // well, cart, barrels, hay
  const well = new THREE.Group(); well.position.set(-8, 0, -4); S.add(well);
  put(well, mesh(new THREE.CylinderGeometry(1.6, 1.7, 1.6, 20, 1, true), tmat(ashlarTex('#a09480'), 2, 0.5, { side: THREE.DoubleSide })), [0, 0.8, 0]);
  put(well, new THREE.Mesh(new THREE.CircleGeometry(1.5, 20), basic(0x05080f)), [0, 1.0, 0], [-Math.PI / 2, 0, 0]);
  for (const sx of [-1, 1]) put(well, mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), std({ map: plankTex('#5a3a20') })), [sx * 1.4, 2.4, 0]);
  const wr = put(well, mesh(new THREE.ConeGeometry(2.3, 1.4, 4), std({ map: plankTex('#5a2a1a') })), [0, 4.6, 0], [0, Math.PI / 4, 0]);
  box(S, [3.4, 3.4, 3.4], [-8, 1.7, -4], std({ transparent: true, opacity: 0 }), { r: 0, cast: false, name: 'well' }).visible = false;
  barrel(S, [-12, 0, -9.5], 1.1); barrel(S, [-10.3, 0, -10.6], 1.0); barrel(S, [-12.8, 0, -7.4], 0.9);
  const cart = new THREE.Group(); cart.position.set(10.5, 0, -2.5); cart.rotation.y = -0.5; S.add(cart);
  put(cart, mesh(new THREE.BoxGeometry(3.4, 1.2, 2.2), std({ map: plankTex('#7a4a28') })), [0, 1.4, 0]);
  for (const sx of [-1, 1]) put(cart, mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 14), std({ map: plankTex('#4a2c18') })), [sx * 0.9, 0.9, 1.2], [Math.PI / 2, 0, 0]);
  const hay = put(cart, mesh(new THREE.SphereGeometry(1.4, 12, 10), std({ color: 0xd8b04a, roughness: 1 })), [0, 2.1, 0]); hay.scale.set(1.2, 0.6, 0.8);
  put(cart, mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 6), std({ color: 0x5a3a20 })), [-2.6, 1.2, 0], [0, 0, 1.3]);
  box(S, [4.2, 3.2, 3.2], [10.5, 1.6, -2.5], std({ transparent: true, opacity: 0 }), { r: 0, cast: false, name: 'cart' }).visible = false;
  // lights: cool moon key + warm torch pools + a soft face fill toward camera
  S.add(new THREE.HemisphereLight(0x5a6ab0, 0x201810, 0.6));
  const moon = new THREE.DirectionalLight(0xa0b4ff, 1.5); moon.position.set(-20, 30, 20); moon.target.position.set(0, 0, -8); moon.castShadow = true;
  Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 120 }); S.add(moon, moon.target);
  const key = new THREE.PointLight(0xffc890, 8, 20, 1.6); key.position.set(2, 7, 6); S.add(key);
  return { torches, key, moon, sky, set(k) { torches.forEach(t => t.set(k)); },
    update(t) { torches.forEach(x => x.update(t)); flutter.forEach(f => f(t)); tws.forEach((f, i) => { f.rotation.y = Math.sin(t * 2 + i) * 0.4; }); } };
}
