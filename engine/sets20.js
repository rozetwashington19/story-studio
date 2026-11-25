// Episode 020 kit (Noodle): a desert wishing-well town + the biggest dog in the world.
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   bigPup(S, { name, s, col, ear, snout, collar })  blocky golden puppy (s 1 ≈ 4.3 tall incl. ears, nose z ≈ +2.8, tail z ≈ -2.6; feet y 0, faces +Z).
//       s 0.3 = a tiny puppy in your hands, 1.6 = car-sized, 10 = taller than the clock tower. Tagged for the collision checker as `name`.
//       .update(t, mode, mode2?, k?)  modes 'idle' 'wag' 'run' 'sit' 'lie' 'sleep' 'bark' 'sad' 'tilt' 'sniff' 'bow' 'pant' 'happy' (blend mode→mode2 by k)
//       .apply(p) raw params { sit lie bow gait ph wag wagSpeed jaw tongue headX headY headZ ears brow blink breathe bob } · .params(t, mode)
//       .root (position/rotate) · .g (scale group) · .head · .world(part) → Vector3 for 'nose' 'eyeL' 'eyeR' 'mouth' 'back' 'head' · .size(s)
//   duck(S, { name, col })  blocky white farm duck (0.9 tall) → .g, .update(t, walk 0..1)
//   duckParade(S, n, pts, { spacing, s, seed })  a line of n ducks waddling along a CatmullRom path through pts [[x,z],…] → .update(t, lead) (lead = path distance of duck 0)
//   endlessBread(S, pts, { r })  a baguette tube along pts [[x,y,z],…] → .reach(u) (0..1 of its length), .tip(u) world point
//   wishCoin(S, { s })  gold coin with a star (r 0.2·s) → mesh; .userData.glint(k)
//   pickup(S, { col })  old desert pickup truck (faces +x, 9 long, 4.6 tall) → group
//   goldBurst(S, n)  sparkle particles → .update(t, origin, k, { up, spread, size })
//   pennyMesa(S, { time: 'day'|'sunset'|'night', tower: 1 (water tower standing; 0 = gone), noodleGap })  the town plaza:
//       terracotta plaza x ±50, z -16..34; the WISHING WELL at (0,0,0) (stone ring r 2.4, rim top 1.7, posts x ±2.1, roof y 6..7.6, crank, bucket);
//       back row of adobe buildings (fronts z -16): TESS'S HOUSE x -44 (round window centre (-44, 10.2, -15.9)), BAKERY x -24 (round oven hatch (-20, 3.2, -15.9)),
//       GENERAL STORE x -9, CLOCK TOWER x 4 (7×7, 31 tall, centre z -19.5; clock face y 24), TOWN HALL x 18, SCHOOL x 36 (bell);
//       WATER TOWER (54, 0, -32) (tank y 20..28; env.tower.topple(k)); windmill (-60, 0, -30); camera-side row (fronts z 34, facing -z);
//       palo-verde tree (-15, 0, 2) with Tess's bench (-12, 0, 6.5) (seat top 1.5), kids' bench (12, 0, 6.5); lamps (±9, -8), (±24, 12); fruit cart (22, 0, 2);
//       string flags; dunes (z -90) and red mesas (z -170). Free sand behind the back row (z < -24) for a giant dog.
//       env.update(t) · env.key (face light, move it) · env.sun · env.tower · env.well (.glow(k)) · env.clock (.set(h, m)) · env.lamps
//   wellShaft(S, { time, glow })  inside the well looking up: shaft r 2.2 from the water (y -14) to the rim (y 1.7), rope + bucket, roof above, sky.
//       Camera ~ (0.5, -11.5, 0.4) looking up at (0, 6, 0), lens 16–22. env.glow(k) gold light from the water, env.ripple(t0) ring, env.update(t).
//   tessRoom(S, { night })  Tess's attic bedroom (walls x ±8, back z -7, ceiling 9.4, front z 12): ROUND WINDOW in the back wall centre (-0.5, 5.4) r 2.3 (open, real hole),
//       bed on the left (x -7.7..-3.5, z -6.8..-0.2, mattress top 2.0), nightstand (-2.7, -6.2) top 2.3 with a lamp, desk + lamp right (x 4.5..7.6, z -6.6..-4.6, top 2.8),
//       moving boxes (5.6, 2..6), dog posters, string lights, rug. Outside the window: night sky (env.sky). env.lamp (PointLight on the nightstand), env.update(t).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { std, box } from './sets.js';
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
const M = (col, o = {}) => std({ color: col, roughness: 0.7, ...o });
const rb = (w, h, d, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const clamp01 = x => Math.max(0, Math.min(1, x));
const hex = c => '#' + new THREE.Color(c).getHexString();
const tagAll = (g, name, part) => { g.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = part; } }); return g; };
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- textures ----------
const plasterTex = (col) => once('pl' + col, () => ctex(512, 512, (c, w, h) => { const b = new THREE.Color(col); c.fillStyle = hex(b); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { c.fillStyle = hex(b.clone().multiplyScalar(0.9 + Math.random() * 0.18)); c.globalAlpha = 0.35; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 60, 10 + Math.random() * 30, Math.random() * 3, 0, 7); c.fill(); }
  c.globalAlpha = 1; c.strokeStyle = 'rgba(80,40,20,0.25)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { let x = Math.random() * w, y = Math.random() * h; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 30; y += 8 + Math.random() * 14; c.lineTo(x, y); } c.stroke(); }
  const g = c.createLinearGradient(0, h * 0.75, 0, h); g.addColorStop(0, 'rgba(90,40,10,0)'); g.addColorStop(1, 'rgba(90,40,10,0.25)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  noiseFill(c, w, h, 0.07, 4000); }));
const tileTex = () => once('tile', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#d8b898'; c.fillRect(0, 0, w, h); const n = 8, s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = 0.85 + Math.random() * 0.25; c.fillStyle = hex(new THREE.Color(0xc0643a).multiplyScalar(k)); c.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
    c.fillStyle = 'rgba(255,220,180,0.12)'; c.fillRect(i * s + 6, j * s + 6, s - 20, 6); }
  for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(60,30,10,0.2)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 10, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.07, 3000); }));
const sandTex = () => once('sand', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#e2b47a'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { c.strokeStyle = 'rgba(160,100,50,0.18)'; c.lineWidth = 3; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * 0.03 + i) * 6); c.stroke(); }
  noiseFill(c, w, h, 0.09, 6000); }));
