import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, box, std, camPath, track, seg, hit, talk, lookAt, anticipate, sitOn,
  snowman, catSnowman, pup, knitting, snoreZ, snowBurst, mailbox, bucket, rosette, ladder, snowTown, snowPorch, frostFair, snowMat } from '../../engine/kit.js';
import { NORA, OTIS, DAD9, BEA, PLUM, FERN, TOWN, mk, clamp01, ramp, sm, V, faceCam, fill, allowGround, RUN, DANCE, hold, hn,
  GSIZE, giant, dadSM, beaSM, plumSM, smHead, stompK, shake, kidStomp, CROSS, FISTS } from './common.js';

// fair field with room for the giant at (gx, gz)
export const fair = (S, time = 'day', gx = 0, gz = -18, arch = true, archX = -21) => frostFair(S, { time, arch, archX, clear: [[gx, gz, 10], [gx, gz - 12, 9], [12, 2, 7], [-13, 0, 8]] });
export const GZ = -18;
const letter = (S) => { const g = new THREE.Group(); S.add(g); const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.04), std({ color: 0xfaf6ec })); g.add(m);
  const st = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.05), std({ color: 0xe83a3a })); st.position.set(0.22, 0.1, 0.01); g.add(st); return g; };
const snowball = (S, r = 1) => { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), snowMat()); b.castShadow = true; b.receiveShadow = true; b.scale.setScalar(r); S.add(b); return b; };
// jumping jack pose (k 0..1 phase)
const JACK = (u) => { const s = (1 - Math.cos(u * Math.PI * 2)) / 2; return { rUp: 15 + s * 140, lUp: 15 + s * 140, rLegOut: s * 18, lLegOut: s * 18, bob: Math.sin(u * Math.PI * 2 - Math.PI / 2) > 0.7 ? 0.2 : 0 }; };

