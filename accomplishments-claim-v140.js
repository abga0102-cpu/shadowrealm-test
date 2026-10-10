/* SHADOWREACH · Accomplishments claim reliability v140 · Progression Pass
   Campaign milestone payouts remain inert to Rebirth/PR and mapped Boss-stage
   milestones require that actual Boss clear.
   V326: preserves every free reward and adds a separate modest Premium bonus lane.
   V342: Forge milestones use the approved Gold-only reward ladder.
   V343: Raid milestones use the approved Gold-only ladder and UI copy.
   V494: adds character-level Minerai milestones with a separate +25% Premium lane. */
(function(){
'use strict';
if(window.__srAccomplishmentsClaimV140)return;
window.__srAccomplishmentsClaimV140=true;window.__srFusionClaimBuild='511:5000/10000';
var LEVEL_STEPS=[[10,250],[15,350],[20,500],[25,700],[30,1000],[35,1200],[40,1500],[50,2000],[60,2500],[70,3000],[80,3500],[90,4000],[100,5000]];
var REWARDS={
 forge10:{gold:7500},forge15:{gold:10000},forge20:{gold:20000},forge25:{gold:30000},forge30:{gold:75000},forge35:{gold:100000},forge40:{gold:200000},forge45:{gold:300000},forge50:{gold:500000},
 fusion50:{minerai:500},fusion150:{minerai:750},fusion250:{minerai:1000},fusion350:{minerai:1500},fusion500:{minerai:2000},fusion1000:{minerai:5000},fusion1500:{minerai:10000},
 raid10:{gold:5000},raid20:{gold:15000},raid50:{gold:50000},raid150:{gold:250000,validatedRaid100:true},
 floor25:{essence:250},floor50:{minerai:2000,gold:5000},floor75:{gold:50000,eclat:500,merge:{COMMUN:30}},floor100:{gold:100000,eclat:500,essence:500,merge:{COMMUN:30}},floor150:{gold:150000,eclat:750,essence:750,merge:{RARE:15}},floor200:{eclat:1000,essence:1000,merge:{RARE:20}},floor250:{eclat:1250,essence:1250,merge:{EPIQUE:10}},floor300:{eclat:1500,essence:1500,merge:{EPIQUE:15}},floor350:{eclat:2000,essence:2000,merge:{MYTHIQUE:10}},floor400:{eclat:2500,essence:2500,merge:{MYTHIQUE:20},universal:1}
};
var PREMIUM_REWARDS={
 fusion50:{gold:10000},fusion150:{gold:20000},fusion250:{gold:30000},fusion350:{gold:40000},fusion500:{gold:60000},fusion1000:{gold:120000},fusion1500:{gold:200000},
 raid10:{gold:2500},raid20:{gold:5000},raid50:{gold:25000},raid150:{gold:75000},
 floor25:{essence:100},floor50:{minerai:750,gold:2500},floor75:{eclat:200,merge:{COMMUN:10}},floor100:{eclat:200,essence:200,merge:{COMMUN:10}},floor150:{eclat:250,essence:250,merge:{RARE:5}},floor200:{eclat:300,essence:300,merge:{RARE:5}},floor250:{eclat:350,essence:350,merge:{EPIQUE:3}},floor300:{eclat:400,essence:400,merge:{EPIQUE:4}},floor350:{eclat:500,essence:500,merge:{MYTHIQUE:3}},floor400:{eclat:750,essence:750,merge:{MYTHIQUE:5}}
};
LEVEL_STEPS.forEach(function(row){var id='heroLevel'+row[0];REWARDS[id]={minerai:row[1]};PREMIUM_REWARDS[id]={minerai:Math.round(row[1]*0.25)};});
function fusionCount(){var st=(S&&S.sanctuary)||{},a=(S&&S.accomplishments)||{};return Math.max(0,Math.floor(Number(st.mergeCrafts)||0),Math.floor(Number(st.fusions)||0),Math.floor(Number(a.fusionCount)||0));}
function bossClear(f){return !!(S.bossClears&&S.bossClears[String(f)]);}
var NEED={
 forge10:function(){return Number(S.forge&&S.forge.level)>=10;},forge15:function(){return Number(S.forge&&S.forge.level)>=15;},forge20:function(){return Number(S.forge&&S.forge.level)>=20;},forge25:function(){return Number(S.forge&&S.forge.level)>=25;},forge30:function(){return Number(S.forge&&S.forge.level)>=30;},forge35:function(){return Number(S.forge&&S.forge.level)>=35;},forge40:function(){return Number(S.forge&&S.forge.level)>=40;},forge45:function(){return Number(S.forge&&S.forge.level)>=45;},forge50:function(){return Number(S.forge&&S.forge.level)>=50;},
 fusion50:function(){return fusionCount()>=50;},fusion150:function(){return fusionCount()>=150;},fusion250:function(){return fusionCount()>=250;},fusion350:function(){return fusionCount()>=350;},fusion500:function(){return fusionCount()>=500;},fusion1000:function(){return fusionCount()>=1000;},fusion1500:function(){return fusionCount()>=1500;},
 raid10:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=10;},raid20:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=20;},raid50:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=50;},raid150:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=100;},
 floor25:function(){return bossClear(45);},floor50:function(){return bossClear(100);},floor75:function(){return bossClear(145);},floor100:function(){return bossClear(200);},floor150:function(){return bossClear(300);},floor200:function(){return bossClear(400);},floor250:function(){return bossClear(500);},floor300:function(){return bossClear(600);},floor350:function(){return bossClear(700);},floor400:function(){return bossClear(800);}
};
LEVEL_STEPS.forEach(function(row){NEED['heroLevel'+row[0]]=function(){return Number(S&&S.level)>=row[0];};});
function ensure(s){if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};var a=s.accomplishments;if(!a.claimed||typeof a.claimed!=='object')a.claimed={};if(!a.premiumClaimed||typeof a.premiumClaimed!=='object')a.premiumClaimed={};if(!a.mergePieces||typeof a.mergePieces!=='object')a.mergePieces={};if(!a.choices||typeof a.choices!=='object')a.choices={};return a;}
function premiumOwned(a){return !!(a&&(a.premiumPass||a.premiumPassOwned));}
function grant(s,r,choice){if(r.gold)s.gold=(Number(s.gold)||0)+r.gold;if(r.minerai)s.minerai=(Number(s.minerai)||0)+r.minerai;if(r.essence)s.essence=(Number(s.essence)||0)+r.essence;if(r.eclat)s.eclat=(Number(s.eclat)||0)+r.eclat;if(r.universal)s.universalKeys=(Number(s.universalKeys)||0)+r.universal;if(r.raidKey&&s.raids&&s.raids[r.raidKey])s.raids[r.raidKey].keys=(Number(s.raids[r.raidKey].keys)||0)+(r.raidKeyQty||1);if(r.accel){if(!s.accels||typeof s.accels!=='object')s.accels={};Object.keys(r.accel).forEach(function(k){s.accels[k]=(Number(s.accels[k])||0)+r.accel[k];});}if(r.merge){var a=ensure(s);Object.keys(r.merge).forEach(function(k){a.mergePieces[k]=(Number(a.mergePieces[k])||0)+r.merge[k];});}if(r.boosts){if(!s.sanctuary||typeof s.sanctuary!=='object')s.sanctuary={};if(!s.sanctuary.boostItems||typeof s.sanctuary.boostItems!=='object')s.sanctuary.boostItems={};Object.keys(r.boosts).forEach(function(k){s.sanctuary.boostItems[k]=(Number(s.sanctuary.boostItems[k])||0)+(Number(r.boosts[k])||0);});}if(r.choice&&choice==='eclat')s.eclat=(Number(s.eclat)||0)+500;if(r.choice&&choice==='essence')s.essence=(Number(s.essence)||0)+500;if(r.validatedRaid100)ensure(s).raid150ValidatedV127=true;}
function refresh(id,premium,choice){try{if(typeof toast==='function')toast(premium?'Bonus Premium reçu !':'Récompense reçue !',true);}catch(_){}try{window.dispatchEvent(new CustomEvent('sr:accomplishmentclaimed',{detail:{id:id,choice:choice||'',premium:!!premium}}));}catch(_){}try{if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();}catch(_){}setTimeout(renderLevelAccomplishments,0);}
function claim(id,choice){if(typeof S==='undefined'||!S||!REWARDS[id]||!NEED[id]||!NEED[id]())return false;var a=ensure(S),r=REWARDS[id];if(a.claimed[id])return false;if(r.choice&&choice!=='eclat'&&choice!=='essence')return false;if(typeof update==='function'){update(function(s){var x=ensure(s);if(x.claimed[id])return;var st=s.sanctuary||{};x.fusionCount=Math.max(Number(x.fusionCount)||0,Number(st.mergeCrafts)||0,Number(st.fusions)||0);grant(s,r,r.choice?choice:'');x.claimed[id]=true;if(r.choice&&choice)x.choices[id]=choice;});}else{a.fusionCount=Math.max(Number(a.fusionCount)||0,Number(S.sanctuary&&S.sanctuary.mergeCrafts)||0,Number(S.sanctuary&&S.sanctuary.fusions)||0);grant(S,r,r.choice?choice:'');a.claimed[id]=true;if(r.choice&&choice)a.choices[id]=choice;try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}refresh(id,false,r.choice?choice:'');return true;}
function claimPremium(id){if(typeof S==='undefined'||!S||!PREMIUM_REWARDS[id]||!NEED[id]||!NEED[id]())return false;var a=ensure(S),r=PREMIUM_REWARDS[id];if(!premiumOwned(a)||a.premiumClaimed[id])return false;if(typeof update==='function'){var granted=false;update(function(s){var x=ensure(s);if(!premiumOwned(x)||x.premiumClaimed[id])return;var st=s.sanctuary||{};x.fusionCount=Math.max(Number(x.fusionCount)||0,Number(st.mergeCrafts)||0,Number(st.fusions)||0);grant(s,r,'');x.premiumClaimed[id]=true;granted=true;});if(!granted)return false;}else{grant(S,r,'');a.premiumClaimed[id]=true;try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}refresh(id,true,'');return true;}
window.__srClaimPremiumAccomplishmentV140=claimPremium;
function retireLegacyForgeCompensation(){try{if(typeof S==='undefined'||!S)return;var a=ensure(S);if(a.forgeRewardBalanceV200Processed)return;function migrate(s){var x=ensure(s);if(x.forgeRewardBalanceV200Processed)return;x.forgeRewardBalanceV200Processed=true;x.forgeRewardBalanceV200Paid=[];x.forgeRewardBalanceV200At=Date.now();}if(typeof update==='function')update(migrate);else{migrate(S);try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}}catch(_){}}
/* V515: one-time recovery for previously claimed 1000-fusion reward whose
   legacy claim could have paid gold despite the mineral label.
   This never reopens the claim and never changes its gold balance. */
