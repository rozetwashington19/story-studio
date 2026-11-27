import * as THREE from 'three';
import { outfit } from './outfits.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { hairGeometry, beardGeometry, hashStr, COILY } from './hair.js';
export { HAIR_STYLES, HAIR_COLORS, BEARDS } from './hair.js';

export const D = Math.PI / 180;
const loader = new THREE.TextureLoader();
const faceTex = {};
export function loadFaces(names) {
  return Promise.all(names.map(n => new Promise(res => loader.load(`faces/${n}.png`, t => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; faceTex[n] = t; res();
  }))));
}

// ---------- procedural textures ----------
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8; return t;
}
export function noise(ctx, w, h, amt, alpha = 0.08) {
  for (let i = 0; i < w * h * amt; i++) {
    const v = Math.random() < 0.5 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha * Math.random()})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
}
const hex = c => '#' + new THREE.Color(c).getHexString();
const shade = (c, f) => { const k = new THREE.Color(c); k.multiplyScalar(f); return '#' + k.getHexString(); };

export function fabricTex(col, style = 'plain') {
  return canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = hex(col); x.fillRect(0, 0, w, h);
    noise(x, w, h, 0.5, 0.07);
    for (let i = 0; i < h; i += 3) { x.fillStyle = 'rgba(0,0,0,0.025)'; x.fillRect(0, i, w, 1); }
    if (style === 'hoodie') {   // front of torso: pocket, strings, collar
      x.fillStyle = shade(col, 0.82); x.fillRect(48, 150, 160, 70);
      x.strokeStyle = shade(col, 0.6); x.lineWidth = 3; x.strokeRect(48, 150, 160, 70);
      x.fillStyle = '#f2f2f2'; x.fillRect(100, 10, 8, 70); x.fillRect(148, 10, 8, 60);
      x.fillStyle = shade(col, 0.7); x.beginPath(); x.ellipse(128, 0, 70, 28, 0, 0, Math.PI); x.fill();
    }
    if (style === 'shirt') {    // collar + buttons
      x.fillStyle = shade(col, 0.75); x.beginPath(); x.moveTo(80, 0); x.lineTo(128, 50); x.lineTo(176, 0); x.fill();
      x.fillStyle = '#f5f5f5'; x.beginPath(); x.moveTo(95, 0); x.lineTo(128, 38); x.lineTo(161, 0); x.fill();
      x.fillStyle = shade(col, 0.55); for (let y = 70; y < 240; y += 40) { x.beginPath(); x.arc(128, y, 6, 0, 7); x.fill(); }
      x.fillStyle = shade(col, 0.85); x.fillRect(126, 40, 4, 216);
    }
    if (style === 'blazer') {
      x.fillStyle = '#f0f0f0'; x.beginPath(); x.moveTo(90, 0); x.lineTo(128, 120); x.lineTo(166, 0); x.fill();
      x.fillStyle = shade(col, 0.6); x.beginPath(); x.moveTo(70, 0); x.lineTo(118, 140); x.lineTo(100, 0); x.fill();
      x.beginPath(); x.moveTo(186, 0); x.lineTo(138, 140); x.lineTo(156, 0); x.fill();
      x.fillStyle = '#c9a640'; x.beginPath(); x.arc(128, 175, 7, 0, 7); x.fill();
    }
    if (style === 'tee') {
      x.fillStyle = shade(col, 0.75); x.beginPath(); x.ellipse(128, 0, 50, 24, 0, 0, Math.PI); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = 'bold 70px Inter, sans-serif'; x.textAlign = 'center'; x.fillText('★', 128, 150);
    }
    if (style.startsWith('jersey')) {   // soccer kit: white V-collar + big number (style 'jersey7' -> number 7)
      x.fillStyle = shade(col, 0.6); x.fillRect(0, 0, 26, h); x.fillRect(w - 26, 0, 26, h);
      x.fillStyle = '#f6f6f2'; x.beginPath(); x.moveTo(86, 0); x.lineTo(128, 56); x.lineTo(170, 0); x.lineTo(152, 0); x.lineTo(128, 34); x.lineTo(104, 0); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.95)'; x.font = '900 120px Inter, sans-serif'; x.textAlign = 'center'; x.fillText(style.slice(6) || '7', 128, 200);
    }
    if (style === 'stripes') { x.fillStyle = shade(col, 0.55); for (let y = 0; y < h; y += 44) x.fillRect(0, y, w, 18); }
    if (style === 'plaid') { x.fillStyle = 'rgba(0,0,0,0.28)'; for (let i = 0; i < w; i += 64) { x.fillRect(i, 0, 22, h); x.fillRect(0, i, w, 22); }
      x.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 40; i < w; i += 64) { x.fillRect(i, 0, 4, h); x.fillRect(0, i, w, 4); } }
    if (style === 'jacket') { x.fillStyle = shade(col, 0.7); x.fillRect(122, 0, 12, h); x.fillStyle = '#c8c8c8'; for (let y = 6; y < h; y += 14) x.fillRect(125, y, 6, 7);
      x.fillStyle = shade(col, 0.8); x.fillRect(30, 150, 70, 50); x.fillRect(156, 150, 70, 50); x.fillStyle = shade(col, 0.6); x.beginPath(); x.ellipse(128, 0, 72, 30, 0, 0, Math.PI); x.fill(); }
    if (style === 'sweater') { x.strokeStyle = shade(col, 0.75); x.lineWidth = 3; for (let y = 10; y < h; y += 18) for (let xx = 0; xx < w; xx += 18) { x.beginPath(); x.moveTo(xx, y); x.lineTo(xx + 9, y + 9); x.lineTo(xx + 18, y); x.stroke(); }
      x.fillStyle = shade(col, 0.6); x.fillRect(0, 100, w, 26); x.fillStyle = '#f2f2f2'; for (let xx = 8; xx < w; xx += 32) { x.beginPath(); x.moveTo(xx, 120); x.lineTo(xx + 8, 106); x.lineTo(xx + 16, 120); x.fill(); } }
    if (style === 'uniform') { x.fillStyle = shade(col, 0.75); x.fillRect(36, 60, 64, 52); x.fillRect(156, 60, 64, 52); x.fillStyle = shade(col, 0.55); for (let y = 40; y < 240; y += 44) { x.beginPath(); x.arc(128, y, 6, 0, 7); x.fill(); }
      x.fillStyle = '#f2c420'; x.beginPath(); x.arc(190, 40, 14, 0, 7); x.fill(); x.fillStyle = shade(col, 0.6); x.beginPath(); x.moveTo(80, 0); x.lineTo(128, 40); x.lineTo(176, 0); x.fill(); }
    if (style === 'spacesuit') { x.fillStyle = '#e8eaee'; x.fillRect(0, 0, w, h); noise(x, w, h, 0.4, 0.05); x.fillStyle = hex(col); x.fillRect(0, 170, w, 26); x.fillRect(150, 40, 70, 40);
      x.fillStyle = '#3a6ae8'; x.fillRect(40, 60, 60, 40); x.fillStyle = '#e8302a'; x.fillRect(46, 66, 14, 10); x.fillStyle = '#9aa0a8'; x.fillRect(110, 110, 36, 36); }
    if (style === 'knight') { x.fillStyle = shade(col, 0.6); x.fillRect(0, 0, w, h); x.fillStyle = hex(col); x.fillRect(96, 0, 64, h); x.fillRect(0, 96, w, 64); x.fillStyle = '#f2c420'; x.beginPath(); x.arc(128, 128, 22, 0, 7); x.fill(); }
    // hawaiian (hibiscus print), flamingo (faded flamingo print), polo (collar + chest logo). '*Side' = print without the collar (sides/back).
    if (style.startsWith('hawaiian') || style.startsWith('flamingo')) { const fl = style.startsWith('flamingo'); let sd = 7;
      const R = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 14; i++) { const cx = R() * w, cy = R() * h, r = 14 + R() * 10;
        if (!fl) { x.fillStyle = 'rgba(40,110,60,0.75)'; x.beginPath(); x.ellipse(cx + r, cy + 6, r * 1.1, r * 0.45, 0.6, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx - r, cy - 4, r * 1.0, r * 0.4, -0.5, 0, 7); x.fill();
          x.fillStyle = i % 2 ? 'rgba(255,245,235,0.92)' : 'rgba(255,214,90,0.92)'; for (let k = 0; k < 5; k++) { const a = k * 1.256; x.beginPath(); x.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.55, r * 0.32, a, 0, 7); x.fill(); }
          x.fillStyle = 'rgba(230,80,60,0.95)'; x.beginPath(); x.arc(cx, cy, r * 0.22, 0, 7); x.fill(); }
        else { x.fillStyle = 'rgba(255,150,190,0.55)'; x.beginPath(); x.ellipse(cx, cy, r * 0.8, r * 0.5, 0.2, 0, 7); x.fill(); x.fillRect(cx - 1, cy + r * 0.4, 3, r * 1.4);
          x.strokeStyle = 'rgba(255,150,190,0.55)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx + r * 0.6, cy - 2); x.quadraticCurveTo(cx + r * 1.2, cy - r * 1.6, cx + r * 0.5, cy - r * 1.4); x.stroke();
          x.fillStyle = 'rgba(80,140,110,0.35)'; x.beginPath(); x.ellipse(cx - r * 1.2, cy + r, r * 0.9, r * 0.3, -0.7, 0, 7); x.fill(); } }
      if (!style.endsWith('Side')) { x.fillStyle = shade(col, 0.8); x.beginPath(); x.moveTo(70, 0); x.lineTo(128, 70); x.lineTo(186, 0); x.fill();
        x.fillStyle = '#f4f0e8'; x.beginPath(); x.moveTo(100, 0); x.lineTo(128, 46); x.lineTo(156, 0); x.fill(); x.fillStyle = shade(col, 0.7); x.fillRect(126, 60, 4, 196); }
    }
    if (style === 'polo') { x.fillStyle = shade(col, 0.7); x.beginPath(); x.moveTo(84, 0); x.lineTo(128, 30); x.lineTo(172, 0); x.fill(); x.fillStyle = '#f4f4f4'; x.fillRect(122, 20, 12, 60);
      x.fillStyle = shade(col, 0.5); for (let y = 34; y < 80; y += 18) { x.beginPath(); x.arc(128, y, 4, 0, 7); x.fill(); }
      x.fillStyle = '#ffe23a'; x.fillRect(158, 66, 50, 30); x.fillStyle = '#ff3ab8'; x.font = 'bold 24px Inter, sans-serif'; x.textAlign = 'center'; x.fillText('PP', 183, 90); }
    if (style === 'jeans') {
      x.fillStyle = shade(col, 0.7); x.fillRect(0, 0, w, 26);
      x.strokeStyle = 'rgba(230,180,90,0.7)'; x.setLineDash([6, 5]); x.lineWidth = 2;
      x.beginPath(); x.moveTo(0, 30); x.lineTo(w, 30); x.stroke();
      x.beginPath(); x.moveTo(30, 60); x.quadraticCurveTo(80, 110, 128, 60); x.stroke();
    }
  });
}

