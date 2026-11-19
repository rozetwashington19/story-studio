// Episode 008 kit (Launch Day): a 1980s-Miami-style neon beach city (original look, used as "Vice City, Leonida" in ep 008), a giant
// countdown billboard, power lines, flamingos, retro cars, the Wait (a neon-pink blob that grows when people wait), and a game room.
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   neonBeach(S, { time, view, shop, wires, billboard, cars, palms, sign })
//       time: 'sunset' | 'night' | 'dark' (power cut: neon off, moonlight) | 'dawn'
//       view: 'strip'  promenade (pastel pavers, x ±40, z -6..30) in front of a street (z -13..-6, retro cars cruise along x) and a row of
//                      pastel art-deco hotels (fronts z=-16, 12–22 tall) with neon trim + vertical neon fins; palms at z=-5 (x ±9, ±21).
//             'beach'  white sand toward the ocean (waterline z≈-22, waves roll), huge sun disc at sunset, palms, lifeguard tower, umbrellas.
//       shop: true      Pixel Palace game shop at the centre hotel's ground floor (door x -1.5..1.5, window x 2..6, sign y≈6.6, front z=-15.9).
//       wires: true     power poles at x=±18 (z=-7) with three wires across the street at y≈11.5–12.5; env.wires.sag(k, x) pulls them down.
//       billboard: [x,y,z] | false   countdown billboard (see countdown()); env.board.
//       sign: true      "WELCOME TO VICE CITY · LEONIDA" style neon welcome sign text = opts.signText.
//     env.neon(k)    neon power 0..1 (signs, trim, windows, the neon lights); env.wave(t0, t1, on) per-building sweep (dark → on).
//     env.key        warm/cool face key light (PointLight near the camera side).
//   countdown(S, { pos, scale, text, sub })  big neon billboard: a minimap-style ring with a "6" blip + digits. .set(text, sub, col), .power(k), .group, .top (y of the top edge)
//   powerLines(S, { x, z, y })  poles + 3 sagging wires. .sag(k, atX)
//   waitBlob(S, { name, size, glow }) the Wait: a cute neon-pink monster() blob with a soft glow. .grow(size), .animate(t, mood), .root
//   flamingo(S, [x,z], ry, s) pink wader. .update(t, mode) mode 'stand'|'walk'|'flap'
//   retroCar(S, col, { lights }) low pastel sports car (8 long, faces +X). Place via .position / .rotation
//   boombox(S) · tvSet(S, { w, h }) (.screen(mode, k): 'off'|'glow'|'load'|'seven') · gameConsole(S) · controller(S, col) · palm(S, [x,z], h, seed) (.sway(t))
//   gameRoom(S, { dawn, flash }) living room: couch along the back (seat top 1.6, seats at x -4.4/0/4.4, z -6.0), TV + console on the front
//                wall (z=+11, screen centre y 5.2), window with sunrise, posters, plants. env.tv, env.console (top y), env.key.
import * as THREE from 'three';
import { T, std, box, repeatMat } from './sets.js';
import { clouds } from './clouds.js';
import { monster } from './themes.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; t.userData = { canvas: c, draw }; return t; }
const glowM = (col) => new THREE.MeshBasicMaterial({ color: col });
const hx = c => '#' + new THREE.Color(c).getHexString();
const PASTEL = [0xf6a8c4, 0x9ee6cf, 0xffc79e, 0xc9b2f2, 0xa6d8f4, 0xfff0b0];
const NEON = [0xff3ab8, 0x2ae8ff, 0xff7a3a, 0xb05aff, 0x5aff9a];

const SKIES = {
  sunset: [[0, '#2a1458'], [0.42, '#a8306e'], [0.7, '#ff6a6a'], [0.86, '#ffa858'], [1, '#ffd890']],
  night: [[0, '#05031a'], [0.6, '#1e0c44'], [1, '#4a1a6a']],
  dark: [[0, '#03020e'], [0.6, '#0e0a28'], [1, '#22163e']],
  dawn: [[0, '#4a64c8'], [0.55, '#e890b0'], [1, '#ffd8a0']],
};
const skyTex = (stops) => ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); });

function starfield(S, n = 260, seed = 4) { const R = rng(seed), g = new THREE.BufferGeometry(), p = [];
  for (let i = 0; i < n; i++) { const a = (R() - 0.5) * Math.PI * 1.6, e = 0.2 + R() * 1.2, r = 160; p.push(Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r * 0.8 + 18, -Math.cos(a) * Math.cos(e) * r); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, fog: false, transparent: true, opacity: 0.85 })); S.add(pts); return pts; }

// ---------- palms ----------
export function palm(S, [x, z], h = 11, seed = 1) {
  const R = rng(seed), g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
  const bark = std({ map: ctex(64, 256, (c, w, hh) => { c.fillStyle = '#8a6a48'; c.fillRect(0, 0, w, hh); for (let y = 0; y < hh; y += 16) { c.fillStyle = '#6a4e34'; c.fillRect(0, y, w, 5); c.fillStyle = '#a4845e'; c.fillRect(0, y + 6, w, 2); } }), roughness: 0.9 });
  const lean = (R() - 0.5) * 0.3, n = 7; let px = 0, py = 0; const top = new THREE.Group();
  for (let i = 0; i < n; i++) { const sh = h / n, r = 0.42 - i * 0.03, s = mesh(new THREE.CylinderGeometry(r - 0.03, r, sh + 0.05, 10), bark);
    const bend = lean * (i / n) * 2.2; s.position.set(px + Math.sin(bend) * sh / 2, py + sh / 2, 0); s.rotation.z = -bend; g.add(s); px += Math.sin(bend) * sh; py += Math.cos(bend) * sh; }
  top.position.set(px, py, 0); g.add(top);
  const leaf = std({ color: 0x2f9a4a, roughness: 0.7, side: THREE.DoubleSide }), leafD = std({ color: 0x1f7a3a, roughness: 0.7, side: THREE.DoubleSide });
  const fr = [];
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + R(), f = new THREE.Group(); f.rotation.y = a; top.add(f);
    const geo = new THREE.PlaneGeometry(5.2, 1.1, 8, 1); const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const u = (p.getX(k) + 2.6) / 5.2; p.setX(k, u * 5.2); p.setY(k, p.getY(k) * (1 - u * 0.75)); p.setZ(k, 0); }
    geo.rotateX(Math.PI / 2); for (let k = 0; k < p.count; k++) { const u = p.getX(k) / 5.2; p.setY(k, 0.6 * u - 2.4 * u * u); } geo.computeVertexNormals();
    const m = mesh(geo, i % 2 ? leaf : leafD); f.add(m); fr.push({ f, ph: R() * 6 }); }
  for (let i = 0; i < 3; i++) { const c = mesh(new THREE.SphereGeometry(0.32, 10, 8), std({ color: 0x5a3a1e })); c.position.set(Math.cos(i * 2.1) * 0.35, -0.35, Math.sin(i * 2.1) * 0.35); top.add(c); }
  g.sway = (t) => { top.rotation.z = Math.sin(t * 0.9 + seed) * 0.04; fr.forEach(({ f, ph }) => { f.rotation.z = Math.sin(t * 1.6 + ph) * 0.07; }); };
  return g;
}