function recoverFusion1000Minerals515(){
 try{
  if(typeof S==='undefined'||!S)return;
  function apply(st){
   var a=ensure(st);
   if(a.fusion1000MineralRecoveryV515Done)return;
   if(!a.claimed.fusion1000)return;
   st.minerai=(Number(st.minerai)||0)+5000;
   a.fusion1000MineralRecoveryV515Done=true;
   a.fusion1000MineralRecoveryV515At=Date.now();
  }
  if(typeof update==='function')update(apply);
  else if(S.accomplishments&&S.accomplishments.claimed&&S.accomplishments.claimed.fusion1000&&!S.accomplishments.fusion1000MineralRecoveryV515Done){
   apply(S);try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
  }
 }catch(e){console.warn('Fusion 1000 recovery V515',e);}
}
recoverFusion1000Minerals515();
setTimeout(recoverFusion1000Minerals515,800);
/* V527: recover the 10,000 minerals promised for 1,500 fusions
   in saves where the milestone was claimed before the payout fix.
   One-time per save, never subtract gold or reset the claim. */
function recoverFusion1500Minerals527(){
 try{
  if(typeof S==='undefined'||!S||!S.accomplishments)return;
  var a=ensure(S);
  if(!a.claimed.fusion1500||a.fusion1500MineralRecoveryV527Done)return;
  var changed=false;
  function apply(st){
   var x=ensure(st);
   if(!x.claimed.fusion1500||x.fusion1500MineralRecoveryV527Done)return;
   st.minerai=Math.max(0,Number(st.minerai)||0)+10000;
   x.fusion1500MineralRecoveryV527Done=true;
   x.fusion1500MineralRecoveryV527At=Date.now();
   changed=true;
  }
  if(typeof update==='function')update(apply);
  else{apply(S);if(changed){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}}
  if(changed&&typeof toast==='function')toast('Correction 1 500 fusions : +10 000 minéraux',true);
 }catch(e){console.warn('Fusion 1500 recovery V527',e);}
}
recoverFusion1500Minerals527();
setTimeout(recoverFusion1500Minerals527,900);
/* V528: voluntary correction of the legacy 1,500 fusion gold payout.
   Never auto-debit: the 200,000 gold was the old PREMIUM lane, not proof
   of a free-lane payment. Player must confirm exact amount explicitly. */
