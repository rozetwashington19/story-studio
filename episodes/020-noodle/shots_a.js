import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn,
  pennyMesa, wellShaft, wishCoin, goldBurst, duckParade, endlessBread, pickup, bigPup } from '../../engine/kit.js';
import { tess, pell, baker, mayor, kid, towny, noodle, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, shake, rumble, clamp01, ride } from './common.js';

const HIPS = POSES.hips;
const SITP = { rLeg: 90, lLeg: 90 };
const STRADDLE = { rLeg: 62, lLeg: 62, rLegOut: 30, lLegOut: 30 };
// the endless baguette: out of the bakery's oven hatch, round the plaza and off into the desert
export const BREAD = [[-20, 3.2, -15.6], [-20, 2.0, -13.2], [-18, 0.75, -10.2], [-12, 0.75, -11.6], [-5, 0.75, -10.4], [3, 0.75, -8.6], [10.5, 0.75, -4.5], [14, 0.75, 0.5],
  [17.5, 0.75, 6], [14.5, 0.75, 11.4], [4, 0.75, 13.2], [-8, 0.75, 14.4], [-22, 0.75, 16.4], [-38, 0.75, 22], [-62, 0.75, 28], [-100, 0.75, 22], [-140, 0.75, -10], [-170, 0.75, -60]];
// coin arc helper (parabola from a to b with height h)
export const arc = (a, b, h, u) => { u = clamp01(u); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + Math.sin(Math.PI * u) * h, a[2] + (b[2] - a[2]) * u]; };
export function scrollBread(B, t) { B.mesh.material.map.offset.x = -t * 0.06; }
// Mrs. Pell's duck route through the plaza (lines 5 and 39)
export const DUCKPATH = [[-60, 15], [-40, 11.5], [-26, 8.6], [-14, 9.5], [-5, 6.5], [4, 5.5], [12, 3], [20, -1], [30, -4]];

