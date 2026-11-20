// Episode 011 kit (Worry Stones): worry stones + backpacks that grow, an island ferry deck, a lighthouse keeper's attic,
// a lighthouse cliff top (day / sunset / night) and the lighthouse lantern room. All sets: characters face +Z, camera at +Z.
// Sets return env with update(t) — call it every frame.
//
//   worryStone(S, text, { s, col, seed, glow })  smooth grey pebble with a handwritten word on top (Group; .userData.label, .glow(k))
//   stonePile(S, [x,y,z], { n, r, h, labels, seed, s })  heap of worry stones · .set(k) shows the first k·n · .stones
//   bigPack(A, { col, s, anchor, cracker })  a backpack on an avatar's back that can GROW: .grow(s) (1 = school size, 3.2 = fridge),
//       .open(k) flap, .stuffed(k) bulge, .group. Tagged as the avatar's outfit for the collision checker. anchor:true hangs a ship's anchor below it.
//   packProp(S, { col, s })  the same backpack as a free prop (bottom y=0, back face z=0, extends to -z) · .open(k) · .group
//   lighthouse(S, [x,y,z], { s, night, beam, stripes })  red/white tower (18·s tall, gallery at 18·s, lantern above) · .update(t) spins the beam
//   sea(S, { y, size, col, col2, night, speed, dir })  big animated sea plane · update(t)
//   gull(S, s) blocky seagull · .update(t, mode 'fly'|'stand')
//   ferryDeck(S, { time: 'morning'|'sunset', smoke })  ferry deck along x: planks y=0 (x ±24, z -8.6..11), back bulwark+rail z -8.6 (sea beyond),
//       benches against it (seat top 1.6 at z -7.2, x -13..-6 and 6..13), wheelhouse block x -24..-15 (window, wheel inside at (-15.2, ?, -2)),
//       funnel, mast + pennants at x 16, crates/ropes/lifebuoys, island + lighthouse on the horizon. Front rail z 11 for reverse shots. env.key face light.
//   keeperAttic(S, { night })  attic bedroom: A-frame ceiling (kneewalls x ±9, ridge y 10.5), back wall z -8 with a ROUND window (centre (0,5.2), r 1.7)
//       looking at the lighthouse (beam sweeps through the room — env.sweep(t) 0..1), bed on the left (mattress top 1.6, x -7.6..-4.4, z -6..1),
//       desk + lamp right (x 6, z -6), moving boxes, rug, shells, paper boats. Floor free x -3..4, z -4..6. Front wall z 11.
//   lighthouseCliff(S, { time: 'day'|'sunset'|'night', beam })  grassy cliff top: lighthouse at (-11, 0, -18), keeper cottage at (13, 0, -17),
//       gravel path from (0, 0, 10) to the lighthouse door, fence along the cliff edge (z -26), bench seat top 1.6 at (3, ?, -9) (sit z -8.6),
//       lamps, rocks, wildflowers, sea below, sky + clouds (stars + moon at night). env.key.
//   lanternRoom(S, { time: 'night' })  inside the lighthouse lantern: round room r 8 (camera must stay at r < 7.4), giant glowing lens
//       at (0, 0, -3.2) (r 1.7, pedestal top 2.2) that turns (beams sweep outside), floor hatch at (4.4, 0, 4.0) (env.hatch), oil lantern at (-4.4, 0, 3.4),
//       logbook desk, glass all round with night sea + stars. env.lamp (warm key light from the lens), env.lantern (floor practical).
import * as THREE from 'three';
import { std, box, T } from './sets.js';
import { T2 } from './sets2.js';
import { clouds } from './clouds.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
const put = (parent, o, [x = 0, y = 0, z = 0] = [], rot) => { o.position.set(x, y, z); if (rot) o.rotation.set(...rot); parent.add(o); return o; };
const noiseFill = (c, w, h, a = 0.08, n = 3000) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); } };
const cache = {}; const once = (k, f) => cache[k] || (cache[k] = f());

// ---------------- worry stones ----------------
const stoneTex = () => once('stone', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#9a9a9e'; c.fillRect(0, 0, w, h); noiseFill(c, w, h, 0.12, 5000);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 4, 0, 7); c.fill(); } }));
const stoneGeo = (seed) => once('sg' + seed, () => { const g = new THREE.IcosahedronGeometry(0.5, 3); const p = g.attributes.position; const R = rng(seed);
  const a = R() * 6, b = R() * 6; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); const k = 1 + Math.sin(v.x * 5 + a) * 0.05 + Math.sin(v.z * 6 + b) * 0.05; v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g; });
function labelTex(text) { return once('lbl' + text, () => { const t = ctex(512, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#1e1a2a'; c.textAlign = 'center'; c.textBaseline = 'middle';
  let fs = 120; c.font = `italic 800 ${fs}px Inter, sans-serif`; while (c.measureText(text).width > w * 0.9 && fs > 30) { fs -= 6; c.font = `italic 800 ${fs}px Inter, sans-serif`; }
  c.save(); c.translate(w / 2, h / 2); c.rotate(-0.05); c.fillText(text, 0, 4); c.restore(); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; }); }
export function worryStone(S, text = '', { s = 1, col = 0xb8b6bc, seed = 1, glow = 0 } = {}) {
  const g = new THREE.Group(); const m = std({ color: col, map: stoneTex(), roughness: 0.6, emissive: 0x6a8ab8, emissiveIntensity: glow });
  const st = mesh(stoneGeo(seed % 7), m); st.scale.set(1.15, 0.6, 0.9); g.add(st);
  if (text) { const l = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshStandardMaterial({ map: labelTex(text), transparent: true, roughness: 0.8, depthWrite: false }));
    l.rotation.x = -Math.PI / 2; l.position.y = 0.305; g.add(l); g.userData.label = l; }
  g.scale.setScalar(s); g.glow = k => { m.emissiveIntensity = k; }; S.add(g); return g;
}
export function stonePile(S, [x, y, z], { n = 30, r = 1.6, h = 1.0, labels = [], seed = 3, s = 0.8 } = {}) {
  const R = rng(seed); const grp = new THREE.Group(); grp.position.set(x, y, z); S.add(grp); const stones = [];
  for (let i = 0; i < n; i++) { const a = R() * 6.28, rr = Math.sqrt(R()) * r; const st = worryStone(grp, labels[i % Math.max(1, labels.length)] && i < labels.length * 3 ? labels[i % labels.length] : '', { s: s * (0.8 + R() * 0.4), seed: i + seed });
    st.position.set(Math.cos(a) * rr, 0.18 * s + (1 - rr / r) * h * R(), Math.sin(a) * rr * 0.8); st.rotation.set((R() - 0.5) * 0.5, R() * 6.28, (R() - 0.5) * 0.5); stones.push(st); }
  // sort so the top stones come last
  return { group: grp, stones, set(k) { stones.forEach((s2, i) => { s2.visible = i < k * n; }); } };
}

// ---------------- backpacks ----------------
function packBody(col) {
  const g = new THREE.Group(); const m = std({ color: col, roughness: 0.75 }); const dk = std({ color: new THREE.Color(col).multiplyScalar(0.72), roughness: 0.8 });
  const RB = (w, h, d, r) => new THREE.BoxGeometry(w, h, d, 1, 1, 1);
  const main = put(g, mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.5, 20, 1, false, 0, Math.PI), m), [0, 1.0, -0.42], [0, 0, Math.PI / 2]); main.scale.set(1, 1, 0.55); main.rotation.set(0, -Math.PI / 2, Math.PI / 2);
  put(g, mesh(RB(1.5, 1.0, 0.84), m), [0, 0.55, -0.42]);
  put(g, mesh(RB(1.1, 0.62, 0.3), dk), [0, 0.5, -0.95]);           // front pocket
  put(g, mesh(RB(0.9, 0.06, 0.02), std({ color: 0x222222 })), [0, 0.72, -1.11]); // zip
  const flapPivot = put(g, new THREE.Group(), [0, 1.62, -0.05]);
  const flap = put(flapPivot, mesh(RB(1.38, 0.1, 0.92), dk), [0, 0.0, -0.42]);
  put(flapPivot, mesh(RB(0.3, 0.5, 0.06), dk), [0, -0.22, -0.88]);
  put(g, mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 12, Math.PI), dk), [0, 1.72, -0.25]); // top handle
  for (const sx of [-1, 1]) put(g, mesh(RB(0.12, 0.7, 0.5), dk), [sx * 0.8, 0.6, -0.45]);  // side pockets
  g.userData.flap = flapPivot; return g;
}
function anchorMesh() { const g = new THREE.Group(); const m = std({ color: 0x3a3e46, metalness: 0.7, roughness: 0.35 });
  put(g, mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.6, 10), m), [0, -1.3, 0]); put(g, mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 16), m), [0, 0.1, 0]);
  put(g, mesh(new THREE.BoxGeometry(1.4, 0.18, 0.18), m), [0, -0.5, 0]);
  const arc = put(g, mesh(new THREE.TorusGeometry(1.0, 0.14, 8, 20, Math.PI), m), [0, -1.7, 0], [0, 0, Math.PI]);
  for (const sx of [-1, 1]) put(g, mesh(new THREE.ConeGeometry(0.25, 0.55, 4), m), [sx * 1.0, -1.45, 0], [0, 0, -sx * 0.6]);
  return g; }
