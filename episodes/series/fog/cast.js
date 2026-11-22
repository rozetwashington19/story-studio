// Choose-your-path series "THE FOG" — shared cast. Every part imports from here so the characters look identical in all five parts.
//   import { YOU, NELL, ABE, PELL, PIP, you, nell, abe, pell, pip, biscuit } from '../series/fog/cast.js';
// Add new recurring characters here (and to CAST) when a part introduces one; never change an existing look.
import { makeAvatar, add, pup } from '../../../engine/kit.js';

// YOU — the viewer's avatar (second-person hero, age left open: teen / young adult). Dark-green rain jacket, grey beanie, small backpack, jeans, boots.
export const YOU = { skin: 'tan', shirt: 0x2f5a3a, shirtStyle: 'jacket', pants: 0x2a3a5a, pantsStyle: 'jeans', hair: 'short', hairCol: 0x3a2412,
  outfit: [['beanie', { col: 0x8a8e96 }], ['backpack', { col: 0x3a3a40 }], ['boots', { col: 0x4a3420 }]] };
// NELL — your older sister, a paramedic on the hospital night shift. Navy uniform, hi-vis vest, dark low bun, ID badge.
export const NELL = { skin: 'tan', shirt: 0x1f3a6a, shirtStyle: 'uniform', pants: 0x1a2440, pantsStyle: 'plain', hair: 'lowbun', hairCol: 0x2a1a0e,
  outfit: [['vest', { col: 0xd8f02a }], ['badge', { col: 0xf2f2f2 }], ['boots', { col: 0x1a1a1a }]] };
// ABE — the old ice-cream-truck man the whole street laughs at (his truck still plays its jingle in November). White shirt, red bow tie,
// white paper cap, striped apron, white mustache, bald top, wrinkles.
export const ABE = { skin: 'brown', shirt: 0xf4f4f0, shirtStyle: 'shirt', pants: 0x3a3a44, pantsStyle: 'plain', hair: 'balding', hairCol: 0xe8e8e8,
  beard: 'mustache', beardCol: 0xf0f0f0, wrinkles: true, outfit: [['cap', { col: 0xf8f8f8 }], ['bowtie', { col: 0xd8302a }], ['apron', { col: 0xf2a8c0 }]] };
// MR. PELL — your next-door neighbour (Part 1: the first person you see the fog take). Maroon cardigan over pyjamas, grey comb-over, glasses, wrinkles.
export const PELL = { skin: 'light', shirt: 0x7a2a3a, shirtStyle: 'sweater', pants: 0x6a7aa8, pantsStyle: 'plain', hair: 'combover', hairCol: 0xb8b8bc, wrinkles: true,
  outfit: ['glasses', ['boots', { col: 0x5a3a2a }]] };
// PIP — the little girl Nell is protecting on the hospital roof (Part 1 on). Yellow raincoat, two dark puffs, rosy cheeks, red boots.
export const PIP = { skin: 'brown', shirt: 0xf2c420, shirtStyle: 'jacket', pants: 0x3a4a8a, pantsStyle: 'plain', hair: 'puffs', hairCol: 0x1a0e08, rosy: true,
  outfit: [['boots', { col: 0xd8302a }]] };
export const CAST = { You: YOU, Nell: NELL, Abe: ABE, 'Mr. Pell': PELL, Pip: PIP };
export const CAST_SET = 'night';

export const mk = (S, o, name, face, pos, ry = 0, scale = 1) => { const A = add(S, makeAvatar({ ...o, name, face }), pos, ry); if (scale !== 1) A.root.scale.setScalar(scale); return A; };
export const you = (S, face, pos, ry = 0) => mk(S, YOU, 'you', face, pos, ry, 0.98);
export const nell = (S, face, pos, ry = 0) => mk(S, NELL, 'nell', face, pos, ry, 1.02);
export const abe = (S, face, pos, ry = 0) => mk(S, ABE, 'abe', face, pos, ry, 1.05);
export const pell = (S, face, pos, ry = 0) => mk(S, PELL, 'pell', face, pos, ry, 1.0);
export const pip = (S, face, pos, ry = 0) => mk(S, PIP, 'pip', face, pos, ry, 0.62);
// BISCUIT — your dog (orange blocky corgi-ish pup from sets10): .update(t, 'run'|'sit'|'bark')
export const biscuit = (S) => pup(S, { name: 'biscuit', col: 0xd8892a });
