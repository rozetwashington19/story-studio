import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  fogBoardwalk, truckCab, gramophone, musicNotes, fogTouch, fogPhone } from '../../engine/kit.js';
import { you, abe, dot, biscuit, ramp, sm, V, headOf, faceCam, fill, allow, hn, RUN, shake, far } from './common.js';

// ---------- shared builders ----------
// the boardwalk outside Dot's: you carry the record player (its music = a small clear bubble round you), Biscuit, Dot in the doorway
export function board(S, cam, { youAt = [0, 0, -4.4], youRy = 20, dotFog = 0, dotFace = 'worried', dog = true, dotOn = true } = {}) {
  const env = fogBoardwalk(S); S.userData.look = 'night'; const up0 = env.update; let pend = null; env.update = (t, o = {}) => { pend = [t, o]; };
  (S.userData.tickers = S.userData.tickers || []).push(() => { if (pend) up0(pend[0], { ...pend[1], cam }); });   // fog updates after camPath (clear pocket round the camera)
  const A = you(S, 'worried', youAt, youRy); const B = dog ? biscuit(S) : null;
  const Dt = dotOn ? dot(S, dotFace, [0, 0, -5.2], 0) : null; if (Dt) fogTouch(Dt, dotFog);
  const g = gramophone(S); g.scale.setScalar(0.65); const notes = musicNotes(S, 12);
  env.loose.position.set(3.6, 0.06, 1.0);
  allow(S, ['you', 'gramophone'], ['biscuit', 'you']);
  const carry = (t, k = 1) => { A.root.updateMatrixWorld(true); const c = A.root.localToWorld(new THREE.Vector3(0, 1.9, 1.35)); g.position.copy(c); g.rotation.y = A.root.rotation.y - Math.PI / 2;
    notes.update(t, g.bellPos(), k, { up: 3, spread: 1.8, size: 0.4 }); return c; };
  return { env, A, B, Dt, g, notes, carry };
}
export const HOLD = { rFwd: 30, lFwd: 30, rUp: -18, lUp: -18 };
// the walk path: doorway (0, -4.4) → cab door (6.4, 4.6)
export const PATH = (u) => [6.4 * u, 0, -4.4 + 9.0 * u];
export const PATH_RY = Math.atan2(6.4, 9.0) / D;
// cab: Abe (driver, x -2.4) + you (x 2.4), the record player on the dash between you
export function cab(S, { youOn = true, ring = 12, abeFog = 0, abeFace = 'sleepy', gramOn = true } = {}) {
  const env = truckCab(S, { ring }); S.userData.look = 'night';
  const Ab = abe(S, abeFace, [-2.4, 0, -0.5], 0); sitOn(Ab, 1.6); fogTouch(Ab, abeFog);
  const A = youOn ? you(S, 'worried', [2.4, 0, -0.5], 0) : null; if (A) sitOn(A, 1.6);
  allow(S, ['abe', 'seat*'], ['you', 'seat*']);
  let g = null, notes = null; if (gramOn) { g = gramophone(S); g.scale.setScalar(0.45); g.position.set(0, 3.36, 3.6); g.rotation.y = 0; notes = musicNotes(S, 10); }
  return { env, Ab, A, g, notes, sing: (t, k = 1, spin = 1) => { if (g) { g.update(t, { spin }); notes.update(t, g.bellPos(), k, { up: 2.6, spread: 1.6, size: 0.35 }); } } };
}
export const WHEEL = { rFwd: 62, lFwd: 62, rUp: -10, lUp: -10 };
export const winCam = (cam, p, x, lens = [20, 22], dz = [9.8, 9.0], y = [5.3, 5.2]) => camPath(cam, p, [x, y[0], dz[0]], [x, y[1], dz[1]], [x * 0.6, 4.5, -0.6], [x * 0.6, 4.55, -0.6], lens[0], lens[1]);
export const frozen = (A, t, base = {}, seed = 0) => A.pose(addPose(base, { nod: -3 + Math.sin(t * 0.6 + seed) * 2, turn: Math.sin(t * 0.4 + seed) * 6, tilt: Math.sin(t * 0.7 + seed) * 2, bob: Math.sin(t * 1.1 + seed) * 0.02 }));
const youWalk = (A, t, sp = 9) => addPose(addPose(walk(t, sp, 0.7), HOLD), { nod: 4 });

