// Episode 022 kit — basement monsters + Marrow Street at night (first used in episode 022 "The Tenant Downstairs")
//
//   ledgerBeast(S, { name, col, belly })  the tenant downstairs: a 23-stud-tall seated furry beast with an accountant's eyeshade (root = seat on the ground, faces +Z;
//       head centre ≈ root + (0, 16.6, 1), eyes r 1.9 at x ±3.3). .update(t, { breathe }) every frame (breathing, ears, pupils, blink), .look(vec3), .eyes(open 0..1, glow 0..1),
//       .brow(k) (-1 angry … +1 gentle), .jaw(k), .glasses(bool), .head (Group: rotate it), .reach('R'|'L', worldPoint, { face, hint }) two-bone IK arm (omit point = hand on knee),
//       .grip(side, k), .tip(side) world point between the claw tips (hold small props there), .hand[side] (Group — parent props to .hold[side]).
//   cellarArm(S, { name, col, nail, s, len })  a monster arm that comes up out of a cellar hatch: .g (position at the hatch), .rise(h) how far it sticks out, .wrist (rotate), .grip(k), .hold (Group for props).
//   cellarHatch(S, [x, z], { w, d, col })  iron double hatch in the pavement: .open(k), .light (coloured glow from below), .bang(t) rattle helper.
//   marrowStreet(S, { time: 'night'|'dawn' })  cobbled street along x at night. Pavement z -10..-2, road z -2..10; fronts z -10: OPERA HOUSE x -51..-25 (columns z -8.4, steps to z -7,
//       hatch (-38, -4.6)), alley, LAUNDROMAT x -19..-1 (door x -3.6, bench (-15, -8.6), hatch (-11, -4.6)), alley, No. 9 x 6..22 (stoop + door x 14, bins (4.4, -8.4), hatch (9, -4.6),
//       Dana's lit window (17.5, 15.5)), fillers beyond. Lamps x -24.5 / 1.5 / 25 at z -2.6 (env.lamps). env.hatch.{opera, wash, nine}, env.shake(k) (jolts No. 9), env.follow(x), env.update(t). Keep cameras at z < 16.
//   danaFlat(S, { receipts })  Dana's studio flat at night (walls x ±9, back z -8, ceiling 9.5, front z 12): counter + stove along the back-left (top 3.0, front z -6.4), night window (-4.2, 5.6),
//       fridge with FINAL NOTICE bills (0.2, -7), cork board of receipts (2.2, 5.3) env.receipts(n), front door in the back wall x 3.7..8.2 (env.door.open(k), hinge at x 3.7, hall behind),
//       round table top 2.6 at (-2.6, -2.2) r 1.9 (stand behind at z -4.5), pendant lamp env.lamp, daybed right wall (x 5.6..8.8, z 0..7, top 2.0), rug, plants, shelves.
//   cellarHall(S)  ground-floor back hall of No. 9 (walls x ±5.5, back z -9, ceiling 9, front z 12): THE basement door x -2.1..2.1 (env.door.open(k), hinge x -2.1, swings toward +z; stairs + gold glow behind: env.glow(k)),
//       enamel sign env.sign, mailboxes left, stairs up on the right (x 3.2..5.5, z 1..8), swinging bare bulb env.bulb, pipes, radiator, mop bucket, doormat. env.dust(k) gold dust on the handle + floor.
//   deepStairs(S, { zone: 'boiler'|'bedrock'|'dark' })  the stairs that go on far too long: steps x ±3.5 descending toward +z (stairY(z) = top of the step under z; (0,0,0) is a step top),
//       side ledges out to walls x ±8, sloping ceiling; boiler = brick + copper boiler + pipes + caged bulbs; bedrock = strata, fossil, mushrooms, roots; dark = the stairs stop at z 5.6.
//   hoardCavern(S)  the cavern under No. 9: beast seat (0, 1.2, -14), gold mounds + coins, brick foundation pillars, giant banker's lamp at (-16.5, 4.5) (shade over x -16.5..-10, y 12.3),
//       ledger lectern (-9.2, 0) env.ledger, plate shelf at (19, -4) facing +z/-x (env.plates), painting on the left wall env.painting, sacks (7, 7), stair stub front-left. env.set(k) lights, env.update(t).
//   Props: paper(S, lines, opts) text sheet · plateOf(S, { food }) · spade(S) (.userData.bend(k)) · handTorch(S) (.userData.on(k)) · goldCoin · goldSack · rat (.update(t, mode)) · sock · laundryBasket · pillow · lasagnaTray · bigPencil
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
const shade = (c, f) => hex(new THREE.Color(c).multiplyScalar(f));
const HAND = '"Comic Relief", "Comic Sans MS", cursive';
const brass = () => once('brass22', () => M(0xd8a83a, { metalness: 0.85, roughness: 0.3 }));
const iron = () => once('iron22', () => M(0x2a2c30, { metalness: 0.6, roughness: 0.45 }));

// ---------- textures ----------
const brickTex = (col = 0x7a3226) => once('brk22' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#3a302a'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let i = -1; i < 4; i++) { const x = i * 64 + (r % 2) * 32, y = r * 32; c.fillStyle = shade(col, 0.7 + Math.random() * 0.5); c.fillRect(x + 2, y + 2, 60, 28); c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 4, y + 3, 50, 4); }
  noiseFill(c, w, h, 0.1, 2500); }));
const plasterTex = (col) => once('pl22' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 120; i++) { c.fillStyle = shade(col, 0.88 + Math.random() * 0.2); c.globalAlpha = 0.35; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 14 + Math.random() * 40, 8 + Math.random() * 20, Math.random() * 3, 0, 7); c.fill(); }
  c.globalAlpha = 1; noiseFill(c, w, h, 0.06, 2500); }));
