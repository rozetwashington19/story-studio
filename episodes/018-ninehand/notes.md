# 018 — The Hand at Nine
Angle: trick-ending — the last 2 lines flip the premise (the town is a gingerbread village on a kitchen table; "Our moon is the kitchen lamp. And we are dessert.")
Mode: wild (candy / gingerbread village) — opener: cold-open (pick_mode). Hook = line 31 (Clove on the lifted roof, yelling up at the giant hand).
Premise: Every night at nine, the sky opens and a giant hand takes the prettiest house in town.
Logline: When silver frost marks Grandpa Gus's fifty-year masterpiece as tonight's house, Clove climbs onto the rising roof and yells at the sky to take her instead — and the giant voices that answer reveal what Sugarby really is.
Clues planted for the flip: the moon never moves (10, 41), the sky smells like coffee every morning (11), the hand wears a knitted holiday sleeve, "keep it for next year" (36), the Mayor's NOT THIS ONE house on a plate (43).
Characters (cast in common.js):
- Clove, 17 (narrator): tan skin, long dark hair with a big pink bow, peppermint-striped red shirt, mint apron, white boots.
- Grandpa Gus (the master icer): brown skin, white balding hair + walrus mustache, wrinkles, teal plaid shirt, icing-stained cream apron, round glasses, red scarf.
- Mister Fudd (baker, ugliest house): pale, black slick hair + mustache, chef hat, white baker's uniform, grey apron.
- The Mayor (no lines): yellow skin, silver bob, purple blazer, gold sash, sunglasses.
- The giant kid (reveal; her red holiday-sweater arm is the hand): light skin, ginger puffs, freckles, red snowflake sweater.
- The giant grandma (reveal): pale, white perm, wrinkles, green cardigan, glasses, orange oven mitts.
- Townsfolk extras (TOWN presets).
Sets (all new, engine/sets18.js): sugarStreet (Sugarby gingerbread main street — day/morning/dusk/night; Fudd's bakery with a giant cupcake, Fudd's lumpy house, Gus's iced house with a roof deck, the Mayor's lilac house with the NOT THIS ONE sign, candy-cane lamps, whipped-cream hills, the still moon), gingerParlor (inside Gus's house: icing workbench, candy-glass windows, fireplace, rocking chair; tilts), the lifted roof deck at night (Gus's house in the giant hand above the town), giantKitchen (the real kitchen: dining table with the whole village on a cake board, pendant-lamp "moon", coffee maker, plates).
New reusable kit: gingerHouse (styles pretty/plain/ugly/mayor, roof deck, frost/scrape/pretty/light), giantHand (blocky hand + knitted sleeve, grip), skyCrack, VILLAGE_S.
Voice: clone narration, default settings. Reworded line 1 ("came for us") and line 44 ("the kitchen lamp") after ASR flags; trimmed to 43 lines to fit 1:30.
Engine: voice.py now reuses a cached passage take when the same passage text moves to a different index (after adding/removing lines).
