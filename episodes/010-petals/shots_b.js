import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, seg, hit, talk, lookAt, anticipate, sitOn, pinky, sob, T, T2,
  street, dayLight, pup, petals, petalRiver, petalPile, petalCarpet, stopSign, drawing, drawingStack, onePetal, sunnyPines, careRoom } from '../../engine/kit.js';
import { ADA, WALT, TOWN, mk, ada, walt, bell, ramp, sm, V, headOf, faceCam, fill, allowGround, allow, hold, hn, shower, PINK } from './common.js';

// ---- Grandpa's room helpers ----
const WALT_AT = [-3.6, 0, -5.3], ADA_AT = [1.6, 0, -5.4];
const SEAT = { rLeg: 90, lLeg: 90 };
const READ = { rFwd: 62, lFwd: 62, rUp: -26, lUp: -26, nod: 18 };          // holding a drawing in his lap
function room(S, { time = 'sunset', flash = false, riverOut = true } = {}) {
  const env = careRoom(S, { time });
  if (flash) S.userData.look = 'flash';
  // her drawings pinned all over the walls
  const kinds = ['rocket', 'sun', 'family', 'flower', 'grandpa', 'cat', 'house', 'rainbow'];
  let i = 0;
  for (const [x, y] of [[1.3, 4.3], [2.6, 4.1], [4.0, 4.4], [5.5, 4.2], [7.0, 4.4], [8.2, 4.1], [1.4, 8.0], [2.9, 7.9], [4.4, 8.1], [6.0, 7.9], [7.6, 8.0], [8.4, 6.2]]) { const d = drawing(S, kinds[i++ % 8], 1.05); d.position.set(x, y, -8.96); d.rotation.z = Math.sin(i * 1.7) * 0.08; }
  for (const [z, y] of [[-7.4, 4.6], [-6.0, 6.3], [-4.6, 4.8], [-3.0, 6.4], [-1.6, 4.5]]) { const d = drawing(S, kinds[i++ % 8], 1.05); d.position.set(-8.78, y, z); d.rotation.y = Math.PI / 2; d.rotation.x = Math.sin(i) * 0.08; }
  // the petal river arriving outside the window + a heap on the outside sill
  let R = null;
  if (riverOut && !flash) { R = petalRiver(S, [[-12, 10, -16], [-7, 8.5, -13], [-3.5, 6.0, -10.6], [-2.5, 4.0, -9.7]], { n: 160, width: 0.7, speed: 0.12, size: 0.28 });
    const heap = petalPile(S, [-2.5, 2.8, -9.75], { rx: 2.6, rz: 0.4, h: 1.0 }); heap.set(1); }
  const fl = new THREE.PointLight(0xffd8b0, 12, 13, 1.6); fl.position.set(-1, 6.6, 0.5); S.add(fl);
  allow(S, ['walt', 'chair*'], ['walt', 'cushion'], ['walt', 'throw'], ['ada', 'vchair*']);
  return { env, update(t) { env.update(t); if (R) R(t + 5, 1); } };
}
const sitWalt = (S, face) => { const w = walt(S, face, [...WALT_AT], 0); sitOn(w, 1.7); return w; };
const sitAda = (S, face, ry = -10) => { const a = ada(S, face, [...ADA_AT], ry); sitOn(a, 1.7); return a; };
// drawing held up between his hands
const holdDrawing = (dr, A, tilt = 0.9) => { const r = pinky(A, 'R'), l = pinky(A, 'L'); dr.position.set((r.x + l.x) / 2, (r.y + l.y) / 2 + 0.55, (r.z + l.z) / 2 + 0.05); dr.rotation.set(-tilt + Math.PI / 2 - Math.PI / 2, A.root.rotation.y, 0); dr.rotateX(-0.5); };
const cards = (S) => { const g = new THREE.Group(); S.add(g); for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.65), std({ color: i === 3 ? 0xffffff : 0xfafafa, side: THREE.DoubleSide, emissive: 0x222222 }));
  c.position.set((i - 1.5) * 0.18, 0.1, i * 0.01); c.rotation.z = (1.5 - i) * 0.2; g.add(c); const mark = new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), std({ color: i % 2 ? 0xd82a2a : 0x1a1a1a })); mark.position.set((i - 1.5) * 0.18, 0.2, i * 0.01 + 0.005); g.add(mark); } return g; };