export const SHOTS_A = [
  // 2 "Every coin in our well buys one wish."  — day: a neighbour flicks a coin; the camera cranes over the well and follows it down into the water (gold ring)
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const T = towny(S, 1, 'smile', [4.2, 0, -1.6], -60); const c = wishCoin(S, { s: 1.2 }); const sp = goldBurst(S, 30);
    return (t, dur) => { env.update(t); scrollBread(B, t);
      const th = dur * 0.22; const fl = ramp(t, th, dur * 0.62);
      T.pose(addPose(idle(t, 1), hit([[0, { rFwd: 40, rUp: 10 }], [th - 0.2, { rFwd: 10, rUp: 5, lean: -3 }], [th, { rFwd: 120, rUp: 20, lean: 8 }], [th + 0.5, { rFwd: 60, rUp: 8, lean: 4 }]], t)));
      if (t > dur * 0.5) T.setFace('delighted');
      const hp = pinky(T, 'R'); const p = t < th ? [hp.x, hp.y, hp.z] : arc([hp.x, hp.y, hp.z], [-0.2, 0.6, 0.2], 2.4, fl);
      if (t < th) c.position.set(hp.x, hp.y - 0.1, hp.z); else c.position.set(...p); c.rotation.x = t * 14; c.visible = fl < 0.99; c.userData.glint(0.6 + 0.4 * Math.sin(t * 12));
      const land = sm(t, dur * 0.6, dur * 0.75) * (1 - sm(t, dur * 0.8, dur)); env.well.glow(land * 0.35); sp.update(t, [0, 1.0, 0], land, { up: 4, spread: 1.6, size: 0.35 });
      camPath(cam, sm(t, 0, dur), [-1.0, 4.4, 8.6], [0.4, 9.6, 3.0], [3.6, 4.2, -1.2], [0, 0.6, 0], 28, 30);
    };
  },
  // 3 "One wish each. Granted word for word."  — inside the well, looking up: the coin drops past the camera, hits the water, a gold ring + motes rise
  (S, cam) => {
    const env = wellShaft(S, { time: 'day' }); const c = wishCoin(S, { s: 1.4 }); const sp = goldBurst(S, 40);
    return (t, dur) => { env.update(t); const u = ramp(t, 0, dur * 0.35); c.position.set(0.3 * (1 - u), 2 - u * 16, 0.2); c.rotation.set(t * 9, 0, t * 4); c.visible = u < 1; c.userData.glint(0.8);
      if (u >= 1 && !env._r) { env.ripple(t); env._r = 1; } const g = sm(t, dur * 0.35, dur * 0.5) * (1 - 0.4 * sm(t, dur * 0.7, dur)); env.glow(g);
      sp.update(t, [0, -13.5, 0], g, { up: 12, spread: 1.6, size: 0.4, speed: 0.35 });
      camPath(cam, sm(t, 0, dur), [0.7, -11.2, 0.6], [0.5, -10.4, 0.5], [0, 4, 0], [-0.3, 6, 0.4], 18, 20);
    };
  },
  // 4 "Mrs. Pell wished for a million followers."  — Mrs. Pell struts through the plaza taking a selfie, beaming (the ducks are just out of frame)
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const P = pell(S, 'delighted', [-10, 0, 9], 100); const ph = new THREE.Group(); S.add(ph);
    ph.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0xff4a9a, roughness: 0.3 })));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.78), new THREE.MeshBasicMaterial({ color: 0x9ad8ff })); scr.position.z = -0.045; scr.rotation.y = Math.PI; ph.add(scr);
    return (t, dur) => { env.update(t); scrollBread(B, t); const x = -10 + t * 2.2; P.root.position.x = x;
      const w = walk(t, 0.8, 24); P.pose(addPose(w, { rFwd: 105 - w.rFwd, rUp: 25, turn: -25 + Math.sin(t * 2) * 4, tilt: 8, nod: -6 }));
      if (t > dur * 0.55) P.setFace('starstruck'); hold(ph, P, 'R', [0.15, 0.25, 0.25]); ph.lookAt(headOf(P));
      const q = sm(t, 0, dur); camPath(cam, q, [x + 3.6, 4.7, 16.0], [x + 3.0, 4.5, 15.0], [x + 0.4, 4.1, 9], [x + 0.2, 4.0, 9], 30, 32);
    };
  },
  // 5 "Now a million ducks follow her everywhere."  — crane up: a river of white ducks waddles behind her all the way across the plaza; she glances back, deadpan
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const D1 = duckParade(S, 110, DUCKPATH, { spacing: 0.8, jitter: 1.1, s: 1.35 }); const P = pell(S, 'bored', [0, 0, 0], 100);
    return (t, dur) => { env.update(t); scrollBread(B, t); const lead = 52 + t * 2.4; D1.update(t, lead);
      const u = clamp01((lead + 2.4) / D1.length); const p = D1.curve.getPointAt(u), tg = D1.curve.getTangentAt(u);
      P.root.position.set(p.x, 0, p.z); P.root.rotation.y = Math.atan2(tg.x, tg.z);
      const look = sm(t, dur * 0.3, dur * 0.5) * (1 - sm(t, dur * 0.8, dur));
      P.pose(addPose(walk(t, 0.8, 26), { turn: -70 * look, rFwd: 20, lFwd: 20, tilt: -6 * look })); P.setFace(look > 0.5 ? 'bored' : 'smirk');
      camPath(cam, sm(t, 0, dur), [p.x + 4.5, 3.2, p.z + 8.5], [p.x + 8, 7.5, p.z + 13], [p.x - 2, 2.2, p.z - 1], [p.x - 9, 0.8, p.z - 2], 26, 24);
    };
  },
  // 6 "The baker wished for bread that never runs out."  — the baker proudly pats a baguette sliding out of his oven hatch
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const K = baker(S, 'proud', [-24.2, 0, -10.6], -15);
    return (t, dur) => { env.update(t); scrollBread(B, t);
      K.pose(addPose(idle(t, 1), hit([[0, { ...HIPS }], [dur * 0.3, { ...HIPS }], [dur * 0.45, { lFwd: 70, lUp: -10, rUp: 28, rFwd: -8, turn: 30, nod: 12 }], [dur * 0.6, { lFwd: 60, lUp: -8, rUp: 28, rFwd: -8, turn: 25, nod: 8 }], [dur * 0.8, { lFwd: 70, lUp: -10, rUp: 28, rFwd: -8, turn: -5, nod: -4 }]], t)));
      if (t > dur * 0.7) K.setFace('grin');
      camPath(cam, sm(t, 0, dur), [-27.6, 5.0, 1.2], [-26.6, 4.8, -0.4], [-22.6, 4.2, -11.4], [-22.8, 4.0, -11.6], 26, 28);
    };
  },
  // 7 "It's been coming out of his oven for nine years."  — crane up and back: the baguette snakes across the whole plaza and out into the desert; kids sit on it like a bench
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const K = baker(S, 'nervous', [-24.2, 0, -10.6], 25);
    const k1 = kid(S, 0, 'laugh', [1.0, 0, 13.6], 5), k2 = kid(S, 1, 'smile', [5.4, 0, 13.0], -5); sitOn(k1, 1.5 * 0.92 / 0.92); sitOn(k2, 1.5);
    k1.root.position.y = 1.5 - 1.5 * 0.92; k2.root.position.y = 1.5 - 1.5 * 0.92;
    return (t, dur) => { env.update(t); scrollBread(B, t);
      K.pose(addPose(idle(t, 1), POSES.shrug || { rUp: 40, lUp: 40 })); k1.pose(addPose(SITP, { ...idle(t, 1, 1), rFwd: 60 + Math.sin(t * 3) * 10 })); k2.pose(addPose(SITP, { ...idle(t, 1, 2), lFwd: 40, nod: 10 }));
      camPath(cam, sm(t, 0, dur), [-6, 9, 30], [12, 34, 50], [-8, 2, 2], [-30, 0, -10], 24, 20);
    };
  },
  // 8 "I'm Tess. I'm fifteen."  — close-up: Tess in the plaza, pulls her headphones down, a small shy smile
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const A = tess(S, 'neutral', [-6, 0, 7], 15); const W = towny(S, 0, 'smile', [-16, 0, -2], 90);
    return (t, dur) => { env.update(t); scrollBread(B, t);
      A.pose(addPose(idle(t, 1), hit([[0, { rFwd: 150, lFwd: 150, rUp: 20, lUp: 20, nod: -4 }], [dur * 0.35, { rFwd: 150, lFwd: 150, rUp: 20, lUp: 20, nod: -4 }], [dur * 0.6, { rFwd: 20, lFwd: 20, rUp: 6, lUp: 6, tilt: 8, nod: 4 }]], t)));
      A.setFace(t > dur * 0.5 ? 'smile' : 'neutral'); W.root.position.x = -16 + t * 2.5; W.pose(walk(t, 0.9, 30));
      const h = headOf(A); faceCam(cam, sm(t, 0, dur), [h.x, h.y, h.z], 15, { dist: 6.6, lens: 36, push: 1.0, side: 0.6 });
    };
  },
  // 9 "New town. I eat lunch alone."  — Tess alone on a bench with a sandwich; behind her a group of classmates laughs together
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const A = tess(S, 'sad', [-12, 0, 6.6], 0); sitOn(A, 1.5); A.root.position.y = 1.5 - 1.5 * 0.95;
    const sw = new THREE.Group(); S.add(sw); sw.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.6), new THREE.MeshStandardMaterial({ color: 0xf2d090 })));
    const ks = [kid(S, 0, 'laugh', [4.6, 0, -2.2], -70), kid(S, 1, 'laugh', [6.8, 0, -5.2], -30), kid(S, 2, 'grin', [0.6, 0, -6.8], 40)];
    return (t, dur) => { env.update(t); scrollBread(B, t);
      A.pose(addPose(SITP, { ...idle(t, 0.6), rFwd: 70 + Math.sin(t * 1.5) * 6, rUp: -12, nod: 14 + sm(t, dur * 0.4, dur * 0.7) * 6, turn: -20 * sm(t, dur * 0.2, dur * 0.4) * (1 - sm(t, dur * 0.65, dur * 0.85)) }));
      hold(sw, A, 'R', [0.1, 0.15, 0.25]);
      ks.forEach((k, i) => k.pose(addPose(idle(t, 1, i), { rUp: 30 + Math.abs(Math.sin(t * 6 + i)) * 20, lUp: 10, bob: Math.abs(Math.sin(t * 8 + i)) * 0.06, nod: -8 })));
      camPath(cam, sm(t, 0, dur), [-17.8, 4.4, 17.5], [-16.4, 4.0, 15.0], [-10.6, 3.2, 5.6], [-11.0, 3.1, 6.0], 26, 28);
    };
  },
  // 10 "So I saved my coin for one big wish."  — close-up: Tess flips the coin, it spins up past her face, she snatches it — determined
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const A = tess(S, 'thinking', [-4, 0, 9], 10); const c = wishCoin(S, { s: 2.0 });
    return (t, dur) => { env.update(t); scrollBread(B, t);
      const t0 = dur * 0.15, t1 = dur * 0.62; const up = ramp(t, t0, t1);
      A.pose(addPose(idle(t, 1), hit([[0, { rFwd: 55, rUp: -15 }], [t0 - 0.1, { rFwd: 45, rUp: -15, nod: 4 }], [t0 + 0.05, { rFwd: 70, rUp: -15, nod: -10 }], [t1 - 0.05, { rFwd: 95, rUp: -10, nod: -6 }], [t1 + 0.2, { rFwd: 75, rUp: -25, nod: 4 }]], t)));
      const hp = pinky(A, 'R'); const h = headOf(A);
      if (t < t0 || t > t1) { c.position.set(hp.x, hp.y + 0.05, hp.z + 0.1); c.rotation.set(Math.PI / 2, 0, 0); }
      else { c.position.set(hp.x, hp.y + Math.sin(Math.PI * up) * 2.6, hp.z + 0.1); c.rotation.set(t * 22, 0, 0); }
      c.userData.glint(t > t0 && t < t1 ? 1 : 0.4); A.setFace(t > t1 ? 'determined' : 'thinking');
      faceCam(cam, sm(t, 0, dur), [h.x, h.y - 0.4, h.z], 10, { dist: 6.0, lens: 36, push: 0.8, side: -0.6, look: -0.2 });
    };
  },
  // 11 "I wish for the biggest dog in the world!"  — at the well: wind-up, Tess shouts the wish and fires the coin in
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const A = tess(S, 'determined', [1.0, 0, -3.5], -8); const c = wishCoin(S, { s: 1.6 }); const sp = goldBurst(S, 24);
    return (t, dur) => { env.update(t); scrollBread(B, t); const th = dur * 0.55;
      A.pose(addPose(addPose(idle(t, 1), talk(t, t < th ? 1 : 0.2)), addPose(anticipate(t, th, 1.5), hit([[0, { rFwd: 40, lFwd: 30, rUp: 10 }], [th - 0.3, { rFwd: -30, rUp: 30, lean: -6 }], [th, { rFwd: 125, rUp: 10, lean: 12, nod: 10 }], [th + 0.4, { rFwd: 80, rUp: 5, lean: 8, nod: 12 }]], t))));
      A.setFace(t < th ? 'grin' : 'delighted');
      const hp = pinky(A, 'R'); const u = ramp(t, th, th + 0.5);
      if (t < th) c.position.set(hp.x, hp.y, hp.z); else c.position.set(...arc([hp.x, hp.y, hp.z], [0, 0.6, 0], 1.6, u)); c.rotation.x = t * 16; c.visible = u < 1; c.userData.glint(0.8);
      const g = sm(t, th + 0.45, th + 0.8); env.well.glow(g * 0.5); sp.update(t, [0, 1.2, 0], g, { up: 4, spread: 1.6, size: 0.35 });
      camPath(cam, sm(t, 0, dur), [1.25, 4.6, 8.4], [1.1, 4.4, 6.8], [1.0, 4.0, -3.4], [1.0, 4.0, -3.4], 32, 36);
    };
  },
  // 12 "The well burped. Then something barked."  — (a) in the shaft: the water bulges and burps a gold bubble; (b) plaza: a tiny gold puppy pops onto the rim and yaps; Tess falls back delighted
  (S, cam) => {
    const W = new THREE.Group(); W.position.set(400, 0, 0); S.add(W); const sh = wellShaft(W, { time: 'day' });
    const bub = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffd86a, emissive: 0xffb020, emissiveIntensity: 0.35, transparent: true, opacity: 0.7, roughness: 0.1 })); W.add(bub);
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const A = tess(S, 'shock', [1.0, 0, -3.5], -8); const N = noodle(S, 0.3, [0.4, 1.7, 1.9], 25); const sp = goldBurst(S, 30); allow(S, ['noodle', 'well*']);
    return (t, dur) => { env.update(t); sh.update(t); scrollBread(B, t); const [k, lt] = seg(t, dur, [0.42]);
      if (k === 0) { const u = lt; bub.position.set(0, -14 + u * 1.2, 0); bub.scale.setScalar(0.3 + u * 0.9); sh.glow(0.04 + u * 0.1);
        camPath(cam, u, [400.9, -9.2, 0.8], [400.8, -9.8, 0.7], [400, -14, 0], [400, -14, 0], 22, 26); rumble(cam, t, 0.8); return; }
      const t0 = dur * 0.42; const pop = ramp(t, t0, t0 + 0.35); N.root.position.y = 1.7 + Math.sin(Math.PI * pop) * 1.2; N.size(0.05 + 0.25 * Math.min(1, pop * 1.4));
      N.update(t, pop < 1 ? 'happy' : 'bark'); sp.update(t, [0, 2.2, 0], 1 - sm(t, t0 + 0.2, dur), { up: 3, spread: 2, size: 0.4 }); env.well.glow(0.6 * (1 - sm(t, t0, dur)));
      A.pose(addPose(idle(t, 1), hit([[t0, {}], [t0 + 0.2, { lean: -12, rUp: 40, lUp: 40, rFwd: 30, lFwd: 30, bob: -0.05 }], [t0 + 0.7, { lean: 4, rFwd: 60, lFwd: 60, rUp: -10, lUp: -10 }]], t)));
      A.setFace(t > t0 + 0.6 ? 'starstruck' : 'shock'); A.root.position.z = -3.5 - sm(t, t0, t0 + 0.3) * 0.5;
      camPath(cam, sm(t, t0, dur), [2.8, 3.4, 9.0], [2.2, 3.2, 7.6], [0.6, 2.9, 0.5], [0.6, 2.8, 0.8], 30, 34); shake(cam, t, t0, 0.6);
    };
  },
  // 13 "He was tiny. I named him Noodle."  — Tess holds the tiny pup up to her face; he licks her nose; she laughs
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const A = tess(S, 'delighted', [5, 0, 6], -15); const N = noodle(S, 0.28, [0, 0, 0], -100); allow(S, ['tess', 'noodle']);
    return (t, dur) => { env.update(t); scrollBread(B, t);
      const lift = sm(t, 0, dur * 0.3); A.pose(addPose(idle(t, 0.6), { rFwd: 62 + lift * 14, lFwd: 62 + lift * 14, rUp: -16, lUp: -16, nod: -4 - lift * 4, tilt: Math.sin(t * 2) * 4 }));
      const hr = pinky(A, 'R'), hl = pinky(A, 'L'); N.root.position.set((hr.x + hl.x) / 2 + 0.45, (hr.y + hl.y) / 2 + 0.1, (hr.z + hl.z) / 2 + 0.1);
      const lick = sm(t, dur * 0.45, dur * 0.55) * (1 - sm(t, dur * 0.7, dur * 0.8)); const p = N.update(t, 'wag');
      N.apply({ ...p, _t: t, headX: -0.3 * lick, tongue: 1, jaw: 0.4 + lick * 0.3, gait: 0, ph: 0 });
      A.setFace(t > dur * 0.5 ? 'laugh' : 'delighted');
      const h = headOf(A); faceCam(cam, sm(t, 0, dur), [h.x, h.y - 0.6, h.z], -15, { dist: 6.4, lens: 34, push: 0.8, side: 1.0, look: -0.3 });
    };
  },
  // 14 "By lunch, he was the size of a car."  — noon: Noodle, now as big as the old pickup beside him, tilts his head; Tess laughs with her hands on her hips
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD);
    const pk = pickup(S, { col: 0x3aa8a0 }); pk.position.set(15.2, 0, -9.4);
    const N = noodle(S, 1.55, [5.4, 0, -9.6], 18); const A = tess(S, 'laugh', [9.2, 0, -2.6], -25);
    return (t, dur) => { env.update(t); scrollBread(B, t); N.update(t, 'tilt', 'wag', sm(t, dur * 0.55, dur * 0.75));
      A.pose(addPose(addPose(idle(t, 1), HIPS), { bob: Math.abs(Math.sin(t * 7)) * 0.05, tilt: 6, ...lookAt(A, [5.4, 7, -8]) })); A.setFace(t > dur * 0.4 ? 'laugh' : 'grin');
      camPath(cam, sm(t, 0, dur), [3.5, 5.0, 17], [5.5, 4.6, 14.5], [9, 4.2, -6.5], [9.6, 4.0, -6.6], 24, 26);
    };
  },
  // 15 "The whole class rode him home!"  — Noodle (bus-sized) trots across the plaza with Tess and two classmates riding on his back, cheering
  (S, cam) => {
    const env = pennyMesa(S, { time: 'day' }); const B = endlessBread(S, BREAD); env.follow(0, 12);
    const N = noodle(S, 2.4, [-26, 0, 19], 90); const R = [kid(S, 0, 'laugh', [0, 0, 0], 90), tess(S, 'laugh', [0, 0, 0], 90), kid(S, 2, 'grin', [0, 0, 0], 90)];
    allow(S, ['tess', 'noodle'], ['kid*', 'noodle'], ['kid*', 'tess'], ['kid*', 'kid*']);
    return (t, dur) => { env.update(t); scrollBread(B, t); const x = -24 + t * 6.0; N.root.position.x = x; const p = N.update(t * 0.75, 'run');
      R.forEach((A, i) => { ride(N, A, [1.0, -0.6, -1.6][i], 0); A.pose(addPose(STRADDLE, { rUp: 140 + Math.sin(t * 7 + i) * 15, lUp: i === 1 ? 10 : 130, lFwd: i === 1 ? 60 : 0, lean: 8, bob: Math.abs(Math.sin(t * 8.25)) * 0.08, turn: 25 })); });
      camPath(cam, sm(t, 0, dur), [x + 6, 11, 33], [x + 8, 10.5, 32.5], [x, 8, 19], [x + 1, 8, 19], 20, 20);
    };
  },
  // 16 "By sunset, he was taller than the clock tower."  — sunset, low angle: Tess at the well looks up; the camera tilts up past the clock tower to Noodle sitting behind it, head cocked, tongue out
  (S, cam) => {
    const env = pennyMesa(S, { time: 'sunset', flagsOn: false }); const B = endlessBread(S, BREAD); env.follow(4, -40);
    const N = noodle(S, 9.5, [-11, 0, -46], 8); const A = tess(S, 'awe', [5.8, 0, 9.5], 160);
    const kf = fill(S, [5, 7, -18], 0, 0xffb080, 80);
    return (t, dur) => { env.update(t); scrollBread(B, t); N.update(t, 'tilt', 'wag', sm(t, dur * 0.7, dur));
      A.pose(addPose(idle(t, 1), { nod: -38, rFwd: 15, lFwd: 15, lean: -6, turn: Math.sin(t) * 4 })); A.setFace(t > dur * 0.5 ? 'awe' : 'shock');
      kf.intensity = 0; const p = sm(t, 0, dur);
      camPath(cam, p, [9.5, 1.6, 21], [10.5, 1.2, 23.5], [6, 5, 8], [-2, 31, -40], 22, 22);
    };
  },
  // 17 "One happy wag, and the water tower went down."  — Noodle's huge tail swishes; the town's water tower tips over and bursts; two neighbours duck
  (S, cam) => {
    const env = pennyMesa(S, { time: 'sunset' }); const B = endlessBread(S, BREAD); env.follow(40, -40);
    const N = noodle(S, 9.5, [30, 0, -52], -90); const T1 = towny(S, 0, 'shock', [26, 0, 10], 160), T2 = towny(S, 2, 'scared', [31, 0, 12], 200);
    return (t, dur) => { env.update(t); scrollBread(B, t); const p = N.update(t, 'wag'); const tb = dur * 0.35;
      N.tail.rotation.y = Math.sin(t * 7) * 0.5 + hn([[0, 0], [tb, 0.9], [tb + 0.3, -0.3]], t) * 0.6;
      const k = Math.pow(sm(t, tb, dur * 0.75), 1.6); env.tower.topple(k); env.tower.splash(ramp(t, dur * 0.7, dur * 1.1));
      [T1, T2].forEach((T, i) => { T.pose(addPose(idle(t, 1, i), hit([[tb + 0.2, { nod: -20 }], [dur * 0.72, { rFwd: 160, lFwd: 160, rUp: 20, lUp: 20, nod: 20, lean: 20, bob: -0.3 }]], t))); T.setFace(t > dur * 0.7 ? 'scared' : 'shock'); });
      camPath(cam, sm(t, 0, dur), [18, 6, 30], [20, 5, 28], [42, 18, -34], [48, 12, -34], 22, 22); if (t > dur * 0.75) rumble(cam, t, 2.2 * (1 - sm(t, dur * 0.75, dur)));
    };
  },
  // 18 "The mayor called a town meeting."  — night: the whole town at the well; Mayor Hollis on a crate, arms up; Noodle's huge sad head rests on the rooftops behind
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD);
    const crate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.0), new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.9 })); crate.position.set(-6, 0.6, -4); S.add(crate);
    const My = mayor(S, 'angry', [-6, 1.2, -4], 20); const N = noodle(S, 7, [-8, 0, -58], 0);
    const C = [pell(S, 'worried', [-10.5, 0, 2.6], 160), baker(S, 'nervous', [-6, 0, 3.6], 180), towny(S, 0, 'worried', [-2.2, 0, 4.0], 200), towny(S, 1, 'scared', [-13.5, 0, -1], 120), kid(S, 1, 'worried', [3.4, 0, -2.6], 235), tess(S, 'worried', [-1.2, 0, 7.6], 195)];
    const kf = fill(S, [-6, 6, 2], 30, 0xffd0a0, 14);
    return (t, dur) => { env.update(t); scrollBread(B, t); N.update(t, 'sad');
      My.pose(addPose(idle(t, 1), hit([[0, { ...HIPS }], [dur * 0.25, { rUp: 150, lUp: 150, nod: -10 }], [dur * 0.6, { rUp: 120, lUp: 135, nod: -6 }]], t)));
      C.forEach((A, i) => A.pose(addPose(idle(t, 1, i), lookAt(A, [-6, 5.6, -4]))));
      camPath(cam, sm(t, 0, dur), [-2, 9, 20], [-3, 8, 16.5], [-6, 5, -6], [-6, 5.6, -8], 24, 26);
    };
  },
  // 19 "That dog goes out past the dunes. Tonight."  — Mayor Hollis close-up, points at the dark dunes
  (S, cam) => {
    const env = pennyMesa(S, { time: 'night', tower: 0 }); const B = endlessBread(S, BREAD);
    const crate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.0), new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.9 })); crate.position.set(-6, 0.6, -4); S.add(crate);
    const My = mayor(S, 'angry', [-6, 1.2, -4], 20); const N = noodle(S, 7, [-8, 0, -58], 0); const kf = fill(S, [-4.5, 7.5, 1.0], 26, 0xffd0a0, 12);
    return (t, dur) => { env.update(t); N.update(t, 'sad');
      My.pose(addPose(addPose(idle(t, 1), talk(t)), hit([[0, { rUp: 120, lUp: 135 }], [dur * 0.2, { rFwd: 95, rUp: 40, turn: 35, lUp: 10, bodyTurn: 15 }], [dur * 0.6, { rFwd: 100, rUp: 45, turn: 30, lUp: 10, bodyTurn: 15 }], [dur * 0.8, { rFwd: 40, rUp: 10, turn: 0, lUp: 28, lFwd: -8 }]], t)));
      My.setFace(t > dur * 0.65 ? 'determined' : 'angry');
      const h = headOf(My); faceCam(cam, sm(t, 0, dur), [h.x, h.y, h.z], 20, { dist: 8.0, lens: 32, push: 0.9, side: -0.6, look: 0.1 });
    };
  },
];