export function bigPack(A, { col = 0x2a6ae8, s = 1, anchor = false, name } = {}) {
  const g = new THREE.Group(); g.position.set(0, 0.15, -0.5); A.body.add(g);
  const b = packBody(col); g.add(b);
  const strapM = std({ color: new THREE.Color(col).multiplyScalar(0.55), roughness: 0.8 });
  const straps = []; for (const sx of [-1, 1]) { const st = mesh(new THREE.BoxGeometry(0.16, 2.0, 1.06), strapM); st.position.set(sx * 0.55, 1.0, -0.02); A.body.add(st); straps.push(st); }
  let anc = null; if (anchor) { anc = anchorMesh(); anc.position.set(0, -0.2, -0.9); b.add(anc); anc.scale.setScalar(0.9); }
  const tagIt = () => [g, ...straps].forEach(o => o.traverse(m => { if (m.isMesh) { m.userData.avatar = name || A.name; m.userData.part = 'backpack'; } }));
  tagIt();
  const api = { group: g, body: b, anchor: anc, s,
    grow(k) { api.s = k; g.scale.setScalar(k); },
    open(k) { b.userData.flap.rotation.x = -k * 2.2; },
    stuffed(k) { b.scale.set(1 + k * 0.08, 1 + k * 0.05, 1 + k * 0.25); },
    hide(h) { g.visible = !h; straps.forEach(s2 => s2.visible = !h); } };
  api.grow(s); return api;
}
export function packProp(S, { col = 0x2a6ae8, s = 1 } = {}) { const g = new THREE.Group(); const b = packBody(col); g.add(b); g.scale.setScalar(s); S.add(g);
  return { group: g, body: b, open(k) { b.userData.flap.rotation.x = -k * 2.2; } }; }

// ---------------- lighthouse, sea, gulls ----------------
const stripeTex = (a, b) => once('str' + a + b, () => ctex(64, 512, (c, w, h) => { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? b : a; c.fillRect(0, i * h / 4, w, h / 4); } noiseFill(c, w, h, 0.06, 600); }));
export function lighthouse(S, [x, y, z], { s = 1, night = false, beam = night, stripes = true } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  const tw = std({ map: stripes ? stripeTex('#f4f1ea', '#c8322c') : null, color: stripes ? 0xffffff : 0xf4f1ea, roughness: 0.7 });
  put(g, mesh(new THREE.CylinderGeometry(2.2, 3.2, 18, 28), tw), [0, 9, 0]);
  put(g, mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.9, 24), std({ color: 0x8a8580, map: T.concrete(0x8a8580) })), [0, 0.45, 0]);
  const dark = std({ color: 0x22262c, metalness: 0.5, roughness: 0.4 });
  put(g, mesh(new THREE.CylinderGeometry(3.1, 2.6, 0.5, 28), dark), [0, 18.2, 0]);
  put(g, mesh(new THREE.TorusGeometry(3.0, 0.07, 6, 40), dark), [0, 19.4, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283; put(g, mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5), dark), [Math.cos(a) * 3.0, 18.9, Math.sin(a) * 3.0]); }
  const glass = std({ color: night ? 0xfff0b0 : 0xbfd8e8, emissive: night ? 0xffd070 : 0x000000, emissiveIntensity: night ? 1.6 : 0, roughness: 0.1, metalness: 0.2 });
  put(g, mesh(new THREE.CylinderGeometry(1.9, 1.9, 2.6, 16), glass), [0, 19.75, 0]);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; put(g, mesh(new THREE.BoxGeometry(0.14, 2.6, 0.14), dark), [Math.cos(a) * 1.92, 19.75, Math.sin(a) * 1.92]); }
  put(g, mesh(new THREE.ConeGeometry(2.3, 1.6, 16), std({ color: 0x9a2a26, roughness: 0.5 })), [0, 21.85, 0]);
  put(g, mesh(new THREE.SphereGeometry(0.3, 10, 8), dark), [0, 22.8, 0]);
  // door + windows
  put(g, mesh(new THREE.BoxGeometry(1.6, 2.8, 0.3), std({ color: 0x2a4a6a })), [0, 2.3, 3.05]);
  const winM = std({ color: night ? 0xffd890 : 0x2a3a4a, emissive: night ? 0xffb860 : 0x000000, emissiveIntensity: night ? 1.2 : 0 });
  for (const yy of [7, 11.5, 15]) put(g, mesh(new THREE.BoxGeometry(0.7, 1.1, 0.2), winM), [0, yy, 3.2 - (yy / 18) * 1.0 + 0.05], [-0.055, 0, 0]);
  let beams = null, lampLight = null;
  if (beam) {
    beams = new THREE.Group(); beams.position.y = 19.75; g.add(beams);
    const bm = new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    for (const sx of [0, Math.PI]) { const c = new THREE.Mesh(new THREE.ConeGeometry(4.5, 70, 24, 1, true), bm); c.rotation.z = Math.PI / 2; c.position.x = 35; const p = new THREE.Group(); p.rotation.y = sx; p.add(c); beams.add(p); }
    lampLight = new THREE.PointLight(0xffd890, 30, 40, 1.6); lampLight.position.y = 19.75; g.add(lampLight);
  }
  return { group: g, beams, update(t) { if (beams) beams.rotation.y = t * 0.55; } };
}
const seaTex = (night) => once('sea' + night, () => ctex(512, 512, (c, w, h) => { c.fillStyle = night ? '#0e2240' : '#2a7ab0'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { const y = Math.random() * h, x = Math.random() * w, l = 10 + Math.random() * 40; c.strokeStyle = night ? `rgba(140,170,220,${0.08 + Math.random() * 0.15})` : `rgba(220,240,255,${0.12 + Math.random() * 0.3})`; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 3, x + l, y); c.stroke(); } }, [24, 24]));
export function sea(S, { y = -3, size = 900, night = false, speed = 0.01, dir = [1, 0], col } = {}) {
  const t = seaTex(night).clone(); t.needsUpdate = true; t.repeat.set(size / 18, size / 18);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), std({ map: t, color: col ?? 0xffffff, roughness: night ? 0.25 : 0.35, metalness: 0.15 }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = false; S.add(m);
  return (tt) => { t.offset.set(tt * speed * dir[0], tt * speed * dir[1]); m.position.y = y + Math.sin(tt * 0.9) * 0.05; };
}
export function gull(S, s = 1) {
  const g = new THREE.Group(); const w = std({ color: 0xf6f6f2 }), gr = std({ color: 0x9aa0a8 }), y = std({ color: 0xf2b020 });
  put(g, mesh(new THREE.BoxGeometry(0.5, 0.45, 1.3), w), [0, 0, 0]); put(g, mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), w), [0, 0.3, 0.65]); put(g, mesh(new THREE.BoxGeometry(0.12, 0.1, 0.35), y), [0, 0.25, 0.98]);
  put(g, mesh(new THREE.BoxGeometry(0.42, 0.1, 0.4), gr), [0, 0.05, -0.75]);
  for (const sx of [-1, 1]) put(g, mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), std({ color: 0x111111 })), [sx * 0.2, 0.38, 0.8]);
  const wings = [-1, 1].map(sx => { const p = put(g, new THREE.Group(), [sx * 0.25, 0.12, 0]); put(p, mesh(new THREE.BoxGeometry(1.4, 0.06, 0.6), gr), [sx * 0.7, 0, 0]); return p; });
  const legs = [-1, 1].map(sx => put(g, mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), y), [sx * 0.12, -0.45, 0]));
  g.scale.setScalar(s); S.add(g);
  g.update = (t, mode = 'fly') => { const f = mode === 'fly' ? Math.sin(t * 7) * 0.6 : 0.0; wings[0].rotation.z = f; wings[1].rotation.z = -f; legs.forEach(l => l.visible = mode !== 'fly');
    if (mode === 'stand') { wings[0].rotation.z = -1.3; wings[1].rotation.z = 1.3; } };
  return g;
}
const skyTex = (top, mid, bot) => once('sky' + top + mid + bot, () => { const t = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, w, h); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; });
function stars(S, n = 500, r = 300, minY = 0.05) { const R = rng(5); const p = []; for (let i = 0; i < n; i++) { const a = R() * 6.283, e = minY + R() * 1.3; p.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff8e8, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 })); S.add(pts); return pts; }
function moon(S, [x, y, z], r = 6) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6dc, fog: false })); m.position.set(x, y, z); S.add(m);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(r * 2.6, 32), new THREE.MeshBasicMaterial({ color: 0x8aa0d0, transparent: true, opacity: 0.18, fog: false, depthWrite: false })); halo.position.set(x, y, z - 1); halo.lookAt(0, y, 0); S.add(halo); return m; }
function island(S, [x, y, z], s = 1, night = false) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g);
  const rock = std({ color: night ? 0x2a3038 : 0x6a6a60, roughness: 1 }), grass = std({ color: night ? 0x1e3a2a : 0x5a9a4a, roughness: 1 });
  put(g, mesh(new THREE.CylinderGeometry(16, 20, 6, 9), rock, false), [0, 0, 0]); put(g, mesh(new THREE.CylinderGeometry(15.5, 16, 1.2, 9), grass, false), [0, 3.4, 0]);
  put(g, mesh(new THREE.CylinderGeometry(7, 9, 4, 8), grass, false), [-6, 5, -2]);
  for (const [hx, hz, c] of [[6, 4, 0xf2e2c8], [10, 1, 0xa8d0e8], [3, -4, 0xf2c0a8]]) { put(g, mesh(new THREE.BoxGeometry(2.4, 2, 2.4), std({ color: c }), false), [hx, 5, hz]); put(g, mesh(new THREE.ConeGeometry(2.0, 1.4, 4), std({ color: 0x9a3a2a }), false), [hx, 6.7, hz], [0, Math.PI / 4, 0]); }
  const L = lighthouse(g, [-6, 7, -2], { s: 0.55, night, beam: night }); return L;
}