const stoneTex = (dark = false) => once('st' + dark, () => ctex(512, 512, (c, w, h) => { c.fillStyle = dark ? '#3a3430' : '#8a7a6a'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let i = 0; i < 6; i++) { const x = i * 88 + (r % 2) * 44 - 20, y = r * 64; const k = 0.75 + Math.random() * 0.4; c.fillStyle = hex(new THREE.Color(dark ? 0x5a5048 : 0xb8a48a).multiplyScalar(k));
    c.beginPath(); c.roundRect(x + 4, y + 4, 80, 56, 14); c.fill(); }
  for (let i = 0; i < 90; i++) { c.fillStyle = dark ? 'rgba(60,110,50,0.35)' : 'rgba(90,120,60,0.25)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 9, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.1, 3000); }));
const woodTex = (col = 0x7a4a26) => once('wd' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(30,15,5,${0.1 + Math.random() * 0.2})`; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 3); c.stroke(); }
  for (let x = 0; x < w; x += 64) { c.fillStyle = 'rgba(20,10,0,0.4)'; c.fillRect(x, 0, 2, h); } noiseFill(c, w, h, 0.06, 1200); }));
const mesaTex = () => once('mesa', () => ctex(256, 512, (c, w, h) => { const cols = ['#b8502a', '#d8743a', '#a8442a', '#e89a5a', '#c0603a', '#8a3a22'];
  let y = 0; let i = 0; while (y < h) { const hh = 14 + Math.random() * 40; c.fillStyle = cols[i++ % cols.length]; c.fillRect(0, y, w, hh); y += hh; }
  for (let k = 0; k < 40; k++) { c.fillStyle = 'rgba(60,20,10,0.25)'; c.fillRect(Math.random() * w, 0, 2 + Math.random() * 4, h); } noiseFill(c, w, h, 0.1, 3000); }));
const furTex = (col) => once('fur' + col, () => ctex(256, 256, (c, w, h) => { const b = new THREE.Color(col); c.fillStyle = hex(b); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) { const k = 0.86 + Math.random() * 0.26; c.strokeStyle = hex(b.clone().multiplyScalar(k)); c.lineWidth = 1.5; const x = Math.random() * w, y = Math.random() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (Math.random() - 0.5) * 4, y + 6 + Math.random() * 6); c.stroke(); } }));
const signTex = (text, bg = '#2a8a8a', fg = '#fff4dc', w = 512, h = 128) => ctex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = fg; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
  c.fillStyle = fg; c.font = `900 ${Math.floor(h * 0.55)}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 4); });
const skyTex = (top, mid, bot) => { const t = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, w, h); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const glowTex = () => once('glow', () => ctex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,230,160,0.55)'); g.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }));

// ============ the puppy ============
export function bigPup(S, { name = 'noodle', s = 1, col = 0xe8b060, ear = 0xa8642a, snout = 0xfbe8c8, collar = 0xd8302a } = {}) {
  const root = new THREE.Group(); S.add(root); const g = new THREE.Group(); g.scale.setScalar(s); root.add(g);
  const fur = std({ map: furTex(col), roughness: 0.9 }), earM = std({ map: furTex(ear), roughness: 0.9 }), cream = std({ map: furTex(snout), roughness: 0.9 });
  const black = M(0x141010, { roughness: 0.12, metalness: 0.1 }), pink = M(0xff7a8a, { roughness: 0.45 }), dark = M(0x3a1a14, { roughness: 0.8 });
  // back legs (in g) + torso pivot at the rear hip
  const leg = (parent, x, y, z) => { const p = put(parent, new THREE.Group(), [x, y, z]); put(p, mesh(rb(0.62, 1.35, 0.62, 0.2), fur), [0, -0.62, 0]); put(p, mesh(rb(0.72, 0.32, 0.86, 0.14), cream), [0, -1.2, 0.1]); return p; };
  const backL = [leg(g, -0.62, 1.35, -1.3), leg(g, 0.62, 1.35, -1.3)];
  const torso = put(g, new THREE.Group(), [0, 1.35, -1.3]);
  const body = put(torso, mesh(rb(2.0, 1.7, 3.3, 0.6), fur), [0, 0.55, 1.0]);
  put(torso, mesh(rb(1.5, 0.5, 2.4, 0.22), cream), [0, -0.18, 1.1]);                  // belly
  put(torso, mesh(rb(1.3, 0.2, 1.4, 0.1), earM), [0.2, 1.42, 0.6]);                    // a brown patch on the back
  const frontL = [leg(torso, -0.62, 0, 2.15), leg(torso, 0.62, 0, 2.15)];
  put(torso, mesh(rb(1.15, 1.2, 1.1, 0.4), fur), [0, 1.2, 2.35]);                      // neck
  put(torso, mesh(rb(1.0, 0.9, 0.5, 0.3), cream), [0, 0.95, 2.85]);                    // chest fluff
  const col1 = put(torso, mesh(new THREE.TorusGeometry(0.66, 0.11, 8, 24), M(collar, { roughness: 0.5 })), [0, 1.35, 2.55], [Math.PI / 2 - 0.35, 0, 0]);
  const tagC = put(torso, mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20), M(0xf2c23a, { metalness: 0.9, roughness: 0.25, emissive: 0x6a4a00, emissiveIntensity: 0.3 })), [0, 0.88, 3.16], [Math.PI / 2, 0, 0]);
  // head
  const head = put(torso, new THREE.Group(), [0, 1.55, 2.6]);
  put(head, mesh(rb(1.9, 1.7, 1.75, 0.6), fur), [0, 0.2, 0.3]);
  put(head, mesh(rb(1.05, 0.66, 0.9, 0.3), cream), [0, -0.27, 1.22]);
  put(head, mesh(rb(0.5, 0.42, 0.4, 0.18), cream), [0, 0.55, 1.05]);                  // blaze between the eyes
  const nose = put(head, mesh(rb(0.46, 0.32, 0.26, 0.12), M(0x2a2224, { roughness: 0.18, metalness: 0.15 })), [0, -0.04, 1.68]);
  for (const sx of [-1, 1]) { const nn = put(head, mesh(new THREE.SphereGeometry(0.055, 10, 8), basic(0x050404), false), [sx * 0.1, -0.08, 1.81]); nn.scale.set(1.3, 0.8, 0.5); }
  put(head, new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), basic(0x9a8a8a)), [0.08, 0.06, 1.8]);
  const jaw = put(head, new THREE.Group(), [0, -0.52, 0.95]);
  put(jaw, mesh(rb(0.88, 0.22, 0.72, 0.1), cream), [0, -0.05, 0.3]);
  put(jaw, mesh(rb(0.7, 0.1, 0.6, 0.04), dark, false), [0, 0.06, 0.3]);
  const tongue = put(jaw, new THREE.Group(), [0, 0.1, 0.2]); put(tongue, mesh(rb(0.38, 0.08, 0.62, 0.04), pink, false), [0, 0, 0.3]);
  const eyes = [], lids = [], brows = [];
  for (const sx of [-1, 1]) { const e = put(head, mesh(new THREE.SphereGeometry(0.25, 20, 14), black, false), [sx * 0.46, 0.34, 1.12]); e.scale.z = 0.55; eyes.push(e);
    put(head, new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), basic(0xffffff)), [sx * 0.46 + 0.08, 0.44, 1.25]);
    put(head, new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), basic(0xffffff)), [sx * 0.46 - 0.07, 0.27, 1.25]);
    const lg = put(head, new THREE.Group(), [sx * 0.46, 0.62, 1.12]); const lm = mesh(new THREE.BoxGeometry(0.6, 0.58, 0.28), fur, false); lm.position.y = -0.29; lg.add(lm); lg.scale.y = 0.001; lids.push(lg);
    const b = put(head, mesh(rb(0.46, 0.11, 0.12, 0.05), earM, false), [sx * 0.46, 0.7, 1.15]); brows.push(b); }
  const ears = [];
  for (const sx of [-1, 1]) { const p = put(head, new THREE.Group(), [sx * 0.9, 0.78, 0.15]); put(p, mesh(rb(0.36, 1.3, 0.85, 0.16), earM), [sx * 0.1, -0.58, 0]); ears.push(p); }
  const tail = put(torso, new THREE.Group(), [0, 0.95, -0.55]);
  put(tail, mesh(rb(0.32, 0.32, 1.3, 0.14), fur), [0, 0, -0.6]); put(tail, mesh(rb(0.34, 0.34, 0.4, 0.15), cream), [0, 0, -1.25]);
  tagAll(root, name, 'dog');
  const P0 = { sit: 0, lie: 0, bow: 0, gait: 0, ph: 0, wag: 0.3, wagSpeed: 6, jaw: 0, tongue: 0, headX: 0, headY: 0, headZ: 0, ears: 0, brow: 0, blink: 0, breathe: 0, bob: 0 };
  function params(t, mode) { const p = { ...P0, breathe: Math.sin(t * 2.2) };
    switch (mode) {
      case 'wag': Object.assign(p, { wag: 1, wagSpeed: 16, jaw: 0.35 + 0.1 * Math.sin(t * 9), tongue: 0.8, ears: 0.4, brow: 0.6, headY: Math.sin(t * 2) * 0.1, bob: Math.abs(Math.sin(t * 8)) * 0.06 }); break;
      case 'happy': Object.assign(p, { wag: 0.8, wagSpeed: 13, jaw: 0.3, tongue: 0.7, ears: 0.5, brow: 0.7, headZ: Math.sin(t * 1.5) * 0.08 }); break;
      case 'pant': Object.assign(p, { wag: 0.5, wagSpeed: 9, jaw: 0.3 + 0.12 * Math.sin(t * 12), tongue: 1, ears: 0.2, brow: 0.3, bob: Math.sin(t * 12) * 0.02 }); break;
      case 'run': Object.assign(p, { gait: 1, ph: t * 11, wag: 0.6, wagSpeed: 11, jaw: 0.35, tongue: 0.9, ears: 0.6, headX: -0.08, bob: Math.abs(Math.sin(t * 11)) * 0.32 }); break;
      case 'sit': Object.assign(p, { sit: 1, wag: 0.45, wagSpeed: 8, jaw: 0.2, tongue: 0.5, ears: 0.3, brow: 0.3, headX: -0.08 }); break;
      case 'lie': Object.assign(p, { lie: 1, wag: 0.15, wagSpeed: 4, headX: 0.05, ears: -0.2 }); break;
      case 'sleep': Object.assign(p, { lie: 1, wag: 0, headX: 0.25, ears: -0.6, blink: 1, breathe: Math.sin(t * 1.4) * 1.6 }); break;
      case 'sad': Object.assign(p, { lie: 1, wag: 0.05, wagSpeed: 2, headX: 0.22, ears: -1, brow: -1, blink: 0.25 + 0.05 * Math.sin(t) }); break;
      case 'sadsit': Object.assign(p, { sit: 1, wag: 0, headX: 0.3, ears: -1, brow: -1, blink: 0.3 }); break;
      case 'tilt': Object.assign(p, { sit: 1, wag: 0.6, wagSpeed: 10, headZ: 0.32 + Math.sin(t * 1.2) * 0.05, ears: 0.7, brow: 0.9, jaw: 0.08 }); break;
      case 'sniff': Object.assign(p, { headX: 0.35, headY: Math.sin(t * 3) * 0.12, ears: 0.2, wag: 0.4, wagSpeed: 8, bob: Math.sin(t * 22) * 0.01 }); break;
      case 'bark': { const b = Math.max(0, Math.sin(t * 7)); Object.assign(p, { jaw: b * 0.75, headX: -0.15 - b * 0.12, ears: 0.8, brow: 0.5, wag: 0.9, wagSpeed: 15, bob: b * 0.05 }); break; }
      case 'bow': Object.assign(p, { bow: 1, wag: 1, wagSpeed: 16, jaw: 0.35, tongue: 0.8, ears: 0.8, brow: 0.8, headX: -0.25 }); break;
      default: Object.assign(p, { wag: 0.35, wagSpeed: 6, headY: Math.sin(t * 0.7) * 0.12, headZ: Math.sin(t * 0.5) * 0.04, ears: 0.1 + Math.sin(t * 0.9) * 0.1, jaw: 0.12, tongue: 0.3 });
    }
    // automatic blink every ~4 s
    const bt = (t + name.length * 0.7) % 4.1; if (bt < 0.16 && p.blink < 0.9) p.blink = Math.max(p.blink, Math.sin(bt / 0.16 * Math.PI));
    return p; }
  function apply(p) {
    const sit = p.sit, lie = p.lie, bow = p.bow;
    torso.rotation.x = -0.5 * sit + 0.32 * bow; g.position.y = (-0.28 * sit - 0.92 * lie + p.bob) * 1;
    const sw = Math.sin(p.ph) * 0.85 * p.gait;
    frontL[0].rotation.x = 0.5 * sit - 1.5 * lie - 1.0 * bow + sw; frontL[1].rotation.x = 0.5 * sit - 1.5 * lie - 1.0 * bow + Math.sin(p.ph + 0.5) * 0.85 * p.gait;
    frontL.forEach(l => l.scale.y = 1 + 0.5 * sit);
    backL[0].rotation.x = -1.25 * sit - 1.45 * lie - Math.sin(p.ph) * 0.85 * p.gait; backL[1].rotation.x = -1.25 * sit - 1.45 * lie - Math.sin(p.ph + 0.5) * 0.85 * p.gait;
    torso.rotation.z = p.gait * Math.sin(p.ph) * 0.03;
    body.scale.set(1 + p.breathe * 0.015, 1 + p.breathe * 0.025, 1);
    head.rotation.set(p.headX + 0.5 * sit * 0.8 - 0.32 * bow * 0.6 + lie * 0.18, p.headY, p.headZ); head.position.y = 1.55 - lie * 0.35;
    jaw.rotation.x = p.jaw * 0.55; tongue.rotation.x = p.tongue * 0.35; tongue.scale.z = 1 + p.tongue * 0.5; tongue.visible = p.tongue > 0.05 || p.jaw > 0.1;
    ears.forEach((e, i) => { const sx = i ? 1 : -1; e.rotation.z = sx * (0.12 + Math.max(0, p.ears) * 0.55 + p.gait * Math.abs(Math.sin(p.ph)) * 0.3) - sx * Math.max(0, -p.ears) * 0.08; e.rotation.x = Math.max(0, -p.ears) * 0.45 - Math.max(0, p.ears) * 0.15; });
    brows.forEach((b, i) => { const sx = i ? 1 : -1; b.rotation.z = sx * p.brow * -0.28; b.position.y = 0.7 + Math.max(0, p.brow) * 0.05; });
    lids.forEach(l => l.scale.y = Math.max(0.001, Math.min(1, p.blink)));
    const wagA = Math.sin(p.ph * 0 + (p._t || 0) * p.wagSpeed) * p.wag * 0.75; tail.rotation.set(-0.75 + Math.max(0, -p.ears) * 0.9 - bow * 0.3, wagA, 0);
  }
  const W = new THREE.Vector3();
  const pup = { root, g, head, jaw, tail, nose, eyes, ears, torso, params, apply,
    size(v) { g.scale.setScalar(v); },
    update(t, mode = 'idle', mode2, k = 0) { const a = params(t, mode); let p = a; if (mode2 && k > 0) { const b = params(t, mode2); p = {}; for (const key in a) p[key] = lerp(a[key], b[key], k); }
      p._t = t; apply(p); return p; },
    world(part = 'head') { root.updateMatrixWorld(true); const o = { nose, eyeL: eyes[0], eyeR: eyes[1], head, back: body, mouth: jaw }[part] || head; return o.getWorldPosition(W.clone()); } };
  return pup;
}

