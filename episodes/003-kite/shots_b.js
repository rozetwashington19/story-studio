import * as THREE from 'three';
import { T } from '../../engine/kit.js';
import { POSES, addPose, ease, snap, idle, walk, D, std, box, camPath, track, seg, sob, HUG, houseFront, kidRoomDay, hill, hillY,
  livingRoom, kite, kiteFlutter, spool, promiseString, pinky, glueJar, dust, phone, ladder, bird, laundryItem, L } from '../../engine/kit.js';
import { ROSA, GRAMPS, MOM, DAD, BENNY, ORTIZ, SCALE, mk, grampsHat, head, close, faceCam, fill, link, tie, leaves, sinkKitchen } from './common.js';

const clamp01 = x => Math.max(0, Math.min(1, x));
const flick = (t, base) => base * (0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 5.3));
// Grandpa seated in the armchair (seat top 1.7)
const SEATY = 1.7 - 1.5, GH = [-1.2, 4.84, -5.6];
const seated = (S, face = 'softsmile') => { const g = mk(S, GRAMPS, 'gramps', face, [-1.2, SEATY, -5.6], 0); grampsHat(g); return g; };
const SIT = { rLeg: 90, lLeg: 90 };
const WIN = [-4, 4.6, -9.4];
// Rosa standing in the living room, facing Grandpa
const RP = [1.8, 0, -0.4], RRY = -150, RH = [1.8, 4.64, -0.4];
// front wall of the living room (only for shots whose camera looks toward +z)
const frontWall = (S) => { box(S, [18, 9, 0.4], [0, 4.5, 5.2], std({ map: T.plaster(0xc8a888) }), { r: 0, cast: false, solid: false });
  box(S, [3, 6.4, 0.2], [-4, 3.2, 4.95], std({ map: T.planks(0x6a3a22) }), { r: 0.03, cast: false, solid: false });
  box(S, [2.4, 1.8, 0.1], [3, 5.4, 4.95], std({ color: 0x8ab0d8 }), { r: 0, cast: false, solid: false }); box(S, [2.7, 2.1, 0.06], [3, 5.4, 5.0], std({ color: 0x5a3a20 }), { r: 0, cast: false, solid: false }); };
const standingGramps = (S, pos, ry, face = 'softsmile', scale = 1) => { const g = mk(S, GRAMPS, 'gramps', face, pos, ry, scale); grampsHat(g); return g; };

