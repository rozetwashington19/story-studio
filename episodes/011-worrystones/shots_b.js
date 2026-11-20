import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, seg, hit, talk, lookAt, anticipate, sob, pinky, T,
  ferryDeck, keeperAttic, lighthouseCliff, lanternRoom, worryStone, stonePile, packProp } from '../../engine/kit.js';
import { MILO, JUNE, MOSS, CREW, KIDS, PACK, mk, milo, june, moss, pack, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, TRUDGE, STRAPS } from './common.js';

const pathX = z => -11 * Math.max(0, Math.min(1, (10 - z) / 26)) ** 1.6;   // same curve as lighthouseCliff's path
const SITF = { rLeg: 90, lLeg: 90 };
const flashlight = (S, on = true) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.7, 10), std({ color: 0x2a6ab8, metalness: 0.4 })); b.rotation.x = Math.PI / 2; g.add(b);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.13, 12), new THREE.MeshBasicMaterial({ color: on ? 0xfff6d0 : 0x8a8a8a })); lens.position.z = 0.36; g.add(lens);
  const sp = new THREE.SpotLight(0xfff0d0, on ? 60 : 0, 22, 0.35, 0.5, 1.4); sp.position.z = 0.4; sp.target.position.set(0, -0.6, 6); g.add(sp, sp.target); g.userData.spot = sp; g.userData.lens = lens; S.add(g); return g; };
// lantern-room layout: June sits at (-2.2, 0.8), Milo's seat (2.2, 0.8); her pack on her right (-x), piles in front between them
const JX = -2.2, MX = 2.2, SZ = 0.8;
function room(S, { milosPile = true, junesPile = true, hersOpen = true, hisPack = false } = {}) {
  const env = lanternRoom(S);
  const hp = packProp(S, { col: PACK.june, s: 2.0 }); hp.group.position.set(-6.3, 0, 1.0); hp.group.rotation.y = -Math.PI / 2; hp.open(hersOpen ? 0.9 : 0);
  const mine = milosPile ? stonePile(S, [0.9, 0, 3.1], { n: 18, r: 0.75, h: 0.5, seed: 21, s: 0.55, labels: ['MILO'] }) : null;
  if (mine) mine.stones.forEach(s2 => { if (s2.userData.label) s2.userData.label.visible = true; });
  const hers = junesPile ? stonePile(S, [-0.9, 0, 3.7], { n: 14, r: 0.7, h: 0.45, seed: 33, s: 0.55, labels: ['FINALS', 'MATH', 'COLLEGE'] }) : null;
  const mp = hisPack ? packProp(S, { col: PACK.milo, s: 1.4 }) : null; if (mp) { mp.group.position.set(6.3, 0, 1.2); mp.group.rotation.y = Math.PI / 2; mp.open(0.9); }
  return { env, hp, mine, hers, mp };
}
const sitJune = (S, face, ry = 0) => { const J = june(S, face, [JX, 0, SZ], ry); J.root.position.y = -1.5 * 1.07; allow(S, ['june', 'floor']); return J; };
const sitMilo = (S, face, ry = 0) => { const M = milo(S, face, [MX, -1.5, SZ], ry); allow(S, ['milo', 'floor']); return M; };