// ============ ducks ============
export function duck(S, { name = 'duck', col = 0xfbfaf4, s = 1 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(s); S.add(g); const w = M(col, { roughness: 0.8 }), o = M(0xff9a1a, { roughness: 0.5 }), k = basic(0x101010);
  const b = put(g, new THREE.Group(), [0, 0, 0]);
  put(b, mesh(rb(0.62, 0.46, 0.82, 0.2), w), [0, 0.42, 0]); put(b, mesh(rb(0.3, 0.2, 0.3, 0.08), w), [0, 0.6, -0.42], [0.5, 0, 0]);
  const hd = put(b, new THREE.Group(), [0, 0.72, 0.3]); put(hd, mesh(rb(0.36, 0.38, 0.36, 0.14), w), [0, 0.1, 0]); put(hd, mesh(rb(0.24, 0.08, 0.24, 0.04), o), [0, 0.05, 0.25]);
  for (const sx of [-1, 1]) put(hd, new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), k), [sx * 0.17, 0.17, 0.1]);
  const feet = [-1, 1].map(sx => put(g, mesh(rb(0.16, 0.06, 0.24, 0.03), o), [sx * 0.15, 0.03, 0.05]));
  for (const sx of [-1, 1]) put(b, mesh(rb(0.05, 0.3, 0.5, 0.03), M(0xeceae0)), [sx * 0.31, 0.45, -0.05]);
  tagAll(g, name, 'duck');
  g.update = (t, walk = 1) => { b.rotation.z = Math.sin(t * 9) * 0.14 * walk; b.position.y = Math.abs(Math.sin(t * 9)) * 0.05 * walk; hd.rotation.x = Math.sin(t * 9 + 1) * 0.12 * walk;
    feet[0].position.z = 0.05 + Math.sin(t * 9) * 0.12 * walk; feet[1].position.z = 0.05 - Math.sin(t * 9) * 0.12 * walk; };
  return g;
}
export function duckParade(S, n, pts, { spacing = 1.05, s = 1, seed = 3, jitter = 0.35 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal'); const L = curve.getLength(); const R = rng(seed);
  const ds = []; for (let i = 0; i < n; i++) { const d = duck(S, { name: 'ducks', s: s * (0.9 + R() * 0.2), col: R() < 0.12 ? 0xf2e6c8 : 0xfbfaf4 }); d.userData.j = [(R() - 0.5) * jitter * 2, R() * 6]; ds.push(d); }
  return { ducks: ds, curve, length: L, update(t, lead) { ds.forEach((d, i) => { const dist = lead - i * spacing; const u = clamp01(dist / L); d.visible = dist >= 0 && dist <= L;
    const p = curve.getPointAt(u), tg = curve.getTangentAt(u); const nx = -tg.z, nz = tg.x; const off = d.userData.j[0];
    d.position.set(p.x + nx * off, 0, p.z + nz * off); d.rotation.y = Math.atan2(tg.x, tg.z); d.update(t + d.userData.j[1], 1); }); } };
}

// ============ endless bread ============
const breadTex = () => once('bread', () => ctex(512, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#a8601e'); g.addColorStop(0.5, '#d8902e'); g.addColorStop(1, '#a8601e'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let x = 20; x < w; x += 64) { c.fillStyle = '#f2d090'; c.beginPath(); c.ellipse(x, h / 2, 26, 9, -0.5, 0, 7); c.fill(); c.strokeStyle = 'rgba(120,60,10,0.6)'; c.lineWidth = 2; c.stroke(); }
  for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,200' : '90,40,5'},0.15)`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }));
export function endlessBread(S, pts, { r = 0.75, segs = 400 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'centripetal'); const L = curve.getLength();
  const t = breadTex().clone(); t.repeat.set(Math.round(L / 3.2), 1); t.needsUpdate = true;
  const geo = new THREE.TubeGeometry(curve, segs, r, 14, false); const m = mesh(geo, std({ map: t, roughness: 0.7 })); S.add(m);
  const cap = mesh(new THREE.SphereGeometry(r, 16, 12), std({ color: 0xc07a26, roughness: 0.7 })); S.add(cap);
  const total = geo.index.count;
  const api = { mesh: m, curve, length: L,
    reach(u) { u = clamp01(u); geo.setDrawRange(0, Math.floor(total * u / 6) * 6); cap.position.copy(curve.getPointAt(Math.max(0.0005, u))); cap.visible = u > 0.001; m.visible = u > 0.001; },
    tip(u) { return curve.getPointAt(clamp01(u)); } };
  api.reach(1); return api;
}

// ============ coin ============
const coinTex = () => once('coin', () => ctex(128, 128, (c, w, h) => { c.fillStyle = '#f2c23a'; c.beginPath(); c.arc(64, 64, 64, 0, 7); c.fill(); c.strokeStyle = '#b8861a'; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 54, 0, 7); c.stroke();
  c.fillStyle = '#ffe68a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 16 : 36; c.lineTo(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr); } c.fill(); }));
export function wishCoin(S, { s = 1 } = {}) {
  const mats = [M(0xd8a42a, { metalness: 0.9, roughness: 0.25, emissive: 0x5a3a00, emissiveIntensity: 0.4 }), std({ map: coinTex(), metalness: 0.85, roughness: 0.25, emissive: 0x6a4a00, emissiveIntensity: 0.45 })];
  const c = mesh(new THREE.CylinderGeometry(0.2 * s, 0.2 * s, 0.04 * s, 28), [mats[0], mats[1], mats[1]]); S.add(c);
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xffe08a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.001); c.add(gl);
  c.userData.glint = (k) => { gl.scale.setScalar(Math.max(0.001, 1.4 * s * k)); gl.material.opacity = k; };
  return c;
}

// ============ sparkles ============
export function goldBurst(S, n = 60, col = 0xffd86a) {
  const m = new THREE.SpriteMaterial({ map: glowTex(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const ps = []; const R = rng(11); for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(m.clone()); sp.userData.r = [R(), R(), R(), R()]; S.add(sp); ps.push(sp); }
  return { update(t, [x, y, z], k = 1, { up = 6, spread = 3, size = 0.5, speed = 0.4 } = {}) { ps.forEach(p => { const [a, b, c2, d] = p.userData.r; const u = (t * speed + a) % 1;
    const ang = b * Math.PI * 2, rr = spread * (0.2 + c2 * 0.8) * (0.4 + u * 0.6);
    p.position.set(x + Math.cos(ang + u * 2) * rr, y + u * up, z + Math.sin(ang + u * 2) * rr); p.material.opacity = k * Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(t * 9 + d * 20)); p.scale.setScalar(size * (0.5 + d) * (k > 0 ? 1 : 0.001)); p.visible = k > 0.01; }); } };
}

// ============ pickup truck ============
export function pickup(S, { col = 0x3aa8a0 } = {}) {
  const g = new THREE.Group(); S.add(g); const paint = M(col, { roughness: 0.35, metalness: 0.3 }), chrome = M(0xe8e8ec, { metalness: 0.9, roughness: 0.2 }), tyre = M(0x1a1a1a, { roughness: 0.9 }), glass = M(0x2a3a4a, { roughness: 0.05, metalness: 0.5 });
  box(g, [9, 1.6, 4.2], [0, 1.9, 0], paint, { r: 0.4, name: 'pickup' });
  box(g, [3.2, 1.9, 3.8], [0.6, 3.6, 0], paint, { r: 0.4, name: 'pickup cab' });
  put(g, mesh(rb(0.1, 1.3, 3.2, 0.05), glass), [2.22, 3.7, 0]); for (const sz of [-1, 1]) put(g, mesh(rb(2.4, 1.2, 0.1, 0.05), glass), [0.6, 3.75, sz * 1.92]);
  put(g, mesh(rb(2.6, 1.3, 4.0, 0.5), paint), [3.4, 2.4, 0]); put(g, mesh(rb(0.3, 0.6, 4.3, 0.1), chrome), [4.6, 1.5, 0]); put(g, mesh(rb(0.3, 0.6, 4.3, 0.1), chrome), [-4.55, 1.5, 0]);
  for (const sz of [-1, 1]) put(g, new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), basic(0xfff2c0)), [4.71, 2.6, sz * 1.4], [0, Math.PI / 2, 0]);
  for (const [x, z] of [[3, -2], [3, 2], [-3, -2], [-3, 2]]) { put(g, mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.7, 20), tyre), [x, 1.0, z], [Math.PI / 2, 0, 0]); put(g, mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.72, 14), chrome), [x, 1.0, z], [Math.PI / 2, 0, 0]); }
  // rust + a crate of oranges in the bed
  put(g, mesh(rb(1.6, 1.0, 1.4, 0.06), std({ map: woodTex(0x9a6a3a) })), [-2.6, 3.2, 0.6]); for (let i = 0; i < 6; i++) put(g, mesh(new THREE.SphereGeometry(0.28, 10, 8), M(0xff8a1a)), [-3.1 + (i % 3) * 0.5, 3.8, 0.3 + Math.floor(i / 3) * 0.55]);
  return g;
}

