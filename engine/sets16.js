// Episode 016 kit (Snooze): living alarm clocks + a clockmaker's town — five new environments + props.
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   alarmClock(S, { name, s, col, bell, glasses, seed })  living twin-bell alarm clock (s 1 ≈ 4.6 tall, faces +Z, feet y 0; tiny 0.16, giant 4.8 ≈ 22 tall).
//       .update(t, mode, k)  modes 'idle' 'run' 'stomp' 'crawl' 'ring' 'knock' 'knit' (sitting, arms forward) 'wave' 'cheer' 'squeeze'
//       .time(h, m) sets the hands · .spin(turns) adds extra hand rotation · .face(mouth, brow) mouth 'smile'|'grin'|'o'|'flat'|'frown', brow -1 angry .. +1 worried
//       .look(vec3) pupils follow · .blink(k) · .ringK (0..1, shows ring arcs) · .root .g .body · .hand('R'|'L') world pos of a glove · .H height (world units)
//       Tagged for the collision checker (part 'clock').
//   clockLoft(S, { time: 'morning'|'night' })  Dash's loft bedroom inside the clock tower: floor x ±10, z -8..12, ceiling 11, back wall z -8 = the back of the
//       tower clock (round frosted window centre (2, 5.8), r 3.6, mirrored numerals, iron hands env.hands.set(h, m)). Bed left x -9.8..-5.4, z -7.8..-1.6
//       (mattress top 1.9, frame underside 0.7 — tiny clocks fit underneath); nightstand top 2.2 at (-4.3, -6.9) (alarm clock spot env.stand);
//       desk right top 2.8 x 6..9.6 z -7.6..-5.6 (car posters, DRIVER'S MANUAL); rug centre; free floor x -4..9, z -4..10. env.sunK(k) dims the window sun.
//   clockShop(S, { time: 'morning'|'night' })  Tick & Sons clock shop: walls x ±12, back z -10, ceiling 11, front wall z 15. Back wall of wall clocks + cuckoo
//       (env.cuckoo(k)); 3 grandfather clocks back-left (x -10.5..-4.5, z -9); counter top 3.0 x -2..4.4, z -6.2..-4.6 (register + bell); workbench right
//       top 3.0 x 8.4..11.6, z -8..0 (lamp env.lamp, magnifier, clock guts); Grandma's rocking chair seat top 1.7 at (-7.2, -2.0) facing ry 35 (env.rock(t));
//       footstool top 1.0 at (-4.2, -1.0) for her retired clock; big left window (x -12, z -6..2); spiral stair back right. env.shake(t, k) rattles everything.
//   tickStreet(S, { time: 'morning' })  Tick Street: brick road along x (x ±90, z -9..14), sidewalk z -14..-9, building fronts z -14.
//       TICK & SONS clock tower at x -1..9 (front z -14, h 15 + tower to 25; tower clock centre (4, 18.5, -13.6) r 3.6 = the loft window; door x 2.2..5.8,
//       env.door.open(k)); pastel Dutch-gable townhouses x -40..-6 and 9..60 (BRAM's blue door at x 15); flower market stalls x -36..-14, z -12..-9;
//       teal phone booth env.booth at (-47, -10.6) (inside 3 × 3, door faces +z, .open(k)); lamps, planters, bunting, pigeons. env.tower = the clock (hands env.hands).
//   roofscape(S)  rooftop run: a row of flat roofs along x at z 0 (top y 14, x -120..120 with 3-wide gaps every 24), parapets, chimneys, water tanks,
//       laundry lines, pigeons; gabled roofs all around below; the clock tower + church spire far away. ROOF.y = 14, ROOF.gaps = [...x centres].
//   testLot(S)  DRIVING TEST CENTER lot: asphalt x ±60, z -36..30, painted bays, cone slalom along z 2 (x -12..15, env.cones[i].knock(k, dir)),
//       centre building front z -24 (big wall clock env.wallClock.set(h, m), flagpoles, glass door), test car env.car at (-14, 0, 6) (faces +x; driver seat top 1.7
//       at local (-0.6, -1.0)), chain-link fence, trees, lamp poles, gatehouse.
//   Props: phoneBooth(S, [x,z], opts) · testCar(S, { col }) (.drive(dist) spins wheels, .seat world pos, .wheels) · cone(S, [x,z]) (.knock(k, dirDeg))
//       · clipboard(S) · knitScarf(S, text, { len }) (.set(k) length shown) · tinyGear(S, r, col).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { std, box, T } from './sets.js';
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
const ghost = (S, size, pos, name) => box(S, size, pos, basic(0, { visible: false }), { r: 0, cast: false, name });

// ---------- textures ----------
const dialTex = (mirror = false, col = '#fbf6e8') => once('dial' + mirror + col, () => ctex(512, 512, (c, w, h) => {
  c.fillStyle = col; c.beginPath(); c.arc(256, 256, 256, 0, 7); c.fill();
  const g = c.createRadialGradient(256, 256, 120, 256, 256, 256); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,90,40,0.18)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  if (mirror) { c.translate(w, 0); c.scale(-1, 1); }
  c.fillStyle = '#1a1a22'; for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r1 = i % 5 ? 236 : 222; c.save(); c.translate(256 + Math.sin(a) * 244, 256 - Math.cos(a) * 244); c.rotate(a); c.fillRect(-(i % 5 ? 2 : 5), 0, i % 5 ? 4 : 10, 256 - r1); c.restore(); }
  c.font = '900 64px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; c.fillText(String(i), 256 + Math.sin(a) * 178, 262 - Math.cos(a) * 178); }
}));
const brickTex = (col = '#a8503a') => once('br' + col, () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#c8bca8'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 48 - 48; x < w; x += 96) { const k = 0.8 + Math.random() * 0.35; c.fillStyle = '#' + new THREE.Color(col).multiplyScalar(k).getHexString(); c.fillRect(x + 3, y + 3, 90, 26); }
  noiseFill(c, w, h, 0.08); }));
const herringTex = () => once('herr', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#6a3a2a'; c.fillRect(0, 0, w, h);
  for (let y = -64; y < h + 64; y += 32) for (let x = -64; x < w + 64; x += 64) { for (const [dx, rot] of [[0, 1], [32, -1]]) { const k = 0.75 + Math.random() * 0.35;
    c.save(); c.translate(x + dx, y + (dx ? 16 : 0)); c.rotate(rot * Math.PI / 4); c.fillStyle = '#' + new THREE.Color(0xb05a3a).multiplyScalar(k).getHexString(); c.fillRect(-28, -12, 56, 24); c.restore(); } }
  noiseFill(c, w, h, 0.07); }));
const slabTex = () => once('slab', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#9a948a'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) { const k = 180 + Math.random() * 30; c.fillStyle = `rgb(${k},${k - 4},${k - 12})`; c.fillRect(x + 3, y + 3, 122, 122); } noiseFill(c, w, h, 0.07); }));
const plankTex = (col = '#a06a3a') => once('pl' + col, () => ctex(512, 512, (c, w, h) => { const n = 6; for (let i = 0; i < n; i++) { const k = 0.82 + Math.random() * 0.3; c.fillStyle = '#' + new THREE.Color(col).multiplyScalar(k).getHexString(); c.fillRect(0, i * h / n, w, h / n - 3);
  for (let j = 0; j < 10; j++) { c.strokeStyle = 'rgba(60,30,10,0.18)'; c.beginPath(); const y = i * h / n + Math.random() * h / n; c.moveTo(0, y); c.bezierCurveTo(w / 3, y + 5, w * 2 / 3, y - 5, w, y); c.stroke(); }
  c.fillStyle = 'rgba(40,20,8,0.6)'; c.fillRect((i * 137) % w, i * h / n, 3, h / n); } noiseFill(c, w, h, 0.05); }));
const wallpaperTex = (bg = '#2a5a4a', fg = '#e8c878') => once('wp' + bg + fg, () => ctex(256, 256, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.strokeStyle = fg; c.globalAlpha = 0.35; c.lineWidth = 3; for (let x = 0; x <= w; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 32; y < h; y += 64) for (let x = 32; x < w; x += 64) { c.beginPath(); c.arc(x, y, 10, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 7); c.moveTo(x, y); c.lineTo(x + 5, y); c.stroke(); }
  c.globalAlpha = 1; noiseFill(c, w, h, 0.05, 600); }));
const plasterTex = (col = '#f2e8d8') => once('pt' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.06, 1500); }));
const asphaltTex = () => once('asph', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#3a3c40'; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.12, 9000);
  for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(20,20,22,0.5)'; c.lineWidth = 2; c.beginPath(); let x = Math.random() * w, y = Math.random() * h; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 60; y += Math.random() * 40; c.lineTo(x, y); } c.stroke(); } }));
const roofTileTex = (col = '#c0503a') => once('rt' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#3a1a12'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 12; x < w + 24; x += 24) { const k = 0.75 + Math.random() * 0.4; c.fillStyle = '#' + new THREE.Color(col).multiplyScalar(k).getHexString(); c.beginPath(); c.roundRect(x, y, 22, 15, 6); c.fill(); }
  noiseFill(c, w, h, 0.05, 600); }));
const tarTex = () => once('tar', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#7a7470'; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.12, 4000);
  c.strokeStyle = 'rgba(40,36,32,0.35)'; c.lineWidth = 3; for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } }));
