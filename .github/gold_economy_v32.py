from pathlib import Path
import re

BUILD_OLD = "2026.09.06.31"
BUILD_NEW = "2026.09.06.32"

OLD_GOLD_COSTS = [100,150,200,250,300,350,400,500,550,600,700,800,850,950,1050,1150,1250,1350,1450,1600,1700,1800,1950,2100,2200,2350,2500,2650,2800,2950,3100,3250,3450,3600,3750,3950,4150,4300,4500,4700,4900,5100,5300,5500,5750,5950,6150,6400,6650,7000]
NEW_GOLD_COSTS = [25,40,50,65,80,90,105,130,145,155,180,205,220,245,270,300,325,350,375,415,440,465,505,545,570,610,650,685,725,765,805,845,895,935,970,1025,1075,1115,1165,1220,1270,1320,1375,1425,1490,1545,1595,1660,1725,1815]
assert sum(OLD_GOLD_COSTS) == 135000
assert sum(NEW_GOLD_COSTS) == 35000

g1p = Path("game-1.js")
g2p = Path("game-2.js")
idxp = Path("index.html")
g1 = g1p.read_text()
g2 = g2p.read_text()
idx = idxp.read_text()

# 1) Rebirth Or: même puissance (+4 %/niv., 50 niveaux), mais économie PR réaliste.
old_arr = "costs: [" + ",".join(map(str, OLD_GOLD_COSTS)) + "]"
new_arr = "costs: [" + ",".join(map(str, NEW_GOLD_COSTS)) + "]"
if old_arr not in g1:
    raise SystemExit("ancienne courbe Rebirth Or introuvable")
g1 = g1.replace("// Prix REELS affichés/payés. Total exact des 50 niveaux : 135 000 PR.\n    " + old_arr,
                "// Prix REELS affichés/payés. Total exact des 50 niveaux : 35 000 PR.\n    " + new_arr, 1)

# 2) La famille déjà dédiée à l'Or autonome devient explicite et atteint +25 % au total.
#    4 paliers x 5 niveaux x 1,25 % = +25 %. Les IDs restent identiques : aucune perte de sauvegarde.
for tier in range(1, 5):
    old = f'label: "Récompense Autonomie {"I"*tier}", short: "Autonomie {"I"*tier}", icon: "moon", color: "#8FC4FF", tier: {tier}, effect: "afkGain", per: 1, unit: "%", max: 5'
    new = f'label: "Prospection d’Or {"I"*tier}", short: "Or Auton. {"I"*tier}", icon: "gold", color: "#F5C542", tier: {tier}, effect: "afkGain", per: 1.25, unit: "%", max: 5'
    if old not in g1:
        raise SystemExit(f"noeud autonomie Or palier {tier} introuvable")
    g1 = g1.replace(old, new, 1)

# 3) Migration non destructive : rembourse exactement le trop-payé en PR selon le niveau Or déjà acheté,
#    puis recalcule la réserve d'Or autonome encore non réclamée avec les nouveaux bonus.
anchor = "  return merged;\n}\n\nfunction rb(s, key) {"
if anchor not in g1:
    raise SystemExit("ancre de migration introuvable")
block = '''  // GOLD_ECONOMY_REBASE_V32\n  // Le coût Rebirth Or passe de 135 000 à 35 000 PR au total. Un joueur qui a\n  // déjà acheté des niveaux récupère exactement la différence entre l'ancienne\n  // et la nouvelle courbe, sans modifier son niveau d'amélioration.\n  if (!Object.prototype.hasOwnProperty.call(s, "rebirthGoldCostRebaseV32")) {\n    const oldGoldCostsV32 = [%s];\n    const newGoldCostsV32 = [%s];\n    const lv = Math.max(0, Math.min(50, Number((merged.rebirth.upgrades || {}).gold) || 0));\n    const oldSpent = oldGoldCostsV32.slice(0, lv).reduce((a,b)=>a+b, 0);\n    const newSpent = newGoldCostsV32.slice(0, lv).reduce((a,b)=>a+b, 0);\n    const refundPR = Math.max(0, oldSpent - newSpent);\n    merged.rebirth.pr = Math.max(0, Number(merged.rebirth.pr) || 0) + refundPR;\n    merged.rebirthGoldCostRebaseV32 = true;\n    merged.rebirthGoldCostRebaseNoticeV32 = { level: lv, oldSpent, newSpent, refundPR };\n  }\n\n  // La Prospection d'Or autonome vaut maintenant jusqu'à +25 %% au total.\n  // On revalorise uniquement la réserve encore présente : les gains déjà encaissés\n  // n'ont pas d'historique fiable et ne sont donc jamais inventés.\n  if (!Object.prototype.hasOwnProperty.call(s, "autonomyGoldRebaseV32")) {\n    if (merged.harvest && Number(merged.harvest.secs) > 0) {\n      const secs = Math.max(0, Number(merged.harvest.secs) || 0);\n      const due = harvestRates(merged).gold * secs / 3600;\n      const before = Math.max(0, Number(merged.harvest.gold) || 0);\n      if (due > before) merged.harvest.gold = due;\n      merged.autonomyGoldRebaseNoticeV32 = { before, after: Math.max(before, due), added: Math.max(0, due - before) };\n    }\n    merged.autonomyGoldRebaseV32 = true;\n  }\n''' % (','.join(map(str, OLD_GOLD_COSTS)), ','.join(map(str, NEW_GOLD_COSTS)))
g1 = g1.replace(anchor, block + anchor, 1)

# Build / cache busting.
g2 = g2.replace(BUILD_OLD, BUILD_NEW)
idx = idx.replace(BUILD_OLD, BUILD_NEW)

# Gardes locales simples.
assert "Total exact des 50 niveaux : 35 000 PR" in g1
assert "Prospection d’Or IV" in g1
assert g1.count('effect: "afkGain", per: 1.25') == 4
assert "GOLD_ECONOMY_REBASE_V32" in g1
assert "rebirthGoldCostRebaseV32" in g1
assert "autonomyGoldRebaseV32" in g1
assert BUILD_NEW in g2 and BUILD_NEW in idx

g1p.write_text(g1)
g2p.write_text(g2)
idxp.write_text(idx)
print("Gold economy v32 applied")
