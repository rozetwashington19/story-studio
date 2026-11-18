// Episode 007 kit (See-Through): fading people, thought streams, a family home (kitchen, nursery, wide night stairs),
// a car interior, and small home props. All sets: characters face +Z, camera at +Z. Sets return { update(t) } — call it every frame.
//   fade(A, k, opts)        make an avatar see-through. k = 0..1 (1 = solid) or per limb { body, head, armR, armL, legR, legL }.
//                           opts: { glow: 0x9ad8ff (ghost glow colour), glowK: 1 (glow strength when faint), keep: ['outfit boots'] (parts that stay solid) }
//   thoughts(S, col, n)     -> (fromVec3, toVec3, k, t, arc) warm glowing motes flowing from a thinker to the person thought about
//   familyKitchen(S, { morning, night, flash })   kitchen + dining table (top y 2.75, centre (0,-2.8)), counter on the right (top y 3.0, x 4..9, z -8..-6.5),
//                           window over the sink, fridge, shelves, plants. Camera stays at z < 5.
//   nursery(S, { night })   pale room, crib at (2.5,-5.5) (rail top y 3.3), star mobile (env.mobile), rocking chair, toys. update(t) spins the mobile.
//   nightStairs(S, { lamp }) wide staircase (x ±5) climbing toward -z: step i top y 0.7(i+1), spans z -(i+1)..-i; moon window on the left wall,
//                           warm lamp bottom-right (env.lamp), framed family photos, banisters. sitOn(A, 0.7*(i+1)) at z = -i-0.55; allowContact 'step*'.
//   carInside(S, { sunset }) front seats (seat top 1.6) at x = ±2.3, dashboard/wheel in front (z > 2.6), scenery streams past. update(t).
//   dimLights(S, f)         scale every light already in S (turn a day set into night).
// Props: mug, cerealBowl, plate, pizzaTray, crib, dinoPancake, strawberryBowl, swaddle(A) (blanket around a baby avatar), bigSneakerPrint.
import * as THREE from 'three';
import { T, std, box, repeatMat, room, interiorLight } from './sets.js';
import { kitchen, cookieJar } from './kit.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// ---------- fading ----------
const LIMBS = ['armR', 'armL', 'legR', 'legL'];
export function fade(A, k, { glow = 0x9ad8ff, glowK = 1, keep = ['outfit boots'] } = {}) {
  if (!A._fade) {
    const list = [];
    A.root.traverse(m => {
      if (!m.isMesh) return;
      if (m === A.blob) return;
      let limb = 'body'; for (let p = m; p && p !== A.root; p = p.parent) { const l = LIMBS.find(n => A[n] === p); if (l) { limb = l; break; } if (p === A.headMesh) { limb = 'head'; break; } }
      const kept = keep.some(s => (m.userData.part || '').startsWith(s));
      const one = (mat) => { const c = mat.clone(); if (mat === A.faceMat) A.faceMat = c; c.userData.base = { op: mat.opacity, tr: mat.transparent, em: c.emissive ? c.emissive.clone() : null, ei: c.emissiveIntensity }; return c; };
      if (!kept) m.material = Array.isArray(m.material) ? m.material.map(one) : one(m.material);
      list.push({ m, limb, kept, cast: m.castShadow });
    });
    A._fade = list;
  }
  const kv = typeof k === 'number' ? { body: k, head: k, armR: k, armL: k, legR: k, legL: k } : { body: 1, head: 1, armR: 1, armL: 1, legR: 1, legL: 1, ...k };
  const gc = new THREE.Color(glow);
  for (const { m, limb, kept, cast } of A._fade) {
    if (kept) continue;
    const a = Math.max(0, Math.min(1, kv[limb]));
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mt of mats) {
      const b = mt.userData.base; const solid = a >= 0.995;
      mt.transparent = solid ? b.tr : true; mt.opacity = solid ? b.op : b.op * (0.05 + 0.95 * Math.pow(a, 1.15));
      mt.depthWrite = true;
      if (b.em) { const g = (1 - a) * glowK; mt.emissive.copy(b.em).lerp(gc, Math.min(1, g * 0.7)); mt.emissiveIntensity = b.ei + g * 0.45; }
      mt.needsUpdate = true;
    }
    m.castShadow = cast && a > 0.55; m.visible = a > 0.003;
  }
  if (A.blob) { A.blob.material.opacity = Math.max(0, Math.min(1, kv.legR)); A.blob.material.transparent = true; }
}

