import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn, pinky,
  houseFront, cafeteria, kidRoomDay, classroom, hallway, backyard, bedroom, cookieJar,
  fade, aura, thoughts, familyKitchen, nursery, nightStairs, mug, cerealBowl, plate, pizzaTray, slice, handMirror } from '../../engine/kit.js';
import { HAZEL, MOM, DAD, FIG, DOTTIE, ORTIZ, KIDS, mk, ghost, hazel, mom, dad, fig, bo, cradle, HOLD, head, clamp01, ramp, V, faceCam, fill, headOf } from './common.js';

// cafeteria with the lunch tables cleared away (a lunch line in front of a serving counter)
function lunchLine(S) { cafeteria(S); const kill = []; S.traverse(o => { if (o.isMesh && o.name.startsWith('box') && o.position.z > -5.2 && o.position.z < 0.5 && o.position.y > 0.5 && o.position.y < 3.4) kill.push(o); }); kill.forEach(o => o.parent.remove(o)); }
const hold = (obj, A, side = 'R', off = [0, 0, 0]) => { const p = pinky(A, side); obj.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); };
const above = (A, dy = 0.9) => headOf(A).add(new THREE.Vector3(0, dy, 0));
// Fig on his porch (deck top y 0.6), holding a hand mirror
function figPorch(S, face = 'proud') {
  houseFront(S, { sunPos: [-10, 14, 14] });
  const f = fig(S, face, [-4.5, 0.6, -3.4], 15); const mir = handMirror(S);
  S.userData.allowContact = [['fig', 'porch deck']];
  return { f, mir };
}
// the start-of-fade numbers for Hazel: hand first
const HAND = (k) => ({ armR: 0.25 + 0.75 * (1 - k), armL: 1 - 0.5 * k, body: 1 - 0.2 * k, head: 1 - 0.1 * k, legR: 1 - 0.25 * k, legL: 1 - 0.25 * k });

