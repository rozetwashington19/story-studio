// Episode 009 kit (Copycat Snow): living snowmen, a snowy small town, a porch, the Frost Fair field, and winter props.
// All sets: characters face +Z, camera at +Z. Sets return env with update(t) — call it every frame.
//
//   snowman(S, { name, size, scarf, earmuffs, hat, hatCol, glasses, bag, cap, seed })  living snowman (≈4.3 tall × size, faces +Z).
//       .root (place it) · .pose({ rUp, lUp, rFwd, lFwd, nod, turn, tilt, lean, bob, hop, squash, bodyTurn })  stick arms like an avatar
//       (rUp 150 = overhead, rFwd 90 = pointing forward; rest ≈ 45) · .face({ mouth -1 frown..1 smile, open 0..1 (roar "O"), brows + angry / − worried,
//       sleep 0..1 }) · .head (Group) · .hand('R'|'L') world position of a stick-hand tip. Parts are tagged for the collision checker under `name`.
//   catSnowman(S, { name, s })  tiny snow cat (two balls, ears, curled tail) · .update(t, 'sit'|'wag'|'hide'), .root
//   pup(S, { name, col, spot })  blocky town dog · .update(t, 'run'|'sit'|'bark'), .root (faces +Z)
//   knitting(S, col)  two needles + a crooked striped scarf piece (hold at a hand) · .click(t)
//   snoreZ(S)  floating "z z z" sprites for nappers · .update(t, [x,y,z], k)
//   snowBurst(S, { n, col, size })  puff of snow chunks · .fire(origin, t0, { up, spread }) then .update(t) every frame (several bursts allowed)
//   snowAngel(S, [x, z], s, ry)  snow-angel imprint on the ground (shaded relief decal) · .set(k) fades it in
//   mailbox(S, [x, z], ry) · bucket(S, col) · rosette(S, col) (prize ribbon, hold it) · shovel(S)
//   snowTown(S, { time: 'day'|'sunset'|'morning', mailbox: [x,z]|false, bunting })  small snowy street: plowed road (z -12..-6), sidewalk/yards (z > -5),
//       cozy houses (fronts z=-16, roofs with thick snow caps — env.roofSnow(k) slides them off), pines, lamp posts x ±13 (z -4.6), falling snow.
//       env.key (face light), env.sun, env.update(t).
//   snowPorch(S, { time })  house front (wall z=-5.2) + porch deck (top y 0.8, z -5.2..-1.2, x ±7) with a bench (seat top 2.1 at x -2.6, z -4.4),
//       railings at x ±7, warm window + door, icicles, snowy yard in front (z > -1.2). env.update(t), env.key.
//   frostFair(S, { time: 'day'|'sunset', clear: [[x,z,r]], arch, archX })  the snow() world dressed as the Frost Fair: bunting, banner arch (x ±9, z -12), judges' table (top 2.4 at (8,-3.5)
//       front z -2.9), entry flags, little entries. Sunset re-grades the snow() sky + sun. env.update(t), env.sun, env.key.
import * as THREE from 'three';
import { std, box } from './sets.js';
import { clouds } from './clouds.js';
import { snow, TX } from './themes.js';

