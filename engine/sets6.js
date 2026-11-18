// Episode 005 kit (The Year Trader): life clocks, sleeves, umbrella, coins, glowing year-jars, the Time Exchange (front + inside),
// a small apartment (night rain / morning sun) and a rowhouse stoop. All sets: characters face +Z, camera at +Z.
import * as THREE from 'three';
import { T, std, box, repeatMat, room } from './sets.js';
import { cityNight, rain, wetFloor, lightStreak, rainGlass, patternLight } from './themes.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const glowM = (col) => new THREE.MeshBasicMaterial({ color: col });
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const ptl = (S, col, i, d, pos) => { const l = new THREE.PointLight(col, i, d, 1.7); l.position.set(...pos); S.add(l); return l; };

// ---------- life clock on a wrist ----------
// lifeClock(A, { side: 'L'|'R', years, col }) -> { set(years), glow(k 0..2), hide(bool), screen (Object3D), world() }
// glowing band + display on the front of the forearm; numbers are cached textures. col: cyan normal, use 0xff5a4a for "almost empty".
const numTex = {};
function clockTex(n, col) { const k = n + '_' + col; if (numTex[k]) return numTex[k];
  return (numTex[k] = ctex(256, 160, (c, w, h) => { c.fillStyle = '#05070c'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 26); c.fill();
    const hx = '#' + new THREE.Color(col).getHexString(); c.strokeStyle = hx; c.lineWidth = 7; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 22); c.stroke();
    c.fillStyle = hx; c.shadowColor = hx; c.shadowBlur = 16; c.font = '800 96px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), w / 2, h / 2 - 2);
    c.font = '700 20px Inter'; c.shadowBlur = 0; c.fillText('YEARS', w / 2, h - 24); })); }
export function lifeClock(A, { side = 'L', years = 70, col = 0x5ae8ff, light = 0 } = {}) {
  const arm = side === 'L' ? A.armL : A.armR; const g = new THREE.Group(); g.position.set(0, -1.62, 0); arm.add(g);
  const bandM = new THREE.MeshStandardMaterial({ color: 0x15181f, emissive: col, emissiveIntensity: 0.6, roughness: 0.4 });
  const band = mesh(new THREE.BoxGeometry(1.06, 0.26, 1.06), bandM, false); g.add(band);
  const scrM = new THREE.MeshBasicMaterial({ map: clockTex(years, col), toneMapped: false });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.52), scrM); scr.position.set(0, 0, 0.54); g.add(scr);
  let pl = null; if (light) { pl = new THREE.PointLight(new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.6), light, 4, 1.8); pl.position.set(0, 0, 0.9); g.add(pl); }
  let cur = years, curCol = col;
  const api = { group: g, screen: scr, light: pl, get years() { return cur; },
    set(n, c = curCol) { n = Math.max(0, Math.round(n)); if (n === cur && c === curCol) return; cur = n; curCol = c; scrM.map = clockTex(n, c); scrM.needsUpdate = true; bandM.emissive.set(c); if (pl) pl.color.set(c).lerp(new THREE.Color(0xffffff), 0.6); },
    glow(k) { bandM.emissiveIntensity = 0.6 * k; scrM.color.setScalar(Math.min(1.6, 0.35 + 0.65 * k)); if (pl) pl.intensity = light * k; },
    hide(h) { g.visible = !h; },
    world() { scr.updateMatrixWorld(true); return scr.getWorldPosition(new THREE.Vector3()); } };
  return api;
}
// long sleeve over the forearm (hides a life clock). pull(k): 0 = down over the wrist, 1 = pushed up to the elbow
export function longSleeve(A, side = 'L', col = 0x7a3a4a) {
  const arm = side === 'L' ? A.armL : A.armR; const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 });
  const s = mesh(new THREE.BoxGeometry(1.1, 1.0, 1.1), m, false); arm.add(s);
  const cuff = mesh(new THREE.BoxGeometry(1.16, 0.18, 1.16), new THREE.MeshStandardMaterial({ color: new THREE.Color(col).multiplyScalar(0.8), roughness: 0.9 }), false); arm.add(cuff);
  const pull = (k) => { const bottom = -1.85 + k * 1.05, topY = -0.6; s.scale.y = Math.max(0.05, topY - bottom); s.position.y = (topY + bottom) / 2; cuff.position.y = bottom + 0.06; };
  pull(0); return { pull, mesh: s };
}
// hair tint toward gray (k 0..1). Clones the shared hair material first.
export function grayHair(A, k, gray = 0xb8b8bc) { if (!A.hairMesh) return; if (!A.hairMesh.userData.own) { A.hairMesh.material = A.hairMesh.material.clone(); A.hairMesh.userData.own = A.hairMesh.material.color.clone(); }
  A.hairMesh.material.color.copy(A.hairMesh.userData.own).lerp(new THREE.Color(gray), k); }

