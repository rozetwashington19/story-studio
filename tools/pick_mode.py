"""Roll this episode's story mode (run once at the start of each episode, then follow RUNBOOK step 1 for that mode).
  python3 tools/pick_mode.py            -> prints MODE and, for wild episodes, two suggested worlds
Modes: heartfelt (~40%) - emotional rule, everyday settings, tearjerker ending (like 001 Shadow, 002 Thank You)
       wild      (~60%) - fun high-concept rule with creatures/magic/sci-fi, themed world, funny twist ending
Also rolls the OPENER: in-this-world (~50%) or cold-open (~50%).
Worlds used by the last 3 episodes (INDEX.md 'mode' column, e.g. 'wild:space') are not suggested again."""
import os, random, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORLDS = ['forest', 'forest (night)', 'spooky', 'space', 'underwater', 'candy', 'castle', 'castle (night)', 'cityNight', 'snow', 'desert', 'lab']
rows = [l for l in open(os.path.join(ROOT, "episodes/INDEX.md")) if re.match(r"\d{3} \|", l)]
recent = " ".join(rows[-3:]).lower()
mode = "wild" if random.random() < 0.6 else "heartfelt"   # owner 2026-11-18: more wild stories
print("MODE:", mode)
if mode == "wild":
    pool = [w for w in WORLDS if w.split(" ")[0].lower() not in recent] or WORLDS
    print("SUGGESTED WORLDS (use one, mix with everyday sets, or ignore if the premise needs another):", ", ".join(random.sample(pool, 2)))
opener = "in-this-world" if random.random() < 0.5 else "cold-open"   # owner 2026-11-18: not every episode starts with "In this world"
print("OPENER:", opener, "(cold-open = state the rule directly, e.g. 'Every morning, the creatures come.')")
print("Record it: notes.md 'Mode:' line and the INDEX.md mode column (heartfelt | wild:<world>).")