const D = Math.PI / 180;
function rng(seed = 1) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const mesh = (g, m, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
const glowM = (col) => new THREE.MeshBasicMaterial({ color: col });
const hx = c => '#' + new THREE.Color(c).getHexString();
export const snowMat = (rx = 1, ry = 1, o = {}) => { const t = TX.snow().clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return std({ map: t, bumpMap: t, bumpScale: 2, roughness: 0.92, ...o }); };
const COAL = () => std({ color: 0x18181c, roughness: 0.55 });
const tag = (g, name, part = 'snowman') => g.traverse(m => { if (m.isMesh) { m.userData.avatar = name; m.userData.part = part; } });

// ---------------- living snowman ----------------
export function snowman(S, { name = 'snowman', size = 1, scarf = null, scarfTail = true, earmuffs = null, hat = null, hatCol = 0x1a1a22, glasses = false, bag = null, seed = 1, nose = 0xff7a1a, buttons = true, crooked = false } = {}) {
  const root = new THREE.Group(); root.scale.setScalar(size); S.add(root);
  const sm = snowMat(1, 1); const coal = COAL();
  const body = new THREE.Group(); root.add(body);               // squash/bob/hop
  const base = mesh(new THREE.SphereGeometry(1.15, 28, 20), sm); base.position.y = 1.05; base.scale.y = 0.93; body.add(base);
  const mid = new THREE.Group(); mid.position.y = 1.85; body.add(mid);   // lean pivot
  const torso = mesh(new THREE.SphereGeometry(0.82, 26, 18), sm); torso.position.y = 0.72; mid.add(torso);
  if (buttons) for (const [y, z] of [[0.95, 0.79], [0.62, 0.81], [0.3, 0.75]]) { const b = mesh(new THREE.SphereGeometry(0.075, 10, 8), coal); b.position.set(0, y, z); mid.add(b); }
  const head = new THREE.Group(); head.position.y = 1.62; mid.add(head);     // neck pivot (head centre 0.55 above)
  const hb = mesh(new THREE.SphereGeometry(0.6, 26, 18), sm); hb.position.y = 0.55; head.add(hb);
  const F = new THREE.Group(); F.position.y = 0.55; head.add(F);           // face frame (sphere centre)
  const eyeG = new THREE.SphereGeometry(0.085, 12, 10); const eyes = [-0.2, 0.2].map(x => { const e = mesh(eyeG, coal); e.position.set(x, 0.14, 0.555); F.add(e); return e; });
  const shine = eyes.map(e => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 4), glowM(0xffffff)); s.position.set(0.025, 0.035, 0.075); e.add(s); return s; });
  const brows = [-0.21, 0.21].map(x => { const b = mesh(new THREE.BoxGeometry(0.2, 0.045, 0.05), coal); b.position.set(x, 0.29, 0.52); F.add(b); return b; });
  const n = mesh(new THREE.ConeGeometry(0.08, 0.5, 10), std({ color: nose, roughness: 0.6 })); n.rotation.x = Math.PI / 2; n.position.set(0, 0.0, 0.8); F.add(n);
  const peb = [...Array(7)].map(() => { const p = mesh(new THREE.SphereGeometry(0.048, 8, 6), coal); F.add(p); return p; });
  const hole = mesh(new THREE.SphereGeometry(0.16, 16, 10), std({ color: 0x3a1a24, roughness: 0.9 })); hole.scale.set(1, 1, 0.3); F.add(hole);
  // arms: outer = forward (x rot), inner = up (z rot); stick hangs along -y before rotation
  const bark = std({ color: 0x5a3a22, roughness: 0.9 });
  const arms = [-1, 1].map(s => { const o = new THREE.Group(); o.position.set(s * 0.7, 0.85, 0); mid.add(o); const i = new THREE.Group(); o.add(i);
    const st = mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.5, 6), bark); st.position.y = -0.72; i.add(st);
    for (const [a, l] of [[0.6, 0.38], [-0.5, 0.32]]) { const tw = mesh(new THREE.CylinderGeometry(0.025, 0.035, l, 5), bark); tw.position.set(Math.sin(a) * l * 0.5, -1.38 - Math.cos(a) * l * 0.4, 0); tw.rotation.z = a; i.add(tw); }
    const tip = new THREE.Object3D(); tip.position.y = -1.55; i.add(tip); return { o, i, tip }; });
  // accessories
  if (scarf !== null) { const sc = std({ color: scarf, roughness: 0.95 }); const ring = mesh(new THREE.TorusGeometry(0.56, 0.13, 10, 24), sc); ring.rotation.x = Math.PI / 2; ring.position.y = 1.58; ring.scale.set(1, 1, 1.25); mid.add(ring);
    if (scarfTail) { const tl = mesh(new THREE.BoxGeometry(0.28, 0.9, 0.09), sc); tl.position.set(crooked ? 0.25 : 0.32, 1.12, 0.62); tl.rotation.set(-0.35, 0, crooked ? 0.5 : 0.12); mid.add(tl);
      if (crooked) for (let i = 0; i < 4; i++) { const st = mesh(new THREE.BoxGeometry(0.3, 0.08, 0.1), std({ color: [0xff6ad0, 0x7ae85a, 0xffd23a, 0x5aaaff][i] })); st.position.set(0, -0.3 + i * 0.2, 0.01); st.rotation.z = (i % 2 ? 0.3 : -0.25); tl.add(st); } } }
  if (earmuffs !== null) { const em = std({ color: earmuffs, roughness: 0.95 }); for (const s of [-1, 1]) { const m = mesh(new THREE.SphereGeometry(0.2, 14, 10), em); m.position.set(s * 0.6, 0.6, 0); m.scale.x = 0.6; head.add(m); }
    const band = mesh(new THREE.TorusGeometry(0.62, 0.04, 6, 24, Math.PI), std({ color: 0xe8e8f0, metalness: 0.4 })); band.position.y = 0.62; head.add(band); }
  if (hat === 'top') { const hm = std({ color: hatCol, roughness: 0.6 }); const br = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 20), hm); br.position.y = 1.08; head.add(br);
    const cr = mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.7, 20), hm); cr.position.y = 1.43; head.add(cr); head.children.slice(-2).forEach(c => { c.rotation.z = -0.12; }); }
  if (hat === 'cap') { const hm = std({ color: hatCol, roughness: 0.8 }); const c = mesh(new THREE.SphereGeometry(0.5, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm); c.position.y = 0.95; c.scale.y = 0.6; head.add(c);
    const v = mesh(new THREE.BoxGeometry(0.6, 0.04, 0.38), hm); v.position.set(0, 0.97, 0.5); head.add(v); }
  if (hat === 'bobble') { const hm = std({ color: hatCol, roughness: 0.95 }); const c = mesh(new THREE.SphereGeometry(0.55, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm); c.position.y = 0.82; c.scale.y = 0.8; head.add(c);
    const b = mesh(new THREE.SphereGeometry(0.17, 12, 8), std({ color: 0xffffff })); b.position.y = 1.33; head.add(b); }
  if (glasses) { const gm = std({ color: 0x3a2a1a, metalness: 0.3 }); for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.13, 0.02, 6, 18), gm); r.position.set(s * 0.2, 0.69, 0.57); head.add(r); } }
  if (bag !== null) { const bm = std({ color: bag, roughness: 0.8 }); const b = mesh(new THREE.BoxGeometry(0.7, 0.6, 0.3), bm); b.position.set(0.82, 0.45, 0.15); b.rotation.z = 0.1; mid.add(b);
    const strap = mesh(new THREE.TorusGeometry(0.85, 0.04, 6, 24), bm); strap.position.set(0.15, 0.95, 0); strap.rotation.set(0, 0, -0.6); strap.scale.z = 1.2; mid.add(strap); }
  tag(root, name);
  const P0 = { rUp: 45, lUp: 45, rFwd: 0, lFwd: 0, nod: 0, turn: 0, tilt: 0, lean: 0, bob: 0, hop: 0, squash: 0, bodyTurn: 0 };
  const api = { root, body, mid, head, arms, name, size,
    pose(p = {}) { const q = { ...P0, ...p };
      arms[0].o.rotation.x = -q.rFwd * D; arms[0].i.rotation.z = -q.rUp * D; arms[1].o.rotation.x = -q.lFwd * D; arms[1].i.rotation.z = q.lUp * D;
      const sq = q.squash; body.scale.set(1 + sq * 0.35, 1 - sq * 0.4, 1 + sq * 0.35); body.position.y = q.bob + q.hop; body.rotation.y = q.bodyTurn * D;
      mid.rotation.x = q.lean * D; mid.rotation.z = -q.tilt * 0.3 * D; head.rotation.set(q.nod * D, q.turn * D, -q.tilt * D); },
    face({ mouth = 1, open = 0, brows: b = 0, sleep = 0 } = {}) {
      peb.forEach((p, i) => { const u = i / (peb.length - 1) * 2 - 1;
        let x = u * 0.24, y = -0.24 + mouth * 0.1 * u * u - mouth * 0.03;
        if (open > 0) { const a = (i / peb.length) * Math.PI * 2 + Math.PI / 2; const ox = Math.cos(a) * 0.17, oy = -0.25 + Math.sin(a) * 0.15 * (0.4 + open); x = x + (ox - x) * Math.min(1, open * 1.5); y = y + (oy - y) * Math.min(1, open * 1.5); }
        p.position.set(x, y, Math.sqrt(Math.max(0, 0.6 * 0.6 - x * x - y * y)) + 0.01); });
      hole.visible = open > 0.05; hole.scale.set(1, 0.9 * open + 0.1, 0.3); hole.position.set(0, -0.25, 0.53);
      eyes.forEach(e => e.scale.set(1, 1 - sleep * 0.8, 1)); shine.forEach(s => { s.visible = sleep < 0.5; });
      brows[0].rotation.z = -b * 0.5; brows[1].rotation.z = b * 0.5; brows.forEach(br => { br.position.y = 0.29 - Math.max(0, b) * 0.04 + Math.max(0, -b) * 0.03 - sleep * 0.04; }); },
    hand(side = 'R') { root.updateMatrixWorld(true); return arms[side === 'R' ? 0 : 1].tip.getWorldPosition(new THREE.Vector3()); },
  };
  api.pose(); api.face(); return api;
}

