from pathlib import Path

OLD_BUILD='2026.09.06.33'
NEW_BUILD='2026.09.06.34'

g4p=Path('game-4.js'); g5p=Path('game-5.js'); g2p=Path('game-2.js'); idxp=Path('index.html'); cssp=Path('style.css')
g4=g4p.read_text(); g5=g5p.read_text(); g2=g2p.read_text(); idx=idxp.read_text(); css=cssp.read_text()

# 1) Fournisseur: les couleurs débloquées restent disponibles et les niveaux intermédiaires deviennent des réductions de prix.
old='function sanctSupplierPrice(level) { return 250*Math.max(1,level)*Math.max(1,level); }\nfunction sanctSupplierNeed(level) { return 5+Math.floor((Math.max(1,level)-1)/2); }'
new='''const SANCT_SUPPLIER_UNLOCK = {COMMUN:1,PEU_COMMUN:5,RARE:9,EPIQUE:13};
function sanctSupplierUnlocked(level) {
  return ["COMMUN","PEU_COMMUN","RARE","EPIQUE"].filter((r)=>level>=SANCT_SUPPLIER_UNLOCK[r]);
}
function sanctSupplierPrice(level,rarity) {
  const r=rarity||sanctSupplierTier(level), unlock=SANCT_SUPPLIER_UNLOCK[r]||1;
  const base=250*unlock*unlock;
  const discount=Math.min(0.30,Math.max(0,Math.max(1,level)-unlock)*0.03);
  return Math.max(25,Math.round((base*(1-discount))/25)*25);
}
function sanctSupplierNeed(level) { return 5+Math.floor((Math.max(1,level)-1)/2); }'''
if old not in g4: raise SystemExit('supplier price anchor missing')
g4=g4.replace(old,new,1)

old='const lvl=st.supplierLevel, tier=sanctSupplierTier(lvl), price=sanctSupplierPrice(lvl), need=sanctSupplierNeed(lvl);'
new='const lvl=st.supplierLevel, tier=sanctSupplierTier(lvl), price=sanctSupplierPrice(lvl,tier), need=sanctSupplierNeed(lvl), unlockedColors=sanctSupplierUnlocked(lvl);'
if old not in g4: raise SystemExit('sanct vars anchor missing')
g4=g4.replace(old,new,1)

old='else rec={title:"Acheter une couleur "+SANCT_MERGE_NAME[tier],sub:fmt(price)+" Or · prix fixe au niveau "+lvl,act:"sanctMergeBuy",arg:"",cls:"blue"};'
new='else rec={title:"Acheter une couleur "+SANCT_MERGE_NAME[tier],sub:fmt(price)+" Or · meilleure couleur disponible",act:"sanctMergeBuy",arg:tier,cls:"blue"};'
if old not in g4: raise SystemExit('recommendation anchor missing')
g4=g4.replace(old,new,1)

# Plateau: chaque case devient une vraie zone de drop, sans clic nécessaire pour fusionner.
old='''  const board=st.mergeBoard.map((r,i)=>{
    if(!r) return '<div class="card center" style="height:72px;padding:7px;border-style:dashed;opacity:.55"><div style="font-size:18px">＋</div><div class="mute" style="font-size:8px">VIDE</div></div>';
    const selected=st.mergeSelected===i, c=SANCT_MERGE_COLOR[r];
    return '<div class="card center" data-act="sanctMergeTile" data-arg="'+i+'" style="height:72px;padding:7px;cursor:pointer;border-color:'+(selected?'#FFFFFF':c)+';box-shadow:'+(selected?'0 0 0 2px '+c+',0 0 14px '+c+'88':'none')+'">'+sanctMergeOrb(r,'')+'<div class="b" style="font-size:8.5px;color:'+c+';margin-top:4px">'+SANCT_MERGE_NAME[r].toUpperCase()+'</div></div>';
  }).join('');'''
