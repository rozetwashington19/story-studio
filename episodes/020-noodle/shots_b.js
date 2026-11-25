import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn,
  pennyMesa, wellShaft, tessRoom, wishCoin, goldBurst, duckParade, endlessBread } from '../../engine/kit.js';
import { tess, pell, baker, mayor, kid, towny, noodle, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, shake, rumble, clamp01 } from './common.js';
import { BREAD, DUCKPATH, arc, scrollBread } from './shots_a.js';

const SITP = { rLeg: 90, lLeg: 90 };
const PLEAD = { rFwd: 75, lFwd: 75, rUp: -32, lUp: -32, nod: 10, lean: 14 };
// move the dog so that one of its parts lands on a world point
export function placeBy(N, part, target) { const p = N.world(part); N.root.position.x += target[0] - p.x; N.root.position.y += target[1] - p.y; N.root.position.z += target[2] - p.z; N.root.updateMatrixWorld(true); }
// the giant dog lying outside Tess's window (lines 22-27): its right eye (or nose) on the round window
function windowDog(S, t, mode, part, target, s = 7) { const N = noodle(S, s, [0, 0, -20], 0); return N; }
function phoneProp(S) { const g = new THREE.Group(); S.add(g); g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0x2a2a34, roughness: 0.3 })));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.78), new THREE.MeshBasicMaterial({ color: 0xbfe8ff })); scr.position.z = 0.045; g.add(scr); return g; }
// dog standing on the camera side of the well with its head lowered over it (lines 31-33)
const WELLDOG = [0, 0, 17.5];
function bowOver(N, t, k) { const p = N.update(t, 'idle', 'bow', k); N.apply({ ...p, _t: t, headX: p.headX + 0.5 * k, jaw: k > 0.6 ? 0.5 : p.jaw, tongue: 0 }); N.tail.rotation.x = -1.3; }