// ---------- props ----------
export function umbrella(S, col = 0x2a3a6a, r = 2.3) {
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, side: THREE.DoubleSide });
  const can = mesh(new THREE.ConeGeometry(r, 0.9, 8, 1, true), m); can.position.y = 3.4; g.add(can);
  const sh = mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.9, 8), std({ color: 0x2a2a2a, metalness: 0.6 })); sh.position.y = 1.95; g.add(sh);
  const hd = mesh(new THREE.TorusGeometry(0.18, 0.06, 6, 12, Math.PI), std({ color: 0x3a2418 })); hd.rotation.z = Math.PI; g.add(hd);
  S.add(g); return g;   // origin = handle; canopy 3.4 above it. Hold with rFwd≈65, rUp≈-22 and place at pinky(A,'R')
}
const coinGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 16), coinM = () => new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 0.85, roughness: 0.25, emissive: 0x6a4a00, emissiveIntensity: 0.4 });
export function coinBag(S, { s = 1 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(s); const m = std({ color: 0x8a6a3a, roughness: 0.95 });
  const b = mesh(new THREE.SphereGeometry(0.62, 16, 12), m); b.scale.set(1, 0.95, 0.9); b.position.y = 0.55; g.add(b);
  const nk = mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.35, 12), m); nk.position.y = 1.15; g.add(nk);
  const tie = mesh(new THREE.TorusGeometry(0.24, 0.05, 6, 16), std({ color: 0xc0302a })); tie.rotation.x = Math.PI / 2; tie.position.y = 1.08; g.add(tie);
  const cm = coinM(); for (let i = 0; i < 6; i++) { const c = mesh(coinGeo, cm, false); c.position.set(Math.cos(i) * 0.15, 1.32 + (i % 2) * 0.05, Math.sin(i * 2) * 0.12); c.rotation.set(i, 0, i * 0.7); g.add(c); }
  S.add(g); return g;
}
// coins pouring from p0 onto a surface at height y around [x,z]. update(k 0..1) (k = progress of the pour)
export function coinPour(S, p0, [x, y, z], n = 60) {
  const cm = coinM(); const im = new THREE.InstancedMesh(coinGeo, cm, n); im.castShadow = true; S.add(im); const o = new THREE.Object3D();
  const P = [...Array(n)].map((_, i) => [Math.sin(i * 12.9898) * 43758.5 % 1, Math.sin(i * 78.233) * 12345.6 % 1, i / n]);
  return (k) => { P.forEach(([a, b, st], i) => { const u = Math.max(0, Math.min(1, (k - st * 0.7) / 0.3));
    const fx = x + a * 1.6, fz = z + b * 0.9, fy = y + 0.03 + ((i * 7) % 5) * 0.05;
    if (u <= 0) o.position.set(p0[0], p0[1], p0[2]), o.scale.setScalar(0.001);
    else { const bx = p0[0] + (fx - p0[0]) * u, bz = p0[2] + (fz - p0[2]) * u, by = p0[1] + (fy - p0[1]) * u * u; o.position.set(bx, by, bz); o.scale.setScalar(1); }
    o.rotation.set(u < 1 ? i + k * 20 : Math.PI / 2 * 0 + 0.0, i, u < 1 ? k * 15 : 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.instanceMatrix.needsUpdate = true; };
}
// streaming light particles from a to b (years leaving a clock / entering one). update(k 0..1 intensity, t)
export function lightStream(S, col = 0x8af0ff, n = 50) {
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), n);
  im.frustumCulled = false; S.add(im); const o = new THREE.Object3D(); const pl = new THREE.PointLight(col, 0, 7, 1.6); S.add(pl);
  const A = new THREE.Vector3(), B = new THREE.Vector3();
  return (a, b, k, t, arc = 1.2) => { A.copy(a); B.copy(b); for (let i = 0; i < n; i++) { const u = ((t * 0.7 + i / n) % 1);
      const p = A.clone().lerp(B, u); p.y += Math.sin(u * Math.PI) * arc + Math.sin(t * 6 + i) * 0.06; p.x += Math.sin(t * 5 + i * 2.1) * 0.08;
      o.position.copy(p); o.scale.setScalar(k > 0 ? (0.5 + 0.8 * Math.sin(u * Math.PI)) * k : 0.0001); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    im.instanceMatrix.needsUpdate = true; pl.position.copy(A).lerp(B, 0.5); pl.position.y += arc * 0.7; pl.intensity = 10 * k; };
}
// glass jar of glowing bottled years
export function yearJar(S, [x, y, z], col = 0x8af0ff, { s = 1, light = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s);
  const gl = mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.1, 18), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.35, roughness: 0.05 }), false); gl.position.y = 0.55; g.add(gl);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), new THREE.MeshBasicMaterial({ color: col, toneMapped: false })); core.position.y = 0.5; core.scale.y = 1.25; g.add(core);
  const lid = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.16, 18), std({ color: 0xb08a3a, metalness: 0.8, roughness: 0.3 })); lid.position.y = 1.15; g.add(lid);
  if (light) { const l = new THREE.PointLight(col, light, 5, 1.8); l.position.y = 0.6; g.add(l); }
  S.add(g); g.userData.core = core; return g;
}
export function paperSheet(S, text = 'YEARS ____') {
  const t = ctex(256, 340, (c, w, h) => { c.fillStyle = '#f2e8cf'; c.fillRect(0, 0, w, h); c.fillStyle = '#6a4a2a'; c.font = '700 26px Inter'; c.textAlign = 'center'; c.fillText('TIME EXCHANGE', w / 2, 44);
    c.fillStyle = 'rgba(90,70,40,0.5)'; for (let y = 80; y < 260; y += 22) c.fillRect(24, y, w - 48 - (y % 3) * 20, 5); c.fillStyle = '#3a2a1a'; c.font = '600 24px Inter'; c.fillText(text, w / 2, 300); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.72), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; S.add(m); return m;
}
export function pen(S) { const g = new THREE.Group(); const b = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), std({ color: 0x1a1a1e, metalness: 0.5 })); b.position.y = 0.45; g.add(b);
  const tip = mesh(new THREE.ConeGeometry(0.05, 0.12, 8), std({ color: 0xd8b04a, metalness: 0.9 })); tip.rotation.x = Math.PI; tip.position.y = -0.04; g.add(tip); S.add(g); return g; }