// ---------------- ferry deck ----------------
const deckTex = () => once('deck', () => ctex(512, 512, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = `hsl(28, 30%, ${44 + Math.random() * 10}%)`; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(30,15,5,0.55)'; c.fillRect(0, i * 32, w, 2); for (let k = 0; k < 3; k++) c.fillRect((i * 97 + k * 190) % w, i * 32, 2, 32); }
  for (let i = 0; i < 400; i++) { c.strokeStyle = 'rgba(50,25,10,0.12)'; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); c.bezierCurveTo(w / 3, y + 4, 2 * w / 3, y - 4, w, y); c.stroke(); } noiseFill(c, w, h, 0.07, 3000); }, [6, 4]));
const hullTex = (col) => once('hull' + col, () => ctex(512, 128, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.2)'; for (let x = 0; x < w; x += 64) c.fillRect(x, 0, 2, h); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, 0, w, 6); noiseFill(c, w, h, 0.05, 800); }, [4, 1]));
const signTex = (text, bg, fg) => once('sg' + text, () => ctex(1024, 256, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28); c.fillStyle = fg; c.font = '900 120px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 6); }));
function lifebuoy(S, [x, y, z], ry = 0, s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); S.add(g);
  const tor = new THREE.TorusGeometry(0.75, 0.24, 10, 24); for (let i = 0; i < 4; i++) { const seg = mesh(new THREE.TorusGeometry(0.75, 0.25, 10, 6, Math.PI / 2), std({ color: i % 2 ? 0xffffff : 0xf05a1a, roughness: 0.6 })); seg.rotation.z = i * Math.PI / 2; g.add(seg); } return g; }
function rail(S, x0, x1, z, { y = 1.3, h = 2.0, col = 0xf4f4f0, posts = 2.2 } = {}) { const m = std({ color: col, roughness: 0.4, metalness: 0.3 });
  for (const yy of [y + h * 0.5, y + h]) box(S, [x1 - x0, 0.14, 0.14], [(x0 + x1) / 2, yy, z], m, { r: 0.05, name: 'rail' });
  for (let x = x0; x <= x1 + 0.01; x += posts) box(S, [0.14, h, 0.14], [x, y + h / 2, z], m, { r: 0.04, name: 'rail post' }); }
function crate(S, [x, y, z], s = 1.6, col = 0x9a6a3a, label) { const b = box(S, [s, s, s], [x, y + s / 2, z], std({ map: T.planks(col) }), { r: 0.05, name: 'crate' });
  if (label) { const p = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.8, s * 0.3), std({ map: signTex(label, '#e8d8b0', '#3a2a1a') })); p.position.set(x, y + s / 2, z + s / 2 + 0.01); S.add(p); } return b; }
function rope(S, [x, y, z], r = 0.7) { const m = std({ color: 0xc8a870, roughness: 1 }); for (let i = 0; i < 4; i++) { const t = mesh(new THREE.TorusGeometry(r - i * 0.12, 0.09, 6, 22), m); t.rotation.x = Math.PI / 2; t.position.set(x, y + 0.1 + i * 0.12, z); S.add(t); } }
function bench(S, [x, y, z], w = 6, { seat = 1.6, col = 0x8a5a30, back = true, name = 'bench' } = {}) { const wd = std({ map: T.planks(col) });
  box(S, [w, 0.3, 1.4], [x, seat - 0.15, z], wd, { r: 0.05, name });
  if (back) box(S, [w, 1.3, 0.25], [x, seat + 0.9, z - 0.75], wd, { r: 0.05, name: name + ' back' });
  for (const sx of [-1, 1]) box(S, [0.25, seat - 0.3, 1.2], [x + sx * (w / 2 - 0.4), (seat - 0.3) / 2, z], std({ color: 0x2a2c30, metalness: 0.4 }), { r: 0.03, name: name + ' leg' }); }
function pennants(S, a, b, n = 12, cols = [0xe8402a, 0xf2c420, 0x2a8ae8, 0xf4f4f0]) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const fl = [];
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, A.distanceTo(B), 4), std({ color: 0x333333 })); line.position.copy(A).lerp(B, 0.5); line.lookAt(B); line.rotateX(Math.PI / 2); S.add(line);
  for (let i = 1; i < n; i++) { const p = A.clone().lerp(B, i / n); p.y -= Math.sin(i / n * Math.PI) * 1.2; const f = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 3), std({ color: cols[i % cols.length], side: THREE.DoubleSide })); f.rotation.z = Math.PI; f.position.copy(p); f.position.y -= 0.45; S.add(f); fl.push(f); }
  return t => fl.forEach((f, i) => { f.rotation.x = Math.sin(t * 3 + i) * 0.25; }); }
