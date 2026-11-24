import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky,
  sugarStreet, giantHand, skyCrack, bird, clipboard } from '../../engine/kit.js';
import { clove, gus, fudd, mayor, towny, pipingBag, GUS_Z, DECK_Y, CHIM,
  ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, rumble, clamp01 } from './common.js';

const HIPS = POSES.hips;
const CROSS = { rFwd: 75, lFwd: 75, rUp: -38, lUp: -38 };
// the giant hand gripping something whose top centre is at p (palm in front, fingers curl behind it)
// palm behind the chimney (hand turned around), fingers wrap in front of it — keeps cameras in front of the house clear
export const handAt = (H, p, lift = 0) => { H.root.position.set(p[0], p[1] + 9.0 + lift, p[2] - 2.8); H.root.rotation.y = Math.PI; };
// a crack in the sky straight above x,z
export function crackAbove(S, x, z, k = 1, { y = 88, w = 70, h = 16, target } = {}) { const c = skyCrack(S, [x, y, z], { w, h }); c.g.rotation.x = 0.55; c.open(k);
  c.light.position.set(x, y - 4, z + 10); c.light.target.position.set(...(target || [x, 0, z])); return c; }
// brown "coffee" wisps drifting down out of the morning sky
function coffeeWisps(S, n = 14) { const ws = []; const m = new THREE.MeshBasicMaterial({ color: 0xc89a6a, transparent: true, opacity: 0.35, depthWrite: false });
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), m.clone()); s.scale.set(1.6, 0.6, 1); S.add(s); ws.push(s); }
  return (t) => ws.forEach((s, i) => { const u = (t * 0.12 + i / n) % 1; s.position.set(-14 + (i * 7.3) % 28 + Math.sin(t * 0.8 + i) * 1.5, 30 - u * 22, -6 - (i % 4) * 3); s.material.opacity = 0.32 * Math.sin(Math.PI * u); s.scale.set(1.6 + u * 1.5, 0.6 + u * 0.4, 1); }); }
// shared: Gus's house lifts with the hand
export function liftHouse(env, H, lift, grip = 1) { const g = env.houses.gus.g; g.position.y = lift; handAt(H, CHIM, lift); H.grip(grip); }

