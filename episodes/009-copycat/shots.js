import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 27 ("It stomped toward town, copying my tantrum.")
export const SHOTS = [hook(SHOTS_B[3], { at: 1.6, len: 2.4 }), ...SHOTS_A, ...SHOTS_B];
