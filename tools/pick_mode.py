"""Roll this episode's story mode (run once at the start of each episode, then follow RUNBOOK step 1 for that mode).
  python3 tools/pick_mode.py            -> prints MODE and, for wild episodes, two suggested worlds
Modes: heartfelt (~15%) - emotional rule, everyday settings, tearjerker ending (like 001 Shadow, 002 Thank You)
       wild      (~85%) - fun high-concept rule with creatures/magic/sci-fi, themed world, funny twist ending
Also rolls the OPENER: in-this-world (~50%) or cold-open (~50%).
Worlds used by the last 3 episodes (INDEX.md 'mode' column, e.g. 'wild:space') are not suggested again.
Also rolls the story ANGLE (owner request 2026-11-21, "try different ideas within the same niche"): the shape of the story, so
consecutive episodes don't feel the same. Angles used in the last 3 episodes' notes.md ('Angle:' line) are not rolled again.
DOUBLE DOWN: episodes/PERFORMANCE.md lists how each short did; when the latest data marks one as WINNER (it broke past the
1K-view wall), about half the runs copy its mode + angle ("make more shorts like it") with a brand-new premise."""
import os, random, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORLDS = ['forest', 'forest (night)', 'spooky', 'space', 'underwater', 'candy', 'castle', 'castle (night)', 'cityNight', 'snow', 'desert', 'lab']
rows = [l for l in open(os.path.join(ROOT, "episodes/INDEX.md")) if re.match(r"\d{3} \|", l)]
recent = " ".join(rows[-3:]).lower()
mode = "wild" if random.random() < 0.85 else "heartfelt"   # owner 2026-11-27: mostly wacky scenarios with a fun hook (was 0.6)
ANGLES = {
  'escalation': 'rule of three that snowballs: small -> bigger -> absurdly huge (each beat bigger and funnier than the last)',
  'mystery': 'something strange keeps happening; the narrator investigates; clues planted early; the reveal recontextualises them',
  'race-against-time': 'a countdown / deadline drives the whole story (clock, sunset, the bell) — every shot feels urgent',
  'chase': 'the narrator is pursued (or pursues) through set pieces; clever escape instead of a fight',
  'role-reversal': 'the narrator swaps places with someone (the grown-up, the monster, the pet) and learns their side',
  'secret-helper': 'someone has secretly been doing something for the narrator all along — the twist is who and why',
  'villain-was-lonely': 'the scary thing turns out to want something simple (a friend, a home, a name)',
  'wrong-wish': 'the narrator gets exactly what they asked for and it goes hilariously / sadly wrong',
  'unlikely-hero': 'the smallest / quietest / most ignored character saves the day with the thing everyone teased them for',
  'trick-ending': 'the last 2 lines flip the whole premise (a final visual sting the viewer did not see coming)',
}
import glob
recentA = ''
for f in sorted(glob.glob(os.path.join(ROOT, 'episodes/[0-9][0-9][0-9]-*/notes.md')))[-3:]:
    m = re.search(r'^Angle:\s*([\w-]+)', open(f).read(), re.M); recentA += ' ' + (m.group(1) if m else '')
angle = random.choice([a for a in ANGLES if a not in recentA] or list(ANGLES))
# double down on a winner (episodes/PERFORMANCE.md rows: NNN | views | WINNER? | notes)
perf = os.path.join(ROOT, 'episodes/PERFORMANCE.md'); win = None
if os.path.exists(perf):
    for l in open(perf):
        if re.match(r'\d{3} \|', l) and 'WINNER' in l.upper(): win = l.split('|')[0].strip()
if win and random.random() < 0.5:
    row = next((r for r in rows if r.startswith(win)), ''); wm = row.split('|')[-1].strip() if row else ''
    wn = glob.glob(os.path.join(ROOT, f'episodes/{win}-*/notes.md')); wa = re.search(r'^Angle:\s*([\w-]+)', open(wn[0]).read(), re.M) if wn else None
    mode = 'wild' if wm.startswith('wild') else ('heartfelt' if wm else mode); angle = wa.group(1) if wa else angle
    print(f"DOUBLE DOWN on winner {win} ({wm}, angle {angle if wa else 'not recorded: read its notes.md/script and copy its story shape'}): same mode, tone, pacing and angle — brand-new premise, cast and sets.")
print("MODE:", mode)
print("ANGLE:", angle, "—", ANGLES.get(angle, ''))
if mode == "wild":
    pool = [w for w in WORLDS if w.split(" ")[0].lower() not in recent] or WORLDS
    print("SUGGESTED WORLDS (use one, mix with everyday sets, or ignore if the premise needs another):", ", ".join(random.sample(pool, 2)))
opener = "in-this-world" if random.random() < 0.5 else "cold-open"   # owner 2026-11-18: not every episode starts with "In this world"
print("OPENER:", opener, "(cold-open = state the rule directly, e.g. 'Every morning, the creatures come.')")
print("Record it: notes.md 'Mode:' + 'Angle:' lines and the INDEX.md mode column (heartfelt | wild:<world>).")
