import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  harborFlat, harborStreet, fogBank, fogFront, fogTouch, fogPhone, fogWisp, makeAvatar, add } from '../../engine/kit.js';
import { YOU, ABE, PELL, mk, you, abe, pell, biscuit, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, far } from './common.js';

const PHONE_UP = { rFwd: 78, rUp: -20, nod: 14 };
// street fog: one shared bank, rolling in from the bay (+x)
export const streetFog = (S, seed = 7) => fogBank(S, { n: 420, area: [-50, 90, -32, 30], y: [0.3, 13], size: [6, 12], col: 0xc4cedb, opacity: 0.5, seed });
// a bed-sitting you (flat): mattress top 1.9
const inBed = (S, face) => { const A = you(S, face, [-7.4, 0, -5.9], 0); sitOn(A, 1.9); return A; };
const trashBag = (S) => { const g = new THREE.Group(); S.add(g); const m = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.3 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), m); b.scale.set(1, 1.2, 0.9); b.position.y = -0.9; g.add(b); const k = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), m); k.position.y = -0.05; g.add(k); return g; };
// Pell: walks out with his trash, the fog rolls over him and he stops (shared by lines 12, 13, 14 and the hook)
function pellScene(S, { fogAt }) {
  const env = harborStreet(S, { truck: false }); const fog = streetFog(S);
  const P = pell(S, 'sleepy', [10.8, 0, -10.1], 0); const bag = trashBag(S);
  return { env, fog, P, bag, update(t, front) { env.update(t); fog.update(t, fogFront(front, 7));
    const fk = sm(front, 16.5, 12.5); fogTouch(P, fk);
    env.lamps[2].light && (env.lamps[2].light.intensity = 22 * (1 - sm(front, 24, 16) * 0.85)); } };
}

