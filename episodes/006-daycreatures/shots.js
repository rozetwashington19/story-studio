import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 34 ("Six of them were closing in.")
export const SHOTS = [hook(SHOTS_B[9], { at: 2.0, len: 3.4 }), ...SHOTS_A, ...SHOTS_B];
