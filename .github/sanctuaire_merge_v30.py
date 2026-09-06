from pathlib import Path

BUILD_OLD='2026.09.06.29'
BUILD_NEW='2026.09.06.30'

ui=Path('game-4.js')
s=ui.read_text()
start='/* ---------------- SANCTUAIRE ---------------- */\n'
end='\n/* ---------------- ARBRE ---------------- */'
if start not in s or end not in s:
    raise SystemExit('sanctuary screen anchors missing')
a=s.index(start)
b=s.index(end,a)
new=r'''/* ---------------- SANCTUAIRE ---------------- */
/* V30 — le Sanctuaire devient un vrai mini-jeu de merge.
   Les anciennes ressources Minerai / Éclat / Essence / Poussière ne sont plus
   consommées ici : elles continuent d'exister dans leurs systèmes d'origine. */
const SANCT_MERGE_ORDER = ["COMMUN","PEU_COMMUN","RARE","EPIQUE","MYTHIQUE","LEGENDAIRE","DIVIN"];
const SANCT_MERGE_COLOR = {
  COMMUN:"#9FB0C8", PEU_COMMUN:"#57C785", RARE:"#3FA7FF", EPIQUE:"#B15CF6",
  MYTHIQUE:"#FF7A3D", LEGENDAIRE:"#F5C542", DIVIN:"#FFB52E"
};
const SANCT_MERGE_NAME = {
  COMMUN:"Commun", PEU_COMMUN:"Peu commun", RARE:"Rare", EPIQUE:"Épique",
  MYTHIQUE:"Mythique", LEGENDAIRE:"Légendaire", DIVIN:"Divin"
};
const SANCT_SUPPLIER_MAX = 15;
const SANCT_BOARD_SIZE = 16;
const SANCT_MERGE_RECIPES = [
  {id:"impulsion",name:"Impulsion",req:{RARE:2},kind:"accel",mins:5,qty:1,secret:false},
  {id:"distorsion",name:"Distorsion",req:{RARE:1,EPIQUE:1},kind:"accel",mins:15,qty:1,secret:false},
  {id:"ancrage",name:"Ancrage",req:{EPIQUE:2},kind:"seal",qty:1,secret:false},
  {id:"chrono_sceau",name:"Chrono-Sceau",req:{EPIQUE:1,MYTHIQUE:1},kind:"accel",mins:30,qty:1,secret:true,unlock:"MYTHIQUE"},
  {id:"grand_ancrage",name:"Grand Ancrage",req:{MYTHIQUE:2},kind:"seal",qty:3,secret:true,unlock:"MYTHIQUE"},
  {id:"rupture",name:"Rupture temporelle",req:{MYTHIQUE:1,LEGENDAIRE:1},kind:"accel",mins:60,qty:2,secret:true,unlock:"LEGENDAIRE"},
  {id:"sceau_divin",name:"Sceau divin",req:{DIVIN:1},kind:"seal",qty:8,secret:true,unlock:"DIVIN"},
];
function sanctMergeState() {
  if (!S.sanctuary) S.sanctuary={slotA:null,slotB:null,discovered:{},fusions:0,stabilitySeals:0};
  const st=S.sanctuary;
  if (!Array.isArray(st.mergeBoard)) st.mergeBoard=Array(SANCT_BOARD_SIZE).fill(null);
  if (st.mergeBoard.length<SANCT_BOARD_SIZE) while(st.mergeBoard.length<SANCT_BOARD_SIZE) st.mergeBoard.push(null);
  if (st.mergeBoard.length>SANCT_BOARD_SIZE) st.mergeBoard=st.mergeBoard.slice(0,SANCT_BOARD_SIZE);
  if (!Number.isFinite(st.supplierLevel)) st.supplierLevel=1;
  st.supplierLevel=Math.max(1,Math.min(SANCT_SUPPLIER_MAX,Math.floor(st.supplierLevel)));
  if (!Number.isFinite(st.supplierProgress)) st.supplierProgress=0;
  if (!st.mergeDiscovered || typeof st.mergeDiscovered!=="object") st.mergeDiscovered={};
  if (!Number.isFinite(st.mergeCrafts)) st.mergeCrafts=0;
  if (!Number.isFinite(st.mergeFusions)) st.mergeFusions=0;
  if (!Number.isFinite(st.mergeSelected)) st.mergeSelected=-1;
  if (st.mergeFocusRecipe==null) st.mergeFocusRecipe="";
  return st;
}
function sanctSupplierTier(level) {
  if(level>=13) return "EPIQUE";
  if(level>=9) return "RARE";
  if(level>=5) return "PEU_COMMUN";
  return "COMMUN";
}
function sanctSupplierPrice(level) { return 2500*Math.max(1,level)*Math.max(1,level); }
function sanctSupplierNeed(level) { return 5+Math.floor((Math.max(1,level)-1)/2); }
function sanctMergeNext(r) { const i=SANCT_MERGE_ORDER.indexOf(r); return i>=0&&i<SANCT_MERGE_ORDER.length-1?SANCT_MERGE_ORDER[i+1]:null; }
function sanctMergeCount(st,r) { return st.mergeBoard.reduce((n,x)=>n+(x===r?1:0),0); }
function sanctMergeReqText(req) { return Object.keys(req).map((r)=>req[r]+"× "+SANCT_MERGE_NAME[r]).join(" + "); }
function sanctMergeRecipeKnown(st,r) { return !r.secret || !!st.mergeDiscovered[r.id]; }
function sanctMergeRecipeReady(st,r) { return Object.keys(r.req).every((k)=>sanctMergeCount(st,k)>=r.req[k]); }
function sanctMergeRecipeMissing(st,r) {
  return Object.keys(r.req).map((k)=>({r:k,n:Math.max(0,r.req[k]-sanctMergeCount(st,k))})).filter((x)=>x.n>0);
}
function sanctMergeRecipeOutput(r) {
  if(r.kind==="seal") return r.qty+"× Sceau"+(r.qty>1?"x":"")+" de stabilité";
  const a=ACCEL_DEFS.find((x)=>x.mins===r.mins) || ACCEL_DEFS.reduce((best,x)=>!best||Math.abs(x.mins-r.mins)<Math.abs(best.mins-r.mins)?x:best,null);
  return r.qty+"× Accél. "+(a?a.label:(r.mins+" min"));
}
function sanctMergePair(st) {
  for(let i=0;i<st.mergeBoard.length;i++){
    const r=st.mergeBoard[i]; if(!r||!sanctMergeNext(r)) continue;
    for(let j=i+1;j<st.mergeBoard.length;j++) if(st.mergeBoard[j]===r) return [i,j,r];
  }
  return null;
}
function sanctMergeDiscover(st,rarity) {
  SANCT_MERGE_RECIPES.forEach((r)=>{
    if(r.secret && r.unlock===rarity) st.mergeDiscovered[r.id]=true;
  });
}
function sanctMergeOrb(r,inner) {
  const c=SANCT_MERGE_COLOR[r]||"#9FB0C8";
  return '<div style="width:42px;height:42px;border-radius:50%;margin:auto;background:radial-gradient(circle at 34% 27%,#fff 0 6%, '+c+' 18%, '+shade(c,-28)+' 72%, #090D16 100%);box-shadow:inset 0 0 0 2px #ffffff33,0 0 13px '+c+'66;display:flex;align-items:center;justify-content:center;color:#08101E;font-weight:950;font-size:10px">'+(inner||"")+'</div>';
}
function scrSanctuaire() {
  const unlocked=sanctuaryUnlocked(S);
  const st=sanctMergeState();
  if(!unlocked) return topbar("Sanctuaire",'<span class="pill">Fusion de couleurs</span>')+
    '<div class="pad mt8"><div class="card frame center" style="padding:18px 12px;border-left-color:#9B5CF6">'+ic("lock",36)+
    '<div class="bb gt mt8" style="font-size:16px">SANCTUAIRE SCELLÉ</div><div class="dim small mt8" style="line-height:1.55">Vaincs ton premier Méga-Boss pour réveiller le Sanctuaire.<br>Tu pourras ensuite acheter des couleurs avec de l’Or et les fusionner manuellement.</div></div></div>';

  const lvl=st.supplierLevel, tier=sanctSupplierTier(lvl), price=sanctSupplierPrice(lvl), need=sanctSupplierNeed(lvl);
  const maxed=lvl>=SANCT_SUPPLIER_MAX;
  const boardFull=st.mergeBoard.every(Boolean);
  const pair=sanctMergePair(st);
  const readyRecipes=SANCT_MERGE_RECIPES.filter((r)=>sanctMergeRecipeKnown(st,r)&&sanctMergeRecipeReady(st,r));
  const focus=SANCT_MERGE_RECIPES.find((r)=>r.id===st.mergeFocusRecipe&&sanctMergeRecipeKnown(st,r)) || readyRecipes[0] || SANCT_MERGE_RECIPES.find((r)=>sanctMergeRecipeKnown(st,r));
  let rec;
  if(readyRecipes.length) rec={title:"Fabriquer "+readyRecipes[0].name,sub:sanctMergeRecipeOutput(readyRecipes[0]),act:"sanctRecipeCraft",arg:readyRecipes[0].id,cls:"green"};
  else if(pair) rec={title:"Fusion disponible",sub:"Deux couleurs "+SANCT_MERGE_NAME[pair[2]]+" peuvent être fusionnées manuellement.",act:"sanctSelectPair",arg:"",cls:"purple"};
  else rec={title:"Acheter une couleur "+SANCT_MERGE_NAME[tier],sub:fmt(price)+" Or · prix fixe au niveau "+lvl,act:"sanctMergeBuy",arg:"",cls:"blue"};

  const board=st.mergeBoard.map((r,i)=>{
    if(!r) return '<div class="card center" style="height:72px;padding:7px;border-style:dashed;opacity:.55"><div style="font-size:18px">＋</div><div class="mute" style="font-size:8px">VIDE</div></div>';
    const selected=st.mergeSelected===i, c=SANCT_MERGE_COLOR[r];
    return '<div class="card center" data-act="sanctMergeTile" data-arg="'+i+'" style="height:72px;padding:7px;cursor:pointer;border-color:'+(selected?'#FFFFFF':c)+';box-shadow:'+(selected?'0 0 0 2px '+c+',0 0 14px '+c+'88':'none')+'">'+sanctMergeOrb(r,'')+'<div class="b" style="font-size:8.5px;color:'+c+';margin-top:4px">'+SANCT_MERGE_NAME[r].toUpperCase()+'</div></div>';
  }).join('');

  const recipes=SANCT_MERGE_RECIPES.map((r)=>{
    const known=sanctMergeRecipeKnown(st,r);
    if(!known) return '<div class="card mt6" style="padding:9px;opacity:.72"><div class="between"><div><div class="b small">❓ Recette secrète</div><div class="mute tiny">Crée une couleur supérieure pour révéler ce rituel.</div></div><span class="pill">???</span></div></div>';
    const ok=sanctMergeRecipeReady(st,r), missing=sanctMergeRecipeMissing(st,r), active=focus&&focus.id===r.id;
    return '<div class="card mt6" style="padding:9px;border-color:'+(active?'#9B5CF6':ok?'#3FB95055':'var(--line)')+'"><div class="between gap8"><div class="flex1"><div class="row gap4"><span class="b small">'+esc(r.name)+'</span>'+(ok?'<span class="pill" style="color:var(--greenLit);border-color:#3FB950">PRÊT</span>':'')+'</div><div class="mute tiny mt3">'+esc(sanctMergeReqText(r.req))+' → '+esc(sanctMergeRecipeOutput(r))+'</div>'+(missing.length?'<div class="tiny mt3" style="color:#FFB07C">Manque : '+missing.map((x)=>x.n+'× '+SANCT_MERGE_NAME[x.r]).join(' · ')+'</div>':'')+'</div><div class="col gap4">'+btn('Préparer',{small:true,cls:active?'purple':'ghost',act:'sanctPrepare',arg:r.id,style:'width:auto;padding:5px 8px'})+btn('Fabriquer',{small:true,cls:ok?'green':'dark',act:'sanctRecipeCraft',arg:r.id,dis:!ok,primary:ok,style:'width:auto;padding:5px 8px'})+'</div></div></div>';
  }).join('');

  const counts=SANCT_MERGE_ORDER.map((r)=>{
    const n=sanctMergeCount(st,r); if(!n) return '';
    return '<span class="pill" style="color:'+SANCT_MERGE_COLOR[r]+';border-color:'+SANCT_MERGE_COLOR[r]+'66">'+n+'× '+SANCT_MERGE_NAME[r]+'</span>';
  }).join('');

  return topbar("Sanctuaire",'<span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">🪙 '+fmt(S.gold)+'</span><span class="pill">🛡️ '+fmt(st.stabilitySeals||0)+'</span>')+
    '<div class="pad mt6">'+
    '<div class="card recommendedActionCard"><div class="recommendedKicker">'+ic("bolt",11)+' ACTION RECOMMANDÉE</div><div class="between gap8 mt4"><div class="flex1"><div class="bb recommendedTitle">'+esc(rec.title)+'</div><div class="mute tiny mt3">'+esc(rec.sub)+'</div></div>'+btn('OUVRIR',{small:true,cls:rec.cls,act:rec.act,arg:rec.arg,primary:true,style:'width:auto;min-width:90px'})+'</div></div>'+
    '<div class="card frame mt8"><div class="between"><div><div class="tiny b" style="color:#8FEFF4">APPROVISIONNEMENT</div><div class="bb gt mt3">Niveau '+lvl+' / '+SANCT_SUPPLIER_MAX+'</div></div>'+sanctMergeOrb(tier,'')+'</div><div class="between mt8"><div><div class="b small">Couleur achetée : <span style="color:'+SANCT_MERGE_COLOR[tier]+'">'+SANCT_MERGE_NAME[tier]+'</span></div><div class="mute tiny">Chaque achat coûte exactement '+fmt(price)+' Or à ce niveau.</div></div>'+btn('Acheter',{small:true,cls:'blue',act:'sanctMergeBuy',dis:boardFull||S.gold<price,primary:!pair&&!readyRecipes.length,style:'width:auto'})+'</div>'+
      (maxed?'<div class="mt8"><span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">NIVEAU MAX · Épique acheté directement</span></div>':'<div class="between tiny b mt8"><span class="mute">JAUGE · '+st.supplierProgress+' / '+need+'</span><span style="color:var(--goldLit)">Niv.'+(lvl+1)+'</span></div>'+bar(st.supplierProgress/need*100,'#E8B44A',6))+
    '</div>'+
    '<div class="sect">Plateau de Merge <span class="mute tiny">· '+st.mergeBoard.filter(Boolean).length+'/'+SANCT_BOARD_SIZE+'</span></div>'+
    '<div class="notice tiny"><b>Fusion manuelle :</b> touche une couleur, puis une deuxième couleur identique. Deux pièces identiques deviennent la rareté supérieure. Les pièces Divines sont au sommet de la chaîne.</div>'+
    '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:8px">'+board+'</div>'+
    '<div class="row gap6 mt8">'+btn('Ranger le plateau',{small:true,cls:'ghost',act:'sanctMergePack'})+(st.mergeSelected>=0?btn('Annuler sélection',{small:true,cls:'dark',act:'sanctMergeCancel'}):'')+'</div>'+
    (counts?'<div class="row gap4 mt8" style="flex-wrap:wrap">'+counts+'</div>':'')+
    '<div class="sect">Livre de Fusion <span class="mute tiny">· '+st.mergeCrafts+' fabrications</span></div>'+recipes+
    '<div class="notice mt8 tiny">Les anciennes ressources de Raid ne sont plus consommées par le Sanctuaire. L’Or achète uniquement la couleur affichée ; les raretés supérieures se construisent sur le plateau. Le niveau d’approvisionnement conserve un prix fixe pendant toute sa jauge.</div></div>';
}
'''
s=s[:a]+new+s[b:]
ui.write_text(s)

