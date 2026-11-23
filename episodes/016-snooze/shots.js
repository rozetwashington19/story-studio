import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 35 (Dash riding the giant alarm clock across the rooftops, hands whirling)
export const SHOTS = [hook(SHOTS_B[11], { at: 1.0, len: 2.7 }), ...SHOTS_A, ...SHOTS_B];
