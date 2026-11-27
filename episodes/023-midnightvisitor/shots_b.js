// Episode 023 (The Midnight Visitor) — lines 28–54: the quarry, the ship, the drawing, the fix, the helmet, the flip.
import * as THREE from 'three';
import { POSES, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, track, sitOn, sitGround,
  dustyYard, quarry, landerInside, gardenGnome, wrench, toolbox, jumperCables, dirtBag, kidDrawing, handTorch, helmetProp, lawnMower, feelers, paper } from '../../engine/kit.js';
import { opal, dad, finn, bell, astro, dog, ps, ramp, sm, lerp, V, headOf, faceCam, fill, allow, hold, hands, hn, shake, arc, clamp01, eye, bounce, breathe, look } from './common.js';

const place = (A, x, y, z, ry) => { A.root.position.set(x, y, z); if (ry !== undefined) A.root.rotation.y = ry * D; };
// marks in the quarry: the family (screen right, facing the visitor) and the visitor (screen left)
const FM = { O: [5, 0, 1.0], D: [7.6, 0, -2.4], B: [12.0, 0, 1.4], F: [7.9, 0, 3.2], G: [4.3, 0, 4.4] }, TM = [-3.4, 0, 0.2], FRY = -35, TRY = 70;
function family(S, f = {}) { const O = opal(S, f.O || 'awe', FM.O, -6), Dd = dad(S, f.D || 'nervous', FM.D, FRY), B = bell(S, f.B || 'worried', FM.B, FRY), F = finn(S, f.F || 'awe', FM.F, FRY), dg = dog(S, FM.G, FRY);
  dg.feel = feelers({ headMesh: dg.head }, { col: 0x8ad8ff, h: 1.6 }); dg.feel.g.position.set(0, 0.9, -0.2); return { O, Dd, B, F, dg, all: [O, Dd, B, F] }; }
const feel = (fam, k, t) => { fam.all.forEach((A, i) => A.feel.set(typeof k === 'function' ? k(i) : k, t + i)); fam.dg.feel.set(typeof k === 'function' ? k(4) : k, t + 5); };
// the visitor without the helmet on (helmet tucked under the left arm)
function bare(S, pos, ry, face = 'smile') { const A = astro(S, pos, ry, face); A.helm.g.visible = false; if (A.hairMesh) A.hairMesh.visible = true; const hp = helmetProp(S); hp.scale.setScalar(1.05); A.tuck = () => { const p = pinky(A, 'L'); hp.position.set(p.x, p.y + 0.5, p.z + 0.55); hp.rotation.set(0.3, A.root.rotation.y + 0.5, 0.2); }; A.hp = hp; return A; }
const TUCK = { lUp: 26, lFwd: 34 };
const famCam = (cam, p, { push = 1.4, lens = 24, x = 0 } = {}) => camPath(cam, p, [7.9 + x, 3.3, 20.6], [8.2 + x, 3.5, 20.6 - push], [8.5 + x, 3.5, 0.4], [8.5 + x, 3.6, 0.4], lens);
const torchAt = (tc, A, yaw, pitch = 0.1) => { const p = pinky(A, 'R'); tc.position.set(p.x, p.y + 0.1, p.z); tc.rotation.set(pitch, yaw * D, 0); tc.userData.on(1); };

