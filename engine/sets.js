import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { noise } from './avatar.js';

function tex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep); t.anisotropy = 8; return t;
}
const cache = {};
function once(key, f) { return cache[key] || (cache[key] = f()); }
const hx = c => '#' + new THREE.Color(c).getHexString();
const sh = (c, f) => { const k = new THREE.Color(c); k.multiplyScalar(f); return '#' + k.getHexString(); };

export const T = {
  brick: (col = 0xa04030) => once('brick' + col, () => tex(512, 512, (x, w, h) => {
    x.fillStyle = '#cfc6b8'; x.fillRect(0, 0, w, h);
    const bh = 32, bw = 96;
    for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
      const k = 0.85 + Math.random() * 0.25; x.fillStyle = sh(col, k);
      x.fillRect(c * bw + (r % 2) * bw / 2 + 3, r * bh + 3, bw - 6, bh - 6);
    }
    noise(x, w, h, 0.6, 0.1);
  })),
  planks: (col = 0x9a6a40) => once('pl' + col, () => tex(512, 512, (x, w, h) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = sh(col, 0.85 + Math.random() * 0.25); x.fillRect(0, i * 64, w, 64); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, i * 64, w, 2);
      x.fillRect((i * 173) % w, i * 64, 2, 64); }
    for (let i = 0; i < 300; i++) { x.strokeStyle = 'rgba(60,30,10,0.12)'; x.beginPath(); const y = Math.random() * h; x.moveTo(0, y); x.bezierCurveTo(w / 3, y + 6, 2 * w / 3, y - 6, w, y); x.stroke(); }
    noise(x, w, h, 0.4, 0.06);
  })),
  tiles: (a = 0xe8e2d6, b = 0xc9c1b2) => once('ti' + a + b, () => tex(256, 256, (x, w, h) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? hx(a) : hx(b); x.fillRect(i * 64, j * 64, 64, 64); }
    noise(x, w, h, 0.4, 0.05);
  })),
  concrete: (col = 0xb5aea4) => once('co' + col, () => tex(512, 512, (x, w, h) => {
    x.fillStyle = hx(col); x.fillRect(0, 0, w, h); noise(x, w, h, 1.2, 0.08);
    x.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < w; i += 128) { x.fillRect(i, 0, 2, h); x.fillRect(0, i, w, 2); }
  })),
  asphalt: () => once('as', () => tex(512, 512, (x, w, h) => { x.fillStyle = '#3a3a3e'; x.fillRect(0, 0, w, h); noise(x, w, h, 2, 0.15); })),
  plaster: (col) => once('pla' + col, () => tex(256, 256, (x, w, h) => { x.fillStyle = hx(col); x.fillRect(0, 0, w, h); noise(x, w, h, 0.8, 0.05); })),
  facade: (col) => once('fa' + col, () => tex(512, 512, (x, w, h) => {
    x.fillStyle = hx(col); x.fillRect(0, 0, w, h);
    for (let r = 0; r < 16; r++) { x.fillStyle = 'rgba(0,0,0,0.06)'; x.fillRect(0, r * 32, w, 2); }
    noise(x, w, h, 0.8, 0.08);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const X = 70 + i * 250, Y = 60 + j * 250;
      x.fillStyle = '#eeeae0'; x.fillRect(X - 10, Y - 10, 140, 180);
      const g = x.createLinearGradient(X, Y, X + 120, Y + 160); g.addColorStop(0, '#5b7fa8'); g.addColorStop(0.5, '#2c4466'); g.addColorStop(1, '#1d2d45');
      x.fillStyle = g; x.fillRect(X, Y, 120, 160);
      x.fillStyle = '#eeeae0'; x.fillRect(X + 57, Y, 6, 160); x.fillRect(X, Y + 75, 120, 6);
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.moveTo(X + 10, Y + 70); x.lineTo(X + 45, Y); x.lineTo(X + 55, Y); x.lineTo(X + 20, Y + 70); x.fill();
      x.fillStyle = '#d8d2c4'; x.fillRect(X - 16, Y + 168, 152, 14);
    }
  })),
  chalkboard: (lines) => tex(1024, 512, (x, w, h) => {
    x.fillStyle = '#21402f'; x.fillRect(0, 0, w, h); noise(x, w, h, 0.6, 0.1);
    x.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) x.fillRect(Math.random() * w, Math.random() * h, 200, 30);
    x.fillStyle = '#f2efe6'; x.textAlign = 'center';
    lines.forEach(([t, size, y]) => { x.font = `600 ${size}px "Inter", sans-serif`; x.fillText(t, w / 2, y); });
  }),
  sky: (top, bot) => tex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, w, h); }),
};

