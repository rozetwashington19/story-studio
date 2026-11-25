import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 16 (giant Noodle behind the clock tower at sunset)
export const SHOTS = [hook(SHOTS_A[14], { at: 2.0, len: 2.4 }), ...SHOTS_A, ...SHOTS_B];
