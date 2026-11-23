import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  tickStreet, clockLoft, clockShop, knitting, knitScarf, alarmClock } from '../../engine/kit.js';
import { dash, dad, opal, bram, commuter, dashClock, dadClock, bramClock, opalClock, commuterClock, DASH_SHADES, GIANT,
  ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, JOG, shake, rumble, arc, lie, clamp01 } from './common.js';

const HIPS = POSES.hips;
const CROSS = { rFwd: 75, lFwd: 75, rUp: -38, lUp: -38 };
// a clock standing on a surface at height y
const place = (C, x, y, z, ry = 0) => { C.root.position.set(x, y, z); C.root.rotation.y = ry * D; };
// knitting needles held between both hands of an avatar
const needles = (k, A) => { const a = pinky(A, 'R'), b = pinky(A, 'L'); k.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.1, (a.z + b.z) / 2 + 0.1); };
// tiny clocks for the bedroom swarm
const TINY = [0xd8302a, 0xf2a020, 0x2a8a9a, 0x8a3ab8, 0x2aa84a, 0xf27ab8, 0x2a6ae8, 0xf2c420];
function swarm(S, n, s = 0.16, seed = 1) { const out = []; for (let i = 0; i < n; i++) out.push(alarmClock(S, { name: 'tiny' + i, s, col: TINY[(i + seed) % TINY.length], seed: i + seed * 7 })); return out; }

