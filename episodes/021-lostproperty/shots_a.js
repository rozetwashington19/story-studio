// Episode 021 (Lost Property) — lines 2–30: the rule, the gags, Mara, the envelope, the clock.
import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, track,
  lostHall, grandStation, temperJar, thoughtTrain, hourglass, portersCart, envelope, tagCard, keyRing, teddy, framedPhoto, pigeon, box, std } from '../../engine/kit.js';
import { mara, cal, pip, abel, mayor, kid, ramp, sm, lerp, V, headOf, faceCam, fill, allow, hold, hands, hn, shake, arc, clamp01 } from './common.js';

export const ps = (...a) => a.reduce((x, y) => addPose(x, y), {});
export const M0 = [-1, 0, -4.9];          // Mara's spot behind the counter
export const COUNTER = { rFwd: 62, lFwd: 62, rUp: -4, lUp: -4, lean: 6 };   // hands resting on the counter
export function hall(S, o = {}) { const env = lostHall(S, o); allow(S, ['mara', 'counter']); return env; }
// the cart parked in the office with the crate + the wet envelope leaning on it (lines 19–31)
export function cartRig(S, x = 5.8, z = 2.2, flip = false) { const c = portersCart(S); c.position.set(x, 0, z);
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.3), std({ color: 0x8a5a2e })); crate.castShadow = true; c.add(crate);
  const e = envelope(c, { wet: true, s: 1.5 });
  if (flip) { c.rotation.y = Math.PI; crate.position.set(1.2, 1.6, 0.3); e.position.set(1.2, 1.72, -0.55); e.rotation.set(0.32, Math.PI, 0); }   // handle toward +x; envelope near the -x end, facing the camera
  else { crate.position.set(-0.6, 1.6, -0.5); e.position.set(-0.6, 1.72, 0.35); e.rotation.x = -0.32; }
  return { c, e, crate }; }
const PUSH = { rFwd: 68, lFwd: 68, lean: 10 };