// ---------------- tiny snow cat ----------------
export function catSnowman(S, { name = 'snowcat', s = 1 } = {}) {
  const root = new THREE.Group(); root.scale.setScalar(s); S.add(root); const sm = snowMat(0.5, 0.5); const coal = COAL();
  const body = mesh(new THREE.SphereGeometry(0.75, 22, 16), sm); body.position.y = 0.68; body.scale.set(1, 0.9, 1.1); root.add(body);
  const head = new THREE.Group(); head.position.set(0, 1.55, 0.25); root.add(head);
  const hb = mesh(new THREE.SphereGeometry(0.5, 22, 16), sm); hb.scale.set(1.1, 0.95, 1); head.add(hb);
  for (const x of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(0.18, 0.38, 4), sm); e.position.set(x * 0.3, 0.5, 0); e.rotation.z = -x * 0.25; head.add(e);
    const pk = mesh(new THREE.ConeGeometry(0.09, 0.2, 4), std({ color: 0xff9ab8 })); pk.position.set(x * 0.3, 0.47, 0.07); pk.rotation.z = -x * 0.25; head.add(pk);
    const ey = mesh(new THREE.SphereGeometry(0.07, 10, 8), coal); ey.position.set(x * 0.17, 0.08, 0.45); ey.scale.y = 1.3; head.add(ey);
    for (const k of [-1, 1]) { const w = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 4), coal); w.position.set(x * 0.28, -0.08 + k * 0.04, 0.42); w.rotation.z = Math.PI / 2 + k * x * 0.15; head.add(w); } }
  const nz = mesh(new THREE.SphereGeometry(0.05, 8, 6), std({ color: 0xff6a8a })); nz.position.set(0, -0.04, 0.5); head.add(nz);
  const tail = new THREE.Group(); tail.position.set(0, 0.5, -0.7); root.add(tail);
  const tm = mesh(new THREE.TorusGeometry(0.4, 0.12, 8, 16, Math.PI * 1.2), sm); tm.position.set(0, 0.4, 0); tm.rotation.y = Math.PI / 2; tail.add(tm);
  tag(root, name, 'snowcat');
  return { root, head, tail, update(t, mode = 'sit') {
    tail.rotation.z = Math.sin(t * (mode === 'wag' ? 7 : 2)) * (mode === 'wag' ? 0.5 : 0.15);
    head.rotation.z = mode === 'hide' ? 0 : Math.sin(t * 1.3) * 0.08; head.position.y = mode === 'hide' ? 1.35 + Math.sin(t * 30) * 0.015 : 1.55 + Math.sin(t * 2) * 0.03;
    head.rotation.x = mode === 'hide' ? 0.35 : 0; } };
}

// ---------------- blocky dog ----------------
export function pup(S, { name = 'dog', col = 0xc8843a, spot = 0xf2e2c8 } = {}) {
  const root = new THREE.Group(); S.add(root); const m = std({ color: col, roughness: 0.8 }), w = std({ color: spot, roughness: 0.8 }), dk = std({ color: 0x1a1210 });
  const body = new THREE.Group(); body.position.y = 1.2; root.add(body);
  const tor = mesh(new THREE.BoxGeometry(1.0, 0.9, 1.9), m); body.add(tor); const bel = mesh(new THREE.BoxGeometry(0.8, 0.2, 1.5), w); bel.position.y = -0.42; body.add(bel);
  const head = new THREE.Group(); head.position.set(0, 0.65, 1.05); body.add(head);
  head.add(Object.assign(mesh(new THREE.BoxGeometry(0.9, 0.85, 0.85), m), {}));
  const sn = mesh(new THREE.BoxGeometry(0.5, 0.4, 0.45), w); sn.position.set(0, -0.15, 0.6); head.add(sn); const nz = mesh(new THREE.BoxGeometry(0.2, 0.15, 0.1), dk); nz.position.set(0, -0.02, 0.85); head.add(nz);
  for (const x of [-1, 1]) { const e = mesh(new THREE.BoxGeometry(0.12, 0.14, 0.05), dk); e.position.set(x * 0.22, 0.15, 0.43); head.add(e);
    const ear = mesh(new THREE.BoxGeometry(0.22, 0.5, 0.12), std({ color: new THREE.Color(col).multiplyScalar(0.6) })); ear.position.set(x * 0.5, 0.05, -0.05); ear.rotation.z = x * 0.25; head.add(ear); }
  const tong = mesh(new THREE.BoxGeometry(0.18, 0.04, 0.25), std({ color: 0xff6a7a })); tong.position.set(0, -0.36, 0.7); head.add(tong);
  const legs = [[-0.32, 0.7], [0.32, 0.7], [-0.32, -0.7], [0.32, -0.7]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, -0.35, z); body.add(g); const l = mesh(new THREE.BoxGeometry(0.28, 0.85, 0.28), m); l.position.y = -0.42; g.add(l); return g; });
  const tail = new THREE.Group(); tail.position.set(0, 0.35, -0.95); body.add(tail); const tl = mesh(new THREE.BoxGeometry(0.14, 0.14, 0.6), m); tl.position.z = -0.25; tl.rotation.x = 0.6; tail.add(tl);
  tag(root, name, 'dog');
  return { root, head, update(t, mode = 'run') {
    const r = mode === 'run'; legs.forEach((g, i) => { g.rotation.x = r ? Math.sin(t * 16 + (i < 2 ? 0 : Math.PI) + (i % 2) * 0.6) * 0.8 : 0; });
    body.position.y = 1.2 + (r ? Math.abs(Math.sin(t * 16)) * 0.15 : 0); body.rotation.x = mode === 'sit' ? -0.35 : 0; if (mode === 'sit') body.position.y = 1.05;
    tail.rotation.y = Math.sin(t * 18) * 0.6; head.rotation.x = mode === 'bark' ? -0.2 + Math.abs(Math.sin(t * 9)) * -0.25 : Math.sin(t * 3) * 0.05; } };
}