export const SHOTS_B = [
  // 25 "That week, June's backpack got smaller."  — ferry ride home at sunset: June's coral pack shrinks as she walks, she exhales; Milo trudges behind under his
  (S, cam) => {
    const env = ferryDeck(S, { time: 'sunset' });
    const J = june(S, 'relieved', [-3.5, 0, -3], 25); const P = pack(J, 'june', 3.2);
    const Mi = milo(S, 'pout', [9, 0, -5.4], -90); const PM = pack(Mi, 'milo', 2.4);
    const sp = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffe8b0 })); S.add(m); sp.push(m); }
    return (t, dur) => { env.update(t);
      const k = sm(t, 0.1, dur * 0.85); P.grow(3.2 - k * 1.6);
      J.root.position.set(-3.5 + t * 0.8, 0, -3 + t * 1.7); J.pose(addPose(walk(t, 1, 22), { ...STRAPS, lean: 8 - k * 6, nod: -6 + k * 10 }));
      J.setFace(k < 0.5 ? 'worried' : 'relieved');
      const c = headOf(J); sp.forEach((m, i) => { const a = i * 2.3 + t * 3; m.position.set(c.x - 1.5 + Math.cos(a) * 1.4, c.y + 1.5 + ((t + i * 0.2) % 1.2), c.z - 1.5 + Math.sin(a) * 1.4); m.visible = k > 0.05 && k < 0.98; });
      Mi.root.position.x = 9 - t * 0.9; Mi.pose(TRUDGE(t, 1));
      camPath(cam, t / dur, [0.5, 4.6, 10.4], [1.0, 4.6, 10.2], [-1.0, 4.4, -2.0], [-0.2, 4.4, -1.0], 24, 26);
    };
  },
  // 26 "And every night, she climbed the lighthouse."  — night cliff: June walks the gravel path with a flashlight; tilt up the tower as the beam sweeps
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'night' });
    const J = june(S, 'neutral', [pathX(-3), 0, -3], 200); const P = pack(J, 'june', 1.8); const fl = flashlight(S);
    fill(S, [1, 5, 2], 4, 0xb8c8ff, 14);
    return (t, dur) => { env.update(t + 2);
      const z = -3 - t * 1.9, x = pathX(z), x2 = pathX(z - 0.5); J.root.position.set(x, 0, z); J.root.rotation.y = Math.atan2(x2 - x, -0.5) ;
      J.pose(addPose(walk(t, 1, 24), { rFwd: 60, rUp: -10 }));
      hold(fl, J, 'R', [0, 0.1, 0]); fl.rotation.y = J.root.rotation.y; fl.rotation.x = 0.15;
      camPath(cam, t / dur, [-5.6, 2.4, 4.6], [-5.8, 2.6, 4.0], [-3.0, 3.6, -5.5], [-8.0, 10.0, -16], 24, 22);
    };
  },
  // 27 "So I followed her up."  — Milo creeps up the path after her, crouched, eyes on the tower
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'night' });
    const Mi = milo(S, 'nervous', [pathX(4), 0, 4], 195); fill(S, [-3, 5, -1], 5, 0xffd8b0, 12);
    return (t, dur) => { env.update(t + 4);
      const z = 4 - t * 1.4, x = pathX(z); Mi.root.position.set(x, 0, z);
      Mi.pose(addPose(walk(t * 0.8, 1, 26), { lean: 22, bob: -0.35, rFwd: 40, lFwd: 30, nod: -12, turn: Math.sin(t * 2.5) * 18 }));
      if (t > dur * 0.5) Mi.setFace('determined');
      const h = headOf(Mi); camPath(cam, t / dur, [h.x - 3.0, 3.4, h.z - 5.6], [h.x - 2.4, 3.6, h.z - 5.0], [h.x, h.y - 0.5, h.z], [h.x, h.y - 0.4, h.z], 30, 32);
    };
  },
  // 28 "She sat by the big lamp,"  — his POV rising out of the floor hatch: June sitting by the huge glowing lens
  (S, cam) => {
    const { env } = room(S, { milosPile: false, junesPile: false });
    const J = sitJune(S, 'sad', 0);
    env.lid.rotation.x = -1.9;
    return (t, dur) => { env.update(t);
      J.pose(addPose(addPose(SITF, idle(t, 0.5)), { rUp: 30, rFwd: 40, nod: 20, turn: -20 }));
      camPath(cam, t / dur, [-0.2, 1.4, 6.9], [-0.6, 3.0, 6.7], [JX + 0.6, 3.2, SZ - 1.0], [JX + 0.6, 3.6, SZ - 1.5], 22, 24);
    };
  },
  // 29 "sorting stones from her backpack."  — June takes a stone from her pack, reads it, sets it on one of two piles
  (S, cam) => {
    const { env, hp } = room(S);
    const J = sitJune(S, 'thinking', 0); const st = worryStone(S, 'MILO', { s: 0.6, seed: 5 });
    return (t, dur) => { env.update(t);
      const k = t / dur;
      J.pose(addPose(addPose(SITF, idle(t, 0.5)), hit([[0, { rUp: 35, rFwd: 25, turn: -45, nod: 18 }], [0.5, { rUp: 10, rFwd: 70, turn: -10, nod: 22 }], [1.1, { rUp: -10, rFwd: 75, lFwd: 40, turn: 15, nod: 24 }], [1.6, { rUp: -25, rFwd: 60, turn: 25, nod: 20 }]], t)));
      const h = pinky(J, 'R'); if (t < 1.4) st.position.set(h.x, h.y + 0.1, h.z + 0.15); else st.position.lerp(new THREE.Vector3(0.9, 0.7, 3.0), 0.25); st.rotation.set(0.9, 0.3, 0);
      if (t > 0.6) J.setFace('sad');
      camPath(cam, k, [1.8, 4.2, 6.4], [1.2, 4.0, 5.8], [-2.4, 2.6, 1.6], [-2.0, 2.6, 1.8], 30, 32);
    };
  },
  // 30 (HOOK) "Half of them had my name on them."  — close on the stone in her hands: MILO; tilt up to her face in the lamplight
  (S, cam) => {
    const { env } = room(S);
    const J = sitJune(S, 'sad', 0); const st = worryStone(S, 'MILO', { s: 0.75, seed: 6, glow: 0.05 });
    fill(S, [JX + 1, 3.6, 4], 3, 0xffc890, 8);
    return (t, dur) => { env.update(t);
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), { rFwd: 75, lFwd: 75, rUp: -28, lUp: -28, nod: 26 - 6 * sm(t, 1.2, 2.2) }));
      const a = pinky(J, 'R'), b = pinky(J, 'L'); st.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.25, (a.z + b.z) / 2 + 0.1); st.rotation.set(0.75, 0, 0);
      if (t > 1.4) J.setFace('teary');
      const h = headOf(J);
      camPath(cam, sm(t, 0.2, dur), [JX + 0.6, 3.6, 6.4], [JX + 0.8, h.y + 0.6, 7.0], [st.position.x, st.position.y, st.position.z], [h.x, h.y - 0.5, h.z], 34, 32);
    };
  },
  // 31 "You were so scared when we moved here."  — June turns to find Milo standing there; she speaks, eyes wet
  (S, cam) => {
    const { env } = room(S);
    const J = sitJune(S, 'shock', 0); const Mi = milo(S, 'sad', [3.4, 0, 3.6], -120);
    return (t, dur) => { env.update(t);
      J.root.rotation.y = 35 * sm(t, 0.0, 0.5) * D;
      J.pose(addPose(addPose(SITF, idle(t, 0.5)), addPose({ rFwd: 40, lFwd: 40, rUp: -15, lUp: -15 }, t > 0.5 ? talk(t, 0.8) : { nod: 6 })));
      if (t > 0.5) J.setFace('teary');
      Mi.pose(addPose(idle(t, 0.6, 3), lookAt(Mi, headOf(J))));
      faceCam(cam, t / dur, headOf(J).toArray(), 35, { dist: 6.4, lens: 36, side: 0.6, push: 0.7, look: -0.3 });
    };
  },
  // 32 "So I took them. Every night."  — wide two-shot: June nods at the pile of his stones; Milo, standing, looks down at them
  (S, cam) => {
    const { env, mine } = room(S);
    const J = sitJune(S, 'teary', 30); const Mi = milo(S, 'sad', [3.4, 0, 3.6], -120);
    return (t, dur) => { env.update(t);
      J.pose(addPose(addPose(SITF, idle(t, 0.5)), addPose(hit([[0, { rFwd: 40 }], [0.5, { rFwd: 70, rUp: -30, turn: -10, nod: 14 }]], t), talk(t, 0.7))));
      Mi.pose(addPose(idle(t, 0.6, 3), lookAt(Mi, [0.9, 0.6, 3.1])));
      if (t > 0.6) Mi.setFace('teary');
      camPath(cam, t / dur, [-3.0, 5.4, 6.3], [-2.6, 5.2, 6.4], [0.6, 2.8, 1.8], [0.8, 2.8, 1.8], 22, 22);
    };
  },
  // 33 "But I can't carry both of us anymore."  — June close-up: her voice breaks; she cries, the lens light behind her
  (S, cam) => {
    const { env } = room(S);
    const J = sitJune(S, 'teary', 30);
    return (t, dur) => { env.update(t);
      J.pose(addPose(addPose(addPose(SITF, idle(t, 0.4)), { rFwd: 55, lFwd: 55, rUp: -20, lUp: -20 }), t < 1.3 ? talk(t, 0.7) : addPose(sob(t, 0.8), { nod: 18 })));
      J.setFace(t < 1.3 ? 'teary' : 'cry');
      faceCam(cam, t / dur, headOf(J).toArray(), 30, { dist: 6.0, lens: 38, side: 0.5, push: 1.0, look: -0.25 });
    };
  },
  // 34 "She'd been carrying me for two years."  — Milo close-up, 3/4, lamplight across his face; his eyes fill
  (S, cam) => {
    const { env } = room(S);
    const Mi = milo(S, 'sad', [3.4, 0, 3.6], -115); fill(S, [-0.5, 4.4, 5.8], 4, 0xffc890, 8);
    return (t, dur) => { env.update(t);
      Mi.pose(addPose(idle(t, 0.5), { nod: 14 - 6 * sm(t, 0.8, 1.6), rFwd: 10, lFwd: 10 }));
      if (t > dur * 0.5) Mi.setFace('teary');
      faceCam(cam, t / dur, headOf(Mi).toArray(), -70, { dist: 6.0, lens: 38, side: 0.3, push: 1.0, look: -0.25 });
    };
  },
  // 35 "And she never said a word."  — from outside the lantern glass: two small figures inside the glowing lighthouse top, beams turning over the night sea
  (S, cam) => {
    const { env } = room(S);
    const J = sitJune(S, 'teary', 30); const Mi = milo(S, 'sad', [3.4, 0, 3.6], -120);
    return (t, dur) => { env.update(t);
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), { nod: 22, rFwd: 50, lFwd: 50, rUp: -20, lUp: -20 })); Mi.pose(addPose(idle(t, 0.5, 2), { nod: 18 }));
      camPath(cam, t / dur, [4.0, 8.4, 16.5], [1.5, 7.2, 14.5], [0.4, 3.2, 0.5], [0.0, 3.0, 0.5], 30, 30);
    };
  },
  // 36 "So I sat down next to her."  — Milo crosses and sits down beside her; she looks over at him
  (S, cam) => {
    const { env } = room(S);
    const J = sitJune(S, 'teary', 0); const Mi = milo(S, 'sad', [3.4, 0, 3.6], -120); allow(S, ['milo', 'floor']);
    return (t, dur) => { env.update(t);
      const w = sm(t, 0, 0.75), s = sm(t, 0.7, 1.15);
      Mi.root.position.set(3.4 - w * 1.2, -1.5 * s, 3.6 - w * 2.8); Mi.root.rotation.y = (-120 + 120 * sm(t, 0.4, 0.9)) * D;
      Mi.pose(s > 0 ? addPose({ rLeg: 90 * s, lLeg: 90 * s, lean: 10 * (1 - s) }, idle(t, 0.5)) : walk(t, 1, 22));
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), addPose({ rFwd: 45, lFwd: 45, rUp: -20, lUp: -20 }, lookAt(J, headOf(Mi)))));
      if (t > 1.0) { Mi.setFace('softsmile'); J.setFace('teary'); }
      camPath(cam, t / dur, [-1.6, 4.4, 6.8], [-1.2, 4.2, 6.8], [0.8, 2.8, 1.4], [0.6, 2.8, 1.2], 22, 22);
    };
  },
  // 37 "I took my worries back."  — Milo sweeps his arms; the MILO stones lift off the pile and arc into his own open pack
  (S, cam) => {
    const { env, mine, mp } = room(S, { hisPack: true });
    const J = sitJune(S, 'awe', 15); const Mi = sitMilo(S, 'determined', 0);
    const from = mine.stones.map(s2 => s2.position.clone().add(mine.group.position));
    const to = new THREE.Vector3(5.4, 1.6, 1.2);
    return (t, dur) => { env.update(t);
      Mi.pose(addPose(addPose(SITF, idle(t, 0.5)), hit([[0, { rFwd: 60, lFwd: 60, rUp: -20, lUp: -20, nod: 20 }], [0.3, { rFwd: 80, lFwd: 80, rUp: 10, lUp: 30, turn: -20, nod: 22 }], [0.9, { rFwd: 40, lFwd: 70, rUp: 20, lUp: 40, turn: 40 }]], t)));
      mine.stones.forEach((s2, i) => { const u = sm(t, 0.2 + i * 0.03, 0.55 + i * 0.03); const p = from[i].clone().lerp(to, u); p.y += Math.sin(u * Math.PI) * 1.8; s2.position.copy(p.sub(mine.group.position)); s2.visible = u < 0.98; s2.rotation.x = u * 5; s2.glow(0.4 * Math.sin(u * Math.PI)); });
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), addPose({ rFwd: 45, lFwd: 45, rUp: -20, lUp: -20 }, lookAt(J, headOf(Mi)))));
      camPath(cam, t / dur, [-4.4, 5.6, 5.4], [-4.2, 5.4, 5.5], [1.6, 2.0, 1.8], [1.8, 2.0, 1.8], 18, 18);
    };
  },
  // 38 "Then I took one of hers."  — he leans across and picks a stone from HER pile; June blinks at him, surprised
  (S, cam) => {
    const { env, hers, mp } = room(S, { milosPile: false, hisPack: true });
    const J = sitJune(S, 'teary', 15); const Mi = sitMilo(S, 'softsmile', -15);
    const pick = hers.stones[hers.stones.length - 1]; const p0 = pick.position.clone().add(hers.group.position);
    const lbl = worryStone(S, 'MATH', { s: 0.55, seed: 2 }); pick.visible = false;
    return (t, dur) => { env.update(t);
      Mi.pose(addPose(addPose(SITF, idle(t, 0.5)), hit([[0, { rFwd: 30, nod: 10 }], [0.5, { lFwd: 85, lUp: 35, lean: 14, turn: -30, nod: 24 }], [1.1, { lFwd: 80, lUp: 10, lean: 4, turn: -10, nod: 12 }], [1.7, { lFwd: 70, lUp: -15, nod: 10 }]], t)));
      const u = sm(t, 0.6, 1.2); const h = pinky(Mi, 'L'); lbl.position.lerpVectors(p0, new THREE.Vector3(h.x, h.y + 0.1, h.z + 0.2), u); lbl.rotation.set(0.6 * u, 0, 0);
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), addPose({ rFwd: 45, lFwd: 45, rUp: -20, lUp: -20 }, lookAt(J, t < 0.9 ? lbl.position : headOf(Mi)))));
      J.setFace(t < 0.8 ? 'teary' : t < 1.5 ? 'shock' : 'confused');
      camPath(cam, t / dur, [-0.3, 6.0, 7.0], [0.0, 5.8, 6.9], [0, 2.5, 1.4], [0, 2.7, 1.2], 16, 17);
    };
  },
  // 39 "It said math. I love math."  — a: the stone in his palm: MATH · b: Milo's grin, eyebrows up at his sister
  (S, cam) => {
    const { env } = room(S, { milosPile: false, hisPack: true });
    const J = sitJune(S, 'confused', 15); const Mi = sitMilo(S, 'smirk', -15); const st = worryStone(S, 'MATH', { s: 0.6, seed: 2, glow: 0.05 });
    fill(S, [MX - 1, 3.8, 4.4], 3, 0xffc890, 8);
    return (t, dur) => { env.update(t);
      const [i, p] = seg(t, dur, [0.5]);
      Mi.pose(addPose(addPose(SITF, idle(t, 0.5)), addPose({ lFwd: 70, lUp: -15, nod: i === 0 ? 20 : 6 }, i === 1 ? { turn: -25, tilt: 8 } : {})));
      const h = pinky(Mi, 'L'); st.position.set(h.x, h.y + 0.4, h.z + 0.35); st.rotation.set(0.95, 0, 0);
      Mi.setFace(i === 0 ? 'thinking' : 'mischief');
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), addPose({ rFwd: 45, lFwd: 45, rUp: -20, lUp: -20 }, lookAt(J, headOf(Mi)))));
      if (i === 0) camPath(cam, p, [MX + 0.4, 3.6, 4.8], [MX + 0.3, 3.2, 4.4], [st.position.x, st.position.y, st.position.z], [st.position.x, st.position.y, st.position.z], 40, 44);
      else faceCam(cam, p, headOf(Mi).toArray(), -20, { dist: 6.2, lens: 36, side: -0.6, push: 0.6 });
    };
  },
  // 40 "In my hands, it weighed almost nothing."  — he flips the stone up like a pebble and catches it; June laughs through her tears
  (S, cam) => {
    const { env } = room(S, { milosPile: false, hisPack: true });
    const J = sitJune(S, 'teary', 15); const Mi = sitMilo(S, 'grin', -15); const st = worryStone(S, 'MATH', { s: 0.6, seed: 2, glow: 0.05 });
    return (t, dur) => { env.update(t);
      const fl = (tt, t0) => { const u = (tt - t0) / 0.8; return u > 0 && u < 1 ? Math.sin(u * Math.PI) * 2.0 : 0; };
      const jy = fl(t, 0.3) + fl(t, 1.2);
      Mi.pose(addPose(addPose(SITF, idle(t, 0.5)), { lFwd: 70 + (jy > 0.05 ? 15 : 0), lUp: -15, nod: 6 - jy * 6 }));
      const h = pinky(Mi, 'L'); st.position.set(h.x, h.y + 0.12 + jy, h.z + 0.2); st.rotation.set(0.7 + jy * 2, jy, 0);
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), addPose({ rFwd: 45, lFwd: 60, rUp: -20, lUp: -25 }, addPose(lookAt(J, st.position), t > 1.0 ? { bob: Math.abs(Math.sin(t * 10)) * 0.04, tilt: Math.sin(t * 5) * 4 } : {}))));
      J.setFace(t < 0.9 ? 'teary' : 'laugh'); if (t > 1.3) Mi.setFace('laugh');
      camPath(cam, t / dur, [0.3, 5.6, 7.0], [0.0, 5.4, 6.9], [0, 2.9, 0.8], [0, 3.1, 0.8], 16, 17);
    };
  },
  // 41 "Now we carry one backpack, together."  — sunset cliff: Milo and June walk down the path toward us, one pack hanging between them, a strap each
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'sunset' });
    const J = june(S, 'softsmile', [0, 0, 0], 0); const Mi = milo(S, 'smile', [0, 0, 0], 0);
    const P = packProp(S, { col: PACK.milo, s: 1.3 });
    return (t, dur) => { env.update(t);
      const z = -2 + t * 1.6, cx = pathX(z) + 0.2; J.root.position.set(cx - 2.2, 0, z); Mi.root.position.set(cx + 2.2, 0, z);
      J.pose(addPose(walk(t, 1, 20), { lUp: -12, lFwd: 6 + Math.sin(t * 6) * 4, turn: 15, ...{} })); Mi.pose(addPose(walk(t + 0.5, 1, 20), { rUp: -12, rFwd: 6, turn: -15 }));
      const a = pinky(J, 'L'), b = pinky(Mi, 'R'); P.group.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 - 1.3 * 1.75 + 0.1, (a.z + b.z) / 2 - 0.7); P.group.rotation.set(Math.sin(t * 6) * 0.05, Math.PI, 0);
      camPath(cam, t / dur, [cx + 1.0, 4.2, z + 13.5], [cx + 0.6, 4.4, z + 12.5], [cx, 3.4, z], [cx, 3.6, z], 22, 23);
    };
  },
  // 42 "I help her with math. She helps me with the dark."  — a: bench at dusk, Milo explains a flashcard, June nods · b: the lamps come on; she hands him her flashlight
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'sunset' });
    const J = june(S, 'thinking', [0.8, 0, -9.2], 15); J.root.position.y = 1.6 - 1.5 * 1.07; const Mi = milo(S, 'grin', [5.2, 0.1, -9.2], -15);
    allow(S, ['june', 'bench'], ['milo', 'bench']); const P = packProp(S, { col: PACK.milo, s: 1.0 }); P.group.position.set(3, 0, -6.9); P.group.rotation.y = Math.PI;
    const cd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.03), std({ color: 0xfaf8ee })); S.add(cd); const fl = flashlight(S, false);
    return (t, dur) => { env.update(t);
      const [i, p] = seg(t, dur, [0.5]); const u = t - dur * 0.5;
      if (i === 0) { J.pose(addPose(addPose(SITF, idle(t, 0.4)), { rFwd: 75, rUp: -20, nod: 12 + Math.sin(t * 5) * 5 })); Mi.pose(addPose(addPose(SITF, idle(t, 0.5)), addPose({ lFwd: 80, lUp: -30, turn: -25 }, talk(t, 0.8))));
        hold(cd, J, 'R', [0.2, 0.3, 0.2]); cd.rotation.set(-0.5, 0.4, 0); cd.visible = true; fl.visible = false; J.setFace(t > 0.6 ? 'delighted' : 'thinking');
        camPath(cam, p, [3, 5.2, 3.8], [3, 5.1, 3.0], [3, 4.0, -9.2], [3, 4.0, -9.2], 22, 23); }
      else { cd.visible = false; fl.visible = true; env.lamps.forEach(l => l.intensity = 9 * sm(u, 0, 0.3));
        J.pose(addPose(addPose(SITF, idle(t, 0.4)), hit([[0, { rFwd: 40 }], [0.5, { rFwd: 85, rUp: -40, turn: -25 }]], u))); Mi.pose(addPose(addPose(SITF, idle(t, 0.5)), hit([[0.3, { lFwd: 30 }], [0.8, { lFwd: 85, lUp: -40, turn: 20 }]], u)));
        const a = pinky(J, 'R'); fl.position.set(a.x + 0.3 * sm(u, 0.4, 0.9), a.y, a.z + 0.2); fl.rotation.y = Math.PI / 2; fl.userData.spot.intensity = 30 * sm(u, 0.8, 1.0); fl.userData.lens.material.color.set(u > 0.8 ? 0xfff6d0 : 0x8a8a8a);
        Mi.setFace(u > 0.6 ? 'softsmile' : 'smile'); J.setFace('softsmile');
        camPath(cam, p, [6.0, 5.2, 3.0], [5.6, 5.1, 2.4], [3, 4.0, -9.2], [3, 4.0, -9.2], 22, 23); }
    };
  },
  // 43 "Captain Moss still has his anchor."  — sunset deck: Moss grins under his anchor-pack, low angle
  (S, cam) => {
    const env = ferryDeck(S, { time: 'sunset' });
    const M = moss(S, 'grin', [0, 0, 0], 15); const P = pack(M, 'moss', 2.0, { anchor: true });
    return (t, dur) => { env.update(t);
      P.anchor.scale.setScalar(0.62 / P.s); P.anchor.position.set(0, -0.15, -0.95); P.anchor.rotation.x = Math.sin(t * 3) * 0.1;
      M.pose(addPose(addPose(idle(t, 0.8), { ...STRAPS, lean: 12 }), hit([[0, { nod: 6 }], [0.5, { nod: -8, tilt: 6 }]], t)));
      camPath(cam, t / dur, [2.6, 2.4, 8.2], [2.0, 2.6, 7.0], [0, 4.4, 0], [0, 4.6, 0], 28, 30);
    };
  },
  // 44 "But now his whole crew helps lift it."  — the deckhands and Milo lift the pack off his back; Moss straightens up, relieved
  (S, cam) => {
    const env = ferryDeck(S, { time: 'sunset' });
    const M = moss(S, 'worried', [0, 0, 0], 0); const P = pack(M, 'moss', 2.0, { anchor: true });
    const a = mk(S, CREW[0], 'c0', 'determined', [-3.4, 0, -1.7], 90); const b = mk(S, CREW[1], 'c1', 'determined', [3.4, 0, -1.7], -90);
    const Mi = milo(S, 'grin', [0, 0, -5.4], 0);
    allow(S, ['c0', 'moss'], ['c1', 'moss'], ['milo', 'moss']);
    return (t, dur) => { env.update(t);
      P.anchor.scale.setScalar(0.62 / P.s); P.anchor.position.set(0, -0.15, -0.95); P.anchor.rotation.x = Math.sin(t * 3) * 0.1;
      const L = sm(t, 0.5, 1.6); P.group.position.set(0, 0.15 + L * 0.5, -0.5 - L * 0.1);
      M.pose(addPose(idle(t, 0.7), { ...STRAPS, lean: 14 * (1 - L), nod: 8 * (1 - L) - 6 * L, bob: L * 0.05 }));
      M.setFace(L < 0.4 ? 'worried' : L < 0.9 ? 'shock' : 'relieved');
      const arm = 95 + L * 8; a.pose(addPose(idle(t, 0.6, 2), { rFwd: arm, lFwd: arm, rUp: -8, lUp: -8, lean: 6, ...anticipate(t, 0.55) })); b.pose(addPose(idle(t, 0.6, 3), { rFwd: arm, lFwd: arm, rUp: -8, lUp: -8, lean: 6, ...anticipate(t, 0.6) }));
      Mi.pose(addPose(idle(t, 0.6, 4), { rFwd: 150 + L * 10, lFwd: 150 + L * 10, nod: -20 }));
      if (L > 0.9) { a.setFace('laugh'); b.setFace('grin'); }
      camPath(cam, t / dur, [5.4, 4.2, 8.8], [4.6, 4.4, 8.0], [0, 3.8, -1.5], [0, 4.2, -1.6], 24, 26);
    };
  },
  // 45 "Worries are heavy."  — night bench on the cliff: the two of them side by side, one pack between their boots, the lighthouse beam sweeping overhead
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'night' });
    const J = june(S, 'softsmile', [0.8, 0, -9.2], 10); J.root.position.y = 1.6 - 1.5 * 1.07; const Mi = milo(S, 'relieved', [5.2, 0.1, -9.2], -10);
    allow(S, ['june', 'bench'], ['milo', 'bench']); const P = packProp(S, { col: PACK.milo, s: 1.0 }); P.group.position.set(3, 0, -6.9); P.group.rotation.y = Math.PI;
    fill(S, [3, 5.5, -3], 12, 0xffd0a0, 14);
    return (t, dur) => { env.update(t + 1.5);
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), { rFwd: 30, lFwd: 30, nod: -12, turn: 10 })); Mi.pose(addPose(addPose(SITF, idle(t, 0.5, 2)), { rFwd: 30, lFwd: 30, nod: -14, turn: -8 }));
      camPath(cam, t / dur, [3, 5.2, 4.0], [3, 5.1, 2.6], [3, 4.0, -9.2], [3, 4.2, -9.2], 22, 23);
    };
  },
  // 46 "But nobody has to carry them alone."  — crane up and back: the bench, the cliff, the lighthouse beam sweeping the dark sea under the stars
  (S, cam) => {
    const env = lighthouseCliff(S, { time: 'night' });
    const J = june(S, 'softsmile', [0.8, 0, -9.2], 10); J.root.position.y = 1.6 - 1.5 * 1.07; const Mi = milo(S, 'softsmile', [5.2, 0.1, -9.2], -10);
    allow(S, ['june', 'bench'], ['milo', 'bench']); const P = packProp(S, { col: PACK.milo, s: 1.0 }); P.group.position.set(3, 0, -6.9); P.group.rotation.y = Math.PI;
    fill(S, [3, 5.5, -3], 6, 0xffd0a0, 12);
    return (t, dur) => { env.update(t + 3);
      J.pose(addPose(addPose(SITF, idle(t, 0.4)), { rFwd: 30, lFwd: 30, nod: -16, turn: 20 * sm(t, 0.6, 1.4) })); Mi.pose(addPose(addPose(SITF, idle(t, 0.5, 2)), { rFwd: 30, lFwd: 30, nod: -18, turn: -20 * sm(t, 0.8, 1.6) }));
      camPath(cam, t / dur, [3.5, 5.0, 3.0], [10, 15, 14], [3, 4.0, -9.2], [-4, 11, -16], 22, 20);
    };
  },
];
