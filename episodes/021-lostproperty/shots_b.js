// Episode 021 (Lost Property) — lines 31–62: the cart ride, the Night Train, the cab, the letters, the tag.
import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, HUG,
  lostHall, grandStation, trainCab, letterCar, temperJar, hourglass, envelope, letterPaper, tagCard, framedPhoto, coffeeCup, pigeon, std } from '../../engine/kit.js';
import { mara, cal, pip, ramp, sm, lerp, V, headOf, faceCam, fill, allow, hold, hands, hn, shake, rumble, arc, clamp01 } from './common.js';
import { ps, M0, COUNTER, hall, cartRig } from './shots_a.js';

const PUSH = { rFwd: 68, lFwd: 68, lean: 12 };
const SITP = { rLeg: 90, lLeg: 90 };
const TX = 40;                    // Night Train nose (stationary): loco x 24..40, cab door x ≈ 25, mail car 5..23
const CABX = TX - 8 - 4.2, CABY = 3.0, CABZ = -7.5;   // Cal's spot in the cab (seen through the window)
// the letter car seen from the side (camera outside the open wall): Mara left, Cal right
const MC = [-12.4, 0, 0.2], CC = [-7.9, 0, 0.2];
function carSide(S) { const cab = trainCab(S); const car = letterCar(S, { front: false }); cab.door.open(1); const kf = fill(S, [-10.2, 5.6, 6.5], 14, 0xffe2c4, 16); allow(S, ['mara', 'cal']);
  return { update(t, dist = 0) { cab.update(t, { dist, sway: 0.4 }); car.update(t, { sway: 0.5 }); }, cab, car }; }
const mug = (S, col) => { const c = coffeeCup(S, col); return c; };

