import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn, pinky, HUG,
  houseFront, fade, aura, thoughts, familyKitchen, nursery, nightStairs, carInside, mug, cerealBowl, plate, dinoPancake, strawberry, strawberryBowl, handMirror, pan } from '../../engine/kit.js';
import { KIDS, mk, ghost, hazel, mom, dad, fig, bo, cradle, HOLD, head, clamp01, ramp, V, faceCam, fill, headOf } from './common.js';

const hold = (obj, A, side = 'R', off = [0, 0, 0]) => { const p = pinky(A, side); obj.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); };
const SITP = { rLeg: 90, lLeg: 90 };
const STEP = 1.4, SZ = -1.42;   // sitting on step 1 of nightStairs
// Mom sitting on the stairs with Bo in her arms
function stairMom(S, x, k, face = 'teary', ry = 0, boFace = 'sleeping') {
  const m = mom(S, face, [x, 0, SZ], ry, k); sitOn(m, STEP); const b = bo(S, boFace, [0, 0, 0]); if (k < 1) fade(b, 1);
  S.userData.allowContact = [...(S.userData.allowContact || []), ['mom', 'bo'], ['mom', 'step*'], ['bo', 'step*']];
  return { m, b, pose: (t, extra = {}) => { m.pose(addPose(addPose(addPose(SITP, HOLD), idle(t, 0.4)), extra)); cradle(b, m); } };
}
function stairHazel(S, x, k, face = 'sad', ry = 0) {
  const h = hazel(S, face, [x, 0, SZ], ry, k); sitOn(h, STEP);
  S.userData.allowContact = [...(S.userData.allowContact || []), ['hazel', 'step*']]; return h;
}
const mixC = (S) => { S.userData.look = 'night'; };