export function std(opts) { return new THREE.MeshStandardMaterial({ roughness: 0.85, ...opts }); }
export function box(scene, [w, h, d], [x, y, z], mat, { r = 0.03, cast = true, rot, solid = true, name } = {}) {
  const g = r ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true;
  if (rot) m.rotation.set(...rot); m.userData.solid = solid; m.name = name || `box ${w}x${h}x${d} @${[x, y, z].map(v => +v.toFixed(1))}`; scene.add(m); return m;
}
function repeatMat(t, rx, ry, extra = {}) { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return std({ map: c, ...extra }); }

// ---------- lighting ----------
export function dayLight(S, { sunPos = [-8, 14, 10], intensity = 3.4, hemi = 0.85, area = 18 } = {}) {
  S.background = T.sky('#4f86d8', '#ffd9b0');
  S.fog = new THREE.Fog(0xf2d2b0, 35, 105);
  S.add(new THREE.HemisphereLight(0xbcd4ff, 0x6a5040, hemi));
  const rim = new THREE.DirectionalLight(0xffc890, 1.6); rim.position.set(sunPos[0] * -0.6, 7, -12); S.add(rim);
  const fill = new THREE.DirectionalLight(0x9ab8ff, 0.35); fill.position.set(8, 4, 10); S.add(fill);
  sunPos = [sunPos[0], sunPos[1] * 0.72, sunPos[2]];
  const sun = new THREE.DirectionalLight(0xffdcae, intensity); sun.position.set(...sunPos); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 80 }); S.add(sun); S.add(sun.target);
  return sun;
}
export function interiorLight(S, { col = 0xffe2b8, pos = [0, 7.5, -3], intensity = 60, hemiSky = 0xfff3e0, hemiGround = 0x6a5040, hemi = 1.1 } = {}) {
  S.add(new THREE.HemisphereLight(hemiSky, hemiGround, hemi * 0.7));
  const rim = new THREE.DirectionalLight(0x9ab8ff, 0.9); rim.position.set(6, 6, -10); S.add(rim);
  const p = new THREE.PointLight(col, intensity * 1.15, 0, 1.6); p.position.set(...pos); p.castShadow = true; p.shadow.mapSize.set(1024, 1024); p.shadow.bias = -0.002; S.add(p);
  return p;
}

