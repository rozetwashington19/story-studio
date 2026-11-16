import * as THREE from 'three';
import { makeAvatar, makeShadow, POSES, lerpPose, addPose, ease, snap, idle, walk, D, shadowMatWall, T, std, box, dayLight, interiorLight, street, wall, room, repeatMat,
  LEO, TEACH, DAD, COUS, EX, fov, camPath, track, add, wallShadow, floorShadow, classroom, dining, bedroom } from '../../engine/kit.js';

// ---------- shots: each returns update(lt, dur) ----------
export const SHOTS_A = [
  // 1 "In this world,"
  (S, cam) => {
    dayLight(S, { sunPos: [-6, 14, -8] }); street(S);
    const walkers = [
      { o: EX[0], x0: -7.5, x1: -3.6, z: 0.6, dir: 90, ph: 0 },
      { o: EX[1], x0: 6.5, x1: 3.0, z: 2.2, dir: -90, ph: 1.3 },
      { o: EX[3], x0: 1.6, x1: 1.6, z: -1.6, dir: 15, ph: 2.1, wave: true },
    ].map(w => { const A = add(S, makeAvatar({ ...w.o, face: w.wave ? 'grin' : 'smile' }), [w.x0, 0, w.z], w.dir);
      const sh = floorShadow(S, w.o, [w.x0, w.z]); sh.root.rotation.y = w.dir * D; return { ...w, A, sh }; });
    return (t, dur) => {
      camPath(cam, t / dur, [0, 4.8, 15], [0, 4.4, 12.5], [0, 2.8, 0], [0, 2.9, 0], 26);
      for (const w of walkers) {
        const p = t / dur; const x = w.x0 + (w.x1 - w.x0) * p;
        const pose = w.wave ? addPose(POSES.wave, { rUp: Math.sin(t * 12) * 15, ...idle(t, 1, w.ph) }) : walk(t + w.ph, 1);
        if (w.wave) { w.A.root.position.x = w.x0; } else w.A.root.position.x = x;
        w.A.pose(pose); w.sh.pose(pose); w.sh.flat.position.x = w.A.root.position.x;
      }
    };
  },
  // 2 "your shadow shows how you really feel."
  (S, cam) => {
    dayLight(S, { sunPos: [-10, 9, 12] }); wall(S, 0xa04030);
    const leo = add(S, makeAvatar({ ...LEO, face: 'neutral' }), [-1.7, 0, 0.6], 8);
    const sh = wallShadow(S, LEO, [1.9, -2.47], { size: 1.15 });
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 4.2, 15.5], [0.6, 4.1, 13.5], [0.2, 3.3, -1], [0.4, 3.3, -1], 30);
      leo.pose(addPose(POSES.rest, { ...idle(t, 0.8), turn: track([[0, { a: 0 }], [0.7, { a: 30 }], [1.3, { a: 30 }], [1.6, { a: 0 }]], t).a }));
      const j = Math.abs(Math.sin(t * 7));
      sh.pose({ rUp: 150 + Math.sin(t * 14) * 18, lUp: 150 - Math.sin(t * 14) * 18, bob: j * 0.9, rLegOut: j * 12, lLegOut: j * 12, tilt: Math.sin(t * 7) * 8 });
      sh.flat.position.y = j * 0.6;
    };
  },
  // 3 "You see, your face can smile all day,"
  (S, cam) => {
    dayLight(S, { sunPos: [-6, 10, 12] }); wall(S, 0xa04030);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin' }), [0, 0, 0], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 4.9, 7.0], [0, 4.8, 5.6], [0, 4.4, 0], [0, 4.45, 0], 50);
      leo.pose(addPose(POSES.hips, { tilt: Math.sin(t * 6) * 9, bob: Math.abs(Math.sin(t * 6)) * 0.08, rUp: Math.sin(t * 6) * 4, lUp: -Math.sin(t * 6) * 4 }));
    };
  },
  // 4 "but your shadow can't lie."
  (S, cam) => {
    dayLight(S, { sunPos: [-10, 9, 12] }); wall(S, 0xa04030);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin' }), [-2.0, 0, 1.4], 15);
    const sh = wallShadow(S, LEO, [1.9, -2.47], { size: 1.15 });
    return (t, dur) => {
      camPath(cam, t / dur, [-1.4, 4.2, 12.5], [0.6, 4.0, 11.5], [-1.6, 3.9, 0], [1.4, 3.6, -2.4], 30);
      leo.pose(addPose(POSES.hips, { tilt: Math.sin(t * 6) * 8 }));
      sh.pose(addPose(track([[0, POSES.hips], [0.35, POSES.hips], [0.85, POSES.slump]], t), { tilt: -Math.sin(t * 2) * 3 }));
    };
  },
  // 5 "My teacher says she loves Mondays."
  (S, cam) => {
    classroom(S);
    const tch = add(S, makeAvatar({ ...TEACH, face: 'grin' }), [0, 0, -6.4], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.3, 4.6, 5.5], [0.3, 4.4, 3.4], [0, 4.1, -6.4], [0, 4.3, -6.4], 28);
      const pump = Math.sin(t * 9);
      tch.pose({ ...POSES.armsup, rUp: 150 + pump * 15, lUp: 150 - pump * 15, bob: Math.abs(pump) * 0.25, tilt: pump * 6 });
    };
  },
  // 6 "Her shadow is lying face-down on the floor."
  (S, cam) => {
    classroom(S, false);
    const tch = add(S, makeAvatar({ ...TEACH, face: 'grin' }), [-2.6, 0, -7.0], 10);
    const sh = floorShadow(S, TEACH, [2.6, -4.6], -100, 1.0);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 8.6, 2.2], [0, 8.0, 1.0], [-0.3, 0.6, -4.6], [-0.3, 0.8, -4.8], 22);
      tch.pose(addPose(POSES.rest, idle(t, 1)));
      const fall = track([[0, POSES.rest], [0.25, POSES.rest], [0.65, POSES.sprawl]], t, snap);
      sh.pose(addPose(fall, { rUp: t > 0.8 ? Math.sin(t * 3) * 4 : 0, lLegOut: t > 1.0 ? Math.max(0, Math.sin(t * 9)) * 6 : 0 }));
    };
  },
  // 7 "Dad says he loves Mom's meatloaf."
  (S, cam) => {
    dining(S);
    const dad = add(S, makeAvatar({ ...DAD, face: 'grin', name: 'dad' }), [0.3, 0, -5.8], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 4.7, 4.8], [0.5, 4.5, 3.2], [0.3, 3.9, -4.8], [0.3, 4.1, -4.8], 30);
      const k = [[0, { rFwd: 30 }], [0.35, { rFwd: 30 }], [0.7, { rFwd: 125, rUp: 15, nod: -6 }], [1.1, { rFwd: 110, rUp: 12, nod: 4 }], [1.4, { rFwd: 125, rUp: 15, nod: -6 }]];
      dad.pose(addPose(track(k, t), { tilt: Math.sin(t * 5) * 5, bob: Math.abs(Math.sin(t * 5)) * 0.05, lUp: 4 }));
    };
  },
  // 8 "His shadow is spitting it into a napkin."
  (S, cam) => {
    dining(S);
    const dad = add(S, makeAvatar({ ...DAD, face: 'grin', name: 'dad' }), [-1.6, 0, -5.8], 12);
    const sh = wallShadow(S, DAD, [2.8, -8.97], { profile: true, size: 1.2 });
    const nap = box(S, [1.0, 0.9, 0.02], [0, 0, -8.96], shadowMatWall, { r: 0, cast: false }); nap.renderOrder = 2;
    return (t, dur) => {
      camPath(cam, t / dur, [-0.6, 4.5, 5.8], [0.2, 4.3, 4.4], [0.4, 4.0, -6], [1.2, 4.0, -6.5], 26);
      dad.pose(addPose({ rFwd: 0, lUp: 4 }, idle(t, 1)));
      const sp = track([[0, { rFwd: 40 }], [0.3, { rFwd: 40 }], [0.75, { lean: 35, nod: 40, rFwd: 120, rUp: 8 }]], t);
      sh.pose(addPose(sp, { turn: t > 0.8 ? Math.sin(t * 25) * 6 : 0, lean: t > 0.8 ? Math.sin(t * 12) * 4 : 0 }));
      const v = ease((t - 0.6) / 0.3);
      nap.visible = t > 0.6; nap.position.set(2.8 + 1.75 * v, 3.6 - 0.2 * v, -8.96); nap.rotation.z = 20 * D;
    };
  },
  // 9 "My cousin says his new haircut looks cool."
  (S, cam) => {
    dayLight(S, { sunPos: [-6, 10, 12] }); wall(S, 0x4a6fa5);
    const c = add(S, makeAvatar({ ...COUS, face: 'smirk' }), [0, 0, 0], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 5.0, 7.2], [0.3, 4.9, 5.6], [0, 4.5, 0], [0, 4.6, 0], 42);
      const k = [[0, POSES.hips], [0.4, POSES.hips], [0.8, { rUp: 160, rFwd: 30, lUp: 28, lFwd: -8, tilt: -10 }], [1.3, { rUp: 160, rFwd: 30, lUp: 28, lFwd: -8, tilt: 8, nod: -6 }], [1.7, POSES.hips]];
      c.pose(addPose(track(k, t), { bob: Math.sin(t * 4) * 0.03 }));
    };
  },
  // 10 "His shadow is wearing a hat."
  (S, cam) => {
    dayLight(S, { sunPos: [-10, 9, 12] }); wall(S, 0x4a6fa5);
    const c = add(S, makeAvatar({ ...COUS, face: 'worried' }), [-1.7, 0, 1.4], 20);
    const sh = wallShadow(S, { ...COUS, hair: null, hat: true }, [1.9, -2.47], { size: 1.15 });
    return (t, dur) => {
      camPath(cam, t / dur, [-0.6, 4.3, 13.5], [0.2, 4.2, 12], [0.2, 4.0, -1], [0.6, 4.1, -1.5], 30);
      c.pose(addPose(POSES.rest, { turn: track([[0, { a: 0 }], [0.4, { a: 35 }]], t).a, ...idle(t, 0.6) }));
      sh.pose(addPose(track([[0, POSES.hips], [0.5, POSES.hips], [0.8, { rUp: 140, rFwd: 25, lUp: 28 }], [1.1, { rUp: 150, rFwd: 25, lUp: 28, tilt: 10 }], [1.4, POSES.hips]], t), { bob: Math.sin(t * 5) * 0.04 }));
    };
  },
  // 11 "So everyone in town is very careful where they stand."
  (S, cam) => {
    dayLight(S, { sunPos: [3, 16, 7], intensity: 3.2 });
    box(S, [60, 0.3, 30], [0, -0.15, 6], repeatMat(T.concrete(0xb9b2a7), 15, 8), { r: 0, cast: false });
    box(S, [40, 12, 1], [0, 6, -6.5], repeatMat(T.facade(0x8a5a86), 5, 2), { r: 0, cast: false });
    const aw = std({ color: 0xcc3b33 });
    box(S, [16, 0.2, 3.4], [0, 6.6, -4.6], aw, { r: 0.05, rot: [-10 * D, 0, 0] });
    for (let i = 0; i < 8; i++) box(S, [2, 0.6, 0.1], [-7 + i * 2, 6.25, -2.95], i % 2 ? std({ color: 0xffffff }) : aw, { r: 0 });
    const ppl = [[-4.4, EX[0]], [0, EX[2]], [4.4, EX[3]]].map(([x, o], i) => ({ A: add(S, makeAvatar({ ...o, face: i === 1 ? 'neutral' : 'worried' }), [x, 0, -4.8], 0), x, i }));
    // a sunny bench in foreground nobody uses
    box(S, [4, 0.3, 1.2], [5, 1.4, 3], std({ map: T.planks(0x9a6a40) })); box(S, [0.3, 1.4, 1], [3.4, 0.7, 3], std({ color: 0x333333 })); box(S, [0.3, 1.4, 1], [6.6, 0.7, 3], std({ color: 0x333333 }));
    return (t, dur) => {
      camPath(cam, t / dur, [-2.0, 3.8, 12.5], [1.5, 3.8, 12], [-1, 3.6, -5], [0.8, 3.6, -5], 24);
      for (const p of ppl) {
        p.A.pose(addPose(POSES.rest, { turn: Math.sin(t * 2.2 + p.i * 2) * 40, rUp: 2, nod: -4 }));
        p.A.root.position.x = p.x + Math.sin(t * 1.5 + p.i) * 0.15;
      }
    };
  },
  // 12 "Everyone except me."
  (S, cam) => {
    dayLight(S, { sunPos: [-5, 14, -10] }); street(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin' }), [0, 0, 0], 0);
    const sh = floorShadow(S, LEO, [0, 0], 0, 1.1);
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 3.4, 14], [0.4, 3.5, 12.5], [0, 4.4, 0], [0, 4.5, 0], 30);
      const j = Math.abs(Math.sin(t * 6.5));
      const p = { rUp: 150 + Math.sin(t * 13) * 15, lUp: 150 - Math.sin(t * 13) * 15, rLeg: -j * 15, lLeg: j * 15, tilt: Math.sin(t * 6.5) * 5 };
      leo.pose(p); leo.root.position.y = j * 1.1; sh.pose(p); leo.blob.scale.setScalar(1 - j * 0.3); leo.blob.position.y = 0.03 - j * 1.1;
    };
  },
  // 13 "I'm Leo. I'm twelve."
  (S, cam) => {
    dayLight(S, { sunPos: [-5, 12, 10] }); street(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'smile' }), [0, 0, 0], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.7, 4.8, 6.0], [0.4, 4.7, 4.9], [0, 4.2, 0], [0, 4.3, 0], 42);
      leo.pose(addPose(POSES.wave, { rUp: Math.sin(t * 11) * 14, tilt: -6 + Math.sin(t * 5) * 4, bob: Math.abs(Math.sin(t * 5)) * 0.05 }));
      leo.setFace(t > 0.75 ? 'grin' : 'smile');
    };
  },
  // 14 "And three days ago,"
  (S, cam) => {
    bedroom(S);
    const leo = makeAvatar({ ...LEO, face: 'smile', blob: false, name: 'leo' }); leo.root.position.set(-3.5, 2.45, -0.9); leo.root.rotation.x = -90 * D; S.add(leo.root);
    S.userData.allowContact = [['leo', 'box 4.1x0.9x4.6*'], ['leo', 'box 2.6x0.5x1.2*'], ['leo', 'box 3.8x0.6x6.8*']];   // under the blanket, head on the pillow
    box(S, [4.1, 0.9, 4.6], [-3.5, 2.55, -2.3], std({ map: T.plaster(0x3f6fb8) }), { r: 0.3 });
    return (t, dur) => {
      camPath(cam, t / dur, [1.2, 7.8, 0.5], [0.6, 7.4, -0.5], [-3.5, 2.4, -4.8], [-3.5, 2.5, -5.2], 30);
      leo.pose({ bob: Math.sin(t * 2.5) * 0.03, tilt: Math.sin(t * 1.2) * 3 });
    };
  },
  // 15 "my shadow got up and walked away."
  (S, cam) => {
    bedroom(S);
    const leo = makeAvatar({ ...LEO, face: 'shock', blob: false, name: 'leo' }); leo.root.position.set(-3.5, 2.45, -0.9); leo.root.rotation.x = -90 * D; S.add(leo.root);
    S.userData.allowContact = [['leo', 'box 4.1x0.9x4.6*'], ['leo', 'box 2.6x0.5x1.2*'], ['leo', 'box 3.8x0.6x6.8*']];
    box(S, [4.1, 0.9, 4.6], [-3.5, 2.55, -2.3], std({ map: T.plaster(0x3f6fb8) }), { r: 0.3 });
    const mat = shadowMatWall.clone();
    const sh = wallShadow(S, LEO, [-1.0, -8.97], { profile: true, size: 1.12, mat });
    return (t, dur) => {
      camPath(cam, t / dur, [-0.8, 4.6, 3.6], [-0.4, 4.4, 2.6], [0.6, 3.6, -7], [1.6, 3.4, -7], 26);
      leo.pose({ turn: 0, nod: -10 + Math.sin(t * 20) * 2 });
      const w = ease(Math.min(1, t / (dur * 0.95)));
      const x = -1.0 + 5.2 * w; sh.flat.position.x = x; sh.pose(walk(t, 0.85, 34));
      mat.opacity = 0.82 * Math.max(0, Math.min(1, (3.9 - x) / 0.6));
    };
  },
  // 16 "Without me."
  (S, cam) => {
    dayLight(S, { sunPos: [-5, 14, -10] }); street(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'neutral', blob: false }), [0, 0, 0], 0);
    const bg = [{ o: EX[4], x0: -9, z: -7, dir: 90 }, { o: EX[0], x0: 9, z: -8.5, dir: -90 }].map(w => {
      const A = add(S, makeAvatar({ ...w.o, face: 'smile' }), [w.x0, 0, w.z], w.dir); const s = floorShadow(S, w.o, [w.x0, w.z]); s.root.rotation.y = w.dir * D; return { ...w, A, s }; });
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 3.4, 9.5], [0.2, 4.5, 5.6], [0, 2.4, 0], [0, 4.3, 0], 30, 36);
      const k = [[0, { nod: 32, rUp: 4, lUp: 4 }], [0.55, { nod: 32, rUp: 4, lUp: 4 }], [0.75, POSES.shock]];
      leo.pose(addPose(track(k, t, snap), t > 0.75 ? { rUp: Math.sin(t * 30) * 2 } : {}));
      leo.setFace(t > 0.6 ? 'shock' : 'neutral');
      for (const b of bg) { const x = b.x0 + (b.dir > 0 ? 1 : -1) * t * 2.2; b.A.root.position.x = x; b.s.flat.position.x = x; const p = walk(t, 1); b.A.pose(p); b.s.pose(p); }
    };
  },
];
