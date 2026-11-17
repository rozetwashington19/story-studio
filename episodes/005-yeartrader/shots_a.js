import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn, HUDDLE, pinky,
  shopFront, shopInside, apartment, stoop, rainStreet, umbrella, coinBag, coinPour, lightStream, yearJar, paperSheet, pen, consoleBox, grayHair } from '../../engine/kit.js';
import { KAI, MOM, VESPER, GOLDWIN, BENNY, STRANGER, EXTRAS, mk, kai, mom, vesper, clockOf, head, clamp01, ramp, V, faceCam, fill,
  WRIST, SHOW, SHIVER, tremble, holdAt } from './common.js';

// walking with an umbrella in the right hand
const UMB = { rFwd: 65, rUp: -22 };
const walkU = (t, sp = 1) => ({ ...walk(t, sp, 30), ...UMB });
// cartwheel rig: wraps the avatar so it can spin around its middle
const wheel = (S, A) => { const g = new THREE.Group(); S.add(g); g.add(A.root); A.root.position.set(0, -2.65, 0); return g; };
const CART = { rUp: 160, lUp: 160, rLegOut: 32, lLegOut: 32 };
// customer stands in front of the shop counter facing it (ry 180) at z 0.2; Vesper behind it at z -5.4
const VZ = -5.9, CZ = 0.2;
const behindCounter = (cam, p, x0, x1, look, lens = 30) => camPath(cam, p, [x0 + 2.4, 6.0, -8.4], [x1 + 2.4, 5.8, -8.0], look, look, lens);

