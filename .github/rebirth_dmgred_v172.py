from pathlib import Path
import re

GAME = Path('game-1.js')
INDEX = Path('index.html')
s = GAME.read_text(encoding='utf-8')

# Réduction de dégâts: 20 niveaux, +2%/niveau = +40%, coût total direct = 15 000 PR.
new = '{ key: "dmgred", label: "Réduc. Dégâts", icon: "shield", max: 20, perLvl: 2, unit: "%", costDiv: 1, costs: [20,39,63,90,125,168,219,278,348,430,528,641,774,927,1102,1306,1540,1810,2119,2473] }'
pattern = r'\{\s*key:\s*["\']dmgred["\'][^\n]*\}'
s2, n = re.subn(pattern, new, s, count=1)
if n != 1:
    raise SystemExit(f'dmgred definition replacement count={n}')
if sum([20,39,63,90,125,168,219,278,348,430,528,641,774,927,1102,1306,1540,1810,2119,2473]) != 15000:
    raise SystemExit('V172 dmgred cost total is not 15000')
GAME.write_text(s2, encoding='utf-8')

idx = INDEX.read_text(encoding='utf-8')
idx = re.sub(r'<!-- Rebirth caps V171 · build 2026\.09\.08\.171 -->', '<!-- Rebirth DR V172 · build 2026.09.08.172 -->', idx)
idx = idx.replace('content="2026.09.08.171"', 'content="2026.09.08.172"')
idx = idx.replace('game-1.js?v=2026.09.08.171', 'game-1.js?v=2026.09.08.172')
INDEX.write_text(idx, encoding='utf-8')
