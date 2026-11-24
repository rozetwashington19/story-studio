import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  harborFront, truckCab, fogBank, fogRing, fogTouch, fogPhone, fogWisp } from '../../engine/kit.js';
import { you, abe, biscuit, mail, jogger, walker, walkerDog, youngAbe, crowd, ramp, sm, V, headOf, faceCam, fill, allow, hn, RUN, shake, far } from './common.js';

// ---------- shared builders ----------
export const TZ = 1;   // the truck drives along x on Front Street at z = TZ
// fog everywhere except a ring around the truck and a pocket around the camera (cameras inside the fog bank white out)
export const fmask = (x, r, cam, cr = 11) => (px, pz) => Math.min(fogRing(x, TZ, r, 6)(px, pz), sm(Math.hypot(px - cam.position.x, pz - cam.position.z), cr * 0.55, cr));
export function front(S, cam, { tx = 0, flash = false, n = 480 } = {}) {
  far(cam); const env = harborFront(S, { truck: [tx, TZ], flash }); S.userData.look = flash ? 'flash' : 'night';
  const fog = fogBank(S, { n, area: [-90, 100, -45, 17], y: [0, 12], size: [6, 13], col: 0xc0cad8, opacity: 0.5, seed: 51 });
  return { env, fog, upd(t, x, { r = 11, jingle = 1, cr = 11 } = {}) { env.update(t); env.truck.position.x = x; env.truck.update(t, { jingle }); fog.update(t, fmask(x, r, cam, cr), { drift: [0.4, 0] }); } };
}
// cab: Abe (driver, x -2.4) + you (x 2.4), seated; Biscuit on your lap
export function cab(S, { dog = true, ring = 12, youOn = true } = {}) { const env = truckCab(S, { ring }); S.userData.look = 'night';
  const Ab = abe(S, 'determined', [-2.4, 0, -0.5], 0); sitOn(Ab, 1.6); const A = youOn ? you(S, 'worried', [2.4, 0, -0.5], 0) : null; if (A) sitOn(A, 1.6); if (!youOn) dog = false;
  let B = null; if (dog) { B = biscuit(S); B.root.position.set(2.4, 2.25, 0.5); B.root.scale.setScalar(0.8); }
  allow(S, ['abe', 'seat*'], ['you', 'seat*'], ['you', 'biscuit'], ['biscuit', 'seat*']);
  // the tower's red light far ahead over the fog (seen through the windshield)
  const red = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff2a2a, fog: false, toneMapped: false })); red.position.set(-6, 12, 90); red.scale.setScalar(1.6); S.add(red);
  return { env, Ab, A, B, red };
}
export const WHEEL = { rFwd: 62, lFwd: 62, rUp: -10, lUp: -10 };
export const winCam = (cam, p, x, lens = [28, 30], dz = [9.6, 8.8], y = [5.3, 5.2]) => camPath(cam, p, [x, y[0], dz[0]], [x, y[1], dz[1]], [x * 0.6, 4.5, -0.6], [x * 0.6, 4.55, -0.6], lens[0], lens[1]);
const dogLap = (B, t, mode = 'sit') => { if (B) B.update(t, mode); };
export const frozen = (A, t, base = {}, seed = 0) => A.pose(addPose(base, { nod: -3 + Math.sin(t * 0.6 + seed) * 2, turn: Math.sin(t * 0.4 + seed) * 6, tilt: Math.sin(t * 0.7 + seed) * 2, bob: Math.sin(t * 1.1 + seed) * 0.02 }));
const legPhase = (A, x0) => (A.root.position.x - x0);

