import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn, HUG, pinky, sob,
  shopFront, shopInside, apartment, stoop, rainStreet, umbrella, coinBag, coinPour, lightStream, yearJar, broom, grayHair } from '../../engine/kit.js';
import { KAI, MOM, VESPER, GOLDWIN, BABY, mk, kai, mom, vesper, clockOf, head, clamp01, ramp, V, faceCam, fill,
  WRIST, SHOW, SHIVER, tremble, holdAt } from './common.js';

const VZ = -5.9, CZ = 0.2;
const BAG = { rFwd: 70, lFwd: 70, rUp: -28, lUp: -28, nod: 10 };          // clutching the bag to the chest
const bagAt = (bag, A) => { const r = pinky(A, 'R'), l = pinky(A, 'L'); bag.position.copy(r).add(l).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.4, 0)); };
const wheel = (S, A) => { const g = new THREE.Group(); S.add(g); g.add(A.root); A.root.position.set(0, -2.65, 0); return g; };
const CART = { rUp: 160, lUp: 160, rLegOut: 32, lLegOut: 32 };
const KG = 0.55, MG = 0.35;   // gray hair amounts after the trade

export const SHOTS_B = [
  // 24 "But I had a bag of gold."  — Vesper sets the heavy bag down; Kai pulls it close
  (S, cam) => {
    const env = shopInside(S);
    const v = vesper(S, 'neutral', [-2.6, 0, VZ], 15), k = kai(S, 'sad', [0.6, 0, CZ + 0.6], 180, { years: 50, gray: KG, light: 1.0 });
    const bag = coinBag(S, { s: 1.1 });
    return (t, dur) => {
      camPath(cam, t / dur, [2.8, 5.6, -8.0], [2.4, 5.4, -7.6], [0.4, 3.8, 0.2], [0.5, 3.9, 0.4], 30);
      const a = ramp(t, 0.1, dur * 0.35), b = ramp(t, dur * 0.5, dur * 0.8);
      bag.position.set(-1.6 + a * 2.2, 3.15 + (1 - a) * 1.2, -3.6 + a * 0.8 + b * 2.0); if (b > 0.5) bagAt(bag, k);
      v.pose(addPose(hit([[0, { rFwd: 96, lFwd: 96, rUp: -25, lUp: -25, lean: 4 }], [dur * 0.4, { rFwd: 20, lFwd: 20, lean: 0 }]], t), idle(t, 0.4)));
      k.pose(addPose(hit([[0, POSES.rest], [dur * 0.5, POSES.rest], [dur * 0.75, BAG]], t), idle(t, 0.4)));
      if (b > 0.7) k.setFace('determined');
      env.update(t, cam);
    };
  },
  // 25 "I ran home through the storm."  — running with the bag, lightning, splashes; camera dollies alongside
  (S, cam) => {
    const env = rainStreet(S, { lightning: [0.6], rainOpts: { opacity: 0.38, n: 1900, wind: 0.2 } });
    const k = kai(S, 'determined', [10, 0, 1.5], -90, { years: 50, gray: KG, light: 1.6 }); const bag = coinBag(S);
    return (t, dur) => {
      const x = 10 - t * 7.5; k.root.position.x = x;
      k.pose(addPose(walk(t, 1.9, 46), { rFwd: 70, lFwd: 70, rUp: -28, lUp: -28, lean: 14 })); bagAt(bag, k);
      camPath(cam, 0, [x - 2.5, 3.4, 9.5], [0, 0, 0], [x - 1.5, 3.6, 1.5], [0, 0, 0], 28);
      env.update(t, cam);
    };
  },
  // 26 "Mom! I can buy your medicine!"  — the door bursts open; Kai holds up the bag; Mom turns
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'sleepy', [4.5, 0, -5.9], 0, { light: 0.0 }), k = kai(S, 'grin', [7.6, 0, 1.0], -90, { years: 50, gray: KG, light: 1.5 });
    const bag = coinBag(S); fill(S, [5.5, 6, 1.5], 16, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [3.4, 5.0, 9.0], [3.8, 4.8, 8.0], [5.8, 4.0, -2.2], [5.8, 4.1, -2.2], 26);
      env.door.rotation.y = 1.7 * Math.min(1, t / 0.35);
      const u = ramp(t, 0.2, 1.0); k.root.position.x = 7.6 - u * 1.6; k.root.rotation.y = (-90 + u * 30) * D;
      k.pose(addPose(u < 1 ? walk(t, 1.6, 40) : idle(t, 0.5), hit([[0, { rFwd: 60, lFwd: 60, rUp: -25, lUp: -25 }], [1.0, { rFwd: 60, lFwd: 60, rUp: -25, lUp: -25 }], [1.3, { rUp: 10, lUp: 10, rFwd: 160, lFwd: 160, rLeg: 0, lLeg: 0 }]], t)));
      if (t > 1.3) k.pose(addPose({ rFwd: 160, lFwd: 160, rUp: -12, lUp: -12, nod: -8 }, addPose(talk(t), { bob: Math.abs(Math.sin(t * 9)) * 0.06 })));
      const r = pinky(k, 'R'), l = pinky(k, 'L'); bag.position.copy(r).add(l).multiplyScalar(0.5).add(new THREE.Vector3(0, t > 1.3 ? 0.1 : -0.4, 0));
      m.pose(addPose(hit([[0, { nod: 20 }], [0.5, { nod: 0, bodyTurn: -30 }]], t), lookAt(m, [6, 5, -1])));
      if (t > 0.5) m.setFace('worried');
      env.update(t, cam);
    };
  },
  // 27 "She saw my wrist. And she froze. [pause]"  — his clock reads 50; her face stops
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'smile', [4.5, 0, -5.9], -25, { light: 0.0 }), k = kai(S, 'grin', [6.0, 0, -0.4], -150, { years: 50, gray: KG, light: 1.6 });
    fill(S, [4.5, 5.5, -2], 8, 0xffc890);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.35]);
      k.pose(addPose({ ...SHOW, lFwd: 80 }, idle(t, 0.4)));
      if (c === 0) camPath(cam, p, [3.2, 5.6, 3.0], [3.4, 5.4, 2.4], [4.4, 4.2, -5.6], [4.4, 4.2, -5.6], 30);
      else faceCam(cam, p, head(4.5, -5.9), -25, { dist: 6.4, lens: 38, side: -0.4, push: 0.5 });
      m.pose(c === 0 ? idle(t, 0.4) : addPose(hit([[0, { nod: 0 }], [0.2, { nod: 14, lean: -4, bob: 0.04 }]], t - dur * 0.35), lookAt(m, [5.4, 3.2, -1.5])));
      m.setFace(c === 0 ? 'smile' : 'shock');
      env.update(t, cam);
    };
  },
  // 28 "Then she pulled up her sleeve."  — slowly, the sleeve slides back
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'teary', [4.5, 0, -5.9], -25, { sleeve: 0, light: 1.6 });
    fill(S, [4, 5.5, -2], 6, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [2.2, 4.8, 1.4], [2.6, 4.6, 0.6], [4.9, 3.5, -4.2], [4.9, 3.6, -4.3], 32);
      const k = ramp(t, 0.3, dur * 0.85); m.sleeve.pull(k);
      m.pose(addPose({ lFwd: 70, lUp: -20, rFwd: 64, rUp: -38 + k * 6, nod: 22 }, addPose(idle(t, 0.3), tremble(t, 0.6))));
      m.clock.glow(0.4 + 0.3 * Math.sin(t * 7));
      env.update(t, cam);
    };
  },
  // 29 "Her clock said three years. [pause]"  — the red 3 flickers; Kai's face
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'teary', [4.5, 0, -5.9], -25, { sleeve: 1, light: 1.6 }), k = kai(S, 'shock', [6.0, 0, -0.4], -150, { years: 50, gray: KG, light: 1.0 });
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      m.pose(addPose({ lFwd: 70, lUp: -20, rFwd: 20, nod: 22 }, idle(t, 0.3)));
      m.clock.glow(t % 1.1 < 0.08 ? 0.15 : 0.8 + 0.2 * Math.sin(t * 9));
      if (c === 0) { const w = m.clock.world(); camPath(cam, p, [w.x - 0.4, w.y + 1.2, w.z + 4.6], [w.x - 0.3, w.y + 0.9, w.z + 3.6], [w.x, w.y, w.z], [w.x, w.y, w.z], 40); }
      else faceCam(cam, p, head(6.0, -0.4), -150, { dist: 6.0, lens: 40, side: 0.5, push: 0.6 });
      k.pose(addPose(idle(t, 0.3), lookAt(k, [4.8, 3.2, -4])));
      k.setFace(c === 1 && p > 0.5 ? 'teary' : 'shock');
      env.update(t, cam);
    };
  },
  // 30 "You were born sick, Kai," she said.  — Mom, crying, tells him
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'cry', [4.5, 0, -5.9], -25, { sleeve: 1, light: 1.5 });
    fill(S, [3.5, 5.5, -1], 7, 0xffc890);
    return (t, dur) => {
      faceCam(cam, t / dur, head(4.5, -5.9), -25, { dist: 6.6, lens: 36, side: 0.7, push: 0.8 });
      m.pose(addPose({ lFwd: 30, rFwd: 25, nod: 6, turn: -10 }, addPose(talk(t, 0.8), sob(t, 0.5))));
      if (t > dur * 0.5) m.setFace('teary');
      env.update(t, cam);
    };
  },
  // 31 "So I traded my years to save you."  — flashback (warm, faded): young Mom with baby Kai; her years pour into the jar
  (S, cam) => {
    const env = shopInside(S); S.userData.look = 'flash'; S.userData.rimIntensity = 1.0; env.key.intensity = 15; env.cold.userData.base = 80;
    const m = mom(S, 'teary', [-0.4, 0, CZ + 0.8], 180, { years: 45, sleeve: 1, light: 1.6 }); m.clock.set(45, 0x5ae8ff);
    const v = vesper(S, 'sad', [-3.4, 0, VZ], 10);
    const bb = mk(S, BABY, 'baby', 'sleeping', [0, 0, 0], 180, 0.42); S.userData.allowContact = [['mom', 'baby']];
    const jar = yearJar(S, [-2.6, 3.15, -3.3], 0x8af0ff, { light: 3, s: 1.2 }); const st = lightStream(S, 0x8af0ff, 70);
    return (t, dur) => {
      camPath(cam, t / dur, [2.6, 5.4, -7.6], [2.2, 5.2, -7.0], [-0.7, 3.9, 0.6], [-0.8, 4.0, 0.7], 30);
      m.pose(addPose({ rFwd: 62, rUp: -42, lFwd: 82, lUp: -10, nod: 18 }, idle(t, 0.3)));
      const r = pinky(m, 'R'); bb.root.position.set(r.x - 0.5, r.y - 1.5, r.z - 0.2); bb.root.rotation.set(0, Math.PI, 0); bb.pose({ rLeg: 60, lLeg: 60, rFwd: 30, lFwd: 30 });
      const q = ramp(t, 0.4, dur * 0.85); m.clock.set(Math.round(45 - 40 * q), q > 0.85 ? 0xff5a4a : 0x5ae8ff);
      st(m.clock.world(), jar.position.clone().setY(3.8), q > 0 && q < 1 ? 1 : 0, t, 0.6);
      v.pose(addPose(idle(t, 0.4), lookAt(v, [-0.4, 4.4, 0.8])));
      env.update(t, cam);
    };
  },
  // 32 "She wasn't sick. She was running out of time."  — present: the weak red glow on her wrist, Kai understands
  (S, cam) => {
    const env = apartment(S, { lightning: [] });
    const m = mom(S, 'sad', [-3.5, 0, -5.3], 15, { sleeve: 1, light: 1.6 }); sitOn(m, 1.6);
    const k = kai(S, 'teary', [1.6, 0, -2.2], -70, { years: 50, gray: KG, light: 1.0 }); fill(S, [-1, 5.5, -0.5], 12, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [-7.4, 5.8, 4.6], [-6.9, 5.6, 3.6], [-1.2, 3.8, -3.6], [-1.4, 3.8, -3.8], 26);
      m.pose(addPose({ rLeg: 90, lLeg: 90, lFwd: 55, lUp: -10, rFwd: 20, nod: 20 }, idle(t, 0.3)));
      m.clock.glow(0.5 + 0.25 * Math.sin(t * 2.5));
      k.pose(addPose(hit([[0, POSES.rest], [dur * 0.5, POSES.rest], [dur * 0.7, { rFwd: 30, lFwd: 30, nod: 10 }]], t), addPose(idle(t, 0.4), lookAt(k, [-3.2, 3, -4.6]))));
      if (t > dur * 0.55) k.setFace('cry');
      env.update(t, cam);
    };
  },
  // 33 "Every night, she swept Mr. Vesper's floors,"  — Mom with a broom in the shop at night; Vesper watches
  (S, cam) => {
    const env = shopInside(S, { lightning: [] });
    const m = mom(S, 'sleepy', [-2.0, 0, 3.0], 40, { sleeve: 0, light: 0.0 }), v = vesper(S, 'sad', [1.6, 0, VZ], -15);
    const br = broom(S); fill(S, [-1, 6, 6], 16, 0xffc890); fill(S, [1, 5, 8], 14, 0xffd8b0);
    return (t, dur) => {
      camPath(cam, t / dur, [3.5, 4.6, 9.8], [2.8, 4.4, 9.0], [-1.2, 3.4, 3.0], [-0.9, 3.4, 3.0], 30);
      const sw = Math.sin(t * 3.4); m.root.position.x = -2.0 + t * 0.5;
      m.pose(addPose({ rFwd: 40 + sw * 12, lFwd: 55 + sw * 12, rUp: -30, lUp: -18, nod: 26, lean: 12 }, { bob: Math.abs(sw) * 0.04 }));
      const hl = pinky(m, 'L'); br.position.copy(hl).add(new THREE.Vector3(0, 0.3, 0)); br.rotation.set(0.35, 0, -0.35 + sw * 0.3);
      v.pose(addPose(idle(t, 0.4), lookAt(v, [m.root.position.x, 4, 3])));
      env.update(t, cam);
    };
  },
  // 34 "buying her years back, one day at a time. [pause]"  — he hands her one tiny glowing drop; her clock flickers up
  (S, cam) => {
    const env = shopInside(S, { lightning: [] });
    const m = mom(S, 'sleepy', [-0.6, 0, CZ + 0.4], 180, { years: 2, sleeve: 1, light: 1.6 }), v = vesper(S, 'softsmile', [0.2, 0, VZ], 0);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), new THREE.MeshBasicMaterial({ color: 0xbff8ff, toneMapped: false })); S.add(drop);
    const dl = new THREE.PointLight(0x8af0ff, 6, 5, 1.6); drop.add(dl);
    return (t, dur) => {
      camPath(cam, t / dur, [4.4, 6.0, -8.4], [3.8, 5.8, -8.0], [-0.8, 3.9, 0.0], [-0.8, 3.9, 0.0], 30);
      v.pose(addPose(hit([[0, POSES.rest], [0.5, { rFwd: 98, rUp: -12, lean: 4 }]], t), idle(t, 0.4)));
      m.pose(addPose(hit([[0, POSES.rest], [0.6, { lFwd: 82, lUp: -12, nod: 16 }]], t), idle(t, 0.3)));
      const a = pinky(v, 'R'), b = m.clock.world(); const u = ramp(t, 0.8, dur * 0.55);
      drop.position.copy(a).lerp(b, u); drop.position.y += Math.sin(u * Math.PI) * 0.6; drop.visible = u < 1; drop.scale.setScalar(1 + 0.2 * Math.sin(t * 10));
      if (u >= 1) { m.clock.set(3); m.clock.glow(1.2 + 0.3 * Math.sin(t * 8)); m.setFace('softsmile'); }
      env.update(t, cam);
    };
  },
  // 35 "Now I knew what the gold was for."  — Kai looks down at the bag, then up, decided
  (S, cam) => {
    const env = apartment(S);
    const k = kai(S, 'sad', [0.2, 0, -2.0], 10, { years: 50, gray: KG, light: 1.5 }); const bag = coinBag(S);
    fill(S, [-2, 5.5, 1], 9, 0xffc890);
    return (t, dur) => {
      faceCam(cam, t / dur, head(0.2, -2.0, 4.3), 10, { dist: 7.4, lens: 32, side: 0.9, push: 1.5, look: -0.5 });
      k.pose(addPose(BAG, hit([[0, { nod: 22 }], [dur * 0.55, { nod: 22 }], [dur * 0.75, { nod: -6 }]], t))); bagAt(bag, k);
      k.setFace(t < dur * 0.6 ? 'sad' : 'determined');
      env.update(t, cam);
    };
  },
  // 36 "I poured every coin on the counter."  — the bag tips; gold spills across the counter; Vesper startles
  (S, cam) => {
    const env = shopInside(S);
    const k = kai(S, 'determined', [0.6, 0, CZ + 0.6], 180, { years: 50, gray: KG, light: 1.0 }), v = vesper(S, 'neutral', [0.4, 0, VZ], 0);
    const bag = coinBag(S, { s: 1.1 }); const pour = coinPour(S, [0.6, 3.9, -2.2], [-0.4, 3.15, -3.4], 90);
    return (t, dur) => {
      camPath(cam, t / dur, [-3.6, 8.6, 1.6], [-3.1, 8.2, 1.0], [-0.2, 3.3, -3.0], [-0.2, 3.3, -3.0], 30);
      const a = ramp(t, 0.2, 0.7); k.pose(addPose({ rFwd: 70 + a * 25, lFwd: 70 + a * 25, rUp: -28, lUp: -28, nod: 18 }, idle(t, 0.3)));
      const r = pinky(k, 'R'), l = pinky(k, 'L'); bag.position.copy(r).add(l).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.2, -0.3)); bag.rotation.x = -a * 2.2;
      pour(ramp(t, 0.6, dur * 0.9));
      v.pose(hit([[0, POSES.rest], [0.9, { ...POSES.shock, rUp: 40, lUp: 40 }]], t)); if (t > 0.9) v.setFace('shock');
      env.update(t, cam);
    };
  },
  // 37 "Give them to my mom," I said.
  (S, cam) => {
    const env = shopInside(S);
    const k = kai(S, 'determined', [0.6, 0, CZ + 0.6], 180, { years: 50, gray: KG, light: 1.5 }); coinPour(S, [0.6, 3.9, -2.2], [-0.4, 3.15, -3.4], 90)(1);
    return (t, dur) => {
      faceCam(cam, t / dur, head(0.6, CZ + 0.6), 180, { dist: 6.2, lens: 38, side: -0.7, push: 0.6 });
      k.pose(addPose({ rFwd: 30, lFwd: 30, nod: 4 }, addPose(talk(t, 0.7), idle(t, 0.3))));
      if (t > dur * 0.6) k.setFace('teary');
      env.update(t, cam);
    };
  },
  // 38 Mr. Vesper smiled. "Just like her."
  (S, cam) => {
    const env = shopInside(S);
    const v = vesper(S, 'sad', [0.4, 0, VZ], 0); coinPour(S, [0.6, 3.9, -2.2], [-0.4, 3.15, -3.4], 90)(1);
    return (t, dur) => {
      faceCam(cam, t / dur, head(0.4, VZ), 0, { dist: 7.0, lens: 34, side: 1.0, push: 0.9, up: -0.2 });
      v.pose(addPose({ nod: 8, rFwd: 25, lFwd: 25 }, t > dur * 0.4 ? talk(t, 0.8) : idle(t, 0.4)));
      v.setFace(t < dur * 0.3 ? 'sad' : 'softsmile');
      env.update(t, cam);
    };
  },
  // 39 "Her clock lit up. Forty-three years."  — at home, light floods in; 3 rolls up to 43, red turns cyan
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'sad', [-3.5, 0, -5.3], 10, { sleeve: 1, light: 1.6 }); sitOn(m, 1.6);
    const st = lightStream(S, 0x8af0ff, 80); fill(S, [-1, 5.5, -1], 12, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [1.6, 4.6, 2.2], [0.9, 4.3, 1.3], [-3.3, 3.5, -4.8], [-3.4, 3.7, -5.0], 30);
      const q = ramp(t, 0.5, dur * 0.8);
      m.clock.set(Math.round(3 + 40 * q), q > 0.05 ? 0x5ae8ff : 0xff5a4a); m.clock.glow(0.8 + q * 0.8);
      st(V([3.5, 5, -8.4]), m.clock.world(), q > 0 && q < 1 ? 1 : 0, t, 1.0);
      m.pose(addPose({ rLeg: 90, lLeg: 90 }, addPose(hit([[0, { lFwd: 20, nod: 20 }], [0.6, { lFwd: 75, lUp: -15, nod: 18 }], [dur * 0.85, { lFwd: 75, lUp: -15, nod: 0, rFwd: 110, rUp: -20 }]], t), idle(t, 0.3))));
      m.setFace(q < 0.1 ? 'sad' : q < 0.7 ? 'shock' : 'teary');
      env.update(t, cam);
    };
  },
  // 40 "Mine says fifty now."  — Kai, home, wrist up, a small smile
  (S, cam) => {
    const env = apartment(S);
    const k = kai(S, 'softsmile', [7.0, 0, 0.8], -60, { years: 50, gray: KG, light: 1.6 });
    return (t, dur) => {
      faceCam(cam, t / dur, head(7.0, 0.8, 4.3), -60, { dist: 6.8, lens: 34, side: -0.6, push: 0.9, look: -0.4 });
      k.pose(addPose(hit([[0, POSES.rest], [0.4, { ...SHOW, lFwd: 82, lUp: -24, nod: 14, turn: 14 }]], t), idle(t, 0.4)));
      env.update(t, cam);
    };
  },
  // 41 "We're both a little gray."  — the hug
  (S, cam) => {
    const env = apartment(S);
    const m = mom(S, 'teary', [-0.5, 0, -2.6], 30, { years: 43, sleeve: 1, gray: MG, light: 1.6 }), k = kai(S, 'relieved', [0.9, 0, -0.2], -150, { years: 50, gray: KG, light: 1.5 });
    m.clock.set(43, 0x5ae8ff); S.userData.allowContact = [['mom', 'kai']]; fill(S, [2, 6, 3], 12, 0xffc890);
    return (t, dur) => {
      camPath(cam, t / dur, [-6.6, 5.0, 2.8], [-5.8, 4.8, 3.4], [0.2, 4.2, -1.4], [0.2, 4.2, -1.4], 30);
      const a = ramp(t, 0, 0.5);
      m.pose(addPose({ ...HUG, nod: 22, rFwd: 85 * a, lFwd: 85 * a, rUp: -22 * a, lUp: -22 * a, lean: 8 }, { bob: Math.sin(t * 2) * 0.02, tilt: 8 }));
      k.pose(addPose({ rFwd: 80 * a, lFwd: 80 * a, rUp: -28 * a, lUp: -28 * a, nod: -10 }, { bob: Math.sin(t * 2 + 1) * 0.02 }));
      if (t > dur * 0.5) m.setFace('relieved');
      env.update(t, cam);
    };
  },
  // 42 "Next morning, the rain stopped."  — sunrise over the wet street, the stoop door opens
  (S, cam) => {
    const env = stoop(S, { morning: true });
    const k = kai(S, 'smile', [-1.8, 0, -1.4], 10, { years: 50, gray: KG, light: 0.0 }), m = mom(S, 'softsmile', [2.6, 0, -1.4], -10, { years: 43, sleeve: 1, gray: MG, light: 0.0 });
    m.clock.set(43, 0x5ae8ff);
    return (t, dur) => {
      camPath(cam, t / dur, [1, 13, 18], [0.5, 5.2, 13], [0, 9, -6], [0.2, 3.8, -3], 24);
      k.pose(addPose(idle(t, 0.5), lookAt(k, [-8, 12, 12]))); m.pose(addPose(idle(t, 0.5, 2), lookAt(m, [-8, 12, 12])));
      env.update(t, cam);
    };
  },
  // 43 "Mrs. Goldwin cartwheeled past our window."  — and right past our stoop
  (S, cam) => {
    const env = stoop(S, { morning: true });
    const k = kai(S, 'smile', [-1.8, 0, -1.4], 10, { years: 50, gray: KG, light: 0.0 }), m = mom(S, 'smile', [2.6, 0, -1.4], -10, { years: 43, sleeve: 1, gray: MG, light: 0.0 });
    m.clock.set(43, 0x5ae8ff);
    const g = mk(S, GOLDWIN, 'goldwin', 'delighted', [0, 0, 0], 0); const W = wheel(S, g); S.userData.allowContact = [['goldwin', 'ground']];
    return (t, dur) => {
      const x = -13 + t * 6.0; W.position.set(x, 2.65, 2.4); W.rotation.z = -(x + 13) / 2.65; g.pose(CART);
      camPath(cam, t / dur, [-2, 4.2, 15], [2, 4.0, 14], [x * 0.5, 3.4, 0], [x * 0.5, 3.6, 0], 26);
      k.pose(addPose(idle(t, 0.4), lookAt(k, [x, 3, 2.4]))); m.pose(addPose(idle(t, 0.4, 1), lookAt(m, [x, 3, 2.4])));
      if (x > -3) { k.setFace('shock'); m.setFace('laugh'); } if (x > 4) k.setFace('laugh');
      env.update(t, cam);
    };
  },
  // 44 "And Mom laughed, for the first time in years."  — sun on her face, Kai laughing beside her
  (S, cam) => {
    const env = stoop(S, { morning: true });
    const k = kai(S, 'laugh', [-1.8, 0, -1.4], 25, { years: 50, gray: KG, light: 0.0 }), m = mom(S, 'laugh', [2.6, 0, -1.4], -20, { years: 43, sleeve: 1, gray: MG, light: 0.0 });
    m.clock.set(43, 0x5ae8ff); fill(S, [1, 5, 4], 6, 0xffd0a0);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.6]);
      if (c === 0) faceCam(cam, p, head(2.6, -1.4), -20, { dist: 6.8, lens: 36, side: -0.6, push: 0.8 });
      else camPath(cam, p, [0.4, 4.4, 9.5], [0.4, 4.3, 8.6], [0.4, 4.0, -2.6], [0.4, 4.0, -2.6], 28);
      m.pose(addPose({ rFwd: 40, rUp: -30, nod: -10, lean: -4 }, { bob: Math.abs(Math.sin(t * 10)) * 0.05, tilt: Math.sin(t * 5) * 4, nod: Math.sin(t * 10) * 3 }));
      k.pose(addPose(idle(t, 0.4), addPose(lookAt(k, [2.6, 4.8, -1.4]), { bob: Math.abs(Math.sin(t * 9 + 1)) * 0.04 })));
      env.update(t, cam);
    };
  },
  // 45 "Fifty years with her. [pause]"  — side by side on the sunny stoop, Kai looks up at her; both clocks glow
  (S, cam) => {
    const env = stoop(S, { morning: true });
    const k = kai(S, 'softsmile', [-1.6, 0, -1.4], 15, { years: 50, gray: KG, light: 1.5 }), m = mom(S, 'softsmile', [2.7, 0, -1.4], -15, { years: 43, sleeve: 1, gray: MG, light: 1.5 });
    m.clock.set(43, 0x5ae8ff); S.userData.allowContact = [['mom', 'kai']];
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 4.8, 10.4], [0.6, 4.6, 9.2], [0.5, 4.0, -1.4], [0.5, 4.1, -1.4], 26);
      const a = ramp(t, 0.4, 1.4);
      m.pose(addPose({ rUp: 3 + a * 48, rFwd: a * 22, nod: 8 }, addPose(idle(t, 0.3), lookAt(m, [-1.6, 4.4, -1.4]))));
      k.pose(addPose({ lUp: 3 + a * 40, lFwd: a * 15 }, addPose(idle(t, 0.3, 2), lookAt(k, [2.7, 5.2, -1.4]))));
      env.update(t, cam);
    };
  },
  // 46 "Best trade I ever made. [pause]"  — they walk off down the bright street together; crane up and away
  (S, cam) => {
    const env = stoop(S, { morning: true });
    const k = kai(S, 'smile', [-2.0, 0, 4.6], 90, { years: 50, gray: KG, light: 1.0 }), m = mom(S, 'softsmile', [-2.0, 0, 0.2], 90, { years: 43, sleeve: 1, gray: MG, light: 1.0 });
    m.clock.set(43, 0x5ae8ff);
    return (t, dur) => {
      const x = -2.0 + t * 1.6; k.root.position.x = x; m.root.position.x = x;
      k.pose(addPose(walk(t, 0.8, 28), lookAt(k, [x + 2, 5.2, 0.2]))); m.pose(addPose(walk(t + 0.3, 0.8, 28), lookAt(m, [x + 2, 4.4, 4.6])));
      camPath(cam, t / dur, [-4, 6, 17], [2, 12, 26], [0, 3.4, 1], [x + 1, 3, 1.5], 26, 24);
      env.update(t, cam);
    };
  },
];