export const SHOTS_A = [
  // 2 "In this world,"  — Tick Street, morning: a man in striped pajamas sprints along the street, an orange alarm clock bounding after him; pigeons scatter
  (S, cam) => {
    const env = tickStreet(S);
    const C = commuter(S, 'scared', [44, 0, -3], -90); const K = commuterClock(S, 0.55);
    return (t, dur) => { env.update(t); env.pigeonsFly(t, sm(t, 0.1, dur));
      const x = 44 - t * 7.5; C.root.position.x = x; C.pose(addPose(RUN(t), { turn: 25 * Math.sin(t * 2), nod: -6 }));
      place(K, x + 4.2, 0, -3, -90); K.update(t, 'run'); K.face('flat', -1); K.look(headOf(C));
      camPath(cam, t / dur, [24, 4.2, 15], [25, 4.6, 13.5], [38, 3.6, -4], [36, 3.8, -4], 24, 25);
    };
  },
  // 3 "hit snooze, and your alarm clock comes for you."  — cut 1: low angle on the running orange clock, eyes locked, angry brows; cut 2: the man glances back, terrified
  (S, cam) => {
    const env = tickStreet(S);
    const C = commuter(S, 'scared', [36, 0, -2], -90); const K = commuterClock(S, 0.55);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.5]);
      const x = 36 - t * 6.5; C.root.position.x = x; C.pose(addPose(RUN(t), k ? { turn: 70, nod: -4 } : {})); if (k) C.setFace('shock');
      place(K, x + 4.0, 0, -2, -90); K.update(t, 'run'); K.face(k ? 'grin' : 'flat', -1); K.look(V([cam.position.x, cam.position.y, cam.position.z]));
      if (k === 0) camPath(cam, u, [x + 0.5 - 2, 1.2, 2.8], [x - 1.5, 1.3, 2.6], [x + 4.0, 1.6, -2], [x + 3.2, 1.7, -2], 26, 28);
      else { const h = headOf(C).toArray(); camPath(cam, u, [h[0] - 6.5, h[1] + 0.2, h[2] + 4.5], [h[0] - 6.0, h[1] + 0.2, h[2] + 4.0], [h[0] + 0.5, h[1] - 0.3, h[2]], [h[0] + 0.5, h[1] - 0.3, h[2]], 30, 32); }
    };
  },
  // 4 "It grows legs and chases you."  — an orange clock sits on a doorstep; two legs POP out, it hops down and charges at the camera
  (S, cam) => {
    const env = tickStreet(S);
    const K = commuterClock(S, 0.6);
    return (t, dur) => { env.update(t);
      const pop = hn([[0, 0.02], [dur * 0.25, 0.02], [dur * 0.42, 1]], t); const run = sm(t, dur * 0.55, dur);
      K.update(t, run > 0.01 ? 'run' : 'idle', run); K.legs.R.scale.y = K.legs.L.scale.y = pop;
      const sitY = 0.5 - (1 - pop) * 1.65 * 0.6; const hop = t > dur * 0.45 ? Math.sin(Math.PI * clamp01((t - dur * 0.45) / (dur * 0.2))) * 0.8 : 0;
      K.root.position.set(49, (t < dur * 0.55 ? sitY : 0) + hop, -13.0 + run * 7);
      K.face(t > dur * 0.3 ? 'grin' : 'flat', t > dur * 0.3 ? -1 : 0); K.look(V([49, 3, 10])); if (t < dur * 0.25) K.blink(0.2); else K.blink(1);
      camPath(cam, t / dur, [49.5, 2.2, -1.0], [49.3, 2.0, -2.8], [49, 1.4, -12], [49, 1.2, -9], 30, 32);
    };
  },
  // 5 "It only stops when you're on time."  — the man screeches to a stop at the office door (9:00 on the tower behind); the clock stops, grins, waves
  (S, cam) => {
    const env = tickStreet(S);
    const C = commuter(S, 'scared', [56, 0, -8.6], -90); const K = commuterClock(S, 0.55);
    return (t, dur) => { env.update(t);
      const x = hn([[0, 56], [dur * 0.35, 49.6]], t); C.root.position.x = x; const stop = t > dur * 0.35; C.root.rotation.y = hn([[dur * 0.35, -90], [dur * 0.55, -15]], t) * D;
      C.pose(stop ? addPose(idle(t, 1), hit([[dur * 0.35, { lean: 14 }], [dur * 0.6, { lFwd: 95, lUp: -20, nod: 18, turn: 0 }], [dur, { lFwd: 95, lUp: -20, nod: 14, turn: 10 }]], t)) : RUN(t));
      if (stop) C.setFace(t > dur * 0.65 ? 'relieved' : 'nervous');
      const kx = hn([[0, 60.5], [dur * 0.4, 54.2]], t); place(K, kx, 0, -8.6, -90); K.update(t, stop ? (t > dur * 0.6 ? 'wave' : 'idle') : 'run'); K.face(t > dur * 0.5 ? 'smile' : 'flat', t > dur * 0.5 ? 0 : -1);
      if (t > dur * 0.5) K.look(V([52, 3, 8]));
      camPath(cam, t / dur, [51.6, 4.4, 6.5], [51.3, 4.3, 5.2], [51.4, 3.2, -9], [51.2, 3.1, -9], 26, 27);
    };
  },
  // 6 "My dad hit snooze once."  — clock shop: Dad yawns and stretches behind the counter; his blue clock on the counter glares and taps its foot
  (S, cam) => {
    const env = clockShop(S);
    const P = dad(S, 'sleepy', [1.8, 0, -7.4], 0); const K = dadClock(S, 0.34); place(K, -0.2, 3.15, -5.2, 20);
    return (t, dur) => { env.update(t);
      P.pose(addPose(idle(t, 0.6), hit([[0, { rUp: 20, lUp: 20 }], [dur * 0.4, { rUp: 160, lUp: 160, nod: -22, lean: -6 }], [dur * 0.75, { rUp: 150, lUp: 150, nod: -20 }], [dur, { rUp: 40, lUp: 40, nod: 4 }]], t)));
      if (t > dur * 0.75) P.setFace('nervous');
      K.update(t, 'idle'); K.face('flat', -1); K.look(headOf(P)); K.legs.R.rotation.x = -Math.abs(Math.sin(t * 9)) * 0.4;
      camPath(cam, t / dur, [0.4, 4.6, 5.6], [0.6, 4.6, 4.0], [0.9, 4.1, -6], [0.9, 4.2, -6], 26, 28);
    };
  },
  // 7 "His clock chased him to work in his slippers."  — street: Dad sprints along in his apron and pink fluffy slippers, the blue clock hot on his heels
  (S, cam) => {
    const env = tickStreet(S);
    const P = dad(S, 'scared', [-4, 0, 1.5], 90); const K = dadClock(S, 0.6);
    return (t, dur) => { env.update(t);
      const x = -4 + t * 6.8; P.root.position.x = x; P.pose(addPose(RUN(t), { turn: -30 + Math.sin(t * 3) * 20 }));
      place(K, x - 4.2, 0, 1.5, 90); K.update(t, 'run'); K.face('grin', -1); K.look(headOf(P));
      camPath(cam, t / dur, [x - 2, 2.6, 17], [x - 1, 2.8, 16], [x - 1.5, 2.6, 1.5], [x - 1.0, 2.8, 1.5], 24, 24);
      cam.position.x = x - 1.6; cam.lookAt(x - 1.8, 2.8, 1.5);
    };
  },
  // 8 "Mister Bram snoozed twice."  — Bram in front of his blue door, sleepy, while TWO green clocks bounce on either side of him
  (S, cam) => {
    const env = tickStreet(S);
    const B = bram(S, 'sleepy', [16, 0, -10.6], 0); const K1 = bramClock(S, 0, 0.5), K2 = bramClock(S, 1, 0.5);
    return (t, dur) => { env.update(t);
      B.pose(addPose(idle(t, 0.8), hit([[0, {}], [dur * 0.5, { rUp: 25, lUp: 25, nod: 10, bob: -0.1 }], [dur, { rUp: 20, lUp: 20, nod: 14, tilt: 8 }]], t)));
      if (t > dur * 0.6) B.setFace('bored');
      place(K1, 12.4, 0, -8.4, 25); place(K2, 19.8, 0, -10.0, -25); K1.update(t, 'cheer'); K2.update(t + 0.3, 'cheer'); K1.face('grin'); K2.face('grin'); K1.look(headOf(B)); K2.look(headOf(B));
      camPath(cam, t / dur, [16, 4.8, 7.5], [16, 4.6, 5.5], [16, 3.4, -10.6], [16, 3.6, -10.6], 26, 28);
    };
  },
  // 9 "Now he jogs every morning. Not by choice."  — Bram jogs toward camera, deadpan; the two clocks jog behind him in step
  (S, cam) => {
    const env = tickStreet(S);
    const B = bram(S, 'bored', [30, 0, -1], -60); const K1 = bramClock(S, 0, 0.5), K2 = bramClock(S, 1, 0.5);
    return (t, dur) => { env.update(t);
      const d = t * 3.2, dir = new THREE.Vector3(-Math.sin(60 * D), 0, Math.cos(60 * D)); const p = V([30, 0, -1]).addScaledVector(dir, d);
      B.root.position.copy(p); B.pose(addPose(JOG(t), t > dur * 0.5 ? { turn: -12, tilt: -6 } : {})); if (t > dur * 0.55) B.setFace('pout');
      const q1 = p.clone().addScaledVector(dir, -4.2).add(V([-1.3, 0, -1.3])), q2 = p.clone().addScaledVector(dir, -4.2).add(V([1.6, 0, 1.6]));
      place(K1, q1.x, 0, q1.z, -60); place(K2, q2.x, 0, q2.z, -60); K1.update(t, 'run', 0.7); K2.update(t + 0.2, 'run', 0.7); K1.face('smile'); K2.face('smile');
      const h = headOf(B).toArray(); camPath(cam, t / dur, [h[0] - 6.5, 4.6, h[2] + 9.5], [h[0] - 6.0, 4.6, h[2] + 8.5], [h[0] + 1.0, 3.0, h[2] - 1], [h[0] + 1.0, 3.1, h[2] - 1], 28, 30);
    };
  },
  // 10 "Grandma Opal hasn't hit snooze in sixty years."  — Opal rocks in her chair, knitting, chin up, proud
  (S, cam) => {
    const env = clockShop(S);
    const O = opal(S, 'proud', [-7.35, 0, -2.2], 35); sitOn(O, 1.62); const kn = knitting(S, 0xf2c420);
    const K = opalClock(S, 0.42); place(K, -4.2, 1.0 - 0.69, -1.0, -20); allow(S, ['opalclock', 'stool']);
    return (t, dur) => { env.update(t); env.rock(t, 0.6);
      O.pose(addPose(SIT, addPose(idle(t, 0.5), hit([[0, { rFwd: 60, lFwd: 60, rUp: -28, lUp: -28, nod: 14 }], [dur * 0.5, { rFwd: 60, lFwd: 60, rUp: -28, lUp: -28, nod: -12, tilt: 6 }], [dur, { rFwd: 60, lFwd: 60, rUp: -28, lUp: -28, nod: -10, tilt: 8 }]], t))));
      O.root.position.y = 1.62 - 1.5 * 0.92 + Math.sin(t * 1.6) * 0.03; needles(kn, O); kn.rotation.y = 35 * D; if (kn.click) kn.click(t);
      if (t > dur * 0.45) O.setFace('smirk');
      K.update(t, 'knit'); K.root.position.y = 1.0 - 0.69 * 1;
      const h = headOf(O).toArray(); faceCam(cam, t / dur, [h[0], h[1] - 0.6, h[2]], 35, { dist: 9.5, lens: 30, side: -0.4, push: 1.2, up: 0.4 });
    };
  },
  // 11 "Her clock got bored and took up knitting."  — close: the lavender clock with tiny glasses, sitting on a footstool, knitting a very long scarf; it sighs
  (S, cam) => {
    const env = clockShop(S);
    const O = opal(S, 'softsmile', [-7.35, 0, -2.2], 35); O.root.position.y = 1.62 - 1.38; O.pose(addPose(SIT, { rFwd: 60, lFwd: 60, rUp: -28, lUp: -28, nod: 14 }));
    const K = opalClock(S, 0.42); place(K, -4.2, 0.31, -1.0, -20); allow(S, ['opalclock', 'stool']); const kn = knitting(S, 0x2a8a9a); const sc = knitScarf(S, '', { len: 3.2, col: '#2a8a9a' });
    return (t, dur) => { env.update(t);
      K.update(t, 'knit'); K.root.position.y = 0.31; K.face(t > dur * 0.55 ? 'flat' : 'smile', t > dur * 0.55 ? 0.6 : 0); if (t > dur * 0.55) K.blink(0.45);
      const a = K.hand('R'), b = K.hand('L'); kn.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.1, (a.z + b.z) / 2 + 0.15); kn.scale.setScalar(0.55); kn.rotation.y = -20 * D; if (kn.click) kn.click(t);
      sc.position.set(kn.position.x, kn.position.y - 1.25, kn.position.z + 0.3); sc.rotation.set(0, -20 * D, Math.PI / 2); sc.scale.setScalar(0.6);
      O.pose(addPose(addPose(SIT, { rFwd: 60, lFwd: 60, rUp: -28, lUp: -28, nod: 14 }), idle(t, 0.4)));
      camPath(cam, t / dur, [-2.4, 2.6, 4.6], [-2.8, 2.4, 3.6], [-4.1, 1.5, -1.0], [-4.1, 1.5, -1.0], 34, 36);
    };
  },
  // 12 "I'm Dash. I'm sixteen."  — the loft: Dash bounces up, waves, grins; the tower clock window glows behind him
  (S, cam) => {
    const env = clockLoft(S);
    const A = dash(S, 'grin', [2.2, 0, 0.5], -8);
    return (t, dur) => { env.update(t);
      A.pose(addPose(addPose(idle(t, 1), anticipate(t, 0.35)), hit([[0, {}], [0.45, { rUp: 150, nod: -6, tilt: -6 }], [dur * 0.7, { rUp: 140 + Math.sin(t * 9) * 12, tilt: -4 }], [dur, { rUp: 60, ...HIPS, tilt: 4 }]], t)));
      if (t > dur * 0.6) A.setFace('smirk');
      camPath(cam, t / dur, [1.4, 4.4, 11.5], [1.6, 4.5, 9.8], [2.0, 4.2, 0.5], [2.0, 4.3, 0.5], 28, 30);
    };
  },
  // 13 "Today was my driving test. Nine o'clock sharp."  — cut 1: Dash spins toward his desk and points at the TEST DAY 9:00 sign; cut 2: the alarm clock on the nightstand, asleep
  (S, cam) => {
    const env = clockLoft(S);
    const A = dash(S, 'starstruck', [5.2, 0, -2.8], -20); const K = dashClock(S, 0.3); place(K, -4.3, 2.2, -6.9, 25); fill(S, [4.4, 6.0, 1.5], 10, 0xffe0c0, 12);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.55]);
      A.pose(addPose(idle(t, 1), hit([[0, { }], [0.4, { lUp: 150, lFwd: 30, turn: 25, nod: -6 }], [dur, { lUp: 155, lFwd: 30, turn: 28, nod: -8, rUp: 30 }]], t)));
      A.root.rotation.y = hn([[0, -40], [0.4, 10]], t) * D;
      K.update(t, 'idle'); K.blink(0.08); K.face('smile', 0.2); K.time(7, 0);
      if (k === 0) camPath(cam, u, [3.8, 4.8, 9.0], [4.2, 4.8, 7.8], [6.2, 4.4, -4.6], [6.2, 4.6, -4.8], 24, 26);
      else camPath(cam, u, [-3.0, 3.3, -3.6], [-3.3, 3.1, -4.2], [-4.3, 2.75, -6.9], [-4.3, 2.75, -6.9], 34, 38);
    };
  },
  // 14 "But my bed was so warm."  — Dash snuggled under the quilt, eyes shut, wriggling deeper; warm lamp, slow push-in
  (S, cam) => {
    const env = clockLoft(S);
    const A = dash(S, 'sleeping', [0, 0, 0], 0); lie(A, -7.6, -7.0); const K = dashClock(S, 0.3); place(K, -4.3, 2.2, -6.9, 25);
    allow(S, ['dash', 'bed*']);
    return (t, dur) => { env.update(t);
      A.pose(addPose({ rUp: -8, lUp: -8, tilt: Math.sin(t * 1.3) * 8, turn: 20 + Math.sin(t * 0.8) * 10 }, { bob: Math.sin(t * 1.6) * 0.04 }));
      env.blanket.position.y = 2.0 + Math.sin(t * 1.6) * 0.04; env.blanket.scale.set(1, 1.2, 1.25); env.blanket.position.z = -3.9;
      if (t > dur * 0.5) A.setFace('relieved');
      K.update(t, 'idle'); K.blink(0.08); K.time(7, 0);
      camPath(cam, t / dur, [-3.2, 6.2, 0.4], [-4.2, 5.4, -1.4], [-7.4, 2.6, -5.6], [-7.4, 2.6, -5.8], 28, 32);
    };
  },
  // 15 "Snooze one felt amazing."  — the clock RINGS on the nightstand; Dash's hand slaps it — it flattens with an 'o'; Dash smiles in his sleep
  (S, cam) => {
    const env = clockLoft(S);
    const A = dash(S, 'sleeping', [0, 0, 0], 0); lie(A, -7.6, -7.0); const K = dashClock(S, 0.3); place(K, -4.3, 2.2, -6.9, 25);
    allow(S, ['dash', 'bed*'], ['dash', 'clock'], ['dash', 'nightstand']);
    return (t, dur) => { env.update(t);
      const slap = sm(t, dur * 0.3, dur * 0.42) * (1 - sm(t, dur * 0.7, dur * 0.95));
      A.pose({ lUp: 15 + slap * 75, lFwd: slap * 20, turn: 25, nod: 0 });
      env.blanket.scale.set(1, 1.2, 1.25); env.blanket.position.z = -3.9;
      const ringing = t < dur * 0.4; K.ringK = ringing ? 1 : 0; K.update(t, ringing ? 'ring' : 'idle', 1); K.time(7, 0);
      if (!ringing) { K.g.scale.set(0.3 * 1.25, 0.3 * (0.7 + 0.3 * sm(t, dur * 0.5, dur)), 0.3); K.face('o', 0.8); } else K.face('grin', -0.5);
      if (t > dur * 0.5) A.setFace('relieved');
      camPath(cam, t / dur, [-1.8, 4.2, -2.0], [-2.2, 4.0, -2.8], [-5.0, 2.6, -6.6], [-5.0, 2.6, -6.6], 30, 32);
    };
  },
  // 16 "Snooze fifty felt like a vacation."  — Dash in sunglasses, hands behind his head, grinning; the clock beside him taps its foot, arms crossed
  (S, cam) => {
    const env = clockLoft(S);
    const A = dash(S, 'grin', [0, 0, 0], 0, DASH_SHADES); lie(A, -7.6, -7.0); const K = dashClock(S, 0.3); place(K, -4.3, 2.2, -6.9, 25);
    allow(S, ['dash', 'bed*']);
    return (t, dur) => { env.update(t);
      A.pose({ rUp: -30, lUp: -30, rFwd: 70, lFwd: 70, turn: 8 + Math.sin(t * 2) * 6, tilt: Math.sin(t * 1.5) * 4 });
      env.blanket.scale.set(1, 1.2, 1.0); env.blanket.position.z = -2.6;
      K.update(t, 'idle'); K.arms.R.rotation.set(-1.3, 0, 0.9); K.arms.L.rotation.set(-1.3, 0, -0.9); K.legs.L.rotation.x = -Math.abs(Math.sin(t * 8)) * 0.4;
      K.face('flat', -1); K.look(headOf(A)); K.time(8, 10);
      camPath(cam, t / dur, [-4.6, 8.4, 2.6], [-5.0, 8.0, 1.6], [-6.4, 2.4, -6.2], [-6.4, 2.4, -6.3], 24, 26);
    };
  },
  // 17 "Snooze ninety-nine felt like a mistake."  — Dash's eyes snap open: the clock is standing on his chest, red-faced, glaring down at him
  (S, cam) => {
    const env = clockLoft(S); env.sunK(0.6);
    const A = dash(S, 'sleeping', [0, 0, 0], 0); lie(A, -7.6, -7.0); const K = dashClock(S, 0.42);
    allow(S, ['dash', 'bed*'], ['dash', 'clock']);
    const red = fill(S, [-7.6, 4.6, -3.4], 4, 0xff6040, 8);
    return (t, dur) => { env.update(t);
      A.pose({ rUp: -8, lUp: -8, turn: hn([[0, 20], [dur * 0.3, 0]], t), nod: hn([[0, 0], [dur * 0.3, -12]], t) }); if (t > dur * 0.28) A.setFace('shock');
      env.blanket.scale.set(1, 1.2, 1.25); env.blanket.position.z = -3.9;
      place(K, -7.2, 2.5, -4.0, 150); K.update(t, 'idle'); K.face('frown', -1); K.time(8, 52); K.look(headOf(A)); K.arms.R.rotation.z = -2.2; K.arms.L.rotation.z = 2.2; red.intensity = 2 + Math.sin(t * 10) * 1.5;
      const h = headOf(A).toArray(); camPath(cam, t / dur, [h[0] + 4.2, h[1] + 5.0, h[2] + 6.4], [h[0] + 3.6, h[1] + 4.4, h[2] + 5.4], [h[0] + 0.3, h[1] + 0.4, h[2] + 1.4], [h[0] + 0.3, h[1] + 0.4, h[2] + 1.3], 28, 32);
    };
  },
  // 18 "Little clocks crawled out from under my bed."  — floor-level: a swarm of tiny clocks scuttles out from under the bed toward the camera, eyes glinting
  (S, cam) => {
    const env = clockLoft(S); env.sunK(0.7); allow(S, ['tiny*', 'tiny*'], ['tiny*', 'bed*']);
    const sw = swarm(S, 16, 0.16, 1); const R = sw.map((_, i) => [(i % 4) * 1.0 - 1.5, Math.floor(i / 4) * 1.3, i * 0.13]);
    const glow = fill(S, [-5, 1.2, 0], 3, 0xffd8a0, 10);
    return (t, dur) => { env.update(t);
      sw.forEach((C, i) => { const [ox, oz, d] = R[i]; const u = clamp01((t - d) / (dur * 0.9)); const x = -7.6 + ox + u * (4.0 + ox * 0.6), z = -6.4 + oz + u * 6.5;
        C.root.position.set(x, 0, z); C.root.rotation.y = (20 + ox * 10) * D; C.update(t + i * 0.37, 'crawl'); C.face(i % 3 ? 'grin' : 'o', -1); C.look(V([cam.position.x, cam.position.y, cam.position.z])); });
      camPath(cam, t / dur, [-2.6, 0.8, 3.8], [-2.9, 0.7, 3.0], [-6.8, 0.5, -3.6], [-6.6, 0.55, -3.2], 26, 28);
    };
  },
  // 19 "Ninety-nine of them, clicking together."  — the tiny clocks hop on top of each other into a ticking pyramid in the middle of the room; Dash sits up in bed, horrified
  (S, cam) => {
    const env = clockLoft(S); env.sunK(0.7); allow(S, ['tiny*', 'tiny*']);
    const sw = swarm(S, 15, 0.2, 3);
    const slots = []; [[5, 0], [4, 1], [3, 2], [2, 3], [1, 4]].forEach(([n, row]) => { for (let i = 0; i < n; i++) slots.push([2.6 + (i - (n - 1) / 2) * 0.95, row * 0.86, 1.6]); });
    const start = sw.map((_, i) => [-4 + (i % 5) * 1.6 + Math.sin(i * 3) * 0.6, 4.5 + Math.cos(i * 2) * 2.5]);
    const A = dash(S, 'shock', [0, 0, 0], 0); allow(S, ['dash', 'bed*']);
    return (t, dur) => { env.update(t);
      sw.forEach((C, i) => { const t0 = i * dur * 0.045, u = clamp01((t - t0) / (dur * 0.32)); const [sx, sz] = start[i], [tx, ty, tz] = slots[i];
        const p = arc([sx, 0, sz], [tx, ty, tz], u, 2.0); C.root.position.copy(p); C.root.rotation.y = (1 - u) * 1.5;
        C.update(t + i, u < 1 ? 'crawl' : 'idle'); C.face(u < 1 ? 'grin' : 'smile'); if (u >= 1) { C.g.position.y = 0; C.shell.rotation.z = Math.sin(t * 40 + i) * 0.03; } });
      const k = sm(t, 0, 0.6); const sy = -Math.PI / 2 * (1 - k * 0.85); A.root.rotation.set(sy, 0, 0);
      A.root.position.set(-7.4, 1.9 - 2.0 * Math.cos(sy) + 0.5, -4.3 - 2.0 * Math.sin(sy)); A.pose({ rLeg: 80 * k, lLeg: 80 * k, rUp: 30, lUp: 30, rFwd: 30 * k, lFwd: 30 * k, turn: 25 });
      camPath(cam, t / dur, [4.6, 4.4, 11.5], [4.0, 4.2, 9.8], [0.2, 2.4, -1], [0.6, 2.5, -1], 24, 26);
    };
  },
  // 20 "Into one clock, taller than our house!"  — outside: the giant clock stands up behind the rooftops of Tick Street, taller than every house, bells ringing
  (S, cam) => {
    const env = tickStreet(S);
    const G = dashClock(S, 8.5, 'giant'); G.root.position.set(-20, 0, -31);
    return (t, dur) => { env.update(t); env.pigeonsFly(t, sm(t, dur * 0.3, dur));
      const rise = hn([[0, -30], [dur * 0.55, 0]], t); G.ringK = sm(t, dur * 0.6, dur * 0.7);
      G.update(t, G.ringK > 0 ? 'ring' : 'idle', G.ringK); G.root.position.y = rise; G.face(t > dur * 0.6 ? 'grin' : 'flat', -0.6); G.time(8, 52); G.look(V([-6, 2, 20]));
      camPath(cam, t / dur, [-6, 2.6, 34], [-6.5, 2.2, 32], [-14, 14, -14], [-15, 19, -18], 22, 22); if (t > dur * 0.6) rumble(cam, t, 1.2);
    };
  },
  // 21 "It rang so loud, Grandma dropped her knitting."  — the shop shakes: every clock rattles, Opal's needles fly out of her hands, her little clock covers its ears
  (S, cam) => {
    const env = clockShop(S);
    const O = opal(S, 'smile', [-7.35, 0, -2.2], 35); const kn = knitting(S, 0xf2c420); const K = opalClock(S, 0.42); place(K, -4.2, 0.31, -1.0, -20); allow(S, ['opalclock', 'stool']);
    return (t, dur) => { const sk = sm(t, 0.05, 0.3); env.update(t, sk);
      O.root.position.y = 1.62 - 1.38 + (sk > 0 ? Math.abs(Math.sin(t * 25)) * 0.06 : 0);
      O.pose(addPose(SIT, hit([[0, { rFwd: 60, lFwd: 60, rUp: -28, lUp: -28, nod: 14 }], [0.3, { rFwd: 40, lFwd: 40, rUp: 70, lUp: 70, nod: -14, lean: -8 }], [dur, { rFwd: 30, lFwd: 30, rUp: 80, lUp: 80, nod: -16, lean: -10 }]], t)));
      if (t > 0.25) O.setFace('shock');
      const u = clamp01((t - 0.28) / 0.6); if (u <= 0) needles(kn, O); else { const a = pinky(O, 'R'); kn.position.set(-6.4 + u * 0.6, Math.max(0.1, 2.6 + u * 1.2 - u * u * 3.8), -1.0 + u * 1.2); kn.rotation.z = u * 6; }
      K.update(t, 'knit'); K.root.position.y = 0.31; if (t > 0.3) { K.arms.R.rotation.set(0, 0, -2.6); K.arms.L.rotation.set(0, 0, 2.6); K.face('o', 1); K.blink(0.15); }
      const h = headOf(O).toArray(); faceCam(cam, t / dur, [h[0] + 1.2, h[1] - 1.2, h[2] + 0.6], 35, { dist: 11, lens: 26, side: 0.6, push: 0.8, up: 0.6 }); rumble(cam, t, sk * 1.4);
    };
  },
  // 22 "I jumped out the window."  — the tower clock face swings open like a hatch; Dash leaps out, bounces off the green awning and lands running
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'shock', [4, 17, -14.2], 0); allow(S, ['dash', 'tower']);
    return (t, dur) => { env.update(t);
      env.hands.rotation.y = -1.3 * sm(t, 0, dur * 0.3); const u1 = clamp01((t - dur * 0.12) / (dur * 0.42)), u2 = clamp01((t - dur * 0.54) / (dur * 0.42));
      let p; if (u1 < 1) p = arc([4, 16.6, -14.0], [4.6, 6.9, -12.0], u1, 1.8); else p = arc([4.6, 6.9, -12.0], [5.4, 0, -5.5], u2, 2.4);
      A.root.position.copy(p); A.root.rotation.y = 0;
      A.pose(u2 >= 1 ? addPose(RUN(t), { turn: -40 }) : hit([[0, { rUp: 40, lUp: 40 }], [dur * 0.3, { rUp: 160, lUp: 160, rLeg: 40, lLeg: -20 }], [dur * 0.55, { rUp: 120, lUp: 120, rLeg: 60, lLeg: 30, bob: -0.2 }], [dur * 0.9, { rUp: 150, lUp: 150, rLeg: -20, lLeg: 40 }]], t));
      if (t > dur * 0.8) A.setFace('determined');
      const look = [4.6, 6 + (1 - sm(t, 0.1, dur)) * 10, -13]; camPath(cam, t / dur, [9.5, 3.2, 13.5], [8.8, 3.0, 12.0], look, look, 22, 22);
      cam.lookAt(4.8, Math.max(3.0, p.y + 0.5), -12.5);
    };
  },
  // 23 "It stepped over the roofs and came after me."  — the giant swings one sneaker over the houses and lands in the street; Dash sprints out of frame
  (S, cam) => {
    const env = tickStreet(S);
    const G = dashClock(S, GIANT, 'giant'); const A = dash(S, 'scared', [0, 0, 6], -90); allow(S, ['giant', 'house*'], ['giant', 'stall*'], ['giant', 'road']);
    return (t, dur) => { env.update(t);
      const u = sm(t, 0, dur * 0.75); G.root.position.set(-20 + u * 4, Math.sin(Math.PI * u) * 4, -30 + u * 28); G.root.rotation.y = 0.2;
      G.update(t, 'stomp', 1); G.legs.R.rotation.x = -1.2 * Math.sin(Math.PI * u); G.legs.L.rotation.x = 0.6 * Math.sin(Math.PI * u); G.face('grin', -0.6); G.time(8, 53); G.look(headOf(A));
      const x = 2 - t * 7.5; A.root.position.x = x; A.pose(addPose(RUN(t), { turn: 50 }));
      camPath(cam, t / dur, [8, 2.2, 22], [8.5, 2.0, 21], [-10, 12, -10], [-12, 11, -6], 20, 20); if (u > 0.95 && t < dur * 0.95) shake(cam, t, dur * 0.75, 1.5);
    };
  },
];