// ---------- countdown billboard ----------
export function countdown(S, { pos = [0, 14, -18], scale = 1, text = '12 DAYS', sub = 'UNTIL LAUNCH', col = '#ff3ab8', poles = true } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); g.scale.setScalar(scale); S.add(g);
  let state = { text, sub, col, k: 1 };
  const tex = ctex(1024, 512, () => {}); const cv = tex.userData.canvas, c = cv.getContext('2d');
  const draw = () => { const { text: tt, sub: ss, col: cc, k } = state; c.fillStyle = '#0a0618'; c.fillRect(0, 0, 1024, 512);
    c.globalAlpha = 0.25 + 0.75 * k; c.lineWidth = 14; c.strokeStyle = cc; c.shadowColor = cc; c.shadowBlur = 40 * k; c.strokeRect(18, 18, 988, 476);
    // minimap ring with a "6" blip
    c.lineWidth = 12; c.strokeStyle = '#2ae8ff'; c.shadowColor = '#2ae8ff'; c.beginPath(); c.arc(250, 256, 170, 0, 7); c.stroke();
    c.fillStyle = 'rgba(42,232,255,0.12)'; c.fill(); c.lineWidth = 4; c.beginPath(); c.moveTo(250, 100); c.lineTo(250, 412); c.moveTo(94, 256); c.lineTo(406, 256); c.stroke();
    c.fillStyle = cc; c.shadowColor = cc; c.beginPath(); c.arc(250, 256, 92, 0, 7); c.fill(); c.fillStyle = '#ffffff'; c.font = '900 150px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('6', 250, 266);
    c.textAlign = 'center'; c.fillStyle = '#fff6b0'; c.shadowColor = '#ffd23a'; c.font = `900 ${tt.length > 8 ? 104 : 128}px Inter, sans-serif`; c.fillText(tt, 710, 225);
    c.fillStyle = '#2ae8ff'; c.shadowColor = '#2ae8ff'; c.font = '800 52px Inter, sans-serif'; c.fillText(ss, 710, 352); c.globalAlpha = 1; c.shadowBlur = 0; tex.needsUpdate = true; };
  draw();
  const scrM = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.3, roughness: 0.5 });
  const frameM = std({ color: 0x2a2a38, metalness: 0.6, roughness: 0.4 });
  const W = 16, H = 8; const scr = new THREE.Mesh(new THREE.PlaneGeometry(W, H), scrM); scr.position.z = 0.31; g.add(scr);
  const back = mesh(new THREE.BoxGeometry(W + 0.8, H + 0.8, 0.6), frameM); g.add(back);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(W + 1.0, 0.25, 0.3), glowM(0xff3ab8)); trim.position.set(0, -H / 2 - 0.5, 0.2); g.add(trim);
  const trim2 = trim.clone(); trim2.material = glowM(0x2ae8ff); trim2.position.y = H / 2 + 0.5; g.add(trim2);
  if (poles) for (const s of [-1, 1]) { const p = mesh(new THREE.BoxGeometry(0.7, pos[1] / scale, 0.7), frameM); p.position.set(s * W * 0.3, -pos[1] / scale / 2, -0.4); g.add(p); }
  const light = new THREE.PointLight(0xff6ad8, 18 * scale, 26 * scale, 1.6); light.position.set(0, -H / 2 - 2, 4); g.add(light);
  const B = { group: g, top: pos[1] + (H / 2 + 0.4) * scale, w: W * scale, screen: scr,
    set(t2, s2 = state.sub, c2 = state.col) { if (t2 === state.text && s2 === state.sub && c2 === state.col) return; state = { ...state, text: t2, sub: s2, col: c2 }; draw(); },
    power(k) { if (Math.abs(k - state.k) > 0.01) { state.k = k; draw(); } scrM.emissiveIntensity = 1.3 * k; scrM.color.setScalar(0.15 + 0.85 * k); trim.material.color.set(0xff3ab8).multiplyScalar(0.08 + 0.92 * k); trim2.material.color.set(0x2ae8ff).multiplyScalar(0.08 + 0.92 * k); light.intensity = 18 * scale * k; } };
  return B;
}

// ---------- power lines ----------
export function powerLines(S, { x = 18, z = -7, y = 12, n = 3 } = {}) {
  const wood = std({ color: 0x5a4636, roughness: 0.9 });
  for (const s of [-1, 1]) { box(S, [0.6, y + 1.5, 0.6], [s * x, (y + 1.5) / 2, z], wood, { r: 0.05, name: 'pole' }); box(S, [0.4, 0.4, 3.4], [s * x, y, z], wood, { r: 0.04, solid: false }); }
  const wm = std({ color: 0x141418, roughness: 0.6 }); const W = [];
  for (let i = 0; i < n; i++) { const zz = z - 1.2 + i * 1.2; const N = 40; const pts = [...Array(N + 1)].map((_, k) => new THREE.Vector3(-x + 2 * x * k / N, y + 0.2, zz));
    const curve = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(curve, N, 0.07, 6), wm); S.add(m); W.push({ m, zz, pts, curve }); }
  let last = '';
  const L = { y, z, wires: W,
    // k = how hard it's pressed (0 = slack sag only), atX = where
    sag(k = 0, atX = 0) { const key = k.toFixed(3) + atX.toFixed(2); if (key === last) return; last = key;
      W.forEach(({ m, pts, curve }, i) => { pts.forEach((p, j) => { const u = j / (pts.length - 1), px = -x + 2 * x * u; const base = Math.sin(u * Math.PI) * 0.9;
        const d = Math.max(0, 1 - Math.abs(px - atX) / (x * 0.9)); p.set(px, y + 0.2 - base - k * 4.5 * Math.sin(Math.PI / 2 * d) ** 1.5 * (1 - i * 0.08), p.z); });
        m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length, 0.07, 6); }); } };
  L.sag(0, 0); return L;
}

// ---------- the Wait ----------
export function waitBlob(S, { name = 'wait', size = 1, col = 0xff5ab8, glow = 0.35, light = true, seed = 3 } = {}) {
  const m = monster(S, { name, col, belly: 0xffc0e4, shape: 'blob', eyes: 2, horns: false, teeth: false, arms: true, size, seed });
  m.root.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === new THREE.Color(col).getHex()) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(col); o.material.emissiveIntensity = glow; o.material.roughness = 0.35; } });
  // cheeks
  const ck = std({ color: 0xff8ac8, emissive: 0xff6ab8, emissiveIntensity: 0.3 });
  for (const s of [-1, 1]) { const c = mesh(new THREE.SphereGeometry(0.22, 12, 8), ck, false); c.scale.z = 0.3; c.position.set(s * 0.95, 1.9, 1.15); m.body.add(c); }
  let L = null; if (light) { L = new THREE.PointLight(col, 6, 10, 1.5); L.position.set(0, 2, 2.2); m.root.add(L); }
  m.size = size; m.light = L;
  m.grow = (s) => { m.size = s; m.root.scale.setScalar(s); if (L) { L.distance = 10 * s; L.intensity = 6 * Math.min(4, s); } };
  // squash(k): 1 = round, >1 = flattened puddle (sitting on wires)
  m.squash = (k) => { m.body.scale.set(1 * Math.sqrt(k), 1 / k, 1 * Math.sqrt(k)); };
  m.glow = (k) => { m.root.traverse(o => { if (o.isMesh && o.material.emissive && o.material.emissiveIntensity !== undefined && o.material.emissive.getHex() === new THREE.Color(col).getHex()) o.material.emissiveIntensity = glow * k; }); if (L) L.intensity = 6 * Math.min(4, m.size) * k; };
  // sleepy eyes: lids half closed
  m.sleepy = (k) => m.blink(k);
  return m;
}

