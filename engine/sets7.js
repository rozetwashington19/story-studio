// Episode 006 kit (Day Creatures, owner request R2): a farm town that lives at night.
// Every set: characters face +Z, camera at +Z, play area x ±7, z -4..8. All sets return { update(t), ... } — call update(t) every frame.
//   fernway(S, { night, dawn })  main street: boarded houses (back-left), cornfield behind a fence (back-right), bus-stop shelter,
//                                lamp posts, string lights + lanterns at night, Moon Fair balloon tethered in the square.
//   cornfield(S, { night, dawn }) rows of corn around a dirt clearing (husks walk out of it); `env.corn.sway(t, k)`.
//   park(S)                      wide open sunny meadow (no shade anywhere), corn + houses far away, flowers, one bench.
//   bedroomDay(S, { night })     kids' bedroom: two beds, boarded window with sunlight slits, door on the right wall (env.door.open(k)).
//   nightClass(S)                classroom at night (moon outside, lamp light).
// Props: moonBalloon(S, { glow, r }) (hot-air balloon, glows like a moon at night; .rope(from, to) draws the tether),
//        busStop(S, [x,z]), lawnChair(S, [x,z], ry), beachUmbrella(S, [x,y,z], col), cornRows(S, opts), boardedWindow(S, ...),
//        sunDisc(S, pos, col, r), stars(S, n), stringLights(S, a, b, n).
import * as THREE from 'three';
import { T, std, box, repeatMat, room, dayLight } from './sets.js';
import { T2 } from './sets2.js';
import { TX, patternLight } from './themes.js';
import { clouds } from './clouds.js';
import { noise } from './avatar.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
const glowM = (col) => new THREE.MeshBasicMaterial({ color: col });
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const ptl = (S, col, i, d, pos) => { const l = new THREE.PointLight(col, i, d, 1.7); l.position.set(...pos); S.add(l); return l; };
const tmx = (t, rx, ry, o = {}) => { const m = t.clone(); m.repeat.set(rx, ry); m.needsUpdate = true; return std({ map: m, bumpMap: m, bumpScale: 1.2, ...o }); };
const skyTex = (stops) => ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); });

// ---------- lighting rigs ----------
// harsh, threatening day: low hard sun (long shadows), bleached sky, warm haze. night: cozy moonlight + warm practicals.
function sky(S, { night = false, dawn = false, sunPos = [16, 10, 4], area = 30, intensity = 3.6 } = {}) {
  if (night) {
    S.userData.look = 'night';
    S.background = skyTex([[0, '#070b22'], [0.6, '#16224e'], [1, '#2e3a6e']]); S.fog = new THREE.Fog(0x1a2448, 30, 120);
    clouds(S, { night: true });
    S.add(new THREE.HemisphereLight(0x6a80d0, 0x1a1420, 0.75));
    const moon = new THREE.DirectionalLight(0xa8b8ff, 1.5); moon.position.set(-10, 16, 8); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.bias = -0.0005; Object.assign(moon.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 90 }); S.add(moon, moon.target);
    const rim = new THREE.DirectionalLight(0xffb070, 0.8); rim.position.set(6, 7, -12); S.add(rim);
    const m = new THREE.Mesh(new THREE.SphereGeometry(3.2, 24, 16), glowM(0xfff4d0)); m.position.set(-22, 30, -90); m.material.fog = false; S.add(m); S.userData.moon = m;
    stars(S, 260); return moon;
  }
  if (dawn) {
    S.background = skyTex([[0, '#3a5a9a'], [0.55, '#f2a070'], [0.8, '#ffd27a'], [1, '#fff0c0']]); S.fog = new THREE.Fog(0xf2c090, 40, 140);
    clouds(S, { tint: 0xffc0a0 });
    S.add(new THREE.HemisphereLight(0xffd0b0, 0x4a3020, 0.7));
    const sun = new THREE.DirectionalLight(0xffb070, 3.4); sun.position.set(...sunPos); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
    Object.assign(sun.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 120 }); S.add(sun, sun.target);
    const rim = new THREE.DirectionalLight(0xff9a60, 1.4); rim.position.set(-6, 5, -14); S.add(rim);
    return sun;
  }
  S.background = skyTex([[0, '#2f78d8'], [0.6, '#8ec4f0'], [1, '#f6efd8']]); S.fog = new THREE.Fog(0xf0e2c0, 45, 150);
  clouds(S);
  S.add(new THREE.HemisphereLight(0xcfe0ff, 0x6a5030, 0.65));
  const sun = new THREE.DirectionalLight(0xfff0d0, intensity); sun.position.set(...sunPos); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 120 }); S.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0xffd8a0, 1.2); rim.position.set(-8, 6, -14); S.add(rim);
  return sun;
}
export function stars(S, n = 200, seed = 4) {
  const R = rng(seed), g = new THREE.BufferGeometry(), p = [];
  for (let i = 0; i < n; i++) { const a = (R() - 0.5) * Math.PI * 1.6, e = 0.15 + R() * 1.2, r = 150; p.push(Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r * 0.8 + 10, -Math.cos(a) * Math.cos(e) * r); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.9 }); const pts = new THREE.Points(g, m); S.add(pts); return pts;
}
export function sunDisc(S, [x, y, z], col = 0xfff2c0, r = 5) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  const core = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ color: col, fog: false })); g.add(core);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(r * 2.6, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25, fog: false, depthWrite: false })); halo.position.z = -0.1; g.add(halo);
  g.lookAt(0, y, 30); return g;
}