new='''  const board=st.mergeBoard.map((r,i)=>{
    if(!r) return '<div class="card center sanctMergeCell sanctMergeEmpty" data-sanct-slot="'+i+'" style="height:72px;padding:7px;border-style:dashed;opacity:.55"><div style="font-size:18px">＋</div><div class="mute" style="font-size:8px">VIDE</div></div>';
    const c=SANCT_MERGE_COLOR[r];
    return '<div class="card center sanctMergeCell sanctMergePiece" data-sanct-slot="'+i+'" data-sanct-rarity="'+r+'" style="height:72px;padding:7px;border-color:'+c+'">'+sanctMergeOrb(r,'')+'<div class="b" style="font-size:8.5px;color:'+c+';margin-top:4px">'+SANCT_MERGE_NAME[r].toUpperCase()+'</div></div>';
  }).join('');'''
if old not in g4: raise SystemExit('board anchor missing')
g4=g4.replace(old,new,1)

# Remplace uniquement la carte d'approvisionnement, délimitée par la section Plateau.
start='    \'<div class="card frame mt8"><div class="between"><div><div class="tiny b" style="color:#8FEFF4">APPROVISIONNEMENT</div>'
end='    \'<div class="sect">Plateau de Merge <span class="mute tiny">· \'+'
si=g4.find(start)
ei=g4.find(end,si)
if si<0 or ei<0: raise SystemExit('supplier ui delimiters missing')
shop='''    '<div class="card frame mt8"><div class="between"><div><div class="tiny b" style="color:#8FEFF4">APPROVISIONNEMENT</div><div class="bb gt mt3">Niveau '+lvl+' / '+SANCT_SUPPLIER_MAX+'</div></div>'+sanctMergeOrb(tier,'')+'</div>'+\n    '<div class="mute tiny mt6">Toute couleur débloquée reste disponible. Les niveaux intermédiaires réduisent progressivement leur prix.</div>'+\n    '<div class="sanctSupplierShop mt8">'+unlockedColors.map((r)=>{ const p=sanctSupplierPrice(lvl,r), best=r===tier; return '<div class="sanctSupplierItem" style="border-color:'+SANCT_MERGE_COLOR[r]+'66">'+sanctMergeOrb(r,'')+'<div class="flex1"><div class="b tiny" style="color:'+SANCT_MERGE_COLOR[r]+'">'+SANCT_MERGE_NAME[r]+'</div><div class="mute" style="font-size:8px">'+fmt(p)+' Or'+(best&&!maxed?' · jauge':'')+'</div></div>'+btn('Acheter',{small:true,cls:best?'blue':'ghost',act:'sanctMergeBuy',arg:r,dis:boardFull||S.gold<p,primary:best&&!pair&&!readyRecipes.length,style:'width:auto;padding:5px 8px;font-size:9.5px'})+'</div>'; }).join('')+'</div>'+\n      (maxed?'<div class="mt8"><span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">NIVEAU MAX · Commun à Épique disponibles</span></div>':'<div class="between tiny b mt8"><span class="mute">JAUGE · '+st.supplierProgress+' / '+need+' · achats '+SANCT_MERGE_NAME[tier]+'</span><span style="color:var(--goldLit)">Niv.'+(lvl+1)+'</span></div>'+bar(st.supplierProgress/need*100,'#E8B44A',6))+\n    '</div>'+\n'''
g4=g4[:si]+shop+g4[ei:]

old='<div class="notice tiny"><b>Fusion manuelle :</b> touche une couleur, puis une deuxième couleur identique. Deux pièces identiques deviennent la rareté supérieure. Les pièces Divines sont au sommet de la chaîne.</div>'
new='<div class="notice tiny"><b>Fusion par glisser-déposer :</b> fais glisser une pièce sur une pièce identique pour les fusionner. Glisse-la sur une case vide pour la déplacer. Une pièce différente refuse la fusion.</div>'
if old not in g4: raise SystemExit('merge notice anchor missing')
g4=g4.replace(old,new,1)

# 2) Achat: toutes les couleurs débloquées sont valides, seule la meilleure fait avancer la jauge.
old='''  sanctMergeBuy: () => {
    const st=sanctMergeState(), empty=st.mergeBoard.findIndex((x)=>!x);
    if(empty<0) return toast("Plateau plein · fusionne ou fabrique d’abord");
    const lv=st.supplierLevel, price=sanctSupplierPrice(lv);
    if(S.gold<price) return toast("Pas assez d’Or");
    S.gold-=price; st.mergeBoard[empty]=sanctSupplierTier(lv);
    if(lv<SANCT_SUPPLIER_MAX){
      st.supplierProgress++;
      const need=sanctSupplierNeed(lv);
      if(st.supplierProgress>=need){ st.supplierLevel=lv+1; st.supplierProgress=0; toast("Approvisionnement niveau "+st.supplierLevel,true); }
    }
    dirty=true; render();
  },'''