// ---------- flamingo ----------
export function flamingo(S, [x, z], ry = 0, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry * D; g.scale.setScalar(s); S.add(g);
  const pk = std({ color: 0xff7ab0, roughness: 0.55 }), dk = std({ color: 0xe8508a, roughness: 0.55 }), lg = std({ color: 0xf0709a });
  const body = new THREE.Group(); body.position.y = 2.6; g.add(body);
  const b = mesh(new THREE.SphereGeometry(0.75, 16, 12), pk); b.scale.set(0.8, 0.75, 1.25); body.add(b);
  const tail = mesh(new THREE.ConeGeometry(0.35, 0.8, 8), dk); tail.rotation.x = -2.2; tail.position.set(0, 0.15, -0.95); body.add(tail);
  const wings = [-1, 1].map(sd => { const w = new THREE.Group(); w.position.set(sd * 0.5, 0.25, 0.1); body.add(w); const m = mesh(new THREE.SphereGeometry(0.5, 12, 8), dk); m.scale.set(0.25, 0.6, 1.1); m.position.set(sd * 0.1, 0, -0.15); w.add(m); return w; });
  const neck = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.3, 0.75), new THREE.Vector3(0, 1.1, 1.0), new THREE.Vector3(0, 1.6, 0.6), new THREE.Vector3(0, 2.2, 0.75)]);
  body.add(mesh(new THREE.TubeGeometry(neck, 16, 0.13, 8), pk));
  const head = new THREE.Group(); head.position.set(0, 2.25, 0.8); body.add(head); head.add(mesh(new THREE.SphereGeometry(0.24, 12, 10), pk));
  const beak = mesh(new THREE.ConeGeometry(0.11, 0.5, 8), std({ color: 0x222222 })); beak.rotation.x = 2.0; beak.position.set(0, -0.12, 0.3); head.add(beak);
  const bk2 = mesh(new THREE.ConeGeometry(0.13, 0.22, 8), std({ color: 0xfff0e0 })); bk2.rotation.x = 1.6; bk2.position.set(0, 0.0, 0.25); head.add(bk2);
  for (const sd of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), glowM(0x111111)); e.position.set(sd * 0.17, 0.06, 0.12); head.add(e); }
  const legs = [-1, 1].map(sd => { const l = new THREE.Group(); l.position.set(sd * 0.18, 2.2, 0); g.add(l); const m = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), lg); m.position.y = -1.1; l.add(m);
    const f = mesh(new THREE.BoxGeometry(0.3, 0.05, 0.4), lg); f.position.set(0, -2.18, 0.15); l.add(f); return l; });
  g.traverse(o => { if (o.isMesh) { o.userData.avatar = 'flamingo'; o.userData.part = 'flamingo'; } });
  g.update = (t, mode = 'stand') => { const ph = x * 1.7;
    if (mode === 'walk') { legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 5 + ph + i * Math.PI) * 0.4; }); body.position.y = 2.6 + Math.abs(Math.sin(t * 5 + ph)) * 0.06; head.rotation.x = Math.sin(t * 5 + ph) * 0.15; }
    else if (mode === 'flap') { wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (0.3 + Math.abs(Math.sin(t * 14 + ph)) * 1.2); }); legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 9 + ph + i * Math.PI) * 0.6; }); body.position.y = 2.6 + Math.abs(Math.sin(t * 9 + ph)) * 0.25; }
    else { legs[1].rotation.x = 0; legs[0].rotation.x = 0; body.position.y = 2.6 + Math.sin(t * 2 + ph) * 0.03; head.rotation.y = Math.sin(t * 0.8 + ph) * 0.5; wings.forEach(w => { w.rotation.z = 0; }); } };
  g.head = head; return g;
}

// ---------- retro car ----------
export function retroCar(S, col = 0xff6ab0, { lights = false, top = false } = {}) {
  const g = new THREE.Group(); S.add(g);
  const paint = std({ color: col, roughness: 0.25, metalness: 0.5 }), dark = std({ color: 0x1a1a22, roughness: 0.5 }), chrome = std({ color: 0xe8e8f0, metalness: 0.9, roughness: 0.15 });
  box(g, [8, 1.0, 3.4], [0, 1.05, 0], paint, { r: 0.3, solid: false }); box(g, [3.4, 0.9, 3.0], [-0.6, 1.95, 0], top ? paint : dark, { r: 0.3, solid: false });
  const ws = mesh(new THREE.BoxGeometry(0.1, 0.9, 2.8), std({ color: 0x8ad8ff, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.55 })); ws.position.set(1.15, 2.0, 0); ws.rotation.z = 0.5; g.add(ws);
  box(g, [8.2, 0.2, 3.5], [0, 0.6, 0], chrome, { r: 0.08, solid: false });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.12, 3.42), std({ color: 0xffffff, roughness: 0.4 })); stripe.position.set(0, 1.3, 0); g.add(stripe);
  for (const x of [-2.7, 2.6]) for (const z of [-1.55, 1.55]) { const w = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 18), dark); w.rotation.x = Math.PI / 2; w.position.set(x, 0.62, z); g.add(w);
    const h = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.52, 12), chrome); h.rotation.x = Math.PI / 2; h.position.set(x, 0.62, z); g.add(h); }
  const hm = lights ? glowM(0xfff2c8) : std({ color: 0xfff2c8, emissive: 0xfff2c8, emissiveIntensity: 0.3 });
  for (const z of [-1.1, 1.1]) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.28, 14), hm); h.rotation.y = Math.PI / 2; h.position.set(4.02, 1.15, z); g.add(h);
    const tl = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.5), glowM(0xff2a3a)); tl.rotation.y = -Math.PI / 2; tl.position.set(-4.02, 1.15, z); g.add(tl); }
  if (lights) { const sp = new THREE.SpotLight(0xfff0d0, 30, 22, 0.5, 0.6, 1.4); sp.position.set(4.2, 1.2, 0); sp.target.position.set(14, 0, 0); g.add(sp, sp.target); }
  return g;
}

// ---------- props ----------
export function boombox(S, col = 0xff3ab8) { const g = new THREE.Group(); S.add(g);
  box(g, [2.0, 1.1, 0.6], [0, 0, 0], std({ color: 0x2a2a34, roughness: 0.4, metalness: 0.3 }), { r: 0.12, solid: false });
  const sp = []; for (const s of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 20), std({ color: 0x111116 })); c.rotation.x = Math.PI / 2; c.position.set(s * 0.6, -0.05, 0.3); g.add(c);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.04, 6, 24), glowM(col)); r.position.set(s * 0.6, -0.05, 0.33); g.add(r); sp.push(c, r); }
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 6, 20, Math.PI), std({ color: 0xc8c8d0, metalness: 0.8, roughness: 0.2 })); hd.position.y = 0.55; g.add(hd);
  box(g, [0.6, 0.25, 0.05], [0, 0.3, 0.31], glowM(0x2ae8ff), { r: 0, solid: false });
  g.pulse = (t, k = 1) => sp.forEach((m, i) => m.scale.setScalar(1 + k * 0.12 * Math.max(0, Math.sin(t * 13 + (i > 1 ? 1 : 0))))); return g; }
