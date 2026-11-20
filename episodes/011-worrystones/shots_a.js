import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, seg, hit, talk, lookAt, anticipate, sitOn, sitGround, pinky, T,
  ferryDeck, keeperAttic, lighthouseCliff, worryStone, stonePile, packProp, gull } from '../../engine/kit.js';
import { MILO, JUNE, MOSS, RAE, BENNY, CREW, KIDS, PACK, mk, milo, june, moss, rae, benny, pack, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, TRUDGE, STRAPS } from './common.js';

// a stone that drops from the sky into a pack: returns update(t) (t0 = start time of the fall)
function dropper(S, P, text, t0, { from = 3.2, dur = 0.5, seed = 1, s = 0.9 } = {}) {
  const st = worryStone(S, text, { s, seed, glow: 0.5 }); st.visible = false;
  return (t) => { const u = (t - t0) / dur; if (u < 0 || u > 1.05) { st.visible = false; return u > 1; }
    P.group.updateMatrixWorld(true); const tgt = P.group.localToWorld(new THREE.Vector3(0, 1.75, -0.42));
    st.visible = true; st.position.set(tgt.x, tgt.y + from * (1 - u * u), tgt.z); st.rotation.set(u * 3, u * 2, 0); st.glow(0.6 * (1 - u)); return false; };
}
const cracker = (S) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), std({ color: 0xe8b860, roughness: 0.8 })); m.castShadow = true; g.add(m);
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), std({ color: 0x9a6a2a })); d.position.set(((i % 3) - 1) * 0.2, 0.06, (Math.floor(i / 3) - 1) * 0.2); g.add(d); } S.add(g); return g; };
const card = (S) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.03), std({ color: 0xfaf8ee })); S.add(m); return m; };
const SPARK = (S, n = 14) => { const g = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0xfff2b0 })); S.add(m); g.push(m); }
  return (t, c, k = 1) => g.forEach((m, i) => { const a = i * 2.4 + t * 1.5, r = 0.8 + (i % 4) * 0.35; m.position.set(c.x + Math.cos(a) * r, c.y + ((t * 0.8 + i * 0.13) % 1.6) - 0.6, c.z + Math.sin(a) * r); m.scale.setScalar(k * (0.6 + 0.5 * Math.sin(t * 6 + i))); m.visible = k > 0.02; }); };