export const SHOTS_A = [
  // 2 "Every night at nine, the sky opens."  — night street, a neighbour hurries home and looks up; the camera tilts up as a glowing crack splits the sky
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night' });
    const T = towny(S, 1, 'worried', [-6, 0, 3], 90); const c = crackAbove(S, 2, -40, 0, { y: 92 });
    return (t, dur) => { env.update(t); const k = sm(t, dur * 0.25, dur * 0.9); c.open(k);
      const st = t < dur * 0.45; T.root.position.x = -6 + Math.min(t, dur * 0.45) * 4.2; T.root.rotation.y = (st ? 90 : hn([[dur * 0.45, 90], [dur * 0.6, 160]], t)) * D;
      T.pose(st ? walk(t, 9, 1) : addPose(idle(t, 1), hit([[dur * 0.45, {}], [dur * 0.65, { nod: -40, lUp: 20, rUp: 20, bob: -0.05 }]], t))); if (!st) T.setFace(t > dur * 0.6 ? 'scared' : 'shock');
      camPath(cam, sm(t, 0, dur), [-4, 3.0, 18], [-3, 2.6, 17], [0, 7, -10], [2, 36, -30], 22, 22);
    };
  },
  // 3 "A giant hand reaches down and takes one house."  — the hand comes down through the crack, closes on a pretty house's chimney and lifts it away
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night' }); const h = env.houses.h60; const H = giantHand(S); const ch = [60 + h.chimney.x, h.chimney.y, -10 - h.d / 2];
    const c = crackAbove(S, ch[0], ch[2], 1, { y: 95, target: [60, 0, -15] });
    const T = towny(S, 3, 'shock', [47, 0, 7], 160);
    return (t, dur) => { env.update(t);
      const down = hn([[0, 40], [dur * 0.42, 0]], t, x => 1 - Math.pow(1 - x, 3)); const grip = sm(t, dur * 0.42, dur * 0.58); const lift = Math.pow(sm(t, dur * 0.6, dur), 1.6) * 26;
      handAt(H, ch, down + lift); H.grip(grip); h.g.position.y = lift; h.g.rotation.z = Math.sin(t * 3) * 0.03 * (lift > 0.1 ? 1 : 0);
      T.pose(addPose(idle(t, 1), hit([[dur * 0.3, {}], [dur * 0.55, { lFwd: 120, rFwd: 110, rUp: -20, lUp: -20, nod: -18 }]], t))); T.setFace(t > dur * 0.6 ? 'scared' : 'shock');
      camPath(cam, t / dur, [42, 5, 23], [43, 4.5, 21.5], [58, 14, -14], [60, 22, -16], 20, 20); if (lift > 0) rumble(cam, t, 0.5);
    };
  },
  // 4 "You see, it always takes the prettiest one."  — daytime dolly along the street to an empty, crumb-covered plot where the prettiest house stood; a neighbour sighs
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' }); env.houses.h60.g.visible = false;
    const plot = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.3, 10.4), new THREE.MeshStandardMaterial({ color: 0x9a5a2a, roughness: 0.9 })); plot.position.set(60, 0.15, -15); S.add(plot);
    for (let i = 0; i < 14; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: [0xff3a6a, 0x3ad8a8, 0xffd23a, 0x9a5aff][i % 4], roughness: 0.3 })); g.position.set(55 + (i * 3.7) % 11, 0.3, -19 + (i * 2.3) % 8); S.add(g); }
    const T = towny(S, 0, 'sad', [52, 0, -4.5], -90);
    return (t, dur) => { env.update(t); const x = 52 + t * 1.6; T.root.position.x = x; T.pose(addPose(walk(t, 6, 0.8), { nod: 10, turn: -35 })); if (t > dur * 0.5) T.setFace('worried');
      camPath(cam, sm(t, 0, dur), [30, 6, 18], [46, 5.5, 14], [36, 5, -14], [58, 2.5, -15], 24, 26);
    };
  },
  // 5 "So Mister Fudd made his house ugly on purpose."  — Fudd slaps another lump of grey frosting on his house with a trowel, steps back, proud
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' });
    const F = fudd(S, 'mischief', [-17.5, 0, -6.2], 155); const tr = new THREE.Group(); S.add(tr);
    tr.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 0.8, roughness: 0.3 })));
    const lump = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8a9a6a, roughness: 0.9 })); lump.position.set(-16.2, 4.6, -9.85); lump.scale.set(1, 1, 0.4); S.add(lump);
    return (t, dur) => { env.update(t);
      const sl = hit([[0, { rFwd: 60, rUp: 10 }], [dur * 0.2, { rFwd: 150, rUp: 15, lean: -4 }], [dur * 0.35, { rFwd: 95, rUp: 0, lean: 10 }], [dur * 0.6, { rFwd: 95, rUp: 0, lean: 6 }], [dur * 0.8, { rFwd: 40, lUp: 30, rUp: 30, lean: -6, nod: -8 }]], t);
      F.pose(addPose(idle(t, 1), sl)); F.root.position.z = -6.2 + sm(t, dur * 0.62, dur * 0.85) * 1.6; F.root.rotation.y = hn([[dur * 0.6, 155], [dur * 0.85, 30]], t) * D;
      if (t > dur * 0.75) F.setFace('proud'); hold(tr, F, 'R', [0, -0.1, 0.1]);
      const s = sm(t, dur * 0.3, dur * 0.42); lump.scale.set(0.3 + s, 0.3 + s, 0.4); lump.visible = t > dur * 0.3;
      camPath(cam, t / dur, [-10.5, 5.2, 7], [-11.5, 5.0, 5.5], [-18, 4.6, -7.5], [-18.5, 4.5, -7.5], 26, 28);
    };
  },
  // 6 "Even the pigeons won't land on it."  — three pigeons glide in to land on the lumpy roof, take one look and veer away; Fudd below, hands on hips, nods
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' });
    const F = fudd(S, 'proud', [-15, 0, -4.5], 20); const B = [0, 1, 2].map(i => bird(S, [0x8a8aa0, 0x6a6a80, 0xa0a0b8][i]));
    return (t, dur) => { env.update(t);
      B.forEach((b, i) => { const u = clamp01((t - i * 0.2) / dur); const x = -2 - u * 22 + Math.max(0, u - 0.55) * 30; const y = 20 - Math.min(u, 0.55) * 14 + Math.pow(Math.max(0, u - 0.55), 1.2) * 40;
        b.position.set(x + i * 1.6, y + i * 0.8, -14 + i * 1.2); b.rotation.y = (u < 0.55 ? -90 : 40) * D; b.rotation.z = u > 0.5 && u < 0.65 ? 0.6 : 0; b.scale.setScalar(1.8); b.userData.flap(t + i, u > 0.45 ? 1.3 : 0.6); });
      F.pose(addPose(idle(t, 1), addPose(HIPS, { nod: hn([[dur * 0.5, -20], [dur * 0.75, 6], [dur, 0]], t), turn: hn([[0, 20], [dur * 0.7, 40], [dur, 0]], t) }))); if (t > dur * 0.6) F.setFace('grin');
      camPath(cam, t / dur, [-8, 4.5, 12], [-9, 5.0, 10.5], [-17, 8.5, -10], [-18, 10, -11], 22, 23);
    };
  },
  // 7 "The mayor's roof says, 'Not this one.'"  — cut 1: the Mayor, arms crossed, smug, in front of her lilac house; cut 2: tilt up to the NOT THIS ONE sign on the roof
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' });
    const Mr = mayor(S, 'smirk', [21, 0, -5], -15);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.45]);
      Mr.pose(addPose(idle(t, 1), addPose(CROSS, { nod: -6 + Math.sin(t * 2) * 2, turn: hn([[0, -10], [dur * 0.3, 15]], t) }))); Mr.setFace(t > dur * 0.25 ? 'proud' : 'smirk');
      if (k === 0) camPath(cam, u, [17.5, 4.6, 5.5], [18.0, 4.6, 4.2], [21, 4.4, -5], [21, 4.5, -5], 30, 32);
      else camPath(cam, u, [15, 5, 12], [15.5, 6.5, 11], [20, 9, -12], [20, 14.6, -14.4], 22, 23);
    };
  },
  // 8 "The hand took the sign."  — night: the hand comes down, pinches just the sign off the Mayor's roof and lifts it away; the Mayor's jaw drops
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night' }); const mh = env.houses.mayor; const H = giantHand(S);
    const sign = mh.sign; const top = [20, 16.9, -15 + 0.6]; crackAbove(S, 20, -12, 1, { y: 95, target: [20, 8, -14] });
    const Mr = mayor(S, 'neutral', [17, 0, -3.5], 20); const sp = new THREE.Vector3();
    return (t, dur) => { env.update(t);
      const down = hn([[0, 30], [dur * 0.4, 0]], t, x => 1 - Math.pow(1 - x, 3)); const grip = sm(t, dur * 0.4, dur * 0.52) * 0.75; const lift = Math.pow(sm(t, dur * 0.55, dur), 1.5) * 24;
      H.root.position.set(top[0], top[1] + 7.4 + down + lift, top[2] - 2.0); H.root.rotation.y = Math.PI; H.grip(grip); sign.position.y = mh.ridgeY + 0.2 + lift; sign.rotation.z = lift > 0.1 ? Math.sin(t * 4) * 0.08 : 0;
      Mr.pose(addPose(idle(t, 1), hit([[dur * 0.45, { nod: -30 }], [dur * 0.7, { nod: -40, lFwd: 110, rFwd: 110, lUp: -15, rUp: -15, bob: -0.1 }]], t)));
      Mr.setFace(t > dur * 0.6 ? 'shock' : t > dur * 0.3 ? 'confused' : 'neutral');
      camPath(cam, t / dur, [12, 3.2, 14], [12.5, 3.4, 12.5], [18, 9, -8], [19, 12, -10], 21, 22);
    };
  },
  // 9 "Nobody knows where the houses go."  — low angle: a house rises into the glowing crack, crumbs falling; Fudd and a neighbour stare up
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night' }); const h = env.houses.h40; const H = giantHand(S); const ch = [40 + h.chimney.x, h.chimney.y, -10 - h.d / 2];
    crackAbove(S, ch[0], ch[2], 1, { y: 120, w: 90, h: 22, target: [40, 30, -15] });
    const F = fudd(S, 'awe', [33, 0, 4], 170); const T = towny(S, 2, 'awe', [38.5, 0, 5], 190);
    const crumbs = []; for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: i % 3 ? 0xa8602a : 0xfbf8f2 })); S.add(c); crumbs.push(c); }
    return (t, dur) => { env.update(t); const lift = 16 + t * 9; handAt(H, ch, lift); H.grip(1); h.g.position.y = lift; h.g.rotation.z = Math.sin(t * 2) * 0.04;
      crumbs.forEach((c, i) => { const u = ((t * 0.5 + i / 18) % 1); c.position.set(36 + (i * 2.7) % 8, lift - u * (lift + 2), -15 + (i % 5) - 2); c.rotation.set(t * 3 + i, t * 2, 0); });
      for (const [A, o] of [[F, 0], [T, 0.4]]) { A.pose(addPose(idle(t + o, 1), { nod: -38 - t * 2, rFwd: o ? 0 : 20 })); }
      camPath(cam, t / dur, [36, 1.6, 15], [36.2, 1.5, 14.2], [37, 10, -4], [39, 30, -12], 20, 20);
    };
  },
  // 10 "Our moon never moves."  — Clove and Grandpa Gus on their roof deck at night (from behind, 3/4): she points at the big still moon, he nods
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night' });
    const C = clove(S, 'thinking', [-2.2, DECK_Y, GUS_Z + 0.3], 200); const G = gus(S, 'softsmile', [2.1, DECK_Y, GUS_Z + 0.3], 165);
    fill(S, [0, DECK_Y + 6, GUS_Z + 6], 14, 0xffe0c0, 14);
    return (t, dur) => { env.update(t);
      C.pose(addPose(idle(t, 1), hit([[0, { nod: -25 }], [dur * 0.35, { nod: -30, rFwd: 150, rUp: -10, turn: 10 }], [dur, { nod: -28, rFwd: 145, rUp: -8, turn: 30 }]], t)));
      G.pose(addPose(idle(t + 0.5, 1), { nod: -22 + Math.sin(t * 3) * (t > dur * 0.5 ? 6 : 0), turn: hn([[0, -10], [dur * 0.6, -35]], t) }));
      if (t > dur * 0.55) C.setFace('confused');
      camPath(cam, t / dur, [4, DECK_Y + 4.0, GUS_Z + 12], [3, DECK_Y + 3.2, GUS_Z + 10.5], [-6, DECK_Y + 10, GUS_Z - 20], [-10, DECK_Y + 16, GUS_Z - 30], 20, 21);
    };
  },
  // 11 "And every morning, the sky smells like coffee."  — morning: Clove steps out the front door, sniffs the air, frowns up at brown wisps drifting down
  (S, cam) => {
    const env = sugarStreet(S, { time: 'morning' }); const wisps = coffeeWisps(S);
    const C = clove(S, 'sleepy', [0, 0, -7.4], 0);
    return (t, dur) => { env.update(t); wisps(t); C.root.position.z = -7.4 + sm(t, 0, dur * 0.3) * 2.2;
      C.pose(addPose(t < dur * 0.3 ? walk(t, 6, 0.6) : idle(t, 1), hit([[dur * 0.3, {}], [dur * 0.5, { nod: -28, bob: 0.06, lean: -4 }], [dur * 0.7, { nod: -32, rFwd: 40 }], [dur, { nod: -24, turn: 20, rFwd: 0 }]], t)));
      C.setFace(t > dur * 0.65 ? 'confused' : t > dur * 0.35 ? 'delighted' : 'sleepy');
      camPath(cam, t / dur, [3.5, 4.6, 8.0], [3.0, 4.5, 6.8], [0, 5.0, -5.5], [0, 5.6, -5.5], 26, 28);
    };
  },
  // 12 "I'm Clove. I'm seventeen."  — close-up: Clove in front of her house, turns to camera and waves, smiling
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' });
    const C = clove(S, 'smile', [-1.2, 0, -4.5], 20);
    return (t, dur) => { env.update(t); const h = headOf(C).toArray();
      C.pose(addPose(idle(t, 1), addPose(hit([[0, {}], [dur * 0.25, { rUp: 150, turn: -8 }], [dur * 0.45, { rUp: 130 }], [dur * 0.6, { rUp: 150 }], [dur, { rUp: 20, tilt: 6 }]], t), talk(t, 0.4))));
      if (t > dur * 0.5) C.setFace('grin');
      faceCam(cam, t / dur, h, 10, { dist: 8.0, lens: 34, side: 0.8, push: 1.0, look: -0.6 });
    };
  },
  // 13 "Grandpa Gus iced our house for fifty years."  — Gus pipes a fresh icing swirl next to the candy window, humming; then admires it
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' });
    const G = gus(S, 'softsmile', [7.4, 0, -7.4], 240); const pb = pipingBag(S);
    const sw = new THREE.Group(); sw.position.set(5.2, 5.6, -9.86); S.add(sw); const sm2 = new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 0.4 });
    const rings = [0, 1, 2].map(i => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.5 * (1 - i * 0.3), 0.09, 8, 24, Math.PI * 1.6), sm2); r.rotation.z = i * 1.3; sw.add(r); return r; });
    return (t, dur) => { env.update(t);
      const draw = sm(t, dur * 0.1, dur * 0.65); rings.forEach((r, i) => { r.visible = draw > i * 0.33; r.scale.setScalar(clamp01((draw - i * 0.33) * 3)); });
      G.pose(addPose(idle(t, 1), addPose({ rFwd: 112 + Math.sin(t * 6) * 5 * (t < dur * 0.65 ? 1 : 0), lFwd: 100, rUp: -14, lUp: -22, nod: -6 }, t > dur * 0.7 ? hit([[dur * 0.7, {}], [dur * 0.85, { lean: -6, nod: -2, turn: -55 }]], t) : {})));
      if (t > dur * 0.72) G.setFace('proud'); hold(pb, G, 'R', [0, 0.2, 0]); pb.rotation.set(-1.1, 0, 0);
      camPath(cam, t / dur, [4.0, 6.4, -2.4], [4.3, 6.3, -3.0], [6.6, 4.8, -8.0], [6.6, 4.8, -8.2], 24, 26);
    };
  },
  // 14 "Every swirl. Every gumdrop. Every candy window."  — three macro cuts on the house: a swirl, Gus's thumb pressing a gumdrop, a glowing candy window
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' }); env.houses.gus.light(0.9);
    const G = gus(S, 'smile', [-4.2, 0, -7.4], 170); const gd = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffd23a, roughness: 0.25 })); gd.rotation.x = Math.PI / 2; S.add(gd);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.5]);
      G.pose(addPose(idle(t, 1), { lFwd: 95 + Math.sin(t * 5) * 6, lUp: 20, nod: -10 })); const p = pinky(G, 'L'); gd.position.set(p.x, p.y, Math.max(p.z, -9.82));
      if (k === 0) camPath(cam, u, [-3.0, 7.6, -5.2], [-3.6, 7.2, -5.4], [-3.6, 7.0, -9.9], [-3.6, 7.0, -9.9], 40, 44);
      else if (k === 1) camPath(cam, u, [-0.4, 5.0, -6.8], [-0.8, 4.9, -7.2], [p.x, p.y, -9.8], [p.x, p.y, -9.8], 30, 32);
      else camPath(cam, u, [5.2, 4.8, -5.4], [3.0, 4.6, -5.6], [3.6, 4.4, -9.9], [3.6, 4.4, -9.9], 36, 38);
    };
  },
  // 15 "This morning, silver frost covered our roof."  — morning: silver frost sweeps across the roof with sparkles; Clove steps out and looks up, stunned
  (S, cam) => {
    const env = sugarStreet(S, { time: 'morning' }); const gh = env.houses.gus;
    const C = clove(S, 'sleepy', [-1.5, 0, -7.6], 0);
    return (t, dur) => { env.update(t); gh.frost(sm(t, 0, dur * 0.7));
      C.root.position.z = -7.6 + sm(t, 0, dur * 0.35) * 3.4; C.pose(addPose(t < dur * 0.35 ? walk(t, 6, 0.7) : idle(t, 1), hit([[dur * 0.35, { turn: 0 }], [dur * 0.55, { turn: 160, nod: -30, bob: -0.05 }], [dur, { turn: 165, nod: -38, lFwd: 70 }]], t)));
      if (t > dur * 0.4) C.setFace(t > dur * 0.6 ? 'shock' : 'confused');
      camPath(cam, t / dur, [-6, 3.0, 14], [-5, 3.4, 12], [0, 8, -12], [0, 11, -14], 22, 22);
    };
  },
  // 16 "That's the mark. Everyone gets out by nine."  — Clove turns to Gus, scared; he keeps looking at his roof, calm; the frost glitters
  (S, cam) => {
    const env = sugarStreet(S, { time: 'morning', frost: 1 });
    const C = clove(S, 'worried', [-2.3, 0, -2.8], 20); const G = gus(S, 'softsmile', [2.2, 0, -3.2], -15);
    return (t, dur) => { env.update(t);
      C.pose(addPose(idle(t, 1), addPose(lookAt(C, headOf(G)), hit([[0, {}], [dur * 0.3, { lFwd: 60, lUp: -10 }], [dur, { lFwd: 55, lUp: -10 }]], t))));
      G.pose(addPose(idle(t + 0.7, 1), { nod: -24, turn: hn([[0, 10], [dur * 0.7, 30]], t) })); if (t > dur * 0.5) C.setFace('scared');
      camPath(cam, t / dur, [0.5, 3.4, 13], [0.3, 3.6, 11.5], [0, 5.2, -3], [0, 5.6, -4], 24, 25);
    };
  },
  // 17 "At first, the whole town came to look."  — a crowd in front of the frosted house: phones up, waving, cheering; Clove on the doorstep, embarrassed
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day', frost: 1 });
    const C = clove(S, 'blush', [-2.6, 0, -7.2], 0); const G = gus(S, 'proud', [3.2, 0, -7.4], -10);
    const T = [towny(S, 0, 'starstruck', [-9, 0, 1.5], 160), towny(S, 1, 'delighted', [-4.4, 0, 3.0], 175), towny(S, 2, 'grin', [4.6, 0, 2.6], 195), towny(S, 3, 'starstruck', [9.2, 0, 1.0], 205)];
    const Mr = mayor(S, 'awe', [13.6, 0, -1], 230);
    const phones = T.map(() => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0x1a1a1e, emissive: 0x6a8aff, emissiveIntensity: 0.4 })); S.add(p); return p; });
    return (t, dur) => { env.update(t);
      T.forEach((A, i) => { const ph = i * 0.7; A.pose(addPose(idle(t + ph, 1), i % 2 ? { rFwd: 150, rUp: -10, nod: -10, bob: Math.abs(Math.sin(t * 6 + ph)) * 0.12 } : { rUp: 120 + Math.sin(t * 8 + ph) * 25, nod: -12, bob: Math.abs(Math.sin(t * 5 + ph)) * 0.15 })); hold(phones[i], A, 'R', [0, 0.35, 0]); phones[i].visible = i % 2 === 1; });
      Mr.pose(addPose(idle(t, 1), { nod: -15, lFwd: 30 })); C.pose(addPose(idle(t, 1), hit([[0, {}], [dur * 0.4, { rFwd: 120, rUp: -25, nod: 8 }], [dur, { rFwd: 115, rUp: -25, nod: 6 }]], t)));
      G.pose(addPose(idle(t + 0.3, 1), { rUp: 140 + Math.sin(t * 7) * 15, turn: Math.sin(t) * 10 }));
      camPath(cam, t / dur, [0, 7, 22], [0, 6.2, 19.5], [0, 5.5, -4], [0, 5.2, -4], 22, 23);
    };
  },
  // 18 "Mister Fudd asked for an autograph."  — Fudd holds out his order pad; Gus signs it with a piping bag; Clove behind them, face in hand
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day', frost: 1 });
    const F = fudd(S, 'starstruck', [-2.6, 0, -3.0], 70); const G = gus(S, 'fakesmile', [2.4, 0, -3.0], -70); const C = clove(S, 'nervous', [0.2, 0, -7.6], 10);
    const pad = clipboard(S); const pb = pipingBag(S, 0xff9ac8);
    return (t, dur) => { env.update(t);
      F.pose(addPose(idle(t, 1), { rFwd: 85, rUp: -5, nod: 4, bob: Math.abs(Math.sin(t * 4)) * 0.06 })); hold(pad, F, 'R', [0.35, 0.1, 0]); pad.rotation.set(-1.4, 0, 0);
      G.pose(addPose(idle(t + 0.4, 1), { rFwd: 80 + Math.sin(t * 9) * 6 * (t > dur * 0.3 && t < dur * 0.8 ? 1 : 0), rUp: -10, nod: 14 })); hold(pb, G, 'R', [0, 0.1, 0]); pb.rotation.set(-0.6, 0, 0.4);
      C.pose(addPose(idle(t, 1), hit([[dur * 0.3, {}], [dur * 0.55, { rFwd: 140, rUp: -30, nod: 14 }]], t))); if (t > dur * 0.5) C.setFace('bored');
      if (t > dur * 0.8) F.setFace('delighted');
      camPath(cam, t / dur, [1, 5.0, 9.5], [0.3, 4.9, 8.3], [0, 4.2, -4], [0, 4.2, -4], 26, 28);
    };
  },
  // 19 "Then Grandpa said he wasn't leaving."  — dusk: Clove has a packed suitcase; Gus plants himself in the doorway, arms crossed, shaking his head
  (S, cam) => {
    const env = sugarStreet(S, { time: 'dusk', frost: 1 });
    const G = gus(S, 'determined', [0, 0, -8.0], 0); const C = clove(S, 'worried', [-4.4, 0, -4.6], 50);
    const suit = new THREE.Group(); S.add(suit); suit.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x3ad8a8, roughness: 0.5 })));
    return (t, dur) => { env.update(t);
      G.pose(addPose(idle(t, 1), addPose(CROSS, { turn: Math.sin(t * 5) * 14 * (t > dur * 0.3 ? 1 : 0), nod: 4 })));
      C.pose(addPose(idle(t, 1), addPose(lookAt(C, headOf(G)), hit([[0, { lFwd: 10 }], [dur * 0.4, { lFwd: 70, lUp: -15 }], [dur, { lFwd: 60, lUp: -15 }]], t)))); hold(suit, C, 'R', [0, -0.5, 0]);
      if (t > dur * 0.5) C.setFace('sad');
      camPath(cam, t / dur, [-1, 4.6, 7], [-0.8, 4.6, 5.8], [-1.6, 4.4, -6], [-1.6, 4.4, -6], 24, 26);
    };
  },
  // 20 "'I built it. I stay with it.'"  — close-up: Gus, firm and calm, taps the door frame
  (S, cam) => {
    const env = sugarStreet(S, { time: 'dusk', frost: 1 });
    const G = gus(S, 'determined', [0, 0, -8.0], 0); fill(S, [1.5, 6, -3], 8, 0xffd0a0, 10);
    return (t, dur) => { env.update(t); const h = headOf(G).toArray();
      G.pose(addPose(idle(t, 1), addPose(talk(t, 1), hit([[0, {}], [dur * 0.3, { lUp: 70, lFwd: 20 }], [dur * 0.45, { lUp: 62, lFwd: 25 }], [dur * 0.6, { lUp: 70, lFwd: 20 }], [dur, { lUp: 66, lFwd: 22 }]], t))));
      faceCam(cam, t / dur, h, 0, { dist: 7.4, lens: 34, side: -0.9, push: 1.2, look: -0.5 });
    };
  },
  // 21 "So I started scraping off the icing."  — dusk: Clove scrapes at the wall with a big spoon, icing flakes flying, desperate
  (S, cam) => {
    const env = sugarStreet(S, { time: 'dusk', frost: 1 }); const gh = env.houses.gus;
    const C = clove(S, 'determined', [4.8, 0, -7.6], 215);
    const sp = new THREE.Group(); S.add(sp); const sm1 = new THREE.MeshStandardMaterial({ color: 0xd8dce4, metalness: 0.85, roughness: 0.25 });
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), sm1); hd.scale.set(1, 0.4, 1.3); sp.add(hd); const st = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 1.2), sm1); st.position.z = 0.7; sp.add(st);
    const flakes = []; for (let i = 0; i < 16; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.18), new THREE.MeshStandardMaterial({ color: i % 3 ? 0xfbf8f2 : 0xff9ac8 })); S.add(f); flakes.push(f); }
    return (t, dur) => { env.update(t); gh.scrape(sm(t, dur * 0.1, dur * 0.9));
      const sc = Math.sin(t * 11); C.pose(addPose(idle(t, 0.6), { rFwd: 98 + sc * 14, rUp: -8, lFwd: 60, lUp: 10, lean: 6, nod: 6 })); hold(sp, C, 'R', [0, 0, 0]); sp.rotation.set(0.3, 0, sc * 0.4);
      flakes.forEach((f, i) => { const u = (t * 1.3 + i / 16) % 1; f.position.set(3.6 + Math.sin(i * 7) * 0.9 + u * Math.sin(i) * 1.2, 2.6 - u * 2.4 + Math.sin(u * 3) * 0.3, -9.5 + u * 1.2); f.rotation.set(t * 4 + i, t * 3, 0); });
      if (t > dur * 0.6) C.setFace('angry');
      camPath(cam, t / dur, [-0.2, 4.6, -8.9], [0.4, 4.5, -8.6], [4.6, 4.0, -7.8], [4.6, 4.0, -7.8], 24, 26);
    };
  },
  // 22 "Grandpa caught my hand."  — Gus steps in and gently catches Clove's wrist; she freezes
  (S, cam) => {
    const env = sugarStreet(S, { time: 'dusk', frost: 1 }); env.houses.gus.scrape(1);
    const C = clove(S, 'angry', [4.6, 0, -7.4], 190); const G = gus(S, 'sad', [8.6, 0, -6.6], 245); allow(S, ['clove', 'gus']);
    return (t, dur) => { env.update(t);
      C.pose(addPose(idle(t, 0.6), { rFwd: 98 + Math.sin(t * 11) * 14 * (t < dur * 0.35 ? 1 : 0), rUp: -8, lean: 6, turn: t > dur * 0.45 ? 50 : 0, nod: 6 }));
      G.root.position.x = 8.6 - sm(t, 0, dur * 0.35) * 1.6; G.pose(addPose(t < dur * 0.35 ? walk(t, 6, 0.6) : idle(t, 1), hit([[dur * 0.3, {}], [dur * 0.45, { lFwd: 95, lUp: 5 }], [dur, { lFwd: 92, lUp: 5, nod: 6 }]], t)));
      if (t > dur * 0.45) C.setFace('shock'); if (t > dur * 0.7) C.setFace('teary');
      camPath(cam, t / dur, [-1.0, 4.8, -8.9], [-0.4, 4.7, -8.7], [5.8, 4.2, -7.2], [5.8, 4.2, -7.2], 22, 24);
    };
  },
  // 23 "'Don't you dare make it ugly, Clove.'"  — close-up: Gus, eyes wet but firm, the scraped wall behind him
  (S, cam) => {
    const env = sugarStreet(S, { time: 'dusk', frost: 1 }); env.houses.gus.scrape(1);
    const G = gus(S, 'teary', [7.0, 0, -6.6], 245); fill(S, [3, 6, -2], 8, 0xffd0a0, 10);
    return (t, dur) => { env.update(t); const h = headOf(G).toArray();
      G.pose(addPose(idle(t, 1), addPose(talk(t, 0.8), { lFwd: 60, lUp: 5, nod: 6 + Math.sin(t * 2) * 2 })));
      if (t > dur * 0.65) G.setFace('softsmile');
      faceCam(cam, t / dur, h, 245, { dist: 7.0, lens: 34, side: 1.0, push: 1.0, look: -0.5 });
    };
  },
];
