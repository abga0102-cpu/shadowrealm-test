from pathlib import Path

OLD='2026.09.06.35'; NEW='2026.09.06.36'
g3p=Path('game-3.js'); g2p=Path('game-2.js'); idxp=Path('index.html')
g3=g3p.read_text(); g2=g2p.read_text(); idx=idxp.read_text()

if 'ARENA_STABILITY_V36' not in g3:
    g3=g3.replace('let arenaEl = null, arenaNodes = null, arenaT = 0;','let arenaEl = null, arenaNodes = null, arenaT = 0;\nlet arenaCombatRef = null; // ARENA_STABILITY_V36',1)
    old='''  // reset smoothing so a screen change does not slide sprites across the arena\n  P.hero = combat ? combat.heroX : HERO_START;\n  P.en = {};\n  lastTrack = lastSub = lastDecor = "";   // fresh nodes, so force the next write'''
    new='''  // ARENA_STABILITY_V36: a UI re-render must not reset fighter smoothing mid-combat.\n  // Reset positions only when the actual combat instance changes. This removes\n  // the occasional visible jump caused by remounting the arena for unrelated UI updates.\n  if (arenaCombatRef !== combat) {\n    P.hero = combat ? combat.heroX : HERO_START;\n    P.en = {};\n    arenaCombatRef = combat;\n  }\n  lastTrack = lastSub = lastDecor = "";   // fresh nodes, so force the next write'''
    if old not in g3: raise SystemExit('mountArena anchor missing')
    g3=g3.replace(old,new,1)

# bump build only
g2=g2.replace(OLD,NEW)
idx=idx.replace(OLD,NEW).replace('<!-- Sanctuaire Drag Merge · build '+NEW+' -->','<!-- Image stable · build '+NEW+' -->')

assert 'ARENA_STABILITY_V36' in g3
assert NEW in g2 and NEW in idx
g3p.write_text(g3); g2p.write_text(g2); idxp.write_text(idx)
print('image stability v36 applied')
