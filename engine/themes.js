// Themed worlds for "wild" episodes (and any episode whose premise lives somewhere unusual).
// Every world: big floor + backdrop + sky + fog + lighting, a clear play area around the origin (x ±7, z -4..8,
// characters face +Z, camera at +Z), and returns { update(t) } for ambient motion (snow, bubbles, fireflies...).
// Call env.update(t) inside the shot's update. Also: monster(S, opts) - cute blocky creatures.
//   forest({night})  spooky()  space()  underwater()  candy()  castle({night})  cityNight()  snow()  desert()  lab()
import * as THREE from 'three';
import { T, std, box, repeatMat } from './sets.js';
import { T2 } from './sets2.js';
import { noise } from './avatar.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function ctex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
const M = (o) => std(o);
const glow = (col) => new THREE.MeshBasicMaterial({ color: col });
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const skyTex = (stops) => ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const floorTex = (base, speck, amt = 1.5) => ctex(512, 512, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); noise(x, w, h, amt, 0.12);
  if (speck) { x.fillStyle = speck; for (let i = 0; i < 400; i++) x.fillRect(Math.random() * w, Math.random() * h, 3, 3); } });

// lighting rig: key sun with shadows + hemisphere + rim, and sky/fog
function rig(S, { sky, fog, hemi = [0xbcd4ff, 0x404040, 0.9], sun = [0xffffff, 3.0, [-8, 12, 10]], rim = [0xffc890, 1.2], look = null, area = 22 }) {
  S.background = skyTex(sky); if (fog) S.fog = new THREE.Fog(...fog);
  S.add(new THREE.HemisphereLight(...hemi));
  const r = new THREE.DirectionalLight(rim[0], rim[1]); r.position.set(6, 7, -12); S.add(r);
  const k = new THREE.DirectionalLight(sun[0], sun[1]); k.position.set(...sun[2]); k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
  k.shadow.bias = -0.0005; Object.assign(k.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 90 }); S.add(k, k.target);
  if (look) S.userData.look = look; return k;
}
const ground = (S, mat, size = 160) => box(S, [size, 0.3, size], [0, -0.15, -size / 2 + 30], mat, { r: 0, cast: false, name: 'ground' });
// floating particles (snow, bubbles, fireflies, embers, stars): returns update(t)
function particles(S, n, { col = 0xffffff, size = 0.12, box: [x0, x1, y0, y1, z0, z1] = [-16, 16, 0, 14, -20, 10], fall = 0, rise = 0, wobble = 0.3, emissive = true, seed = 3 } = {}) {
  const R = rng(seed), g = new THREE.SphereGeometry(size, 6, 4), m = emissive ? glow(col) : M({ color: col, transparent: true, opacity: 0.6, roughness: 0.1 });
  const im = new THREE.InstancedMesh(g, m, n); const P = [...Array(n)].map(() => [x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), z0 + R() * (z1 - z0), R() * 6.3]);
  const o = new THREE.Object3D(); S.add(im);
  return (t) => { P.forEach(([x, y, z, ph], i) => { const h = y1 - y0; let yy = y - fall * t + rise * t; yy = y0 + (((yy - y0) % h) + h) % h;
    o.position.set(x + Math.sin(t * 0.8 + ph) * wobble, yy, z + Math.cos(t * 0.6 + ph) * wobble); o.scale.setScalar(emissive ? 0.6 + 0.4 * Math.sin(t * 3 + ph) : 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.instanceMatrix.needsUpdate = true; };
}
function tree(S, [x, z], { h = 7, trunk = 0x6a4428, leaf = 0x3f8a3a, kind = 'round', s = 1 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); S.add(g);
  const tr = mesh(new THREE.CylinderGeometry(0.35, 0.5, h, 8), M({ color: trunk })); tr.position.y = h / 2; g.add(tr);
  const lm = M({ color: leaf, roughness: 0.8 });
  if (kind === 'pine') for (let i = 0; i < 4; i++) { const c = mesh(new THREE.ConeGeometry(2.6 - i * 0.5, 2.6, 9), lm); c.position.y = h * 0.45 + i * 1.5; g.add(c); }
  else if (kind === 'dead') for (let i = 0; i < 4; i++) { const b = mesh(new THREE.CylinderGeometry(0.08, 0.18, 2.6, 6), M({ color: trunk })); b.position.set(Math.cos(i * 1.7) * 0.6, h * (0.55 + i * 0.1), Math.sin(i * 1.7) * 0.6); b.rotation.set(Math.sin(i * 1.7) * 0.9, 0, -Math.cos(i * 1.7) * 0.9); g.add(b); }
  else for (const [dx, dy, dz, r] of [[0, h, 0, 2.2], [1.3, h - 0.6, 0.4, 1.5], [-1.2, h - 0.5, -0.3, 1.6], [0.2, h + 1.2, 0, 1.4]]) { const b = mesh(new THREE.IcosahedronGeometry(r, 1), lm); b.position.set(dx, dy, dz); g.add(b); }
  return g;
}
// ring of things around the play area (keeps the origin clear)
const around = (n, rMin, rMax, seed, f, { front = false } = {}) => { const R = rng(seed); for (let i = 0; i < n; i++) {
  const a = (front ? -Math.PI : -Math.PI * 0.85) + R() * Math.PI * (front ? 2 : 1.7), r = rMin + R() * (rMax - rMin);
  const x = Math.sin(a) * r, z = -Math.cos(a) * r - 2; if (z > 6 || (z > -5 && Math.abs(x) < 8.5)) continue; f(x, z, R, i); } };   // keep play area + camera corridor clear

// ---------------- worlds ----------------
export function forest(S, { night = false } = {}) {
  rig(S, night ? { sky: [[0, '#0a1030'], [1, '#2a3a6a']], fog: [0x1a2448, 14, 60], hemi: [0x5a70c0, 0x101018, 0.7], sun: [0x9ab0ff, 1.4, [-8, 14, 8]], rim: [0x80a0ff, 1.0], look: 'night' }
    : { sky: [[0, '#6ab0e8'], [1, '#d8f0c8']], fog: [0xbfe0b8, 22, 80], hemi: [0xd0f0ff, 0x405030, 0.9], sun: [0xfff0c8, 3.0, [-8, 14, 10]] });
  ground(S, repeatMat(T2.grass(), 20, 20));
  around(26, 11, 34, 4, (x, z, R) => tree(S, [x, z], { h: 6 + R() * 4, leaf: night ? 0x2a5a3a : [0x3f8a3a, 0x4f9a3c, 0x2f7a3a][Math.floor(R() * 3)], s: 0.9 + R() * 0.5 }));
  around(12, 7, 14, 9, (x, z, R) => { const s = 0.5 + R() * 0.6; const st = mesh(new THREE.CylinderGeometry(0.18 * s, 0.22 * s, 0.7 * s, 8), M({ color: 0xf2ead8 })); st.position.set(x, 0.35 * s, z); S.add(st);
    const cap = mesh(new THREE.SphereGeometry(0.6 * s, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M({ color: R() < 0.5 ? 0xd83a3a : 0xc87a3a })); cap.position.set(x, 0.7 * s, z); S.add(cap); });
  if (night) { const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), glow(0xfff4d0)); moon.position.set(-14, 22, -60); S.add(moon);
    const key = new THREE.PointLight(0xffd8a0, 18, 16, 1.6); key.position.set(0, 6, 5); S.add(key); }
  const up = night ? particles(S, 60, { col: 0xd8ff70, size: 0.09, box: [-12, 12, 0.5, 6, -12, 6], wobble: 0.8 }) : particles(S, 30, { col: 0xfff8d0, size: 0.05, box: [-10, 10, 1, 8, -10, 6], wobble: 0.6 });
  return { update: up };
}
export function spooky(S) {   // haunted hill: kid-friendly spooky (purple sky, big moon, dead trees, graves, crooked house)
  rig(S, { sky: [[0, '#1a0a30'], [0.7, '#5a2a6a'], [1, '#c86a5a']], fog: [0x3a2050, 16, 70], hemi: [0x8a70d0, 0x201018, 0.8], sun: [0xb0a0ff, 1.6, [-10, 12, 8]], rim: [0xff9a60, 1.4], look: 'night' });
  ground(S, M({ map: floorTex('#3a3a2a', '#2a2a1a').clone(), color: 0x5a5a48 }));
  const moon = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), glow(0xffe8b0)); moon.position.set(10, 26, -70); S.add(moon);
  around(10, 12, 30, 7, (x, z, R) => tree(S, [x, z], { h: 6 + R() * 3, trunk: 0x2a1a20, kind: 'dead' }));
  const stone = M({ color: 0x7a7a80 });
  around(12, 7, 16, 11, (x, z, R) => { box(S, [1.2, 1.6 + R() * 0.6, 0.35], [x, 0.8, z], stone, { r: 0.4, rot: [0, 0, (R() - 0.5) * 0.3], name: 'grave' }); });
  const hs = M({ color: 0x2a2030 }); box(S, [10, 9, 8], [-6, 4.5, -38], hs, { r: 0, cast: false, rot: [0, 0, 0.04], solid: false }); box(S, [11, 0.6, 9], [-6, 9.2, -38], M({ color: 0x1a1020 }), { r: 0, rot: [0, 0, -0.1], solid: false });
  box(S, [3, 7, 3], [-2, 11, -38], hs, { r: 0, rot: [0, 0, 0.1], solid: false });
  for (const [x, y] of [[-8.5, 5], [-4, 5], [-6, 7.2], [-2, 12]]) box(S, [1.4, 1.6, 0.1], [x, y, -33.9], glow(0xffc860), { r: 0, cast: false, solid: false });
  const key = new THREE.PointLight(0xffb070, 22, 18, 1.6); key.position.set(1, 6, 6); S.add(key);
  const pumpkins = []; around(5, 5, 9, 13, (x, z) => { const p = mesh(new THREE.SphereGeometry(0.6, 16, 10), M({ color: 0xf07a1a })); p.scale.y = 0.8; p.position.set(x, 0.48, z); S.add(p);
    const l = new THREE.PointLight(0xff8a30, 3, 4, 2); l.position.set(x, 0.9, z + 0.5); S.add(l); });
  return { update: particles(S, 40, { col: 0xc0a0ff, size: 0.07, box: [-14, 14, 0.5, 8, -16, 6], wobble: 1.0 }) };
}
export function space(S) {    // moon surface: craters, starfield, ringed planet, distant earth
  rig(S, { sky: [[0, '#000006'], [1, '#0a0a24']], fog: null, hemi: [0x8090c0, 0x202024, 0.6], sun: [0xffffff, 3.4, [-12, 9, 6]], rim: [0x6a8aff, 1.6], look: 'night' });
  ground(S, M({ map: (() => { const t = floorTex('#8a8a90', '#6a6a70', 2.5); t.repeat.set(16, 16); return t; })(), roughness: 1 }));
  const R = rng(5), cm = M({ color: 0x75757c, roughness: 1 });
  around(16, 7, 40, 21, (x, z, Rr) => { const s = 1 + Rr() * 2.5; const c = mesh(new THREE.TorusGeometry(s, s * 0.22, 6, 20), cm); c.rotation.x = Math.PI / 2; c.position.set(x, 0, z); c.scale.z = 0.6; S.add(c); });
  const sg = new THREE.BufferGeometry(), sp = []; for (let i = 0; i < 1500; i++) { const a = R() * Math.PI * 2, b = R() * Math.PI * 0.48, r = 250; sp.push(Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false })));
  const pl = new THREE.Group(); pl.position.set(18, 30, -110); S.add(pl);
  pl.add(new THREE.Mesh(new THREE.SphereGeometry(14, 32, 20), M({ map: ctex(256, 128, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = ['#e8a86a', '#d88a5a', '#f2c890', '#c8784a'][i % 4]; x.fillRect(0, i * 8, w, 8); } }), emissive: 0x3a2010 })));
  const ring = new THREE.Mesh(new THREE.RingGeometry(18, 26, 64), new THREE.MeshBasicMaterial({ color: 0xe8d0a8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })); ring.rotation.x = -1.2; ring.rotation.y = 0.3; pl.add(ring);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(4, 24, 16), M({ color: 0x3a7ad8, emissive: 0x10305a })); earth.position.set(-26, 22, -90); S.add(earth);
  const flag = new THREE.Group(); flag.position.set(-6, 0, -6); S.add(flag); flag.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), M({ color: 0xdddddd })));
  flag.children[0].position.y = 2; const fl = mesh(new THREE.PlaneGeometry(1.8, 1.1), M({ color: 0xe84a4a, side: THREE.DoubleSide })); fl.position.set(0.9, 3.4, 0); flag.add(fl);
  return { update: (t) => { pl.rotation.y = t * 0.02; earth.rotation.y = t * 0.1; } };
}
export function underwater(S) {   // sea floor: sand, kelp, coral, light shafts, bubbles
  rig(S, { sky: [[0, '#0a6aa8'], [1, '#04304a']], fog: [0x0a5a88, 8, 48], hemi: [0x6ad0ff, 0x0a2a3a, 1.0], sun: [0xb8f0ff, 2.2, [-4, 16, 6]], rim: [0x40c0ff, 1.0] });
  ground(S, repeatMat(T2.sand(), 16, 16));
  const kelp = []; around(18, 6, 26, 3, (x, z, R) => { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const h = 4 + R() * 6, m = M({ color: R() < 0.5 ? 0x3a8a3a : 0x5a9a2a });
    for (let i = 0; i < 6; i++) { const seg = mesh(new THREE.BoxGeometry(0.35, h / 6, 0.12), m); seg.position.y = h / 12 + i * h / 6; g.add(seg); } kelp.push(g); });
  const cols = [0xff6a8a, 0xffa040, 0xb06ad8, 0xff4a5a];
  around(14, 6, 14, 8, (x, z, R) => { const m = M({ color: cols[Math.floor(R() * 4)], roughness: 0.6 }); for (let i = 0; i < 4; i++) { const b = mesh(new THREE.CylinderGeometry(0.12, 0.2, 1 + R(), 6), m); b.position.set(x + (R() - 0.5), 0.5, z + (R() - 0.5)); b.rotation.set((R() - 0.5) * 0.8, 0, (R() - 0.5) * 0.8); S.add(b); }
    const ball = mesh(new THREE.IcosahedronGeometry(0.5, 1), m); ball.position.set(x + 0.7, 0.4, z); S.add(ball); });
  const shaft = new THREE.MeshBasicMaterial({ color: 0xbff0ff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 40), shaft); p.position.set(-12 + i * 5, 14, -14 + (i % 2) * 4); p.rotation.z = 0.35; S.add(p); }
  const bub = particles(S, 50, { col: 0xd8f8ff, size: 0.12, rise: 1.4, box: [-12, 12, 0, 14, -14, 6], emissive: false });
  return { update: (t) => { bub(t); kelp.forEach((g, i) => g.children.forEach((c, k) => { c.rotation.z = Math.sin(t * 1.2 + i + k * 0.5) * 0.12 * k; c.position.x = Math.sin(t * 1.2 + i) * 0.04 * k * k; })); } };
}
export function candy(S) {    // candy land: pink ground, lollipop trees, gumdrops, candy canes, cotton-candy clouds
  rig(S, { sky: [[0, '#ff9ad8'], [1, '#ffe8f6']], fog: [0xffd8f0, 26, 90], hemi: [0xffe0f8, 0x8a4a7a, 1.0], sun: [0xfff0f8, 3.0, [-8, 14, 10]], rim: [0xffc0e0, 1.2] });
  ground(S, M({ map: (() => { const t = ctex(256, 256, (x, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#ffb8e0' : '#ffe0f2'; x.fillRect(i * 32, j * 32, 32, 32); } }); t.repeat.set(30, 30); return t; })() }));
  const cols = [0xff4a8a, 0x4ad8c8, 0xffd84a, 0xa86aff, 0xff8a3a];
  around(14, 9, 28, 6, (x, z, R) => { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const h = 4 + R() * 3; const stick = mesh(new THREE.CylinderGeometry(0.15, 0.15, h, 8), M({ color: 0xf8f8f8 })); stick.position.y = h / 2; g.add(stick);
    const pop = mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.4, 32), M({ map: ctex(256, 256, (c, w, hh) => { for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#' + new THREE.Color(cols[Math.floor(R() * 5)]).getHexString(); c.beginPath(); c.arc(128, 128, 128 - k * 21, 0, 7); c.fill(); } }) }));
    pop.rotation.x = Math.PI / 2; pop.position.y = h + 1.2; g.add(pop); });
  around(16, 6, 13, 9, (x, z, R) => { const d = mesh(new THREE.SphereGeometry(0.7, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M({ color: cols[Math.floor(R() * 5)], roughness: 0.25, transparent: true, opacity: 0.92 })); d.position.set(x, 0, z); d.scale.y = 1.3; S.add(d); });
  const cl = M({ color: 0xffd0f0, roughness: 1 }); for (let i = 0; i < 6; i++) { const c = new THREE.Group(); c.position.set(-30 + i * 12, 16 + (i % 3) * 3, -50); S.add(c); for (let k = 0; k < 4; k++) { const b = mesh(new THREE.SphereGeometry(2.4, 14, 10), cl, false); b.position.set(k * 2.2 - 3.3, Math.sin(k) * 0.6, 0); c.add(b); } }
  return { update: particles(S, 40, { col: 0xffffff, size: 0.08, box: [-12, 12, 1, 10, -12, 6], wobble: 0.5 }) };
}
export function castle(S, { night = false } = {}) {   // stone courtyard in front of a castle with towers and banners
  rig(S, night ? { sky: [[0, '#0a1030'], [1, '#3a3a6a']], fog: [0x2a2a4a, 25, 90], hemi: [0x6a7ac0, 0x201818, 0.7], sun: [0xa0b0ff, 1.4, [-8, 14, 8]], rim: [0xffb070, 1.0], look: 'night' }
    : { sky: [[0, '#4f86d8'], [1, '#ffe0b8']], fog: [0xf0d8b8, 30, 110], hemi: [0xd0e0ff, 0x504030, 0.9], sun: [0xffe8c0, 3.2, [-8, 14, 10]] });
  ground(S, repeatMat(T.concrete(0xa8a090), 20, 20));
  const st = std({ map: repeatMat(T.brick(0x8a8478), 6, 3).map });
  box(S, [60, 12, 3], [0, 6, -22], st, { r: 0, cast: false, solid: false });
  for (let x = -29; x <= 29; x += 2.4) box(S, [1.4, 1.4, 3], [x, 12.7, -22], st, { r: 0, cast: false, solid: false });
  for (const x of [-16, 16, 0]) { const h = x ? 20 : 26, rr = x ? 4 : 5; const tw = mesh(new THREE.CylinderGeometry(rr, rr, h, 20), st.clone(), false); tw.position.set(x, h / 2, -24); S.add(tw);
    const roof = mesh(new THREE.ConeGeometry(rr + 0.8, 7, 20), M({ color: 0x3a4aa8 }), false); roof.position.set(x, h + 3.5, -24); S.add(roof);
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.2), night ? glow(0xffc860) : M({ color: 0x1a1a2a })); win.position.set(x, h - 5, -24 + rr); S.add(win); }
  const gate = box(S, [7, 9, 0.6], [0, 4.5, -20.4], M({ map: T.planks(0x5a3a22) }), { r: 0.1, cast: false, solid: false });
  const flags = []; for (const x of [-8, 8]) { box(S, [0.2, 8, 0.2], [x, 4, -6], M({ color: 0x4a4a4a, metalness: 0.5 }), { r: 0.05, name: 'banner pole' });
    const f = mesh(new THREE.PlaneGeometry(2, 3, 8, 1), M({ color: x < 0 ? 0xc0302a : 0x2a5ac0, side: THREE.DoubleSide })); f.position.set(x + 1.05, 6.4, -6); S.add(f); flags.push(f); }
  if (night) for (const x of [-4.5, 4.5]) { const l = new THREE.PointLight(0xff9a40, 14, 12, 1.6); l.position.set(x, 6, -19.5); S.add(l); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), glow(0xffb050)); fl.position.copy(l.position); S.add(fl); }
  return { update: (t) => flags.forEach((f, i) => { const p = f.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k); p.setZ(k, Math.sin(t * 4 + x * 2 + i) * 0.15 * (x + 1)); } p.needsUpdate = true; }) };
}
export function cityNight(S) {    // neon street at night: lit windows, glowing signs, wet asphalt
  rig(S, { sky: [[0, '#05051a'], [1, '#2a1a4a']], fog: [0x1a1030, 20, 80], hemi: [0x6a5ac0, 0x101018, 0.6], sun: [0x8a9aff, 1.0, [-6, 14, 8]], rim: [0xff4ad8, 1.6], look: 'night' });
  ground(S, M({ color: 0x1a1a22, roughness: 0.25, metalness: 0.4 }));
  box(S, [80, 0.32, 8], [0, -0.13, -4], M({ color: 0x4a4a52, roughness: 0.6 }), { r: 0, cast: false, solid: false });
  const R = rng(4), neon = [0xff3ad8, 0x3ae8ff, 0xffe83a, 0x6aff6a, 0xff6a3a]; let x = -40;
  while (x < 40) { const w = 7 + R() * 5, h = 14 + R() * 18;
    const wt = ctex(256, 512, (c, cw, ch) => { c.fillStyle = '#000000'; c.fillRect(0, 0, cw, ch); for (let yy = 10; yy < ch; yy += 34) for (let xx = 10; xx < cw; xx += 40) { c.fillStyle = Math.random() < 0.4 ? '#ffd890' : '#000000'; c.fillRect(xx, yy, 24, 20); } });
    wt.repeat.set(w / 8, h / 16); box(S, [w - 0.4, h, 8], [x + w / 2, h / 2, -14], M({ color: [0x2a2a40, 0x3a2a3a, 0x22303a][Math.floor(R() * 3)], emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 1.1 }), { r: 0, cast: false, solid: false });
    const nc = neon[Math.floor(R() * 5)]; box(S, [w * 0.6, 1.2, 0.2], [x + w / 2, 5 + R() * 6, -9.9], glow(nc), { r: 0.05, cast: false, solid: false });
    const nl = new THREE.PointLight(nc, 10, 14, 1.8); nl.position.set(x + w / 2, 5, -7); S.add(nl); x += w; }
  for (const lx of [-9, 9]) { box(S, [0.3, 8, 0.3], [lx, 4, -1.5], M({ color: 0x2a2a30, metalness: 0.6 }), { r: 0.05, name: 'lamp post' }); const l = new THREE.PointLight(0xffd8a0, 30, 16, 1.6); l.position.set(lx, 7.6, -1); S.add(l);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), glow(0xfff0c0)); b.position.set(lx, 7.9, -1.5); S.add(b); }
  const key = new THREE.PointLight(0xffe0c0, 16, 16, 1.6); key.position.set(0, 6, 7); S.add(key);
  return { update: particles(S, 30, { col: 0xff9ae8, size: 0.05, box: [-14, 14, 1, 10, -10, 6], wobble: 0.4 }) };
}
export function snow(S) {    // snowy hill: pines, snowmen, falling snow, mountains
  rig(S, { sky: [[0, '#6a9ad0'], [1, '#d8e6f4']], fog: [0xc8d8e8, 24, 95], hemi: [0xd8e4ff, 0x6a7890, 0.75], sun: [0xfff0e0, 1.9, [-8, 14, 10]] });
  ground(S, M({ color: 0xd8e2ee, roughness: 0.95 }));
  around(22, 10, 34, 5, (x, z, R) => { const g = tree(S, [x, z], { h: 3 + R() * 2, kind: 'pine', leaf: 0x2a5a3a, s: 1 + R() * 0.6 }); g.children.slice(1).forEach(c => { const sc = mesh(new THREE.ConeGeometry(c.geometry.parameters.radius * 0.7, 1.0, 9), M({ color: 0xffffff })); sc.position.copy(c.position); sc.position.y += 0.9; g.add(sc); }); });
  for (const [x, z] of [[-6, -5], [7, -7]]) { const w = M({ color: 0xffffff }); [[0.9, 0.9], [0.65, 2.25], [0.45, 3.2]].forEach(([r, y]) => { const b = mesh(new THREE.SphereGeometry(r, 16, 12), w); b.position.set(x, y, z); S.add(b); });
    const n = mesh(new THREE.ConeGeometry(0.08, 0.5, 8), M({ color: 0xff8a2a })); n.rotation.x = Math.PI / 2; n.position.set(x, 3.2, z + 0.65); S.add(n); }
  const mt = M({ color: 0xc8d0e0, roughness: 1 }); [[-40, 30], [-10, 40], [25, 34], [50, 28]].forEach(([x, h]) => { const m = mesh(new THREE.ConeGeometry(h * 0.8, h, 7), mt, false); m.position.set(x, h / 2 - 2, -80); S.add(m);
    const cap = mesh(new THREE.ConeGeometry(h * 0.28, h * 0.35, 7), M({ color: 0xffffff }), false); cap.position.set(x, h - 2 - h * 0.17, -80); S.add(cap); });
  return { update: particles(S, 260, { col: 0xffffff, size: 0.07, fall: 1.2, box: [-16, 16, 0, 14, -16, 8], wobble: 0.5, emissive: false }) };
}
export function desert(S) {    // dunes, mesas, cacti, heat-haze sky
  rig(S, { sky: [[0, '#5aa0e0'], [1, '#ffd8a0']], fog: [0xf8d8a8, 30, 110], hemi: [0xfff0d0, 0x8a6030, 1.0], sun: [0xfff0c0, 3.6, [-10, 16, 8]] });
  ground(S, repeatMat(T2.sand(), 18, 18));
  const R = rng(8), sm = M({ color: 0xe8c080 }); for (let i = 0; i < 9; i++) { const d = mesh(new THREE.SphereGeometry(8 + R() * 6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), sm, false); d.scale.y = 0.25; d.position.set(-50 + i * 12, -0.5, -30 - R() * 20); S.add(d); }
  const mm = M({ color: 0xc8703a }); [[-30, 14], [20, 18], [45, 12]].forEach(([x, h]) => { box(S, [18, h, 12], [x, h / 2, -70], mm, { r: 0.5, cast: false, solid: false }); });
  const cm = M({ color: 0x4f8a3a }); around(10, 8, 24, 3, (x, z, Rr) => { const h = 2.5 + Rr() * 2.5; const b = mesh(new THREE.CapsuleGeometry(0.4, h, 6, 12), cm); b.position.set(x, h / 2 + 0.4, z); S.add(b);
    const a = mesh(new THREE.CapsuleGeometry(0.25, 1.0, 4, 10), cm); a.position.set(x + 0.7, h * 0.6 + 0.5, z); S.add(a); });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), glow(0xfff4c0)); sun.position.set(-30, 40, -120); S.add(sun);
  return { update: particles(S, 25, { col: 0xe8c890, size: 0.06, box: [-14, 14, 0.2, 3, -10, 6], wobble: 2, emissive: false }) };
}
export function lab(S) {    // mad-science lab interior: glowing tanks, consoles, pipes (back wall z=-9, walls x=±10, h 10)
  S.background = new THREE.Color(0x0a0f14);
  box(S, [20, 0.3, 18], [0, -0.15, 0], M({ map: (() => { const t = ctex(256, 256, (x, w, h) => { x.fillStyle = '#3a4048'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2e34'; x.lineWidth = 4; for (let i = 0; i <= w; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }); t.repeat.set(5, 5); return t; })(), metalness: 0.3, roughness: 0.5 }), { r: 0, cast: false, name: 'floor' });
  const wm = M({ color: 0x2a3440, metalness: 0.4, roughness: 0.6 });
  box(S, [20, 10, 0.4], [0, 5, -9.2], wm, { r: 0, cast: false, name: 'back wall' }); box(S, [0.4, 10, 18], [-10.2, 5, 0], wm, { r: 0, cast: false, name: 'wall' }); box(S, [0.4, 10, 18], [10.2, 5, 0], wm, { r: 0, cast: false, name: 'wall' });
  S.add(new THREE.HemisphereLight(0x8ad0ff, 0x10141a, 0.9));
  const key = new THREE.PointLight(0xe8f4ff, 40, 0, 1.6); key.position.set(0, 9, 3); key.castShadow = true; S.add(key);
  const tanks = []; for (const [x, c] of [[-7, 0x3aff8a], [-3.5, 0x3ac8ff], [3.5, 0xff4ad8], [7, 0x3aff8a]]) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 5, 24, 1, true), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    g.position.set(x, 3.3, -7.6); S.add(g); box(S, [2.6, 0.8, 2.6], [x, 0.4, -7.6], M({ color: 0x5a6068, metalness: 0.7 }), { r: 0.1, name: 'tank base' }); box(S, [2.6, 0.6, 2.6], [x, 6.1, -7.6], M({ color: 0x5a6068, metalness: 0.7 }), { r: 0.1, name: 'tank top' });
    const l = new THREE.PointLight(c, 8, 8, 2); l.position.set(x, 3, -5.8); S.add(l); tanks.push(g); }
  for (const z of [-4, 1]) { box(S, [2, 2.4, 3], [-8.8, 1.2, z], M({ color: 0x4a525c, metalness: 0.5 }), { r: 0.08, name: 'console' }); box(S, [0.1, 1.2, 2.2], [-7.78, 2.6, z], glow(0x3ae8ff), { r: 0, cast: false, solid: false }); }
  for (const y of [8.4, 9.0]) box(S, [20, 0.35, 0.35], [0, y, -8.6], M({ color: 0x8a6a3a, metalness: 0.8, roughness: 0.3 }), { r: 0.15, cast: false, solid: false });
  return { update: (t) => tanks.forEach((g, i) => { g.material.emissiveIntensity = 0.5 + 0.25 * Math.sin(t * 3 + i * 2); }) };
}
export const WORLDS = { forest, spooky, space, underwater, candy, castle, cityNight, snow, desert, lab };

// ---------------- creatures ----------------
// monster(S, { name, col, shape: 'blob'|'box'|'tall', eyes: 1-3, horns, teeth, arms, tentacles, size, spots })
// Cute-blocky, kid-friendly. Returns { root, body, eyes[], arms[], look(target), animate(t, mood) } - mood 'idle'|'bounce'|'chase'|'scared'|'wave'.
// Parts are tagged for the collision checker under `name`. Height ≈ 4 * size (feet at y=0, faces +Z).
export function monster(S, { name = 'monster', col = 0x6ad86a, belly = null, shape = 'blob', eyes = 2, horns = true, teeth = true, arms = true, tentacles = false, size = 1, spots = false, seed = 1 } = {}) {
  const R = rng(seed); const root = new THREE.Group(); root.scale.setScalar(size); S.add(root);
  const body = new THREE.Group(); root.add(body); const bm = M({ color: col, roughness: 0.55 }), dark = M({ color: new THREE.Color(col).multiplyScalar(0.55), roughness: 0.6 });
  const geo = shape === 'box' ? new THREE.BoxGeometry(2.8, 2.6, 2.2, 4, 4, 4) : shape === 'tall' ? new THREE.CapsuleGeometry(1.0, 2.0, 8, 20) : new THREE.SphereGeometry(1.5, 28, 20);
  const b = mesh(geo, bm); b.position.y = shape === 'tall' ? 2.5 : 1.9; if (shape === 'blob') b.scale.set(1, 0.9, 0.85); body.add(b);
  if (belly !== null) { const bl = mesh(new THREE.SphereGeometry(shape === 'tall' ? 0.8 : 1.05, 20, 14), M({ color: belly })); bl.scale.set(1, 1.1, 0.4); bl.position.set(0, b.position.y - 0.35, shape === 'box' ? 1.0 : 1.05); body.add(bl); }
  if (spots) for (let i = 0; i < 7; i++) { const a = R() * Math.PI * 1.6 - 2.4, y = b.position.y + (R() - 0.3) * 1.6; const sp = mesh(new THREE.SphereGeometry(0.18 + R() * 0.12, 10, 8), dark); sp.scale.z = 0.3; sp.position.set(Math.sin(a) * 1.35, y, Math.cos(a) * 1.15); sp.lookAt(0, y, 0); body.add(sp); }
  const top = shape === 'tall' ? 4.0 : 3.2, ey = top - (shape === 'tall' ? 0.9 : 0.95), ez = shape === 'box' ? 1.12 : shape === 'tall' ? 0.92 : 1.18;
  const E = []; const xs = eyes === 1 ? [0] : eyes === 2 ? [-0.5, 0.5] : [-0.75, 0, 0.75];
  xs.forEach((x, i) => { const s = eyes === 1 ? 0.62 : eyes === 3 && i === 1 ? 0.42 : 0.38; const g = new THREE.Group(); g.position.set(x, ey + (eyes === 3 && i === 1 ? 0.3 : 0), ez - 0.15); body.add(g);
    const wh = mesh(new THREE.SphereGeometry(s, 18, 14), M({ color: 0xffffff, roughness: 0.2 })); g.add(wh); const pu = mesh(new THREE.SphereGeometry(s * 0.5, 14, 10), M({ color: 0x111111, roughness: 0.2 })); pu.position.z = s * 0.62; g.add(pu);
    const sh = new THREE.Mesh(new THREE.SphereGeometry(s * 0.14, 8, 6), glow(0xffffff)); sh.position.set(s * 0.15, s * 0.18, s * 0.9); g.add(sh);
    const lid = mesh(new THREE.SphereGeometry(s * 1.05, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), bm); lid.scale.y = 0.05; g.add(lid); g.userData = { pu, lid, s }; E.push(g); });
  const mouthY = ey - (eyes === 1 ? 0.95 : 0.75); const mouth = mesh(new THREE.SphereGeometry(0.5, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M({ color: 0x3a0a14 }));
  mouth.scale.set(1.3, 0.8, 0.5); mouth.rotation.x = Math.PI; mouth.position.set(0, mouthY, ez - 0.2); body.add(mouth);
  if (teeth) for (const x of [-0.32, 0.32]) { const t = mesh(new THREE.ConeGeometry(0.11, 0.28, 6), M({ color: 0xfffff0 })); t.rotation.x = Math.PI; t.position.set(x, mouthY - 0.1, ez + 0.03); body.add(t); }
  if (horns) for (const s of [-1, 1]) { const h = mesh(new THREE.ConeGeometry(0.22, 0.9, 10), M({ color: 0xf2e8c8 })); h.position.set(s * 0.75, top + 0.2, 0); h.rotation.z = -s * 0.35; body.add(h); }
  const A = [];
  if (arms) for (const s of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(s * (shape === 'box' ? 1.45 : 1.3), b.position.y + 0.1, 0); body.add(sh); const a = mesh(new THREE.CapsuleGeometry(0.28, 1.0, 4, 10), bm); a.position.y = -0.75; sh.add(a); A.push(sh); }
  const L = [];
  if (tentacles) for (let i = 0; i < 5; i++) { const g = new THREE.Group(); const a = (i / 5) * Math.PI * 2; g.position.set(Math.sin(a) * 0.9, 0.9, Math.cos(a) * 0.7); root.add(g); for (let k = 0; k < 4; k++) { const seg = mesh(new THREE.SphereGeometry(0.3 - k * 0.05, 10, 8), bm); seg.position.set(0, -k * 0.28, k * 0.12); g.add(seg); } L.push(g); }
  else for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 0.65, shape === 'tall' ? 1.1 : 0.75, 0); root.add(g); const l = mesh(new THREE.CapsuleGeometry(0.32, 0.5, 4, 10), dark); l.position.y = -0.45; g.add(l); L.push(g); }
  if (!tentacles && shape !== 'tall') body.position.y = 0.1;
  root.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = 'monster'; } });
  const target = new THREE.Vector3(0, 4, 20), tmp = new THREE.Vector3();
  const M2 = { root, body, eyes: E, arms: A, legs: L, name,
    look(v) { target.copy(v); },
    blink(amount) { E.forEach(g => { g.userData.lid.scale.y = 0.05 + amount * 0.95; g.userData.lid.rotation.x = amount > 0.5 ? 0 : 0; }); },
    animate(t, mood = 'idle') {
      const k = mood === 'chase' ? 2.2 : mood === 'bounce' ? 1.6 : 1;
      body.position.y = (shape === 'tall' || tentacles ? 0 : 0.1) + (mood === 'bounce' || mood === 'chase' ? Math.abs(Math.sin(t * 6 * k / 1.6)) * 0.45 : Math.sin(t * 2) * 0.05);
      body.rotation.z = Math.sin(t * 3 * k) * (mood === 'scared' ? 0.12 : 0.05); body.scale.set(1, mood === 'scared' ? 0.92 + Math.sin(t * 30) * 0.02 : 1 + Math.sin(t * 2) * 0.02, 1);
      A.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (mood === 'wave' && i ? 2.4 + Math.sin(t * 10) * 0.4 : mood === 'chase' ? 1.4 : mood === 'scared' ? 2.6 : 0.3 + Math.sin(t * 2 + i) * 0.1); a.rotation.x = mood === 'chase' ? -1.2 : 0; });
      L.forEach((l, i) => { l.rotation.x = tentacles ? Math.sin(t * 4 + i) * 0.4 : Math.sin(t * 8 * k / 1.6 + i * Math.PI) * (mood === 'chase' || mood === 'bounce' ? 0.6 : 0.05); });
      root.updateMatrixWorld(true);
      E.forEach(g => { g.worldToLocal(tmp.copy(target)); tmp.normalize(); g.userData.pu.position.set(tmp.x * g.userData.s * 0.45, tmp.y * g.userData.s * 0.45, g.userData.s * 0.62); });
      const bl = (t % 3.7) < 0.12 ? 1 : 0; if (mood !== 'scared') M2.blink(bl);
    } };
  return M2;
}
