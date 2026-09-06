from pathlib import Path
import re

BUILD_OLD = "2026.09.06.33"
BUILD_NEW = "2026.09.06.34"

g4p=Path('game-4.js'); g5p=Path('game-5.js'); g2p=Path('game-2.js'); idxp=Path('index.html'); cssp=Path('style.css')
g4=g4p.read_text(); g5=g5p.read_text(); g2=g2p.read_text(); idx=idxp.read_text(); css=cssp.read_text()

# Supplier: keep every unlocked colour purchasable. Intermediate levels now improve prices instead of making the same colour dearer.
old='''function sanctSupplierPrice(level) { return 250*Math.max(1,level)*Math.max(1,level); }\nfunction sanctSupplierNeed(level) { return 5+Math.floor((Math.max(1,level)-1)/2); }'''
new='''const SANCT_SUPPLIER_UNLOCK = {COMMUN:1,PEU_COMMUN:5,RARE:9,EPIQUE:13};\nfunction sanctSupplierUnlocked(level) {\n  return ["COMMUN","PEU_COMMUN","RARE","EPIQUE"].filter((r)=>level>=SANCT_SUPPLIER_UNLOCK[r]);\n}\nfunction sanctSupplierPrice(level,rarity) {\n  const r=rarity||sanctSupplierTier(level), unlock=SANCT_SUPPLIER_UNLOCK[r]||1;\n  const base=250*unlock*unlock;\n  const discount=Math.min(0.30,Math.max(0,Math.max(1,level)-unlock)*0.03);\n  return Math.max(25,Math.round((base*(1-discount))/25)*25);\n}\nfunction sanctSupplierNeed(level) { return 5+Math.floor((Math.max(1,level)-1)/2); }'''
if old not in g4: raise SystemExit('supplier price anchor missing')
g4=g4.replace(old,new,1)

# ScrSanctuaire vars: default price is the best currently unlocked colour.
g4=g4.replace('const lvl=st.supplierLevel, tier=sanctSupplierTier(lvl), price=sanctSupplierPrice(lvl), need=sanctSupplierNeed(lvl);',
              'const lvl=st.supplierLevel, tier=sanctSupplierTier(lvl), price=sanctSupplierPrice(lvl,tier), need=sanctSupplierNeed(lvl), unlockedColors=sanctSupplierUnlocked(lvl);',1)

# Recommendation buys the best tier and explicitly passes it.
g4=g4.replace('else rec={title:"Acheter une couleur "+SANCT_MERGE_NAME[tier],sub:fmt(price)+" Or · prix fixe au niveau "+lvl,act:"sanctMergeBuy",arg:"",cls:"blue"};',
'''else rec={title:"Acheter une couleur "+SANCT_MERGE_NAME[tier],sub:fmt(price)+" Or · meilleure couleur disponible",act:"sanctMergeBuy",arg:tier,cls:"blue"};''',1)

# Board: every slot is a drop target; occupied pieces are pointer-draggable instead of click-to-merge.
old_board='''  const board=st.mergeBoard.map((r,i)=>{\n    if(!r) return '<div class="card center" style="height:72px;padding:7px;border-style:dashed;opacity:.55"><div style="font-size:18px">＋</div><div class="mute" style="font-size:8px">VIDE</div></div>';\n    const selected=st.mergeSelected===i, c=SANCT_MERGE_COLOR[r];\n    return '<div class="card center" data-act="sanctMergeTile" data-arg="'+i+'" style="height:72px;padding:7px;cursor:pointer;border-color:'+(selected?'#FFFFFF':c)+';box-shadow:'+(selected?'0 0 0 2px '+c+',0 0 14px '+c+'88':'none')+'">'+sanctMergeOrb(r,'')+'<div class="b" style="font-size:8.5px;color:'+c+';margin-top:4px">'+SANCT_MERGE_NAME[r].toUpperCase()+'</div></div>';\n  }).join('');'''
new_board='''  const board=st.mergeBoard.map((r,i)=>{\n    if(!r) return '<div class="card center sanctMergeCell sanctMergeEmpty" data-sanct-slot="'+i+'" style="height:72px;padding:7px;border-style:dashed;opacity:.55"><div style="font-size:18px">＋</div><div class="mute" style="font-size:8px">VIDE</div></div>';\n    const c=SANCT_MERGE_COLOR[r];\n    return '<div class="card center sanctMergeCell sanctMergePiece" data-sanct-slot="'+i+'" data-sanct-rarity="'+r+'" style="height:72px;padding:7px;border-color:'+c+'">'+sanctMergeOrb(r,'')+'<div class="b" style="font-size:8.5px;color:'+c+';margin-top:4px">'+SANCT_MERGE_NAME[r].toUpperCase()+'</div></div>';\n  }).join('');'''
if old_board not in g4: raise SystemExit('board anchor missing')
g4=g4.replace(old_board,new_board,1)

