// Episode 018 kit (The Hand at Nine): a gingerbread village + the giant hand from the sky + the kitchen it all sits in.
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   gingerHouse(S, { name, w, d, h, style, col, roof, seed, deck, sign, lit })  gingerbread house; origin = centre of its footprint on the ground,
//       front wall at z = +d/2, ridge along x at y = h + d·0.42. style 'pretty' (icing swirls, gumdrops, peppermints, candy canes, lit candy windows),
//       'plain', 'ugly' (lumpy grey-green frosting, crooked chimney, broken cane), 'mayor' (lilac + roof sign NOT THIS ONE → .sign).
//       deck: a flat roof deck on the ridge (top y = .deckY, x ±3.6, z ±1.9, candy-cane rail) with the chimney at x +5.3 (x 4.4..6.2) (.chimney = local top centre).
//       .g (group: move/rotate/lift it) · .frost(k) silver frost over the roof (+ sparkles, call .update(t)) · .light(k) candy windows glow
//       · .scrape(k) bare patch on the front wall (icing scraped off) · .pretty(k) (ugly style only) cross-fades to a pretty dressing.
//   giantHand(S, { skin, sleeve, s })  blocky Roblox-style hand hanging down from a knitted holiday sleeve that runs up into the sky
//       (s 1: palm 9 wide; fingertips ≈ 15.5 below the wrist). .root (wrist; position it) · .grip(k) curls the fingers (0 open … 1 closed toward +z)
//       · .tipY() local y of the fingertips · .thumb · .fingers.
//   skyCrack(S, [x,y,z], { w, h })  a glowing seam in the night sky (faces +z; tilt it with .g.rotation.x) — .open(k), .g, .glowMat.
//   sugarStreet(S, { time: 'day'|'morning'|'dusk'|'night', frost, mini })  Sugarby main street: chocolate-cobble road along x (z -4..6), powdered-sugar
//       ground, houses along z -10 (fronts): BAKERY x -40 (20 wide, 13 tall, giant cupcake on top), FUDD (ugly) x -20, GUS (pretty, deck) x 0,
//       MAYOR x 20, two plain houses x 40 / 60 + a far row; camera-side row (fronts z 26, facing -z) for reverse shots; candy-cane lamps (z -6, x ±10 ±30);
//       gumdrop bushes, lollipop trees, licorice fences, whipped-cream hills, cotton-candy clouds; the MOON (never moves) at night.
//       env.houses { bakery, fudd, gus, mayor, h40, h60 } · env.moon · env.lamps (PointLights) · env.sun · env.key (face light) · env.update(t).
//   gingerParlor(S, { night })  inside Gus's house: walls x ±10, back z -9, ceiling 10, front wall z 13. Icing workbench back-left (top 2.8,
//       x -8.6..-2.6, z -8.6..-6.4: piping bags, icing bowls, gumdrop jars), fireplace back-right (x 6, glow env.fire), candy-glass windows,
//       front door on the right wall (x 10, z 2..6, env.door.open(k)), photo frames, rocking chair (6.4, 1.5) (seat top 1.7), rug, shelves of sprinkles.
//       Everything sits in env.g: env.tilt(deg, t) tilts the room (+ = right side up) and rattles the jars.
//   giantKitchen(S)  a real-size kitchen at night (walls x ±18, back z -16, ceiling 17, front wall z 22): dining table top 3.0 (x ±7.5, z -7..1) with the whole
//       gingerbread village on a cake board at (0, 3.0, -3) scaled VILLAGE_S (Gus's house = env.mini.gus at board-local (0, 0, 0)); round pendant lamp = "the moon"
//       (env.lamp, globe centre (0, 11.5, -3)); coffee maker with steam on the back counter, window with snow, fridge, string lights; plates + forks,
//       env.plate (the mayor's house on a plate at (4.2, 3.0, -5.4), half eaten), milk glasses. Stand behind the table at z ≤ -9.2.
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
const M = (col, o = {}) => std({ color: col, roughness: 0.6, ...o });
const rb = (w, h, d, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const clamp01 = x => Math.max(0, Math.min(1, x));
const hex = c => '#' + new THREE.Color(c).getHexString();
const CANDY = [0xff3a6a, 0x3ad8a8, 0xffd23a, 0x9a5aff, 0xff8a2a, 0x3aa8ff];

// ---------- textures ----------
const gingerTex = (col = 0xb8692e) => once('gb' + col, () => ctex(512, 512, (c, w, h) => {
  const base = new THREE.Color(col); c.fillStyle = hex(base); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { const k = 0.82 + Math.random() * 0.3; c.fillStyle = hex(base.clone().multiplyScalar(k)); c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 8, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(60,25,5,0.35)'; for (let i = 0; i < 400; i++) { c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 1.2, 0, 7); c.fill(); }   // docking holes
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(70,30,5,0.0)'); g.addColorStop(1, 'rgba(70,30,5,0.18)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  noiseFill(c, w, h, 0.06, 2500); }));
const icingRoofTex = () => once('ir', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#fbf8f2'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 64) for (let x = (y / 64 % 2) * 32; x < w + 32; x += 64) { c.strokeStyle = 'rgba(180,170,160,0.45)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y + 64, 32, Math.PI, 0); c.stroke(); }
  for (let i = 0; i < 90; i++) { c.fillStyle = hex(CANDY[i % 6]); c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 5, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.04, 1500); }));
const uglyRoofTex = () => once('ur', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#8a9a7a'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { c.fillStyle = ['#7a8a6a', '#9aa08a', '#6a6a5a', '#a89a7a'][i % 4]; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 8 + Math.random() * 16, Math.random() * 3, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.1, 3000); }));
const frostTex = () => once('fr', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#c8d4e8'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { const a = Math.random(); c.fillStyle = `rgba(255,255,255,${0.4 + a * 0.6})`; const s = 1 + a * 3; c.fillRect(Math.random() * w, Math.random() * h, s, s); }
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.5; for (let i = 0; i < 60; i++) { const x = Math.random() * w, y = Math.random() * h; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); c.stroke(); } } }));
const chocTex = () => once('ch', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#4a2614'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 2; x++) { c.fillStyle = '#5a3018'; c.fillRect(x * 128 + 10, y * 64 + 8, 108, 48); c.fillStyle = 'rgba(255,220,180,0.12)'; c.fillRect(x * 128 + 10, y * 64 + 8, 108, 6); } }));
const cobbleTex = () => once('cb', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#3a1e10'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 42) for (let x = ((y / 42) % 2) * 30 - 30; x < w; x += 60) { const k = 0.8 + Math.random() * 0.35; c.fillStyle = hex(new THREE.Color(0x6a3a1e).multiplyScalar(k)); c.beginPath(); c.roundRect(x + 3, y + 3, 54, 36, 10); c.fill();
    c.fillStyle = 'rgba(255,230,200,0.10)'; c.fillRect(x + 8, y + 6, 40, 5); }
  for (let i = 0; i < 200; i++) { c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }));
const sugarTex = () => once('sg', () => ctex(512, 512, (c, w, h) => { c.fillStyle = '#f6f2f4'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(220,210,230,0.6)' : 'rgba(255,255,255,0.9)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  for (let i = 0; i < 70; i++) { c.fillStyle = hex(CANDY[i % 6]); c.fillRect(Math.random() * w, Math.random() * h, 6, 2.5); } }));
const stripeTex = (a = '#ffffff', b = '#e8203a') => once('st' + a + b, () => ctex(128, 128, (c, w, h) => { c.fillStyle = a; c.fillRect(0, 0, w, h); c.fillStyle = b;
  for (let i = -128; i < 256; i += 40) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 18, 0); c.lineTo(i + 18 + 64, h); c.lineTo(i + 64, h); c.fill(); } }));
const mintTex = (col = '#e8203a') => once('mint' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill();
  c.fillStyle = col; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(128, 128); c.arc(128, 128, 120, i * Math.PI / 4, i * Math.PI / 4 + 0.32); c.fill(); } }));
const knitTex = (col = '#c8202a') => once('kn' + col, () => ctex(512, 512, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h);
  const dk = hex(new THREE.Color(col).multiplyScalar(0.75)); c.strokeStyle = dk; c.lineWidth = 3;
  for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8, y + 10); c.lineTo(x + 16, y); c.stroke(); }
  c.fillStyle = '#f6f2ea'; for (const yy of [60, 300]) { c.fillRect(0, yy, w, 14); c.fillRect(0, yy + 110, w, 14);
    for (let x = 32; x < w; x += 96) { const cx = x, cy = yy + 62; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.save(); c.translate(cx, cy); c.rotate(a); c.fillRect(-3, 0, 6, 32); c.restore(); } } }
  noiseFill(c, w, h, 0.05, 2000); }));
