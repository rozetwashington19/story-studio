import * as THREE from 'three';
import { POSES, addPose, ease, snap, idle, walk, D, std, box, camPath, track, seg, kitchen, dining, classroom, kidRoomDay,
  hallway, houseFront, flower, cactus, flowerBed, toaster, cake, bike, homeStairs, FLOWER_COLS, sob, T2, L } from '../../engine/kit.js';
import { JUNO, SWEATER, THEO, MOM, DAD, GRAN, TEACHER, LUNCH, BEA, POST, KIDS, mk, pop, sway, hand, lunchLine, fries } from './common.js';

const head = (x, z, y = 4.64) => [x, y, z];
// face close-up on a head at h=[x,y,z], camera from the front (+z), slight side offset
const close = (cam, p, h, { side = 0.4, dist = 5.6, lens = 36, push = 0.8, up = 0.15 } = {}) => (dist = Math.max(dist, 5.2), lens = Math.min(lens, 38),
  camPath(cam, p, [h[0] + side, h[1] + up, h[2] + dist], [h[0] + side * 0.7, h[1] + up - 0.05, h[2] + dist - push], [h[0], h[1] - 0.45, h[2]], [h[0], h[1] - 0.42, h[2]], lens));
const fill = (S, pos, i = 6, col = 0xffd8b0) => { const p = new THREE.PointLight(col, i, 14, 1.6); p.position.set(...pos); S.add(p); return p; };