# Supplier card: unlocked-colour shop. Only buying the current best colour advances the supplier gauge.
pattern=re.compile(r'''    '<div class=\\"card frame mt8\\"><div class=\\"between\\"><div><div class=\\"tiny b\\" style=\\"color:#8FEFF4\\">APPROVISIONNEMENT</div><div class=\\"bb gt mt3\\">Niveau '\+lvl\+' / '\+SANCT_SUPPLIER_MAX\+'</div></div>'\+sanctMergeOrb\(tier,''\)\+'</div><div class=\\"between mt8\\"><div><div class=\\"b small\\">Couleur achetée : <span style=\\"color:'\+SANCT_MERGE_COLOR\[tier\]\+'\\">'\+SANCT_MERGE_NAME\[tier\]\+'</span></div><div class=\\"mute tiny\\">Chaque achat coûte exactement '\+fmt\(price\)\+' Or à ce niveau.</div></div>'\+btn\('Acheter',\{small:true,cls:'blue',act:'sanctMergeBuy',dis:boardFull\|\|S.gold<price,primary:!pair&&!readyRecipes.length,style:'width:auto'\}\)\+'</div>'\+\n      \(maxed\?'<div class=\\"mt8\\"><span class=\\"pill\\" style=\\"color:var\(--goldLit\);border-color:var\(--goldDim\)\\">NIVEAU MAX · Épique acheté directement</span></div>':'<div class=\\"between tiny b mt8\\"><span class=\\"mute\\">JAUGE · '\+st.supplierProgress\+' / '\+need\+'</span><span style=\\"color:var\(--goldLit\)\\">Niv.'\+\(lvl\+1\)\+'</span></div>'\+bar\(st.supplierProgress/need\*100,'#E8B44A',6\)\)\+\n    '</div>'\+''')
match=pattern.search(g4)
if not match: raise SystemExit('supplier ui anchor missing')
replacement='''    '<div class="card frame mt8"><div class="between"><div><div class="tiny b" style="color:#8FEFF4">APPROVISIONNEMENT</div><div class="bb gt mt3">Niveau '+lvl+' / '+SANCT_SUPPLIER_MAX+'</div></div>'+sanctMergeOrb(tier,'')+'</div>'+\n    '<div class="mute tiny mt6">Toute couleur débloquée reste disponible. Les niveaux intermédiaires réduisent progressivement leur prix.</div>'+\n    '<div class="sanctSupplierShop mt8">'+unlockedColors.map((r)=>{ const p=sanctSupplierPrice(lvl,r), best=r===tier; return '<div class="sanctSupplierItem" style="border-color:'+SANCT_MERGE_COLOR[r]+'66">'+sanctMergeOrb(r,'')+'<div class="flex1"><div class="b tiny" style="color:'+SANCT_MERGE_COLOR[r]+'">'+SANCT_MERGE_NAME[r]+'</div><div class="mute" style="font-size:8px">'+fmt(p)+' Or'+(best&&!maxed?' · jauge':'')+'</div></div>'+btn('Acheter',{small:true,cls:best?'blue':'ghost',act:'sanctMergeBuy',arg:r,dis:boardFull||S.gold<p,primary:best&&!pair&&!readyRecipes.length,style:'width:auto;padding:5px 8px;font-size:9.5px'})+'</div>'; }).join('')+'</div>'+\n      (maxed?'<div class="mt8"><span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">NIVEAU MAX · Commun à Épique disponibles</span></div>':'<div class="between tiny b mt8"><span class="mute">JAUGE · '+st.supplierProgress+' / '+need+' · achats '+SANCT_MERGE_NAME[tier]+'</span><span style="color:var(--goldLit)">Niv.'+(lvl+1)+'</span></div>'+bar(st.supplierProgress/need*100,'#E8B44A',6))+\n    '</div>'+'''
g4=g4[:match.start()]+replacement+g4[match.end():]

# Merge instruction: drag, not tapping.
g4=g4.replace('<div class="notice tiny"><b>Fusion manuelle :</b> touche une couleur, puis une deuxième couleur identique. Deux pièces identiques deviennent la rareté supérieure. Les pièces Divines sont au sommet de la chaîne.</div>',
'''<div class="notice tiny"><b>Fusion par glisser-déposer :</b> fais glisser une pièce sur une pièce identique pour les fusionner. Glisse-la sur une case vide pour la déplacer. Une pièce différente refuse la fusion.</div>''',1)

