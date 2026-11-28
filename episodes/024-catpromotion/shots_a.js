// Episode 024 (My Cat Got My Promotion) — lines 2–26: the rule, the neighbour, the vet, the bag, floor forty.
import * as THREE from 'three';
import { POSES, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, lerpPose,
  ninaFlat, vetRoom, fortyLobby, swapFx, tunaCan, sugarCup, thermometer, briefcase, fishbowl, notePad } from '../../engine/kit.js';
import { nina, stone, vet, finch, cat, poodle, catBag, ps, ramp, sm, lerp, headOf, place, faceCam, allow, hold, hands, hn, shake, arc, look, CATSIT, PAWS, catIdle } from './common.js';

export const FT = [-6.2, 6.4, -6.1];   // the cat's spot on top of the fridge
const v3 = (p) => [p.x, p.y, p.z];
// something pushed off an edge: slides from `from` along dir (x, z) by dist between p0 and p1, tips over the edge and drops to floorY
export function pushOff(obj, t, p0, p1, from, dir, dist, floorY) { const sl = sm(t, p0, p1), u = Math.max(0, t - p1), d = sl * dist + Math.min(u, 0.3) * 1.5, drop = Math.max(0, u - 0.1), y = from[1] - drop * drop * 26, landed = y <= floorY;
  obj.position.set(from[0] + dir[0] * d, Math.max(floorY, y), from[2] + dir[1] * d); const sp = landed ? 0 : Math.min(u, 0.1) * 4 + drop * 9; obj.rotation.set(landed ? Math.PI / 2 : sp * dir[1], 0, landed ? 0.5 : -sp * dir[0]);
  return { sl, u, landed, landT: p1 + 0.1 + Math.sqrt(Math.max(0, from[1] - floorY) / 26) }; }
const CLIP = [['FIELD NOTES', '800 44px "Inter", sans-serif', '#6a3a9a', 66], ['patient: BEANS', '600 36px "Inter", sans-serif', '#1a2a4a', 56], ['sneezing', '700 50px "Comic Relief", cursive', '#1a2a4a', 64], ['VERY dramatic', '700 46px "Comic Relief", cursive', '#b01e1e', 60]];

