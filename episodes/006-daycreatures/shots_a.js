import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn, pinky,
  fernway, cornfield, bedroomDay, nightClass, lawnChair, lantern, bird, sunDisc } from '../../engine/kit.js';
import { IVY, IVY_BED, PIP, RUE, PIKE, FARMER, KIDS, mk, pip, head, clamp01, ramp, V, faceCam, fill, husk, scarecrow, lie, sitUp, RUN, allowGround } from './common.js';

const HH = 8.9;   // husk head height (size 1)
// a lantern carried in the right hand
const carry = (g, A) => { const p = pinky(A, 'R'); g.position.set(p.x, p.y - 0.75, p.z); };
// big low moon for the night sky
const bigMoon = (S, pos, r = 7) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), new THREE.MeshBasicMaterial({ color: 0xfff2d0, fog: false })); m.position.set(...pos); S.add(m);
  return m; };
// two kids asleep in their beds (day bedroom)
function sleepers(S, env, { pipIn = true } = {}) {
  const ivy = mk(S, IVY_BED, 'ivy', 'sleeping', [0, 0, 0]); lie(ivy, -5, -7.0);
  const p = pipIn ? pip(S, 'sleeping', [0, 0, 0], 0, false) : null; if (p) lie(p, 4.5, -7.0, 1.7, 0.74);
  env.blankets.forEach((b, i) => { b.position.y = i ? 2.4 : 2.72; b.position.z = i ? -3.4 : -4.0; if (i === 1 && !pipIn) { b.position.set(5.6, 1.85, -2.9); b.rotation.set(0.1, 0.5, 0.15); } });
  S.userData.allowContact = [['ivy', 'ivybed*'], ['pip', 'pipbed*']];
  return { ivy, p };
}

