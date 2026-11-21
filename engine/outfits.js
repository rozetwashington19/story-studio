// Outfits + accessories (owner request 2026-11-18: "a new cast of characters / designs depending on the theme / story of the episode").
// Give any avatar a themed look straight from its preset:   makeAvatar({ ...preset, outfit: ['cap', ['backpack', { col: 0x2a6ae8 }], 'boots'] })
// or later: outfit(A, [...]). Items are a name or [name, opts]; most take { col }. Everything is tagged for the collision checker.
//  head: cap {col, back} · beanie · helmet {col, visor} (bike/hard) · spacehelmet (glass dome) · hardhat · headband · headlamp {light} ·
//        crown · circlet {col, gem} · chefhat · knighthelm {col, plume} (open-face) · wizardhat · cowboyhat · piratehat · bandana · goggles (on the forehead) · glasses · sunglasses · bow · headphones · earmuffs {col} · antennae · hood
//  body: backpack · cape · scarf · vest · apron · belt · badge {col} · armor · overalls · labcoat · tie · bowtie · sash · satchel · lifevest · jetpack
//  limbs: gloves · boots · wristband · kneepads · skates {col, wheel} (roller skates)
// sunglasses {up: true} = pushed up on the head, {frame} = coloured frame
// Shirt styles (fabricTex): plain hoodie shirt blazer tee + stripes plaid jacket overalls sweater uniform spacesuit knight hawaiian flamingo (faded flamingo print) polo (staff polo).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const D = Math.PI / 180;
const M = (col, o = {}) => new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, ...o });
const rb = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);
function add(parent, geo, mat, [x = 0, y = 0, z = 0] = [], rot) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rot) m.rotation.set(...rot); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
const shade = (c, f) => new THREE.Color(c).multiplyScalar(f).getHex();