export function ferryDeck(S, { time = 'morning', smoke = true } = {}) {
  const sunset = time === 'sunset';
  S.background = skyTex(sunset ? '#5a5aa8' : '#4a8ad8', sunset ? '#f2a07a' : '#a8d0f0', sunset ? '#ffd8a0' : '#f4ead8');
  S.fog = new THREE.Fog(sunset ? 0xf0b890 : 0xd8e8f0, 60, 340);
  clouds(S, { tint: sunset ? 0xffc8a0 : 0xffffff, front: true, y: [16, 36] });
  S.add(new THREE.HemisphereLight(sunset ? 0xffd0b0 : 0xcfe4ff, 0x6a5a48, sunset ? 0.7 : 0.85));
  const sun = new THREE.DirectionalLight(sunset ? 0xffb070 : 0xfff0d8, sunset ? 3.0 : 3.4); sun.position.set(sunset ? -24 : -12, sunset ? 9 : 16, sunset ? -6 : 14); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 0.5, far: 90 }); S.add(sun, sun.target);
  const bounce = new THREE.DirectionalLight(0x9ac8ff, 0.5); bounce.position.set(6, 3, 12); S.add(bounce);
  const seaU = sea(S, { y: -4, speed: 0.025, dir: [1, 0.15], col: sunset ? 0xffd0c0 : 0xffffff });
  // deck + hull
  const deck = std({ map: deckTex() });
  box(S, [52, 0.4, 20.4], [0, -0.2, 1.2], deck, { r: 0, cast: false, name: 'deck' });
  const hull = std({ map: hullTex('#1e3a6a'), roughness: 0.5 });
  box(S, [52, 1.3, 0.5], [0, 0.65, -8.85], hull, { r: 0.06, name: 'bulwark' });
  box(S, [52, 0.25, 0.8], [0, 1.4, -8.85], std({ color: 0xf4f4f0 }), { r: 0.06, name: 'bulwark cap' });
  box(S, [52, 5, 0.6], [0, -3.2, -9.0], std({ map: hullTex('#c8302a') }), { r: 0, cast: false, solid: false });
  rail(S, -14.5, 24, -8.85, { y: 1.5, h: 1.8 });
  box(S, [52, 1.3, 0.5], [0, 0.65, 11.2], hull, { r: 0.06, name: 'front bulwark' }); rail(S, -24, 24, 11.2, { y: 1.3, h: 1.8 });
  // benches against the back rail
  bench(S, [-9.5, 0, -7.2], 7, { col: 0x3a6a8a, name: 'benchL' }); bench(S, [9.5, 0, -7.2], 7, { col: 0x3a6a8a, name: 'benchR' });
  // wheelhouse (left)
  const wall = std({ map: T.plaster(0xf2efe6) }); const trim = std({ color: 0x1e3a6a });
  box(S, [9, 7.5, 13], [-19.5, 3.75, -3], wall, { r: 0.1, name: 'wheelhouse' });
  box(S, [10, 0.5, 14], [-19.5, 7.75, -3], trim, { r: 0.1, name: 'wheelhouse roof' });
  box(S, [0.2, 2.4, 9], [-14.95, 5.2, -3], std({ color: 0x9ac8e8, roughness: 0.05, metalness: 0.3, emissive: 0x3a6a8a, emissiveIntensity: 0.3 }), { r: 0, solid: false });
  for (const zz of [-7.5, -4.5, -1.5, 1.5]) box(S, [0.3, 2.6, 0.2], [-14.9, 5.2, zz], trim, { r: 0.03, solid: false });
  box(S, [0.3, 0.3, 9.4], [-14.9, 6.5, -3], trim, { r: 0.03, solid: false }); box(S, [0.3, 0.3, 9.4], [-14.9, 3.9, -3], trim, { r: 0.03, solid: false });
  box(S, [0.2, 3.6, 1.8], [-14.95, 1.8, 2.6], std({ color: 0x1e3a6a }), { r: 0.04, solid: false });
  const sgn = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.2), std({ map: signTex('GULL ROCK FERRY', '#1e3a6a', '#f6f2e6') })); sgn.position.set(-14.88, 7.0, -3); sgn.rotation.y = Math.PI / 2; S.add(sgn);
  // ship's wheel visible in the window
  const wheel = new THREE.Group(); wheel.position.set(-16.2, 4.8, -3); wheel.rotation.y = Math.PI / 2; S.add(wheel);
  const wm = std({ color: 0x7a4a24, roughness: 0.6 }); put(wheel, mesh(new THREE.TorusGeometry(1.0, 0.09, 8, 24), wm)); for (let i = 0; i < 8; i++) { const sp = put(wheel, mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), wm)); sp.rotation.z = i * Math.PI / 8; }
  lifebuoy(S, [-14.75, 3.0, -6.5], Math.PI / 2); lifebuoy(S, [-14.75, 3.0, 0.5], Math.PI / 2);
  // funnel + mast + pennants
  const fun = mesh(new THREE.CylinderGeometry(1.5, 1.8, 6, 20), std({ color: 0xf2efe6, roughness: 0.5 })); fun.position.set(-21, 11, -4); S.add(fun);
  const band = mesh(new THREE.CylinderGeometry(1.53, 1.6, 1.0, 20), std({ color: 0xc8302a })); band.position.set(-21, 12.6, -4); S.add(band);
  box(S, [0.35, 16, 0.35], [17, 8, -8], std({ color: 0xf4f4f0, metalness: 0.3 }), { r: 0.08, name: 'mast' });
  const flag = pennants(S, [17, 15.5, -8], [-18, 8.2, -8], 20); const flag2 = pennants(S, [17, 15.5, -8], [24, 1.6, -8.6], 8);
  // cargo + dressing (right side)
  crate(S, [14, 0, -4.5], 2.0, 0x9a6a3a, 'FISH'); crate(S, [16.2, 0, -4.8], 1.6, 0x8a5a30); crate(S, [15, 2.0, -4.6], 1.5, 0xa87a4a, 'MAIL');
  rope(S, [12.4, 0, 3.0]); rope(S, [-12.5, 0, 6.5], 0.6);
  box(S, [3.2, 1.6, 1.6], [20.5, 0.8, 4], std({ color: 0xf2a420 }), { r: 0.1, name: 'lifejacket box' });
  const lj = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.6), std({ map: signTex('LIFE JACKETS', '#f2a420', '#2a1a0a') })); lj.position.set(20.5, 1.0, 4.81); S.add(lj);
  lifebuoy(S, [4.0, 2.6, -8.45], 0); lifebuoy(S, [-4.0, 2.6, -8.45], 0, 0.9);
  for (const [bx, bz] of [[-6.5, 9.6], [6.5, 9.6], [0, -8.2]]) { const b2 = mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.8, 12), std({ color: 0x2a2c30, metalness: 0.5 })); b2.position.set(bx, 0.4, bz); S.add(b2); }
  // bell on a post
  const bellG = new THREE.Group(); bellG.position.set(21.5, 0, -6); S.add(bellG); put(bellG, mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 8), std({ color: 0x2a2c30 })), [0, 2, 0]);
  put(bellG, mesh(new THREE.CylinderGeometry(0.35, 0.65, 0.9, 16, 1, true), std({ color: 0xd8a830, metalness: 0.9, roughness: 0.25, side: THREE.DoubleSide })), [0.5, 3.6, 0]);
  // island with lighthouse on the horizon + a second far island
  const isl = island(S, [70, -4, -170], 1.4, false); island(S, [-120, -4, -230], 1.1, false);
  // gulls
  const gs = [0, 1, 2].map(i => gull(S, 0.9));
  // smoke puffs
  const puffs = []; if (smoke) for (let i = 0; i < 7; i++) { const p = mesh(new THREE.IcosahedronGeometry(1, 1), std({ color: 0xe8e8ec, transparent: true, opacity: 0.55, roughness: 1 }), false); S.add(p); puffs.push(p); }
  const key = new THREE.PointLight(0xffe8d0, 6, 16, 1.6); key.position.set(-2, 6, 8); S.add(key);
  return { sun, key, update(t) { seaU(t); flag(t); flag2(t); isl.update(t);
    gs.forEach((g, i) => { const a = t * 0.35 + i * 2.1; g.position.set(Math.cos(a) * (14 + i * 4) + 2, 13 + i * 2.5 + Math.sin(t * 1.3 + i) * 0.6, -18 + Math.sin(a) * 6); g.rotation.y = -a; g.rotation.z = 0.25; g.update(t + i, 'fly'); });
    puffs.forEach((p, i) => { const u = ((t * 0.18 + i / puffs.length) % 1); p.position.set(-21 + u * 14, 14 + u * 8, -4 - u * 3); p.scale.setScalar(0.8 + u * 2.4); p.material.opacity = 0.5 * (1 - u); }); } };
}

// ---------------- keeper's attic ----------------
const wallpaper = () => once('wp', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#6a8aa8'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.12)';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 16; x < w; x += 32) { c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + 6, y + 12); c.lineTo(x, y + 18); c.lineTo(x - 6, y + 12); c.fill(); } noiseFill(c, w, h, 0.05, 900); }, [5, 3]));
const boardTex = () => once('board', () => ctex(512, 512, (c, w, h) => { for (let i = 0; i < 6; i++) { c.fillStyle = `hsl(32, 25%, ${58 + Math.random() * 8}%)`; c.fillRect(i * w / 6, 0, w / 6, h); c.fillStyle = 'rgba(40,20,5,0.4)'; c.fillRect(i * w / 6, 0, 3, h); } noiseFill(c, w, h, 0.07, 2500); }, [3, 2]));
function paperBoat(S, [x, y, z], col = 0xf4f0e0, s = 0.6) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); S.add(g); const m = std({ color: col, side: THREE.DoubleSide });
  put(g, mesh(new THREE.CylinderGeometry(1, 0.6, 0.5, 4, 1), m), [0, 0, 0], [0, Math.PI / 4, 0]).scale.set(1.4, 1, 0.5); put(g, mesh(new THREE.ConeGeometry(0.6, 1.0, 3), m), [0, 0.7, 0]); return g; }
