// Episode 022 (The Tenant Downstairs) — lines 29–58: the cavern, the receipt, the ledger, the plates, the lease, the eviction, Fridays.
import * as THREE from 'three';
import { POSES, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, track, sitGround, SIT,
  marrowStreet, cellarHall, hoardCavern, ledgerBeast, CAVE, cellarArm, monsterHand, paper, plateOf, lasagnaTray, spade, handTorch, goldCoin, goldSack, bigPencil } from '../../engine/kit.js';
import { dana, crane, diva, ps, ramp, sm, lerp, V, headOf, faceCam, fill, allow, hold, hands, hn, shake, rumble, arc, clamp01, eye } from './common.js';
import { receipt, opArm } from './shots_a.js';

const DN = CAVE.dana, CR = CAVE.crane, EYES = [0, 18.7, -8.7];
// the cavern with the tenant in it. lit 0 = dark (only what `eyes` gives), 1 = the banker's lamp is on.
function cave(S, { lit = 0, eyes = 0, glasses = false, brow = 0 } = {}) { const env = hoardCavern(S); const B = ledgerBeast(S); B.root.position.set(...CAVE.beast); env.set(lit); env.eyes(Math.max(eyes, lit * 0.25)); B.eyes(eyes > 0 || lit > 0 ? 1 : 0, lit ? 0.2 : eyes); B.glasses(glasses); B.brow(brow); B.reach('R'); B.reach('L'); return { env, B }; }
// put the beast's claw tips (its hold point) on world point H
function reachHold(B, side, H, opts = {}) { const h = new THREE.Vector3(...H), W = h.clone(); for (let i = 0; i < 4; i++) { B.reach(side, W, opts); const tp = B.tip(side); W.add(h.clone().sub(tp)); } B.reach(side, W, opts); }
const lookB = (A, k = 1) => { const l = lookAt(A, EYES); return { turn: l.turn * k, nod: l.nod * k }; };
const coinFall = (S, n) => { const cs = []; for (let i = 0; i < n; i++) cs.push(goldCoin(S, 0.26)); return (t, from, floorY, k = 1, spread = 0.5) => cs.forEach((c, i) => { const u = (t * 1.3 + i / n) % 1; c.visible = k > 0 && u < k; c.position.set(from[0] + Math.sin(i * 2.1) * spread * u, lerp(from[1], floorY, u * u), from[2] + Math.cos(i * 1.7) * spread * u); c.rotation.set(t * 9 + i, i, t * 7); }); };
const leaseLines = [['LEASE', '800 70px Georgia, serif', '#2a1a10', 58], ['— last page —', 'italic 32px Georgia', '#5a4a3a', 76], ['OWNER OF', '700 46px Georgia', '#2a1a10', 60], ['NINE MARROW STREET:', '700 46px Georgia', '#2a1a10', 110], ['THE TENANT', '800 82px "Inter", sans-serif', '#b01e1e', 88], ['DOWNSTAIRS', '800 82px "Inter", sans-serif', '#b01e1e', 90], ['since 1626', 'italic 40px Georgia', '#5a4a3a', 50]];
const LEASE = [-2.6, 10.4, -2.4];
function leaseRig(S, B) { const pg = paper(S, leaseLines, { w: 3.6, h: 5.0, tex: { top: 96, border: '#8a6a4a' }, glow: 0.12 }); pg.position.set(...LEASE); pg.rotation.x = -0.12; pg.userData.front.material.color.setHex(0x9a948a); pg.userData.front.material.emissiveIntensity = 0.05;
  const th = new THREE.Mesh(new THREE.BoxGeometry(3.9, 2.3, 0.7), new THREE.MeshStandardMaterial({ color: 0x2c6878, roughness: 0.9 })); th.castShadow = true; S.add(th); const nl = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0xf2e8c8, roughness: 0.35 })); nl.rotation.z = Math.PI / 2; nl.position.x = -2.5; th.add(nl);
  const cover = (k) => { th.position.set(LEASE[0] + 0.3 + (1 - k) * 5.2, LEASE[1] - 1.05, LEASE[2] + 0.42); th.rotation.z = (1 - k) * -0.3; }; cover(1);
  reachHold(B, 'R', [LEASE[0] - 1.6, LEASE[1] - 2.6, LEASE[2] + 0.1], { face: [0, 0, 1] }); B.grip('R', 0.5); return { pg, cover }; }

