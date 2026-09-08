from pathlib import Path

for fname,ranges in {
    'game-1.js': [(1810,1885),(2010,2060),(2340,2370),(2570,2620)],
    'game-4.js': [(430,490)],
    'game-5.js': [(1520,1565),(1080,1120)],
    'index.html': [(1,80)],
}.items():
    p=Path(fname)
    lines=p.read_text(encoding='utf-8').splitlines()
    print(f'=== {fname} ===')
    for a,b in ranges:
        print(f'--- {a}-{b} ---')
        for i in range(a,min(b,len(lines))+1): print(f'{i}: {lines[i-1]}')