export function broom(S) { const g = new THREE.Group(); const h = mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8), std({ color: 0x8a6a3a })); h.position.y = -1.6; g.add(h);
  const b = mesh(new THREE.BoxGeometry(1.0, 0.8, 0.3), std({ color: 0xc8a050, roughness: 1 })); b.position.y = -3.9; g.add(b); S.add(g); return g; }   // origin = top of handle (put at the hand)
export function consoleBox(S) { const t = ctex(256, 192, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#ff3a8a'); g.addColorStop(1, '#3a6aff'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText('GAME', w / 2, 80); c.fillText('BOX X', w / 2, 128); c.fillStyle = '#111'; c.fillRect(70, 145, 116, 30); });
  const m = [std({ color: 0x2a2a5a }), std({ color: 0x2a2a5a }), std({ color: 0x2a2a5a }), std({ color: 0x2a2a5a }), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }), std({ color: 0x2a2a5a })];
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.5), m); b.castShadow = true; S.add(b); return b; }

// ---------- glowing shop sign ----------
function signTex(text, col) { return ctex(1024, 200, (c, w, h) => { c.fillStyle = '#0a0a12'; c.fillRect(0, 0, w, h); c.strokeStyle = col; c.lineWidth = 8; c.shadowColor = col; c.shadowBlur = 30;
  c.strokeRect(14, 14, w - 28, h - 28); c.fillStyle = col; c.font = '900 110px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2 + 40, h / 2 + 4);
  // hourglass
  c.lineWidth = 9; c.beginPath(); c.moveTo(50, 40); c.lineTo(130, 40); c.lineTo(90, 100); c.lineTo(130, 160); c.lineTo(50, 160); c.lineTo(90, 100); c.closePath(); c.stroke(); }); }

// ---------- Time Exchange storefront on a rainy night street ----------
// Facade front at z=-6 (x -10..10): door at x=3.5 (opening x 2.2..4.8), lit display window at x=-3.5, neon sign above (y≈8.6),
// awning to z≈-4. Street lamps at x=-9 and x=10, z=-1. Returns { update(t, cam), rain, door }.
export function shopFront(S, { lightning = [], rainOpts = {}, dusk = false } = {}) {
  const cn = cityNight(S); S.userData.look = 'night';
  wetFloor(S, { area: [-12, 12, -5, 10] });
  const brick = repeatMat(T.brick(0x5a3a3a), 5, 3);
  box(S, [9.4, 12, 1], [-5.3, 6, -6.5], brick, { r: 0, cast: false, name: 'facade' });
  box(S, [5.2, 12, 1], [7.4, 6, -6.5], brick, { r: 0, cast: false, name: 'facade' });
  box(S, [2.8, 6.5, 1], [3.5, 9.25, -6.5], brick, { r: 0, cast: false, name: 'facade' });
  // door (dark wood + warm glass), opening x 2.2..4.8, y 0..6
  const door = new THREE.Group(); door.position.set(2.2, 0, -6.05); S.add(door);
  const dm = std({ color: 0x3a2418, roughness: 0.6 }); const dd = mesh(new THREE.BoxGeometry(2.6, 6, 0.2), dm); dd.position.set(1.3, 3, 0); door.add(dd);
  const dg = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.6), new THREE.MeshStandardMaterial({ color: 0xffc070, emissive: 0xffa040, emissiveIntensity: 1.2 })); dg.position.set(1.3, 4.1, 0.11); door.add(dg);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6), glowM(0xffb060)); inside.position.set(3.5, 3, -6.6); S.add(inside);
  // display window with jars
  const wg = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.2), new THREE.MeshStandardMaterial({ color: 0x3a2410, emissive: 0xffa858, emissiveIntensity: 0.9 })); wg.position.set(-4.2, 3.6, -5.95); S.add(wg);
  box(S, [7, 0.4, 0.5], [-4.2, 1.35, -5.8], std({ color: 0x2a1a12 }), { r: 0.05, name: 'sill' });
  box(S, [7, 0.3, 0.4], [-4.2, 5.85, -5.85], std({ color: 0x2a1a12 }), { r: 0.05, solid: false });
  [0x8af0ff, 0xffd84a, 0xff8ad8, 0x8aff9a, 0x8af0ff].forEach((c, i) => yearJar(S, [-6.6 + i * 1.2, 1.55, -5.75], c, { s: 0.9 }));
  const rg = rainGlass(S, [6.4, 4.2], [-4.2, 3.6, -5.6]);
  // neon sign + clock
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 1.7), new THREE.MeshBasicMaterial({ map: signTex('TIME EXCHANGE', '#5ae8ff'), toneMapped: false })); sg.position.set(-0.6, 7.6, -5.9); S.add(sg);
  const sl = ptl(S, 0x5ae8ff, 26, 14, [-0.6, 7.2, -3.6]);
  const clk = new THREE.Group(); clk.position.set(-0.6, 10.2, -5.85); S.add(clk);
  clk.add(mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.2, 32).rotateX(Math.PI / 2), std({ color: 0xf2e8cf, emissive: 0xffe8b0, emissiveIntensity: 0.5 })));
  const hand = mesh(new THREE.BoxGeometry(0.08, 0.8, 0.05), std({ color: 0x1a1a1a })); hand.geometry.translate(0, 0.38, 0); hand.position.z = 0.13; clk.add(hand);
  // awning (stripes)
  const at = ctex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#1a4a4a' : '#d8c8a0'; c.fillRect(i * 32, 0, 32, h); } }); at.wrapS = THREE.RepeatWrapping; at.repeat.x = 3;
  const aw = mesh(new THREE.BoxGeometry(14, 0.15, 2.4), new THREE.MeshStandardMaterial({ map: at, roughness: 0.7 })); aw.position.set(-1, 6.4, -5.0); aw.rotation.x = 0.28; S.add(aw);
  // warm spill from shop onto the street + reflections
  ptl(S, 0xffa858, 30, 12, [-4.2, 3, -3.6]); ptl(S, 0xffb060, 18, 10, [3.5, 3, -4.4]);
  lightStreak(S, [-4.2, -4.5], 0xffa858, { len: 9, w: 3 }); lightStreak(S, [3.5, -4.5], 0xffb060, { len: 8, w: 1.6 }); lightStreak(S, [-0.6, -4.8], 0x5ae8ff, { len: 10, w: 4, k: 0.5 });
  for (const lx of [-9, 9]) lightStreak(S, [lx, -1.2], 0xffd8a0, { len: 7, w: 1.2 });
  // details: bench, trash can, hydrant
  box(S, [3.2, 0.25, 1], [8, 1.6, -3.6], std({ map: T.planks(0x5a3a22) }), { r: 0.05, name: 'bench' });
  for (const bx of [6.8, 9.2]) box(S, [0.2, 1.6, 0.9], [bx, 0.8, -3.6], std({ color: 0x1a1a1a, metalness: 0.6 }), { r: 0.03, name: 'bench leg' });
  const can = mesh(new THREE.CylinderGeometry(0.6, 0.55, 1.8, 14), std({ color: 0x2a4a3a, metalness: 0.4, roughness: 0.5 })); can.position.set(-9.8, 0.9, -4.6); S.add(can);
  const hy = mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 12), std({ color: 0xc02a2a, roughness: 0.4 })); hy.position.set(5.8, 0.7, -4.4); S.add(hy);
  const R = rain(S, { lightning, ...rainOpts });
  return { door, rain: R, update(t, cam) { cn.update(t); R.update(t, cam); rg(t); hand.rotation.z = -t * 0.8; sl.intensity = 26 * (0.92 + 0.08 * Math.sin(t * 23) * Math.sin(t * 3.1)); } };
}