new='''  sanctMergeBuy: (a) => {
    const st=sanctMergeState(), empty=st.mergeBoard.findIndex((x)=>!x);
    if(empty<0) return toast("Plateau plein · fusionne ou fabrique d’abord");
    const lv=st.supplierLevel, unlocked=sanctSupplierUnlocked(lv);
    const chosen=unlocked.includes(a)?a:sanctSupplierTier(lv), price=sanctSupplierPrice(lv,chosen);
    if(S.gold<price) return toast("Pas assez d’Or");
    S.gold-=price; st.mergeBoard[empty]=chosen;
    if(lv<SANCT_SUPPLIER_MAX && chosen===sanctSupplierTier(lv)){
      st.supplierProgress++;
      const need=sanctSupplierNeed(lv);
      if(st.supplierProgress>=need){ st.supplierLevel=lv+1; st.supplierProgress=0; toast("Approvisionnement niveau "+st.supplierLevel,true); }
    }
    dirty=true; render();
  },'''
if old not in g5: raise SystemExit('buy action anchor missing')
g5=g5.replace(old,new,1)

# 3) Moteur de drop: case vide = déplacement, même couleur = fusion, autre couleur = refus.
anchor='const ACT = {'
if anchor not in g5: raise SystemExit('ACT anchor missing')
engine='''// SANCTUARY_DRAG_MERGE_V34
function sanctMergeDrop(from,to){
  const st=sanctMergeState(); from=Number(from); to=Number(to);
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=st.mergeBoard.length||to>=st.mergeBoard.length||from===to) return false;
  const src=st.mergeBoard[from], dst=st.mergeBoard[to];
  if(!src) return false;
  if(!dst){ st.mergeBoard[to]=src; st.mergeBoard[from]=null; st.mergeSelected=-1; dirty=true; render(); return true; }
  if(dst!==src){ toast("Deux couleurs identiques sont nécessaires"); return false; }
  const nx=sanctMergeNext(src);
  if(!nx){ toast("Divin est la rareté maximale"); return false; }
  st.mergeBoard[from]=null; st.mergeBoard[to]=nx; st.mergeSelected=-1; st.mergeFusions++; st.fusions=(st.fusions||0)+1;
  sanctMergeDiscover(st,nx); dirty=true;
  if(navigator.vibrate) try{navigator.vibrate(20);}catch(_e){}
  toast(SANCT_MERGE_NAME[src]+" + "+SANCT_MERGE_NAME[src]+" → "+SANCT_MERGE_NAME[nx],true); render(); return true;
}

'''
g5=g5.replace(anchor,engine+anchor,1)

