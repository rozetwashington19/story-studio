import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  towerControl, hospitalStairs, fogTouch, fogPhone } from '../../engine/kit.js';
import { you, abe, nell, pip, youngAbe, crowd, biscuit, ramp, sm, V, headOf, faceCam, fill, allow, hn, shake, far, ps, eyes, dogLook } from './common.js';
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
  // 22 "And for one second, you see it."  — push into Abe's eyes as he stares at the tower light: his breath catches, his hand tightens on the wheel… white flash
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'worried' }); const fl = lensSheet(S, cam);
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 }); env.meter('0:00', true, 0); sing(t, 0.9, 1);
      Ab.pose(ps(SIT, idle(t, 0.4), { rFwd: 60, rUp: -20, lFwd: 40, nod: -12 }, hit([[dur * 0.25, {}], [dur * 0.4, { bob: 0.05, nod: -4, lFwd: 8 }], [dur * 0.6, { bob: 0, nod: -2, lFwd: 6 }]], t))); Ab.setFace(t > dur * 0.35 ? 'scared' : 'worried');
      A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30, nod: -10 }, eyes(A, headOf(Ab), sm(t, dur * 0.3, dur * 0.6) * 0.6)));
      const h = headOf(Ab); faceCam(cam, sm(t, 0, dur) ** 1.4, [h.x, h.y + 0.2, h.z], 0, { dist: 5.8, lens: 34, side: 0.2, push: 2.5 }); fl.place(sm(t, dur * 0.6, dur)); };
  },
  // 23 "Young Abe, in a room full of humming machines."  — FLASHBACK (thirty years ago, dusk): (a) the transmitter room, scopes and reels alive, young Abe working the console — flicks a switch, checks a dial, flicks another; (b) his face in the meter light: something is wrong
  (S, cam) => { const { env, Y } = room(S); const fl = lensSheet(S, cam);
    return (t, dur) => { env.needle(0.55 + t * 0.06 + Math.sin(t * 23) * 0.015); env.update(t, { hum: 1 }); const [k, u] = seg(t, dur, [0.5]); const c = dur * 0.5;
      Y.pose(ps(idle(t, 0.8), hit([[0, { rFwd: 40, lFwd: 25, nod: 10, turn: -14 }], [0.45, { rFwd: 62, rUp: 4, lFwd: 25, nod: 8, turn: -18 }], [0.7, { rFwd: 60, lFwd: 25, nod: 12, turn: 10 }], [1.1, { rFwd: 70, rUp: 10, lFwd: 25, nod: 8, turn: 16 }], [c, { rFwd: 40, lFwd: 25, nod: 4, turn: 0 }], [c + 0.5, { rFwd: 46, lFwd: 25, nod: 4, lean: 5, turn: 24 }], [dur, { rFwd: 46, lFwd: 25, nod: 4, lean: 6, turn: 26 }]], t))); Y.setFace(t < c ? 'neutral' : t < c + 0.6 ? 'confused' : 'worried');
      if (k === 0) camPath(cam, u, [6.8, 7.4, 10.2], [4.3, 6.2, 8.2], [0, 4, -5], [0.5, 4, -5], 22, 25);
      else camPath(cam, u, [5.2, 3.7, -6.3], [4.5, 3.9, -6.0], [1.0, 4.7, -3.7], [1.0, 4.7, -3.7], 28, 32);
      fl.place(1 - sm(t, 0, 0.35)); };
  },
  // 24 "A needle shaking in the red."  — tight on the VU meter: the needle hammers against the red and won't come back, the console lamps flicker; push in
  (S, cam) => { const { env, Y } = room(S);
    return (t, dur) => { env.needle(0.86 + Math.sin(t * 37) * 0.035 + Math.sin(t * 23) * 0.02 + sm(t, 0, dur) * 0.05); env.update(t, { hum: 2.2 }); Y.pose(ps(idle(t, 0.8), { rFwd: 40, lFwd: 25, nod: 14 }));
      camPath(cam, sm(t, 0, dur), [0.9, 5.0, -3.6], [0.4, 4.6, -4.9], [0, 4.4, -7.3], [0, 4.4, -7.3], 34, 44); cam.position.x += Math.sin(t * 41) * 0.012; cam.position.y += Math.sin(t * 33) * 0.012; S.userData.dof = false; };
  },
  // 25 "'I told them it was broken. They laughed.'"  — young Abe spins round from the console, pleading, hand out toward the meter; one engineer slaps his knee laughing, the other waves him off and turns away; Abe's arm sinks
  (S, cam) => { const { env, Y } = room(S); const C0 = crowd(S, 0, 'laugh', [-4.0, 0, 6.0], 160), C1 = crowd(S, 1, 'smirk', [1.0, 0, 7.0], 180);
    return (t, dur) => { env.needle(0.82 + Math.sin(t * 31) * 0.03); env.update(t, { hum: 1.5 }); Y.root.rotation.y = hn([[0, 180], [0.4, 180], [0.8, 20], [9, 20]], t) * D; const give = dur * 0.72;
      Y.pose(ps(idle(t, 0.9), talk(t, t > 0.6 && t < give ? 1.2 : 0), anticipate(t, 0.4), hit([[0, { rFwd: 40, lFwd: 25 }], [0.8, { rFwd: 74, rUp: -10, lFwd: 20, lean: 8 }], [1.3, { rFwd: 70, rUp: 30, lFwd: 60, lUp: 20, lean: 10 }], [give, { rFwd: 74, rUp: -12, lFwd: 40, lean: 8 }], [give + 0.45, { rFwd: 12, lFwd: 8, lean: 0, nod: 16 }]], t)));
      Y.setFace(t < 0.8 ? 'shock' : t < give ? 'worried' : 'sad');
      const slap = Math.max(0, Math.sin((t - 0.9) * 8)); C0.pose(ps(idle(t, 1.2, 1), { bob: Math.abs(Math.sin(t * 9)) * 0.12, nod: -8 + Math.sin(t * 9) * 5, rFwd: 40 - slap * 20, lFwd: 30, lean: -6 + slap * 14 })); C0.setFace('laugh');
      C1.root.rotation.y = (180 + sm(t, dur * 0.55, dur * 0.85) * 110) * D; C1.pose(ps(idle(t, 1, 2), hit([[0, { rFwd: 20, lUp: 10, turn: -15, tilt: 6 }], [dur * 0.45, { rFwd: 86, rUp: 30, turn: -10, tilt: 6 }], [dur * 0.6, { rFwd: 40, rUp: 50, turn: -20 }], [dur * 0.8, { rFwd: 6, rUp: 6 }]], t), { bob: Math.abs(Math.sin(t * 7)) * 0.06 })); C1.setFace(t > dur * 0.5 ? 'bored' : 'smirk');
      const h = headOf(Y); camPath(cam, sm(t, 0, dur), [-2.4, 5.0, 3.8], [-1.5, 4.9, 2.6], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.3, h.z], 26, 31); };
  },
  // 26 "Back in the truck, the record starts to slow."  — the record turning slower, the notes thinning out, the fog edging back onto the glass; behind it, out of focus, both of you turn to look at it
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFace: 'worried' });
    return (t, dur) => { const sp = 1 - sm(t, 0, dur) * 0.65; env.update(t, { jingle: 0, r: 13 - sm(t, 0, dur) * 3 }); env.meter('0:00', true, 0); sing(t, sp * 0.7, sp); const b = g.position;
      Ab.pose(ps(SIT, idle(t, 0.5), { rFwd: 30, lFwd: 40 }, hit([[0, { turn: -4, nod: -8 }], [dur * 0.5, { turn: 30, nod: 14 }]], t))); A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30 }, hit([[0, { turn: 0, nod: -8 }], [dur * 0.35, { turn: -30, nod: 16 }], [dur * 0.8, { turn: -30, nod: 16, lean: 10, lFwd: 50 }]], t))); A.setFace(t > dur * 0.4 ? 'scared' : 'worried');
      camPath(cam, sm(t, 0, dur), [b.x - 1.9, b.y + 2.1, b.z - 2.3], [b.x - 1.1, b.y + 1.4, b.z - 1.5], [b.x, b.y + 0.4, b.z], [b.x, b.y + 0.45, b.z], 30, 37); };
  },
  // 27 "You crank it. Two more minutes, maybe."  — you lunge for the crank and wind it, faster and faster, teeth gritted; the record picks up; you let go and shake out your hand. Abe watches the fog on the glass, then you
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFace: 'worried' }); allow(S, ['you', 'gramophone'], ['you', 'dash*']);
    return (t, dur) => { const stop = dur * 0.78; const tc = Math.min(t, stop); const sp = 10 + tc * 4; env.update(t, { jingle: 0, r: 10 + sm(t, 0, dur) * 3 }); env.meter('0:00', true, 0); sing(t, 0.4 + ramp(t, 0.3, dur) * 0.6, 0.4 + ramp(t, 0, dur) * 0.6); g.crank.rotation.x = -tc * sp;
      A.pose(ps(SIT, idle(t, 0.5), t < stop ? CRANK(t, sp) : hit([[stop, CRANK(stop, sp)], [stop + 0.3, { rFwd: 60, rUp: 40, lFwd: 30, lean: 4, nod: 6, turn: -20 }]], t), t > stop + 0.25 ? { rUp: Math.sin(t * 26) * 8 } : {})); A.setFace(t < stop ? 'determined' : 'relieved');
      Ab.pose(ps(SIT, idle(t, 0.5), { rFwd: 30, lFwd: 40 }, hit([[0, { turn: 0, nod: -10 }], [dur * 0.5, { turn: 2, nod: -12 }], [dur * 0.75, { turn: 32, nod: 6 }]], t)));
      const h = headOf(A); camPath(cam, sm(t, 0, dur), [h.x + 1.4, h.y + 0.6, 8.8], [h.x + 0.7, h.y + 0.4, 7.4], [h.x - 0.8, h.y - 0.8, h.z + 1.4], [h.x - 0.8, h.y - 0.7, h.z + 1.4], 28, 33); };
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
  // 29 "It's Nell. A photo."  — the photo fills the screen (phone bezel): the hospital stairwell from the top, shot at arm's length — the frame wobbles, Nell's arm up, Pip pressed to her side looking straight up at the lens
  (S, cam) => { const { env, N, P } = stairs(S); const fr = lensSheet(S, cam, { frame: true }); S.userData.handheld = false;
    return (t, dur) => { env.update(t, { level: 5 }); N.pose(ps(idle(t, 0.4), { rFwd: 120, rUp: -30, lFwd: 40, lUp: -20, nod: 10 }, { rFwd: Math.sin(t * 9) * 2 })); N.setFace('scared'); P.pose(ps(idle(t, 0.5), { lFwd: 60, lUp: -40, nod: -18, bob: Math.sin(t * 15) * 0.012 })); P.setFace('scared');
      const z = sm(t, dur * 0.2, dur * 0.7); camPath(cam, z, [1.2, 11.4, -2.2], [1.1, 11.0, -2.6], [0, 1.0, 8], [0.1, 2.2, 6], 22, 26); cam.position.x += Math.sin(t * 6) * 0.03; cam.position.y += Math.sin(t * 7.3) * 0.02; fr.place(); };
  },
  // 30 "A stairwell, and fog climbing the steps."  — looking down the stairwell: the white rising step by step, the tube light stuttering; on the landing Nell backs away from the edge, pulling Pip behind her
  (S, cam) => { const { env, N, P } = stairs(S);
    return (t, dur) => { env.update(t, { level: 5 + sm(t, 0, dur) * 2 }); const b = sm(t, dur * 0.3, dur * 0.8);
      N.root.position.z = -5.4 - b * 0.5; P.root.position.z = -5.2 - b * 0.7; N.pose(ps(idle(t, 0.7), b > 0.02 && b < 0.98 ? walk(t, 0.6, -14) : {}, { rFwd: 30, lFwd: 20, nod: 16 }, hit([[dur * 0.3, {}], [dur * 0.5, { lFwd: -30, lUp: 30, lean: -6 }]], t))); N.setFace('scared'); P.pose(ps(idle(t, 0.9, 1), { lFwd: 60, lUp: -40, nod: 14 }));
      camPath(cam, sm(t, 0, dur), [2.8, 10.9, -2.8], [2.1, 10.5, -1.8], [-0.4, 3.0, 5.0], [-0.4, 4.2, 4.0], 22, 25); };
  },
  // 31 "Pip, holding Nell's sleeve."  — close two-shot on the landing: Pip's fist bunched in Nell's sleeve, tugging; Nell looks down, makes herself smile, and smooths the girl's hair — then her eyes go back to the stairs
  (S, cam) => { const { env, N, P } = stairs(S); P.root.position.set(1.0, 7.2, -5.0); allow(S, ['pip', 'nell']);
    return (t, dur) => { env.update(t, { level: 7 }); const hP = headOf(P);
      N.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 30, rUp: -20, lFwd: 20, nod: 8, turn: 14 }], [dur * 0.35, { rFwd: 40, rUp: -45, lFwd: 20, nod: 20, turn: -22 }], [dur * 0.75, { rFwd: 44, rUp: -48, lFwd: 20, nod: 20, turn: -22 }], [dur, { rFwd: 40, rUp: -45, lFwd: 20, nod: 6, turn: 12 }]], t), t > dur * 0.4 && t < dur * 0.75 ? { rFwd: Math.sin(t * 7) * 5 } : {})); N.setFace(t < dur * 0.3 ? 'worried' : t < dur * 0.78 ? 'fakesmile' : 'worried');
      P.pose(ps(idle(t, 0.9, 1), { rFwd: 50, rUp: -10, lFwd: 50, lUp: -45, turn: 10 }, hit([[0, { nod: 6 }], [dur * 0.4, { nod: -18 }]], t), { lFwd: Math.max(0, Math.sin(t * 6)) * 8, bob: Math.sin(t * 14) * 0.01 })); P.setFace(t > dur * 0.55 ? 'worried' : 'scared');
      camPath(cam, sm(t, 0, dur), [0.6, 10.4, 3.0], [0.1, 10.2, 1.6], [-0.2, 10.4, -5.2], [-0.2, 10.5, -5.2], 26, 31); };
  },
  // 32 "'Top floor. One door left. Where are you?'"  — Nell typing fast with one thumb, jaw tight; a glance over her shoulder at the ROOF door, back to the screen, send; Pip watches the stairs
  (S, cam) => { const { env, N, P, ph } = stairs(S);
    return (t, dur) => { env.update(t, { level: 7.5 }); const gl = dur * 0.45;
      N.pose(ps(idle(t, 0.6), talk(t, 0.8), { rFwd: 120 + Math.sin(t * 24) * 2.5, rUp: -32, lFwd: 25 }, hit([[0, { nod: 14, turn: 0 }], [gl, { nod: 14, turn: 0 }], [gl + 0.25, { nod: -4, turn: 52 }], [gl + 0.6, { nod: -4, turn: 50 }], [gl + 0.85, { nod: 15, turn: 0 }], [dur * 0.92, { nod: 4, turn: 0, bob: 0.03 }]], t))); N.setFace(t > gl && t < gl + 0.8 ? 'scared' : 'determined');
      const p = pinky(N, 'R'); ph.position.set(p.x + 0.1, p.y + 0.3, p.z + 0.1); ph.rotation.set(-0.3, 0.3, 0); ph.screen('chat', ramp(t, 0.2, dur), { time: '5:55', msgs: [[1, ['Top floor.', 'One door left.', 'Where are you?']]] });
      P.pose(ps(idle(t, 0.9, 1), { lFwd: 60, lUp: -40, nod: 12, turn: 24 + Math.sin(t * 1.7) * 8 }));
      const h = headOf(N); faceCam(cam, sm(t, 0, dur), [h.x, h.y - 0.4, h.z], 10, { dist: 7.2, lens: 30, side: 0.8, push: 0.9 }); };
  },
  // 33 "You look back at the shop."  — at the truck's open door: Biscuit's head snaps round first, a whine; a beat later you turn, slowly, to look back down the white at the warm blur of the shop
  (S, cam) => { const { env, A, B, Dt } = board(S, cam, { youAt: [5.0, 0, 3.6], youRy: 20, dotFog: 1, dotFace: 'sleepy' }); env.cabDoor.open(1);
    return (t, dur) => { env.update(t, { cx: 3, cz: 9, r: 6, music: 0, glowK: 0.3 }); A.root.rotation.y = hn([[0, 20], [0.45, 20], [1.1, 196], [1.4, 190]], t) * D;
      A.pose(ps(idle(t, 0.7), { rFwd: 15, lFwd: 15 }, anticipate(t, 0.45), hit([[0, { turn: 0 }], [0.4, { turn: 50, nod: 4 }], [1.1, { turn: -10 }], [1.4, { turn: 0, nod: 4 }]], t))); A.setFace(t > 1.2 ? 'shock' : 'worried');
      B.root.position.set(3.0, 0, 3.0); B.root.rotation.y = hn([[0, 0.4], [0.1, 0.4], [0.4, 200 * D]], t); B.update(t, t > 0.2 ? 'bark' : 'sit'); dogLook(B, [0, 3, -5.2], sm(t, 0.05, 0.3)); frozen(Dt, t, { rFwd: 30 }, 4);
      const h = headOf(A); camPath(cam, sm(t, 0, dur), [h.x + 1.8, h.y + 0.6, h.z + 4.6], [h.x + 1.2, h.y + 0.5, h.z + 3.6], [h.x - 1.6, h.y - 0.8, h.z - 6], [h.x - 2.4, h.y - 0.8, h.z - 9], 26, 29); };
  },
  // 34 "Dot is standing in the doorway, grey again."  — slow push in on Dot: colour gone, eyes on nothing, the hand she held the door with sinking a little at a time, the fog folding around her (hook source)
  (S, cam) => { const { env, Dt } = board(S, cam, { dotFog: 1, dotFace: 'sleepy', dog: false, youAt: [30, 0, 30] }); env.door.open(1);
    return (t, dur) => { env.update(t, { music: 0, glowK: 0.3, mask: (x, z) => z > -5 && Math.abs(x) > 2.6 ? 1 : 0 }); const sink = sm(t, 0.4, dur); frozen(Dt, t, { lUp: 70 - sink * 34 + Math.sin(t * 19) * 0.8 * sink, lFwd: 20 - sink * 8, rFwd: 20, nod: sink * 5 }, 4);
      const h = headOf(Dt); camPath(cam, sm(t, 0, dur), [h.x + 0.9, h.y + 0.2, h.z + 7.6], [h.x + 0.3, h.y + 0.1, h.z + 4.4], [h.x, h.y - 0.6, h.z], [h.x, h.y - 0.3, h.z], 28, 35); };
  },
  // 35 "You took her music."  — close on you: you stop breathing; your eyes drop to your empty hands, a hard swallow, and they fill
  (S, cam) => { const { env, A } = board(S, cam, { youAt: [5.0, 0, 3.6], youRy: 190, dotFog: 1, dotFace: 'sleepy', dog: false });
    return (t, dur) => { env.update(t, { cx: 3, cz: 9, r: 6, music: 0, glowK: 0.3 }); const d = dur * 0.4;
      A.pose(ps(idle(t, t < d ? 0.15 : 0.6), hit([[0, { rFwd: 10, lFwd: 10, nod: 2 }], [d, { rFwd: 10, lFwd: 10, nod: 2 }], [d + 0.4, { rFwd: 46, lFwd: 46, rUp: -6, lUp: -6, nod: 22 }], [d + 0.75, { rFwd: 44, lFwd: 44, rUp: -6, lUp: -6, nod: 26, bob: -0.03 }], [dur, { rFwd: 30, lFwd: 30, nod: 18 }]], t))); A.setFace(t < d ? 'shock' : t < d + 0.5 ? 'sad' : 'teary');
      const h = headOf(A); faceCam(cam, sm(t, 0, dur), [h.x, h.y, h.z], 190, { dist: 6.4, lens: 38, side: -0.4, push: 0.9 }); };
  },
  // 36 "Abe starts the engine. 'Only I can shut it down.'"  — Abe turns the key: the cab shudders, the dash lights blink on; you grab the dash; he takes the wheel in both hands, turns to you and says it, steady now, with one firm nod
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'determined' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 12, drive: 0 }); env.meter(t < 0.5 ? '0:00' : 'ENGINE', t < 0.5, 0); sing(t, 0.8, 0.9); env.dome.intensity = t < 0.5 ? 5 : 9 + Math.sin(t * 30) * Math.exp(-(t - 0.5) * 4) * 3; const rum = t > 0.5 ? Math.sin(t * 34) * 0.012 : 0;
      Ab.pose(ps(SIT, idle(t, 0.5), talk(t, t > 0.7 ? 1.1 : 0), anticipate(t, 0.45), hit([[0, { rFwd: 60, rUp: -12, lFwd: 40, turn: -10 }], [0.5, { rFwd: 66, rUp: -6, lFwd: 40, turn: -10, nod: 8 }], [0.9, { ...WHEEL, turn: 25 }], [dur * 0.8, { ...WHEEL, turn: 28, nod: 0 }], [dur * 0.9, { ...WHEEL, turn: 28, nod: 12 }], [dur, { ...WHEEL, turn: 28, nod: 2 }]], t), { bob: rum }));
      A.pose(ps(SIT, idle(t, 0.6), hit([[0.45, { rFwd: 30, lFwd: 30, turn: -20 }], [0.7, { rFwd: 78, lFwd: 78, rUp: -8, lUp: -8, turn: -10, lean: -6 }], [1.3, { rFwd: 50, lFwd: 50, turn: -40 }]], t), { bob: rum })); A.setFace(t > 0.5 && t < 1.1 ? 'shock' : 'worried'); shake(cam, t, 0.5, 0.45);
      const h = headOf(Ab); faceCam(cam, sm(t, 0, dur), [h.x, h.y - 0.3, h.z], 15, { dist: 7.2, lens: 32, side: 0.8, push: 0.9 }); };
  },
  // 37 "'But the tower's up the hill. Nell is across the bridge.'"  — (a) windshield two-shot: Abe jabs a finger up the hill, then across the water; your head follows a beat behind each time; (b) close on you, pulled both ways — eyes to the hill, to the bridge, down to the phone
  (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'worried' });
    return (t, dur) => { env.update(t, { jingle: 0, r: 12 }); env.meter('ENGINE', false, 0); sing(t, 0.8, 0.85); const [k, u] = seg(t, dur, [0.62]); const p2 = dur * 0.38, c = dur * 0.62;
      Ab.pose(ps(SIT, idle(t, 0.5), talk(t, 1.1), anticipate(t, 0.4), anticipate(t, p2 + 0.4), hit([[0, WHEEL], [0.4, { rFwd: 122, rUp: -10, lFwd: 62, lUp: -10, turn: -15, nod: -10 }], [p2, { rFwd: 118, rUp: -10, lFwd: 62, lUp: -10, turn: -15, nod: -10 }], [p2 + 0.4, { rFwd: 84, rUp: -48, lFwd: 62, lUp: -10, turn: 30 }], [c + 0.3, { rFwd: 80, rUp: -45, lFwd: 62, lUp: -10, turn: 32 }], [c + 0.8, { ...WHEEL, turn: 30, nod: 6 }]], t)));
      A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30 }, hit([[0.3, { turn: -40, nod: 0 }], [0.75, { turn: -18, nod: -14 }], [p2 + 0.3, { turn: -18, nod: -14 }], [p2 + 0.75, { turn: 28, nod: -2 }], [c + 0.35, { turn: 26, nod: -2 }], [c + 0.7, { turn: -16, nod: -12 }], [dur - 0.25, { turn: 0, nod: 20 }]], t))); A.setFace(t < c ? 'worried' : t < dur - 0.4 ? 'scared' : 'sad');
      if (k === 0) { winCam(cam, sm(u, 0, 1), -0.4, [20, 23], [10.0, 9.0]); return; }
      const h = headOf(A); faceCam(cam, u, [h.x, h.y, h.z], 0, { dist: 6.4, lens: 38, side: 0.5, push: 0.7 }); };
  },
  // 38 "The song has two minutes. Nell has one door."  — the record spinning on the dash in the foreground, your phone glowing in your hand behind it; the camera drifts from one to the other while your eyes go phone → record → Abe
  (S, cam) => { const { env, Ab, A, g, sing } = cab(S, { abeFace: 'determined' }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 0, r: 12 }); env.meter('ENGINE', false, 0); sing(t, 0.8, 0.85); const b = g.position;
      A.pose(ps(SIT, idle(t, 0.5), { rFwd: 78, rUp: -20, lFwd: 35 }, hit([[0, { nod: 16, turn: 0 }], [dur * 0.4, { nod: 16, turn: 0 }], [dur * 0.55, { nod: 6, turn: -22 }], [dur * 0.78, { nod: 6, turn: -22 }], [dur * 0.92, { nod: -2, turn: -48 }]], t), { rFwd: Math.sin(t * 13) * 1.2 })); A.setFace(t > dur * 0.8 ? 'worried' : 'scared');
      Ab.pose(ps(SIT, idle(t, 0.5), WHEEL, { lFwd: Math.max(0, Math.sin(t * 6)) * 5, turn: sm(t, dur * 0.7, dur * 0.95) * 30 }));
      const p = pinky(A, 'R'); ph.position.set(p.x + 0.35, p.y + 0.6, p.z + 0.25); ph.rotation.set(0.5, Math.PI, 0); ph.screen('chat', 1, { time: '5:55 · 3%', msgs: [[1, ['Top floor.', 'One door left.', 'Where are you?']]] });
      camPath(cam, sm(t, 0, dur), [b.x - 0.9, b.y + 1.5, b.z + 2.8], [b.x - 0.2, b.y + 1.1, b.z + 1.9], [b.x + 0.4, b.y + 0.4, b.z - 1.5], [b.x + 1.6, b.y + 0.7, b.z - 3.4], 26, 31); };
  },
  // 39–40 vote shot: windshield two-shot, low so both faces sit above the A/B boxes; the record turning on the dash between you
  ...[0, 3.2].map(off => (S, cam) => { const { env, Ab, A, sing } = cab(S, { abeFace: 'determined' });
    return (t0, dur) => { const t = t0 + off; env.update(t, { jingle: 0, r: 12 }); env.meter('ENGINE', false, 0); sing(t, 0.7, 0.85);
      Ab.pose(ps(SIT, idle(t, 0.5), WHEEL, { turn: 22 + Math.sin(t * 0.7) * 8, lFwd: Math.max(0, Math.sin(t * 5)) * 5, nod: Math.sin(t * 0.9) * 3 })); A.pose(ps(SIT, idle(t, 0.6), { rFwd: 30, lFwd: 30 }, hit([[0, { turn: -40, nod: 0 }], [1.2, { turn: -16, nod: -12 }], [2.6, { turn: 26, nod: -2 }], [4.0, { turn: 0, nod: 16 }], [5.4, { turn: -30, nod: 0 }], [6.6, { turn: 0, nod: -6 }]], t), { bob: Math.sin(t * 6) * 0.01 }));
      A.setFace(t > 3 ? 'determined' : 'worried');
      camPath(cam, Math.min(1, t / 9), [0, 3.4, 9.8], [0, 3.5, 8.8], [0, 2.6, -0.6], [0, 2.7, -0.6], 22, 23); };
  }),
];
