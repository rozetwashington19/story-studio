import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 58 (Nina's body behind the VICE PRESIDENT desk, sweeping the #1 BOSS mug off it while Mrs. Stone applauds)
export const SHOTS = [hook(SHOTS_B[31], { at: 0.5, len: 1.54, speed: 0.55 }), ...SHOTS_A, ...SHOTS_B];
