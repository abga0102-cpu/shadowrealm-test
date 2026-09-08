from pathlib import Path
p=Path('index.html')
s=p.read_text()
s=s.replace('<!-- Boost UX V174 · build 2026.09.08.174 -->','<!-- Equipment Stats V175 · build 2026.09.08.175 -->')
s=s.replace('content="2026.09.08.174"','content="2026.09.08.175"')
needle='<script src="boost-inventory-v174.js?v=2026.09.08.174"></script>'
insert=needle+'<script src="equipment-stats-collapse-v175.js?v=2026.09.08.175"></script>'
if 'equipment-stats-collapse-v175.js' not in s:
    if needle not in s: raise SystemExit('boost V174 hook not found')
    s=s.replace(needle,insert)
p.write_text(s)