// ============ town pieces ============
function adobe(P, { x, z = -16, w = 12, d = 10, h = 10, col = 0xe8b088, trim = 0x2a9a9a, door = true, sign, signCol = '#2a8a8a', wins = 2, floors = 1, ry = 0, name = 'building', awning, roundWin }) {
  const g = put(P, new THREE.Group(), [x, 0, z], [0, ry, 0]); const pm = tmat(plasterTex(col), w / 10, h / 10);
  box(g, [w, h, d], [0, h / 2, -d / 2], pm, { r: 0.6, name });
  // parapet steps + vigas
  box(g, [w * 0.4, 1.4, d * 0.9], [0, h + 0.6, -d / 2], pm, { r: 0.5, solid: false });
  const vm = std({ map: woodTex(0x6a3a1e) }); for (let i = 0; i < Math.floor(w / 1.8); i++) put(g, mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.4, 10), vm), [-w / 2 + 1 + i * 1.8, h - 1.4, 0.4], [Math.PI / 2, 0, 0]);
  const tm = M(trim, { roughness: 0.5 }); const dm = std({ map: woodTex(0x5a2e16) });
  if (door) { put(g, mesh(rb(2.6, 4.4, 0.3, 0.1), dm), [w * 0.18, 2.2, 0.05]); put(g, mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.3, 20, 1, false, 0, Math.PI), dm), [w * 0.18, 4.4, 0.05], [Math.PI / 2, Math.PI / 2, 0]);
    put(g, mesh(rb(3.2, 0.3, 0.5, 0.1), tm), [w * 0.18, 0.15, 0.25]); }
  for (let f = 0; f < floors; f++) for (let i = 0; i < wins; i++) { const wx = -w / 2 + 2 + i * 3.2 - (door ? 0 : 0), wy = 3.4 + f * 4.6; if (door && Math.abs(wx - w * 0.18) < 2.4 && f === 0) continue;
    const lit = put(g, mesh(rb(1.6, 1.9, 0.1, 0.05), M(0x2a2a3a, { roughness: 0.2, emissive: 0xffb860, emissiveIntensity: 0 }), false), [wx, wy, 0.06]); g.userData.wins = (g.userData.wins || []).concat([lit]);
    for (const sx of [-1, 1]) put(g, mesh(rb(0.8, 2.0, 0.12, 0.04), tm), [wx + sx * 1.25, wy, 0.12], [0, sx * 0.25, 0]);
    put(g, mesh(rb(2.2, 0.4, 0.6, 0.1), std({ map: woodTex(0x8a5a2a) })), [wx, wy - 1.2, 0.3]);
    for (let k = 0; k < 4; k++) put(g, mesh(new THREE.SphereGeometry(0.22, 8, 6), M([0xff3a5a, 0xffd23a, 0xff8ad0, 0x6ad84a][(k + i) % 4])), [wx - 0.75 + k * 0.5, wy - 0.85, 0.45]); }
  if (roundWin) { const [rx, ry2] = roundWin; const rw = put(g, new THREE.Group(), [rx, ry2, 0.08]); put(rw, mesh(new THREE.TorusGeometry(1.5, 0.22, 10, 32), tm), [0, 0, 0]);
    const glass = put(rw, mesh(new THREE.CircleGeometry(1.45, 32), M(0x2a2a3a, { emissive: 0xffc070, emissiveIntensity: 0, roughness: 0.2 }), false), [0, 0, -0.02]); g.userData.round = glass; }
  if (sign) { put(g, new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * 0.7, 8), Math.min(w * 0.7, 8) / 4), std({ map: signTex(sign, signCol), roughness: 0.6 })), [0, h - 2.6, 0.1]); }
  if (awning) { const am = std({ map: ctex(128, 32, (c, ww, hh) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff2dc' : awning; c.fillRect(i * 16, 0, 16, hh); } }), roughness: 0.8, side: THREE.DoubleSide });
    put(g, mesh(new THREE.PlaneGeometry(w * 0.8, 2.6), am), [0, 5.6, 1.1], [-0.9, 0, 0]); }
  return g;
}
function saguaro(P, [x, z], h = 8, seed = 1) { const R = rng(seed); const m = std({ map: ctex(64, 64, (c, w, hh) => { c.fillStyle = '#3a7a3a'; c.fillRect(0, 0, w, hh); for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(20,60,20,0.6)'; c.fillRect(i * 8, 0, 2, hh); } }, [3, 2]), roughness: 0.8 });
  const g = put(P, new THREE.Group(), [x, 0, z]); put(g, mesh(new THREE.CylinderGeometry(0.7, 0.8, h, 12), m), [0, h / 2, 0]); put(g, mesh(new THREE.SphereGeometry(0.7, 12, 8), m), [0, h, 0]);
  for (const sx of [-1, 1]) { if (R() < 0.25) continue; const ay = h * (0.35 + R() * 0.25), al = 1.4 + R(); put(g, mesh(new THREE.CylinderGeometry(0.45, 0.45, al, 10), m), [sx * (0.7 + al / 2), ay, 0], [0, 0, Math.PI / 2]);
    const up = h * 0.3 + R() * 2; put(g, mesh(new THREE.CylinderGeometry(0.45, 0.45, up, 10), m), [sx * (0.7 + al), ay + up / 2, 0]); put(g, mesh(new THREE.SphereGeometry(0.45, 10, 6), m), [sx * (0.7 + al), ay + up, 0]); }
  return g; }
function pricklyPot(P, [x, z], seed = 1) { const g = put(P, new THREE.Group(), [x, 0, z]); put(g, mesh(new THREE.CylinderGeometry(0.9, 0.65, 1.3, 14), M(0xc0643a)), [0, 0.65, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.2, 14), M(0x2a9a9a)), [0, 1.2, 0]); const pm = M(0x5a9a4a);
  for (let i = 0; i < 4; i++) { const p = put(g, mesh(new THREE.SphereGeometry(0.5, 10, 8), pm), [Math.sin(i * 2 + seed) * 0.35, 1.7 + i * 0.35, Math.cos(i * 2 + seed) * 0.2]); p.scale.set(1, 1.2, 0.35); p.rotation.y = i; }
  put(g, mesh(new THREE.SphereGeometry(0.15, 8, 6), M(0xff5a8a)), [0, 3.0, 0]); return g; }
function lampPost(P, [x, z], night) { const g = put(P, new THREE.Group(), [x, 0, z]); const im = M(0x1e1a18, { metalness: 0.6, roughness: 0.4 });
  put(g, mesh(new THREE.CylinderGeometry(0.15, 0.25, 7, 8), im), [0, 3.5, 0]); put(g, mesh(rb(0.8, 1.1, 0.8, 0.1), im), [0, 7.4, 0]);
  const bulb = put(g, new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), basic(night ? 0xffd890 : 0xe8dcc0)), [0, 7.4, 0]); box(P, [0.6, 7, 0.6], [x, 3.5, z], basic(0, { visible: false }), { r: 0, cast: false, name: 'lamp post' }); return g; }
function flags(P, a, b, n, seed = 1) { const R = rng(seed); const cols = ['#ff3a6a', '#ffd23a', '#3ad8c8', '#9a5aff', '#ff8a2a', '#4aa8ff', '#6ad84a'];
  const pts = []; const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const lm = new THREE.LineBasicMaterial({ color: 0x2a2018 }); const lg = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 21 }, (_, i) => { const u = i / 20; const p = A.clone().lerp(B, u); p.y -= Math.sin(u * Math.PI) * 1.2; return p; })); P.add(new THREE.Line(lg, lm));
  const fs = []; for (let i = 1; i < n; i++) { const u = i / n; const p = A.clone().lerp(B, u); p.y -= Math.sin(u * Math.PI) * 1.2;
    const tex = ctex(64, 64, (c, w, h) => { c.fillStyle = cols[Math.floor(R() * cols.length)]; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.0)'; c.globalCompositeOperation = 'destination-out'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(12 + (k % 3) * 20, 18 + Math.floor(k / 3) * 22, 5, 0, 7); c.fill(); } c.fillRect(0, h - 8, w, 8); for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(k * 8, h); c.lineTo(k * 8 + 4, h - 10); c.lineTo(k * 8 + 8, h); c.fill(); } });
    const f = put(P, new THREE.Group(), [p.x, p.y, p.z]); const fm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), new THREE.MeshStandardMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, roughness: 0.8, alphaTest: 0.3 }));
    fm.position.y = -0.55; f.add(fm); f.rotation.y = Math.atan2(B.x - A.x, B.z - A.z) + Math.PI / 2; fs.push(f); }
  return (t) => fs.forEach((f, i) => { f.children[0].rotation.x = Math.sin(t * 3 + i * 0.7) * 0.25; }); }