// ---------- Time Exchange interior ----------
// Room x -9..9, back wall z=-10, h 10. Counter along x (-5..5) front face z=-2.4, top y=3.0 (depth z -2.4..-4.0).
// Mr. Vesper stands behind at z≈-5.4. Customer in front at z≈0. Green banker's lamp at (3, 3.0, -3.3).
// Shelves of glowing year-jars on the back wall. Rain window on the left wall (x=-9) with cold light streaks.
export function shopInside(S, { lightning = [], night = true } = {}) {
  room(S, { w: 18, d: 22, h: 10, wallCol: 0x2a3a34, floorTex: repeatMat(T.planks(0x4a3020), 3, 4), zBack: -10, trim: 0x5a4028 });
  S.userData.look = 'night'; S.background = new THREE.Color(0x05060a);
  S.add(new THREE.HemisphereLight(0x5a6a8a, 0x1a1008, 0.35));
  const wood = std({ map: T.planks(0x5a3420), roughness: 0.6 });
  box(S, [10, 3.0, 1.6], [0, 1.5, -3.2], wood, { r: 0.06, name: 'counter' });
  box(S, [10.4, 0.18, 1.9], [0, 3.06, -3.2], std({ color: 0x3a2014, roughness: 0.75 }), { r: 0.05, name: 'countertop' });
  // banker's lamp (key light)
  const lb = new THREE.Group(); lb.position.set(3.2, 3.15, -3.5); S.add(lb);
  lb.add(mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.15, 16), std({ color: 0xb08a3a, metalness: 0.8, roughness: 0.3 })));
  const st = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), std({ color: 0xb08a3a, metalness: 0.8 })); st.position.y = 0.6; lb.add(st);
  const shade = mesh(new THREE.CylinderGeometry(0.3, 0.6, 0.45, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a6a3a, emissive: 0x0a3a1a, roughness: 0.3, side: THREE.DoubleSide })); shade.position.y = 1.25; lb.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), glowM(0xfff0c0)); bulb.position.y = 1.12; lb.add(bulb);
  const key = new THREE.SpotLight(0xffd8a0, 90, 18, 0.85, 0.6, 1.5); key.position.set(3.2, 4.3, -3.5); key.target.position.set(0, 0, -1); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); S.add(key, key.target);
  ptl(S, 0xffc080, 9, 9, [2.5, 4.6, -1.6]);
  // shelves of jars
  const sw = std({ map: T.planks(0x3a2414) });
  const jars = []; const cols = [0x8af0ff, 0xffd84a, 0xff8ad8, 0x8aff9a, 0xc8a0ff];
  for (const [i, y] of [[0, 3.4], [1, 5.6], [2, 7.8]].map((v, j) => [j, v[1]])) { box(S, [14, 0.2, 1.2], [0, y, -9.4], sw, { r: 0.03, solid: false });
    for (let k = 0; k < 9; k++) jars.push(yearJar(S, [-6 + k * 1.5, y + 0.1, -9.3], cols[(k + i * 2) % 5], { s: 0.85 })); }
  ptl(S, 0x8ad8ff, 10, 10, [-3, 6, -7]); ptl(S, 0xffb0e0, 8, 10, [3.5, 6, -7]);
  // pendulum wall clock (right wall)
  const wc = new THREE.Group(); wc.position.set(8.7, 6, -6); wc.rotation.y = -90 * D; S.add(wc);
  wc.add(mesh(new THREE.BoxGeometry(1.6, 4, 0.4), std({ color: 0x4a2a18, roughness: 0.5 })));
  const face = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 24).rotateX(Math.PI / 2), std({ color: 0xf2e8cf })); face.position.set(0, 1.2, 0.22); wc.add(face);
  const pend = new THREE.Group(); pend.position.set(0, 0.6, 0.22); wc.add(pend); const pb = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 16).rotateX(Math.PI / 2), std({ color: 0xd8b04a, metalness: 0.9, roughness: 0.25 })); pb.position.y = -1.9; pend.add(pb);
  const rod = mesh(new THREE.BoxGeometry(0.05, 1.9, 0.03), std({ color: 0xd8b04a, metalness: 0.9 })); rod.position.y = -0.95; pend.add(rod);
  // rain window on left wall + cold light through it
  const win = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ color: 0x1a2a4a })); win.position.set(-8.75, 5, -3); win.rotation.y = 90 * D; S.add(win);
  box(S, [0.2, 4.8, 4.8], [-8.85, 5, -3], std({ color: 0x2a1a12 }), { r: 0, cast: false, solid: false });
  win.position.x = -8.7; const rg = rainGlass(S, [4.4, 4.4], [-8.6, 5, -3], 90);
  box(S, [0.3, 4.4, 0.18], [-8.6, 5, -3], std({ color: 0x2a1a12 }), { r: 0, cast: false, solid: false }); box(S, [0.3, 0.18, 4.4], [-8.6, 5, -3], std({ color: 0x2a1a12 }), { r: 0, cast: false, solid: false });
  const cold = patternLight(S, { pos: [-14, 9, -3], target: [0, 2, -2], col: 0x6a8ad8, intensity: 220, angle: 0.42, pattern: 'rain' });
  // front wall (z=11.6, faces -z) for reverse shots from behind the counter: door + rainy window
  box(S, [18, 10, 0.4], [0, 5, 11.8], std({ map: T.plaster(0x2a3a34) }), { r: 0, cast: false, name: 'front wall' });
  const fd = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 6.2), glowM(0x101a30)); fd.position.set(-3, 3.1, 11.55); fd.rotation.y = Math.PI; S.add(fd);
  box(S, [3.2, 6.5, 0.2], [-3, 3.25, 11.62], std({ color: 0x3a2418 }), { r: 0.02, cast: false, solid: false });
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.6), glowM(0x14223e)); fw.position.set(3.5, 5, 11.55); fw.rotation.y = Math.PI; S.add(fw);
  const rg2 = rainGlass(S, [4.2, 3.6], [3.5, 5, 11.45], 180);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.85), new THREE.MeshBasicMaterial({ map: signTex('TIME EXCHANGE', '#5ae8ff'), toneMapped: false, transparent: true, opacity: 0.5 })); sign.position.set(3.5, 7.3, 11.5); sign.rotation.y = Math.PI; sign.scale.x = -1; S.add(sign);
  // details: brass bell, ledger, rug, umbrella stand, coat rack
  const bell = mesh(new THREE.SphereGeometry(0.28, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: 0xd8b04a, metalness: 0.9, roughness: 0.25 })); bell.position.set(-3.6, 3.15, -2.9); S.add(bell);
  box(S, [1.6, 0.25, 1.1], [-2.0, 3.27, -3.6], std({ color: 0x5a1a1a }), { r: 0.04, solid: false });
  box(S, [7, 0.04, 4.5], [0, 0.02, 1.0], std({ color: 0x5a1a22, roughness: 1 }), { r: 0, cast: false, solid: false });
  const us = mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.6, 12), std({ color: 0x3a3a40, metalness: 0.5 })); us.position.set(7.2, 0.8, 1.5); S.add(us);
  const R = rain(S, { ground: null, n: 0, splashes: 0, lightning, lightMax: 3 });
  return { jars, key, cold, update(t, cam) { R.update(t, cam); rg(t); rg2(t); pend.rotation.z = Math.sin(t * 2.2) * 0.3; const f = R.flash(t); cold.intensity = (cold.userData.base ?? 220) + f * 900;
    jars.forEach((j, i) => j.userData.core.scale.setScalar(0.9 + 0.12 * Math.sin(t * 2 + i))); } };
}