// ---------- corn ----------
const CORN = {};
function cornTex(night) { const k = night ? 'n' : 'd'; if (CORN[k]) return CORN[k];
  const t = ctex(256, 512, (x, w, h) => { x.clearRect(0, 0, w, h); const R = rng(night ? 3 : 7);
    const g1 = night ? ['#2e4a2a', '#3a5a30', '#24402a'] : ['#6aa03a', '#8ab840', '#5a8a30', '#a8c050'];
    x.strokeStyle = night ? '#4a5a30' : '#9ab04a'; x.lineWidth = 9; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2 + 3, 40); x.stroke();   // stalk
    for (let i = 0; i < 9; i++) { const y0 = h - 60 - i * 46, dir = i % 2 ? 1 : -1, L = 70 + R() * 50, droop = 40 + R() * 60;   // arching blades
      x.fillStyle = g1[i % g1.length]; x.beginPath(); x.moveTo(w / 2, y0); x.quadraticCurveTo(w / 2 + dir * L * 0.7, y0 - 60, w / 2 + dir * L * 1.25, y0 - 20 + droop);
      x.quadraticCurveTo(w / 2 + dir * L * 0.6, y0 - 40, w / 2, y0 + 14); x.fill();
      x.strokeStyle = 'rgba(255,255,220,0.25)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(w / 2, y0 + 4); x.quadraticCurveTo(w / 2 + dir * L * 0.65, y0 - 50, w / 2 + dir * L * 1.2, y0 - 18 + droop); x.stroke(); }
    x.fillStyle = night ? '#8a7a40' : '#f2d060'; x.beginPath(); x.ellipse(w / 2 + 14, h * 0.5, 10, 34, 0.35, 0, 7); x.fill();   // cob
    x.fillStyle = night ? '#4a6a30' : '#8ab040'; x.beginPath(); x.ellipse(w / 2 + 10, h * 0.53, 9, 30, 0.35, 0, 7); x.fill();   // husk leaves
    x.strokeStyle = night ? '#9a8a50' : '#e8c060'; x.lineWidth = 3; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(w / 2, 44); x.lineTo(w / 2 + (i - 3) * 9, 6 + Math.abs(i - 3) * 6); x.stroke(); }   // tassel
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return (CORN[k] = t); }
// instanced corn stalks in a region; sway(t, k) animates them (k = extra rustle strength)
export function cornRows(S, { x = [6, 40], z = [-40, -6], step = 1.6, dx = 1.1, h = 6.5, night = false, seed = 9, skip = null, shadow = false } = {}) {
  const R = rng(seed), P = [];
  for (let zz = z[0]; zz <= z[1]; zz += step) for (let xx = x[0]; xx <= x[1]; xx += dx) { const px = xx + (R() - 0.5) * 0.5, pz = zz + (R() - 0.5) * 0.4; if (skip && skip(px, pz)) continue; P.push([px, pz, 0.8 + R() * 0.35, R() * 6.3]); }
  // crossed-plane corn plants with a painted alpha texture (stalk, arching blades, a cob, a golden tassel); alpha-tested shadows
  const tex = cornTex(night);
  const mk2 = (rot) => { const g = new THREE.PlaneGeometry(3.2, h * 1.12); g.translate(0, h * 0.56, 0); g.rotateY(rot); return g; };
  const mat = std({ map: tex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75, color: night ? 0x8a9aa0 : 0xffffff });
  const dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.45, side: THREE.DoubleSide });
  const IM = [mk2(0), mk2(Math.PI / 2)].map(g => { const im = new THREE.InstancedMesh(g, mat, P.length); im.customDepthMaterial = dmat; im.castShadow = shadow; im.receiveShadow = true; S.add(im); return im; });   // shadow casting is expensive in the software renderer: opt in
  const o = new THREE.Object3D();
  const sway = (t, k = 0) => { P.forEach(([px, pz, s, ph], i) => { o.position.set(px, 0, pz); o.scale.set(s, s, s); o.rotation.set(Math.sin(t * 1.3 + ph + px * 0.2) * (0.03 + k * 0.1 * Math.sin(t * 9 + ph)), ph, Math.cos(t * 1.1 + ph + pz * 0.3) * (0.03 + k * 0.08)); o.updateMatrix();
    IM.forEach(im => im.setMatrixAt(i, o.matrix)); }); IM.forEach(im => im.instanceMatrix.needsUpdate = true); };
  sway(0); return { sway, count: P.length };
}

