import * as THREE from 'three';
import { POSES, addPose, idle, walk, D, camPath, seg, hit, talk, lookAt, anticipate, pinky, sitOn,
  alpineVillage, logCabin, liftStation, stroller, letterStack, soccerBall, makeAvatar, add } from '../../engine/kit.js';
import { SOL, MOM, MATES, PIKE, MAIL, PIKE_AS_MAIL, DUNN, BABY, DUNN_AS_BABY, BABY_AS_DUNN, mk, sol, mom, otto, mate,
  ramp, sm, V, headOf, faceCam, fill, allow, hold, hn, RUN, shake, far, poof } from './common.js';

const CROSS = { rFwd: 75, lFwd: 75, rUp: -38, lUp: -38 };   // arms folded
const HIPS = POSES.hips;
// a character that swaps outfits on a poof: two avatars, one visible at a time
export function swapper(S, a, b, name, face, pos, ry, scale = 1) {
  const A = mk(S, a, name, face, pos, ry, scale), B = mk(S, b, name, face, pos, ry, scale); B.root.visible = false;
  return { A, B, cur: A, show(s) { A.root.visible = !s; B.root.visible = s; this.cur = s ? B : A; }, pose(p) { A.pose(p); B.pose(p); }, face(f) { A.setFace(f); B.setFace(f); },
    pos(x, y, z) { A.root.position.set(x, y, z); B.root.position.set(x, y, z); }, rot(r) { A.root.rotation.y = r * D; B.root.rotation.y = r * D; } };
}
const swapKid = (i, j) => ({ ...MATES[i], shirt: MATES[j].shirt, shirtStyle: MATES[j].shirtStyle, pants: MATES[j].pants, outfit: MATES[j].outfit });