export const SHOTS_B = [
  // 20 "I begged the well for a second wish."  — night: Tess alone behind the well, hands clasped, pleading over it; the giant dog's sad head on the rooftops behind
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD); const N = noodle(S, 7, [-8, 0, -58], 0);
    const A = tess(S, 'worried', [1.0, 0, -3.5], -8); const kf = fill(S, [1.4, 6.5, 1.5], 26, 0xffd8b0, 10);
    return (t, dur) => { env.update(t); N.update(t, 'sad');
      A.pose(addPose(addPose(idle(t, 0.8), PLEAD), { nod: 10 + Math.sin(t * 2.2) * 4, rFwd: Math.sin(t * 5) * 4, lFwd: Math.sin(t * 5) * 4 })); A.setFace(t > dur * 0.5 ? 'teary' : 'worried');
      camPath(cam, sm(t, 0, dur), [1.2, 4.3, 7.0], [1.1, 4.2, 5.4], [1.0, 4.0, -3.4], [1.0, 3.9, -3.4], 34, 38);
    };
  },
  // 21 "It spat my coin back out."  — (a) in the dark shaft the coin plops in… and shoots straight back up; (b) it pings out of the well and bonks into Tess's hands; she pouts
  (S, cam) => {
    const W = new THREE.Group(); W.position.set(400, 0, 0); S.add(W); const sh = wellShaft(W, { time: 'night' }); const c1 = wishCoin(W, { s: 1.4 });
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD); const N = noodle(S, 7, [-8, 0, -58], 0);
    const A = tess(S, 'worried', [1.0, 0, -3.5], -8); const c = wishCoin(S, { s: 1.6 }); const kf = fill(S, [1.4, 6.5, 1.5], 26, 0xffd8b0, 10);
    return (t, dur) => { env.update(t); sh.update(t); N.update(t, 'sad'); const [k, lt] = seg(t, dur, [0.45]);
      if (k === 0) { const d = ramp(lt, 0, 0.4), u = ramp(lt, 0.55, 0.85); const y = lt < 0.55 ? 2 - d * 16 : -14 + u * 18; c1.position.set(0.2, y, 0.1); c1.rotation.set(t * 9, 0, 0); c1.userData.glint(0.7);
        if (d >= 1 && !sh._r) { sh.ripple(t); sh._r = 1; } sh.glow(0.15 * sm(lt, 0.4, 0.55));
        camPath(cam, lt, [400.7, -11.0, 0.6], [400.6, -11.3, 0.5], [400, 2, 0], [400, 3, 0], 20, 20); return; }
      const t0 = dur * 0.45, u = ramp(t, t0, t0 + 0.55); const hp = pinky(A, 'R');
      c.position.set(...arc([0, 1.2, 0], [hp.x, hp.y, hp.z], 2.2, u)); c.rotation.x = t * 15; c.userData.glint(0.8);
      A.pose(addPose(idle(t, 1), hit([[t0, PLEAD], [t0 + 0.45, { rFwd: 60, lFwd: 60, rUp: -20, lUp: -20, lean: -8, nod: -12 }], [t0 + 0.7, { rFwd: 50, lFwd: 55, rUp: -22, lUp: -22, lean: -2, nod: 6 }]], t)));
      A.setFace(t > t0 + 0.6 ? 'pout' : 'shock');
      camPath(cam, sm(t, t0, dur), [2.4, 4.1, 8.0], [2.1, 4.1, 7.0], [0.9, 3.4, -2.6], [1.0, 3.8, -3.2], 30, 32); shake(cam, t, t0 + 0.55, 0.4);
    };
  },
  // 22 "That night, Noodle lay down outside my window."  — wide: the giant dog sinks down in front of Tess's house, chin by her lit round window, ears flat
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD); env.follow(-36, -10);
    const N = noodle(S, 5, [0, 0, 0], -90); const kf = fill(S, [-50, 12, 2], 60, 0xffc890, 34);
    return (t, dur) => { env.update(t); const k = sm(t, 0, dur * 0.55); const p = N.update(t, 'sadsit', 'sad', k); N.apply({ ...p, _t: t, headX: p.headX + 0.1 * k, headY: -0.45 * k });
      placeBy(N, 'head', [-35.5, 8.4 + (1 - k) * 3, -8.0]);
      camPath(cam, sm(t, 0, dur), [-58, 7.0, 15], [-56, 6.6, 12.5], [-40, 9.4, -12], [-39.5, 9.2, -12], 24, 26);
    };
  },
  // 23 "His eye was bigger than my bed."  — inside: Tess sits up in bed; the whole round window is filled with one giant, shiny brown eye that blinks
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const N = noodle(S, 7, [0, -4, -20], 0); const A = tess(S, 'shock', [-5.6, 0, -2.4], 0); sitOn(A, 2.0); A.root.position.y = 2.0 - 1.5 * 0.95;
    allow(S, ['tess', 'bed*']); const ef = fill(S, [-0.5, 6.4, -8.2], 16, 0xc8d4ff, 8);
    return (t, dur) => { env.update(t); const p = N.update(t, 'sad'); N.apply({ ...p, _t: t, blink: hn([[dur * 0.55, 0], [dur * 0.65, 1], [dur * 0.78, 0]], t, x => x) }); placeBy(N, 'eyeR', [-0.5, 5.4, -11.6]);
      A.pose(addPose(SITP, { ...idle(t, 0.7), lean: -6, turn: 55, nod: -6, rUp: 10, lUp: 10 })); A.setFace(t > dur * 0.5 ? 'awe' : 'shock');
      camPath(cam, sm(t, 0, dur), [3.4, 5.4, 9.5], [2.8, 5.2, 8.0], [-2.8, 4.6, -4.6], [-2.4, 4.8, -5.0], 22, 22);
    };
  },
  // 24 "He knew something was wrong."  — close on the eye through the window: it looks down, the lid droops halfway
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const N = noodle(S, 7, [0, -4, -20], 0); const ef = fill(S, [-0.5, 6.4, -8.0], 12, 0xc8d4ff, 6);
    return (t, dur) => { env.update(t); const p = N.update(t, 'sad'); N.apply({ ...p, _t: t, blink: 0.15 + 0.3 * sm(t, dur * 0.3, dur * 0.8), headX: p.headX + 0.05 * sm(t, dur * 0.3, dur) });
      placeBy(N, 'eyeR', [-0.5, 5.4, -11.6]);
      camPath(cam, sm(t, 0, dur), [0.9, 5.2, -1.4], [0.4, 5.3, -2.8], [-0.5, 5.4, -9], [-0.5, 5.4, -9], 30, 32);
    };
  },
  // 25 "I'm sorry, buddy. I wished for the wrong thing."  — the dog's view through the round window: Tess at the sill, reaching out, eyes wet
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const A = tess(S, 'teary', [-0.5, 0, -4.7], 180); const kf = fill(S, [-0.5, 5.6, -6.4], 14, 0xbfd0ff, 8);
    return (t, dur) => { env.update(t);
      A.pose(addPose(addPose(idle(t, 0.8), talk(t)), hit([[0, { rFwd: 20, lean: 4 }], [dur * 0.4, { rFwd: 70, rUp: -6, lean: 10, nod: 4, tilt: -8 }], [dur * 0.8, { rFwd: 74, rUp: -6, lean: 12, nod: 6, tilt: -6 }]], t)));
      A.setFace(t > dur * 0.55 ? 'cry' : 'teary');
      camPath(cam, sm(t, 0, dur), [-0.5, 5.0, -12.8], [-0.5, 5.1, -11.6], [-0.5, 4.6, -4.7], [-0.5, 4.6, -4.7], 28, 30);
    };
  },
  // 26 "I didn't need a big dog. I needed a friend."  — Tess turns and leans back against his snout in the round window; his eyes close; she smiles through tears
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const N = noodle(S, 3.6, [0, -4, -20], 0); const A = tess(S, 'teary', [-0.5, 0, -4.5], 12); allow(S, ['tess', 'noodle']);
    const kf = fill(S, [0.8, 6.0, 1.5], 16, 0xffd8b0, 10);
    return (t, dur) => { env.update(t); const lk = sm(t, dur * 0.15, dur * 0.5); const p = N.update(t, 'sad'); N.apply({ ...p, _t: t, headX: 0.0, ears: -0.4, brow: -0.6 + 0.8 * lk, blink: 0.2 + 0.8 * sm(t, dur * 0.5, dur * 0.75) });
      placeBy(N, 'nose', [-0.5, 5.0, -6.3 + 0.25 * lk]);
      A.pose(addPose(addPose(idle(t, 0.6), talk(t, 0.8)), { lean: -8 * lk, tilt: 10 * lk, nod: -6 * lk, rFwd: 40 * lk, rUp: 60 * lk }));
      A.setFace(t > dur * 0.6 ? 'softsmile' : 'teary');
      camPath(cam, sm(t, 0, dur), [1.6, 5.0, 1.8], [1.3, 4.9, 0.9], [-0.5, 4.7, -5.0], [-0.5, 4.7, -5.0], 28, 30);
    };
  },
  // 27 "Then he sniffed my pocket. The coin."  — the nose snuffles at her hoodie pocket; she pulls out the gold coin — it glints
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const N = noodle(S, 3.6, [0, -4, -20], 0); const A = tess(S, 'confused', [-0.3, 0, -4.2], 20); const c = wishCoin(S, { s: 1.6 }); allow(S, ['tess', 'noodle']);
    const kf = fill(S, [2.0, 5.2, -3.0], 14, 0xffd0a0, 9);
    return (t, dur) => { env.update(t); const p = N.update(t, 'sniff'); N.apply({ ...p, _t: t, headX: 0.1 + Math.sin(t * 18) * 0.01 }); placeBy(N, 'nose', [-0.5 + Math.sin(t * 3) * 0.12, 4.6, -6.0 + Math.abs(Math.sin(t * 9)) * 0.15]);
      const tp = dur * 0.45; const up = sm(t, tp, tp + 0.5);
      A.pose(addPose(idle(t, 1), { nod: 26 - up * 18, lean: -4, rFwd: 10 + up * 75, rUp: -10 - up * 12, turn: -30 + up * 20 }));
      const hp = pinky(A, 'R'); c.position.set(hp.x, hp.y + 0.05, hp.z + 0.12); c.rotation.set(Math.PI / 2 - 0.3, 0, 0.3); c.visible = up > 0.05; c.userData.glint(up);
      A.setFace(up > 0.5 ? 'awe' : 'confused');
      camPath(cam, sm(t, 0, dur), [1.9, 4.8, 2.0], [1.6, 4.6, 1.0], [-0.4, 4.1, -5.0], [-0.4, 4.0, -4.8], 26, 28);
    };
  },
  // 28 "Wait. Noodle never made a wish."  — close-up: coin up by her face; the idea lands — worried, then wide-eyed, then determined
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const N = noodle(S, 3.6, [0, -4, -20], 0); const A = tess(S, 'thinking', [-0.5, 0, -3.6], 8); const c = wishCoin(S, { s: 1.6 });
    const kf = fill(S, [0.5, 6.0, 2.0], 16, 0xffd8b0, 10);
    return (t, dur) => { env.update(t); const p = N.update(t, 'sniff'); placeBy(N, 'nose', [-0.5, 4.9, -6.4]);
      A.pose(addPose(idle(t, 1), hit([[0, { rFwd: 95, rUp: -18, nod: 6 }], [dur * 0.4, { rFwd: 100, rUp: -16, nod: -4, turn: -40, tilt: 5 }], [dur * 0.7, { rFwd: 110, rUp: -14, nod: -2, turn: 0 }]], t)));
      const hp = pinky(A, 'R'); c.position.set(hp.x, hp.y + 0.1, hp.z + 0.1); c.rotation.set(Math.PI / 2, 0, 0); c.userData.glint(0.6 + 0.4 * Math.sin(t * 6));
      A.setFace(t < dur * 0.35 ? 'thinking' : t < dur * 0.68 ? 'shock' : 'determined');
      const h = headOf(A); faceCam(cam, sm(t, 0, dur), [h.x, h.y - 0.2, h.z], 8, { dist: 6.6, lens: 34, push: 0.9, side: 0.7, look: -0.2 });
    };
  },
  // 29 "I threw that coin as hard as I could."  — night plaza: big wind-up, Tess hurls the coin into the stars; behind her the giant dog's head pops up, ears high
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD); const N = noodle(S, 7, [-8, 0, -58], 0);
    const A = tess(S, 'determined', [3, 0, 8], -8); const c = wishCoin(S, { s: 1.8 }); const tr = goldBurst(S, 24);
    return (t, dur) => { env.update(t); const th = dur * 0.45; N.update(t, 'sad', 'tilt', sm(t, th + 0.2, th + 0.9));
      A.pose(addPose(addPose(idle(t, 1), anticipate(t, th, 2)), hit([[0, { rFwd: 30 }], [th - 0.35, { rUp: 40, rFwd: -60, lFwd: 50, lean: -8, bodyTurn: -25 }], [th, { rUp: 165, rFwd: 40, lFwd: -10, lean: 10, bodyTurn: 20, nod: -25 }], [th + 0.5, { rUp: 150, rFwd: 30, lean: 4, bodyTurn: 8, nod: -30 }]], t)));
      A.setFace(t > th ? 'determined' : 'angry');
      const hp = pinky(A, 'R'); const u = ramp(t, th, th + 1.2); const cp = t < th ? [hp.x, hp.y, hp.z] : arc([hp.x, hp.y, hp.z], [-6, 40, -30], 8, u);
      c.position.set(...cp); c.rotation.x = t * 20; c.userData.glint(t > th ? 1 : 0.5); tr.update(t, cp, t > th ? 1 : 0, { up: -1.5, spread: 0.4, size: 0.6, speed: 2 });
      camPath(cam, sm(t, 0, dur), [4.6, 2.0, 19.5], [4.2, 1.7, 17.6], [3, 6.0, -4], [1, 9, -10], 24, 24);
    };
  },
  // 30 "And Noodle did what dogs do best."  — the giant pup bounds along behind the rooftops and leaps — snap! — catches the coin out of the sky
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD); env.follow(-30, -40); const N = noodle(S, 7, [-2, 0, -44], -90); const c = wishCoin(S, { s: 5 }); const sp = goldBurst(S, 30); const df = fill(S, [0, 0, 0], 500, 0xffd8a8, 80);
    return (t, dur) => { env.update(t); const x = -2 - t * 16; N.root.position.x = x; const jmp = sm(t, dur * 0.45, dur * 0.7) * (1 - sm(t, dur * 0.75, dur));
      N.root.position.y = Math.sin(Math.PI * ramp(t, dur * 0.45, dur * 0.95)) * 9; const p = N.update(t, 'run'); N.apply({ ...p, _t: t, headX: -0.35 * jmp, jaw: t > dur * 0.68 ? 0.05 : 0.6 });
      N.torso.rotation.x = -0.25 * jmp; const m = N.world('mouth'); const cu = ramp(t, 0, dur * 0.68); const cp = [m.x - 4 * (1 - cu), m.y + 30 * (1 - cu) + 1.5, m.z + 2]; c.position.set(...cp); c.visible = cu < 1; c.rotation.x = t * 12; c.userData.glint(1);
      sp.update(t, [m.x, m.y + 2, m.z + 2], t > dur * 0.68 ? 1 - sm(t, dur * 0.7, dur) : 0, { up: 6, spread: 5, size: 1.4 });
      df.position.set(x - 6, 26, -18); camPath(cam, sm(t, 0, dur), [-4, 4.5, 24], [0, 5, 24], [-18, 18, -44], [-30, 24, -44], 22, 22);
    };
  },
  // 31 "He fetched it. Right down the well!"  — (a) the giant head dips over the well; (b) low by the well looking up at his huge face: the coin drops from his mouth straight in — gold splash
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0, flagsOn: false }); const B = endlessBread(S, BREAD); const N = noodle(S, 7, WELLDOG, 180); const c = wishCoin(S, { s: 4 }); const sp = goldBurst(S, 30);
    const A = tess(S, 'shock', [-6, 0, 1], -110); const kf = fill(S, [-2, 12, 8], 40, 0xffd0a0, 24);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.45]);
      bowOver(N, t, sm(t, 0, dur * 0.35)); const m = N.world('mouth'); const dr = ramp(t, dur * 0.5, dur * 0.85);
      c.position.set(...(dr <= 0 ? [m.x, m.y - 0.5, m.z] : arc([m.x, m.y - 0.5, m.z], [0, 0.8, 0.4], 0.8, dr))); c.rotation.x = t * 10; c.userData.glint(1); c.visible = dr < 1;
      const g = sm(t, dur * 0.85, dur); env.well.glow(g * 0.4); sp.update(t, [0, 1.6, 0], g, { up: 4, spread: 2, size: 0.5 });
      A.pose(addPose(idle(t, 1), { nod: -20, ...lookAt(A, [m.x, m.y, m.z]) }));
      if (k === 0) { camPath(cam, lt, [-22, 3.5, -11], [-21, 3.2, -10], [0, 13, 9], [0, 9, 6], 20, 20); return; }
      camPath(cam, lt, [-3.2, 1.8, -13], [-2.6, 1.6, -11.5], [0, 8, 6], [0, 6.5, 4], 22, 24); shake(cam, t, dur * 0.85, 0.5);
    };
  },
  // 32 "The well glowed gold."  — a column of gold light bursts out of the well; Tess shields her eyes; the giant face above is lit gold
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0, flagsOn: false }); const B = endlessBread(S, BREAD); const N = noodle(S, 7, WELLDOG, 180); const sp = goldBurst(S, 80);
    const A = tess(S, 'awe', [-6, 0, 1], -110);
    return (t, dur) => { env.update(t); const g = sm(t, 0, dur * 0.35); env.well.glow(g); sp.update(t, [0, 2, 0], g, { up: 16, spread: 3, size: 0.7, speed: 0.5 });
      const p = N.update(t, 'idle', 'bow', 1 - sm(t, 0, dur)); N.apply({ ...p, _t: t, headX: p.headX + 0.5 * (1 - sm(t, 0, dur)), blink: 0.2, brow: 0.6, jaw: 0.2 }); N.tail.rotation.x = -1.3;
      A.pose(addPose(idle(t, 1), hit([[0, { nod: -10 }], [dur * 0.3, { rFwd: 125, rUp: -8, lean: -10, nod: -6, turn: 35 }]], t))); A.setFace(t > dur * 0.4 ? 'starstruck' : 'awe');
      camPath(cam, sm(t, 0, dur), [-21, 3.0, -10], [-22, 2.6, -11.5], [-1, 10, 7], [0, 13, 9], 20, 20); rumble(cam, t, 0.5 * g);
    };
  },
  // 33 "And Noodle began to shrink."  — sparkles swirl round the giant; he shrinks from forty feet to a few — sitting, confused
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0, flagsOn: false }); const B = endlessBread(S, BREAD); const N = noodle(S, 7, WELLDOG, 180); const sp = goldBurst(S, 90);
    const A = tess(S, 'starstruck', [-6, 0, 1], -110);
    return (t, dur) => { env.update(t); env.well.glow(0.6 * (1 - sm(t, 0, dur))); const s = 7 - 3.8 * sm(t, dur * 0.1, dur); N.size(s);
      N.update(t, 'idle', 'tilt', sm(t, dur * 0.3, dur)); sp.update(t, [0, 0, 19], 1, { up: s * 4.4, spread: s * 1.6, size: 0.8, speed: 0.6 });
      A.pose(addPose(idle(t, 1), { rFwd: 40 * (1 - sm(t, 0, dur * 0.5)), ...lookAt(A, [0, s * 3.5, 19]) })); A.setFace(t > dur * 0.5 ? 'awe' : 'starstruck');
      camPath(cam, sm(t, 0, dur), [-15, 5, -15], [-12, 4, -10], [0, 11, 14], [0, 5, 15], 22, 22);
    };
  },
  // 34 "Smaller, and smaller..."  — he keeps shrinking as he trots across the plaza toward Tess, from pony-sized to puppy
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD); const N = noodle(S, 3.2, WELLDOG, 200); const sp = goldBurst(S, 40);
    const A = tess(S, 'awe', [-6, 0, 1], -110);
    return (t, dur) => { env.update(t); const u = sm(t, 0, dur); const s = 3.2 - 2.75 * u; N.size(s); N.root.position.set(lerpN(0, -4.4, u), 0, lerpN(15, 4.6, u)); N.root.rotation.y = (215) * D;
      N.update(t * (1 + u), 'run'); sp.update(t, [N.root.position.x, 0, N.root.position.z], 1 - u * 0.6, { up: s * 4, spread: s * 1.3, size: 0.5 });
      A.pose(addPose(idle(t, 1), { rFwd: 30 * u, lFwd: 30 * u, ...lookAt(A, [N.root.position.x, s * 2, N.root.position.z]) })); A.setFace(u > 0.5 ? 'delighted' : 'awe');
      camPath(cam, u, [-13, 3.6, -8], [-3.6, 2.2, -4.4], [-1, 5, 14], [-4.4, 1.4, 4.5], 24, 28);
    };
  },
  // 35 "until he fit right in my arms."  — the pup leaps into Tess's arms; she hugs him, laughing and crying
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD); const N = noodle(S, 0.42, [0, 0, 0], 180); allow(S, ['tess', 'noodle']);
    const A = tess(S, 'delighted', [-6, 0, 1], 25); const sp = goldBurst(S, 20); const kf = fill(S, [-4, 6, 6], 20, 0xffd8b0, 10);
    return (t, dur) => { env.update(t); const j = dur * 0.3; const u = ramp(t, j, j + 0.4);
      const hold2 = sm(t, j, j + 0.5); A.pose(addPose(idle(t, 0.7), { rFwd: 40 + hold2 * 40, lFwd: 40 + hold2 * 40, rUp: -10 - hold2 * 18, lUp: -10 - hold2 * 18, nod: 6 + hold2 * 8, lean: -4 * hold2, tilt: 10 * hold2 }));
      const hr = pinky(A, 'R'), hl = pinky(A, 'L'); const arms = [(hr.x + hl.x) / 2, (hr.y + hl.y) / 2 - 1.0, (hr.z + hl.z) / 2 + 0.2];
      const start = [-4.6, 0, 4.6]; if (t < j) N.root.position.set(start[0], 0, start[2]); else N.root.position.set(...arc(start, arms, 1.2, u));
      N.root.rotation.y = (t < j ? 215 : 200) * D; N.update(t, t < j ? 'bow' : 'wag'); sp.update(t, arms, 0.5 * hold2, { up: 2, spread: 1, size: 0.3 });
      A.setFace(t > j + 0.5 ? 'laugh' : 'delighted');
      const h = headOf(A); faceCam(cam, sm(t, 0, dur), [h.x, h.y - 0.8, h.z], 25, { dist: 7.2, lens: 32, push: 1.0, side: 0.9, look: -0.3 });
    };
  },
  // 36 "I'll never know what he wished for."  — Tess's room: she sits up in bed, the little pup asleep against her; moonlight through the round window
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const A = tess(S, 'softsmile', [-5.6, 0, -5.7], 0); sitOn(A, 2.0); A.root.position.y = 2.0 - 1.5 * 0.95;
    const N = noodle(S, 0.42, [-4.25, 2.0, -4.2], -30); allow(S, ['tess', 'bed*'], ['noodle', 'bed*'], ['tess', 'noodle']);
    return (t, dur) => { env.update(t); N.update(t, 'sleep');
      A.pose(addPose(SITP, { ...idle(t, 0.6), lFwd: 35, lUp: -18, nod: 10, turn: 30, tilt: 6 }));
      camPath(cam, sm(t, 0, dur), [2.2, 5.6, 5.0], [1.0, 5.0, 2.6], [-4.4, 3.6, -4.8], [-4.6, 3.6, -4.8], 24, 28);
    };
  },
  // 37 "But he sleeps on my bed every night."  — close: she scratches behind his floppy ear; his tail thumps twice in his sleep
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const A = tess(S, 'smile', [-5.6, 0, -5.7], 0); sitOn(A, 2.0); A.root.position.y = 2.0 - 1.5 * 0.95;
    const N = noodle(S, 0.42, [-4.25, 2.0, -4.2], -30); allow(S, ['tess', 'bed*'], ['noodle', 'bed*'], ['tess', 'noodle']);
    return (t, dur) => { env.update(t); const p = N.update(t, 'sleep'); N.apply({ ...p, _t: t, wag: 0.7 * Math.max(0, Math.sin(t * 2.5)), wagSpeed: 10 });
      A.pose(addPose(SITP, { ...idle(t, 0.6), lFwd: 38 + Math.sin(t * 7) * 6, lUp: -18, nod: 16, turn: 34, tilt: 8 }));
      camPath(cam, sm(t, 0, dur), [-0.6, 4.9, 0.9], [-1.0, 4.7, 0.1], [-4.8, 3.7, -4.6], [-4.8, 3.6, -4.7], 28, 30);
    };
  },
  // 38 "Now I never eat lunch alone."  — day: Tess and three classmates sit on the endless bread eating lunch, laughing; little Noodle begs in front, tail going
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const sit = (A, x, k) => { const z = 13.2 + (4 - x) / 12 * 1.2; A.root.position.set(x, 1.5 - 1.5 * k, z + 0.2); A.root.rotation.y = 5 * D; };
    const A = tess(S, 'laugh', [0, 0, 0], 0); const K = [kid(S, 0, 'laugh', [0, 0, 0], 0), kid(S, 1, 'grin', [0, 0, 0], 0), kid(S, 2, 'laugh', [0, 0, 0], 0)];
    sit(A, -1.1, 0.95); sit(K[0], 3.9, 0.92); sit(K[1], -5.5, 0.92); sit(K[2], -9.9, 0.92); const N = noodle(S, 0.45, [-3.3, 0, 17.4], 0); allow(S, ['*', 'noodle']);
    return (t, dur) => { env.update(t); scrollBread(B, t); N.update(t, 'sit', 'bark', 0.5 + 0.5 * Math.sin(t * 3));
      A.pose(addPose(SITP, { ...idle(t, 1), rFwd: 60 + Math.sin(t * 3) * 10, rUp: -10, turn: -20, bob: Math.abs(Math.sin(t * 7)) * 0.04 })); A.setFace(t > dur * 0.5 ? 'laugh' : 'grin');
      K.forEach((k, i) => k.pose(addPose(SITP, { ...idle(t, 1, i), rUp: 20 + Math.abs(Math.sin(t * 6 + i)) * 25, lFwd: 50, turn: i === 0 ? -35 : 25, bob: Math.abs(Math.sin(t * 7 + i)) * 0.05 })));
      camPath(cam, sm(t, 0, dur), [-2.4, 4.8, 28], [-3.0, 4.4, 25.5], [-3.0, 3.2, 14], [-3.0, 3.0, 14.5], 26, 28);
    };
  },
  // 39 "Mrs. Pell's ducks still follow her."  — the duck parade marches past again… and trotting proudly at the very end of the line: little Noodle
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD); const n = 14;
    const D1 = duckParade(S, n, DUCKPATH, { spacing: 0.8, jitter: 1.0, s: 1.35, seed: 9 }); const P = pell(S, 'bored', [0, 0, 0], 100); const N = noodle(S, 0.45, [0, 0, 0], 0);
    return (t, dur) => { env.update(t); scrollBread(B, t); const lead = 62 + t * 2.4; D1.update(t, lead);
      const at = (d) => { const u = clamp01(d / D1.length); return [D1.curve.getPointAt(u), D1.curve.getTangentAt(u)]; };
      const [p, tg] = at(lead + 2.4); P.root.position.set(p.x, 0, p.z); P.root.rotation.y = Math.atan2(tg.x, tg.z); P.pose(addPose(walk(t, 0.8, 26), { rFwd: 20, lFwd: 20, turn: -30 })); P.setFace(t > dur * 0.5 ? 'smirk' : 'bored');
      const [q, tq] = at(lead - n * 0.8 - 1.0); N.root.position.set(q.x, 0, q.z); N.root.rotation.y = Math.atan2(tq.x, tq.z); N.update(t * 0.8, 'run');
      const u = sm(t, dur * 0.15, dur * 0.8); const lx = p.x + (q.x - p.x) * u, lz = p.z + (q.z - p.z) * u, ly = 3.6 + (1.2 - 3.6) * u; camPath(cam, 0, [lx + 3, 3.6, lz + 10], [lx + 3, 3.6, lz + 10], [lx, ly, lz], [lx, ly, lz], 28, 28);
    };
  },
  // 40 "And Noodle?"  — night, Tess's room: the pup sits up on the bed, chest out, very serious; Tess clicks on her phone light
  (S, cam) => {
    const env = tessRoom(S, { night: true }); env.lamp.intensity = 2; const N = noodle(S, 0.42, [-4.2, 2.0, -3.0], 90); const A = tess(S, 'smirk', [-1.0, 0, -0.4], -120);
    const ph = phoneProp(S); const L = new THREE.SpotLight(0xfff4e0, 0, 30, 0.7, 0.3, 1.2); L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.002; S.add(L, L.target);
    allow(S, ['noodle', 'bed*']);
    return (t, dur) => { env.update(t); env.lamp.intensity = 2; N.update(t, 'sit', 'tilt', sm(t, dur * 0.4, dur));
      A.pose(addPose(idle(t, 1), { rFwd: 80, rUp: -8, ...lookAt(A, [-4.2, 3, -3.0]) })); hold(ph, A, 'R', [0, 0.2, 0]); ph.lookAt(-4.2, 2.8, -3.0);
      L.position.copy(ph.position); L.target.position.set(-4.2, 3.0, -3.0); L.intensity = 26 * sm(t, dur * 0.45, dur * 0.55);
      camPath(cam, sm(t, 0, dur), [-3.0, 3.7, 2.0], [-3.2, 3.5, 1.2], [-4.2, 2.9, -3.0], [-4.2, 2.9, -3.0], 30, 34);
    };
  },
  // 41 "He still thinks he's the biggest dog in the world."  — pull back: on the wall his shadow is enormous; he gives a tiny proud bark and the giant shadow barks with him; Tess laughs
  (S, cam) => {
    const env = tessRoom(S, { night: true }); const N = noodle(S, 0.42, [-4.2, 2.0, -3.0], 90); const A = tess(S, 'laugh', [-1.0, 0, -0.4], -120);
    const ph = phoneProp(S); const L = new THREE.SpotLight(0xfff4e0, 26, 30, 0.7, 0.3, 1.2); L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.002; S.add(L, L.target);
    allow(S, ['noodle', 'bed*']);
    return (t, dur) => { env.update(t); env.lamp.intensity = 2; const b = t > dur * 0.35 && t < dur * 0.75; N.update(t, b ? 'bark' : 'tilt');
      A.pose(addPose(idle(t, 1), { rFwd: 80, rUp: -8, bob: Math.abs(Math.sin(t * 8)) * 0.05, ...lookAt(A, [-4.2, 3, -3.0]) })); hold(ph, A, 'R', [0, 0.2, 0]); ph.lookAt(-4.2, 2.8, -3.0);
      L.position.copy(ph.position); L.target.position.set(-4.2, 3.0, -3.0); A.setFace(t > dur * 0.5 ? 'laugh' : 'grin');
      camPath(cam, sm(t, 0, dur * 0.8), [-3.2, 3.5, 1.2], [3.6, 5.4, 7.5], [-4.2, 2.9, -3.0], [-6.4, 4.2, -3.8], 34, 22);
    };
  },
];
function lerpN(a, b, k) { return a + (b - a) * k; }
