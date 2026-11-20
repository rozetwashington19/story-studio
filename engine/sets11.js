// Episode 010 kit (Petals): falling "missing-you" petals, petal piles/carpets, a petal river, a care home (exterior + a
// sunset room), and small props (goldfish bowl, crossing-guard stop sign, kid drawings, shovel-ready petal bed).
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   petals(S, { n, col, col2, size, seed })  flutter-falling petals (instanced).  Returns update(t, center, { k, r, top, floor, wind, speed, spin })
//       center = [x,y,z] / Vector3 (the column's axis; petals spawn at center.y + top and land at `floor`), k 0..1 = how many are falling,
//       r = column radius, wind = [x,z] sideways drift per unit fallen, speed = fall speed (units/s ≈ 1.6 × speed).
//       Petals appear out of nowhere (they grow in at the top) and settle flat on the floor before vanishing.
//   petalRiver(S, pts, { n, width, col, col2, size, speed })  a stream of petals flowing along a CatmullRom path · update(t, k, from 0..1)
//       (`from` lets the stream "grow" along the path: 0 = whole path, petals only shown up to k-growth via .reach(u)) — see shots in 010.
//   petalPile(S, [x,y,z], { rx, rz, h, col })  pink mound of petals (textured dome) · .set(k) grows it (0 = flat/hidden)
//   petalCarpet(S, [x,y,z], [w,d], { density })  scattered petals lying on a floor/bed/table (alpha decal) · .set(k) fades it in
//   fishbowl(S, [x,y,z], s)  glass bowl + goldfish · .update(t, look) (look = 1 → fish stares out front)
//   stopSign(S)  crossing-guard hand sign (hold it at a hand; pole points down from the hand) · drawing(S, kind, w) kid crayon drawing plane
//       kinds: rocket sun family flower grandpa cat house rainbow · drawingStack(S, [x,y,z], n)
//   onePetal(S, size, col)  one hero petal mesh (animate it yourself)
//   sunnyPines(S, { time: 'day'|'sunset', grandpaWin })  care-home front: one-storey building (front z=-14, x ±24), entrance + "SUNNY PINES" sign at x 0,
//       windows y≈4.2 (Grandpa's window = env.win at x 9, lit warm), flower beds, pines, path (x ±2.5) to the door, bench (-8,-8). env.key, env.update(t)
//   careRoom(S, { time: 'sunset'|'day' })  Grandpa's room: big window on the back wall (x -2.5, y 5, z -9) with sunset sky + garden, armchair (seat top 1.7,
//       sit at (-3.6, -5.0)) and a wooden chair (seat top 1.7, sit at (1.6, -5.0)) facing +z, lamp (warm practical key, env.lamp) at (5.2, -6.8),
//       bed along the right wall (x 6.5), frames, plant, radio, calendar. Window-pane shadows fall across the chairs (env.sun). Front wall z=11 for reverse shots.
import * as THREE from 'three';
import { std, box, T, dayLight, room } from './sets.js';
import { T2 } from './sets2.js';
import { clouds } from './clouds.js';
import { patternLight } from './themes.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
const tag = (g, name, part = 'prop') => { g.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = part; } }); return g; };
const V3 = (a) => (a && a.isVector3) ? a : new THREE.Vector3(...a);