export const SHOTS_A = [
  // 2 "In this world,"  — fast crane down over Kell village: cable cabins gliding over the peaks, bunting fluttering, fountain splashing
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const K = mate(S, 1, 'smile', [-6, 0, 2], 90); const ball = soccerBall(S);
    return (t, dur) => { env.update(t); K.root.position.x = -8 + t * 2.4; K.pose(walk(t, 1.1, 0.8)); ball.position.set(K.root.position.x + 1.4, 0.55 + Math.abs(Math.sin(t * 7)) * 0.3, 2); ball.rotation.z = -t * 6;
      camPath(cam, t / dur, [4, 16, 30], [2, 6.5, 18], [0, 14, -60], [-2, 4, -4], 22, 24); };
  },
  // 3 "fall asleep angry, and you wake up as them."  — two teens back to back, arms folded, scowling… POOF: they wake up in each other's clothes
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const A = swapper(S, MATES[0], swapKid(0, 2), 'kidA', 'angry', [-2.6, 0, 1.5], -20), B = swapper(S, MATES[2], swapKid(2, 0), 'kidB', 'angry', [2.6, 0, 1.5], 20);
    const P = poof(S), P2 = poof(S);
    return (t, dur) => { env.update(t); const tp = dur * 0.52, sw = t > tp;
      A.show(sw); B.show(sw); const k = ramp(t, tp - 0.15, tp + 0.6); P.set(headOf(A.cur).add(V([0, -1.5, 0])), k); P2.set(headOf(B.cur).add(V([0, -1.5, 0])), k);
      if (!sw) { A.pose(addPose(idle(t, 0.8), addPose(CROSS, { nod: Math.sin(t * 2) * 3, turn: -25 }))); B.pose(addPose(idle(t, 0.8, 2), addPose(CROSS, { turn: 25, tilt: 5 }))); A.face('angry'); B.face('pout'); }
      else { const u = t - tp; A.pose(addPose(idle(t, 0.8), hit([[0, { rUp: 40, lUp: 40 }], [0.35, { rFwd: 40, lFwd: 40, nod: 35, rUp: -10, lUp: -10 }], [dur, { rFwd: 45, lFwd: 40, nod: 30, rUp: -10, lUp: -10 }]], u)));
        B.pose(addPose(idle(t, 0.8, 2), hit([[0.1, { rUp: 40 }], [0.45, { rUp: 120, lUp: 120, lean: -6 }], [dur, { rUp: 115, lUp: 110, lean: -6 }]], u))); A.face('shock'); B.face('scared'); }
      camPath(cam, t / dur, [0, 5.0, 21], [0, 4.8, 18.5], [0, 3.4, 1.5], [0, 3.6, 1.5], 24, 25); };
  },
  // 4 "You keep your face. You get their whole life."  — cut 1: close-up, the boy touches his own face (still his); cut 2: he holds up the other kid's orange shirt in horror, the other kid shrugs in green
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const A = mk(S, swapKid(0, 2), 'kidA', 'confused', [-2.6, 0, 1.5], -10), B = mk(S, swapKid(2, 0), 'kidB', 'nervous', [2.8, 0, 1.0], 25);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.5]);
      if (k === 0) { A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 30 }], [0.4, { rFwd: 140, rUp: -30, lFwd: 130, lUp: -30, nod: 4 }], [dur, { rFwd: 138, rUp: -26, lFwd: 132, lUp: -28, tilt: 6 }]], t))); if (t > 0.6) A.setFace('relieved');
        const h = headOf(A).toArray(); faceCam(cam, u, h, -10, { dist: 6.6, lens: 36, side: 0.5, push: 0.6, look: -0.2 }); }
      else { const tt = t - dur * 0.5; A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 20 }], [0.35, { rFwd: 55, lFwd: 55, nod: 35, rUp: 12, lUp: 12 }], [dur, { rFwd: 60, lFwd: 58, nod: 30, rUp: 12, lUp: 12 }]], tt))); A.setFace('disgusted');
        B.pose(addPose(idle(t, 0.7, 3), hit([[0, {}], [0.4, POSES.shrug], [dur, { ...POSES.shrug, tilt: 10 }]], tt))); B.setFace('fakesmile');
        camPath(cam, u, [0.4, 4.8, 19], [0.2, 4.6, 17.4], [0.2, 3.3, 1.3], [0.2, 3.4, 1.3], 24, 25); } };
  },
  // 5 "Until you stop being angry."  — they look at each other, crack up laughing, fist-bump… POOF, back in their own clothes
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const A = swapper(S, swapKid(0, 2), MATES[0], 'kidA', 'pout', [-2.4, 0, 1.5], 45), B = swapper(S, swapKid(2, 0), MATES[2], 'kidB', 'pout', [2.4, 0, 1.5], -45); const P = poof(S), P2 = poof(S);
    return (t, dur) => { env.update(t); const tp = dur * 0.62, sw = t > tp; A.show(sw); B.show(sw);
      const kk = ramp(t, tp - 0.15, tp + 0.6); P.set(headOf(A.cur).add(V([0, -1.4, 0])), kk); P2.set(headOf(B.cur).add(V([0, -1.4, 0])), kk);
      const fb = hit([[0, { rUp: 10 }], [dur * 0.3, { rUp: 10 }], [dur * 0.45, { rFwd: 80, rUp: -12 }], [dur, { rFwd: 82, rUp: -10 }]], t);
      A.pose(addPose(idle(t, 0.7), addPose(fb, t > dur * 0.2 ? { bob: Math.abs(Math.sin(t * 12)) * 0.08, nod: -6 } : {}))); B.pose(addPose(idle(t, 0.7, 2), addPose({ ...fb, lFwd: fb.rFwd, lUp: fb.rUp, rFwd: 0, rUp: 10 }, t > dur * 0.2 ? { bob: Math.abs(Math.sin(t * 12 + 1)) * 0.08 } : {})));
      if (t > dur * 0.2) { A.face('laugh'); B.face('laugh'); } if (sw) { A.face('delighted'); B.face('grin'); }
      camPath(cam, t / dur, [1.5, 4.6, 19], [0, 4.8, 17], [0, 3.4, 1.5], [0, 3.6, 1.5], 24, 26); };
  },
  // 6 "Mrs. Pike yelled at the mailman."  — at the POST office: Mrs. Pike wags a finger up at the mailman, he cringes, clutching his satchel
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const P = mk(S, PIKE, 'pike', 'angry', [-4.2, 0, -5.4], 40, 0.92), Mm = mk(S, MAIL, 'mail', 'nervous', [0.9, 0, -4.8], -55);
    return (t, dur) => { env.update(t);
      P.pose(addPose(addPose(idle(t, 0.6), talk(t, 1.6)), { rFwd: 100 + Math.sin(t * 14) * 12, rUp: -8, lUp: 60, lFwd: 40, lean: 6, nod: -10 }));
      Mm.pose(addPose(idle(t, 0.7, 3), hit([[0, { rFwd: 30, lFwd: 30 }], [0.4, { rFwd: 80, lFwd: 80, rUp: -25, lUp: -25, lean: -10, nod: 8, bob: -0.15 }], [dur, { rFwd: 85, lFwd: 82, rUp: -25, lUp: -25, lean: -12, nod: 10, bob: -0.2 }]], t)));
      if (t > dur * 0.5) Mm.setFace('scared');
      camPath(cam, t / dur, [3.2, 4.4, 9.5], [2.2, 4.2, 7.8], [-2.0, 3.8, -5.2], [-2.2, 3.9, -5.2], 26, 28); };
  },
  // 7 "Next day, she carried six hundred letters."  — Mrs. Pike, in the mailman's uniform, staggers along under a tower of letters; envelopes slide off
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const P = mk(S, PIKE_AS_MAIL, 'pike', 'worried', [-6, 0, 1], 90, 0.92); const st = letterStack(S, 46, 7); const falls = [0, 1, 2, 3].map(i => letterStack(S, 1, 20 + i));
    return (t, dur) => { env.update(t); const x = -6 + t * 1.1; P.root.position.x = x; P.root.rotation.y = (90 + Math.sin(t * 3) * 8) * D;
      P.pose(addPose(walk(t, 0.7, 0.45), { rFwd: 80, lFwd: 80, rUp: -20, lUp: -20, lean: -8 + Math.sin(t * 3) * 5, bodyTilt: Math.sin(t * 3) * 6 }));
      const a = pinky(P, 'R'), b = pinky(P, 'L'); st.position.set((a.x + b.x) / 2 + 0.2, (a.y + b.y) / 2 - 0.2, (a.z + b.z) / 2 - 1.5); st.rotation.z = Math.sin(t * 3) * 0.08;
      falls.forEach((f, i) => { const u = ((t * 0.7 + i / 4) % 1); f.position.set(st.position.x + 0.5 + u * 0.8, st.position.y + 4.2 - u * 7, st.position.z + (i - 1.5) * 0.4); f.rotation.set(u * 5 + i, u * 3, u * 4); f.visible = f.position.y > 0.05; });
      if (t > dur * 0.6) P.setFace('pout');
      camPath(cam, t / dur, [-3.0, 3.6, 13], [-0.4, 4.0, 11.5], [-5, 3.8, 1], [-1.6, 4.2, 1], 24, 26); };
  },
  // 8 "Mr. Dunn yelled at his crying baby."  — Mr. Dunn pushing the pram leans in and yells; the baby wails back
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const pr = stroller(S, { col: 0x5ab8e8 }); pr.position.set(1.0, 0, 0.5); pr.rotation.y = -90 * D;
    const Bb = mk(S, BABY, 'baby', 'cry', [1.0, 0, 0.5], 90, 0.5); Bb.root.position.y = 2.7 - 0.75;
    const Dn = mk(S, DUNN, 'dunn', 'angry', [5.6, 0, 0.5], -70); allow(S, ['baby', 'stroller'], ['dunn', 'stroller']);
    return (t, dur) => { env.update(t); pr.rotation.z = Math.sin(t * 10) * 0.01;
      Bb.pose(addPose({ rLeg: 90, lLeg: 90 }, addPose({ rUp: 120 + Math.sin(t * 12) * 25, lUp: 120 + Math.cos(t * 12) * 25 }, { nod: -15 + Math.sin(t * 9) * 5, tilt: Math.sin(t * 6) * 8 })));
      Dn.pose(addPose(addPose(idle(t, 0.6), talk(t, 2)), hit([[0, { rFwd: 60, lFwd: 60, rUp: -10, lUp: -10 }], [0.4, { rFwd: 50, lFwd: 50, rUp: 30, lUp: 30, lean: 18, nod: 10 }], [dur, { rFwd: 52, lFwd: 48, rUp: 32, lUp: 28, lean: 20, nod: 12 }]], t)));
      camPath(cam, t / dur, [-1.5, 5.2, 14.5], [-0.5, 5.0, 13.2], [3.4, 3.8, 0.5], [3.4, 3.9, 0.5], 24, 25); };
  },
  // 9 "He spent Tuesday in a stroller."  — Mr. Dunn in a yellow onesie and bonnet bow, wedged in the pram, sulking; the baby in his suit pushes him along
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const pr = stroller(S, { col: 0x5ab8e8 }); pr.rotation.y = 90 * D;
    const Dn = mk(S, DUNN_AS_BABY, 'dunn', 'pout', [0, 0, 0.5], 90); const Bb = mk(S, BABY_AS_DUNN, 'baby', 'proud', [0, 0, 0.5], 90, 0.5);
    const brief = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x5a3418 })); S.add(brief);
    allow(S, ['dunn', 'stroller'], ['baby', 'stroller']);
    return (t, dur) => { env.update(t); const x = -5 + t * 1.6; pr.position.set(x, 0, 0.5);
      Dn.root.position.set(x - 0.4, 2.7 - 1.5, 0.5); Dn.pose(addPose({ rLeg: 80, lLeg: 80 }, addPose(CROSS, { nod: 6, tilt: Math.sin(t * 2) * 4, bob: Math.abs(Math.sin(t * 8)) * 0.05 })));
      if (t > dur * 0.55) Dn.setFace('bored');
      Bb.root.position.set(x - 4.2, 0, 0.5); Bb.pose(addPose(walk(t, 1.6, 0.8), { rUp: 0, rFwd: 150, lFwd: 150, lUp: 0 })); hold(brief, Bb, 'L', [0, -0.3, 0]); brief.visible = false;
      camPath(cam, t / dur, [x - 2.6, 6.0, 14.5], [x - 0.6, 5.8, 13.2], [x - 2.2, 4.6, 0.5], [x - 1.6, 4.7, 0.5], 24, 25); };
  },
  // 10 "I'm Sol. I'm fifteen."  — Sol juggles a ball on the cobbles, flicks it up, catches it and grins at camera
  (S, cam) => { far(cam); const env = alpineVillage(S);
    const A = sol(S, 'grin', [0, 0, 1.5], 0); const ball = soccerBall(S);
    return (t, dur) => { env.update(t); const tc = dur * 0.6;
      if (t < tc) { const u = t * 2.6 % 1; const kneeR = Math.floor(t * 2.6) % 2 === 0; A.pose(addPose(idle(t, 0.6), { rLeg: kneeR ? 60 * Math.sin(u * Math.PI) : 0, lLeg: kneeR ? 0 : 60 * Math.sin(u * Math.PI), rUp: 30, lUp: 30, nod: 22 }));
        ball.position.set(kneeR ? -0.5 : 0.5, 1.8 + Math.sin(u * Math.PI) * 2.2, 3.2); ball.rotation.x = t * 8; }
      else { const u = t - tc; A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 60, lFwd: 60, nod: 10 }], [0.3, { rFwd: 70, lFwd: 70, rUp: -20, lUp: -20, nod: -4 }], [dur, { rFwd: 70, lFwd: 70, rUp: -20, lUp: -20, tilt: 8 }]], u)));
        const a = pinky(A, 'R'), b = pinky(A, 'L'); ball.position.set((a.x + b.x) / 2, Math.max((a.y + b.y) / 2, 1) + 0.25 * (1 - sm(u, 0, 0.3)), (a.z + b.z) / 2 + 0.4); A.setFace('smirk'); }
      const h = headOf(A).toArray(); faceCam(cam, t / dur, [h[0], h[1] - 1.2, h[2]], 0, { dist: 10.5, lens: 30, side: 0.6, push: 1.6, up: 0.4, look: 0.3 }); };
  },
  // 11 "Mom runs the cable car on Mount Kell."  — low wide in the base station: Mom at the console throws a lever, the giant bullwheel turns, cabins swing round
  (S, cam) => { far(cam); const env = liftStation(S);
    const M = mom(S, 'determined', [9, 0, -3.4], 0);
    return (t, dur) => { env.update(t); env.levers[0].rotation.x = hn([[0, -0.5], [0.5, -0.5], [0.9, 0.6], [dur, 0.6]], t);
      M.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 40 }], [0.5, { rFwd: 70, rUp: -8, nod: 10 }], [0.9, { rFwd: 55, rUp: -8, nod: 6, lean: -4 }], [dur, { rFwd: 52, rUp: -6, turn: -30, nod: -10 }]], t)));
      if (t > 1.0) M.setFace('proud');
      camPath(cam, t / dur, [1.5, 2.6, 13], [4.0, 3.2, 10.5], [5, 6.5, -5], [8.2, 4.6, -3.4], 22, 24); };
  },
  // 12 "She's never come to a game."  — night, the cabin: Mateo sits on the edge of his bed hugging his ball, staring at the FINAL poster on the wall
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'night', bed: 'sol' });
    const A = sol(S, 'sad', [-7.9, 0.4, -2.0], 20); allow(S, ['sol', 'bed*'], ['sol', 'mattress'], ['sol', 'quilt']); const ball = soccerBall(S); fill(S, [-4.5, 6.0, 2.0], 5, 0xffc890, 10);
    return (t, dur) => { env.update(t);
      A.pose(addPose({ rLeg: 90, lLeg: 90 }, { rFwd: 60, lFwd: 60, rUp: -22, lUp: -22, nod: hn([[0, 18], [dur * 0.5, 18], [dur * 0.75, 2], [dur, 0]], t) + Math.sin(t * 1.2) * 2, turn: hn([[0, 0], [dur * 0.5, 0], [dur * 0.75, 40], [dur, 42]], t), bob: Math.sin(t * 1.6) * 0.03 }));
      const a = pinky(A, 'R'), b = pinky(A, 'L'); ball.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.2, (a.z + b.z) / 2 + 0.3);
      const h = headOf(A).toArray(); faceCam(cam, t / dur, h, 20, { dist: 7.2, lens: 32, side: 1.0, push: 0.8, look: -0.6 }); };
  },
  // 13 '"The final's Saturday, Mom. Please."'  — kitchen at night: Sol holds out the FINAL flyer; Mom, pulling on her red jacket for the night shift, glances at it
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'night', bed: 'sol' });
    const A = sol(S, 'worried', [-0.4, 0, 1.6], 55), M = mom(S, 'nervous', [3.6, 0, 2.6], -70); fill(S, [1.6, 6.0, 8.5], 12, 0xffd8b0, 14);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshStandardMaterial({ color: 0xf6f2e8, side: THREE.DoubleSide })); S.add(fl);
    return (t, dur) => { env.update(t);
      A.pose(addPose(addPose(idle(t, 0.6), talk(t, 1)), hit([[0, { rFwd: 40 }], [0.4, { rFwd: 85, rUp: -5, lean: 6 }], [dur, { rFwd: 88, rUp: -6, lean: 8, tilt: -6 }]], t)));
      const a = pinky(A, 'R'); fl.position.set(a.x + 0.2, a.y + 0.4, a.z); fl.lookAt(cam.position);
      M.pose(addPose(idle(t, 0.6, 2), addPose({ rFwd: 40 + Math.sin(t * 6) * 8, lFwd: 60, rUp: -20, lUp: -10, nod: 18 }, t > dur * 0.5 ? lookAt(M, headOf(A)) : {})));
      if (t > dur * 0.5) M.setFace('sad');
      camPath(cam, t / dur, [1.2, 5.0, 11.4], [1.6, 4.8, 10.8], [1.6, 3.8, 2.0], [1.6, 3.9, 2.0], 19, 20); };
  },
  // 14 '"Sol, I can't. The mountain doesn't stop."'  — close on Mom: she zips her jacket, can't meet his eyes, then does
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'night', bed: 'sol' });
    const M = mom(S, 'sad', [3.8, 0, 2.6], -110); const A = sol(S, 'worried', [-1.6, 0, 1.2], 60); fill(S, [1.4, 5.6, 5.4], 5, 0xffd0a0, 8);
    return (t, dur) => { env.update(t);
      M.pose(addPose(addPose(idle(t, 0.6), talk(t, 1)), hit([[0, { rFwd: 35, lFwd: 35, rUp: -20, lUp: -20, nod: 14 }], [dur * 0.45, { rFwd: 40, lFwd: 40, rUp: -20, lUp: -20, nod: 16 }], [dur * 0.6, { rFwd: 20, lFwd: 20, nod: 0, turn: -18 }], [dur, { rFwd: 15, lFwd: 15, nod: -2, turn: -22 }]], t)));
      A.pose(idle(t, 0.5));
      const h = headOf(M).toArray(); faceCam(cam, t / dur, h, -70, { dist: 6.4, lens: 36, side: -0.6, push: 0.7, look: -0.2 }); };
  },
  // 15 '"You never come!" I went to bed angry.'  — cut 1: Sol shouts, fists down; cut 2: he stomps to bed and flops onto it, arms folded
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'night', bed: 'sol' });
    const A = sol(S, 'angry', [-1.6, 0, 1.2], 60); allow(S, ['sol', 'bed*'], ['sol', 'mattress'], ['sol', 'quilt'], ['sol', 'pillow']);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.42]);
      if (k === 0) { A.pose(addPose(addPose(idle(t, 0.5), talk(t, 2.2)), hit([[0, { rUp: 10 }], [0.3, { rUp: -25, lUp: -25, rFwd: 15, lFwd: 15, lean: 10, nod: -8, bob: -0.1 }], [dur, { rUp: -28, lUp: -28, rFwd: 12, lFwd: 12, lean: 12, nod: -10 }]], t)));
        const h = headOf(A).toArray(); faceCam(cam, u, h, 60, { dist: 6.6, lens: 34, side: 0.4, push: 0.9, look: -0.2 }); }
      else { const tt = t - dur * 0.42, td = dur * 0.58, w = sm(tt, 0, td * 0.55);
        const p0 = [-1.6, 1.2], p1 = [-7.9, -3.0]; A.root.position.set(p0[0] + (p1[0] - p0[0]) * w, 0, p0[1] + (p1[1] - p0[1]) * w); A.root.rotation.y = (w < 1 ? -120 : 0) * D;
        if (w < 1) A.pose(addPose(walk(tt, 1.4, 1), { rUp: -15, lUp: -15 }));
        else { const f = sm(tt, td * 0.55, td * 0.75); A.root.position.y = (1.9 - 1.5) * f; A.root.rotation.y = 0; A.root.position.z = -3.0 - f * 2.2; A.pose(addPose({ rLeg: 90 * f, lLeg: 90 * f, lean: -10 * f }, addPose(CROSS, { nod: -6, bob: Math.abs(Math.sin(tt * 18)) * 0.08 * (1 - f) }))); }
        camPath(cam, u, [-1.0, 6.0, 9.5], [-2.6, 5.6, 7.8], [-3.6, 3.0, -1.6], [-7.0, 3.6, -4.4], 24, 26); } };
  },
  // 16 "On purpose."  — moonlit close-up: Sol in bed glaring at the ceiling, jaw set; he yanks the quilt up and turns away
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'night', bed: 'sol' });
    const A = sol(S, 'angry', [-7.9, 0.4, -5.2], 0); allow(S, ['sol', 'bed*'], ['sol', 'mattress'], ['sol', 'headboard'], ['sol', 'pillow']);
    fill(S, [-6.2, 7.4, -1.2], 6, 0x9ab8ff, 10);
    return (t, dur) => { env.update(t); A.pose(addPose({ rLeg: 90, lLeg: 90, lean: -14 }, addPose(CROSS, { nod: -12 + Math.sin(t * 1.5) * 2, turn: hn([[0, 0], [dur * 0.6, 0], [dur * 0.8, -30], [dur, -32]], t), bob: Math.sin(t * 2) * 0.03 })));
      env.blanket.position.y = 2.0 + sm(t, dur * 0.55, dur * 0.8) * 0.3;
      const h = headOf(A).toArray(); camPath(cam, t / dur, [h[0] + 1.2, h[1] + 0.4, h[2] + 7.2], [h[0] + 0.8, h[1] + 0.3, h[2] + 6.0], [h[0], h[1] - 0.2, h[2]], [h[0], h[1] - 0.15, h[2]], 36, 40); };
  },
  // 17 "I woke up in her red jacket."  — morning sun: Sol bolts upright in Mom's red-quilt bed, sparkles fading, stares down at the red jacket
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'morning', bed: 'mom' });
    const A = sol(S, 'sleeping', [-7.9, 0.4, -5.2], 0, true); allow(S, ['sol', 'bed*'], ['sol', 'mattress'], ['sol', 'headboard'], ['sol', 'pillow']); const P = poof(S, 22);
    return (t, dur) => { env.update(t); const up = 0.5;
      A.pose(addPose({ rLeg: 90, lLeg: 90 }, hit([[0, { lean: -30, nod: -10 }], [up, { lean: -30, nod: -10 }], [up + 0.3, { lean: 6, rUp: 30, lUp: 30 }], [up + 0.9, { lean: 8, nod: 32, rFwd: 40, lFwd: 40, rUp: 10, lUp: 10 }], [dur, { lean: 8, nod: 34, rFwd: 45, lFwd: 44, rUp: 10, lUp: 10 }]], t)));
      if (t > up) A.setFace('shock'); if (t > up + 1.0) A.setFace('scared');
      P.set(headOf(A).add(V([0, -1.6, 0.3])), clamp(t / 1.2));
      const h = headOf(A).toArray(); camPath(cam, t / dur, [h[0] + 2.4, h[1] + 0.3, h[2] + 8.6], [h[0] + 1.6, h[1], h[2] + 7.0], [h[0], h[1] - 0.8, h[2]], [h[0], h[1] - 0.6, h[2]], 30, 33); };
  },
  // 18 "Mom was downstairs, wearing my soccer kit."  — Mom at the kitchen table in Sol's green #7 jersey, coffee mug frozen halfway, looking down at the number
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'morning', bed: 'mom' });
    const M = mom(S, 'confused', [3.6, 0, 0.4], 180, true); const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x2a6ae8 })); S.add(mug);
    const A = sol(S, 'shock', [-3.2, 0, 4.4], 120, true);
    return (t, dur) => { env.update(t); M.root.rotation.y = hn([[0, 10], [dur * 0.4, 10], [dur * 0.65, -35], [dur, -40]], t) * D;
      M.pose(addPose(idle(t, 0.5), { rFwd: 95, rUp: -15, nod: hn([[0, 0], [dur * 0.25, 30], [dur * 0.55, 30], [dur * 0.7, -4], [dur, -4]], t), lFwd: 30 }));
      hold(mug, M, 'R', [0, 0.1, 0]); if (t > dur * 0.6) M.setFace('shock');
      A.pose(addPose(idle(t, 0.6), { rFwd: 30, lFwd: 30 }));
      camPath(cam, t / dur, [-0.6, 5.2, 10.5], [0.6, 4.8, 9.0], [3.2, 3.8, -0.4], [3.0, 3.9, 0.2], 26, 28); };
  },
  // 19 '"Sol! What did you do?"'  — close on Mom in the green kit, arms flung out at her outfit, shouting
  (S, cam) => { far(cam); const env = logCabin(S, { time: 'morning', bed: 'mom' });
    const M = mom(S, 'shock', [2.4, 0, 2.6], -60, true); const A = sol(S, 'nervous', [-8.2, 0, 6.4], 110, true);
    return (t, dur) => { env.update(t);
      M.pose(addPose(addPose(idle(t, 0.5), talk(t, 2)), hit([[0, { rFwd: 30, lFwd: 30 }], [0.35, { rUp: 55, lUp: 55, rFwd: 40, lFwd: 40, lean: -6 }], [dur * 0.6, { rUp: 50, lUp: 50, rFwd: 40, lFwd: 40 }], [dur * 0.75, { rFwd: 70, lFwd: 70, rUp: 0, lUp: 0, nod: 20 }], [dur, { rFwd: 72, lFwd: 70, nod: 24 }]], t)));
      if (t > dur * 0.7) M.setFace('angry');
      A.pose(idle(t, 0.5));
      const h = headOf(M).toArray(); faceCam(cam, t / dur, [h[0], h[1] - 0.6, h[2]], -60, { dist: 8.0, lens: 32, side: 0.5, push: 1.0, look: -0.1 }); };
  },
  // 20 "No school. I ran the whole mountain."  — Sol yanks the big lever (anticipation + overshoot); the wheel spins faster, cabins whoosh round
  (S, cam) => { far(cam); const env = liftStation(S);
    const A = sol(S, 'determined', [9, 0, -3.4], 0, true);
    return (t, dur) => { const tp = dur * 0.45; env.spin(1 + sm(t, tp, tp + 0.8) * 2.2); env.update(t); env.levers[1].rotation.x = hn([[0, -0.5], [tp, -0.5], [tp + 0.3, 0.7], [dur, 0.7]], t);
      A.pose(addPose(addPose(idle(t, 0.6), anticipate(t, tp, 1.4)), hit([[0, { rFwd: 40 }], [tp - 0.1, { rFwd: 75, lFwd: 20, nod: 12 }], [tp + 0.3, { rFwd: 40, lUp: 120, lean: -6, nod: -12 }], [dur, { rFwd: 38, lUp: 140, lean: -8, nod: -15 }]], t)));
      if (t > tp) A.setFace('laugh');
      const h = headOf(A).toArray(); faceCam(cam, t / dur, [h[0], h[1] - 1.0, h[2]], 0, { dist: 8.5, lens: 30, side: -1.4, push: 1.2, up: 0.4, look: 0.1 }); };
  },
  // 21 "Big levers. Free cocoa from Otto."  — cut 1: Sol slams the big red button, delighted; cut 2: Otto pours cocoa at his workbench and hands Sol a steaming mug
  (S, cam) => { far(cam); const env = liftStation(S);
    const A = sol(S, 'grin', [9, 0, -3.4], 0, true); const O = otto(S, 'smile', [-13.6, 0, 1.6], 60); const B = sol(S, 'delighted', [-10.2, 0, 3.6], -110, true); B.root.visible = false;
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0xd8302a })); S.add(mug);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.4]);
      A.root.visible = k === 0; B.root.visible = k === 1;
      if (k === 0) { env.btn.position.y = 2.72 - (t > 0.5 && t < 0.8 ? 0.12 : 0); A.pose(addPose(idle(t, 0.6), addPose(anticipate(t, 0.5), hit([[0, { rFwd: 30 }], [0.3, { rFwd: 30, rUp: 60, nod: 10 }], [0.55, { rFwd: 70, rUp: -10, nod: 20 }], [dur, { rFwd: 68, rUp: -10, nod: 8 }]], t))));
        camPath(cam, u, [12.5, 4.6, 4.5], [11.4, 4.2, 3.6], [9.6, 3.0, -1.6], [9.6, 3.2, -1.6], 30, 32); }
      else { const tt = t - dur * 0.4; O.pose(addPose(addPose(idle(t, 0.6), talk(t, 0.6)), hit([[0, { rFwd: 30 }], [0.4, { rFwd: 75, rUp: -5, lean: 6 }], [dur, { rFwd: 78, rUp: -6, lean: 6, tilt: 6 }]], tt)));
        B.pose(addPose(idle(t, 0.6, 2), hit([[0, { rFwd: 20 }], [0.6, { rFwd: 70, rUp: -10 }], [1.0, { rFwd: 125, rUp: -20, nod: 10 }], [dur, { rFwd: 125, rUp: -20, nod: 8 }]], tt)));
        if (tt < 0.8) hold(mug, O, 'R', [0, 0.1, 0.1]); else hold(mug, B, 'R', [0, 0.15, 0.1]);
        camPath(cam, u, [-9.6, 5.2, 12.5], [-10.6, 4.8, 11], [-12.0, 4.0, 2.4], [-11.6, 4.1, 2.6], 28, 30); } };
  },
  // 22 "Then the radio started. It never stopped."  — the radio light flashes; Sol grabs the handset, smile dropping; cut 2: he juggles it, overwhelmed
  (S, cam) => { far(cam); const env = liftStation(S);
    const A = sol(S, 'smile', [9, 0, -3.4], 0, true); const hs = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.3), new THREE.MeshStandardMaterial({ color: 0x1a1a1e })); S.add(hs);
    return (t, dur) => { env.update(t); const [k, u] = seg(t, dur, [0.5]);
      if (k === 0) { A.pose(addPose(idle(t, 0.6), hit([[0, { rFwd: 30 }], [0.6, { rFwd: 30, turn: 25 }], [1.0, { rFwd: 120, rUp: -30, turn: 10, nod: 4 }], [dur, { rFwd: 122, rUp: -32, turn: 8, nod: 4 }]], t)));
        if (t > 0.9) A.setFace('worried'); hold(hs, A, 'R', [0, 0.2, 0]);
        if (t < 0.9) hs.position.set(9 + 2.6 + 0.4, 3.2, -1.2 + 0.2);
        const h = headOf(A).toArray(); faceCam(cam, u, h, 0, { dist: 6.6, lens: 36, side: 0.8, push: 0.6, look: -0.4 }); }
      else { const tt = t - dur * 0.5; A.setFace('nervous'); A.pose(addPose(addPose(idle(t, 0.8), talk(t, 2)), { rFwd: 120 + Math.sin(tt * 6) * 10, rUp: -30, lFwd: 70 + Math.sin(tt * 5) * 20, lUp: -10, turn: Math.sin(tt * 3) * 25, bob: Math.abs(Math.sin(tt * 7)) * 0.06 }));
        hold(hs, A, 'R', [0, 0.2, 0]); env.radio.rotation.z = Math.sin(t * 40) * 0.02;
        camPath(cam, u, [9, 4.4, 9.0], [9, 4.6, 7.6], [9, 3.8, -2.4], [9, 3.9, -2.4], 26, 28); } };
  },
  // 23 "Ice on the cable. A stuck cabin."  — cut 1: tilt along the iced cable, icicles glinting; cut 2: a stuck cabin full of tourists swaying high over the slope
  (S, cam) => { far(cam); const env = liftStation(S, { icy: true, stuck: true });
    return (t, dur) => { env.spin(0.15); env.update(t); const [k, u] = seg(t, dur, [0.48]); S.userData.dof = k === 0 ? undefined : false;
      if (k === 0) { const cy = env.cableY; camPath(cam, u, [3.6, cy(-18) - 1.0, -15], [4.2, cy(-26) - 0.8, -22], [6.5, cy(-20), -20], [6.5, cy(-30), -30], 34, 38); }
      else camPath(cam, u, [2, 6, -18], [2.6, 6.4, -20], [6.5, env.cableY(-46) - 5, -46], [6.5, env.cableY(-46) - 5.6, -46], 30, 34); };
  },
  // 24 "I couldn't leave for one minute."  — Sol sinks onto the console, head in hands, cabin 4's light blinking red on the status board behind him
  (S, cam) => { far(cam); const env = liftStation(S);
    const A = sol(S, 'worried', [10.7, 0, -3.4], -10, true); env.board(4);
    return (t, dur) => { env.spin(0.3); env.update(t);
      A.pose(addPose(idle(t, 0.4), hit([[0, { rFwd: 40 }], [0.6, { rFwd: 140, lFwd: 140, rUp: -25, lUp: -25, nod: 30, lean: 18, bob: -0.2 }], [dur, { rFwd: 142, lFwd: 140, rUp: -25, lUp: -25, nod: 34, lean: 20, bob: -0.22 }]], t)));
      if (t > 0.5) A.setFace('sad');
      camPath(cam, t / dur, [11.8, 3.3, 4.6], [11.4, 3.2, 3.4], [10.7, 4.0, -3.4], [10.7, 3.9, -3.4], 30, 33); };
  },
];
const clamp = x => Math.max(0, Math.min(1, x));
