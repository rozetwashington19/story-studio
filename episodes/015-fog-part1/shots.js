import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line. Line 1 = hook: flash-forward of line 14 (Mr. Pell's blank, grey face in the fog)
export const SHOTS = [hook(SHOTS_A[12], { at: 1.2, len: 3.6 }), ...SHOTS_A, ...SHOTS_B];