// ---------------- props ----------------
export function knitting(S, col = 0xff6ad0) {
  const g = new THREE.Group(); S.add(g); const nm = std({ color: 0xd8c8a0, metalness: 0.3, roughness: 0.4 });
  const n1 = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), nm); n1.rotation.z = 0.9; g.add(n1); const n2 = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), nm); n2.rotation.z = -0.9; g.add(n2);
  const cols = [col, 0x7ae85a, 0xffd23a, 0x5aaaff, 0xff8a3a];
  for (let i = 0; i < 7; i++) { const p = mesh(new THREE.BoxGeometry(0.5 + (i % 3) * 0.12, 0.17, 0.08), std({ color: cols[i % cols.length], roughness: 1 })); p.position.set(Math.sin(i * 1.7) * 0.12, -0.15 - i * 0.16, 0); p.rotation.z = Math.sin(i * 2.3) * 0.35; g.add(p); }
  g.click = (t) => { n1.rotation.z = 0.9 + Math.sin(t * 12) * 0.15; n2.rotation.z = -0.9 - Math.sin(t * 12 + 1) * 0.15; };
  return g;
}
const zTex = ctex(64, 64, (x) => { x.fillStyle = '#ffffff'; x.font = '900 52px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('z', 32, 34); });
export function snoreZ(S) { const sp = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, color: 0xbcd4ff, transparent: true, depthWrite: false })); S.add(s); return s; });
  return { update(t, [x, y, z], k = 1) { sp.forEach((s, i) => { const u = ((t * 0.45 + i / 3) % 1); s.position.set(x + u * 1.2 * k + Math.sin(u * 6) * 0.15, y + u * 1.6 * k, z); s.scale.setScalar((0.35 + u * 0.4) * k); s.material.opacity = Math.sin(u * Math.PI); }); } }; }
export function snowBurst(S, { n = 60, col = 0xf4f8ff, size = 0.18, seed = 4 } = {}) {
  const R = rng(seed); const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(size, 0), std({ color: col, roughness: 0.9 }), n); im.castShadow = true; S.add(im);
  const P = [...Array(n)].map(() => [R() * 2 - 1, R(), R() * 2 - 1, 0.5 + R()]); const shots = []; const o = new THREE.Object3D();
  im.count = 0;
  return { fire(origin, t0, { up = 7, spread = 4, scale = 1 } = {}) { shots.push({ o: origin.clone ? origin.clone() : new THREE.Vector3(...origin), t0, up, spread, scale }); },
    update(t) { let c = 0; for (const s of shots) { const u = t - s.t0; if (u < 0 || u > 2.2) continue;
      for (const [dx, r, dz, sp] of P) { if (c >= n) break; const y = s.o.y + (s.up * (0.5 + r) * u - 9.8 * u * u); if (y < -0.3) continue;
        o.position.set(s.o.x + dx * s.spread * sp * u, Math.max(0, y), s.o.z + dz * s.spread * sp * u); o.scale.setScalar(s.scale * (1 - u / 2.6)); o.rotation.set(u * 3 * dx, u * 2, 0); o.updateMatrix(); im.setMatrixAt(c++, o.matrix); } }
      im.count = c; im.instanceMatrix.needsUpdate = true; } };
}
const angelTex = ctex(512, 512, (x, w, h) => { x.clearRect(0, 0, w, h); x.translate(w / 2, h / 2);
  const g = x.createRadialGradient(0, 0, 10, 0, 0, 250); g.addColorStop(0, 'rgba(70,100,170,0.85)'); g.addColorStop(1, 'rgba(90,120,190,0.6)'); x.fillStyle = g;
  x.beginPath(); x.ellipse(0, -150, 46, 46, 0, 0, 7); x.fill();                                  // head
  x.beginPath(); x.moveTo(-60, -100); x.quadraticCurveTo(-240, -170, -235, 10); x.quadraticCurveTo(-120, -10, -60, 40); x.closePath(); x.fill();   // wings
  x.beginPath(); x.moveTo(60, -100); x.quadraticCurveTo(240, -170, 235, 10); x.quadraticCurveTo(120, -10, 60, 40); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(-60, -100); x.lineTo(60, -100); x.lineTo(150, 230); x.quadraticCurveTo(0, 250, -150, 230); x.closePath(); x.fill();       // skirt (legs swept)
  x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = 10; x.beginPath(); x.moveTo(-235, 10); x.quadraticCurveTo(-240, -170, -60, -100); x.moveTo(235, 10); x.quadraticCurveTo(240, -170, 60, -100); x.stroke(); });
export function snowAngel(S, [x, z], s = 4, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshStandardMaterial({ map: angelTex, transparent: true, depthWrite: false, roughness: 1, opacity: 0 }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = ry * D; m.position.set(x, 0.02, z); m.receiveShadow = true; S.add(m); m.set = (k) => { m.material.opacity = k; }; return m;
}
export function mailbox(S, [x, z], ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry * D; S.add(g);
  const post = mesh(new THREE.BoxGeometry(0.3, 2.6, 0.3), std({ color: 0x6a4a2a })); post.position.y = 1.3; g.add(post);
  const bx = mesh(new THREE.BoxGeometry(1.2, 1.0, 1.9), std({ color: 0x2a5ad8, roughness: 0.5, metalness: 0.2 })); bx.position.y = 3.0; g.add(bx);
  const cap = mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.9, 16, 1, false, 0, Math.PI), std({ color: 0x2a5ad8, roughness: 0.5 })); cap.rotation.z = Math.PI / 2; cap.rotation.y = Math.PI / 2; cap.position.y = 3.5; g.add(cap);
  const sn = mesh(new THREE.SphereGeometry(0.7, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), snowMat()); sn.scale.set(1, 0.35, 1.5); sn.position.y = 4.05; g.add(sn);
  const flag = mesh(new THREE.BoxGeometry(0.06, 0.7, 0.3), std({ color: 0xe83a2a })); flag.position.set(0.63, 3.4, -0.4); g.add(flag);
  g.traverse(m => { if (m.isMesh) { m.userData.solid = true; m.name = 'mailbox'; } }); return g; }