# ACT buy: selected unlocked rarity, only best tier advances progression.
old_buy='''  sanctMergeBuy: () => {\n    const st=sanctMergeState(), empty=st.mergeBoard.findIndex((x)=>!x);\n    if(empty<0) return toast("Plateau plein · fusionne ou fabrique d’abord");\n    const lv=st.supplierLevel, price=sanctSupplierPrice(lv);\n    if(S.gold<price) return toast("Pas assez d’Or");\n    S.gold-=price; st.mergeBoard[empty]=sanctSupplierTier(lv);\n    if(lv<SANCT_SUPPLIER_MAX){\n      st.supplierProgress++;\n      const need=sanctSupplierNeed(lv);\n      if(st.supplierProgress>=need){ st.supplierLevel=lv+1; st.supplierProgress=0; toast("Approvisionnement niveau "+st.supplierLevel,true); }\n    }\n    dirty=true; render();\n  },'''
new_buy='''  sanctMergeBuy: (a) => {\n    const st=sanctMergeState(), empty=st.mergeBoard.findIndex((x)=>!x);\n    if(empty<0) return toast("Plateau plein · fusionne ou fabrique d’abord");\n    const lv=st.supplierLevel, unlocked=sanctSupplierUnlocked(lv);\n    const chosen=unlocked.includes(a)?a:sanctSupplierTier(lv), price=sanctSupplierPrice(lv,chosen);\n    if(S.gold<price) return toast("Pas assez d’Or");\n    S.gold-=price; st.mergeBoard[empty]=chosen;\n    if(lv<SANCT_SUPPLIER_MAX && chosen===sanctSupplierTier(lv)){\n      st.supplierProgress++;\n      const need=sanctSupplierNeed(lv);\n      if(st.supplierProgress>=need){ st.supplierLevel=lv+1; st.supplierProgress=0; toast("Approvisionnement niveau "+st.supplierLevel,true); }\n    }\n    dirty=true; render();\n  },'''
if old_buy not in g5: raise SystemExit('buy action anchor missing')
g5=g5.replace(old_buy,new_buy,1)

# Drag/drop merge engine before ACT. Tap action remains in code only as a legacy/accessibility fallback, but board no longer invokes it.
act_anchor='const ACT = {'
if act_anchor not in g5: raise SystemExit('ACT anchor missing')
drag_engine='''// SANCTUARY_DRAG_MERGE_V34\nfunction sanctMergeDrop(from,to){\n  const st=sanctMergeState(); from=Number(from); to=Number(to);\n  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=st.mergeBoard.length||to>=st.mergeBoard.length||from===to) return false;\n  const src=st.mergeBoard[from], dst=st.mergeBoard[to];\n  if(!src) return false;\n  if(!dst){ st.mergeBoard[to]=src; st.mergeBoard[from]=null; st.mergeSelected=-1; dirty=true; render(); return true; }\n  if(dst!==src){ toast("Deux couleurs identiques sont nécessaires"); return false; }\n  const nx=sanctMergeNext(src);\n  if(!nx){ toast("Divin est la rareté maximale"); return false; }\n  st.mergeBoard[from]=null; st.mergeBoard[to]=nx; st.mergeSelected=-1; st.mergeFusions++; st.fusions=(st.fusions||0)+1;\n  sanctMergeDiscover(st,nx); dirty=true;\n  if(navigator.vibrate) try{ navigator.vibrate(20); }catch(e){}\n  toast(SANCT_MERGE_NAME[src]+" + "+SANCT_MERGE_NAME[src]+" → "+SANCT_MERGE_NAME[nx],true); render(); return true;\n}\n\n'''
g5=g5.replace(act_anchor,drag_engine+act_anchor,1)