export const SHOTS_A = [
  // 2 "In this world,"  — crane down over a sunny street of houses; Mister Fig on his porch, a kid walks by on the lawn
  (S, cam) => {
    const { f, mir } = figPorch(S);
    const k = mk(S, KIDS[1], 'k1', 'smile', [14, 0, 9], -90);
    return (t, dur) => {
      camPath(cam, t / dur, [2, 16, 34], [1, 6.5, 22], [-2, 8, -6], [-2, 4.2, -4], 24, 26);
      f.pose(addPose(idle(t, 0.6), { rFwd: 95, rUp: -8, nod: 6, turn: -10 })); hold(mir, f, 'R', [0, -0.3, 0]); mir.rotation.y = Math.PI + 0.3;
      k.root.position.x = 14 - t * 2.6; k.pose(walk(t, 1, 30));
    };
  },
  // 3 "if nobody thinks about you, you start to fade."  — a girl waits on the lawn; two people walk past without a glance; she fades
  (S, cam) => {
    houseFront(S, { porch: false });
    const g = mk(S, KIDS[1], 'k1', 'smile', [0, 0, 4], 10);
    const a = mk(S, ORTIZ, 'ortiz', 'neutral', [-14, 0, 8.6], 90), b = mk(S, KIDS[2], 'k2', 'bored', [15, 0, 9.4], -90);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 4.6, 19], [1.2, 4.6, 14.5], [0, 3.6, 4], [0, 4.0, 4], 26, 30);
      const k = 1 - 0.78 * ramp(t, 0.4, dur - 0.3); fade(g, k);
      if (t > dur * 0.45) g.setFace('sad');
      g.pose(addPose(addPose(idle(t, 0.7), lookAt(g, a.root.position.clone().setY(4.6))), hit([[0, POSES.rest], [0.5, { rUp: 60, rFwd: 40 }], [1.2, POSES.rest]], t)));
      a.root.position.x = -14 + t * 4.4; a.pose(walk(t, 1, 28)); b.root.position.x = 15 - t * 4.2; b.pose(walk(t + 0.3, 1, 32));
    };
  },
  // 4 "You see, every thought about you keeps you solid."  — a boy turns, sees her, waves: golden motes flow to her and she fills back in
  (S, cam) => {
    houseFront(S, { porch: false });
    const g = mk(S, KIDS[1], 'k1', 'sad', [2.0, 0, 4], -30); const b = mk(S, KIDS[0], 'k0', 'neutral', [-2.6, 0, 6.0], 140);
    const th = thoughts(S, 0xffd27a, 70);
    return (t, dur) => {
      camPath(cam, t / dur, [-1, 5.0, 20], [-0.4, 4.8, 17], [-0.3, 4.0, 5], [0.0, 4.2, 5], 24, 27);
      const turn = ramp(t, 0.2, 0.8); b.root.rotation.y = (140 - 90 * turn) * D;
      b.pose(addPose(addPose(idle(t, 0.7, 1), lookAt(b, headOf(g))), hit([[0.6, POSES.rest], [1.0, POSES.wave], [1.25, { ...POSES.wave, rUp: 150 }], [1.5, POSES.wave]], t)));
      if (t > 0.7) b.setFace('grin');
      const k = ramp(t, 0.8, dur - 0.4); th(headOf(b), headOf(g), k > 0 ? Math.min(1, k * 3) : 0, t, 1.2);
      fade(g, 0.22 + 0.78 * k); if (k > 0.5) g.setFace('delighted');
      g.pose(addPose(idle(t, 0.7, 2), addPose(lookAt(g, headOf(b)), hit([[1.6, POSES.rest], [2.1, { rUp: 40, lUp: 40 }]], t))));
    };
  },
  // 5 "Mister Fig thinks about himself all day."  — on his porch, admiring himself in a hand mirror; his thoughts loop right back into his own head
  (S, cam) => {
    const { f, mir } = figPorch(S, 'proud'); const th = thoughts(S, 0xffd27a, 40);
    return (t, dur) => {
      faceCam(cam, t / dur, [-4.5, 5.24, -3.4], 15, { dist: 9.5, lens: 30, side: -1.2, push: 1.4, look: -0.7 });
      f.pose(addPose(addPose(idle(t, 0.6), { rFwd: 100, rUp: -14, nod: 4, turn: -14 }), { tilt: Math.sin(t * 1.4) * 5 }));
      hold(mir, f, 'R', [0, -0.2, 0]); mir.lookAt(headOf(f)); mir.rotateX(-Math.PI / 2);
      const h = headOf(f); th(h.clone().add(V([0.3, 0.5, 0.3])), h.clone().add(V([-0.3, 0.5, 0.3])), 0.8, t, 1.6);
      if (Math.sin(t * 2) > 0.6) f.setFace('wink'); else f.setFace('proud');
    };
  },
  // 6 "It doesn't count. He's see-through from the knees down."  — tilt down from his smug face to his see-through legs
  (S, cam) => {
    const { f, mir } = figPorch(S, 'smirk');
    return (t, dur) => {
      const p = t / dur;
      camPath(cam, p, [-2.6, 5.6, 6.0], [-2.8, 2.4, 6.8], [-4.5, 5.0, -3.4], [-4.5, 1.6, -3.4], 30, 30);
      f.pose(addPose(idle(t, 0.6), { rFwd: 100, rUp: -14, nod: 4, turn: -14 })); hold(mir, f, 'R', [0, -0.2, 0]); mir.lookAt(headOf(f)); mir.rotateX(-Math.PI / 2);
      fade(f, { legR: 0.05 + 0.03 * Math.sin(t * 5), legL: 0.05 + 0.03 * Math.sin(t * 5 + 1) });
      if (p > 0.55) f.setFace('confused');
    };
  },
  // 7 "Miss Dottie makes pizza every Friday."  — cafeteria serving counter, she lifts a hot slice with a flourish
  (S, cam) => {
    lunchLine(S); box(S, [9, 2.8, 1.6], [0, 1.4, -5.6], std({ color: 0xc8ccd2, metalness: 0.5, roughness: 0.4 }), { r: 0.05, name: 'serving counter' });
    const tray = pizzaTray(S, [-1.2, 2.86, -5.6]); const sl = slice(S);
    const d = mk(S, DOTTIE, 'dottie', 'delighted', [1.4, 0, -7.4], -8);
    fill(S, [1, 7, -2], 10, 0xfff0d8);
    return (t, dur) => {
      camPath(cam, t / dur, [2.6, 5.6, 4.5], [1.8, 5.2, 1.5], [0.6, 4.2, -6.8], [1.0, 4.4, -7.0], 28, 32);
      const up = hit([[0.2, { rFwd: 60, rUp: -10 }], [0.8, { rFwd: 120, rUp: 10 }], [1.4, { rFwd: 110, rUp: 30 }]], t);
      d.pose(addPose(addPose(idle(t, 0.7), up), addPose(talk(t, 0.4), lookAt(d, cam.position))));
      hold(sl, d, 'R', [0, 0.1, 0.2]); sl.rotation.set(0.3, 0, 0);
      tray.userData.slices[0].visible = false;
    };
  },
  // 8 "Everyone thinks about her. She practically glows."  — kids line up, golden motes pour in from every one of them; she glows
  (S, cam) => {
    lunchLine(S); box(S, [12, 2.8, 1.6], [0, 1.4, -5.6], std({ color: 0xc8ccd2, metalness: 0.5, roughness: 0.4 }), { r: 0.05, name: 'serving counter' });
    pizzaTray(S, [-3, 2.86, -5.6]); pizzaTray(S, [3, 2.86, -5.6]);
    const d = mk(S, DOTTIE, 'dottie', 'laugh', [0, 0, -7.4], 0);
    const K = [[-3.4, 0, -1.4, 165], [3.4, 0, -1.4, 195]].map(([x, y, z, r], i) => mk(S, KIDS[i], 'k' + i, 'starstruck', [x, y, z], r));
    const T = K.map(() => thoughts(S, 0xffd27a, 34)); const glow = fill(S, [0, 5, -6.2], 0, 0xffc860, 10);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 7.6, 9.5], [0, 7.0, 7.0], [0, 4.0, -5.6], [0, 4.6, -7.0], 26, 30);
      const k = ramp(t, 0.3, dur * 0.8);
      K.forEach((A, i) => { A.pose(addPose(idle(t, 0.8, i), addPose(lookAt(A, headOf(d)), hit([[0.3 + i * 0.2, POSES.rest], [0.7 + i * 0.2, { rFwd: 165 }], [1.2 + i * 0.2, { rFwd: 150 }]], t)))); T[i](headOf(A), headOf(d), Math.min(1, k * 2), t + i, 1.4); });
      aura(d, k * 0.3); glow.intensity = 4 * k;
      d.pose(addPose(idle(t, 0.8), hit([[0.4, POSES.rest], [1.0, { rUp: 60, lUp: 60, nod: -8 }]], t)));
    };
  },
  // 9 "I'm Hazel. I'm ten."  — her bedroom: she spins round to camera and waves
  (S, cam) => {
    kidRoomDay(S);
    const h = hazel(S, 'grin', [0.5, 0, -3], 160);
    return (t, dur) => {
      faceCam(cam, t / dur, [0.5, 4.64, -3], 0, { dist: 7.6, lens: 32, side: 0.6, push: 1.2 });
      h.root.rotation.y = (160 * (1 - Math.min(1, require01(t / 0.5)))) * D;
      h.pose(addPose(addPose(idle(t, 0.8), talk(t, 0.3)), hit([[0.3, POSES.rest], [0.7, POSES.wave], [1.0, { ...POSES.wave, rUp: 150 }], [1.3, POSES.wave], [1.6, { ...POSES.wave, rUp: 150 }]], t)));
      if (t > 1.2) h.setFace('smile');
    };
  },
  // 10 "Then my baby brother Bo was born."  — nursery: Mom cradles Bo, Dad beams, Hazel leans in to look
  (S, cam) => {
    const env = nursery(S);
    const m = mom(S, 'love', [-1.2, 0, -2.8], 10), d = dad(S, 'delighted', [3.2, 0, -2.4], -25), b = bo(S, 'sleeping', [0, 0, 0]);
    const h = hazel(S, 'awe', [-5.8, 0, -0.2], 40);
    S.userData.allowContact = [['mom', 'bo']];
    return (t, dur) => {
      camPath(cam, t / dur, [-1.0, 5.4, 12.5], [-0.8, 5.0, 10.5], [-0.8, 3.8, -2.6], [-0.8, 3.6, -2.6], 22, 24);
      m.pose(addPose(HOLD, addPose(idle(t, 0.5), { tilt: Math.sin(t * 1.5) * 4 }))); cradle(b, m);
      d.pose(addPose(idle(t, 0.7, 1), addPose(lookAt(d, b.root.position), hit([[0.6, POSES.rest], [1.1, { lUp: 50, lFwd: 40 }]], t))));
      h.pose(addPose(idle(t, 0.7, 2), addPose(lookAt(h, b.root.position), { lean: 6 })));
      env.update(t);
    };
  },
  // 11 "Now everyone only thinks about Bo."  — Bo in the crib, Mom and Dad pour golden thoughts into it; Hazel in the foreground, unnoticed, a little faint
  (S, cam) => {
    const env = nursery(S);
    const b = bo(S, 'smile', [0, 0, 0]); b.root.rotation.set(-Math.PI / 2, 0, 0); b.root.position.set(2.5, 2.15, -5.9); S.userData.allowContact = [['bo', 'crib']];
    const m = mom(S, 'love', [-0.7, 0, -6.6], 80), d = dad(S, 'love', [5.7, 0, -6.6], -80);
    const h = hazel(S, 'smile', [-3.6, 0, -0.6], 60, 0.85);
    const tm = thoughts(S, 0xffd27a, 40), td = thoughts(S, 0xffd27a, 40);
    return (t, dur) => {
      camPath(cam, t / dur, [1.0, 6.4, 9.5], [0.6, 6.0, 8.0], [0.9, 3.4, -5.0], [0.7, 3.6, -4.6], 24, 25);
      const B = V([2.5, 2.7, -6.8]);
      m.pose(addPose(idle(t, 0.5), lookAt(m, B))); d.pose(addPose(idle(t, 0.5, 1), lookAt(d, B)));
      tm(headOf(m), B, 1, t, 0.8); td(headOf(d), B, 1, t + 0.5, 0.8);
      const k = ramp(t, 0.6, dur); ghost(h, 0.85 - 0.35 * k); if (t > dur * 0.5) h.setFace('sad');
      h.pose(addPose(idle(t, 0.6, 2), addPose(lookAt(h, B), { lUp: 10 * k })));
      env.update(t);
    };
  },
  // 12 "This morning, I could see my cereal through my hand."  — breakfast: she lifts her hand... and the cereal bowl shows right through it
  (S, cam) => {
    familyKitchen(S);
    const bowl = cerealBowl(S, [0.0, 2.8, -3.6]);
    const h = hazel(S, 'neutral', [0, 0, -5.8], 0);
    fill(S, [0, 6, -1], 8, 0xfff0d8);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      const k = ramp(t, 0.4, dur * 0.6);
      h.pose(addPose(idle(t, 0.5), hit([[0.2, { rFwd: 30, nod: 16 }], [0.9, { rFwd: 78, rUp: -8, nod: 10 }]], t)));
      fade(h, HAND(k));
      if (c === 0) camPath(cam, p, [2.4, 6.6, 2.4], [1.6, 6.2, 1.0], [0, 3.6, -4.2], [0, 3.6, -4.4], 30, 32);
      else { camPath(cam, p, [1.4, 5.4, 1.6], [1.1, 5.2, 0.9], [0.0, 3.8, -4.2], [0.0, 3.9, -4.4], 32, 34); }
      if (t > dur * 0.5) h.setFace('shock');
    };
  },
  // 13 "At first, it was kind of fun."  — half-faded Hazel twirls and hops in the kitchen
  (S, cam) => {
    familyKitchen(S);
    const h = hazel(S, 'grin', [0, 0, 1.5], 0, 0.5);
    return (t, dur) => {
      camPath(cam, t / dur, [2.6, 3.4, 12.5], [1.4, 3.0, 10.5], [0, 3.6, 1.5], [0, 3.8, 1.5], 28, 30);
      const j = Math.max(0, Math.sin(Math.max(0, t - 0.9) * 5.2)) * (t > 0.9 && t < 0.9 + Math.PI / 5.2 ? 1 : 0);
      h.root.position.y = j * 1.2; h.root.rotation.y = Math.min(1, ramp(t, 0.9, 1.5)) * Math.PI * 2;
      h.pose(addPose(addPose(idle(t, 0.8), anticipate(t, 0.9)), hit([[0.2, POSES.rest], [0.9, { rUp: 150, lUp: 150 }], [1.7, { rUp: 60, lUp: 60 }]], t)));
      if (t > 1.0) h.setFace('laugh'); ghost(h, 0.5);
    };
  },
  // 14 "I took three cookies, and nobody saw."  — Dad reads the paper; the cookie jar lid lifts and three cookies float away in a see-through hand
  (S, cam) => {
    familyKitchen(S);
    const d = dad(S, 'bored', [2.0, 0, -5.4], -20);
    const paper = box(S, [2.4, 1.6, 0.05], [0, 0, 0], std({ color: 0xece8dc }), { r: 0, solid: false });
    const h = hazel(S, 'mischief', [-4.6, 0, -5.1], 190, 0.35);
    const cookies = [0, 1, 2].map(i => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16), std({ color: 0xb87a3a })); S.add(c); return c; });
    return (t, dur) => {
      camPath(cam, t / dur, [-1.0, 5.6, 6.0], [-2.0, 5.2, 4.0], [-2.6, 3.8, -6.0], [-3.2, 3.8, -6.0], 28, 32);
      d.pose(addPose(idle(t, 0.5, 1), { rFwd: 80, lFwd: 80, rUp: -18, lUp: -18, nod: 18 })); hold(paper, d, 'R', [-0.8, 0.5, 0.2]); paper.rotation.y = -20 * D;
      h.pose(addPose(idle(t, 0.6), hit([[0.2, POSES.rest], [0.6, { rFwd: 108, rUp: -10, lean: 4 }], [1.4, { rFwd: 80, rUp: -5 }], [dur - 0.4, { rFwd: 40 }]], t)));
      ghost(h, 0.35);
      const p = pinky(h, 'R'); const n = Math.min(3, Math.floor(ramp(t, 0.5, 1.6) * 3.99));
      cookies.forEach((c, i) => { if (i < n) c.position.set(p.x, p.y + 0.15 + i * 0.12, p.z); else c.position.set(-4.6 + i * 0.05, 3.3 + i * 0.1, -7.6); });
      if (t > 1.6) h.setFace('laugh');
    };
  },
  // 15 "I won hide and seek without even hiding."  — the seeker walks right past see-through Hazel standing in the open
  (S, cam) => {
    backyard(S);
    const s = mk(S, KIDS[0], 'k0', 'confused', [-9, 0, -2.4], 90);
    const h = hazel(S, 'mischief', [0.5, 0, 1.6], 20, 0.3);
    return (t, dur) => {
      camPath(cam, t / dur, [-3, 4.4, 16], [2, 4.4, 15], [-2, 3.6, 1.5], [2, 3.6, 1.5], 26, 26);
      s.root.position.x = -9 + t * 4.2; s.pose(addPose(walk(t, 0.8, 26), { turn: Math.sin(t * 2.4) * 40, rFwd: 25, lFwd: 25 }));
      h.pose(addPose(addPose(idle(t, 0.9), lookAt(h, headOf(s))), hit([[0.6, POSES.rest], [1.0, { rFwd: 100, lFwd: 100, rUp: -30, lUp: -30, nod: 10 }], [dur, { rFwd: 110, lFwd: 110, rUp: -30, lUp: -30 }]], t)));
      ghost(h, 0.3); if (t > 1.0) h.setFace('laugh');
    };
  },
  // 16 "I didn't notice Mom's mug, floating across the kitchen."  — Hazel eats; behind her a coffee mug drifts across the room all by itself
  (S, cam) => {
    familyKitchen(S); cerealBowl(S, [-1.6, 2.8, -3.6]);
    const h = hazel(S, 'smile', [-1.6, 0, -5.8], 0, 0.5);
    const m = mom(S, 'sleepy', [8, 0, 1.8], -90, 0.02); const mg = mug(S, 0xe8584a);
    return (t, dur) => {
      camPath(cam, t / dur, [-3.8, 5.0, 9.5], [-2.8, 4.6, 8.4], [0, 3.6, -2.0], [-1.0, 3.6, -2.0], 26, 28);
      m.root.position.x = 7.0 - t * 3.6; m.pose(addPose(walk(t, 0.6, 18), { rFwd: 60, rUp: -6 })); fade(m, 0.02);
      hold(mg, m, 'R', [0, -0.25, 0.1]);
      h.pose(addPose(idle(t, 0.5), { rFwd: 40 + Math.max(0, Math.sin(t * 5)) * 30, rUp: -12, nod: 14 + Math.sin(t * 5) * 4 }));
    };
  },
  // 17 "Or Dad, bumping into nothing. "Oops! Sorry, honey.""  — Dad walks straight into invisible Mom (her mug wobbles), staggers back, apologizes to the air
  (S, cam) => {
    familyKitchen(S);
    const m = mom(S, 'sleepy', [1.2, 0, 1.6], -90, 0.02); const mg = mug(S, 0xe8584a);
    const d = dad(S, 'neutral', [-7, 0, 1.6], 90);
    S.userData.allowContact = [['dad', 'mom']];
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.42]);
      const tb = Math.min(dur * 0.32, 1.1), x = -7 + Math.min(t, tb) * (5.3 / tb) - 0.9 * Math.sin(Math.PI * ramp(t, tb, tb + 0.6)) ;
      d.root.position.x = Math.min(x, -1.35); d.root.rotation.y = 90 * D;
      if (t < tb) d.pose(walk(t, 1, 34));
      else { d.root.position.x = -1.7 - 0.9 * ramp(t, tb, tb + 0.35); d.pose(addPose(hit([[tb, { lean: -14, rUp: 30, lUp: 30, nod: -10 }], [tb + 0.6, { rFwd: 30, turn: 25 }], [tb + 1.0, { rUp: 140, rFwd: 40, nod: 6, turn: 30 }]], t), t > tb + 0.6 ? talk(t, 0.8) : {})); }
      d.setFace(t < tb ? 'neutral' : t < tb + 0.6 ? 'shock' : 'nervous');
      m.pose(addPose(idle(t, 0.5), { rFwd: 60, rUp: -6, lean: t > tb ? -6 * Math.exp(-(t - tb) * 4) : 0 })); fade(m, 0.02);
      hold(mg, m, 'R', [0, -0.25, 0.1]); mg.rotation.z = t > tb ? Math.sin((t - tb) * 18) * 0.3 * Math.exp(-(t - tb) * 3) : 0;
      if (c === 0) camPath(cam, p, [-2.4, 4.8, 15], [-1.8, 4.8, 13.5], [-3.2, 3.6, 1.6], [-1.6, 3.6, 1.6], 22, 24);
      else faceCam(cam, p, [d.root.position.x, 4.64, 1.6], 70, { dist: 7.2, lens: 32, side: 0.4 });
    };
  },
  // 18 "Then it stopped being fun."  — close: her grin slowly falls
  (S, cam) => {
    familyKitchen(S);
    const h = hazel(S, 'grin', [0, 0, 0.5], 0, 0.35);
    fill(S, [1.5, 5.5, 6], 6, 0xfff0e0);
    return (t, dur) => {
      faceCam(cam, t / dur, [0, 4.64, 0.5], 0, { dist: 7.0, lens: 36, side: -0.6, push: 1.4 });
      h.pose(addPose(idle(t, 0.5), { nod: 6 * ramp(t, 0.6, dur), lUp: 0 }));
      h.setFace(t < dur * 0.35 ? 'grin' : t < dur * 0.6 ? 'neutral' : 'sad'); ghost(h, 0.35 - 0.05 * ramp(t, 0, dur));
    };
  },
  // 19 "Mom set the table for three."  — three plates float down and settle on the table; faint Hazel stares at the empty spot
  (S, cam) => {
    familyKitchen(S);
    const P = [-2.2, 0, 2.2].map(x => plate(S, [x, 2.82, -2.6]));
    const h = hazel(S, 'neutral', [-5.6, 0, -0.6], 60, 0.28);
    return (t, dur) => {
      camPath(cam, t / dur, [3.5, 8.6, 7.5], [2.2, 7.6, 6.0], [0, 2.8, -2.6], [-1.6, 3.2, -2.2], 26, 30);
      P.forEach((p, i) => { const k = ramp(t, 0.2 + i * 0.45, 0.7 + i * 0.45); p.position.y = 2.82 + (1 - k) * 2.2 + Math.sin(k * Math.PI) * 0.2; p.rotation.z = (1 - k) * 0.4 * Math.sin(t * 6 + i); });
      h.pose(addPose(idle(t, 0.5), lookAt(h, [0, 2.8, -2.6]))); if (t > 1.6) h.setFace('sad'); ghost(h, 0.28);
    };
  },
  // 20 "My teacher skipped my name."  — roll call: Hazel's faint hand shoots up; Mr. Ortiz looks right past her
  (S, cam) => {
    classroom(S); box(S, [18, 9, 0.4], [0, 4.5, 8.2], std({ color: 0x8a9a84 }), { r: 0, cast: false, name: 'front wall' });
    [[-5, 0x4f8ee8], [5, 0xe8c04f]].forEach(([x, c]) => box(S, [2.2, 2.8, 0.06], [x, 5.4, 7.95], std({ color: c }), { r: 0, cast: false, solid: false }));
    const o = mk(S, ORTIZ, 'ortiz', 'neutral', [-3.2, 0, -5.4], 25);
    const clip = box(S, [1.0, 1.3, 0.06], [0, 0, 0], std({ color: 0xc89a5a }), { r: 0, solid: false });
    const h = hazel(S, 'smile', [0, 0, 3.4], 180, 0.22), a = mk(S, KIDS[1], 'k1', 'smile', [-5, 0, 3.4], 180), b = mk(S, KIDS[2], 'k2', 'smile', [5, 0, 3.4], 180);
    return (t, dur) => {
      camPath(cam, t / dur, [2.0, 5.6, -6.0], [1.2, 5.2, -4.2], [0.2, 4.2, 3.4], [0.2, 4.4, 3.4], 28, 32);
      o.pose(addPose(addPose(idle(t, 0.5), talk(t, 0.5)), { rFwd: 70, rUp: -10, nod: 12 - 18 * ramp(t, 0.8, 1.2) + 18 * ramp(t, 1.8, 2.2), turn: 10 })); hold(clip, o, 'R', [0, 0.3, 0.2]); clip.rotation.set(-0.5, 25 * D, 0);
      h.pose(addPose(idle(t, 0.6), hit([[0.3, POSES.rest], [0.7, { rUp: 160, nod: -6 }], [dur * 0.65, { rUp: 160 }], [dur * 0.65 + 0.5, { rUp: 10, nod: 14 }]], t)));
      if (t > dur * 0.65) h.setFace('sad'); else if (t > 0.6) h.setFace('grin'); ghost(h, 0.22);
      a.pose(idle(t, 0.5, 1)); b.pose(idle(t, 0.5, 2));
    };
  },
  // 21 "By Friday, I was just a pair of sneakers."  — school hallway: a pair of red sneakers walks along by itself, low dolly
  (S, cam) => {
    hallway(S);
    const h = hazel(S, 'sad', [-8, 0, -1.5], 90, 0.015);
    return (t, dur) => {
      const x = -8 + t * 3.0; h.root.position.x = x; h.pose(walk(t, 0.85, 30)); fade(h, 0.015);
      camPath(cam, t / dur, [x - 3.5, 1.4, 7.5], [x - 2.0, 1.6, 6.8], [x, 1.0, -1.5], [x + 1.0, 1.2, -1.5], 28, 30);
    };
  },
  // 22 "That night, I tiptoed downstairs."  — dark stairs: only a pair of sneakers (and a faint shimmer) tiptoes down, step by step
  (S, cam) => {
    const env = nightStairs(S);
    const h = hazel(S, 'nervous', [1.0, 0, -6.5], 0, 0.04);
    S.userData.allowContact = [['hazel', 'step*']];
    return (t, dur) => {
      const zf = -6.5 + 7.0 * ramp(t, 0.2, dur - 0.2); h.root.position.z = zf;
      const ph = (-zf) - Math.floor(-zf);
      h.root.position.y = (zf < 0 ? 0.7 * (Math.floor(-zf) + 1) : 0) + 0.12 * Math.sin(Math.PI * ph);
      h.pose(addPose(walk(t, 0.55, 18), { lean: 4, rUp: 10, lUp: 10 })); fade(h, 0.04, { glowK: 0.45 });
      camPath(cam, t / dur, [3.5, 2.4, 11.5], [2.8, 2.4, 9.8], [1.0, 3.6, -6.5], [1.0, 1.8, -1.6], 26, 28);
      env.update(t);
    };
  },
];
function require01(x) { return Math.max(0, Math.min(1, x)); }