function wishingWell(P, night) {
  const g = put(P, new THREE.Group(), [0, 0, 0]); const st = tmat(stoneTex(), 4, 1); const wd = std({ map: woodTex(0x6a3e1e) });
  // ring wall
  const ring = mesh(new THREE.CylinderGeometry(2.4, 2.6, 1.7, 32, 1, true), st); ring.position.y = 0.85; g.add(ring);
  const inner = mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.7, 32, 1, true), std({ map: stoneTex(true), side: THREE.BackSide })); inner.position.y = 0.85; g.add(inner);
  put(g, mesh(new THREE.RingGeometry(2.0, 2.55, 32), std({ map: stoneTex(), roughness: 0.8 })), [0, 1.71, 0], [-Math.PI / 2, 0, 0]);
  put(g, mesh(new THREE.TorusGeometry(2.3, 0.22, 8, 32), M(0x9a8a78)), [0, 1.7, 0], [Math.PI / 2, 0, 0]);
  const water = put(g, mesh(new THREE.CircleGeometry(2.0, 32), M(0x1a3a4a, { roughness: 0.05, metalness: 0.3, emissive: 0xffc040, emissiveIntensity: 0 }), false), [0, 0.5, 0], [-Math.PI / 2, 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.5, 24), basic(0x05080a)), [0, 0.24, 0]);
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3; put(g, mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12), M(0xf2c23a, { metalness: 0.9, roughness: 0.3, emissive: 0x4a3000 })), [Math.cos(a) * (0.4 + (i % 3) * 0.5), 0.52, Math.sin(a) * (0.4 + (i % 3) * 0.5)]); }
  box(P, [5.0, 1.7, 5.0], [0, 0.85, 0], basic(0, { visible: false }), { r: 0, cast: false, name: 'well' });
  // posts, roof, crank, bucket
  for (const sx of [-1, 1]) { put(g, mesh(rb(0.45, 6.2, 0.45, 0.08), wd), [sx * 2.15, 3.1, 0]); box(P, [0.45, 6.2, 0.45], [sx * 2.15, 3.1, 0], basic(0, { visible: false }), { r: 0, cast: false, name: 'well post' }); }
  const roofM = std({ map: ctex(128, 128, (c, w, h) => { c.fillStyle = '#8a3a22'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 8; x < w; x += 16) { c.fillStyle = hex(new THREE.Color(0xa84a2a).multiplyScalar(0.8 + Math.random() * 0.35)); c.beginPath(); c.arc(x + 8, y + 12, 8, Math.PI, 0); c.fill(); } }, [2, 2]), roughness: 0.8 });
  for (const sz of [-1, 1]) put(g, mesh(rb(5.6, 0.25, 2.2, 0.06), roofM), [0, 6.7, sz * 0.95], [sz * 0.55, 0, 0]);
  put(g, mesh(rb(5.8, 0.3, 0.3, 0.06), wd), [0, 7.3, 0]);
  const crank = put(g, new THREE.Group(), [0, 5.0, 0]); put(crank, mesh(new THREE.CylinderGeometry(0.22, 0.22, 4.3, 12), wd), [0, 0, 0], [0, 0, Math.PI / 2]); put(crank, mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.2, 12), M(0xc8b088, { roughness: 1 })), [0, 0, 0], [0, 0, Math.PI / 2]);
  put(g, mesh(rb(0.15, 1.0, 0.15, 0.04), M(0x2a2a2a, { metalness: 0.6 })), [2.5, 4.6, 0]); put(g, mesh(rb(0.15, 0.15, 0.7, 0.04), M(0x2a2a2a, { metalness: 0.6 })), [2.5, 4.1, 0.3]);
  put(g, mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), M(0xc8b088)), [0, 4.1, 0]);
  const bucket = put(g, new THREE.Group(), [0, 3.1, 0]); put(bucket, mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.7, 14), std({ map: woodTex(0x7a4a26) })), [0, 0, 0]); put(bucket, mesh(new THREE.TorusGeometry(0.43, 0.04, 6, 16), M(0x2a2a2a)), [0, 0.3, 0], [Math.PI / 2, 0, 0]);
  // little sign
  const sg = put(g, new THREE.Group(), [-3.3, 0, 1.6], [0, 0.6, 0]); put(sg, mesh(rb(0.2, 2.0, 0.2, 0.05), wd), [0, 1.0, 0]); put(sg, new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.7), std({ map: signTex('1 WISH EACH', '#5a2e16', '#ffe8b0', 512, 180) })), [0, 2.1, 0.12], [-0.1, 0, 0]);
  const glowL = new THREE.PointLight(0xffc040, 0, 18, 1.5); glowL.position.set(0, 2.6, 0); P.add(glowL);
  const shaft = put(g, new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.2, 14, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })), [0, 8.5, 0]);
  return { g, water, bucket, crank, glowL, shaft, glow(k) { water.material.emissiveIntensity = 2.5 * k; glowL.intensity = 160 * k; shaft.material.opacity = 0.35 * k; shaft.visible = k > 0.01; } };
}
function clockTower(P, [x, z], night) { const g = put(P, new THREE.Group(), [x, 0, z]); const pm = tmat(plasterTex(0xf0c8a0), 1, 3);
  box(g, [7, 24, 7], [0, 12, 0], pm, { r: 0.5, name: 'clock tower' }); box(g, [7.6, 1, 7.6], [0, 24.5, 0], M(0xb8603a), { r: 0.3, solid: false });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(g, mesh(rb(1.2, 4.6, 1.2, 0.3), pm), [sx * 2.9, 27.3, sz * 2.9]);
  put(g, mesh(rb(7.4, 1.0, 7.4, 0.3), M(0xb8603a)), [0, 30.1, 0]); put(g, mesh(new THREE.ConeGeometry(1.0, 1.8, 4), M(0xb8603a)), [0, 31.5, 0], [0, Math.PI / 4, 0]);
  const bell = put(g, new THREE.Group(), [0, 29.2, 0]); put(bell, mesh(new THREE.CylinderGeometry(0.6, 1.4, 2.0, 16, 1, true), M(0xc89a3a, { metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide })), [0, -1.2, 0]);
  const face = put(g, new THREE.Group(), [0, 20, 3.56]); put(face, mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.2, 40), M(0xfff6e0, { emissive: 0xffe0a0, emissiveIntensity: night ? 0.8 : 0.05 }), false), [0, 0, 0], [Math.PI / 2, 0, 0]);
  put(face, mesh(new THREE.TorusGeometry(2.45, 0.18, 8, 40), M(0x2a9a9a)), [0, 0, 0.05]);
  for (let i = 0; i < 12; i++) put(face, mesh(rb(0.12, 0.4, 0.05, 0.02), M(0x2a2018)), [Math.sin(i * Math.PI / 6) * 2.0, Math.cos(i * Math.PI / 6) * 2.0, 0.12], [0, 0, -i * Math.PI / 6]);
  const hh = put(face, new THREE.Group(), [0, 0, 0.16]), mh = put(face, new THREE.Group(), [0, 0, 0.2]);
  put(hh, mesh(rb(0.18, 1.2, 0.05, 0.02), M(0x1a1410)), [0, 0.5, 0]); put(mh, mesh(rb(0.12, 1.8, 0.05, 0.02), M(0x1a1410)), [0, 0.8, 0]);
  const dm = std({ map: woodTex(0x5a2e16) }); put(g, mesh(rb(2.6, 4.2, 0.3, 0.1), dm), [0, 2.1, 3.56]);
  return { g, bell, set(h, m) { hh.rotation.z = -((h % 12) + m / 60) * Math.PI / 6; mh.rotation.z = -m * Math.PI / 30; } };
}
function waterTower(P, [x, z]) { const g = put(P, new THREE.Group(), [x, 0, z]); const piv = put(g, new THREE.Group(), [4, 0, 0]); const inner = put(piv, new THREE.Group(), [-4, 0, 0]);
  const wm = std({ map: woodTex(0x8a5a32), roughness: 0.8 }); const im = M(0x3a3430, { metalness: 0.5, roughness: 0.5 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(inner, mesh(new THREE.CylinderGeometry(0.35, 0.45, 20, 8), wm), [sx * 3.6, 10, sz * 3.6], [sz * 0.05, 0, -sx * 0.05]);
  for (const y of [6, 13]) for (const r of [0, 1, 2, 3]) { const b = put(inner, mesh(new THREE.CylinderGeometry(0.12, 0.12, 10, 6), im), [0, y, 0]); if (r < 2) { b.rotation.set(0, 0, r % 2 ? 0.75 : -0.75); b.position.z = r ? 3.6 : -3.6; } else { b.rotation.set(r % 2 ? 0.75 : -0.75, 0, 0); b.position.x = r === 3 ? 3.6 : -3.6; } }
  const tankM = std({ map: ctex(512, 128, (c, w, h) => { c.fillStyle = '#9a6a3a'; c.fillRect(0, 0, w, h); for (let xx = 0; xx < w; xx += 16) { c.fillStyle = `rgba(40,20,5,${0.15 + Math.random() * 0.2})`; c.fillRect(xx, 0, 3, h); }
    c.fillStyle = '#fff2dc'; c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText('PENNY MESA', w * 0.25, h * 0.62); c.fillText('PENNY MESA', w * 0.75, h * 0.62); }), roughness: 0.8 });
  put(inner, mesh(new THREE.CylinderGeometry(6, 6, 8, 28), tankM), [0, 24, 0]); for (const y of [21, 24, 27]) put(inner, mesh(new THREE.TorusGeometry(6.05, 0.15, 6, 32), im), [0, y, 0], [Math.PI / 2, 0, 0]);
  put(inner, mesh(new THREE.ConeGeometry(6.6, 3.4, 28), M(0x7a3a22)), [0, 29.7, 0]); put(inner, mesh(rb(14, 0.3, 14, 0.1), wm), [0, 19.9, 0]);
  // water burst where the tank lands (toward +x)
  const drops = []; const dm = new THREE.MeshStandardMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.8, roughness: 0.05, emissive: 0x3a5a6a, emissiveIntensity: 0.3 }); const R = rng(5);
  for (let i = 0; i < 110; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.6 + R() * 1.2, 8, 6), dm); d.userData.v = [(R() - 0.5) * 22, 8 + R() * 22, (R() - 0.3) * 22]; d.visible = false; P.add(d); drops.push(d); }
  return { g, topple(k) { piv.rotation.z = -k * 1.45; },
    splash(k) { drops.forEach((d) => { const [vx, vy, vz] = d.userData.v; const u = k * 1.6; d.visible = k > 0.005 && k < 0.98; d.position.set(x + 26 + vx * u, Math.max(0.4, 2 + vy * u - 16 * u * u), z + vz * u); d.scale.setScalar(1 + k); }); } };
}
function windmill(P, [x, z]) { const g = put(P, new THREE.Group(), [x, 0, z]); const im = M(0x5a5450, { metalness: 0.6, roughness: 0.4 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(g, mesh(new THREE.CylinderGeometry(0.12, 0.12, 18, 6), im), [sx * 1.2, 9, sz * 1.2], [sz * 0.06, 0, -sx * 0.06]);
  const hub = put(g, new THREE.Group(), [0, 18, 1]); for (let i = 0; i < 12; i++) { const b = put(hub, new THREE.Group(), [0, 0, 0], [0, 0, i * Math.PI / 6]); put(b, mesh(rb(0.7, 2.6, 0.08, 0.03), M(0xe8e2d8)), [0, 2.2, 0], [0, 0.3, 0]); }
  put(g, mesh(rb(0.3, 0.6, 4, 0.1), im), [0, 18, -1.5]); put(g, mesh(rb(0.1, 2, 2.6, 0.05), M(0xe8e2d8)), [0, 18, -3.5]); return (t) => { hub.rotation.z = t * 1.4; }; }
function paloVerde(P, [x, z], night) { const g = put(P, new THREE.Group(), [x, 0, z]); const bm = M(0x6a9a4a, { roughness: 0.8 });
  put(g, mesh(new THREE.CylinderGeometry(0.4, 0.6, 6, 8), bm), [0, 3, 0], [0, 0, 0.12]); const leaves = [];
  for (let i = 0; i < 9; i++) { const a = i * 0.7; const lp = put(g, mesh(new THREE.SphereGeometry(2.4 - (i % 3) * 0.4, 10, 8), M(i % 2 ? 0x9ab84a : 0x7aa83a, { roughness: 0.9 })), [Math.cos(a) * 2.4, 7 + (i % 3) * 0.9, Math.sin(a) * 2.0]); lp.scale.y = 0.55; leaves.push(lp);
    put(g, mesh(new THREE.CylinderGeometry(0.15, 0.25, 3.5, 6), bm), [Math.cos(a) * 1.2, 5.6, Math.sin(a) * 1.0], [Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]); }
  for (let i = 0; i < 14; i++) put(g, mesh(new THREE.SphereGeometry(0.2, 6, 4), M(0xffd23a, { emissive: 0x5a4a00 })), [Math.cos(i) * 3, 7.6 + (i % 3) * 0.6, Math.sin(i * 1.3) * 2.6]);
  box(P, [1.2, 6, 1.2], [x, 3, z], basic(0, { visible: false }), { r: 0, cast: false, name: 'tree' });
  return (t) => leaves.forEach((l, i) => { l.position.x += Math.sin(t * 1.3 + i) * 0.002; l.rotation.z = Math.sin(t * 0.9 + i) * 0.04; }); }
function bench(P, [x, z], ry = 0) { const g = put(P, new THREE.Group(), [x, 0, z], [0, ry * D, 0]); const wm = std({ map: woodTex(0x9a5a2a) }); const im = M(0x2a2420, { metalness: 0.5 });
  put(g, mesh(rb(5, 0.25, 1.4, 0.06), wm), [0, 1.4, 0]); put(g, mesh(rb(5, 1.4, 0.2, 0.06), wm), [0, 2.4, -0.75], [-0.15, 0, 0]);
  for (const sx of [-2.2, 2.2]) { put(g, mesh(rb(0.2, 1.4, 1.4, 0.05), im), [sx, 0.7, 0]); }
  box(P, [5, 0.25, 1.4], [x, 1.4, z], basic(0, { visible: false }), { r: 0, cast: false, name: 'bench seat' }); return g; }
function fruitCart(P, [x, z]) { const g = put(P, new THREE.Group(), [x, 0, z]); const wm = std({ map: woodTex(0x2a8a8a) });
  box(g, [5, 1.6, 2.6], [0, 1.8, 0], wm, { r: 0.1, name: 'fruit cart' }); for (const sx of [-1, 1]) put(g, mesh(new THREE.TorusGeometry(1.0, 0.15, 6, 16), M(0x3a2418)), [sx * 1.8, 1.0, 1.4]);
  for (let i = 0; i < 18; i++) put(g, mesh(new THREE.SphereGeometry(0.32, 10, 8), M([0xff8a1a, 0xffd23a, 0xff3a3a, 0x6ad84a][i % 4])), [-2 + (i % 6) * 0.8, 2.85 + Math.floor(i / 6) * 0.25, -0.8 + Math.floor(i / 6) * 0.6]);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(g, mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), M(0x3a2418)), [sx * 2.3, 4.4, sz * 1.2]);
  put(g, mesh(rb(5.4, 0.2, 3.2, 0.05), std({ map: ctex(128, 32, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff2dc' : '#ff5a3a'; c.fillRect(i * 16, 0, 16, h); } }) })), [0, 6.4, 0]); return g; }
function mesas(P, night) { const mm = std({ map: mesaTex(), roughness: 1, fog: true }); const R = rng(7);
  for (let i = 0; i < 9; i++) { const w = 40 + R() * 60, h = 30 + R() * 40; const m = mesh(rb(w, h, 30, 3), tmat(mesaTex(), w / 30, 1, { roughness: 1 }), false); m.position.set(-260 + i * 65 + R() * 20, h / 2 - 2, -190 - R() * 50); P.add(m);
    const cap = mesh(rb(w + 4, 3, 34, 1.4), M(0x8a3a22, { roughness: 1 }), false); cap.position.set(m.position.x, h - 1, m.position.z); P.add(cap); }
  for (let i = 0; i < 4; i++) { const b = mesh(rb(8, 34 + i * 6, 8, 2), tmat(mesaTex(), 0.5, 1, { roughness: 1 }), false); b.position.set(-140 + i * 95, 15 + i * 3, -130 - i * 8); P.add(b); }
  const dm = std({ map: sandTex(), roughness: 1 }); dm.map = dm.map.clone(); dm.map.repeat.set(8, 2); dm.map.needsUpdate = true;
  for (let i = 0; i < 10; i++) { const d = mesh(new THREE.SphereGeometry(30 + R() * 20, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), dm, false); d.scale.y = 0.18 + R() * 0.1; d.position.set(-240 + i * 52, -1, -85 - R() * 30); P.add(d); } }

// ============ the town plaza ============
export function pennyMesa(S, { time = 'day', tower = 1, flagsOn = true } = {}) {
  const night = time === 'night', sunset = time === 'sunset';
  S.background = night ? skyTex('#050a22', '#14204a', '#2a2a5a') : sunset ? skyTex('#3a3a8a', '#e86a5a', '#ffc070') : skyTex('#3a88e0', '#8ac4f4', '#f8e0c0');
  S.fog = new THREE.Fog(night ? 0x141a3a : sunset ? 0xe89a7a : 0xf0d8b8, night ? 80 : 110, night ? 300 : 420);
  if (night) S.userData.look = 'night';
  box(S, [900, 0.3, 900], [0, -0.16, -200], tmat(sandTex(), 120, 120, { roughness: 1 }), { r: 0, cast: false, solid: false, name: 'ground' });
  box(S, [110, 0.1, 52], [0, 0.0, 9], tmat(tileTex(), 22, 10.4, { roughness: 0.75 }), { r: 0, cast: false, solid: false, name: 'plaza' });
  for (const z of [-16.5, 35]) box(S, [110, 0.3, 0.8], [0, 0.12, z], M(0xc8a07a), { r: 0.1, cast: false, solid: false });
  const P = new THREE.Group(); S.add(P);
  const well = wishingWell(P, night);
  const houses = {
    tess: adobe(P, { x: -44, w: 12, h: 14, col: 0xf2c0a0, trim: 0x2a6ab8, wins: 2, floors: 1, name: 'tess house', roundWin: [0.5, 10.2] }),
    bakery: adobe(P, { x: -25, w: 14, h: 10, col: 0xf6d6a8, trim: 0xc8302a, sign: 'BAKERY', signCol: '#c8302a', wins: 1, awning: '#c8302a', name: 'bakery' }),
    store: adobe(P, { x: -9.5, w: 10, h: 9, col: 0xe8a888, trim: 0x2a9a9a, sign: 'STORE', wins: 2, name: 'store' }),
    hall: adobe(P, { x: 19, w: 14, h: 12, col: 0xf0d0b0, trim: 0x2a9a6a, sign: 'TOWN HALL', signCol: '#2a7a5a', wins: 3, name: 'town hall' }),
    school: adobe(P, { x: 37, w: 14, h: 10, col: 0xe8b888, trim: 0xe8a82a, sign: 'SCHOOL', signCol: '#d8901a', wins: 3, name: 'school' }),
    far1: adobe(P, { x: -62, w: 12, h: 9, col: 0xd89878, wins: 2, name: 'far house' }), far2: adobe(P, { x: 56, w: 12, h: 8, col: 0xf2c8a0, wins: 2, name: 'far house 2' }),
  };
  // oven hatch on the bakery (bread comes out of it)
  const hatch = put(P, new THREE.Group(), [-20, 3.2, -15.85]); put(hatch, mesh(new THREE.TorusGeometry(1.15, 0.25, 10, 28), M(0x3a3430, { metalness: 0.6, roughness: 0.4 })), [0, 0, 0]); put(hatch, new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), basic(0xff7a20)), [0, 0, -0.02]);
  const ovenL = new THREE.PointLight(0xff8a30, night ? 22 : 8, 9, 1.6); ovenL.position.set(-20, 3.2, -14.5); S.add(ovenL);
  const clock = clockTower(P, [4, -19.5], night); clock.set(time === 'night' ? 10 : sunset ? 6 : 12, sunset ? 50 : 15);
  const wt = waterTower(P, [56, -34]); wt.g.visible = tower > 0;
  const mill = windmill(P, [-66, -32]);
  // camera-side row (reverse shots)
  for (let i = 0; i < 6; i++) adobe(P, { x: -50 + i * 20, z: 35, w: 14, h: 8 + (i % 3) * 2, col: [0xf0c0a0, 0xe8a888, 0xf6d6a8][i % 3], trim: [0x2a9a9a, 0xc8302a, 0x2a6ab8][i % 3], ry: Math.PI, wins: 2, name: 'rev' + i });
  // dressing
  const tree = paloVerde(P, [-15, 2], night);
  bench(P, [-12, 6.5], 0); bench(P, [12, 6.5], 0); fruitCart(P, [22, 2]);
  for (const [x, z] of [[-9, -8], [9, -8], [-24, 12], [24, 12]]) lampPost(P, [x, z], night);
  for (const [x, z, s] of [[-30, -10, 1], [30, -10, 2], [-6, -11.5, 3], [11, -11, 4], [-36, 18, 5], [32, 22, 6]]) pricklyPot(P, [x, z], s);
  for (const [x, z, h, s] of [[-52, -22, 10, 1], [48, -22, 9, 2], [-80, -40, 12, 3], [72, -48, 11, 4], [-30, -60, 9, 5], [24, -70, 12, 6], [90, -20, 10, 7], [-95, -15, 8, 8]]) saguaro(P, [x, z], h, s);
  for (const [x, z] of [[-36, -12.5], [-34.5, -12.8], [14, -13], [28, -12.4]]) { put(P, mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 14), std({ map: woodTex(0x7a4a26) })), [x, 0.9, z]); }
  put(P, mesh(new THREE.TorusGeometry(1.3, 0.16, 6, 20), M(0x5a3420)), [-40.5, 1.3, -15.6], [0, 0, 0.2]);
  const flagUp = flagsOn ? [flags(P, [-24, 9.5, -15.8], [-9, 7.5, -8], 14, 1), flags(P, [-9, 7.5, -8], [9, 7.5, -8], 14, 2), flags(P, [9, 7.5, -8], [19, 10.5, -15.8], 12, 3)] : [];
  mesas(P, night);
  clouds(S, night ? { night: true, y: [60, 100], z: [-140, -240], x: 300 } : sunset ? { tint: 0xffa890, y: [55, 95], z: [-140, -240], x: 300 } : { y: [55, 95], z: [-140, -240], x: 300 });
  // stars + moon
  if (night) { const n = 600, p = new Float32Array(n * 3), R = rng(21); for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, e = 0.12 + R() * 1.2; p[i * 3] = Math.cos(a) * 320 * Math.cos(e); p[i * 3 + 1] = 320 * Math.sin(e); p[i * 3 + 2] = Math.sin(a) * 320 * Math.cos(e) - 60; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(p, 3)); S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false, fog: false })));
    put(S, new THREE.Mesh(new THREE.CircleGeometry(9, 40), basic(0xfff4d8, { fog: false })), [40, 110, -260]);
    Object.values(houses).forEach(h => (h.userData.wins || []).forEach((w, i) => { if ((i + h.id) % 3) w.material.emissiveIntensity = 1.2; })); if (houses.tess.userData.round) houses.tess.userData.round.material.emissiveIntensity = 1.5; }
  // lights
  let sun; const lamps = [];
  if (night) { S.add(new THREE.HemisphereLight(0x5a6ad0, 0x2a1a30, 0.75)); sun = new THREE.DirectionalLight(0xa8b8ff, 1.3); sun.position.set(30, 60, 35);
    for (const [x, z] of [[-9, -8], [9, -8], [-24, 12], [24, 12]]) { const l = new THREE.PointLight(0xffc880, 55, 24, 1.6); l.position.set(x, 7.0, z + 0.6); S.add(l); lamps.push(l); } }
  else { S.add(new THREE.HemisphereLight(sunset ? 0xffb0a0 : 0xcfe4ff, sunset ? 0x5a3a3a : 0xa87a5a, sunset ? 0.8 : 1.0));
    sun = new THREE.DirectionalLight(sunset ? 0xff9a5a : 0xfff0d8, sunset ? 2.8 : 3.2); sun.position.set(sunset ? -70 : 35, sunset ? 22 : 50, sunset ? 25 : 40);
    const rim = new THREE.DirectionalLight(sunset ? 0xff6a8a : 0xffe0c0, sunset ? 1.4 : 0.8); rim.position.set(30, 18, -50); S.add(rim); }
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -40, near: 1, far: 260 }); sun.target.position.set(0, 0, -8); S.add(sun, sun.target);
  const key = new THREE.PointLight(night ? 0xffe0c0 : 0xfff0e0, night ? 24 : 0, 20, 1.6); key.position.set(0, 6, 9); S.add(key);
  // drifting dust (day) / moths (night)
  const motes = []; const mm = new THREE.MeshBasicMaterial({ color: night ? 0xfff0b0 : 0xfff2d8, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), mm); m.userData.o = [(i * 37 % 60) - 30, 1 + (i * 13 % 9), (i * 23 % 30) - 10]; S.add(m); motes.push(m); }
  return { houses, well, clock, tower: wt, lamps, sun, key, ovenL, P, hatch,
    follow(x, z = -8) { sun.target.position.set(x, 0, z); sun.position.x = x + (night ? 30 : sunset ? -70 : 35); },
    update(t) { flagUp.forEach(f => f(t)); mill(t); tree(t); ovenL.intensity = (night ? 22 : 8) * (0.9 + 0.1 * Math.sin(t * 9));
      lamps.forEach((l, i) => l.intensity = 55 * (0.95 + 0.05 * Math.sin(t * 7 + i)));
      motes.forEach((m, i) => { const [a, b, c] = m.userData.o; m.position.set(a + Math.sin(t * 0.3 + i) * 2, b + Math.sin(t * 0.5 + i * 2) * 0.6, c + Math.cos(t * 0.2 + i) * 1.5); }); } };
}

