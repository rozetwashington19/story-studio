import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  harborStreet, truckCab, hospitalRoof, fogBank, fogFront, fogRing, fogTouch, fogPhone, fogWisp } from '../../engine/kit.js';
import { mk, you, abe, pell, nell, pip, biscuit, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, far } from './common.js';
import { streetFog } from './shots_a.js';

const TRUCK = [4, 0];
// the street with the truck parked mid-road and Pell frozen by the cans
function street(S, cam, { pellOn = true } = {}) { far(cam); const env = harborStreet(S, { truck: TRUCK }); S.userData.look = 'night'; const fog = streetFog(S);
  const P = pellOn ? pell(S, 'sleepy', [13.5, 0, -9.4], -50) : null; if (P) fogTouch(P, 1);
  return { env, fog, P, sway(t) { if (P) P.pose({ rLeg: 12, lLeg: -8, rFwd: 4, rUp: 3, nod: -4 + Math.sin(t * 0.7) * 3, turn: Math.sin(t * 0.5) * 10, tilt: Math.sin(t * 0.8) * 3 }); } };
}
// cab: Abe (driver, x -2.4) + you (x 2.4), seated; Biscuit on your lap
function cab(S, { dog = true, ring = 15 } = {}) { const env = truckCab(S, { ring }); S.userData.look = 'night';
  const Ab = abe(S, 'neutral', [-2.4, 0, -0.5], 0); sitOn(Ab, 1.6); const A = you(S, 'worried', [2.4, 0, -0.5], 0); sitOn(A, 1.6);
  let B = null; if (dog) { B = biscuit(S); B.root.position.set(2.4, 2.25, 0.5); B.root.scale.setScalar(0.8); }
  allow(S, ['abe', 'seat*'], ['you', 'seat*'], ['you', 'biscuit'], ['biscuit', 'seat*']);
  return { env, Ab, A, B };
}
const WHEEL = { rFwd: 62, lFwd: 62, rUp: -10, lUp: -10 };
const winCam = (cam, p, x, lens = [28, 30], dz = [9.6, 8.8], y = [5.3, 5.2]) => camPath(cam, p, [x, y[0], dz[0]], [x, y[1], dz[1]], [x * 0.6, 4.5, -0.6], [x * 0.6, 4.55, -0.6], lens[0], lens[1]);