// ---------------- petals ----------------
// one petal: a slightly cupped teardrop (bent plane)
function petalGeo(size) {
  const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(0.55, -0.25, 0.45, 0.35, 0, 0.5); s.bezierCurveTo(-0.45, 0.35, -0.55, -0.25, 0, -0.5);
  const g = new THREE.ShapeGeometry(s, 6); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, (x * x) * 0.5 + y * 0.12); }
  g.computeVertexNormals(); g.scale(size, size * 1.15, size); return g;
}
const PINKS = [0xff9ec4, 0xffb8d4, 0xff86b4, 0xffd0e2, 0xf7a0c8];
export function petals(S, { n = 160, col = null, size = 0.22, seed = 7 } = {}) {
  const R = rng(seed);
  const im = new THREE.InstancedMesh(petalGeo(size), std({ color: 0xffffff, roughness: 0.55, side: THREE.DoubleSide, emissive: 0xff7aa8, emissiveIntensity: 0.12 }), n);
  im.castShadow = true; im.frustumCulled = false; S.add(im);
  const c = new THREE.Color();
  const P = [...Array(n)].map((_, i) => { im.setColorAt(i, c.set(col || PINKS[i % PINKS.length]).offsetHSL(0, 0, (R() - 0.5) * 0.08)); return { a: R() * 6.283, rr: Math.sqrt(R()), off: R(), fl: 0.6 + R() * 0.8, ph: R() * 6.28, sp: 0.8 + R() * 0.4, rot: R() * 6.28 }; });
  im.instanceColor.needsUpdate = true;
  const o = new THREE.Object3D(); const C = new THREE.Vector3();
  return (t, center, { k = 1, r = 1.6, top = 4.5, floor = 0, wind = [0, 0], speed = 1, spin = 1, rest = 0.9 } = {}) => {
    C.copy(V3(center)); const H = Math.max(0.5, C.y + top - floor);
    for (let i = 0; i < n; i++) {
      const p = P[i]; const on = i < n * k;
      // u: 0 at spawn (top) → 1 landed; then rests for `rest` seconds
      const cyc = (H / (1.6 * speed * p.sp)) + rest; const u0 = ((t + p.off * cyc) % cyc) / (H / (1.6 * speed * p.sp));
      if (!on) { o.position.set(0, -50, 0); o.scale.setScalar(0.0001); o.updateMatrix(); im.setMatrixAt(i, o.matrix); continue; }
      const u = Math.min(1, u0), fallen = u * H;
      const fx = Math.sin(t * 2.2 * p.fl + p.ph) * 0.35, fz = Math.cos(t * 1.7 * p.fl + p.ph) * 0.3;
      const x = C.x + Math.cos(p.a) * p.rr * r + (u < 1 ? fx : 0) + wind[0] * fallen, z = C.z + Math.sin(p.a) * p.rr * r + (u < 1 ? fz : 0) + wind[1] * fallen;
      const y = u < 1 ? C.y + top - fallen : floor + 0.03;
      o.position.set(x, y, z);
      if (u < 1) o.rotation.set(Math.sin(t * 3 * p.fl + p.ph) * 1.2 * spin + 0.6, p.rot + t * 1.5 * p.fl * spin, Math.cos(t * 2.4 * p.fl + p.ph) * 0.9 * spin);
      else o.rotation.set(-Math.PI / 2, 0, p.rot);
      const grow = Math.min(1, u0 * 6), land = u0 > 1 ? Math.max(0, 1 - (u0 - 1) * (H / (1.6 * speed * p.sp)) / rest) : 1;
      o.scale.setScalar(Math.max(0.0001, grow * land)); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  };
}
export function petalRiver(S, pts, { n = 220, width = 0.8, size = 0.22, speed = 0.08, seed = 11, glow = 0 } = {}) {
  const R = rng(seed); const curve = new THREE.CatmullRomCurve3(pts.map(V3));
  const im = new THREE.InstancedMesh(petalGeo(size), std({ color: 0xffffff, roughness: 0.55, side: THREE.DoubleSide, emissive: 0xff7aa8, emissiveIntensity: 0.15 + glow }), n);
  im.castShadow = true; im.frustumCulled = false; S.add(im); const c = new THREE.Color();
  const P = [...Array(n)].map((_, i) => { im.setColorAt(i, c.set(PINKS[i % PINKS.length])); return { off: R(), dx: (R() - 0.5) * 2, dy: (R() - 0.5) * 2, dz: (R() - 0.5) * 2, ph: R() * 6.28, fl: 0.7 + R() * 0.6, sp: 0.8 + R() * 0.4 }; });
  im.instanceColor.needsUpdate = true; const o = new THREE.Object3D(); let reach = 1;
  const api = (t, k = 1) => {
    for (let i = 0; i < n; i++) { const p = P[i]; const u = (p.off + t * speed * p.sp) % 1;
      if (i >= n * k || u > reach) { o.position.set(0, -50, 0); o.scale.setScalar(0.0001); o.updateMatrix(); im.setMatrixAt(i, o.matrix); continue; }
      const q = curve.getPointAt(u); const w = width * (0.6 + 0.4 * Math.sin(u * Math.PI));
      o.position.set(q.x + p.dx * w + Math.sin(t * 2 * p.fl + p.ph) * 0.25, q.y + p.dy * w * 0.6 + Math.sin(t * 2.6 * p.fl + p.ph) * 0.2, q.z + p.dz * w);
      o.rotation.set(Math.sin(t * 3 * p.fl + p.ph) * 1.3 + 0.5, t * 1.4 * p.fl + p.ph, Math.cos(t * 2.2 * p.fl) * 0.9);
      o.scale.setScalar(Math.min(1, u * 12, (1 - u) * 12)); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    im.instanceMatrix.needsUpdate = true; };
  api.reach = (u) => { reach = u; }; api.curve = curve; return api;
}
const petalTex = (bg = null, n = 420, seed = 3) => ctex(512, 512, (x, w, h) => {
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); } else x.clearRect(0, 0, w, h);
  const R = rng(seed); const cols = ['#ff9ec4', '#ffb8d4', '#ff86b4', '#ffd0e2', '#f7a0c8', '#ff7aa8'];
  for (let i = 0; i < n; i++) { x.save(); x.translate(R() * w, R() * h); x.rotate(R() * 6.28); const s = 7 + R() * 9;
    x.fillStyle = cols[i % cols.length]; x.beginPath(); x.ellipse(0, 0, s, s * 0.62, 0, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.ellipse(-s * 0.2, -s * 0.15, s * 0.45, s * 0.22, 0, 0, 7); x.fill(); x.restore(); } });
export function petalPile(S, [x, y, z], { rx = 2.2, rz = 1.6, h = 1.4, name = 'petal pile' } = {}) {
  const t = petalTex('#ff9ec4', 520, 5); t.repeat.set(2, 1);
  const m = mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), std({ map: t, roughness: 0.85, emissive: 0xff6a9a, emissiveIntensity: 0.06 }));
  m.position.set(x, y, z); m.scale.set(rx, h, rz); S.add(m); m.name = name; m.userData.solid = false;
  m.set = (k) => { m.scale.set(rx * (0.5 + 0.5 * k), Math.max(0.001, h * k), rz * (0.5 + 0.5 * k)); m.visible = k > 0.01; }; return m;
}
export function petalCarpet(S, [x, y, z], [w, d], { density = 1, seed = 3 } = {}) {
  const t = petalTex(null, Math.round(260 * density), seed); t.repeat.set(Math.max(1, w / 6), Math.max(1, d / 6));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 0.8, alphaTest: 0.02 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.02, z); m.receiveShadow = true; S.add(m);
  m.set = (k) => { m.material.opacity = k; m.visible = k > 0.01; }; return m;
}

