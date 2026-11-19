import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, box, std, camPath, track, seg, hit, talk, lookAt, anticipate, phone,
  neonBeach, waitBlob, flamingo, gameRoom, countdown } from '../../engine/kit.js';
import { RICO, LULU, SAL, DANI, SIGNKID, CROWD, mk, clamp01, ramp, sm, V, faceCam, fill, allowGround, SKATE, hold, PHONE_UP } from './common.js';
import { hn } from './common.js';

// phone screen: countdown / delay
export const cdPhone = (S, title = '12 DAYS', sub = 'until GTA 6', col = '#ff3ab8') => {
  const g = phone(S, title, sub); const sc = g.children[1];
  const c = document.createElement('canvas'); c.width = 256; c.height = 480; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 480); gr.addColorStop(0, '#2a0a4a'); gr.addColorStop(1, '#0a0618'); x.fillStyle = gr; x.fillRect(0, 0, 256, 480);
  x.strokeStyle = '#2ae8ff'; x.lineWidth = 6; x.beginPath(); x.arc(128, 150, 70, 0, 7); x.stroke(); x.fillStyle = col; x.beginPath(); x.arc(128, 150, 40, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.font = '900 56px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('6', 128, 154);
  x.font = '900 46px Inter'; x.fillStyle = col === '#ff2a3a' ? '#ff5a6a' : '#fff6b0'; x.fillText(title, 128, 300); x.font = '700 26px Inter'; x.fillStyle = '#2ae8ff'; x.fillText(sub, 128, 350);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; sc.material = new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
  return g; };
// blob that sits on top of a countdown board
const onBoard = (b, board, dx = 0) => { b.root.position.set(board.group.position.x + dx, board.top - 0.15, board.group.position.z); };
const BOARD_STRIP = [10, 16.5, -14.6], BOARD_BEACH = [6, 13.5, -15];
const crowdRow = (S, n, x0, dx, z, ry = 0, faces = ['awe', 'starstruck', 'neutral', 'bored', 'smile', 'awe'], scale = 1) =>
  [...Array(n)].map((_, i) => mk(S, CROWD[i % CROWD.length], 'fan' + i + '_' + z, faces[i % faces.length], [x0 + i * dx, 0, z + (i % 2) * 0.6], ry, scale));

