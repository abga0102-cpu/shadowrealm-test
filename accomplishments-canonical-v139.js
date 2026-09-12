/* SHADOWREACH · Accomplishments canonical mobile UI v139 · Fusion milestones V202
   V314: campaign milestones now follow the canonical 1–400 campaign and retired
   Rebirth/PR accomplishments are no longer surfaced. */
(function(){
'use strict';
if(window.__srAccomplishmentsCanonicalV139)return;
window.__srAccomplishmentsCanonicalV139=true;
function n(v){return Math.max(0,Number(v)||0);}
function claimed(id){return !!(S.accomplishments&&S.accomplishments.claimed&&S.accomplishments.claimed[id]);}
function raids(){return n(S.accomplishments&&S.accomplishments.raidWins);}
function forge(){return n(S.forge&&S.forge.level);}
function floor(){return n(S.recordFloor);}
function floorDone(target){target=Math.max(1,Math.floor(Number(target)||1));if(target%50===0)return !!(S.bossClears&&S.bossClears[String(target)]);return floor()>=target;}
function fusions(){var st=S.sanctuary||{},a=S.accomplishments||{};return Math.max(n(st.mergeCrafts),n(st.fusions),n(a.fusionCount));}
function ensureTitles(){S.titles=S.titles&&typeof S.titles==='object'?S.titles:{};if(typeof S.equippedTitle!=='string')S.equippedTitle='';}
function divineUnlocked(){ensureTitles();var st=S.sanctuary||{};return !!(st.divineTitleUnlocked||S.titles.divin);}
function saveTitle(){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){} }
function syncTitleButton(b){var equipped=S.equippedTitle==='divin';b.textContent=equipped?'Équipé':'Équiper';b.classList.remove('gold','dark');b.classList.add(equipped?'dark':'gold');}
function installTitleInteraction(){
 if(window.__srAccomplishmentsTitleInteractionV139)return;
 window.__srAccomplishmentsTitleInteractionV139=true;
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-ach-title="divin"]'):null;
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  if(!divineUnlocked())return;
  S.equippedTitle=S.equippedTitle==='divin'?'':'divin';
  saveTitle();
  syncTitleButton(b);
 },true);
}
var ITEMS={
 Forge:[
  ['forge5',5,'Forge niveau 5','5 000 Or'],['forge10',10,'Forge niveau 10','10 000 Or'],
  ['forge15',15,'Forge niveau 15','15 Pièces de fusion Communes'],['forge20',20,'Forge niveau 20','15 Pièces de fusion Peu communes'],
  ['forge30',30,'Forge niveau 30','50 000 Or + 20 Pièces de fusion Peu communes'],['forge35',35,'Forge niveau 35','25 Pièces de fusion Rares + 2 Clés Minerais'],
  ['forge40',40,'Forge niveau 40','20 Pièces de fusion Rares + 100 000 Or'],['forge50',50,'Forge niveau 50','25 Pièces de fusion Épiques + 2 Clés Minerais']
 ],
 Fusions:[
  ['fusion50',50,'50 Fusions','15 Pièces de fusion Communes'],
  ['fusion150',150,'150 Fusions','15 Pièces de fusion Peu communes'],
  ['fusion250',250,'250 Fusions','15 Pièces de fusion Rares + Boost +10% Or d’étage · 30 min'],
  ['fusion350',350,'350 Fusions','15 Pièces de fusion Rares'],
  ['fusion500',500,'500 Fusions','20 Pièces de fusion Épiques + Boost +10% Or d’étage · 30 min'],
  ['fusion1000',1000,'1 000 Fusions','20 Pièces de fusion Mythiques + 100 000 Or'],
  ['fusion1500',1500,'1 500 Fusions','20 Pièces de fusion Mythiques + Boost +50% Or d’étage · 30 min']
 ],
 Raids:[
  ['raid10',10,'10 Raids accomplis','5 000 Or'],['raid20',20,'20 Raids accomplis','30 Pièces de fusion Communes'],
  ['raid50',50,'50 Raids accomplis','20 Pièces de fusion Rares + choix : 500 Étincelles OU 500 Essences','choice'],
  ['raid100',100,'100 Raids accomplis','1 500 000 Or + 1 000 Étincelles + 1 000 Essences + 50 Pièces de fusion Rares']
 ],
 Etages:[
  ['floor25',25,'Atteindre l’étage 25','250 Essences'],
  ['floor50',50,'Terminer Normal · Boss 50','2 000 Minerais + 5 000 Or'],
  ['floor75',75,'Atteindre l’étage 75','500 Étincelles + 30 Pièces de fusion Communes'],
  ['floor100',100,'Terminer Difficile · Boss 100','500 Étincelles + 500 Essences + 30 Pièces de fusion Communes'],
  ['floor150',150,'Terminer Expert · Boss 150','750 Étincelles + 750 Essences + 15 Pièces de fusion Rares'],
  ['floor200',200,'Terminer Cauchemar · Boss 200','1 000 Étincelles + 1 000 Essences + 20 Pièces de fusion Rares'],
  ['floor250',250,'Terminer Infernal · Boss 250','1 250 Étincelles + 1 250 Essences + 10 Pièces de fusion Épiques'],
  ['floor300',300,'Terminer Abyssal · Boss 300','1 500 Étincelles + 1 500 Essences + 15 Pièces de fusion Épiques'],
  ['floor350',350,'Terminer Immortel · Boss 350','2 000 Étincelles + 2 000 Essences + 10 Pièces de fusion Mythiques'],
  ['floor400',400,'Terminer Divin · Boss 400','2 500 Étincelles + 2 500 Essences + 20 Pièces de fusion Mythiques + 1 Clé universelle']
 ]
};
function value(cat){return cat==='Forge'?forge():cat==='Fusions'?fusions():cat==='Raids'?raids():floor();}
function itemDone(cat,x){return cat==='Etages'?floorDone(x[1]):value(cat)>=x[1];}
function status(cat){var v=value(cat),list=ITEMS[cat],done=0,next=null;for(var i=0;i<list.length;i++){if(itemDone(cat,list[i]))done++;else if(next===null)next=list[i][1];}var fin=done===list.length;return '<div class="card frame"'+(cat==='Etages'?' data-ach-floor-overview-v138="1" data-ach-floor-overview-v137="1"':'')+' style="margin:6px 0;width:100%;box-sizing:border-box"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0"><div style="min-width:0;flex:1"><div class="b">'+(cat==='Etages'?'Étages':cat)+'</div><div class="mute tiny">'+(fin?done+' / '+list.length+' jalons atteints':'Prochain jalon : '+next+' · '+done+' / '+list.length+' atteints')+'</div></div><span class="pill" style="flex:0 0 auto'+(fin?';color:var(--greenLit);border-color:#3FB950':'')+'">'+(fin?'Terminé':v+' / '+next)+'</span></div></div>';}
function action(x,done){if(claimed(x[0]))return '<span class="pill" style="color:var(--greenLit);border-color:#3FB950;flex:0 0 auto">Récupéré</span>';if(!done)return '<span class="pill" style="flex:0 0 auto">En cours</span>';if(x[4]==='choice')return '<div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end"><button class="btn sm blue" data-ach="'+x[0]+'" data-ach-choice="eclat">500 Étincelles</button><button class="btn sm purple" data-ach="'+x[0]+'" data-ach-choice="essence">500 Essences</button></div>';return '<button class="btn sm green" data-ach="'+x[0]+'" style="flex:0 0 auto">Récupérer</button>';}
function section(cat){var attrs=cat==='Etages'?' data-ach-floors-v138="1" data-ach-floors-v137-safe="1"':'';return '<div'+attrs+' style="width:100%;min-width:0;box-sizing:border-box"><div class="sect" style="margin:14px 0 6px">'+(cat==='Etages'?'Étages':cat)+'</div>'+ITEMS[cat].map(function(x){return '<div class="itemRow" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;width:100%;min-width:0;box-sizing:border-box"><div style="flex:1 1 180px;min-width:0"><div class="b small">'+x[2]+'</div><div class="mute tiny" style="overflow-wrap:anywhere">'+x[3]+'</div></div>'+action(x,itemDone(cat,x))+'</div>';}).join('')+'</div>';}
function titleSection(){ensureTitles();var unlocked=divineUnlocked(),eq=S.equippedTitle==='divin';return '<div data-ach-titles-v134="1" style="width:100%;min-width:0;box-sizing:border-box"><div class="sect" style="margin:14px 0 6px">Titres</div><div class="card frame" style="margin-bottom:7px;width:100%;box-sizing:border-box"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div style="min-width:0"><div class="b">Vue d’ensemble des titres</div><div class="mute tiny">Débloqués : '+(unlocked?1:0)+' / 1</div></div><span class="pill">'+(unlocked?'1 / 1':'0 / 1')+'</span></div></div><div class="itemRow" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;width:100%;min-width:0;box-sizing:border-box"><div style="flex:1 1 180px;min-width:0"><div class="b small" style="color:#FFB52E">Divin</div><div class="mute tiny">Sacrifier un Divin · '+(unlocked?'1 / 1':'0 / 1')+'</div></div>'+(unlocked?'<button class="btn sm '+(eq?'dark':'gold')+'" data-ach-title="divin">'+(eq?'Équipé':'Équiper')+'</button>':'<span class="pill">Verrouillé</span>')+'</div></div>';}
function html(){var cats=['Forge','Fusions','Raids','Etages'];return '<div class="srAch139" data-ach-canonical-v139="1" style="width:100%;max-width:100%;min-width:0;box-sizing:border-box;overflow-x:hidden"><div data-ach-overview-v135="1" style="width:100%;min-width:0"><div class="sect" style="margin:0 0 6px">Vue d’ensemble</div>'+cats.map(status).join('')+'</div>'+cats.map(section).join('')+titleSection()+'<div class="mt10" style="width:100%;box-sizing:border-box"><button class="btn ghost" data-act="closeModal" style="width:100%">Fermer</button></div></div>';}
function installSettingsEntry(){
 if(window.__srAccomplishmentsSettingsEntryV139)return;
 if(typeof scrParametres!=='function'||typeof SCREENS==='undefined'||!SCREENS)return;
 window.__srAccomplishmentsSettingsEntryV139=true;
 var oldSettings=scrParametres;
 scrParametres=function(){var h=oldSettings();return h.replace('<div class="pad mt6">','<div class="pad mt6"><div class="card lit" data-act="accomplishments" style="cursor:pointer;margin-bottom:8px"><div class="between"><b>Accomplissements</b><span class="pill">Voir les recompenses</span></div></div>');};
 SCREENS.parametres=scrParametres;
}
function install(){if(typeof S==='undefined'||typeof ACT==='undefined'||typeof openModal!=='function')return;ACT.accomplishments=function(){openModal(html(),'Accomplissements');};installTitleInteraction();installSettingsEntry();}
install();
})();