// ---------- head: classic rounded cylinder ----------
export const HEAD = { R: 0.62, H: 1.22, rr: 0.34 };
function headGeometry({ R, H, rr } = HEAD) {
  const pts = []; const n = 12;
  pts.push(new THREE.Vector2(0.0001, -H / 2));
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - rr + rr * Math.cos(a), -H / 2 + rr + rr * Math.sin(a))); }
  const yA = -H / 2 + rr, yB = H / 2 - rr;           // straight side, subdivided so the face texture bends smoothly
  for (let i = 1; i < 12; i++) pts.push(new THREE.Vector2(R, yA + (yB - yA) * i / 12));
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - rr + rr * Math.cos(a), H / 2 - rr + rr * Math.sin(a))); }
  pts.push(new THREE.Vector2(0.0001, H / 2));
  // phiStart = PI puts the lathe seam at the BACK of the head (u = 0.5 is the front, +Z)
  const g = new THREE.LatheGeometry(pts, 96, Math.PI, Math.PI * 2);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, (pos.getY(i) + H / 2) / H);   // v = height, so the face isn't stretched
  uv.needsUpdate = true; g.computeVertexNormals();
  // weld normals across the seam (first and last ring are the same vertices)
  const nrm = g.attributes.normal, rows = pts.length;
  for (let j = 0; j < rows; j++) { const a = j, b = 96 * rows + j;
    const x = (nrm.getX(a) + nrm.getX(b)) / 2, y = (nrm.getY(a) + nrm.getY(b)) / 2, z = (nrm.getZ(a) + nrm.getZ(b)) / 2;
    nrm.setXYZ(a, x, y, z); nrm.setXYZ(b, x, y, z); }
  return g;
}
// Skin texture with the face painted on (cylindrical mapping like a real Roblox head). Cached per skin+face.
const faceSkinCache = {};
const FACE_U = 0.27, FACE_V = 0.86, FACE_VC = 0.515;    // face width/height in UV units, vertical center
// details: { wrinkles (older characters), freckles, rosy } painted under the expression, so every face keeps them
// ---- facial animation (owner 2026-11-25): blinks + mouth flaps are painted variants of each face ----
// faceParts(face) finds the eyes (two halves of the eye band) and the mouth in the 512px face PNG; mods: 'b' = eyes closed (blink), 'o' = mouth open (talking)
const facePartsCache = {};
function faceParts(face) {
  if (facePartsCache[face]) return facePartsCache[face];
  const img = faceTex[face] && faceTex[face].image; if (!img) return null;
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 512, 512);
  const d = x.getImageData(0, 0, 512, 512).data;
  const bbox = (x0, x1, y0, y1) => { let a = [1e9, -1, 1e9, -1];
    for (let y = y0; y < y1; y++) for (let xx = x0; xx < x1; xx++) { const i = (y * 512 + xx) * 4; if (d[i + 3] < 140) continue; if (d[i + 2] > d[i] + 50 && d[i + 2] > 120) continue;   // skip blue tears
      if (xx < a[0]) a[0] = xx; if (xx > a[1]) a[1] = xx; if (y < a[2]) a[2] = y; if (y > a[3]) a[3] = y; }
    return a[1] < 0 ? null : a; };
  return (facePartsCache[face] = { eyes: [bbox(90, 256, 172, 262), bbox(256, 422, 172, 262)].filter(Boolean), mouth: bbox(140, 372, 282, 420) });
}
function paintMods(x, skinHex, face, mods) {
  const P = faceParts(face); if (!P) return; const sk = hex(skinHex), ink = '#1e1412';
  if (mods.includes('b')) for (const [x0, x1, y0, y1] of P.eyes) {
    x.fillStyle = sk; x.beginPath(); x.roundRect(x0 - 7, y0 - 5, x1 - x0 + 14, y1 - y0 + 10, 12); x.fill();
    const cy = (y0 + y1) / 2 + 4, w = x1 - x0; x.strokeStyle = ink; x.lineCap = 'round'; x.lineWidth = Math.max(9, Math.min(16, w * 0.16));
    x.beginPath(); x.moveTo(x0 + w * 0.05, cy - 2); x.quadraticCurveTo((x0 + x1) / 2, cy + Math.min(18, w * 0.22), x1 - w * 0.05, cy - 2); x.stroke(); }
  if (mods.includes('o') && P.mouth) { const [x0, x1, y0, y1] = P.mouth, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 2, w = x1 - x0;
    x.fillStyle = sk; x.beginPath(); x.roundRect(x0 - 7, y0 - 6, w + 14, y1 - y0 + 12, 14); x.fill();
    const rx = Math.max(30, Math.min(62, w * 0.36)), ry = rx * 0.72;
    x.fillStyle = '#2a0c10'; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill();
    x.save(); x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.clip(); x.fillStyle = '#d8566e'; x.beginPath(); x.ellipse(cx, cy + ry * 0.75, rx * 0.7, ry * 0.55, 0, 0, 7); x.fill();
    x.fillStyle = '#f4f0ea'; x.fillRect(cx - rx * 0.6, cy - ry - 2, rx * 1.2, ry * 0.32); x.restore(); }
}
function faceSkinTex(skinHex, face, det = {}, mods = '') {
  const key = skinHex + '|' + face + '|' + (det.wrinkles ? 'w' : '') + (det.freckles ? 'f' : '') + (det.rosy ? 'r' : '') + '|' + mods;
  if (faceSkinCache[key]) return faceSkinCache[key];
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const x = c.getContext('2d');
  x.fillStyle = hex(skinHex); x.fillRect(0, 0, c.width, c.height);
  noise(x, c.width, c.height, 0.08, 0.035);
  const img = faceTex[face] && faceTex[face].image;
  if (img) {
    const w = FACE_U * c.width, h = FACE_V * c.height;
    x.imageSmoothingQuality = 'high';
    const fx = (0.5 - FACE_U / 2) * c.width, fy = (1 - FACE_VC - FACE_V / 2) * c.height;
    x.save(); x.translate(fx, fy); x.scale(w / 512, h / 512);   // draw details in the 512x512 face-image space
    const dk = shade(skinHex, 0.72); x.strokeStyle = dk; x.lineCap = 'round';
    if (det.rosy) for (const cx of [128, 384]) { const g = x.createRadialGradient(cx, 275, 0, cx, 275, 48); g.addColorStop(0, 'rgba(235,110,120,0.35)'); g.addColorStop(1, 'rgba(235,110,120,0)'); x.fillStyle = g; x.fillRect(cx - 50, 225, 100, 100); }
    if (det.freckles) { x.fillStyle = shade(skinHex, 0.68); let sd = 3; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (const cx of [150, 362]) for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(cx + (r() - 0.5) * 70, 262 + (r() - 0.5) * 36, 3.5 + r() * 2.5, 0, 7); x.fill(); } }
    if (det.wrinkles) {
      x.globalAlpha = 0.75; x.lineWidth = 5;
      for (const [y, half] of [[58, 70], [82, 85]]) { x.beginPath(); x.moveTo(256 - half, y + 4); x.quadraticCurveTo(256, y - 6, 256 + half, y + 4); x.stroke(); }
      for (const [cx, sgn] of [[112, -1], [400, 1]]) for (const a of [-0.35, 0, 0.35]) { x.beginPath(); x.moveTo(cx, 200 + a * 20); x.lineTo(cx + sgn * 26, 200 + a * 46); x.stroke(); }
      for (const [cx, sgn] of [[180, -1], [332, 1]]) { x.beginPath(); x.moveTo(cx, 265); x.quadraticCurveTo(cx + sgn * 26, 305, cx + sgn * 8, 350); x.stroke(); }
      x.globalAlpha = 1;
    }
    x.restore();
    x.drawImage(img, fx, fy, w, h);
    if (mods) { x.save(); x.translate(fx, fy); x.scale(w / 512, h / 512); paintMods(x, skinHex, face, mods); x.restore(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.wrapS = THREE.RepeatWrapping;
  return (faceSkinCache[key] = t);
}
// Hair: stylized Roblox-like texture - soft clump bands with dark grooves, a few fine strands, and a glossy
// highlight ring (wavy streaks) that sits across the crown on hair shells. Matching bump map. Cached per color.
const hairCache = {};
function hairMaterial(col, kind = 'straight') {
  const key = col + kind; if (hairCache[key]) return hairCache[key];
  if (kind === 'coily') return (hairCache[key] = coilyMaterial(col));
  const W = 512, Hh = 512;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = Hh; return [c, c.getContext('2d')]; };
  const [cc, x] = mk(), [bc, b] = mk();
  const lum = new THREE.Color(col); const L = (lum.r + lum.g + lum.b) / 3; const hiK = L < 0.12 ? 3.2 : L < 0.3 ? 1.9 : 1.45;
  x.fillStyle = shade(col, 0.92); x.fillRect(0, 0, W, Hh); b.fillStyle = '#808080'; b.fillRect(0, 0, W, Hh);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // clump bands: each a soft rounded stripe, lighter in the middle, dark groove at its edges
  let px = 0;
  while (px < W) {
    const wid = 26 + rnd() * 30, f = 0.95 + rnd() * 0.25;
    const g = x.createLinearGradient(px, 0, px + wid, 0);
    g.addColorStop(0, shade(col, 0.55)); g.addColorStop(0.25, shade(col, f)); g.addColorStop(0.6, shade(col, f * 1.08)); g.addColorStop(1, shade(col, 0.6));
    x.fillStyle = g; x.fillRect(px, 0, wid, Hh);
    const gb = b.createLinearGradient(px, 0, px + wid, 0);
    gb.addColorStop(0, '#303030'); gb.addColorStop(0.45, '#c8c8c8'); gb.addColorStop(1, '#383838');
    b.fillStyle = gb; b.fillRect(px, 0, wid, Hh); px += wid;
  }
  // a few fine strands for detail (much subtler than before)
  for (let i = 0; i < 260; i++) {
    const x0 = rnd() * W, len = 80 + rnd() * 240, y0 = rnd() * Hh - 60, sway = (rnd() - 0.5) * 10, light = rnd() < 0.5;
    x.strokeStyle = light ? shade(col, 1.25) : shade(col, 0.55); x.globalAlpha = 0.12 + rnd() * 0.15; x.lineWidth = 0.8 + rnd();
    x.beginPath(); x.moveTo(x0, y0); x.bezierCurveTo(x0 + sway, y0 + len * 0.33, x0 - sway, y0 + len * 0.66, x0, y0 + len); x.stroke();
  }
  // glossy highlight ring: short wavy streaks in a band around v≈0.55
  for (let i = 0; i < 70; i++) {
    const x0 = rnd() * W, y0 = Hh * (0.47 + rnd() * 0.12), len = 30 + rnd() * 50;
    const g = x.createLinearGradient(0, y0, 0, y0 + len);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, shade(col, hiK) ); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.strokeStyle = g; x.globalAlpha = 0.35 + rnd() * 0.35; x.lineWidth = 3 + rnd() * 5; x.lineCap = 'round';
    x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(x0 + (rnd() - 0.5) * 8, y0 + len / 2, x0, y0 + len); x.stroke();
  }
  x.globalAlpha = 1;
  const map = new THREE.CanvasTexture(cc); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 16; map.repeat.set(2, 1);
  const bump = new THREE.CanvasTexture(bc); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(2, 1);
  const m = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.2, roughness: 0.38, metalness: 0.0, side: THREE.DoubleSide });
  return (hairCache[key] = m);
}
// coily texture for afro / curly / puffs / braids: dense little coils instead of streaks
function coilyMaterial(col) {
  const W = 512; const mk = () => { const c = document.createElement('canvas'); c.width = c.height = W; return [c, c.getContext('2d')]; };
  const [cc, x] = mk(), [bc, b] = mk(); x.fillStyle = shade(col, 0.8); x.fillRect(0, 0, W, W); b.fillStyle = '#606060'; b.fillRect(0, 0, W, W);
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const lum = new THREE.Color(col); const hiK = (lum.r + lum.g + lum.b) / 3 < 0.12 ? 2.6 : 1.4;
  for (let i = 0; i < 2600; i++) {
    const cx = rnd() * W, cy = rnd() * W, r = 3 + rnd() * 6, f = 0.7 + rnd() * 0.5;
    for (const [ox, oy] of [[0, 0], [W, 0], [-W, 0], [0, W], [0, -W]]) {
      const g = x.createRadialGradient(cx + ox - r * 0.3, cy + oy - r * 0.3, 0, cx + ox, cy + oy, r);
      g.addColorStop(0, shade(col, f * hiK * 0.8)); g.addColorStop(0.6, shade(col, f)); g.addColorStop(1, shade(col, 0.45));
      x.fillStyle = g; x.beginPath(); x.arc(cx + ox, cy + oy, r, 0, 7); x.fill();
      const gb = b.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r); gb.addColorStop(0, '#e0e0e0'); gb.addColorStop(1, '#303030');
      b.fillStyle = gb; b.beginPath(); b.arc(cx + ox, cy + oy, r, 0, 7); b.fill();
    }
  }
  const map = new THREE.CanvasTexture(cc); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 16; map.repeat.set(4, 3);
  const bump = new THREE.CanvasTexture(bc); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(4, 3);
  return new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 2.2, roughness: 0.62, metalness: 0.0, side: THREE.DoubleSide });
}
function capGeometry(R, H, rr, from) {   // top part of a slightly bigger head shape, for hair
  const pts = []; const n = 14;
  pts.push(new THREE.Vector2(R, from));
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - rr + rr * Math.cos(a), H / 2 - rr + rr * Math.sin(a))); }
  pts.push(new THREE.Vector2(0, H / 2));
  return new THREE.LatheGeometry(pts, 96, Math.PI, Math.PI * 2);
}