# Pointer Events: works on iOS/Android/desktop and follows the finger with a ghost.
listener_anchor='// Native <details> state would otherwise be lost whenever the Home screen is'
if listener_anchor not in g5: raise SystemExit('listener anchor missing')
drag_listeners='''// Real merge-game interaction: drag a piece over an identical one, or onto an empty slot.\n(function initSanctuaryDragV34(){\n  const app=document.getElementById("app"); if(!app) return;\n  let d=null;\n  const clearTarget=()=>{ if(d&&d.target) d.target.classList.remove("sanctDropTarget","sanctMergeTarget","sanctRejectTarget"); };\n  const cleanup=()=>{ if(!d)return; clearTarget(); if(d.source)d.source.classList.remove("sanctDragging"); if(d.ghost&&d.ghost.parentNode)d.ghost.remove(); d=null; };\n  const moveGhost=(x,y)=>{ if(d&&d.ghost){ d.ghost.style.left=x+"px"; d.ghost.style.top=y+"px"; } };\n  app.addEventListener("pointerdown",(e)=>{\n    const piece=e.target.closest&&e.target.closest(".sanctMergePiece[data-sanct-slot]"); if(!piece)return;\n    d={id:e.pointerId,from:Number(piece.dataset.sanctSlot),rarity:piece.dataset.sanctRarity,source:piece,startX:e.clientX,startY:e.clientY,dragging:false,ghost:null,target:null};\n    try{piece.setPointerCapture(e.pointerId);}catch(_e){}\n  },true);\n  app.addEventListener("pointermove",(e)=>{\n    if(!d||e.pointerId!==d.id)return;\n    const dist=Math.hypot(e.clientX-d.startX,e.clientY-d.startY);\n    if(!d.dragging&&dist<7)return;\n    if(!d.dragging){\n      d.dragging=true; d.source.classList.add("sanctDragging");\n      d.ghost=d.source.cloneNode(true); d.ghost.classList.add("sanctDragGhost"); d.ghost.removeAttribute("data-sanct-slot"); document.body.appendChild(d.ghost);\n    }\n    e.preventDefault(); moveGhost(e.clientX,e.clientY); clearTarget();\n    const under=document.elementFromPoint(e.clientX,e.clientY); const target=under&&under.closest?under.closest("[data-sanct-slot]"):null;\n    if(!target||Number(target.dataset.sanctSlot)===d.from){ d.target=null; return; }\n    d.target=target; target.classList.add("sanctDropTarget");\n    const tr=target.dataset.sanctRarity||"";\n    if(!tr||tr===d.rarity) target.classList.add("sanctMergeTarget"); else target.classList.add("sanctRejectTarget");\n  },{capture:true,passive:false});\n  const end=(e)=>{\n    if(!d||e.pointerId!==d.id)return;\n    if(d.dragging){ e.preventDefault(); const to=d.target?Number(d.target.dataset.sanctSlot):-1; if(to>=0) sanctMergeDrop(d.from,to); }\n    cleanup();\n  };\n  app.addEventListener("pointerup",end,{capture:true,passive:false});\n  app.addEventListener("pointercancel",cleanup,true);\n})();\n\n'''
g5=g5.replace(listener_anchor,drag_listeners+listener_anchor,1)

# Styling for mobile touch + drag feedback + compact unlocked-colour shop.
css_add='''\n/* SANCTUARY_DRAG_MERGE_V34 */\n.sanctSupplierShop{display:grid;grid-template-columns:1fr;gap:6px}\n.sanctSupplierItem{display:flex;align-items:center;gap:8px;padding:6px 7px;border:1px solid var(--border);border-radius:10px;background:#0b1322aa}\n.sanctSupplierItem .sanctOrb{flex:0 0 auto}\n.sanctMergeCell{transition:transform .12s,border-color .12s,box-shadow .12s,opacity .12s}\n.sanctMergePiece{touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}\n.sanctMergePiece:active{cursor:grabbing}\n.sanctMergePiece.sanctDragging{opacity:.28;transform:scale(.94)}\n.sanctMergeCell.sanctDropTarget{outline:2px solid #8FC4FF;outline-offset:1px}\n.sanctMergeCell.sanctMergeTarget{transform:scale(1.05);box-shadow:0 0 0 2px #84E891,0 0 18px #3FB95088!important}\n.sanctMergeCell.sanctRejectTarget{box-shadow:0 0 0 2px #FF868A,0 0 14px #E5484D66!important}\n.sanctDragGhost{position:fixed!important;z-index:10000!important;width:72px!important;height:72px!important;pointer-events:none!important;transform:translate(-50%,-50%) scale(1.08)!important;opacity:.92!important;box-shadow:0 8px 28px #000c!important}\n'''
if 'SANCTUARY_DRAG_MERGE_V34' not in css: css += css_add

# Build bump from currently-live v33.
for oldbuild in [BUILD_OLD]:
  g2=g2.replace(oldbuild,BUILD_NEW)
  idx=idx.replace(oldbuild,BUILD_NEW)
idx=idx.replace('<!-- Conseils Ponctuels · build '+BUILD_NEW+' -->','<!-- Sanctuaire Drag Merge · build '+BUILD_NEW+' -->')

# Regression guards.
assert 'SANCT_SUPPLIER_UNLOCK' in g4 and 'sanctSupplierUnlocked' in g4
assert 'Toute couleur débloquée reste disponible' in g4
assert 'data-sanct-slot' in g4 and 'sanctMergePiece' in g4
assert 'Fusion par glisser-déposer' in g4
assert 'SANCTUARY_DRAG_MERGE_V34' in g5 and 'function sanctMergeDrop' in g5
assert 'pointerdown' in g5 and 'pointermove' in g5 and 'pointerup' in g5
assert 'chosen===sanctSupplierTier(lv)' in g5
assert 'SANCTUARY_DRAG_MERGE_V34' in css
assert BUILD_NEW in g2 and BUILD_NEW in idx

g4p.write_text(g4); g5p.write_text(g5); g2p.write_text(g2); idxp.write_text(idx); cssp.write_text(css)
print('Sanctuary drag v34 applied')