function shell(S, [x, y, z], s = 0.3, col = 0xf2d8c8) { const m = mesh(new THREE.ConeGeometry(0.5, 1.0, 9), std({ color: col, roughness: 0.4 })); m.position.set(x, y, z); m.rotation.z = Math.PI / 2.4; m.scale.setScalar(s); S.add(m); return m; }
export function keeperAttic(S, { night = true } = {}) {
  if (night) S.userData.look = 'night';
  S.background = new THREE.Color(night ? 0x060810 : 0xbfd8f0);
  const W = 9, Z0 = -8, Z1 = 11, H = 10.5, KW = 4;
  box(S, [2 * W, 0.3, Z1 - Z0], [0, -0.15, (Z0 + Z1) / 2], std({ map: boardTex() }), { r: 0, cast: false, name: 'floor' });
  const wp = std({ map: wallpaper() });
  for (const sx of [-1, 1]) box(S, [0.4, KW, Z1 - Z0], [sx * W, KW / 2, (Z0 + Z1) / 2], wp, { r: 0, cast: false, name: 'kneewall' });
  // sloped ceiling: planes from (±W, KW) to (0, H)
  const slopeL = Math.hypot(W, H - KW), ang = Math.atan2(H - KW, W); const ceil = std({ map: boardTex(), color: 0xe8dcc8 });
  for (const sx of [-1, 1]) { const c = box(S, [slopeL, 0.3, Z1 - Z0], [sx * W / 2, (KW + H) / 2 + 0.15, (Z0 + Z1) / 2], ceil, { r: 0, cast: false, solid: false }); c.rotation.z = -sx * ang;
    for (let z = Z0 + 2; z < Z1; z += 4) { const r = box(S, [slopeL, 0.5, 0.5], [sx * W / 2, (KW + H) / 2 - 0.2, z], std({ color: 0x6a4428, map: T.planks(0x6a4428) }), { r: 0.04, cast: false, solid: false }); r.rotation.z = -sx * ang; } }
  box(S, [0.6, 0.6, Z1 - Z0], [0, H - 0.2, (Z0 + Z1) / 2], std({ color: 0x5a3a20 }), { r: 0.04, cast: false, solid: false });
  // back wall (gable) with a round window: build as a shape with a hole
  const shp = new THREE.Shape(); shp.moveTo(-W, 0); shp.lineTo(W, 0); shp.lineTo(W, KW); shp.lineTo(0, H); shp.lineTo(-W, KW); shp.lineTo(-W, 0);
  const hole = new THREE.Path(); hole.absarc(0, 5.2, 1.7, 0, Math.PI * 2, true); shp.holes.push(hole);
  const gw = new THREE.ExtrudeGeometry(shp, { depth: 0.4, bevelEnabled: false }); const wpm = std({ map: wallpaper() }); wpm.map = wallpaper().clone(); wpm.map.repeat.set(0.3, 0.3); wpm.map.needsUpdate = true;
  const gm = mesh(gw, wpm, false); gm.position.set(0, 0, Z0 - 0.4); S.add(gm);
  const fr = mesh(new THREE.TorusGeometry(1.75, 0.18, 10, 40), std({ color: 0xf4efe4 })); fr.position.set(0, 5.2, Z0 + 0.05); S.add(fr);
  for (const r of [0, Math.PI / 2]) { const b = mesh(new THREE.BoxGeometry(3.4, 0.1, 0.1), std({ color: 0xf4efe4 })); b.position.set(0, 5.2, Z0 - 0.1); b.rotation.z = r; S.add(b); }
  box(S, [3.8, 0.25, 0.7], [0, 3.35, Z0 + 0.25], std({ color: 0xf4efe4 }), { r: 0.05, name: 'sill' });
  // front gable wall (for reverse shots)
  const fg = mesh(new THREE.ExtrudeGeometry((() => { const s2 = new THREE.Shape(); s2.moveTo(-W, 0); s2.lineTo(W, 0); s2.lineTo(W, KW); s2.lineTo(0, H); s2.lineTo(-W, KW); s2.lineTo(-W, 0); return s2; })(), { depth: 0.4, bevelEnabled: false }), wpm, false); fg.position.set(0, 0, Z1); S.add(fg);
  // view out of the window: sky, sea, the lighthouse on its cliff
  const outside = new THREE.Group(); S.add(outside);
  const skyP = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.MeshBasicMaterial({ map: night ? skyTex('#050a1c', '#14244a', '#2a3a60') : skyTex('#5a9ae0', '#bcdcf4', '#f4ead8'), fog: false })); skyP.position.set(0, 12, -60); outside.add(skyP);
  if (night) { const R = rng(2); for (let i = 0; i < 70; i++) { const st = new THREE.Mesh(new THREE.CircleGeometry(0.06 + R() * 0.08, 5), new THREE.MeshBasicMaterial({ color: 0xffffff })); st.position.set((R() - 0.5) * 40, 6 + R() * 20, -58); outside.add(st); } }
  const sw = sea(outside, { y: -2, size: 200, night, speed: 0.01 }); const LH = lighthouse(outside, [9, -1, -46], { s: 0.55, night, beam: night });
  const land = mesh(new THREE.CylinderGeometry(14, 16, 4, 8), std({ color: night ? 0x1a2a22 : 0x4a8a3a, roughness: 1 }), false); land.position.set(9, -2.5, -46); outside.add(land);
  // bed (left, under the slope)
  const wd = std({ map: T.planks(0x7a4a2a) });
  box(S, [3.6, 1.1, 7.4], [-6.0, 0.55, -2.4], wd, { r: 0.06, name: 'bed frame' });
  box(S, [3.4, 0.5, 7.2], [-6.0, 1.35, -2.4], std({ color: 0xf2eee6 }), { r: 0.15, name: 'mattress' });
  const quiltT = ctex(256, 256, (c, w, h) => { const cs = ['#d8583a', '#f2c45a', '#3a8aa8', '#f4ead8', '#6aa86a', '#a85a8a']; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = cs[(i * 3 + j * 5) % cs.length]; c.fillRect(i * 64, j * 64, 64, 64); c.strokeStyle = 'rgba(255,255,255,0.6)'; c.setLineDash([5, 4]); c.strokeRect(i * 64 + 3, j * 64 + 3, 58, 58); } });
  box(S, [3.6, 0.3, 4.8], [-6.0, 1.72, -1.0], std({ map: quiltT }), { r: 0.1, name: 'quilt' });
  box(S, [2.4, 0.5, 1.1], [-6.0, 1.85, -5.2], std({ color: 0xffffff }), { r: 0.2, name: 'pillow' });
  box(S, [3.8, 2.4, 0.3], [-6.0, 1.2, -6.25], wd, { r: 0.05, name: 'headboard' });
  // desk + lamp (right)
  box(S, [3.6, 0.2, 2.0], [6.2, 2.5, -5.6], std({ map: T.planks(0x9a6a40) }), { r: 0.04, name: 'desk' });
  for (const [dx, dz] of [[-1.6, -0.8], [1.6, -0.8], [-1.6, 0.8], [1.6, 0.8]]) box(S, [0.2, 2.4, 0.2], [6.2 + dx, 1.2, -5.6 + dz], wd, { r: 0.03, name: 'desk leg' });
  const lampG = new THREE.Group(); lampG.position.set(7.2, 2.6, -6.0); S.add(lampG);
  put(lampG, mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.15, 14), std({ color: 0x2a5a4a })), [0, 0.08, 0]); put(lampG, mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 6), std({ color: 0x2a5a4a })), [0, 0.7, 0]);
  const shade = put(lampG, mesh(new THREE.ConeGeometry(0.55, 0.6, 16, 1, true), std({ color: 0x3a7a5a, emissive: 0xffb050, emissiveIntensity: night ? 0.35 : 0.05, side: THREE.DoubleSide })), [0, 1.45, 0.05]);
  put(lampG, mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: night ? 0xfff0c0 : 0xd8d0c0 })), [0, 1.3, 0.05]);
  const lamp = new THREE.PointLight(0xffb468, night ? 22 : 3, 18, 1.5); lamp.position.set(6.6, 4.2, -4.8); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.002; S.add(lamp);
  // desk clutter: books, jar of shells, ship in a bottle, paper boats, globe
  [[5.0, 0xc8402a], [5.35, 0x2a6aa8], [5.65, 0xe8b830]].forEach(([bx, c], i) => box(S, [0.3, 1.0 - i * 0.1, 1.2], [bx, 3.1 - i * 0.05, -6.1], std({ color: c }), { r: 0.03, cast: true, solid: false }));
  const jar = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 16), std({ color: 0xcfe8ff, transparent: true, opacity: 0.45, roughness: 0.05 })); jar.position.set(6.4, 3.0, -5.2); S.add(jar);
  for (let i = 0; i < 4; i++) shell(S, [6.3 + (i % 2) * 0.15, 2.75 + i * 0.12, -5.2], 0.25, [0xf2d8c8, 0xf4c0a0, 0xe8e0d0, 0xf2b8b8][i]);
  const bottle = mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.4, 14), std({ color: 0xbfe8d0, transparent: true, opacity: 0.4, roughness: 0.05 })); bottle.rotation.z = Math.PI / 2; bottle.position.set(5.6, 2.9, -4.9); S.add(bottle);
  paperBoat(S, [5.6, 2.85, -4.9], 0xf4f0e0, 0.25);
  paperBoat(S, [7.6, 2.75, -4.9], 0xf2c45a, 0.35);
  // moving boxes stacked (they moved here two years ago — some never unpacked)
  const card = std({ color: 0xc89a62, roughness: 0.9 }); const lab = (txt, [x, y, z], w) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.25), std({ map: signTex(txt, '#c89a62', '#3a2a1a') })); p.position.set(x, y, z); S.add(p); };
  box(S, [2.4, 1.8, 2.0], [6.4, 0.9, 2.6], card, { r: 0.05, name: 'box1' }); lab('MILO', [6.4, 1.1, 3.61], 1.8);
  box(S, [2.0, 1.4, 1.8], [6.6, 2.5, 2.4], card, { r: 0.05, name: 'box2' }); lab('TOYS', [6.6, 2.6, 3.31], 1.4);
  box(S, [1.8, 1.2, 1.6], [7.0, 0.6, 5.6], card, { r: 0.05, name: 'box3' });
  // shelf under the window with shells + a toy lighthouse; nautical chart; paper-boat bunting
  box(S, [5, 0.2, 0.9], [0, 2.1, Z0 + 0.5], std({ map: T.planks(0x9a6a40) }), { r: 0.03, cast: false, name: 'shelf' });
  for (const [x, c] of [[-2, 0xf2d8c8], [-1.4, 0xf4c0a0], [1.8, 0xe8e0d0]]) shell(S, [x, 2.4, Z0 + 0.5], 0.35, c);
  lighthouse(S, [1.0, 2.2, Z0 + 0.5], { s: 0.06, night: false, beam: false });
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), std({ map: ctex(320, 220, (c, w, h) => { c.fillStyle = '#e8dcb8'; c.fillRect(0, 0, w, h); c.fillStyle = '#8ab8c8'; c.fillRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#d8c890'; c.beginPath(); c.ellipse(120, 120, 60, 40, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(240, 70, 30, 20, 0, 0, 7); c.fill(); c.strokeStyle = '#c83a2a'; c.setLineDash([6, 5]); c.lineWidth = 3; c.beginPath(); c.moveTo(150, 130); c.lineTo(235, 75); c.stroke(); }) }));
  chart.position.set(-5.2, 6.0, Z0 + 0.03); S.add(chart);
  const bunt = []; for (let i = 0; i < 7; i++) bunt.push(paperBoat(S, [-4.2 + i * 1.4, 7.6 - Math.sin(i / 6 * Math.PI) * 0.6, -1], [0xf4f0e0, 0xf2c45a, 0x8ac0e0][i % 3], 0.35));
  // braided rug + a jar of fireflies-ish night light near the bed
  const rug = mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.05, 40), std({ map: ctex(256, 256, (c, w, h) => { for (let r = 128; r > 0; r -= 10) { c.fillStyle = ['#b85a3a', '#e8c88a', '#3a6a8a', '#d89a5a'][(r / 10) % 4 | 0]; c.beginPath(); c.arc(128, 128, r, 0, 7); c.fill(); } }), roughness: 1 }), false);
  rug.position.set(0.5, 0.03, 1.0); rug.scale.z = 0.75; S.add(rug);
  // lights
  S.add(new THREE.HemisphereLight(night ? 0x6a80c0 : 0xfff2e0, night ? 0x2a2030 : 0x6a5040, night ? 0.95 : 1.0));
  const moonL = new THREE.SpotLight(night ? 0x8aa8ff : 0xfff0d0, night ? 380 : 500, 40, 0.42, 0.6, 1.4); moonL.position.set(-2, 8.5, Z0 - 6); moonL.target.position.set(1.5, 0, 3); moonL.castShadow = true; moonL.shadow.mapSize.set(1024, 1024); S.add(moonL, moonL.target);
  const sweepL = new THREE.SpotLight(0xfff0c0, 0, 50, 0.35, 0.7, 1.2); sweepL.position.set(0, 5.6, Z0 - 2); S.add(sweepL, sweepL.target);
  const fill = new THREE.PointLight(night ? 0xffc8a0 : 0xfff0e0, night ? 9 : 5, 18, 1.5); fill.position.set(0, 5.5, 8); S.add(fill);
  const sweep = t => Math.pow(Math.max(0, Math.cos(t * 0.55 - 0.9)), 14);
  return { lamp, fill, moon: moonL, LH, sweep, update(t) { sw(t); LH.update(t); const k = night ? sweep(t) : 0; sweepL.intensity = k * 900; sweepL.target.position.set(-6 + ((t * 0.55 - 0.9 + 3) % 6.283) * 2.0, 1, 4);
    lamp.intensity = (night ? 22 : 3) * (1 + Math.sin(t * 9) * 0.006); bunt.forEach((b, i) => { b.rotation.z = Math.sin(t * 1.2 + i) * 0.08; }); } };
}

// ---------------- lighthouse cliff ----------------
const gravel = () => once('grav', () => ctex(256, 256, (c, w, h) => { c.fillStyle = '#b8a888'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { c.fillStyle = `hsl(35, 15%, ${45 + Math.random() * 35}%)`; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 0, 7); c.fill(); } }, [2, 8]));
function cottage(S, [x, y, z], night) { const g = new THREE.Group(); g.position.set(x, y, z); S.add(g);
  const wall = std({ map: T.plaster(0xf2ece0) }); put(g, mesh(new THREE.BoxGeometry(10, 5.5, 7), wall), [0, 2.75, 0]);
  const roof = std({ color: 0x3a4a5a, roughness: 0.8 }); for (const sx of [-1, 1]) { const r = put(g, mesh(new THREE.BoxGeometry(11, 0.3, 4.4), roof), [0, 6.6, sx * 1.9]); r.rotation.x = sx * 0.62; }
  put(g, mesh(new THREE.BoxGeometry(1.0, 3, 1.0), std({ map: T.brick(0x8a4a3a) })), [3, 7.5, -0.8]);
  put(g, mesh(new THREE.BoxGeometry(1.6, 3.0, 0.2), std({ color: 0x2a6a7a })), [-2.2, 1.5, 3.55]);
  const wm = std({ color: night ? 0xffd890 : 0x3a4a5a, emissive: night ? 0xffb050 : 0, emissiveIntensity: night ? 1.4 : 0 });
  for (const wx of [1.2, 3.6]) { put(g, mesh(new THREE.BoxGeometry(1.6, 1.5, 0.2), wm), [wx, 2.6, 3.55]); put(g, mesh(new THREE.BoxGeometry(1.9, 0.2, 0.4), std({ color: 0xffffff })), [wx, 1.75, 3.6]); }
  const attic = put(g, mesh(new THREE.CircleGeometry(0.75, 20), wm), [0, 7.0, 3.62]); attic.position.set(0, 6.0, 3.56);
  if (night) { const p = new THREE.PointLight(0xffb060, 10, 14, 1.6); p.position.set(2.5, 2.6, 5); g.add(p); }
  return g; }
