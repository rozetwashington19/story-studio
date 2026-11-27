import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  fogBoardwalk, truckCab, gramophone, musicNotes, fogTouch, fogPhone } from '../../engine/kit.js';
import { you, abe, dot, biscuit, ramp, sm, V, headOf, faceCam, fill, allow, hn, RUN, shake, far, ps, eyes, dogLook, carryWalk } from './common.js';

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
  // 2 "Most of you said: save Abe."  — in Dot's doorway: you scan the white left to right, swallow, set your jaw; Biscuit looks up at you, then out at the fog; Dot behind you, hand to her chest. Eased push-in.
  (S, cam) => { const { env, A, B, Dt, carry } = board(S, cam, { youAt: [0, 0, -3.2], youRy: 0 });
    return (t, dur) => { env.update(t, { cx: 0, cz: -3.2, r: 4.5 }); carry(t, 0.8); const set = dur * 0.6;
      A.pose(ps(idle(t, 0.9), HOLD, hit([[0, { turn: -22, nod: -2 }], [dur * 0.3, { turn: 20, nod: -4 }], [set - 0.15, { turn: 4, nod: 8, bob: -0.04 }], [set + 0.15, { turn: 0, nod: -6, bob: 0.03 }]], t), { bodyTilt: Math.sin(t * 1.3) * 1.5 })); A.setFace(t < dur * 0.3 ? 'worried' : t < set ? 'scared' : 'determined');
      B.root.position.set(-1.8, 0, -2.4); B.root.rotation.y = 20 * D; B.update(t, 'sit'); const h = headOf(A); dogLook(B, t < dur * 0.45 ? [h.x, h.y, h.z] : [-1, 2, 8], sm(t, 0, 0.4));
      Dt.pose(ps(idle(t, 0.8, 2), hit([[0, { rFwd: 30, lFwd: 10 }], [dur * 0.4, { rFwd: 16, rUp: 12, lFwd: 8, lUp: 12, tilt: 6 }]], t), { turn: eyes(Dt, [h.x, h.y, h.z], 0.5).turn })); Dt.setFace(t > dur * 0.5 ? 'sad' : 'worried');
      camPath(cam, sm(t, 0, dur), [h.x + 0.9, h.y + 0.1, 6.6], [h.x + 0.3, h.y + 0.3, 3.9], [h.x, h.y - 0.6, h.z], [h.x, h.y - 0.4, h.z], 30, 35); };
  },
  // 3 "Five fifty-three. You lift the record player."  — low: you squat, heave the record player off the crate (anticipation, lift, a half-step back to catch the weight, head settling last); Biscuit hops up; Dot reaches as if to help
  (S, cam) => { const { env, A, B, Dt, g, carry } = board(S, cam, { youAt: [0, 0, -3.4], youRy: 0 });
    return (t, dur) => { env.update(t, { cx: 0, cz: -3.4, r: 4.2 }); const k = ramp(t, 0.4, 1.0);
      A.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 70, lFwd: 70, rUp: -18, lUp: -18, lean: 22, bob: -0.25, nod: 16 }], [0.4, { rFwd: 75, lFwd: 75, rUp: -18, lUp: -18, lean: 28, bob: -0.38, nod: 20 }], [1.0, { ...HOLD, lean: -3, rLeg: -6, nod: 10 }], [1.25, { ...HOLD, lean: -1, nod: -4 }], [1.6, { ...HOLD, lean: 0, nod: 2 }]], t), t > 1 ? { bob: Math.sin(t * 5) * 0.015 } : {}));
      A.setFace(t < 0.4 ? 'worried' : t < 1.2 ? 'determined' : 'nervous');
      const c = carry(t, k); if (t < 0.4) g.position.y = 1.4; else g.position.y = 1.4 + (c.y - 1.4) * Math.min(1, k * 1.15) + (t > 1 ? Math.sin((t - 1) * 14) * 0.04 * Math.exp(-(t - 1) * 5) : 0);
      B.root.position.set(-1.8, Math.abs(Math.sin(Math.max(0, t - 0.9) * 9)) * 0.25 * Math.exp(-Math.max(0, t - 0.9) * 3) * (t > 0.9 ? 1 : 0), -2.4); B.root.rotation.y = 20 * D; B.update(t, t > 0.9 ? 'bark' : 'sit'); dogLook(B, [c.x, c.y, c.z]);
      Dt.pose(ps(idle(t, 0.8, 2), hit([[0, { rFwd: 30, lFwd: 10 }], [0.7, { rFwd: 36, lFwd: 20, tilt: 6 }], [1.5, { rFwd: 30, lFwd: 12, tilt: 0 }]], t)));
      camPath(cam, sm(t, 0, dur), [2.9, 1.5, 3.7], [2.3, 2.3, 2.9], [0, 2.0, -3.2], [0, 3.6, -3.4], 24, 27); };
  },
  // 4 "Dot holds the door. 'Go. Quickly.'"  — Dot holds the door wide, checks the fog over her shoulder, then flicks her hand at you: go; you breathe in, nod once and turn for the gap; Biscuit is up and facing out before you are
  (S, cam) => { const { env, A, B, Dt, carry } = board(S, cam, { youAt: [2.8, 0, -2.0], youRy: -40, dotFace: 'determined' });
    return (t, dur) => { env.update(t, { cx: 1.0, cz: -3.4, r: 5 }); env.door.open(1); carry(t, 0.8); const hA = headOf(A); const go = dur * 0.55;
      Dt.pose(ps(idle(t, 0.8, 2), talk(t, 1.2), anticipate(t, go), hit([[0, { lUp: 70, lFwd: 20, rFwd: 20, turn: -34 }], [dur * 0.25, { lUp: 70, lFwd: 20, rFwd: 40, rUp: -20, turn: lookAt(Dt, hA).turn * 0.6 }], [go, { lUp: 72, lFwd: 20, rFwd: 96, rUp: 30, turn: lookAt(Dt, hA).turn * 0.6, lean: 8 }], [go + 0.3, { lUp: 70, lFwd: 20, rFwd: 70, rUp: 46, turn: lookAt(Dt, hA).turn * 0.6, lean: 4 }]], t))); Dt.setFace(t < dur * 0.25 ? 'scared' : t < go ? 'determined' : 'worried');
      A.pose(ps(idle(t, 0.7), HOLD, hit([[0, { turn: -22 }], [go, { turn: -22, nod: -4, bob: 0.03 }], [go + 0.25, { turn: -20, nod: 14 }], [go + 0.5, { turn: -10, nod: 0 }], [go + 0.9, { turn: 34, nod: -2, lean: 6 }]], t))); A.setFace(t > go + 0.3 ? 'determined' : 'worried');
      B.root.position.set(-1.8, 0, -2.0); B.root.rotation.y = hn([[0.2, 0], [0.8, 0.9]], t); B.update(t, t > 0.3 ? 'bark' : 'sit'); dogLook(B, t < 0.3 ? [0, 4, -5] : [2, 2, 8]);
      const h = headOf(Dt); faceCam(cam, sm(t, 0, dur), [h.x, h.y, h.z], 0, { dist: 7.8, lens: 28, side: -1.6, push: 1.0 }); };
  },
  // 5 "The song makes a bubble, just big enough for you."  — high and wide: a small round pocket of clear air around you in a sea of white, gold notes rising out of it; you edge forward step by careful step, head turning to the walls of fog; Biscuit glued to your heel
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = ramp(t, 0, dur) * 0.18, [x, , z] = PATH(u); const v = 0.18 * 11 / dur; A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D;
      A.pose(ps(carryWalk(t, v), HOLD, { nod: 4, turn: Math.sin(t * 2.1) * 26 })); A.setFace('scared'); carry(t, 1);
      B.root.position.set(x - 1.6, 0, z + 0.6); B.root.rotation.y = PATH_RY * D; B.update(t * 0.45, 'run'); dogLook(B, [x - 6, 2, z + 3], 0.6 + Math.sin(t * 2) * 0.4); env.update(t, { cx: x, cz: z + 0.6, r: 4.0 + Math.sin(t * 2.4) * 0.15 });
      camPath(cam, sm(t, 0, dur), [x - 2.6, 18, z + 12.5], [x - 0.8, 14.5, z + 9.6], [x, 1, z], [x, 1, z], 24, 27); };
  },
  // 6 "Biscuit presses against your legs."  — low close: Biscuit squeezes in against your boots, ears back, eyes flicking from the fog wall up to you; your head tips down to him for a second
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = 0.2 + ramp(t, 0, dur) * 0.12, [x, , z] = PATH(u); const v = 0.12 * 11 / dur; A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D;
      A.pose(ps(carryWalk(t, v), HOLD, hit([[0, { nod: 4, turn: 20 }], [dur * 0.5, { nod: 22, turn: -26 }], [dur * 0.85, { nod: 6, turn: 0 }]], t))); A.setFace(t > dur * 0.4 && t < dur * 0.8 ? 'softsmile' : 'worried'); carry(t, 1);
      const press = sm(t, 0, dur * 0.4); B.root.position.set(x - 1.5 + press * 0.55, 0, z + 0.8); B.root.rotation.y = (PATH_RY - 10) * D; B.update(t * 0.4, 'run'); const h = headOf(A); dogLook(B, t < dur * 0.45 ? [x - 6, 3, z + 2] : [h.x, h.y, h.z]); env.update(t, { cx: x, cz: z + 0.6, r: 3.8 });
      camPath(cam, sm(t, 0, dur), [x + 1.3, 2.0, z + 8.6], [x + 0.4, 2.5, z + 7.2], [x - 0.7, 1.8, z + 1], [x - 0.7, 2.5, z + 0.6], 24, 27); };
  },
  // 7 "Ten steps to the truck. The fog leans in."  — tracking from the side: the truck's pink shape in the white ahead, the bubble edges curling inward; you hurry, shoulders hunched over the record player, eyes on the truck
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = 0.34 + ramp(t, 0, dur) * 0.16, [x, , z] = PATH(u); const v = 0.16 * 11 / dur; A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D;
      A.pose(ps(carryWalk(t, v, 17), HOLD, { lean: 6, nod: 2 }, hit([[0, { turn: 0 }], [dur * 0.45, { turn: -34, nod: -4 }], [dur * 0.7, { turn: 0, nod: 6 }]], t))); carry(t, 1); A.setFace(t > dur * 0.45 ? 'scared' : 'worried');
      B.root.position.set(x - 1.4, 0, z + 0.4); B.root.rotation.y = PATH_RY * D; B.update(t * 0.6, 'run'); dogLook(B, [x + 3, 2, z + 6], 0.7); env.update(t, { cx: x, cz: z + 0.6, r: 3.8 - sm(t, 0, dur) * 0.8 });
      camPath(cam, sm(t, 0, dur), [x - 5.6, 4.3, z + 0.8], [x - 5.0, 4.5, z + 1.8], [x + 1, 3.2, z + 2], [x + 1, 3.2, z + 2.5], 24, 27); };
  },
  // 8 "Your foot catches a board."  — your boot catches the loose board: it kicks up, you pitch forward, hug the record player to your chest, stagger two short steps and freeze, staring at it; Biscuit skitters back barking
  (S, cam) => { const { env, A, B, g, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const u = 0.5 + ramp(t, 0, 0.5) * 0.05, [x, , z] = PATH(u); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D;
      A.pose(ps(idle(t, 0.5), anticipate(t, 0.3), hit([[0, { ...HOLD, rLeg: 20, lLeg: -15 }], [0.35, { ...HOLD, rLeg: -25, lLeg: 34, lean: 30, nod: 14, rFwd: 44, lFwd: 44 }], [0.6, { ...HOLD, rLeg: 24, lLeg: -8, lean: 18, nod: 20, rFwd: 46, lFwd: 46, rUp: -26, lUp: -26 }], [0.85, { ...HOLD, rLeg: 4, lLeg: 6, lean: 10, nod: 24, rUp: -26, lUp: -26 }], [1.3, { ...HOLD, lean: 6, nod: 26, rUp: -26, lUp: -26 }]], t), t > 0.9 ? { bob: Math.sin(t * 9) * 0.02 } : {}));
      A.setFace(t < 0.3 ? 'worried' : t < 1.2 ? 'shock' : 'scared'); const c = carry(t, 1); if (t > 0.3 && t < 0.9) g.rotation.z = Math.sin((t - 0.3) * 30) * 0.18 * (1 - (t - 0.3) / 0.6);
      env.loose.rotation.x = -hn([[0, 0], [0.3, 0], [0.45, 0.55], [0.9, 0.05], [9, 0.05]], t); env.loose.position.y = 0.06 + Math.max(0, env.loose.rotation.x * -0.6);
      const back = sm(t, 0.4, 0.9); B.root.position.set(x - 1.4 - back * 0.9, Math.abs(Math.sin(Math.max(0, t - 0.4) * 10)) * 0.3 * Math.exp(-Math.max(0, t - 0.4) * 2.5) * (t > 0.4 ? 1 : 0), z + 0.4 - back * 0.5); B.root.rotation.y = (PATH_RY + back * 60) * D; B.update(t, t < 0.4 ? 'run' : 'bark'); dogLook(B, [c.x, c.y, c.z]); env.update(t, { cx: x, cz: z + 0.6, r: 3.4 });
      camPath(cam, sm(t, 0, dur), [x + 1.7, 2.5, z + 6.2], [x + 1.2, 3.0, z + 5.4], [x, 2.2, z], [x, 2.8, z], 24, 26); shake(cam, t, 0.38, 0.7); };
  },
  // 9 "The needle skips. The music stops!"  — (a) tight on the record: the arm jumps with a scratch, the platter drags to a crawl, the gold notes wink out; (b) low on your face: the silence lands — eyes up and around as the white starts to close
  (S, cam) => { const { env, A, g, notes, carry } = board(S, cam, { dotOn: false, dog: false });
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.48]); const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; const cutT = dur * 0.48;
      A.pose(ps(idle(t, 0.6), { ...HOLD, lean: 10 }, hit([[0, { nod: 18 }], [cutT, { nod: 20 }], [cutT + 0.35, { nod: -8, turn: -30 }], [cutT + 0.9, { nod: -12, turn: 34 }], [dur, { nod: 4, turn: 6 }]], t), { bob: Math.sin(t * 11) * 0.015 })); A.setFace(t < cutT + 0.3 ? 'shock' : 'scared');
      const m = t < 0.25 ? 1 : 0; carry(t, m); g.update(t, { spin: t < 0.25 ? 1 : Math.max(0.05, 0.5 - (t - 0.25) * 0.5) }); if (t > 0.22 && t < 0.6) g.rotation.z = Math.sin((t - 0.22) * 46) * 0.06 * (1 - (t - 0.22) / 0.38);
      env.update(t, { cx: x, cz: z + 0.6, r: 3.4 - ramp(t, 0.25, dur) * 1.5, music: m }); const b = g.position;
      if (k === 0) { camPath(cam, lt, [b.x + 1.7, b.y + 1.5, b.z + 1.3], [b.x + 1.1, b.y + 1.15, b.z + 0.85], [b.x, b.y + 0.4, b.z], [b.x, b.y + 0.45, b.z], 34, 42); shake(cam, t, 0.25, 0.5); return; }
      const h = headOf(A); camPath(cam, lt, [h.x + 2.6, h.y - 1.6, h.z + 5.4], [h.x + 2.2, h.y - 1.3, h.z + 4.6], [h.x, h.y - 0.2, h.z], [h.x, h.y - 0.1, h.z], 34, 38); };
  },
  // 10 "Fog curls around your boots."  — floor level: white tendrils slide in over the planks and wrap your boots; you shuffle back half a step, lifting one foot clear; Biscuit backs up in little hops, barking at it
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D;
      A.pose(ps(idle(t, 0.6), { ...HOLD, lean: 8, nod: 22 }, hit([[0, {}], [dur * 0.35, { rLeg: 26, bob: 0.06, lean: -6 }], [dur * 0.6, { rLeg: 4, lLeg: 18, bob: 0.03 }], [dur * 0.9, { lLeg: 2 }]], t))); A.setFace('scared'); carry(t, 0);
      const hop = Math.abs(Math.sin(t * 9)); B.root.position.set(x + 1.9 + t * 0.35, hop * 0.18, z - 0.6 - t * 0.15); B.root.rotation.y = (PATH_RY + 160) * D; B.update(t, 'bark'); dogLook(B, [x, 0.3, z + 1]); env.update(t, { cx: x, cz: z + 0.6, r: 1.4 - sm(t, 0, dur) * 1.0, music: 0 });
      camPath(cam, sm(t, 0, dur), [x - 6.6, 2.5, z + 1.7], [x - 5.2, 1.9, z + 1.3], [x, 0.8, z], [x, 1.0, z], 26, 31); };
  },
  // 11 "You grab the arm and drop it back."  — close: your hand hovers, shaking, finds the tone arm and sets it down; a beat… the record catches, and your shoulders come down
  (S, cam) => { const { env, A, g, carry } = board(S, cam, { dotOn: false, dog: false });
    return (t, dur) => { const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; const set = 0.8;
      A.pose(ps(idle(t, 0.5), anticipate(t, 0.5), hit([[0, { ...HOLD, nod: 22 }], [0.5, { rFwd: 58, rUp: -12, lFwd: 30, lUp: -18, nod: 26, lean: 8 }], [set, { rFwd: 55, rUp: -32, lFwd: 30, lUp: -18, nod: 27, lean: 9 }], [set + 0.7, { rFwd: 55, rUp: -30, lFwd: 30, lUp: -18, nod: 24, lean: 8 }], [dur, { ...HOLD, nod: 10, lean: 2, bob: 0.03 }]], t), t < set ? { rFwd: Math.sin(t * 38) * 2.5, rUp: Math.cos(t * 31) * 2 } : {})); A.setFace(t < set + 0.5 ? 'determined' : 'relieved');
      const m = ramp(t, set, dur); carry(t, m); g.update(t, { spin: 0.3 + m });
      env.update(t, { cx: x, cz: z + 0.6, r: 1.2 + m * 1.5, music: m }); const b = g.position; camPath(cam, sm(t, 0, dur), [b.x + 1.9, b.y + 1.9, b.z + 1.1], [b.x + 1.3, b.y + 1.4, b.z + 0.75], [b.x, b.y + 0.3, b.z], [b.x, b.y + 0.4, b.z], 30, 38); };
  },
  // 12 "The song comes back... and so does the air."  — the white pulls back like a tide, the bubble blooms open; you breathe out, shoulders dropping, look up into the clear, then down at Biscuit — who shakes himself and sits — and nod toward the truck. Camera cranes back and up with the bubble.
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const [x, , z] = PATH(0.55); A.root.position.set(x, 0, z); A.root.rotation.y = PATH_RY * D; carry(t, 1);
      A.pose(ps(idle(t, 1.0), HOLD, hit([[0, { nod: 16, bob: -0.06, lean: 8 }], [0.8, { nod: -14, bob: 0.07, lean: -4 }], [dur * 0.55, { nod: -8, bob: 0, lean: 0 }], [dur * 0.75, { nod: 18, turn: -34 }], [dur * 0.95, { nod: 2, turn: 20 }]], t))); A.setFace(t < 0.6 ? 'worried' : t < dur * 0.7 ? 'relieved' : 'determined');
      const sh = t > dur * 0.4 && t < dur * 0.62 ? Math.sin(t * 40) * 0.25 : 0; B.root.position.set(x - 1.6, 0, z + 0.6); B.root.rotation.y = PATH_RY * D + sh; B.update(t, t > dur * 0.62 ? 'sit' : 'bark'); const h = headOf(A); dogLook(B, [h.x, h.y, h.z], sm(t, dur * 0.6, dur * 0.8));
      camPath(cam, sm(t, 0, dur), [x - 4, 4.4, z + 3.8], [x - 6.8, 7.8, z + 4.6], [x, 3, z], [x, 2.6, z], 26, 23); env.update(t, { cx: x, cz: z + 0.6, r: 2 + sm(t, 0, dur) * 3.6 }); };
  },
  // 13 "You pull open the truck door."  — you hitch the record player onto your hip, grab the pink cab door and haul: it sticks, then swings wide and you rock back with it; Biscuit cranes to look inside
  (S, cam) => { const { env, A, B, carry } = board(S, cam, { dotOn: false });
    return (t, dur) => { const [x, , z] = PATH(1.0); A.root.position.set(x - 0.6, 0, z - 0.2); A.root.rotation.y = 20 * D; carry(t, 0.8); env.cabDoor.open(hn([[0.3, 0], [0.42, 0.08], [0.55, 0.06], [1.05, 1]], t));
      A.pose(ps(idle(t, 0.6), anticipate(t, 0.3, 1.4), hit([[0, { ...HOLD }], [0.3, { rFwd: 84, rUp: -15, lFwd: 30, lUp: -18, lean: -6 }], [0.55, { rFwd: 80, rUp: -12, lFwd: 30, lUp: -18, lean: -9 }], [1.05, { rFwd: 50, rUp: 22, lFwd: 30, lUp: -18, lean: -16, nod: -4 }], [1.35, { rFwd: 40, rUp: 15, lFwd: 30, lUp: -18, lean: -4, nod: 8 }]], t)));
      A.setFace(t > 1.1 ? 'worried' : 'determined'); B.root.position.set(x - 2.6, 0, z - 0.6); B.update(t, 'sit'); dogLook(B, [x + 1.5, 4, z + 1.5], sm(t, 0.8, 1.2)); env.update(t, { cx: x, cz: z, r: 4.2 });
      camPath(cam, sm(t, 0, dur), [x - 6.2, 4.6, z + 0.4], [x - 5.4, 4.6, z + 1.2], [x + 0.6, 4.0, z + 0.8], [x + 0.9, 4.2, z + 1.2], 24, 27); shake(cam, t, 1.05, 0.25); };
  },
  // 14 "Abe sits there, grey, staring at the wheel."  — inside the cab: start on his slack grey hands on the wheel, drift up to his face — drained, eyes on nothing; only the smallest sway of breath
  (S, cam) => { const { env, Ab, sing } = cab(S, { youOn: false, abeFog: 1, gramOn: false });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); frozen(Ab, t, { ...SIT, rFwd: 40, lFwd: 40, rUp: -6, lUp: -6, nod: 6 }, 2);
      const h = headOf(Ab); const e = sm(t, 0, dur); camPath(cam, e, [h.x + 2.8, h.y + 0.5, h.z + 5.6], [h.x + 1.4, h.y + 0.2, h.z + 4.3], [h.x, h.y - 0.5, h.z], [h.x, h.y - 0.3, h.z], 30, 37); };
  },
  // 15 "You set the music beside him. You wait."  — you slide in and set the record player on the dash, nudge it toward him; lean in to search his face, pass a hand in front of his eyes — nothing; you sit back, knee bouncing, eyes going from the record to him
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFog: 1 });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); frozen(Ab, t, { ...SIT, rFwd: 40, lFwd: 40, rUp: -6, lUp: -6, nod: 6 }, 2);
      const k = sm(t, 0, 0.9); g.position.set(0.2 + (1 - k) * 2.0, 3.36 + (1 - k) * 0.6, 3.1 - (1 - k) * 2.0); sing(t, 0.9, 1); const w = dur * 0.5;
      A.pose(ps(SIT, idle(t, 0.6), hit([[0, { rFwd: 60, lFwd: 60, rUp: -15, lUp: -15, lean: 10 }], [0.9, { rFwd: 50, lFwd: 50, rUp: -20, lUp: -20, lean: 12 }], [w, { rFwd: 30, lFwd: 30, lean: 16, turn: -46, nod: -2 }], [w + 0.35, { rFwd: 30, lFwd: 70, lUp: -40, lean: 16, turn: -50 }], [w + 0.8, { rFwd: 30, lFwd: 30, lean: -2, turn: -40, nod: 6 }], [dur, { rFwd: 34, lFwd: 34, lean: -2, turn: -44 }]], t), t > w + 0.3 && t < w + 0.7 ? { lUp: Math.sin(t * 16) * 8 } : {}, t > w + 0.8 ? { bob: Math.abs(Math.sin(t * 10)) * 0.025 } : {})); A.setFace(t < w ? 'worried' : t < w + 0.8 ? 'nervous' : 'sad');
      winCam(cam, sm(t, 0, dur), 0, [20, 23], [10.2, 9.0]); };
  },
  // 16 "His fingers move first. Then he blinks."  — (a) close on Abe's hand on the wheel: one finger taps, then the hand closes; (b) his face: colour seeping back, a long slow blink, a frown — where am I; beside him you lean in, holding your breath
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFog: 1 });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1); const [k, u] = seg(t, dur, [0.42]); const c = ramp(t, 0.2, dur * 0.95); fogTouch(Ab, 1 - c);
      const tap = k === 0 ? Math.max(0, Math.sin(t * 8)) ** 2 * 9 : 0;
      Ab.pose(ps(SIT, idle(t, 0.3 + c * 0.5), { rFwd: 40 + tap, lFwd: 40, rUp: -6 - tap * 0.4, lUp: -6 }, hit([[dur * 0.42, { nod: 6 }], [dur * 0.7, { nod: 10 }], [dur * 0.92, { nod: -2, tilt: 5, turn: 10 }]], t)));
      Ab.setFace(k === 0 ? 'sleepy' : (u < 0.3 ? 'sleepy' : u < 0.5 ? 'sleeping' : u < 0.75 ? 'sleepy' : 'confused'));
      const hA = headOf(Ab); A.pose(ps(SIT, idle(t, 0.4), { rFwd: 30, lFwd: 30 }, hit([[0, { turn: -44, lean: 0 }], [dur * 0.5, { turn: -50, lean: 14, nod: -2 }]], t))); A.setFace(t > dur * 0.6 ? 'awe' : 'worried');
      if (k === 0) { faceCam(cam, u, [hA.x, hA.y - 0.9, hA.z], 20, { dist: 7.4, lens: 36, side: 0.6, push: 0.6 }); return; }
      faceCam(cam, u, [hA.x, hA.y - 0.1, hA.z], 20, { dist: 6.6, lens: 36, side: 0.6, push: 0.9 }); };
  },
  // 17 "'Kid? You came back for me?'"  — Abe's head comes round to you, slow; he squints, then his eyes fill; one hand comes off the wheel and stops halfway. You nod, fast, three times
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'confused' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(ps(SIT, idle(t, 0.7), talk(t, 0.9), hit([[0, { rFwd: 40, lFwd: 40, turn: 4 }], [0.55, { rFwd: 30, lFwd: 40, turn: 40, tilt: 7, nod: -2 }], [dur * 0.6, { rFwd: 30, lFwd: 40, turn: 40, tilt: 5 }], [dur * 0.85, { rFwd: 30, lFwd: 64, lUp: -26, turn: 42, tilt: 6, lean: 5 }]], t))); Ab.setFace(t < 0.6 ? 'confused' : t < dur * 0.55 ? 'awe' : 'teary');
      A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -45 }, t > dur * 0.55 ? { nod: Math.max(0, Math.sin((t - dur * 0.55) * 13)) * 12 * Math.exp(-(t - dur * 0.55) * 1.5) } : {})); A.setFace(t > dur * 0.5 ? 'teary' : 'worried');
      const h = headOf(Ab); faceCam(cam, sm(t, 0, dur), [h.x, h.y, h.z], 30, { dist: 7.0, lens: 34, side: 0.4, push: 0.9 }); };
  },
  // 18 "Nobody has come back for Abe in thirty years."  — (a) on you, past Abe's shoulder: a small shrug, a wobbly smile — of course I did; (b) Abe: his face crumples into a small wet smile; he drags the back of his hand across his eyes
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'teary' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1); const [k, u] = seg(t, dur, [0.42]); const c = dur * 0.42;
      A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -45 }, hit([[0.2, {}], [0.6, { rUp: 14, tilt: 8, nod: 4, bob: 0.04 }], [1.1, { rUp: 2, tilt: 3, nod: 0 }]], t))); A.setFace(t < 0.5 ? 'teary' : 'softsmile');
      Ab.pose(ps(SIT, idle(t, 0.7), { rFwd: 30, lFwd: 40, turn: 40, tilt: 6 }, hit([[c, { nod: 0 }], [c + 0.5, { nod: 10, bob: -0.03 }], [c + 0.95, { nod: 6, rFwd: 124, rUp: -8 }], [c + 1.5, { nod: 2, rFwd: 118, rUp: 6, tilt: -4 }], [dur, { nod: 0, rFwd: 40 }]], t), t > c + 0.3 ? { bob: Math.sin(t * 7) * 0.012 } : {})); Ab.setFace(t < c + 1.0 ? 'teary' : 'softsmile');
      if (k === 0) { const h = headOf(A); faceCam(cam, u, [h.x, h.y - 0.1, h.z], -32, { dist: 6.6, lens: 36, side: -0.5, push: 0.6 }); return; }
      const h = headOf(Ab); faceCam(cam, u, [h.x, h.y - 0.2, h.z], 20, { dist: 6.2, lens: 38, side: -0.2, push: 1.0 }); };
  },
  // 19 "He grabs your arm. 'Listen. No time.'"  — snap: Abe's hand shoots out and grips your arm, he pulls himself toward you; you flinch back, look at the hand, then at him; his face has gone hard
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'softsmile' }); allow(S, ['abe', 'you']);
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(ps(SIT, idle(t, 0.5), talk(t, t > 0.5 ? 1.2 : 0), anticipate(t, 0.3, 1.4), hit([[0, { rFwd: 30, lFwd: 40, turn: 40 }], [0.3, { rFwd: 30, lFwd: 40, lUp: -5, turn: 40 }], [0.5, { rFwd: 30, lFwd: 72, lUp: -50, turn: 46, lean: 12 }], [0.8, { rFwd: 30, lFwd: 66, lUp: -46, turn: 45, lean: 8 }], [dur * 0.7, { rFwd: 36, lFwd: 66, lUp: -46, turn: 45, lean: 10, nod: 6 }]], t))); Ab.setFace(t < 0.35 ? 'softsmile' : t < 0.8 ? 'scared' : 'determined');
      A.pose(ps(SIT, idle(t, 0.6), hit([[0, { rFwd: 30, lFwd: 30, turn: -45 }], [0.55, { rFwd: 30, lFwd: 30, turn: -50, lean: -10, nod: -6 }], [0.95, { rFwd: 30, lFwd: 30, turn: -30, lean: -5, nod: 18 }], [1.5, { rFwd: 30, lFwd: 30, turn: -48, lean: -3, nod: 0 }]], t))); A.setFace(t < 0.5 ? 'softsmile' : t < 1.4 ? 'shock' : 'worried');
      shake(cam, t, 0.5, 0.35); winCam(cam, sm(t, 0, dur), 0, [20, 23], [9.8, 8.4]); };
  },
  // 20 "'This fog doesn't come from the sea.'"  — Abe, close, low and certain: a slow shake of the head on "doesn't", a finger tapping the wheel; the fog streams past the glass behind him
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'determined' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(ps(SIT, idle(t, 0.5), talk(t, 1.1), { rFwd: 30 + Math.max(0, Math.sin(t * 7)) * 6, lFwd: 40, turn: 35 + Math.sin(t * 5.5) * 9 * Math.exp(-Math.abs(t - dur * 0.45) * 3), nod: 4, lean: 6 })); Ab.setFace(t > dur * 0.6 ? 'worried' : 'determined');
      A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -45 }));
      const h = headOf(Ab); faceCam(cam, sm(t, 0, dur), [h.x, h.y, h.z], 25, { dist: 6.6, lens: 36, side: 0.6, push: 0.9 }); };
  },
  // 21 "'It comes from Kessler Hill. From my tower.'"  — from behind them: Abe lifts a finger to the windshield; far over the fog the tower's red light blinks. A beat later you lean forward over the dash to see it, and your face drops
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'worried' });
    const red = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff2a2a, fog: false, toneMapped: false })); red.position.set(-6, 10.5, 70); S.add(red);
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1); red.visible = Math.sin(t * 3) > -0.4; red.scale.setScalar(1 + Math.max(0, Math.sin(t * 3)) * 0.25);
      Ab.pose(ps(SIT, idle(t, 0.5), talk(t, 1.0), anticipate(t, 0.6), hit([[0, { rFwd: 30, lFwd: 40, turn: 35 }], [0.6, { rFwd: 66, rUp: -20, lFwd: 40, turn: 0, nod: -14 }], [0.85, { rFwd: 60, rUp: -20, lFwd: 40, turn: 0, nod: -12 }]], t)));
      A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30 }, hit([[0.6, { turn: -45, nod: 0, lean: 0 }], [1.05, { turn: 0, nod: -14, lean: 14, lFwd: 20 }], [1.3, { turn: 0, nod: -11, lean: 11, lFwd: 20 }]], t))); A.setFace(t > 1.0 ? 'scared' : 'worried');
      camPath(cam, sm(t, 0, dur), [0.6, 5.5, -7.0], [0.3, 6.0, -5.6], [-0.6, 6.0, 20], [-1.8, 7.6, 40], 24, 29); };
  },
];
