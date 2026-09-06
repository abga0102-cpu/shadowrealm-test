from pathlib import Path

BUILD_OLD='2026.09.06.41'
BUILD_NEW='2026.09.06.42'

g4=Path('game-4.js').read_text()
old='''        worldAction(worldPrimary[0], "worldRebirth") +\n        worldAction(worldPrimary[1], "worldEquip") +\n        worldAction(worldPrimary[2], "worldDev") +\n        worldAction(worldPrimary[3], "worldDefis") +'''
new='''        worldAction(worldPrimary[0], "worldRebirth") +\n        worldAction(worldPrimary[2], "worldDev") +\n        worldAction(worldPrimary[3], "worldDefis") +'''
if old not in g4:
    raise SystemExit('arena equipment block not found')
g4=g4.replace(old,new,1)
g4=g4.replace('// CAMPAIGN_WORLD_NAV_V37','// CAMPAIGN_WORLD_NAV_V37\n  // ARENA_EQUIPMENT_REMOVED_V42: l\'accès Équipement reste disponible hors du décor de l\'arène.',1)
Path('game-4.js').write_text(g4)

for name in ['game-2.js','index.html']:
    p=Path(name); s=p.read_text()
    if BUILD_OLD not in s:
        raise SystemExit(f'{BUILD_OLD} missing in {name}')
    p.write_text(s.replace(BUILD_OLD, BUILD_NEW))

print('arena equipment removed v42')
