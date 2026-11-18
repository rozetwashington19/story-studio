import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn, sitGround, pinky, HUG, umbrella,
  fernway, cornfield, park, moonBalloon, beachUmbrella, lawnChair, bird } from '../../engine/kit.js';
import { IVY, RUE, FARMER, KIDS, mk, pip, head, clamp01, ramp, V, faceCam, fill, husk, scarecrow, RUN } from './common.js';

const SIT = (t, k = 1) => ({ rLeg: 80, lLeg: 80, rFwd: 70, lFwd: 70, rUp: -20, lUp: -20, nod: 6, bob: Math.sin(t * 20) * 0.006 * k, tilt: Math.sin(t * 25) * 2 * k });
const IX = -11.8, IZ = -1.2;   // where Ivy sits under the bus-stop roof (facing +x)
// the bus-stop standoff: Ivy crouched in the shade, the husk bent over her with its claws stopped right in front of her face
function standoff(S, { lunge = [0, 0.6] } = {}) {
  const env = fernway(S, { sunPos: [-6, 22, -2] });
  const ivy = mk(S, IVY, 'ivy', 'scared', [IX, -1.45, IZ], 90);
  const c = husk(S, 'husk'); c.root.position.set(-3, 0, IZ - 1.6); c.root.rotation.y = -90 * D;
  S.userData.allowContact = [...(S.userData.allowContact || []), ['ivy', 'ground'], ['ivy', 'road']];
  const tip = new THREE.Vector3();
  // pose: body bent forward, arms reaching down-forward; then slide the root so the right claw stops `gap` in front of Ivy's face
  const pose = (t, reach, gap = 1.1) => {
    c.move(t, 'stalk'); const J = c.joints; J.body.rotation.x = 0.12 + 0.75 * reach; J.neck.rotation.x = -0.4 * reach;
    const hn = J.arms[1].el.children.find(g => g.isGroup) || J.arms[1].el;
    // pick the shoulder angle that brings the claw tip to face height (y ≈ 3.3), then slide the root so it stops `gap` from her face
    let best = 0, be = 1e9; c.root.position.x = -3;
    for (let a = -0.2; a > -2.2; a -= 0.1) { J.arms[1].sh.rotation.x = a; J.arms[1].el.rotation.x = -0.2; c.root.updateMatrixWorld(true); hn.getWorldPosition(tip); const e = Math.abs(tip.y - 1.0 - 3.3); if (e < be) { be = e; best = a; } }
    const aa = -0.25 + (best + 0.25) * reach;
    J.arms.forEach(({ sh, el }, i) => { sh.rotation.x = i ? aa : -0.3 * reach; sh.rotation.z = (i ? 1 : -1) * 0.12; el.rotation.x = -0.2; });
    c.root.updateMatrixWorld(true); hn.getWorldPosition(tip);
    c.root.position.x += (IX + 0.4 + gap) - tip.x; };
  return { env, ivy, c, pose };
}
// park: Pip in the middle (0,0,0), six husks on a ring around him
const RING = [0, 60, 120, 180, 240, 300].map(a => (a + 42.7) * D);
const BR = 9;   // park balloon radius
// Ivy holds the rope; the wind carries the balloon ahead of her, its shadow lands ~(+4, -6.5) from her
const balFor = (x, z) => [x + 10.6, 12, z + 2.7];
function parkSet(S, { pipFace = 'delighted', husks = true, balloon = false, sunPos = [10, 40, 14] } = {}) {
  const env = park(S, { sunPos });
  const p = pip(S, pipFace, [0, 0, 0], 0); sitGround(p);
  S.userData.allowContact = [['pip', 'ground']];
  const H = husks ? RING.map((a, i) => { const c = husk(S, 'h' + i, { seed: i + 3 }); c.a = a; return c; }) : [];
  const ring = (r, t, mood = 'stalk', frozenAt = null) => H.forEach((c, i) => { c.root.position.set(Math.cos(c.a) * r, 0, Math.sin(c.a) * r); c.root.rotation.y = Math.atan2(-Math.cos(c.a), -Math.sin(c.a)); c.move(t + i * 0.37, mood, frozenAt); c.look(V([0, 3, 0])); });
  const bal = balloon ? moonBalloon(S, { r: BR }) : null;
  // shadow centre of the balloon on the ground (sun direction)
  const sd = new THREE.Vector3(...sunPos).normalize();
  const shadowAt = () => { const cy = bal.position.y + BR * 1.6; return [bal.position.x - sd.x / sd.y * cy, bal.position.z - sd.z / sd.y * cy]; };
  return { env, p, H, ring, bal, shadowAt };
}