// ============ inside the well ============
export function wellShaft(S, { time = 'day' } = {}) {
  const night = time === 'night';
  S.background = night ? new THREE.Color(0x0c1638) : time === 'sunset' ? new THREE.Color(0xf09a6a) : new THREE.Color(0x7ab8f0);
  const g = new THREE.Group(); S.add(g);
  const sm = std({ map: (() => { const t = stoneTex(true).clone(); t.repeat.set(5, 6); t.needsUpdate = true; return t; })(), side: THREE.BackSide, roughness: 0.9 });
  put(g, mesh(new THREE.CylinderGeometry(2.2, 2.2, 16, 36, 1, true), sm, false), [0, -6.2, 0]);
  const water = put(g, mesh(new THREE.CircleGeometry(2.2, 36), M(0x0a2a3a, { roughness: 0.05, metalness: 0.4, emissive: 0xffc040, emissiveIntensity: 0 }), false), [0, -14, 0], [-Math.PI / 2, 0, 0]);
  for (let i = 0; i < 26; i++) { const a = i * 2.4; const r = 0.3 + (i % 5) * 0.35; put(g, mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 12), M(0xf2c23a, { metalness: 0.9, roughness: 0.3, emissive: 0x4a3000, emissiveIntensity: 0.5 })), [Math.cos(a) * r, -14.3 + (i % 3) * 0.02, Math.sin(a) * r], [0.2 * Math.sin(i), 0, 0.2 * Math.cos(i)]); }
  put(g, mesh(new THREE.CircleGeometry(2.2, 36), M(0x3a2a10, { roughness: 1 }), false), [0, -14.35, 0], [-Math.PI / 2, 0, 0]);
  // moss + roots + a few lost things
  const mossM = M(0x3a6a2a, { roughness: 1 }); for (let i = 0; i < 30; i++) { const a = i * 1.3, y = -12 + (i % 10) * 1.3; const m = put(g, mesh(new THREE.SphereGeometry(0.3 + (i % 3) * 0.1, 8, 6), mossM, false), [Math.cos(a) * 2.1, y, Math.sin(a) * 2.1]); m.scale.set(1, 0.6, 1); }
  const rootM = M(0x5a3a22, { roughness: 1 }); for (let i = 0; i < 5; i++) { const a = i * 1.25 + 0.4; put(g, mesh(new THREE.TorusGeometry(0.8, 0.07, 6, 12, Math.PI), rootM, false), [Math.cos(a) * 2.0, -3 - i * 1.6, Math.sin(a) * 2.0], [0, -a, Math.PI / 2]); }
  // rim + well roof above
  put(g, mesh(new THREE.TorusGeometry(2.3, 0.25, 8, 36), M(0x9a8a78)), [0, 1.7, 0], [Math.PI / 2, 0, 0]);
  const wd = std({ map: woodTex(0x6a3e1e) }); for (const sx of [-1, 1]) put(g, mesh(rb(0.45, 6.2, 0.45, 0.08), wd), [sx * 2.15, 3.1 + 1.7, 0]);
  const roof = put(g, new THREE.Group(), [0, 0, 0]); for (const sz of [-1, 1]) put(roof, mesh(rb(5.6, 0.25, 2.2, 0.06), M(0x8a3a22)), [0, 6.7 + 1.7, sz * 0.95], [sz * 0.55, 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.22, 0.22, 4.3, 12), wd), [0, 6.7, 0], [0, 0, Math.PI / 2]);
  const rope = put(g, mesh(new THREE.CylinderGeometry(0.04, 0.04, 9, 6), M(0xc8b088), false), [0.6, 2.2, 0.3]);
  const bucket = put(g, new THREE.Group(), [0.6, -2.4, 0.3]); put(bucket, mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.7, 14), std({ map: woodTex(0x7a4a26) })), [0, 0, 0]);
  // light from above + bounce + magic glow
  S.add(new THREE.HemisphereLight(night ? 0x5a6ad0 : 0xfff0d8, 0x1a1410, night ? 0.5 : 0.9));
  const top = new THREE.SpotLight(night ? 0xa8b8ff : 0xfff0d0, night ? 60 : 160, 40, 0.5, 0.6, 1.2); top.position.set(0.6, 8, 0.6); top.target.position.set(0, -14, 0); S.add(top, top.target);
  const glowL = new THREE.PointLight(0xffc040, 0, 22, 1.4); glowL.position.set(0, -12.6, 0); S.add(glowL);
  const ring = put(g, new THREE.Mesh(new THREE.RingGeometry(0.1, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0xffe8a0, transparent: true, opacity: 0, depthWrite: false })), [0, -13.95, 0], [-Math.PI / 2, 0, 0]);
  const motes = []; const mm = new THREE.MeshBasicMaterial({ color: 0xffe8b0, transparent: true, opacity: 0.6 });
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 4), mm); m.userData.o = [Math.sin(i * 7) * 1.6, -13 + (i * 0.37 % 14), Math.cos(i * 5) * 1.6]; S.add(m); motes.push(m); }
  let r0 = -99;
  return { water, bucket, rope, glowL, top, roof,
    glow(k) { water.material.emissiveIntensity = 3 * k; glowL.intensity = 120 * k; },
    ripple(t0) { r0 = t0; },
    update(t) { bucket.rotation.y = Math.sin(t * 0.6) * 0.3; bucket.position.x = 0.6 + Math.sin(t * 0.8) * 0.05;
      const u = (t - r0) / 1.4; ring.material.opacity = u > 0 && u < 1 ? 0.8 * (1 - u) : 0; ring.scale.setScalar(1 + Math.max(0, u) * 10);
      motes.forEach((m, i) => { const [a, b, c] = m.userData.o; m.position.set(a + Math.sin(t * 0.4 + i) * 0.2, b + Math.sin(t * 0.3 + i) * 0.3, c); }); } };
}