// ---------- props ----------
export function moonBalloon(S, { glow = false, r = 4.2, name = 'balloon' } = {}) {
  const g = new THREE.Group(); S.add(g);
  const tex = ctex(512, 256, (x, w, h) => { const cols = glow ? ['#fff2c8', '#f8dc98'] : ['#f6ead0', '#3a4a9a']; for (let i = 0; i < 12; i++) { x.fillStyle = cols[i % 2]; x.fillRect(i * w / 12, 0, w / 12 + 1, h); }
    x.fillStyle = glow ? '#e8c880' : '#e8b840'; x.fillRect(0, h * 0.42, w, 18); x.font = '700 40px Inter'; x.textAlign = 'center'; for (let i = 0; i < 4; i++) { x.fillStyle = glow ? '#c8a050' : '#e8b840'; x.beginPath(); x.arc(i * w / 4 + 64, h * 0.3, 18, 0, 7); x.fill(); } noise(x, w, h, 0.8, 0.05); });
  const mat = std({ map: tex, roughness: 0.6, emissive: glow ? 0xffe0a0 : 0x000000, emissiveMap: glow ? tex : null, emissiveIntensity: glow ? 0.9 : 0 });
  const env = mesh(new THREE.SphereGeometry(r, 36, 24), mat); env.scale.set(1, 1.12, 1); env.position.y = r * 1.6; g.add(env);
  const skirt = mesh(new THREE.CylinderGeometry(r * 0.32, r * 0.18, r * 0.5, 16, 1, true), std({ color: glow ? 0xe8c880 : 0x3a4a9a, side: THREE.DoubleSide })); skirt.position.y = r * 0.42; g.add(skirt);
  const bk = mesh(new THREE.BoxGeometry(1.3, 1.0, 1.3), std({ map: T.planks(0x9a6a3a), roughness: 0.9 })); bk.position.y = -0.4; g.add(bk);
  const ropeM = std({ color: 0x5a4a3a });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const c = mesh(new THREE.CylinderGeometry(0.03, 0.03, r * 0.6, 4), ropeM); c.position.set(sx * 0.45, 0.25 + r * 0.05, sz * 0.45); c.rotation.set(sz * -0.12, 0, sx * 0.12); g.add(c); }
  if (glow) { const l = new THREE.PointLight(0xffd8a0, 30, 40, 1.4); l.position.y = r * 0.3; g.add(l); g.userData.light = l; }
  g.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = 'balloon'; } });
  // tether rope (world space): rope(from Vector3, to Vector3, sag)
  const tg = new THREE.CylinderGeometry(0.04, 0.04, 1, 5); tg.translate(0, 0.5, 0); const segs = [...Array(10)].map(() => { const m = mesh(tg, ropeM, false); S.add(m); return m; });
  const a = new THREE.Vector3(), b = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  g.userData.rope = (p0, p1, sag = 1) => segs.forEach((m, i) => { const u0 = i / 10, u1 = (i + 1) / 10; a.lerpVectors(p0, p1, u0); a.y -= Math.sin(u0 * Math.PI) * sag; b.lerpVectors(p0, p1, u1); b.y -= Math.sin(u1 * Math.PI) * sag;
    m.position.copy(a); const d = b.clone().sub(a); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(up, d.normalize()); m.visible = true; });
  g.userData.hideRope = () => segs.forEach(m => m.visible = false); g.userData.hideRope();
  g.userData.basket = bk; g.userData.r = r; return g;
}
export function busStop(S, [x, z], { col = 0x2a6a8a } = {}) {
  const m = std({ color: col, roughness: 0.5, metalness: 0.3 }), roof = std({ color: 0xd8d0c0, roughness: 0.6 });
  box(S, [6.4, 0.3, 4.4], [x, 5.4, z], roof, { r: 0.08, name: 'shelter roof' });
  for (const sx of [-1, 1]) box(S, [0.25, 5.3, 0.25], [x + sx * 3.0, 2.65, z + 1.9], m, { r: 0.05, name: 'shelter post' });
  box(S, [6.2, 4.9, 0.2], [x, 2.75, z - 2.0], std({ color: 0x9ab8c8, transparent: true, opacity: 0.55, roughness: 0.1 }), { r: 0, name: 'shelter back' });
  box(S, [0.2, 4.9, 3.8], [x - 3.0, 2.75, z], std({ map: T2.sign('BUS  7', '#2a6a8a', '#ffffff'), roughness: 0.6 }), { r: 0, name: 'shelter side' });
  box(S, [4.6, 0.25, 1.1], [x + 0.2, 1.45, z - 1.25], std({ map: T.planks(0x8a5a30) }), { r: 0.04, name: 'shelter bench' });
  box(S, [0.18, 7.2, 0.18], [x + 3.9, 3.6, z + 2.4], std({ color: 0x3a3a3a, metalness: 0.5 }), { r: 0.04, name: 'bus sign pole' });
  box(S, [1.3, 1.3, 0.08], [x + 3.9, 7.0, z + 2.45], std({ map: T2.sign('BUS', '#f2c420', '#1a1a1a') }), { r: 0, name: 'bus sign' });
}
export function lawnChair(S, [x, z], ry = 0, { col = 0x3aa8a8 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry * D; S.add(g);
  const st = ctex(64, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#' + new THREE.Color(col).getHexString(); c.fillRect(i * 8, 0, 8, h); } });
  const f = std({ color: 0xc8c8c8, metalness: 0.6, roughness: 0.4 }), cl = std({ map: st });
  const seat = mesh(new THREE.BoxGeometry(2.6, 0.15, 3.0), cl); seat.position.set(0, 1.0, 0.6); g.add(seat);
  const back = mesh(new THREE.BoxGeometry(2.6, 0.15, 3.0), cl); back.position.set(0, 2.3, -1.1); back.rotation.x = 1.1; g.add(back);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), f); l.position.set(sx * 1.25, 0.5, 0.6 + sz * 1.3); g.add(l); }
  g.traverse(m => { if (m.isMesh) { m.userData.avatar = 'chair'; m.userData.part = 'chair'; } });
  return g;   // seat top y ≈ 1.08 (sitOn(A, 1.1)), lie back with lean -40
}
export function beachUmbrella(S, [x, y, z], col = 0xe8584a, r = 3.4) {
  const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  const st = ctex(256, 32, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff6e8' : '#' + new THREE.Color(col).getHexString(); c.fillRect(i * w / 8, 0, w / 8 + 1, h); } });
  const can = mesh(new THREE.ConeGeometry(r, 1.2, 16, 1, true), std({ map: st, side: THREE.DoubleSide, roughness: 0.7 })); can.position.y = 6.0; g.add(can);
  const p = mesh(new THREE.CylinderGeometry(0.07, 0.07, 6.6, 8), std({ color: 0xe8e0d0 })); p.position.y = 3.3; g.add(p);
  g.traverse(m => { if (m.isMesh) { m.userData.avatar = 'umbrella'; m.userData.part = 'umbrella'; } });
  return g;
}
export function stringLights(S, a, b, n = 14, { sag = 1.2, cols = [0xffd070, 0xff8a6a, 0x9ad8ff, 0xffe8a0] } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), wireM = std({ color: 0x1a1a1a }), bulbs = [];
  for (let i = 0; i <= n; i++) { const u = i / n, p = A.clone().lerp(B, u); p.y -= Math.sin(u * Math.PI) * sag;
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), glowM(cols[i % cols.length])); s.position.copy(p); S.add(s); bulbs.push(s); }
  const pts = [...Array(21)].map((_, i) => { const u = i / 20, p = A.clone().lerp(B, u); p.y -= Math.sin(u * Math.PI) * sag + 0.12; return p; });
  const w = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.025, 4), wireM); S.add(w);
  return bulbs;
}
const lampPost = (S, [x, z], night, name = 'lamp') => {
  const m = std({ color: 0x2a2a2e, metalness: 0.5, roughness: 0.4 });
  box(S, [0.3, 7.5, 0.3], [x, 3.75, z], m, { r: 0.05, name }); box(S, [1.0, 0.9, 1.0], [x, 7.9, z], m, { r: 0.15, name: name + ' head' });
  const g = mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), night ? glowM(0xffd890) : std({ color: 0xe8e4d0, roughness: 0.2 })); g.position.set(x, 7.6, z); S.add(g);
  if (night) ptl(S, 0xffc070, 22, 16, [x, 7.0, z + 0.4]);
};
// boarded window on a wall facing +Z: day = boards nailed over it with thin bright slits; night = boards stacked aside, warm glow
export function boardedWindow(S, [x, y, z], { w = 2.6, h = 2.6, night = false, glow = 0xffc070 } = {}) {
  const fr = std({ color: 0xf2ece0 }), bd = std({ map: TX.boards(0x8a6a48), roughness: 0.9 });
  box(S, [w + 0.4, h + 0.4, 0.15], [x, y, z], fr, { r: 0.03, cast: false, solid: false });
  box(S, [w, h, 0.1], [x, y, z + 0.05], night ? std({ color: glow, emissive: glow, emissiveIntensity: 1.3 }) : std({ color: 0x1a1612 }), { r: 0, cast: false, solid: false });
  if (!night) for (let i = 0; i < 4; i++) { const by = y - h / 2 + 0.36 + i * (h / 4); box(S, [w + 0.7, h / 4 - 0.12, 0.14], [x, by, z + 0.17], bd, { r: 0.02, cast: false, solid: false, rot: [0, 0, (i % 2 ? 1 : -1) * 0.03] });
    box(S, [w + 0.2, 0.05, 0.05], [x, by + h / 8 - 0.02, z + 0.12], glowM(0xfff4c0), { r: 0, cast: false, solid: false }); }
  else { box(S, [0.5, h + 0.2, 0.12], [x - w / 2 - 0.55, y - 0.1, z + 0.12], bd, { r: 0.02, cast: false, solid: false }); box(S, [0.5, h + 0.2, 0.12], [x + w / 2 + 0.55, y - 0.1, z + 0.12], bd, { r: 0.02, cast: false, solid: false }); }
}
function house(S, [x, z], { w = 10, h = 7, d = 8, col = '#d8c8a8', roof = 0x6a3a32, night = false, glow = 0xffc070 } = {}) {
  const sid = std({ map: (() => { const t = ctex(256, 256, (c, ww, hh) => { c.fillStyle = col; c.fillRect(0, 0, ww, hh); for (let y = 0; y < hh; y += 16) { c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(0, y, ww, 3); } noise(c, ww, hh, 1, 0.08); }); t.repeat.set(w / 5, h / 5); return t; })() });
  box(S, [w, h, d], [x, h / 2, z], sid, { r: 0, cast: true, name: 'house' });
  const rm = std({ map: TX.shingle(roof), roughness: 0.85 });
  const rw = d / 2 / Math.cos(35 * D) + 0.6;
  box(S, [w + 0.8, 0.4, rw], [x, h + Math.tan(35 * D) * d / 4, z + d / 4], rm, { r: 0.04, rot: [35 * D, 0, 0], name: 'roof' });
  box(S, [w + 0.8, 0.4, rw], [x, h + Math.tan(35 * D) * d / 4, z - d / 4], rm, { r: 0.04, rot: [-35 * D, 0, 0], name: 'roof' });
  const tri = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, Math.tan(35 * D) * d / 2)]);
  for (const sx of [-1, 1]) { const gm = mesh(new THREE.ShapeGeometry(tri), sid); gm.rotation.y = sx * 90 * D; gm.position.set(x + sx * w / 2, h, z); gm.material.side = THREE.DoubleSide; S.add(gm); }
  box(S, [2.0, 4.2, 0.2], [x, 2.1, z + d / 2 + 0.05], std({ map: T.planks(0x5a3a2a) }), { r: 0.03, cast: false, solid: false });
  if (night) { const l = ptl(S, 0xffb060, 8, 9, [x, 4.6, z + d / 2 + 1.2]); }
  boardedWindow(S, [x - w / 2 + 2.0, 4.3, z + d / 2 + 0.05], { night, glow }); boardedWindow(S, [x + w / 2 - 2.0, 4.3, z + d / 2 + 0.05], { night, glow });
  box(S, [w * 0.9, 0.3, 1.6], [x, 0.15, z + d / 2 + 0.8], std({ map: T.planks(0x9a7a5a) }), { r: 0.03, cast: false, solid: false });
}