const SKIN = { tan: 0xd9a066, light: 0xf2c9a0, brown: 0x8a5a3a, yellow: 0xf5cd30, pale: 0xf0d5c0, gray: 0xa3a2a5 };

function mesh(geo, mat, cast = false) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; }
function rbox(w, h, d, r = 0.06) { return new RoundedBoxGeometry(w, h, d, 3, r); }

export const shadowMatWall = new THREE.MeshBasicMaterial({ color: 0x050508, transparent: true, opacity: 0.88, depthWrite: false });
export const shadowMatFloor = new THREE.MeshBasicMaterial({ color: 0x050508, transparent: true, opacity: 0.55, depthWrite: false });

let blobTex;
function blob() {
  blobTex = blobTex || canvasTex(128, 128, (x, w, h) => {
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.renderOrder = 1; return m;
}

let avatarCount = 0;
export function makeAvatar(o = {}) {
  const shadow = o.shadow;
  const skinHex = SKIN[o.skin || 'tan'] ?? o.skin;   // preset name or any hex colour
  const skinM = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.55 });
  const shirtTex = shadow ? null : fabricTex(o.shirt ?? 0xcc2222, o.shirtStyle || 'plain');
  const st = o.shirtStyle || 'plain', sideTex = shadow ? null : fabricTex(o.shirt ?? 0xcc2222, st.startsWith('hawaiian') || st.startsWith('flamingo') ? st + 'Side' : 'plain');
  const pantsTex = shadow ? null : fabricTex(o.pants ?? 0x222233, o.pantsStyle || 'jeans');
  const shirtM = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.85 });
  const shirtFront = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.85 });
  const pantsM = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ map: pantsTex, roughness: 0.85 });
  const hairM = shadow ? o.shadowMat : hairMaterial(o.hairCol ?? 0x3a2410, COILY.includes(o.hair) ? 'coily' : 'straight');
  const hatM = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ color: o.hatCol ?? 0x1a1a1e, roughness: 0.6 });
  const cast = !shadow && !!o.cast;

  const A = { root: new THREE.Group() };
  const body = new THREE.Group(); body.position.y = 2; A.root.add(body); A.body = body;
  // torso: box with front material
  const tg = rbox(2, 2, 1, 0.05);
  const torso = new THREE.Mesh(tg, shadow ? o.shadowMat : [shirtM, shirtM, shirtM, shirtM, shirtFront, shirtM]);
  torso.position.y = 1; torso.castShadow = cast; torso.receiveShadow = true; body.add(torso);
  // neck/head
  const neck = new THREE.Group(); neck.position.y = 2; body.add(neck); A.neck = neck;
  // face is painted into the head's own skin texture: no separate decal, so no seams, z-fighting or flicker
  const det = { wrinkles: o.wrinkles, freckles: o.freckles, rosy: o.rosy };
  A.faceMat = shadow ? null : new THREE.MeshStandardMaterial({ map: faceSkinTex(skinHex, o.face || 'smile', det), roughness: 0.55 });
  const headM = mesh(headGeometry(), shadow ? o.shadowMat : A.faceMat, cast); headM.position.y = 0.64; neck.add(headM); A.headMesh = headM;
  A.face = o.face || 'smile';
  A.mods = ''; const applyFace = () => { A.faceMat.map = faceSkinTex(skinHex, A.face, det, A.mods); A.faceMat.needsUpdate = true; };
  A.setFace = n => { if (A.faceMat && faceTex[n] && n !== A.face) { A.face = n; applyFace(); } };
  // A.anim(blink, mouthOpen): set by engine/main.html every frame (auto blinks; mouth flaps while the pose includes talk())
  A.anim = (b, o) => { if (!A.faceMat) return; const m = (b && !NO_BLINK.includes(A.face) ? 'b' : '') + (o && !NO_TALK.includes(A.face) ? 'o' : ''); if (m !== A.mods) { A.mods = m; applyFace(); } };
  Object.defineProperty(A.root, '__avatar', { value: A }); A.talkK = 0; A.blinkSeed = hashStr(o.name || 'a') % 1000 / 1000;
  // hair / hats (children of head mesh)
  // sculpted hair (engine/hair.js): one merged mesh per avatar; hairSeed (default: from name) varies part side / spikes
  if (o.hair) {
    const hg = hairGeometry(o.hair, { seed: o.hairSeed ?? hashStr(o.name || o.hair) });
    if (hg) { const hm = mesh(hg, hairM, cast); headM.add(hm); A.hairMesh = hm; }
  }
  // facial hair: beard 'stubble'|'mustache'|'goatee'|'full'|'walrus' (color: beardCol, else hairCol)
  if (o.beard) {
    const bg = beardGeometry(o.beard); const bm = shadow ? o.shadowMat : hairMaterial(o.beardCol ?? o.hairCol ?? 0x3a2410, 'straight');
    if (bg) { const m = mesh(bg, o.beard === 'stubble' && !shadow ? Object.assign(bm.clone(), { transparent: true, opacity: 0.28, depthWrite: false, color: new THREE.Color(0x555555) }) : bm, cast); headM.add(m); A.beardMesh = m; }
  }
  if (o.hat) {
    const brim = mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 40), o.hair ? hatM : hairM, cast); brim.position.y = 0.66; headM.add(brim);
    const crown = mesh(new THREE.CylinderGeometry(0.66, 0.7, 1.25, 40), o.hair ? hatM : hairM, cast); crown.position.y = 1.3; headM.add(crown);
  }
  // arms: shoulder pivots at top of torso
  for (const [k, x] of [['armR', -1.5], ['armL', 1.5]]) {
    const sh = new THREE.Group(); sh.position.set(x, 1.5, 0); body.add(sh); A[k] = sh;
    const sleeve = o.sleeves === false ? null : mesh(rbox(1, 1.15, 1, 0.05), shirtM, cast);
    if (sleeve) { sleeve.position.y = -0.075; sh.add(sleeve); }
    const arm = mesh(rbox(0.985, o.sleeves === false ? 2 : 0.88, 0.985, 0.05), skinM, cast);
    arm.position.y = o.sleeves === false ? -0.5 : -1.07; sh.add(arm);
  }
  for (const [k, x] of [['legR', -0.5], ['legL', 0.5]]) {
    const hp = new THREE.Group(); hp.position.set(x, 2, 0); A.root.add(hp); A[k] = hp;
    const lg = new THREE.Mesh(rbox(1, 2, 1, 0.05), shadow ? o.shadowMat : [pantsM, pantsM, pantsM, pantsM, pantsM, pantsM]);
    lg.castShadow = cast; lg.receiveShadow = true; lg.position.y = -1; hp.add(lg);
  }
  if (!shadow && o.blob !== false) { A.blob = blob(); A.root.add(A.blob); }
  // tag parts for the collision checker (engine/clips.js)
  A.name = o.name || `avatar${++avatarCount}`;
  if (!shadow) {
    const tag = (grp, part) => grp.traverse(m => { if (m.isMesh && !m.userData.part) { m.userData.avatar = A.name; m.userData.part = part; } });
    tag(A.armR, 'right arm'); tag(A.armL, 'left arm'); tag(A.legR, 'right leg'); tag(A.legL, 'left leg');
    A.headMesh.traverse(m => { if (m.isMesh && m !== A.headMesh) { m.userData.avatar = A.name; m.userData.part = 'hair/hat'; } });
    tag(A.neck, 'head'); tag(A.body, 'torso');
  }
  if (o.outfit && !shadow) outfit(A, o.outfit);   // themed costume pieces (engine/outfits.js)
  A.pose = p => setPose(A, p);
  return A;
}

