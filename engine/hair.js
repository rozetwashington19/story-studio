// Sculpted Roblox-style hair. Every style is built from three primitives, merged into ONE mesh per avatar:
//   shell()  - a hair surface that follows the head with a per-style hairline (fringe / sides / back), thickness,
//              volume, flare and a chunky "lock" edge, so the hairline frames the face instead of a uniform cap
//   lock()   - a tapered, flattened strand swept along a curve (fringes, swoops, tails, face-framing strands)
//   cone / sphere pieces for spikes, buns and curls
// Head-local space: head center (0,0,0), front = +Z, top of head y=0.61, eyes y≈0.13, brows y≈0.28.
// Keep fringes above y≈0.32 across the face (|angle| < 50°) so faces stay readable.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const COILY = ['afro', 'curly', 'puffs', 'braids'];   // these get the coily (non-streaky) texture
export const HAIR_STYLES = ['short', 'swoop', 'spiky', 'buzz', 'mohawk', 'curly', 'afro', 'bun', 'ponytail', 'pigtails',
  'long', 'bob', 'braids', 'puffs'];

const HR = 0.62, RR = 0.34, CY = 0.27, FLAT = HR - RR, TOP = 0.61, ARC = RR * Math.PI / 2;
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// head profile by arc length s from the top center -> [r, y, nr, ny]
function prof(s) {
  if (s < FLAT) return [s, TOP, 0, 1];
  s -= FLAT; if (s < ARC) { const a = s / RR; return [FLAT + RR * Math.sin(a), CY + RR * Math.cos(a), Math.sin(a), Math.cos(a)]; }
  return [HR, CY - (s - ARC), 1, 0];
}
const sOfY = y => y >= CY ? FLAT + RR * Math.acos(Math.min(1, (y - CY) / RR)) : FLAT + ARC + (CY - y);
// blend a value by angle: f = front (θ=0), s = side (±90°), b = back (180°)
export const byAngle = (f, s, b) => th => { const c = Math.cos(th); return c >= 0 ? s + (f - s) * c * c : s + (b - s) * c * c; };

// Hair surface. opts: line(th)->hairline y, thick(th,y), flare(th,y)->extra horizontal radius, edge {amp,n,front}, rows
// clumps: {n (even), depth} raised hair clumps with grooves between them; swirl: grooves sweep sideways toward the hairline
function shell({ line, thick = () => 0.08, flare = () => 0, edge = null, clumps = { n: 16, depth: 0.035 }, swirl = 0, NT = 128, NV = 34 }) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= NT; i++) {
    const th = -Math.PI + (i / NT) * Math.PI * 2;   // seam at the back
    let hl = line(th);
    if (edge) { const w = edge.front ? sm(-0.2, 0.6, Math.cos(th)) : 1; hl -= edge.amp * w * Math.pow(1 - Math.abs(Math.sin(edge.n * th / 2)), 3); }
    const smax = sOfY(hl);
    for (let j = 0; j <= NV; j++) {
      const s = smax * Math.pow(j / NV, 0.85); const [r, y, nr, ny] = prof(s);
      const t = thick(th, y) * (0.35 + 0.65 * sm(0, 0.12, smax - s) + 0.0);   // thinner right at the hairline edge
      const tw = th + swirl * s, ridge = clumps ? clumps.depth * (1 - Math.pow(Math.abs(Math.sin(clumps.n * tw / 2)), 0.7)) * sm(0.05, 0.3, s) : 0;
      const R = r + (t + ridge) * nr + flare(th, y), Y = y + (t + ridge) * ny;
      pos.push(R * Math.sin(th), Y, R * Math.cos(th)); uv.push(i / NT * 1.5, s * 1.4);
    }
  }
  for (let i = 0; i < NT; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// tapered strand along points (head-local). r0 = root radius, flat = thickness ratio (flattened toward the head), tip = tip radius
function lock(points, r0, { flat = 0.5, tip = 0.02, seg = 18, rad = 10, taper = 1.0, bulge = 0.15 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const pos = [], uv = [], idx = []; const T = new THREE.Vector3(), O = new THREE.Vector3(), S = new THREE.Vector3(), P = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg; curve.getPointAt(t, P); curve.getTangentAt(t, T);
    O.copy(P).setY(P.y * 0.6); if (O.lengthSq() < 1e-6) O.set(0, 1, 0); O.normalize(); O.addScaledVector(T, -O.dot(T)).normalize();
    S.crossVectors(T, O).normalize();
    const r = Math.max(tip, r0 * (Math.pow(1 - t, taper) + bulge * Math.sin(Math.PI * t)));
    for (let k = 0; k <= rad; k++) {
      const a = k / rad * Math.PI * 2, cx = Math.cos(a) * r, cy = Math.sin(a) * r * flat;
      pos.push(P.x + S.x * cx + O.x * cy, P.y + S.y * cx + O.y * cy, P.z + S.z * cx + O.z * cy); uv.push(k / rad, t * 2);
    }
  }
  for (let i = 0; i < seg; i++) for (let k = 0; k < rad; k++) { const a = i * (rad + 1) + k, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function cone(base, dir, r, h) {   // spike from base point along dir
  const g = new THREE.ConeGeometry(r, h, 9, 1); g.translate(0, h / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()));
  g.translate(...base); return g;
}
function ball(c, r, sx = 1, sy = 1, sz = 1, d = 16) { const g = new THREE.SphereGeometry(r, d, Math.round(d * 0.75)); g.scale(sx, sy, sz); g.translate(...c); return g; }
function ring(c, r, tube, rot = [0, 0, 0]) { const g = new THREE.TorusGeometry(r, tube, 8, 24); g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]); g.translate(...c); return g; }
// point on the head surface at angle th (0 = front) and height y, pushed out by off
const onHead = (th, y, off = 0.1) => { const [r, yy, nr, ny] = prof(sOfY(y)); const R = r + off * nr; return [R * Math.sin(th), yy + off * ny, R * Math.cos(th)]; };
const D = Math.PI / 180;