// ---------- sets ----------
// fernway: main street. Houses back-left (z -18), cornfield back-right behind a fence (x > 5, z < -7), bus stop at (-12, -2.6) (roof y 5.4 covers x -15.2..-8.8, z -4.8..-0.4),
// lamp posts, balloon tethered at (-1.5, -8.8) (night: glowing). Road along x at z -4..0.5. opts.balloon=false to omit.
export function fernway(S, { night = false, dawn = false, sunPos = [18, 11, 6], balloon = true, busstop = true } = {}) {
  const sun = sky(S, { night, dawn, sunPos });
  box(S, [200, 0.3, 160], [0, -0.15, -40], tmx(TX.meadow(night ? 0x2f5a34 : 0x7a9a3c), 30, 24, { roughness: 0.95 }), { r: 0, cast: false, name: 'ground' });
  box(S, [200, 0.32, 5], [0, -0.13, -1.8], tmx(TX.dune(night ? 0x5a4a3a : 0xc8a878), 40, 1), { r: 0, cast: false, solid: false, name: 'road' });
  const cols = ['#d8c8a8', '#a8c0c8', '#e0b8a0', '#c8d0a0'];
  [[-38, 0x4a5a7a], [-26, 0x6a3a32], [-14, 0x3a5a3a], [-2.5, 0x7a4a2a]].forEach(([x, rf], i) => house(S, [x, -18], { col: cols[i], roof: rf, night, w: 10, h: 7 + (i % 2) * 1.2 }));
  const corn = cornRows(S, { x: [5.5, 50], z: [-44, -8], night, dx: 1.6, step: 2.0 });
  const post = std({ map: T.planks(0x7a5a3a) });
  for (let x = 4.5; x < 50; x += 3) box(S, [0.25, 2.0, 0.25], [x, 1.0, -7], post, { r: 0.04, name: 'fence' });
  box(S, [46, 0.2, 0.12], [27, 1.5, -7], post, { r: 0, solid: false }); box(S, [46, 0.2, 0.12], [27, 0.8, -7], post, { r: 0, solid: false });
  if (busstop) busStop(S, [-12, -2.6]);
  for (const x of [-20, -4, 18]) lampPost(S, [x, -5.6], night);
  // town clutter: mailbox, barrels, crates, a wagon wheel, a tractor tire swing post
  box(S, [0.5, 0.6, 0.9], [-6.8, 3.2, -5.2], std({ color: 0x3a5a9a }), { r: 0.2, name: 'mailbox' }); box(S, [0.12, 3.0, 0.12], [-6.8, 1.5, -5.2], post, { r: 0.03, name: 'mailbox post' });
  for (const [x, z] of [[-12.5, -8.2], [-11.4, -8.9]]) { const b = mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.4, 14), std({ map: T.planks(0x6a4428) })); b.position.set(x, 0.7, z); S.add(b); }
  box(S, [1.4, 1.2, 1.4], [-16.5, 0.6, -8.5], std({ map: T.planks(0xb08a5a) }), { r: 0.05, name: 'crate' }); box(S, [1.1, 0.9, 1.1], [-16.4, 1.65, -8.4], std({ map: T.planks(0xa07a4a) }), { r: 0.05, name: 'crate2', rot: [0, 0.4, 0] });
  // hay bales near the fence
  for (const [x, z] of [[26, -5.0], [29, -5.4]]) { const h = mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 16), std({ color: 0xd8b860, roughness: 1 })); h.rotation.z = Math.PI / 2; h.position.set(x, 1.1, z); S.add(h); }
  let bal = null, glowBits = [];
  if (balloon) { bal = moonBalloon(S, { glow: night }); bal.position.set(-2.5, 9, -11.5); box(S, [0.3, 0.6, 0.3], [-1.5, 0.3, -8.8], post, { r: 0.04, name: 'stake' }); }
  if (night) {
    glowBits = stringLights(S, [-20, 7.2, -5.6], [-4, 7.2, -5.6], 16).concat(stringLights(S, [-4, 7.2, -5.6], [18, 7.2, -5.6], 18));
    ptl(S, 0xffc890, 10, 18, [-2, 6.5, 6]);   // soft face light from the square
  }
  const pole = bal ? new THREE.Vector3(-1.5, 0.6, -8.8) : null;
  return { sun, corn, balloon: bal, update(t) { corn.sway(t); if (bal) { bal.position.y = 9 + Math.sin(t * 0.7) * 0.25; bal.rotation.y = t * 0.05; bal.userData.rope(pole, bal.position.clone().add(new THREE.Vector3(0, -0.9, 0)), 0.4); }
    glowBits.forEach((b, i) => b.scale.setScalar(0.85 + 0.15 * Math.sin(t * 3 + i))); } };
}
// cornfield: dirt clearing in the middle (x ±7, z -6..10) surrounded by corn; scarecrow posts optional. dawn = sunrise behind the corn.
export function cornfield(S, { night = false, dawn = false, sunPos } = {}) {
  const sun = sky(S, { night, dawn, sunPos: sunPos || (dawn ? [-6, 5, -30] : [16, 11, 4]) });
  box(S, [200, 0.3, 160], [0, -0.15, -40], tmx(TX.dune(night ? 0x4a3a2c : 0xa8865a), 40, 30), { r: 0, cast: false, name: 'ground' });
  const corn = cornRows(S, { x: [-40, 40], z: [-50, 4], night, seed: 5, dx: 1.6, step: 2.0, skip: (x, z) => (Math.abs(x) < 8 && z > -9) || (Math.abs(x) < 4.2 && z > -30) });
  if (dawn) sunDisc(S, [-14, 4, -120], 0xffe0a0, 7);
  if (night) ptl(S, 0x9ab0ff, 8, 30, [0, 9, 8]);
  return { sun, corn, update(t, k = 0) { corn.sway(t, k); } };
}
// park: wide open meadow at noon — no shade anywhere. Flowers, a bench far left, corn and houses far away.
export function park(S, { sunPos = [6, 22, 8] } = {}) {
  const sun = sky(S, { sunPos, area: 40, intensity: 3.8 });
  box(S, [260, 0.3, 220], [0, -0.15, -40], tmx(TX.meadow(0x6aa03c), 36, 30, { roughness: 0.95 }), { r: 0, cast: false, name: 'ground' });
  const corn = cornRows(S, { x: [-80, 80], z: [-62, -42], seed: 3, dx: 2.2, step: 2.6 });
  const c2 = cornRows(S, { x: [-64, -36], z: [-42, 30], seed: 6, dx: 2.4, step: 3 }), c3 = cornRows(S, { x: [36, 64], z: [-42, 30], seed: 8, dx: 2.4, step: 3 });
  [[-20, 0x6a3a32], [-8, 0x3a5a3a], [10, 0x7a4a2a]].forEach(([x, rf], i) => house(S, [x, -100], { roof: rf, col: ['#d8c8a8', '#a8c0c8', '#e0b8a0'][i] }));
  const R = rng(12), fl = [0xffffff, 0xffe060, 0xff90c0, 0xc8a0ff];
  const fg = new THREE.SphereGeometry(0.16, 6, 5), fim = new THREE.InstancedMesh(fg, std({ color: 0xffffff, roughness: 0.6 }), 600), o = new THREE.Object3D();
  for (let i = 0; i < 600; i++) { o.position.set((R() - 0.5) * 60, 0.12, -38 + R() * 60); o.scale.set(1, 0.5, 1); o.updateMatrix(); fim.setMatrixAt(i, o.matrix); fim.setColorAt(i, new THREE.Color(fl[i % 4])); } S.add(fim);
  box(S, [4, 0.3, 1.2], [-24, 1.4, -14], std({ map: T.planks(0x8a5a30) }), { r: 0.04, name: 'bench' });
  for (const sx of [-1, 1]) box(S, [0.2, 1.4, 1.0], [-24 + sx * 1.7, 0.7, -14], std({ color: 0x2a2a2a }), { r: 0.03, name: 'bench leg' });
  box(S, [0.2, 4, 0.2], [26, 2, -20], std({ map: T.planks(0x7a5a3a) }), { r: 0.03, name: 'sign post' }); box(S, [3.4, 1.4, 0.15], [26, 4, -20], std({ map: T2.sign('FERNWAY PARK', '#3a6a3a', '#ffffff') }), { r: 0.03, name: 'sign' });
  const up = (t) => { corn.sway(t); c2.sway(t); c3.sway(t); };
  return { sun, corn, update(t) { up(t); } };
}
// kids' bedroom. Back wall z=-9 with a boarded window (x=-1); Ivy's bed left (x -5), Pip's bed right (x 4.5); door on the right wall (x=9, z=-1).
// day: sunlight leaks through the board slits (patternLight) and the door crack; night: bedside lamp + moon window.
export function bedroomDay(S, { night = false } = {}) {
  room(S, { wallCol: 0x6a7ab0, floorTex: repeatMat(T.planks(0x7a5a3a), 3, 3), zBack: -9, trim: 0xe8e0d0 });
  S.background = new THREE.Color(0x05060c);
  S.add(new THREE.HemisphereLight(night ? 0x6070b0 : 0xb0a890, 0x201a18, night ? 0.6 : 0.55));
  boardedWindow(S, [-1, 5.6, -8.95], { w: 3.4, h: 3.2, night: false });
  const wl = patternLight(S, { pos: [-1, 6.0, -12], target: [1.5, 1.5, 2], col: night ? 0x8aa0ff : 0xfff0c8, intensity: night ? 30 : 220, angle: 0.55, pattern: 'blinds', dist: 30 });
  const lampL = ptl(S, 0xffb070, night ? 14 : 5, 12, [1.8, 3.6, -6.5]);
  // beds
  const bed = std({ map: T.planks(0x5a3a22) });
  const bedAt = (x, col, name) => { box(S, [3.6, 1.2, 6.4], [x, 0.6, -5.4], bed, { name: name + ' frame' }); box(S, [4.0, 3.0, 0.4], [x, 1.5, -8.6], bed, { name: name + ' head' });
    box(S, [3.4, 0.5, 6.2], [x, 1.45, -5.4], std({ color: 0xeef0f8 }), { r: 0.15, name: name + ' mattress' }); box(S, [2.4, 0.45, 1.1], [x, 1.95, -7.7], std({ color: 0xf8f8ff }), { r: 0.2, name: name + ' pillow' });
    return box(S, [3.5, 0.3, 4.4], [x, 1.8, -4.4], std({ color: col, roughness: 0.95 }), { r: 0.12, name: name + ' blanket' }); };
  const blankI = bedAt(-5, 0x8a4ad0, 'ivybed'), blankP = bedAt(4.5, 0x3a9a7a, 'pipbed');
  // nightstand + lamp between the beds
  box(S, [1.4, 1.8, 1.4], [1.8, 0.9, -7.6], std({ map: T.planks(0x9a6a3a) }), { name: 'stand' });
  const shade = mesh(new THREE.CylinderGeometry(0.35, 0.55, 0.6, 16, 1, true), std({ color: 0xffe0a0, emissive: 0xffb060, emissiveIntensity: night ? 1.2 : 0.4, side: THREE.DoubleSide })); shade.position.set(1.8, 2.5, -7.6); S.add(shade);
  // wall clutter: posters (sun drawing!), shelf with toys, rug
  const sunPoster = ctex(256, 320, (c, w, h) => { c.fillStyle = '#f6f0e0'; c.fillRect(0, 0, w, h); c.fillStyle = '#5aa0e8'; c.fillRect(10, 10, w - 20, h * 0.6); c.fillStyle = '#ffd040'; c.beginPath(); c.arc(w / 2, h * 0.3, 40, 0, 7); c.fill();
    c.strokeStyle = '#ffd040'; c.lineWidth = 8; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * 52, h * 0.3 + Math.sin(a) * 52); c.lineTo(w / 2 + Math.cos(a) * 74, h * 0.3 + Math.sin(a) * 74); c.stroke(); }
    c.fillStyle = '#5ac040'; c.fillRect(10, h * 0.5, w - 20, h * 0.12); c.fillStyle = '#e8584a'; c.font = '700 34px Inter'; c.textAlign = 'center'; c.fillText('PIP', w / 2, h * 0.85); });
  box(S, [2.2, 2.8, 0.06], [5.0, 5.8, -8.94], std({ map: sunPoster }), { r: 0, cast: false, solid: false });
  box(S, [2.0, 2.6, 0.06], [-6.2, 5.8, -8.94], std({ map: T2.sign('MOON FAIR', '#1a2a5a', '#ffe8a0') }), { r: 0, cast: false, solid: false });
  box(S, [3.6, 0.2, 1.0], [-6.5, 3.6, -8.4], std({ map: T.planks(0x9a6a3a) }), { r: 0.03, cast: false, name: 'shelf' });
  for (const [x, c] of [[-7.6, 0xe8584a], [-6.8, 0x3a8ae8], [-5.9, 0xf2c420]]) box(S, [0.55, 0.7, 0.5], [x, 4.05, -8.4], std({ color: c }), { r: 0.15, cast: false, name: 'toy' });
  const rug = mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.04, 32), std({ color: 0xc85a4a, roughness: 1 }), false); rug.position.set(0, 0.02, -1); rug.scale.z = 0.7; S.add(rug);
  // door in the right wall, hinge at z=+0.6, opens inward toward -x; bright sunlight floods through when open
  const doorG = new THREE.Group(); doorG.position.set(8.75, 0, 0.6); S.add(doorG);
  const dm = mesh(new THREE.BoxGeometry(0.2, 6.4, 3.0), std({ map: T.planks(0x6a4a30) })); dm.position.set(0, 3.2, -1.5); doorG.add(dm);
  box(S, [0.1, 6.4, 3.0], [8.98, 3.2, -0.9], glowM(night ? 0x1a2040 : 0xfff6dc), { r: 0, cast: false, solid: false });   // doorway (bright outside)
  const doorSun = new THREE.SpotLight(0xfff0c8, 0, 40, 0.5, 0.4, 1.2); doorSun.position.set(12, 4.5, -0.9); doorSun.target.position.set(0, 0, -1); doorSun.castShadow = true; S.add(doorSun, doorSun.target);
  const door = { open(k) { doorG.rotation.y = -k * 70 * D; doorSun.intensity = night ? 0 : 340 * k; } }; door.open(0);
  return { window: wl, lamp: lampL, door, blankets: [blankI, blankP], update(t) { wl.intensity = (night ? 30 : 220) * (1 + Math.sin(t * 0.7) * 0.03); } };
}
// classroom at night: dark-blue windows with the moon, warm hanging lamps; teacher at the board (z≈-6.5).
export function nightClass(S) {
  room(S, { wallCol: 0x9aa880, floorTex: repeatMat(T.tiles(), 6, 5), zBack: -9 });
  S.userData.look = 'night'; S.background = new THREE.Color(0x05060c);
  S.add(new THREE.HemisphereLight(0x8090c0, 0x302820, 0.6));
  const key = new THREE.PointLight(0xffc888, 45, 0, 1.6); key.position.set(1, 6.4, 1); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); S.add(key);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.8), std({ map: T.chalkboard([['GOOD MORNING!', 64, 150], ['9:00 PM', 80, 330]]) })); board.position.set(1, 5, -8.7); S.add(board);
  box(S, [9.5, 4.3, 0.2], [1, 5, -8.85], std({ color: 0x8a5a33 }), { r: 0.05, cast: false });
  box(S, [0.1, 3.5, 3.5], [-8.75, 5, -4], std({ color: 0x1a2a5a, emissive: 0x16224e, emissiveIntensity: 1.0 }), { r: 0, cast: false });
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), glowM(0xfff4d0)); m.position.set(-8.7, 5.8, -3.4); S.add(m);
  box(S, [0.2, 3.9, 0.2], [-8.7, 5, -4], std({ color: 0xffffff }), { r: 0, cast: false });
  const clock = ctex(128, 128, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 6; c.stroke(); c.lineWidth = 7; c.beginPath(); c.moveTo(64, 64); c.lineTo(20, 64); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 14); c.stroke(); });
  const ck = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), std({ map: clock })); ck.position.set(6.8, 7.4, -8.85); S.add(ck);
  for (const x of [-4, 5]) { const sh = mesh(new THREE.ConeGeometry(0.8, 0.6, 16, 1, true), std({ color: 0x2a2a2a, side: THREE.DoubleSide })); sh.position.set(x, 8.2, -3); S.add(sh);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glowM(0xffe0a0)); b.position.set(x, 7.9, -3); S.add(b); ptl(S, 0xffc070, 8, 12, [x, 7.4, -3]); }
  for (const [x, c] of [[-6, 0xe85a4f], [7.4, 0x4f8ee8]]) box(S, [1.8, 2.4, 0.06], [x, 5.5, -8.95], std({ color: c }), { r: 0, cast: false });
  const wd = std({ map: T.planks(0xb07a48) }), mt = std({ color: 0x555a60, metalness: 0.4, roughness: 0.5 });
  for (const x of [-5, 0, 5]) { box(S, [3.4, 0.2, 2.2], [x, 2.4, 2.6], wd, { name: 'desk' }); box(S, [0.25, 2.3, 0.25], [x, 1.15, 2.6], mt, { name: 'desk leg' }); const l = ptl(S, 0xffc070, 3, 4, [x + 1.0, 2.9, 2.4]);
    const ln = mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 10), glowM(0xffd890)); ln.position.set(x + 1.0, 2.75, 2.4); S.add(ln); }
  return { key, update(t) {} };
}
