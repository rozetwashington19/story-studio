import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, seg, hit, talk, lookAt, anticipate, sitOn, sitGround, pinky, T, T2,
  houseFront, street, dayLight, bakery, backyard, kidRoomDay, familyKitchen, park, lawnChair, beachUmbrella, room, interiorLight, pup, shovel, snowBurst, cerealBowl,
  petals, petalRiver, petalPile, petalCarpet, fishbowl, stopSign, drawing, sunnyPines } from '../../engine/kit.js';
import { ADA, WALT, DAD10, MOM10, BELL, DALE, TOWN, mk, ada, walt, dad, mom, bell, dale, ramp, sm, V, headOf, faceCam, fill, allowGround, allow, hold, hn, RUN, shower, PINK } from './common.js';

// a crosswalk on the street() set (road z -4..-18)
function crosswalk(S) { const w = std({ color: 0xf6f4ee, roughness: 0.6 }); for (let i = 0; i < 7; i++) box(S, [1.2, 0.03, 12], [-4.2 + i * 1.4, -0.08, -11], w, { r: 0, cast: false, solid: false }); }
// Biscuit the dog (cream with brown spots); vest = tiny safety vest
function biscuit(S, pos, ry = 0, vest = false) { const d = pup(S, { name: 'biscuit', col: 0xe8d0a0, spot: 0xfff6e8 }); d.root.position.set(...pos); d.root.rotation.y = ry * D;
  if (vest) { const v = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.2), std({ color: 0xff7a1a, roughness: 0.6 })); v.position.set(0, 1.35, 0.1); d.root.children[0].add(v); v.position.set(0, 0.1, 0.1); }
  return d; }
const pillow = (S, col = 0xf8f6ff) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.0), std({ color: col, roughness: 0.9 })); m.castShadow = true; g.add(m); S.add(g); return g; };
const homework = (S, [x, y, z]) => { const tx = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = 256; c.height = 330; const g = c.getContext('2d');
  g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, 256, 330); g.strokeStyle = '#9ab8e0'; g.lineWidth = 2; for (let y2 = 50; y2 < 330; y2 += 24) { g.beginPath(); g.moveTo(10, y2); g.lineTo(246, y2); g.stroke(); }
  g.fillStyle = '#2a2a3a'; g.font = '700 26px Inter'; g.fillText('MATH  p. 42', 20, 36); g.font = '22px Inter'; ['7 x 8 = 56', '9 x 6 = 54', '12 / 4 = 3', '6 x 7 = ?'].forEach((s, i) => g.fillText(s, 24, 96 + i * 48)); return c; })());
  tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.06), std({ map: tx })); m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.02, z); S.add(m); return m; };