export const SHOTS_A = [
  // 2 "You chose the truck."  — windshield two-shot: Abe nods once, slams it into gear; you hug Biscuit, the fog ring glowing all round
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: ramp(t, 0.6, dur) * 6 }); env.meter('9:50', false, 0.82);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), hit([[0, { ...WHEEL, turn: -35 }], [0.5, { ...WHEEL, turn: -35, nod: 10 }], [0.9, { ...WHEEL, turn: 0, nod: 0 }], [9, WHEEL]], t)))); Ab.setFace(t < 0.7 ? 'softsmile' : 'determined');
      A.pose(addPose(SIT, addPose(idle(t, 0.7, 1), { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: t < 0.8 ? -25 : -8 }))); A.setFace(t < 0.8 ? 'nervous' : 'worried'); dogLap(B, t);
      env.wheel.rotation.z = Math.sin(t * 1.3) * 0.15;
      winCam(cam, t / dur, 0, [20, 22], [10.4, 9.2]); };
  },
  // 3 "Abe locks the doors. Five forty-eight."  — close: Abe's hand slams the door lock down (thud); cut: the dash clock 5:48 + his jaw set
  (S, cam) => { const { env, Ab, A, B } = cab(S, { dog: true });
    const clk = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.5), new THREE.MeshBasicMaterial({ toneMapped: false })); const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const cx = cv.getContext('2d');
    cx.fillStyle = '#0a0a0e'; cx.fillRect(0, 0, 256, 96); cx.fillStyle = '#ff9a3a'; cx.font = '900 72px monospace'; cx.textAlign = 'center'; cx.fillText('5:48', 128, 76); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; clk.material.map = tx;
    clk.position.set(-1.0, 4.35, 2.75); clk.rotation.set(0.25, Math.PI, 0); S.add(clk);
    const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xd8dce2, metalness: 0.8, roughness: 0.3 })); S.add(lock);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('9:49', false, 0.81); const [k, u] = seg(t, dur, [0.45]);
      const press = hn([[0, 0], [0.45, 0], [0.62, 1], [9, 1]], t); { const p = pinky(Ab, 'R'); lock.position.set(p.x, p.y + 0.2 - press * 0.2, p.z); }
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), hit([[0, { lFwd: 60, lUp: -10, rUp: 5, rFwd: 60, turn: -40 }], [0.45, { lFwd: 60, lUp: -10, rUp: 8, rFwd: 72, turn: -45, nod: 8 }], [0.65, { lFwd: 60, lUp: -10, rUp: 5, rFwd: 66, turn: -40, nod: 12 }], [1.2, { ...WHEEL, turn: 0 }], [9, WHEEL]], t))));
      Ab.setFace(t < 1.1 ? 'determined' : 'angry'); A.pose(addPose(SIT, addPose(idle(t, 0.7, 1), { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: -20 }))); A.setFace('worried'); dogLap(B, t); shake(cam, t, 0.62, 0.5);
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y - 0.5, h.z], 0, { dist: 7.4, lens: 30, side: 0.6, push: 0.8 }); clk.visible = false; };
  },
  // 4 "He drives, and the clear circle rolls with you."  — high wide over Front Street: the truck rolls left→right, a moving bubble of clear air cut out of the fog
  (S, cam) => { const F = front(S, cam, { n: 520 });
    return (t, dur) => { const x = -26 + t * 5.5; camPath(cam, t / dur, [x - 12, 34, 16.5], [x - 8, 32, 16.5], [x + 3, 0, -4], [x + 4, 0, -4], 22, 24); F.upd(t, x, { r: 11, cr: 6 }); };
  },
  // 5 "Outside, the fog has the whole town."  — low on the boardwalk: dead lamps, boats half-swallowed, the tower's red light; the truck's glow slides past behind the bollards
  (S, cam) => { const F = front(S, cam, { n: 520 });
    return (t, dur) => { const x = -38 + t * 7; camPath(cam, t / dur, [-24, 3.2, 12.5], [-22, 3.8, 12.5], [0, 5, -8], [4, 5.5, -8], 22, 24);
      F.upd(t, x, { r: 10, cr: 20 }); F.env.lamps.forEach((l, i) => { if (l.light) l.light.intensity = i < 3 ? 14 : 18; }); };
  },
  // 6 "A mailman, frozen mid-throw."  — the truck's pink glow sweeps over a mailman on the sidewalk, arm cocked back with a parcel, grey and blank; push-in to his eyes
  (S, cam) => { const F = front(S, cam); const M = mail(S, 'sleepy', [-14, 0, 9.0], 20); fogTouch(M, 0.9);
    const parcel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.7), new THREE.MeshStandardMaterial({ color: 0xb8864a, roughness: 0.8 })); S.add(parcel);
    fill(S, [-12.5, 6.5, 14], 5, 0xb8c8f0, 12);
    return (t, dur) => { const x = -30 + t * 6;
      frozen(M, t, { rUp: 40, rFwd: 150, lFwd: 25, lUp: 10, lean: -6, bodyTurn: -15, rLeg: 20, lLeg: -15 }); const p = pinky(M, 'R'); parcel.position.set(p.x, p.y + 0.3, p.z - 0.1);
      const h = headOf(M); camPath(cam, t / dur, [h.x + 2.6, h.y + 0.6, 16.2], [h.x + 1.4, h.y + 0.1, 14.4], [h.x + 0.6, h.y - 0.9, h.z], [h.x + 0.1, h.y - 0.1, h.z], 26, 36); F.upd(t, x, { r: 10, cr: 13 }); };
  },
  // 7 "A jogger, stopped mid-stride."  — the truck slides through frame (a wipe), revealing a jogger on the boardwalk frozen mid-stride, ponytail still swinging
  (S, cam) => { const F = front(S, cam); const J = jogger(S, 'sleepy', [2, 0, -9.0], 70); fogTouch(J, 0.9); fill(S, [4.5, 6, -4.5], 6, 0xb8c8f0, 12);
    return (t, dur) => { const x = -14 + t * 9;
      frozen(J, t, { rLeg: 45, lLeg: -40, rFwd: -50, lFwd: 60, lean: 10, bob: 0.1 }, 1);
      camPath(cam, t / dur, [9.5, 3.6, 4.6], [8.0, 4.2, 2.8], [2.6, 3.2, -9], [2.2, 4.2, -9], 28, 32); F.upd(t, x, { r: 10, cr: 13 }); };
  },
  // 8 "A man and his dog. The dog still knows him."  — wide: a fisherman frozen mid-step, his little black dog tugging the leash, barking up at him; cut close: the dog nudges his boot
  (S, cam) => { const F = front(S, cam); const W = walker(S, 'sleepy', [16, 0, 9.4], -70); fogTouch(W, 0.9); const Dg = walkerDog(S); Dg.root.position.set(12.4, 0, 10.4); Dg.root.rotation.y = 70 * D;
    const leash = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), new THREE.MeshStandardMaterial({ color: 0xd8302a })); S.add(leash);
    fill(S, [14, 6, 15], 6, 0xc8d4f0, 12);
    return (t, dur) => { const x = 40 - t * 3; const [k, u] = seg(t, dur, [0.5]);
      frozen(W, t, { rFwd: 30, rUp: -5, lFwd: -10, rLeg: 14, lLeg: -12 }, 2); W.setFace(t > dur * 0.8 ? 'sad' : 'sleepy');
      const tug = Math.max(0, Math.sin(t * 5)) * 0.4; Dg.root.position.x = 12.4 - tug * (k === 0 ? 1 : 0) + (k ? 2.0 : 0); Dg.root.rotation.y = (k ? 80 : 70) * D;
      Dg.update(t, k ? (Math.sin(t * 3) > 0 ? 'bark' : 'run') : 'bark'); if (k) Dg.root.position.x = 13.4 + Math.max(0, Math.sin(t * 4)) * 0.4;
      const hp = pinky(W, 'R'); const dp = Dg.head.getWorldPosition(new THREE.Vector3()); const mid = hp.clone().add(dp).multiplyScalar(0.5); leash.position.copy(mid);
      leash.scale.y = hp.distanceTo(dp); leash.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dp.clone().sub(hp).normalize());
      if (k === 0) camPath(cam, u, [11, 4.6, 16.8], [12, 4.4, 16.4], [14.6, 3.0, 9.6], [14.6, 3.2, 9.6], 24, 26);
      else camPath(cam, u, [16.6, 2.4, 15.4], [16.0, 2.2, 14.6], [14.4, 1.9, 10.4], [14.6, 2.0, 10.4], 30, 34); F.upd(t, x, { r: 10, cr: 13 }); };
  },
  // 9 "Abe. What's really out there?"  — close on you, turning to Abe; Biscuit looks up too
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: 6 }); env.meter('9:20', false, 0.78);
      A.pose(addPose(SIT, addPose(addPose(idle(t, 0.7, 1), talk(t, 1)), hit([[0, { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: 0 }], [0.4, { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: -40, tilt: -4 }], [9, { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: -38 }]], t))));
      A.setFace(t < 0.5 ? 'worried' : 'thinking'); Ab.pose(addPose(SIT, addPose(idle(t, 0.4), WHEEL))); dogLap(B, t);
      const h = headOf(A); faceCam(cam, t / dur, [h.x, h.y, h.z], -18, { dist: 6.6, lens: 36, side: -0.6, push: 0.8 }); };
  },
  // 10 "He keeps his eyes on the road."  — close on Abe, jaw tight, eyes fixed ahead; the fog streams past the glass
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: 7 }); env.meter('9:18', false, 0.78);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.3), addPose(WHEEL, { nod: 4, turn: Math.sin(t * 0.8) * 2 })))); Ab.setFace(t < dur * 0.6 ? 'neutral' : 'sad');
      A.pose(addPose(SIT, addPose(idle(t, 0.7, 1), { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: -38 }))); dogLap(B, t);
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y, h.z], 0, { dist: 7.0, lens: 34, side: 1.2, push: 1.0 }); };
  },
  // 11 "Thirty years ago, this fog took the pier."  — Abe talks (close) → FLASHBACK: the pier lit for a dance thirty years ago, a white wall rolling in off the bay
  (S, cam) => { far(cam); const env = harborFront(S, { truck: false, flash: true }); S.userData.look = 'flash';
    const fog = fogBank(S, { n: 300, area: [20, 80, -110, -20], y: [-1, 14], size: [7, 14], col: 0xd8dce6, opacity: 0.55, seed: 61 });
    const C = [0, 1, 2].map(i => crowd(S, i, 'smile', [[45.4, 48.6, 46.2][i], 0, [-28, -32, -37][i]], (i - 1) * 30));
    fill(S, [47, 7, -24], 10, 0xffd8b0, 18);
    return (t, dur) => { env.update(t); const front2 = -100 + t * 14; fog.update(t, (x, z) => sm(z, front2 + 12, front2), { drift: [0, 0] });
      C.forEach((c, i) => c.pose(addPose(idle(t, 1, i), { rUp: 30 + Math.sin(t * 6 + i) * 20, lUp: 30 + Math.sin(t * 6 + i + 1) * 20, bob: Math.abs(Math.sin(t * 6 + i)) * 0.15 })));
      camPath(cam, t / dur, [47, 6.5, -12], [47, 6.0, -15], [47, 4, -40], [47, 4.5, -48], 24, 28); };
  },
  // 12 "One night. Everyone on it. Nobody believed me."  — the fog has the pier: the dancers stand blank; young Abe in his hard hat stares → back in the cab: old Abe's eyes, wet
  (S, cam) => { far(cam); const F = { env: harborFront(S, { truck: false, flash: true }) }; S.userData.look = 'flash';
    const fog = fogBank(S, { n: 300, area: [20, 80, -110, -14], y: [-1, 14], size: [7, 14], col: 0xd8dce6, opacity: 0.5, seed: 62 });
    const C = [0, 1, 2].map(i => { const c = crowd(S, i, 'sleepy', [[45.4, 48.6, 46.2][i], 0, [-28, -32, -37][i]], (i - 1) * 30); fogTouch(c, 0.9); return c; });
    const YA = youngAbe(S, 'shock', [46.4, 0, -17], 10); fill(S, [46, 7, -10], 10, 0xffd8b0, 16);
    return (t, dur) => { F.env.update(t); fog.update(t, (x, z) => sm(z, -22, -30) * (x > 30 ? 1 : 0.3));
      C.forEach((c, i) => frozen(c, t, { rUp: 40 - i * 8, lUp: 20 + i * 6 }, i));
      YA.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 20, lFwd: 20 }], [0.6, { rFwd: 70, lFwd: 10, rUp: -10, lean: 6 }], [9, { rFwd: 70, lFwd: 10, rUp: -10, lean: 6 }]], t)));
      const h = headOf(YA); camPath(cam, t / dur, [h.x - 1.6, h.y + 1.2, h.z + 11], [h.x - 1.0, h.y + 0.6, h.z + 8.5], [h.x + 0.4, h.y - 0.6, h.z - 8], [h.x, h.y - 0.3, h.z], 26, 30); };
  },
  // 13 "It doesn't come from the sea, kid."  — Abe finally looks at you, then his eyes lift to the windshield: far ahead, the tower's red light blinks over the fog
  (S, cam) => { const { env, Ab, A, B, red } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: 6 }); env.meter('9:10', false, 0.76); const [k, u] = seg(t, dur, [0.55]); red.visible = Math.sin(t * 2.6) > -0.3;
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.4), talk(t, t < dur * 0.55 ? 1 : 0)), addPose(WHEEL, k === 0 ? { turn: 35 } : { turn: -10, nod: -14 })))); Ab.setFace(k ? 'worried' : 'determined');
      A.pose(addPose(SIT, addPose(idle(t, 0.7, 1), { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: k ? -5 : -38, nod: k ? -10 : 0 }))); A.setFace(k ? 'scared' : 'worried'); dogLap(B, t);
      if (k === 0) { const h = headOf(Ab); faceCam(cam, u, [h.x, h.y, h.z], 25, { dist: 6.8, lens: 36, side: 0.4, push: 0.6 }); }
      else camPath(cam, u, [0.5, 6.0, -6.5], [0.4, 6.3, -5.4], [-1.0, 6.6, 30], [-2.0, 7.2, 40], 26, 32); };
  },
  // 14 "Then the speaker crackles. Four minutes left."  — the battery LCD flickers to 4:00 in red, the speaker grille shudders; both of you turn to it
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: t < 0.3 ? 1 : (Math.sin(t * 31) > 0 ? 0.3 : 1), flicker: 1, drive: 6 }); env.meter('4:00', true, 0.32); const [k, u] = seg(t, dur, [0.5]);
      env.spk.position.x = 0.8 + Math.sin(t * 70) * 0.03 * (t > 0.3 ? 1 : 0);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.4), addPose(WHEEL, { turn: 30, nod: 15 })))); Ab.setFace('worried');
      A.pose(addPose(SIT, addPose(idle(t, 0.7, 1), { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: -30, nod: 22 }))); A.setFace('shock'); dogLap(B, t, 'bark');
      if (k === 0) camPath(cam, u, [0.8, 4.9, 0.6], [0.8, 4.6, 1.3], [0.8, 3.9, 2.7], [0.8, 3.95, 2.7], 32, 40);
      else winCam(cam, u, 0, [20, 22], [10.2, 9.4]); };
  },
  // 15 "We need more music. Dot's record shop."  — Abe yanks the wheel hard (the fog swings across the glass), talking fast
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: 9 }); env.meter('3:52', true, 0.3); const turn = hn([[0, 0], [0.5, 0], [0.9, 1], [9, 1]], t);
      env.wheel.rotation.z = -turn * 1.6; Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.4), talk(t, 1.2)), { ...WHEEL, rUp: -10 - turn * 10, lUp: -10 + turn * 15, bodyTilt: turn * 5, turn: 20 }))); Ab.setFace('determined');
      A.pose(addPose(SIT, addPose(idle(t, 0.7, 1), { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, bodyTilt: -turn * 7, turn: -30 }))); A.setFace('nervous'); dogLap(B, t);
      env.fog.rotation.y = -turn * 0.25;
      winCam(cam, t / dur, -1.2, [24, 26], [9.8, 9.0]); };
  },
  // 16 "Your phone buzzes. It's Nell."  — the phone buzzes in your lap; you lift it, face lit blue
  (S, cam) => { const { env, Ab, A } = cab(S, { dog: false }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: 6 }); env.meter('3:40', true, 0.28);
      A.pose(addPose(SIT, addPose(idle(t, 0.6), hit([[0, { rFwd: 35, lFwd: 35, nod: 10 }], [0.6, { rFwd: 35, lFwd: 35, nod: 18 }], [1.0, { rFwd: 78, rUp: -20, lFwd: 35, nod: 14 }], [dur, { rFwd: 78, rUp: -20, lFwd: 35, nod: 14 }]], t))));
      const p = pinky(A, 'R'); const buzz = t < 0.9 ? Math.sin(t * 80) * 0.04 : 0;
      if (t < 0.8) { ph.position.set(2.4 + buzz, 2.3, 0.6); ph.rotation.set(-Math.PI / 2, 0, 0); } else { ph.position.set(p.x + 0.35, p.y + 0.15, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); }
      ph.screen('chat', ramp(t, 0.1, 0.5), { time: '5:49', msgs: [[0, ["Fog's at the", 'roof door.', 'Pip is scared.']]] }); A.setFace(t > 0.8 ? 'worried' : 'nervous'); Ab.pose(addPose(SIT, addPose(idle(t, 0.4), WHEEL)));
      const h = headOf(A); camPath(cam, t / dur, [h.x - 0.2, h.y + 0.6, 9.8], [h.x - 0.1, h.y + 0.2, 8.6], [h.x, h.y - 1.2, h.z + 0.4], [h.x, h.y - 0.4, h.z], 30, 34); };
  },
  // 17 "Fog's at the roof door. Pip is scared."  — over your shoulder onto the phone: Nell's message types in
  (S, cam) => { const { env, Ab, A } = cab(S, { dog: false }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: 6 }); env.meter('3:35', true, 0.27);
      A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 78, rUp: -20, lFwd: 35, nod: 16 }))); A.setFace('worried'); Ab.pose(addPose(SIT, addPose(idle(t, 0.4), WHEEL)));
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.6, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0);
      ph.screen('chat', ramp(t, 0.1, 0.9), { time: '5:49', msgs: [[0, ["Fog's at the", 'roof door.', 'Pip is scared.']]] });
      ph.updateMatrixWorld(true); const c = ph.position; camPath(cam, t / dur, [c.x - 0.1, c.y + 0.9, c.z - 1.4], [c.x - 0.05, c.y + 0.75, c.z - 1.15], [c.x, c.y, c.z], [c.x, c.y + 0.02, c.z], 36, 40);
      S.userData.dof = false; };
  },
  // 18 "You type back: Hold on. I'm coming."  — close on your face over the phone glow; thumbs tap, then you look up, determined
  (S, cam) => { const { env, Ab, A } = cab(S, { dog: false }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 1, drive: 6 }); env.meter('3:30', true, 0.26); const [k, u] = seg(t, dur, [0.45]);
      A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 78, rUp: -20, lFwd: 60, lUp: -25, nod: k ? 2 : 16, rUp2: 0 }))); A.setFace(k ? 'determined' : 'worried');
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.6 + Math.sin(t * 20) * 0.01, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0);
      ph.screen('chat', 1 * ramp(t, 0.3, 1.4), { time: '5:50', msgs: [[0, ["Fog's at the", 'roof door.', 'Pip is scared.']], [1, ['Hold on.', "I'm coming."]]] }); Ab.pose(addPose(SIT, addPose(idle(t, 0.4), WHEEL)));
      if (k === 0) { ph.updateMatrixWorld(true); const c = ph.position; camPath(cam, u, [c.x - 0.1, c.y + 0.9, c.z - 1.4], [c.x - 0.05, c.y + 0.75, c.z - 1.15], [c.x, c.y, c.z], [c.x, c.y + 0.02, c.z], 36, 40); S.userData.dof = false; }
      else { const h = headOf(A); faceCam(cam, u, [h.x, h.y, h.z], -10, { dist: 6.4, lens: 38, side: -0.4, push: 0.7 }); } };
  },
  // 19 "Five fifty-one. The pier. One minute left."  — low wide: the truck swings in and brakes in front of DOT'S RECORDS, its ring of clear air shrinking, the fog leaning in
  (S, cam) => { const F = front(S, cam);
    return (t, dur) => { const x = 34 - 14 * Math.pow(1 - ramp(t, 0, 1.6), 2); const r = 11 - ramp(t, 0.5, dur) * 2.5;
      camPath(cam, t / dur, [22, 1.8, 13], [24, 2.6, 12], [32, 5, -6], [33, 6.5, -8], 22, 24); F.upd(t, x, { r, cr: 8, jingle: t > 1.6 && Math.sin(t * 23) > 0.6 ? 0.4 : 1 });
      F.env.truck.rotation.z = t > 1.5 && t < 1.9 ? Math.sin((t - 1.5) * 15) * 0.012 : 0; };
  },
  // 20 "Go. Find anything that plays."  — Abe, close, pointing past you at the shop door, talking; you nod and grab the handle
  (S, cam) => { const { env, Ab, A, B } = cab(S);
    return (t, dur) => { env.update(t, { jingle: 1 }); env.meter('1:00', true, 0.08);
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.4), talk(t, 1.3)), hit([[0, WHEEL], [0.4, { rFwd: 90, rUp: -30, lFwd: 62, lUp: -10, turn: 30 }], [9, { rFwd: 90, rUp: -32, lFwd: 62, lUp: -10, turn: 32 }]], t)))); Ab.setFace('determined');
      A.pose(addPose(SIT, addPose(idle(t, 0.7, 1), hit([[0, { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: -30 }], [0.9, { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, turn: -30, nod: 12 }], [1.3, { rFwd: 40, lFwd: 40, rUp: 40, lUp: -20, turn: 30 }], [9, { rFwd: 40, lFwd: 40, rUp: 45, lUp: -20, turn: 35 }]], t))));
      A.setFace(t < 1 ? 'nervous' : 'determined'); dogLap(B, t);
      winCam(cam, t / dur, -0.6, [22, 24], [9.8, 9.2]); };
  },
  // 21 "You run inside with Biscuit."  — tracking: you jump down from the truck and sprint across the boardwalk, Biscuit at your heels, the shop door swinging open
  (S, cam) => { const F = front(S, cam); const A = you(S, 'determined', [30, 0, -3.4], 180); const B = biscuit(S); const fl = fill(S, [30, 6, -6], 9, 0xffd8e8, 12);
    return (t, dur) => { const k = ramp(t, 0.1, dur * 0.9);
      const z = -3.4 - k * 7.2, x = 30 + k * 4.8; A.root.position.set(x, 0, z); A.root.rotation.y = (180 - 34) * D; A.pose(addPose(RUN(t, 1), { nod: -2 }));
      B.root.position.set(x + 2.3, 0, z - 0.3); B.root.rotation.y = (180 - 34) * D; B.update(t, 'run'); F.env.shopDoor.open(ramp(t, dur * 0.5, dur * 0.8));
      fl.position.set(x + 3, 5.5, z - 0.5); camPath(cam, t / dur, [x + 7.5, 4.6, z - 3.0], [x + 7.0, 4.6, z - 2.6], [x, 3.6, z], [x, 3.8, z], 26, 28); F.upd(t, 32, { r: 8.5, cr: 9, jingle: Math.sin(t * 23) > 0.7 ? 0.3 : 1 }); };
  },
];
