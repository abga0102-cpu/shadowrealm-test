from pathlib import Path

GAME2_OLD='2026.09.06.41'
INDEX_OLD='2026.09.06.44'
BUILD_NEW='2026.09.06.45'

g4=Path('game-4.js').read_text()
old='''        worldAction(worldPrimary[0], "worldRebirth") +\n        worldAction(worldPrimary[1], "worldEquip") +\n        worldAction(worldPrimary[2], "worldDev") +\n        worldAction(worldPrimary[3], "worldDefis") +'''
new='''        worldAction(worldPrimary[0], "worldRebirth") +\n        worldAction(worldPrimary[2], "worldDev") +\n        worldAction(worldPrimary[3], "worldDefis") +'''
if old not in g4:
    raise SystemExit('arena equipment block not found')
g4=g4.replace(old,new,1)
if 'ARENA_EQUIPMENT_REMOVED_V45' not in g4:
    g4=g4.replace('// CAMPAIGN_WORLD_NAV_V37','// CAMPAIGN_WORLD_NAV_V37\n  // ARENA_EQUIPMENT_REMOVED_V45: l\'accès Équipement reste disponible hors du décor de l\'arène.',1)
Path('game-4.js').write_text(g4)

g2=Path('game-2.js').read_text()
if GAME2_OLD not in g2:
    raise SystemExit(f'{GAME2_OLD} missing in game-2.js')
Path('game-2.js').write_text(g2.replace(GAME2_OLD,BUILD_NEW))

idx=Path('index.html').read_text()
if INDEX_OLD not in idx:
    raise SystemExit(f'{INDEX_OLD} missing in index.html')
Path('index.html').write_text(idx.replace(INDEX_OLD,BUILD_NEW))

print('arena equipment removed v45')