export const SHOTS_A = [
  // 2 "In this world,"  — crane down over a sunny street of houses; a girl walking her bike path gets a soft petal shower from nowhere
  (S, cam) => {
    houseFront(S, { porch: true, sunPos: [-10, 15, 12] });
    const k = mk(S, TOWN[0], 'kid', 'smile', [6, 0, 5], -90); const sh = shower(S, k, { n: 90, seed: 2 });
    return (t, dur) => {
      camPath(cam, t / dur, [3, 15, 30], [2, 6.0, 19], [0, 8, -6], [2.5, 4.0, 4], 24, 26);
      k.root.position.x = 6 - t * 1.6; k.pose(addPose(walk(t, 1, 28), { turn: Math.sin(t * 1.5) * 10 })); sh(t, sm(t, 0.2, 1.4));
      if (t > dur * 0.6) k.setFace('delighted');
    };
  },
  // 3 "when someone misses you, petals fall on you."  — the girl stops, looks up as the petals start; holds out her hand and laughs
  (S, cam) => {
    houseFront(S, { porch: false });
    const k = mk(S, TOWN[0], 'kid', 'confused', [1.5, 0, 4], 15); const sh = shower(S, k, { n: 140, seed: 5, r: 1.3 });
    return (t, dur) => {
      faceCam(cam, t / dur, [1.5, 4.64, 4], 15, { dist: 8.8, lens: 30, side: 0.9, push: 1.6, look: -0.6 });
      sh(t + 2, 0.3 + 0.7 * ramp(t, 0.2, 1.2));
      k.pose(addPose(idle(t, 0.8), hit([[0.2, { nod: 0 }], [0.6, { nod: -30, rFwd: 40 }], [1.4, { nod: -24, rFwd: 70, rUp: 10 }], [2.2, { nod: -10, rFwd: 70, lFwd: 70, rUp: 10, lUp: 10 }]], t)));
      if (t > 0.7) k.setFace('awe'); if (t > dur * 0.62) k.setFace('laugh');
    };
  },
  // 4 "Out of nowhere. Wherever you are."  — cut a: the baker at the bakery window gets petals on her bread · cut b: a boy at the bus stop... in the rain of petals
  (S, cam) => {
    bakery(S);
    const b = mk(S, TOWN[1], 'baker', 'shock', [-2.5, 0, 1.2], 10); const sh = shower(S, b, { n: 110, seed: 7 });
    const g2 = new THREE.Group(); g2.position.x = 200; S.add(g2);
    const k = mk(S, TOWN[2], 'boy', 'bored', [200, 0, 2], -10); const sh2 = shower(S, k, { n: 110, seed: 8 });
    const bench = box(S, [5, 0.3, 1.4], [200, 1.4, -0.6], std({ map: T.planks(0x8a5a30) }), { r: 0.04, name: 'bench' });
    box(S, [60, 0.3, 30], [200, -0.15, 0], std({ map: T.concrete(0xb9b2a7) }), { r: 0, cast: false, name: 'ground' });
    allow(S, ['boy', 'bench']);
    return (t, dur) => {
      const [i, p] = seg(t, dur, [0.5]);
      if (i === 0) { camPath(cam, p, [-0.5, 5, 11.5], [-1.2, 5, 10], [-2.5, 4.2, 1.2], [-2.5, 4.4, 1.2], 30, 32);
        b.setFace(p > 0.4 ? 'laugh' : 'shock'); b.pose(addPose(idle(t, 0.8), hit([[0.1, POSES.rest], [0.5, { rFwd: 70, lFwd: 70, rUp: -15, lUp: -15, nod: -16 }]], t))); sh(t + 3, 1);
      } else { const u = t - dur * 0.5; camPath(cam, p, [201.5, 5.0, 12], [200.8, 4.8, 10.2], [200, 4.0, 2], [200, 4.2, 2], 30, 32);
        k.pose(addPose(idle(u, 0.8), hit([[0, { nod: 10 }], [0.4, { nod: -28, rUp: 30, lUp: 30 }]], u))); sh2(u + 4, 1); if (u > 0.4) k.setFace('starstruck'); }
    };
  },
  // 5 "Mister Bell, the crossing guard, is always covered."  — Bell in the crosswalk holding up his STOP sign under a thick pink shower; a kid crosses; petals pile at his feet
  (S, cam) => {
    dayLight(S, { sunPos: [-9, 15, 12], area: 26 }); street(S); crosswalk(S);
    const B = bell(S, 'proud', [-1, 0, -7.5], 15); const sign = stopSign(S); const sh = shower(S, B, { n: 220, seed: 9, r: 1.6, top: 3.6, floor: -0.1 });
    const pile = petalPile(S, [-1, -0.1, -7.5], { rx: 2.4, rz: 2.0, h: 0.9 }); pile.set(1);
    const k = mk(S, TOWN[2], 'boy', 'smile', [-8, 0, -11.5], 90);
    allow(S, ['bell', 'stopsign'], ['bell', 'petal pile']);
    return (t, dur) => {
      camPath(cam, t / dur, [4, 4.0, 9], [2.5, 4.4, 6.5], [-1, 4.2, -7.5], [-1, 4.6, -7.5], 28, 30);
      B.pose(addPose(addPose(idle(t, 0.7), { rFwd: 70, rUp: 12, nod: -4 }), lookAt(B, k.root.position.clone().setY(4.6))));
      hold(sign, B, 'R', [0, -0.75, 0.1]); sh(t, 1);
      if (Math.sin(t * 2) > 0.7) B.setFace('wink'); else B.setFace('proud');
      k.root.position.x = -8 + t * 3.6; k.pose(walk(t, 1, 28));
    };
  },
  // 6 "His dog Biscuit misses him all day."  — Biscuit on the porch, chin down, staring toward the road; tail barely wagging; slow push
  (S, cam) => {
    houseFront(S, { sunPos: [-10, 15, 12] });
    const d = biscuit(S, [-5, 0.6, -2.8], 20); allow(S, ['biscuit', 'porch deck']);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.3, 16), std({ color: 0xd83a3a })); bowl.position.set(-3.4, 0.75, -3.4); S.add(bowl);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.5, 2.6, 6.5], [-2.6, 2.2, 3.6], [-5, 1.6, -2.8], [-5, 1.7, -2.8], 32, 38);
      d.update(t * 0.25, 'sit'); d.head.rotation.x = 0.25 + Math.sin(t * 1.2) * 0.04; d.head.rotation.y = Math.sin(t * 0.8) * 0.15;
    };
  },
  // 7 "Miss Dale gets a few petals every summer."  — backyard in summer: she lounges in a striped lawn chair under an umbrella, a few petals drift down
  (S, cam) => {
    backyard(S);
    lawnChair(S, [0, 0], 0, { col: 0x2ab0b0 }); beachUmbrella(S, [-3.6, 0, 0.4], 0xff8a3a, 3.0);
    const d = dale(S, 'relieved', [0, 0, 0.6], 0); sitOn(d, 1.1); d.root.rotation.x = -40 * D * 0.5; const sh = shower(S, d, { n: 26, seed: 11, r: 1.4, top: 4, speed: 0.6 });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.6, 12), std({ color: 0xfff080, emissive: 0x806020, emissiveIntensity: 0.2 }));
    S.add(glass); allow(S, ['dale', 'chair'], ['dale', 'umbrella']);
    return (t, dur) => {
      camPath(cam, t / dur, [3.5, 4.4, 11.5], [2.4, 4.2, 9.5], [0, 2.8, 0.6], [0, 3.0, 0.6], 28, 30);
      d.pose(addPose(addPose({ rLeg: 80, lLeg: 80, lean: -10 }, idle(t, 0.5)), hit([[0.2, { rFwd: 30, rUp: -10 }], [0.9, { rFwd: 95, rUp: -12, nod: -10 }], [1.6, { rFwd: 60, rUp: -10 }]], t)));
      hold(glass, d, 'R', [0, 0.2, 0.1]); sh(t + 1, 1);
      if (t > dur * 0.5) d.setFace('smile');
    };
  },
  // 8 "She says it's her students. It's her goldfish."  — a: she beams and points at herself proudly (talk) · b: her apartment — a goldfish presses to the glass, staring at the door
  (S, cam) => {
    backyard(S); lawnChair(S, [0, 0], 0, { col: 0x2ab0b0 }); beachUmbrella(S, [-3.6, 0, 0.4], 0xff8a3a, 3.0);
    const d = dale(S, 'proud', [0, 0, 0.6], 0); sitOn(d, 1.1); d.root.rotation.x = -20 * D; const sh = shower(S, d, { n: 20, seed: 12, r: 1.4, top: 4, speed: 0.6 });
    allow(S, ['dale', 'chair'], ['dale', 'umbrella']);
    const G = new THREE.Group(); G.position.x = 300; S.add(G);
    // apartment corner at x=300: wall + window, table with the bowl, door at right
    box(S, [24, 0.3, 20], [300, -0.15, 0], std({ map: T.planks(0x8a6a4a) }), { r: 0, cast: false, name: 'floor' });
    box(S, [24, 10, 0.4], [300, 5, -6], std({ map: T.plaster(0xd8c8e0) }), { r: 0, cast: false });
    box(S, [3, 7, 0.3], [304.5, 3.5, -5.7], std({ map: T.planks(0x6a4a30) }), { r: 0.04, cast: false, name: 'door' });
    box(S, [2.4, 0.2, 2.0], [299, 2.6, -3.5], std({ map: T.planks(0xb07a48) }), { r: 0.04, name: 'table' }); box(S, [0.3, 2.5, 0.3], [299, 1.25, -3.5], std({ color: 0x5a3a2a }), { r: 0.05, name: 'tleg' });
    const fb = fishbowl(S, [299, 2.7, -3.5], 1.0); allow(S, ['fishbowl', 'table']);
    box(S, [1.6, 2.0, 0.06], [301.5, 5.5, -5.75], std({ map: T2.sign('', '#e8c8a0', '#fff') }), { r: 0, cast: false, solid: false });
    const pl = new THREE.PointLight(0xfff0d8, 9, 20, 1.6); pl.position.set(302, 6, 1); S.add(pl); S.add(new THREE.HemisphereLight(0xfff4e6, 0x5a4a40, 0.6));
    return (t, dur) => {
      const [i, p] = seg(t, dur, [0.5]);
      if (i === 0) { faceCam(cam, p, [0, 4.4, 0.6], 0, { dist: 7.2, lens: 32, side: 0.6, push: 0.8, look: -0.5 });
        d.pose(addPose(addPose({ rLeg: 80, lLeg: 80, lean: -6 }, talk(t, 0.8)), hit([[0.1, POSES.rest], [0.5, { rFwd: 120, rUp: -40, lFwd: 120, lUp: -40, nod: -6 }]], t))); sh(t + 2, 1);
      } else { const u = t - dur * 0.5; camPath(cam, p, [299.6, 4.0, 2.6], [299.4, 3.9, 1.6], [299, 3.6, -3.5], [299, 3.6, -3.5], 34, 38);
        fb.update(u, 1); fb.fish.rotation.y = Math.sin(u * 2) * 0.15; fb.fish.position.y = 1.0 + Math.sin(u * 3) * 0.03; }
    };
  },
  // 9 "I'm Ada. I'm eleven."  — her bedroom: petals drifting on her as she spins to camera and waves
  (S, cam) => {
    kidRoomDay(S); const carpet = petalCarpet(S, [0, 0, -2], [16, 12], { density: 1.2 }); carpet.set(1);
    const a = ada(S, 'grin', [0.5, 0, -3], 160); const sh = shower(S, a, { n: 90, seed: 13 });
    for (const [x, y, k] of [[-1.6, 6.2, 'rocket'], [2.6, 5.8, 'sun'], [6.2, 6.0, 'flower']]) { const d = drawing(S, k, 1.4); d.position.set(x, y, -8.75); }
    return (t, dur) => {
      faceCam(cam, t / dur, [0.5, 4.64, -3], 0, { dist: 8.2, lens: 32, side: 0.6, push: 1.2, look: -0.6 });
      a.root.rotation.y = (160 * (1 - sm(t, 0, 0.55))) * D;
      a.pose(addPose(addPose(idle(t, 0.8), talk(t, 0.3)), hit([[0.4, POSES.rest], [0.8, POSES.wave], [1.1, { ...POSES.wave, rUp: 150 }], [1.4, POSES.wave]], t)));
      sh(t + 3, 0.8); if (t > 1.3) a.setFace('smile');
    };
  },
  // 10 "And petals fall on me every single day."  — out the front door on the way to school: a steady pink column follows her down the path
  (S, cam) => {
    houseFront(S, { sunPos: [-10, 15, 12] });
    const a = ada(S, 'smile', [8.5, 0, -2], 0); const sh = shower(S, a, { n: 150, seed: 14 });
    const trail = petalCarpet(S, [8.5, 0, 4], [3.6, 16], { density: 0.6 }); trail.set(0.9);
    return (t, dur) => {
      const z = -2 + t * 2.6; a.root.position.z = z; a.pose(addPose(walk(t, 1, 26), { turn: Math.sin(t * 1.3) * 8 }));
      camPath(cam, t / dur, [12.5, 4.4, z + 9], [11.5, 4.6, z + 6 + 2.6 * dur * 0.1], [8.5, 3.8, -2], [8.5, 4.0, -2 + 2.6 * dur], 28, 30);
      cam.lookAt(8.5, 4.0, z); sh(t, 1);
      if (t > dur * 0.5) a.setFace('nervous');
    };
  },
  // 11 "But everyone who loves me is right here."  — kitchen: Mom and Dad on either side; Ada gestures to both, then shrugs up at the petals
  (S, cam) => {
    familyKitchen(S, { morning: true }); extendRoom(S);
    const m = mom(S, 'love', [-4.4, 0, 0.4], 25), d = dad(S, 'grin', [4.4, 0, 0.4], -25), a = ada(S, 'confused', [0, 0, 3.0], 0);
    const sh = shower(S, a, { n: 120, seed: 15 }); fill(S, [0, 7, 9], 40, 0xffe0c0, 24);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 5.6, 16.5], [0, 5.2, 15.0], [0, 3.8, 1.0], [0, 4.0, 1.0], 20, 21);
      a.pose(addPose(addPose(idle(t, 0.8), talk(t, 0.3)), hit([[0.2, POSES.rest], [0.6, { rUp: 40, lUp: 40, rFwd: 30, lFwd: 30, turn: 25 }], [1.2, { rUp: 40, lUp: 40, rFwd: 30, lFwd: 30, turn: -25 }], [1.9, { ...POSES.shrug, nod: -20 }]], t)));
      m.pose(addPose(idle(t, 0.7, 1), addPose(lookAt(m, headOf(a)), hit([[0.6, POSES.rest], [1.0, POSES.wave]], t))));
      d.pose(addPose(idle(t, 0.7, 2), addPose(lookAt(d, headOf(a)), hit([[1.1, POSES.rest], [1.5, { rUp: 40, rFwd: 60 }]], t))));
      sh(t + 1, 1); if (t > 1.9) a.setFace('confused'); else if (t > 0.5) a.setFace('smile');
    };
  },
  // 12 "At first, it was great."  — backyard: Ada spins with her arms out in a thick petal shower, laughing (low angle)
  (S, cam) => {
    backyard(S); const a = ada(S, 'laugh', [0, 0, 1.5], 0); const sh = shower(S, a, { n: 220, seed: 16, r: 2.0, top: 4 });
    const carpet = petalCarpet(S, [0, 0, 1.5], [10, 8], { density: 1 }); carpet.set(1);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 2.2, 10.5], [-2, 2.4, 10.0], [0, 4.6, 1.5], [0, 4.8, 1.5], 26, 28);
      a.root.rotation.y = t * 2.4; a.pose(addPose(idle(t, 0.8), { rUp: 95, lUp: 95, nod: -18, bob: Math.abs(Math.sin(t * 5)) * 0.1 }));
      sh(t + 2, 1, { spin: 1.4 });
    };
  },
  // 13 "I had petal pillow fights."  — bedroom: Ada vs Dad, pillows swing, pink bursts on every hit
  (S, cam) => {
    kidRoomDay(S); const carpet = petalCarpet(S, [0, 0, -2], [16, 12], { density: 1.3 }); carpet.set(1);
    const a = ada(S, 'mischief', [-2.5, 0, -1], 45), d = dad(S, 'laugh', [2.5, 0, -1], -45); fill(S, [0, 6.5, 5], 10, 0xffe0c0, 16);
    const pa = pillow(S), pd = pillow(S, 0xd8e8ff); const B = snowBurst(S, { n: 90, col: PINK, size: 0.2, seed: 5 });
    const sh = shower(S, a, { n: 70, seed: 17 });
    const hitsA = [0.55, 1.6], hitsD = [1.05, 2.1]; hitsA.forEach(h => B.fire(V([0.8, 5.0, -1]), h, { up: 4, spread: 3 })); hitsD.forEach(h => B.fire(V([-0.8, 5.0, -1]), h, { up: 4, spread: 3 }));
    allow(S, ['ada', 'dad']);
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 4.8, 11.5], [-0.5, 4.6, 9.5], [0, 4.2, -1], [0, 4.4, -1], 26, 28);
      const sw = (t0) => hit([[t0 - 0.35, { rUp: 150, rFwd: 40 }], [t0, { rUp: 60, rFwd: 110 }], [t0 + 0.25, { rUp: 40, rFwd: 70 }]], t);
      const swing = (hs, t1) => { let best = hs[0]; for (const h of hs) if (t > h - 0.4) best = h; return addPose(sw(best), anticipate(t, best - 0.2, 0.6)); };
      a.pose(addPose(idle(t, 0.8), swing(hitsA))); d.pose(addPose(idle(t, 0.8, 1), swing(hitsD)));
      hold(pa, a, 'R', [0, 0, 0]); pa.rotation.set(0, a.root.rotation.y, a.armR.rotation.x * 0.5); hold(pd, d, 'R', [0, 0, 0]); pd.rotation.set(0, d.root.rotation.y, 0);
      B.update(t); sh(t + 2, 0.7);
      a.setFace(hitsD.some(h => t > h && t < h + 0.35) ? 'laugh' : 'mischief'); d.setFace(hitsA.some(h => t > h && t < h + 0.35) ? 'shock' : 'laugh');
    };
  },
  // 14 "I built a petal fort in my room."  — a big pink dome on the floor; Ada pops up out of the top, grinning, with a flag drawing on a pencil
  (S, cam) => {
    kidRoomDay(S); const carpet = petalCarpet(S, [0, 0, -2], [16, 12], { density: 1.5 }); carpet.set(1);
    const fort = petalPile(S, [1.5, 0, -2.5], { rx: 3.4, rz: 3.0, h: 2.9 }); fort.set(1);
    const a = ada(S, 'grin', [1.5, 0, -2.5], 0); sitGround(a); const sh = shower(S, a, { n: 120, seed: 18, floor: 0 });
    const flag = drawing(S, 'rainbow', 0.8); const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), std({ color: 0x8a5a2a })); S.add(stick);
    allow(S, ['ada', 'petal pile'], ['ada', 'box 18x0.3x14*']);
    return (t, dur) => {
      camPath(cam, t / dur, [4.5, 3.2, 8.5], [3.2, 3.6, 6.5], [1.5, 2.8, -2.5], [1.5, 3.0, -2.5], 28, 32);
      const up = hn([[0, -0.6], [0.5, -0.6], [0.9, 0]], t); a.root.position.y = -1.5 + up;
      a.pose(addPose(addPose({ rLeg: 80, lLeg: 80 }, idle(t, 0.7)), hit([[0.8, POSES.rest], [1.2, { rUp: 150, rFwd: 20 }], [1.7, { rUp: 140, rFwd: 20 }]], t)));
      const hp = pinky(a, 'R'); stick.position.set(hp.x, hp.y + 0.6, hp.z); flag.position.set(hp.x + 0.45, hp.y + 1.0, hp.z); flag.rotation.y = Math.sin(t * 4) * 0.2;
      sh(t + 2, 1);
    };
  },
  // 15 "Then it got heavier."  — close on Ada in the yard: the shower thickens and speeds up; smile melts to worry
  (S, cam) => {
    backyard(S); const a = ada(S, 'smile', [0, 0, 1.5], 0); const sh = shower(S, a, { n: 320, seed: 19, r: 1.4, top: 3.0 });
    const pile = petalPile(S, [0, 0, 1.5], { rx: 2.4, rz: 2.0, h: 0.8 }); allow(S, ['ada', 'petal pile']);
    return (t, dur) => {
      faceCam(cam, t / dur, [0, 4.64, 1.5], 0, { dist: 7.0, lens: 34, side: 0.7, push: 1.2, look: -0.5 });
      const k = ramp(t, 0.1, dur * 0.8); sh(t + 2, 0.25 + 0.75 * k, { speed: 1 + k * 1.2 }); pile.set(0.2 + 0.8 * k);
      a.pose(addPose(idle(t, 0.8), hit([[0.3, { nod: -10 }], [1.0, { nod: -26 }], [1.6, { nod: -12, rFwd: 60, lFwd: 60, rUp: 30, lUp: 30 }]], t)));
      a.setFace(k < 0.35 ? 'smile' : k < 0.7 ? 'confused' : 'worried');
    };
  },
  // 16 "Petals in my cereal. Petals in my homework."  — a: kitchen table, petals rain into her cereal bowl · b: her homework page vanishes under petals, she brushes them off
  (S, cam) => {
    familyKitchen(S, { morning: true });
    const a = ada(S, 'disgusted', [0, 0, -5.2], 0); const bowl = cerealBowl(S, [-0.6, 2.82, -3.4]);
    const hw = homework(S, [1.3, 2.82, -3.0]);
    const P = petals(S, { n: 160, size: 0.28, seed: 20 }); const c1 = petalCarpet(S, [1.3, 2.84, -3.0], [2.2, 2.6], { density: 3, seed: 7 });
    const c0 = petalCarpet(S, [-0.6, 3.2, -3.4], [1.0, 1.0], { density: 4, seed: 8 });
    allow(S, ['ada', 'box*']);
    return (t, dur) => {
      const [i, p] = seg(t, dur, [0.5]);
      P(t + 3, V([0.3, 6.2, -3.4]), { k: 1, r: 1.5, top: 1.5, floor: 2.84, speed: 0.8 });
      if (i === 0) { camPath(cam, p, [-1.8, 6.0, 2.2], [-1.4, 5.6, 1.2], [-0.6, 3.4, -3.4], [-0.3, 4.4, -4.8], 30, 32);
        c0.set(ramp(p, 0, 0.8)); c1.set(0.3); a.setFace(p > 0.5 ? 'disgusted' : 'neutral');
        a.pose(addPose(idle(t, 0.7), { rFwd: 40, nod: 22 }));
      } else { camPath(cam, p, [2.8, 6.4, 1.0], [2.4, 6.2, 0.2], [1.3, 2.9, -3.0], [1.0, 3.6, -3.8], 32, 34);
        const u = t - dur * 0.5; c1.set(1 - 0.75 * ramp(u, 0.4, 0.9)); c0.set(1); a.setFace('pout');
        a.pose(addPose(idle(t, 0.7), addPose({ nod: 24 }, hit([[0.2, { rFwd: 40 }], [0.45, { rFwd: 60, rUp: -30 }], [0.7, { rFwd: 60, rUp: 20 }], [0.9, { rFwd: 60, rUp: -30 }]], u)))); }
    };
  },
  // 17 "Dad had to shovel me out of bed."  — Ada buried to the chin in her bed; Dad digs with a snow shovel, pink scoops fly
  (S, cam) => {
    kidRoomDay(S); const carpet = petalCarpet(S, [0, 0, -2], [16, 12], { density: 1.8 }); carpet.set(1);
    const a = ada(S, 'sleepy', [-5, 0, -6.4], 0); sitOn(a, 1.9);
    const pile = petalPile(S, [-5, 1.85, -4.6], { rx: 2.2, rz: 3.6, h: 2.4 }); pile.set(1);
    const d = dad(S, 'determined', [-0.6, 0, -2.0], -65); const sv = shovel(S); const B = snowBurst(S, { n: 80, col: PINK, size: 0.2, seed: 9 });
    [0.6, 1.5, 2.4].forEach(h => B.fire(V([-2.6, 3.4, -3.0]), h, { up: 5, spread: 2.2 }));
    const sh = shower(S, a, { n: 100, seed: 21, floor: 1.9 });
    allow(S, ['ada', 'box*'], ['ada', 'petal pile'], ['dad', 'shovel']);
    return (t, dur) => {
      camPath(cam, t / dur, [-6.8, 5.8, 7.5], [-6.0, 5.4, 6.0], [-3.0, 3.8, -3.8], [-3.4, 4.0, -4.4], 26, 28);
      const dig = (t % 0.9) / 0.9; d.pose(addPose(idle(t, 0.7), { rFwd: 40 + Math.sin(dig * 6.28) * 30, lFwd: 60 + Math.sin(dig * 6.28) * 30, rUp: -20, lUp: -20, lean: 8 + Math.sin(dig * 6.28) * 10 }));
      hold(sv, d, 'R', [0, 0, 0]); sv.rotation.set(-0.6 - Math.sin(dig * 6.28) * 0.4, d.root.rotation.y, 0);
      B.update(t); sh(t + 3, 0.8);
      a.pose(addPose(addPose({ rLeg: 90, lLeg: 90 }, idle(t, 0.5)), { tilt: Math.sin(t * 1.3) * 6 })); if (t > dur * 0.55) a.setFace('pout');
    };
  },
  // 18 "Who was missing me this much?"  — on the front porch steps, close-up: Ada stares up into the endless pink, thinking
  (S, cam) => {
    houseFront(S, { sunPos: [-10, 15, 12] });
    const a = ada(S, 'thinking', [-5, 0.6, -3.0], 10); const sh = shower(S, a, { n: 200, seed: 22, floor: 0.6 });
    allow(S, ['ada', 'porch deck']);
    return (t, dur) => {
      faceCam(cam, t / dur, [-5, 5.24, -3.0], 10, { dist: 6.6, lens: 36, side: -0.8, push: 1.4, look: -0.3, up: -0.4 });
      a.pose(addPose(addPose(idle(t, 0.6), { rFwd: 125, rUp: -30, nod: -16 }), { turn: Math.sin(t * 0.9) * 14 })); sh(t + 3, 1);
      if (t > dur * 0.6) a.setFace('worried');
    };
  },
  // 19 "I watched where the wind took them."  — sidewalk: the falling petals bend sideways in the breeze; Ada turns her head to follow them
  (S, cam) => {
    dayLight(S, { sunPos: [-9, 15, 12], area: 26 }); street(S); const a = ada(S, 'thinking', [-8, 0, 1], 20); const sh = shower(S, a, { n: 200, seed: 23, r: 1.2, top: 3.2 });
    return (t, dur) => {
      camPath(cam, t / dur, [-11.5, 4.4, 11], [-10.0, 4.6, 9.5], [-6.5, 4.0, 0], [-5.4, 4.4, -0.5], 26, 28);
      const w = ramp(t, 0.2, 1.2) * 1.4; sh(t + 2, 1, { wind: [w, -0.15 * w], speed: 0.9 });
      a.pose(addPose(idle(t, 0.7), lookAt(a, V([6 * ramp(t, 0.3, 1.8) - 7, 3.4, -2])))); a.root.rotation.y = (20 + 50 * sm(t, 0.6, 1.8)) * D;
      if (t > dur * 0.55) a.setFace('awe');
    };
  },
  // 20 "They always blew the same way."  — wide high shot: a pink ribbon of petals streams from her head down the street and off toward the horizon; she points
  (S, cam) => {
    dayLight(S, { sunPos: [-9, 15, 12], area: 26 }); street(S); const a = ada(S, 'determined', [-6, 0, 0], 70);
    const R = petalRiver(S, [[-6, 6.0, 0], [-2, 7.0, -1], [6, 7.6, -4], [18, 8.0, -9], [32, 9, -16], [50, 10, -24]], { n: 300, width: 0.9, speed: 0.12, size: 0.3 });
    const sh = shower(S, a, { n: 60, seed: 24 });
    return (t, dur) => {
      camPath(cam, t / dur, [-14, 9.5, 14], [-12, 8.5, 12], [-2, 5, -2], [6, 5.5, -6], 24, 24);
      R(t + 6, 1); sh(t, 0.5, { wind: [1.2, -0.2] });
      a.pose(addPose(idle(t, 0.7), hit([[0.3, POSES.rest], [0.8, { ...POSES.point, rUp: 20 }]], t)));
    };
  },
  // 21 "Past the park. Past the bakery."  — a: she runs through the park under the pink ribbon · b: dashes past the bakery, the baker waves
  (S, cam) => {
    park(S, { sunPos: [8, 20, 10] });
    const a = ada(S, 'determined', [-12, 0, 2], 90); const R = petalRiver(S, [[-24, 8, 0], [-8, 8.5, -1], [8, 8.6, -2], [26, 9, -3]], { n: 200, width: 0.8, speed: 0.15, size: 0.32 });
    allowGround(S, 'ada');
    const G = 300; bakery2(S, G);
    const a2 = ada(S, 'determined', [G - 10, 0, 3], 90); const b = mk(S, TOWN[1], 'baker', 'smile', [G + 2, 0, 0.4], 20);
    const R2 = petalRiver(S, [[G - 24, 8, 2], [G, 8.5, 1.5], [G + 26, 9, 1]], { n: 160, width: 0.8, speed: 0.15, size: 0.32 });
    return (t, dur) => {
      const [i, p] = seg(t, dur, [0.5]);
      if (i === 0) { const x = -12 + t * 7.5; a.root.position.x = x; a.pose(RUN(t)); camPath(cam, p, [x + 9, 4.2, 12], [x + 7, 4.4, 11], [x, 4, 2], [x, 4.6, 1.5], 26, 26); R(t + 4, 1); }
      else { const u = t - dur * 0.5; const x = G - 10 + u * 7.5; a2.root.position.x = x; a2.pose(RUN(u + 0.3)); camPath(cam, p, [G - 2, 4.2, 13], [G + 1, 4.2, 12.5], [x, 4, 3], [x + 2, 4.4, 2], 26, 26); R2(u + 4, 1);
        b.pose(addPose(idle(u, 0.7), addPose(lookAt(b, headOf(a2)), hit([[0.1, POSES.rest], [0.4, POSES.wave], [0.7, { ...POSES.wave, rUp: 150 }]], u)))); }
    };
  },
  // 22 "All the way to Sunny Pines."  — golden hour: Ada stops on the path; the camera cranes up past her to the SUNNY PINES sign; the ribbon curls down to one lit window
  (S, cam) => {
    const env = sunnyPines(S, { time: 'sunset' });
    const a = ada(S, 'awe', [0, 0, 4], 180);
    const R = petalRiver(S, [[-14, 12, 12], [-6, 11, 4], [2, 9.5, -4], [7, 6.8, -10], [9, 4.8, -13.5]], { n: 260, width: 0.8, speed: 0.12, size: 0.3 });
    allowGround(S, 'ada');
    return (t, dur) => {
      camPath(cam, t / dur, [1.5, 3.2, 12], [2.5, 6.5, 14], [0, 4.2, 4], [3, 6.8, -12], 26, 24);
      a.pose(addPose(idle(t, 0.7), { nod: -14 + Math.sin(t) * 2, turn: 10 * sm(t, 0.8, 2) })); R(t + 5, 1); env.update(t);
    };
  },
];
// a second bakery front built at x offset G (bakery() builds at the origin only)
function bakery2(S, G) {
  box(S, [60, 0.3, 30], [G, -0.15, 6], std({ map: T.concrete(0xb9b2a7) }), { r: 0, cast: false, name: 'ground' });
  box(S, [30, 14, 1], [G, 7, -3], std({ map: T.brick(0x9a5a3a) }), { r: 0, cast: false });
  box(S, [9, 5, 0.1], [G, 3.6, -2.4], new THREE.MeshStandardMaterial({ color: 0x8aaac8, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.55 }), { r: 0, cast: false });
  box(S, [9.6, 5.6, 0.3], [G, 3.6, -2.55], std({ color: 0xf2efe6 }), { r: 0.04, cast: false });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), std({ map: T2.sign('BAKERY'), roughness: 0.6 })); sg.position.set(G, 7.5, -2.45); S.add(sg);
  for (let i = 0; i < 5; i++) box(S, [1.6, 0.5, 2.2], [G - 8 + i * 4, 6.2, -1.6], std({ color: i % 2 ? 0xf2efe6 : 0xd8504a }), { r: 0.05, cast: false, solid: false, rot: [0.4, 0, 0] });
}
// extend floor / ceiling / side walls toward the camera so wide shots from far back don't see past the room edges
function extendRoom(S, h = 9) { box(S, [18.8, 0.3, 18], [0, -0.15, 14], std({ map: T.planks(0xb08a5a) }), { r: 0, cast: false, solid: false, name: 'floor ext' });
  box(S, [18.8, 0.3, 18], [0, h + 0.15, 14], std({ color: 0xf4f2ee }), { r: 0, cast: false, solid: false });
  for (const x of [-9.2, 9.2]) box(S, [0.4, h, 18], [x, h / 2, 14], std({ map: T.plaster(0xe8dcc8) }), { r: 0, cast: false, solid: false }); }