export const SHOTS_A = [
  // 2 "Every morning, the creatures wake up."  — dawn over the corn; a husk stands dead still in the rows... the first ray hits it and its eyes snap on
  (S, cam) => {
    const env = cornfield(S, { dawn: true });
    const h = husk(S, 'husk'); h.root.position.set(0, 0, -13);
    return (t, dur) => {
      const tw = dur * 0.5, awake = t > tw;
      camPath(cam, t / dur, [0.6, 2.2, 9], [0.2, 3.2, 4.5], [0, 5.5, -13], [0, 7.6, -13], 24, 30);
      h.move(awake ? t - tw : 0, 'lurk', awake ? null : 0); if (!awake) { h.head.rotation.x = 0.55; h.head.rotation.z = 0.3; }
      else { h.look(cam.position); const k = clamp01((t - tw) / 0.35); h.head.rotation.x = h.head.rotation.x * k + 0.55 * (1 - k); }
      h.freeze(awake ? 0 : 1); env.update(t, awake ? 0.3 : 0);
    };
  },
  // 3 "The sun hits them, and they walk out of the corn. [pause]"  — three husks step over the fence onto the empty, sun-baked street; long shadows
  (S, cam) => {
    const env = fernway(S, { sunPos: [20, 9, -2] });
    const H = [[9, -14, 0], [12.1, -19, 0.6], [15.0, -16, 1.2]].map(([x, z, ph], i) => { const c = husk(S, 'husk' + i, { seed: i + 2 }); c.root.position.set(x, 0, z); c.ph = ph; c.z0 = z; return c; });
    return (t, dur) => {
      camPath(cam, t / dur, [1.5, 2.0, 15], [3.0, 2.6, 12], [9, 5.5, -8], [10, 5.0, -5], 26);
      H.forEach(c => { c.root.position.z = c.z0 + Math.max(0, t - c.ph * 0.4) * 2.6; c.move(t + c.ph, 'stalk'); c.look(V([2, 4, 6])); });
      env.update(t);
    };
  },
  // 4 "So in Fernway, we live at night."  — crane down into the glowing night street: string lights, the moon balloon, kids playing tag
  (S, cam) => {
    const env = fernway(S, { night: true });
    const f = mk(S, FARMER, 'farmer', 'smile', [-17, 0, 2.6], 90); const ln = lantern(S, [0, 0, 0], { intensity: 5 });
    const k0 = mk(S, KIDS[0], 'k0', 'laugh', [8, 0, 1], 0), k1 = mk(S, KIDS[1], 'k1', 'grin', [8, 0, 1], 0);
    const ivy = mk(S, IVY, 'ivy', 'smile', [-3.5, 0, 3.4], 20), p = pip(S, 'delighted', [0.6, 0, 3.8], -15, false);
    return (t, dur) => {
      camPath(cam, t / dur, [-4, 15, 30], [-2.5, 5.5, 19], [-5, 7, -8], [-3, 4.2, -2], 24, 26);
      f.root.position.x = -17 + t * 2.2; f.pose(addPose(walk(t, 0.9, 28), { rFwd: 30, rUp: 8 })); carry(ln, f);
      [k0, k1].forEach((k, i) => { const a = t * 1.6 + i * Math.PI; k.root.position.set(8.5 + Math.cos(a) * 3.1, 0, 0.8 + Math.sin(a) * 2.2); k.root.rotation.y = -a; k.pose(RUN(t + i, 0.8)); });
      ivy.pose(addPose(idle(t, 0.8), addPose(lookAt(ivy, [-2.5, 14, -11.5]), { rFwd: 18 }))); p.pose(addPose(idle(t, 1, 2), addPose(lookAt(p, [-2.5, 14, -11.5]), hit([[0, POSES.rest], [0.8, { rUp: 140, lUp: 20 }]], t))));
      env.update(t);
    };
  },
  // 5 "The Moon Fair balloon lights up the square."  — low angle tilt from the kids' faces up to the glowing balloon
  (S, cam) => {
    const env = fernway(S, { night: true });
    const ivy = mk(S, IVY, 'ivy', 'awe', [-4.6, 0, 2.6], 160), p = pip(S, 'delighted', [-0.4, 0, 2.2], 200, false);
    fill(S, [-2, 5, 7], 8, 0xffd8a0);
    return (t, dur) => {
      camPath(cam, t / dur, [1.0, 3.4, 13.5], [0.6, 2.2, 12.2], [-2.0, 4.0, 1], [-2.6, 12.5, -11], 24);
      const B = env.balloon.position.clone().setY(env.balloon.position.y + 6);
      ivy.pose(addPose(idle(t, 0.6), lookAt(ivy, B))); p.pose(addPose(addPose(idle(t, 1, 1), lookAt(p, B)), hit([[0.5, POSES.rest], [1.0, { rUp: 150, lUp: 150 }], [1.6, { rUp: 120, lUp: 130 }]], t)));
      if (t > 1.0) p.setFace('starstruck');
      env.update(t);
    };
  },
  // 6 "We sleep all day behind boarded windows."  — slits of hard sunlight cut across the dark room; both kids asleep
  (S, cam) => {
    const env = bedroomDay(S);
    const { ivy, p } = sleepers(S, env); fill(S, [-3, 6.5, -4], 5, 0xffe0b0, 9);
    return (t, dur) => {
      camPath(cam, t / dur, [1.2, 8.4, -1.0], [-1.0, 7.6, -2.6], [-1, 5.2, -8.5], [-5, 2.6, -6.4], 26, 30);
      ivy.root.position.y = 2.2 + Math.sin(t * 2.2) * 0.03; p.root.position.y = 2.07 + Math.sin(t * 2.6 + 1) * 0.02;
      ivy.pose({ nod: Math.sin(t * 0.8) * 3, turn: 18 }); p.pose({ turn: -20, rUp: 6 });
      env.update(t);
    };
  },
  // 7 "Grandma Rue tans under the full moon."  — she lounges on a lawn chair, sunglasses on, a giant full moon rising behind her
  (S, cam) => {
    const env = fernway(S, { night: true, balloon: false });
    S.userData.moon && (S.userData.moon.visible = false); bigMoon(S, [-70, 22, -38], 7);
    lawnChair(S, [4, 4], 60); const r = mk(S, RUE, 'rue', 'sleepy', [3.48, 0, 3.7], 60); sitOn(r, 1.1);
    S.userData.allowContact = [['rue', 'chair']];
    const key = new THREE.SpotLight(0xd8e4ff, 90, 30, 0.5, 0.6, 1.4); key.position.set(12, 10, 10); key.target.position.set(3.5, 2.6, 3.7); S.add(key, key.target);
    return (t, dur) => {
      camPath(cam, t / dur, [13.5, 3.2, 10.6], [12.0, 3.0, 9.8], [3.0, 3.4, 3.0], [3.2, 3.6, 3.2], 26, 28);
      r.pose(addPose({ rLeg: 80, lLeg: 80, lean: -40, rUp: 115, lUp: 115, rFwd: -30, lFwd: -30, nod: -14 }, { bob: Math.sin(t * 1.4) * 0.02, tilt: Math.sin(t * 0.9) * 3 }));
      env.update(t);
    };
  },
  // 8 "She says she's working on her moon tan."  — front close-up: moonlight key on her smug face, she lifts her sunglasses... and lowers them again
  (S, cam) => {
    const env = fernway(S, { night: true, balloon: false });
    const ch = lawnChair(S, [4, 4], 0); const r = mk(S, RUE, 'rue', 'smirk', [4, 0, 3.4], 0); sitOn(r, 1.1);
    S.userData.allowContact = [['rue', 'chair']];
    const key = new THREE.SpotLight(0xd8e4ff, 120, 30, 0.45, 0.6, 1.4); key.position.set(4, 12, 14); key.target.position.set(4, 3.6, 3.4); S.add(key, key.target);
    return (t, dur) => {
      const h = [4, 3.9, 2.4];
      camPath(cam, t / dur, [5.2, 6.0, 10.6], [4.8, 5.6, 9.4], [4, 4.0, 1.9], [4, 4.1, 1.8], 34, 38);
      r.pose(addPose(hit([[0, { rLeg: 80, lLeg: 80, lean: -40, rUp: 20, lUp: 20 }], [0.5, { rLeg: 80, lLeg: 80, lean: -36, rUp: 8, rFwd: 120, lUp: 20, nod: -8 }],
        [dur - 0.7, { rLeg: 80, lLeg: 80, lean: -36, rUp: 8, rFwd: 120, lUp: 20, nod: -8 }], [dur - 0.2, { rLeg: 80, lLeg: 80, lean: -42, rUp: 110, lUp: 110, rFwd: -30, lFwd: -30, nod: -14 }]], t), talk(t, 0.4)));
      if (t > 0.6 && t < dur - 0.6) r.setFace('wink'); else r.setFace('smirk');
      env.update(t);
    };
  },
  // 9 "School starts at nine. At night."  — night classroom: the clock reads nine, the moon outside, sleepy kids at their desks
  (S, cam) => {
    const env = nightClass(S);
    const pk = mk(S, PIKE, 'pike', 'smile', [3.2, 0, -6.4], -10);
    const k0 = mk(S, KIDS[0], 'k0', 'sleepy', [-1.8, 0, 6.5], 180), k1 = mk(S, KIDS[2], 'k2', 'bored', [2.6, 0, 6.5], 180);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 5.6, 12.5], [0.5, 5.3, 11.2], [2, 5.0, -7], [1.8, 4.8, -7], 24, 26);
      pk.pose(addPose(hit([[0, POSES.rest], [0.6, { rUp: 100, rFwd: 40, turn: -40 }], [1.6, { rUp: 95, rFwd: 45, turn: -45 }], [2.0, { rUp: 10, turn: 10 }]], t), idle(t, 0.6)));
      k0.pose(addPose(idle(t, 0.5), { nod: 18 + Math.sin(t * 1.5) * 6, lFwd: 40, rFwd: 40 })); k1.pose(addPose(idle(t, 0.5, 2), { tilt: -10, rFwd: 125 + Math.sin(t * 2) * 5 }));
      env.update(t);
    };
  },
  // 10 "Ms. Pike still says, "Good morning, class!""  — medium close on the teacher, cheerful wave; cut to a yawning kid
  (S, cam) => {
    const env = nightClass(S);
    const pk = mk(S, PIKE, 'pike', 'grin', [1, 0, -5.6], 0);
    const k0 = mk(S, KIDS[0], 'k0', 'sleepy', [200, 0, 0], 0);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.7]);
      if (c === 0) { camPath(cam, p, [2.2, 5.4, 2.4], [1.8, 5.1, 1.2], [1, 4.4, -5.6], [1, 4.5, -5.6], 32, 36); k0.root.position.x = 200; }
      else { k0.root.position.set(-2.5, 0, 5.2); camPath(cam, p, [-1.9, 5.0, 11.8], [-2.1, 4.9, 11.2], [-2.5, 4.5, 5.2], [-2.5, 4.5, 5.2], 36); k0.setFace(p > 0.3 ? 'sleeping' : 'sleepy'); }
      pk.pose(addPose(addPose(hit([[0, POSES.rest], [0.4, { rUp: 150, tilt: -6 }], [dur * 0.7, { rUp: 140 + Math.sin(t * 9) * 12, tilt: -6 }]], t), talk(t, 1)), idle(t, 0.4)));
      if (t > 0.5) pk.setFace('delighted');
      k0.pose(addPose(idle(t, 0.4), { nod: 10 + ramp(t, dur * 0.75, dur) * 25, rFwd: 125, rUp: -10 }));
      env.update(t);
    };
  },
  // 11 "Out in the fields stand the old scarecrows."  — moonlit dolly along the corn: tall thin figures, arms out, crows on their arms
  (S, cam) => {
    const env = cornfield(S, { night: true });
    const H = [[-4.5, -15, 0.3], [5.5, -22, -0.35], [-1.0, -32, 0.2]].map(([x, z, tl], i) => { const c = husk(S, 'sc' + i, { seed: 5 + i }); c.root.position.set(x, 0, z); c.root.rotation.y = (i - 1) * 0.3; c.tl = tl; return c; });
    const crows = [0, 1].map(() => bird(S, 0x1a1a22));
    const key = new THREE.SpotLight(0xa8b8ff, 160, 60, 0.6, 0.6, 1.3); key.position.set(-8, 18, 6); key.target.position.set(0, 6, -22); S.add(key, key.target);
    return (t, dur) => {
      camPath(cam, t / dur, [-7, 3.6, 3], [2, 4.0, 2], [-4, 6.5, -16], [2, 6.8, -20], 26);
      H.forEach(c => { c.move(0, 'lurk', 0); scarecrow(c, c.tl); c.freeze(1); });
      H[0].root.updateMatrixWorld(true); const hp = new THREE.Vector3(); H[0].joints.arms[1].el.getWorldPosition(hp); crows[0].position.copy(hp).add(V([0.2, 0.35, 0])); crows[0].userData.flap(t, 0.05);
      H[1].joints.arms[0].el.getWorldPosition(hp); crows[1].position.copy(hp).add(V([0, 0.35, 0])); crows[1].rotation.y = 1.2; crows[1].userData.flap(t, (t % 2.5) < 0.3 ? 0.6 : 0.03);
      env.update(t);
    };
  },
  // 12 "Nobody remembers who put them there. [pause]"  — slow push-in on one scarecrow's face in the dark... it doesn't move
  (S, cam) => {
    const env = cornfield(S, { night: true });
    const c = husk(S, 'sc', { seed: 6 }); c.root.position.set(0, 0, -11); c.root.rotation.y = -0.2;
    const crow = bird(S, 0x1a1a22);
    const key = new THREE.SpotLight(0x9ab0ff, 90, 30, 0.35, 0.7, 1.5); key.position.set(-6, 14, 2); key.target.position.set(0, 8.5, -11); S.add(key, key.target);
    return (t, dur) => {
      camPath(cam, t / dur, [1.2, 7.4, 4.5], [0.4, 8.4, -1.6], [0, 8.2, -11], [0, 8.6, -11], 30, 36);
      c.move(0, 'lurk', 0); scarecrow(c, 0.3); c.freeze(1);
      const hp = new THREE.Vector3(); c.joints.arms[1].el.getWorldPosition(hp); const fly = ramp(t, dur * 0.55, dur);
      crow.position.copy(hp).add(V([fly * 6, 0.35 + fly * 5, fly * 3])); crow.rotation.y = fly > 0 ? 1.2 : 0; crow.userData.flap(t, fly > 0 ? 1 : 0.02);
      env.update(t);
    };
  },
  // 13 "I'm Ivy. I'm eleven."  — Ivy on the glowing night street, headlamp on, waves to camera
  (S, cam) => {
    const env = fernway(S, { night: true });
    const ivy = mk(S, IVY, 'ivy', 'smile', [-2, 0, 2], 0);
    fill(S, [-1, 6, 9], 10, 0xffd8b0);
    return (t, dur) => {
      faceCam(cam, t / dur, head(-2, 2), 0, { dist: 8.6, lens: 32, side: 1.4, push: 1.4, look: -0.9 });
      ivy.pose(addPose(addPose(hit([[0, POSES.rest], [0.45, { rUp: 150, tilt: -8 }], [1.4, { rUp: 140 + Math.sin(t * 10) * 14, tilt: -8 }], [1.9, { rUp: 20, rFwd: 10 }]], t), idle(t, 0.7)), talk(t, 0.25)));
      if (t > 0.5) ivy.setFace('grin');
      env.update(t);
    };
  },
  // 14 "My little brother Pip has never seen the sun."  — the day bedroom: Pip stands on the toy chest, peeking through a slit in the boards
  (S, cam) => {
    const env = bedroomDay(S);
    const { ivy, p } = sleepers(S, env); p.setFace('awe'); ivy.setFace('sleeping'); fill(S, [3, 6.5, -4], 5, 0xffe0b0, 9);
    return (t, dur) => {
      camPath(cam, t / dur, [1.4, 8.6, -1.6], [2.4, 7.8, -3.0], [4.5, 2.4, -6.0], [4.5, 2.4, -6.6], 28, 32);
      p.pose({ turn: -10 + Math.sin(t * 0.8) * 6, nod: -4, rUp: 10 }); p.root.position.y = 2.07 + Math.sin(t * 2.6) * 0.02;
      ivy.root.position.y = 2.2 + Math.sin(t * 2.2) * 0.03; p.setFace(t > dur * 0.55 ? 'softsmile' : 'awe');
      env.update(t);
    };
  },
  // 15 ""Just once," he'd whisper. "I want to see it." [pause]"  — close: a stripe of sunlight across his eye, he turns to whisper to his sister
  (S, cam) => {
    const env = bedroomDay(S);
    box(S, [2.6, 1.3, 1.4], [-1, 0.65, -7.9], std({ color: 0xc8484a }), { r: 0.08, name: 'toy chest' });
    const p = pip(S, 'awe', [-1, 1.3, -7.6], 180, false);
    S.userData.allowContact = [['pip', 'toy chest']];
    const sl = new THREE.SpotLight(0xfff0c0, 60, 12, 0.08, 0.3, 1.2); sl.position.set(-1.3, 4.75, -9.6); sl.target.position.set(-0.6, 4.4, -3); S.add(sl, sl.target);
    const fl = fill(S, [1.5, 5, -2], 3, 0x9ab0ff, 8);
    return (t, dur) => {
      const turnK = ramp(t, dur * 0.35, dur * 0.5);
      p.root.rotation.y = (180 - turnK * 140) * D;
      const hp = [-1, 1.3 + 3.43, -6.9];
      camPath(cam, t / dur, [2.8, 4.8, -2.4], [2.2, 4.75, -3.0], [-1, 4.5, -7.0], [-1, 4.55, -7.0], 34, 38);
      p.pose(addPose(addPose(idle(t, 0.4), { nod: -4 + turnK * 10, rFwd: 120 * (1 - turnK), lFwd: 120 * (1 - turnK), rUp: -14 * (1 - turnK), tilt: turnK * 8 }), turnK > 0.5 ? talk(t, 0.5) : {}));
      p.setFace(turnK > 0.6 ? 'smile' : 'awe');
      env.update(t);
    };
  },
  // 16 "One noon, I woke up to an open door."  — the door creaks open, blinding sunlight floods across Ivy's bed; she stirs awake
  (S, cam) => {
    const env = bedroomDay(S);
    const { ivy } = sleepers(S, env, { pipIn: false }); fill(S, [-2.5, 6.5, -3.5], 6, 0xfff0d8, 9);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.4, 7.6, -2.0], [-2.2, 6.6, -2.8], [-5, 2.8, -6.6], [-5, 3.4, -6.4], 30, 32);
      env.door.open(ramp(t, 0.2, dur * 0.6) * 0.8);
      const wake = ramp(t, dur * 0.55, dur * 0.85);
      ivy.pose(addPose(sitUp(ivy, -5, -7.0, wake * 0.35), { turn: 20 + wake * 35, nod: -wake * 10, rUp: wake * 30 }));
      ivy.setFace(wake > 0.6 ? 'worried' : wake > 0.1 ? 'sleepy' : 'sleeping');
      env.update(t);
    };
  },
  // 17 "Pip's bed was empty. [pause]"  — whip to Pip's bed: blanket thrown back, nobody there. Ivy sits bolt upright
  (S, cam) => {
    const env = bedroomDay(S); env.door.open(0.8);
    const { ivy } = sleepers(S, env, { pipIn: false }); fill(S, [-1.5, 6.5, -2.5], 7, 0xfff0d8, 10);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [2.4, 5.6, 2.8], [3.2, 5.0, 1.6], [4.5, 2.2, -5], [4.6, 2.0, -5.5], 30, 32);
      else camPath(cam, p, [1.0, 5.4, -0.5], [0.4, 5.2, -1.2], [-5, 4.6, -4.8], [-5, 5.0, -4.6], 32, 36);
      const up = ramp(t, dur * 0.5, dur * 0.62);
      ivy.pose(addPose(addPose(sitUp(ivy, -5, -7.0, 0.35 + up * 0.65), { turn: 45, rUp: 30, lUp: 20, nod: -5 }), idle(t, 0.4))); ivy.setFace(up > 0.3 ? 'shock' : 'worried');
      env.update(t);
    };
  },
  // 18 "So I stepped out into the sun."  — Ivy steps out of the front door into a blast of hard noon light, shielding her eyes
  (S, cam) => {
    const env = fernway(S, { sunPos: [16, 12, 10] });
    const ivy = mk(S, IVY, 'ivy', 'scared', [-14, 0.3, -12.7], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [-17.0, 2.4, -5.4], [-16.0, 2.8, -6.8], [-14, 4.2, -13.5], [-14, 4.8, -12.6], 28, 32);
      const wz = Math.min(t, 1.8); ivy.root.position.z = -12.7 + wz * 1.1; ivy.root.position.y = 0.3 * (1 - ramp(t, 1.2, 1.6));
      ivy.pose(addPose(t < 1.8 ? walk(t, 0.7, 26) : idle(t, 0.6), hit([[0, POSES.rest], [0.9, POSES.rest], [1.3, { rFwd: 140, rUp: -20, nod: -10 }]], t)));
      if (t > 1.0) ivy.setFace('worried'); if (t > dur * 0.8) ivy.setFace('awe');
      env.update(t);
    };
  },
  // 19 "I never knew the sky was blue. [pause]"  — low angle: she lowers her hand and looks up into a huge blue sky full of clouds
  (S, cam) => {
    const env = fernway(S, { sunPos: [16, 12, 10] });
    const ivy = mk(S, IVY, 'ivy', 'awe', [-2, 0, -1], 10);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.0, 1.4, 7.4], [-1.4, 1.1, 6.4], [-2, 5.0, -1], [-2, 6.6, -2], 28, 26);
      ivy.pose(addPose(hit([[0, { rFwd: 140, rUp: -20, nod: -10 }], [0.8, { rFwd: 140, rUp: -20, nod: -10 }], [1.4, { nod: -32, rUp: 20, lUp: 20 }], [dur, { nod: -36, rUp: 45, lUp: 45 }]], t), idle(t, 0.5)));
      ivy.setFace(t > dur * 0.6 ? 'softsmile' : 'awe');
      env.update(t);
    };
  },
  // 20 "Then the corn began to rustle."  — over her shoulder toward the cornfield: the stalks shiver; she turns, smile fading
  (S, cam) => {
    const env = fernway(S, { sunPos: [16, 12, 10] });
    const ivy = mk(S, IVY, 'ivy', 'softsmile', [2, 0, 0.5], 160);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.55]);
      if (c === 0) camPath(cam, p, [-1.6, 5.4, 7.0], [-0.6, 5.2, 6.0], [10, 4, -12], [11, 4, -12], 28);
      else faceCam(cam, p, head(2, 0.5), 160 - 20, { dist: 6.6, lens: 36, side: -0.8, look: -0.25 });
      ivy.root.rotation.y = (160 - ramp(t, dur * 0.4, dur * 0.6) * 20) * D;
      ivy.pose(addPose(idle(t, 0.5), { turn: -20 * ramp(t, dur * 0.3, dur * 0.6), nod: -4 })); ivy.setFace(t > dur * 0.5 ? 'worried' : 'softsmile');
      env.update(t + 0); env.corn.sway(t, 0.5 + 0.8 * ramp(t, 0, dur * 0.6));
    };
  },
  // 21 "Something tall stepped out."  — low angle: a husk pushes through the stalks and steps over the fence, its long shadow falling across the road
  (S, cam) => {
    const env = fernway(S, { sunPos: [20, 10, -4] });
    const c = husk(S, 'husk'); c.root.position.set(9, 0, -10.5);
    return (t, dur) => {
      camPath(cam, t / dur, [6.0, 1.0, 3.0], [6.4, 1.2, 2.2], [9, 6.0, -8], [9, 7.6, -5], 26, 28);
      c.root.position.z = -10.5 + t * 2.4; c.move(t, 'stalk'); c.look(V([2, 4.6, 0.5]));
      env.update(t); env.corn.sway(t, ramp(2, 0, 1) * clamp01(1 - t / dur));
    };
  },
  // 22 "Long arms. Long claws. And it saw me. [pause]"  — macro on the dangling claws flexing... then its head snaps to us, pinpoint eyes ignite
  (S, cam) => {
    const env = fernway(S, { sunPos: [20, 10, -4] });
    const c = husk(S, 'husk'); c.root.position.set(9, 0, -4); c.root.rotation.y = -0.4;
    const ivy = mk(S, IVY, 'ivy', 'scared', [1.5, 0, 2.5], 120);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      c.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); c.joints.arms[1].el.getWorldPosition(hp);
      if (k === 0) { camPath(cam, p, [hp.x + 3.0, 2.6, hp.z + 3.4], [hp.x + 1.6, 3.4, hp.z + 4.2], [hp.x, 2.4, hp.z], [hp.x, 3.0, hp.z], 34, 38); c.look(V([-20, 6, -20])); c.eyesOn(0.3); }
      else { camPath(cam, p, [5.8, 8.2, 3.2], [6.4, 8.4, 1.8], [9, 8.6, -4], [9, 8.8, -4], 36, 40); c.look(cam.position); c.eyesOn(1); }
      c.move(t, 'lurk');
      c.joints.arms.forEach(({ el }, i) => { el.rotation.x = -0.15 - Math.max(0, Math.sin(t * 5 + i)) * 0.35; });
      if (k === 1) { const sn = clamp01((t - dur * 0.45) / 0.2); c.head.rotation.y *= sn; }
      ivy.pose(idle(t, 0.6));
      env.update(t);
    };
  },
  // 23 "I ran!"  — Ivy sprints straight at the camera down the road, the husk loping after her
  (S, cam) => {
    const env = fernway(S, { sunPos: [20, 10, -4] });
    const ivy = mk(S, IVY, 'ivy', 'scared', [4, 0, -1], -75), c = husk(S, 'husk'); c.root.position.set(13, 0, -2.4); c.root.rotation.y = -90 * D;
    return (t, dur) => {
      const x = 2 - t * 6.2; ivy.root.position.x = x; ivy.pose(addPose(RUN(t), anticipate(t, 0.25)));
      c.root.position.x = 13 - t * 5.0; c.move(t, 'lunge'); c.look(V([x, 4.6, -1]));
      camPath(cam, t / dur, [x - 7.5, 3.4, 6.5], [x - 7.0, 3.6, 6.2], [x + 1.5, 4.2, -1.2], [x + 2.5, 4.6, -1.5], 28, 26);
      env.update(t);
    };
  },
  // 24 "I dove under the bus stop roof."  — she dives into the strip of shade under the shelter and scrambles round to face the street
  (S, cam) => {
    const env = fernway(S, { sunPos: [-6, 22, -2] });
    const ivy = mk(S, IVY, 'ivy', 'scared', [-7.4, 0, 4.6], -142.8);
    S.userData.allowContact = [['ivy', 'ground'], ['ivy', 'road']];
    return (t, dur) => {
      const u = ramp(t, 0.2, 0.9), land = t > 0.9;
      ivy.root.position.set(-7.4 - u * 4.4, -(land ? 1.45 * ramp(t, 0.9, 1.2) : 0), 4.6 - u * 5.8);
      ivy.root.rotation.y = (land ? -142.8 - 127.2 * ramp(t, 0.9, 1.5) : -142.8) * D;
      ivy.pose(land ? addPose({ rLeg: 80, lLeg: 80, rFwd: 70, lFwd: 70, rUp: -20, lUp: -20, nod: 10 }, { bob: Math.sin(t * 20) * 0.01, tilt: Math.sin(t * 25) * 2 }) : addPose(RUN(t), { lean: 60 * u, rFwd: 150 * u, lFwd: 150 * u, nod: 10 * u }));
      camPath(cam, t / dur, [-4.0, 3.2, 11.5], [-7.6, 3.0, 10.5], [-7.0, 2.8, 0], [-11, 2.6, -1.8], 26, 28);
      env.update(t);
    };
  },
];
