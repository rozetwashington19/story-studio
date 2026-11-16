import * as THREE from 'three';
import { makeAvatar, makeShadow, POSES, lerpPose, addPose, ease, snap, idle, walk, D, shadowMatWall, shadowMatFloor, T, std, box, dayLight, street, wall, room, repeatMat,
  LEO, TEACH, DAD, COUS, EX, camPath, track, add, wallShadow, floorShadow, classroom, dining, bedroom,
  T2, hallway, stage, trophy, cafeteria, bus, airport, ocean, bakery, field, playground, porch, backyard,
  seg, sitGround, SIT, HUDDLE, HUG, sob, kidRoomDay, kitchen, cookieJar, crumbs, L } from '../../engine/kit.js';

const MOM = { skin: 'tan', shirt: 0x8a4aa8, shirtStyle: 'plain', pants: 0x34344a, pantsStyle: 'plain', hair: 'long', hairCol: 0x2a1708 };
const MAX = { skin: 'light', shirt: 0x2f9a8a, shirtStyle: 'hoodie', pants: 0x3a4a6a, hair: 'short', hairCol: 0xd9b04a };
const KIDS = [EX[0], EX[1], EX[2], EX[3], EX[4]];

export const SHOTS_B = [
  // 17 "At first, it was kind of awesome."
  (S, cam) => {
    dayLight(S, { sunPos: [-5, 14, -10] }); street(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin', blob: false }), [-3, 0, 0], 90);
    return (t, dur) => {
      camPath(cam, t / dur, [1.0, 3.8, 15], [2.5, 3.8, 14], [-1, 3.4, 0], [1.5, 3.4, 0], 30);
      leo.root.position.x = -3 + t * 3.6; leo.pose(addPose(walk(t, 1.1, 45), { tilt: Math.sin(t * 8.8) * 5 }));
      leo.root.position.y = Math.abs(Math.sin(t * 8.8)) * 0.35;
    };
  },
  // 18 "Leo, did you finish your homework?"
  (S, cam) => {
    kidRoomDay(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'neutral' }), [3.4, 0, -4.5], -35);
    const leo = add(S, makeAvatar({ ...LEO, face: 'smile', blob: false }), [-0.6, 0, -2.5], 25);
    return (t, dur) => {
      camPath(cam, t / dur, [4.2, 4.6, 6.5], [3.6, 4.5, 5.2], [2.4, 4.1, -4.5], [2.6, 4.2, -4.5], 34);
      mom.pose(addPose({ rUp: 28, lUp: 28, rFwd: -8, lFwd: -8 }, { tilt: Math.sin(t * 3) * 4, bob: Math.sin(t * 3) * 0.02 }));
      leo.pose(idle(t, 1));
    };
  },
  // 19 "Yep!" Nobody could check.
  (S, cam) => {
    kidRoomDay(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin', blob: false }), [-0.6, 0, -2.5], 10);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) camPath(cam, p, [-0.2, 4.8, 3.2], [-0.3, 4.75, 2.6], [-0.6, 4.4, -2.5], [-0.6, 4.45, -2.5], 42);
      else camPath(cam, p, [0.4, 2.0, 3.5], [0.3, 1.9, 2.8], [-0.6, 0.6, -2.4], [-0.6, 0.6, -2.4], 30);
      leo.pose(addPose(track([[0, POSES.rest], [0.25, { rFwd: 95, rUp: 10 }]], t, snap), { tilt: Math.sin(t * 7) * 5 }));
    };
  },
  // 20 "Who ate the last cookie?"
  (S, cam) => {
    kitchen(S); cookieJar(S, [1.6, 2.75, -2.6]);
    const dad = add(S, makeAvatar({ ...DAD, face: 'worried' }), [1.0, 0, -5.0], -10);
    return (t, dur) => {
      camPath(cam, t / dur, [0.8, 4.7, 4.2], [0.9, 4.6, 3.0], [1.2, 3.8, -4.5], [1.2, 3.9, -4.5], 30);
      dad.pose(addPose({ rFwd: 60, rUp: 15, lUp: 25, lFwd: -10 }, { tilt: Math.sin(t * 4) * 6, nod: 8 }));
    };
  },
  // 21 "Not me!" Nobody could check.
  (S, cam) => {
    kitchen(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin', blob: false }), [-1.2, 0, -4.2], 5); crumbs(leo);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.0, 4.9, 1.8], [-1.1, 4.8, 1.0], [-1.2, 4.5, -4.2], [-1.2, 4.55, -4.2], 40);
      leo.pose(addPose({ rUp: 35, lUp: 35, rFwd: 20, lFwd: 20 }, { turn: Math.sin(t * 14) * 18, tilt: Math.sin(t * 7) * 4 }));
    };
  },
  // 22 "I told my teacher my dog ate my homework."
  (S, cam) => {
    classroom(S); L('day')(S);
    const tch = add(S, makeAvatar({ ...TEACH, face: 'neutral' }), [2.2, 0, -6.2], -30);
    const leo = add(S, makeAvatar({ ...LEO, face: 'worried', blob: false }), [-1.3, 0, -4.8], 30);
    return (t, dur) => {
      camPath(cam, t / dur, [-0.2, 4.6, 6.5], [0.2, 4.5, 5.0], [0.3, 3.9, -5.5], [0.4, 4.0, -5.5], 30);
      leo.pose(addPose({ rUp: 40, lUp: 40, rFwd: 35, lFwd: 35 }, { tilt: Math.sin(t * 6) * 6, bob: Math.abs(Math.sin(t * 6)) * 0.05 }));
      tch.pose(addPose({ rFwd: 70, lFwd: 70, rUp: -15, lUp: -15 }, { nod: 6, tilt: -5 }));
    };
  },
  // 23 "I don't even have a dog."
  (S, cam) => {
    classroom(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'smirk', blob: false }), [0, 0, -4.8], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.3, 4.9, 0.6], [0.2, 4.9, -0.2], [0, 4.5, -4.8], [0, 4.55, -4.8], 45);
      leo.pose(addPose(POSES.shrug, { tilt: 8 + Math.sin(t * 5) * 3 }));
    };
  },
  // 24 "But then it got weird."
  (S, cam) => {
    dayLight(S, { sunPos: [-5, 14, -10] }); street(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'worried', blob: false }), [0, 0, 0], 0);
    const ppl = [[-5, -2, EX[0]], [5.5, -1, EX[2]]].map(([x, z, o]) => { const A = add(S, makeAvatar({ ...o, face: 'neutral' }), [x, 0, z], 0); const sh = floorShadow(S, o, [x, z]); return { A, sh }; });
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 3.0, 12], [0.3, 3.4, 9.5], [0, 2.4, 0], [0, 3.2, 0], 28);
      cam.rotateZ(-6 * D * ease(t / dur));
      leo.pose(addPose({ nod: 30, rUp: 6, lUp: 6 }, { turn: Math.sin(t * 2.5) * 25 }));
      ppl.forEach((p, i) => { const q = idle(t, 1, i); p.A.pose(q); p.sh.pose(q); });
    };
  },
  // 25 "Without a shadow, nobody could tell how I felt."
  (S, cam) => {
    hallway(S);
    const kids = KIDS.slice(0, 3).map((o, i) => { const x = -6 + i * 4.5; const A = add(S, makeAvatar({ ...o, face: 'neutral' }), [x, 0, -2.8], 90); const sh = wallShadow(S, o, [x + 1.2, -4.75], { profile: true, size: 1.05 }); sh.root.rotation.y = 90 * D; return { A, sh, x }; });
    const leo = add(S, makeAvatar({ ...LEO, face: 'neutral', blob: false }), [0, 0, 0.2], 90);
    return (t, dur) => {
      camPath(cam, t / dur, [-3, 4.3, 11], [3, 4.3, 11], [-2, 3.4, -2], [2.5, 3.4, -2], 28);
      kids.forEach((k, i) => { const x = k.x + t * 2.2; k.A.root.position.x = x; k.sh.flat.position.x = x + 1.2; const w = walk(t + i, 1); k.A.pose(w); k.sh.pose(w); });
      leo.root.position.x = -2 + t * 2.4; leo.pose(walk(t + 0.5, 1));
    };
  },
  // 26 "When I won the spelling bee, nobody clapped."
  (S, cam) => {
    stage(S); L('day')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin', blob: false }), [0, 1.2, -5.5], 0);
    const tr = trophy(S, [0, 0, 0]);
    const aud = [[-3.5, 3, EX[0]], [0.2, 3.5, EX[3]], [3.6, 3, EX[2]]].map(([x, z, o]) => { const A = add(S, makeAvatar({ ...o, face: 'neutral' }), [x, 0, z], 180); return A; });
    return (t, dur) => {
      camPath(cam, t / dur, [0.6, 5.0, 12], [0.5, 5.2, 9.5], [0, 4.6, -5.5], [0, 4.9, -5.5], 30);
      const p = track([[0, POSES.rest], [0.2, { rUp: 160, lUp: 10 }]], t, snap);
      leo.pose(addPose(p, { bob: Math.abs(Math.sin(t * 8)) * 0.15 }));
      leo.root.updateMatrixWorld(true); const hand = new THREE.Vector3(); leo.armR.children[1].getWorldPosition(hand); tr.position.set(hand.x, hand.y - 0.2, hand.z);
      aud.forEach((A, i) => A.pose({ turn: Math.sin(t * 2 + i) * 15, rUp: 3, lUp: 3 }));
    };
  },
  // 27 "They didn't know if I was happy."
  (S, cam) => {
    stage(S);
    const aud = [[-2.5, 0, EX[0], 'neutral'], [0.5, -0.3, EX[3], 'worried'], [3.2, 0, EX[2], 'neutral']].map(([x, z, o, f]) => add(S, makeAvatar({ ...o, face: f }), [x, 0, z], 0));
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 4.6, 14], [0.5, 4.5, 12.5], [0.4, 3.8, 0], [0.4, 3.9, 0], 30);
      aud.forEach((A, i) => A.pose({ tilt: (i - 1) * 12 + Math.sin(t * 2 + i) * 4, turn: (i - 1) * -15, rUp: 3, lUp: 3 }));
    };
  },
  // 28 "When I tripped in the hallway, nobody helped."
  (S, cam) => {
    hallway(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'shock', blob: false }), [-2, 0, -1], 90);
    const kids = [[3, EX[0]], [7, EX[1]]].map(([x, o]) => ({ A: add(S, makeAvatar({ ...o, face: 'neutral' }), [x, 0, -2.6], -90), x }));
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 4.2, 10], [0.5, 4.0, 9], [-0.5, 2.5, -1], [0, 2.0, -1], 28);
      const f = snap(Math.min(1, Math.max(0, (t - 0.25) / 0.35)));
      leo.root.rotation.z = -f * 88 * D; leo.root.position.x = -2 + f * 1.2 + Math.min(t, 0.25) * 4; leo.root.position.y = f * 0.5;
      leo.pose(f < 0.5 ? walk(t, 1.2) : { rUp: 150, lUp: 150 }); leo.setFace(f > 0.6 ? 'sad' : 'shock');
      kids.forEach((k, i) => { k.A.root.position.x = k.x - t * 2.6; k.A.pose(walk(t + i, 1)); });
    };
  },
  // 29 "They didn't know if I was hurt."
  (S, cam) => {
    hallway(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'sad', blob: false }), [0, 0.5, -1], 90); leo.root.rotation.z = -88 * D;
    const kid = add(S, makeAvatar({ ...EX[2], face: 'neutral' }), [3.5, 0, -3.2], -90);
    return (t, dur) => {
      camPath(cam, t / dur, [2.2, 2.4, 5.5], [1.8, 2.2, 4.6], [0.5, 0.8, -1], [0.5, 0.8, -1], 30);
      leo.pose({ rUp: 150, lUp: 150, turn: -10 }); kid.root.position.x = 3.5 - t * 2.2; kid.pose(walk(t, 1));
    };
  },
  // 30 "When I told a joke, nobody laughed."
  (S, cam) => {
    cafeteria(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin', blob: false }), [0, 0, -5.6], 0); leo.root.position.y = 0;
    const fr = [[-3.5, EX[0]], [3.5, EX[4]]].map(([x, o]) => add(S, makeAvatar({ ...o, face: 'neutral' }), [x, 0, -5.6], x < 0 ? 20 : -20));
    return (t, dur) => {
      camPath(cam, t / dur, [0.3, 5.0, 5.0], [0.3, 4.9, 3.6], [0, 4.2, -5.6], [0, 4.3, -5.6], 30);
      leo.pose(addPose({ rUp: 60, lUp: 60, rFwd: 30, lFwd: 30 }, { tilt: Math.sin(t * 6) * 10, bob: Math.abs(Math.sin(t * 6)) * 0.1, rUp2: 0 }));
      fr.forEach((A, i) => A.pose({ rUp: 3, lUp: 3, turn: i ? 20 : -20 }));
    };
  },
  // 31 "They didn't know if I was kidding."
  (S, cam) => {
    cafeteria(S);
    const A = add(S, makeAvatar({ ...EX[0], face: 'neutral' }), [-1.2, 0, -5.6], 15);
    const B = add(S, makeAvatar({ ...EX[4], face: 'worried' }), [2.0, 0, -5.6], -15);
    return (t, dur) => {
      camPath(cam, t / dur, [0.4, 5.0, 5.5], [0.4, 4.9, 4.4], [0.4, 4.3, -5.6], [0.4, 4.4, -5.6], 32);
      A.pose({ tilt: 10, turn: 15 }); B.pose({ tilt: -8, turn: -25 + (t > 0.5 ? -10 : 0) });
    };
  },
  // 32 "And Mom kept staring at the empty floor next to my feet."
  (S, cam) => {
    kitchen(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'neutral', blob: false }), [-1.5, 0, -4.6], 15);
    const mom = add(S, makeAvatar({ ...MOM, face: 'worried' }), [2.0, 0, -5.4], -40);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [-0.6, 1.4, 1.0], [-0.8, 1.3, 0.2], [-1.5, 0.3, -4.6], [-1.5, 0.3, -4.6], 28);
      else camPath(cam, p, [0.6, 5.2, 0.8], [0.7, 5.1, 0.0], [2.0, 4.0, -5.4], [2.0, 4.1, -5.4], 34);
      mom.pose({ nod: 30, turn: -10, rUp: 3, lUp: 3 }); leo.pose(idle(t, 1));
    };
  },
  // 33 "Leo, are you okay?"
  (S, cam) => {
    kitchen(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'worried' }), [2.0, 0, -5.4], -30);
    return (t, dur) => {
      camPath(cam, t / dur, [0.9, 4.9, -0.8], [1.0, 4.85, -1.5], [2.0, 4.4, -5.4], [2.0, 4.45, -5.4], 42);
      mom.pose({ rFwd: 40, lFwd: 40, rUp: -10, lUp: -10, tilt: -8 + Math.sin(t * 3) * 3 });
    };
  },
  // 34 "I'm fine," I said.
  (S, cam) => {
    kitchen(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'fakesmile', blob: false }), [-1.5, 0, -4.6], 25);
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 4.8, -0.4], [0.0, 4.75, -1.0], [-1.5, 4.4, -4.6], [-1.5, 4.45, -4.6], 42);
      leo.pose({ rUp: 4, lUp: 4, tilt: 5 });
    };
  },
  // 35 "She couldn't check. So she just looked sad."
  (S, cam) => {
    kitchen(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'sad' }), [0.5, 0, -5.4], -10);
    const sh = wallShadow(S, MOM, [2.6, -8.97], { size: 1.2 });
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 4.6, 4.5], [0.6, 4.4, 3.0], [0.8, 4.1, -6], [1.4, 4.1, -7], 30);
      mom.pose({ nod: 12, rUp: 3, lUp: 3 }); sh.pose(addPose(POSES.slump, sob(t, 0.6)));
    };
  },
  // 36 "So I went looking for it."
  (S, cam) => {
    kidRoomDay(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'determined', blob: false }), [0, 0, -3.5], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.3, 3.0, 3.5], [0.3, 3.6, 2.6], [0, 4.4, -3.5], [0, 4.5, -3.5], 34);
      leo.pose(track([[0, POSES.rest], [0.3, { rUp: 20, lUp: 20, rFwd: -15, lFwd: -15, nod: -8 }]], t, snap));
    };
  },
  // 37 "Under my bed. In the closet. Behind the fridge."
  (S, cam) => {
    kidRoomDay(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'determined', blob: false }), [-5, 0, -0.4], 180);
    const kg = new THREE.Group(); kg.position.x = 200; S.add(kg); kitchen(kg);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.36, 0.7]);
      if (k === 0) { // lying, peeking under bed
        leo.root.position.set(-5, 0.5, 1.2); leo.root.rotation.set(-88 * D, 180 * D, 0); leo.pose({ rFwd: 0, rUp: 160, lUp: 160, nod: -20 });
        camPath(cam, p, [-1.5, 2.2, 3.5], [-2.0, 2.0, 3.0], [-5, 1.0, -1], [-5, 1.0, -1], 28);
      } else if (k === 1) { // closet
        leo.root.position.set(4.5, 0, -6.6); leo.root.rotation.set(0, 180 * D, 0); leo.pose({ rFwd: 90, rUp: -10, lFwd: 30 });
        camPath(cam, p, [1.5, 4.6, 1.0], [2.0, 4.5, 0.2], [4.5, 3.6, -7], [4.5, 3.6, -7], 30);
      } else { // fridge (in the kitchen? keep a white box here)
        leo.root.position.set(204.0, 0, -6.2); leo.root.rotation.set(0, 70 * D, 0); leo.pose({ rFwd: 80, lFwd: 80, nod: 15, lean: 25 });
        camPath(cam, p, [200.5, 4.6, 1.0], [201.0, 4.5, 0.2], [205, 3.8, -6.8], [205, 3.8, -6.8], 30);
      }
    };
  },
  // 38 "Nothing."
  (S, cam) => {
    kidRoomDay(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'sad', blob: false }), [0, 0, -3.5], 0);
    return (t, dur) => { camPath(cam, t / dur, [0.2, 4.7, 2.2], [0.2, 4.6, 1.6], [0, 4.4, -3.5], [0, 4.4, -3.5], 40); leo.pose(addPose(POSES.shrug, { nod: 10 })); };
  },
  // 39 "I found shadow handprints on the bakery window."
  (S, cam) => {
    bakery(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'shock', blob: false }), [-2.8, 0, 1.5], 140);
    return (t, dur) => {
      camPath(cam, t / dur, [-0.8, 4.4, 9], [0.2, 4.0, 6.2], [-0.5, 3.8, -2.4], [0.4, 3.7, -2.4], 30);
      leo.pose({ rFwd: 70, rUp: 10, nod: -8, lUp: 4 });
    };
  },
  // 40 "Shadow footprints across the soccer field."
  (S, cam) => {
    field(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'determined', blob: false }), [0, 0, 6], 180);
    return (t, dur) => {
      camPath(cam, t / dur, [3, 6.5, 13], [2.5, 6.0, 11], [0, 1, -4], [0, 1.4, -6], 30);
      leo.root.position.z = 6 - t * 2.6; leo.pose(addPose(walk(t, 0.9), { nod: 22 }));
    };
  },
  // 41 "And on Friday night, at the old playground,"
  (S, cam) => {
    const sw = playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'determined', blob: false }), [-7, 0, 6], 140);
    return (t, dur) => {
      camPath(cam, t / dur, [6, 7.5, 18], [4, 6.5, 15], [0, 3.5, -2], [-2, 3.2, 0], 28);
      leo.root.position.x = -7 + t * 1.8; leo.root.position.z = 6 - t * 1.5; leo.pose(walk(t, 0.85));
      sw.forEach((g, i) => g.rotation.x = Math.sin(t * 1.6 + i) * 0.12);
    };
  },
  // 42 "I found it."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'shock', blob: false }), [-1, 0, 4], 170);
    return (t, dur) => {
      camPath(cam, t / dur, [-1.4, 4.9, 1.2], [-1.3, 4.85, 1.7], [-1, 4.5, 4], [-1, 4.5, 4], 42);
      leo.pose(track([[0, POSES.rest], [0.15, POSES.shock]], t, snap));
    };
  },
  // 43 "My shadow was sitting on the wall behind the swings."
  (S, cam) => {
    const sw = playground(S); L('night')(S);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [0, 4.6, 14], [0, 4.4, 12.5], [0, 3.2, -4], [0, 3.0, -5], 26);
      else camPath(cam, p, [1.5, 3.4, 5.0], [1.2, 3.3, 4.0], [0, 2.4, -6], [0, 2.3, -6], 28);
      sh.pose(addPose(HUDDLE, sob(t, 0.4))); sw.forEach((g, i) => g.rotation.x = Math.sin(t * 1.6 + i) * 0.1);
    };
  },
  // 44 "Knees pulled up. Head down."
  (S, cam) => {
    playground(S); L('night')(S);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => { camPath(cam, t / dur, [0.6, 2.6, 2.4], [0.4, 2.5, 1.6], [0, 2.2, -6], [0, 2.2, -6], 32); sh.pose(addPose(HUDDLE, sob(t, 0.4))); };
  },
  // 45 "It was crying."
  (S, cam) => {
    playground(S); L('night')(S);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => { camPath(cam, t / dur, [0.5, 2.8, 0.2], [0.4, 2.8, -1.2], [0, 2.6, -6], [0, 2.6, -6], 38); sh.pose(addPose(HUDDLE, sob(t, 1.6))); };
  },
  // 46 "It was the saddest thing I've ever seen."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'teary', blob: false }), [-1, 0, 4], 170);
    return (t, dur) => { camPath(cam, t / dur, [-1.4, 4.9, 1.0], [-1.35, 4.85, 1.6], [-1, 4.4, 4], [-1, 4.4, 4], 42); leo.pose({ nod: 8, rUp: 3, lUp: 3, tilt: Math.sin(t * 2) * 3 }); };
  },
  // 47 "And that's when I remembered."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'teary', blob: false }), [-1, 0, 4], 170);
    return (t, dur) => { camPath(cam, t / dur, [-1.35, 4.75, 0.4], [-1.25, 4.65, 2.2], [-1, 4.55, 4], [-1, 4.6, 4], 40, 55); leo.pose({ nod: -5, rUp: 3, lUp: 3 }); };
  },
  // 48 "Max was my best friend."  (flashback)
  (S, cam) => {
    dayLight(S, { sunPos: [-5, 14, 10] }); street(S); L('flash')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'grin' }), [-1.2, 0, 0], 0);
    const max = add(S, makeAvatar({ ...MAX, face: 'grin' }), [1.2, 0, 0], 0);
    return (t, dur) => {
      camPath(cam, t / dur, [0.2, 4.4, 10], [0.1, 4.3, 8.5], [0, 3.6, 0], [0, 3.7, 0], 32);
      leo.pose({ lUp: -15, lFwd: 10, rUp: 4, tilt: Math.sin(t * 6) * 6, bob: Math.abs(Math.sin(t * 6)) * 0.1 });
      max.pose({ rUp: 160 + Math.sin(t * 12) * 10, lUp: 4, tilt: -Math.sin(t * 6) * 6, bob: Math.abs(Math.sin(t * 6 + 1)) * 0.1 });
    };
  },
  // 49 "Same lunch table. Same bus seat. Same secret handshake."
  (S, cam) => {
    // build three mini-sets side by side far apart
    L('flash')(S);
    const a = new THREE.Group(), b = new THREE.Group(), c = new THREE.Group(); a.position.x = -200; c.position.x = 200; S.add(a, b, c);
    cafeteria(a); bus(b); dayLight(c, { sunPos: [-5, 14, 10] }); street(c); const skyT = T.sky('#4f86d8', '#ffd9b0');
    b.add(new THREE.HemisphereLight(0xfff0d8, 0x605040, 0.2));
    const l1 = add(a, makeAvatar({ ...LEO, face: 'grin', blob: false }), [-1.2, 0, -5.6], 15), m1 = add(a, makeAvatar({ ...MAX, face: 'grin', blob: false }), [1.2, 0, -5.6], -15);
    const l2 = add(b, makeAvatar({ ...LEO, face: 'grin', blob: false }), [-3.6, 0, -1.6], 0), m2 = add(b, makeAvatar({ ...MAX, face: 'smile', blob: false }), [-1.9, 0, -1.6], 0);
    [l2, m2].forEach(A => { A.root.position.y = 0.0; A.legR.rotation.x = -90 * D; A.legL.rotation.x = -90 * D; });
    const l3 = add(c, makeAvatar({ ...LEO, face: 'grin' }), [-1.3, 0, 0], 90), m3 = add(c, makeAvatar({ ...MAX, face: 'grin' }), [1.3, 0, 0], -90);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.3, 0.6]);
      S.background = k === 2 ? skyT : new THREE.Color(k === 0 ? 0xf0e2b8 : 0x9ac8ff);
      if (k === 0) { camPath(cam, p, [-200.2, 4.8, 3.2], [-200.2, 4.7, 2.4], [-200, 4.2, -5.6], [-200, 4.3, -5.6], 36); l1.pose({ rFwd: 60 + Math.sin(t * 10) * 15, tilt: 6 }); m1.pose({ lFwd: 60 + Math.sin(t * 10 + 1) * 15, tilt: -6 }); }
      else if (k === 1) { camPath(cam, p, [-2.4, 4.6, 5.2], [-2.6, 4.5, 4.2], [-2.7, 4.0, -1.6], [-2.7, 4.1, -1.6], 34); l2.pose({ rLeg: 90, lLeg: 90, turn: 25, tilt: Math.sin(t * 8) * 6 }); m2.pose({ rLeg: 90, lLeg: 90, turn: -20, bob: Math.abs(Math.sin(t * 8)) * 0.05 }); }
      else { camPath(cam, p, [200, 4.0, 7.5], [200, 3.9, 6.5], [200, 3.2, 0], [200, 3.3, 0], 32);
        const h = Math.sin(p * Math.PI * 4); l3.pose({ rFwd: 80 + h * 25, rUp: -10, bob: Math.abs(h) * 0.08 }); m3.pose({ lFwd: 80 - h * 25, lUp: -10, bob: Math.abs(h) * 0.08 }); }
    };
  },
  // 50 "Two months ago, he moved across the ocean."
  (S, cam) => {
    const plane = ocean(S); L('flash')(S);
    plane.scale.setScalar(2.2); return (t, dur) => { camPath(cam, t / dur, [0, 14, 14], [0, 15, 12], [0, 17, -30], [0, 18, -36], 30); plane.position.set(-10 + t * 7, 17 + t * 0.8, -30 - t * 4); plane.rotation.y = 0.3; plane.rotation.z = 0.06; };
  },
  // 51 "At the airport, Max cried."
  (S, cam) => {
    airport(S); L('flash')(S);
    const max = add(S, makeAvatar({ ...MAX, face: 'cry' }), [0.5, 0, -4], -10);
    const bag = box(S, [1.6, 2.2, 0.9], [2.6, 1.3, -4], std({ color: 0x2a6ad8, roughness: 0.5 }), { r: 0.15 });
    return (t, dur) => { camPath(cam, t / dur, [0.2, 4.8, 2.4], [0.3, 4.75, 1.4], [0.5, 4.3, -4], [0.5, 4.4, -4], 40); max.pose(addPose({ rFwd: 20, lFwd: 20 }, sob(t, 1.4))); };
  },
  // 52 "I didn't. I just smiled and gave him a thumbs up."
  (S, cam) => {
    airport(S); L('flash')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'fakesmile', blob: false }), [-1.5, 0, -3.5], 15);
    const max = add(S, makeAvatar({ ...MAX, face: 'cry' }), [2.2, 0, -4.2], -30);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) camPath(cam, p, [-1.0, 4.85, 0.5], [-1.0, 4.8, -0.2], [-1.5, 4.4, -3.5], [-1.5, 4.45, -3.5], 42);
      else camPath(cam, p, [0.2, 4.3, 6.5], [0.3, 4.2, 5.2], [0.3, 3.6, -3.8], [0.3, 3.7, -3.8], 30);
      leo.pose(track([[0, POSES.rest], [dur * 0.5, POSES.rest], [dur * 0.62, { rFwd: 90, rUp: 15 }]], t, snap));
      max.pose(addPose({ rFwd: 20, lFwd: 20 }, sob(t, 1.2)));
    };
  },
  // 53 "At school, I smiled at his empty desk."
  (S, cam) => {
    classroom(S, false); L('flash')(S);
    const wd = std({ map: T.planks(0xb07a48) }), mt = std({ color: 0x555a60, metalness: 0.4 });
    for (const x of [-2.2, 2.2]) { box(S, [3.2, 0.2, 2.2], [x, 2.4, -3], wd); box(S, [0.25, 2.3, 0.25], [x, 1.15, -3], mt); }
    const leo = add(S, makeAvatar({ ...LEO, face: 'fakesmile', blob: false }), [-2.2, 0, -5.0], 40);
    return (t, dur) => { camPath(cam, t / dur, [3.5, 5.0, 5.0], [3.0, 4.8, 3.5], [0, 3.4, -4], [0, 3.6, -4], 30); leo.pose({ turn: 15, rUp: 3, lUp: 3, tilt: 5 }); };
  },
  // 54 "At home, I told Mom I was totally fine."
  (S, cam) => {
    kitchen(S); L('flash')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'fakesmile', blob: false }), [-1.5, 0, -4.6], 25);
    const mom = add(S, makeAvatar({ ...MOM, face: 'worried' }), [2.0, 0, -5.4], -30);
    return (t, dur) => { camPath(cam, t / dur, [0.2, 4.6, 5], [0.3, 4.5, 3.6], [0.2, 4.0, -5], [0.2, 4.1, -5], 30); leo.pose({ rUp: 150, lUp: 6, rFwd: 10, tilt: 6, bob: Math.abs(Math.sin(t * 6)) * 0.05 }); mom.pose({ nod: 10, rUp: 3, lUp: 3 }); };
  },
  // 55 "I smiled so hard, for so long,"
  (S, cam) => {
    dayLight(S, { sunPos: [-6, 10, 12] }); wall(S, 0xa04030);
    const leo = add(S, makeAvatar({ ...LEO, face: 'fakesmile' }), [0, 0, 0], 0);
    return (t, dur) => { camPath(cam, t / dur, [0, 4.9, 6.0], [0, 4.75, 4.6], [0, 4.45, 0], [0, 4.5, 0], 50); leo.pose({ rUp: 4, lUp: 4, tilt: Math.sin(t * 20) * 1.2 }); };
  },
  // 56 "that my shadow had to do all the crying by itself."
  (S, cam) => {
    bedroom(S); L('night')(S);
    const leo = makeAvatar({ ...LEO, face: 'fakesmile', blob: false }); leo.root.position.set(-3.5, 2.35, -0.9); leo.root.rotation.x = -90 * D; S.add(leo.root);
    box(S, [4.1, 0.9, 4.6], [-3.5, 2.55, -2.3], std({ map: T.plaster(0x3f6fb8) }), { r: 0.3 });
    const sh = wallShadow(S, LEO, [1.2, -8.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) camPath(cam, p, [0.5, 7.5, 0.0], [0.3, 7.2, -0.6], [-3.5, 2.6, -5.2], [-3.5, 2.6, -5.4], 30);
      else camPath(cam, p, [1.6, 3.4, -2.5], [1.4, 3.3, -3.3], [1.2, 2.5, -9], [1.2, 2.5, -9], 30);
      sh.pose(addPose(HUDDLE, sob(t, 1.2)));
    };
  },
  // 57 "Every single night."
  (S, cam) => {
    bedroom(S); L('night')(S);
    const cal = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.75), std({ map: T2.calendar() })); cal.position.set(-0.4, 5.4, -8.78); S.add(cal);
    const sh = wallShadow(S, LEO, [1.6, -8.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => { camPath(cam, t / dur, [0.4, 4.2, -1.0], [0.5, 4.0, -2.2], [1.1, 3.4, -9], [1.1, 3.4, -9], 28); sh.pose(addPose(HUDDLE, sob(t, 1.0))); };
  },
  // 58 "It didn't run away from me."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'sad', blob: false }), [-1, 0, 2], 175);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => { camPath(cam, t / dur, [-2.5, 5.0, 9.5], [-2.2, 4.8, 8.5], [-0.6, 3.0, -2], [-0.5, 3.0, -2.5], 28); leo.pose({ nod: 10, rUp: 3, lUp: 3 }); sh.pose(addPose(HUDDLE, sob(t, 0.8))); };
  },
  // 59 "It just got tired of being sad alone."
  (S, cam) => {
    playground(S); L('night')(S);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => { camPath(cam, t / dur, [-1.0, 2.6, 1.8], [-0.6, 2.5, 0.8], [0, 2.2, -6], [0, 2.2, -6], 32); sh.pose(addPose(HUDDLE, sob(t, 1.0))); };
  },
  // 60 "So I sat down in the sand, right in front of it."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'sad', blob: false }), [0.3, 0, -3.6], 180);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => {
      camPath(cam, t / dur, [3.5, 4.8, 6.5], [3.0, 4.2, 5.0], [0, 2.8, -3.5], [0, 2.2, -3.5], 28);
      const s = ease(Math.max(0, Math.min(1, (t - 0.3) / 0.7)));
      leo.root.position.y = -1.45 * s; leo.pose({ rLeg: 90 * s, lLeg: 90 * s, rFwd: 30 * s, lFwd: 30 * s, nod: 10 });
      sh.pose(addPose(HUDDLE, sob(t, 0.8)));
    };
  },
  // 61 "And for the first time in two months,"
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'sad', blob: false }), [0.3, -1.45, -3.6], 130);
    return (t, dur) => { camPath(cam, t / dur, [2.9, 3.5, -5.3], [2.6, 3.4, -5.1], [0.3, 3.0, -3.6], [0.3, 3.0, -3.6], 30); leo.pose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30, nod: 4 }); };
  },
  // 62 "I let my face look exactly how I felt."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'sad', blob: false }), [0.3, -1.45, -3.6], 130);
    return (t, dur) => {
      camPath(cam, t / dur, [2.9, 3.5, -5.3], [2.6, 3.4, -5.1], [0.3, 3.0, -3.6], [0.3, 3.0, -3.6], 34);
      leo.setFace(t < dur * 0.35 ? 'sad' : t < dur * 0.65 ? 'teary' : 'cry'); leo.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 30, lFwd: 30 }, t > dur * 0.65 ? sob(t, 0.8) : {}));
    };
  },
  // 63 "I cried. Big, loud, snotty crying."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'cry', blob: false }), [0.3, -1.45, -3.6], 130);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [2.9, 3.5, -5.3], [2.6, 3.4, -5.1], [0.3, 3.0, -3.6], [0.3, 3.1, -3.6], 30);
      else camPath(cam, p, [5.5, 4.2, 4.5], [5.0, 4.0, 3.8], [0, 2.2, -4.2], [0, 2.2, -4.2], 28);
      leo.pose(addPose({ rLeg: 90, lLeg: 90, rFwd: 25, lFwd: 25, nod: -25 }, sob(t, 2.2))); sh.pose(addPose(HUDDLE, sob(t, 0.6)));
    };
  },
  // 64 "My shadow looked up."
  (S, cam) => {
    playground(S); L('night')(S);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => { camPath(cam, t / dur, [0.6, 2.7, 1.6], [0.5, 2.7, 1.0], [0, 2.5, -6], [0, 2.6, -6], 32); sh.pose(track([[0, HUDDLE], [0.25, HUDDLE], [0.6, { ...HUDDLE, nod: -12, lean: 5 }]], t)); sh.root.rotation.y = -90 * D; };
  },
  // 65 "Then it slid down off the wall,"
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'teary', blob: false }), [0.3, -1.45, -3.6], 145);
    const sh = wallShadow(S, LEO, [0, -5.97], { profile: false, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => {
      camPath(cam, t / dur, [3.8, 4.8, 6.0], [3.4, 4.4, 5.2], [0, 2.4, -4.5], [0, 1.8, -4.5], 28);
      leo.pose({ rLeg: 90, lLeg: 90, rFwd: 25, lFwd: 25, nod: -10 });
      const p = ease(t / dur); sh.pose(lerpPose(HUDDLE, { rUp: 3, lUp: 3 }, p)); sh.flat.position.y = -1.45 - p * 5.5;
    };
  },
  // 66 "across the sand,"
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'teary', blob: false }), [0.3, -1.45, -3.6], 145);
    const sh = floorShadow(S, LEO, [0.3, -5.8], 180, 1.0); sh.flat.rotation.y = 0;
    sh.inner.rotation.x = -Math.PI / 2;
    return (t, dur) => {
      camPath(cam, t / dur, [4.5, 7.5, 2.5], [4.0, 7.2, 1.5], [0.3, 0, -3.8], [0.3, 0, -3.4], 28);
      leo.pose({ rLeg: 90, lLeg: 90, rFwd: 25, lFwd: 25, nod: 15 });
      sh.flat.position.z = -5.8 + ease(t / dur) * 1.3; sh.pose({ rUp: 3, lUp: 3 });
    };
  },
  // 67 "and clicked back onto my feet, like it had never left."
  (S, cam) => {
    playground(S); L('night')(S);
    const leo = add(S, makeAvatar({ ...LEO, face: 'teary', blob: false }), [0.3, -1.45, -3.6], 145);
    const sh = floorShadow(S, LEO, [0.3, -4.5], 0, 1.0); sh.inner.rotation.x = -Math.PI / 2;
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.45]);
      if (k === 0) camPath(cam, p, [3.5, 5.5, 1.5], [3.2, 5.2, 1.0], [0.3, 0.2, -3.0], [0.3, 0.2, -3.0], 30);
      else camPath(cam, p, [2.9, 3.5, -5.3], [2.6, 3.4, -5.1], [0.3, 3.0, -3.6], [0.3, 3.0, -3.6], 32);
      const c = Math.min(1, t / 0.35); sh.flat.position.z = -4.5 + ease(c) * 0.9;
      const pop = t > 0.35 && t < 0.6 ? 1 + Math.sin((t - 0.35) / 0.25 * Math.PI) * 0.15 : 1; sh.flat.scale.x = pop; sh.flat.scale.z = pop;
      leo.setFace(k === 0 ? 'teary' : 'softsmile'); leo.pose({ rLeg: 90, lLeg: 90, rFwd: 25, lFwd: 25, nod: k === 0 ? 20 : 0 });
    };
  },
  // 68 "When I got home, Mom was waiting on the porch."
  (S, cam) => {
    porch(S); L('night')(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'worried' }), [-1.2, 0.6, -1.5], 0);
    const leo = add(S, makeAvatar({ ...LEO, face: 'softsmile', blob: false }), [2, 0, 9], 180);
    return (t, dur) => {
      camPath(cam, t / dur, [5, 5.5, 18], [3.5, 5.0, 15], [-0.5, 3.6, -1], [-0.5, 3.6, -1], 30);
      leo.root.position.z = 9 - t * 2.2; leo.pose(walk(t, 0.9)); mom.pose(addPose({ rFwd: 70, lFwd: 70, rUp: -18, lUp: -18 }, idle(t, 0.5)));
    };
  },
  // 69 "She looked at my feet. Then she looked at my face."
  (S, cam) => {
    porch(S); L('night')(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'worried' }), [-1.0, 0.6, -1.5], 10);
    const leo = add(S, makeAvatar({ ...LEO, face: 'softsmile', blob: false }), [-0.4, 0.6, 1.8], 180);
    const sh = floorShadow(S, LEO, [-0.4, 1.8], 0, 1.0); sh.flat.position.y = 0.64; sh.inner.rotation.x = Math.PI / 2;
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) { camPath(cam, p, [2.8, 5.0, 2.6], [2.5, 4.9, 2.2], [-1.0, 4.3, -1.5], [-1.0, 4.3, -1.5], 32); mom.pose({ nod: 35, rUp: 3, lUp: 3 }); }
      else { camPath(cam, p, [-0.5, 5.1, 2.4], [-0.6, 5.05, 1.9], [-1.0, 4.9, -1.5], [-1.0, 4.95, -1.5], 40); mom.pose({ nod: -6, rUp: 3, lUp: 3 }); mom.setFace('teary'); }
    };
  },
  // 70 "She didn't say a word."
  (S, cam) => {
    porch(S); L('night')(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'teary' }), [-1.0, 0.6, -1.5], 10);
    return (t, dur) => { camPath(cam, t / dur, [-0.7, 5.2, 2.4], [-0.75, 5.15, 1.8], [-1.0, 5.0, -1.5], [-1.0, 5.0, -1.5], 45); mom.pose({ nod: -6, tilt: Math.sin(t * 2) * 2 }); };
  },
  // 71 "She just hugged me."
  (S, cam) => {
    porch(S); L('night')(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'softsmile' }), [-1.0, 0.6, -0.4], 90);
    const leo = add(S, makeAvatar({ ...LEO, face: 'cry', blob: false }), [0.55, 0.6, -0.4], -90);
    return (t, dur) => {
      camPath(cam, t / dur, [-0.2, 5.0, 8.5], [-0.2, 4.8, 7.0], [-0.2, 4.2, -0.4], [-0.2, 4.2, -0.4], 32);
      const h = ease(Math.min(1, t / 0.35)); mom.pose(lerpPose({}, HUG, h)); leo.pose(addPose(lerpPose({}, HUG, h), sob(t, 0.7)));
    };
  },
  // 72 "And under the porch light, I saw our shadows."
  (S, cam) => {
    porch(S); L('night')(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'softsmile' }), [-1.0, 0.6, -0.4], 90);
    const leo = add(S, makeAvatar({ ...LEO, face: 'softsmile', blob: false }), [0.55, 0.6, -0.4], -90);
    const ms = wallShadow(S, MOM, [1.6, -3.47], { profile: true, size: 1.25 }); ms.flat.position.y = 0.6;
    const ls = wallShadow(S, LEO, [3.6, -3.47], { profile: true, size: 1.25 }); ls.flat.position.y = 0.6; ls.root.rotation.y = -90 * D;
    return (t, dur) => {
      camPath(cam, t / dur, [0.5, 4.6, 7], [1.5, 4.8, 5.5], [0.0, 4.0, -1], [2.4, 4.4, -3.4], 30);
      mom.pose(HUG); leo.pose(HUG); ms.pose(HUG); ls.pose(HUG);
    };
  },
  // 73 "Hers was crying too."
  (S, cam) => {
    porch(S); L('night')(S);
    const ms = wallShadow(S, MOM, [1.6, -3.47], { profile: true, size: 1.25 }); ms.flat.position.y = 0.6;
    const ls = wallShadow(S, LEO, [3.6, -3.47], { profile: true, size: 1.25 }); ls.flat.position.y = 0.6; ls.root.rotation.y = -90 * D;
    return (t, dur) => { camPath(cam, t / dur, [2.6, 5.4, 5.0], [2.6, 5.4, 4.0], [2.6, 5.0, -3.5], [2.6, 5.0, -3.5], 32); ms.pose(addPose(HUG, addPose({ nod: 25 }, sob(t, 1.5)))); ls.pose(HUG); };
  },
  // 74 "She'd known all along."
  (S, cam) => {
    porch(S); L('night')(S);
    const mom = add(S, makeAvatar({ ...MOM, face: 'softsmile' }), [-1.0, 0.6, -0.4], 15);
    return (t, dur) => { camPath(cam, t / dur, [-0.3, 5.3, 3.4], [-0.4, 5.25, 2.8], [-1.0, 5.0, -0.4], [-1.0, 5.05, -0.4], 32); mom.pose({ ...HUG, nod: 2, tilt: -8 }); };
  },
  // 75 "Now, when anyone in our house is sad, we don't hide it."
  (S, cam) => {
    backyard(S);
    const fam = [[-2.2, MOM, 'smile'], [0.3, LEO, 'grin'], [2.8, DAD, 'smile']].map(([x, o, f]) => { const A = add(S, makeAvatar({ ...o, face: f }), [x, -1.45, 1], 0); return A; });
    const shs = [[-2.2, MOM], [0.3, LEO], [2.8, DAD]].map(([x, o]) => { const s = wallShadow(S, o, [x + 1.0, -4.72], { size: 1.0 }); s.flat.position.y = -1.45; return s; });
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.5]);
      if (k === 0) camPath(cam, p, [0.3, 5, 14], [0.3, 4.6, 12], [0.3, 2.5, -1], [0.3, 2.4, -1], 30);
      else camPath(cam, p, [0.4, 3.3, 4.6], [0.4, 3.3, 3.8], [0.3, 3.0, 1], [0.3, 3.0, 1], 42);
      fam.forEach((A, i) => A.pose(addPose(SIT, { rFwd: 20, lFwd: 20, tilt: Math.sin(t * 2 + i) * 4 })));
      shs.forEach((s, i) => s.pose(addPose(SIT, { rFwd: 20, lFwd: 20, tilt: Math.sin(t * 2 + i) * 4 })));
    };
  },
  // 76 "We sit out in the sun, together."
  (S, cam) => {
    backyard(S);
    const fam = [[-2.2, MOM, 'smile'], [0.3, LEO, 'grin'], [2.8, DAD, 'smile']].map(([x, o, f]) => add(S, makeAvatar({ ...o, face: f }), [x, -1.45, 1], 0));
    return (t, dur) => { camPath(cam, t / dur, [-6, 9, 12], [-4, 8, 11], [0.3, 1.5, 0], [0.3, 1.8, 0], 28); fam.forEach((A, i) => A.pose(addPose(SIT, { rUp: i === 1 ? 150 : 20, lUp: 20, tilt: Math.sin(t * 2 + i) * 4 }))); };
  },
  // 77 "Even Dad. His shadow still hates the meatloaf."
  (S, cam) => {
    backyard(S);
    const dad = add(S, makeAvatar({ ...DAD, face: 'grin' }), [1.5, -1.45, 1], -10);
    const plate = box(S, [1.2, 0.08, 1.2], [1.5, 1.5, 2.6], std({ color: 0xfafafa }), { r: 0.04 });
    const sh = wallShadow(S, DAD, [3.0, -4.72], { profile: true, size: 1.0 }); sh.flat.position.y = -1.45;
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.42]);
      if (k === 0) camPath(cam, p, [1.0, 3.6, 6.5], [1.1, 3.5, 5.4], [1.5, 3.0, 1], [1.5, 3.0, 1], 38);
      else camPath(cam, p, [2.0, 3.0, 3.0], [2.2, 3.0, 2.2], [3.0, 2.4, -4.7], [3.0, 2.4, -4.7], 32);
      dad.pose(addPose(SIT, { rFwd: 60, lFwd: 45, tilt: Math.sin(t * 4) * 5 }));
      sh.pose(track([[0, { ...SIT, rFwd: 60 }], [dur * 0.5, { ...SIT, rFwd: 60 }], [dur * 0.7, { ...SIT, lean: 35, nod: 40, rFwd: 125 }]], t));
    };
  },
  // 78 "Even my cousin. His shadow finally took off the hat."
  (S, cam) => {
    backyard(S);
    const c = add(S, makeAvatar({ ...COUS, face: 'grin' }), [-1, -1.45, 1], 10);
    const sh = wallShadow(S, { ...COUS, hair: 'spiky' }, [0.8, -4.72], { size: 1.0 }); sh.flat.position.y = -1.45;
    const hat = new THREE.Group(); const hm = shadowMatWall;
    const brim = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.02), hm), crown = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.25, 0.02), hm); crown.position.y = 0.66;
    hat.add(brim, crown); hat.position.set(0.8, 2.0 + 2.6 + 0.66, -4.7); hat.renderOrder = 3; brim.renderOrder = crown.renderOrder = 3; S.add(hat);
    return (t, dur) => {
      const [k, p] = seg(t, dur, [0.42]);
      if (k === 0) camPath(cam, p, [-0.6, 3.6, 6.5], [-0.7, 3.5, 5.4], [-1, 3.0, 1], [-1, 3.0, 1], 38);
      else camPath(cam, p, [0.8, 3.4, 4.0], [0.8, 3.4, 3.0], [0.8, 3.0, -4.7], [0.8, 3.1, -4.7], 30);
      c.pose(addPose(SIT, { rFwd: 20, lFwd: 20, tilt: Math.sin(t * 4) * 5 }));
      const lift = ease(Math.max(0, Math.min(1, (t - dur * 0.55) / (dur * 0.3))));
      sh.pose(addPose(SIT, { rUp: 150 * lift, rFwd: 10 * lift, lFwd: 20, tilt: -6 * lift }));
      hat.position.set(0.8 - 0.6 * lift, 2.0 + 1.15 + 0.66 + lift * 1.4, -4.7); hat.rotation.z = lift * 0.3;
    };
  },
  // 79 "But nobody's shadow ever has to cry alone again."
  (S, cam) => {
    backyard(S);
    const fam = [[-3.2, MOM, 'smile'], [-1.0, LEO, 'softsmile'], [1.2, DAD, 'smile'], [3.4, COUS, 'grin']].map(([x, o, f]) => add(S, makeAvatar({ ...o, face: f }), [x, -1.45, 1], 0));
    const shs = [[-3.2, MOM], [-1.0, LEO], [1.2, DAD], [3.4, { ...COUS }]].map(([x, o]) => { const s = wallShadow(S, o, [x + 1.0, -4.72], { size: 1.0 }); s.flat.position.y = -1.45; return s; });
    return (t, dur) => {
      camPath(cam, t / dur, [0.3, 4.0, 9], [0.3, 7.5, 17], [0.3, 3.0, 0], [0.3, 3.0, -2], 32, 28);
      const arms = [{ lUp: -30, lFwd: 70 }, { rUp: -30, rFwd: 70, lUp: -30, lFwd: 70 }, { rUp: -30, rFwd: 70, lUp: -30, lFwd: 70 }, { rUp: -30, rFwd: 70 }];
      fam.forEach((A, i) => A.pose(addPose(SIT, { ...arms[i], tilt: Math.sin(t * 1.5 + i) * 5 })));
      shs.forEach((s, i) => s.pose(addPose(SIT, { rUp: 40, lUp: 40, tilt: Math.sin(t * 1.5 + i) * 5 })));
    };
  },
];
