// Episode 022 (The Tenant Downstairs) — lines 2–28: the rule, the gags, Dana, the receipts, Mr. Crane, the door, the stairs.
import * as THREE from 'three';
import { POSES, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, track,
  marrowStreet, danaFlat, cellarHall, deepStairs, stairWalkY, stairY, cellarArm, paper, plateOf, lasagnaTray, spade, handTorch, goldCoin, rat, sock, laundryBasket, pillow } from '../../engine/kit.js';
import { dana, crane, diva, ferris, ps, ramp, sm, lerp, V, headOf, faceCam, fill, allow, hold, hands, hn, shake, rumble, arc, clamp01, eye } from './common.js';

const slopeY = (z) => -z * 0.8 / 1.4;
export const receiptLines = [['RECEIPT', '800 64px "Inter", sans-serif', '#2a1a10', 70], ['No. 9 Marrow St · 3B', '600 34px "Inter", sans-serif', '#5a4a3a', 86], ['RENT', '800 84px "Inter", sans-serif', '#2a1a10', 96], ['PAID', '800 120px "Inter", sans-serif', '#1c8a4a', 104], ['IN FULL', '800 84px "Inter", sans-serif', '#1c8a4a', 96], ['~ signed, downstairs ~', 'italic 34px Georgia', '#5a4a3a', 50]];
export const receipt = (S, w = 0.95) => paper(S, receiptLines, { w, h: w * 1.4, tex: { top: 90 }, glow: 0.3 });
const opArm = (S) => { const a = cellarArm(S, { name: 'operaArm', col: 0x7a4ab0, nail: 0xf2c420, s: 1.1 }); a.g.position.set(-38, 0, -4.6); allow(S, ['*Arm*', 'pavement']); return a; };   // the hatch is a hole in the pavement
const washArm = (S) => { const a = cellarArm(S, { name: 'washArm', col: 0xe86aa0, nail: 0xfff0f6, s: 1.0 }); a.g.position.set(-11, 0, -4.6); allow(S, ['*Arm*', 'pavement']); return a; };
export { opArm, washArm };
const WALKDOWN = (t, sp = 1) => ps(walk(t, sp, 30), { lean: 6, nod: 8 });