// pose in degrees; all optional
const NO_BLINK = ['sleeping', 'sleepy', 'laugh', 'cry', 'wink', 'yawn', 'love', 'silly', 'yell', 'ko', 'dizzy', 'haha', 'terror', 'rage', 'blackeye'];
// faces whose mouth is already wide open (or is the whole joke): the talking flap would paint a small generic mouth over it, so they keep their own mouth while talking
const NO_TALK = ['yell', 'rage', 'terror', 'gasp', 'haha', 'gleeful', 'stunned', 'evil', 'derp'];
export function setPose(A, p = {}) {
  const g = k => p[k] || 0; A.talkK = g('mouth');
  A.armR.rotation.set(-g('rFwd') * D, 0, -g('rUp') * D);
  A.armL.rotation.set(-g('lFwd') * D, 0, g('lUp') * D);
  A.legR.rotation.set(-g('rLeg') * D, 0, -g('rLegOut') * D);
  A.legL.rotation.set(-g('lLeg') * D, 0, g('lLegOut') * D);
  A.neck.rotation.set(g('nod') * D, g('turn') * D, g('tilt') * D);
  A.body.rotation.set(g('lean') * D, g('bodyTurn') * D, g('bodyTilt') * D);
  A.body.position.y = 2 + g('bob');
}

