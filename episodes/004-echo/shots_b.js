import * as THREE from 'three';
import { POSES, addPose, ease, idle, walk, D, std, box, camPath, seg, hit, talk, lookAt, anticipate, sitOn,
  kitchen, bedroom, lasagna, soundRings, zzz, blanket, wisp } from '../../engine/kit.js';
import { TOBI, WREN, BRAM, DAD, KIDS, mk, head, clamp01, ramp, faceCam, fill, blob, calm, giant, camp } from './common.js';

const CUP = { rFwd: 118, lFwd: 118, rUp: -16, lUp: -16, nod: -14, lean: -4 };
const V = (a) => new THREE.Vector3(...a);
const run = (t, k = 1) => addPose(walk(t, 2.0 * k, 55), { lean: 12 });
const headPos = (g) => { g.root.updateMatrixWorld(true); return g.head.getWorldPosition(new THREE.Vector3()); };
const YAWN = { rUp: 165, lUp: 165, rFwd: 10, lFwd: 10, nod: -18, lean: -8 };
// giant curled up asleep at (x, z) under a blanket
function sleeper(S, x, z, { cover = 1 } = {}) {
  const g = giant(S); g.root.position.set(x, 0, z);
  const bl = blanket(S, { w: 8.5, d: 6.5 }); bl.position.set(x, 4.3, z + 1.6); bl.rotation.x = -0.55; bl.userData.cover(cover);
  const zz = zzz(S, { size: 1.3 });
  return { g, bl, zz, update(t, { k = 1, cov = cover, z: zon = 1 } = {}) { g.eyesOn(1); g.animate(t, 'lurk'); g.look(V([x, 0, z + 10])); g.sleep(k, t); g.heavy(1); bl.userData.cover(cov, t * 0.5);
    zz.update(t, [x + 1.2, 6.5, z + 2.2], zon); } };
}

