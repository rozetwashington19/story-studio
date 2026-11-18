import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 28 ("She looked up. She was almost gone.")
export const SHOTS = [hook(SHOTS_B[4], { at: 1.0, len: 3.0 }), ...SHOTS_A, ...SHOTS_B];
