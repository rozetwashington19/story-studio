import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 32 (the giant dragon lowering its glowing head toward Wren on the castle wall)
export const SHOTS = [hook(SHOTS_B[10], { at: 1.0, len: 2.5 }), ...SHOTS_A, ...SHOTS_B];