export const SHOTS_A = [
  // 2 "In this world," — crane down over the snowy rooftops (chimney smoke, falling snow) to a yard snowman
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const s = snowman(S, { name: 'yard', size: 1.1, scarf: 0x3a8ae8, hat: 'top' }); s.root.position.set(3.5, 0, -1); s.root.rotation.y = -15 * D;
    const k = mk(S, TOWN[2], 'kid2', 'smile', [-5, 0, -1], 30);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-2, 24, 34], [1.5, 6, 16], [0, 12, -16], [2.5, 3.8, -2], 24, 26);
      const wake = ramp(t, dur * 0.62, dur * 0.8);
      s.face({ mouth: 0.3 + wake * 0.7, sleep: 1 - wake, brows: -0.2 * wake }); s.pose({ turn: wake * 12, lUp: 45 + hn([[dur * 0.75, 0], [dur * 0.95, 1]], t) * 80, tilt: Math.sin(t * 2) * 2 * wake });
      k.pose(addPose(idle(t, 0.7), addPose(lookAt(k, smHead(s)), wake > 0.5 ? hit([[dur * 0.8, POSES.rest], [dur * 0.95, { rUp: 140, lUp: 20 }]], t) : {})));
      k.setFace(wake > 0.5 ? 'delighted' : 'smile');
      env.update(t);
    };
  },
  // 3 "snowmen come alive." — close: coal eyes pop open, it shakes the snow off its hat and throws its stick arms up
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const s = snowman(S, { name: 'yard', size: 1.1, scarf: 0x3a8ae8, hat: 'top' }); s.root.position.set(0, 0, 0);
    const b = snowBurst(S, { n: 40, size: 0.09 });
    return (t, dur) => {
      const h = smHead(s); camPath(cam, sm(t, 0, dur), [0.9, h.y + 0.3, 7.2], [0.6, h.y + 0.1, 5.6], [0, h.y - 0.1, 0], [0, h.y - 0.4, 0], 34, 36);
      const o = ramp(t, dur * 0.18, dur * 0.28), sh = t > dur * 0.32 && t < dur * 0.55 ? Math.sin(t * 40) * 6 : 0;
      if (Math.abs(t - dur * 0.33) < 0.02) {} b.update(t);
      s.face({ mouth: 0.2 + 0.8 * ramp(t, dur * 0.55, dur * 0.7), sleep: 1 - o, brows: -0.5 * o, open: t > dur * 0.2 && t < dur * 0.32 ? 0.35 : 0 });
      s.pose(addPose({ tilt: sh, turn: sh * 0.5, nod: -3 * o }, hit([[dur * 0.55, { rUp: 45, lUp: 45 }], [dur * 0.75, { rUp: 135, lUp: 135, hop: 0.25 }], [dur * 0.9, { rUp: 125, lUp: 125 }]], t)));
      env.update(t);
    };
  },
  // 4 "And they copy whoever built them." — a kid does jumping jacks; his snowman (same yellow hat) copies a beat later
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const k = mk(S, TOWN[0], 'kid4', 'grin', [-3, 0, 1], 15);
    const s = snowman(S, { name: 'sm4', size: 1.0, scarf: 0xe83a3a, hat: 'bobble', hatCol: 0xffd23a }); s.root.position.set(3, 0, 0.4); s.root.rotation.y = -15 * D;
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 4.2, 19], [0, 4.0, 16.5], [0, 3.3, 0], [0, 3.4, 0.4], 24, 24);
      const u = Math.max(0, t - 0.3) / 0.9, v = Math.max(0, t - 0.65) / 0.9;
      k.pose(addPose(t > 0.3 ? JACK(u) : idle(t, 1), { turn: t > 1.2 ? 22 : 0 })); k.root.position.y = t > 0.3 ? Math.max(0, Math.sin(u * Math.PI * 2 - Math.PI / 2)) * 0.35 : 0;
      const j = JACK(v); s.pose({ rUp: t > 0.65 ? j.rUp : 45, lUp: t > 0.65 ? j.lUp : 45, hop: t > 0.65 ? Math.max(0, Math.sin(v * Math.PI * 2 - Math.PI / 2)) * 0.3 : 0, turn: -10 });
      s.face({ mouth: 1, brows: -0.3 }); k.setFace(t > 1.4 ? 'laugh' : 'grin');
      env.update(t);
    };
  },
  // 5 "You see, a snowman learns from its maker." — a girl pats a new snowman into shape; it opens its eyes and pats itself, copying her
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const k = mk(S, TOWN[1], 'kid5', 'smile', [-1.6, 0, 1.4], 105);
    const s = snowman(S, { name: 'sm5', size: 0.9, scarf: 0x5aaaff, earmuffs: 0x5aaaff }); s.root.position.set(1.9, 0, 0.6); s.root.rotation.y = -70 * D;
    S.userData.allowContact = [['kid5', 'sm5']];
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [4.0, 4.6, 13.5], [3.4, 4.3, 11.5], [0.2, 3.4, 0.8], [0.3, 3.3, 0.8], 28, 30);
      const pat = Math.sin(t * 9);
      k.pose(addPose({ rFwd: 72 + pat * 14, lFwd: 72 - pat * 14, rUp: -6, lUp: -6, lean: 8 }, idle(t, 0.5))); k.setFace(t > dur * 0.5 ? 'delighted' : 'smile');
      const o = ramp(t, dur * 0.38, dur * 0.48), c = t > dur * 0.55;
      s.face({ sleep: 1 - o, mouth: 0.3 + 0.7 * o, brows: -0.4 * o });
      s.pose({ rFwd: c ? 40 + Math.sin((t - 0.25) * 9) * 18 : 0, lFwd: c ? 40 - Math.sin((t - 0.25) * 9) * 18 : 0, rUp: c ? 10 : 45, lUp: c ? 10 : 45, nod: c ? 18 : 0, turn: c ? 0 : 20 * o });
      env.update(t);
    };
  },
  // 6 "My dad built one last winter." — flashback: Dad rolls a huge snowball across the yard
  (S, cam) => {
    const env = snowPorch(S, {}); S.userData.look = 'flash';
    const d = mk(S, DAD9, 'dad', 'grin', [-6, 0, 3.5], 90);
    const b = snowball(S, 0.9);
    return (t, dur) => {
      const p = t / dur, bx = -3.2 + p * 6, r = 0.9 + p * 0.5; b.position.set(bx, r, 3.5); b.scale.setScalar(r); b.rotation.z = -p * 6;
      d.root.position.set(bx - r - 1.55, 0, 3.5); d.pose(addPose(walk(t * 0.8, 1, 0.8), { rFwd: 75, lFwd: 75, lean: 22, nod: -12 })); d.setFace(p > 0.6 ? 'proud' : 'grin');
      camPath(cam, p, [3, 4.4, 15], [6, 4.4, 14], [bx - 2, 3, 3.5], [bx - 1.5, 3, 3.5], 26);
      cam.lookAt(bx - 1.6, 3.2, 3.5);
      env.update(t);
    };
  },
  // 7 "Now it naps on our porch all day." — Dad asleep on the porch bench, his snowman asleep beside him; both snoring
  (S, cam) => {
    const env = snowPorch(S, {});
    const d = mk(S, DAD9, 'dad', 'sleeping', [-2.6, 0, -4.35], 0); sitOn(d, 2.07);
    const s = dadSM(S); s.root.position.set(2.4, 0.86, -3.3); s.face({ sleep: 1, mouth: 0.4 });
    const z1 = snoreZ(S), z2 = snoreZ(S);
    S.userData.allowContact = [['dad', 'bench*'], ['dadsm', 'porch deck']];
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0.3, 4.6, 12.5], [0.1, 4.4, 10.5], [0, 3.6, -3.6], [0, 3.8, -3.6], 24, 26);
      const br = Math.sin(t * 2.2);
      d.pose({ rLeg: 90, lLeg: 90, rFwd: 20, lFwd: 20, rUp: -10, lUp: -10, tilt: 14 + br * 2, nod: 14 + br * 3, bob: br * 0.03 });
      s.pose({ tilt: -12 + Math.sin(t * 2.2 + 0.4) * 3, nod: 10 + Math.sin(t * 2.2 + 0.4) * 3, squash: 0.03 * Math.sin(t * 2.2 + 0.4) });
      s.face({ sleep: 1, mouth: 0.4, open: 0.1 + 0.1 * (br + 1) });
      d.root.updateMatrixWorld(true); const hp = d.headMesh.getWorldPosition(new THREE.Vector3());
      z1.update(t, [hp.x + 0.4, hp.y + 0.6, hp.z], 1); const sh = smHead(s); z2.update(t + 0.7, [sh.x + 0.4, sh.y + 0.6, sh.z], 1);
      env.update(t);
    };
  },
  // 8 "Grandma Bea's snowman knits scarves." — Grandma and her snowman knitting side by side on the sidewalk
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const g = mk(S, BEA, 'bea', 'softsmile', [-2.7, 0, 1.2], 20);
    const s = beaSM(S); s.root.position.set(2.7, 0, 0.6); s.root.rotation.y = -20 * D;
    const kn = knitting(S, 0xff6ad0), kn2 = knitting(S, 0x7ae85a);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0.2, 4.4, 17.5], [0.1, 4.2, 15.5], [0, 3.4, 0.6], [0, 3.5, 0.6], 24, 25);
      const c = Math.sin(t * 12);
      g.pose(addPose(addPose({ rFwd: 62 + c * 4, lFwd: 62 - c * 4, rUp: -22, lUp: -22, nod: 22 }, idle(t, 0.5)), t > dur * 0.6 ? { nod: 5, turn: 25 } : {}));
      g.root.updateMatrixWorld(true); const a = g.armR.localToWorld(new THREE.Vector3(0, -1.6, 0)), b = g.armL.localToWorld(new THREE.Vector3(0, -1.6, 0));
      kn.position.copy(a).add(b).multiplyScalar(0.5); kn.position.y += 0.25; kn.position.z += 0.1; kn.rotation.y = 20 * D; kn.click(t);
      s.pose({ rFwd: 55 + c * 5, lFwd: 55 - c * 5, rUp: 8, lUp: 8, nod: 16, tilt: Math.sin(t * 1.5) * 4, turn: t > dur * 0.6 ? -20 : 0 });
      const ha = s.hand('R'), hb = s.hand('L'); kn2.position.copy(ha).add(hb).multiplyScalar(0.5); kn2.position.y += 0.2; kn2.rotation.y = -20 * D; kn2.click(t + 0.3);
      s.face({ mouth: 0.8, brows: -0.2 }); g.setFace(t > dur * 0.6 ? 'proud' : 'softsmile');
      env.update(t);
    };
  },
  // 9 "Terrible ones. Just like hers." — close on the snowman's lumpy crooked scarf → Grandma proudly holds up an equally lumpy one
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const g = mk(S, BEA, 'bea', 'proud', [-2.7, 0, 1.2], 20);
    const s = beaSM(S); s.root.position.set(2.7, 0, 0.6); s.root.rotation.y = -20 * D;
    const kn = knitting(S, 0xff6ad0); kn.scale.setScalar(1.5);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.48]);
      if (c === 0) camPath(cam, sm(p, 0, 1), [3.4, 3.4, 6.2], [3.2, 3.3, 5.2], [2.7, 3.0, 0.8], [2.7, 3.2, 0.8], 36, 38);
      else camPath(cam, sm(p, 0, 1), [-2.2, 4.5, 8.2], [-2.3, 4.5, 7.2], [-2.6, 4.1, 1.2], [-2.6, 4.2, 1.2], 34, 36);
      s.pose({ rUp: 45, lUp: 45, tilt: Math.sin(t * 1.5) * 4, nod: c === 0 ? 8 : 0, rFwd: 20, lFwd: 10 }); s.face({ mouth: 1, brows: -0.4 });
      const lift = hit([[dur * 0.5, { rFwd: 40, lFwd: 40, rUp: -15, lUp: -15 }], [dur * 0.68, { rFwd: 92, lFwd: 92, rUp: -14, lUp: -14, nod: 6 }]], t);
      g.pose(addPose(lift, idle(t, 0.6))); g.root.updateMatrixWorld(true);
      const a = g.armR.localToWorld(new THREE.Vector3(0, -1.6, 0)), b = g.armL.localToWorld(new THREE.Vector3(0, -1.6, 0));
      kn.position.copy(a).add(b).multiplyScalar(0.5); kn.position.y += 0.1; kn.position.z += 0.35; kn.rotation.set(0, 20 * D, Math.sin(t * 3) * 0.06);
      g.setFace(t > dur * 0.72 ? 'laugh' : 'proud');
      env.update(t);
    };
  },
  // 10 "Mister Plum, the mailman, built one too." — Mr. Plum walks his route; his snowman (mail cap + bag) hops beside him with a letter
  (S, cam) => {
    const env = snowTown(S, { time: 'day', mailbox: [8.5, -2.6] });
    const p = mk(S, PLUM, 'plum', 'smile', [-6, 0, 2], 90);
    const s = plumSM(S); s.root.rotation.y = 90 * D; const L = letter(S);
    return (t, dur) => {
      const x = -6 + t * 2.2; p.root.position.set(x, 0, 2); p.pose(addPose(walk(t, 1, 0.8), { turn: -25 + Math.sin(t) * 6 }));
      const sx = x - 0.4, hop = Math.abs(Math.sin(t * 6)) * 0.35; s.root.position.set(sx, 0, -1.6); s.pose({ hop, rUp: 45, lUp: 30, lFwd: 55, turn: 20, tilt: Math.sin(t * 6) * 4 });
      s.face({ mouth: 1, brows: -0.3 }); const hl = s.hand('L'); L.position.set(hl.x, hl.y + 0.1, hl.z); L.rotation.set(0, Math.PI / 2, 0.2);
      camPath(cam, t / dur, [x0(0) + 3, 4.2, 15.5], [x0(dur) + 3, 4.1, 14.5], [x0(0), 3.4, 0.2], [x0(dur), 3.4, 0.2], 24);
      p.setFace(t > dur * 0.5 ? 'softsmile' : 'smile');
      env.update(t);
    };
    function x0(u) { return -5 + u * 2.2; }
  },
  // 11 "It runs from every dog in town." — a tiny dog trots up; the snowman shrieks and hops away — and so does Mr. Plum
  (S, cam) => {
    const env = snowTown(S, { time: 'day', mailbox: [7, -2.6] });
    const p = mk(S, PLUM, 'plum', 'smile', [-1.5, 0, 3], 20);
    const s = plumSM(S); s.root.position.set(2.2, 0, -0.6);
    const dog = pup(S, { name: 'dog' }); dog.root.rotation.y = -90 * D;
    return (t, dur) => {
      const flee = dur * 0.4, f = Math.max(0, t - flee);
      camPath(cam, sm(t, 0, dur), [1, 4.4, 17], [-2.5, 4.0, 16], [1, 3.2, 0], [-3, 3.0, 0], 26, 26);
      const dx = 13 - t * 5.2; dog.root.position.set(Math.max(dx, 6.6), 0, 0.6); dog.update(t, t < flee ? 'run' : t < flee + 0.25 ? 'bark' : 'run');
      if (t > flee) dog.root.position.x = 6.6 - Math.max(0, f - 0.3) * 8;
      const sx = 2.2 - (f > 0.25 ? (f - 0.25) * 8.5 : 0); s.root.position.x = sx; s.root.rotation.y = (f > 0.25 ? -90 : 0) * D;
      s.pose(f > 0 ? { rUp: 150, lUp: 150, hop: f > 0.25 ? Math.abs(Math.sin(f * 11)) * 0.7 : hn([[0, 0], [0.2, 0.5]], f), turn: f > 0.25 ? -30 : 30 } : { rUp: 45, lUp: 45, turn: 30 * ramp(t, flee - 0.6, flee) });
      s.face(f > 0 ? { open: 1, brows: -1, mouth: 0 } : { mouth: 1 });
      const px = -1.5 - (f > 0.35 ? (f - 0.35) * 8 : 0); p.root.position.x = px; p.root.rotation.y = (f > 0.35 ? -90 : 20) * D;
      p.pose(f > 0.35 ? addPose(RUN(t), { rUp: 60, lUp: 60 }) : addPose(idle(t, 0.6), f > 0 ? hit([[0, POSES.rest], [0.2, POSES.shock]], f) : lookAt(p, [dx, 2, 0.6])));
      p.setFace(f > 0 ? 'scared' : 'smile');
      env.update(t);
    };
  },
  // 12 "I'm Nora. I'm ten." — Nora spins to camera and lands hands-on-hips, grinning; low hero push-in
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const n = mk(S, NORA, 'nora', 'grin', [0, 0, 2], 180);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0.3, 3.0, 11.5], [0.2, 3.8, 8.4], [0, 4.0, 2], [0, 4.5, 2], 32, 34);
      n.root.rotation.y = hn([[0.1, 180], [0.6, 360]], t) * D; n.pose(addPose(hit([[0.35, POSES.rest], [0.7, POSES.hips]], t), addPose(idle(t, 0.8), anticipate(t, 0.35))));
      n.setFace(t > 0.6 ? 'grin' : 'smirk');
      env.update(t);
    };
  },
  // 13 "And I really, really hate losing." — Nora glares at a red 2nd-place ribbon and flings it over her shoulder
  (S, cam) => {
    const env = snowTown(S, { time: 'day' });
    const n = mk(S, NORA, 'nora', 'pout', [0, 0, 2], 10); const r = rosette(S, 0xd83a3a);
    const tx = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#d83a3a'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#fff'; x.font = '900 30px Inter'; x.textAlign = 'center'; x.fillText('2ND', 32, 42); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const lab = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), new THREE.MeshBasicMaterial({ map: tx })); lab.position.z = 0.08; r.add(lab);
    return (t, dur) => {
      faceCam(cam, sm(t, 0, dur), [0, 4.64, 2], 10, { dist: 7, lens: 34, push: 1.0, side: 0.6, up: -0.2, look: -0.45 });
      const toss = dur * 0.62;
      n.pose(addPose(t < toss ? { rFwd: 70, rUp: -10, nod: 14 + Math.sin(t * 10) * 1.5, tilt: 4 } : hit([[toss, { rFwd: 70, rUp: -10 }], [toss + 0.2, { rUp: 150, rFwd: 20, turn: -25, tilt: -8 }], [toss + 0.6, { ...CROSS, turn: -10 }]], t), idle(t, 0.5)));
      if (t < toss + 0.18) { hold(r, n, 'R', [0, 0.35, 0.3]); r.rotation.set(-0.3, 10 * D, 0); }
      else { const u = t - toss - 0.18; r.position.set(r.position.x - u * 0.15, r.position.y + 0.12 - u * 0.4, r.position.z - 0.12); r.rotation.z += 0.3; }
      n.setFace(t < dur * 0.35 ? 'pout' : 'angry');
      env.update(t);
    };
  },
  // 14 "So for the Frost Fair contest," — crane down through the Frost Fair arch: bunting, entries, townsfolk
  (S, cam) => {
    const env = fair(S, 'day', 0, -18, true, 0);
    const C = [[-5.5, 1.5, 30], [-2, 3.5, -10], [4.5, 2, -30], [6.5, 5, 200], [-10.5, 5.5, 160]].map(([x, z, r], i) => mk(S, TOWN[i], 'f' + i, ['delighted', 'smile', 'awe', 'laugh', 'grin'][i], [x, 0, z], r));
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 17, 24], [0, 5.5, 17], [0, 9, -12], [0, 5, -6], 24, 24);
      C.forEach((a, i) => a.pose(addPose(idle(t, 1, i), i === 2 ? { rUp: 120 + Math.sin(t * 5) * 20 } : i === 4 ? walk(t, 1, 0.6) : {})));
      C[4].root.position.z = 5.5 - t * 1.4;
      env.update(t);
    };
  },
  // 15 "I built the biggest snowman ever." — from proud Nora, tilt up the GIANT snowman (asleep, matching scarf + earmuffs)
  (S, cam) => {
    const env = fair(S); const n = mk(S, NORA, 'nora', 'proud', [-2.5, 0, 5], 20);
    const g = giant(S); g.root.position.set(0.5, 0, GZ); g.face({ sleep: 1, mouth: 0.5 });
    return (t, dur) => {
      const p = sm(t, dur * 0.12, dur);
      camPath(cam, p, [-1.5, 3.6, 17], [1, 5.2, 21], [-2.5, 4.2, 5], [0.5, 14.5, GZ], 26, 22);
      n.pose(addPose(addPose(POSES.hips, idle(t, 0.8)), { turn: -30 * ramp(t, dur * 0.3, dur * 0.6), nod: -18 * ramp(t, dur * 0.3, dur * 0.6) }));
      g.pose({ squash: 0.01 * Math.sin(t * 1.4) }); env.update(t);
    };
  },
  // 16 "Three days. One ladder. Forty buckets." — montage: Nora up the ladder packing snow → rows of buckets, she dumps one more
  (S, cam) => {
    const env = fair(S, 'day', 0, -8);
    const g = giant(S); g.root.position.set(0, 0, -8); g.face({ sleep: 1, mouth: 0.5 });
    const L = ladder(S, 12.5, 0xc8a050); L.position.set(-8.0, 0, -6.6); L.rotation.order = 'YXZ'; L.rotation.set(0.28, 90 * D, 0);
    const n = mk(S, NORA, 'nora', 'determined', [-7.6, 0, -6.6], 90);
    const B = []; for (let i = 0; i < 14; i++) { const a = -1.3 + i * 0.2, b = bucket(S, [0x3a8ae8, 0xe83a3a, 0xffd23a, 0x5ac85a][i % 4]); b.position.set(Math.sin(a) * 7.0, 0, -8 + Math.cos(a) * 7.0); B.push(b); }
    const hb = bucket(S, 0xff7ac8); const puff = snowBurst(S, { n: 30, size: 0.12 });
    S.userData.allowContact = [['nora', 'ground']];
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) { const y = 1.2 + p * 3.2; n.root.position.set(-8.85 + y * 0.29, y, -6.6); n.root.rotation.y = 90 * D;
        n.pose({ rUp: 150 - Math.sin(t * 7) * 25, lUp: 150 + Math.sin(t * 7) * 25, rFwd: 30, lFwd: 30, rLeg: Math.max(0, Math.sin(t * 7)) * 40, lLeg: Math.max(0, -Math.sin(t * 7)) * 40, lean: 12, nod: -20 });
        camPath(cam, sm(p, 0, 1), [-17, 5, 4], [-15, 8, 1.5], [-6.5, 5, -6.6], [-6, 7.5, -6.6], 26, 28); hb.visible = false; n.setFace('determined'); }
      else { n.root.position.set(-1.2, 0, 4.2); n.root.rotation.y = 10 * D; n.root.rotation.x = 0;
        const tip = hit([[0.1, { rFwd: 35, lFwd: 35, rUp: -15, lUp: -15 }], [0.45, { rFwd: 70, lFwd: 70, rUp: -15, lUp: -15, nod: 5, lean: 6 }]], p * dur * 0.5);
        n.pose(addPose(tip, idle(t, 0.5))); n.root.updateMatrixWorld(true);
        const a = n.armR.localToWorld(new THREE.Vector3(0, -1.6, 0)), b = n.armL.localToWorld(new THREE.Vector3(0, -1.6, 0)); hb.visible = true; hb.position.copy(a).add(b).multiplyScalar(0.5);
        hb.rotation.x = -Math.PI * ramp(p, 0.2, 0.45); hb.position.y -= 0.2; hb.position.z += 1.0;
        if (Math.abs(p - 0.3) < 0.02 && !hb.userData.f) { puff.fire(hb.position.clone().add(new THREE.Vector3(0, 0.6, -0.5)), t, { up: 6, spread: 1.4 }); hb.userData.f = 1; }
        camPath(cam, sm(p, 0, 1), [3, 2.6, 18], [2, 3.2, 16], [0, 4.4, -1], [0, 5.4, -2], 24, 24); n.setFace(p > 0.5 ? 'proud' : 'determined'); }
      puff.update(t); g.pose({ rUp: 12, lUp: 12 }); env.update(t);
    };
  },
  // 17 "When it woke up, it waved at me." — the giant's coal eyes open (low angle) → it waves a huge stick arm; Nora waves back
  (S, cam) => {
    const env = fair(S); const g = giant(S); g.root.position.set(0, 0, GZ);
    const n = mk(S, NORA, 'nora', 'awe', [-2, 0, 4], 195);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.52]); const o = ramp(t, dur * 0.12, dur * 0.3);
      g.face({ sleep: 1 - o, mouth: 0.4 + 0.6 * ramp(t, dur * 0.3, dur * 0.45), brows: -0.6 * o });
      g.pose(addPose({ nod: 8 - 14 * o, squash: -0.02 * o }, c === 1 ? { rUp: 150 + Math.sin(t * 5) * 20, turn: -6 } : {}));
      if (c === 0) camPath(cam, sm(p, 0, 1), [0.6, 10.5, -1.5], [0.4, 11.5, -3.5], [0, 18.3, GZ], [0, 18.0, GZ], 34, 36);
      else camPath(cam, sm(p, 0, 1), [7, 3.0, 14], [5.5, 3.4, 13], [-1, 9.5, -6], [-1, 10.5, -8], 24, 24);
      n.pose(addPose(idle(t, 0.8), c === 1 ? hit([[dur * 0.6, POSES.rest], [dur * 0.75, { rUp: 150 + Math.sin(t * 9) * 18, lUp: 8 }]], t) : {})); n.setFace(c === 1 ? 'delighted' : 'awe');
      env.update(t);
    };
  },
  // 18 "I danced. It danced. The whole town cheered!" — Nora dances up front, the giant copies behind her, the crowd cheers
  (S, cam) => {
    const env = fair(S); const g = giant(S); g.root.position.set(0, 0, GZ);
    const n = mk(S, NORA, 'nora', 'laugh', [0, 0, 5], 0);
    const C = [[-4.6, 0.5, 30], [-8.2, -1.5, 40], [4.6, 1, -30], [8.2, -1, -40]].map(([x, z, r], i) => mk(S, TOWN[i], 'c' + i, ['laugh', 'delighted', 'starstruck', 'laugh'][i], [x, 0, z], r));
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 2.4, 21], [0, 3.0, 18], [0, 8.5, -6], [0, 9.5, -7], 22, 22);
      const dn = t > 0.3 ? DANCE(t, 1) : idle(t, 1); n.pose(dn); n.root.position.y = 0;
      const gd = t > 1.0 ? DANCE(t - 0.7, 1) : null;
      g.pose(gd ? { rUp: gd.rUp, lUp: gd.lUp, tilt: gd.bodyTilt * 1.5, turn: gd.turn, hop: gd.bob * 1.5, bodyTurn: Math.sin((t - 0.7) * 3.5) * 10 } : {}); g.face({ mouth: 1, brows: -0.5 });
      C.forEach((a, i) => a.pose(addPose(idle(t, 1, i), t > dur * 0.5 + i * 0.1 ? { rUp: 145 + Math.sin(t * 8 + i) * 10, lUp: 145 + Math.sin(t * 8 + i + 1) * 10, bob: Math.abs(Math.sin(t * 6 + i)) * 0.15 } : lookAt(a, [0, 14, GZ]))));
      env.update(t);
    };
  },
  // 19 "But first prize went to Otis," — Mayor Fern hands the blue rosette across the judges' table to Otis
  (S, cam) => {
    const env = fair(S);
    const f = mk(S, FERN, 'fern', 'smile', [8.2, 0, -6.0], -45); const o = mk(S, OTIS, 'otis', 'nervous', [3.4, 0, -3.4], 45);
    const cat = catSnowman(S, { name: 'snowcat', s: 1 }); cat.root.position.set(0.4, 0, -1.4); cat.root.rotation.y = 30 * D;
    const r = rosette(S, 0x2a6ae8);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [3.0, 4.8, 13], [3.6, 4.7, 11.2], [5.6, 4.0, -3.5], [5.6, 4.2, -3.5], 26, 28);
      const give = ramp(t, dur * 0.35, dur * 0.6);
      f.pose(addPose(idle(t, 0.6), hit([[dur * 0.15, POSES.rest], [dur * 0.38, { rFwd: 95, rUp: -8, lean: 10 }], [dur * 0.65, { rFwd: 20, lUp: 0 }]], t)));
      o.pose(addPose(idle(t, 0.7), t > dur * 0.62 ? hit([[dur * 0.62, POSES.rest], [dur * 0.8, { rUp: 150, lUp: 150, bob: 0.15 }]], t) : lookAt(o, [7.5, 4, -4])));
      o.setFace(t > dur * 0.62 ? 'starstruck' : 'nervous');
      f.root.updateMatrixWorld(true); const fh = f.armR.localToWorld(new THREE.Vector3(0, -1.6, 0)); o.root.updateMatrixWorld(true); const oc = o.body.localToWorld(new THREE.Vector3(0.35, 1.5, 0.6));
      r.position.lerpVectors(fh, oc, give); r.rotation.set(0, 50 * D * give, 0);
      cat.update(t, t > dur * 0.62 ? 'wag' : 'sit');
      env.update(t);
    };
  },
  // 20 "for a tiny snowman shaped like his cat." — close on the tiny snow cat (tail wag) → Nora's jaw drops
  (S, cam) => {
    const env = fair(S); const g = giant(S); g.root.position.set(0, 0, GZ);
    const cat = catSnowman(S, { name: 'snowcat', s: 1 }); cat.root.position.set(6, 0, 1);
    const r = rosette(S, 0x2a6ae8); r.scale.setScalar(0.7); r.position.set(6, 0.95, 1.86);
    const n = mk(S, NORA, 'nora', 'shock', [-2, 0, 4], 0);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, sm(p, 0, 1), [6.9, 1.7, 6.3], [6.5, 1.6, 5.2], [6, 1.4, 1], [6, 1.5, 1], 34, 38);
      else faceCam(cam, sm(p, 0, 1), [-2, 4.64, 4], 0, { dist: 6.6, lens: 36, push: 0.9, side: -0.6 });
      cat.update(t, 'wag'); cat.head.rotation.z += Math.sin(t * 2) * 0.1;
      n.pose(addPose(idle(t, 0.5), c === 1 ? hit([[dur * 0.5, POSES.rest], [dur * 0.62, { ...POSES.shock, bob: -0.05 }]], t) : {})); n.setFace(p > 0.5 && c === 1 ? 'angry' : 'shock');
      g.face({ mouth: c === 1 && p > 0.5 ? -0.4 : 1 }); env.update(t);
    };
  },
  // 21 "I stomped my foot." — ground-level: Nora winds up and STOMPS; a puff of snow
  (S, cam) => {
    const env = fair(S); const n = mk(S, NORA, 'nora', 'angry', [0, 0, 4], 15); const b = snowBurst(S, { n: 34, size: 0.1 });
    let fired = false;
    return (t, dur) => {
      const t0 = dur * 0.5; camPath(cam, sm(t, 0, dur), [2.2, 1.3, 13.5], [1.8, 1.4, 12.5], [0, 3.0, 4], [0, 3.3, 4], 26, 27);
      n.pose(addPose(addPose(FISTS, kidStomp(t, t0)), { nod: 6 })); if (t > t0 && !fired) { b.fire([n.root.position.x - 0.5, 0.2, 4.6], t0, { up: 4, spread: 2.2 }); fired = true; }
      b.update(t); shake(cam, t, t0, 0.12, 0.35); n.setFace(t > t0 ? 'angry' : 'pout');
      env.update(t);
    };
  },
  // 22 "Behind me, something stomped too." — Nora freezes; behind her the giant lifts... and SLAMS down (snow burst, camera shake)
  (S, cam) => {
    const env = fair(S); const g = giant(S); g.root.position.set(-1.5, 0, GZ);
    const n = mk(S, NORA, 'nora', 'angry', [2.4, 0, 6], 0); const b = snowBurst(S, { n: 90, size: 0.35 });
    let fired = false;
    return (t, dur) => {
      const t0 = dur * 0.5; camPath(cam, sm(t, 0, dur), [0.5, 2.2, 17.5], [0.5, 2.0, 16.5], [0, 8.5, -6], [0, 8, -6], 22, 22);
      const k = stompK(t, t0, 1.0, 0.6); g.pose({ hop: k.hop, squash: k.squash, lUp: 50, rUp: 50 }); g.face({ mouth: -0.6, brows: 1 });
      if (t > t0 && !fired) { b.fire([-1.5, 0.5, GZ + 5.5], t0, { up: 9, spread: 7, scale: 1.5 }); fired = true; } b.update(t); shake(cam, t, t0, 0.35, 0.7);
      n.pose(addPose(addPose(FISTS, idle(t, 0.5)), t > t0 + 0.1 ? hit([[t0 + 0.1, { turn: 0 }], [t0 + 0.4, { turn: -55, nod: -5, bob: -0.05 }]], t) : {}));
      n.setFace(t > t0 + 0.1 ? 'nervous' : 'angry');
      env.update(t);
    };
  },
  // 23 "I kicked the snow. It kicked a whole snowdrift." — Nora kicks a puff → the giant swings and a wave of snow flies over the crowd
  (S, cam) => {
    const env = fair(S); const g = giant(S); g.root.position.set(0, 0, GZ);
    const n = mk(S, NORA, 'nora', 'angry', [0, 0, 4], 20); const b = snowBurst(S, { n: 30, size: 0.1 }), B = snowBurst(S, { n: 140, size: 0.45, seed: 8 });
    const C = [[-8, 3, 20], [8.5, 2.5, -20]].map(([x, z, r], i) => mk(S, TOWN[i + 2], 'c' + i, 'shock', [x, 0, z], r));
    const drift = new THREE.Mesh(new THREE.SphereGeometry(4, 18, 10), snowMat()); drift.scale.set(1.6, 0.45, 1); drift.position.set(3, 0, GZ + 7); S.add(drift);
    let f1 = false, f2 = false;
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.42]); const t1 = dur * 0.2, t2 = dur * 0.62;
      if (c === 0) camPath(cam, sm(p, 0, 1), [3, 2.0, 15.5], [2.6, 2.2, 14.5], [0, 3.4, 4], [0, 3.6, 4], 26, 27);
      else camPath(cam, sm(p, 0, 1), [6, 3, 22], [5, 3.6, 20], [0, 8, -4], [1, 9, -5], 22, 22);
      n.pose(addPose(FISTS, hit([[t1 - 0.25, { rLeg: -30, lean: -4 }], [t1, { rLeg: 75, lean: 8 }], [t1 + 0.35, { rLeg: 0 }]], t)));
      if (t > t1 && !f1) { b.fire([0.3, 0.3, 5.6], t1, { up: 5, spread: 2 }); f1 = true; }
      const sw = hit([[t2 - 0.5, { bodyTurn: 0 }], [t2 - 0.15, { bodyTurn: -25, lean: -8 }], [t2 + 0.2, { bodyTurn: 30, lean: 10, hop: 0.4 }], [t2 + 0.8, { bodyTurn: 0, lean: 0 }]], t);
      g.pose({ ...sw, rUp: 60, lUp: 60 }); g.face({ mouth: -0.6, brows: 1 });
      if (t > t2 && !f2) { B.fire([2, 2, GZ + 8], t2, { up: 12, spread: 9, scale: 1.4 }); f2 = true; } drift.scale.y = 0.45 * (1 - 0.8 * ramp(t, t2, t2 + 0.2));
      b.update(t); B.update(t); if (c === 1) shake(cam, t, t2, 0.25, 0.6);
      C.forEach((a, i) => a.pose(addPose(idle(t, 1, i), t > t2 + 0.2 ? hit([[t2 + 0.2, POSES.rest], [t2 + 0.45, { rFwd: 140, lFwd: 140, rUp: -20, lUp: -20, nod: 20, bob: -0.2 }]], t) : lookAt(a, [0, 14, GZ]))));
      n.setFace('angry'); env.update(t);
    };
  },
];
