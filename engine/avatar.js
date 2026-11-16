import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
function faceSkinTex(skinHex, face) {
  const key = skinHex + '|' + face;
  if (faceSkinCache[key]) return faceSkinCache[key];
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const x = c.getContext('2d');
  x.fillStyle = hex(skinHex); x.fillRect(0, 0, c.width, c.height);
  noise(x, c.width, c.height, 0.08, 0.035);
  const img = faceTex[face] && faceTex[face].image;
  if (img) {
    const w = FACE_U * c.width, h = FACE_V * c.height;
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, (0.5 - FACE_U / 2) * c.width, (1 - FACE_VC - FACE_V / 2) * c.height, w, h);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.wrapS = THREE.RepeatWrapping;
  return (faceSkinCache[key] = t);
}
// Hair: strand texture + matching bump map. Cached per color.
const hairCache = {};
function hairMaterial(col) {
  if (hairCache[col]) return hairCache[col];
  const W = 512, Hh = 512;
  const mk = (bump) => { const c = document.createElement('canvas'); c.width = W; c.height = Hh; return [c, c.getContext('2d')]; };
  const [cc, x] = mk(), [bc, b] = mk();
  x.fillStyle = hex(col); x.fillRect(0, 0, W, Hh); b.fillStyle = '#808080'; b.fillRect(0, 0, W, Hh);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // broad clumps
  for (let i = 0; i < 26; i++) {
    const cx = rnd() * W, wid = 14 + rnd() * 26, f = 0.82 + rnd() * 0.32;
    const g = x.createLinearGradient(cx - wid, 0, cx + wid, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, shade(col, f)); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.globalAlpha = 0.55; x.fillRect(cx - wid, 0, wid * 2, Hh);
    const gb = b.createLinearGradient(cx - wid, 0, cx + wid, 0);
    gb.addColorStop(0, '#808080'); gb.addColorStop(0.5, f > 1 ? '#b0b0b0' : '#5a5a5a'); gb.addColorStop(1, '#808080');
    b.fillStyle = gb; b.fillRect(cx - wid, 0, wid * 2, Hh);
  }
  x.globalAlpha = 1;
  // fine strands (gently wavy, mostly vertical)
  for (let i = 0; i < 900; i++) {
    const x0 = rnd() * W, len = 60 + rnd() * 220, y0 = rnd() * Hh - 40, sway = (rnd() - 0.5) * 18, light = rnd() < 0.45;
    const colS = light ? shade(col, 1.35 + rnd() * 0.4) : shade(col, 0.45 + rnd() * 0.25);
    x.strokeStyle = colS; x.globalAlpha = 0.18 + rnd() * 0.3; x.lineWidth = 0.8 + rnd() * 1.6;
    x.beginPath(); x.moveTo(x0, y0); x.bezierCurveTo(x0 + sway, y0 + len * 0.33, x0 - sway, y0 + len * 0.66, x0 + sway * 0.5, y0 + len); x.stroke();
    b.strokeStyle = light ? '#d0d0d0' : '#303030'; b.globalAlpha = 0.25; b.lineWidth = x.lineWidth;
    b.beginPath(); b.moveTo(x0, y0); b.bezierCurveTo(x0 + sway, y0 + len * 0.33, x0 - sway, y0 + len * 0.66, x0 + sway * 0.5, y0 + len); b.stroke();
  }
  // sheen: light strands added on top so even near-black hair shows texture
  for (let i = 0; i < 260; i++) {
    const x0 = rnd() * W, len = 80 + rnd() * 200, y0 = rnd() * Hh - 40, sway = (rnd() - 0.5) * 16;
    x.strokeStyle = 'rgb(255,236,214)'; x.globalAlpha = 0.07 + rnd() * 0.1; x.lineWidth = 1 + rnd() * 1.5;
    x.beginPath(); x.moveTo(x0, y0); x.bezierCurveTo(x0 + sway, y0 + len * 0.33, x0 - sway, y0 + len * 0.66, x0 + sway * 0.5, y0 + len); x.stroke();
  }
  x.globalAlpha = 1; b.globalAlpha = 1;
  const map = new THREE.CanvasTexture(cc); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 16; map.repeat.set(2, 1);
  const bump = new THREE.CanvasTexture(bc); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(2, 1);
  const m = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 2.6, roughness: 0.45, metalness: 0.0 });
  return (hairCache[col] = m);
}
function capGeometry(R, H, rr, from) {   // top part of a slightly bigger head shape, for hair
  const pts = []; const n = 14;
  pts.push(new THREE.Vector2(R, from));
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - rr + rr * Math.cos(a), H / 2 - rr + rr * Math.sin(a))); }
  pts.push(new THREE.Vector2(0, H / 2));
  return new THREE.LatheGeometry(pts, 96, Math.PI, Math.PI * 2);
}