export function gameConsole(S) { const g = new THREE.Group(); S.add(g);
  box(g, [2.4, 0.5, 1.6], [0, 0.25, 0], std({ color: 0x1c1c26, roughness: 0.3, metalness: 0.2 }), { r: 0.12, solid: false });
  const l = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.05), glowM(0xff3ab8)); l.position.set(0, 0.3, 0.81); g.add(l);
  const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), glowM(0x2ae8ff)); l2.position.set(0.95, 0.3, 0.81); g.add(l2); return g; }
export function controller(S, col = 0x2a2a34) { const g = new THREE.Group(); S.add(g); const m = std({ color: col, roughness: 0.4 });
  box(g, [0.8, 0.18, 0.45], [0, 0, 0], m, { r: 0.08, solid: false }); for (const s of [-1, 1]) { const h = mesh(new THREE.SphereGeometry(0.17, 10, 8), m); h.scale.set(1, 0.7, 1.3); h.position.set(s * 0.38, -0.02, -0.1); g.add(h); }
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), glowM(0xff3ab8)); b.position.set(0.2, 0.1, 0.05); g.add(b); return g; }
// TV: screen modes are original abstract graphics only (no game footage): 'glow' neon gradient, 'load' loading bar with a "6", 'seven' a tiny "7?" teaser
export function tvSet(S, { w = 9, h = 5.2 } = {}) { const g = new THREE.Group(); S.add(g);
  box(g, [w + 0.4, h + 0.4, 0.35], [0, 0, 0], std({ color: 0x0e0e12, roughness: 0.3 }), { r: 0.1, solid: false });
  const tex = ctex(640, 360, () => {}); const c = tex.userData.canvas.getContext('2d'); let st = '';
  const scrM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), scrM); scr.position.z = 0.18; g.add(scr);
  const L = new THREE.PointLight(0x9a7aff, 0, 18, 1.5); L.position.set(0, 0, 3); g.add(L);
  g.screen = (mode = 'glow', k = 0.5, t = 0) => { const key = mode + (k * 40 | 0); if (key !== st) { st = key; c.fillStyle = '#05040a'; c.fillRect(0, 0, 640, 360);
      if (mode !== 'off') { const gr = c.createLinearGradient(0, 0, 640, 360); gr.addColorStop(0, '#3a0a5a'); gr.addColorStop(0.5, '#c8307a'); gr.addColorStop(1, '#1a6ab8'); c.fillStyle = gr; c.fillRect(0, 0, 640, 360);
        for (let i = 0; i < 9; i++) { c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 220 + i * i * 2.4); c.lineTo(640, 220 + i * i * 2.4); c.stroke(); }
        c.fillStyle = 'rgba(255,214,120,0.9)'; c.beginPath(); c.arc(320, 230, 70, Math.PI, 0); c.fill();
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff3ab8'; c.shadowBlur = 30; c.fillStyle = '#ffffff';
        if (mode === 'load') { c.font = '900 150px Inter, sans-serif'; c.fillText('6', 320, 140); c.shadowBlur = 0; c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(170, 290, 300, 18); c.fillStyle = '#2ae8ff'; c.fillRect(170, 290, 300 * k, 18); }
        if (mode === 'seven') { c.font = '900 120px Inter, sans-serif'; c.fillText('7 ?', 320, 150); c.font = '800 34px Inter, sans-serif'; c.fillText('COMING... SOMEDAY', 320, 300); }
        c.shadowBlur = 0; } tex.needsUpdate = true; }
    L.intensity = mode === 'off' ? 0 : 7 + Math.sin(t * 7) * 1.2; L.color.set(Math.sin(t * 1.3) > 0 ? 0xc87aff : 0x6ac8ff); };
  g.screen('off'); g.light = L; return g; }

// ---------- buildings ----------
function hotelTex(col, rows, cols, lit, R) { return ctex(512, 512, (c, w, h) => {
  c.fillStyle = hx(col); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '0,0,0'},0.04)`; c.fillRect(R() * w, R() * h, 3, 3); }
  const cw = w / cols, rh = h / rows;
  for (let r = 0; r < rows; r++) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, r * rh + rh * 0.08, w, rh * 0.06);
    for (let k = 0; k < cols; k++) { c.fillStyle = lit && R() < 0.55 ? (R() < 0.5 ? '#ffd890' : '#ffb8e8') : '#2a3a5a'; c.fillRect(k * cw + cw * 0.18, r * rh + rh * 0.3, cw * 0.64, rh * 0.5);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(k * cw + cw * 0.14, r * rh + rh * 0.24, cw * 0.72, rh * 0.06); } } }); }
function emisTex(rows, cols, R) { return ctex(512, 512, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) if (R() < 0.5) { c.fillStyle = R() < 0.5 ? '#ffd890' : '#ff9ad8'; c.fillRect(k * cw + cw * 0.18, r * rh + rh * 0.3, cw * 0.64, rh * 0.5); } }); }
function neonText(text, col, w = 512, h = 128, font = 90) { return ctex(w, h, (c) => { c.clearRect(0, 0, w, h); c.font = `900 ${font}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = hx(col); c.shadowBlur = 24; c.fillStyle = hx(col); c.fillText(text, w / 2, h / 2); c.shadowBlur = 6; c.fillStyle = '#ffffff'; c.globalAlpha = 0.85; c.fillText(text, w / 2, h / 2); }); }
const HOTEL_NAMES = ['FLAMINGO', 'MARLIN', 'STARLITE', 'CORAL', 'PALMS', 'SUNRISE', 'TIDES', 'NEPTUNE'];

