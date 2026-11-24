import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 31 (Clove on the lifted roof, yelling up at the giant hand)
export const SHOTS = [hook(SHOTS_B[7], { at: 0.6, len: 3.0 }), ...SHOTS_A, ...SHOTS_B];