export const SHOTS_A = [
  // 2 "In this world, every building comes with a monster."
  //   Blocking: nobody on the street — the camera whips along Marrow Street from the opera to No. 9; a purple arm is already waving out of the opera's cellar hatch (frame 0), the laundromat's
  //   pink arm pops up as we pass, and No. 9's hatch stays shut and silent. Camera: fast lateral dolly (motion from frame 0), low, looking up at the fronts.
  (S, cam) => {
    const env = marrowStreet(S); const a1 = opArm(S), a2 = washArm(S);
    return (t, dur) => { env.update(t); const p = sm(t, 0, dur * 0.94); env.follow(lerp(-34, 9, p));
      env.hatch.opera.open(1); a1.rise(5.2 + Math.sin(t * 7) * 0.3); a1.wrist.rotation.z = Math.sin(t * 9) * 0.55; a1.grip(0.1);
      const k2 = hn([[dur * 0.3, 0], [dur * 0.3 + 0.3, 1]], t); env.hatch.wash.open(k2); a2.rise(-1 + 5.6 * k2); a2.wrist.rotation.z = Math.sin(t * 11) * 0.4 * k2; a2.grip(0.5 + Math.sin(t * 12) * 0.4);
      env.hatch.nine.open(0);
      camPath(cam, p, [-35, 2.4, 9], [8.5, 3.0, 11.5], [-38, 4.6, -6], [10, 8, -9], 22, 24);
    };
  },
  // 3 "It lives in the basement. It's in the lease."  — (a) No. 9's hatch lifts a crack: two glowing eyes blink in the gap; (b) insert: the lease, clause 4.
  (S, cam) => {
    const env = marrowStreet(S); const eyes = [-1, 1].map(sx => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe070 })); e.position.set(9 + sx * 0.62, 0.38, -4.2); S.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshBasicMaterial({ color: 0x0a0a0a })); p.position.z = 0.24; e.add(p); return e; });
    const pg = paper(S, [['LEASE', '800 76px Georgia, serif', '#2a1a10', 64], ['No. 9 Marrow Street', 'italic 36px Georgia', '#5a4a3a', 70], ['§ 4.  The basement', '600 40px Georgia', '#2a1a10', 54], ['comes with', '600 40px Georgia', '#2a1a10', 74], ['ONE (1)', '800 84px "Inter", sans-serif', '#b01e1e', 92], ['MONSTER.', '800 84px "Inter", sans-serif', '#b01e1e', 84], ['Keep it happy.', 'italic 44px Georgia', '#2a1a10', 60]], { w: 2.4, h: 3.3, tex: { top: 100, border: '#8a6a4a' }, glow: 0.55 });
    pg.position.set(9, 4.6, 4.0); const L = fill(S, [9.5, 5.2, 7], 0, 0xffe8c8, 12);
    return (t, dur) => { env.update(t); env.follow(9); const [k, lt] = seg(t, dur, [0.46]);
      if (k === 0) { pg.visible = false; L.intensity = 0; const o = hn([[0.15, 0], [0.5, 0.2]], t); env.hatch.nine.open(o); env.hatch.nine.light.intensity = 10; const bl = (t > 0.95 && t < 1.08) ? 0.1 : 1; eyes.forEach((e, i) => { e.visible = o > 0.05; e.scale.y = bl; e.position.x = 9 + (i ? 0.62 : -0.62) + Math.sin(t * 2.4) * 0.12; });
        camPath(cam, lt, [10.8, 1.5, 3.2], [10.0, 0.95, 0.4], [9, 0.6, -4.6], [9, 0.45, -4.4], 28, 34); return; }
      pg.visible = true; L.intensity = 14; eyes.forEach(e => { e.visible = false; }); env.hatch.nine.open(0); pg.rotation.set(Math.sin(t * 1.6) * 0.03, Math.sin(t * 1.1) * 0.06, Math.sin(t * 1.3) * 0.02);
      camPath(cam, lt, [9.3, 5.0, 11.4], [9.1, 4.5, 10.2], [9, 4.8, 4], [9, 4.45, 4], 30, 32);
    };
  },
  // 4 "You see, you keep it happy."  — Mr. Ferris (robe, slippers) bends and sets a plate by the laundromat's hatch; the pink arm comes up and gives a delighted little wave.
  //   Blocking: Ferris right of the hatch facing it (3/4 to camera), arm rises at the hatch centre. Camera: gentle push-in, medium-wide.
  (S, cam) => {
    const env = marrowStreet(S); const F = ferris(S, 'nervous', [-7.3, 0, -4.4], -34); const a = washArm(S); const pl = plateOf(S, { s: 1.1 });
    return (t, dur) => { env.update(t); env.follow(-9); env.keyAt(-7.5, 5, 0.5, 16); const put = dur * 0.42; const u = sm(t, 0.1, put);
      F.pose(ps(idle(t, 0.6), anticipate(t, 0.12), hit([[0, { rFwd: 50, lFwd: 50, rUp: -10, lUp: -10 }], [put, { rFwd: 42, lFwd: 42, rUp: -10, lUp: -10, lean: 46, nod: 14, bob: -0.5 }], [put + 0.45, { rFwd: 10, lFwd: 10, lean: 4, bob: 0, nod: -4 }], [put + 0.8, { rUp: 16, lUp: 16, lean: -4, nod: -6 }]], t), (l => ({ turn: l.turn * 0.5, nod: l.nod }))(lookAt(F, [-11, 3.5, -4.6]))));
      F.setFace(t < put ? 'nervous' : t < put + 0.5 ? 'worried' : 'relieved');
      if (t < put) { const h = hands(F); pl.position.set(h.x, h.y - 0.1, h.z + 0.15); } else pl.position.set(-8.9, 0.16, -3.6);
      const k = hn([[put + 0.1, 0], [put + 0.45, 1]], t); env.hatch.wash.open(Math.max(0.12, k)); a.rise(-1 + 5.0 * k); a.wrist.rotation.z = Math.sin(t * 12) * 0.45 * k; a.grip(0.15);
      camPath(cam, sm(t, 0, dur), [-9.8, 3.2, 8.2], [-9.4, 3.5, 6.0], [-9.3, 3.2, -4.6], [-9.3, 3.5, -4.6], 24, 25);
    };
  },
  // 5 "Or it keeps you up all night."  — close on Ferris, pillow clamped over his head, eyes like saucers; behind him the hatch bangs and the pink fist drums on the pavement.
  (S, cam) => {
    const env = marrowStreet(S); const F = ferris(S, 'sleepy', [-7.4, 0, -2.6], 12); const a = washArm(S); const pw = pillow(S);
    return (t, dur) => { env.update(t); env.follow(-9); env.keyAt(-6, 5.2, 2, 18); const bang = Math.max(0, Math.sin(t * 11));
      env.hatch.wash.open(0.35 + bang * 0.5); a.rise(2.2 + bang * 1.6); a.grip(1); a.wrist.rotation.x = 0.4;
      F.pose(ps(idle(t, 0.4), { rUp: 128, lUp: 128, rFwd: 12, lFwd: 12, nod: 10 + bang * 5, bob: -0.05 - bang * 0.07, tilt: Math.sin(t * 11) * 3 }));
      F.setFace(t < dur * 0.4 ? 'sleepy' : t < dur * 0.7 ? 'angry' : 'cry'); const h = headOf(F); pw.position.set(h.x, h.y + 0.95, h.z); pw.rotation.z = Math.sin(t * 11) * 0.05;
      faceCam(cam, sm(t, 0, dur), [h.x, 4.64, h.z], 12, { dist: 10.4, lens: 28, side: 2.2, up: 0.1, push: 1.0, look: 0.2 }); cam.position.y += bang * 0.05; cam.position.x += Math.sin(t * 40) * 0.03 * bang;
    };
  },
  // 6 "The one under the opera house wants a lullaby."  — Madame Odette sings down the open hatch on the opera steps, arms wide; a purple hand sways along like a conductor.
  //   Blocking: diva left of the hatch facing it 3/4, arm in the hatch (screen right). Camera: low push-in with the lit marquee above.
  (S, cam) => {
    const env = marrowStreet(S); const A = diva(S, 'delighted', [-42.7, 0, -4.3], 40); const a = opArm(S);
    return (t, dur) => { env.update(t); env.follow(-40); env.keyAt(-41, 5.4, 1.5, 14); env.hatch.opera.open(1);
      a.rise(3.6 + Math.sin(t * 2.4) * 0.5); a.wrist.rotation.z = Math.sin(t * 2.4) * 0.6; a.grip(0.55); a.g.rotation.y = 0.3;
      A.pose(ps(idle(t, 0.6), talk(t, 1.3), { rUp: 62 + Math.sin(t * 2.4) * 14, lUp: 70 + Math.sin(t * 2.4 + 1) * 14, rFwd: 28, lFwd: 28, nod: -12 + Math.sin(t * 2.4) * 5, lean: -4, tilt: Math.sin(t * 1.2) * 6 }));
      A.setFace(Math.sin(t * 2.4) > 0 ? 'delighted' : 'laugh');
      camPath(cam, sm(t, 0, dur), [-40.6, 2.4, 10.5], [-40.2, 3.0, 8.2], [-40.1, 5.6, -5.5], [-40.1, 5.2, -5.5], 22, 24);
    };
  },
  // 7 "Every night. And it has notes."  — the purple hand shoots up holding a score card: PITCHY. 4/10. Odette: shock, then a magnificent sulk, hands on hips.
  (S, cam) => {
    const env = marrowStreet(S); const A = diva(S, 'delighted', [-42.7, 0, -4.3], 40); const a = opArm(S);
    const card = paper(S, [['PITCHY.', '800 92px "Inter", sans-serif', '#2a1a10', 150], ['4 / 10', '800 150px "Inter", sans-serif', '#b01e1e', 120], ['see me after', 'italic 44px Georgia', '#5a4a3a', 60]], { w: 2.3, h: 2.5, tex: { top: 150, border: '#2a1a10' }, glow: 0.5 }); a.hold.add(card); card.position.set(0, 1.5, 0.5);
    return (t, dur) => { env.update(t); env.follow(-40); env.keyAt(-41, 5.4, 1.5, 14); env.hatch.opera.open(1); const up = dur * 0.2;
      a.rise(hn([[up - 0.05, -1.2], [up + 0.28, 5.4]], t)); a.grip(0.75); a.wrist.rotation.z = Math.sin(t * 5) * 0.06 + (t > dur * 0.7 ? Math.sin(t * 16) * 0.12 : 0);
      A.pose(ps(idle(t, 0.5), anticipate(t, up + 0.4), hit([[0, { rUp: 62, lUp: 70, rFwd: 28, lFwd: 28, nod: -12 }], [up + 0.3, { rUp: 62, lUp: 70, rFwd: 28, lFwd: 28, nod: -12 }], [up + 0.55, { rUp: 80, lUp: 84, rFwd: 40, lFwd: 40, nod: -4, lean: -10, bob: 0.1 }], [dur * 0.66, { rUp: 28, lUp: 28, rFwd: -8, lFwd: -8, nod: 4, lean: 3, tilt: 9 }], [dur * 0.82, { rUp: 28, lUp: 28, rFwd: -8, lFwd: -8, nod: -8, turn: -24, tilt: -6 }]], t), t < up + 0.3 ? talk(t, 1.2) : {}, lookAt(A, [-38, 5, -4.6])));
      A.setFace(t < up + 0.3 ? 'delighted' : t < dur * 0.6 ? 'shock' : t < dur * 0.8 ? 'angry' : 'pout');
      camPath(cam, sm(t, 0, dur), [-39.7, 3.8, 9.4], [-39.6, 4.2, 8.2], [-39.6, 4.6, -4.6], [-39.6, 5.0, -4.6], 24, 25); shake(cam, t, up + 0.25, 0.3);
    };
  },
  // 8 "The one under the laundromat takes one sock."  — Ferris whistles past with his basket; the pink arm leans out of the hatch behind his back and plucks one red sock.
  //   Blocking: Ferris right, looking away (screen right); arm leans in from the hatch (screen left). He notices a beat too late.
  (S, cam) => {
    const env = marrowStreet(S); const F = ferris(S, 'smile', [-5.7, 0, -4.2], -14); const a = washArm(S); const bk = laundryBasket(S); const sk = sock(S);
    return (t, dur) => { env.update(t); env.follow(-9); env.keyAt(-8, 5, 1, 16); const grab = dur * 0.5; const k = sm(t, 0.15, grab), back = sm(t, grab + 0.1, grab + 0.6);
      env.hatch.wash.open(1); a.rise(4.9 * k * (1 - back * 0.25)); a.g.rotation.z = -0.5 * k * (1 - back); a.grip(t < grab ? 0.2 : 0.9); a.wrist.rotation.z = Math.sin(t * 6) * 0.08;
      F.pose(ps(idle(t, 0.8), { rFwd: 52, lFwd: 52, rUp: -8, lUp: -8 }, t < grab + 0.15 ? { turn: 42, nod: -6, tilt: Math.sin(t * 5) * 4 } : hit([[grab + 0.15, { turn: 42 }], [grab + 0.4, { turn: -50, nod: 6, lean: -6 }]], t), anticipate(t, grab + 0.2)));
      F.setFace(t < grab + 0.2 ? 'smile' : t < grab + 0.7 ? 'shock' : 'pout'); const h = hands(F); bk.position.set(h.x - 1.0, h.y - 0.75, h.z + 0.35);
      a.g.updateMatrixWorld(true); const hp = a.hold.getWorldPosition(new THREE.Vector3()); if (t < grab) sk.position.set(bk.position.x - 0.35, bk.position.y + 1.25, bk.position.z); else sk.position.set(hp.x, hp.y + 0.3, hp.z + 0.1); sk.rotation.z = t < grab ? 0.3 : Math.sin(t * 9) * 0.3;
      camPath(cam, sm(t, 0, dur), [-8.2, 3.6, 9.0], [-8.4, 3.7, 7.6], [-8.3, 3.5, -4.4], [-8.4, 3.6, -4.4], 24, 25);
    };
  },
  // 9 "From every load. Now you know."  — close on Ferris holding up the one sock he has left, dead-eyed; behind him the pink hand wears the other like a puppet and waves it.
  (S, cam) => {
    const env = marrowStreet(S); const F = ferris(S, 'bored', [-6.6, 0, -2.6], 8); const a = washArm(S); const s1 = sock(S), s2 = sock(S); a.hold.add(s2); s2.position.set(0, 1.2, 0); s2.rotation.x = Math.PI;
    return (t, dur) => { env.update(t); env.follow(-9); env.keyAt(-6, 5.2, 2.2, 18); env.hatch.wash.open(1); const k = hn([[dur * 0.25, 0], [dur * 0.25 + 0.3, 1]], t); a.rise(-1.5 + 6.2 * k); a.wrist.rotation.z = Math.sin(t * 10) * 0.5; a.grip(0.9);
      F.pose(ps(idle(t, 0.5), hit([[0, { rFwd: 40, rUp: 8 }], [0.4, { rFwd: 120, rUp: -8, tilt: -5 }], [dur * 0.6, { rFwd: 120, rUp: -8, tilt: -5, nod: 4, bob: -0.05 }], [dur * 0.8, { rFwd: 116, rUp: -8, tilt: 4, nod: 8, bob: -0.1 }]], t)));
      F.setFace(t < dur * 0.55 ? 'bored' : t < dur * 0.78 ? 'sleepy' : 'bored'); const hp = pinky(F, 'R'); s1.position.set(hp.x, hp.y + 0.15, hp.z + 0.1); s1.rotation.z = Math.sin(t * 2) * 0.12;
      const h = headOf(F); faceCam(cam, sm(t, 0, dur), [h.x - 0.5, 4.5, h.z], 8, { dist: 10.2, lens: 28, side: 1.7, up: 0.0, push: 0.9, look: -0.1 });
    };
  },
  // 10 "I'm Dana. I'm twenty-nine."  — Dana behind her little round table, dishing lasagna onto a plate; she looks up, grins, gives a small wave with the serving hand.
  //   Camera: push-in from the room to a medium close-up; pendant lamp practical above, night window + neon behind.
  (S, cam) => {
    const env = danaFlat(S); const A = dana(S, 'smile', [-2.6, 0, -4.6]); const tr = lasagnaTray(S, 0.62); tr.position.set(-1.9, 2.6, -2.5); const pl = plateOf(S, { s: 1.0 }); pl.position.set(-3.3, 2.6, -2.2);
    return (t, dur) => { env.update(t); const w = dur * 0.45;
      A.pose(ps(idle(t, 0.8), anticipate(t, w), hit([[0, { rFwd: 62, lFwd: 48, lean: 14, nod: 20, rUp: -8 }], [0.5, { rFwd: 56, lFwd: 48, lean: 12, nod: 16, rUp: 8 }], [w, { rFwd: 40, lFwd: 30, lean: 4, nod: 0 }], [w + 0.35, { rUp: 120, rFwd: 20, lFwd: 12, tilt: -7, nod: -3 }], [dur, { rUp: 112, rFwd: 20, lFwd: 12, tilt: 5, nod: -2 }]], t), t > w + 0.3 ? { rUp: Math.sin(t * 11) * 9 } : {}));
      A.setFace(t < w - 0.1 ? 'softsmile' : t < w + 0.6 ? 'smile' : 'grin');
      camPath(cam, sm(t, 0, dur), [-1.6, 5.0, 7.4], [-2.3, 4.8, 4.6], [-2.6, 4.0, -4.4], [-2.6, 4.3, -4.6], 26, 30);
    };
  },
  // 11 "My building's monster hasn't made a sound in a year."  — (a) low angle: Dana stomps the floorboards twice, then cups an ear to the floor… nothing; (b) close: a shrug and a relieved little smirk.
  (S, cam) => {
    const env = danaFlat(S); const A = dana(S, 'thinking', [1.4, 0, 0.4], -8);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.6]); const s1 = 0.3, s2 = 0.75, lis = 1.15;
      const stomp = (t0) => { const u = (t - t0) / 0.3; return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0; };
      if (k === 0) { A.pose(ps(idle(t, 0.5), { rUp: 28, lUp: 28, rFwd: -8, lFwd: -8, nod: 26, lLeg: stomp(s1) * 46 + stomp(s2) * 46, bob: -(t > s1 + 0.28 && t < s1 + 0.4 ? 0.1 : 0) - (t > s2 + 0.28 && t < s2 + 0.4 ? 0.1 : 0) }, t > lis ? hit([[lis, {}], [lis + 0.35, { lean: 30, tilt: 22, lUp: 60, lFwd: 70, nod: 4, bob: -0.3 }]], t) : {}));
        A.setFace(t < lis ? 'determined' : 'thinking'); camPath(cam, lt, [4.2, 1.1, 5.4], [3.6, 1.3, 4.6], [1.4, 3.2, 0.4], [1.4, 3.0, 0.4], 22, 24); shake(cam, t, s1 + 0.28, 0.25); shake(cam, t, s2 + 0.28, 0.25); return; }
      const c = dur * 0.6; A.pose(ps(idle(t, 0.8), hit([[c, { lean: 6, tilt: 10 }], [c + 0.35, { rUp: 38, lUp: 38, rFwd: 28, lFwd: 28, tilt: 8, nod: -4, bob: 0.06 }], [c + 0.9, { rUp: 12, lUp: 12, rFwd: 8, lFwd: 8, tilt: -4 }]], t)));
      A.setFace(t < c + 0.3 ? 'confused' : t < c + 0.8 ? 'relieved' : 'smirk'); const h = headOf(A); faceCam(cam, lt, [h.x, 4.64, h.z], -8, { dist: 6.8, lens: 34, side: 0.9, push: 0.7 });
    };
  },
  // 12 "Which is lucky. I'm three months behind on rent."  — the fridge door, plastered with FINAL NOTICE bills; Dana leans into frame beside them, winces, then shows the camera all her teeth.
  //   Blocking: fridge screen left, Dana screen right 3/4, the cork board of receipts behind her. Camera: slow push toward the bills.
  (S, cam) => {
    const env = danaFlat(S); const A = dana(S, 'nervous', [3.1, 0, -4.3], -32);
    return (t, dur) => { env.update(t); const c = dur * 0.55; const lk = lookAt(A, [0.4, 4.6, -5.9]);
      A.pose(ps(idle(t, 0.7), t < c ? { turn: lk.turn, nod: lk.nod, lean: 8, rFwd: 30, rUp: 20 } : hit([[c, { turn: lk.turn, lean: 8, rFwd: 30, rUp: 20 }], [c + 0.35, { turn: 30, nod: -2, rUp: 38, lUp: 38, rFwd: 25, lFwd: 25, tilt: 8, bob: 0.05 }]], t), anticipate(t, c)));
      A.setFace(t < dur * 0.3 ? 'nervous' : t < c ? 'worried' : 'fakesmile');
      camPath(cam, sm(t, 0, dur), [2.2, 5.0, 2.4], [1.9, 4.8, 1.3], [1.6, 4.5, -5.6], [1.6, 4.5, -5.6], 22, 23);
    };
  },
  // 13 "Every night, I leave a plate by the basement door."  — the back hall of No. 9, seen from the foot of the basement door: Dana walks up with a plate of lasagna, bends and sets it down right in front of the lens.
  (S, cam) => {
    const env = cellarHall(S); const A = dana(S, 'softsmile', [0.9, 0, 3], 180); const pl = plateOf(S, { s: 1.15 });
    return (t, dur) => { env.update(t); const w = sm(t, 0, dur * 0.5); A.root.position.set(lerp(0.9, 0.3, w), 0, lerp(3.4, -2.8, w)); const b = dur * 0.52, u = sm(t, b, b + 0.5), up = sm(t, b + 0.7, b + 1.1);
      A.pose(ps(t < dur * 0.5 ? walk(t, 0.95, 24) : idle(t, 0.5), { rFwd: 52, lFwd: 52, rUp: -10, lUp: -10 }, { lean: 44 * (u - up), bob: -0.75 * (u - up), nod: 12 * u - 16 * up, rFwd: -14 * (u - up), lFwd: -14 * (u - up) }, anticipate(t, b), up > 0.5 ? { rUp: 14, lUp: 14, rFwd: -40 * up, lFwd: -40 * up } : {}));
      A.setFace(t < b + 0.6 ? 'softsmile' : 'smile'); const h = hands(A); const fl = [0.25, 0.06, -5.7];
      if (t < b) pl.position.set(h.x, h.y - 0.12, h.z - 0.2); else pl.position.set(lerp(h.x, fl[0], Math.min(1, u * 1.1)), Math.max(fl[1], lerp(h.y - 0.12, fl[1], Math.min(1, u * 1.1))), lerp(h.z - 0.2, fl[2], Math.min(1, u * 1.1))); if (up > 0) pl.position.set(...fl);
      camPath(cam, sm(t, 0, dur), [2.3, 0.9, -8.5], [2.6, 1.2, -8.4], [0.5, 3.0, -2.6], [0.4, 2.0, -4.2], 20, 21);
    };
  },
  // 14 "For the rats."  — floor level: a rat sniffs the plate… and the plate slides away by itself, bumps the basement door, a line of gold light flashes under it — and the plate is gone. The rat does a double take.
  (S, cam) => {
    const env = cellarHall(S); const pl = plateOf(S, { s: 1.15 }); const r = rat(S, 1.4); r.position.set(-1.6, 0, -6.4); r.rotation.y = 1.5;
    return (t, dur) => { env.update(t); const sl = dur * 0.38, u = sm(t, sl, sl + 0.45), gone = t > sl + 0.5;
      pl.position.set(0.25, 0.06, lerp(-5.7, -8.3, u)); pl.visible = !gone; pl.rotation.y = u * 2; env.glow(gone ? Math.max(0, 1 - (t - sl - 0.5) * 2.2) : u * 0.3);
      r.userData.update(t, t > sl + 0.1 ? 'shock' : 'sniff'); r.position.set(t < sl ? lerp(-2.4, -1.0, sm(t, 0, sl)) : -1.0 - sm(t, sl + 0.1, sl + 0.3) * 0.5, r.position.y, -5.9); r.rotation.y = t < sl + 0.55 ? 1.5 : 1.5 + sm(t, sl + 0.55, sl + 0.8) * 1.4;
      camPath(cam, sm(t, 0, dur), [3.0, 1.3, -1.6], [2.4, 1.1, -2.4], [-0.2, 0.6, -6.2], [-0.2, 0.8, -7.2], 26, 28); shake(cam, t, sl + 0.45, 0.15);
    };
  },
  // 15 "And yet, every month, a receipt slides under my door."  — Dana's flat: a slip of paper shoots in under the front door and spins to a stop; Dana (mug halfway to her mouth) stares at it.
  //   Blocking: Dana screen left facing the door 3/4, the door screen right. Camera: low, looking along the floor at the door; push in on the paper.
  (S, cam) => {
    const env = danaFlat(S, { receipts: 11 }); const A = dana(S, 'neutral', [2.4, 0, -4.9], -6); const rc = receipt(S, 1.0);
    return (t, dur) => { env.update(t); const s = dur * 0.22, u = sm(t, s, s + 0.55);
      rc.position.set(lerp(6.0, 4.9, u), 0.04, lerp(-8.3, -5.9, u)); rc.rotation.set(-Math.PI / 2, 0, u * 5.2 + 0.4);
      A.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 60, rUp: -6, nod: -4 }], [s + 0.3, { rFwd: 60, rUp: -6 }], [s + 0.55, { rFwd: 44, rUp: 4, lean: 8, nod: 16, turn: 44 }], [dur * 0.8, { rFwd: 30, lean: 14, nod: 22, turn: 48, bob: -0.1 }]], t), anticipate(t, s + 0.4)));
      A.setFace(t < s + 0.35 ? 'neutral' : t < dur * 0.7 ? 'shock' : 'confused');
      camPath(cam, sm(t, 0, dur), [0.6, 3.6, 3.0], [1.0, 3.4, 2.0], [3.9, 2.9, -6.2], [4.0, 2.8, -6.0], 22, 23);
    };
  },
  // 16 "Paid in full."  — close on the receipt in Dana's hands (RENT — PAID IN FULL — signed, downstairs), then up to her face: baffled… then delighted.
  (S, cam) => {
    const env = danaFlat(S, { receipts: 11 }); const A = dana(S, 'confused', [2.8, 0, -3.6], 0); const rc = receipt(S, 1.0);
    return (t, dur) => { env.update(t); env.key.position.set(2.5, 5.2, 2.5); const u = sm(t, dur * 0.4, dur * 0.85);
      A.pose(ps(idle(t, 0.5), { rFwd: 74, lFwd: 74, rUp: -14, lUp: -14, nod: 22 - u * 24, tilt: u * 6 }, t > dur * 0.6 ? { bob: Math.abs(Math.sin(t * 9)) * 0.05 } : {}));
      A.setFace(t < dur * 0.5 ? 'confused' : t < dur * 0.72 ? 'awe' : 'delighted'); const h = hands(A); rc.position.set(h.x, h.y + 0.55 - u * 0.3, h.z + 0.12); rc.rotation.set(-0.22, 0, Math.sin(t * 2) * 0.02);
      camPath(cam, u, [2.8, 3.9, 0.4], [2.9, 4.5, 1.8], [2.8, 3.75, -3.0], [2.8, 4.25, -3.4], 44, 34);
    };
  },
  // 17 "I didn't ask questions. Would you?"  — Dana pins receipt number twelve on a cork board that is already full of them, turns to the camera and shrugs with a wicked little smile.
  (S, cam) => {
    const env = danaFlat(S, { receipts: 11 }); const A = dana(S, 'smile', [4.5, 0, -6.0], 222);
    return (t, dur) => { env.update(t); const pin = dur * 0.3, tn = sm(t, pin + 0.1, pin + 0.6); env.receipts(t < pin ? 11 : 12); A.root.rotation.y = lerp(222, 366, tn) * D;
      A.pose(ps(idle(t, 0.6), anticipate(t, pin), hit([[0, { rFwd: 80, rUp: 6, nod: -6 }], [pin, { rFwd: 96, rUp: 6, nod: -6, lean: 6 }], [pin + 0.2, { rFwd: 60, rUp: 4 }], [pin + 0.75, { rUp: 36, lUp: 36, rFwd: 26, lFwd: 26, tilt: 9, nod: -3, bob: 0.06 }], [dur * 0.85, { rUp: 30, lUp: 30, rFwd: 22, lFwd: 22, tilt: -6, nod: 2 }]], t)));
      A.setFace(t < pin + 0.5 ? 'smile' : t < dur * 0.78 ? 'mischief' : 'wink');
      camPath(cam, sm(t, 0, dur), [3.0, 5.1, 4.2], [3.5, 5.0, 3.0], [3.6, 5.0, -7], [3.9, 4.9, -7], 24, 25);
    };
  },
  // 18 "Then my landlord, Mr. Crane, came knocking."  — three knocks rattle the front door; it swings in and Mr. Crane fills the doorway, hall light behind him, clipboard-stiff, looking down his nose.
  //   Camera: low inside the flat, pushing toward the door; low angle makes him loom.
  (S, cam) => {
    const env = danaFlat(S, { receipts: 12 }); const C = crane(S, 'angry', [5.95, 0, -9.9], 0); const rimL = fill(S, [5.9, 6.5, -11.5], 26, 0xffd0a0, 12); const fc = fill(S, [4.6, 4.2, -3.5], 0, 0xffe2c8, 10);
    return (t, dur) => { env.update(t); const op = dur * 0.42; const kn = [0.12, 0.38, 0.64].map(k => k * op); let j = 0; kn.forEach(k0 => { const u = t - k0; if (u > 0 && u < 0.14) j = Math.sin(u * 60) * 0.02; });
      const o = hn([[op, 0], [op + 0.4, 1]], t); env.door.open(o + j); const w = sm(t, op + 0.3, dur * 0.95); C.root.position.z = lerp(-9.9, -5.6, w); fc.intensity = 8 * w; const hp2 = sm(t, dur * 0.82, dur * 0.97);
      C.pose(ps(idle(t, 0.5), w > 0 && w < 1 ? walk(t, 0.9, 22) : {}, { rUp: 4 + 24 * hp2, lUp: 4 + 24 * hp2, rFwd: -8 * hp2, lFwd: -8 * hp2, lean: -4, nod: 10 }, t > dur * 0.85 ? { tilt: 6 } : {}));
      C.setFace(t < dur * 0.8 ? 'angry' : 'smirk');
      camPath(cam, sm(t, 0, dur), [2.6, 2.6, 2.2], [3.3, 2.9, 0.0], [5.8, 4.6, -8], [5.9, 4.9, -6.6], 24, 26); kn.forEach(k0 => shake(cam, t, k0, 0.14)); shake(cam, t, op + 0.3, 0.3);
    };
  },
  // 19 "Somebody pays your rent in gold coins."  — two-shot: Crane (screen right) holds an old gold coin up between them, talking; Dana (screen left) leans back from it, eyes on the coin.
  (S, cam) => {
    const env = danaFlat(S, { receipts: 12 }); env.door.open(1); const C = crane(S, 'angry', [5.9, 0, -3.4], -34), A = dana(S, 'nervous', [0.4, 0, -3.0], 12); const co = goldCoin(S, 0.32); const cl = fill(S, [3.4, 4.6, -3.6], 3, 0xffd060, 6);
    return (t, dur) => { env.update(t); env.key.position.set(3.3, 5.4, 4.5); env.key.intensity = 10; const cp = pinky(C, 'R'); co.position.set(cp.x - 0.1, cp.y + 0.35, cp.z + 0.1); co.rotation.set(Math.PI / 2, t * 3, 0); cl.position.copy(co.position); cl.position.z += 0.8;
      C.pose(ps(idle(t, 0.5), talk(t), hit([[0, { rFwd: 40, rUp: 10 }], [0.35, { rFwd: 98, rUp: 14, lean: 10 }], [dur * 0.6, { rFwd: 104, rUp: 14, lean: 14 }]], t), { lUp: 26, lFwd: -8 }, (l => ({ turn: l.turn * 0.35, nod: l.nod }))(lookAt(C, eye(A)))));
      C.setFace(t < dur * 0.5 ? 'angry' : 'smirk');
      A.pose(ps(idle(t, 0.7, 2), hit([[0.2, {}], [0.6, { lean: -10, rUp: 22, lUp: 22, rFwd: 30, lFwd: 30, bob: 0.04 }]], t), (l => ({ turn: l.turn * 0.35, nod: l.nod }))(lookAt(A, [co.position.x, co.position.y, co.position.z]))));
      A.setFace(t < 0.5 ? 'neutral' : t < dur * 0.6 ? 'nervous' : 'confused');
      camPath(cam, sm(t, 0, dur), [3.15, 4.8, 9.0], [3.15, 4.6, 7.4], [3.15, 4.3, -3.2], [3.15, 4.4, -3.2], 22, 23);
    };
  },
  // 20 "Old ones. Where's the rest?"  — close on Crane: he flips the coin, catches it, and leans right in, greedy.
  (S, cam) => {
    const env = danaFlat(S, { receipts: 12 }); env.door.open(1); const C = crane(S, 'mischief', [5.9, 0, -3.4], -52); const co = goldCoin(S, 0.32); const cl = fill(S, [3.4, 4.6, -3.6], 3, 0xffd060, 6); env.key.intensity = 8;
    return (t, dur) => { env.update(t); const fl = 0.25, u = ramp(t, fl, fl + 0.6); const cp = pinky(C, 'R'); co.position.set(cp.x - 0.1, cp.y + 0.35 + Math.sin(u * Math.PI) * 1.5, cp.z + 0.1); co.rotation.set(Math.PI / 2 + u * 12.6, 0.4, 0); cl.position.copy(co.position); cl.position.x -= 0.8;
      C.pose(ps(idle(t, 0.4), talk(t), anticipate(t, fl), hit([[0, { rFwd: 84, rUp: 10 }], [fl + 0.1, { rFwd: 96, rUp: 10 }], [fl + 0.6, { rFwd: 80, rUp: 10 }], [dur * 0.62, { rFwd: 70, rUp: 6, lean: 18, nod: 6 }], [dur, { rFwd: 70, rUp: 6, lean: 22, nod: 8 }]], t), { lUp: 26, lFwd: -8 }));
      C.setFace(t < dur * 0.5 ? 'mischief' : 'angry'); const h = headOf(C); faceCam(cam, sm(t, 0, dur), [5.9, 4.96, -3.4], -52, { dist: 7.8, lens: 34, side: -0.6, up: -0.2, push: 0.5, look: -0.1 });
    };
  },
  // 21 "He found gold dust on the basement door."  — the back hall: Crane runs a finger over the door's ring handle — it comes away glittering; he turns to the light, rubbing gold between finger and thumb, and grins.
  (S, cam) => {
    const env = cellarHall(S); const C = crane(S, 'thinking', [2.9, 0, -5.6], -137); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd040 })); S.add(gl); const gL = fill(S, [0, 0, 0], 0, 0xffc840, 4);
    return (t, dur) => { env.update(t); env.dust(1); env.bulb.intensity = 16; const tn = dur * 0.4, u = sm(t, tn, tn + 0.55); C.root.rotation.y = lerp(-137, -28, u) * D;
      C.pose(ps(idle(t, 0.5), anticipate(t, tn), hit([[0, { rFwd: 60, lean: 10, nod: 8 }], [0.4, { rFwd: 88, lean: 14, nod: 10 }], [tn, { rFwd: 86, lean: 12, nod: 10 }], [tn + 0.6, { rFwd: 112, rUp: -14, lean: 2, nod: 8, tilt: -6 }], [dur * 0.9, { rFwd: 116, rUp: -14, nod: 4, tilt: 5 }]], t)));
      C.setFace(t < tn ? 'thinking' : t < tn + 0.7 ? 'awe' : 'mischief'); const hp = pinky(C, 'R'); gl.position.copy(hp); gl.visible = t > 0.4; gl.scale.setScalar(1 + Math.sin(t * 14) * 0.3); gL.position.copy(hp); gL.intensity = t > 0.4 ? 1.5 : 0;
      camPath(cam, sm(t, 0, dur), [0.0, 4.5, 0.4], [0.9, 4.6, -1.6], [2.3, 4.0, -7.8], [2.8, 4.5, -7.2], 26, 30);
    };
  },
  // 22 "Rule one. Never open it after dark."  — push in on the red enamel sign on the door: DO NOT OPEN AFTER DARK. Dana, at the edge of frame, points at it and looks at us like "see?"
  (S, cam) => {
    const env = cellarHall(S); const A = dana(S, 'worried', [-2.9, 0, -6.6], 62);
    return (t, dur) => { env.update(t, 1.6); env.dust(1); const c = dur * 0.55; const lk = lookAt(A, [-0.1, 5.15, -8.7]), lc = lookAt(A, [-0.2, 4.9, -1]);
      A.pose(ps(idle(t, 0.5), hit([[0, { lFwd: 40 }], [0.35, { lFwd: 92, lUp: 14, lean: 4 }]], t), t < c ? { turn: lk.turn, nod: lk.nod } : hit([[c, { turn: lk.turn, nod: lk.nod }], [c + 0.3, { turn: lc.turn, nod: lc.nod + 4, tilt: 6 }]], t), { lFwd: Math.sin(t * 9) * (t > 0.4 && t < c ? 5 : 0) }));
      A.setFace(t < c ? 'worried' : 'nervous');
      camPath(cam, sm(t, 0, dur), [-0.2, 4.8, 0.2], [-0.6, 5.0, -2.4], [-0.9, 4.9, -8.7], [-0.7, 5.05, -8.7], 24, 25);
    };
  },
  // 23 "He opened it. With a shovel."  — from inside the black stairwell: a crack of light, a crunch, and the door bursts open — Crane with the shovel, gold glow from below on his grin, Dana behind him reaching out.
  //   Blocking: Crane screen right in the doorway, Dana screen left further back; both face the camera. Camera: low on the cellar steps, slow push.
  (S, cam) => {
    const env = cellarHall(S); const C = crane(S, 'determined', [1.6, 0, -4.0], 180), A = dana(S, 'worried', [-1.3, 0, -1.6], 180); const sh = spade(S);
    return (t, dur) => { env.update(t, 2); env.dust(1); const op = dur * 0.2; const o = hn([[op, 0], [op + 0.38, 0.92]], t); env.door.open(o); env.glow(0.2 + 0.4 * sm(t, op, op + 0.5));
      const w = sm(t, dur * 0.55, dur); C.root.position.z = lerp(-4.0, -5.2, w);
      C.pose(ps(idle(t, 0.5), w > 0 && w < 1 ? walk(t, 0.8, 18) : {}, hit([[0, { rFwd: 70, lFwd: 70, lean: 16, nod: 10 }], [op, { rFwd: 86, lFwd: 86, lean: 22, nod: 12 }], [op + 0.35, { rFwd: 40, lFwd: 10, rUp: 40, lean: -6, nod: -6 }], [dur * 0.6, { rFwd: 50, rUp: 30, lFwd: 8, nod: 12 }]], t), anticipate(t, op, 1.5)));
      C.setFace(t < op + 0.2 ? 'determined' : t < dur * 0.6 ? 'grin' : 'mischief'); const hp = pinky(C, 'R'); sh.position.set(hp.x, hp.y - 1.6, hp.z - 0.1); sh.rotation.set(t < op + 0.2 ? -0.9 : -0.15, 0, 0.1);
      A.pose(ps(idle(t, 0.8, 2), hit([[op + 0.2, { rUp: 10 }], [op + 0.6, { lFwd: 66, lUp: 10, lean: 8, bob: 0.05 }], [dur * 0.8, { lFwd: 40, rFwd: 30, rUp: 20, lean: 2 }]], t), (l => ({ turn: l.turn * 0.5, nod: l.nod }))(lookAt(A, eye(C)))));
      A.setFace(t < op + 0.3 ? 'worried' : t < dur * 0.7 ? 'shock' : 'scared');
      camPath(cam, sm(t, 0, dur), [0.5, 2.3, -12.8], [0.3, 2.8, -11.8], [0.5, 4.2, -5], [0.4, 4.3, -5], 22, 24); shake(cam, t, op + 0.05, 0.4);
    };
  },
  // 24 "Somebody down there had looked after me."  — close on Dana from the doorway, gold light on her face: she looks down at her empty plate by the door, then into the dark, and sets her jaw.
  (S, cam) => {
    const env = cellarHall(S); env.door.open(0.92); const A = dana(S, 'worried', [0.7, 0, -4.2], 180); const pl = plateOf(S, { food: 'none', s: 1.15 }); pl.position.set(0.25, 0.06, -5.7);
    return (t, dur) => { env.update(t, 1.2); env.glow(0.55); env.dust(1); const c = dur * 0.5; const ld = lookAt(A, [0.25, 0, -5.7]), lk = lookAt(A, [0, 1, -12]);
      A.pose(ps(idle(t, 0.6), t < c ? { turn: ld.turn, nod: ld.nod * 0.8 } : hit([[c, { turn: ld.turn, nod: ld.nod * 0.8 }], [c + 0.45, { turn: lk.turn, nod: lk.nod, rFwd: 16, lFwd: 16, rUp: 10, lUp: 10, lean: 4 }]], t), anticipate(t, c)));
      A.setFace(t < dur * 0.3 ? 'worried' : t < c + 0.2 ? 'softsmile' : 'determined');
      camPath(cam, sm(t, 0, dur), [-0.6, 4.3, -11.4], [-0.3, 4.5, -10.4], [0.7, 4.4, -4.2], [0.7, 4.5, -4.2], 34, 36);
    };
  },
  // 25 "So I followed him down."  — Dana clicks her flashlight on, throws one look back over her shoulder at us, and steps through the door into the dark, the beam going first.
  (S, cam) => {
    const env = cellarHall(S); env.door.open(0.92); const A = dana(S, 'nervous', [0.9, 0, -1.2], 180); const tc = handTorch(S);
    return (t, dur) => { env.update(t, 1.2); env.glow(0.6); env.dust(1); const go = dur * 0.45, w = sm(t, go, dur); const z = lerp(-1.2, -10.2, w); A.root.position.set(lerp(0.9, -0.2, Math.min(1, w * 1.7)), z < -9.4 ? (z + 9.4) * 0.6 : 0, z);
      A.pose(ps(idle(t, 0.5), w > 0 ? walk(t, 0.9, 26) : {}, { rFwd: 68, rUp: -4 }, hit([[0.2, {}], [0.5, { turn: -70, nod: 2, bodyTurn: -30 }], [go - 0.1, { turn: -70, nod: 2, bodyTurn: -30 }], [go + 0.25, { turn: 0, nod: 6, lean: 6 }]], t), anticipate(t, go)));
      A.setFace(t < 0.45 ? 'nervous' : t < go ? 'worried' : 'determined'); const hp = pinky(A, 'R'); tc.position.set(hp.x, hp.y + 0.1, hp.z - 0.2); tc.rotation.y = Math.PI; tc.userData.on(t > 0.18 ? 1 : 0);
      camPath(cam, sm(t, 0, dur), [2.6, 3.4, 6.4], [2.0, 3.6, 3.6], [0.4, 3.9, -6], [0.2, 3.5, -9], 26, 30);
    };
  },
  // 26 "The stairs went on far too long."  — the boiler-room stairs: Crane stamps down ahead with his shovel, Dana a few steps behind with the flashlight; the camera backs away below them and the stair just keeps coming.
  (S, cam) => {
    const env = deepStairs(S, { zone: 'boiler' }); const C = crane(S, 'determined', [0.8, 0, 3], 0), A = dana(S, 'nervous', [-0.9, 0, -4], 0); const tc = handTorch(S), sh = spade(S); allow(S, ['dana', 'step'], ['crane', 'step']);
    return (t, dur) => { env.update(t); const zc = 2.6 + t * 2.5, za = -4.4 + t * 2.5; C.root.position.set(1.7, stairWalkY(zc), zc); A.root.position.set(-1.6, stairWalkY(za), za);
      C.pose(ps(WALKDOWN(t, 1.12), { rFwd: 30, rUp: 14, turn: Math.sin(t * 1.5) * 10 })); C.setFace(t < dur * 0.6 ? 'determined' : 'angry');
      A.pose(ps(WALKDOWN(t + 0.4, 1.12), { rFwd: 70 }, t > dur * 0.5 ? { turn: -30 * sm(t, dur * 0.5, dur * 0.7), nod: -14 * sm(t, dur * 0.5, dur * 0.7) } : {})); A.setFace(t < dur * 0.5 ? 'nervous' : 'worried');
      const hp = pinky(A, 'R'); tc.position.set(hp.x, hp.y + 0.1, hp.z + 0.3); tc.rotation.x = 0.25; tc.userData.on(1); const cp = pinky(C, 'R'); sh.position.set(cp.x, cp.y - 1.5, cp.z); sh.rotation.set(0.5, 0, 0.2);
      const zm = (zc + za) / 2, cz = zm + lerp(12, 17, sm(t, 0, dur)); env.keyAt(0, slopeY(zm) + 6, zm + 7, 60);
      camPath(cam, 1, [-0.4, slopeY(cz) + 2.6, cz], [-0.4, slopeY(cz) + 2.6, cz], [0, slopeY(zm) + 4.6, zm], [0, slopeY(zm) + 4.6, zm], lerp(24, 19, sm(t, 0, dur)));
    };
  },
  // 27 "Past the boiler. Past the bedrock."  — (a) Dana edges past a huge copper boiler, its grate glowing, steam hissing; (b) deeper: bare rock, glowing mushrooms, a fossil the size of a bus in the wall, a sign: KEEP GOING.
  (S, cam) => {
    const GA = new THREE.Group(), GB = new THREE.Group(); S.add(GA, GB); const eA = deepStairs(GA, { zone: 'boiler' }), eB = deepStairs(GB, { zone: 'bedrock' }); S.background = new THREE.Color(0x020203); S.userData.look = 'night';
    const A = dana(S, 'nervous', [-0.6, 0, -8], 0); const tc = handTorch(S); allow(S, ['dana', 'step']);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.5]); GA.visible = k === 0; GB.visible = k === 1; (k ? eB : eA).update(t);
      const z = k === 0 ? lerp(-9.4, -4.6, lt) : lerp(-6.2, -1.6, lt); A.root.position.set(-0.4, stairWalkY(z), z); const look = k === 0 ? [-5.9, slopeY(-5.5) + 5, -5.5] : [-8, slopeY(-3) + 6.6, -3]; const l = lookAt(A, look);
      A.pose(ps(WALKDOWN(t, 1.05), { rFwd: 66, turn: l.turn * 0.4, nod: l.nod * 0.4 - 8 })); A.setFace(k === 0 ? (lt < 0.5 ? 'nervous' : 'worried') : (lt < 0.55 ? 'awe' : 'nervous'));
      const hp = pinky(A, 'R'); tc.position.set(hp.x, hp.y + 0.1, hp.z + 0.3); tc.rotation.set(0.2, k ? -0.5 : -0.3, 0); tc.userData.on(1); (k ? eB : eA).keyAt(2.5, slopeY(z) + 5, z + 5, 40);
      if (k === 0) camPath(cam, lt, [5.6, slopeY(-3) + 3.2, 2.4], [5.0, slopeY(-2) + 3.4, 3.4], [-2.6, slopeY(-7) + 4.6, -7], [-2.4, slopeY(-5) + 4.4, -5], 20, 22);
      else camPath(cam, lt, [5.4, slopeY(1) + 3.4, 4.2], [4.6, slopeY(2) + 3.6, 5.0], [-3.4, slopeY(-4.5) + 5.0, -4.5], [-3.0, slopeY(-2.5) + 4.8, -2.5], 20, 22);
    };
  },
  // 28 "Then my flashlight died. Of course it did."  — the stairs simply stop at a ledge over nothing. Dana's beam flickers, dies; she smacks the flashlight twice, then gives us a flat, tired look in the dark.
  (S, cam) => {
    const env = deepStairs(S, { zone: 'dark' }); const A = dana(S, 'nervous', [0, stairY(4.2), 4.2], 0); const tc = handTorch(S); allow(S, ['dana', 'step']); const fl = fill(S, [0.8, stairY(4.2) + 5.2, 8.0], 3, 0xa8c4ff, 14); fill(S, [-2, stairY(4.2) + 1.5, 7], 10, 0x5a78c0, 12);
    return (t, dur) => { env.update(t); const die = dur * 0.36; const on = t < die - 0.5 ? 1 : t < die ? (Math.sin(t * 50) > 0 ? 1 : 0.15) : 0; tc.userData.on(on); fl.intensity = 20 + (1 - on) * 10;
      const sm1 = die + 0.35, sm2 = die + 0.7; const smack = (t0) => { const u = (t - t0) / 0.22; return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0; };
      A.pose(ps(idle(t, 0.6), { rFwd: 66 + smack(sm1) * 14 + smack(sm2) * 14, lFwd: t > die + 0.2 && t < sm2 + 0.4 ? 60 + smack(sm1) * 24 + smack(sm2) * 24 : 0, lUp: t > die + 0.2 && t < sm2 + 0.4 ? -24 : 3, rUp: -4 }, t < die ? { nod: 10 } : hit([[die, { nod: 10 }], [die + 0.3, { nod: 26, lean: 6 }], [sm2 + 0.4, { nod: 26, lean: 6 }], [sm2 + 0.8, { nod: 0, lean: 0, tilt: 5, rFwd: -40, bob: -0.06 }]], t)));
      A.setFace(t < die ? 'nervous' : t < sm2 + 0.45 ? 'angry' : 'bored'); const hp = pinky(A, 'R'); tc.position.set(hp.x, hp.y + 0.1, hp.z + 0.3); tc.rotation.x = 0.3 + (t > sm2 + 0.5 ? 1.0 : 0);
      const y0 = stairY(4.2); camPath(cam, sm(t, 0, dur), [1.6, y0 + 4.9, 12.5], [1.0, y0 + 4.8, 10.6], [0, y0 + 4.3, 4.2], [0, y0 + 4.5, 4.2], 32, 36);
    };
  },
];