// head-local: head centre at 0, top y=0.61, front z=0.62, radius 0.62.  body-local: torso x ±1, y 0..2, z ±0.5 (front +z).
const ITEMS = {
  cap: (A, { col = 0xd8302a, back = false }) => { const g = new THREE.Group(); g.position.y = 0.38; if (back) g.rotation.y = Math.PI; A.headMesh.add(g);
    add(g, new THREE.SphereGeometry(0.67, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(col)); add(g, new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24, 1, false, -Math.PI / 2, Math.PI), M(shade(col, 0.8)), [0, 0.0, 0.5]).scale.set(1, 1, 1.1);
    add(g, new THREE.SphereGeometry(0.06, 8, 6), M(shade(col, 0.7)), [0, 0.66, 0]); },
  beanie: (A, { col = 0x3a6ab8 }) => { add(A.headMesh, new THREE.SphereGeometry(0.68, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(col, { roughness: 1 }), [0, 0.3, 0]).scale.y = 1.05;
    add(A.headMesh, new THREE.CylinderGeometry(0.69, 0.69, 0.2, 24), M(shade(col, 0.8), { roughness: 1 }), [0, 0.32, 0]); add(A.headMesh, new THREE.SphereGeometry(0.17, 10, 8), M(0xf2f2f2, { roughness: 1 }), [0, 1.02, 0]); },
  helmet: (A, { col = 0xf2c420, visor = false }) => { add(A.headMesh, new THREE.SphereGeometry(0.74, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(col, { roughness: 0.3 }), [0, 0.22, 0]);
    add(A.headMesh, new THREE.CylinderGeometry(0.75, 0.75, 0.08, 24), M(0x222222), [0, 0.24, 0]); if (visor) add(A.headMesh, new THREE.BoxGeometry(1.1, 0.35, 0.05), M(0x223a5a, { roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.7 }), [0, 0.12, 0.68]); },
  spacehelmet: (A, { col = 0xf2f2f2 }) => { add(A.headMesh, new THREE.SphereGeometry(1.0, 28, 18), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.2, depthWrite: false }), [0, 0.05, 0]);
    add(A.headMesh, new THREE.TorusGeometry(0.85, 0.12, 10, 24), M(col, { roughness: 0.4 }), [0, -0.72, 0], [Math.PI / 2, 0, 0]); },
  hardhat: (A, { col = 0xf2a420 }) => { add(A.headMesh, new THREE.SphereGeometry(0.7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(col, { roughness: 0.35 }), [0, 0.3, 0]); add(A.headMesh, new THREE.CylinderGeometry(0.88, 0.88, 0.06, 24), M(col, { roughness: 0.35 }), [0, 0.3, 0.06]); },
  headband: (A, { col = 0xe8302a }) => { add(A.headMesh, new THREE.CylinderGeometry(0.65, 0.65, 0.16, 24, 1, true), M(col, { side: THREE.DoubleSide }), [0, 0.38, 0]); },
  headlamp: (A, { col = 0x2a2a2a, light = 0 }) => { add(A.headMesh, new THREE.CylinderGeometry(0.645, 0.645, 0.12, 24, 1, true), M(col, { side: THREE.DoubleSide }), [0, 0.36, 0]);
    add(A.headMesh, rb(0.3, 0.22, 0.16, 0.04), M(0x3a3a3a), [0, 0.36, 0.66]); add(A.headMesh, new THREE.CircleGeometry(0.08, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d0 }), [0, 0.36, 0.75]);
    if (light) { const s = new THREE.SpotLight(0xfff0d0, light, 18, 0.4, 0.5, 1.5); s.position.set(0, 0.36, 0.8); s.target.position.set(0, 0.0, 6); A.headMesh.add(s, s.target); } },
  crown: (A, { col = 0xf2c420 }) => { const m = M(col, { metalness: 0.85, roughness: 0.25 }); add(A.headMesh, new THREE.CylinderGeometry(0.6, 0.6, 0.3, 24, 1, true), m, [0, 0.75, 0]).material.side = THREE.DoubleSide;
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(A.headMesh, new THREE.ConeGeometry(0.12, 0.3, 4), m, [Math.sin(a) * 0.58, 1.0, Math.cos(a) * 0.58]); }
    add(A.headMesh, new THREE.SphereGeometry(0.08, 8, 6), M(0xe8302a, { roughness: 0.2 }), [0, 0.76, 0.61]); },
  chefhat: (A, { col = 0xfafaf6 }) => { const m = M(col, { roughness: 0.95 }); add(A.headMesh, new THREE.CylinderGeometry(0.64, 0.64, 0.5, 24), m, [0, 0.72, 0]);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; add(A.headMesh, new THREE.SphereGeometry(0.42, 14, 10), m, [Math.sin(a) * 0.38, 1.22, Math.cos(a) * 0.38]); }
    add(A.headMesh, new THREE.SphereGeometry(0.5, 14, 10), m, [0, 1.38, 0]); },
  knighthelm: (A, { col = 0xb8bcc8, plume = 0xc8302a }) => { const m = M(col, { metalness: 0.85, roughness: 0.3 });   // open-face helm (face stays visible): dome, brow band, cheek guards, nose guard, plume
    add(A.headMesh, new THREE.SphereGeometry(0.72, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), m, [0, 0.3, 0]); add(A.headMesh, new THREE.CylinderGeometry(0.73, 0.73, 0.16, 24), m, [0, 0.33, 0]);
    for (const s of [-1, 1]) add(A.headMesh, new THREE.BoxGeometry(0.14, 0.75, 0.7), m, [s * 0.66, -0.05, 0.05]);
    add(A.headMesh, new THREE.BoxGeometry(0.1, 0.36, 0.08), m, [0, 0.22, 0.7]); add(A.headMesh, new THREE.BoxGeometry(1.3, 0.5, 0.12), m, [0, 0.0, -0.66]);
    for (let i = 0; i < 6; i++) add(A.headMesh, new THREE.SphereGeometry(0.16 - i * 0.012, 8, 6), M(plume, { roughness: 1 }), [0, 1.08 - i * 0.06, 0.1 - i * 0.2]);
    add(A.headMesh, new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), m, [0, 1.0, 0.1]); },
  circlet: (A, { col = 0xd8dce4, gem = 0x3ad0a0 }) => { add(A.headMesh, new THREE.TorusGeometry(0.63, 0.045, 8, 30), M(col, { metalness: 0.9, roughness: 0.25 }), [0, 0.42, 0], [Math.PI / 2 + 0.12, 0, 0]);
    add(A.headMesh, new THREE.OctahedronGeometry(0.1), M(gem, { roughness: 0.1, emissive: gem, emissiveIntensity: 0.3 }), [0, 0.5, 0.63]); },
  wizardhat: (A, { col = 0x4a2a9a }) => { add(A.headMesh, new THREE.CylinderGeometry(1.05, 1.05, 0.06, 28), M(col), [0, 0.62, 0]); const c = add(A.headMesh, new THREE.ConeGeometry(0.66, 1.9, 24), M(col), [0, 1.55, -0.1]); c.rotation.x = -0.15;
    for (let i = 0; i < 4; i++) add(A.headMesh, new THREE.OctahedronGeometry(0.09), new THREE.MeshBasicMaterial({ color: 0xffe070 }), [Math.sin(i * 1.7) * 0.4, 1.0 + i * 0.3, 0.45 - i * 0.12]); },
  cowboyhat: (A, { col = 0x8a5a2a }) => { add(A.headMesh, new THREE.CylinderGeometry(1.15, 1.15, 0.06, 28), M(col), [0, 0.64, 0]).scale.z = 0.85; add(A.headMesh, new THREE.CylinderGeometry(0.55, 0.65, 0.6, 24), M(col), [0, 0.95, 0]);
    add(A.headMesh, new THREE.CylinderGeometry(0.66, 0.66, 0.1, 24), M(0x2a1a10), [0, 0.72, 0]); },
  piratehat: (A, { col = 0x1a1a1e }) => { const h = add(A.headMesh, new THREE.CylinderGeometry(0.2, 0.9, 0.7, 3), M(col), [0, 0.95, 0]); h.rotation.y = Math.PI / 6; h.scale.z = 0.7;
    add(A.headMesh, new THREE.CylinderGeometry(0.66, 0.66, 0.16, 24), M(col), [0, 0.64, 0]); add(A.headMesh, new THREE.SphereGeometry(0.12, 8, 6), M(0xf2f2f2), [0, 0.95, 0.42]); },
  bandana: (A, { col = 0xd8302a }) => { add(A.headMesh, new THREE.SphereGeometry(0.66, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), M(col, { roughness: 1 }), [0, 0.25, 0]);
    add(A.headMesh, new THREE.ConeGeometry(0.16, 0.4, 4), M(col, { roughness: 1 }), [0.1, 0.2, -0.72], [0.4, 0, 0.3]); },
  goggles: (A, { col = 0x6a4a2a }) => { add(A.headMesh, new THREE.CylinderGeometry(0.645, 0.645, 0.1, 24, 1, true), M(col, { side: THREE.DoubleSide }), [0, 0.42, 0]);
    for (const s of [-1, 1]) { add(A.headMesh, new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16), M(0x8a8a90, { metalness: 0.7, roughness: 0.3 }), [s * 0.2, 0.44, 0.62], [Math.PI / 2, 0, 0]);
      add(A.headMesh, new THREE.CircleGeometry(0.12, 16), M(0x6ad0ff, { roughness: 0.05, metalness: 0.3, emissive: 0x1a4a6a }), [s * 0.2, 0.44, 0.69]); } },
  glasses: (A, { col = 0x1a1a1e }) => { for (const s of [-1, 1]) add(A.headMesh, new THREE.TorusGeometry(0.13, 0.025, 6, 18), M(col), [s * 0.2, 0.12, 0.64]); add(A.headMesh, new THREE.BoxGeometry(0.16, 0.03, 0.03), M(col), [0, 0.13, 0.65]); },
  sunglasses: (A, { col = 0x111111, up = false, frame }) => { const g = new THREE.Group(); A.headMesh.add(g); if (up) { g.position.set(0, 0.36, 0.1); g.rotation.x = -0.35; }
    for (const s of [-1, 1]) add(g, rb(0.3, 0.17, 0.04, 0.05), M(col, { roughness: 0.15, metalness: 0.3 }), [s * 0.2, 0.12, 0.64]); add(g, new THREE.BoxGeometry(0.14, 0.04, 0.03), M(frame ?? col), [0, 0.16, 0.64]);
    if (frame) for (const s of [-1, 1]) add(g, new THREE.BoxGeometry(0.34, 0.04, 0.05), M(frame), [s * 0.2, 0.22, 0.64]); },
  bow: (A, { col = 0xf25a9a }) => { for (const s of [-1, 1]) add(A.headMesh, new THREE.ConeGeometry(0.2, 0.36, 4), M(col), [0.35 + s * 0.18, 0.62, 0.15], [0, 0, s * Math.PI / 2]); add(A.headMesh, new THREE.SphereGeometry(0.09, 8, 6), M(shade(col, 0.8)), [0.35, 0.62, 0.15]); },
  headphones: (A, { col = 0x2a2a2e }) => { add(A.headMesh, new THREE.TorusGeometry(0.7, 0.06, 8, 24, Math.PI), M(col), [0, 0.05, 0]); for (const s of [-1, 1]) add(A.headMesh, new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16), M(0xe8302a), [s * 0.68, 0.05, 0], [0, 0, Math.PI / 2]); },
  earmuffs: (A, { col = 0xff8ad0, band = 0xf2f2f6 }) => { add(A.headMesh, new THREE.TorusGeometry(0.7, 0.05, 8, 24, Math.PI), M(band, { metalness: 0.3 }), [0, 0.05, 0]); for (const s of [-1, 1]) add(A.headMesh, new THREE.SphereGeometry(0.27, 16, 12), M(col, { roughness: 1 }), [s * 0.66, 0.02, 0]).scale.set(0.65, 1, 1); },
  antennae: (A, { col = 0x6ad86a }) => { for (const s of [-1, 1]) { add(A.headMesh, new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), M(0x2a2a2a), [s * 0.25, 0.9, 0], [0, 0, -s * 0.3]); add(A.headMesh, new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: col }), [s * 0.36, 1.24, 0]); } },
  hood: (A, { col = 0x3a3a48 }) => { add(A.headMesh, new THREE.SphereGeometry(0.8, 24, 14, Math.PI * 0.15, Math.PI * 1.7), M(col, { roughness: 1, side: THREE.DoubleSide }), [0, 0.05, -0.05]); },

  backpack: (A, { col = 0x2a6ae8 }) => { add(A.body, rb(1.5, 1.6, 0.6, 0.15), M(col), [0, 1.05, -0.8]); add(A.body, rb(1.2, 0.6, 0.25, 0.08), M(shade(col, 0.8)), [0, 0.65, -1.15]);
    for (const s of [-1, 1]) add(A.body, new THREE.BoxGeometry(0.16, 2.0, 1.06), M(shade(col, 0.6)), [s * 0.55, 1.0, -0.02]); },
  cape: (A, { col = 0xc0262b }) => { const c = add(A.body, new THREE.BoxGeometry(2.1, 3.0, 0.08), M(col, { roughness: 0.6 }), [0, 0.6, -0.62]); c.rotation.x = 0.12;
    add(A.body, new THREE.TorusGeometry(0.5, 0.07, 6, 16, Math.PI), M(0xf2c420, { metalness: 0.8, roughness: 0.3 }), [0, 1.98, 0.1], [-Math.PI / 2, 0, 0]); },
  scarf: (A, { col = 0xd8302a }) => { add(A.body, new THREE.TorusGeometry(0.55, 0.18, 8, 20), M(col, { roughness: 1 }), [0, 2.02, 0], [Math.PI / 2, 0, 0]).scale.set(1, 0.55, 1); add(A.body, rb(0.32, 1.0, 0.12, 0.05), M(col, { roughness: 1 }), [0.35, 1.5, 0.55]); },
  vest: (A, { col = 0x5a6a3a }) => { for (const s of [-1, 1]) { add(A.body, new THREE.BoxGeometry(0.75, 1.95, 1.04), M(col), [s * 0.62, 1.0, 0]); add(A.body, rb(0.4, 0.35, 0.08, 0.04), M(shade(col, 0.75)), [s * 0.6, 0.65, 0.54]); } },
  apron: (A, { col = 0xf2f2ee }) => { add(A.body, new THREE.BoxGeometry(1.5, 2.1, 0.05), M(col, { roughness: 1 }), [0, 0.7, 0.53]); add(A.body, rb(0.7, 0.4, 0.06, 0.03), M(shade(col, 0.85)), [0, 0.4, 0.57]); },
  belt: (A, { col = 0x3a2414 }) => { add(A.body, new THREE.BoxGeometry(2.04, 0.22, 1.04), M(col), [0, 0.12, 0]); add(A.body, new THREE.BoxGeometry(0.3, 0.26, 0.06), M(0xd8b04a, { metalness: 0.8, roughness: 0.3 }), [0, 0.12, 0.53]); },
  badge: (A, { col = 0xf2c420 }) => { add(A.body, new THREE.CylinderGeometry(0.17, 0.17, 0.05, 6), M(col, { metalness: 0.8, roughness: 0.3 }), [-0.5, 1.5, 0.53], [Math.PI / 2, 0, 0]); },
  armor: (A, { col = 0xb8bcc8 }) => { const m = M(col, { metalness: 0.85, roughness: 0.3 }); add(A.body, rb(2.12, 1.6, 1.14, 0.12), m, [0, 1.15, 0]); for (const s of [-1, 1]) add(A.body, new THREE.SphereGeometry(0.6, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), m, [s * 1.45, 1.72, 0]).scale.set(1, 0.6, 1); },
  overalls: (A, { col = 0x3a5a9a }) => { add(A.body, new THREE.BoxGeometry(1.3, 1.0, 0.05), M(col), [0, 0.55, 0.53]); for (const s of [-1, 1]) { add(A.body, new THREE.BoxGeometry(0.22, 1.1, 0.05), M(col), [s * 0.5, 1.5, 0.53]); add(A.body, new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), M(0xd8b04a, { metalness: 0.8 }), [s * 0.5, 1.05, 0.56], [Math.PI / 2, 0, 0]); } },
  labcoat: (A, { col = 0xf4f4f0 }) => { for (const s of [-1, 1]) add(A.body, new THREE.BoxGeometry(0.85, 3.0, 1.08), M(col, { roughness: 0.9 }), [s * 0.6, 0.55, 0]); add(A.body, new THREE.BoxGeometry(2.08, 3.0, 0.1), M(col, { roughness: 0.9 }), [0, 0.55, -0.52]);
    add(A.body, rb(0.4, 0.3, 0.04, 0.03), M(shade(col, 0.85)), [-0.55, 1.4, 0.56]); },
  tie: (A, { col = 0xc0262b }) => { add(A.body, new THREE.BoxGeometry(0.22, 1.3, 0.04), M(col), [0, 1.3, 0.53]); add(A.body, new THREE.BoxGeometry(0.28, 0.2, 0.06), M(shade(col, 0.8)), [0, 1.92, 0.54]); },
  bowtie: (A, { col = 0x1a1a1e }) => { for (const s of [-1, 1]) add(A.body, new THREE.ConeGeometry(0.16, 0.3, 4), M(col), [s * 0.14, 1.88, 0.55], [0, 0, s * Math.PI / 2]); },
  sash: (A, { col = 0xf2c420 }) => { add(A.body, new THREE.BoxGeometry(0.32, 2.7, 1.06), M(col), [0, 1.0, 0], [0, 0, 0.62]); },
  satchel: (A, { col = 0x8a5a2a }) => { add(A.body, new THREE.BoxGeometry(0.16, 2.7, 1.06), M(shade(col, 0.7)), [0, 1.0, 0], [0, 0, -0.62]); add(A.body, rb(0.8, 0.65, 0.3, 0.08), M(col), [0.95, 0.3, 0.45]); },
  lifevest: (A, { col = 0xf27a1a }) => { for (const s of [-1, 1]) add(A.body, rb(0.85, 1.6, 1.2, 0.2), M(col), [s * 0.55, 1.1, 0]); for (const y of [0.7, 1.3]) add(A.body, new THREE.BoxGeometry(2.1, 0.08, 1.22), M(0x2a2a2a), [0, y, 0]); },
  jetpack: (A, { col = 0xb8bcc8 }) => { for (const s of [-1, 1]) { add(A.body, new THREE.CylinderGeometry(0.3, 0.3, 1.5, 14), M(col, { metalness: 0.7, roughness: 0.3 }), [s * 0.4, 1.1, -0.85]);
    add(A.body, new THREE.ConeGeometry(0.25, 0.35, 12), M(0x3a3a3a), [s * 0.4, 0.2, -0.85], [Math.PI, 0, 0]); } add(A.body, new THREE.BoxGeometry(1.2, 1.2, 0.3), M(shade(col, 0.7)), [0, 1.1, -0.6]); },

  gloves: (A, { col = 0x3a3a3a }) => { for (const arm of [A.armR, A.armL]) add(arm, rb(1.06, 0.5, 1.06, 0.08), M(col, { roughness: 0.8 }), [0, -1.78, 0]); },
  boots: (A, { col = 0x3a2414 }) => { for (const leg of [A.legR, A.legL]) { add(leg, rb(1.06, 0.8, 1.1, 0.08), M(col, { roughness: 0.6 }), [0, -1.62, 0.03]); add(leg, new THREE.BoxGeometry(1.08, 0.1, 1.12), M(shade(col, 0.6)), [0, -1.25, 0.03]); } },
  wristband: (A, { col = 0xe8302a }) => { add(A.armR, new THREE.BoxGeometry(1.04, 0.22, 1.04), M(col, { roughness: 1 }), [0, -1.55, 0]); },
  skates: (A, { col = 0xf4f4f0, wheel = 0xff4ab8 }) => { for (const leg of [A.legR, A.legL]) { add(leg, rb(1.06, 0.75, 1.2, 0.1), M(col, { roughness: 0.5 }), [0, -1.55, 0.06]);
    add(leg, new THREE.BoxGeometry(0.5, 0.12, 1.3), M(0x8a8a90, { metalness: 0.6, roughness: 0.3 }), [0, -1.92, 0.06]); for (const z of [-0.42, 0.54]) add(leg, new THREE.CylinderGeometry(0.16, 0.16, 0.42, 14), M(wheel, { roughness: 0.4 }), [0, -1.88, z], [0, 0, Math.PI / 2]); } },
  kneepads: (A, { col = 0x2a2a2a }) => { for (const leg of [A.legR, A.legL]) add(leg, rb(0.7, 0.5, 0.2, 0.06), M(col), [0, -0.95, 0.52]); },
};
export const OUTFIT_ITEMS = Object.keys(ITEMS);
const HIDES_HAIR = ['beanie', 'helmet', 'hardhat', 'bandana', 'hood', 'knighthelm'];   // these sit tight on the head: hair would poke through ({ hair: true } keeps it)
export function outfit(A, items = []) {
  for (const it of items) { const [n, o] = Array.isArray(it) ? it : [it, {}]; const f = ITEMS[n]; if (!f) { console.warn('unknown outfit item', n); continue; }
    if (HIDES_HAIR.includes(n) && A.hairMesh && !(o && o.hair)) A.hairMesh.visible = false;
    const before = new Set(); [A.headMesh, A.body, A.armR, A.armL, A.legR, A.legL].forEach(p => p.traverse(c => before.add(c)));
    f(A, o || {});
    [A.headMesh, A.body, A.armR, A.armL, A.legR, A.legL].forEach(p => p.traverse(c => { if (c.isMesh && !before.has(c) && !c.material.transparent) { c.userData.avatar = A.name; c.userData.part = 'outfit ' + n; } })); }
  return A;
}
