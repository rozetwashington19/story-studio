import * as THREE from 'three';
import { POSES, addPose, idle, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn, SIT,
  tickStreet, roofscape, ROOF, testLot, clockShop, clipboard, knitScarf, knitting } from '../../engine/kit.js';
import { dash, opal, vance, dashClock, opalClock, GIANT, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, rumble, arc, clamp01, riderSeat } from './common.js';

const HIPS = POSES.hips;
const place = (C, x, y, z, ry = 0) => { C.root.position.set(x, y, z); C.root.rotation.y = ry * D; };
// Dash sitting on top of the giant, gripping both bells
const RIDE = (t, k = 1) => ({ ...SIT, rUp: 70 + Math.sin(t * 7) * 6 * k, lUp: 70 + Math.sin(t * 7 + 1) * 6 * k, rFwd: 30, lFwd: 30, bob: Math.abs(Math.sin(t * 7)) * 0.1 * k, lean: -6 });
function ride(A, G, ry) { const p = riderSeat(G); A.root.position.set(p.x, p.y - 1.425, p.z); A.root.rotation.set(0, ry, 0); }
// dust puffs behind skidding feet
function dust(S, n = 14) { const m = new THREE.MeshStandardMaterial({ color: 0xd8c8b0, roughness: 1, transparent: true, opacity: 0.0, depthWrite: false }); const ps = [];
  for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), m.clone()); S.add(p); ps.push(p); }
  return (t, origin, k, spread = 6) => ps.forEach((p, i) => { const u = ((t * 0.9 + i / n) % 1); p.position.set(origin.x - u * spread - (i % 3), 0.5 + u * 3 + (i % 2), origin.z + Math.sin(i * 2.3) * 3); p.scale.setScalar(0.8 + u * 2.6); p.material.opacity = k * 0.55 * (1 - u); }); }
// petals/flowers bursting out of a stall
function burst(S, n = 30) { const ps = []; for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), new THREE.MeshStandardMaterial({ color: [0xe8302a, 0xf2c420, 0xf27ab8, 0xffffff, 0x8a3ab8][i % 5] })); S.add(p); p.visible = false; ps.push(p); }
  return (o, u) => ps.forEach((p, i) => { p.visible = u > 0 && u < 1; const a = i * 2.4, sp = 3 + (i % 5); p.position.set(o[0] + Math.cos(a) * sp * u, o[1] + (6 + (i % 4)) * u - 9 * u * u, o[2] + Math.sin(a) * sp * u * 0.7); }); }
function sparkle(S, n = 24, col = 0xfff0a0) { const ps = []; const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 }); for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), m); S.add(p); ps.push(p); }
  return (c, r, k, t) => { m.opacity = k; ps.forEach((p, i) => { const a = i / n * Math.PI * 2 + t * 2, rr = r * (0.6 + (i % 3) * 0.25); p.position.set(c.x + Math.cos(a) * rr, c.y + Math.sin(a * 1.7) * r * 0.6, c.z + Math.sin(a) * rr * 0.5); p.rotation.set(t * 3 + i, t * 2, 0); }); }; }