export const SHOTS_A = [
  // 2 "Most of you said: save Abe."  — in Dot's doorway: you lift your chin, record player in your arms, staring out into the white; slow push-in
  (S, cam) => { const { env, A, B, Dt, carry } = board(S, cam, { youAt: [0, 0, -3.2], youRy: 0 });
    return (t, dur) => { env.update(t, { cx: 0, cz: -3.2, r: 4.5 }); carry(t, 0.8); A.pose(addPose(idle(t, 0.8), addPose(HOLD, { nod: -4, turn: Math.sin(t * 0.6) * 10 }))); A.setFace(t > dur * 0.5 ? 'determined' : 'worried');
      B.root.position.set(-1.8, 0, -2.4); B.root.rotation.y = 20 * D; B.update(t, 'sit'); frozen(Dt, t, { rFwd: 20 }, 1); Dt.pose(addPose(idle(t, 0.8, 2), { rFwd: 30, lFwd: 10, turn: 10 }));
      const h = headOf(A); camPath(cam, t / dur, [h.x + 0.6, h.y + 0.3, 6.4], [h.x + 0.4, h.y + 0.2, 4.0], [h.x, h.y - 0.6, h.z], [h.x, h.y - 0.4, h.z], 30, 34); };
  },
  // 3 "Five fifty-three. You lift the record player."  — low: you heave the record player off the crate into your arms (anticipation squat, then lift); the notes start to rise
  (S, cam) => { const { env, A, B, Dt, g, carry } = board(S, cam, { youAt: [0, 0, -3.4], youRy: 0 });
    return (t, dur) => { env.update(t, { cx: 0, cz: -3.4, r: 4.2 }); const k = ramp(t, 0.4, 1.0);
      A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 70, lFwd: 70, rUp: -18, lUp: -18, lean: 22, bob: -0.25 }], [0.4, { rFwd: 75, lFwd: 75, rUp: -18, lUp: -18, lean: 26, bob: -0.35 }], [1.0, { ...HOLD, lean: -4 }], [9, { ...HOLD, lean: 0 }]], t)));
      const c = carry(t, k); if (t < 0.4) g.position.y = 1.4; else g.position.y = 1.4 + (c.y - 1.4) * Math.min(1, k * 1.15);
      B.root.position.set(-1.8, 0, -2.4); B.root.rotation.y = 20 * D; B.update(t, 'sit'); Dt.pose(addPose(idle(t, 0.8, 2), { rFwd: 30, lFwd: 10 }));
      camPath(cam, t / dur, [2.8, 1.6, 3.6], [2.4, 2.2, 3.0], [0, 2.0, -3.2], [0, 3.6, -3.4], 24, 26); };
  },
  // 4 "Dot holds the door. 'Go. Quickly.'"  — Dot, holding the door wide, talking low and fast; you nod and turn
  (S, cam) => { const { env, A, B, Dt, carry } = board(S, cam, { youAt: [2.8, 0, -2.0], youRy: -40, dotFace: 'determined' });
    return (t, dur) => { env.update(t, { cx: 1.0, cz: -3.4, r: 5 }); env.door.open(1); carry(t, 0.8);
      Dt.pose(addPose(addPose(idle(t, 0.8, 2), talk(t, 1.2)), { lUp: 70, lFwd: 20, rFwd: 40, rUp: -20, turn: lookAt(Dt, headOf(A)).turn * 0.6 })); Dt.setFace(t > 0.6 ? 'worried' : 'determined');
      A.pose(addPose(idle(t, 0.7), addPose(HOLD, hit([[0, { turn: -20 }], [0.9, { turn: -20, nod: 10 }], [1.3, { turn: 30, nod: 0 }], [9, { turn: 35 }]], t)))); A.setFace('determined');
      B.root.position.set(-1.8, 0, -2.0); B.update(t, 'sit');
      const h = headOf(Dt); faceCam(cam, t / dur, [h.x, h.y, h.z], 0, { dist: 7.6, lens: 28, side: -1.6, push: 0.6 }); };
  },
  // 5 "The song makes a bubble, just big enough for you."  — high and wide: a small round pocket of clear air around you in a sea of white, gold notes rising out of it
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = ramp(t, 0, dur) * 0.18, [x, , z] = PATH(u); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; A.pose(youWalk(t, 7)); carry(t, 1);
      B.root.position.set(x - 1.6, 0, z + 0.6); B.root.rotation.y = PATH_RY * D; B.update(t, 'run'); env.update(t, { cx: x, cz: z + 0.6, r: 4.0 });
      camPath(cam, t / dur, [x - 2, 17, z + 12], [x - 1, 15, z + 10], [x, 1, z], [x, 1, z], 24, 26); };
  },
  // 6 "Biscuit presses against your legs."  — low close: Biscuit glued to your boots, ears back, looking up at the fog wall
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = 0.2 + ramp(t, 0, dur) * 0.08, [x, , z] = PATH(u); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; A.pose(youWalk(t, 6)); carry(t, 1);
      B.root.position.set(x - 1.0, 0, z + 1.0); B.root.rotation.y = (PATH_RY - 15) * D; B.update(t, 'run'); B.head.rotation.y = Math.sin(t * 2) * 0.4; env.update(t, { cx: x, cz: z + 0.6, r: 3.8 });
      camPath(cam, t / dur, [x + 1.0, 2.2, z + 8.4], [x + 0.6, 2.4, z + 7.6], [x - 0.6, 1.8, z + 1], [x - 0.6, 2.4, z + 0.6], 24, 26); };
  },
  // 7 "Ten steps to the truck. The fog leans in."  — tracking from the side: the truck's pink shape in the white ahead, the bubble edges curling inward
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = 0.28 + ramp(t, 0, dur) * 0.22, [x, , z] = PATH(u); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; A.pose(youWalk(t, 8)); carry(t, 1); A.setFace('scared');
      B.root.position.set(x - 1.4, 0, z + 0.4); B.root.rotation.y = PATH_RY * D; B.update(t, 'run'); env.update(t, { cx: x, cz: z + 0.6, r: 3.8 - ramp(t, 0, dur) * 0.6 });
      camPath(cam, t / dur, [x - 5.4, 4.4, z + 1.0], [x - 5.2, 4.4, z + 1.6], [x + 1, 3.2, z + 2], [x + 1, 3.2, z + 2.5], 24, 26); };
  },
  // 8 "Your foot catches a board."  — close on your boot: the loose board kicks up, you stumble forward (the record player jolts)
  (S, cam) => { const { env, A, B, g, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = 0.5 + ramp(t, 0, 0.5) * 0.05, [x, , z] = PATH(u); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D;
      A.pose(addPose(idle(t, 0.5), hit([[0, { ...HOLD, rLeg: 20, lLeg: -15 }], [0.35, { ...HOLD, rLeg: -25, lLeg: 30, lean: 25, nod: 12 }], [0.7, { ...HOLD, rLeg: 10, lLeg: 0, lean: 12, nod: 8 }], [9, { ...HOLD, lean: 8 }]], t)));
      A.setFace(t > 0.35 ? 'shock' : 'worried'); const c = carry(t, 1); if (t > 0.3 && t < 0.7) g.rotation.z = Math.sin((t - 0.3) * 30) * 0.15;
      env.loose.rotation.x = -hn([[0, 0], [0.3, 0], [0.45, 0.5], [0.9, 0.05], [9, 0.05]], t); env.loose.position.y = 0.06 + Math.max(0, env.loose.rotation.x * -0.6);
      B.root.position.set(x - 1.4, 0, z + 0.4); B.root.rotation.y = PATH_RY * D; B.update(t, t < 0.5 ? 'run' : 'bark'); env.update(t, { cx: x, cz: z + 0.6, r: 3.4 });
      camPath(cam, t / dur, [x + 1.6, 2.6, z + 7.4], [x + 1.4, 2.8, z + 6.8], [x, 2.2, z], [x, 2.6, z], 26, 26); shake(cam, t, 0.38, 0.6); };
  },
  // 9 "The needle skips. The music stops!"  — tight on the record: the arm jumps off with a scratch, the gold notes vanish
  (S, cam) => { const { env, A, g, notes, carry } = board(S, cam, { dotOn: false, dog: false });
    return (t, dur) => { const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; A.pose(addPose(idle(t, 0.6), { ...HOLD, lean: 10, nod: 18 })); A.setFace('shock');
      const m = t < 0.25 ? 1 : 0; carry(t, m); g.update(t, { spin: t < 0.25 ? 1 : 0.2 }); const arm = g.children.find(o => o.position.x > 0.5 && o.position.z < -0.3);
      env.update(t, { cx: x, cz: z + 0.6, r: 3.4 - ramp(t, 0.25, dur) * 1.2, music: m });
      const b = g.position; camPath(cam, t / dur, [b.x + 1.6, b.y + 1.4, b.z + 1.2], [b.x + 1.2, b.y + 1.2, b.z + 0.9], [b.x, b.y + 0.4, b.z], [b.x, b.y + 0.45, b.z], 34, 40); shake(cam, t, 0.25, 0.4); };
  },
  // 10 "Fog curls around your boots."  — floor level: white tendrils slide in over the planks and wrap your boots; Biscuit backs up, growling
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; A.pose(addPose(idle(t, 0.6), { ...HOLD, lean: 8, nod: 22 })); carry(t, 0);
      B.root.position.set(x + 1.9, 0, z - 0.6); B.root.rotation.y = (PATH_RY + 160) * D; B.update(t, 'bark'); env.update(t, { cx: x, cz: z + 0.6, r: 1.4 - ramp(t, 0, dur) * 1.0, music: 0 });
      camPath(cam, t / dur, [x - 6.4, 2.4, z + 1.6], [x - 5.6, 2.2, z + 1.4], [x, 0.8, z], [x, 1.0, z], 26, 30); };
  },
  // 11 "You grab the arm and drop it back."  — close: your fingers find the tone arm and set it down; the record catches
  (S, cam) => { const { env, A, g, carry } = board(S, cam, { dotOn: false, dog: false });
    return (t, dur) => { const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D;
      A.pose(addPose(idle(t, 0.5), hit([[0, { ...HOLD, nod: 22 }], [0.5, { rFwd: 55, rUp: -30, lFwd: 30, lUp: -18, nod: 26, lean: 8 }], [9, { rFwd: 55, rUp: -30, lFwd: 30, lUp: -18, nod: 24, lean: 8 }]], t))); A.setFace('determined');
      const m = ramp(t, 0.8, dur); carry(t, m); g.update(t, { spin: 0.3 + m });
      env.update(t, { cx: x, cz: z + 0.6, r: 1.2 + m * 1.5, music: m }); const b = g.position; camPath(cam, t / dur, [b.x + 1.8, b.y + 1.8, b.z + 1.0], [b.x + 1.4, b.y + 1.5, b.z + 0.8], [b.x, b.y + 0.3, b.z], [b.x, b.y + 0.4, b.z], 30, 36); };
  },
  // 12 "The song comes back... and so does the air."  — wide: the white pulls back like a tide, the bubble blooms open, you breathe out
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; carry(t, 1);
      A.pose(addPose(idle(t, 1.0), addPose(HOLD, hit([[0, { nod: 14, bob: -0.05 }], [0.8, { nod: -6, bob: 0.06 }], [9, { nod: -4 }]], t)))); A.setFace(t > 0.6 ? 'relieved' : 'worried');
      B.root.position.set(x - 1.6, 0, z + 0.6); B.root.rotation.y = PATH_RY * D; B.update(t, 'sit');
      camPath(cam, t / dur, [x - 4, 4.6, z + 4], [x - 6.5, 7.5, z + 4.5], [x, 3, z], [x, 2.6, z], 26, 24); env.update(t, { cx: x, cz: z + 0.6, r: 2 + sm(t, 0, dur) * 3.6 }); };
  },
  // 13 "You pull open the truck door."  — you set a boot on the step and haul the pink cab door open; cold dark inside
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const [x, , z] = PATH(1.0); A.root.position.set(x - 0.6, 0, z - 0.2); A.root.rotation.y = 20 * D; carry(t, 0.8); env.cabDoor.open(sm(t, 0.3, 1.1));
      A.pose(addPose(idle(t, 0.6), hit([[0, { ...HOLD }], [0.3, { rFwd: 90, rUp: -15, lFwd: 30, lUp: -18, lean: -8 }], [1.1, { rFwd: 50, rUp: 20, lFwd: 30, lUp: -18, lean: -12 }], [9, { rFwd: 40, rUp: 15, lFwd: 30, lUp: -18 }]], t)));
      A.setFace('determined'); B.root.position.set(x - 2.6, 0, z - 0.6); B.update(t, 'sit'); env.update(t, { cx: x, cz: z, r: 4.2 });
      camPath(cam, t / dur, [x - 6.0, 4.6, z + 0.6], [x - 5.6, 4.6, z + 1.0], [x + 0.6, 4.0, z + 0.8], [x + 0.8, 4.2, z + 1.2], 24, 26); };
  },
  // 14 "Abe sits there, grey, staring at the wheel."  — inside the cab: Abe drained of colour, hands slack on the wheel, eyes on nothing
  (S, cam) => { const { env, Ab, sing } = cab(S, { youOn: false, abeFog: 1, gramOn: false });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); frozen(Ab, t, { ...SIT, rFwd: 40, lFwd: 40, rUp: -6, lUp: -6, nod: 6 }, 2);
      const h = headOf(Ab); camPath(cam, t / dur, [h.x + 2.6, h.y + 0.4, h.z + 5.4], [h.x + 1.6, h.y + 0.2, h.z + 4.4], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.3, h.z], 30, 36); };
  },
  // 15 "You set the music beside him. You wait."  — you slide into the passenger seat and set the record player on the dash; the notes drift over to Abe
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFog: 1 });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); frozen(Ab, t, { ...SIT, rFwd: 40, lFwd: 40, rUp: -6, lUp: -6, nod: 6 }, 2);
      const k = sm(t, 0, 0.9); g.position.set(0.2 + (1 - k) * 2.0, 3.36 + (1 - k) * 0.6, 3.1 - (1 - k) * 2.0); sing(t, 0.9, 1);
      A.pose(addPose(SIT, addPose(idle(t, 0.6), hit([[0, { rFwd: 60, lFwd: 60, rUp: -15, lUp: -15, lean: 10 }], [0.9, { rFwd: 50, lFwd: 50, rUp: -20, lUp: -20, lean: 12 }], [1.4, { rFwd: 30, lFwd: 30, lean: 0, turn: -40 }], [9, { rFwd: 30, lFwd: 30, turn: -45 }]], t)))); A.setFace('worried');
      winCam(cam, t / dur, 0, [20, 22], [10.0, 9.2]); };
  },
  // 16 "His fingers move first. Then he blinks."  — close on Abe's hand twitching on the wheel → his face: colour seeping back, a slow blink
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFog: 1 });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1); const [k, u] = seg(t, dur, [0.45]); const c = ramp(t, 0.2, dur * 0.95); fogTouch(Ab, 1 - c);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.3 + c * 0.5), { rFwd: 40 + Math.max(0, Math.sin(t * 9)) * 8 * (k === 0 ? 1 : 0), lFwd: 40, rUp: -6, lUp: -6, nod: 6 - c * 6 })));
      Ab.setFace(k === 0 ? 'sleepy' : (u < 0.35 ? 'sleepy' : u < 0.5 ? 'sleeping' : 'confused')); A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -45 })));
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y - 0.9, h.z], 20, { dist: 7.4, lens: 30, side: 0.6, push: 0.8 }); };
  },
  // 17 "'Kid? You came back for me?'"  — Abe turns his head to you, eyes wet, voice cracking (talk)
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'teary' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.7), talk(t, 0.9)), hit([[0, { rFwd: 40, lFwd: 40, turn: 0 }], [0.5, { rFwd: 30, lFwd: 40, turn: 38, tilt: 5 }], [9, { rFwd: 30, lFwd: 40, turn: 40, tilt: 6 }]], t))));
      A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -45 }))); A.setFace('teary');
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y, h.z], 30, { dist: 6.8, lens: 34, side: 0.4, push: 0.6 }); };
  },
  // 18 "Nobody has come back for Abe in thirty years."  — over Abe's shoulder onto you; then his face crumples into a small, wet smile
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'teary' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.7), { rFwd: 30, lFwd: 40, turn: 40, tilt: 6, nod: t > dur * 0.5 ? 4 : 0 }))); Ab.setFace(t > dur * 0.5 ? 'softsmile' : 'teary');
      A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -45 }))); A.setFace('softsmile');
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y - 0.2, h.z], 20, { dist: 6.0, lens: 38, side: -0.2, push: 0.9 }); };
  },
  // 19 "He grabs your arm. 'Listen. No time.'"  — snap: Abe's hand shoots out and grips your arm; his face hardens
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'determined' }); allow(S, ['abe', 'you']);
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.5), talk(t, t > 0.5 ? 1.2 : 0)), addPose(anticipate(t, 0.3), hit([[0, { rFwd: 30, lFwd: 40, turn: 40 }], [0.3, { rFwd: 30, lFwd: 40, lUp: -5, turn: 40 }], [0.5, { rFwd: 30, lFwd: 70, lUp: -48, turn: 45, lean: 8 }], [9, { rFwd: 30, lFwd: 66, lUp: -46, turn: 45, lean: 8 }]], t)))));
      A.pose(addPose(SIT, addPose(idle(t, 0.6), hit([[0, { rFwd: 30, lFwd: 30, turn: -45 }], [0.5, { rFwd: 30, lFwd: 30, turn: -50, lean: -6 }], [9, { rFwd: 30, lFwd: 30, turn: -48, lean: -4 }]], t)))); A.setFace(t > 0.5 ? 'shock' : 'softsmile');
      shake(cam, t, 0.5, 0.3); winCam(cam, t / dur, 0, [20, 22], [9.6, 8.6]); };
  },
  // 20 "'This fog doesn't come from the sea.'"  — Abe, close, low and certain; the fog streams past the glass behind him
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'determined' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.5), talk(t, 1.1)), { rFwd: 30, lFwd: 40, turn: 35 }))); A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -45 })));
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y, h.z], 25, { dist: 6.4, lens: 36, side: 0.6, push: 0.6 }); };
  },
  // 21 "'It comes from Kessler Hill. From my tower.'"  — Abe looks up through the windshield; far over the fog the tower's red light blinks
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'worried' });
    const red = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff2a2a, fog: false, toneMapped: false })); red.position.set(-6, 10.5, 70); S.add(red);
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1); red.visible = Math.sin(t * 3) > -0.4;
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.5), talk(t, 1.0)), hit([[0, { rFwd: 30, lFwd: 40, turn: 35 }], [0.6, { rFwd: 60, rUp: -20, lFwd: 40, turn: 0, nod: -12 }], [9, { rFwd: 60, rUp: -20, lFwd: 40, turn: 0, nod: -12 }]], t))));
      A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: t > 0.8 ? 0 : -45, nod: t > 0.8 ? -10 : 0 }))); A.setFace(t > 0.8 ? 'scared' : 'worried');
      camPath(cam, t / dur, [0.4, 5.6, -6.8], [0.4, 5.9, -5.8], [-0.6, 6.0, 20], [-1.6, 7.4, 40], 24, 28); };
  },
];