# 4) Pointer Events, y compris iOS/Android. Le clone suit le doigt et les cases valides s'allument.
anchor='// Native <details> state would otherwise be lost whenever the Home screen is'
if anchor not in g5: raise SystemExit('listener anchor missing')
listeners='''// Drag tactile/souris du Sanctuaire.
(function initSanctuaryDragV34(){
  const app=document.getElementById("app"); if(!app)return;
  let d=null;
  const clearTarget=()=>{if(d&&d.target)d.target.classList.remove("sanctDropTarget","sanctMergeTarget","sanctRejectTarget");};
  const cleanup=()=>{if(!d)return;clearTarget();if(d.source)d.source.classList.remove("sanctDragging");if(d.ghost&&d.ghost.parentNode)d.ghost.remove();d=null;};
  app.addEventListener("pointerdown",(e)=>{
    const piece=e.target.closest&&e.target.closest(".sanctMergePiece[data-sanct-slot]"); if(!piece)return;
    d={id:e.pointerId,from:Number(piece.dataset.sanctSlot),rarity:piece.dataset.sanctRarity,source:piece,startX:e.clientX,startY:e.clientY,dragging:false,ghost:null,target:null};
    try{piece.setPointerCapture(e.pointerId);}catch(_e){}
  },true);
  app.addEventListener("pointermove",(e)=>{
    if(!d||e.pointerId!==d.id)return;
    if(!d.dragging&&Math.hypot(e.clientX-d.startX,e.clientY-d.startY)<7)return;
    if(!d.dragging){d.dragging=true;d.source.classList.add("sanctDragging");d.ghost=d.source.cloneNode(true);d.ghost.classList.add("sanctDragGhost");d.ghost.removeAttribute("data-sanct-slot");document.body.appendChild(d.ghost);}
    e.preventDefault(); d.ghost.style.left=e.clientX+"px"; d.ghost.style.top=e.clientY+"px"; clearTarget();
    const under=document.elementFromPoint(e.clientX,e.clientY), target=under&&under.closest?under.closest("[data-sanct-slot]"):null;
    if(!target||Number(target.dataset.sanctSlot)===d.from){d.target=null;return;}
    d.target=target; target.classList.add("sanctDropTarget");
    const tr=target.dataset.sanctRarity||"";
    target.classList.add(!tr||tr===d.rarity?"sanctMergeTarget":"sanctRejectTarget");
  },{capture:true,passive:false});
  const end=(e)=>{if(!d||e.pointerId!==d.id)return;if(d.dragging){e.preventDefault();const to=d.target?Number(d.target.dataset.sanctSlot):-1;if(to>=0)sanctMergeDrop(d.from,to);}cleanup();};
  app.addEventListener("pointerup",end,{capture:true,passive:false});
  app.addEventListener("pointercancel",cleanup,true);
})();

'''
g5=g5.replace(anchor,listeners+anchor,1)

# 5) Feedback visuel et ergonomie tactile.
if 'SANCTUARY_DRAG_MERGE_V34' not in css:
  css += '''
/* SANCTUARY_DRAG_MERGE_V34 */
.sanctSupplierShop{display:grid;grid-template-columns:1fr;gap:6px}
.sanctSupplierItem{display:flex;align-items:center;gap:8px;padding:6px 7px;border:1px solid var(--border);border-radius:10px;background:#0b1322aa}
.sanctMergeCell{transition:transform .12s,border-color .12s,box-shadow .12s,opacity .12s}
.sanctMergePiece{touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}
.sanctMergePiece:active{cursor:grabbing}
.sanctMergePiece.sanctDragging{opacity:.28;transform:scale(.94)}
.sanctMergeCell.sanctDropTarget{outline:2px solid #8FC4FF;outline-offset:1px}
.sanctMergeCell.sanctMergeTarget{transform:scale(1.05);box-shadow:0 0 0 2px #84E891,0 0 18px #3FB95088!important}
.sanctMergeCell.sanctRejectTarget{box-shadow:0 0 0 2px #FF868A,0 0 14px #E5484D66!important}
.sanctDragGhost{position:fixed!important;z-index:10000!important;width:72px!important;height:72px!important;pointer-events:none!important;transform:translate(-50%,-50%) scale(1.08)!important;opacity:.92!important;box-shadow:0 8px 28px #000c!important}
'''

# Build/cache busting.
g2=g2.replace(OLD_BUILD,NEW_BUILD)
idx=idx.replace(OLD_BUILD,NEW_BUILD)
idx=idx.replace('<!-- Conseils Ponctuels · build '+NEW_BUILD+' -->','<!-- Sanctuaire Drag Merge · build '+NEW_BUILD+' -->')

# Gardes.
assert 'SANCT_SUPPLIER_UNLOCK' in g4 and 'Toute couleur débloquée reste disponible' in g4
assert 'Fusion par glisser-déposer' in g4 and 'sanctMergePiece' in g4 and 'data-sanct-slot' in g4
assert 'SANCTUARY_DRAG_MERGE_V34' in g5 and 'function sanctMergeDrop' in g5
assert all(x in g5 for x in ['pointerdown','pointermove','pointerup'])
assert 'chosen===sanctSupplierTier(lv)' in g5
assert 'SANCTUARY_DRAG_MERGE_V34' in css
assert NEW_BUILD in g2 and NEW_BUILD in idx

g4p.write_text(g4); g5p.write_text(g5); g2p.write_text(g2); idxp.write_text(idx); cssp.write_text(css)
print('Sanctuary drag v34 applied')
