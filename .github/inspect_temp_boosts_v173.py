from pathlib import Path
p=Path('sanctuary-endgame-v130.js'); lines=p.read_text(encoding='utf-8').splitlines()
for i,line in enumerate(lines,1):
    if 'boostPanel' in line or 'scrSanctuaire' in line or 'activateBoost' in line or 'data-sanct-v130' in line:
        print(f'{i}: {line}')
