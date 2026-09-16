/* SHADOWREACH · Accomplishments claim reliability v140 · Progression Pass
   Campaign milestone payouts remain inert to Rebirth/PR and mapped Boss-stage
   milestones require that actual Boss clear.
   V326: preserves every free reward and adds a separate modest Premium bonus lane.
   V342: Forge milestones use the approved Gold-only reward ladder.
   V343: Forge Premium lane restored with an additional 50% Gold bonus. */
(function(){
'use strict';
if(window.__srAccomplishmentsClaimV140)return;
window.__srAccomplishmentsClaimV140=true;
var REWARDS={
 forge10:{gold:7500},forge15:{gold:10000},forge20:{gold:20000},forge25:{gold:30000},forge30:{gold:75000},forge35:{gold:100000},forge40:{gold:200000},forge45:{gold:300000},forge50:{gold:500000},
 fusion50:{merge:{COMMUN:15}},fusion150:{merge:{PEU_COMMUN:15}},fusion250:{merge:{RARE:15},boosts:{gold10_30:1}},fusion350:{merge:{RARE:15}},fusion500:{merge:{EPIQUE:20},boosts:{gold10_30:1}},fusion1000:{gold:100000,merge:{MYTHIQUE:20}},fusion1500:{merge:{MYTHIQUE:20},boosts:{gold50_30:1}},
 raid10:{gold:5000},raid20:{merge:{COMMUN:30}},raid50:{merge:{RARE:20},choice:true},raid100:{gold:1500000,eclat:1000,essence:1000,merge:{RARE:50},validatedRaid100:true},
 floor25:{essence:250},floor50:{minerai:2000,gold:5000},floor75:{eclat:500,merge:{COMMUN:30}},floor100:{eclat:500,essence:500,merge:{COMMUN:30}},floor150:{eclat:750,essence:750,merge:{RARE:15}},floor200:{eclat:1000,essence:1000,merge:{RARE:20}},floor250:{eclat:1250,essence:1250,merge:{EPIQUE:10}},floor300:{eclat:1500,essence:1500,merge:{EPIQUE:15}},floor350:{eclat:2000,essence:2000,merge:{MYTHIQUE:10}},floor400:{eclat:2500,essence:2500,merge:{MYTHIQUE:20},universal:1}
};
var PREMIUM_REWARDS={
 forge10:{gold:3750},forge15:{gold:5000},forge20:{gold:10000},forge25:{gold:15000},forge30:{gold:37500},forge35:{gold:50000},forge40:{gold:100000},forge45:{gold:150000},forge50:{gold:250000},
 fusion50:{merge:{COMMUN:5}},fusion150:{merge:{PEU_COMMUN:5}},fusion250:{merge:{RARE:5}},fusion350:{merge:{RARE:5}},fusion500:{merge:{EPIQUE:5}},fusion1000:{gold:25000,merge:{MYTHIQUE:5}},fusion1500:{merge:{MYTHIQUE:5}},
 raid10:{gold:2500},raid20:{merge:{COMMUN:10}},raid50:{merge:{RARE:5},essence:250},raid100:{gold:250000,eclat:250,essence:250,merge:{RARE:10}},
 floor25:{essence:100},floor50:{minerai:750,gold:2500},floor75:{eclat:200,merge:{COMMUN:10}},floor100:{eclat:200,essence:200,merge:{COMMUN:10}},floor150:{eclat:250,essence:250,merge:{RARE:5}},floor200:{eclat:300,essence:300,merge:{RARE:5}},floor250:{eclat:350,essence:350,merge:{EPIQUE:3}},floor300:{eclat:400,essence:400,merge:{EPIQUE:4}},floor350:{eclat:500,essence:500,merge:{MYTHIQUE:3}},floor400:{eclat:750,essence:750,merge:{MYTHIQUE:5}}
};
function fusionCount(){var st=(S&&S.sanctuary)||{},a=(S&&S.accomplishments)||{};return Math.max(0,Math.floor(Number(st.mergeCrafts)||0),Math.floor(Number(st.fusions)||0),Math.floor(Number(a.fusionCount)||0));}
function bossClear(f){return !!(S.bossClears&&S.bossClears[String(f)]);}
var NEED={
 forge10:function(){return Number(S.forge&&S.forge.level)>=10;},forge15:function(){return Number(S.forge&&S.forge.level)>=15;},forge20:function(){return Number(S.forge&&S.forge.level)>=20;},forge25:function(){return Number(S.forge&&S.forge.level)>=25;},forge30:function(){return Number(S.forge&&S.forge.level)>=30;},forge35:function(){return Number(S.forge&&S.forge.level)>=35;},forge40:function(){return Number(S.forge&&S.forge.level)>=40;},forge45:function(){return Number(S.forge&&S.forge.level)>=45;},forge50:function(){return Number(S.forge&&S.forge.level)>=50;},
 fusion50:function(){return fusionCount()>=50;},fusion150:function(){return fusionCount()>=150;},fusion250:function(){return fusionCount()>=250;},fusion350:function(){return fusionCount()>=350;},fusion500:function(){return fusionCount()>=500;},fusion1000:function(){return fusionCount()>=1000;},fusion1500:function(){return fusionCount()>=1500;},
 raid10:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=10;},raid20:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=20;},raid50:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=50;},raid100:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)>=100;},
 floor25:function(){return bossClear(45);},floor50:function(){return bossClear(100);},floor75:function(){return bossClear(145);},floor100:function(){return bossClear(200);},floor150:function(){return bossClear(300);},floor200:function(){return bossClear(400);},floor250:function(){return bossClear(500);},floor300:function(){return bossClear(600);},floor350:function(){return bossClear(700);},floor400:function(){return bossClear(800);}
};
function ensure(s){if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};var a=s.accomplishments;if(!a.claimed||typeof a.claimed!=='object')a.claimed={};if(!a.premiumClaimed||typeof a.premiumClaimed!=='object')a.premiumClaimed={};if(!a.mergePieces||typeof a.mergePieces!=='object')a.mergePieces={};if(!a.choices||typeof a.choices!=='object')a.choices={};return a;}
function premiumOwned(a){return !!(a&&(a.premiumPass||a.premiumPassOwned));}
function grant(s,r,choice){
 if(r.gold)s.gold=(Number(s.gold)||0)+r.gold;if(r.minerai)s.minerai=(Number(s.minerai)||0)+r.minerai;
 if(r.essence)s.essence=(Number(s.essence)||0)+r.essence;if(r.eclat)s.eclat=(Number(s.eclat)||0)+r.eclat;
 if(r.universal)s.universalKeys=(Number(s.universalKeys)||0)+r.universal;
 if(r.raidKey&&s.raids&&s.raids[r.raidKey])s.raids[r.raidKey].keys=(Number(s.raids[r.raidKey].keys)||0)+(r.raidKeyQty||1);
 if(r.accel){if(!s.accels||typeof s.accels!=='object')s.accels={};Object.keys(r.accel).forEach(function(k){s.accels[k]=(Number(s.accels[k])||0)+r.accel[k];});}
 if(r.merge){var a=ensure(s);Object.keys(r.merge).forEach(function(k){a.mergePieces[k]=(Number(a.mergePieces[k])||0)+r.merge[k];});}
 if(r.boosts){if(!s.sanctuary||typeof s.sanctuary!=='object')s.sanctuary={};if(!s.sanctuary.boostItems||typeof s.sanctuary.boostItems!=='object')s.sanctuary.boostItems={};Object.keys(r.boosts).forEach(function(k){s.sanctuary.boostItems[k]=(Number(s.sanctuary.boostItems[k])||0)+(Number(r.boosts[k])||0);});}
 if(choice==='eclat')s.eclat=(Number(s.eclat)||0)+500;if(choice==='essence')s.essence=(Number(s.essence)||0)+500;
 if(r.validatedRaid100)ensure(s).raid100ValidatedV127=true;
}
function refresh(id,premium,choice){try{if(typeof toast==='function')toast(premium?'Bonus Premium reçu !':'Récompense reçue !',true);}catch(_){}try{window.dispatchEvent(new CustomEvent('sr:accomplishmentclaimed',{detail:{id:id,choice:choice||'',premium:!!premium}}));}catch(_){}try{if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();}catch(_){} }
function claim(id,choice){if(typeof S==='undefined'||!S||!REWARDS[id]||!NEED[id]||!NEED[id]())return false;var a=ensure(S),r=REWARDS[id];if(a.claimed[id])return false;if(r.choice&&choice!=='eclat'&&choice!=='essence')return false;if(typeof update==='function'){update(function(s){var x=ensure(s);if(x.claimed[id])return;var st=s.sanctuary||{};x.fusionCount=Math.max(Number(x.fusionCount)||0,Number(st.mergeCrafts)||0,Number(st.fusions)||0);grant(s,r,choice);x.claimed[id]=true;if(choice)x.choices[id]=choice;});}else{a.fusionCount=Math.max(Number(a.fusionCount)||0,Number(S.sanctuary&&S.sanctuary.mergeCrafts)||0,Number(S.sanctuary&&S.sanctuary.fusions)||0);grant(S,r,choice);a.claimed[id]=true;if(choice)a.choices[id]=choice;try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}refresh(id,false,choice);return true;}
function claimPremium(id){
 if(typeof S==='undefined'||!S||!PREMIUM_REWARDS[id]||!NEED[id]||!NEED[id]())return false;
 var a=ensure(S),r=PREMIUM_REWARDS[id];if(!premiumOwned(a)||a.premiumClaimed[id])return false;
 if(typeof update==='function'){
  var granted=false;update(function(s){var x=ensure(s);if(!premiumOwned(x)||x.premiumClaimed[id])return;var st=s.sanctuary||{};x.fusionCount=Math.max(Number(x.fusionCount)||0,Number(st.mergeCrafts)||0,Number(st.fusions)||0);grant(s,r,'');x.premiumClaimed[id]=true;granted=true;});if(!granted)return false;
 }else{
  grant(S,r,'');a.premiumClaimed[id]=true;try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
 }
 refresh(id,true,'');return true;
}
window.__srClaimPremiumAccomplishmentV140=claimPremium;
function retireLegacyForgeCompensation(){try{if(typeof S==='undefined'||!S)return;var a=ensure(S);if(a.forgeRewardBalanceV200Processed)return;function migrate(s){var x=ensure(s);if(x.forgeRewardBalanceV200Processed)return;x.forgeRewardBalanceV200Processed=true;x.forgeRewardBalanceV200Paid=[];x.forgeRewardBalanceV200At=Date.now();}if(typeof update==='function')update(migrate);else{migrate(S);try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}}catch(_){}}
retireLegacyForgeCompensation();setTimeout(retireLegacyForgeCompensation,300);setTimeout(retireLegacyForgeCompensation,1200);
document.addEventListener('click',function(e){
 var p=e.target&&e.target.closest?e.target.closest('.srAch139 [data-ach-premium]'):null;
 if(p){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();claimPremium(String(p.getAttribute('data-ach-premium')||''));return;}
 var b=e.target&&e.target.closest?e.target.closest('.srAch139 [data-ach]'):null;if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();claim(String(b.getAttribute('data-ach')||''),String(b.getAttribute('data-ach-choice')||''));
},true);
})();