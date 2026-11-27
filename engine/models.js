// Owner-supplied 3D models (owner 2026-11-27): hair (engine/hairs) and accessories (engine/accessories), imported with tools/import_hair.py.
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// ---- owner-supplied hair models (owner 2026-11-27): engine/hairs/<name>.obj + .png, listed in engine/hairs/index.json (tools/import_hair.py) ----
// loaded once by engine/main.html; makeAvatar({ hair: '<name>' }) uses the model instead of a sculpted style. Same head-local space as hair.js
// (head centre 0, top y 0.61, front +Z). index entry: { obj, tex, tint, rot (deg about y), scale, off: [x,y,z] }.
export const HAIR_MODELS = {}, ACC_MODELS = {};
function smoothNormals(geo) {   // smooth normals by shared position (OBJLoader gives unindexed triangles -> flat shading otherwise)
    const p = geo.attributes.position, n = new Float32Array(p.count * 3), acc = new Map(), key = i => `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      const fn = b.clone().sub(a).cross(c.clone().sub(a)); for (let k = 0; k < 3; k++) { const kk = key(i + k); const v = acc.get(kk) || new THREE.Vector3(); v.add(fn); acc.set(kk, v); } }
    for (let i = 0; i < p.count; i++) { const v = acc.get(key(i)).clone().normalize(); n[i * 3] = v.x; n[i * 3 + 1] = v.y; n[i * 3 + 2] = v.z; }
    geo.setAttribute('normal', new THREE.BufferAttribute(n, 3)); }
const sc3 = s => Array.isArray(s) ? s : [s || 1, s || 1, s || 1];
// models in engine/<dir>/ listed in <dir>/index.json; scale may be a number or [x, y, z]
async function loadModels(dir, index, REG) {
  const ol = new OBJLoader(), tl = new THREE.TextureLoader();
  await Promise.all(Object.entries(index || {}).map(async ([name, e]) => {
    const obj = await ol.loadAsync(`${dir}/${e.obj}`); let geo = null, olGeo = null; let fxGeo = null; obj.traverse(m => { if (!m.isMesh) return; if (m.name === 'outline') olGeo = m.geometry; else if (m.name === 'fixed') fxGeo = m.geometry; else if (!geo) geo = m.geometry; });
    if (!geo) return;
    const xf = g => { g.rotateY((e.rot || 0) * Math.PI / 180); if (e.tilt) g.rotateX(-e.tilt * Math.PI / 180); g.scale(...sc3(e.scale)); g.translate(...(e.off || [0, 0, 0])); };   // tilt (deg) tips the front up (caps)
    if (fxGeo) { xf(fxGeo); smoothNormals(fxGeo); }
    if (olGeo) xf(olGeo);
    xf(geo);
    smoothNormals(geo);  geo.computeBoundingBox(); geo.computeBoundingSphere();
    let map = null; if (e.tex) { map = await tl.loadAsync(`${dir}/${e.tex}`); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; map.wrapS = map.wrapT = THREE.RepeatWrapping; }
    let fxMap = null; if (fxGeo && e.fixedTex) { fxMap = await tl.loadAsync(`${dir}/${e.fixedTex}`); fxMap.colorSpace = THREE.SRGBColorSpace; fxMap.anisotropy = 8; fxMap.wrapS = fxMap.wrapT = THREE.RepeatWrapping; }
    REG[name] = { geo, olGeo, fxGeo, fxMat: fxGeo ? new THREE.MeshStandardMaterial({ map: fxMap, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide }) : null, map, tint: e.tint !== false, attach: e.attach || 'head' };
  }));
}
export async function loadHairModels(index) { await loadModels('hairs', index, HAIR_MODELS); }
export async function loadAccessoryModels(index) { await loadModels('accessories', index, ACC_MODELS); }
export const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: 0x141418, side: THREE.FrontSide });   // Roblox outline shells are wound inside-out
