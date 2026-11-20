import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 23 (the petal river pouring into Grandpa's window)
export const SHOTS = [hook(SHOTS_B[0], { at: 1.2, len: 2.6 }), ...SHOTS_A, ...SHOTS_B];