// ---------------- props ----------------
export function fishbowl(S, [x, y, z], s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.2, depthWrite: false }));
  glass.position.y = 0.95; glass.scale.set(1, 0.95, 1); g.add(glass);
  const water = new THREE.Mesh(new THREE.SphereGeometry(0.96, 32, 16, 0, Math.PI * 2, Math.PI * 0.28, Math.PI * 0.72), new THREE.MeshStandardMaterial({ color: 0x6ac0e8, transparent: true, opacity: 0.35, roughness: 0.1, depthWrite: false }));
  water.position.y = 0.95; water.scale.set(1, 0.95, 1); g.add(water);
  const pebbles = mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.18, 16), std({ color: 0x8a7ae0 })); pebbles.position.y = 0.16; g.add(pebbles);
  const fish = new THREE.Group(); g.add(fish); const om = std({ color: 0xff8a1a, emissive: 0xff5a00, emissiveIntensity: 0.25, roughness: 0.4 });
  const bd = mesh(new THREE.SphereGeometry(0.28, 14, 10), om); bd.scale.set(0.75, 0.9, 1.25); fish.add(bd);
  const tail = mesh(new THREE.ConeGeometry(0.22, 0.35, 4), om); tail.rotation.x = -Math.PI / 2; tail.position.z = -0.42; fish.add(tail);
  for (const sx of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.06, 8, 6), std({ color: 0x111111 })); e.position.set(sx * 0.14, 0.07, 0.24); fish.add(e);
    const w = mesh(new THREE.SphereGeometry(0.03, 6, 4), std({ color: 0xffffff, emissive: 0xffffff })); w.position.set(sx * 0.17, 0.09, 0.28); fish.add(w); }
  tag(g, 'fishbowl');
  return { group: g, fish, update(t, look = 0) { const a = t * 1.3;
    const px = Math.cos(a) * 0.45 * (1 - look), pz = Math.sin(a) * 0.45 * (1 - look) + look * 0.35;
    fish.position.set(px, 0.95 + Math.sin(t * 2) * 0.08, pz); fish.rotation.y = look > 0.5 ? 0 : -a; tail.rotation.y = Math.sin(t * 14) * 0.5; } };
}
export function stopSign(S) {
  const g = new THREE.Group(); S.add(g);
  const pole = mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 8), std({ color: 0xd8d8d8, metalness: 0.6, roughness: 0.4 })); pole.position.y = 0.6; g.add(pole);
  const tx = ctex(256, 256, (c, w, h) => { c.fillStyle = '#d82a2a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 12; c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * 6.283; c.lineTo(w / 2 + Math.cos(a) * 110, h / 2 + Math.sin(a) * 110); } c.closePath(); c.stroke();
    c.fillStyle = '#fff'; c.font = '900 76px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STOP', w / 2, h / 2 + 4); });
  const oct = mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 8), [std({ color: 0xd82a2a }), std({ map: tx }), std({ map: tx })]);
  oct.rotation.x = Math.PI / 2; oct.rotation.y = Math.PI / 8; oct.position.y = 2.4; g.add(oct);
  tag(g, 'stopsign'); return g;
}
const DRAW = {
  rocket: (c, w, h) => { c.fillStyle = '#e8e8f0'; c.beginPath(); c.moveTo(w / 2, 40); c.quadraticCurveTo(w / 2 + 60, 120, w / 2 + 40, 240); c.lineTo(w / 2 - 40, 240); c.quadraticCurveTo(w / 2 - 60, 120, w / 2, 40); c.fill();
    c.fillStyle = '#e8302a'; c.beginPath(); c.moveTo(w / 2, 40); c.lineTo(w / 2 + 30, 90); c.lineTo(w / 2 - 30, 90); c.fill(); c.fillRect(w / 2 - 75, 200, 40, 60); c.fillRect(w / 2 + 35, 200, 40, 60);
    c.fillStyle = '#3a8ae8'; c.beginPath(); c.arc(w / 2, 140, 22, 0, 7); c.fill(); c.fillStyle = '#ffb020'; c.beginPath(); c.moveTo(w / 2 - 30, 245); c.lineTo(w / 2, 320); c.lineTo(w / 2 + 30, 245); c.fill();
    c.fillStyle = '#ffd84a'; for (const [sx, sy] of [[40, 50], [200, 80], [60, 200], [210, 260]]) { c.beginPath(); c.arc(sx, sy, 7, 0, 7); c.fill(); } },
  sun: (c, w, h) => { c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(w / 2, h / 2 - 20, 60, 0, 7); c.fill(); c.strokeStyle = '#ffa020'; c.lineWidth = 9; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * 75, h / 2 - 20 + Math.sin(a) * 75); c.lineTo(w / 2 + Math.cos(a) * 105, h / 2 - 20 + Math.sin(a) * 105); c.stroke(); }
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(w / 2 - 20, h / 2 - 30, 7, 0, 7); c.arc(w / 2 + 20, h / 2 - 30, 7, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = '#1a1a1a'; c.beginPath(); c.arc(w / 2, h / 2 - 15, 25, 0.3, 2.8); c.stroke(); c.fillStyle = '#5ac040'; c.fillRect(0, h - 50, w, 50); },
  family: (c, w, h) => { c.fillStyle = '#5ac040'; c.fillRect(0, h - 50, w, 50); const fig = (x, s, col, hair) => { c.strokeStyle = '#2a2a2a'; c.lineWidth = 6; c.fillStyle = '#f2c8a0'; c.beginPath(); c.arc(x, h - 190 * s, 22 * s, 0, 7); c.fill(); c.stroke();
      if (hair) { c.fillStyle = hair; c.fillRect(x - 22 * s, h - 215 * s, 44 * s, 12 * s); } c.fillStyle = col; c.fillRect(x - 20 * s, h - 165 * s, 40 * s, 70 * s); c.beginPath(); c.moveTo(x - 10 * s, h - 95 * s); c.lineTo(x - 18 * s, h - 50); c.moveTo(x + 10 * s, h - 95 * s); c.lineTo(x + 18 * s, h - 50); c.stroke(); };
    fig(60, 1.1, '#6a8a3a', '#e8e8e8'); fig(140, 0.8, '#f2b02a', '#1a1008'); fig(205, 1.0, '#3a6ae8', '#3a2010'); c.fillStyle = '#e8302a'; c.font = '700 40px Inter'; c.fillText('♥', 100, 80); },
  flower: (c, w, h) => { c.strokeStyle = '#3a9a3a'; c.lineWidth = 10; c.beginPath(); c.moveTo(w / 2, h - 30); c.lineTo(w / 2, 150); c.stroke(); c.fillStyle = '#ff86b4'; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; c.beginPath(); c.ellipse(w / 2 + Math.cos(a) * 40, 120 + Math.sin(a) * 40, 30, 20, a, 0, 7); c.fill(); }
    c.fillStyle = '#ffd040'; c.beginPath(); c.arc(w / 2, 120, 24, 0, 7); c.fill(); },
  grandpa: (c, w, h) => { c.fillStyle = '#f2c8a0'; c.beginPath(); c.arc(w / 2, 130, 70, 0, 7); c.fill(); c.strokeStyle = '#2a2a2a'; c.lineWidth = 6; c.stroke(); c.fillStyle = '#e8e8e8'; c.fillRect(w / 2 - 70, 60, 30, 40); c.fillRect(w / 2 + 40, 60, 30, 40);
    c.beginPath(); c.arc(w / 2 - 25, 120, 16, 0, 7); c.arc(w / 2 + 25, 120, 16, 0, 7); c.stroke(); c.beginPath(); c.arc(w / 2, 150, 30, 0.3, 2.8); c.stroke(); c.fillStyle = '#6a8a3a'; c.fillRect(w / 2 - 80, 205, 160, 110);
    c.fillStyle = '#e8302a'; c.font = '700 34px Inter'; c.textAlign = 'center'; c.fillText('GRANDPA', w / 2, 300); },
  cat: (c, w, h) => { c.fillStyle = '#f29a3a'; c.beginPath(); c.arc(w / 2, 180, 80, 0, 7); c.fill(); c.beginPath(); c.moveTo(w / 2 - 70, 140); c.lineTo(w / 2 - 50, 60); c.lineTo(w / 2 - 20, 110); c.moveTo(w / 2 + 70, 140); c.lineTo(w / 2 + 50, 60); c.lineTo(w / 2 + 20, 110); c.fill();
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(w / 2 - 28, 170, 9, 0, 7); c.arc(w / 2 + 28, 170, 9, 0, 7); c.fill(); },
  house: (c, w, h) => { c.fillStyle = '#e8c87a'; c.fillRect(50, 150, 160, 130); c.fillStyle = '#c83a2a'; c.beginPath(); c.moveTo(30, 150); c.lineTo(w / 2, 50); c.lineTo(w - 30, 150); c.fill(); c.fillStyle = '#6a4a2a'; c.fillRect(110, 210, 40, 70); c.fillStyle = '#7ac0f0'; c.fillRect(70, 175, 30, 30); c.fillRect(165, 175, 30, 30); },
  rainbow: (c, w, h) => { ['#e8302a', '#ff9a2a', '#ffd84a', '#5ac040', '#3a8ae8', '#8a5ad8'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 16; c.beginPath(); c.arc(w / 2, 260, 110 - i * 16, Math.PI, 0); c.stroke(); }); },
};
export function drawing(S, kind = 'rocket', w = 1.0) {
  const tx = ctex(256, 340, (c, W, H) => { c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, W, H); c.save(); DRAW[kind](c, W, H); c.restore(); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 4; c.strokeRect(2, 2, W - 4, H - 4);
    c.fillStyle = 'rgba(120,90,60,0.08)'; c.fillRect(0, 0, W, H); });
  const m = mesh(new THREE.PlaneGeometry(w, w * 340 / 256), std({ map: tx, side: THREE.DoubleSide, roughness: 0.9 }), false); S.add(m); return m;
}
export function drawingStack(S, [x, y, z], n = 6, w = 1.0) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g); const kinds = Object.keys(DRAW);
  for (let i = 0; i < n; i++) { const d = drawing(S, kinds[i % kinds.length], w); S.remove(d); d.rotation.set(-Math.PI / 2, 0, (i - n / 2) * 0.12); d.position.set((i % 3 - 1) * 0.06, i * 0.012, (i % 2) * 0.05); g.add(d); }
  return g;
}

