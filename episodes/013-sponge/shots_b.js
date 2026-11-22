import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, backOut,
  fairGym, schoolFront, potatoClock, robotMop, foamPuffs, foamCarpet, rosette } from '../../engine/kit.js';
import { benji, dex, priya, gus, judge, kid, buddy, foam, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, arc } from './common.js';

const GIANT = [0, 0, -36], GS = 5.2;              // the giant foam monster behind the school
const POOL = [0.5, 0, -9];                         // foam pile in front of the school where the sponge dives in
const BIG = [1, 0, -6.5];                          // where the bus-sized sponge stands
const HIPS = POSES.hips;
const giant = (S, s = GS) => { const m = foam(S, s); m.root.position.set(...GIANT); return m; };
const outside = (S, foamK = 1) => { const env = schoolFront(S); const c = foamCarpet(S, [0, 0.05, -12], [34, 12], { n: 150, size: 1.2, seed: 4 }); c.set(foamK); env.carpet = c; return env; };

// foam bubbles streaming from a ring around `to` into it (a slurp)
function stream(S, n = 24) { const mat = new THREE.MeshStandardMaterial({ color: 0xf6f9ff, roughness: 0.32, emissive: 0x8fa4c4, emissiveIntensity: 0.12 }); const g = new THREE.IcosahedronGeometry(1, 2);
  const P = Array.from({ length: n }, (_, i) => { const m = new THREE.Mesh(g, mat); S.add(m); return { m, a: i * 2.4, off: (i * 0.37) % 1 }; });
  return (t, to, r = 3, size = 0.4) => P.forEach(p => { const u = (t * 1.4 + p.off) % 1; const k = 1 - u; p.m.position.set(to.x + Math.cos(p.a) * r * k, to.y * (1 - k * 0.6) + Math.sin(u * Math.PI) * 0.4, to.z + Math.sin(p.a) * r * k * 0.7 + k * 0.4);
    p.m.scale.setScalar(Math.max(0.0001, size * (0.4 + k * 0.8))); }); }

