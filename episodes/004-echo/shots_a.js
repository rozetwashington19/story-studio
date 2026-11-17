import * as THREE from 'three';
import { POSES, addPose, ease, snap, idle, walk, D, std, box, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn,
  street, dayLight, kitchen, field, kidRoomDay, houseFront, bird, lasagna, whistle, soundRings, monster } from '../../engine/kit.js';
import { TOBI, WREN, BRAM, DAD, DARA, KIDS, allowGround, mk, head, clamp01, ramp, faceCam, fill, blob, fluff, calm, giant, camp, pine } from './common.js';

// cupped-hands yell pose
const CUP = { rFwd: 118, lFwd: 118, rUp: -16, lUp: -16, nod: -14, lean: -4 };
const V = (a) => new THREE.Vector3(...a);
// monster pop-in: overshoot scale from 0
const pop = (m, k, s) => m.root.scale.setScalar(Math.max(0.001, s * (k <= 0 ? 0 : k >= 1 ? 1 : 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2))));

export const SHOTS_A = [
  // 1 "In this world,"  — a kid yells across the street; rings fly
  (S, cam) => {
    dayLight(S); street(S, { near: false });
    const k = mk(S, KIDS[0], 'k0', 'grin', [-2, 0, 2], 20);
    const r = soundRings(S);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 6.5, 22], [2, 5.4, 18], [-1, 4.5, -4], [-1, 4.2, -4], 24);
      k.pose(addPose(hit([[0, POSES.rest], [0.35, CUP]], t), { bob: Math.sin(t * 20) * 0.02 }));
      r.update(t, [-1.6, 4.3, 3.2], 20, ramp(t, 0.3, 0.6));
    };
  },
  // 2 "every echo comes back as a creature."  — monster pops up behind the kid, copies the pose
  (S, cam) => {
    dayLight(S); street(S, { near: false });
    const k = mk(S, KIDS[0], 'k0', 'grin', [-2.6, 0, 3], 15);
    const m = monster(S, { name: 'echo1', col: 0x6ad86a, belly: 0xd8f0a0, eyes: 2, horns: true, size: 1, seed: 2 }); m.root.position.set(2.6, 0, 0.5); m.root.rotation.y = -15 * D;
    const r = soundRings(S, { col: 0xd8ffd0 }); allowGround(S, 'echo1');
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [0, 4.8, 17], [0, 4.6, 15.5], [0, 3.2, 1], [0, 3.2, 1], 26);
      else faceCam(cam, p, [2.6, 3.4, 0.5], -15, { dist: 9, lens: 30, side: 0.6, look: -0.2 });
      const pk = ramp(t, 0.5, 0.95); pop(m, pk, 1); m.root.visible = pk > 0;
      m.look(k.root.position.clone().setY(4.6)); m.animate(t, pk > 0.9 ? 'wave' : 'bounce');
      k.pose(addPose(t < 0.6 ? CUP : hit([[0.6, CUP], [1.0, POSES.shock]], t), pk > 0 ? lookAt(k, [2.6, 3.5, 0.5]) : {})); k.setFace(pk > 0.5 ? 'shock' : 'grin');
      if (t > dur * 0.75) k.setFace('laugh');
      r.update(t, [2.6, 3.3, 1.6], 165, pk > 0 ? Math.max(0, 1 - ramp(t, 0.9, 1.6)) : 0);
    };
  },
  // 3 "You see, the louder you yell, the bigger it gets."  — whisper = tiny monster, shout = huge one
  (S, cam) => {
    dayLight(S); street(S, { near: false });
    const a = mk(S, KIDS[1], 'k1', 'smile', [-4.5, 0, 4], 10), b = mk(S, KIDS[0], 'k0', 'grin', [3.5, 0, 4], -10);
    const s1 = monster(S, { name: 'tiny', col: 0xf2c24a, eyes: 1, horns: false, teeth: false, size: 0.3, seed: 3 }); s1.root.position.set(-4.5, 0, 6.8);
    const s2 = monster(S, { name: 'big', col: 0xd84a6a, belly: 0xffc0c8, eyes: 3, horns: true, size: 2.1, seed: 5 }); s2.root.position.set(7.5, 0, -7.5);
    const rb = soundRings(S, { col: 0xffd0d8 }); allowGround(S, 'big', 'tiny');
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      if (c === 0) camPath(cam, p, [-4.2, 3.0, 13], [-4.3, 2.8, 12], [-4.4, 2.6, 4.5], [-4.4, 2.4, 5], 30);
      else camPath(cam, p, [2, 3.5, 22], [1.5, 4.5, 24], [4, 5, -3], [4, 6.5, -4], 26);
      a.pose(addPose({ rFwd: 125, rUp: -8, lUp: 4, nod: 22 }, idle(t, 0.5))); a.setFace(t > dur * 0.3 ? 'whisper' : 'smile');
      pop(s1, ramp(t, 0.4, 0.8), 0.3); s1.animate(t, 'bounce'); s1.look(V([-4.5, 4.6, 4]));
      const bt = t - dur * 0.5; b.pose(addPose(bt < 0 ? idle(t) : hit([[0, POSES.rest], [0.3, CUP]], bt), {}));
      b.setFace(bt > 0.3 ? 'shock' : 'grin'); if (bt > 1.0) b.setFace('nervous');
      const bk = ramp(bt, 0.3, 0.8); pop(s2, bk, 2.1); s2.root.visible = bk > 0; s2.animate(t, 'idle'); s2.look(V([3.5, 4.6, 4]));
      rb.update(t, [3.5, 4.4, 5], 0, bt > 0.2 && bt < 1.2 ? 1 : 0);
    };
  },
  // 4 "Dad yelled "Dinner!" across the house."
  (S, cam) => {
    kitchen(S);
    const d = mk(S, DAD, 'dad', 'grin', [-1.5, 0, 2.5], 35);
    const r = soundRings(S, { col: 0xffe8c0 });
    lasagna(S, [1.2, 2.78, -2.6]);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 4.8, 12.5], [2.5, 4.6, 11.2], [-1.3, 3.9, 2.5], [-1.3, 4.0, 2.5], 28);
      d.pose(addPose(hit([[0, { rUp: 4, lFwd: 20 }], [0.35, CUP], [dur, CUP]], t), addPose(anticipate(t, 0.35), { bob: Math.sin(t * 18) * 0.02 })));
      r.update(t, [-0.7, 4.3, 3.6], 35, ramp(t, 0.35, 0.6) * 0.8);
    };
  },
  // 5 "A hungry blob showed up and ate the lasagna."
  (S, cam) => {
    kitchen(S);
    const d = mk(S, DAD, 'dad', 'shock', [-4.2, 0, 1.8], 40);
    const L = lasagna(S, [1.6, 2.78, -3.95]);
    const b = blob(S); b.root.position.set(2.0, 0, -6.9);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      if (c === 0) camPath(cam, p, [-2, 6, 17], [-2.2, 5.6, 15.5], [-1.8, 3.4, -2], [-1.8, 3.4, -2], 26);
      else camPath(cam, p, [2.0, 6.0, 4.5], [1.9, 5.8, 3.8], [1.9, 3.3, -6], [1.9, 3.3, -6], 30);
      const arrive = ramp(t, 0.1, 0.6); pop(b, arrive, 1.25); b.root.visible = arrive > 0;
      b.animate(t, arrive < 1 ? 'bounce' : 'idle'); b.look(V([1.6, 3, -3.95]));
      const eat = ramp(t, dur * 0.5, dur * 0.85); L.userData.eat(eat); b.body.position.y += Math.abs(Math.sin(t * 12)) * 0.2 * (eat > 0 && eat < 1 ? 1 : 0);
      d.pose(addPose(hit([[0, POSES.rest], [0.5, POSES.shock]], t), lookAt(d, [0.4, 3, -1]))); if (eat >= 1) { d.setFace('angry'); }
    };
  },
  // 6 "Coach Dara blew her whistle at soccer practice."
  (S, cam) => {
    field(S);
    const c = mk(S, DARA, 'dara', 'determined', [0, 0, 2], 0);
    const w = whistle(S);
    const k1 = mk(S, KIDS[2], 'k2', 'smile', [-6, 0, -8], 90), k2 = mk(S, KIDS[3], 'k3', 'smile', [5, 0, -13], -90);
    const r = soundRings(S, { col: 0xfff6a0 });
    return (t, dur) => {
      faceCam(cam, t / dur, head(0, 2), 0, { dist: 12, lens: 28, side: 1.2, look: -0.9, push: 1.6 });
      const b = ramp(t, 0.4, 0.55);
      c.pose(addPose(hit([[0, { rUp: 4, lUp: 4 }], [0.45, { rFwd: 122, rUp: -6, lUp: 25, nod: -10, lean: -6 }]], t), { bob: b > 0 ? Math.sin(t * 25) * 0.02 : 0 }));
      c.armR.updateMatrixWorld(true); const hp = c.armR.localToWorld(new THREE.Vector3(0, -2.0, 0.1)); w.position.copy(hp);
      k1.root.position.x = -6 + t * 2.6; k1.pose(walk(t, 1.4)); k2.root.position.x = 5 - t * 2.2; k2.pose(walk(t + 0.4, 1.4));
      if (b > 0.5) { k1.setFace('shock'); k2.setFace('shock'); }
      r.update(t, [0.3, 4.4, 3.2], 20, b > 0 ? 0.4 : 0);
    };
  },
  // 7 "Now a squeaky little bird follows her everywhere."
  (S, cam) => {
    field(S);
    const c = mk(S, DARA, 'dara', 'bored', [-6, 0, 2], 90);
    const bd = bird(S, 0xf2d030); bd.scale.setScalar(1.6);
    return (t, dur) => {
      const x = -6 + t * 2.2; c.root.position.x = x; c.pose(addPose(walk(t, 1), lookAt(c, [x - 2, 6, 2.5])));
      const bx = x - 2.4 + Math.sin(t * 3) * 0.4, by = 5.6 + Math.sin(t * 5) * 0.4; bd.position.set(bx, by, 2.4); bd.rotation.y = 90 * D; bd.userData.flap(t);
      camPath(cam, 0, [x - 2.5, 4.6, 13 - t * 0.3], [0, 0, 0], [x - 1.2, 4.6, 2], [0, 0, 0], 30);
      if (t > dur * 0.6) c.setFace('pout');
    };
  },
  // 8 "I'm Tobi. I'm ten."
  (S, cam) => {
    kidRoomDay(S);
    const tb = mk(S, TOBI, 'tobi', 'grin', [0.5, 0, -2], 0);
    fill(S, [1.5, 5.5, 4], 5);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [1.2, 4.6, 11], [1.0, 4.4, 9.5], [0.5, 3.6, -2], [0.5, 3.6, -2], 28);
      else faceCam(cam, p, head(0.5, -2), 0, { dist: 6.6, lens: 36, side: 0.6 });
      tb.pose(addPose(hit([[0, POSES.rest], [0.4, POSES.wave], [dur * 0.5, POSES.wave], [dur * 0.5 + 0.3, { rUp: 25, lUp: 25, rFwd: 70, lFwd: 10, tilt: 6 }]], t), { rUp: t < dur * 0.5 ? Math.sin(t * 10) * 12 : 0, ...idle(t, 0.4) }));
      if (t > dur * 0.5) tb.setFace('proud');
    };
  },
  // 9 "And I'm the loudest kid in Maple Hollow. [pause]"
  (S, cam) => {
    dayLight(S); street(S, { near: false });
    const tb = mk(S, TOBI, 'tobi', 'grin', [0, 0, 2.5], 0);
    const n1 = mk(S, KIDS[1], 'k1', 'smile', [-6, 0, -1], 20), n2 = mk(S, KIDS[2], 'k2', 'smile', [6, 0, -1.5], -20);
    const r = soundRings(S, { col: 0xfff0b0, n: 6 });
    return (t, dur) => {
      const p = t / dur; const shake = t > 0.5 ? Math.sin(t * 45) * 0.06 : 0;
      camPath(cam, p, [0 + shake, 2.0, 12], [0 + shake, 2.6, 10], [0, 4.6, 2.5], [0, 4.6, 2.5], 26);
      tb.pose(addPose(hit([[0, POSES.rest], [0.5, { ...CUP, lean: -10, nod: -22 }]], t), addPose(anticipate(t, 0.5), { bob: t > 0.5 ? Math.sin(t * 22) * 0.03 : 0 })));
      tb.setFace(t > 0.5 ? 'laugh' : 'mischief');
      r.update(t, [0, 4.6, 3.6], 0, ramp(t, 0.5, 0.7));
      const sh = ramp(t, 0.7, 1.0);
      n1.pose(sh > 0 ? addPose(hit([[0.7, POSES.rest], [1.0, { rFwd: 125, lFwd: 125, rUp: 30, lUp: 30, nod: 8 }]], t), {}) : idle(t)); n1.setFace(sh > 0 ? 'scared' : 'smile');
      n2.pose(sh > 0 ? addPose(hit([[0.75, POSES.rest], [1.05, { rFwd: 125, lFwd: 125, rUp: 30, lUp: 30, tilt: -10 }]], t), {}) : idle(t, 1, 2)); n2.setFace(sh > 0 ? 'disgusted' : 'smile');
    };
  },
  // 10 "My echoes were awesome. Big, fluffy, and fast."
  (S, cam) => {
    houseFront(S, { col: '#e8e0f2' });
    const tb = mk(S, TOBI, 'tobi', 'delighted', [-3.4, 0, 4], 25);
    const f = fluff(S); f.root.position.set(2.4, 0, 3); f.root.rotation.y = -25 * D;
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [-0.5, 4.8, 18], [-0.5, 4.6, 16], [-0.5, 3.6, 3.5], [-0.5, 3.6, 3.5], 26);
      else camPath(cam, p, [-1, 4.2, 14], [-0.5, 4.0, 12.5], [0, 3.6, 3.5], [0, 3.6, 3.5], 28);
      f.animate(t, c === 0 ? 'bounce' : 'wave'); f.look(V([-3.4, 4.6, 4]));
      tb.pose(addPose(hit([[0, POSES.rest], [0.4, POSES.armsup], [1.0, { rUp: 60, lUp: 60, rFwd: 40 }]], t % 2.0), { bob: Math.abs(Math.sin(t * 6)) * 0.4 }));
      tb.root.position.y = Math.abs(Math.sin(t * 5)) * 0.5; Object.assign(tb.root.rotation, { y: 25 * D });
    };
  },
  // 11 "I rode one to school every morning."
  (S, cam) => {
    dayLight(S); street(S, { near: false });
    const f = fluff(S, 'fluff', 1.25); const tb = mk(S, TOBI, 'tobi', 'laugh', [0, 0, 0], 90);
    S.userData.allowContact.push(['tobi', 'fluff']);
    const k = mk(S, KIDS[3], 'k3', 'smile', [11, 0, 0.5], -60);
    return (t, dur) => {
      const x = -12 + t * 6.5; const hop = Math.abs(Math.sin(t * 4.2)) * 0.9;
      f.root.position.set(x, hop, 2.5); f.root.rotation.y = 90 * D; f.animate(t, 'chase'); f.look(V([x + 10, 3, 2.5]));
      tb.root.position.set(x - 0.2, 0, 2.5); sitOn(tb, 4.05 + hop + f.body.position.y * 1.25); tb.pose(addPose({ rLeg: 80, lLeg: 80, rLegOut: 25, lLegOut: 25, rUp: 140 + Math.sin(t * 9) * 15, lUp: 20 }, { tilt: Math.sin(t * 4.2) * 6 }));
      camPath(cam, t / dur, [x - 2, 6.5, 23], [x + 1, 7, 22], [x, 6.8, 2.5], [x + 1, 6.8, 2.5], 26);
      k.pose(lookAt(k, [x, 6, 2.5])); k.setFace(t > dur * 0.4 ? 'starstruck' : 'shock');
    };
  },
  // 12 "Then came the class camping trip."  — dusk arrival at the woods
  (S, cam) => {
    const env = camp(S, { fire: false });
    const tb = mk(S, TOBI, 'tobi', 'grin', [-2, 0, 9], 180), w = mk(S, WREN, 'wren', 'smile', [2.6, 0, 10], 180);
    const k = mk(S, KIDS[2], 'k2', 'smile', [-6.5, 0, 11], 180);
    return (t, dur) => {
      env.update(t);
      camPath(cam, t / dur, [0, 2.5, 24], [0, 5.5, 22], [0, 4, 6], [0, 5.2, -6], 24);
      tb.root.position.z = 9 - t * 1.6; w.root.position.z = 10 - t * 1.5; k.root.position.z = 11 - t * 1.4;
      tb.pose(addPose(walk(t, 1), { rFwd: 20 })); w.pose(walk(t + 0.3, 1)); k.pose(walk(t + 0.6, 1));
    };
  },
  // 13 "Mr. Bram gave us one rule."
  (S, cam) => {
    const env = camp(S, { frontTrees: true });
    const b = mk(S, BRAM, 'bram', 'determined', [0, 0, 5.8], 180);
    const tb = mk(S, TOBI, 'tobi', 'bored', [-2.2, 0, -2.2], 0), w = mk(S, WREN, 'wren', 'smile', [2.2, 0, -2.2], 0);
    sitOn(tb, 1.0); sitOn(w, 1.0);
    return (t, dur) => {
      env.update(t);
      camPath(cam, t / dur, [0.5, 6.8, -9.5], [0.2, 6.4, -8.5], [0, 4.4, 5.8], [0, 4.6, 5.8], 30);
      b.pose(addPose(hit([[0, POSES.rest], [0.5, { rFwd: 30, rUp: 150, lUp: 6, nod: 6 }]], t), talk(t, 0.5)));
      tb.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, lean: 6 }, { ...lookAt(tb, [0, 5, 5.8]) })); w.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30 }, lookAt(w, [0, 5, 5.8])));
    };
  },
  // 14 "Never yell in Echo Woods." [pause]
  (S, cam) => {
    const env = camp(S, { frontTrees: true });
    const b = mk(S, BRAM, 'bram', 'determined', [0, 0, 5.8], 180);
    return (t, dur) => {
      env.update(t);
      faceCam(cam, t / dur, head(0, 5.8), 180, { dist: 7, lens: 34, side: 0.8, push: 1.2 });
      b.pose(addPose(hit([[0, { rFwd: 30, rUp: 150 }], [0.6, { rFwd: 30, rUp: 150, nod: 10 }], [dur * 0.6, { rFwd: 30, rUp: 150 }], [dur * 0.6 + 0.4, { rFwd: 85, rUp: 10, bodyTurn: -20, turn: -25 }]], t), talk(t, t < dur * 0.6 ? 0.9 : 0.2)));
      if (t > dur * 0.6) b.setFace('worried');
    };
  },
  // 15 "That night, my friend Wren leaned over."
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'smile', [-2.2, 0, -2.2], 0), w = mk(S, WREN, 'wren', 'mischief', [2.2, 0, -2.2], 0);
    sitOn(tb, 1.0); sitOn(w, 1.0);
    return (t, dur) => {
      env.update(t);
      camPath(cam, t / dur, [0, 4.5, 13], [0, 4.0, 10.5], [0, 3.0, -2.2], [0, 3.1, -2.2], 28);
      const lean = ease(ramp(t, 0.4, 1.2));
      w.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 20, bodyTilt: 14 * lean, tilt: 12 * lean }, addPose(idle(t, 0.4), { turn: 35 * lean })));
      tb.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 45, lFwd: 45 }, idle(t, 0.4, 2))); if (lean > 0.7) tb.setFace('confused');
    };
  },
  // 16 "Bet you're too scared to yell," she whispered.
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'confused', [-2.2, 0, -2.2], 0), w = mk(S, WREN, 'wren', 'mischief', [2.2, 0, -2.2], 0);
    sitOn(tb, 1.0); sitOn(w, 1.0);
    return (t, dur) => {
      env.update(t);
      faceCam(cam, t / dur, [2.2, 3.1, -2.2], -15, { dist: 9.5, lens: 32, side: 0.8, look: -0.2 });
      w.pose(addPose({ rLeg: 90, lLeg: 90, lFwd: 110, lUp: -10, rFwd: 20, bodyTilt: 8, tilt: 6 }, addPose(talk(t, 0.6), { turn: 30 })));
      tb.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 45, lFwd: 45 }, idle(t, 0.4)));
    };
  },
  // 17 So I stood up and yelled, "Nothing scares me!"  — low angle triumph
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'determined', [-2.2, 0, -2.2], 0), w = mk(S, WREN, 'wren', 'mischief', [3.0, 0, -2.2], 0);
    sitOn(w, 1.0);
    const r = soundRings(S, { col: 0xfff0b0, n: 6 });
    return (t, dur) => {
      env.update(t);
      const up = ease(ramp(t, 0.3, 0.8)); tb.root.position.y = -0.5 * (1 - up);
      const [c, p] = seg(t, dur, [0.4]);
      if (c === 0) camPath(cam, p, [-1, 3.0, 10], [-1.2, 3.0, 9.5], [-1.5, 3.6, -2.2], [-1.8, 4.2, -2.2], 28);
      else camPath(cam, p, [-1.4, 1.4, 7.5], [-1.6, 1.2, 6.6], [-2.2, 5.2, -2.2], [-2.2, 5.3, -2.2], 26);
      tb.pose(addPose(t < 0.8 ? { rLeg: 90 * (1 - up), lLeg: 90 * (1 - up), lean: 10 * (1 - up) } : hit([[0.8, POSES.rest], [1.2, { ...CUP, lean: -12, nod: -25 }]], t), { bob: t > 1.2 ? Math.sin(t * 22) * 0.03 : 0 }));
      if (t > 1.2) tb.setFace('angry');
      w.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 125, lFwd: 125, rUp: 30, lUp: 30 }, lookAt(w, [-2.2, 6, -2.2]))); if (t > 1.3) w.setFace('shock');
      r.update(t, [-2.2, 4.6, -3.4], 180, ramp(t, 1.2, 1.4));
    };
  },
  // 18 "The woods went quiet. [pause]"  — wide over the kids into the dark trees
  (S, cam) => {
    const env = camp(S);
    const tb = mk(S, TOBI, 'tobi', 'worried', [-2.2, 0, -2.2], 0), w = mk(S, WREN, 'wren', 'worried', [2.2, 0, -2.2], 0);
    sitOn(w, 1.0);
    return (t, dur) => {
      env.update(t);
      camPath(cam, t / dur, [0, 7, 15], [0, 6.2, 12], [0, 3, -12], [0, 3.4, -14], 24);
      tb.pose(addPose({ rUp: 6, lUp: 6 }, lookAt(tb, [Math.sin(t * 0.8) * 8, 3, -14]))); w.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 60, lFwd: 60, lean: 6 }, lookAt(w, [-Math.sin(t * 0.7) * 6, 3, -14])));
    };
  },
  // 19 "Then two glowing eyes opened in the dark."
  (S, cam) => {
    const env = camp(S, { tents: true });
    const g = giant(S); g.root.position.set(0, 0, -15);
    const tb = mk(S, TOBI, 'tobi', 'worried', [-2.2, 0, -2.2], 0);
    return (t, dur) => {
      env.update(t);
      const [c, p] = seg(t, dur, [0.55]);
      if (c === 0) camPath(cam, p, [-0.6, 5.2, 4], [-0.8, 5.4, 2], [0, 6, -15], [0, 6.4, -15], 34);
      else faceCam(cam, p, head(-2.2, -2.2), 15, { dist: 6.4, lens: 36, side: 0.5 });
      const on = ramp(t, 0.4, 0.5); g.eyesOn(on); g.heavy(1 - ease(ramp(t, 0.4, 0.9))); g.animate(t, 'lurk'); g.look(V([-2.2, 4.6, -2.2]));
      tb.pose(addPose(c === 1 ? POSES.shock : { rUp: 6 }, { tilt: c === 1 ? Math.sin(t * 25) * 2 : 0 })); tb.setFace(c === 1 ? 'scared' : 'worried');
    };
  },
  // 20 "My echo was huge. Tree huge."  — tilt-up reveal
  (S, cam) => {
    const env = camp(S, { fire: true });
    const g = giant(S); g.root.position.set(0, 0, -13);
    fill(S, [0, 7, -6], 10, 0xb0c0ff, 18);
    return (t, dur) => {
      env.update(t); g.eyesOn(1); g.animate(t, 'lurk'); g.look(V([0, 3, 4]));
      camPath(cam, t / dur, [0, 1.5, 6], [0, 2.2, 5], [0, 2, -13], [0, 8.5, -13], 24);
    };
  },
  // 21 "And it was made of "Nothing scares me.""  — ROAR
  (S, cam) => {
    const env = camp(S);
    const g = giant(S); g.root.position.set(0, 0, -12);
    const tb = mk(S, TOBI, 'tobi', 'scared', [-3.2, 0, -2.2], 180), w = mk(S, WREN, 'wren', 'scared', [3.0, 0, -2.2], 180);
    sitOn(w, 1.0);
    const r = soundRings(S, { col: 0xffd040, n: 6 });
    fill(S, [0, 7, -6], 10, 0xb0c0ff, 18);
    return (t, dur) => {
      env.update(t);
      const roar = t > 0.5; g.eyesOn(1); g.animate(t, roar ? 'roar' : 'lurk'); g.look(V([0, 4, -2]));
      const sh = roar ? Math.sin(t * 50) * 0.08 : 0;
      camPath(cam, t / dur, [6 + sh, 3, 8], [5 + sh, 3.2, 6.5], [0, 5.5, -7], [0, 6, -8], 24);
      r.update(t, [0, 6.6, -9], 0, roar ? 1 : 0);
      tb.pose(addPose(roar ? hit([[0.5, POSES.rest], [0.8, { ...POSES.shock, lean: -10 }]], t) : idle(t), { tilt: roar ? Math.sin(t * 30) * 3 : 0 }));
      w.pose(addPose({ rLeg: 90, lLeg: 90 }, roar ? { rFwd: 120, lFwd: 120, rUp: 30, lUp: 30, lean: -10 } : { rFwd: 40, lFwd: 40 }));
    };
  },
];
