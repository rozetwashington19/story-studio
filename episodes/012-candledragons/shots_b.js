import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, seg, hit, talk, lookAt, anticipate, pinky, backOut,
  castleKitchen, greatHall, battlements, flame, spark, embers, shield, flourSack, loaf } from '../../engine/kit.js';
import { mk, wren, gran, hob, bram, guard, dragon, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, BLOW, orbit, steer } from './common.js';

const PERCH = [-6, 10, -16.5], PRY = 0.35, GS = 3.6;
// the giant dragon on its perch (or anywhere): light 40 so it lights the dark courtyard orange
const giant = (S, light = 45) => { const d = dragon(S, 0, GS, light); d.root.position.set(...PERCH); d.root.rotation.y = PRY; return d; };
const shake = (cam, t, t0, k = 1) => { const u = t - t0; if (u < 0 || u > 0.6) return; const a = Math.exp(-u * 7) * 0.25 * k; cam.position.x += Math.sin(u * 60) * a; cam.position.y += Math.sin(u * 47 + 1) * a; };
// y of the stair top under x (stairs climb toward -x along the wall face, z -14..-11.4)
const stairY = (x) => Math.max(0, Math.min(10, Math.ceil((11.25 - x) / 0.5) * 0.5));
const WALK_TOP = [2.6, 10, -15.3];   // Wren's spot on the wall-walk

