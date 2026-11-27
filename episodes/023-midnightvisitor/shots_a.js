// Episode 023 (The Midnight Visitor) — lines 2–27: the rule, the gags, Opal, the traps, the window, the net.
import * as THREE from 'three';
import { POSES, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, track, sitOn, HUDDLE,
  dustyYard, opalRoom, YARD, gardenGnome, miniFlag, kettleBbq, kidBike, wrench, trapNet, sprinkler, dirtBag, astroCamera, stick, notePad, handTorch, paper } from '../../engine/kit.js';
import { opal, dad, finn, bell, mail, astro, dog, ps, ramp, sm, lerp, V, headOf, faceCam, fill, allow, hold, hands, hn, shake, arc, clamp01, eye, bounce, breathe, look } from './common.js';

const place = (A, x, y, z, ry) => { A.root.position.set(x, y, z); if (ry !== undefined) A.root.rotation.y = ry * D; };
const NOTE = [['FIELD NOTES', '800 46px "Inter", sans-serif', '#e8502a', 70], ['local animal:', '600 40px "Inter", sans-serif', '#1a2a4a', 60], ['4 legs', '700 54px "Comic Relief", cursive', '#1a2a4a', 66], ['VERY angry', '700 54px "Comic Relief", cursive', '#b01e1e', 66], ['(do not poke', '700 44px "Comic Relief", cursive', '#1a2a4a', 54], ['again)', '700 44px "Comic Relief", cursive', '#1a2a4a', 54]];