const knitTex = (col = '#e8503a', text = '', bg2 = '#f2c030') => ctex(1024, 192, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 12) for (let x = 0; x < w; x += 12) { c.strokeStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 10); c.lineTo(x + 12, y); c.stroke(); }
  c.fillStyle = bg2; for (const y of [10, h - 24]) for (let x = 0; x < w; x += 28) c.fillRect(x, y, 14, 14);
  if (text) { c.fillStyle = '#fff6e0'; c.font = '900 100px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 6); } });
const signTex = (text, bg = '#1a3a5a', fg = '#f6eed8', w = 512, h = 128, font = 60, border = true) => ctex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); if (border) { c.strokeStyle = fg; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); }
  c.fillStyle = fg; c.font = `900 ${font}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 3); });
const planeSign = (S, tex, [w, h], pos, ry = 0, emissive = 0) => put(S, new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ map: tex, roughness: 0.6, emissive: emissive ? 0xffffff : 0, emissiveMap: emissive ? tex : null, emissiveIntensity: emissive })), pos, [0, ry, 0]);
const skyTex = (top, mid, bot) => once('sky' + top + mid + bot, () => ctex(16, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, w, h); }));

// ---------- the living alarm clock ----------
export function alarmClock(S, { name = 'clock', s = 1, col = 0xd8302a, bell = 0xf2c030, foot = 0xf6f6f2, glasses = false, seed = 1 } = {}) {
  const root = new THREE.Group(); S.add(root); const g = new THREE.Group(); g.scale.setScalar(s); root.add(g);
  const R = 1.2, HIP = 1.65, cy = HIP + 0.85;
  const red = M(col, { roughness: 0.28, metalness: 0.2 }), gold = M(bell, { roughness: 0.22, metalness: 0.85 }), chrome = M(0xdfe3ea, { roughness: 0.18, metalness: 0.9 });
  const dark = M(0x16161c, { roughness: 0.4 }), white = M(0xffffff, { roughness: 0.25 }), shoe = M(foot, { roughness: 0.5 });
  const body = new THREE.Group(); body.position.y = cy; g.add(body);
  const shell = new THREE.Group(); body.add(shell);   // everything that shakes when it rings
  put(shell, mesh(new THREE.CylinderGeometry(R, R, 0.9, 40), red), [0, 0, 0], [Math.PI / 2, 0, 0]);
  put(shell, mesh(new THREE.TorusGeometry(R - 0.02, 0.1, 10, 40), chrome), [0, 0, 0.46]);
  put(shell, mesh(new THREE.TorusGeometry(R - 0.02, 0.07, 8, 40), chrome), [0, 0, -0.46]);
  put(shell, new THREE.Mesh(new THREE.CircleGeometry(R - 0.08, 48), std({ map: dialTex(), roughness: 0.45 })), [0, 0, 0.452]);
  // back: winding keys
  for (const x of [-0.4, 0.4]) { put(shell, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), chrome), [x, 0, -0.6], [Math.PI / 2, 0, 0]); put(shell, mesh(rb(0.5, 0.3, 0.06, 0.03), chrome), [x, 0, -0.76]); }
  // hands (pivot at centre)
  const handG = (len, w, m) => { const p = new THREE.Group(); const geo = new THREE.BoxGeometry(w, len, 0.04); geo.translate(0, len / 2 - 0.1, 0); p.add(mesh(geo, m, false)); return p; };
  const hourH = put(shell, handG(0.55, 0.1, dark), [0, 0, 0.48]), minH = put(shell, handG(0.82, 0.07, dark), [0, 0, 0.5]);
  put(shell, mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), gold), [0, 0, 0.52], [Math.PI / 2, 0, 0]);
  // eyes + brows
  const eyes = [], pupils = [], brows = [];
  for (const sx of [-1, 1]) { const e = put(shell, new THREE.Group(), [sx * 0.42, 0.34, 0.5]); const ball = mesh(new THREE.SphereGeometry(0.27, 20, 14), white, false); ball.scale.z = 0.55; e.add(ball);
    const p = put(e, mesh(new THREE.SphereGeometry(0.12, 14, 10), dark, false), [0, 0, 0.13]); p.scale.z = 0.5; put(p, mesh(new THREE.SphereGeometry(0.035, 8, 6), white, false), [0.04, 0.04, 0.1]);
    eyes.push(e); pupils.push(p);
    const b = put(shell, mesh(rb(0.36, 0.08, 0.06, 0.03), dark, false), [sx * 0.42, 0.68, 0.53]); brows.push(b); }
  if (glasses) { const gm = M(0x3a2a1a, { metalness: 0.4 }); for (const sx of [-1, 1]) put(shell, mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 20), gm, false), [sx * 0.42, 0.34, 0.66]);
    put(shell, mesh(new THREE.BoxGeometry(0.2, 0.03, 0.03), gm, false), [0, 0.38, 0.66]); }
  // mouths
  const mouth = put(shell, new THREE.Group(), [0, -0.46, 0.5]);
  const mm = { smile: put(mouth, mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 18, Math.PI), dark, false), [0, 0.1, 0], [0, 0, Math.PI]),
    frown: put(mouth, mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 18, Math.PI), dark, false), [0, -0.12, 0]),
    flat: put(mouth, mesh(rb(0.36, 0.07, 0.05, 0.03), dark, false), [0, 0, 0]),
    o: put(mouth, mesh(new THREE.CircleGeometry(0.15, 18), M(0x5a1010), false), [0, 0, 0.01]) };
  const grin = put(mouth, new THREE.Group(), [0, 0.06, 0]); put(grin, mesh(new THREE.CircleGeometry(0.3, 20, Math.PI, Math.PI), M(0x5a1010), false), [0, 0, 0.01]);
  put(grin, mesh(new THREE.BoxGeometry(0.5, 0.08, 0.02), white, false), [0, -0.05, 0.02]); mm.grin = grin;
  // bells, hammer, handle
  const bells = [];
  for (const sx of [-1, 1]) { const piv = put(shell, new THREE.Group(), [sx * 0.72, 0.95, 0], [0, 0, -sx * 0.62]); put(piv, mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), chrome), [0, 0.12, 0]);
    put(piv, mesh(new THREE.SphereGeometry(0.52, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), gold), [0, 0.25, 0]); put(piv, mesh(new THREE.SphereGeometry(0.07, 8, 6), gold), [0, 0.8, 0]); bells.push(piv); }
  const hammer = put(shell, new THREE.Group(), [0, 1.05, 0]); put(hammer, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 6), chrome), [0, 0.3, 0]); put(hammer, mesh(new THREE.SphereGeometry(0.11, 10, 8), chrome), [0, 0.62, 0]);
  put(shell, mesh(new THREE.TorusGeometry(0.36, 0.06, 8, 20, Math.PI), chrome), [0, 1.18, -0.05]);
  // ring arcs (not tagged)
  const arcM = basic(0xffe060, { transparent: true, opacity: 0, depthWrite: false }); const arcs = [];
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) arcs.push(put(body, new THREE.Mesh(new THREE.TorusGeometry(0.9 + i * 0.35, 0.04, 4, 18, Math.PI * 0.45), arcM), [sx * 0.9, 1.25, 0.2], [0, 0, sx > 0 ? -0.2 : Math.PI * 0.75]));
  // arms (pivot at shoulder) + gloves
  const arms = {};
  for (const [k, sx] of [['R', -1], ['L', 1]]) { const a = put(body, new THREE.Group(), [sx * (R - 0.05), -0.1, 0]); put(a, mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), dark), [0, -0.55, 0]);
    const glove = put(a, mesh(new THREE.SphereGeometry(0.22, 14, 10), white), [0, -1.15, 0]); glove.scale.set(1, 0.9, 1.1); a.userData.glove = glove; arms[k] = a; }
  // legs (pivot at hip) + sneakers
  const legs = {};
  for (const [k, sx] of [['R', -1], ['L', 1]]) { const l = put(g, new THREE.Group(), [sx * 0.45, HIP, 0]); put(l, mesh(new THREE.CylinderGeometry(0.08, 0.08, HIP, 8), dark), [0, -HIP / 2, 0]);
    put(l, mesh(rb(0.48, 0.3, 0.78, 0.13), shoe), [0, -HIP + 0.15, 0.14]); put(l, mesh(rb(0.5, 0.08, 0.8, 0.03), M(0xd8302a)), [0, -HIP + 0.03, 0.14]); legs[k] = l; }
  root.traverse(m => { if (m.isMesh && m.material !== arcM) { m.userData.avatar = name; m.userData.part = 'clock'; } });
  let hh = 10, mi = 10, extra = 0, lookV = null, blinkK = 1;
  const api = { root, g, body, shell, legs, arms, hourH, minH, ringK: 0, H: (cy + R + 1.0) * s, s,
    time(h, m) { hh = h; mi = m; },
    spin(turns) { extra = turns; },
    face(m = 'smile', brow = 0) { for (const k in mm) mm[k].visible = k === m; brows.forEach((b, i) => { const sx = i ? 1 : -1; b.rotation.z = sx * brow * 0.45; b.position.y = 0.68 + Math.abs(brow) * 0.03 * (brow > 0 ? 1 : -1); }); },
    look(v) { lookV = v; },
    blink(k) { blinkK = k; },
    hand(side = 'R') { root.updateMatrixWorld(true); return arms[side].userData.glove.getWorldPosition(new THREE.Vector3()); },
    update(t, mode = 'idle', k = 1) {
      const R2 = rng(seed); const ph = R2() * 6;
      body.position.y = cy; body.rotation.set(0, 0, 0); shell.rotation.set(0, 0, 0); shell.position.set(0, 0, 0);
      for (const a of ['R', 'L']) { arms[a].rotation.set(0, 0, 0); legs[a].rotation.set(0, 0, 0); }
      arms.R.rotation.z = -0.35; arms.L.rotation.z = 0.35; g.position.y = 0;
      let ring = api.ringK;
      if (mode === 'idle' || mode === 'squeeze') { body.position.y += Math.sin(t * 2.2 + ph) * 0.05; body.rotation.z = Math.sin(t * 1.3 + ph) * 0.04; arms.R.rotation.z += Math.sin(t * 2.2 + ph) * 0.08; arms.L.rotation.z -= Math.sin(t * 2.2 + ph) * 0.08; }
      if (mode === 'run' || mode === 'crawl' || mode === 'stomp') { const f = mode === 'stomp' ? 5.2 : mode === 'crawl' ? 16 : 11, a = mode === 'stomp' ? 0.6 : 0.85; const w = Math.sin(t * f + ph);
        legs.R.rotation.x = w * a * k; legs.L.rotation.x = -w * a * k; body.position.y += Math.abs(Math.cos(t * f + ph)) * (mode === 'stomp' ? 0.22 : 0.18) * k; body.rotation.x = (mode === 'crawl' ? 0.25 : 0.12) * k;
        arms.R.rotation.x = -w * 0.9 * k; arms.L.rotation.x = w * 0.9 * k; body.rotation.z = w * 0.05 * k; }
      if (mode === 'ring') { ring = Math.max(ring, k); const j = Math.sin(t * 75); shell.rotation.z = j * 0.07 * k; shell.position.x = Math.sin(t * 61) * 0.04 * k; g.position.y = Math.abs(Math.sin(t * 22)) * 0.12 * k;
        arms.R.rotation.z = -0.35 - 0.9 * k + Math.sin(t * 40) * 0.15; arms.L.rotation.z = 0.35 + 0.9 * k - Math.sin(t * 40) * 0.15; }
      if (mode === 'knock') { arms.R.rotation.x = -1.35 - Math.abs(Math.sin(t * 9)) * 0.45 * k; arms.R.rotation.z = -0.15; body.position.y += Math.sin(t * 2) * 0.04; arms.L.rotation.z = 0.25; }
      if (mode === 'knit') { legs.R.rotation.x = -1.45; legs.L.rotation.x = -1.45; arms.R.rotation.x = -1.0 + Math.sin(t * 7) * 0.12; arms.L.rotation.x = -1.0 - Math.sin(t * 7) * 0.12; arms.R.rotation.z = 0.25; arms.L.rotation.z = -0.25; body.rotation.z = Math.sin(t * 1.4) * 0.03; }
      if (mode === 'wave') { arms.R.rotation.z = -2.4 + Math.sin(t * 9) * 0.35; body.rotation.z = Math.sin(t * 3) * 0.05; body.position.y += Math.abs(Math.sin(t * 4.5)) * 0.08; }
      if (mode === 'cheer') { arms.R.rotation.z = -2.6 + Math.sin(t * 8) * 0.2; arms.L.rotation.z = 2.6 - Math.sin(t * 8 + 1) * 0.2; g.position.y = Math.abs(Math.sin(t * 6)) * 0.5 * k; }
      if (mode === 'squeeze') { g.scale.set(s * (1 - 0.55 * k), s * (1 + 0.35 * k), s * (1 - 0.3 * k)); } else g.scale.setScalar(s);
      bells.forEach((b, i) => { const sx = i ? 1 : -1; b.rotation.z = -sx * 0.62 + (ring > 0 ? Math.sin(t * 80 + i) * 0.08 * ring : 0); });
      hammer.rotation.z = ring > 0 ? Math.sin(t * 60) * 0.55 * ring : 0;
      arcM.opacity = ring > 0 ? 0.75 * ring : 0; arcs.forEach((a, i) => { const u = ((t * 3 + i * 0.33) % 1); a.scale.setScalar(0.7 + u * 0.6); a.visible = ring > 0.02; });
      const m2 = mi + extra * 60, h2 = hh + mi / 60 + extra * 5;
      minH.rotation.z = -m2 / 60 * Math.PI * 2; hourH.rotation.z = -(h2 % 12) / 12 * Math.PI * 2;
      // eyes
      const bl = Math.min(blinkK, ((t + ph) % 3.4) < 0.12 ? 0.1 : 1); eyes.forEach(e => e.scale.y = Math.max(0.08, bl));
      if (lookV) { root.updateMatrixWorld(true); pupils.forEach((p, i) => { const lp = eyes[i].worldToLocal(lookV.clone()); const d = Math.hypot(lp.x, lp.y, lp.z) || 1; p.position.x = THREE.MathUtils.clamp(lp.x / d * 0.4, -0.12, 0.12); p.position.y = THREE.MathUtils.clamp(lp.y / d * 0.4, -0.12, 0.12); }); }
      else pupils.forEach(p => { p.position.x = 0; p.position.y = 0; });
    } };
  api.face('smile', 0); api.update(0);
  return api;
}

// ---------- props ----------
export function tinyGear(S, r = 0.5, col = 0xc89a3a) { const g = new THREE.Group(); S.add(g); const m = M(col, { metalness: 0.8, roughness: 0.3 });
  put(g, mesh(new THREE.CylinderGeometry(r, r, r * 0.25, 20), m), [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; put(g, mesh(new THREE.BoxGeometry(r * 0.3, r * 0.3, r * 0.25), m), [Math.cos(a) * r, Math.sin(a) * r, 0], [0, 0, a]); }
  put(g, mesh(new THREE.CylinderGeometry(r * 0.25, r * 0.25, r * 0.3, 10), M(0x2a2a2a)), [0, 0, 0], [Math.PI / 2, 0, 0]); return g; }
export function cone(S, [x, z], { name = 'cone', s = 1 } = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const inner = new THREE.Group(); g.add(inner); inner.scale.setScalar(s);
  const o = M(0xff6a1a, { roughness: 0.45 }), w = M(0xf6f6f2, { roughness: 0.45 });
  put(inner, mesh(rb(1.3, 0.16, 1.3, 0.05), o), [0, 0.08, 0]); put(inner, mesh(new THREE.ConeGeometry(0.5, 1.8, 16), o), [0, 1.0, 0]);
  put(inner, mesh(new THREE.CylinderGeometry(0.33, 0.39, 0.3, 16), w), [0, 0.82, 0]);
  g.knock = (k, dir = 0) => { g.rotation.y = dir * D; inner.rotation.x = 1.35 * clamp01(k); inner.position.z = 0.9 * clamp01(k); inner.position.y = 0.1 * Math.sin(Math.PI * clamp01(k)); };
  return g; }
export function clipboard(S) { const g = new THREE.Group(); S.add(g); put(g, mesh(rb(0.9, 1.2, 0.06, 0.04), M(0x8a5a2a)), [0, 0, 0]);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.0), std({ map: ctex(128, 160, (c, w, h) => { c.fillStyle = '#fafaf4'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a2a'; c.font = '700 14px Inter'; c.fillText('ROAD TEST', 10, 20);
    for (let i = 0; i < 8; i++) { c.fillStyle = '#8a8a9a'; c.fillRect(10, 34 + i * 15, 80, 3); c.strokeStyle = '#1a1a2a'; c.strokeRect(98, 28 + i * 15, 10, 10); } }) })), [0, -0.05, 0.035]);
  put(g, mesh(rb(0.4, 0.14, 0.1, 0.03), M(0xc0c4cc, { metalness: 0.8 })), [0, 0.56, 0.05]); return g; }
export function knitScarf(S, text = 'GET UP, DASH', { len = 6.4, col = '#e8503a' } = {}) { const g = new THREE.Group(); S.add(g);
  const geo = new THREE.PlaneGeometry(len, 1.15, 24, 2); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, -Math.pow(x / (len / 2), 2) * 0.5); } geo.computeVertexNormals();
  const m = put(g, mesh(geo, std({ map: knitTex(col, text), roughness: 0.95, side: THREE.DoubleSide })), [0, 0, 0]);
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) put(g, mesh(new THREE.BoxGeometry(0.05, 0.35, 0.05), M(0xf2c030)), [sx * (len / 2 + 0.05), -0.45 + i * 0.18, -0.5], [0, 0, sx * 1.4]);
  g.set = (k) => { m.scale.x = Math.max(0.02, k); }; return g; }
export function phoneBooth(S, [x, z], { col = 0x1a8a8a, name = 'booth' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const tm = M(col, { roughness: 0.4 }), glass = std({ color: 0xcfe8f0, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, depthWrite: false });
  put(g, mesh(rb(3.8, 0.3, 3.8, 0.05), M(0x5a5a5a)), [0, 0.15, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(g, mesh(rb(0.35, 7.0, 0.35, 0.06), tm), [sx * 1.7, 3.8, sz * 1.7]);
  put(g, mesh(rb(3.9, 0.7, 3.9, 0.1), tm), [0, 7.6, 0]); put(g, mesh(rb(3.2, 0.5, 3.2, 0.2), tm), [0, 8.1, 0]);
  const st = signTex('PHONE', '#f6f2e0', '#1a3a3a', 256, 64, 46, false); for (const r of [0, Math.PI / 2, -Math.PI / 2]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.5), std({ map: st, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 0.5 })); p.position.set(Math.sin(r) * 1.97, 7.6, Math.cos(r) * 1.97); p.rotation.y = r; g.add(p); }
  // back + side walls: lower solid panels + glass
  for (const [px, pz, ry] of [[0, -1.7, 0], [-1.7, 0, Math.PI / 2], [1.7, 0, Math.PI / 2]]) { put(g, mesh(new THREE.BoxGeometry(3.1, 1.6, 0.12), tm), [px, 1.1, pz], [0, ry, 0]);
    put(g, new THREE.Mesh(new THREE.PlaneGeometry(3.1, 5.2), glass), [px, 4.5, pz], [0, ry, 0]);
    for (const by of [2.1, 6.7]) put(g, mesh(new THREE.BoxGeometry(3.1, 0.08, 0.1), tm, false), [px, by, pz], [0, ry, 0]); }
  ghost(S, [3.4, 7, 0.3], [x, 3.5, z - 1.75], name + ' back'); ghost(S, [0.3, 7, 3.4], [x - 1.75, 3.5, z], name + ' left'); ghost(S, [0.3, 7, 3.4], [x + 1.75, 3.5, z], name + ' right');
  // phone on the back wall
  put(g, mesh(rb(0.8, 1.2, 0.4, 0.08), M(0x2a2a2e)), [0.6, 4.4, -1.45]); put(g, mesh(rb(0.25, 0.9, 0.22, 0.08), M(0x1a1a1e)), [0.2, 4.4, -1.35]);
  const lamp = new THREE.PointLight(0xfff0d0, 3, 6, 1.6); lamp.position.set(0, 6.6, 0); g.add(lamp);
  // door (hinged on the left front post), glass + frame
  const door = put(g, new THREE.Group(), [-1.6, 0, 1.75]); put(door, mesh(new THREE.BoxGeometry(3.1, 1.6, 0.12), tm), [1.6, 1.1, 0]); put(door, new THREE.Mesh(new THREE.PlaneGeometry(3.1, 5.2), glass), [1.6, 4.5, 0]);
  for (const by of [2.1, 6.7]) put(door, mesh(new THREE.BoxGeometry(3.1, 0.08, 0.1), tm, false), [1.6, by, 0]); put(door, mesh(rb(0.12, 0.8, 0.2, 0.04), M(0xd8c060, { metalness: 0.8 })), [2.8, 3.6, 0.12]);
  g.open = (k) => { door.rotation.y = -1.6 * clamp01(k); }; g.door = door; g.lamp = lamp; return g;
}
export function testCar(S, { col = 0x2a7ad8, name = 'car' } = {}) {
  const g = new THREE.Group(); S.add(g); const bm = M(col, { roughness: 0.25, metalness: 0.35 }), tire = M(0x1a1a1e, { roughness: 0.8 }), chrome = M(0xdfe3ea, { metalness: 0.9, roughness: 0.2 });
  const glass = std({ color: 0xbfe0f0, roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false });
  // lower body (open-top tub so a seated driver shows), cabin pillars, glass, roof
  put(g, mesh(rb(8.2, 0.6, 4.6, 0.25), bm), [0, 1.1, 0]);
  for (const sz of [-1, 1]) put(g, mesh(rb(8.2, 1.9, 0.3, 0.12), bm), [0, 2.0, sz * 2.15]);
  put(g, mesh(rb(2.2, 1.9, 4.6, 0.4), bm), [3.0, 2.0, 0]); put(g, mesh(rb(1.6, 1.9, 4.6, 0.4), bm), [-3.3, 2.0, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(g, mesh(new THREE.BoxGeometry(0.22, 2.7, 0.22), bm), [sx > 0 ? 1.8 : -2.6, 4.25, sz * 2.1], [0, 0, sx > 0 ? -0.35 : 0]);
  put(g, mesh(rb(5.0, 0.3, 4.5, 0.12), bm), [-0.5, 5.65, 0]);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), glass), [2.2, 4.25, 0], [0, Math.PI / 2, -0.35]);
  for (const sz of [-1, 1]) put(g, new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6), glass), [-0.4, 4.25, sz * 2.12]);
  // seats
  for (const sz of [-1, 1]) { put(g, mesh(rb(1.6, 0.5, 1.6, 0.15), M(0x2a2a3a)), [-0.6, 1.45, sz * 1.0]); put(g, mesh(rb(0.4, 2.0, 1.6, 0.15), M(0x2a2a3a)), [-1.6, 2.6, sz * 1.0]); }
  put(g, mesh(new THREE.TorusGeometry(0.45, 0.07, 8, 20), M(0x1a1a1e)), [1.0, 3.1, -1.0], [0, Math.PI / 2, 0.5]);
  // wheels
  const wheels = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = put(g, new THREE.Group(), [sx * 2.7, 0.95, sz * 2.25]); put(w, mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.6, 20), tire), [0, 0, 0], [Math.PI / 2, 0, 0]);
    put(w, mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.64, 12), chrome), [0, 0, 0], [Math.PI / 2, 0, 0]); for (let i = 0; i < 4; i++) put(w, mesh(new THREE.BoxGeometry(0.12, 0.9, 0.66), M(0x8a8e96)), [0, 0, 0], [0, 0, i * Math.PI / 4]); wheels.push(w); }
  // lights, plate, STUDENT DRIVER roof sign
  for (const sz of [-1, 1]) { put(g, mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 14), std({ color: 0xfff6d0, emissive: 0xfff0b0, emissiveIntensity: 0.6 })), [4.12, 2.2, sz * 1.5], [0, 0, Math.PI / 2]);
    put(g, mesh(rb(0.1, 0.5, 0.8, 0.04), std({ color: 0xd82a2a, emissive: 0x8a0a0a })), [-4.12, 2.3, sz * 1.6]); }
  const ts = signTex('STUDENT DRIVER', '#f2c420', '#1a1a1e', 512, 96, 52, false);
  for (const sz of [-1, 1]) put(g, new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.64), std({ map: ts })), [-0.5, 6.25, sz * 0.12], [0, sz > 0 ? 0 : Math.PI, 0]);
  put(g, mesh(new THREE.BoxGeometry(3.5, 0.7, 0.2), M(0x1a1a1e)), [-0.5, 6.25, 0]);
  ghost(S, [8.2, 1.4, 4.6], [0, 1.2, 0], name + ' floor');
  const floorBox = S.children[S.children.length - 1]; g.attach(floorBox);
  g.wheels = wheels; g.drive = (dist) => wheels.forEach(w => w.rotation.z = -dist / 0.95);
  g.seat = (side = -1) => { g.updateMatrixWorld(true); return new THREE.Vector3(-0.6, 1.7, side * 1.0).applyMatrix4(g.matrixWorld); };
  return g;
}

// ---------- big round clock window/face (frosted glass + iron hands) ----------
function towerFace(parent, { r = 3.6, mirror = false, glow = 0.35, ironHands = true } = {}) {
  const g = new THREE.Group(); parent.add(g); const iron = M(0x1e2024, { metalness: 0.6, roughness: 0.45 });
  const tex = dialTex(mirror, '#f6ecd0');
  put(g, new THREE.Mesh(new THREE.CircleGeometry(r, 64), std({ map: tex, roughness: 0.4, transparent: true, opacity: 0.93, emissive: 0xffe8b0, emissiveMap: tex, emissiveIntensity: glow })), [0, 0, 0]);
  put(g, mesh(new THREE.TorusGeometry(r, 0.28, 10, 48), iron), [0, 0, 0.05]);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; put(g, mesh(new THREE.BoxGeometry(0.08, r * 0.7, 0.06), iron, false), [Math.sin(a) * r * 0.55, Math.cos(a) * r * 0.55, 0.04], [0, 0, -a]); }
  put(g, mesh(new THREE.TorusGeometry(r * 0.2, 0.06, 6, 24), iron, false), [0, 0, 0.05]);
  const hg = (len, w) => { const p = new THREE.Group(); const geo = new THREE.BoxGeometry(w, len, 0.12); geo.translate(0, len / 2 - 0.4, 0); p.add(mesh(geo, iron)); put(p, mesh(new THREE.ConeGeometry(w * 1.3, 0.6, 4), iron), [0, len - 0.3, 0]); return p; };
  const hH = put(g, hg(r * 0.55, 0.26), [0, 0, 0.18]), mH = put(g, hg(r * 0.82, 0.18), [0, 0, 0.26]);
  put(g, mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 12), iron), [0, 0, 0.3], [Math.PI / 2, 0, 0]);
  if (!ironHands) { hH.visible = mH.visible = false; }
  g.set = (h, m) => { const sgn = mirror ? 1 : -1; mH.rotation.z = sgn * m / 60 * Math.PI * 2; hH.rotation.z = sgn * ((h % 12) + m / 60) / 12 * Math.PI * 2; };
  g.set(8, 40); return g;
}
function wallWithHole(w, h, cx, cy, r, mat, depth = 0.5) {
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h); sh.lineTo(-w / 2, h); sh.closePath();
  const hole = new THREE.Path(); hole.absarc(cx, cy, r, 0, Math.PI * 2, true); sh.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 48 }); return mesh(geo, mat, false);
}
function stringLights(S, a, b, n = 14, sag = 0.8, col = 0xffd890) { const g = new THREE.Group(); S.add(g); const wire = M(0x2a2a2a);
  const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - Math.sin(Math.PI * u) * sag, a[2] + (b[2] - a[2]) * u)); }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.025, 4), wire, false));
  const bm = std({ color: 0xfff2d0, emissive: col, emissiveIntensity: 1.4 }); const bulbs = [];
  for (let i = 1; i < n; i++) { const u = i / n; bulbs.push(put(g, mesh(new THREE.SphereGeometry(0.09, 8, 6), bm, false), [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - Math.sin(Math.PI * u) * sag - 0.1, a[2] + (b[2] - a[2]) * u])); }
  g.bm = bm; return g; }
function wallClock(S, [x, y, z], { r = 0.8, ry = 0, kind = 0, col = 0x7a4a22 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; S.add(g); const wood = M(col, { roughness: 0.5 });
  if (kind === 0) put(g, mesh(new THREE.CylinderGeometry(r + 0.12, r + 0.12, 0.22, 28), wood), [0, 0, 0], [Math.PI / 2, 0, 0]);
  else if (kind === 1) put(g, mesh(rb(2 * r + 0.3, 2 * r + 0.3, 0.22, 0.08), wood), [0, 0, 0]);
  else { put(g, mesh(rb(2 * r + 0.3, 2 * r + 1.6, 0.4, 0.08), wood), [0, -0.6, -0.1]); const roof = new THREE.Shape(); roof.moveTo(-r - 0.5, 0); roof.lineTo(r + 0.5, 0); roof.lineTo(0, 1.0); roof.closePath();
    put(g, mesh(new THREE.ExtrudeGeometry(roof, { depth: 0.5, bevelEnabled: false }), M(0x4a2a12)), [0, r + 0.2, -0.3]); }
  put(g, new THREE.Mesh(new THREE.CircleGeometry(r, 32), std({ map: dialTex(false, kind === 1 ? '#f2e6c8' : '#fbf6e8'), roughness: 0.4 })), [0, 0, 0.12]);
  const dk = M(0x1a1a1e); const sec = new THREE.Group(); put(g, sec, [0, 0, 0.16]); const sg = new THREE.BoxGeometry(0.03, r * 0.85, 0.02); sg.translate(0, r * 0.35, 0); sec.add(mesh(sg, M(0xc82a2a), false));
  const mn = new THREE.Group(); put(g, mn, [0, 0, 0.14]); const mg = new THREE.BoxGeometry(0.07, r * 0.75, 0.02); mg.translate(0, r * 0.32, 0); mn.add(mesh(mg, dk, false));
  const hr = new THREE.Group(); put(g, hr, [0, 0, 0.13]); const hg2 = new THREE.BoxGeometry(0.09, r * 0.5, 0.02); hg2.translate(0, r * 0.2, 0); hr.add(mesh(hg2, dk, false));
  mn.rotation.z = -(x * 7 % 60) / 60 * Math.PI * 2; hr.rotation.z = -(y * 3 % 12) / 12 * Math.PI * 2;
  let pend = null; if (kind === 2) { pend = put(g, new THREE.Group(), [0, -r - 0.2, 0.05]); put(pend, mesh(new THREE.BoxGeometry(0.05, 1.2, 0.03), M(0xd8b04a, { metalness: 0.8 }), false), [0, -0.6, 0]); put(pend, mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 14), M(0xd8b04a, { metalness: 0.8 }), false), [0, -1.2, 0], [Math.PI / 2, 0, 0]); }
  g.tick = (t) => { sec.rotation.z = -Math.floor(t + x) / 60 * Math.PI * 2; if (pend) pend.rotation.z = Math.sin(t * 3.2 + x) * 0.3; };
  return g;
}
function grandfather(S, [x, z], { col = 0x5a2a12, h = 8, name = 'gfclock' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const w = M(col, { roughness: 0.35 }), brass = M(0xd8b04a, { metalness: 0.85, roughness: 0.25 });
  put(g, mesh(rb(2.2, 1.0, 1.3, 0.08), w), [0, 0.5, 0]); put(g, mesh(rb(1.7, h - 3.2, 1.0, 0.06), w), [0, 1.0 + (h - 3.2) / 2, 0]);
  put(g, mesh(rb(2.3, 2.4, 1.3, 0.08), w), [0, h - 1.0, 0]); put(g, mesh(rb(2.5, 0.4, 1.4, 0.08), M(0x3a1a08)), [0, h + 0.4, 0]);
  put(g, new THREE.Mesh(new THREE.CircleGeometry(0.85, 32), std({ map: dialTex(false, '#f2e6c8'), roughness: 0.4 })), [0, h - 1.0, 0.66]); put(g, mesh(new THREE.TorusGeometry(0.85, 0.06, 6, 28), brass, false), [0, h - 1.0, 0.67]);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(1.2, h - 4.0), std({ color: 0x1a1008, roughness: 0.1, metalness: 0.3 })), [0, 1.2 + (h - 4.0) / 2 + 0.2, 0.51]);
  const pend = put(g, new THREE.Group(), [0, h - 2.2, 0.52]); put(pend, mesh(new THREE.BoxGeometry(0.06, h - 5.2, 0.03), brass, false), [0, -(h - 5.2) / 2, 0]); put(pend, mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 20), brass, false), [0, -(h - 5.2), 0], [Math.PI / 2, 0, 0]);
  ghost(S, [2.3, h, 1.3], [x, h / 2, z], name); g.tick = (t) => { pend.rotation.z = Math.sin(t * 2.6 + x) * 0.22; }; return g;
}
function plant(S, [x, y, z], s = 1, col = 0x3a8a3a) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  put(g, mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.9, 14), M(0xc8643a)), [0, 0.45, 0]); const R = rng(Math.round(x * 13 + z * 7));
  for (let i = 0; i < 9; i++) { const l = put(g, mesh(new THREE.SphereGeometry(0.4, 8, 6), std({ color: col, roughness: 0.8, flatShading: true })), [(R() - 0.5) * 0.8, 1.2 + R() * 1.1, (R() - 0.5) * 0.8]); l.scale.set(0.8, 1.4, 0.5); l.rotation.set(R(), R(), R()); }
  return g; }
function book(S, [x, y, z], col, [w, h, d] = [0.3, 1.0, 0.8], rot) { return put(S, mesh(rb(w, h, d, 0.03), M(col)), [x, y, z], rot); }

// =========================== SETS ===========================
export function clockLoft(S, { time = 'morning' } = {}) {
  const night = time === 'night';
  S.background = new THREE.Color(night ? 0x0a0c18 : 0x1a1410);
  const floorM = tmat(plankTex('#9a6438'), 4, 4), brick = brickTex('#9a4a36');
  box(S, [20, 0.3, 20], [0, -0.15, 2], floorM, { r: 0, cast: false, name: 'floor' });
  // back wall with the round clock window
  const bw = std({ map: (() => { const t = brick.clone(); t.repeat.set(1 / 6, 1 / 6); t.needsUpdate = true; return t; })(), roughness: 0.9 });
  const back = wallWithHole(20, 11, 2, 5.8, 3.6, bw, 0.6); back.position.set(0, 0, -8.6); S.add(back);
  const win = towerFace(S, { r: 3.6, mirror: true, glow: night ? 0.15 : 0.55 }); win.position.set(2, 5.8, -8.35);
  // outside the window: sky + rooftops
  const out = ctex(512, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); if (night) { g.addColorStop(0, '#0a1030'); g.addColorStop(1, '#2a3060'); } else { g.addColorStop(0, '#7ab0f0'); g.addColorStop(0.7, '#ffe0b8'); g.addColorStop(1, '#ffc890'); }
    c.fillStyle = g; c.fillRect(0, 0, w, h); const R = rng(4); for (let x = 0; x < w; x += 40 + R() * 30) { const hh = 120 + R() * 140; c.fillStyle = night ? '#141830' : ['#c8a0b8', '#b8a0c8', '#c0a890'][Math.floor(R() * 3)]; c.fillRect(x, h - hh, 44, hh); c.beginPath(); c.moveTo(x - 4, h - hh); c.lineTo(x + 22, h - hh - 30); c.lineTo(x + 48, h - hh); c.fill(); } });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(30, 22), basic(0xffffff, { map: out })), [2, 5, -16]);
  for (const sx of [-1, 1]) box(S, [0.6, 11, 20], [sx * 10.3, 5.5, 2], std({ map: (() => { const t = brick.clone(); t.repeat.set(4, 2.2); t.needsUpdate = true; return t; })(), roughness: 0.9 }), { r: 0, cast: false, name: 'wall' });
  box(S, [21, 0.4, 21], [0, 11.2, 2], tmat(plankTex('#6a4024'), 3, 3), { r: 0, cast: false, solid: false });
  box(S, [21, 11, 0.4], [0, 5.5, 12.4], tmat(plasterTex('#e8d8c0'), 3, 2), { r: 0, cast: false, name: 'front wall' });
  for (const z of [-5, 0, 5, 10]) box(S, [20.4, 0.8, 0.8], [0, 10.6, z], M(0x4a2a14), { r: 0.05, cast: false, solid: false });
  // bed (left)
  const bedM = M(0x6a3a1a, { roughness: 0.5 });
  for (const [x, z] of [[-9.6, -7.6], [-5.6, -7.6], [-9.6, -1.8], [-5.6, -1.8]]) box(S, [0.4, 0.8, 0.4], [x, 0.4, z], bedM, { r: 0.05, name: 'bed leg' });
  box(S, [4.4, 0.5, 6.2], [-7.6, 1.05, -4.7], bedM, { r: 0.08, name: 'bed frame' });
  box(S, [4.2, 0.6, 6.0], [-7.6, 1.6, -4.7], M(0xf6f2ea), { r: 0.2, name: 'bed mattress' });
  box(S, [4.4, 3.6, 0.4], [-7.6, 1.8, -7.9], bedM, { r: 0.1, name: 'bed head' });
  const quilt = ctex(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#f2762a' : '#2a8a9a'; c.fillRect(i * 64, j * 64, 64, 64); } noiseFill(c, w, h, 0.06, 600); });
  const blanket = put(S, mesh(rb(4.5, 0.35, 4.2, 0.15), std({ map: quilt, roughness: 0.95 })), [-7.6, 2.0, -3.6]);
  put(S, mesh(rb(2.4, 0.6, 1.3, 0.3), M(0xfafaf4)), [-7.6, 2.2, -7.0]);
  // nightstand + lamp
  box(S, [1.6, 2.2, 1.4], [-4.3, 1.1, -6.9], M(0x8a5a2a), { r: 0.08, name: 'nightstand' });
  put(S, mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.9, 10), M(0x2a2a2a)), [-4.7, 2.65, -7.3]); put(S, mesh(new THREE.ConeGeometry(0.6, 0.6, 16, 1, true), std({ color: 0xf2d08a, emissive: 0xffc870, emissiveIntensity: night ? 0.9 : 0.25, side: THREE.DoubleSide })), [-4.7, 3.3, -7.3]);
  // desk (right) + car posters + manual
  box(S, [3.6, 0.2, 2.0], [7.8, 2.7, -6.6], M(0x5a8aa8), { r: 0.05, name: 'desk' }); for (const x of [6.2, 9.4]) box(S, [0.2, 2.6, 1.8], [x, 1.3, -6.6], M(0x4a7a98), { r: 0.03, name: 'desk leg' });
  book(S, [7.0, 2.95, -6.4], 0xd8302a, [1.3, 0.25, 1.0]); planeSign(S, signTex("DRIVER'S", '#d8302a', '#fff', 256, 64, 40, false), [1.2, 0.3], [7.0, 3.09, -6.4], 0).rotation.set(-Math.PI / 2, 0, 0);
  const toyCar = put(S, mesh(rb(0.9, 0.4, 0.5, 0.12), M(0x2a7ad8, { metalness: 0.3 })), [8.6, 3.0, -6.8]);
  const poster = (text, sub, bg, pos) => planeSign(S, ctex(256, 360, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 44px Inter'; c.textAlign = 'center'; c.fillText(text, w / 2, 70);
    c.fillStyle = '#1a1a1e'; c.beginPath(); c.roundRect(40, 160, 176, 70, 20); c.fill(); c.fillRect(70, 130, 110, 40); c.fillStyle = '#f2c420'; c.beginPath(); c.arc(80, 236, 22, 0, 7); c.arc(176, 236, 22, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '700 28px Inter'; c.fillText(sub, w / 2, 320); }), [2.4, 3.4], pos, -Math.PI / 2);
  poster('VROOM', 'SOON!', '#2a8a9a', [9.95, 6.2, -4.0]); poster('L', 'LEARNER', '#d8302a', [9.95, 6.6, -0.5]);
  planeSign(S, signTex('TEST DAY 9:00', '#fff6d0', '#d8302a', 512, 128, 64), [3, 0.75], [7.8, 5.0, -8.25]);
  // shelves of gears + clock parts (left wall above bed is the headboard; shelf on right wall)
  box(S, [0.8, 0.15, 6], [9.6, 4.6, 3.5], M(0x6a4024), { r: 0.03, solid: false });
  const gears = []; for (let i = 0; i < 5; i++) { const gg = tinyGear(S, 0.35 + (i % 3) * 0.12, [0xc89a3a, 0xa8a8b0, 0xb87a3a][i % 3]); gg.position.set(9.5, 5.1 + (i % 2) * 0.1, 1.2 + i * 1.1); gg.rotation.y = -Math.PI / 2; gears.push(gg); }
  // gear mobile hanging from the beam
  const mobile = new THREE.Group(); mobile.position.set(3.5, 9.2, 3); S.add(mobile); put(mobile, mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 4), M(0x2a2a2a), false), [0, 0.7, 0]);
  const mg = [[-0.9, -0.2, 0.5], [0.9, -0.5, 0.4], [0, -1.0, 0.6]].map(([x, y, r]) => { const gg = tinyGear(S, r, 0xd8b04a); mobile.add(gg); gg.position.set(x, y, 0); return gg; });
  // rug, laundry pile, skateboard, plant, string lights
  put(S, mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.06, 40), std({ map: ctex(256, 256, (c, w, h) => { for (let r = 128; r > 0; r -= 16) { c.fillStyle = ['#d8a03a', '#2a8a9a', '#f2e6c8', '#d8302a'][(r / 16) % 4]; c.beginPath(); c.arc(128, 128, r, 0, 7); c.fill(); } }), roughness: 0.95 }), false), [2.5, 0.03, 2.5]);
  for (let i = 0; i < 7; i++) { const R = rng(i + 2); put(S, mesh(rb(1.2, 0.3, 1.0, 0.14), M([0x2a5a9a, 0xf2f2ea, 0x3a3a3a, 0xd8302a][i % 4])), [6.8 + R() * 1.6, 0.15 + i * 0.12, 6.4 + R() * 1.2], [0, R() * 3, (R() - 0.5) * 0.3]); }
  const sk = new THREE.Group(); sk.position.set(-2.6, 0.2, 8); sk.rotation.y = 0.5; S.add(sk); put(sk, mesh(rb(3.0, 0.12, 0.9, 0.06), M(0xf2c420)), [0, 0.1, 0]); for (const x of [-1, 1]) for (const z of [-0.3, 0.3]) put(sk, mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.15, 10), M(0xd8302a)), [x, -0.05, z], [Math.PI / 2, 0, 0]);
  plant(S, [-3.6, 0, -7.4], 1.2); plant(S, [8.8, 0, 9.5], 1.0, 0x2a7a4a);
  const sl1 = stringLights(S, [-9.8, 9.5, -7.6], [-9.8, 9.5, 8], 18, 0.9), sl2 = stringLights(S, [-9.8, 9.6, -7.8], [9.8, 9.6, -7.8], 18, 1.2);
  // lights: sun through the clock window + lamp + fills
  S.add(new THREE.HemisphereLight(night ? 0x3a4a7a : 0xfff0dc, 0x4a3020, night ? 0.35 : 0.75));
  const sun = new THREE.SpotLight(night ? 0x7a90d8 : 0xffd8a0, night ? 120 : 900, 60, 0.5, 0.6, 1.4); sun.position.set(2.5, 8.5, -18); sun.target.position.set(-1.5, 0, 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0008; S.add(sun, sun.target);
  const lamp = new THREE.PointLight(0xffb870, night ? 14 : 3, 14, 1.6); lamp.position.set(-4.7, 3.6, -6.6); S.add(lamp);
  const fillL = new THREE.PointLight(night ? 0x8aa0d8 : 0xfff0d8, night ? 6 : 14, 28, 1.4); fillL.position.set(1, 8, 9); S.add(fillL);
  const warm = new THREE.PointLight(0xffc890, 6, 18, 1.6); warm.position.set(-6, 6, 2); S.add(warm);
  const base = sun.intensity;
  return { blanket, stand: new THREE.Vector3(-4.3, 2.2, -6.9), win, hands: win, sun, lamp, toyCar,
    sunK(k) { sun.intensity = base * k; },
    update(t) { mobile.rotation.y = t * 0.3; mg.forEach((gg, i) => gg.rotation.z = t * (i % 2 ? 1 : -1) * 0.8); gears.forEach((gg, i) => gg.rotation.x = t * 0.2 * (i % 2 ? 1 : -1)); } };
}

export function clockShop(S, { time = 'morning' } = {}) {
  const night = time === 'night';
  S.background = new THREE.Color(night ? 0x080a14 : 0x1a1410);
  box(S, [24, 0.3, 26], [0, -0.15, 2.5], std({ map: (() => { const t = ctex(256, 256, (c, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#2a2a30' : '#e8e0d0'; c.fillRect(i * 32, j * 32, 32, 32); } noiseFill(c, w, h, 0.06, 800); }); t.repeat.set(6, 6); return t; })(), roughness: 0.5, metalness: 0.05 }), { r: 0, cast: false, name: 'floor' });
  const wp = tmat(wallpaperTex('#24584a', '#e8c878'), 5, 2.4);
  box(S, [24, 11, 0.4], [0, 5.5, -10.2], wp, { r: 0, cast: false, name: 'back wall' });
  box(S, [0.4, 11, 26], [12.2, 5.5, 2.5], tmat(wallpaperTex('#24584a', '#e8c878'), 5, 2.4), { r: 0, cast: false, name: 'right wall' });
  // left wall with a big shop window (x -12, z -6..2, y 2..8)
  const lw = tmat(wallpaperTex('#24584a', '#e8c878'), 1, 2.4);
  box(S, [0.4, 11, 4], [-12.2, 5.5, -8], lw, { r: 0, cast: false, name: 'left wall' }); box(S, [0.4, 11, 13.5], [-12.2, 5.5, 8.75], lw, { r: 0, cast: false, name: 'left wall' });
  box(S, [0.4, 2, 8], [-12.2, 1, -2], lw, { r: 0, cast: false, name: 'left wall' }); box(S, [0.4, 3, 8], [-12.2, 9.5, -2], lw, { r: 0, cast: false, name: 'left wall' });
  for (const z of [-6, -2, 2]) box(S, [0.5, 6, 0.3], [-12.1, 5, z], M(0x3a2a1a), { r: 0.04, cast: false, solid: false }); box(S, [0.5, 0.3, 8.2], [-12.1, 5, -2], M(0x3a2a1a), { r: 0.04, cast: false, solid: false });
  const outT = ctex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); if (night) { g.addColorStop(0, '#0a1030'); g.addColorStop(1, '#1a2048'); } else { g.addColorStop(0, '#9ac8f6'); g.addColorStop(1, '#fff0d8'); } c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = night ? '#1a1a2e' : '#e8a8b8'; c.fillRect(0, 150, 110, 106); c.fillStyle = night ? '#22223a' : '#a8d8c0'; c.fillRect(120, 130, 136, 126); if (night) { c.fillStyle = '#ffd890'; c.fillRect(20, 170, 20, 26); c.fillRect(160, 160, 24, 30); } });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(14, 12), basic(0xffffff, { map: outT })), [-16, 5, -2], [0, Math.PI / 2, 0]);
  box(S, [24, 0.4, 26], [0, 11.2, 2.5], tmat(plankTex('#5a3418'), 3, 3), { r: 0, cast: false, solid: false });
  box(S, [24, 11, 0.4], [0, 5.5, 15.2], wp, { r: 0, cast: false, name: 'front wall' });
  box(S, [24, 0.8, 0.3], [0, 0.4, -9.9], M(0x3a2414), { r: 0.03, cast: false, solid: false });
  // wall of clocks
  const clocks = []; const R = rng(7);
  [[-2.5, 7.8, 0.9, 0], [0.4, 8.6, 0.7, 1], [2.8, 7.4, 1.0, 0], [5.4, 8.4, 0.75, 2], [7.8, 7.6, 0.8, 0], [-0.8, 5.6, 0.6, 1], [1.8, 5.4, 0.55, 0], [4.4, 5.9, 0.65, 0], [6.8, 5.4, 0.5, 1],
    [9.6, 8.0, 0.7, 0], [-3.4, 9.6, 0.45, 0], [3.6, 9.8, 0.4, 1], [10.4, 5.6, 0.6, 0]].forEach(([x, y, r, k], i) => clocks.push(wallClock(S, [x, y, -9.95], { r, kind: k, col: [0x7a4a22, 0x5a2a12, 0xa87a4a, 0x2a4a5a][i % 4] })));
  const cuck = clocks[3];
  const bird = new THREE.Group(); cuck.add(bird); bird.position.set(0, 1.0, 0.1); put(bird, mesh(new THREE.SphereGeometry(0.22, 10, 8), M(0xf2c420)), [0, 0, 0]); put(bird, mesh(new THREE.ConeGeometry(0.08, 0.2, 6), M(0xf27a1a)), [0, 0, 0.25], [Math.PI / 2, 0, 0]); bird.visible = false;
  // grandfather clocks back-left
  const gfs = [[-10.5, 0x5a2a12, 8.4], [-8.0, 0x7a4a22, 7.6], [-5.5, 0x3a1a0a, 8.8]].map(([x, c, h], i) => grandfather(S, [x, -9.1], { col: c, h, name: 'gfclock' + i }));
  // counter + register + bell + display of watches
  box(S, [6.4, 3.0, 1.6], [1.2, 1.5, -5.4], M(0x6a3a1a, { roughness: 0.4 }), { r: 0.06, name: 'counter' });
  box(S, [6.6, 0.15, 1.8], [1.2, 3.07, -5.4], M(0x3a1a0a, { roughness: 0.3 }), { r: 0.04, solid: false });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(5.8, 2.0), std({ color: 0x5a4a3a, roughness: 0.2, metalness: 0.2, emissive: 0x3a2a18, emissiveIntensity: 0.5 })), [1.2, 1.6, -4.58]);
  for (let i = 0; i < 6; i++) { const w = put(S, mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), M(0xd8b04a, { metalness: 0.9, roughness: 0.2 })), [-1.0 + i * 0.85, 1.5, -4.6], [Math.PI / 2, 0, 0]); }
  put(S, mesh(rb(1.4, 1.0, 1.0, 0.1), M(0xb8902a, { metalness: 0.7, roughness: 0.3 })), [3.4, 3.65, -5.6]);
  put(S, mesh(new THREE.SphereGeometry(0.28, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xd8b04a, { metalness: 0.9, roughness: 0.2 })), [-0.8, 3.15, -5.0]);
  // workbench (right)
  box(S, [3.2, 0.25, 8], [10.0, 2.9, -4], M(0x7a5a3a), { r: 0.04, name: 'bench' }); for (const z of [-7.6, -0.4]) box(S, [3.0, 2.8, 0.3], [10.0, 1.4, z], M(0x5a3a1a), { r: 0.03, name: 'bench leg' });
  const benchLamp = new THREE.Group(); benchLamp.position.set(10.6, 3.0, -6.2); S.add(benchLamp); put(benchLamp, mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), M(0x2a6a5a)), [0, 1.2, 0]);
  put(benchLamp, mesh(new THREE.ConeGeometry(0.6, 0.7, 16, 1, true), std({ color: 0x2a6a5a, side: THREE.DoubleSide })), [-0.5, 2.4, 0.3], [0, 0, 0.8]);
  const lamp = new THREE.PointLight(0xffd8a0, night ? 16 : 6, 12, 1.6); lamp.position.set(9.8, 4.6, -5.6); S.add(lamp);
  for (let i = 0; i < 5; i++) { const gg = tinyGear(S, 0.2 + (i % 3) * 0.1, [0xc89a3a, 0xa8a8b0][i % 2]); gg.position.set(9.3 + (i % 2) * 0.6, 3.05, -4.2 + i * 0.7); gg.rotation.x = -Math.PI / 2; }
  put(S, mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 24), M(0xfbf6e8)), [9.9, 3.12, -2.2]);
  // rocking chair + footstool (left)
  const chair = new THREE.Group(); chair.position.set(-7.2, 0, -2.0); chair.rotation.y = 35 * D; S.add(chair); const cw = M(0x8a4a22, { roughness: 0.5 });
  for (const sx of [-1, 1]) { const rk = put(chair, mesh(new THREE.TorusGeometry(3.0, 0.1, 6, 24, 0.9), cw), [sx * 1.0, 3.1, -0.2], [0, Math.PI / 2, Math.PI * 1.5 - 0.45]); }
  put(chair, mesh(rb(2.4, 0.3, 2.0, 0.08), cw), [0, 1.55, 0]); put(chair, mesh(rb(2.4, 3.2, 0.25, 0.08), cw), [0, 3.2, -1.0], [-0.12, 0, 0]);
  put(chair, mesh(rb(2.2, 0.25, 1.8, 0.1), M(0xc85a8a)), [0, 1.78, 0.05]);
  for (const sx of [-1, 1]) put(chair, mesh(rb(0.25, 0.2, 1.8, 0.06), cw), [sx * 1.15, 2.7, 0]);
  ghost(S, [2.4, 0.5, 2.0], [-7.2, 1.4, -2.0], 'chair seat');
  box(S, [1.6, 1.0, 1.4], [-4.2, 0.5, -1.0], M(0x6a8ab8), { r: 0.12, name: 'stool' });
  const yarn = [0xd8302a, 0xf2c420, 0x2a8a9a].map((c, i) => put(S, mesh(new THREE.SphereGeometry(0.4, 14, 10), std({ color: c, roughness: 1 })), [-9.6 + i * 0.7, 0.4, 1.0 - i * 0.3]));
  // spiral stair back-right
  const stair = new THREE.Group(); stair.position.set(7.6, 0, -8.0); S.add(stair); put(stair, mesh(new THREE.CylinderGeometry(0.2, 0.2, 11, 8), M(0x2a2a2a, { metalness: 0.6 })), [0, 5.5, 0]);
  for (let i = 0; i < 14; i++) { const st = put(stair, new THREE.Group(), [0, 0.6 + i * 0.75, 0], [0, i * 0.5, 0]); put(st, mesh(rb(1.8, 0.12, 0.8, 0.04), M(0x3a3a3e, { metalness: 0.6 })), [0.9, 0, 0]); }
  // pendant lamps
  const pend = []; for (const [x, z] of [[-4, -3], [3, -2], [0, 4]]) { put(S, mesh(new THREE.CylinderGeometry(0.02, 0.02, 3, 4), M(0x1a1a1a), false), [x, 9.5, z]);
    put(S, mesh(new THREE.ConeGeometry(0.9, 0.8, 18, 1, true), std({ color: 0xd8b04a, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide })), [x, 7.9, z]);
    put(S, mesh(new THREE.SphereGeometry(0.25, 10, 8), std({ color: 0xfff2d0, emissive: 0xffd890, emissiveIntensity: 1.5 }), false), [x, 7.6, z]);
    const p = new THREE.PointLight(0xffc880, night ? 22 : 9, 18, 1.6); p.position.set(x, 7.2, z); S.add(p); pend.push(p); }
  plant(S, [10.6, 0, 6], 1.3); plant(S, [-10.6, 0, 9], 1.1, 0x2a7a4a);
  planeSign(S, signTex('TICK & SONS · SINCE 1922', '#1a3a2e', '#e8c878', 1024, 96, 56), [9, 0.85], [2.8, 10.2, -9.98]);
  S.add(new THREE.HemisphereLight(night ? 0x3a4a7a : 0xfff0dc, 0x3a2a1a, night ? 0.3 : 0.7));
  const win = new THREE.SpotLight(night ? 0x6a80c8 : 0xffe0b0, night ? 60 : 700, 50, 0.6, 0.7, 1.4); win.position.set(-20, 9, -2); win.target.position.set(-4, 0, 0); win.castShadow = true; win.shadow.mapSize.set(2048, 2048); win.shadow.bias = -0.0008; S.add(win, win.target);
  const front = new THREE.PointLight(0xfff0d8, night ? 6 : 12, 30, 1.4); front.position.set(0, 7, 11); S.add(front);
  let cuckK = 0;
  return { clocks, gfs, lamp, yarn, chair, win,
    cuckoo(k) { cuckK = k; },
    rock(t, k = 1) { chair.rotation.x = Math.sin(t * 1.6) * 0.06 * k; },
    update(t, shakeK = 0) { clocks.forEach(c => { c.tick(t); c.rotation.z = shakeK ? Math.sin(t * 50 + c.position.x) * 0.12 * shakeK : 0; c.position.y += 0; }); gfs.forEach(g => { g.tick(t); g.rotation.z = shakeK ? Math.sin(t * 43 + g.position.x) * 0.02 * shakeK : 0; });
      bird.visible = cuckK > 0.02; bird.position.z = 0.1 + cuckK * 0.6; bird.rotation.x = Math.sin(t * 12) * 0.3 * cuckK; } };
}

function townhouse(S, [x, z], { w = 10, h = 13, col = '#f2b8c8', trim = 0xfafaf2, door = 0x2a5ab8, roofCol = 0x8a3a2a, gable = 'step', name = 'house', seed = 1 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const R = rng(seed);
  const wall = tmat(plasterTex(col), w / 6, h / 6);
  put(g, mesh(new THREE.BoxGeometry(w, h, 10), wall), [0, h / 2, -5]);
  // Dutch gable on top of the front
  const gh = 4.2, sh = new THREE.Shape();
  if (gable === 'step') { sh.moveTo(-w / 2, 0); sh.lineTo(-w / 2, 1.2); sh.lineTo(-w / 2 + 1.4, 1.2); sh.lineTo(-w / 2 + 1.4, 2.4); sh.lineTo(-w / 2 + 2.8, 2.4); sh.lineTo(-w / 2 + 2.8, 3.6); sh.lineTo(w / 2 - 2.8, 3.6); sh.lineTo(w / 2 - 2.8, 2.4); sh.lineTo(w / 2 - 1.4, 2.4); sh.lineTo(w / 2 - 1.4, 1.2); sh.lineTo(w / 2, 1.2); sh.lineTo(w / 2, 0); }
  else if (gable === 'bell') { sh.moveTo(-w / 2, 0); sh.bezierCurveTo(-w / 2, 2.2, -w / 4, 1.6, -w / 5, gh - 0.6); sh.lineTo(-w / 5, gh); sh.lineTo(w / 5, gh); sh.lineTo(w / 5, gh - 0.6); sh.bezierCurveTo(w / 4, 1.6, w / 2, 2.2, w / 2, 0); }
  else { sh.moveTo(-w / 2, 0); sh.lineTo(0, gh); sh.lineTo(w / 2, 0); }
  sh.closePath(); put(g, mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }), wall), [0, h, -0.6]);
  put(g, mesh(new THREE.BoxGeometry(w - 0.6, 3.0, 9.4), tmat(roofTileTex(new THREE.Color(roofCol).getStyle()), 3, 1)), [0, h + 1.2, -5.6]);
  put(g, mesh(rb(w + 0.3, 0.4, 0.5, 0.1), M(trim)), [0, h, 0.1]);
  put(g, mesh(rb(w + 0.3, 0.5, 0.5, 0.1), M(trim)), [0, 0.25, 0.1]);
  const glass = std({ color: 0x40607a, roughness: 0.12, metalness: 0.5 }), tm = M(trim);
  const rows = Math.floor((h - 4) / 3.4);
  for (let r = 0; r < rows; r++) for (const wx of [-w / 3.4, 0, w / 3.4]) { if (r === 0 && wx === 0) continue; const wy = 5.6 + r * 3.4;
    put(g, mesh(rb(1.6, 2.3, 0.2, 0.05), glass, false), [wx, wy, 0.05]); put(g, mesh(rb(1.9, 0.2, 0.3, 0.05), tm, false), [wx, wy + 1.25, 0.15]); put(g, mesh(rb(2.0, 0.25, 0.5, 0.05), tm, false), [wx, wy - 1.25, 0.25]);
    put(g, mesh(new THREE.BoxGeometry(0.08, 2.3, 0.1), tm, false), [wx, wy, 0.15]);
    if (R() < 0.6) { put(g, mesh(rb(1.9, 0.45, 0.6, 0.08), M(0x6a4a2a), false), [wx, wy - 1.5, 0.5]); for (let i = 0; i < 5; i++) put(g, mesh(new THREE.SphereGeometry(0.2, 6, 5), M([0xe8302a, 0xf2c420, 0xf27ab8, 0xffffff, 0x8a3ab8][(i + r) % 5]), false), [wx - 0.7 + i * 0.35, wy - 1.15, 0.55]); } }
  // door + steps + ground-floor window
  put(g, mesh(rb(2.4, 3.8, 0.3, 0.1), M(door, { roughness: 0.4 })), [0, 2.4, 0.1]); put(g, mesh(rb(2.9, 0.3, 0.5, 0.06), tm), [0, 4.45, 0.2]);
  put(g, mesh(new THREE.SphereGeometry(0.13, 8, 6), M(0xd8b04a, { metalness: 0.8 })), [0.8, 2.4, 0.3]);
  put(g, mesh(rb(3.0, 0.3, 1.2, 0.05), M(0xb8b0a0)), [0, 0.35, 0.6]);
  box(S, [w, h + 3, 10], [x, (h + 3) / 2, z - 5], basic(0, { visible: false }), { r: 0, cast: false, name });
  return g;
}
function flowerStall(S, [x, z], { col = 0xd8302a, seed = 1 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const R = rng(seed); const wood = M(0x8a5a2a);
  put(g, mesh(rb(6.0, 0.3, 2.4, 0.05), wood), [0, 2.4, 0]); for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(g, mesh(new THREE.BoxGeometry(0.2, sz > 0 ? 2.4 : 6.4, 0.2), wood), [sx * 2.9, sz > 0 ? 1.2 : 3.2, sz * 1.1]);
  const stripe = ctex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fafaf2' : '#' + new THREE.Color(col).getHexString(); c.fillRect(i * 32, 0, 32, h); } });
  const aw = put(g, mesh(new THREE.BoxGeometry(6.6, 0.1, 3.4), std({ map: stripe, side: THREE.DoubleSide })), [0, 6.2, 0.6], [0.32, 0, 0]);
  for (let i = 0; i < 9; i++) { const sc = put(g, mesh(new THREE.TorusGeometry(0.2, 0.08, 4, 8, Math.PI), std({ map: stripe })), [-3.0 + i * 0.75, 5.62, 2.2], [0, 0, Math.PI]); }
  const flowers = [];
  for (let b = 0; b < 5; b++) { const bx = -2.4 + b * 1.2; put(g, mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.8, 12), M(0x6a7a8a, { metalness: 0.6 })), [bx, 2.95, 0.2]);
    const fc = [0xe8302a, 0xf2c420, 0xf27ab8, 0xffffff, 0x8a3ab8][(b + seed) % 5];
    for (let i = 0; i < 7; i++) { const f = put(g, new THREE.Group(), [bx + (R() - 0.5) * 0.6, 3.3, 0.2 + (R() - 0.5) * 0.6]); put(f, mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 4), M(0x3a7a2a), false), [0, 0.5, 0]);
      put(f, mesh(new THREE.SphereGeometry(0.2, 7, 5), M(fc), false), [0, 1.05, 0]); f.rotation.set((R() - 0.5) * 0.4, 0, (R() - 0.5) * 0.4); flowers.push(f); } }
  for (let i = 0; i < 3; i++) { put(g, mesh(new THREE.CylinderGeometry(0.55, 0.45, 1.0, 12), M(0x5a6a7a, { metalness: 0.5 })), [-2 + i * 1.8, 0.5, 2.0]);
    for (let j = 0; j < 6; j++) put(g, mesh(new THREE.SphereGeometry(0.22, 7, 5), M([0xf27ab8, 0xf2c420, 0xe8302a][(i + j) % 3]), false), [-2 + i * 1.8 + (R() - 0.5) * 0.6, 1.3 + R() * 0.4, 2.0 + (R() - 0.5) * 0.6]); }
  box(S, [6.2, 3.0, 2.6], [x, 1.5, z], basic(0, { visible: false }), { r: 0, cast: false, name: 'stall' });
  box(S, [5.8, 1.2, 1.4], [x, 0.6, z + 2.0], basic(0, { visible: false }), { r: 0, cast: false, name: 'stall buckets' });
  return { g, flowers, aw };
}
function streetLamp(S, [x, z], h = 8) { const m = M(0x1e3a32, { metalness: 0.5, roughness: 0.4 }); put(S, mesh(new THREE.CylinderGeometry(0.16, 0.26, h, 10), m), [x, h / 2, z]);
  put(S, mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.6, 10), m), [x, 0.3, z]); put(S, mesh(rb(0.9, 1.2, 0.9, 0.1), std({ color: 0xfff2c8, emissive: 0xffd890, emissiveIntensity: 0.3 })), [x, h + 0.5, z]);
  put(S, mesh(new THREE.ConeGeometry(0.8, 0.6, 4), m), [x, h + 1.4, z], [0, Math.PI / 4, 0]); ghost(S, [0.6, h, 0.6], [x, h / 2, z], 'lamp post'); }
function pigeon(S, s = 1) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); const m = M(0x8a8a9a), dk = M(0x5a5a6a);
  put(g, mesh(new THREE.SphereGeometry(0.4, 10, 8), m), [0, 0.4, 0]).scale.set(0.8, 0.8, 1.2); put(g, mesh(new THREE.SphereGeometry(0.25, 10, 8), dk), [0, 0.75, 0.35]); put(g, mesh(new THREE.ConeGeometry(0.06, 0.18, 5), M(0xf2a83a)), [0, 0.72, 0.62], [Math.PI / 2, 0, 0]);
  const wings = [-1, 1].map(sx => { const w = put(g, new THREE.Group(), [sx * 0.3, 0.5, 0]); put(w, mesh(new THREE.BoxGeometry(0.7, 0.06, 0.45), dk), [sx * 0.35, 0, 0]); return w; });
  g.flap = (t, k = 1) => wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * Math.sin(t * 20) * 0.9 * k); return g; }

export function tickStreet(S, { time = 'morning' } = {}) {
  S.background = skyTex('#5a96e0', '#a8ccf2', '#ffe2c0'); S.fog = new THREE.Fog(0xf2dcc8, 90, 300);
  box(S, [200, 0.3, 24], [0, -0.15, 2.5], tmat(herringTex(), 40, 5, { roughness: 0.85 }), { r: 0, cast: false, name: 'road' });
  box(S, [200, 0.3, 5], [0, 0.02, -11.5], tmat(slabTex(), 50, 1.25), { r: 0, cast: false, solid: false, name: 'sidewalk' });
  box(S, [200, 0.3, 4], [0, 0.02, 15.5], tmat(slabTex(), 50, 1), { r: 0, cast: false, solid: false });
  box(S, [200, 0.35, 0.4], [0, 0.18, -9.0], M(0xb8b0a0), { r: 0.04, cast: false, solid: false });
  // townhouses (left of the shop and right of it)
  const pal = ['#f2b8c8', '#b8e8d0', '#fff0a8', '#b8d4f6', '#dcc8f2', '#ffd0a8', '#c8f0b8'];
  const gab = ['step', 'bell', 'tri'];
  const left = [-48, -37, -26, -15], right = [16, 27, 38, 49, 60];
  left.forEach((x, i) => townhouse(S, [x, -14], { w: 10.6, h: 12 + (i % 3) * 1.4, col: pal[i % 7], gable: gab[i % 3], door: [0x2a7a4a, 0xd8302a, 0x2a5ab8, 0x8a3ab8][i % 4], roofCol: 0x8a3a2a, name: 'house L' + i, seed: i + 3 }));
  right.forEach((x, i) => townhouse(S, [x, -14], { w: 10.6, h: 12.5 + ((i + 1) % 3) * 1.3, col: pal[(i + 3) % 7], gable: gab[(i + 1) % 3], door: i === 0 ? 0x2a5ab8 : [0xd8302a, 0x2a7a4a, 0xf2c420][i % 3], name: 'house R' + i, seed: i + 11 }));
  // TICK & SONS clock tower (x -1..9 -> centred at x 4, w 10.4)
  const tw = new THREE.Group(); tw.position.set(4, 0, -14); S.add(tw); const brickM = tmat(brickTex('#a8503a'), 3, 4), stoneM = M(0xe8dcc0, { roughness: 0.7 });
  put(tw, mesh(new THREE.BoxGeometry(10.4, 15, 10), brickM), [0, 7.5, -5]); put(tw, mesh(new THREE.BoxGeometry(9.0, 10, 9), tmat(brickTex('#a8503a'), 2.5, 3)), [0, 20, -5]);
  put(tw, mesh(rb(11, 0.6, 10.6, 0.1), stoneM), [0, 15.1, -5]); put(tw, mesh(rb(9.6, 0.6, 9.6, 0.1), stoneM), [0, 25.1, -5]);
  put(tw, mesh(new THREE.ConeGeometry(7.0, 6, 4), tmat(roofTileTex('#2a6a5a'), 3, 2)), [0, 28.4, -5], [0, Math.PI / 4, 0]);
  put(tw, mesh(new THREE.SphereGeometry(0.4, 10, 8), M(0xd8b04a, { metalness: 0.9 })), [0, 31.6, -5]);
  const face = towerFace(tw, { r: 3.6, glow: 0.2 }); face.position.set(0, 19.6, -0.45); put(tw, mesh(new THREE.CylinderGeometry(4.3, 4.3, 0.5, 40), stoneM), [0, 19.6, -0.6], [Math.PI / 2, 0, 0]);
  // shop front: big window, door, awning, sign
  put(tw, mesh(rb(3.8, 5.5, 0.2, 0.05), std({ color: 0x2a3a4a, roughness: 0.1, metalness: 0.5 })), [-2.4, 3.6, 0.05]);
  for (let i = 0; i < 5; i++) wallClock(S, [4 - 3.4 + i * 0.75 - 0.75, 2.4 + (i % 2) * 1.4, -13.75], { r: 0.28 + (i % 2) * 0.08, kind: i % 2 });
  const doorG = put(tw, new THREE.Group(), [0.2, 0, 0.1]); put(doorG, mesh(rb(3.6, 5.2, 0.25, 0.08), M(0x1a4a3a, { roughness: 0.35 })), [1.8, 2.6, 0]); put(doorG, mesh(new THREE.SphereGeometry(0.15, 8, 6), M(0xd8b04a, { metalness: 0.9 })), [3.2, 2.6, 0.2]);
  put(doorG, mesh(rb(2.4, 2.0, 0.1, 0.05), std({ color: 0xffe8b0, emissive: 0xffd890, emissiveIntensity: 0.25 })), [1.8, 3.6, 0.13]);
  put(tw, mesh(rb(4.2, 0.5, 0.5, 0.08), stoneM), [2.0, 5.5, 0.2]); put(tw, mesh(rb(4.2, 0.2, 0.5, 0.08), stoneM), [2.0, 0.1, 0.2]);
  const awT = ctex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f6eed8' : '#1a5a4a'; c.fillRect(i * 32, 0, 32, h); } });
  const awning = put(tw, mesh(new THREE.BoxGeometry(10.6, 0.15, 3.0), std({ map: awT })), [0, 6.6, 1.3], [0.35, 0, 0]);
  planeSign(S, signTex('TICK & SONS · CLOCKS', '#1a4a3a', '#e8c878', 1024, 128, 72), [9, 1.15], [4, 8.6, -13.88]);
  ghost(S, [10.4, 25, 10], [4, 12.5, -19], 'tower');
  // flower market (left)
  const stalls = [[-34, -11.0, 0xd8302a, 1], [-25.5, -11.0, 0x2a8a9a, 2], [-17, -11.0, 0xf2a020, 3]].map(([x, z, c, s]) => flowerStall(S, [x, z], { col: c, seed: s }));
  // phone booth, lamps, planters, benches, bike rack
  const booth = phoneBooth(S, [-47, -10.6]);
  [-42, -6.5, 10, 33, 52].forEach(x => streetLamp(S, [x, -9.6]));
  for (const x of [-10.5, 12.5, 44]) { put(S, mesh(rb(2.2, 1.2, 2.2, 0.15), M(0x8a8a82)), [x, 0.6, -11]); const tr = put(S, new THREE.Group(), [x, 1.2, -11]);
    put(tr, mesh(new THREE.CylinderGeometry(0.18, 0.25, 3.2, 8), M(0x5a3a22)), [0, 1.6, 0]); for (let i = 0; i < 5; i++) put(tr, mesh(new THREE.SphereGeometry(1.2, 10, 8), std({ color: 0x4a9a3a, roughness: 0.9, flatShading: true })), [Math.cos(i * 1.3) * 0.8, 3.6 + (i % 2) * 0.7, Math.sin(i * 1.3) * 0.6]);
    ghost(S, [2.2, 1.2, 2.2], [x, 0.6, -11], 'planter'); }
  const bike = new THREE.Group(); bike.position.set(36, 0, -10.4); S.add(bike); for (const x of [-1.2, 1.2]) put(bike, mesh(new THREE.TorusGeometry(0.9, 0.08, 6, 20), M(0x1a1a1e)), [x, 0.95, 0]);
  put(bike, mesh(new THREE.BoxGeometry(2.4, 0.1, 0.1), M(0xd8302a)), [0, 1.5, 0], [0, 0, 0.2]); put(bike, mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), M(0xd8302a)), [0.4, 1.6, 0]);
  // bunting across the street (front of houses)
  const bunt = []; for (const [x0, x1] of [[-52, -8], [12, 62]]) for (let i = 0; i < 22; i++) { const u = i / 21; const f = put(S, mesh(new THREE.ConeGeometry(0.4, 0.9, 3), M([0xd8302a, 0xfafafa, 0xf2c420, 0x2a8a9a][i % 4], { side: THREE.DoubleSide }), false), [x0 + (x1 - x0) * u, 11.5 - Math.sin(u * Math.PI) * 1.5, -9.0], [Math.PI, 0, 0]); f.scale.z = 0.2; bunt.push(f); }
  // far skyline: church spire + roofs behind
  const far = new THREE.Group(); S.add(far);
  for (let i = 0; i < 16; i++) { const R = rng(i + 40); const x = -90 + i * 12, h = 18 + R() * 10; put(far, mesh(new THREE.BoxGeometry(11, h, 8), M(['#d8b8c0', '#c8d8c0', '#d8d0b0'][i % 3] === undefined ? 0xc8c0b8 : new THREE.Color(['#d8b8c0', '#c8d8c0', '#d8d0b0'][i % 3]).getHex(), { roughness: 0.9 }), false), [x, h / 2, -38]);
    put(far, mesh(new THREE.ConeGeometry(6.5, 4, 4), M(0x8a4a3a), false), [x, h + 2, -38], [0, Math.PI / 4, 0]); }
  put(far, mesh(new THREE.BoxGeometry(5, 30, 5), M(0xe8e0d0), false), [-34, 15, -50]); put(far, mesh(new THREE.ConeGeometry(3.6, 14, 4), M(0x2a6a5a), false), [-34, 37, -50], [0, Math.PI / 4, 0]);
  clouds(S, { y: [45, 80], z: [-90, -180], x: 200, size: 2.6 });
  const pigeons = [0, 1, 2, 3].map(i => { const p = pigeon(S, 1); p.position.set(-4 + i * 2.2, 0, -10.5 + (i % 2) * 0.8); p.rotation.y = i * 0.8; return p; });
  // light
  const sun = new THREE.DirectionalLight(0xffe2b8, 3.3); sun.position.set(26, 40, 34); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 40, bottom: -30, near: 1, far: 160 }); sun.target.position.set(0, 0, -6); S.add(sun, sun.target);
  S.add(new THREE.HemisphereLight(0xcfe0ff, 0x7a5a48, 1.0));
  const fillL = new THREE.DirectionalLight(0xa8c0ff, 0.55); fillL.position.set(-30, 12, 40); S.add(fillL);
  const rimL = new THREE.DirectionalLight(0xffc890, 1.0); rimL.position.set(-10, 14, -30); S.add(rimL);
  const env = { tower: tw, hands: face, door: { g: doorG, open(k) { doorG.rotation.y = -1.7 * clamp01(k); } }, booth, stalls, pigeons, sun,
    pigeonsFly(t, k) { pigeons.forEach((p, i) => { p.position.y = k * (3 + i * 1.5) + Math.sin(t * 3 + i) * 0.2 * k; p.position.x = -4 + i * 2.2 + k * (6 + i * 3); p.flap(t + i, k > 0.01 ? 1 : 0); }); },
    update(t) { bunt.forEach((f, i) => { f.rotation.x = Math.PI + Math.sin(t * 3 + i) * 0.25; }); stalls.forEach(s => s.flowers.forEach((f, i) => f.rotation.z = Math.sin(t * 1.8 + i) * 0.06)); } };
  return env;
}

export const ROOF = { y: 14, gaps: [] };
export function roofscape(S) {
  S.background = skyTex('#4a8ae0', '#9ac4f2', '#ffe8c8'); S.fog = new THREE.Fog(0xe8dcd0, 120, 420);
  const R = rng(21);
  // the runway row of flat roofs along x at z 0 (top 14), gaps every 24
  ROOF.gaps = [];
  for (let x = -120; x < 120; x += 24) { const w = 21, cx = x + w / 2; ROOF.gaps.push(x + 22.5);
    put(S, mesh(new THREE.BoxGeometry(w, 14, 14), tmat(plasterTex(['#f2b8c8', '#b8e8d0', '#fff0a8', '#b8d4f6', '#dcc8f2'][Math.abs(Math.round(x / 24)) % 5]), 3, 2)), [cx, 7, 0]);
    box(S, [w, 0.3, 14], [cx, 13.9, 0], tmat(tarTex(), 4, 3), { r: 0, cast: false, name: 'roof' });
    for (const sz of [-1, 1]) put(S, mesh(new THREE.BoxGeometry(w, 0.8, 0.4), M(0xe8e0d0)), [cx, 14.4, sz * 6.8]);
    // windows on the front face
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) put(S, mesh(rb(1.6, 2.2, 0.2, 0.05), std({ color: 0x40607a, roughness: 0.12, metalness: 0.5 }), false), [cx - 7.5 + i * 5, 3 + r * 3.6, 7.05]);
    // chimney / water tank / vent / laundry on some roofs
    const k = R();
    if (k < 0.4) { put(S, mesh(rb(1.6, 3.2, 1.6, 0.06), tmat(brickTex('#9a4a36'), 1, 1)), [cx + 6, 15.6, -4]); put(S, mesh(rb(2.0, 0.4, 2.0, 0.06), M(0x5a5a5a)), [cx + 6, 17.3, -4]); }
    else if (k < 0.7) { const tk = put(S, new THREE.Group(), [cx - 5, 14, -3.5]); for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(tk, mesh(new THREE.CylinderGeometry(0.12, 0.12, 3, 6), M(0x3a3a3a)), [sx * 1.2, 1.5, sz * 1.2]);
      put(tk, mesh(new THREE.CylinderGeometry(2.0, 2.0, 3.5, 16), tmat(plankTex('#8a5a3a'), 2, 1)), [0, 4.7, 0]); put(tk, mesh(new THREE.ConeGeometry(2.2, 1.4, 16), M(0x5a3a22)), [0, 7.1, 0]); }
    else { const p1 = [cx - 6, 16.5, -5], p2 = [cx + 6, 16.5, -5]; for (const p of [p1, p2]) put(S, mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), M(0x5a5a5a)), [p[0], 15.3, p[2]]);
      put(S, mesh(new THREE.CylinderGeometry(0.02, 0.02, 12, 4), M(0x2a2a2a)), [cx, 16.5, -5], [0, 0, Math.PI / 2]);
      for (let i = 0; i < 5; i++) put(S, mesh(new THREE.BoxGeometry(1.4, 1.6, 0.04), M([0xd8302a, 0xfafafa, 0x2a8a9a, 0xf2c420, 0x8a3ab8][i % 5]), false), [cx - 4.5 + i * 2.2, 15.7, -5]); }
    put(S, mesh(rb(1.2, 1.0, 1.2, 0.1), M(0x9a9a9a)), [cx - 8, 14.5, 4]); }
  // gabled roofs all around (below the runway, in front and behind)
  for (let i = 0; i < 70; i++) { const x = -160 + R() * 320, z = [-28, -48, -70, 26, 46][i % 5] + (R() - 0.5) * 8, h = 6 + R() * 6, w = 10 + R() * 6, d = 9;
    if (Math.abs(z) < 12) continue;
    put(S, mesh(new THREE.BoxGeometry(w, h, d), M(new THREE.Color(['#e8c8c0', '#c8e0d0', '#f2e8c0', '#c8d8f0', '#e0d0f0'][i % 5]).getHex(), { roughness: 0.9 })), [x, h / 2, z]);
    const tri = new THREE.Shape(); tri.moveTo(-d / 2 - 0.5, 0); tri.lineTo(0, 3.6); tri.lineTo(d / 2 + 0.5, 0); tri.closePath();
    const rg = new THREE.ExtrudeGeometry(tri, { depth: w + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(w + 0.6) / 2);
    const rr = mesh(rg, std({ color: [0xc0503a, 0x8a3a2a, 0x2a6a5a][i % 3], roughness: 0.8 })); rr.rotation.y = Math.PI / 2; put(S, rr, [x, h, z]);
    if (R() < 0.5) put(S, mesh(rb(1.0, 2.4, 1.0, 0.05), tmat(brickTex('#9a4a36'), 1, 1)), [x + w * 0.25, h + 2.4, z]); }
  // landmarks far away: the clock tower and a spire
  const lt = new THREE.Group(); lt.position.set(-150, 0, -110); S.add(lt); put(lt, mesh(new THREE.BoxGeometry(12, 40, 12), tmat(brickTex('#a8503a'), 3, 8), false), [0, 20, 0]); put(lt, mesh(new THREE.ConeGeometry(9, 9, 4), M(0x2a6a5a), false), [0, 44.5, 0], [0, Math.PI / 4, 0]);
  const ltf = towerFace(lt, { r: 4.5, glow: 0.3 }); ltf.position.set(0, 32, 6.1);
  put(S, mesh(new THREE.BoxGeometry(6, 36, 6), M(0xe8e0d0), false), [120, 18, -130]); put(S, mesh(new THREE.ConeGeometry(4.5, 18, 4), M(0x2a6a5a), false), [120, 45, -130], [0, Math.PI / 4, 0]);
  box(S, [600, 0.3, 600], [0, -0.15, 0], M(0x8a7a6a), { r: 0, cast: false, solid: false });
  clouds(S, { y: [55, 95], z: [-120, -220], x: 260, size: 3 }); clouds(S, { y: [40, 70], z: [80, 140], x: 200, size: 2.2, seed: 9 });
  const pigeons = [0, 1, 2, 3, 4].map(i => pigeon(S, 1.2));
  const sun = new THREE.DirectionalLight(0xffe2b8, 3.3); sun.position.set(30, 60, 40); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 40, bottom: -40, near: 1, far: 200 }); S.add(sun, sun.target);
  S.add(new THREE.HemisphereLight(0xcfe0ff, 0x7a5a48, 1.0)); const fillL = new THREE.DirectionalLight(0xa8c0ff, 0.6); fillL.position.set(-30, 20, 40); S.add(fillL);
  return { sun, pigeons, tower: ltf,
    follow(x) { sun.position.set(x + 30, 60, 40); sun.target.position.set(x, 14, 0); },
    update(t, cx = 0) { pigeons.forEach((p, i) => { const u = t * 0.4 + i * 1.3; p.position.set(cx + 18 + i * 3 + Math.sin(u) * 4 - t * 2, 22 + i * 1.5 + Math.sin(u * 2) * 1.2, -8 + i * 1.5); p.rotation.y = -Math.PI / 2; p.flap(t + i); }); } };
}

export function testLot(S) {
  S.background = skyTex('#4a8ae0', '#a8ccf2', '#fff0d8'); S.fog = new THREE.Fog(0xf2e6d8, 110, 360);
  const lotT = ctex(1024, 1024, (c, w, h) => { const a = asphaltTex().image; c.drawImage(a, 0, 0, w / 2, h / 2); c.drawImage(a, w / 2, 0, w / 2, h / 2); c.drawImage(a, 0, h / 2, w / 2, h / 2); c.drawImage(a, w / 2, h / 2, w / 2, h / 2);
    c.strokeStyle = 'rgba(250,250,240,0.9)'; c.lineWidth = 6; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(60 + i * 64, 60); c.lineTo(60 + i * 64, 200); c.stroke(); }
    c.fillStyle = 'rgba(242,196,32,0.9)'; for (let x = 20; x < w; x += 70) c.fillRect(x, 560, 40, 8);
    c.strokeStyle = 'rgba(250,250,240,0.9)'; c.lineWidth = 8; c.strokeRect(700, 760, 200, 120); c.font = '900 60px Inter'; c.fillStyle = 'rgba(250,250,240,0.9)'; c.fillText('START', 710, 840); });
  box(S, [120, 0.3, 66], [0, -0.15, -3], std({ map: lotT, roughness: 0.9 }), { r: 0, cast: false, name: 'lot' });
  box(S, [600, 0.3, 600], [0, -0.35, -200], std({ map: (() => { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#6a9a48'; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.1, 4000); }); t.repeat.set(60, 60); return t; })() }), { r: 0, cast: false, solid: false });
  // building
  const bd = new THREE.Group(); bd.position.set(0, 0, -30); S.add(bd);
  put(bd, mesh(new THREE.BoxGeometry(44, 10, 12), tmat(plasterTex('#f2ead8'), 6, 2)), [0, 5, 0]); put(bd, mesh(rb(46, 1.0, 13, 0.1), M(0x2a5a9a)), [0, 10.4, 0]);
  for (let i = 0; i < 6; i++) put(bd, mesh(rb(4.4, 3.4, 0.2, 0.05), std({ color: 0x5a7a9a, roughness: 0.1, metalness: 0.5 })), [-19 + i * 7.6, 5, 6.05]);
  put(bd, mesh(rb(5.6, 6.4, 0.3, 0.05), std({ color: 0x4a6a8a, roughness: 0.05, metalness: 0.6 })), [0, 3.2, 6.1]);
  put(bd, mesh(rb(8, 0.4, 4, 0.1), M(0x2a5a9a)), [0, 7.0, 7.8]); for (const sx of [-1, 1]) put(bd, mesh(new THREE.CylinderGeometry(0.15, 0.15, 7, 8), M(0xdfe3ea, { metalness: 0.8 })), [sx * 3.6, 3.5, 9.4]);
  planeSign(S, signTex('DRIVING TEST CENTER', '#2a5a9a', '#ffffff', 1024, 128, 76, false), [20, 2.5], [-6, 12.6, -23.4]);
  put(S, mesh(rb(20.6, 2.9, 0.3, 0.1), M(0x2a5a9a)), [-6, 12.6, -23.7]);
  const wc = towerFace(S, { r: 2.4, glow: 0.4 }); wc.position.set(14, 12.6, -23.5); put(S, mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.5, 32), M(0x2a5a9a)), [14, 12.6, -23.8], [Math.PI / 2, 0, 0]);
  wc.set(8, 59);
  ghost(S, [44, 10, 12], [0, 5, -30], 'building');
  // flags
  const flags = []; for (const [x, c] of [[-26, 0xd8302a], [-29, 0x2a5a9a], [-32, 0xf2c420]]) { put(S, mesh(new THREE.CylinderGeometry(0.15, 0.2, 16, 8), M(0xdfe3ea, { metalness: 0.8 })), [x, 8, -20]);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0, 10, 2), M(c, { side: THREE.DoubleSide })); f.position.set(x + 1.7, 14.8, -20); S.add(f); flags.push(f); }
  // cones slalom + parking cones
  const cones = []; for (let i = 0; i < 10; i++) cones.push(cone(S, [-12 + i * 3, 2 + (i % 2 ? 0.6 : -0.6)], { name: 'cone' + i }));
  for (let i = 0; i < 6; i++) cones.push(cone(S, [22 + (i % 3) * 3, -6 - Math.floor(i / 3) * 6], { name: 'cone p' + i }));
  // test car
  const car = testCar(S, { col: 0x2a7ad8 }); car.position.set(-14, 0, 8);
  // fence + trees + lamp poles + gatehouse
  const fm = M(0x9aa0a8, { metalness: 0.6, roughness: 0.4 }); const fT = ctex(128, 128, (c, w, h) => { c.strokeStyle = '#c8ccd2'; c.lineWidth = 3; for (let i = -128; i < 256; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 128, h); c.stroke(); c.beginPath(); c.moveTo(i + 128, 0); c.lineTo(i, h); c.stroke(); } });
  fT.repeat.set(40, 2); const fenceMat = std({ map: fT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.5 });
  for (const [x, z, w, ry] of [[0, -36, 120, 0], [-60, -3, 66, Math.PI / 2], [60, -3, 66, Math.PI / 2]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(w, 4), fenceMat); f.position.set(x, 2, z); f.rotation.y = ry; S.add(f);
    for (let i = 0; i <= w / 6; i++) put(S, mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 6), fm), ry ? [x, 2.1, z - w / 2 + i * 6] : [x - w / 2 + i * 6, 2.1, z]); }
  for (let i = 0; i < 26; i++) { const Rr = rng(i + 70); const x = -90 + i * 7 + Rr() * 3, z = -44 - Rr() * 16; const tr = put(S, new THREE.Group(), [x, 0, z]); const h = 6 + Rr() * 4;
    put(tr, mesh(new THREE.CylinderGeometry(0.35, 0.5, h * 0.5, 8), M(0x5a3a22)), [0, h * 0.25, 0]); for (let k = 0; k < 4; k++) put(tr, mesh(new THREE.SphereGeometry(h * 0.28, 9, 7), std({ color: [0x4a9a3a, 0x3a8a3a, 0x5aa848][k % 3], roughness: 0.9, flatShading: true })), [Math.cos(k * 1.7) * 1.2, h * 0.65 + (k % 2), Math.sin(k * 1.7) * 1.0]); }
  for (const [x, z] of [[-40, -14], [40, -14], [-40, 18], [40, 18]]) { put(S, mesh(new THREE.CylinderGeometry(0.2, 0.3, 14, 8), M(0x5a5e66, { metalness: 0.5 })), [x, 7, z]); put(S, mesh(rb(3, 0.4, 1, 0.1), std({ color: 0xeeeeea, emissive: 0xfff6e0, emissiveIntensity: 0.3 })), [x + 1.2, 14, z]); }
  const gh = new THREE.Group(); gh.position.set(46, 0, 12); S.add(gh); put(gh, mesh(rb(5, 6, 5, 0.1), tmat(plasterTex('#f2ead8'), 1, 1)), [0, 3, 0]); put(gh, mesh(rb(6, 0.5, 6, 0.1), M(0x2a5a9a)), [0, 6.2, 0]);
  put(gh, mesh(rb(3, 2, 0.2, 0.05), std({ color: 0x5a7a9a, roughness: 0.1, metalness: 0.5 })), [-0.4, 3.6, 2.55]);
  const bar = put(S, new THREE.Group(), [42.5, 2.6, 8]); put(bar, mesh(new THREE.BoxGeometry(12, 0.35, 0.35), std({ map: ctex(256, 16, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#fff' : '#d8302a'; c.fillRect(i * 16, 0, 16, h); } }) })), [-6, 0, 0]);
  planeSign(S, signTex('TEST START · 9:00 AM', '#f2c420', '#1a1a1e', 512, 96, 48), [6, 1.1], [-22, 3.8, -6.8]); put(S, mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 6), M(0x5a5a5a)), [-22, 1.7, -6.95]);
  clouds(S, { y: [45, 80], z: [-110, -200], x: 220, size: 2.6 });
  const sun = new THREE.DirectionalLight(0xffe2b8, 3.2); sun.position.set(30, 40, 36); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 40, bottom: -30, near: 1, far: 170 }); sun.target.position.set(0, 0, -4); S.add(sun, sun.target);
  S.add(new THREE.HemisphereLight(0xcfe0ff, 0x6a6058, 1.0)); const fillL = new THREE.DirectionalLight(0xa8c0ff, 0.6); fillL.position.set(-30, 12, 40); S.add(fillL);
  const rimL = new THREE.DirectionalLight(0xffd0a0, 1.0); rimL.position.set(-20, 14, -40); S.add(rimL);
  return { cones, car, wallClock: wc, flags, bar, sun,
    update(t) { flags.forEach((f, i) => { const p = f.geometry.attributes.position; for (let j = 0; j < p.count; j++) { const x = p.getX(j) + 1.6; p.setZ(j, Math.sin(t * 5 + x * 1.8 + i) * 0.25 * x / 3.2); } p.needsUpdate = true; }); } };
}