// ---------- thought stream ----------
export function thoughts(S, col = 0xffd27a, n = 60) {
  const im = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.075, 0), new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), n);
  im.frustumCulled = false; S.add(im); const o = new THREE.Object3D(); const pl = new THREE.PointLight(col, 0, 8, 1.6); S.add(pl);
  const A = new THREE.Vector3(), B = new THREE.Vector3();
  return (a, b, k, t, arc = 1.0) => { A.set(...(a.isVector3 ? a.toArray() : a)); B.set(...(b.isVector3 ? b.toArray() : b));
    for (let i = 0; i < n; i++) { const u = ((t * 0.55 + i / n * 1.618) % 1);
      const p = A.clone().lerp(B, u); p.y += Math.sin(u * Math.PI) * arc + Math.sin(t * 4 + i) * 0.1; p.x += Math.sin(t * 3 + i * 2.1) * 0.12; p.z += Math.cos(t * 3.3 + i) * 0.1;
      o.position.copy(p); o.rotation.set(t * 2 + i, t * 3 + i, 0); o.scale.setScalar(k > 0 ? (0.45 + 0.9 * Math.sin(u * Math.PI)) * k : 0.0001); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    im.instanceMatrix.needsUpdate = true; pl.position.copy(A).lerp(B, 0.5); pl.position.y += arc * 0.7; pl.intensity = 7 * k; };
}

export function dimLights(S, f) { S.traverse(o => { if (o.isLight) o.intensity *= f; }); }

// ---------- props ----------
export function mug(S, col = 0xe8584a) { const g = new THREE.Group();
  const c = mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.6, 20), std({ color: col, roughness: 0.4 })); c.position.y = 0.3; g.add(c);
  const h = mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 16), std({ color: col, roughness: 0.4 })); h.position.set(0.3, 0.32, 0); g.add(h);
  const cof = mesh(new THREE.CircleGeometry(0.25, 20), std({ color: 0x3a1e0e, roughness: 0.2 })); cof.rotation.x = -Math.PI / 2; cof.position.y = 0.55; g.add(cof);
  S.add(g); return g; }
export function cerealBowl(S, [x, y, z], col = 0x3a8ad8) { const g = new THREE.Group(); g.position.set(x, y, z);
  const b = mesh(new THREE.CylinderGeometry(0.7, 0.42, 0.5, 28, 1, true), std({ color: col, roughness: 0.35, side: THREE.DoubleSide })); b.position.y = 0.25; g.add(b);
  const milk = mesh(new THREE.CircleGeometry(0.64, 28), std({ color: 0xfaf6ee, roughness: 0.3 })); milk.rotation.x = -Math.PI / 2; milk.position.y = 0.4; g.add(milk);
  const cols = [0xe8a030, 0xd84a3a, 0x4ab84a, 0xf2d040, 0x8a5ad8];
  for (let i = 0; i < 16; i++) { const r = mesh(new THREE.TorusGeometry(0.07, 0.035, 6, 10), std({ color: cols[i % 5] })); const a = i * 2.4, d = 0.15 + (i % 4) * 0.12;
    r.position.set(Math.cos(a) * d, 0.43, Math.sin(a) * d); r.rotation.x = -Math.PI / 2 + Math.sin(i) * 0.4; g.add(r); }
  const sp = mesh(new THREE.BoxGeometry(0.08, 0.04, 1.1), std({ color: 0xc8ccd0, metalness: 0.8, roughness: 0.3 })); sp.position.set(0.3, 0.55, 0.3); sp.rotation.set(0.5, 0.6, 0); g.add(sp);
  S.add(g); return g; }
export function plate(S, [x, y, z], food = null) { const g = new THREE.Group(); g.position.set(x, y, z);
  g.add(mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.08, 32), std({ color: 0xfafafa, roughness: 0.25 })));
  if (food) { const f = mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.18, 20), std({ color: food })); f.position.y = 0.12; g.add(f); }
  S.add(g); return g; }
