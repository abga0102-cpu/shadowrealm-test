from pathlib import Path

terms = ('boost','buff','30 min','30min','1800','1800000','golduntil','gold_until','goldboost','bonus or','or +','+10%','duration','expires','expiry','expiresat','until','temporary','temporaire','daily','reward')
for p in sorted(Path('.').glob('game-*.js')):
    lines=p.read_text(encoding='utf-8').splitlines()
    hits=[]
    for i,line in enumerate(lines,1):
        lo=line.lower()
        if any(t in lo for t in terms):
            hits.append((i,line))
    print(f'=== {p} : {len(hits)} hits ===')
    for i,line in hits[:2000]:
        print(f'{i}: {line}')
