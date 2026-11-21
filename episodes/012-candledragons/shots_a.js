import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, std, box, camPath, seg, hit, talk, lookAt, anticipate, sitGround, pinky, backOut,
  castleKitchen, greatHall, towerRoom, candle, flame, marshmallowStick, loaf } from '../../engine/kit.js';
import { WREN, GRAN, HOB, BRAM, GUARDS, mk, wren, gran, hob, bram, guard, dragon, ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, BLOW, orbit, steer } from './common.js';

// a tall iron candle stand with a candle on top (flame tip ≈ y top + 0.75)
export function stand(S, [x, z], top = 3.6, { light = 4 } = {}) {
  const iron = std({ color: 0x2a2624, metalness: 0.7, roughness: 0.45 });
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, top, 8), iron); p.position.set(x, top / 2, z); p.castShadow = true; S.add(p);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.15, 14), iron); b.position.set(x, 0.08, z); S.add(b);
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.12, 0.15, 14), iron); c.position.set(x, top, z); S.add(c);
  return candle(S, [x, top + 0.05, z], { h: 0.6, r: 0.1, light, dist: 7, fs: 0.36 });
}
// hatch: at t0 the candle flame squeezes out and a tiny dragon pops from the wick (backOut scale-in). Returns k 0..1 (dragon grown).
export function hatch(d, cdl, t, t0, s = 1) {
  const u = ramp(t, t0, t0 + 0.35); cdl.set(1 - sm(t, t0 - 0.15, t0 + 0.05) * 1);
  d.g.scale.setScalar(Math.max(0.0001, backOut(u) * s * d.base)); d.root.visible = u > 0; return u;
}
const base = (d) => { d.base = d.g.scale.x; d.root.visible = false; return d; };
const puffs = (S, n = 8) => { const m = []; for (let i = 0; i < n; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: 0xe8e0d8, transparent: true, opacity: 0.5 })); S.add(o); m.push(o); }
  return (t, t0, p) => m.forEach((o, i) => { const u = (t - t0 - i * 0.04) / 0.9; o.visible = u > 0 && u < 1; if (!o.visible) return; o.position.set(p.x + Math.sin(i * 2.3) * u * 0.5, p.y + u * 1.4, p.z + Math.cos(i * 1.7) * u * 0.3); o.scale.setScalar(0.5 + u * 1.5); o.material.opacity = 0.45 * (1 - u); }); };