function hotelRow(S, { z = -16, lit, neonOn, seed = 3, shop }) {
  const R = rng(seed), neonMats = [], emis = [], fins = [];
  let x = -64; let idx = 0;
  while (x < 64) { const w = 12 + Math.floor(R() * 4) * 1.5, h = 12 + Math.floor(R() * 6) * 2, col = PASTEL[idx % PASTEL.length], nc = NEON[(idx * 3 + 1) % NEON.length];
    const cx = x + w / 2, center = shop && Math.abs(cx) < w / 2;
    const rows = Math.round(h / 3.4), cols = Math.round(w / 2.6);
    const em = emisTex(rows, cols, R);
    const mat = std({ map: hotelTex(col, rows, cols, false, R), emissive: 0xffffff, emissiveMap: em, emissiveIntensity: lit ? 0.9 : 0, roughness: 0.8 }); emis.push(mat);
    const b = box(S, [w - 0.6, h, 9], [cx, h / 2, z - 4.5], mat, { r: 0.2, cast: false, solid: false });
    // art-deco details: rounded eyebrow ledges, stepped top, central tower fin with a neon name
    const ledge = std({ color: 0xfaf6ee, roughness: 0.7 });
    for (let y = 3.4; y < h - 1; y += 3.4) box(S, [w - 0.3, 0.25, 0.8], [cx, y, z + 0.2], ledge, { r: 0.1, cast: false, solid: false });
    box(S, [w * 0.55, 2.2, 7], [cx, h + 1.1, z - 4.5], std({ color: col, roughness: 0.8 }), { r: 0.3, cast: false, solid: false });
    box(S, [w * 0.25, 1.8, 5], [cx, h + 3.0, z - 4.5], ledge, { r: 0.3, cast: false, solid: false });
    const nm = new THREE.MeshBasicMaterial({ color: nc }); neonMats.push([nm, nc]);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 0.22, 0.22), nm); trim.position.set(cx, h - 0.1, z + 0.15); S.add(trim);
    const trimB = trim.clone(); trimB.position.y = 3.2; S.add(trimB);
    if (!center) { const fin = new THREE.Group(); fin.position.set(cx + (R() < 0.5 ? -1 : 1) * w * 0.22, h * 0.55, z + 0.8); S.add(fin);
      box(fin, [1.4, h * 0.6, 0.6], [0, 0, 0], ledge, { r: 0.1, cast: false, solid: false });
      const name = HOTEL_NAMES[idx % HOTEL_NAMES.length]; const tx = neonText(name.split('').join('\n'), nc, 64, 512, 52);
      const lt = ctex(96, 640, (c, ww, hh) => { c.font = '900 64px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = hx(nc); c.shadowBlur = 18; c.fillStyle = hx(nc);
        name.split('').forEach((ch, i) => c.fillText(ch, ww / 2, 40 + i * (hh - 60) / Math.max(1, name.length - 1) * 0.95)); c.shadowBlur = 0; c.fillStyle = '#fff'; c.globalAlpha = 0.8; name.split('').forEach((ch, i) => c.fillText(ch, ww / 2, 40 + i * (hh - 60) / Math.max(1, name.length - 1) * 0.95)); });
      const lm = new THREE.MeshBasicMaterial({ map: lt, transparent: true, color: 0xffffff }); neonMats.push([lm, 0xffffff]);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, h * 0.55), lm); p.position.z = 0.32; fin.add(p); fins.push(fin); }
    // awning + cafe
    if (!center) { const aw = std({ map: ctex(128, 32, (c, ww, hh) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff6ee' : hx(NEON[(idx + 2) % NEON.length]); c.fillRect(i * ww / 8, 0, ww / 8 + 1, hh); } }), roughness: 0.8 });
      box(S, [w * 0.6, 0.2, 2.2], [cx, 3.0, z + 1.0], aw, { r: 0.05, cast: false, solid: false, rot: [0.25, 0, 0] }); }
    x += w; idx++; }
  return { neonMats, emis, fins };
}

function shopFrontPP(S, z, neonMats) {
  // Pixel Palace (made-up game shop) at x 0, front z
  const fm = std({ color: 0x1a1430, roughness: 0.4, metalness: 0.2 });
  box(S, [13, 5.2, 0.4], [0, 2.6, z + 0.25], fm, { r: 0.05, cast: false, name: 'shopfront' });
  const winT = ctex(512, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a1a6a'); g.addColorStop(1, '#1a0a3a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const cols = ['#ff3ab8', '#2ae8ff', '#ffd23a', '#7aff8a', '#b05aff']; for (let i = 0; i < 10; i++) { c.fillStyle = cols[i % 5]; c.fillRect(20 + (i % 5) * 96, 30 + Math.floor(i / 5) * 110, 70, 90); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(28 + (i % 5) * 96, 90 + Math.floor(i / 5) * 110, 54, 20); }
    c.fillStyle = '#ffffff'; c.font = '900 34px Inter'; c.textAlign = 'center'; c.fillText('MIDNIGHT LAUNCH', w / 2, 248); });
  const winM = new THREE.MeshStandardMaterial({ map: winT, emissive: 0xffffff, emissiveMap: winT, emissiveIntensity: 0.9 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.2), winM); win.position.set(4.0, 2.4, z + 0.47); S.add(win);
  const win2 = win.clone(); win2.position.x = -4.0; S.add(win2);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 4.2), new THREE.MeshStandardMaterial({ color: 0x6a4aa8, emissive: 0xb07aff, emissiveIntensity: 0.6, roughness: 0.2 })); door.position.set(0, 2.1, z + 0.47); S.add(door);
  const sm = new THREE.MeshBasicMaterial({ map: neonText('PIXEL PALACE', 0xff3ab8, 1024, 160, 120), transparent: true }); neonMats.push([sm, 0xffffff]);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(11, 1.7), sm); sign.position.set(0, 6.4, z + 0.5); S.add(sign);
  const sb = box(S, [11.6, 2.2, 0.3], [0, 6.4, z + 0.3], std({ color: 0x120c22, roughness: 0.5 }), { r: 0.1, cast: false, solid: false });
  const tube = new THREE.MeshBasicMaterial({ color: 0x2ae8ff }); neonMats.push([tube, 0x2ae8ff]);
  const tb = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.16, 0.16), tube); tb.position.set(0, 5.2, z + 0.55); S.add(tb);
  return { winM, door, sign };
}

