import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn,
  kellValley, liftStation, VALLEY, stroller, soccerBall, binoMask, marker } from '../../engine/kit.js';
import { MATES, DUNN_AS_BABY, BABY_AS_DUNN, mk, sol, mom, otto, mate, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, far, poof } from './common.js';
import { swapper } from './shots_a.js';
import { SOL, SOL_AS_MOM, MOM, MOM_AS_SOL } from './common.js';

const C = VALLEY.cab, CX = (C.x0 + C.x1) / 2, CZ = (C.z0 + C.z1) / 2, FY = C.y;
const CROSS = { rFwd: 75, lFwd: 75, rUp: -38, lUp: -38 };
// Sol inside cabin 7 (stands on the cabin floor)
const inCab = (S, face, [x, z], ry, swapped = true) => { const A = sol(S, face, [x, FY, z], ry, swapped); return A; };
// binocular POV from cabin 7 down to a point on the pitch
const BINO_EYE = [C.x0 + 0.9, FY + 4.6, -9.5];
const BINOS = { rFwd: 128, lFwd: 128, rUp: -34, lUp: -34, nod: -4 };

export const SHOTS_B = [
  // 25 "And the final was starting."  — golden hour, low on the pitch: Mom in Sol's #7 kit between teammates, knees shaking; the crowd up, the ref's whistle
  (S, cam) => { far(cam); const env = kellValley(S);
    const M = mom(S, 'scared', [0, 0, -6], 0, true); const A = mate(S, 0, 'determined', [-4.6, 0, -6.6], 10), B = mate(S, 1, 'smirk', [4.6, 0, -6.6], -10);
    const O1 = mate(S, 2, 'angry', [-3, 0, -15], 180), O2 = mate(S, 3, 'smirk', [3, 0, -15.5], 180); const ball = soccerBall(S); ball.position.set(0, 0.55, -10);
    return (t, dur) => { env.update(t, 0.6);
      M.pose(addPose(idle(t, 0.6), { rFwd: 20, lFwd: 20, rUp: -12, lUp: -12, bob: Math.abs(Math.sin(t * 16)) * 0.04, tilt: Math.sin(t * 13) * 2, turn: Math.sin(t * 1.4) * 20 }));
      A.pose(addPose(idle(t, 0.7, 2), { rFwd: 30, lFwd: 30, lean: 10 })); B.pose(addPose(idle(t, 0.7, 3), { rUp: 20, lUp: 20, lean: 8 }));
      O1.pose(idle(t, 0.7, 4)); O2.pose(idle(t, 0.7, 5)); if (t > dur * 0.5) M.setFace('nervous');
      camPath(cam, t / dur, [1.0, 1.8, 9.5], [0.4, 2.6, 7.4], [0, 3.6, -8], [0, 4.0, -8], 24, 26); };
  },
  // 26 '"She's never even watched a game," I said.'  — back at the station: Sol, in the red jacket, mutters to Otto at the workbench, arms folded
  (S, cam) => { far(cam); const env = liftStation(S);
    const A = sol(S, 'pout', [-9.6, 0, 3.4], -100, true), O = otto(S, 'neutral', [-14.0, 0, 2.2], 70);
    return (t, dur) => { env.spin(0.3); env.update(t);
      A.pose(addPose(addPose(idle(t, 0.5), talk(t, 1)), addPose(CROSS, { nod: 10, turn: hn([[0, 30], [dur * 0.5, 30], [dur * 0.7, 0], [dur, 0]], t) })));
      O.pose(addPose(idle(t, 0.5, 2), addPose({ rFwd: 40, lFwd: 30 }, lookAt(O, headOf(A)))));
      const h = headOf(A).toArray(); faceCam(cam, t / dur, h, -100, { dist: 7.0, lens: 34, side: 0.9, push: 0.7, look: -0.3 }); };
  },
  // 27 'Otto smiled. "She's never missed one."'  — close on Otto: a slow, warm smile under the big white beard
  (S, cam) => { far(cam); const env = liftStation(S);
    const A = sol(S, 'pout', [-9.6, 0, 3.4], -100, true), O = otto(S, 'neutral', [-14.0, 0, 2.2], 70);
    return (t, dur) => { env.spin(0.3); env.update(t);
      O.pose(addPose(addPose(idle(t, 0.5, 2), t > dur * 0.35 ? talk(t, 0.8) : {}), addPose({ rFwd: 40, lFwd: 30, tilt: 6 }, lookAt(O, headOf(A)))));
      if (t > dur * 0.2) O.setFace('softsmile');
      A.pose(addPose(idle(t, 0.5), CROSS));
      const h = headOf(O).toArray(); faceCam(cam, t / dur, h, 70, { dist: 6.6, lens: 36, side: -0.7, push: 0.8, look: -0.3 }); };
  },
  // 28 "He pointed up the cable."  — Otto points out of the open back of the station; the camera swings round and follows the cable up the mountain
  (S, cam) => { far(cam); const env = liftStation(S);
    const A = sol(S, 'confused', [-5.0, 0, 0.4], 200, true), O = otto(S, 'smile', [-11.0, 0, 3.0], 160);
    return (t, dur) => { env.spin(0.3); env.update(t);
      O.pose(addPose(idle(t, 0.5, 2), hit([[0, { rFwd: 20 }], [0.5, { rFwd: 150, rUp: 10, turn: 5 }], [dur, { rFwd: 152, rUp: 12, turn: 5, nod: -10 }]], t)));
      A.pose(addPose(idle(t, 0.6), { nod: hn([[0, 0], [0.8, -18], [dur, -24]], t), turn: -10 }));
      camPath(cam, t / dur, [-6.5, 4.0, 13.0], [-3.5, 2.6, 10.5], [-10.4, 4.6, 2.6], [0, 24, -60], 24, 22); };
  },
  // 29 "Cabin seven stops right above the field."  — from the pitch, tilt up past the crowd to red cabin 7 hanging on the cable, high above the field
  (S, cam) => { far(cam); const env = kellValley(S);
    return (t, dur) => { env.update(t, 0.2); camPath(cam, t / dur, [-2, 3.0, 18], [-1, 2.4, 14], [0, 8, -14], [CX, FY + 3, CZ], 24, 26); };
  },
  // 30 "I rode it up."  — cabin 7 glides along the cable into place over the field, Sol (red jacket) pressed to the glass
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'determined', [CX + 1.5, CZ + 1.5], 20); const g0 = env.cab.position.clone();
    return (t, dur) => { const dx = -18 * (1 - sm(t, 0, dur * 0.9)); env.update(t, 0.1); env.cab.position.x = dx; env.cab.position.y += dx * 0.11; A.root.position.set(CX + 1.5 + dx, FY + env.cab.position.y, CZ + 1.5);
      A.pose(addPose(idle(t, 0.5), { rFwd: 70, lFwd: 70, rUp: -6, lUp: -6, nod: 10 }));
      camPath(cam, t / dur, [CX - 8 + dx, FY + 6, C.z1 + 20], [CX - 3, FY + 4.6, C.z1 + 15], [CX + dx, FY + 4.0, CZ], [CX, FY + 4.0, CZ], 26, 28); };
  },
  // 31 "Inside: binoculars. An old radio."  — insert: Sol's hand reaches past the binoculars on the bench; cut 2: the little wooden radio, dial glowing
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'awe', [CX - 2.4, CZ + 1.8], -70);
    return (t, dur) => { env.update(t, 0.1); const [k, u] = seg(t, dur, [0.5]);
      A.pose(addPose(idle(t, 0.5), hit([[0, { rFwd: 20 }], [0.8, { rFwd: 60, rUp: -6, nod: 30, lean: 10 }], [dur, { rFwd: 62, rUp: -6, nod: 30, lean: 12 }]], t)));
      const b = env.binos.getWorldPosition(new THREE.Vector3()), r = env.radio.getWorldPosition(new THREE.Vector3());
      if (k === 0) camPath(cam, u, [b.x + 3.2, b.y + 1.6, b.z + 3.2], [b.x + 2.6, b.y + 1.2, b.z + 2.6], [b.x, b.y, b.z], [b.x, b.y + 0.1, b.z], 32, 36);
      else camPath(cam, u, [r.x - 3.4, r.y + 1.4, r.z + 3.0], [r.x - 2.7, r.y + 1.1, r.z + 2.4], [r.x, r.y + 0.4, r.z], [r.x, r.y + 0.45, r.z], 32, 36); };
  },
  // 32 "The window was covered in writing."  — Sol turns; the camera rises behind his shoulder to reveal the back window covered in marker writing, valley glowing beyond
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'awe', [CX + 1.2, CZ + 1.6], 180);
    return (t, dur) => { env.update(t, 0.1); A.root.rotation.y = hn([[0, 120], [0.6, 120], [1.1, 185], [dur, 185]], t) * D;
      A.pose(addPose(idle(t, 0.5), { nod: -6, rFwd: 10 })); if (t > 1.0) A.setFace('shock');
      camPath(cam, t / dur, [CX + 4.6, FY + 3.6, C.z1 - 0.6], [CX + 4.2, FY + 5.6, C.z1 - 0.4], [CX + 1.0, FY + 4.2, C.z0], [CX - 0.4, FY + 4.8, C.z0], 22, 22); };
  },
  // 33 "Every game I ever played. Every score."  — slow pan across the rows of dates and scores; Sol's fingertips trail along the glass
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'awe', [CX + 2.6, C.z0 + 2.6], 200);
    return (t, dur) => { env.update(t, 0.1); A.root.position.x = CX + 2.8 - t * 0.5;
      A.pose(addPose(idle(t, 0.5), { rFwd: 95, rUp: 10, nod: -4, turn: -10 }));
      camPath(cam, t / dur, [CX - 2.6, FY + 5.6, C.z0 + 7.6], [CX + 1.6, FY + 5.4, C.z0 + 7.2], [CX - 2.8, FY + 5.8, C.z0], [CX + 1.8, FY + 5.6, C.z0], 24, 24); };
  },
  // 34 '"Sol's first goal!" In her handwriting.'  — the big red circled line; push in on it, then rack to Sol's face behind the glass
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'teary', [CX + 2.4, C.z0 + 2.2], 190); fill(S, [CX + 2.4, FY + 5.6, C.z0 - 3], 4, 0xffd8b0, 8);
    return (t, dur) => { env.update(t, 0.1); const [k, u] = seg(t, dur, [0.5]);
      A.pose(addPose(idle(t, 0.4), { rFwd: 100, rUp: 6, nod: -2 }));
      if (k === 0) camPath(cam, u, [CX - 1.6, FY + 4.6, C.z0 + 8.6], [CX - 1.6, FY + 4.5, C.z0 + 6.6], [CX - 1.6, FY + 4.4, C.z0], [CX - 1.6, FY + 4.4, C.z0], 24, 26);
      else { const h = headOf(A).toArray(); camPath(cam, u, [h[0] - 0.6, h[1] + 0.1, C.z0 - 6.4], [h[0] - 0.4, h[1], C.z0 - 5.6], [h[0], h[1] - 0.3, h[2]], [h[0], h[1] - 0.25, h[2]], 34, 36); } };
  },
  // 35 "Forty games. She never missed one."  — (also the hook) from outside the glass: Sol's face through her mirrored writing, eyes filling, the valley reflected
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'teary', [CX + 0.6, C.z0 + 2.0], 180); fill(S, [CX + 0.6, FY + 5.0, C.z0 - 3.2], 5, 0xffd0a0, 8);
    return (t, dur) => { env.update(t, 0.1);
      A.pose(addPose(idle(t, 0.4), hit([[0, { rFwd: 30, nod: -8 }], [0.8, { rFwd: 105, rUp: 4, nod: -6 }], [dur, { rFwd: 108, rUp: 4, nod: -4, tilt: 4 }]], t)));
      if (t > dur * 0.55) A.setFace('cry');
      const h = headOf(A).toArray(); camPath(cam, t / dur, [h[0] + 0.8, h[1] - 0.2, C.z0 - 7.6], [h[0] + 0.4, h[1], C.z0 - 6.2], [h[0], h[1] - 0.2, h[2]], [h[0], h[1] - 0.15, h[2]], 32, 36); };
  },
  // 36 "She just couldn't come down."  — wide: tiny red cabin 7 alone in the golden sky above the pitch; slow pull back
  (S, cam) => { far(cam); const env = kellValley(S);
    const A = inCab(S, 'sad', [CX, CZ], 180);
    return (t, dur) => { env.update(t, 0.3); camPath(cam, t / dur, [CX - 6, FY + 4, C.z1 + 26], [CX - 12, FY + 1, C.z1 + 44], [CX, FY + 2, CZ], [CX - 2, FY - 6, CZ - 6], 30, 26); };
  },
  // 37 "I looked through her binoculars."  — Sol at the front glass lifts the binoculars to his eyes
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'sad', [C.x0 + 2.7, -9.5], -90); const bn = env.binos;
    return (t, dur) => { env.update(t, 0.3);
      A.pose(addPose(idle(t, 0.4), hit([[0, { rFwd: 50, lFwd: 50, nod: 20 }], [0.8, { rFwd: 60, lFwd: 60, nod: 10 }], [1.4, BINOS], [dur, { ...BINOS, nod: -6 }]], t)));
      const a = pinky(A, 'R'), b = pinky(A, 'L'); bn.parent.worldToLocal(bn.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.15, (a.z + b.z) / 2 + 0.1)); bn.rotation.set(0, -Math.PI / 2, 0);
      const h = headOf(A).toArray(); faceCam(cam, t / dur, h, -90, { dist: 7.2, lens: 34, side: 0.9, push: 0.9, look: -0.4 }); };
  },
  // 38 "There was Mom, in my kit, terrified."  — binocular POV down onto the pitch: Mom in the #7 kit, frozen while play rushes past her
  (S, cam) => { far(cam); const env = kellValley(S); const mask = binoMask(S); S.userData.dof = false; S.userData.handheld = false;
    const M = mom(S, 'scared', [-16, 0, -12], 75, true); const A = mate(S, 2, 'determined', [-20, 0, -7.5], 90), B = mate(S, 0, 'determined', [-12, 0, -17], -90); const ball = soccerBall(S);
    const cab = sol(S, 'sad', [CX, FY, CZ], 0, true); cab.root.visible = false;
    return (t, dur) => { env.update(t, 0.4);
      M.pose(addPose(idle(t, 0.6), { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, bob: Math.abs(Math.sin(t * 18)) * 0.05, tilt: Math.sin(t * 15) * 3, nod: 8 }));
      A.root.position.x = -22 + t * 4; A.pose(RUN(t)); B.root.position.x = -10 - t * 3.5; B.pose(RUN(t + 0.3)); ball.position.set(A.root.position.x + 1.4, 0.55, -7.0); ball.rotation.z = -t * 8;
      const tg = [-16 + Math.sin(t * 1.3) * 0.25, 2.8, -12]; camPath(cam, t / dur, BINO_EYE, BINO_EYE, tg, [tg[0] + 0.2, 3.0, tg[2]], 70, 78);
      cam.position.x += Math.sin(t * 7) * 0.02; mask.update(cam); };
  },
  // 39 "Then she looked up at cabin seven. And waved."  — binocular POV: Mom tips her head right up at the cabin… and waves, a big brave smile
  (S, cam) => { far(cam); const env = kellValley(S); const mask = binoMask(S); S.userData.dof = false; S.userData.handheld = false;
    const M = mom(S, 'scared', [-16, 0, -12], 90, true);
    return (t, dur) => { env.update(t, 0.4); const up = 0.7;
      M.pose(addPose(idle(t, 0.5), hit([[0, { nod: 10, rFwd: 30, lFwd: 30 }], [up, { nod: 10, rFwd: 30, lFwd: 30 }], [up + 0.4, { nod: -45, lean: -8, rFwd: 20, lFwd: 20 }], [up + 1.0, { nod: -48, lean: -8, rUp: 150, lFwd: 10 }], [dur, { nod: -48, lean: -8, rUp: 150 + Math.sin(t * 8) * 18 }]], t)));
      if (t > up) M.setFace('softsmile'); if (t > up + 1.0) M.setFace('smile');
      const tg = [-16, 3.4, -12]; camPath(cam, t / dur, BINO_EYE, BINO_EYE, tg, tg, 80, 92); mask.update(cam); };
  },
  // 40 "And just like that, I wasn't angry anymore."  — Sol lowers the binoculars; tears, then a soft smile, golden light on his face
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = inCab(S, 'teary', [C.x0 + 2.7, -9.5], -90); const bn = env.binos; fill(S, [C.x0 - 2.5, FY + 5.4, -8.5], 6, 0xffc890, 8);
    return (t, dur) => { env.update(t, 0.3);
      A.pose(addPose(idle(t, 0.4), hit([[0, BINOS], [0.8, BINOS], [1.6, { rFwd: 55, lFwd: 55, rUp: -10, lUp: -10, nod: 4 }], [dur, { rFwd: 52, lFwd: 52, rUp: -10, lUp: -10, nod: 2, tilt: 5 }]], t)));
      if (t > 1.4) A.setFace('relieved'); if (t > dur * 0.7) A.setFace('softsmile');
      const a = pinky(A, 'R'), b = pinky(A, 'L'); bn.parent.worldToLocal(bn.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.15, (a.z + b.z) / 2 + 0.1)); bn.rotation.set(0, -Math.PI / 2, 0);
      const h = headOf(A).toArray(); faceCam(cam, t / dur, h, -90, { dist: 6.0, lens: 38, side: 0.5, push: 0.8, look: -0.3 }); };
  },
  // 41 "Poof! I was back in my kit."  — sparkles burst; Sol is in his green #7 again — he looks down, laughs, punches the air
  (S, cam) => { far(cam); const env = kellValley(S, { focus: 'cabin' });
    const A = swapper(S, SOL_AS_MOM, SOL, 'sol', 'softsmile', [CX - 1.0, FY, CZ + 1.0], 15, 0.95); const P = poof(S, 24);
    return (t, dur) => { env.update(t, 0.3); const tp = 0.35, sw = t > tp; A.show(sw); P.set(headOf(A.cur).add(V([0, -1.4, 0])), ramp(t, tp - 0.15, tp + 0.9));
      A.pose(addPose(idle(t, 0.5), sw ? hit([[tp, { rUp: 40, lUp: 40 }], [tp + 0.4, { rFwd: 30, lFwd: 30, nod: 30 }], [tp + 1.1, { rFwd: 30, lFwd: 30, nod: 28 }], [tp + 1.4, { rUp: 160, lUp: 20, nod: -10, bob: 0.2 }], [dur, { rUp: 165, lUp: 25, nod: -12, bob: 0.1 }]], t) : {}));
      A.face(t < tp + 0.3 ? 'shock' : t < tp + 1.2 ? 'delighted' : 'laugh');
      camPath(cam, t / dur, [CX - 2.6, FY + 4.6, C.z1 + 4.0], [CX - 2.2, FY + 4.4, C.z1 + 2.6], [CX - 1.0, FY + 3.4, CZ + 1.0], [CX - 1.0, FY + 3.6, CZ + 1.0], 24, 26); };
  },
  // 42 "Mom was on the field, in her jacket."  — on the pitch: POOF, Mom is in her red jacket among the green kits; she stares at it, then laughs
  (S, cam) => { far(cam); const env = kellValley(S);
    const M = swapper(S, MOM_AS_SOL, MOM, 'mom', 'scared', [-14, 0, -8], 40); const A = mate(S, 1, 'shock', [-8.6, 0, -9.5], -60); const P = poof(S, 24);
    return (t, dur) => { env.update(t, 0.5); const tp = 0.3, sw = t > tp; M.show(sw); P.set(headOf(M.cur).add(V([0, -1.6, 0])), ramp(t, tp - 0.15, tp + 0.9));
      M.pose(addPose(idle(t, 0.5), sw ? hit([[tp, { rUp: 40, lUp: 40 }], [tp + 0.4, { rFwd: 40, lFwd: 40, nod: 30, rUp: 20, lUp: 20 }], [tp + 1.2, { rFwd: 40, lFwd: 40, nod: 28, rUp: 20, lUp: 20 }], [tp + 1.5, { rFwd: 130, lFwd: 0, rUp: -30, nod: -6 }], [dur, { rFwd: 132, rUp: -30, nod: -8 }]], t) : {}));
      M.face(t < tp + 0.5 ? 'shock' : t < tp + 1.3 ? 'confused' : 'laugh');
      A.pose(addPose(idle(t, 0.6), { rUp: 30, lUp: 30, lean: -6 }));
      camPath(cam, t / dur, [-10.2, 4.0, 4.8], [-11.0, 4.2, 3.0], [-12.6, 3.4, -8.6], [-12.8, 3.6, -8.6], 26, 28); };
  },
  // 43 "Last minute. She kicked with her eyes closed."  — the ball rolls to Mom; she winds up (eyes squeezed shut) and boots it; cut 2: the ball rockets at the goal
  (S, cam) => { far(cam); const env = kellValley(S);
    const M = mom(S, 'scared', [-19, 0, -10.6], -90); const K = mate(S, 3, 'determined', [-28.2, 0, -10], 90); const ball = soccerBall(S);
    return (t, dur) => { env.update(t, 0.8); const [k, u] = seg(t, dur, [0.55]); const tk = dur * 0.45;
      if (t < tk) ball.position.set(-12 - (t / tk) * 6.0, 0.55, -10.2); else { const v = (t - tk); ball.position.set(-18 - v * 14, 0.55 + Math.sin(Math.min(1, v / 0.7) * Math.PI) * 2.6, -10.2 + v * 1.0); }
      ball.rotation.z = t * 9;
      M.pose(addPose(idle(t, 0.4), hit([[0, { rFwd: 20, lFwd: 20 }], [tk - 0.45, { rLeg: -40, lean: -10, rUp: 40, lUp: 40 }], [tk, { rLeg: 85, lean: 12, rUp: 60, lUp: 50 }], [dur, { rLeg: 30, lean: 6, rUp: 70, lUp: 60 }]], t)));
      M.setFace(t < tk - 0.5 ? 'scared' : 'sleeping');
      K.pose(addPose(idle(t, 0.6), t > tk + 0.15 ? { rUp: 150, lUp: 150, bodyTilt: -25 } : { rFwd: 40, lFwd: 40, lean: 10 })); K.root.position.z = -10 + (t > tk + 0.15 ? -sm(t, tk + 0.15, tk + 0.6) * 2.4 : 0);
      if (k === 0) { const h = headOf(M).toArray(); camPath(cam, u, [h[0] - 8.5, 2.6, h[2] + 4.0], [h[0] - 7.4, 2.8, h[2] + 3.4], [h[0], 2.8, h[2]], [h[0], 3.0, h[2]], 28, 30); }
      else camPath(cam, u, [-15, 2.0, -4], [-17, 2.2, -5.0], [-26, 2.8, -9.6], [-29, 2.8, -9.6], 30, 32); };
  },
  // 44 "Goal! Even Mr. Dunn cheered."  — cut 1: the net bulges, the crowd leaps up; cut 2: Mr. Dunn, still in the onesie in his pram by the stands, cheers with both fists
  (S, cam) => { far(cam); const env = kellValley(S);
    const K = mate(S, 3, 'shock', [-28.2, 0, -12.4], 120); const ball = soccerBall(S);
    const pr = stroller(S, { col: 0x5ab8e8 }); pr.position.set(18, 0, -21); pr.rotation.y = 0;
    const Dn = mk(S, DUNN_AS_BABY, 'dunn', 'delighted', [18, 1.2, -21.4], 0); const Bb = mk(S, BABY_AS_DUNN, 'baby', 'laugh', [23.2, 0, -21.6], -10, 0.5);
    allow(S, ['dunn', 'stroller'], ['dunn', 'bleacher*']);
    return (t, dur) => { const [k, u] = seg(t, dur, [0.45]); env.update(t, k === 0 ? sm(t, 0.3, 0.8) : 1);
      K.pose(addPose(idle(t, 0.4), { rUp: 20, lUp: 20, nod: 20 })); K.root.rotation.z = 0;
      const v = sm(t, 0, 0.45); ball.position.set(-28.6 - v * 2.6, 2.2 - v * 1.0, -9.0); env.goals[0].children.forEach((c, i) => { if (c.material && c.material.transparent) c.position.x = (c.position.x < 0 ? -1 : 1) * Math.abs(c.position.x); });
      Dn.pose(addPose({ rLeg: 80, lLeg: 80 }, { rUp: 150 + Math.sin(t * 9) * 15, lUp: 150 + Math.cos(t * 9) * 15, nod: -12, bob: Math.abs(Math.sin(t * 9)) * 0.1 }));
      Bb.pose(addPose(idle(t, 0.6), { rUp: 120 + Math.sin(t * 10) * 20, lUp: 40, bob: Math.abs(Math.sin(t * 10)) * 0.1 }));
      if (k === 0) { camPath(cam, u, [-20, 3.0, 2.0], [-21, 3.4, 0.5], [-29, 3.2, -10], [-29, 3.6, -10], 26, 28); shake(cam, t, 0.35, 0.6); }
      else { const h = headOf(Dn).toArray(); camPath(cam, u, [h[0] - 2.4, h[1] + 0.4, h[2] + 11], [h[0] - 1.8, h[1] + 0.2, h[2] + 9.5], [h[0] + 1.2, h[1] - 0.8, h[2]], [h[0] + 1.2, h[1] - 0.6, h[2]], 28, 30); } };
  },
  // 45 "That night, I wrote on the window myself."  — night in cabin 7, lantern glow: Sol (green kit) writes a new line on the glass while Mom (red jacket) watches, smiling
  (S, cam) => { far(cam); const env = kellValley(S, { time: 'night', focus: 'cabin' });
    const A = inCab(S, 'softsmile', [CX + 2.2, C.z0 + 2.0], 175, false); const M = mom(S, 'softsmile', [CX - 1.5, FY, C.z0 + 2.8], 110); const mk2 = marker(S, 0x2a5ad8);
    fill(S, [CX + 0.6, FY + 5.6, C.z0 + 7.0], 6, 0xffc080, 10);
    return (t, dur) => { env.update(t, 0); env.newLine(sm(t, dur * 0.15, dur * 0.95));
      const wk = sm(t, dur * 0.15, dur * 0.95); A.root.position.x = CX + 1.4 + wk * 1.5; A.pose(addPose(idle(t, 0.4), { rFwd: 62 + Math.sin(t * 7) * 4, rUp: -14 + Math.sin(t * 5) * 5, turn: Math.sin(t * 0.8) * 6, nod: 14 }));
      hold(mk2, A, 'R', [0, 0.0, -0.2]); mk2.rotation.x = -0.6;
      M.pose(addPose(idle(t, 0.4, 2), addPose({ rFwd: 20, lFwd: 20, tilt: 6 }, lookAt(M, headOf(A)))));
      camPath(cam, t / dur, [CX - 0.4, FY + 5.6, C.z1 - 0.8], [CX + 0.2, FY + 5.2, C.z1 - 1.6], [CX + 1.4, FY + 3.6, C.z0], [CX + 1.8, FY + 3.5, C.z0], 18, 19); };
  },
  // 46 '"Mom's first goal."'  — from outside at night: the new blue line on the glass, mother and son leaning together behind it in the lantern light
  (S, cam) => { far(cam); const env = kellValley(S, { time: 'night', focus: 'cabin' });
    const A = inCab(S, 'smile', [CX + 2.4, C.z0 + 2.2], 185, false); const M = mom(S, 'softsmile', [CX - 2.0, FY, C.z0 + 2.4], 175); env.newLine(1);
    fill(S, [CX + 0.6, FY + 5.0, C.z0 - 2.6], 6, 0xffc080, 9);
    return (t, dur) => { env.update(t, 0);
      A.pose(addPose(idle(t, 0.4), { rFwd: 8, rUp: 25, tilt: 8, turn: -18 })); M.pose(addPose(idle(t, 0.4, 2), { lUp: 25, tilt: -8, turn: 18 }));
      if (t > dur * 0.4) { A.setFace('laugh'); M.setFace('laugh'); }
      camPath(cam, t / dur, [CX + 0.6, FY + 3.6, C.z0 - 9.5], [CX + 0.6, FY + 3.8, C.z0 - 7.8], [CX + 0.6, FY + 3.6, C.z0], [CX + 0.6, FY + 3.8, C.z0], 26, 30); };
  },
  // 47 "She never missed my games. She just watched from higher up."  — night wide: lantern-lit cabin 7 high above the dark pitch under the stars; slow pull back and up
  (S, cam) => { far(cam); const env = kellValley(S, { time: 'night' });
    const A = inCab(S, 'smile', [CX - 1.6, C.z0 + 2.2], 175, false); const M = mom(S, 'softsmile', [CX + 2.8, FY, C.z0 + 2.4], 185);
    return (t, dur) => { env.update(t, 0); A.pose(idle(t, 0.4)); M.pose(idle(t, 0.4, 2));
      camPath(cam, t / dur, [CX + 6, FY + 3, C.z1 + 16], [CX - 6, FY - 8, C.z1 + 52], [CX, FY + 4, CZ], [CX - 2, FY - 4, CZ - 10], 32, 24); };
  },
];
