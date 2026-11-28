// Episode 024 (My Cat Got My Promotion) — lines 27–61: the interview, the pepper, the week as a cat, the push.
import * as THREE from 'three';
import { POSES, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, lerpPose,
  ninaFlat, stoneOffice, OFFICE, swapFx, tunaCan, deskMug, laserDot, briefcase, pepperShaker, notePad, textTex24 } from '../../engine/kit.js';
import { nina, stone, dev, cat, catBag, ps, ramp, sm, lerp, headOf, place, faceCam, allow, hold, hands, hn, shake, arc, look, CATSIT, PAWS, catIdle, clamp01 } from './common.js';
import { pushOff } from './shots_a.js';

const v3 = (p) => [p.x, p.y, p.z];
const STP = [-3.4, 0, -3.6];                              // Mrs. Stone's mark (faces 62°)
const F62 = [-Math.sin(62 * D), Math.cos(62 * D)];        // the way Nina's body faces across the desk
// reaching for the mug with one finger: r = the reach, s = the extra lean while pushing
const REACH = (r, s = 0) => ({ lFwd: 30, lUp: 4, rFwd: lerp(102, 108, r), rUp: lerp(-10, -4, r) - s * 40, lean: 8 + r * 6, nod: -4, tilt: 14 });
// Nina's body at the desk, placed so her fully reached finger ends just short of the mug's start (continuity for lines 27–32)
// (the finger sweeps the mug toward the camera end of the desk: REACH(1, 0) → REACH(1, 1))
function officeNina(S, face) { const N = nina(S, face, [2.6, 0, -3.0], -62, true); N.pose(REACH(1, 1)); let pB = pinky(N, 'R'); N.root.position.x += 0.82 - pB.x; N.root.position.z += -1.62 - pB.z; N.x0 = N.root.position.x; N.z0 = N.root.position.z;
  pB = pinky(N, 'R'); N.pose(REACH(1, 0)); const pA = pinky(N, 'R'), d = [pB.x - pA.x, pB.z - pA.z], L = Math.hypot(d[0], d[1]); N.dir = [d[0] / L, d[1] / L]; N.mug = [pA.x + N.dir[0] * 0.34, 3.0, pA.z + N.dir[1] * 0.34]; N.L = L + 0.2; N.pose(OPAWS); return N; }
const OPAWS = { ...PAWS, rFwd: 102, lFwd: 30, lUp: 4 };   // paws held a little higher next to the desk
const sitDesk = (N, z = -3.3) => place(N, 0, 1.5, z, 0);
const CURL = { rLeg: 90, lLeg: 90, lean: 58, nod: 26, rFwd: 100, lFwd: 100, rUp: -30, lUp: -30, tilt: 14 };
const BAG = [5.4, 0, 3.4];
const FRIDGE = [-6.2, 6.4, -6.7], SHK = [-5.32, 6.4, -5.67], PDIR = [0.41, 0.91];
const VP = [['VICE PRESIDENT', '900 58px "Inter", sans-serif', '#3a2212', 84]];
// the laser dot on the presentation screen: u (−1..1 across), v (−1..1 up)
const onScreen = (u, v) => { const c = OFFICE.screen, a = 0.5; return [c[0] + Math.cos(a) * u * 2.6 + Math.sin(a) * 0.16, c[1] + v * 1.6, c[2] - Math.sin(a) * u * 2.6 + Math.cos(a) * 0.16]; };
// Nina's body dragging itself along the floor, face up toward the lens
const CRAWL = (t) => ({ rUp: 150 + Math.sin(t * 5) * 14, lUp: 150 - Math.sin(t * 5) * 14, nod: -50, turn: 30, rLeg: Math.sin(t * 5) * 6, lLeg: -Math.sin(t * 5) * 6, tilt: Math.sin(t * 2.5) * 6 });

