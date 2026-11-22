import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, backOut,
  fairGym, bathTest, paperPlane, handBell, potatoClock, robotMop, eyeDropper, spongeBuddy } from '../../engine/kit.js';
import { benji, dex, priya, gus, judge, kid, buddy, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, arc } from './common.js';

const PLATE = [8, 2.68, -1.7];   // the sponge's plate on Benji's table
// a paper plane flying along a curve f(u) -> Vector3, nose along the velocity, banking
export function fly(p, f, u, bank = 0.5) { const a = f(u), b = f(u + 0.01); p.position.copy(a); p.lookAt(b); p.rotateZ(Math.sin(u * 9) * bank); }
const loop = (c, r, h, sp, ph) => (u) => new THREE.Vector3(c[0] + Math.sin(u * sp + ph) * r, c[1] + Math.sin(u * sp * 2 + ph) * h, c[2] + Math.cos(u * sp + ph) * r * 0.6);
const CROSS = { rFwd: 75, lFwd: 75, rUp: -38, lUp: -38 };   // arms folded
const HIPS = POSES.hips;

export const SHOTS_A = [
  // 2 "At the science fair, projects come alive."  — the whole fair is moving: paper planes swoop at the camera, the robot arm waves, kids duck and laugh
  (S, cam) => {
    const env = fairGym(S);
    const planes = [0xffffff, 0x8ad0ff, 0xffd23a, 0xff8aa8].map(c => { const p = paperPlane(S, c); p.scale.setScalar(1.6); return p; });
    const K0 = kid(S, 0, 'laugh', [-3.2, 0, 1.2], 25), K1 = kid(S, 1, 'starstruck', [2.4, 0, 2.6], -20);
    const pc = potatoClock(S, 0.8); pc.position.set(-6.4, 2.66, -2.6);
    return (t, dur) => { env.update(t); pc.update(t, 'hop');
      planes.forEach((p, i) => fly(p, u => new THREE.Vector3(-6 + u * 10 + i * 1.5, 7 - u * 2.5 + Math.sin(u * 5 + i) * 1.2 - i * 0.6, -10 + u * 17 + i * 0.8), ((t / dur) * 0.9 + i * 0.12) % 1));
      env.arm.pose(Math.sin(t * 3) * 40, 20 + Math.sin(t * 4) * 25, 30 + Math.sin(t * 5) * 20, 20);
      K0.pose(addPose(idle(t, 1), hit([[0, { rUp: 20 }], [0.4, { rUp: 140, lUp: 60, nod: -18 }], [dur, { rUp: 150, lUp: 70, nod: -22 }]], t)));
      K1.pose(addPose(idle(t, 1, 2), addPose({ rFwd: 40, lFwd: 40, lean: -6 }, lookAt(K1, planes[1].position))));
      camPath(cam, t / dur, [5.0, 5.0, 18.5], [3.4, 5.4, 15.5], [-1.5, 4.4, -5], [-1.8, 4.8, -6], 22, 23);
    };
  },
  // 3 "You see, the judge rings a bell, and they wake up."  — cut 1: Judge Okafor rings the brass bell; cut 2: the robot arm unfolds like a stretch and waves
  (S, cam) => {
    const env = fairGym(S);
    const J = judge(S, 'smile', [1.2, 0, -3.4], 12); const bell = handBell(S); const pc = potatoClock(S, 0.8); pc.position.set(-6.4, 2.66, -2.6);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.45]);
      J.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 40 }], [0.3, { rUp: 150, rFwd: 20 }], [dur, { rUp: 145, rFwd: 20 }]], t))); hold(bell, J, 'R', [0, 0.05, 0]); bell.ring(t, sm(t, 0.25, 0.4));
      if (t > 0.3) J.setFace('grin');
      const wk = sm(t, dur * 0.5, dur * 0.85); env.arm.pose(Math.sin(t * 5) * 30 * wk, -60 + wk * 80, 140 - wk * 120, 40 - wk * 30 + Math.sin(t * 9) * 20 * wk);
      pc.update(t, wk > 0.5 ? 'hop' : 'idle');
      if (k === 0) { const h = headOf(J).toArray(); faceCam(cam, u, [h[0], h[1] + 0.6, h[2]], 12, { dist: 8.0, lens: 30, side: -0.8, push: 1.0, up: -0.3 }); }
      else camPath(cam, u, [-1.2, 4.0, -4.2], [-1.6, 4.4, -4.8], [-4.0, 4.6, -9.3], [-4.0, 5.2, -9.3], 28, 30);
    };
  },
  // 4 "Priya built a potato clock last year."  — Priya holds up her potato clock proudly in front of the POTATO POWER poster
  (S, cam) => {
    const env = fairGym(S);
    const P = priya(S, 'proud', [-6, 0, -0.6], 8); const pc = potatoClock(S, 0.9);
    return (t, dur) => { env.update(t); pc.update(t, 'idle');
      P.pose(addPose(idle(t, 0.8), hit([[0, { rFwd: 40, lFwd: 40 }], [0.4, { rFwd: 78, lFwd: 78, rUp: -22, lUp: -22, nod: 8 }], [dur, { rFwd: 82, lFwd: 82, rUp: -22, lUp: -22, nod: 4, tilt: 6 }]], t)));
      const a = pinky(P, 'R'), b = pinky(P, 'L'); pc.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 - 0.2, (a.z + b.z) / 2 + 0.15); pc.rotation.y = 0.1;
      if (t > dur * 0.5) P.setFace('grin');
      camPath(cam, t / dur, [-4.4, 4.6, 9.8], [-4.8, 4.5, 8.4], [-5.8, 3.8, -0.6], [-5.8, 3.9, -0.6], 28, 30);
    };
  },
  // 5 "Now it follows her everywhere, ticking."  — Priya walks across the gym; the potato clock waddles right behind her; she glances back, done with it
  (S, cam) => {
    const env = fairGym(S);
    const P = priya(S, 'bored', [-6, 0, 2.6], 90); const pc = potatoClock(S, 1.0);
    return (t, dur) => { env.update(t);
      const x = -6 + t * 2.2; P.root.position.x = x; P.pose(addPose(walk(t, 1.0, 0.7), t > dur * 0.45 ? { turn: -55, nod: 10 } : {}));
      pc.position.set(x - 2.4, 0, 2.6); pc.rotation.y = Math.PI / 2; pc.update(t, 'walk');
      if (t > dur * 0.45) P.setFace('pout');
      camPath(cam, t / dur, [-5.6, 3.6, 15.5], [-5.6 + dur * 2.2 * 0.9, 3.8, 15.0], [-6.8, 2.6, 2.6], [-6.8 + dur * 2.2, 2.8, 2.6], 24, 24);
    };
  },
  // 6 "Mr. Gus, our janitor, built a robot mop."  — Mr. Gus, hands on hips, proud next to his bucket robot (screen face smiles, antenna blinks)
  (S, cam) => {
    const env = fairGym(S);
    const G = gus(S, 'proud', [1.6, 0, 1.2], -12); const m = robotMop(S, 1.0); m.position.set(5.0, 0, 2.4); m.rotation.y = -25 * D;
    return (t, dur) => { env.update(t); m.update(t, 'idle');
      G.pose(addPose(idle(t, 0.7), hit([[0, { rUp: 20 }], [0.4, HIPS], [dur, { ...HIPS, nod: -6, tilt: 6 }]], t))); if (t > dur * 0.4) G.setFace('grin');
      camPath(cam, t / dur, [4.4, 4.6, 14.5], [3.9, 4.6, 13.0], [3.2, 3.4, 1.6], [3.2, 3.5, 1.6], 26, 27);
    };
  },
  // 7 "It mops him. Every single day."  — the robot mops Mr. Gus's boots while he stands there, arms folded, deadpan
  (S, cam) => {
    const env = fairGym(S);
    const G = gus(S, 'bored', [0, 0, 0], 0); const m = robotMop(S, 1.0); m.position.set(2.6, 0, 0.9); m.rotation.y = -110 * D;
    return (t, dur) => { env.update(t); m.update(t, 'mop');
      G.pose(addPose(idle(t, 0.5), addPose(CROSS, { nod: Math.sin(t * 8) * 1.5, turn: t > dur * 0.5 ? -15 : 0, tilt: t > dur * 0.5 ? 6 : 0 })));
      if (t > dur * 0.55) G.setFace('disgusted');
      camPath(cam, t / dur, [2.8, 3.8, 12.4], [2.2, 3.6, 11.0], [1.0, 2.8, 0.4], [0.8, 2.9, 0.4], 26, 28);
    };
  },
  // 8 "And Dex? Dex wins every year."  — Dex leans on his red table between gold trophies, winks and does finger guns
  (S, cam) => {
    const env = fairGym(S);
    const X = dex(S, 'smirk', [3.6, 0, -4.8], -18);
    return (t, dur) => { env.update(t);
      X.pose(addPose(idle(t, 0.8), hit([[0, { rUp: 10 }], [0.35, { rFwd: 90, lFwd: 70, rUp: -10, lUp: -20, tilt: -6 }], [dur * 0.6, { rFwd: 85, lFwd: 72, rUp: -5, lUp: -20, tilt: -8, nod: -4 }], [dur * 0.7, { rFwd: 95, lFwd: 72, rUp: -10, lUp: -20, tilt: -8 }]], t)));
      if (t > dur * 0.55) X.setFace('wink');
      const h = headOf(X).toArray(); faceCam(cam, t / dur, [h[0] - 0.8, h[1] - 0.6, h[2]], -18, { dist: 11.0, lens: 30, side: -1.0, push: 1.0, up: 0.2, look: 0 });
    };
  },
  // 9 "His projects are always the biggest."  — tilt up from Dex to the giant paper-mache MEGA VOLCANO (asleep, eyes shut)
  (S, cam) => {
    const env = fairGym(S);
    const X = dex(S, 'proud', [5.0, 0, -4.8], -40);
    return (t, dur) => { env.update(t);
      X.pose(addPose(idle(t, 0.8), hit([[0, HIPS], [0.4, { rUp: 75, lUp: 20, rFwd: 30, turn: 30 }], [dur, { rUp: 85, lUp: 20, rFwd: 30, turn: 35, nod: -10 }]], t)));
      camPath(cam, t / dur, [4.0, 2.2, 5.6], [3.2, 2.0, 4.4], [2.2, 3.6, -5.4], [0.4, 6.4, -8.0], 24, 24);
    };
  },
  // 10 "I'm Benji. I'm ten."  — Benji beside his small table: a shy little wave, pushes up his glasses
  (S, cam) => {
    const env = fairGym(S);
    const B = benji(S, 'nervous', [4.6, 0, -0.4], 18); const sp = buddy(S); sp.plain(1); sp.root.position.set(...PLATE);
    return (t, dur) => { env.update(t); sp.update(t);
      B.pose(addPose(idle(t, 0.7), hit([[0, { rUp: 10 }], [0.35, { rUp: 120, rFwd: 30, tilt: 6 }], [dur * 0.55, { rUp: 120, rFwd: 30, tilt: 4 }], [dur * 0.7, { rFwd: 140, rUp: -30, nod: 6 }], [dur, { rFwd: 145, rUp: -32, nod: 4 }]], t)));
      if (t > dur * 0.2) B.setFace('softsmile');
      const h = headOf(B).toArray(); faceCam(cam, t / dur, [h[0] + 0.6, h[1] - 0.2, h[2]], 18, { dist: 8.8, lens: 32, side: 1.2, push: 0.9, up: 0.1, look: 0.15 });
    };
  },
  // 11 "My project was a sponge."  — macro: a plain yellow-and-green kitchen sponge on a plate, THE AMAZING SPONGE poster behind; Benji's hand presents it
  (S, cam) => {
    const env = fairGym(S);
    const B = benji(S, 'smile', [5.2, 0, -0.6], 70); const sp = buddy(S); sp.plain(1); sp.root.position.set(...PLATE);
    return (t, dur) => { env.update(t); sp.update(t);
      B.pose(addPose(idle(t, 0.5), hit([[0, { rFwd: 30 }], [0.4, { rFwd: 70, rUp: 10 }], [dur, { rFwd: 72, rUp: 12 }]], t)));
      camPath(cam, t / dur, [9.4, 3.9, 3.2], [8.8, 3.6, 1.9], [8.0, 3.1, -1.9], [8.0, 3.0, -1.9], 34, 38);
    };
  },
  // 12 '"A sponge? Seriously?" Dex laughed.'  — Dex points at the sponge and laughs; Benji shrinks; Priya giggles behind
  (S, cam) => {
    const env = fairGym(S);
    const X = dex(S, 'laugh', [0.4, 0, 0.6], 62), B = benji(S, 'nervous', [5.2, 0, -0.2], -70), P = priya(S, 'laugh', [-2.4, 0, -1.2], 30);
    const sp = buddy(S); sp.plain(1); sp.root.position.set(...PLATE);
    return (t, dur) => { env.update(t); sp.update(t);
      X.pose(addPose(addPose(idle(t, 1), talk(t, 1.2)), hit([[0, { rFwd: 20 }], [0.3, { rFwd: 92, lFwd: 30, lUp: -10, lean: -8, bob: Math.abs(Math.sin(t * 12)) * 0.08 }], [dur, { rFwd: 90, lFwd: 40, lean: -10 }]], t)));
      B.pose(addPose(idle(t, 0.6), { nod: 12 * sm(t, 0.4, 1.0), rFwd: 25, lFwd: 25, rUp: -20, lUp: -20, bob: -0.08 * sm(t, 0.4, 1.0) })); if (t > dur * 0.5) B.setFace('sad');
      P.pose(addPose(idle(t, 0.8, 3), { rFwd: 120, rUp: -30, nod: 6 + Math.sin(t * 14) * 3 }));
      camPath(cam, t / dur, [3.4, 5.0, 14.6], [3.0, 5.0, 13.4], [2.6, 3.7, -0.4], [2.6, 3.8, -0.4], 24, 25);
    };
  },
  // 13 "But I tested forty sponges in my bathtub."  — flashback: Benji at the end of a bubbly clawfoot tub, squeezing sponge after sponge, chart on the wall
  (S, cam) => {
    S.userData.look = 'flash'; const env = bathTest(S);
    const B = benji(S, 'thinking', [3.0, 0, -4.3], -90); const sp = buddy(S, 0.42, 'test'); sp.plain(1);
    const drips = Array.from({ length: 6 }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8ad0ff, roughness: 0.05 })); S.add(d); return d; });
    return (t, dur) => { env.update(t);
      const sq = Math.max(0, Math.sin(t * 5)); B.pose(addPose(idle(t, 0.5), { rFwd: 72 + sq * 6, lFwd: 72 + sq * 6, rUp: -16, lUp: -16, nod: 18 }));
      const a = pinky(B, 'R'), b = pinky(B, 'L'); sp.root.position.set((a.x + b.x) / 2 - 0.1, (a.y + b.y) / 2 - 0.25, (a.z + b.z) / 2); sp.root.rotation.y = Math.PI / 2; sp.body.scale.y = 1 - sq * 0.3; sp.update(t);
      drips.forEach((d, i) => { const u = ((t * 1.6 + i / 6) % 1); d.position.set(sp.root.position.x + (i % 3 - 1) * 0.12, sp.root.position.y - u * 1.4, sp.root.position.z + (i % 2 - 0.5) * 0.15); d.visible = sq > 0.1 || u < 0.5; });
      if (t > dur * 0.6) B.setFace('determined');
      camPath(cam, t / dur, [-2.8, 4.8, -0.4], [-2.4, 4.6, -1.0], [2.0, 3.4, -4.6], [2.0, 3.5, -4.6], 24, 26);
    };
  },
  // 14 "This one could soak up anything."  — flashback close: Benji dips THE sponge in; the whole tub drains into it; his jaw drops
  (S, cam) => {
    S.userData.look = 'flash'; const env = bathTest(S);
    const B = benji(S, 'awe', [3.0, 0, -4.3], -90); const sp = buddy(S, 0.42, 'test'); sp.plain(1);
    return (t, dur) => { env.update(t);
      const k = sm(t, 0.2, dur * 0.8);
      B.pose(addPose(idle(t, 0.5), { rFwd: 60 + k * 14, lFwd: 60 + k * 14, rUp: -16, lUp: -16, nod: 22 - k * 30, lean: -k * 6 })); if (k > 0.5) B.setFace('starstruck');
      const a = pinky(B, 'R'), b = pinky(B, 'L'); sp.root.position.set((a.x + b.x) / 2 - 0.1, (a.y + b.y) / 2 - 0.3, (a.z + b.z) / 2); sp.root.rotation.y = Math.PI / 2; sp.root.scale.setScalar(0.42 * (1 + k * 0.8)); sp.update(t);
      env.water.position.y = 2.1 - k * 1.3; env.bub.forEach((bb, i) => { bb.position.y = 2.15 - k * 1.3; bb.scale.setScalar(Math.max(0.0001, 1 - k * 1.2 + (i % 3) * 0.1)); }); env.duck.position.y = 2.1 - k * 1.3;
      camPath(cam, t / dur, [-1.8, 5.2, -0.6], [-1.4, 5.0, -1.2], [1.8, 3.0, -4.6], [1.8, 3.2, -4.6], 26, 28);
    };
  },
  // 15 "Then the judge rang the bell."  — low angle push-in: the judge winds up and rings the bell high over her head
  (S, cam) => {
    const env = fairGym(S);
    const J = judge(S, 'determined', [1.0, 0, -3.6], 10); const bell = handBell(S);
    return (t, dur) => { env.update(t);
      J.pose(addPose(addPose(idle(t, 0.6), anticipate(t, 0.45, 1.4)), hit([[0, { rFwd: 50 }], [0.45, { rUp: 160, rFwd: 15, lUp: 20 }], [dur, { rUp: 155, rFwd: 15, lUp: 25, nod: -8 }]], t)));
      hold(bell, J, 'R', [0, 0.05, 0]); bell.ring(t, sm(t, 0.4, 0.5)); if (t > 0.5) J.setFace('grin');
      camPath(cam, t / dur, [2.8, 1.8, 7.6], [2.4, 2.0, 6.0], [1.0, 5.2, -3.6], [1.0, 5.6, -3.6], 26, 28); shake(cam, t, 0.5, 0.3);
    };
  },
  // 16 "Paper planes swooped over the bleachers."  — paper planes swoop out of the bleachers and over two kids who duck and cheer
  (S, cam) => {
    const env = fairGym(S);
    const planes = [0xffffff, 0x8ad0ff, 0xffd23a, 0xff8aa8, 0xb8f08a, 0xffffff].map(c => { const p = paperPlane(S, c); p.scale.setScalar(1.8); return p; });
    const K0 = kid(S, 0, 'delighted', [-5.8, 0, 0.6], -60), K1 = kid(S, 1, 'laugh', [-3.4, 0, 3.6], -40);
    return (t, dur) => { env.update(t);
      planes.forEach((p, i) => fly(p, u => new THREE.Vector3(-13 + u * 12 + Math.sin(u * 4 + i) * 1.5, 5.5 + i * 0.5 + Math.sin(u * 6 + i) * 1.2 - u * 1.5, -12 + i * 2.6 + u * 6), ((t / dur) * 0.8 + i * 0.13) % 1, 0.7));
      K0.pose(addPose(idle(t, 1), hit([[0, {}], [0.3, { rUp: 150, lUp: 150, nod: -20 }], [dur, { rUp: 140, lUp: 150, nod: -25 }]], t)));
      K1.pose(addPose(idle(t, 1, 2), hit([[0, {}], [0.5, { bob: -0.5, nod: 15, rFwd: 60, lFwd: 60 }], [dur, { bob: -0.3, nod: 10, rFwd: 70, lFwd: 70 }]], t)));
      camPath(cam, t / dur, [3.0, 3.8, 13.5], [2.2, 4.2, 12.4], [-8, 4.6, -3], [-9, 5.6, -5], 22, 22);
    };
  },
  // 17 "A robot arm high-fived Mr. Gus."  — reverse angle across the arm table: the robot arm swings up and smacks Mr. Gus's raised palm
  (S, cam) => {
    const env = fairGym(S);
    const G = gus(S, 'shock', [-5.1, 0, -5.0], 180);
    return (t, dur) => { env.update(t);
      const k = backOut(ramp(t, 0.2, dur * 0.5)); env.arm.pose(-14, 48 * k - 10 * (1 - k), 28 * k, -10 * k);
      G.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 30 }], [dur * 0.35, { rUp: 150, rFwd: 25, lean: -4 }], [dur * 0.55, { rUp: 150, rFwd: 30, lean: -8, bob: -0.06 }], [dur, { rUp: 145, rFwd: 25, lean: -2 }]], t)));
      if (t > dur * 0.55) G.setFace('laugh');
      camPath(cam, t / dur, [0.2, 4.8, -14.8], [-0.2, 4.9, -14.4], [-4.4, 4.4, -6.6], [-4.4, 4.6, -6.6], 22, 23); shake(cam, t, dur * 0.52, 0.25);
    };
  },
  // 18 "And my sponge woke up. It yawned."  — macro: eyes and little arms pop out of the plain sponge; it stretches and gives a huge yawn
  (S, cam) => {
    const env = fairGym(S);
    const sp = buddy(S); sp.root.position.set(...PLATE); fill(S, [9, 5, 2], 8, 0xfff0d0, 9);
    return (t, dur) => { env.update(t);
      sp.plain(t < 0.3 ? 1 : 0); const y = sm(t, 0.6, 1.0) * (1 - sm(t, dur - 0.4, dur)); sp.eyes(sm(t, 0.3, 0.55)); sp.update(t, 'yawn', y); sp.look(cam.position);
      camPath(cam, t / dur, [8.5, 3.7, 2.6], [8.3, 3.5, 1.3], [8.0, 3.1, -1.7], [8.0, 3.1, -1.7], 38, 42);
    };
  },
  // 19 "It was shy. It hid behind my poster."  — the sponge scurries off the plate and hides behind the poster wing, then peeks out
  (S, cam) => {
    const env = fairGym(S);
    const sp = buddy(S);
    return (t, dur) => { env.update(t);
      const u = sm(t, 0.15, dur * 0.55); const p = arc([8, 2.68, -1.7], [6.45, 2.68, -2.75], u, 0.3); const peek = sm(t, dur * 0.65, dur * 0.85);
      sp.root.position.copy(p); sp.root.position.x -= peek * 0.35; sp.root.rotation.y = u < 1 ? -1.6 * u : -1.6 + peek * 1.9; sp.update(t, u > 0 && u < 1 ? 'hop' : 'shy', 1); sp.look(cam.position);
      camPath(cam, t / dur, [7.8, 4.0, 4.0], [7.6, 3.9, 3.2], [6.9, 3.1, -2.2], [6.7, 3.1, -2.4], 32, 34);
    };
  },
  // 20 "I gave it one drop of water. It giggled."  — Benji holds an eye dropper over it; one drop lands; the sponge wiggles and giggles; Benji laughs
  (S, cam) => {
    const env = fairGym(S);
    const B = benji(S, 'smile', [5.0, 0, -0.9], 75); const sp = buddy(S); sp.root.position.set(7.0, 2.68, -1.6); sp.root.rotation.y = -0.5; const dr = eyeDropper(S);
    return (t, dur) => { env.update(t);
      B.pose(addPose(idle(t, 0.5), { rFwd: 82, rUp: 4, nod: 22 })); hold(dr, B, 'R', [0.0, -0.1, 0.0]);
      const du = ramp(t, 0.5, 0.85); const tip = dr.position.clone().add(new THREE.Vector3(0, -0.4, 0)); dr.drop.position.set(0, -0.4 - du * (tip.y - (2.68 + 0.95)), 0); dr.drop.visible = du < 1;
      const g = t > 0.85 ? 1 : 0; sp.update(t, g ? 'giggle' : 'idle', 1); sp.look(headOf(B)); if (g) { B.setFace('laugh'); }
      camPath(cam, t / dur, [9.8, 4.6, 5.2], [9.3, 4.5, 4.3], [6.6, 3.6, -1.4], [6.6, 3.6, -1.4], 28, 30);
    };
  },
  // 21 "Then Dex's project woke up."  — the volcano's paper-mache eyelids crack open; Dex's proud grin turns to confusion
  (S, cam) => {
    const env = fairGym(S);
    const X = dex(S, 'proud', [5.0, 0, -4.8], -50);
    return (t, dur) => { env.update(t); const w = sm(t, 0.25, dur * 0.7); env.volcano.wake(w); env.volcano.group.rotation.z = Math.sin(t * 30) * 0.012 * w;
      X.pose(addPose(idle(t, 0.7), addPose({ rFwd: 25, lFwd: 15, rUp: -5 }, lookAt(X, [0, 5.2, -7.3])))); if (w > 0.5) X.setFace('confused');
      camPath(cam, t / dur, [1.8, 5.6, 0.4], [1.4, 5.5, -0.8], [0.8, 5.0, -6.8], [0.6, 5.1, -7.0], 30, 34);
    };
  },
];
