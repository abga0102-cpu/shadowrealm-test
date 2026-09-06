from pathlib import Path

p = Path('game-2.js')
s = p.read_text()

old = '''function spawnCampaign(s) {
  const floor = s.floor, step = s.step;
  const boss = isBoss(floor);
  const elite = !boss && isElite(floor) && step === 3;
  const count = (boss || elite) ? 1 : enemyCount(floor, step);'''
new = '''function campaignWaveCount(floor) {
  // Boss = combat unique. Élite = une vague normale puis l’Élite. Les étages
  // standards conservent les 3 vagues historiques.
  if (isBoss(floor)) return 1;
  if (isElite(floor)) return 2;
  return RULES.STEPS_PER_FLOOR;
}
function spawnCampaign(s) {
  const floor = s.floor, step = s.step;
  const boss = isBoss(floor);
  const elite = !boss && isElite(floor) && step === campaignWaveCount(floor);
  const count = (boss || elite) ? 1 : enemyCount(floor, step);'''
if old not in s:
    raise SystemExit('spawnCampaign pattern missing')
s = s.replace(old, new, 1)

old = '''      } else if (s.step < RULES.STEPS_PER_FLOOR) s.step += 1;
      else {'''
new = '''      } else if (s.step < campaignWaveCount(s.floor)) s.step += 1;
      else {'''
if old not in s:
    raise SystemExit('combat progression pattern missing')
s = s.replace(old, new, 1)

if '2026.09.06.11' not in s:
    raise SystemExit('APP_BUILD .11 missing')
s = s.replace('2026.09.06.11', '2026.09.06.12', 1)
p.write_text(s)

p = Path('index.html')
t = p.read_text()
if '2026.09.06.11' not in t:
    raise SystemExit('index build .11 missing')
p.write_text(t.replace('2026.09.06.11', '2026.09.06.12'))