export const SHOTS_A = [
  // 1 "In this world,"  — crane down the rainy street to the glowing Time Exchange; lightning
  (S, cam) => {
    const env = shopFront(S, { lightning: [0.5] });
    const a = mk(S, EXTRAS[0], 'p1', 'neutral', [-12, 0, 2.5], 90), b = mk(S, EXTRAS[1], 'p2', 'neutral', [12, 0, 5.5], -90);
    const ua = umbrella(S, 0x3a3a5a), ub = umbrella(S, 0x7a2a2a);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 15, 26], [0.5, 6.5, 19], [-0.6, 8, -6], [0, 4.2, -6], 24);
      a.root.position.x = -12 + t * 3.2; a.pose(walkU(t)); holdAt(ua, a);
      b.root.position.x = 12 - t * 2.8; b.pose(walkU(t + 0.3)); holdAt(ub, b);
      env.update(t, cam);
    };
  },
  // 2 "you can sell years of your life for money."  — a man's clock drains into a jar; coins slide back
  (S, cam) => {
    const env = shopInside(S);
    const m = mk(S, STRANGER, 'man', 'nervous', [-0.4, 0, CZ + 0.3], 180); m.clock = clockOf(m, 52, { light: 1.6 });
    const v = vesper(S, 'neutral', [0.0, 0, VZ], 0);
    const jar = yearJar(S, [-2.4, 3.15, -3.3], 0x8af0ff, { light: 1.6 });
    const st = lightStream(S, 0x8af0ff), pour = coinPour(S, [1.2, 4.4, -3.9], [-0.8, 3.15, -3.0], 30);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.55]);
      if (c === 0) behindCounter(cam, p, 3.2, 2.6, [-1.4, 3.8, -0.6], 30);
      else camPath(cam, p, [-5.5, 4.4, -0.5], [-5.0, 4.3, -0.9], [-1.0, 3.6, -3.0], [-1.0, 3.6, -3.0], 34);
      m.pose(addPose(hit([[0, POSES.rest], [0.4, SHOW]], t), addPose(idle(t, 0.5), SHIVER(t))));
      const k = ramp(t, 0.5, dur * 0.7); m.clock.set(52 - 5 * k);
      st(m.clock.world(), jar.position.clone().setY(3.7), k > 0 && k < 1 ? 1 : 0, t, 0.6);
      jar.userData.core.scale.setScalar(1 + k * 0.3);
      v.pose(addPose(hit([[0, POSES.rest], [dur * 0.6, { rFwd: 95, rUp: -10 }]], t), idle(t, 0.4))); pour(ramp(t, dur * 0.6, dur * 0.95));
      if (k >= 1) m.setFace('worried');
      env.update(t, cam);
    };
  },
  // 3 "You see, everyone wears a clock that counts their years. [pause]"  — umbrellas pass, every wrist glows; close on one
  (S, cam) => {
    const env = rainStreet(S);
    const P = [[EXTRAS[0], 'e0', -9, 1.0, 0x3a3a5a, 34], [EXTRAS[1], 'e1', -15, 4.8, 0x7a2a2a, 61], [EXTRAS[2], 'e2', -3, -2.6, 0x2a6a4a, 8]]
      .map(([o, n, x, z, col, y]) => { const A = mk(S, o, n, 'neutral', [x, 0, z], 90); A.clock = clockOf(A, y, { light: 1.6 }); A.u = umbrella(S, col); A.x0 = x; return A; });
    const g = mk(S, EXTRAS[2], 'girl', 'smile', [200, 0, 0], 0); g.clock = clockOf(g, 64, { light: 1.6 }); const gu = umbrella(S, 0x2a6a4a);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      P.forEach((A, i) => { A.root.visible = A.u.visible = c === 0; A.root.position.x = A.x0 + t * 2.6; const w = walkU(t + i * 0.4); w.lFwd = 30; A.pose(w); holdAt(A.u, A); });
      g.root.position.set(c === 0 ? 200 : 0, 0, 2);
      if (c === 0) camPath(cam, p, [-2, 5.5, 18], [2, 5.0, 16], [-3, 3.5, 0], [1, 3.4, 0], 26);
      else { const lt = t - dur * 0.5; g.pose(addPose(hit([[0, UMB], [0.5, { ...UMB, ...SHOW }]], lt), idle(t, 0.4))); holdAt(gu, g);
        g.setFace(lt > 0.6 ? 'grin' : 'smile'); camPath(cam, p, [1.4, 4.6, 8.6], [1.2, 4.4, 7.6], [0.9, 4.0, 2], [0.6, 4.3, 2], 36); }
      env.update(t, cam);
    };
  },
  // 4 "Mrs. Goldwin buys more years every week."  — she sweeps out of the shop, clock ticking up, umbrella twirl
  (S, cam) => {
    const env = shopFront(S);
    const g = mk(S, GOLDWIN, 'goldwin', 'proud', [3.5, 0, -5.5], 0); g.clock = clockOf(g, 198, { light: 1.6 }); const u = umbrella(S, 0xe85a9a, 2.0);
    return (t, dur) => {
      camPath(cam, t / dur, [7, 2.6, 7.5], [6, 2.4, 6.5], [3.5, 5.2, -3], [3.2, 5.0, -2], 26);
      const z = -5.5 + Math.min(t, 1.6) * 2.2; g.root.position.z = z;
      const w = t < 1.6 ? walk(t, 1.1, 30) : idle(t, 0.6);
      g.pose(addPose(w, hit([[0, UMB], [1.6, UMB], [1.9, { ...UMB, ...SHOW, tilt: -8, nod: -8 }]], t)));
      holdAt(u, g); u.rotation.y = t * 3;
      g.clock.set(198 + 5 * ramp(t, 1.7, Math.max(2.2, dur - 0.4))); if (t > 1.9) g.setFace('starstruck');
      env.update(t, cam);
    };
  },
  // 5 "She's two hundred, and she still does cartwheels."  — cartwheels down the wet street past a stunned man
  (S, cam) => {
    const env = rainStreet(S);
    const g = mk(S, GOLDWIN, 'goldwin', 'delighted', [0, 0, 0], 0); const W = wheel(S, g);
    const m = mk(S, EXTRAS[1], 'man', 'neutral', [6.5, 0, -2.2], -30); const mu = umbrella(S, 0x7a2a2a);
    S.userData.allowContact = [['goldwin', 'ground']];
    return (t, dur) => {
      const x = -11 + t * 5.2; W.position.set(x, 2.65, 2.2); W.rotation.z = -(x + 11) / 2.65;
      g.pose(addPose(CART, { tilt: Math.sin(t * 6) * 4 }));
      m.pose(addPose(UMB, addPose(idle(t, 0.4), lookAt(m, [x, 2.6, 2.2])))); holdAt(mu, m);
      if (x > 0) m.setFace('shock');
      camPath(cam, t / dur, [-4, 3.2, 14], [3, 3.4, 13], [x * 0.7, 3, 1], [x * 0.7, 3, 1], 26);
      env.update(t, cam);
    };
  },
  // 6 "Benny sold one year for a new game console."  — Benny at the counter hugging the box, clock ticks down one
  (S, cam) => {
    const env = shopInside(S);
    const b = mk(S, BENNY, 'benny', 'grin', [-0.6, 0, CZ + 0.6], 180); b.clock = clockOf(b, 80, { light: 1.6 }); b.beardMesh.visible = false;
    const v = vesper(S, 'smirk', [0.0, 0, VZ], -10); const box = consoleBox(S);
    return (t, dur) => {
      behindCounter(cam, t / dur, 3.4, 2.8, [-0.8, 3.9, 0.4], 30);
      b.pose(addPose(hit([[0, { rFwd: 40, lFwd: 40 }], [0.4, { rFwd: 62, lFwd: 62, rUp: -24, lUp: -24, nod: 10 }]], t), addPose(idle(t, 0.5), { bob: Math.abs(Math.sin(t * 7)) * 0.05 })));
      const hr = pinky(b, 'R'), hl = pinky(b, 'L'); box.position.copy(hr).add(hl).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.45, 0)); box.rotation.y = Math.PI;
      b.clock.set(80 - ramp(t, dur * 0.4, dur * 0.55)); if (t > dur * 0.55) b.setFace('laugh');
      v.pose(addPose(idle(t, 0.4), lookAt(v, [-0.6, 4.4, 0.8])));
      env.update(t, cam);
    };
  },
  // 7 "He grew a mustache. He's eleven."  — pop! the mustache appears; grin -> shock -> pout
  (S, cam) => {
    const env = shopInside(S);
    const b = mk(S, BENNY, 'benny', 'laugh', [-0.6, 0, CZ + 0.6], 180); b.clock = clockOf(b, 79, { light: 1.5 });
    const box = consoleBox(S);
    return (t, dur) => {
      faceCam(cam, t / dur, head(-0.6, CZ + 0.6), 180, { dist: 6.4, lens: 38, side: -0.6, push: 0.7 });
      const k = ramp(t, dur * 0.2, dur * 0.32); b.beardMesh.scale.setScalar(Math.max(0.01, k <= 0 ? 0.01 : 1 + Math.sin(k * Math.PI) * 0.6)); b.beardMesh.visible = k > 0;
      b.setFace(t < dur * 0.22 ? 'laugh' : t < dur * 0.62 ? 'shock' : 'pout');
      b.pose(addPose(hit([[0, { rFwd: 62, lFwd: 62, rUp: -24, lUp: -24 }], [dur * 0.22, { rFwd: 62, lFwd: 62, rUp: -24, lUp: -24 }], [dur * 0.32, { rFwd: 62, lFwd: 62, rUp: -24, lUp: -24, nod: -12, bob: 0.1 }], [dur * 0.65, { rFwd: 55, lFwd: 55, rUp: -20, lUp: -20, nod: 16, tilt: 10 }]], t), idle(t, 0.4)));
      const hr = pinky(b, 'R'), hl = pinky(b, 'L'); box.position.copy(hr).add(hl).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.45, 0)); box.rotation.y = Math.PI;
      env.update(t, cam);
    };
  },
  // 8 "I'm Kai. I'm eleven."  — Kai by the rainy window waves, then a close-up
  (S, cam) => {
    const env = apartment(S);
    const k = kai(S, 'grin', [2.5, 0, -5.2], -10);
    fill(S, [1.5, 6, -1], 8, 0xffc890);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [-0.5, 4.8, 6], [0, 4.6, 4.8], [2.2, 4.2, -6], [2.2, 4.2, -6], 28);
      else faceCam(cam, p, head(2.5, -5.2), -10, { dist: 6.4, lens: 36, side: 0.6 });
      k.pose(addPose(hit([[0, POSES.rest], [0.4, POSES.wave], [dur * 0.5, POSES.wave], [dur * 0.5 + 0.3, { rUp: 10, lUp: 8, tilt: 6 }]], t), { rUp: t < dur * 0.5 ? Math.sin(t * 10) * 12 : 0, ...idle(t, 0.4) }));
      if (t > dur * 0.5) k.setFace('smile');
      env.update(t, cam);
    };
  },
  // 9 "And my clock says ninety years. [pause]"  — he lifts his wrist; cyan glow on his face
  (S, cam) => {
    const env = apartment(S);
    const k = kai(S, 'smile', [2.5, 0, -5.2], -10, { light: 1.6 });
    return (t, dur) => {
      faceCam(cam, t / dur, head(2.5, -5.2, 4.2), -10, { dist: 7, lens: 34, side: 0.4, push: 1.4, look: -0.4 });
      k.pose(addPose(hit([[0, POSES.rest], [0.5, { ...SHOW, lFwd: 80, lUp: -30, nod: 16, turn: 12 }]], t), idle(t, 0.4)));
      k.clock.glow(1 + 0.3 * Math.sin(t * 3)); if (t > dur * 0.4) k.setFace('proud');
      env.update(t, cam);
    };
  },
  // 10 "My mom's clock? I've never seen it."  — Mom sorting bills; Kai glances at her covered wrist
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'neutral', [4.5, 0, -5.2], 0), k = kai(S, 'thinking', [0.4, 0, -1.2], 110);
    fill(S, [3, 6, 0], 10, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [7.6, 5.2, 7.5], [6.8, 5.0, 6.4], [2.2, 3.8, -3.6], [2.4, 3.8, -3.8], 28);
      m.pose(addPose({ rFwd: 40, lFwd: 30, nod: 26, lean: 6 }, addPose(idle(t, 0.5), { rFwd: Math.sin(t * 3) * 8 })));
      k.pose(addPose(idle(t, 0.5), lookAt(k, t < dur * 0.5 ? [4.5, 4.6, -5.2] : [6.0, 2.7, -4.6])));
      if (t > dur * 0.5) k.setFace('confused');
      env.update(t, cam);
    };
  },
  // 11 "She always keeps her sleeve pulled down."  — she tugs the sleeve over her wrist, a nervous glance
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'neutral', [4.5, 0, -5.2], 0, { sleeve: 0.25 });
    fill(S, [4.5, 5, -1], 8, 0xffc890);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [2.6, 4.6, 1.0], [2.9, 4.4, 0.2], [5.2, 3.3, -4.4], [5.2, 3.3, -4.4], 32);
      else faceCam(cam, p, head(4.5, -5.2), 0, { dist: 6.4, lens: 36, side: 0.8 });
      const k = ramp(t, 0.2, dur * 0.45); m.sleeve.pull(0.25 * (1 - k));
      m.pose(addPose({ lFwd: 55, lUp: -18, rFwd: 58, rUp: -36, nod: 18 }, addPose(idle(t, 0.4), { rFwd: Math.sin(t * 12) * 4 * (1 - k) })));
      if (c === 1) { m.setFace('nervous'); m.pose(addPose({ lFwd: 55, lUp: -18, rFwd: 58, rUp: -36, nod: 6, turn: -20 + Math.sin(t * 2) * 4 }, idle(t, 0.4))); }
      env.update(t, cam);
    };
  },
  // 12 "Lately, she's tired all the time."  — Mom nods off on the couch; Kai watches, worried
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'sleepy', [-3.5, 0, -5.3], 0); sitOn(m, 1.6);
    const k = kai(S, 'worried', [0.8, 0, -1.2], -60); fill(S, [-1.5, 5.5, -1], 12, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [-1, 4.6, 8], [-1.4, 4.2, 5.8], [-2.2, 3.2, -4.5], [-2.6, 3.0, -4.8], 28);
      const s = ramp(t, 0.3, dur * 0.8);
      m.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 20, lFwd: 22, rUp: -10, lUp: -10 }, { nod: 8 + s * 22, tilt: s * 16, lean: -6, bob: Math.sin(t * 2) * 0.02 }));
      m.setFace(s < 0.4 ? 'sleepy' : s < 0.6 ? 'yawn' : 'sleeping');
      k.pose(addPose(idle(t, 0.5), addPose(lookAt(k, [-3.5, 3.1, -5.3]), { rFwd: 15, lFwd: 15 })));
      env.update(t, cam);
    };
  },
  // 13 "And every night, she slips out into the rain."  — out the door, umbrella up, down the steps; Kai peeks from the doorway
  (S, cam) => {
    const env = stoop(S, { lightning: [] });
    const m = mom(S, 'nervous', [0, 1.5, -5.4], 0, { light: 0 }); const u = umbrella(S, 0x2a2a3a, 2.0);
    const k = kai(S, 'worried', [200, 1.5, -7.2], 0, { light: 0.0 });
    return (t, dur) => {
      env.door.rotation.y = 1.6 * ramp(t, 0, 0.4);
      const u1 = ramp(t, 0.2, dur * 0.5), u2 = ramp(t, dur * 0.5, dur);
      const z = -5.4 + u1 * 4.4, x = u2 * 6.5, zf = z - 0.45; const y = zf < -5.1 ? 1.5 : zf < -4.3 ? 1.0 : zf < -3.5 ? 0.5 : 0;
      m.root.position.set(x, y, z); m.root.rotation.y = (u2 > 0 ? 90 : 0) * D * Math.min(1, u2 * 4);
      m.pose(addPose({ ...walk(t, 0.9, z < -3.0 ? 0 : 30), rFwd: 65, rUp: -22 }, { nod: 10 })); holdAt(u, m); u.visible = t > 0.6;
      if (t > dur * 0.45) { k.root.position.set(0, 1.5, -5.45); k.pose(addPose(idle(t, 0.4), addPose(lookAt(k, [x, 4, z]), { lean: 8 }))); }
      camPath(cam, t / dur, [-6, 4.2, 9], [-4.5, 3.8, 8], [0.5, 3.5, -4], [3.5, 3.0, -3], 26);
      env.update(t, cam);
    };
  },
  // 14 "I thought she was sick."  — Kai alone hugging his knees on the couch; rain shadows crawl over him
  (S, cam) => {
    const env = apartment(S, { lamp: false, lightning: [0.9] });
    const k = kai(S, 'sad', [-3.5, 0, -4.7], 0, { light: 1.5 }); sitOn(k, 1.72);
    return (t, dur) => {
      camPath(cam, t / dur, [1.8, 4.6, 3.2], [1.2, 4.3, 2.2], [-3.5, 2.8, -5.0], [-3.5, 2.9, -5.0], 30);
      k.pose(addPose({ ...HUDDLE, rLeg: 86, lLeg: 86 }, { bob: Math.sin(t * 2.2) * 0.02, nod: 14 + Math.sin(t * 1.4) * 3, turn: 25 }));
      if (t > dur * 0.6) k.setFace('teary');
      env.update(t, cam);
    };
  },
  // 15 "I thought money could fix it."  — Kai at the table with the PAST DUE bills; looks up, determined
  (S, cam) => {
    const env = apartment(S);
    const k = kai(S, 'worried', [4.5, 0, 0.6], 180);
    fill(S, [4.5, 5.5, -5], 10, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [3.4, 5.2, -6.6], [3.8, 5.0, -5.8], [4.5, 3.8, 0.4], [4.5, 4.2, 0.6], 32);
      k.pose(addPose(hit([[0, { rFwd: 45, lFwd: 40, nod: 28, lean: 10 }], [dur * 0.55, { rFwd: 45, lFwd: 40, nod: 28, lean: 10 }], [dur * 0.7, { rFwd: 10, lFwd: 10, nod: -4, lean: 0 }]], t), idle(t, 0.4)));
      if (t > dur * 0.62) k.setFace('determined');
      env.update(t, cam);
    };
  },
  // 16 "So one night, I walked to the Time Exchange."  — hood up, he walks to the glowing door; tilt up to the sign
  (S, cam) => {
    const env = shopFront(S, { lightning: [] });
    const k = kai(S, 'determined', [-9, 0, 1.5], 70, { light: 1.5 });
    return (t, dur) => {
      const u = ramp(t, 0, dur * 0.9); const x = -9 + u * 11, z = 1.5 - u * 2.6; k.root.position.set(x, 0, z); k.root.rotation.y = (70 + u * 60) * D;
      k.pose(addPose(walk(t, 0.9, 30), { nod: 14 }));
      camPath(cam, t / dur, [x - 2, 3.6, 10], [x + 1.5, 2.6, 9], [x, 3.8, 0], [0, 7.4, -6], 26);
      env.update(t, cam);
    };
  },
  // 17 "Old Mr. Vesper peered over the counter."  — he rises into the lamp light, leans over to look at Kai
  (S, cam) => {
    const env = shopInside(S);
    const v = vesper(S, 'neutral', [0.4, 0, VZ - 0.5], 0), k = kai(S, 'nervous', [2.8, 0, CZ + 0.6], 190, { light: 0.0 }); fill(S, [0.2, 5.5, -3.2], 12, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [-2.4, 4.0, 2.4], [-1.9, 4.3, 1.4], [0.4, 4.0, -6.2], [0.5, 4.5, -6.0], 30);
      v.pose(addPose(hit([[0, { lean: 8, nod: 30, bob: -0.7 }], [dur * 0.3, { lean: 8, nod: 30, bob: -0.7 }], [dur * 0.6, { lean: 12, nod: 12, rFwd: 40, lFwd: 40, rUp: -20, lUp: -20 }]], t), lookAt(v, [2.8, 3.6, 0.8])));
      k.pose(addPose(idle(t, 0.5), addPose(SHIVER(t, 0.6), lookAt(k, [0.4, 5, -5.4]))));
      env.update(t, cam);
    };
  },
  // 18 "You have your mother's eyes," he said.  — close on Vesper, warm lamp from below
  (S, cam) => {
    const env = shopInside(S);
    const v = vesper(S, 'thinking', [0.4, 0, VZ], 0); fill(S, [-1, 5.2, -1.5], 7, 0xffc890);
    return (t, dur) => {
      faceCam(cam, t / dur, head(0.4, VZ), 0, { dist: 7.2, lens: 34, side: -1.2, push: 1.0, up: -0.2 });
      v.pose(addPose({ lean: 12, nod: 10, rFwd: 40, lFwd: 40, rUp: -20, lUp: -20 }, addPose(talk(t), { turn: 10 })));
      if (t > dur * 0.3) v.setFace('smile');
      env.update(t, cam);
    };
  },
  // 19 "He slid a paper across. "How many years?""  — the paper slides to Kai; Vesper asks
  (S, cam) => {
    const env = shopInside(S);
    const v = vesper(S, 'neutral', [0.4, 0, VZ], 0), k = kai(S, 'nervous', [0.6, 0, CZ + 0.6], 180, { light: 0.0 });
    const pp = paperSheet(S, 'YEARS: ____'), pn = pen(S); pn.rotation.z = 1.4;
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      const s = ramp(t, 0.2, dur * 0.4); pp.position.set(0.4, 3.17, -3.9 + s * 1.3); pn.position.set(1.4, 3.22, -3.6 + s * 1.3);
      v.pose(addPose(hit([[0, { lean: 4, rFwd: 96, rUp: -20 }], [dur * 0.45, { lean: 2, rFwd: 20, rUp: -5 }]], t), c === 1 ? talk(t) : {}));
      k.pose(addPose(idle(t, 0.4), lookAt(k, [0.4, 3.2, -2.6])));
      if (c === 0) camPath(cam, p, [-2.5, 7.4, 2.8], [-2.2, 7.0, 2.2], [0.4, 3.2, -3.0], [0.4, 3.2, -2.8], 30);
      else { faceCam(cam, p, head(0.4, VZ), 0, { dist: 7.6, lens: 32, side: 1.4, up: -0.4 }); v.setFace('neutral'); }
      env.update(t, cam);
    };
  },
  // 20 "My hand shook over the pen. [pause]"  — pen trembling over the paper; lightning flashes through the window
  (S, cam) => {
    const env = shopInside(S, { lightning: [1.2] });
    const k = kai(S, 'nervous', [0.6, 0, CZ + 0.6], 180, { light: 1.0 });
    const pp = paperSheet(S, 'YEARS: ____'); pp.position.set(0.4, 3.17, -2.6); const pn = pen(S);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      k.pose(addPose({ rFwd: 64, rUp: -12, lFwd: 30, nod: 30, lean: 6 }, addPose(tremble(t, 1.4), SHIVER(t))));
      holdAt(pn, k, 'R', [0, 0.1, 0]); pn.rotation.set(0.5, 0, 0.3 + Math.sin(t * 40) * 0.06);
      if (c === 0) camPath(cam, p, [-1.0, 5.2, -6.0], [-0.8, 5.0, -5.6], [0.1, 3.4, -1.6], [0.1, 3.4, -1.6], 34);
      else { faceCam(cam, p, head(0.6, CZ + 0.6), 180, { dist: 6.6, lens: 36, side: 0.6, look: -0.5 }); k.setFace('scared'); }
      env.update(t, cam);
    };
  },
  // 21 "Forty," I whispered.  — extreme close-up, a whisper
  (S, cam) => {
    const env = shopInside(S);
    const k = kai(S, 'determined', [0.6, 0, CZ + 0.6], 180, { light: 1.5 });
    return (t, dur) => {
      faceCam(cam, t / dur, head(0.6, CZ + 0.6), 180, { dist: 5.6, lens: 44, side: -0.3, push: 0.5, look: -0.15 });
      k.pose(addPose({ nod: 8, rFwd: 40, lFwd: 25 }, addPose(idle(t, 0.3), t > 0.3 ? talk(t, 0.4) : {})));
      k.setFace(t < 0.35 ? 'determined' : 'whisper');
      env.update(t, cam);
    };
  },
  // 22 "The light poured out of my clock."  — years stream from his wrist into a jar; 90 rolls down to 50
  (S, cam) => {
    const env = shopInside(S);
    const k = kai(S, 'awe', [0.6, 0, CZ + 0.6], 180, { light: 1.6 });
    const jar = yearJar(S, [-1.6, 3.15, -3.4], 0x8af0ff, { light: 3, s: 1.2 }); const st = lightStream(S, 0x8af0ff, 70);
    return (t, dur) => {
      camPath(cam, t / dur, [-5.6, 4.6, -4.4], [-5.0, 4.4, -3.8], [-0.4, 4.0, -0.9], [-0.2, 4.2, -0.6], 30);
      k.pose(addPose(hit([[0, { lFwd: 30 }], [0.4, { ...SHOW, lFwd: 88, nod: 14, turn: 18 }]], t), SHIVER(t, 0.8)));
      const q = ramp(t, 0.5, dur * 0.85); k.clock.set(90 - 40 * q); k.clock.glow(1.4 - q * 0.6);
      st(k.clock.world(), jar.position.clone().setY(3.8), q > 0 && q < 1 ? 1 : q >= 1 ? 0.3 : 0, t, 0.8);
      jar.userData.core.scale.setScalar(1 + q * 0.5);
      k.setFace(q < 0.4 ? 'awe' : 'scared');
      env.update(t, cam);
    };
  },
  // 23 "My hair went gray at the edges."  — close-up: color drains from his hair
  (S, cam) => {
    const env = shopInside(S);
    const k = kai(S, 'scared', [0.6, 0, CZ + 0.6], 180, { years: 50, light: 1.6 });
    return (t, dur) => {
      faceCam(cam, t / dur, head(0.6, CZ + 0.6), 180, { dist: 6.0, lens: 40, side: 0.9, push: 0.8, up: 0.3 });
      const g = ramp(t, 0.2, dur * 0.7); grayHair(k, 0.55 * g);
      k.pose(addPose({ nod: -6 + g * 14, tilt: g * 6 }, SHIVER(t, 0.5)));
      k.setFace(g < 0.5 ? 'shock' : 'sad');
      env.update(t, cam);
    };
  },
];
