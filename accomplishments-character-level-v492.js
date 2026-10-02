/* SHADOWREACH · V492 · Accomplissements de niveau du Héros
   Ajoute 13 paliers de niveau personnage avec récompenses Minéraux.
   Premium = bonus séparé exactement égal à 25% de la récompense gratuite.
   Réutilise accomplishments.claimed / premiumClaimed pour rester compatible sauvegarde. */
(function(){
'use strict';
if(window.__srCharacterLevelAccomplishmentsV492)return;
window.__srCharacterLevelAccomplishmentsV492=true;
var STEPS=[
 [10,250],[15,350],[20,500],[25,700],[30,1000],[35,1200],[40,1500],
 [50,2000],[60,2500],[70,3000],[80,3500],[90,4000],[100,5000]
];
function id(lv){return 'heroLevel'+lv;}
function n(v){return Math.max(0,Number(v)||0);}
function heroLevel(){return Math.max(1,Math.floor(n(typeof S!=='undefined'&&S?S.level:1)));}
function ensure(s){
 if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
 var a=s.accomplishments;
 if(!a.claimed||typeof a.claimed!=='object')a.claimed={};
 if(!a.premiumClaimed||typeof a.premiumClaimed!=='object')a.premiumClaimed={};
 return a;
}
function premiumOwned(a){return !!(a&&(a.premiumPass||a.premiumPassOwned));}
function fmtN(v){try{return typeof fmt==='function'?fmt(v):Number(v).toLocaleString('fr-FR');}catch(_){return String(v);}}
function rewardText(v){return fmtN(v)+' Minéraux';}
function premiumReward(v){return Number(v)*0.25;}
function saveGrant(level,premium){
 var row=STEPS.find(function(x){return x[0]===level;});if(!row||heroLevel()<level)return false;
 var key=id(level),granted=false;
 function apply(s){
  var a=ensure(s),amount=premium?premiumReward(row[1]):row[1];
  if(premium){if(!premiumOwned(a)||a.premiumClaimed[key])return;a.premiumClaimed[key]=true;}
  else{if(a.claimed[key])return;a.claimed[key]=true;}
  s.minerai=n(s.minerai)+amount;granted=true;
 }
 if(typeof update==='function')update(apply);else{apply(S);if(granted){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}}}
 if(granted){try{if(typeof toast==='function')toast((premium?'Bonus Premium':'Accomplissement')+' · +'+rewardText(premium?premiumReward(row[1]):row[1]),true);}catch(_){}renderIntoPass();}
 return granted;
}
function button(key,lv,premium,done,owned,already){
 if(already)return '<span class="pill" style="color:#6ee7a0;border-color:#3fb950">✓ Reçu</span>';
 if(premium&&!owned)return '<span class="pill" style="opacity:.65">Premium</span>';
 if(!done)return '<span class="pill" style="opacity:.55">Niv. '+lv+'</span>';
 return '<button class="btn sm '+(premium?'gold':'blue')+'" data-ach-level-v492="'+lv+'" data-premium-v492="'+(premium?'1':'0')+'">Récupérer</button>';
}
function rowHtml(row){
 var lv=row[0],free=row[1],key=id(lv),a=ensure(S),done=heroLevel()>=lv,owned=premiumOwned(a);
 return '<div class="achPassRow" data-ach-level-row-v492="'+lv+'">'+
  '<div class="achObjective"><b>Niveau personnage '+lv+'</b><div class="achProgressText">'+(done?'Objectif atteint':heroLevel()+' / '+lv)+'</div></div>'+
  '<div class="achReward"><div class="achRewardText">'+rewardText(free)+'</div>'+button(key,lv,false,done,owned,!!a.claimed[key])+'</div>'+
  '<div class="achReward premium"><div class="achRewardText">+'+rewardText(premiumReward(free))+' · 25%</div>'+button(key,lv,true,done,owned,!!a.premiumClaimed[key])+'</div></div>';
}
function sectionHtml(){
 return '<div id="srHeroLevelAccomplishmentsV492" style="margin-top:14px">'+
  '<div class="achCatTitle"><span class="achCatIcon466" aria-hidden="true">♛</span><span>Niveau personnage</span><span class="achCategorySummary">'+heroLevel()+' / 100</span></div>'+
  '<div class="achLaneHead"><span>PALIER</span><span>GRATUIT</span><span>PREMIUM +25%</span></div>'+STEPS.map(rowHtml).join('')+'</div>';
}
function renderIntoPass(){
 try{
  var root=document.querySelector('.srAch139[data-ach-canonical-v139="1"]');if(!root)return;
  var old=root.querySelector('#srHeroLevelAccomplishmentsV492');if(old)old.remove();
  var holder=document.createElement('div');holder.innerHTML=sectionHtml();var node=holder.firstElementChild;if(node)root.appendChild(node);
 }catch(_){}
}
document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest?e.target.closest('[data-ach-level-v492]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
 saveGrant(Number(b.getAttribute('data-ach-level-v492')),b.getAttribute('data-premium-v492')==='1');
},true);
try{
 var obs=new MutationObserver(function(){renderIntoPass();});
 if(document.body)obs.observe(document.body,{childList:true,subtree:true});
}catch(_){}
setTimeout(renderIntoPass,0);setTimeout(renderIntoPass,300);
window.__srCharacterLevelAccomplishmentsConfigV492={version:492,steps:STEPS.slice(),premiumRatio:0.25,levelSource:'S.level'};
})();