export function pizzaTray(S, [x, y, z], n = 6) { const g = new THREE.Group(); g.position.set(x, y, z);
  g.add(mesh(new THREE.BoxGeometry(3.2, 0.08, 2.2), std({ color: 0xb8bcc2, metalness: 0.7, roughness: 0.35 })));
  const pz = ctex(256, 256, (c, w, h) => { c.fillStyle = '#e8a040'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2cc58'; c.beginPath(); c.arc(128, 128, 116, 0, 7); c.fill();
    c.fillStyle = '#c8302a'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(128 + Math.cos(i * 2.4) * (30 + i * 5), 128 + Math.sin(i * 2.4) * (30 + i * 5), 13, 0, 7); c.fill(); } });
  const sl = (i) => { const s = mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 16, 1, false, 0, Math.PI * 2 / 6 * 0.92), std({ map: pz, roughness: 0.6 })); return s; };
  const slices = []; for (let i = 0; i < n; i++) { const s = sl(i); s.rotation.y = i * Math.PI / 3; s.position.set(i < 3 ? -0.75 : 0.75, 0.1, 0); g.add(s); slices.push(s); }
  g.userData.slices = slices; S.add(g); return g; }
export function slice(S) { const pz = ctex(128, 128, (c, w, h) => { c.fillStyle = '#f2cc58'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8302a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(30 + i * 20, 40 + (i % 2) * 40, 10, 0, 7); c.fill(); } });
  const s = mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 12, 1, false, -Math.PI / 6, Math.PI / 3), [std({ color: 0xd89a40 }), std({ map: pz }), std({ color: 0xd89a40 })]); S.add(s); return s; }
export function crib(S, [x, z], { col = 0xf4efe6 } = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); const m = std({ color: col, roughness: 0.6 });
  const b = (sz, p) => { const o = mesh(new THREE.BoxGeometry(...sz), m); o.position.set(...p); g.add(o); return o; };
  b([4.2, 0.25, 2.4], [0, 1.4, 0]); const mat = mesh(new THREE.BoxGeometry(4.0, 0.4, 2.2), std({ color: 0xbfe0f2 })); mat.position.y = 1.7; g.add(mat);
  for (const sx of [-2.05, 2.05]) for (const sz of [-1.15, 1.15]) b([0.22, 3.4, 0.22], [sx, 1.7, sz]);
  for (const sz of [-1.15, 1.15]) { b([4.2, 0.18, 0.18], [0, 3.3, sz]); for (let i = -6; i <= 6; i++) b([0.08, 1.5, 0.08], [i * 0.3, 2.55, sz]); }
  for (const sx of [-2.05, 2.05]) { b([0.18, 0.18, 2.4], [sx, 3.3, 0]); for (let i = -3; i <= 3; i++) b([0.08, 1.5, 0.08], [sx, 2.55, i * 0.3]); }
  const bl = mesh(new THREE.BoxGeometry(2.0, 0.25, 1.6), std({ color: 0xf2b8c8, roughness: 1 })); bl.position.set(0.6, 2.0, 0); g.add(bl);
  S.add(g); box(S, [4.3, 3.4, 2.5], [x, 1.7, z], new THREE.MeshBasicMaterial({ visible: false }), { r: 0, cast: false, name: 'crib' }); return g; }
export function dinoPancake(S, [x, y, z], s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); const m = std({ color: 0xd8984a, roughness: 0.7 });
  const disc = (r, px, pz) => { const o = mesh(new THREE.CylinderGeometry(r, r, 0.14, 20), m); o.position.set(px, 0.07, pz); g.add(o); };
  disc(0.55, 0, 0); disc(0.28, 0.62, 0.32); disc(0.18, -0.6, -0.15); disc(0.14, -0.82, -0.25); disc(0.14, -0.2, 0.5); disc(0.14, 0.25, 0.5);
  for (let i = 0; i < 4; i++) { const sp = mesh(new THREE.ConeGeometry(0.12, 0.28, 4), m); sp.position.set(-0.35 + i * 0.25, 0.1, -0.5); sp.rotation.x = -1.2; g.add(sp); }
  S.add(g); return g; }
export function strawberry(S, s = 1) { const g = new THREE.Group(); g.scale.setScalar(s);
  const b = mesh(new THREE.SphereGeometry(0.22, 14, 10), std({ color: 0xd8202a, roughness: 0.35 })); b.scale.set(1, 1.25, 1); g.add(b);
  const tip = mesh(new THREE.ConeGeometry(0.2, 0.25, 12), std({ color: 0xd8202a, roughness: 0.35 })); tip.rotation.x = Math.PI; tip.position.y = -0.25; g.add(tip);
  for (let i = 0; i < 5; i++) { const l = mesh(new THREE.ConeGeometry(0.06, 0.22, 4), std({ color: 0x3a9a3a })); l.position.set(Math.cos(i * 1.26) * 0.1, 0.3, Math.sin(i * 1.26) * 0.1); l.rotation.set(Math.sin(i * 1.26) * 1.2, 0, -Math.cos(i * 1.26) * 1.2); g.add(l); }
  S.add(g); return g; }
