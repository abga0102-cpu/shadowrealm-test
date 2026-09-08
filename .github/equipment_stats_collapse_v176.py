from pathlib import Path
p=Path('index.html')
s=p.read_text()
# Preserve whatever feature currently owns the previous build comment; only move the global build forward.
import re
s=re.sub(r'<!-- .*? · build 2026\.09\.08\.175 -->','<!-- Equipment Stats V176 · build 2026.09.08.176 -->',s,count=1)
s=s.replace('content="2026.09.08.175"','content="2026.09.08.176"',1)
needle='<script src="boost-inventory-v174.js?v=2026.09.08.174"></script>'
insert=needle+'<script src="equipment-stats-collapse-v176.js?v=2026.09.08.176"></script>'
if 'equipment-stats-collapse-v176.js' not in s:
    if needle not in s: raise SystemExit('boost V174 hook not found')
    s=s.replace(needle,insert,1)
p.write_text(s)