export function bucket(S, col = 0x3a8ae8) { const g = new THREE.Group(); S.add(g); const m = std({ color: col, roughness: 0.5 });
  const b = mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.8, 16, 1, true), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, side: THREE.DoubleSide })); b.position.y = 0.4; g.add(b);
  const bt = mesh(new THREE.CircleGeometry(0.35, 16), m); bt.rotation.x = -Math.PI / 2; bt.position.y = 0.02; g.add(bt);
  const s = mesh(new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), snowMat()); s.scale.y = 0.5; s.position.y = 0.72; g.add(s);
  const h = mesh(new THREE.TorusGeometry(0.45, 0.025, 6, 16, Math.PI), std({ color: 0x8a8a8a, metalness: 0.6 })); h.position.y = 0.8; g.add(h); return g; }
export function rosette(S, col = 0x2a6ae8) { const g = new THREE.Group(); S.add(g); const m = std({ color: col, roughness: 0.6 });
  const d = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 18), m); d.rotation.x = Math.PI / 2; g.add(d);
  const c = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), std({ color: 0xffd23a, metalness: 0.5, roughness: 0.3 })); c.rotation.x = Math.PI / 2; c.position.z = 0.03; g.add(c);
  for (const s of [-1, 1]) { const tl = mesh(new THREE.BoxGeometry(0.22, 0.7, 0.03), m); tl.position.set(s * 0.14, -0.55, -0.01); tl.rotation.z = s * 0.2; g.add(tl); } return g; }
export function shovel(S) { const g = new THREE.Group(); S.add(g); const h = mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), std({ color: 0x8a5a2a })); h.position.y = 1.6; g.add(h);
  const bl = mesh(new THREE.BoxGeometry(1.2, 0.08, 1.0), std({ color: 0xe8402a, roughness: 0.5 })); bl.position.set(0, 0.04, 0.4); bl.rotation.x = 0.25; g.add(bl); return g; }

// ---------------- lighting / sky helpers ----------------
const SKY = { day: ['#5a92d8', '#dce8f6'], morning: ['#7aa8e0', '#ffe8d0'], sunset: ['#4a3a8a', '#ffb070'] };
function sky(S, time) { const [a, b] = SKY[time]; const t = ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); if (time === 'sunset') { g.addColorStop(0.55, '#e87a8a'); } g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, w, h); }); S.background = t; }
function winterLights(S, time, { area = 26, sunPos } = {}) {
  const sunset = time === 'sunset';
  S.fog = new THREE.Fog(sunset ? 0xe8b8a8 : 0xd0dcec, 50, 170);
  S.add(new THREE.HemisphereLight(sunset ? 0xffc8b0 : 0xd8e4ff, sunset ? 0x6a5a7a : 0x7a88a0, sunset ? 0.65 : 0.8));
  const sun = new THREE.DirectionalLight(sunset ? 0xffa060 : time === 'morning' ? 0xffe0b8 : 0xfff2e0, sunset ? 2.6 : 2.4);
  sun.position.set(...(sunPos || (sunset ? [-22, 9, 6] : [-10, 18, 12]))); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 120 }); S.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(sunset ? 0xff8a5a : 0xbcd4ff, 1.1); rim.position.set(10, 8, -14); S.add(rim);
  const key = new THREE.PointLight(sunset ? 0xffc8a0 : 0xfff0e0, 10, 18, 1.6); key.position.set(2, 6, 9); S.add(key);
  clouds(S, sunset ? { tint: 0xffc8a0 } : {});
  return { sun, key };
}
function flakes(S, n = 320, box = [-22, 22, 0, 18, -20, 12]) {
  const R = rng(9), im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 5, 4), std({ color: 0xffffff, emissive: 0x8090a0, roughness: 1 }), n); S.add(im);
  const P = [...Array(n)].map(() => [box[0] + R() * (box[1] - box[0]), box[2] + R() * (box[3] - box[2]), box[4] + R() * (box[5] - box[4]), R() * 6.3]); const o = new THREE.Object3D();
  return (t) => { P.forEach(([x, y, z, ph], i) => { const h = box[3] - box[2]; let yy = y - 1.1 * t; yy = box[2] + (((yy - box[2]) % h) + h) % h; o.position.set(x + Math.sin(t * 0.7 + ph) * 0.6, yy, z + Math.cos(t * 0.5 + ph) * 0.4); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.instanceMatrix.needsUpdate = true; };
}
function pine(S, [x, z], h = 7, s = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); S.add(g);
  const tr = mesh(new THREE.CylinderGeometry(0.3, 0.45, 2, 8), std({ color: 0x5a3a22 })); tr.position.y = 1; g.add(tr);
  const lm = std({ color: 0x2a5a3a, roughness: 0.9 }), sm = snowMat(0.5, 0.5);
  for (let i = 0; i < 4; i++) { const r = 2.6 - i * 0.55, y = 2 + i * (h - 2) / 4.2; const c = mesh(new THREE.ConeGeometry(r, 2.4, 9), lm); c.position.y = y + 1; g.add(c); const sc = mesh(new THREE.ConeGeometry(r * 0.72, 1.1, 9), sm); sc.position.y = y + 1.75; g.add(sc); }
  return g; }
const houseTex = (col, seed) => ctex(256, 256, (x, w, h) => { x.fillStyle = hx(col); x.fillRect(0, 0, w, h); const k = new THREE.Color(col).multiplyScalar(0.86);
  x.fillStyle = '#' + k.getHexString(); for (let y = 0; y < h; y += 16) x.fillRect(0, y, w, 3); });