export const SHOTS_B = [
  // 27 "So," said Mrs. Stone. "Why should I hire you?"
  //   Blocking: corner office, skyline behind. Desk end-on in the middle; Mrs. Stone left of it (hands on hips, talking), Nina's body right of it, paws up, head tilted. The bag with the real Nina peeking sits front-right.
  //   Camera: two-shot, slow push (her office, her rules).
  (S, cam) => { const env = stoneOffice(S); const St = stone(S, 'stern', STP, 62); const N = officeNina(S, 'catface'); const B = catBag(S, 'appalled'); const mug = deskMug(S);
    return (t, dur) => { env.update(t); mug.position.set(...N.mug); B.at(...BAG, -30); B.cat.update(t, 'sit', { turn: -24, nod: -8 });
      St.pose(ps(idle(t, 0.8), talk(t), POSES.hips, look(lookAt(St, headOf(N)), 0.45))); St.setFace(t < dur * 0.5 ? 'stern' : 'eyebrow'); N.pose(ps(catIdle(t), OPAWS, look(lookAt(N, headOf(St)), 0.45)));
      env.keyAt(0, 6, 6, 18); camPath(cam, sm(t, 0, dur), [0.5, 4.4, 14.2], [0.2, 4.3, 12.8], [-0.3, 3.7, -3.5], [-0.3, 3.7, -3.5], 25, 26); }; },
  // 28 "My body said nothing. It just stared."  — close on Nina's face with the cat behind it: wide dead stare, no blink, the head tilting slowly. Camera: push in.
  (S, cam) => { const env = stoneOffice(S); S.userData.faceAnim = false; const N = officeNina(S, 'blank');
    return (t, dur) => { env.update(t); N.pose({ ...OPAWS, tilt: sm(t, dur * 0.25, dur * 0.9) * 16, bob: Math.sin(t * 2.4) * 0.02 }); const h = headOf(N); env.keyAt(0.5, 5, 0.5, 14);
      faceCam(cam, sm(t, 0, dur), v3(h), -62, { dist: 7.6, lens: 38, side: 1.6, up: 0.1, push: 1.5, look: -0.2 }); }; },
  // 29 "It did not blink. For a full minute."  — (a) Mrs. Stone leans in, stares back… and blinks first (stern → suspicious → whoa); (b) extreme close: the stare has not moved.
  (S, cam) => { const env = stoneOffice(S); S.userData.faceAnim = false; const St = stone(S, 'stern', STP, 62); const N = officeNina(S, 'blank');
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.58]); N.pose({ ...OPAWS, tilt: 16 }); const bl = k === 0 && lt > 0.66 && lt < 0.8;
      St.setFace(k === 0 && lt < 0.36 ? 'stern' : k === 0 && lt < 0.8 ? 'suspicious' : 'whoa'); St.anim(bl ? 1 : 0, 0); St.pose({ rUp: 28, lUp: 28, rFwd: -8, lFwd: -8, lean: sm(lt, 0, 0.6) * 12, bob: Math.sin(t * 2.4) * 0.02, nod: bl ? 6 : 0 });
      if (k === 0) { const h = headOf(St); env.keyAt(-0.5, 5, 0.5, 14); faceCam(cam, lt, v3(h), 62, { dist: 7.6, lens: 36, side: -1.5, up: 0.1, push: 1.0, look: -0.2 }); }
      else { const h = headOf(N); env.keyAt(0.5, 5, 0.5, 14); faceCam(cam, lt, v3(h), -62, { dist: 5.4, lens: 44, side: 0.9, up: 0, push: 0.5, look: -0.1 }); } }; },
  // 30 "Then it reached out, with one finger."  — over the desk: the #1 BOSS mug in the foreground, Nina's arm sliding into frame toward it while her eyes stay locked on Mrs. Stone. Camera: low push toward the mug.
  (S, cam) => { const env = stoneOffice(S); S.userData.faceAnim = false; const N = officeNina(S, 'blank'); const St = stone(S, 'suspicious', STP, 62); const mug = deskMug(S);
    return (t, dur) => { env.update(t); mug.position.set(...N.mug); const r = sm(t, dur * 0.08, dur * 0.92); N.pose(REACH(r)); St.pose(ps({ rUp: 28, lUp: 28, lean: 10 }, look(lookAt(St, N.mug), r * 0.6))); St.setFace(r > 0.6 ? 'eyebrow' : 'suspicious');
      env.keyAt(0.5, 4.6, 2, 14); camPath(cam, sm(t, 0, dur), [-1.2, 3.9, 2.6], [-0.8, 3.8, 1.6], [N.mug[0] + 0.5, 3.6, N.mug[2]], [N.mug[0] + 0.7, 3.7, N.mug[2]], 30, 32); }; },
  // 31 "And pushed her coffee off the desk. Slowly."
  //   Blocking: (a) close: the finger pushes the mug across the desk, a centimetre at a time, to the edge; (b) two-shot: it tips, drops and splashes at Mrs. Stone's feet — she jumps back, stunned; Nina's body, smug, licks the finger.
  (S, cam) => { const env = stoneOffice(S); const N = officeNina(S, 'blank'); const St = stone(S, 'eyebrow', STP, 62); const mug = deskMug(S);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.6]); const p0 = dur * 0.04, p1 = dur * 0.6;
      const r = pushOff(mug, t, p0, p1, N.mug, N.dir, N.L, 0.02); const back = sm(t, p1 + 0.15, p1 + 0.55);
      N.pose(ps(lerpPose(REACH(1, r.sl), { ...PAWS, rFwd: 124, rUp: 12, nod: 10 }, back), back > 0.9 ? { nod: Math.sin(t * 10) * 5 } : {})); N.setFace(t < p1 ? 'blank' : 'smug'); mug.userData.spill(r.landed ? sm(t, r.landT, r.landT + 0.3) : 0, mug.position.x - 0.5, mug.position.z + 0.3);
      St.setFace(t < p1 ? 'eyebrow' : t < r.landT ? 'gasp' : 'stunned'); St.pose(ps(idle(t, 0.5), hit([[0, { rUp: 28, lUp: 28, lean: 10 }], [p1, { rUp: 28, lUp: 28, lean: 14, nod: 14 }], [r.landT, { rUp: 40, lUp: 40, nod: 20 }], [r.landT + 0.2, { rUp: 60, lUp: 60, rFwd: 30, lFwd: 30, lean: -10, nod: 16 }]], t), { bob: t > r.landT ? Math.sin(clamp01((t - r.landT) / 0.3) * Math.PI) * 0.5 : 0 }));
      if (k === 0) { env.keyAt(0, 4.6, 2, 14); camPath(cam, lt, [-1.6, 3.9, 2.2], [-1.8, 3.8, 2.0], [mug.position.x + 0.3, 3.5, mug.position.z - 0.4], [mug.position.x + 0.2, 3.5, mug.position.z - 0.4], 32, 33); }
      else { env.keyAt(0, 6, 6, 18); camPath(cam, lt, [-0.4, 4.2, 12.6], [-0.5, 4.0, 11.8], [-0.4, 3.0, -3.5], [-0.4, 2.9, -3.5], 22, 23); shake(cam, t, r.landT, 0.6); } }; },
  // 32 "Fearless," she whispered. "I like it."  — close on Mrs. Stone: stunned → a slow, delighted, conspiratorial smile; she leans in and whispers. Sun rim on the platinum hair. Camera: push in.
  (S, cam) => { const env = stoneOffice(S); const St = stone(S, 'stunned', STP, 62);
    return (t, dur) => { env.update(t); St.setFace(t < dur * 0.22 ? 'stunned' : t < dur * 0.6 ? 'whoa' : 'sly'); St.pose(ps(idle(t, 0.6), talk(t, 0.7), { rUp: 20, lUp: 20, lean: sm(t, 0.2, dur * 0.7) * 12, tilt: sm(t, dur * 0.5, dur * 0.8) * 8 }));
      const h = headOf(St); env.keyAt(-0.5, 5, 0.5, 14); faceCam(cam, sm(t, 0, dur), v3(h), 62, { dist: 7.4, lens: 38, side: -1.3, up: 0.1, push: 1.2, look: -0.2 }); }; },
  // 33 "Then my body climbed onto her desk."  — wide: Nina's body crouches, springs up onto the desk and lands sitting on it, facing us; the nameplate goes flying. Mrs. Stone steps back, one eyebrow up.
  (S, cam) => { const env = stoneOffice(S); const N = officeNina(S, 'smug'); const St = stone(S, 'eyebrow', STP, 62); allow(S, ['nina', 'desk*']);
    return (t, dur) => { env.update(t); const j0 = dur * 0.22, j1 = dur * 0.62, u = sm(t, j0, j1), p = arc([N.x0, 0, N.z0], [0, 1.5, -3.3], 1.9, u); place(N, p[0], p[1], p[2], lerp(-62, 0, u)); N.setFace(u < 1 ? 'bugeyes' : 'catface');
      N.pose(ps(anticipate(t, j0, 2), lerpPose({ ...OPAWS, lean: 14 }, { rLeg: 90, lLeg: 90, rFwd: 44, lFwd: 44, rUp: -8, lUp: -8, lean: 10 }, sm(u, 0.4, 1)), t > j1 ? { bob: -Math.exp(-(t - j1) * 9) * 0.18, tilt: Math.sin(t * 1.3) * 7 } : {}));
      const k = ramp(t, j1, j1 + 0.5); env.np.position.set(...arc([-0.75, 3.0, -2.7], [-1.9, 0.25, 1.2], 1.4, k)); env.np.rotation.set(k * 7, 0, k * 5);
      St.pose(ps(idle(t, 0.7), POSES.hips, look(lookAt(St, headOf(N)), 0.6), { lean: -sm(t, j0, j1) * 6 })); St.root.position.x = STP[0] - sm(t, j0, j1) * 0.7;
      env.keyAt(0, 6, 6, 18); camPath(cam, sm(t, 0, dur), [0.8, 4.4, 13.6], [0.4, 4.6, 12.0], [-0.4, 3.6, -3.4], [-0.6, 4.2, -3.4], 25, 26); shake(cam, t, j1, 0.5); }; },
  // 34 "And fell asleep in the sunbeam."  — high 3/4: a shaft of sun swings onto the desk; she turns once, curls up on it and is gone. Dust in the light. Camera: slow drift down.
  (S, cam) => { const env = stoneOffice(S); const N = nina(S, 'drowsy', [0, 1.5, -3.3], 0, true); allow(S, ['nina', 'desk*']);
    return (t, dur) => { env.update(t); env.np.visible = false; const c = sm(t, 0.05, dur * 0.6); env.sun(0.25 + c * 0.75); N.setFace(c < 0.7 ? 'drowsy' : 'sleeping');
      N.pose(ps(lerpPose({ rLeg: 90, lLeg: 90, rFwd: 44, lFwd: 44, rUp: -8, lUp: -8, lean: 10 }, CURL, c), { bob: Math.sin(t * 2.2) * 0.03 })); env.keyAt(2, 6, 2, 10);
      camPath(cam, sm(t, 0, dur), [3.6, 7.4, 5.6], [3.0, 6.8, 4.8], [0, 4.0, -2.8], [0, 4.0, -2.8], 30, 31); }; },
  // 35 "She even guards her own time," said Mrs. Stone.  — (a) Mrs. Stone nods at the sleeping candidate, impressed, making a note; (b) the bag: the real Nina stares out of it, appalled → deadpan.
  (S, cam) => { const env = stoneOffice(S); const N = nina(S, 'sleeping', [0, 1.5, -3.3], 0, true); const St = stone(S, 'smug', [-4.1, 0, -3.6], 62); const B = catBag(S, 'appalled'); const pad = notePad(S, [['STONE & CO.', '800 40px "Inter", sans-serif', '#8a1e28', 60], ['fearless', '700 50px "Comic Relief", cursive', '#1a2a4a', 70], ['guards time', '700 50px "Comic Relief", cursive', '#1a2a4a', 62], ['HIRE??', '700 56px "Comic Relief", cursive', '#b01e1e', 70]], 1.0); allow(S, ['nina', 'desk*']);
    return (t, dur) => { env.update(t); env.np.visible = false; env.sun(1); const [k, lt] = seg(t, dur, [0.62]); N.pose(ps(CURL, { bob: Math.sin(t * 2.2) * 0.03 }));
      St.pose(ps(idle(t, 0.6), talk(t, 0.9), { rFwd: 66, rUp: -16, lFwd: 58, lUp: -16, nod: 4 + Math.sin(t * 5) * 4 })); const h2 = hands(St); pad.position.set(h2.x, h2.y + 0.5, h2.z); pad.rotation.set(-0.5, 62 * D, 0);
      B.at(...BAG, -30); B.cat.setFace(k && lt > 0.5 ? 'flat' : 'appalled'); B.cat.update(t, 'sit', { turn: -30 + (k ? sm(lt, 0.4, 0.8) * 44 : 0), nod: -8 });
      if (k === 0) { const h = headOf(St); env.keyAt(-1, 5, 2, 14); camPath(cam, lt, [1.6, 4.9, 4.6], [1.2, 4.9, 3.8], [h.x + 1.2, h.y - 0.5, h.z], [h.x + 1.1, h.y - 0.5, h.z], 26, 27); }
      else { const h = B.cat.headPos(); env.keyAt(5, 3, 7, 14); camPath(cam, lt, [4.4, 2.6, 8.6], [4.5, 2.6, 8.0], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.3, h.z], 34); } }; },
  // 36 "Then somebody switched on a laser pointer."  — (a) Dev, headphones on, clicks the chart on and waves a red dot over the bars without looking up; (b) on the desk, the sleeper's eyes snap open: pupils like saucers.
  (S, cam) => { const env = stoneOffice(S, { screen: true }); const N = nina(S, 'sleeping', [0, 1.5, -3.3], 0, true); const Dv = dev(S, 'chill', [-3.0, 0, -7.3], 14); const dot = laserDot(S); allow(S, ['nina', 'desk*']);
    return (t, dur) => { env.update(t); env.np.visible = false; env.sun(1); const [k, lt] = seg(t, dur, [0.56]); env.screenOn(sm(t, 0.1, 0.3)); const on = t > 0.3;
      Dv.pose(ps(idle(t, 1), hit([[0, { rUp: 10 }], [0.3, { rUp: 78, rFwd: 16 }]], t), { rUp: on ? Math.sin(t * 5) * 8 : 0, nod: 14, turn: 10, bob: Math.sin(t * 6) * 0.04, tilt: Math.sin(t * 3) * 6 }));
      dot.visible = on; dot.userData.at(...onScreen(Math.sin(t * 5) * 0.7, Math.sin(t * 7.3) * 0.5 - 0.1), t);
      const wake = k === 1 ? sm(lt, 0.1, 0.4) : 0; N.setFace(wake > 0.5 ? 'bugeyes' : 'sleeping'); N.pose(ps(lerpPose(CURL, { rLeg: 90, lLeg: 90, rFwd: 60, lFwd: 60, rUp: -8, lUp: -8, lean: 20, nod: -6, turn: 46 }, wake)));
      if (k === 0) { env.keyAt(-4, 5, -2, 12); camPath(cam, lt, [-4.4, 5.0, 4.2], [-4.8, 5.0, 3.2], [-5.6, 4.8, -8], [-5.6, 4.8, -8], 20, 21); }
      else { const h = headOf(N); env.keyAt(1, 5, 1, 12); camPath(cam, lt, [1.8, 5.0, 3.8], [1.5, 5.0, 3.0], [h.x, h.y - 0.1, h.z], [h.x, h.y - 0.1, h.z], 36, 38); } }; },
  // 37 "My body chased that red dot across the whole room."
  //   Blocking: high wide: the red dot zig-zags over the carpet and Nina's body gallops after it, bent double, paws out, missing it every time. Mrs. Stone's head follows; Dev never looks up. Camera: pan with the chase.
  (S, cam) => { const env = stoneOffice(S, { screen: true }); const N = nina(S, 'bugeyes', [0, 0, 0], 0, true); const St = stone(S, 'eyebrow', [-5.4, 0, -4.0], 40); const Dv = dev(S, 'chill', [-2.2, 0, -8.0], 14); const dot = laserDot(S);
    const P = (u) => [5.2 * Math.sin(u * 6.6), 2.6 + 3.2 * Math.sin(u * 4.1 + 0.4)];
    return (t, dur) => { env.update(t); env.np.visible = false; env.sun(1); const u = t / dur, [dx, dz] = P(u + 0.07), [x, z] = P(u), [x2, z2] = P(u + 0.02); dot.userData.at(dx, 0.14, dz, t);
      place(N, x, 0, z, Math.atan2(x2 - x, z2 - z) / D); N.pose(ps(walk(t, 2.0, 46), { lean: 36, nod: -18, rFwd: 70 + Math.sin(t * 16) * 20, lFwd: 70 - Math.sin(t * 16) * 20, rUp: -6, lUp: -6 }));
      St.setFace(u < 0.5 ? 'eyebrow' : 'eager'); St.pose(ps(idle(t, 0.7), POSES.hips, look(lookAt(St, [x, 3, z]), 0.9))); Dv.pose(ps(idle(t, 1), { rUp: 60 + Math.sin(t * 4) * 20, rFwd: 40 + Math.sin(t * 5.3) * 26, nod: 16, bob: Math.sin(t * 6) * 0.04, tilt: Math.sin(t * 3) * 6 }));
      env.keyAt(0, 7, 8, 16); camPath(cam, sm(t, 0, dur), [1.5, 7.6, 16.2], [-1.5, 7.2, 15.6], [x * 0.5, 2.2, 0.5], [x * 0.5, 2.2, 0.5], 20); }; },
  // 38 "She attacks every single number," said Mrs. Stone.  — close on Mrs. Stone, eyes sparkling, dictating; behind her the candidate leaps at the chart again and again, swiping at the dot on the numbers.
  (S, cam) => { const env = stoneOffice(S, { screen: true }); const St = stone(S, 'eager', [-3.6, 0, -1.0], 24); const N = nina(S, 'bugeyes', [-4.4, 0, -7.2], -40, true); const dot = laserDot(S);
    return (t, dur) => { env.update(t); env.np.visible = false; env.sun(1); const hp = (t * 1.9) % 1, jy = Math.sin(hp * Math.PI) * 1.5; N.root.position.y = jy; N.pose({ rUp: 150 - hp * 60, lUp: 130, rFwd: 20 + hp * 50, lFwd: 20, lean: 6, nod: -24, rLeg: -20 * Math.sin(hp * Math.PI), lLeg: 24 * Math.sin(hp * Math.PI) });
      dot.userData.at(...onScreen(-0.1 + Math.sin(t * 6) * 0.5, 0.35 + Math.sin(t * 8.3) * 0.3), t); St.setFace(t < dur * 0.45 ? 'eager' : 'sparkle');
      St.pose(ps(idle(t, 0.6), talk(t), hit([[0, { rUp: 20, lUp: 20 }], [dur * 0.4, { rFwd: 100, rUp: -20, lFwd: 100, lUp: -20, nod: -4 }]], t))); const h = headOf(St); env.keyAt(-1.5, 5, 3, 14);
      faceCam(cam, sm(t, 0, dur), v3(h), 24, { dist: 8.2, lens: 32, side: 1.2, up: 0.2, push: 1.0, look: 0.1 }); }; },
  // 39 "You're hired. Vice president. Start Monday."  — two-shot in front of the desk: Mrs. Stone pumps Nina's limp "paw" up and down, beaming; released, the body licks the hand clean.
  (S, cam) => { const env = stoneOffice(S, { screen: true }); const St = stone(S, 'eager', [-2.4, 0, 1.0], 60); const N = nina(S, 'catface', [2.3, 0, 1.0], -60, true); allow(S, ['stone', 'nina']);
    return (t, dur) => { env.update(t); env.np.visible = false; env.sun(1); const rel = sm(t, dur * 0.66, dur * 0.82), pump = Math.sin(t * 15) * 14 * (1 - rel);
      St.setFace(t < dur * 0.5 ? 'eager' : 'beam'); St.pose(ps(idle(t, 0.5), talk(t), { lFwd: 82 + pump - rel * 50, lUp: -6, rUp: 24, lean: 8 - rel * 6 }, look(lookAt(St, headOf(N)), 0.4)));
      N.setFace(rel > 0.6 ? 'beam' : 'catface'); N.pose(ps(catIdle(t), lerpPose({ rFwd: 82 + pump, rUp: -6, lFwd: 62, lUp: -10, lean: 6, bob: pump * 0.004, turn: 14 }, { rFwd: 124, rUp: 14, lFwd: 62, lUp: -10, nod: 12 + Math.sin(t * 10) * 5 }, rel)));
      env.keyAt(0, 6, 9, 18); camPath(cam, sm(t, 0, dur), [0.4, 4.6, 13.4], [0.2, 4.5, 12.2], [0, 3.8, 1.0], [0, 3.8, 1.0], 24, 25); }; },
  // 40 "I fainted in the bag."  — close on the tote: the real Nina's eyes roll into X's and she tips over backwards into the bag; four paws stick up.
  (S, cam) => { const env = stoneOffice(S, { screen: true }); const B = catBag(S, 'stunned');
    return (t, dur) => { env.update(t); env.sun(1); const f = sm(t, dur * 0.3, dur * 0.62); B.up = -f * 0.5; B.at(...BAG, -30); B.cat.setFace(t < dur * 0.28 ? 'stunned' : 'ko'); B.cat.root.rotation.x = -f * 1.2; B.cat.update(t, 'sit', { nod: -f * 20, pawR: f * 0.8, pawL: f * 0.8, pawAng: 0.5 });
      const h = [BAG[0], 2.5, BAG[2]]; env.keyAt(5, 3.4, 7.4, 14); camPath(cam, sm(t, 0, dur), [4.5, 2.9, 8.8], [4.6, 2.8, 8.2], h, h, 34); shake(cam, t, dur * 0.62, 0.4); }; },
  // 41 "That night, we swapped back."  — the flat at dusk, same two-shot as line 2: a sneeze on the fridge, sparkles, and Nina is herself again (catface → exhausted, shoulders dropping).
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const C = cat(S, 'exhausted', [-6.2, 6.4, -6.1], 24); const N = nina(S, 'catface', [-2.4, 0, -3.4], -38, true); const fx = swapFx(S);
    return (t, dur) => { env.update(t); const t0 = dur * 0.45, sn = C.sneeze(t, t0), sw = t > t0 + 0.05; C.setFace(sw ? 'catface' : t > t0 - 0.42 ? 'whoa' : 'exhausted'); C.update(t, 'sit', { nod: sn.nod + 8, bob: sn.bob, turn: 18 });
      N.setFace(sw ? 'exhausted' : 'catface'); N.pose(ps(sw ? idle(t, 0.6) : catIdle(t), hit([[0, PAWS], [t0, PAWS], [t0 + 0.4, POSES.slump]], t))); const ch = C.headPos(), nh = headOf(N); fx.update(t, t0, v3(ch), v3(nh)); env.keyAt(-3.5, 6, 2, 12);
      camPath(cam, sm(t, 0, dur), [-3.9, 4.6, 8.4], [-4.1, 4.9, 7.4], [-4.3, 4.9, -5], [-4.3, 5.1, -5], 22, 23); shake(cam, t, t0, 0.5); }; },
  // 42 "But at midnight, I heard something on the fridge."  — (a) Nina creeps through the dark flat on tip-toe, moonlit, listening; (b) her view: on the fridge, a hunched shape with its back to us, tail flicking, sniffing at something.
  (S, cam) => { const env = ninaFlat(S, { time: 'night' }); const N = nina(S, 'suspicious', [1.5, 0, 2.0], -132); const C = cat(S, 'sly', FRIDGE, 196); const sh = pepperShaker(S, 0.95);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.5]); sh.position.set(-6.0, 6.4, -7.6); N.pose(ps(idle(t, 0.5), { rUp: 34, lUp: 34, rFwd: 24, lFwd: 24, lean: 8, bob: 0.12, rLeg: Math.sin(t * 3) * 10, lLeg: -Math.sin(t * 3) * 10 }, { turn: sm(lt, 0.2, 0.7) * -14 }));
      C.update(t, 'sit', { nod: 22 + Math.sin(t * 13) * 5, tail: 5 });
      if (k === 0) { const h = headOf(N); env.keyAt(-1.6, 4.6, -0.4, 15, 0x9ab4ff); faceCam(cam, lt, v3(h), -132, { dist: 7.2, lens: 36, side: -0.8, up: 0.1, push: 0.9, look: -0.3 }); }
      else { env.keyAt(-4, 8, -3, 10, 0x9ab4ff); camPath(cam, lt, [-1.6, 4.6, 3.2], [-2.6, 5.0, 1.2], [-6.0, 7.4, -6.6], [-6.0, 7.5, -6.6], 30, 34); } }; },
  // 43 "She wasn't sick. She had the pepper shaker."  — the reveal: Beans swings round on the fridge with the pepper shaker between her paws; sly → caught. Moon rim, cool key. Camera: push in on cat + shaker.
  (S, cam) => { const env = ninaFlat(S, { time: 'night' }); const C = cat(S, 'sly', FRIDGE, 196); const sh = pepperShaker(S, 0.95);
    return (t, dur) => { env.update(t); const tu = hn([[0.1, 0], [0.75, 1]], t); C.root.rotation.y = lerp(196, 24, tu) * D; C.setFace(t < 0.5 ? 'sly' : t < dur * 0.62 ? 'bugeyes' : 'smug'); C.update(t, 'sit', { nod: 8, tail: 4, pawR: 0.35, pawL: 0.35, pawAng: 0.7, pawLen: 0 });
      const a = C.root.rotation.y; sh.position.set(-6.2 + Math.sin(a) * 1.6, 6.4, -6.7 + Math.cos(a) * 1.6); sh.rotation.y = a; env.keyAt(-4.4, 8.2, -2.2, 16, 0xbfd0ff);
      camPath(cam, sm(t, 0, dur), [-3.6, 8.4, 2.2], [-4.0, 8.0, 0.2], [-5.7, 7.5, -6.2], [-5.7, 7.4, -6.0], 32, 36); }; },
  // 44 "One sniff. One sneeze. And she got thumbs."  — three beats: (a) close: a sniff at the shaker; (b) the sneeze + sparkles, cat and Nina; (c) Nina's body, huge grin, holding up both hands and wiggling them.
  (S, cam) => { const env = ninaFlat(S, { time: 'night' }); const C = cat(S, 'catface', FRIDGE, 24); const sh = pepperShaker(S, 0.95); const N = nina(S, 'gasp', [-2.4, 0, -3.4], -38); const fx = swapFx(S);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.3, 0.62]); const t0 = dur * 0.46, sn = C.sneeze(t, t0), sw = t > t0 + 0.05; sh.position.set(...SHK); sh.rotation.y = 0.4;
      C.setFace(sw ? 'stunned' : k === 0 ? 'catface' : 'whoa'); C.update(t, 'sit', { nod: (k === 0 ? 20 + Math.sin(t * 16) * 5 : 8) + sn.nod, bob: sn.bob, turn: 12, tail: 3 });
      N.setFace(sw ? 'cheese' : 'gasp'); N.pose(ps(idle(t, 0.6), sw ? hit([[t0 + 0.1, PAWS], [dur * 0.62 + 0.2, { rFwd: 120, lFwd: 120, rUp: 24, lUp: 24, nod: 4 }]], t) : { rUp: 30, lUp: 30, nod: -14 }, k === 2 ? { rUp: Math.sin(t * 16) * 6, lUp: -Math.sin(t * 16) * 6 } : {}));
      const ch = C.headPos(), nh = headOf(N); fx.update(t, t0, v3(ch), v3(nh));
      if (k === 0) { env.keyAt(-4.4, 8, -2.4, 16, 0xbfd0ff); camPath(cam, lt, [-3.8, 7.8, -0.6], [-4.0, 7.7, -1.2], [-5.8, 7.4, -6.2], [-5.8, 7.4, -6.2], 38); }
      else if (k === 1) { env.keyAt(-3.5, 6, 2, 12, 0xbfd0ff); camPath(cam, lt, [-3.9, 4.6, 8.4], [-4.0, 4.8, 7.8], [-4.3, 4.9, -5], [-4.3, 5.0, -5], 22); shake(cam, t, t0, 0.5); }
      else { env.keyAt(-1.6, 5, 1.5, 14, 0xdfe6ff); faceCam(cam, lt, v3(nh), -38, { dist: 8.6, lens: 32, side: 0.5, up: 0.1, push: 0.8, look: -0.6 }); } }; },
  // 45 "My cat had planned the whole thing."  — low angle: Nina's body holds the pepper shaker up like a trophy, villain grin, moonlight; high behind her on the fridge the real Nina stares down, appalled.
  (S, cam) => { const env = ninaFlat(S, { time: 'night' }); const C = cat(S, 'appalled', FRIDGE, 30); const sh = pepperShaker(S, 0.95); const N = nina(S, 'sly', [-2.2, 0, -2.6], -8);
    return (t, dur) => { env.update(t); C.update(t, 'sit', { nod: 18, turn: 30, tail: 4 }); N.setFace(t < dur * 0.4 ? 'sly' : 'evil'); N.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 70, rUp: 0 }], [dur * 0.5, { rFwd: 132, rUp: 8, nod: -8, lUp: 28, lFwd: -8 }]], t)));
      const p = pinky(N, 'R'); sh.position.set(p.x, p.y - 0.1, p.z + 0.1); const h = headOf(N); env.keyAt(-1.2, 3.6, 1.6, 14, 0xcfdcff);
      camPath(cam, sm(t, 0, dur), [-1.0, 2.4, 4.6], [-1.3, 2.2, 3.6], [-3.0, 5.2, -3.2], [-3.1, 5.3, -3.2], 26, 27); }; },
  // 46 "So Monday, she went to work, as me."  — morning: Nina's body in the blazer struts to the open door, briefcase swinging, turns in the doorway for a cocky little salute. The real Nina watches from the fridge.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'unimpressed', FRIDGE, 40); const N = nina(S, 'catface', [2.6, 0, -1.0], 148, true); const bc = briefcase(S); allow(S, ['nina', 'back wall']);
    return (t, dur) => { env.update(t); env.door.open(1); const u = sm(t, 0, dur * 0.62), tu = sm(t, dur * 0.6, dur * 0.78); place(N, lerp(2.6, 6.9, u), 0, lerp(-1.0, -7.9, u), lerp(148, 10, tu)); N.setFace(tu > 0.5 ? 'cocky' : 'catface');
      N.pose(ps(u < 1 ? walk(t, 1.1, 30) : idle(t, 0.8), { tilt: Math.sin(t * 4.4) * 6, bodyTilt: Math.sin(t * 8.8) * 3 }, tu > 0.3 ? hit([[dur * 0.66, {}], [dur * 0.84, { rUp: 140, rFwd: 30, tilt: 8 }]], t) : {}));
      const lp = pinky(N, 'L'); bc.position.set(lp.x, lp.y, lp.z); bc.rotation.y = N.root.rotation.y + Math.PI / 2; C.update(t, 'sit', { turn: 44, nod: 12, tail: 3 }); env.keyAt(5, 5, -3, 14);
      camPath(cam, sm(t, 0, dur), [-0.6, 4.6, 8.4], [1.8, 4.6, 6.2], [2.4, 4.0, -4], [5.4, 4.0, -7], 24, 25); }; },
  // 47 "And I stayed home, as her."  — close on the cat on the fridge: the door slams (the frame jumps), she flinches, looks around the empty flat, deflates.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'flat', FRIDGE, 30);
    return (t, dur) => { env.update(t); const sl = dur * 0.28; env.door.open(1 - hn([[0.05, 0], [sl, 1]], t, x => x * x)); C.setFace(t < sl ? 'flat' : t < sl + 0.3 ? 'whoa' : 'unimpressed');
      C.update(t, 'sit', { turn: sm(t, sl + 0.2, dur * 0.9) * 40 - 10, nod: 6 + sm(t, dur * 0.7, dur) * 10, bob: t > sl ? -Math.exp(-(t - sl) * 8) * 0.14 : 0, tail: 2 }); const h = C.headPos(); env.keyAt(-3.8, 8, -1.8, 16);
      camPath(cam, sm(t, 0, dur), [-3.4, 8.2, 0.6], [-3.6, 8.1, 0.0], [h.x, h.y - 0.6, h.z], [h.x, h.y - 0.6, h.z], 34); shake(cam, t, sl, 0.8); }; },
  // 48 "I planned to be furious."  — low tracking shot: the cat stomps across the floor, tail lashing, grumpy → furious… and walks straight into the warm patch of sun on the rug: "ooh".
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'grumpy', [-4.2, 0, 2.0], 84);
    return (t, dur) => { env.update(t); const u = sm(t, 0, dur * 0.8), x = lerp(-4.2, 0.9, u); C.root.position.x = x; C.setFace(u < 0.45 ? 'grumpy' : u < 0.9 ? 'furious' : 'ooh'); C.update(t, u < 1 ? 'walk' : 'stand', { tail: 6, turn: -40 * sm(t, dur * 0.3, dur * 0.6), nod: u >= 1 ? -10 : 4 });
      env.keyAt(x + 1, 2.6, 6, 12); camPath(cam, sm(t, 0, dur), [-2.6, 1.9, 9.6], [1.6, 1.9, 9.2], [x + 0.6, 1.9, 2.0], [x + 0.6, 1.9, 2.0], 30); }; },
  // 49 "Instead, I slept nineteen hours, in a sunbeam."  — high angle: the cat is a loaf in the cat bed, in the window light, blissful; the sunbeam slides across her as the hours spin by. Camera: slow drift in.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'beam', [2, 0.45, 2.5], 14);
    return (t, dur) => { env.update(t); C.update(t, 'sleep', { bob: Math.sin(t * 2.0) * 0.04, tail: 0.6, tilt: 10, nod: -16 }); const k = t / dur; env.sun.target.position.set(lerp(0.6, 3.2, k), 0, lerp(3.4, 1.8, k)); env.sun.color.setHSL(0.1, 0.9, lerp(0.78, 0.66, k)); env.shaft.rotation.z += 0;
      env.keyAt(3, 3.4, 6, 5); camPath(cam, sm(t, 0, dur), [3.4, 2.9, 9.0], [3.0, 2.5, 7.8], [2, 1.4, 2.6], [2, 1.5, 2.6], 30, 32); }; },
  // 50 "No emails. No alarm. No rent."  — three quick ones: (a) loafing on the fridge, tail hanging over the calendar; (b) batting the ball on the cat tree; (c) flat on her back on the sofa, paws in the air.
  (S, cam) => { const env = ninaFlat(S); const C = cat(S, 'chill', [-6.3, 6.4, -6.5], 0);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.33, 0.66]); C.root.rotation.set(0, 0, 0);
      if (k === 0) { C.root.position.set(-6.3, 6.4, -6.5); C.setFace('chill'); C.update(t, 'loaf', { tail: 3, nod: 8, turn: Math.sin(t * 2) * 10 }); env.keyAt(-5, 7.6, -2, 14); camPath(cam, lt, [-4.6, 7.4, 0.8], [-4.9, 7.4, 0.2], [-6.3, 7.2, -5.6], [-6.3, 7.2, -5.6], 34); }
      else if (k === 1) { C.root.position.set(-8.0, 5.83, 8.4); C.root.rotation.y = 118 * D; C.setFace('cheerful'); C.update(t, 'sit', { pawL: 0.5 + Math.sin(t * 16) * 0.5, pawAng: 1.0, turn: 30, tail: 5 }); env.keyAt(-5, 7.5, 10.5, 14); camPath(cam, lt, [-2.6, 7.4, 11.6], [-2.9, 7.4, 11.4], [-7.6, 7.2, 8.6], [-7.6, 7.2, 8.6], 28); }
      else { C.root.position.set(8.0, 1.5, 6.4); C.root.rotation.y = -48 * D; C.setFace('beam'); C.update(t, 'loaf', { tail: 3, tilt: Math.sin(t * 3) * 8, nod: -6, bob: Math.sin(t * 2.2) * 0.03 }); env.keyAt(5.5, 4, 8.5, 14); camPath(cam, lt, [3.6, 3.6, 9.8], [3.9, 3.5, 9.4], [8.0, 2.4, 6.6], [8.0, 2.4, 6.6], 28); } }; },
  // 51 "And her? Meetings. Spreadsheets. Something called synergy."  — (a) the office: Mrs. Stone lectures at full speed, jabbing a finger, while Nina's body stands frazzled under a growing armful of files; (b) close: spiral eyes in front of the chart.
  (S, cam) => { const env = stoneOffice(S, { screen: true }); const St = stone(S, 'scold', [-2.6, 0, 1.0], 80); const N = nina(S, 'frazzled', [2.2, 0, 1.0], -20, true); const files = [0, 1, 2, 3, 4].map(i => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.1), new THREE.MeshStandardMaterial({ color: [0xd8302a, 0xf2ece0, 0xf2c84a, 0x4a8ad8, 0xf2ece0][i], roughness: 0.8 })); S.add(m); return m; });
    return (t, dur) => { env.update(t); env.np.visible = false; const [k, lt] = seg(t, dur, [0.52]); St.pose(ps(idle(t, 0.6), talk(t, 1.3), { rFwd: 84 + Math.sin(t * 9) * 10, rUp: -4, lUp: 28, lean: 10 })); St.setFace(Math.sin(t * 3) > 0 ? 'scold' : 'stern');
      N.setFace(k ? 'dizzy' : 'frazzled'); N.pose(ps(idle(t, 0.5), { rFwd: 74, lFwd: 74, rUp: -12, lUp: -12, lean: -6, tilt: Math.sin(t * 2.2) * (k ? 10 : 4), bob: -0.06 })); const h2 = hands(N), n = k ? 5 : 1 + Math.floor(lt * 4.5);
      files.forEach((m, i) => { m.visible = i < n; m.position.set(h2.x, h2.y - 0.1 + i * 0.24, h2.z); m.rotation.y = N.root.rotation.y + (i % 2 ? 0.2 : -0.15); });
      if (k === 0) { env.keyAt(0, 6, 9, 18); camPath(cam, lt, [0.2, 4.6, 13.2], [0, 4.5, 12.2], [-0.2, 3.8, 1.0], [-0.2, 3.8, 1.0], 24, 25); }
      else { const h = headOf(N); env.keyAt(2.6, 5, 5, 14); faceCam(cam, lt, v3(h), -20, { dist: 7.6, lens: 36, side: 0.6, up: 0.1, push: 0.8, look: -0.6 }); } }; },
  // 52 "By Friday, she crawled home with one shoe missing."  — evening: the door hangs open and Nina's body shuffles in from the hall, slumped, one boot gone, briefcase dragging on the floor behind her… and drops to her knees, face of the walking dead. Camera: low, sinking with her.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const N = nina(S, 'exhausted', [6.9, 0, -9.8], 0, true); const bc = briefcase(S); N.legL.children.forEach(m => { if (m.position.y < -1.2) m.visible = false; }); allow(S, ['nina', 'back wall']);
    return (t, dur) => { env.update(t); env.door.open(1); const w = sm(t, 0, dur * 0.55), f0 = dur * 0.58, f = sm(t, f0, f0 + 0.45); place(N, lerp(6.9, 6.5, w), -1.5 * f, lerp(-9.8, -5.2, w), 0); N.setFace(f > 0.5 ? 'drowsy' : 'exhausted');
      N.pose(ps(lerpPose(ps(w < 1 ? walk(t, 0.55, 16) : {}, POSES.slump, { rUp: 10 }), { rLeg: 90, lLeg: 90, lean: 30, nod: -14, rFwd: 40, lFwd: 40, tilt: -18 }, f), { bob: f >= 1 ? -Math.exp(-(t - f0 - 0.45) * 8) * 0.12 : 0 }));
      const rp = pinky(N, 'R'); bc.position.set(rp.x - 0.9, Math.max(0.25, rp.y - 1.4), rp.z - 0.8); bc.rotation.set(Math.PI / 2 - 0.2, 0.5, 0); env.keyAt(6.2, 3.4, -1.6, 16); env.hallL.intensity = 40;
      camPath(cam, sm(t, 0, dur), [5.4, 3.4, 3.6], [5.8, 2.2, 2.4], [6.6, 3.6, -6.5], [6.5, 2.2, -5.4], 26, 27); shake(cam, t, f0 + 0.4, 0.4); }; },
  // 53 "She set the pepper shaker down in front of me."  — side-on at the fridge: Nina's body, on tip-toe, reaches up and sets the shaker on the top edge, right in front of the loafing cat, who looks down at it.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const C = cat(S, 'chill', [-6.3, 6.4, -6.6], 62); const N = nina(S, 'exhausted', [-3.5, 0, -3.5], -146, true); const sh = pepperShaker(S, 0.95);
    return (t, dur) => { env.update(t); const up = sm(t, 0.1, dur * 0.5), rel = sm(t, dur * 0.55, dur * 0.8); N.pose(ps(idle(t, 0.5), { lFwd: lerp(60, 152, up) - rel * 60, lUp: -6, lean: up * 8 - rel * 4, nod: -up * 22 + rel * 6, turn: -30, bob: up * 0.28 - rel * 0.2 }));
      const lp = pinky(N, 'L'); if (t < dur * 0.52) sh.position.set(lp.x, lp.y - 0.2, lp.z); else sh.position.set(-4.95, 6.4, -5.5); C.setFace(rel > 0.4 ? 'eyebrow' : 'chill'); C.update(t, 'loaf', { nod: 6 + rel * 16, turn: -rel * 14, tail: 2 });
      env.keyAt(-1.6, 5.6, -2.2, 16); camPath(cam, sm(t, 0, dur), [3.2, 4.4, 0.8], [2.6, 4.6, 0.2], [-4.6, 5.2, -5.0], [-4.6, 5.5, -5.0], 24, 25); }; },
  // 54 "And made the saddest eyes I've ever seen, on my own face."  — the cat's high view: Nina's body below, hands clasped, enormous teary eyes turned up at us, lip trembling. Camera: slow push down onto the face.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const N = nina(S, 'tearful', [-2.6, 0, -2.4], -136, true);
    return (t, dur) => { env.update(t); N.setFace(t < dur * 0.3 ? 'tearful' : 'puppyeyes'); N.pose(ps({ rFwd: 96, lFwd: 96, rUp: -24, lUp: -24, nod: -34, lean: 4, bob: Math.sin(t * 24) * 0.01, tilt: sm(t, dur * 0.3, dur * 0.6) * 10 }, { rFwd: Math.sin(t * 5) * 4, lFwd: Math.sin(t * 5) * 4 }));
      const h = headOf(N); env.keyAt(-3.6, 6.4, -3.6, 16); camPath(cam, sm(t, 0, dur), [-5.6, 8.9, -5.4], [-5.1, 8.2, -4.8], [h.x, h.y - 0.2, h.z], [h.x, h.y - 0.1, h.z], 34, 40); }; },
  // 55 "I looked at her. I looked at the pepper."  — (a) from below: the cat peers down over the fridge edge at her, one eyebrow; (b) close: her eyes slide to the shaker beside her… sly.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const C = cat(S, 'eyebrow', FRIDGE, 24); const sh = pepperShaker(S, 0.95);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.5]); sh.position.set(...SHK); sh.rotation.y = 0.4; C.setFace(k === 0 ? 'eyebrow' : lt < 0.5 ? 'suspicious' : 'sly'); C.update(t, 'sit', { nod: k ? 16 : 22, turn: k ? 14 + sm(lt, 0, 0.5) * 22 : 30, tail: 3 }); const h = C.headPos();
      if (k === 0) { env.keyAt(-3.4, 6, -3, 16); camPath(cam, lt, [-2.8, 4.4, -2.4], [-2.9, 4.5, -2.6], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.4, h.z], 34); }
      else { env.keyAt(-4, 8, -2.4, 16); camPath(cam, lt, [-3.0, 8.0, -0.4], [-3.2, 8.0, -1.0], [-5.8, 7.9, -6.4], [-5.8, 7.9, -6.4], 34); } }; },
  // 56 "Then I reached out, with one paw."  — close: one white-socked paw slides out toward the shaker; her smug face never looks at it — it looks down at us.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const C = cat(S, 'sly', FRIDGE, 24); const sh = pepperShaker(S, 0.95);
    return (t, dur) => { env.update(t); sh.position.set(...SHK); sh.rotation.y = 0.4; const r = sm(t, dur * 0.1, dur * 0.9); C.setFace(r > 0.6 ? 'smug' : 'sly'); C.update(t, 'sit', { pawL: r, pawAng: 0.44, pawLen: 0, nod: 16, turn: 22, tail: 4 });
      env.keyAt(-4, 8, -2.4, 16); camPath(cam, sm(t, 0, dur), [-2.9, 8.0, -0.4], [-3.3, 7.9, -1.2], [-5.8, 7.8, -6.3], [-5.7, 7.7, -6.2], 34, 36); }; },
  // 57 "And pushed it off the fridge. Slowly."  — (a) close: the paw eases the shaker to the edge; (b) the vertical two-shot: it tips and falls past Nina's own horrified face (she grabs at it, misses), smashes in a puff of pepper. The cat: smug.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const C = cat(S, 'smug', FRIDGE, 24); const sh = pepperShaker(S, 0.95); const N = nina(S, 'puppyeyes', [-2.2, 0, -2.7], -146, true);
    const puff = [...Array(9)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0x3a3028, transparent: true, opacity: 0.5, depthWrite: false })); m.visible = false; S.add(m); return m; });
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.5]); const p0 = 0.02, p1 = dur * 0.5; const r = pushOff(sh, t, p0, p1, SHK, PDIR, 0.74, 0.3);
      C.root.position.z = FRIDGE[2] + r.sl * 0.22; C.update(t, 'sit', { pawL: 1 - sm(t, p1 + 0.15, p1 + 0.45), pawAng: 0.44 + r.sl * 0.3, pawLen: 0, nod: 16, turn: 22, tail: 4 });
      N.setFace(t < p1 ? 'puppyeyes' : t < r.landT ? 'gasp' : 'appalled'); N.root.rotation.y = lerp(-146, -60, sm(t, p1, p1 + 0.3)) * D; N.pose(ps(idle(t, 0.5), hit([[0, { rFwd: 96, lFwd: 96, rUp: -24, lUp: -24, nod: -30 }], [p1, { rFwd: 100, lFwd: 100, rUp: -24, lUp: -24, nod: -30 }], [p1 + 0.3, { rFwd: 128, lFwd: 128, rUp: 10, lUp: 10, nod: -20, lean: 10 }], [r.landT + 0.15, { rFwd: 50, lFwd: 50, rUp: 40, lUp: 40, nod: 26, lean: 6 }]], t)));
      puff.forEach((m, i) => { const u = (t - r.landT) / 0.7; m.visible = u > 0 && u < 1; if (m.visible) { const a = i / 9 * 6.28; m.position.set(sh.position.x + Math.cos(a) * u * 1.6, 0.3 + u * (0.6 + (i % 3) * 0.5), sh.position.z + Math.sin(a) * u * 1.2); m.scale.setScalar(1 + u * 2.4); m.material.opacity = 0.5 * (1 - u); } });
      if (k === 0) { env.keyAt(-4, 8, -2.4, 16); camPath(cam, lt, [-3.3, 7.9, -1.2], [-3.4, 7.8, -1.5], [-5.7, 7.7, -6.2], [-5.6, 7.6, -6.1], 36); }
      else { env.keyAt(-3.5, 5, 2, 14); camPath(cam, lt, [-3.9, 4.4, 8.6], [-4.0, 4.0, 8.0], [-4.3, 4.6, -5], [-4.3, 3.9, -5], 22, 23); shake(cam, t, r.landT, 0.7); } }; },
  // 58 "She's a vice president now."  (also the hook) — low hero angle: Nina's body behind the VICE PRESIDENT desk in a shaft of sun, cocky, sweeping the #1 BOSS mug off the corner with one hand. Mrs. Stone applauds; Dev finally looks up, stunned.
  (S, cam) => { const env = stoneOffice(S); const N = nina(S, 'cocky', [0, 0, -7.0], 0, true); const St = stone(S, 'eager', [-4.0, 0, -4.4], 46); const Dv = dev(S, 'chill', [4.3, 0, -4.4], -46); const mug = deskMug(S);
    const tx = textTex24(VP, { w: 640, h: 128, bg: '#e8c070', border: '#8a5a1a' }); const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.44), new THREE.MeshStandardMaterial({ map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: 0.35, roughness: 0.4 })); pl.position.set(0, 2.2, -1.53); S.add(pl);
    return (t, dur) => { env.update(t); env.np.visible = false; env.sun(1); const p0 = dur * 0.1, p1 = dur * 0.62, sl = sm(t, p0, p1), u = Math.max(0, t - p1), drop = Math.max(0, u - 0.08);
      N.setFace(t < p1 ? 'cocky' : 'smug'); N.pose(ps(idle(t, 0.5), { lFwd: 102, lUp: lerp(-32, -2, sl), rUp: 26, rFwd: -8, lean: 8, tilt: -8, nod: 2 }));
      const lp = pinky(N, 'L'), y = 3.0 - drop * drop * 26, landed = y <= 0.02; if (!u) mug.position.set(lp.x + 0.34, 3.0, lp.z + 0.05); else mug.position.set(mug.userData.x0 + Math.min(u, 0.3) * 1.6, Math.max(0.02, y), mug.userData.z0); if (!u) { mug.userData.x0 = mug.position.x; mug.userData.z0 = mug.position.z; }
      mug.rotation.set(0, 0, landed ? -1.57 : -Math.min(u, 0.1) * 4 - drop * 9); const landT = p1 + 0.08 + Math.sqrt(3 / 26); mug.userData.spill(landed ? sm(t, landT, landT + 0.3) : 0, mug.position.x + 0.3, mug.position.z + 0.2);
      const cl = Math.abs(Math.sin(t * 11)) * 16; St.pose(ps(idle(t, 0.6), { rFwd: 84, lFwd: 84, rUp: -26 + cl, lUp: -26 + cl, nod: -2 }, look(lookAt(St, headOf(N)), 0.5))); St.setFace(t > landT ? 'beam' : 'eager');
      Dv.setFace(t > dur * 0.3 ? 'stunned' : 'chill'); Dv.pose(ps(idle(t, 0.8), { rUp: 10, lUp: 10, nod: t > dur * 0.3 ? -4 : 16 }, look(lookAt(Dv, headOf(N)), t > dur * 0.3 ? 0.6 : 0)));
      env.keyAt(0, 5, 2, 20); if (S.userData.hook) camPath(cam, sm(t, 0, dur), [0.9, 3.4, 3.4], [0.8, 3.3, 2.6], [0.3, 4.3, -6.6], [0.3, 4.4, -6.6], 26, 27); else camPath(cam, sm(t, 0, dur), [0.4, 3.0, 9.4], [0.3, 2.8, 8.4], [0.1, 4.3, -6], [0.1, 4.4, -6], 22, 23); shake(cam, t, landT, 0.4); }; },
  // 59 "She brings home tuna, and scratches behind my ears."  — evening lamp light on the rug: Nina's body sits on the floor by the cat bed, a tower of tuna cans beside her, scratching the cat behind the ears. The cat melts.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const C = cat(S, 'chill', [2, 0.45, 2.5], -24); const N = nina(S, 'happy', [-1.3, -1.5, 3.0], 74, true); const cans = [0, 1, 2, 3].map(i => { const c = tunaCan(S, i === 3); c.position.set(-0.2 + (i % 2) * 0.12, i * 0.37, 5.0); return c; }); allow(S, ['nina', 'beans']);
    return (t, dur) => { env.update(t); const s = Math.sin(t * 9); N.setFace(t < dur * 0.5 ? 'happy' : 'catface'); N.pose({ rLeg: 90, lLeg: 90, lFwd: 40, lUp: -8, rFwd: 84 + s * 6, rUp: -10 + s * 4, lean: 14, turn: -30, tilt: Math.sin(t * 1.4) * 5, nod: 8 });
      C.setFace(t < dur * 0.35 ? 'chill' : 'beam'); C.update(t, 'loaf', { tilt: -14 + s * 3, nod: -6, tail: 2, bob: Math.sin(t * 2.2) * 0.02 }); env.keyAt(1.6, 3.4, 7.5, 6);
      camPath(cam, sm(t, 0, dur), [0.6, 3.2, 12.6], [0.5, 3.0, 11.6], [0.3, 1.9, 2.8], [0.3, 1.9, 2.8], 26, 27); }; },
  // 60 "She makes the money."  — the doorway at dusk, low hero angle: Nina's body in the blazer, briefcase held high, enormous grin, hall light behind her.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const N = nina(S, 'cheese', [6.9, 0, -7.2], 0, true); const bc = briefcase(S); const can = tunaCan(S); allow(S, ['nina', 'back wall']);
    return (t, dur) => { env.update(t); env.door.open(1); N.pose(ps(idle(t, 0.8), hit([[0, { rUp: 100, lFwd: 40 }], [0.3, { rUp: 152, lFwd: 70, lUp: -6, nod: -6 }]], t), { bob: Math.abs(Math.sin(t * 8)) * 0.1 })); const p = pinky(N, 'R'); bc.position.set(p.x, p.y + 0.9, p.z); bc.rotation.set(0, 0, Math.PI); hold(can, N, 'L', [0, 0.0, 0.2]);
      env.keyAt(6.2, 4.6, -3.2, 20); env.hallL.intensity = 40; camPath(cam, sm(t, 0, dur), [5.6, 2.4, 4.0], [5.8, 2.5, 3.2], [6.9, 4.4, -7.2], [6.9, 4.5, -7.2], 26, 27); }; },
  // 61 "I make biscuits."  — the last of the sun on the cat bed: the cat kneads the cushion, one paw, the other, eyes shut, grinning. Camera: close, barely moving.
  (S, cam) => { const env = ninaFlat(S, { time: 'evening' }); const C = cat(S, 'beam', [2, 0.45, 2.4], 16);
    return (t, dur) => { env.update(t); C.update(t, 'knead', { tail: 2, nod: 8, tilt: Math.sin(t * 3) * 4 }); const h = C.headPos(); env.keyAt(3.2, 2.6, 6.4, 5);
      camPath(cam, sm(t, 0, dur), [3.5, 2.2, 8.2], [3.3, 2.2, 7.6], [h.x, h.y - 0.7, h.z], [h.x, h.y - 0.7, h.z], 34, 35); }; },
];