act=Path('game-5.js')
g=act.read_text()
start2='  // sanctuaire\n'
end2='\n  // tree'
if start2 not in g or end2 not in g:
    raise SystemExit('sanctuary actions anchors missing')
a2=g.index(start2); b2=g.index(end2,a2)
actions=r'''  // sanctuaire
  sanctPrepare: (a) => {
    const st=sanctMergeState(), r=SANCT_MERGE_RECIPES.find((x)=>x.id===a);
    if(!r||!sanctMergeRecipeKnown(st,r)) return;
    st.mergeFocusRecipe=a; dirty=true; render();
  },
  sanctMergeBuy: () => {
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
  },
  sanctMergeTile: (a) => {
    const st=sanctMergeState(), i=Number(a), r=st.mergeBoard[i];
    if(!r) return;
    const sel=Number(st.mergeSelected);
    if(sel<0||!st.mergeBoard[sel]){ st.mergeSelected=i; dirty=true; return render(); }
    if(sel===i){ st.mergeSelected=-1; dirty=true; return render(); }
    const r0=st.mergeBoard[sel];
    if(r0!==r){ st.mergeSelected=i; dirty=true; toast("Choisis une deuxième couleur identique"); return render(); }
    const nx=sanctMergeNext(r);
    if(!nx){ st.mergeSelected=-1; dirty=true; toast("Divin est la rareté maximale"); return render(); }
    st.mergeBoard[sel]=null; st.mergeBoard[i]=nx; st.mergeSelected=-1; st.mergeFusions++; st.fusions=(st.fusions||0)+1;
    sanctMergeDiscover(st,nx); dirty=true; toast(SANCT_MERGE_NAME[r]+" + "+SANCT_MERGE_NAME[r]+" → "+SANCT_MERGE_NAME[nx],true); render();
  },
  sanctMergeCancel: () => { const st=sanctMergeState(); st.mergeSelected=-1; dirty=true; render(); },
  sanctMergePack: () => { const st=sanctMergeState(), kept=st.mergeBoard.filter(Boolean); st.mergeBoard=kept.concat(Array(SANCT_BOARD_SIZE-kept.length).fill(null)); st.mergeSelected=-1; dirty=true; render(); },
  sanctSelectPair: () => { const st=sanctMergeState(), p=sanctMergePair(st); if(!p)return; st.mergeSelected=p[0]; dirty=true; toast("Première "+SANCT_MERGE_NAME[p[2]]+" sélectionnée · touche la seconde"); render(); },
  sanctRecipeCraft: (a) => {
    const st=sanctMergeState(), r=SANCT_MERGE_RECIPES.find((x)=>x.id===a);
    if(!r||!sanctMergeRecipeKnown(st,r)||!sanctMergeRecipeReady(st,r)) return toast("Couleurs insuffisantes");
    Object.keys(r.req).forEach((rar)=>{ let n=r.req[rar]; for(let i=0;i<st.mergeBoard.length&&n>0;i++) if(st.mergeBoard[i]===rar){ st.mergeBoard[i]=null; n--; } });
    if(r.kind==="seal") st.stabilitySeals=(st.stabilitySeals||0)+r.qty;
    else {
      const ad=ACCEL_DEFS.find((x)=>x.mins===r.mins) || ACCEL_DEFS.reduce((best,x)=>!best||Math.abs(x.mins-r.mins)<Math.abs(best.mins-r.mins)?x:best,null);
      if(ad) S.accels[ad.key]=(S.accels[ad.key]||0)+r.qty;
    }
    st.mergeDiscovered[r.id]=true; st.mergeCrafts++; st.mergeFocusRecipe=a; st.mergeSelected=-1; dirty=true;
    toast("Rituel réussi · "+r.name+" · "+sanctMergeRecipeOutput(r),true); render();
  },
'''
g=g[:a2]+actions+g[b2:]
act.write_text(g)

eng=Path('game-2.js')
e=eng.read_text()
if f'|| "{BUILD_OLD}";' not in e: raise SystemExit('APP_BUILD anchor missing')
e=e.replace(f'|| "{BUILD_OLD}";',f'|| "{BUILD_NEW}";',1)
eng.write_text(e)

idx=Path('index.html')
h=idx.read_text()
count=h.count(BUILD_OLD)
if count<7: raise SystemExit(f'unexpected index build ref count {count}')
h=h.replace(BUILD_OLD,BUILD_NEW)
h=h.replace('<!-- Priorité Visible · build '+BUILD_NEW+' -->','<!-- Sanctuaire Merge · build '+BUILD_NEW+' -->')
idx.write_text(h)
print('Sanctuaire Merge v30 applied')
