from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('<!-- Boost Inventory V173 · build 2026.09.08.173 -->','<!-- Boost UX V174 · build 2026.09.08.174 -->')
s=s.replace('content="2026.09.08.173"','content="2026.09.08.174"')
needle='<script src="sanctuary-divine-mastery-v132.js?v=2026.09.08.151"></script>'
insert=needle+'<script src="boost-inventory-v174.js?v=2026.09.08.174"></script>'
if 'boost-inventory-v174.js' not in s:
    if needle not in s:
        raise SystemExit('load insertion point missing')
    s=s.replace(needle,insert,1)
p.write_text(s,encoding='utf-8')
