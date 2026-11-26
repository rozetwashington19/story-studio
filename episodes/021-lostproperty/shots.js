import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: slow-motion flash-forward of line 40 (Mara mid-leap for the moving Night Train, Cal's arm reaching out of the cab)
export const SHOTS = [hook(SHOTS_B[9], { at: 1.02, len: 1.95, speed: 0.25 }), ...SHOTS_A, ...SHOTS_B];