export const SHOTS_B = [
  // 22 "The Mega Volcano."  — low-angle hero shot: the volcano, awake, glares down; foam bubbles at the crater
  (S, cam) => {
    const env = fairGym(S); const P = foamPuffs(S, 14, 3);
    return (t, dur) => { env.update(t); env.volcano.wake(1); env.volcano.burp(0.1 + Math.sin(t * 4) * 0.05); P(t, env.volcano.crater, 1, { up: 1.2, spread: 0.6, size: 0.35 });
      camPath(cam, t / dur, [0.6, 1.4, -1.2], [0.3, 1.6, -2.4], [0, 5.4, -8.3], [0, 5.9, -8.3], 24, 26);
    };
  },
  // 23 "It burped foam. Then more foam."  — two huge burps: foam erupts and splats; foam spreads across the floor; the kids back away
  (S, cam) => {
    const env = fairGym(S); const P = foamPuffs(S, 40, 7);
    const B = benji(S, 'shock', [5.0, 0, 2.0], -20), P2 = priya(S, 'shock', [-4.6, 0, 2.4], 25), X = dex(S, 'confused', [3.6, 0, -4.4], -30);
    return (t, dur) => { env.update(t); env.volcano.wake(1);
      const b1 = Math.max(0, Math.sin(ramp(t, 0.15, 0.65) * Math.PI)), b2 = Math.max(0, Math.sin(ramp(t, dur * 0.55, dur * 0.95) * Math.PI)); env.volcano.burp(Math.max(b1, b2 * 1.2));
      P(t, env.volcano.crater, Math.max(b1, b2), { up: 4 + b2 * 2, spread: 4, size: 0.9 }); env.foam.set(0.12 + sm(t, 0.3, dur) * 0.3);
      B.pose(addPose(idle(t, 1), { lean: -8, rFwd: 40, lFwd: 40, ...lookAt(B, [0, 6, -8]) })); B.root.position.z = 2.0 + sm(t, 0.3, dur) * 1.2;
      P2.pose(addPose(idle(t, 1, 2), { lean: -8, rUp: 60, lUp: 60, ...lookAt(P2, [0, 6, -8]) })); P2.root.position.z = 2.4 + sm(t, 0.5, dur) * 1.0;
      X.pose(addPose(idle(t, 1, 3), { rFwd: 50, lFwd: 50, lean: -10 })); X.root.position.z = -4.4 + sm(t, 0.2, 1.0) * 0.4; if (b2 > 0.3) X.setFace('shock');
      camPath(cam, t / dur, [0.4, 6.0, 12], [0.4, 6.4, 13], [0, 4.4, -5.5], [0, 4.8, -6.0], 24, 23); shake(cam, t, 0.35, 0.4); shake(cam, t, dur * 0.72, 0.6);
    };
  },
  // 24 "Then the foam grew eyes."  — the foam on the floor heaves up into a bubbly blob — and two big eyes pop open
  (S, cam) => {
    const env = fairGym(S); env.foam.set(0.42); const F = foam(S, 0.8); F.root.position.set(0, 0, -3.0);
    const B = benji(S, 'shock', [5.0, 0, 3.2], -30), P = priya(S, 'scared', [-4.6, 0, 3.4], 30);
    return (t, dur) => { env.update(t); env.volcano.wake(1);
      const r = sm(t, 0.0, dur * 0.55); F.rise(0.15 + r * 0.85); F.eyesOn(backOut(ramp(t, dur * 0.55, dur * 0.8))); F.look(cam.position); F.update(t, 'idle');
      B.pose(addPose(idle(t, 1), { lean: -10, rFwd: 55, lFwd: 45, ...lookAt(B, F.head.getWorldPosition(new THREE.Vector3())) })); P.pose(addPose(idle(t, 1, 2), { rFwd: 125, lFwd: 125, rUp: -30, lUp: -30, nod: -6 }));
      camPath(cam, t / dur, [0.8, 2.4, 10.5], [0.6, 2.6, 9.4], [0, 3.0, -3], [0, 4.0, -3], 26, 28);
    };
  },
  // 25 "It gobbled up the mop and the potato clock."  — the foam monster lunges: CHOMP — the robot mop, then the potato clock, slurped in
  (S, cam) => {
    const env = fairGym(S); env.foam.set(0.5); const F = foam(S, 1.0); F.root.position.set(0, 0, -3.6);
    const m = robotMop(S, 1.0), pc = potatoClock(S, 1.0); const G = gus(S, 'shock', [-6.6, 0, 3.0], 35), P = priya(S, 'shock', [5.4, 0, 3.4], -35);
    return (t, dur) => { env.update(t); env.volcano.wake(1);
      const a = sm(t, 0.15, dur * 0.42), b = sm(t, dur * 0.48, dur * 0.85);
      m.position.copy(V([-1.6, 0, 1.6]).lerp(V([0, 3.2, -1.6]), a)); m.scale.setScalar(Math.max(0.0001, 1 - a * a)); m.rotation.z = a * 2; m.update(t, 'mop');
      pc.position.copy(V([1.8, 0, 2.0]).lerp(V([0, 3.4, -1.6]), b)); pc.scale.setScalar(Math.max(0.0001, 1 - b * b)); pc.rotation.z = -b * 3; pc.update(t, 'walk');
      F.update(t, 'chomp', 1); F.look(t < dur * 0.45 ? m.position : pc.position);
      G.pose(addPose(idle(t, 1), { rFwd: 90, lFwd: 70, lean: -6, ...lookAt(G, m.position) })); P.pose(addPose(idle(t, 1, 2), { rUp: 140, lUp: 140, ...lookAt(P, pc.position) }));
      camPath(cam, t / dur, [0.6, 5.0, 12.5], [0.4, 4.6, 11.0], [0, 3.8, -2], [0, 3.6, -1.6], 24, 25);
    };
  },
  // 26 "Everybody ran outside!"  — out of the school doors and across the lawn, everyone sprinting at the camera; foam bubbling out behind them
  (S, cam) => {
    const env = outside(S, 0.25); const P = foamPuffs(S, 26, 2);
    const who = [[benji, 'scared', 0, 0], [dex, 'shock', 5.4, 0.6], [priya, 'scared', -4.6, 1.0], [gus, 'shock', 10.2, 1.8], [judge, 'scared', -8.9, 2.2]].map(([f, face, x, d]) => [f(S, face, [x, 0, -14], 0), x, d]);
    return (t, dur) => { env.update(t); P(t, V([0, 1.0, -17]), 1, { up: 2.5, spread: 3, size: 1.0 });
      who.forEach(([A, x, d], i) => { A.root.position.set(x, 0, -12.5 + d * 0.4 + t * 9.0); A.pose(addPose(RUN(t + i * 0.13, 1), { nod: -6 })); });
      camPath(cam, t / dur, [0, 4.4, 20], [0, 4.0, 16], [0, 4.0, -8], [0, 4.0, -4], 26, 26);
    };
  },
  // 27 "The foam squeezed out of every window."  — the school's whole front wall: foam pushes out of all sixteen windows and spills down
  (S, cam) => {
    const env = outside(S, 0.5); const ps = env.windows.map((w, i) => [foamPuffs(S, 7, i + 1), w]);
    return (t, dur) => { env.update(t); env.carpet.set(0.5 + sm(t, 0, dur) * 0.4);
      ps.forEach(([P, w], i) => P(t + i * 0.2, w, sm(t, (i % 8) * 0.06, 0.4 + (i % 8) * 0.06), { up: 1.0, spread: 1.6, size: 1.1, fall: 1.4 }));
      camPath(cam, t / dur, [-6, 5, 22], [5, 6, 20], [0, 6.5, -20], [2, 7.5, -20], 22, 22);
    };
  },
  // 28 "It grew taller than the school."  — low angle: the giant foam monster rises up behind the roof, far taller than the building
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S);
    const B = benji(S, 'shock', [-2.6, 0, 3.0], 180), X = dex(S, 'scared', [2.4, 0, 3.4], 175);
    return (t, dur) => { env.update(t); const r = sm(t, 0, dur * 0.85); F.rise(0.25 + r * 0.75); F.root.position.y = -8 + r * 8; F.update(t, t > dur * 0.8 ? 'roar' : 'idle', 1); F.look(cam.position);
      B.pose(addPose(idle(t, 1), { nod: -30, lean: -6, rFwd: 30 })); X.pose(addPose(idle(t, 1, 2), { nod: -30, lean: -8, rUp: 30, lUp: 30 }));
      camPath(cam, t / dur, [1.0, 1.6, 19.5], [1.0, 1.4, 18.5], [0, 8, -16], [0, 19, -26], 20, 20); shake(cam, t, dur * 0.8, 0.5);
    };
  },
  // 29 '"Somebody stop it!" Dex yelled.'  — Dex close-up, yelling with both arms up, the foam giant towering out of focus behind
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S);
    const X = dex(S, 'scared', [2.0, 0, 4.0], 12);
    return (t, dur) => { env.update(t); F.update(t, 'roar', 0.6); F.look(headOf(X));
      X.pose(addPose(addPose(idle(t, 1.2), talk(t, 1.6)), hit([[0, { rUp: 40, lUp: 40 }], [0.3, { rUp: 150, lUp: 150, lean: 4 }], [dur, { rUp: 145, lUp: 155, lean: 6 }]], t)));
      const h = headOf(X).toArray(); faceCam(cam, t / dur, [h[0], h[1] + 0.8, h[2]], 12, { dist: 9.0, lens: 28, side: -0.6, push: 1.2, up: -1.2, look: 0.6 });
    };
  },
  // 30 "But nobody's project was big enough."  — (hook source) the giant roars over the school; everyone tiny on the lawn
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S);
    const J = judge(S, 'scared', [-5.0, 0, 3.0], 190), G = gus(S, 'worried', [5.2, 0, 3.6], 170), P = priya(S, 'worried', [0.2, 0, 2.0], 180);
    return (t, dur) => { env.update(t); const r = sm(t, 0.2, 0.7) * (1 - sm(t, dur - 0.3, dur)); F.update(t, 'roar', r); F.look(cam.position);
      J.pose(addPose(idle(t, 1), { rUp: 60, nod: -25 })); G.pose(addPose(idle(t, 1, 2), { ...HIPS, nod: -25 })); P.pose(addPose(idle(t, 1, 3), { rFwd: 40, lFwd: 40, nod: -28, bob: -0.1 * r }));
      camPath(cam, t / dur, [1.5, 2.2, 24], [1.0, 2.0, 22.8], [0, 15.5, -26], [0, 17, -27], 20, 20); shake(cam, t, 0.25, 0.6);
    };
  },
  // 31 "Then something tugged my shoelace."  — low on the grass: the little sponge tugs at Benji's boot
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S); const B = benji(S, 'worried', [0.6, 0, 6.0], 10); const sp = buddy(S, 0.55);
    sp.root.position.set(2.0, 0, 6.6); sp.root.rotation.y = -80 * D;
    return (t, dur) => { env.update(t); F.update(t, 'idle'); sp.update(t, 'tug', 1); sp.look(V([0.9, 0.3, 6.2]));
      B.pose(addPose(idle(t, 0.8), t > dur * 0.6 ? { nod: 35, turn: 20 } : { nod: -12 })); if (t > dur * 0.6) B.setFace('confused');
      camPath(cam, t / dur, [6.0, 1.3, 12.5], [5.4, 1.2, 11.8], [1.4, 1.2, 6.4], [1.4, 1.4, 6.4], 30, 31);
    };
  },
  // 32 "My little sponge."  — Benji's POV, looking down: the sponge looks up at him and gives a tiny wave
  (S, cam) => {
    const env = outside(S, 0.95); const sp = buddy(S, 0.55); sp.root.position.set(1.4, 0, 7.2); sp.root.rotation.y = 15 * D;
    return (t, dur) => { env.update(t); sp.look(cam.position); sp.face('grin'); sp.update(t, t > dur * 0.35 ? 'wave' : 'idle', 1);
      camPath(cam, t / dur, [1.1, 5.4, 10.6], [1.2, 4.7, 9.9], [1.4, 0.7, 7.2], [1.4, 0.8, 7.2], 34, 38);
    };
  },
  // 33 "It looked at the foam. Then at me."  — the sponge in the grass turns from the towering foam to Benji
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S); const sp = buddy(S, 0.55); sp.root.position.set(1.4, 0, 7.2); const B = benji(S, 'worried', [-1.8, 0, 6.0], 40);
    return (t, dur) => { env.update(t); F.update(t, 'idle'); const k = sm(t, dur * 0.45, dur * 0.65);
      sp.root.rotation.y = (170 - k * 230) * D; sp.look(k < 0.5 ? V([0, 22, -30]) : headOf(B)); sp.face(k > 0.5 ? 'smile' : 'o'); sp.update(t, 'idle');
      B.pose(addPose(idle(t, 0.7), lookAt(B, sp.root.position)));
      camPath(cam, t / dur, [3.2, 0.8, 13.8], [3.0, 0.8, 13.2], [1.2, 4.0, 4], [1.2, 4.2, 4], 20, 20);
    };
  },
  // 34 '"Go get it, buddy," I whispered.'  — Benji close-up, whispering down to the sponge; a small determined nod
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S); const B = benji(S, 'whisper', [-1.8, 0, 6.0], 25);
    return (t, dur) => { env.update(t); F.update(t, 'idle');
      B.pose(addPose(addPose(idle(t, 0.5), talk(t, 0.6)), { nod: 22 + (t > dur * 0.65 ? Math.sin((t - dur * 0.65) * 10) * 6 * (1 - ramp(t, dur * 0.65, dur)) : 0), turn: 15, rFwd: 20 }));
      if (t > dur * 0.65) B.setFace('determined');
      const h = headOf(B).toArray(); faceCam(cam, t / dur, h, 25, { dist: 7.4, lens: 34, side: 0.6, push: 0.8, up: -0.3, look: 0.35 });
    };
  },
  // 35 "It hopped straight into the foam."  — the sponge bounds across the lawn in big hops and dives into the foam pile
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S); const sp = buddy(S, 0.55); const P = foamPuffs(S, 18, 9);
    return (t, dur) => { env.update(t); F.update(t, 'idle'); const u = sm(t, 0, dur * 0.85); const hop = (u * 3) % 1;
      const p = new THREE.Vector3(1.4 + (POOL[0] - 1.4) * u, Math.sin(hop * Math.PI) * 1.6 * (u < 1 ? 1 : 0), 7.2 + (POOL[2] - 7.2) * u);
      sp.root.position.copy(p); sp.root.rotation.y = Math.PI; sp.update(t * 1.0, u < 0.98 ? 'hop' : 'idle', 1); sp.root.visible = u < 0.97;
      P(t, V([POOL[0], 0.4, POOL[2]]), ramp(t, dur * 0.82, dur * 0.85) * (1 - ramp(t, dur * 0.97, dur)), { up: 3, spread: 2.2, size: 0.9 });
      camPath(cam, t / dur, [4.5, 3.2, 13], [3.0, 4.0, 6], [1.4, 1.0, 6], [POOL[0], 1.5, POOL[2]], 26, 24);
    };
  },
  // 36 "And it drank. And drank. And drank!"  — in the foam pile the sponge gulps, foam streaming into its mouth; it swells bigger with each gulp
  (S, cam) => {
    const env = outside(S, 0.95); const F = giant(S); const sp = buddy(S, 0.6); sp.root.position.set(POOL[0], 1.0, POOL[2]); const ST = stream(S, 26);
    return (t, dur) => { env.update(t); F.update(t, 'idle'); const [k, u] = seg(t, dur, [0.5]); const g = sm(t, 0, dur);
      sp.root.scale.setScalar(0.6 + g * 1.3 + Math.sin(t * 9) * 0.04); sp.update(t, 'drink', 1); sp.look(cam.position);
      const s = sp.root.scale.x; const mouth = V([POOL[0], 1.0 + 0.7 * s, POOL[2] + 0.5 * s]);
      ST(t, mouth, 2.5 + s * 1.5, 0.35 + s * 0.1); env.carpet.set(0.95 - g * 0.3);
      if (k === 0) camPath(cam, u, [2.4, 6.6, -2.6], [2.0, 6.2, -3.4], [POOL[0], 1.2, POOL[2]], [POOL[0], 1.5, POOL[2]], 28, 30);
      else camPath(cam, u, [-5, 3.5, 3], [-5.5, 4, 2], [POOL[0], 2.0, POOL[2]], [POOL[0], 2.6, POOL[2]], 26, 26);
    };
  },
  // 37 "The monster shrank. My sponge grew."  — wide: the foam giant deflates behind the school while the sponge balloons up in front of it
  (S, cam) => {
    const env = outside(S, 0.6); const F = giant(S); const sp = buddy(S, 1.9); sp.root.position.set(...POOL); const P = foamPuffs(S, 30, 6);
    return (t, dur) => { env.update(t); const g = sm(t, 0, dur);
      F.root.scale.setScalar(GS * (1 - g * 0.6)); F.update(t, 'roar', 0.4 * (1 - g)); sp.root.scale.setScalar(1.9 + g * 2.8); sp.update(t, 'drink', 1); sp.look(cam.position);
      env.carpet.set(0.6 - g * 0.4); P(t, V([0, 9 * (1 - g * 0.5), -22]), 1, { up: 2, spread: 4, size: 1.6, fall: 1.0 });
      camPath(cam, t / dur, [0, 5, 28], [0, 6, 26], [0, 9, -14], [0, 9.5, -14], 22, 22);
    };
  },
  // 38 "Soon the foam was gone."  — the last little puff of foam slurps into the giant sponge; clean lawn, clean windows; jaws drop
  (S, cam) => {
    const env = outside(S, 0.2); const F = giant(S, 1.6); F.root.position.set(0, 0, -16.5); const sp = buddy(S, 4.7); sp.root.position.set(...POOL);
    const J = judge(S, 'awe', [-4.6, 0, 4.0], 170), P = priya(S, 'awe', [3.6, 0, 4.4], 190);
    return (t, dur) => { env.update(t); const g = sm(t, 0.1, dur * 0.7);
      F.root.scale.setScalar(Math.max(0.0001, 1.8 * (1 - g))); F.root.position.lerpVectors(V([0, 0, -16.5]), V([POOL[0], 3, POOL[2] + 1]), g); F.update(t, 'idle'); env.carpet.set(0.2 * (1 - g));
      sp.root.scale.setScalar(4.7 + g * 1.5); sp.update(t, g < 0.9 ? 'drink' : 'idle', 1); sp.look(cam.position); if (g >= 0.9) sp.face('grin');
      J.pose(addPose(idle(t, 0.8), { nod: -18, rFwd: 40 })); P.pose(addPose(idle(t, 0.8, 2), { nod: -18, rFwd: 120, lFwd: 120, rUp: -30, lUp: -30 }));
      camPath(cam, t / dur, [1, 4.5, 20], [1, 5.0, 18.5], [0.5, 6, -8], [0.5, 7, -8], 22, 23);
    };
  },
  // 39 "My sponge was as big as a bus."  — low angle: the bus-sized sponge beams and waves; Benji tiny in front, arms up
  (S, cam) => {
    const env = outside(S, 0); const sp = buddy(S, 6.2); sp.root.position.set(...BIG); const B = benji(S, 'delighted', [-3.4, 0, 5.4], 160);
    return (t, dur) => { env.update(t); sp.face('grin'); sp.update(t, 'wave', 1); sp.look(headOf(B));
      B.pose(addPose(idle(t, 1), hit([[0, { rUp: 40, lUp: 40 }], [0.35, { rUp: 150, lUp: 150, nod: -25 }], [dur, { rUp: 140, lUp: 155, nod: -28 }]], t)));
      camPath(cam, t / dur, [7.0, 1.2, 19.5], [6.2, 1.3, 18.0], [1.5, 7, -4], [1.5, 7.6, -4], 20, 20);
    };
  },
  // 40 "Out popped the potato clock and the robot mop."  — the giant sponge gives a squeeze: POP, POP — out fly the potato clock and the mop, safe and sound
  (S, cam) => {
    const env = outside(S, 0); const sp = buddy(S, 6.2); sp.root.position.set(...BIG); const m = robotMop(S, 1.0), pc = potatoClock(S, 1.2);
    const G = gus(S, 'shock', [7.4, 0, 4.4], -30), P = priya(S, 'shock', [-5.6, 0, 4.0], 30);
    return (t, dur) => { env.update(t); const q = Math.max(0, Math.sin(ramp(t, 0.1, dur * 0.6) * Math.PI)); sp.update(t, 'squeeze', q); sp.look(cam.position);
      const mouth = V([BIG[0], 0.7 * 6.2 + 0.4 * 6.2, BIG[2] + 3]);
      const a = ramp(t, dur * 0.3, dur * 0.65), b = ramp(t, dur * 0.42, dur * 0.8);
      m.position.copy(arc(mouth.toArray(), [5.0, 0, 3.6], a, 4)); m.visible = a > 0; m.rotation.z = (1 - a) * 4; m.update(t, a >= 1 ? 'roll' : 'idle');
      pc.position.copy(arc(mouth.toArray(), [-3.2, 0, 3.4], b, 5)); pc.visible = b > 0; pc.rotation.z = -(1 - b) * 5; pc.update(t, b >= 1 ? 'hop' : 'idle');
      if (a >= 1) G.setFace('delighted'); if (b >= 1) P.setFace('delighted');
      G.pose(addPose(idle(t, 1), a >= 1 ? hit([[dur * 0.65, { rFwd: 40 }], [dur * 0.8, { rUp: 140, lUp: 140 }]], t) : { rFwd: 40, lFwd: 40 }));
      P.pose(addPose(idle(t, 1, 2), b >= 1 ? hit([[dur * 0.8, { rFwd: 40 }], [dur * 0.92, { rFwd: 80, lFwd: 80, rUp: -20, lUp: -20, nod: 20 }]], t) : { rFwd: 40, lFwd: 40 }));
      camPath(cam, t / dur, [0.5, 5.5, 23], [0.5, 5.2, 21.5], [0.5, 5.5, -1], [0.5, 5.2, -1], 24, 24);
    };
  },
  // 41 "The judge gave first prize to my sponge."  — the judge holds up a giant blue ribbon; the sponge bends down to receive it; Benji beams
  (S, cam) => {
    const env = outside(S, 0); const sp = buddy(S, 6.2); sp.root.position.set(...BIG); const ro = rosette(S, 0x2a6ae8); ro.scale.setScalar(2.4);
    const J = judge(S, 'grin', [-2.6, 0, 3.4], 160), B = benji(S, 'proud', [5.6, 0, 1.6], 230);
    return (t, dur) => { env.update(t); const k = sm(t, 0.2, dur * 0.55); sp.update(t, 'idle'); sp.body.rotation.x = 0.28 * k; sp.look(headOf(J)); sp.face(k > 0.8 ? 'grin' : 'smile');
      J.pose(addPose(idle(t, 0.6), { rUp: 150 - k * 15, rFwd: 25, nod: -20 })); hold(ro, J, 'R', [0, 1.2, 0]); ro.rotation.y = Math.PI;
      B.pose(addPose(idle(t, 0.8, 2), hit([[0, HIPS], [dur * 0.6, HIPS], [dur * 0.8, { rUp: 140, lUp: 20, nod: -12 }]], t)));
      camPath(cam, t / dur, [13, 4.0, 20], [12, 4.2, 18.5], [0.4, 6, -2], [0.4, 6.4, -2], 22, 22);
    };
  },
  // 42 '"Okay," Dex said. "Sponges are cool."'  — Dex, sheepish: rubs the back of his neck, then a small grudging grin
  (S, cam) => {
    const env = outside(S, 0); const sp = buddy(S, 6.2); sp.root.position.set(...BIG); const X = dex(S, 'blush', [3.0, 0, 4.4], -15);
    return (t, dur) => { env.update(t); sp.update(t, 'idle'); sp.look(headOf(X));
      X.pose(addPose(addPose(idle(t, 0.7), talk(t, 1)), hit([[0, { rUp: 20 }], [0.4, { rUp: 120, rFwd: 70, nod: 8, tilt: -6 }], [dur * 0.55, { rUp: 125, rFwd: 72, nod: 6, tilt: -8 }], [dur * 0.75, { rFwd: 30, nod: -4 }]], t)));
      if (t > dur * 0.55) X.setFace('smirk');
      const h = headOf(X).toArray(); faceCam(cam, t / dur, h, -15, { dist: 7.2, lens: 32, side: -0.8, push: 0.8, up: -0.3, look: 0 });
    };
  },
  // 43 "Now it helps Mr. Gus clean the gym."  — the gym, sparkling: the sponge (still a bit big) scrubs across the floor next to the robot mop; Mr. Gus sips his coffee, feet finally dry
  (S, cam) => {
    const env = fairGym(S, { clean: true }); const sp = buddy(S, 1.8); const m = robotMop(S, 1.0); const G = gus(S, 'relieved', [-5.0, 0, -2.0], 25);
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.45, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })); S.add(mug);
    return (t, dur) => { env.update(t); const u = t / dur;
      sp.root.position.set(6 - u * 10, 0, 2.8 + Math.sin(u * 6) * 0.6); sp.root.rotation.y = -Math.PI / 2 + Math.sin(t * 6) * 0.15; sp.face('grin'); sp.update(t, 'idle'); sp.body.rotation.z = Math.sin(t * 10) * 0.06;
      m.position.set(9 - u * 10, 0, 6.2); m.rotation.y = -Math.PI / 2; m.update(t, 'mop');
      G.pose(addPose(idle(t, 0.5), { rFwd: 105, rUp: -20, nod: t % 2 < 0.6 ? 10 : 0 })); hold(mug, G, 'R', [0, 0.1, 0.1]);
      camPath(cam, t / dur, [4.0, 5.4, 17], [3.0, 5.2, 15.5], [0, 2.8, 0], [-1, 3.0, 0], 22, 22);
    };
  },
  // 44 "Moral of the story? Never laugh at a sponge."  — Benji and the sponge side by side in the clean gym; slow push-in; Benji winks, the sponge waves
  (S, cam) => {
    const env = fairGym(S, { clean: true }); const B = benji(S, 'smile', [-1.4, 0, 0.6], 12); const sp = buddy(S, 1.8); sp.root.position.set(2.0, 0, 0.8); sp.root.rotation.y = -12 * D;
    return (t, dur) => { env.update(t);
      B.pose(addPose(idle(t, 0.6), hit([[0, {}], [dur * 0.55, { tilt: 4 }], [dur * 0.7, { rUp: 50, rFwd: 70, tilt: -6, nod: -4 }], [dur, { rUp: 55, rFwd: 72, tilt: -6, nod: -4 }]], t)));
      if (t > dur * 0.6) B.setFace('wink');
      sp.face('grin'); sp.update(t, t > dur * 0.6 ? 'wave' : 'idle', 1); sp.look(cam.position);
      camPath(cam, t / dur, [0.4, 4.2, 14], [0.4, 4.2, 11.5], [0.3, 3.8, 0.6], [0.3, 3.9, 0.6], 26, 28);
    };
  },
];