// ---------- small apartment ----------
// Room x -9..9, back wall z=-9, h 9. Window on the back wall at x=3.5 (y 3..7) with rain (night) or sun (morning).
// Couch (seat top 1.6) at x=-3.5, z -6.3..-4.3 facing +z (seat front edge z≈-4.3). Kitchen table at (4.5, -2.5) top y 2.6.
// Front door on the right wall (x=9) at z=-1 (opening z -2.3..0.3). Floor lamp at (-7.6, -7). Returns { update(t, cam), door, flash }.
export function apartment(S, { morning = false, lightning = [], lamp = true } = {}) {
  room(S, { w: 18, d: 18, h: 9, wallCol: morning ? 0xc8b8a0 : 0x8a8478, floorTex: repeatMat(T.planks(0x6a4a30), 3, 3), zBack: -9, trim: 0xe8dcc8 });
  S.userData.look = morning ? null : 'night';
  S.add(new THREE.HemisphereLight(morning ? 0xfff0d8 : 0x4a5a8a, 0x2a1a10, morning ? 1.1 : 0.4));
  // window
  const sky = morning ? 0xffd8a0 : 0x0e1a34;
  const wv = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: sky })); wv.position.set(3.5, 5, -8.85); S.add(wv);
  // city silhouettes beyond
  const city = ctex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, morning ? '#ffe6b0' : '#0a1428'); g.addColorStop(1, morning ? '#ffb070' : '#1a2448'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 30) { const bh = 60 + Math.random() * 120; c.fillStyle = morning ? '#c8906a' : '#05080f'; c.fillRect(x, h - bh, 28, bh);
      for (let y = h - bh + 8; y < h; y += 16) for (let xx = x + 4; xx < x + 24; xx += 8) if (Math.random() < (morning ? 0.1 : 0.35)) { c.fillStyle = '#ffd890'; c.fillRect(xx, y, 4, 6); } } });
  wv.material = new THREE.MeshBasicMaterial({ map: city });
  const fr = std({ color: 0xf2ece0 });
  box(S, [4.5, 0.25, 0.5], [3.5, 2.9, -8.7], fr, { r: 0.03, name: 'sill' }); box(S, [4.5, 0.25, 0.3], [3.5, 7.1, -8.8], fr, { r: 0.03, solid: false, cast: false });
  for (const x of [1.4, 3.5, 5.6]) box(S, [0.2, 4.2, 0.3], [x, 5, -8.78], fr, { r: 0.02, solid: false, cast: false });
  box(S, [4.2, 0.18, 0.3], [3.5, 5, -8.78], fr, { r: 0.02, solid: false, cast: false });
  const rg = morning ? null : rainGlass(S, [4, 4], [3.5, 5, -8.6]);
  // curtains
  for (const x of [0.6, 6.4]) box(S, [1.2, 5.6, 0.2], [x, 5.2, -8.6], std({ color: 0x8a3a3a, roughness: 1 }), { r: 0.1, solid: false });
  const win = patternLight(S, morning ? { pos: [3.5, 9, -16], target: [-1, 0, -1], col: 0xffc080, intensity: 420, angle: 0.5, pattern: 'window' }
                                      : { pos: [3.5, 8, -15], target: [0, 1, -2], col: 0x6a8ae8, intensity: 260, angle: 0.5, pattern: 'rain' });
  // couch
  const cm = std({ color: 0x3a5a6a, roughness: 0.95 });
  box(S, [6, 1.6, 2.2], [-3.5, 0.8, -5.4], cm, { r: 0.2, name: 'couch seat' });
  box(S, [6.4, 3.4, 0.9], [-3.5, 1.7, -6.9], cm, { r: 0.3, name: 'couch back' });
  for (const sx of [-1, 1]) box(S, [0.7, 2.4, 2.8], [-3.5 + sx * 3.2, 1.2, -5.6], cm, { r: 0.25, name: 'couch arm' });
  box(S, [1.2, 1.0, 0.4], [-5.2, 2.3, -6.1], std({ color: 0xe8c86a }), { r: 0.2, solid: false });   // cushion
  // kitchen table + chairs + bills
  const wd = std({ map: T.planks(0x8a6040) });
  box(S, [4, 0.2, 2.6], [4.5, 2.5, -2.5], wd, { r: 0.04, name: 'table' });
  for (const [dx, dz] of [[-1.8, -1.1], [1.8, -1.1], [-1.8, 1.1], [1.8, 1.1]]) box(S, [0.2, 2.4, 0.2], [4.5 + dx, 1.2, -2.5 + dz], wd, { r: 0.03, name: 'table leg' });
  const bills = ctex(128, 160, (c, w, h) => { c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, w, h); c.fillStyle = '#c02a2a'; c.font = '800 20px Inter'; c.fillText('PAST DUE', 12, 34); c.fillStyle = '#8a8a8a'; for (let y = 52; y < 150; y += 14) c.fillRect(12, y, 90 - (y % 3) * 10, 4); });
  [[3.6, -2.2, 0.3], [4.3, -2.6, -0.2], [5.1, -2.1, 0.5]].forEach(([x, z, r]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshStandardMaterial({ map: bills })); p.rotation.set(-Math.PI / 2, 0, r); p.position.set(x, 2.62, z); S.add(p); });
  const mug = mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.4, 12), std({ color: 0xe8e0d0 })); mug.position.set(5.8, 2.8, -2.9); S.add(mug);
  // floor lamp (warm key) + small table lamp
  box(S, [0.18, 5, 0.18], [-7.6, 2.5, -7], std({ color: 0x2a2a2a }), { r: 0.04, name: 'lamp pole' });
  const sh = mesh(new THREE.ConeGeometry(0.9, 1.0, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffb060, emissiveIntensity: lamp ? 0.9 : 0.1, side: THREE.DoubleSide })); sh.position.set(-7.6, 5.4, -7); S.add(sh);
  if (lamp) ptl(S, 0xffb060, morning ? 6 : 34, 16, [-7.2, 5.2, -6.2]);
  // door (right wall)
  const door = new THREE.Group(); door.position.set(8.75, 0, 0.3); S.add(door);
  const dm = mesh(new THREE.BoxGeometry(0.2, 6.2, 2.6), std({ color: 0x6a4028, roughness: 0.6 })); dm.geometry.translate(0, 3.1, -1.3); door.add(dm);
  const knob = mesh(new THREE.SphereGeometry(0.14, 10, 8), std({ color: 0xd8b04a, metalness: 0.9 })); knob.position.set(-0.15, 3, -2.3); door.add(knob);
  const dark = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6.2), glowM(0x0a0e18)); dark.position.set(8.95, 3.1, -1); dark.rotation.y = -90 * D; S.add(dark);
  // coat hooks with scarf, photos, plant, rug
  box(S, [0.2, 0.2, 2], [8.75, 6.8, -5], std({ color: 0x4a2a18 }), { r: 0.03, solid: false });
  box(S, [0.3, 2.2, 0.8], [8.6, 5.6, -5.4], std({ color: 0x8a3a5a, roughness: 1 }), { r: 0.15, solid: false });
  [[-5.5, 6.2, 0xe8c8a0], [-3.2, 6.6, 0xa8c8e8], [-1.4, 6.0, 0xd8a8c8]].forEach(([x, y, c]) => { box(S, [1.3, 1.5, 0.08], [x, y, -8.85], std({ color: c }), { r: 0, solid: false, cast: false }); box(S, [1.5, 1.7, 0.05], [x, y, -8.9], std({ color: 0x4a3020 }), { r: 0, solid: false, cast: false }); });
  const pot = mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.9, 14), std({ color: 0xb05a3a })); pot.position.set(7.6, 0.45, -7.6); S.add(pot);
  for (let i = 0; i < 6; i++) { const lf = mesh(new THREE.SphereGeometry(0.5, 8, 6), std({ color: 0x3a7a3a })); lf.scale.set(0.5, 1.4, 0.3); lf.position.set(7.6 + Math.cos(i) * 0.35, 1.5, -7.6 + Math.sin(i) * 0.35); lf.rotation.set(Math.sin(i) * 0.5, i, Math.cos(i) * 0.5); S.add(lf); }
  box(S, [7, 0.04, 4.5], [-2.5, 0.02, -2.2], std({ color: 0x6a5a8a, roughness: 1 }), { r: 0, cast: false, solid: false });
  if (morning) { const sun = new THREE.DirectionalLight(0xffd0a0, 1.4); sun.position.set(3, 9, -14); sun.target.position.set(0, 0, 0); S.add(sun, sun.target); }
  const R = rain(S, { ground: null, n: 0, splashes: 0, lightning, lightMax: 2.5 });
  return { door, win, update(t, cam) { R.update(t, cam); if (rg) rg(t); if (!morning) win.intensity = 260 + R.flash(t) * 1200; }, flash: R.flash };
}

