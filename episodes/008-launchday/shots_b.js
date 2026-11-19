import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, box, std, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn, pinky,
  neonBeach, waitBlob, gameRoom, boombox, controller, flamingo } from '../../engine/kit.js';
import { RICO, LULU, SAL, SAL_SHOES, DANI, SIGNKID, CROWD, mk, clamp01, ramp, sm, V, faceCam, fill, allowGround, SKATE, DANCE, RUN, hold, PHONE_UP } from './common.js';
import { hn } from './common.js';
import { cdPhone } from './shots_a.js';

const BOARD = [10, 16.5, -14.6];
const WY = 12, WZ = -7;   // power wires
// launch night on the strip: shop + wires + billboard. time 'night' (neon on) or 'dark' (power cut)
const strip = (S, time = 'night', o = {}) => neonBeach(S, { time, view: 'strip', shop: true, wires: true, cars: false, billboard: BOARD, board: { text: '00:12:00', sub: 'TO MIDNIGHT' }, ...o });
// the big Wait sitting on the wires at x: size s, squash
const onWires = (b, env, x, s, sq = 1.5) => { b.grow(s); b.squash(sq); b.root.position.set(x, WY - 1.1 * s * (sq - 1) * 0.5 - 0.4 * s, WZ); env.wires.sag(Math.min(1, s / 5), x); };
// a phone flashlight in someone's hand (+ the light on their face)
const torch = (S, A, side = 'R') => { const g = new THREE.Group(); S.add(g); const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.06), std({ color: 0x1a1a1e })); g.add(b);
  const l = new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); l.position.z = -0.04; l.rotation.y = Math.PI; g.add(l);
  const pl = new THREE.PointLight(0xe8f0ff, 7, 7, 1.6); S.add(pl);
  return { g, update() { const p = pinky(A, side); g.position.set(p.x, p.y + 0.3, p.z + 0.15); const h = A.headMesh.getWorldPosition(new THREE.Vector3()); const ry = A.root.rotation.y; pl.position.set(h.x + Math.sin(ry) * 1.8, h.y + 0.6, h.z + Math.cos(ry) * 1.8); } }; };
const queue = (S, n, x0, z, faces = ['awe', 'starstruck', 'neutral', 'delighted']) => [...Array(n)].map((_, i) => mk(S, CROWD[(i + 2) % CROWD.length], 'q' + i, faces[i % faces.length], [x0 + i * 4.4, 0, z + (i % 2) * 0.5], 200 + (i % 3) * 10));

