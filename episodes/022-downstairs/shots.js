import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line, in order. Line 1 = hook: flash-forward of line 33 (the beast's blazing eyes over Dana, then the giant claw coming down at her)
export const SHOTS = [hook(SHOTS_B[4], { at: 0.55, len: 2.9, speed: 0.62 }), ...SHOTS_A, ...SHOTS_B];