function house(S, x, z, w, h, col, R, time) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
  const wall = mesh(new THREE.BoxGeometry(w, h, 8), std({ map: houseTex(col), roughness: 0.85 })); wall.position.set(0, h / 2, -4); g.add(wall);
  const rh = w * 0.38;
  // simple gable: two sloped slabs
  const slope = Math.atan2(rh, w / 2), sl = Math.hypot(rh, w / 2) + 0.6;
  const rm = std({ color: [0x7a3a32, 0x3a4a6a, 0x4a5a3a][Math.floor(R() * 3)], roughness: 0.8 }); const caps = [];
  for (const s of [-1, 1]) { const p = mesh(new THREE.BoxGeometry(sl, 0.3, 9), rm); p.position.set(s * w / 4, h + rh / 2, -4); p.rotation.z = -s * slope; g.add(p);
    const cap = new THREE.Group(); cap.position.copy(p.position); cap.rotation.z = p.rotation.z; g.add(cap);
    const sn = mesh(new THREE.BoxGeometry(sl + 0.2, 0.55, 9.3), snowMat(2, 2)); sn.position.y = 0.38; cap.add(sn);
    const lip = mesh(new THREE.CylinderGeometry(0.32, 0.32, 9.3, 10), snowMat(1, 2)); lip.rotation.x = Math.PI / 2; lip.position.set(s * sl / 2, 0.3, 0); cap.add(lip);
    cap.userData = { s, slope, base: cap.position.clone() }; caps.push(cap); }
  const gab = new THREE.Shape(); gab.moveTo(-w / 2, 0); gab.lineTo(w / 2, 0); gab.lineTo(0, rh); gab.closePath();
  const gm = mesh(new THREE.ShapeGeometry(gab), std({ map: houseTex(col), roughness: 0.85 })); gm.position.set(0, h, 0.01); g.add(gm);
  const win = glowM(time === 'day' ? 0xbcd0e8 : 0xffd890), fr = std({ color: 0xf6f2ea });
  for (const wx of [-w * 0.28, w * 0.28]) { const f = mesh(new THREE.BoxGeometry(2.0, 2.4, 0.2), fr); f.position.set(wx, h * 0.55, 0.05); g.add(f); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), win); p.position.set(wx, h * 0.55, 0.16); g.add(p);
    const sill = mesh(new THREE.BoxGeometry(2.3, 0.35, 0.5), snowMat()); sill.position.set(wx, h * 0.55 - 1.3, 0.25); g.add(sill); }
  const door = mesh(new THREE.BoxGeometry(1.8, 3.2, 0.2), std({ color: [0xc83a3a, 0x2a6a4a, 0x3a5ac8, 0xe8a83a][Math.floor(R() * 4)] })); door.position.set(0, 1.6, 0.05); g.add(door);
  const wreath = mesh(new THREE.TorusGeometry(0.42, 0.13, 8, 16), std({ color: 0x2a6a3a })); wreath.position.set(0, 2.5, 0.25); g.add(wreath);
  const ch = mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), std({ color: 0x8a4a3a })); ch.position.set(w * 0.25, h + rh * 0.7, -5); g.add(ch);
  // icicles
  const ice = std({ color: 0xd8f0ff, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 9; i++) { const ic = mesh(new THREE.ConeGeometry(0.09, 0.4 + R() * 0.5, 5), ice, false); ic.rotation.x = Math.PI; ic.position.set(-w / 2 + 0.4 + i * (w - 0.8) / 8, h - 0.25, 0.1); g.add(ic); }
  return { g, caps, chimney: new THREE.Vector3(x + w * 0.25, h + rh * 0.7 + 1.2, z - 5) };
}
function smoke(S, pts) { const R = rng(3); const m = new THREE.MeshStandardMaterial({ color: 0xe8ecf2, transparent: true, opacity: 0.5, roughness: 1, depthWrite: false });
  const P = []; pts.forEach(p => { for (let i = 0; i < 6; i++) { const s = mesh(new THREE.SphereGeometry(0.5, 8, 6), m.clone(), false); S.add(s); P.push([s, p, i / 6, R()]); } });
  return (t) => P.forEach(([s, p, ph, r]) => { const u = (t * 0.18 + ph) % 1; s.position.set(p.x + u * 2.5 + Math.sin(u * 5 + r * 6) * 0.3, p.y + u * 6, p.z); s.scale.setScalar(0.6 + u * 1.8); s.material.opacity = 0.45 * (1 - u); }); }
function bunting(S, a, b, n = 14, sag = 1) { const cols = [0xe83a3a, 0xffd23a, 0x3a8ae8, 0x5ac85a, 0xff8ad0]; const g = new THREE.Group(); S.add(g);
  const pt = u => new THREE.Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * sag, a[2] + (b[2] - a[2]) * u);
  const curve = new THREE.CatmullRomCurve3([...Array(9)].map((_, i) => pt(i / 8))); g.add(mesh(new THREE.TubeGeometry(curve, 24, 0.03, 4), std({ color: 0xf2f2f2 }), false));
  for (let i = 1; i < n; i++) { const p = pt(i / n); const tri = new THREE.Shape(); tri.moveTo(-0.35, 0); tri.lineTo(0.35, 0); tri.lineTo(0, -0.7); tri.closePath();
    const f = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshStandardMaterial({ color: cols[i % cols.length], side: THREE.DoubleSide, roughness: 0.8 })); f.position.copy(p); f.lookAt(p.x, p.y, p.z + 10); g.add(f); }
  return g; }
function lampPost(S, x, z, on) { box(S, [0.3, 7, 0.3], [x, 3.5, z], std({ color: 0x2a2a30, metalness: 0.5 }), { r: 0.05, name: 'lamp post' });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), on ? glowM(0xffe8b0) : std({ color: 0xf2f0e8, roughness: 0.3 })); b.position.set(x, 7.2, z); S.add(b);
  const cap = mesh(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), snowMat()); cap.scale.y = 0.4; cap.position.set(x, 7.55, z); S.add(cap);
  if (on) { const l = new THREE.PointLight(0xffd8a0, 14, 14, 1.6); l.position.set(x, 7, z + 0.6); S.add(l); } }