export const SHOTS_B = [
  // 28 "Over the ridge, down into the old quarry."  — (a) from the quarry floor: Opal appears on the rim, tiny against the cloudy sky, flashlight beam swinging down at us; (b) she picks her way down between the rocks, crouched, toward a glow.
  (S, cam) => {
    const env = quarry(S); const O = opal(S, 'nervous', [26, 8, -8.6], -84); const tc = handTorch(S); allow(S, ['opal', 'ledge']);
    return (t, dur) => { env.update(t, { fire: 1 }); const [k, lt] = seg(t, dur, [0.45]);
      if (k === 0) { const u = sm(lt, 0, 0.7); place(O, lerp(29.5, 25.6, u), 8, -8.6, -84); O.pose(ps(u < 1 ? walk(t, 0.8, 28) : idle(t, 0.6), { rFwd: 70, rUp: -8, nod: 14, lean: 6 })); O.setFace(u < 1 ? 'nervous' : 'awe'); torchAt(tc, O, -20, 0.3); env.keyAt(22.4, 12.6, -4.4, 24, 0xdfe6ff);
        camPath(cam, lt, [19.0, 9.4, 3.2], [20.2, 9.7, 2.4], [lerp(29.5, 25.6, u) + 0.4, 11.5, -8.6], [lerp(29.5, 25.6, u) + 0.2, 11.7, -8.6], 28, 28); return; }
      const x = lerp(23.5, 17.4, sm(lt, 0, 0.9)); place(O, x, 0, lerp(6.4, 3.6, sm(lt, 0, 0.9)), -70); O.pose(ps(walk(t, 0.6, 22), { rFwd: 60, rUp: -6, lean: 18, nod: -6, bob: -0.25, turn: Math.sin(t * 2.2) * 16 })); O.setFace('worried'); torchAt(tc, O, -70, 0.25); env.keyAt(x - 1.6, 4.4, 8.6, 18);
      camPath(cam, lt, [x - 6.5, 2.8, 16.5], [x - 6.0, 3.0, 15.4], [x - 0.8, 3.3, 4.6], [x - 0.8, 3.4, 4.6], 28);
    };
  },
  // 29 "And there was its ship."  — close on Opal peeking over the boulder (awe), then the camera cranes up and left past the rock to reveal the lander in its pool of work-light. Pull back on the reveal.
  (S, cam) => {
    const env = quarry(S); const O = opal(S, 'worried', [17.3, 0, 3.6], -70); const A = astro(S, [-5.0, 0, -4.4], 74);
    return (t, dur) => { env.update(t, { fire: 1 }); O.pose(ps(idle(t, 0.5), { lean: 14, bob: -0.5, rLeg: 24, lLeg: 24, rFwd: 40, lFwd: 40, nod: -6 })); O.setFace(t < dur * 0.3 ? 'worried' : 'awe'); env.keyAt(15.5, 4.6, 7.4, 12);
      A.pose(ps(breathe(t), { lean: 26, rFwd: 70 + Math.sin(t * 9) * 12, lFwd: 50, nod: 12 })); A.helm.blink(t);
      camPath(cam, sm(t, dur * 0.18, dur * 0.95), [16.0, 3.8, 10.2], [9.5, 5.6, 16.0], [17.2, 3.7, 3.6], [1.0, 4.6, -7.0], 34, 22);
    };
  },
  // 30 "It was tiny. And dented. And a little bit on fire."  — (a) low wide: the whole lander, the visitor beside it for scale, both small; (b) close on a big dent crossed with duct tape; (c) the foot that is on fire —
  //   the visitor notices, hops over and stamps on it. It relights. A tired pat.
  (S, cam) => {
    const env = quarry(S); const A = astro(S, [-5.6, 0, -3.2], 96);
    return (t, dur) => { env.update(t, { fire: 1 }); const [k, lt] = seg(t, dur, [0.26, 0.55]); A.helm.blink(t); env.flood.intensity = k === 1 ? 60 : 420;
      if (k === 0) { place(A, 5.8, 0, -3.0, -78); A.pose(ps(breathe(t), { lean: 18, rFwd: 76 + Math.sin(t * 8) * 10, lFwd: 40, nod: 10 })); camPath(cam, lt, [1.5, 1.2, 10.5], [1.2, 1.6, 8.6], [0.4, 4.8, -8], [0.4, 5.0, -8], 22, 23); return; }
      if (k === 1) { A.root.visible = false; camPath(cam, lt, [6.2, 4.9, -0.6], [5.2, 4.8, -1.6], [2.3, 4.55, -6.2], [2.2, 4.6, -6.2], 38, 42); return; }
      A.root.visible = true; const st0 = dur * 0.55 + dur * 0.45 * 0.3; const b = bounce(t, st0, st0 + 0.9, 2, 0.9); place(A, -6.2 + b.u * 1.0, b.y, -5.8 + b.u * 0.4, 66);
      A.pose(ps(breathe(t), t < st0 ? { turn: 30, nod: 22, rUp: 34, lUp: 34 } : t < st0 + 0.9 ? ps(b.pose, { nod: 26, rLeg: 40 * (b.y > 0.3 ? 1 : 0) }) : hit([[st0 + 0.9, { nod: 26 }], [st0 + 1.2, { nod: 26, lean: 30, rFwd: 60, bob: -0.3 }], [st0 + 1.5, { nod: 30, lean: 30, rFwd: 44, bob: -0.3 }]], t)));
      env.keyAt(-3, 3.5, -0.5, 10); camPath(cam, lt, [1.2, 1.6, 4.6], [0.6, 2.0, 3.2], [-4.3, 2.4, -5.0], [-4.4, 2.6, -5.0], 26, 27);
    };
  },
  // 31 "All our things were inside, with labels."  — (a) Opal's flashlight sweeps the shelves: the bike, the mailbox, the barbecue, each with a neat tag; (b) Opal, lit from below by her own torch: awe sliding into "…seriously?"
  (S, cam) => {
    const env = landerInside(S); const O = opal(S, 'awe', [2.4, 0, 0.2], -44); const tc = handTorch(S); const sp = new THREE.SpotLight(0xfff0cc, 30, 24, 0.34, 0.6, 1.3); S.add(sp, sp.target);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.58]); const sx = lerp(-4.8, 0.2, sm(t, 0, dur * 0.58)); sp.position.set(2, 4, 3); sp.target.position.set(sx, 3.2 + Math.sin(t * 2) * 0.5, -3);
      O.pose(ps(idle(t, 0.6), { rFwd: 74, rUp: -10 + Math.sin(t * 1.5) * 10, lUp: 20, lean: 6 }, look(lookAt(O, [sx, 3.4, -3]), 0.6))); O.setFace(lt < 0.5 || k === 0 ? 'awe' : 'confused'); torchAt(tc, O, -150, -0.1); tc.userData.spot.intensity = 20;
      if (k === 0) { camPath(cam, lt, [-4.0, 3.5, 3.6], [-0.8, 3.7, 3.9], [-4.3, 3.0, -3], [-1.2, 3.5, -3], 28); return; }
      env.keyAt(1.6, 4.6, 2.2, 10); const h = headOf(O); faceCam(cam, lt, [h.x, h.y, h.z], -44, { dist: 9.6, lens: 34, side: 1.4, push: 0.8, look: -0.3 });
    };
  },
  // 32 "Specimen four. Small statue of the local king."  — (a) Dad's gnome on the top shelf in a little pool of light, tag underneath; (b) Opal reads it out loud, deadpan, then snorts.
  (S, cam) => {
    const env = landerInside(S); const O = opal(S, 'confused', [2.4, 0, 0.2], -44); const sp = new THREE.SpotLight(0xfff0cc, 30, 24, 0.22, 0.6, 1.3); S.add(sp, sp.target); sp.position.set(2, 4.4, 3); sp.target.position.set(-0.4, 4.7, -3);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.48]);
      O.pose(ps(idle(t, 0.6), talk(t, 1.0), { rFwd: 70, rUp: -8, lUp: 24, lFwd: -6 }, look(lookAt(O, [-0.4, 4.4, -3]), 0.55), lt > 0.62 && k === 1 ? { bob: Math.abs(Math.sin(t * 13)) * 0.05, nod: 8 } : {})); O.setFace(k === 0 || lt < 0.62 ? 'confused' : 'laugh');
      if (k === 0) { camPath(cam, lt, [0.5, 5.2, 3.6], [-0.1, 5.0, 2.4], [-0.4, 5.0, -2.9], [-0.4, 4.8, -2.9], 34, 36); return; }
      env.keyAt(1.6, 4.6, 2.2, 10); const h = headOf(O); faceCam(cam, lt, [h.x, h.y, h.z], -44, { dist: 9.2, lens: 34, side: 1.2, push: 0.7, look: -0.3 });
    };
  },
  // 33 "And taped to the wall, a kid's drawing."  — (a) slow push in on the crayon drawing: a big one and a little one holding hands, COME HOME SOON; (b) Opal's laugh fades; she lowers the torch.
  (S, cam) => {
    const env = landerInside(S); const O = opal(S, 'smile', [1.2, 0, 0.6], 30); const sp = new THREE.SpotLight(0xfff0cc, 20, 24, 0.3, 0.7, 1.3); S.add(sp, sp.target); sp.position.set(2.6, 4.6, 3.4); sp.target.position.set(3.9, 5.0, -3.3);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.56]);
      if (k === 0) { O.root.visible = false; camPath(cam, lt, [3.0, 4.9, 4.0], [3.6, 5.0, 2.0], [3.9, 5.0, -3.3], [3.9, 5.0, -3.3], 34, 38); return; }
      O.root.visible = true; O.pose(ps(idle(t, 0.4), hit([[0, { rFwd: 70, rUp: -8 }], [dur * 0.78, { rFwd: 70, rUp: -8 }], [dur * 0.78 + 0.5, { rFwd: 16, rUp: 4, nod: 6 }]], t), { turn: 26, nod: -8 })); O.setFace(lt < 0.35 ? 'smile' : lt < 0.7 ? 'worried' : 'sad');
      env.keyAt(2.6, 4.8, 3.6, 10); const h = headOf(O); faceCam(cam, lt, [h.x, h.y, h.z], 30, { dist: 8.6, lens: 36, side: -0.6, push: 0.9, look: -0.25 });
    };
  },
  // 34 "It wasn't a monster. It was somebody's dad."  — (a) outside: the visitor sits on a crate by the lander with a second drawing in both gloves, visor bowed over it, thumb moving across the paper;
  //   (b) Opal behind the boulder, watching: the fear is gone from her face.
  (S, cam) => {
    const env = quarry(S); const A = astro(S, [-7.2, 0, -1.5], 28); A.root.position.y = 1.2 - 1.5 * 1.1; allow(S, ['visitor', 'crate']); const dr = kidDrawing(S, 1.1); dr.children[0].material.color.setScalar(0.5); dr.children[0].material.emissiveIntensity = 0.04; const O = opal(S, 'worried', [17.3, 0, 3.6], -70);
    return (t, dur) => { env.update(t, { fire: 1 }); const [k, lt] = seg(t, dur, [0.55]);
      A.pose(ps({ rLeg: 88, lLeg: 88, rFwd: 62, lFwd: 62, rUp: -14, lUp: -14, nod: 30 + Math.sin(t * 1.2) * 3, lean: 12 + Math.sin(t * 2.2) * 1.5, bob: Math.sin(t * 2.2) * 0.03, tilt: Math.sin(t * 0.8) * 4 })); A.helm.blink(t); const h = hands(A); dr.position.set(h.x, h.y + 0.25, h.z + 0.1); dr.rotation.set(-0.9, 28 * D, 0);
      O.pose(ps(idle(t, 0.5), { lean: 12, bob: -0.45, rLeg: 22, lLeg: 22, rFwd: 36, lFwd: 36, nod: -2, tilt: 6 * sm(lt, 0.3, 0.8) })); O.setFace(lt < 0.4 ? 'worried' : 'softsmile');
      if (k === 0) { env.keyAt(-5.5, 4, 3, 10); camPath(cam, lt, [-4.0, 2.6, 10], [-5.0, 2.9, 8], [-7.1, 3.0, -1.4], [-7.1, 3.1, -1.4], 30, 32); return; }
      env.keyAt(15.2, 4.4, 7.6, 12); const hh = headOf(O); faceCam(cam, lt, [hh.x, hh.y, hh.z], -70, { dist: 7.4, lens: 36, side: -2.6, push: 0.9, look: -0.2 });
    };
  },
  // 35 "And it was stuck."  — high wide pull-back: one tiny lander in a big empty quarry under a big sky; the visitor stands, gives the leg a small kick, then just looks up. Camera: crane up and back (small figure, huge world).
  (S, cam) => {
    const env = quarry(S); const A = astro(S, [-4.4, 0, -2.0], 150);
    return (t, dur) => { env.update(t, { fire: 1 }); const kk = dur * 0.3; A.pose(ps(breathe(t), anticipate(t, kk), hit([[0, { nod: 10 }], [kk, { rLeg: -20, nod: 14 }], [kk + 0.15, { rLeg: 46, nod: 14 }], [kk + 0.5, { rLeg: 0, nod: 0 }], [kk + 1.2, { nod: -34, rUp: 8, lUp: 8, lean: -6 }]], t))); A.helm.blink(t);
      camPath(cam, sm(t, 0, dur), [3, 5.5, 13], [5.5, 12, 23], [-1.5, 3.6, -5], [-1.0, 5.0, -6], 24, 22);
    };
  },
  // 36 "Its engine coughed, and died."  — the visitor yanks a pull-cord on the hull, twice. The bell wheezes black smoke, the lamps flicker halfway up… and go dark.
  (S, cam) => {
    const env = quarry(S); const A = astro(S, [4.7, 0, -6.2], -104);
    return (t, dur) => { const y1 = dur * 0.2, y2 = dur * 0.5; const c1 = Math.max(0, 1 - Math.abs(t - y1 - 0.3) / 0.45), c2 = Math.max(0, 1 - Math.abs(t - y2 - 0.35) / 0.6); env.update(t, { fire: 1, cough: Math.max(c1, c2), power: Math.max(c1 * 0.3, c2 * 0.55) * (0.7 + Math.sin(t * 40) * 0.3) });
      const yank = (t0) => [[t0 - 0.3, { rFwd: 92, lean: 14 }], [t0, { rFwd: 96, lean: 20, bob: -0.1 }], [t0 + 0.18, { rFwd: 30, rUp: 30, lean: -16, bob: 0.05 }]];
      A.pose(ps(breathe(t), anticipate(t, y1, 1.4), anticipate(t, y2, 1.6), hit([[0, { rFwd: 80, lean: 10 }], ...yank(y1), ...yank(y2), [y2 + 0.9, { rFwd: 10, rUp: 6, lean: 6, nod: 20 }], [dur, { rFwd: 4, rUp: 4, lean: 10, nod: 28, bob: -0.1 }]], t))); A.helm.blink(t);
      env.keyAt(1, 3.6, -1, 8); camPath(cam, sm(t, 0, dur), [-6.0, 2.2, 5.5], [-5.0, 2.5, 4.0], [3.2, 3.0, -6.4], [3.4, 3.1, -6.4], 24, 25); shake(cam, t, y1 + 0.2, 0.5); shake(cam, t, y2 + 0.25, 0.8);
    };
  },
  // 37 "It sat down in the dust."  — it lowers itself to the ground beside the dead lander, knees up, and puts its helmet in its gloves. Only the little fire moves. Camera: very slow push-in, low.
  (S, cam) => {
    const env = quarry(S); const A = astro(S, [-1.2, 0, -2.4], 24);
    return (t, dur) => { env.update(t, { fire: 1 }); const dn = sm(t, dur * 0.08, dur * 0.5); A.root.position.y = -1.5 * 1.1 * dn;
      A.pose(ps({ bob: Math.sin(t * 1.8) * 0.03, rLeg: 86 * dn, lLeg: 86 * dn }, hit([[0, { nod: 14 }], [dur * 0.5, { nod: 20, lean: 8 }], [dur * 0.5 + 0.7, { nod: 34, lean: 20, rFwd: 118, lFwd: 118, rUp: -14, lUp: -14 }]], t))); A.helm.glow(0.75 - dn * 0.3);
      env.keyAt(0.5, 3, 2, 7); camPath(cam, sm(t, 0, dur), [2.4, 2.0, 11], [1.6, 2.0, 9], [-1.2, 2.6, -2.4], [-1.2, 2.2, -2.4], 30, 32);
    };
  },
  // 38 "I knew that cough! Dad's lawn mower makes it."  — (a) close on Opal behind the boulder: frown… then her whole face lights up, finger in the air; (b) she spins round and sprints back up the path, torch beam swinging.
  (S, cam) => {
    const env = quarry(S); const O = opal(S, 'thinking', [17.3, 0, 3.6], -70); const tc = handTorch(S);
    return (t, dur) => { env.update(t, { fire: 1 }); const [k, lt] = seg(t, dur, [0.62]); const a = dur * 0.22;
      if (k === 0) { O.pose(ps(idle(t, 0.6), anticipate(t, a + 0.2, 1.5), hit([[0, { lean: 12, bob: -0.45, rLeg: 22, lLeg: 22, rFwd: 36, lFwd: 36, tilt: 8 }], [a, { lean: 12, bob: -0.45, rLeg: 22, lLeg: 22, rFwd: 36, lFwd: 36, tilt: 8 }], [a + 0.35, { lean: -4, bob: 0, rUp: 150, rFwd: 16, lFwd: 20, nod: -8 }]], t))); O.setFace(t < a ? 'thinking' : t < a + 0.5 ? 'shock' : 'delighted'); tc.visible = false;
        env.keyAt(15.2, 4.6, 7.6, 13); const h = headOf(O); faceCam(cam, lt, [h.x, 4.3, h.z], -70, { dist: 7.8, lens: 34, side: -2.6, up: 0.2, push: 0.9, look: 0 }); return; }
      tc.visible = true; const x = lerp(17.3, 25, lt * lt); place(O, x, 0, lerp(3.6, 6.6, lt), 70); O.pose(ps(walk(t, 1.6, 46), { lean: 16, rFwd: 40 })); O.setFace('determined'); torchAt(tc, O, 70, 0.2); env.keyAt(x - 1, 4.4, 9, 11);
      camPath(cam, lt, [13, 2.6, 16], [15, 2.8, 16.4], [x, 3.2, 5], [x, 3.2, 5], 24);
    };
  },
  // 39 "So I ran home, and woke everybody up."  — the yard: Opal bursts in through the gate, yelling and windmilling; the porch light snaps on, Dad stumbles out of the back door half asleep, Finn's helmet pops up in the window.
  (S, cam) => {
    const env = dustyYard(S, { bike: false, bbq: false, mailbox: false }); const O = opal(S, 'delighted', [10.6, 0, -11.5], -70); const Dd = dad(S, 'sleepy', [-17, 0.4, -9.9], 40); const F = finn(S, 'sleepy', [-8, -3, -13.9], 14); allow(S, ['finn', 'house wall']);
    return (t, dur) => { env.update(t); env.landing(1.7, t); env.gate.userData.open(1); const u = sm(t, 0, dur * 0.62); const x = lerp(10.4, -3.0, u), z = lerp(-11.6, -6.6, Math.min(1, u * 1.6)); place(O, x, 0, z, lerp(-40, -74, u));
      O.pose(ps(u < 1 ? walk(t, 1.6, 44) : idle(t, 1), talk(t, 1.4), u < 1 ? { rUp: 120 + Math.sin(t * 12) * 30, lean: 12 } : { rUp: 150 + Math.sin(t * 12) * 14, lUp: 150 + Math.cos(t * 12) * 14, bob: Math.abs(Math.sin(t * 10)) * 0.2 })); O.setFace('delighted');
      const on = t > dur * 0.4; env.porch.intensity = on ? 34 : 4; env.win(on ? 1 : 0.15); const out = sm(t, dur * 0.45, dur * 0.75); place(Dd, lerp(-17, -13.4, out), 0.4 * (1 - out), lerp(-9.4, -7.8, out), 58);
      Dd.root.visible = t > dur * 0.42; Dd.pose(ps(out < 1 ? walk(t, 0.8, 20) : idle(t, 0.7), { rFwd: out < 1 ? 118 : 30, rUp: out < 1 ? 20 : 30, lUp: 20, nod: 8 * (1 - out), tilt: 10 * (1 - out) }, look(lookAt(Dd, eye(O)), 0.6))); Dd.setFace(out < 0.7 ? 'sleepy' : 'shock');
      F.root.position.y = lerp(-3, -0.1 + 1.45, sm(t, dur * 0.6, dur * 0.72)); F.pose(ps(idle(t, 0.6), { rFwd: 120, rUp: 20 })); F.setFace('sleepy'); env.follow(-6); env.keyAt(x - 1, 5, -1, 12);
      camPath(cam, sm(t, 0, dur), [3.6, 2.8, 12], [-4.5, 3.2, 11.5], [x, 3.6, -8], [-7.5, 3.8, -9], 22, 23);
    };
  },
  // 40 "Dad brought his toolbox. Mrs. Bell brought jumper cables."  — the rescue party marches down into the quarry in single file: (a) Dad, jaw set, toolbox swinging; (b) Mrs. Bell, jumper cables round her neck like a feather boa, sleeves pushed up.
  (S, cam) => {
    const env = quarry(S); const Dd = dad(S, 'determined', [24, 0, 5.4], -78); const B = bell(S, 'determined', [24, 0, 5.4], -78); const tb = toolbox(S); const jc = jumperCables(S);
    return (t, dur) => { env.update(t, { fire: 1 }); const [k, lt] = seg(t, dur, [0.47]); const x = lerp(24.5, 20.0, lt); const W = k === 0 ? Dd : B; Dd.root.visible = tb.visible = k === 0; B.root.visible = jc.visible = k === 1;
      place(W, x, 0, 5.4, -78); env.keyAt(x - 2.2, 4.6, 9.6, 30);
      if (k === 0) { Dd.pose(ps(walk(t, 0.9, 34), { rFwd: 6, lean: 6, nod: -4, lUp: 14 })); const p = pinky(Dd, 'R'); tb.position.set(p.x, p.y - 0.95, p.z); tb.rotation.set(0, 0.2 + Math.sin(t * 7) * 0.1, Math.sin(t * 7) * 0.1); }
      else { B.pose(ps(walk(t, 1.0, 30), { rUp: 26, lUp: 26, rFwd: -8, lFwd: -8, lean: 8, nod: -6 })); B.setFace(lt < 0.6 ? 'determined' : 'mischief'); const h = headOf(B); jc.position.set(h.x - 0.66, h.y - 0.72, h.z + 0.14); jc.rotation.set(0, -78 * D, Math.sin(t * 7) * 0.12); }
      camPath(cam, lt, [x - 7, 2.8, 17], [x - 6.4, 3.0, 16], [x - 0.6, 3.3, 5.4], [x - 0.6, 3.4, 5.4], 30);
    };
  },
  // 41 "My brother brought the dog. Nobody knows why."  — Finn marches in last, proudly carrying the dog against his chest; the dog dangles, resigned. Finn stops, looks at us. The dog looks at us. Beat.
  (S, cam) => {
    const env = quarry(S); const F = finn(S, 'proud', [23, 0, 5.4], -70); const dg = dog(S, [22, 1.4, 6], -70); S.userData.allowContact = [['finn', '*']];
    return (t, dur) => { env.update(t, { fire: 1 }); const stop = dur * 0.5; const x = lerp(23.6, 20.2, sm(t, 0, stop)); const turn = sm(t, stop, stop + 0.4); place(F, x, 0, 5.4, lerp(-70, -8, turn));
      F.pose(ps(t < stop ? walk(t, 1.2, 30) : idle(t, 0.6), { rFwd: 62, lFwd: 62, rUp: -10, lUp: -10, lean: -6, nod: -6 })); F.setFace(t < stop + 0.5 ? 'proud' : 'smile');
      const ry = lerp(-70, -8, turn); const fx = Math.sin(ry * D), fz = Math.cos(ry * D); place(dg, x + fx * 1.3, 0.8 + (t < stop ? Math.abs(Math.sin(t * 9.6)) * 0.1 : 0), 5.4 + fz * 1.3, ry + 90); dg.update(t, 'idle', 'tilt', sm(t, stop + 0.5, stop + 0.9));
      env.keyAt(x - 1.4, 3.8, 9.6, 18); camPath(cam, sm(t, 0, dur), [x - 4.5, 2.2, 15], [17.6, 2.4, 13.6], [x + 0.4, 2.6, 5.4], [20.7, 2.7, 5.4], 30, 32);
    };
  },
  // 42 "Dad held up a wrench. It held up the gnome."  — (a) wide stand-off across the quarry floor, lander between them: Dad (right) raises the wrench, trembling; the visitor (left) startles, then slowly raises… the gnome, like a shield;
  //   (b) close: the gold visor peeking round the gnome's hat.
  (S, cam) => {
    const env = quarry(S); const A = astro(S, [-3.6, 0, 0.4], 90); const Dd = dad(S, 'scared', [3.8, 0, 0.4], -90); const wr = wrench(S, 1.3); const gn = gardenGnome(S, 1.0);
    return (t, dur) => { env.update(t, { fire: 1 }); const [k, lt] = seg(t, dur, [0.58]); const w = dur * 0.12, g = dur * 0.34;
      Dd.pose(ps(idle(t, 0.5), anticipate(t, w), hit([[0, { rFwd: 30, lFwd: 20, lean: 6 }], [w + 0.25, { rUp: 150, rFwd: 20, lFwd: 40, lUp: 20, lean: -6 }]], t), { rUp: Math.sin(t * 26) * 3, bob: Math.sin(t * 22) * 0.015 })); Dd.setFace(t < g ? 'determined' : t < g + 0.6 ? 'scared' : 'confused'); const p = pinky(Dd, 'R'); wr.position.set(p.x, p.y, p.z); wr.rotation.set(0, 0, Math.sin(t * 26) * 0.06);
      const hop = bounce(t, w + 0.3, w + 0.8, 1, 0.9); place(A, -3.6 - hop.u * 0.8, hop.y, 0.4, 90); A.pose(ps(breathe(t), anticipate(t, g), t < g ? ps(hop.pose, { rUp: 60, lUp: 60 }) : hit([[g, { rUp: 40, lUp: 40 }], [g + 0.4, { rFwd: 104, lFwd: 104, rUp: -14, lUp: -14, lean: -8, nod: 6 }]], t))); A.helm.blink(t);
      const h = hands(A); gn.visible = t > g + 0.1; gn.position.set(h.x + 0.2, h.y - 0.8, h.z); gn.rotation.y = Math.PI / 2;
      if (k === 0) { env.keyAt(0.3, 5, 6, 16); camPath(cam, lt, [0.4, 3.0, 19.5], [0.2, 3.3, 17.6], [0.1, 3.6, 0.4], [0.1, 3.7, 0.4], 22); return; }
      env.keyAt(-1, 5, 3.6, 12); camPath(cam, lt, [2.2, 4.9, 4.6], [1.6, 5.0, 3.8], [-3.8, 4.7, 0.4], [-3.8, 4.8, 0.4], 38, 40);
    };
  },
  // 43 "Then Dad fixed its engine in four minutes."  — the classic: Dad on his back under the lander, only his legs sticking out, boots twitching while sparks fly from the bell. The visitor crouches beside him
  //   holding the cables like a nervous nurse. On the last turn the bell hums blue, the little fire goes out, and Dad slides out with a thumbs-up and soot on his face.
  (S, cam) => {
    const env = quarry(S); const Dd = dad(S, 'determined', [-1.6, 0.55, -2.0], 0); Dd.root.rotation.order = 'YXZ'; Dd.root.rotation.x = -Math.PI / 2; const A = astro(S, [2.9, 0, -2.6], -50); const sparkL = new THREE.PointLight(0xbfe0ff, 0, 14, 1.6); sparkL.position.set(-0.6, 1.2, -6.4); S.add(sparkL); allow(S, ['dad', '*']);
    const sp = [0, 1, 2, 3, 4, 5, 6, 7].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfff2a0 })); S.add(m); return m; });
    return (t, dur) => { const done = dur * 0.66; const pw = sm(t, done, done + 0.5); env.update(t, { fire: 1 - pw, power: pw * 0.5, cough: t < done ? (Math.sin(t * 5) > 0.7 ? 0.5 : 0) : 0 });
      const out = sm(t, done + 0.2, done + 0.8); Dd.root.position.z = -2.0 + out * 3.0; const cr = Math.sin(t * 9);
      Dd.pose(ps(t < done ? { rLeg: -8 + cr * 14, lLeg: -8 - cr * 14, rFwd: 150 + cr * 14, lFwd: 150 - cr * 10, rUp: -10, lUp: -10 } : hit([[done, { rFwd: 150, lFwd: 150 }], [done + 0.9, { rFwd: 86, rUp: -4, lFwd: 10, lUp: 16, nod: -24 }]], t))); Dd.setFace(t < done ? 'determined' : 'proud');
      const on = t < done && cr > 0.5; sparkL.intensity = on ? 36 : 0; sp.forEach((m, i) => { const u = (t * 3 + i / 8) % 1; m.visible = t < done; m.position.set(-0.9 + Math.sin(i * 2.1) * u * 1.8, 1.0 + u * 1.2 - u * u * 2.0, -5.4 + u * 2.6 + Math.cos(i * 1.7) * u * 0.6); });
      A.pose(ps(breathe(t), { rFwd: 70, lFwd: 70, rUp: -10, lUp: -10, lean: 22, bob: -0.4, rLeg: 30, lLeg: 30, turn: Math.sin(t * 2.6) * 14 + 20 }, t > done + 0.3 ? { rUp: 130, lUp: 130, lean: -20, bob: 0.4 + Math.abs(Math.sin(t * 9)) * 0.3, rFwd: -60, lFwd: -60, rLeg: -30, lLeg: -30 } : {})); A.helm.blink(t);
      env.keyAt(-1.4, 2.6, 1.4, 30); camPath(cam, sm(t, 0, dur), [0.6, 2.0, 10.4], [0.4, 2.4, 9.0], [0.4, 2.0, -3.4], [0.4, 2.2, -3.0], 22, 23);
    };
  },
  // 44 "He's been fixing that mower for nine years."  — flashback, golden yard: Dad heaves on the mower's pull-cord; it coughs a black cloud straight into his face. Cobwebs. A FIX ME (year 9) tag. The dog doesn't even look up.
  (S, cam) => {
    const env = dustyYard(S, { time: 'dusk' }); S.userData.look = 'flash'; const Dd = dad(S, 'determined', [-2.0, 0, -3.6], 82); const mw = lawnMower(S); mw.position.set(2.2, 0, -3.6); const dg = dog(S, [5.6, 0, -1.4], -30);
    const tag = paper(S, [['FIX ME', '800 110px "Inter", sans-serif', '#b01e1e', 110], ['(year 9)', 'italic 60px Georgia', '#2a1a10', 0]], { w: 1.3, h: 0.9, tex: { top: 120 }, glow: 0.4 }); tag.position.set(2.6, 1.9, -2.4); tag.rotation.set(-0.3, 0.1, 0.1);
    return (t, dur) => { env.update(t); env.keyAt(0.5, 5, 5, 40); const y = dur * 0.36; const c = Math.max(0, 1 - Math.abs(t - y - 0.4) / 0.7); mw.userData.puff(t, c);
      Dd.pose(ps(idle(t, 0.5), anticipate(t, y, 1.6), hit([[0, { rFwd: 60, lean: 26, lFwd: 30 }], [y, { rFwd: 64, lean: 30, lFwd: 30, bob: -0.15 }], [y + 0.2, { rFwd: 10, rUp: 40, lean: -14, lFwd: 30 }], [y + 1.0, { rFwd: 0, rUp: 4, lUp: 4, lean: 0, nod: 6 }]], t))); Dd.setFace(t < y + 0.3 ? 'determined' : t < y + 0.9 ? 'disgusted' : 'bored'); dg.update(t, 'lie');
      camPath(cam, sm(t, 0, dur), [1.6, 2.4, 11.6], [1.0, 2.7, 10.2], [0.4, 2.4, -3.6], [0.2, 2.6, -3.6], 24, 24);
    };
  },
  // 45 "The ship lit up."  — wide: the lamps chase round the hull, blue light pours out from under the lander and across everyone's faces; the visitor does a huge slow-motion victory jump. Family (right) in awe, antennae still hidden.
  (S, cam) => {
    const env = quarry(S); const fam = family(S, { O: 'awe', D: 'proud', B: 'awe', F: 'awe' }); const A = astro(S, [-4.4, 0, -1.6], 60);
    return (t, dur) => { const pw = 0.5 + sm(t, 0.1, dur * 0.5) * 0.5; env.update(t, { fire: 0, power: pw }); const j = bounce(t, dur * 0.3, dur * 0.95, 1, 3.2); A.root.position.y = j.y; A.pose(ps(breathe(t), anticipate(t, dur * 0.3, 2), j.y > 0 ? { rUp: 156, lUp: 156, rLeg: 30, lLeg: -20, nod: -14 } : { rUp: 30, lUp: 30 })); A.helm.blink(t);
      fam.all.forEach((P, i) => { P.pose(ps(idle(t, 0.6, i), { nod: -8, rUp: 14, lUp: 14 }, look(lookAt(P, [0, 6, -8]), i ? 0.4 : 0.2))); }); fam.O.setFace(t < dur * 0.5 ? 'awe' : 'delighted'); fam.dg.update(t, 'wag');
      env.keyAt(6, 5, 7, 8 + pw * 8, 0xcfe6ff); camPath(cam, sm(t, 0, dur), [-5, 2.6, 22], [-4, 3.2, 19.5], [2.8, 4.4, -3], [2.6, 4.8, -3], 22);
    };
  },
  // 46 "And the thing reached up, and took off its head."  — (a) the visitor faces us in the blue light, both gloves come up to the helmet; a quarter-turn, a hiss of air, and it starts to lift;
  //   (b) the family: Finn dives behind Dad's leg, Mrs. Bell covers her glasses, Dad's jaw drops, Opal leans IN.
  (S, cam) => {
    const env = quarry(S); const fam = family(S, { O: 'awe', D: 'scared', B: 'scared', F: 'scared' }); const A = astro(S, TM, TRY);
    return (t, dur) => { env.update(t, { fire: 0, power: 1 }); const [k, lt] = seg(t, dur, [0.6]); const up = dur * 0.18, tw = dur * 0.4, li = dur * 0.52;
      A.root.rotation.y = (k === 0 ? 30 : TRY) * D; A.pose(ps(breathe(t), hit([[0, { rUp: 12, lUp: 12 }], [up, { rUp: 12, lUp: 12 }], [up + 0.45, { rFwd: 150, lFwd: 150, rUp: -22, lUp: -22, nod: 6 }]], t))); A.helm.g.rotation.y = sm(t, tw, tw + 0.25) * 0.5; A.helm.lift(sm(t, li, dur) * 0.5); if (t > li) A.helm.g.rotation.y = 0.5;
      fam.O.pose(ps(idle(t, 0.5), { lean: 14 * sm(t, li, dur), nod: -6, rUp: 10, lUp: 10 }, look(lookAt(fam.O, eye(A)), 0.22))); fam.O.setFace('awe');
      fam.Dd.pose(ps(idle(t, 0.5, 1), { rUp: 40, lUp: 16, rFwd: 30, lFwd: 40, lean: -8 }, look(lookAt(fam.Dd, eye(A)), 0.5))); fam.Dd.setFace(lt < 0.4 ? 'scared' : 'shock');
      fam.B.pose(ps(idle(t, 0.5, 2), hit([[li, { rUp: 20, lUp: 20 }], [li + 0.3, { rFwd: 132, lFwd: 132, rUp: -16, lUp: -16, nod: 10 }]], t))); fam.B.setFace('scared');
      const hide = sm(t, li, li + 0.4); place(fam.F, lerp(FM.F[0], 9.4, hide), 0, lerp(FM.F[2], -4.6, hide), FRY); fam.F.pose(ps(idle(t, 0.5, 3), hide > 0 && hide < 1 ? walk(t, 1.6, 40) : {}, { lean: 14 * hide, bob: -0.2 * hide, rFwd: 60 * hide, lFwd: 60 * hide })); fam.F.setFace('scared'); fam.dg.update(t, 'bark');
      if (k === 0) { env.keyAt(-1.5, 5.4, 5, 12, 0xdfe8ff); const h = eye(A, 4.5); camPath(cam, lt, [0.4, 4.4, 12.6], [-0.4, 4.7, 10.6], [h[0], h[1] - 0.6, h[2]], [h[0], h[1] - 0.4, h[2]], 30, 32); return; }
      env.keyAt(6.5, 5.4, 8, 14, 0xdfe8ff); famCam(cam, lt, { push: 1.6 });
    };
  },
  // 47 "Underneath, there was a face."  — close: the helmet rises out of frame and there he is — messy hair, stubble, an enormous relieved grin. He shakes his hair out and takes his first breath of our air.
  (S, cam) => {
    const env = quarry(S); const A = astro(S, TM, TRY, 'relieved'); A.hairMesh.visible = true;
    return (t, dur) => { env.update(t, { fire: 0, power: 1 }); const li = sm(t, 0, dur * 0.42); A.helm.lift(0.5 + li * 0.9); A.helm.g.rotation.y = 0.5; const dn = sm(t, dur * 0.5, dur * 0.75); A.helm.g.visible = li < 1 || true; A.helm.lift((0.5 + li * 0.9) * (1 - dn * 0.25));
      A.pose(ps(idle(t, 0.5), { rFwd: 150 - dn * 30, lFwd: 150 - dn * 30, rUp: -22, lUp: -22, nod: -4 + Math.sin(t * 2) * 2, bob: Math.sin(t * 2.2) * 0.04 }, t > dur * 0.42 && t < dur * 0.7 ? { turn: Math.sin(t * 16) * 14 } : {})); A.setFace(t < dur * 0.4 ? 'relieved' : t < dur * 0.75 ? 'delighted' : 'smile');
      env.keyAt(-0.6, 5.6, 4.6, 16, 0xfff0e0); const h = eye(A, 4.64); faceCam(cam, sm(t, 0, dur), [h[0], h[1], h[2]], TRY, { dist: 8.2, lens: 36, side: -3.0, up: 0.5, push: 1.4, look: 0.25 });
    };
  },
  // 48 "Two eyes. One nose. No antennae at all."  — (a) his face, blinking, friendly; (b) Opal squints and tilts her head, Dad recoils behind her; (c) tilt up from his eyes to the top of his head: just hair. He looks up too, puzzled.
  (S, cam) => {
    const env = quarry(S); const fam = family(S, { O: 'thinking', D: 'disgusted', B: 'confused', F: 'scared' }); const A = bare(S, TM, TRY, 'smile'); place(fam.F, 9.4, 0, -4.6, FRY);
    return (t, dur) => { env.update(t, { fire: 0, power: 1 }); const [k, lt] = seg(t, dur, [0.3, 0.62]); A.tuck();
      A.pose(ps(idle(t, 0.6), TUCK, k === 2 ? { nod: -22 * sm(lt, 0.4, 0.8), rFwd: 130 * sm(lt, 0.5, 0.9), rUp: 30 * sm(lt, 0.5, 0.9) } : { tilt: 5 })); A.setFace(k === 2 && lt > 0.4 ? 'confused' : 'smile');
      fam.O.pose(ps(idle(t, 0.5), { tilt: 12 * sm(lt, 0.2, 0.6), lean: 10, rFwd: 20, nod: -4 }, look(lookAt(fam.O, eye(A)), 0.22))); fam.O.setFace(lt < 0.5 ? 'thinking' : 'confused');
      fam.Dd.pose(ps(idle(t, 0.5, 1), { lean: -10, rUp: 36, lUp: 36, rFwd: 24, lFwd: 24 }, look(lookAt(fam.Dd, eye(A)), 0.5))); fam.B.pose(ps(idle(t, 0.5, 2), { rFwd: 126, rUp: 10, tilt: -8 })); fam.F.pose(ps(idle(t, 0.5, 3), { lean: 14, bob: -0.2 })); fam.dg.update(t, 'tilt');
      const h = eye(A, 4.64);
      if (k === 0) { env.keyAt(-0.6, 5.6, 4.6, 16, 0xfff0e0); faceCam(cam, lt, h, TRY, { dist: 6.4, lens: 40, side: -2.4, up: 0.2, push: 0.5, look: 0.05 }); return; }
      if (k === 1) { env.keyAt(4.4, 5.2, 6.5, 14, 0xfff0e0); const oh = eye(fam.O, 4.64); camPath(cam, lt, [3.2, 4.6, 8.8], [3.5, 4.6, 8.0], [oh[0] + 0.7, oh[1] - 0.1, oh[2]], [oh[0] + 0.7, oh[1], oh[2]], 34, 36); return; }
      env.keyAt(-0.6, 5.6, 4.6, 16, 0xfff0e0); camPath(cam, lt, [-0.4, 5.3, 6.2], [-0.6, 6.0, 6.0], [h[0], h[1], h[2]], [h[0], h[1] + 1.25, h[2]], 40);
    };
  },
  // 49 "I come in peace," it said. "Take me to your leader."  — medium: helmet under one arm, the other hand raised in a solemn greeting, the lit lander behind him. He delivers it like he has practised in a mirror for nine months.
  (S, cam) => {
    const env = quarry(S); const A = bare(S, TM, 40, 'proud');
    return (t, dur) => { env.update(t, { fire: 0, power: 1 }); A.tuck(); const w = dur * 0.1, b = dur * 0.55;
      A.pose(ps(idle(t, 0.6), talk(t, 1.1), TUCK, hit([[0, { rUp: 10 }], [w + 0.3, { rUp: 128, rFwd: 30, nod: -4 }], [b, { rUp: 128, rFwd: 30, nod: -4 }], [b + 0.3, { rUp: 20, rFwd: 96, lean: 6, nod: 4 }], [dur, { rUp: 24, rFwd: 90, lean: 8 }]], t))); A.setFace(t < b ? 'proud' : 'smile');
      env.keyAt(-1.4, 5.4, 6, 16, 0xfff0e0); camPath(cam, sm(t, 0, dur), [0.4, 3.7, 13.4], [-0.2, 3.9, 11.8], [-3.3, 3.5, 0.2], [-3.3, 3.7, 0.2], 28, 29);
    };
  },
  // 50 "Aliens," Dad whispered. "I knew it."  — the family group: Dad leans sideways to Opal, hand shielding his mouth, eyes never leaving the stranger. On "I knew it" every hat lifts: antennae spring up, one after another —
  //   Dad, Opal, Mrs. Bell, Finn… and the dog. (b) the visitor: grin frozen, then jaw on the floor; the helmet slips from under his arm.
  (S, cam) => {
    const env = quarry(S); const fam = family(S, { O: 'bored', D: 'nervous', B: 'confused', F: 'awe' }); const A = bare(S, TM, TRY, 'smile'); place(fam.F, 9.4, 0, -4.6, FRY);
    return (t, dur) => { env.update(t, { fire: 0, power: 1 }); const [k, lt] = seg(t, dur, [0.74]); const pop = dur * 0.5; feel(fam, i => hn([[pop + [0, 0.12, 0.26, 0.4, 0.62][i], 0], [pop + [0, 0.12, 0.26, 0.4, 0.62][i] + 0.22, 1]], t), t);
      fam.Dd.pose(ps(idle(t, 0.4, 1), talk(t, 0.8), hit([[0, {}], [0.4, { bodyTilt: -10, tilt: -14, lFwd: 126, lUp: 8, turn: 12 }]], t), look(lookAt(fam.Dd, eye(A)), 0.3))); fam.Dd.setFace(t < pop ? 'nervous' : 'smirk');
      fam.O.pose(ps(idle(t, 0.5), { tilt: 8 * sm(t, 0.2, 0.6), rUp: 26, lUp: 26, rFwd: -8, lFwd: -8 }, look(lookAt(fam.O, eye(A)), 0.22))); fam.O.setFace(t < pop ? 'bored' : 'smirk');
      fam.B.pose(ps(idle(t, 0.5, 2), { rFwd: 30, lFwd: 30 }, look(lookAt(fam.B, eye(A)), 0.4))); fam.B.setFace(t < pop + 0.3 ? 'confused' : 'smile'); fam.F.pose(ps(idle(t, 0.5, 3), { lean: 14 * (1 - sm(t, pop, pop + 0.6)), rUp: 150 * sm(t, pop + 0.5, pop + 0.8) })); fam.F.setFace(t < pop + 0.4 ? 'awe' : 'grin'); fam.dg.update(t, t < pop + 0.6 ? 'sit' : 'wag');
      const dr = dur * 0.74 + dur * 0.26 * 0.45; const fall = sm(t, dr, dr + 0.35); A.pose(ps(idle(t, 0.4), fall > 0 ? { lUp: 40, lFwd: 20, rUp: 40, rFwd: 20, lean: -8, nod: -4 } : TUCK)); if (fall <= 0) A.tuck(); else { A.hp.position.y = Math.max(0.95, A.hp.position.y - 0.16 - fall * 0.5); A.hp.rotation.z += 0.12 * (A.hp.position.y > 1 ? 1 : 0); } A.setFace(t < dr - 0.15 ? 'fakesmile' : 'shock');
      if (k === 0) { env.keyAt(6.5, 5.4, 8, 14, 0xfff0e0); famCam(cam, lt, { push: 2.0 }); return; }
      env.keyAt(-0.6, 5.6, 4.6, 16, 0xfff0e0); const h = eye(A, 4.4); faceCam(cam, lt, h, TRY, { dist: 8.0, lens: 34, side: -3.0, up: 0.1, push: 0.8, look: -0.5 });
    };
  },
  // 51 "It gave back the gnome. We let it keep the dirt."  — (a) two-shot, side on: he presents the gnome with both hands like a medal; Dad takes it and clutches it to his chest, antennae quivering;
  //   (b) Mrs. Bell hands him the bag of dirt; he hugs it like treasure.
  (S, cam) => {
    const env = quarry(S); const A = astro(S, [-1.2, 0, 1.0], 86, 'smile'); A.helm.g.visible = false; A.hairMesh.visible = true; const Dd = dad(S, 'awe', [3.6, 0, 1.0], -86); const B = bell(S, 'smile', [3.6, 0, 1.0], -86); const gn = gardenGnome(S, 1.0); const bag = dirtBag(S, 1.3); allow(S, ['visitor', 'dad'], ['visitor', 'bell']);
    return (t, dur) => { env.update(t, { fire: 0, power: 1 }); const [k, lt] = seg(t, dur, [0.5]); Dd.root.visible = gn.visible = k === 0; B.root.visible = bag.visible = k === 1; Dd.feel.set(1, t); B.feel.set(1, t + 2);
      if (k === 0) { const g = dur * 0.22; const took = sm(t, g, g + 0.3); A.pose(ps(idle(t, 0.5), { rFwd: 88, lFwd: 88, rUp: -12, lUp: -12, lean: 8, nod: 6 })); A.setFace('smile'); Dd.pose(ps(idle(t, 0.5), hit([[0, { rFwd: 60, lFwd: 60, rUp: -10, lUp: -10 }], [g, { rFwd: 88, lFwd: 88, rUp: -12, lUp: -12, lean: 8 }], [g + 0.5, { rFwd: 118, lFwd: 118, rUp: -20, lUp: -20, lean: -6, nod: 10, tilt: 8 }]], t))); Dd.setFace(t < g + 0.3 ? 'awe' : 'love');
        const a = hands(A), d = hands(Dd); gn.position.set(lerp(a.x + 0.25, d.x - 0.1, took), lerp(a.y - 0.6, d.y - 0.6, took), lerp(a.z, d.z, took)); gn.rotation.y = Math.PI / 2 * (1 - took * 2);
        env.keyAt(1.2, 5, 7, 16, 0xfff0e0); camPath(cam, lt, [1.2, 3.3, 19.5], [1.2, 3.6, 18], [1.2, 3.5, 1], [1.2, 3.6, 1], 26); return; }
      const g = dur * 0.5 + dur * 0.5 * 0.3; const took = sm(t, g, g + 0.3); B.pose(ps(idle(t, 0.5), hit([[0, { rFwd: 88, lFwd: 88, rUp: -12, lUp: -12 }], [g + 0.4, { rFwd: 30, lFwd: 30, rUp: 30, lUp: 30, tilt: 8 }]], t))); B.setFace(took < 1 ? 'smile' : 'confused');
      A.pose(ps(idle(t, 0.5), hit([[0, { rFwd: 70, lFwd: 70, rUp: -10, lUp: -10 }], [g, { rFwd: 88, lFwd: 88, rUp: -12, lUp: -12, lean: 8 }], [g + 0.5, { rFwd: 120, lFwd: 120, rUp: -22, lUp: -22, lean: -6, nod: 12, tilt: -10 }]], t), took >= 1 ? { bodyTurn: Math.sin(t * 5) * 8 } : {})); A.setFace(took < 1 ? 'delighted' : 'love');
      const a = hands(A), d = hands(B); bag.position.set(lerp(d.x - 0.2, a.x + 0.1, took), lerp(d.y - 0.5, a.y - 0.55, took), lerp(d.z, a.z, took)); env.keyAt(1.2, 5, 7, 16, 0xfff0e0); camPath(cam, lt, [1.0, 3.5, 19], [0.8, 3.8, 17.6], [1.1, 3.6, 1], [0.9, 3.7, 1], 26, 26);
    };
  },
  // 52 "It said it came from a tiny blue dot."  — (a) he points straight up, Opal beside him follows his arm with her eyes, antennae tilting back; (b) the sky from the quarry floor: two lumpy little moons… and one small, steady blue star.
  (S, cam) => {
    const env = quarry(S, { dot: true }); const A = bare(S, [-1.6, 0, 1.2], 24, 'softsmile'); const O = opal(S, 'awe', [3.9, 0, 1.6], -24);
    return (t, dur) => { env.update(t, { fire: 0, power: 1 }); const [k, lt] = seg(t, dur, [0.5]); A.tuck(); O.feel.set(1, t); const p = dur * 0.12;
      A.pose(ps(idle(t, 0.5), TUCK, hit([[0, { rUp: 10 }], [p + 0.35, { rUp: 162, rFwd: 14, nod: -24 }]], t))); O.pose(ps(idle(t, 0.5), hit([[p + 0.2, { nod: 0 }], [p + 0.6, { nod: -30, lean: -6, rUp: 14, lUp: 14 }]], t))); O.setFace(t < p + 0.5 ? 'confused' : 'awe');
      if (k === 0) { env.keyAt(0.8, 5.2, 7, 16, 0xfff0e0); camPath(cam, lt, [0.9, 2.6, 17.5], [0.8, 2.4, 16], [0.7, 4.0, 1.4], [0.7, 4.6, 1.4], 26); return; }
      S.userData.dof = false; camPath(cam, lt, [0, 3, 12], [0, 3, 12], [2, 160, -190], [5, 170, -200], 30, 38);
    };
  },
  // 53 "Some place called Earth. Never heard of it."  — Opal, close, to us: a small shrug, antennae bobbing. Behind her the lander lifts off on a column of blue light and the family wave it up into the sky.
  (S, cam) => {
    const env = quarry(S); const O = opal(S, 'smirk', [6.4, 0, 5.2], 4); const Dd = dad(S, 'smile', [12.2, 0, -1.0], -150); const F = finn(S, 'grin', [1.2, 0, 0.6], 170); const gn = gardenGnome(S, 1.0);
    return (t, dur) => { const up = sm(t, dur * 0.25, dur) ; env.lander.g.position.y = up * up * 26; env.update(t, { fire: 0, power: 1 }); env.flood.intensity = 420; O.feel.set(1, t); Dd.feel.set(1, t + 1); F.feel.set(1, t + 2); const sh = dur * 0.5;
      O.pose(ps(idle(t, 0.7), talk(t, 0.5), anticipate(t, sh), hit([[0, POSES.hips], [sh, POSES.hips], [sh + 0.3, { rUp: 40, lUp: 40, rFwd: 30, lFwd: 30, tilt: 10, nod: -2 }], [sh + 1.0, { rUp: 28, lUp: 28, rFwd: -8, lFwd: -8, tilt: 4 }]], t))); O.setFace(t < sh ? 'thinking' : t < sh + 0.9 ? 'smirk' : 'softsmile');
      Dd.pose(ps(idle(t, 0.5, 1), { rUp: 150 + Math.sin(t * 7) * 14, lFwd: 70, lUp: -10, nod: -26 })); const lp = pinky(Dd, 'L'); gn.position.set(lp.x, lp.y - 0.3, lp.z); F.pose(ps(idle(t, 0.5, 2), { rUp: 150 + Math.sin(t * 9) * 16, lUp: 150 + Math.cos(t * 9) * 16, nod: -30, bob: Math.abs(Math.sin(t * 8)) * 0.2 }));
      env.keyAt(6.8, 5.2, 10, 15, 0xfff0e0); const lk = [5.9, 4.3, 5.2]; camPath(cam, sm(t, 0, dur), [7.8, 4.4, 15.5], [7.5, 4.5, 14.2], lk, [5.8, 4.5, 5.2], 30, 31); shake(cam, t, dur * 0.25, 0.4);
    };
  },
  // 54 "Anyway. Greetings from Mars."  — the back yard again: the whole family (antennae up, dog included) waving at a spark climbing the sky. The camera lifts and pulls back, and back —
  //   over the roof, the neighbours' roofs, the rust-red plains and craters, two small moons, one blue star. A road sign: WELCOME TO MARS.
  (S, cam) => {
    const env = dustyYard(S, { reveal: true }); const O = opal(S, 'smile', [-0.6, 0, 4.0], 0), Dd = dad(S, 'grin', [4.0, 0, 2.4], -6), F = finn(S, 'grin', [-4.8, 0, 3.0], 8), B = bell(S, 'smile', [10.8, 0, 3.6], -12); const dg = dog(S, [-8.4, 0, 3.6], 20); dg.feel = feelers({ headMesh: dg.head }, { col: 0x8ad8ff, h: 1.6 }); dg.feel.g.position.set(0, 0.9, -0.2);
    cam.far = 1400; cam.updateProjectionMatrix(); S.userData.dof = false;
    return (t, dur) => { env.update(t); env.gate.userData.open(1); [O, Dd, F, B].forEach((P, i) => { P.feel.set(1, t + i); P.pose(ps(idle(t, 0.6, i), { rUp: 150 + Math.sin(t * (7 + i)) * 16, nod: -16, lUp: i % 2 ? 150 + Math.cos(t * 8) * 14 : 8 })); }); dg.feel.set(1, t); dg.update(t, 'wag');
      const u = sm(t, dur * 0.04, dur * 0.5), v = sm(t, dur * 0.42, dur * 0.8); env.landing(0.92 - u * 0.75, t); env.follow(0, 2); env.keyAt(1.6, 5.6, 10, 18 * (1 - u)); const L3 = (a, b, k) => a.map((x, i) => lerp(x, b[i], k));
      const P = L3(L3([1.6, 4.2, 19], [4, 26, 58], u), [10, 8.6, 68], v), Lk = L3(L3([1.6, 4.2, 3], [4, 12, -60], u), [10, 8.8, 44], v); camPath(cam, 0, P, P, Lk, Lk, lerp(lerp(26, 20, u), 24, v));
    };
  },
];
