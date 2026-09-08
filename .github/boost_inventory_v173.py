from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if 'boost-inventory-v173.js' not in s:
    needle='<script src="sanctuary-endgame-v130.js?v=2026.09.08.151"></script>'
    if needle not in s:
        raise SystemExit('sanctuary-endgame script tag not found')
    s=s.replace(needle, needle+'<script src="boost-inventory-v173.js?v=2026.09.08.173"></script>',1)
s=s.replace('<!-- Rebirth DR V172 · build 2026.09.08.172 -->','<!-- Boost Inventory V173 · build 2026.09.08.173 -->',1)
s=s.replace('name="shadowreach-build" content="2026.09.08.172"','name="shadowreach-build" content="2026.09.08.173"',1)
p.write_text(s,encoding='utf-8')

# Static invariants: Sanctuary already stores boost rewards instead of activating them.
san=Path('sanctuary-endgame-v130.js').read_text(encoding='utf-8')
assert "MYTHIQUE_I:{boosts:[['gold10_30',1]]}" in san
assert 'addBoostItems(st,r.boosts)' in san
assert 'boostItems' in san and 'activeBoosts' in san

ui=Path('boost-inventory-v173.js').read_text(encoding='utf-8')
for marker in ['Boost inventory V173','Le chrono démarre uniquement','SCREENS.equipement=e','activeBoostsV173']:
    assert marker in ui, marker
print('Boost inventory V173 patched and verified')
