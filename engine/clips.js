// Collision checker: finds avatar body parts that pass through other avatars or solid set pieces.
// Solid set pieces = meshes made with box() (userData.solid). Avatar parts are tagged in makeAvatar().
// Touching is fine (each box is shrunk by `margin`); real overlaps are reported.
// Intended contact (hugs, a hand on a shoulder) can be whitelisted per shot:
//   S.userData.allowContact = [['mom', 'leo']]            // two avatars (by opts.name) may touch
//   S.userData.allowContact = [['dad', 'box*table*']]     // or an avatar and solids whose name matches (glob)
import * as THREE from 'three';
import { OBB } from 'three/addons/math/OBB.js';

function obbOf(m, margin) {
  const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox();
  const c = new THREE.Vector3(), h = new THREE.Vector3();
  g.boundingBox.getCenter(c); g.boundingBox.getSize(h).multiplyScalar(0.5);
  h.subScalar(margin).max(new THREE.Vector3(0.005, 0.005, 0.005));
  return new OBB(c, h).applyMatrix4(m.matrixWorld);
}
const glob = (pat, s) => new RegExp('^' + pat.split('*').map(x => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$').test(s);

export function findClips(S, margin = 0.07) {
  S.updateMatrixWorld(true);
  const parts = [], solids = [];
  S.traverse(o => {
    if (!o.isMesh) return;
    let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; }
    if (!vis) return;
    if (o.userData.avatar) parts.push(o); else if (o.userData.solid) solids.push(o);
  });
  const allow = (S.userData && S.userData.allowContact) || [];
  const allowed = (a, b) => allow.some(([x, y]) => (glob(x, a) && glob(y, b)) || (glob(x, b) && glob(y, a)));
  const P = parts.map(m => ({ m, o: obbOf(m, margin), box: new THREE.Box3().setFromObject(m) }));
  const Q = solids.map(m => ({ m, o: obbOf(m, margin), box: new THREE.Box3().setFromObject(m) }));
  const hits = new Set();
  for (let i = 0; i < P.length; i++) {
    const A = P[i];
    for (let j = i + 1; j < P.length; j++) {
      const B = P[j]; if (A.m.userData.avatar === B.m.userData.avatar) continue;
      if (!A.box.intersectsBox(B.box) || allowed(A.m.userData.avatar, B.m.userData.avatar)) continue;
      if (A.o.intersectsOBB(B.o)) hits.add(`${A.m.userData.avatar} ${A.m.userData.part}  <->  ${B.m.userData.avatar} ${B.m.userData.part}`);
    }
    for (const B of Q) {
      if (!A.box.intersectsBox(B.box) || allowed(A.m.userData.avatar, B.m.name)) continue;
      if (A.o.intersectsOBB(B.o)) hits.add(`${A.m.userData.avatar} ${A.m.userData.part}  <->  ${B.m.name}`);
    }
  }
  return [...hits];
}