export const SHOTS_A = [
  // 2 "Every night at midnight, something lands behind our house."
  //   Blocking: empty yard, low camera on the lawn looking over the fence. A fireball is already streaking down the sky on frame 0, hits behind the ridge at ~55 % (flash, shake, dust glow);
  //   the dog shoots out of its kennel and barks at the fence. Camera: low push toward the fence, tilting down with the fireball.
  (S, cam) => {
    const env = dustyYard(S); const dg = dog(S, [-0.7, 0, -8.2], 60);
    return (t, dur) => { env.update(t); const hitT = dur * 0.5; env.landing(t < hitT ? 0.08 + 0.92 * (t / hitT) : 1 + (t - hitT) * 0.25, t);
      const run = sm(t, hitT + 0.1, hitT + 0.7); place(dg, lerp(-0.7, 3.2, run), 0, lerp(-8.2, -6.4, run), 60); dg.update(t, t < hitT + 0.1 ? 'sit' : run < 1 ? 'run' : 'bark');
      camPath(cam, sm(t, 0, dur), [3.2, 1.3, 9.5], [4.6, 1.9, 5.5], [14, 16, -30], [9.5, 4.2, -30], 22, 24); shake(cam, t, hitT, 1.6); env.porch.intensity = 26 + (t > hitT && t < hitT + 0.5 ? Math.sin(t * 60) * 10 : 0);
    };
  },
  // 3 "You see, nobody knows what it wants."
  //   Blocking: the gate swings open by itself; the visitor is a back-lit silhouette in the gateway with one glowing gold visor, landing glow behind. It takes one slow bouncing step into the yard.
  //   Camera: low, slow push toward the gate (motivated: we are the ones hiding on the lawn).
  (S, cam) => {
    const env = dustyYard(S); const A = astro(S, [10.7, 0, -14.2], -8);
    return (t, dur) => { env.update(t); env.landing(1.3, t); env.gate.userData.open(hn([[0.15, 0], [0.9, 1]], t)); const b = bounce(t, dur * 0.35, dur * 0.95, 1, 1.3);
      place(A, 10.7, b.y, lerp(-14.2, -10.4, sm(t, dur * 0.35, dur * 0.95))); A.pose(ps(breathe(t), b.pose, { turn: Math.sin(t * 1.1) * 26 })); A.helm.glow(0.9 + Math.sin(t * 3) * 0.2); A.helm.blink(t);
      camPath(cam, sm(t, 0, dur), [7.0, 1.3, 4.0], [7.8, 1.7, 0.8], [10.6, 4.4, -12], [10.7, 4.6, -11], 26, 28);
    };
  },
  // 4 "It walks slow. It breathes loud."  — (a) low angle: it floats across the lawn in slow heavy hops straight at us; (b) close on the helmet from the side, chest heaving, breath puffing from the vents.
  (S, cam) => {
    const env = dustyYard(S); const A = astro(S, [9, 0, -8], -32); const puffs = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.3, depthWrite: false })); S.add(m); return m; });
    return (t, dur) => { env.update(t); env.landing(1.5, t); env.gate.userData.open(1); const [k, lt] = seg(t, dur, [0.5]); const b = bounce(t, 0, dur * 0.5, 2, 1.2);
      if (k === 0) { place(A, lerp(9, 6, b.u), b.y, lerp(-8, -2.5, b.u), -32); A.pose(ps(b.pose, breathe(t))); puffs.forEach(m => { m.visible = false; });
        camPath(cam, lt, [3.4, 0.6, 4.6], [3.0, 0.9, 3.4], [6.6, 2.6, -4], [6.0, 3.4, -2.6], 24); env.keyAt(4, 3, 1, 8, 0x9ab8ff); return; }
      place(A, 6, 0, -2.5, -32); const br = Math.sin(t * 2.6); A.pose(ps({ bob: br * 0.07, lean: 4 + br * 3, rUp: 14 + br * 4, lUp: 14 + br * 4, nod: br * 3, turn: sm(lt, 0.3, 0.9) * 30 })); A.helm.blink(t); const h = headOf(A);
      puffs.forEach((m, i) => { const u = ((t * 0.9 + i / 3) % 1); m.visible = true; m.position.set(h.x - 0.6 + u * -0.8, h.y - 0.9 + u * 0.7, h.z + 0.9 + u * 0.6); m.scale.setScalar(0.5 + u * 2.4); m.material.opacity = 0.32 * (1 - u); });
      env.keyAt(3, 5, 2, 9, 0x9ab8ff); faceCam(cam, lt, [h.x, h.y - 0.3, h.z], -32, { dist: 10.5, lens: 34, side: -3.4, up: 0.2, push: 0.9, look: 0.1 });
    };
  },
  // 5 "And it has one giant, golden eye."  — it stops, and the helmet turns slowly, straight into the lens. The visor fills the frame and flares. Camera: push in to an extreme close-up.
  (S, cam) => {
    const env = dustyYard(S); const A = astro(S, [5.4, 0, -2.8], -6);
    return (t, dur) => { env.update(t); env.landing(1.6, t); const tu = sm(t, 0.1, dur * 0.6); A.pose(ps(breathe(t), { turn: lerp(-58, 0, tu), nod: lerp(8, -2, tu), tilt: Math.sin(t * 1.7) * 2 + (t > dur * 0.7 ? 7 * sm(t, dur * 0.7, dur * 0.85) : 0) })); A.helm.glow(0.8 + tu * 0.7 + Math.sin(t * 5) * 0.08); A.helm.blink(t);
      const h = headOf(A); env.keyAt(5, 5.6, 3, 5 + tu * 6, 0xffd890); camPath(cam, sm(t, 0, dur), [5.9, h.y - 0.1, 7.0], [5.5, h.y, 2.7], [h.x, h.y, h.z], [h.x, h.y + 0.02, h.z], 38, 42);
    };
  },
  // 6 "Monday, it took Dad's garden gnome."
  //   Blocking: visitor bends over the flower bed (3/4 back), lifts the gnome, straightens and turns toward us holding it up to the visor like a rare find. Pinwheel spinning, window lit.
  //   Camera: medium, slight arc right-to-left with the lift.
  (S, cam) => {
    const env = dustyYard(S, { gnome: false }); const A = astro(S, [3.4, 0, -8.7], 118); const gn = gardenGnome(S, 1.0);
    return (t, dur) => { env.update(t); const grab = dur * 0.34, up = dur * 0.62; const turn = sm(t, grab + 0.1, up + 0.2); A.root.rotation.y = lerp(118, 24, turn) * D;
      A.pose(ps(breathe(t), anticipate(t, grab + 0.25), hit([[0, { lean: 10, nod: 16, rFwd: 30, lFwd: 30 }], [grab, { lean: 42, nod: 24, rFwd: 62, lFwd: 62, rUp: -12, lUp: -12, bob: -0.3 }], [up, { lean: 0, nod: 4, rFwd: 100, lFwd: 100, rUp: -14, lUp: -14 }], [dur * 0.85, { lean: -4, nod: -6, rFwd: 112, lFwd: 112, rUp: -14, lUp: -14, tilt: 8 }]], t))); A.helm.blink(t);
      if (t < grab) gn.position.set(...YARD.gnome); else { const h = hands(A); gn.position.set(h.x, h.y - 0.75, h.z); gn.rotation.y = A.root.rotation.y + Math.sin(t * 2) * 0.2; }
      env.keyAt(5.5, 4.5, -4, 12, 0xffe2c0); camPath(cam, sm(t, 0, dur), [8.6, 2.6, 3.6], [6.4, 3.2, 1.8], [4.3, 2.8, -9.4], [4.0, 3.6, -9.0], 26, 27);
    };
  },
  // 7 "It left a little flag in its place."  — (a) it plants a tiny flag where the gnome stood, pats it, salutes; (b) Dad in the doorway at dawn-ish porch light: mug halfway to his mouth, staring at the flag.
  (S, cam) => {
    const env = dustyYard(S, { gnome: false, flag: true }); const A = astro(S, [3.2, 0, -8.6], 64); const gn = gardenGnome(S, 1.0); const Dd = dad(S, 'sleepy', [-17, 0.4, -9.3], 42);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.6]); const pl = dur * 0.22;
      if (k === 0) { Dd.root.visible = false; A.root.visible = gn.visible = true; const fy = hn([[0.1, 2.3], [pl, 0.45]], t, x => x * x); env.flag.position.set(YARD.gnome[0], fy, YARD.gnome[2]); env.flag.rotation.z = (1 - sm(t, pl, pl + 0.3)) * Math.sin(t * 30) * 0.08;
        A.pose(ps(breathe(t), anticipate(t, pl), hit([[0, { rFwd: 96, rUp: -6, lean: 14, lUp: 34, lFwd: 20 }], [pl, { rFwd: 58, rUp: -6, lean: 30, nod: 14, lUp: 34, lFwd: 20 }], [pl + 0.45, { rFwd: 20, lean: 2, lUp: 34, lFwd: 20 }], [pl + 0.85, { rFwd: 128, rUp: 28, lean: -4, nod: -6, lUp: 34, lFwd: 20 }]], t))); A.helm.blink(t);
        const lp = pinky(A, 'L'); gn.position.set(lp.x + 0.1, lp.y - 0.5, lp.z + 0.3); gn.rotation.z = 0.5; env.keyAt(5.5, 4.5, -4, 12);
        camPath(cam, lt, [7.4, 2.4, 2.4], [6.6, 2.8, 1.0], [4.4, 2.6, -9.6], [4.3, 2.9, -9.6], 28, 29); return; }
      A.root.visible = gn.visible = false; Dd.root.visible = true; env.flag.position.set(YARD.gnome[0], 0.45, YARD.gnome[2]); const sp = dur * 0.6 + (dur * 0.4) * 0.45;
      Dd.pose(ps(idle(t, 0.5), anticipate(t, sp), hit([[0, { rFwd: 96, rUp: -10, nod: 6 }], [sp, { rFwd: 104, rUp: -10, nod: 4 }], [sp + 0.25, { rFwd: 60, rUp: 10, nod: -6, lean: -8, lUp: 30 }]], t), look(lookAt(Dd, [5, 1.5, -10.4]), 0.5))); Dd.setFace(t < sp ? 'sleepy' : 'shock');
      const h = headOf(Dd); env.keyAt(-15, 6, -7, 9); faceCam(cam, lt, [h.x, h.y, h.z], 42, { dist: 8.4, lens: 32, side: -1.2, push: 1.0, look: -0.5 });
    };
  },
  // 8 "Tuesday, it dug up Mrs. Bell's flower bed."
  //   Blocking: the neighbour's garden — prize roses in a row. The visitor kneels among them and scoops dirt into a sample bag with tiny careful motions; the roses stay perfect. Camera: low push through the roses.
  (S, cam) => {
    const env = dustyYard(S, { yard: 'bell' }); const A = astro(S, [3.5, 0, -8.5], 112); const bag = dirtBag(S, 1.0); const clods = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), new THREE.MeshStandardMaterial({ color: 0x8a3e26, roughness: 1 })); S.add(m); return m; });
    return (t, dur) => { env.update(t); const sc = (t * 2.2) % 1, n = Math.floor(t * 2.2); env.hole.visible = t > dur * 0.3;
      A.pose(ps(breathe(t), { lean: 40, nod: 18, bob: -0.5, rLeg: 30, lLeg: -20, lFwd: 56, lUp: -4, rFwd: 50 + Math.sin(sc * Math.PI) * 34, rUp: -10 + Math.sin(sc * 6.28) * 8 })); A.helm.blink(t);
      const lp = pinky(A, 'L'); bag.position.set(lp.x, lp.y - 0.75, lp.z + 0.1); bag.scale.setScalar(0.7 + Math.min(n, 5) * 0.09); const rp = pinky(A, 'R');
      clods.forEach((m, i) => { const u = (sc + i * 0.13) % 1; m.position.set(lerp(rp.x, lp.x, u), rp.y + Math.sin(u * Math.PI) * 0.7, lerp(rp.z, lp.z, u)); m.visible = u < 0.9; });
      env.keyAt(6, 4, -5, 11); camPath(cam, sm(t, 0, dur), [9.6, 1.9, 1.6], [8.4, 2.3, 0.2], [4.6, 2.2, -9.2], [4.5, 2.4, -9.4], 28, 29);
    };
  },
  // 9 "It only took the dirt."  — next evening: Mrs. Bell stands over the neat square hole between two untouched prize roses, hands on hips. She looks at the hole, then at the roses, then at us: insulted.
  (S, cam) => {
    const env = dustyYard(S, { yard: 'bell', time: 'dusk', dug: true }); const B = bell(S, 'confused', [7.0, 0, -8.4], -30);
    return (t, dur) => { env.update(t); const a = dur * 0.35, b = dur * 0.68;
      B.pose(ps(idle(t, 0.7), POSES.hips, anticipate(t, a + 0.2), hit([[0, { nod: 24, turn: -18 }], [a, { nod: 24, turn: -18 }], [a + 0.3, { nod: 2, turn: -44, rUp: 62, rFwd: 30 }], [b, { nod: 2, turn: -44, rUp: 62, rFwd: 30 }], [b + 0.3, { nod: -2, turn: 28, tilt: 9, rUp: 0, rFwd: 0 }]], t)));
      B.setFace(t < a ? 'confused' : t < b ? 'thinking' : 'pout'); const h = headOf(B);
      faceCam(cam, sm(t, 0, dur), [h.x - 0.6, h.y - 0.9, h.z], -4, { dist: 13.5, lens: 28, side: 0.6, up: 0.3, push: 1.3, look: -0.2 });
    };
  },
  // 10 "Wednesday, it poked our dog with a stick."
  //   Blocking: dog (screen left) sits by its kennel, growling; the visitor (screen right) leans in at arm's length and pokes its nose with a telescopic probe. Dog: head tilt → bark; visitor hops back.
  //   Camera: side-on wide two-shot, slow push.
  (S, cam) => {
    const env = dustyYard(S); const dg = dog(S, [-0.2, 0, -7.0], 90); const A = astro(S, [5.6, 0, -7.0], -90); const st = stick(S, 2.7);
    return (t, dur) => { env.update(t); const pk = dur * 0.5; const back = bounce(t, pk + 0.15, pk + 0.75, 1, 0.9);
      place(A, 5.6 + back.u * 1.5, back.y, -7.0, -90); A.pose(ps(breathe(t), anticipate(t, pk), hit([[0, { rFwd: 60, lean: 8, lUp: 20 }], [pk - 0.3, { rFwd: 78, lean: 14, lUp: 20 }], [pk, { rFwd: 86, lean: 24, lUp: 26 }], [pk + 0.3, { rFwd: 110, lean: -12, lUp: 60, rUp: 30 }]], t), back.pose)); A.helm.blink(t);
      const p = pinky(A, 'R'); st.position.set(p.x, p.y + 0.1, p.z); st.rotation.set(0.12 * (t > pk ? 3 : 1), -Math.PI / 2, 0);
      dg.update(t, t < pk ? 'sit' : 'bark', t < pk ? 'tilt' : undefined, sm(t, pk - 0.5, pk)); env.keyAt(2.6, 4, -2.5, 12);
      camPath(cam, sm(t, 0, dur), [3.2, 2.2, 13.6], [3.2, 2.4, 12.0], [3.2, 2.4, -7], [3.3, 2.5, -7], 24, 24);
    };
  },
  // 11 "Then it wrote something down."  — (a) it flips out a clipboard and scribbles, nodding gravely, while the dog stares; (b) insert: the note.
  (S, cam) => {
    const env = dustyYard(S); const dg = dog(S, [-0.2, 0, -7.0], 90); const A = astro(S, [6.6, 0, -6.6], -52); const pad = notePad(S, NOTE, 0.9); const big = notePad(S, NOTE, 2.6); big.position.set(200, 5, 0); const L = fill(S, [200, 5.5, 4], 3, 0xfff0e0, 12); big.userData.page.userData.front.material.emissiveIntensity = 0.3;
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.52]);
      if (k === 0) { A.pose(ps(breathe(t), { lFwd: 70, lUp: -18, rFwd: 74 + Math.sin(t * 22) * 5, rUp: -20 + Math.sin(t * 17) * 6, nod: 22 + Math.sin(t * 3.1) * 5, lean: 6 })); A.helm.blink(t); const lp = pinky(A, 'L'); pad.position.set(lp.x - 0.25, lp.y + 0.35, lp.z + 0.3); pad.rotation.set(-0.7, -52 * D, 0);
        dg.update(t, 'tilt'); env.keyAt(4.6, 4.5, -2, 12); camPath(cam, lt, [3.2, 3.0, 6.4], [3.8, 3.2, 5.0], [4.6, 3.2, -6.8], [5.0, 3.4, -6.8], 28, 29); return; }
      big.rotation.set(-0.12 + Math.sin(t * 1.3) * 0.02, Math.sin(t * 0.9) * 0.05, 0.03); camPath(cam, lt, [200.2, 5.3, 8.2], [200, 5.0, 6.9], [200, 5.15, 0], [200, 4.95, 0], 30, 32);
    };
  },
  // 12 "I'm Opal. I'm fourteen."  — Opal by her window with a notebook, lamp-lit; she looks up at us, gives a two-finger salute with her pencil hand. Camera: push in to a medium close-up; telescope + window behind.
  (S, cam) => {
    const env = opalRoom(S); const A = opal(S, 'smile', [-1.5, 0, -4.6], 14); const nb = paper(S, [['IT', '800 120px "Comic Relief", cursive', '#2a2a3a', 0]], { w: 0.8, h: 1.0, tex: { top: 300 }, glow: 0.3 });
    return (t, dur) => { env.update(t); env.keyAt(0.5, 5.6, 0.5, 22); const w = dur * 0.4;
      A.pose(ps(idle(t, 0.8), anticipate(t, w), hit([[0, { lFwd: 62, lUp: -14, rFwd: 66, rUp: -18, nod: 18 }], [w, { lFwd: 62, lUp: -14, rFwd: 60, rUp: -10, nod: 0 }], [w + 0.3, { lFwd: 62, lUp: -14, rFwd: 128, rUp: 34, nod: -4, tilt: -8 }], [w + 0.9, { lFwd: 62, lUp: -14, rFwd: 70, rUp: 34, tilt: 4 }]], t)));
      A.setFace(t < w ? 'thinking' : t < w + 0.8 ? 'grin' : 'smile'); const lp = pinky(A, 'L'); nb.position.set(lp.x + 0.2, lp.y + 0.3, lp.z + 0.25); nb.rotation.set(-0.8, 0.3, 0);
      camPath(cam, sm(t, 0, dur), [1.2, 4.7, 9.6], [0.2, 4.6, 6.6], [-1.4, 4.0, -4.6], [-1.5, 4.1, -4.6], 28, 30);
    };
  },
  // 13 "And I'm the only one who wasn't scared."  — (a) from outside the glass: Opal leans on the sill, chin on her fists, grinning into the dark; (b) pan across her pin board of sketches: IT BOUNCES. ONE EYE?? FRIENDLY?
  (S, cam) => {
    const env = opalRoom(S); const A = opal(S, 'grin', [0, 0, -6.6], 180); allow(S, ['opal', 'back wall']);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.5]);
      if (k === 0) { A.pose(ps(idle(t, 0.6), { rFwd: 112, lFwd: 112, rUp: -10, lUp: -10, lean: 16, nod: -8 + Math.sin(t * 1.5) * 3, tilt: Math.sin(t * 1.1) * 5 })); A.setFace(lt < 0.6 ? 'grin' : 'mischief'); env.keyAt(0.4, 5.2, -9.4, 9);
        camPath(cam, lt, [1.9, 5.3, -13.2], [1.2, 5.2, -12.2], [0, 4.5, -6.8], [0, 4.5, -6.8], 30, 32); return; }
      A.root.visible = false; env.keyAt(4.5, 5.6, -1.6, 1.5); env.lamp.intensity = 9; camPath(cam, lt, [0.9, 5.5, -3.2], [0.9, 5.2, -0.4], [7.9, 5.5, -3.2], [7.9, 5.1, -0.3], 26);
    };
  },
  // 14 "Dad was. So Dad built traps."  — (a) dusk: Dad edges out of the back door clutching his hat, scanning the sky; (b) he hammers a stake into the lawn with grim purpose, the dog watching, Opal's window behind.
  (S, cam) => {
    const env = dustyYard(S, { time: 'dusk' }); const Dd = dad(S, 'scared', [-17, 0.4, -9.9], 30); const dg = dog(S, [0.6, 0, -5.4], -50); const wr = wrench(S, 1.2);
    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0xb88a4a })); S.add(stake); stake.castShadow = true;
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.4]);
      if (k === 0) { place(Dd, -17, 0.4, -9.9, 30); Dd.pose(ps(idle(t, 0.5), { rUp: 120, rFwd: 30, lFwd: 40, lUp: 10, lean: 10, turn: Math.sin(t * 4) * 34, nod: -12 + Math.sin(t * 3) * 6, bob: -0.15 })); Dd.setFace(Math.sin(t * 4) > 0 ? 'scared' : 'nervous'); wr.visible = stake.visible = false; dg.root.visible = false;
        const h = headOf(Dd); faceCam(cam, lt, [h.x, h.y, h.z], 30, { dist: 8.8, lens: 30, side: 0.6, push: 0.9, look: -0.6 }); return; }
      dg.root.visible = wr.visible = stake.visible = true; place(Dd, -3.4, 0, -4.4, 62); const sw = (t * 2.6) % 1; const down = sw < 0.35 ? sw / 0.35 : 1 - (sw - 0.35) / 0.65;
      Dd.pose(ps(idle(t, 0.3), { rFwd: 140 - down * 92, rUp: -8, lFwd: 40, lUp: 14, lean: 10 + down * 22, nod: 14, bob: -down * 0.12 })); Dd.setFace('determined'); const p = pinky(Dd, 'R'); wr.position.set(p.x, p.y - 0.2, p.z); wr.rotation.set(1.2 + down * 1.0, 62 * D, 0);
      stake.position.set(-1.0, 0.7 - Math.min(0.5, Math.floor(t * 2.6) * 0.14), -3.2); dg.update(t, 'tilt'); camPath(cam, lt, [2.6, 2.2, 9.4], [1.6, 2.5, 7.8], [-2.0, 2.7, -4.2], [-2.0, 2.9, -4.2], 26, 27);
    };
  },
  // 15 "A net. A pit. A very angry sprinkler."  — three quick cuts: (a) a net strung over a plate of FREE ROCKS; (b) a pit under a WELCOME mat, Dad tiptoeing backwards from it; (c) the sprinkler going berserk and chasing Dad across the lawn.
  (S, cam) => {
    const env = dustyYard(S, { time: 'dusk' }); const Dd = dad(S, 'mischief', [-9, 0, -3], 60); const net = trapNet(S, 2.2); net.position.set(7, 6.6, -4.5); const spr = sprinkler(S); spr.position.set(11.5, 0, 1.5);
    const sign = paper(S, [['FREE', '800 130px "Inter", sans-serif', '#b01e1e', 130], ['ROCKS', '800 130px "Inter", sans-serif', '#b01e1e', 0]], { w: 2.0, h: 1.5, tex: { top: 170, border: '#2a1a10' }, glow: 0.35 }); sign.position.set(7, 2.0, -4.5); const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.4, 0.14), new THREE.MeshStandardMaterial({ color: 0x8a6a4a })); post.position.set(7, 0.7, -4.6); S.add(post);
    const rocks = [[-0.5, 0], [0.4, 0.3], [0, -0.4]].map(([dx, dz]) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), new THREE.MeshStandardMaterial({ color: 0x9a4a2c, roughness: 1, flatShading: true })); m.position.set(7 + dx, 0.3, -3.2 + dz); m.castShadow = true; S.add(m); return m; });
    const pit = new THREE.Mesh(new THREE.CircleGeometry(2.0, 24), new THREE.MeshBasicMaterial({ color: 0x120a06 })); pit.rotation.x = -Math.PI / 2; pit.position.set(-5, 0.03, -3); S.add(pit);
    const mat = paper(S, [['WELCOME', '800 96px "Inter", sans-serif', '#fff6d8', 0]], { w: 3.2, h: 1.9, tex: { top: 200, bg: '#7a4a2a', stain: false, border: '#fff6d8' }, glow: 0.2 }); mat.rotation.x = -Math.PI / 2; mat.position.set(-5, 0.08, -2.2);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.3, 0.56]); net.rotation.z = Math.sin(t * 2.2) * 0.07; spr.userData.spray(t, k === 2 ? 1 : 0);
      if (k === 0) { Dd.root.visible = false; camPath(cam, lt, [8.6, 1.8, 3.8], [8.0, 2.6, 2.6], [7, 3.0, -4.5], [7, 3.8, -4.5], 24, 26); return; }
      Dd.root.visible = true;
      if (k === 1) { place(Dd, lerp(-8.6, -10.2, lt), 0, -3.4, 76); Dd.pose(ps(walk(-t, 0.6, 22), { rUp: 46, lUp: 46, rFwd: 20, lFwd: 20, lean: -6, bob: 0.1 }, look(lookAt(Dd, [-5, 0, -3]), 0.6))); Dd.setFace('mischief'); mat.position.y = 0.08 + Math.sin(t * 6) * 0.01;
        camPath(cam, lt, [-5.6, 3.2, 10], [-6.0, 3.4, 8.8], [-6.8, 2.0, -3], [-7.0, 2.2, -3], 24, 24); return; }
      const rx = lerp(8.5, 2.5, lt); place(Dd, rx, Math.abs(Math.sin(t * 9)) * 0.25, 0.6, -90); Dd.pose(ps(walk(t, 1.5, 46), { rUp: 120, lUp: 130, lean: 16, turn: 40, nod: -6 })); Dd.setFace('scared'); spr.rotation.y = Math.sin(t * 7) * 0.3;
      camPath(cam, lt, [8.6, 1.8, 13.5], [7.4, 2.1, 12.8], [8.2, 2.8, 1], [6.4, 2.8, 1], 22, 22);
    };
  },
  // 16 "They caught the mailman. Twice."  — (a) the mailman hangs in the net like a sack, slowly turning, deadpan, letters fluttering down; (b) "Twice." — same mailman waist-deep in the pit, being watered by the sprinkler. Dad waves an apologetic hand.
  (S, cam) => {
    const env = dustyYard(S, { time: 'dusk' }); const Mm = mail(S, 'bored', [7, 4.4, -4.5], 0); const net = trapNet(S, 2.5); const spr = sprinkler(S); spr.position.set(-1.6, 0, -2.2); const Dd = dad(S, 'nervous', [-10.4, 0, -4.2], 58);
    const pit = new THREE.Mesh(new THREE.CircleGeometry(2.0, 24), new THREE.MeshBasicMaterial({ color: 0x120a06 })); pit.rotation.x = -Math.PI / 2; pit.position.set(-5, 0.03, -3); S.add(pit);
    const letters = [0, 1, 2, 3, 4].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.38), new THREE.MeshStandardMaterial({ color: 0xfbf6e6, side: THREE.DoubleSide, emissive: 0x6a6a60 })); S.add(m); return m; });
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.56]); spr.userData.spray(t, k === 1 ? 1 : 0); S.userData.allowContact = [['mailman', '*']];
      if (k === 0) { Dd.root.visible = false; const sw = Math.sin(t * 1.6) * 0.22; net.position.set(7 + sw * 2, 5.0, -4.5); net.rotation.z = -sw; net.rotation.y = t * 0.6; place(Mm, 7 + sw * 2, 3.1, -4.5, t * 0.6 / D + 20); Mm.root.rotation.z = -sw; Mm.pose(ps(HUDDLE, { rLeg: 70, lLeg: 84, rUp: 30, lUp: 20, nod: 8, tilt: 10 })); Mm.setFace(lt < 0.6 ? 'bored' : 'sleepy');
        letters.forEach((m, i) => { const u = (t * 0.5 + i * 0.2) % 1; m.visible = true; m.position.set(7 + Math.sin(i * 2 + u * 5) * 1.4, 3.2 - u * 3.2, -4.5 + Math.cos(i * 3) * 0.8); m.rotation.set(u * 5 + i, u * 3, i); });
        env.keyAt(7.5, 4.5, 0.5, 10); camPath(cam, lt, [8.2, 2.8, 5.6], [7.8, 3.2, 4.4], [7, 4.2, -4.5], [7, 4.4, -4.5], 26, 28); return; }
      net.visible = false; letters.forEach(m => { m.visible = false; }); Dd.root.visible = true; place(Mm, -5, -2.7, -3, 16); Mm.root.rotation.z = 0; Mm.pose(ps(idle(t, 0.3), { rUp: 62, lUp: 62, rFwd: 30, lFwd: 30, nod: 4, tilt: Math.sin(t * 1.2) * 3 })); Mm.setFace(lt < 0.5 ? 'bored' : 'angry');
      Dd.pose(ps(idle(t, 0.6), { rUp: 140 + Math.sin(t * 9) * 12, rFwd: 16, lFwd: 20, tilt: -8, lean: 4 }, look(lookAt(Dd, [-5, 2, -3]), 0.7))); Dd.setFace('nervous');
      env.keyAt(-5, 4, 2.5, 8); camPath(cam, lt, [-6.2, 2.8, 12], [-6.6, 3.0, 10.6], [-7.2, 2.4, -3.2], [-7.4, 2.5, -3.2], 24, 24);
    };
  },
  // 17 "Me? I just watched from my window."  — night: the lit window in the dark house wall, Opal framed in it with her chin on her arms, eyes tracking something on the lawn. Camera: slow push in from the lawn.
  (S, cam) => {
    const env = dustyYard(S); const A = opal(S, 'softsmile', [-8, -0.1, -13.6], 0); allow(S, ['opal', 'house wall']);
    return (t, dur) => { env.update(t); A.pose(ps(idle(t, 0.6), { rFwd: 96, lFwd: 96, rUp: -24, lUp: -24, lean: 12, nod: 4, turn: lerp(34, -6, sm(t, 0.2, dur * 0.8)), tilt: 5 })); A.setFace(t < dur * 0.55 ? 'softsmile' : 'awe'); env.keyAt(-7.2, 5.6, -10.8, 7);
      camPath(cam, sm(t, 0, dur), [-3.0, 3.0, 3.0], [-5.8, 4.3, -3.2], [-8, 5.0, -12.5], [-8, 5.05, -12.5], 30, 34);
    };
  },
  // 18 "It bounced when it walked."  — the visitor crosses the whole lawn in three enormous floaty hops, arms out for balance, clearly enjoying it. Camera: lateral track, low, keeping it on the left third then letting it lead.
  (S, cam) => {
    const env = dustyYard(S); const A = astro(S, [-7, 0, -4.6], 72);
    return (t, dur) => { env.update(t); const b = bounce(t, 0, dur, 3, 2.4); const x = lerp(-7, 11, b.u); place(A, x, b.y, -4.6, 72); A.pose(ps(b.pose, { rUp: 30 + b.y * 14, lUp: 30 + b.y * 14, tilt: Math.sin(t * 3) * 6, rLegOut: b.y * 5, lLegOut: b.y * 5 })); A.helm.blink(t); env.follow(x); env.keyAt(x + 1, 4.5, 2, 12, 0xcfe0ff);
      camPath(cam, t / dur, [-5, 2.2, 13], [10, 2.4, 12.2], [-5.5, 4.0, -4.6], [10.5, 4.2, -4.6], 24);
    };
  },
  // 19 "Honestly? It looked kind of happy."  — (a) it lines up a selfie with our mailbox: flash! then a delighted heel-click hop; (b) Opal at her window, trying not to laugh.
  (S, cam) => {
    const env = dustyYard(S); const A = astro(S, [11.4, 0, -8.6], 18); const cm = astroCamera(S); const O = opal(S, 'softsmile', [-8, -0.1, -13.6], 16); allow(S, ['opal', 'house wall']);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.6]); const fl = dur * 0.26;
      if (k === 0) { const hop = bounce(t, fl + 0.25, fl + 1.0, 1, 1.5); place(A, 11.4, hop.y, -8.6, 18); A.pose(ps(breathe(t), t < fl + 0.25 ? { rFwd: 96, rUp: -18, lUp: 44, tilt: -14, lean: -4, bodyTilt: -6 } : ps(hop.pose, { rUp: 150, lUp: 150, rLegOut: hop.y * 14, lLegOut: hop.y * 14 }))); A.helm.blink(t);
        const p = pinky(A, 'R'); cm.position.set(p.x, p.y + 0.2, p.z + 0.25); cm.rotation.y = Math.PI + 0.2; cm.userData.flash(Math.max(0, 1 - Math.abs(t - fl) * 9)); env.keyAt(11, 4.5, -3, 12, 0xcfe0ff);
        camPath(cam, lt, [11.4, 3.2, 5.6], [11.9, 3.5, 4.0], [12.4, 3.6, -9], [12.5, 3.9, -9], 26, 26); return; }
      cm.userData.flash(0); O.pose(ps(idle(t, 0.6), { rFwd: 96, lFwd: 96, rUp: -24, lUp: -24, lean: 10, turn: 22, bob: lt > 0.5 ? Math.abs(Math.sin(t * 12)) * 0.04 : 0 })); O.setFace(lt < 0.45 ? 'softsmile' : 'laugh'); env.keyAt(-7.0, 5.4, -10.6, 8);
      camPath(cam, lt, [-6.6, 4.9, -6.4], [-6.9, 5.0, -7.2], [-8, 4.75, -13], [-8, 4.75, -13], 38, 40);
    };
  },
  // 20 "Then it took my brother's bike."  — it bounces off toward the gate with Finn's bike held over its head; Finn (bike helmet on, no bike) chases with both arms out, wailing.
  //   Blocking: visitor leads (screen right), Finn follows (screen left), both moving left→right. Camera: tracking wide.
  (S, cam) => {
    const env = dustyYard(S, { bike: false }); const A = astro(S, [0, 0, -6.5], 74); const F = finn(S, 'cry', [-8, 0, -5.6], 80); const bk = kidBike(S);
    return (t, dur) => { env.update(t); env.gate.userData.open(1); const b = bounce(t, 0, dur, 3, 1.7); const x = lerp(-1, 8.6, b.u); place(A, x, b.y, lerp(-6.2, -9.4, b.u), 74); A.pose(ps(b.pose, { rUp: 150, lUp: 150, rFwd: 10, lFwd: 10 })); A.helm.blink(t);
      const h = headOf(A); bk.position.set(h.x, h.y + 1.25, h.z); bk.rotation.set(0, 74 * D - Math.PI / 2, Math.sin(t * 5) * 0.08);
      const fx = lerp(-9, -3.4, t / dur); place(F, fx, 0, -5.8, 80); F.pose(ps(walk(t, 1.5, 44), { rFwd: 84, lFwd: 84, rUp: 10, lUp: 10, lean: 12, nod: -10 })); F.setFace(Math.sin(t * 6) > 0 ? 'cry' : 'angry'); env.follow(x - 4); env.keyAt(x - 4, 4.5, 2, 12, 0xcfe0ff);
      const mx = (x + fx) / 2; camPath(cam, t / dur, [mx, 2.6, 14], [mx + 1, 2.8, 13.2], [mx, 3.8, -7], [mx, 4.0, -7], 22);
    };
  },
  // 21 "The barbecue. The whole mailbox."  — (a) it hops past hugging the barbecue, lid clanking; (b) it braces a boot on the post and yanks our mailbox clean out of the ground, POP, and tucks it under one arm.
  (S, cam) => {
    const env = dustyYard(S, { bike: false, bbq: false }); const A = astro(S, [16, 0, -4], -70); const bq = kettleBbq(S);
    return (t, dur) => { env.update(t); env.gate.userData.open(1); const [k, lt] = seg(t, dur, [0.4]);
      if (k === 0) { const b = bounce(t, 0, dur * 0.4, 2, 1.3); place(A, lerp(17, 11.5, b.u), b.y, lerp(-3.4, -5.6, b.u), -70); A.pose(ps(b.pose, { rFwd: 70, lFwd: 70, rUp: -6, lUp: -6, lean: -8 })); A.helm.blink(t); const h = hands(A); bq.position.set(h.x - 0.5, h.y - 2.3, h.z + 0.3); bq.userData.lid.rotation.z = Math.sin(t * 16) * 0.12 * (b.y < 0.3 ? 1 : 0.2); bq.userData.lid.position.y = 2.52 + (b.y < 0.2 ? 0.14 : 0);
        env.keyAt(13, 4.5, 2, 12, 0xcfe0ff); camPath(cam, lt, [12.8, 2.4, 10], [11.8, 2.6, 9], [15.5, 3.2, -4.2], [12.6, 3.3, -5.2], 24); return; }
      bq.visible = false; const pull = (dur * 0.4) + (dur * 0.6) * 0.5; place(A, 11.9, 0, -9.3, 78); const pk = hn([[pull, 0], [pull + 0.22, 1]], t);
      A.pose(ps(breathe(t), anticipate(t, pull, 2), hit([[0, { rFwd: 80, lFwd: 80, lean: 14, rLeg: 30 }], [pull - 0.1, { rFwd: 84, lFwd: 84, lean: 22, rLeg: 30, bob: -0.2 }], [pull + 0.25, { rFwd: 110, lFwd: 110, lean: -22, rLeg: -10 }], [pull + 0.8, { rFwd: 40, lFwd: 20, rUp: 26, lean: 0 }]], t))); A.helm.blink(t);
      const mb = env.mailbox; if (pk < 0.01) { mb.position.set(...YARD.mailbox); mb.rotation.set(0, -0.3, Math.sin(t * 34) * 0.05 * sm(t, pull - 0.6, pull)); } else { const h = hands(A); const u = sm(t, pull + 0.3, pull + 0.8); mb.position.set(lerp(13.6, h.x + 0.8, u), lerp(1.4 * pk, h.y - 2.6, u), lerp(-9.6, h.z + 0.3, u)); mb.rotation.set(0, -0.3, -0.5 * pk - u * 0.6); }
      env.keyAt(12, 4.5, -4, 12, 0xcfe0ff); camPath(cam, lt, [11.4, 2.6, 5.0], [11.9, 3.0, 3.4], [12.9, 3.0, -9.5], [13.0, 3.3, -9.5], 26, 26); shake(cam, t, pull + 0.05, 0.6);
    };
  },
  // 22 "And on Friday night, it came to my window."
  //   Blocking: Opal in the foreground-left, sketching under the lamp, back half-turned to the window. Behind her the helmet rises slowly into the window frame from below, gold visor first. She feels it, freezes, and turns.
  //   Camera: slow push past her shoulder toward the window (dread: the audience sees it before she does).
  (S, cam) => {
    const env = opalRoom(S); const O = opal(S, 'thinking', [-2.4, 0, -1.0], 22); const A = astro(S, [0.3, -4.2, -10.5], 0);
    return (t, dur) => { env.update(t); env.keyAt(-1.0, 5.4, 3.0, 20); const rise = sm(t, dur * 0.12, dur * 0.6); place(A, 0.3, lerp(-4.4, 0, rise), -10.5, 0); A.pose(ps(breathe(t), { turn: lerp(-30, 0, sm(t, dur * 0.5, dur * 0.8)) })); A.helm.glow(1.0 + Math.sin(t * 3) * 0.15); A.helm.blink(t);
      const tu = dur * 0.72; O.root.rotation.y = lerp(22, 128, sm(t, tu, tu + 0.5)) * D; O.pose(ps(idle(t, 0.5), t < tu - 0.3 ? { lFwd: 64, lUp: -12, rFwd: 70 + Math.sin(t * 15) * 4, rUp: -16, nod: 20 } : hit([[tu - 0.3, { lFwd: 64, rFwd: 70, nod: 20 }], [tu - 0.05, { lFwd: 50, rFwd: 50, nod: -4, bob: 0.06 }], [tu + 0.5, { lFwd: 30, rFwd: 30, rUp: 20, lUp: 20, nod: -4, turn: -40 }]], t))); O.setFace(t < tu - 0.3 ? 'thinking' : t < tu + 0.1 ? 'nervous' : 'shock');
      camPath(cam, sm(t, 0, dur), [1.8, 4.9, 9.8], [1.0, 5.0, 7.2], [-1.5, 4.7, -5], [-0.6, 5.0, -8], 26, 28);
    };
  },
  // 23 "It tapped. Three times."  (also the HOOK)  — (a) from inside: the gold visor presses right up to the glass, filling the window; one gloved finger comes up and taps: tok, tok, tok.
  //   (b) over its shoulder, through the glass: Opal frozen in the lamp light — shock, a swallow, then the tiniest wave back.
  (S, cam) => {
    const env = opalRoom(S); const O = opal(S, 'shock', [-1.0, 0, -5.0], 180); const A = astro(S, [0.3, 0, -10.5], 0); allow(S, ['visitor', 'back wall']);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.56]); const inn = sm(t, 0, dur * 0.14); const taps = [0.22, 0.31, 0.40].map(f => Math.max(0, 1 - Math.abs(t - dur * f) / 0.09)); const tp = Math.max(...taps);
      place(A, 0.3, -0.25, lerp(-10.5, -9.55, inn), 0); A.pose(ps(breathe(t), { lean: 10 * inn, nod: -2, rFwd: sm(t, dur * 0.12, dur * 0.2) * (100 + tp * 12), rUp: -14, tilt: sm(t, dur * 0.42, dur * 0.5) * 9 })); A.helm.glow(1.1 + Math.sin(t * 4) * 0.15 + tp * 0.3); A.helm.blink(t);
      if (k === 0) { O.root.visible = false; env.keyAt(0.2, 5.6, -7.4, 4, 0xffd890); camPath(cam, lt, [0.5, 5.2, -1.6], [0.2, 5.25, -3.6], [0.25, 5.2, -9.5], [0.25, 5.25, -9.5], 36, 42); cam.position.x += Math.sin(t * 40) * 0.03 * tp; return; }
      O.root.visible = true; const w = dur * 0.8; O.pose(ps(idle(t, 0.3), hit([[0, { rUp: 26, lUp: 26, rFwd: 20, lFwd: 20, lean: -8, nod: -4 }], [w, { rUp: 24, lUp: 24, rFwd: 20, lFwd: 20, lean: -8, nod: -4, bob: -0.04 }], [w + 0.3, { rUp: 26, rFwd: 100, lUp: 10, lean: -4 }]], t), t > w + 0.25 ? { rUp: Math.sin(t * 13) * 8 } : {})); O.setFace(t < dur * 0.7 ? 'shock' : t < w ? 'nervous' : 'fakesmile');
      env.keyAt(-0.6, 5.2, -7.3, 20); camPath(cam, lt, [5.6, 5.7, -14.4], [5.2, 5.6, -13.8], [-1.0, 4.5, -5.2], [-1.0, 4.5, -5.2], 28, 30);
    };
  },
  // 24 "That's it," said Dad. "Tonight, we catch it."  — (a) close on Dad at dusk, net over his shoulder, finger jabbing the air, moustache bristling; (b) wide: Finn salutes, Opal's hand slides down her face, the dog yawns.
  (S, cam) => {
    const env = dustyYard(S, { time: 'dusk', bike: false, bbq: false, mailbox: false }); const Dd = dad(S, 'angry', [2.4, 0, -3.5], -8); const O = opal(S, 'bored', [7.6, 0, -3.9], -34); const F = finn(S, 'determined', [-2.0, 0, -3.3], 30); const dg = dog(S, [-4.6, 0, -1.6], 40);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.55]);
      Dd.pose(ps(idle(t, 0.7), talk(t, 1.3), hit([[0, { rUp: 30, rFwd: -6, lUp: 28, lFwd: -8 }], [0.35, { rFwd: 118, rUp: 24, lUp: 28, lFwd: -8, lean: 6 }], [dur * 0.5, { rFwd: 104, rUp: 30, lUp: 28, lFwd: -8, lean: 8 }], [dur * 0.5 + 0.3, { rUp: 152, rFwd: 10, lUp: 28, lFwd: -8, lean: -4, nod: -8 }]], t), t < dur * 0.5 ? { rFwd: Math.sin(t * 10) * 8 } : {})); Dd.setFace(t < dur * 0.5 ? 'angry' : 'determined');
      F.pose(ps(idle(t, 0.6, 2), hit([[dur * 0.6, POSES.rest], [dur * 0.6 + 0.25, { rFwd: 128, rUp: 34, nod: -8 }]], t), look(lookAt(F, eye(Dd)), 0.6))); F.setFace(t < dur * 0.6 ? 'awe' : 'determined');
      O.pose(ps(idle(t, 0.6, 4), hit([[dur * 0.66, { rUp: 26, lUp: 26, rFwd: -8, lFwd: -8 }], [dur * 0.66 + 0.4, { rFwd: 126, rUp: 6, lUp: 26, lFwd: -8, nod: 14, tilt: 6 }]], t))); O.setFace(t < dur * 0.66 ? 'bored' : 'sleepy'); dg.update(t, 'sit', 'sleep', sm(t, dur * 0.6, dur * 0.9));
      if (k === 0) { const h = headOf(Dd); faceCam(cam, lt, [h.x, h.y, h.z], -8, { dist: 9.6, lens: 30, side: -0.6, up: -0.5, push: 1.2, look: -0.4 }); return; }
      camPath(cam, lt, [2.2, 3.0, 17.4], [2.4, 3.3, 15.6], [2.3, 3.4, -3.5], [2.3, 3.5, -3.5], 22);
    };
  },
  // 25 "At midnight, it bounced right into Dad's net."  — night: it hops in through the gate on its usual path; on the second landing the net drops over it from above. Dad springs out from behind the kennel, both fists up.
  //   Blocking: visitor centre-right, Dad screen left by the kennel. Camera: wide, slight push, jolt on the drop.
  (S, cam) => {
    const env = dustyYard(S, { bike: false, bbq: false, mailbox: false }); const A = astro(S, [10.6, 0, -11], -55); const Dd = dad(S, 'mischief', [-3.4, 0, -6.6], 48); const net = trapNet(S, 3.2);
    return (t, dur) => { env.update(t); env.landing(1.5, t); env.gate.userData.open(1); const drop = dur * 0.56; const b = bounce(t, 0, drop, 2, 1.5); place(A, lerp(10.6, 5.0, b.u), t < drop ? b.y : Math.abs(Math.sin((t - drop) * 7)) * 0.5, lerp(-11, -5.0, b.u), -55);
      A.pose(ps(t < drop ? b.pose : { rUp: 60 + Math.sin(t * 14) * 30, lUp: 60 + Math.cos(t * 12) * 30, turn: Math.sin(t * 8) * 40, rFwd: 20, lFwd: 20 }, breathe(t))); A.helm.blink(t);
      const ny = hn([[drop - 0.25, 16], [drop + 0.12, 3.5]], t, x => x * x); net.position.set(5.0, ny + (t > drop ? A.root.position.y : 0), -5.0); net.userData.rope(14); net.rotation.y = t * 0.3;
      Dd.pose(ps(idle(t, 0.6), t < drop ? { lean: 24, bob: -0.5, rLeg: 30, lLeg: 30, rFwd: 40, lFwd: 40, nod: -14 } : hit([[drop, { lean: 24, bob: -0.5 }], [drop + 0.3, { rUp: 156, lUp: 156, lean: -8, nod: -12, bob: 0.25 }], [drop + 0.6, { rUp: 150, lUp: 150, lean: -4, nod: -10 }]], t))); Dd.setFace(t < drop ? 'mischief' : 'delighted');
      env.keyAt(2, 5, 1, 13, 0xdfe6ff); camPath(cam, sm(t, 0, dur), [1.2, 2.6, 15.5], [1.0, 3.0, 13.8], [1.2, 3.8, -6], [1.0, 3.8, -5.6], 22); shake(cam, t, drop + 0.1, 0.8);
    };
  },
  // 26 "And kept bouncing. With the net. And with Dad."  — (a) the netted visitor bounces merrily on toward the gate, not even slowing down; (b) wide: out through the gate it goes, the rope goes taut, and Dad — still holding on —
  //   is towed along on his belly, hat flying. Opal, foreground left, turns her head to watch him go by. Deadpan.
  (S, cam) => {
    const env = dustyYard(S, { bike: false, bbq: false, mailbox: false }); const A = astro(S, [5, 0, -5], 60); const Dd = dad(S, 'scared', [-1, 0, -5], 60); const net = trapNet(S, 3.2); const O = opal(S, 'bored', [-1.6, 0, 1.6], 20);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), new THREE.MeshStandardMaterial({ color: 0xd8c898, roughness: 1 })); S.add(rope); Dd.root.rotation.order = 'YXZ';
    return (t, dur) => { env.update(t); env.landing(1.6, t); env.gate.userData.open(1); const [k, lt] = seg(t, dur, [0.36]); const b = bounce(t, 0, dur, 4, 1.6); const ax = lerp(4.2, 12.4, b.u), az = lerp(-5, -13.4, Math.pow(b.u, 1.3));
      place(A, ax, b.y, az, 50); A.pose(ps(b.pose, { rUp: 50, lUp: 50 })); A.helm.blink(t); net.userData.rope(0.01); net.position.set(ax, 3.5 + b.y, az); net.rotation.y = t * 0.4;
      const lag = clamp01(b.u - 0.24); const dx = lerp(-2.0, 12.4, lag) - 0.0, dz = lerp(-4.2, -13.4, Math.pow(lag, 1.3)); const drag = sm(t, dur * 0.3, dur * 0.42); const hop = Math.abs(Math.sin(t * 6.3)) * 0.6 * drag;
      place(Dd, lerp(-3.2, dx, drag), 0.2 * drag + hop + (1 - drag) * 0, lerp(-5.6, dz + 2.2, drag), 52); Dd.root.rotation.x = 1.32 * drag; Dd.pose(ps({ rUp: 150 + 20 * drag, lUp: 150 + 20 * drag, rLeg: Math.sin(t * 13) * 26 * drag, lLeg: -Math.sin(t * 13) * 26 * drag, nod: -30 * drag })); Dd.setFace(drag < 0.5 ? 'shock' : 'scared');
      const p1 = hands(Dd), p2 = new THREE.Vector3(ax, 1.2 + b.y, az); rope.position.copy(p1).lerp(p2, 0.5); rope.scale.y = p1.distanceTo(p2); rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      O.pose(ps(idle(t, 0.5), POSES.hips, look(lookAt(O, [Dd.root.position.x, 1.5, Dd.root.position.z]), 0.9))); O.setFace(lt < 0.5 || k === 0 ? 'bored' : 'smirk'); env.follow(ax - 3); env.keyAt(ax - 2, 5, 0, 13, 0xdfe6ff);
      if (k === 0) { O.root.visible = false; camPath(cam, lt, [ax - 1.5, 2.6, 4.6], [ax - 0.8, 2.8, 4.2], [ax, 3.6, az], [ax, 3.6, az], 26); return; }
      O.root.visible = true; camPath(cam, lt, [1.6, 3.6, 12.6], [2.6, 3.8, 11.4], [4.6, 3.0, -7], [6.0, 3.0, -8], 22);
    };
  },
  // 27 "So I followed it. Alone."  — Opal crosses the dark lawn to the open gate with a flashlight; she stops, glances back at the house (worried), sets her jaw, and goes through.
  //   Camera: tracks with her left→right, medium, the glow beyond the fence ahead of her.
  (S, cam) => {
    const env = dustyYard(S, { bike: false, bbq: false, mailbox: false }); const O = opal(S, 'worried', [3, 0, -9.2], 78); const tc = handTorch(S);
    return (t, dur) => { env.update(t); env.landing(1.7, t); env.gate.userData.open(1); const stop = dur * 0.5, go = dur * 0.74; const u = sm(t, 0, stop), v = sm(t, go, dur);
      const x = lerp(3.4, 9.6, u) + v * 1.1, z = -9.2 - v * 2.6; place(O, x, 0, z, lerp(78, 150, v)); const moving = (t < stop - 0.1) || t > go;
      O.pose(ps(moving ? walk(t, 0.8, 30) : idle(t, 0.6), { rFwd: 58, rUp: -6, lean: moving ? 6 : 0 }, t > stop && t < go ? hit([[stop, {}], [stop + 0.3, { turn: -62, nod: 4 }], [go - 0.25, { turn: -62, nod: 4 }], [go, { turn: 0, nod: -4 }]], t) : {})); O.setFace(t < stop + 0.3 ? 'worried' : t < go - 0.1 ? 'nervous' : 'determined');
      const p = pinky(O, 'R'); tc.position.set(p.x, p.y + 0.1, p.z); tc.rotation.set(0.15, O.root.rotation.y, 0); tc.userData.on(1); env.follow(x - 3); env.keyAt(x - 0.5, 5, -4.5, 12);
      camPath(cam, sm(t, 0, dur), [3.6, 3.4, 5.0], [8.6, 3.6, 3.0], [x, 3.6, -9.6], [x, 3.7, -9.8], 28, 28);
    };
  },
];