export const SHOTS_B = [
  // 22 "It stomped toward our tents."  — low angle by the orange tent
  (S, cam) => {
    const env = camp(S);
    const g = giant(S); g.root.position.set(-1, 0, -17);
    fill(S, [-2, 8, -8], 10, 0xb0c0ff, 18);
    return (t, dur) => {
      env.update(t); g.eyesOn(1);
      g.root.position.z = -17 + t * 2.6; g.animate(t, 'stalk'); g.look(V([-6, 3, 4]));
      const st = Math.abs(Math.sin(t * 3.2)) > 0.97 ? Math.sin(t * 60) * 0.05 : 0;
      camPath(cam, t / dur, [-4.5, 1.0 + st, 1.5], [-4.0, 0.9 + st, 0.8], [-1, 6, -12], [-1, 6.6, -10], 24);
    };
  },
  // 23 "We ran. It followed."
  (S, cam) => {
    const env = camp(S);
    const g = giant(S); g.root.position.set(0, 0, -15);
    const tb = mk(S, TOBI, 'tobi', 'scared', [-3.2, 0, 0], 0), w = mk(S, WREN, 'wren', 'scared', [3.6, 0, -0.5], 0), k = mk(S, KIDS[2], 'k2', 'scared', [-6.5, 0, -3.5], 0);
    fill(S, [0, 7, 3], 8, 0xffc890);
    return (t, dur) => {
      env.update(t);
      tb.root.position.z = t * 4.4; w.root.position.z = -0.5 + t * 4.3; k.root.position.z = -3.5 + t * 4.1;
      tb.pose(addPose(run(t), { rFwd: 60, lFwd: -30 })); w.pose(run(t + 0.3)); k.pose(run(t + 0.6));
      g.root.position.z = -15 + t * 3.2; g.eyesOn(1); g.animate(t, 'lunge'); g.look(V([0, 4, t * 4.4]));
      const zc = t * 4.3; camPath(cam, t / dur, [0.5, 4.2, zc + 11], [0.5, 4.6, zc + 11.5], [0, 4.4, zc - 3], [0, 5.2, zc - 3], 26);
    };
  },
  // 24 Mr. Bram shouted, "Everyone stay calm!"  — not calm at all
  (S, cam) => {
    const env = camp(S);
    const b = mk(S, BRAM, 'bram', 'nervous', [1.5, 0, 6.5], -10);
    const r = soundRings(S, { col: 0xc8f0ff });
    return (t, dur) => {
      env.update(t);
      faceCam(cam, t / dur, head(1.5, 6.5), -10, { dist: 7.4, lens: 32, side: -0.8, push: 1.0 });
      b.pose(addPose(hit([[0, { rUp: 120, lUp: 120, rFwd: 30 }], [0.4, CUP]], t), addPose(anticipate(t, 0.4), { bob: Math.sin(t * 20) * 0.03, tilt: Math.sin(t * 9) * 3 })));
      if (t > dur * 0.7) b.setFace('scared');
      r.update(t, [1.0, 4.4, 7.6], -35, ramp(t, 0.4, 0.6) * 0.6);
    };
  },
  // 25 "That made another echo. It just sat there, very calm."
  (S, cam) => {
    const env = camp(S);
    const c = calm(S); c.root.position.set(1.5, 0, 6); c.root.rotation.y = -10 * D;
    const tb = mk(S, TOBI, 'tobi', 'scared', [-12, 0, 9.6], 90), w = mk(S, WREN, 'wren', 'scared', [-15, 0, 0], 90);
    return (t, dur) => {
      env.update(t);
      const pk = ramp(t, 0.2, 0.6); c.root.scale.setScalar(0.75 * (pk < 1 ? Math.max(0.001, 1 + 2.7 * Math.pow(pk - 1, 3) + 1.7 * Math.pow(pk - 1, 2)) : 1));
      c.animate(t * 0.4, 'idle'); c.blink(0.62); c.look(V([1.5, 3, 20])); c.body.rotation.z = Math.sin(t * 0.9) * 0.05;
      c.arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * 0.9; a.rotation.x = -0.6; });
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [1.5, 3.4, 15], [1.5, 3.2, 13.5], [1.5, 2.6, 6], [1.5, 2.6, 6], 30);
      else camPath(cam, p, [3.5, 3.2, 12], [3.0, 3.1, 11.2], [1.0, 2.6, 3], [1.0, 2.6, 3], 26);
      tb.root.position.x = -12 + t * 8; w.root.position.x = -15 + t * 8.2; tb.pose(run(t)); w.pose(run(t + 0.3));
    };
  },
  // 26 Wren grabbed my arm. "Tobi, do something!"
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'scared', [-1.4, 0, 6], 30), w = mk(S, WREN, 'wren', 'scared', [1.6, 0, 6.3], -50);
    S.userData.allowContact = [['tobi', 'wren']]; fill(S, [0, 5.5, 11], 8, 0xffc890);
    return (t, dur) => {
      env.update(t);
      camPath(cam, t / dur, [0.4, 5.0, 18], [0.3, 4.8, 16.5], [0, 4.0, 6], [0, 4.1, 6], 30);
      w.pose(addPose(hit([[0, { rUp: 10, lUp: 10 }], [0.4, { rFwd: 80, rUp: -12, lFwd: 70, lUp: -5, lean: 6 }]], t), addPose(talk(t, 1), { bob: Math.sin(t * 16) * 0.03 })));
      tb.pose(addPose({ rUp: 10, lUp: 30, lFwd: 20 }, { turn: 15, tilt: Math.sin(t * 20) * 2 }));
      if (t > dur * 0.6) tb.setFace('nervous');
    };
  },
  // 27 "Then I remembered. Echoes copy you. [pause]"
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'nervous', [0, 0, 6], 0);
    const g = giant(S); g.root.position.set(1.5, 0, -8);
    fill(S, [0.5, 5.2, 10], 6, 0xffc890);
    return (t, dur) => {
      env.update(t); g.eyesOn(1); g.animate(t, 'lurk'); g.look(V([0, 4.6, 6]));
      faceCam(cam, t / dur, head(0, 6), 0, { dist: 7.6, lens: 36, side: 0.5, push: 1.6 });
      tb.pose(addPose(hit([[0, { rUp: 8, lUp: 8 }], [dur * 0.35, { rFwd: 125, rUp: 15, lUp: 8, nod: -6, turn: 15 }], [dur * 0.7, { rUp: 12, lUp: 12, nod: 4 }]], t), idle(t, 0.5)));
      tb.setFace(t < dur * 0.3 ? 'nervous' : t < dur * 0.65 ? 'thinking' : 'determined');
    };
  },
  // 28 "So I stopped running."  — side dolly, skid to a stop
  (S, cam) => {
    const env = camp(S, { frontTrees: true });
    const tb = mk(S, TOBI, 'tobi', 'determined', [-3, 0, -2], 0), w = mk(S, WREN, 'wren', 'scared', [-7, 0, 0], 0);
    return (t, dur) => {
      env.update(t);
      const st = ease(ramp(t, 0.2, 0.9)); const z = -0.5 + t * 4.4 * (1 - st) + st * 3.2;
      tb.root.position.z = Math.min(z, 4.2 + (t > 0.9 ? 0 : 0)); tb.pose(st < 1 ? addPose(run(t, 1 - st), { lean: -14 * st, rLeg: 20 * st, lLeg: -15 * st }) : addPose(idle(t, 0.6), { rUp: 15, lUp: 15 }));
      w.root.position.z = 0 + t * 4.6; w.pose(run(t + 0.3));
      camPath(cam, t / dur, [11, 4.2, 1], [10, 4.2, 4], [-3, 3.4, 1.5], [-3, 3.4, 4], 26);
    };
  },
  // 29 "I turned around."
  (S, cam) => {
    const env = camp(S, { frontTrees: true });
    const tb = mk(S, TOBI, 'tobi', 'determined', [0, 0, 6], 0);
    const g = giant(S); g.root.position.set(0, 0, -9);
    fill(S, [4, 5, 10], 7, 0xffc890);
    return (t, dur) => {
      env.update(t); g.eyesOn(1); g.animate(t, 'stalk'); g.root.position.z = -9 + t * 0.8; g.look(V([0, 4.6, 6]));
      const turn = hit([[0, { y: 0 }], [0.3, { y: 0 }], [0.9, { y: 180 }]], t).y ?? 0; tb.root.rotation.y = turn * D;
      tb.pose(addPose(anticipate(t, 0.3), { rUp: 12, lUp: 12, ...idle(t, 0.5) }));
      camPath(cam, t / dur, [7.5, 2.4, 12.5], [6.5, 2.2, 11.5], [0, 4.6, 4], [0, 5.6, 1], 28);
    };
  },
  // 30 "And I yawned the biggest yawn of my life. [pause]"
  (S, cam) => {
    const env = camp(S, { frontTrees: true });
    const tb = mk(S, TOBI, 'tobi', 'determined', [0, 0, 6], 180);
    fill(S, [0.5, 5.5, 1], 8, 0xffc890);
    return (t, dur) => {
      env.update(t);
      faceCam(cam, t / dur, head(0, 6), 180, { dist: 7.4, lens: 34, side: 0.4, push: 1.4 });
      tb.pose(addPose(hit([[0, { rUp: 12, lUp: 12 }], [0.3, { rUp: 12, lUp: 12, nod: 6 }], [1.0, YAWN], [dur * 0.75, YAWN], [dur * 0.95, { rUp: 20, lUp: 20, nod: 6 }]], t), { bob: Math.sin(t * 2) * 0.02 }));
      tb.setFace(t < 0.5 ? 'determined' : t < dur * 0.78 ? 'yawn' : 'sleepy');
    };
  },
  // 31 "The giant echo yawned too."
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'sleepy', [-1.8, 0, 6], 180);
    const g = giant(S); g.root.position.set(1, 0, -8);
    fill(S, [1, 9, -2], 10, 0xb0c0ff, 18);
    return (t, dur) => {
      env.update(t); g.eyesOn(1);
      const y = t > 0.4; g.animate(t * (y ? 0.25 : 1), y ? 'roar' : 'lurk'); g.heavy(ramp(t, 0.6, dur) * 0.5); g.look(V([-1.8, 4.6, 6]));
      tb.pose(addPose({ rUp: 30, lUp: 20, nod: -8 }, idle(t, 0.5)));
      camPath(cam, t / dur, [6, 3.2, 14], [5.5, 3.8, 13], [0.5, 7, -6], [0.8, 7.6, -7], 26);
    };
  },
  // 32 "Its glowing eyes got heavy."
  (S, cam) => {
    const env = camp(S);
    const g = giant(S); g.root.position.set(0, 0, -8);
    fill(S, [0, 9, -2], 10, 0xb0c0ff, 18);
    return (t, dur) => {
      env.update(t); g.eyesOn(1); g.animate(t * 0.3, 'lurk'); g.look(V([0, 4, 8]));
      const k = ramp(t, 0.2, dur * 0.9); g.heavy(0.45 + 0.5 * k - (Math.sin(t * 3) > 0.9 ? 0.4 : 0) * (1 - k));
      g.joints.neck.rotation.x = 0.1 + k * 0.3;
      const h = headPos(g); camPath(cam, t / dur, [h.x + 1, h.y - 0.5, h.z + 9], [h.x + 0.8, h.y - 0.3, h.z + 7.5], [h.x, h.y, h.z], [h.x, h.y - 0.2, h.z], 36);
    };
  },
  // 33 "It curled up between the trees."
  (S, cam) => {
    const env = camp(S);
    const g = giant(S); g.root.position.set(0, 0, -9);
    const tb = mk(S, TOBI, 'tobi', 'awe', [-4.6, 0, 6], 170), w = mk(S, WREN, 'wren', 'awe', [4.6, 0, 6.5], 195);
    fill(S, [0, 9, -3], 10, 0xb0c0ff, 18);
    return (t, dur) => {
      env.update(t); g.eyesOn(1); g.animate(t * 0.3, 'lurk'); g.heavy(0.95); g.look(V([0, 0, 0]));
      g.sleep(ease(ramp(t, 0.2, dur * 0.85)), t);
      tb.pose(idle(t, 0.5)); w.pose(addPose({ rFwd: 125, lFwd: 20 }, idle(t, 0.5, 2)));
      camPath(cam, t / dur, [2, 8, 19], [1, 7, 18], [0, 4, -6], [0, 3, -7], 24);
    };
  },
  // 34 "And it started to snore."
  (S, cam) => {
    const env = camp(S);
    const sl = sleeper(S, 0, -9, { cover: 0 });
    const tb = mk(S, TOBI, 'tobi', 'relieved', [-4.6, 0, 4.5], 160), w = mk(S, WREN, 'wren', 'laugh', [4.6, 0, 4.8], 200);
    fill(S, [0, 9, -3], 10, 0xb0c0ff, 18);
    return (t, dur) => {
      env.update(t); sl.update(t, { cov: 0, z: ramp(t, 0.3, 0.8) });
      tb.pose(addPose({ rUp: 14, lUp: 14 }, idle(t, 0.5))); w.pose(addPose({ rFwd: 125, lFwd: 110, rUp: 10, lUp: 10, nod: 8 }, { bob: Math.abs(Math.sin(t * 8)) * 0.04 }));
      camPath(cam, t / dur, [0.5, 6.5, 16], [0.3, 6.0, 14], [0, 4, -7], [0, 4.2, -7], 26);
    };
  },
  // 35 Then I whispered, "Goodnight."
  (S, cam) => {
    const env = camp(S, { frontTrees: true });
    const tb = mk(S, TOBI, 'tobi', 'smile', [0, 0, 5], 180);
    fill(S, [0.4, 5.2, 0], 7, 0xffc890);
    return (t, dur) => {
      env.update(t);
      faceCam(cam, t / dur, head(0, 5), 180, { dist: 6.6, lens: 36, side: -0.5, push: 1.2 });
      tb.pose(addPose(hit([[0, { rUp: 10, lUp: 10 }], [0.5, { rFwd: 122, rUp: -14, lUp: 10, nod: 4, lean: 6 }]], t), idle(t, 0.4)));
      tb.setFace(t > 0.5 && t < dur * 0.8 ? 'whisper' : 'smile');
    };
  },
  // 36 "A tiny glowing echo floated up and tucked it in."
  (S, cam) => {
    const env = camp(S);
    const sl = sleeper(S, 0, -9, { cover: 0 });
    const tb = mk(S, TOBI, 'tobi', 'awe', [-4.5, 0, 5], 160);
    const wp = wisp(S, { size: 0.9 });
    return (t, dur) => {
      env.update(t);
      const u = ease(ramp(t, 0.2, dur * 0.55)); const cov = ease(ramp(t, dur * 0.5, dur * 0.95));
      sl.update(t, { cov });
      const a = V([-4.0, 4.3, 3.6]), b = V([0, 8.8, -6.0]);
      wp.position.copy(a.lerp(b, u)); wp.position.y += Math.sin(u * Math.PI) * 2.5 + Math.sin(t * 4) * 0.15; wp.userData.update(t, cov > 0.95 ? 1 : 0);
      if (cov > 0) { wp.position.set(Math.sin(cov * Math.PI) * 2.8, 8.4 - cov * 1.5, -6 - cov * 1.0); }
      tb.pose(addPose({ rFwd: 40, lFwd: 40 }, lookAt(tb, [wp.position.x, wp.position.y, wp.position.z])));
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) camPath(cam, p, [-6.5, 4.8, 13], [-6, 5.5, 11.5], [-1, 5, 2], [-0.5, 6.5, -2], 28);
      else camPath(cam, p, [9, 7, 6], [8, 6.6, 5], [0, 5, -7], [0, 5, -7.5], 26);
    };
  },
  // 37 Wren stared at me. "Were you scared?"
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'smile', [-2.1, 0, 6.5], 60), w = mk(S, WREN, 'wren', 'thinking', [2.1, 0, 6.5], -60);
    fill(S, [-2, 5.5, 11], 9, 0xffb878);
    return (t, dur) => {
      env.update(t);
      faceCam(cam, t / dur, head(2.1, 6.5), -60, { dist: 7.4, lens: 32, side: 1.6, push: 0.9 });
      w.pose(addPose(hit([[0, { rUp: 25, lUp: 25, rFwd: -8, lFwd: -8 }], [0.5, { rUp: 25, lUp: 25, rFwd: -8, lFwd: -8, tilt: 12 }]], t), talk(t, 0.7)));
      tb.pose(idle(t, 0.5));
    };
  },
  // 38 "Terrified," I admitted.
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'nervous', [-2.1, 0, 6.5], 60), w = mk(S, WREN, 'wren', 'thinking', [2.1, 0, 6.5], -60);
    fill(S, [2.5, 5.5, 10], 10, 0xffb878);
    return (t, dur) => {
      env.update(t);
      faceCam(cam, t / dur, head(-2.1, 6.5), 60, { dist: 6.8, lens: 34, side: -1.4, push: 0.8 });
      tb.pose(addPose(hit([[0, POSES.rest], [0.4, { rFwd: 60, rUp: 20, lUp: 10, nod: 6 }], [dur * 0.6, { ...POSES.shrug }]], t), talk(t, t < dur * 0.6 ? 0.6 : 0.2)));
      tb.setFace(t < dur * 0.55 ? 'nervous' : 'laugh'); w.pose(idle(t, 0.5)); if (t > dur * 0.55) w.setFace('laugh');
    };
  },
  // 39 "Turns out brave doesn't mean loud. [pause]"  — crane pull-back over the camp
  (S, cam) => {
    const env = camp(S);
    const sl = sleeper(S, 0, -11, { cover: 1 });
    const tb = mk(S, TOBI, 'tobi', 'softsmile', [-2.2, 0, -2.2], 0), w = mk(S, WREN, 'wren', 'smile', [2.2, 0, -2.2], 0);
    sitOn(tb, 1.0); sitOn(w, 1.0);
    const wp = wisp(S, { size: 0.7 });
    return (t, dur) => {
      env.update(t); sl.update(t, { cov: 1 });
      wp.position.set(Math.sin(t * 0.8) * 2.5, 8 + Math.sin(t * 1.3) * 0.4, -9 + Math.cos(t * 0.8) * 1.5); wp.userData.update(t);
      tb.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, tilt: 8 }, idle(t, 0.5))); w.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 30, tilt: -8 }, idle(t, 0.5, 2)));
      camPath(cam, t / dur, [0, 4.0, 10], [0, 9.5, 19], [0, 3.4, -2], [0, 4.5, -6], 26, 24);
    };
  },
  // 40 Dad still yells "Dinner!" every night.
  (S, cam) => {
    kitchen(S);
    const d = mk(S, DAD, 'dad', 'grin', [-2, 0, 3], 0);
    const r = soundRings(S, { col: 0xffe8c0 });
    lasagna(S, [0.8, 2.78, -2.6]);
    return (t, dur) => {
      camPath(cam, t / dur, [-0.5, 4.4, 15], [-0.8, 4.4, 13.5], [-2, 3.8, 3], [-2, 4.0, 3], 28);
      d.pose(addPose(hit([[0, { rUp: 4, lUp: 4 }], [0.35, CUP]], t), addPose(anticipate(t, 0.35), { bob: Math.sin(t * 18) * 0.02 })));
      r.update(t, [-1.4, 4.3, 4.0], 40, ramp(t, 0.35, 0.6) * 0.7);
    };
  },
  // 41 "The blob still eats the lasagna."
  (S, cam) => {
    kitchen(S);
    const d = mk(S, DAD, 'dad', 'smirk', [-5.2, 0, 1.6], 50);
    const L = lasagna(S, [1.6, 2.78, -3.95]);
    const b = blob(S); b.root.position.set(2.0, 0, -6.9);
    return (t, dur) => {
      camPath(cam, t / dur, [2.0, 5.2, 11], [1.7, 5.0, 10], [-0.4, 3.4, -3.5], [-0.2, 3.4, -3.5], 28);
      const eat = ramp(t, 0.2, dur * 0.7); L.userData.eat(eat); b.animate(t, 'idle'); b.look(V([1.6, 3, -3.95]));
      b.body.position.y += Math.abs(Math.sin(t * 12)) * 0.2 * (eat < 1 ? 1 : 0);
      if (eat >= 1) { b.animate(t, 'bounce'); b.look(V([-5.2, 4.6, 1.6])); }
      d.pose(addPose(hit([[0, POSES.rest], [0.5, POSES.shrug]], t), lookAt(d, [0.6, 3, 1.4])));
    };
  },
  // 42 "But me? I just whisper now. [pause]"  — bedroom, the wisp at his hand
  (S, cam) => {
    bedroom(S);
    const tb = mk(S, TOBI, 'tobi', 'smile', [-2.6, 0, -2.6], 90); sitOn(tb, 1.9);
    S.userData.allowContact = [['tobi', 'box*']];
    const wp = wisp(S, { size: 0.42, light: 3 });
    fill(S, [2, 5.5, -3.5], 9, 0xffc890);
    return (t, dur) => {
      wp.position.set(-0.9 + Math.sin(t * 1.2) * 0.15, 5.2 + Math.sin(t * 2) * 0.15, -3.7); wp.userData.update(t, t > dur * 0.55 ? 1 : 0);
      tb.pose(addPose(hit([[0, { rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30 }], [0.6, { rLeg: 90, lLeg: 90, rFwd: 60, lFwd: 30, nod: 6 }], [dur * 0.25, { rLeg: 90, lLeg: 90, rFwd: 122, rUp: -14, lFwd: 30 }], [dur * 0.55, { rLeg: 90, lLeg: 90, rFwd: 60, lFwd: 30, nod: 6 }]], t), idle(t, 0.4)));
      tb.setFace(t > dur * 0.25 && t < dur * 0.55 ? 'whisper' : t > dur * 0.55 ? 'delighted' : 'smile');
      faceCam(cam, t / dur, [-2.6, 1.9 + 3.1, -2.6], 90, { dist: 8.2, lens: 32, side: 1.4, push: 1.6, look: -0.6 });
    };
  },
];
