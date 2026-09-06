from pathlib import Path

BUILD_OLD='2026.09.06.27'
BUILD_NEW='2026.09.06.28'

ui=Path('game-4.js')
s=ui.read_text()
start='/* ---------------- SANCTUAIRE ---------------- */\nfunction scrSanctuaire() {'
end='\n/* ---------------- ARBRE ---------------- */'
if start not in s or end not in s:
    raise SystemExit('sanctuary screen anchors missing')
a=s.index(start)
b=s.index(end,a)
new=r'''/* ---------------- SANCTUAIRE ---------------- */
function sanctRecipeAffordableUI(r) {
  if (!r) return false;
  return Object.keys(SANCT_ING).every((k) => (S[k] || 0) >= sanctNeedFor(r, k));
}
function sanctRecipeOutputUI(r) {
  if (!r) return "";
  if (r.out === "seal") return r.qty + "× Sceau de stabilité";
  const a = ACCEL_DEFS.find((x) => x.key === r.out);
  return r.qty + "× Accél. " + (a ? a.label : r.out);
}
function sanctRecipeCostUI(r) {
  return Object.keys(SANCT_ING).filter((k) => sanctNeedFor(r,k)).map((k) =>
    sanctNeedFor(r,k) + " " + SANCT_ING[k].label).join(" + ");
}
function scrSanctuaire() {
  const unlocked=sanctuaryUnlocked(S);
  const st=S.sanctuary || {slotA:null,slotB:null,discovered:{},fusions:0};
  const accelTotal=ACCEL_DEFS.reduce((n,a)=>n+(S.accels[a.key]||0)*a.mins,0);
  const discovered=SANCT_RECIPES.filter((r)=>!!st.discovered[r.id]);
  const knownReady=discovered.filter(sanctRecipeAffordableUI);
  const recommendation=knownReady[0] || discovered[0] || null;
  const resPills='<div class="row gap4" style="flex-wrap:wrap">'+
    '<span class="pill">⛏️ '+fmt(S.minerai)+'</span><span class="pill">✨ '+fmt(S.eclat)+'</span>'+
    '<span class="pill">🔥 '+fmt(S.essence)+'</span><span class="pill">🌫️ '+fmt(S.poussiere)+'</span></div>';
  if(!unlocked) return topbar("Sanctuaire",resPills)+
    '<div class="pad mt8"><div class="card frame center" style="padding:18px 12px;border-left-color:#9B5CF6">'+ic("lock",36)+
    '<div class="bb gt mt8" style="font-size:16px">SANCTUAIRE SCELLÉ</div>'+
    '<div class="dim small mt8" style="line-height:1.55">Vaincs ton premier Méga-Boss pour réveiller le Sanctuaire.<br>Il transformera ensuite tes surplus de ressources en accélérateurs et Sceaux de stabilité.</div></div></div>';

  const slot=(key,which)=> key ? '<div class="card center" data-act="sanctClear" data-arg="'+which+'" style="flex:1;min-height:86px;cursor:pointer;border-color:#9B5CF6">'+
      '<div style="font-size:25px">'+(key==='minerai'?'⛏️':key==='eclat'?'✨':key==='essence'?'🔥':'🌫️')+'</div><div class="b small mt6">'+SANCT_ING[key].label+'</div><div class="mute tiny">Toucher pour retirer</div></div>'
    : '<div class="card center" style="flex:1;min-height:86px;border-style:dashed"><div style="font-size:26px;opacity:.45">＋</div><div class="mute tiny mt6">Emplacement '+(which==='a'?'I':'II')+'</div></div>';

  const ingredients=Object.keys(SANCT_ING).map((k)=>'<div class="card" data-act="sanctAdd" data-arg="'+k+'" style="cursor:pointer;padding:8px;flex:1;min-width:46%"><div class="between"><div><div class="b small">'+
    (k==='minerai'?'⛏️':k==='eclat'?'✨':k==='essence'?'🔥':'🌫️')+' '+SANCT_ING[k].label+'</div><div class="mute tiny">Stock : '+fmt(S[k]||0)+'</div></div>'+ic("plus",15)+'</div></div>').join('');

  const recipe=sanctRecipeFor(st.slotA,st.slotB);
  const affordable=recipe ? sanctRecipeAffordableUI(recipe) : false;
  const preview=recipe ? '<div class="notice mt8 tiny" style="border-color:'+(affordable?'#3FB95066':'#E5484D66')+'"><div class="between"><div><b style="color:var(--goldLit)">'+esc(recipe.name)+'</b><div class="mute tiny mt3">'+esc(sanctRecipeCostUI(recipe))+'</div></div><div style="text-align:right"><b style="color:'+(affordable?'var(--greenLit)':'#FF9A9A')+'">'+esc(sanctRecipeOutputUI(recipe))+'</b><div class="tiny '+(affordable?'gt':'rt')+' mt3">'+(affordable?'PRÊT':'RESSOURCES INSUFFISANTES')+'</div></div></div></div>'
    : (st.slotA&&st.slotB?'<div class="notice mt8 tiny" style="border-color:#E8B44A55"><b>Combinaison inconnue</b><div class="mute mt3">Tu peux tenter la Fusion : si aucune recette ne correspond, aucune ressource ne sera consommée.</div></div>':'');

  const known=SANCT_RECIPES.map((r)=>{
    const d=!!st.discovered[r.id];
    if(!d && r.secret) return '<div class="card mt6" style="padding:8px 9px;opacity:.78"><div class="between"><div><div class="b small">❓ Recette secrète</div><div class="mute tiny">Une combinaison reste à découvrir.</div></div><span class="pill">???</span></div></div>';
    if(!d) return '<div class="card mt6" style="padding:8px 9px;opacity:.78"><div class="between"><div><div class="b small">Recette non découverte</div><div class="mute tiny">Expérimente dans le Cercle de Fusion.</div></div><span class="pill">???</span></div></div>';
    const ok=sanctRecipeAffordableUI(r);
    return '<div class="card mt6" style="padding:8px 9px;border-color:'+(ok?'#3FB95055':'var(--line)')+'"><div class="between gap8"><div class="flex1"><div class="row gap4"><span class="b small">✓ '+esc(r.name)+'</span>'+(ok?'<span class="pill" style="color:var(--greenLit);border-color:#3FB950">PRÊT</span>':'')+'</div><div class="mute tiny mt3">'+esc(sanctRecipeCostUI(r))+' → '+esc(sanctRecipeOutputUI(r))+'</div></div>'+btn('Préparer',{small:true,cls:ok?'green':'ghost',act:'sanctPrepare',arg:r.id,style:'width:auto;padding:5px 8px'})+'</div></div>';
  }).join('');

  const recommendCard = recommendation
    ? '<div class="card lit mt8" style="padding:9px 10px;border-left:3px solid '+(sanctRecipeAffordableUI(recommendation)?'#3FB950':'#9B5CF6')+'"><div class="between gap8"><div class="flex1"><div class="tiny b" style="color:#8FEFF4">ACTION RECOMMANDÉE</div><div class="b small mt3">'+esc(recommendation.name)+'</div><div class="mute tiny mt3">'+(sanctRecipeAffordableUI(recommendation)?'Tu as déjà toutes les ressources nécessaires.':'Recette connue, mais il te manque encore des ressources.')+'</div></div>'+btn('Préparer',{small:true,cls:sanctRecipeAffordableUI(recommendation)?'green':'purple',act:'sanctPrepare',arg:recommendation.id,style:'width:auto'})+'</div></div>'
    : '<div class="notice mt8 tiny"><b>Première découverte</b> · Choisis deux ressources différentes ou identiques et expérimente. Une combinaison invalide ne consomme rien.</div>';

  return topbar("Sanctuaire",'<span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">⏱️ '+fmtTime(accelTotal*60)+'</span><span class="pill">🛡️ '+fmt(st.stabilitySeals||0)+'</span>')+
    '<div class="pad mt6">'+
    '<div class="card" style="padding:8px 10px"><div class="between"><div><div class="tiny b" style="color:#8FEFF4">MAÎTRISE DU SANCTUAIRE</div><div class="bb gt mt3">'+discovered.length+' / '+SANCT_RECIPES.length+' recettes découvertes</div></div><div style="text-align:right"><div class="b">'+fmt(st.fusions||0)+'</div><div class="mute tiny">fusions</div></div></div>'+bar(SANCT_RECIPES.length?discovered.length/SANCT_RECIPES.length*100:0,'#9B5CF6',5)+'</div>'+
    recommendCard+
    '<div class="card frame mt8"><div class="between"><div><div class="bb gt">CERCLE DE FUSION</div><div class="mute tiny b">Fusion instantanée · aucun timer</div></div><span class="pill">'+(recipe?(affordable?'PRÊT':'À COMPLÉTER'):'2 ingrédients')+'</span></div>'+
    '<div class="row gap8 mt10">'+slot(st.slotA,'a')+'<div class="bb gt">＋</div>'+slot(st.slotB,'b')+'</div>'+preview+
    '<div class="mt8">'+btn(ic("flame",14)+' FUSIONNER',{cls:recipe&&affordable?'purple':'dark',act:'sanctFuse',dis:!(st.slotA&&st.slotB)||(recipe&&!affordable)})+'</div></div>'+
    '<div class="sect">Ressources</div><div class="row gap6" style="flex-wrap:wrap">'+ingredients+'</div>'+
    '<div class="sect">Livre de Fusion <span class="mute tiny">· '+discovered.length+'/'+SANCT_RECIPES.length+'</span></div>'+known+
    '<div class="notice mt8 tiny">Les recettes découvertes restent inscrites dans le Livre. Les coûts et récompenses du Sanctuaire n’ont pas été modifiés.</div></div>';
}
'''
s=s[:a]+new+s[b:]
ui.write_text(s)