export const POSES = {
  rest: { rUp: 3, lUp: 3 },
  hips: { rUp: 28, lUp: 28, rFwd: -8, lFwd: -8 },
  armsup: { rUp: 155, lUp: 155 },
  wave: { rUp: 150, lUp: 6, tilt: -6 },
  point: { rFwd: 85, lUp: 4 },
  shrug: { rUp: 35, lUp: 35, rFwd: 25, lFwd: 25, tilt: 8 },
  slump: { rUp: 2, lUp: 2, tilt: -32, nod: 25, lean: 10, bodyTilt: -6 },
  shock: { rUp: 40, lUp: 40, rFwd: 35, lFwd: 35, nod: -8 },
  spit: { nod: 35, lean: 32, rFwd: 125, rUp: 10, lFwd: 15 },
  sprawl: { rUp: 75, lUp: 75, rLegOut: 10, lLegOut: 10, tilt: 20 },
  sleep: {},
};
export function lerpPose(a, b, t) {
  const o = {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) o[k] = (a[k] || 0) + ((b[k] || 0) - (a[k] || 0)) * t; return o;
}
export function addPose(a, b) { const o = { ...a }; for (const k in b) o[k] = (o[k] || 0) + b[k]; return o; }
export const ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
export const snap = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);   // fast-out for Roblox-y pose hits
// idle: breathing + subtle sway
export function idle(t, k = 1, seed = 0) {
  return { bob: Math.sin(t * 3 + seed) * 0.035 * k, rUp: Math.sin(t * 1.7 + seed) * 2 * k, lUp: Math.sin(t * 1.9 + seed + 1) * 2 * k,
           tilt: Math.sin(t * 1.3 + seed) * 3 * k, turn: Math.sin(t * 0.9 + seed) * 4 * k };
}
export function walk(t, speed = 1, amp = 38) {
  const s = Math.sin(t * 8 * speed);
  return { rLeg: s * amp, lLeg: -s * amp, rFwd: -s * amp * 0.9, lFwd: s * amp * 0.9, bob: Math.abs(Math.cos(t * 8 * speed)) * 0.12 };
}

// flattened silhouette of an avatar. mode 'wall' (flat on a plane facing +Z) or 'floor'
export function makeShadow(opts, mode = 'wall') {
  const A = makeAvatar({ ...opts, shadow: true, shadowMat: opts.shadowMatOverride || (mode === 'wall' ? shadowMatWall : shadowMatFloor) });
  const flat = new THREE.Group(); const inner = new THREE.Group();
  flat.add(inner); inner.add(A.root);
  if (mode === 'wall') flat.scale.set(1, 1, 0.01);
  else { inner.rotation.x = Math.PI / 2; flat.scale.set(1, 0.01, 1); flat.position.y = 0.04; }
  A.flat = flat; A.inner = inner; A.root.traverse(m => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; m.renderOrder = 2; } });
  return A;
}