function flowers(S, n, area, seed = 3) { const R = rng(seed); const g = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.18, 0), std({ color: 0xffffff, roughness: 0.8 }), n); const o = new THREE.Object3D(); const cols = [0xf2e6f0, 0xf2c420, 0xe85a8a, 0xb88ae8, 0xffffff];
  for (let i = 0; i < n; i++) { const [x0, x1, z0, z1] = area; o.position.set(x0 + R() * (x1 - x0), 0.25, z0 + R() * (z1 - z0)); if (Math.abs(o.position.x - pathX(o.position.z)) < 2.4) o.position.x += 5; o.updateMatrix(); g.setMatrixAt(i, o.matrix); g.setColorAt(i, new THREE.Color(cols[i % cols.length])); } S.add(g); return g; }
const pathX = z => -11 * Math.max(0, Math.min(1, (10 - z) / 26)) ** 1.6;   // path from (0,10) curving to the lighthouse door (-11,-16)
export function lighthouseCliff(S, { time = 'day', beam } = {}) {
  const night = time === 'night', sunset = time === 'sunset'; if (night) S.userData.look = 'night';
  S.background = night ? skyTex('#040818', '#0e1c40', '#22345a') : sunset ? skyTex('#4a4a98', '#f08a6a', '#ffd890') : skyTex('#3a7ad0', '#9ac8f0', '#eef2e8');
  S.fog = new THREE.Fog(night ? 0x14203a : sunset ? 0xf0a888 : 0xd0e4f0, 70, 360);
  clouds(S, night ? { night: true, front: true } : sunset ? { tint: 0xffb898, front: true } : { front: true });
  if (night) { stars(S, 700); moon(S, [60, 70, -220], 7); }
  S.add(new THREE.HemisphereLight(night ? 0x4a5a98 : sunset ? 0xffc8a8 : 0xd0e4ff, night ? 0x10141a : 0x4a5a30, night ? 0.5 : sunset ? 0.7 : 0.9));
  const sun = new THREE.DirectionalLight(night ? 0x8aa4f0 : sunset ? 0xffa060 : 0xfff2dc, night ? 1.0 : sunset ? 3.2 : 3.4);
  sun.position.set(night ? 18 : sunset ? 30 : -14, night ? 26 : sunset ? 8 : 20, night ? -14 : sunset ? -18 : 12); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 0.5, far: 120 }); S.add(sun, sun.target);
  // ground
  const gt = T2.grass().clone(); gt.repeat.set(10, 10); gt.needsUpdate = true;
  box(S, [120, 0.4, 44], [0, -0.2, -4], std({ map: gt, color: night ? 0x6a8a9a : sunset ? 0xffd8b0 : 0xffffff }), { r: 0, cast: false, name: 'ground' });
  // cliff face + sea far below
  box(S, [120, 30, 2], [0, -15.4, -26.6], std({ map: T.concrete(0x6a645a), color: night ? 0x5a6070 : 0xa89a88 }), { r: 0, cast: false, solid: false });
  const seaU = sea(S, { y: -30, night, speed: 0.004, col: sunset ? 0xffc8b0 : 0xffffff });
  // path
  const pm = std({ map: gravel(), color: night ? 0x8a90a0 : 0xffffff, roughness: 1 }); const pts = []; for (let z = 12; z >= -15; z -= 1) pts.push([pathX(z), z]);
  for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]; const seg = mesh(new THREE.BoxGeometry(3.6, 0.06, Math.hypot(x1 - x0, z1 - z0) + 0.3), pm, false);
    seg.position.set((x0 + x1) / 2, 0.02, (z0 + z1) / 2); seg.rotation.y = Math.atan2(x1 - x0, z1 - z0); S.add(seg); }
  // lighthouse + cottage
  const LH = lighthouse(S, [-11, 0, -19], { s: 1, night, beam: beam ?? (night || sunset) });
  box(S, [7.2, 22, 7.2], [-11, 11, -19], std({ visible: false }), { r: 0, cast: false, name: 'lighthouse' });
  cottage(S, [14, 0, -17], night || sunset);
  // fence along the cliff edge
  const fm = std({ color: 0xf2efe6 }); for (let x = -40; x <= 40; x += 2.5) box(S, [0.25, 2.0, 0.25], [x, 1.0, -25.5], fm, { r: 0.04, cast: true, solid: false });
  for (const yy of [0.9, 1.7]) box(S, [80, 0.18, 0.12], [0, yy, -25.5], fm, { r: 0.03, solid: false });
  // rocks, flowers, grass tufts, lamps, bench, signpost, mailbox
  const rk = std({ color: night ? 0x4a505a : 0x8a8a84, roughness: 1 }); const R = rng(9);
  for (const [x, z, s] of [[8, 4, 1.4], [-18, 2, 2.0], [22, -8, 2.4], [-24, -10, 1.8], [6, -20, 1.2], [26, 6, 1.6], [-6, 6, 0.9]]) { const r = mesh(new THREE.DodecahedronGeometry(s, 0), rk); r.position.set(x, s * 0.4, z); r.rotation.set(R(), R(), R()); r.scale.y = 0.6; S.add(r); }
  flowers(S, 260, [-36, 36, -24, 14]);
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.25, 1.1, 4), std({ color: night ? 0x2a4a3a : sunset ? 0x7a9a3a : 0x4a8a3a }), 300); const o = new THREE.Object3D();
  for (let i = 0; i < 300; i++) { o.position.set((R() - 0.5) * 80, 0.4, -24 + R() * 40); if (Math.abs(o.position.x - pathX(o.position.z)) < 2.6) o.position.x += 6; o.rotation.set((R() - 0.5) * 0.5, R() * 3, (R() - 0.5) * 0.5); o.updateMatrix(); tufts.setMatrixAt(i, o.matrix); } S.add(tufts);
  const lamps = []; for (const [x, z] of [[7.5, 1.0], [-1.6, -6], [-5.0, -12.5]]) { box(S, [0.22, 4.4, 0.22], [x, 2.2, z], std({ color: 0x22262c, metalness: 0.5 }), { r: 0.04, name: 'lamp post' });
    const gl = mesh(new THREE.BoxGeometry(0.7, 0.8, 0.7), std({ color: 0xfff0c0, emissive: 0xffc070, emissiveIntensity: night || sunset ? 1.5 : 0.2 }), false); gl.position.set(x, 4.8, z); S.add(gl);
    if (night || sunset) { const p = new THREE.PointLight(0xffb868, night ? 9 : 4, 12, 1.6); p.position.set(x, 4.6, z); S.add(p); lamps.push(p); } }
  bench(S, [3, 0, -9.6], 6.4, { col: 0x7a5a3a, name: 'bench' });
  const post = box(S, [0.25, 3.2, 0.25], [4.4, 1.6, 7], std({ map: T.planks(0x6a4428) }), { r: 0.04, name: 'signpost' });
  for (const [txt, yy, rot] of [['LIGHTHOUSE', 2.8, 0.3], ['FERRY', 2.2, -0.3]]) { const sg = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.1), std({ map: signTex(txt, '#f2ead8', '#2a3a4a') })); sg.position.set(4.4, yy, 7.1); sg.rotation.y = rot; S.add(sg); }
  const gs = [0, 1].map(() => gull(S, 0.9));
  const key = new THREE.PointLight(night ? 0xc8d4ff : 0xffe8d0, night ? 3 : 5, 18, 1.6); key.position.set(2, 6, 9); S.add(key);
  return { sun, key, LH, lamps, update(t) { seaU(t); LH.update(t); if (!night) gs.forEach((g, i) => { const a = t * 0.3 + i * 3; g.position.set(Math.cos(a) * 16 - 4, 16 + i * 3, -30 + Math.sin(a) * 6); g.rotation.y = -a; g.update(t + i); }); else gs.forEach(g => g.visible = false); } };
}

