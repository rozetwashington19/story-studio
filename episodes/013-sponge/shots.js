import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 30 (the giant foam monster roaring over the school)
export const SHOTS = [hook(SHOTS_B[8], { at: 1.0, len: 2.4 }), ...SHOTS_A, ...SHOTS_B];