export const SHOTS_B = [
  // 29 "In the dark, something breathed."  — pitch dark: Dana at the foot of the stairs, dead flashlight in her fist, and behind her something the size of the building breathes out. She goes very, very still.
  //   Blocking: Dana foreground right facing us; the beast is only a rim-lit shape behind her (eyes shut). Camera: low, slow push; a cloud of breath rolls over her.
  (S, cam) => {
    const { env, B } = cave(S); const A = dana(S, 'nervous', DN, 0); const fl = fill(S, [4.4, 4.6, 11], 26, 0x9ab8ff, 12); const tc = handTorch(S); tc.userData.on(0);
    const puffs = [0, 1, 2, 3, 4].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: 0x5a6a90, transparent: true, opacity: 0, depthWrite: false })); S.add(m); return m; });
    return (t, dur) => { env.update(t); B.update(t, { breathe: 3.2, blink: false }); const g = dur * 0.3;
      puffs.forEach((m, i) => { const u = clamp01((t - g - i * 0.12) / 1.6); m.position.set(lerp(0.5, 3.8, u) + Math.sin(i * 2) * 0.8, lerp(13, 4.6, u) + Math.cos(i * 3) * 0.5, lerp(-7, 9, u)); m.scale.setScalar(1.2 + u * 2.2); m.material.opacity = u > 0 && u < 1 ? 0.035 * Math.sin(u * Math.PI) : 0; });
      A.pose(ps(idle(t, 0.4), { rFwd: 26, rUp: 6, lUp: 8 }, t < g + 0.5 ? { turn: -24 + sm(t, 0, g) * 40, nod: -4 } : hit([[g + 0.5, { turn: 16 }], [g + 0.8, { turn: 0, nod: 2, rUp: 16, lUp: 18, bob: 0.08, lean: -4 }]], t), t > g + 0.6 ? { tilt: Math.sin(t * 30) * 0.8 } : {}));
      A.setFace(t < g + 0.55 ? 'nervous' : 'scared'); const hp = pinky(A, 'R'); tc.position.set(hp.x, hp.y, hp.z + 0.2); tc.rotation.x = 0.9;
      camPath(cam, sm(t, 0, dur), [4.9, 1.8, 15.8], [4.4, 2.2, 13.6], [2.6, 6.8, -2], [2.4, 7.6, -4], 24, 26);
    };
  },
  // 30 "Two eyes opened. Each one bigger than me."  — (a) low front: two enormous eyes open in the dark above Dana, her face lit gold from behind, and she turns; (b) reverse, over her shoulder: the eyes fill the frame and look down at her.
  (S, cam) => {
    const { env, B } = cave(S, { brow: -0.5 }); const A = dana(S, 'scared', DN, 0); const fl = fill(S, [4.4, 4.6, 11], 14, 0x9ab8ff, 12);
    return (t, dur) => { env.update(t); B.update(t, { breathe: 2.2, blink: false }); const [k, lt] = seg(t, dur, [0.5]); const o = hn([[0.1, 0], [0.75, 1]], t, x => x * x * (3 - 2 * x)); B.eyes(o, o); env.eyes(o * 0.8);
      const tn = sm(t, dur * 0.3, dur * 0.5); A.root.rotation.y = tn * 180 * D; fl.intensity = 14 * (1 - tn * 0.7); B.look(V([DN[0], 4.6, DN[2]])); B.head.rotation.x = 0.1 * sm(t, dur * 0.5, dur);
      A.pose(ps(idle(t, 0.3), k === 0 ? { rUp: 14, lUp: 16, nod: lerp(0, -26, tn), tilt: Math.sin(t * 30) * 0.8 } : { rUp: 20, lUp: 22, rFwd: 16, lFwd: 16, lean: -8 - sm(t, dur * 0.5, dur) * 4, nod: -34 }));
      A.setFace(t < dur * 0.18 ? 'scared' : 'shock');
      if (k === 0) camPath(cam, lt, [4.4, 1.3, 13.4], [4.2, 1.5, 12.6], [3.4, 6.5, 4], [3.3, 6.9, 4], 30, 30);
      else camPath(cam, lt, [6.0, 3.9, 12.2], [5.5, 4.3, 11.2], [0.6, 17.6, -8.7], [0.4, 18.2, -8.7], 27, 29);
    };
  },
  // 31 "Mr. Crane swung the shovel."  — side-on: Crane charges the giant claws planted on the floor and brings the shovel down with everything he has — CLANG.
  //   Blocking: Crane runs screen right at the beast's planted hand (screen right); the lamp, lectern and ledger behind him. Camera: low, tracking in with the charge, shake on the hit.
  (S, cam) => {
    const { env, B } = cave(S, { eyes: 1, brow: -0.7 }); const C = crane(S, 'angry', [-3.9, 0, 6.4], 180); const sh = spade(S); fill(S, [0.5, 4.5, 7.5], 18, 0xffe2b0, 14); fill(S, [-9, 5, 9], 8, 0x9ab8ff, 12);
    return (t, dur) => { env.update(t); B.update(t, { breathe: 1.6 }); B.reach('R', [-4.6, 7.4, -2.2], { face: [0, 0.2, 1] }); B.grip('R', 0.2); B.look(V([-4, 4, 3])); const hitT = dur * 0.62;
      const w = sm(t, 0, hitT - 0.15); C.root.position.z = lerp(6.4, 2.6, w);
      C.pose(ps(w < 1 ? walk(t, 1.5, 34) : idle(t, 0.4), anticipate(t, hitT - 0.2, 1.6), hit([[0, { rUp: 60, lUp: 60, rFwd: 40, lFwd: 40, lean: 10 }], [hitT - 0.3, { rUp: 150, lUp: 150, rFwd: 10, lFwd: 10, lean: -12, nod: -10 }], [hitT, { rUp: 10, lUp: 10, rFwd: 84, lFwd: 84, lean: 30, nod: 14 }], [hitT + 0.2, { rUp: 16, lUp: 16, rFwd: 70, lFwd: 70, lean: 10, nod: 0, bob: 0.06 }]], t), t > hitT ? { tilt: Math.sin(t * 46) * 3 * Math.exp(-(t - hitT) * 3), turn: -24 } : { turn: -24 }));
      C.setFace(t < hitT ? 'angry' : 'shock'); const hp = hands(C); const sw = hn([[hitT - 0.3, -1.1], [hitT, 1.25]], t, x => x * x); sh.position.set(hp.x, hp.y - 0.3, hp.z); sh.rotation.set(-sw - 0.2, 0, 0); sh.userData.bend(t > hitT ? Math.min(1, (t - hitT) * 6) * (0.8 + Math.sin(t * 40) * 0.2 * Math.exp(-(t - hitT) * 4)) : 0);
      camPath(cam, sm(t, 0, dur), [5.0, 2.3, 9.0], [3.6, 2.6, 6.2], [-4.0, 3.8, 4.6], [-4.4, 3.6, 0.2], 22, 22); shake(cam, t, hitT, 0.9);
    };
  },
  // 32 "It bent like a spoon."  — close on Crane holding up what is left of the shovel, the blade drooping and wobbling like a spring; his eyes travel slowly upward… and he tries a smile.
  (S, cam) => {
    const { env, B } = cave(S, { eyes: 1, brow: -0.7 }); const C = crane(S, 'shock', [-4.0, 0, 2.6], 152); const sh = spade(S); fill(S, [-1.5, 5.4, -1.5], 5, 0xffe2b0, 10);
    return (t, dur) => { env.update(t); B.update(t); B.reach('R'); const up = dur * 0.5;
      C.pose(ps(idle(t, 0.5), { rFwd: 62, lFwd: 62, rUp: -12, lUp: -12 }, t < up ? { nod: 10, tilt: Math.sin(t * 3) * 3 } : hit([[up, { nod: 10 }], [up + 0.6, { nod: -26, lean: -6, bob: -0.05 }], [dur * 0.9, { nod: -28, lean: -8, bob: -0.1, tilt: 6 }]], t), t > up + 0.5 ? { tilt: Math.sin(t * 28) * 1.2 } : {}));
      C.setFace(t < up ? 'shock' : t < dur * 0.82 ? 'nervous' : 'fakesmile'); const hp = hands(C); sh.position.set(hp.x, hp.y - 1.2, hp.z - 0.15); sh.rotation.set(0, 152 * D, 0); sh.userData.bend(1 + Math.sin(t * 13) * 0.14 * Math.exp(-t * 0.9));
      faceCam(cam, sm(t, 0, dur), [-4.0, 4.6, 2.6], 152, { dist: 7.6, lens: 30, side: 0.5, up: 0.3, push: 1.0, look: -0.1 });
    };
  },
  // 33 "Then a giant claw came down, right at me…"  — (a) from behind Dana and Crane: the beast's face, eyes blazing, one enormous arm rising over its head; (b) reverse, low: the claws drop out of the dark and stop a breath above Dana as she ducks. (The hook reuses this shot.)
  (S, cam) => {
    const { env, B } = cave(S, { eyes: 1, brow: -1 }); const A = dana(S, 'scared', DN, 180), C = crane(S, 'scared', [-3.6, 0, 6.2], 180); const sh = spade(S); sh.userData.bend(1); fill(S, [3, 4.4, 2.5], 12, 0xffe2b0, 10);
    return (t, dur) => { env.update(t); B.update(t, { breathe: 1.5, blink: false }); const [k, lt] = seg(t, dur, [0.44]); const c = dur * 0.44; B.look(V([DN[0], 4.6, DN[2]]));
      const rise = hn([[0, 0], [c * 0.8, 1]], t), fall = hn([[c + 0.25, 0], [c + 0.25 + 0.5, 1]], t, x => x * x * x);
      const W = arc([6.6, 6, -6.4], [6.2, 27, -3], 0, rise); const D2 = [4.3, 11.6, 1.0]; B.reach('L', [lerp(W[0], D2[0], fall), lerp(W[1], D2[1], fall), lerp(W[2], D2[2], fall)], { face: [0, -1, 0.2], hint: [0.6, 1, -0.2] }); B.grip('L', 0.25 + fall * 0.3);
      B.jaw(0.35 + rise * 0.3 - fall * 0.2); B.head.rotation.x = 0.06 + rise * 0.1; B.head.rotation.z = Math.sin(t * 2) * 0.02;
      A.pose(ps(idle(t, 0.3), k === 0 ? { rUp: 30, lUp: 34, rFwd: 20, lFwd: 20, lean: -10, nod: -30 } : hit([[c, { rUp: 40, lUp: 40, nod: -24, lean: -8 }], [c + 0.5, { rUp: 132, lUp: 132, rFwd: 30, lFwd: 30, lean: -4, nod: 24, bob: -0.3 }], [c + 0.9, { rUp: 136, lUp: 136, rFwd: 34, lFwd: 34, lean: 2, nod: 28, bob: -0.36 }]], t), { tilt: Math.sin(t * 34) * 1 }));
      A.setFace(t < c + 0.35 ? 'shock' : 'scared'); C.pose(ps(idle(t, 0.5, 3), { rFwd: 60, lFwd: 60, rUp: -12, lUp: -12, lean: -10, nod: -28, tilt: Math.sin(t * 32) * 1.2 })); const hp = hands(C); sh.position.set(hp.x, hp.y - 1.2, hp.z + 0.15); C.visible = k === 0; C.root.visible = k === 0; sh.visible = k === 0;
      if (k === 0) { camPath(cam, lt, [5.8, 2.4, 14.2], [5.2, 2.8, 12.8], [0.9, 14.5, -8], [1.0, 16, -8], 21, 23); rumble(cam, t, 0.5); }
      else { camPath(cam, lt, [1.9, 2.0, 0.6], [2.2, 2.3, 1.2], [3.5, 5.6, 7], [3.5, 5.2, 7], 21, 23); shake(cam, t, c + 0.75, 0.5); }
    };
  },
  // 34 "and handed me a receipt."  — the claws stop… and between two of them, tiny as a stamp, is a receipt. The great green lamp clicks on. Dana opens one eye, then takes it with both hands.
  (S, cam) => {
    const { env, B } = cave(S, { eyes: 1, brow: -0.2 }); const A = dana(S, 'scared', DN, 180); const rc = receipt(S, 1.2); const fl = fill(S, [3, 4.4, 2.5], 12, 0xffe2b0, 10);
    return (t, dur) => { env.update(t); B.update(t); const on = dur * 0.26; const lk = t < on ? 0 : Math.min(1, (t - on) * 5) * (t - on < 0.28 && Math.sin(t * 60) > 0.2 ? 0.35 : 1); env.set(lk); env.eyes(1 - lk * 0.7); B.eyes(1, 1 - lk * 0.8); B.brow(lerp(-0.2, 0.7, sm(t, on, on + 0.6))); B.look(V([DN[0], 4.6, DN[2]])); fl.intensity = 12 * (1 - lk * 0.6);
      const dn = sm(t, 0, dur * 0.4), take = dur * 0.66, tk = sm(t, take, take + 0.35); const aw = sm(t, dur * 0.66 + 0.2, dur); const H = [lerp(3.9, 3.6, dn) + aw * 1.5, lerp(10.2, 5.2, dn) + aw * 5, lerp(2.8, 4.7, dn) - aw * 2.5]; reachHold(B, 'L', H, { face: [0, -1, 0.2], hint: [0.6, 1, -0.2] }); B.grip('L', 0.62);
      A.pose(ps(idle(t, 0.5), hit([[0, { rUp: 136, lUp: 136, rFwd: 34, lFwd: 34, nod: 28, bob: -0.36 }], [on + 0.3, { rUp: 100, lUp: 110, rFwd: 40, lFwd: 40, nod: 8, bob: -0.2 }], [take - 0.2, { rUp: 30, lUp: 30, rFwd: 40, lFwd: 40, nod: -6, bob: 0 }], [take + 0.3, { rUp: -12, lUp: -12, rFwd: 76, lFwd: 76, nod: 14 }], [dur, { rUp: -12, lUp: -12, rFwd: 72, lFwd: 72, nod: 18 }]], t), anticipate(t, take)));
      A.setFace(t < on + 0.2 ? 'scared' : t < take ? 'confused' : 'awe'); const tp = B.tip('L'), h = hands(A); rc.position.set(lerp(tp.x, h.x, tk), lerp(tp.y - 0.75, h.y + 0.1, tk), lerp(tp.z - 0.25, h.z - 0.3, tk)); rc.rotation.set(0.15 * tk, Math.PI, Math.sin(t * 3) * 0.05 * (1 - tk));
      camPath(cam, sm(t, 0, dur), [2.3, 3.4, 0.2], [2.7, 3.9, 1.5], [3.6, 5.0, 6.6], [3.6, 4.5, 6.6], 28, 32);
    };
  },
  // 35 "The monster put on reading glasses."  — low angle up the lamplit beast: one claw delicately settles a pair of gold half-moon glasses on its nose; it blinks, and its whole face goes gentle.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.2 }); const A = dana(S, 'awe', DN, 180); const rc = receipt(S, 1.0);
    return (t, dur) => { env.update(t); B.update(t); const on = dur * 0.5; const u = hn([[0.15, 0], [on, 1]], t); B.glassesG.position.set(lerp(4.5, 0, u), 4.3 + (1 - u) * -7 + Math.sin(u * Math.PI) * 3, 5.3 + (1 - u) * 3); B.glassesG.rotation.z = (1 - u) * 0.5;
      B.root.updateMatrixWorld(true); const gp = B.glassesG.localToWorld(new THREE.Vector3(6.6, 0.8, -1.0)); const dnn = sm(t, on + 0.25, dur * 0.95); reachHold(B, 'L', [lerp(gp.x, 6.4, dnn), lerp(gp.y, 5.6, dnn), lerp(gp.z + 0.6, -6.6, dnn)], { face: [-0.6, 0, 0.6] }); B.grip('L', 0.6 - dnn * 0.4);
      B.brow(lerp(0.2, 0.9, sm(t, on, on + 0.5))); B.jaw(0.1 + sm(t, on, on + 0.5) * 0.12); B.head.rotation.set(0.14, 0, Math.sin(t * 1.2) * 0.03 + sm(t, on, on + 0.4) * 0.07); B.look(V([DN[0], 4.6, DN[2]])); B.eyes(t > on + 0.1 && t < on + 0.25 || t > on + 0.5 && t < on + 0.62 ? 0.08 : 1, 0.2);
      A.pose(ps(idle(t, 0.6), { rFwd: 72, lFwd: 72, rUp: -12, lUp: -12, nod: -32, lean: -4 })); const h = hands(A); rc.position.set(h.x, h.y + 0.5, h.z - 0.14); rc.rotation.y = Math.PI;
      camPath(cam, sm(t, 0, dur), [3.0, 3.2, 11.4], [2.5, 3.6, 9.6], [0.2, 16.8, -9], [0.1, 17.6, -9], 23, 26);
    };
  },
  // 36 "It opened a ledger the size of a door."  — Dana walks up to a rock lectern under the lamp; a claw bigger than she is lifts the cover of a red book and lets it fall open with a boom of dust.
  //   Blocking: lectern + ledger centre, Dana screen right facing it (3/4 to us), the hand comes in from top right. Camera: low from the left, push in.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.7 }); const [gx, gy, gz] = CAVE.ledger; const A = dana(S, 'awe', [gx + 4.8, 0, gz + 6.4], 214); allow(S, ['beast', 'lectern']);   // its claw rests on its own ledger
    const closed = new THREE.Group(); closed.position.set(gx - 1.9, gy, gz); closed.rotation.x = -0.75; S.add(closed); const cb = new THREE.Mesh(new THREE.BoxGeometry(3.9, 6.9, 1.0), new THREE.MeshStandardMaterial({ color: 0x7a1a1a, roughness: 0.6 })); cb.position.z = 0.2; cb.castShadow = true; closed.add(cb); const tl = paper(closed, [['RENT', '800 150px Georgia, serif', '#e8c040', 60]], { w: 2.6, h: 1.3, tex: { bg: '#7a1a1a', top: 180, stain: false }, glow: 0.3 }); tl.position.set(0, 1.2, 0.72);
    const dust = [0, 1, 2, 3, 4, 5].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), new THREE.MeshBasicMaterial({ color: 0xe8dcc0, transparent: true, opacity: 0, depthWrite: false })); S.add(m); return m; });
    return (t, dur) => { env.update(t); B.update(t); const op = dur * 0.5; const opened = t > op; env.ledger.visible = opened; closed.visible = !opened; env.ledger.scale.set(hn([[op, 0.55], [op + 0.3, 1]], t), 1, 1);
      const w = sm(t, 0, dur * 0.4); A.root.position.set(lerp(gx + 4.8, gx + 3.9, w), 0, lerp(gz + 6.4, gz + 4.4, w));
      const up = sm(t, op - 0.5, op - 0.1); const H = opened ? [gx + 2.2, gy + 1.6 + Math.abs(Math.sin((t - op) * 7)) * 0.5 * Math.exp(-(t - op) * 2), gz - 0.2] : [gx - 0.2, gy + 0.8 + up * 2.6, gz - 0.6 + up * 0.8]; reachHold(B, 'R', H, { face: [0, -0.5, 0.85] }); B.grip('R', opened ? 0.25 : 0.6);
      B.head.rotation.set(0.2, -0.22, 0); B.look(V([gx, gy, gz]));
      dust.forEach((m, i) => { const u = clamp01((t - op) / 0.9); m.position.set(gx + Math.sin(i * 1.1) * (1 + u * 3.4), gy + 0.6 + u * 1.2 + Math.cos(i) * 0.4, gz + 1.2 + Math.cos(i * 1.1) * u * 1.5); m.scale.setScalar(0.6 + u * 1.6); m.material.opacity = opened ? 0.22 * (1 - u) : 0; });
      A.pose(ps(w < 1 ? walk(t, 0.8, 22) : idle(t, 0.6), (l => ({ turn: l.turn * 0.7, nod: l.nod * 0.8 }))(lookAt(A, [gx, gy + 1, gz])), opened ? hit([[op, {}], [op + 0.25, { lean: -10, rUp: 26, lUp: 26, bob: 0.08 }], [op + 0.8, { lean: 2, rUp: 10, lUp: 10 }]], t) : {}));
      A.setFace(!opened ? 'awe' : t < op + 0.6 ? 'shock' : 'confused');
      camPath(cam, sm(t, 0, dur), [gx + 3.4, 2.3, gz + 13.4], [gx + 3.2, 2.7, gz + 12.0], [gx + 1.8, 5.0, gz + 0.6], [gx + 1.7, 5.3, gz + 0.4], 20, 21); shake(cam, t, op + 0.05, 0.35);
    };
  },
  // 37 "Twelve months of rent. Paid from its own pile."  — (a) down the right-hand page, a claw tip running under each line: JUL… DEC, rent 3B, PAID ✔ — paid by: DOWNSTAIRS; (b) the beast lets a stream of gold coins run through its claws in front of Dana.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.8 }); const A = dana(S, 'awe', DN, 72); const fall = coinFall(S, 18); const [gx, gy, gz] = CAVE.ledger; allow(S, ['beast', 'lectern']);
    return (t, dur) => { env.update(t); B.update(t); const [k, lt] = seg(t, dur, [0.5]);
      if (k === 0) { A.root.visible = false; const v = lerp(2.2, -2.6, sm(lt, 0.1, 0.95)); const py = gy + v * 0.73, pz = gz - v * 0.68 + 0.5; reachHold(B, 'R', [gx + 4.3, py + 0.4, pz + 0.3], { face: [-0.5, -0.5, 0.7] }); B.grip('R', 0.2); B.reach('L'); fall(t, [0, 0, 0], 0, 0);
        camPath(cam, lt, [gx + 1.75, gy + 9.4, gz + 7.6], [gx + 1.75, gy + 7.6, gz + 9.0], [gx + 1.75, gy + 1.5, gz - 1.2], [gx + 1.75, gy - 1.4, gz + 1.4], 33, 33); return; }
      A.root.visible = true; B.reach('R'); const H = [8.2, 9.6 + Math.sin(t * 2) * 0.3, 3.0]; reachHold(B, 'L', H, { face: [0, -1, 0.3], hint: [0.6, 1, -0.2] }); B.grip('L', 0.35 + Math.sin(t * 5) * 0.12); const tp = B.tip('L'); fall(t, [tp.x, tp.y - 0.4, tp.z], 0.1, 1, 0.7);
      B.head.rotation.set(0.14, 0.2, 0); B.look(V([DN[0], 4.6, DN[2]]));
      A.pose(ps(idle(t, 0.7), { rFwd: 30, lFwd: 20 }, (l => ({ turn: l.turn, nod: l.nod * 0.6 }))(lookAt(A, [8.2, lerp(8, 1, (t * 0.6) % 1), 3.0])))); A.setFace(lt < 0.5 ? 'awe' : 'starstruck');
      camPath(cam, lt, [3.6, 3.0, 15.4], [4.0, 3.3, 14.2], [6.0, 4.6, 4.4], [6.0, 4.4, 4.4], 24, 25);
    };
  },
  // 38 "Why?" I asked.  — close on Dana from above, receipt in her hand, looking up into the lamplight; she actually asks it.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.8 }); const A = dana(S, 'confused', DN, 180); const rc = receipt(S, 1.0);
    return (t, dur) => { env.update(t); B.update(t); const l = lookAt(A, [1.2, 11, -2]);
      A.pose(ps(idle(t, 0.6), talk(t, 0.9), { lFwd: 46, lUp: -6, turn: l.turn, nod: l.nod * 0.75 }, hit([[0, {}], [0.4, { rFwd: 40, rUp: 34, tilt: 7, lean: 4 }], [dur * 0.8, { rFwd: 30, rUp: 22, tilt: -3 }]], t)));
      A.setFace(t < dur * 0.55 ? 'confused' : 'worried'); const hp = pinky(A, 'L'); rc.position.set(hp.x, hp.y + 0.35, hp.z - 0.12); rc.rotation.set(0.3, Math.PI, 0.1);
      faceCam(cam, sm(t, 0, dur), [DN[0], 4.64, DN[2]], 180, { dist: 6.6, lens: 36, side: -0.8, up: 1.9, push: 0.9, look: -0.15 });
    };
  },
  // 39 "It pointed at a shelf."  — over Dana's shoulder: the beast lifts one arm and points across the cavern; the camera swings with the claw to a tall rack in the shadows as a little light comes up on it.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.9 }); const A = dana(S, 'confused', DN, 180); const [sx, sz] = CAVE.shelf;
    return (t, dur) => { env.update(t); B.update(t); const pt = hn([[0.1, 0], [0.7, 1]], t); const pan = sm(t, dur * 0.3, dur * 0.9); env.set(1, { shelf: pan });
      B.reach('L', [lerp(6.4, 15.5, pt), lerp(5.6, 13.5, pt), lerp(-6.6, -8.5, pt)], { face: [0, 0, 1], hint: [0.2, -1, -0.3] }); B.grip('L', 0.1); B.head.rotation.set(0.1, 0.5 * pt, 0.05 * pt); B.look(V([sx, 8, sz]));
      const l = lookAt(A, [lerp(0, sx, pan), lerp(18, 7, pan), lerp(-9, sz, pan)]); A.pose(ps(idle(t, 0.6), { rFwd: 30, lFwd: 30, turn: l.turn, nod: l.nod * 0.7 })); A.setFace('confused');
      camPath(cam, pan, [2.4, 3.4, 15.5], [5.2, 3.8, 15.2], [2.4, 14.5, -9], [17.6, 7.4, -3.5], 22, 24);
    };
  },
  // 40 "Every plate I had ever left by that door."  — Dana walks up to the rack and the camera climbs it: shelf after shelf of her own blue-rimmed plates, and a hand-lettered card on top: DANA'S cooking ♥.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.9 }); const A = dana(S, 'awe', [13.6, 0, 5.4], 150);
    return (t, dur) => { env.update(t); B.update(t); B.look(V([16, 4.6, 3])); B.head.rotation.set(0.14, 0.45, 0.04); const w = sm(t, 0, dur * 0.6); A.root.position.set(lerp(13.6, 15.6, w), 0, lerp(5.4, 2.6, w));
      A.pose(ps(w < 1 ? walk(t, 0.7, 20) : idle(t, 0.6), hit([[dur * 0.5, {}], [dur * 0.5 + 0.5, { rFwd: 70, rUp: 6, lean: 4 }]], t), { nod: -6 - 22 * sm(t, dur * 0.3, dur) })); A.setFace('awe');
      camPath(cam, sm(t, 0, dur), [8.2, 2.2, 13.0], [10.4, 5.8, 10.6], [16.6, 3.0, -1.4], [17.8, 10.2, -3.2], 24, 24);
    };
  },
  // 41 "Washed. Stacked. Hundreds of them."  — tracking along one shelf, very close: stack after stack of spotless plates catching the light; Dana's fingers reach in and touch a rim.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.9 }); const [sx, sz] = CAVE.shelf; const W = (u, y, z) => [sx + 0.853 * u - 0.523 * z, y, sz + 0.523 * u + 0.853 * z]; const A = dana(S, 'awe', W(4.2, 0, 3.5), 148.5);
    const tw = [0, 1, 2, 3, 4, 5, 6].map(i => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })); m.position.set(...W(-4.6 + i * 1.35, 6.3 + (i % 3) * 0.4 + (i % 2) * 2.4, 0.85)); S.add(m); return m; });
    return (t, dur) => { env.update(t); B.update(t); env.shelfL.position.set(...W(0, 7.5, 7)); const p = sm(t, 0, dur); tw.forEach((m, i) => { const s = Math.max(0, Math.sin(t * 5 + i * 1.9)); m.scale.set(s * 0.6, s * 1.8, s * 0.6); m.rotation.y = t * 2; });
      A.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 40 }], [dur * 0.5, { rFwd: 86, rUp: 4, lean: 10, nod: 6 }], [dur * 0.9, { rFwd: 84, rUp: 4, lean: 8, nod: 10 }]], t))); A.setFace('teary');
      camPath(cam, p, W(-3.4, 6.5, 6.4), W(1.6, 6.8, 5.6), W(-3.2, 6.3, 0.6), W(2.4, 6.2, 0.6), 26, 28);
    };
  },
  // 42 "I was never feeding the rats."  — close on Dana in front of the plates, eyes full; she looks back over her shoulder at the beast, and smiles like she's known it for years.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 1 }); const [sx, sz] = CAVE.shelf; const W = (u, y, z) => [sx + 0.853 * u - 0.523 * z, y, sz + 0.523 * u + 0.853 * z]; const P = W(1.5, 0, 6.4); const A = dana(S, 'teary', P, 148.5);
    return (t, dur) => { env.update(t); B.update(t); env.shelfL.position.set(...W(3.5, 6.5, 2.4)); const c = dur * 0.5; const lb = lookAt(A, [0, 17, -9]);
      A.pose(ps(idle(t, 0.6), t < c ? { nod: -8, rFwd: 20, lFwd: 20 } : hit([[c, { nod: -8, rFwd: 20, lFwd: 20 }], [c + 0.6, { turn: lb.turn * 0.75, nod: lb.nod * 0.5, rFwd: 54, rUp: -18, lean: 2 }]], t), anticipate(t, c)));
      A.setFace(t < c - 0.1 ? 'teary' : t < c + 0.5 ? 'cry' : 'softsmile');
      camPath(cam, sm(t, 0, dur), W(0.0, 5.0, 1.7), W(0.3, 4.9, 2.1), [P[0], 4.3, P[2]], [P[0], 4.4, P[2]], 25, 27);
    };
  },
  // 43 "Mr. Crane grabbed a sack of gold and ran."  — tracking shot: Crane, hugging a sack bigger than his chest, pelts across the cavern for the stairs, coins bouncing out behind him; the beast's head turns to watch him go.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: -0.5 }); const C = crane(S, 'mischief', [6, 0, 9], -90); const sk = goldSack(S, 1.25); const fall = coinFall(S, 6); const rf = fill(S, [0, 4, 14], 14, 0xffe8d0, 14);
    return (t, dur) => { env.update(t); B.update(t); const x = lerp(6.5, -7.5, sm(t, 0.05, dur) * 0.6 + ramp(t, 0.05, dur) * 0.4); C.root.position.x = x; rf.position.x = x - 1.5; B.look(V([x, 4, 9])); B.head.rotation.set(0.16, -x * 0.03, 0); B.brow(-0.5 - sm(t, 0, dur) * 0.4);
      C.pose(ps(walk(t, 1.7, 44), { rFwd: 78, lFwd: 78, rUp: -22, lUp: -22, lean: 16, nod: -6, turn: 36 })); C.setFace(t < dur * 0.6 ? 'mischief' : 'grin'); const h = hands(C); sk.position.set(h.x - 0.2, h.y - 1.2, h.z); sk.rotation.z = Math.sin(t * 13) * 0.08; fall(t, [x + 1.2, 3.2, 9], 0.05, 1, 1.4);
      camPath(cam, 1, [x + 2.8, 2.5, 17.5], [x + 2.8, 2.5, 17.5], [x - 0.6, 4.0, 9], [x - 0.6, 4.0, 9], 24);
    };
  },
  // 44 "It's my building! It's all mine!"  — close on Crane at the foot of the stairs, clutching the sack, yelling back over it at something forty times his size.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: -0.8 }); const C = crane(S, 'angry', [-7.5, 0, 9], 150); const sk = goldSack(S, 1.25);
    return (t, dur) => { env.update(t); B.update(t); B.look(V([-7.5, 4, 9]));
      C.pose(ps(idle(t, 0.5), talk(t, 1.3), { rFwd: 78, lFwd: 78, rUp: -22, lUp: -22, nod: -14 }, hit([[0, { lean: 4 }], [0.3, { lean: 14, bob: 0.06 }], [dur * 0.5, { lean: 6 }], [dur * 0.5 + 0.3, { lean: 16, bob: 0.08, tilt: 6 }]], t)));
      C.setFace(t < dur * 0.72 ? 'angry' : 'laugh'); const h = hands(C); sk.position.set(h.x, h.y - 1.25, h.z); sk.rotation.y = 150 * D;
      faceCam(cam, sm(t, 0, dur), [-7.5, 4.96, 9], 150, { dist: 7.0, lens: 32, side: 0.7, up: 0.5, push: 0.9, look: -0.3 });
    };
  },
  // 45 "The monster turned to the last page of the lease."  — the beast, glasses on, holds a long yellowed lease in one hand and licks a claw to flip the pages over, one, two, to the very last.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: -0.3 }); const L = leaseRig(S, B); L.cover(0);
    const pgs = [0, 1].map(i => { const p = new THREE.Group(); p.position.set(LEASE[0], LEASE[1] + 2.5, LEASE[2] + 0.05 + i * 0.03); S.add(p); const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.0), new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.9, side: THREE.DoubleSide, emissive: 0x6a5a3a, emissiveIntensity: 0.3 })); m.position.y = -2.5; m.castShadow = true; p.add(m); for (let r = 0; r < 9; r++) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.08), new THREE.MeshBasicMaterial({ color: 0x6a5a4a })); ln.position.set(0, -0.8 - r * 0.45, 0.01); p.add(ln); } return p; });
    return (t, dur) => { env.update(t); B.update(t); const f = [dur * 0.25, dur * 0.55]; pgs.forEach((p, i) => { const u = sm(t, f[1 - i], f[1 - i] + 0.45); p.rotation.x = -0.12 - u * 2.75; p.visible = u < 0.98; });
      const fl = Math.max(Math.sin(ramp(t, f[0] - 0.2, f[0] + 0.45) * Math.PI), Math.sin(ramp(t, f[1] - 0.2, f[1] + 0.45) * Math.PI)); reachHold(B, 'L', [LEASE[0] + 1.9, LEASE[1] - 2.2 + fl * 4.6, LEASE[2] + 0.9 + fl * 1.4], { face: [-0.4, 0.3, 0.8] }); B.grip('L', 0.3);
      B.head.rotation.set(0.24, -0.12, Math.sin(t * 1.4) * 0.02); B.look(V(LEASE)); B.brow(-0.3);
      camPath(cam, sm(t, 0, dur), [-0.2, 4.0, 13.2], [-0.8, 4.8, 10.8], [-1.6, 12.4, -6], [-1.8, 12.8, -6], 23, 25);
    };
  },
  // 46 "Owner of Nine Marrow Street…"  — close on the last page: OWNER OF NINE MARROW STREET — and a great furry thumb sitting right over the name. Slow push in.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: -0.3 }); const L = leaseRig(S, B); fill(S, [LEASE[0] + 1, LEASE[1] + 1, LEASE[2] + 6], 6, 0xffe8c8, 14);
    return (t, dur) => { env.update(t); B.update(t); B.reach('L'); L.cover(1); L.pg.rotation.z = Math.sin(t * 1.3) * 0.012; B.head.rotation.set(0.24, -0.12, 0);
      camPath(cam, sm(t, 0, dur), [LEASE[0] + 0.6, LEASE[1] + 0.9, LEASE[2] + 11.0], [LEASE[0] + 0.2, LEASE[1] + 0.3, LEASE[2] + 9.6], [LEASE[0], LEASE[1] + 0.7, LEASE[2]], [LEASE[0], LEASE[1] + 0.2, LEASE[2]], 28, 29);
    };
  },
  // 47 "the tenant downstairs."  — (a) the thumb slides off: THE TENANT DOWNSTAIRS, since 1626; (b) Crane's face as the sack slides out of his arms.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.3 }); const L = leaseRig(S, B); const pl = fill(S, [LEASE[0] + 1, LEASE[1] + 1, LEASE[2] + 6], 6, 0xffe8c8, 14); const C = crane(S, 'laugh', [-7.5, 0, 9], 150); const sk = goldSack(S, 1.25); const fall = coinFall(S, 8);
    return (t, dur) => { env.update(t); B.update(t); B.reach('L'); const [k, lt] = seg(t, dur, [0.56]); const c = dur * 0.56; L.cover(1 - hn([[0.1, 0], [0.6, 1]], t)); B.head.rotation.set(0.2, -0.12, 0);
      const dr = sm(t, c + 0.15, c + 0.55); C.pose(ps(idle(t, 0.5), { rFwd: lerp(78, 30, dr), lFwd: lerp(78, 30, dr), rUp: lerp(-22, 16, dr), lUp: lerp(-22, 16, dr), nod: -16, lean: -6 * dr, tilt: Math.sin(t * 30) * 1.2 * dr })); C.setFace(t < c + 0.2 ? 'laugh' : 'shock');
      const h = hands(C); sk.position.set(h.x, lerp(h.y - 1.25, 0, dr * dr), h.z + dr * 0.4); sk.rotation.y = 150 * D; sk.rotation.z = dr * 0.5; fall(t, [-7.2, 2.4, 8.2], 0.05, k ? dr : 0, 1.0);
      if (k === 0) camPath(cam, lt, [LEASE[0] + 0.2, LEASE[1] - 0.4, LEASE[2] + 9.2], [LEASE[0] + 0.2, LEASE[1] - 0.7, LEASE[2] + 8.2], [LEASE[0], LEASE[1] - 0.6, LEASE[2]], [LEASE[0], LEASE[1] - 0.8, LEASE[2]], 27, 28);
      else faceCam(cam, lt, [-7.5, 4.96, 9], 150, { dist: 6.4, lens: 36, side: -0.6, up: 0.4, push: 0.6, look: -0.2 });
    };
  },
  // 48 "It built the place, four hundred years ago."  — the camera sweeps up to a huge gilt-framed painting on the cavern wall as a light comes up on it: a young blue beast setting the last brick on No. 9, est. 1626. A proud claw presents it.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: 0.8 });
    return (t, dur) => { env.update(t); B.update(t); const p = sm(t, 0, dur); env.set(1, { paint: sm(t, 0, dur * 0.45) * 1.6 }); B.reach('R'); B.reach('L', [lerp(6.4, 9.5, sm(t, 0.1, 0.8)), lerp(5.6, 9.0, sm(t, 0.1, 0.8)), -6.6], { face: [0, 0.6, 0.8] });
      B.head.rotation.set(0.05, -0.55 * sm(t, 0, 0.8), -0.06); B.look(V([-24, 15, -22])); B.jaw(0.2);
      camPath(cam, p, [-1.0, 5.0, 7.0], [-9.4, 10.6, -1.6], [-21, 13.0, -19], [-23.6, 14.8, -21.6], 24, 30);
    };
  },
  // 49 "Mr. Crane only collected the rent. And kept it."  — Crane backs away, palms up, as rent envelopes and loose coins keep sliding out of his own blazer onto the floor.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: -0.9 }); const C = crane(S, 'nervous', [-7.0, 0, 9.4], 150); const sk = goldSack(S, 1.25); sk.position.set(-5.0, 0, 9.0); sk.rotation.z = 0.5; const fall = coinFall(S, 8);
    const envs = [0, 1, 2, 3, 4].map(i => { const e = paper(S, [['RENT', '800 150px "Inter", sans-serif', '#b01e1e', 60], ['flat ' + (i + 1) + 'B', '700 70px Georgia', '#2a1a10', 60]], { w: 1.0, h: 0.62, tex: { top: 190, border: '#8a6a4a' }, glow: 0.4 }); return e; });
    return (t, dur) => { env.update(t); B.update(t); B.look(V([-7, 4, 9.4])); const w = sm(t, 0, dur); C.root.position.z = lerp(9.4, 10.6, w);
      C.pose(ps(idle(t, 0.6), walk(t, 0.45, 10), hit([[0, { rFwd: 30, lFwd: 30 }], [0.4, { rFwd: 66, lFwd: 66, rUp: 38, lUp: 38, lean: -8, nod: -14 }], [dur * 0.6, { rFwd: 60, lFwd: 60, rUp: 44, lUp: 44, lean: -10, nod: -16, tilt: 5 }]], t), { tilt: Math.sin(t * 26) * 0.8 }));
      C.setFace(t < dur * 0.45 ? 'nervous' : t < dur * 0.8 ? 'fakesmile' : 'scared'); const cz = C.root.position.z;
      envs.forEach((e, i) => { const u = clamp01((t - 0.25 - i * 0.42) / 1.1); e.visible = u > 0; e.position.set(-7.0 + (i % 2 ? 0.9 : -0.9) + Math.sin(u * 7 + i) * 0.5, lerp(3.2, 0.05, u * u), cz - 0.8 - u * 1.2 - i * 0.2); e.rotation.set(u < 1 ? u * 4 + i : -Math.PI / 2, 150 * D, u < 1 ? Math.sin(u * 9 + i) * 0.6 : i); });
      fall(t, [-7.0, 2.8, cz - 0.7], 0.05, sm(t, 0.3, 1.2), 1.3);
      faceCam(cam, sm(t, 0, dur), [-7.0, 4.4, 9.4], 150, { dist: 7.8, lens: 28, side: 0.6, up: -0.6, push: 0.4, look: -0.9 });
    };
  },
  // 50 "Then the monster wrote his notice. One word."  — low over the lectern: the beast, tongue-tip concentration, scratches out one word with a pencil the size of a lamp post.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: -0.4 }); const pc = bigPencil(S, 7); const [gx, gy, gz] = CAVE.ledger; const Yv = new THREE.Vector3(0, 1, 0);
    const nt = paper(S, [['NOTICE', '800 130px "Inter", sans-serif', '#2a1a10', 60]], { w: 4.2, h: 3.0, tex: { top: 190, border: '#2a1a10' }, glow: 0.3 }); nt.position.set(gx + 0.4, gy + 0.25, gz + 0.27); nt.rotation.x = -0.75;
    return (t, dur) => { env.update(t); B.update(t); B.reach('L'); const sc = t * 15; const tip = new THREE.Vector3(gx + 0.4 + Math.sin(sc) * 0.9 + Math.sin(t * 2.2) * 0.5, gy + 0.3 + Math.cos(sc * 0.9) * 0.22, gz + 0.9 - Math.cos(sc * 0.9) * 0.2);
      const H = [tip.x + 1.2, tip.y + 3.0, tip.z + 0.9]; reachHold(B, 'R', H, { face: [0.2, -0.4, 0.9] }); B.grip('R', 0.8); const tp = B.tip('R'); pc.position.copy(tip); pc.quaternion.setFromUnitVectors(Yv, tp.clone().sub(tip).normalize());
      B.head.rotation.set(0.3, -0.26, Math.sin(t * 15) * 0.008 + 0.05); B.look(tip); B.jaw(0.16); B.brow(-0.4 + Math.sin(t * 1.5) * 0.1);
      camPath(cam, sm(t, 0, dur), [gx + 4.4, 6.4, gz + 9.0], [gx + 3.8, 7.0, gz + 7.6], [-4.4, 12.0, -8], [-4.6, 12.6, -8], 22, 24);
    };
  },
  // 51 "Evicted."  — the notice comes down on Crane's chest like a stamp: EVICTED, in red. He peels it off, reads it, and his face falls apart.
  (S, cam) => {
    const { env, B } = cave(S, { lit: 1, glasses: true, brow: -0.6 }); const C = crane(S, 'scared', [-7.0, 0, 10.6], 164);
    const nt = paper(S, [['EVICTED', '800 118px "Inter", sans-serif', '#c81e1e', 108], ['— the owner (downstairs)', 'italic 34px Georgia', '#2a1a10', 50]], { w: 1.8, h: 1.13, tex: { top: 176, border: '#c81e1e' }, glow: 0.45 });
    return (t, dur) => { env.update(t); B.update(t); B.look(V([-7, 4, 10.6])); const sl = dur * 0.22, u = clamp01((t - sl + 0.25) / 0.25), rd = sm(t, sl + 0.5, sl + 0.9); const ch = [-7.0 + Math.sin(164 * D) * 0.75, 3.3, 10.6 + Math.cos(164 * D) * 0.75]; const h = hands(C); h.x += Math.sin(164 * D) * 0.95; h.z += Math.cos(164 * D) * 0.95;
      nt.position.set(lerp(ch[0] + 0.6, lerp(ch[0], h.x, rd), u), lerp(11, lerp(ch[1], h.y + 0.3, rd), u * u), lerp(ch[2] - 5, lerp(ch[2], h.z - 0.1, rd), u)); nt.rotation.set(-0.1 * rd, 164 * D, (1 - u) * 0.8); nt.visible = t > sl - 0.25;
      C.pose(ps(idle(t, 0.4), anticipate(t, sl + 0.5), hit([[0, { rFwd: 60, lFwd: 60, rUp: 44, lUp: 44, lean: -10, nod: -16 }], [sl, { rFwd: 40, lFwd: 40, rUp: 50, lUp: 50, lean: -14, nod: 20, bob: -0.12 }], [sl + 0.9, { rFwd: 74, lFwd: 74, rUp: -16, lUp: -16, lean: 0, nod: 24, bob: 0 }], [dur, { rFwd: 70, lFwd: 70, rUp: -16, lUp: -16, nod: 16, tilt: 6 }]], t), t > dur * 0.7 ? { tilt: Math.sin(t * 24) * 1.5, bob: Math.sin(t * 9) * 0.03 } : {}));
      C.setFace(t < sl ? 'scared' : t < sl + 0.9 ? 'shock' : t < dur * 0.75 ? 'worried' : 'cry');
      faceCam(cam, sm(t, 0, dur), [-7.0, 4.3, 10.6], 164, { dist: 8.8, lens: 30, side: -0.4, up: 0.2, push: 0.7, look: -0.5 }); shake(cam, t, sl, 0.5);
    };
  },
  // 52 "It carried him out by the collar. Gently. Mostly."  — dawn on Marrow Street: No. 9's hatch opens, a blue arm lifts Crane out by the collar, legs pedalling, swings him over the bins, lowers him very carefully… and lets go.
  //   Blocking: hatch screen right, bins screen left; Crane faces us the whole way. Camera: low and wide, slow push.
  (S, cam) => {
    const env = marrowStreet(S, { time: 'dawn' }); const a = cellarArm(S, { name: 'beastArm', col: 0x2c6878, nail: 0xf2e8c8, s: 1.5, len: 12 }); a.g.position.set(9, 0, -4.6); const C = crane(S, 'scared', [9, 0, -4.6], 0); allow(S, ['crane', 'beastArm'], ['*Arm*', 'pavement']); let rel = null; const REL0 = [4.4, 1.6, -7.4];
    return (t, dur) => { env.update(t); env.follow(6); env.keyAt(6, 5, 2, 10); const up = hn([[0.1, 0], [dur * 0.22, 1]], t), sw = sm(t, dur * 0.24, dur * 0.5), low = sm(t, dur * 0.52, dur * 0.76), drop = dur * 0.8, dq = clamp01((t - drop) / 0.28);
      env.hatch.nine.open(Math.min(1, up * 1.5)); a.rise(lerp(-2, 9.6, up) - low * 2.6); a.g.rotation.set(-0.36 * sw, 0, 0.56 * sw); a.grip(dq > 0 ? 0.05 : 0.8); a.wrist.rotation.z = dq > 0 ? Math.sin((t - drop) * 12) * 0.5 * Math.min(1, (t - drop) * 3) : 0;
      a.g.updateMatrixWorld(true); const hp = a.hold.getWorldPosition(new THREE.Vector3()); const bin = [3.9, 0.35, -8.6];
      if (dq === 0) { rel = [hp.x, hp.y - 5.5, hp.z + 0.5]; C.root.position.set(...rel); } else { const s0 = rel || REL0; C.root.position.set(lerp(s0[0], bin[0], dq), lerp(s0[1], bin[1], dq * dq), lerp(s0[2], bin[2], dq)); }
      C.root.visible = up > 0.25; C.pose(ps(dq < 1 ? { rLeg: Math.sin(t * 13) * 30, lLeg: -Math.sin(t * 13) * 30, rUp: 30 + Math.sin(t * 9) * 16, lUp: 30 - Math.sin(t * 9) * 16, nod: 12, tilt: Math.sin(t * 3) * 6 } : hit([[drop + 0.28, { rUp: 150, lUp: 150, nod: 20, bob: -0.3 }], [drop + 0.6, { rUp: 60, lUp: 64, nod: 6, tilt: 9, bob: 0 }]], t)));
      C.setFace(dq === 0 ? (low > 0.3 ? 'relieved' : 'scared') : dq < 1 ? 'shock' : 'pout');
      camPath(cam, sm(t, 0, dur), [5.6, 2.3, 10.4], [5.2, 2.8, 8.6], [6.6, 5.8, -6.5], [6.2, 4.6, -6.8], 21, 22); shake(cam, t, drop + 0.28, 0.5);
    };
  },
  // 53 "I still live at number nine."  — morning: Dana steps out onto the stoop of No. 9, stretches, and gives the cellar hatch a little wave. Two claw tips lift the hatch a crack and wiggle back.
  (S, cam) => {
    const env = marrowStreet(S, { time: 'dawn' }); const A = dana(S, 'relieved', [14, 1.2, -9.05], 0); const a = cellarArm(S, { name: 'beastArm', col: 0x2c6878, nail: 0xf2e8c8, s: 1.3, len: 8 }); a.g.position.set(9, 0, -4.6); allow(S, ['dana', 'stoop'], ['*Arm*', 'pavement']);
    return (t, dur) => { env.update(t); env.follow(12); env.keyAt(12, 5.5, -2, 12); const wv = dur * 0.45; const l = lookAt(A, [9, 0.5, -4.6]);
      A.pose(ps(idle(t, 0.7), t < wv ? hit([[0, { rUp: 60, lUp: 60 }], [0.5, { rUp: 150, lUp: 150, nod: -10, lean: -6, bob: 0.08 }], [wv - 0.2, { rUp: 28, lUp: 28, rFwd: -8, lFwd: -8 }]], t) : ps(hit([[wv - 0.2, { rUp: 28, lUp: 28, rFwd: -8, lFwd: -8 }], [wv + 0.3, { rUp: 100, rFwd: 30, lUp: 28, lFwd: -8, turn: l.turn, nod: l.nod * 0.7 }]], t), { rUp: Math.sin(t * 11) * 10 }), anticipate(t, wv)));
      A.setFace(t < wv ? 'relieved' : 'grin'); const k = hn([[wv + 0.35, 0], [wv + 0.7, 1]], t); env.hatch.nine.open(0.42 * k); a.rise(-1.5 + 3.6 * k); a.g.rotation.z = 0.5; a.grip(0.3 + Math.sin(t * 13) * 0.3 * k);
      camPath(cam, sm(t, 0, dur), [10.4, 2.4, 3.4], [11.2, 3.2, 0.4], [13.0, 5.4, -9], [13.0, 5.5, -9], 23, 25);
    };
  },
  // 54 "Rent is due on Fridays. I pay in lasagna."  — the back hall: the basement door stands open, and a hand the size of a sofa waits palm-up in the doorway while Dana sets a whole steaming tray of lasagna on it.
  (S, cam) => {
    const env = cellarHall(S); env.door.open(0.92); const A = dana(S, 'grin', [0.9, 0, -2.4], 180); const H = monsterHand(S, { s: 1.2 }); H.g.rotation.set(Math.PI / 2, Math.PI, 0); const tr = lasagnaTray(S, 1.0); const rc = receipt(S, 0.9); allow(S, ['dana', 'hand']);
    return (t, dur) => { env.update(t); env.glow(1); const inn = hn([[0.05, 0], [dur * 0.3, 1]], t), give = dur * 0.5, g = sm(t, give, give + 0.4), out = sm(t, dur * 0.72, dur * 0.95);
      H.g.position.set(-0.3, 2.5 + Math.sin(t * 9) * 0.06 * g * (1 - out), lerp(-18, -10.2, inn) - out * 7); H.grip(0.12 + g * 0.1 + Math.sin(t * 10) * 0.07 * g * (1 - out)); H.g.updateMatrixWorld(true); const pm = H.hold.getWorldPosition(new THREE.Vector3());
      A.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 58, lFwd: 58, rUp: -6, lUp: -6 }], [give, { rFwd: 60, lFwd: 60, rUp: -6, lUp: -6 }], [give + 0.4, { rFwd: 80, lFwd: 80, rUp: -6, lUp: -6, lean: 22, nod: 6 }], [give + 0.9, { rFwd: 10, lFwd: 10, lean: 0, rUp: 14, lUp: 14 }], [dur * 0.85, { rUp: 110, rFwd: 20, lUp: 10, tilt: -6 }]], t), anticipate(t, give), t > dur * 0.82 ? { rUp: Math.sin(t * 11) * 9 } : {}));
      A.setFace(t < give ? 'grin' : t < dur * 0.8 ? 'delighted' : 'smile'); const h = hands(A); tr.position.set(lerp(h.x, pm.x, g), lerp(h.y - 0.15, pm.y - 0.9, g), lerp(h.z - 0.5, pm.z - 0.9, g));
      const ru = sm(t, dur * 0.8, dur * 0.97); rc.visible = ru > 0; rc.position.set(0.4, 0.05, lerp(-8.8, -5.2, ru)); rc.rotation.set(-Math.PI / 2, 0, 0.3 + ru * 2);
      camPath(cam, sm(t, 0, dur), [4.9, 4.8, -8.3], [4.7, 4.5, -8.0], [0.3, 3.3, -4.4], [0.5, 3.4, -4.0], 19, 20);
    };
  },
  // 55 "The opera house monster heard about it."  — night at the opera steps: a purple hand comes up out of the hatch holding a fork, and raps it on the pavement. Madame Odette looks at the fork, then at us.
  (S, cam) => {
    const env = marrowStreet(S); const A = diva(S, 'confused', [-42.7, 0, -4.3], 40); const a = opArm(S); const fk = fork(a.hold);
    return (t, dur) => { env.update(t); env.follow(-40); env.keyAt(-41, 5.4, 1.5, 14); env.hatch.opera.open(1); const k = hn([[0.1, 0], [0.5, 1]], t); const tap = Math.abs(Math.sin(t * 7)) * (t > 0.7 ? 1 : 0);
      a.rise(-1.2 + 5.6 * k - tap * 0.7); a.grip(0.85); const c = dur * 0.6; const lf = lookAt(A, [-38, 5, -4.6]), lc = lookAt(A, [-38, 3.4, 7]);
      A.pose(ps(idle(t, 0.6), t < c ? { turn: lf.turn * 0.6, nod: lf.nod, rUp: 20, lUp: 20 } : hit([[c, { turn: lf.turn * 0.6, rUp: 20, lUp: 20 }], [c + 0.35, { turn: lc.turn * 0.6, nod: lc.nod, rUp: 36, lUp: 36, rFwd: 24, lFwd: 24, tilt: 8 }]], t)));
      A.setFace(t < 0.6 ? 'neutral' : t < c ? 'confused' : 'worried');
      camPath(cam, sm(t, 0, dur), [-37.4, 3.0, 8.2], [-38.4, 3.4, 6.6], [-40.2, 4.3, -4.6], [-40.1, 4.4, -4.6], 24, 25);
    };
  },
  // 56 "Now it wants dinner and a show."  — Odette sings her heart out holding a plate of spaghetti over the hatch; the purple hand twirls the fork in it… then a second hand holds up a new card: 10 / 10.
  (S, cam) => {
    const env = marrowStreet(S); const A = diva(S, 'delighted', [-42.7, 0, -4.3], 40); const a = opArm(S); const fk = fork(a.hold); const nd = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf2d078, roughness: 0.8 })); nd.position.y = 3.3; nd.scale.y = 1.3; fk.add(nd); const pl = plateOf(S, { food: 'spaghetti', s: 1.5 });
    const b = cellarArm(S, { name: 'operaArm2', col: 0x7a4ab0, nail: 0xf2c420, s: 1.1 }); b.g.position.set(-37.9, 0, -4.8); const card = paper(S, [['BRAVA!', '800 92px "Inter", sans-serif', '#2a1a10', 150], ['10 / 10', '800 136px "Inter", sans-serif', '#1c8a4a', 120], ['encore + seconds', 'italic 40px Georgia', '#5a4a3a', 60]], { w: 2.3, h: 2.5, tex: { top: 150, border: '#2a1a10' }, glow: 0.5 }); b.hold.add(card); card.position.set(0, 1.5, 0.5);
    return (t, dur) => { env.update(t); env.follow(-40); env.keyAt(-41, 5.4, 1.5, 14); env.hatch.opera.open(1); const c = dur * 0.5;
      A.pose(ps(idle(t, 0.5), talk(t, 1.3), { rFwd: 74, lFwd: 74, rUp: -4, lUp: -4, nod: -12 + Math.sin(t * 2.4) * 6, lean: 4, tilt: Math.sin(t * 1.2) * 5 })); A.setFace(Math.sin(t * 2.4) > 0 ? 'delighted' : 'laugh');
      const h = hands(A); pl.position.set(h.x + 0.5, h.y - 0.05, h.z - 0.1); a.g.position.set(-39.3, 0, -3.7); const eat = sm(t, c - 0.5, c - 0.1); a.rise(lerp(2.6, -1.5, eat) + Math.sin(t * 6) * 0.15); a.g.rotation.z = 0.3 * (1 - eat); a.grip(0.85); fk.rotation.set(0, t * 6, 0.55); nd.visible = t > 0.4;
      const k = hn([[c, 0], [c + 0.3, 1]], t); b.rise(-1.5 + 7.0 * k); b.grip(0.75); b.wrist.rotation.z = Math.sin(t * 8) * 0.1 * k;
      camPath(cam, sm(t, 0, dur), [-39.6, 3.2, 9.6], [-39.5, 3.8, 8.6], [-39.5, 4.6, -4.6], [-39.5, 5.0, -4.6], 23, 24); shake(cam, t, c + 0.25, 0.25);
    };
  },
  // 57 "All year, I thought I lived alone."  — night, the back hall: Dana sits on the floor beside the basement door with her own plate, eating, the door a crack open and a line of warm light across the tiles. She glances at it.
  (S, cam) => {
    const env = cellarHall(S); const A = dana(S, 'softsmile', [3.5, 0, -7.4], 0); sitGround(A); const pl = plateOf(S, { s: 1.0 }); allow(S, ['dana', 'floor']);
    return (t, dur) => { env.update(t, 0.6); env.door.open(0.1); env.glow(0.7); const c = dur * 0.55; const l = lookAt(A, [0, 2.5, -9]);
      A.pose(ps(SIT, idle(t, 0.4), { lFwd: 62, lUp: -10 }, t < c ? { rFwd: 70 + Math.max(0, Math.sin(t * 2.6)) * 50, rUp: -8, nod: 12 - Math.max(0, Math.sin(t * 2.6)) * 8 } : hit([[c, { rFwd: 70, rUp: -8, nod: 10 }], [c + 0.5, { rFwd: 60, rUp: -8, turn: l.turn * 0.8, nod: l.nod, tilt: 5 }]], t)));
      A.setFace(t < c ? 'softsmile' : 'thinking'); const hp = pinky(A, 'L'); pl.position.set(hp.x - 0.2, hp.y - 0.15, hp.z + 0.1);
      camPath(cam, sm(t, 0, dur), [0.8, 2.3, 1.6], [1.2, 2.4, 0.0], [2.9, 2.5, -7.4], [3.0, 2.6, -7.4], 25, 27);
    };
  },
  // 58 "I never did."  — the door swings wide: a great blue hand slides out across the tiles and settles beside her, two gold eyes blinking in the dark behind it. Dana rests her hand on a claw, and smiles at us.
  (S, cam) => {
    const env = cellarHall(S); const A = dana(S, 'thinking', [3.5, 0, -7.4], 0); sitGround(A); const pl = plateOf(S, { s: 1.0 }); const H = monsterHand(S, { s: 1.25 }); H.g.rotation.set(Math.PI / 2, 0, 0); allow(S, ['dana', 'floor'], ['dana', 'hand'], ['hand', 'floor']);
    const eyes = [-1, 1].map(sx => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe070 })); e.position.set(sx * 1.2, 2.6, -15.5); e.scale.z = 0.4; S.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), new THREE.MeshBasicMaterial({ color: 0x0a0a0a })); p.position.set(0.25, 0, 0.7); e.add(p); return e; });
    return (t, dur) => { env.update(t, 0.6); const o = hn([[0.05, 0.1], [0.75, 0.92]], t, x => x * x * (3 - 2 * x)); env.door.open(o); env.glow(0.7 + o * 0.3); const sl = sm(t, 0.5, dur * 0.6); H.g.position.set(0.2, 0.95, lerp(-18.5, -8.6, sl)); H.thumb.rotation.z = 0.95 * sm(t, dur * 0.6, dur * 0.75); H.grip(0.12 + (t > dur * 0.62 ? Math.max(0, Math.sin((t - dur * 0.62) * 9)) * 0.14 * Math.exp(-(t - dur * 0.62) * 1.5) : 0));
      eyes.forEach(e => { e.visible = o > 0.5; e.scale.y = (t % 2.6) > 2.46 ? 0.1 : 1; });
      const c = dur * 0.62; const lh = lookAt(A, [1.6, 1.2, -6.2]), lc = lookAt(A, [1.9, 2.6, -1]);
      A.pose(ps(SIT, idle(t, 0.4), { lFwd: 62, lUp: -10 }, hit([[0, { turn: -50, nod: 4, rFwd: 60, rUp: -8 }], [c, { turn: lh.turn * 0.9, nod: lh.nod * 0.6, rFwd: 40, rUp: 30, lean: 0 }], [c + 0.45, { turn: lh.turn * 0.5, nod: 8, rFwd: 16, rUp: 58, tilt: -6 }], [dur, { turn: lc.turn, nod: lc.nod, rFwd: 16, rUp: 58, tilt: -8 }]], t)));
      A.setFace(t < dur * 0.3 ? 'thinking' : t < c ? 'awe' : t < dur * 0.86 ? 'softsmile' : 'smile'); const hp = pinky(A, 'L'); pl.position.set(hp.x - 0.2, hp.y - 0.15, hp.z + 0.1);
      camPath(cam, sm(t, 0, dur), [1.5, 2.4, 3.6], [1.3, 2.7, 1.8], [2.2, 2.3, -7.4], [2.2, 2.2, -7.4], 20, 21);
    };
  },
];

// a dinner fork for a monster (parent it to an arm's hold group): handle down, tines up
function fork(parent) { const g = new THREE.Group(); parent.add(g); const m = new THREE.MeshStandardMaterial({ color: 0xd8dce4, metalness: 0.9, roughness: 0.25 }); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 3.0, 8), m); h.position.y = 0.6; g.add(h); const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.12), m); b.position.y = 2.3; g.add(b);
  for (const x of [-0.3, 0, 0.3]) { const tn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1.1, 6), m); tn.position.set(x, 3.05, 0); g.add(tn); } g.position.set(0, 0.4, 0.3); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