// ---------- rowhouse stoop (home exterior) ----------
// Facade front z=-6, door at x=0 (opening x -1.3..1.3, swings inward: door.rotation.y = +1.6), landing top y=1.5 (z -6.5..-5.3),
// steps tops 1.0 (z -5.1..-4.3) and 0.5 (z -4.3..-3.5), 5.6 wide; railings at x=±3.0.
// Lit window at x=-5.5. Street in front. night: rain + streetlamp at x=7; morning: sunrise, puddles, no rain.
export function stoop(S, { morning = false, lightning = [] } = {}) {
  if (morning) {
    S.background = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6a9ad8'); g.addColorStop(0.6, '#ffd0a0'); g.addColorStop(1, '#ffb080'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    S.fog = new THREE.Fog(0xffd8b0, 40, 120); S.add(new THREE.HemisphereLight(0xfff0d8, 0x6a5040, 1.1)); clouds(S, { tint: 0xfff0e0 });
    const sun = new THREE.DirectionalLight(0xffc890, 3.2); sun.position.set(-14, 9, 12); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 0.5, far: 80 }); sun.shadow.bias = -0.0005; S.add(sun, sun.target);
    wetFloor(S, { col: '#4a4a52', puddles: 10, area: [-10, 10, -3, 8] });
    for (let i = 0; i < 8; i++) { const x = -40 + i * 11; const h = 10 + (i * 37 % 9); box(S, [10, h, 6], [x, h / 2, -20], std({ map: T.brick([0xa05a3a, 0x8a6a5a, 0xb07a4a][i % 3]) }), { r: 0, cast: false, solid: false }); }
  } else {
    S.background = new THREE.Color(0x070a14); S.fog = new THREE.Fog(0x0a0e1a, 18, 70); S.userData.look = 'night'; clouds(S, { night: true });
    S.add(new THREE.HemisphereLight(0x4a5a8a, 0x101018, 0.45));
    const moon = new THREE.DirectionalLight(0x8aa0e8, 0.7); moon.position.set(-8, 14, 8); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); S.add(moon, moon.target);
    wetFloor(S, { area: [-10, 10, -3, 10] });
  }
  const brick = repeatMat(T.brick(0x7a4a3a), 5, 3);
  box(S, [9, 14, 1], [-5.8, 7, -6.5], brick, { r: 0, cast: false, name: 'facade' }); box(S, [9, 14, 1], [5.8, 7, -6.5], brick, { r: 0, cast: false, name: 'facade' });
  box(S, [2.6, 6.5, 1], [0, 10.75, -6.5], brick, { r: 0, cast: false, name: 'facade' });
  const door = new THREE.Group(); door.position.set(-1.3, 1.5, -6.05); S.add(door);
  const dd = mesh(new THREE.BoxGeometry(2.6, 6, 0.2), std({ color: 0x1a3a5a, roughness: 0.5 })); dd.geometry.translate(1.3, 3, 0); door.add(dd);
  const kn = mesh(new THREE.SphereGeometry(0.13, 10, 8), std({ color: 0xd8b04a, metalness: 0.9 })); kn.position.set(2.2, 3, 0.15); door.add(kn);
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6), glowM(morning ? 0x4a3a2a : 0xffb060)); hall.position.set(0, 4.5, -6.7); S.add(hall);
  const st = std({ map: T.concrete(0x9a948a) });
  for (let i = 0; i < 3; i++) box(S, [5.6, 0.5, 0.8], [0, 0.25 + i * 0.5, -3.9 - i * 0.8], st, { r: 0.03, name: 'step' });
  box(S, [5.6, 1.5, 1.2], [0, 0.75, -5.9], st, { r: 0.03, name: 'landing' });
  for (const sx of [-1, 1]) { box(S, [0.12, 0.12, 3.4], [sx * 3.0, 2.4, -4.6], std({ color: 0x1a1a1a, metalness: 0.6 }), { r: 0.03, name: 'rail', rot: [-0.32, 0, 0] });
    for (const z of [-3.6, -5.4]) box(S, [0.1, 2.0, 0.1], [sx * 3.0, z > -4 ? 1.4 : 2.2, z], std({ color: 0x1a1a1a, metalness: 0.6 }), { r: 0.02, name: 'rail post' }); }
  // windows
  for (const x of [-5.5, 5.5]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.6), new THREE.MeshStandardMaterial({ color: 0x2a1a10, emissive: morning ? 0x6a8ab0 : 0xffb060, emissiveIntensity: morning ? 0.4 : (x < 0 ? 1.0 : 0.25) })); w.position.set(x, 5, -5.95); S.add(w);
    box(S, [3.4, 0.25, 0.5], [x, 3.1, -5.8], std({ color: 0xe8e0d0 }), { r: 0.03, solid: false }); box(S, [3.4, 0.2, 0.3], [x, 6.9, -5.9], std({ color: 0xe8e0d0 }), { r: 0.03, solid: false }); }
  const ng = morning ? null : rainGlass(S, [3, 3.6], [-5.5, 5, -5.7]);
  // planter, house number, mailbox
  const pt = mesh(new THREE.CylinderGeometry(0.6, 0.5, 1.0, 14), std({ color: 0x5a6a7a })); pt.position.set(4.0, 0.5, -4.6); S.add(pt);
  for (let i = 0; i < 5; i++) { const f = mesh(new THREE.SphereGeometry(0.28, 8, 6), std({ color: [0xe84a6a, 0xf2c24a, 0xffffff][i % 3] })); f.position.set(4.0 + Math.cos(i * 1.3) * 0.35, 1.2 + (i % 2) * 0.2, -4.6 + Math.sin(i * 1.3) * 0.3); S.add(f); }
  box(S, [0.9, 0.6, 0.1], [1.9, 5.8, -5.95], std({ color: 0xd8b04a, metalness: 0.8 }), { r: 0.04, solid: false, cast: false });
  // streetlamp
  box(S, [0.3, 9, 0.3], [7.5, 4.5, -2.5], std({ color: 0x2a2a30, metalness: 0.6 }), { r: 0.05, name: 'lamp post' });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), glowM(morning ? 0x8a8a80 : 0xfff0c0)); bulb.position.set(7.5, 9.1, -2.5); S.add(bulb);
  let R = null;
  if (!morning) { const sp = new THREE.SpotLight(0xffd8a0, 300, 20, 0.6, 0.5, 1.4); sp.position.set(7.3, 8.8, -2.3); sp.target.position.set(4, 0, 0); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); S.add(sp, sp.target);
    ptl(S, 0xffb060, 26, 10, [0, 3.5, -4.0]); ptl(S, 0xffb060, 14, 9, [-5.5, 4, -4.4]);
    lightStreak(S, [7.5, -1.5], 0xffd8a0, { len: 9, w: 1.5 }); lightStreak(S, [0, -3], 0xffb060, { len: 7, w: 2 }); lightStreak(S, [-5.5, -4.5], 0xffb060, { len: 8, w: 2.2, k: 0.5 });
    R = rain(S, { lightning }); }
  return { door, rain: R, update(t, cam) { if (R) R.update(t, cam); if (ng) ng(t); } };
}

// ---------- rainy street (generic, for walking / running / crowds) ----------
// cityNight + wet floor + rain + streetlamp pools. Play area x ±12, z -6..10.
export function rainStreet(S, { lightning = [], rainOpts = {} } = {}) {
  const cn = cityNight(S); wetFloor(S, { area: [-12, 12, -6, 10] });
  for (const lx of [-9, 9]) lightStreak(S, [lx, -1.2], 0xffd8a0, { len: 8, w: 1.3 });
  [[-4, 0xff3ad8], [5, 0x3ae8ff], [13, 0xffe83a]].forEach(([x, c]) => lightStreak(S, [x, -8], c, { len: 12, w: 2.5, k: 0.45 }));
  const R = rain(S, { lightning, ...rainOpts });
  return { rain: R, update(t, cam) { cn.update(t); R.update(t, cam); } };
}