export const SHOTS_A = [
  // 2 "Every time my cat sneezes, we swap bodies."
  //   Blocking: Beans sits on top of the fridge (screen left, high), Nina below-right holding a tuna can up to her, looking up. At 42 % the cat breathes in and sneezes: sparkle rings jump between the two heads,
  //   the faces swap (cat: sly → stunned, Nina: happy → catface) and Nina's arms drop into "paws". Camera: vertical two-shot, slow push, a jolt on the sneeze.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'sly', FT, 24); const N = nina(S, 'happy', [-2.3, 0, -3.2], -22); const can = tunaCan(S); const fx = swapFx(S);
    return (t, dur) => { env.update(t); const t0 = dur * 0.42, sn = C.sneeze(t, t0), sw = t > t0 + 0.05;
      C.setFace(sw ? 'stunned' : t > t0 - 0.42 ? 'whoa' : 'sly'); N.setFace(sw ? 'catface' : t > t0 - 0.3 ? 'eyebrow' : 'happy');
      C.update(t, 'sit', { nod: sn.nod + (sw ? -4 : 12), bob: sn.bob, turn: sw ? 18 - 40 * sm(t, t0 + 0.2, t0 + 0.6) : 18 });
      N.pose(ps(sw ? catIdle(t) : idle(t, 1), hit([[0, { rFwd: 96, rUp: -6, lUp: 6, nod: -10 }], [t0, { rFwd: 100, rUp: -6, lUp: 6, nod: -12 }], [t0 + 0.4, { ...PAWS, nod: -10 }]], t), look(lookAt(N, C.headPos()), 0.25)));
      hold(can, N, 'R', [0, -0.1, 0.2]); const ch = C.headPos(), nh = headOf(N); fx.update(t, t0, v3(ch), v3(nh)); env.keyAt(-3.5, 6, 2, 12);
      camPath(cam, sm(t, 0, dur), [-3.7, 4.4, 8.8], [-4.0, 4.8, 7.4], [-4.3, 5.1, -5], [-4.3, 5.3, -5], 21, 22); shake(cam, t, t0, 0.5); }; },
  // 3 "One sneeze, and I'm on the fridge, with a tail."
  //   Blocking: close on the cat (now Nina) on the fridge, 3/4. She looks back over her shoulder at her own lashing tail, then back to us, frazzled. Camera: close arc, easing back to show the tail.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'stunned', FT, 44);
    return (t, dur) => { env.update(t); const lk = sm(t, dur * 0.22, dur * 0.42) - sm(t, dur * 0.68, dur * 0.86); C.setFace(t < dur * 0.25 ? 'stunned' : t < dur * 0.7 ? 'whoa' : 'frazzled');
      C.update(t, 'sit', { turn: -lk * 66, nod: lk * 12, tail: 1 + lk * 5, bob: Math.sin(t * 30) * 0.01 }); const h = C.headPos(); env.keyAt(-3.6, 8.2, -1.5, 16);
      camPath(cam, sm(t, 0, dur), [-3.4, 8.3, 0.2], [-2.6, 8.1, 1.2], [h.x - 0.4, h.y - 0.9, h.z], [h.x - 0.5, h.y - 1.0, h.z], 34, 31); }; },
  // 4 "And she's down there, with my thumbs, opening tuna."
  //   Blocking: (a) the cat's high view from the fridge: Nina's body sits on the floor like a cat, turning a tuna can in both hands, staring up at us; (b) close: she drools and shoves her face into the can.
  (S, cam) => { const env = ninaFlat(S); const N = nina(S, 'catface', [0.5, -1.5, 1.0], -137); const can = tunaCan(S, true);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.48]); const eat = sm(t, dur * 0.56, dur * 0.8); N.setFace(t < dur * 0.48 ? 'catface' : 'drool');
      N.pose(ps(catIdle(t), { rLeg: 90, lLeg: 90, rFwd: lerp(72, 112, eat), lFwd: lerp(72, 112, eat), rUp: -16, lUp: -16, lean: 10, nod: lerp(-26, 8, eat) + Math.sin(t * 15) * 4 * eat }));
      const h = hands(N); can.position.set(h.x, h.y - 0.75 - eat * 0.25, h.z); can.rotation.set(eat * 0.3, t * 1.4 * (1 - eat), 0); const nh = headOf(N);
      env.sun.intensity = 170; if (k === 0) { env.keyAt(-2, 5, -1, 6); camPath(cam, lt, [-5.3, 9.0, -4.7], [-4.9, 8.6, -4.3], [0.4, 2.2, 0.9], [0.4, 2.5, 0.9], 26, 28); }
      else { env.keyAt(-2.4, 3.6, -1.8, 12); faceCam(cam, lt, v3(nh), -137, { dist: 6.6, lens: 36, side: 0.5, up: 0.4, push: 0.8, look: -0.5 }); } }; },
  // 5 "I'm Nina. I'm twenty-six."
  //   Blocking: Nina (herself) centre-right, a quick wave; Beans sits at her feet screen-left, looking up at her, then slyly at us. Camera: medium, short push.
  (S, cam) => { const env = ninaFlat(S); const N = nina(S, 'happy', [1.0, 0, -0.6], 4); const C = cat(S, 'catface', [-2.9, 0, 0.4], 26);
    return (t, dur) => { env.update(t); const w = 0.25; N.setFace(t < dur * 0.6 ? 'happy' : 'cheerful');
      N.pose(ps(idle(t, 1), anticipate(t, w), hit([[0, POSES.rest], [w, POSES.rest], [w + 0.3, { rUp: 150, lUp: 6, tilt: -8 }]], t), { rUp: t > w + 0.3 ? Math.sin(t * 14) * 10 : 0 }));
      C.update(t, 'sit', { turn: 30 - sm(t, dur * 0.55, dur * 0.8) * 50, nod: -14 + sm(t, dur * 0.55, dur * 0.8) * 12, tail: 2 }); C.setFace(t > dur * 0.6 ? 'sly' : 'catface'); env.keyAt(2, 5.4, 6, 12);
      camPath(cam, sm(t, 0, dur), [-0.4, 4.4, 12.6], [-0.5, 4.4, 11.4], [-0.7, 3.5, -0.4], [-0.7, 3.5, -0.4], 26, 27); }; },
  // 6 "And Friday is the biggest job interview of my life."
  //   Blocking: (a) insert on the fridge calendar (FRI: INTERVIEW!!), Beans loafing on the fridge edge above it, tail hanging into frame; (b) close on Nina: eager → a wince, fingers crossed.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'catface', [-6.3, 6.4, -6.5], 0); const N = nina(S, 'eager', [1.0, 0, -0.6], 4);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.46]); C.update(t, 'loaf', { tail: 3, nod: 14, turn: Math.sin(t * 1.4) * 12 }); N.setFace(lt < 0.5 ? 'eager' : 'wince');
      N.pose(ps(idle(t, 1), hit([[dur * 0.46, { rFwd: 30, lFwd: 30 }], [dur * 0.46 + 0.35, { rFwd: 104, lFwd: 104, rUp: -18, lUp: -18, nod: 6 }]], t)));
      if (k === 0) { env.keyAt(-5.4, 5.6, -2.5, 14); camPath(cam, lt, [-5.4, 6.0, 1.6], [-5.9, 6.0, 0.2], [-6.5, 6.0, -5.2], [-6.5, 6.0, -5.2], 36, 38); }
      else { const h = headOf(N); env.keyAt(2, 5.4, 6, 12); faceCam(cam, lt, v3(h), 4, { dist: 7.6, lens: 36, side: 0.7, up: 0.1, push: 0.9, look: -0.4 }); } }; },
  // 7 "Monday, my neighbor knocked, to borrow some sugar."
  //   Blocking: the front door swings open: Mr. Finch in the doorway holding out an empty cup, his tiny white dog at his feet. Nina over-the-shoulder at frame left, Beans on the floor at right watching the dog.
  //   Camera: OTS push toward the door.
  (S, cam) => { const env = ninaFlat(S); const N = nina(S, 'happy', [3.2, 0, -2.6], 158); const F = finch(S, 'cheerful', [7.2, 0, -9.4], 0); const cup = sugarCup(S); const P = poodle(S, [5.5, 0, -8.9], 20); const C = cat(S, 'suspicious', [6.6, 0, -3.2], 150);
    allow(S, ['finch', 'back wall']);
    return (t, dur) => { env.update(t); env.door.open(hn([[0.05, 0], [0.6, 1]], t)); F.setFace(t > dur * 0.6 ? 'happy' : 'cheerful');
      F.pose(ps(idle(t, 1), hit([[0.4, { rFwd: 30 }], [0.85, { rFwd: 84, rUp: -8, lUp: 20 }]], t), { nod: 4 })); hold(cup, F, 'R', [0, 0.05, 0.3]); P.update(t, 'wag');
      N.pose(ps(idle(t, 1), hit([[0.3, POSES.rest], [0.7, { lUp: 40, lFwd: 20 }]], t))); C.update(t, 'sit', { turn: -24, nod: -4, tail: 3 }); env.keyAt(6.5, 5, -5, 12);
      camPath(cam, sm(t, 0, dur), [3.4, 4.8, 6.5], [4.2, 4.6, 4.6], [6.6, 3.6, -8.6], [6.6, 3.7, -8.6], 26, 27); }; },
  // 8 "Beans sneezed."  — close on the cat from the doorway side: a breath in, the sneeze, sparkles; her face goes from suspicious to stunned (Nina just arrived in there).
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'whoa', [6.6, 0, -3.2], 168); const N = nina(S, 'happy', [3.2, 0, -2.6], 158); const fx = swapFx(S);
    return (t, dur) => { env.update(t); env.door.open(1); const t0 = 0.26, sn = C.sneeze(t, t0), sw = t > t0 + 0.05; C.setFace(sw ? 'stunned' : 'whoa'); C.update(t, 'sit', { nod: sn.nod, bob: sn.bob, tail: 3 });
      N.setFace(sw ? 'catface' : 'happy'); N.pose(ps(idle(t, 1), sw ? PAWS : { lUp: 40, lFwd: 20 })); const h = C.headPos(); fx.update(t, t0, v3(h), v3(h)); env.keyAt(7.4, 3.5, -6.5, 14);
      camPath(cam, sm(t, 0, dur), [7.5, 2.5, -7.5], [7.4, 2.6, -7.2], [h.x, h.y - 0.2, h.z], [h.x, h.y - 0.1, h.z], 30); shake(cam, t, t0, 0.6); }; },
  // 9 "From the floor, his tiny dog looked like a dinosaur."
  //   Blocking: the cat's eye view from the floorboards: the little dog right in front of the lens, barking down at us, Mr. Finch towering to the ceiling behind it. Camera: floor level, wide lens, creeping in, a jolt on every bark.
  (S, cam) => { const env = ninaFlat(S); const F = finch(S, 'cheerful', [7.4, 0, -9.4], 0); const cup = sugarCup(S); const P = poodle(S, [6.3, 0, -6.4], 10); allow(S, ['finch', 'back wall']);
    return (t, dur) => { env.update(t); env.door.open(1); P.update(t, 'bark'); F.pose(ps(idle(t, 1), { rFwd: 84, rUp: -8, nod: 24 })); hold(cup, F, 'R', [0, 0.05, 0.3]); env.keyAt(6.5, 1.6, -3.4, 10);
      camPath(cam, sm(t, 0, dur), [6.9, 0.8, -2.8], [6.8, 0.9, -3.6], [6.5, 2.0, -6.6], [6.5, 2.3, -6.6], 20, 19); [0.2, 0.5, 0.8].forEach(f => shake(cam, t, dur * f, 1.0)); }; },
  // 10 "And my body? It hissed at him."  — from the hall, through the door frame: Nina's body arches, arms out like claws, and hisses straight at us (catface → furious); the real Nina (the cat) cringes behind her.
  (S, cam) => { const env = ninaFlat(S); const N = nina(S, 'catface', [6.3, 0, -3.4], 176); const C = cat(S, 'stunned', [8.4, 0, 2.0], 176);
    return (t, dur) => { env.update(t); env.door.open(1); const h0 = dur * 0.36; N.setFace(t < h0 ? 'catface' : 'furious');
      N.pose(ps(catIdle(t), anticipate(t, h0), hit([[0, PAWS], [h0, PAWS], [h0 + 0.28, { rUp: 62, lUp: 62, rFwd: 44, lFwd: 44, lean: 22, nod: -12 }]], t), t > h0 ? { bob: Math.sin(t * 44) * 0.02, tilt: Math.sin(t * 40) * 2 } : {}));
      C.update(t, 'sit', { turn: 20, nod: -6 }); C.setFace(t > h0 + 0.25 ? 'appalled' : 'stunned'); env.keyAt(6.8, 5, -7.4, 18); env.hallL.intensity = 16;
      camPath(cam, sm(t, 0, dur), [7.0, 4.5, -12.5], [6.9, 4.6, -11.9], [6.6, 4.0, -3.4], [6.6, 4.1, -3.4], 22, 23); shake(cam, t, h0 + 0.1, 0.5); }; },
  // 11 "Then it rubbed its face on his knee."  — the doorway: Nina's body kneels against Mr. Finch's leg and rubs her cheek on it, eyes shut, blissful. He freezes (stunned → appalled), sugar cup tipping. The dog tilts its head.
  (S, cam) => { const env = ninaFlat(S); const F = finch(S, 'stunned', [7.7, 0, -8.9], -8); const cup = sugarCup(S); const P = poodle(S, [7.0, 0, -5.6], 150); const N = nina(S, 'beam', [5.4, -1.5, -8.6], 24);
    allow(S, ['nina', 'finch'], ['nina', 'back wall'], ['finch', 'back wall']);
    return (t, dur) => { env.update(t); env.door.open(1); const r = Math.sin(t * 6);
      N.pose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30, bodyTilt: -14 + r * 3, tilt: -24 + r * 12, nod: r * 6, turn: 14, bob: r * 0.03 });
      F.setFace(t < dur * 0.4 ? 'stunned' : 'appalled'); F.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 84, rUp: -8 }], [dur * 0.35, { rFwd: 96, rUp: 30, lUp: 44, lean: -8 }]], t), look(lookAt(F, [5.4, 2.5, -8.6]), 0.8)));
      hold(cup, F, 'R', [0, 0.05, 0.3]); cup.rotation.z = sm(t, dur * 0.3, dur * 0.6) * 0.9; P.update(t, 'tilt'); env.keyAt(6.5, 4.5, -5, 14);
      camPath(cam, sm(t, 0, dur), [6.2, 3.4, 2.4], [6.3, 3.2, 1.0], [6.5, 2.9, -8.6], [6.5, 2.8, -8.6], 28, 29); }; },
  // 12 "He's moving out in March."  — the real Nina (the cat) deadpan in the foreground, slowly closing her eyes; behind her, out of focus, Mr. Finch speed-walks away down the hall with the dog while her body washes a "paw".
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'flat', [4.2, 0, -1.6], 8); const N = nina(S, 'catface', [5.4, -1.5, -6.4], 30); const F = finch(S, 'appalled', [7.6, 0, -11.4], 90); const P = poodle(S, [8.6, 0, -9.3], 90);
    return (t, dur) => { env.update(t); env.door.open(1); const go = sm(t, dur * 0.1, dur * 0.85); F.root.position.x = lerp(7.4, 13.5, go); F.pose(ps(walk(t, 1.4, 32), { turn: -70, rUp: 20 })); P.root.position.x = lerp(8.6, 14.5, sm(t, dur * 0.2, dur)); P.update(t, 'run');
      N.pose(ps(CATSIT, { rFwd: 124, rUp: 14, nod: 12 + Math.sin(t * 9) * 6, tilt: 8 })); C.setFace(t < dur * 0.55 ? 'flat' : 'exhausted'); C.update(t, 'sit', { nod: sm(t, dur * 0.55, dur * 0.85) * 12 });
      const h = C.headPos(); env.keyAt(4.8, 3.6, 2.4, 6); camPath(cam, sm(t, 0, dur), [5.0, 2.7, 4.6], [4.8, 2.7, 3.9], [h.x + 0.6, h.y - 0.2, h.z], [h.x + 0.5, h.y - 0.2, h.z], 32); }; },
  // 13 "Wednesday, at the vet, she sneezed again."
  //   Blocking: exam room wide. Beans on the steel table, Dr. Moon (goth, deadpan) behind it, Nina at the right with a hand on the cat. Sneeze at 55 %: sparkles between cat and Nina, faces swap. Camera: wide, slow push, jolt.
  (S, cam) => { const env = vetRoom(S); const C = cat(S, 'grumpy', [0.2, 3.05, -2.3], 40); const Vt = vet(S, 'flat', [-2.7, 0, -5.2], 14); const N = nina(S, 'happy', [4.3, 0, -2.6], -62); const fx = swapFx(S);
    return (t, dur) => { env.update(t); const t0 = dur * 0.55, sn = C.sneeze(t, t0), sw = t > t0 + 0.05; C.setFace(sw ? 'stunned' : t > t0 - 0.42 ? 'whoa' : 'grumpy'); C.update(t, 'sit', { nod: sn.nod, bob: sn.bob, turn: sw ? -20 : 10 });
      N.setFace(sw ? 'catface' : 'happy'); N.pose(ps(sw ? catIdle(t) : idle(t, 1), hit([[0, { rFwd: 100, rUp: -10 }], [t0, { rFwd: 104, rUp: -10 }], [t0 + 0.35, { ...PAWS, rFwd: 104, lFwd: 96 }]], t), look(lookAt(N, C.headPos()), 0.6)));
      Vt.pose(ps(idle(t, 1), { rUp: 20, lUp: 20, rFwd: 30, lFwd: 30 }, look(lookAt(Vt, C.headPos()), 0.6))); Vt.setFace(sw ? 'eyebrow' : 'flat');
      const ch = C.headPos(), nh = headOf(N); fx.update(t, t0, v3(ch), v3(nh)); env.keyAt(2, 6, 4, 12);
      camPath(cam, sm(t, 0, dur), [0.6, 4.4, 11.8], [0.5, 4.4, 11.0], [0.5, 3.9, -3], [0.5, 3.9, -3], 21, 21.5); shake(cam, t, t0, 0.5); }; },
  // 14 "So now I'm the one on the cold steel table."  — low close on the cat under the exam lamp: she looks down at the table, lifts one cold paw, then the other, then up at the vet. Camera: low push-in.
  (S, cam) => { const env = vetRoom(S); const C = cat(S, 'appalled', [0.2, 3.05, -2.3], 18); const Vt = vet(S, 'flat', [-1.8, 0, -5.5], 10);
    return (t, dur) => { env.update(t); const lift = Math.sin(t * 7), up = sm(t, dur * 0.55, dur * 0.75); C.setFace(t < dur * 0.55 ? 'appalled' : 'frazzled');
      C.update(t, 'sit', { nod: 16 - up * 26, pawR: Math.max(0, lift) * 0.32, pawL: Math.max(0, -lift) * 0.32, turn: Math.sin(t * 3) * 12 * (1 - up) - up * 24, tail: 3 });
      Vt.pose(ps(idle(t, 1), { rUp: 20, lUp: 20 })); const h = C.headPos(); env.exam.intensity = 55; env.keyAt(1.4, 4.4, 2, 5);
      camPath(cam, sm(t, 0, dur), [1.9, 3.5, 4.2], [1.4, 3.7, 3.0], [h.x, h.y - 0.6, h.z], [h.x, h.y - 0.5, h.z], 34, 36); }; },
  // 15 "And the vet is holding a thermometer."  — the cat's view up at Dr. Moon, lamp halo behind her head: she raises the thermometer into frame, deadpan, then one eyebrow.
  (S, cam) => { const env = vetRoom(S); const Vt = vet(S, 'flat', [-0.3, 0, -5.9], 0); const th = thermometer(S); th.scale.setScalar(1.25);
    return (t, dur) => { env.update(t); const up = dur * 0.26; Vt.setFace(t < dur * 0.62 ? 'flat' : 'eyebrow');
      Vt.pose(ps(idle(t, 0.7), anticipate(t, up), hit([[0, { rFwd: 20, rUp: 8 }], [up, { rFwd: 20, rUp: 8 }], [up + 0.4, { rFwd: 116, rUp: 24 }]], t), { nod: 16 }));
      const h = headOf(Vt); const ry = sm(t, up, up + 0.4); th.position.set(h.x + 0.62, h.y - 2.0 + ry * 1.5, h.z + 1.3); th.rotation.set(-1.35, 0.1, Math.sin(t * 9) * 0.05); env.keyAt(0.6, 3.6, -2.6, 9);
      camPath(cam, sm(t, 0, dur), [0.8, 3.5, -0.9], [0.6, 3.6, -1.5], [h.x - 0.3, h.y - 0.4, h.z], [h.x - 0.2, h.y - 0.3, h.z], 24, 27); }; },
  // 16 "Hold still, Beans," she said.  — side two-shot: the cat backs along the table toward us in terror, tail lashing; the vet leans in over the table with the thermometer, talking.
  (S, cam) => { const env = vetRoom(S); const C = cat(S, 'terror', [0.9, 3.05, -2.0], 62); const Vt = vet(S, 'flat', [-0.9, 0, -5.8], 16); const th = thermometer(S); allow(S, ['vet', 'exam table']);
    return (t, dur) => { env.update(t); const back = sm(t, 0, dur); C.root.position.z = -2.0 + back * 0.35; C.update(t, 'sit', { turn: -6, nod: -6, bob: Math.sin(t * 38) * 0.015, tail: 5 });
      Vt.pose(ps(idle(t, 0.6), talk(t), { rFwd: 76 + back * 8, rUp: -4, lean: 6 + back * 8, lUp: 14 }, look(lookAt(Vt, C.headPos()), 0.7)));
      const p = pinky(Vt, 'R'); th.position.set(p.x, p.y + 0.05, p.z); th.rotation.set(-0.15, 16 * D + 0.2, 0); env.keyAt(5, 5, 0, 12);
      camPath(cam, sm(t, 0, dur), [7.0, 4.6, 1.8], [6.3, 4.5, 1.3], [-0.1, 4.2, -3.8], [0, 4.2, -3.8], 26, 27); }; },
  // 17 "I did not hold still."  — the cat launches off the table in a spinning arc and lands flat on the vet's head like a hat (thermometer flies away). Camera: medium, whip up with the jump, jolt on the landing.
  (S, cam) => { const env = vetRoom(S); const C = cat(S, 'terror', [0.9, 3.05, -1.65], 62); const Vt = vet(S, 'flat', [-0.9, 0, -5.8], 10); const th = thermometer(S); allow(S, ['beans', 'vet'], ['vet', 'exam table']);
    return (t, dur) => { env.update(t); const land = dur * 0.55, u = sm(t, 0.08, land), on = t >= land; const p = arc([0.9, 3.05, -1.65], [-1.06, 5.3, -6.7], 2.4, u);
      C.root.position.set(...p); C.root.rotation.set(on ? 0 : -Math.sin(u * Math.PI) * 0.7, lerp(62, 370, u) * D, 0); C.update(t, on ? 'loaf' : 'run', { tail: 6, nod: on ? 16 : 0, bob: on ? Math.exp(-(t - land) * 9) * -0.2 : 0 }); C.setFace(on ? 'frazzled' : 'terror');
      Vt.setFace(on ? 'unimpressed' : 'stunned'); Vt.pose(ps(idle(t, 0.5), hit([[0, { rFwd: 84, lean: 14 }], [0.25, { rFwd: 30, rUp: 44, lUp: 44, lean: -8, nod: -10 }], [land, { rUp: 30, lUp: 30, nod: -4 }], [land + 0.2, { rUp: 12, lUp: 12, nod: 6, bob: -0.14 }]], t)));
      const tp = arc([-0.5, 4.1, -3.9], [-4.5, 0.2, -1.5], 4.5, sm(t, 0.1, dur * 0.9)); th.position.set(...tp); th.rotation.set(t * 14, t * 9, 0); env.keyAt(0, 6, 2, 12);
      camPath(cam, sm(t, 0, dur), [1.2, 4.6, 8.4], [0.4, 5.4, 6.4], [-0.2, 4.6, -4.2], [-0.8, 5.4, -5.6], 26, 28); shake(cam, t, land, 1); }; },
  // 18 "My body sat in the corner, purring at a goldfish."  — profile: Nina's body sits on the floor like a cat, nose to the goldfish bowl, head following the fish, one "paw" tapping the glass; pupils go huge.
  (S, cam) => { const env = vetRoom(S); const N = nina(S, 'catface', [2.5, -1.5, -4.6], 90); const fb = fishbowl(S, [6.2, 2.2, -4.6], 0.95);
    return (t, dur) => { env.update(t); fb.update(t, 1); const tap = Math.max(0, Math.sin(t * 7)); N.setFace(t < dur * 0.5 ? 'catface' : 'bugeyes');
      N.pose({ rLeg: 90, lLeg: 90, lFwd: 40, lUp: -8, rFwd: 74 + tap * 20, rUp: -4, lean: 26, nod: -8, turn: -42 + Math.sin(t * 2.4) * 8, tilt: Math.sin(t * 2.4 + 1) * 8, bob: Math.sin(t * 22) * 0.012 });
      env.keyAt(4.4, 3.6, 0, 14); camPath(cam, sm(t, 0, dur), [4.2, 3.3, 5.6], [4.5, 3.2, 4.4], [4.5, 2.7, -4.6], [4.6, 2.7, -4.6], 30, 32); }; },
  // 19 "It's allergies," said the vet. "Just keep her calm."  — (a) Dr. Moon writes on her clipboard, completely deadpan, with the cat still sitting on her head; (b) close on the cat up there: unimpressed, a slow look into the lens.
  (S, cam) => { const env = vetRoom(S); const Vt = vet(S, 'flat', [-0.9, 0, -5.8], 10); const C = cat(S, 'frazzled', [-1.06, 5.3, -6.7], 10); const pad = notePad(S, CLIP, 1.0); allow(S, ['beans', 'vet']);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.62]); Vt.pose(ps(idle(t, 0.5), talk(t, 0.8), { rFwd: 64, rUp: -16, lFwd: 58, lUp: -16, nod: k ? 0 : 6 }));
      const h2 = hands(Vt); pad.position.set(h2.x, h2.y + 0.5, h2.z + 0.1); pad.rotation.set(-0.5, 10 * D, 0); C.update(t, 'loaf', { nod: 16, tail: 4, turn: k ? sm(lt, 0.2, 0.7) * -18 : Math.sin(t * 1.5) * 10 }); C.setFace(k ? 'unimpressed' : 'frazzled');
      const h = headOf(Vt); env.keyAt(0, 5.6, 0, 10);
      if (k === 0) camPath(cam, lt, [0.6, 5.6, 6.6], [0.3, 5.6, 5.8], [h.x, h.y + 0.5, h.z], [h.x, h.y + 0.55, h.z], 30, 31);
      else { const ch = C.headPos(); camPath(cam, lt, [0.6, 6.6, 0.6], [0.3, 6.7, 0.0], [ch.x, ch.y - 0.2, ch.z], [ch.x, ch.y - 0.15, ch.z], 38); } }; },
  // 20 "Friday. I couldn't leave her home alone."
  //   Blocking: Nina in her interview blazer, briefcase in hand, points a warning finger up at Beans — who slowly pushes a tuna can off the fridge while holding eye contact (plants the move). The can drops; Nina winces.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'sly', [-6.2, 6.4, -6.7], 24); const N = nina(S, 'stern', [-2.2, 0, -3.2], -40, true); const can = tunaCan(S); const bc = briefcase(S);
    return (t, dur) => { env.update(t); const p0 = dur * 0.18, p1 = dur * 0.62; const r = pushOff(can, t, p0, p1, [-5.32, 6.4, -5.67], [0.41, 0.91], 0.72, 0.18);
      C.root.position.z = -6.7 + r.sl * 0.22; C.update(t, 'sit', { pawL: sm(t, 0, p0) * (1 - sm(t, p1 + 0.1, p1 + 0.4)), pawAng: 0.44 + r.sl * 0.3, pawLen: 0, nod: 14, turn: 16, tail: 3 }); C.setFace(t < p1 ? 'sly' : 'smug');
      N.setFace(t < p1 ? 'stern' : t < r.landT ? 'gasp' : 'wince'); N.pose(ps(idle(t, 0.8), hit([[0, { rFwd: 118, rUp: 6, nod: -14 }], [p1, { rFwd: 122, rUp: 6, nod: -14 }], [p1 + 0.25, { rFwd: 60, rUp: 30, lean: -6, nod: -4 }], [r.landT, { rFwd: 30, rUp: 20, nod: 10 }], [r.landT + 0.2, { rFwd: 30, rUp: 20, nod: 18, bob: -0.1 }]], t)));
      const lp = pinky(N, 'L'); bc.position.set(lp.x, lp.y, lp.z); bc.rotation.y = -40 * D + Math.PI / 2; env.keyAt(-3.5, 6, 2, 12);
      camPath(cam, sm(t, 0, dur), [-3.7, 4.4, 8.8], [-3.9, 4.6, 7.6], [-4.3, 4.6, -5], [-4.3, 4.5, -5], 22, 23); shake(cam, t, r.landT, 0.4); }; },
  // 21 "So I zipped her in my bag. Floor forty."
  //   Blocking: (a) the flat: Beans sits in the open pet tote; Nina presses her grumpy head down into it; (b) floor 40: the lift doors slide open on Nina, clutching the bag in both hands, the cat's ears just over the rim.
  (S, cam) => { const G1 = new THREE.Group(), G2 = new THREE.Group(); S.add(G1, G2); const e1 = ninaFlat(G1), e2 = fortyLobby(G2); const N = nina(S, 'stern', [0.9, 0, -0.9], -38, true); const B = catBag(S, 'grumpy'); allow(S, ['nina', 'beans']);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.45]); G1.visible = k === 0; G2.visible = k === 1; S.background = (k ? G2 : G1).background || S.background;
      if (k === 0) { e1.update(t); const dn = sm(lt, 0.3, 0.75); place(N, 0.9, 0, -0.9, -38); N.setFace('stern'); N.pose(ps(idle(t, 0.6), { lean: 22 + dn * 10, rFwd: 58 - dn * 14, rUp: -8, nod: 14 })); B.up = -dn * 1.15; B.at(-0.6, 0, 0.9, 20); B.cat.setFace('grumpy'); B.cat.update(t, 'sit', { nod: -10, tilt: Math.sin(t * 9) * 3 });
        e1.keyAt(0, 4, 5, 12); camPath(cam, lt, [-0.6, 2.8, 9.0], [-0.5, 2.6, 7.6], [0, 2.6, 0], [0, 2.5, 0], 26, 27); return; }
      e2.update(t); const op = sm(lt, 0.05, 0.45), wk = sm(lt, 0.4, 1.0); e2.lift(op); place(N, -4.8, 0, lerp(-8.5, -5.4, wk), 0); N.setFace(lt < 0.5 ? 'wince' : 'eager'); N.pose(ps(idle(t, 0.5), wk > 0 && wk < 1 ? { rLeg: Math.sin(t * 9) * 26, lLeg: -Math.sin(t * 9) * 26, bob: Math.abs(Math.cos(t * 9)) * 0.1 } : {}, { rFwd: 55, lFwd: 55, rUp: -12, lUp: -12 }));
      const h = hands(N); B.up = -0.45; B.at(h.x, h.y - 2.9, h.z + 0.25, 0); B.cat.setFace('grumpy'); B.cat.update(t, 'sit', { nod: -8 }); e2.keyAt(-4, 5, -1, 14);
      camPath(cam, lt, [-1.0, 4.6, 7.4], [-1.6, 4.5, 6.0], [-4.8, 4.2, -7], [-4.8, 4.1, -7], 24, 25); }; },
  // 22 "Mrs. Stone has fired people for blinking."  — (a) insert: the framed sign, DAYS SINCE LAST FIRING: 0; (b) Nina on the bench, rigid, eyes wide, not blinking, the bag at her feet with Beans peeking out.
  (S, cam) => { const env = fortyLobby(S); S.userData.faceAnim = false; const N = nina(S, 'blank', [-1.4, 0.2, -5.3], 0, true); const B = catBag(S, 'suspicious'); allow(S, ['nina', 'bench']);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.42]); N.pose({ rLeg: 90, lLeg: 90, rFwd: 52, lFwd: 52, bob: Math.sin(t * 30) * 0.008, tilt: Math.sin(t * 1.3) * 1 }); B.at(1.5, 0, -3.2, -12); B.cat.update(t, 'sit', { turn: -34, nod: -10, tilt: Math.sin(t * 2) * 5 });
      if (k === 0) { env.keyAt(0.8, 5.4, -4, 10); camPath(cam, lt, [0.3, 5.3, 1.8], [0.6, 5.4, 0.2], [0.8, 5.4, -6.95], [0.8, 5.4, -6.95], 40, 42); }
      else { env.keyAt(0, 4.4, 0, 14); camPath(cam, lt, [1.0, 3.6, 7.6], [0.6, 3.5, 6.6], [0.2, 3.2, -4.6], [0.1, 3.2, -4.6], 26, 27); } }; },
  // 23 "Come in," she said. I stood up.  — wide: the frosted door swings open, warm light; Mrs. Stone in the doorway, long platinum hair, not smiling. Nina shoots to her feet (gasp → eager).
  (S, cam) => { const env = fortyLobby(S); const N = nina(S, 'blank', [-1.4, 0.2, -5.3], 0, true); const St = stone(S, 'stern', [4.5, 0, -8.7], -22); const B = catBag(S, 'suspicious'); allow(S, ['nina', 'bench'], ['stone', 'back wall']);
    return (t, dur) => { env.update(t); env.door.open(hn([[0, 0.1], [0.45, 1]], t)); const up = dur * 0.5, st = sm(t, up, up + 0.35); place(N, -1.4, 0.2 * (1 - st), -5.3 + st * 1.7);
      N.setFace(t < 0.3 ? 'blank' : t < up ? 'gasp' : 'eager'); N.pose(ps(lerpPose({ rLeg: 90, lLeg: 90, rFwd: 52, lFwd: 52 }, { rUp: 8, lUp: 8 }, st), anticipate(t, up), look(lookAt(N, headOf(St)), 0.5), { bob: Math.sin(Math.min(1, st) * Math.PI) * 0.25 }));
      St.setFace(t < dur * 0.6 ? 'stern' : 'eyebrow'); St.pose(ps(idle(t, 0.6), t < dur * 0.55 ? talk(t) : {}, POSES.hips, look(lookAt(St, headOf(N)), 0.45))); B.at(1.5, 0, -3.2, -12); B.cat.update(t, 'sit', { turn: 20, nod: -12 });
      env.keyAt(3.6, 5, -5.6, 16); camPath(cam, sm(t, 0, dur), [0.8, 4.4, 9.8], [1.2, 4.4, 8.8], [1.6, 3.9, -6], [1.7, 3.9, -6], 22, 23); }; },
  // 24 "And from inside my bag, I heard a tiny sneeze."  — low close on the tote: the cat's head rises over the rim, nose twitching, breath in… sneeze. Sparkles. Nina's legs behind, out of focus, frozen mid-step.
  (S, cam) => { const env = fortyLobby(S); const N = nina(S, 'eager', [-1.4, 0, -3.6], 62, true); const B = catBag(S, 'suspicious'); const fx = swapFx(S);
    return (t, dur) => { env.update(t); env.door.open(1); const t0 = dur * 0.62, sn = B.cat.sneeze(t, t0), sw = t > t0 + 0.05; B.up = -0.6 + sm(t, 0, dur * 0.3) * 0.6; B.at(1.5, 0, -3.2, -12);
      B.cat.setFace(sw ? 'stunned' : t > t0 - 0.5 ? 'whoa' : 'suspicious'); B.cat.update(t, 'sit', { nod: sn.nod, bob: sn.bob, tilt: Math.sin(t * 16) * 2 * (1 - sn.k) });
      N.setFace(sw ? 'catface' : 'eager'); N.pose(ps(idle(t, 1), sw ? PAWS : { rLeg: 20, lLeg: -14 })); const h = B.cat.headPos(); fx.update(t, t0, v3(h), v3(h)); env.keyAt(3.0, 3, -0.6, 12);
      camPath(cam, sm(t, 0, dur), [3.3, 2.3, 1.2], [3.0, 2.5, 0.4], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.2, h.z], 34); shake(cam, t, t0, 0.5); }; },
  // 25 "Now I was in the bag."  — straight down into the tote: the cat (Nina) stares up at us, appalled, head whipping left and right.
  (S, cam) => { const env = fortyLobby(S); const B = catBag(S, 'appalled');
    return (t, dur) => { env.update(t); env.door.open(1); B.at(1.5, 0, -3.2, -12); B.cat.setFace(t < dur * 0.4 ? 'stunned' : 'appalled'); B.cat.update(t, 'sit', { nod: -26, turn: Math.sin(t * 9) * 26 }); const h = B.cat.headPos(); env.keyAt(2.6, 4.6, -1.6, 14);
      camPath(cam, sm(t, 0, dur), [2.7, 4.9, -0.2], [2.6, 4.6, -0.6], [h.x, h.y - 0.1, h.z], [h.x, h.y - 0.1, h.z], 32, 34); }; },
  // 26 "And my body walked into that office, with a cat driving."
  //   Blocking: wide: Nina's body slinks across the lobby on tip-toe, paws up, hips swaying, and through the glowing door; the bag hops along the floor after her, the real Nina inside. Camera: pan right with the walk.
  (S, cam) => { const env = fortyLobby(S); const N = nina(S, 'catface', [-1.0, 0, -0.8], 80, true); const B = catBag(S, 'appalled'); allow(S, ['nina', 'back wall']);
    const path = (u) => u < 0.5 ? [lerp(-1.0, 4.7, u / 0.5), lerp(-0.8, 0.2, u / 0.5)] : [4.7, lerp(0.2, -9.6, (u - 0.5) / 0.5)];
    return (t, dur) => { env.update(t); env.door.open(1); const u = ramp(t, 0.1, dur * 0.95), [x, z] = path(u), tu = sm(u, 0.42, 0.58); place(N, x, 0, z, lerp(80, 180, tu));
      N.pose(ps(walk(t, 0.9, 22), { ...PAWS, rFwd: 62 + Math.sin(t * 7.2) * 10, lFwd: 62 - Math.sin(t * 7.2) * 10, bodyTilt: Math.sin(t * 7.2) * 5, tilt: Math.sin(t * 3.6) * 8, bob: 0.12, turn: -42 * (1 - tu) }));
      const ub = sm(u, 0.76, 1.0), hop = ub > 0 && ub < 1 ? Math.abs(Math.sin(t * 11)) * 0.5 : 0; B.at(lerp(1.5, 4.6, ub), hop, lerp(-3.2, -5.6, ub), -12 + hop * 14);
      B.cat.setFace(u > 0.3 ? 'frazzled' : 'appalled'); B.cat.update(t, 'sit', { turn: 30, nod: -6 }); env.keyAt(3, 5, -2, 14);
      camPath(cam, sm(t, 0, dur), [0.4, 4.6, 9.8], [1.8, 4.4, 8.8], [1.4, 3.6, -5], [3.4, 3.6, -6.4], 22, 23); }; },
];