export const SHOTS_B = [
  // 39 "Grandpa was sitting there, holding the other end."
  (S, cam) => {
    livingRoom(S);
    const g = seated(S, 'neutral'); const st = tie(S, g, WIN, { sag: 0.3 });
    return (t, dur) => {
      camPath(cam, t / dur, [3.5, 5.8, 10.5], [2.4, 5.4, 8.5], [-1.4, 3.6, -5.5], [-1.4, 3.8, -5.6], 28);
      g.pose(addPose(SIT, { rFwd: 45, rUp: -10, lFwd: 30, nod: -6, turn: -30 + Math.sin(t) * 4 })); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 40 "Rosie," he smiled. "You came." [pause]
  (S, cam) => {
    livingRoom(S);
    const g = seated(S, 'neutral'); const st = tie(S, g, WIN, { sag: 0.3 });
    return (t, dur) => {
      close(cam, t / dur, GH, { side: 0.8, dist: 7, push: 0.7 });
      const tn = ease(clamp01(t / 0.9)); g.pose(addPose(SIT, { rFwd: 45, rUp: -10, lFwd: 30, turn: -30 + tn * 40, nod: -4, tilt: tn * 6 }));
      g.setFace(t > 0.7 ? (t > 2.0 ? 'teary' : 'softsmile') : 'neutral'); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 41 "Next to him was a giant kite. Red and gold."
  (S, cam) => {
    livingRoom(S);
    const g = seated(S, 'softsmile'), r = mk(S, ROSA, 'rosa', 'awe', RP, RRY); const l = link(S, r, g, { sag: 0.6, sideA: 'R', sideB: 'R' });
    return (t, dur) => {
      camPath(cam, t / dur, [-2.0, 5.4, 8.5], [-0.4, 5.2, 7.5], [0.2, 3.8, -4], [4.0, 4.4, -5.0], 26);
      g.pose(addPose(SIT, { rFwd: 45, lFwd: 30, turn: 30 })); r.pose(addPose({ rFwd: 30, lUp: 4, turn: 30 + ease(clamp01(t / 1.4)) * 30, nod: -6 }, idle(t, 0.4)));
      l.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 42 "Half finished. Covered in dust."
  (S, cam) => {
    livingRoom(S); const d = dust(S, [5, 5, -4.4], 50, 1.8);
    return (t, dur) => {
      camPath(cam, t / dur, [3.2, 4.4, 1.4], [4.0, 4.8, 0.2], [5, 4.4, -5.2], [5, 4.9, -5.2], 34); d(t);
      S.userData.kite.rotation.z = Math.sin(t * 0.8) * 0.01;
    };
  },
  // 43 "And then I remembered. [pause]"
  (S, cam) => {
    livingRoom(S);
    const r = mk(S, ROSA, 'rosa', 'neutral', [1.8, 0, 0.2], -100); const fl = fill(S, [3, 5.5, 3], 0, 0xffe0b0);
    return (t, dur) => {
      faceCam(cam, t / dur, [1.8, 4.64, 0.2], -100, { side: 0.8, push: 1.2 });
      r.pose(addPose({ rUp: 4, lUp: 4, nod: -4 + Math.sin(t) * 2 }, idle(t, 0.3))); const f = clamp01((t - dur * 0.55) / (dur * 0.35));
      r.setFace(f > 0.1 ? 'awe' : 'neutral'); fl.intensity = f * 30; S.userData.look = f > 0.8 ? 'flash' : undefined;
    };
  },
  // 44 "When I was five, we started building it."
  (S, cam) => {
    livingRoom(S, { dusty: false }); L('flash')(S); S.userData.kite.visible = false;
    const k = kite(S, [2.6, 2.48, -3.4], { done: false, tail: false }); k.rotation.x = -Math.PI / 2;
    const g = standingGramps(S, [-0.6, 0, -2.9], 90, 'grin'), r = mk(S, ROSA, 'little', 'grin', [5.6, 0, -3.4], -90, SCALE.little);
    return (t, dur) => {
      camPath(cam, t / dur, [2.6, 7.4, 11], [2.6, 6.8, 9.6], [2.6, 2.6, -3.2], [2.6, 2.8, -3.2], 26);
      g.pose(addPose({ rFwd: 70, lFwd: 70, nod: 25, lean: 8 }, { rUp: Math.sin(t * 3) * 6, lUp: Math.sin(t * 3 + 1) * 6 }));
      r.pose(addPose({ rFwd: 80 + Math.sin(t * 6) * 15, lFwd: 70, nod: 20 }, { bob: Math.abs(Math.sin(t * 5)) * 0.05 }));
    };
  },
  // 45 Grandpa said, "We'll fly it from the top of the hill."
  (S, cam) => {
    livingRoom(S, { dusty: false }); L('flash')(S); S.userData.kite.visible = false;
    const k = kite(S, [2.6, 2.48, -3.4], { done: false, tail: false }); k.rotation.x = -Math.PI / 2;
    const g = standingGramps(S, [-0.6, 0, -2.9], 90, 'grin'), r = mk(S, ROSA, 'little', 'awe', [5.6, 0, -3.4], -90, SCALE.little);
    return (t, dur) => {
      faceCam(cam, t / dur, head(-0.6, -2.9), 90, { side: 2.4, dist: 7 });
      g.pose(track([[0, { rFwd: 60, lFwd: 60, nod: 10 }], [0.6, { rUp: 140, rFwd: 20, lFwd: 40, turn: 60, nod: -10 }], [dur, { rUp: 145, rFwd: 25, lFwd: 40, turn: 50, nod: -12 }]], t));
      r.pose(addPose({ rFwd: 40, lFwd: 40, nod: -15 }, idle(t, 0.6)));
    };
  },
  // 46 I said, "When I'm big enough. I promise." [pause]
  (S, cam) => {
    livingRoom(S, { dusty: false }); L('flash')(S); S.userData.kite.visible = false;
    const k = kite(S, [2.6, 2.48, -3.4], { done: false, tail: false }); k.rotation.x = -Math.PI / 2;
    const g = standingGramps(S, [-0.6, 0, -2.9], 90, 'softsmile'), r = mk(S, ROSA, 'little', 'grin', [5.6, 0, -3.4], -90, SCALE.little);
    const l = link(S, r, g, { sag: 0.2, sideA: 'L', sideB: 'R' });
    return (t, dur) => {
      const [kk, p] = seg(t, dur, [0.5]);
      if (kk === 0) faceCam(cam, p, [5.6, 3.1, -3.4], -90, { side: -2.0, dist: 6.0, lens: 32 });
      else camPath(cam, p, [2.6, 4.8, 9.5], [2.6, 4.4, 8.4], [2.6, 3.0, -3.2], [2.6, 3.0, -3.2], 26);
      const reach = ease(clamp01((t - 0.6) / 0.6));
      r.pose(addPose({ lFwd: 30 + reach * 60, rUp: 6, nod: -12 }, idle(t, 0.6))); g.pose(addPose({ rFwd: 30 + reach * 50, lUp: 4, nod: 10 }, idle(t, 0.4)));
      l.update({ fade: clamp01((t - 1.2) / 0.5) * (1 + Math.max(0, 1 - (t - 1.2)) * 1.5), sag: 0.2 });
    };
  },
  // 47 "Then I grew up. And I forgot."
  (S, cam) => {
    hill(S, { cottage: true }); L('flash')(S);
    const r = mk(S, ROSA, 'rosa', 'grin', [3, 0, -3.6], 160, SCALE.little); const st = tie(S, r, [-2.4, 4.0, -7.0], { sag: 0.5, side: 'L' });
    return (t, dur) => {
      const p = clamp01(t / dur); const z = -3.6 + p * 22, x = 3 + p * 4; r.root.position.set(x, hillY(x, z), z); r.root.rotation.y = 12 * D;
      r.root.scale.setScalar(SCALE.little + (1 - SCALE.little) * p); r.setFace(p > 0.6 ? 'neutral' : 'grin');
      camPath(cam, p, [8, 4.5, 10], [12, hillY(12, 30) + 5, 30], [1, 3, -3], [x, hillY(x, z) + 3, z - 2], 28);
      r.pose(walk(t, 0.9)); st.update({ fade: 1 - p * 0.65, r: 0.06 - p * 0.03 });
    };
  },
  // 48 "But Grandpa didn't."
  (S, cam) => {
    livingRoom(S);
    const g = seated(S, 'softsmile'); const st = tie(S, g, WIN, { sag: 0.3 });
    return (t, dur) => {
      camPath(cam, t / dur, [3.4, 5.0, 1.4], [2.8, 4.9, 0.4], [-1.4, 4.2, -5.8], [-1.4, 4.3, -5.8], 30);
      g.pose(addPose(SIT, { rFwd: 50, rUp: -10, lFwd: 30, turn: -40, nod: -4 }, { tilt: Math.sin(t) * 2 })); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 49 "He kept my glue sticks in a jar."
  (S, cam) => {
    livingRoom(S); glueJar(S, [2.0, 2.4, -3.0]); const d = dust(S, [2, 3.4, -3], 20, 1.2);
    return (t, dur) => { camPath(cam, t / dur, [3.2, 4.2, 1.6], [2.6, 3.8, 0.4], [2.0, 2.9, -3.0], [2.0, 2.95, -3.0], 36); d(t); };
  },
  // 50 "He kept my drawings taped to the kite."
  (S, cam) => {
    livingRoom(S); const d = dust(S, [5, 5, -4.4], 30, 1.5);
    return (t, dur) => { camPath(cam, t / dur, [4.0, 6.4, -0.4], [5.6, 5.2, -0.8], [4.4, 5.8, -5.2], [5.2, 4.6, -5.2], 40); d(t); };
  },
  // 51 "Every Sunday, he sat by the window. Just in case. [pause]"
  (S, cam) => {
    livingRoom(S);
    const g = seated(S, 'softsmile'); const st = tie(S, g, WIN, { sag: 0.3 }); const w = S.getObjectByName('window');
    const day = new THREE.Color(0xcfe8ff), eve = new THREE.Color(0x24306a);
    return (t, dur) => {
      const p = t / dur; camPath(cam, p, [-6.2, 5.6, 4], [-5.4, 5.2, 2.4], [-2.4, 4.2, -6.8], [-2.0, 4.2, -6.4], 28);
      g.pose(addPose(SIT, { rFwd: 50, rUp: -10, lFwd: 30, turn: -45, nod: -8 + Math.sin(t * 0.7) * 3 }));
      const c = day.clone().lerp(eve, ease(clamp01((p - 0.3) / 0.5))); w.material.color.copy(c); w.material.emissive.copy(c);
      g.setFace(p > 0.6 ? 'sad' : 'softsmile'); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 52 "Why didn't you remind me?" I asked.
  (S, cam) => {
    frontWall(S); livingRoom(S);
    const g = seated(S, 'softsmile'), r = mk(S, ROSA, 'rosa', 'teary', RP, RRY); const l = link(S, r, g, { sag: 0.6 });
    return (t, dur) => {
      faceCam(cam, t / dur, RH, RRY, { side: -0.9, dist: 5.0, lens: 30, push: 0.4 });
      r.pose(addPose({ rFwd: 35, lFwd: 20, lUp: -10, nod: 8, tilt: 8 }, idle(t, 0.4))); g.pose(addPose(SIT, { rFwd: 45, lFwd: 30, turn: 30 })); l.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 53 "Then it wouldn't be your promise," he said.
  (S, cam) => {
    livingRoom(S);
    const g = seated(S, 'softsmile'), r = mk(S, ROSA, 'rosa', 'teary', RP, RRY); const l = link(S, r, g, { sag: 0.6 });
    return (t, dur) => {
      close(cam, t / dur, GH, { side: 1.6, dist: 7, push: 0.6 });
      g.pose(addPose(SIT, { rFwd: 45, lFwd: 30, turn: 30, tilt: 8 + Math.sin(t * 1.5) * 3, nod: 4 })); r.pose(idle(t, 0.4)); l.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 54 "Then my phone buzzed. Priya's birthday party. In one hour."
  (S, cam) => {
    frontWall(S); livingRoom(S);
    const g = seated(S, 'softsmile'), r = mk(S, ROSA, 'rosa', 'shock', RP, RRY); const ph = phone(S, "PRIYA'S PARTY", 'Starts in 1 hour!');
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.4]);
      r.pose(addPose({ rFwd: 75, rUp: -18, lUp: 4, nod: 22 }, idle(t, 0.3))); g.pose(addPose(SIT, { rFwd: 45, lFwd: 30, turn: 30 }));
      const hp = pinky(r, 'R'); const buzz = (t % 0.8) < 0.35 ? Math.sin(t * 90) * 0.04 : 0;
      ph.position.set(hp.x + buzz, hp.y + 0.6, hp.z); ph.rotation.set(-35 * D, (RRY + 180) * D, buzz * 2);
      if (k === 0) faceCam(cam, p, RH, RRY, { side: -0.9, dist: 5.0, lens: 30, look: -0.8 });
      else { const n = new THREE.Vector3(0, 0, 1).applyEuler(ph.rotation); const c0 = ph.position.clone().addScaledVector(n, 1.9 - p * 0.3); cam.position.copy(c0); cam.fov = 2 * Math.atan(12 / 34) / D; cam.updateProjectionMatrix(); cam.up.set(0, 1, 0); cam.lookAt(ph.position); }
    };
  },
  // 55 "I looked at my phone."
  (S, cam) => {
    frontWall(S); livingRoom(S);
    const r = mk(S, ROSA, 'rosa', 'worried', RP, RRY); const ph = phone(S, "PRIYA'S PARTY", 'Starts in 1 hour!');
    return (t, dur) => {
      r.pose(addPose({ rFwd: 75, rUp: -18, lUp: 4, nod: 24 }, idle(t, 0.3))); const hp = pinky(r, 'R');
      ph.position.set(hp.x, hp.y + 0.6, hp.z); ph.rotation.set(-35 * D, (RRY + 180) * D, 0);
      faceCam(cam, t / dur, RH, RRY, { side: -0.9, dist: 5.0, lens: 30, look: -1.0, push: 0.4 });
    };
  },
  // 56 "Then I looked at Grandpa's dusty kite. [pause]"
  (S, cam) => {
    frontWall(S); livingRoom(S); const d = dust(S, [5, 5, -4.4], 30, 1.6);
    const r = mk(S, ROSA, 'rosa', 'sad', RP, RRY);
    return (t, dur) => {
      const tn = ease(clamp01(t / 1.0)); r.pose(addPose({ rFwd: 20, lUp: 4, nod: 6, turn: -10 - tn * 50 }, idle(t, 0.3))); d(t);
      const [k, p] = seg(t, dur, [0.55]); if (k === 0) camPath(cam, p, [4.6, 5.0, -3.2], [4.4, 4.9, -2.9], [1.8, 4.2, -0.4], [1.8, 4.3, -0.4], 30); else camPath(cam, p, [2.4, 5.6, -0.6], [3.2, 5.2, -1.8], [5, 4.6, -5.2], [5, 4.8, -5.2], 32);
    };
  },
  // 57 I texted Priya, "Sorry. I have a promise to keep."
  (S, cam) => {
    frontWall(S); livingRoom(S);
    const r = mk(S, ROSA, 'rosa', 'determined', RP, RRY); const ph = phone(S, "PRIYA'S PARTY", 'Starts in 1 hour!');
    return (t, dur) => {
      r.pose(addPose({ rFwd: 75, rUp: -18, lFwd: 70 + Math.sin(t * 14) * 5, lUp: -20, nod: 18 }, idle(t, 0.3))); const hp = pinky(r, 'R');
      ph.position.set(hp.x, hp.y + 0.6, hp.z); ph.rotation.set(-35 * D, (RRY + 180) * D, 0);
      faceCam(cam, t / dur, RH, RRY, { side: -0.9, dist: 5.0, lens: 30, look: -0.7, push: 0.4 }); if (t > dur * 0.6) r.setFace('softsmile');
    };
  },
  // 58 "We worked all afternoon."
  (S, cam) => {
    livingRoom(S, { sunset: false }); S.userData.kite.visible = false;
    const k1 = kite(S, [2.6, 2.48, -3.4], { done: false, dusty: true, drawings: true, tail: false }); k1.rotation.x = -Math.PI / 2;
    const k2 = kite(S, [2.6, 2.48, -3.4], { done: true, drawings: true, tail: false }); k2.rotation.x = -Math.PI / 2;
    const g = standingGramps(S, [-0.6, 0, -2.9], 90, 'grin'), r = mk(S, ROSA, 'rosa', 'grin', [5.8, 0, -3.4], -90);
    return (t, dur) => {
      const [kk, p] = seg(t, dur, [0.5]); k1.visible = kk === 0; k2.visible = kk === 1;
      camPath(cam, p, kk ? [4.6, 7.4, 10.5] : [0.6, 7.4, 10.5], kk ? [4.0, 7.0, 9.5] : [1.2, 7.0, 9.5], [2.6, 2.8, -3.2], [2.6, 2.8, -3.2], 26);
      g.pose(addPose({ rFwd: 72, lFwd: 72, nod: 25 }, { rUp: Math.sin(t * 4) * 8, lUp: Math.sin(t * 3) * 6 }));
      r.pose(addPose({ rFwd: 72, lFwd: 72, nod: 25 }, { rUp: Math.sin(t * 5 + 1) * 8, lUp: Math.sin(t * 4) * 6 }));
      if (kk) { g.setFace('softsmile'); r.setFace('smile'); }
    };
  },
  // 59 "Paper. Glue. Grandpa's shaky hands. My steady ones."
  (S, cam) => {
    livingRoom(S); S.userData.kite.visible = false;
    const k1 = kite(S, [2.6, 2.48, -3.4], { done: false, drawings: true, tail: false }); k1.rotation.x = -Math.PI / 2;
    const g = standingGramps(S, [-0.6, 0, -2.9], 90, 'softsmile'), r = mk(S, ROSA, 'rosa', 'determined', [5.8, 0, -3.4], -90);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), std({ color: 0xd8302a, side: THREE.DoubleSide })); S.add(paper);
    return (t, dur) => {
      const [kk, p] = seg(t, dur, [0.25, 0.5, 0.75]);
      g.pose({ rFwd: 72 + Math.sin(t * 30) * 2.5, lFwd: 72 + Math.sin(t * 27) * 2.5, nod: 25, rUp: Math.sin(t * 25) * 2 });
      r.pose({ rFwd: 72, lFwd: 72, nod: 25 });
      const hr = pinky(r, 'R'), hg = pinky(g, 'L');
      paper.rotation.x = -Math.PI / 2; paper.position.set(3.0, 2.52 + (kk === 0 ? 0.3 * (1 - p) : 0), -2.6);
      if (kk === 3) { faceCam(cam, p, head(5.8, -3.4), -90, { side: -1.2, dist: 7.5, look: -0.8 }); return; }
      const tgt = kk === 0 ? [3.0, 2.6, -2.6] : kk === 1 ? [3.6, 2.6, -4.2] : [hg.x, hg.y, hg.z];
      const off = kk === 2 ? [3.6, 3.2, 3.4] : kk === 3 ? [-3.6, 3.2, 3.4] : [0.6, 2.8, 3.2];
      camPath(cam, p, [tgt[0] + off[0], tgt[1] + off[1], tgt[2] + off[2]], [tgt[0] + off[0] * 0.85, tgt[1] + off[1] * 0.9, tgt[2] + off[2] * 0.85], tgt, tgt, 34);
    };
  },
  // 60 "By sunset, the kite was finished."
  (S, cam) => {
    livingRoom(S, { sunset: true, kiteDone: true, dusty: false });
    const g = standingGramps(S, [1.8, 0, -1.0], 15, 'grin'), r = mk(S, ROSA, 'rosa', 'grin', [6.2, 0, -1.4], -20);
    return (t, dur) => {
      camPath(cam, t / dur, [4.2, 5.0, 10.5], [4.2, 4.8, 9.0], [4.2, 4.2, -2.4], [4.2, 4.3, -2.4], 26);
      g.pose(addPose({ rUp: 30, lUp: 30, rFwd: 20, lFwd: 20 }, idle(t, 0.8))); r.pose(addPose(POSES.armsup, { rUp: Math.sin(t * 10) * 10, lUp: -Math.sin(t * 10) * 10, bob: Math.abs(Math.sin(t * 5)) * 0.06 }));
      kiteFlutter(S.userData.kite, t, 0.15);
    };
  },
  // 61 "We climbed to the top of the hill."
  (S, cam) => {
    hill(S, { sunset: true }); S.userData.look = undefined;
    const r = mk(S, ROSA, 'rosa', 'grin', [-2.5, 0, 26], 180), g = standingGramps(S, [2.5, 0, 26], 180, 'smile');
    const k = kite(S, [0, 0, 0], { done: true, drawings: true, s: 0.8 }); const sp = spool(S);
    return (t, dur) => {
      const p = clamp01(t / dur); const z = 26 - p * 12;
      r.root.position.set(-2.5, hillY(-2.5, z), z); g.root.position.set(2.5, hillY(2.5, z + 0.5), z + 0.5);
      camPath(cam, p, [0.5, 5.0, 4], [0.5, 4.2, 2], [0, hillY(0, 24) + 3, 24], [0, hillY(0, 15) + 3.4, 14], 28);
      r.pose(addPose(walk(t, 0.8, 22), { rUp: 150, lUp: 150, rFwd: 0, lFwd: 0, lean: 6 })); g.pose(addPose(walk(t + 0.3, 0.7, 20), { rFwd: 60, lean: 8 }));
      const hp = pinky(r, 'R').lerp(pinky(r, 'L'), 0.5); k.position.set(hp.x, hp.y + 1.6, hp.z - 0.2); k.rotation.set(0, Math.PI, 0); kiteFlutter(k, t, 0.6);
      const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z);
    };
  },
  // 62 "The wind picked up."
  (S, cam) => {
    hill(S, { sunset: true });
    const r = mk(S, ROSA, 'rosa', 'awe', [-2.4, 0, 6], 10), g = standingGramps(S, [2.4, 0, 6.4], -10, 'shock');
    const k = kite(S, [0, 0, 0], { done: true, drawings: true, s: 0.8 }); const sp = spool(S); const lv = leaves(S, [-14, 6], [0, 9], [0, 12], 60, 5);
    return (t, dur) => {
      camPath(cam, t / dur, [1.0, 4.6, 21], [0.6, 4.8, 19], [0, 4.6, 6], [0, 5.0, 6], 26); lv(t);
      r.pose(addPose({ rUp: 150, lUp: 150, bodyTilt: Math.sin(t * 3) * 4 }, { tilt: Math.sin(t * 5) * 3, nod: -10 }));
      g.pose(addPose({ lFwd: 160, lUp: -20, rFwd: 60 }, { tilt: Math.sin(t * 4) * 4 }));
      const hp = pinky(r, 'R').lerp(pinky(r, 'L'), 0.5); k.position.set(hp.x, hp.y + 1.6, hp.z + 0.2); k.rotation.set(0, 0, Math.sin(t * 6) * 0.08); kiteFlutter(k, t, 2.2);
      const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z);
    };
  },
  // 63 "I let go. [pause]"
  (S, cam) => {
    hill(S, { sunset: true });
    const r = mk(S, ROSA, 'rosa', 'determined', [-2.4, 0, 6], 10), g = standingGramps(S, [2.4, 0, 6.4], -10, 'smile');
    const k = kite(S, [0, 0, 0], { done: true, drawings: true, s: 0.8 }); const sp = spool(S); const line = promiseString(S, { col: 0xf2f2f2, r: 0.02, glow: 0.3 });
    return (t, dur) => {
      const [kk, p] = seg(t, dur, [0.45]);
      if (kk === 0) faceCam(cam, p, head(-2.4, 6), 10, { side: -0.4, dist: 7.4, up: 0.4 });
      else camPath(cam, p, [1.2, 3.0, 24], [1.2, 3.6, 23], [-1, 6, 6], [-2, 9, 8], 26);
      const rel = clamp01((t - dur * 0.35) / 0.6); const hp = pinky(r, 'R').lerp(pinky(r, 'L'), 0.5);
      r.pose(addPose({ rUp: 150 + rel * 10, lUp: 150 + rel * 10 }, { nod: -rel * 20 })); r.setFace(rel > 0.3 ? 'awe' : 'determined');
      g.pose(addPose({ rFwd: 60, lFwd: 40 }, { nod: -rel * 15 })); const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z);
      const up = Math.pow(rel, 1.6); k.position.set(hp.x - up * 3, hp.y + 1.6 + up * 6, hp.z + 0.2 + up * 4); k.rotation.set(-up * 0.4, 0, Math.sin(t * 5) * 0.1); kiteFlutter(k, t, 1.5);
      line.set(sp.position, k.position.clone().add(new THREE.Vector3(0, 0.3, 0)), { sag: 0.4 + up * 0.6 });
    };
  },
  // 64 "The kite shot into the sky."
  (S, cam) => {
    hill(S, { sunset: true });
    const r = mk(S, ROSA, 'rosa', 'grin', [-2.4, 0, 6], 10), g = standingGramps(S, [2.4, 0, 6.4], -10, 'grin');
    const k = kite(S, [0, 0, 0], { done: true, drawings: true, s: 0.9 }); const sp = spool(S); const line = promiseString(S, { col: 0xf2f2f2, r: 0.025, glow: 0.3 });
    return (t, dur) => {
      const p = t / dur; const e = ease(p);
      k.position.set(-5 - e * 6, 9 + e * 22, 10 + e * 8); k.rotation.set(-0.5, 0, Math.sin(t * 3) * 0.15); kiteFlutter(k, t, 1.2);
      camPath(cam, p, [3.0, 2.0, 28], [3.5, 1.6, 30], [-2, 7, 8], [-7, 19, 14], 26);
      r.pose(addPose(POSES.armsup, { rUp: Math.sin(t * 9) * 12, lUp: -Math.sin(t * 9) * 12, nod: -15 })); r.root.position.y = Math.abs(Math.sin(t * 6)) * 0.5;
      g.pose(addPose({ rFwd: 70 + Math.sin(t * 3) * 10, lUp: 30 }, { nod: -18 })); const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z);
      line.set(sp.position, k.position, { sag: 1.2 });
    };
  },
  // 65 "And my faded string began to glow."
  (S, cam) => {
    hill(S, { sunset: true });
    const r = mk(S, ROSA, 'rosa', 'awe', [-2.4, 0, 6], 15), g = standingGramps(S, [2.4, 0, 6.4], -15, 'awe');
    const l = link(S, r, g, { sag: 0.7, sideA: 'L', sideB: 'R' }); const fl = fill(S, [0, 3.5, 10], 0, 0xffd080);
    return (t, dur) => {
      const p = clamp01(t / dur); const gl = ease(clamp01((p - 0.15) / 0.6));
      camPath(cam, p, [0, 4.0, 19], [0, 4.0, 17], [0, 3.4, 6], [0, 3.6, 6], 26);
      r.pose(addPose({ lFwd: 60 + gl * 20, rUp: 6, nod: 25 - gl * 15 }, idle(t, 0.4))); g.pose(addPose({ rFwd: 60 + gl * 15, lUp: 6, nod: 20 - gl * 12 }, idle(t, 0.4, 2)));
      l.update({ fade: 0.3 + gl * 1.6, r: 0.03 + gl * 0.04 }); fl.intensity = gl * 25; if (gl > 0.6) { r.setFace('grin'); g.setFace('grin'); }
    };
  },
  // 66 "It turned into golden kite string."
  (S, cam) => {
    hill(S, { sunset: true });
    const r = mk(S, ROSA, 'rosa', 'grin', [-2.4, 0, 6], 10), g = standingGramps(S, [2.4, 0, 6.4], -10, 'grin');
    const k = kite(S, [-10, 30, 18], { done: true, drawings: true, s: 1.0 }); k.rotation.set(-0.5, 0, 0);
    const sp = spool(S); const line = promiseString(S, { col: 0xf2f2f2, r: 0.025, glow: 0.3 }); const l = link(S, r, g, { sag: 0.7, sideA: 'L', sideB: 'R' });
    const gold = new THREE.Color(0xffc830), white = new THREE.Color(0xf2f2f2);
    return (t, dur) => {
      const p = clamp01(t / dur); const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z);
      camPath(cam, p, [6, 2.4, 27], [7, 2.0, 29], [0, 5, 6], [-5, 17, 13], 26);
      r.pose(addPose({ lFwd: 70, rUp: 20, nod: -20 }, idle(t, 0.4))); g.pose(addPose({ rFwd: 70, lUp: 20, nod: -20 }, idle(t, 0.4, 2)));
      const c = ease(clamp01((p - 0.1) / 0.6)); const col = white.clone().lerp(gold, c); line.color(col); line.glow = 0.3 + c * 2.4;
      line.set(sp.position, k.position, { sag: 1.2, r: 0.025 + c * 0.03 }); l.update({ fade: 1.6 * (1 - c), r: 0.07 }); if (c >= 1) l.s.hide();
      k.rotation.z = Math.sin(t * 3) * 0.15; kiteFlutter(k, t, 1.2);
    };
  },
  // 67 "Grandpa laughed so hard his hat blew off."
  (S, cam) => {
    hill(S, { sunset: true });
    const g = mk(S, GRAMPS, 'gramps', 'grin', [2.4, 0, 6.4], -10); const hat = grampsHat(g); const sp = spool(S);
    return (t, dur) => {
      faceCam(cam, t / dur, head(2.4, 6.4), -10, { side: 0.6, dist: 8.5, lens: 30, up: 0.6, look: 0.2 });
      g.pose(addPose({ rFwd: 60, lUp: 10, nod: -15 }, { bob: Math.abs(Math.sin(t * 9)) * 0.08, tilt: Math.sin(t * 9) * 5, lean: -4 + Math.sin(t * 9) * 3 }));
      const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z);
      const off = clamp01((t - 0.7) / 1.4);
      if (off > 0 && hat.parent !== S) S.attach(hat);
      if (off > 0) { hat.position.set(2.4 + off * 6, 5.6 + off * 3 + Math.sin(off * 6) * 0.6, 6.4 - off * 3); hat.rotation.set(off * 5, off * 3, off * 7); }
    };
  },
  // 68 "Promise kept. [pause]"
  (S, cam) => {
    hill(S, { sunset: true });
    const r = mk(S, ROSA, 'rosa', 'grin', [-2.4, 0, 6], 10), g = mk(S, GRAMPS, 'gramps', 'grin', [2.4, 0, 6.4], -10);
    const k = kite(S, [-9, 24, 16], { done: true, drawings: true, s: 1.2 }); k.rotation.set(-0.4, 0, 0);
    const sp = spool(S); const line = promiseString(S, { col: 0xffc830, r: 0.05, glow: 2.6 });
    return (t, dur) => {
      camPath(cam, t / dur, [2, 1.4, 30], [1, 2.0, 33], [-1, 6, 6], [-3, 10, 8], 26);
      r.pose(addPose({ lFwd: 30, rUp: 20, nod: -12 }, idle(t, 0.6))); g.pose(addPose({ rFwd: 70, lUp: 10, nod: -15 }, idle(t, 0.6, 2)));
      const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z); line.set(sp.position, k.position, { sag: 2 }); k.rotation.z = Math.sin(t * 2) * 0.12; kiteFlutter(k, t, 1);
    };
  },
  // 69 "Now I visit every Sunday. No string needed."
  (S, cam) => {
    hill(S, { cottage: true });
    const g = standingGramps(S, [2.2, 0.3, -5.8], 0, 'grin'), r = mk(S, ROSA, 'rosa', 'grin', [2.2, 0, 2], 180);
    S.userData.allowContact = [['rosa', 'gramps']];
    return (t, dur) => {
      const p = clamp01(t / dur); const w = ease(clamp01(t / 1.4)); r.root.position.z = 2 - w * 5.6;
      camPath(cam, p, [13, 5.6, 12], [12, 5.2, 10.5], [2.2, 3.6, -3.4], [2.2, 3.8, -4.4], 24);
      if (w < 1) { r.pose(addPose(walk(t, 1.1), {})); g.pose(addPose(POSES.wave, { rUp: Math.sin(t * 10) * 14 })); }
      else { r.pose(addPose(HUG, idle(t, 0.4))); g.pose(addPose(HUG, idle(t, 0.4, 1))); }
    };
  },
  // 70 "Benny's snapped six more strings."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'neutral', [4.6, 0, 0.6], -40), b = mk(S, BENNY, 'benny', 'grin', [0.2, 0, 0.2], -50, SCALE.benny);
    const l = link(S, b, r, { sag: 0.3, sideA: 'R', sideB: 'L' });
    const old = [0, 1, 2, 3, 4, 5].map(i => promiseString(S, { r: 0.035, glow: 1.2 }));
    return (t, dur) => {
      camPath(cam, t / dur, [1.8, 4.8, 11.5], [1.6, 4.6, 10.5], [1.8, 2.9, -0.5], [1.6, 2.9, -0.5], 22);
      const step = ease(clamp01(t / 0.6)); b.root.position.set(0.2 - step * 1.2, 0, 0.2 - step * 0.8); b.pose(t < 0.6 ? walk(t, 1.4) : addPose(POSES.shrug, { tilt: Math.sin(t * 6) * 8 }));
      const sn = clamp01((t - 0.5) / 0.6); l.update({ snap: sn });
      const hp = pinky(b, 'L'); old.forEach((s, i) => s.set(hp, [hp.x + 0.3 - i * 0.12, hp.y - 1.0 - (i % 3) * 0.25, hp.z + 0.2], { sag: 0.05, fade: 0.6 }));
      r.pose(sn > 0.2 ? addPose(POSES.hips, { nod: 8, tilt: -10 + Math.sin(t * 3) * 3 }) : idle(t)); r.setFace(sn > 0.2 ? 'smirk' : 'neutral');
    };
  },
  // 71 "Mr. Ortiz finally returned the ladder. The birds were furious."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const o = mk(S, ORTIZ, 'ortiz', 'fakesmile', [6, 0, 6], -90), d = mk(S, DAD, 'dad', 'grin', [-5, 0, 4], 70);
    const lad = ladder(S, 7); lad.rotation.z = Math.PI / 2; const bs = [bird(S, 0x4a7ad0), bird(S, 0xe8484f), bird(S, 0xf2c230)];
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      const w = ease(clamp01(t / (dur * 0.6))); o.root.position.x = 6 - w * 4; o.pose(w < 1 ? addPose(walk(t, 0.8, 26), { lFwd: 30, rUp: 150, rFwd: 0 }) : { lFwd: 30, rUp: 150, nod: -10 });
      const hp = pinky(o, 'L'); lad.position.set(hp.x - 3.5, hp.y + 0.2, hp.z + 0.3);
      const hd = o.root.position.clone().add(new THREE.Vector3(0, 6.0, 0));
      bs.forEach((b, i) => { const a = t * 4 + i * 2.1; b.position.set(hd.x + Math.cos(a) * 1.4, hd.y + Math.sin(t * 6 + i) * 0.4, hd.z + Math.sin(a) * 1.4); b.rotation.y = -a; b.userData.flap(t + i, 1.2); });
      d.pose(addPose(POSES.wave, { rUp: Math.sin(t * 10) * 14 }));
      if (k === 0) camPath(cam, p, [1.0, 5.0, 24], [1.2, 4.8, 22.5], [1.0, 3.4, 4], [1.2, 3.4, 4], 22);
      else faceCam(cam, p, [o.root.position.x, 4.64, 6], -90, { side: 1.6, dist: 8.5, up: 0.8, lens: 30, look: 0.4 });
    };
  },
  // 72 "And Dad still hasn't fixed the sink."
  (S, cam) => {
    const sk = sinkKitchen(S);
    const d = mk(S, DAD, 'dad', 'fakesmile', [-2.6, 0, -3.6], 20), m = mk(S, MOM, 'mom', 'smirk', [2.6, 0, -3.6], -20);
    const l = link(S, d, m, { sag: 0.4, sideA: 'L', sideB: 'R' });
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 5.0, 12.5], [0.2, 4.8, 11], [0, 3.4, -4.5], [-0.6, 3.6, -4.2], 26);
      d.pose(addPose(POSES.shrug, { tilt: 10 + Math.sin(t * 3) * 4 })); m.pose(addPose({ rFwd: 25, lFwd: 50, lUp: -20 }, idle(t, 0.5))); l.update();
      const ph = (t * 1.4) % 1; sk.drip.position.y = 3.9 - ph * 0.85; sk.drip.visible = ph < 0.92;
    };
  },
  // 73 "Mom says some strings are just for laundry."
  (S, cam) => {
    sinkKitchen(S);
    const d = mk(S, DAD, 'dad', 'smile', [6.0, 0, -2.5], -50), m = mk(S, MOM, 'mom', 'wink', [-5.5, 0, -2.5], 50);
    const l = link(S, m, d, { sag: 0.6, sideA: 'L', sideB: 'R' });
    const items = [[0.2, 0, 0xf2c230], [0.36, 1, 0xe8484f], [0.52, 0, 0x3a6ab8], [0.68, 2, 0x8a5ad8], [0.82, 1, 0x3ab06a]].map(([u, k, c]) => ({ u, g: laundryItem(S, k, c) }));
    return (t, dur) => {
      faceCam(cam, t / dur, head(-5.5, -2.5), 50, { side: 1.4, dist: 7.6, lens: 30 });
      m.pose(addPose({ lFwd: 60, rFwd: 130, rUp: 15 }, { tilt: Math.sin(t * 2) * 6, turn: 20 })); d.pose(idle(t));
      const s = l.update(); items.forEach(({ u, g }, i) => { g.position.copy(s.at(u)); g.rotation.z = Math.sin(t * 2 + i) * 0.08; });
    };
  },
  // 74 "Some promises take six years to keep."
  (S, cam) => {
    hill(S, { sunset: true });
    const r = mk(S, ROSA, 'rosa', 'softsmile', [-2.4, -1.5, 6], 15), g = standingGramps(S, [2.4, -1.5, 6.4], -15, 'softsmile');
    const k = kite(S, [9, 24, -8], { done: true, drawings: true, s: 1.2 }); k.rotation.set(-0.3, 0, 0);
    const sp = spool(S); const line = promiseString(S, { col: 0xffc830, r: 0.05, glow: 2.6 });
    return (t, dur) => {
      camPath(cam, t / dur, [-5.0, 2.6, 19], [-3.6, 3.4, 18], [0, 3.0, 6], [1.5, 5.5, 7], 26);
      r.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, nod: -18 }, idle(t, 0.4))); g.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 70, lFwd: 20, nod: -15 }, idle(t, 0.4, 2)));
      const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z); line.set(sp.position, k.position, { sag: 2 }); k.rotation.z = Math.sin(t * 2) * 0.12; kiteFlutter(k, t, 1);
    };
  },
  // 75 "But the people who love you will wait. [pause]"
  (S, cam) => {
    hill(S, { sunset: true, cottage: true });
    const r = mk(S, ROSA, 'rosa', 'softsmile', [-2.4, -1.5, 6], 15), g = standingGramps(S, [2.4, -1.5, 6.4], -15, 'softsmile');
    S.userData.allowContact = [];
    const k = kite(S, [8, 22, 18], { done: true, drawings: true, s: 1.4 }); k.rotation.set(-0.4, 0, 0);
    const sp = spool(S); const line = promiseString(S, { col: 0xffc830, r: 0.06, glow: 2.6 });
    return (t, dur) => {
      const p = clamp01(t / dur);
      camPath(cam, p, [1.0, 3.6, 19], [8, 24, 66], [0, 3.0, 6], [-3, 7, 0], 26, 24);
      r.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, nod: -18, turn: 20 }, idle(t, 0.4))); g.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 70, lFwd: 20, nod: -15, turn: -20 }, idle(t, 0.4, 2)));
      const gp = pinky(g, 'R'); sp.position.set(gp.x, gp.y + 0.1, gp.z); line.set(sp.position, k.position, { sag: 2 }); k.rotation.z = Math.sin(t * 2) * 0.12; kiteFlutter(k, t, 1);
    };
  },
];
