import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  recordShop, harborFront, fogBank, fogRing, fogTouch, fogPhone } from '../../engine/kit.js';
import { you, abe, dot, biscuit, ramp, sm, V, headOf, faceCam, fill, allow, hn, RUN, shake, far } from './common.js';
import { front, cab, WHEEL, winCam, frozen, TZ } from './shots_a.js';

// inside DOT'S RECORDS: Dot behind the counter (fogged unless dotFog = 0), you + Biscuit
const DOTP = [6.8, 0, -3.8];
function shop(S, { dotFog = 1, dotFace = 'sleepy', youAt = null, youRy = 0, youFace = 'worried', dog = null, cloth = 0 } = {}) {
  const env = recordShop(S); S.userData.look = 'night'; env.cloth(cloth);
  const Dt = dot(S, dotFace, DOTP, 0); fogTouch(Dt, dotFog);
  const rec = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 0.05), new THREE.MeshStandardMaterial({ color: 0xd8302a, roughness: 0.6 })); S.add(rec);
  const A = youAt ? you(S, youFace, youAt, youRy) : null; let B = null; if (dog) { B = biscuit(S); B.root.position.set(...dog); }
  allow(S, ['dot', 'counter'], ['you', 'gramophone'], ['you', 'gram table']);
  const holdRec = (t, k = 1) => { const p = pinky(Dt, 'R'), q = pinky(Dt, 'L'); rec.position.set((p.x + q.x) / 2, (p.y + q.y) / 2 + 0.35, (p.z + q.z) / 2 + 0.15); rec.visible = k > 0; };
  const DOTHOLD = { rFwd: 55, lFwd: 55, rUp: -22, lUp: -22 };
  return { env, Dt, A, B, rec, holdRec, DOTHOLD };
}
const CRANK = (t, sp = 11) => ({ rFwd: 62 + Math.sin(t * sp) * 14, rUp: -8 + Math.cos(t * sp) * 10, lFwd: 30, lUp: 10, lean: 8, nod: 16 });

// the vote shot (lines 41–42): you in the open doorway with the record player in your arms, Dot holding up her boat keys, the fogged truck beyond
function voteShot(off) {
  return (S, cam) => { const { env, Dt, A, B } = shop(S, { dotFog: 0, dotFace: 'worried', youAt: [-0.6, 0, -6.4], youRy: 20, youFace: 'worried', dog: [-3.0, 0, -5.6], cloth: 1 });
    const keys = new THREE.Group(); const km = new THREE.MeshStandardMaterial({ color: 0xd8b048, metalness: 0.8, roughness: 0.3 });
    keys.add(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 14), km)); const fl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), new THREE.MeshStandardMaterial({ color: 0xf28a3a })); fl.position.y = -0.45; keys.add(fl); S.add(keys);
    Dt.root.position.set(3.6, 0, -5.4); Dt.root.rotation.y = -30 * D; env.door.open(1); B.root.rotation.y = 160 * D; const fillK = fill(S, [3.0, 6.0, -1.5], 6, 0xd8e0ff, 9);
    return (t0, dur) => { const t = t0 + off;
      A.pose(addPose(idle(t, 0.8), { rFwd: 30, lFwd: 30, rUp: -18, lUp: -18, turn: -25 + Math.sin(t * 0.5) * 20, nod: 4 })); A.setFace(t > 3 ? 'determined' : 'worried');
      A.root.updateMatrixWorld(true); const c = A.root.localToWorld(new THREE.Vector3(0, 1.9, 1.35)); env.gram.position.copy(c); env.gram.rotation.y = A.root.rotation.y - Math.PI / 2; env.gram.scale.setScalar(0.65);
      env.notes.update(t, env.gram.bellPos(), 0.6, { up: 3.5, spread: 2.2, size: 0.45 });
      Dt.pose(addPose(idle(t, 0.9, 2), { rFwd: 120, rUp: -28, lFwd: 20, turn: lookAt(Dt, headOf(A)).turn * 0.5 })); const p = pinky(Dt, 'R'); keys.position.set(p.x, p.y + 0.15, p.z + 0.1); keys.rotation.z = Math.sin(t * 3) * 0.3;
      B.update(t, 'sit');
      const u = (t - 0) / 9; camPath(cam, Math.min(1, u), [1.4, 1.8, 6.2], [1.3, 1.9, 4.8], [1.4, 0.5, -7], [1.4, 0.6, -7], 20, 22); env.warm.position.set(c.x + 0.4, c.y + 1.4, c.z + 1.4); fillK.intensity = 6; env.update(t, { jingle: 0, ring: 0, music: 0.5, spin: 1, cam }); };
  };
}

