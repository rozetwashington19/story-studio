import * as THREE from 'three';
import { POSES, HUG, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky,
  sugarStreet, gingerParlor, giantKitchen, giantHand, VILLAGE_S, bird } from '../../engine/kit.js';
import { clove, gus, fudd, mayor, towny, mk, looseBow, CLOVE, CLOVE_NOBOW, KID, GRAN, GUS_Z, DECK_Y, CHIM,
  ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, rumble, clamp01 } from './common.js';
import { handAt, crackAbove, liftHouse } from './shots_a.js';

const HIPS = POSES.hips;
const LIFT = 12;   // how high the hand holds the house during the roof scenes
const sway = (t) => Math.sin(t * 1.3) * 0.025;
// Clove's deck position while the house is lifted
const DX = -2.2, DZ = GUS_Z + 0.4;
// a giant face peering through the crack: an avatar with only its head shown, centred at `at`
function giantHead(S, preset, name, face, at, s = 9, tiltX = 0.35, ry = 0) {
  const A = mk(S, preset, name, face, [0, 0, 0], ry, s); A.root.rotation.x = tiltX;
  const keep = new Set(); A.headMesh.traverse(o => keep.add(o)); A.root.traverse(o => { if (o.isMesh && !keep.has(o)) o.visible = false; });
  A.blob && (A.blob.visible = false);
  const place = () => { A.root.updateMatrixWorld(true); const h = A.headMesh.getWorldPosition(new THREE.Vector3()); A.root.position.add(new THREE.Vector3(...at).sub(h)); };
  place(); A.place = place; return A;
}
// the lifted night street + hand + Clove on the deck (shared by lines 30–38)
function roofScene(S, { crack = 1, face = 'scared', lift = LIFT } = {}) {
  const env = sugarStreet(S, { time: 'night', frost: 1 }); const H = giantHand(S); liftHouse(env, H, lift, 1);
  const c = crackAbove(S, CHIM[0], CHIM[2] - 6, crack, { y: 110, w: 100, h: 30, target: [0, lift + 12, GUS_Z] });
  const C = clove(S, face, [DX, lift + DECK_Y, DZ], 0); allow(S, ['clove', 'gus deck']);
  fill(S, [DX, lift + DECK_Y + 7, DZ + 6], 22, 0xffe2c0, 16);
  return { env, H, c, C, lift };
}