export function strawberryBowl(S, [x, y, z], n = 1) { const g = new THREE.Group(); g.position.set(x, y, z);
  const b = mesh(new THREE.CylinderGeometry(0.75, 0.45, 0.45, 24, 1, true), std({ color: 0xf2f0ea, roughness: 0.3, side: THREE.DoubleSide })); b.position.y = 0.22; g.add(b);
  const bt = mesh(new THREE.CircleGeometry(0.45, 20), std({ color: 0xf2f0ea })); bt.rotation.x = -Math.PI / 2; bt.position.y = 0.01; g.add(bt);
  for (let i = 0; i < n; i++) { const s = strawberry(S); g.add(s); s.position.set(i * 0.3, 0.3, 0); }
  S.add(g); return g; }
// soft blanket wrapped around a (small) baby avatar's body and legs
export function swaddle(A, col = 0x9ad0f2) { const m = std({ color: col, roughness: 1 });
  const b = mesh(new THREE.CapsuleGeometry(1.25, 1.9, 6, 16), m); b.position.set(0, 1.9, 0.05); b.scale.set(1, 1, 0.82); A.root.add(b);
  const hood = mesh(new THREE.TorusGeometry(0.72, 0.25, 8, 20, Math.PI * 1.3), m); hood.position.set(0, 4.7, -0.15); hood.rotation.z = -0.65 * Math.PI / 2 + 0.25; A.root.add(hood);
  [b, hood].forEach(o => { o.userData.avatar = A.name; o.userData.part = 'swaddle'; }); return b; }

