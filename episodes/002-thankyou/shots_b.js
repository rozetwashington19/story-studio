import * as THREE from 'three';
import { POSES, addPose, ease, snap, idle, walk, D, std, box, camPath, track, seg, kitchen, homeStairs, houseFront, garage, garageFlowers,
  flower, cactus, flowerBed, toaster, cake, bike, sunflower, flashlight, FLOWER_COLS, sob, T, T2, L, growScale } from '../../engine/kit.js';
import { JUNO, THEO, MOM, DAD, GRAN, LUNCH, POST, KIDS, mk, pop, sway, hand, lunchLine, fries, sandwich, clockSign } from './common.js';

const head = (x, z, y = 4.64) => [x, y, z];
const close = (cam, p, h, { side = 0.4, dist = 5.6, lens = 36, push = 0.8, up = 0.15 } = {}) => (dist = Math.max(dist, 5.2), lens = Math.min(lens, 38),
  camPath(cam, p, [h[0] + side, h[1] + up, h[2] + dist], [h[0] + side * 0.7, h[1] + up - 0.05, h[2] + dist - push], [h[0], h[1] - 0.45, h[2]], [h[0], h[1] - 0.42, h[2]], lens));
const LABELS = [['Extra fries', -7.0, 2.6], ['Birthday cake', -5.6, 2.6], ['Fixed bike', -4.2, 2.6]];
const fill = (S, pos, i = 6, col = 0xffd8b0) => { const p = new THREE.PointLight(col, i, 14, 1.6); p.position.set(...pos); S.add(p); return p; };
// garage at night, full of flowers; Juno holds a flashlight in her right hand
function nightGarage(S, { flowers = true, light = 10 } = {}) {
  garage(S, { night: true }); const pots = flowers ? garageFlowers(S, LABELS) : [];
  fill(S, [0, 6.5, 1], light, 0x9ab0ff); return pots;
}
function torch(S, A) {
  const f = flashlight(S); S.remove(f); A.armR.add(f); f.position.set(0, -2.05, 0.05); f.rotation.x = 90 * D; return f;
}
// bright garage (light switched on)
function litGarage(S) { garage(S, { night: false }); return garageFlowers(S, LABELS); }
const sunset = (S) => { S.background = T.sky('#5a5aa8', '#ffb070'); };
function homeDoor(S, { daisy = true } = {}) {
  homeStairs(S);
  box(S, [3.2, 6.6, 0.25], [4.5, 3.3, -8.75], std({ map: T.planks(0x5a6a7a) }), { r: 0.04, cast: false, name: 'garage door' });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.7), std({ map: T2.sign('KEEP OUT', '#c0302a', '#ffffff', '700 150px Inter') })); sign.position.set(4.5, 5.0, -8.6); S.add(sign);
  const lock = box(S, [0.5, 0.6, 0.25], [5.6, 3.1, -8.5], std({ color: 0xe0b840, metalness: 0.9, roughness: 0.3 }), { r: 0.08, name: 'padlock' });
  const knob = box(S, [0.3, 0.3, 0.3], [5.6, 3.6, -8.55], std({ color: 0xc8c8c8, metalness: 0.9, roughness: 0.3 }), { r: 0.12, name: 'knob' });
  let d = null; if (daisy) { d = flower(S, [3.0, 3.6, -8.55], { kind: 'daisy', col: 0xf2f2f2, size: 1.0 }); d.rotation.z = 90 * D; }
  return { lock, d };
}