function correctFusion1500Gold528(){
 try{
  if(typeof S==='undefined'||!S)return;
  var a=ensure(S);
  if(!a.claimed.fusion1500||a.fusion1500GoldCorrectionV528Done)return;
  var raw=window.prompt('Combien d’or as-tu reçu par erreur pour les 1 500 fusions ? Saisis uniquement le montant exact (aucun retrait sans confirmation).','');
  if(raw===null)return;
  var amount=Number(String(raw).replace(/\\s/g,''));
  if(!Number.isSafeInteger(amount)||amount<=0||amount>1000000){if(typeof toast==='function')toast('Montant invalide');return;}
  if(Number(S.gold||0)<amount){if(typeof toast==='function')toast('Solde d’or insuffisant : aucun retrait effectué');return;}
  if(!window.confirm('Confirmer le retrait de '+amount.toLocaleString('fr-FR')+' or ? Les 10 000 minéraux restent acquis.'))return;
  var done=false;
  function apply(st){var x=ensure(st);if(!x.claimed.fusion1500||x.fusion1500GoldCorrectionV528Done||Number(st.gold||0)<amount)return;st.gold=Number(st.gold||0)-amount;x.fusion1500GoldCorrectionV528Done=true;x.fusion1500GoldCorrectionV528Amount=amount;x.fusion1500GoldCorrectionV528At=Date.now();done=true;}
  if(typeof update==='function')update(apply);else{apply(S);if(done){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}}
  if(done){if(typeof toast==='function')toast('Correction : -'+amount.toLocaleString('fr-FR')+' or',true);if(typeof scheduleRender==='function')scheduleRender();}
 }catch(e){console.warn('Fusion 1500 gold correction V528',e);}
}
function renderFusion1500Gold528(){
 try{
  var root=document.querySelector('.srAch139');if(!root||typeof S==='undefined'||!S)return;
  var a=ensure(S),old=root.querySelector('#srFusionGoldCorrection528');
  if(!a.claimed.fusion1500||a.fusion1500GoldCorrectionV528Done){if(old)old.remove();return;}
  if(old)return;
  var box=document.createElement('div');box.id='srFusionGoldCorrection528';
  box.style.cssText='margin:12px 0;padding:12px;border:1px solid #b58d4c;border-radius:12px;background:#172638;color:#f7e2b2';
  box.innerHTML='<b>Correction · 1 500 fusions</b><p style="font-size:12px;line-height:1.45">Les 10 000 minéraux sont conservés. Si tu as reçu de l’or à la place, indique le montant exact pour le retirer volontairement. Aucun or ne sera retiré automatiquement.</p><button type="button" class="btn sm" data-sr-fusion-gold-correct-528="1" style="width:100%;min-height:42px">Corriger l’or reçu par erreur</button>';
  root.appendChild(box);
 }catch(e){console.warn('Fusion 1500 correction UI V528',e);}
}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-sr-fusion-gold-correct-528]'):null;if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();correctFusion1500Gold528();},true);
if(typeof MutationObserver==='function'&&document.body){
 var queued528=false;new MutationObserver(function(){if(queued528)return;queued528=true;requestAnimationFrame(function(){queued528=false;renderFusion1500Gold528();});}).observe(document.body,{childList:true,subtree:true});
}
setTimeout(renderFusion1500Gold528,300);
/* V516: voluntary, idempotent correction of the erroneous 600k gold.
   Never debit other players automatically. */