export const SHOTS_A = [
  // 2 "Imagine you wake up at five forty in the morning."  — dark flat, red siren light pulsing through the window; you jolt upright in bed, Biscuit barks at the window
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = inBed(S, 'sleeping'); const B = biscuit(S); B.root.position.set(-8.9, 1.9, -3.4); B.root.rotation.y = 20 * D; fill(S, [-5.6, 5.6, -2.4], 6, 0xffc890);
    return (t, dur) => { env.update(t); B.update(t, 'bark');
      const up = hit([[0, { lean: -32, nod: -12 }], [0.5, { lean: -32, nod: -12 }], [0.85, { lean: 6, nod: 4, rUp: 30, lUp: 30 }], [dur, { lean: 2, nod: 0, rUp: 18, lUp: 18 }]], t);
      A.pose(addPose(addPose(SIT, up), t > 0.8 ? addPose(idle(t, 1.2), lookAt(A, [5.7, 5, -9])) : {})); A.setFace(t < 0.6 ? 'sleeping' : t < 1.6 ? 'shock' : 'scared');
      camPath(cam, t / dur, [-4.2, 6.0, 3.6], [-5.0, 5.6, 1.4], [-7.4, 4.0, -6.0], [-7.4, 4.6, -6.0], 28, 32); shake(cam, t, 0.8, 0.6); };
  },
  // 3 "The town siren is screaming."  — Harbor Street before dawn: siren pole wailing red, porch lights blink on, Mr. Pell peeks out of his door
  (S, cam) => { far(cam); const env = harborStreet(S, { pellLit: false }); S.userData.look = 'night';
    const P = pell(S, 'confused', [10.8, 0.9, -12.6], 0);
    return (t, dur) => { env.update(t); P.pose(addPose(idle(t, 1), hit([[0, { lean: -6 }], [0.6, { turn: 30, lean: 4 }], [1.4, { turn: -25, lean: 4, rFwd: 40 }], [dur, { turn: 35, lean: 4, rFwd: 40 }]], t)));
      camPath(cam, t / dur, [4, 15, 26], [6, 7, 18], [12, 9, -10], [12, 5.5, -10], 24, 26); };
  },
  // 4 "Twenty-three alerts on your phone."  — over-the-shoulder: the phone lights your face, alerts stack up, the count climbs to 23
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = inBed(S, 'worried'); const ph = fogPhone(S);
    return (t, dur) => { env.update(t); A.pose(addPose(addPose(SIT, PHONE_UP), idle(t, 0.5)));
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.15, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); ph.screen('alerts', ramp(t, 0.1, dur * 0.85));
      const h = headOf(A); camPath(cam, t / dur, [h.x - 0.2, h.y + 0.15, h.z + 0.95], [h.x - 0.25, h.y + 0.05, h.z + 1.15], [ph.position.x, ph.position.y, ph.position.z], [ph.position.x, ph.position.y, ph.position.z], 30, 36); };
  },
  // 5 "And one text, from your sister Nell."  — close-up: phone glow on your face, you swipe, worry turns to fear
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = inBed(S, 'worried'); const ph = fogPhone(S); ph.screen('nell1', 0);
    return (t, dur) => { env.update(t); A.pose(addPose(addPose(SIT, PHONE_UP), addPose(idle(t, 0.5), { rUp: -20 + Math.sin(t * 2) * 2 })));
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.15, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); if (t > dur * 0.5) A.setFace('nervous');
      faceCam(cam, t / dur, headOf(A).toArray(), 0, { dist: 6.2, lens: 36, side: -0.9, up: 0.1, push: 1.0, look: -0.35 }); };
  },
  // 6 "Whatever you do, don't go outside."  — cut 1: the text bubble pops in on the phone; cut 2: your face, shock
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = inBed(S, 'nervous'); const ph = fogPhone(S);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.5]);
      A.pose(addPose(addPose(SIT, PHONE_UP), addPose(idle(t, 0.5), k ? { lean: -6, nod: 8 } : {}))); A.setFace(k ? 'shock' : 'nervous');
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.15, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); ph.screen('nell1', ramp(t, 0.15, 0.6));
      if (k === 0) { const h = headOf(A); camPath(cam, u, [h.x - 0.2, h.y + 0.1, h.z + 1.0], [h.x - 0.25, h.y + 0.0, h.z + 1.2], ph.position.toArray(), ph.position.toArray(), 34, 40); }
      else faceCam(cam, u, headOf(A).toArray(), 0, { dist: 5.8, lens: 40, side: 0.5, up: 0.1, push: 0.9, look: -0.25 }); };
  },
  // 7 "The news says a fog is rolling in off the bay."  — you and Biscuit in front of the TV: FOG ADVISORY, white fog sweeping across the screen
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = you(S, 'worried', [1.0, 0, -4.0], -160); const B = biscuit(S); B.root.position.set(-2.4, 0, -3.4); B.root.rotation.y = 190 * D;
    return (t, dur) => { env.update(t); env.tv('advisory', t / 3, t); B.update(t, 'stand');
      A.pose(addPose(idle(t, 0.8), hit([[0, { lean: 0 }], [0.6, { lean: 8, nod: -4, rFwd: 20, lFwd: 20 }], [dur, { lean: 10, nod: -4, rFwd: 22, lFwd: 22 }]], t)));
      camPath(cam, t / dur, [-6.4, 5.6, 5.2], [-5.4, 5.2, 3.0], [-0.2, 3.8, -6.0], [-0.4, 4.0, -6.6], 22, 26); };
  },
  // 8 "Anyone it touches forgets."  — from the TV: your face lit cold blue, the screen's light flickering over you; push in
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = you(S, 'worried', [-0.8, 0, -3.0], 180); const B = biscuit(S); B.root.position.set(2.2, 0, -2.2); B.root.rotation.y = 200 * D;
    return (t, dur) => { env.update(t); env.tv('advisory', 0.5 + t / 3, t); B.update(t, 'stand');
      A.pose(addPose(idle(t, 0.6), { rFwd: 125, rUp: -20, nod: 4 })); if (t > dur * 0.45) A.setFace('scared');
      const h = headOf(A); camPath(cam, t / dur, [-0.2, 4.9, -7.6], [-0.4, 4.8, -7.0], [h.x, h.y - 0.2, h.z], [h.x, h.y - 0.15, h.z], 34, 40); };
  },
  // 9 "First their plans. Then their people. Then their name."  — the TV crosses out PLANS, PEOPLE, NAME one by one; slow push into the screen, then back on your face
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = you(S, 'scared', [-0.8, 0, -3.0], 180);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.72]); env.tv('forget', ramp(t, 0.1, dur * 0.7), t);
      A.pose(addPose(idle(t, 0.5), { rFwd: 125, rUp: -20, nod: 6 })); A.setFace(k ? 'teary' : 'scared');
      if (k === 0) camPath(cam, u, [1.6, 4.9, -2.4], [0.4, 4.6, -4.6], [-0.8, 4.4, -8.4], [-0.8, 4.4, -8.4], 30, 34);
      else { const h = headOf(A); camPath(cam, u, [-0.4, 4.8, -7.4], [-0.5, 4.75, -7.0], [h.x, h.y - 0.2, h.z], [h.x, h.y - 0.2, h.z], 40, 44); } };
  },
  // 10 "It reaches Harbor Street in twelve minutes."  — the TV map: the white edge eats the coast toward the yellow dot, 12 MIN flashing; you spin toward the window
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = you(S, 'scared', [-0.8, 0, -3.0], 180);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.55]); env.tv('map', ramp(t, 0, dur), t);
      if (k === 0) { A.pose(idle(t, 0.5)); camPath(cam, u, [-0.8, 4.5, -4.0], [-0.8, 4.45, -4.6], [-0.8, 4.4, -8.4], [-0.8, 4.4, -8.4], 24, 27); }
      else { const tt = t - dur * 0.55; A.root.rotation.y = hn([[0, 180], [0.5, 120], [3, 118]], tt) * D; A.pose(addPose(idle(t, 0.8), hit([[0, {}], [0.4, { turn: -40, lean: 4 }], [3, { turn: -42, lean: 4 }]], tt))); A.setFace('determined');
        faceCam(cam, u, headOf(A).toArray(), 118, { dist: 6.0, lens: 32, side: 0.6, push: 0.8, look: -0.3 }); } };
  },
  // 11 "You look out the window."  — you pull the curtain aside; the red siren light sweeps across your face
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const A = you(S, 'worried', [4.5, 0, -6.6], 180); fill(S, [4.5, 6.4, -10.6], 5, 0x9ab4ff, 10);
    return (t, dur) => { env.update(t); A.pose(addPose(idle(t, 0.6), hit([[0, { rUp: 10 }], [0.5, { rFwd: 105, rUp: 18, lean: 6 }], [dur, { rFwd: 108, rUp: 20, lean: 8, nod: 8 }]], t)));
      if (t > dur * 0.5) A.setFace('scared'); const h = headOf(A); camPath(cam, t / dur, [4.3, 5.4, -12.6], [4.4, 5.1, -11.6], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.25, h.z], 28, 32); };
  },
  // 12 "Mister Pell is taking out his trash."  — your window POV: Pell shuffles down his porch with a trash bag; behind him, a white wall is crossing the bay
  (S, cam) => { far(cam); S.userData.look = 'night'; const sc = pellScene(S, {});
    return (t, dur) => { const front = 52 - t * 6; sc.update(t, front); const P = sc.P;
      const z = -10.1 + ramp(t, 0, 1.2) * 0.7, x = 10.8 + ramp(t, 1.3, dur) * 2.4; P.root.position.set(x, 0, z); P.root.rotation.y = hn([[0, 0], [1.2, 0], [1.7, 90], [9, 90]], t) * D;
      P.pose(addPose(walk(t, 0.6, 26), { rFwd: 10, rUp: 8, nod: 6, lFwd: 0 })); P.setFace(t > 1.2 ? 'bored' : 'sleepy');
      hold(sc.bag, P, 'R', [0, -0.1, 0]);
      camPath(cam, t / dur, [2.2, 10.4, -9.6], [3.0, 10.0, -9.0], [13.0, 3.2, -11.6], [14.6, 3.0, -11.0], 18, 20); };
  },
  // 13 "The fog rolls over him, and he just stops."  — street level: the fog wall swallows the house next door and pours over Pell mid-step; the bag drops; his eyes go blank
  (S, cam) => { far(cam); S.userData.look = 'night'; const sc = pellScene(S, {});
    return (t, dur) => { const front = 22 - t * 4.2; sc.update(t, front); const P = sc.P; const stop = front < 15.2;
      const tt = Math.min(t, 1.1); P.root.position.set(13.1 + tt * 0.35, 0, -9.4); P.root.rotation.y = 25 * D;
      if (!stop) { P.pose(addPose(walk(t, 0.6, 26), { rFwd: 30, rUp: 8 })); P.setFace('bored'); hold(sc.bag, P, 'R', [0, -0.1, 0]); }
      else { const u = t - (22 - 15.2) / 4.2; P.pose(addPose(hit([[0, { rLeg: 18, lLeg: -14, rFwd: 30, rUp: 8 }], [0.5, { rLeg: 12, lLeg: -8, rFwd: 6, rUp: 4, nod: -4, lean: -2 }], [4, { rLeg: 12, lLeg: -8, rFwd: 4, rUp: 3, nod: -6 }]], u), { tilt: Math.sin(t * 0.8) * 2 }));
        P.setFace(u < 0.35 ? 'confused' : 'sleepy'); const bp = pinky(P, 'R'); sc.bag.position.set(bp.x, Math.max(0.95, bp.y - 0.1 - u * u * 18), bp.z); sc.bag.rotation.z = Math.min(u * 3, 0.6); }
      camPath(cam, t / dur, [5.0, 4.0, 2.0], [7.0, 4.2, -1.0], [14, 3.4, -9.8], [14, 3.8, -9.8], 26, 30); };
  },
  // 14 "He doesn't know where he is."  — close-up: Pell in the fog, blank eyes, colour drained, swaying; the fog curls past his face
  (S, cam) => { far(cam); S.userData.look = 'night'; const sc = pellScene(S, {}); const wisp = fogWisp(S, 16, 0xc8d2de, 2.6, 9);
    return (t, dur) => { sc.update(t, 12.6); const P = sc.P; P.root.position.set(13.5, 0, -9.4); P.root.rotation.y = -50 * D;
      P.pose({ rLeg: 12, lLeg: -8, rFwd: 4, rUp: 3, nod: -4 + Math.sin(t * 0.7) * 3, turn: Math.sin(t * 0.5) * 10, tilt: Math.sin(t * 0.8) * 3, bob: Math.sin(t * 1.2) * 0.02 }); P.setFace('sleepy');
      sc.bag.position.set(14.4, 0.95, -8.6); const h = headOf(P); wisp.position.set(h.x + 0.8 - t * 0.4, h.y - 2.2, h.z - 0.6); wisp.update(t, () => 1, { k: 0.9 });
      faceCam(cam, t / dur, h.toArray(), -50, { dist: 6.4, lens: 36, side: 0.4, up: 0.1, push: 1.0, look: -0.25 }); };
  },
  // 15 "Biscuit growls at the door."  — low angle: Biscuit braced at the front door, hackles up; a thin white mist curls in under it; you back away behind him
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const B = biscuit(S); B.root.position.set(7.2, 0, 4.4); B.root.rotation.y = 90 * D; const A = you(S, 'scared', [4.4, 0, 2.6], 70); fill(S, [5.0, 5.5, 7.5], 7, 0xb8c8f0, 10);
    return (t, dur) => { env.update(t); env.under(ramp(t, 0.2, 1.5)); B.update(t, 'bark'); B.root.position.x = 7.2 - ramp(t, 0.8, 2.0) * 0.6;
      A.root.position.x = 4.4 - ramp(t, 0.3, 1.8) * 0.8; A.pose(addPose(idle(t, 1), hit([[0, {}], [0.5, { rFwd: 40, lFwd: 40, lean: -8 }], [dur, { rFwd: 45, lFwd: 42, lean: -10 }]], t)));
      camPath(cam, t / dur, [1.8, 2.6, 10.6], [2.8, 2.2, 9.6], [7.0, 2.0, 3.6], [7.4, 1.6, 3.8], 24, 28); };
  },
  // 16 "Then, a knock."  — the door jumps in its frame; you flinch; Biscuit goes silent
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const B = biscuit(S); B.root.position.set(6.4, 0, 3.6); B.root.rotation.y = 90 * D; const A = you(S, 'scared', [2.2, 0, 6.6], 70);
    return (t, dur) => { env.update(t); env.under(1); B.update(t, t < 0.3 ? 'bark' : 'stand');
      const kn = [0.25, 0.49, 0.85, 1.09].some(k => t > k && t < k + 0.08); env.door.rotation.y = kn ? -0.012 : 0;
      A.pose(addPose(idle(t, 0.8), hit([[0, { rFwd: 40, lFwd: 40 }], [0.3, { rFwd: 40, lFwd: 40 }], [0.45, { rFwd: 95, lFwd: 95, rUp: -10, lUp: -10, lean: -12, bob: -0.12 }], [dur, { rFwd: 90, lFwd: 90, rUp: -8, lUp: -8, lean: -10, bob: -0.1 }]], t)));
      A.setFace(t > 0.3 ? 'shock' : 'scared'); shake(cam, t, 0.25, 0.35);
      const h = headOf(A); camPath(cam, t / dur, [8.0, 5.0, 9.6], [7.4, 4.9, 9.0], [h.x, h.y - 0.6, h.z], [h.x + 0.2, h.y - 0.6, h.z], 26, 30); };
  },
  // 17 "It's Abe. The ice-cream man."  — the door swings open: Abe on the landing under the bulb, paper cap, bow tie, mist around his boots
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const Ab = abe(S, 'neutral', [12.6, 0, 4.4], -90); const A = you(S, 'shock', [6.2, 0, 1.2], 80); fill(S, [9.2, 5.6, 4.6], 12, 0xffd8b0, 9); const w = fogWisp(S, 14, 0xc8d2de, 2.0, 4); w.position.set(12.4, 0, 4.4);
    return (t, dur) => { env.update(t); env.under(0); env.door.open(hn([[0.1, 0], [0.7, 1], [9, 1]], t)); w.update(t, () => 1, { k: 0.8 });
      Ab.pose(addPose(idle(t, 0.6), hit([[0, { nod: 8 }], [0.9, { nod: 8 }], [1.4, { nod: -2, turn: 6 }], [dur, { nod: -2, turn: 4 }]], t))); if (t > 1.3) Ab.setFace('determined');
      A.pose(addPose(idle(t, 0.8), { lean: -4 }));
      camPath(cam, t / dur, [3.4, 5.4, 4.0], [4.6, 5.2, 4.2], [12.6, 4.6, 4.4], [12.6, 4.7, 4.4], 28, 32); };
  },
  // 18 "The one the whole street laughs at."  — FLASHBACK (warm, faded): a sunny November day, Abe beside his truck holding out a cone; two neighbours point and laugh
  (S, cam) => { far(cam); const env = harborStreet(S, { time: 'day', truck: [3, -4], siren: false }); S.userData.look = 'flash';
    const Ab = abe(S, 'softsmile', [-3.6, 0, 2.0], -40); const cone = new THREE.Group(); S.add(cone);
    { const cm = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0xd89a4a })); cm.rotation.x = Math.PI; cone.add(cm); }
    const sc = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf6c8d8 })); sc.position.y = 0.45; cone.add(sc);
    const N1 = pell(S, 'laugh', [-9.2, 0, 3.6], 70), N2 = mk(S, { skin: 'light', shirt: 0x8a5ab8, shirtStyle: 'hoodie', pants: 0x2a2a3a, pantsStyle: 'jeans', hair: 'long', hairCol: 0xd8a84a, outfit: [['scarf', { col: 0xe8e2d4 }]] }, 'jogger', 'laugh', [-12.8, 0, 2.6], 60);
    return (t, dur) => { env.update(t); env.truck.update(t, { jingle: 1, head: 0 });
      Ab.pose(addPose(idle(t, 0.6), { lFwd: 70, lUp: 8, nod: 4 })); hold(cone, Ab, 'L', [0, 0.25, 0]);
      N1.pose(addPose(idle(t, 1), addPose({ rFwd: 85, rUp: 6, lFwd: 30, lean: -6 }, { bob: Math.abs(Math.sin(t * 11)) * 0.06, nod: -8 + Math.sin(t * 11) * 4 })));
      N2.pose(addPose(idle(t, 1, 2), addPose({ lFwd: 110, lUp: -25, rFwd: 70, rUp: -15, lean: 10 }, { bob: Math.abs(Math.sin(t * 10 + 1)) * 0.06, nod: 10 })));
      if (t > dur * 0.6) Ab.setFace('sad');
      camPath(cam, t / dur, [-8.2, 4.4, 19.5], [-7.6, 4.4, 17.0], [-8.2, 3.4, 2.4], [-7.6, 3.6, 2.4], 22, 24); };
  },
  // 19 "His truck still plays its jingle in November."  — FLASHBACK: the truck's bulbs blinking, roof cone bobbing, the street empty and grey; Abe wipes the counter alone
  (S, cam) => { far(cam); const env = harborStreet(S, { time: 'day', truck: [3, -4], siren: false }); S.userData.look = 'flash';
    const Ab = abe(S, 'softsmile', [0.4, 0, 0.6], 10);
    return (t, dur) => { env.update(t); env.truck.update(t, { jingle: 1, head: 0 });
      Ab.pose(addPose(idle(t, 0.6), { rFwd: 60 + Math.sin(t * 5) * 8, rUp: -12 + Math.sin(t * 5) * 8, nod: 14, lean: 4 })); if (t > dur * 0.5) Ab.setFace('neutral');
      camPath(cam, t / dur, [7, 3.4, 15], [5, 4.0, 12.5], [2, 6.0, -2], [1, 4.8, -0.5], 22, 24); };
  },
  // 20 "Kid. Get in the truck. Now."  — back in the doorway: Abe, urgent, jerks his thumb toward the street
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const Ab = abe(S, 'determined', [12.6, 0, 4.4], -90); env.door.open(1); fill(S, [9.2, 5.6, 4.0], 12, 0xffd8b0, 9); const w = fogWisp(S, 14, 0xc8d2de, 2.0, 4); w.position.set(12.4, 0, 4.4);
    return (t, dur) => { env.update(t); w.update(t, () => 1, { k: 0.9 });
      Ab.pose(addPose(addPose(idle(t, 0.6), talk(t, 1.3)), hit([[0, {}], [0.5, { rFwd: 40, rUp: 30, bodyTurn: -10 }], [1.0, { rFwd: 20, rUp: 70, bodyTurn: -14 }], [dur, { rFwd: 30, rUp: 40, bodyTurn: -8 }]], t)));
      const h = headOf(Ab); camPath(cam, t / dur, [h.x - 6.6, h.y + 0.2, h.z + 0.9], [h.x - 5.6, h.y + 0.1, h.z + 0.6], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.35, h.z], 34, 38); };
  },
  // 21 "Why me?"  — you, close: still in the doorway's light, confused, Biscuit pressing against your legs
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night'; env.door.open(1);
    const A = you(S, 'confused', [5.6, 0, 3.4], 95); const B = biscuit(S); B.root.position.set(4.0, 0, 0.6); B.root.rotation.y = 80 * D; fill(S, [9, 5.5, 5.2], 6, 0xffc890);
    return (t, dur) => { env.update(t); B.update(t, 'stand'); A.pose(addPose(addPose(idle(t, 0.8), talk(t, 1)), hit([[0, {}], [0.4, { rUp: 25, lUp: 25, rFwd: 30, lFwd: 30, tilt: 8 }], [dur, { rUp: 22, lUp: 22, rFwd: 28, lFwd: 28, tilt: 6 }]], t)));
      faceCam(cam, t / dur, headOf(A).toArray(), 95, { dist: 3.8, lens: 36, side: 1.0, up: 0.1, push: 0.7, look: -0.3 }); };
  },
  // 22 "You're the only one who ever bought a cone in winter."  — Abe close: the hard face softens into a small smile
  (S, cam) => { const env = harborFlat(S); S.userData.look = 'night';
    const Ab = abe(S, 'determined', [12.6, 0, 4.4], -90); env.door.open(1); fill(S, [9.2, 5.6, 3.8], 12, 0xffd8b0, 9);
    return (t, dur) => { env.update(t); Ab.pose(addPose(addPose(idle(t, 0.6), talk(t, 0.9)), { nod: 4, tilt: -4 })); if (t > dur * 0.4) Ab.setFace('softsmile');
      const h = headOf(Ab); camPath(cam, t / dur, [h.x - 6.0, h.y + 0.1, h.z - 1.0], [h.x - 5.0, h.y + 0.05, h.z - 0.7], [h.x, h.y - 0.35, h.z], [h.x, h.y - 0.3, h.z], 36, 40); };
  },
];