export const SHOTS_B = [
  // 39 "A daisy stuck in the garage door."
  (S, cam) => {
    const { d } = homeDoor(S);
    const j = mk(S, JUNO, 'juno', 'awe', [0.6, 0, -6.0], 60);
    return (t, dur) => {
      camPath(cam, t / dur, [2.2, 4.6, 3.4], [2.2, 4.4, 2.4], [1.8, 3.8, -7.5], [2.0, 3.7, -7.8], 30);
      j.pose(addPose({ lean: 10, nod: 10, rFwd: 30 + Math.sin(t * 3) * 6, lUp: 6 }, { turn: Math.sin(t * 2) * 6 }));
      d.userData.head.rotation.z = Math.sin(t * 5) * 0.15;
    };
  },
  // 40 "And Theo always kept the garage locked."
  (S, cam) => {
    homeDoor(S, { daisy: false });
    const j = mk(S, JUNO, 'juno', 'determined', [4.4, 0, -6.0], -150);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.6, 4.6, -0.6], [-1.0, 4.5, -1.4], [4.6, 3.8, -7.6], [4.8, 3.9, -7.6], 30);
      j.pose({ rFwd: 95 + Math.sin(t * 20) * 5, rUp: -10 + Math.sin(t * 20) * 3, lUp: 6, lean: 6 + Math.sin(t * 20) * 3 });
      j.root.rotation.y = (-150 + Math.sin(t * 20) * 2) * D;
    };
  },
  // 41 "That night, I snuck in with a flashlight."
  (S, cam) => {
    nightGarage(S, { flowers: false, light: 12 }); fill(S, [1, 5.5, 5], 16, 0xffd0a0);
    const j = mk(S, JUNO, 'juno', 'worried', [7, 0, 2.6], -90); torch(S, j);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [-1.0, 4.2, 4.5], [-0.6, 4.2, 4.4], [5, 3.6, 2.0], [3.8, 3.6, 1.6], 32);
      else camPath(cam, p, [1.0, 4.4, 9.0], [1.2, 4.3, 8.4], [3.6, 3.6, 2.6], [3.2, 3.6, 2.6], 30);
      j.root.position.x = 7 - t * 2.0; j.pose(addPose(walk(t, 0.5, 18), { rFwd: 75 + Math.sin(t * 3) * 10, rLeg: 0, nod: 4, turn: Math.sin(t * 2.5) * 15 }));
      j.armR.rotation.y = Math.sin(t * 2) * 0.3;
    };
  },
  // 42 "Flowers. Hundreds of them. Floor to ceiling."
  (S, cam) => {
    const pots = nightGarage(S, { light: 14 }); fill(S, [0, 5, 3.5], 5);
    const j = mk(S, JUNO, 'juno', 'awe', [0, 0, -0.6], 0); torch(S, j);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.4]);
      if (k === 0) close(cam, p, head(0, -0.6), { side: 0.6, dist: 5.0, lens: 40 });
      else camPath(cam, p, [3.0, 3.0, 4.5], [-2.5, 7.0, 4.5], [0, 2.5, -5], [-1, 4.0, -6], 24);
      j.pose({ rFwd: 70 + Math.sin(t * 1.5) * 25, rUp: 0, lUp: 10, nod: -10 - Math.sin(t * 1.5) * 8 });
      j.root.rotation.y = Math.sin(t * 1.2) * 0.6; sway(pots.slice(0, 30), t);
    };
  },
  // 43 "Every pot had a label in Theo's messy handwriting."
  (S, cam) => {
    const pots = nightGarage(S, { light: 12 }); fill(S, [-4, 4, 6], 6);
    const j = mk(S, JUNO, 'juno', 'awe', [-1.8, 0, 1.0], -60); torch(S, j);
    return (t, dur) => {
      camPath(cam, t / dur, [-3.0, 3.6, 7.0], [-4.8, 2.6, 5.6], [-4.4, 1.6, 2.4], [-5.6, 1.1, 2.6], 30);
      j.pose({ rFwd: 70, rUp: 5, lUp: 6, lean: 12, nod: 25 }); j.armR.rotation.y = -0.2 + Math.sin(t * 1.5) * 0.25;
    };
  },
  // 44 "Extra fries."
  (S, cam) => { nightGarage(S); fill(S, [-6, 3, 6], 10, 0xfff0c8);
    return (t, dur) => camPath(cam, t / dur, [-6.8, 1.5, 5.8], [-6.95, 1.4, 5.2], [-7.0, 0.1, 3.0], [-7.0, 0.1, 3.0], 34); },
  // 45 "Birthday cake."
  (S, cam) => { nightGarage(S); fill(S, [-5, 3, 6], 10, 0xfff0c8);
    return (t, dur) => camPath(cam, t / dur, [-5.4, 1.5, 5.8], [-5.55, 1.4, 5.2], [-5.6, 0.1, 3.0], [-5.6, 0.1, 3.0], 34); },
  // 46 "Fixed bike."
  (S, cam) => { nightGarage(S); fill(S, [-3.5, 3, 6], 10, 0xfff0c8);
    return (t, dur) => camPath(cam, t / dur, [-4.0, 1.5, 5.8], [-4.15, 1.4, 5.2], [-4.2, 0.1, 3.0], [-4.2, 0.1, 3.0], 34); },
  // 47 "That's when I understood."
  (S, cam) => {
    nightGarage(S, { light: 10 }); fill(S, [-0.5, 3.0, 3.4], 9, 0xffe0b0);
    const j = mk(S, JUNO, 'juno', 'shock', [-1.0, 0, 0.4], 15); torch(S, j);
    return (t, dur) => {
      close(cam, t / dur, head(-1.0, 0.4), { side: 0.9, dist: 4.6, push: 1.2, lens: 44 });
      j.pose({ rFwd: 45, lUp: 4, nod: t > 0.7 ? 6 : -6 }); j.setFace(t > 0.7 ? 'teary' : 'shock');
    };
  },
  // 48 "My thank-yous went to whoever really earned them."
  (S, cam) => {
    const pots = nightGarage(S, { light: 18 }); fill(S, [0, 4, 3], 5);
    const j = mk(S, JUNO, 'juno', 'teary', [0, 0, -1.5], 0); torch(S, j);
    return (t, dur) => {
      camPath(cam, t / dur, [0, 4.6, 0.8], [0, 6.8, 4.6], [0, 4.2, -1.5], [0, 3.4, -4], 34, 22);
      j.pose({ rFwd: 25, lUp: 4, nod: 12 + Math.sin(t * 2) * 3 }); sway(pots.slice(0, 40), t);
    };
  },
  // 49 "The extra fries? Theo paid for them with his allowance."
  (S, cam) => {
    lunchLine(S); L('flash')(S);
    const ll = mk(S, LUNCH, 'lunch', 'smile', [-1, 0, -7.0], 0), th = mk(S, THEO, 'theo', 'smile', [-1.0, 0, -2.4], 155);
    const coins = [0, 1, 2].map(i => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16), std({ color: 0xe0b840, metalness: 0.9, roughness: 0.3 })); S.add(c); return c; });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [5.0, 5.0, 3.0], [4.4, 4.8, 2.2], [-1, 3.8, -4.6], [-1, 3.8, -4.6], 30);
      else close(cam, p, head(-1, -7.0), { side: 1.2, dist: 4.6 });
      th.pose(addPose({ rFwd: 80, rUp: -5, lUp: 4 }, { nod: 6, turn: Math.sin(t * 3) * 10 }));
      ll.pose({ rFwd: t > 0.8 ? 80 : 20, lUp: 4, nod: 6 }); ll.setFace(t > 1.3 ? 'grin' : 'smile');
      const g = ease(Math.min(1, Math.max(0, (t - 0.6) / 0.6))); const hp = hand(th, 'R').lerp(hand(ll, 'R'), g);
      coins.forEach((c, i) => c.position.set(hp.x + i * 0.15 - 0.15, hp.y - 0.4 + i * 0.06, hp.z));
    };
  },
  // 50 "The birthday cake? Mom had to work late that night."
  (S, cam) => {
    kitchen(S); L('flash')(S); clockSign(S, '9:00 PM', [-4, 6.6, -8.7], 1.1);
    const m = mk(S, MOM, 'mom', 'worried', [-4.5, 0, -7.0], 90);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.4), std({ color: 0x3a2a4a })); S.add(bag);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.6, 4.8, 6.0], [-0.2, 4.8, 5.0], [-3.0, 3.6, -6.2], [-1.0, 3.6, -6.2], 30);
      m.root.position.x = -4.5 + ease(t / dur) * 5.0; m.root.position.z = -7.0; m.pose(addPose(walk(t, 0.8, 26), { rUp: 150 + Math.sin(t * 10) * 12, rFwd: 0, lFwd: 10, turn: 50 }));
      const hp = hand(m, 'L'); bag.position.set(hp.x, hp.y - 0.6, hp.z);
    };
  },
  // 51 "So Theo baked it. At two in the morning."
  (S, cam) => {
    kitchen(S); L('flash')(S); clockSign(S, '2:00 AM', [-4, 6.6, -8.7], 1.1);
    const th = mk(S, THEO, 'theo', 'determined', [0.3, 0, -6.4], 0);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std({ color: 0xe8e8f0, side: THREE.DoubleSide })); bowl.position.set(0.3, 3.5, -3.6); S.add(bowl);
    const batter = new THREE.Mesh(new THREE.CircleGeometry(0.66, 20), std({ color: 0x5a2e18 })); batter.rotation.x = -Math.PI / 2; batter.position.set(0.3, 3.3, -3.6); S.add(batter);
    const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), std({ color: 0xb08a5a })); S.add(spoon);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [2.8, 5.2, 3.0], [2.2, 5.0, 2.0], [0.3, 3.8, -5], [0.3, 3.9, -5], 30);
      else close(cam, p, head(0.3, -6.4), { side: -1.0, dist: 5.0 });
      const a = t * 9; th.pose({ rFwd: 55 + Math.sin(a) * 8, rUp: -18 + Math.cos(a) * 8, lFwd: 50, lUp: -20, nod: 22, lean: 6 });
      th.setFace(t > 1.2 ? 'neutral' : 'determined');
      const hp = hand(th, 'R'); spoon.position.set(hp.x, hp.y - 0.4, hp.z + 0.2); spoon.rotation.x = 0.4;
    };
  },
  // 52 "My bike? Theo fixed it before I woke up."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0', sunPos: [12, 4, 10] }); L('flash')(S);
    bike(S, [8.6, 0, -1.0]);
    const th = mk(S, THEO, 'theo', 'determined', [11.4, 0, 0.0], -90);
    const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 10), std({ color: 0x2a6ad8 })); S.add(pump);
    return (t, dur) => {
      camPath(cam, t / dur, [14.5, 4.4, 10.5], [13.8, 4.2, 9.4], [10.0, 2.6, 0], [10.0, 2.5, 0], 30);
      const u = Math.abs(Math.sin(t * 6));
      th.pose({ rFwd: 60 + u * 25, lFwd: 60 + u * 25, rUp: -15, lUp: -15, lean: 20 + u * 6, nod: 15 });
      const hp = hand(th, 'R'); pump.position.set(hp.x - 0.3, Math.max(0.8, hp.y - 0.6), hp.z);
    };
  },
  // 53 "And he hid every flower, so I'd never know."
  (S, cam) => {
    const pots = litGarage(S); L('flash')(S);
    const th = mk(S, THEO, 'theo', 'worried', [5, 0, 3.0], -90);
    const pp = pots[pots.length - 1]; pp.visible = false;
    const carry = flower(S, [0, 0, 0], { kind: 'rose', col: 0xe8484f, size: 1.0 });
    return (t, dur) => {
      camPath(cam, t / dur, [-3.0, 4.6, 6.8], [-2.0, 4.4, 6.4], [2.5, 3.4, 2.4], [0.5, 3.2, 1.8], 26);
      th.root.position.x = 5 - t * 1.6; th.root.position.y = Math.abs(Math.sin(t * 5)) * 0.12;
      th.pose(addPose(walk(t, 0.6, 18), { rFwd: 75, lFwd: 75, rUp: -18, lUp: -18, turn: Math.sin(t * 3) * 35 }));
      const a = hand(th, 'R'), b = hand(th, 'L'); carry.position.set((a.x + b.x) / 2 + -0.3, a.y - 0.2, (a.z + b.z) / 2);
    };
  },
  // 54 "Then the light clicked on."
  (S, cam) => {
    const pots = litGarage(S);
    const lights = []; S.traverse(o => { if (o.isLight) lights.push([o, o.intensity]); });
    const night = new THREE.HemisphereLight(0x4a5a90, 0x101018, 0.6); S.add(night);
    const j = mk(S, JUNO, 'juno', 'awe', [-1.0, 0, 0.4], 15); torch(S, j);
    return (t, dur) => {
      const on = t > 0.45; S.userData.look = on ? 'day' : 'night';
      lights.forEach(([o, i]) => o.intensity = on ? i : i * 0.02); night.visible = !on;
      close(cam, t / dur, head(-1.0, 0.4), { side: 1.2, dist: 6.0, lens: 38 });
      j.pose(on ? { rFwd: 140, rUp: -30, lFwd: 140, lUp: -30, nod: -6 } : { rFwd: 60, lUp: 4 }); j.setFace(on ? 'shock' : 'awe');
    };
  },
  // 55 "Juno? What are you doing in here?"
  (S, cam) => {
    litGarage(S);
    const th = mk(S, THEO, 'theo', 'shock', [2.4, 0, -1.0], -25);
    return (t, dur) => {
      close(cam, t / dur, head(2.4, -1.0), { side: -2.0 });
      th.pose(addPose({ rUp: 30, lUp: 30, rFwd: 30, lFwd: 30 }, { tilt: Math.sin(t * 3) * 4, nod: -4 }));
    };
  },
  // 56 "Why didn't you tell me?" I whispered.
  (S, cam) => {
    litGarage(S);
    const j = mk(S, JUNO, 'juno', 'teary', [-1.0, 0, 0.4], 30);
    return (t, dur) => {
      close(cam, t / dur, head(-1.0, 0.4), { side: 2.2, dist: 4.0, lens: 42 });
      j.pose(addPose({ rUp: 4, lUp: 4 }, { ...sob(t, 0.3), tilt: 6 }));
    };
  },
  // 57 Theo shrugged. "Big brothers are supposed to be annoying."
  (S, cam) => {
    litGarage(S);
    const th = mk(S, THEO, 'theo', 'smirk', [2.4, 0, 1.0], -30);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.4]);
      if (k === 0) close(cam, p, head(2.4, 1.0), { side: -0.4, dist: 6.0 });
      else close(cam, p, head(2.4, 1.0), { side: -2.0, dist: 3.4, lens: 44 });
      th.pose(track([[0, POSES.rest], [0.4, POSES.shrug], [0.9, { ...POSES.shrug, rUp: 20, lUp: 20 }], [1.2, POSES.shrug]], t));
    };
  },
  // 58 "But his ears turned bright red."
  (S, cam) => {
    litGarage(S);
    const th = mk(S, THEO, 'theo', 'blush', [2.4, 0, 1.0], -30);
    return (t, dur) => {
      close(cam, t / dur, head(2.4, 1.0), { side: -2.0, dist: 3.6, lens: 46, push: 0.6 });
      th.pose({ rUp: 4, lUp: 4, rFwd: 125, rUp: -15, turn: 15 + t * 10, nod: 10, tilt: -6 });
    };
  },
  // 59 "So I looked my brother right in the eyes,"
  (S, cam) => {
    litGarage(S);
    const j = mk(S, JUNO, 'juno', 'determined', [-1.6, 0, -2.0], 60), th = mk(S, THEO, 'theo', 'blush', [1.6, 0, -2.0], -60);
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 4.6, 6.8], [0.2, 4.5, 6.0], [0, 4.0, -2.0], [0, 4.2, -2.0], 24);
      j.pose(addPose({ rUp: 4, lUp: 4, nod: -8 }, idle(t, 0.6))); th.pose(addPose({ rUp: 4, lUp: 4, nod: 6, turn: t < 0.8 ? 25 : 0 }, idle(t, 0.6, 2)));
      th.setFace(t < 0.8 ? 'blush' : 'neutral');
    };
  },
  // 60 "and said the biggest thank you of my whole life."
  (S, cam) => {
    litGarage(S);
    const j = mk(S, JUNO, 'juno', 'determined', [-1.6, 0, 1.0], 60);
    return (t, dur) => {
      close(cam, t / dur, head(-1.6, 1.0), { side: 3.0, dist: 3.2, lens: 44, push: 0.8 });
      const b = ease(Math.min(1, t / 0.9)); j.pose({ bob: b * 0.08, nod: -8 * b, rUp: 4 + b * 10, lUp: 4 + b * 10, bodyTilt: 0 });
      j.setFace(t > 1.2 ? 'softsmile' : 'determined');
    };
  },
  // 61 "Thank you, Theo. For everything."
  (S, cam) => {
    litGarage(S);
    const j = mk(S, JUNO, 'juno', 'softsmile', [-1.6, 0, 1.0], 60), th = mk(S, THEO, 'theo', 'awe', [1.6, 0, 1.0], -60);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.55]);
      if (k === 0) close(cam, p, head(-1.6, 1.0), { side: 3.0, dist: 3.2, lens: 42 });
      else close(cam, p, head(1.6, 1.0), { side: -3.0, dist: 3.2, lens: 42 });
      j.pose(addPose({ rFwd: 30, lFwd: 30, rUp: -10, lUp: -10 }, sob(t, 0.25))); th.pose(addPose({ rUp: 4, lUp: 4 }, idle(t, 0.5)));
      th.setFace(t > dur * 0.75 ? 'softsmile' : 'awe');
    };
  },
  // 62 "The floor started to shake."
  (S, cam) => {
    const pots = litGarage(S);
    const j = mk(S, JUNO, 'juno', 'shock', [-2.5, 0, -2.0], 30), th = mk(S, THEO, 'theo', 'shock', [2.7, 0, -2.0], -30);
    const base = pots.map(p => p.position.clone());
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 4.6, 6.8], [0.4, 4.4, 6.2], [0.3, 3.4, -2], [0.3, 3.4, -2], 24);
      cam.position.x += Math.sin(t * 61) * 0.08; cam.position.y += Math.sin(t * 47) * 0.08; cam.rotateZ(Math.sin(t * 37) * 0.012);
      pots.forEach((p, i) => { p.position.x = base[i].x + Math.sin(t * 50 + i) * 0.04; p.rotation.z = Math.sin(t * 40 + i * 2) * 0.05; });
      const SH = { rUp: 18, lUp: 18, rFwd: 35, lFwd: 35 }; j.pose(addPose(SH, { nod: 25, bob: Math.sin(t * 40) * 0.03 })); th.pose(addPose(SH, { nod: 25, bob: Math.sin(t * 43) * 0.03 }));
    };
  },
  // 63 "And a sunflower burst right through the garage roof."
  (S, cam) => {
    // A: inside the garage, stem rising beside Theo
    const gi = new THREE.Group(); S.add(gi); litGarage(gi);
    const j = mk(gi, JUNO, 'juno', 'shock', [-2.7, 0, -2.0], 20), th = mk(gi, THEO, 'theo', 'shock', [2.7, 0, -2.0], -20);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 1, 16), std({ color: 0x3f8a32 })); stem.position.set(4.4, 0, -3.6); gi.add(stem);
    // B: outside, 200 units away
    const go = new THREE.Group(); go.position.x = 200; S.add(go); houseFront(go, { col: '#dfe8f0' });
    const sf = sunflower(go, [8.6, 0, -11], 22); const sky = go.background;
    const deb = [0, 1, 2, 3, 4, 5].map(i => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.0), std({ color: 0x6a3a32 })); go.add(b); return b; });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      S.background = sky;
      if (k === 0) {
        camPath(cam, p, [0, 2.4, 6.8], [0, 2.2, 6.4], [1.2, 4.5, -2], [2.4, 7.0, -3], 22);
        const h = Math.max(0.01, ease(p) * 9); stem.scale.y = h; stem.position.y = h / 2;
        j.pose({ rUp: 18, lUp: 18, rFwd: 35, lFwd: 35, nod: -35 }); th.pose({ rUp: 18, lUp: 18, rFwd: 35, lFwd: 35, nod: -35, turn: 25 });
      } else {
        camPath(cam, p, [201, 6, 34], [201, 7, 31], [205, 10, -8], [206, 13, -9], 26);
        const e = snap(Math.min(1, p * 1.4)); const H = 3 + e * 19; sf.stem.scale.y = H / 22; sf.stem.position.y = H / 2; sf.head.position.y = H;
        sf.g.children.forEach(c => { if (c !== sf.stem && c !== sf.head) c.visible = c.position.y < H; });
        deb.forEach((b, i) => { const q = Math.max(0, p - 0.08) * 1.4; b.position.set(8.6 + Math.cos(i * 1.1) * (2 + q * 6), 8 + q * 14 - q * q * 10 + i * 0.3, -11 + Math.sin(i * 1.1) * (2 + q * 5)); b.rotation.set(q * 6 + i, q * 4, i); b.visible = p > 0.08; });
      }
    };
  },
  // 64 "It was taller than our house."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' }); const sf = sunflower(S, [8.6, 0, -11], 22);
    const j = mk(S, JUNO, 'juno', 'awe', [2.2, 0, 6], 160), th = mk(S, THEO, 'theo', 'awe', [6.6, 0, 6], 200);
    return (t, dur) => {
      camPath(cam, t / dur, [4.4, 1.6, 27], [4.4, 2.0, 26], [5, 6, 0], [7, 15, -8], 22);
      sf.head.rotation.z = Math.sin(t * 1.5) * 0.05;
      j.pose({ nod: -40, rUp: 4, lUp: 4 }); th.pose({ nod: -40, rUp: 4, lUp: 4 });
    };
  },
  // 65 "The whole street came out to look."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' }); const sf = sunflower(S, [8.6, 0, -11], 22);
    const ppl = [[-6, KIDS[0]], [-1.5, KIDS[1]], [3, POST], [7.5, KIDS[2]], [12, KIDS[3]]].map(([x, o], i) => ({ A: mk(S, o, 'n' + i, 'awe', [x, 0, 12 - (i % 2) * 2], 180), x }));
    return (t, dur) => {
      camPath(cam, t / dur, [3, 6, 30], [3, 7, 28], [3, 7, 0], [4, 9, -2], 26);
      ppl.forEach((p, i) => { p.A.root.position.z = 12 - (i % 2) * 2 - t * 1.2; p.A.pose(addPose(walk(t + i, 0.6, 20), i % 2 ? { rUp: 150, lUp: 6, nod: -30 } : { rFwd: 150, nod: -30 })); });
      sf.head.rotation.z = Math.sin(t * 1.5) * 0.05;
    };
  },
  // 66 "Mom cried. Dad dropped his toast."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' }); sunflower(S, [8.6, 0, -11], 22);
    const m = mk(S, MOM, 'mom', 'cry', [-2, 0, 6], 10), d = mk(S, DAD, 'dad', 'awe', [3.4, 0, 6.4], -10);
    const toast = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.12), std({ color: 0xc88a3a })); S.add(toast);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) close(cam, p, head(-2, 6), { side: 0.6, dist: 5.2 });
      else camPath(cam, p, [3.8, 4.6, 14.5], [3.7, 4.4, 13.5], [3.4, 3.4, 6.4], [3.4, 3.2, 6.4], 30);
      m.pose(addPose({ rFwd: 125, lFwd: 125, rUp: -30, lUp: -30 }, sob(t, 1)));
      d.pose({ rFwd: 55, lUp: 4, nod: -30 });
      const hp = hand(d, 'R'); const fall = Math.max(0, t - dur * 0.62);
      toast.position.set(hp.x, Math.max(0.1, hp.y - 0.3 - fall * fall * 30), hp.z + fall * 0.8); toast.rotation.set(fall * 10, 0, fall * 6);
    };
  },
  // 67 Grandma just winked. "Told you."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' }); sunflower(S, [8.6, 0, -11], 22);
    const g = mk(S, GRAN, 'gran', 'smile', [-6, 0, 6], 20);
    return (t, dur) => {
      close(cam, t / dur, head(-6, 6), { side: 1.2, dist: 5.0 });
      g.setFace(t > 0.5 && t < 1.4 ? 'wink' : 'smile'); g.pose(addPose({ rFwd: 95, rUp: 15, lUp: 4 }, { tilt: Math.sin(t * 2) * 5 }));
    };
  },
  // 68 "Now everybody knows who Theo really is."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0' }); sunflower(S, [8.6, 0, -11], 22);
    const th = mk(S, THEO, 'theo', 'blush', [2, 0, 5], 0);
    const ppl = [[-4.8, 4, KIDS[0], 40], [8.8, 4, KIDS[3], -40], [-3.0, 10, POST, 160], [7.0, 10, KIDS[1], 200]].map(([x, z, o, r], i) => mk(S, o, 'n' + i, 'grin', [x, 0, z], r));
    const fs = [[0.6, 6.4], [3.6, 6.6], [0.2, 4.0], [3.8, 3.8], [2, 7.0]].map(([x, z], i) => flower(S, [x, 0, z], { kind: ['daisy', 'rose', 'tulip'][i % 3], col: FLOWER_COLS[i + 1], size: 1.2 }));
    return (t, dur) => {
      camPath(cam, t / dur, [2, 6.5, 19], [2, 5.8, 16], [2, 3.4, 5], [2, 3.6, 5], 30);
      th.pose(addPose({ rFwd: 125, rUp: -15, lUp: 4, nod: 8 }, idle(t, 1)));
      ppl.forEach((A, i) => A.pose(addPose({ rFwd: 60 + Math.abs(Math.sin(t * 12 + i)) * 20, lFwd: 60 + Math.abs(Math.sin(t * 12 + i)) * 20, rUp: -28, lUp: -28 }, idle(t, 1, i))));
      fs.forEach((f, i) => pop(f, t, 0.2 + i * 0.3, 0.35));
    };
  },
  // 69 "The lunch lady thanks him every Tuesday."
  (S, cam) => {
    lunchLine(S);
    const ll = mk(S, LUNCH, 'lunch', 'grin', [5.6, 0, -3.2], -70), th = mk(S, THEO, 'theo', 'smile', [1.0, 0, -2.0], 70);
    const f = flower(S, [1.4, 0, -0.2], { kind: 'daisy', col: 0xe86ab0, size: 1.4 }); const fr = fries(S);
    return (t, dur) => {
      camPath(cam, t / dur, [3.2, 4.6, 10.5], [3.2, 4.4, 9.0], [3.3, 3.2, -2.6], [3.3, 3.3, -2.6], 30);
      ll.pose(addPose(POSES.wave, { rUp: Math.sin(t * 11) * 14 })); th.pose(addPose({ lFwd: 70, rUp: 4 }, idle(t, 1)));
      const hp = hand(th, 'L'); fr.position.set(hp.x, hp.y - 0.35, hp.z); pop(f, t, 0.6, 0.35);
    };
  },
  // 70 "Grandma's porch is still a jungle."
  (S, cam) => {
    houseFront(S, { col: '#f0d2e2' });
    const bed = [...flowerBed(S, [-12, 2], [-0.6, 4], 70, { seed: 21, size: [1.2, 2.6] }), ...flowerBed(S, [-11, -8.5], [-5.5, -2.2], 6, { seed: 22, size: [1.4, 2.2], y: 0.6 }), ...flowerBed(S, [-3.5, 0.2], [-5.5, -2.2], 6, { seed: 23, size: [1.4, 2.2], y: 0.6 })];
    const g = mk(S, GRAN, 'gran', 'grin', [-6, 0.6, -3.8], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [-9, 5.5, 14], [-3, 5.0, 14], [-6, 3.6, -2], [-5, 3.6, -2], 30);
      g.pose(addPose(POSES.wave, { rUp: Math.sin(t * 12) * 16 })); sway(bed, t);
    };
  },
  // 71 "And Dad still thanks the toaster."
  (S, cam) => {
    kitchen(S); toaster(S, [-1.6, 2.78, -2.6]);
    const d = mk(S, DAD, 'dad', 'grin', [-1.6, 0, -6.6], 0);
    const f = flower(S, [-1.9, 2.9, -2.6], { kind: 'tulip', col: 0xf2c230, size: 1.0 }), f2 = flower(S, [-1.3, 2.9, -2.6], { kind: 'tulip', col: 0xe86ab0, size: 0.9 });
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 4.6, 3.8], [0.2, 4.5, 2.8], [-1.6, 3.6, -4], [-1.6, 3.7, -4], 32);
      const b = (Math.sin(t * 6) + 1) / 2; d.pose({ lean: 4 + b * 12, nod: b * 10, rFwd: 25, lFwd: 25, rUp: -10, lUp: -10 });
      pop(f, t, 0.4); pop(f2, t, 0.9);
    };
  },
  // 72 "But last night, I made Theo a sandwich."
  (S, cam) => {
    kitchen(S); L('night')(S); fill(S, [0, 6, 2], 12, 0xffd8a0);
    const j = mk(S, JUNO, 'juno', 'smile', [-2.4, 0, 1.6], 70), th = mk(S, THEO, 'theo', 'neutral', [2.4, 0, 1.6], -70);
    const sw = sandwich(S);
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 4.8, 12], [0.2, 4.6, 10.6], [0, 3.8, 1.6], [0, 3.9, 1.6], 30);
      const g = ease(Math.min(1, t / 1.0));
      j.pose(addPose({ rFwd: 70 - g * 20, lFwd: 70 - g * 20, rUp: -16, lUp: -16 }, idle(t, 0.6)));
      th.pose({ rFwd: 20 + g * 50, lUp: 4, nod: 10 });
      const a = hand(j, 'R'), b = hand(j, 'L'); const c = new THREE.Vector3((a.x + b.x) / 2 + 0.6, a.y - 0.25, (a.z + b.z) / 2); c.lerp(hand(th, 'R').add(new THREE.Vector3(-0.4, -0.3, 0)), g); sw.position.copy(c);
    };
  },
  // 73 And he said, "Thanks a lot, Juno."
  (S, cam) => {
    kitchen(S); L('night')(S); fill(S, [2, 6, 4], 12, 0xffd8a0);
    const th = mk(S, THEO, 'theo', 'smirk', [2.4, 0, 1.6], -50);
    return (t, dur) => {
      close(cam, t / dur, head(2.4, 1.6), { side: -2.6, dist: 3.8, lens: 42 });
      th.pose({ rFwd: 70, lUp: 4, tilt: 8 + Math.sin(t * 3) * 3, nod: -4 }); th.setFace(t > 0.9 ? 'smile' : 'smirk');
    };
  },
  // 74 "A cactus popped up. Of course."
  (S, cam) => {
    kitchen(S); L('night')(S); fill(S, [-2, 6, 4], 12, 0xffd8a0);
    const j = mk(S, JUNO, 'juno', 'shock', [-2.4, 0, 1.6], 50); const c = cactus(S, [-1.0, 0, 3.0], { s: 1.0, bloom: false });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [-0.6, 1.3, 7.0], [-0.7, 1.2, 6.4], [-1.2, 1.0, 2.6], [-1.2, 1.0, 2.6], 30);
      else close(cam, p, head(-2.4, 1.6), { side: 2.6, dist: 3.8 });
      j.pose(k ? { rUp: 30, lUp: 30, rFwd: 25, lFwd: 25, nod: -16, tilt: 10 } : { nod: 30, rUp: 4, lUp: 4 }); j.setFace(k ? 'smirk' : 'shock');
      pop(c, t, 0.2, 0.35);
    };
  },
  // 75 "But right on top, there was a tiny pink flower."
  (S, cam) => {
    kitchen(S); L('night')(S); fill(S, [-1, 5, 5], 14, 0xffd8a0);
    const j = mk(S, JUNO, 'juno', 'awe', [-2.4, 0, 1.6], 50), th = mk(S, THEO, 'theo', 'smile', [2.4, 0, 1.6], -50);
    const c = cactus(S, [-1.0, 0, 3.0], { s: 1.0, bloom: true }); const bl = c.userData.bloom;
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.55]);
      if (k === 0) camPath(cam, p, [-0.9, 2.3, 5.6], [-0.95, 2.2, 4.9], [-1.0, 1.85, 3.0], [-1.0, 1.85, 3.0], 46);
      else camPath(cam, p, [0, 4.6, 10.5], [0, 4.5, 9.6], [0, 3.6, 1.6], [0, 3.7, 1.6], 30);
      bl.scale.setScalar(growScale((t - 0.25) / 0.7)); bl.rotation.y = t * 0.6;
      j.pose(addPose({ nod: k ? 0 : 30, rUp: 4, lUp: 4 }, idle(t, 0.6))); j.setFace(k ? 'softsmile' : 'awe'); th.pose(addPose({ rUp: 4, lUp: 4 }, idle(t, 0.6, 2)));
    };
  },
  // 76 "Turns out even cactuses bloom,"
  (S, cam) => {
    kitchen(S); L('night')(S); fill(S, [0, 5, 6], 14, 0xffd8a0);
    const j = mk(S, JUNO, 'juno', 'softsmile', [-2.2, 0, 1.6], 15), th = mk(S, THEO, 'theo', 'smile', [2.2, 0, 1.6], -15);
    const c = cactus(S, [0, 0, 3.6], { s: 1.0, bloom: true });
    return (t, dur) => {
      camPath(cam, t / dur, [0, 4.8, 15.5], [0, 4.6, 14], [0, 3.4, 1.6], [0, 3.6, 1.6], 30);
      j.pose(addPose({ rUp: 4, lUp: 4, tilt: -6 }, idle(t, 0.7))); th.pose(addPose({ rUp: 4, lUp: 4, tilt: 6 }, idle(t, 0.7, 2)));
      c.userData.bloom.rotation.y = t * 0.6;
    };
  },
  // 77 "when you finally say it to the right person."
  (S, cam) => {
    houseFront(S, { col: '#dfe8f0', sunPos: [14, 5, 6] }); sunset(S); const sf = sunflower(S, [8.6, 0, -11], 22);
    const bed = flowerBed(S, [-12, 2], [-1.4, 0.4], 22, { seed: 3 });
    const j = mk(S, JUNO, 'juno', 'softsmile', [2.0, 0, 6], 10), th = mk(S, THEO, 'theo', 'smile', [6.4, 0, 6], -10);
    return (t, dur) => {
      camPath(cam, t / dur, [4.2, 4.6, 22], [3.5, 12, 44], [4.2, 3.6, 6], [5, 9, -4], 30, 24);
      j.pose(addPose({ rUp: 4, lUp: 4, nod: -10 }, idle(t, 0.6))); th.pose(addPose({ rUp: 4, lUp: 4, nod: -10 }, idle(t, 0.6, 2)));
      j.setFace(t > 2.2 ? 'smile' : 'softsmile'); sf.head.rotation.z = Math.sin(t * 1.2) * 0.04; sway(bed, t);
    };
  },
];
