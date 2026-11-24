import { hook } from '../../engine/kit.js';
import { SHOTS_A } from './shots_a.js';
import { SHOTS_B } from './shots_b.js';
// One entry per script line. Line 1 = hook: flash-forward of line 35 (Abe going blank behind the windshield as the fog takes the truck)
export const SHOTS = [hook(SHOTS_B[13], { at: 1.3, len: 3.4 }), ...SHOTS_A, ...SHOTS_B];
