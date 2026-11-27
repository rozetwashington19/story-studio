import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 23 (the gold visor pressed against Opal's window, tapping on the glass)
export const SHOTS = [hook(SHOTS_A[21], { at: 0.42, len: 3.0, speed: 0.42 }), ...SHOTS_A, ...SHOTS_B];