act=Path('game-5.js')
g=act.read_text()
anchor='''  // sanctuaire\n  sanctAdd: (a) => { sanctSetSlot(a); render(); },'''
if anchor not in g:
    raise SystemExit('sanctuary actions anchor missing')
replacement='''  // sanctuaire\n  sanctPrepare: (a) => {\n    const r=SANCT_RECIPES.find((x)=>x.id===a);\n    if(!r) return;\n    if(!S.sanctuary) S.sanctuary={slotA:null,slotB:null,discovered:{},fusions:0,stabilitySeals:0};\n    S.sanctuary.slotA=r.a; S.sanctuary.slotB=r.b;\n    dirty=true; scheduleRender();\n  },\n  sanctAdd: (a) => { sanctSetSlot(a); render(); },'''
g=g.replace(anchor,replacement,1)
act.write_text(g)

eng=Path('game-2.js')
e=eng.read_text()
if f'|| "{BUILD_OLD}";' not in e:
    raise SystemExit('APP_BUILD anchor missing')
e=e.replace(f'|| "{BUILD_OLD}";',f'|| "{BUILD_NEW}";',1)
eng.write_text(e)

idx=Path('index.html')
h=idx.read_text()
count=h.count(BUILD_OLD)
if count < 7:
    raise SystemExit(f'unexpected index build reference count: {count}')
h=h.replace(BUILD_OLD,BUILD_NEW)
idx.write_text(h)

print('Sanctuaire v28 patch applied')