// ---------- sets ----------
export function street(S, { farBuildings = true, near = false } = {}) {
  box(S, [120, 0.3, 40], [0, -0.15, 6], repeatMat(T.concrete(0xb9b2a7), 30, 10), { r: 0, cast: false });
  box(S, [120, 0.3, 14], [0, -0.25, -11], repeatMat(T.asphalt(), 30, 4), { r: 0, cast: false });
  const curb = std({ color: 0xd8d2c8 });
  box(S, [120, 0.35, 0.5], [0, -0.05, -3.9], curb, { r: 0.05, cast: false });
  const line = std({ color: 0xf0c430 });
  for (let x = -50; x < 50; x += 7) box(S, [3, 0.02, 0.35], [x, -0.09, -11], line, { r: 0, cast: false });
  box(S, [120, 0.3, 10], [0, -0.15, -23], repeatMat(T.concrete(0xb9b2a7), 30, 3), { r: 0, cast: false });
  if (farBuildings) {
    const cols = [0xa84a3a, 0x3f7f8c, 0xd8c48f, 0x8a5a86, 0x5f8a55, 0xc76b2e, 0x6d7fa8];
    let x = -50, i = 0;
    while (x < 50) {
      const w = 9 + (i * 3) % 4, h = 11 + (i * 5) % 9, col = cols[i % cols.length];
      const side = std({ map: T.plaster(col) }), front = repeatMat(T.facade(col), w / 6, h / 6);
      const g = new RoundedBoxGeometry(w - 0.25, h, 6, 2, 0.08);
      const m = new THREE.Mesh(g, [side, side, side, side, front, side]); m.position.set(x + w / 2, h / 2, -30); m.castShadow = m.receiveShadow = true; S.add(m);
      box(S, [w - 0.1, 0.5, 6.4], [x + w / 2, h + 0.25, -30], std({ color: 0xe8e2d4 }), { r: 0.05 });
      x += w; i++;
    }
  }
  const pole = std({ color: 0x2a2c30, metalness: 0.5, roughness: 0.4 });
  for (const x of [-16, 2, 20]) {
    box(S, [0.3, 7, 0.3], [x, 3.5, -3.2], pole, { r: 0.05 });
    box(S, [0.9, 0.45, 1.2], [x, 7.1, -2.8], pole, { r: 0.1 });
    box(S, [0.6, 0.1, 0.8], [x, 6.86, -2.7], std({ color: 0xfff3c0, emissive: 0xffe9a0, emissiveIntensity: 0.6 }), { r: 0, cast: false });
  }
  // a couple of planters / hydrant for detail
  box(S, [0.6, 1.0, 0.6], [-7, 0.5, -2.6], std({ color: 0xc2302a, roughness: 0.4 }), { r: 0.2 });
  box(S, [2.2, 0.9, 1.0], [9, 0.45, -2.8], std({ color: 0x7a5236 }), { r: 0.05 });
  box(S, [2.0, 0.6, 0.8], [9, 1.1, -2.8], std({ color: 0x3f8a3a }), { r: 0.3 });
}
export function wall(S, col = 0xa04030, z = -2.5) {
  const m = repeatMat(T.brick(col), 6, 3);
  box(S, [30, 14, 1], [0, 7, z - 0.5], m, { r: 0, cast: false });
  box(S, [30, 0.6, 1.4], [0, 14.2, z - 0.4], std({ color: 0xd8d0c0 }), { r: 0.05, cast: false });
  box(S, [60, 0.3, 30], [0, -0.15, z + 14], repeatMat(T.concrete(0xb9b2a7), 15, 8), { r: 0, cast: false });
  box(S, [30, 0.4, 0.3], [0, 0.2, z + 0.1], std({ color: 0x8c8378 }), { r: 0.05, cast: false });
}
export function room(S, { w = 18, d = 14, h = 9, wallCol = 0xd9d2c0, floorTex, trim = 0xf2f0ea, zBack = -9 } = {}) {
  const fm = floorTex || repeatMat(T.planks(), 3, 3);
  box(S, [w, 0.3, d], [0, -0.15, zBack + d / 2], fm, { r: 0, cast: false });
  const wm = std({ map: T.plaster(wallCol) });
  box(S, [w, h, 0.4], [0, h / 2, zBack - 0.2], wm, { r: 0, cast: false });
  box(S, [0.4, h, d], [-w / 2, h / 2, zBack + d / 2], wm, { r: 0, cast: false });
  box(S, [0.4, h, d], [w / 2, h / 2, zBack + d / 2], wm, { r: 0, cast: false });
  box(S, [w, 0.3, d], [0, h + 0.15, zBack + d / 2], std({ color: 0xf4f2ee }), { r: 0, cast: false });
  const tm = std({ color: trim });
  box(S, [w, 0.6, 0.15], [0, 0.3, zBack + 0.05], tm, { r: 0.03, cast: false });
  box(S, [w, 0.25, 0.15], [0, h - 0.2, zBack + 0.05], tm, { r: 0.03, cast: false });
}
export { repeatMat };