export const SHOTS_B = [
  // 20 "On launch night, the whole town lined up."  — dolly along the queue under the blazing neon to the Pixel Palace door
  (S, cam) => {
    const env = strip(S); env.board.set('00:14:59');
    const Q = queue(S, 5, 5, -3.5); const r = mk(S, RICO, 'rico', 'delighted', [-4.2, 0, -3.2], 190), sl = mk(S, SAL_SHOES, 'sal', 'smile', [0.4, 0, -3.6], 175), d = mk(S, DANI, 'dani', 'grin', [-8.6, 0, -3.4], 200);
    const l = mk(S, LULU, 'lulu', 'smile', [0, 0, -13.4], 0); allowGround(S, 'lulu');
    const w = waitBlob(S, { name: 'wait', size: 4.2 }); w.root.position.set(-30, 0, -40);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [24, 6, 9], [-2, 5, 9.5], [16, 4.5, -4], [-2, 5, -9], 24, 26);
      [...Q, r, sl, d].forEach((a, i) => a.pose(addPose(idle(t, 0.8, i), addPose(lookAt(a, [10, 16, -14.6]), i % 3 === 0 ? { bob: Math.abs(Math.sin(t * 5 + i)) * 0.1 } : {}))));
      l.pose(addPose(idle(t, 0.6), { rUp: 120 + Math.sin(t * 8) * 25 })); w.animate(t, 'idle'); w.look(V([0, 5, 0]));
      env.update(t);
    };
  },
  // 21 "Ten to midnight. All eyes on the clock."  — faces in the billboard glow: Rico, Grandpa, Dani staring up; the clock hits 00:10:00
  (S, cam) => {
    const env = strip(S);
    const r = mk(S, RICO, 'rico', 'starstruck', [0, 0, -2], 180), sl = mk(S, SAL_SHOES, 'sal', 'awe', [4.4, 0, -1.6], 170), d = mk(S, DANI, 'dani', 'awe', [-4.4, 0, -2.2], 190);
    const glow = fill(S, [0, 9, -6], 12, 0xff8ad8, 16);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      env.board.set(t < dur * 0.4 ? '00:10:01' : '00:10:00');
      if (c === 0) camPath(cam, p, [6, 18, -10], [5.5, 17.2, -9], [10, 16.5, -14.6], [10, 16.5, -14.6], 28, 30);
      else camPath(cam, p, [0.5, 3.6, -9.5], [0.3, 3.8, -8.4], [0, 5.2, -2], [0, 5.1, -2], 28, 32);
      [r, sl, d].forEach((a, i) => a.pose(addPose(addPose(idle(t, 0.4, i), lookAt(a, [10, 16.5, -14.6])), { bob: 0 })));
      glow.intensity = 12 + Math.sin(t * 6) * 2; env.update(t);
    };
  },
  // 22 "And the Wait grew taller than the hotels."  — CLIMAX/hook: low angle — the blob swells up behind the hotel row, taller than all of them; the crowd recoils
  (S, cam) => {
    const env = strip(S); env.board.set('00:09:30');
    const w = waitBlob(S, { name: 'wait', size: 3 }); w.root.position.set(-4, 0, -32); allowGround(S, 'wait');
    const r = mk(S, RICO, 'rico', 'shock', [-4.6, 0, 6.5], 165), d = mk(S, DANI, 'dani', 'scared', [4.4, 0, 7.0], 200);
    const wl = new THREE.PointLight(0xff5ab8, 0, 80, 1.2); wl.position.set(-4, 26, -18); S.add(wl);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0.5, 1.0, 16], [0.2, 0.8, 18.5], [-2, 12, -10], [-3, 19, -20], 22, 22);
      const g = 3 + 6 * hn([[0.2, 0], [dur * 0.75, 1]], t); w.grow(g); w.animate(t * 0.6, 'idle'); w.look(V([0, 3, 6]));
      wl.intensity = 30 * ramp(t, 0.2, dur * 0.6);
      [r, d].forEach((a, i) => a.pose(addPose(addPose(idle(t, 0.4, i), lookAt(a, [-4, 26, -32])), hit([[0.4 + i * 0.1, POSES.rest], [0.9 + i * 0.1, { rUp: 40, lUp: 40, rFwd: 50, lFwd: 50, lean: -10 }]], t))));
      env.update(t);
    };
  },
  // 23 "It flopped onto the power lines."  — it topples forward over the hotels and plops onto the wires; they sag, sparks fly
  (S, cam) => {
    const env = strip(S); env.board.set('00:09:12');
    const w = waitBlob(S, { name: 'wait', size: 6 }); allowGround(S, 'wait');
    const sparks = [...Array(14)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfff2a0 })); S.add(m); return m; });
    return (t, dur) => {
      camPath(cam, t / dur, [3, 6, 30], [2, 5, 27], [0, 12, -10], [0, 10, -7], 24, 24);
      const tf = dur * 0.55, k = ramp(t, 0, tf);
      if (t < tf) { const s = 7 - 2.5 * k; w.grow(s); w.squash(1); w.root.position.set(-4 + 4 * k, Math.sin(k * Math.PI) * 10, -34 + 27 * k); w.root.rotation.x = k * 0.6; env.wires.sag(0, 0); }
      else { const u = t - tf; w.root.rotation.x = 0.6 * Math.max(0, 1 - u * 3); onWires(w, env, 0, 4.5, 1 + 0.6 * hn([[0, 0], [0.4, 1]], u)); }
      w.animate(t, 'scared'); w.look(cam.position);
      sparks.forEach((m, i) => { const u = t - tf; m.visible = u > 0 && u < 1.2; const a = i * 0.9; m.position.set(Math.cos(a) * (2 + u * 7) + (i % 2 ? 9 : -9), WY + u * 4 - u * u * 9 + (i % 3), WZ + Math.sin(a) * 2); });
      env.update(t);
    };
  },
  // 24 "Every neon sign in Vice City went dark. [pause]"  — the neon blinks out, sign by sign; the billboard dies last
  (S, cam) => {
    const env = strip(S); env.board.set('00:08:59');
    const w = waitBlob(S, { name: 'wait', size: 4.5 }); onWires(w, env, 0, 4.5, 1.6);
    const r = mk(S, RICO, 'rico', 'shock', [-2.8, 0, 2], 160), l = mk(S, LULU, 'lulu', 'shock', [3.0, 0, 2.6], 200);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [1, 3, 18], [0.5, 4, 15], [0, 8, -10], [0, 7, -10], 24, 26);
      const k = 1 - ramp(t, dur * 0.2, dur * 0.55), fl = t > dur * 0.2 && t < dur * 0.55 && Math.sin(t * 40) > 0.3 ? 0.5 : 1;
      env.neon(Math.max(0, k * fl)); w.glow(0.3 + 0.7 * k); w.animate(t, 'idle'); onWires(w, env, 0, 4.5, 1.6); w.look(V([0, 3, 4]));
      env.key.intensity = 14 * (0.35 + 0.65 * k);
      [r, l].forEach((a, i) => a.pose(addPose(addPose(idle(t, 0.4, i), lookAt(a, [10, 14, -14])), hit([[dur * 0.5, POSES.rest], [dur * 0.62, { rUp: 30, lUp: 30, nod: -8 }]], t))));
      if (t > dur * 0.55) { r.setFace('worried'); l.setFace('scared'); }
      env.update(t);
    };
  },
  // 25 ""No power means no game!" Lulu cried."  — Lulu in the dark, phone torch on her face, arms up in despair
  (S, cam) => {
    const env = strip(S, 'dark');
    const l = mk(S, LULU, 'lulu', 'cry', [0, 0, 2], -10); const tl = torch(S, l, 'L');
    const w = waitBlob(S, { name: 'wait', size: 4.5, glow: 0.2 }); onWires(w, env, 0, 4.5, 1.6);
    return (t, dur) => {
      faceCam(cam, t / dur, [0, 4.64, 2], -10, { dist: 7.4, lens: 32, push: 1.2, side: -0.6, up: 0.4 });
      l.pose(addPose(addPose(hit([[0, { lFwd: 70, lUp: -10 }], [0.5, { lFwd: 80, lUp: -10, rUp: 150, rFwd: 10, lean: -8, nod: -12 }], [dur - 0.4, { lFwd: 75, lUp: -10, rUp: 130, nod: -6 }]], t), talk(t, 1.2)), sob(t)));
      tl.update(); w.animate(t, 'idle'); onWires(w, env, 0, 4.5, 1.6); env.update(t);
    };
    function sob(t) { return { bob: Math.abs(Math.sin(t * 9)) * 0.04, tilt: Math.sin(t * 4.5) * 3 }; }
  },
  // 26 "Then Grandpa told a really bad joke."  — Grandpa raises a finger, delivers the punchline; Rico (torch) cringes
  (S, cam) => {
    const env = strip(S, 'dark');
    const s = mk(S, SAL_SHOES, 'sal', 'mischief', [1.8, 0, 2.2], -30), r = mk(S, RICO, 'rico', 'neutral', [-3.2, 0, 3.6], 60); const tr = torch(S, r, 'R');
    fill(S, [1, 6, 7], 5, 0xc8d8ff);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.6]);
      if (c === 0) faceCam(cam, p, [1.8, 4.64, 2.2], -30, { dist: 9.0, lens: 30, side: 1.6, up: 0.1, look: -0.6 });
      else faceCam(cam, p, [-3.2, 4.64, 3.6], 60, { dist: 6.6, lens: 34, side: -0.4, up: -0.3 });
      s.pose(addPose(addPose(hit([[0, POSES.rest], [0.4, { rUp: 100, rFwd: 70, turn: 10 }], [dur * 0.6, { rUp: 110, rFwd: 60, turn: 20 }], [dur * 0.75, { rUp: 40, lUp: 40, rFwd: -10, lean: -6 }]], t), talk(t, t < dur * 0.7 ? 1 : 0)), lookAt(s, [-3.2, 4.6, 3.6])));
      s.setFace(t < dur * 0.6 ? 'mischief' : 'laugh');
      r.pose(addPose(addPose({ rFwd: 70, rUp: -10 }, lookAt(r, [1.8, 4.6, 2.2])), c === 1 ? { nod: 6, tilt: -6 } : {})); r.setFace(c === 1 ? 'disgusted' : 'neutral');
      tr.update(); env.update(t);
    };
  },
  // 27 "Everyone laughed. Nobody looked at the clock."  — the whole dark line cracks up, phones down; even Lulu laughs
  (S, cam) => {
    const env = strip(S, 'dark');
    const Q = [...Array(5)].map((_, i) => mk(S, [CROWD[0], LULU, CROWD[3], RICO, CROWD[1]][i], ['c0', 'lulu', 'c1', 'rico', 'c2'][i], 'laugh', [-8.8 + i * 4.4, 0, 1 + (i % 2) * 0.6], 180 + (i - 2) * 10 + 180));
    const T = [torch(S, Q[1], 'L'), torch(S, Q[3], 'R')]; fill(S, [0, 6, 9], 9, 0xc8d8ff, 18);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 4.5, 21], [0, 4.6, 19], [0, 3.8, 1], [0, 4.0, 1], 24, 24);
      Q.forEach((a, i) => a.pose(addPose(addPose(idle(t, 0.5, i), { bob: Math.abs(Math.sin(t * 10 + i)) * 0.08, nod: -10 + Math.sin(t * 10 + i) * 6, lean: -6 }), i === 1 ? { lFwd: 60 } : i === 3 ? { rFwd: 60, rUp: -10 } : { rFwd: 30, lFwd: 30, rUp: -10, lUp: -10 })));
      T.forEach(x => x.update()); env.update(t);
    };
  },
  // 28 "And the Wait shrank. Just a little. [pause]"  — on the wires, the blob deflates a notch (the wires spring up a bit); Rico notices
  (S, cam) => {
    const env = strip(S, 'dark');
    const w = waitBlob(S, { name: 'wait', size: 4.5, glow: 0.25 });
    const r = mk(S, RICO, 'rico', 'confused', [0, 0, 3], 180); const tr = torch(S, r, 'R'); fill(S, [0, 7, -3], 6, 0xffb0e0, 10);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.55]);
      const s = 4.5 - 0.7 * hn([[dur * 0.2, 0], [dur * 0.45, 1]], t); onWires(w, env, 0, s, 1.6); w.animate(t, 'idle'); w.look(V([0, 4, 3]));
      if (c === 0) camPath(cam, p, [2, 4, 14], [1.5, 5, 12.5], [0, 10, -7], [0, 10.5, -7], 26, 28);
      else camPath(cam, p, [0.8, 4.4, -4.4], [0.6, 4.4, -3.6], [0, 4.7, 3], [0, 4.7, 3], 34, 38);
      r.pose(addPose(addPose({ rFwd: 60, rUp: -10 }, lookAt(r, [0, 10, -7])), idle(t, 0.5))); r.setFace(c === 1 ? 'thinking' : 'confused');
      tr.update(); env.update(t);
    };
  },
  // 29 "It eats waiting! So we stopped waiting."  — Rico's lightbulb moment: close-up, face snaps from shock to determined
  (S, cam) => {
    const env = strip(S, 'dark');
    const r = mk(S, RICO, 'rico', 'shock', [0, 0, 2], 0); const tr = torch(S, r, 'R'); const rim = fill(S, [0, 9, -4], 10, 0xff6ad8, 12);
    return (t, dur) => {
      faceCam(cam, sm(t, 0, dur), [0, 4.64, 2], 0, { dist: 6.8, lens: 34, push: 1.4, side: 0.6, up: 0.0 });
      r.pose(addPose(addPose(hit([[0, { rFwd: 60, rUp: -10 }], [0.3, { rFwd: 60, rUp: -10, lUp: 30, nod: -10 }], [dur * 0.5, { rFwd: 60, rUp: -10, lUp: 80, lFwd: 60, nod: 4, lean: 6 }]], t), anticipate(t, dur * 0.5)), talk(t, 0.4)));
      r.setFace(t < dur * 0.45 ? 'shock' : 'determined'); tr.update(); env.update(t);
    };
  },
  // 30 ""Beach party!" I yelled. "Right here!""  — Rico leaps onto a bench, arms up; the crowd turns
  (S, cam) => {
    const env = strip(S, 'dark');
    box(S, [6, 1.4, 1.8], [0, 0.7, 3], std({ color: 0xf6a8c4 }), { r: 0.15, name: 'bench' });
    const r = mk(S, RICO, 'rico', 'determined', [0, 0, 5.4], 0); const C = [mk(S, CROWD[0], 'c0', 'confused', [-6.2, 0, 7.5], 140), mk(S, CROWD[3], 'c1', 'confused', [6.2, 0, 7.8], 220)];
    S.userData.allowContact = [['rico', 'bench']]; fill(S, [0, 9, 12], 12, 0xd8e0ff, 18); fill(S, [-1, 4, -2], 6, 0xff7ad8, 10);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 1.8, 15], [0, 1.5, 13.5], [0, 5.6, 3], [0, 6.2, 3], 26, 26);
      const j = clamp01((t - 0.35) / 0.4), y = j < 1 ? Math.sin(j * Math.PI) * 1.4 + j * 1.4 : 1.4;
      r.root.position.set(0, y, 5.4 - 2.4 * j);
      r.pose(addPose(addPose(anticipate(t, 0.35, 1.5), hit([[0.3, POSES.rest], [0.75, { rUp: 160, lUp: 160, rLeg: j < 1 ? 30 : 0 }], [dur, { rUp: 150 + Math.sin(t * 8) * 10, lUp: 150 }]], t)), talk(t, 1)));
      r.setFace(t > 0.7 ? 'laugh' : 'determined');
      C.forEach((a, i) => a.pose(addPose(lookAt(a, [0, 6.5, 3]), idle(t, 0.5, i)))); if (t > dur * 0.6) C.forEach(a => a.setFace('delighted'));
      env.update(t);
    };
  },
  // 31 "Lulu cranked up her boombox."  — she hoists the boombox; its neon speakers pump; a dancer starts bouncing
  (S, cam) => {
    const env = strip(S, 'dark');
    const l = mk(S, LULU, 'lulu', 'mischief', [0, 0, 2], 10); const bb = boombox(S); const c = mk(S, CROWD[4], 'c0', 'delighted', [-5.6, 0, 0.5], 30);
    const bl = new THREE.PointLight(0xff5ab8, 8, 9, 1.6); S.add(bl); fill(S, [1, 6.5, 8], 6, 0xd8e0ff);
    return (t, dur) => {
      camPath(cam, t / dur, [1, 3.6, 11], [0.8, 4.4, 9.6], [-0.5, 5.6, 2], [-0.5, 5.4, 2], 28, 30);
      l.pose(addPose(hit([[0, { rFwd: 30, rUp: -10 }], [0.5, { rUp: 160, rFwd: 10, nod: -10 }], [dur, { rUp: 155, rFwd: 10, nod: -6 }]], t), DANCE(t, t > 0.6 ? 0.4 : 0)));
      const p = pinky(l, 'R'); bb.position.set(p.x + 0.4, p.y + 1.1, p.z + 0.2); bb.rotation.z = Math.sin(t * 7) * 0.08; bb.pulse(t, t > 0.5 ? 1 : 0); bl.position.set(p.x, p.y, p.z + 1.5); bl.intensity = t > 0.5 ? 8 + Math.sin(t * 13) * 3 : 0;
      l.setFace(t > 0.6 ? 'laugh' : 'mischief');
      c.pose(addPose(DANCE(t, t > 0.8 ? 1 : 0, 1), lookAt(c, [0, 6, 2]))); if (t > 0.8) c.setFace('laugh');
      env.update(t);
    };
  },
  // 32 "Grandpa did his roller skate show."  — Grandpa spins on his skates, arms out, crowd claps (low angle)
  (S, cam) => {
    const env = strip(S, 'dark');
    const s = mk(S, SAL, 'sal', 'delighted', [0, 0, 2], 0); allowGround(S, 'sal');
    const C = [mk(S, CROWD[1], 'c0', 'starstruck', [-6.2, 0, -0.5], 40), mk(S, DANI, 'dani', 'laugh', [6.2, 0, -0.8], -40)];
    fill(S, [0, 8, 9], 12, 0xe0e4ff, 16); fill(S, [3, 3, -3], 6, 0xff7ad8, 10);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 2.4, 16], [-3, 2.6, 15], [0, 4.2, 1], [0, 4.3, 1], 28, 28);
      const sp = hn([[0, 0], [0.6, 1]], t); s.root.rotation.y = t * 7 * sp; s.root.position.x = Math.sin(t * 2) * 0.6;
      s.pose(addPose({ rUp: 90 * sp, lUp: 90 * sp, lLeg: 30 * sp, lean: 4, bob: 0.05 }, { tilt: Math.sin(t * 3) * 6 }));
      C.forEach((a, i) => a.pose(addPose(addPose(lookAt(a, [0, 4.6, 2]), { rFwd: 70 + Math.abs(Math.sin(t * 12 + i)) * 15, lFwd: 70 + Math.abs(Math.sin(t * 12 + i)) * 15, rUp: -18, lUp: -18 }), idle(t, 0.5, i))));
      env.update(t);
    };
  },
  // 33 "My friend Dani started a conga line."  — Dani leads a conga line down the dark strip, phone torches waving
  (S, cam) => {
    const env = strip(S, 'dark');
    const L = [mk(S, DANI, 'dani', 'laugh', [0, 0, 0], 90), ...[0, 1, 2, 3].map(i => mk(S, CROWD[i + 1], 'c' + i, ['delighted', 'laugh', 'grin', 'laugh'][i], [0, 0, 0], 90))];
    fill(S, [0, 8, 10], 12, 0xe0e4ff, 22); fill(S, [-6, 4, 2], 6, 0xff7ad8, 10);
    return (t, dur) => {
      camPath(cam, t / dur, [7, 4.6, 13], [8.5, 4.4, 11.5], [-3, 4.0, 1], [0, 4.0, 1], 26, 26);
      L.forEach((a, i) => { const x = -3 + t * 3.2 - i * 3.4, z = 1 + Math.sin((x) * 0.5) * 0.8; a.root.position.set(x, 0, z); a.root.rotation.y = (90 - Math.cos(x * 0.5) * 20) * D;
        const k = Math.sin(t * 9 + i * 0.5); a.pose(addPose(walk(t + i * 0.2, 0.9, 22), i === 0 ? { rUp: 150, lUp: 30 + k * 30, bodyTilt: k * 6 } : { rFwd: 85, lFwd: 85, rUp: -14, lUp: -14, bodyTilt: k * 6, rLegOut: Math.max(0, k) * 25 })); });
      env.update(t);
    };
  },
  // 34 "Nobody checked the countdown. Not once. [pause]"  — wide party in the dark: dancers, a sandcastle, the dead billboard ignored
  (S, cam) => {
    const env = strip(S, 'dark');
    const D0 = [0, 1, 2, 3, 4].map(i => mk(S, [CROWD[0], LULU, CROWD[2], RICO, CROWD[5]][i], ['c0', 'lulu', 'c2', 'rico', 'c5'][i], ['laugh', 'laugh', 'delighted', 'laugh', 'grin'][i], [-9 + i * 4.5, 0, 0.5 + (i % 2) * 3.4], 180 + 180 - 15 + i * 7));
    const sand = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2, 6), std({ color: 0xe8d4a8 })); sand.position.set(4, 1, 6); S.add(sand);
    const k = mk(S, SIGNKID, 'kid', 'delighted', [7.2, 0, 6.6], -60); k.root.position.y = -1.5; k.root.scale.setScalar(0.85); S.userData.allowContact = [['kid', 'ground']];
    fill(S, [0, 8, 12], 14, 0xe0e4ff, 24); fill(S, [-4, 4, -4], 7, 0xff7ad8, 12);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-3, 9, 22], [0, 7, 19], [2, 6, -6], [4, 9, -12], 24, 24);
      D0.forEach((a, i) => a.pose(DANCE(t, 1, i * 1.3)));
      k.pose({ rLeg: 90, lLeg: 90, rFwd: 70 + Math.sin(t * 6) * 15, lFwd: 60, nod: 20 });
      env.update(t);
    };
  },
  // 35 "The Wait got smaller, and smaller."  — on the wires the blob deflates in steps; the wires spring back
  (S, cam) => {
    const env = strip(S, 'dark');
    const w = waitBlob(S, { name: 'wait', size: 3.8, glow: 0.3 });
    return (t, dur) => {
      camPath(cam, t / dur, [1, 5, 22], [0.5, 8, 15], [0, 10, -7], [0, 11, -7], 26, 32);
      const s = 3.8 - 3.1 * hn([[0, 0], [dur * 0.4, 0.5], [dur * 0.9, 1]], t); onWires(w, env, 0, s, 1.2 + 0.3 * (s / 3.8)); w.animate(t, 'idle'); w.look(V([0, 4, 6]));
      env.update(t);
    };
  },
  // 36 "It rolled off the wires, right into my hands."  — the tiny blob rolls off, drops; Rico dives and catches it
  (S, cam) => {
    const env = strip(S, 'dark');
    const w = waitBlob(S, { name: 'wait', size: 0.42, glow: 0.4 }); const r = mk(S, RICO, 'rico', 'shock', [2.6, 0, 1.2], 160); const tr = fill(S, [3, 7, 6], 10, 0xe0e4ff, 14);
    S.userData.allowContact = [['rico', 'wait']];
    return (t, dur) => {
      const tf = dur * 0.2, tc = dur * 0.56;
      let p;
      if (t < tf) p = [ramp(t, 0, tf) * 2.5, WY - 0.6, WZ];
      else if (t < tc) { const u = ramp(t, tf, tc); p = [2.5 + u * 0.4, WY - 0.6 - (WY - 3.9) * u * u, WZ + (1.6 - WZ) * u]; }
      else p = null;
      w.root.rotation.z = -t * 3;
      if (p) w.root.position.set(...p); else { const a = pinky(r, 'R'), b = pinky(r, 'L'); w.root.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 - 0.2, (a.z + b.z) / 2); w.root.rotation.z = 0; w.root.rotation.y = r.root.rotation.y; }
      w.animate(t, 'scared'); env.wires.sag(0, 0);
      const target = p ? V(p) : w.root.position;
      const [cs, cp] = seg(t, dur, [0.6]);
      if (cs === 0) camPath(cam, cp, [6, 3.0, 14], [5, 3.4, 12], [2, 10, -6], [2.8, 6, -2], 24, 26);
      else faceCam(cam, cp, [2.6, 4.64, 1.2], 160, { dist: 7.4, lens: 30, side: 0.9, up: 0.1, look: -0.9 });
      r.pose(addPose(addPose(lookAt(r, target), anticipate(t, tc - 0.1)), hit([[tc - 0.4, { rFwd: 40, lFwd: 40 }], [tc, { rFwd: 45, lFwd: 45, rUp: -20, lUp: -20, lean: 6 }], [dur, { rFwd: 38, lFwd: 38, rUp: -22, lUp: -22, nod: 4 }]], t)));
      r.setFace(t < tc ? 'shock' : 'delighted'); env.update(t);
    };
  },
  // 37 "The neon blazed back on, right at midnight! [pause]"  — power surges back sign by sign; the billboard: IT'S OUT!; everyone jumps (low angle)
  (S, cam) => {
    const env = strip(S, 'night');
    const P = [mk(S, DANI, 'dani', 'laugh', [-7.6, 0, 1.2], 190), mk(S, RICO, 'rico', 'starstruck', [-2.6, 0, 1.8], 180), mk(S, SAL_SHOES, 'sal', 'delighted', [2.6, 0, 1.6], 175), mk(S, LULU, 'lulu', 'laugh', [7.6, 0, 1.2], 165)];
    const w = waitBlob(S, { name: 'wait', size: 0.42, glow: 0.6, light: false });
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 1.4, 15], [0, 1.8, 13.5], [0, 6, -4], [3, 11, -10], 22, 22);
      const k = ramp(t, 0.2, dur * 0.4); env.neon(k > 0 && k < 1 ? k * (Math.sin(t * 50) > -0.3 ? 1 : 0.4) : k); env.board.set(t < dur * 0.3 ? '00:00:01' : 'IT\'S OUT!', t < dur * 0.3 ? 'TO MIDNIGHT' : 'HAPPY LAUNCH DAY', '#ff3ab8');
      env.key.intensity = 14 * (0.4 + 0.6 * k);
      P.forEach((a, i) => { const j = t > dur * 0.35 ? Math.abs(Math.sin((t - dur * 0.35) * 6 + i * 0.7)) : 0; a.root.position.y = j * 1.1;
        a.pose(addPose(lookAt(a, [10, 16, -14.6]), t > dur * 0.33 ? { rUp: 155, lUp: 155, rLeg: j * 30, lLeg: -j * 10 } : POSES.rest)); });
      const rp = P[1]; const a = pinky(rp, 'R'), b = pinky(rp, 'L'); w.root.position.set((a.x + b.x) / 2, Math.max(a.y, b.y) + 0.3, (a.z + b.z) / 2); w.animate(t, 'bounce');
      S.userData.allowContact = [['rico', 'wait']];
      env.update(t);
    };
  },
  // 38 "We played until sunrise, all three of us."  — couch at dawn: Rico, Lulu, Grandpa with controllers, TV glow dancing on their faces
  (S, cam) => {
    const env = gameRoom(S, { dawn: true });
    const P = [mk(S, LULU, 'lulu', 'determined', [-4.6, 0, -7.0], 0), mk(S, RICO, 'rico', 'delighted', [0, 0, -7.0], 0), mk(S, SAL_SHOES, 'sal', 'laugh', [4.6, 0, -7.0], 0)];
    P.forEach(a => sitOn(a, 2.0)); const C = P.map((_, i) => controller(S, [0xff3ab8, 0x2ae8ff, 0xffd23a][i]));
    S.userData.allowContact = P.map(a => [a.name, 'couch*']).concat(P.map(a => [a.name, 'box*']));
    return (t, dur) => {
      env.tv.screen('glow', 0.5, t);
      camPath(cam, sm(t, 0, dur), [0, 6.4, 11.4], [0, 5.8, 10.6], [0, 4.3, -7], [0, 4.6, -7], 22, 22);
      P.forEach((a, i) => { a.pose(addPose(addPose({ rLeg: 90, lLeg: 90, rFwd: 62, lFwd: 62, rUp: -22, lUp: -22, nod: 6 }, idle(t, 0.5, i)), { lean: Math.sin(t * 2.5 + i * 2) * 6, bodyTilt: Math.sin(t * 1.7 + i) * 5 }));
        const p1 = pinky(a, 'R'), p2 = pinky(a, 'L'); C[i].position.set((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 + 0.2, (p1.z + p2.z) / 2 + 0.1); C[i].rotation.x = 0.5; });
      if (t > dur * 0.6) P[0].setFace('laugh');
      env.update(t);
    };
  },
  // 39 "Grandpa's shirt finally got its Day One."  — close on Grandpa, controller in hand, proudly smoothing his faded flamingo shirt
  (S, cam) => {
    const env = gameRoom(S, { dawn: true });
    const s = mk(S, SAL_SHOES, 'sal', 'proud', [4.6, 0, -7.0], 0); sitOn(s, 2.0); const c = controller(S, 0xffd23a);
    S.userData.allowContact = [['sal', 'couch*'], ['sal', 'box*']];
    return (t, dur) => {
      env.tv.screen('glow', 0.5, t);
      faceCam(cam, t / dur, [4.6, 5.14, -7.0], 0, { dist: 6.6, lens: 34, side: -0.6, push: 0.9, up: 0.1 });
      s.pose(addPose(addPose(hit([[0, { rLeg: 90, lLeg: 90, rFwd: 62, rUp: -22, lFwd: 40, lUp: -10 }], [0.6, { rLeg: 90, lLeg: 90, rFwd: 62, rUp: -22, lFwd: 25, lUp: -20, nod: 10 }], [1.4, { rLeg: 90, lLeg: 90, rFwd: 62, rUp: -22, lFwd: 30, lUp: -15, nod: -4, lean: -4 }]], t), idle(t, 0.4)), {}));
      const p1 = pinky(s, 'R'); c.position.set(p1.x, p1.y + 0.1, p1.z + 0.2); c.rotation.x = 0.5;
      if (t > dur * 0.4) s.setFace('softsmile');
      env.update(t);
    };
  },
  // 40 "And the Wait?"  — whip around: the camera turns from the couch toward the TV wall
  (S, cam) => {
    const env = gameRoom(S, { dawn: true });
    const P = [mk(S, LULU, 'lulu', 'smile', [-4.6, 0, -7.0], 0), mk(S, RICO, 'rico', 'confused', [0, 0, -7.0], 0), mk(S, SAL_SHOES, 'sal', 'smile', [4.6, 0, -7.0], 0)];
    P.forEach(a => sitOn(a, 2.0)); S.userData.allowContact = P.map(a => [a.name, 'couch*']).concat(P.map(a => [a.name, 'box*']));
    const w = waitBlob(S, { name: 'wait', size: 0.22, glow: 0.5, light: false }); w.root.position.set(-2.2, 2.1, 10.6); w.root.rotation.y = Math.PI;
    return (t, dur) => {
      env.tv.screen('glow', 0.5, t);
      const k = sm(t, 0.1, dur * 0.8);
      camPath(cam, k, [2, 5.6, 2], [0, 4.5, 2], [0, 4.8, -7], [-2.2, 2.4, 10.6], 26, 30);
      P.forEach((a, i) => a.pose(addPose(addPose({ rLeg: 90, lLeg: 90 }, idle(t, 0.4, i)), lookAt(a, [-2.2, 2.4, 10.6]))));
      w.animate(t, 'idle'); w.blink(1); env.update(t);
    };
  },
  // 41 "It curled up on top of the console. [pause]"  — the tiny blob asleep on the console, glowing softly in the TV light
  (S, cam) => {
    const env = gameRoom(S, { dawn: true });
    const w = waitBlob(S, { name: 'wait', size: 0.22, glow: 0.5, light: false }); w.root.position.set(-2.2, 2.1, 10.6); w.root.rotation.y = Math.PI;
    const l = new THREE.PointLight(0xffc0e0, 3, 4, 1.6); l.position.set(-2.2, 3, 9); S.add(l);
    return (t, dur) => {
      env.tv.screen('glow', 0.5, t);
      camPath(cam, t / dur, [-1.0, 3.6, 6.4], [-1.6, 3.0, 7.6], [-2.2, 2.4, 10.6], [-2.2, 2.4, 10.6], 34, 40);
      w.animate(t * 0.4, 'idle'); w.blink(1); w.squash(1.15 + Math.sin(t * 2) * 0.04);
      env.update(t);
    };
  },
  // 42 "It's already waiting for GTA Seven. [pause]"  — the TV teases a "7 ?" — one eye pops open, and the blob puffs up just a little (boing)
  (S, cam) => {
    const env = gameRoom(S, { dawn: true });
    const w = waitBlob(S, { name: 'wait', size: 0.22, glow: 0.5, light: false }); w.root.position.set(-2.2, 2.1, 10.6); w.root.rotation.y = Math.PI;
    const l = new THREE.PointLight(0xffc0e0, 3, 4, 1.6); l.position.set(-2.2, 3, 9); S.add(l);
    return (t, dur) => {
      env.tv.screen(t > dur * 0.2 ? 'seven' : 'glow', 0.5, t);
      const [c, p] = seg(t, dur, [0.3]);
      if (c === 0) camPath(cam, p, [1.5, 4.2, 5.0], [1.2, 4.6, 5.6], [0, 5.2, 11.8], [0, 5.2, 11.8], 28, 30);
      else camPath(cam, p, [-1.3, 3.0, 7.6], [-1.6, 2.9, 8.0], [-2.2, 2.45, 10.6], [-2.2, 2.45, 10.6], 38, 42);
      const wake = t > dur * 0.4; w.animate(t, wake ? 'bounce' : 'idle'); w.blink(wake ? 0 : 1); w.look(V([0, 5.2, 11.8]));
      w.grow(0.22 + (t > dur * 0.6 ? 0.07 * hn([[0, 0], [0.35, 1]], t - dur * 0.6) : 0)); w.squash(wake ? 1 : 1.15);
      env.update(t);
    };
  },
  // 43 "The best part of the wait?"  — Rico on the couch at sunrise, Lulu dozing on one shoulder; a soft smile
  (S, cam) => {
    const env = gameRoom(S, { dawn: true });
    const r = mk(S, RICO, 'rico', 'softsmile', [0, 0, -7.0], 0), l = mk(S, LULU, 'lulu', 'sleeping', [-4.4, 0, -7.0], 0); [r, l].forEach(a => sitOn(a, 2.0));
    S.userData.allowContact = [['rico', 'couch*'], ['lulu', 'couch*'], ['rico', 'box*'], ['lulu', 'box*']];
    return (t, dur) => {
      env.tv.screen('glow', 0.3, t);
      faceCam(cam, sm(t, 0, dur), [-0.8, 5.0, -7.0], 0, { dist: 7.6, lens: 32, side: -1.2, push: 1.2, up: 0.2 });
      r.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, rUp: -15, lUp: -15 }, addPose(idle(t, 0.3), { turn: -18 * sm(t, 0.3, 1.2), nod: 6 })));
      l.pose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30, rUp: -15, lUp: -15, bodyTilt: -12, tilt: -18, nod: 10, bob: Math.sin(t * 1.8) * 0.02 });
      env.update(t);
    };
  },
  // 44 "Who I waited with. [pause]"  — slow pull back: all three on the couch, Lulu and Grandpa asleep on Rico, the sunrise window glowing
  (S, cam) => {
    const env = gameRoom(S, { dawn: true });
    const P = [mk(S, LULU, 'lulu', 'sleeping', [-4.4, 0, -7.0], 0), mk(S, RICO, 'rico', 'softsmile', [0, 0, -7.0], 0), mk(S, SAL_SHOES, 'sal', 'sleeping', [4.4, 0, -7.0], 0)];
    P.forEach(a => sitOn(a, 2.0)); S.userData.allowContact = P.map(a => [a.name, 'couch*']).concat(P.map(a => [a.name, 'box*']));
    const w = waitBlob(S, { name: 'wait', size: 0.22, glow: 0.5, light: false }); w.root.position.set(-2.2, 2.1, 10.6); w.root.rotation.y = Math.PI;
    return (t, dur) => {
      env.tv.screen('glow', 0.3, t);
      camPath(cam, sm(t, 0, dur), [0, 5.2, 4], [0, 5.6, 10.6], [0, 4.4, -7], [0, 4.2, -7], 28, 24);
      P[0].pose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30, rUp: -15, lUp: -15, bodyTilt: -12, tilt: -18, nod: 10, bob: Math.sin(t * 1.8) * 0.02 });
      P[2].pose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30, rUp: -15, lUp: -15, bodyTilt: 12, tilt: 18, nod: 12, bob: Math.sin(t * 1.6 + 1) * 0.02 });
      P[1].pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, rUp: -15, lUp: -15 }, addPose(idle(t, 0.3), { nod: 4 })));
      w.animate(t * 0.4, 'idle'); w.blink(1); env.update(t);
    };
  },
];
