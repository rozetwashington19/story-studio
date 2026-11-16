import * as THREE from 'three';
import { POSES, addPose, ease, snap, idle, walk, D, std, box, camPath, track, seg, sob, dayLight, houseFront, kidRoomDay, bedroom, hallway, street, backyard,
  bridge, hill, hillY, promiseString, pinky, ladder, bird, birdNest, laundryItem, L } from '../../engine/kit.js';
import { ROSA, MOM, DAD, BENNY, ORTIZ, PRIYA, KIDS, SCALE, mk, head, close, faceCam, fill, WINDOW_OUT, tie, link, drawing, leaves, schoolFront, sinkKitchen } from './common.js';

const FAR = [140, 46, 70];          // where Rosa's string heads in town exteriors (toward the hill)
const clamp01 = x => Math.max(0, Math.min(1, x));
const B = SCALE.benny;
// flicker for a fading string
const flick = (t, base) => base * (0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 5.3));

export const SHOTS_A = [
  // 1 "In this world,"
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const a = mk(S, KIDS[0], 'k0', 'smile', [-9, 0, 9], 90), b = mk(S, KIDS[1], 'k1', 'grin', [-13.5, 0, 9], 90);
    const ab = link(S, b, a, { sag: 0.5, sideA: 'L', sideB: 'R' });
    const w1 = promiseString(S), w2 = promiseString(S, { col: 0xff9ad0 });
    return (t, dur) => {
      camPath(cam, t / dur, [-3, 10, 36], [-2, 7.5, 31], [-2, 7, -4], [-2, 5.5, -4], 26);
      a.root.position.x = -9 + t * 3; b.root.position.x = -13.5 + t * 3; a.pose(walk(t, 1)); b.pose(walk(t + 0.3, 1)); ab.update();
      w1.set([-5.5, 5.4, -5.7], FAR, { sag: 3, fade: 0.9 });
      w2.set([-9, 5.4, -5.7], [-26, 7, -4], { sag: 1.5 });
    };
  },
  // 2 "every promise ties a glowing string between two pinkies."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const a = mk(S, KIDS[2], 'kidA', 'smile', [-2.3, 0, 4], 90), b = mk(S, KIDS[3], 'kidB', 'grin', [2.3, 0, 4], -90);
    const l = link(S, a, b, { sag: 0.05, sideA: 'R', sideB: 'L' });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      const back = ease(clamp01((t - dur * 0.5) / (dur * 0.4)));
      a.root.position.x = -2.3 - back * 1.8; b.root.position.x = 2.3 + back * 1.8;
      if (k === 0) camPath(cam, p, [0.6, 4.4, 18], [0.4, 4.2, 16.5], [0, 3.2, 4.5], [0, 3.2, 4.5], 26);
      else camPath(cam, p, [0, 5.0, 25], [0, 4.8, 23], [0, 3.0, 4], [0, 3.0, 4], 26);
      const reach = k === 0 ? 70 : 45;
      a.pose(addPose({ rFwd: reach, lUp: 4 }, { tilt: Math.sin(t * 3) * 3 })); b.pose(addPose({ lFwd: reach, rUp: 4 }, { tilt: Math.sin(t * 3 + 1) * 3 }));
      const f = clamp01((t - 0.35) / 0.4); l.update({ fade: f, sag: 0.05 + back * 0.5 });
    };
  },
  // 3 "You see, the string stays until you keep the promise."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const a = mk(S, KIDS[2], 'kidA', 'smile', [-2.4, 0, 4], 90), b = mk(S, KIDS[3], 'kidB', 'smile', [2.4, 0, 4], -90);
    const l = link(S, a, b, { sag: 0.4, sideA: 'L', sideB: 'R' });
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.25), std({ color: 0x3a6ad8 })); S.add(book);
    const sparks = []; for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true })); S.add(m); sparks.push(m); }
    return (t, dur) => {
      camPath(cam, t / dur, [0, 4.6, 22], [0.3, 4.4, 20], [0, 3.0, 4], [0, 3.0, 4], 26);
      const give = ease(clamp01((t - 0.5) / 0.7));
      a.pose(addPose({ rFwd: 70 - give * 10, lUp: 4 }, idle(t, 0.6))); b.pose(addPose({ lFwd: 30 + give * 40, rUp: 4 }, idle(t, 0.6, 2)));
      const hp = pinky(a, 'R').lerp(pinky(b, 'L'), give); book.position.set(hp.x, hp.y - 0.2, hp.z); book.rotation.y = Math.PI / 2;
      const kept = clamp01((t - 1.3) / 0.6);
      l.update({ fade: kept < 1 ? 1 + Math.sin(kept * Math.PI) * 1.5 - kept : 0 });
      if (kept >= 1) l.s.hide();
      sparks.forEach((m, i) => { const u = (i + 0.5) / sparks.length; const p0 = pinky(a, 'L').lerp(pinky(b, 'R'), u); m.position.set(p0.x, p0.y - 0.6 * 4 * u * (1 - u) + kept * (1 + (i % 3)) * 0.8, p0.z + Math.sin(i) * kept);
        m.material.opacity = kept > 0 ? 1 - kept : 0; m.visible = kept > 0 && kept < 1; });
      if (t > 1.6) { a.setFace('grin'); b.setFace('grin'); }
    };
  },
  // 4 "And if you break it, it snaps. [pause]"
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const a = mk(S, KIDS[0], 'kidC', 'smirk', [-2.4, 0, 4], 70), b = mk(S, KIDS[1], 'kidD', 'smile', [2.4, 0, 4], -70);
    const l = link(S, a, b, { sag: 0.5, sideA: 'L', sideB: 'R' });
    const cookie = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 20), std({ color: 0xb07a3a })); cookie.rotation.x = Math.PI / 2; S.add(cookie);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) camPath(cam, p, [0, 4.6, 21], [0, 4.4, 19], [0, 3.0, 4], [0, 3.0, 4], 26);
      else faceCam(cam, p, head(2.4, 4), -70, { side: 1.4, dist: 7 });
      const eat = ease(clamp01((t - 0.2) / 0.5));
      a.pose(addPose({ rFwd: 40 + eat * 85, rUp: 10, lUp: 4 }, { nod: Math.sin(t * 14) * 4 * eat }));
      const hp = pinky(a, 'R'); cookie.position.set(hp.x, hp.y + 0.15, hp.z); cookie.visible = t < 1.1;
      const sn = clamp01((t - 0.9) / 0.7); l.update({ snap: sn, fade: 1 - sn * 0.4 });
      b.pose(sn > 0 ? addPose(POSES.shock, { nod: -6, bob: Math.sin(t * 20) * 0.02 }) : addPose({ rUp: 6, lUp: 6 }, idle(t)));
      b.setFace(sn > 0 ? 'shock' : 'smile'); a.setFace(sn > 0.3 ? 'worried' : 'smirk');
    };
  },
  // 5 "Dad promised Mom he'd fix the sink."
  (S, cam) => {
    const sk = sinkKitchen(S);
    const d = mk(S, DAD, 'dad', 'grin', [-2.4, 0, -3.2], 15), m = mk(S, MOM, 'mom', 'neutral', [2.4, 0, -3.2], -15);
    const l = link(S, d, m, { sag: 0.3, sideA: 'L', sideB: 'R' });
    return (t, dur) => {
      camPath(cam, t / dur, [0.8, 5.2, 14], [0.4, 5.0, 12.5], [0, 3.2, -4], [0, 3.4, -4], 26);
      d.pose(track([[0, { rFwd: 20, lFwd: 30 }], [0.6, { rUp: 150, lFwd: 30, nod: -8 }], [1.2, { rUp: 140, lFwd: 30, nod: 4 }], [2.4, { rFwd: 85, lFwd: 30, turn: 30 }]], t));
      m.pose(addPose({ rFwd: 30, lFwd: 50, lUp: -20, tilt: 10 }, idle(t, 0.6))); l.update();
      sk.drip.position.y = 3.8 - ((t * 1.6) % 1) * 0.8; sk.drip.visible = ((t * 1.6) % 1) < 0.9;
    };
  },
  // 6 "Their string is three years old. Mom hangs laundry on it."
  (S, cam) => {
    const sk = sinkKitchen(S);
    const d = mk(S, DAD, 'dad', 'smile', [6.0, 0, -2.5], -50), m = mk(S, MOM, 'mom', 'smirk', [-5.5, 0, -2.5], 50);
    const paper = box(S, [1.6, 1.1, 0.05], [0, 0, 0], std({ color: 0xf2efe6 }), { r: 0, solid: false, cast: false });
    const l = link(S, m, d, { sag: 0.6, sideA: 'L', sideB: 'R' });
    const items = [[0.22, 1, 0xe8484f], [0.38, 0, 0x4a8ae8], [0.55, 2, 0xf2c230], [0.72, 1, 0x3ab06a]].map(([u, k, c]) => ({ u, g: laundryItem(S, k, c) }));
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [0, 5.4, 18], [0, 5.2, 16.5], [0.3, 3.2, -3], [0.3, 3.2, -3], 26);
      else faceCam(cam, p, head(-5.5, -2.5), 50, { side: -1.6, dist: 7.2, lens: 30 });
      d.pose(addPose({ rFwd: 55, lFwd: 55, nod: 18 }, idle(t, 0.5))); const hp = pinky(d, 'L'); paper.position.set(hp.x - 0.4, hp.y + 0.6, hp.z + 0.5); paper.rotation.y = -50 * D;
      m.pose(track([[0, { lFwd: 60, rFwd: 120, rUp: 10 }], [0.8, { lFwd: 60, rFwd: 135, rUp: 20 }], [1.6, { lFwd: 60, rFwd: 120, rUp: 10 }], [2.4, { lFwd: 60, rFwd: 135, rUp: 20 }]], t % 2.4));
      const s = l.update({ sag: 0.6 + Math.sin(t * 2) * 0.05 });
      items.forEach(({ u, g }, i) => { g.position.copy(s.at(u)); g.rotation.y = 0; g.rotation.z = Math.sin(t * 2 + i) * 0.08; });
      sk.drip.position.y = 3.8 - ((t * 1.6) % 1) * 0.8;
    };
  },
  // 7 "My brother Benny promised to stay out of my room."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'smirk', [-1.0, 0, -2.5], 20), b = mk(S, BENNY, 'benny', 'determined', [3.6, 0, -2.5], -20, B);
    const l = link(S, r, b, { sag: 0.2, sideA: 'L', sideB: 'R' });
    return (t, dur) => {
      camPath(cam, t / dur, [1.4, 4.6, 12.5], [1.4, 4.4, 11], [1.3, 3.2, -2.5], [1.3, 3.1, -2.5], 28);
      r.pose(addPose({ lFwd: 40, rUp: 25, rFwd: -10 }, idle(t, 0.6)));
      b.pose(track([[0, { rFwd: 40, lFwd: 20, nod: -6 }], [0.7, { rFwd: 40, lFwd: 70, lUp: -35, nod: -10 }], [dur, { rFwd: 40, lFwd: 70, lUp: -35, nod: -4, tilt: 6 }]], t));
      l.update({ fade: clamp01(t / 0.4) });
    };
  },
  // 8 "His string snapped in four seconds."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'neutral', [4.8, 0, 0.8], -40), b = mk(S, BENNY, 'benny', 'grin', [0.4, 0, 0.5], -60, B);
    const l = link(S, b, r, { sag: 0.3, sideA: 'R', sideB: 'L' });
    return (t, dur) => {
      camPath(cam, t / dur, [1.8, 4.8, 11.5], [1.6, 4.6, 10.5], [1.8, 2.9, -1.0], [1.6, 2.9, -1.0], 22);
      const run = ease(clamp01(t / 0.8)); b.root.position.set(0.4 - run * 1.6, 0, 0.5 - run * 1.1); b.root.rotation.y = (-60 - run * 60) * D;
      b.pose(t < 0.8 ? walk(t, 1.6) : addPose(POSES.armsup, { bob: 0, rUp: Math.sin(t * 12) * 10 })); b.root.position.y = t > 0.8 ? Math.abs(Math.sin(t * 7)) * 0.8 : 0;
      const sn = clamp01((t - 0.35) / 0.6); l.update({ snap: sn });
      r.pose(sn > 0.2 ? addPose(POSES.hips, { nod: 6, tilt: -8 }) : addPose({ rUp: 4, lFwd: 30 }, idle(t))); r.setFace(sn > 0.2 ? 'shock' : 'neutral');
      if (t > 1.3) r.setFace('worried');
    };
  },
  // 9 "Mr. Ortiz promised to return our ladder."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const d = mk(S, DAD, 'dad', 'smile', [-7, 0.6, -3.6], 30), o = mk(S, ORTIZ, 'ortiz', 'grin', [-3, 0, 6], 90);
    const lad = ladder(S, 7); lad.rotation.z = Math.PI / 2;
    const l = link(S, d, o, { sag: 0.8, sideA: 'L', sideB: 'L' });
    return (t, dur) => {
      camPath(cam, t / dur, [-1, 5.5, 23], [0.5, 5.2, 21], [-2, 3.2, 1], [0, 3.2, 2], 28);
      o.root.position.x = -3 + t * 2.4; o.pose(addPose(walk(t, 0.8, 28), { rFwd: 30, rUp: 6, lUp: 150, lFwd: 0 }));
      o.pose(addPose(walk(t, 0.8, 28), { rFwd: 30, lUp: 150, lFwd: 0, rUp: 0 }));
      const hp = pinky(o, 'R'); lad.position.set(hp.x + 3.5, hp.y + 0.2, hp.z + 0.3);
      d.pose(addPose(POSES.wave, { rUp: Math.sin(t * 10) * 14 })); l.update({ sag: 0.6 + t * 0.2 });
    };
  },
  // 10 "Birds built a nest on his string."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const o = mk(S, ORTIZ, 'ortiz', 'fakesmile', [6, 0, 6], -20);
    const s = promiseString(S); const nest = birdNest(S); const b1 = bird(S, 0x4a7ad0), b2 = bird(S, 0xe8484f);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.55]);
      s.set(pinky(o, 'L'), [-12, 5.6, -5.6], { sag: 1.4 });
      const np = s.at(0.45); nest.position.set(np.x, np.y + 0.18, np.z);
      b1.position.set(np.x - 0.25, np.y + 0.5 + Math.abs(Math.sin(t * 6)) * 0.2, np.z); b1.rotation.y = 0.4 + Math.sin(t * 2) * 0.3; b1.userData.flap(t, 0.5);
      b2.position.set(np.x + 1.2 + Math.sin(t * 3) * 0.6, np.y + 1.6 + Math.sin(t * 5) * 0.3, np.z + 0.4); b2.rotation.y = -0.8; b2.userData.flap(t);
      if (k === 0) camPath(cam, p, [np.x + 1.0, np.y + 1.4, np.z + 6.5], [np.x + 0.6, np.y + 1.0, np.z + 5.2], [np.x, np.y + 0.4, np.z], [np.x, np.y + 0.4, np.z], 34);
      else camPath(cam, p, [3, 5.6, 21], [3.6, 5.2, 19.5], [3.6, 3.6, 3], [5.0, 3.4, 4], 26);
      o.pose(addPose({ lFwd: 30, rUp: 30, rFwd: 40, nod: -18 }, { tilt: Math.sin(t * 2) * 6 }));
    };
  },
  // 11 "Everybody's strings come and go."
  (S, cam) => {
    dayLight(S, { area: 30 }); street(S, { farBuildings: true });
    const P = [[0, 1, -14, 0, 1], [2, 3, 12, 3, -1], [1, 0, -6, -16, 1]].map(([i, j, x, z, dir], n) => {
      const a = mk(S, KIDS[i], 'p' + n + 'a', 'smile', [x, 0, z], dir * 90), b = mk(S, KIDS[j], 'p' + n + 'b', 'grin', [x - dir * 4.6, 0, z], dir * 90);
      return { a, b, x, dir, l: link(S, b, a, { sag: 0.5, sideA: dir > 0 ? 'L' : 'R', sideB: dir > 0 ? 'R' : 'L', col: [0xffc864, 0xff9ad0, 0x8ad8ff][n] }) };
    });
    return (t, dur) => {
      camPath(cam, t / dur, [-4, 6, 24], [4, 5.5, 24], [-2, 2.8, -4], [2, 2.8, -4], 26);
      P.forEach(({ a, b, x, dir, l }, n) => { a.root.position.x = x + dir * t * 2.6; b.root.position.x = x - dir * 4.6 + dir * t * 2.6; a.pose(walk(t + n, 0.9)); b.pose(walk(t + n + 0.4, 0.9));
        const f = n === 0 ? clamp01(t / 0.5) : n === 1 ? 1 - clamp01((t - 0.9) / 0.5) : clamp01((t - 0.6) / 0.5); l.update({ fade: f }); if (f <= 0) l.s.hide(); });
    };
  },
  // 12 "Except one. [pause]"
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const s = promiseString(S, { r: 0.07 });
    return (t, dur) => {
      const p = t / dur;
      camPath(cam, p, [-12, 6, 20], [-4, 14, 26], [-5.5, 5.6, -5.7], [30, 20, 10], 30);
      s.set([-5.5, 5.4, -5.7], FAR, { sag: 3, fade: 0.8 + Math.sin(t * 3) * 0.2 });
    };
  },
  // 13 "I'm Rosa. I'm eleven."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'grin', [0.8, 0, -3.5], 10); const st = tie(S, r, WINDOW_OUT, { sag: 0.6 });
    return (t, dur) => {
      camPath(cam, t / dur, [1.4, 4.6, 7], [1.2, 4.6, 5.8], [0.6, 3.9, -3.5], [0.6, 4.0, -3.5], 34);
      r.pose(addPose({ lUp: 150, rUp: 8, rFwd: 10 }, { lUp: Math.sin(t * 12) * 16, ...idle(t, 1.2) })); st.update();
    };
  },
  // 14 "And I've had the same string my whole life."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'smile', [0.8, 0, -3.5], 25); const st = tie(S, r, WINDOW_OUT, { sag: 0.5 });
    return (t, dur) => {
      const a = t / dur;
      camPath(cam, a, [3.6, 4.8, 3.2], [1.6, 4.9, 2.8], [0.2, 4.1, -3.5], [0.4, 4.2, -3.5], 36);
      r.pose(addPose({ rFwd: 95, rUp: -12, lUp: 4, nod: 10, turn: 20 }, { tilt: Math.sin(t * 1.5) * 4 })); st.update();
    };
  },
  // 15 "It goes out my window and over the hill."
  (S, cam) => {
    hill(S, { trees: false });
    const s = promiseString(S, { r: 0.18 });
    return (t, dur) => {
      camPath(cam, t / dur, [8, -12, 70], [6, -9, 62], [0, -8, 30], [0, 2, -10], 26);
      s.set([30, 10, 120], [0, -6, -70], { sag: -18, fade: 1 });
    };
  },
  // 16 "I don't remember the promise. [pause]"
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'worried', [0.8, 0, -3.5], 10); const st = tie(S, r, WINDOW_OUT, { sag: 0.6 });
    return (t, dur) => {
      close(cam, t / dur, head(0.8, -3.5), { side: 0.6, push: 0.9, dist: 7 });
      r.pose(addPose(POSES.shrug, { nod: 6 + Math.sin(t * 1.2) * 3, tilt: 10, rUp: Math.sin(t * 2) * 4 })); st.update();
    };
  },
  // 17 "At first, it was kind of useful."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'grin', [1.4, 0, -3.0], 10); const st = tie(S, r, WINDOW_OUT, { sag: 0.4 });
    return (t, dur) => {
      camPath(cam, t / dur, [2.6, 5.0, 5.4], [2.2, 4.8, 4.4], [0.4, 4.0, -3.2], [0.2, 4.1, -3.4], 30);
      const pl = (t * 1.6) % 1; r.pose(addPose({ rFwd: 40, rUp: -5, lFwd: 70, lUp: -25 + Math.sin(pl * Math.PI) * 15 }, idle(t, 0.6)));
      st.update({ sag: 0.4 + Math.sin(t * 40) * 0.35 * Math.exp(-pl * 4) });
    };
  },
  // 18 "It made a great jump rope."
  (S, cam) => {
    backyard(S);
    const b = mk(S, BENNY, 'benny', 'grin', [-4.6, 0, 0.5], 90, B), p = mk(S, PRIYA, 'priya', 'grin', [4.6, 0, 0.5], -90), r = mk(S, ROSA, 'rosa', 'grin', [0, 0, 1.85], 0);
    const s = promiseString(S, { r: 0.07 });
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 4.4, 17], [0.3, 4.0, 15], [0, 3.0, 1.5], [0, 3.0, 1.5], 30);
      const ph = t * 6.5; // rope angle: 0 = bottom
      b.pose({ rFwd: 70 + Math.cos(ph) * 15, rUp: Math.sin(ph) * 8, lUp: 4 }); p.pose({ lFwd: 70 + Math.cos(ph) * 15, lUp: Math.sin(ph) * 8, rUp: 4 });
      const A = pinky(b, 'R'), C = pinky(p, 'L'); const pts = [];
      for (let i = 0; i <= 24; i++) { const u = i / 24, w = Math.sin(Math.PI * u); const q = A.clone().lerp(C, u); const cy = 3.0;
        q.y = q.y + (cy - q.y) * w - Math.cos(ph) * 2.75 * w; q.z = q.z + (1.85 - q.z) * w + Math.sin(ph) * 2.75 * w; pts.push(q); }
      s.path(pts);
      const air = Math.max(0, Math.cos(ph)); r.root.position.y = air * 1.0;
      r.pose(addPose({ rUp: 30, lUp: 30, rFwd: 10, lFwd: 10, rLeg: air * 30, lLeg: air * 30 }, { tilt: Math.sin(t * 4) * 4 }));
    };
  },
  // 19 "Benny used it as a zipline. Mom said no."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const b = mk(S, BENNY, 'benny', 'grin', [0, 0, 0], 0, B), m = mk(S, MOM, 'mom', 'neutral', [3.2, 0, 7], -15);
    const s = promiseString(S, { r: 0.08 });
    const hanger = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 6, 16, Math.PI), std({ color: 0x8a8a8a, metalness: 0.6 })); S.add(hanger);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.55]);
      s.set([-9, 9, -5.7], [16, 3.0, 12], { sag: 1.2 });
      const u = k === 0 ? 0.3 + ease(p) * 0.2 : 0.5 + Math.sin(p * 3) * 0.01; const q = s.at(u);
      b.root.position.set(q.x, q.y - 4.0, q.z); b.root.rotation.y = 40 * D;
      b.pose(addPose(POSES.armsup, { rUp: -10, lUp: -10, rLeg: 30 + Math.sin(t * 9) * 15, lLeg: 10 - Math.sin(t * 9) * 15 })); b.setFace(k ? 'worried' : 'grin');
      hanger.position.set(q.x, q.y - 0.25, q.z); hanger.rotation.y = 40 * D;
      if (k === 0) camPath(cam, p, [q.x - 2, q.y + 0.5, q.z + 10], [q.x + 0.5, q.y - 0.5, q.z + 9], [q.x, q.y - 2, q.z], [q.x, q.y - 2, q.z], 30);
      else camPath(cam, p, [4, 4.6, 19], [4, 4.4, 17], [2.0, 3.0, 4], [2.4, 3.0, 4.5], 30);
      m.pose(k ? addPose(POSES.hips, { turn: -25, nod: 4, tilt: Math.sin(t * 8) * 6 }) : POSES.rest); m.setFace(k ? 'smirk' : 'neutral');
    };
  },
  // 20 "I hung my drawings on it, like a museum."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'grin', [4.4, 0, -1.6], -20); const st = tie(S, r, WINDOW_OUT, { sag: 0.5 });
    const ds = [0, 1, 2, 3, 0].map((k, i) => ({ u: 0.18 + i * 0.15, m: drawing(S, k, 1.1) }));
    return (t, dur) => {
      camPath(cam, t / dur, [-0.6, 5.2, 8.5], [2.0, 5.0, 9.0], [-0.6, 4.6, -5], [2.6, 3.8, -2.6], 28);
      const s = st.update(); ds.forEach(({ u, m }, i) => { const q = s.at(u); m.position.set(q.x, q.y - 0.6, q.z); m.rotation.y = -0.45; m.rotation.z = Math.sin(t * 2 + i) * 0.05; });
      r.pose(track([[0, { rFwd: 30, lUp: 5 }], [0.8, { rFwd: 30, lUp: 120, lFwd: 20 }], [1.6, { rFwd: 30, lUp: 100, lFwd: 40, turn: 25 }], [dur, { rFwd: 30, lUp: 110, lFwd: 30, turn: 30 }]], t));
    };
  },
  // 21 "But this fall, something changed."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const s = promiseString(S, { r: 0.07 }); const lv = leaves(S, [-16, 10], [0, 14], [-4, 10], 50);
    return (t, dur) => {
      camPath(cam, t / dur, [-10, 13, 30], [-8, 14, 28], [-3, 8.5, -4], [-1, 10, -4], 28);
      s.set([-5.5, 5.4, -5.7], FAR, { sag: 3, fade: flick(t, 0.75) }); lv(t);
    };
  },
  // 22 "My string started to fade."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'worried', [0.8, 0, -3.5], 15); const st = tie(S, r, WINDOW_OUT, { sag: 0.5 });
    return (t, dur) => {
      camPath(cam, t / dur, [3.4, 5.0, 3.0], [2.8, 4.9, 2.4], [0.4, 3.9, -3.5], [0.4, 3.9, -3.5], 32);
      r.pose(addPose({ rFwd: 95, rUp: -12, lUp: 4, nod: 12, turn: 22 }, { tilt: Math.sin(t * 1.5) * 3 }));
      st.update({ fade: flick(t, 1 - 0.55 * (t / dur)) });
    };
  },
  // 23 "Every day, it got thinner. And dimmer."
  (S, cam) => {
    kidRoomDay(S);
    const r = mk(S, ROSA, 'rosa', 'sad', [-0.6, 0, -5.4], -25); const st = tie(S, r, WINDOW_OUT, { sag: 0.3 });
    return (t, dur) => {
      const p = t / dur;
      camPath(cam, p, [2.8, 5.0, 4.6], [2.0, 4.9, 3.6], [-1.0, 4.0, -5.6], [-1.2, 4.2, -5.8], 30);
      r.pose(addPose({ rFwd: 70, rUp: -5, lUp: 4, nod: -8, turn: -25 }, idle(t, 0.5)));
      st.update({ fade: flick(t, 0.5 - 0.25 * p), r: 0.06 - 0.035 * p });
    };
  },
  // 24 "My friend Priya stared at it."
  (S, cam) => {
    hallway(S);
    const r = mk(S, ROSA, 'rosa', 'neutral', [-2.2, 0, -1.5], 10), p = mk(S, PRIYA, 'priya', 'neutral', [2.6, 0, -1.5], -25);
    const st = tie(S, r, [-30, 6, -2], { sag: 0.3 });
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 4.8, 15], [0.3, 4.6, 13.5], [0.2, 3.2, -1.5], [0.2, 3.2, -1.5], 26);
      r.pose(addPose({ rUp: 4, lUp: 4 }, idle(t, 0.8)));
      const lk = ease(clamp01(t / 1.2)); p.pose(addPose({ lean: lk * 22, nod: lk * 30, turn: -lk * 25, rUp: 4, lUp: 4 }, { tilt: Math.sin(t * 2) * 3 })); p.setFace(lk > 0.6 ? 'awe' : 'neutral');
      st.update({ fade: flick(t, 0.32), r: 0.028 });
    };
  },
  // 25 "Rosa, your string is almost see-through!"
  (S, cam) => {
    hallway(S);
    const r = mk(S, ROSA, 'rosa', 'worried', [-2.2, 0, -1.5], 10), p = mk(S, PRIYA, 'priya', 'shock', [2.6, 0, -1.5], -25);
    const st = tie(S, r, [-30, 6, -2], { sag: 0.3 });
    return (t, dur) => {
      const [k, q] = seg(t, dur, [0.5]);
      if (k === 0) faceCam(cam, q, head(2.6, -1.5), -25, { side: 0.4 }); else faceCam(cam, q, head(-2.2, -1.5), 10, { side: -0.6 });
      p.pose(addPose({ lFwd: 80, lUp: -15, rUp: 30, rFwd: 25, turn: -15 }, { tilt: Math.sin(t * 6) * 4 }));
      r.pose(addPose({ rFwd: 30, lUp: 4, nod: 18 }, idle(t, 0.5))); st.update({ fade: flick(t, 0.32), r: 0.028 });
    };
  },
  // 26 "Mom looked worried."
  (S, cam) => {
    sinkKitchen(S);
    const m = mk(S, MOM, 'mom', 'worried', [1.4, 0, -3.6], -15), r = mk(S, ROSA, 'rosa', 'neutral', [-3.4, 0, -1.0], 40);
    const st = tie(S, r, [-30, 6, 2], { sag: 0.3 });
    return (t, dur) => {
      faceCam(cam, t / dur, head(1.4, -3.6), -15, { side: 0.3, push: 0.9 });
      m.pose(addPose({ rFwd: 40, lFwd: 40, rUp: -15, lUp: -15, nod: 14, turn: 18 }, idle(t, 0.5))); r.pose(idle(t, 0.5)); st.update({ fade: flick(t, 0.3), r: 0.028 });
    };
  },
  // 27 "A fading string means someone's still waiting."
  (S, cam) => {
    sinkKitchen(S);
    const m = mk(S, MOM, 'mom', 'sad', [2.2, 0, -3.2], -40), r = mk(S, ROSA, 'rosa', 'worried', [-2.4, 0, -2.0], 45);
    const st = tie(S, r, [-30, 6, 2], { sag: 0.3 });
    return (t, dur) => {
      camPath(cam, t / dur, [-0.4, 5.0, 13.5], [-0.2, 4.8, 12.2], [0, 3.4, -2.6], [0.2, 3.5, -2.6], 26);
      m.pose(addPose({ rFwd: 30, rUp: 4, lFwd: 45 + Math.sin(t * 2) * 8, nod: 10, tilt: 6, lean: 6 }, idle(t, 0.4)));
      r.pose(addPose({ rFwd: 30, lUp: 4, nod: -4 }, idle(t, 0.5))); st.update({ fade: flick(t, 0.3), r: 0.028 });
    };
  },
  // 28 "But they're starting to give up." [pause]
  (S, cam) => {
    sinkKitchen(S);
    const m = mk(S, MOM, 'mom', 'sad', [2.2, 0, -3.2], -40), r = mk(S, ROSA, 'rosa', 'teary', [-2.4, 0, -2.0], 45);
    const st = tie(S, r, [-30, 6, 2], { sag: 0.3 });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) faceCam(cam, p, head(2.2, -3.2), -40, { side: 0.6 }); else faceCam(cam, p, head(-2.4, -2.0), 45, { side: -0.8, push: 1.0 });
      m.pose(addPose({ rFwd: 30, lFwd: 30, nod: 16, tilt: 8 }, idle(t, 0.4))); r.pose(addPose({ rFwd: 40, nod: 14 + t * 2, tilt: -6 }, idle(t, 0.4)));
      st.update({ fade: flick(t, 0.25), r: 0.026 });
    };
  },
  // 29 "That night, I couldn't sleep."
  (S, cam) => {
    bedroom(S);
    const r = mk(S, ROSA, 'rosa', 'sad', [-2.4, 0, -3.2], 90); r.root.position.y = 1.9 - 1.5;
    const st = tie(S, r, [-3.5, 5.6, -10], { sag: 0.2, side: 'L' }); fill(S, [2, 4.5, 1], 8, 0xa8c0ff);
    return (t, dur) => {
      camPath(cam, t / dur, [5.5, 4.6, 7.5], [4.6, 4.4, 6.5], [-1.2, 3.0, -3.2], [-1.4, 3.2, -3.2], 28);
      r.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 20, nod: 22 + Math.sin(t * 0.8) * 4, lean: 8 }, { tilt: Math.sin(t * 1.1) * 3 })); st.update({ fade: flick(t, 0.28), r: 0.026 });
    };
  },
  // 30 "Somebody had been waiting for me my whole life."
  (S, cam) => {
    bedroom(S);
    const r = mk(S, ROSA, 'rosa', 'teary', [1.2, 0, -6.6], -120);
    const st = tie(S, r, [-3.5, 5.6, -10], { sag: 0.2 }); fill(S, [-1.5, 5, -7.8], 10, 0xb8c8ff);
    return (t, dur) => {
      camPath(cam, t / dur, [-3.6, 5.2, -8.4], [-3.2, 5.1, -8.4], [1.2, 4.2, -6.6], [1.2, 4.3, -6.6], 30);
      r.pose(addPose({ rFwd: 50, rUp: -10, lUp: 4, nod: -6 }, idle(t, 0.4))); st.update({ fade: flick(t, 0.28), r: 0.026 });
    };
  },
  // 31 "So on Saturday, I followed it."
  (S, cam) => {
    houseFront(S, { col: '#e6eef2' });
    const r = mk(S, ROSA, 'rosa', 'determined', [-1.5, 0, 0.6], 35); const st = tie(S, r, FAR, { sag: 2.5 });
    return (t, dur) => {
      const p = clamp01(t / dur); r.root.position.set(-1.5 + p * 6.5, 0, 0.6 + p * 8.5);
      camPath(cam, p, [8, 4.4, 22], [10, 4.6, 24], [-1, 3.0, 1.0], [5, 3.2, 9], 26);
      r.pose(addPose(walk(t, 1), { rFwd: 70, rUp: 0 })); r.pose(addPose(walk(t, 1), { rFwd: 70 }));
      st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 32 "Down our street. Past the school."
  (S, cam) => {
    dayLight(S, { area: 30 }); street(S, { farBuildings: false }); schoolFront(S, 4, -18.2);
    const r = mk(S, ROSA, 'rosa', 'determined', [-10, 0, 0], 90); const st = tie(S, r, [80, 9, -6], { sag: 2 });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]); r.root.position.x = -10 + t * 3.0; const x = r.root.position.x;
      if (k === 0) camPath(cam, p, [x - 3, 4.4, 13], [x - 2, 4.4, 13], [x, 3.2, 0], [x + 1, 3.2, 0], 26);
      else camPath(cam, p, [x + 7, 3.2, 12], [x + 6, 3.4, 12], [x, 4.0, -6], [x + 1, 4.5, -8], 26);
      r.pose(addPose(walk(t, 1), { rFwd: 60 })); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 33 "Across the old bridge."
  (S, cam) => {
    bridge(S);
    const r = mk(S, ROSA, 'rosa', 'determined', [-14, 0, 0], 90); const st = tie(S, r, [90, 14, -10], { sag: 3 });
    return (t, dur) => {
      r.root.position.x = -14 + t * 3.0; const x = r.root.position.x;
      camPath(cam, t / dur, [-6, 3.0, 22], [0, 3.5, 20], [-12, 2.8, 0], [x + 1, 2.8, 0], 26);
      r.pose(addPose(walk(t, 1), { rFwd: 60 })); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 34 "Up the hill I used to climb every Sunday."
  (S, cam) => {
    hill(S, { trees: false });
    const r = mk(S, ROSA, 'rosa', 'determined', [0, 0, 34], 180); const st = tie(S, r, [0, 4, -12], { sag: 1 });
    return (t, dur) => {
      const p = clamp01(t / dur); const z = 34 - p * 9; r.root.position.set(0, hillY(0, z), z);
      camPath(cam, p, [14, hillY(0, 32) + 3.6, 40], [13, hillY(0, 26) + 4.4, 33], [0, hillY(0, 34) + 2.8, 33], [0, hillY(0, 25) + 3.2, 25], 26);
      r.pose(addPose(walk(t, 0.85), { rFwd: 55, lean: 10 })); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 35 "Grandpa's house."
  (S, cam) => {
    hill(S, { cottage: true });
    const r = mk(S, ROSA, 'rosa', 'neutral', [1.4, 0, 6], 190); const st = tie(S, r, [-2.4, 4.0, -7.0], { sag: 0.6 });
    return (t, dur) => {
      camPath(cam, t / dur, [5.5, 2.8, 22], [4.4, 3.6, 19], [0, 4.6, -6], [0, 5.0, -7], 26);
      r.pose(addPose({ rFwd: 45, lUp: 4, nod: -10 }, idle(t, 0.5))); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 36 "I hadn't visited since summer. Maybe longer."
  (S, cam) => {
    hill(S, { cottage: true });
    const r = mk(S, ROSA, 'rosa', 'sad', [1.4, 0, 6], 180); const st = tie(S, r, [-2.4, 4.0, -7.0], { sag: 0.6 });
    return (t, dur) => {
      faceCam(cam, t / dur, head(1.4, 6), 180, { side: -0.6, dist: 7, push: -0.6 });
      r.pose(addPose({ rFwd: 40, lUp: 4, nod: 14, tilt: Math.sin(t) * 4 }, idle(t, 0.4))); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
  // 37 "There was always soccer. Or homework."
  (S, cam) => {
    backyard(S); L('flash')(S);
    const r = mk(S, ROSA, 'rosa', 'grin', [-1, 0, 2], 30);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), std({ color: 0xf6f6f6, roughness: 0.5 })); S.add(ball);
    const pad = box(S, [1.4, 0.1, 1.8], [0, 0, 0], std({ color: 0xf2efe6 }), { r: 0, solid: false });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) { camPath(cam, p, [3, 3.4, 17], [2, 3.2, 16], [0, 2.6, 2], [1, 2.6, 1], 26);
        const kick = ease(clamp01(p * 2.2)); r.root.position.y = 0; r.root.rotation.y = 30 * D; r.pose({ rLeg: -30 + kick * 90, lFwd: 30, rFwd: -20, lUp: 20, rUp: 20 }); r.setFace('grin');
        const bt = clamp01(p * 2.2 - 0.8); ball.position.set(-0.2 + bt * 6, 0.5 + Math.sin(bt * Math.PI) * 2, 3.6 - bt * 8); pad.visible = false; }
      else { camPath(cam, p, [0.5, 4.8, 12], [0.3, 4.6, 11], [-1, 2.0, 2.5], [-1, 2.0, 2.5], 28);
        r.root.rotation.y = 0; r.root.position.y = -1.5; r.pose({ rLeg: 90, lLeg: 90, rFwd: 55, lFwd: 55, nod: 30 + Math.sin(t * 2) * 4, lean: 15 }); r.setFace('neutral');
        ball.position.set(4, 0.5, -1); pad.visible = true; pad.position.set(-1, 0.05, 4.1); }
    };
  },
  // 38 "The string went right through his front window."
  (S, cam) => {
    hill(S, { cottage: true });
    const r = mk(S, ROSA, 'rosa', 'neutral', [1.6, 0, -2.8], 200); const st = tie(S, r, [-2.4, 4.0, -7.2], { sag: 0.4 });
    return (t, dur) => {
      const p = clamp01(t / dur); r.root.position.set(1.0 - p * 1.2, 0, -2.0 - p * 1.2);
      camPath(cam, p, [-6.5, 4.8, 4], [-6.0, 4.6, 2.8], [-0.4, 3.8, -4.6], [-0.8, 3.9, -5.0], 24);
      r.pose(addPose(walk(t, 0.5, 20), { rFwd: 60 })); st.update({ fade: flick(t, 0.3), r: 0.03 });
    };
  },
];