export function neonBeach(S, { time = 'sunset', view = 'strip', shop = false, wires = false, billboard = false, cars = true, palms = true, sign = false,
  signText = 'WELCOME TO VICE CITY', signSub = 'LEONIDA', board = {} } = {}) {
  const night = time === 'night' || time === 'dark', dark = time === 'dark', sunset = time === 'sunset', dawn = time === 'dawn';
  S.background = skyTex(SKIES[time]);
  S.fog = new THREE.Fog(night ? 0x1a0c34 : sunset ? 0xd8708a : 0xe8b8b8, night ? 45 : 60, night ? 150 : 210);
  clouds(S, night ? { night: true, tint: 0x6a3a8a } : sunset ? { tint: 0xffa0a0 } : { tint: 0xffd8d0 });
  if (night) starfield(S);
  if (night) S.userData.look = 'night';
  // lights
  S.add(new THREE.HemisphereLight(night ? (dark ? 0x3a3a7a : 0x7a5ac8) : sunset ? 0xffa0c0 : 0xffd8e0, night ? 0x14081e : 0x6a4040, dark ? 0.3 : night ? 0.65 : 0.9));
  const sunPos = sunset ? [-30, 12, -40] : dawn ? [30, 14, -40] : [-12, 30, 14];
  const sun = new THREE.DirectionalLight(night ? (dark ? 0x8a9aff : 0xb0a0ff) : sunset ? 0xff9a5a : 0xffc89a, dark ? 0.7 : night ? 0.9 : 2.6);
  sun.position.set(...(night ? [-12, 30, 14] : sunPos)); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 0.5, far: 140 }); S.add(sun, sun.target);
  const front = new THREE.DirectionalLight(night ? 0xc8b0ff : sunset ? 0xffc8a8 : 0xffe0d0, night ? 0.5 : 1.0); front.position.set(6, 8, 20); S.add(front);
  const key = new THREE.PointLight(dark ? 0xc8d4ff : night ? 0xffd0e8 : 0xffd8b8, dark ? 10 : night ? 14 : 6, 18, 1.6); key.position.set(2, 7, 9); S.add(key);
  const neonLights = [];
  let rowInfo = { neonMats: [], emis: [], fins: [] }, shopInfo = null;
  const tick = [];
  if (view === 'strip') {
    box(S, [200, 0.3, 60], [0, -0.15, 20], std({ map: (() => { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#efd8cc'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#f6c8c8' : '#cdeee2'; c.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } }); t.repeat.set(50, 15); return t; })(), roughness: night ? 0.35 : 0.8, metalness: night ? 0.15 : 0 }), { r: 0, cast: false, name: 'ground' });
    box(S, [200, 0.3, 7], [0, -0.13, -9.5], std({ map: (() => { const t = T.asphalt ? T.asphalt() : null; if (t) { t.repeat.set(30, 1); } return t; })(), color: 0x4a4a58, roughness: night ? 0.3 : 0.8, metalness: night ? 0.3 : 0 }), { r: 0, cast: false, name: 'road' });
    for (let x = -96; x < 96; x += 6) box(S, [3, 0.02, 0.25], [x, 0.04, -9.5], std({ color: 0xffe08a }), { r: 0, cast: false, solid: false });
    box(S, [200, 0.35, 0.5], [0, 0.17, -6.2], std({ color: 0xe8e2da }), { r: 0.05, cast: false, solid: false });
    box(S, [200, 0.3, 4], [0, 0.0, -14.5], std({ color: 0xe6d6c8 }), { r: 0, cast: false, solid: false });
    rowInfo = hotelRow(S, { z: -16, lit: night && !dark, seed: 5, shop });
    if (shop) shopInfo = shopFrontPP(S, -16.2, rowInfo.neonMats);
    if (night) for (const [x, c] of [[-14, 0xff3ab8], [0, 0x2ae8ff], [14, 0xb05aff]]) { const l = new THREE.PointLight(c, 22, 22, 1.6); l.position.set(x, 5, -12); S.add(l); neonLights.push([l, 22]); }
    if (palms) [[-9, -5, 11], [9, -5, 12.5], [-21, -5, 13], [21, -5, 11.5], [-33, -5, 12], [33, -5, 12]].forEach(([x, z, h], i) => { const p = palm(S, [x, z], h, i + 2); tick.push(t => p.sway(t)); });
    // street lamps (deco)
    for (const x of [-15, 15]) { box(S, [0.3, 8, 0.3], [x, 4, -6.6], std({ color: 0xf0e8e0 }), { r: 0.05, name: 'lamp post' }); const b = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), night && !dark ? glowM(0xffe0f0) : std({ color: 0xf4eaf4 })); b.position.set(x, 8.2, -6.6); S.add(b); }
    if (cars) { const C = [[0xff6ab0, 1, -11.2, 0], [0x5ae8d0, -1, -8.0, 30], [0xffe07a, 1, -11.2, 55]].map(([col, dir, z, off]) => { const c = retroCar(S, col, { lights: night && !dark }); c.rotation.y = dir > 0 ? 0 : Math.PI; c.position.set(0, 0, z); c.userData = { dir, off }; return c; });
      tick.push(t => C.forEach(c => { const u = ((t * 6 + c.userData.off) % 140) - 70; c.position.x = c.userData.dir * u; })); }
    if (wires) {} // created below
    // planters + benches + a bike rack on the promenade edge
    for (const x of [-27, 27]) { box(S, [1.6, 1.2, 1.6], [x, 0.6, -4.5], std({ color: 0xf6a8c4 }), { r: 0.15, name: 'planter' }); const pl = mesh(new THREE.SphereGeometry(1.0, 12, 10), std({ color: 0x3a9a5a })); pl.position.set(x, 1.8, -4.5); S.add(pl); }
  } else {
    // beach
    const sand = std({ map: (() => { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#f4e4c8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = Math.random() < 0.5 ? '#e8d4b0' : '#fff6e4'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }); t.repeat.set(40, 20); return t; })(), roughness: 1 });
    box(S, [240, 0.3, 80], [0, -0.15, 18], sand, { r: 0, cast: false, name: 'ground' });
    const wet = new THREE.Mesh(new THREE.PlaneGeometry(240, 6), std({ color: 0xc8b090, roughness: 0.2, metalness: 0.2 })); wet.rotation.x = -Math.PI / 2; wet.position.set(0, 0.02, -20); S.add(wet);
    const seaGeo = new THREE.PlaneGeometry(400, 220, 80, 40); seaGeo.rotateX(-Math.PI / 2);
    const sea = new THREE.Mesh(seaGeo, std({ color: night ? 0x1a2a5a : sunset ? 0x3a6aa8 : 0x2ab8c8, roughness: 0.15, metalness: 0.35, emissive: sunset ? 0x40182a : 0x000000, emissiveIntensity: 0.4 })); sea.position.set(0, -0.1, -132); S.add(sea);
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(240, 1.2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })); surf.rotation.x = -Math.PI / 2; surf.position.set(0, 0.05, -22.5); S.add(surf);
    const sp = seaGeo.attributes.position, base = sp.array.slice();
    tick.push(t => { for (let i = 0; i < sp.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; sp.setY(i, Math.sin(x * 0.12 + t * 1.3) * 0.18 + Math.sin(z * 0.2 + t * 1.8) * 0.22); } sp.needsUpdate = true; surf.position.z = -22.5 + Math.sin(t * 0.9) * 0.8; surf.material.opacity = 0.55 + 0.3 * Math.sin(t * 0.9 + 1); });
    if (sunset || dawn) { const sd = new THREE.Group(); sd.position.set(sunset ? -14 : 18, 7, -190); S.add(sd);
      sd.add(new THREE.Mesh(new THREE.CircleGeometry(22, 48), new THREE.MeshBasicMaterial({ color: 0xffd08a, fog: false })));
      const halo = new THREE.Mesh(new THREE.CircleGeometry(48, 48), new THREE.MeshBasicMaterial({ color: 0xff9a7a, transparent: true, opacity: 0.25, fog: false, depthWrite: false })); halo.position.z = -0.5; sd.add(halo);
      for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(46, 1.2 + i * 0.4), new THREE.MeshBasicMaterial({ color: SKIES.sunset[2][1], fog: false })); b.position.set(0, -4 - i * 3.2, 0.2); sd.add(b); }
      const glint = new THREE.Mesh(new THREE.PlaneGeometry(10, 110), new THREE.MeshBasicMaterial({ color: 0xffc080, transparent: true, opacity: 0.35, depthWrite: false })); glint.rotation.x = -Math.PI / 2; glint.position.set(sd.position.x * 0.5, 0.1, -80); S.add(glint); }
    if (night) { const moon = new THREE.Mesh(new THREE.CircleGeometry(7, 40), new THREE.MeshBasicMaterial({ color: 0xfff2e0, fog: false })); moon.position.set(30, 40, -170); S.add(moon); }
    if (palms) [[-11, -3, 12], [12, -6, 13], [-24, -10, 11], [26, -2, 12], [-36, 0, 13]].forEach(([x, z, h], i) => { const p = palm(S, [x, z], h, i + 7); tick.push(t => p.sway(t)); });
    // lifeguard tower (pastel) + umbrellas + towels
    const lg = new THREE.Group(); lg.position.set(-17, 0, -12); S.add(lg); const lw = std({ color: 0xf6a8c4 }), lw2 = std({ color: 0x9ee6cf });
    for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) box(lg, [0.3, 5, 0.3], [x, 2.5, z], std({ color: 0xf6f0e8 }), { r: 0.05, solid: false });
    box(lg, [4.4, 3, 4], [0, 6.5, 0], lw, { r: 0.3, solid: false }); box(lg, [5, 0.5, 4.6], [0, 8.2, 0], lw2, { r: 0.2, solid: false }); box(lg, [3, 1.4, 0.1], [0, 6.8, 2.05], std({ color: 0x2a3a5a }), { r: 0, solid: false });
    for (const [x, z, c] of [[16, -14, 0xff6ab0], [-4, -16, 0x2ae8d8], [22, -10, 0xffd23a]]) { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
      const can = mesh(new THREE.ConeGeometry(3.2, 1.2, 16, 1, true), std({ map: ctex(256, 32, (c2, w, h) => { for (let i = 0; i < 8; i++) { c2.fillStyle = i % 2 ? '#fff6e8' : hx(c); c2.fillRect(i * w / 8, 0, w / 8 + 1, h); } }), side: THREE.DoubleSide })); can.position.y = 5.8; g.add(can);
      const p = mesh(new THREE.CylinderGeometry(0.07, 0.07, 6.2, 8), std({ color: 0xe8e0d0 })); p.position.y = 3.1; g.add(p);
      const tw = new THREE.Mesh(new THREE.PlaneGeometry(2, 4), std({ map: ctex(32, 64, (c2, w, h) => { for (let i = 0; i < 6; i++) { c2.fillStyle = i % 2 ? '#ffffff' : hx(c); c2.fillRect(0, i * h / 6, w, h / 6 + 1); } }) })); tw.rotation.x = -Math.PI / 2; tw.position.set(1.5, 0.03, 1.5); g.add(tw); }
    // the hotel skyline far back-left/right along the shore (so the city reads)
    const R = rng(9); for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1, x = side * (46 + i * 7), w = 10, h = 14 + R() * 12, col = PASTEL[i % PASTEL.length];
      const m = std({ color: col, emissive: night && !dark ? NEON[i % NEON.length] : 0x000000, emissiveIntensity: 0.12, roughness: 0.8 }); box(S, [w, h, 10], [x, h / 2, -10 - i * 4], m, { r: 0.2, cast: false, solid: false });
      const t = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, 0.25), new THREE.MeshBasicMaterial({ color: NEON[i % NEON.length] })); t.position.set(x, h - 0.2, -4.9 - i * 4); S.add(t); rowInfo.neonMats.push([t.material, NEON[i % NEON.length]]); }
    if (night) for (const [x, c] of [[-12, 0xff3ab8], [12, 0x2ae8ff]]) { const l = new THREE.PointLight(c, 14, 20, 1.6); l.position.set(x, 6, -4); S.add(l); neonLights.push([l, 14]); }
  }
  // welcome sign
  if (sign) { const g = new THREE.Group(); g.position.set(sign.x ?? -9, sign.y ?? 9.5, sign.z ?? -5.5); S.add(g); box(g, [10.5, 3.4, 0.4], [0, 0, 0], std({ color: 0x1a1030, roughness: 0.5 }), { r: 0.3, cast: false, solid: false });
    const m1 = new THREE.MeshBasicMaterial({ map: neonText(signText, 0xff3ab8, 1024, 128, 76), transparent: true }), m2 = new THREE.MeshBasicMaterial({ map: neonText(signSub, 0x2ae8ff, 512, 128, 80), transparent: true });
    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.25), m1); p1.position.set(0, 0.6, 0.22); g.add(p1); const p2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), m2); p2.position.set(0, -0.8, 0.22); g.add(p2);
    rowInfo.neonMats.push([m1, 0xffffff], [m2, 0xffffff]); for (const s of [-1, 1]) box(g, [0.4, sign.y ?? 9.5, 0.4], [s * 4, -(sign.y ?? 9.5) / 2, -0.3], std({ color: 0xf0e8e0 }), { r: 0.05, cast: false, solid: false }); }
  const env = { key, sun, time, view, tickers: tick };
  if (billboard) env.board = countdown(S, { pos: billboard, ...board });
  if (wires) env.wires = powerLines(S, { y: 12, z: -7 });
  env.shop = shopInfo;
  // neon power: k 0..1 (also per-building wave)
  const allNeon = [...rowInfo.neonMats]; let lastK = -1;
  env.neon = (k) => { if (Math.abs(k - lastK) < 0.004) return; lastK = k;
    allNeon.forEach(([m, c]) => { m.color.set(c).multiplyScalar(0.06 + 0.94 * k); });
    rowInfo.emis.forEach(m => { m.emissiveIntensity = 0.9 * k; });
    neonLights.forEach(([l, i]) => { l.intensity = i * k; });
    if (shopInfo) { shopInfo.winM.emissiveIntensity = 0.9 * k; shopInfo.door.material.emissiveIntensity = 0.6 * k; }
    if (env.board) env.board.power(k); };
  if (dark) { // neon built "on" for night; dark = switched off
    rowInfo.emis.forEach(m => { m.emissiveIntensity = 0; }); env.neon(0); }
  else if (!night) { rowInfo.emis.forEach(m => { m.emissiveIntensity = 0; }); env.neon(sunset ? 0.55 : 0.25); rowInfo.emis.forEach(m => { m.emissiveIntensity = 0; }); }
  env.update = (t) => { tick.forEach(f => f(t)); };
  return env;
}