// ---------- sets ----------
export function familyKitchen(S, { morning = true, night = false, flash = false } = {}) {
  kitchen(S);
  const wd = std({ map: T.planks(0xd8c8a8) }), top = std({ color: 0xece6da, roughness: 0.4 });
  box(S, [5.4, 3.0, 2.0], [-6.2, 1.5, -7.9], wd, { r: 0.04, name: 'counter' }); box(S, [5.6, 0.15, 2.2], [-6.2, 3.07, -7.9], top, { r: 0.03, name: 'countertop' });
  for (let i = 0; i < 2; i++) box(S, [2.4, 2.4, 0.06], [-7.45 + i * 2.5, 1.45, -6.88], std({ color: 0xc8b898 }), { r: 0.03, cast: false, solid: false });
  box(S, [5.4, 1.8, 1.2], [-6.2, 7.6, -8.3], wd, { r: 0.04, name: 'cabinet' });
  const sky = night ? 0x1a2a5a : morning ? 0xbfe4ff : 0xffb070;
  box(S, [3.0, 2.2, 0.1], [1.5, 5.6, -8.86], std({ color: sky, emissive: sky, emissiveIntensity: night ? 0.6 : 1.2 }), { r: 0, cast: false, solid: false });
  box(S, [3.4, 2.6, 0.06], [1.5, 5.6, -8.92], std({ color: 0xf6f2ea }), { r: 0, cast: false, solid: false });
  box(S, [0.1, 2.2, 0.12], [1.5, 5.6, -8.8], std({ color: 0xf6f2ea }), { r: 0, cast: false, solid: false });
  if (!night) { const sun = new THREE.DirectionalLight(morning ? 0xfff0d0 : 0xffb070, 1.5); sun.position.set(2, 9, -16); sun.target.position.set(0, 0, 0); S.add(sun, sun.target); }
  // plants on the sill + fruit + clutter
  for (const [x, c] of [[0.5, 0x3a9a4a], [2.5, 0x5aaa3a]]) { box(S, [0.5, 0.5, 0.5], [x, 4.6, -8.5], std({ color: 0xc86a3a }), { r: 0.1, solid: false }); box(S, [0.7, 0.7, 0.7], [x, 5.1, -8.5], std({ color: c }), { r: 0.3, solid: false }); }
  cookieJar(S, [-4.6, 3.15, -7.6]);
  const bowl = mesh(new THREE.SphereGeometry(0.6, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std({ color: 0x3a6ab8, side: THREE.DoubleSide })); bowl.position.set(-7.6, 3.75, -7.8); S.add(bowl);
  for (const [dx, c] of [[-0.2, 0xe8c030], [0.2, 0xd83a2a], [0, 0x6ab83a]]) { const f = mesh(new THREE.SphereGeometry(0.22, 12, 8), std({ color: c, roughness: 0.4 })); f.position.set(-7.6 + dx, 3.5 + (dx === 0 ? 0.2 : 0), -7.8); S.add(f); }
  // fridge drawings
  [[5.6, 5.2, 0xffd84a], [6.6, 4.4, 0x8ad8ff], [5.9, 3.6, 0xff9ab8]].forEach(([x, y, c], i) => { const p = mesh(new THREE.PlaneGeometry(0.9, 1.1), std({ map: ctex(64, 80, (g, w, h) => { g.fillStyle = '#' + new THREE.Color(c).getHexString(); g.fillRect(0, 0, w, h); g.strokeStyle = '#3a3a8a'; g.lineWidth = 4; g.beginPath(); g.arc(32, 34, 14, 0, 7); g.moveTo(32, 48); g.lineTo(32, 70); g.stroke(); }) }), false);
    p.position.set(x, y, -6.44); p.rotation.z = (i - 1) * 0.12; S.add(p); });
  if (night) { dimLights(S, 0.35); S.userData.look = 'night'; const l = new THREE.PointLight(0xffc880, 14, 14, 1.7); l.position.set(-2, 6, -3); S.add(l); }
  if (flash) S.userData.look = 'flash';
  return { update() {} };
}

export function nursery(S, { night = false } = {}) {
  room(S, { wallCol: 0xf2e2a8, floorTex: repeatMat(T.planks(0xb88a5a), 3, 3), zBack: -9, trim: 0xffffff });
  interiorLight(S, { col: night ? 0xffc070 : 0xfff0d8, pos: [-1, 7.5, -2], intensity: night ? 18 : 46, hemi: night ? 0.5 : 1.15 });
  const sky = night ? 0x1a2a5a : 0xcfe8ff;
  box(S, [3.2, 3.2, 0.1], [-4.5, 5.4, -8.86], std({ color: sky, emissive: sky, emissiveIntensity: 1.0 }), { r: 0, cast: false, solid: false });
  box(S, [3.6, 3.6, 0.06], [-4.5, 5.4, -8.92], std({ color: 0xffffff }), { r: 0, cast: false, solid: false });
  if (!night) { const sun = new THREE.DirectionalLight(0xfff0d0, 1.3); sun.position.set(-5, 8, -15); sun.target.position.set(0, 0, -2); S.add(sun, sun.target); }
  crib(S, [2.5, -6.8]);
  // mobile
  const mob = new THREE.Group(); mob.position.set(2.5, 6.4, -6.8); S.add(mob);
  const rod = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), std({ color: 0xffffff })); rod.position.y = 1.1; mob.add(rod);
  [0xffd84a, 0x8ad8ff, 0xff9ab8, 0x9af0a8].forEach((c, i) => { const a = i * Math.PI / 2; const s = mesh(new THREE.OctahedronGeometry(0.28), std({ color: c, emissive: c, emissiveIntensity: night ? 0.6 : 0.15 })); s.position.set(Math.cos(a) * 1.1, -0.4 - (i % 2) * 0.3, Math.sin(a) * 1.1); mob.add(s);
    const str = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4), std({ color: 0xffffff }), false); str.position.set(Math.cos(a) * 1.1, 0.0, Math.sin(a) * 1.1); mob.add(str); });
  // rocking chair, rug, toys, bunting, frames
  const wd = std({ map: T.planks(0x8a5a36) });
  box(S, [3.2, 0.3, 2.6], [-5.5, 1.6, -5.2], wd, { r: 0.08, name: 'rocker seat' }); box(S, [3.2, 3.6, 0.3], [-5.5, 3.4, -6.5], wd, { r: 0.08, name: 'rocker back' });
  for (const sx of [-1.5, 1.5]) box(S, [0.2, 0.25, 3.4], [-5.5 + sx, 0.25, -5.2], wd, { r: 0.1, solid: false });
  const rug = mesh(new THREE.CircleGeometry(4, 40), std({ color: 0xa8d8c8, roughness: 1 }), false); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, -2); S.add(rug);
  [[-2, 0xe8584a], [-1.2, 0x3a8ad8], [5.6, 0xf2c420]].forEach(([x, c], i) => box(S, [0.7, 0.7, 0.7], [x, 0.35 + (i === 1 ? 0.7 : 0), -6 + (i === 1 ? 0.1 : 0)], std({ color: c }), { r: 0.08, solid: false }));
  for (let i = 0; i < 9; i++) { const f = mesh(new THREE.ConeGeometry(0.35, 0.7, 3), std({ color: [0xff9ab8, 0xffd84a, 0x8ad8ff][i % 3], side: THREE.DoubleSide }), false); f.rotation.x = Math.PI; f.position.set(-4 + i * 1.1, 7.6 - Math.sin(i / 8 * Math.PI) * 0.6, -8.7); S.add(f); }
  [[6.8, 5.4, 0x8ad8ff], [-0.6, 5.8, 0xffb8c8]].forEach(([x, y, c]) => { box(S, [1.6, 1.8, 0.1], [x, y, -8.85], std({ color: c }), { r: 0, cast: false, solid: false }); box(S, [1.9, 2.1, 0.06], [x, y, -8.9], std({ color: 0xffffff }), { r: 0, cast: false, solid: false }); });
  if (night) { S.userData.look = 'night'; const nl = new THREE.PointLight(0xffb060, 10, 10, 1.7); nl.position.set(-1, 2, -7.5); S.add(nl); }
  return { mobile: mob, update(t) { mob.rotation.y = t * 0.5; } };
}