function renderFusionGoldCorrection516(){
 try{
  var root=document.querySelector('.srAch139');
  if(!root||typeof S==='undefined'||!S)return;
  var a=ensure(S),old=root.querySelector('#srFusionGoldCorrection516');
  if(!a.claimed.fusion1000||a.fusion1000GoldCorrectionV516Done){if(old)old.remove();return;}
  if(old||root.querySelector('[data-sr-fusion-gold-correct-516]'))return;
  var box=document.createElement('div');box.id='srFusionGoldCorrection516';
  box.style.cssText='margin:12px 0;padding:12px;border:1px solid #b58d4c;border-radius:12px;background:#172638;color:#f7e2b2';
  box.innerHTML='<b>Correction de récompense · 1 000 fusions</b><p style="font-size:12px;line-height:1.45">Si tu as reçu 600 000 or par erreur, tu peux les retirer volontairement. Les 5 000 minéraux sont gérés séparément par la V515. Cette action est définitive et ne peut être effectuée qu’une fois.</p><button type="button" class="btn sm" data-sr-fusion-gold-correct-516="1" style="width:100%;min-height:42px">Retirer les 600 000 or reçus par erreur</button>';
  root.appendChild(box);
 }catch(e){console.warn('Fusion gold correction UI V516',e);}
}
function correctFusionGold516(){
 try{
  if(typeof S==='undefined'||!S)return;
  var a=ensure(S);
  if(!a.claimed.fusion1000||a.fusion1000GoldCorrectionV516Done)return;
  if(Number(S.gold||0)<600000){if(typeof toast==='function')toast('Il faut disposer de 600 000 or pour effectuer cette correction.');return;}
  var accepted=typeof window.confirm==='function'&&window.confirm('Retirer définitivement 600 000 or de ta sauvegarde pour corriger la récompense des 1 000 fusions ?');
  if(!accepted)return;
  var success=false;
  function apply(st){var x=ensure(st);if(!x.claimed.fusion1000||x.fusion1000GoldCorrectionV516Done||Number(st.gold||0)<600000)return;st.gold=Number(st.gold||0)-600000;x.fusion1000GoldCorrectionV516Done=true;x.fusion1000GoldCorrectionV516At=Date.now();success=true;}
  if(typeof update==='function')update(apply);
  else{apply(S);if(success){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}}
  if(success){if(typeof toast==='function')toast('Correction effectuée : −600 000 or',true);renderFusionGoldCorrection516();if(typeof scheduleRender==='function')scheduleRender();}
 }catch(e){console.warn('Fusion gold correction V516',e);}
}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-sr-fusion-gold-correct-516]'):null;if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();correctFusionGold516();},true);
if(typeof MutationObserver==='function'&&document.body){
 var pending516=false;var observer516=new MutationObserver(function(){if(pending516)return;pending516=true;requestAnimationFrame(function(){pending516=false;renderFusionGoldCorrection516();});});
 observer516.observe(document.body,{childList:true,subtree:true});
}
setTimeout(renderFusionGoldCorrection516,100);
retireLegacyForgeCompensation();setTimeout(retireLegacyForgeCompensation,300);setTimeout(retireLegacyForgeCompensation,1200);
document.addEventListener('click',function(e){var p=e.target&&e.target.closest?e.target.closest('.srAch139 [data-ach-premium]'):null;if(p){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();claimPremium(String(p.getAttribute('data-ach-premium')||''));return;}var b=e.target&&e.target.closest?e.target.closest('.srAch139 [data-ach]'):null;if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();claim(String(b.getAttribute('data-ach')||''),String(b.getAttribute('data-ach-choice')||''));},true);
var RAID_UI={'20 Raids accomplis':{free:'15 000 Or',premium:'5 000 Or',id:'raid20'},'50 Raids accomplis':{free:'50 000 Or',premium:'25 000 Or',id:'raid50'},'100 Raids accomplis':{free:'250 000 Or',premium:'75 000 Or',id:'raid150'}};
function patchRaidRewardUI(){try{var root=document.querySelector('.srAch139');if(!root)return;var rows=root.querySelectorAll('.achPassRow');for(var i=0;i<rows.length;i++){var row=rows[i],title=row.querySelector('.achObjective b');if(!title)continue;var cfg=RAID_UI[String(title.textContent||'').trim()];if(!cfg)continue;var rewards=row.querySelectorAll('.achReward');if(rewards[0]){var ft=rewards[0].querySelector('.achRewardText');if(ft&&ft.textContent!==cfg.free)ft.textContent=cfg.free;}if(rewards[1]){var pt=rewards[1].querySelector('.achRewardText');if(pt&&pt.textContent!==cfg.premium)pt.textContent=cfg.premium;}if(cfg.id==='raid50'&&rewards[0]){var choiceBtn=rewards[0].querySelector('[data-ach="raid50"][data-ach-choice]');if(choiceBtn&&choiceBtn.parentElement){choiceBtn.parentElement.outerHTML='<button class="btn sm" data-ach="raid50" data-primary="true">Récupérer</button>';}}}}catch(_){}}
function levelFmt(v){try{return typeof fmt==='function'?fmt(v):Number(v).toLocaleString('fr-FR');}catch(_){return String(v);}}
function levelButton(id,lv,premium,done,owned,already){if(already)return '<span class="pill" style="color:#6ee7a0;border-color:#3fb950">✓ Reçu</span>';if(premium&&!owned)return '<span class="pill" style="opacity:.65">Premium</span>';if(!done)return '<span class="pill" style="opacity:.55">Niv. '+lv+'</span>';return '<button class="btn sm '+(premium?'gold':'blue')+'" '+(premium?'data-ach-premium':'data-ach')+'="'+id+'">Récupérer</button>';}
function renderLevelAccomplishments(){try{if(typeof S==='undefined'||!S)return;var root=document.querySelector('.srAch139[data-ach-canonical-v139="1"]');if(!root)return;if(root.querySelector('#srHeroLevelAccomplishmentsV494'))return;var a=ensure(S),owned=premiumOwned(a),lv=Math.max(1,Math.floor(Number(S.level)||1));var html='<div id="srHeroLevelAccomplishmentsV494" style="margin-top:14px"><div class="achCatTitle"><span class="achCatIcon466" aria-hidden="true">♛</span><span>Niveau personnage</span><span class="achCategorySummary">'+Math.min(lv,100)+' / 100</span></div><div class="achLaneHead"><span>PALIER</span><span>GRATUIT</span><span>PREMIUM +25%</span></div>';LEVEL_STEPS.forEach(function(row){var target=row[0],free=row[1],premium=Math.round(free*0.25),id='heroLevel'+target,done=lv>=target;html+='<div class="achPassRow" data-ach-level-row-v494="'+target+'"><div class="achObjective"><b>Niveau personnage '+target+'</b><div class="achProgressText">'+(done?'Objectif atteint':Math.min(lv,target)+' / '+target)+'</div></div><div class="achReward"><div class="achRewardText">'+levelFmt(free)+' Minéraux</div>'+levelButton(id,target,false,done,owned,!!a.claimed[id])+'</div><div class="achReward premium"><div class="achRewardText">+'+levelFmt(premium)+' Minéraux · 25%</div>'+levelButton(id,target,true,done,owned,!!a.premiumClaimed[id])+'</div></div>';});html+='</div>';var holder=document.createElement('div');holder.innerHTML=html;var node=holder.firstElementChild;if(node)root.appendChild(node);}catch(_){}}
try{patchRaidRewardUI();renderLevelAccomplishments();if(typeof MutationObserver==='function'&&document.body){var raidObserver=new MutationObserver(function(){patchRaidRewardUI();if(!document.getElementById('srHeroLevelAccomplishmentsV494'))renderLevelAccomplishments();});raidObserver.observe(document.body,{childList:true,subtree:true});}document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('[data-ach-tab]'))setTimeout(function(){patchRaidRewardUI();renderLevelAccomplishments();},0);},true);window.addEventListener('sr:accomplishments-ready',function(){patchRaidRewardUI();renderLevelAccomplishments();});setTimeout(function(){patchRaidRewardUI();renderLevelAccomplishments();},200);setTimeout(function(){patchRaidRewardUI();renderLevelAccomplishments();},900);}catch(_){}
window.__srCharacterLevelAccomplishmentsConfigV494={version:494,steps:LEVEL_STEPS.slice(),premiumRatio:0.25,levelSource:'S.level'};
})();