const SKIN = { tan: 0xd9a066, light: 0xf2c9a0, brown: 0x8a5a3a, yellow: 0xf5cd30, pale: 0xf0d5c0 };

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
  const skinHex = SKIN[o.skin || 'tan'];
  const skinM = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.55 });
  const shirtTex = shadow ? null : fabricTex(o.shirt ?? 0xcc2222, o.shirtStyle || 'plain');
  const sideTex = shadow ? null : fabricTex(o.shirt ?? 0xcc2222, 'plain');
  const pantsTex = shadow ? null : fabricTex(o.pants ?? 0x222233, o.pantsStyle || 'jeans');
  const shirtM = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.85 });
  const shirtFront = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.85 });
  const pantsM = shadow ? o.shadowMat : new THREE.MeshStandardMaterial({ map: pantsTex, roughness: 0.85 });
  const hairM = shadow ? o.shadowMat : hairMaterial(o.hairCol ?? 0x3a2410);
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
  A.faceMat = shadow ? null : new THREE.MeshStandardMaterial({ map: faceSkinTex(skinHex, o.face || 'smile'), roughness: 0.55 });
  const headM = mesh(headGeometry(), shadow ? o.shadowMat : A.faceMat, cast); headM.position.y = 0.64; neck.add(headM); A.headMesh = headM;
  A.face = o.face || 'smile';
  A.setFace = n => { if (A.faceMat && faceTex[n] && n !== A.face) { A.face = n; A.faceMat.map = faceSkinTex(skinHex, n); A.faceMat.needsUpdate = true; } };
  // hair / hats (children of head mesh)
  if (o.hair === 'short' || o.hair === 'bun' || o.hair === 'spiky' || o.hair === 'long') {
    const cap = mesh(capGeometry(0.67, 1.32, 0.36, 0.3), hairM, cast); headM.add(cap);
    if (!shadow) { // keep back hair only behind the face: thin box approximation
      const bb = mesh(rbox(1.36, o.hair === 'long' ? 1.5 : 0.9, 0.5, 0.2), hairM, cast); bb.position.set(0, o.hair === "long" ? -0.25 : 0.1, -0.4); headM.add(bb);
    }
    if (o.hair === 'short' || o.hair === 'long') {
      const fr = mesh(rbox(0.95, 0.26, 0.3, 0.1), hairM, cast); fr.position.set(-0.15, 0.5, 0.42); fr.rotation.z = -8 * D; headM.add(fr);
      // layered tufts for a swept, chunkier silhouette
      [[0.28, 0.66, 0.3, 0.7, -14], [-0.32, 0.68, 0.22, 0.6, 10], [0.05, 0.72, -0.1, 0.8, -4]].forEach(([x, y, z, w, rz]) => {
        const t = mesh(rbox(w, 0.22, 0.55, 0.1), hairM, cast); t.position.set(x, y, z); t.rotation.set(-12 * D, 0, rz * D); headM.add(t); });
    }
    if (o.hair === 'bun') { const b = mesh(new THREE.SphereGeometry(0.42, 24, 16), hairM, cast); b.position.set(0, 0.75, -0.45); headM.add(b); }
    if (o.hair === 'spiky') {
      [[-0.42, 0, 0, 28], [0, 0.05, 0, 0], [0.42, 0, 0, -28], [-0.24, -0.3, -25, 15], [0.24, -0.3, -25, -15], [0, 0.35, 28, 0], [-0.25, 0.3, 20, 20], [0.25, 0.3, 20, -20]]
        .forEach(([x, z, rx, rz]) => { const c = mesh(new THREE.ConeGeometry(0.3, 1.0, 16), hairM, cast); c.position.set(x, 0.95, z); c.rotation.set(rx * D, 0, rz * D); headM.add(c); });
    }
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
  A.pose = p => setPose(A, p);
  return A;
}

// pose in degrees; all optional
export function setPose(A, p = {}) {
  const g = k => p[k] || 0;
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