export const SHOTS_B = [
  // 23 "A pink river of petals, floating to one window."  — low behind Ada on the lawn, the camera follows the ribbon as it pours into the glowing window
  (S, cam) => {
    const env = sunnyPines(S, { time: 'sunset' });
    const a = ada(S, 'awe', [3.5, 0, -8.0], 20);
    const R = petalRiver(S, [[-8, 12, 6], [-2, 10.5, 0], [3.5, 8.6, -6], [7.6, 6.2, -11], [9, 4.8, -13.6]], { n: 280, width: 0.8, speed: 0.1, size: 0.32, glow: 0.1 });
    const sh = shower(S, a, { n: 80, seed: 31, wind: [0.5, -0.8] });
    allowGround(S, 'ada');
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 2.6, 3.4], [1.2, 3.0, 1.4], [3.6, 5.4, -8.0], [7.2, 5.0, -12.4], 26, 28);
      R(t + 6, 1); sh(t, 0.7, { wind: [0.5, -0.8] }); env.update(t);
      a.pose(addPose(idle(t, 0.7), { nod: -26 + 10 * sm(t, 0.5, 2.0), turn: 10 + 22 * sm(t, 0.3, 1.8) })); if (t > dur * 0.6) a.setFace('worried');
    };
  },
  // 24 "Grandpa Walt's window."  — inside: over Grandpa's shoulder (he sits with her drawings), Ada's face appears at the window, petals pouring past her
  (S, cam) => {
    const r = room(S, { riverOut: false }); r.env.sky.position.z = -15; r.env.sky.scale.setScalar(1.8);
    const w = sitWalt(S, 'softsmile'); const dr = drawing(S, 'rocket', 1.1);
    const a = ada(S, 'teary', [-2.0, 0, -11.6], 0); const sh = shower(S, a, { n: 120, seed: 32 });
    box(S, [20, 0.3, 10], [-2.5, -0.15, -15], std({ map: T2.grass() }), { r: 0, cast: false, solid: false, name: 'lawn' });
    fill(S, [-2.0, 5.2, -9.8], 7, 0xffc8a0, 6);
    return (t, dur) => {
      camPath(cam, t / dur, [-6.4, 6.6, -1.6], [-5.6, 6.2, -2.6], [-2.4, 4.8, -11.6], [-2.2, 4.8, -11.6], 30, 34);
      w.pose(addPose(addPose(SEAT, READ), idle(t, 0.4))); holdDrawing(dr, w);
      a.pose(addPose(idle(t, 0.6), hit([[0.2, { nod: -6, lean: 0 }], [0.9, { nod: 6, lean: 6, rFwd: 70, rUp: -10 }]], t)));
      a.root.position.y = hn([[0, -0.8], [0.8, 0]], t); sh(t + 2, 0.6); r.update(t);
    };
  },
  // 25 "Grandpa forgets things now."  — flashback (warm, faded): last spring, Grandpa stares at a photo frame, puzzled; Ada beside him
  (S, cam) => {
    const r = room(S, { time: 'day', flash: true });
    const w = sitWalt(S, 'confused'); const a = ada(S, 'smile', [2.4, 0, -1.6], -40);
    const frame = new THREE.Group(); S.add(frame); const fm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.1), std({ color: 0x6a4a2a })); frame.add(fm);
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), std({ color: 0xe8c8a0 })); ph.position.z = 0.06; frame.add(ph);
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 5.2, 7.0], [-0.6, 5.0, 5.6], [-2.4, 4.2, -4.6], [-2.8, 4.2, -4.8], 28, 32);
      w.pose(addPose(addPose(SEAT, { rFwd: 70, rUp: -18, nod: 18, tilt: 10 * sm(t, 0.6, 1.4) }), idle(t, 0.4))); hold(frame, w, 'R', [0.1, 0.45, 0.05]); frame.rotation.set(-0.3, 0.3, 0);
      a.pose(addPose(idle(t, 0.7), lookAt(a, headOf(w)))); if (t > dur * 0.55) a.setFace('worried'); r.update(t);
    };
  },
  // 26 "Last spring, he called me by Mom's name."  — flashback: he looks up at her, beams, says "Rose?" — her smile drops
  (S, cam) => {
    const r = room(S, { time: 'day', flash: true });
    const w = sitWalt(S, 'smile'); const a = ada(S, 'grin', [2.0, 0, -1.6], -50);
    return (t, dur) => {
      const [i, p] = seg(t, dur, [0.5]);
      if (i === 0) faceCam(cam, p, [-3.6, 4.84, -5.3], 30, { dist: 7.4, lens: 34, side: 0.4, push: 0.8, look: -0.4 });
      else faceCam(cam, p, [2.0, 4.64, -1.6], -80, { dist: 6.8, lens: 36, side: -0.4, push: 0.9, look: -0.3 });
      w.pose(addPose(addPose(SEAT, idle(t, 0.4)), addPose(lookAt(w, headOf(a)), t < dur * 0.5 ? talk(t, 0.6) : {})));
      a.pose(addPose(idle(t, 0.7), lookAt(a, headOf(w)))); a.setFace(t > dur * 0.62 ? 'sad' : 'grin'); r.update(t);
    };
  },
  // 27 "So I stopped visiting. It hurt too much."  — flashback: Ada walks away down the Sunny Pines path, slumped; she glances back once
  (S, cam) => {
    const env = sunnyPines(S, { time: 'day' }); S.userData.look = 'flash';
    const a = ada(S, 'sad', [0, 0, -6], 0); allowGround(S, 'ada');
    return (t, dur) => {
      const z = -6 + t * 1.8; a.root.position.z = z;
      a.pose(addPose(walk(t, 0.7, 18), { nod: 22, lean: 4, turn: t > dur * 0.5 && t < dur * 0.8 ? -40 * Math.sin((t / dur - 0.5) / 0.3 * Math.PI) : 0 }));
      camPath(cam, t / dur, [3, 4.2, 12], [2.6, 4.4, 9 + 1.8 * dur * 0.4], [0, 3.6, -6], [0, 3.8, -6 + 1.8 * dur], 28, 30); cam.lookAt(0, 3.8, z);
      if (t > dur * 0.55) a.setFace('teary'); env.update(t);
    };
  },
  // 28 "But there he was, by the window."  — now: wide from the doorway, sunset streaming in; Grandpa in his chair, petals heaped on the sill outside; Ada steps in
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const dr = drawing(S, 'family', 1.1); const stack = drawingStack(S, [-3.6, 2.85, -3.9], 7, 0.9);
    const a = ada(S, 'teary', [2.8, 0, 5.0], -150); const sh = shower(S, a, { n: 90, seed: 33 });
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 6.4, 10.4], [0.0, 6.0, 9.6], [-1.5, 4, -5], [-2.4, 3.8, -5.3], 24, 26);
      a.root.position.z = 5.0 - 1.8 * sm(t, 0, 1.4); a.root.position.x = 2.8 - 0.6 * sm(t, 0, 1.4); a.pose(addPose(walk(t, 1 - sm(t, 0.6, 1.4), 18), idle(t, 0.6)));
      w.pose(addPose(addPose(SEAT, READ), idle(t, 0.4))); holdDrawing(dr, w); sh(t + 2, 0.6); r.update(t);
    };
  },
  // 29 "Holding my old drawings in his lap."  — close: tilt from the drawing in his hands up to his face, he traces it with a thumb, smiling
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const dr = drawing(S, 'rocket', 1.1); const stack = drawingStack(S, [-3.6, 2.85, -3.9], 7, 0.9);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.4, 4.0, 0.2], [-1.6, 5.0, 0.4], [-3.6, 3.2, -4.0], [-3.6, 4.6, -5.0], 34, 36);
      w.pose(addPose(addPose(SEAT, READ), addPose(idle(t, 0.4), { rFwd: Math.sin(t * 2) * 3, tilt: Math.sin(t * 0.9) * 4 }))); holdDrawing(dr, w); r.update(t);
      if (t > dur * 0.6) w.setFace('delighted');
    };
  },
  // 30 "Every single one of them."  — slow pan across the wall: her drawings pinned everywhere, ending on his chair
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const dr = drawing(S, 'sun', 1.1); drawingStack(S, [-3.6, 2.85, -3.9], 7, 0.9);
    return (t, dur) => {
      camPath(cam, t / dur, [6.0, 6.2, 3.0], [-1.0, 5.6, 3.6], [6.4, 6.0, -9], [-3.6, 4.6, -5.3], 26, 28);
      w.pose(addPose(addPose(SEAT, READ), idle(t, 0.4))); holdDrawing(dr, w); r.update(t);
    };
  },
  // 31 "He didn't remember my name."  — close-up: Ada in the doorway light, eyes welling; slow push
  (S, cam) => {
    const r = room(S);
    const a = ada(S, 'teary', [2.2, 0, 4.0], -140); const sh = shower(S, a, { n: 70, seed: 34 }); const w = sitWalt(S, 'softsmile');
    fill(S, [1.0, 5.4, 1.0], 5, 0xffc8a0, 8);
    return (t, dur) => {
      faceCam(cam, t / dur, [2.2, 4.64, 4.0], -140, { dist: 7.0, lens: 36, side: 0.4, push: 1.4, look: -0.3 });
      a.pose(addPose(addPose(idle(t, 0.5), lookAt(a, headOf(w))), sob(t, 0.25))); sh(t + 3, 0.5); r.update(t);
      w.pose(addPose(addPose(SEAT, READ), idle(t, 0.4)));
    };
  },
  // 32 "But he never stopped missing me."  — close on Grandpa against the sunset window; he presses the drawing to his chest; petals stream past outside
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const dr = drawing(S, 'family', 1.1);
    return (t, dur) => {
      faceCam(cam, t / dur, [-3.6, 4.84, -5.3], 18, { dist: 6.6, lens: 36, side: 0.9, push: 1.0, look: -0.4 });
      const k = sm(t, 0.4, 1.6); w.pose(addPose(addPose(SEAT, { rFwd: 62 + 20 * k, lFwd: 62 + 20 * k, rUp: -26 - 12 * k, lUp: -26 - 12 * k, nod: 18 - 14 * k }), idle(t, 0.4)));
      holdDrawing(dr, w, 0.9 + 0.6 * k); if (k > 0.5) w.setFace('sad'); r.update(t);
    };
  },
  // 33 "I sat down next to him."  — Ada crosses and sits in the wooden chair; he turns, puzzled but friendly
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'neutral'); const dr = drawing(S, 'family', 1.1); const a = ada(S, 'softsmile', [2.4, 0, 1.8], -160); const sh = shower(S, a, { n: 60, seed: 35 });
    return (t, dur) => {
      camPath(cam, t / dur, [-0.4, 5.4, 9.6], [-0.8, 5.2, 8.6], [-0.8, 3.8, -4.6], [-0.9, 3.6, -5.0], 26, 28);
      const k = sm(t, 0, 1.3); a.root.position.set(2.4 + (1.6 - 2.4) * k, 0, 1.8 + (-5.4 - 1.8) * k); a.root.rotation.y = (-160 + 150 * sm(t, 0.9, 1.6)) * D;
      a.pose(addPose(walk(t, 1 - k, 20), SEAT ? (t > 1.4 ? SEAT : {}) : {})); a.root.position.y = t > 1.4 ? -1.5 * sm(t, 1.4, 1.8) + 1.7 * sm(t, 1.4, 1.8) : 0;
      w.pose(addPose(addPose(SEAT, READ), addPose(idle(t, 0.4), lookAt(w, headOf(a))))); holdDrawing(dr, w); sh(t + 3, 0.5);
      if (t > 1.6) w.setFace('confused'); r.update(t);
    };
  },
  // 34 '"Hi, Grandpa. It's me."'  — close-up on Ada (3/4), gentle smile through tears, talking
  (S, cam) => {
    const r = room(S);
    const a = sitAda(S, 'softsmile', -30); const w = sitWalt(S, 'confused'); const sh = shower(S, a, { n: 60, seed: 36, floor: 1.7 });
    return (t, dur) => {
      faceCam(cam, t / dur, [1.6, 4.84, -5.4], -62, { dist: 6.2, lens: 36, side: 0.3, push: 0.7, look: -0.3 });
      a.pose(addPose(addPose(SEAT, idle(t, 0.5)), addPose(lookAt(a, headOf(w)), talk(t, 0.7)))); sh(t + 3, 0.45);
      w.pose(addPose(SEAT, idle(t, 0.4))); r.update(t);
    };
  },
  // 35 '"He smiled. "There you are."'  — close on Grandpa: puzzled... then it lands; a big warm smile, he reaches for her
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'confused'); const a = sitAda(S, 'teary', -30);
    return (t, dur) => {
      faceCam(cam, t / dur, [-3.6, 4.84, -5.3], 45, { dist: 6.6, lens: 36, side: 0.2, push: 0.9, look: -0.3 });
      w.pose(addPose(addPose(SEAT, idle(t, 0.4)), addPose(lookAt(w, headOf(a)), addPose(t > 0.8 ? talk(t, 0.6) : {}, hit([[0.6, POSES.rest], [1.1, { lFwd: 60, lUp: -20 }]], t)))));
      w.setFace(t < 0.6 ? 'confused' : t < 1.0 ? 'awe' : 'softsmile'); a.pose(addPose(SEAT, idle(t, 0.5))); r.update(t);
    };
  },
  // 36 "And my petals stopped falling."  — two-shot: the shower over Ada thins to nothing; the last petal settles on her knee; she looks up
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const a = sitAda(S, 'awe', -30);
    const P = petals(S, { n: 90, size: 0.3, seed: 37 }); const last = onePetal(S, 0.34);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.0, 7.2, 10.4], [-1.0, 6.8, 9.2], [-1.0, 4.3, -5.3], [-1.0, 4.4, -5.3], 24, 26);
      const k = 1 - sm(t, 0.1, dur * 0.65); P(t + 2, headOf(a), { k, r: 1.4, top: 3.0, floor: 1.7 });
      const u = ramp(t, 0.6, dur - 0.2); last.position.set(1.8 + Math.sin(t * 2.5) * 0.4 * (1 - u), 7.6 - 4.2 * u, -3.8 + Math.cos(t * 2) * 0.3 * (1 - u)); last.rotation.set(Math.sin(t * 3) * (1 - u) + (u > 0.98 ? -Math.PI / 2 : 0.4), t, 0);
      a.pose(addPose(addPose(SEAT, idle(t, 0.5)), { nod: -20 * sm(t, 0.4, 1.4), turn: 6 })); w.pose(addPose(addPose(SEAT, idle(t, 0.4)), lookAt(w, headOf(a)))); r.update(t);
    };
  },
  // 37 "Then one landed on him."  — close: a single petal spirals down and lands on Grandpa's hand; he lifts it, amazed
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const a = sitAda(S, 'awe', -30); const pt = onePetal(S, 0.38);
    return (t, dur) => {
      faceCam(cam, t / dur, [-3.6, 4.4, -5.3], 20, { dist: 6.4, lens: 34, side: 0.4, push: 0.8, look: -0.9 });
      w.pose(addPose(addPose(SEAT, idle(t, 0.4)), hit([[0.2, { rFwd: 50, rUp: -10, nod: -10 }], [0.6, { rFwd: 55, rUp: -10, nod: -14 }], [1.6, { rFwd: 55, rUp: -10, nod: 20 }], [2.1, { rFwd: 90, rUp: -14, nod: 10 }]], t)));
      const hp = pinky(w, 'R'); const u = sm(t, 0, 1.5);
      if (t < 1.5) { pt.position.set(hp.x + Math.sin(t * 4) * 0.6 * (1 - u), hp.y + 0.15 + 3.5 * (1 - u), hp.z + Math.cos(t * 4) * 0.4 * (1 - u)); pt.rotation.set(Math.sin(t * 5) * (1 - u), t * 2, 0); }
      else { pt.position.set(hp.x, hp.y + 0.15, hp.z); pt.rotation.set(-Math.PI / 2, 0, 0.4); }
      w.setFace(t > 1.5 ? 'awe' : 'softsmile'); a.pose(addPose(SEAT, addPose(idle(t, 0.5), lookAt(a, headOf(w))))); r.update(t);
    };
  },
  // 38 "Because I missed him too."  — two-shot at sunset: she reaches over and takes his hand; a gentle petal trickle now falls on him; both smile
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const a = sitAda(S, 'teary', -30); const sh = shower(S, w, { n: 40, seed: 38, floor: 1.7, speed: 0.6 });
    allow(S, ['walt', 'ada']);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.0, 7.0, 10.0], [-1.0, 6.4, 7.6], [-1.0, 4.3, -5.3], [-1.0, 4.5, -5.3], 24, 28);
      const k = sm(t, 0.3, 1.3);
      a.pose(addPose(addPose(SEAT, idle(t, 0.5)), { lFwd: 55 * k, lUp: -40 * k, turn: 20 })); w.pose(addPose(addPose(SEAT, idle(t, 0.4)), { rFwd: 55 * k, rUp: -40 * k, turn: -16 }));
      a.root.rotation.y = (-30 + 10 * k) * D; sh(t + 3, 0.8);
      if (t > dur * 0.5) a.setFace('softsmile'); r.update(t);
    };
  },
  // 39 "Now I visit every Sunday."  — sunny Sunday: Ada skips up the path waving a drawing; Grandpa waves from the front door
  (S, cam) => {
    const env = sunnyPines(S, { time: 'day' });
    const a = ada(S, 'grin', [-1.4, 0, 6], 180); const w = walt(S, 'delighted', [0, 0, -10.6], 0); const dr = drawing(S, 'rocket', 1.0);
    allowGround(S, 'ada', 'walt'); allow(S, ['walt', 'porch']);
    return (t, dur) => {
      const z = 6 - t * 2.6; a.root.position.z = z; a.pose(addPose(walk(t, 1.2, 30), { rUp: 140, rFwd: 10, bob: Math.abs(Math.sin(t * 6)) * 0.2 }));
      hold(dr, a, 'R', [0, 0.6, 0]); dr.rotation.set(0, Math.PI, Math.sin(t * 6) * 0.2);
      w.pose(addPose(idle(t, 0.7), hit([[0.3, POSES.rest], [0.7, POSES.wave], [1.0, { ...POSES.wave, rUp: 150 }], [1.3, POSES.wave], [1.6, { ...POSES.wave, rUp: 150 }]], t)));
      camPath(cam, t / dur, [6, 5.0, 16], [4.5, 4.8, 12.5], [0, 4, -2], [0, 4.4, -8], 26, 28); env.update(t);
    };
  },
  // 40 "We draw rockets, and he always wins at cards."  — a: they hold up their rocket drawings to each other, laughing · b: he fans his winning cards; she pouts, then laughs
  (S, cam) => {
    const r = room(S, { time: 'day', riverOut: false });
    const w = sitWalt(S, 'laugh'); const a = sitAda(S, 'grin', -30); const d1 = drawing(S, 'rocket', 1.0), d2 = drawing(S, 'rocket', 1.0); const c = cards(S); const c2 = cards(S);
    allow(S, ['walt', 'ada']);
    return (t, dur) => {
      const [i, p] = seg(t, dur, [0.5]);
      if (i === 0) { camPath(cam, p, [-1.0, 7.0, 10.0], [-1.0, 6.8, 9.0], [-1.0, 4.3, -5.3], [-1.0, 4.4, -5.3], 24, 26);
        w.pose(addPose(addPose(SEAT, idle(t, 0.4)), { rFwd: 100, rUp: -10, turn: -18 })); a.pose(addPose(addPose(SEAT, idle(t, 0.5)), { lFwd: 100, lUp: -10, turn: 18 }));
        hold(d1, w, 'R', [0, 0.6, 0]); d1.rotation.set(0, 0.5, 0); hold(d2, a, 'L', [0, 0.6, 0]); d2.rotation.set(0, -0.3, 0); c.visible = c2.visible = false; w.setFace('laugh'); a.setFace('laugh');
      } else { const u = t - dur * 0.5; d1.visible = d2.visible = false; c.visible = c2.visible = true;
        camPath(cam, p, [2.5, 5.6, 7.5], [2.0, 5.4, 6.5], [-1.4, 4.0, -5.3], [-1.4, 4.1, -5.3], 28, 30);
        w.pose(addPose(addPose(SEAT, idle(t, 0.4)), hit([[0, { rFwd: 60, rUp: -20 }], [0.35, { rFwd: 110, rUp: 0, nod: -6 }]], u))); hold(c, w, 'R', [0, 0.35, 0.1]); c.rotation.set(0, 0, 0);
        a.pose(addPose(SEAT, addPose(idle(t, 0.5), { lFwd: 60, lUp: -20 }))); hold(c2, a, 'L', [0, 0.35, 0.1]); c2.rotation.set(0, Math.PI, 0);
        w.setFace(u > 0.3 ? 'laugh' : 'mischief'); a.setFace(u > 0.3 && u < 1.0 ? 'pout' : u >= 1.0 ? 'laugh' : 'thinking'); }
      r.update(t);
    };
  },
  // 41 "Mister Bell brings Biscuit to work now."  — the crosswalk: Bell with his STOP sign, Biscuit in a tiny orange vest sitting proudly beside him; a kid crosses
  (S, cam) => {
    dayLight(S, { sunPos: [-9, 15, 12], area: 26 }); street(S); crosswalkB(S);
    const B = bell(S, 'delighted', [-1.5, 0, -7.5], 10); const sign = stopSign(S);
    const d = pup(S, { name: 'biscuit', col: 0xe8d0a0, spot: 0xfff6e8 }); d.root.position.set(1.8, 0, -7.2); d.root.rotation.y = -20 * D;
    const v = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.75, 1.3), std({ color: 0xff7a1a, roughness: 0.6 })); d.root.children[0].add(v); v.position.set(0, 0.1, 0.05);
    const k = mk(S, TOWN[0], 'kid', 'smile', [-9, 0, -11.5], 90);
    allow(S, ['bell', 'stopsign'], ['biscuit', 'box 120*']);
    return (t, dur) => {
      camPath(cam, t / dur, [-3.5, 3.6, 8.5], [-2.5, 3.8, 6.5], [0, 3.0, -7.4], [0, 3.4, -7.4], 28, 30);
      B.pose(addPose(addPose(idle(t, 0.7), { rFwd: 70, rUp: 12 }), hit([[0.4, { nod: 0 }], [0.9, { nod: 14, turn: -30 }], [1.6, { nod: 0, turn: 0 }]], t))); hold(sign, B, 'R', [0, -0.75, 0.1]);
      d.update(t, 'sit'); d.head.rotation.y = Math.sin(t * 2) * 0.2;
      k.root.position.x = -9 + t * 3.6; k.pose(walk(t, 1, 28));
    };
  },
  // 42 "They're both petal-free."  — closer: Bell bends to scratch Biscuit's head, laughing; the dog barks happily; not a single petal
  (S, cam) => {
    dayLight(S, { sunPos: [-9, 15, 12], area: 26 }); street(S); crosswalkB(S);
    const B = bell(S, 'laugh', [-1.5, 0, -7.5], 30);
    const d = pup(S, { name: 'biscuit', col: 0xe8d0a0, spot: 0xfff6e8 }); d.root.position.set(1.4, 0, -6.6); d.root.rotation.y = -40 * D;
    const v = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.75, 1.3), std({ color: 0xff7a1a, roughness: 0.6 })); d.root.children[0].add(v); v.position.set(0, 0.1, 0.05);
    allow(S, ['bell', 'biscuit'], ['biscuit', 'box 120*']);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.5, 3.6, 4.5], [-1.2, 3.8, 3.2], [-0.2, 3.0, -7.0], [-0.4, 3.4, -7.2], 30, 34);
      B.pose(addPose(idle(t, 0.7), hit([[0.1, POSES.rest], [0.6, { rFwd: 70, rUp: -6, lean: 10, nod: 6 }]], t)));
      const scratch = t > 0.6 ? Math.sin(t * 14) * 6 : 0; B.armR.rotation.z += scratch * D;
      d.update(t, t > 1.0 ? 'bark' : 'sit');
    };
  },
  // 43 "Grandpa still forgets my name sometimes."  — sunset in his room: he squints at her, searching; she just smiles and squeezes his hand
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'thinking'); const a = sitAda(S, 'softsmile', -30); allow(S, ['walt', 'ada']);
    return (t, dur) => {
      camPath(cam, t / dur, [-6.0, 5.6, 5.0], [-5.0, 5.4, 4.0], [-0.6, 4.4, -5.4], [-0.4, 4.5, -5.4], 28, 32);
      w.pose(addPose(addPose(SEAT, idle(t, 0.4)), addPose(lookAt(w, headOf(a)), { tilt: 8 * Math.sin(t * 1.2), rFwd: 40, rUp: -30 })));
      a.pose(addPose(addPose(SEAT, idle(t, 0.5)), addPose(lookAt(a, headOf(w)), { lFwd: 45, lUp: -36 }))); w.setFace(t > dur * 0.6 ? 'softsmile' : 'thinking'); r.update(t);
    };
  },
  // 44 "But he never forgets to miss me."  — final: slow pull back from the two of them at the glowing window, hands held, her drawings all around
  (S, cam) => {
    const r = room(S);
    const w = sitWalt(S, 'softsmile'); const a = sitAda(S, 'softsmile', -20); allow(S, ['walt', 'ada']); drawingStack(S, [-0.9, 2.7, -7.9], 4, 0.8);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.0, 5.0, 5.0], [-0.8, 6.2, 10.6], [-1.0, 4.2, -5.4], [-1.0, 4.4, -6.0], 30, 24);
      w.pose(addPose(addPose(SEAT, idle(t, 0.4)), { rFwd: 45, rUp: -36, turn: -14 })); a.pose(addPose(addPose(SEAT, idle(t, 0.5)), { lFwd: 45, lUp: -36, turn: 16, tilt: -6 }));
      r.update(t);
    };
  },
];
function crosswalkB(S) { const w = std({ color: 0xf6f4ee, roughness: 0.6 }); for (let i = 0; i < 7; i++) box(S, [1.2, 0.03, 12], [-4.2 + i * 1.4, -0.08, -11], w, { r: 0, cast: false, solid: false }); }