export const SHOTS_B = [
  // 24 "Down Tick Street. Through the flower market."  — cut 1: Dash sprints at the camera, the giant stomping behind; cut 2: through the market, the giant steps over a stall and flowers burst
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'scared', [0, 0, 2], -90); const G = dashClock(S, GIANT, 'giant'); const fl = burst(S, 30); allow(S, ['giant', 'house*'], ['giant', 'stall*'], ['giant', 'road']);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.45]);
      if (k === 0) { const x = -6 - t * 7.5; A.root.position.set(x, 0, 3); A.root.rotation.y = -70 * D; A.pose(addPose(RUN(t), { turn: 30 })); place(G, x + 17, 0, -1, -80); G.update(t, 'stomp'); G.face('grin', -0.6); G.look(headOf(A));
        camPath(cam, u, [x - 7, 2.0, 9], [x - 6, 2.2, 9], [x + 4, 7, -1], [x + 4, 8, -1], 22, 22); cam.position.x = x - 8; cam.lookAt(x + 5, 7.5, 0); shake(cam, t, 0.2, 0.8); }
      else { const x = -14 - u * 18; A.root.position.set(x, 0, -6.4); A.root.rotation.y = -90 * D; A.pose(addPose(RUN(t), { turn: -20 })); A.setFace('shock');
        const gx = 2 - u * 20; place(G, gx, Math.sin(Math.PI * u) * 3, -2, -90); G.update(t, 'stomp'); G.legs.R.rotation.x = -0.9 * Math.sin(Math.PI * u); G.face('grin', -0.4);
        fl([-25.5, 3.5, -10.5], clamp01((u - 0.3) / 0.6));
        camPath(cam, u, [-14, 5, 14], [-28, 5.5, 13], [-16, 5, -8], [-30, 7, -8], 22, 22); }
    };
  },
  // 25 "I hid in a phone booth. It knocked. Politely."  — cut 1: Dash dives into the booth and slams the door; cut 2: a huge white glove taps gently on the glass, the giant smiling politely
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'scared', [-38, 0, -4], -100); const G = dashClock(S, GIANT, 'giant'); allow(S, ['dash', 'booth*'], ['giant', 'booth*'], ['giant', 'house*'], ['giant', 'lamp*'], ['giant', 'road'], ['giant', 'stall*']);
    const bl = fill(S, [-46, 6, -6], 8, 0xfff0d8, 14);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.4]);
      if (k === 0) { const v = sm(u, 0, 0.75); A.root.position.set(-38 - v * 9, 0, -4 - v * 6.4); A.root.rotation.y = (-125 + v * 300) * D; A.pose(v < 0.95 ? RUN(t) : { rUp: 20, lUp: 20 }); env.booth.open(1 - sm(u, 0.75, 1));
        place(G, -22, 0, 2, -100); G.update(t, 'stomp'); G.face('grin', -0.4);
        camPath(cam, u, [-36, 4.2, 10], [-38, 4.0, 9], [-44, 3.8, -8], [-46, 4.0, -9], 24, 25); }
      else { A.root.position.set(-47, 0, -10.6); A.root.rotation.y = 0; A.pose(addPose(idle(t, 1.4), { rFwd: 40, lFwd: 40, nod: -14, turn: -40 })); A.setFace('nervous'); env.booth.open(0);
        place(G, -37, -5.2, -6, -60); G.update(t, 'knock', 1); G.face('smile', 0.6); G.look(headOf(A));
        camPath(cam, u, [-36, 5.5, 16], [-36.5, 5.8, 14.5], [-43, 7.5, -8], [-43, 7.8, -8], 22, 23); }
    };
  },
  // 26 "It was eight fifty-five. The test was across town."  — cut 1: the tower clock's iron hands click to 8:55; cut 2: Dash in the booth stares at his wristwatch
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'worried', [-47, 0, -10.6], 0); allow(S, ['dash', 'booth*']);
    const bl = fill(S, [-46, 6, -6], 8, 0xfff0d8, 14);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.45]);
      env.hands.set(8, 54 + sm(u, 0.4, 0.55) * (k === 0 ? 1 : 1));
      if (k === 0) camPath(cam, u, [6.2, 17.0, -2.0], [5.4, 18.4, -4.2], [4, 19.6, -14.4], [4, 19.6, -14.4], 30, 34);
      else { A.pose(addPose(idle(t, 1), hit([[0, { lFwd: 40 }], [0.3, { lFwd: 95, lUp: -35, nod: 22, turn: 10 }], [dur, { lFwd: 95, lUp: -35, nod: 24, turn: 12 }]], u * dur)));
        const h = headOf(A).toArray(); camPath(cam, u, [h[0] + 1.6, h[1] + 0.8, h[2] + 7.2], [h[0] + 1.3, h[1] + 0.7, h[2] + 6.2], [h[0], h[1] - 0.6, h[2]], [h[0], h[1] - 0.6, h[2]], 34, 36); }
    };
  },
  // 27 "I'd never make it on foot."  — Dash slides down the booth glass and slumps; outside, the giant waits, tapping its sneaker
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'sad', [-47, 0, -10.6], 15); const G = dashClock(S, GIANT, 'giant'); allow(S, ['dash', 'booth*'], ['giant', 'house*'], ['giant', 'lamp*']);
    const bl = fill(S, [-46, 6, -6], 8, 0xfff0d8, 14);
    return (t, dur) => { env.update(t);
      allow(S, ['dash', 'road']); const k = sm(t, 0.1, dur * 0.6); A.root.position.y = 0.3 - 1.72 * k; A.pose(addPose(idle(t, 0.5), { rLeg: 90 * k, lLeg: 90 * k, nod: 18 * k, rUp: -10, lUp: -10, lean: 8 * k, bob: 0 }));
      place(G, -33, 0, -1, -75); G.update(t, 'idle'); G.legs.R.rotation.x = -Math.abs(Math.sin(t * 6)) * 0.35; G.face('flat', 0.4); G.look(headOf(A)); G.time(8, 55);
      camPath(cam, t / dur, [-39, 3.6, 22], [-39.5, 3.4, 20.5], [-40, 9, -6], [-40, 9.5, -6], 20, 20);
    };
  },
  // 28 "Then it hit me. It wasn't chasing me."  — close-up: Dash's face goes from thinking to realisation; warm light rises
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'thinking', [-47, 0, -10.6], 10); allow(S, ['dash', 'booth*']); const key = fill(S, [-45.5, 5.8, -7.5], 2, 0xffe0b0, 8);
    return (t, dur) => { env.update(t);
      A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 120, rUp: -20, nod: 6, tilt: 8 }], [dur * 0.5, { rFwd: 120, rUp: -20, nod: 4, tilt: 8 }], [dur * 0.65, { nod: -8, tilt: 0 }], [dur, { nod: -10 }]], t)));
      if (t > dur * 0.55) A.setFace('awe'); key.intensity = 2 + sm(t, dur * 0.5, dur) * 8;
      const h = headOf(A).toArray(); faceCam(cam, t / dur, h, 10, { dist: 6.2, lens: 38, side: 0.5, push: 1.0, up: 0.1, look: -0.2 });
    };
  },
  // 29 "It was trying to get me there."  — the giant crouches, taps its own face (8:56), then points down the street, eyebrows worried
  (S, cam) => {
    const env = tickStreet(S);
    const G = dashClock(S, GIANT, 'giant');
    return (t, dur) => { env.update(t);
      place(G, -33, -2, -1, -40); G.update(t, 'idle'); G.time(8, 56); G.face(t > dur * 0.5 ? 'smile' : 'flat', 0.9);
      const pt = t > dur * 0.5; G.arms.R.rotation.set(pt ? -1.5 : -1.9, 0, pt ? 0.9 : -0.9); G.arms.L.rotation.z = 0.25;
      G.look(V([-47, 4, -10]));
      camPath(cam, t / dur, [-20, 4, 28], [-21, 4.4, 26], [-32, 12, -1], [-33, 13, -1], 22, 22);
    };
  },
  // 30 "So I stopped running away."  — the booth door swings open; Dash steps out, jaw set
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'determined', [-47, 0, -10.6], 20); allow(S, ['dash', 'booth*']);
    return (t, dur) => { env.update(t); env.booth.open(sm(t, 0, 0.35));
      const z = -10.6 + sm(t, 0.2, dur) * 3.2; A.root.position.set(-47 + sm(t, 0.2, dur) * 0.8, 0, z); A.pose(addPose(t > 0.2 && t < dur * 0.95 ? addPose(POSES.rest, { rLeg: Math.sin(t * 9) * 25, lLeg: -Math.sin(t * 9) * 25, rFwd: -Math.sin(t * 9) * 20, lFwd: Math.sin(t * 9) * 20 }) : {}, { nod: -6 }));
      camPath(cam, t / dur, [-45, 1.6, -1.0], [-45.4, 1.8, -1.8], [-46.6, 4.4, -9.5], [-46.6, 4.6, -8.5], 30, 32);
    };
  },
  // 31 "I ran straight at it!"  — low and behind Dash: he charges the giant; the giant's eyes go wide
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'determined', [-45, 0, -6.5], 70); const G = dashClock(S, GIANT, 'giant');
    return (t, dur) => { env.update(t);
      const x = -45 + t * 9; A.root.position.set(x, 0, -6.5 + t * 3); A.pose(RUN(t));
      place(G, -31, 0, -1, -70); G.update(t, 'idle'); G.face(t > dur * 0.3 ? 'o' : 'flat', 1); G.look(headOf(A)); G.body.rotation.x = -0.12 * sm(t, 0, dur);
      camPath(cam, t / dur, [x - 9, 2.4, -3.5], [x - 8, 2.6, -3.5], [x + 10, 11, -2], [x + 10, 12, -2], 20, 20); cam.position.x = x - 8.5;
    };
  },
  // 32 "I climbed up and grabbed its bells."  — cut 1: the giant offers its glove, Dash hops on; cut 2: Dash on top between the gold bells, gripping them, grinning
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'grin', [-37, 0, -3], 70); const G = dashClock(S, GIANT, 'giant'); allow(S, ['dash', 'giant']);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.45]);
      place(G, -31, 0, -1, -70); G.update(t, 'idle'); G.face('grin', 0); G.time(8, 56);
      if (k === 0) { G.arms.R.rotation.set(-0.6, 0, -0.2); const hnd = G.hand('R'); A.root.position.set(hnd.x, Math.max(0, hnd.y - 0.5) * sm(u, 0.3, 0.8), hnd.z + 1.6 - 1.6 * sm(u, 0.3, 0.8)); A.root.rotation.y = 70 * D;
        A.pose(hit([[0, { rUp: 30, lUp: 30 }], [0.25, { rUp: 160, lUp: 160, rLeg: 40 }], [dur * 0.45, { rUp: 150, lUp: 150 }]], u * dur * 0.45)); A.setFace('shock');
        camPath(cam, u, [-24, 4, 22], [-25, 4.6, 20], [-34, 8, -2], [-34, 10, -2], 22, 22); }
      else { ride(A, G, -70 * D); A.pose(RIDE(t)); A.setFace('laugh');
        const h = headOf(A).toArray(); faceCam(cam, u, [h[0], h[1] - 1.4, h[2]], -40, { dist: 13, lens: 28, side: 0, push: 1.4, up: 0.6, look: 0 }); }
    };
  },
  // 33 "Test lot! Go!"  — Dash points ahead and yells; the giant crouches, grins and launches
  (S, cam) => {
    const env = tickStreet(S);
    const A = dash(S, 'determined', [0, 0, 0], 0); const G = dashClock(S, GIANT, 'giant'); allow(S, ['dash', 'giant']);
    return (t, dur) => { env.update(t);
      const crouch = Math.sin(Math.PI * clamp01(t / (dur * 0.7))) * 1.6, jump = sm(t, dur * 0.7, dur) * 5;
      place(G, -31, -crouch + jump, -1, -70); G.update(t, 'idle'); G.face('grin', -0.5); G.time(8, 57);
      ride(A, G, -70 * D); A.pose(addPose(RIDE(t), { rUp: 70, rFwd: 95, lUp: 70, ...talk(t) })); A.setFace('determined');
      const h = headOf(A).toArray(); faceCam(cam, t / dur, [h[0], h[1] - 2.0, h[2]], -40, { dist: 13, lens: 26, side: 0.5, push: 1.0, up: -1.0, look: 0 });
    };
  },
  // 34 "It sprinted across the rooftops."  — tracking alongside: the giant bounds from roof to roof with Dash on top, the town far below
  (S, cam) => {
    const env = roofscape(S);
    const A = dash(S, 'laugh', [0, 0, 0], 0); const G = dashClock(S, GIANT, 'giant'); allow(S, ['dash', 'giant'], ['giant', 'roof']);
    return (t, dur) => {
      const x = -40 + t * 26; const leap = Math.max(0, Math.sin(t * 5.2)) * 2.6; env.follow(x); env.update(t, x);
      place(G, x, ROOF.y + leap - 0.15, 0, 90); G.update(t, 'run'); G.face('grin', -0.3); G.spin(t * 0.6); G.time(8, 57);
      ride(A, G, 90 * D); A.pose(addPose(RIDE(t), { rUp: 150, rFwd: 0, nod: -6 }));
      camPath(cam, t / dur, [x - 6, 30, 52], [x + 4, 29, 49], [x + 2, 28, 0], [x + 4, 28, 0], 22, 22); cam.position.x = x - 4 + (t / dur) * 6; cam.lookAt(x + 2, 27, 0);
    };
  },
  // 35 "Every step, its hands spun faster."  — front close on the giant's face: the hands whirl, Dash whoops on top, roofs whip past
  (S, cam) => {
    const env = roofscape(S);
    const A = dash(S, 'laugh', [0, 0, 0], 0); const G = dashClock(S, GIANT, 'giant'); allow(S, ['dash', 'giant'], ['giant', 'roof']);
    return (t, dur) => {
      const x = 20 + t * 26; env.follow(x); env.update(t, x); const leap = Math.max(0, Math.sin(t * 5.2)) * 2.0;
      place(G, x, ROOF.y + leap - 0.15, 0, 60); G.update(t, 'run'); G.face('grin', -0.3); G.time(8, 57); G.spin(t * t * 0.9);
      ride(A, G, 60 * D); A.pose(addPose(RIDE(t), { rUp: 160, rFwd: 0, lUp: 75, nod: -10, ...talk(t, 0.8) }));
      const c = G.body.getWorldPosition(new THREE.Vector3());
      camPath(cam, t / dur, [c.x + 30, c.y + 1, c.z + 22], [c.x + 26, c.y + 2, c.z + 19], [c.x, c.y + 3, c.z], [c.x, c.y + 3.5, c.z], 24, 26);
    };
  },
  // 36 "We slid into the test lot at eight fifty-nine."  — the giant skids in sideways on its sneakers, dust everywhere; the test-centre clock reads 8:59
  (S, cam) => {
    const env = testLot(S);
    const A = dash(S, 'laugh', [0, 0, 0], 0); const G = dashClock(S, GIANT, 'giant'); allow(S, ['dash', 'giant']); const du = dust(S, 16);
    return (t, dur) => { env.update(t);
      const u = sm(t, 0, dur * 0.7); const x = -80 + u * 72; const turn = 90 - sm(t, dur * 0.55, dur) * 70;
      place(G, x, 0, -9, turn); G.update(t, u < 0.95 ? 'run' : 'idle', 1 - u); G.body.rotation.x = -0.25 * Math.sin(Math.PI * u); G.face(u < 0.95 ? 'grin' : 'smile', 0); G.time(8, 59);
      ride(A, G, turn * D); A.pose(addPose(RIDE(t), { rUp: 120, lUp: 120 })); env.wallClock.set(8, 59);
      du(t, G.root.position, 1 - sm(t, dur * 0.7, dur), 8);
      camPath(cam, t / dur, [8, 3.0, 30], [9, 3.4, 28], [-12, 10, -10], [-8, 12, -9], 20, 20); if (u > 0.9) shake(cam, t, dur * 0.66, 0.6);
    };
  },
  // 37 "The examiner looked at her watch."  — Ms. Vance, clipboard tucked under her arm, glances at her wristwatch
  (S, cam) => {
    const env = testLot(S);
    const P = vance(S, 'neutral', [6, 0, 4], -35); const cb = clipboard(S);
    return (t, dur) => { env.update(t);
      P.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 35, rUp: -20 }], [dur * 0.35, { rFwd: 35, rUp: -20, lFwd: 95, lUp: -40, nod: 22, turn: 8 }], [dur, { rFwd: 35, rUp: -20, lFwd: 95, lUp: -40, nod: 24, turn: 10 }]], t)));
      hold(cb, P, 'R', [0.1, 0.1, 0.25]); cb.rotation.set(-0.3, -35 * D, 0);
      if (t > dur * 0.6) P.setFace('bored');
      const h = headOf(P).toArray(); faceCam(cam, t / dur, [h[0], h[1] - 0.6, h[2]], -35, { dist: 8.0, lens: 30, side: -0.6, push: 0.8, up: 0.2 });
    };
  },
  // 38 "Then up. And up. At my clock."  — the camera tilts from Vance's face up, and up, to the giant grinning down; her jaw drops
  (S, cam) => {
    const env = testLot(S);
    const P = vance(S, 'neutral', [6, 0, 4], 12); const G = dashClock(S, GIANT, 'giant'); const A = dash(S, 'grin', [0, 0, 0], 0); allow(S, ['dash', 'giant']); const cb = clipboard(S);
    return (t, dur) => { env.update(t);
      place(G, -8, 0, -9, 20); G.update(t, 'idle'); G.face('grin', 0); G.time(8, 59); G.look(headOf(P)); ride(A, G, 20 * D); A.pose(addPose(RIDE(t, 0.3), { rUp: 150, lUp: 70 }));
      P.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 35, rUp: -20, nod: 0 }], [dur * 0.35, { rFwd: 35, rUp: -20, nod: -25 }], [dur * 0.7, { rFwd: 35, rUp: -20, nod: -40, lean: -8 }]], t)));
      hold(cb, P, 'R', [0.1, 0.1, 0.25]); cb.rotation.set(-0.3, -35 * D, 0); if (t > dur * 0.6) P.setFace('shock');
      const k = sm(t, 0.1, dur * 0.85); camPath(cam, k, [10, 3.6, 16], [11, 2.6, 18], [6, 4.6, 4], [-6, 20, -9], 26, 22);
    };
  },
  // 39 '"On time," she said. "Barely."'  — Vance, unimpressed, ticks her clipboard and lowers her sunglasses
  (S, cam) => {
    const env = testLot(S);
    const P = vance(S, 'bored', [6, 0, 4], -35); const cb = clipboard(S);
    return (t, dur) => { env.update(t);
      P.pose(addPose(addPose(idle(t, 0.5), talk(t, 0.9)), hit([[0, { rFwd: 70, rUp: -20, lFwd: 70, lUp: -10, nod: 8 }], [dur * 0.5, { rFwd: 75, rUp: -20, lFwd: 80, lUp: -15, nod: 10, tilt: -8 }], [dur, { rFwd: 75, rUp: -20, lFwd: 82, lUp: -15, nod: 6, tilt: -10 }]], t)));
      hold(cb, P, 'R', [0.2, 0.15, 0.3]); cb.rotation.set(-0.7, -35 * D, 0.2); if (t > dur * 0.55) P.setFace('smirk');
      const h = headOf(P).toArray(); faceCam(cam, t / dur, h, -35, { dist: 6.6, lens: 36, side: 0.6, push: 0.7, up: 0.1, look: -0.4 });
    };
  },
  // 40 "The clock gave one happy ding,"  — the giant beams; one small ring of its bells; Dash laughs on top
  (S, cam) => {
    const env = testLot(S);
    const G = dashClock(S, GIANT, 'giant'); const A = dash(S, 'laugh', [0, 0, 0], 0); allow(S, ['dash', 'giant']);
    return (t, dur) => { env.update(t);
      const r = Math.sin(Math.PI * clamp01((t - dur * 0.3) / (dur * 0.35))); G.ringK = r * 0.5;
      place(G, -8, 0, -9, 20); G.update(t, r > 0.05 ? 'ring' : 'idle', r * 0.4); G.face(r > 0.1 ? 'grin' : 'smile', 0.4); G.time(9, 0);
      ride(A, G, 20 * D); A.pose(addPose(RIDE(t, 0.4), { rUp: 140, lUp: 140 }));
      const c = G.body.getWorldPosition(new THREE.Vector3()); camPath(cam, t / dur, [c.x + 12, c.y - 2, c.z + 40], [c.x + 11, c.y - 1.5, c.z + 36], [c.x, c.y + 4, c.z], [c.x, c.y + 4.5, c.z], 24, 25);
    };
  },
  // 41 "and shrank back to normal."  — sparkles: the giant shrinks to pocket size; Dash lands on his feet and catches it
  (S, cam) => {
    const env = testLot(S);
    const G = dashClock(S, GIANT, 'giant'); const A = dash(S, 'awe', [0, 0, 0], 0); allow(S, ['dash', 'giant']); const sp = sparkle(S, 26);
    return (t, dur) => { env.update(t);
      const k = sm(t, dur * 0.05, dur * 0.6); const s = GIANT + (0.32 - GIANT) * k; G.s = s;
      place(G, -8, 0, -9, 20); G.update(t, 'idle'); G.g.scale.setScalar(s); G.face('smile', 0); G.time(9, 0);
      const seat = riderSeat(G); const ground = seat.y - 1.425 <= 0.05;
      if (!ground) { ride(A, G, 20 * D); A.pose(RIDE(t, 0.3)); }
      else { A.root.position.set(-8 + 0.2, 0, -9 + 1.6); A.root.rotation.set(0, 20 * D, 0); A.pose(hit([[0, { rFwd: 40, lFwd: 40 }], [0.25, { rFwd: 70, lFwd: 70, rUp: -25, lUp: -25, nod: 22 }]], t - dur * 0.62)); A.setFace('laugh');
        const a = pinky(A, 'R'), b = pinky(A, 'L'); const up = 1 - sm(t, dur * 0.62, dur * 0.85); G.root.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 - 0.3 + up * 1.4, (a.z + b.z) / 2 + 0.25); G.root.rotation.y = 20 * D; }
      sp(new THREE.Vector3(-8, Math.max(2.5, seat.y * 0.6), -9), Math.max(3, s * 2.2), Math.sin(Math.PI * clamp01(t / (dur * 0.7))), t);
      const look = [-8, 2.8 + (1 - k) * 14, -8]; camPath(cam, sm(t, 0, dur * 0.7), [2, 6 + 8, 22], [-2, 4.4, 4.5], look, [-7.6, 3.6, -7.6], 24, 28);
    };
  },
  // 42 "Then I took the test. I hit every cone."  — cut 1: high wide, the blue test car weaves and bowls over every cone; cut 2: inside, Dash grinning at the wheel, Vance clutching the dash
  (S, cam) => {
    const env = testLot(S);
    const car = env.car; const A = dash(S, 'grin', [0, 0, 0], 90); const P = vance(S, 'scared', [0, 0, 0], 90); allow(S, ['dash', 'car*'], ['vance', 'car*'], ['dash', 'vance'], ['dash', 'cone*'], ['vance', 'cone*']);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.5]);
      const cx = -18 + (t / dur) * 36, cz = 2 + Math.sin(cx * 0.55) * 1.2, head = Math.atan2(Math.cos(cx * 0.55) * 1.2 * 0.55, 1);
      car.position.set(cx, 0, cz); car.rotation.y = -head; car.drive(cx);
      env.cones.slice(0, 10).forEach((c, i) => c.knock(clamp01((cx + 4.5 - (-12 + i * 3)) / 0.8), i * 37 + 70));
      const sd = car.seat(-1), sp = car.seat(1); A.root.position.set(sd.x, sd.y - 1.425, sd.z); P.root.position.set(sp.x, sp.y - 1.5, sp.z);
      A.root.rotation.y = Math.PI / 2 - head; P.root.rotation.y = Math.PI / 2 - head;
      A.pose(addPose(SIT, { rFwd: 75, lFwd: 75, rUp: -12, lUp: -12, nod: -4, tilt: Math.sin(t * 6) * 6 })); P.pose(addPose(SIT, { rFwd: 80, lFwd: 80, rUp: 10, lUp: 10, lean: -8, turn: -25 + Math.sin(t * 9) * 8 }));
      if (k === 0) camPath(cam, u, [0, 26, 34], [2, 24, 32], [cx - 2, 0, 2], [cx, 0, 2], 24, 24);
      else { const c = car.localToWorld(new THREE.Vector3(10.5, 4.8, 0)), l = car.localToWorld(new THREE.Vector3(-0.6, 4.0, 0)); camPath(cam, u, c.toArray(), c.toArray(), l.toArray(), l.toArray(), 22, 22); rumble(cam, t, 0.5); }
    };
  },
  // 43 '"You failed," she said. "But nice ride."'  — outside the car among the toppled cones: Vance hands back the clipboard with a smirk, Dash laughs, the little red clock in his arm
  (S, cam) => {
    const env = testLot(S);
    const A = dash(S, 'laugh', [5.2, 0, 10.5], 55); const P = vance(S, 'neutral', [11.4, 0, 10.5], -60); const K = dashClock(S, 0.3); const cb = clipboard(S);
    env.car.position.set(18, 0, 3); env.car.rotation.y = -0.5; env.cones.slice(0, 10).forEach((c, i) => c.knock(1, i * 37 + 70));
    return (t, dur) => { env.update(t);
      P.pose(addPose(addPose(idle(t, 0.6), talk(t, 0.8)), hit([[0, { rFwd: 40, rUp: -15 }], [dur * 0.5, { rFwd: 80, rUp: -10, nod: 4 }], [dur, { rFwd: 84, rUp: -10, nod: 6, tilt: 6 }]], t)));
      hold(cb, P, 'R', [0, 0.1, 0.2]); cb.rotation.set(0, -60 * D, 0); if (t > dur * 0.5) P.setFace('smirk');
      A.pose(addPose(idle(t, 1), { lFwd: 70, lUp: -30, rUp: 20 + Math.abs(Math.sin(t * 7)) * 10, nod: -8 + Math.sin(t * 8) * 4 }));
      const a = pinky(A, 'L'); place(K, a.x - 0.1, a.y - 0.6, a.z + 0.4, 55); K.update(t, 'idle'); K.face('grin'); K.time(9, 4); allow(S, ['dash', 'clock']);
      camPath(cam, t / dur, [8.4, 4.4, 25], [8.3, 4.5, 23], [8.3, 3.6, 10.5], [8.3, 3.7, 10.5], 26, 27);
    };
  },
  // 44 "That night, Grandma's clock knitted me a scarf."  — the shop at night, lamps glowing: the lavender clock waddles over and holds up a folded scarf to Dash; Opal smiles from her chair
  (S, cam) => {
    const env = clockShop(S, { time: 'night' });
    const O = opal(S, 'softsmile', [-7.35, 0, -2.2], 35); O.root.position.y = 0.24; const A = dash(S, 'smile', [1.8, 0, 0.6], -55);
    const K = opalClock(S, 0.42); const sc = knitScarf(S, 'GET UP, DASH', { len: 6.4 }); sc.scale.setScalar(0.32);
    const glowL = fill(S, [-2.5, 4.5, 3.5], 6, 0xffc890, 12);
    return (t, dur) => { env.update(t);
      O.pose(addPose(SIT, addPose(idle(t, 0.4), { rFwd: 50, lFwd: 50, rUp: -25, lUp: -25, nod: 6 })));
      const w = sm(t, 0, dur * 0.6); place(K, -4.4 + w * 3.2, 0, 0.8 + w * 0.8, 70); K.update(t, w < 0.98 ? 'run' : 'idle', 0.5); K.face('smile', 0.3); K.look(headOf(A));
      if (w >= 0.98) { K.arms.R.rotation.set(-2.0, 0, 0); K.arms.L.rotation.set(-2.0, 0, 0); }
      const a = K.hand('R'), b = K.hand('L'); sc.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.25, (a.z + b.z) / 2 + 0.2); sc.rotation.set(0, 70 * D, 0);
      A.pose(addPose(idle(t, 0.8), hit([[0, { nod: 0 }], [dur * 0.55, { nod: 24, lean: 8, rFwd: 40, lFwd: 40 }]], t)));
      camPath(cam, t / dur, [-2.6, 4.2, 11.5], [-2.6, 4.0, 10.3], [-0.6, 2.9, 0.8], [-0.6, 2.9, 0.8], 21, 22);
    };
  },
  // 45 "It says: get up, Dash."  — Dash holds the scarf up: GET UP, DASH. He bursts out laughing; the little red clock on his shoulder grins
  (S, cam) => {
    const env = clockShop(S, { time: 'night' });
    const A = dash(S, 'smile', [-0.5, 0, 1.6], 0); const sc = knitScarf(S, 'GET UP, DASH', { len: 6.4 }); const K = dashClock(S, 0.22); allow(S, ['dash', 'clock']);
    const key = fill(S, [-0.5, 5.4, 6.5], 7, 0xffd8a8, 12);
    return (t, dur) => { env.update(t);
      A.pose(addPose(idle(t, 0.8), hit([[0, { rFwd: 60, lFwd: 60, rUp: 10, lUp: 10 }], [dur * 0.3, { rFwd: 88, lFwd: 88, rUp: 28, lUp: 28, nod: 6 }], [dur * 0.6, { rFwd: 88, lFwd: 88, rUp: 30, lUp: 30, nod: -8, tilt: 6 }], [dur, { rFwd: 86, lFwd: 86, rUp: 30, lUp: 30, nod: -10, tilt: 8 }]], t)));
      if (t > dur * 0.45) A.setFace('laugh');
      const a = pinky(A, 'R'), b = pinky(A, 'L'); sc.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.1, (a.z + b.z) / 2 + 0.15); sc.scale.setScalar(0.7); sc.rotation.set(0, 0, 0);
      A.root.updateMatrixWorld(true); const sh = A.body.localToWorld(new THREE.Vector3(1.3, 2.05, 0)); place(K, sh.x, sh.y, sh.z, 0); K.update(t, t > dur * 0.5 ? 'cheer' : 'idle', 0.3); K.face('grin');
      camPath(cam, t / dur, [-0.3, 4.4, 10.5], [-0.4, 4.3, 8.6], [-0.4, 3.6, 1.6], [-0.4, 3.7, 1.6], 28, 30);
    };
  },
];
