from pathlib import Path

print('=== PERSONNAGE ===')
for p in sorted(Path('.').glob('*.js')):
    lines=p.read_text(encoding='utf-8',errors='ignore').splitlines()
    for i,line in enumerate(lines,1):
        if 'personnage' in line.lower() or 'scrperson' in line.lower():
            a=max(1,i-12); b=min(len(lines),i+45)
            print(f'--- {p}:{i} ---')
            for j in range(a,b+1): print(f'{j}: {lines[j-1]}')

print('=== TEMP GOLD CANDIDATES ===')
terms=('10%','10 %','+10','30 min','30min','1800000','goldboost','bonus or','boost or','or pendant','or durant','gold bonus','temporary')
for p in sorted(Path('.').glob('*.js')):
    lines=p.read_text(encoding='utf-8',errors='ignore').splitlines()
    for i,line in enumerate(lines,1):
        lo=line.lower()
        if any(t in lo for t in terms): print(f'{p}:{i}: {line}')