export const SHOTS_B = [
  // 23 "You grab Biscuit and you run."  — tracking low beside you as you sprint off your porch toward the truck, Biscuit at your heels, the fog wall at the end of the street
  (S, cam) => { far(cam); const env = harborStreet(S, { truck: TRUCK }); S.userData.look = 'night'; const fog = streetFog(S);
    const A = you(S, 'determined', [-1.2, 0, -10.8], 0); const B = biscuit(S); const P = pell(S, 'sleepy', [13.5, 0, -9.4], -50); fogTouch(P, 1);
    return (t, dur) => { env.update(t); env.truck.update(t, { jingle: 0 }); fog.update(t, fogFront(26 - t * 2.5, 7));
      const z = -10.8 + ramp(t, 0, 0.9) * 3.4, x = -1.2 + ramp(t, 0.8, dur) * 8.5; A.root.position.set(x, 0, z);
      A.root.rotation.y = hn([[0, 0], [0.8, 0], [1.1, 90], [9, 90]], t) * D; A.pose(addPose(RUN(t, 1), { nod: -4 })); if (t > 1) A.setFace('scared');
      B.root.position.set(A.root.position.x - (t > 0.9 ? 2.6 : 0) + (t > 0.9 ? 0 : 2.6), 0, z + (t > 0.9 ? 1.6 : 0.4)); B.root.rotation.y = A.root.rotation.y; B.update(t, 'run');
      P.pose({ rLeg: 12, lLeg: -8, nod: -4, turn: Math.sin(t * 0.5) * 10 });
      const ax = A.root.position.x; camPath(cam, 0, [ax - 4.5, 3.8, 1.6], [ax - 4.5, 3.8, 1.6], [ax + 0.8, 3.2, A.root.position.z], [ax + 0.8, 3.2, A.root.position.z], 24, 24); };
  },
  // 24 "Five forty-six. The fog pours down the street."  — wide, low: the white wall rolls over Pell's house, eats the streetlamps one by one, and reaches the truck
  (S, cam) => { far(cam); const env = harborStreet(S, { truck: TRUCK }); S.userData.look = 'night'; const fog = streetFog(S, 9);
    const P = pell(S, 'sleepy', [13.5, 0, -9.4], -50); fogTouch(P, 1); const A = you(S, 'scared', [6.0, 0, -6.6], 90); const B = biscuit(S);
    return (t, dur) => { env.update(t); env.truck.update(t, { jingle: 0 }); const front = 20 - t * 5.2; fog.update(t, fogFront(front, 8));
      env.lamps.forEach(l => { if (l.light) l.light.intensity = l.position.x > front + 2 ? 4 : 22; });
      A.root.position.x = 6.0 + ramp(t, 0, 1.2) * 3.4; A.pose(t < 1.2 ? RUN(t, 1) : addPose(idle(t, 1), { lean: 10, rFwd: 70, lFwd: 70 })); A.root.visible = t < 1.4;
      B.root.position.set(A.root.position.x - 2.6, 0, -4.4); B.root.rotation.y = 90 * D; B.update(t, 'run'); B.root.visible = t < 1.4;
      P.pose({ rLeg: 12, lLeg: -8, nod: -4, turn: Math.sin(t * 0.5) * 10 });
      camPath(cam, t / dur, [-22, 2.6, 11], [-19, 3.4, 9], [10, 5, -6], [8, 5.6, -6], 22, 23); };
  },
  // 25 "Abe hits a switch."  — cut 1: Abe's hand slams the red JINGLE switch; cut 2: his face, the cab bulbs bursting on around him
  (S, cam) => { const { env, Ab, A, B } = cab(S, { ring: 3 });
    return (t, dur) => { const [k, u] = seg(t, dur, [0.5]); const on = t > dur * 0.38; env.sw.rotation.x = on ? 0.55 : -0.5;
      env.update(t, { jingle: on ? ramp(t, dur * 0.38, dur * 0.6) : 0, r: 3 }); B.update(t, 'sit');
      Ab.pose(addPose(SIT, addPose(idle(t, 0.4), hit([[0, { ...WHEEL }], [dur * 0.2, { rFwd: 62, rUp: -10, lFwd: 55, lUp: 0 }], [dur * 0.36, { rFwd: 62, rUp: -10, lFwd: 74, lUp: 8, lean: 12, bodyTurn: 12, turn: 20, nod: 10 }], [dur, { rFwd: 62, rUp: -10, lFwd: 72, lUp: 8, lean: 10, bodyTurn: 10, turn: 18, nod: 8 }]], t))));
      A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 40, lFwd: 40, turn: -25 }))); Ab.setFace(on ? 'determined' : 'neutral');
      if (k === 0) camPath(cam, u, [1.2, 6.8, 0.2], [0.9, 6.5, 0.6], [-0.2, 3.7, 2.6], [-0.1, 3.7, 2.6], 30, 34);
      else { const h = headOf(Ab); camPath(cam, u, [h.x + 0.6, h.y + 0.2, 9.6], [h.x + 0.4, h.y + 0.1, 8.6], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.25, h.z], 34, 38); } };
  },
  // 26 "The jingle starts, and the fog backs away."  — outside: the truck's bulbs blink to the tune, and the white wall slides back from it in every direction; crane up
  (S, cam) => { const sc = street(S, cam); const { env, fog } = sc;
    return (t, dur) => { env.update(t); env.truck.update(t, { jingle: 1 }); const r = 2 + sm(t, 0.3, dur * 0.9) * 13; fog.update(t, fogRing(TRUCK[0], TRUCK[1], r, 5)); sc.sway(t);
      camPath(cam, t / dur, [-6, 4.5, 18], [-6, 12, 26], [4, 4, 0], [4, 3, -2], 24, 24); };
  },
  // 27 "A perfect circle of clear air."  — straight down from above: the truck in a perfect ring of clear road, fog everywhere else, Pell standing just outside it
  (S, cam) => { const sc = street(S, cam); const { env, fog } = sc;
    return (t, dur) => { env.update(t); env.truck.update(t, { jingle: 1 }); fog.update(t, fogRing(TRUCK[0], TRUCK[1], 15, 4)); sc.sway(t);
      camPath(cam, t / dur, [4, 52, 9], [4, 42, 6], [4, 0, -0.6], [4, 0, -0.4], 24, 24); cam.rotation.z += t * 0.03; };
  },
  // 28 "Rule one: the fog hates music."  — through the windshield: Abe calm at the wheel, you leaning forward in awe, Biscuit in your lap
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1 }); B.update(t, 'sit');
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), { ...WHEEL, nod: 2 }))); Ab.setFace('neutral');
      A.pose(addPose(SIT, addPose(idle(t, 0.7), hit([[0, { rFwd: 35, lFwd: 35 }], [0.6, { rFwd: 40, lFwd: 40, lean: 12, nod: -6 }], [dur, { rFwd: 40, lFwd: 40, lean: 14, nod: -8, turn: 8 }]], t)))); A.setFace(t > 0.5 ? 'awe' : 'worried');
      winCam(cam, t / dur, 0, [20, 22], [10, 9]); };
  },
  // 29 "Outside the circle, Mister Pell still stares at nothing."  — from behind the seats, out through the windshield: Pell, grey and blank, at the edge of the fog
  (S, cam) => { const { env, Ab, A, B } = cab(S); const P = pell(S, 'sleepy', [-4.5, -1.6, 17.5], 200); fogTouch(P, 1); const pl = fill(S, [-4, 5, 13], 8, 0xd8e0f0, 10);
    return (t, dur) => { env.update(t, { jingle: 1 }); B.update(t, 'sit'); Ab.pose(addPose(SIT, addPose(idle(t, 0.5), WHEEL))); A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 35, lFwd: 35, turn: -15 })));
      P.pose({ rLeg: 12, lLeg: -8, nod: -4 + Math.sin(t * 0.7) * 3, turn: Math.sin(t * 0.4) * 14, tilt: Math.sin(t * 0.8) * 3 });
      camPath(cam, t / dur, [0.2, 6.6, -4.6], [-0.6, 6.0, -2.6], [-3.6, 2.6, 17], [-4.2, 2.4, 17.5], 28, 36); };
  },
  // 30 "Then the speaker crackles."  — the dash speaker buzzes, the green battery display flickers; Abe's eyes snap to it
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: t > 0.4 ? 0.6 + Math.sin(t * 40) * 0.4 : 1, flicker: t > 0.4 ? 1 : 0 }); env.meter('10:00', false, 0.25); B.update(t, 'sit');
      env.spk.position.x = 0.8 + (t > 0.4 ? Math.sin(t * 70) * 0.03 : 0);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), addPose(WHEEL, t > 0.6 ? { turn: 38, nod: 12 } : {})))); if (t > 0.6) Ab.setFace('worried');
      A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 35, lFwd: 35, turn: t > 0.7 ? 20 : 0, nod: t > 0.7 ? 14 : 0 }))); A.setFace(t > 0.7 ? 'nervous' : 'worried');
      camPath(cam, t / dur, [-0.6, 6.2, -0.4], [-0.2, 5.8, 0.4], [0.6, 3.7, 2.8], [0.7, 3.8, 2.8], 28, 32); };
  },
  // 31 "The battery says ten minutes left."  — cut 1: the display turns red: 10:00; cut 2: you, through the windshield, swallowing hard
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('10:00', t > 0.3, 0.2); B.update(t, 'sit'); const [k, u] = seg(t, dur, [0.5]);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), WHEEL))); A.pose(addPose(SIT, addPose(idle(t, 0.7), { rFwd: 35, lFwd: 35, nod: k ? 4 : 14, turn: k ? -6 : 18 }))); A.setFace(k ? 'scared' : 'nervous');
      if (k === 0) camPath(cam, u, [0.8, 4.7, 0.8], [0.8, 4.6, 1.3], [0.8, 3.95, 2.7], [0.8, 3.95, 2.7], 34, 40);
      else { const h = headOf(A); camPath(cam, u, [h.x - 0.4, h.y + 0.2, 9.4], [h.x - 0.3, h.y + 0.1, 8.4], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.25, h.z], 34, 38); } };
  },
  // 32 "On the dashboard, an old badge."  — top-down on the dash: an old ID badge under the windshield; your hand slides in toward it
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:59', true, 0.2); B.update(t, 'sit');
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), WHEEL))); A.pose(addPose(SIT, addPose(idle(t, 0.5), hit([[0, { rFwd: 30, lFwd: 35 }], [dur * 0.5, { rFwd: 30, lFwd: 35, nod: 20 }], [dur, { rFwd: 82, rUp: -6, lFwd: 35, lean: 22, nod: 24 }]], t))));
      camPath(cam, t / dur, [2.0, 6.9, 1.2], [2.3, 6.3, 1.6], [2.7, 3.44, 3.2], [2.7, 3.44, 3.2], 28, 32); };
  },
  // 33 "Kessler Hill Tower. Chief Engineer."  — slow push across the badge: KESSLER HILL TOWER… CHIEF ENGINEER
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:58', true, 0.2); B.update(t, 'sit'); Ab.pose(addPose(SIT, addPose(idle(t, 0.5), WHEEL))); A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 40, lFwd: 35, lean: 18, nod: 24 })));
      const [k, u] = seg(t, dur, [0.5]); const n = [0, 0.9, -0.43];
      const at = (ox, oy, d) => [2.7 - ox + n[0] * d, 3.44 + oy * 0.43 + n[1] * d, 3.2 + oy * 0.9 + n[2] * d];
      if (k === 0) camPath(cam, u, at(0.15, 0.25, 2.4), at(0.05, 0.25, 2.1), at(0.15, 0.25, 0), at(0.05, 0.25, 0), 34, 36);
      else camPath(cam, u, at(-0.25, 0.02, 2.0), at(-0.32, 0.02, 1.8), at(-0.25, 0.02, 0), at(-0.32, 0.02, 0), 36, 38); };
  },
  // 34 "With Abe's face on it."  — cut 1: the badge photo, a younger Abe in a cap; cut 2: the real Abe, eyes fixed on the fog
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:58', true, 0.2); B.update(t, 'sit'); const [k, u] = seg(t, dur, [0.45]);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.4), addPose(WHEEL, { nod: 4 })))); Ab.setFace('neutral'); A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 40, lFwd: 35, lean: 10, nod: 10, turn: -30 })));
      const n = [0, 0.9, -0.43]; const at = (ox, oy, d) => [2.7 - ox + n[0] * d, 3.44 + oy * 0.43 + n[1] * d, 3.2 + oy * 0.9 + n[2] * d];
      if (k === 0) camPath(cam, u, at(-0.38, -0.05, 1.7), at(-0.38, -0.05, 1.4), at(-0.38, -0.05, 0), at(-0.38, -0.05, 0), 36, 38);
      else { const h = headOf(Ab); camPath(cam, u, [h.x + 1.4, h.y + 0.2, 9.0], [h.x + 1.0, h.y + 0.1, 8.2], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.25, h.z], 36, 40); } };
  },
  // 35 "Abe, what is this?" He won't look at you.  — through the windshield: you hold the badge up at him; Abe stares straight ahead, jaw set
  (S, cam) => { const { env, Ab, A, B } = cab(S); const badge = env.badge;
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:57', true, 0.2); B.update(t, 'sit');
      A.pose(addPose(SIT, addPose(addPose(idle(t, 0.6), t < dur * 0.55 ? talk(t, 1) : {}), hit([[0, { rFwd: 40, lFwd: 35 }], [0.5, { rFwd: 95, rUp: -12, lFwd: 35, turn: -35, bodyTurn: -10 }], [dur, { rFwd: 95, rUp: -10, lFwd: 35, turn: -38, bodyTurn: -10 }]], t))));
      A.setFace(t > dur * 0.55 ? 'sad' : 'confused'); const p = pinky(A, 'R'); badge.position.set(p.x - 0.1, p.y + 0.35, p.z + 0.25); badge.rotation.set(0.15, -0.3, 0);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.3), addPose(WHEEL, { turn: t > dur * 0.5 ? 6 : 0, nod: 2 })))); Ab.setFace(t > dur * 0.5 ? 'sad' : 'neutral');
      winCam(cam, t / dur, 0.3, [20, 22], [10, 9]); };
  },
  // 36 "Your phone buzzes. It's Nell."  — the phone lights up in your lap, NELL; you snatch it up
  (S, cam) => { const { env, Ab, A, B } = cab(S, { dog: false }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:55', true, 0.2);
      A.pose(addPose(SIT, addPose(idle(t, 0.6), hit([[0, { rFwd: 35, lFwd: 35, nod: 10 }], [0.6, { rFwd: 35, lFwd: 35, nod: 18 }], [1.0, { rFwd: 78, rUp: -20, lFwd: 35, nod: 14 }], [dur, { rFwd: 78, rUp: -20, lFwd: 35, nod: 14 }]], t))));
      const p = pinky(A, 'R'); const buzz = t < 0.9 ? Math.sin(t * 80) * 0.04 : 0;
      if (t < 0.8) { ph.position.set(2.4 + buzz, 2.3, 0.6); ph.rotation.set(-Math.PI / 2, 0, 0); } else { ph.position.set(p.x + 0.35, p.y + 0.15, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); }
      ph.screen('nell2', ramp(t, 0.1, 0.5)); A.setFace(t > 0.8 ? 'shock' : 'worried'); Ab.pose(addPose(SIT, addPose(idle(t, 0.4), addPose(WHEEL, { turn: t > 1 ? 20 : 0 }))));
      const h = headOf(A); camPath(cam, t / dur, [h.x - 0.2, h.y + 0.6, 9.8], [h.x - 0.1, h.y + 0.2, 8.6], [h.x, h.y - 1.2, h.z + 0.4], [h.x, h.y - 0.4, h.z], 30, 34); };
  },
  // 37 "Fog's at the hospital. I'm on the roof."  — Mainland General roof: Nell on her phone at the rail, a little girl in a yellow raincoat clinging to her, the fog spilling over the edge
  (S, cam) => { far(cam); const env = hospitalRoof(S); S.userData.look = 'night';
    const N = nell(S, 'worried', [-1.6, 0, -9.6], 15); const Pp = pip(S, 'scared', [1.6, 0, -9.2], -20); allow(S, ['nell', 'pip']); const ph = fogPhone(S); ph.screen('lock');
    return (t, dur) => { env.rise(0.75 + t * 0.03); env.update(t);
      N.pose(addPose(addPose(idle(t, 0.8), talk(t, 1.2)), { rFwd: 140, rUp: -32, lFwd: 25, lUp: 20, turn: -8 })); const p = pinky(N, 'R'); ph.position.set(p.x + 0.1, p.y + 0.2, p.z - 0.1); ph.rotation.set(0, 0.6, 0.2);
      Pp.pose(addPose(idle(t, 1.2, 2), { lFwd: 60, lUp: -40, nod: 8, turn: lookAt(Pp, [6, 0, -18]).turn * 0.5, bob: Math.sin(t * 12) * 0.01 }));
      camPath(cam, t / dur, [3.5, 4.6, 6.0], [2.2, 4.4, 3.4], [-0.4, 3.2, -9.6], [-0.6, 3.6, -9.6], 26, 30); };
  },
  // 38 "I've got a little girl with me. Please."  — Nell kneels, pulls the girl close; close-up on Nell, scared for the first time
  (S, cam) => { far(cam); const env = hospitalRoof(S); S.userData.look = 'night';
    const N = nell(S, 'worried', [-1.2, 0, -9.4], 25); const Pp = pip(S, 'scared', [1.4, 0, -9.0], -30); allow(S, ['nell', 'pip']);
    return (t, dur) => { env.rise(0.8 + t * 0.04); env.update(t);
      N.pose(addPose(addPose(idle(t, 0.6), talk(t, 1)), hit([[0, { rFwd: 30 }], [0.6, { lFwd: 70, lUp: -30, rFwd: 125, rUp: -25, bob: -0.6, rLeg: 40, lLeg: -10, lean: 8 }], [dur, { lFwd: 72, lUp: -32, rFwd: 125, rUp: -25, bob: -0.6, rLeg: 40, lLeg: -10, lean: 8, tilt: -6 }]], t)));
      N.setFace(t > dur * 0.5 ? 'teary' : 'worried'); Pp.pose(addPose(idle(t, 1, 2), { rFwd: 50, rUp: -30, turn: 20, nod: 6 }));
      const h = headOf(N); camPath(cam, t / dur, [h.x + 2.4, h.y + 0.3, h.z + 6.4], [h.x + 1.8, h.y + 0.2, h.z + 5.4], [h.x + 0.9, h.y - 0.6, h.z], [h.x + 0.8, h.y - 0.5, h.z], 30, 34); };
  },
  // 39 "The bridge is six minutes away."  — from the clear circle, past frozen Pell: the long bridge across the bay, its lamps disappearing into the white
  (S, cam) => { const sc = street(S, cam); const { env, fog } = sc;
    return (t, dur) => { env.update(t); env.truck.update(t, { jingle: 1 }); fog.update(t, (x, z) => fogRing(TRUCK[0], TRUCK[1], 15, 4)(x, z) * (x > 18 ? 0.15 : 1)); sc.sway(t);
      camPath(cam, t / dur, [23.5, 6.0, 1.5], [23.8, 6.8, 0.0], [29, 8, -100], [31, 10, -100], 24, 28); };
  },
  // 40 "The jingle has ten."  — cut 1: the red display ticks 9:54…9:53; cut 2: you, torn, looking from the phone to the fog
  (S, cam) => { const { env, Ab, A, B } = cab(S, { dog: false }); const ph = fogPhone(S); ph.screen('nell2', 1);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter(t < dur * 0.25 ? '9:54' : '9:53', true, 0.18); const [k, u] = seg(t, dur, [0.45]);
      A.pose(addPose(SIT, addPose(idle(t, 0.7), { rFwd: 78, rUp: -20, lFwd: 35, nod: k ? 4 : 14, turn: k ? Math.sin(t * 2) * 25 : 10 }))); A.setFace(k ? 'worried' : 'nervous');
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.15, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); Ab.pose(addPose(SIT, addPose(idle(t, 0.4), WHEEL)));
      if (k === 0) camPath(cam, u, [0.8, 4.7, 0.9], [0.8, 4.6, 1.4], [0.8, 3.95, 2.7], [0.8, 3.95, 2.7], 34, 40);
      else { const h = headOf(A); camPath(cam, u, [h.x + 0.6, h.y + 0.2, 9.2], [h.x + 0.4, h.y + 0.1, 8.2], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.25, h.z], 34, 38); } };
  },
  // 41 "Abe grips your arm."  — Abe's hand shoots across and closes on your sleeve; you turn to him
  (S, cam) => { const { env, Ab, A } = cab(S, { dog: false }); allow(S, ['abe', 'you']);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:52', true, 0.18);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.4), addPose(anticipate(t, 0.45), hit([[0, WHEEL], [0.3, WHEEL], [0.75, { rFwd: 62, rUp: -10, lFwd: 40, lUp: 62, lean: 4, bodyTurn: 18, bodyTilt: 8, turn: 40 }], [dur, { rFwd: 62, rUp: -10, lFwd: 40, lUp: 62, lean: 4, bodyTurn: 18, bodyTilt: 8, turn: 44 }]], t)))));
      Ab.setFace(t > 0.6 ? 'determined' : 'neutral');
      A.pose(addPose(SIT, addPose(idle(t, 0.6), hit([[0, { rFwd: 40, lFwd: 35 }], [0.8, { rFwd: 40, lFwd: 35 }], [1.2, { rFwd: 30, lFwd: 35, turn: -40, lean: -4 }], [dur, { rFwd: 30, lFwd: 35, turn: -42, lean: -4 }]], t)))); A.setFace(t > 0.9 ? 'shock' : 'worried');
      winCam(cam, t / dur, 0, [20, 22], [10, 9.2]); };
  },
  // 42 "Stay, and I'll tell you what's really out there."  — Abe close, turned to you at last, low and certain
  (S, cam) => { const { env, Ab, A } = cab(S, { dog: false }); allow(S, ['abe', 'you']);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:51', true, 0.18);
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.4), talk(t, 0.9)), { rFwd: 62, rUp: -10, lFwd: 40, lUp: 62, lean: 4, bodyTurn: 18, bodyTilt: 8, turn: 44, nod: 4 }))); Ab.setFace(t > dur * 0.6 ? 'thinking' : 'determined');
      A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 30, lFwd: 35, turn: -42 })));
      const h = headOf(Ab); camPath(cam, t / dur, [h.x + 3.0, h.y + 0.2, h.z + 6.0], [h.x + 2.6, h.y + 0.1, h.z + 5.2], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.28, h.z], 36, 40); };
  },
  // 43 "Do you stay in Abe's truck?" / 44 "Or do you run to Nell? Follow for part two."  — the vote: high and slow over the truck in its ring of clear air;
  //    you stand at the open door, Biscuit beside you, staring at the bridge — the fog all around (frame centre kept calm for the A/B boxes)
  (S, cam) => voteShot(S, cam, 0),
  (S, cam) => voteShot(S, cam, 1),
];

function voteShot(S, cam, part) {
  const sc = street(S, cam); const { env, fog } = sc; const A = you(S, 'worried', [8.2, 0, 4.8], 150); const B = biscuit(S); B.root.position.set(5.2, 0.15, 7.0); B.root.rotation.y = 150 * D;
  return (t, dur) => { const T = t + part * 2.0; env.update(T); env.truck.update(T, { jingle: 1 }); fog.update(T, fogRing(TRUCK[0], TRUCK[1], 15, 4)); sc.sway(T); B.update(T, 'sit');
    A.pose(addPose(idle(T, 1), { turn: Math.sin(T * 0.6) * 25, lean: 2 })); A.root.rotation.y = (150 + Math.sin(T * 0.4) * 10) * D;
    const p = Math.min(1, T / 9); camPath(cam, p, [-10, 21, 34], [-6, 17, 28], [5, 9, -10], [6, 8, -10], 24, 25); };
}