// ---------------- sets ----------------
function pine(S, [x, z], h = 9, col = 0x2f6a3a) { const tr = std({ color: 0x5a3a22 }); box(S, [0.7, h * 0.3, 0.7], [x, h * 0.15, z], tr, { r: 0.1, solid: false });
  const m = std({ color: col, roughness: 0.9 }); for (let i = 0; i < 3; i++) { const c = mesh(new THREE.ConeGeometry(h * (0.32 - i * 0.07), h * 0.42, 9), m); c.position.set(x, h * (0.38 + i * 0.2), z); S.add(c); } }
export function sunnyPines(S, { time = 'day', grandpaWin = 9 } = {}) {
  const sunset = time === 'sunset';
  const sun = dayLight(S, { sunPos: sunset ? [-16, 9, 12] : [-9, 16, 12], intensity: sunset ? 3.2 : 3.4, area: 30 });
  if (sunset) { sun.color.set(0xffb070); S.background = T.sky('#5a6ab8', '#ffb07a'); S.fog = new THREE.Fog(0xf0b890, 40, 120); clouds(S, { tint: 0xffc8a0, seed: 9 }); }
  box(S, [140, 0.3, 90], [0, -0.15, 0], std({ map: (() => { const t = T2.grass().clone(); t.repeat.set(16, 11); t.needsUpdate = true; return t; })() }), { r: 0, cast: false, solid: false, name: 'ground' });
  box(S, [5, 0.32, 26], [0, -0.12, 0], std({ map: (() => { const t = T.concrete(0xd2c8b8).clone(); t.repeat.set(1, 6); t.needsUpdate = true; return t; })() }), { r: 0, cast: false, solid: false, name: 'path' });
  // building
  const wallT = T.plaster(0xf2e6cf);
  box(S, [48, 9, 8], [0, 4.5, -18], std({ map: wallT }), { r: 0, cast: false, name: 'home' });
  box(S, [50, 0.8, 9.6], [0, 9.2, -17.8], std({ color: 0x8a4a3a, roughness: 0.8 }), { r: 0.1, cast: false, name: 'home roof' });
  box(S, [50, 3.4, 0.6], [0, 10.9, -20.5], std({ color: 0x7a3e30 }), { r: 0.05, cast: false, rot: [-30 * D, 0, 0] });
  // entrance + sign
  box(S, [6, 7.2, 1.6], [0, 3.6, -13.4], std({ color: 0xf8f2e6 }), { r: 0.1, cast: false, name: 'porch' });
  box(S, [3.2, 5.2, 0.3], [0, 2.6, -12.55], std({ color: 0x5a7aa0, emissive: 0x3a5070, emissiveIntensity: 0.3, roughness: 0.1 }), { r: 0.02, cast: false, name: 'door' });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.8), std({ map: T2.sign('SUNNY PINES', '#3a6a4a', '#fff4d8'), emissive: 0x222222 })); sg.position.set(0, 8.0, -12.55); S.add(sg);
  // windows (Grandpa's = warm, lit)
  let win = null;
  for (const x of [-20, -15, -9, -5, 5, 9, 15, 20]) {
    const mine = x === grandpaWin;
    box(S, [3.0, 3.2, 0.2], [x, 4.6, -13.95], std({ color: 0xf8f2e6 }), { r: 0.04, cast: false, solid: false });
    const g = box(S, [2.6, 2.8, 0.1], [x, 4.6, -13.85], std({ color: mine ? 0xffd8a0 : 0x8ab0d0, emissive: mine ? 0xffb060 : 0x3a5070, emissiveIntensity: mine ? 0.9 : 0.25, roughness: 0.1 }), { r: 0, cast: false, solid: false });
    box(S, [3.4, 0.25, 0.6], [x, 3.0, -13.7], std({ color: 0xf8f2e6 }), { r: 0.04, cast: false, solid: false });
    // flower box under each window
    box(S, [2.8, 0.5, 0.6], [x, 2.7, -13.5], std({ color: 0x8a5a3a }), { r: 0.05, cast: false, solid: false });
    for (let i = 0; i < 5; i++) { const f = mesh(new THREE.SphereGeometry(0.2, 8, 6), std({ color: [0xff6a8a, 0xffd040, 0xffffff, 0xc87aff][(i + x) & 3] })); f.position.set(x - 1.1 + i * 0.55, 3.05, -13.45); S.add(f); }
    if (mine) win = g;
  }
  const winLight = new THREE.PointLight(0xffb060, 6, 9, 1.6); winLight.position.set(grandpaWin, 4.6, -12.6); S.add(winLight);
  // flower beds, bushes, pines, bench, lamps
  const R = rng(21); const fl = [0xff86b4, 0xffd040, 0xffffff, 0xc87aff, 0xff6a4a];
  const fg = new THREE.SphereGeometry(0.22, 7, 5), fim = new THREE.InstancedMesh(fg, std({ color: 0xffffff, roughness: 0.6 }), 260), o = new THREE.Object3D();
  for (let i = 0; i < 260; i++) { const sx = R() < 0.5 ? -1 : 1; o.position.set(sx * (4 + R() * 18), 0.4 + R() * 0.3, -12.4 + R() * 2.4); o.updateMatrix(); fim.setMatrixAt(i, o.matrix); fim.setColorAt(i, new THREE.Color(fl[i % 5])); } S.add(fim);
  const bush = std({ color: 0x3f8a3a, roughness: 0.9 });
  for (const x of [-22, -17, -12, -7, 7, 12, 17, 22]) box(S, [3, 1.4, 1.6], [x, 0.7, -11.6], bush, { r: 0.6, solid: false });
  for (const [x, z, h] of [[-30, -10, 12], [30, -12, 13], [-34, -24, 14], [36, -26, 15], [-26, 6, 10], [27, 4, 11]]) pine(S, [x, z], h);
  box(S, [4, 0.3, 1.2], [-8, 1.4, -8], std({ map: T.planks(0x8a5a30) }), { r: 0.04, name: 'bench' });
  for (const sx of [-1, 1]) box(S, [0.2, 1.4, 1.0], [-8 + sx * 1.7, 0.7, -8], std({ color: 0x2a2a2a }), { r: 0.03, name: 'bench leg' });
  for (const x of [-4.5, 4.5]) { box(S, [0.25, 5, 0.25], [x, 2.5, -4], std({ color: 0x2a2c30, metalness: 0.5 }), { r: 0.05, name: 'lamp' }); box(S, [0.7, 0.8, 0.7], [x, 5.3, -4], std({ color: 0xfff0c0, emissive: 0xffd080, emissiveIntensity: sunset ? 1.2 : 0.3 }), { r: 0.1, solid: false }); }
  const key = new THREE.PointLight(0xffd8b0, sunset ? 10 : 4, 16, 1.6); key.position.set(3, 6, 6); S.add(key);
  return { sun, key, win, winPos: new THREE.Vector3(grandpaWin, 4.6, -13.8), update(t) { winLight.intensity = 6 + Math.sin(t * 2) * 0.4; } };
}
export function careRoom(S, { time = 'sunset' } = {}) {
  const sunset = time === 'sunset';
  room(S, { w: 18, d: 20, h: 9.5, wallCol: 0xe8d8b8, floorTex: (() => { const t = T.planks(0x9a6a44).clone(); t.repeat.set(3, 3); t.needsUpdate = true; return std({ map: t }); })(), zBack: -9, trim: 0xf6efe0 });
  box(S, [18, 9.5, 0.4], [0, 4.75, 11.2], std({ map: T.plaster(0xe8d8b8) }), { r: 0, cast: false, name: 'front wall' });
  S.add(new THREE.HemisphereLight(sunset ? 0xffd8b0 : 0xfff2e0, 0x5a4030, sunset ? 0.55 : 0.9));
  // big window, sky + garden beyond
  const skyT = ctex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); if (sunset) { g.addColorStop(0, '#6a78c8'); g.addColorStop(0.55, '#ffa070'); g.addColorStop(0.8, '#ffd090'); } else { g.addColorStop(0, '#5a90e0'); g.addColorStop(0.8, '#d8ecff'); }
    c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.75)'; for (const [x, y, r] of [[50, 60, 22], [80, 55, 28], [110, 64, 20], [180, 90, 18], [200, 85, 24]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    c.fillStyle = sunset ? '#3a5a3a' : '#4a8a3a'; c.fillRect(0, h * 0.82, w, h * 0.18); c.fillStyle = sunset ? '#2a4a30' : '#2f6a3a'; for (const x of [30, 90, 200, 240]) { c.beginPath(); c.moveTo(x - 18, h * 0.84); c.lineTo(x, h * 0.55); c.lineTo(x + 18, h * 0.84); c.fill(); }
    if (sunset) { c.fillStyle = '#fff0b0'; c.beginPath(); c.arc(150, 190, 18, 0, 7); c.fill(); } });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshBasicMaterial({ map: skyT, toneMapped: true })); sky.position.set(-2.5, 5.2, -10.2); S.add(sky);
  box(S, [6.0, 0.35, 0.5], [-2.5, 2.9, -8.75], std({ color: 0xf6efe0 }), { r: 0.04, cast: false, name: 'sill' });
  // wall with the window hole (4 pieces)
  const wm = std({ map: T.plaster(0xe8d8b8) });
  const frame = std({ color: 0xf6efe0 });
  box(S, [5.6, 0.3, 0.3], [-2.5, 7.35, -8.85], frame, { r: 0.03, cast: false, solid: false }); box(S, [0.3, 4.4, 0.3], [-5.2, 5.15, -8.85], frame, { r: 0.03, cast: false, solid: false }); box(S, [0.3, 4.4, 0.3], [0.2, 5.15, -8.85], frame, { r: 0.03, cast: false, solid: false });
  box(S, [0.14, 4.4, 0.16], [-2.5, 5.15, -8.85], frame, { r: 0, cast: false, solid: false }); box(S, [5.4, 0.14, 0.16], [-2.5, 5.15, -8.85], frame, { r: 0, cast: false, solid: false });
  // cut the back wall: cover the remaining wall areas around the opening
  S.children.filter(o => o.isMesh && Math.abs(o.position.z - (-9.2)) < 0.05 && o.geometry.parameters && o.geometry.parameters.width === 18 && o.position.y > 4).forEach(o => S.remove(o));
  box(S, [3.8, 9.5, 0.4], [-7.1, 4.75, -9.2], wm, { r: 0, cast: false, name: 'back wall L' });
  box(S, [8.8, 9.5, 0.4], [4.6, 4.75, -9.2], wm, { r: 0, cast: false, name: 'back wall R' });
  box(S, [5.4, 2.95, 0.4], [-2.5, 1.475, -9.2], wm, { r: 0, cast: false, name: 'back wall low' });
  box(S, [5.4, 2.15, 0.4], [-2.5, 8.425, -9.2], wm, { r: 0, cast: false, name: 'back wall high' });
  // curtains
  const cur = std({ color: 0xc86a5a, roughness: 0.95 });
  for (const x of [-5.9, 0.9]) box(S, [1.0, 5.6, 0.25], [x, 5.0, -8.7], cur, { r: 0.12, cast: false, solid: false });
  // sun through the window (pane pattern on the floor and the chairs)
  const sun = patternLight(S, { pos: [-4.5, 9.5, -17], target: [-1.0, 0.5, -3], col: sunset ? 0xffa860 : 0xfff0d0, intensity: sunset ? 1100 : 700, angle: 0.42, pattern: 'window', dist: 40 });
  // armchair (Grandpa) — seat top 1.7 at (-3.6, -5.0)
  const fab = std({ color: 0x5a6a8a, roughness: 0.95 });
  box(S, [3.6, 1.3, 2.8], [-3.6, 0.65, -5.6], fab, { r: 0.2, name: 'chair seat' });
  box(S, [4.2, 4.0, 0.8], [-3.6, 2.0, -7.3], fab, { r: 0.3, name: 'chair back' });
  for (const sx of [-1, 1]) box(S, [0.6, 2.3, 3.0], [-3.6 + sx * 2.1, 1.15, -5.8], fab, { r: 0.25, name: 'chair arm' });
  box(S, [3.2, 0.4, 2.4], [-3.6, 1.5, -5.4], std({ color: 0x6a7a9a }), { r: 0.18, name: 'cushion' });
  // knitted blanket over the chair back
  box(S, [3.2, 2.0, 0.2], [-3.6, 3.2, -6.85], std({ color: 0xd8a040, roughness: 1 }), { r: 0.08, cast: false, name: 'throw' });
  // wooden visitor chair — seat top 1.7 at (1.6, -5.0)
  const wd = std({ map: T.planks(0x8a5a34) });
  box(S, [2.6, 0.3, 2.4], [1.6, 1.55, -5.5], wd, { r: 0.05, name: 'vchair seat' });
  box(S, [2.6, 2.6, 0.25], [1.6, 2.9, -6.8], wd, { r: 0.05, name: 'vchair back' });
  for (const [dx, dz] of [[-1.1, -0.9], [1.1, -0.9], [-1.1, 0.9], [1.1, 0.9]]) box(S, [0.2, 1.4, 0.2], [1.6 + dx, 0.7, -5.5 + dz], wd, { r: 0.03, name: 'vchair leg' });
  // side table behind, between the chairs (cards + photo), lamp
  box(S, [1.6, 0.15, 1.4], [-0.9, 2.6, -7.9], wd, { r: 0.03, name: 'side table' }); box(S, [0.2, 2.5, 0.2], [-0.9, 1.25, -7.9], wd, { r: 0.03, name: 'side table leg' });
  box(S, [0.8, 1.0, 0.1], [-0.9, 3.2, -8.1], std({ color: 0x6a4a2a }), { r: 0.02, solid: false, rot: [-0.15, 0, 0] });
  box(S, [0.2, 4.2, 0.2], [5.2, 2.1, -6.8], std({ color: 0x3a3a3a }), { r: 0.05, name: 'lamp pole' });
  const sh = mesh(new THREE.CylinderGeometry(0.6, 0.85, 1.0, 20, 1, true), std({ color: 0xfff0d0, emissive: 0xffc070, emissiveIntensity: 0.9, side: THREE.DoubleSide })); sh.position.set(5.2, 4.5, -6.8); S.add(sh);
  const lamp = new THREE.PointLight(0xffb878, sunset ? 16 : 8, 16, 1.6); lamp.position.set(4.6, 4.4, -5.6); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.002; S.add(lamp);
  // bed on the right wall
  box(S, [4.2, 1.4, 7.5], [6.6, 0.7, 1.0], std({ map: T.planks(0x6a4428) }), { r: 0.05, name: 'bed frame' });
  box(S, [4.0, 0.5, 7.3], [6.6, 1.65, 1.0], std({ color: 0xf2eee6 }), { r: 0.15, name: 'mattress' });
  box(S, [4.1, 0.35, 4.6], [6.6, 2.0, 2.2], std({ color: 0x7a9ac8, roughness: 1 }), { r: 0.12, name: 'quilt' });
  box(S, [2.6, 0.5, 1.2], [6.6, 2.1, -2.0], std({ color: 0xffffff }), { r: 0.2, name: 'pillow' });
  box(S, [4.4, 3.4, 0.4], [6.6, 1.7, -3.0], std({ map: T.planks(0x6a4428) }), { r: 0.06, name: 'headboard' });
  // frames, calendar, plant, radio, shelf
  const frames = [[3.4, 6.2, 0xe8c8a0], [5.2, 6.6, 0xa8c8e8], [7.0, 6.0, 0xc8e0a8], [-7.2, 6.4, 0xf0c0c0]];
  for (const [x, y, c] of frames) { box(S, [1.2, 1.5, 0.1], [x, y, -8.95], std({ color: c }), { r: 0, solid: false, cast: false }); box(S, [1.45, 1.75, 0.06], [x, y, -9.0], std({ color: 0x5a3a20 }), { r: 0, solid: false, cast: false }); }
  box(S, [1.8, 2.2, 0.06], [-7.4, 3.6, -8.95], std({ map: T2.calendar ? T2.calendar() : null, color: T2.calendar ? 0xffffff : 0xf4f0e8 }), { r: 0, solid: false, cast: false });
  box(S, [1.1, 1.2, 1.1], [-7.6, 0.6, -7.6], std({ color: 0xb85a3a }), { r: 0.1, name: 'pot' });
  for (let i = 0; i < 7; i++) { const l = mesh(new THREE.SphereGeometry(0.7, 8, 6), std({ color: 0x3f8a3a })); l.position.set(-7.6 + Math.sin(i * 2.4) * 0.5, 1.6 + i * 0.35, -7.6 + Math.cos(i * 2.4) * 0.4); l.scale.set(1, 0.6, 1); S.add(l); }
  box(S, [3.4, 0.2, 1.0], [5.2, 3.0, -8.5], wd, { r: 0.03, cast: false, name: 'shelf' });
  box(S, [1.2, 0.8, 0.6], [4.4, 3.5, -8.5], std({ color: 0x8a3a2a }), { r: 0.12, cast: false, solid: false }); box(S, [0.5, 0.5, 0.1], [4.2, 3.5, -8.18], std({ color: 0xd8c8a0 }), { r: 0.05, cast: false, solid: false });
  box(S, [0.4, 0.9, 0.5], [5.6, 3.55, -8.5], std({ color: 0x3a6ab8 }), { r: 0.04, cast: false, solid: false }); box(S, [0.4, 0.8, 0.5], [6.1, 3.5, -8.5], std({ color: 0xd8a030 }), { r: 0.04, cast: false, solid: false });
  const rug = mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.04, 32), std({ color: 0x8a5a7a, roughness: 1 }), false); rug.position.set(-1, 0.02, -2.5); rug.scale.z = 0.7; S.add(rug);
  // warm fill from the camera side so faces stay readable against the window
  const fill = new THREE.PointLight(0xffd0a8, sunset ? 7 : 4, 18, 1.6); fill.position.set(0, 5.5, 4); S.add(fill);
  return { sun, lamp, fill, sky, update(t) { lamp.intensity = (sunset ? 16 : 8) * (1 + Math.sin(t * 9) * 0.006); } };
}
// a single petal mesh (pink), for hero moments: place/rotate it yourself
export function onePetal(S, size = 0.34, col = 0xff9ec4) { const m = mesh(petalGeo(size), std({ color: col, roughness: 0.55, side: THREE.DoubleSide, emissive: 0xff7aa8, emissiveIntensity: 0.2 })); S.add(m); return m; }