export const SHOTS_A = [
  // 2 "In Vice City, waiting comes alive."  — crane down over the palms onto the neon strip at sunset; the welcome sign; a tiny pink blob on the countdown blinks awake
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', billboard: BOARD_STRIP, sign: { x: -11, y: 8, z: -3.5 }, board: { text: '12 DAYS', sub: 'UNTIL LAUNCH' } });
    const b = waitBlob(S, { name: 'wait', size: 0.55 }); onBoard(b, env.board, 3);
    const f = [flamingo(S, [-3, 4], 30), flamingo(S, [2.5, 6], -40, 0.9)];
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-4, 26, 40], [-5, 6, 22], [-4, 14, -10], [-3, 8, -8], 24, 26);
      b.animate(t, 'idle'); b.look(cam.position); b.blink(t < dur * 0.45 ? 1 : (t < dur * 0.5 ? 0.5 : 0));
      f[0].update(t, 'walk'); f[0].position.x = -3 + t * 0.6; f[1].update(t, 'stand');
      env.update(t);
    };
  },
  // 3 "Every time you check a countdown, the Wait grows."  — a fan checks his phone; a pink spark zips up to the blob on the beach billboard and it puffs up (boing)
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach', billboard: BOARD_BEACH, board: { text: '12 DAYS', sub: 'UNTIL LAUNCH' } });
    const a = mk(S, CROWD[4], 'fan', 'starstruck', [-2.5, 0, 4], 25); const ph = cdPhone(S);
    const b = waitBlob(S, { name: 'wait', size: 0.55 }); onBoard(b, env.board, 0);
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff7ad8 })); S.add(spark);
    const sp2 = new THREE.PointLight(0xff5ab8, 6, 6, 1.6); spark.add(sp2);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.45]);
      if (c === 0) camPath(cam, p, [1.0, 5.6, 11.5], [0.2, 5.4, 10.2], [-2.3, 4.6, 4], [-2.3, 4.5, 4], 32, 36);
      else camPath(cam, p, [2, 7, 12], [3.5, 9, 10], [3, 10, -12], [5, 13, -14], 26, 28);
      a.pose(addPose(addPose(PHONE_UP, idle(t, 0.6)), { turn: 8 })); hold(ph, a, 'R', [0, 0.25, 0.25]); ph.lookAt(cam.position);
      const k = ramp(t, dur * 0.42, dur * 0.72); const from = ph.position.clone(), to = new THREE.Vector3(env.board.group.position.x, env.board.top + 1.2, env.board.group.position.z);
      spark.visible = k > 0 && k < 1; spark.position.lerpVectors(from, to, k); spark.position.y += Math.sin(k * Math.PI) * 4;
      const g = t > dur * 0.72 ? 0.55 + 0.25 * hn([[0, 0], [0.35, 1]], t - dur * 0.72) : 0.55; b.grow(g); onBoard(b, env.board, 0);
      b.animate(t, t > dur * 0.72 ? 'bounce' : 'idle'); b.look(V([-2, 4, 4]));
      env.update(t);
    };
  },
  // 4 "And this whole town was waiting for GTA Six."  — the beach crowd under the giant countdown; a kid's sign "GTA 6 BEFORE MY HOMEWORK"
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach', billboard: BOARD_BEACH, board: { text: '12 DAYS', sub: 'UNTIL LAUNCH' } });
    const b = waitBlob(S, { name: 'wait', size: 0.8 }); onBoard(b, env.board, 0);
    const C = crowdRow(S, 6, -11, 4.4, -1, 160, ['awe', 'starstruck', 'awe', 'delighted', 'awe', 'starstruck']);
    const k = mk(S, SIGNKID, 'signkid', 'grin', [-1.5, 0, 6], 200);
    const sign = new THREE.Group(); S.add(sign);
    const st = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff8e8'; x.fillRect(0, 0, 512, 256);
      x.fillStyle = '#ff3ab8'; x.font = '900 88px Inter'; x.textAlign = 'center'; x.fillText('GTA 6', 256, 100); x.fillStyle = '#2a2a6a'; x.font = '900 40px Inter'; x.fillText('BEFORE MY HOMEWORK', 256, 180);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const card = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 0.08), [std({ color: 0xc8a878 }), std({ color: 0xc8a878 }), std({ color: 0xc8a878 }), std({ color: 0xc8a878 }), std({ map: st }), std({ map: st })]); sign.add(card);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-1, 3.2, 18], [0.5, 2.4, 14], [0, 8.5, -6], [2, 11, -10], 24, 26);
      C.forEach((a, i) => a.pose(addPose(addPose(idle(t, 0.8, i), lookAt(a, [6, 13, -15])), i === 3 ? hit([[0.3, POSES.rest], [0.8, { rUp: 150, lUp: 20 }]], t) : {})));
      k.pose(addPose({ rUp: 150, lUp: 150, rFwd: 10, lFwd: 10 }, { bob: Math.abs(Math.sin(t * 6)) * 0.12, bodyTilt: Math.sin(t * 3) * 5 }));
      k.root.updateMatrixWorld(true); const hp = k.headMesh.getWorldPosition(new THREE.Vector3()); sign.position.set(hp.x, hp.y + 2.6, hp.z - 0.4); sign.rotation.set(0, (200 - 180) * D + Math.PI, Math.sin(t * 3) * 0.08); sign.rotateY(Math.PI);
      b.animate(t, 'idle'); onBoard(b, env.board, 0); b.look(cam.position);
      env.update(t);
    };
  },
  // 5 "Grandpa Sal bought his Day One shirt years ago."  — Grandpa roller-skates the promenade through a flock of flamingos; dolly alongside
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', billboard: BOARD_STRIP, board: { text: '12 DAYS', sub: 'UNTIL LAUNCH' } });
    const s = mk(S, SAL, 'sal', 'delighted', [-10, 0, 3], 90); allowGround(S, 'sal');
    const F = [[-3.5, -1.8, -30], [-1, 10.2, 40], [2.5, 1.2, 10], [5, 12.4, -60], [7.5, 3.0, 20]].map(([x, z, r], i) => flamingo(S, [x, z], r, 0.95 + (i % 2) * 0.1));
    return (t, dur) => {
      const x = -9 + t * 5.2, z = 0.5 + t * 2.6; s.root.position.set(x, 0, z); s.root.rotation.y = (62 + Math.cos(t * 2) * 10) * D;
      s.pose(addPose(SKATE(t, 1), { turn: -30 + Math.sin(t * 1.5) * 10 }));
      camPath(cam, t / dur, [-2, 4.6, 17], [x0(dur) + 3, 4.6, 15], [-8, 4.2, 1], [x0(dur), 4.4, 0.5 + dur * 2.6], 28, 30);
      F.forEach((f, i) => { const near = Math.hypot(f.position.x - x, f.position.z - s.root.position.z) < 4.6; f.update(t + i, near ? 'flap' : 'stand'); f.head.lookAt(s.root.position.x, 5, s.root.position.z); });
      s.setFace(t > dur * 0.5 ? 'laugh' : 'delighted');
      env.update(t);
    };
    function x0(dur) { return -9 + dur * 5.2; }
  },
  // 6 "It's so faded, the flamingos look like ghosts."  — close on Grandpa proudly tugging his washed-out shirt; a real flamingo leans in, confused
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', cars: false });
    const s = mk(S, SAL, 'sal', 'proud', [0, 0, 2], 0); const f = flamingo(S, [3.4, -0.6], -60, 1.05);
    fill(S, [1.5, 6.5, 7], 7, 0xffd0b0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.8, 4.6, 10.5], [0.5, 4.3, 9.0], [0.6, 3.9, 2], [0.8, 4.0, 2], 32, 36);
      s.pose(addPose(hit([[0, { rFwd: 30, lFwd: 30, rUp: -10, lUp: -10 }], [0.5, { rFwd: 45, lFwd: 45, rUp: -18, lUp: -18, lean: -6, nod: 8 }], [1.2, { rFwd: 40, lFwd: 40, rUp: -16, lUp: -16, lean: -10, nod: -6 }]], t), idle(t, 0.6)));
      if (t > dur * 0.55) s.setFace('smirk');
      f.update(t, 'stand'); f.head.rotation.set(0.4 + Math.sin(t * 2) * 0.1, 0, 0.35 * Math.min(1, t)); f.rotation.y = -60 * D + Math.sin(t) * 0.1;
      env.update(t);
    };
  },
  // 7 "My sister Lulu works at Pixel Palace."  — Lulu leans in the shop door under the neon sign; her own little waiting-blob bobs beside her
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', shop: true, cars: false });
    const l = mk(S, LULU, 'lulu', 'bored', [0.6, 0, -13.6], 10); allowGround(S, 'lulu');
    const mb = waitBlob(S, { name: 'miniwait', size: 0.32 }); mb.root.position.set(3.6, 0, -13.4); allowGround(S, 'miniwait');
    fill(S, [1.5, 6, -7], 10, 0xffc8e8);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 5.5, 4], [2.4, 5.0, 1.0], [0.5, 5.4, -14], [0.8, 4.3, -13.6], 26, 32);
      l.pose(addPose(addPose({ rUp: 25, rFwd: -10, lFwd: 70, lUp: -8, bodyTilt: 6, nod: 6 }, idle(t, 0.8)), { tilt: Math.sin(t * 0.7) * 4 }));
      mb.animate(t, 'bounce'); mb.look(l.headMesh.getWorldPosition(new THREE.Vector3())); mb.root.position.y = 0;
      env.update(t);
    };
  },
  // 8 "Every day, someone asks, "Is it out yet?""  — the sign kid pops in and asks; Lulu's face goes flat; her mini blob puffs bigger
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', shop: true, cars: false });
    const l = mk(S, LULU, 'lulu', 'neutral', [-1.4, 0, -13.2], 30); const k = mk(S, SIGNKID, 'kid', 'starstruck', [2.4, 0, -11.0], -120); allowGround(S, 'lulu', 'kid');
    const mb = waitBlob(S, { name: 'miniwait', size: 0.32 }); mb.root.position.set(-5.2, 0, -12.6); allowGround(S, 'miniwait');
    fill(S, [0, 6, -6], 10, 0xffc8e8);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.55]);
      if (c === 0) camPath(cam, p, [2.5, 4.8, -2.0], [2.0, 4.8, -3.0], [0.4, 4.4, -12.4], [0.4, 4.4, -12.4], 30, 32);
      else faceCam(cam, p, [-1.4, 4.64, -13.2], 30, { dist: 6.6, lens: 36, side: -0.6 });
      k.root.position.x = 2.4 + (1 - backIn(clamp01(t / 0.5))) * 3; k.pose(addPose(addPose(hit([[0, { bob: 0.2 }], [0.5, { rUp: 20, rFwd: 60, lean: 12 }]], t), talk(t, t < dur * 0.6 ? 1 : 0)), lookAt(k, [-1.4, 4.6, -13.2])));
      l.pose(addPose(addPose(idle(t, 0.5), lookAt(l, [2.4, 4.4, -11])), t > dur * 0.6 ? { nod: 6, tilt: -8 } : {}));
      l.setFace(t > dur * 0.62 ? 'bored' : 'neutral');
      mb.grow(t > dur * 0.62 ? 0.32 + 0.14 * hn([[0, 0], [0.3, 1]], t - dur * 0.62) : 0.32); mb.animate(t, 'idle'); mb.look(V([2, 4, -10]));
      env.update(t);
    };
    function backIn(x) { return 1 - (1 - x) * (1 - x); }
  },
  // 9 "At sunset, nobody watches the sun."  — a huge sunset behind the beach crowd; everyone faces the other way, staring up
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach' });
    const C = crowdRow(S, 5, -8.8, 4.4, -5, 0, ['awe', 'starstruck', 'awe', 'neutral', 'awe']);
    const r = mk(S, RICO, 'rico', 'awe', [1.2, 0, 1.2], 0);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 3.5, 16], [0, 2.8, 13], [0, 7, -40], [0, 5, -20], 24, 26);
      [...C, r].forEach((a, i) => a.pose(addPose(addPose(idle(t, 0.7, i), lookAt(a, [0, 20, 30])), { nod: -30 })));
      env.update(t);
    };
  },
  // 10 "They watch the giant countdown instead. [pause]"  — reverse: the billboard ticks down, the tiny pink blob dozes on top
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach', billboard: [0, 13.5, -12], board: { text: '12 DAYS', sub: 'UNTIL LAUNCH' } });
    const b = waitBlob(S, { name: 'wait', size: 0.55 }); onBoard(b, env.board, 3.5);
    const C = crowdRow(S, 4, -6.6, 4.4, 1, 180, ['awe', 'awe', 'starstruck', 'awe']);
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [1, 1.8, 14], [0, 3.5, 11], [0, 8, -8], [0, 13, -12], 24, 26);
      env.board.set(t < dur * 0.5 ? '12 DAYS' : '11 DAYS');
      C.forEach((a, i) => a.pose(addPose(idle(t, 0.6, i), lookAt(a, [0, 14, -12]))));
      b.animate(t * 0.5, 'idle'); b.blink(0.85); b.root.rotation.z = Math.sin(t * 1.2) * 0.05;
      env.update(t);
    };
  },
  // 11 "I'm Rico. I'm eleven."  — Rico on the promenade at sunset, pushes his sunglasses up and grins at us
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', billboard: BOARD_STRIP, board: { text: '12 DAYS', sub: 'UNTIL LAUNCH' } });
    const r = mk(S, RICO, 'rico', 'grin', [0, 0, 3], 0); fill(S, [1.5, 6.5, 9], 8, 0xffd8c0);
    const b = waitBlob(S, { name: 'wait', size: 0.55 }); onBoard(b, env.board, 3);
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 4.6, 12.5], [0.4, 4.6, 10.2], [0.2, 4.3, 3], [0.2, 4.4, 3], 30, 34);
      r.pose(addPose(addPose(hit([[0, POSES.rest], [0.35, { rUp: 140, rFwd: 20, turn: -6 }], [0.9, { rUp: 125, rFwd: 15, tilt: 6 }], [1.4, { rUp: 20, lUp: 20, rFwd: 10 }]], t), idle(t, 0.7)), talk(t, 0.5)));
      if (t > 1.0) r.setFace('smile');
      b.animate(t, 'idle'); onBoard(b, env.board, 3); env.update(t);
    };
  },
  // 12 "I was eight when the first trailer dropped."  — flashback: little Rico on the rug, jaw dropped in the TV's neon glow (abstract graphics only)
  (S, cam) => {
    const env = gameRoom(S, { dawn: false, flash: true });
    const r = mk(S, { ...RICO, outfit: [] }, 'rico', 'starstruck', [0, 0, 4.5], 0, 0.8);
    r.root.position.y = -1.5 * 0.8; S.userData.allowContact = [['rico', 'floor']]; fill(S, [0.5, 4.5, 8], 9, 0xc8a8ff, 10);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.5]);
      if (c === 0) camPath(cam, p, [3.5, 6.5, -2], [2.5, 5.8, -0.5], [0, 2, 6], [0, 3, 8], 26, 28);
      else faceCam(cam, p, [0, 3.7 - 1.2 + 0.3, 4.5], 0, { dist: 5.8, lens: 34, side: 0.4, up: -0.2 });
      env.tv.screen('load', clamp01(t / dur), t);
      r.pose(addPose(addPose({ rLeg: 90, lLeg: 90, rFwd: 40, lFwd: 40, lean: 8 }, idle(t, 0.4)), hit([[0.6, {}], [1.0, { rFwd: 120, lFwd: 120, rUp: 20, lUp: 20 }]], t)));
      env.update(t);
    };
  },
  // 13 "I checked the countdown every five minutes."  — quick cuts: Rico checks his phone on the promenade, on the beach, in bed (phone glow)
  (S, cam) => {
    const e1 = neonBeach(S, { time: 'sunset', view: 'strip', cars: true });
    const r = mk(S, RICO, 'rico', 'starstruck', [0, 0, 3], 10); const ph = cdPhone(S, '11 DAYS');
    fill(S, [1, 6.5, 8], 9, 0xffd8c0);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.34, 0.67]);
      r.root.position.set(c === 1 ? 4 : 0, 0, 3); r.root.rotation.y = (c === 1 ? -20 : 10) * D;
      faceCam(cam, p, [r.root.position.x, 4.64, 3], c === 1 ? -20 : 10, { dist: 7.2 - p * 0.6, lens: 32, side: c === 2 ? -1.0 : 0.8, up: 0.0 });
      r.pose(addPose(addPose(PHONE_UP, idle(t, 0.5)), anticipate(t, 0.25)));
      hold(ph, r, 'R', [0, 0.25, 0.25]); ph.scale.setScalar(1.5); ph.lookAt(cam.position);
      r.setFace(['starstruck', 'delighted', 'grin'][c]); e1.update(t + c * 3);
    };
  },
  // 14 "Back then, our Wait was a tiny pink blob."  — close on the billboard top: the tiny blob blinks, waves its stubby arm
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach', billboard: [0, 13.5, -12], board: { text: '11 DAYS', sub: 'UNTIL LAUNCH' } });
    const b = waitBlob(S, { name: 'wait', size: 0.55 }); onBoard(b, env.board, 0);
    return (t, dur) => {
      const top = env.board.top;
      camPath(cam, t / dur, [1.5, top + 2.6, 2], [1.0, top + 2.2, -1.5], [0, top + 1.1, -12], [0, top + 1.3, -12], 32, 38);
      b.animate(t, t > dur * 0.4 ? 'wave' : 'idle'); b.look(cam.position); onBoard(b, env.board, 0);
      env.update(t);
    };
  },
  // 15 "It napped on the billboard, like a town pet."  — the blob snoozes on top; below, kids wave up and Grandpa skates by tipping an imaginary hat
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach', billboard: [0, 13.5, -12], board: { text: '11 DAYS', sub: 'UNTIL LAUNCH' } });
    const b = waitBlob(S, { name: 'wait', size: 0.55 }); onBoard(b, env.board, -2.5);
    const r = mk(S, RICO, 'rico', 'delighted', [-3.0, 0, -2], 180), d = mk(S, DANI, 'dani', 'laugh', [2.8, 0, -2.5], 180);
    const s = mk(S, SAL, 'sal', 'smile', [-14, 0, 2.5], 90); allowGround(S, 'sal');
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [0, 2.8, 14], [0, 3.0, 12], [0, 8, -8], [0, 9.5, -10], 24);
      b.animate(t * 0.4, 'idle'); b.blink(1); b.body.rotation.z = Math.sin(t * 1.5) * 0.06; onBoard(b, env.board, -2.5);
      const bp = [b.root.position.x, b.root.position.y + 1, b.root.position.z];
      r.pose(addPose(addPose({ rUp: 140 + Math.sin(t * 9) * 20 }, lookAt(r, bp)), idle(t, 0.6))); d.pose(addPose(addPose({ lUp: 150 + Math.sin(t * 8 + 1) * 15 }, lookAt(d, bp)), idle(t, 0.6, 2)));
      s.root.position.x = -14 + t * 8; s.pose(addPose(SKATE(t), lookAt(s, bp)));
      env.update(t);
    };
  },
  // 16 "Then came the first delay. [pause]"  — Rico's phone buzzes: DELAYED. Push in on his face as it drops
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', cars: false });
    const r = mk(S, RICO, 'rico', 'smile', [0, 0, 3], 0); const ph = cdPhone(S, 'DELAYED', 'new date: next year', '#ff2a3a'); const ph0 = cdPhone(S, '3 DAYS');
    fill(S, [1, 6.5, 8], 8, 0xffd8c0); const red = fill(S, [0.2, 4.6, 5.0], 0, 0xff3a4a, 4);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.4]);
      const bz = t > 0.4 && t < 1.2 ? Math.sin(t * 60) * 0.04 : 0;
      r.pose(addPose(addPose(PHONE_UP, idle(t, 0.4)), c === 1 ? { nod: 14, lean: 4 } : {}));
      hold(ph, r, 'R', [bz, 0.25, 0.25]); hold(ph0, r, 'R', [bz, 0.25, 0.25]); [ph, ph0].forEach(g => { g.scale.setScalar(1.4); g.lookAt(cam.position); });
      ph0.visible = t < 0.6; ph.visible = t >= 0.6; red.intensity = t >= 0.6 ? 3 : 0;
      if (c === 0) { const hp = ph.position; camPath(cam, p, [hp.x + 0.9, hp.y + 0.5, hp.z + 3.4], [hp.x + 0.7, hp.y + 0.4, hp.z + 2.8], [hp.x, hp.y, hp.z], [hp.x, hp.y, hp.z], 34, 38); }
      else faceCam(cam, p, [0, 4.64, 3], 0, { dist: 7.0, lens: 34, push: 1.6, side: 0.5 });
      r.setFace(t < 0.7 ? 'smile' : c === 0 ? 'shock' : 'sad');
      env.update(t);
    };
  },
  // 17 "Everyone groaned. The Wait puffed up like a car."  — the beach crowd slumps with a groan; the blob puffs up to car size on the billboard (boing)
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach', billboard: [0, 13.5, -12], board: { text: 'DELAYED', sub: 'SORRY!', col: '#ff2a3a' } });
    const b = waitBlob(S, { name: 'wait', size: 0.55 }); onBoard(b, env.board, 0);
    const C = crowdRow(S, 5, -8.8, 4.4, 1, 180, ['sad', 'pout', 'sad', 'bored', 'sad']);
    return (t, dur) => {
      const [c, p] = seg(t, dur, [0.4]);
      if (c === 0) camPath(cam, p, [0, 5.2, -6], [0, 5.0, -5], [0, 4.2, 2], [0, 4.0, 2], 26, 28);
      else camPath(cam, p, [0, 5, 14], [0, 6, 12], [0, 13, -12], [0, 15, -12], 24, 26);
      C.forEach((a, i) => { a.root.rotation.y = Math.PI; a.pose(addPose(addPose(idle(t, 0.5, i), hit([[0.1 + i * 0.06, { nod: -10 }], [0.6 + i * 0.06, { ...POSES.slump, nod: 25, lean: 10 }]], t)), c === 0 ? {} : lookAt(a, [0, 14, -12]))); });
      const g = c === 1 ? 0.55 + 1.05 * hn([[0, 0], [0.45, 1]], p * (dur * 0.6) - 0.2) : 0.55; b.grow(g); onBoard(b, env.board, 0);
      b.animate(t, c === 1 ? 'bounce' : 'idle'); b.look(V([0, 3, 10]));
      env.update(t);
    };
  },
  // 18 "Then came the second delay."  — Pixel Palace: the billboard flips to DELAYED again; Lulu facepalms in the doorway
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'strip', shop: true, cars: false, billboard: [-11, 15, -14.6], board: { text: '2 DAYS', sub: 'UNTIL LAUNCH' } });
    const l = mk(S, LULU, 'lulu', 'neutral', [1.0, 0, -12.8], 0); allowGround(S, 'lulu'); fill(S, [1.5, 6, -6], 10, 0xffc8e8);
    return (t, dur) => {
      camPath(cam, t / dur, [-3, 6, 2], [-2.2, 5.6, 0], [-4, 8.5, -14], [0.8, 4.8, -12.8], 26, 30);
      if (t > dur * 0.3) env.board.set('DELAYED', 'AGAIN. SORRY!', '#ff2a3a');
      l.pose(addPose(idle(t, 0.5), hit([[dur * 0.35, lookAt(l, [-11, 15, -14])], [dur * 0.6, { rFwd: 125, rUp: -12, nod: 18, lean: 6 }]], t)));
      l.setFace(t > dur * 0.55 ? 'pout' : 'neutral');
      env.update(t);
    };
  },
  // 19 "Now it was as big as a house. [pause]"  — the blob, house-sized, squats on the beach next to the lifeguard tower; tiny people stare up
  (S, cam) => {
    const env = neonBeach(S, { time: 'sunset', view: 'beach' });
    const b = waitBlob(S, { name: 'wait', size: 3.2 }); b.root.position.set(4, 0, -12);
    const r = mk(S, RICO, 'rico', 'shock', [-3.4, 0, 5], 150), d = mk(S, DANI, 'dani', 'scared', [3.0, 0, 5.6], 200);
    allowGround(S, 'wait');
    return (t, dur) => {
      camPath(cam, sm(t, 0, dur), [-1, 1.4, 15], [-2, 1.2, 17], [1, 6, -4], [2, 9, -8], 22, 22);
      b.animate(t, 'idle'); b.look(V([0, 3, 6])); b.blink((t % 2.4) < 0.15 ? 1 : 0);
      [r, d].forEach((a, i) => a.pose(addPose(addPose(idle(t, 0.6, i), lookAt(a, [4, 10, -12])), i ? { lFwd: 40, rFwd: 40 } : { rUp: 20, lUp: 20 })));
      env.update(t);
    };
  },
];