export const SHOTS_B = [
  // 31 "So I climbed on the cart."  — Mara takes two running steps and vaults onto the moving cart beside the envelope; the cart dips; Pip's jaw drops.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 56 }); const R = cartRig(S, 7.0, 2.2); const P = pip(S, 'neutral', [3.3, 0, 2.2], 90); const A = mara(S, 'determined', [3.4, 0, 6.6], 140); allow(S, ['mara', 'pip']);
    return (t, dur) => { env.update(t); const j0 = dur * 0.3, j1 = dur * 0.62; const u = ramp(t, j0, j1); const run = sm(t, 0, j0);
      const from = [lerp(3.4, 5.6, run), 0, lerp(6.6, 4.8, run)]; const to = [7.6, 1.15, 2.4]; const p = u <= 0 ? from : arc(from, to, 1.5, sm(t, j0, j1)); const land = Math.max(0, t - j1);
      A.root.position.set(p[0], p[1] - (u >= 1 ? Math.exp(-land * 9) * 0.2 : 0), p[2]); A.root.rotation.y = lerp(140, 20, sm(t, j0, j1)) * D;
      A.pose(ps(u <= 0 ? walk(t, 1.7, 40) : {}, anticipate(t, j0, 1.6), hit([[j0, { lean: 12 }], [j0 + 0.14, { rUp: 120, lUp: 120, rLeg: 50, lLeg: -30, lean: 8 }], [j1, { rUp: 40, lUp: 40, rLeg: 30, lLeg: 30, lean: 16, bob: -0.2 }], [j1 + 0.3, { rUp: 26, lUp: 26, rFwd: 20, lean: 2 }]], t)));
      A.setFace(u < 1 ? 'determined' : 'smirk'); R.c.position.y = u >= 1 ? -Math.exp(-land * 9) * 0.14 * Math.cos(land * 22) : 0; R.e.userData.update(t);
      P.pose(ps(idle(t, 1, 2), PUSH, hit([[j1 - 0.1, {}], [j1 + 0.2, { rFwd: -30, lFwd: -30, rUp: 60, lUp: 60, lean: -22, nod: -10 }]], t), { turn: -20 })); P.setFace(t > j1 - 0.05 ? 'shock' : 'neutral');
      camPath(cam, sm(t, 0, dur), [6.2, 3.6, 13.4], [6.4, 3.9, 11.6], [5.8, 3.2, 2.4], [6.4, 3.6, 2.4], 22, 24); shake(cam, t, j1, 0.3);
    };
  },
  // 32 "I rode it all the way to platform nine."  — tracking shot down the platform: Pip sprinting behind the cart, Mara riding it like a chariot, pointing ahead; the PLATFORM 9 sign and the clock (5:57) sweep overhead, the Night Train's lit windows behind.
  (S, cam) => {
    const st = grandStation(S, { clockX: -13, trainX: TX, h: 5, m: 57 }); const R = cartRig(S, 0, 2.6); const P = pip(S, 'determined', [0, 0, 2.6], 90); const A = mara(S, 'determined', [0, 0, 2.6], 70); allow(S, ['mara', 'pip']);
    return (t, dur) => { const x = -30 + t * 9.2; st.update(t, { steam: 0.7 }); st.follow(x, 2); R.c.position.set(x, Math.abs(Math.sin(t * 17)) * 0.03, 2.6); R.c.userData.roll(t * 9.2); R.e.userData.update(t);
      P.root.position.x = x - 3.75; P.pose(ps(walk(t, 1.9, 44), PUSH, { lean: 8 })); P.setFace(Math.sin(t * 4) > 0 ? 'determined' : 'worried');
      A.root.position.set(x + 1.3, 1.15 + Math.abs(Math.sin(t * 17)) * 0.03, 2.6);
      A.pose(ps(idle(t, 1), hit([[0, { lFwd: 40, rUp: 30, lean: 10 }], [0.5, { lFwd: 88, lUp: 6, rUp: 34, lean: 14, nod: -4, turn: 14 }]], t), { rLeg: 14, lLeg: -14, bob: Math.sin(t * 17) * 0.02, tilt: Math.sin(t * 8.5) * 3 })); A.setFace(t > dur * 0.55 ? 'grin' : 'determined');
      camPath(cam, sm(t, 0, dur), [x + 4.4, 4.4, 13.4], [x + 2.6, 4.6, 12.6], [x - 0.6, 4.3, 2.6], [x - 0.4, 4.5, 2.6], 20, 21); rumble(cam, t, 0.5);
    };
  },
  // 33 "I ran the whole train, shouting his name."  — (a) tracking from ahead: Mara sprinting along the cars, hands cupped to her mouth, shouting; (b) high and wide from behind: one small figure racing the length of the Night Train toward the steaming engine.
  (S, cam) => {
    const st = grandStation(S, { clockX: 8, trainX: TX, h: 5, m: 58 }); const A = mara(S, 'worried', [0, 0, -2.8], 90);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.52]); const x = -4 + t * 8.6; st.update(t, { steam: 1 }); st.follow(x, 0); A.root.position.x = x;
      const w = walk(t, 1.85, 44); A.pose(ps({ rLeg: w.rLeg, lLeg: w.lLeg, bob: w.bob }, talk(t, 1.6), { rFwd: 118, lFwd: 118, rUp: -26, lUp: -26, lean: 14, nod: -10, turn: -20 })); A.setFace(Math.sin(t * 5) > 0.3 ? 'worried' : 'determined');
      if (k === 0) { camPath(cam, lt, [x + 7.2, 4.4, 4.4], [x + 6.4, 4.5, 3.6], [x + 0.4, 4.4, -2.8], [x + 0.4, 4.4, -2.8], 26, 27); rumble(cam, t, 0.5); return; }
      camPath(cam, lt, [x - 12, 9.5, 8], [x - 9, 8.6, 7], [x + 12, 3.6, -5], [x + 13, 3.8, -5], 22, 22);
    };
  },
  // 34 "The doors shut. The whistle blew."  — (a) the LOST PROPERTY car: its big sliding door slams across the glowing doorway (Mara streaks past in the foreground); (b) low angle: the brass whistle on the cab roof screams a jet of steam.
  (S, cam) => {
    const st = grandStation(S, { clockX: 30, trainX: TX, h: 5, m: 59 }); const A = mara(S, 'worried', [0, 0, 0.2], 90); const DX = TX - 25.9 + 3.6;
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.5]); const door = 1 - hn([[0.08, 0], [0.4, 1]], t); st.update(t, { steam: 1, door, whistle: k ? 1 : 0 }); st.follow(k ? 28 : DX, 0);
      A.root.position.x = DX - 7 + t * 9; A.root.visible = k === 0; const w = walk(t, 1.85, 44); A.pose(ps(w, { lean: 14 }));
      if (k === 0) { camPath(cam, lt, [DX - 1.4, 4.4, 10.5], [DX - 1.0, 4.4, 9.6], [DX - 1.2, 4.6, -5.4], [DX - 0.8, 4.6, -5.4], 22, 23); shake(cam, t, 0.4, 0.5); return; }
      camPath(cam, lt, [31.2, 3.0, 0.6], [30.9, 3.4, 0.0], [29.0, 11.0, -7.2], [29.0, 12.0, -7.2], 24, 26); rumble(cam, t, 0.6);
    };
  },
  // 35 "And up in the cab, the driver turned around."  — over Mara's shoulder, looking up: in the lit cab window a driver in a cap, back to us, hand on the throttle… he turns.
  (S, cam) => {
    const st = grandStation(S, { clockX: 14, trainX: TX, h: 5, m: 59 }); const A = mara(S, 'worried', [24.7, 0, -2.2], 165); const C = cal(S, 'neutral', [CABX, CABY, CABZ], 110); C.root.scale.setScalar(1.0);
    return (t, dur) => { st.update(t, { steam: 0.9 }); st.follow(27, -3); const turn = hn([[dur * 0.5, 0], [dur * 0.92, 1]], t);
      C.root.rotation.y = lerp(112, 52, turn) * D; C.pose(ps(idle(t, 0.8), anticipate(t, dur * 0.5), { rFwd: 56, rUp: 4, nod: lerp(8, 0, turn), turn: lerp(0, -22, turn) })); C.setFace('neutral');
      A.pose(ps(idle(t, 0.7), { nod: -26, rUp: 8, lUp: 8 }, hit([[dur * 0.4, {}], [dur * 0.7, { rFwd: 30, rUp: 26, lean: -4 }]], t)));
      camPath(cam, sm(t, 0, dur), [24.6, 3.2, 2.2], [25.4, 3.5, 0.8], [27.2, 6.6, -7.5], [27.5, 7.0, -7.5], 30, 34);
    };
  },
  // 36 "It was my brother."  — close in the cab window: Cal. He sees her. His face drops.
  (S, cam) => {
    const st = grandStation(S, { clockX: 14, trainX: TX, h: 5, m: 59 }); const C = cal(S, 'shock', [CABX, CABY, CABZ], 16); C.root.scale.setScalar(1.0);
    return (t, dur) => { st.update(t, { steam: 0.9 }); st.follow(27, -3); C.pose(ps(idle(t, 0.6), hit([[0, { nod: 4 }], [dur * 0.5, { nod: 12, tilt: -4, rUp: 8, lUp: 8 }]], t))); C.setFace(t < dur * 0.45 ? 'shock' : 'sad');
      camPath(cam, sm(t, 0, dur), [27.0, 7.4, -0.2], [27.2, 7.5, -1.3], [CABX, 7.55, CABZ], [CABX, 7.55, CABZ], 44, 46);
    };
  },
  // 37 "Cal drives the Night Train."  — (a) low wide: Mara small on the platform, Cal up in the lit window, NIGHT TRAIN in gold along the boiler; (b) reverse from inside the cab, past Cal's shoulder, through the window: Mara looking up, stunned.
  (S, cam) => {
    const st = grandStation(S, { clockX: 14, trainX: TX, h: 5, m: 59 }); const A = mara(S, 'shock', [26.6, 0, -2.4], 167); const C = cal(S, 'sad', [CABX, CABY, CABZ], 10); C.root.scale.setScalar(1.0);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.5]); st.update(t, { steam: 0.9 }); st.follow(27, -3);
      C.pose(ps(idle(t, 0.6), { nod: 16, turn: -10 })); A.root.position.z = k ? 1.2 : -2.4; A.pose(ps(idle(t, 0.7), { nod: -28 }, hit([[dur * 0.5, {}], [dur * 0.75, { rFwd: 60, rUp: 20, lean: 4 }]], t))); A.setFace(t > dur * 0.72 ? 'teary' : 'shock');
      if (k === 0) { camPath(cam, lt, [16.5, 1.5, 6.2], [17.6, 1.7, 5.4], [29.5, 6.0, -8], [29.5, 6.2, -8], 20, 21); return; }
      st.key.position.set(27, 6.5, 5); camPath(cam, lt, [29.95, 8.75, -10.25], [29.85, 8.7, -10.1], [26.7, 4.9, 1.0], [26.7, 4.7, 1.0], 30, 34);
    };
  },
  // 38 "The wheels began to turn."  — the big red driving wheels slip, bite and roll; the rod pumps; steam blasts across the platform edge.
  (S, cam) => {
    const st = grandStation(S, { clockX: 14, trainX: TX, h: 6, m: 0 });
    return (t, dur) => { const u = t / dur; const move = 1.3 * u * u; st.train.g.position.x = TX - 8 + move; st.update(t, { steam: 1, dist: move + Math.sin(Math.min(1, u * 2.2) * Math.PI) * 2.4 + u * 1.5 }); st.follow(34, -3);
      camPath(cam, sm(t, 0, dur), [32.4, 0.8, 1.2], [33.8, 0.9, 0.4], [33.6, 1.5, -5.5], [34.6, 1.6, -5.5], 22, 24); rumble(cam, t, 0.8);
    };
  },
  // 39 "I had never once left my counter."  — (a) her counter, empty for the first time: bell, ledger, lamp, dust in the last light; (b) Mara on the platform, the cars sliding by behind her: a look back… then forward.
  (S, cam) => {
    const H = new THREE.Group(); S.add(H); const env = lostHall(H, { h: 5, m: 59 }); const G = new THREE.Group(); S.add(G); const st = grandStation(G, { clockX: 14, trainX: TX, h: 6, m: 0 }); const hallBg = new THREE.Color(0x100c0a);
    const A = mara(S, 'worried', [22, 0, -1.6], 30);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.45]); H.visible = k === 0; G.visible = k === 1; A.root.visible = k === 1; S.background = k ? G.background : hallBg; S.fog = k ? G.fog : null;
      if (k === 0) { env.update(t); camPath(cam, lt, [-2.4, 4.6, 4.6], [-1.8, 4.4, 3.4], [-1, 3.8, -4], [-1, 3.8, -4], 28, 30); return; }
      const mv = 1.3 + (t - dur * 0.45) * 3.5; st.train.g.position.x = TX - 8 + mv; st.update(t, { steam: 1, dist: mv }); st.follow(22, -2); const lk = sm(lt, 0.3, 0.7);
      A.pose(ps(idle(t, 1), { turn: lerp(-52, 38, lk), nod: lerp(4, -6, lk), lean: lerp(0, 10, lk), rUp: 10, lUp: 10 })); A.setFace(lk < 0.5 ? 'worried' : 'determined');
      faceCam(cam, lt, [22, 4.64, -1.6], 30, { dist: 6.4, lens: 38, side: 0.4, push: 0.6, look: -0.2 });
    };
  },
  // 40 "I ran. And I jumped."  — tracking with the rolling engine: Mara sprints alongside the cab, gains on the door… leaps for the step; Cal's arm shoots out of the doorway and catches her. (Hook = mid-leap.)
  (S, cam) => {
    const st = grandStation(S, { clockX: 60, trainX: TX, h: 6, m: 0 }); const A = mara(S, 'determined', [0, 0, -3.4], 90); const C = cal(S, 'shock', [0, 0, 0], 0); C.root.scale.setScalar(1.0); allow(S, ['mara', 'cal']);
    return (t, dur) => { const gx = TX - 8 + 2 + t * 6.5; st.train.g.position.x = gx; st.update(t, { steam: 1, dist: 2 + t * 6.5 }); st.follow(gx - 6, -2);
      const j0 = dur * 0.5, j1 = dur * 0.76; const run = sm(t, -0.2, j0); const from = [gx + lerp(-13.2, -8.3, run), 0, -3.4], to = [gx - 7.0, 2.3, -4.75]; const u = ramp(t, j0, j1);
      const p = u <= 0 ? from : arc(from, to, 1.5, sm(t, j0, j1)); A.root.position.set(...p); A.root.rotation.y = lerp(90, 58, sm(t, j0, j1 + 0.15)) * D;
      A.pose(ps(u <= 0 ? walk(t, 1.95, 46) : {}, anticipate(t, j0, 1.8), hit([[0, { lean: 16, rFwd: 10, lFwd: 10 }], [j0, { lean: 18 }], [j0 + 0.16, { rFwd: 110, lFwd: 60, rUp: 30, lUp: 40, rLeg: 58, lLeg: -36, lean: 12, nod: -10 }], [j1, { rFwd: 96, lFwd: 20, rUp: 8, lUp: 50, rLeg: 20, lLeg: -8, lean: 8, bob: -0.14 }], [j1 + 0.3, { rFwd: 92, lFwd: 10, rUp: 6, lUp: 30, lean: 2 }]], t)));
      A.setFace(u <= 0 ? 'determined' : u < 1 ? 'scared' : 'relieved');
      C.root.position.set(gx - 7.0, CABY, -8 + 0.9); C.root.rotation.y = -8 * D; C.pose(ps(idle(t, 0.6), anticipate(t, j0), hit([[j0 - 0.1, { rFwd: 30, lean: 6 }], [j0 + 0.2, { rFwd: 92, lFwd: 70, lean: 26, nod: 14 }], [j1 + 0.2, { rFwd: 84, lFwd: 60, lean: 14, nod: 12 }]], t))); C.setFace(t < j1 ? 'shock' : 'worried');
      camPath(cam, sm(t, 0, dur), [gx - 1.5, 3.0, 12.2], [gx - 4.6, 3.6, 9.6], [gx - 8.6, 4.2, -3.6], [gx - 7.2, 5.0, -4.8], 24, 26); rumble(cam, t, 0.7); shake(cam, t, j1, 0.4);
    };
  },
  // 41 "Cal. There's a letter. It has my name on it."  — inside the rolling cab: Mara, out of breath, hands on her knees, straightens and says it; Cal by the mail door can't meet her eye. City sliding past the windows.
  (S, cam) => {
    const env = trainCab(S); const A = mara(S, 'worried', [2.3, 0, 0.6], -52); const C = cal(S, 'nervous', [-2.5, 0, 0.4], 52);
    return (t, dur) => { env.update(t, { dist: 30 + t * 6, sway: 0.5 });
      A.pose(ps(idle(t, 0.8), talk(t, 1.1), hit([[0, { rFwd: 36, lFwd: 36, lean: 30, nod: -14 }], [dur * 0.3, { rFwd: 20, lFwd: 20, lean: 8, nod: -2 }], [dur * 0.6, { lFwd: 60, lUp: 20, rFwd: 10, lean: 6 }], [dur * 0.9, { lFwd: 40, lUp: 14, rFwd: 20, lean: 4 }]], t), { bob: Math.sin(t * 9) * 0.035 * (1 - t / dur) })); A.setFace(t < dur * 0.3 ? 'scared' : 'worried');
      C.pose(ps(idle(t, 0.8, 2), hit([[0, { nod: 6, turn: 0 }], [dur * 0.45, { nod: 16, turn: -26, rUp: 14 }], [dur * 0.85, { nod: 18, turn: -30, rFwd: 118, rUp: 30, tilt: 6 }]], t))); C.setFace(t > dur * 0.5 ? 'sad' : 'nervous');
      camPath(cam, sm(t, 0, dur), [0.6, 5.0, 13.2], [0.2, 4.8, 11.6], [0, 4.3, 0.5], [0, 4.3, 0.5], 22, 23);
    };
  },
  // 42 "'I know,' he said. 'I lose one every day.'"  — close on Cal: a look at the floor, a breath, then he makes himself look at her.
  (S, cam) => {
    const env = trainCab(S); const C = cal(S, 'sad', [-2.5, 0, 0.4], 52);
    return (t, dur) => { env.update(t, { dist: 44 + t * 6, sway: 0.5 });
      C.pose(ps(idle(t, 0.8), talk(t, 0.9), hit([[0, { nod: 18, turn: -24, rFwd: 118, rUp: 30 }], [dur * 0.35, { nod: 14, turn: -18, rFwd: 118, rUp: 30 }], [dur * 0.6, { nod: 2, turn: 8, lFwd: 30, lUp: 10, rUp: 22, rFwd: 20 }], [dur * 0.9, { nod: 4, turn: 10, rUp: 30, rFwd: 26, lUp: 30, lFwd: 26, tilt: 5 }]], t))); C.setFace(t < dur * 0.5 ? 'sad' : 'worried');
      faceCam(cam, sm(t, 0, dur), [-2.5, 4.85, 0.4], 30, { dist: 6.9, lens: 36, side: 0.4, push: 0.9, look: -0.25 });
    };
  },
  // 43 "He opened the door behind him."  — from inside the dark mail car: the steel door grinds aside and there is Cal, lit by the lamps in here, Mara behind him in the cab; a few envelopes slither out past his boots.
  //   Blocking: camera in the car looking back into the cab (reverse of 44). Cal centre in the doorway facing us, both hands hauling the door to screen-left.
  (S, cam) => {
    const env = trainCab(S); const car = letterCar(S); const C = cal(S, 'sad', [-3.0, 0, 0.3], -90); const A = mara(S, 'worried', [1.8, 0, 1.0], -78); const spill = [0, 1, 2, 3, 4].map(i => envelope(S, { s: 0.9 })); const kf = fill(S, [-7.2, 5.2, 0.8], 9, 0xffd8a8, 8);
    return (t, dur) => { env.update(t, { dist: 60 + t * 6, sway: 0.5 }); car.update(t); const o = dur * 0.25; const k = hn([[o, 0], [o + 0.55, 1]], t); env.door.open(Math.max(0, Math.min(1.04, k)));
      C.pose(ps(idle(t, 0.6), anticipate(t, o, 1.5), hit([[0, { rFwd: 66, lFwd: 66, rUp: 4, lUp: -4, lean: 6 }], [o + 0.5, { rFwd: 60, lFwd: 20, rUp: 40, lUp: 0, lean: 0, nod: 4 }], [dur, { rFwd: 10, lFwd: 6, rUp: 8, nod: 14 }]], t))); C.setFace(t > o + 0.6 ? 'nervous' : 'sad');
      A.pose(ps(idle(t, 0.8, 2), { turn: -8, nod: -2 })); A.setFace(t > o + 0.5 ? 'shock' : 'worried');
      spill.forEach((e, i) => { const u = sm(t, o + 0.3 + i * 0.06, o + 0.9 + i * 0.08); e.position.set(lerp(-6.6, -5.0 + (i % 2) * 0.5, u), 0.04 + i * 0.012, -1.0 + i * 0.5); e.rotation.set(-Math.PI / 2, 0, i * 1.1 + u * 2); });
      camPath(cam, sm(t, 0, dur), [-8.6, 4.8, 0.5], [-9.8, 4.6, 0.4], [-3.3, 4.5, 0.3], [-3.3, 4.5, 0.3], 28, 30); shake(cam, t, o + 0.5, 0.3);
    };
  },
  // 44 "Letters. Floor to ceiling."  — through the door and up: racks, drifts and towers of envelopes to the roof of the car, lamps swaying, letters fluttering down.
  (S, cam) => {
    const env = trainCab(S); const car = letterCar(S); env.door.open(1);
    return (t, dur) => { env.update(t, { dist: 70 + t * 6, sway: 0.5 }); car.update(t, { sway: 0.7 });
      camPath(cam, sm(t, 0, dur), [-6.6, 1.5, 0.3], [-10.6, 3.6, 0.1], [-22, 2.2, 0], [-24, 7.6, 0], 18, 20);
    };
  },
  // 45 "Four years of them. All for me."  — Mara walks in among them, turning, a hand out; one flutters down and she catches it. Her name on every single one. Cal hangs back in the doorway.
  (S, cam) => {
    const env = trainCab(S); const car = letterCar(S); env.door.open(1); const A = mara(S, 'starstruck', [-7, 0, 0.2], -90); const C = cal(S, 'nervous', [-3.4, 0, 0.3], -90); const e = envelope(S, { s: 1.0 }); const kf = fill(S, [-12.5, 5.2, 0.9], 7, 0xffe2c4, 9);
    return (t, dur) => { env.update(t, { dist: 80 + t * 6, sway: 0.5 }); car.update(t, { sway: 0.5 }); const x = lerp(-7.2, -9.6, sm(t, 0, dur * 0.6)); A.root.position.x = x; const c0 = dur * 0.62;
      A.pose(ps(idle(t, 0.8), t < dur * 0.6 ? walk(t, 0.6, 20) : {}, hit([[0, { turn: 30, nod: -14 }], [dur * 0.3, { turn: -34, nod: -18, rUp: 20 }], [c0, { turn: 10, nod: -10, rFwd: 86, rUp: 16 }], [c0 + 0.3, { turn: 0, nod: 12, rFwd: 74, lFwd: 70, rUp: -10, lUp: -10 }]], t))); A.setFace(t < dur * 0.3 ? 'shock' : t < c0 ? 'starstruck' : 'teary');
      const hp = pinky(A, 'R'); const u = ramp(t, 0, c0); if (u < 1) { e.position.set(hp.x - 0.3 + Math.sin(u * 8) * 0.5 * (1 - u), lerp(8.6, hp.y + 0.2, u), hp.z + Math.cos(u * 6) * 0.4 * (1 - u)); e.rotation.set(u * 5, Math.PI / 2, Math.sin(u * 9) * 0.6); } else { const h = hands(A); e.position.set(h.x - 0.1, h.y + 0.25, h.z); e.rotation.set(-0.3, Math.PI / 2 + 0.2, 0); }
      C.pose(ps(idle(t, 0.8, 2), { nod: 16, lFwd: 118, lUp: 30 }));
      camPath(cam, sm(t, 0, dur), [-15.6, 4.3, 1.1], [-14.4, 4.5, 0.9], [-9.2, 4.5, 0.2], [-9.4, 4.5, 0.2], 28, 30);
    };
  },
  // 46 "I write one every morning."  — memory: dawn in the cab, Cal on the bench with a sheet on his knee, writing, stopping, writing.
  (S, cam) => {
    const env = trainCab(S); S.userData.look = 'flash'; env.key.intensity = 46; const C = cal(S, 'thinking', [-1.5, 0, -3.0], 0); sitOn(C, 1.82); allow(S, ['cal', 'bench*']);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 1.0), std({ color: 0xfbf6e6 })); S.add(paper); const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), std({ color: 0x1c2a5a })); S.add(pen);
    return (t, dur) => { env.update(t, { dist: 0 }); const w = Math.sin(t * 13) * (t < dur * 0.55 ? 1 : 0.15);
      C.pose(ps(SITP, { bob: Math.sin(t * 3) * 0.02, nod: 20, lean: 10, rFwd: 44 + w * 2, rUp: -18 + w * 4, lFwd: 40, lUp: -6, tilt: Math.sin(t * 1.4) * 3 }, hit([[dur * 0.55, {}], [dur * 0.8, { nod: -22, rFwd: -6, tilt: 6 }]], t))); C.setFace(t > dur * 0.55 ? 'sad' : 'thinking');
      paper.position.set(-1.5, 2.05, -1.55); paper.rotation.set(0.1, 0.2, 0); const hp = pinky(C, 'R'); pen.position.set(hp.x, hp.y + 0.15, hp.z + 0.1); pen.rotation.set(0.5, 0, 0.3);
      camPath(cam, sm(t, 0, dur), [1.2, 4.3, 5.2], [0.7, 4.1, 4.0], [-1.5, 3.7, -2.8], [-1.5, 3.7, -2.8], 30, 32);
    };
  },
  // 47 "It's three hundred steps to your counter."  — memory, long lens: Cal, tiny, walking the length of the platform toward the glowing LOST PROPERTY door, an envelope in his hand.
  (S, cam) => {
    const st = grandStation(S, { clockX: -40, trainX: 20, h: 7, m: 30 }); S.userData.look = 'flash'; const C = cal(S, 'nervous', [-34, 0, 5.2], -90); const e = envelope(S, { s: 0.9 });
    return (t, dur) => { st.update(t, { steam: 0.3 }); st.follow(-40, 4); const x = -33 - t * 2.3; C.root.position.x = x; C.pose(ps(walk(t, 0.75, 26), { rFwd: 30, rUp: 6, nod: 8 })); const hp = pinky(C, 'R'); e.position.set(hp.x, hp.y, hp.z + 0.1); e.rotation.set(0, 0, 0.3);
      camPath(cam, sm(t, 0, dur), [-17, 2.6, 6.6], [-18.5, 2.9, 6.4], [-57, 4.6, 5], [-57, 4.8, 5], 36, 40);
    };
  },
  // 48 "I never make it past the door."  — memory: at the glowing doorway Cal lifts a fist to knock… holds… lets it fall; his head drops, he turns away — and the envelope slips from his fingers.
  (S, cam) => {
    const st = grandStation(S, { clockX: -30, trainX: 20, h: 7, m: 31 }); S.userData.look = 'flash'; const C = cal(S, 'nervous', [-52.4, 0, 5.2], -90); const e = envelope(S, { s: 0.9 });
    return (t, dur) => { st.update(t, { steam: 0.3 }); st.follow(-48, 4); const k = dur * 0.3, d = dur * 0.55, tn = sm(t, dur * 0.62, dur * 0.95); C.root.rotation.y = lerp(-90, -22, tn) * D;
      C.pose(ps(idle(t, 0.7), anticipate(t, k), hit([[0, { lFwd: 30, lUp: 6 }], [k, { rFwd: 104, rUp: 10, lFwd: 30, lUp: 6, nod: -4 }], [d, { rFwd: 100, rUp: 10, lFwd: 30, lUp: 6, nod: 2 }], [d + 0.35, { rFwd: 6, lFwd: 8, nod: 12, lean: 4 }]], t), { rFwd: t > k && t < d ? Math.sin(t * 20) * 1.5 : 0 })); C.setFace(t < d ? 'nervous' : 'sad');
      const drop = ramp(t, dur * 0.7, dur * 0.95); const hp = pinky(C, 'L'); if (drop <= 0) { e.position.set(hp.x, hp.y, hp.z + 0.1); e.rotation.set(0, Math.PI / 2, 0.3); e.userData.p = [hp.x, hp.y, hp.z]; } else { const p = e.userData.p || [hp.x, hp.y, hp.z]; e.position.set(p[0] + Math.sin(drop * 7) * 0.4, lerp(p[1], 0.04, drop * drop), p[2] + drop * 0.5); e.rotation.set(-drop * Math.PI / 2, Math.PI / 2, 0.3 + drop * 2); }
      camPath(cam, sm(t, 0, dur), [-57.0, 4.9, 6.9], [-56.6, 4.7, 6.6], [-52.4, 4.5, 5.2], [-52.4, 4.3, 5.2], 24, 26);
    };
  },
  // 49 "I opened the top one."  — close: Mara's thumbs break the flap of the envelope in her hands.
  (S, cam) => {
    const env = carSide(S); const A = mara(S, 'worried', MC, 55); const e = envelope(S, { s: 1.1 });
    return (t, dur) => { env.update(t, 90 + t * 5); A.pose(ps(idle(t, 0.5), { rFwd: 74, lFwd: 74, rUp: -16, lUp: -16, nod: 22 }, hit([[dur * 0.3, {}], [dur * 0.6, { rUp: 6, lUp: 6, nod: 3 }]], t))); const h = hands(A); e.position.set(h.x + 0.1, h.y + 0.3, h.z + 0.15); e.rotation.set(-0.5, 55 * D, 0);
      faceCam(cam, sm(t, 0, dur), [MC[0] + 0.2, 4.3, MC[2] + 0.2], 30, { dist: 6.0, lens: 38, side: 0.2, push: 0.6, look: -0.5 });
    };
  },
  // 50 "Two words. 'I'm sorry.'"  — (a) the sheet, shaking a little in her hands: "I'm sorry. — Cal"; (b) Mara's face over the page, eyes brimming.
  (S, cam) => {
    const env = carSide(S); const A = mara(S, 'worried', [-12.4, 0, 0.2], 0); const pp = letterPaper(S, "I'm sorry.", { w: 1.5 });
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.58]); env.update(t, 100 + t * 5);
      if (k === 0) { pp.scale.setScalar(1); A.pose(ps(idle(t, 0.4), { rFwd: 100, lFwd: 100, rUp: 10, lUp: 10, nod: 10 })); pp.position.set(-12.4 + Math.sin(t * 17) * 0.008, 4.35 + Math.sin(t * 13) * 0.008, 1.9); pp.rotation.set(-0.08, 0, Math.sin(t * 6) * 0.01);
        camPath(cam, lt, [-12.4, 4.0, 5.7], [-12.4, 4.0, 5.3], [-12.4, 3.95, 1.9], [-12.4, 3.95, 1.9], 30, 31); return; }
      A.pose(ps(idle(t, 0.5), { rFwd: 70, lFwd: 70, rUp: -8, lUp: -8, nod: 16 }, hit([[dur * 0.66, {}], [dur * 0.9, { nod: 0, tilt: 5 }]], t), { bob: Math.sin(t * 8) * 0.012 })); A.setFace(t < dur * 0.7 ? 'worried' : 'teary'); const h = hands(A); pp.position.set(h.x, h.y + 0.1, h.z + 0.2); pp.rotation.set(-1.0, 0, 0); pp.scale.setScalar(0.8);
      faceCam(cam, lt, [-12.4, 4.6, 0.3], 0, { dist: 6.2, lens: 40, side: 0.5, push: 0.6, look: -0.2 });
    };
  },
  // 51 "Every single letter said the same."  — wide in the car: sheet after sheet in the air and in her hands — all "I'm sorry." Cal rubs the back of his neck, ears red.
  (S, cam) => {
    const env = carSide(S); const A = mara(S, 'teary', MC, 50); const C = cal(S, 'blush', CC, -50);
    const sheets = [[-14.9, 6.2, 1.2], [-13.9, 5.0, 2.4], [-12.4, 7.2, -1.6], [-11.0, 5.6, 1.6], [-10.1, 6.6, 2.6], [-9.4, 5.0, 0.9], [-7.9, 7.4, -1.6], [-6.6, 6.0, 1.4]].map((o, i) => { const p = letterPaper(S, "I'm sorry.", { w: 1.0 }); p.userData.o = [...o, i * 0.9]; return p; });
    return (t, dur) => { env.update(t, 110 + t * 5);
      sheets.forEach((p) => { const [x, y, z, ph] = p.userData.o; const f = (t * 0.5 + ph * 0.3); p.position.set(x + Math.sin(f * 3 + ph) * 0.3, y - (f % 1.6) * (z < 0 ? 0.9 : 1.9), z); p.rotation.set(Math.sin(f * 4 + ph) * 0.3 - 0.1, Math.sin(f * 2.2 + ph) * 0.45, Math.sin(f * 3.1 + ph) * 0.25); });
      A.pose(ps(idle(t, 0.8), hit([[0, { rFwd: 80, lFwd: 60, rUp: 20, lUp: 10, nod: 10 }], [dur * 0.4, { rFwd: 60, lFwd: 86, rUp: 10, lUp: 30, nod: 14, turn: -20 }], [dur * 0.8, { rFwd: 70, lFwd: 70, rUp: 34, lUp: 34, nod: -4, turn: 24 }]], t))); A.setFace(t > dur * 0.7 ? 'softsmile' : 'teary');
      C.pose(ps(idle(t, 0.8, 2), { lFwd: 122, lUp: 34, nod: 14, tilt: -6, turn: -12 }, { lUp: Math.sin(t * 6) * 4 })); C.setFace(t > dur * 0.5 ? 'nervous' : 'blush');
      camPath(cam, sm(t, 0, dur), [-10.6, 5.6, 12.6], [-10.2, 5.0, 11.2], [-10.2, 4.0, 0.2], [-10.2, 4.1, 0.2], 22, 23);
    };
  },
  // 52 "Only the owner can claim what's lost."  — close on Mara: she wipes her eye with the back of her wrist, sniffs — and the clerk in her wakes up. A small, dangerous smile.
  (S, cam) => {
    const env = carSide(S); const A = mara(S, 'teary', MC, 50);
    return (t, dur) => { env.update(t, 120 + t * 5);
      A.pose(ps(idle(t, 0.7), hit([[0, { nod: 14 }], [dur * 0.25, { rFwd: 128, rUp: -6, nod: 12, tilt: 6 }], [dur * 0.5, { rFwd: 124, rUp: 4, nod: 8, tilt: 8 }], [dur * 0.72, { rFwd: 10, nod: -2, tilt: 0, rUp: 20, lUp: 20 }], [dur * 0.92, { rFwd: 0, nod: -4, tilt: -5, rUp: 28, lUp: 28 }]], t))); A.setFace(t < dur * 0.5 ? 'teary' : t < dur * 0.75 ? 'determined' : 'smirk');
      faceCam(cam, sm(t, 0, dur), [MC[0], 4.64, MC[2]], 28, { dist: 6.6, lens: 38, side: 0.4, push: 0.8, look: -0.2 });
    };
  },
  // 53 "So I filled in a tag."  — she whips a luggage tag and a pencil out of her satchel and writes, tongue-out concentration; the blank tag fills in.
  (S, cam) => {
    const env = carSide(S); const A = mara(S, 'determined', MC, 40); const blank = tagCard(S, [['LOST:', ''], ['CLAIMED BY:', '']], { s: 0.8 }); const full = tagCard(S, [['LOST:', 'one brother'], ['CLAIMED BY:', 'Mara']], { s: 0.8 });
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 6), std({ color: 0xf2c420 })); S.add(pen);
    return (t, dur) => { env.update(t, 130 + t * 5); const w0 = dur * 0.3, w1 = dur * 0.78; const wr = t > w0 && t < w1 ? 1 : 0;
      A.pose(ps(idle(t, 0.6), anticipate(t, 0.2), hit([[0, { rFwd: 10, lFwd: 10 }], [w0, { lFwd: 96, lUp: -12, rFwd: 88, rUp: -26, nod: 16, lean: 2 }], [w1, { lFwd: 96, lUp: -12, rFwd: 90, rUp: -28, nod: 16, lean: 2 }], [w1 + 0.25, { lFwd: 104, lUp: 6, rFwd: 30, rUp: 14, nod: 0 }]], t), { rFwd: Math.sin(t * 22) * 3 * wr, rUp: Math.cos(t * 17) * 3 * wr })); A.setFace(t < w0 ? 'determined' : t < w1 ? 'silly' : 'smirk');
      const lh = pinky(A, 'L'); const done = t > dur * 0.6; const hm = hands(A); for (const g of [blank, full]) { g.position.set(hm.x + 0.1, hm.y + 0.35, hm.z + 0.3); g.rotation.set(-0.3, 30 * D, 0.06); } blank.visible = !done; full.visible = done;
      const rh = pinky(A, 'R'); pen.position.set(rh.x, rh.y + 0.2, rh.z + 0.1); pen.rotation.set(0.6, 0, 0.4); pen.visible = t > 0.25;
      faceCam(cam, sm(t, 0, dur), [MC[0] + 0.3, 4.1, MC[2] + 0.4], 30, { dist: 6.8, lens: 34, side: 0.2, push: 0.7, look: -0.4 });
    };
  },
  // 54 "Lost: one brother."  — insert: the tag, held out, swinging on its red string: LOST: one brother.
  (S, cam) => {
    const env = carSide(S); const A = mara(S, 'proud', [-11, 0, -0.9], 0); const tg = tagCard(S, [['LOST:', 'one brother'], ['CLAIMED BY:', '']], { s: 1.0 }); const kf = fill(S, [-11, 5.0, 3.6], 4, 0xfff0d8, 7);
    return (t, dur) => { env.update(t, 140 + t * 5); A.pose(ps(idle(t, 0.5), { rFwd: 88, rUp: 14, nod: 6 })); tg.position.set(-11.0, 4.72 + Math.sin(t * 5) * 0.015, 0.9); tg.rotation.set(0, 0, Math.sin(t * 3.4) * 0.07 * Math.exp(-t * 1.2));
      camPath(cam, sm(t, 0, dur), [-11.0, 4.3, 5.9], [-11.0, 4.32, 5.4], [-11.0, 4.3, 0.9], [-11.0, 4.3, 0.9], 36, 37);
    };
  },
  // 55 "Claimed by: Mara."  — (a) she steps up and hooks the tag onto his scarf; (b) over her shoulder: Cal reads it, reads it again — laughs and cries at once, and pulls his sister into a hug.
  (S, cam) => {
    const env = carSide(S); const A = mara(S, 'smirk', MC, 62); const C = cal(S, 'confused', CC, -62); const tg = tagCard(S, [['LOST:', 'one brother'], ['CLAIMED BY:', 'Mara']], { s: 0.5 }); const kf = fill(S, [-11.5, 5.4, 2.6], 8, 0xffe2c4, 9);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.4]); env.update(t, 150 + t * 5); const step = sm(t, 0, dur * 0.28), hug = sm(t, dur * 0.72, dur * 0.95); A.root.position.x = lerp(-12.4, -10.9, step) + hug * 0.3; const pin = dur * 0.34;
      A.root.rotation.y = lerp(62, 86, sm(t, dur * 0.3, dur * 0.5)) * D; C.root.rotation.y = lerp(-62, -80, sm(t, dur * 0.3, dur * 0.5)) * D;
      A.pose(ps(idle(t, 0.6), t < dur * 0.28 ? walk(t, 0.8, 22) : {}, t < pin ? talk(t, 1) : {}, hug > 0.02 ? hit([[dur * 0.72, { rFwd: 40, rUp: 6 }], [dur * 0.95, HUG]], t) : hit([[0, { rFwd: 30 }], [pin, { rFwd: 84, rUp: 6, lean: 6 }], [pin + 0.3, { rFwd: 40, rUp: 6 }]], t))); A.setFace(hug > 0.5 ? 'relieved' : 'smirk');
      C.pose(ps(idle(t, 0.6, 2), hug > 0.02 ? hit([[dur * 0.72, { nod: 6 }], [dur * 0.95, { ...HUG, nod: 8 }]], t) : hit([[pin, {}], [pin + 0.25, { nod: 24, rUp: 14, lUp: 14 }], [dur * 0.62, { nod: 4, rUp: 20, lUp: 20 }]], t), t > dur * 0.58 && hug < 0.9 ? { bob: Math.abs(Math.sin(t * 12)) * 0.04 } : {})); C.setFace(t < pin + 0.1 ? 'confused' : t < dur * 0.58 ? 'teary' : hug > 0.7 ? 'relieved' : 'laugh');
      if (t < pin) { const hp = pinky(A, 'R'); tg.position.set(hp.x + 0.1, hp.y + 0.1, hp.z + 0.2); tg.rotation.set(0, -20 * D, 0.1); } else { tg.position.set(C.root.position.x - 0.6, 3.25, CC[2] + 0.35); tg.rotation.set(0, -62 * D, Math.sin(t * 5) * 0.08 * (1 - hug)); }
      if (k === 0) { camPath(cam, lt, [-9.8, 4.8, 10.6], [-9.6, 4.6, 9.4], [-9.6, 4.2, 0.2], [-9.5, 4.2, 0.2], 26, 28); return; }
      camPath(cam, lt, [-14.2, 5.3, 3.4], [-13.4, 5.2, 3.0], [-8.2, 4.7, 0.2], [-8.3, 4.7, 0.2], 34, 38);
    };
  },
  // 56 "He stopped the train. And we just sat there."  — (a) Cal hauls the big red brake lever back, the city in the windows slows and stops, the lantern swings; (b) the two of them side by side on the bench under the sunset windows, not saying anything.
  (S, cam) => {
    const env = trainCab(S); const C = cal(S, 'determined', [2.5, 0, 3.2], 90); const A = mara(S, 'softsmile', [-3.4, 0, -3.0], 0); allow(S, ['cal', 'console'], ['mara', 'bench*'], ['cal', 'bench*']); const tg = tagCard(S, [['LOST:', 'one brother'], ['CLAIMED BY:', 'Mara']], { s: 0.5 });
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.4]); const cut = dur * 0.4; const pull = hn([[cut * 0.25, 0], [cut * 0.6, 1]], t); const dist = 160 + 9 * (Math.min(t, cut * 0.9) - Math.min(t, cut * 0.9) ** 2 / (2 * cut * 0.9)); env.update(t, { dist, sway: k ? 0.1 : 0.9 * (1 - lt) }); env.brake(pull);
      if (k === 0) { A.root.visible = false; C.root.position.set(2.5, 0, 3.2); C.root.rotation.y = 90 * D; C.pose(ps(idle(t, 0.5), anticipate(t, cut * 0.25, 1.6), hit([[0, { rFwd: 84, lFwd: 84, rUp: -8, lUp: -8, lean: 14 }], [cut * 0.6, { rFwd: 64, lFwd: 64, rUp: -8, lUp: -8, lean: -14, nod: -6 }], [cut * 0.9, { rFwd: 68, lFwd: 68, lean: -6 }]], t))); C.setFace('determined'); tg.position.set(2.5 + 0.5, 3.25, 3.2 - 0.62); tg.rotation.set(0, Math.PI / 2 - 0.4, 0);
        camPath(cam, lt, [-0.6, 5.0, 10.2], [0.4, 4.7, 9.0], [3.6, 4.1, 3.2], [3.8, 4.1, 3.2], 26, 28); rumble(cam, t, 0.8 * (1 - lt)); return; }
      A.root.visible = true; sitOn(A, 1.82); C.root.position.set(0.95, 0, -3.0); C.root.rotation.y = 0; sitOn(C, 1.82);
      A.pose(ps(SITP, { bob: Math.sin(t * 2.6) * 0.02, rFwd: 34, lFwd: 34, rUp: -6, lUp: -6 }, hit([[cut + 0.3, { nod: 6 }], [cut + 0.9, { nod: 4, turn: 22, tilt: 8 }]], t))); A.setFace('softsmile');
      C.pose(ps(SITP, { bob: Math.sin(t * 2.6 + 1) * 0.02, rFwd: 34, lFwd: 34, rUp: -6, lUp: -6 }, hit([[cut + 0.2, { nod: 22 }], [cut + 1.0, { nod: 8, turn: -20 }]], t))); C.setFace(lt > 0.6 ? 'softsmile' : 'relieved'); tg.position.set(0.95 - 0.62, 1.82 - 1.5 * 1.0 + 3.25 + 0.1, -3.0 + 0.6); tg.rotation.set(0, 0, 0.06);
      camPath(cam, lt, [-1.2, 4.6, 9.6], [-1.2, 4.4, 8.4], [-1.2, 4.0, -3], [-1.2, 4.0, -3], 21, 22);
    };
  },
  // 57 "The Night Train left an hour late."  — dusk, lamps lit, the clock at seven: the Night Train finally eases out; Pip, alone on the platform, checks his pocket watch, shrugs, and waves it off.
  (S, cam) => {
    const st = grandStation(S, { time: 'dusk', clockX: 22, trainX: 34, h: 7, m: 0 }); S.userData.look = 'night'; const P = pip(S, 'confused', [18.5, 0, 1.2], 24);
    const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 14), std({ color: 0xd8a83a, metalness: 0.8, roughness: 0.3 })); S.add(watch); const kf = fill(S, [19.5, 5.6, 5.5], 12, 0xffd8a8, 12);
    return (t, dur) => { const mv = 0.6 * t * t + 0.8 * t; st.train.g.position.x = 34 - 8 + mv; st.update(t, { steam: 1, dist: mv, whistle: t < 0.5 ? 1 : 0 }); st.follow(22, 0); const w = dur * 0.5;
      P.pose(ps(idle(t, 1), hit([[0, { lFwd: 96, lUp: -14, nod: 12 }], [w, { lFwd: 96, lUp: -14, nod: 12 }], [w + 0.3, { lFwd: 30, lUp: 34, rUp: 34, rFwd: 24, tilt: 8, nod: 0 }], [w + 0.6, { rUp: 150, lUp: 8, tilt: -6, nod: -8, turn: 12 }]], t), t > w + 0.6 ? { rUp: Math.sin(t * 9) * 12 } : {})); P.setFace(t < w ? 'confused' : t < w + 0.5 ? 'smirk' : 'grin');
      const hp = pinky(P, 'L'); watch.position.set(hp.x, hp.y + 0.1, hp.z + 0.1); watch.rotation.x = Math.PI / 2 - 0.5; watch.visible = t < w + 0.3;
      camPath(cam, sm(t, 0, dur), [14.6, 5.6, 13.2], [15.4, 5.2, 12.4], [22.5, 5.4, -4], [23.5, 5.6, -4], 20, 21);
    };
  },
  // 58 "I think we finally claimed that hour."  — the bench again, closer: the golden hourglass between them, its last sand running out, two enamel mugs; they clink over it.
  (S, cam) => {
    const env = trainCab(S); const A = mara(S, 'softsmile', [-3.4, 0, -3.0], 0); const C = cal(S, 'softsmile', [0.95, 0, -3.0], 0); sitOn(A, 1.82); sitOn(C, 1.82); allow(S, ['mara', 'bench*'], ['cal', 'bench*'], ['mara', 'cal']);
    const H = hourglass(S, { s: 1.0, light: 8 }); H.position.set(-1.2, 1.84, -3.0); const m1 = mug(S, 0x2a5a8a), m2 = mug(S, 0xc8302a); const tg = tagCard(S, [['LOST:', 'one brother'], ['CLAIMED BY:', 'Mara']], { s: 0.5 }); tg.position.set(0.95 - 0.62, 1.82 - 1.5 + 3.25 + 0.1, -2.4);
    return (t, dur) => { env.update(t, { dist: 200 + t * 2.5, sway: 0.2 }); H.userData.update(t, 0.72 + t / dur * 0.27, 1.3); const c = dur * 0.5;
      A.pose(ps(SITP, { bob: Math.sin(t * 2.6) * 0.02, rFwd: 40, rUp: -6 }, anticipate(t, c), hit([[0, { lFwd: 62, lUp: 6, turn: 16 }], [c, { lFwd: 76, lUp: 40, turn: 26, tilt: 4 }], [c + 0.35, { lFwd: 70, lUp: 26, turn: 22, tilt: 6 }]], t))); A.setFace(t > c ? 'grin' : 'softsmile');
      C.pose(ps(SITP, { bob: Math.sin(t * 2.6 + 1) * 0.02, lFwd: 40, lUp: -6 }, anticipate(t, c), hit([[0, { rFwd: 62, rUp: 6, turn: -16 }], [c, { rFwd: 76, rUp: 40, turn: -26, tilt: -4 }], [c + 0.35, { rFwd: 70, rUp: 26, turn: -22, tilt: -6 }]], t))); C.setFace(t > c + 0.2 ? 'laugh' : 'softsmile');
      const a = pinky(A, 'L'), b = pinky(C, 'R'); m1.position.set(a.x, a.y - 0.1, a.z + 0.15); m2.position.set(b.x, b.y - 0.1, b.z + 0.15);
      camPath(cam, sm(t, 0, dur), [-1.0, 4.3, 7.8], [-1.2, 4.1, 6.4], [-1.2, 3.7, -3], [-1.2, 3.7, -3], 20, 21); shake(cam, t, c, 0.12);
    };
  },
  // 59 "Mr. Abel's temper is still on my shelf."  — next morning, bright office: the little red temper rages under its glass dome (a DO NOT FEED tag on it); Mara taps the glass and it goes berserk; she grins.
  (S, cam) => {
    const env = hall(S, { time: 'morning', h: 8, m: 55 }); const A = mara(S, 'mischief', [-2.5, 0, -4.9]); const J = temperJar(S, { s: 1.0 }); J.g.position.set(0.0, 3.08, -3.0); const tg = tagCard(S, [['DO NOT', 'FEED'], ['OWNER:', 'Mr. Abel']], { s: 0.42 }); tg.position.set(0.85, 3.45, -2.2); tg.rotation.y = -0.2;
    return (t, dur) => { env.update(t); const tap = dur * 0.4; J.update(t, t > tap ? 'rage' : 'sulk', 1.3); tg.rotation.z = -0.15 + (t > tap ? Math.sin(t * 20) * 0.1 : Math.sin(t * 2) * 0.05);
      A.pose(ps(idle(t, 0.7), anticipate(t, tap), hit([[0, { lFwd: 30, lUp: 20, lean: 8, turn: 20, nod: 10 }], [tap, { lFwd: 66, lUp: 34, lean: 16, turn: 24, nod: 14 }], [tap + 0.25, { lFwd: 40, lUp: 60, lean: -6, turn: 22, nod: 4 }], [tap + 0.6, { lFwd: 10, lUp: 26, rUp: 26, lean: 0, turn: 16, nod: 8 }]], t))); A.setFace(t < tap ? 'mischief' : t < tap + 0.4 ? 'shock' : 'laugh');
      camPath(cam, sm(t, 0, dur), [0.3, 4.4, 2.6], [0.0, 4.3, 1.7], [-1.2, 4.0, -3.7], [-1.2, 4.0, -3.8], 28, 30);
    };
  },
  // 60 "And Cal walks those three hundred steps every morning."  — from behind the counter: the doors swing open, morning sun pours in, and Cal walks in with two coffees, grinning; Mara waves him over.
  (S, cam) => {
    const env = hall(S, { time: 'morning', h: 9, m: 0 }); const A = mara(S, 'smile', [-2.2, 0, -4.9]); const C = cal(S, 'grin', [0, 0, 19], 180); const c1 = coffeeCup(S), c2 = coffeeCup(S); const kf = fill(S, [1.2, 5.2, 0.5], 12, 0xffe6c8, 14);
    return (t, dur) => { env.update(t); const o = hn([[0.1, 0], [0.75, 1]], t); env.door.open(-Math.min(1.05, o)); const z = lerp(19, 2.2, sm(t, 0.3, dur)); C.root.position.z = z; const stop = t > dur * 0.92;
      C.pose(ps(stop ? idle(t) : walk(t, 1.05, 28), { rFwd: 52, lFwd: 52, rUp: 4, lUp: 4 }, hit([[dur * 0.6, {}], [dur * 0.8, { rFwd: 30, rUp: 30, tilt: 6 }]], t))); C.setFace(t > dur * 0.6 ? 'laugh' : 'grin');
      const a = pinky(C, 'R'), b = pinky(C, 'L'); c1.position.set(a.x, a.y - 0.05, a.z - 0.15); c2.position.set(b.x, b.y - 0.05, b.z - 0.15);
      A.pose(ps(idle(t, 1), anticipate(t, dur * 0.4), hit([[0, { lUp: 4 }], [dur * 0.4, { lUp: 4, nod: -4 }], [dur * 0.55, { lUp: 152, tilt: 6, nod: -6 }]], t), t > dur * 0.55 ? { lUp: Math.sin(t * 9) * 12 } : {}));
      camPath(cam, sm(t, 0, dur), [3.4, 5.9, -7.7], [2.6, 5.5, -7.0], [0.2, 4.0, 8], [0.2, 4.2, 5], 24, 26);
    };
  },
  // 61 "Some lost things never come to you."  — the empty slot again, from inside the shelf — not empty any more: the photo of two kids, and the tag. Mara straightens it; behind her, Cal sips his coffee at the counter.
  (S, cam) => {
    const env = hall(S, { time: 'morning', h: 9, m: 2 }); const A = mara(S, 'softsmile', [3.1, 0, -6.2], 180); const C = cal(S, 'smile', [1.4, 0, -0.6], 180); allow(S, ['mara', 'shelf*'], ['cal', 'counter']);
    const ph = framedPhoto(S); ph.scale.setScalar(1.25); ph.position.set(2.2, 5.36, -8.9); ph.rotation.y = Math.PI - 0.25; const tg = tagCard(S, [['LOST:', 'one brother'], ['CLAIMED BY:', 'Mara']], { s: 0.3 }); const kf = fill(S, [3.4, 5.9, -8.7], 6, 0xffe6c8, 7); const cup = coffeeCup(S);
    return (t, dur) => { env.update(t); tg.position.set(3.85, 6.1, -8.0); tg.rotation.set(0, Math.PI, Math.sin(t * 1.5) * 0.12 + 0.05);
      A.pose(ps(idle(t, 0.6), hit([[0, { lFwd: 30, nod: 6 }], [dur * 0.3, { lFwd: 84, lUp: 10, nod: 8, lean: 6 }], [dur * 0.55, { lFwd: 82, lUp: 4, nod: 10, lean: 6 }], [dur * 0.85, { lFwd: 16, nod: 6, tilt: 6 }]], t))); A.setFace(t > dur * 0.6 ? 'relieved' : 'softsmile');
      C.pose(ps(idle(t, 1, 2), { rFwd: 96 + Math.sin(t * 1.6) * 14, rUp: -8 })); const h = pinky(C, 'R'); cup.position.set(h.x, h.y - 0.05, h.z - 0.1);
      camPath(cam, sm(t, 0, dur), [3.95, 5.8, -9.75], [3.7, 5.75, -9.6], [3.0, 5.0, -6.2], [3.0, 4.95, -6.2], 22, 23);
    };
  },
  // 62 "You have to go and get them."  — the whole office in morning light: Mara behind her counter, Cal at the end of it, they raise their coffees to each other; the camera drifts back and up past the clock and the LOST PROPERTY sign.
  //   Blocking: Mara left behind the counter turned 3/4 right, Cal right at the counter's end turned 3/4 left (same sides as in the cab). Pull back + crane up = the last look at her world.
  (S, cam) => {
    const env = hall(S, { time: 'morning', h: 9, m: 4 }); const A = mara(S, 'softsmile', [1.4, 0, -4.9], 46); const C = cal(S, 'smile', [5.5, 0, -2.3], -60); allow(S, ['cal', 'counter']); const c1 = coffeeCup(S), c2 = coffeeCup(S);
    return (t, dur) => { env.update(t); const c = dur * 0.3;
      A.pose(ps(idle(t, 1), anticipate(t, c), hit([[0, { lFwd: 60, lUp: 0 }], [c, { lFwd: 90, lUp: 26, turn: 6 }], [c + 0.5, { lFwd: 112, lUp: -6, nod: -8 }], [c + 1.1, { lFwd: 66, lUp: 8, tilt: 6 }]], t))); A.setFace(t > c + 0.9 ? 'laugh' : 'softsmile');
      C.pose(ps(idle(t, 1, 2), anticipate(t, c + 0.1), hit([[0, { rFwd: 50, rUp: 6 }], [c + 0.1, { rFwd: 90, rUp: 26, tilt: -5 }], [c + 0.6, { rFwd: 112, rUp: -6, nod: -8 }], [c + 1.2, { rFwd: 62, rUp: 8 }]], t))); C.setFace(t > c + 1.0 ? 'grin' : 'smile');
      const a = pinky(A, 'L'), b = pinky(C, 'R'); c1.position.set(a.x, a.y - 0.05, a.z + 0.15); c2.position.set(b.x, b.y - 0.05, b.z + 0.15);
      camPath(cam, sm(t, 0, dur), [3.7, 4.8, 8.6], [2.2, 6.6, 13.4], [3.5, 4.5, -3.6], [0.8, 6.0, -4], 24, 21);
    };
  },
];