export const SHOTS_B = [
  // 24 "Bo was crying, and someone was rocking him."  — at the foot of the stairs, baby Bo floats in mid-air, rocking gently
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, 0, 0.03, 'teary', 0, 'cry');
    return (t, dur) => {
      camPath(cam, t / dur, [1.2, 4.0, 11], [0.6, 4.2, 7.6], [0, 3.4, -1.4], [0, 3.6, -1.4], 28, 32);
      pose(t, { bodyTilt: Math.sin(t * 2.4) * 7, tilt: Math.sin(t * 2.4) * 4 }); fade(m, 0.03);
      b.setFace(Math.sin(t * 3) > -0.2 ? 'cry' : 'sad'); env.update(t);
    };
  },
  // 25 "But I couldn't see who."  — over faint Hazel's shoulder at the newel post: the bundle rocking by itself
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, 0, 0.03, 'teary', 0, 'cry');
    const h = hazel(S, 'confused', [6.6, 0, 2.8], -122, 0.12);
    return (t, dur) => {
      camPath(cam, t / dur, [9.4, 6.0, 6.8], [9.0, 5.8, 6.0], [0.4, 3.4, -1.4], [0.2, 3.4, -1.4], 30, 34);
      pose(t, { bodyTilt: Math.sin(t * 2.4) * 7 }); fade(m, 0.03);
      h.pose(addPose(addPose(idle(t, 0.5), lookAt(h, b.root.position)), { lean: 8 * ramp(t, 0.2, 1.2), rFwd: 30 })); fade(h, 0.12);
      env.update(t);
    };
  },
  // 26 "Just a faint glow on the stairs."  — slow push: a faint, glowing shape of a woman, sitting on the step
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, 0, 0.1, 'sad', 0, 'sleepy');
    return (t, dur) => {
      camPath(cam, t / dur, [-3.4, 3.8, 9.5], [-2.0, 4.2, 7.0], [0, 3.6, -1.6], [0, 4.0, -1.6], 30, 34);
      pose(t, { bodyTilt: Math.sin(t * 1.8) * 4, nod: 12 }); fade(m, ramp(t, 0, 1.0) * 0.12 + 0.03);
      env.update(t);
    };
  },
  // 27 ""Mom?" I whispered."  — close on faint Hazel at the newel post
  (S, cam) => {
    const env = nightStairs(S); stairMom(S, 0, 0.12, 'sad', 0, 'sleepy').pose(0);
    const h = hazel(S, 'worried', [6.6, 0, 2.8], -122, 0.14);
    fill(S, [4.0, 5.5, 2.0], 4, 0x9ab8ff, 6);
    return (t, dur) => {
      faceCam(cam, t / dur, [6.6, 4.64, 2.8], -122, { dist: 6.0, lens: 36, side: 0.5, push: 0.6 });
      h.pose(addPose(addPose(idle(t, 0.5), talk(t, 0.6)), { lean: 6, rFwd: 40, rUp: -10, nod: 8 })); fade(h, 0.14);
      env.update(t);
    };
  },
  // 28 "She looked up. She was almost gone."  — close on Mom: she lifts her teary face toward Hazel, barely there
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, 0, 0.14, 'sad', 30, 'sleeping');
    fill(S, [1.5, 5.0, 3.0], 4, 0x9ab8ff, 7);
    return (t, dur) => {
      faceCam(cam, t / dur, [0, 4.54, SZ], 30, { dist: 6.0, lens: 38, side: -0.6, push: 0.9, look: -0.2 });
      const up = ramp(t, 0.3, 1.0);
      pose(t, { nod: 16 - 24 * up, turn: 14 * up }); fade(m, 0.14 + 0.03 * Math.sin(t * 2));
      if (t > 0.6) m.setFace('teary'); env.update(t);
    };
  },
  // 29 "Everyone thinks about the baby."  — memory (warm faded): Dad and two visitors beam golden thoughts into the crib; Mom, faint, folds laundry behind them
  (S, cam) => {
    const env = nursery(S); S.userData.look = 'flash';
    const b = bo(S, 'smile', [0, 0, 0]); b.root.rotation.set(-Math.PI / 2, 0, 0); b.root.position.set(2.5, 2.15, -5.9); S.userData.allowContact = [['bo', 'crib']];
    const d = dad(S, 'love', [-1.3, 0, -6.8], 80), v = mk(S, KIDS[1], 'k1', 'love', [6.2, 0, -4.4], -110), v2 = mk(S, KIDS[2], 'k2', 'starstruck', [-1.8, 0, -2.8], 120);
    const m = mom(S, 'sad', [-5.2, 0, -0.8], 25, 0.3);
    const T = [thoughts(S, 0xffd27a, 30), thoughts(S, 0xffd27a, 30), thoughts(S, 0xffd27a, 30)];
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 7.6, 8.5], [0.4, 7.2, 7.6], [0.6, 3.0, -4.2], [0.6, 3.2, -4.4], 22, 23);
      const B = V([2.5, 2.7, -6.8]);
      [d, v, v2].forEach((A, i) => { A.pose(addPose(idle(t, 0.6, i), lookAt(A, B))); T[i](headOf(A), B, 1, t + i * 0.3, 0.7); });
      m.pose(addPose(idle(t, 0.5, 3), { rFwd: 60 + Math.sin(t * 3) * 10, lFwd: 60 + Math.sin(t * 3 + 1) * 10, nod: 20 })); fade(m, 0.3);
      env.update(t);
    };
  },
  // 30 "Nobody thinks about the mom."  — memory: faint Mom at the sink, alone; Dad walks past, eyes on his phone
  (S, cam) => {
    familyKitchen(S, { flash: true });
    const m = mom(S, 'sad', [-6.2, 0, -4.5], 160, 0.3);
    const d = dad(S, 'neutral', [8, 0, 1.2], -90); const ph = box(S, [0.5, 0.8, 0.08], [0, 0, 0], std({ color: 0x1a1a1a, emissive: 0x6a9ad8, emissiveIntensity: 0.6 }), { r: 0.04, solid: false });
    return (t, dur) => {
      camPath(cam, t / dur, [-0.5, 5.4, 6.5], [-1.4, 5.2, 4.6], [-5.6, 4.0, -5.4], [-6.0, 4.0, -5.4], 28, 32);
      m.pose(addPose(idle(t, 0.4), { rFwd: 55 + Math.sin(t * 4) * 8, lFwd: 55 - Math.sin(t * 4) * 8, nod: 22, turn: 30 * ramp(t, 0.6, 1.0) - 30 * ramp(t, 1.8, 2.2) })); fade(m, 0.3);
      d.root.position.x = 8 - t * 3.4; d.pose(addPose(walk(t, 0.8, 24), { rFwd: 80, rUp: -14, nod: 22 })); hold(ph, d, 'R', [0, 0.2, 0.15]); ph.rotation.set(-0.6, -90 * D, 0);
    };
  },
  // 31 "Not even me."  — memory: Hazel munches cereal, nose in a comic, as faint Mom slides her a glass of juice. She never looks up.
  (S, cam) => {
    familyKitchen(S, { flash: true }); cerealBowl(S, [1.2, 2.8, -3.6]);
    const h = hazel(S, 'smile', [1.2, 0, -6.3], 0);
    const comic = box(S, [1.6, 1.1, 0.05], [0, 0, 0], std({ color: 0xf2c84a }), { r: 0, solid: false });
    const m = mom(S, 'softsmile', [-3.6, 0, -6.1], 40, 0.3); const gl = box(S, [0.45, 0.8, 0.45], [0, 0, 0], std({ color: 0xffa020, transparent: true, opacity: 0.85, roughness: 0.1 }), { r: 0.08, solid: false });
    return (t, dur) => {
      const p = t / dur; camPath(cam, p, [0.4, 5.2, 4.2], [0.8, 5.0, 2.4], [0, 3.8, -5.0], [0.6, 4.0, -5.4], 30, 34);
      h.pose(addPose(idle(t, 0.4), { rFwd: 70, lFwd: 70, rUp: -18, lUp: -18, nod: 22 })); hold(comic, h, 'R', [-0.6, 0.3, 0.2]);
      m.pose(addPose(idle(t, 0.4, 1), hit([[0, { rFwd: 40 }], [0.8, { rFwd: 85, lean: 10, nod: 18 }], [dur, { rFwd: 30 }]], t))); fade(m, 0.3);
      const k = ramp(t, 0.1, 0.8); if (t < 0.85) hold(gl, m, 'R', [0, 0.2, 0]); else gl.position.set(-1.2, 3.15, -3.4);
      if (t > dur * 0.6) m.setFace('sad');
    };
  },
  // 32 ""I thought I was the only one," she said."  — two-shot on the step: two faint glows side by side
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, -2.4, 0.16, 'teary', 15, 'sleeping');
    const h = stairHazel(S, 2.4, 0.16, 'sad', -15);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 4.6, 12.5], [0, 4.5, 11.0], [0, 3.6, -1.5], [0, 3.8, -1.5], 22, 24);
      pose(t, addPose(talk(t, 0.7), lookAt(m, headOf(h)))); fade(m, 0.16);
      h.pose(addPose(addPose(SITP, idle(t, 0.4, 1)), addPose(lookAt(h, headOf(m)), { rFwd: 40, lFwd: 40, rUp: -10, lUp: -10 }))); ghost(h, 0.16);
      env.update(t);
    };
  },
  // 33 "So I thought about her. Really hard."  — Hazel squeezes her eyes shut; golden motes start streaming from her to Mom
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, -2.4, 0.16, 'teary', 15);
    const h = stairHazel(S, 2.4, 0.18, 'thinking', -15); const th = thoughts(S, 0xffd27a, 70);
    return (t, dur) => {
      faceCam(cam, t / dur, [2.4, 4.54, SZ], -15, { dist: 6.6, lens: 36, side: 1.4, push: 1.0 });
      pose(t); fade(m, 0.16 + 0.1 * ramp(t, 1, dur));
      const sq = hit([[0.2, { nod: 0 }], [0.6, { nod: 8, tilt: 6 }]], t);
      h.pose(addPose(addPose(SITP, idle(t, 0.5)), addPose(sq, { rFwd: 80, lFwd: 80, rUp: -25, lUp: -25 }))); ghost(h, 0.18);
      if (t > 0.5) h.setFace(Math.sin(t * 1.5) > 0 ? 'sleeping' : 'thinking');
      th(headOf(h), headOf(m), ramp(t, 0.6, 1.4), t, 1.0); env.update(t);
    };
  },
  // 34 "Her pancakes shaped like dinosaurs."  — memory: Mom flips a dinosaur pancake high from the pan; little Hazel claps
  (S, cam) => {
    familyKitchen(S, { flash: true }); plate(S, [2.4, 2.82, -3.2]);
    const m = mom(S, 'laugh', [-1.8, 0, -6.6], 15), h = hazel(S, 'delighted', [2.8, 0, -6.6], -20);
    const pn = pan(S), pc = dinoPancake(S, [0, 0, 0], 0.9);
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 5.6, 6.0], [0.6, 5.2, 4.0], [0, 4.6, -5.0], [0, 4.4, -5.0], 28, 32);
      m.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 70, rUp: -8 }], [0.55, { rFwd: 60, rUp: -8, nod: 6 }], [0.75, { rFwd: 95, rUp: -8, nod: -10 }], [1.4, { rFwd: 70, rUp: -8, nod: 10 }]], t)));
      hold(pn, m, 'R', [0.3, 0.1, 0.9]); pn.rotation.set(0, -Math.PI / 2 + 0.4, 0);
      const f = ramp(t, 0.7, 1.5); const pp = pn.position;
      pc.position.set(pp.x + f * 0.4, pp.y + 0.12 + Math.sin(f * Math.PI) * 2.2, pp.z); pc.rotation.set(f * Math.PI * 2, 0, 0);
      h.pose(addPose(addPose(idle(t, 0.8, 1), lookAt(h, pc.position)), { rFwd: 70 + Math.max(0, Math.sin(t * 9)) * 20 * (t > 1.4 ? 1 : 0), lFwd: 70 + Math.max(0, Math.sin(t * 9)) * 20 * (t > 1.4 ? 1 : 0), rUp: -30, lUp: -30 }));
      if (t > 1.4) h.setFace('laugh');
    };
  },
  // 35 "Her terrible singing in the car."  — memory: Mom belts out a song at the wheel; Hazel covers her ears, laughing
  (S, cam) => {
    const env = carInside(S, { sunset: true }); S.userData.look = 'flash';
    const m = mom(S, 'laugh', [-2.3, 0, -0.4], 0), h = hazel(S, 'laugh', [2.3, 0, -0.4], 0); sitOn(m, 1.6); sitOn(h, 1.6); const inner = fill(S, [0, 5.6, 2.2], 14, 0xfff0e0, 10);
    S.userData.allowContact = [['mom', 'seat*'], ['hazel', 'seat*'], ['mom', 'floor'], ['hazel', 'floor']];
    return (t, dur) => {
      camPath(cam, t / dur, [0.3, 4.6, 9.0], [0.2, 4.6, 8.2], [0, 4.2, -0.4], [0, 4.3, -0.4], 26, 28); inner.intensity = 14;
      m.pose(addPose(addPose(SITP, talk(t, 2.2)), { rFwd: 70, lFwd: 70, rUp: -18, lUp: -18, nod: -10 + Math.sin(t * 4) * 6, tilt: Math.sin(t * 3) * 8 }));
      m.setFace(Math.sin(t * 5) > 0 ? 'laugh' : 'silly');
      h.pose(addPose(addPose(SITP, idle(t, 0.6)), { rUp: 12, lUp: 12, rFwd: 150, lFwd: 150, tilt: Math.sin(t * 6) * 4, turn: -20 })); env.wheel.rotation.z = Math.sin(t * 1.2) * 0.2;
      env.update(t);
    };
  },
  // 36 "How she saves me the last strawberry."  — memory: one strawberry left in the bowl; Mom picks it up and hands it over
  (S, cam) => {
    familyKitchen(S, { flash: true }); strawberryBowl(S, [0, 2.78, -3.0], 0);
    const m = mom(S, 'softsmile', [-2.5, 0, -6.8], 40), h = hazel(S, 'delighted', [2.5, 0, -6.8], -40);
    const sb = strawberry(S, 1.2);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 5.0, 5.5], [0, 4.8, 3.6], [0, 4.0, -5.2], [0, 4.2, -5.2], 28, 32);
      m.pose(addPose(idle(t, 0.5), hit([[0, { rFwd: 20 }], [0.5, { rFwd: 75, nod: 16 }], [1.1, { rFwd: 95, rUp: 0, nod: 4 }]], t)));
      h.pose(addPose(idle(t, 0.6, 1), hit([[0.6, { rFwd: 10 }], [1.2, { rFwd: 85, nod: 4 }]], t)));
      const k = ramp(t, 1.4, 1.9);
      if (t < 0.5) sb.position.set(0, 3.2, -3.0); else if (k <= 0) hold(sb, m, 'R', [0, 0.25, 0]); else { const a = pinky(m, 'R'), b = pinky(h, 'R'); sb.position.lerpVectors(a, b, k).y += 0.25; }
      if (t > 1.9) h.setFace('love');
    };
  },
  // 37 "Her hands came back first. Then her smile."  — Mom fills back in with Hazel's golden thoughts: hands, then her face
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, -2.4, 0.2, 'teary', 15);
    const h = stairHazel(S, 2.4, 0.2, 'thinking', -15); ghost(h, 0.2); const th = thoughts(S, 0xffd27a, 70);
    const warm = fill(S, [-2.4, 5.5, 1.5], 0, 0xffc880, 8);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      if (c === 0) camPath(cam, p, [-2.6, 3.6, 5.2], [-2.4, 3.8, 4.4], [-2.4, 2.8, -0.6], [-2.4, 3.0, -0.6], 34, 36);
      else faceCam(cam, p, [-2.4, 4.54, SZ], 15, { dist: 6.2, lens: 38, side: -0.4, push: 0.8 });
      const ka = ramp(t, 0.2, dur * 0.45), kh = ramp(t, dur * 0.45, dur * 0.85);
      fade(m, { armR: 0.2 + 0.8 * ka, armL: 0.2 + 0.8 * ka, head: 0.2 + 0.8 * kh, body: 0.2 + 0.55 * kh, legR: 0.2 + 0.3 * kh, legL: 0.2 + 0.3 * kh });
      pose(t, { nod: 18 - 10 * kh }); if (kh > 0.3) m.setFace('softsmile');
      h.pose(addPose(addPose(SITP, idle(t, 0.5)), { rFwd: 80, lFwd: 80, rUp: -25, lUp: -25, nod: 6 })); ghost(h, 0.2);
      th(headOf(h), headOf(m), 1, t, 1.0); warm.intensity = 8 * (ka + kh); env.update(t);
    };
  },
  // 38 "Then she thought about me too."  — the stream turns around: Mom's thoughts flow into Hazel, who fills in, amazed
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, -2.4, 0.8, 'love', 15);
    const h = stairHazel(S, 2.4, 0.2, 'teary', -45); const th = thoughts(S, 0xffd27a, 70), th2 = thoughts(S, 0xffd27a, 30);
    return (t, dur) => {
      faceCam(cam, t / dur, [2.4, 4.54, SZ], -45, { dist: 6.8, lens: 36, side: 0.4, push: 1.0 });
      pose(t, lookAt(m, headOf(h))); fade(m, { armR: 1, armL: 1, head: 1, body: 0.85, legR: 0.6, legL: 0.6 });
      const k = ramp(t, 0.4, dur * 0.85);
      fade(h, { head: 0.2 + 0.8 * k, body: 0.2 + 0.8 * k, armR: 0.2 + 0.8 * k, armL: 0.2 + 0.8 * k, legR: 0.1, legL: 0.1 });
      h.pose(addPose(addPose(SITP, idle(t, 0.5)), addPose(lookAt(h, headOf(m)), { rFwd: 40 + 20 * k, lFwd: 40 + 20 * k, rUp: -10, lUp: -10 })));
      if (k > 0.4) h.setFace('awe'); th(headOf(m), headOf(h), Math.min(1, ramp(t, 0.1, 0.6)), t, 1.0); th2(headOf(h), headOf(m), 0.5, t + 1, 1.2); env.update(t);
    };
  },
  // 39 "And my sneakers got their legs back."  — low angle: her legs fill in from the red sneakers up; she hops off the step, laughing
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, -2.4, 1, 'laugh', 15);
    const h = stairHazel(S, 2.4, 1, 'awe', -15); fill(S, [3.5, 4.5, 5], 14, 0xffd8b0, 12);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      const k = ramp(t, 0.1, dur * 0.48);
      fade(h, { legR: 0.1 + 0.9 * k, legL: 0.1 + 0.9 * k });
      const st = ramp(t, dur * 0.55, dur * 0.75);
      h.root.position.y = (STEP - 1.5) * (1 - st) + 0 * st + Math.sin(st * Math.PI) * 0.6; h.root.position.z = SZ + st * 2.6;
      h.pose(addPose(idle(t, 0.6), st > 0 ? hit([[dur * 0.55, { ...SITP, rUp: 40, lUp: 40 }], [dur * 0.75, { rUp: 150, lUp: 150 }], [dur, { rUp: 130, lUp: 140 }]], t) : { ...SITP, nod: 18, rFwd: 30, lFwd: 30 }));
      if (st > 0.2) h.setFace('laugh');
      pose(t, lookAt(m, headOf(h))); fade(m, 1);
      if (c === 0) camPath(cam, p, [5.6, 3.4, 7.6], [5.0, 3.6, 6.8], [2.4, 1.8, -0.2], [2.4, 2.6, -0.4], 30, 32);
      else camPath(cam, p, [0.6, 2.6, 11], [0.4, 3.0, 9.6], [0.8, 3.8, -0.4], [0.8, 4.2, -0.2], 26, 28);
      env.update(t);
    };
  },
  // 40 "Next morning, Dad finally saw her."  — morning kitchen: Dad turns from the fridge... and there she is, holding Bo
  (S, cam) => {
    familyKitchen(S);
    const d = dad(S, 'neutral', [5.2, 0, 0.2], 160), m = mom(S, 'smile', [-2.8, 0, 1.4], 60), b = bo(S, 'smile', [0, 0, 0]);
    S.userData.allowContact = [['mom', 'bo']];
    return (t, dur) => {
      camPath(cam, t / dur, [1.2, 5.0, 12.5], [1.0, 4.8, 11], [1.2, 3.8, 0.2], [1.0, 4.0, 0.2], 22, 24);
      const tr = ramp(t, 0.4, 1.0); d.root.rotation.y = (160 + 140 * tr) * D;
      d.pose(addPose(idle(t, 0.6), hit([[1.0, POSES.rest], [1.3, { lean: -10, rUp: 30, lUp: 30 }], [1.8, { rUp: 10, lUp: 10 }]], t)));
      d.setFace(t < 1.0 ? 'neutral' : t < 1.6 ? 'shock' : 'delighted');
      m.pose(addPose(HOLD, idle(t, 0.5, 1))); cradle(b, m);
    };
  },
  // 41 ""Honey! There you are!""  — Dad sweeps Mom into a hug; Hazel cheers behind the table
  (S, cam) => {
    familyKitchen(S);
    const d = dad(S, 'delighted', [1.25, 0, 1.8], -55), m = mom(S, 'laugh', [-1.25, 0, 1.8], 55);
    const h = hazel(S, 'laugh', [0, 0, -6.2], 0);
    S.userData.allowContact = [['dad', 'mom']];
    return (t, dur) => {
      camPath(cam, t / dur, [0.8, 5.2, 11.5], [0.5, 5.0, 10.0], [0, 4.2, 0.0], [0, 4.4, -0.2], 26, 28);
      d.pose(addPose(addPose(idle(t, 0.6), talk(t, 0.9)), hit([[0, { rFwd: 40, lFwd: 40 }], [0.4, HUG]], t)));
      m.pose(addPose(idle(t, 0.6, 1), hit([[0.1, POSES.rest], [0.5, HUG]], t)));
      h.pose(addPose(addPose(idle(t, 0.9, 2), anticipate(t, 0.8)), hit([[0.6, POSES.rest], [0.9, { rUp: 150, lUp: 150 }], [1.4, { rUp: 130, lUp: 140 }]], t)));
      h.root.position.y = t > 0.8 && t < 1.3 ? Math.sin((t - 0.8) / 0.5 * Math.PI) * 0.8 : 0;
    };
  },
  // 42 "Mister Fig is still see-through from the knees down."  — Fig on his porch admiring himself; Hazel walks by on the lawn
  (S, cam) => {
    houseFront(S, { sunPos: [-10, 14, 14] });
    const f = fig(S, 'proud', [-4.5, 0.6, -3.4], 15); const mir = handMirror(S); S.userData.allowContact = [['fig', 'porch deck']];
    const h = hazel(S, 'smile', [4.5, 0, 1.4], -90);
    return (t, dur) => {
      camPath(cam, t / dur, [3.5, 3.6, 15], [2.0, 3.8, 13.5], [-1.0, 3.4, -1.0], [-1.6, 3.4, -1.4], 24, 26);
      f.pose(addPose(idle(t, 0.6), { rFwd: 100, rUp: -14, nod: 4, turn: -14 })); hold(mir, f, 'R', [0, -0.2, 0]); mir.lookAt(headOf(f)); mir.rotateX(-Math.PI / 2);
      fade(f, { legR: 0.05 + 0.03 * Math.sin(t * 5), legL: 0.05 + 0.03 * Math.sin(t * 5 + 1) });
      h.root.position.x = 4.5 - Math.min(t, dur * 0.8) * 2.0; h.pose(t < dur * 0.8 ? addPose(walk(t, 0.9, 30), lookAt(h, headOf(f))) : addPose(idle(t, 0.6), lookAt(h, headOf(f))));
    };
  },
  // 43 "So now I think about him on Tuesdays."  — Hazel scrunches up a big think; golden motes fly to Fig and his legs flicker back in. He's thrilled.
  (S, cam) => {
    houseFront(S, { sunPos: [-10, 14, 14] });
    const f = fig(S, 'proud', [-4.5, 0.6, -3.4], 30); const mir = handMirror(S); S.userData.allowContact = [['fig', 'porch deck']];
    const h = hazel(S, 'thinking', [1.6, 0, 3.0], -60); const th = thoughts(S, 0xffd27a, 60);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [-2.0, 4.8, 12.5], [-1.6, 4.8, 11.5], [-1.2, 3.8, -0.4], [-1.4, 3.8, -0.6], 26, 28);
      else camPath(cam, p, [-2.6, 2.6, 5.0], [-2.8, 3.0, 4.6], [-4.5, 3.0, -3.4], [-4.5, 3.6, -3.4], 30, 32);
      const k = ramp(t, 0.4, dur * 0.7);
      h.pose(addPose(addPose(idle(t, 0.6), lookAt(h, headOf(f))), hit([[0.2, POSES.rest], [0.6, { rFwd: 60, lFwd: 60, rUp: -30, lUp: -30, tilt: 6 }]], t)));
      th(headOf(h), headOf(f).add(V([0, -2.4, 0])), Math.min(1, k * 2), t, 1.4);
      const lg = 0.05 + 0.5 * k; fade(f, { legR: lg + 0.05 * Math.sin(t * 6), legL: lg + 0.05 * Math.sin(t * 6 + 1) });
      f.pose(addPose(idle(t, 0.6), hit([[0.6, { rFwd: 100, rUp: -14 }], [1.2, { rFwd: 40, nod: 26 }], [dur, { rFwd: 40, nod: 20, rUp: 30, lUp: 30 }]], t)));
      hold(mir, f, 'R', [0, -0.2, 0]); mir.lookAt(headOf(f)); mir.rotateX(-Math.PI / 2);
      if (k > 0.3) f.setFace('delighted');
    };
  },
  // 44 "And every night, Mom and I think about each other."  — the stairs at night again, both solid now; two golden streams cross between them
  (S, cam) => {
    const env = nightStairs(S); const { m, b, pose } = stairMom(S, -2.4, 1, 'softsmile', 15, 'sleeping');
    const h = stairHazel(S, 2.4, 1, 'softsmile', -15); const a = thoughts(S, 0xffd27a, 40), c2 = thoughts(S, 0xffe0a0, 40);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.5, 3.8, 12.5], [0, 4.2, 10.2], [0, 3.6, -1.5], [0, 3.9, -1.5], 26, 28);
      pose(t, lookAt(m, headOf(h))); h.pose(addPose(addPose(SITP, idle(t, 0.5, 1)), addPose(lookAt(h, headOf(m)), { rFwd: 40, lFwd: 40, rUp: -10, lUp: -10 })));
      a(headOf(m), headOf(h), 0.8, t, 1.0); c2(headOf(h), headOf(m), 0.8, t + 0.7, 1.6); env.update(t);
    };
  },
  // 45 "You can't fade away"  — close: Mom pulls Hazel in under her arm
  (S, cam) => {
    const env = nightStairs(S);
    const m = mom(S, 'love', [-1.25, 0, SZ], 12); sitOn(m, STEP); const h = stairHazel(S, 1.25, 1, 'softsmile', -12);
    S.userData.allowContact = [['mom', 'hazel'], ['mom', 'step*']]; fill(S, [0, 6, 4], 5, 0xffc880, 9);
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 4.6, 8.6], [0.3, 4.6, 7.4], [0, 4.0, -1.5], [0, 4.1, -1.5], 32, 36);
      m.pose(addPose(addPose(SITP, idle(t, 0.4)), hit([[0, { lUp: 20, nod: 6 }], [0.7, { lUp: 95, lFwd: 20, tilt: -8, nod: 10 }]], t)));
      h.pose(addPose(addPose(SITP, idle(t, 0.4, 1)), hit([[0.5, { rFwd: 30, lFwd: 30 }], [1.1, { rFwd: 40, lFwd: 40, tilt: 10, bodyTilt: 4 }]], t)));
      env.update(t);
    };
  },
  // 46 "when someone holds on to you. [pause]"  — slow pull back and up: the two of them on the step, warm lamp, moonlight, the quiet house
  (S, cam) => {
    const env = nightStairs(S);
    const m = mom(S, 'love', [-1.25, 0, SZ], 12); sitOn(m, STEP); const h = stairHazel(S, 1.25, 1, 'sleepy', -12);
    S.userData.allowContact = [['mom', 'hazel'], ['mom', 'step*']]; fill(S, [0, 6, 4], 4, 0xffc880, 9);
    const a = thoughts(S, 0xffd27a, 30);
    return (t, dur) => {
      camPath(cam, t / dur, [0.3, 4.6, 7.8], [1.5, 9.0, 16.5], [0, 4.0, -1.5], [0, 4.8, -3.5], 34, 24);
      m.pose(addPose(SITP, { lUp: 95, lFwd: 20, tilt: -8, nod: 10, bob: Math.sin(t * 1.2) * 0.02 }));
      h.pose(addPose(SITP, { rFwd: 40, lFwd: 40, tilt: 10 + Math.sin(t * 0.8) * 2, bodyTilt: 4, nod: 6 }));
      if (t > dur * 0.5) h.setFace('sleeping');
      const hm = headOf(m), hh = headOf(h); a(hm.clone().add(V([0, 0.8, 0])), hh.clone().add(V([0, 0.8, 0])), 0.5, t, 0.8); env.update(t);
    };
  },
];