export function nightStairs(S, { lamp = true, day = false } = {}) {
  room(S, { w: 22, d: 18, h: 11, wallCol: 0xb8a888, floorTex: repeatMat(T.planks(0x6a4428), 3, 3), zBack: -12 });
  S.background = new THREE.Color(0x05060c); if (!day) S.userData.look = 'night';
  S.add(new THREE.HemisphereLight(day ? 0xfff0e0 : 0x6a7ab8, 0x2a2020, day ? 1.0 : 0.95));
  const st = std({ map: T.planks(0x7a4a2a) }), carpet = std({ color: 0x5a3a6a, roughness: 0.95 });
  for (let i = 0; i < 9; i++) { const top = 0.7 * (i + 1); box(S, [10, top, 1.0], [0, top / 2, -i - 0.5], st, { r: 0.02, name: 'step' + i });
    box(S, [6, 0.04, 1.0], [0, top + 0.02, -i - 0.5], carpet, { r: 0, cast: false, solid: false }); }
  box(S, [10, 6.3, 3], [0, 3.15, -10.5], st, { r: 0, name: 'landing' });
  const ban = std({ color: 0xf2eee4 }), rail = std({ color: 0x5a3a22 });
  for (const sx of [-5.3, 5.3]) { for (let i = 0; i < 9; i++) box(S, [0.14, 2.6, 0.14], [sx, 0.7 * (i + 1) + 1.3, -i - 0.5], ban, { r: 0.02, name: 'baluster' });
    const r = box(S, [0.3, 0.25, 12.8], [sx, 0.7 * 5 + 2.25, -4.6], rail, { r: 0.05, rot: [Math.atan2(0.7, 1), 0, 0], name: 'rail', solid: false });
    box(S, [0.5, 3.6, 0.5], [sx, 1.8, 0.4], rail, { r: 0.06, name: 'newel' }); }
  // moon window on the left wall + cold light shafts
  const moonC = 0x9ab8ff;
  box(S, [0.1, 3.4, 2.6], [-10.75, 6.5, -5], std({ color: day ? 0xcfe8ff : 0x2a3a6a, emissive: day ? 0xcfe8ff : 0x3a5aa0, emissiveIntensity: 1.0 }), { r: 0, cast: false, solid: false });
  box(S, [0.06, 3.8, 3.0], [-10.8, 6.5, -5], std({ color: 0xf2eee4 }), { r: 0, cast: false, solid: false });
  const moon = new THREE.SpotLight(day ? 0xfff0d0 : moonC, day ? 140 : 90, 40, 0.55, 0.7, 1.2); moon.position.set(-14, 9, -5); moon.target.position.set(0, 2, -1); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); S.add(moon, moon.target);
  // photos up the wall
  [[-2.5, 6.4, -11.95, 0xe8a04a], [0.2, 7.2, -11.95, 0x6aa0b8], [2.8, 6.6, -11.95, 0xd86a8a]].forEach(([x, y, z, c]) => { box(S, [1.8, 1.4, 0.1], [x, y + 2, z + 0.1], std({ color: c }), { r: 0, cast: false, solid: false }); box(S, [2.1, 1.7, 0.06], [x, y + 2, z + 0.05], std({ color: 0x3a2a1a }), { r: 0, cast: false, solid: false }); });
  for (const [x, z, c] of [[-10.75, 0.5, 0x8ac0a8], [10.75, -2, 0xe8c8a0]]) { box(S, [0.1, 1.5, 1.9], [x * 0.995, 5.2, z], std({ color: c }), { r: 0, cast: false, solid: false }); box(S, [0.06, 1.8, 2.2], [x, 5.2, z], std({ color: 0x3a2a1a }), { r: 0, cast: false, solid: false }); }
  // side table + lamp, bottom right; plant left
  const wd = std({ map: T.planks(0x5a3a22) });
  box(S, [1.8, 2.6, 1.6], [8.2, 1.3, -1.5], wd, { r: 0.05, name: 'side table' });
  const shade = mesh(new THREE.CylinderGeometry(0.5, 0.8, 0.9, 20, 1, true), std({ color: 0xfff0d0, emissive: 0xffb060, emissiveIntensity: lamp ? 1.0 : 0.05, side: THREE.DoubleSide })); shade.position.set(8.2, 4.0, -1.5); S.add(shade);
  box(S, [0.12, 0.9, 0.12], [8.2, 3.05, -1.5], std({ color: 0x2a2a2a }), { r: 0.02, solid: false });
  const lampL = new THREE.PointLight(0xffb060, lamp ? 40 : 0, 22, 1.5); lampL.position.set(7.6, 4.2, -0.8); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); S.add(lampL);
  box(S, [1.0, 1.1, 1.0], [-8.4, 0.55, -1], std({ color: 0xc86a3a }), { r: 0.15, name: 'pot' }); box(S, [1.6, 2.4, 1.6], [-8.4, 2.3, -1], std({ color: 0x3a7a3a }), { r: 0.7, name: 'plant', solid: false });
  const rug = mesh(new THREE.PlaneGeometry(8, 5), std({ color: 0x6a2a3a, roughness: 1 }), false); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, 3.4); S.add(rug);
  return { lamp: lampL, moon, update() {} };
}