// ---------------- sets ----------------
export function snowTown(S, { time = 'day', mailbox: mb = false, bunting: bt = true, flakesOn = true, houses = true, lamps = true, fences = true } = {}) {
  sky(S, time); const L = winterLights(S, time);
  box(S, [200, 0.3, 160], [0, -0.15, -40], snowMat(30, 24), { r: 0, cast: false, name: 'ground' });
  box(S, [200, 0.06, 6], [0, 0.02, -9], std({ color: 0xb8c0cc, roughness: 0.7, map: TX.snow() }), { r: 0, cast: false, solid: false, name: 'road' });
  const banks = snowMat(2, 1); for (const z of [-5.6, -12.4]) for (let x = -60; x < 60; x += 6) { const b = mesh(new THREE.SphereGeometry(1.6, 12, 8), banks); b.scale.set(2.0, 0.35, 0.6); b.position.set(x + (z > -8 ? 0 : 3), 0, z); S.add(b); }
  const R = rng(21); const roofs = []; const chims = [];
  if (houses) { const cols = [0xf2c8a8, 0xbcd8e8, 0xf6e2a8, 0xd8c0e8, 0xc8e0c0, 0xf2b8b8]; let x = -52;
    while (x < 52) { const w = 10 + R() * 3, h = 6.5 + R() * 2; const H = house(S, x + w / 2, -16, w, h, cols[Math.floor(R() * cols.length)], R, time); roofs.push(...H.caps); chims.push(H.chimney);
      if (x + w + 3 < 52) pine(S, [x + w + 1.6, -19], 7 + R() * 3, 0.9 + R() * 0.3); x += w + 3.2; } }
  for (const [x, z, s] of [[-24, -25, 1.3], [8, -27, 1.5], [30, -24, 1.2], [-40, -26, 1.4]]) pine(S, [x, z], 9, s);
  if (lamps) { lampPost(S, -13, -4.6, time !== 'day'); lampPost(S, 13, -4.6, time !== 'day'); }
  if (fences) for (const x of [-30, -20, 20, 30]) { box(S, [7, 1.1, 0.25], [x, 0.55, -4.4], std({ color: 0xf2efe8 }), { r: 0.05, name: 'fence' }); }
  if (bt) { bunting(S, [-13, 6.8, -4.6], [13, 6.8, -4.6], 22, 1.2); }
  let mbox = null; if (mb) mbox = mailbox(S, mb, 0);
  const sm = smoke(S, chims.filter((_, i) => i % 2 === 0)); const fl = flakesOn ? flakes(S) : () => {};
  const env = { ...L, mailbox: mbox, roofs,
    roofSnow(k, t = 0) { roofs.forEach((c, i) => { const u = Math.max(0, Math.min(1, k * 1.3 - (i % 4) * 0.1)); const s = c.userData.s;
      c.position.set(c.userData.base.x + s * u * 4.5 * Math.cos(c.userData.slope), c.userData.base.y - u * u * 9, c.userData.base.z + u * 0.5); c.rotation.z = -s * c.userData.slope * (1 - u) - s * u * 0.6; c.visible = u < 0.98; }); },
    update(t) { sm(t); fl(t); } };
  return env;
}
export function snowPorch(S, { time = 'day' } = {}) {
  sky(S, time); const L = winterLights(S, time, { sunPos: [-12, 16, 14] });
  box(S, [120, 0.3, 120], [0, -0.15, 0], snowMat(20, 20), { r: 0, cast: false, name: 'ground' });
  const wallM = std({ map: houseTex(0xbcd8e8), roughness: 0.85 }); const wm2 = wallM.map.clone(); wm2.repeat.set(4, 2); wallM.map = wm2;
  box(S, [26, 12, 0.6], [0, 6, -5.5], wallM, { r: 0, cast: false, name: 'house wall' });
  box(S, [14.4, 0.8, 4.2], [0, 0.4, -3.2], std({ color: 0x8a6a4a, roughness: 0.8 }), { r: 0.04, name: 'porch deck' });
  box(S, [14.6, 0.12, 4.4], [0, 0.86, -3.2], snowMat(3, 1), { r: 0.04, cast: false, solid: false, name: 'deck snow' });
  box(S, [3.2, 0.4, 1.2], [0, 0.2, -0.6], std({ color: 0x7a5a3a }), { r: 0.03, name: 'step' });
  const post = std({ color: 0xf2efe8 }); for (const x of [-7, 7]) { box(S, [0.4, 8, 0.4], [x, 4.4, -1.4], post, { r: 0.05, name: 'porch post' }); box(S, [0.18, 2.2, 3.8], [x, 1.9, -3.3], post, { r: 0.03, name: 'railing' }); }
  box(S, [16, 0.4, 5], [0, 8.6, -3.2], std({ color: 0x5a3a32 }), { r: 0.05, cast: true, name: 'porch roof' });
  const rs = mesh(new THREE.BoxGeometry(16.4, 0.6, 5.3), snowMat(3, 1)); rs.position.set(0, 9.1, -3.2); S.add(rs);
  const ice = std({ color: 0xd8f0ff, roughness: 0.15, transparent: true, opacity: 0.85 }); const R = rng(4);
  for (let i = 0; i < 22; i++) { const ic = mesh(new THREE.ConeGeometry(0.1, 0.5 + R() * 0.9, 5), ice, false); ic.rotation.x = Math.PI; ic.position.set(-7.8 + i * 0.74, 8.1, -0.75); S.add(ic); }
  // door + window
  box(S, [2.6, 5, 0.3], [4.2, 3.3, -5.1], std({ color: 0x2a6a4a }), { r: 0.05, name: 'door' });
  const wf = std({ color: 0xf6f2ea }); box(S, [3.6, 3.0, 0.3], [-2.6, 4.6, -5.1], wf, { r: 0.05, name: 'window' });
  const wp = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.4), glowM(0xffd890)); wp.position.set(-2.6, 4.6, -4.93); S.add(wp);
  const wl = new THREE.PointLight(0xffc880, 6, 9, 1.6); wl.position.set(-2.6, 4.4, -3.6); S.add(wl);
  const wreath = mesh(new THREE.TorusGeometry(0.55, 0.16, 8, 18), std({ color: 0x2a6a3a })); wreath.position.set(4.2, 4.6, -4.85); S.add(wreath);
  const bow = mesh(new THREE.BoxGeometry(0.5, 0.25, 0.1), std({ color: 0xd83a3a })); bow.position.set(4.2, 4.05, -4.78); S.add(bow);
  // bench
  const wood = std({ color: 0x9a6a3a, roughness: 0.8 });
  box(S, [4.4, 0.25, 1.4], [-2.6, 1.95, -4.3], wood, { r: 0.04, name: 'bench seat' }); box(S, [4.4, 1.6, 0.2], [-2.6, 2.9, -5.0], wood, { r: 0.04, name: 'bench back' });
  for (const x of [-4.6, -0.6]) box(S, [0.2, 1.1, 1.2], [x, 1.35, -4.3], wood, { r: 0.03, name: 'bench leg' });
  // yard dressing
  for (const [x, z, s] of [[-12, -9, 1.2], [12, -10, 1.3], [-17, -4, 1.0], [18, -3, 1.1]]) pine(S, [x, z], 8, s);
  for (const [x, z] of [[-10.5, 2], [10.5, 3], [-14, 7]]) { const b = mesh(new THREE.SphereGeometry(1.4, 12, 8), snowMat()); b.scale.set(1.6, 0.4, 1); b.position.set(x, 0, z); S.add(b); }
  const sled = new THREE.Group(); sled.position.set(9.5, 0, 1.5); sled.rotation.y = -0.6; S.add(sled); const sb = mesh(new THREE.BoxGeometry(1.4, 0.15, 3.0), std({ color: 0xd83a3a })); sb.position.y = 0.45; sled.add(sb);
  for (const x of [-0.6, 0.6]) { const r = mesh(new THREE.BoxGeometry(0.08, 0.3, 3.2), std({ color: 0x3a3a3a, metalness: 0.6 })); r.position.set(x, 0.18, 0); sled.add(r); }
  const fl = flakes(S, 220, [-16, 16, 0, 14, -2, 14]);
  return { ...L, update(t) { fl(t); } };
}
export function frostFair(S, { time = 'day', clear = [], arch = true, archX: ax = 0 } = {}) {
  const env = snow(S);
  // clear: [[x, z, r], …] hides trees/rocks/snowmen of the snow() world around those points (room for big actors)
  S.children.slice().forEach(o => { if (o.isLight || o.isCamera) return; const p = o.position; if (clear.some(([x, z, r]) => Math.hypot(p.x - x, p.z - z) < r) && Math.abs(p.y) < 20 && !(o.geometry && o.geometry.parameters && o.geometry.parameters.width > 100)) o.visible = false; });
  // re-grade the snow() rig for sunset
  const lights = []; S.traverse(o => { if (o.isLight) lights.push(o); });
  const sun = lights.find(l => l.isDirectionalLight && l.castShadow);
  if (time === 'sunset') { sky(S, 'sunset'); S.fog.color.set(0xe8b8a8); lights.forEach(l => { if (l.isHemisphereLight) { l.color.set(0xffe2ec); l.groundColor.set(0xa898c8); l.intensity = 1.05; }
      else if (l === sun) { l.color.set(0xffd0b0); l.intensity = 2.3; l.position.set(-16, 11, 24); } else if (l.isDirectionalLight) { l.color.set(0xff8a5a); l.intensity = 1.2; } });
    S.children.filter(o => o.userData && o.userData.cloud).forEach(c => c.traverse(m => { if (m.material && m.material.color) m.material.color.set(0xffc8a0); })); }
  if (sun) { Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, far: 140 }); sun.shadow.camera.updateProjectionMatrix(); }
  const key = new THREE.PointLight(time === 'sunset' ? 0xffc8a0 : 0xfff0e0, 9, 18, 1.6); key.position.set(2, 6, 9); S.add(key);
  // banner arch
  if (arch) {
  const pm = std({ color: 0x8a5a3a }); for (const x of [ax - 9, ax + 9]) box(S, [0.5, 9, 0.5], [x, 4.5, -12], pm, { r: 0.05, name: 'arch post' });
  const bt = ctex(1024, 192, (x, w, h) => { x.fillStyle = '#d83a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff6e0'; x.font = '900 120px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FROST FAIR', w / 2, h / 2 + 6);
    x.fillStyle = '#ffd23a'; for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(40 + i * 86, 18, 7, 0, 7); x.fill(); x.beginPath(); x.arc(40 + i * 86, h - 18, 7, 0, 7); x.fill(); } });
  const banner = new THREE.Mesh(new THREE.BoxGeometry(17, 3.0, 0.2), [std({ color: 0xd83a3a }), std({ color: 0xd83a3a }), std({ color: 0xd83a3a }), std({ color: 0xd83a3a }), std({ map: bt }), std({ map: bt })]);
  banner.position.set(ax, 8.6, -12); banner.castShadow = true; S.add(banner);
  const bs = mesh(new THREE.BoxGeometry(17.4, 0.4, 0.6), snowMat(3, 1)); bs.position.set(ax, 10.3, -12); S.add(bs);
  bunting(S, [ax - 9, 6.5, -12], [ax - 24, 5, -2], 14, 1.0); bunting(S, [ax + 9, 6.5, -12], [ax + 24, 5, -2], 14, 1.0); }
  // judges' table
  const cloth = std({ color: 0x2a5ad8, roughness: 0.9 }); box(S, [5, 2.4, 1.6], [8, 1.2, -3.5], cloth, { r: 0.05, name: 'judge table' });
  const tt = std({ color: 0xffffff }); box(S, [5.2, 0.1, 1.8], [8, 2.42, -3.5], tt, { r: 0.02, solid: false, name: 'tablecloth' });
  [0xd83a3a, 0x2a6ae8, 0xffd23a].forEach((c, i) => { const r = rosette(S, c); r.position.set(6.6 + i * 1.3, 2.9, -3.0); r.rotation.x = -0.6; r.scale.setScalar(0.8); });
  const tro = mesh(new THREE.CylinderGeometry(0.35, 0.2, 0.9, 12), std({ color: 0xffc83a, metalness: 0.8, roughness: 0.25 })); tro.position.set(9.6, 2.9, -3.7); S.add(tro);
  // entry flags + little entries
  const R = rng(12); for (const [x, z] of [[-11, -7], [-13, 1], [13, -9], [-15, -12], [15, -1]]) { const f = new THREE.Group(); f.position.set(x, 0, z); S.add(f);
    const p = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6), std({ color: 0x6a4a2a })); p.position.y = 1.3; f.add(p);
    const tri = mesh(new THREE.BoxGeometry(0.8, 0.5, 0.04), std({ color: [0xe83a3a, 0x3a8ae8, 0xffd23a, 0x5ac85a][Math.floor(R() * 4)] })); tri.position.set(0.42, 2.3, 0); f.add(tri);
    const sb = snowman(S, { name: 'entry' + x, size: 0.55 + R() * 0.25, scarf: [0xe83a3a, 0x3a8ae8, 0x5ac85a][Math.floor(R() * 3)], hat: R() > 0.5 ? 'top' : null, buttons: true }); sb.root.position.set(x + 1.3, 0, z); sb.root.rotation.y = (R() - 0.5) * 0.6; sb.face({ mouth: 1 });
    sb.root.traverse(m => { if (m.isMesh) delete m.userData.avatar; }); }
  return { update: env.update, sun, key };
}