export const SHOTS_B = [
  // 22 "The whole castle went dark."  — wide courtyard: a stream of dragons sweeps along the wall and every torch goes out behind them
  (S, cam) => {
    const env = battlements(S);
    const ds = Array.from({ length: 6 }, (_, i) => dragon(S, i, 0.5, i % 2 ? 0 : 8)); const prev = ds.map(() => new THREE.Vector3());
    const G = guard(S, 1, 'scared', [3.5, 0, 1.5], 200);
    const order = [6, 4, 3, 2, 1, 0, 5, 7];
    return (t, dur) => { env.update(t);
      order.forEach((ti, j) => { const te = 0.2 + j * (dur - 0.6) / order.length; env.torches[ti].set(1 - sm(t, te, te + 0.12)); });
      ds.forEach((d, i) => { const u = (t / dur) * 1.1 - i * 0.04; const x = 16 - u * 34; const p = new THREE.Vector3(x, 6 + Math.sin(u * 9 + i) * 1.2 + i * 0.4, -12 + Math.sin(u * 5 + i * 2) * 1.5); steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); });
      G.pose(addPose(idle(t, 1), { ...lookAt(G, ds[0].root.position), rFwd: 40, lFwd: 40 }));
      camPath(cam, t / dur, [1.0, 3.4, 14.0], [-0.5, 4.2, 13.0], [0, 6.5, -12], [-2, 7.5, -14], 18, 19);
    };
  },
  // 23 "Then all eleven flew up together."  — Wren and Grandma in the dark courtyard watch eleven glowing dragons spiral up into the night
  (S, cam) => {
    const env = battlements(S, { lit: 0 });
    const ds = Array.from({ length: 11 }, (_, i) => dragon(S, i, 0.5, i % 3 ? 0 : 7)); const prev = ds.map(() => new THREE.Vector3());
    const W = wren(S, 'scared', [1.2, 0, 2.5], 160); const G = gran(S, 'worried', [-3.4, 0, 3.2], 170); fill(S, [-1, 5, 9], 5, 0xa0b4ff, 14);
    return (t, dur) => { env.update(t);
      ds.forEach((d, i) => { const u = sm(t, 0, dur) ; const a = i / 11 * Math.PI * 2 + t * 1.6; const r = 9 - u * 5; const p = new THREE.Vector3(Math.cos(a) * r, 4 + u * 16 + (i % 3), -8 + Math.sin(a) * r * 0.6); steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); });
      const up = new THREE.Vector3(0, 6 + sm(t, 0, dur) * 14, -8);
      W.pose(addPose(idle(t, 0.8), lookAt(W, up))); G.pose(addPose(idle(t, 0.6, 2), addPose(lookAt(G, up), { rFwd: 30 })));
      camPath(cam, t / dur, [3.4, 2.4, 11.4], [3.0, 2.0, 11.0], [-0.6, 5.0, -2], [-0.4, 10.5, -6], 20, 20);
    };
  },
  // 24 "And they became one giant dragon."  — the swirl collapses into a flash; a giant dragon unfolds out of the light, wings wide
  (S, cam) => {
    const env = battlements(S, { lit: 0 });
    const C = new THREE.Vector3(-1, 20, -9);
    const ds = Array.from({ length: 11 }, (_, i) => dragon(S, i, 0.5, 0)); const prev = ds.map(() => new THREE.Vector3());
    const big = dragon(S, 0, GS, 50); big.root.position.copy(C).add(new THREE.Vector3(0, -8, 0)); big.root.visible = false;
    const fl = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true })); S.add(fl); const flL = new THREE.PointLight(0xffc070, 0, 80, 1.3); S.add(flL);
    return (t, dur) => { env.update(t);
      const m = dur * 0.4; const c = sm(t, 0, m);
      ds.forEach((d, i) => { const a = i / 11 * Math.PI * 2 + t * 3.5; const r = 4 * (1 - c) + 0.3; const p = new THREE.Vector3(C.x + Math.cos(a) * r, C.y + Math.sin(a * 2) * r * 0.3, C.z + Math.sin(a) * r * 0.6);
        steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); d.root.visible = t < m; });
      const f = Math.max(0, 1 - Math.abs(t - m) / 0.35); fl.position.copy(C); fl.scale.setScalar(0.5 + f * 6); fl.material.opacity = f; flL.intensity = f * 400;
      const g = backOut(ramp(t, m, m + 0.6)); big.root.visible = t > m; big.g.scale.setScalar(Math.max(0.0001, GS * (0.15 + 0.85 * g)));
      big.update(t, t < dur * 0.75 ? 'hover' : 'roar', 1); big.root.rotation.y = 0;
      camPath(cam, t / dur, [2.0, 2.0, 16.0], [2.6, 1.8, 17.0], [-1, 13, -9], [-1, 14, -9], 18, 18); shake(cam, t, m, 0.8);
    };
  },
  // 25 "It landed right on the castle wall."  — low angle: the giant drops onto the battlements — BOOM — dust, it folds its wings and peers down
  (S, cam) => {
    const env = battlements(S, { lit: 0 });
    const d = giant(S); const dust = Array.from({ length: 14 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8a8070, transparent: true, opacity: 0.5 })); S.add(m); return m; });
    return (t, dur) => { env.update(t);
      const land = dur * 0.45; const u = sm(t, 0, land);
      d.root.position.set(PERCH[0] + 6 * (1 - u), PERCH[1] + 14 * (1 - u) * (1 - u), PERCH[2] + 3 * (1 - u)); d.update(t, t < land ? 'hover' : 'perch'); d.look(new THREE.Vector3(4, 2, 6));
      if (t > land) { const k = Math.exp(-(t - land) * 6) * Math.sin((t - land) * 22) * 0.4; d.g.scale.set(GS * (1 + k * 0.08), GS * (1 - k * 0.12), GS); }
      dust.forEach((m, i) => { const v = (t - land) / 1.3; m.visible = v > 0 && v < 1; const a = i / 14 * Math.PI * 2; m.position.set(PERCH[0] + Math.cos(a) * (3 + v * 6), 10 + v * 2 + (i % 3) * 0.5, PERCH[2] + 2 + Math.sin(a) * 1.5 * (1 + v)); m.scale.setScalar(1 + v * 2); m.material.opacity = 0.5 * (1 - v); });
      camPath(cam, t / dur, [6.0, 1.6, 12.0], [5.4, 1.4, 11.0], [-4, 13, -14], [-5, 14, -14], 18, 19); shake(cam, t, land, 1.2);
    };
  },
  // 26 "The knights ran. Baker Hob hid in a flour sack."  — a: two knights flee across the courtyard · b: Hob peeks out of a flour sack, shaking
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S);
    const A = guard(S, 0, 'scared', [-9, 0, 2], 90); const B = guard(S, 1, 'shock', [-13, 0, 4.2], 90); const rf = fill(S, [-2, 5, 8], 8, 0xffc890, 14);
    const sack = flourSack(S, [10, 0, 2.5], { s: 1.25, open: true }); const H = hob(S, 'scared', [10, -1.8, 2.5], -15); allow(S, ['hob', 'ground']); fill(S, [12, 5, 8], 6, 0xffb070, 12);
    return (t, dur) => { env.update(t); d.update(t, 'perch'); const [i, p] = seg(t, dur, [0.5]);
      A.root.position.x = -9 + t * 5.5; B.root.position.x = -13 + t * 6; A.pose(addPose(RUN(t), { rUp: 120, lUp: 120 })); B.pose(addPose(RUN(t + 0.2), { turn: -40 }));
      d.look(i ? headOf(H) : A.root.position);
      const sh = Math.sin(t * 40) * 0.04; sack.position.x = 10 + sh; H.root.position.x = 10 + sh;
      const peek = sm(p, 0.25, 0.5) * (1 - sm(p, 0.8, 0.95)); H.root.position.y = -1.8 - 0.9 + peek * 0.9 + 0.9 * (i ? 0 : 1) * 0; H.pose(addPose({ nod: -10, turn: -20 + Math.sin(t * 3) * 25 }, { tilt: Math.sin(t * 30) * 3 }));
      if (i === 0) camPath(cam, p, [0, 3.6, 14.4], [1.5, 3.8, 14.4], [-4, 4.6, 2.5], [1.5, 4.6, 3], 20, 20);
      else camPath(cam, p, [12.0, 4.4, 11.4], [11.7, 4.3, 10.8], [10, 3.0, 2.5], [10, 3.1, 2.5], 26, 28);
    };
  },
  // 27 "Sir Bram hid behind his own shield."  — Bram crouches by the well behind his shield; he peeks over — so does the tiny dragon on his helmet — and both duck
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S);
    const B = bram(S, 'scared', [-3.5, 0, 1.0], 20); const sh = shield(S, 0x2a4ab8); const td = dragon(S, 3, 0.15, 3); fill(S, [0, 5, 8], 6, 0xffb070, 12);
    return (t, dur) => { env.update(t); d.update(t, 'perch'); d.look(headOf(B));
      const peek = sm(t, dur * 0.25, dur * 0.4) * (1 - sm(t, dur * 0.7, dur * 0.8));
      B.pose(addPose(idle(t, 0.5), { bob: -0.9 + peek * 0.6, lean: 18 - peek * 10, rLeg: 40, lLeg: 40, rFwd: 80, lFwd: 70, rUp: -18, lUp: -10, nod: 10 - peek * 20, tilt: Math.sin(t * 25) * 2 }));
      if (peek > 0.5) B.setFace('shock'); else B.setFace('scared');
      const ph = pinky(B, 'R'); sh.position.set(ph.x - 0.6, ph.y + 0.6, ph.z + 0.5); sh.rotation.set(0, 20 * D, 0);
      B.root.updateMatrixWorld(true); const top = B.headMesh.localToWorld(new THREE.Vector3(0, 1.0 + peek * 0.3, -0.05)); td.root.position.copy(top); td.root.rotation.y = 0.35;
      td.update(t, peek > 0.3 ? 'hover' : 'curl'); td.blink(peek > 0.3 ? 0 : 1); td.look(d.head.getWorldPosition(new THREE.Vector3()));
      camPath(cam, t / dur, [-1.2, 3.8, 10.6], [-1.5, 3.9, 9.8], [-3.6, 3.6, 1.2], [-3.6, 3.8, 1.2], 24, 26);
    };
  },
  // 28 "Wren! Did you make your wish?"  — Grandma calls up across the courtyard, hand at her mouth, the dragon's glow on her face
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S); const G = gran(S, 'worried', [0, 0, 1], 30); fill(S, [-2, 5.5, 6], 4, 0xffb070, 10);
    return (t, dur) => { env.update(t); d.update(t, 'perch'); d.look(headOf(G));
      G.pose(addPose(addPose(idle(t, 0.6), talk(t, 1.2)), hit([[0, { lFwd: 30 }], [0.35, { lFwd: 125, lUp: 10, rUp: 30, nod: -12 }], [dur, { lFwd: 120, lUp: 10, rUp: 35, nod: -14 }]], t)));
      faceCam(cam, t / dur, headOf(G).toArray(), 30, { dist: 8.0, lens: 30, side: -0.6, push: 0.9, up: -0.4, look: 0.0 });
    };
  },
  // 29 "My wish. I forgot to make a wish."  — close on Wren: the realisation — eyes wide, hand to mouth
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S); const W = wren(S, 'thinking', [4.5, 0, 3], -30); fill(S, [2.8, 5.2, 7.5], 5, 0xffb070, 9);
    return (t, dur) => { env.update(t); d.update(t, 'perch');
      W.pose(addPose(idle(t, 0.5), hit([[0, { nod: 6 }], [dur * 0.4, { rFwd: 125, rUp: -10, nod: -4 }], [dur, { rFwd: 128, rUp: -10, nod: 4, tilt: 5 }]], t)));
      W.setFace(t < dur * 0.4 ? 'thinking' : 'shock'); if (t > dur * 0.75) W.setFace('worried');
      faceCam(cam, t / dur, headOf(W).toArray(), -30, { dist: 6.6, lens: 32, side: 0.4, push: 0.9, up: -0.2, look: -0.5 });
    };
  },
  // 30 "I was so excited, I just blew."  — flashback (warm, faded): Wren grins and blasts out all the candles, eyes wide open
  (S, cam) => {
    const env = greatHall(S, { cake: true }); S.userData.look = 'flash'; const W = wren(S, 'grin', [2.5, 0, -7.6], 0); const ck = env.cake; fill(S, [2.5, 5, -1], 6, 0xffc890, 8);
    return (t, dur) => { env.update(t);
      const tb = 0.35, b = sm(t, tb, tb + 0.15); W.pose(addPose(idle(t, 0.6), t < tb ? { bob: 0.12 } : BLOW(1.3 * b))); W.setFace(t < tb ? 'grin' : 'pout');
      ck.candles.forEach((c, j) => { const tj = tb + j * 0.03; c.set(1 - sm(t, tj, tj + 0.06)); });
      camPath(cam, t / dur, [2.9, 5.4, 0.2], [2.8, 5.2, -0.6], [2.5, 3.4, -6.0], [2.5, 3.5, -6.2], 28, 30);
    };
  },
  // 31 "So I climbed up onto the wall."  — dolly beside Wren as she runs up the stone stair along the wall, the dragon's glow above
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S); const W = wren(S, 'determined', [11.6, 0, -12.2], -90); allow(S, ['wren', 'step*']); const fl = fill(S, [6, 8, -6], 10, 0xffc890, 12);
    return (t, dur) => { env.update(t); d.update(t, 'perch'); d.look(headOf(W));
      const x = 11.6 - sm(t, 0, dur * 0.95) * 9.4; W.root.position.set(x, stairY(x + 0.2), -12.2); fl.position.set(x + 2.5, stairY(x) + 5, -8);
      W.pose(addPose(walk(t * 1.5, 1, 40), { lean: 10, rLeg: 15, lLeg: 15, nod: -6 }));
      camPath(cam, t / dur, [x + 4, stairY(x) + 4.0, -2.0], [x + 2, stairY(x) + 4.4, -2.6], [x - 1, stairY(x) + 4.6, -13.2], [x - 2, stairY(x) + 5.6, -13.6], 22, 22);
    };
  },
  // 32 "The giant dragon looked down at me."  — Wren on the wall-walk, tiny next to the giant; it lowers its huge glowing head to look at her (HOOK source)
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S); const W = wren(S, 'scared', WALK_TOP, -80); allow(S, ['wren', 'curtain wall']); fill(S, [6, 14, -8], 4, 0xffc890, 12);
    return (t, dur) => { env.update(t);
      const hd = headOf(W); const lo = sm(t, 0.2, dur * 0.7); d.update(t, 'perch'); d.look(new THREE.Vector3(hd.x, hd.y - 4 * lo, hd.z)); d.blink(t > dur * 0.8 && t < dur * 0.86 ? 1 : 0);
      d.head.position.y = 2.65 - 0.9 * lo; d.head.position.z = 1.3 + 0.6 * lo;
      W.pose(addPose(idle(t, 0.8), addPose(lookAt(W, d.head.getWorldPosition(new THREE.Vector3())), { rFwd: 30, lFwd: 30, lean: -6 })));
      camPath(cam, t / dur, [9.5, 8.0, 7.0], [8.5, 8.6, 5.6], [-0.6, 14.0, -13.0], [-1.0, 14.6, -13.4], 20, 21);
    };
  },
  // 33 "I closed my eyes. Just like Grandma."  — close-up: Wren in the dragon's orange light; she breathes in and closes her eyes
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S); const W = wren(S, 'worried', WALK_TOP, -60); allow(S, ['wren', 'curtain wall']);
    const glow = fill(S, [-1, 13, -13], 10, 0xff9a40, 9);
    return (t, dur) => { env.update(t); d.update(t, 'perch');
      W.pose(addPose(idle(t, 0.4), { bob: 0.08 * sm(t, 0, dur * 0.4), nod: -6 + 10 * sm(t, dur * 0.4, dur * 0.7) }));
      if (t > dur * 0.45) W.setFace('sleeping'); glow.intensity = 10 + Math.sin(t * 3) * 1.5;
      faceCam(cam, t / dur, headOf(W).toArray(), -60, { dist: 6.0, lens: 38, side: 0.3, push: 1.0, up: 0.1 });
    };
  },
  // 34 "And I made my wish."  — from the courtyard: Grandma (foreground) and Wren on the wall both close their eyes; the giant's glow softens and pulses
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S); const W = wren(S, 'sleeping', WALK_TOP, -60); const G = gran(S, 'sleeping', [3.4, 0, 4.0], 200); allow(S, ['wren', 'curtain wall']);
    return (t, dur) => { env.update(t);
      d.update(t, 'perch'); d.look(headOf(W)); d.blink(0.55); d.glow(1 + 0.6 * sm(t, 0, dur) + Math.sin(t * 5) * 0.15);
      W.pose(addPose(idle(t, 0.4), { rFwd: 70, lFwd: 70, rUp: -30, lUp: -30, nod: 6 })); G.pose(addPose(idle(t, 0.4, 2), { rFwd: 60, lFwd: 60, rUp: -28, lUp: -28, nod: -16 }));
      camPath(cam, t / dur, [6.8, 3.4, 11.0], [6.2, 3.8, 10.2], [0.5, 10.0, -12.0], [0.0, 11.5, -13.0], 22, 24);
    };
  },
  // 35 "The dragon burst into eleven sparks."  — the giant flares white-gold, shrinks into its own light, and eleven sparks burst out across the sky
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const d = giant(S); const W = wren(S, 'awe', WALK_TOP, -60); allow(S, ['wren', 'curtain wall']);
    const sp = Array.from({ length: 11 }, () => spark(S, { s: 0.45 })); const C = new THREE.Vector3(-4.5, 17, -14); const fl = new THREE.PointLight(0xffd080, 0, 90, 1.3); fl.position.copy(C); S.add(fl);
    return (t, dur) => { env.update(t);
      const b = dur * 0.35; const sh = sm(t, b - 0.2, b + 0.15);
      d.glow(1 + 2.5 * sm(t, 0, b)); d.update(t, 'roar', 1 - sh); d.g.scale.setScalar(Math.max(0.0001, GS * (1 - sh))); d.root.visible = sh < 0.99;
      fl.intensity = 500 * Math.max(0, 1 - Math.abs(t - b) / 0.4);
      sp.forEach((s, i) => { const u = sm(t, b, dur); const a = i / 11 * Math.PI * 2; const dir = new THREE.Vector3(Math.cos(a), 0.3 + Math.sin(a) * 0.8, 0.3); s.set(C.clone().addScaledVector(dir, u * 16), t > b ? 1 : 0); });
      W.pose(addPose(idle(t, 0.6), t > b ? hit([[b, { rUp: 0 }], [b + 0.4, { rFwd: 40, lFwd: 40, lean: -12, nod: -16 }]], t) : {})); if (t > b) W.setFace('shock');
      camPath(cam, t / dur, [7.0, 4.0, 12.0], [7.6, 3.4, 13.0], [-2.0, 13.0, -12.0], [-2.0, 14.0, -12.0], 18, 18); shake(cam, t, b, 0.6);
    };
  },
  // 36 "They zipped across the dark castle."  — the sparks streak through the courtyard in glowing arcs, trailing embers; guards duck as they pass
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const sp = Array.from({ length: 11 }, () => spark(S, { s: 0.4 })); const tr = sp.map(() => embers(S, 12));
    const A = guard(S, 0, 'shock', [-4, 0, 3], 0); const L = Array.from({ length: 3 }, () => { const l = new THREE.PointLight(0xffc070, 12, 12, 1.6); S.add(l); return l; });
    return (t, dur) => { env.update(t);
      sp.forEach((s, i) => { const u = (t / dur) * 1.2 + i * 0.03; const a = u * 3 + i * 0.57; const p = new THREE.Vector3(Math.sin(a) * (9 + i % 3), 4 + Math.sin(u * 7 + i) * 2.5 + (i % 4), -6 + Math.cos(a * 1.3) * 7); s.set(p, 1); tr[i].update(t, p, 1); if (i < 3) L[i].position.copy(p); });
      A.pose(addPose(idle(t, 1), { ...lookAt(A, sp[0].group.position), bob: -0.3, lean: 10, rUp: 60, lUp: 60 }));
      camPath(cam, t / dur, [-2.0, 3.0, 13.0], [2.0, 3.4, 12.5], [-2, 5.5, -4], [2, 5.5, -6], 18, 18);
    };
  },
  // 37 "And landed in every empty torch."  — along the wall: spark after spark dives into a torch — pop — each one bursts back into flame
  (S, cam) => {
    const env = battlements(S, { lit: 0 }); const order = [3, 2, 1, 0]; const sp = order.map(() => spark(S, { s: 0.4 })); const tr = sp.map(() => embers(S, 10));
    return (t, dur) => { env.update(t);
      order.forEach((ti, j) => { const T0 = env.torches[ti]; const tip = T0.tip; const t0 = 0.1 + j * (dur - 0.5) / order.length, t1 = t0 + 0.45; const u = sm(t, t0, t1);
        const from = new THREE.Vector3(tip.x + 6, tip.y + 6, tip.z + 6); const p = from.clone().lerp(tip, u); p.y += Math.sin(u * Math.PI) * 1.5;
        sp[j].set(p, t > t0 && u < 1 ? 1 : 0); tr[j].update(t, p, t > t0 && u < 1 ? 1 : 0);
        const pop = backOut(ramp(t, t1, t1 + 0.3)); T0.set(t > t1 ? pop : 0); });
      env.torches.slice(4).forEach(x => x.set(sm(t, dur * 0.7, dur)));
      camPath(cam, t / dur, [3.0, 5.4, -4.0], [1.0, 5.6, -4.6], [-3.0, 5.0, -14], [-6.5, 5.0, -14], 24, 24);
    };
  },
  // 38 "The whole castle glowed again."  — crane back: every torch lit, the keep's windows warm, Wren on the wall throws her arms up, guards cheer below
  (S, cam) => {
    const env = battlements(S, { lit: 1 }); const W = wren(S, 'delighted', WALK_TOP, -10); allow(S, ['wren', 'curtain wall']);
    const A = guard(S, 0, 'laugh', [-4.5, 0, -2], 160); const B = guard(S, 1, 'delighted', [4.5, 0, -1.5], 200); const G = gran(S, 'proud', [0, 0, 0.5], 180);
    const tiny = Array.from({ length: 4 }, (_, i) => dragon(S, i, 0.3, 0)); const prev = tiny.map(() => new THREE.Vector3());
    return (t, dur) => { env.update(t);
      W.pose(addPose(idle(t, 0.8), hit([[0, { rUp: 40, lUp: 40 }], [0.4, { rUp: 160, lUp: 160, bob: 0.2 }], [dur, { rUp: 150, lUp: 150 }]], t)));
      [A, B].forEach((K, i) => K.pose(addPose(idle(t, 1, i), { rUp: 140 + Math.sin(t * 8 + i) * 15, lUp: 140 - Math.sin(t * 8 + i) * 15, bob: Math.abs(Math.sin(t * 6 + i)) * 0.25 })));
      G.pose(addPose(idle(t, 0.6), addPose(lookAt(G, headOf(W)), { rFwd: 50, lFwd: 50, rUp: -20, lUp: -20 })));
      tiny.forEach((d, i) => { const p = orbit(t, [-2 + i * 2, 9 + i, -10], 3, 1, 1.2, i * 1.5); steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); });
      camPath(cam, t / dur, [3.0, 4.0, 10.0], [4.0, 9.0, 22.0], [1.5, 7.5, -10], [1.0, 11.0, -14], 22, 22);
    };
  },
  // 39 "What did you wish for?" Grandma asked.  — courtyard by a lit torch post: Grandma bends toward Wren, smiling
  (S, cam) => {
    const env = battlements(S, { lit: 1 }); const G = gran(S, 'softsmile', [-2.2, 0, -2.6], 40); const W = wren(S, 'softsmile', [2.2, 0, -2.0], -40); fill(S, [0, 5.5, 5], 6, 0xffc890, 12);
    return (t, dur) => { env.update(t);
      const half = (o) => ({ turn: o.turn * 0.45, nod: o.nod * 0.5 });
      G.pose(addPose(addPose(idle(t, 0.5), talk(t, 0.8)), addPose(half(lookAt(G, headOf(W))), { lean: 8, rFwd: 30, lFwd: 20, tilt: 6 }))); W.pose(addPose(idle(t, 0.6, 3), half(lookAt(W, headOf(G)))));
      camPath(cam, t / dur, [-0.6, 4.8, 10.6], [-0.2, 4.6, 9.4], [0.0, 3.9, -2.3], [0.0, 3.9, -2.3], 24, 26);
    };
  },
  // 40 "That they'd always have a home."  — close on Wren, softly smiling, a lit torch with a curled-up dragon glowing beside her
  (S, cam) => {
    const env = battlements(S, { lit: 1 }); const W = wren(S, 'softsmile', [2.2, 0, -2.0], -40); const G = gran(S, 'softsmile', [-2.2, 0, -2.6], 40);
    const td = dragon(S, 5, 0.18, 0); const T6 = env.torches[7]; fill(S, [-2, 5, 2], 3, 0xffc890, 8);
    return (t, dur) => { env.update(t);
      W.pose(addPose(addPose(idle(t, 0.5), talk(t, 0.7)), { turn: -12, nod: -8 })); G.pose(addPose(idle(t, 0.5), lookAt(G, headOf(W))));
      const tip = T6.tip; td.root.position.set(tip.x, tip.y - 0.05, tip.z); td.update(t, 'curl'); td.blink(1);
      faceCam(cam, t / dur, headOf(W).toArray(), -25, { dist: 6.8, lens: 30, side: 0.6, push: 0.8, look: -0.6 });
    };
  },
  // 41 "Now every torch in the castle has a dragon."  — slide along the wall torches: in each flame a tiny dragon is curled up asleep; one opens an eye and yawns
  (S, cam) => {
    const env = battlements(S, { lit: 1 }); const ds = [0, 1, 2, 3].map(i => { const d = dragon(S, i + 2, 0.2, 0); env.torches[i].flame.group.scale.multiplyScalar(0.7); const tip = env.torches[i].tip; d.root.position.set(tip.x, tip.y - 0.2, tip.z + 0.25); d.root.rotation.y = 0.5 + i; return d; });
    return (t, dur) => { env.update(t);
      ds.forEach((d, i) => { const awake = i === 2 ? sm(t, dur * 0.45, dur * 0.6) : 0; d.update(t, awake > 0.5 ? 'perch' : 'curl'); d.blink(1 - awake); d.jaw(i === 2 ? Math.max(0, Math.sin((t - dur * 0.6) * 4)) * awake * 0.9 : 0); });
      camPath(cam, t / dur, [-11.0, 6.6, -8.2], [-4.0, 6.4, -8.2], [-10.5, 5.6, -13.4], [-3.5, 5.6, -13.4], 32, 32);
    };
  },
  // 42 "Baker Hob's bread is still toasted, though."  — the kitchen: Hob pulls out another charcoal loaf; the dragon on his hat gives a proud little puff
  (S, cam) => {
    const env = castleKitchen(S); const H = hob(S, 'bored', [-3.0, 0, 0.8], 40); const d = dragon(S, 2, 0.15, 3); const L = loaf(S, [0, 0, 0], 1.0);
    return (t, dur) => { env.update(t);
      H.pose(addPose(idle(t, 0.5), hit([[0, { rFwd: 80, lFwd: 80, rUp: -20, lUp: -20 }], [dur * 0.5, { rFwd: 90, lFwd: 90, rUp: -24, lUp: -24, nod: 10 }], [dur * 0.7, { rFwd: 60, lFwd: 60, ...POSES.shrug, nod: -6 }]], t)));
      const a = pinky(H, 'R'), b = pinky(H, 'L'); L.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 - 0.1, (a.z + b.z) / 2 + 0.2); L.rotation.y = 40 * D;
      if (t > dur * 0.65) H.setFace('pout');
      const hp = headOf(H); d.root.position.set(hp.x, hp.y + 1.65, hp.z); d.root.rotation.y = 0.8; d.update(t, 'perch'); d.breath(t > dur * 0.75 ? 0.18 : 0); d.jaw(t > dur * 0.72 ? 0.5 : 0);
      faceCam(cam, t / dur, [hp.x, hp.y - 0.2, hp.z], 40, { dist: 9.4, lens: 28, side: 0.8, push: 1.0, up: 0.8, look: 0.0 });
    };
  },
  // 43 "Best birthday wish I ever made."  — Wren and Grandma below the glowing wall; slow crane up and back as tiny dragons drift between the torches
  (S, cam) => {
    const env = battlements(S, { lit: 1 }); const W = wren(S, 'softsmile', [1.0, 0, -2.0], -15); const G = gran(S, 'softsmile', [-3.6, 0, -2.4], 15); fill(S, [-1.2, 5.5, 5], 7, 0xffc890, 12);
    const tiny = Array.from({ length: 5 }, (_, i) => dragon(S, i + 4, 0.3, i < 2 ? 4 : 0)); const prev = tiny.map(() => new THREE.Vector3());
    return (t, dur) => { env.update(t);
      W.pose(addPose(idle(t, 0.5), addPose(lookAt(W, t < dur * 0.45 ? [-1, 7, 8] : headOf(G)), { lFwd: 20 }))); G.pose(addPose(idle(t, 0.5, 2), addPose(lookAt(G, headOf(W)), { rFwd: 20, tilt: 6 })));
      if (t > dur * 0.4) W.setFace('delighted');
      tiny.forEach((d, i) => { const p = orbit(t, [-4 + i * 2.5, 7 + (i % 2) * 2, -11], 2.4, 0.8, 0.8, i * 1.3); steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); });
      camPath(cam, t / dur, [-0.6, 3.6, 9.0], [0.0, 8.0, 18.0], [-1.2, 4.6, -3], [-1.0, 8.0, -10], 24, 22);
    };
  },
];