const signTex = (text, bg = '#fff6e8', fg = '#c8203a', w = 512, h = 160, font = 84) => ctex(w, h, (c) => { c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 26); c.fill();
  c.strokeStyle = fg; c.lineWidth = 10; c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 20); c.stroke(); c.font = `900 ${font}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fg; c.fillText(text, w / 2, h / 2 + 4); });
const skyTex = (top, mid, bot) => { const t = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, w, h); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };

// ---------- small candy props ----------
function gumdrop(parent, [x, y, z], col, r = 0.5) { const m = mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: col, roughness: 0.25, emissive: col, emissiveIntensity: 0.08 })); m.scale.y = 1.25; return put(parent, m, [x, y, z]); }
function candyCane(parent, [x, z], h = 4, { y = 0, ry = 0, broken = false, s = 1 } = {}) { const g = put(parent, new THREE.Group(), [x, y, z], [0, ry, 0]); g.scale.setScalar(s); const m = std({ map: stripeTex(), roughness: 0.3 });
  put(g, mesh(new THREE.CylinderGeometry(0.22, 0.22, h, 12), m), [0, h / 2, 0]); if (!broken) put(g, mesh(new THREE.TorusGeometry(0.55, 0.22, 10, 16, Math.PI), m), [0.55, h, 0]); else g.rotation.z = 0.35; return g; }
function lollipop(parent, [x, z], h = 6, col = 0xff3a6a, s = 1) { const g = put(parent, new THREE.Group(), [x, 0, z]); g.scale.setScalar(s); put(g, mesh(new THREE.CylinderGeometry(0.16, 0.16, h, 8), M(0xf8f8f8)), [0, h / 2, 0]);
  put(g, mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 32), std({ map: mintTex(hex(col)), roughness: 0.25 })), [0, h + 1.4, 0], [Math.PI / 2, 0, 0]); return g; }
function swirl(parent, [x, y, z], r = 0.6, col = 0xfbf8f2) { const g = put(parent, new THREE.Group(), [x, y, z]); const m = M(col, { roughness: 0.4 });
  for (let i = 0; i < 3; i++) put(g, mesh(new THREE.TorusGeometry(r * (1 - i * 0.3), 0.09, 8, 24, Math.PI * 1.6), m, false), [0, 0, 0.02], [0, 0, i * 1.3]); return g; }
function peppermint(parent, [x, y, z], r = 0.7, col = '#e8203a') { return put(parent, mesh(new THREE.CylinderGeometry(r, r, 0.2, 28), std({ map: mintTex(col), roughness: 0.3 }), false), [x, y, z], [Math.PI / 2, 0, 0]); }
function scallops(parent, from, to, n, r = 0.32, col = 0xfbf8f2) { const m = M(col, { roughness: 0.35 }); const geo = new THREE.SphereGeometry(r, 10, 8);
  for (let i = 0; i <= n; i++) { const u = i / n; put(parent, mesh(geo, m, false), [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, from[2] + (to[2] - from[2]) * u]); } }
function gumdropBush(parent, [x, z], s = 1, col = 0x3ad8a8) { const g = put(parent, new THREE.Group(), [x, 0, z]); for (let i = 0; i < 4; i++) gumdrop(g, [Math.cos(i * 1.9) * 0.8 * s, 0, Math.sin(i * 1.9) * 0.6 * s], CANDY[(i + Math.round(col % 5)) % 6], (0.6 + (i % 2) * 0.3) * s); return g; }

// ---------- gingerbread house ----------
export function gingerHouse(S, { name = 'house', w = 12, d = 10, h = 8, style = 'pretty', col = 0xb8692e, seed = 1, deck = false, lit = 0.25 } = {}) {
  const R = rng(seed); const g = new THREE.Group(); S.add(g); const rh = d * 0.42, ov = 0.9;
  const ugly = style === 'ugly'; const wallCol = ugly ? 0x8a6a4a : style === 'mayor' ? 0xc0885a : col;
  const wm = tmat(gingerTex(wallCol), w / 8, h / 8);
  const walls = box(g, [w, h, d], [0, h / 2, 0], wm, { r: 0.15, name: name + ' walls' });
  // gables
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, rh); sh.lineTo(-w / 2, 0);
  for (const sz of [-1, 1]) { const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }); const gm = put(g, mesh(ge, wm), [0, h, 0]); gm.rotation.y = Math.PI / 2; gm.position.set(sz * (w / 2 - 0.3) + (sz < 0 ? 0.3 : 0), h, 0);
    // the shape is in the x-y plane; rotated 90° it spans z — redo: gables are on the ±x ends, so the shape must span z
    gm.geometry.dispose(); const sh2 = new THREE.Shape(); sh2.moveTo(-d / 2, 0); sh2.lineTo(d / 2, 0); sh2.lineTo(0, rh); sh2.lineTo(-d / 2, 0); gm.geometry = new THREE.ExtrudeGeometry(sh2, { depth: 0.3, bevelEnabled: false }); gm.position.set(sz > 0 ? w / 2 - 0.3 : -w / 2, h, 0); }
  // roof slabs (ridge along x)
  const sl = Math.hypot(d / 2 + ov, rh * (1 + ov / (d / 2))); const ang = Math.atan2(rh, d / 2);
  const roofMat = ugly ? tmat(uglyRoofTex(), 2, 1) : tmat(icingRoofTex(), w / 7, 1, { roughness: 0.5 });
  const prettyRoof = ugly ? tmat(icingRoofTex(), w / 7, 1, { roughness: 0.5 }) : null;
  const frostMat = std({ map: frostTex(), color: 0xffffff, roughness: 0.25, metalness: 0.55, transparent: true, opacity: 0, emissive: 0x8090b0, emissiveIntensity: 0.25, depthWrite: false });
  const roof = new THREE.Group(); g.add(roof);
  for (const sz of [-1, 1]) { const s = put(roof, mesh(new THREE.BoxGeometry(w + ov * 2, 0.5, sl), roofMat), [0, h + rh / 2 - 0.1, sz * (d / 4 + ov / 2 - 0.1)]); s.rotation.x = sz * ang;
    const f = put(roof, mesh(new THREE.BoxGeometry(w + ov * 2 + 0.05, 0.08, sl + 0.05), frostMat, false), [0, 0.3, 0]); s.add(f); f.position.set(0, 0.29, 0); f.rotation.set(0, 0, 0);
    // icing drips along the eave
    if (!ugly) scallops(g, [-w / 2 - ov, h - 0.35 - ov * Math.tan(ang) * 0.9, sz * (d / 2 + ov * 0.95)], [w / 2 + ov, h - 0.35 - ov * Math.tan(ang) * 0.9, sz * (d / 2 + ov * 0.95)], Math.round(w * 1.6), 0.3); }
  if (ugly) roof.rotation.z = 0.05;
  // ridge
  const ridgeY = h + rh + 0.15;
  if (!ugly) for (let x = -w / 2; x <= w / 2 + 0.01; x += 1.5) if (!deck || Math.abs(x) > 3.9) gumdrop(g, [x, ridgeY - 0.1, 0], CANDY[Math.floor(R() * 6)], 0.45);
  // chimney
  const chX = deck ? 5.3 : w * 0.28; const chMat = ugly ? M(0x6a6a5a) : tmat(gingerTex(0x9a5424), 0.4, 0.6);
  const chim = box(g, [1.8, 3.6, 1.8], [chX, ridgeY + 0.9, ugly ? -1 : 0], chMat, { r: 0.1, name: name + ' chimney' }); if (ugly) chim.rotation.z = -0.2;
  if (!ugly) scallops(g, [chX - 1, ridgeY + 2.75, 1.0], [chX + 1, ridgeY + 2.75, 1.0], 5, 0.25);
  // deck on the ridge
  let deckY = 0; if (deck) { deckY = ridgeY + 0.3; box(g, [7.4, 0.5, 4.2], [0, deckY - 0.25, 0], tmat(chocTex(), 2, 1), { r: 0.1, name: name + ' deck', solid: false });
    box(g, [7.4, 1.4, 4.2], [0, deckY - 1.0, 0], wm, { r: 0.05, solid: false });
    for (const [x, z] of [[-3.5, 1.9], [3.5, 1.9], [-3.5, -1.9], [3.5, -1.9], [0, -1.9]]) { candyCane(g, [x, z], 1.7, { y: deckY, s: 0.8, ry: R() * 3 }); }
    for (const z of [1.9, -1.9]) put(g, mesh(new THREE.CylinderGeometry(0.1, 0.1, 7.0, 8), std({ map: stripeTex('#ffffff', '#2aa86a'), roughness: 0.3 })), [0, deckY + 1.3, z], [0, 0, Math.PI / 2]);
    // roof hatch Clove climbs out of
    put(g, mesh(rb(1.8, 0.2, 1.4, 0.05), M(0x5a3018)), [-1.2, deckY + 0.05, -0.6]); }
  // door
  const door = put(g, mesh(rb(2.4, 4.2, 0.3, 0.08), std({ map: chocTex(), roughness: 0.45 })), [0, 2.1, d / 2 + 0.1]);
  put(g, mesh(new THREE.SphereGeometry(0.16, 10, 8), M(0xf2c420, { metalness: 0.8, roughness: 0.3 })), [0.85, 2.1, d / 2 + 0.3]);
  if (!ugly) { const ar = put(g, mesh(new THREE.TorusGeometry(1.35, 0.14, 8, 24, Math.PI), M(0xfbf8f2, { roughness: 0.4 }), false), [0, 4.2, d / 2 + 0.2]); }
  // windows (candy glass)
  const winCols = style === 'mayor' ? [0xb88aff, 0xb88aff] : ugly ? [0x6a7a5a, 0x6a7a5a] : [0xff5a6a, 0x5ae8a8, 0xffd84a, 0x6ab8ff];
  const glassMats = []; const wins = []; const wx = [-w * 0.3, w * 0.3];
  for (let i = 0; i < 2; i++) { const c = winCols[i % winCols.length]; const gm = std({ color: c, emissive: c, emissiveIntensity: lit, roughness: 0.15, metalness: 0.1 }); glassMats.push(gm);
    const wn = put(g, mesh(new THREE.BoxGeometry(2.2, 2.4, 0.12), gm, false), [wx[i], h * 0.55, d / 2 + 0.06]); wins.push(wn);
    if (!ugly) { const fm = M(0xfbf8f2, { roughness: 0.4 }); for (const [ww, hh, ox, oy] of [[2.6, 0.22, 0, 1.3], [2.6, 0.22, 0, -1.3], [0.22, 2.6, 1.2, 0], [0.22, 2.6, -1.2, 0], [0.12, 2.4, 0, 0], [2.2, 0.12, 0, 0]]) put(g, mesh(new THREE.BoxGeometry(ww, hh, 0.12), fm, false), [wx[i] + ox, h * 0.55 + oy, d / 2 + 0.14]); }
    else { put(g, mesh(new THREE.BoxGeometry(2.6, 0.5, 0.2), M(0x4a4a3a)), [wx[i], h * 0.55 + 1.1, d / 2 + 0.15], [0, 0, (i ? -0.2 : 0.15)]); } }
  // side windows too (visible from 3/4 angles)
  for (const sx of [-1, 1]) { const c = winCols[(sx + 1) % winCols.length]; const gm = std({ color: c, emissive: c, emissiveIntensity: lit, roughness: 0.15 }); glassMats.push(gm); put(g, mesh(new THREE.BoxGeometry(0.12, 2.2, 2.0), gm, false), [sx * (w / 2 + 0.06), h * 0.55, 0]); }
  // dressing
  const deco = new THREE.Group(); g.add(deco); const uglyBits = new THREE.Group(); g.add(uglyBits);
  if (style === 'pretty' || style === 'plain' || style === 'mayor') {
    candyCane(deco, [-2.0, d / 2 + 0.8], 4.6); candyCane(deco, [2.0, d / 2 + 0.8], 4.6, { ry: Math.PI });
    if (style !== 'plain') { for (const x of [-w / 2 + 0.9, w / 2 - 0.9]) for (let y = 1.2; y < h - 0.5; y += 1.6) gumdrop(deco, [x, y, d / 2 + 0.1], CANDY[Math.floor(R() * 6)], 0.32).rotation.x = Math.PI / 2;
      peppermint(deco, [-w * 0.3, h * 0.55 - 2.1, d / 2 + 0.15], 0.5); peppermint(deco, [w * 0.3, h * 0.55 - 2.1, d / 2 + 0.15], 0.5, '#2aa86a'); }
    if (style === 'pretty') { for (const [x, y] of [[-w * 0.3, h * 0.88], [w * 0.3, h * 0.88], [-w * 0.15, 1.1], [w * 0.15, 1.1], [0, h * 0.9]]) swirl(deco, [x, y, d / 2 + 0.12], 0.55);
      scallops(deco, [-w / 2, 0.35, d / 2 + 0.12], [w / 2, 0.35, d / 2 + 0.12], Math.round(w * 2), 0.22, 0xff9ac8);
      for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) scallops(deco, [x, 0.3, d / 2 + 0.12], [x, h - 0.2, d / 2 + 0.12], Math.round(h * 2), 0.18);
      lollipop(deco, [-w / 2 - 1.6, d / 2 + 1.6], 4.6, 0xff3a6a, 0.8); gumdropBush(deco, [w / 2 + 1.3, d / 2 + 1.0], 1); gumdropBush(deco, [-w / 2 + 0.6, d / 2 + 1.8], 0.8, 3);
      // gable swirl window
      for (const sx of [-1, 1]) peppermint(deco, [sx * (w / 2 + 0.2), h + rh * 0.4, 0], 0.8, sx > 0 ? '#e8203a' : '#2aa86a').rotation.set(0, 0, Math.PI / 2); }
  }
  if (ugly) { const lm = [M(0x7a8a6a, { roughness: 0.9 }), M(0x9a9a82, { roughness: 0.9 }), M(0x5a5a48, { roughness: 0.9 })];
    for (let i = 0; i < 46; i++) { const b = put(uglyBits, mesh(new THREE.SphereGeometry(0.35 + R() * 0.55, 8, 6), lm[i % 3]), [(R() - 0.5) * w, 0.4 + R() * (h - 0.6), d / 2 + 0.05]); b.scale.z = 0.4; }
    for (let i = 0; i < 12; i++) { const b = put(uglyBits, mesh(new THREE.SphereGeometry(0.5 + R() * 0.6, 8, 6), lm[i % 3]), [(R() - 0.5) * w, h + 0.4 + R() * rh * 0.5, (R() - 0.5) * d]); b.scale.y = 0.5; }
    candyCane(uglyBits, [-2.0, d / 2 + 0.8], 2.2, { broken: true }); put(uglyBits, mesh(new THREE.BoxGeometry(1.2, 1.6, 0.1), M(0x3a3a2a)), [-w * 0.3 + 0.5, h * 0.55 - 0.4, d / 2 + 0.2], [0, 0, 0.6]);
    // a 'pretty' dressing hidden underneath for the callback (pretty(k))
    const pd = new THREE.Group(); g.add(pd); pd.visible = false; candyCane(pd, [-2.0, d / 2 + 0.8], 4.6); candyCane(pd, [2.0, d / 2 + 0.8], 4.6, { ry: Math.PI });
    for (const [x, y] of [[-w * 0.3, h * 0.88], [w * 0.3, h * 0.88], [0, h * 0.9]]) swirl(pd, [x, y, d / 2 + 0.12], 0.55); scallops(pd, [-w / 2, 0.35, d / 2 + 0.12], [w / 2, 0.35, d / 2 + 0.12], Math.round(w * 2), 0.22, 0xffd23a);
    for (let x = -w / 2; x <= w / 2 + 0.01; x += 1.5) gumdrop(pd, [x, ridgeY - 0.1, 0], CANDY[Math.floor(R() * 6)], 0.45);
    for (let i = 0; i < 10; i++) gumdrop(pd, [(R() - 0.5) * (w - 1), 0.8 + R() * (h - 1.6), d / 2 + 0.1], CANDY[i % 6], 0.3).rotation.x = Math.PI / 2;
    g.userData.prettyDeco = pd; }
  // mayor's roof sign
  let sign = null; if (style === 'mayor') { sign = put(g, new THREE.Group(), [0, ridgeY + 0.2, 0.6]); const sw = 7.2;
    const pl = put(sign, new THREE.Mesh(new THREE.PlaneGeometry(sw, sw * 160 / 512), std({ map: signTex('NOT THIS ONE', '#fff6e8', '#c8203a', 512, 160, 54), roughness: 0.6 })), [0, 2.6, 0.08]); pl.castShadow = true;
    put(sign, mesh(rb(sw + 0.3, sw * 160 / 512 + 0.3, 0.12, 0.05), M(0x6a3aa8)), [0, 2.6, 0]);
    for (const sx of [-1, 1]) put(sign, mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 8), M(0x3a2a1a)), [sx * 2.6, 0.9, 0]); }
  // scrape patch (front wall, right of the door): bare dull cookie where the icing came off
  const scr = put(g, new THREE.Mesh(new THREE.CircleGeometry(1.2, 20), std({ color: 0x8a4a1e, roughness: 1, transparent: true, opacity: 0 })), [w * 0.3, h * 0.55 - 1.9, d / 2 + 0.25]);
  // sparkles for the frost
  const spN = 40, spGeo = new THREE.BufferGeometry(), spPos = new Float32Array(spN * 3); const spBase = [];
  for (let i = 0; i < spN; i++) { const x = (R() - 0.5) * (w + 1), zz = (R() - 0.5) * (d + 1); const y = ridgeY - Math.abs(zz) / (d / 2) * rh + 0.5; spBase.push([x, y, zz, R() * 6]); }
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  const spMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const sp = new THREE.Points(spGeo, spMat); g.add(sp); sp.frustumCulled = false;
  let frostK = 0;
  const env = { g, walls, roof, door, sign, deco, wins, ridgeY, deckY, w, d, h, rh, chimney: new THREE.Vector3(chX, ridgeY + 2.7, 0), chim,
    frost(k) { frostK = k; frostMat.opacity = 0.9 * k; spMat.opacity = k; },
    light(k) { glassMats.forEach(m => m.emissiveIntensity = k); },
    scrape(k) { scr.material.opacity = clamp01(k); scr.scale.setScalar(0.3 + 0.7 * clamp01(k)); },
    pretty(k) { if (!ugly) return; g.userData.prettyDeco.visible = k > 0.5; uglyBits.visible = k <= 0.5; if (k > 0.5) { wm.color.setHex(0xffffff); roof.children.forEach(o => { if (o.material === roofMat) o.material = prettyRoof; }); roof.rotation.z = 0; chim.rotation.z = 0; chim.material = tmat(gingerTex(0x9a5424), 0.4, 0.6); } },
    update(t) { for (let i = 0; i < spN; i++) { const [x, y, z, ph] = spBase[i]; const a = Math.max(0, Math.sin(t * 3 + ph)); spPos[i * 3] = x; spPos[i * 3 + 1] = y + a * 0.15; spPos[i * 3 + 2] = z; }
      spGeo.attributes.position.needsUpdate = true; spMat.size = 0.25 + 0.2 * Math.abs(Math.sin(t * 5)); } };
  if (ugly) wm.color.setHex(0xc8c0a8);
  return env;
}

// ---------- the giant hand ----------
export function giantHand(S, { skin = 0xf2c8a0, sleeve = '#c8202a', s = 1, name = 'hand' } = {}) {
  const root = new THREE.Group(); S.add(root); const g = new THREE.Group(); root.add(g); g.scale.setScalar(s);
  const sk = std({ color: skin, roughness: 0.55 });
  const palm = put(g, mesh(rb(9, 8.5, 3.2, 0.9), sk), [0, -4.25, 0]);
  const fingers = []; for (let i = 0; i < 4; i++) { const p = put(g, new THREE.Group(), [-3.3 + i * 2.2, -8.3, 0]); const L = 6.2 - Math.abs(i - 1.5) * 0.5;
    const seg1 = put(p, mesh(rb(1.95, L * 0.55, 2.6, 0.7), sk), [0, -L * 0.27, 0]); const j = put(p, new THREE.Group(), [0, -L * 0.52, 0]); put(j, mesh(rb(1.9, L * 0.5, 2.5, 0.7), sk), [0, -L * 0.24, 0]);
    put(j, mesh(rb(1.3, 0.12, 0.9, 0.05), std({ color: 0xffd8d8, roughness: 0.3 })), [0, -L * 0.4, 1.27]);   // fingernail (back of the hand = +z; fingers curl toward -z)
    fingers.push({ p, j, L }); }
  const thumb = put(g, new THREE.Group(), [4.6, -3.2, 0.6]); put(thumb, mesh(rb(2.2, 5.2, 2.6, 0.8), sk), [0.6, -2.4, 0]); thumb.rotation.z = 0.5;
  const kn = std({ map: knitTex(sleeve), roughness: 0.95 }); const knT = kn.map.clone(); knT.repeat.set(2, 10); knT.needsUpdate = true; kn.map = knT;
  put(g, mesh(rb(11, 3.2, 5.6, 1.2), std({ color: 0xf6f2ea, roughness: 0.95 })), [0, 1.4, 0]);  // cuff
  const slv = put(g, mesh(new THREE.BoxGeometry(11.6, 160, 6.2), kn, false), [0, 82.5, 0]);
  const tag = box(g, [9, 15.5, 3.2], [0, -7.8, 0], basic(0, { visible: false }), { r: 0, cast: false, name, solid: false });
  const hl = new THREE.PointLight(0xffe8d0, 60, 40, 1.5); hl.position.set(0, -4, 14); g.add(hl);   // keeps the hand readable against the bright crack
  return { root, g, fingers, thumb, palm, sleeve: slv,
    grip(k) { fingers.forEach((f, i) => { const kk = clamp01(k * (1 + i * 0.06)); f.p.rotation.x = kk * 1.15; f.j.rotation.x = kk * 1.25; }); thumb.rotation.x = k * 0.9; thumb.rotation.z = 0.5 - k * 0.2; },
    tipY() { return -8.3 - 6.2; } };
}

// ---------- the crack in the sky ----------
export function skyCrack(S, [x, y, z], { w = 60, h = 10, col = 0xfff2d0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  const sh = new THREE.Shape(); const n = 14, R = rng(5); sh.moveTo(-w / 2, 0);
  for (let i = 1; i < n; i++) sh.lineTo(-w / 2 + w * i / n, h / 2 * (0.5 + R() * 0.6) * Math.sin(Math.PI * i / n));
  sh.lineTo(w / 2, 0); for (let i = n - 1; i > 0; i--) sh.lineTo(-w / 2 + w * i / n, -h / 2 * (0.5 + R() * 0.6) * Math.sin(Math.PI * i / n));
  const glowMat = basic(col, { transparent: true, opacity: 1, fog: false }); const core = put(g, new THREE.Mesh(new THREE.ShapeGeometry(sh), glowMat), [0, 0, 0]);
  const halo = put(g, new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, h * 4), new THREE.MeshBasicMaterial({ fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    map: ctex(256, 128, (c, ww, hh) => { const gr = c.createRadialGradient(ww / 2, hh / 2, 4, ww / 2, hh / 2, hh / 2); gr.addColorStop(0, 'rgba(255,230,180,0.85)'); gr.addColorStop(1, 'rgba(255,200,140,0)'); c.save(); c.scale(2, 1); c.fillStyle = gr; c.fillRect(0, 0, ww, hh); c.restore(); }) })), [0, 0, -0.5]);
  const light = new THREE.SpotLight(0xffe8c0, 0, 260, 0.42, 0.6, 1.1); light.position.set(x, y - 2, z); light.target.position.set(x, 0, z + 40); S.add(light, light.target);
  core.scale.set(0.001, 0.001, 1); halo.material.opacity = 0;
  return { g, glowMat, light, core, halo, open(k, power = 900) { const kk = clamp01(k); core.scale.set(0.15 + 0.85 * kk, Math.max(0.001, kk), 1); halo.material.opacity = kk; light.intensity = kk * power; g.visible = kk > 0.002; } };
}

// ---------- the village row (shared by the street and the mini model on the kitchen table) ----------
function village(P, { time = 'day', mini = false } = {}) {
  const lit = time === 'night' ? 1.3 : time === 'dusk' ? 0.7 : 0.15;
  const houses = {};
  const mk = (key, x, opts) => { const H = gingerHouse(P, { name: key, lit, ...opts }); H.g.position.set(x, 0, -10 - H.d / 2); houses[key] = H; return H; };
  mk('fudd', -20, { style: 'ugly', w: 11, h: 7.5, seed: 3 });
  mk('gus', 0, { style: 'pretty', w: 12, h: 8, deck: true, seed: 5 });
  mk('mayor', 20, { style: 'mayor', w: 12, h: 8.5, seed: 7 });
  mk('h40', 40, { style: 'plain', w: 11, h: 7.5, col: 0xa8602a, seed: 9 });
  mk('h60', 60, { style: 'pretty', w: 12, h: 8, col: 0xc07032, seed: 11 });
  mk('h80', 80, { style: 'plain', w: 11, h: 8, col: 0xb06a30, seed: 13 });
  mk('hm40', -62, { style: 'plain', w: 11, h: 7, col: 0xa85a2a, seed: 15 });
  // bakery (big)
  const bk = new THREE.Group(); bk.position.set(-41, 0, -20); P.add(bk); const bm = tmat(gingerTex(0xc8783a), 3, 2);
  box(bk, [20, 13, 18], [0, 6.5, 0], bm, { r: 0.2, name: 'bakery' }); box(bk, [21, 1.0, 19], [0, 13.4, 0], M(0xfbf8f2, { roughness: 0.4 }), { r: 0.4, solid: false });
  scallops(bk, [-10.5, 12.7, 9.6], [10.5, 12.7, 9.6], 34, 0.45, 0xff9ac8);
  const cup = put(bk, new THREE.Group(), [0, 13.9, 0]); put(cup, mesh(new THREE.CylinderGeometry(4.6, 3.6, 4.4, 24), std({ map: stripeTex('#ff9ac8', '#ffffff'), roughness: 0.5 })), [0, 2.2, 0]);
  put(cup, mesh(new THREE.SphereGeometry(5.0, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(0xfff0f6, { roughness: 0.4 })), [0, 4.3, 0]).scale.y = 0.9; put(cup, mesh(new THREE.SphereGeometry(1.1, 16, 12), M(0xd8102a, { roughness: 0.2 })), [0, 9.0, 0]);
  put(bk, new THREE.Mesh(new THREE.PlaneGeometry(12, 12 * 160 / 512), std({ map: signTex("FUDD'S BAKERY", '#fff6e8', '#7a3a1a', 512, 160, 58), roughness: 0.6 })), [0, 10.6, 9.06]);
  put(bk, mesh(rb(3.6, 5.6, 0.3, 0.1), std({ map: chocTex() })), [0, 2.8, 9.1]);
  for (const x of [-6.5, 6.5]) put(bk, mesh(new THREE.BoxGeometry(4.2, 3.6, 0.15), std({ color: 0xffd8a0, emissive: 0xffc070, emissiveIntensity: lit, roughness: 0.2 }), false), [x, 4.4, 9.05]);
  for (const x of [-6.5, 6.5]) put(bk, mesh(rb(5.2, 0.5, 1.6, 0.2), std({ map: stripeTex('#ffffff', '#ff5a8a'), roughness: 0.5 })), [x, 6.6, 9.6], [0.4, 0, 0]);
  houses.bakery = { g: bk };
  // far row behind
  for (let i = 0; i < 9; i++) { const H = gingerHouse(P, { name: 'far' + i, style: i % 3 ? 'plain' : 'pretty', w: 10, h: 7 + (i % 3), col: [0xb8692e, 0xa8602a, 0xc07a3a][i % 3], seed: 30 + i, lit }); H.g.position.set(-70 + i * 18 + (i % 2) * 4, 0, -42 - (i % 2) * 6); H.g.rotation.y = (i % 2 ? 0.2 : -0.15); }
  // camera-side row (reverse shots), facing -z
  for (let i = 0; i < 6; i++) { const H = gingerHouse(P, { name: 'rev' + i, style: i % 2 ? 'plain' : 'pretty', w: 11, h: 7.5, col: [0xb06a30, 0xc07032][i % 2], seed: 60 + i, lit }); H.g.position.set(-45 + i * 18, 0, 31); H.g.rotation.y = Math.PI; }
  // street dressing
  const fence = std({ color: 0x1a1a1e, roughness: 0.35 });
  for (const [x0, x1] of [[-33, -27], [-13, -7], [7, 13], [27, 33], [47, 53]]) { for (let x = x0; x <= x1; x += 1.5) put(P, mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 8), fence), [x, 1.0, -9.2]);
    put(P, mesh(new THREE.CylinderGeometry(0.15, 0.15, x1 - x0, 8), fence), [(x0 + x1) / 2, 1.6, -9.2], [0, 0, Math.PI / 2]); }
  for (const [x, z, c] of [[-30, -8, 0], [-11, -8, 2], [11, -7.6, 4], [31, -8, 1], [51, -8, 3], [-50, -7, 5]]) gumdropBush(P, [x, z], 1, c);
  for (const [x, z, c] of [[-52, -14, 0xff3a6a], [-29, -26, 0x3ad8a8], [-9.5, -26, 0xffd23a], [10, -25, 0x9a5aff], [29.5, -26, 0xff8a2a], [50, -26, 0x3aa8ff]]) lollipop(P, [x, z], 7 + (Math.abs(x) % 3), c, 1.1);
  return houses;
}

// ---------- Sugarby street ----------
export function sugarStreet(S, { time = 'day', frost = 0 } = {}) {
  const night = time === 'night', dusk = time === 'dusk', morning = time === 'morning';
  S.background = night ? skyTex('#060a24', '#1a1840', '#3a2a5a') : dusk ? skyTex('#3a3a8a', '#d86a8a', '#ffc08a') : morning ? skyTex('#7ab0e8', '#ffd0d8', '#fff0e0') : skyTex('#5aa0f0', '#a8d4ff', '#ffeef6');
  S.fog = new THREE.Fog(night ? 0x1a1838 : dusk ? 0xe8a0a0 : 0xffe8f2, night ? 70 : 90, night ? 240 : 320);
  if (night) S.userData.look = 'night';
  // ground: powdered sugar + chocolate cobble road + sugar-cube kerbs
  box(S, [700, 0.3, 700], [0, -0.16, -150], tmat(sugarTex(), 90, 90), { r: 0, cast: false, solid: false, name: 'ground' });
  box(S, [400, 0.12, 10], [0, 0.0, 1], tmat(cobbleTex(), 40, 1, { roughness: 0.4 }), { r: 0, cast: false, solid: false, name: 'road' });
  for (const z of [-4.3, 6.3]) box(S, [400, 0.4, 0.6], [0, 0.1, z], M(0xfbf8f2, { roughness: 0.3 }), { r: 0.1, cast: false, solid: false });
  const houses = village(S, { time });
  // candy-cane lamp posts
  const lamps = []; const lampBulbs = [];
  for (const x of [-30, -10, 10, 30]) { const g = candyCane(S, [x, -6], 9, { s: 1 }); const b = put(S, new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), basic(night || dusk ? 0xfff0c8 : 0xf8f0e0)), [x + 1.1, 8.3, -6]); lampBulbs.push(b);
    if (night || dusk) { const l = new THREE.PointLight(0xffd8a0, night ? 70 : 30, 22, 1.6); l.position.set(x + 1.1, 7.6, -5.4); S.add(l); lamps.push(l); } }
  // whipped-cream hills + cotton-candy clouds
  const hm = std({ color: night ? 0xc8c8e0 : 0xfff6f8, roughness: 0.9 });
  for (let i = 0; i < 9; i++) { const hh = mesh(new THREE.SphereGeometry(30 + (i % 3) * 12, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm, false); hh.scale.y = 0.45; hh.position.set(-160 + i * 42, -2, -110 - (i % 2) * 30); S.add(hh); }
  for (let i = 0; i < 5; i++) { const hh = mesh(new THREE.SphereGeometry(26, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), hm, false); hh.scale.y = 0.4; hh.position.set(-120 + i * 60, -2, 100); S.add(hh); }
  clouds(S, night ? { night: true, y: [55, 90], z: [-120, -220], x: 260 } : dusk ? { tint: 0xffb8c8, y: [45, 85], z: [-120, -220], x: 260 } : { tint: 0xffe0f0, y: [45, 85], z: [-120, -220], x: 260 });
  // the moon (night): never moves
  const moon = put(S, new THREE.Mesh(new THREE.CircleGeometry(9, 40), basic(0xfff4d8, { fog: false })), [-35, 95, -210]);
  const moonHalo = put(S, new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    map: ctex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,0.6)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }) })), [-35, 95, -211]);
  moon.visible = moonHalo.visible = night;
  // stars
  if (night) { const n = 500, p = new Float32Array(n * 3), R = rng(21); for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, e = 0.15 + R() * 1.2; p[i * 3] = Math.cos(a) * 300 * Math.cos(e); p[i * 3 + 1] = 300 * Math.sin(e); p[i * 3 + 2] = Math.sin(a) * 300 * Math.cos(e) - 60; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(p, 3)); S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false, fog: false }))); }
  // lights
  let sun;
  if (night) { S.add(new THREE.HemisphereLight(0x6a7ad0, 0x2a1a30, 0.7)); sun = new THREE.DirectionalLight(0xb8c4ff, 1.1); sun.position.set(-30, 60, 30); }
  else { S.add(new THREE.HemisphereLight(dusk ? 0xffc0d0 : 0xd8e8ff, dusk ? 0x5a3a4a : 0x8a6a60, dusk ? 0.75 : 1.0));
    sun = new THREE.DirectionalLight(dusk ? 0xffa070 : morning ? 0xffe0c0 : 0xfff0e0, dusk ? 2.6 : 3.0); sun.position.set(dusk ? -60 : morning ? -40 : 30, dusk ? 18 : 40, dusk ? 30 : 40);
    const rim = new THREE.DirectionalLight(dusk ? 0xff80b0 : 0xffd0e8, 1.0); rim.position.set(20, 14, -40); S.add(rim); }
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 45, bottom: -30, near: 1, far: 220 }); sun.target.position.set(0, 0, -8); S.add(sun, sun.target);
  const key = new THREE.PointLight(night ? 0xffe0c0 : 0xfff0e0, night ? 26 : 0, 20, 1.6); key.position.set(0, 7, 8); S.add(key);
  const env = { houses, moon, lamps, sun, key, lampBulbs, follow(x, z = -8) { sun.target.position.set(x, 0, z); sun.position.x += 0; },
    update(t) { Object.values(houses).forEach(h => h.update && h.update(t)); lamps.forEach((l, i) => l.intensity = (night ? 70 : 30) * (0.96 + 0.04 * Math.sin(t * 7 + i * 2))); } };
  if (frost) houses.gus.frost(frost);
  return env;
}

// ---------- inside Gus's house ----------
export function gingerParlor(S, { night = false } = {}) {
  S.background = new THREE.Color(night ? 0x0a0812 : 0x2a1a14);
  const g = new THREE.Group(); S.add(g);
  const wall = tmat(gingerTex(0xc07434), 3, 1.6); const W = 10, Z0 = -9, Z1 = 13, H = 10;
  box(g, [2 * W, 0.4, Z1 - Z0], [0, -0.2, (Z0 + Z1) / 2], std({ map: (() => { const t = ctex(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#5a2e16' : '#f2e6d6'; c.fillRect(i * 64, j * 64, 64, 64); } noiseFill(c, w, h, 0.06, 900); }); t.repeat.set(6, 6); return t; })(), roughness: 0.35 }), { r: 0, cast: false, solid: false, name: 'floor' });
  box(g, [2 * W, H, 0.5], [0, H / 2, Z0 - 0.25], wall, { r: 0, cast: false, name: 'back wall' });
  box(g, [0.5, H, Z1 - Z0], [-W - 0.25, H / 2, (Z0 + Z1) / 2], wall, { r: 0, cast: false, name: 'left wall' });
  // right wall with a door hole (z 2..6)
  box(g, [0.5, H, 2 - Z0], [W + 0.25, H / 2, (Z0 + 2) / 2], wall, { r: 0, cast: false, name: 'right wall' }); box(g, [0.5, H, Z1 - 6], [W + 0.25, H / 2, (6 + Z1) / 2], wall, { r: 0, cast: false, name: 'right wall b' });
  box(g, [0.5, H - 6.4, 4], [W + 0.25, 6.4 + (H - 6.4) / 2, 4], wall, { r: 0, cast: false, solid: false });
  box(g, [2 * W, H, 0.5], [0, H / 2, Z1 + 0.25], wall, { r: 0, cast: false, solid: false, name: 'front wall' });
  box(g, [2 * W, 0.4, Z1 - Z0], [0, H + 0.2, (Z0 + Z1) / 2], M(0xf6eee2, { roughness: 0.6 }), { r: 0, cast: false, solid: false });
  // ceiling beams of candy stick + icing trim along the walls
  for (let z = -6; z <= 12; z += 6) put(g, mesh(new THREE.BoxGeometry(2 * W, 0.6, 0.6), std({ map: stripeTex('#ffffff', '#e8203a') })), [0, H - 0.3, z]);
  scallops(g, [-W + 0.2, H - 0.9, Z0 + 0.25], [W - 0.2, H - 0.9, Z0 + 0.25], 40, 0.25); scallops(g, [-W + 0.3, H - 0.9, Z0 + 0.3], [-W + 0.3, H - 0.9, Z1 - 0.3], 44, 0.25);
  scallops(g, [-W + 0.2, 0.3, Z0 + 0.25], [W - 0.2, 0.3, Z0 + 0.25], 40, 0.2, 0xff9ac8);
  // candy-glass windows on the back + left wall
  const cg = []; const winAt = [[-1.2, 5.6, Z0 + 0.05, 0], [-W + 0.05, 5.6, 2.5, Math.PI / 2]];
  for (const [x, y, z, ry] of winAt) { const wg = put(g, new THREE.Group(), [x, y, z], [0, ry, 0]);
    [0xff5a6a, 0x5ae8a8, 0xffd84a, 0x6ab8ff].forEach((c, i) => { const m = std({ color: c, emissive: c, emissiveIntensity: night ? 0.15 : 0.9, roughness: 0.15 }); cg.push(m); put(wg, mesh(new THREE.BoxGeometry(1.7, 1.9, 0.1), m, false), [(i % 2 ? 0.9 : -0.9), (i < 2 ? 1.0 : -1.0), 0.05]); });
    const fm = M(0xfbf8f2, { roughness: 0.4 }); for (const [ww, hh, ox, oy] of [[4.2, 0.3, 0, 2.1], [4.2, 0.3, 0, -2.1], [0.3, 4.4, 2.0, 0], [0.3, 4.4, -2.0, 0], [0.2, 4.0, 0, 0], [3.8, 0.2, 0, 0]]) put(wg, mesh(new THREE.BoxGeometry(ww, hh, 0.2), fm, false), [ox, oy, 0.12]); }
  // icing workbench back-left
  box(g, [6, 0.4, 2.2], [-5.6, 2.6, -7.5], tmat(chocTex(), 2, 1), { r: 0.08, name: 'workbench' });
  for (const x of [-8.3, -2.9]) box(g, [0.4, 2.4, 1.8], [x, 1.2, -7.5], M(0x5a3018), { r: 0.05, name: 'bench leg' });
  const piping = []; for (const [x, c] of [[-7.8, 0xff9ac8], [-7.0, 0x8ae0c0], [-6.2, 0xffffff]]) { const p = put(g, new THREE.Group(), [x, 3.2, -7.2], [0, 0, 0.3]); put(p, mesh(new THREE.ConeGeometry(0.35, 1.1, 12), M(c, { roughness: 0.5 })), [0, 0, 0], [Math.PI, 0, 0]); piping.push(p); }
  const jars = []; for (const [x, c] of [[-4.8, 0xff3a6a], [-4.0, 0x3ad8a8], [-3.3, 0xffd23a]]) { const j = put(g, new THREE.Group(), [x, 2.8, -7.6]);
    put(j, mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16), new THREE.MeshStandardMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.45, roughness: 0.05 }), false), [0, 0.45, 0]);
    for (let k = 0; k < 5; k++) put(j, mesh(new THREE.SphereGeometry(0.15, 8, 6), M(c, { roughness: 0.3 }), false), [(k % 2 - 0.5) * 0.25, 0.15 + k * 0.13, ((k + 1) % 2 - 0.5) * 0.2]);
    put(j, mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 16), M(0xfbf8f2)), [0, 0.95, 0]); jars.push(j); }
  const bowl = put(g, mesh(new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0x6ab8ff, { roughness: 0.3, side: THREE.DoubleSide })), [-5.8, 3.5, -7.4]);
  put(g, mesh(new THREE.CircleGeometry(0.62, 16), M(0xfbf8f2)), [-5.8, 3.42, -7.4], [-Math.PI / 2, 0, 0]);
  // shelves of sprinkles + photo frames on the back wall
  for (const y of [5.2, 6.8]) { box(g, [4.6, 0.25, 1.0], [-6.2, y, -8.5], M(0x7a4020), { r: 0.04, solid: false }); for (let i = 0; i < 5; i++) put(g, mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 10), M(CANDY[(i + (y > 6 ? 2 : 0)) % 6], { roughness: 0.4 })), [-8.0 + i * 0.9, y + 0.48, -8.5]); }
  const photo = (x, y, kind) => { const fr = put(g, new THREE.Group(), [x, y, Z0 + 0.1]); put(fr, mesh(rb(2.2, 1.8, 0.15, 0.05), M(0xe8c040, { metalness: 0.6, roughness: 0.35 })), [0, 0, 0]);
    put(fr, new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), std({ map: ctex(180, 140, (c, w, h) => { c.fillStyle = kind ? '#bfe0ff' : '#ffd8e8'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8692e'; c.fillRect(50, 60, 80, 60); c.fillStyle = '#fbf8f2'; c.beginPath(); c.moveTo(40, 62); c.lineTo(90, 25); c.lineTo(140, 62); c.fill();
      if (kind) { c.fillStyle = '#5a3018'; c.fillRect(20, 80, 14, 40); c.beginPath(); c.arc(27, 72, 9, 0, 7); c.fill(); c.fillRect(150, 95, 10, 25); c.beginPath(); c.arc(155, 88, 7, 0, 7); c.fill(); } }) })), [0, 0, 0.09]); };
  photo(3.2, 6.4, 0); photo(5.8, 6.9, 1); photo(3.6, 4.2, 1);
  // fireplace back-right
  const fp = put(g, new THREE.Group(), [6.2, 0, -8.2]); const brick = tmat(gingerTex(0x8a4a20), 1, 1);
  put(fp, mesh(rb(5.4, 5.2, 1.6, 0.1), brick), [0, 2.6, 0]); put(fp, mesh(rb(3.0, 2.6, 0.4, 0.05), basic(0x140804)), [0, 1.5, 0.65]); box(g, [5.4, 5.2, 1.6], [6.2, 2.6, -8.2], basic(0, { visible: false }), { r: 0, cast: false, name: 'fireplace' });
  put(fp, mesh(rb(6.2, 0.4, 2.0, 0.1), M(0xfbf8f2, { roughness: 0.4 })), [0, 5.3, 0.1]); scallops(fp, [-3.1, 5.0, 1.1], [3.1, 5.0, 1.1], 14, 0.22, 0xff9ac8);
  const flames = []; for (let i = 0; i < 3; i++) { const f = put(fp, new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.3, 10), basic([0xffa020, 0xffd040, 0xff6a20][i])), [-0.6 + i * 0.6, 0.95, 0.75]); flames.push(f); }
  const fire = new THREE.PointLight(0xff9a40, night ? 40 : 18, 18, 1.6); fire.position.set(6.2, 1.8, -6.6); S.add(fire);
  for (let i = 0; i < 3; i++) put(fp, mesh(rb(0.9, 0.35, 0.6, 0.1), M(0xfbf8f2)), [-1.6 + i * 1.6, 5.7, 0.2]);   // marshmallows on the mantel
  // rocking chair + rug + coat rack
  const ch = put(g, new THREE.Group(), [6.4, 0, 1.5], [0, -0.5, 0]); const cm = std({ map: stripeTex('#ffffff', '#2aa86a'), roughness: 0.4 });
  put(ch, mesh(rb(2.6, 0.3, 2.4, 0.08), M(0x7a4020)), [0, 1.55, 0]); put(ch, mesh(rb(2.6, 3.2, 0.3, 0.08), M(0x7a4020)), [0, 3.1, -1.1]);
  for (const sx of [-1, 1]) put(ch, mesh(new THREE.TorusGeometry(2.0, 0.12, 8, 24, 1.2), cm), [sx * 1.2, 2.0, 0], [0, Math.PI / 2, Math.PI * 1.31]);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(ch, mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8), cm), [sx * 1.1, 0.8, sz * 0.9]);
  box(g, [2.8, 3.4, 2.6], [6.4, 1.7, 1.5], basic(0, { visible: false }), { r: 0, cast: false, name: 'rocking chair', solid: true });
  put(g, mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.06, 40), std({ map: mintTex('#ff6aa8'), roughness: 0.9 }), false), [0, 0.03, 0.5]);
  candyCane(g, [8.8, 8.0], 6.0); put(g, mesh(rb(1.6, 2.4, 0.5, 0.2), M(0xc8302a, { roughness: 0.9 })), [9.4, 4.6, 8.0]);
  // door (right wall)
  const door = put(g, new THREE.Group(), [W + 0.1, 0, 2]); put(door, mesh(rb(0.3, 6.2, 4, 0.06), std({ map: chocTex() })), [0, 3.1, 2]);
  const outside = put(g, new THREE.Mesh(new THREE.PlaneGeometry(4, 6.4), basic(night ? 0x1a1a40 : 0xffe8f0)), [W + 0.6, 3.2, 4], [0, -Math.PI / 2, 0]);
  // lights
  S.add(new THREE.HemisphereLight(0xffe8d8, 0x3a2018, night ? 0.45 : 0.75));
  const key = new THREE.PointLight(0xffd8b0, night ? 30 : 34, 26, 1.5); key.position.set(-2, 8.6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.002; S.add(key);
  const pend = put(g, new THREE.Group(), [-2, H, 2]); put(pend, mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), M(0x2a2a2a)), [0, -0.8, 0]); put(pend, mesh(new THREE.SphereGeometry(0.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0xff5a8a), false), [0, -1.6, 0], [Math.PI, 0, 0]);
  put(pend, new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), basic(0xfff0c8)), [0, -1.7, 0]);
  const win = new THREE.PointLight(night ? 0x8a9aff : 0xffe8c0, night ? 8 : 20, 20, 1.6); win.position.set(-1.2, 6, -6.5); S.add(win);
  let tiltNow = 0;
  return { g, door: { open: k => { door.rotation.y = -k * 1.6; } }, fire, key, jars, piping, chair: ch,
    tilt(deg) { tiltNow = deg; g.rotation.z = deg * D; },
    rock(t) { ch.rotation.x = Math.sin(t * 1.6) * 0.05; },
    update(t) { flames.forEach((f, i) => { f.scale.y = 1 + 0.25 * Math.sin(t * 11 + i * 2); f.scale.x = 1 + 0.12 * Math.sin(t * 7 + i); }); fire.intensity = (night ? 40 : 18) * (0.9 + 0.1 * Math.sin(t * 13));
      const a = Math.abs(tiltNow); jars.forEach((j, i) => { j.rotation.z = Math.sin(t * 22 + i) * 0.08 * Math.min(1, a / 6); j.position.x = [-4.8, -4.0, -3.3][i] + Math.sign(-tiltNow) * Math.min(1.2, a * 0.1) * (1 + i * 0.3); });
      piping.forEach((p, i) => p.rotation.z = 0.3 + Math.sin(t * 19 + i) * 0.1 * Math.min(1, a / 6)); } };
}

// ---------- the real kitchen (the reveal) ----------
export const VILLAGE_S = 0.055;
export function giantKitchen(S) {
  S.background = new THREE.Color(0x0e0a10); S.userData.look = 'night';
  const W = 18, Z0 = -16, Z1 = 22, H = 17;
  const wallT = ctex(256, 256, (c, w, h) => { c.fillStyle = '#e8dcc0'; c.fillRect(0, 0, w, h); c.fillStyle = '#d8c8a8'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 12, h); noiseFill(c, w, h, 0.05, 800); });
  const wm = tmat(wallT, 6, 3);
  box(S, [2 * W, 0.4, Z1 - Z0], [0, -0.2, (Z0 + Z1) / 2], std({ map: (() => { const t = ctex(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#2a3a5a' : '#e8e4dc'; c.fillRect(i * 64, j * 64, 64, 64); } noiseFill(c, w, h, 0.05, 900); }); t.repeat.set(8, 8); return t; })(), roughness: 0.3 }), { r: 0, cast: false, solid: false, name: 'floor' });
  box(S, [2 * W, H, 0.5], [0, H / 2, Z0 - 0.25], wm, { r: 0, cast: false, name: 'back wall' });
  for (const sx of [-1, 1]) box(S, [0.5, H, Z1 - Z0], [sx * (W + 0.25), H / 2, (Z0 + Z1) / 2], wm, { r: 0, cast: false, name: 'side wall' });
  box(S, [2 * W, H, 0.5], [0, H / 2, Z1 + 0.25], wm, { r: 0, cast: false, solid: false });
  box(S, [2 * W, 0.4, Z1 - Z0], [0, H + 0.2, (Z0 + Z1) / 2], M(0x2a3050, { roughness: 0.9 }), { r: 0, cast: false, solid: false });   // deep-blue painted ceiling (reads as night sky from the village)
  // back counter + cabinets + window + coffee maker
  box(S, [2 * W, 3.0, 2.6], [0, 1.5, Z0 + 1.3], M(0x3a6a8a, { roughness: 0.5 }), { r: 0.05, name: 'counter' }); box(S, [2 * W, 0.3, 2.8], [0, 3.15, Z0 + 1.4], std({ color: 0xf0ece4, roughness: 0.2 }), { r: 0.05, solid: false });
  for (let x = -16; x <= 16; x += 4) { put(S, mesh(rb(3.6, 3.2, 1.6, 0.06), M(0x3a6a8a, { roughness: 0.5 })), [x, 13.0, Z0 + 0.8]); put(S, mesh(rb(0.8, 0.12, 0.12, 0.04), M(0xd8c070, { metalness: 0.8 })), [x, 11.8, Z0 + 1.65]); }
  const winG = put(S, new THREE.Group(), [-8, 8.0, Z0 + 0.05]); put(winG, new THREE.Mesh(new THREE.PlaneGeometry(8, 5.6), basic(0x0a1230)), [0, 0, 0]);
  for (let i = 0; i < 40; i++) put(winG, new THREE.Mesh(new THREE.CircleGeometry(0.05 + Math.random() * 0.05, 6), basic(0xffffff)), [(Math.random() - 0.5) * 7.6, (Math.random() - 0.5) * 5.2, 0.02]);
  for (const [ww, hh, ox, oy] of [[8.6, 0.4, 0, 3.0], [8.6, 0.4, 0, -3.0], [0.4, 6.2, 4.1, 0], [0.4, 6.2, -4.1, 0], [0.2, 5.6, 0, 0]]) put(winG, mesh(new THREE.BoxGeometry(ww, hh, 0.3), M(0xf6f2ea)), [ox, oy, 0.15]);
  const cm = put(S, new THREE.Group(), [6, 3.3, Z0 + 1.2]); put(cm, mesh(rb(2.4, 3.4, 2.0, 0.2), M(0x1a1a1e, { roughness: 0.3 })), [0, 1.7, 0]); put(cm, mesh(new THREE.CylinderGeometry(0.8, 0.7, 1.4, 20), new THREE.MeshStandardMaterial({ color: 0x3a1a0a, transparent: true, opacity: 0.8, roughness: 0.05 })), [0, 0.7, 0.5]);
  put(cm, new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), basic(0xff3a2a)), [0.8, 2.6, 1.01]);
  const steam = []; for (let i = 0; i < 6; i++) { const s = put(S, new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, depthWrite: false })), [6, 7, Z0 + 1.8]); steam.push(s); }
  for (const [x, c] of [[9.5, 0xd8302a], [11, 0xf2c420]]) { const mg = put(S, new THREE.Group(), [x, 3.3, Z0 + 1.6]); put(mg, mesh(new THREE.CylinderGeometry(0.5, 0.45, 1.1, 16), M(c, { roughness: 0.3 })), [0, 0.55, 0]); put(mg, mesh(new THREE.TorusGeometry(0.3, 0.08, 6, 12), M(c)), [0.55, 0.6, 0], [0, 0, Math.PI / 2]); }
  // fridge with drawings
  box(S, [5, 13, 3], [-15, 6.5, Z0 + 2.2], M(0xf2f2f0, { roughness: 0.25, metalness: 0.2 }), { r: 0.3, name: 'fridge' });
  for (const [x, y, c] of [[-16, 9, '#ffd84a'], [-14, 8, '#8ae0c0'], [-15.2, 5.5, '#ff9ac8']]) put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.3), std({ map: ctex(64, 52, (cc, w, h) => { cc.fillStyle = c; cc.fillRect(0, 0, w, h); cc.fillStyle = '#7a3a1a'; cc.fillRect(18, 22, 28, 22); cc.fillStyle = '#fff'; cc.beginPath(); cc.moveTo(12, 24); cc.lineTo(32, 8); cc.lineTo(52, 24); cc.fill(); }) })), [x, y, Z0 + 3.72]);
  // string lights along the top of the back wall
  const bulbs = []; for (let i = 0; i < 26; i++) { const x = -17 + i * 1.36, y = 15.2 - Math.sin((i % 9) / 8 * Math.PI) * 0.8; const b = put(S, new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), basic(CANDY[i % 6])), [x, y, Z0 + 0.3]); bulbs.push(b); }
  // table
  const top = 3.0; box(S, [15, 0.4, 8], [0, top - 0.2, -3], std({ map: (() => { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#8a5a34'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(60,30,10,0.35)'; c.lineWidth = 2; for (let y = 0; y < h; y += 10) { c.beginPath(); c.moveTo(0, y + Math.sin(y) * 3); c.bezierCurveTo(w / 3, y + 6, w * 2 / 3, y - 6, w, y); c.stroke(); } }); t.repeat.set(2, 1); return t; })(), roughness: 0.45 }), { r: 0.1, name: 'table' });
  for (const [x, z] of [[-7, -6.6], [7, -6.6], [-7, 0.6], [7, 0.6]]) box(S, [0.6, top - 0.4, 0.6], [x, (top - 0.4) / 2, z], M(0x6a4024), { r: 0.08, name: 'table leg' });
  // tablecloth runner + cake board with the village
  box(S, [15, 0.04, 3.4], [0, top + 0.02, -3], std({ map: stripeTex('#f6f2ea', '#c8202a'), roughness: 0.9 }), { r: 0, cast: false, solid: false });
  box(S, [8.6, 0.12, 4.2], [0, top + 0.08, -3], std({ map: sugarTex(), roughness: 0.6 }), { r: 0.1, cast: false, solid: false, name: 'cake board' });
  const mini = new THREE.Group(); mini.position.set(0, top + 0.14, -3 + 10 * VILLAGE_S + 0.2); mini.scale.setScalar(VILLAGE_S); S.add(mini);
  const mh = village(mini, { time: 'night', mini: true });
  // trim: the board only holds the near streets — hide the far rows that would hang off it
  mini.children.forEach(o => { if (o.position && (Math.abs(o.position.x) > 72 || o.position.z < -40 || o.position.z > 25)) o.visible = false; });
  mini.traverse(o => { if (o.isMesh) { o.castShadow = false; o.userData.solid = false; } });
  box(mini, [160, 0.6, 12], [0, 0.0, 1], tmat(cobbleTex(), 16, 1), { r: 0, cast: false, solid: false });
  for (const x of [-30, -10, 10, 30]) { candyCane(mini, [x, -6], 9); put(mini, new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), basic(0xfff0c8)), [x + 1.1, 8.3, -6]); }
  // plates, forks, milk; the mayor's house on a plate, half eaten (with its tiny sign)
  const plate = (x, z) => { const p = put(S, new THREE.Group(), [x, top, z]); put(p, mesh(new THREE.CylinderGeometry(1.4, 1.1, 0.14, 32), M(0xfbfaf6, { roughness: 0.2 })), [0, 0.07, 0]); return p; };
  const pl = plate(4.6, -5.6); const mm = gingerHouse(pl, { name: 'eaten', style: 'mayor', w: 12, h: 8.5, seed: 7, lit: 0.1 }); mm.g.scale.setScalar(VILLAGE_S * 1.4); mm.g.position.set(0, 0.14, 0); mm.g.rotation.y = -0.4;
  mm.g.traverse(o => { if (o.isMesh) { o.userData.solid = false; } });
  const bite = put(pl, new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 10), basic(0xfbfaf6)), [0.42, 0.62, 0.1]); bite.visible = false;
  const pl2 = plate(-4.6, -5.6);
  const fork = (p, x) => { const f = put(p, new THREE.Group(), [x, 0.16, 0.2]); put(f, mesh(new THREE.BoxGeometry(0.14, 0.05, 1.6), M(0xd8dce4, { metalness: 0.9, roughness: 0.2 })), [0, 0, 0]); for (let i = 0; i < 3; i++) put(f, mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5), M(0xd8dce4, { metalness: 0.9, roughness: 0.2 })), [-0.07 + i * 0.07, 0, -1.0]); return f; };
  const fk = fork(pl, 1.7); fork(pl2, -1.7);
  for (const [x, z] of [[6.6, -4.3], [-6.4, -4.3]]) { const gl = put(S, new THREE.Group(), [x, top, z]); put(gl, mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.6, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.05 })), [0, 0.8, 0]);
    put(gl, mesh(new THREE.CylinderGeometry(0.4, 0.36, 1.2, 20), M(0xfbfaf6, { roughness: 0.4 })), [0, 0.62, 0]); }
  // pendant lamp = "the moon"
  const lamp = put(S, new THREE.Group(), [0, 11.5, -3]); put(lamp, mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.5, 6), M(0x2a2a2a)), [0, 2.75, 0]);
  const globe = put(lamp, new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 20), basic(0xfff4d8)), [0, 0, 0]); put(lamp, mesh(new THREE.CylinderGeometry(0.4, 0.6, 0.5, 16), M(0xc8a040, { metalness: 0.8, roughness: 0.3 })), [0, 1.4, 0]);
  const halo = put(lamp, new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    map: ctex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,0.3)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }) })), [0, 0, 0]);
  const L = new THREE.PointLight(0xffe2b8, 70, 40, 1.4); L.position.set(0, 9.6, -3); L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.002; S.add(L);
  S.add(new THREE.HemisphereLight(0xffd8b0, 0x1a1420, 0.4));
  const winL = new THREE.PointLight(0x6a7aff, 10, 22, 1.6); winL.position.set(-8, 8, Z0 + 3); S.add(winL);
  const key = new THREE.PointLight(0xffd8b0, 30, 22, 1.6); key.position.set(0, 9, 8); S.add(key);
  return { lamp, globe, halo, mini, miniHouses: mh, plate: pl, eaten: mm, bite, fork: fk, key, light: L, top,
    update(t, cam) { steam.forEach((s, i) => { const u = (t * 0.35 + i / 6) % 1; s.position.set(6 + Math.sin(u * 6 + i) * 0.4, 7.0 + u * 4, Z0 + 1.6); s.scale.setScalar(0.6 + u * 1.6); s.material.opacity = 0.28 * (1 - u); });
      bulbs.forEach((b, i) => b.scale.setScalar(0.85 + 0.25 * Math.sin(t * 2 + i))); if (cam) halo.lookAt(cam.position); } };
}
