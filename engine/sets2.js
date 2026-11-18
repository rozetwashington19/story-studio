import * as THREE from 'three';
import { T, std, box, dayLight, interiorLight, room, repeatMat } from './sets.js';
import { noise } from './avatar.js';
import { clouds } from './clouds.js';

function tex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep); t.anisotropy = 8; return t;
}
const C = {};
const once = (k, f) => C[k] || (C[k] = f());
export const T2 = {
  lockers: () => once('lk', () => tex(512, 512, (x, w, h) => {
    for (let i = 0; i < 4; i++) {
      x.fillStyle = '#b8322c'; x.fillRect(i * 128 + 3, 0, 122, h);
      x.fillStyle = 'rgba(0,0,0,0.25)'; for (let v = 0; v < 5; v++) x.fillRect(i * 128 + 30, 40 + v * 14, 66, 6);
      x.fillStyle = '#d9d9d9'; x.fillRect(i * 128 + 100, 250, 10, 40);
      x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(i * 128, 0, 3, h);
    }
    noise(x, w, h, 0.4, 0.06);
  })),
  grass: () => once('gr', () => tex(512, 512, (x, w, h) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#4f9a3c' : '#5aa846'; x.fillRect(0, i * 64, w, 64); }
    for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(${30 + Math.random() * 40},${90 + Math.random() * 60},30,0.35)`; x.fillRect(Math.random() * w, Math.random() * h, 2, 5); }
  })),
  sand: () => once('sa', () => tex(512, 512, (x, w, h) => { x.fillStyle = '#d8c08a'; x.fillRect(0, 0, w, h); noise(x, w, h, 3, 0.18); })),
  siding: (col = '#e8e2d2') => once('si' + col, () => tex(512, 512, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    for (let i = 0; i < h; i += 32) { x.fillStyle = 'rgba(0,0,0,0.13)'; x.fillRect(0, i + 28, w, 4); x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(0, i, w, 3); }
    noise(x, w, h, 0.4, 0.05);
  })),
  fence: () => once('fe', () => tex(512, 512, (x, w, h) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = `hsl(28,${35 + Math.random() * 10}%,${52 + Math.random() * 8}%)`; x.fillRect(i * 64 + 2, 0, 60, h); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(i * 64, 0, 2, h); }
    noise(x, w, h, 0.5, 0.08);
  })),
  sign: (text, bg = '#7a3b2a', fg = '#ffe9c0', font = '700 150px Inter') => tex(1024, 256, (x, w, h) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = fg; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28);
    x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 8);
  }),
  hands: () => once('ha', () => tex(512, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(8,8,12,0.85)';
    const hand = (cx, cy, s, r) => { x.save(); x.translate(cx, cy); x.rotate(r); x.scale(s, s);
      x.beginPath(); x.roundRect(-30, -10, 60, 60, 14); x.fill();
      [[-26, -48], [-11, -58], [4, -56], [19, -46]].forEach(([fx, fy]) => { x.beginPath(); x.roundRect(fx, fy, 12, 46, 6); x.fill(); });
      x.beginPath(); x.roundRect(26, 0, 32, 12, 6); x.fill(); x.restore(); };
    hand(150, 210, 1.3, -0.2); hand(330, 180, 1.2, 0.25); hand(250, 360, 1.25, 0.05); hand(400, 330, 1.0, -0.4);
  })),
  calendar: () => tex(256, 320, (x, w, h) => {
    x.fillStyle = '#fafafa'; x.fillRect(0, 0, w, h); x.fillStyle = '#d33'; x.fillRect(0, 0, w, 60);
    x.fillStyle = '#fff'; x.font = '700 40px Inter'; x.textAlign = 'center'; x.fillText('MAX LEFT', w / 2, 44);
    x.fillStyle = '#333'; x.font = '600 26px Inter';
    for (let i = 0; i < 28; i++) { const c = i % 7, r = Math.floor(i / 7); x.fillText(String(i + 1), 22 + c * 35, 100 + r * 50); if (i < 20) { x.strokeStyle = '#c22'; x.lineWidth = 3; x.beginPath(); x.moveTo(8 + c * 35, 80 + r * 50); x.lineTo(36 + c * 35, 108 + r * 50); x.stroke(); } }
  }),
};
const M = (o) => std(o);

// ---------- set builders ----------
export function hallway(S) {
  room(S, { wallCol: 0xe8e0c8, floorTex: repeatMat(T.tiles(0xe9e4d8, 0xb9c4cc), 8, 6), zBack: -6, w: 30, d: 20 });
  interiorLight(S, { col: 0xfff6e8, pos: [0, 8, 0], intensity: 70, hemi: 1.3 });
  const lk = std({ map: repeatMat(T2.lockers(), 6, 1).map });
  box(S, [26, 6.5, 1.2], [0, 3.25, -5.4], lk, { r: 0, cast: false });
  box(S, [26, 0.3, 1.4], [0, 6.65, -5.3], M({ color: 0x8a2620 }), { r: 0.04, cast: false });
  box(S, [30, 1.2, 0.2], [0, 7.6, -5.9], M({ color: 0x3a6fb8 }), { r: 0, cast: false });
}
export function stage(S) {
  room(S, { wallCol: 0x6a3a8a, floorTex: repeatMat(T.planks(0xb07a48), 5, 3), zBack: -9, w: 24, d: 22 });
  S.add(new THREE.HemisphereLight(0xffe8d0, 0x302030, 1.0));
  const fr = new THREE.DirectionalLight(0xffe6c8, 1.6); fr.position.set(2, 8, 14); S.add(fr);
  const sp = new THREE.SpotLight(0xfff0d0, 2400, 0, 0.32, 0.5, 1.5); sp.position.set(0, 14, 6); sp.target.position.set(0, 2, -5); sp.castShadow = true; S.add(sp, sp.target);
  box(S, [14, 1.2, 6], [0, 0.6, -6], std({ map: T.planks(0x8a5530) }));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), std({ map: T2.sign('SPELLING BEE', '#1f2f6a', '#ffd84a'), emissive: 0x222222 }));
  sign.position.set(0, 7.2, -8.75); S.add(sign);
  for (let i = 0; i < 7; i++) box(S, [1.1, 7, 0.4], [-11 + i * 0.01, 4, -8.6 + i * 0.01], M({ color: 0x8a1a2a }), { r: 0, cast: false });
  box(S, [1.6, 7, 0.4], [-11, 4, -8.6], M({ color: 0x8a1a2a }), { r: 0, cast: false }); box(S, [1.6, 7, 0.4], [11, 4, -8.6], M({ color: 0x8a1a2a }), { r: 0, cast: false });
}
export function trophy(S, pos) {
  const g = new THREE.Group(); const gold = std({ color: 0xf2c234, metalness: 0.9, roughness: 0.25 });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.2, 0.7, 32), gold); cup.position.y = 0.75; g.add(cup);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12), gold); st.position.y = 0.3; g.add(st);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.6), std({ color: 0x222222 })); b.position.y = 0.09; g.add(b);
  g.position.set(...pos); g.traverse(m => m.castShadow = true); S.add(g); return g;
}
export function cafeteria(S) {
  room(S, { wallCol: 0xf0e2b8, floorTex: repeatMat(T.tiles(0xf2efe6, 0xd96b5a), 8, 6), zBack: -9, w: 26, d: 22 });
  interiorLight(S, { col: 0xfff6e8, pos: [0, 8, -2], intensity: 75, hemi: 1.3 });
  const win = std({ color: 0xd8ecff, emissive: 0xd8ecff, emissiveIntensity: 1.0 });
  for (const x of [-7, 0, 7]) box(S, [4.5, 3, 0.1], [x, 5.5, -8.85], win, { r: 0, cast: false });
  const tb = std({ color: 0xf4f4f4, roughness: 0.4 }), bench = std({ color: 0xc23a30 });
  box(S, [12, 0.25, 3], [0, 2.5, -2.5], tb); box(S, [12, 0.3, 1.0], [0, 1.4, -0.4], bench); box(S, [12, 0.3, 1.0], [0, 1.4, -4.6], bench);
  for (const x of [-4.5, -1.5, 1.5, 4.5]) {
    box(S, [1.8, 0.08, 1.2], [x, 2.67, -1.6], std({ color: 0xe8c040 }), { r: 0.03 });
    box(S, [0.6, 0.3, 0.5], [x - 0.4, 2.85, -1.6], std({ color: 0x8a5a2a }), { r: 0.1 });
    box(S, [0.4, 0.5, 0.4], [x + 0.5, 2.95, -1.6], std({ color: 0xfafafa }), { r: 0.05 });
  }
}
export function bus(S) {
  S.background = new THREE.Color(0x9ac8ff);
  S.add(new THREE.HemisphereLight(0xfff0d8, 0x605040, 1.4));
  const sun = new THREE.DirectionalLight(0xffdcae, 2.6); sun.position.set(-10, 8, 2); sun.castShadow = true; S.add(sun);
  box(S, [12, 0.3, 30], [0, -0.15, -5], std({ color: 0x3a3a3a, roughness: 0.9 }), { r: 0, cast: false });
  box(S, [0.4, 9, 30], [-5.2, 4.5, -5], std({ color: 0xf2c230 }), { r: 0, cast: false });
  box(S, [0.4, 9, 30], [5.2, 4.5, -5], std({ color: 0xf2c230 }), { r: 0, cast: false });
  box(S, [12, 0.3, 30], [0, 8.6, -5], std({ color: 0xf4f0e6 }), { r: 0, cast: false });
  const win = std({ color: 0xcfe8ff, emissive: 0xbfe0ff, emissiveIntensity: 1.1 });
  for (let z = -16; z < 8; z += 4.2) { box(S, [0.1, 2.6, 3.2], [-4.95, 5.2, z], win, { r: 0, cast: false }); box(S, [0.1, 2.6, 3.2], [4.95, 5.2, z], win, { r: 0, cast: false }); }
  const seat = std({ color: 0x2f5aa8, roughness: 0.7 });
  for (let z = -16; z < 6; z += 4.2) for (const x of [-2.9, 2.9]) { box(S, [3.6, 1.2, 1.8], [x, 1.6, z], seat, { r: 0.2 }); box(S, [3.6, 3.0, 0.5], [x, 3.0, z - 1.0], seat, { r: 0.2 }); }
}
export function airport(S) {
  S.background = new THREE.Color(0xbcd8f2);
  room(S, { wallCol: 0xdde3ea, floorTex: repeatMat(T.tiles(0xd4d8dc, 0xc2c7cc), 10, 8), zBack: -10, w: 34, d: 24, h: 12 });
  S.add(new THREE.HemisphereLight(0xeaf2ff, 0x707880, 1.5));
  const glass = std({ color: 0xbfe0ff, emissive: 0xa8d0f8, emissiveIntensity: 1.2 });
  box(S, [30, 8, 0.1], [0, 5, -9.7], glass, { r: 0, cast: false });
  for (let x = -15; x <= 15; x += 3) box(S, [0.25, 8, 0.3], [x, 5, -9.6], std({ color: 0x5a6068, metalness: 0.5 }), { r: 0, cast: false });
  const d = new THREE.DirectionalLight(0xfff2e0, 1.8); d.position.set(4, 10, -14); d.castShadow = true; S.add(d);
  airplane(S, [6, 4.0, -9.6], 0.9);
  const ch = std({ color: 0x2a4a7a });
  for (let i = 0; i < 6; i++) box(S, [1.4, 1.4, 1.4], [-10 + i * 1.6, 1.2, 1], ch, { r: 0.1 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), std({ map: T2.sign('GATE 12', '#202a34', '#ffcc33'), emissive: 0x333333 }));
  sign.position.set(-8, 9.5, -9.5); S.add(sign);
}
export function airplane(S, [x, y, z], s = 1) {
  const g = new THREE.Group(); const w = std({ color: 0xf6f6f6, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 9, 8, 24), w); body.rotation.z = Math.PI / 2; g.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 9), w); wing.position.set(-0.4, -0.3, 0); g.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.15), std({ color: 0x2a6ad8 })); tail.position.set(-4.6, 1.3, 0); g.add(tail);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 3.4), w); stab.position.set(-4.6, 0.2, 0); g.add(stab);
  const stripe = new THREE.Mesh(new THREE.CapsuleGeometry(0.92, 8.5, 4, 24, 1), std({ color: 0x2a6ad8 })); stripe.rotation.z = Math.PI / 2; stripe.scale.set(1, 1, 0.3); stripe.position.y = -0.15; g.add(stripe);
  g.position.set(x, y, z); g.scale.setScalar(s); S.add(g); return g;
}
export function ocean(S) {
  S.background = T.sky('#3a6fc8', '#ffcf9a'); S.fog = new THREE.Fog(0xf4cfa0, 60, 260); clouds(S);
  S.add(new THREE.HemisphereLight(0xcfe0ff, 0x204060, 1.0));
  const sun = new THREE.DirectionalLight(0xffd0a0, 2.2); sun.position.set(-20, 10, -40); S.add(sun);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(800, 800, 1, 1), std({ color: 0x1f5f9a, roughness: 0.15, metalness: 0.2 }));
  water.rotation.x = -Math.PI / 2; S.add(water);
  const sunDisk = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: 0xffe2b0, fog: false })); sunDisk.position.set(-40, 14, -230); S.add(sunDisk);
  return airplane(S, [0, 18, -40], 1.4);
}
export function bakery(S) {
  dayLight(S, { sunPos: [-8, 14, 10] });
  box(S, [60, 0.3, 30], [0, -0.15, 6], repeatMat(T.concrete(0xb9b2a7), 15, 8), { r: 0, cast: false });
  box(S, [26, 14, 1], [0, 7, -3], std({ map: T.brick(0x9a5a3a) }), { r: 0, cast: false });
  const glass = new THREE.MeshStandardMaterial({ color: 0x8aaac8, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.55 });
  box(S, [9, 5, 0.1], [0, 3.6, -2.4], glass, { r: 0, cast: false });
  box(S, [9.6, 5.6, 0.3], [0, 3.6, -2.55], std({ color: 0xf2efe6 }), { r: 0.04, cast: false });
  box(S, [9, 1.2, 1.4], [0, 1.0, -2.9], std({ color: 0xf2efe6 }), { r: 0.04, cast: false });
  for (const [x, c] of [[-3, 0xf2b5c8], [-1, 0xfff0d0], [1.2, 0x8a4a22], [3.2, 0xf2d070]]) { const ck = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.8, 32), std({ color: c })); ck.position.set(x, 2.0, -3.1); S.add(ck); }
  const hands = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: T2.hands(), transparent: true, depthWrite: false }));
  hands.position.set(0.5, 3.6, -2.33); S.add(hands);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), std({ map: T2.sign('BAKERY'), roughness: 0.6 })); sign.position.set(0, 7.5, -2.45); S.add(sign);
  const aw = std({ color: 0xd8483a }); box(S, [10, 0.2, 2.6], [0, 6.4, -1.4], aw, { r: 0.05, rot: [-0.25, 0, 0] });
}
export function field(S) {
  dayLight(S, { sunPos: [-10, 12, -8] });
  box(S, [120, 0.3, 120], [0, -0.15, -20], repeatMat(T2.grass(), 12, 12), { r: 0, cast: false });
  const wh = std({ color: 0xffffff });
  box(S, [0.3, 0.02, 60], [0, 0.02, -20], wh, { r: 0, cast: false });
  box(S, [0.4, 5, 0.4], [-6, 2.5, -24], wh, { r: 0.1 }); box(S, [0.4, 5, 0.4], [6, 2.5, -24], wh, { r: 0.1 }); box(S, [12.4, 0.4, 0.4], [0, 5, -24], wh, { r: 0.1 });
  const net = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide })); net.position.set(0, 2.5, -25.5); S.add(net);
  const fp = new THREE.MeshBasicMaterial({ color: 0x08080c, transparent: true, opacity: 0.8, depthWrite: false });
  for (let i = 0; i < 14; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), fp); f.rotation.x = -Math.PI / 2; f.position.set((i % 2 ? 0.7 : -0.7) + Math.sin(i * 0.5) * 2, 0.03, 4 - i * 2.2); f.rotation.z = Math.sin(i * 0.5) * 0.3; S.add(f); }
}
export function playground(S) {
  S.userData = S.userData || {}; S.userData.look = 'night';
  S.background = new THREE.Color(0x070a18); S.fog = new THREE.Fog(0x070a18, 20, 60);
  S.add(new THREE.HemisphereLight(0x5070c0, 0x101018, 0.75));
  const moon = new THREE.DirectionalLight(0x9ab0ff, 1.2); moon.position.set(-8, 14, 10); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18 }); S.add(moon);
  const spot = new THREE.SpotLight(0xffd7a0, 420, 0, 0.6, 0.6, 1.4); spot.position.set(3, 11, 6); spot.target.position.set(0, 2.5, -6); spot.castShadow = true; S.add(spot, spot.target);
  box(S, [80, 0.3, 60], [0, -0.15, 0], repeatMat(T2.sand(), 10, 8), { r: 0, cast: false });
  box(S, [24, 6, 1], [0, 3, -6.5], std({ map: repeatMat(T.concrete(0xc8c0b4), 4, 1).map }), { r: 0.05, cast: false });
  box(S, [24.4, 0.4, 1.4], [0, 6.2, -6.5], std({ color: 0xa8a094 }), { r: 0.05, cast: false });
  const met = std({ color: 0xc23a30, metalness: 0.4, roughness: 0.5 });
  for (const x of [-5, 5]) { box(S, [0.35, 9, 0.35], [x, 4.0, -1.3], met, { r: 0.1, rot: [0.18, 0, 0] }); box(S, [0.35, 9, 0.35], [x, 4.0, 1.3], met, { r: 0.1, rot: [-0.18, 0, 0] }); }
  box(S, [10.6, 0.4, 0.4], [0, 8.4, 0], met, { r: 0.1 });
  const chain = std({ color: 0x999999, metalness: 0.8 }), seatM = std({ color: 0x222222 });
  const swings = [];
  for (const x of [-2.4, 2.4]) {
    const g = new THREE.Group(); g.position.set(x, 8.4, 0);
    for (const dx of [-0.8, 0.8]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 6.4, 6), chain); c.position.set(dx, -3.2, 0); g.add(c); }
    const st = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 0.9), seatM); st.position.y = -6.4; st.castShadow = true; g.add(st);
    S.add(g); swings.push(g);
  }
  const key = new THREE.PointLight(0xffd2a0, 28, 14, 1.6); key.position.set(-1.5, 5.5, -0.5); S.add(key);
  const key2 = new THREE.PointLight(0xffc89a, 16, 9, 1.6); key2.position.set(0.6, 4.6, -5.0); S.add(key2);
  const lp = std({ color: 0x2a2c30, metalness: 0.5 }); box(S, [0.3, 9, 0.3], [9, 4.5, -3], lp, { r: 0.05 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2a8 })); bulb.position.set(9, 9.1, -3); S.add(bulb);
  const pl = new THREE.PointLight(0xffc880, 30, 18, 2); pl.position.set(9, 8.8, -2.4); S.add(pl);
  return swings;
}
export function porch(S) {
  S.userData = S.userData || {}; S.userData.look = 'night';
  S.background = new THREE.Color(0x070a18);
  S.add(new THREE.HemisphereLight(0x4a60a8, 0x101018, 0.6));
  const moon = new THREE.DirectionalLight(0x8aa0ff, 0.8); moon.position.set(-8, 14, 10); S.add(moon);
  box(S, [40, 14, 1], [0, 7, -4], std({ map: repeatMat(T2.siding('#e4dccb'), 4, 2).map }), { r: 0, cast: false });
  box(S, [16, 0.6, 7], [0, 0.3, -0.6], std({ map: repeatMat(T.planks(0x8a6a4a), 2, 1).map }), { r: 0.03, cast: false });
  box(S, [40, 0.3, 30], [0, -0.15, 10], repeatMat(T2.grass(), 6, 4), { r: 0, cast: false });
  box(S, [3, 6.6, 0.3], [-4.5, 3.9, -3.45], std({ map: T.planks(0x7a2f2a) }), { r: 0.04, cast: false });
  box(S, [3.5, 7.1, 0.25], [-4.5, 3.9, -3.5], std({ color: 0xf6f2ea }), { r: 0.04, cast: false });
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.5), new THREE.MeshBasicMaterial({ color: 0xffe2a0 })); glow.position.set(-2.3, 6.4, -3.2); S.add(glow);
  const pl = new THREE.PointLight(0xffc070, 110, 0, 1.4); pl.position.set(-2.3, 6.2, 0.5); pl.castShadow = true; pl.shadow.mapSize.set(1024, 1024); S.add(pl);
  const pf = new THREE.PointLight(0x9ab0ff, 12, 14, 1.6); pf.position.set(0, 5.5, 5); S.add(pf);
  box(S, [3.2, 2.6, 0.2], [4.5, 5, -3.45], std({ color: 0xffd890, emissive: 0xffb860, emissiveIntensity: 0.9 }), { r: 0, cast: false });
  box(S, [3.6, 3.0, 0.15], [4.5, 5, -3.5], std({ color: 0xf6f2ea }), { r: 0, cast: false });
  for (let x = -7.5; x <= 7.5; x += 1) box(S, [0.2, 2.2, 0.2], [x, 1.7, 2.7], std({ color: 0xf6f2ea }), { r: 0.04 });
  box(S, [15.4, 0.25, 0.35], [0, 2.8, 2.7], std({ color: 0xf6f2ea }), { r: 0.04 });
}
export function backyard(S) {
  dayLight(S, { sunPos: [-6, 10, 12], intensity: 3.6 });
  box(S, [80, 0.3, 60], [0, -0.15, 0], repeatMat(T2.grass(), 10, 8), { r: 0, cast: false });
  box(S, [40, 6, 0.5], [0, 3, -5], std({ map: repeatMat(T2.fence(), 5, 1).map }), { r: 0, cast: false });
  box(S, [40, 0.3, 0.7], [0, 6.1, -5], std({ color: 0x9a6a42 }), { r: 0.04, cast: false });
  const blanket = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), std({ map: T2.sign('', '#d84a4a', '#ffffff').clone() }));
  const bt = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#e05050' : '#f4efe6'; x.fillRect(i * 32, j * 32, 32, 32); } return c; })());
  bt.colorSpace = THREE.SRGBColorSpace; blanket.material = std({ map: bt }); blanket.rotation.x = -Math.PI / 2; blanket.position.set(0, 0.03, 1); blanket.receiveShadow = true; S.add(blanket);
  const trunk = std({ color: 0x6a4428 }), leaf = std({ color: 0x3f8a3a });
  box(S, [1, 8, 1], [-13, 4, -8], trunk, { r: 0.1 });
  for (const [x, y, z, s] of [[-13, 9, -8, 5], [-11.5, 8, -7, 3.5], [-14.5, 8.2, -7.5, 3.5]]) box(S, [s, s * 0.8, s], [x, y, z], leaf, { r: 1.0 });
}
export function closetAndFridge(S) {
  // used inside bedroom/kitchen variants
}
