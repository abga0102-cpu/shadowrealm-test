from pathlib import Path

BUILD_OLD = '2026.09.06.30'
BUILD_NEW = '2026.09.06.31'

# 1) Merge price: 90% cheaper, same progression shape and same Gold-only system.
p = Path('game-4.js')
s = p.read_text()
old = 'function sanctSupplierPrice(level) { return 2500*Math.max(1,level)*Math.max(1,level); }'
new = 'function sanctSupplierPrice(level) { return 250*Math.max(1,level)*Math.max(1,level); }'
if old not in s:
    raise SystemExit('sanctuary price anchor missing')
s = s.replace(old, new, 1)
p.write_text(s)

# 2) One-time migration compensation.
# Exact old spend can only be proven once per discovered recipe because old saves
# stored recipe discovery + total fusion count, not the full repeated-craft log.
p = Path('game-1.js')
s = p.read_text()
anchor = '  merged.eggs = (merged.eggs || []).map((e) =>\n    Object.assign({ species: randSpecies(), element: randElement() }, e));\n  return merged;'
insert = '''  merged.eggs = (merged.eggs || []).map((e) =>\n    Object.assign({ species: randSpecies(), element: randElement() }, e));\n\n  // ECONOMY_REFUND_V31\n  // Remboursement automatique du Sanctuaire historique. L'ancienne sauvegarde\n  // mémorisait seulement les recettes découvertes et le nombre total de fusions,\n  // pas la recette de chaque fusion répétée. On rembourse donc exactement ce qui\n  // est prouvé par les découvertes, sans inventer la composition des extras.\n  if (!Object.prototype.hasOwnProperty.call(s, "sanctuaryMergeRefundV31")) {\n    const oldSanct = (s.sanctuary && typeof s.sanctuary === "object") ? s.sanctuary : {};\n    const disc = (oldSanct.discovered && typeof oldSanct.discovered === "object") ? oldSanct.discovered : {};\n    const refund = { minerai: 0, poussiere: 0, eclat: 0, essence: 0 };\n    if (disc.r1) refund.minerai += 200;\n    if (disc.r2) { refund.eclat += 20; refund.essence += 20; }\n    if (disc.r3) { refund.poussiere += 150; refund.minerai += 250; }\n    if (disc.r4) { refund.eclat += 50; refund.essence += 50; }\n    if (disc.r5) { refund.poussiere += 500; refund.essence += 100; }\n    Object.keys(refund).forEach((k) => { merged[k] = Math.max(0, Number(merged[k]) || 0) + refund[k]; });\n    const discoveredCount = ["r1","r2","r3","r4","r5"].filter((id) => !!disc[id]).length;\n    const totalFusions = Math.max(0, Math.floor(Number(oldSanct.fusions) || 0));\n    merged.sanctuaryMergeRefundV31 = true;\n    merged.sanctuaryMergeRefundNoticeV31 = {\n      refund, totalFusions, provenFusions: discoveredCount,\n      untraceableFusions: Math.max(0, totalFusions - discoveredCount)\n    };\n  }\n\n  // Revalorise uniquement l'Or d'Autonomie encore présent dans la réserve.\n  // Les encaissements historiques déjà réclamés ne sont pas reconstructibles,\n  // mais aucune réserve actuelle ne doit rester valorisée sous l'ancien taux.\n  if (!Object.prototype.hasOwnProperty.call(s, "autonomyGoldRebaseV31")) {\n    if (merged.harvest && Number(merged.harvest.secs) > 0) {\n      const secs = Math.max(0, Number(merged.harvest.secs) || 0);\n      const due = harvestRates(merged).gold * secs / 3600;\n      const before = Math.max(0, Number(merged.harvest.gold) || 0);\n      if (due > before) merged.harvest.gold = due;\n      merged.autonomyGoldRebaseNoticeV31 = { before, after: Math.max(before, due), added: Math.max(0, due - before) };\n    }\n    merged.autonomyGoldRebaseV31 = true;\n  }\n  return merged;'''
if anchor not in s:
    raise SystemExit('migration return anchor missing')
s = s.replace(anchor, insert, 1)
p.write_text(s)

# 3) Build bump for cache busting.
for fn in ['game-2.js', 'index.html']:
    p = Path(fn)
    s = p.read_text()
    if BUILD_OLD not in s:
        raise SystemExit(f'{fn}: build anchor missing')
    s = s.replace(BUILD_OLD, BUILD_NEW)
    p.write_text(s)

# Keep the visible build comment aligned if present.
p = Path('index.html')
s = p.read_text()
s = s.replace('<!-- Sanctuaire Merge · build 2026.09.06.31 -->', '<!-- Économie Merge · build 2026.09.06.31 -->')
p.write_text(s)

print('Economy refund v31 applied')