export const SHOTS_A = [
  // 2 "Every worry you have goes in your backpack."  — crane down onto the morning ferry: kids and crew, every one hauling a backpack of a different size
  (S, cam) => {
    const env = ferryDeck(S);
    const k0 = mk(S, KIDS[0], 'k0', 'worried', [-3.2, 0, 0], 90); const p0 = pack(k0, 'k0', 1.4);
    const k1 = mk(S, KIDS[1], 'k1', 'nervous', [2.8, 0, -2.6], -100); const p1 = pack(k1, 'k1', 1.9);
    const c1 = mk(S, CREW[1], 'c1', 'smile', [10, 0, -3.5], -30); const pc = pack(c1, 'c1', 1.1);
    return (t, dur) => { env.update(t);
      camPath(cam, t / dur, [0.5, 12, 10.4], [0.5, 6.4, 10.4], [0, 5, -4], [0.4, 3.2, 0.5], 18, 18);
      k0.root.position.x = -3.2 + t * 1.1; k0.pose(addPose(TRUDGE(t, 0.7), { turn: -10 }));
      k1.root.position.x = 2.8 - t * 0.8; k1.pose(addPose(TRUDGE(t + 1, 1), { turn: 10 }));
      c1.pose(addPose(idle(t, 1, 2), { rFwd: 50 + Math.sin(t * 3) * 15, lFwd: 40, nod: 18 }));
    };
  },
  // 3 "As a heavy stone."  — over-the-shoulder on the boy: a glowing stone drops out of nowhere into his open pack — THUNK — he sags
  (S, cam) => {
    const env = ferryDeck(S);
    const k = mk(S, KIDS[1], 'k1', 'worried', [0, 0, 0], 10); const P = pack(k, 'k1', 1.3); P.open(0.6);
    const d = dropper(S, P, 'SPELLING TEST', 0.35, { dur: 0.55, s: 1.0 });
    return (t, dur) => { env.update(t);
      camPath(cam, t / dur, [7.0, 7.2, -5.6], [6.2, 6.8, -5.0], [0, 4.2, -0.6], [0, 4.0, -0.5], 28, 30);
      const landed = d(t); const hitT = 0.9;
      P.grow(1.3 + 0.25 * sm(t, hitT, hitT + 0.25)); if (t > hitT) k.setFace('sad');
      const dip = t > hitT ? Math.exp(-(t - hitT) * 5) * Math.sin((t - hitT) * 18) * 0.12 : 0;
      k.pose(addPose(idle(t, 0.7), { ...STRAPS, bob: -0.15 * sm(t, hitT, hitT + 0.2) + dip, lean: 12 * sm(t, hitT, hitT + 0.3), nod: t < hitT ? -18 * sm(t, 0.1, 0.4) : 14, turn: t < hitT ? 25 : 0 }));
    };
  },
  // 4 "The more you worry, the heavier it gets."  — dolly alongside the girl: stone after stone drops in, her pack balloons, she slows to a trudge
  (S, cam) => {
    const env = ferryDeck(S);
    const k = mk(S, KIDS[0], 'k0', 'nervous', [-7, 0, 0], 90); const P = pack(k, 'k0', 1.1); P.open(0.5);
    const drops = [0.2, 0.62, 1.04].map((t0, i) => dropper(S, P, ['LATE', 'HOMEWORK', 'SPIDERS'][i], t0, { dur: 0.45, seed: i + 2 }));
    return (t, dur) => { env.update(t);
      const n = drops.reduce((a, f, i) => a + (f(t) ? 1 : 0), 0);
      const s = 1.1 + n * 0.45; P.grow(THREE.MathUtils.lerp(P.s, s, 0.25));
      const sp = 1.3 - n * 0.3; k.root.position.x = -7 + t * 1.9 - n * 0.15;
      if (n >= 2) k.setFace('worried'); if (n >= 3) k.setFace('pout');
      k.pose(addPose(n < 2 ? walk(t, 1, 26) : TRUDGE(t, 0.6 + n * 0.15), { turn: -15 }));
      const x = k.root.position.x; camPath(cam, t / dur, [x + 0.5, 4.2, 10], [x + 1.5, 4.0, 9.5], [x, 3.8, -0.5], [x + 0.5, 3.6, -0.5], 26, 28);
    };
  },
  // 5 "Captain Moss worries about storms."  — Moss at the rail, hand at his brow, scanning a dark cloud; worried; push-in
  (S, cam) => {
    const env = ferryDeck(S);
    const M = moss(S, 'worried', [-9, 0, -2.5], -15); const P = pack(M, 'moss', 1.4, { anchor: true }); P.anchor.scale.setScalar(0.45);
    const storm = new THREE.Group(); S.add(storm); const sm2 = std({ color: 0x4a4e5a, roughness: 1 });
    for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + (i % 3), 1), sm2); b.position.set(-30 + i * 3.4, 26 + Math.sin(i) * 2, -70); storm.add(b); }
    return (t, dur) => { env.update(t); storm.position.x = t * 0.6;
      faceCam(cam, t / dur, headOf(M).toArray(), -15, { dist: 7.4, lens: 34, side: -1.2, up: -0.4, push: 1.2, look: 0.2 });
      M.pose(addPose(addPose(idle(t, 0.8), hit([[0, { rFwd: 30 }], [0.5, { rUp: 150, rFwd: 10, nod: -14 }]], t)), { turn: -20 + Math.sin(t * 0.9) * 22, nod: -16 }));
      if (t > dur * 0.55) M.setFace('scared');
    };
  },
  // 6 "His backpack has its own anchor."  — side profile: Moss trudges along the deck, a ship's anchor dangling from his pack
  (S, cam) => {
    const env = ferryDeck(S);
    const M = moss(S, 'proud', [-10.6, 0, -0.5], 90); const P = pack(M, 'moss', 1.7, { anchor: true });
    return (t, dur) => { env.update(t);
      P.anchor.scale.setScalar(0.62 / P.s); P.anchor.position.set(0, -0.15, -0.95); P.anchor.rotation.x = Math.sin(t * 4) * 0.12;
      M.root.position.x = -10.6 + t * 1.25; M.pose(addPose(TRUDGE(t, 0.8), { lean: -10, nod: -6, turn: 20 + Math.sin(t * 2) * 5 }));
      if (t > dur * 0.5) M.setFace('grin');
      const x = M.root.position.x; camPath(cam, t / dur, [x + 1.0, 4.0, 10.4], [x + 1.6, 4.2, 10.4], [x + 1.0, 3.8, -0.5], [x + 1.5, 4.0, -0.5], 20, 20);
    };
  },
  // 7 "My baby cousin Benny worries about nothing."  — low on Benny sitting on the deck, clapping and giggling; Aunt Rae smiles behind him
  (S, cam) => {
    const env = ferryDeck(S);
    const B = benny(S, 'laugh', [1.5, 0, 0.5], -10); B.root.position.y = -0.825; const P = pack(B, 'benny', 0.8);
    
    allow(S, ['benny', 'deck']);
    return (t, dur) => { env.update(t);
      camPath(cam, t / dur, [3.4, 2.4, 7.4], [2.8, 2.2, 6.0], [1.0, 1.9, 0.2], [1.2, 1.8, 0.4], 30, 34);
      const clap = Math.abs(Math.sin(t * 7)); B.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 70, lFwd: 70, rUp: -20 + clap * 25, lUp: -20 + clap * 25 }, { nod: Math.sin(t * 7) * 4, tilt: Math.sin(t * 3) * 6 }));
      if (t > dur * 0.5) B.setFace('delighted');
      
    };
  },
  // 8 "His backpack holds one cracker."  — close: Benny's tiny pack flips open, ONE cracker pops out; he grabs it and beams
  (S, cam) => {
    const env = ferryDeck(S);
    const B = benny(S, 'awe', [0, 0, 0], 20); B.root.position.y = -0.825;
    const P = packProp(S, { col: PACK.benny, s: 0.55 }); P.group.position.set(1.4, 0, 1.5); P.group.rotation.y = Math.PI + 0.4;
    const c = cracker(S); c.scale.setScalar(0.8); allow(S, ['benny', 'deck']);
    return (t, dur) => { env.update(t);
      camPath(cam, t / dur, [2.6, 2.2, 5.4], [2.1, 2.0, 4.6], [0.9, 1.3, 1.0], [0.7, 1.5, 0.8], 36, 40);
      P.open(sm(t, 0.2, 0.5)); const u = sm(t, 0.4, 0.9), g = ramp(t, 1.2, 1.6);
      const top = P.group.localToWorld(new THREE.Vector3(0, 1.0, -0.42)); const hand = pinky(B, 'L');
      if (g <= 0) { c.position.set(top.x, top.y + u * 0.9 + Math.sin(u * Math.PI) * 0.3, top.z); c.rotation.set(u * 6, u * 3, 0); }
      else c.position.lerpVectors(new THREE.Vector3(top.x, top.y + 0.9, top.z), hand, g);
      B.pose(addPose({ rLeg: 90, lLeg: 90, nod: 10 }, hit([[0, { lFwd: 20 }], [1.0, { lFwd: 30, turn: -30 }], [1.4, { lFwd: 75, lUp: -10, turn: -20 }], [2.2, { lFwd: 110, lUp: -20, turn: 0, nod: -5 }]], t)));
      if (t > 1.3) B.setFace('delighted');
    };
  },
  // 9 "My big sister June worries about tests."  — close on June mouthing flashcard answers, eyes darting; nervous
  (S, cam) => {
    const env = ferryDeck(S);
    const J = june(S, 'nervous', [6, 0, -3], -20); const P = pack(J, 'june', 3.2); const cd = card(S);
    return (t, dur) => { env.update(t);
      faceCam(cam, t / dur, headOf(J).toArray(), -20, { dist: 7.2, lens: 36, side: 0.6, push: 1.0, look: -0.5 });
      J.pose(addPose(addPose(idle(t, 0.6), { rFwd: 80, rUp: -14, lFwd: 20, nod: 16 }), talk(t, 0.6)));
      hold(cd, J, 'R', [0.2, 0.25, 0.25]); cd.rotation.set(-0.6, -0.35, 0);
      if (Math.sin(t * 1.6) > 0.6) J.setFace('worried'); else J.setFace('nervous');
    };
  },
  // 10 "Her backpack is the size of a fridge."  — pull back: June's coral pack towers over her; she hitches it up and staggers; kids stare
  (S, cam) => {
    const env = ferryDeck(S);
    const J = june(S, 'nervous', [6, 0, -3], -40); const P = pack(J, 'june', 3.2); P.stuffed(0.6);
    const k = mk(S, KIDS[0], 'k0', 'shock', [-1.5, 0, 3], 110); pack(k, 'k0', 1.0);
    return (t, dur) => { env.update(t);
      camPath(cam, t / dur, [9.0, 5.0, 6.0], [12.5, 6.2, 10.2], [5.8, 4.8, -3.0], [5.0, 5.4, -3.8], 30, 22);
      const hitch = 1.0; J.pose(addPose(addPose(idle(t, 0.6), { ...STRAPS, lean: 14 }), { bob: anticipate(t, hitch).bob ?? 0, ...(t > hitch ? { bob: Math.max(0, Math.sin((t - hitch) * 6)) * 0.2 * Math.exp(-(t - hitch) * 2), bodyTilt: Math.sin((t - hitch) * 3) * 4 * Math.exp(-(t - hitch)) } : {}) }));
      if (t > hitch + 0.3) J.setFace('worried');
      k.pose(addPose(idle(t, 0.7, 3), addPose({ nod: -8, rFwd: 20 }, lookAt(k, [6, 6.5, -4]))));
    };
  },
  // 11 "I'm Milo. I'm ten."  — cliff top, morning: Milo jogs down the gravel path from the lighthouse and waves at the camera
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'day' });
    const Mi = milo(S, 'grin', [-2.5, 0, -2], 20); const P = pack(Mi, 'milo', 1.0);
    return (t, dur) => { env.update(t);
      const k = sm(t, 0, 0.5); Mi.root.position.set(-2.5 + k * 1.5, 0, -2 + k * 3.5);
      Mi.pose(t < 0.5 ? RUN(t, 0.6) : addPose(idle(t, 0.8), hit([[0.5, POSES.rest], [0.75, { rUp: 150, nod: -6 }], [0.95, { rUp: 125 }], [1.15, { rUp: 150 }]], t)));
      if (t > 0.6) Mi.setFace('smile');
      camPath(cam, t / dur, [1.5, 4.0, 11.0], [0.8, 4.4, 9.4], [-1.5, 4.0, 0], [-1.0, 4.4, 1.5], 28, 32);
    };
  },
  // 12 "My backpack was always light as air."  — he tosses his pack in the air; it floats down slow as a feather; he catches it on one finger
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'day' });
    const Mi = milo(S, 'grin', [0, 0, 1.5], 0); const P = packProp(S, { col: PACK.milo, s: 1.0 }); const sp = SPARK(S, 12);
    return (t, dur) => { env.update(t);
      const up = sm(t, 0.3, 0.9), down = sm(t, 0.9, dur - 0.2); const hand = pinky(Mi, 'R');
      const y = hand.y + up * 3.2 - down * 3.2; P.group.position.set(hand.x + Math.sin(t * 2.2) * 0.4 * (up - down), y - 0.2, hand.z + 0.9);
      P.group.rotation.set(Math.sin(t * 1.5) * 0.3 * (up - down), Math.PI + t * 1.2 * (up - down), Math.sin(t * 1.9) * 0.25 * (up - down));
      sp(t, P.group.position.clone().add(new THREE.Vector3(0, 0.9, -0.4)), up - down * 0.8);
      Mi.pose(addPose(idle(t, 0.8), hit([[0, { rFwd: 60 }], [0.3, { rFwd: 100, rUp: 30, bob: -0.1 }], [0.55, { rUp: 160, rFwd: 0, nod: -20 }], [1.2, { rUp: 120, nod: -24 }], [dur - 0.4, { rUp: 140, nod: -10 }]], t)));
      Mi.setFace(t < 0.9 ? 'grin' : t < dur - 0.5 ? 'awe' : 'laugh');
      camPath(cam, t / dur, [2.6, 2.6, 9.6], [2.0, 3.0, 8.6], [0, 5.0, 1.5], [0, 5.6, 1.5], 26, 28);
    };
  },
  // 13 "At first, I thought I was brave."  — low angle: Milo hops onto a crate on the ferry, fists on hips, wind in his curls
  (S, cam) => {
    const env = ferryDeck(S);
    box(S, [2.2, 1.6, 2.2], [1, 0.8, -1], std({ map: T.planks(0x8a6a3a) }), { r: 0.05, name: 'crate' });
    const Mi = milo(S, 'proud', [1, 1.6, -1], 10); const P = pack(Mi, 'milo', 1.0); allow(S, ['milo', 'crate']);
    return (t, dur) => { env.update(t);
      const j = 0.5; const jy = t < j ? 0 : Math.max(0, Math.sin(Math.min(1, (t - j) / 0.45) * Math.PI)) * 0.9;
      Mi.root.position.y = 1.6 + jy;
      Mi.pose(addPose(addPose(idle(t, 0.8), anticipate(t, j)), t < j ? { rUp: 20, lUp: 20 } : hit([[j, { rUp: 60, lUp: 60, rLeg: 30, lLeg: -20 }], [j + 0.5, POSES.hips], [dur, { ...POSES.hips, nod: -8 }]], t)));
      camPath(cam, t / dur, [3.2, 1.4, 8.4], [2.6, 1.2, 7.2], [1, 4.8, -1], [1, 5.4, -1], 26, 28);
    };
  },
  // 14 "I won every race on the ferry."  — tracking low: Milo zooms past the kids who lug their big packs; arms up at the finish
  (S, cam) => {
    const env = ferryDeck(S);
    const Mi = milo(S, 'determined', [-12, 0, 1.8], 90); const P = pack(Mi, 'milo', 1.0);
    const a = mk(S, KIDS[0], 'k0', 'pout', [-10.5, 0, -2.8], 90); pack(a, 'k0', 1.8);
    
    return (t, dur) => { env.update(t);
      const mx = -12 + Math.min(t, dur * 0.7) * 9.5; Mi.root.position.x = mx;
      Mi.pose(t < dur * 0.7 ? RUN(t, 1) : addPose(idle(t, 1), hit([[dur * 0.7, { lean: 10 }], [dur * 0.7 + 0.3, { rUp: 160, lUp: 160, bob: 0.2 }], [dur, { rUp: 150, lUp: 150 }]], t)));
      if (t > dur * 0.7) Mi.setFace('laugh');
      a.root.position.x = -10.5 + t * 3.2; a.pose(TRUDGE(t * 1.6, 0.8));
      camPath(cam, t / dur, [mx - 1, 3.4, 10.4], [Math.min(mx, 6) + 1, 3.6, 10.4], [mx + 1.5, 3.4, -1.5], [Math.min(mx, 6), 3.6, -1.5], 18, 18);
    };
  },
  // 15 "I carried everybody's bags to school."  — Milo strolls toward camera balancing a tower of three packs overhead; kids walk beside him, free
  (S, cam) => {
    const env = ferryDeck(S);
    const Mi = milo(S, 'grin', [0, 0, -4], 0); pack(Mi, 'milo', 1.0);
    const tower = ['k0', 'k1', 'c0'].map((k, i) => { const p = packProp(S, { col: PACK[k], s: [1.4, 1.2, 1.0][i] }); return p; });
    const a = mk(S, KIDS[0], 'k0', 'delighted', [-5, 0, -4.6], 10); const b = mk(S, KIDS[1], 'k1', 'laugh', [5, 0, -4.4], -10);
    return (t, dur) => { env.update(t);
      const z = -4 + t * 1.3; Mi.root.position.z = z; a.root.position.z = z - 0.6; b.root.position.z = z - 0.4;
      Mi.pose(addPose(walk(t, 1, 22), { rUp: 165, lUp: 165, rFwd: 0, lFwd: 0, nod: -4 }));
      const hy = Math.max(pinky(Mi, 'R').y, pinky(Mi, 'L').y); let y = hy - 0.05;
      tower.forEach((p, i) => { const s = [1.4, 1.2, 1.0][i]; p.group.position.set(Math.sin(t * 2 + i) * 0.12 * i, y, z + 0.5 * s); p.group.rotation.set(0, Math.PI + Math.sin(t * 1.3 + i) * 0.15, Math.sin(t * 2 + i) * 0.04 * i); y += 1.0 * s * 1.0; });
      a.pose(addPose(walk(t + 0.3, 1, 24), lookAt(a, [0, 8, z]))); b.pose(addPose(walk(t + 0.7, 1, 24), lookAt(b, [0, 8, z])));
      camPath(cam, t / dur, [1.2, 3.2, 9.6], [0.8, 3.0, 9.8], [0, 6.0, z - 1], [0, 6.4, z + 1], 22, 22);
    };
  },
  // 16 "Then, on Monday, mine got heavy."  — Milo at the rail looking out to sea; a stone drops into his pack — THUNK — shock
  (S, cam) => {
    const env = ferryDeck(S);
    const Mi = milo(S, 'smile', [2, 0, -4.2], 160); const P = pack(Mi, 'milo', 1.0); P.open(0.5);
    const d = dropper(S, P, 'THE DARK', 0.5, { dur: 0.5 });
    return (t, dur) => { env.update(t);
      const hitT = 1.0; d(t); P.grow(1.0 + 0.3 * sm(t, hitT, hitT + 0.2));
      const turnK = sm(t, hitT + 0.1, hitT + 0.5);
      Mi.root.rotation.y = (160 - 150 * turnK) * D;
      Mi.pose(addPose(idle(t, 0.7), t < hitT ? { rFwd: 40, lFwd: 40, nod: -6 } : hit([[hitT, { bob: -0.25, lean: 18, nod: 15 }], [hitT + 0.4, { lean: 10, nod: 0, rUp: 30, lUp: 30, ...STRAPS }]], t)));
      if (t > hitT) Mi.setFace('shock');
      camPath(cam, t / dur, [5.6, 5.2, 4.4], [4.6, 5.0, 3.2], [2, 4.3, -4.5], [2, 4.2, -4.2], 30, 34);
    };
  },
  // 17 "One stone. Then ten. Then fifty."  — from behind: stones rain into his pack faster and faster; it swells; his knees buckle
  (S, cam) => {
    const env = ferryDeck(S);
    const Mi = milo(S, 'shock', [0, 0, 0], 15); const P = pack(Mi, 'milo', 1.3); P.open(0.55);
    const times = []; for (let i = 0; i < 14; i++) times.push(0.05 + Math.pow(i / 13, 0.6) * 1.05);
    const labels = ['THE DARK', 'NEW SCHOOL', 'NO FRIENDS', 'STORMS', 'BIG WAVES', 'GETTING LOST'];
    const ds = times.map((t0, i) => dropper(S, P, labels[i % labels.length], t0, { dur: 0.3, seed: i + 1, s: 0.8 }));
    return (t, dur) => { env.update(t);
      const n = ds.reduce((a, f) => a + (f(t) ? 1 : 0), 0); P.grow(THREE.MathUtils.lerp(P.s, 1.3 + n * 0.11, 0.3)); P.stuffed(Math.min(1, n / 10));
      const k = n / 14; Mi.pose(addPose(idle(t, 0.6), { ...STRAPS, lean: 10 + k * 20, bob: -k * 0.35, rLeg: k * 18, lLeg: k * 10, nod: 10 + k * 10, tilt: Math.sin(t * 20) * k * 2 }));
      Mi.setFace(n < 3 ? 'shock' : n < 9 ? 'worried' : 'scared');
      camPath(cam, t / dur, [6.4, 6.4, -6.0], [7.2, 7.0, -6.8], [0, 4.4, -0.8], [0, 4.8, -1.0], 28, 26);
    };
  },
  // 18 "By Friday, I couldn't lift it."  — the pack is a boulder on the deck; Milo heaves at the strap, it won't budge, he flops back
  (S, cam) => {
    const env = ferryDeck(S, { time: 'sunset' });
    const P = packProp(S, { col: PACK.milo, s: 2.8 }); P.group.position.set(-1.8, 0, -1.2); P.group.rotation.y = Math.PI * 0.5;
    const Mi = milo(S, 'determined', [3.2, 0, -0.4], -90); allow(S, ['milo', 'deck']);
    return (t, dur) => { env.update(t);
      const fall = dur * 0.62; const f = sm(t, fall, fall + 0.35);
      if (t < fall) { const pull = Math.sin(t * 7) * 0.5 + 0.5; Mi.root.position.set(3.2 + pull * 0.15, 0, -0.4); Mi.root.position.y = 0;
        Mi.pose({ rFwd: 95, lFwd: 95, rUp: -18, lUp: -18, lean: -22 - pull * 6, rLeg: 25, lLeg: -15, nod: -6, tilt: Math.sin(t * 13) * 3 }); Mi.setFace(t < 0.6 ? 'determined' : 'angry'); }
      else { Mi.root.position.set(3.6 + f * 0.5, -1.5 * f, -0.4); const lg = Math.min(90, 1.15 * Math.acos(Math.max(0, 1 - 0.75 * f)) / D + 8 * f); Mi.pose(addPose({ rLeg: lg, lLeg: lg, lean: -18 * (1 - f) - 8, rUp: 40 * f, lUp: 40 * f }, idle(t, 0.5))); Mi.setFace('pout'); }
      P.group.rotation.z = t < fall ? Math.sin(t * 7) * 0.01 : 0;
      camPath(cam, t / dur, [5.0, 5.0, 10.4], [4.6, 4.6, 10.2], [2.4, 2.6, -1.0], [2.6, 2.4, -0.8], 20, 22);
    };
  },
  // 19 "But I wasn't worried about anything!"  — attic at night: Milo throws his arms out at the giant pack, cross and confused
  (S, cam) => {
    const env = keeperAttic(S, { night: true });
    const P = packProp(S, { col: PACK.milo, s: 2.4 }); P.group.position.set(-1.6, 0, -4.2); P.group.rotation.y = Math.PI;
    const Mi = milo(S, 'angry', [2.4, 0, 0.8], -30);
    return (t, dur) => { env.update(t);
      Mi.pose(addPose(addPose(idle(t, 0.9), hit([[0, { rFwd: 20 }], [0.3, { ...POSES.shrug, rUp: 70, lUp: 70, nod: -6 }], [dur * 0.6, { ...POSES.shrug, rUp: 95, lUp: 95, nod: -12 }]], t)), { ...lookAt(Mi, [-1.6, 3, -2.6]), ...talk(t, 0.4) }));
      if (t > dur * 0.45) Mi.setFace('confused');
      camPath(cam, t / dur, [2.0, 4.6, 9.8], [1.8, 4.4, 8.4], [0.4, 3.6, -1.2], [0.6, 3.8, -0.8], 26, 28);
    };
  },
  // 20 "So I dumped it out."  — he tips the pack over; a landslide of grey stones pours across the rug
  (S, cam) => {
    const env = keeperAttic(S, { night: true });
    const P = packProp(S, { col: PACK.milo, s: 2.4 }); P.group.position.set(-1.6, 0, -4.2); P.group.rotation.y = Math.PI; P.open(1);
    const pile = stonePile(S, [-1.2, 0, 1.0], { n: 46, r: 2.4, h: 1.1, seed: 4, s: 0.75, labels: ['THE DARK', 'NEW SCHOOL', 'NO FRIENDS'] });
    const Mi = milo(S, 'determined', [3.0, 0, -2.2], -60);
    return (t, dur) => { env.update(t);
      const tip = sm(t, 0.08, 0.55); P.group.rotation.x = tip * 1.25; P.group.position.z = -4.2 + tip * 0.6;
      pile.set(sm(t, 0.35, dur * 0.95));
      Mi.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 60, lFwd: 60 }], [0.12, { rFwd: 110, lFwd: 110, lean: 16 }], [0.6, { rFwd: 70, lFwd: 70, lean: -10, nod: 18 }]], t)));
      if (t > 0.55) Mi.setFace('shock');
      camPath(cam, t / dur, [3.0, 7.4, 9.6], [2.4, 6.6, 8.6], [-0.8, 1.2, -1.0], [-0.8, 1.0, 0.4], 24, 26);
    };
  },
  // 21 "Every stone had a worry written on it."  — Milo kneels in the pile, lifts one stone into the lamplight and reads it
  (S, cam) => {
    const env = keeperAttic(S, { night: true });
    const pile = stonePile(S, [-1.6, 0, 1.0], { n: 46, r: 2.4, h: 1.1, seed: 4, s: 0.75, labels: ['THE DARK', 'NEW SCHOOL', 'NO FRIENDS'] });
    const Mi = milo(S, 'thinking', [2.2, -1.5, 0.6], -20); const st = worryStone(S, 'NEW SCHOOL', { s: 0.9, seed: 3 });
    fill(S, [3.5, 4.6, 4.5], 6, 0xffc890, 10); allow(S, ['milo', 'floor']);
    return (t, dur) => { env.update(t);
      Mi.pose(addPose(addPose({ rLeg: 90, lLeg: 90 }, idle(t, 0.5)), hit([[0, { rFwd: 30, nod: 25 }], [0.5, { rFwd: 95, rUp: -20, nod: 18 }], [1.2, { rFwd: 105, rUp: -25, nod: 10, tilt: 6 }]], t)));
      const h = pinky(Mi, 'R'); st.position.set(h.x + 0.1, h.y + 0.15, h.z + 0.2); st.rotation.set(1.1, -0.3, 0.1);
      if (t > 1.2) Mi.setFace('worried');
      camPath(cam, t / dur, [1.0, 4.0, 7.6], [1.3, 3.6, 6.4], [2.0, 2.8, 0.8], [2.0, 2.9, 0.9], 32, 36);
    };
  },
  // 22 "The dark. The new school. No friends here."  — low glide over the stones, each word in the lamplight
  (S, cam) => {
    const env = keeperAttic(S, { night: true });
    const pile = stonePile(S, [0, 0, 1.0], { n: 40, r: 3.2, h: 0.5, seed: 9, s: 0.7 });
    const heroes = ['THE DARK', 'NEW SCHOOL', 'NO FRIENDS'].map((w, i) => { const s = worryStone(S, w, { s: 1.15, seed: i + 4 }); s.position.set(-1.8 + i * 1.8, 0.45, 2.6 - (i % 2) * 0.5); s.rotation.y = (i - 1) * 0.15; return s; });
    fill(S, [0, 3.2, 5], 5, 0xffc890, 9);
    return (t, dur) => { env.update(t);
      heroes.forEach((h, i) => h.glow(0.25 * sm(t, i * dur / 3, i * dur / 3 + 0.4)));
      camPath(cam, t / dur, [-3.2, 2.8, 5.6], [2.8, 2.6, 5.4], [-2.0, 0.4, 2.3], [2.0, 0.4, 2.3], 34, 34);
    };
  },
  // 23 "They were mine. From when we moved here."  — a: Milo looks over at the stack of moving boxes, softening · b: the box marked MILO, push-in
  (S, cam) => {
    const env = keeperAttic(S, { night: true });
    const pile = stonePile(S, [-1.6, 0, 1.0], { n: 40, r: 2.4, h: 1.0, seed: 4, s: 0.75 });
    const Mi = milo(S, 'thinking', [1.8, -1.5, 0.4], -10); fill(S, [3.0, 4.6, 5.0], 6, 0xffc890, 10); allow(S, ['milo', 'floor']);
    return (t, dur) => { env.update(t);
      const [i, p] = seg(t, dur, [0.55]);
      Mi.pose(addPose(addPose({ rLeg: 90, lLeg: 90, rFwd: 50, lFwd: 50, rUp: -10, lUp: -10 }, idle(t, 0.5)), { turn: 45 * sm(t, 0.3, 1.0), nod: 6 }));
      if (t > 0.8) Mi.setFace('sad');
      if (i === 0) faceCam(cam, p, headOf(Mi).toArray(), -10, { dist: 6.6, lens: 36, side: -0.8, push: 0.6 });
      else camPath(cam, p, [3.4, 2.8, 8.4], [4.6, 2.2, 6.4], [6.4, 1.4, 3.0], [6.4, 1.2, 3.4], 32, 38);
    };
  },
  // 24 "So who had been carrying them?"  — Milo rises and walks to the round window; the lighthouse beam sweeps across his face
  (S, cam) => {
    const env = keeperAttic(S, { night: true });
    const Mi = milo(S, 'thinking', [1.6, 0, -2.0], 170);
    return (t, dur) => { env.update(t + 0.6);
      const w = sm(t, 0, dur * 0.6); Mi.root.position.set(1.6 - w * 1.0, 0, -2.0 - w * 3.6);
      Mi.pose(addPose(w < 0.98 ? walk(t, 1, 22) : idle(t, 0.7), { turn: 15, nod: -14 }));
      if (t > dur * 0.6) Mi.setFace('worried');
      camPath(cam, t / dur, [4.8, 4.6, 2.8], [3.6, 4.8, 0.6], [0.6, 4.6, -5.6], [0.2, 5.0, -7.0], 26, 30);
    };
  },
];