export function carInside(S, { sunset = false } = {}) {
  S.background = T.sky(sunset ? '#f08a5a' : '#5a96e0', sunset ? '#ffd8a0' : '#dff0ff');
  S.add(new THREE.HemisphereLight(0xfff0e0, 0x3a3030, 1.1));
  const sun = new THREE.DirectionalLight(sunset ? 0xffb070 : 0xfff0d8, 2.4); sun.position.set(8, 10, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); S.add(sun);
  const key = new THREE.PointLight(0xfff0e0, 34, 16, 1.5); key.position.set(0, 6.5, 6.5); S.add(key);
  const ups = std({ color: 0x4a4a58, roughness: 0.9 }), body = std({ color: 0x2a6ab8, roughness: 0.4, metalness: 0.3 }), dark = std({ color: 0x1a1a20, roughness: 0.6 });
  for (const x of [-2.3, 2.3]) { box(S, [3.0, 1.0, 2.6], [x, 1.1, -0.2], ups, { r: 0.3, name: 'seat' }); box(S, [3.0, 4.0, 0.8], [x, 3.2, -1.8], ups, { r: 0.3, name: 'seatback' }); box(S, [1.6, 1.0, 0.5], [x, 5.6, -2.25], ups, { r: 0.25, name: 'headrest' }); }
  box(S, [9.6, 2.0, 2.4], [0, 2.4, 4.3], dark, { r: 0.3, name: 'dash' });
  box(S, [9.6, 0.6, 1.0], [0, 3.6, 3.8], std({ color: 0x3a3a44 }), { r: 0.2, name: 'dash top' });
  const wheel = mesh(new THREE.TorusGeometry(0.95, 0.12, 10, 28), dark); wheel.position.set(-2.3, 3.7, 2.7); wheel.rotation.x = -0.35; S.add(wheel);
  box(S, [9.8, 0.4, 9], [0, 0.2, 0], dark, { r: 0, cast: false, name: 'floor' });
  box(S, [0.4, 4, 9], [-4.9, 2, 0], body, { r: 0.1, name: 'door L' }); box(S, [0.4, 4, 9], [4.9, 2, 0], body, { r: 0.1, name: 'door R' });
  box(S, [9.8, 0.3, 8], [0, 7.6, -1], std({ color: 0xd8d4cc }), { r: 0.1, cast: false, name: 'roof' });
  for (const x of [-4.8, 4.8]) { box(S, [0.4, 3.6, 0.4], [x, 5.8, 3.3], body, { r: 0.1, name: 'pillar', rot: [-0.4, 0, 0] }); box(S, [0.4, 3.6, 0.5], [x, 5.8, -4.6], body, { r: 0.1, name: 'pillar' }); }
  box(S, [9.6, 0.5, 0.6], [0, 4.0, -5.2], body, { r: 0.1, name: 'rear' });
  // dangling air freshener + a doodle on the dash
  const fr = mesh(new THREE.ConeGeometry(0.25, 0.6, 3), std({ color: 0x5ad86a }), false); fr.position.set(1.2, 6.9, 2.9); fr.scale.setScalar(0.6); S.add(fr);
  // scenery streaming past (behind the car: the road goes toward -z)
  const g = new THREE.Group(); S.add(g); const trunk = std({ color: 0x6a4428 }), leaf = std({ color: sunset ? 0x6a7a3a : 0x3f8a3a });
  const road = mesh(new THREE.PlaneGeometry(14, 400), std({ color: 0x3a3a40 }), false); road.rotation.x = -Math.PI / 2; road.position.set(0, -0.6, -200); S.add(road);
  const grass = mesh(new THREE.PlaneGeometry(400, 400), std({ color: sunset ? 0x7a8a4a : 0x5aa04a }), false); grass.rotation.x = -Math.PI / 2; grass.position.set(0, -0.7, -200); S.add(grass);
  const trees = []; for (let i = 0; i < 16; i++) { const t = new THREE.Group(); const sx = (i % 2 ? 1 : -1) * (12 + (i * 7) % 9);
    const tr = mesh(new THREE.BoxGeometry(1, 6, 1), trunk, false); tr.position.y = 2.4; t.add(tr); const lf = mesh(new THREE.SphereGeometry(3.2, 10, 8), leaf, false); lf.position.y = 6.5; t.add(lf);
    t.position.set(sx, -0.6, -10 - i * 9); t.userData.z0 = -10 - i * 9; g.add(t); trees.push(t); }
  clouds(S, { tint: sunset ? 0xffc8a0 : undefined });
  return { wheel, update(t) { trees.forEach(tr => { tr.position.z = -10 - ((-tr.userData.z0 - 10 + t * 18) % 144); }); } };
}
// warm inner glow on a solid avatar (k 0..1), e.g. someone everybody is thinking about
export function aura(A, k, col = 0xffc860) { if (!A._fade) fade(A, 1); const c = new THREE.Color(col);
  for (const { m, kept } of A._fade) { if (kept) continue; (Array.isArray(m.material) ? m.material : [m.material]).forEach(mt => { const b = mt.userData.base; if (!b || !b.em) return; mt.emissive.copy(b.em).lerp(c, Math.min(1, k)); mt.emissiveIntensity = b.ei + k * 0.55; }); } }
// a hand mirror
export function handMirror(S) { const g = new THREE.Group(); const fr = std({ color: 0xd8a830, metalness: 0.8, roughness: 0.3 });
  const r = mesh(new THREE.TorusGeometry(0.42, 0.07, 8, 24), fr); r.position.y = 0.95; g.add(r);
  const gl = mesh(new THREE.CircleGeometry(0.4, 24), std({ color: 0xcfe8ff, metalness: 1, roughness: 0.05, side: THREE.DoubleSide }), false); gl.position.y = 0.95; g.add(gl);
  const h = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 8), fr); h.position.y = 0.3; g.add(h); S.add(g); return g; }
export function pan(S) { const g = new THREE.Group(); const m = std({ color: 0x2a2a2e, metalness: 0.6, roughness: 0.4 });
  const p = mesh(new THREE.CylinderGeometry(0.9, 0.8, 0.15, 24), m); g.add(p); const h = mesh(new THREE.BoxGeometry(0.16, 0.1, 1.4), m); h.position.set(0, 0.04, 1.4); g.add(h); S.add(g); return g; }