const woodTex = (col = 0x7a4a26) => once('wd22' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(30,15,5,${0.1 + Math.random() * 0.2})`; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 3); c.stroke(); }
  for (let x = 0; x < w; x += 64) { c.fillStyle = 'rgba(20,10,0,0.4)'; c.fillRect(x, 0, 2, h); } noiseFill(c, w, h, 0.06, 1200); }));
const cobbleTex = () => once('cob22', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#15171c'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 6; r++) for (let i = -1; i < 5; i++) { const x = i * 52 + (r % 2) * 26, y = r * 43; c.fillStyle = shade(0x5a6070, 0.6 + Math.random() * 0.6); c.beginPath(); c.roundRect(x + 3, y + 3, 46, 37, 12); c.fill(); c.fillStyle = 'rgba(255,255,255,0.10)'; c.beginPath(); c.ellipse(x + 20, y + 13, 12, 5, -0.3, 0, 7); c.fill(); }
  noiseFill(c, w, h, 0.08, 2000); }));
const slabTex = (col = 0x6a6a72) => once('slab22' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#1c1c20'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 2; r++) for (let i = -1; i < 3; i++) { const x = i * 128 + r * 64, y = r * 128; c.fillStyle = shade(col, 0.8 + Math.random() * 0.3); c.fillRect(x + 2, y + 2, 124, 124); }
  for (let i = 0; i < 24; i++) { c.fillStyle = 'rgba(0,0,0,0.14)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 12, 0, 7); c.fill(); } noiseFill(c, w, h, 0.08, 2500); }));
const furTex = (col) => once('fur22' + col, () => ctex(256, 256, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { const x = Math.random() * w, y = Math.random() * h, l = 10 + Math.random() * 18; c.strokeStyle = shade(col, 0.6 + Math.random() * 0.75); c.globalAlpha = 0.55; c.lineWidth = 2 + Math.random() * 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y + l * 0.5, x + (Math.random() - 0.5) * 8, y + l); c.stroke(); }
  c.globalAlpha = 1; }));
const rockTex = (col = 0x4a4650, strata = false) => once('rock22' + col + strata, () => ctex(512, 512, (c, w, h) => { c.fillStyle = hex(col); c.fillRect(0, 0, w, h);
  if (strata) { let y = 0; while (y < h) { const b = 18 + Math.random() * 50; c.fillStyle = shade([col, 0x6a4a36, 0x3a3440, 0x7a6a50, 0x54404a][Math.floor(Math.random() * 5)], 0.75 + Math.random() * 0.4); c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 64) c.lineTo(x, y + Math.sin(x * 0.02 + y) * 5); c.lineTo(w, y + b + 6); c.lineTo(0, y + b + 6); c.fill(); y += b; } }
  for (let i = 0; i < 160; i++) { c.fillStyle = shade(col, 0.7 + Math.random() * 0.6); c.globalAlpha = 0.3; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 40, 5 + Math.random() * 18, Math.random() * 3, 0, 7); c.fill(); }
  c.globalAlpha = 1; for (let i = 0; i < 26; i++) { c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); let x = Math.random() * w, y = Math.random() * h; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 60; y += Math.random() * 40; c.lineTo(x, y); } c.stroke(); }
  noiseFill(c, w, h, 0.1, 5000); }));
const goldTex = () => once('gold22', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#b8801a'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { const x = Math.random() * w, y = Math.random() * h, r = 9 + Math.random() * 7; c.fillStyle = shade(0xf2c030, 0.7 + Math.random() * 0.5); c.beginPath(); c.ellipse(x, y, r, r * (0.45 + Math.random() * 0.5), Math.random() * 3, 0, 7); c.fill(); c.strokeStyle = 'rgba(90,50,0,0.5)'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = 'rgba(255,250,200,0.5)'; c.fillRect(x - 3, y - 3, 4, 2); } }));
const checkTex = (a, b) => once('chk22' + a + b, () => ctex(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? a : b; c.fillRect(i * 64, j * 64, 64, 64); }
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 2; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } noiseFill(c, w, h, 0.1, 2500); }));
const paperTex22 = (a, b, dot) => once('wp22' + a + b, () => ctex(256, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? a : b; c.fillRect(i * 32, 0, 32, h); }
  c.fillStyle = dot; for (let y = 16; y < h; y += 64) for (let x = 16; x < w; x += 64) { c.beginPath(); c.moveTo(x, y - 10); c.quadraticCurveTo(x + 9, y, x, y + 10); c.quadraticCurveTo(x - 9, y, x, y - 10); c.fill(); }
  for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(60,40,20,0.10)'; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 40, 10 + Math.random() * 30, 0, 0, 7); c.fill(); } noiseFill(c, w, h, 0.06, 2000); }));
// text sheet texture: lines = [text | [text, font, colour, dyAfter]]
export function textTex22(lines, { w = 512, h = 512, bg = '#f4ecd8', fg = '#2a1a10', font = '700 44px "Inter", sans-serif', top = 70, lh = 58, border = null, align = 'center', stain = true } = {}) {
  return ctex(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } if (stain && bg) { for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(120,80,30,0.06)'; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 60, 20 + Math.random() * 40, 0, 0, 7); c.fill(); } }
    if (border) { c.strokeStyle = border; c.lineWidth = 8; c.strokeRect(12, 12, w - 24, h - 24); }
    let y = top; c.textAlign = align; const x = align === 'center' ? w / 2 : align === 'left' ? 36 : w - 36;
    for (const L of lines) { const [t, f, col, dy] = Array.isArray(L) ? L : [L]; c.font = f || font; c.fillStyle = col || fg; c.fillText(t, x, y); y += dy || lh; } });
}
// a sheet of paper with text (double-sided), origin at its centre
export function paper(S, lines, { w = 1.2, h = 1.6, tex = {}, glow = 0.25 } = {}) {
  const t = textTex22(lines, { w: 512, h: Math.round(512 * h / w), ...tex }); const g = new THREE.Group(); S.add(g);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ map: t, roughness: 0.8, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: glow, side: THREE.FrontSide })); f.castShadow = true; g.add(f);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ color: 0xe8dcc0, roughness: 0.9 })); b.rotation.y = Math.PI; g.add(b); g.userData.front = f; return g;
}

// ---------- small props ----------
export function plateOf(S, { food = 'lasagna', s = 1 } = {}) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s);
  put(g, mesh(new THREE.CylinderGeometry(0.62, 0.42, 0.1, 20), M(0xf6f4ee, { roughness: 0.3 })), [0, 0.05, 0]); put(g, mesh(new THREE.TorusGeometry(0.58, 0.035, 6, 24), M(0x3a6ab8, { roughness: 0.3 })), [0, 0.1, 0], [Math.PI / 2, 0, 0]);
  if (food === 'lasagna') { put(g, mesh(rb(0.62, 0.3, 0.5, 0.06), M(0xe8b850)), [0, 0.26, 0]); put(g, mesh(rb(0.64, 0.07, 0.52, 0.03), M(0xb8301e)), [0, 0.2, 0]); put(g, mesh(rb(0.64, 0.07, 0.52, 0.03), M(0xb8301e)), [0, 0.32, 0]); put(g, mesh(rb(0.6, 0.06, 0.48, 0.03), M(0xf6e2a0)), [0, 0.43, 0]); put(g, mesh(new THREE.SphereGeometry(0.07, 6, 5), M(0x3a8a3a)), [0.1, 0.48, 0.05]); }
  if (food === 'spaghetti') { put(g, mesh(new THREE.SphereGeometry(0.42, 12, 8, 0, 7, 0, Math.PI / 2), M(0xf2d078)), [0, 0.1, 0]); put(g, mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, 7, 0, Math.PI / 2), M(0xb8301e)), [0, 0.42, 0]); }
  return g; }
export function lasagnaTray(S, s = 1) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); put(g, mesh(rb(2.2, 0.5, 1.5, 0.08), M(0x9aa0a8, { metalness: 0.7, roughness: 0.35 })), [0, 0.25, 0]); put(g, mesh(rb(2.0, 0.2, 1.3, 0.05), M(0xe8b850)), [0, 0.52, 0]);
  for (let i = 0; i < 7; i++) put(g, mesh(new THREE.SphereGeometry(0.16 + (i % 3) * 0.05, 8, 6), M(i % 2 ? 0xb8301e : 0xf6e2a0)), [-0.8 + (i * 0.27), 0.6, ((i * 7) % 5) * 0.2 - 0.4]).scale.y = 0.3; return g; }
export function spade(S) { const g = new THREE.Group(); S.add(g); const wood = M(0x9a6a3a); put(g, mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.2, 8), wood), [0, 1.1, 0]); put(g, mesh(rb(0.5, 0.12, 0.14, 0.04), wood), [0, 0.02, 0]);
  const top = new THREE.Group(); top.position.y = 2.2; g.add(top); put(top, mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.3, 8), wood), [0, 0.65, 0]);
  const blade = put(top, mesh(rb(0.85, 1.1, 0.07, 0.03), M(0x9aa0a8, { metalness: 0.8, roughness: 0.3 })), [0, 1.8, 0]); const tipB = put(top, mesh(new THREE.ConeGeometry(0.43, 0.4, 4), blade.material), [0, 2.5, 0]); tipB.scale.z = 0.12; tipB.rotation.y = Math.PI / 4;
  g.userData.bend = (k) => { top.rotation.z = k * 1.9; top.rotation.x = k * 0.25; }; return g; }   // handle end at y 0, blade at the top; bend(1) = bent like a spoon
export function handTorch(S) { const g = new THREE.Group(); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.9, 10), M(0xc8302a, { roughness: 0.4 })), [0, 0, 0], [Math.PI / 2, 0, 0]); put(g, mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.3, 12), M(0x9aa0a8, { metalness: 0.8, roughness: 0.3 })), [0, 0, 0.55], [Math.PI / 2, 0, 0]);
  const lens = put(g, new THREE.Mesh(new THREE.CircleGeometry(0.19, 14), basic(0xfff6d0)), [0, 0, 0.71]); const sp = new THREE.SpotLight(0xfff0cc, 260, 46, 0.42, 0.6, 1.4); sp.position.set(0, 0, 0.7); sp.target.position.set(0, 0, 8); g.add(sp, sp.target);
  const cone = put(g, new THREE.Mesh(new THREE.ConeGeometry(2.6, 9, 20, 1, true), basic(0xfff0c0, { transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), [0, 0, 5.2], [-Math.PI / 2, 0, 0]);
  const flare = put(g, new THREE.Mesh(new THREE.CircleGeometry(0.7, 20), basic(0xfff0c0, { transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })), [0, 0, 0.74]);
  g.userData.on = (k) => { sp.intensity = 260 * k; lens.material.color.setHex(k > 0.05 ? 0xfff6d0 : 0x3a3a34); cone.material.opacity = 0.05 * k; flare.material.opacity = 0.45 * k; }; g.userData.spot = sp; return g; }   // points along +z
export function goldCoin(S, r = 0.3) { const m = mesh(new THREE.CylinderGeometry(r, r, r * 0.22, 16), std({ color: 0xf2c030, metalness: 0.9, roughness: 0.25, emissive: 0x7a5a00, emissiveIntensity: 0.5 })); S.add(m); return m; }
export function goldSack(S, s = 1) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); const m = M(0x9a8458, { roughness: 1 }); const b = put(g, mesh(new THREE.SphereGeometry(0.9, 14, 10), m), [0, 0.75, 0]); b.scale.set(1, 0.9, 0.9); put(g, mesh(new THREE.CylinderGeometry(0.2, 0.42, 0.5, 10), m), [0, 1.55, 0]); put(g, mesh(new THREE.TorusGeometry(0.26, 0.06, 6, 12), M(0x5a3a1a)), [0, 1.42, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 5; i++) put(g, mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 10), std({ color: 0xf2c030, metalness: 0.9, roughness: 0.25, emissive: 0x7a5a00, emissiveIntensity: 0.6 })), [Math.sin(i * 1.3) * 0.2, 1.82 + (i % 2) * 0.05, Math.cos(i * 1.3) * 0.2], [i * 0.5, 0, i * 0.4]); return g; }
export function rat(S, s = 1) { const g = new THREE.Group(); S.add(g); g.scale.setScalar(s); const m = M(0x6a6058, { roughness: 1 }); const b = put(g, mesh(new THREE.SphereGeometry(0.3, 12, 8), m), [0, 0.28, 0]); b.scale.set(0.85, 0.8, 1.3);
  const hd = new THREE.Group(); hd.position.set(0, 0.36, 0.36); g.add(hd); const h = put(hd, mesh(new THREE.SphereGeometry(0.2, 10, 8), m), [0, 0, 0]); h.scale.set(0.9, 0.85, 1.2); put(hd, mesh(new THREE.SphereGeometry(0.05, 6, 5), M(0xf2a0a8)), [0, -0.02, 0.24]);
  for (const sx of [-1, 1]) { put(hd, mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 10), M(0xd89aa0)), [sx * 0.15, 0.17, -0.03], [Math.PI / 2 - 0.3, 0, 0]); put(hd, new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), basic(0x0a0a0a)), [sx * 0.09, 0.05, 0.16]); }
  const tail = put(g, mesh(new THREE.CylinderGeometry(0.03, 0.015, 0.7, 5), M(0xd89aa0)), [0, 0.2, -0.65], [Math.PI / 2 - 0.3, 0, 0]);
  g.userData.update = (t, mode = 'sniff') => { hd.rotation.x = mode === 'shock' ? -0.5 : Math.sin(t * 14) * 0.12; hd.rotation.y = mode === 'shock' ? 0 : Math.sin(t * 3) * 0.4; tail.rotation.z = Math.sin(t * 5) * 0.4; b.scale.y = 0.8 + Math.sin(t * 9) * 0.03; g.position.y = mode === 'shock' ? Math.abs(Math.sin(t * 20)) * 0.04 : 0; }; return g; }
export function sock(S, col = 0xe84a6a) { const g = new THREE.Group(); S.add(g); put(g, mesh(rb(0.34, 0.8, 0.3, 0.1), M(col, { roughness: 1 })), [0, -0.4, 0]); put(g, mesh(rb(0.34, 0.3, 0.62, 0.12), M(col, { roughness: 1 })), [0, -0.86, 0.16]); put(g, mesh(rb(0.36, 0.14, 0.32, 0.05), M(0xfafafa, { roughness: 1 })), [0, -0.06, 0]);
  for (let i = 0; i < 2; i++) put(g, mesh(rb(0.35, 0.07, 0.31, 0.02), M(0xfafafa, { roughness: 1 })), [0, -0.3 - i * 0.22, 0]); return g; }   // hangs down from its origin (the cuff)
export function laundryBasket(S) { const g = new THREE.Group(); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.85, 0.62, 0.85, 14, 1, true), M(0x6ab0d8, { side: THREE.DoubleSide, roughness: 0.5 })), [0, 0.42, 0]); put(g, mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 14), M(0x5a9ac0)), [0, 0.03, 0]);
  [[0xfafafa, -0.3, 0.1], [0xf2c420, 0.25, -0.2], [0x8a5ad0, 0.1, 0.3], [0x3aa06a, -0.15, -0.3]].forEach(([c, x, z], i) => put(g, mesh(new THREE.SphereGeometry(0.36, 8, 6), M(c, { roughness: 1 })), [x, 0.72 + (i % 2) * 0.1, z]).scale.y = 0.6); return g; }
export function pillow(S) { const g = new THREE.Group(); S.add(g); put(g, mesh(rb(1.6, 0.5, 1.0, 0.24), M(0xf4f2ee, { roughness: 1 })), [0, 0, 0]); return g; }
export function bigPencil(S, len = 7) { const g = new THREE.Group(); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.3, 0.3, len, 6), M(0xf2c420, { roughness: 0.5 })), [0, len / 2 + 0.8, 0]); put(g, mesh(new THREE.ConeGeometry(0.3, 0.8, 6), M(0xe8c89a)), [0, 0.4, 0], [Math.PI, 0, 0]); put(g, mesh(new THREE.ConeGeometry(0.1, 0.26, 6), M(0x2a2a2a)), [0, 0.13, 0], [Math.PI, 0, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.4, 8), brass()), [0, len + 0.9, 0]); put(g, mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.5, 8), M(0xe88a9a)), [0, len + 1.3, 0]); return g; }   // tip at the origin, body along +y

// ---------- monster hands / arms ----------
// claw hand: palm + three clawed fingers along +Y + a thumb; curls toward +Z. s 1 = palm 2.6 wide.
function clawHand(fur, nailCol = 0xf2e8c8, s = 1) { const g = new THREE.Group(); g.scale.setScalar(s); const nail = M(nailCol, { roughness: 0.35 });
  put(g, mesh(rb(2.6, 2.0, 1.2, 0.4), fur), [0, 1.0, 0]); const F = [];
  for (const x of [-0.9, 0, 0.9]) { const f = new THREE.Group(); f.position.set(x, 1.9, 0); g.add(f); put(f, mesh(rb(0.72, 1.5, 0.8, 0.25), fur), [0, 0.7, 0]); const c = put(f, mesh(new THREE.ConeGeometry(0.3, 1.0, 8), nail), [0, 1.85, 0.08]); c.rotation.x = 0.25; F.push(f); }
  const th = new THREE.Group(); th.position.set(-1.25, 0.9, 0.25); th.rotation.z = 0.95; g.add(th); put(th, mesh(rb(0.72, 1.3, 0.8, 0.25), fur), [0, 0.6, 0]); put(th, mesh(new THREE.ConeGeometry(0.3, 0.9, 8), nail), [0, 1.6, 0.05]);
  const hold = new THREE.Group(); hold.position.set(0, 2.9, 1.0); g.add(hold);
  const grip = (k) => { F.forEach((f, i) => { f.rotation.x = k * (1.15 + i * 0.08); }); th.rotation.x = k * 0.7; }; grip(0.15);
  return { g, grip, hold, fingers: F, thumb: th }; }
export function monsterHand(S, { name = 'hand', col = 0x2c6878, nail = 0xf2e8c8, s = 1.5 } = {}) { const fur = tmat(furTex(col), 1, 2); const H = clawHand(fur, nail, s); const g = new THREE.Group(); g.add(H.g); S.add(g); const wr = mesh(rb(2.9 * s / 1.5 * 1.5, 9, 2.7 * s / 1.5 * 1.3, 0.8), fur); wr.position.y = -4.3; g.add(wr);
  g.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = 'hand'; } }); return { g, grip: H.grip, hold: H.hold, fingers: H.fingers, thumb: H.thumb }; }   // fingers along +Y, palm faces +Z; a forearm stub runs 9 back along -Y
export function cellarArm(S, { name = 'arm', col = 0x7a4ab0, nail = 0xf2c420, s = 1, len = 8 } = {}) {
  const g = new THREE.Group(); S.add(g); const inner = new THREE.Group(); g.add(inner); const fur = tmat(furTex(col), 1, 2);
  put(inner, mesh(rb(1.7 * s, len, 1.7 * s, 0.5 * s), fur), [0, -len / 2, 0]); const wrist = new THREE.Group(); inner.add(wrist); const H = clawHand(fur, nail, s * 0.85); H.g.position.y = -0.3 * s; wrist.add(H.g);
  put(inner, mesh(new THREE.TorusGeometry(0.95 * s, 0.22 * s, 8, 16), tmat(furTex(new THREE.Color(col).multiplyScalar(1.5).getHex()), 1, 1)), [0, -0.15 * s, 0], [Math.PI / 2, 0, 0]);
  g.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = 'arm'; } });
  const A = { g, wrist, hold: H.hold, grip: H.grip, hand: H.g, rise(h) { inner.position.y = h - 2.6 * s * 0.85; inner.visible = h > -1; } }; A.rise(0); return A; }   // rise(h): fingertips ≈ h above the hatch

// ---------- the tenant downstairs ----------
export function ledgerBeast(S, { name = 'beast', col = 0x2c6878, belly = 0xa8d8c4 } = {}) {
  const root = new THREE.Group(); S.add(root); const fur = tmat(furTex(col), 3, 3), furS = tmat(furTex(col), 1, 2), dark = M(new THREE.Color(col).multiplyScalar(0.5).getHex(), { roughness: 0.9 }), bel = tmat(furTex(belly), 2, 2), ivory = M(0xf2e8c8, { roughness: 0.35 });
  const torso = put(root, mesh(rb(14, 12.4, 10, 2.6), fur), [0, 6.2, 0]); put(root, mesh(rb(9.6, 8.4, 1.0, 0.5), bel), [0, 5.6, 4.75]);
  for (const sx of [-1, 1]) { put(root, mesh(rb(4.8, 2.6, 7, 1.0), fur), [sx * 4.3, 1.3, 6.2]); for (const dx of [-1.3, 0, 1.3]) put(root, mesh(new THREE.ConeGeometry(0.5, 1.3, 8), ivory), [sx * 4.3 + dx, 1.0, 10.0], [Math.PI / 2, 0, 0]); }
  put(root, mesh(rb(3.2, 1.3, 0.9, 0.3), M(0xc8302a)), [0, 12.3, 5.0]).scale.x = 1; put(root, mesh(rb(1.0, 1.5, 1.1, 0.3), M(0x9a1e1a)), [0, 12.3, 5.1]);   // bow tie
  const head = new THREE.Group(); head.position.set(0, 12.4, 1.0); root.add(head); const skull = put(head, mesh(rb(13, 8.6, 9, 2.6), fur), [0, 4.2, 0]);
  for (const sx of [-1, 1]) { const h = put(head, mesh(new THREE.ConeGeometry(0.95, 3.6, 10), ivory), [sx * 5.0, 9.4, -0.5]); h.rotation.z = -sx * 0.4; }
  const ears = [-1, 1].map(sx => { const e = new THREE.Group(); e.position.set(sx * 6.5, 5.6, 0); head.add(e); put(e, mesh(rb(1.6, 2.4, 1.0, 0.4), fur), [sx * 0.6, 0.4, 0]); return e; });
  put(head, mesh(rb(1.8, 1.1, 0.9, 0.35), dark), [0, 3.1, 4.6]);   // nose
  const eyeMat = std({ color: 0xfff4c8, roughness: 0.25, emissive: 0xffd860, emissiveIntensity: 0.15 }); const E = [];
  for (const sx of [-1, 1]) { const e = new THREE.Group(); e.position.set(sx * 3.3, 5.1, 4.25); head.add(e); const w = put(e, mesh(new THREE.SphereGeometry(1.9, 24, 16), eyeMat), [0, 0, 0]); w.scale.z = 0.45;
    const pu = put(e, new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), basic(0x0a0a0c)), [0, 0, 0.72]); pu.scale.z = 0.3; put(pu, new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), basic(0xffffff)), [0.3, 0.32, 0.8]);
    const lg = new THREE.BoxGeometry(4.3, 4.1, 1.3); lg.translate(0, -2.05, 0); const lid = put(e, mesh(lg, dark, false), [0, 2.05, 0.5]); lid.scale.y = 0.03;
    const bg = new THREE.Group(); bg.position.set(0, 2.5, 0.9); e.add(bg); put(bg, mesh(rb(3.8, 0.7, 0.9, 0.25), dark), [0, 0, 0]); E.push({ e, pu, lid, brow: bg, sx }); }
  const jaw = new THREE.Group(); jaw.position.set(0, 1.5, 1.5); head.add(jaw); put(jaw, mesh(rb(8.6, 2.2, 4.0, 0.8), fur), [0, -0.8, 1.4]); put(head, mesh(rb(7.4, 1.6, 0.5, 0.2), M(0x2a0a12)), [0, 1.2, 4.25]);
  for (const sx of [-1, 1]) put(jaw, mesh(new THREE.ConeGeometry(0.5, 1.5, 8), ivory), [sx * 2.9, 0.9, 3.1]);
  // accountant's eyeshade + half-moon reading glasses
  put(head, mesh(rb(13.3, 0.8, 9.3, 0.3), M(0x14503a)), [0, 7.4, 0]); put(head, new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.18, 3.4), std({ color: 0x1ca060, transparent: true, opacity: 0.72, roughness: 0.2, emissive: 0x0a5030, emissiveIntensity: 0.2 })), [0, 7.25, 6.0], [0.22, 0, 0]);
  const gl = new THREE.Group(); gl.position.set(0, 4.3, 5.3); head.add(gl); gl.visible = false; const gold = M(0xe8c040, { metalness: 0.9, roughness: 0.25, emissive: 0x6a4a00, emissiveIntensity: 0.4 });
  for (const sx of [-1, 1]) { put(gl, mesh(new THREE.TorusGeometry(2.2, 0.16, 8, 28, Math.PI), gold), [sx * 3.3, 0.6, 0], [0, 0, Math.PI]); put(gl, mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.4, 6), gold), [sx * 3.3, 0.6, 0], [0, 0, Math.PI / 2]);
    put(gl, new THREE.Mesh(new THREE.CircleGeometry(2.1, 24, Math.PI, Math.PI), std({ color: 0xcfe8ff, transparent: true, opacity: 0.16, roughness: 0.05 })), [sx * 3.3, 0.6, 0]); put(gl, mesh(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), gold), [sx * 5.6, 0.7, -2.4], [Math.PI / 2, 0, 0]); }
  put(gl, mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 6), gold), [0, 0.6, 0], [0, 0, Math.PI / 2]);
  // arms (two-bone IK in root space)
  const SHO = { R: new THREE.Vector3(-8.0, 10.4, 0.6), L: new THREE.Vector3(8.0, 10.4, 0.6) }, LA = 8.2, LB = 8.2, Y = new THREE.Vector3(0, 1, 0); const ARM = {};
  for (const side of ['R', 'L']) { const up = mesh(rb(3.0, 1, 3.0, 1.0), furS), fo = mesh(rb(2.7, 1, 2.7, 0.9), furS), el = mesh(new THREE.SphereGeometry(1.75, 12, 10), fur), sh = mesh(new THREE.SphereGeometry(2.1, 12, 10), fur); root.add(up, fo, el, sh); sh.position.copy(SHO[side]);
    const H = clawHand(furS, 0xf2e8c8, 1.5); if (side === 'L') H.g.scale.x *= -1; const hg = new THREE.Group(); hg.add(H.g); root.add(hg); ARM[side] = { up, fo, el, H, hg }; }
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), mtx = new THREE.Matrix4();
  function solve(side, T, face, hint) { const A = ARM[side], S0 = SHO[side]; const dir = v1.copy(T).sub(S0); let d = dir.length(); d = Math.max(1.5, Math.min(LA + LB - 0.05, d)); dir.normalize();
    const x = (LA * LA - LB * LB + d * d) / (2 * d), h = Math.sqrt(Math.max(0, LA * LA - x * x)); const hv = v2.copy(hint); hv.addScaledVector(dir, -hv.dot(dir)).normalize();
    const E = new THREE.Vector3().copy(S0).addScaledVector(dir, x).addScaledVector(hv, h), W = new THREE.Vector3().copy(S0).addScaledVector(dir, d);
    const seg = (m, a, b, L) => { m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.y = a.distanceTo(b) + 0.6; m.quaternion.setFromUnitVectors(Y, v3.copy(b).sub(a).normalize()); };
    seg(A.up, S0, E); seg(A.fo, E, W); A.el.position.copy(E);
    const yv = new THREE.Vector3().copy(W).sub(E).normalize(), zv = new THREE.Vector3().copy(face); zv.addScaledVector(yv, -zv.dot(yv)); if (zv.lengthSq() < 1e-4) zv.set(0, 0, 1); zv.normalize(); const xv = new THREE.Vector3().crossVectors(yv, zv);
    mtx.makeBasis(xv, yv, zv); A.hg.quaternion.setFromRotationMatrix(mtx); A.hg.position.copy(W); }
  root.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = 'beast'; } });
  const target = new THREE.Vector3(0, 6, 30), tmp = new THREE.Vector3(); let lidK = 1, autoBlink = true;
  const B = { root, head, torso, name, hand: { R: ARM.R.hg, L: ARM.L.hg }, hold: { R: ARM.R.H.hold, L: ARM.L.H.hold },
    look(v) { target.copy(v); }, eyes(open = 1, glow = 0) { lidK = open; eyeMat.emissiveIntensity = 0.12 + glow * 2.4; E.forEach(o => { o.lid.scale.y = Math.max(0.03, 1 - lidK); }); },   // lids applied at once (stills render single frames)
    brow(k) { E.forEach(o => { o.brow.rotation.z = -o.sx * k * 0.32; o.brow.position.y = 2.5 + Math.max(0, k) * 0.35 - Math.max(0, -k) * 0.45; }); },
    jaw(k) { jaw.rotation.x = k * 0.5; jaw.position.y = 1.5 - k * 0.5; }, glasses(v) { gl.visible = !!v; }, glassesG: gl,
    reach(side, p, { face = [0, 0, 1], hint = null } = {}) { root.updateMatrixWorld(true); const T = p ? root.worldToLocal(new THREE.Vector3(...(Array.isArray(p) ? p : [p.x, p.y, p.z]))) : new THREE.Vector3((side === 'R' ? -1 : 1) * 6.4, 4.4, 7.4);
      solve(side, T, tmp.set(...face), new THREE.Vector3(...(hint || [(side === 'R' ? -1 : 1) * 1, -0.35, -0.6]))); },
    grip(side, k) { ARM[side].H.grip(k); }, tip(side) { root.updateMatrixWorld(true); return ARM[side].H.hold.getWorldPosition(new THREE.Vector3()); },
    update(t, { breathe = 1, blink = true } = {}) { const b = Math.sin(t * 1.5) * 0.012 * breathe; torso.scale.set(1 + b, 1 + b * 1.4, 1 + b * 1.6); head.position.y = 12.4 + b * 12; ears.forEach((e, i) => { e.rotation.z = Math.sin(t * 2.2 + i * 2) * 0.08 + ((t + i * 0.3) % 4.3 < 0.18 ? 0.3 * (i ? -1 : 1) : 0); });
      const bl = blink && (t % 4.1) > 3.93 ? 0.05 : 1; E.forEach(o => { o.lid.scale.y = Math.max(0.03, 1 - lidK * bl); o.e.updateMatrixWorld(true); o.e.worldToLocal(tmp.copy(target)); tmp.z = Math.max(tmp.z, 0.1); tmp.normalize(); o.pu.position.set(tmp.x * 0.9, tmp.y * 0.9, 0.72); }); } };
  B.reach('R'); B.reach('L'); return B;
}

// ---------- cellar hatch ----------
export function cellarHatch(S, [x, z], { w = 5, d = 3.4, col = 0xffc040 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const st = M(0x3a3a40);
  put(g, mesh(rb(w + 0.8, 0.16, 0.4, 0.05), st, false), [0, 0.08, d / 2 + 0.2]); put(g, mesh(rb(w + 0.8, 0.16, 0.4, 0.05), st, false), [0, 0.08, -d / 2 - 0.2]); put(g, mesh(rb(0.4, 0.16, d, 0.05), st, false), [w / 2 + 0.2, 0.08, 0]); put(g, mesh(rb(0.4, 0.16, d, 0.05), st, false), [-w / 2 - 0.2, 0.08, 0]);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(w, d), basic(0x020203)), [0, 0.03, 0], [-Math.PI / 2, 0, 0]);
  const glowP = put(g, new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, d * 0.9), basic(col, { transparent: true, opacity: 0 })), [0, 0.04, 0], [-Math.PI / 2, 0, 0]);
  const leaves = [-1, 1].map(sx => { const p = new THREE.Group(); p.position.set(sx * w / 2, 0.14, 0); g.add(p); const lf = put(p, mesh(rb(w / 2, 0.14, d, 0.04), iron()), [-sx * w / 4, 0, 0]);
    for (const zz of [-d / 3, d / 3]) put(p, mesh(rb(w / 2 - 0.3, 0.05, 0.22, 0.02), M(0x4a4c52, { metalness: 0.7, roughness: 0.4 })), [-sx * w / 4, 0.09, zz]); put(p, mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 12), brass()), [-sx * (w / 2 - 0.5), 0.1, 0], [Math.PI / 2, 0, 0]); return p; });
  const light = new THREE.PointLight(col, 0, 16, 1.5); light.position.set(0, 0.8, 0); g.add(light);
  const H = { g, light, x, z, open(k) { leaves.forEach((p, i) => { p.rotation.z = (i ? -1 : 1) * k * 1.95; }); glowP.material.opacity = Math.min(1, k * 1.2) * 0.55; light.intensity = k * 26; },
    bang(t, k = 1) { H.open(Math.max(0, Math.sin(t * 13)) * 0.22 * k); } }; return H; }

// ---------- facades ----------
function facade(w, h, { base = 'brick', col = 0x6a2a22, rows = 3, cols = 3, seed = 1, lit = 0.3, ground = 0.25, winCol = '#ffd890', trim = '#d8cdb8' } = {}) {
  const R = rng(seed), W = 512, H = Math.min(1024, Math.round(512 * h / w)); const lits = [];
  const map = ctex(W, H, (c) => { c.fillStyle = base === 'brick' ? '#2a221e' : hex(col); c.fillRect(0, 0, W, H);
    if (base === 'brick') { const bh = 14, bw = 40; for (let r = 0; r < H / bh; r++) for (let i = -1; i < W / bw + 1; i++) { c.fillStyle = shade(col, 0.7 + Math.random() * 0.5); c.fillRect(i * bw + (r % 2) * bw / 2 + 1, r * bh + 1, bw - 2, bh - 2); } }
    else { for (let i = 0; i < 200; i++) { c.fillStyle = shade(col, 0.88 + Math.random() * 0.2); c.globalAlpha = 0.35; c.beginPath(); c.ellipse(Math.random() * W, Math.random() * H, 20 + Math.random() * 60, 10 + Math.random() * 30, 0, 0, 7); c.fill(); } c.globalAlpha = 1; for (let y = 0; y < H; y += 46) { c.fillStyle = 'rgba(0,0,0,0.10)'; c.fillRect(0, y, W, 2); } }
    const top = 30, bot = H * (1 - ground), ch = (bot - top) / rows, cw = W / cols;
    for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) { const ww = cw * 0.46, wh = ch * 0.62, x = i * cw + (cw - ww) / 2, y = top + r * ch + (ch - wh) / 2; const on = R() < lit; lits.push([x, y, ww, wh, on]);
      c.fillStyle = trim; c.fillRect(x - 6, y - 6, ww + 12, wh + 12); c.fillStyle = on ? winCol : '#141c2e'; c.fillRect(x, y, ww, wh); if (on) { c.fillStyle = 'rgba(180,90,40,0.5)'; c.fillRect(x, y, ww * 0.24, wh); c.fillRect(x + ww * 0.76, y, ww * 0.24, wh); } else { c.fillStyle = 'rgba(140,170,255,0.12)'; c.beginPath(); c.moveTo(x, y + wh * 0.7); c.lineTo(x + ww * 0.5, y); c.lineTo(x + ww * 0.7, y); c.lineTo(x, y + wh); c.fill(); }
      c.fillStyle = trim; c.fillRect(x + ww / 2 - 2, y, 4, wh); c.fillRect(x, y + wh / 2 - 2, ww, 4); c.fillRect(x - 10, y + wh + 6, ww + 20, 7); }
    c.fillStyle = trim; c.fillRect(0, 0, W, 14); noiseFill(c, W, H, 0.07, 4000); });
  const em = ctex(W, H, (c) => { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); for (const [x, y, ww, wh, on] of lits) if (on) { c.fillStyle = winCol; c.fillRect(x, y, ww, wh); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(x, y, ww * 0.24, wh); c.fillRect(x + ww * 0.76, y, ww * 0.24, wh); c.fillStyle = '#000'; c.fillRect(x + ww / 2 - 2, y, 4, wh); c.fillRect(x, y + wh / 2 - 2, ww, 4); } });
  return [map, em]; }
function building(S, x, w, h, o = {}) { const [map, em] = facade(w, h, o); const side = tmat(o.base === 'plaster' ? plasterTex(o.col) : brickTex(o.col), w / 8, h / 8), front = std({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: o.glow ?? 0.9, roughness: 0.9 });
  const g = new THREE.Group(); S.add(g); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 14), [side, side, side, side, front, side]); m.position.set(x, h / 2, -17); m.castShadow = m.receiveShadow = true; g.add(m);
  put(g, mesh(rb(w + 0.8, 0.9, 14.8, 0.1), M(0x2a2622)), [x, h + 0.3, -17]); put(g, mesh(rb(w + 0.3, 0.5, 0.5, 0.05), M(0x3a342e), false), [x, h * (1 - (o.ground ?? 0.25)) * 0 + 0.25, -9.85]); return g; }
const signTex = (text, { w = 512, h = 128, bg = '#7a1420', fg = '#ffe6a0', font = '800 84px "Inter", sans-serif', glow = null } = {}) => ctex(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; if (glow) { c.shadowColor = glow; c.shadowBlur = 24; } c.fillStyle = fg; c.fillText(text, w / 2, h / 2 + 4); if (glow) c.fillText(text, w / 2, h / 2 + 4); });
function lampPost(S, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); put(g, mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.9, 10), iron()), [0, 0.45, 0]); put(g, mesh(new THREE.CylinderGeometry(0.14, 0.18, 8.4, 8), iron()), [0, 4.8, 0]); put(g, mesh(rb(1.5, 0.12, 0.12, 0.04), iron()), [0, 7.6, 0]);
  put(g, mesh(new THREE.CylinderGeometry(0.5, 0.34, 1.1, 6), std({ color: 0xfff0c0, emissive: 0xffc870, emissiveIntensity: 2.2, roughness: 0.3 }), false), [0, 9.2, 0]); put(g, mesh(new THREE.ConeGeometry(0.72, 0.5, 6), iron()), [0, 10.0, 0]);
  const L = new THREE.PointLight(0xffc880, 60, 34, 1.5); L.position.set(0, 8.8, 0.6); g.add(L); return L; }

// ---------- Marrow Street ----------
export function marrowStreet(S, { time = 'night' } = {}) {
  const dawn = time === 'dawn'; if (!dawn) S.userData.look = 'night';
  S.background = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); if (dawn) { g.addColorStop(0, '#5a6aa8'); g.addColorStop(0.55, '#e8a890'); g.addColorStop(1, '#ffd8a0'); } else { g.addColorStop(0, '#04060f'); g.addColorStop(0.6, '#101a3a'); g.addColorStop(1, '#2a2a52'); } c.fillStyle = g; c.fillRect(0, 0, w, h); });
  S.fog = new THREE.Fog(dawn ? 0xe0a890 : 0x0c1226, 60, 190); clouds(S, dawn ? { tint: 0xffc8a0 } : { night: true });
  S.add(new THREE.HemisphereLight(dawn ? 0xffd8c0 : 0x4a5a9a, dawn ? 0x4a3a40 : 0x1a1412, dawn ? 0.95 : 0.6));
  const moon = new THREE.DirectionalLight(dawn ? 0xffb080 : 0x8aa8ff, dawn ? 2.6 : 1.5); moon.position.set(dawn ? 26 : -14, dawn ? 16 : 30, 22); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.03;
  Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 40, bottom: -12, near: 1, far: 120 }); S.add(moon, moon.target); const moonOff = moon.position.clone();
  if (!dawn) { const R = rng(7), n = 260, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (R() - 0.5) * 420; p[i * 3 + 1] = 34 + R() * 110; p[i * 3 + 2] = -150 - R() * 30; } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(p, 3)); S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.9, fog: false, sizeAttenuation: true })));
    put(S, new THREE.Mesh(new THREE.CircleGeometry(7, 32), basic(0xfff6d8, { fog: false })), [46, 74, -160]); put(S, new THREE.Mesh(new THREE.CircleGeometry(13, 32), basic(0x8aa0ff, { fog: false, transparent: true, opacity: 0.12 })), [46, 74, -160.5]); }
  else put(S, new THREE.Mesh(new THREE.CircleGeometry(12, 32), basic(0xfff0c0, { fog: false })), [120, 22, -150]);
  // ground
  box(S, [240, 0.3, 8], [0, -0.15, -6], tmat(slabTex(0x6a6870), 60, 2, { roughness: 0.6 }), { r: 0, cast: false, name: 'pavement' });
  box(S, [240, 0.3, 30], [0, -0.3, 13], tmat(cobbleTex(), 60, 8, { roughness: 0.32, metalness: 0.15 }), { r: 0, cast: false, name: 'road' }); put(S, mesh(rb(240, 0.34, 0.5, 0.06), M(0x8a8890), false), [0, -0.1, -1.9]);
  box(S, [240, 0.3, 14], [0, -0.16, -17], M(0x18181c), { r: 0, cast: false, name: 'ground' });
  for (const [px, pz, pr] of [[-30, 3, 2.4], [-6, 5.5, 1.8], [12, 2.5, 2.8], [28, 6, 2], [-48, 6, 2.2]]) { const pd = put(S, new THREE.Mesh(new THREE.CircleGeometry(pr, 20), std({ color: 0x0a0c14, roughness: 0.04, metalness: 0.6 })), [px, -0.13, pz], [-Math.PI / 2, 0, 0]); pd.scale.y = 0.6; }
  // OPERA HOUSE (x -51..-25)
  building(S, -38, 26, 22, { base: 'plaster', col: 0xd8c8a8, rows: 1, cols: 5, seed: 3, lit: 0.6, ground: 0.66, winCol: '#ffcf80' }); const stone = tmat(plasterTex(0xe8dcc4), 1, 3), red = M(0x7a1420);
  put(S, mesh(rb(27, 0.6, 3.6, 0.08), tmat(slabTex(0xb8b0a0), 7, 1)), [-38, 0.3, -8.4]);
  for (const cx of [-47.6, -41.4, -34.6, -28.4]) { put(S, mesh(new THREE.CylinderGeometry(0.85, 0.95, 12, 14), stone), [cx, 6.6, -8.4]); put(S, mesh(rb(2.3, 0.6, 2.3, 0.08), stone), [cx, 0.9, -8.4]); put(S, mesh(rb(2.4, 0.7, 2.4, 0.08), stone), [cx, 12.9, -8.4]); }
  put(S, mesh(rb(27, 1.6, 2.8, 0.1), stone), [-38, 14.0, -8.6]); const tri = new THREE.Shape(); tri.moveTo(-13.5, 0); tri.lineTo(13.5, 0); tri.lineTo(0, 5.2); const ped = put(S, mesh(new THREE.ExtrudeGeometry(tri, { depth: 2.4, bevelEnabled: false }), stone), [-38, 14.8, -9.8]);
  const odoor = put(S, new THREE.Mesh(new THREE.PlaneGeometry(4.6, 8.4), std({ color: 0x7a1420, emissive: 0xff7a40, emissiveIntensity: 0.9, map: ctex(128, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#5a0a14'); g.addColorStop(0.5, '#ffb060'); g.addColorStop(1, '#5a0a14'); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(60,0,10,0.35)'; c.fillRect(i * 16, 0, 5, h); } }) })), [-38, 4.8, -9.9]);
  const marquee = put(S, mesh(rb(11, 2.4, 0.5, 0.1), std({ map: signTex('OPERA'), emissive: 0xffffff, emissiveMap: signTex('OPERA'), emissiveIntensity: 1.3 })), [-38, 11.2, -7.6]); const bulbs = [];
  for (let i = 0; i < 26; i++) { const u = i / 26, per = 2 * (11.4 + 2.8), dd = u * per; let bx, by; if (dd < 11.4) { bx = -5.7 + dd; by = 1.4; } else if (dd < 14.2) { bx = 5.7; by = 1.4 - (dd - 11.4); } else if (dd < 25.6) { bx = 5.7 - (dd - 14.2); by = -1.4; } else { bx = -5.7; by = -1.4 + (dd - 25.6); }
    bulbs.push(put(S, new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), basic(0xffe9a0)), [-38 + bx, 11.2 + by, -7.3])); }
  const operaL = new THREE.PointLight(0xffb870, 70, 30, 1.5); operaL.position.set(-38, 8.5, -5.2); S.add(operaL);
  for (const px of [-44.5, -31.5]) { put(S, mesh(rb(2.6, 3.8, 0.16, 0.05), brass()), [px, 5.0, -9.9]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.4), std({ map: textTex22([['TONIGHT', '800 60px "Inter", sans-serif', '#ffe6a0', 90], ['LULLABIES', '800 52px "Inter", sans-serif', '#fff', 70], ['for the', 'italic 40px Georgia', '#ffe6a0', 60], ['BASEMENT', '800 54px "Inter", sans-serif', '#fff', 60]], { w: 340, h: 512, bg: '#3a1030', top: 130, stain: false }), emissive: 0x3a1030, emissiveIntensity: 0.4 })), [px, 5.0, -9.8]); }
  for (const tx of [-50, -26]) { put(S, mesh(new THREE.CylinderGeometry(0.7, 0.55, 1.2, 10), M(0x7a4a2a)), [tx, 0.6, -3.4]); put(S, mesh(new THREE.ConeGeometry(1.0, 3.4, 10), M(0x1c5a34, { roughness: 1 })), [tx, 2.9, -3.4]); }
  // LAUNDROMAT (x -19..-1)
  building(S, -10, 18, 13, { base: 'plaster', col: 0x1f7a7a, rows: 1, cols: 4, seed: 5, lit: 0.25, ground: 0.6 });
  const washT = ctex(512, 256, (c, w, h) => { c.fillStyle = '#e8f4f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8d8d0'; for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) c.fillRect(i * 32, j * 32, 32, 32);
    for (let i = 0; i < 4; i++) { const x = 24 + i * 124; c.fillStyle = '#f8f8f4'; c.fillRect(x, 70, 100, 170); c.strokeStyle = '#8a9aa0'; c.lineWidth = 3; c.strokeRect(x, 70, 100, 170); c.fillStyle = '#5ac8e8'; c.beginPath(); c.arc(x + 50, 165, 36, 0, 7); c.fill(); c.strokeStyle = '#3a4a50'; c.lineWidth = 7; c.stroke(); c.fillStyle = ['#e84a6a', '#f2c420', '#8a5ad0', '#fafafa'][i]; c.beginPath(); c.ellipse(x + 50, 172, 22, 12, i, 0, 7); c.fill(); c.fillStyle = '#e84a4a'; c.fillRect(x + 12, 82, 14, 8); c.fillStyle = '#3a4a50'; c.fillRect(x + 36, 80, 50, 12); } });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(10.4, 5.2), std({ map: washT, emissive: 0xffffff, emissiveMap: washT, emissiveIntensity: 0.4 })), [-12.6, 3.7, -9.92]); for (const fx of [-17.9, -12.6, -7.3]) put(S, mesh(rb(0.24, 5.5, 0.24, 0.04), M(0xf2f2ee), false), [fx, 3.7, -9.85]); put(S, mesh(rb(10.9, 0.24, 0.3, 0.04), M(0xf2f2ee), false), [-12.6, 6.4, -9.85]); put(S, mesh(rb(10.9, 0.3, 0.5, 0.04), M(0xf2f2ee), false), [-12.6, 1.05, -9.8]);
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.8, 6.4), std({ color: 0xd8f0f0, emissive: 0xbfe8e8, emissiveIntensity: 0.4 })), [-3.9, 3.3, -9.92]); put(S, mesh(rb(3.2, 0.3, 0.3, 0.04), M(0xf2f2ee), false), [-3.9, 6.6, -9.85]); put(S, mesh(rb(0.12, 1.2, 0.12, 0.04), brass()), [-2.9, 3.3, -9.8]);
  const neonT = signTex('WASH', { bg: null, fg: '#ffd0e4', glow: '#ff3a90', font: '800 100px "Inter", sans-serif' }); const neon = put(S, new THREE.Mesh(new THREE.PlaneGeometry(8, 2), basic(0xffffff, { map: neonT, transparent: true })), [-10, 9.3, -9.8]); put(S, mesh(rb(8.6, 2.5, 0.2, 0.06), M(0x12383a), false), [-10, 9.3, -9.95]);
  const neonL = new THREE.PointLight(0xff5aa0, 34, 24, 1.5); neonL.position.set(-10, 8.2, -6.4); S.add(neonL); const washL = new THREE.PointLight(0xc8f0ff, 30, 20, 1.5); washL.position.set(-11, 4, -6.6); S.add(washL);
  for (let i = 0; i < 6; i++) put(S, mesh(rb(1.8, 0.12, 2.6, 0.04), M(i % 2 ? 0xf2f2ee : 0xe84a6a), false), [-17.2 + i * 1.8, 7.3, -8.8], [0.42, 0, 0]);
  put(S, mesh(rb(4.2, 0.22, 1.2, 0.06), tmat(woodTex(0x8a5a2e), 2, 1)), [-15.6, 1.5, -9.0]); for (const bx of [-17.3, -13.9]) put(S, mesh(rb(0.22, 1.4, 1.1, 0.04), iron()), [bx, 0.7, -9.0]);
  // No. 9 (x 6..22) — its own group so it can jolt
  const N9 = new THREE.Group(); S.add(N9); const n9 = building(N9, 14, 16, 34, { base: 'brick', col: 0x6a2a22, rows: 5, cols: 3, seed: 11, lit: 0.34, ground: 0.2 });
  box(S, [4.6, 1.2, 1.7], [14, 0.6, -9.15], tmat(slabTex(0x8a8480), 2, 1), { r: 0.05, name: 'stoop' }); box(S, [4.6, 0.8, 0.8], [14, 0.4, -7.9], tmat(slabTex(0x8a8480), 2, 1), { r: 0.05, name: 'stoop' }); box(S, [4.6, 0.4, 0.8], [14, 0.2, -7.1], tmat(slabTex(0x8a8480), 2, 1), { r: 0.05, name: 'stoop' });
  put(N9, mesh(rb(3.2, 6.6, 0.3, 0.06), tmat(woodTex(0x1f4a32), 1, 2)), [14, 4.5, -9.95]); put(N9, new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.1), std({ color: 0xfff0c0, emissive: 0xffc870, emissiveIntensity: 1.4 })), [14, 8.5, -9.9]); put(N9, mesh(new THREE.SphereGeometry(0.14, 8, 6), brass()), [15.2, 4.3, -9.72]);
  put(N9, mesh(rb(3.8, 0.4, 0.5, 0.06), M(0xd8cdb8)), [14, 9.3, -9.8]); for (const sx of [-1, 1]) put(N9, mesh(rb(0.4, 8.2, 0.4, 0.06), M(0xd8cdb8)), [14 + sx * 1.8, 5.2, -9.8]);
  const nineT = signTex('9', { w: 128, h: 128, bg: '#1a1a1e', fg: '#ffd870', font: '800 100px Georgia, serif' }); put(N9, mesh(rb(1.3, 1.3, 0.14, 0.2), std({ map: nineT, emissive: 0xffffff, emissiveMap: nineT, emissiveIntensity: 0.7, metalness: 0.3 })), [17.0, 5.6, -9.88]);
  const doorL = new THREE.PointLight(0xffc880, 30, 18, 1.5); doorL.position.set(14, 8.2, -8.2); S.add(doorL);
  put(N9, new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), std({ color: 0xfff0c0, emissive: 0xffb060, emissiveIntensity: 1.6 })), [19.33, 13.3, -9.96]);
  for (let i = 0; i < 3; i++) { const fy = 8.6 + i * 5.44; put(N9, mesh(rb(4.6, 0.16, 1.7, 0.03), iron()), [19.2, fy, -9.1]); put(N9, mesh(rb(4.6, 0.1, 0.1, 0.02), iron(), false), [19.2, fy + 1.6, -8.3]); for (let k = 0; k < 6; k++) put(N9, mesh(rb(0.08, 1.6, 0.08, 0.02), iron(), false), [17.0 + k * 0.88, fy + 0.8, -8.3]);
    if (i < 2) put(N9, mesh(rb(0.9, 6.0, 0.12, 0.02), iron(), false), [20.6 - i * 2.6, fy + 2.7, -8.9], [0, 0, i ? -0.3 : 0.3]); }
  for (const [bx, bz, bc] of [[3.9, -8.6, 0x4a5a54], [2.2, -8.3, 0x54504a]]) { put(S, mesh(new THREE.CylinderGeometry(0.85, 0.72, 2.2, 12), M(bc, { metalness: 0.5, roughness: 0.5 })), [bx, 1.1, bz]); put(S, mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.14, 12), M(0x3a4440, { metalness: 0.5 })), [bx, 2.27, bz]); }
  put(S, mesh(rb(7.2, 9, 0.4, 0.05), tmat(woodTex(0x3a2a20), 3, 2)), [2.5, 4.5, -15]); put(S, mesh(rb(6.4, 11, 0.4, 0.05), tmat(brickTex(0x3a2a2a), 2, 3)), [-22, 5.5, -15]);
  // fillers
  building(S, -64, 26, 26, { base: 'plaster', col: 0x55688a, rows: 4, cols: 4, seed: 21, lit: 0.3, ground: 0.2 }); building(S, 34, 24, 22, { base: 'brick', col: 0x4a5644, rows: 3, cols: 4, seed: 23, lit: 0.35, ground: 0.24 }); building(S, 59, 26, 28, { base: 'plaster', col: 0x7a566a, rows: 4, cols: 4, seed: 27, lit: 0.3, ground: 0.2 }); building(S, -90, 26, 20, { base: 'brick', col: 0x5a3a2a, rows: 3, cols: 4, seed: 29, lit: 0.3 });
  put(S, mesh(rb(3.2, 6.2, 0.3, 0.06), tmat(woodTex(0x5a2a1a), 1, 2)), [34, 3.1, -9.95]); put(S, mesh(rb(10, 0.3, 2.2, 0.05), M(0x8a2a2a), false), [34, 6.9, -8.9], [0.3, 0, 0]);
  // street furniture
  const lamps = [lampPost(S, -24.5, -2.6), lampPost(S, 1.5, -2.6), lampPost(S, 25, -2.6)]; if (dawn) lamps.forEach(l => { l.intensity = 14; });
  put(S, mesh(new THREE.CylinderGeometry(0.34, 0.4, 1.2, 10), M(0xc8302a, { roughness: 0.4 })), [21.5, 0.6, -3.0]); put(S, mesh(new THREE.SphereGeometry(0.36, 10, 8), M(0xc8302a, { roughness: 0.4 })), [21.5, 1.25, -3.0]);
  put(S, mesh(rb(1.3, 2.2, 1.1, 0.3), M(0x2a4a9a, { roughness: 0.4 })), [-20.6, 2.0, -3.3]); put(S, mesh(rb(0.3, 1.0, 0.3, 0.05), M(0x1a2a5a)), [-20.6, 0.5, -3.3]);
  put(S, new THREE.Mesh(new THREE.CircleGeometry(1.1, 18), M(0x2a2a30, { metalness: 0.6, roughness: 0.5 })), [-4, -0.13, 4], [-Math.PI / 2, 0, 0]);
  const steam = [0, 1, 2, 3, 4].map(i => put(S, new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), basic(0xc8d0e8, { transparent: true, opacity: 0.1, depthWrite: false })), [-4, 0, 4]));
  const hatch = { opera: cellarHatch(S, [-38, -4.6], { col: 0xb060ff }), wash: cellarHatch(S, [-11, -4.6], { col: 0xff70b0 }), nine: cellarHatch(S, [9, -4.6], { col: 0xffc040 }) };
  const key = new THREE.PointLight(0xffe4c8, 0, 22, 1.5); S.add(key);
  return { hatch, lamps, key, moon, n9: N9, neon, shake(k) { N9.position.y = k; }, keyAt(x, y, z, i = 16) { key.position.set(x, y, z); key.intensity = i; },
    follow(x) { moon.target.position.set(x, 0, -4); moon.position.set(x + moonOff.x, moonOff.y, moonOff.z); },
    update(t) { bulbs.forEach((b, i) => { b.material.color.setHex(Math.floor(t * 6 + i) % 3 ? 0xffe9a0 : 0x7a5a20); }); const f = (Math.sin(t * 31) > 0.93 || Math.sin(t * 7.3) > 0.985) ? 0.35 : 1; neon.material.opacity = f; neonL.intensity = 34 * f;
      steam.forEach((s, i) => { const u = (t * 0.35 + i / 5) % 1; s.position.set(-4 + Math.sin(u * 5 + i) * 0.5, u * 6, 4); s.scale.setScalar(0.6 + u * 2.2); s.material.opacity = 0.12 * (1 - u); }); } };
}

// ---------- Dana's flat ----------
function motes(S, n, [x0, x1, y0, y1, z0, z1], col = 0xffe8c0, size = 0.09, op = 0.5) { const R = rng(n), p = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) base.push([x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), z0 + R() * (z1 - z0), R() * 6.28]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, transparent: true, opacity: op, depthWrite: false })); pts.frustumCulled = false; S.add(pts);
  const upd = (t) => { for (let i = 0; i < n; i++) { const b = base[i]; p[i * 3] = b[0] + Math.sin(t * 0.3 + b[3]) * 0.6; p[i * 3 + 1] = b[1] + Math.sin(t * 0.22 + b[3] * 2) * 0.5; p[i * 3 + 2] = b[2] + Math.cos(t * 0.26 + b[3]) * 0.6; } g.attributes.position.needsUpdate = true; }; upd(0); return { pts, update: upd }; }
export function danaFlat(S, { receipts = 11 } = {}) {
  S.background = new THREE.Color(0x0a0808);
  box(S, [18.8, 0.3, 20.6], [0, -0.15, 2.1], tmat(woodTex(0x8a5a34), 5, 5, { roughness: 0.6 }), { r: 0, cast: false, name: 'floor' });
  const wp = (rx, ry) => tmat(paperTex22('#2f5d5a', '#356864', '#d8b060'), rx, ry), cream = M(0xe8dcc4);
  box(S, [12.7, 9.5, 0.4], [-2.65, 4.75, -8.2], wp(5, 3.4), { r: 0, cast: false, name: 'back wall' }); box(S, [0.8, 9.5, 0.4], [8.6, 4.75, -8.2], wp(0.3, 3.4), { r: 0, cast: false, name: 'back wall' }); box(S, [4.5, 2.3, 0.4], [5.95, 8.35, -8.2], wp(1.8, 0.8), { r: 0, cast: false, name: 'back wall' });
  box(S, [0.4, 9.5, 20.6], [-9.2, 4.75, 2.1], wp(8, 3.4), { r: 0, cast: false, name: 'left wall' }); box(S, [0.4, 9.5, 20.6], [9.2, 4.75, 2.1], wp(8, 3.4), { r: 0, cast: false, name: 'right wall' }); box(S, [18.8, 9.5, 0.4], [0, 4.75, 12.4], wp(7, 3.4), { r: 0, cast: false, name: 'front wall' });
  box(S, [18.8, 0.3, 20.6], [0, 9.65, 2.1], M(0xe8dcc8), { r: 0, cast: false, solid: false }); put(S, mesh(rb(12.7, 0.5, 0.16, 0.04), cream, false), [-2.65, 0.25, -7.95]); put(S, mesh(rb(12.7, 0.2, 0.14, 0.04), cream, false), [-2.65, 7.9, -7.95]);
  // window with the night city + neon
  const cityT = ctex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a1030'); g.addColorStop(1, '#3a2a5a'); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 7; i++) { const bw = 30 + Math.random() * 30, bh = 60 + Math.random() * 130, x = i * 38 - 10; c.fillStyle = '#0c0e1c'; c.fillRect(x, h - bh, bw, bh); for (let k = 0; k < 14; k++) if (Math.random() < 0.45) { c.fillStyle = Math.random() < 0.8 ? '#ffd890' : '#9ad0ff'; c.fillRect(x + 4 + (k % 3) * 9, h - bh + 8 + Math.floor(k / 3) * 22, 5, 8); } }
    c.shadowColor = '#ff3a90'; c.shadowBlur = 14; c.fillStyle = '#ffb0d0'; c.font = '800 34px "Inter", sans-serif'; c.fillText('WASH', 138, 150); c.fillText('WASH', 138, 150); });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(5.2, 4.0), basic(0xffffff, { map: cityT })), [-4.2, 5.8, -7.97]); for (const dx of [-2.7, 0, 2.7]) put(S, mesh(rb(0.2, 4.4, 0.2, 0.04), cream, false), [-4.2 + dx, 5.8, -7.9]); for (const dy of [-2.1, 0, 2.1]) put(S, mesh(rb(5.6, 0.2, 0.2, 0.04), cream, false), [-4.2, 5.8 + dy, -7.9]);
  put(S, mesh(rb(6.2, 0.2, 0.5, 0.05), cream), [-4.2, 3.62, -7.8]); for (const cx of [-7.3, -1.1]) put(S, mesh(rb(0.9, 4.9, 0.22, 0.1), M(0xd8a030, { roughness: 1 })), [cx, 5.9, -7.75]); put(S, mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.6, 6), brass()), [-4.2, 8.3, -7.75], [0, 0, Math.PI / 2]);
  const neonL = new THREE.PointLight(0xff6aa0, 7, 12, 1.6); neonL.position.set(-4.2, 6, -6.4); S.add(neonL); const rim = new THREE.DirectionalLight(0x8aa8ff, 0.8); rim.position.set(-6, 8, -12); S.add(rim);
  // counter + stove
  box(S, [7.4, 3.0, 1.6], [-5.1, 1.5, -7.2], tmat(woodTex(0x2a6a6a), 3, 1), { r: 0.05, name: 'counter' }); put(S, mesh(rb(7.6, 0.14, 1.8, 0.04), tmat(woodTex(0xb88a4a), 3, 1, { roughness: 0.5 })), [-5.1, 3.05, -7.2]);
  for (let i = 0; i < 3; i++) { put(S, mesh(rb(2.1, 2.2, 0.08, 0.04), tmat(woodTex(0x327a78), 1, 1), false), [-7.5 + i * 2.4, 1.5, -6.37]); put(S, mesh(new THREE.SphereGeometry(0.09, 8, 6), brass()), [-7.5 + i * 2.4 + 0.7, 2.2, -6.3]); }
  put(S, mesh(rb(2.3, 0.1, 1.5, 0.03), M(0x1a1a1e, { roughness: 0.3 })), [-7.0, 3.16, -7.2]); const burner = put(S, mesh(new THREE.TorusGeometry(0.4, 0.06, 6, 18), std({ color: 0xff7a30, emissive: 0xff5a10, emissiveIntensity: 2 })), [-7.5, 3.23, -7.2], [Math.PI / 2, 0, 0]); put(S, mesh(new THREE.TorusGeometry(0.4, 0.06, 6, 18), M(0x3a3a3e)), [-6.5, 3.23, -7.2], [Math.PI / 2, 0, 0]);
  put(S, mesh(new THREE.CylinderGeometry(0.52, 0.5, 0.62, 16), M(0xc8302a, { roughness: 0.3 })), [-7.5, 3.58, -7.2]); put(S, mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16), M(0x9a1e1a, { roughness: 0.3 })), [-7.5, 3.92, -7.2]);
  const steam = [0, 1, 2].map(() => put(S, new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), basic(0xffffff, { transparent: true, opacity: 0.12, depthWrite: false })), [-7.5, 4.2, -7.2]));
  put(S, mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.6, 12), M(0xe8c040, { metalness: 0.6, roughness: 0.3 })), [-3.4, 3.42, -7.3]); put(S, mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 10), M(0xb8a888)), [-2.4, 3.42, -7.5]); for (let i = 0; i < 3; i++) put(S, mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4), M(0x9a6a3a)), [-2.4 + (i - 1) * 0.1, 3.9, -7.5], [0, 0, (i - 1) * 0.2]);
  put(S, mesh(rb(1.2, 0.08, 0.8, 0.03), tmat(woodTex(0xc89a5a), 1, 1)), [-4.9, 3.16, -7.0]); put(S, mesh(new THREE.SphereGeometry(0.2, 10, 8), M(0xd8302a, { roughness: 0.3 })), [-5.1, 3.38, -7.0]);
  // shelves + pans on the left wall
  for (const sy of [5.0, 6.9]) { put(S, mesh(rb(0.9, 0.14, 5.2, 0.03), tmat(woodTex(0x8a5a2e), 1, 2)), [-8.55, sy, -3.6]); for (let i = 0; i < 6; i++) put(S, mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.55 + (i % 3) * 0.14, 10), M([0xd8a030, 0xb8301e, 0x3a8a5a, 0xe8dcc4, 0x6a4a8a, 0xc87a3a][(i + (sy > 6 ? 2 : 0)) % 6], { roughness: 0.4 })), [-8.5, sy + 0.38 + (i % 3) * 0.07, -5.8 + i * 0.85]); }
  for (let i = 0; i < 3; i++) { put(S, mesh(new THREE.CylinderGeometry(0.55 - i * 0.08, 0.5 - i * 0.08, 0.12, 16), M(0x3a3a40, { metalness: 0.7, roughness: 0.35 })), [-8.9, 6.2 - i * 0.2, 0.2 + i * 1.4], [0, 0, Math.PI / 2]); put(S, mesh(rb(0.08, 0.9, 0.14, 0.03), M(0x2a2a2e)), [-8.9, 5.3 - i * 0.2, 0.2 + i * 1.4]); }
  // fridge with bills
  box(S, [2.4, 6.6, 2.0], [0.1, 3.3, -7.0], M(0xbfe0d0, { roughness: 0.35 }), { r: 0.2, name: 'fridge' }); put(S, mesh(rb(2.3, 0.06, 0.06, 0.02), M(0x8ab0a0)), [0.1, 4.7, -5.98]); put(S, mesh(rb(0.12, 1.3, 0.16, 0.05), M(0xd8d8dc, { metalness: 0.8, roughness: 0.3 })), [-0.85, 5.6, -5.92]); put(S, mesh(rb(0.12, 1.6, 0.16, 0.05), M(0xd8d8dc, { metalness: 0.8, roughness: 0.3 })), [-0.85, 3.4, -5.92]);
  const bill = (txt, x, y, rz, s = 1) => { const p = paper(S, [['FINAL', '800 96px "Inter", sans-serif', '#c81e1e', 100], ['NOTICE', '800 96px "Inter", sans-serif', '#c81e1e', 110], [txt, '700 54px "Inter", sans-serif', '#2a1a10', 70], ['———————', '400 40px "Inter", sans-serif', '#8a7a6a', 50], ['———————', '400 40px "Inter", sans-serif', '#8a7a6a', 50]], { w: 0.85 * s, h: 1.1 * s, tex: { top: 140 } }); p.position.set(x, y, -5.96); p.rotation.z = rz; put(p, mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), M(0xe84a4a)), [0, 0.45 * s, 0.03], [Math.PI / 2, 0, 0]); return p; };
  bill('RENT OVERDUE', 0.45, 5.6, -0.08); bill('3 MONTHS', 0.25, 4.0, 0.1); bill('PAY NOW', 0.6, 2.6, -0.14, 0.85);
  // cork board of receipts
  put(S, mesh(rb(2.5, 3.6, 0.12, 0.04), tmat(woodTex(0x6a4022), 1, 1)), [2.35, 5.4, -7.92]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.25, 3.3), M(0xc89a62, { roughness: 1 })), [2.35, 5.4, -7.85]);
  const rT = textTex22([['RENT', '800 110px "Inter", sans-serif', '#2a1a10', 120], ['PAID', '800 130px "Inter", sans-serif', '#1c8a4a', 120], ['in full', 'italic 70px Georgia', '#2a1a10', 60]], { w: 384, h: 512, top: 150 }); const rm = std({ map: rT, roughness: 0.9, emissive: 0xffffff, emissiveMap: rT, emissiveIntensity: 0.15 }); const recs = [];
  for (let i = 0; i < 12; i++) { const r = put(S, new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.8), rm), [1.62 + (i % 3) * 0.73, 6.55 - Math.floor(i / 3) * 0.86, -7.82 + (i % 2) * 0.01], [0, 0, Math.sin(i * 2.3) * 0.12]); put(r, new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), M(0xe84a4a)), [0, 0.32, 0.03]); recs.push(r); }
  // front door (hinge x 4.1) + hall
  const pivot = new THREE.Group(); pivot.position.set(3.7, 0, -8.05); S.add(pivot); put(pivot, mesh(rb(4.5, 7.2, 0.22, 0.05), tmat(woodTex(0xc8862a), 1.5, 2)), [2.25, 3.62, 0]); for (const py of [1.9, 5.3]) put(pivot, mesh(rb(3.5, 2.6, 0.06, 0.04), tmat(woodTex(0xb07420), 1, 1), false), [2.25, py, 0.13]); put(pivot, mesh(new THREE.SphereGeometry(0.16, 10, 8), brass()), [4.1, 3.5, 0.24]);
  const dT = signTex('3B', { w: 128, h: 64, bg: '#1a1a1e', fg: '#ffd870', font: '800 46px Georgia, serif' }); put(pivot, new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), std({ map: dT, metalness: 0.4 })), [2.25, 6.75, 0.13]);
  put(S, mesh(rb(0.22, 7.4, 0.5, 0.04), cream, false), [3.58, 3.7, -8.0]); put(S, mesh(rb(0.22, 7.4, 0.5, 0.04), cream, false), [8.32, 3.7, -8.0]); put(S, mesh(rb(5.0, 0.24, 0.5, 0.04), cream, false), [5.95, 7.32, -8.0]);
  box(S, [7, 0.3, 6], [5.6, -0.15, -11.4], tmat(checkTex('#b8a060', '#2a2a2a'), 2, 2), { r: 0, cast: false, name: 'hall floor' }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(9, 10), tmat(paperTex22('#5a7a5a', '#63845f', '#c8b070'), 3, 3)), [5.6, 5, -13.6]);
  const hallL = new THREE.PointLight(0xffd0a0, 9, 11, 1.6); hallL.position.set(5.6, 6.2, -10.8); S.add(hallL);
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), M(0x7a3a2a, { roughness: 1 })), [5.95, 0.02, -6.9], [-Math.PI / 2, 0, 0]);
  // table + pendant lamp
  const tw = tmat(woodTex(0x9a6a3a), 2, 2, { roughness: 0.5 }); put(S, mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.16, 28), tw), [-2.6, 2.52, -2.2]); put(S, mesh(new THREE.CylinderGeometry(0.22, 0.3, 2.4, 10), tw), [-2.6, 1.25, -2.2]); put(S, mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.14, 16), tw), [-2.6, 0.07, -2.2]);
  put(S, mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 10), M(0x3a6ab8, { roughness: 0.3 })), [-3.6, 2.85, -2.9]); put(S, mesh(new THREE.SphereGeometry(0.2, 8, 6), M(0xf2c420)), [-3.6, 3.5, -2.9]); put(S, mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), M(0x3a8a3a)), [-3.6, 3.25, -2.9]);
  for (let i = 0; i < 3; i++) put(S, mesh(rb(0.8, 0.02, 1.0, 0.005), M(i ? 0xf4ecd8 : 0xf8e0e0)), [-1.5 + i * 0.05, 2.62 + i * 0.022, -2.7 + i * 0.04], [0, 0.3 + i * 0.25, 0]);
  for (const [cx, cz, cr] of [[-5.6, -2.0, 0.4]]) { put(S, mesh(rb(1.5, 0.16, 1.5, 0.05), tw), [cx, 1.6, cz], [0, cr, 0]); put(S, mesh(rb(1.5, 2.0, 0.16, 0.05), tw), [cx - 0.68, 2.6, cz - 0.28], [0, cr + Math.PI / 2, 0]); for (const [lx, lz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) put(S, mesh(rb(0.14, 1.6, 0.14, 0.03), tw), [cx + lx, 0.8, cz + lz]); }
  put(S, mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.6, 4), M(0x1a1a1e), false), [-2.6, 8.2, -2.2]); put(S, mesh(new THREE.ConeGeometry(1.15, 0.9, 20, 1, true), std({ color: 0xd8a030, emissive: 0xffb040, emissiveIntensity: 0.35, side: THREE.DoubleSide, roughness: 0.6 }), false), [-2.6, 6.75, -2.2]); put(S, new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), basic(0xfff2c8)), [-2.6, 6.5, -2.2]);
  const lamp = new THREE.PointLight(0xffc888, 80, 28, 1.6); lamp.position.set(-2.6, 6.2, -2.2); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.003; S.add(lamp);
  const key = new THREE.PointLight(0xffe2c0, 18, 20, 1.5); key.position.set(-1, 5.6, 5); S.add(key); S.add(new THREE.HemisphereLight(0xffe0c0, 0x3a2a22, 0.6));
  const rugT = ctex(256, 256, (c, w, h) => { [['#d8a030', 128], ['#2a6a6a', 104], ['#e8dcc4', 80], ['#b8301e', 54], ['#d8a030', 28]].forEach(([col, r]) => { c.fillStyle = col; c.beginPath(); c.arc(128, 128, r, 0, 7); c.fill(); }); noiseFill(c, w, h, 0.1, 3000); });
  put(S, new THREE.Mesh(new THREE.CircleGeometry(3.7, 36), std({ map: rugT, roughness: 1 })), [-2.6, 0.02, -2.0], [-Math.PI / 2, 0, 0]);
  // daybed + crate lamp
  box(S, [3.4, 1.4, 7.2], [7.3, 0.7, 3.6], tmat(woodTex(0x6a4022), 1, 2), { r: 0.06, name: 'bed' }); put(S, mesh(rb(3.2, 0.6, 7.0, 0.2), M(0xf0e8d8, { roughness: 1 })), [7.3, 1.7, 3.6]);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) put(S, mesh(rb(1.56, 0.1, 1.2, 0.03), M([0xd8a030, 0x2a6a6a, 0xb8301e, 0xe8dcc4, 0x6a4a8a][(i + j * 2) % 5], { roughness: 1 }), false), [6.52 + j * 1.58, 2.04, 2.6 + i * 1.22]); for (const [px, pz, pc] of [[6.6, 0.7, 0xd8a030], [7.9, 0.8, 0xe8dcc4]]) put(S, mesh(rb(1.3, 0.5, 1.0, 0.22), M(pc, { roughness: 1 })), [px, 2.3, pz], [0.3, 0, 0]);
  put(S, mesh(rb(1.5, 1.6, 1.5, 0.04), tmat(woodTex(0xa87a44), 1, 1)), [7.9, 0.8, -1.6]); put(S, mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.7, 8), brass()), [7.9, 1.95, -1.6]); put(S, mesh(new THREE.CylinderGeometry(0.34, 0.5, 0.6, 12, 1, true), std({ color: 0xffe0a0, emissive: 0xffb060, emissiveIntensity: 1.2, side: THREE.DoubleSide }), false), [7.9, 2.6, -1.6]);
  const bedL = new THREE.PointLight(0xffb070, 9, 10, 1.6); bedL.position.set(7.4, 3.0, -1.4); S.add(bedL);
  // plants, bookshelf, art, string lights
  put(S, mesh(new THREE.CylinderGeometry(0.5, 0.36, 0.8, 10), M(0xb8603a)), [8.3, 0.4, -4.2]); for (let i = 0; i < 7; i++) put(S, mesh(new THREE.ConeGeometry(0.3, 2.6, 5), M(0x2a7a3a, { roughness: 1 })), [8.3 + Math.sin(i * 0.9) * 0.4, 2.0, -4.2 + Math.cos(i * 0.9) * 0.4], [Math.cos(i * 0.9) * 0.35, 0, -Math.sin(i * 0.9) * 0.35]);
  put(S, mesh(new THREE.CylinderGeometry(0.36, 0.26, 0.5, 10), M(0xe8dcc4)), [-1.5, 8.0, -7.2]); put(S, mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 4), M(0x8a7a5a), false), [-1.5, 8.9, -7.2]); const vines = [0, 1, 2, 3].map(i => { const v = new THREE.Group(); v.position.set(-1.5 + Math.sin(i * 1.6) * 0.3, 7.8, -7.2 + Math.cos(i * 1.6) * 0.3); S.add(v); for (let k = 0; k < 5; k++) put(v, mesh(new THREE.SphereGeometry(0.16, 6, 5), M(0x3a8a4a, { roughness: 1 }), false), [0, -k * 0.3, 0]).scale.y = 0.6; return v; });
  box(S, [1.5, 4.4, 4.2], [-8.2, 2.2, 6.2], tmat(woodTex(0x6a4022), 1, 2), { r: 0.05, name: 'bookshelf' }); for (let s = 0; s < 3; s++) for (let i = 0; i < 9; i++) put(S, mesh(rb(0.9, 0.9 + (i % 3) * 0.12, 0.3, 0.03), M([0xb8301e, 0x2a6a6a, 0xd8a030, 0x6a4a8a, 0xe8dcc4][(i + s) % 5]), false), [-7.72, 1.0 + s * 1.4, 4.5 + i * 0.4]);
  for (let i = 0; i < 3; i++) { put(S, mesh(rb(0.1, 1.6 + (i % 2) * 0.4, 1.3, 0.03), M(0x3a2414)), [-8.95, 5.6 + (i % 2) * 0.3, 3.2 + i * 1.9]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.3 + (i % 2) * 0.4), M([0xe8b850, 0x6ab0d8, 0xe88a6a][i])), [-8.89, 5.6 + (i % 2) * 0.3, 3.2 + i * 1.9], [0, Math.PI / 2, 0]); }
  const fairy = []; for (let i = 0; i < 16; i++) { const u = i / 15; fairy.push(put(S, new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), basic(0xffe9a0)), [-8.6 + u * 12.4, 8.75 - Math.sin(u * Math.PI * 3) ** 2 * 0.35, -7.9])); }
  const dust = motes(S, 60, [-8, 8, 1, 8, -7, 8], 0xffe8c0, 0.07, 0.35);
  const env = { lamp, key, door: { pivot, open(k) { pivot.rotation.y = -k * 1.75; } }, receipts(n) { recs.forEach((r, i) => { r.visible = i < n; }); }, recs,
    update(t) { steam.forEach((s, i) => { const u = (t * 0.5 + i / 3) % 1; s.position.set(-7.5 + Math.sin(u * 6 + i) * 0.15, 4.0 + u * 1.6, -7.2); s.scale.setScalar(0.6 + u * 1.4); s.material.opacity = 0.16 * (1 - u); }); burner.material.emissiveIntensity = 1.8 + Math.sin(t * 17) * 0.4;
      vines.forEach((v, i) => { v.rotation.z = Math.sin(t * 1.1 + i) * 0.06; }); fairy.forEach((f, i) => { f.material.color.setHex(Math.sin(t * 2 + i * 1.7) > -0.6 ? 0xffe9a0 : 0xa88030); }); lamp.intensity = 80 + Math.sin(t * 9) * 1.5; dust.update(t); } };
  env.receipts(receipts); return env;
}

// ---------- the back hall + THE basement door ----------
export function cellarHall(S) {
  S.background = new THREE.Color(0x050505);
  box(S, [11.8, 0.3, 21.4], [0, -0.15, 1.6], tmat(checkTex('#b89a50', '#26262a'), 3, 5.5, { roughness: 0.5 }), { r: 0, cast: false, name: 'floor' });
  const wp = (rx, ry) => tmat(paperTex22('#5a7a5a', '#63845f', '#c8b070'), rx, ry), wood = tmat(woodTex(0x4a2e1a), 2, 1), woodV = tmat(woodTex(0x4a2e1a), 1, 2);
  box(S, [3.6, 9.2, 0.4], [-3.9, 4.6, -9.2], wp(1.4, 3.2), { r: 0, cast: false, name: 'back wall' }); box(S, [3.6, 9.2, 0.4], [3.9, 4.6, -9.2], wp(1.4, 3.2), { r: 0, cast: false, name: 'back wall' }); box(S, [4.2, 1.6, 0.4], [0, 8.4, -9.2], wp(1.6, 0.6), { r: 0, cast: false, name: 'back wall' });
  box(S, [0.4, 9.2, 21.4], [-5.9, 4.6, 1.6], wp(8, 3.2), { r: 0, cast: false, name: 'left wall' }); box(S, [0.4, 9.2, 21.4], [5.9, 4.6, 1.6], wp(8, 3.2), { r: 0, cast: false, name: 'right wall' }); box(S, [11.8, 9.2, 0.4], [0, 4.6, 12.4], wp(4, 3.2), { r: 0, cast: false, name: 'front wall' });
  box(S, [11.8, 0.3, 21.4], [0, 9.35, 1.6], tmat(plasterTex(0xd8d0b8), 3, 5), { r: 0, cast: false, solid: false });
  for (const sx of [-1, 1]) { put(S, mesh(rb(0.12, 3.2, 21, 0.03), wood, false), [sx * 5.66, 1.6, 1.6]); put(S, mesh(rb(0.2, 0.2, 21, 0.04), woodV, false), [sx * 5.62, 3.3, 1.6]); put(S, mesh(rb(3.4, 3.2, 0.12, 0.03), wood, false), [sx * 3.9, 1.6, -8.96]); put(S, mesh(rb(3.4, 0.2, 0.2, 0.04), woodV, false), [sx * 3.9, 3.3, -8.92]); }
  // door frame + door (hinge x -2.1, swings toward +z)
  for (const sx of [-1, 1]) put(S, mesh(rb(0.5, 8.0, 0.7, 0.06), woodV, false), [sx * 2.35, 4.0, -9.0]); put(S, mesh(rb(5.2, 0.5, 0.7, 0.06), woodV, false), [0, 7.85, -9.0]);
  const pivot = new THREE.Group(); pivot.position.set(-2.1, 0, -8.95); S.add(pivot); put(pivot, mesh(rb(4.2, 7.6, 0.36, 0.06), tmat(woodTex(0x1f4a32), 2, 2)), [2.1, 3.8, 0]);
  for (const by of [1.3, 3.8, 6.3]) { put(pivot, mesh(rb(4.2, 0.4, 0.44, 0.04), iron()), [2.1, by, 0]); for (let i = 0; i < 6; i++) put(pivot, mesh(new THREE.SphereGeometry(0.07, 6, 5), M(0x5a5c62, { metalness: 0.7 })), [0.4 + i * 0.68, by, 0.24]); }
  const ring = put(pivot, mesh(new THREE.TorusGeometry(0.36, 0.07, 8, 18), brass()), [3.55, 3.45, 0.3]); put(pivot, mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 10), brass()), [3.55, 3.85, 0.24], [Math.PI / 2, 0, 0]);
  const sT = textTex22([['DO NOT OPEN', '800 78px "Inter", sans-serif', '#fff', 92], ['AFTER DARK', '800 78px "Inter", sans-serif', '#fff', 78], ['— the lease, rule 1 —', 'italic 38px Georgia', '#ffd8c8', 40]], { w: 640, h: 320, bg: '#b01e1e', top: 112, border: '#fff', stain: false });
  const sign = put(pivot, new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), std({ map: sT, roughness: 0.35, emissive: 0xffffff, emissiveMap: sT, emissiveIntensity: 0.25 })), [2.0, 5.15, 0.24]);
  const bT = signTex('BASEMENT', { w: 512, h: 96, bg: '#1a1a1e', fg: '#ffd870', font: '800 64px Georgia, serif' }); put(S, mesh(rb(3.2, 0.62, 0.1, 0.04), std({ map: bT, metalness: 0.4, roughness: 0.4, emissive: 0xffffff, emissiveMap: bT, emissiveIntensity: 0.3 })), [0, 8.55, -8.95]);
  // behind the door: black stairwell, steps down, gold glow from far below
  { const bk = basic(0x020202, { side: THREE.BackSide }), no = basic(0x000000, { visible: false }); put(S, new THREE.Mesh(new THREE.BoxGeometry(5.4, 14, 8), [bk, bk, bk, bk, no, bk]), [0, 3, -13.4]); } for (let i = 0; i < 5; i++) put(S, mesh(rb(4.2, 0.6, 1.0, 0.04), tmat(slabTex(0x5a5a60), 1, 1)), [0, -0.3 - i * 0.6, -9.9 - i]);
  const glowL = new THREE.PointLight(0xffc040, 0, 18, 1.4); glowL.position.set(0, -1.5, -12.5); S.add(glowL); const glowP = put(S, new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3), basic(0xffb020, { transparent: true, opacity: 0 })), [0, -3.2, -14.5], [-0.9, 0, 0]);
  // wall lamp over the door, swinging bare bulb, key
  put(S, mesh(rb(0.5, 0.5, 0.5, 0.1), iron()), [3.6, 7.6, -8.8]); put(S, new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), basic(0xffc070)), [3.6, 7.2, -8.6]); const doorL = new THREE.PointLight(0xffb060, 9, 14, 1.6); doorL.position.set(3.2, 7.0, -7.9); S.add(doorL);
  const bulbP = new THREE.Group(); bulbP.position.set(0.4, 9.2, -3.2); S.add(bulbP); put(bulbP, mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0, 4), M(0x1a1a1e), false), [0, -1.0, 0]); put(bulbP, mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 8), brass(), false), [0, -2.05, 0]); put(bulbP, new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), basic(0xfff2c8)), [0, -2.34, 0]);
  const bulb = new THREE.PointLight(0xffe2a8, 40, 26, 1.5); bulb.position.set(0, -2.5, 0); bulb.castShadow = true; bulb.shadow.mapSize.set(1024, 1024); bulb.shadow.bias = -0.003; bulbP.add(bulb);
  const key = new THREE.PointLight(0xffe8d0, 16, 18, 1.5); key.position.set(0.5, 5, 5); S.add(key); S.add(new THREE.HemisphereLight(0xc8d8c0, 0x2a2a22, 0.45));
  // mailboxes, notice board, radiator
  for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { put(S, mesh(rb(0.24, 0.9, 1.2, 0.04), brass()), [-5.56, 4.3 + r * 1.1, -5.4 + i * 1.4]); put(S, mesh(rb(0.04, 0.12, 0.7, 0.01), M(0x1a1a1e), false), [-5.42, 4.5 + r * 1.1, -5.4 + i * 1.4]); }
  for (let i = 0; i < 4; i++) put(S, mesh(rb(0.5, 0.02, 0.8, 0.005), M(i % 2 ? 0xf4ecd8 : 0xf8d8d8), false), [-5.3, 4.72 + i * 0.03, -5.4], [0.1 * i, 0.2 * i, 0.5]);
  put(S, mesh(rb(0.1, 2.2, 3.0, 0.03), M(0xb88a52, { roughness: 1 })), [-5.6, 5.6, 1.2]); for (let i = 0; i < 5; i++) put(S, new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), M([0xf4ecd8, 0xf8e8a0, 0xd8e8f8, 0xf8d8d8, 0xf4ecd8][i])), [-5.53, 5.3 + (i % 2) * 0.7, 0.1 + i * 0.55], [0, Math.PI / 2, (i - 2) * 0.06]);
  for (let i = 0; i < 9; i++) put(S, mesh(rb(0.5, 2.0, 0.22, 0.08), M(0xc8c4b8, { metalness: 0.3, roughness: 0.5 })), [-5.35, 1.3, 4.2 + i * 0.3]);
  // stairs up (right), newel + rail
  for (let i = 0; i < 6; i++) put(S, mesh(rb(2.4, 0.7 * (i + 1), 1.1, 0.04), tmat(woodTex(0x5a3a22), 1, 1)), [4.5, 0.35 * (i + 1), 1.6 + i * 1.1]); put(S, mesh(rb(0.4, 4.4, 0.4, 0.06), woodV), [3.2, 2.2, 1.1]); put(S, mesh(new THREE.SphereGeometry(0.34, 10, 8), woodV), [3.2, 4.6, 1.1]); put(S, mesh(rb(0.2, 0.2, 7.8, 0.05), woodV), [3.2, 6.0, 4.6], [-0.56, 0, 0]);
  // pipes, bucket + mop, umbrella stand, doormat, cobweb
  const pm = M(0x7a5a3a, { metalness: 0.7, roughness: 0.4 }); put(S, mesh(new THREE.CylinderGeometry(0.2, 0.2, 21, 8), pm), [-3.8, 8.6, 1.6], [Math.PI / 2, 0, 0]); put(S, mesh(new THREE.CylinderGeometry(0.13, 0.13, 21, 8), M(0x5a6a6a, { metalness: 0.7, roughness: 0.4 })), [-3.2, 8.75, 1.6], [Math.PI / 2, 0, 0]); put(S, mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 8), pm), [-5.3, 4.6, -8.6]); put(S, mesh(new THREE.TorusGeometry(0.34, 0.06, 6, 12), M(0xc8302a)), [-5.3, 6.4, -8.3]);
  put(S, mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.9, 12), M(0xf2c420, { roughness: 0.4 })), [-4.5, 0.45, -7.6]); put(S, mesh(new THREE.CylinderGeometry(0.05, 0.05, 5.2, 6), M(0x9a6a3a)), [-4.9, 2.7, -8.1], [0.14, 0, 0.1]); put(S, mesh(rb(0.9, 0.5, 0.4, 0.15), M(0xd8d8d0, { roughness: 1 })), [-4.7, 0.5, -7.75]);
  put(S, mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.6, 10, 1, true), M(0x3a4a5a, { side: THREE.DoubleSide, metalness: 0.5 })), [-5.1, 0.8, -0.9]); put(S, mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), M(0x8a2a2a)), [-5.0, 1.8, -0.9], [0.1, 0, 0.12]); put(S, mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), M(0x2a2a3a)), [-5.2, 1.7, -1.0], [-0.1, 0, -0.1]);
  const mT = textTex22([['WIPE YOUR', '800 64px "Inter", sans-serif', '#2a1a10', 74], ['CLAWS', '800 80px "Inter", sans-serif', '#2a1a10', 60]], { w: 512, h: 256, bg: '#a8834a', top: 106, stain: false }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.7), std({ map: mT, roughness: 1 })), [0, 0.02, -7.4], [-Math.PI / 2, 0, 0]);
  const webT = ctex(128, 128, (c, w, h) => { c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * 0.26) * 128, Math.sin(i * 0.26) * 128); c.stroke(); } for (let r = 20; r < 128; r += 20) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI / 2); c.stroke(); } });
  put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), basic(0xffffff, { map: webT, transparent: true, depthWrite: false })), [-4.5, 8.0, -8.9], [0, 0, -Math.PI / 2]);
  put(S, mesh(rb(3.4, 7.4, 0.3, 0.06), tmat(woodTex(0x1f4a32), 1, 2)), [-1.2, 3.7, 12.1]); put(S, new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), std({ color: 0xcfe0ff, emissive: 0x8ab0ff, emissiveIntensity: 1.1 })), [-1.2, 5.4, 11.93], [0, Math.PI, 0]); put(S, mesh(new THREE.SphereGeometry(0.16, 8, 6), brass()), [-2.4, 3.6, 11.9]);
  put(S, mesh(rb(3.8, 0.3, 0.4, 0.05), woodV, false), [-1.2, 7.6, 12.0]); put(S, mesh(rb(2.6, 0.2, 0.2, 0.04), woodV), [2.8, 6.0, 12.1]); for (let i = 0; i < 3; i++) put(S, mesh(rb(1.0, 2.6 - i * 0.4, 0.5, 0.2), M([0x8a2a2a, 0x2a4a6a, 0xd8a030][i], { roughness: 1 })), [1.9 + i * 0.9, 4.6 + i * 0.2, 11.8]);
  const streetL = new THREE.PointLight(0x8ab0ff, 14, 14, 1.6); streetL.position.set(-1.2, 5.4, 10.4); S.add(streetL);
  // gold dust (on the ring handle + the floor)
  const R = rng(5), nd = 70, dp = new Float32Array(nd * 3); for (let i = 0; i < nd; i++) { if (i < 34) { dp[i * 3] = 3.55 + (R() - 0.5) * 1.0; dp[i * 3 + 1] = 3.5 + (R() - 0.5) * 1.3; dp[i * 3 + 2] = 0.34 + R() * 0.1; } else { dp[i * 3] = 2.1 + (R() - 0.5) * 3.6; dp[i * 3 + 1] = 0.05; dp[i * 3 + 2] = 0.5 + R() * 2.0; } }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); const dustP = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffd040, size: 0.11, transparent: true, opacity: 0, depthWrite: false })); pivot.add(dustP);
  const floorDust = new THREE.Points(dg.clone(), dustP.material); floorDust.position.set(-2.1, 0, -8.95); S.add(floorDust); floorDust.geometry.attributes.position.array.fill(0, 0, 34 * 3); floorDust.geometry.setDrawRange(34, nd - 34); dustP.geometry.setDrawRange(0, 34);
  const dustL = new THREE.PointLight(0xffc040, 0, 5, 1.6); dustL.position.set(1.5, 3.4, -8.2); S.add(dustL); const air = motes(S, 50, [-5, 5, 1, 8.5, -8, 9], 0xfff0d0, 0.06, 0.3);
  return { key, bulb, sign, ring, door: { pivot, open(k) { pivot.rotation.y = -k * 1.9; } }, glow(k) { glowL.intensity = 70 * k; glowP.material.opacity = 0.5 * k; }, dust(k) { dustP.material.opacity = k; dustL.intensity = 5 * k; },
    update(t, swing = 1) { bulbP.rotation.z = Math.sin(t * 1.3) * 0.06 * swing; bulbP.rotation.x = Math.cos(t * 1.1) * 0.03 * swing; dustP.material.size = 0.1 + Math.sin(t * 9) * 0.025; air.update(t); } };
}

// ---------- the stairs that go on far too long ----------
const STEP = 1.4, RISE = 0.8, SLOPE = Math.atan(RISE / STEP);
export const stairY = (z) => -Math.round(z / STEP) * RISE;           // top of the step whose centre is nearest z (step k: centre z = 1.4k, top y = -0.8k)
export const stairWalkY = (z) => { const u = z / STEP + 0.5, k = Math.floor(u), f = u - k; const s = Math.max(0, Math.min(1, (f - 0.55) / 0.45)); return -(k) * RISE - RISE * s * s * (3 - 2 * s); };   // smooth foot height for a walker going down toward +z
export function deepStairs(S, { zone = 'boiler' } = {}) {
  const dark = zone === 'dark', rocky = zone !== 'boiler'; S.background = new THREE.Color(0x020203); S.userData.look = 'night';
  const stepM = tmat(slabTex(rocky ? 0x54505a : 0x6a6660), 3, 0.6, { roughness: 0.8 }); const kMax = dark ? 4 : 30;
  for (let k = -30; k <= kMax; k++) box(S, [7, RISE, STEP], [0, -k * RISE - RISE / 2, k * STEP], stepM, { r: 0.03, name: 'step' });
  const wallM = rocky ? tmat(rockTex(dark ? 0x2a2830 : 0x4a4650, !dark), 5, 6) : tmat(brickTex(0x6a3a2a), 12, 16), ledgeM = rocky ? tmat(rockTex(0x3a3640), 2, 10) : tmat(slabTex(0x5a5650), 2, 16);
  for (const sx of [-1, 1]) { put(S, mesh(new THREE.BoxGeometry(0.6, 130, 100), wallM, false), [sx * 8.3, 0, 0]); const lg = put(S, mesh(new THREE.BoxGeometry(4.6, 1.2, dark ? 60 : 96), ledgeM), [sx * 5.8, dark ? 8.2 : -0.3, dark ? -14.5 : 0]); lg.rotation.x = SLOPE; }
  if (!dark) { const under = put(S, mesh(new THREE.BoxGeometry(7, 3, 96), ledgeM, false), [0, -2.3, 0]); under.rotation.x = SLOPE; }
  const ceil = put(S, mesh(new THREE.BoxGeometry(17.2, 1, 100), rocky ? tmat(rockTex(0x2a2830), 3, 10) : tmat(brickTex(0x4a2a20), 6, 30), false), [0, 13, 0]); ceil.rotation.x = SLOPE;
  // railings
  for (const sx of [-1, 1]) { const rail = put(S, mesh(new THREE.BoxGeometry(0.16, 0.16, dark ? 52 : 96), iron(), false), [sx * 3.45, dark ? 12.4 : 3.3, dark ? -17 : 0]); rail.rotation.x = SLOPE; for (let k = -30; k <= kMax; k += 2) put(S, mesh(new THREE.BoxGeometry(0.1, 3.3, 0.1), iron(), false), [sx * 3.45, -k * RISE + 1.65, k * STEP]); }
  const slopeY = (z) => -z * RISE / STEP; const lights = []; const addL = (col, i, dist, pos) => { const l = new THREE.PointLight(col, i, dist, 1.5); l.position.set(...pos); S.add(l); lights.push(l); l.userData.base = i; return l; };
  const steamP = []; let fire = null;
  if (zone === 'boiler') {
    S.add(new THREE.HemisphereLight(0xffd0a0, 0x2a1a14, 0.4));
    const bz = -5.5, by = slopeY(bz) + 1.6; put(S, mesh(rb(4.6, 0.6, 6, 0.06), tmat(slabTex(0x5a5650), 1, 1)), [-5.9, by - 0.3, bz]); const tk = new THREE.Group(); tk.position.set(-5.9, by, bz); tk.rotation.y = 0.75; S.add(tk); const cu = M(0xb86a3a, { metalness: 0.75, roughness: 0.38 });
    put(tk, mesh(new THREE.CylinderGeometry(1.9, 1.9, 6.4, 20), cu), [0, 3.2, 0]); put(tk, mesh(new THREE.SphereGeometry(1.9, 20, 10, 0, 7, 0, Math.PI / 2), cu), [0, 6.4, 0]); for (const ry of [1.2, 3.4, 5.6]) put(tk, mesh(new THREE.TorusGeometry(1.93, 0.1, 6, 24), M(0x7a4a2a, { metalness: 0.8, roughness: 0.4 })), [0, ry, 0], [Math.PI / 2, 0, 0]);
    put(tk, new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), basic(0xff8a30)), [0, 1.4, 1.93]); for (let i = 0; i < 4; i++) put(tk, mesh(new THREE.BoxGeometry(0.1, 1.3, 0.1), iron(), false), [-0.6 + i * 0.4, 1.4, 1.98]); put(tk, mesh(rb(1.9, 1.6, 0.16, 0.05), iron(), false), [0, 1.4, 1.86]);
    for (const [gx, gy] of [[-0.7, 4.4], [0.7, 4.6]]) { put(tk, mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16), brass()), [gx, gy, 1.9], [Math.PI / 2, 0, 0]); put(tk, new THREE.Mesh(new THREE.CircleGeometry(0.36, 16), basic(0xf4ecd8)), [gx, gy, 1.97]); put(tk, new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.3), basic(0xc81e1e)), [gx + 0.06, gy + 0.08, 1.98], [0, 0, -0.6]); }
    put(tk, mesh(new THREE.CylinderGeometry(0.5, 0.5, 9, 10), M(0x5a4a40, { metalness: 0.6, roughness: 0.5 })), [0, 11, -0.6]); fire = addL(0xff7a30, 70, 24, [-4.2, by + 1.8, bz + 1.8]);
    for (let i = 0; i < 3; i++) { const p = put(S, mesh(new THREE.CylinderGeometry(0.26 - i * 0.05, 0.26 - i * 0.05, 100, 8), M([0x7a5a3a, 0x5a6a6a, 0x8a3a2a][i], { metalness: 0.7, roughness: 0.4 }), false), [7.7, 5.4 + i * 1.0, 0]); p.rotation.x = Math.PI / 2 + SLOPE; }
    for (const vz of [-8, 3]) { put(S, mesh(new THREE.TorusGeometry(0.5, 0.09, 6, 14), M(0xc8302a)), [7.3, slopeY(vz) + 5.4, vz], [0, Math.PI / 2, 0]); }
    for (const lz of [-11, -1, 8]) { put(S, mesh(rb(0.5, 0.9, 0.5, 0.1), iron(), false), [7.8, slopeY(lz) + 8.6, lz]); put(S, new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), basic(0xffc878)), [7.5, slopeY(lz) + 8.3, lz]); addL(0xffc070, 30, 20, [6.6, slopeY(lz) + 8.0, lz]); }
    const bT = signTex('BOILER', { w: 512, h: 128, bg: null, fg: '#e8dcc4', font: '800 90px "Inter", sans-serif' }); put(S, new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1), basic(0xffffff, { map: bT, transparent: true, opacity: 0.75 })), [-7.95, slopeY(2) + 6.2, 2], [0, Math.PI / 2, 0]);
    for (let i = 0; i < 4; i++) steamP.push(put(S, new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), basic(0xe8e0d8, { transparent: true, opacity: 0.12, depthWrite: false })), [7.2, 0, 3]));
  } else if (zone === 'bedrock') {
    S.add(new THREE.HemisphereLight(0x9ab8d0, 0x1a1a22, 0.36));
    const fT = ctex(512, 320, (c, w, h) => { c.strokeStyle = '#e8dcc0'; c.fillStyle = '#e8dcc0'; c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(150, 170); c.quadraticCurveTo(280, 120, 470, 190); c.stroke(); for (let i = 0; i < 9; i++) { c.lineWidth = 6; c.beginPath(); c.moveTo(190 + i * 28, 160 + Math.sin(i * 0.4) * 8); c.quadraticCurveTo(200 + i * 28, 230, 180 + i * 28, 262); c.stroke(); }
      c.beginPath(); c.ellipse(96, 150, 70, 46, -0.2, 0, 7); c.fill(); c.beginPath(); c.moveTo(30, 150); c.lineTo(10, 196); c.lineTo(120, 192); c.fill(); c.fillStyle = '#2a2428'; c.beginPath(); c.arc(104, 136, 15, 0, 7); c.fill(); for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(20 + i * 16, 192); c.lineTo(27 + i * 16, 212); c.lineTo(34 + i * 16, 192); c.fillStyle = '#e8dcc0'; c.fill(); }
      c.lineWidth = 8; for (const [a, b] of [[230, 260], [380, 250]]) { c.beginPath(); c.moveTo(a, b - 60); c.lineTo(a - 10, b + 10); c.lineTo(a + 14, b + 44); c.stroke(); } });
    put(S, new THREE.Mesh(new THREE.PlaneGeometry(8.6, 5.4), std({ map: fT, transparent: true, roughness: 0.9, emissive: 0xffffff, emissiveMap: fT, emissiveIntensity: 0.12 })), [-7.95, slopeY(-3) + 6.6, -3], [SLOPE * 0, Math.PI / 2, 0]);
    for (const [mx, mz] of [[-5.6, 3.5], [5.8, -4], [5.4, 7.5], [-6.2, -9]]) { for (let i = 0; i < 4; i++) { const hh = 0.5 + (i % 3) * 0.3; put(S, mesh(new THREE.CylinderGeometry(0.07, 0.09, hh, 6), M(0xe8e0d0)), [mx + Math.sin(i * 2) * 0.5, slopeY(mz) + 0.3 + hh / 2, mz + Math.cos(i * 2) * 0.5]); put(S, new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 6, 0, 7, 0, Math.PI / 2), basic(0x50ffd0)), [mx + Math.sin(i * 2) * 0.5, slopeY(mz) + 0.3 + hh, mz + Math.cos(i * 2) * 0.5]); } addL(0x40ffc8, 16, 13, [mx * 0.9, slopeY(mz) + 1.8, mz]); }
    for (let i = 0; i < 9; i++) { const rz = -14 + i * 3.3, rx = Math.sin(i * 2.4) * 6; put(S, mesh(new THREE.CylinderGeometry(0.16, 0.03, 2.5 + (i % 3), 6), M(0x3a2a1c, { roughness: 1 })), [rx, slopeY(rz) + 11.2 - (i % 3) * 0.5, rz], [0.1, 0, Math.sin(i) * 0.2]); }
    for (const [cx, cz, cc] of [[6.6, 1.5, 0xb060ff], [-6.8, 7, 0xb060ff], [6.9, -11, 0x60a0ff]]) for (let i = 0; i < 3; i++) put(S, new THREE.Mesh(new THREE.OctahedronGeometry(0.4 + i * 0.16), std({ color: cc, emissive: cc, emissiveIntensity: 0.7, roughness: 0.2 })), [cx + i * 0.3, slopeY(cz) + 0.8 + i * 0.3, cz + i * 0.4], [0.3, i, 0.2]).scale.y = 1.9;
    const sg = new THREE.Group(); sg.position.set(5.6, slopeY(0) + 0.3, 0); sg.rotation.y = -0.5; S.add(sg); put(sg, mesh(rb(0.24, 4.2, 0.24, 0.04), tmat(woodTex(0x5a3a22), 1, 1)), [0, 2.1, 0]);
    const s1 = textTex22([['BEDROCK', '800 96px "Inter", sans-serif', '#f4ecd8', 110]], { w: 512, h: 160, bg: '#5a3a22', top: 112, stain: false }), s2 = textTex22([['KEEP GOING ↓', '800 70px "Inter", sans-serif', '#f4ecd8', 110]], { w: 512, h: 140, bg: '#6a4426', top: 96, stain: false });
    put(sg, mesh(rb(3.2, 1.0, 0.14, 0.04), std({ map: s1, emissive: 0xffffff, emissiveMap: s1, emissiveIntensity: 0.25 })), [0, 3.9, 0.16]); put(sg, mesh(rb(3.0, 0.82, 0.14, 0.04), std({ map: s2, emissive: 0xffffff, emissiveMap: s2, emissiveIntensity: 0.25 })), [0.1, 2.8, 0.16], [0, 0, -0.06]);
    put(S, mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8), M(0xe8dcc4)), [-6.4, slopeY(-1) + 0.75, -1]); put(S, new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), basic(0xffd080)), [-6.4, slopeY(-1) + 1.25, -1]); addL(0xffb060, 16, 13, [-5.6, slopeY(-1) + 2.0, -1]);
  } else { S.add(new THREE.HemisphereLight(0x7a8ab8, 0x0a0a10, 0.34)); }
  const key = new THREE.PointLight(0xfff0dc, 0, 30, 1.4); S.add(key); const air = motes(S, 70, [-7, 7, -8, 12, -12, 14], rocky ? 0xc8e0ff : 0xffe0c0, 0.07, 0.3);
  return { key, lights, keyAt(x, y, z, i = 12) { key.position.set(x, y, z); key.intensity = i; }, dim(k) { lights.forEach(l => { l.intensity = l.userData.base * k; }); },
    update(t) { if (fire) fire.intensity = 70 + Math.sin(t * 11) * 9 + Math.sin(t * 23) * 5; steamP.forEach((s, i) => { const u = (t * 0.6 + i / 4) % 1; s.position.set(7.2 - u * 2.4, slopeY(3) + 5.4 + u * 1.2, 3 + Math.sin(u * 4 + i) * 0.4); s.scale.setScalar(0.5 + u * 2); s.material.opacity = 0.16 * (1 - u); }); air.update(t); } };
}

// ---------- the cavern under No. 9 ----------
export const CAVE = { beast: [0, 1.2, -14], dana: [3.6, 0, 7], crane: [-3.8, 0, 6], lamp: [-16.5, 4.5], shelf: [19, -4], ledger: [-9.2, 5.5, 0.2] };
export function hoardCavern(S) {
  S.background = new THREE.Color(0x030305); S.fog = new THREE.Fog(0x040406, 50, 150); S.userData.look = 'night';
  box(S, [150, 1, 130], [0, -0.5, -6], tmat(rockTex(0x3a3640), 9, 8), { r: 0, cast: false, name: 'floor' }); const wallM = tmat(rockTex(0x4a4650, true), 6, 4), brk = (rx, ry) => tmat(brickTex(0x6a3226), rx, ry);
  put(S, mesh(new THREE.BoxGeometry(150, 90, 2), wallM, false), [0, 44, -42]); for (const sx of [-1, 1]) put(S, mesh(new THREE.BoxGeometry(2, 90, 130), wallM, false), [sx * 42, 44, -6]);
  for (const [px, pz] of [[-25, -28], [25, -28], [-32, 8], [32, 8]]) { put(S, mesh(new THREE.BoxGeometry(6, 52, 6), brk(1, 9)), [px, 26, pz]); put(S, mesh(rb(7.4, 1.6, 7.4, 0.2), M(0x8a8480)), [px, 0.8, pz]); }
  put(S, mesh(new THREE.BoxGeometry(60, 5, 6), brk(10, 1), false), [0, 49, -28]); put(S, mesh(new THREE.BoxGeometry(72, 5, 6), brk(12, 1), false), [0, 49, 8]); put(S, mesh(new THREE.BoxGeometry(84, 3, 80), brk(14, 13), false), [0, 54, -8]);
  const rk = tmat(rockTex(0x3a3640), 1, 2); for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 30 + (i % 4) * 3; put(S, mesh(new THREE.ConeGeometry(1.4 + (i % 3) * 0.6, 5 + (i % 4) * 2.5, 7), rk), [Math.sin(a) * r, 2.4 + (i % 4) * 1.2, -8 + Math.cos(a) * r * 0.9]); }
  for (let i = 0; i < 9; i++) put(S, mesh(new THREE.ConeGeometry(1.2 + (i % 3) * 0.5, 7 + (i % 4) * 3, 7), rk, false), [-30 + i * 7.6, 48 - (i % 4) * 1.5, -34 + (i % 3) * 9], [Math.PI, 0, 0]);
  // gold
  const goldM = tmat(goldTex(), 4, 3, { metalness: 0.7, roughness: 0.36, emissive: 0x8a5a08, emissiveIntensity: 0.15 }); const mounds = [[0, -18, 13], [-15, -19, 9], [14.5, -21, 10], [-23, -7, 6], [29, -16, 6], [13, 3.4, 2.2], [-2.5, 13.5, 1.7], [-23, -4, 3.2], [24, 6, 3]];
  for (const [mx, mz, r] of mounds) { const m = put(S, mesh(new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), goldM), [mx, -0.05, mz]); m.scale.y = 0.45; }
  const R = rng(22), NC = 520, coinM = std({ color: 0xf2c030, metalness: 0.85, roughness: 0.28, emissive: 0x8a5a08, emissiveIntensity: 0.25 }), coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 10), coinM, NC), dm = new THREE.Object3D(), spark = [];
  for (let i = 0; i < NC; i++) { const [mx, mz, r] = mounds[Math.floor(R() * mounds.length)], a = R() * 6.28, u = 0.25 + R() * 0.95; const y = u < 1 ? 0.45 * r * Math.sqrt(1 - u * u) + 0.04 : 0.04; dm.position.set(mx + Math.cos(a) * r * u, y, mz + Math.sin(a) * r * u); dm.rotation.set((R() - 0.5) * (u < 1 ? 1.4 : 0.2), R() * 6, (R() - 0.5) * (u < 1 ? 1.4 : 0.2)); dm.updateMatrix(); coins.setMatrixAt(i, dm.matrix); if (i % 3 === 0) spark.push([dm.position.x, y + 0.2, dm.position.z]); }
  coins.castShadow = false; coins.receiveShadow = true; S.add(coins);
  const sparkG = [0, 1, 2].map(j => { const pts = spark.filter((_, i) => i % 3 === j), p = new Float32Array(pts.length * 3); pts.forEach((v, i) => p.set(v, i * 3)); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const P = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff0a0, size: 0.24, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(P); return P; });
  // chests, giant books, crown
  for (const [cx, cz, ry] of [[-21.5, 0.5, 0.9], [16.5, 9, -0.6]]) { const c = new THREE.Group(); c.position.set(cx, 0, cz); c.rotation.y = ry; S.add(c); put(c, mesh(rb(3.4, 1.8, 2.2, 0.1), tmat(woodTex(0x5a3418), 1, 1)), [0, 0.9, 0]); const lid = put(c, mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.4, 12, 1, false, 0, Math.PI), tmat(woodTex(0x5a3418), 1, 1)), [0, 2.2, -1.2], [0, 0, Math.PI / 2]); lid.rotation.set(-0.9, 0, Math.PI / 2); for (const bx of [-1.2, 1.2]) put(c, mesh(rb(0.3, 1.9, 2.3, 0.04), brass()), [bx, 0.9, 0]);
    const gm = put(c, mesh(new THREE.SphereGeometry(1.5, 12, 8, 0, 7, 0, Math.PI / 2), goldM), [0, 1.6, 0]); gm.scale.set(1, 0.4, 0.66); }
  [[0xb8301e, 0], [0x2a6a4a, 0.2], [0x3a4a8a, -0.15], [0x7a4a2a, 0.1], [0x8a2a5a, -0.05]].forEach(([c, ry], i) => { put(S, mesh(rb(4.4, 1.0, 5.6, 0.12), M(c, { roughness: 0.6 })), [-14, 0.5 + i * 1.02, -6.5], [0, ry, 0]); put(S, mesh(rb(4.1, 0.8, 5.4, 0.05), M(0xf0e6cc), false), [-13.85, 0.5 + i * 1.02, -6.5], [0, ry, 0]); });
  // giant banker's lamp
  const [lx, lz] = CAVE.lamp; put(S, mesh(new THREE.CylinderGeometry(2.0, 2.3, 0.7, 20), brass()), [lx, 0.35, lz]); put(S, mesh(new THREE.CylinderGeometry(0.34, 0.4, 12.4, 10), brass()), [lx, 6.6, lz]); put(S, mesh(new THREE.CylinderGeometry(0.26, 0.26, 4, 8), brass()), [lx + 1.8, 12.9, lz], [0, 0, Math.PI / 2]);
  const shadeM = std({ color: 0x1c9a5a, roughness: 0.25, emissive: 0x0c7a3a, emissiveIntensity: 0, side: THREE.DoubleSide }); put(S, mesh(new THREE.CylinderGeometry(2.3, 2.3, 6.4, 20, 1, false, 0, Math.PI), shadeM), [lx + 3.2, 12.3, lz], [0, -Math.PI / 2, Math.PI / 2]);
  const bulbM = basic(0x2a2a20); put(S, new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4.6, 10), bulbM), [lx + 3.2, 12.2, lz], [0, 0, Math.PI / 2]);
  const lampL = new THREE.SpotLight(0xffd890, 0, 110, 1.15, 0.8, 1.1); lampL.position.set(lx + 3.2, 12.0, lz); lampL.target.position.set(1, 7, -6); lampL.castShadow = true; lampL.shadow.mapSize.set(2048, 2048); lampL.shadow.bias = -0.002; S.add(lampL, lampL.target);
  const upL = new THREE.PointLight(0xffd8a0, 0, 80, 1.2); upL.position.set(2, 14, 4); S.add(upL); const faceL = new THREE.PointLight(0xffe2b0, 0, 60, 1.2); faceL.position.set(-2, 22, 6); S.add(faceL);
  const hemi = new THREE.HemisphereLight(0x6a7ab0, 0x1a1408, 0.1); S.add(hemi); const glowL = new THREE.PointLight(0xffe090, 0, 70, 1.2); glowL.position.set(0, 17, 1); S.add(glowL); const backL = new THREE.PointLight(0x4a6ab0, 120, 80, 1.2); backL.position.set(0, 30, -30); S.add(backL);
  // ledger on a rock lectern
  const [gx, gy, gz] = CAVE.ledger; box(S, [5.4, 4.6, 4.2], [gx, 2.3, gz - 0.2], tmat(rockTex(0x4a4650), 1, 1), { r: 0.4, name: 'lectern' });
  const ledger = new THREE.Group(); ledger.position.set(gx, gy, gz); ledger.rotation.x = -0.75; S.add(ledger); put(ledger, mesh(rb(7.8, 6.9, 0.5, 0.1), M(0x7a1a1a, { roughness: 0.6 })), [0, 0, -0.3]);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const pg = (rows, title) => textTex22([[title, '800 44px Georgia, serif', '#2a1a10', 34], ['——————————————', '400 30px Georgia', '#8a6a4a', 44], ...rows.map(m => [`${m}   rent 3B   PAID ✔`, `600 34px ${HAND}`, '#1c5a3a', 52])], { w: 512, h: 900, top: 80, align: 'center' });
  const pL = pg(months.slice(0, 6), 'No. 9 — FLAT 3B'), pR = pg(months.slice(6), 'paid by: DOWNSTAIRS'); for (const [t, sx] of [[pL, -1], [pR, 1]]) put(ledger, new THREE.Mesh(new THREE.PlaneGeometry(3.7, 6.5), std({ map: t, roughness: 0.9, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.22 })), [sx * 1.88, 0, 0.0], [0, -sx * 0.08, 0]);
  // the plate shelf
  const [sx0, sz0] = CAVE.shelf; const shelf = new THREE.Group(); shelf.position.set(sx0, 0, sz0); shelf.rotation.y = -0.55; S.add(shelf); const wd = tmat(woodTex(0x6a4022), 3, 1), wdV = tmat(woodTex(0x5a3418), 1, 3);
  for (const px of [-5.6, 0, 5.6]) put(shelf, mesh(rb(0.4, 12.6, 2.2, 0.05), wdV), [px, 6.3, 0]); const boards = [1.0, 3.4, 5.8, 8.2, 10.6]; for (const by of boards) put(shelf, mesh(rb(11.6, 0.26, 2.2, 0.04), wd), [0, by, 0]); put(shelf, mesh(rb(11.6, 12.6, 0.16, 0.03), tmat(woodTex(0x4a2e18), 3, 3), false), [0, 6.3, -1.05]);
  const NP = 420, plateG = new THREE.CylinderGeometry(0.62, 0.44, 0.1, 16), plates = new THREE.InstancedMesh(plateG, [M(0xdde6f4, { roughness: 0.3 }), M(0xf8f6f0, { roughness: 0.25 }), M(0x3a6ab8)], NP); let pi = 0;
  for (const by of boards) for (let s = 0; s < 8; s++) { const n = 6 + Math.floor(R() * 9); for (let k = 0; k < n && pi < NP; k++) { dm.position.set(-4.9 + s * 1.4 + (s > 3 ? 0.0 : 0) + (R() - 0.5) * 0.05, by + 0.19 + k * 0.115, 0.1 + (R() - 0.5) * 0.06); dm.rotation.set(0, R() * 6, 0); dm.updateMatrix(); plates.setMatrixAt(pi++, dm.matrix); } }
  plates.count = pi; plates.castShadow = true; plates.receiveShadow = true; shelf.add(plates);
  const lblT = textTex22([["DANA'S", `700 96px ${HAND}`, '#2a1a10', 100], ['cooking  ♥', `700 80px ${HAND}`, '#b8301e', 80]], { w: 512, h: 256, top: 110 }); put(shelf, mesh(rb(3.6, 1.8, 0.1, 0.04), std({ map: lblT, roughness: 0.9, emissive: 0xffffff, emissiveMap: lblT, emissiveIntensity: 0.3 })), [0, 13.4, 0.2], [0, 0, 0.04]);
  put(shelf, mesh(new THREE.CylinderGeometry(1.6, 1.3, 1.4, 16), M(0x8a9aa0, { metalness: 0.6, roughness: 0.4 })), [-8.4, 0.7, 0.8]); for (let i = 0; i < 9; i++) put(shelf, mesh(new THREE.SphereGeometry(0.36 + (i % 3) * 0.14, 8, 6), M(0xffffff, { roughness: 0.2 }), false), [-8.4 + Math.sin(i * 1.9) * 0.9, 1.5 + (i % 2) * 0.2, 0.8 + Math.cos(i * 1.9) * 0.8]);
  put(shelf, mesh(rb(1.6, 2.6, 0.08, 0.03), M(0xe8dcc4, { roughness: 1 })), [6.2, 8.0, 1.0]);
  const shelfL = new THREE.PointLight(0xffd8a8, 0, 30, 1.3); shelfL.position.set(sx0 - 3.5, 7, sz0 + 6.5); S.add(shelfL);
  // the painting on the left wall
  const pT = ctex(640, 448, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f2c888'); g.addColorStop(0.6, '#f8e2b0'); g.addColorStop(0.62, '#7a9a4a'); g.addColorStop(1, '#5a7a3a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#8a3226'; c.fillRect(360, 110, 150, 220); c.fillStyle = '#5a1e16'; for (let r = 0; r < 11; r++) for (let i = 0; i < 4; i++) c.fillRect(360 + i * 38 + (r % 2) * 19, 110 + r * 20, 34, 2); c.fillStyle = '#ffe9a0'; for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) c.fillRect(385 + i * 62, 132 + r * 60, 34, 36); c.fillStyle = '#3a2a20'; c.fillRect(418, 280, 36, 50);
    c.fillStyle = '#2c6878'; c.beginPath(); c.roundRect(110, 130, 190, 210, 40); c.fill(); c.beginPath(); c.roundRect(120, 60, 170, 110, 34); c.fill(); c.fillStyle = '#f2e8c8'; c.beginPath(); c.moveTo(135, 66); c.lineTo(122, 22); c.lineTo(160, 62); c.fill(); c.beginPath(); c.moveTo(275, 66); c.lineTo(288, 22); c.lineTo(250, 62); c.fill();
    c.fillStyle = '#fff4c8'; c.beginPath(); c.arc(170, 105, 22, 0, 7); c.arc(240, 105, 22, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(176, 105, 9, 0, 7); c.arc(246, 105, 9, 0, 7); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 5; c.beginPath(); c.arc(205, 136, 26, 0.2, Math.PI - 0.2); c.stroke();
    c.strokeStyle = '#2c6878'; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(290, 190); c.quadraticCurveTo(350, 120, 420, 96); c.stroke(); c.fillStyle = '#8a3226'; c.fillRect(398, 70, 60, 34);
    c.fillStyle = '#3a2a10'; c.font = 'italic 700 34px Georgia, serif'; c.textAlign = 'center'; c.fillText('No. 9 Marrow Street  ·  est. 1626', w / 2, h - 28); noiseFill(c, w, h, 0.08, 5000); });
  const painting = new THREE.Group(); painting.position.set(-24, 15, -22); painting.rotation.y = 0.7; S.add(painting); put(painting, mesh(rb(15.4, 11.2, 0.7, 0.2), M(0xd8a83a, { metalness: 0.8, roughness: 0.35, emissive: 0x5a3a00, emissiveIntensity: 0.3 })), [0, 0, 0]);
  const pMat = std({ map: pT, roughness: 0.8, emissive: 0xffffff, emissiveMap: pT, emissiveIntensity: 0.1 }); put(painting, new THREE.Mesh(new THREE.PlaneGeometry(13.6, 9.5), pMat), [0, 0, 0.4]); const paintL = new THREE.PointLight(0xffe2b0, 0, 34, 1.3); paintL.position.set(-17, 16, -14); S.add(paintL);
  // sacks, candles, stair stub
  for (const [qx, qz, qs] of [[7.2, 8.2, 1.3], [9.2, 6.6, 1.1], [8.6, 9.6, 1.0]]) { const q = goldSack(S, qs); q.position.set(qx, 0, qz); }
  const candles = []; for (const [cx, cy, cz] of [[CAVE.ledger[0] + 2.3, 4.6, CAVE.ledger[2] + 1.5], [CAVE.ledger[0] - 2.3, 4.6, CAVE.ledger[2] + 1.5], [13.2, 0, 0.6], [-17, 0, -5]]) { put(S, mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.2, 8), M(0xe8dcc4)), [cx, cy + 0.6, cz]); const f = put(S, new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), basic(0x2a2a20)), [cx, cy + 1.36, cz]); f.scale.y = 1.6; candles.push(f); }
  for (let i = 0; i < 7; i++) put(S, mesh(rb(6, 0.9, 1.6, 0.05), tmat(slabTex(0x54505a), 2, 0.5)), [-22, 0.45 + i * 0.9, 9 + i * 1.6]);
  const air = motes(S, 110, [-22, 22, 1, 24, -18, 14], 0xffe0a0, 0.11, 0.35); let lit = 0;
  const env = { ledger, shelf, plates, painting, lampL, upL, faceL, shelfL, paintL, hemi, glowL, backL, eyes(k) { glowL.intensity = 60 * k; },
    set(k, { shelf: sk = k, paint: pk = k } = {}) { lit = k; lampL.intensity = 70 * k; upL.intensity = 36 * k; faceL.intensity = 55 * k; hemi.intensity = 0.1 + 0.3 * k; hemi.color.setHex(k > 0.5 ? 0xffe0b8 : 0x6a7ab0); shadeM.emissiveIntensity = 1.4 * k; bulbM.color.setHex(k > 0.05 ? 0xfff2c0 : 0x2a2a20);
      goldM.emissiveIntensity = 0.12 + 0.3 * k; coinM.emissiveIntensity = 0.22 + 0.4 * k; shelfL.intensity = 26 * sk; paintL.intensity = 45 * pk; pMat.emissiveIntensity = 0.06 + 0.2 * pk; candles.forEach(f => f.material.color.setHex(k > 0.05 ? 0xffd070 : 0x2a2a20)); },
    update(t) { sparkG.forEach((P, j) => { P.material.opacity = (0.25 + 0.55 * Math.max(0, Math.sin(t * 2.3 + j * 2.1))) * (0.35 + 0.65 * lit); }); air.update(t); candles.forEach((f, i) => { f.scale.y = 1.6 + Math.sin(t * 13 + i) * 0.2; }); } };
  env.set(0); return env;
}