// ---------------- lantern room ----------------
export function lanternRoom(S, { time = 'night' } = {}) {
  S.userData.look = 'night'; S.background = new THREE.Color(0x050914);
  const R0 = 8;
  // outside: sky dome, stars, moon, sea far below, distant town lights
  const dome = new THREE.Mesh(new THREE.SphereGeometry(320, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex('#03060f', '#0c1a3a', '#24345a'), side: THREE.BackSide, fog: false })); dome.rotation.x = Math.PI; dome.position.y = 40; S.add(dome);
  stars(S, 900, 280, 0.02); moon(S, [-80, 70, -200], 8);
  clouds(S, { night: true, front: true, y: [10, 40] });
  const seaU = sea(S, { y: -45, night: true, speed: 0.003 });
  const tl = []; const RR = rng(4); for (let i = 0; i < 40; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 4), new THREE.MeshBasicMaterial({ color: RR() < 0.5 ? 0xffd080 : 0xfff0d0, fog: false })); const a = 2.2 + RR() * 1.2; p.position.set(Math.cos(a) * (140 + RR() * 30), -40 + RR() * 4, Math.sin(a) * (140 + RR() * 30)); S.add(p); tl.push(p); }
  // floor, low wall, glass + mullions, roof
  const floorT = ctex(512, 512, (c, w, h) => { c.fillStyle = '#4a4e54'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * w / 4, 0); c.lineTo(i * w / 4, h); c.stroke(); c.beginPath(); c.moveTo(0, i * h / 4); c.lineTo(w, i * h / 4); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 400; i++) { const x = Math.random() * w, y = Math.random() * h; c.fillRect(x, y, 6, 2); } noiseFill(c, w, h, 0.08, 3000); }, [3, 3]);
  const fl = mesh(new THREE.CylinderGeometry(R0 + 0.4, R0 + 0.4, 0.3, 48), std({ map: floorT, metalness: 0.4, roughness: 0.6 }), false); fl.position.y = -0.15; fl.userData.solid = true; fl.name = 'floor'; S.add(fl);
  const wallM = std({ color: 0x8a2a26, map: T.plaster(0x8a2a26), roughness: 0.8, side: THREE.DoubleSide });
  const lw = mesh(new THREE.CylinderGeometry(R0, R0, 2.4, 48, 1, true), wallM, false); lw.position.y = 1.2; S.add(lw);
  const ledge = mesh(new THREE.TorusGeometry(R0 - 0.15, 0.22, 6, 48), std({ color: 0x2a2e34, metalness: 0.6, roughness: 0.4 }), false); ledge.rotation.x = Math.PI / 2; ledge.position.y = 2.45; S.add(ledge);
  const glass = mesh(new THREE.CylinderGeometry(R0, R0, 6.2, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x9ab8d8, transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0.5, side: THREE.DoubleSide, depthWrite: false }), false); glass.position.y = 5.55; S.add(glass);
  const mull = std({ color: 0x1e2228, metalness: 0.6, roughness: 0.35 });
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; const m = mesh(new THREE.BoxGeometry(0.22, 6.2, 0.22), mull, false); m.position.set(Math.cos(a) * R0, 5.55, Math.sin(a) * R0); m.rotation.y = -a; S.add(m); }
  for (const yy of [5.6]) { const r = mesh(new THREE.TorusGeometry(R0, 0.08, 6, 48), mull, false); r.rotation.x = Math.PI / 2; r.position.y = yy; S.add(r); }
  const roof = mesh(new THREE.ConeGeometry(R0 + 0.5, 3.4, 48, 1, true), std({ color: 0x5a1e1c, roughness: 0.6, side: THREE.DoubleSide }), false); roof.position.y = 8.65 + 1.7; S.add(roof);
  const rring = mesh(new THREE.TorusGeometry(R0, 0.25, 6, 48), mull, false); rring.rotation.x = Math.PI / 2; rring.position.y = 8.65; S.add(rring);
  // the lens: pedestal + stacked glowing prism rings + brass frame
  const LZ = -3.2; const lens = new THREE.Group(); lens.position.set(0, 0, LZ); S.add(lens);
  const brass = std({ color: 0xc89a3a, metalness: 0.85, roughness: 0.3 });
  box(S, [2.6, 2.2, 2.6], [0, 1.1, LZ], std({ color: 0x2a4a3a, roughness: 0.5, metalness: 0.3 }), { r: 0.2, name: 'pedestal' });
  const spin = new THREE.Group(); spin.position.y = 2.2; lens.add(spin);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.8 });   // unlit: a lit, near-mirror ring next to the lamp produced NaN pixels (black bloom blocks)
  for (let i = 0; i < 9; i++) { const y = 0.25 + i * 0.42; const r = 1.7 - Math.abs(i - 4) * 0.1; const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.34, 32, 1, true), ringM); ring.position.y = y; spin.add(ring); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; const b = mesh(new THREE.BoxGeometry(0.1, 3.9, 0.1), brass, false); b.position.set(Math.cos(a) * 1.75, 2.05, Math.sin(a) * 1.75); spin.add(b); }
  const top = mesh(new THREE.ConeGeometry(1.4, 0.9, 16), brass, false); top.position.y = 4.4; spin.add(top);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); core.position.y = 2.0; spin.add(core);
  const bullseye = []; for (const a of [0, Math.PI]) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.7, 24), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.85 })); b.position.set(Math.sin(a) * 1.72, 2.0, Math.cos(a) * 1.72); b.rotation.y = a; spin.add(b); bullseye.push(b); }
  box(S, [3.6, 3.6, 3.6], [0, 4.0, LZ], std({ visible: false }), { r: 0, cast: false, name: 'lens' });
  // beams out through the glass
  const bm = new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (const a of [0, Math.PI]) { const c = new THREE.Mesh(new THREE.ConeGeometry(3.2, 60, 24, 1, true), bm); c.rotation.x = -Math.PI / 2; c.position.set(Math.sin(a) * 31, 2.0, Math.cos(a) * 31); const p = new THREE.Group(); p.rotation.y = a; p.add(c); c.position.set(0, 2.0, 31.7); spin.add(p); }
  // lights: the lens (warm key/back light), a floor lantern (practical face light), cool moon fill
  const lamp = new THREE.PointLight(0xffc878, 46, 22, 1.5); lamp.position.set(0, 4.2, LZ + 2.2); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.003; S.add(lamp);
  S.add(new THREE.HemisphereLight(0x4a5a98, 0x1a1210, 0.45));
  const moonL = new THREE.DirectionalLight(0x8aa4f0, 0.8); moonL.position.set(-20, 18, 14); S.add(moonL);
  // oil lantern on the floor (front-left), logbook desk (right), stool, blanket, thermos, toolbox
  const lanternG = new THREE.Group(); lanternG.position.set(-4.4, 0, 3.4); S.add(lanternG);
  put(lanternG, mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.15, 12), mull), [0, 0.08, 0]); put(lanternG, mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffb040, emissiveIntensity: 1.6, transparent: true, opacity: 0.85 })), [0, 0.55, 0]);
  put(lanternG, mesh(new THREE.ConeGeometry(0.45, 0.35, 12), mull), [0, 1.12, 0]); put(lanternG, mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 12, Math.PI), mull), [0, 1.35, 0]);
  const lantern = new THREE.PointLight(0xffa850, 10, 10, 1.6); lantern.position.set(-3.6, 1.6, 4.0); S.add(lantern);
  box(S, [3.0, 0.2, 1.6], [5.6, 2.7, -3.2], std({ map: T.planks(0x6a4428) }), { r: 0.03, name: 'desk', rot: [0, -0.9, 0] });
  for (const [dx, dz] of [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]]) { const c = Math.cos(-0.9), s2 = Math.sin(-0.9); box(S, [0.18, 2.6, 0.18], [5.6 + dx * c + dz * s2, 1.3, -3.2 - dx * s2 + dz * c], std({ color: 0x4a3020 }), { r: 0.03, name: 'desk leg' }); }
  const book = mesh(new THREE.BoxGeometry(1.2, 0.18, 0.9), std({ color: 0x6a2a2a }), true); book.position.set(5.5, 2.9, -3.1); book.rotation.y = -0.6; S.add(book);
  const thermos = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 12), std({ color: 0x2a6a8a, metalness: 0.4 })); thermos.position.set(6.2, 3.25, -3.9); S.add(thermos);
  box(S, [1.6, 0.9, 0.9], [-5.6, 0.45, -3.8], std({ color: 0xc8302a, metalness: 0.4, roughness: 0.4 }), { r: 0.06, name: 'toolbox', rot: [0, 0.7, 0] });
  box(S, [2.6, 0.25, 1.8], [-5.0, 0.12, 0.2], std({ color: 0x3a5a8a, roughness: 1 }), { r: 0.1, name: 'blanket', rot: [0, 0.3, 0] });
  const stool = new THREE.Group(); stool.position.set(-4.6, 0, -6.0); S.add(stool); put(stool, mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.2, 16), std({ map: T.planks(0x7a4a2a) })), [0, 1.8, 0]);
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283; put(stool, mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), std({ color: 0x3a2a1a })), [Math.cos(a) * 0.45, 0.9, Math.sin(a) * 0.45]); }
  // floor hatch + ladder rails
  const hatch = new THREE.Group(); hatch.position.set(4.4, 0, 4.0); S.add(hatch);
  const hole = mesh(new THREE.BoxGeometry(2.4, 0.02, 2.4), new THREE.MeshBasicMaterial({ color: 0x050505 }), false); hole.position.y = 0.01; hatch.add(hole);
  const lidP = new THREE.Group(); lidP.position.set(0, 0.05, -1.2); hatch.add(lidP); const lid = mesh(new THREE.BoxGeometry(2.4, 0.12, 2.4), std({ map: floorT, metalness: 0.4 })); lid.position.set(0, 0, 1.2); lidP.add(lid);
  for (const sx of [-1, 1]) { const r = mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), brass); r.position.set(sx * 1.0, 1.1, 1.1); hatch.add(r); const top2 = mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 10, Math.PI), brass); top2.position.set(sx * 1.0, 2.2, 0.8); top2.rotation.y = Math.PI / 2; hatch.add(top2); }
  return { lamp, lantern, lens: spin, hatch, lid: lidP, LZ, update(t) { spin.rotation.y = t * 0.35; seaU(t); lantern.intensity = 10 * (1 + Math.sin(t * 13) * 0.04 + Math.sin(t * 7.3) * 0.03);
    bullseye.forEach(b => { b.material.opacity = 0.7 + Math.sin(t * 3) * 0.1; }); } };
}
