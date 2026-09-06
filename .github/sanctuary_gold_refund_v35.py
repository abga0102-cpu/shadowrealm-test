from pathlib import Path

BUILD_OLD = "2026.09.06.34"
BUILD_NEW = "2026.09.06.35"

g1p=Path('game-1.js'); g2p=Path('game-2.js'); idxp=Path('index.html')
g1=g1p.read_text(); g2=g2p.read_text(); idx=idxp.read_text()

if 'SANCTUARY_GOLD_REBASE_V35' in g1:
    print('Sanctuary gold refund v35 already applied')
else:
    marker='// GOLD_ECONOMY_REBASE_V32'
    mi=g1.find(marker)
    if mi<0:
        raise SystemExit('v32 migration marker missing')
    ri=g1.find('  return merged;', mi)
    if ri<0:
        raise SystemExit('migration return anchor missing')

    block=r'''  // SANCTUARY_GOLD_REBASE_V35
  // Le fournisseur du Sanctuaire facturait auparavant 250 * niveau² même lorsque
  // plusieurs niveaux consécutifs vendaient exactement la même couleur. Depuis
  // le Drag Merge, les niveaux intermédiaires réduisent au contraire le prix.
  // La sauvegarde mémorise précisément le niveau du fournisseur et sa jauge :
  // on peut donc reconstituer les achats de progression et rembourser la différence.
  if (!Object.prototype.hasOwnProperty.call(s, "sanctuaryGoldRebaseV35")) {
    const st = (merged.sanctuary && typeof merged.sanctuary === "object") ? merged.sanctuary : {};
    const lvl = Math.max(1, Math.min(15, Math.floor(Number(st.supplierLevel) || 1)));
    const progress = Math.max(0, Math.floor(Number(st.supplierProgress) || 0));
    const needV35 = (l) => 5 + Math.floor((Math.max(1,l)-1)/2);
    const oldPriceV35 = (l) => 250 * Math.max(1,l) * Math.max(1,l);
    const unlockV35 = (l) => l >= 13 ? 13 : l >= 9 ? 9 : l >= 5 ? 5 : 1;
    const newPriceV35 = (l) => {
      const u = unlockV35(l);
      const base = 250 * u * u;
      const discount = Math.min(0.30, Math.max(0, l-u) * 0.03);
      return Math.max(25, Math.round((base * (1-discount)) / 25) * 25);
    };
    let oldSpent = 0, fairSpent = 0, purchases = 0;
    for (let l=1; l<lvl && l<15; l++) {
      const n = needV35(l);
      purchases += n;
      oldSpent += n * oldPriceV35(l);
      fairSpent += n * newPriceV35(l);
    }
    // Au niveau courant (<15), supplierProgress correspond aux achats déjà
    // comptabilisés dans la jauge. Au niveau 15 les achats libres ne sont pas
    // enregistrés, donc ils ne sont volontairement pas inventés/remboursés.
    if (lvl < 15) {
      const n = Math.min(progress, needV35(lvl));
      purchases += n;
      oldSpent += n * oldPriceV35(lvl);
      fairSpent += n * newPriceV35(lvl);
    }
    const refundGold = Math.max(0, Math.round(oldSpent - fairSpent));
    merged.gold = Math.max(0, Number(merged.gold) || 0) + refundGold;
    merged.sanctuaryGoldRebaseV35 = true;
    merged.sanctuaryGoldRebaseNoticeV35 = { level:lvl, progress, purchases, oldSpent, fairSpent, refundGold };
  }

'''
    g1=g1[:ri]+block+g1[ri:]

for old,new in [(BUILD_OLD,BUILD_NEW)]:
    g2=g2.replace(old,new)
    idx=idx.replace(old,new)

assert 'SANCTUARY_GOLD_REBASE_V35' in g1
assert 'sanctuaryGoldRebaseV35' in g1
assert 'refundGold' in g1
assert BUILD_NEW in g2 and BUILD_NEW in idx

g1p.write_text(g1); g2p.write_text(g2); idxp.write_text(idx)
print('Sanctuary gold refund v35 applied')