function rng(seed) { let s = (Math.abs(seed | 0) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
export function hashStr(str) { let h = 7; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

// Build the hair geometry for a style. side = +1/-1 (part / swoop direction), rnd = seeded random
export function hairGeometry(style, { seed = 1 } = {}) {
  const R = rng(seed), side = R() < 0.5 ? -1 : 1; const G = [];
  const fringeLock = (th0, len, r0 = 0.16, droop = 0.18) => {   // a lock that starts near the crown and sweeps across the forehead
    const a = onHead(th0 * D, 0.58, 0.1), b = onHead((th0 + side * len * 0.5) * D, 0.47, 0.12), c = onHead((th0 + side * len) * D, 0.47 - droop, 0.1);
    G.push(lock([a, b, c], r0, { flat: 0.45 }));
  };
  switch (style) {
    case 'short': {     // boy cut: side part, choppy fringe swept to one side
      G.push(shell({ line: th => byAngle(0.40, -0.06, -0.52)(th) + side * 0.06 * Math.sin(th) * Math.max(0, Math.cos(th)),
        thick: (th, y) => 0.07 + 0.09 * sm(0.2, 0.6, y), edge: { amp: 0.09, n: 11, front: true }, clumps: { n: 14, depth: 0.045 }, swirl: side * 0.5 }));
      for (let k = 0; k < 4; k++) fringeLock(-side * (38 - k * 14), 30 + R() * 14, 0.15 + R() * 0.04, 0.12 + R() * 0.08);
      break;
    }
    case 'swoop': {     // short sides + one big quiff that rises off the forehead and sweeps back
      G.push(shell({ line: byAngle(0.42, -0.06, -0.5), thick: (th, y) => 0.05 + 0.06 * sm(0.3, 0.6, y) }));
      for (let k = -1; k <= 1; k++) { const th = k * 18 * D, x = Math.sin(th) * 0.5;
        G.push(lock([onHead(th, 0.42, 0.06), [x, 0.92, 0.5], [x * 0.8 + side * 0.08, 1.06, 0.05], [x * 0.6 + side * 0.15, 0.86, -0.42]], 0.27 - Math.abs(k) * 0.03, { flat: 0.6, bulge: 0.45, taper: 1.5, tip: 0.05 })); }
      break;
    }
    case 'spiky': {     // anime spikes radiating from the crown
      G.push(shell({ line: byAngle(0.40, 0.0, -0.46), thick: () => 0.08, edge: { amp: 0.12, n: 13 } }));
      const n = 13;
      for (let k = 0; k < n; k++) {
        const th = (k / n) * Math.PI * 2 + R() * 0.2, ring1 = k % 2 === 0, y = ring1 ? 0.5 : 0.62;
        const b = onHead(th, y, 0.02), out = [Math.sin(th) * (ring1 ? 0.9 : 0.5), ring1 ? 0.75 : 1.0, Math.cos(th) * (ring1 ? 0.9 : 0.5) - 0.25];
        G.push(cone(b, out, 0.2 + R() * 0.06, 0.55 + R() * 0.35));
      }
      for (let k = 0; k < 3; k++) G.push(cone([0.2 * (k - 1), 0.66, 0.05 - 0.1 * k], [0.25 * (k - 1), 1, -0.25], 0.22, 0.8 + R() * 0.3));
      break;
    }
    case 'buzz': {
      G.push(shell({ line: byAngle(0.44, 0.04, -0.46), thick: () => 0.03, clumps: { n: 30, depth: 0.012 } }));
      break;
    }
    case 'mohawk': {    // buzzed sides + a thick crest of overlapping locks swept back
      G.push(shell({ line: byAngle(0.44, 0.04, -0.46), thick: () => 0.025, clumps: null }));
      for (let k = 0; k < 6; k++) { const z = 0.32 - k * 0.17, y0 = 0.56 + Math.min(k, 1) * 0.06;
        G.push(lock([[0, y0, z], [0, 0.98 - k * 0.02, z - 0.08], [0, 1.08 - k * 0.03, z - 0.38], [0, 0.95 - k * 0.04, z - 0.62]], 0.24, { flat: 0.42, bulge: 0.3, taper: 1.2, tip: 0.03 })); }
      break;
    }
    case 'curly': {     // short curls: thin shell covered in little balls
      G.push(shell({ line: byAngle(0.42, -0.02, -0.48), thick: () => 0.1 }));
      for (let k = 0; k < 46; k++) {
        const th = R() * Math.PI * 2, y = 0.12 + R() * 0.52; if (Math.cos(th) > 0.55 && y < 0.42) continue;
        G.push(ball(onHead(th, y, 0.14), 0.12 + R() * 0.05, 1, 1, 1, 10));
      }
      break;
    }
    case 'afro': {      // a lumpy sphere around the head; the face opening is carved by pulling vertices inside the head
      let g = new THREE.IcosahedronGeometry(1, 30); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g);
      const P = g.attributes.position, line = byAngle(0.37, -0.12, -0.5), C = [0, 0.3, -0.1], uvs = [];
      for (let i = 0; i < P.count; i++) {
        const vx = P.getX(i), vy = P.getY(i), vz = P.getZ(i);
        const n = 1 + 0.045 * Math.sin(9 * vx + 2 * vy) * Math.sin(8 * vz + 1) + 0.035 * Math.sin(13 * vy + 3 * vx) * Math.cos(11 * vz) + 0.02 * Math.sin(21 * vx * vz + 5 * vy);
        let x = C[0] + vx * 1.02 * n, y = C[1] + vy * 0.9 * n, z = C[2] + vz * 0.98 * n;
        const th = Math.atan2(x, z);
        const w = sm(line(th) + 0.07, line(th) - 0.05, y);   // 0 above the hairline -> 1 below: tuck smoothly inside the head
        x *= 1 - 0.45 * w; z = z * (1 - 0.45 * w) - 0.05 * w; y = Math.max(y, -0.5 * w + y * (1 - w));
        P.setXYZ(i, x, y, z); uvs.push(Math.atan2(vx, vz) / Math.PI + 1, vy + 1);
      }
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.computeVertexNormals(); G.push(g);
      break;
    }
    case 'bun': {       // sleek top bun with a band and face-framing wisps
      G.push(shell({ line: byAngle(0.44, -0.06, -0.52), thick: () => 0.05, clumps: { n: 22, depth: 0.02 }, swirl: 0.0 }));
      G.push(ball([0, 0.86, -0.22], 0.36, 1, 0.85, 1, 20));
      G.push(ring([0, 0.66, -0.2], 0.24, 0.06, [Math.PI / 2 - 0.35, 0, 0]));
      for (const s of [-1, 1]) G.push(lock([onHead(s * 58 * D, 0.32, 0.07), onHead(s * 62 * D, 0.0, 0.1), onHead(s * 60 * D, -0.3, 0.12)], 0.07, { flat: 0.6 }));
      break;
    }
    case 'ponytail': {
      G.push(shell({ line: byAngle(0.42, -0.04, -0.46), thick: () => 0.06, edge: { amp: 0.05, n: 9, front: true } }));
      G.push(ring([0, 0.36, -0.68], 0.13, 0.06, [0.3, 0, 0]));
      G.push(lock([[0, 0.38, -0.7], [0, 0.32, -0.98], [0, -0.1, -1.05], [0, -0.6, -0.92], [0, -0.95, -0.8]], 0.3, { flat: 0.85, bulge: 0.4, taper: 1.0, tip: 0.1 }));
      fringeLock(-side * 30, 34, 0.13, 0.1);
      break;
    }
    case 'pigtails': {
      G.push(shell({ line: byAngle(0.40, -0.04, -0.48), thick: () => 0.06, edge: { amp: 0.08, n: 11, front: true } }));
      for (const s of [-1, 1]) {
        const b = [s * 0.66, 0.3, -0.25]; G.push(ring(b, 0.12, 0.06, [0, 0, Math.PI / 2]));
        G.push(lock([b, [s * 0.98, 0.22, -0.3], [s * 1.08, -0.2, -0.3], [s * 1.0, -0.65, -0.25]], 0.22, { flat: 0.85, bulge: 0.35, taper: 1.3 }));
      }
      break;
    }
    case 'long': {      // center part, curtain bangs, hair falls down the back and over the shoulders
      const line = th => { const a = Math.abs(th), c = Math.cos(th); if (a < 42 * D) return 0.36 - 0.06 * sm(10 * D, 42 * D, a);
        return 0.30 - sm(42 * D, 80 * D, a) * 0.95 - sm(-0.1, -1, c) * 0.55; };
      G.push(shell({ line, thick: (th, y) => 0.07 + 0.05 * sm(0.2, 0.6, y),
        flare: (th, y) => { const back = sm(0.1, -0.9, Math.cos(th)); return sm(-0.4, -1.3, y) * (0.12 + 0.45 * back); },
        edge: { amp: 0.1, n: 15 }, clumps: { n: 20, depth: 0.04 } }));
      for (const s of [-1, 1]) G.push(lock([onHead(s * 8 * D, 0.6, 0.1), onHead(s * 30 * D, 0.42, 0.13), onHead(s * 46 * D, 0.1, 0.12), onHead(s * 52 * D, -0.3, 0.14)], 0.15, { flat: 0.5 }));
      break;
    }
    case 'bob': {       // chin-length bob with blunt bangs, bottom curls under
      G.push(shell({ line: th => Math.abs(th) < 48 * D ? 0.34 : 0.34 - sm(48 * D, 62 * D, Math.abs(th)) * 0.8,
        thick: (th, y) => 0.1 + 0.06 * sm(0.2, 0.6, y), flare: (th, y) => 0.1 * sm(0.0, -0.35, y) - 0.05 * sm(-0.38, -0.46, y) }));
      break;
    }
    case 'braids': {    // box braids: cap + braids hanging down the back
      G.push(shell({ line: byAngle(0.42, -0.04, -0.42), thick: () => 0.06 }));
      for (let k = 0; k < 9; k++) {
        const th = (125 + k * 13.75) * D; const b = onHead(th, 0.05, 0.08);
        for (let q = 0; q < 9; q++) { const y = b[1] - q * 0.15, f = 1 + q * 0.04; G.push(ball([b[0] * f, y, b[2] * f - q * 0.02], 0.1 - q * 0.004, 1, 1.25, 1, 8)); }
      }
      break;
    }
    case 'puffs': {     // two afro puffs on top
      G.push(shell({ line: byAngle(0.42, -0.04, -0.48), thick: () => 0.06 }));
      for (const s of [-1, 1]) { G.push(ball([s * 0.5, 0.82, -0.1], 0.36, 1, 0.9, 1, 16)); G.push(ring([s * 0.42, 0.6, -0.08], 0.17, 0.05, [Math.PI / 2, 0, -s * 0.5])); }
      break;
    }
    default: return null;
  }
  const geos = G.map(g => {
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    const n = g.index ? g.toNonIndexed() : g; const k = new THREE.BufferGeometry();
    for (const at of ['position', 'normal', 'uv']) k.setAttribute(at, n.attributes[at]); return k;
  });
  return mergeGeometries(geos);
}
