import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  towerControl, hospitalStairs, fogTouch, fogPhone } from '../../engine/kit.js';
import { you, abe, nell, pip, youngAbe, crowd, biscuit, ramp, sm, V, headOf, faceCam, fill, allow, hn, shake, far } from './common.js';
import { board, cab, HOLD, PATH, PATH_RY, WHEEL, winCam, frozen } from './shots_a.js';

// a sheet glued in front of the lens: white flash transitions, or a phone-photo bezel
function lensSheet(S, cam, { col = 0xffffff, frame = false } = {}) {
  let mat;
  if (frame) { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const x = c.getContext('2d'); x.clearRect(0, 0, 540, 960);
    x.fillStyle = '#0a0a0e'; x.fillRect(0, 0, 540, 70); x.fillRect(0, 900, 540, 60); x.fillRect(0, 0, 22, 960); x.fillRect(518, 0, 22, 960);
    x.fillStyle = '#fff'; x.font = '800 30px Inter, sans-serif'; x.textAlign = 'left'; x.fillText('Nell', 40, 48); x.textAlign = 'right'; x.fillText('5:55  ▮ 3%', 500, 48);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  } else mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.renderOrder = 999; m.frustumCulled = false; S.add(m);
  m.place = (k = 1) => { const d = 0.5, hgt = 2 * d * Math.tan(cam.fov * D / 2), w = hgt * cam.aspect; m.scale.set(w * 1.02, hgt * 1.02, 1);
    m.position.copy(cam.position).add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(d)); m.quaternion.copy(cam.quaternion); if (!frame) mat.opacity = k; };
  return m;
}
const CRANK = (t, sp = 11) => ({ rFwd: 70 + Math.sin(t * sp) * 12, rUp: 10 + Math.cos(t * sp) * 10, lFwd: 30, lean: 12, nod: 14, turn: -30 });
const stairs = (S) => { const env = hospitalStairs(S); S.userData.look = 'night';
  const N = nell(S, 'worried', [-1.5, 7.2, -5.4], 10); const P = pip(S, 'scared', [1.4, 7.2, -5.2], -20); allow(S, ['nell', 'pip'], ['nell', 'landing'], ['pip', 'landing']);
  const ph = fogPhone(S); return { env, N, P, ph }; };
const room = (S) => { const env = towerControl(S); S.userData.look = 'flash'; S.userData.comp = 1.3; const Y = youngAbe(S, 'worried', [1.0, 0, -3.6], 150); return { env, Y }; };

