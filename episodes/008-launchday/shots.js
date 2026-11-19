import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 22 ("And the Wait grew taller than the hotels.")
export const SHOTS = [hook(SHOTS_B[2], { at: 2.4, len: 3.2 }), ...SHOTS_A, ...SHOTS_B];
