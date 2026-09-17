/* SHADOWREACH · Accomplishments canonical mobile UI v139 · Progression Pass
   Campaign milestones follow the 800-stage structure with five 20-stage chapters
   per difficulty; Boss milestones require the actual Boss clear.
   V326: Arena-facing Pass Progression with Étages / Défis and a visible Premium lane.
   V342: Forge milestones follow the approved Gold-only ladder.
   V343: same-modal tab refresh stays inside the canonical Accomplishments owner; Forge Premium adds +50% Gold. */
(function(){
'use strict';
if(window.__srAccomplishmentsCanonicalV139)return;
window.__srAccomplishmentsCanonicalV139=true;
var activeTab='etages';
function n(v){return Math.max(0,Number(v)||0);}
function claimed(id){return !!(S.accomplishments&&S.accomplishments.claimed&&S.accomplishments.claimed[id]);}
function premiumClaimed(id){return !!(S.accomplishments&&S.accomplishments.premiumClaimed&&S.accomplishments.premiumClaimed[id]);}
function premiumOwned(){var a=S.accomplishments||{};return !!(a.premiumPass||a.premiumPassOwned);}
function raids(){return n(S.accomplishments&&S.accomplishments.raidWins);}
function forge(){return n(S.forge&&S.forge.level);}
function floor(){return n(S.recordFloor);}
function targetIsBoss(target){try{if(typeof isBoss==='function')return !!isBoss(target);}catch(_){}var stage=((Math.max(1,Number(target)||1)-1)%20)+1;return stage%5===0;}
function floorDone(target){target=Math.max(1,Math.floor(Number(target)||1));if(targetIsBoss(target))return !!(S.bossClears&&S.bossClears[String(target)]);return floor()>=target;}
function stageLabel(target){target=Math.max(1,Math.min(800,Math.floor(Number(target)||1)));try{if(typeof window.__srCampaignStageLabel==='function')return window.__srCampaignStageLabel(target);}catch(_){}var within=((target-1)%100)+1;return (Math.floor((within-1)/20)+1)+'-'+(((within-1)%20)+1);}
function fusions(){var st=S.sanctuary||{},a=S.accomplishments||{};return Math.max(n(st.mergeCrafts),n(st.fusions),n(a.fusionCount));}
function ensureTitles(){S.titles=S.titles&&typeof S.titles==='object'?S.titles:{};if(typeof S.equippedTitle!=='string')S.equippedTitle='';}
function divineUnlocked(){ensureTitles();var st=S.sanctuary||{};return !!(st.divineTitleUnlocked||S.titles.divin);}
function saveTitle(){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){} }
function syncTitleButton(b){var equipped=S.equippedTitle==='divin';b.textContent=equipped?'Équipé':'Équiper';b.classList.remove('gold','dark');b.classList.add(equipped?'dark':'gold');}
function escText(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
function installTitleInteraction(){
 if(window.__srAccomplishmentsTitleInteractionV139)return;
 window.__srAccomplishmentsTitleInteractionV139=true;
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-ach-title="divin"]'):null;
  if(!b)return;e.preventDefault();e.stopPropagation();if(!divineUnlocked())return;
  S.equippedTitle=S.equippedTitle==='divin'?'':'divin';saveTitle();syncTitleButton(b);
 },true);
}
var ITEMS={
 Forge:[
  ['forge10',10,'Forge niveau 10','7 500 Or'],['forge15',15,'Forge niveau 15','10 000 Or'],
  ['forge20',20,'Forge niveau 20','20 000 Or'],['forge25',25,'Forge niveau 25','30 000 Or'],
  ['forge30',30,'Forge niveau 30','75 000 Or'],['forge35',35,'Forge niveau 35','100 000 Or'],
  ['forge40',40,'Forge niveau 40','200 000 Or'],['forge45',45,'Forge niveau 45','300 000 Or'],
  ['forge50',50,'Forge niveau 50','500 000 Or']
 ],
 Fusions:[
  ['fusion50',50,'50 Fusions','15 Pièces de fusion Communes'],['fusion150',150,'150 Fusions','15 Pièces de fusion Peu communes'],
  ['fusion250',250,'250 Fusions','15 Pièces de fusion Rares + Boost +10% Or d’étage · 30 min'],['fusion350',350,'350 Fusions','15 Pièces de fusion Rares'],
  ['fusion500',500,'500 Fusions','20 Pièces de fusion Épiques + Boost +10% Or d’étage · 30 min'],['fusion1000',1000,'1 000 Fusions','20 Pièces de fusion Mythiques + 100 000 Or'],
  ['fusion1500',1500,'1 500 Fusions','20 Pièces de fusion Mythiques + Boost +50% Or d’étage · 30 min']
 ],
 Raids:[
  ['raid10',10,'10 Raids accomplis','5 000 Or'],['raid20',20,'20 Raids accomplis','30 Pièces de fusion Communes'],
  ['raid50',50,'50 Raids accomplis','20 Pièces de fusion Rares + choix : 500 Étincelles OU 500 Essences','choice'],
  ['raid100',100,'100 Raids accomplis','1 500 000 Or + 1 000 Étincelles + 1 000 Essences + 50 Pièces de fusion Rares']
 ],
 Etages:[
  ['floor25',45,'Vaincre Facile · 3-5','250 Essences'],
  ['floor50',100,'Terminer Facile · 5-20','2 000 Minerais + 5 000 Or'],
  ['floor75',145,'Vaincre Difficile · 3-5','500 Étincelles + 30 Pièces de fusion Communes'],
  ['floor100',200,'Terminer Difficile · 5-20','500 Étincelles + 500 Essences + 30 Pièces de fusion Communes'],
  ['floor150',300,'Terminer Expert · 5-20','750 Étincelles + 750 Essences + 15 Pièces de fusion Rares'],
  ['floor200',400,'Terminer Cauchemar · 5-20','1 000 Étincelles + 1 000 Essences + 20 Pièces de fusion Rares'],
  ['floor250',500,'Terminer Infernal · 5-20','1 250 Étincelles + 1 250 Essences + 10 Pièces de fusion Épiques'],
  ['floor300',600,'Terminer Abyssal · 5-20','1 500 Étincelles + 1 500 Essences + 15 Pièces de fusion Épiques'],
  ['floor350',700,'Terminer Immortel · 5-20','2 000 Étincelles + 2 000 Essences + 10 Pièces de fusion Mythiques'],
  ['floor400',800,'Terminer Divin · 5-20','2 500 Étincelles + 2 500 Essences + 20 Pièces de fusion Mythiques + 1 Clé universelle']
 ]
};
var PREMIUM_TEXT={
 forge10:'3 750 Or',forge15:'5 000 Or',forge20:'10 000 Or',forge25:'15 000 Or',forge30:'37 500 Or',forge35:'50 000 Or',forge40:'100 000 Or',forge45:'150 000 Or',forge50:'250 000 Or',
 fusion50:'5 Pièces Communes',fusion150:'5 Pièces Peu communes',fusion250:'5 Pièces Rares',fusion350:'5 Pièces Rares',fusion500:'5 Pièces Épiques',fusion1000:'25 000 Or + 5 Pièces Mythiques',fusion1500:'5 Pièces Mythiques',
 raid10:'2 500 Or',raid20:'10 Pièces Communes',raid50:'5 Pièces Rares + 250 Essences',raid100:'250 000 Or + 250 Étincelles + 250 Essences + 10 Pièces Rares',
 floor25:'100 Essences',floor50:'750 Minerais + 2 500 Or',floor75:'200 Étincelles + 10 Pièces Communes',floor100:'200 Étincelles + 200 Essences + 10 Pièces Communes',floor150:'250 Étincelles + 250 Essences + 5 Pièces Rares',floor200:'300 Étincelles + 300 Essences + 5 Pièces Rares',floor250:'350 Étincelles + 350 Essences + 3 Pièces Épiques',floor300:'400 Étincelles + 400 Essences + 4 Pièces Épiques',floor350:'500 Étincelles + 500 Essences + 3 Pièces Mythiques',floor400:'750 Étincelles + 750 Essences + 5 Pièces Mythiques'
};
function value(cat){return cat==='Forge'?forge():cat==='Fusions'?fusions():cat==='Raids'?raids():floor();}
function itemDone(cat,x){return cat==='Etages'?floorDone(x[1]):value(cat)>=x[1];}
function catDone(cat){var list=ITEMS[cat],done=0;for(var i=0;i<list.length;i++)if(itemDone(cat,list[i]))done++;return done;}
function allProgress(){var cats=['Forge','Fusions','Raids','Etages'],done=0,total=0,claimable=0;for(var c=0;c<cats.length;c++){var list=ITEMS[cats[c]];for(var i=0;i<list.length;i++){total++;if(itemDone(cats[c],list[i])){done++;if(!claimed(list[i][0]))claimable++;if(premiumOwned()&&!premiumClaimed(list[i][0]))claimable++;}}}return {done:done,total:total,claimable:claimable};}
function launcherState(){var list=ITEMS.Etages,done=0;for(var i=0;i<list.length;i++)if(itemDone('Etages',list[i]))done++;var a=allProgress();return {done:done,total:list.length,claimable:a.claimable,stage:stageLabel(Math.max(1,floor()))};}
window.__srAccomplishmentsLauncherStateV139=launcherState;
function installStyles(){
 if(document.getElementById('srAchPassV139Style'))return;
 var st=document.createElement('style');st.id='srAchPassV139Style';st.textContent='\
.srAch139{--achGold:#d7ae58;--achGold2:#f0d58e;--achBlue:#5d9fe8;--achPanel:#111b2b;--achPanel2:#172338;color:#e8eef7}\
.srAch139 .achPassHero{border:1px solid rgba(215,174,88,.42);border-radius:14px;padding:14px;background:radial-gradient(circle at 85% 0,rgba(215,174,88,.13),transparent 34%),linear-gradient(180deg,#17243a,#101a2a);box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 6px 16px rgba(0,0,0,.25)}\
.srAch139 .achPassKicker{font-size:9px;letter-spacing:1.6px;color:#cdb979;font-weight:800}.srAch139 .achPassTitle{font-size:21px;line-height:1.08;margin-top:3px;font-weight:850}.srAch139 .achPassSub{margin-top:5px;font-size:11px;line-height:1.35;color:#93a2b7}\
.srAch139 .achPassTop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.srAch139 .achPassPrice{flex:0 0 auto;border:1px solid rgba(215,174,88,.55);border-radius:10px;padding:7px 9px;background:#1b2432;color:#f0d58e;font-size:10px;font-weight:800;text-align:center}.srAch139 .achPassPrice small{display:block;color:#8493a8;font-size:8px;font-weight:700;margin-top:2px}\
.srAch139 .achPassMeter{height:7px;border-radius:6px;background:#0a111d;overflow:hidden;margin-top:11px;border:1px solid #27364d}.srAch139 .achPassMeter>i{display:block;height:100%;background:linear-gradient(90deg,#9b782f,#e0bd68)}.srAch139 .achPassMeta{display:flex;justify-content:space-between;gap:8px;margin-top:5px;color:#8d9caf;font-size:9px}\
.srAch139 .achTabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}.srAch139 .achTab{border:1px solid #2b3a52;border-radius:10px;padding:9px 8px;background:#121d2d;color:#91a0b4;font-weight:800;font-size:11px}.srAch139 .achTab.on{border-color:rgba(215,174,88,.65);background:#332a18;color:#f0d58e;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}\
.srAch139 .achLaneHead,.srAch139 .achPassRow{display:grid;grid-template-columns:minmax(125px,1.28fr) minmax(105px,.9fr) minmax(105px,.9fr);gap:7px;align-items:stretch}.srAch139 .achLaneHead{padding:0 8px 5px;color:#8291a5;font-size:8px;font-weight:800;letter-spacing:.9px;text-transform:uppercase}.srAch139 .achLaneHead span:nth-child(3){color:#d7ae58}.srAch139 .achPassRow{margin:6px 0;padding:8px;border:1px solid #2a394f;border-radius:11px;background:linear-gradient(180deg,#162237,#111a2a)}\
.srAch139 .achObjective{min-width:0;padding:3px 4px}.srAch139 .achObjective b{display:block;font-size:11px;line-height:1.2}.srAch139 .achObjective small{display:block;color:#8190a5;font-size:9px;margin-top:4px}.srAch139 .achReward{min-width:0;border-left:1px solid #29394f;padding:3px 4px 3px 9px;display:flex;flex-direction:column;justify-content:space-between;gap:7px}.srAch139 .achReward.premium{border-left-color:rgba(215,174,88,.28);background:linear-gradient(90deg,rgba(215,174,88,.035),transparent);border-radius:0 7px 7px 0}.srAch139 .achRewardText{font-size:9px;line-height:1.3;color:#b6c1d0;overflow-wrap:anywhere}.srAch139 .achReward.premium .achRewardText{color:#dec98c}.srAch139 .achReward .btn{width:100%;min-height:30px;padding:6px 7px;font-size:9px}.srAch139 .achState{display:flex;align-items:center;justify-content:center;min-height:28px;border:1px solid #33435a;border-radius:8px;color:#8291a6;font-size:9px;font-weight:800}.srAch139 .achState.done{color:#69d389;border-color:#335d46}.srAch139 .achState.locked{color:#a99359;border-color:#5a4c2c;background:rgba(215,174,88,.035)}\
.srAch139 .achCatTitle{margin:14px 1px 6px;font-size:10px;letter-spacing:1.2px;color:#dcc47e;font-weight:850;text-transform:uppercase}.srAch139 .achCategorySummary{font-size:8px;color:#73839a;margin-left:5px;font-weight:700}.srAch139 .achPassNote{margin-top:8px;padding:8px 10px;border-radius:9px;border:1px solid #29394f;background:#0f1927;color:#8291a5;font-size:9px;line-height:1.35}.srAch139 .achPassNote b{color:#d9c684}\
@media(max-width:560px){.srAch139 .achLaneHead{grid-template-columns:1fr 1fr}.srAch139 .achLaneHead span:first-child{display:none}.srAch139 .achPassRow{grid-template-columns:1fr 1fr}.srAch139 .achObjective{grid-column:1/-1;padding:2px 3px 6px;border-bottom:1px solid #26364b}.srAch139 .achReward{border-left:0;padding:3px 4px}.srAch139 .achReward.premium{border-left:1px solid rgba(215,174,88,.22);padding-left:8px}.srAch139 .achPassTitle{font-size:19px}}';
 document.head.appendChild(st);
}
function freeAction(x,done){if(claimed(x[0]))return '<span class="achState done">Récupéré</span>';if(!done)return '<span class="achState">En cours</span>';if(x[4]==='choice')return '<div style="display:grid;gap:4px"><button class="btn sm" data-ach="'+x[0]+'" data-ach-choice="eclat">+500 Étincelles</button><button class="btn sm" data-ach="'+x[0]+'" data-ach-choice="essence">+500 Essences</button></div>';return '<button class="btn sm" data-ach="'+x[0]+'" data-primary="true">Récupérer</button>';}
function premiumAction(x,done){if(!premiumOwned())return '<span class="achState locked">Premium</span>';if(premiumClaimed(x[0]))return '<span class="achState done">Récupéré</span>';if(!done)return '<span class="achState">En cours</span>';return '<button class="btn sm" data-ach-premium="'+x[0]+'" data-primary="true">Récupérer</button>';}
function row(cat,x){var done=itemDone(cat,x),cur=value(cat),progress=cat==='Etages'?stageLabel(Math.max(1,cur)):(Math.min(cur,x[1])+' / '+x[1]);return '<div class="achPassRow"'+(cat==='Etages'?' data-ach-floors-v138="1" data-ach-floors-v137-safe="1"':'')+'><div class="achObjective"><b>'+escText(x[2])+'</b><small>'+escText(done?'Objectif atteint':progress)+'</small></div><div class="achReward"><div class="achRewardText">'+escText(x[3])+'</div>'+freeAction(x,done)+'</div><div class="achReward premium"><div class="achRewardText">'+escText(PREMIUM_TEXT[x[0]]||'Bonus Premium')+'</div>'+premiumAction(x,done)+'</div></div>';}
function laneHead(){return '<div class="achLaneHead"><span>Objectif</span><span>Gratuit</span><span>Premium</span></div>';}
function floorsView(){var list=ITEMS.Etages,done=catDone('Etages');return '<div data-ach-floor-overview-v138="1" data-ach-floor-overview-v137="1"><div class="achCatTitle">Étages <span class="achCategorySummary">'+done+' / '+list.length+' jalons</span></div>'+laneHead()+list.map(function(x){return row('Etages',x);}).join('')+'</div>';}
function challengesView(){var cats=['Forge','Fusions','Raids'];return cats.map(function(cat){return '<div><div class="achCatTitle">'+cat+' <span class="achCategorySummary">'+catDone(cat)+' / '+ITEMS[cat].length+'</span></div>'+laneHead()+ITEMS[cat].map(function(x){return row(cat,x);}).join('')+'</div>';}).join('')+titleSection();}
function titleSection(){ensureTitles();var unlocked=divineUnlocked(),eq=S.equippedTitle==='divin';return '<div data-ach-titles-v134="1"><div class="achCatTitle">Titres <span class="achCategorySummary">'+(unlocked?'1 / 1':'0 / 1')+'</span></div><div class="achPassRow" style="grid-template-columns:1fr minmax(110px,.8fr)"><div class="achObjective"><b style="color:#f0c761">Divin</b><small>Sacrifier un Divin · '+(unlocked?'1 / 1':'0 / 1')+'</small></div><div class="achReward" style="border-left:1px solid #29394f">'+(unlocked?'<button class="btn sm '+(eq?'dark':'')+'" data-ach-title="divin" data-primary="'+(eq?'false':'true')+'">'+(eq?'Équipé':'Équiper')+'</button>':'<span class="achState locked">Verrouillé</span>')+'</div></div></div>';}
function hero(){var p=allProgress(),pct=Math.max(0,Math.min(100,Math.round(p.done/Math.max(1,p.total)*100))),premium=premiumOwned();return '<div class="achPassHero" data-ach-overview-v135="1"><div class="achPassTop"><div><div class="achPassKicker">PROGRESSION</div><div class="achPassTitle">Pass Progression</div><div class="achPassSub">Progresse dans les étages et complète des défis pour récupérer tes récompenses.</div></div><button type="button" class="achPassPrice" data-ach-premium-info="1">'+(premium?'Premium actif':'Premium · 9,99 €')+'<small>'+(premium?'Bonus débloqués':'Récompenses bonus')+'</small></button></div><div class="achPassMeter"><i style="width:'+pct+'%"></i></div><div class="achPassMeta"><span>'+p.done+' / '+p.total+' accomplissements</span><span>'+pct+'%</span></div></div>';}
function html(){return '<div class="srAch139" data-ach-canonical-v139="1" style="width:100%;max-width:100%;min-width:0;box-sizing:border-box;overflow-x:hidden">'+hero()+'<div class="achTabs"><button class="achTab '+(activeTab==='etages'?'on':'')+'" data-ach-tab="etages">Étages</button><button class="achTab '+(activeTab==='defis'?'on':'')+'" data-ach-tab="defis">Défis</button></div>'+(activeTab==='etages'?floorsView():challengesView())+'<div class="achPassNote"><b>Gratuit :</b> toutes les récompenses actuelles restent disponibles. <b>Premium :</b> ajoute un bonus sur chaque jalon sans remplacer la voie gratuite.</div></div>';}
function publishReady(){try{window.dispatchEvent(new CustomEvent('sr:accomplishments-ready'));}catch(_){} }
function reopen(){
 try{
  var ov=document.getElementById('overlay');
  var root=ov&&ov.querySelector('.srAch139');
  var body=root&&(ov.querySelector(':scope > .card > .mbody')||ov.querySelector('.mbody'));
  if(body){body.innerHTML=html();publishReady();return;}
  if(typeof openModal==='function')openModal(html(),'Pass Progression');
 }catch(_){}
}
window.__srAccomplishmentsModalSyncConfigV343={sameModalBodyReplace:true,singleCloseControl:true};
function installInteractions(){
 if(window.__srAccomplishmentsPassInteractionV139)return;window.__srAccomplishmentsPassInteractionV139=true;
 document.addEventListener('click',function(e){
  var t=e.target&&e.target.closest?e.target.closest('[data-ach-tab]'):null;if(t){e.preventDefault();e.stopPropagation();activeTab=t.getAttribute('data-ach-tab')==='defis'?'defis':'etages';reopen();return;}
  var info=e.target&&e.target.closest?e.target.closest('[data-ach-premium-info]'):null;if(info){e.preventDefault();e.stopPropagation();try{if(typeof toast==='function')toast(premiumOwned()?'Pass Premium actif':'Pass Premium · 9,99 €',premiumOwned());}catch(_){}return;}
 },true);
 window.addEventListener('sr:accomplishmentclaimed',reopen);
}
function installProgressEntry(){
 if(window.__srAccomplishmentsProgressEntryV139)return;
 if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.developpement!=='function')return;
 window.__srAccomplishmentsProgressEntryV139=true;
 var oldProgress=SCREENS.developpement;
 SCREENS.developpement=function(){
  var h=oldProgress();
  try{
   var box=document.createElement('div');box.innerHTML=h;
   var pad=box.querySelector('.pad.mt6,.pad.mt8,.pad');
   if(!pad||pad.querySelector('[data-act="accomplishments"]'))return box.innerHTML;
   var entry=document.createElement('div');entry.className='card lit';entry.dataset.act='accomplishments';entry.style.cssText='cursor:pointer;margin-bottom:8px';
   entry.innerHTML='<div class="between"><div><b>Pass Progression</b><div class="mute tiny mt3">Étages, défis et récompenses</div></div><span class="pill">Ouvrir</span></div>';
   pad.insertBefore(entry,pad.firstChild);return box.innerHTML;
  }catch(_){return h;}
 };
}
function install(){
 if(typeof S==='undefined'||typeof ACT==='undefined'||typeof openModal!=='function')return;
 installStyles();
 ACT.accomplishments=function(){openModal(html(),'Pass Progression');};
 installTitleInteraction();installInteractions();installProgressEntry();
 publishReady();
}
install();
})();
