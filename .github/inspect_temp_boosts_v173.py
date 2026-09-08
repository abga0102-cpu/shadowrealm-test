from pathlib import Path

terms=('10%','10 %','30 min','30min','boost','bonus or','gold','reward','récompense')
for p in sorted(Path('.').glob('accomplishments*.js')):
    lines=p.read_text(encoding='utf-8').splitlines()
    print(f'=== {p} ===')
    for i,line in enumerate(lines,1):
        lo=line.lower()
        if any(t in lo for t in terms): print(f'{i}: {line}')