export const SHOTS_B = [
  // 24 "Eight fifty-nine. The whole street went quiet."  — night, empty street, lamps flicker; Clove alone facing the frosted house, hugging herself
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night', frost: 1 });
    const C = clove(S, 'worried', [-1.2, 0, 1.5], 175);
    return (t, dur) => { env.update(t); env.lamps.forEach((l, i) => { l.intensity *= (t > dur * 0.4 && i === 1 && Math.sin(t * 40) > 0.3) ? 0.2 : 1; });
      C.pose(addPose(idle(t, 1), { rFwd: 70, lFwd: 70, rUp: -42, lUp: -42, nod: -10 + Math.sin(t) * 3, bob: Math.sin(t * 7) * 0.01 }));
      camPath(cam, t / dur, [-6, 3.6, 13], [-4.5, 3.8, 10.5], [0, 6.5, -8], [0, 7.5, -10], 22, 24);
    };
  },
  // 25 "Then the sky cracked open."  — cut 1: low from behind Clove, the sky above the house splits with light; cut 2: her face lit warm from above, shocked
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night', frost: 1 });
    const C = clove(S, 'scared', [-1.2, 0, 1.5], 175); const c = crackAbove(S, 3, -22, 0, { y: 96, w: 90, h: 22, target: [0, 0, 0] });
    const warm = fill(S, [-1.2, 12, 0], 0, 0xffe0b0, 20);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.5]); const o = sm(t, 0, dur * 0.4); c.open(o); warm.intensity = o * 40;
      C.pose(addPose(idle(t, 1), hit([[0, { nod: -10 }], [dur * 0.25, { nod: -42, lean: -6, rFwd: 30, lFwd: 30 }], [dur, { nod: -45, lean: -8, rFwd: 40, lFwd: 25 }]], t))); if (t > dur * 0.3) C.setFace('shock');
      if (k === 0) camPath(cam, u, [-5, 1.4, 12], [-5.2, 1.3, 11.5], [0, 18, -14], [2, 50, -22], 20, 20);
      else { const h = headOf(C).toArray(); camPath(cam, u, [h[0] + 1.2, h[1] + 0.8, h[2] - 6.8], [h[0] + 1.0, h[1] + 0.7, h[2] - 6.0], [h[0], h[1], h[2]], [h[0], h[1] + 0.05, h[2]], 30, 32); }
    };
  },
  // 26 "The hand came down, bigger than the bakery."  — wide past the bakery's giant cupcake: the hand lowers out of the light onto Clove's house; Clove tiny in the road
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night', frost: 1 }); const H = giantHand(S); crackAbove(S, CHIM[0], CHIM[2] - 6, 1, { y: 110, w: 100, h: 30, target: [0, 0, GUS_Z] });
    const C = clove(S, 'scared', [-3, 0, 2], 150);
    return (t, dur) => { env.update(t); const down = hn([[0, 46], [dur, 2]], t, x => 1 - Math.pow(1 - x, 2.2)); handAt(H, CHIM, down); H.grip(0);
      C.pose(addPose(idle(t, 1), { nod: -40, lean: -6, rFwd: 25 + Math.sin(t * 2) * 5, root: 0 })); C.root.position.z = 2 + sm(t, 0, dur) * 1.5;
      camPath(cam, t / dur, [-50, 4, 22], [-48, 3.6, 21], [-14, 22, -14], [-12, 16, -14], 20, 20); rumble(cam, t, 0.3);
    };
  },
  // 27 "It wrapped around our chimney."  — close on the chimney: the giant fingers close around it, icing cracks and crumbs drop
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night', frost: 1 }); const H = giantHand(S); crackAbove(S, CHIM[0], CHIM[2] - 6, 1, { y: 110, w: 100, h: 30, target: [0, 0, GUS_Z] });
    const crumbs = []; for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xfbf8f2 : 0x9a5424 })); S.add(c); crumbs.push(c); }
    fill(S, [10, 18, -6], 26, 0xffe0c0, 18);
    return (t, dur) => { env.update(t); handAt(H, CHIM, 2 - sm(t, 0, dur * 0.3) * 2); const g = sm(t, dur * 0.2, dur * 0.75); H.grip(g);
      crumbs.forEach((c, i) => { const u = clamp01((t - dur * 0.5) / dur * 2 - i * 0.02); c.visible = u > 0; c.position.set(CHIM[0] - 1 + (i % 5) * 0.5, CHIM[1] - 1 - u * u * 8, CHIM[2] + 1.2 + (i % 3) * 0.4); c.rotation.set(t * 5 + i, t * 3, 0); });
      camPath(cam, t / dur, [16, 18, 8], [15, 17.5, 6.5], [CHIM[0], CHIM[1] + 3, CHIM[2]], [CHIM[0], CHIM[1] + 1.5, CHIM[2]], 22, 24); if (t > dur * 0.6) rumble(cam, t, 0.4);
    };
  },
  // 29 "The floor tilted. We were lifting off!"  — cut 1: the parlour tips, jars slide, Clove and Gus stagger with arms out; cut 2: outside, the whole house leaves the ground
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night', frost: 1 }); const H = giantHand(S); crackAbove(S, CHIM[0], CHIM[2] - 6, 1, { y: 110, w: 100, h: 30, target: [0, 0, GUS_Z] });
    const crumbs = []; for (let i = 0; i < 20; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshStandardMaterial({ color: i % 3 ? 0xa8602a : 0xfbf8f2 })); S.add(c); crumbs.push(c); }
    // the parlour, built 400 units away
    const P = new THREE.Group(); P.position.set(400, 0, 0); S.add(P); const pin = gingerParlor(P, { night: true });
    const G = gus(P, 'scared', [-3.4, 0, -3.6], 20); const C = clove(P, 'scared', [3.4, 0, -3.4], -20);
    return (t, dur) => { env.update(t); pin.update(t); const [k, u] = seg(t, dur, [0.45]);
      if (k === 0) { const a = hn([[0, 0], [dur * 0.35, 10]], t); pin.tilt(a); const arms = { rUp: 80, lUp: 80, lean: 6, bodyTilt: -a * 0.8 };
        C.pose(addPose(idle(t, 1), addPose(arms, { bob: Math.sin(t * 9) * 0.05, turn: -15 }))); G.pose(addPose(idle(t, 1), addPose(arms, { turn: 15 }))); C.root.position.x = 3.4 + a * 0.08; G.root.position.x = -3.4 + a * 0.05;
        camPath(cam, u, [400, 5.5, 11], [400, 5.6, 10], [400, 4, -2], [400, 4, -2], 18, 18); cam.rotation.z += a * 0.6 * D; }
      else { const lift = Math.pow(u, 1.4) * 9; liftHouse(env, H, lift, 1); env.houses.gus.g.rotation.z = sway(t) * 2;
        crumbs.forEach((c, i) => { const v = (u * 1.6 + i / 20) % 1; c.position.set(-5 + (i * 3.3) % 11, lift - v * (lift + 0.5), GUS_Z + (i % 7) - 3); c.rotation.set(t * 4 + i, t * 2, 0); c.visible = lift > 0.3; });
        camPath(cam, u, [-14, 2.0, 18], [-13, 2.6, 16], [0, 7, GUS_Z], [0, 11, GUS_Z], 20, 20); rumble(cam, t, 0.6); }
    };
  },
  // 30 "I climbed onto the roof,"  — the hatch: Clove pulls herself up onto the roof deck, wind in her hair, the town far below
  (S, cam) => {
    const R = roofScene(S, { face: 'determined' }); const { env, C, H } = R;
    return (t, dur) => { env.update(t); env.houses.gus.g.rotation.z = sway(t); const u = sm(t, 0, dur * 0.65);
      C.root.position.set(DX + 1.0, LIFT + DECK_Y - 3.4 * (1 - u), DZ + 0.2 - 0.2 * u);
      C.pose(addPose(idle(t, 1), u < 0.99 ? { rUp: 150 - u * 120, lUp: 150 - u * 120, rLeg: 60 * (1 - u), nod: -15 } : { lFwd: 30, rUp: 30, nod: -20 }));
      camPath(cam, t / dur, [DX - 6, LIFT + DECK_Y + 4.5, DZ + 8.5], [DX - 5.4, LIFT + DECK_Y + 4.2, DZ + 7.6], [DX + 1, LIFT + DECK_Y + 2.5, DZ], [DX + 1, LIFT + DECK_Y + 3.6, DZ], 24, 25);
    };
  },
  // 31 "and I yelled at the sky."  — low angle from the deck: Clove plants her feet and yells up at the giant hand and the light
  (S, cam) => {
    const R = roofScene(S, { face: 'angry' }); const { env, C } = R; C.root.position.x = DX + 0.6;
    return (t, dur) => { env.update(t); env.houses.gus.g.rotation.z = sway(t);
      C.pose(addPose(idle(t, 1), addPose(anticipate(t, dur * 0.3), hit([[0, { nod: -30 }], [dur * 0.35, { nod: -45, rUp: 40, lUp: 40, rFwd: 40, lFwd: 40, lean: -10 }], [dur, { nod: -48, rUp: 50, lUp: 50, rFwd: 30, lFwd: 30, lean: -12 }]], t))));
      camPath(cam, t / dur, [DX + 6, LIFT + DECK_Y + 0.6, DZ + 12], [DX + 5.4, LIFT + DECK_Y + 0.4, DZ + 11], [DX + 1.5, LIFT + DECK_Y + 8, DZ - 2], [DX + 2.5, LIFT + DECK_Y + 11, DZ - 4], 20, 20);
    };
  },
  // 32 "'Take me instead! Leave my grandpa alone!'"  — close-up: Clove yelling up into the light, hair whipping, the hand looming behind (HOOK source)
  (S, cam) => {
    const R = roofScene(S, { face: 'angry' }); const { env, C } = R; C.root.position.x = DX + 0.6;
    return (t, dur) => { env.update(t); env.houses.gus.g.rotation.z = sway(t); const h = headOf(C).toArray();
      C.pose(addPose(idle(t, 1), addPose(talk(t, 1.4), { nod: -32, rUp: 35, lUp: 35, rFwd: 20, lFwd: 20, lean: -8, bob: Math.abs(Math.sin(t * 6)) * 0.04 })));
      if (t > dur * 0.6) C.setFace('determined');
      camPath(cam, t / dur, [h[0] - 4.2, h[1] - 0.6, h[2] + 6.4], [h[0] - 3.6, h[1] - 0.7, h[2] + 5.4], [h[0] + 0.6, h[1] + 1.0, h[2]], [h[0] + 0.6, h[1] + 1.1, h[2]], 26, 28); rumble(cam, t, 0.25);
    };
  },
  // 33 "The hand stopped."  — the sway dies; silence; slow push up the giant still fingers, Clove breathing hard below
  (S, cam) => {
    const R = roofScene(S, { face: 'worried' }); const { env, C } = R;
    return (t, dur) => { env.update(t); env.houses.gus.g.rotation.z = sway(t) * (1 - sm(t, 0, dur * 0.4));
      C.pose(addPose(idle(t, 1.4), { nod: -40, rFwd: 25, lFwd: 25, bob: Math.sin(t * 5) * 0.03 }));
      camPath(cam, t / dur, [DX - 4, LIFT + DECK_Y + 2, DZ + 9], [DX - 3.4, LIFT + DECK_Y + 2.4, DZ + 8], [CHIM[0] - 2, LIFT + DECK_Y + 6, CHIM[2]], [CHIM[0] - 1, LIFT + DECK_Y + 10, CHIM[2]], 20, 22);
    };
  },
  // 34 "Then a voice rolled down, louder than thunder."  — the light pulses, everything shakes; Clove covers her ears
  (S, cam) => {
    const R = roofScene(S, { face: 'scared' }); const { env, C, c } = R;
    return (t, dur) => { env.update(t); const boom = sm(t, dur * 0.15, dur * 0.3) * (1 - sm(t, dur * 0.7, dur)); c.open(1 + boom * 0.4 * Math.abs(Math.sin(t * 14)), 900 + boom * 900);
      C.pose(addPose(idle(t, 1), hit([[0, {}], [dur * 0.22, { rFwd: 140, lFwd: 140, rUp: 40, lUp: 40, nod: 10, bob: -0.25, lean: 10 }], [dur, { rFwd: 140, lFwd: 140, rUp: 42, lUp: 42, nod: 6, bob: -0.25, lean: 8 }]], t)));
      if (t > dur * 0.2) C.setFace('shock');
      camPath(cam, t / dur, [DX + 3.5, LIFT + DECK_Y + 4.2, DZ + 7], [DX + 3.0, LIFT + DECK_Y + 4.0, DZ + 6.2], [DX, LIFT + DECK_Y + 3.8, DZ], [DX, LIFT + DECK_Y + 3.9, DZ], 26, 27);
      if (boom > 0.05) { cam.position.x += Math.sin(t * 50) * 0.18 * boom; cam.position.y += Math.sin(t * 41) * 0.18 * boom; }
    };
  },
  // 35 "'Grandma, look! There's a tiny person on it!'"  — from the deck: an enormous face (the kid) leans into the light and peers down, delighted
  (S, cam) => {
    const R = roofScene(S, { face: 'shock' }); const { env, C } = R;
    const K = giantHead(S, KID, 'giantkid', 'awe', [CHIM[0] + 24, 52, CHIM[2] - 26], 9, 0.45, -25); const kl = fill(S, [CHIM[0] + 20, 46, CHIM[2] + 2], 160, 0xffe0c0, 60);
    return (t, dur) => { env.update(t);
      const p0 = [CHIM[0] + 24, 52 + (1 - sm(t, 0, dur * 0.35)) * 12, CHIM[2] - 26]; K.root.position.set(0, 0, 0); K.root.rotation.x = 0.45; K.headMesh.rotation.y = Math.sin(t * 1.5) * 0.08;
      K.root.updateMatrixWorld(true); const h = K.headMesh.getWorldPosition(new THREE.Vector3()); K.root.position.copy(new THREE.Vector3(...p0).sub(h));
      K.pose(talk(t, 1)); if (t > dur * 0.4) K.setFace('delighted');
      C.pose(addPose(idle(t, 1), { nod: -50, lean: -10, rFwd: 30, lFwd: 30 }));
      camPath(cam, t / dur, [CHIM[0] + 12, LIFT + DECK_Y + 2, DZ + 12], [CHIM[0] + 12.5, LIFT + DECK_Y + 1.8, DZ + 11], [CHIM[0] + 20, 40, CHIM[2] - 20], [CHIM[0] + 22, 46, CHIM[2] - 24], 22, 24);
    };
  },
  // 37 "'That one's too pretty, sweetheart."  — the grandma's giant face, kind, talking; the fingers loosen a little
  (S, cam) => {
    const R = roofScene(S, { face: 'worried' }); const { env, C, H } = R;
    const G = giantHead(S, GRAN, 'giantgran', 'softsmile', [-12, 60, CHIM[2] - 24], 9.5, 0.45, 12); fill(S, [-10, 52, CHIM[2] + 2], 170, 0xffe0c0, 60);
    return (t, dur) => { env.update(t); env.houses.gus.g.rotation.z = sway(t) * 0.4; H.grip(1 - sm(t, dur * 0.4, dur) * 0.12);
      G.pose(talk(t, 1)); C.pose(addPose(idle(t, 1), { nod: -48, lean: -8 }));
      camPath(cam, t / dur, [DX - 4, LIFT + DECK_Y + 4, DZ + 10], [DX - 4.5, LIFT + DECK_Y + 5, DZ + 8.5], [-10, 54, CHIM[2] - 22], [-11, 58, CHIM[2] - 23], 24, 28);
    };
  },
  // 38 "Let's keep it for next year.'"  — Clove's face: fear melting into relief as the house starts to sink
  (S, cam) => {
    const R = roofScene(S, { face: 'worried' }); const { env, C, H } = R;
    return (t, dur) => { const lift = LIFT - sm(t, dur * 0.3, dur) * 2.5; liftHouse(env, H, lift, 0.9); C.root.position.y = lift + DECK_Y; env.update(t);
      const h = headOf(C).toArray(); C.pose(addPose(idle(t, 1), { nod: hn([[0, -40], [dur * 0.6, -20]], t), lean: -4 })); if (t > dur * 0.45) C.setFace('relieved');
      camPath(cam, t / dur, [h[0] + 2.2, h[1] - 0.6, h[2] + 6.6], [h[0] + 1.8, h[1] - 0.6, h[2] + 5.6], [h[0], h[1] - 0.1, h[2]], [h[0], h[1], h[2]], 32, 34);
    };
  },
  // 39 "The hand set us down, gentle as snow."  — wide: the house settles onto the street in a puff of sugar; the fingers open, the hand rises into the light, the crack closes
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night', frost: 1 }); const H = giantHand(S); const c = crackAbove(S, CHIM[0], CHIM[2] - 6, 1, { y: 110, w: 100, h: 30, target: [0, 0, GUS_Z] });
    const C = clove(S, 'relieved', [DX, DECK_Y, DZ], 0); allow(S, ['clove', 'gus deck']);
    const puff = []; for (let i = 0; i < 26; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, roughness: 1 })); S.add(p); puff.push(p); }
    return (t, dur) => { env.update(t); const lift = 9.5 * (1 - sm(t, 0, dur * 0.4)); const g = 1 - sm(t, dur * 0.42, dur * 0.55); const up = Math.pow(sm(t, dur * 0.55, dur), 1.5) * 60;
      env.houses.gus.g.position.y = lift; handAt(H, CHIM, lift + up); H.grip(g); C.root.position.y = lift + DECK_Y; c.open(1 - sm(t, dur * 0.75, dur));
      const pu = sm(t, dur * 0.36, dur * 0.8); puff.forEach((p, i) => { const a = i / 26 * Math.PI * 2; p.position.set(Math.cos(a) * (7 + pu * 6), 0.6 + pu * 1.5 * (i % 3) / 2, GUS_Z + Math.sin(a) * (6 + pu * 5)); p.scale.setScalar(0.4 + pu * 1.4); p.material.opacity = 0.6 * (pu > 0 ? 1 - pu : 0); p.visible = pu > 0; });
      C.pose(addPose(idle(t, 1), { nod: -30 + sm(t, dur * 0.5, dur) * 20, rFwd: 20 }));
      camPath(cam, t / dur, [-15, 6, 23], [-13.5, 5.5, 22], [0, 13 - sm(t, 0, dur * 0.4) * 4, GUS_Z], [0, 14, GUS_Z], 20, 20); if (t > dur * 0.35 && t < dur * 0.45) shake(cam, t, dur * 0.38, 0.6);
    };
  },
  // 40 "Grandpa hugged me so hard my bow fell off."  — Gus bursts out of the door and hugs Clove; her pink bow pops off and tumbles to the road
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night', frost: 1 }); allow(S, ['clove', 'gus']);
    const C = mk(S, CLOVE_NOBOW, 'clove', 'relieved', [0.6, 0, -3.0], 180, 0.95); const G = gus(S, 'teary', [0.4, 0, -7.6], 0); const bow = looseBow(S);
    fill(S, [0.6, 7, 3], 16, 0xffe2c0, 14);
    return (t, dur) => { env.update(t); const u = sm(t, 0, dur * 0.3); G.root.position.z = -7.6 + u * 2.15;
      G.pose(u < 0.98 ? addPose(walk(t, 9, 1), { rFwd: 60, lFwd: 60 }) : addPose(idle(t, 1), addPose(HUG, { nod: 18, bob: -0.05 })));
      C.root.rotation.y = hn([[0, 180], [dur * 0.25, 175]], t) * D; C.pose(addPose(idle(t, 1), t > dur * 0.28 ? addPose(HUG, { nod: 8, bob: Math.sin(t * 6) * 0.02 }) : { rFwd: 40, lFwd: 40 }));
      if (t > dur * 0.4) { C.setFace('teary'); G.setFace('cry'); }
      C.root.updateMatrixWorld(true); const hp = C.headMesh.localToWorld(new THREE.Vector3(0.35, 0.62, 0.15)); const b = clamp01((t - dur * 0.33) / (dur * 0.45));
      bow.position.set(hp.x + b * 1.4, Math.max(0.15, hp.y + Math.sin(b * Math.PI) * 1.2 - b * b * (hp.y + 0.5)), hp.z + b * 1.4); bow.rotation.set(b * 8, b * 5, 0);
      camPath(cam, t / dur, [5.5, 5.6, 4.5], [4.8, 5.3, 3.6], [0.5, 4.6, -4.2], [0.6, 4.4, -4.0], 28, 30);
    };
  },
  // 41 "Next day, the town threw us a party."  — daytime party: confetti, the crowd dancing, Fudd and the Mayor cheering, Clove and Gus in the middle
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day', frost: 0 });
    const C = clove(S, 'laugh', [-3.4, 0, -2.4], 10); const G = gus(S, 'grin', [3.4, 0, -2.6], -10);
    const F = fudd(S, 'laugh', [-10.4, 0, 0.8], 30); const Mr = mayor(S, 'delighted', [10.2, 0, 0.6], -30);
    const T = [towny(S, 0, 'laugh', [-14.6, 0, -3.4], 40), towny(S, 2, 'delighted', [14.4, 0, -3.6], -40), towny(S, 3, 'grin', [-6.8, 0, 4.8], 15)];
    const conf = []; for (let i = 0; i < 70; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.18), new THREE.MeshStandardMaterial({ color: [0xff3a6a, 0x3ad8a8, 0xffd23a, 0x9a5aff, 0x3aa8ff][i % 5], side: THREE.DoubleSide })); S.add(c); conf.push(c); }
    return (t, dur) => { env.update(t);
      const dance = (A, ph, k = 1) => A.pose(addPose(idle(t + ph, 1), { rUp: 120 + Math.sin(t * 7 + ph) * 30 * k, lUp: 120 - Math.sin(t * 7 + ph) * 30 * k, bob: Math.abs(Math.sin(t * 7 + ph)) * 0.2, bodyTurn: Math.sin(t * 3.5 + ph) * 12, rLeg: Math.max(0, Math.sin(t * 7 + ph)) * 20 }));
      dance(C, 0); dance(G, 1, 0.6); dance(F, 2); dance(Mr, 3); T.forEach((A, i) => dance(A, 4 + i));
      conf.forEach((c, i) => { const u = (t * 0.25 + i / 70) % 1; c.position.set(-13 + (i * 3.7) % 26 + Math.sin(t * 2 + i) * 0.8, 16 - u * 16, -6 + (i * 1.9) % 12); c.rotation.set(t * 3 + i, t * 2 + i, 0); });
      camPath(cam, t / dur, [0, 4.6, 21], [0, 5.2, 18.5], [0, 4.4, -2], [0, 4.6, -2], 17, 18);
    };
  },
  // 42 "Mister Fudd made his house pretty again."  — Fudd, proud, presents his house — now covered in candy; a pigeon lands on its roof
  (S, cam) => {
    const env = sugarStreet(S, { time: 'day' }); env.houses.fudd.pretty(1);
    const F = fudd(S, 'proud', [-16.6, 0, -4.8], 25); const b = bird(S, 0x8a8aa0); b.scale.setScalar(1.8);
    return (t, dur) => { env.update(t); const u = sm(t, dur * 0.1, dur * 0.7); b.position.set(-8 - u * 12, 22 - u * 9.8, -15); b.rotation.y = -90 * D; b.userData.flap(t, u < 0.98 ? 1 : 0);
      F.pose(addPose(idle(t, 1), hit([[0, {}], [dur * 0.3, { lUp: 100, lFwd: 30, turn: 30 }], [dur * 0.8, { lUp: 95, lFwd: 30, turn: 45, nod: -20 }]], t))); if (t > dur * 0.75) F.setFace('starstruck');
      camPath(cam, t / dur, [-10, 4.0, 10], [-11, 4.6, 8.5], [-18, 6.5, -8], [-19, 8.5, -10], 22, 23);
    };
  },
  // 43 "But now I know where the other houses went."  — night: Clove alone on the roof deck, staring up at the still moon; slow push in
  (S, cam) => {
    const env = sugarStreet(S, { time: 'night' }); const C = clove(S, 'thinking', [-1.0, DECK_Y, GUS_Z + 0.3], 15);
    fill(S, [1, DECK_Y + 6, GUS_Z + 5], 16, 0xffe2c0, 12);
    return (t, dur) => { env.update(t); const h = headOf(C).toArray();
      C.pose(addPose(idle(t, 0.8), { nod: -26, turn: -10 + Math.sin(t * 0.6) * 3 })); if (t > dur * 0.6) C.setFace('worried');
      camPath(cam, t / dur, [h[0] + 4, h[1] + 0.2, h[2] + 9], [h[0] + 2.6, h[1] + 0.1, h[2] + 6.4], [h[0] - 1, h[1] + 1.0, h[2] - 2], [h[0] - 1.6, h[1] + 1.6, h[2] - 3], 26, 32);
    };
  },
  // 44 "Our moon is a kitchen lamp."  — the same tiny Clove on her roof... the camera rises past the 'moon' and pulls back: it's a lamp over a kitchen table, the village is a gingerbread model
  (S, cam) => {
    const env = giantKitchen(S); const s = VILLAGE_S;
    const deck = new THREE.Vector3(0, env.mini.position.y + DECK_Y * s, env.mini.position.z + GUS_Z * s);
    const C = mk(S, CLOVE, 'clove', 'worried', [deck.x - 0.02, deck.y, deck.z + 0.05], 190, 0.95 * s);
    const K = mk(S, KID, 'kid', 'sleeping', [4.6, 0, -10.2], 0, 1.0);
    return (t, dur) => { env.update(t, cam); C.pose(addPose(idle(t, 0.8), { nod: -30 })); K.pose(addPose(idle(t, 1), { nod: 10, rFwd: 40, lFwd: 40 })); K.setFace(t > dur * 0.6 ? 'smile' : 'neutral');
      const [k, u] = seg(t, dur, [0.4]); env.halo.visible = k > 0;
      if (k === 0) camPath(cam, u, [deck.x + 0.12, deck.y + 0.2, deck.z + 0.75], [deck.x + 0.1, deck.y + 0.22, deck.z + 0.68], [0, 11.5, -6], [0, 11.5, -5.8], 18, 18);
      else { const v = sm(u, 0, 1); camPath(cam, v, [deck.x + 0.1, deck.y + 0.22, deck.z + 0.68], [0, 9.5, 19], [0, 11.5, -5.8], [0, 6.0, -4], 18, 22); }
    };
  },
  // 45 "And we are dessert."  — the giant kid lifts the Mayor's house off a plate and takes a big bite; Grandma smiles; the little village glows below
  (S, cam) => {
    const env = giantKitchen(S);
    const K = mk(S, KID, 'kid', 'mischief', [4.0, 0, -10.0], -12, 1.1); const G = mk(S, GRAN, 'gran', 'softsmile', [-4.2, 0, -10.0], 15, 1.12);
    const piece = env.eaten.g; const pl = env.plate; let carried = false;
    return (t, dur) => { env.update(t, cam);
      const r = hit([[0, { rFwd: 30 }], [dur * 0.25, { rFwd: 88, rUp: -12 }], [dur * 0.5, { rFwd: 150, rUp: -30, nod: 8 }], [dur, { rFwd: 148, rUp: -30, nod: 6 }]], t);
      K.pose(addPose(idle(t, 1), addPose(r, t > dur * 0.55 ? { nod: 4 + Math.abs(Math.sin(t * 10)) * 5 } : {})));
      if (t > dur * 0.25) { const p = pinky(K, 'R'); if (!carried) { S.attach(piece); carried = true; } piece.position.set(p.x, p.y + 0.05, p.z + 0.2); }
      env.bite.visible = false; if (t > dur * 0.55) { K.setFace('delighted'); piece.scale.setScalar(VILLAGE_S * 1.4 * (t > dur * 0.6 ? 0.75 : 1)); }
      G.pose(addPose(idle(t + 0.6, 1), addPose(lookAt(G, headOf(K)), { lFwd: 20 }))); if (t > dur * 0.6) G.setFace('laugh');
      camPath(cam, t / dur, [0.4, 5.6, 1.6], [0.6, 5.6, 0.4], [0.2, 5.2, -9], [0.4, 5.3, -9], 17, 18);
    };
  },
];
