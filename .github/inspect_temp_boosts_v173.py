from pathlib import Path

terms = ('boost','buff','30 min','30min','gold','or +','+10','duration','expires','expiry','timer','temporary','temporaire')
for p in sorted(Path('.').glob('game-*.js')):
    lines=p.read_text(encoding='utf-8').splitlines()
    hits=[]
    for i,line in enumerate(lines,1):
        lo=line.lower()
        if any(t in lo for t in terms):
            hits.append((i,line))
    print(f'=== {p} : {len(hits)} hits ===')
    for i,line in hits[:1200]:
        print(f'{i}: {line}')
