import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line. Line 1 = hook: flash-forward of line 34 (Dot grey again in her doorway)
export const SHOTS = [hook(SHOTS_B[12], { at: 1.2, len: 3.2 }), ...SHOTS_A, ...SHOTS_B];