export const SHOTS_A = [
  // 1 "In this world,"
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    const bed = flowerBed(S, [-12, 2], [-1.4, 0.4], 22, { seed: 3 });
    const w = [mk(S, KIDS[0], 'k0', 'smile', [-9, 0, 9], 90), mk(S, KIDS[3], 'k3', 'smile', [10, 0, 12], -90)];
    return (t, dur) => {
      camPath(cam, t / dur, [-2, 9, 34], [-2, 7.5, 31], [-1, 6.5, -4], [-1, 5.5, -4], 26);
      w[0].root.position.x = -9 + t * 3.2; w[1].root.position.x = 10 - t * 3.2; w.forEach((A, i) => A.pose(walk(t + i, 1))); sway(bed, t);
    };
  },
  // 2 "when you thank someone, a flower grows at their feet."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    const a = mk(S, KIDS[1], 'giver', 'smile', [-1.6, 0, 4], 70), b = mk(S, KIDS[2], 'thanker', 'grin', [1.6, 0, 4], -70);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), std({ color: 0xe8484f, roughness: 0.4 })); S.add(ball);
    const f = flower(S, [-1.4, 0, 5.6], { kind: 'daisy', col: 0xf2c230, size: 1.1 });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [0.5, 4.4, 18], [0.3, 4.2, 16], [0, 3.2, 4], [0, 3.0, 4], 30);
      else camPath(cam, p, [-0.4, 1.8, 11], [-0.6, 1.6, 10.2], [-1.3, 1.0, 5], [-1.3, 1.1, 5], 26);
      const give = ease(Math.min(1, t / 0.6));
      a.pose(addPose({ rFwd: 70 - give * 50, lUp: 4 }, idle(t, 1)));
      b.pose(addPose(track([[0, { lFwd: 40 }], [0.6, { lFwd: 60 }], [0.9, { lFwd: 60, rUp: 150 }], [1.4, { lFwd: 60, rUp: 130 }]], t), { tilt: Math.sin(t * 9) * 5 }));
      const hp = give < 1 ? hand(a, 'R').lerp(hand(b, 'L'), give) : hand(b, 'L'); ball.position.set(hp.x, hp.y - 0.4, hp.z);
      pop(f, t, 0.9, 0.45);
    };
  },
  // 3 "You see, the bigger the thank you, the bigger the flower."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    const a = mk(S, KIDS[2], 'thanker', 'grin', [-3.5, 0, 4], 50), b = mk(S, KIDS[1], 'giver', 'shock', [3.2, 0, 4], -40);
    const fs = [flower(S, [4.2, 0, 6.2], { kind: 'tulip', col: 0xe86ab0, size: 0.8 }), flower(S, [2.0, 0, 6.4], { kind: 'rose', col: 0xe8484f, size: 1.4 }), flower(S, [5.4, 0, 5.4], { kind: 'sun', col: 0xf2c230, size: 4.2 })];
    return (t, dur) => {
      camPath(cam, t / dur, [1, 4, 24], [1.5, 7, 24], [0.5, 3.2, 4], [2.5, 6.0, 4], 28);
      const j = Math.abs(Math.sin(t * 7));
      a.pose(addPose(POSES.armsup, { rUp: Math.sin(t * 14) * 12, lUp: -Math.sin(t * 14) * 12, bob: j * 0.1 })); a.root.position.y = j * 0.7;
      b.pose(addPose(POSES.shock, { nod: -10 - t * 8 })); b.setFace(t > 1.4 ? 'awe' : 'shock');
      pop(fs[0], t, 0.15); pop(fs[1], t, 0.6); pop(fs[2], t, 1.1, 0.7);
    };
  },
  // 4 "But if you don't really mean it, you get a cactus."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    const a = mk(S, KIDS[3], 'thanker', 'smirk', [-1.8, 0, 4], 60), b = mk(S, KIDS[0], 'giver', 'smile', [1.8, 0, 4], -60);
    const c = cactus(S, [3.0, 0, 5.4], { s: 1.3 });
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 4.4, 15], [0.8, 4.2, 13.5], [0.3, 3.4, 4], [0.8, 3.0, 4], 30);
      a.pose(addPose({ rUp: 8, lUp: 8, turn: -20 }, { nod: -12 + Math.sin(t * 3) * 6, tilt: 10 }));
      b.pose(t < 1.0 ? addPose(POSES.hips, idle(t, 1)) : POSES.shock); b.setFace(t < 1.0 ? 'smile' : 'shock');
      pop(c, t, 0.8, 0.35);
    };
  },
  // 5 "My grandma thanks everybody for everything."
  (S, cam) => {
    houseFront(S, { col: '#f0d2e2' });
    const g = mk(S, GRAN, 'gran', 'grin', [-6, 0.6, -3.6], 25);
    const m = mk(S, POST, 'mail', 'smile', [-11, 0, 3.5], 90);
    const fs = [0, 1, 2, 3].map(i => flower(S, [-8.6 + i * 2.6, 0, 4.9], { kind: ['daisy', 'rose', 'tulip', 'daisy'][i], col: FLOWER_COLS[i + 1], size: 1.1 }));
    return (t, dur) => {
      camPath(cam, t / dur, [-4, 5.0, 17], [-3, 4.6, 15], [-6, 3.6, 0], [-4, 3.4, 0], 28);
      g.pose(addPose(POSES.wave, { rUp: Math.sin(t * 12) * 18, ...idle(t, 1) }));
      m.root.position.x = -11 + t * 4.6; m.pose(walk(t, 1));
      fs.forEach((f, i) => pop(f, t, 0.2 + i * 0.45, 0.35));
    };
  },
  // 6 "Her porch looks like a jungle."
  (S, cam) => {
    houseFront(S, { col: '#f0d2e2' });
    const bed = [...flowerBed(S, [-12, 2], [-0.6, 4], 70, { seed: 5, size: [1.2, 2.6] }), ...flowerBed(S, [-11, -8], [-5.5, -2.2], 8, { seed: 8, size: [1.4, 2.2], y: 0.6 }), ...flowerBed(S, [-4, 0.2], [-5.5, -2.2], 8, { seed: 9, size: [1.4, 2.2], y: 0.6 })];
    const g = mk(S, GRAN, 'gran', 'grin', [-6, 0.6, -3.8], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [-5, 4.0, 18], [-5.5, 4.4, 14.5], [-5.5, 3.6, -2], [-6, 4.2, -3], 30);
      g.pose(addPose(POSES.armsup, { rUp: Math.sin(t * 10) * 10, lUp: Math.sin(t * 10) * 10, bob: Math.abs(Math.sin(t * 5)) * 0.08 })); sway(bed, t);
    };
  },
  // 7 "My dad says thank you to the toaster."
  (S, cam) => {
    kitchen(S); toaster(S, [-1.6, 2.78, -2.6]);
    const d = mk(S, DAD, 'dad', 'grin', [-1.6, 0, -6.6], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [1.8, 5.0, 5.0], [1.2, 4.8, 3.8], [-1.6, 3.6, -4.5], [-1.6, 3.7, -4.5], 32);
      const b = (Math.sin(t * 5) + 1) / 2; d.pose({ lean: 4 + b * 12, nod: b * 10, rFwd: 25, lFwd: 25, rUp: -10, lUp: -10 });
    };
  },
  // 8 "There's a tulip growing out of the toaster."
  (S, cam) => {
    kitchen(S); toaster(S, [-1.6, 2.78, -2.6]);
    const d = mk(S, DAD, 'dad', 'awe', [-1.6, 0, -6.6], 0);
    const f = flower(S, [-1.9, 2.9, -2.6], { kind: 'tulip', col: 0xe8484f, size: 1.0 });
    return (t, dur) => {
      camPath(cam, t / dur, [-0.6, 4.2, 2.2], [-1.0, 4.0, 1.2], [-1.6, 3.6, -2.8], [-1.6, 3.9, -3.0], 36);
      d.pose(addPose(POSES.shock, { nod: 12, rFwd: 20, lFwd: 20 })); pop(f, t, 0.2, 0.5);
    };
  },
  // 9 "On the last day of school, everybody thanks our teacher."
  (S, cam) => {
    classroom(S, false); L('day')(S);
    const tch = mk(S, TEACHER, 'teacher', 'awe', [0, 0, -6.2], 0);
    const kids = [-3.4, 3.4].map((x, i) => mk(S, KIDS[i], 'kid' + i, 'grin', [x, 0, -0.6], 180 + (x < 0 ? 25 : -25)));
    const fs = [[-2.6, -5.4], [2.4, -5.6], [-1.6, -4.4], [1.4, -4.2], [-3.4, -6.8], [3.2, -7.0], [0.1, -3.6]].map(([x, z], i) => flower(S, [x, 0, z], { kind: ['daisy', 'rose', 'tulip'][i % 3], col: FLOWER_COLS[i % 7], size: 1.4 + (i % 3) * 0.3 }));
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [1.0, 7.0, 7.5], [0.5, 6.6, 6.5], [0, 3.6, -4.5], [0, 3.8, -4.5], 28);
      else camPath(cam, p, [0.8, 4.9, 0.0], [0.6, 4.8, -0.8], [0, 4.2, -6.2], [0, 4.3, -6.2], 32);
      kids.forEach((A, i) => A.pose(addPose(POSES.wave, { rUp: Math.sin(t * 11 + i) * 15 })));
      tch.pose(addPose({ rFwd: 40, lFwd: 40, rUp: 20, lUp: 20 }, idle(t, 1)));
      fs.forEach((f, i) => pop(f, t, 0.15 + i * 0.3, 0.3));
    };
  },
  // 10 "She can't even find her desk."
  (S, cam) => {
    classroom(S, false); L('day')(S);
    const tch = mk(S, TEACHER, 'teacher', 'worried', [0, 0, -4.5], 0);
    const bed = [...flowerBed(S, [-8, 8], [-8.5, -5.6], 40, { seed: 11, size: [2.0, 3.0] }), ...flowerBed(S, [-8, 8], [-3.5, 2], 40, { seed: 12, size: [1.3, 2.0] }), ...flowerBed(S, [-8, -2.4], [-5.6, -3.5], 6, { seed: 13, size: [2, 3] }), ...flowerBed(S, [2.4, 8], [-5.6, -3.5], 6, { seed: 14, size: [2, 3] })];
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 8.5, 6.0], [0.3, 8.0, 4.8], [0, 4.0, -4.5], [0, 4.2, -4.5], 32);
      tch.pose({ rUp: 150, lUp: 6, turn: Math.sin(t * 4) * 40, rFwd: 0 }); tch.root.position.y = Math.abs(Math.sin(t * 6)) * 0.3; sway(bed, t);
    };
  },
  // 11 And my big brother Theo always says, "Thanks a LOT."
  (S, cam) => {
    kitchen(S);
    const th = mk(S, THEO, 'theo', 'smirk', [-2.4, 0, -6.4], 20), m = mk(S, MOM, 'mom', 'smile', [4.6, 0, -5.4], -40);
    const c = cactus(S, [5.8, 0, -3.8], { s: 1.1 });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.55]);
      if (k === 0) close(cam, p, head(-2.4, -6.4), { side: 1.0 });
      else camPath(cam, p, [6.4, 3.0, 3.0], [6.4, 2.8, 2.2], [5.4, 1.6, -4.4], [5.4, 1.6, -4.4], 28);
      th.pose(addPose({ rUp: 6, lUp: 6, bodyTilt: 4 }, { nod: -14 + Math.sin(t * 2) * 4, turn: 20 + Math.sin(t * 3) * 6, tilt: 12 }));
      m.pose(t > 1.6 ? POSES.hips : { rFwd: 50, lUp: 4 }); m.setFace(t > 1.6 ? 'neutral' : 'smile');
      pop(c, t, 1.5, 0.35);
    };
  },
  // 12 "His room is full of cactuses."
  (S, cam) => {
    kidRoomDay(S);
    const th = mk(S, THEO, 'theo', 'neutral', [0.6, 0, -4.5], -10);
    const cs = [[-2, -6.5, 1], [-3.2, -1.6, 1.3], [3.2, -2.2, 1.1], [4.8, -5.6, 1.4], [2.4, -7.2, 0.9], [-1.4, 0.4, 1.0], [3.8, 0.6, 1.2], [-6, 0.8, 1.1], [6.8, -1.4, 1.3]].map(([x, z, s], i) => cactus(S, [x, 0, z], { s, ry: i * 33 }));
    cs.push(cactus(S, [-4.6, 1.9, -2.6], { s: 0.9 }), cactus(S, [-5.4, 1.9, -6.2], { s: 0.8 }));
    return (t, dur) => {
      camPath(cam, t / dur, [-4, 5.2, 7.0], [3, 5.0, 7.0], [-1, 2.6, -3], [1.5, 2.8, -3], 28);
      th.pose(addPose({ rUp: 6, lUp: 6, rFwd: 10, lFwd: 10 }, idle(t, 1.4)));
    };
  },
  // 13 "I'm Juno. I'm ten."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' }); const bed = flowerBed(S, [-12, 2], [-1.4, 0.4], 22, { seed: 3 });
    const j = mk(S, JUNO, 'juno', 'grin', [-2, 0, 6], 10);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.4, 4.8, 13], [-1.6, 4.7, 11.4], [-2, 4.0, 6], [-2, 4.2, 6], 36);
      j.pose(addPose(POSES.wave, { rUp: Math.sin(t * 12) * 16, ...idle(t, 1.2) })); sway(bed, t);
    };
  },
  // 14 "And my thank-yous are broken."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    const j = mk(S, JUNO, 'juno', 'worried', [-2, 0, 6], 10);
    return (t, dur) => {
      close(cam, t / dur, head(-2, 6), { side: 0.6, push: 1.0 });
      j.pose(addPose(POSES.shrug, { nod: 10 + t * 4, tilt: 8 + Math.sin(t * 2) * 3 }));
    };
  },
  // 15 "I thanked the lunch lady for extra fries."
  (S, cam) => {
    lunchLine(S);
    const ll = mk(S, LUNCH, 'lunch', 'smile', [5.6, 0, -3.2], -70), j = mk(S, JUNO, 'juno', 'grin', [1.0, 0, -2.0], 70);
    const fr = fries(S);
    return (t, dur) => {
      camPath(cam, t / dur, [3.2, 4.6, 10.5], [3.2, 4.4, 9.0], [3.3, 3.4, -2.6], [3.3, 3.5, -2.6], 30);
      const g = ease(Math.min(1, t / 0.9));
      ll.pose(addPose({ rFwd: 85 - g * 15, lUp: 5 }, idle(t, 0.8)));
      j.pose(addPose({ lFwd: 30 + g * 50, rUp: t > 1.0 ? 150 : 10 }, { tilt: Math.sin(t * 8) * 5 }));
      const hp = hand(ll, 'R').lerp(hand(j, 'L'), g); fr.position.set(hp.x, hp.y - 0.35, hp.z);
    };
  },
  // 16 "Nothing grew. Not a daisy. Not even a cactus."
  (S, cam) => {
    lunchLine(S);
    const ll = mk(S, LUNCH, 'lunch', 'neutral', [5.6, 0, -3.2], -70), j = mk(S, JUNO, 'juno', 'neutral', [1.0, 0, -2.0], 70);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [6.6, 6.5, 2.4], [6.5, 6.3, 1.8], [5.6, 0.3, -3.0], [5.6, 0.3, -3.0], 28);
      else close(cam, p, head(1.0, -2.0), { side: 2.4 });
      ll.pose({ nod: 30, rUp: 4, lUp: 4, turn: Math.sin(t * 3) * 15 });
      j.pose(addPose({ nod: k ? 12 : 30, rUp: 4, lUp: 4 }, { turn: Math.sin(t * 2) * 10 })); j.setFace(k ? 'worried' : 'neutral');
    };
  },
  // 17 "At first, it was kind of awesome."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    const j = mk(S, JUNO, 'juno', 'grin', [-6, 0, 6], 90);
    return (t, dur) => {
      camPath(cam, t / dur, [-2, 4.0, 22], [0, 4.0, 21], [-3, 3.0, 5], [0, 3.0, 5], 26);
      j.root.position.x = -6 + t * 4.5; const h = Math.abs(Math.sin(t * 8)); j.root.position.y = h * 0.45;
      j.pose(addPose(walk(t, 1.1, 45), { tilt: Math.sin(t * 8) * 5, rUp: 30, lUp: 30 }));
    };
  },
  // 18 "Thanks for the itchy sweater, Aunt Bea!"
  (S, cam) => {
    dining(S);
    const j = mk(S, SWEATER, 'juno', 'fakesmile', [-2.4, 0, 0.8], 25), b = mk(S, BEA, 'bea', 'grin', [2.4, 0, 0.6], -30);
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 4.8, 16.5], [0.1, 4.7, 15.0], [0, 3.8, 0.7], [0, 3.9, 0.7], 30);
      j.pose({ rFwd: 140 + Math.sin(t * 22) * 12, rUp: -25, lFwd: 15, lUp: 10, tilt: Math.sin(t * 9) * 4 });
      b.pose(addPose({ rFwd: 40, lFwd: 40, rUp: -15, lUp: -15 }, idle(t, 1.2)));
    };
  },
  // 19 "No cactus. She never knew."
  (S, cam) => {
    dining(S);
    const j = mk(S, SWEATER, 'juno', 'fakesmile', [-2.4, 0, 0.8], 25), b = mk(S, BEA, 'bea', 'grin', [2.4, 0, 0.6], -30);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) camPath(cam, p, [4.4, 1.4, 8.6], [4.3, 1.2, 7.9], [2.4, 0.6, 0.6], [2.4, 0.6, 0.6], 26);
      else close(cam, p, head(2.4, 0.6), { side: -1.4 });
      j.pose({ rFwd: 140 + Math.sin(t * 22) * 12, rUp: -25, lUp: 6 });
      b.pose(addPose({ rFwd: 60 + Math.sin(t * 14) * 12, lFwd: 60 + Math.sin(t * 14) * 12, rUp: -25, lUp: -25 }, { tilt: Math.sin(t * 4) * 6 }));
    };
  },
  // 20 "Thank you for the broccoli, Dad!"
  (S, cam) => {
    dining(S);
    const j = mk(S, JUNO, 'juno', 'fakesmile', [-1.6, 0, -6.0], 10), d = mk(S, DAD, 'dad', 'grin', [3.0, 0, -6.2], -20);
    const br = new THREE.Group(); const gm = std({ color: 0x3f8a32 });
    [[0, 0, 0, 0.3], [0.2, 0.15, 0, 0.22], [-0.2, 0.12, 0.05, 0.22], [0, 0.2, -0.15, 0.2]].forEach(([x, y, z, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), gm); s.position.set(x, y + 0.25, z); br.add(s); });
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), std({ color: 0x8ab04a })); br.add(st); S.add(br);
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 6.0, 7.5], [0.6, 5.6, 6.0], [0.6, 4.0, -6.0], [0.6, 4.1, -6.0], 30);
      j.pose(addPose({ rUp: 150 + Math.sin(t * 10) * 8, lUp: 6 }, { tilt: -6 })); const hp = hand(j, 'R'); br.position.set(hp.x, hp.y + 0.3, hp.z);
      d.pose(addPose(POSES.hips, idle(t, 1)));
    };
  },
  // 21 "No cactus. Total genius."
  (S, cam) => {
    dining(S);
    const j = mk(S, JUNO, 'juno', 'wink', [-1.6, 0, -6.0], 15);
    return (t, dur) => {
      close(cam, t / dur, head(-1.6, -6.0), { side: 1.0 });
      j.pose(track([[0, { rUp: 4, lUp: 4 }], [0.35, { rFwd: 150, rUp: -40, lUp: 4, tilt: -8 }]], t, snap)); j.setFace(t > 0.4 ? 'wink' : 'smirk');
    };
  },
  // 22 "But then came my birthday."
  (S, cam) => {
    dining(S);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.6), std({ map: T2.sign('HAPPY BIRTHDAY', '#e84a8a', '#fff6d0', '700 110px Inter') })); sign.position.set(1.5, 7.2, -8.75); S.add(sign);
    const bal = [[-6, 0xe8484f], [-4.8, 0x4a8ae8], [6, 0xf2c230], [7, 0x8ad04a]].map(([x, c], i) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14), std({ color: c, roughness: 0.3 })); b.scale.y = 1.2; b.position.y = 6; g.add(b);
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 5.2, 4), std({ color: 0xeeeeee })); s.position.y = 2.6; g.add(s); g.position.set(x, 0, -7 + i * 0.3); S.add(g); return g; });
    const j = mk(S, JUNO, 'juno', 'grin', [-1.0, 0, -6.4], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 5.6, 6.5], [0.2, 5.2, 5.0], [0, 4.4, -6.4], [0, 4.4, -6.4], 30);
      j.pose(addPose(POSES.armsup, { rUp: Math.sin(t * 12) * 12, lUp: Math.sin(t * 12) * 12 })); j.root.position.y = Math.abs(Math.sin(t * 7)) * 0.5;
      bal.forEach((g, i) => { g.rotation.z = Math.sin(t * 2 + i) * 0.06; });
    };
  },
  // 23 "Mom carried out a giant chocolate cake."
  (S, cam) => {
    dining(S);
    const m = mk(S, MOM, 'mom', 'grin', [8, 0, -6.4], -90); const ck = cake(S, [0, 0, 0], 1.0);
    return (t, dur) => {
      camPath(cam, t / dur, [-2.0, 4.8, 3.6], [-1.4, 4.7, 3.0], [6, 3.8, -6.4], [3.4, 3.8, -6.4], 30);
      m.root.position.x = 7.6 - ease(Math.min(1, t / dur)) * 4.2; m.pose(addPose(walk(t, 0.8, 22), { rFwd: 80, lFwd: 80, rUp: -18, lUp: -18 }));
      const a = hand(m, 'R'), b = hand(m, 'L'); ck.position.set((a.x + b.x) / 2 - 0.9, a.y - 0.5, (a.z + b.z) / 2);
    };
  },
  // 24 "Thank you, Mom! I love it!"
  (S, cam) => {
    dining(S); cake(S, [0.3, 2.78, -2.6], 1.0);
    const j = mk(S, JUNO, 'juno', 'grin', [-1.8, 0, -6.0], 20);
    return (t, dur) => {
      camPath(cam, t / dur, [-0.8, 5.4, 1.6], [-1.0, 5.2, 0.6], [-1.6, 4.2, -6], [-1.6, 4.4, -6], 34);
      j.pose(addPose(POSES.armsup, { rUp: Math.sin(t * 12) * 15, lUp: -Math.sin(t * 12) * 15, bob: Math.abs(Math.sin(t * 8)) * 0.12 }));
    };
  },
  // 25 "I meant it with my whole heart."
  (S, cam) => {
    dining(S);
    const j = mk(S, JUNO, 'juno', 'softsmile', [-1.8, 0, -6.0], 15);
    return (t, dur) => {
      close(cam, t / dur, head(-1.8, -6.0), { side: 0.8, dist: 6.2, lens: 40 });
      j.pose(addPose({ rFwd: 55, lFwd: 55, rUp: -38, lUp: -38 }, { tilt: 6 + Math.sin(t * 2) * 3, nod: -4 }));
    };
  },
  // 26 "Nothing grew."
  (S, cam) => {
    dining(S);
    const m = mk(S, MOM, 'mom', 'smile', [4.6, 0, -5.4], -30);
    return (t, dur) => {
      camPath(cam, t / dur, [5.2, 1.2, 1.2], [5.1, 1.0, 0.4], [4.6, 0.5, -5.4], [4.6, 0.5, -5.4], 30);
      m.pose(idle(t, 0.7));
    };
  },
  // 27 "Mom smiled. But she kept looking at the floor."
  (S, cam) => {
    dining(S);
    const m = mk(S, MOM, 'mom', 'fakesmile', [4.6, 0, -5.4], -30);
    return (t, dur) => {
      close(cam, t / dur, head(4.6, -5.4), { side: -1.6, dist: 5.8 });
      const d = ease(Math.min(1, Math.max(0, (t - 0.9) / 0.6)));
      m.pose({ nod: d * 30, turn: -d * 10, rUp: 4, lUp: 4, tilt: Math.sin(t * 2) * 2 }); m.setFace(t > 1.1 ? 'sad' : 'fakesmile');
    };
  },
  // 28 "Then my bike got a flat tire."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    bike(S, [8.6, 0, -1.0], { flat: true });
    const j = mk(S, JUNO, 'juno', 'shock', [4.6, 0, 1.8], 30);
    return (t, dur) => {
      camPath(cam, t / dur, [6.4, 4.2, 16.5], [6.2, 4.0, 15], [6.2, 2.6, 0.4], [6.2, 2.7, 0.4], 30);
      j.pose(addPose(POSES.shock, { tilt: Math.sin(t * 6) * 6 }));
    };
  },
  // 29 "The next morning, it was magically fixed."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0', sunPos: [10, 6, 12] });
    const bk = bike(S, [8.6, 0, -1.0]);
    const j = mk(S, JUNO, 'juno', 'awe', [4.6, 0, 1.8], 30);
    const spark = [0, 1, 2, 3, 4, 5].map(i => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), new THREE.MeshBasicMaterial({ color: 0xfff2a0 })); S.add(m); return m; });
    return (t, dur) => {
      camPath(cam, t / dur, [7.4, 3.4, 16], [6.8, 3.8, 15], [7.6, 1.5, -1.0], [6.2, 2.8, 0.4], 30);
      j.pose(addPose(POSES.armsup, { rUp: Math.sin(t * 10) * 12, lUp: -Math.sin(t * 10) * 12, bob: Math.abs(Math.sin(t * 6)) * 0.05 }));
      spark.forEach((m, i) => { const a = t * 2 + i; m.position.set(8.6 + Math.cos(a) * 1.9, 1.4 + Math.sin(a * 1.3) * 0.9, -1.0 + Math.sin(a) * 0.6); m.rotation.y = t * 4; m.scale.setScalar(0.6 + 0.4 * Math.sin(t * 9 + i)); });
    };
  },
  // 30 "Thanks, Dad!" Nothing grew. Dad looked confused.
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' });
    const j = mk(S, JUNO, 'juno', 'grin', [5.2, 0, 3.0], 60), d = mk(S, DAD, 'dad', 'smile', [9.4, 0, 2.8], -60);
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.45, 16), std({ color: 0xf2f2f2 })); S.add(mug);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.4]);
      if (k === 0) camPath(cam, p, [7.4, 4.5, 13], [7.3, 4.3, 11.8], [7.2, 3.4, 2.9], [7.2, 3.3, 2.9], 30);
      else if (p < 0.4) camPath(cam, p / 0.4, [9.6, 2.2, 7.2], [9.6, 2.0, 6.8], [9.4, 0.4, 2.9], [9.4, 0.4, 2.9], 30);
      else close(cam, (p - 0.4) / 0.6, head(9.4, 2.8), { side: -1.6 });
      j.pose(addPose(POSES.wave, { rUp: Math.sin(t * 11) * 14 }));
      d.pose(k === 0 ? addPose({ rFwd: 60, rUp: -10, lUp: 4 }, idle(t, 1)) : { rFwd: 60, rUp: -10, lUp: 40, lFwd: 20, nod: p < 0.4 ? 30 : 6, tilt: -14 });
      d.setFace(k === 0 ? 'smile' : 'worried');
      const hp = hand(d, 'R'); mug.position.set(hp.x, hp.y - 0.1, hp.z);
    };
  },
  // 31 "Soon, kids at school started whispering."
  (S, cam) => {
    hallway(S);
    const a = mk(S, KIDS[1], 'kidA', 'smirk', [-2.3, 0, -2.6], 40), b = mk(S, KIDS[3], 'kidB', 'shock', [2.3, 0, -2.6], -40);
    const j = mk(S, JUNO, 'juno', 'worried', [-8, 0, 2.2], 90);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.5, 4.6, 11], [0.5, 4.5, 10], [-1, 3.6, -1], [0.5, 3.6, -1], 30);
      a.pose({ rFwd: 125, rUp: -12, lean: 8, nod: 6, bodyTurn: 10, turn: 10 }); b.pose(addPose({ lean: 6, nod: 4, turn: -10 }, idle(t, 1)));
      j.root.position.x = -8 + t * 3.0; j.pose(walk(t, 0.8, 30));
    };
  },
  // 32 "Juno never says thank you."
  (S, cam) => {
    hallway(S);
    const a = mk(S, KIDS[1], 'kidA', 'smirk', [-2.3, 0, -2.6], 40), b = mk(S, KIDS[3], 'kidB', 'shock', [2.3, 0, -2.6], -40);
    return (t, dur) => {
      camPath(cam, t / dur, [0.0, 4.8, 9.0], [0.0, 4.7, 8.0], [0, 4.0, -2.6], [0, 4.1, -2.6], 26);
      a.pose({ rFwd: 125, rUp: -12, lean: 8, nod: 6 + Math.sin(t * 8) * 3, bodyTurn: 10, turn: 10 }); b.pose({ rUp: 4, lUp: 4, lean: 4, turn: -14, tilt: Math.sin(t * 3) * 4 });
    };
  },
  // 33 "But I did. Every single time."
  (S, cam) => {
    hallway(S);
    const j = mk(S, JUNO, 'juno', 'teary', [0, 0, 1.5], 0); fill(S, [0.5, 5.2, 6], 14);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) close(cam, p, head(0, 1.5), { side: 0.3, dist: 6.0, lens: 40 });
      else close(cam, p, head(0, 1.5), { side: 2.6, dist: 4.4, lens: 44 });
      j.pose(addPose({ rUp: 3, lUp: 3, rFwd: 10, lFwd: 10 }, { ...sob(t, 0.35), nod: 10 }));
    };
  },
  // 34 "Then Grandma said something weird."
  (S, cam) => {
    houseFront(S, { col: '#f0d2e2' });
    const bed = [...flowerBed(S, [-12, 2], [-0.6, 3], 50, { seed: 5, size: [0.9, 1.5] }), ...flowerBed(S, [-11, -10], [-5.5, -2.2], 3, { seed: 8, size: [1.4, 2.2], y: 0.6 })];
    const g = mk(S, GRAN, 'gran', 'smile', [-7.4, 0.6, -3.6], 35), j = mk(S, JUNO, 'juno', 'worried', [-2.8, 0.6, -3.2], -35);
    return (t, dur) => {
      camPath(cam, t / dur, [-5, 6.6, 11.5], [-5.1, 6.3, 10.2], [-5.1, 4.4, -3.4], [-5.1, 4.5, -3.4], 30);
      g.pose(addPose({ rFwd: 40, rUp: 15, lUp: 4 }, idle(t, 1))); j.pose(idle(t, 1, 2)); sway(bed, t);
    };
  },
  // 35 "Flowers don't disappear, sweetie. They go where they belong."
  (S, cam) => {
    houseFront(S, { col: '#f0d2e2' });
    const bed = flowerBed(S, [-12, 2], [-0.6, 3], 50, { seed: 5, size: [1.2, 2.2] });
    const g = mk(S, GRAN, 'gran', 'softsmile', [-7.4, 0.6, -3.6], 35), j = mk(S, JUNO, 'juno', 'worried', [-2.8, 0.6, -3.2], -35);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.6]);
      if (k === 0) close(cam, p, head(-7.4, -3.6, 5.24), { side: 3.0, dist: 4.8 });
      else close(cam, p, head(-2.8, -3.2, 5.24), { side: -3.0, dist: 4.8 });
      g.pose(addPose({ rFwd: 95, rUp: 10, lUp: 4 }, { tilt: Math.sin(t * 2) * 5, nod: Math.sin(t * 3) * 3 })); g.setFace(t > 1.2 ? 'smile' : 'softsmile');
      j.pose(addPose({ rUp: 4, lUp: 4 }, { tilt: 8 + Math.sin(t * 2) * 3 })); sway(bed, t);
    };
  },
  // 36 "So I went looking."
  (S, cam) => {
    homeStairs(S);
    const j = mk(S, JUNO, 'juno', 'determined', [2, 0, 0], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [2.6, 4.8, 6], [2.4, 4.6, 5.2], [2, 4.2, 0], [1.2, 4.0, -1], 34);
      const r = ease(Math.min(1, t / 0.5)); j.root.rotation.y = -r * 120 * D; j.root.position.x = 2 - Math.max(0, t - 0.4) * 2.5;
      j.pose(t < 0.4 ? { rUp: 20, lUp: 20, rFwd: -15, lFwd: -15 } : walk(t, 1));
    };
  },
  // 37 "A rose petal on the stairs."
  (S, cam) => {
    homeStairs(S);
    const pm = std({ color: 0xd82a3a, roughness: 0.5 });
    const petals = [[-6.6, 2.13, 1.0], [-7.2, 2.83, 0.0], [-6.5, 3.53, -1.0]].map(([x, y, z], i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), pm); m.scale.set(1, 0.22, 0.7); m.position.set(x, y, z); m.rotation.y = i; S.add(m); return m; });
    const j = mk(S, JUNO, 'juno', 'shock', [-2.5, 0, -1.8], -90);
    return (t, dur) => {
      camPath(cam, t / dur, [2.0, 4.6, 7.5], [1.4, 4.4, 6.8], [-5.0, 2.6, 0.6], [-5.4, 2.6, 0.2], 28);
      j.pose({ lean: 18, nod: 25, rFwd: 40, lUp: 6 });
    };
  },
  // 38 "Dirt on the hallway carpet."
  (S, cam) => {
    homeStairs(S);
    const dm = new THREE.MeshBasicMaterial({ color: 0x3a2412, transparent: true, opacity: 0.85, depthWrite: false });
    for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.32, 10), dm); f.rotation.x = -Math.PI / 2; f.scale.set(1, 1.5, 1); f.position.set(1.5 + (i % 2 ? 0.45 : -0.45), 0.05, 3.5 - i * 1.3); S.add(f); }
    const j = mk(S, JUNO, 'juno', 'determined', [1.5, 0, -5.0], 0); fill(S, [1.5, 5, 4], 8);
    return (t, dur) => {
      camPath(cam, t / dur, [3.0, 7.5, 9.5], [2.8, 7.0, 8.5], [1.5, 0.8, -1], [1.5, 1.0, -1.5], 30);
      j.root.position.z = -5.0 + t * 1.6; j.pose(addPose(walk(t, 0.7, 28), { nod: 25 }));
    };
  },
];
