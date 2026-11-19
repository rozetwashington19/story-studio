import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, camPath, seg, hit, talk, lookAt, anticipate,
  snowman, catSnowman, knitting, snoreZ, snowBurst, rosette, shovel, snowAngel, snowTown, snowPorch, snowMat } from '../../engine/kit.js';
import { NORA, OTIS, BEA, TOWN, mk, ramp, sm, V, faceCam, RUN, hold, hn,
  GSIZE, giant, dadSM, beaSM, smHead, stompK, shake, kidStomp, fallBack, ANGEL, CROSS, FISTS } from './common.js';
import { fair, GZ } from './shots_a.js';

// giant lying on its back (k 0..1), base at (x, z), head toward -z
const flop = (g, x, z, k) => { g.root.rotation.set(-Math.PI / 2 * k, 0, 0); g.root.position.set(x, 2.8 * k, z); };
const ROAR = { open: 1, brows: 1, mouth: -0.5 };
const ANGRY = { mouth: -0.6, brows: 1 };

export const SHOTS_B = [
  // 24 "I yelled, "No fair!"" — close: Nora shouts, fists down
  (S, cam) => {
    const env = fair(S); const n = mk(S, NORA, 'nora', 'angry', [0, 0, 4], -10);
    return (t, dur) => {
      faceCam(cam, sm(t, 0, dur), [0, 4.64, 4], -10, { dist: 6.6, lens: 35, push: 0.7, side: -0.5, look: -0.4 });
      n.pose(addPose(addPose({ rUp: 12, lUp: 12, rFwd: -15, lFwd: -15, lean: 8 }, anticipate(t, dur * 0.25)), t > dur * 0.25 ? talk(t, 2.2) : idle(t, 0.6)));
      n.setFace('angry'); env.update(t);
    };
  },
  // 25 "It roared so loud, the roofs lost their snow." — the giant ROARS (close) → in town, the snow slides off every roof
  (S, cam) => {
    const env = snowTown(S, { time: 'day', lamps: false, bunting: false });
    const g = giant(S); g.root.position.set(6, 0, -40); const g2 = giant(S); const B = snowBurst(S, { n: 160, size: 0.3, seed: 6 });
    let fired = false;
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.38]);
      g2.root.visible = c === 0; g2.root.position.set(200, 0, 0); g.root.visible = c === 1;
      if (c === 0) { const h = smHead(g2); camPath(cam, sm(p, 0, 1), [200.5, h.y - 2, 12], [200.4, h.y - 1.5, 9.5], [200, h.y, 0], [200, h.y + 0.2, 0], 34, 36);
        g2.pose({ nod: -10, rUp: 110 + Math.sin(t * 20) * 4, lUp: 110 + Math.sin(t * 21) * 4, tilt: Math.sin(t * 25) * 1.5 }); g2.face({ ...ROAR, open: hn([[0, 0.2], [0.3, 1]], t) }); shake(cam, t, 0.2, 0.15, 1.2); }
      else { const t0 = dur * 0.38, k = ramp(t, t0 + 0.15, t0 + 1.4); env.roofSnow(k);
        camPath(cam, sm(p, 0, 1), [0, 5.5, 15], [0, 6.5, 13], [0, 8, -16], [0, 9.5, -16], 24, 24);
        g.pose({ nod: -10, rUp: 110, lUp: 110 }); g.face(ROAR);
        if (!fired && t > t0 + 0.6) { fired = true; for (const r of env.roofs.filter((_, i) => i % 2 === 0)) { const w = r.getWorldPosition(new THREE.Vector3()); if (Math.abs(w.x) < 22) B.fire([w.x + r.userData.s * 4, 0.6, -14], t0 + 0.75, { up: 5, spread: 3, scale: 1 }); } }
        shake(cam, t, t0 + 0.1, 0.2, 1.0); }
      B.update(t); env.update(t);
    };
  },
  // 26 "Everyone ran. Even the tiny cat hid." — townsfolk run past; the snow cat ducks behind a snowbank, ears trembling
  (S, cam) => {
    const env = fair(S); const g = giant(S); g.root.position.set(0, 0, GZ);
    const R = [0, 1, 2, 3].map(i => mk(S, TOWN[i], 'r' + i, 'scared', [-14 - i * 3.5, 0, -0.8 + (i % 2) * 1.8], 90));
    const cat = catSnowman(S, { name: 'snowcat', s: 1.1 }); cat.root.position.set(1.2, 0, 7.6);
    const bank = new THREE.Mesh(new THREE.SphereGeometry(1.6, 18, 10), snowMat()); bank.scale.set(1.5, 0.75, 0.8); bank.position.set(1.2, 0, 9.3); bank.castShadow = true; S.add(bank);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [3.5, 2.4, 17], [2.6, 2.0, 15.5], [0, 3, 3], [1, 1.8, 6], 26, 30);
      R.forEach((a, i) => { a.root.position.x = -14 - i * 3.5 + t * 11; a.pose(addPose(RUN(t + i * 0.3), { rUp: 50, lUp: 50, turn: -40 })); });
      const h = ramp(t, dur * 0.45, dur * 0.65); cat.root.scale.set(1.1 + 0.15 * h, 1.1 * (1 - 0.45 * h), 1.1 + 0.15 * h); cat.update(t, h > 0.3 ? 'hide' : 'sit'); cat.head.rotation.y = h > 0.3 ? Math.sin(t * 4) * 0.2 : -0.5;
      g.pose({ rUp: 70, lUp: 70, tilt: Math.sin(t * 3) * 3 }); g.face(ANGRY); env.update(t);
    };
  },
  // 27 "It stomped toward town, copying my tantrum." — (HOOK) Nora marches stomping down the street; the giant stomps right behind her
  (S, cam) => {
    const env = snowTown(S, { time: 'day', lamps: false, fences: false, bunting: false });
    const g = giant(S); const n = mk(S, NORA, 'nora', 'angry', [-6, 0, 5], 90); const B = snowBurst(S, { n: 140, size: 0.35, seed: 3 });
    const steps = [0.6, 1.3, 2.0, 2.7, 3.4]; const fired = new Set();
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [5, 2.2, 25], [4, 2.6, 23], [-6, 8.5, -5], [-3.5, 9, -6], 22, 22);
      const nx = -6 + t * 1.6; n.root.position.x = nx; const ph = (t * 1.43) % 1;
      n.pose(addPose(addPose(walk(t * 0.9, 1, 1.1), { rUp: 25 + Math.sin(t * 9) * 25, lUp: 25 - Math.sin(t * 9) * 25, rFwd: Math.sin(t * 9) * 40, lFwd: -Math.sin(t * 9) * 40, lean: 8 }), { turn: -50, nod: 4 }));
      const gx = -15 + t * 2.4; g.root.position.set(gx, 0, -10.2); g.root.rotation.y = 40 * D;
      let st = { hop: 0, squash: 0 }; for (const s0 of steps) { const k = stompK(t, s0, 0.8, 0.45); if (k.hop || k.squash) st = k; if (t > s0 && !fired.has(s0)) { fired.add(s0); B.fire([gx + 2, 0.5, -5.5], s0, { up: 6, spread: 5, scale: 1.1 }); } }
      g.pose({ ...st, rUp: 25 + Math.sin(t * 9) * 30, lUp: 25 - Math.sin(t * 9) * 30, tilt: Math.sin(t * 4.5) * 5, turn: -25 }); g.face(ANGRY);
      for (const s0 of steps) shake(cam, t, s0, 0.22, 0.45);
      B.update(t); n.setFace('angry'); env.update(t);
    };
  },
  // 28 "I yelled, "Stop!" It yelled back, even louder." — close: Nora yells STOP → over her shoulder the giant roars back, a blast of snow
  (S, cam) => {
    const env = snowTown(S, { time: 'day', lamps: false, fences: false, bunting: false });
    const g = giant(S); g.root.position.set(4, 0, -10.2); g.root.rotation.y = -10 * D;
    const n = mk(S, NORA, 'nora', 'angry', [0, 0, 6], 170); const B = snowBurst(S, { n: 120, size: 0.22, seed: 11 });
    let fired = false;
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]); const t1 = dur * 0.45;
      if (c === 0) { n.root.rotation.y = 170 * D; faceCam(cam, sm(p, 0, 1), [0, 4.64, 6], 170, { dist: 6.4, lens: 35, push: 0.7, side: 0.4 }); }
      else camPath(cam, sm(p, 0, 1), [1.6, 4.0, 13], [1.4, 4.2, 12], [2.5, 10, -8], [2.5, 11.5, -9], 24, 24);
      n.pose(c === 0 ? addPose({ rUp: 70, lUp: 70, rFwd: 40, lFwd: 40, lean: 10 }, talk(t, 2.4)) : addPose(idle(t, 0.5), hit([[t1 + 0.2, { rUp: 40, lUp: 40 }], [t1 + 0.5, { rFwd: 140, lFwd: 140, rUp: -20, lUp: -20, lean: -12, nod: 10, bob: -0.1 }]], t)));
      n.setFace(c === 0 ? 'angry' : 'scared');
      g.pose(c === 1 ? { lean: hn([[t1, 0], [t1 + 0.35, 12]], t), rUp: 110, lUp: 110, tilt: Math.sin(t * 25) * 1.5 } : { rUp: 60, lUp: 60 }); g.face(c === 1 && t > t1 + 0.15 ? ROAR : ANGRY);
      if (c === 1 && !fired && t > t1 + 0.3) { fired = true; B.fire(smHead(g).add(new THREE.Vector3(0, -3, 3)), t1 + 0.3, { up: 2, spread: 6, scale: 0.9 }); }
      B.update(t); if (c === 1) shake(cam, t, t1 + 0.3, 0.2, 1.0); env.update(t);
    };
  },
  // 29 "Then I saw Dad's snowman, napping peacefully." — Nora (out of breath) stops at the porch; Dad's snowman snoring
  (S, cam) => {
    const env = snowPorch(S, {});
    const s = dadSM(S); s.root.position.set(2.2, 0.86, -3.3); const z = snoreZ(S);
    const n = mk(S, NORA, 'nora', 'angry', [5.0, 0, 3.6], -120);
    S.userData.allowContact = [['dadsm', 'porch deck']];
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-3.5, 4.4, 15], [-2.5, 4.3, 13.5], [3.4, 3.4, 0.5], [3.2, 3.5, 0], 24, 25);
      s.pose({ tilt: -12 + Math.sin(t * 2.2) * 3, nod: 10 + Math.sin(t * 2.2) * 3 }); s.face({ sleep: 1, mouth: 0.6, open: 0.1 + 0.08 * Math.sin(t * 2.2) });
      const sh = smHead(s); z.update(t, [sh.x + 0.4, sh.y + 0.6, sh.z], 1);
      n.pose(addPose(addPose(idle(t, 1), { bob: Math.abs(Math.sin(t * 5)) * 0.04, rFwd: 15, lFwd: 15 }), lookAt(n, sh))); n.setFace(t > dur * 0.55 ? 'thinking' : 'worried');
      env.update(t);
    };
  },
  // 30 "And Grandma's, knitting slow and happy." — Grandma's snowman knitting peacefully, humming along, close
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const s = beaSM(S); s.root.position.set(0, 0, 0); s.root.rotation.y = -15 * D; const kn = knitting(S, 0x7ae85a);
    const g = mk(S, BEA, 'bea', 'softsmile', [-4.6, 0, 0.8], 30); const kg = knitting(S, 0xff6ad0);
    return (t, dur) => {
      const h = smHead(s); camPath(cam, sm(t, 0, dur), [1.2, h.y - 0.6, 8], [0.8, h.y - 0.5, 6.6], [0, h.y - 1.0, 0], [0, h.y - 0.8, 0], 34, 36);
      const c = Math.sin(t * 5); s.pose({ rFwd: 55 + c * 5, lFwd: 55 - c * 5, rUp: 8, lUp: 8, nod: 14, tilt: Math.sin(t * 1.2) * 6 }); s.face({ mouth: 1, brows: -0.5, sleep: 0.45 });
      const a = s.hand('R'), b = s.hand('L'); kn.position.copy(a).add(b).multiplyScalar(0.5); kn.position.y += 0.2; kn.rotation.y = -15 * D; kn.click(t * 0.45);
      g.pose(addPose({ rFwd: 62 + c * 3, lFwd: 62 - c * 3, rUp: -22, lUp: -22, nod: 22, tilt: Math.sin(t * 1.2) * 4 }, idle(t, 0.4))); g.root.updateMatrixWorld(true);
      const ga = g.armR.localToWorld(new THREE.Vector3(0, -1.6, 0)), gb = g.armL.localToWorld(new THREE.Vector3(0, -1.6, 0)); kg.position.copy(ga).add(gb).multiplyScalar(0.5); kg.position.y += 0.25; kg.rotation.y = 30 * D; kg.click(t * 0.45);
      env.update(t);
    };
  },
  // 31 "They don't just copy what you do." — Nora's realization: slow push on her face, the giant blurred far behind
  (S, cam) => {
    const env = snowTown(S, { time: 'day', lamps: false, bunting: false }); const g = giant(S); g.root.position.set(-8, 0, -34);
    const n = mk(S, NORA, 'nora', 'thinking', [0, 0, 4], 15);
    return (t, dur) => {
      faceCam(cam, sm(t, 0, dur), [0, 4.64, 4], 15, { dist: 6.8, lens: 36, push: 1.1, side: 0.7 });
      n.pose(addPose(addPose(idle(t, 0.5), { rFwd: 20, lFwd: 20 }), { turn: -10 + 14 * ramp(t, dur * 0.4, dur * 0.7), nod: 4 })); n.setFace(t > dur * 0.55 ? 'awe' : 'thinking');
      g.pose({ rUp: 70, lUp: 70, tilt: Math.sin(t * 3) * 3 }); g.face(ANGRY); env.update(t);
    };
  },
  // 32 "They copy how you feel." — the giant's angry face (slow push) → Nora's angry face melts into worry
  (S, cam) => {
    const env = snowTown(S, { time: 'day', lamps: false, bunting: false }); const g = giant(S); g.root.position.set(200, 0, 0);
    const n = mk(S, NORA, 'nora', 'angry', [0, 0, 4], 0);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      if (c === 0) { const h = smHead(g); camPath(cam, sm(p, 0, 1), [200.3, h.y - 1.2, 11], [200.2, h.y - 0.8, 9], [200, h.y - 0.2, 0], [200, h.y, 0], 36, 38); }
      else faceCam(cam, sm(p, 0, 1), [0, 4.64, 4], 0, { dist: 6.2, lens: 36, push: 0.8, side: 0.3 });
      g.pose({ tilt: Math.sin(t * 3) * 2, rUp: 70, lUp: 70 }); g.face(ANGRY);
      n.pose(addPose(idle(t, 0.5), { nod: 6 })); n.setFace(c === 1 && p > 0.45 ? 'worried' : 'angry');
      env.update(t);
    };
  },
  // 33 "So I took a slow breath." — sunset at the park: Nora closes her eyes and breathes in... the giant breathes too
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const g = giant(S); g.root.position.set(4, 0, GZ);
    const n = mk(S, NORA, 'nora', 'relieved', [0, 0, 4], 10);
    return (t, dur) => {
      faceCam(cam, sm(t, 0, dur), [0, 4.64, 4], 10, { dist: 6.6, lens: 36, push: 0.8, side: -0.6 });
      const br = Math.sin(Math.min(1, t / dur) * Math.PI);
      n.pose({ bob: br * 0.12, rUp: 8 + br * 10, lUp: 8 + br * 10, nod: -6 * br, lean: -3 * br }); n.setFace(t > dur * 0.2 ? 'sleeping' : 'worried');
      g.pose({ squash: -0.05 * br, nod: -6 * br }); g.face({ mouth: -0.3, brows: 0.6 * (1 - br) }); env.update(t);
    };
  },
  // 34 "I let the mad melt away." — two-shot at golden hour: Nora's face softens — and so does the giant's
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const g = giant(S); g.root.position.set(4, 0, GZ);
    const n = mk(S, NORA, 'nora', 'relieved', [-3, 0, 5], -20); const sp = snowBurst(S, { n: 40, size: 0.25, seed: 2 }); let fired = false;
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-9, 2.6, 17], [-8, 3.0, 15], [0, 8.5, -6], [1, 9, -7], 24, 24);
      const k = ramp(t, dur * 0.3, dur * 0.7);
      n.pose(addPose(idle(t, 0.6), { rUp: 10 + k * 8, lUp: 10 + k * 8, turn: 25, nod: -8 })); n.setFace(k > 0.5 ? 'relieved' : 'relieved');
      g.pose({ rUp: 70 - 30 * k, lUp: 70 - 30 * k, squash: 0.03 * k, nod: 6 * k, tilt: 5 * k }); g.face({ mouth: -0.4 + 1.4 * k, brows: 0.8 - 1.3 * k });
      if (!fired && k > 0.5) { fired = true; sp.fire([4, 13, GZ + 3], t, { up: 1, spread: 4 }); } sp.update(t); env.update(t);
    };
  },
  // 35 "And I lay down in the snow." — Nora falls back into the snow, arms out, with a soft poof
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const n = mk(S, NORA, 'nora', 'relieved', [0, 0, 6], 0); const b = snowBurst(S, { n: 40, size: 0.12 }); let fired = false;
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [11, 3.6, 12], [10, 5.0, 11], [0, 2.4, 5], [0, 1.0, 4], 26, 28);
      const k = hn([[dur * 0.25, 0], [dur * 0.62, 1]], t, u => u * u); fallBack(n, 0, 6, Math.min(1, k)); S.userData.allowContact = [['nora', 'ground']];
      n.pose({ rUp: 80 * Math.min(1, k * 1.4), lUp: 80 * Math.min(1, k * 1.4), nod: -10 * k }); n.setFace(k > 0.9 ? 'relieved' : 'relieved');
      if (!fired && k >= 1) { fired = true; b.fire([0, 0.3, 3.8], t, { up: 3.5, spread: 3 }); } b.update(t); env.update(t);
    };
  },
  // 36 "The giant flopped down too. Boom!" — the giant tips back and lands — a huge burst of snow, the camera shakes
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const g = giant(S); const n = mk(S, NORA, 'nora', 'laugh', [-6, 0, 7], 0); fallBack(n, -6, 7, 1);
    const B = snowBurst(S, { n: 180, size: 0.5, seed: 5 }); let fired = false; S.userData.allowContact = [['nora', 'ground'], ['giant', 'ground']];
    return (t, dur) => {
      const t0 = dur * 0.55; camPath(cam, sm(t, 0, dur), [-16, 5, 20], [-15, 6.5, 18], [2, 9, -10], [3, 6, -14], 24, 24);
      const k = Math.min(1, hn([[dur * 0.18, 0], [t0, 1]], t, u => u * u * u)); flop(g, 4, GZ, k);
      g.pose({ rUp: 45 + 50 * k, lUp: 45 + 50 * k }); g.face({ mouth: 1, brows: -0.4, open: k > 0.3 && k < 1 ? 0.5 : 0 });
      if (!fired && t >= t0) { fired = true; for (const dz of [0, -8, -16]) B.fire([4, 1, GZ + dz], t0, { up: 11, spread: 9, scale: 1.5 }); } B.update(t); shake(cam, t, t0, 0.6, 0.9);
      n.pose({ rUp: 80, lUp: 80, nod: -15 }); n.setFace(t > t0 ? 'laugh' : 'relieved'); env.update(t);
    };
  },
  // 37 "We made a snow angel as big as a park!" — top-down crane: both sweep their arms; the angels appear (tiny and HUGE)
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const g = giant(S); flop(g, 4, GZ, 1);
    const n = mk(S, NORA, 'nora', 'laugh', [-6, 0, 7], 0); fallBack(n, -6, 7, 1); S.userData.allowContact = [['nora', 'ground'], ['giant', 'ground']];
    const a1 = snowAngel(S, [-6, 7 - 2.9], 6.2), a2 = snowAngel(S, [4, GZ - 9.5], 30);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-6, 14, 22], [-3, 34, 26], [-4, 0, 0], [0, 0, -14], 26, 24);
      n.pose(addPose(ANGEL(t), { nod: -15 })); g.pose({ rUp: 45 + ANGEL(t - 0.3).rUp * 0.7, lUp: 45 + ANGEL(t - 0.3).lUp * 0.7 }); g.face({ mouth: 1, brows: -0.5 });
      a1.set(Math.min(0.9, t / dur * 2)); a2.set(Math.min(0.9, t / dur * 1.6)); env.update(t);
    };
  },
  // 38 "Then I walked over to Otis." — sunset: Nora, still snowy, walks up to Otis and his cat
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const n = mk(S, NORA, 'nora', 'smile', [-9, 0, 3], 90);
    const o = mk(S, OTIS, 'otis', 'nervous', [2.2, 0, 2.6], -35); const cat = catSnowman(S, { name: 'snowcat' }); cat.root.position.set(5.2, 0, 1.2); cat.root.rotation.y = -40 * D;
    const r = rosette(S, 0x2a6ae8); r.scale.setScalar(0.8);
    return (t, dur) => {
      const x = Math.min(-2.2, -9 + t * 2.6); n.root.position.x = x; n.root.rotation.y = (x < -2.25 ? 90 : 60) * D; n.pose(x < -2.25 ? walk(t, 1, 0.8) : idle(t, 0.7));
      camPath(cam, sm(t, 0, dur), [-5, 4.0, 17], [-1, 4.0, 15.5], [-3.5, 3.6, 3], [0, 3.6, 2.8], 24, 24);
      o.pose(addPose(addPose(idle(t, 0.7), lookAt(o, [x, 4.6, 3.4])), { rFwd: 10 })); o.setFace(t > dur * 0.6 ? 'worried' : 'nervous');
      o.root.updateMatrixWorld(true); r.position.copy(o.body.localToWorld(new THREE.Vector3(0.35, 1.5, 0.6))); r.rotation.y = -55 * D;
      cat.update(t, 'sit'); env.update(t);
    };
  },
  // 39 ""Your cat is the best snowman here," I said." — over Otis's shoulder onto Nora, smiling, talking
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const n = mk(S, NORA, 'nora', 'smile', [-2.2, 0, 3], 60);
    const o = mk(S, OTIS, 'otis', 'nervous', [2.2, 0, 2.6], -55); const cat = catSnowman(S, { name: 'snowcat' }); cat.root.position.set(5.2, 0, 1.2); cat.root.rotation.y = -40 * D;
    const r = rosette(S, 0x2a6ae8); r.scale.setScalar(0.8);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [4.2, 4.9, 11.5], [3.4, 4.8, 9.8], [-1.6, 4.3, 3], [-2.0, 4.5, 3], 28, 31);
      n.root.userData.p = addPose(addPose(idle(t, 0.6), talk(t)), hit([[dur * 0.2, POSES.rest], [dur * 0.45, { rFwd: 45, rUp: -10, tilt: 6 }]], t)); n.setFace(t > dur * 0.5 ? 'blush' : 'smile'); n.pose(n.root.userData.p);
      o.pose(addPose(idle(t, 0.7), lookAt(o, [-2.2, 4.64, 3]))); o.setFace(t > dur * 0.6 ? 'blush' : 'shock');
      o.root.updateMatrixWorld(true); r.position.copy(o.body.localToWorld(new THREE.Vector3(0.35, 1.5, 0.6))); r.rotation.y = -55 * D;
      cat.update(t, 'wag'); env.update(t);
    };
  },
  // 40 "And I really meant it." — Nora's sincere smile (close) → Otis breaks into a huge grin
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const n = mk(S, NORA, 'nora', 'smile', [-2.2, 0, 3], 60);
    const o = mk(S, OTIS, 'otis', 'blush', [2.2, 0, 2.6], -55); const r = rosette(S, 0x2a6ae8); r.scale.setScalar(0.8);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) faceCam(cam, sm(p, 0, 1), [-2.2, 4.64, 3], 60, { dist: 6.8, lens: 35, push: 0.6, side: -0.5, look: -0.1 });
      else faceCam(cam, sm(p, 0, 1), [2.2, 4.64, 2.6], -55, { dist: 6.8, lens: 35, push: 0.6, side: 0.5, look: -0.1 });
      n.pose(addPose(idle(t, 0.5), { nod: 4, tilt: 5, turn: 8 })); n.setFace('smile');
      o.pose(addPose(addPose(idle(t, 0.6), lookAt(o, [-2.2, 4.64, 3])), c === 1 ? hit([[dur * 0.6, POSES.rest], [dur * 0.8, { bob: 0.08, tilt: -6, nod: -4 }]], t) : {})); o.setFace(c === 1 && p > 0.35 ? 'delighted' : 'blush');
      o.root.updateMatrixWorld(true); r.position.copy(o.body.localToWorld(new THREE.Vector3(0.35, 1.5, 0.6))); r.rotation.y = -55 * D;
      env.update(t);
    };
  },
  // 41 "Behind me, the giant patted the tiny cat. Gently." — the giant bends down and taps the snow cat's head with one stick finger
  (S, cam) => {
    const env = fair(S, 'sunset', 0, -12, false); const g = giant(S); g.root.position.set(0, 0, -12);
    S.children.slice().forEach(o => { if (!o.isLight && Math.hypot(o.position.x - 8, o.position.z + 3.5) < 3.2 && o.position.y < 4) S.remove(o); });   // judges' table is off-screen here: make room for the giant
    const cat = catSnowman(S, { name: 'snowcat', s: 1.2 });
    const n = mk(S, NORA, 'nora', 'smile', [-4.5, 0, 6], 30), o = mk(S, OTIS, 'otis', 'delighted', [6.5, 0, 5.5], -30);
    // find the lean that brings the stick hand down to cat height
    const P = (lean, f) => ({ lean, rFwd: f, rUp: 20, lUp: 45, nod: 25 });
    let best = 0, bd = 1e9; for (let l = 0; l <= 70; l += 2) { g.pose(P(l, 70)); const h = g.hand('R'); const d = Math.abs(h.y - 2.6); if (d < bd) { bd = d; best = l; } }
    g.pose(P(best, 70)); let tip = g.hand('R'); g.root.position.x -= tip.x + 3; g.root.position.z -= tip.z - 0; tip = g.hand('R'); cat.root.position.set(tip.x, 0, tip.z + 0.2);
    S.userData.allowContact = [['giant', 'snowcat']];
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [3, 3.6, 25], [2.5, 4.0, 22.5], [1, 7.5, -4], [1, 6.5, -3], 22, 22);
      const k = sm(t, dur * 0.1, dur * 0.55), pat = t > dur * 0.55 ? Math.max(0, Math.sin((t - dur * 0.55) * 9)) * 6 : 0;
      g.pose({ ...P(best * k, 70 * k), rFwd: 70 * k + pat }); g.face({ mouth: 1, brows: -0.6 });
      cat.update(t, t > dur * 0.6 ? 'wag' : 'sit'); cat.head.rotation.x = -0.25 * k;
      n.pose(addPose(idle(t, 0.6), lookAt(n, [tip.x, 2, tip.z]))); o.pose(addPose(idle(t, 0.7), t > dur * 0.65 ? hit([[dur * 0.65, POSES.rest], [dur * 0.85, { rUp: 140, lUp: 20 }]], t) : lookAt(o, [tip.x, 2, tip.z])));
      o.setFace(t > dur * 0.65 ? 'laugh' : 'delighted'); env.update(t);
    };
  },
  // 42 "Now my giant shovels everyone's driveway." — next morning: the giant shovels the street with a giant shovel; neighbours wave
  (S, cam) => {
    const env = snowTown(S, { time: 'morning', lamps: false, fences: false, bunting: false }); const g = giant(S); g.root.position.set(2, 0, -10.2);
    const sv = shovel(S); sv.scale.setScalar(GSIZE * 0.9); const B = snowBurst(S, { n: 140, size: 0.4, seed: 7 });
    const w = mk(S, TOWN[3], 'w1', 'delighted', [-6, 0, 5], 20), w2 = mk(S, TOWN[4], 'w2', 'smile', [-10.5, 0, 4], 25);
    const fires = [0.9, 2.3, 3.7]; const done = new Set();
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-5, 3, 26], [-3, 3.6, 23.5], [-1, 8, -6], [0, 9, -7], 22, 22);
      const ph = (t % 1.4) / 1.4, sc = Math.sin(ph * Math.PI * 2);
      g.pose({ rFwd: 55 + sc * 25, lFwd: 55 + sc * 25, rUp: 10, lUp: 10, lean: 10 + sc * 8, bodyTurn: sc * 18, nod: 10 }); g.face({ mouth: 1, brows: -0.4 });
      const a = g.hand('R'), b = g.hand('L'); sv.position.copy(a).add(b).multiplyScalar(0.5); sv.position.y -= 9.5; sv.rotation.set(0.15, sc * 0.3, 0);
      for (const f of fires) if (t > f && !done.has(f)) { done.add(f); B.fire([sv.position.x + 3, 1.5, sv.position.z + 3], f, { up: 9, spread: 4, scale: 1.2 }); }
      B.update(t);
      w.pose(addPose(idle(t, 0.8), t > dur * 0.3 ? { rUp: 140 + Math.sin(t * 9) * 18, lUp: 10 } : lookAt(w, [2, 15, -10]))); w2.pose(addPose(idle(t, 0.8, 2), lookAt(w2, [2, 15, -10])));
      env.update(t);
    };
  },
  // 43 "Grandma's teaching it to knit." — Grandma holds up her needles; the giant tries to copy with ENORMOUS ones
  (S, cam) => {
    const env = snowTown(S, { time: 'morning', lamps: false, fences: false, bunting: false }); const g = giant(S); g.root.position.set(4, 0, -10.2); g.root.rotation.y = -15 * D;
    const b = mk(S, BEA, 'bea', 'proud', [-3, 0, 4.5], -30); const kn = knitting(S, 0xff6ad0), kb = knitting(S, 0x5aaaff); kb.scale.setScalar(4.2);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-8, 3.4, 15.5], [-6.5, 4.4, 14], [0, 7, -4], [1.5, 8.5, -5], 24, 24);
      const c = Math.sin(t * 6);
      b.pose(addPose(addPose({ rFwd: 85 + c * 6, lFwd: 85 - c * 6, rUp: -14, lUp: -14 }, idle(t, 0.6)), lookAt(b, [4, 15, -10]))); b.root.updateMatrixWorld(true);
      const ba = b.armR.localToWorld(new THREE.Vector3(0, -1.6, 0)), bb = b.armL.localToWorld(new THREE.Vector3(0, -1.6, 0)); kn.position.copy(ba).add(bb).multiplyScalar(0.5); kn.position.y += 0.15; kn.position.z += 0.3; kn.rotation.y = -30 * D; kn.click(t);
      const cg = Math.sin((t - 0.4) * 6); g.pose({ rFwd: 60 + cg * 10, lFwd: 60 - cg * 10, rUp: 12, lUp: 12, nod: 22, tilt: Math.sin(t * 2) * 6 }); g.face({ mouth: 0.6, brows: -0.8 });
      const a = g.hand('R'), d = g.hand('L'); kb.position.copy(a).add(d).multiplyScalar(0.5); kb.position.y += 0.8; kb.rotation.set(0, -15 * D, Math.sin(t * 3) * 0.1); kb.click(t * 0.8);
      env.update(t);
    };
  },
  // 44 "It's even worse than her." — close on the giant's huge lumpy knitting (proud grin) → Grandma laughing
  (S, cam) => {
    const env = snowTown(S, { time: 'morning', lamps: false, fences: false, bunting: false }); const g = giant(S); g.root.position.set(4, 0, -10.2); g.root.rotation.y = -15 * D;
    const b = mk(S, BEA, 'bea', 'laugh', [-3, 0, 4.5], -30); const kb = knitting(S, 0x5aaaff); kb.scale.setScalar(4.2);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      g.pose({ rFwd: 95, lFwd: 95, rUp: 10, lUp: 10, nod: -4, tilt: Math.sin(t * 2) * 4 }); g.face({ mouth: 1, brows: -0.9 });
      const a = g.hand('R'), d = g.hand('L'); kb.position.copy(a).add(d).multiplyScalar(0.5); kb.position.y += 1.5; kb.rotation.set(0, -15 * D, Math.sin(t * 2.5) * 0.12);
      if (c === 0) camPath(cam, sm(p, 0, 1), [6, 10, 6], [5.6, 11, 4], [kb.position.x, 12, kb.position.z], [kb.position.x, 13, kb.position.z], 30, 32);
      else faceCam(cam, sm(p, 0, 1), [-3, 4.64, 4.5], -30, { dist: 6.6, lens: 34, push: 0.7, side: 0.6 });
      b.pose(addPose(idle(t, 0.5), { bob: Math.abs(Math.sin(t * 9)) * 0.06, nod: -6 + Math.sin(t * 9) * 3, rFwd: 40, lFwd: 40, rUp: -10, lUp: -10 })); b.setFace('laugh');
      env.update(t);
    };
  },
  // 45 "And when I lose now?" — Nora with another red 2nd-place ribbon (callback) — she looks at it... and smiles
  (S, cam) => {
    const env = snowTown(S, { time: 'morning' }); const n = mk(S, NORA, 'nora', 'pout', [0, 0, 3], 10); const r = rosette(S, 0xd83a3a);
    return (t, dur) => {
      faceCam(cam, sm(t, 0, dur), [0, 4.64, 3], 10, { dist: 6.8, lens: 35, push: 0.9, side: 0.6, look: -0.5 });
      n.pose(addPose({ rFwd: 72, rUp: -12, nod: 16, tilt: 4 }, idle(t, 0.5))); hold(r, n, 'R', [0, 0.35, 0.3]); r.rotation.set(-0.3, 10 * D, 0);
      n.setFace(t > dur * 0.55 ? 'smile' : 'pout'); env.update(t);
    };
  },
  // 46 "I make snow angels." — top-down at sunset: Nora and Otis make snow angels, the cat beside them; pull up to reveal the giant's
  (S, cam) => {
    const env = fair(S, 'sunset', 4); const g = giant(S); flop(g, 4, GZ, 1);
    const n = mk(S, NORA, 'nora', 'laugh', [-3, 0, 7], 0); fallBack(n, -3, 7, 1); const o = mk(S, OTIS, 'otis', 'laugh', [3.5, 0, 7.5], 0); fallBack(o, 3.5, 7.5, 1);
    const cat = catSnowman(S, { name: 'snowcat' }); cat.root.position.set(0.3, 0, 9.8);
    S.userData.allowContact = [['nora', 'ground'], ['otis', 'ground'], ['giant', 'ground']];
    const a1 = snowAngel(S, [-3, 4.1], 6.2), a2 = snowAngel(S, [3.5, 4.6], 6.2), a3 = snowAngel(S, [4, GZ - 9.5], 30); a3.set(0.85);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0.2, 13, 13], [1, 34, 24], [0.2, 0, 4.5], [1.5, 0, -12], 30, 24);
      n.pose(addPose(ANGEL(t), { nod: -15 })); o.pose(addPose(ANGEL(t + 0.4), { nod: -15 })); g.pose({ rUp: 45 + ANGEL(t - 0.3).rUp * 0.7, lUp: 45 + ANGEL(t - 0.3).lUp * 0.7 }); g.face({ mouth: 1, brows: -0.5 });
      cat.update(t, 'wag'); a1.set(Math.min(0.9, t / dur * 2)); a2.set(Math.min(0.9, t / dur * 2)); env.update(t);
    };
  },
];