export const SHOTS_A = [
  // 2 "Everything this city loses ends up with me."  — Mara behind the counter; a teddy thumps onto the counter, a top hat lands on her head, and she catches a red ball without looking.
  //   Blocking: Mara centre behind the counter looking up, then at camera. Camera: fast push-in from the door (motion from frame 0).
  (S, cam) => {
    const env = hall(S, { h: 5, m: 40 }); const A = mara(S, 'smile', M0);
    const td = teddy(S); const hat = new THREE.Group(); S.add(hat); const hm = std({ color: 0x1a1a1e, roughness: 0.5 }); const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.75, 18), hm); h1.position.y = 0.4; h1.castShadow = true; hat.add(h1); const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.07, 20), hm); hat.add(h2); const h3 = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.16, 18), std({ color: 0xc8302a })); h3.position.y = 0.12; hat.add(h3);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12), std({ color: 0xd8302a, roughness: 0.4 })); ball.castShadow = true; S.add(ball);
    const drop = (t, t0, top) => t < t0 ? 13 : hn([[t0, 12.5], [t0 + 0.34, top], [t0 + 0.46, top + 0.3], [t0 + 0.6, top]], t, x => x * x);
    return (t, dur) => { env.update(t);
      td.position.set(-3.3, drop(t, 0.0, 3.26), -2.7); td.rotation.z = Math.sin(t * 9) * 0.1 * (t < 0.6 ? 1 : 0);
      const hd = headOf(A); hat.position.set(hd.x, Math.max(hd.y + 0.62, drop(t, 0.28, hd.y + 0.62)), hd.z); hat.rotation.z = t > 0.62 ? 0.12 : 0;
      const hp = hands(A); const u = ramp(t, 0.85, 1.25); ball.position.set(lerp(-1, hp.x, u), u < 1 ? lerp(12.5, hp.y + 0.25, u * u) : hp.y + 0.25, lerp(-3.6, hp.z + 0.1, u)); ball.rotation.x = t * 7;
      A.pose(ps(idle(t, 1), anticipate(t, 1.15), hit([[0, { nod: -22, rUp: 10, lUp: 10 }], [0.62, { nod: -24, rFwd: 20, lFwd: 20 }], [0.72, { nod: 6, bob: -0.14, rFwd: 30, lFwd: 30 }], [1.25, { nod: 0, rFwd: 72, lFwd: 72, rUp: -16, lUp: -16, bob: -0.1 }], [1.5, { nod: -2, rFwd: 66, lFwd: 66, rUp: -16, lUp: -16, tilt: 6 }]], t)));
      A.setFace(t < 0.62 ? 'awe' : t < 1.3 ? 'shock' : 'smirk');
      camPath(cam, sm(t, 0, dur * 0.9), [0.8, 6.6, 13.5], [-0.4, 5.3, 6.6], [-0.8, 5.6, -4], [-1, 4.7, -4.4], 22, 26); shake(cam, t, 0.34, 0.3); shake(cam, t, 0.62, 0.3);
    };
  },
  // 3 "Claim it by six, or the Night Train takes it."  — (a) the office clock: the minute hand sweeps to six o'clock; (b) cut: the Night Train heaves out of the platform, steam and whistle.
  (S, cam) => {
    const H = new THREE.Group(); S.add(H); const env = lostHall(H, { h: 5, m: 50 }); const G = new THREE.Group(); S.add(G); const st = grandStation(G, { clockX: -6, trainX: 4, h: 6, m: 0 }); const hallBg = new THREE.Color(0x100c0a);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.42]); H.visible = k === 0; G.visible = k === 1; S.background = k ? G.background : hallBg; S.fog = k ? G.fog : null;
      if (k === 0) { env.update(t); const m = 50 + 10 * hn([[0, 0], [dur * 0.36, 1]], t); env.clock.set(5, m);
        camPath(cam, lt, [1.2, 4.6, -0.6], [1.7, 5.0, -1.6], [2.9, 8.5, -6], [2.9, 8.5, -6], 34, 40); if (t > dur * 0.36) shake(cam, t, dur * 0.36, 0.25); return; }
      const u = t - dur * 0.42; const dist = 2.2 * u * u + 1.5 * u; st.train.g.position.x = 4 - 8 + dist; st.update(t, { dist: dist * 1.6, steam: 1, whistle: u < 0.7 ? 1 : 0.2 }); st.follow(4);
      camPath(cam, lt, [3, 1.4, 4.5], [4.2, 1.7, 3.6], [3.5, 5.6, -8], [7, 5.8, -8], 22, 24); cam.position.x += Math.sin(t * 34) * 0.04; cam.position.y += Math.sin(t * 29) * 0.04;
    };
  },
  // 4 "You see, only the owner can pick it up."  — over the counter: a little girl reaches up, lifts her teddy off the counter like nothing and hugs it, hopping.
  //   Camera behind the counter looking out at the hall doors (new angle); the teddy lifts easily — light as a feather.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 41 }); const K = kid(S, 'smile', [0.4, 0, -0.75], 180); const td = teddy(S, 0x8a5a3a); td.scale.setScalar(0.82);
    allow(S, ['kid', 'counter']);
    return (t, dur) => { env.update(t); const u = sm(t, dur * 0.2, dur * 0.5), v = sm(t, dur * 0.5, dur * 0.75); const hop = t > dur * 0.72 ? Math.abs(Math.sin((t - dur * 0.72) * 11)) * 0.3 : 0;
      K.pose(ps(idle(t, 1), anticipate(t, dur * 0.2), hit([[0, { rFwd: 104, lFwd: 104, nod: -18 }], [dur * 0.5, { rFwd: 118, lFwd: 118, nod: -22 }], [dur * 0.78, { rFwd: 88, lFwd: 88, rUp: -30, lUp: -30, nod: 8 }]], t), { bob: hop }));
      K.setFace(t < dur * 0.45 ? 'smile' : t < dur * 0.75 ? 'delighted' : 'love');
      td.position.set(0.4, lerp(3.08, 3.7, u) - v * 2.05 + hop * 0.72, lerp(-2.25, -1.85, u) + v * 0.5); td.rotation.set(0, Math.PI, Math.sin(t * 6) * 0.12 * u);
      camPath(cam, sm(t, 0, dur), [2.3, 5.9, -7.4], [1.8, 5.5, -6.6], [0.4, 3.3, -1.4], [0.4, 3.0, -1.2], 26, 28);
    };
  },
  // 5 "For anyone else, it won't budge."  — Mara heaves at Mr. Abel's tiny key ring with both hands, face going red… it does not move a hair; she slips and flails back.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 42 }); const A = mara(S, 'determined', M0); const key = keyRing(S); key.scale.setScalar(1.7); key.position.set(-1, 3.14, -3.45);
    return (t, dur) => { env.update(t); const slip = dur * 0.68; const strain = t < slip ? Math.sin(t * 16) * (0.4 + t / dur) : 0;
      A.pose(ps(idle(t, 0.5), anticipate(t, slip, 1.5), hit([[0, { rFwd: 62, lFwd: 62, rUp: -10, lUp: -10, lean: 16, nod: 18 }], [slip, { rFwd: 58, lFwd: 58, rUp: -10, lUp: -10, lean: 4, nod: 6, bob: 0.1 }], [slip + 0.22, { rFwd: 40, lFwd: 30, rUp: 95, lUp: 110, lean: -22, nod: -18, bob: -0.05 }], [slip + 0.55, { rFwd: 20, lFwd: 20, rUp: 40, lUp: 46, lean: -8, nod: 4 }]], t), { bob: strain * 0.03, tilt: strain * 2.5, lean: strain * 1.2 }));
      A.setFace(t < dur * 0.3 ? 'determined' : t < slip ? 'angry' : t < slip + 0.5 ? 'shock' : 'pout'); key.rotation.y = 0.4 + (t < slip ? Math.sin(t * 40) * 0.015 : 0);
      camPath(cam, sm(t, 0, dur), [0.4, 4.7, 2.6], [-0.2, 4.4, 1.2], [-1, 3.9, -4.3], [-1, 4.0, -4.5], 30, 32); shake(cam, t, slip, 0.35);
    };
  },
  // 6 "Mr. Abel lost his keys. Easy."  — over the counter: Mr. Abel strolls up, hooks the same key ring with one finger, twirls it and grins.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 43 }); const B = abel(S, 'smile', [-0.6, 0, 0.6], 180); const key = keyRing(S); key.scale.setScalar(1.7);
    allow(S, ['abel', 'counter']);
    return (t, dur) => { env.update(t); const w = sm(t, 0, dur * 0.3); B.root.position.z = lerp(0.9, -0.75, w); const g = dur * 0.42;
      B.pose(ps(idle(t, 1), t < dur * 0.3 ? walk(t, 1.1, 26) : {}, anticipate(t, g), hit([[dur * 0.25, { rFwd: 20 }], [g, { rFwd: 78, lean: 8, nod: 10 }], [g + 0.3, { rFwd: 60, rUp: 85, nod: -6, tilt: -8 }], [g + 0.6, { rFwd: 55, rUp: 92, tilt: 6 }]], t)));
      B.setFace(t < g ? 'smile' : t < g + 0.35 ? 'wink' : 'grin');
      if (t < g) { key.position.set(-0.6, 3.14, -2.3); key.rotation.set(0, 0.4, 0); } else { const hp = pinky(B, 'R'); key.position.set(hp.x, hp.y - 0.25, hp.z); key.rotation.set(Math.PI / 2, 0, (t - g) * 14); }
      camPath(cam, sm(t, 0, dur), [1.6, 5.5, -7.3], [1.0, 5.2, -6.2], [-0.6, 4.0, -1.0], [-0.7, 4.4, -0.8], 28, 30);
    };
  },
  // 7 "Then he lost his temper. It bit me."  — (a) Abel stamps and shakes his fists, a red puff pops off his head; (b) front: the little red temper on its stand lunges and clamps onto Mara's finger; she shakes it off and slams the glass dome on.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 44 }); const B = abel(S, 'angry', [-0.6, 0, -0.5], 180); const A = mara(S, 'smile', [-2.3, 0, -4.9]); const J = temperJar(S, { s: 1.0 }); J.g.position.set(-0.2, 3.08, -3.0);
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0xe83a2a, transparent: true })); S.add(puff); allow(S, ['abel', 'counter']);
    return (t, dur) => { env.update(t); const [k, lt] = seg(t, dur, [0.4]);
      if (k === 0) { J.g.visible = false; A.root.visible = false; B.root.visible = true;
        B.pose(ps(idle(t, 0.6), { rUp: 118 + Math.sin(t * 26) * 14, lUp: 118 + Math.sin(t * 26 + 1.2) * 14, rFwd: 30, lFwd: 30, bob: Math.abs(Math.sin(t * 13)) * 0.18, rLeg: Math.max(0, Math.sin(t * 13)) * 30, lLeg: Math.max(0, -Math.sin(t * 13)) * 30, nod: -8, tilt: Math.sin(t * 13) * 5 }));
        const u = ramp(lt, 0.35, 1); puff.visible = u > 0; puff.position.set(-0.6, 5.6 + u * 1.6, -0.5 - u * 1.2); puff.scale.setScalar(0.4 + u * 1.1); puff.material.opacity = 1 - u * 0.5;
        camPath(cam, lt, [1.2, 5.0, -6.8], [0.9, 5.0, -6.2], [-0.6, 4.4, -0.6], [-0.6, 4.6, -0.6], 30, 32); cam.position.y += Math.abs(Math.sin(t * 13)) * 0.04; return; }
      puff.visible = false; B.root.visible = false; J.g.visible = true; A.root.visible = true; const t0 = dur * 0.4, bite = t0 + 0.3, off = t0 + 0.95, lid = off + 0.2; const biting = t > bite && t < off;
      J.lid.forEach(o => { o.visible = t > lid; }); J.update(t, t < bite ? 'sulk' : 'rage', 1.2);
      A.pose(ps(idle(t, 0.6), anticipate(t, bite), hit([[t0, { lFwd: 40, lUp: 20, lean: 12, nod: 14, turn: 22 }], [bite, { lFwd: 64, lUp: 30, lean: 14, nod: 16, turn: 24 }], [bite + 0.18, { lFwd: 70, lUp: 78, lean: -10, nod: -8, turn: 20 }], [off, { lFwd: 60, lUp: 85, lean: -8, nod: -4, turn: 18 }], [off + 0.3, { lFwd: 30, lUp: 20, lean: 2, nod: 8, turn: 22 }]], t), biting ? { lUp: Math.sin(t * 34) * 16, bob: Math.sin(t * 34) * 0.03 } : {}));
      A.setFace(t < bite ? 'smile' : t < off ? 'shock' : 'pout');
      if (biting) { const hp = pinky(A, 'L'); J.g.updateMatrixWorld(true); const l = J.g.worldToLocal(hp.clone()); J.m.root.position.set(l.x, l.y - 0.22 - 0.8, l.z - 0.35); J.m.root.rotation.set(0.25, -0.4, 0); } else { J.m.root.rotation.x = 0; J.m.root.position.z = 0; if (t >= off) J.m.root.position.set(0, Math.abs(Math.sin((t - off) * 14)) * 0.3 * Math.exp(-(t - off) * 4), 0); }
      camPath(cam, sm(t, t0, dur), [0.2, 4.5, 2.6], [-0.1, 4.3, 1.6], [-0.9, 3.9, -3.8], [-1.0, 4.0, -4.0], 28, 30); shake(cam, t, bite, 0.4);
    };
  },
  // 8 "The mayor lost her train of thought."  — platform two, daytime: the mayor mid-speech, finger raised… goes blank; a tiny golden train puffs out round her head carrying her thoughts and spirals away down her shoulders.
  (S, cam) => {
    const st = grandStation(S, { time: 'day', sign: '2', clockX: 6, train: false, h: 11, m: 20 }); const Y = mayor(S, 'proud', [0, 0, 2.5], 0); const tt = thoughtTrain(S, { n: 4, s: 0.6 }); st.follow(0, 2);
    return (t, dur) => { st.update(t); const lose = dur * 0.3; const u = sm(t, lose, dur);
      tt.update(t, { cx: 0, cz: 2.5, rx: 1.35 + u * 0.5, rz: 1.35 + u * 0.5, lap: 0.3 + t * 0.7, y: lerp(5.75, 3.0, u) }); tt.cars.forEach(c => { c.visible = t > lose * 0.6; });
      const first = tt.cars[0].position;
      Y.pose(ps(idle(t, 1), t < lose ? talk(t) : {}, hit([[0, { rFwd: 80, rUp: 60, lUp: 28, lFwd: -8 }], [lose, { rFwd: 84, rUp: 64, lUp: 28 }], [lose + 0.35, { rFwd: 60, rUp: 24, lUp: 8, tilt: 10, nod: -6 }], [dur, { rFwd: 30, rUp: 12, lUp: 30, lFwd: 20, tilt: 12 }]], t), t > lose + 0.2 ? (() => { const l = lookAt(Y, first); return { turn: l.turn * 0.4, nod: l.nod * 0.4 }; })() : {}));
      Y.setFace(t < lose ? 'proud' : t < lose + 0.5 ? 'shock' : 'confused');
      camPath(cam, sm(t, 0, dur), [0.7, 5.0, 11.4], [0.4, 4.8, 10.0], [0, 4.9, 2.5], [0, 4.5, 2.5], 26, 26);
    };
  },
  // 9 "It ran around platform two all day."  — wide: the thought-train laps the platform in a big loop, the mayor sprinting after it, pigeons scattering.
  (S, cam) => {
    const st = grandStation(S, { time: 'day', sign: '2', clockX: 6, train: false, h: 3, m: 5 }); const Y = mayor(S, 'determined', [0, 0, 0], 0); const tt = thoughtTrain(S, { n: 5, s: 1.15 }); st.follow(0, 3);
    const RX = 4.2, RZ = 3.0, CZ = 3.0;
    return (t, dur) => { st.update(t); const lap = 0.02 + t * 0.34; tt.update(t, { cx: 0, cz: CZ, rx: RX, rz: RZ, lap });
      const a = (lap - 0.47) * Math.PI * 2; Y.root.position.set(Math.cos(a) * RX, 0, CZ - Math.sin(a) * RZ); Y.root.rotation.y = Math.atan2(-Math.sin(a) * RX, -Math.cos(a) * RZ);
      Y.pose(ps(walk(t, 1.9, 44), { rFwd: 62, lFwd: 62, lean: 16, nod: -6 })); Y.setFace(Math.sin(t * 3) > 0 ? 'determined' : 'worried');
      st.pigeons.forEach((p, i) => { const up = sm(t, 0.2 + i * 0.25, 1.2 + i * 0.25); p.userData.update(t, up > 0.02 ? 'fly' : 'peck', i); p.position.set(-3 + i * 3 + up * (i - 1) * 3, up * (7 + i), 8.5 - up * 3); });
      camPath(cam, sm(t, 0, dur), [0.6, 6.4, 13.9], [-0.4, 5.6, 13.6], [0, 2.4, 3.0], [0, 2.4, 3.0], 18, 19);
    };
  },
  // 10 "Somebody lost a whole hour."  — a glowing golden hourglass on the counter, a tag hanging off it; Mara, chin in her hands, watches the gold sand fall.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 45 }); const A = mara(S, 'awe', [-2.1, 0, -4.9]); const H = hourglass(S, { s: 1.25, light: 4 }); H.position.set(0.1, 3.08, -3.1); const tg = tagCard(S, [['LOST:', '1 hour'], ['FOUND:', 'platform 4']], { s: 0.42 }); tg.position.set(0.75, 3.6, -2.7); tg.rotation.y = -0.3;
    return (t, dur) => { env.update(t); H.userData.update(t, 0.25 + t * 0.06, 0.7); tg.rotation.z = Math.sin(t * 2.4) * 0.14 - 0.2;
      A.pose(ps(idle(t, 0.5), { rFwd: 118, lFwd: 118, rUp: -18, lUp: -18, lean: 22, nod: 4, turn: 30, tilt: Math.sin(t * 1.2) * 4 })); A.setFace(t > dur * 0.55 ? 'starstruck' : 'delighted');
      camPath(cam, sm(t, 0, dur), [1.9, 4.3, 0.9], [1.4, 4.2, 0.2], [-1.4, 3.95, -3.9], [-1.5, 4.0, -4.1], 32, 34);
    };
  },
  // 11 "Nobody ever claims those."  — seen through a cabinet of dusty, dimly glowing hourglasses: Mara slides the new one into the last gap, sighs and shrugs.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 46 }); const A = mara(S, 'neutral', [-6, 0, 11.4], 180); const wood = std({ color: 0x5a3418 });
    box(S, [8.4, 0.25, 1.5], [-6, 2.1, 9.1], wood, { r: 0.04, name: 'cabinet' }); for (const x of [-10.1, -1.9]) box(S, [0.25, 2.2, 1.5], [x, 1.1, 9.1], wood, { r: 0.04, name: 'cabinet' });
    const old = [-9.2, -8.0, -6.9, -4.6, -3.5, -2.6].map((x, i) => { const h = hourglass(S, { s: 1.1 }); h.position.set(x, 2.23, 9.1 + (i % 2) * 0.2); h.userData.update(0, 0.2 + i * 0.13, 0.5); return h; });
    const H = hourglass(S, { s: 0.95, light: 3 }); const kf = fill(S, [-5.6, 4.6, 8.4], 5, 0xffd890, 8); allow(S, ['mara', 'cabinet']);
    return (t, dur) => { env.update(t); old.forEach((h, i) => h.userData.update(t + i, 0.2 + i * 0.13, 0.45)); const put = dur * 0.42;
      A.pose(ps(idle(t, 0.8), anticipate(t, put), hit([[0, { rFwd: 86, lFwd: 86, rUp: -14, lUp: -14, nod: 16, lean: 10 }], [put, { rFwd: 64, lFwd: 64, rUp: -14, lUp: -14, nod: 22, lean: 16 }], [put + 0.4, { rFwd: 24, lFwd: 24, rUp: 38, lUp: 38, tilt: 9, nod: 2 }], [dur, { rFwd: 8, lFwd: 8, rUp: 10, lUp: 10, tilt: 4, nod: 6 }]], t)));
      A.setFace(t < put ? 'neutral' : t < put + 0.5 ? 'bored' : 'smile');
      const hp = hands(A); if (t < put) H.position.set(-5.75, lerp(2.7, 2.23, sm(t, 0, put)), lerp(hp.z, 9.2, sm(t, 0, put))); else H.position.set(-5.75, 2.23, 9.2); H.userData.update(t, 0.3, 1);
      camPath(cam, sm(t, 0, dur), [-4.9, 4.3, 3.9], [-5.3, 4.2, 4.9], [-5.9, 4.1, 10.6], [-5.9, 4.2, 10.8], 28, 30);
    };
  },
  // 12 "I'm Mara. I'm thirty-one."  — close-up: Mara pops a filled-in luggage tag up beside her face (NAME: Mara / AGE: 31) and gives a little grin.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 47 }); const A = mara(S, 'smile', M0); const tg = tagCard(S, [['NAME:', 'Mara'], ['AGE:', '31']], { s: 0.62 });
    return (t, dur) => { env.update(t);
      A.pose(ps(idle(t, 1), anticipate(t, 0.25), hit([[0.05, { rFwd: 30, rUp: 0 }], [0.36, { rFwd: 20, rUp: 64, tilt: -7, nod: -3, turn: -10 }], [0.6, { rFwd: 16, rUp: 58, tilt: -4, turn: -6 }]], t), { rUp: Math.sin(t * 7) * 2.5 }));
      A.setFace(t < 0.4 ? 'smile' : 'wink'); const pop = hn([[0.15, 0], [0.42, 1]], t); tg.position.set(-2.75, 4.2 + pop * 0.75, -4.2); tg.scale.setScalar(0.62 * Math.max(0.001, pop)); tg.rotation.z = Math.sin(t * 7) * 0.05 + 0.1; tg.visible = t > 0.15;
      faceCam(cam, sm(t, 0, dur), [-1.75, 4.75, -4.9], 0, { dist: 7.6, lens: 32, side: 0.2, push: 0.9, look: -0.1 });
    };
  },
  // 13 "Eleven years at this counter."  — time-lapse: the clock hands whirl, the window light sweeps, tags pile up beside her while Mara stamps, stamps, stamps; camera dollies across the hall.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 0 }); const A = mara(S, 'smile', M0); const stack = box(S, [0.5, 1, 0.34], [0.2, 3.1, -3.2], std({ color: 0xe8c88a }), { r: 0.02, solid: false });
    return (t, dur) => { env.update(t * 6); env.clock.set(5, t * 420); env.sun.intensity = 380 + Math.sin(t * 6) * 240; const st = Math.abs(Math.sin(t * 15));
      A.pose(ps(idle(t, 1), { rFwd: 54 + st * 26, rUp: -8, lFwd: 60, lUp: -6, lean: 10, nod: 12 + st * 3, turn: Math.sin(t * 2.6) * 10 })); A.setFace(Math.sin(t * 2.6) > 0 ? 'smile' : 'determined');
      const k = 0.1 + t / dur * 1.3; stack.scale.y = k; stack.position.y = 3.08 + k / 2;
      camPath(cam, sm(t, 0, dur), [-5.5, 6.2, 11], [3.4, 5.6, 9.6], [-0.4, 5.2, -4.4], [-0.6, 5.0, -4.6], 22, 23);
    };
  },
  // 14 "And I've never lost a thing."  — low angle: Mara, hands on hips, flips a brass stamp in the air and catches it without looking. Smug.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 48 }); const A = mara(S, 'smirk', M0); const stamp = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.4, 10), std({ color: 0xd8a83a, metalness: 0.8, roughness: 0.3 })); stamp.castShadow = true; S.add(stamp);
    return (t, dur) => { env.update(t); const t0 = dur * 0.22, t1 = dur * 0.66; const u = ramp(t, t0, t1);
      A.pose(ps(idle(t, 1), anticipate(t, t0), hit([[0, { rUp: 28, lUp: 28, rFwd: 48 }], [t0, { rUp: 10, lUp: 28, rFwd: 86, nod: -4 }], [t0 + 0.2, { rUp: 8, lUp: 28, rFwd: 70, nod: -8, tilt: 5 }], [t1, { rUp: 8, lUp: 28, rFwd: 76, nod: -8, tilt: 6, bob: -0.05 }], [t1 + 0.25, { rUp: 24, lUp: 28, rFwd: 52, tilt: 8, nod: -4 }]], t)));
      A.setFace(t < t1 ? 'smirk' : 'proud'); const hp = pinky(A, 'R'); stamp.position.set(hp.x, hp.y + 0.15 + (u > 0 && u < 1 ? Math.sin(u * Math.PI) * 1.9 : 0), hp.z + 0.1); stamp.rotation.x = u > 0 && u < 1 ? u * 12.56 : 0;
      camPath(cam, sm(t, 0, dur), [1.4, 3.5, 0.9], [0.9, 3.6, -0.2], [-1, 4.5, -4.9], [-1, 4.6, -4.9], 30, 32);
    };
  },
  // 15 "Well. One thing. My brother, Cal."  — her smile slides off; her eyes drop to a small framed photo of two kids by the lamp; her hand reaches and touches the frame.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 49 }); const A = mara(S, 'smirk', [-2.6, 0, -4.9]); const ph = framedPhoto(S); ph.scale.setScalar(1.5); ph.position.set(-4.35, 3.72, -3.2); ph.rotation.set(-0.16, 0.45, 0); const kf = fill(S, [-4.0, 4.4, -2.0], 4, 0xffd8a0, 6);
    return (t, dur) => { env.update(t);
      A.pose(ps(idle(t, 0.6), hit([[0, { rUp: 26, lUp: 26, nod: -3 }], [dur * 0.35, { rUp: 8, lUp: 6, nod: 10, turn: -20 }], [dur * 0.8, { rFwd: 64, rUp: 22, lUp: 4, nod: 17, turn: -26, lean: 10 }]], t))); A.setFace(t < dur * 0.22 ? 'smirk' : t < dur * 0.5 ? 'neutral' : 'sad');
      camPath(cam, sm(t, 0, dur), [-5.6, 4.2, 0.5], [-5.3, 4.2, -0.4], [-3.3, 4.2, -4.2], [-3.3, 4.15, -4.2], 34, 38);
    };
  },
  // 16 "Four years ago, we said things."  — flashback, golden platform: Mara and Cal nose to nose, both jabbing fingers, both talking over each other.
  (S, cam) => {
    const st = grandStation(S, { clockX: 10, trainX: 30, h: 4, m: 10 }); S.userData.look = 'flash'; st.follow(0, 2); const kf = fill(S, [0, 6.5, 9], 110, 0xffe6c8, 26);
    const A = mara(S, 'angry', [-2.4, 0, 2], 55); const C = cal(S, 'angry', [2.4, 0, 2], -55); allow(S, ['mara', 'cal']);
    return (t, dur) => { st.update(t, { steam: 0.4 });
      A.pose(ps(idle(t, 0.8), talk(t, 1.4), { rFwd: 78 + Math.sin(t * 11) * 12, rUp: 6, lUp: 26, lean: 12 + Math.sin(t * 5.5) * 5, turn: 10 }));
      C.pose(ps(idle(t, 0.8, 2), talk(t + 0.4, 1.4), { lFwd: 70 + Math.sin(t * 10 + 1.3) * 14, lUp: 20 + Math.sin(t * 5) * 10, rUp: 30, lean: 10 + Math.sin(t * 5 + 2) * 5, turn: -10 }));
      A.setFace(Math.sin(t * 5.5) > 0.2 ? 'angry' : 'determined'); C.setFace(Math.sin(t * 5 + 2) > 0 ? 'angry' : 'disgusted');
      camPath(cam, sm(t, 0, dur), [0.6, 4.9, 12.6], [0.2, 4.7, 10.8], [0, 4.4, 2], [0, 4.4, 2], 24, 25);
    };
  },
  // 17 "Then we said nothing at all."  — flashback wide: they turn their backs and walk off in opposite directions down the long platform; camera cranes up.
  (S, cam) => {
    const st = grandStation(S, { clockX: 0, trainX: 30, h: 4, m: 12 }); S.userData.look = 'flash'; st.follow(0, 2); const kf = fill(S, [0, 7, 10], 120, 0xffe6c8, 30);
    const A = mara(S, 'angry', [-2.4, 0, 2], 55); const C = cal(S, 'angry', [2.4, 0, 2], -55);
    return (t, dur) => { st.update(t, { steam: 0.4 }); const turn = sm(t, 0, 0.55), go = Math.max(0, t - 0.4);
      A.root.rotation.y = lerp(55, -70, turn) * D; C.root.rotation.y = lerp(-55, 70, turn) * D; A.root.position.x = -2.4 - go * 1.5; C.root.position.x = 2.4 + go * 1.5;
      const slump = { nod: 16, lean: 6, rUp: 4, lUp: 4 }; A.pose(ps(go > 0 ? walk(t, 0.55, 22) : idle(t), slump)); C.pose(ps(go > 0 ? walk(t + 0.4, 0.55, 22) : idle(t), slump, { rFwd: 30, rUp: 14 }));
      A.setFace(t > dur * 0.5 ? 'sad' : 'angry'); C.setFace(t > dur * 0.6 ? 'sad' : 'angry');
      camPath(cam, sm(t, 0, dur), [0, 4.6, 12.5], [0, 7.0, 13.8], [0, 4.0, 2], [0, 4.4, 0], 22, 20);
    };
  },
  // 18 "But people don't turn up on my shelves."  — from inside the one empty slot on her shelves: Mara straightens its blank brass label, a blank tag swinging in the foreground; she looks into the empty space.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 49 }); const A = mara(S, 'sad', [3.1, 0, -6.2], 180); const tg = tagCard(S, [['LOST:', ''], ['CLAIMED BY:', '']], { s: 0.5 }); const kf = fill(S, [3.4, 5.9, -8.7], 5, 0xffd8a8, 7);
    allow(S, ['mara', 'shelf*']);
    return (t, dur) => { env.update(t); tg.position.set(4.35, 6.2, -8.55); tg.rotation.set(0, Math.PI, Math.sin(t * 1.5) * 0.22 + 0.1);
      A.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 30, nod: 4 }], [dur * 0.3, { rFwd: 82, rUp: 4, nod: 8, lean: 6 }], [dur * 0.62, { rFwd: 80, rUp: -2, nod: 10, lean: 7 }], [dur * 0.9, { rFwd: 20, nod: 14, tilt: -6 }]], t))); A.setFace(t > dur * 0.6 ? 'teary' : 'sad');
      camPath(cam, sm(t, 0, dur), [3.9, 5.75, -9.75], [3.6, 5.7, -9.55], [3.1, 4.9, -6.2], [3.1, 4.85, -6.2], 22, 23);
    };
  },
  // 19 "Today, at ten to six, the last cart rolled in."  — wide: clock at 5:50; Pip wheels the last cart in through the cart doorway; Mara looks up from her ledger. One envelope on the cart.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 50 }); const A = mara(S, 'neutral', [0.4, 0, -4.9]); const R = cartRig(S, 14, 2.2, true); const P = pip(S, 'smile', [18, 0, 2.2], -90);
    return (t, dur) => { env.update(t); const u = sm(t, 0, dur * 0.82); const x = lerp(15.5, 4.6, u); R.c.position.x = x; R.c.userData.roll(-(15.5 - x)); P.root.position.x = x + 3.75; R.e.userData.update(t);
      P.pose(ps(u < 0.98 ? walk(t, 1.25, 30) : idle(t), PUSH, { nod: 4 })); P.setFace(u < 0.9 ? 'smile' : 'grin');
      const l = lookAt(A, [x, 2, 2.2]); A.pose(ps(idle(t, 1), COUNTER, hit([[0, { nod: 22, turn: 0 }], [dur * 0.3, { nod: 22, turn: 0 }], [dur * 0.5, { nod: l.nod * 0.6, turn: l.turn * 0.7 }]], t))); A.setFace(t > dur * 0.5 ? 'confused' : 'neutral');
      camPath(cam, sm(t, 0, dur), [-2.6, 5.8, 12.8], [0.6, 5.2, 11.2], [3.2, 4.4, -1.5], [3.0, 4.2, -1.5], 20, 22);
    };
  },
  // 20 "One envelope. Wet. Crumpled."  — close on the cart: a single soggy envelope leaning on a crate, dripping onto the boards; Mara out of focus behind the counter.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 50 }); const A = mara(S, 'confused', [0.4, 0, -4.9]); const R = cartRig(S, 4.6, 2.2, true); const kf = fill(S, [3.2, 3.4, 5.4], 5, 0xffe2c0, 7);
    return (t, dur) => { env.update(t); R.e.userData.update(t, 1.2); A.pose(ps(idle(t, 1), COUNTER, lookAt(A, [3.4, 2, 2.7])));
      camPath(cam, sm(t, 0, dur), [2.3, 3.0, 6.8], [3.0, 2.6, 5.4], [3.4, 1.8, 2.75], [3.4, 1.75, 2.75], 36, 40);
    };
  },
  // 21 "With my name on the front."  — (a) the name fills the frame: "Mara", ink running; (b) from down by the envelope, looking up: Mara bends over it, eyes going wide.
  //   Blocking: Mara at the end of the cart (screen left), 3/4 to camera, bending over the envelope.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 51 }); const R = cartRig(S, 4.6, 2.2, true); const A = mara(S, 'worried', [0.9, 0, 2.6], 78); const kf = fill(S, [3.4, 2.6, 4.6], 7, 0xffe2c0, 9);
    return (t, dur) => { env.update(t); R.e.userData.update(t, 1.2); const [k, lt] = seg(t, dur, [0.45]);
      A.pose(ps(idle(t, 0.6), hit([[0, { nod: 22, lean: 12, rFwd: 20, lFwd: 20 }], [dur * 0.6, { nod: 26, lean: 22, rFwd: 34, lFwd: 34, rUp: -8, lUp: -8 }]], t))); A.setFace(t > dur * 0.62 ? 'shock' : 'worried');
      if (k === 0) { camPath(cam, lt, [3.3, 2.6, 5.4], [3.35, 2.4, 4.8], [3.4, 1.85, 2.75], [3.4, 1.85, 2.75], 44, 46); return; }
      camPath(cam, lt, [4.9, 2.0, 4.4], [4.6, 2.2, 4.0], [1.7, 4.0, 2.7], [1.7, 4.05, 2.7], 30, 32);
    };
  },
  // 22 "In my brother's handwriting."  — very slow push on Mara: her hand comes up to her mouth, her eyes fill.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 51 }); const R = cartRig(S, 4.6, 2.2, true); const A = mara(S, 'shock', [0.9, 0, 2.5], 60);
    return (t, dur) => { env.update(t); R.e.userData.update(t, 1.2);
      A.pose(ps(idle(t, 0.5), hit([[0, { nod: 20, lean: 10 }], [dur * 0.45, { nod: 14, lean: 6, rFwd: 122, rUp: -12 }], [dur * 0.8, { nod: 16, lean: 6, rFwd: 126, rUp: -14, tilt: -5 }]], t), { bob: Math.sin(t * 7) * 0.012 })); A.setFace(t < dur * 0.35 ? 'shock' : 'teary');
      faceCam(cam, sm(t, 0, dur), [1.2, 4.6, 2.6], 38, { dist: 6.7, lens: 40, side: 0.3, push: 0.9, look: -0.25 });
    };
  },
  // 23 "I grabbed it. It wouldn't budge."  — Mara grabs the envelope with both hands and hauls — her whole body leans back, boots skidding — the envelope stays put and the cart rocks instead. Pip, behind the cart, scratches his head.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 52 }); const R = cartRig(S, 4.6, 2.2, true); const A = mara(S, 'determined', [0.75, 0, 2.9], 64); const P = pip(S, 'confused', [5.8, 0, -0.7], -24);
    return (t, dur) => { env.update(t); const g = dur * 0.2; const pull = t > g ? (0.5 + 0.5 * Math.sin((t - g) * 9)) : 0;
      A.pose(ps(idle(t, 0.4), anticipate(t, g), hit([[0, { rFwd: 30, lFwd: 30, lean: 10, nod: 16 }], [g, { rFwd: 50, lFwd: 50, rUp: -8, lUp: -8, lean: 34, nod: 12 }], [g + 0.3, { rFwd: 62, lFwd: 62, rUp: -8, lUp: -8, lean: 22, nod: 4, rLeg: 16, lLeg: -10 }]], t), { lean: -pull * 16, bob: pull * 0.05, tilt: Math.sin(t * 18) * 2 * pull, turn: -20 }));
      A.setFace(t < g + 0.4 ? 'determined' : 'angry'); R.c.rotation.z = pull * 0.035; R.e.userData.update(t, 1.2);
      P.pose(ps(idle(t, 1, 2), hit([[0, { rUp: 4 }], [dur * 0.5, { rFwd: 128, rUp: 34, tilt: 10, nod: -4 }]], t), { rUp: Math.sin(t * 9) * 4, turn: -30, nod: 10 })); P.setFace(t > dur * 0.6 ? 'worried' : 'confused');
      camPath(cam, sm(t, 0, dur), [3.9, 4.5, 12.2], [3.5, 4.2, 10.9], [3.2, 3.2, 1.4], [3.2, 3.3, 1.4], 22, 23); shake(cam, t, g + 0.25, 0.25);
    };
  },
  // 24 "Not mine to claim. His."  — from up by the clock: she lets go, looks at her empty hands… then turns and looks straight up at the clock (at us).
  (S, cam) => {
    const env = hall(S, { h: 5, m: 52 }); const R = cartRig(S, 4.6, 2.2, true); const A = mara(S, 'sad', [0.6, 0, 2.6], 86);
    return (t, dur) => { env.update(t); R.e.userData.update(t, 1.2); const turn = sm(t, dur * 0.45, dur * 0.8); A.root.rotation.y = lerp(86, 168, turn) * D;
      A.pose(ps(idle(t, 0.6), hit([[0, { rFwd: 46, lFwd: 46, rUp: 10, lUp: 10, nod: 24 }], [dur * 0.4, { rFwd: 50, lFwd: 50, rUp: 12, lUp: 12, nod: 26 }], [dur * 0.78, { rFwd: 10, lFwd: 8, nod: -24, tilt: -4 }]], t))); A.setFace(t < dur * 0.5 ? 'sad' : 'worried');
      camPath(cam, sm(t, 0, dur), [2.7, 7.7, -4.9], [2.5, 7.5, -4.4], [1.2, 3.6, 2.6], [0.9, 4.0, 2.6], 30, 34);
    };
  },
  // 25 "I called him on every speaker in the station."  — (a) Mara lunges for the PA microphone and yells into it; (b) cut: horn speakers on the platform blare rings of sound, pigeons explode into the air.
  (S, cam) => {
    const H = new THREE.Group(); S.add(H); const env = lostHall(H, { h: 5, m: 53 }); allow(S, ['mara', 'counter']); const A = mara(S, 'determined', [3.4, 0, -4.9]); const G = new THREE.Group(); S.add(G); const st = grandStation(G, { clockX: 0, trainX: 40, h: 5, m: 53 }); const hallBg = new THREE.Color(0x100c0a);
    return (t, dur) => { const [k, lt] = seg(t, dur, [0.52]); H.visible = k === 0; A.root.visible = k === 0; G.visible = k === 1; S.background = k ? G.background : hallBg; S.fog = k ? G.fog : null;
      if (k === 0) { env.update(t); const x = lerp(1.2, 3.4, sm(t, 0, 0.4)); A.root.position.x = x;
        A.pose(ps(idle(t, 0.6), t < 0.4 ? walk(t, 1.6, 30) : talk(t, 1.5), hit([[0.1, { rFwd: 30 }], [0.5, { rFwd: 60, lFwd: 60, rUp: -16, lUp: -16, lean: 18, nod: -4 }]], t))); A.setFace('determined');
        camPath(cam, lt, [6.4, 5.2, 2.6], [5.8, 5.0, 1.6], [3.0, 4.2, -4.2], [3.4, 4.2, -4.3], 28, 30); return; }
      st.update(t); st.follow(0, 6); st.speaker.userData.ring(t, 1); st.pigeons.forEach((p, i) => { const up = sm(lt, 0.05 + i * 0.1, 0.9); p.userData.update(t, 'fly', i); p.position.set(4.5 + i * 1.2 + up * (i - 1) * 2, 2.5 + up * (6 + i * 1.5), 8.5 + i * 0.4); });
      camPath(cam, lt, [1.4, 1.5, 4.4], [1.9, 1.7, 5.2], [6, 8.0, 9.5], [6, 8.4, 9.5], 22, 24); cam.position.x += Math.sin(t * 40) * 0.03;
    };
  },
  // 26 "Cal! Come to Lost Property. Now!"  — close-up over the microphone: Mara shouting into it, then listening, worry creeping in.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 54 }); const A = mara(S, 'determined', [3.4, 0, -4.9]);
    return (t, dur) => { env.update(t); const done = dur * 0.78;
      A.pose(ps(idle(t, 0.6), t < done ? talk(t, 1.6) : {}, hit([[0, { rFwd: 60, lFwd: 60, rUp: -16, lUp: -16, lean: 16, nod: -2 }], [dur * 0.5, { rFwd: 62, lFwd: 62, rUp: -16, lUp: -16, lean: 20, nod: -6 }], [done + 0.2, { rFwd: 58, lFwd: 58, rUp: -16, lUp: -16, lean: 10, nod: -14, turn: 16 }]], t))); A.setFace(t < done ? 'determined' : 'worried');
      faceCam(cam, sm(t, 0, dur), [3.4, 4.55, -4.4], 0, { dist: 6.8, lens: 34, side: 1.4, up: 0.5, push: 1.0, look: -0.3 });
    };
  },
  // 27 "Nobody came."  — low wide from the doors: the big hall, Mara tiny and still behind her counter under the clock (5:55)… and one pigeon waddles in across the foreground.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 55 }); const A = mara(S, 'worried', [1.6, 0, -4.9]); const R = cartRig(S, 6.4, 2.2, true); const P = pip(S, 'bored', [10.3, 0, 2.2], -80);
    const pg = pigeon(S, { s: 1.4 }); const kf = fill(S, [0, 2.5, 8], 6, 0xffe2c0, 7);
    return (t, dur) => { env.update(t); pg.position.set(lerp(-1.6, 0.9, t / dur), 0, 5.6); pg.rotation.y = Math.PI / 2; pg.userData.update(t, 'walk');
      A.pose(ps(idle(t, 0.6), COUNTER, hit([[0, { nod: -6 }], [dur * 0.6, { nod: 16, lean: 4 }]], t))); A.setFace(t > dur * 0.5 ? 'sad' : 'worried');
      P.pose(ps(idle(t, 1, 3), { lFwd: 60, lUp: -10, nod: 22, rUp: 26 }));
      camPath(cam, sm(t, 0, dur), [0.9, 1.9, 14.6], [0.7, 2.0, 14.0], [0.6, 4.2, -4], [0.6, 4.4, -4], 24, 25);
    };
  },
  // 28 "Then Pip the porter took the cart."  — Pip leans into the handle and wheels the cart off toward the doorway; Mara reaches after it.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 55 }); const R = cartRig(S, 7.3, 2.2); const P = pip(S, 'neutral', [3.6, 0, 2.2], 90); const A = mara(S, 'worried', [-0.9, 0, 2.6], 70);
    return (t, dur) => { env.update(t); const go = sm(t, dur * 0.25, dur * 1.2) * 5.5; R.c.position.x = 7.3 + go; R.c.userData.roll(go); P.root.position.x = 3.6 + go; R.e.userData.update(t);
      P.pose(ps(go > 0.02 ? walk(t, 1.2, 30) : idle(t), anticipate(t, dur * 0.25), PUSH, { lean: go > 0.02 ? 8 : 0 })); P.setFace(t > dur * 0.5 ? 'nervous' : 'neutral');
      const x = -0.9 + sm(t, dur * 0.4, dur) * 1.8; A.root.position.x = x; A.pose(ps(idle(t, 0.6), t > dur * 0.4 ? walk(t, 0.9, 20) : {}, hit([[dur * 0.2, { rFwd: 10 }], [dur * 0.55, { rFwd: 84, rUp: 10, lean: 12, nod: -4 }]], t), { turn: -30 })); A.setFace(t > dur * 0.45 ? 'shock' : 'worried');
      camPath(cam, sm(t, 0, dur), [1.6, 4.9, 13.6], [3.0, 4.6, 12.8], [2.8, 3.7, 2.2], [4.0, 3.7, 2.2], 20, 21);
    };
  },
  // 29 "Rules are rules, Miss Mara. You wrote them."  — close on Pip, one hand still on the cart handle: an apologetic shrug, a nod at the RULE 1 board, a wince.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 56 }); const R = cartRig(S, 9.6, 2.2); const P = pip(S, 'nervous', [5.9, 0, 2.2], -58);
    return (t, dur) => { env.update(t);
      P.pose(ps(idle(t, 1), talk(t, 1.1), hit([[0, { lUp: 34, lFwd: -20, rUp: 6 }], [dur * 0.3, { lUp: 34, lFwd: -20, rUp: 40, rFwd: 28, tilt: 9 }], [dur * 0.62, { lUp: 34, lFwd: -20, rUp: 30, rFwd: 70, turn: 30, tilt: 2 }], [dur * 0.9, { lUp: 34, lFwd: -20, rUp: 30, rFwd: 20, tilt: -6, nod: 6 }]], t))); P.setFace(t < dur * 0.55 ? 'nervous' : 'fakesmile');
      faceCam(cam, sm(t, 0, dur), [5.9, 4.5, 2.2], -58, { dist: 6.8, lens: 36, side: 0.7, push: 0.8, look: -0.25 });
    };
  },
  // 30 "Four minutes to six."  — low angle up at the hanging clock: the minute hand clunks onto 5:56, the second hand ticking on.
  (S, cam) => {
    const env = hall(S, { h: 5, m: 55 });
    return (t, dur) => { env.update(t); const c = dur * 0.35; env.clock.set(5, 55 + hn([[c, 0], [c + 0.16, 1]], t));
      camPath(cam, sm(t, 0, dur), [1.5, 4.3, -0.2], [2.0, 5.0, -1.6], [2.9, 8.4, -6], [2.9, 8.5, -6], 34, 40); shake(cam, t, c + 0.1, 0.25);
    };
  },
];