export const SHOTS_B = [
  // 22 "Records everywhere. Old radios. A jukebox."  — you push in through the door; slow pan across bins, the radio shelf → the dark jukebox
  (S, cam) => { const { env, Dt, A, B, holdRec, DOTHOLD } = shop(S, { youAt: [-0.5, 0, -8.6], youRy: 0, youFace: 'awe', dog: [2.4, 0, -7.8] });
    return (t, dur) => { env.update(t, { jingle: 1, ring: 8, inside: 0.6 }); env.door.open(1 - ramp(t, 0.6, 1.4) * 0.6); const [k, u] = seg(t, dur, [0.5]);
      A.root.position.z = -8.6 + ramp(t, 0, 1.2) * 4.4; A.pose(t < 1.2 ? walk(t, 9, 0.8) : addPose(idle(t, 0.8), { turn: Math.sin(t * 0.9) * 40, nod: -6 })); B.root.position.z = -7.8 + ramp(t, 0, 1.0) * 3.6; B.update(t, t < 1 ? 'run' : 'sit');
      frozen(Dt, t, DOTHOLD, 3); holdRec(t);
      if (k === 0) camPath(cam, u, [5.5, 6.8, 10.5], [2.5, 6.4, 10.5], [3, 3.6, -4], [-2, 4.0, -5], 22, 24);
      else camPath(cam, u, [-2.2, 5.2, -0.6], [-2.8, 5.2, -1.4], [-8.0, 3.4, -7.0], [-8.3, 3.8, -7.2], 26, 28); };
  },
  // 23 "And Dot, behind the counter, holding a record."  — push-in on Dot: grey, blank, a record in her hands, the candle flickering beside her
  (S, cam) => { const { env, Dt, holdRec, DOTHOLD } = shop(S);
    return (t, dur) => { env.update(t, { jingle: 1, ring: 8, inside: 0.6 }); frozen(Dt, t, DOTHOLD, 3); holdRec(t);
      const h = headOf(Dt); camPath(cam, t / dur, [h.x - 1.4, h.y + 0.4, 6.0], [h.x - 0.6, h.y + 0.1, 3.4], [h.x, h.y - 0.9, h.z], [h.x, h.y - 0.2, h.z], 30, 38); };
  },
  // 24 "But the power is out on the pier."  — you jab the jukebox buttons, slap its side; nothing. Your face drops
  (S, cam) => { const { env, Dt, A, holdRec, DOTHOLD } = shop(S, { youAt: [-5.4, 0, -6.6], youRy: -85, youFace: 'determined' });
    return (t, dur) => { env.update(t, { jingle: 1, ring: 8, inside: 0.7 }); frozen(Dt, t, DOTHOLD, 3); holdRec(t);
      A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 20 }], [0.2, { rFwd: 80, rUp: -10, nod: 10 }], [0.35, { rFwd: 70, rUp: -10, nod: 10 }], [0.5, { rFwd: 82, rUp: -10, nod: 10 }], [0.75, { rFwd: 40, rUp: 60, lFwd: 10, nod: 0 }], [0.92, { rFwd: 60, rUp: 0, nod: 4 }], [1.4, { rFwd: 10, lFwd: 10, nod: 6, turn: 40 }], [9, { rFwd: 10, lFwd: 10, nod: 8, turn: 45 }]], t)));
      A.setFace(t < 1.05 ? 'determined' : 'worried'); env.juke(t > 0.92 && t < 1.0 ? 0.15 : 0); shake(cam, t, 0.92, 0.4);
      const h = headOf(A); camPath(cam, t / dur, [-8.6, 5.2, -2.2], [-8.3, 5.0, -2.9], [h.x - 1.0, h.y - 0.7, h.z - 0.4], [h.x - 0.5, h.y - 0.3, h.z], 26, 30); };
  },
  // 25 "Then Biscuit barks at the corner."  — low: Biscuit plants his paws and barks at a lumpy dust sheet in the corner; you spin round
  (S, cam) => { const { env, Dt, A, B, holdRec, DOTHOLD } = shop(S, { youAt: [-1.4, 0, -1.0], youRy: 150, youFace: 'worried', dog: [-4.4, 0, 3.6] });
    return (t, dur) => { env.update(t, { jingle: 1, ring: 8, inside: 0.75 }); frozen(Dt, t, DOTHOLD, 3); holdRec(t); B.root.rotation.y = -40 * D; B.update(t, 'bark');
      A.root.rotation.y = hn([[0, 150], [0.5, 150], [0.85, 20], [9, 20]], t) * D; A.pose(addPose(idle(t, 0.8), addPose(anticipate(t, 0.6), { turn: t > 0.85 ? -20 : 0 }))); A.setFace(t > 0.9 ? 'confused' : 'worried');
      camPath(cam, t / dur, [0.8, 2.6, 9.0], [0.2, 2.8, 8.2], [-4.6, 1.8, 4.2], [-6.2, 2.6, 5.4], 22, 24); };
  },
  // 26 "An old wind-up record player."  — Biscuit tugs the sheet off: a brass-horned wind-up record player underneath; push-in
  (S, cam) => { const { env, Dt, A, B, holdRec, DOTHOLD } = shop(S, { youAt: [-2.0, 0, 3.0], youRy: -50, youFace: 'awe', dog: [-4.8, 0, 4.4] });
    return (t, dur) => { const ck = ramp(t, 0.3, 1.0); env.cloth(ck); env.update(t, { jingle: 1, ring: 8, inside: 0.8 }); frozen(Dt, t, DOTHOLD, 3); holdRec(t);
      B.root.rotation.y = -60 * D; B.root.position.x = -4.8 + ck * 0.8; B.update(t, t < 1.0 ? 'run' : 'sit');
      A.pose(addPose(idle(t, 0.8), hit([[0, { lean: 0 }], [1.0, { lean: 10, rFwd: 20, lFwd: 20 }], [9, { lean: 10, rFwd: 20, lFwd: 20 }]], t))); A.setFace(t > 0.9 ? 'awe' : 'confused');
      const g = env.gram.position; camPath(cam, t / dur, [g.x + 7.0, g.y + 2.6, g.z + 4.4], [g.x + 5.4, g.y + 2.0, g.z + 3.4], [g.x + 0.6, g.y + 0.4, g.z - 0.6], [g.x + 0.2, g.y + 0.8, g.z], 24, 28); };
  },
  // 27 "You crank it as fast as you can."  — close on the crank whirling; cut to your face, gritted, determined
  (S, cam) => { const { env, Dt, A, B, holdRec, DOTHOLD } = shop(S, { youAt: [-7.4, 0, 3.5], youRy: 0, youFace: 'determined', dog: [-3.8, 0, 5.2], cloth: 1 });
    return (t, dur) => { const sp = 8 + t * 4; env.update(t, { jingle: Math.sin(t * 19) > 0.5 ? 0.3 : 1, ring: 8, inside: 0.85, crank: -t * sp, spin: ramp(t, 0.5, dur) * 0.4 }); frozen(Dt, t, DOTHOLD, 3); holdRec(t);
      A.pose(addPose(idle(t, 0.5), CRANK(t, sp))); B.root.rotation.y = -70 * D; B.update(t, 'sit'); const [k, u] = seg(t, dur, [0.45]);
      const h = headOf(A); camPath(cam, t / dur, [h.x + 4.6, h.y + 0.6, h.z + 6.4], [h.x + 3.8, h.y + 0.4, h.z + 5.4], [h.x + 0.3, h.y - 1.2, h.z + 1.2], [h.x + 0.2, h.y - 0.8, h.z + 0.8], 28, 32); };
  },
  // 28 "A scratchy old song fills the shop."  — the needle drops, gold notes pour from the horn, warm light blooms; pull back wide over the shop
  (S, cam) => { const { env, Dt, A, B, holdRec, DOTHOLD } = shop(S, { youAt: [-7.4, 0, 3.5], youRy: 0, youFace: 'awe', dog: [-3.8, 0, 5.2], cloth: 1 });
    return (t, dur) => { const m = ramp(t, 0.2, 1.4); env.update(t, { jingle: 0.6, ring: 8, inside: 0.85 - m * 0.2, music: m, spin: 1, crank: 0 }); frozen(Dt, t, DOTHOLD, 3); holdRec(t);
      A.pose(addPose(idle(t, 0.8), hit([[0, { rFwd: 60, nod: 14, lean: 8 }], [0.6, { rFwd: 10, lFwd: 10, nod: 0, lean: -4 }], [9, { rFwd: 5, lFwd: 5, nod: -4, lean: -4, turn: 20 }]], t))); A.setFace(t > 0.6 ? 'delighted' : 'awe');
      B.root.rotation.y = -70 * D; B.update(t, 'sit');
      camPath(cam, t / dur, [-3.2, 4.6, 8.6], [1.8, 7.2, 12.4], [-7.0, 3.8, 4.8], [-4.0, 3.8, 1.0], 28, 22); };
  },
  // 29 "The fog slides back out under the door."  — floor level at the door: the white curls retreat across the checker tiles and out under the door
  (S, cam) => { const { env } = shop(S, { cloth: 1 });
    return (t, dur) => { env.update(t, { jingle: 0.5, ring: 8, inside: 0.75 * (1 - ramp(t, 0, dur * 0.9)), music: 1, spin: 1 });
      camPath(cam, t / dur, [1.6, 1.1, -1.0], [1.2, 1.3, -2.2], [-0.6, 0.6, -7], [-0.6, 1.0, -9], 24, 26); };
  },
  // 30 "And Dot blinks."  — close on Dot: colour floods back into her, she blinks twice, the record slips in her fingers; confused
  (S, cam) => { const { env, Dt, holdRec, DOTHOLD } = shop(S, { cloth: 1 });
    return (t, dur) => { env.update(t, { jingle: 0.4, ring: 8, inside: 0, music: 1, spin: 1 }); const k = ramp(t, 0.0, 0.6); fogTouch(Dt, 1 - k);
      Dt.setFace(t < 0.3 ? 'sleepy' : t < 0.4 ? 'sleeping' : t < 0.52 ? 'confused' : t < 0.6 ? 'sleeping' : 'confused');
      Dt.pose(addPose(idle(t, k), hit([[0, DOTHOLD], [0.6, DOTHOLD], [0.9, { rFwd: 40, lFwd: 30, rUp: -15, lUp: -15, nod: -6, tilt: 6 }], [9, { rFwd: 40, lFwd: 30, rUp: -15, lUp: -15, nod: -6, tilt: 6 }]], t))); holdRec(t);
      const h = headOf(Dt); faceCam(cam, t / dur, [h.x, h.y, h.z], -10, { dist: 6.2, lens: 38, side: -0.6, push: 0.6 }); };
  },
  // 31 "Is that Abe Morrow's truck out there?"  — Dot turns to the window behind her, squinting at the pink truck in the fog, talking
  (S, cam) => { const { env, Dt, A, holdRec } = shop(S, { dotFog: 0, dotFace: 'confused', youAt: [1.4, 0, 1.2], youRy: 150, youFace: 'worried', cloth: 1 });
    return (t, dur) => { env.update(t, { jingle: Math.sin(t * 17) > 0.8 ? 0.3 : 0.8, ring: 7, music: 1, spin: 1 });
      Dt.pose(addPose(addPose(idle(t, 0.9, 2), talk(t, 1)), hit([[0, { rFwd: 30, lFwd: 20, turn: 0 }], [0.6, { rFwd: 30, lFwd: 20, bodyTurn: -30, turn: -60, nod: -4 }], [9, { rFwd: 30, lFwd: 20, bodyTurn: -30, turn: -62, nod: -4 }]], t))); holdRec(t, 0);
      Dt.setFace(t > 0.7 ? 'thinking' : 'confused'); A.pose(addPose(idle(t, 0.8), lookAt(A, headOf(Dt))));
      const h = headOf(Dt); camPath(cam, t / dur, [h.x - 4.6, h.y + 0.4, h.z + 5.8], [h.x - 4.0, h.y + 0.3, h.z + 5.0], [h.x - 0.2, h.y - 0.5, h.z], [h.x - 0.2, h.y - 0.4, h.z - 0.3], 26, 28); };
  },
  // 32 "Outside, the jingle hiccups."  — over your shoulder through the glass door: the truck's bulbs stutter, the pink spill on the floor flickers
  (S, cam) => { const { env, Dt, A } = shop(S, { dotFog: 0, dotFace: 'worried', youAt: [-0.5, 0, -6.6], youRy: 180, youFace: 'worried', cloth: 1 });
    return (t, dur) => { const j = Math.sin(t * 29) > 0.2 ? 1 : 0.1; env.update(t, { jingle: t < 0.3 ? 1 : j, ring: 7 - t * 0.5, music: 1, spin: 1 });
      A.pose(addPose(idle(t, 0.8), { lean: 4, rFwd: 30, turn: Math.sin(t * 6) * 2 })); Dt.pose(addPose(idle(t, 0.8), { rFwd: 30, lFwd: 20, bodyTurn: -30, turn: -60 }));
      camPath(cam, t / dur, [1.4, 5.6, -2.2], [0.8, 5.0, -3.4], [-0.5, 4.4, -20], [-0.5, 4.2, -21], 30, 36); };
  },
  // 33 "Then it stops."  — tight through the window: the last bulbs on the truck go dark, the horn speaker falls still
  (S, cam) => { const { env, A } = shop(S, { dotFog: 0, youAt: [-4.6, 0, -7.2], youRy: 200, cloth: 1 });
    return (t, dur) => { const j = t < 0.4 ? (Math.sin(t * 40) > 0 ? 0.5 : 0.1) : 0; env.update(t, { jingle: j, ring: 6.5 - t * 1.2, music: 1, spin: 1 });
      A.pose(addPose(idle(t, 0.5), { rFwd: 15, lFwd: 15 }));
      camPath(cam, t / dur, [1.6, 5.0, -4.2], [1.3, 5.1, -5.0], [-0.4, 6.2, -22], [-0.6, 6.4, -22], 32, 38); };
  },
  // 34 "The fog rolls over the truck like a wave."  — outside, from the shop's step: a white wall rears up off the water and crashes over the truck
  (S, cam) => { const F = front(S, cam, { n: 560 });
    return (t, dur) => { const r = 8 * (1 - sm(t, 0.2, dur * 0.8)); camPath(cam, t / dur, [43, 7.5, -11], [44, 8.5, -11.5], [30, 4, 1], [30, 5, 1], 22, 20);
      F.upd(t, 32, { r, cr: 5, jingle: 0 }); shake(cam, t, dur * 0.45, 0.3); };
  },
  // 35 "Through the glass, Abe just stares at nothing."  — through the windshield: the colour drains out of Abe, his hands slide off the wheel; white fog drifts across the glass
  (S, cam) => { const { env, Ab } = cab(S, { youOn: false, ring: 13 });
    const wisps = fogBank(S, { n: 24, area: [-7, 7, 4.8, 6.6], y: [2.5, 8], size: [2.0, 3.5], col: 0xd0d8e4, opacity: 0.22, seed: 71 });
    return (t, dur) => { env.update(t, { jingle: 0, r: 13 - t * 0.3, flicker: 0 }); env.meter('0:00', true, 0.0); wisps.update(t, (x) => Math.abs(x) > 3 ? 1 : 0, { drift: [0.6, 0] }); const k = ramp(t, 0.1, 1.6); fogTouch(Ab, k);
      Ab.setFace(t < 0.5 ? 'worried' : 'sleepy'); Ab.pose(addPose(SIT, addPose(idle(t, 0.3), lerpP(WHEEL, { rFwd: 20, lFwd: 20, rUp: -5, lUp: -5, nod: -4, turn: 6 }, ramp(t, 0.6, 1.8)))));
      const h = headOf(Ab); camPath(cam, t / dur, [h.x + 0.4, h.y + 0.5, 8.2], [h.x + 0.1, h.y + 0.2, 7.4], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.2, h.z], 30, 36); };
  },
  // 36 "He doesn't know who you are anymore."  — from outside the shop window: your palm on the glass, eyes filling up (the mirrored lettering between you and the truck)
  (S, cam) => { const { env, A } = shop(S, { dotFog: 0, youAt: [-4.6, 0, -7.4], youRy: 180, youFace: 'teary', cloth: 1 });
    return (t, dur) => {
      A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 20 }], [0.6, { rFwd: 95, rUp: -15, nod: -4 }], [9, { rFwd: 95, rUp: -15, nod: -2 }]], t))); A.setFace(t > dur * 0.5 ? 'cry' : 'teary');
      const h = headOf(A); camPath(cam, t / dur, [h.x + 0.6, h.y + 0.2, -13.6], [h.x + 0.3, h.y + 0.1, -12.6], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.25, h.z], 30, 34); env.update(t, { jingle: 0, ring: 0, music: 1, spin: 1, cam }); };
  },
  // 37 "Dot grabs your arm. Only Abe knows how to stop it."  — Dot has come round the counter; she grips your arm and talks low and urgent
  (S, cam) => { const { env, Dt, A } = shop(S, { dotFog: 0, dotFace: 'determined', youAt: [-1.8, 0, -4.4], youRy: 45, youFace: 'teary', cloth: 1 });
    Dt.root.position.set(1.8, 0, -4.0); Dt.root.rotation.y = -55 * D; allow(S, ['dot', 'you']);
    return (t, dur) => { env.update(t, { jingle: 0, ring: 0, music: 1, spin: 1 });
      Dt.pose(addPose(addPose(idle(t, 0.8, 2), talk(t, t > 0.8 ? 1.2 : 0)), hit([[0, { rFwd: 20 }], [0.5, { rFwd: 82, rUp: -12, lean: 6 }], [9, { rFwd: 80, rUp: -12, lean: 6 }]], t)));
      A.pose(addPose(idle(t, 0.7), hit([[0, { turn: -40, nod: 2 }], [0.6, { turn: 10, nod: -2 }], [9, { turn: 12, nod: -3 }]], t))); A.setFace(t > 0.6 ? 'worried' : 'teary');
      camPath(cam, t / dur, [0.4, 5.0, 7.4], [0.3, 4.9, 6.0], [0.0, 4.0, -4.2], [0.0, 4.2, -4.2], 24, 28); };
  },
  // 38 "But my boat can get you to the hospital."  — Dot holds up a set of boat keys on an orange float; close on her face over them
  (S, cam) => { const { env, Dt, A } = shop(S, { dotFog: 0, dotFace: 'determined', youAt: [-1.8, 0, -4.4], youRy: 45, youFace: 'worried', cloth: 1 });
    Dt.root.position.set(1.8, 0, -4.0); Dt.root.rotation.y = -55 * D;
    const keys = new THREE.Group(); const km = new THREE.MeshStandardMaterial({ color: 0xd8b048, metalness: 0.8, roughness: 0.3 });
    keys.add(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 14), km)); const k1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.02), km); k1.position.set(0.1, -0.3, 0); keys.add(k1);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.7, 0.24), new THREE.MeshStandardMaterial({ color: 0xf28a3a })); fl.position.set(-0.15, -0.5, 0); keys.add(fl); S.add(keys);
    return (t, dur) => { env.update(t, { jingle: 0, ring: 0, music: 1, spin: 1 });
      Dt.pose(addPose(addPose(idle(t, 0.8, 2), talk(t, 1.1)), hit([[0, { rFwd: 30 }], [0.5, { rFwd: 135, rUp: -30, lean: 2 }], [9, { rFwd: 135, rUp: -30 }]], t)));
      const p = pinky(Dt, 'R'); keys.position.set(p.x, p.y + 0.45, p.z); keys.rotation.set(0, -55 * D, Math.sin(t * 4) * 0.35); A.pose(addPose(idle(t, 0.7), { turn: 12, nod: -3 }));
      const h = headOf(Dt); faceCam(cam, t / dur, [h.x, h.y - 0.3, h.z], -30, { dist: 6.6, lens: 34, side: 0.6, push: 0.6 }); };
  },
  // 39 "Five fifty-three. The song has two minutes."  — the spinning record, the spring winding down, the notes thinning; push in on the label
  (S, cam) => { const { env, Dt, A } = shop(S, { dotFog: 0, dotFace: 'worried', youAt: [-1.8, 0, -4.4], youRy: 45, cloth: 1 }); Dt.root.position.set(1.8, 0, -4.0); Dt.root.rotation.y = -55 * D;
    return (t, dur) => { env.update(t, { jingle: 0, ring: 0, music: 0.8, spin: 0.85 }); A.pose(addPose(idle(t, 0.7), { turn: -50 })); Dt.pose(idle(t, 0.8, 2));
      const g = env.gram.position; camPath(cam, t / dur, [g.x + 3.2, g.y + 2.6, g.z - 1.4], [g.x + 1.8, g.y + 1.8, g.z - 0.6], [g.x, g.y + 0.7, g.z], [g.x - 0.1, g.y + 0.7, g.z], 30, 38); };
  },
  // 40 "Nell texts again: It's under the door."  — the phone in your hand: Nell's new message pops in under your reply
  (S, cam) => { const { env, A } = shop(S, { dotFog: 0, youAt: [-1.6, 0, -4.4], youRy: 160, youFace: 'scared', cloth: 1 }); const ph = fogPhone(S);
    return (t, dur) => { env.update(t, { jingle: 0, ring: 0, music: 0.8, spin: 0.85 }); A.pose(addPose(idle(t, 0.5), { rFwd: 78, rUp: -20, lFwd: 35, nod: 18 }));
      const p = pinky(A, 'R'); ph.rotation.order = 'YXZ'; ph.rotation.set(-0.5, A.root.rotation.y + Math.PI, 0); { const n0 = new THREE.Vector3(0, 0, 1).applyQuaternion(ph.quaternion); ph.position.set(p.x + n0.x * 0.25, p.y + 0.6, p.z + n0.z * 0.25); }
      ph.screen('chat', ramp(t, 0.3, 0.9), { time: '5:53', msgs: [[0, ["Fog's at the", 'roof door.', 'Pip is scared.']], [1, ['Hold on.', "I'm coming."]], [0, ["It's under", 'the door.']]] });
      ph.updateMatrixWorld(true); const c = ph.position; const n = new THREE.Vector3(0, 0, 1).applyQuaternion(ph.quaternion);
      camPath(cam, t / dur, [c.x + n.x * 1.5, c.y + n.y * 1.5 + 0.1, c.z + n.z * 1.5], [c.x + n.x * 1.2, c.y + n.y * 1.2 + 0.05, c.z + n.z * 1.2], [c.x, c.y, c.z], [c.x, c.y, c.z], 36, 40);
      S.userData.dof = false; };
  },
  // 41 "Do you carry the music out to Abe?"  — vote shot (end card from here): you in the doorway with the record player, Dot holding the boat keys, the fog-covered truck outside
  voteShot(0),
  // 42 "Or take Dot's boat to Nell? Follow for part three."  — the same, held and pushing slowly in
  voteShot(3.2),
];
function lerpP(a, b, k) { const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) o[key] = (a[key] || 0) + ((b[key] || 0) - (a[key] || 0)) * k; return o; }