export const SHOTS_B = [
  // 25 "Its claws stopped an inch from my nose. [pause]"  — the claws lunge into the shade... and stop dead in front of her face
  (S, cam) => {
    const { env, ivy, c, pose } = standoff(S);
    return (t, dur) => {
      const stopT = 0.75, reach = Math.min(1, t / stopT); pose(Math.min(t, stopT), reach * reach, 1.1 + (1 - reach) * 3);
      c.eyesOn(t < stopT ? 1 : 0); c.freeze(ramp(t, stopT, stopT + 0.3));
      const [k, p] = seg(t, dur, [0.35]);
      if (k === 0) camPath(cam, p, [-6.5, 5.2, 13], [-7.0, 4.8, 11.8], [-8.0, 4.4, -2.4], [-8.6, 4.0, -2.4], 26, 28);
      else camPath(cam, p, [IX + 4.0, 3.5, IZ + 4.2], [IX + 3.6, 3.4, IZ + 3.8], [IX + 0.7, 3.3, IZ], [IX + 0.6, 3.2, IZ], 34, 36);
      ivy.pose(addPose(SIT(t, t < stopT + 0.4 ? 1 : 0.4), { nod: -6, lean: -8 * reach, turn: 6 })); ivy.setFace(t > stopT + 0.6 ? 'nervous' : 'scared');
      env.update(t);
    };
  },
  // 26 "It didn't move. It couldn't."  — two-shot: frozen claws, eyes dark. Ivy dares to breathe, tilts her head
  (S, cam) => {
    const { env, ivy, c, pose } = standoff(S);
    return (t, dur) => {
      pose(0.75, 1, 1.1); c.eyesOn(0); c.freeze(1);
      camPath(cam, t / dur, [-5.0, 4.6, 11.5], [-5.8, 4.2, 10.2], [-8.0, 4.4, -2.6], [-8.6, 4.0, -2.6], 28, 30);
      ivy.pose(addPose(SIT(t, 0.3), hit([[0, { nod: -6 }], [dur * 0.5, { nod: -6 }], [dur * 0.7, { tilt: 14, turn: -10, nod: -10 }]], t))); ivy.setFace(t > dur * 0.55 ? 'confused' : 'nervous');
      env.update(t);
    };
  },
  // 27 "It stood in the shade, frozen stiff."  — wide: the roof's shadow line across the frozen creature; Ivy waves a hand in front of its claws
  (S, cam) => {
    const { env, ivy, c, pose } = standoff(S);
    return (t, dur) => {
      pose(0.75, 1, 1.1); c.eyesOn(0); c.freeze(1);
      camPath(cam, t / dur, [-6, 6.5, 15], [-7, 5.8, 13.5], [-8, 5.0, -2], [-8.5, 4.6, -2.4], 24, 26);
      ivy.pose(addPose(SIT(t, 0.2), hit([[0, { nod: -6 }], [0.6, { rUp: 100, rFwd: 60, nod: -6 }], [dur, { rUp: 100 + Math.sin(t * 9) * 15, rFwd: 60, nod: -6 }]], t))); ivy.setFace('confused');
      env.update(t);
    };
  },
  // 28 "Just like a scarecrow. [pause]"  — slow push-in on Ivy: the realisation lands
  (S, cam) => {
    const { env, ivy, c, pose } = standoff(S);
    return (t, dur) => {
      pose(0.75, 1, 1.1); c.eyesOn(0); c.freeze(1);
      faceCam(cam, t / dur, [IX, 3.2, IZ], 15, { dist: 7.2, lens: 34, side: 0.2, push: 1.6, look: -0.3 });
      ivy.pose(addPose(SIT(t, 0.1), { nod: -4 + ramp(t, 0, dur) * -4, turn: -40 })); ivy.setFace(t > dur * 0.35 ? 'shock' : 'thinking');
      env.update(t);
    };
  },
  // 29 "The scarecrows were never scarecrows."  — memory (warm faded): the night field of scarecrows... the same long arms, the same claws
  (S, cam) => {
    const env = cornfield(S, { night: true }); S.userData.look = 'flash';
    const H = [[-3.5, -12, 0.3], [4.5, -18, -0.35]].map(([x, z, tl], i) => { const c = husk(S, 'sc' + i, { seed: 5 + i }); c.root.position.set(x, 0, z); c.tl = tl; return c; });
    fill(S, [0, 9, 4], 30, 0xffe0b0, 40);
    const key = new THREE.SpotLight(0xffe8c0, 220, 60, 0.6, 0.6, 1.3); key.position.set(-8, 18, 6); key.target.position.set(0, 6, -15); S.add(key, key.target);
    return (t, dur) => {
      camPath(cam, t / dur, [-1, 6.5, 7], [-2.5, 8.0, 1.5], [-2, 7.0, -12], [-3.5, 8.6, -12], 26, 32);
      H.forEach(c => { c.move(0, 'lurk', 0); scarecrow(c, c.tl); c.freeze(1); });
      env.update(t);
    };
  },
  // 30 "At night, the whole world is shade. [pause]"  — high wide over the happy night town; the 'scarecrows' stand frozen behind the fence
  (S, cam) => {
    const env = fernway(S, { night: true });
    const H = [[11, -12, 0.3], [17, -16, -0.3], [23.5, -11, 0.2]].map(([x, z, tl], i) => { const c = husk(S, 'sc' + i, { seed: 7 + i }); c.root.position.set(x, 0, z); c.tl = tl; return c; });
    const k0 = mk(S, KIDS[0], 'k0', 'laugh', [4, 0, -1], 0), k1 = mk(S, KIDS[1], 'k1', 'grin', [4, 0, -1], 0), f = mk(S, FARMER, 'farmer', 'smile', [-6, 0, 2], 60);
    return (t, dur) => {
      camPath(cam, t / dur, [2, 17, 26], [4, 13.5, 22], [6, 4, -8], [8, 4.5, -10], 24);
      H.forEach(c => { c.move(0, 'lurk', 0); scarecrow(c, c.tl); c.freeze(1); });
      [k0, k1].forEach((k, i) => { const a = t * 1.7 + i * Math.PI; k.root.position.set(1 + Math.cos(a) * 3.2, 0, 1 + Math.sin(a) * 2.4); k.root.rotation.y = -a; k.pose(RUN(t + i, 0.8)); });
      f.pose(addPose(idle(t, 0.7), { rUp: 130 + Math.sin(t * 8) * 12 }));
      env.update(t);
    };
  },
  // 31 "Then I heard Pip."  — under the shelter Ivy's head snaps toward the park; she slips out from under the frozen claws
  (S, cam) => {
    const { env, ivy, c, pose } = standoff(S);
    return (t, dur) => {
      pose(0.75, 1, 1.1); c.eyesOn(0); c.freeze(1);
      faceCam(cam, t / dur, [IX, 3.2, IZ], 12, { dist: 7.0, lens: 32, side: -0.3, push: 0.8, look: -0.3 });
      const snapT = 0.35; ivy.pose(addPose(SIT(t, 0.2), hit([[0, { turn: -20 }], [snapT, { turn: -20 }], [snapT + 0.25, { turn: -62, nod: -6, rFwd: 20, rUp: 70 }]], t)));
      ivy.setFace(t > snapT ? (t > dur * 0.7 ? 'determined' : 'shock') : 'thinking');
      env.update(t);
    };
  },
  // 32 "He was in the park, staring at the sun."  — Pip sits alone in the bright meadow, sunglasses on, face tipped up, delighted
  (S, cam) => {
    const { env, p } = parkSet(S, { husks: false });
    fill(S, [0, 4, 6], 4, 0xfff0d0);
    return (t, dur) => {
      camPath(cam, t / dur, [4.5, 1.8, 6.5], [2.2, 2.0, 7.2], [0, 2.8, 0], [0, 3.1, 0], 34, 36);
      p.pose(addPose(addPose({ rLeg: 85, lLeg: 85, nod: -34, rUp: 20, lUp: 20 }, idle(t, 0.6)), { rUp: 25 + Math.sin(t * 2) * 8, tilt: Math.sin(t * 1.5) * 5 }));
      p.setFace(t > dur * 0.4 ? 'delighted' : 'awe');
      env.update(t);
    };
  },
  // 33 "No shade anywhere."  — god's-eye crane: one tiny kid in a huge sunny field... shapes stepping out of the corn all around
  (S, cam) => {
    const { env, p, ring } = parkSet(S);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 24, 26], [2, 34, 30], [0, 0, -4], [0, 0, -6], 26, 24);
      ring(30 - t * 2, t); p.pose(addPose({ rLeg: 85, lLeg: 85, nod: -30 }, idle(t, 0.5)));
      env.update(t);
    };
  },
  // 34 "Six of them were closing in."  — low behind Pip: six husks stalk in from every side; he turns, smile gone  (also the hook)
  (S, cam) => {
    const { env, p, ring } = parkSet(S, { pipFace: 'delighted' });
    return (t, dur) => {
      const r = Math.max(12.5, 18 - t * 2.0);
      camPath(cam, t / dur, [1.2, 2.0, 6.0], [0.8, 1.6, 5.0], [0, 4.2, -6], [0, 5.0, -8], 24, 22);
      ring(r, t, t > dur * 0.6 ? 'lunge' : 'stalk');
      const tn = ramp(t, dur * 0.3, dur * 0.55);
      p.pose(addPose({ rLeg: 85, lLeg: 85, nod: -30 * (1 - tn) + 4 * tn, turn: 40 * Math.sin(t * 2.2) * tn, lean: -6 * tn }, idle(t, 0.6)));
      p.setFace(tn > 0.5 ? 'scared' : 'delighted');
      env.update(t);
    };
  },
  // 35 "I needed shade. A giant one."  — Ivy bolts out to the road, skids to a stop, looks around... then up
  (S, cam) => {
    const env = fernway(S, { sunPos: [-6, 22, -2] });
    const ivy = mk(S, IVY, 'ivy', 'determined', [-6, 0, 2.6], 90);
    return (t, dur) => {
      const run = clamp01(t / 0.8); ivy.root.position.x = -9 + run * 3;
      ivy.root.rotation.y = (90 - ramp(t, 0.8, 1.3) * 60) * D;
      ivy.pose(addPose(t < 0.8 ? RUN(t) : idle(t, 0.8), hit([[0.8, { lean: -10 }], [1.1, { turn: -40 }], [1.7, { turn: 35 }], [dur * 0.8, { turn: 10, nod: -18 }]], t)));
      ivy.setFace(t > dur * 0.75 ? 'thinking' : 'worried');
      faceCam(cam, t / dur, head(-6, 2.6), 30, { dist: 8.0, lens: 30, side: 0.6, push: 1.0, look: -0.6 });
      env.update(t);
    };
  },
  // 36 "The Moon Fair balloon!"  — low angle: the big balloon bobbing over the square; Ivy throws her arm up and points
  (S, cam) => {
    const env = fernway(S, { sunPos: [-6, 22, -2] });
    const ivy = mk(S, IVY, 'ivy', 'grin', [-6, 0, 2.6], 150);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.5, 1.6, 11.0], [-2.0, 1.3, 10.0], [-5.0, 6, -3], [-3.0, 11.5, -10], 26, 24);
      const B = env.balloon.position.clone().setY(env.balloon.position.y + 6);
      ivy.pose(addPose(addPose(hit([[0, POSES.rest], [0.3, POSES.rest], [0.6, { rUp: 60, rFwd: 150 }]], t), lookAt(ivy, B)), idle(t, 0.5)));
      env.update(t);
    };
  },
  // 37 "I untied its rope and ran."  — she yanks the tether off the stake and sprints; the balloon swings after her
  (S, cam) => {
    const env = fernway(S, { sunPos: [-6, 22, -2] });
    const ivy = mk(S, IVY, 'ivy', 'determined', [-1.9, 0, -7.2], 180);
    const hand = new THREE.Vector3();
    return (t, dur) => {
      env.update(t);
      const go = ramp(t, 0.8, dur), pull = ramp(t, 0.2, 0.7);
      const x = -1.9 + go * 3.5, z = -7.2 + go * 9.6;
      ivy.root.position.set(x, 0, z); ivy.root.rotation.y = (go > 0 ? 20 : 180 - pull * 20) * D;
      ivy.pose(go > 0 ? addPose(RUN(t), { lFwd: -70, lUp: 20 }) : addPose(hit([[0, { rFwd: 80, lFwd: 80, nod: 25, lean: 20 }], [0.5, { rFwd: 40, lFwd: 40, nod: 5, lean: -12 }]], t), {}));
      ivy.root.updateMatrixWorld(true); hand.copy(pinky(ivy, go > 0 ? 'L' : 'R'));
      const b = env.balloon; b.position.x = -2.5 + go * 4; b.position.z = -11.5 + go * 8; b.rotation.z = Math.sin(t * 2) * 0.05 + go * 0.12;
      b.userData.rope(hand, b.position.clone().add(V([0, -0.9, 0])), 0.6);
      camPath(cam, t / dur, [6, 5.5, 13], [7.5, 5.0, 14], [-2, 5, -6], [1, 6.5, 0], 24, 24);
    };
  },
  // 38 "Its shadow swept across the grass,"  — high wide over the park: Ivy runs in towing the balloon; its giant round shadow slides over the meadow
  (S, cam) => {
    const { env, p, ring, bal, shadowAt } = parkSet(S, { balloon: true, pipFace: 'scared' });
    const ivy = mk(S, IVY, 'ivy', 'determined', [-24, 0, 14], 111); const hand = new THREE.Vector3();
    return (t, dur) => {
      const u = t / dur, x = -24 + u * 14, z = 14 - u * 5.5; ivy.root.position.set(x, 0, z); ivy.pose(addPose(RUN(t), { lFwd: -60, lUp: 30 }));
      bal.position.set(...balFor(x, z)); hand.copy(pinky(ivy, 'L')); bal.userData.rope(hand, bal.position.clone().add(V([0, -0.9, 0])), 0.8);
      ring(11 - u * 0.5, t, 'stalk');
      p.pose(addPose({ rLeg: 85, lLeg: 85, lean: -10, rFwd: 60, lFwd: 60 }, { tilt: Math.sin(t * 25) * 2 }));
      camPath(cam, t / dur, [30, 26, -12], [27, 23, -10], [-7, 0, 2], [-4, 1, 2], 24);
      env.update(t);
    };
  },
  // 39 "and one by one, they froze."  — the shadow slides over each husk: mid-lunge, its eyes go dark and it locks stiff
  (S, cam) => {
    const { env, p, ring, H, bal, shadowAt } = parkSet(S, { balloon: true, pipFace: 'scared' });
    const ivy = mk(S, IVY, 'ivy', 'determined', [-10, 0, 8.5], 117); const hand = new THREE.Vector3(); const fz = H.map(() => null);
    return (t, dur) => {
      const u = Math.min(1, t / (dur * 0.7)), x = -10 + u * 4, z = 8.5 - u * 2; ivy.root.position.set(x, 0, z); ivy.pose(t < dur * 0.7 ? addPose(walk(t, 1.4, 40), { lFwd: -60, lUp: 30 }) : addPose(idle(t, 0.8), { lFwd: -60, lUp: 30 }));
      bal.position.set(...balFor(x, z)); hand.copy(pinky(ivy, 'L')); bal.userData.rope(hand, bal.position.clone().add(V([0, -0.9, 0])), 0.8);
      const [sx, sz] = shadowAt();
      H.forEach((c, i) => { const d = Math.hypot(c.root.position.x - sx, c.root.position.z - sz); if (fz[i] == null && d < BR + 3.2) fz[i] = t; });
      H.forEach((c, i) => { c.root.position.set(Math.cos(c.a) * 10.5, 0, Math.sin(c.a) * 10.5); c.root.rotation.y = Math.atan2(-Math.cos(c.a), -Math.sin(c.a)); c.move(t + i * 0.37, 'stalk', fz[i]); c.look(V([0, 3, 0])); c.freeze(fz[i] == null ? 0 : ramp(t, fz[i], fz[i] + 0.25)); });
      p.pose(addPose({ rLeg: 85, lLeg: 85, lean: -10, rFwd: 60, lFwd: 60 }, { tilt: Math.sin(t * 25) * 2 }));
      camPath(cam, t / dur, [9, 6.5, 15], [-1, 6.0, 16], [3, 4.5, -2], [-3, 4.5, -2], 24);
      env.update(t);
    };
  },
  // 40 ""Pip! Get in the shadow!" [pause]"  — Ivy shouts from the cool shade, rope in her fist; Pip's head whips round
  (S, cam) => {
    const { env, p, ring, H, bal } = parkSet(S, { balloon: true, pipFace: 'scared' });
    const ivy = mk(S, IVY, 'ivy', 'determined', [-6, 0, 6.5], 137); const hand = new THREE.Vector3();
    H.forEach(c => c.freeze(1));
    return (t, dur) => {
      ring(10.5, 0, 'stalk', 0);
      bal.position.set(...balFor(-6, 6.5)); hand.copy(pinky(ivy, 'L')); bal.userData.rope(hand, bal.position.clone().add(V([0, -0.9, 0])), 0.5);
      const [k, q] = seg(t, dur, [0.6]);
      if (k === 0) faceCam(cam, q, head(-6, 6.5), 137, { dist: 7.4, lens: 32, side: -0.6, push: 0.8, look: -0.4 });
      else faceCam(cam, q, [0, 3.43 - 1.1, 0], -43, { dist: 6.0, lens: 34, side: 0.4, push: 0.5, look: -0.2 });
      ivy.pose(addPose(addPose(hit([[0, { lFwd: -60, lUp: 30 }], [0.3, { lFwd: -60, lUp: 30, rUp: 120, rFwd: 40, lean: 8 }]], t), talk(t, 1.3)), idle(t, 0.5)));
      p.root.rotation.y = (ramp(t, dur * 0.62, dur * 0.75) * -43) * D;
      p.pose(addPose({ rLeg: 85, lLeg: 85, lean: -6 }, { tilt: Math.sin(t * 25) * 1.5 })); p.setFace(t > dur * 0.75 ? 'relieved' : 'scared');
      env.update(t);
    };
  },
  // 41 "He ran to me, and I didn't let go."  — Pip scrambles up and runs into her arms; they hug in the balloon's shade
  (S, cam) => {
    const { env, p, ring, H, bal } = parkSet(S, { balloon: true });
    const ivy = mk(S, IVY, 'ivy', 'worried', [-6, 0, 6.5], 137); const hand = new THREE.Vector3();
    H.forEach(c => c.freeze(1));
    S.userData.allowContact = [['pip', 'ground'], ['ivy', 'pip']];
    return (t, dur) => {
      ring(10.5, 0, 'stalk', 0);
      const run = ramp(t, 0.3, 1.3), up = ramp(t, 0, 0.3);
      p.root.position.set(-4.0 * run, -1.5 * (1 - up), 4.3 * run); p.root.rotation.y = -43 * D;
      const hug = t > 1.3;
      p.pose(hug ? addPose(HUG, { nod: -18 }) : up < 1 ? { rLeg: 85 * (1 - up), lLeg: 85 * (1 - up) } : RUN(t));
      ivy.pose(hug ? addPose(addPose(HUG, { nod: 22, lean: 12 }), { bob: Math.sin(t * 3) * 0.02 }) : addPose(idle(t, 0.5), { lFwd: -60, lUp: 30, rUp: 40 }));
      ivy.setFace(hug ? 'love' : 'worried'); p.setFace(hug ? 'relieved' : 'scared');
      bal.position.set(...balFor(-6, 6.5)); hand.copy(pinky(ivy, 'L')); bal.userData.rope(hand, bal.position.clone().add(V([0, -0.9, 0])), 0.5);
      camPath(cam, t / dur, [-9.5, 12.5, 15], [-8.8, 11.0, 13.2], [-4.4, 2.2, 4.6], [-4.8, 2.4, 5.0], 28, 30);
      env.update(t);
    };
  },
  // 42 "We walked home under our own little night. [pause]"  — crane up: two kids and their moving circle of shade crossing the bright meadow
  (S, cam) => {
    const { env, p, bal } = parkSet(S, { balloon: true, husks: false });
    const ivy = mk(S, IVY, 'ivy', 'softsmile', [0, 0, 0], 148); const hand = new THREE.Vector3();
    S.userData.allowContact = [['pip', 'ground']];
    return (t, dur) => {
      const s = t * 1.2, dx = 0.53 * s, dz = -0.85 * s;   // walking away from camera, into their moving shade
      const ix = -3 + dx, iz = 2 + dz; ivy.root.position.set(ix, 0, iz); ivy.root.rotation.y = 148 * D; ivy.pose(addPose(walk(t, 0.7, 26), { lFwd: -60, lUp: 30 }));
      p.root.position.set(ix + 4.2, 0, iz + 0.6); p.root.rotation.y = 148 * D; p.pose(walk(t + 0.3, 0.9, 30)); p.setFace('delighted');
      bal.position.set(ix + 8.7, 12, iz + 9.5); hand.copy(pinky(ivy, 'L')); bal.userData.rope(hand, bal.position.clone().add(V([0, -0.9, 0])), 0.5);
      camPath(cam, t / dur, [ix - 8, 5, iz + 14], [ix - 14, 20, iz + 24], [ix + 2, 2.5, iz - 2], [ix + 3, 1, iz - 4], 26, 24);
      env.update(t);
    };
  },
  // 43 "Now all of Fernway carries its own shade."  — the sunny street, full of people with umbrellas; a frozen husk stands under a beach umbrella
  (S, cam) => {
    const env = fernway(S, { sunPos: [4, 26, 6] });
    const c = husk(S, 'husk'); c.root.position.set(9, 0, -10.5); beachUmbrella(S, [9, 4.0, -11.8], 0x3a9ad8, 4.2);
    const P = [[FARMER, 'farmer', -6, 1.6, 0xe8584a, 0], [KIDS[0], 'k0', -12, 5.0, 0xf2c420, 0.5], [IVY, 'ivy', 7, 2.4, 0x3a8a6a, 1.0]].map(([o, n, x, z, col, ph]) => { const A = mk(S, o, n, 'smile', [x, 0, z], x < 0 ? 90 : -90); A.u = umbrella(S, col); A.x0 = x; A.ph = ph; return A; });
    const pp = pip(S, 'delighted', [11.5, 0, 3.4], -90); const pu = umbrella(S, 0xe8743a, 1.6);
    return (t, dur) => {
      camPath(cam, t / dur, [-1, 5.5, 20], [1, 5.0, 18], [0, 4.6, -3], [1.5, 4.6, -3], 24);
      c.move(0, 'lurk', 0); scarecrow(c, 0.25); c.freeze(1);
      P.forEach(A => { A.root.position.x = A.x0 + (A.x0 < 0 ? 1 : -1) * t * 2.3; A.pose(addPose(walk(t + A.ph, 0.8, 28), { rFwd: 65, rUp: -22 })); A.setFace(t > 1 ? 'laugh' : 'smile'); const h = pinky(A, 'R'); A.u.position.set(h.x, h.y, h.z); });
      pp.root.position.x = 11.5 - t * 2.3; pp.root.position.y = Math.abs(Math.sin(t * 6)) * 0.35; pp.pose(addPose(walk(t, 1.2, 34), { rFwd: 65, rUp: -22 })); const h = pinky(pp, 'R'); pu.position.set(h.x, h.y, h.z);
      env.update(t);
    };
  },
  // 44 "Grandma Rue got her first real tan. Mostly her feet."  — Grandma under a beach umbrella in the sun... cut to her feet poking out into the light
  (S, cam) => {
    const env = fernway(S, { sunPos: [1, 30, -9], balloon: false });
    lawnChair(S, [0, 1.5], 0); beachUmbrella(S, [0, 0, -1.2], 0xe8584a, 2.4);
    const r = mk(S, RUE, 'rue', 'proud', [0, 0, 1.1], 0); sitOn(r, 1.1);
    S.userData.allowContact = [['rue', 'chair'], ['rue', 'umbrella']];
    fill(S, [0, 4, 8], 6, 0xfff0d8);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.55]);
      if (k === 0) camPath(cam, p, [3.4, 4.4, 11.5], [2.6, 4.2, 10.2], [0, 3.2, 1.8], [0, 3.4, 1.6], 30, 32);
      else camPath(cam, p, [3.0, 2.8, 10.0], [2.5, 2.5, 9.0], [0, 1.2, 3.6], [0, 1.1, 3.8], 32, 34);
      r.pose(addPose({ rLeg: 80 + Math.sin(t * 7) * (k ? 8 : 2), lLeg: 80 - Math.sin(t * 7) * (k ? 8 : 2), lean: -40, rUp: 110, lUp: 110, rFwd: -30, lFwd: -30, nod: -14 }, { tilt: Math.sin(t) * 3 }));
      env.update(t);
    };
  },
  // 45 "And the creatures? They make great scarecrows. [pause]"  — a husk frozen under a planted beach umbrella, crows on its arms; the farmer's thumbs-up
  (S, cam) => {
    const env = cornfield(S, { sunPos: [2, 30, 4] });
    const c = husk(S, 'husk'); c.root.position.set(-1.5, 0, -7); beachUmbrella(S, [-1.5, 4.2, -7], 0xf2c420, 4.4);
    const f = mk(S, FARMER, 'farmer', 'grin', [4.0, 0, -2.6], -25); fill(S, [0, 7, 0], 16, 0xfff0d8, 16);
    const crows = [0, 1].map(() => bird(S, 0x1a1a22)); const hp = new THREE.Vector3();
    S.userData.allowContact = [['husk', 'umbrella']];
    return (t, dur) => {
      camPath(cam, t / dur, [3.5, 4.4, 13], [2.6, 5.0, 11.5], [1.0, 5.4, -5], [1.0, 6.0, -5], 26);
      c.move(0, 'lurk', 0); scarecrow(c, 0.3); c.freeze(1); c.root.updateMatrixWorld(true);
      [0, 1].forEach(i => { c.joints.arms[i].el.getWorldPosition(hp); crows[i].position.copy(hp).add(V([0, 0.35, 0])); crows[i].rotation.y = i ? -0.6 : 0.8; crows[i].userData.flap(t + i, (t + i) % 2.2 < 0.25 ? 0.7 : 0.03); });
      f.pose(addPose(hit([[0, POSES.rest], [dur * 0.45, POSES.rest], [dur * 0.6, { rUp: 60, rFwd: 70, nod: -4 }]], t), addPose(idle(t, 0.6), lookAt(f, cam.position))));
      if (t > dur * 0.5) f.setFace('wink');
      env.update(t);
    };
  },
  // 46 "Pip finally saw the sun."  — dawn: the two of them sit in the shade of a beach umbrella as the sun comes up over the corn; golden light on Pip's face
  (S, cam) => {
    const env = cornfield(S, { dawn: true, sunPos: [-6, 5, -30] });
    beachUmbrella(S, [0, 0, -3.4], 0xe8584a, 3.6);
    const ivy = mk(S, IVY, 'ivy', 'softsmile', [-2.1, 0, -3], 180), p = pip(S, 'awe', [1.9, 0, -3.2], 180);
    sitGround(ivy); sitGround(p);
    S.userData.allowContact = [['ivy', 'ground'], ['pip', 'ground']];
    const key = new THREE.SpotLight(0xffb070, 140, 40, 0.5, 0.6, 1.4); key.position.set(-3, 4.5, -20); key.target.position.set(-1.6, 2.5, -3); S.add(key, key.target);
    return (t, dur) => {
      faceCam(cam, t / dur, [0, 2.6, -3.1], 180, { dist: 11.5, lens: 28, side: 0, push: 1.6, look: -0.4, up: 0.2 });
      ivy.pose(addPose(addPose({ rLeg: 85, lLeg: 85, rFwd: 40, lFwd: 40, nod: -6 }, idle(t, 0.4)), lookAt(ivy, [1.9, 2.4, -3.2])));
      p.pose(addPose({ rLeg: 85, lLeg: 85, nod: -14, rUp: 25, lUp: 25 }, idle(t, 0.5, 2))); p.setFace(t > dur * 0.4 ? 'delighted' : 'awe');
      env.update(t);
    };
  },
  // 47 "Best morning of our lives. [pause]"  — final pull-back from behind: two small figures under the umbrella, the huge sun rising over the corn
  (S, cam) => {
    const env = cornfield(S, { dawn: true, sunPos: [-6, 5, -30] });
    beachUmbrella(S, [-1.5, 0, -3.4], 0xe8584a, 3.6);
    const ivy = mk(S, IVY, 'ivy', 'softsmile', [-3.6, 0, -3], 180), p = pip(S, 'delighted', [0.4, 0, -3.2], 180);
    sitGround(ivy); sitGround(p);
    S.userData.allowContact = [['ivy', 'ground'], ['pip', 'ground']];
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 3.6, 7], [1.5, 6.5, 16], [-1.4, 3.5, -12], [-2.5, 6, -40], 28, 24);
      const lean = ramp(t, dur * 0.3, dur * 0.6);
      ivy.pose(addPose({ rLeg: 85, lLeg: 85, nod: -10, tilt: 10 * lean }, idle(t, 0.3)));
      p.pose(addPose({ rLeg: 85, lLeg: 85, nod: -14, tilt: -8 * lean }, idle(t, 0.4, 2)));
      env.update(t);
    };
  },
];