// ---------- game room (living room with couch facing a TV on the camera-side wall) ----------
export function gameRoom(S, { dawn = true, flash = false, night = false } = {}) {
  const w = 24, zBack = -9, h = 10;
  const fl = std({ map: (() => { const t = T.planks(0x8a5a3a).clone(); t.repeat.set(4, 4); t.needsUpdate = true; return t; })(), roughness: 0.7 });
  box(S, [w, 0.3, 22], [0, -0.15, 2], fl, { r: 0, cast: false, name: 'floor' });
  const wm = std({ map: T.plaster(night ? 0x6a5a8a : 0xf2c8c8), roughness: 0.9 });
  box(S, [w, h, 0.4], [0, h / 2, zBack - 0.2], wm, { r: 0, cast: false, name: 'back wall' }); box(S, [0.4, h, 22], [-w / 2, h / 2, 2], wm, { r: 0, cast: false, name: 'wall' }); box(S, [0.4, h, 22], [w / 2, h / 2, 2], wm, { r: 0, cast: false, name: 'wall' });
  box(S, [w, 0.6, 0.2], [0, 0.3, zBack + 0.05], std({ color: 0xfaf4ee }), { r: 0, cast: false, solid: false });
  box(S, [w, 0.3, 22], [0, h + 0.15, 2], std({ color: night ? 0x4a4060 : 0xf6ece6, roughness: 0.9 }), { r: 0, cast: false, solid: false });   // ceiling
  // front wall (camera side) with TV + console
  box(S, [w, h, 0.4], [0, h / 2, 12.2], wm, { r: 0, cast: false, name: 'front wall' });
  const tv = tvSet(S, { w: 9, h: 5.2 }); tv.position.set(0, 5.2, 11.8); tv.rotation.y = Math.PI;
  box(S, [10, 1.6, 2], [0, 0.8, 10.8], std({ color: 0x3a2a4a, roughness: 0.5 }), { r: 0.1, name: 'tv stand' });
  const con = gameConsole(S); con.position.set(-2.2, 1.6, 10.6); con.rotation.y = Math.PI;
  // couch (3 seats) against the back wall
  const cm = std({ color: 0x2ab8b0, roughness: 0.9 }), cm2 = std({ color: 0x1f9a94, roughness: 0.9 });
  box(S, [15, 1.6, 3.6], [0, 0.8, -6.6], cm2, { r: 0.25, name: 'couch base' });
  box(S, [15, 3.2, 1.2], [0, 2.4, -8.4], cm, { r: 0.4, name: 'couch back' });
  for (const s of [-1, 1]) box(S, [1.2, 2.6, 3.8], [s * 8.1, 1.3, -6.6], cm, { r: 0.4, name: 'couch arm' });
  for (const x of [-4.6, 0, 4.6]) box(S, [4.4, 0.4, 3.0], [x, 1.8, -6.4], cm, { r: 0.2, solid: false });
  // pillows + blanket
  box(S, [1.4, 1.4, 0.5], [-6.6, 2.7, -7.5], std({ color: 0xff7ab0 }), { r: 0.3, solid: false, rot: [0, 0, 0.2] }); box(S, [1.4, 1.4, 0.5], [6.6, 2.7, -7.5], std({ color: 0xffd23a }), { r: 0.3, solid: false, rot: [0, 0, -0.2] });
  // window (sunrise) on the back wall, right
  const sky = dawn ? ctex(256, 256, (c, ww, hh) => { const g = c.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#6a8ad8'); g.addColorStop(0.6, '#ff9ab0'); g.addColorStop(1, '#ffd890'); c.fillStyle = g; c.fillRect(0, 0, ww, hh);
      c.fillStyle = '#fff0b8'; c.beginPath(); c.arc(170, 230, 40, 0, 7); c.fill(); c.fillStyle = '#3a2a4a'; for (let x = 0; x < ww; x += 34) { const bh = 30 + (x * 7 % 50); c.fillRect(x, hh - bh, 30, bh); }
      c.fillStyle = '#2a6a3a'; c.fillRect(30, 120, 6, 140); c.beginPath(); c.ellipse(33, 120, 40, 10, 0.3, 0, 7); c.fill(); })
    : ctex(256, 256, (c, ww, hh) => { const g = c.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#0a0620'); g.addColorStop(1, '#4a1a6a'); c.fillStyle = g; c.fillRect(0, 0, ww, hh); c.fillStyle = '#ff3ab8'; c.fillRect(20, 200, 220, 8); });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshBasicMaterial({ map: sky })); win.position.set(7.5, 6.8, zBack + 0.02); S.add(win);
  box(S, [5.4, 0.25, 0.3], [7.5, 4.7, zBack + 0.1], std({ color: 0xfaf4ee }), { r: 0.05, solid: false }); box(S, [0.15, 4, 0.12], [7.5, 6.8, zBack + 0.08], std({ color: 0xfaf4ee }), { r: 0, solid: false });
  // posters + shelf + plant + lamp
  const post = (x, y, a, b, txt) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), std({ map: ctex(120, 160, (c, ww, hh) => { const g = c.createLinearGradient(0, 0, ww, hh); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, ww, hh);
      c.fillStyle = '#fff'; c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText(txt, ww / 2, 95); c.strokeStyle = '#fff'; c.lineWidth = 4; c.strokeRect(6, 6, ww - 12, hh - 12); }) })); p.position.set(x, y, zBack + 0.03); S.add(p); };
  post(-7.6, 6.4, '#ff3ab8', '#3a1a8a', '★'); post(-4.6, 6.8, '#2ae8ff', '#1a3a8a', '6'); post(-1.8, 6.2, '#ffd23a', '#ff6a3a', '♥');
  box(S, [4, 0.25, 1], [2.4, 7.8, zBack + 0.5], std({ color: 0xfaf4ee }), { r: 0.05, solid: false });
  [[1.0, 0xff7ab0], [1.8, 0x9ee6cf], [2.6, 0xffd23a], [3.4, 0xc9b2f2]].forEach(([x, c]) => box(S, [0.4, 1.1, 0.7], [x, 8.5, zBack + 0.5], std({ color: c }), { r: 0.05, solid: false }));
  const pot = box(S, [1.2, 1.4, 1.2], [-10.6, 0.7, -7.6], std({ color: 0xe8784a }), { r: 0.15, name: 'plant pot' }); const pl = mesh(new THREE.SphereGeometry(1.3, 14, 10), std({ color: 0x3a9a5a })); pl.position.set(-10.6, 2.6, -7.6); S.add(pl);
  const lampB = box(S, [0.2, 6, 0.2], [10.4, 3, -7.6], std({ color: 0x2a2a30, metalness: 0.5 }), { r: 0.05, name: 'lamp' }); const shade = mesh(new THREE.CylinderGeometry(0.6, 1.0, 1.2, 16, 1, true), std({ color: 0xfff0d8, emissive: 0xffd8a0, emissiveIntensity: 0.8, side: THREE.DoubleSide })); shade.position.set(10.4, 6.4, -7.6); S.add(shade);
  // rug
  const rug = new THREE.Mesh(new THREE.CircleGeometry(5, 40), std({ map: ctex(128, 128, (c, ww, hh) => { for (let i = 0; i < 6; i++) { c.fillStyle = ['#ff7ab0', '#fff0e0', '#2ab8b0'][i % 3]; c.beginPath(); c.arc(64, 64, 64 - i * 10, 0, 7); c.fill(); } }), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, 0); rug.scale.set(1.5, 1, 1); S.add(rug);
  // lighting
  S.add(new THREE.HemisphereLight(dawn ? 0xffe0e8 : 0x5a4a9a, 0x3a2a2a, dawn ? 0.7 : 0.35));
  const sunL = new THREE.SpotLight(0xffc89a, dawn ? 90 : 0, 40, 0.5, 0.6, 1.2); sunL.position.set(7.5, 7.5, zBack + 1); sunL.target.position.set(-2, 0, 4); sunL.castShadow = true; S.add(sunL, sunL.target);
  const key = new THREE.PointLight(0xffd8c0, dawn ? 12 : 8, 18, 1.6); key.position.set(-3, 7, 4); S.add(key);
  const lampL = new THREE.PointLight(0xffc880, 8, 12, 1.6); lampL.position.set(10, 6, -6.5); S.add(lampL);
  if (!dawn) S.userData.look = 'night'; if (flash) S.userData.look = 'flash';
  return { tv, console: con, consoleTop: 2.1, key, update(t) {} };
}