export const SHOTS_A = [
  // 2 "Blow out a candle, and its flame hatches."  — a guard leans to a candle stand in the great hall and blows; the flame stretches and wobbles
  (S, cam) => {
    const env = greatHall(S);
    const G = guard(S, 0, 'neutral', [-0.6, 0, -9], 90); const c = stand(S, [1.6, -9], 3.6);
    return (t, dur) => { env.update(t); c.update(t);
      const b = sm(t, 0.5, 0.9); G.pose(addPose(idle(t, 0.7), addPose(BLOW(b), anticipate(t, 0.5))));
      if (t > 0.5) G.setFace('pout');
      const fk = 1 + b * Math.sin(t * 30) * 0.25; c.flame.group.scale.set(0.36 * (1 - b * 0.3), 0.36 * fk * (1 + b * 0.6), 0.36); c.flame.group.rotation.z = -b * 0.6;
      camPath(cam, t / dur, [5.6, 5.2, -2.4], [5.0, 5.0, -3.4], [0.4, 4.4, -9], [0.8, 4.3, -9], 22, 26);
    };
  },
  // 3 "Into a tiny dragon."  — macro: the flame pops into a tiny glowing dragon that flutters up past the guard's delighted face
  (S, cam) => {
    const env = greatHall(S);
    const G = guard(S, 0, 'pout', [-0.6, 0, -9], 90); const c = stand(S, [1.6, -9], 3.6, { light: 3 });
    const d = base(dragon(S, 0, 0.16, 3)); const tip = c.tip;
    return (t, dur) => { env.update(t); c.update(t);
      const k = hatch(d, c, t, 0.25); const up = sm(t, 0.6, dur);
      d.root.position.set(tip.x - up * 0.6, tip.y - 0.1 + up * 1.2, tip.z + up * 0.4); d.root.rotation.y = -0.8 + up * 0.6; d.update(t, k < 1 ? 'hover' : 'hover'); d.look(headOf(G));
      G.pose(addPose(idle(t, 0.7), hit([[0, BLOW(0.6)], [0.5, { lean: -6, nod: -10, rFwd: 30 }], [1.2, { lean: -4, nod: -18, rFwd: 40, lFwd: 20 }]], t)));
      if (t > 0.45) G.setFace('awe'); if (t > 1.2) G.setFace('delighted');
      camPath(cam, t / dur, [5.6, 5.2, -2.6], [5.2, 5.6, -3.2], [0.9, 4.8, -9], [0.8, 5.4, -9], 24, 26);
    };
  },
  // 4 "You see, flames don't go out here. They fly off."  — crane up the great hall: tiny dragons loop around the chandelier and the banners
  (S, cam) => {
    const env = greatHall(S);
    const ds = Array.from({ length: 7 }, (_, i) => dragon(S, i + 1, 0.22, i < 3 ? 4 : 0));
    const G = guard(S, 1, 'smile', [5.5, 0, -6], -30); const H2 = guard(S, 0, 'laugh', [-1.2, 0, -12], 30);
    const prev = ds.map(() => new THREE.Vector3());
    return (t, dur) => { env.update(t);
      ds.forEach((d, i) => { const p = orbit(t, [2.5, 8.6 - (i % 3) * 1.6, -10], 3 + (i % 3) * 1.4, 0.7, 0.9 + (i % 2) * 0.3, i * 0.9); steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); });
      G.pose(addPose(idle(t, 0.8), addPose({ rUp: 20 }, lookAt(G, ds[0].root.position)))); H2.pose(addPose(idle(t, 0.8, 2), addPose({ rFwd: 90, nod: -10 }, lookAt(H2, ds[2].root.position))));
      camPath(cam, t / dur, [2.0, 3.2, 7.4], [2.6, 7.2, 6.4], [2.4, 5.0, -10], [2.5, 8.2, -11], 22, 22);
    };
  },
  // 5 "Baker Hob blew out the oven candle once."  — the kitchen: Hob puffs his cheeks and blows at the candle on the bread table
  (S, cam) => {
    const env = castleKitchen(S);
    const H = hob(S, 'smirk', [2.9, 0, 0.6], 180); const d = base(dragon(S, 2, 0.15, 3)); const tip = env.candle.tip;
    return (t, dur) => { env.update(t);
      const b = sm(t, 0.7, 1.0); H.pose(addPose(idle(t, 0.7), addPose(BLOW(b * 1.3), anticipate(t, 0.7))));
      if (t > 0.6) H.setFace('pout');
      const k = hatch(d, env.candle, t, dur * 0.72); d.root.position.set(tip.x, tip.y + k * 0.2, tip.z); d.root.rotation.y = 0.6; d.update(t, 'hover'); d.look(headOf(H));
      if (k > 0.3) H.setFace('shock');
      camPath(cam, t / dur, [5.2, 5.0, -8.0], [4.6, 4.8, -7.4], [2.9, 4.0, 0.0], [2.9, 4.2, 0.2], 24, 28);
    };
  },
  // 6 "Now everything he bakes comes out toasted."  — Hob lifts a smoking black loaf; the little dragon on his hat puffs fire at it; Hob deadpans
  (S, cam) => {
    const env = castleKitchen(S);
    const H = hob(S, 'bored', [1.2, 0, 1.0], 10); const d = dragon(S, 2, 0.15, 3); const L = loaf(S, [0, 0, 0], 1.0); const P = puffs(S, 10);
    return (t, dur) => { env.update(t);
      H.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 40 }], [0.4, { rFwd: 95, rUp: -15, nod: 0 }], [dur * 0.6, { rFwd: 100, rUp: -12, nod: 6, tilt: 8 }]], t)));
      hold(L, H, 'R', [0.1, 0.0, 0.35]); L.rotation.set(0, 0.3, 0);
      const hp = headOf(H); d.root.position.set(hp.x + 0.15, hp.y + 1.55 * 1.08, hp.z - 0.1); d.root.rotation.y = 0.5; d.update(t, 'perch'); d.look(L.position);
      const br = t > dur * 0.35 && t < dur * 0.6 ? Math.sin((t - dur * 0.35) / (dur * 0.25) * Math.PI) * 0.35 : 0; d.breath(br);
      P(t, dur * 0.4, L.position); if (t > dur * 0.6) H.setFace('pout');
      camPath(cam, t / dur, [3.0, 5.8, 10.6], [2.7, 5.7, 9.6], [1.0, 5.2, 1.0], [1.0, 5.3, 1.0], 26, 28);
    };
  },
  // 7 "Sir Bram blew out his bedside candle."  — Bram in his nightcap-less armour, yawning, blows out a candle stand by the hall door
  (S, cam) => {
    const env = greatHall(S);
    const B = bram(S, 'sleepy', [4.2, 0, -14], -70); const c = stand(S, [1.6, -13.3], 3.6, { light: 5 }); const d = base(dragon(S, 3, 0.15, 3)); const tip = c.tip;
    return (t, dur) => { env.update(t); c.update(t);
      const yawn = sm(t, 0.0, 0.5) * (1 - sm(t, 0.7, 0.9)); const b = sm(t, 0.95, 1.2);
      B.pose(addPose(idle(t, 0.6), t < 0.9 ? { rUp: 150 * yawn, lUp: 150 * yawn, nod: -14 * yawn } : BLOW(b)));
      if (t > 0.9) B.setFace('pout');
      const k = hatch(d, c, t, 1.3); d.root.position.set(tip.x, tip.y + k * 0.25, tip.z); d.update(t, 'hover'); d.look(headOf(B));
      if (k > 0.4) B.setFace('confused');
      camPath(cam, t / dur, [0.2, 5.0, -6.6], [0.6, 4.9, -7.6], [3.0, 4.4, -13.8], [3.0, 4.5, -13.8], 24, 28);
    };
  },
  // 8 "Now his dragon sleeps in his helmet."  — close-up: the tiny dragon curled on top of Bram's helm, snoring a little flame; Bram smiles proudly
  (S, cam) => {
    const env = greatHall(S);
    const B = bram(S, 'proud', [4.2, 0, -10], -20); const d = dragon(S, 3, 0.15, 3); fill(S, [4.5, 6.5, -6.5], 4, 0xffb070, 8);
    return (t, dur) => { env.update(t);
      B.pose(addPose(idle(t, 0.7), hit([[0, { rUp: 10 }], [0.5, POSES.hips], [dur, { ...POSES.hips, nod: -4 }]], t)));
      if (t > dur * 0.55) B.setFace('grin');
      B.root.updateMatrixWorld(true); const top = B.headMesh.localToWorld(new THREE.Vector3(0, 1.0, -0.05)); d.root.position.copy(top); d.root.rotation.y = B.root.rotation.y + 1.6;
      d.update(t, 'curl'); d.blink(1); d.jaw(Math.max(0, Math.sin(t * 2.4)) * 0.4);
      const h = headOf(B).toArray(); faceCam(cam, t / dur, [h[0], h[1] + 0.5, h[2]], -20, { dist: 7.6, lens: 30, side: 0.5, push: 1.2, up: 0.4 });
    };
  },
  // 9 "My grandma, the Queen, does it right."  — slow push-in on Grandma on her throne, a single gold candlestick in her hand
  (S, cam) => {
    const env = greatHall(S);
    const G = gran(S, 'softsmile', [0, 0, -22.2], 0); G.root.position.y = 0.6;
    const cs = candle(S, [0, 0, 0], { h: 0.55, r: 0.1, light: 4, dist: 6 }); fill(S, [2, 5.5, -17], 5, 0xffc890, 10);
    return (t, dur) => { env.update(t); cs.update(t);
      G.pose(addPose(idle(t, 0.5), addPose({ rFwd: 70, rUp: -18, nod: 6 }, lookAt(G, cs.tip))));
      hold(cs.group, G, 'R', [0.05, -0.05, 0.25]);
      camPath(cam, t / dur, [1.4, 5.2, -9.5], [0.9, 5.4, -13.6], [0, 4.6, -22.2], [0, 5.0, -22.0], 26, 30);
    };
  },
  // 10 "She always closes her eyes before she blows."  — close-up: Grandma closes her eyes, smiles, leans in and blows gently
  (S, cam) => {
    const env = greatHall(S);
    const G = gran(S, 'softsmile', [0, 0, -22.2], 0); G.root.position.y = 0.6;
    const cs = candle(S, [0, 0, 0], { h: 0.55, r: 0.1, light: 6, dist: 6 });
    return (t, dur) => { env.update(t); cs.update(t);
      const b = sm(t, dur * 0.6, dur * 0.8); G.pose(addPose(idle(t, 0.4), addPose({ rFwd: 78, rUp: -20, nod: 10 }, BLOW(b * 0.6))));
      hold(cs.group, G, 'R', [0.05, -0.05, 0.25]);
      if (t > dur * 0.3) G.setFace('sleeping'); if (t > dur * 0.6) G.setFace('pout');
      cs.flame.group.rotation.z = b * 0.5; if (b > 0.9) cs.set(0.2);
      const h = headOf(G).toArray(); faceCam(cam, t / dur, [h[0], h[1] - 0.4, h[2]], 0, { dist: 6.8, lens: 32, side: 0.7, push: 0.8, up: -0.2, look: -0.2 });
    };
  },
  // 11 "And her dragons fly straight back into the wick."  — a tiny dragon pops out, does one happy loop and dives back in: the flame relights
  (S, cam) => {
    const env = greatHall(S);
    const G = gran(S, 'sleeping', [0, 0, -22.2], 0); G.root.position.y = 0.6;
    const cs = candle(S, [0, 0, 0], { h: 0.55, r: 0.1, light: 6, dist: 6 }); const d = base(dragon(S, 4, 0.14, 2)); let prev = new THREE.Vector3();
    return (t, dur) => { env.update(t); cs.update(t);
      G.pose(addPose(idle(t, 0.4), { rFwd: 78, rUp: -20, nod: 10 })); hold(cs.group, G, 'R', [0.05, -0.05, 0.25]);
      const tip = cs.tip; const k = hatch(d, cs, t, 0.15); const u = ramp(t, 0.4, dur * 0.8);
      const a = u * Math.PI * 2; const p = new THREE.Vector3(tip.x + Math.sin(a) * 0.9, tip.y + Math.sin(a * 0.5) * 1.4, tip.z + (1 - Math.cos(a)) * 0.6);
      if (t < 0.4) p.copy(tip); steer(d, p, prev); prev.copy(p); d.update(t, 'fly');
      const back = sm(t, dur * 0.8, dur * 0.9); if (back > 0) { d.g.scale.setScalar(Math.max(0.0001, d.base * (1 - back))); cs.set(back); } else if (t > 0.4) cs.set(0);
      if (t > dur * 0.85) G.setFace('delighted');
      camPath(cam, t / dur, [2.6, 6.2, -15.4], [2.2, 6.1, -16.0], [0.3, 5.5, -21.4], [0.2, 5.5, -21.4], 26, 28);
    };
  },
  // 12 "I'm Wren. I'm ten."  — Wren's round tower room at night: she spins round on the rug, cape flaring, and waves
  (S, cam) => {
    const env = towerRoom(S);
    const W = wren(S, 'grin', [1.4, 0, 0.6], -200); fill(S, [2.0, 5.5, 6.0], 8, 0xffc8a0, 12);
    return (t, dur) => { env.update(t);
      const spin = sm(t, 0, 0.7); W.root.rotation.y = (-200 + 200 * spin) * D;
      W.pose(addPose(idle(t, 0.8), t < 0.7 ? { rUp: 60, lUp: 60 } : hit([[0.7, POSES.rest], [0.95, { rUp: 150, nod: -6 }], [1.15, { rUp: 125 }], [1.35, { rUp: 150 }], [1.6, { rUp: 135 }]], t)));
      if (t > 0.7) W.setFace('smile');
      camPath(cam, t / dur, [2.4, 4.0, 8.6], [2.0, 4.2, 7.6], [1.2, 3.6, 0.4], [1.3, 3.9, 0.6], 26, 28);
    };
  },
  // 13 "Well, I was. Tonight I turned eleven."  — the great hall decorated for her birthday: Wren bursts in and skips toward her cake
  (S, cam) => {
    const env = greatHall(S, { cake: true });
    const W = wren(S, 'delighted', [4.6, 0, 6.0], 190); fill(S, [3.0, 6.0, -6.0], 8, 0xffc890, 14);
    return (t, dur) => { env.update(t);
      const w = sm(t, 0, dur * 0.8); W.root.position.set(4.6 - w * 1.6, Math.abs(Math.sin(t * 7)) * 0.35 * (1 - sm(t, dur * 0.75, dur)), 6.0 - w * 7.4);
      W.pose(addPose(w < 0.97 ? walk(t * 1.3, 1, 30) : idle(t, 0.8), { rUp: 40 + Math.sin(t * 7) * 20, lUp: 40 - Math.sin(t * 7) * 20 }));
      const wz = W.root.position.z; camPath(cam, t / dur, [3.0, 5.4, -10.0], [2.8, 5.0, -9.2], [3.6, 3.6, 4.0], [3.0, 3.4, -1.0], 24, 26);
    };
  },
  // 14 "Eleven candles. I blew them out in one breath."  — a: Wren behind the cake takes a huge breath · b: one breath, all eleven candles go out in a ripple
  (S, cam) => {
    const env = greatHall(S, { cake: true });
    const W = wren(S, 'determined', [2.5, 0, -7.6], 0); const ck = env.cake; fill(S, [2.5, 5, -1], 5, 0xffc890, 8);
    return (t, dur) => { env.update(t);
      const [i, p] = seg(t, dur, [0.45]); const tb = dur * 0.5;
      const inh = sm(t, 0.1, dur * 0.4), b = sm(t, tb, tb + 0.2);
      W.pose(addPose(idle(t, 0.5), t < tb ? { bob: 0.15 * inh, nod: -10 * inh, rUp: 20 * inh, lUp: 20 * inh } : BLOW(1.25 * b)));
      W.setFace(t < tb ? 'determined' : 'pout');
      ck.candles.forEach((c, j) => { const tj = tb + 0.05 + j * 0.05; c.set(1 - sm(t, tj, tj + 0.08)); c.flame.group.rotation.x = -0.6 * sm(t, tb, tj); });
      if (i === 0) faceCam(cam, p, headOf(W).toArray(), 0, { dist: 7.4, lens: 30, side: -0.5, push: 0.8, up: 0.9, look: -0.6 });
      else camPath(cam, p, [3.4, 5.6, 0.4], [3.1, 5.4, -0.4], [2.5, 3.2, -4.6], [2.5, 3.3, -4.8], 32, 34);
    };
  },
  // 15 "Eleven tiny dragons. All mine!"  — eleven dragons pop from the smoking wicks and spiral up round Wren; she throws up her arms, starstruck
  (S, cam) => {
    const env = greatHall(S, { cake: true, lit: 0 });
    const W = wren(S, 'starstruck', [2.5, 0, -7.6], 0); const ck = env.cake;
    const ds = ck.candles.map((c, i) => base(dragon(S, i, 0.13, i % 3 === 0 ? 2.5 : 0))); const prev = ds.map(() => new THREE.Vector3());
    return (t, dur) => { env.update(t); ck.set(0);
      ds.forEach((d, i) => { const tip = ck.candles[i].tip; const t0 = 0.1 + i * 0.07; const u = ramp(t, t0, t0 + 0.3); d.g.scale.setScalar(Math.max(0.0001, backOut(u) * d.base)); d.root.visible = u > 0;
        const r = sm(t, t0 + 0.3, dur); const a = i / 11 * Math.PI * 2 + t * 2.2; const p = new THREE.Vector3(tip.x + Math.cos(a) * r * 2.6, tip.y + r * (1.5 + (i % 4) * 0.4), tip.z + Math.sin(a) * r * 2.0);
        if (r === 0) p.copy(tip); steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); });
      W.pose(addPose(idle(t, 0.8), hit([[0, { nod: 10 }], [0.6, { rUp: 140, lUp: 140, nod: -16, bob: 0.25 }], [dur, { rUp: 150, lUp: 150, nod: -20 }]], t)));
      if (t > 0.8) W.setFace('laugh');
      camPath(cam, t / dur, [4.0, 4.6, 3.4], [3.8, 5.4, 2.6], [2.5, 4.0, -5.6], [2.5, 5.2, -6.0], 24, 26);
    };
  },
  // 16 "At first, it was amazing."  — tower room: Wren twirls on the rug while the dragons ring her like a glowing hula hoop
  (S, cam) => {
    const env = towerRoom(S); env.candle.set(0);
    const W = wren(S, 'laugh', [1.4, 0, 0.6], 0); const ds = Array.from({ length: 11 }, (_, i) => dragon(S, i, 0.14, i % 4 === 0 ? 3 : 0)); const prev = ds.map(() => new THREE.Vector3());
    return (t, dur) => { env.update(t);
      W.root.rotation.y = t * 2.2; W.pose(addPose(idle(t, 0.8), { rUp: 85, lUp: 85, nod: -8, bob: Math.abs(Math.sin(t * 4.4)) * 0.12 }));
      ds.forEach((d, i) => { const a = i / 11 * Math.PI * 2 + t * 1.8; const p = new THREE.Vector3(1.4 + Math.cos(a) * 3.3, 3.2 + Math.sin(a * 2 + t) * 0.5, 0.6 + Math.sin(a) * 3.3); steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'fly'); });
      camPath(cam, t / dur, [1.4, 6.2, 8.4], [1.4, 5.4, 7.4], [1.4, 3.6, 0.4], [1.4, 3.6, 0.4], 26, 28);
    };
  },
  // 17 "They lit up my room like stars."  — Wren sits on the rug, chin up, awed; the dragons hang under the roof beams like a glowing constellation
  (S, cam) => {
    const env = towerRoom(S); env.candle.set(0);
    const W = wren(S, 'awe', [1.4, 0, 1.2], 20); sitGround(W); allow(S, ['wren', 'floor']); fill(S, [2.6, 3.0, 5.5], 7, 0xffb070, 9);
    const ds = Array.from({ length: 11 }, (_, i) => dragon(S, i, 0.14, i % 3 === 0 ? 4 : 0));
    const spots = ds.map((_, i) => { const a = i * 2.39; const r = 1.4 + (i % 4) * 1.4; return [1.0 + Math.cos(a) * r, 7.2 + (i % 3) * 0.9, -1.0 + Math.sin(a) * r * 0.8]; });
    return (t, dur) => { env.update(t);
      ds.forEach((d, i) => { d.root.position.set(spots[i][0] + Math.sin(t * 1.3 + i) * 0.15, spots[i][1] + Math.sin(t * 2 + i) * 0.12, spots[i][2]); d.root.rotation.y = i; d.update(t, 'hover'); });
      W.pose(addPose(addPose({ rLeg: 88, lLeg: 88, rFwd: 25, lFwd: 25, rUp: -12, lUp: -12 }, idle(t, 0.5)), { nod: -34, turn: Math.sin(t * 0.8) * 18 }));
      if (t > dur * 0.5) W.setFace('starstruck');
      camPath(cam, t / dur, [3.0, 1.4, 8.6], [2.6, 1.6, 7.6], [1.4, 4.2, 0.0], [1.2, 6.2, -1.0], 22, 22);
    };
  },
  // 18 "They toasted my marshmallows perfectly."  — close: a dragon perched on her knee puffs a tiny flame; the marshmallow turns golden; she beams
  (S, cam) => {
    const env = towerRoom(S); env.candle.set(0);
    const W = wren(S, 'delighted', [1.4, 0, 1.2], 20); sitGround(W); allow(S, ['wren', 'floor']);
    const st = marshmallowStick(S); const d = dragon(S, 5, 0.16, 4); fill(S, [3.5, 3.0, 5], 3, 0xffb070, 8);
    return (t, dur) => { env.update(t);
      W.pose(addPose(addPose({ rLeg: 88, lLeg: 88, lFwd: 40, lUp: -10 }, idle(t, 0.5)), { rFwd: 70, rUp: -6, nod: 18 }));
      const h = pinky(W, 'R'); st.group.position.copy(h); st.group.rotation.set(0.25, 20 * D + 0.5, 0);
      st.group.updateMatrixWorld(true); const m = st.group.localToWorld(st.tipLocal.clone());
      d.root.position.set(m.x + 0.9, m.y - 0.5, m.z + 0.3); d.root.rotation.y = -1.7; d.update(t, 'hover'); d.look(m);
      const br = sm(t, 0.4, 0.6) * (1 - sm(t, dur * 0.7, dur * 0.8)); d.breath(br * 0.25); st.toast(sm(t, 0.5, dur * 0.75) * 0.8);
      if (t > dur * 0.75) W.setFace('laugh');
      camPath(cam, t / dur, [5.4, 3.4, 8.0], [5.0, 3.2, 7.4], [2.0, 2.4, 2.8], [2.0, 2.5, 2.8], 28, 30);
    };
  },
  // 19 "Then they got hungry."  — the great hall at night: the dragons hover in a cluster, tummies rumbling, all heads turning to a wall torch
  (S, cam) => {
    const env = greatHall(S);
    const W = wren(S, 'smile', [3.4, 0, -4.8], -30); const ds = Array.from({ length: 6 }, (_, i) => dragon(S, i, 0.2, i % 3 === 0 ? 3 : 0));
    const tor = env.torches[7].tip;
    return (t, dur) => { env.update(t);
      ds.forEach((d, i) => { d.root.position.set(5.4 + (i % 3) * 0.9, 5.6 + Math.floor(i / 3) * 0.9 + Math.sin(t * 3 + i) * 0.1, -6.5 - (i % 2) * 0.6); d.root.rotation.y = 0.9;
        d.update(t, 'hover'); if (t > 0.5 + i * 0.08) d.look(tor); else d.look(headOf(W)); d.jaw(t > 1 ? 0.4 + Math.sin(t * 8 + i) * 0.2 : 0); });
      W.pose(addPose(idle(t, 0.7), lookAt(W, t < 0.8 ? ds[0].root.position : tor))); if (t > 0.9) W.setFace('nervous');
      camPath(cam, t / dur, [0.0, 5.4, 4.0], [0.6, 5.5, 3.0], [5.0, 4.6, -6.6], [6.0, 5.0, -7.4], 24, 26);
    };
  },
  // 20 "They ate every torch in the great hall."  — wide: the dragons dart wall to wall, gulping each torch flame; the hall darkens torch by torch
  (S, cam) => {
    const env = greatHall(S);
    const W = wren(S, 'shock', [1.0, 0, -3.0], 100); const order = [7, 6, 5, 4, 3, 2, 1, 0, 8, 9];
    const ds = Array.from({ length: 5 }, (_, i) => dragon(S, i, 0.36, 4)); const prev = ds.map(() => new THREE.Vector3());
    return (t, dur) => { env.update(t);
      const step = (dur - 0.4) / order.length; const lit0 = 1;
      order.forEach((ti, j) => { const te = 0.2 + j * step; env.torches[ti].set(1 - sm(t, te, te + 0.15)); });
      env.chL.intensity = 26 * (1 - sm(t, dur * 0.6, dur)); env.chC.forEach(c => c.set(1 - sm(t, dur * 0.6, dur * 0.8))); env.tableC.forEach(c => c.set(1 - sm(t, dur * 0.4, dur * 0.6)));
      ds.forEach((d, i) => { const j = Math.min(order.length - 1, Math.floor((t - 0.2) / step / 1) + 0); const tgtI = order[Math.max(0, Math.min(order.length - 1, Math.floor(Math.max(0, t - 0.2) / step) + (i % 2)))];
        const tp = env.torches[tgtI].tip.clone().add(new THREE.Vector3(Math.sign(-env.torches[tgtI].tip.x || 1) * (0.8 + i * 0.4), 0.4 + (i % 3) * 0.5, i * 0.4 - 0.8));
        const p = prev[i].lengthSq() ? prev[i].clone().lerp(tp, 0.12) : tp; steer(d, p, prev[i]); prev[i].copy(p); d.update(t, 'eat'); d.jaw(0.5 + Math.sin(t * 10 + i) * 0.3); });
      W.pose(addPose(idle(t, 0.8), { ...lookAt(W, ds[0].root.position), rFwd: 60, lFwd: 60, rUp: -14, lUp: -14 }));
      camPath(cam, t / dur, [-3.0, 5.6, 4.0], [-2.4, 6.4, 3.0], [7.0, 5.4, -8], [7.0, 5.6, -11], 20, 20);
    };
  },
  // 21 "And every flame made them bigger."  — close on one dragon swallowing a torch flame: GULP — it puffs up to twice its size; Wren gasps behind
  (S, cam) => {
    const env = greatHall(S); [0, 1, 2, 4, 6, 7].forEach(i => env.torches[i].set(0)); env.chL.intensity = 8;
    const T5 = env.torches[5]; const tip = T5.tip; const d = dragon(S, 1, 0.26, 4);
    const W = wren(S, 'nervous', [5.0, 0, -13.0], 60); const fl = flame(S, { s: 0.6 }); fl.group.visible = false;
    return (t, dur) => { env.update(t);
      const g = 0.7, gulp = sm(t, g, g + 0.25);
      T5.set(1 - sm(t, g - 0.1, g + 0.05));
      fl.group.position.lerpVectors(tip, tip.clone().add(new THREE.Vector3(-1.2, 0.3, 0.1)), gulp); fl.set(t > g - 0.1 && gulp < 1 ? 1 - gulp * 0.7 : 0); fl.update(t);
      const s = 0.26 + 0.34 * backOut(ramp(t, g + 0.25, g + 0.6)); d.g.scale.setScalar(s);
      d.root.position.set(tip.x - 1.6 - (s - 0.26) * 1.5, tip.y - 1.1 - (s - 0.26) * 2.6, tip.z + 0.4); d.root.rotation.y = 1.4; d.update(t, t < g + 0.3 ? 'eat' : 'hover'); d.jaw(t < g + 0.2 ? 0.8 : 0); d.look(tip);
      W.pose(addPose(idle(t, 0.7), addPose(lookAt(W, d.root.position), t > g + 0.4 ? { rFwd: 125, lFwd: 60 } : {}))); if (t > g + 0.4) W.setFace('shock');
      camPath(cam, t / dur, [3.4, 5.6, -2.0], [3.8, 5.5, -3.0], [8.4, 5.0, -9.6], [8.4, 5.0, -9.8], 24, 26);
    };
  },
];
