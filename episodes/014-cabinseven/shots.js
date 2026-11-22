import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 35 (Sol's teary face through Mom's writing on cabin 7's window)
export const SHOTS = [hook(SHOTS_B[10], { at: 2.0, len: 2.4 }), ...SHOTS_A, ...SHOTS_B];
