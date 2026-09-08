/* SHADOWREACH · Accomplishments claim reliability v140 · Fusion milestones V202
   Reliable claims, Forge V200 compensation and retroactive Sanctuary fusion milestones. */
(function(){
'use strict';
if(window.__srAccomplishmentsClaimV140)return;
window.__srAccomplishmentsClaimV140=true;
var REWARDS={
 forge5:{gold:5000},forge10:{gold:10000},forge15:{merge:{COMMUN:15}},forge20:{merge:{PEU_COMMUN:15}},forge30:{gold:50000,merge:{PEU_COMMUN:20}},forge35:{raidKey:'minerai',raidKeyQty:2,merge:{RARE:25}},forge40:{gold:100000,merge:{RARE:20}},forge50:{raidKey:'minerai',raidKeyQty:2,merge:{EPIQUE:25}},
 rb5:{accel:{a5:2}},rb15:{accel:{a5:5}},rb30:{merge:{COMMUN:30}},rb50:{accel:{a10:5},merge:{PEU_COMMUN:20}},rb100:{universal:1,merge:{RARE:20},essence:500,eclat:500},
 fusion50:{merge:{COMMUN:15}},fusion150:{merge:{PEU_COMMUN:15}},fusion250:{merge:{RARE:15},boosts:{gold10_30:1}},fusion350:{merge:{RARE:15}},fusion500:{merge:{EPIQUE:20},boosts:{gold10_30:1}},fusion1000:{gold:100000,merge:{MYTHIQUE:20}},fusion1500:{merge:{MYTHIQUE:20},boosts:{gold50_30:1}},
 raid10:{gold:5000},raid20:{merge:{COMMUN:30}},raid50:{merge:{RARE:20},choice:true},raid100:{gold:1500000,eclat:1000,essence:1000,merge:{RARE:50},validatedRaid100:true},
 floor25:{essence:250},floor50:{minerai:2000,gold:5000},floor75:{pr:1000,merge:{COMMUN:30}},floor100:{eclat:500,essence:500,merge:{COMMUN:30}}
};
function fusionCount(){var st=(S&&S.sanctuary)||{},a=(S&&S.accomplishments)||{};return Math.max(0,Math.floor(Number(st.mergeCrafts)||0),Math.floor(Number(st.fusions)||0),Math.floor(Number(a.fusionCount)||0));}
var NEED={
 forge5:function(){return Number(S.forge&&S.forge.level)>=5;},forge10:function(){return Number(S.forge&&S.forge.level)>=10;},forge15:function(){return Number(S.forge&&S.forge.level)>=15;},forge20:function(){return Number(S.forge&&S.forge.level)>=20;},forge30:function(){return Number(S.forge&&S.forge.level)>=30;},forge35:function(){return Number(S.forge&&S.forge.level)>=35;},forge40:function(){return Number(S.forge&&S.forge.level)>=40;},forge50:function(){return Number(S.forge&&S.forge.level)>=50;},
 rb5:function(){return Number(S.rebirth&&S.rebirth.count)>=5;},rb15:function(){return Number(S.rebirth&&S.rebirth.count)>=15;},rb30:function(){return Number(S.rebirth&&S.rebirth.count)>=30;},rb50:function(){return Number(S.rebirth&&S.rebirth.count)>=50;},rb100:function(){return Number(S.rebirth&&S.rebirth.count)>=100;},
 fusion50:function(){return fusionCount()>=50;},fusion150:function(){return fusionCount()>=150;},fusion250:function(){return fusionCount()>=250;},fusion350:function(){return fusionCount()>=350;},fusion500:function(){return fusionCount()>=500;},fusion1000:function(){return fusionCount()>=1000;},fusion1500:function(){return fusionCount()>=1500;},
 raid10:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=10;},raid20:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=20;},raid50:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=50;},raid100:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=100;},
 floor25:function(){return Number(S.recordFloor)>=25;},floor50:function(){return Number(S.recordFloor)>=50;},floor75:function(){return Number(S.recordFloor)>=75;},floor100:function(){return Number(S.recordFloor)>=100;}
};
function ensure(s){if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};var a=s.accomplishments;if(!a.claimed||typeof a.claimed!=='object')a.claimed={};if(!a.mergePieces||typeof a.mergePieces!=='object')a.mergePieces={};if(!a.choices||typeof a.choices!=='object')a.choices={};return a;}
function grant(s,r,choice){
 if(r.gold)s.gold=(Number(s.gold)||0)+r.gold;if(r.minerai)s.minerai=(Number(s.minerai)||0)+r.minerai;
 if(r.pr){if(!s.rebirth||typeof s.rebirth!=='object')s.rebirth={};s.rebirth.pr=(Number(s.rebirth.pr)||0)+r.pr;}
 if(r.essence)s.essence=(Number(s.essence)||0)+r.essence;if(r.eclat)s.eclat=(Number(s.eclat)||0)+r.eclat;
 if(r.universal)s.universalKeys=(Number(s.universalKeys)||0)+r.universal;
 if(r.raidKey&&s.raids&&s.raids[r.raidKey])s.raids[r.raidKey].keys=(Number(s.raids[r.raidKey].keys)||0)+(r.raidKeyQty||1);
 if(r.accel){if(!s.accels||typeof s.accels!=='object')s.accels={};Object.keys(r.accel).forEach(function(k){s.accels[k]=(Number(s.accels[k])||0)+r.accel[k];});}
 if(r.merge){var a=ensure(s);Object.keys(r.merge).forEach(function(k){a.mergePieces[k]=(Number(a.mergePieces[k])||0)+r.merge[k];});}
 if(r.boosts){if(!s.sanctuary||typeof s.sanctuary!=='object')s.sanctuary={};if(!s.sanctuary.boostItems||typeof s.sanctuary.boostItems!=='object')s.sanctuary.boostItems={};Object.keys(r.boosts).forEach(function(k){s.sanctuary.boostItems[k]=(Number(s.sanctuary.boostItems[k])||0)+(Number(r.boosts[k])||0);});}
 if(choice==='eclat')s.eclat=(Number(s.eclat)||0)+500;if(choice==='essence')s.essence=(Number(s.essence)||0)+500;
 if(r.validatedRaid100)ensure(s).raid100ValidatedV127=true;
}
function claim(id,choice){if(typeof S==='undefined'||!S||!REWARDS[id]||!NEED[id]||!NEED[id]())return false;var a=ensure(S),r=REWARDS[id];if(a.claimed[id])return false;if(r.choice&&choice!=='eclat'&&choice!=='essence')return false;if(typeof update==='function'){update(function(s){var x=ensure(s);if(x.claimed[id])return;var st=s.sanctuary||{};x.fusionCount=Math.max(Number(x.fusionCount)||0,Number(st.mergeCrafts)||0,Number(st.fusions)||0);grant(s,r,choice);x.claimed[id]=true;if(choice)x.choices[id]=choice;});}else{a.fusionCount=Math.max(Number(a.fusionCount)||0,Number(S.sanctuary&&S.sanctuary.mergeCrafts)||0,Number(S.sanctuary&&S.sanctuary.fusions)||0);grant(S,r,choice);a.claimed[id]=true;if(choice)a.choices[id]=choice;try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}try{if(typeof toast==='function')toast('Récompense reçue !',true);}catch(_){}try{if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();}catch(_){}return true;}
function compensateLegacyForge(){try{if(typeof S==='undefined'||!S)return;var a=ensure(S);if(a.forgeRewardBalanceV200Processed)return;var paid=[];function addMerge(s,r,q){var x=ensure(s);x.mergePieces[r]=(Number(x.mergePieces[r])||0)+q;}function migrate(s){var x=ensure(s);if(x.forgeRewardBalanceV200Processed)return;if(x.claimed.forge20){addMerge(s,'PEU_COMMUN',15);paid.push('Forge 20');}if(x.claimed.forge30){addMerge(s,'PEU_COMMUN',20);paid.push('Forge 30');}if(x.claimed.forge35){addMerge(s,'RARE',25);if(s.raids&&s.raids.minerai)s.raids.minerai.keys=(Number(s.raids.minerai.keys)||0)+1;paid.push('Forge 35');}if(x.claimed.forge40){addMerge(s,'RARE',20);paid.push('Forge 40');}if(x.claimed.forge50){addMerge(s,'EPIQUE',25);paid.push('Forge 50');}x.forgeRewardBalanceV200Processed=true;x.forgeRewardBalanceV200Paid=paid.slice();x.forgeRewardBalanceV200At=Date.now();}if(typeof update==='function')update(migrate);else{migrate(S);try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}if(paid.length){try{if(typeof toast==='function')toast('Compensation Forge reçue : '+paid.join(', '),true);}catch(_){}}}catch(_){}}
compensateLegacyForge();setTimeout(compensateLegacyForge,300);setTimeout(compensateLegacyForge,1200);
document.addEventListener('click',function(e){var b=e.target&&e.target.closest('.srAch139 [data-ach]'):null;if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();claim(String(b.getAttribute('data-ach')||''),String(b.getAttribute('data-ach-choice')||''));},true);
})();