// ============ Tess's attic room ============
export function tessRoom(S, { night = true } = {}) {
  S.background = new THREE.Color(0x0a0a18);
  const W = 8, Z0 = -7, Z1 = 12, H = 9.4; const g = new THREE.Group(); S.add(g);
  const wallM = tmat(plasterTex(0xe8c4a0), 2, 1.2); const floorM = tmat(woodTex(0x9a6a3a), 4, 4, { roughness: 0.6 });
  box(g, [2 * W, 0.4, Z1 - Z0], [0, -0.2, (Z0 + Z1) / 2], floorM, { r: 0, cast: false, solid: false, name: 'floor' });
  // back wall with a round hole (window centre (-0.5, 5.4), r 2.3)
  const sh = new THREE.Shape(); sh.moveTo(-W, 0); sh.lineTo(W, 0); sh.lineTo(W, H); sh.lineTo(-W, H); sh.lineTo(-W, 0);
  const hole = new THREE.Path(); hole.absarc(-0.5, 5.4, 2.3, 0, Math.PI * 2, true); sh.holes.push(hole);
  const bwG = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }); const bwTex = plasterTex(0xe8c4a0).clone(); bwTex.repeat.set(0.12, 0.12); bwTex.needsUpdate = true;
  const bw = put(g, mesh(bwG, std({ map: bwTex, roughness: 0.85 })), [0, 0, Z0 - 0.6]); bw.receiveShadow = true;
  box(g, [2 * W, H, 0.4], [0, H / 2, Z0 - 0.6], basic(0, { visible: false }), { r: 0, cast: false, name: 'back wall' }).userData.solid = false;
  box(g, [0.5, H, Z1 - Z0], [-W - 0.25, H / 2, (Z0 + Z1) / 2], wallM, { r: 0, cast: false, name: 'left wall' });
  box(g, [0.5, H, Z1 - Z0], [W + 0.25, H / 2, (Z0 + Z1) / 2], wallM, { r: 0, cast: false, name: 'right wall' });
  box(g, [2 * W, H, 0.5], [0, H / 2, Z1 + 0.25], wallM, { r: 0, cast: false, solid: false, name: 'front wall' });
  box(g, [2 * W, 0.4, Z1 - Z0], [0, H + 0.2, (Z0 + Z1) / 2], M(0xd8b48a), { r: 0, cast: false, solid: false });
  const vm = std({ map: woodTex(0x6a3a1e) }); for (let z = -6; z <= 11; z += 2.5) put(g, mesh(new THREE.CylinderGeometry(0.25, 0.25, 2 * W, 10), vm), [0, H - 0.25, z], [0, 0, Math.PI / 2]);
  // window frame + open shutters + sill
  const tm = M(0x2a6ab8, { roughness: 0.5 }); put(g, mesh(new THREE.TorusGeometry(2.35, 0.22, 10, 40), tm), [-0.5, 5.4, Z0 + 0.05]);
  for (const sx of [-1, 1]) { const sh2 = put(g, new THREE.Group(), [-0.5 + sx * 2.4, 5.4, Z0 + 0.1], [0, sx * 1.25, 0]); put(sh2, mesh(rb(2.2, 3.8, 0.15, 0.06), tm), [sx * 1.1, 0, 0]); for (let k = 0; k < 6; k++) put(sh2, mesh(rb(1.9, 0.08, 0.1, 0.02), M(0x1a4a8a)), [sx * 1.1, -1.5 + k * 0.6, 0.1]); }
  put(g, mesh(rb(5.2, 0.3, 1.0, 0.08), std({ map: woodTex(0x8a5a2a) })), [-0.5, 3.0, Z0 + 0.4]);
  // outside: night sky with stars and moon (far behind the window)
  const sky = put(S, mesh(new THREE.PlaneGeometry(140, 90), std({ map: ctex(512, 320, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a24'); gr.addColorStop(1, '#2a2a5a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; c.fillRect(Math.random() * w, Math.random() * h * 0.8, 1.5, 1.5); } c.fillStyle = '#fff4d8'; c.beginPath(); c.arc(w * 0.62, h * 0.3, 16, 0, 7); c.fill();
    c.fillStyle = '#1a1030'; for (let x = 0; x < w; x += 40) c.fillRect(x, h * 0.82 - (x % 120 === 0 ? 30 : 12), 34, h); }), emissive: 0xffffff, emissiveIntensity: 0.0, roughness: 1 }), false), [0, 5, -70]);
  sky.material.emissiveMap = sky.material.map; sky.material.emissiveIntensity = 0.9;
  // bed (left, head at the back wall)
  const bed = put(g, new THREE.Group(), [-5.6, 0, -3.5]); const bw2 = std({ map: woodTex(0x7a4a26) });
  put(bed, mesh(rb(4.2, 1.2, 6.6, 0.1), bw2), [0, 0.8, 0]); put(bed, mesh(rb(4.3, 3.6, 0.4, 0.1), bw2), [0, 1.8, -3.3]);
  put(bed, mesh(rb(4.0, 0.6, 6.4, 0.25), M(0xf2ece0, { roughness: 0.95 })), [0, 1.7, 0]);
  const quilt = std({ map: ctex(256, 256, (c, w, h) => { const cols = ['#e8a82a', '#2a9a9a', '#ff7a5a', '#fff2dc', '#5a6ad0']; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = cols[(i * 3 + j * 2) % 5]; c.fillRect(i * 32, j * 32, 32, 32); c.strokeStyle = 'rgba(0,0,0,0.2)'; c.strokeRect(i * 32 + 2, j * 32 + 2, 28, 28); } }), roughness: 1 });
  put(bed, mesh(rb(4.2, 0.3, 4.4, 0.12), quilt), [0, 2.05, 1.0]); put(bed, mesh(rb(2.6, 0.6, 1.2, 0.28), M(0xfffaf0, { roughness: 1 })), [0, 2.2, -2.4]);
  box(g, [4.2, 2.0, 6.6], [-5.6, 1.0, -3.5], basic(0, { visible: false }), { r: 0, cast: false, name: 'bed' }); box(g, [4.3, 3.6, 0.4], [-5.6, 1.8, -6.8], basic(0, { visible: false }), { r: 0, cast: false, name: 'bed head' });
  // nightstand + lamp
  box(g, [1.8, 2.3, 1.6], [-2.6, 1.15, -6.0], std({ map: woodTex(0x5a6a8a) }), { r: 0.08, name: 'nightstand' });
  const lampG = put(g, new THREE.Group(), [-2.6, 2.3, -6.0]); put(lampG, mesh(new THREE.CylinderGeometry(0.15, 0.3, 0.9, 10), M(0xe8a82a)), [0, 0.45, 0]); put(lampG, mesh(new THREE.CylinderGeometry(0.45, 0.7, 0.8, 16, 1, true), M(0xfff0d0, { emissive: 0xffc880, emissiveIntensity: 0.8, side: THREE.DoubleSide })), [0, 1.2, 0]);
  const lamp = new THREE.PointLight(0xffc880, 16, 16, 1.5); lamp.position.set(-2.6, 3.6, -5.4); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.003; S.add(lamp);
  // desk + lamp + laptop (right)
  box(g, [3.2, 0.25, 2.0], [6.0, 2.8, -5.6], std({ map: woodTex(0x9a6a3a) }), { r: 0.05, name: 'desk' });
  for (const [x, z] of [[4.6, -6.4], [7.4, -6.4], [4.6, -4.8], [7.4, -4.8]]) put(g, mesh(rb(0.2, 2.7, 0.2, 0.04), M(0x2a2a2a)), [x, 1.35, z]);
  put(g, mesh(rb(1.4, 0.08, 1.0, 0.03), M(0x3a3a44)), [5.6, 2.97, -5.4]); put(g, mesh(rb(1.4, 0.9, 0.06, 0.03), M(0x2a2a34, { emissive: 0x6a9aff, emissiveIntensity: 0.4 })), [5.6, 3.4, -5.9], [-0.2, 0, 0]);
  const dlamp = put(g, new THREE.Group(), [7.1, 2.95, -6.0]); put(dlamp, mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), M(0x2a9a9a)), [0, 0.7, 0], [0.3, 0, 0]); put(dlamp, mesh(new THREE.ConeGeometry(0.4, 0.5, 14, 1, true), M(0x2a9a9a, { side: THREE.DoubleSide })), [0, 1.4, 0.3], [2.5, 0, 0]);
  // moving boxes (new town)
  const cb = std({ map: ctex(128, 128, (c, w, h) => { c.fillStyle = '#c8945a'; c.fillRect(0, 0, w, h); c.fillStyle = '#d8b07a'; c.fillRect(0, h * 0.45, w, h * 0.1); c.fillStyle = '#3a2a1a'; c.font = '900 18px Inter'; c.fillText('TESS', 10, 30); noiseFill(c, w, h, 0.05, 300); }) });
  for (const [x, y, z, s, r] of [[5.8, 1.0, 2.2, 2.0, 0.1], [6.0, 3.0, 2.4, 1.8, -0.15], [5.6, 0.9, 5.0, 1.8, 0.3], [3.4, 0.7, 3.2, 1.4, 0.2]]) box(g, [s, s, s], [x, y, z], cb, { r: 0.05, rot: [0, r, 0], name: 'moving box' });
  // posters (dogs!), string lights, rug, shelf, plant
  const poster = (x, y, kind) => { const p = put(g, new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), std({ map: ctex(220, 280, (c, w, h) => { c.fillStyle = kind ? '#2a9a9a' : '#e8a82a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff2dc'; c.fillRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#c8803a'; c.fillRect(60, 120, 100, 60); c.beginPath(); c.arc(80, 110, 36, 0, 7); c.fill(); c.fillStyle = '#8a4a1a'; c.fillRect(48, 100, 18, 44); c.fillRect(96, 100, 18, 44); c.fillStyle = '#111'; c.beginPath(); c.arc(70, 106, 5, 0, 7); c.arc(90, 106, 5, 0, 7); c.fill();
    c.fillStyle = '#c8803a'; c.fillRect(66, 180, 14, 40); c.fillRect(140, 180, 14, 40); c.fillStyle = '#2a2a2a'; c.font = '900 26px Inter'; c.textAlign = 'center'; c.fillText(kind ? 'GOOD DOG' : 'DOGS', w / 2, 60); }) })), [x, y, Z0 + 0.03]); return p; };
  poster(4.6, 6.3, 0); poster(-6.4, 6.6, 1); put(g, new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), std({ map: signTex('BEST DOG', '#5a6ad0', '#fff2dc', 260, 200) })), [W - 0.02, 6.0, -1.0], [0, -Math.PI / 2, 0]);
  const bulbs = []; for (let i = 0; i < 22; i++) { const u = i / 21; const b = put(g, new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), basic([0xffd890, 0xffa8c8, 0xa8e8ff][i % 3])), [-7.8 + u * 15.6, 8.4 - Math.sin(u * Math.PI * 3) * 0.5, Z0 + 0.15]); bulbs.push(b); }
  put(g, mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.06, 40), std({ map: ctex(256, 256, (c, w, h) => { for (let r = 128; r > 0; r -= 16) { c.fillStyle = ['#e8a82a', '#2a9a9a', '#fff2dc', '#ff7a5a'][(r / 16) % 4]; c.beginPath(); c.arc(128, 128, r, 0, 7); c.fill(); } }), roughness: 1 }), false), [0.6, 0.03, 0.5]);
  box(g, [3.4, 0.2, 1.0], [-6.2, 4.8, Z0 + 0.5], std({ map: woodTex(0x8a5a2a) }), { r: 0.04, solid: false }); for (let i = 0; i < 6; i++) put(g, mesh(rb(0.3, 0.9 + (i % 2) * 0.2, 0.7, 0.04), M([0xc8302a, 0x2a6ab8, 0xe8a82a, 0x2a9a6a][i % 4])), [-7.6 + i * 0.45, 5.4, Z0 + 0.5]);
  const plant = put(g, new THREE.Group(), [7.0, 0, -1.8]); put(plant, mesh(new THREE.CylinderGeometry(0.6, 0.45, 1.0, 12), M(0xc0643a)), [0, 0.5, 0]); for (let i = 0; i < 7; i++) put(plant, mesh(new THREE.SphereGeometry(0.4, 8, 6), M(0x4a8a3a)), [Math.sin(i * 2) * 0.4, 1.3 + i * 0.25, Math.cos(i * 2) * 0.3]).scale.set(0.5, 1.4, 0.3);
  // lights: moon through the window + warm lamp + string glow
  S.add(new THREE.HemisphereLight(0x8a9ad8, 0x3a2418, 0.55));
  const moon = new THREE.SpotLight(0x9ab0ff, 70, 30, 0.4, 0.6, 1.2); moon.position.set(-0.5, 7.5, -12); moon.target.position.set(-1, 0, 2); S.add(moon, moon.target);
  const fillL = new THREE.PointLight(0xffd0a0, 8, 20, 1.6); fillL.position.set(1, 7.5, 4); S.add(fillL);
  return { g, lamp, moon, fillL, sky, bulbs, lampG,
    update(t) { bulbs.forEach((b, i) => b.material.color.setScalar ? null : null); lamp.intensity = 16 * (0.97 + 0.03 * Math.sin(t * 5)); } };
}
