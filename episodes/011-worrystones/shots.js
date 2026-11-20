import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 30 (June holding the stone with MILO written on it, by the lighthouse lens)
export const SHOTS = [hook(SHOTS_B[5], { at: 1.0, len: 2.4 }), ...SHOTS_A, ...SHOTS_B];