export const SHOTS_B = [
  // 22 "And for one second, you see it."  — push into Abe's eyes as he stares at the tower light… white flash
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'worried' }); const fl = lensSheet(S, cam);
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.4), { rFwd: 60, rUp: -20, lFwd: 40, nod: -12 }))); A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, nod: -10 })));
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y + 0.2, h.z], 0, { dist: 5.6, lens: 34, side: 0.2, push: 2.2 }); fl.place(sm(t, dur * 0.55, dur)); };
  },
  // 23 "Young Abe, in a room full of humming machines."  — FLASHBACK (thirty years ago, dusk): the transmitter room, scopes and reels alive, young Abe at the console
  (S, cam) => { const { env, Y } = room(S); const fl = lensSheet(S, cam);
    return (t, dur) => { env.needle(0.55 + t * 0.05); env.update(t, { hum: 1 }); Y.pose(addPose(idle(t, 0.8), { rFwd: 40, lFwd: 25, nod: 10, turn: Math.sin(t * 0.8) * 15 }));
      const [k, u] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, u, [6.5, 7.2, 10], [4.5, 6.4, 8.5], [0, 4, -5], [0.5, 4, -5], 22, 24);
      else camPath(cam, u, [5.0, 4.5, -5.0], [4.6, 4.5, -4.8], [1.0, 4.8, -3.6], [1.0, 4.8, -3.6], 28, 30);
      fl.place(1 - sm(t, 0, 0.35)); };
  },
  // 24 "A needle shaking in the red."  — tight on the VU meter: the needle trembles hard against the red, the console lamps flicker
  (S, cam) => { const { env, Y } = room(S);
    return (t, dur) => { env.needle(0.86); env.update(t, { hum: 2.2 }); Y.pose(addPose(idle(t, 0.8), { rFwd: 40, lFwd: 25, nod: 14 }));
      camPath(cam, t / dur, [0.8, 4.9, -3.8], [0.5, 4.7, -4.6], [0, 4.4, -7.3], [0, 4.4, -7.3], 34, 42); S.userData.dof = false; };
  },
  // 25 "'I told them it was broken. They laughed.'"  — young Abe turns, pleading, to two engineers in the doorway who just laugh
  (S, cam) => { const { env, Y } = room(S); const C0 = crowd(S, 0, 'laugh', [-4.0, 0, 6.0], 160), C1 = crowd(S, 1, 'smirk', [1.0, 0, 7.0], 180);
    return (t, dur) => { env.needle(0.82); env.update(t, { hum: 1.5 }); Y.root.rotation.y = hn([[0, 180], [0.4, 180], [0.8, 20], [9, 20]], t) * D;
      Y.pose(addPose(addPose(idle(t, 0.9), talk(t, t > 0.6 ? 1.2 : 0)), hit([[0, { rFwd: 40, lFwd: 25 }], [0.8, { rFwd: 70, rUp: -10, lFwd: 20, lean: 6 }], [9, { rFwd: 75, rUp: -12, lFwd: 20, lean: 6 }]], t)));
      Y.setFace(t > 0.8 ? 'worried' : 'shock');
      C0.pose(addPose(idle(t, 1.2, 1), { bob: Math.abs(Math.sin(t * 9)) * 0.12, nod: -8 + Math.sin(t * 9) * 5, rFwd: 40, lFwd: 30, lean: -6 })); C1.pose(addPose(idle(t, 1, 2), { rFwd: 20, lUp: 10, turn: -15, tilt: 6, bob: Math.abs(Math.sin(t * 7)) * 0.06 }));
      const h = headOf(Y); camPath(cam, t / dur, [-2.2, 5.0, 3.6], [-1.6, 4.9, 2.8], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.3, h.z], 26, 30); };
  },
  // 26 "Back in the truck, the record starts to slow."  — the record turning slower, the notes thinning out, the fog edging back onto the glass
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFace: 'worried' });
    return (t, dur) => { const sp = 1 - ramp(t, 0, dur) * 0.6; env.update(t, { jingle: 0, r: 13 - ramp(t, 0, dur) * 3 }); env.meter('0:00', true, 0); sing(t, sp * 0.7, sp);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 30, lFwd: 40, turn: 30, nod: 14 }))); A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -30, nod: 16 })));
      const b = g.position; camPath(cam, t / dur, [b.x - 1.8, b.y + 2.0, b.z - 2.2], [b.x - 1.2, b.y + 1.5, b.z - 1.6], [b.x, b.y + 0.4, b.z], [b.x, b.y + 0.45, b.z], 30, 36); };
  },
  // 27 "You crank it. Two more minutes, maybe."  — you lean over and wind the crank hard; the record picks up speed again
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFace: 'worried' }); allow(S, ['you', 'gramophone'], ['you', 'dash*']);
    return (t, dur) => { const sp = 10 + t * 4; env.update(t, { jingle: 0, r: 10 + ramp(t, 0, dur) * 3 }); env.meter('0:00', true, 0); sing(t, 0.4 + ramp(t, 0.3, dur) * 0.6, 0.4 + ramp(t, 0, dur) * 0.6); g.crank.rotation.x = -t * sp;
      A.pose(addPose(SIT, addPose(idle(t, 0.5), CRANK(t, sp)))); A.setFace('determined'); Ab.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 30, lFwd: 40, turn: 30, nod: 10 })));
      const h = headOf(A); camPath(cam, t / dur, [h.x + 1.2, h.y + 0.6, 8.6], [h.x + 0.8, h.y + 0.4, 7.6], [h.x - 0.8, h.y - 0.8, h.z + 1.4], [h.x - 0.8, h.y - 0.7, h.z + 1.4], 28, 32); };
  },
  // 28 "Your phone buzzes. Three percent battery."  — the phone jitters on your knee: 3%, red
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'worried' }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      A.pose(addPose(SIT, addPose(idle(t, 0.5), hit([[0, { rFwd: 35, lFwd: 35, nod: 14 }], [0.6, { rFwd: 78, rUp: -20, lFwd: 35, nod: 14 }], [9, { rFwd: 78, rUp: -20, lFwd: 35, nod: 14 }]], t))));
      Ab.pose(addPose(SIT, addPose(idle(t, 0.4), { rFwd: 30, lFwd: 40, turn: 30 }))); const p = pinky(A, 'R'); const bz = t < 0.6 ? Math.sin(t * 80) * 0.04 : 0;
      if (t < 0.55) { ph.position.set(2.4 + bz, 2.3, 0.6); ph.rotation.set(-Math.PI / 2, 0, 0); } else { ph.position.set(p.x + 0.35, p.y + 0.6, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); }
      ph.screen('chat', 1, { time: '5:55 · 3%', msgs: [[0, ["It's under", 'the door.']], [0, ['📷 Photo']]] });
      ph.updateMatrixWorld(true); const c = ph.position; camPath(cam, t / dur, [c.x - 0.1, c.y + 0.9, c.z - 1.4], [c.x - 0.05, c.y + 0.75, c.z - 1.15], [c.x, c.y, c.z], [c.x, c.y + 0.02, c.z], 36, 40); S.userData.dof = false; };
  },
  // 29 "It's Nell. A photo."  — the photo fills the screen (phone bezel): the hospital stairwell from the top, Nell's arm, Pip
  (S, cam) => { const { env, N, P } = stairs(S); const fr = lensSheet(S, cam, { frame: true }); S.userData.handheld = false;
    return (t, dur) => { env.update(t, { level: 5 }); N.pose(addPose(idle(t, 0.4), { rFwd: 120, rUp: -30, lFwd: 40, lUp: -20, nod: 10 })); P.pose(addPose(idle(t, 0.5), { lFwd: 60, lUp: -40, nod: 8 }));
      camPath(cam, t / dur, [1.2, 11.4, -2.2], [1.2, 11.3, -2.4], [0, 1.0, 8], [0, 1.0, 8], 22, 22); fr.place(); };
  },
  // 30 "A stairwell, and fog climbing the steps."  — looking down the stairwell: the white rising step by step, the tube light stuttering
  (S, cam) => { const { env, N, P } = stairs(S);
    return (t, dur) => { env.update(t, { level: 5 + ramp(t, 0, dur) * 2 }); N.pose(addPose(idle(t, 0.7), { rFwd: 30, lFwd: 20, nod: 16 })); P.pose(addPose(idle(t, 0.9, 1), { lFwd: 60, lUp: -40, nod: 14 }));
      camPath(cam, t / dur, [2.6, 10.8, -2.6], [2.2, 10.6, -2.0], [-0.4, 3.0, 5.0], [-0.4, 4.0, 4.0], 22, 24); };
  },
  // 31 "Pip, holding Nell's sleeve."  — close two-shot on the landing: Pip's hand bunched in Nell's sleeve, Nell's other hand on her head
  (S, cam) => { const { env, N, P } = stairs(S); P.root.position.set(1.0, 7.2, -5.0); allow(S, ['pip', 'nell']);
    return (t, dur) => { env.update(t, { level: 7 }); N.pose(addPose(idle(t, 0.6), { rFwd: 40, rUp: -45, lFwd: 20, nod: 12, turn: -10 })); N.setFace('worried');
      P.pose(addPose(idle(t, 0.9, 1), { rFwd: 50, rUp: -10, lFwd: 50, lUp: -45, nod: -8, turn: 10, bob: Math.sin(t * 14) * 0.01 })); P.setFace('scared');
      camPath(cam, t / dur, [0.4, 10.4, 2.8], [0.2, 10.2, 1.8], [-0.2, 10.4, -5.2], [-0.2, 10.5, -5.2], 26, 30); };
  },
  // 32 "'Top floor. One door left. Where are you?'"  — Nell typing fast with one thumb, jaw tight, the ROOF door at her back
  (S, cam) => { const { env, N, P, ph } = stairs(S);
    return (t, dur) => { env.update(t, { level: 7.5 }); N.pose(addPose(addPose(idle(t, 0.6), talk(t, 0.8)), { rFwd: 120, rUp: -32, lFwd: 25, nod: 14 })); N.setFace('determined');
      const p = pinky(N, 'R'); ph.position.set(p.x + 0.1, p.y + 0.3, p.z + 0.1); ph.rotation.set(-0.3, 0.3, 0); ph.screen('chat', ramp(t, 0.2, dur), { time: '5:55', msgs: [[1, ['Top floor.', 'One door left.', 'Where are you?']]] });
      P.pose(addPose(idle(t, 0.9, 1), { lFwd: 60, lUp: -40, nod: 6, turn: 20 }));
      const h = headOf(N); faceCam(cam, t / dur, [h.x, h.y - 0.4, h.z], 10, { dist: 7.0, lens: 30, side: 0.8, push: 0.6 }); };
  },
  // 33 "You look back at the shop."  — at the truck's open door you turn: the shop is a blur of warm light at the end of the white
  (S, cam) => { const { env, A, B, Dt } = board(S, cam, { youAt: [5.0, 0, 3.6], youRy: 20, dotFog: 1, dotFace: 'sleepy' }); env.cabDoor.open(1);
    return (t, dur) => { env.update(t, { cx: 3, cz: 9, r: 6, music: 0, glowK: 0.3 }); A.root.rotation.y = hn([[0, 20], [0.3, 20], [0.9, 190], [9, 190]], t) * D; A.pose(addPose(idle(t, 0.7), { rFwd: 15, lFwd: 15 })); A.setFace('worried');
      B.root.position.set(3.0, 0, 3.0); B.root.rotation.y = 200 * D; B.update(t, 'sit'); frozen(Dt, t, { rFwd: 30 }, 4);
      const h = headOf(A); camPath(cam, t / dur, [h.x + 1.6, h.y + 0.6, h.z + 4.4], [h.x + 1.3, h.y + 0.5, h.z + 3.8], [h.x - 1.6, h.y - 0.8, h.z - 6], [h.x - 2.4, h.y - 0.8, h.z - 9], 26, 28); };
  },
  // 34 "Dot is standing in the doorway, grey again."  — push in on Dot: colour gone, hand still raised on the door, the fog folding around her (hook source)
  (S, cam) => { const { env, Dt } = board(S, cam, { dotFog: 1, dotFace: 'sleepy', dog: false, youAt: [30, 0, 30] }); env.door.open(1);
    return (t, dur) => { env.update(t, { music: 0, glowK: 0.3, mask: (x, z) => z > -5 && Math.abs(x) > 2.6 ? 1 : 0 }); frozen(Dt, t, { lUp: 70, lFwd: 20, rFwd: 20 }, 4);
      const h = headOf(Dt); camPath(cam, t / dur, [h.x + 0.8, h.y + 0.2, h.z + 7.4], [h.x + 0.4, h.y + 0.1, h.z + 4.6], [h.x, h.y - 0.6, h.z], [h.x, h.y - 0.3, h.z], 28, 34); };
  },
  // 35 "You took her music."  — close on you: the guilt lands; eyes fill
  (S, cam) => { const { env, A } = board(S, cam, { youAt: [5.0, 0, 3.6], youRy: 190, dotFog: 1, dotFace: 'sleepy', dog: false });
    return (t, dur) => { env.update(t, { cx: 3, cz: 9, r: 6, music: 0, glowK: 0.3 }); A.pose(addPose(idle(t, 0.6), { rFwd: 10, lFwd: 10, nod: 6 })); A.setFace(t > dur * 0.4 ? 'teary' : 'sad');
      const h = headOf(A); faceCam(cam, t / dur, [h.x, h.y, h.z], 190, { dist: 6.2, lens: 38, side: -0.4, push: 0.6 }); };
  },
  // 36 "Abe starts the engine. 'Only I can shut it down.'"  — Abe turns the key, the dash lights blink on, he grips the wheel and talks, steady now
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'determined' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 12, drive: 0 }); env.meter(t < 0.5 ? '0:00' : 'ENGINE', t < 0.5, 0); sing(t, 0.8, 0.9); env.dome.intensity = t < 0.5 ? 5 : 9;
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.5), talk(t, t > 0.7 ? 1.1 : 0)), hit([[0, { rFwd: 60, rUp: -12, lFwd: 40, turn: -10 }], [0.5, { rFwd: 64, rUp: -8, lFwd: 40, turn: -10, nod: 6 }], [0.9, { ...WHEEL, turn: 25 }], [9, { ...WHEEL, turn: 28 }]], t))));
      A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -40 }))); A.setFace('worried'); shake(cam, t, 0.5, 0.35);
      const h = headOf(Ab); faceCam(cam, t / dur, [h.x, h.y - 0.3, h.z], 15, { dist: 7.0, lens: 32, side: 0.8, push: 0.6 }); };
  },
  // 37 "'But the tower's up the hill. Nell is across the bridge.'"  — Abe points up the hill, then across the water; you follow his hand both ways
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'worried' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 12 }); env.meter('ENGINE', false, 0); sing(t, 0.8, 0.85);
      Ab.pose(addPose(SIT, addPose(addPose(idle(t, 0.5), talk(t, 1.1)), hit([[0, WHEEL], [0.4, { rFwd: 120, rUp: -10, lFwd: 62, lUp: -10, turn: -15, nod: -10 }], [dur * 0.5, { rFwd: 120, rUp: -10, lFwd: 62, lUp: -10, turn: -15, nod: -10 }], [dur * 0.5 + 0.4, { rFwd: 80, rUp: -45, lFwd: 62, lUp: -10, turn: 30 }], [9, { rFwd: 80, rUp: -45, lFwd: 62, lUp: -10, turn: 32 }]], t))));
      A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: t < dur * 0.5 ? -20 : 25, nod: t < dur * 0.5 ? -12 : 0 }))); A.setFace('worried');
      winCam(cam, t / dur, -0.4, [20, 22], [9.8, 9.2]); };
  },
  // 38 "The song has two minutes. Nell has one door."  — the record spinning on the dash in the foreground, your phone glowing in your hand behind it
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFace: 'determined' }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 0, r: 12 }); env.meter('ENGINE', false, 0); sing(t, 0.8, 0.85);
      A.pose(addPose(SIT, addPose(idle(t, 0.5), { rFwd: 78, rUp: -20, lFwd: 35, nod: 10 }))); A.setFace('scared'); Ab.pose(addPose(SIT, addPose(idle(t, 0.5), WHEEL)));
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.6, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); ph.screen('chat', 1, { time: '5:55 · 3%', msgs: [[1, ['Top floor.', 'One door left.', 'Where are you?']]] });
      const b = g.position; camPath(cam, t / dur, [b.x - 0.6, b.y + 1.4, b.z + 2.6], [b.x - 0.4, b.y + 1.2, b.z + 2.0], [b.x + 1.0, b.y + 0.4, b.z - 2.5], [b.x + 1.4, b.y + 0.6, b.z - 3.2], 26, 30); };
  },
  // 39–40 vote shot: windshield two-shot, low so both faces sit above the A/B boxes; the record turning on the dash between you
  ...[0, 3.2].map(off => (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'determined' });
    return (t0, dur) => { const t = t0 + off; env.update(t, { jingle: 0, r: 12 }); env.meter('ENGINE', false, 0); sing(t, 0.7, 0.85);
      Ab.pose(addPose(SIT, addPose(idle(t, 0.5), addPose(WHEEL, { turn: 20 + Math.sin(t * 0.7) * 10 })))); A.pose(addPose(SIT, addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: -20 + Math.sin(t * 0.5) * 25 })));
      A.setFace(t > 3 ? 'determined' : 'worried');
      camPath(cam, Math.min(1, t / 9), [0, 3.4, 9.8], [0, 3.5, 8.8], [0, 2.6, -0.6], [0, 2.7, -0.6], 22, 23); };
  }),
];
