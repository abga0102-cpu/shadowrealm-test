/* SHADOWREACH · Sanctuaire endgame v130
   Active 2->1 ladder, permanent board expansion and sacrifice rewards.
   Existing saves are migrated without deleting pieces or claimed resources. */
(function(){
'use strict';
if(window.__srSanctuaryEndgameV130)return;window.__srSanctuaryEndgameV130=true;
if(typeof S==='undefined'||typeof SANCT_MERGE_ORDER==='undefined')return;

var ORDER=['COMMUN','PEU_COMMUN','RARE_I','RARE_II','EPIQUE_I','EPIQUE_II','MYTHIQUE_I','MYTHIQUE_II','MYTHIQUE_III','ARTEFACT_I','ARTEFACT_II','ARTEFACT_III','LEGENDAIRE_I','LEGENDAIRE_II','LEGENDAIRE_III','INFERNAL_I','INFERNAL_II','INFERNAL_III','IMMORTEL_I','IMMORTEL_II','IMMORTEL_III','DIVIN'];
var NAMES={COMMUN:'Commun',PEU_COMMUN:'Peu commun',RARE_I:'Rare I',RARE_II:'Rare II',EPIQUE_I:'Épique I',EPIQUE_II:'Épique II',MYTHIQUE_I:'Mythique I',MYTHIQUE_II:'Mythique II',MYTHIQUE_III:'Mythique III',ARTEFACT_I:'Artefact I',ARTEFACT_II:'Artefact II',ARTEFACT_III:'Artefact III',LEGENDAIRE_I:'Légendaire I',LEGENDAIRE_II:'Légendaire II',LEGENDAIRE_III:'Légendaire III',INFERNAL_I:'Infernal I',INFERNAL_II:'Infernal II',INFERNAL_III:'Infernal III',IMMORTEL_I:'Immortel I',IMMORTEL_II:'Immortel II',IMMORTEL_III:'Immortel III',DIVIN:'Divin'};
var COLORS={COMMUN:'#9FB0C8',PEU_COMMUN:'#57C785',RARE_I:'#3FA7FF',RARE_II:'#65BAFF',EPIQUE_I:'#B15CF6',EPIQUE_II:'#C47BFA',MYTHIQUE_I:'#FF7A3D',MYTHIQUE_II:'#FF925C',MYTHIQUE_III:'#FFAA78',ARTEFACT_I:'#2FA47C',ARTEFACT_II:'#42B98E',ARTEFACT_III:'#61C99F',LEGENDAIRE_I:'#F5C542',LEGENDAIRE_II:'#F8D363',LEGENDAIRE_III:'#FFE08A',INFERNAL_I:'#D94A50',INFERNAL_II:'#E46064',INFERNAL_III:'#F0787B',IMMORTEL_I:'#C15CF6',IMMORTEL_II:'#D17BFA',IMMORTEL_III:'#E09BFF',DIVIN:'#FFB52E'};
SANCT_MERGE_ORDER.splice(0,SANCT_MERGE_ORDER.length);ORDER.forEach(function(x){SANCT_MERGE_ORDER.push(x);});
Object.assign(SANCT_MERGE_NAME,NAMES);Object.assign(SANCT_MERGE_COLOR,COLORS);

/* Supplier seeds only the first four families. Épique I is the highest direct purchase. */
sanctSupplierTier=function(level){level=Math.max(1,Math.min(15,Math.floor(Number(level)||1)));return level>=13?'EPIQUE_I':level>=9?'RARE_I':level>=5?'PEU_COMMUN':'COMMUN';};
sanctSupplierUnlocked=function(level){var a=['COMMUN'];if(level>=5)a.push('PEU_COMMUN');if(level>=9)a.push('RARE_I');if(level>=13)a.push('EPIQUE_I');return a;};
var oldPrice=sanctSupplierPrice;
sanctSupplierPrice=function(level,r){var alias={RARE_I:'RARE',EPIQUE_I:'EPIQUE'}[r]||r;return oldPrice(level,alias);};

function cap(st){return Math.max(16,Math.min(32,16+(Number(st.boardExpansions)||0)));}
/* Replace the old 16-slot normalizer so purchased slots are never truncated. */
sanctMergeState=function(){
  if(!S.sanctuary)S.sanctuary={slotA:null,slotB:null,discovered:{},fusions:0,stabilitySeals:0};
  var st=S.sanctuary;if(!Array.isArray(st.mergeBoard))st.mergeBoard=[];
  var c=cap(st);while(st.mergeBoard.length<c)st.mergeBoard.push(null);if(st.mergeBoard.length>c){var overflow=st.mergeBoard.slice(c).filter(Boolean);st.mergeBoard=st.mergeBoard.slice(0,c);if(overflow.length){st.mergeReserve=Array.isArray(st.mergeReserve)?st.mergeReserve:[];Array.prototype.push.apply(st.mergeReserve,overflow);}}
  if(!Number.isFinite(st.supplierLevel))st.supplierLevel=1;st.supplierLevel=Math.max(1,Math.min(15,Math.floor(st.supplierLevel)));
  if(!Number.isFinite(st.supplierProgress))st.supplierProgress=0;if(!st.mergeDiscovered||typeof st.mergeDiscovered!=='object')st.mergeDiscovered={};if(!Number.isFinite(st.mergeCrafts))st.mergeCrafts=0;if(!Number.isFinite(st.mergeSelected))st.mergeSelected=-1;
  return st;
};

function migrate(){var st=sanctMergeState();if(st.v130Migrated)return;
  var map={RARE:'RARE_I',EPIQUE:'EPIQUE_I',MYTHIQUE:'MYTHIQUE_I',ARTEFACT:'ARTEFACT_I',LEGENDAIRE:'LEGENDAIRE_I',INFERNAL:'INFERNAL_I',IMMORTEL:'IMMORTEL_I'};
  st.mergeBoard=st.mergeBoard.map(function(x){return map[x]||x;});if(Array.isArray(st.mergeReserve))st.mergeReserve=st.mergeReserve.map(function(x){return map[x]||x;});st.v130Migrated=true;
}
migrate();

/* Old ritual recipes conflict with the new sacrifice economy; fusion itself remains drag/tap 2->1. */
if(Array.isArray(SANCT_MERGE_RECIPES))SANCT_MERGE_RECIPES.splice(0,SANCT_MERGE_RECIPES.length);

var REWARDS={
 RARE_I:{mineral:50},RARE_II:{mineral:150},
 EPIQUE_I:{accel:15,qty:1},EPIQUE_II:{accel:30,qty:1},MYTHIQUE_I:{accel:60,qty:1},MYTHIQUE_II:{accel:60,qty:2},MYTHIQUE_III:{mineral:5000},
 ARTEFACT_I:{seal:1},ARTEFACT_II:{essence:1000,spark:1000},ARTEFACT_III:{seal:2,essence:1500,spark:1500},
 LEGENDAIRE_I:{mineral:35000},LEGENDAIRE_II:{essence:7500,spark:7500},LEGENDAIRE_III:{key:1,seal:3},
 INFERNAL_I:{key:3,seal:3},INFERNAL_II:{key:5,seal:5,essence:10000,spark:10000},INFERNAL_III:{key:8,seal:7,essence:20000,spark:20000},
 IMMORTEL_I:{key:12,seal:10},IMMORTEL_II:{key:18,seal:15,essence:40000,spark:40000},IMMORTEL_III:{key:25,seal:20,essence:75000,spark:75000},
 DIVIN:{mineral:100000,essence:50000,spark:50000,key:25,seal:50,pr:5000,token:1,title:true}
};
function accelDef(mins){return typeof ACCEL_DEFS!=='undefined'&&ACCEL_DEFS.find(function(a){return Number(a.mins)===mins;});}
function rewardText(r){var p=[];if(r.mineral)p.push(fmt(r.mineral)+' Minéraux');if(r.accel)p.push((r.qty||1)+'× Accélérateur '+r.accel+' min');if(r.seal)p.push(r.seal+'× Sceau'+(r.seal>1?'x':'')+' de stabilité');if(r.key)p.push(r.key+'× Clé'+(r.key>1?'s':'')+' universelle'+(r.key>1?'s':''));if(r.essence)p.push(fmt(r.essence)+' Essences');if(r.spark)p.push(fmt(r.spark)+' Étincelles');if(r.pr)p.push(fmt(r.pr)+' PR');if(r.token)p.push(r.token+'× Jeton Divin');if(r.title)p.push('Titre « Divin » (1re fois)');return p.join(' + ');}
function grant(r,st){if(r.mineral)S.minerai=(S.minerai||0)+r.mineral;if(r.essence)S.essence=(S.essence||0)+r.essence;if(r.spark)S.eclat=(S.eclat||0)+r.spark;if(r.key)S.universalKeys=(S.universalKeys||0)+r.key;if(r.seal)st.stabilitySeals=(st.stabilitySeals||0)+r.seal;if(r.pr){S.rebirth=S.rebirth||{};S.rebirth.pr=(S.rebirth.pr||0)+r.pr;}if(r.accel){var a=accelDef(r.accel);if(a){S.accels=S.accels||{};S.accels[a.key]=(S.accels[a.key]||0)+(r.qty||1);}}if(r.token)st.divineTokens=(st.divineTokens||0)+r.token;if(r.title&&!st.divineTitleUnlocked){st.divineTitleUnlocked=true;S.titles=S.titles||{};S.titles.divin=true;}}
function sacrifice(rarity){var st=sanctMergeState(),idx=st.mergeBoard.indexOf(rarity),rw=REWARDS[rarity];if(idx<0||!rw)return;var label=NAMES[rarity]||rarity;if(!confirm('Sacrifier '+label+' ?\n\nRécompense : '+rewardText(rw)+'\n\nLa pièce sera définitivement consommée.'))return;st.mergeBoard[idx]=null;grant(rw,st);st.sacrifices=(st.sacrifices||0)+1;dirty=true;if(typeof saveNow==='function')saveNow();toast(label+' sacrifié · récompenses obtenues',true);render();}
function expand(){var st=sanctMergeState(),n=Number(st.boardExpansions)||0;if(n>=16)return toast('Plateau déjà au maximum');var cost=(n+1)*10000;if((S.gold||0)<cost)return toast('Or insuffisant');if(!confirm('Agrandir définitivement le plateau à '+(17+n)+' cases pour '+fmt(cost)+' Or ?'))return;S.gold-=cost;st.boardExpansions=n+1;sanctMergeState();dirty=true;if(typeof saveNow==='function')saveNow();toast('Plateau agrandi · '+cap(st)+'/32 cases',true);render();}

var oldScreen=scrSanctuaire;
scrSanctuaire=function(){var st=sanctMergeState(),h=oldScreen();var c=cap(st),n=Number(st.boardExpansions)||0,cost=n<16?(n+1)*10000:0;
  h=h.replace(/Plateau de Merge <span class=\"mute tiny\">· [^<]*<\/span>/,'Plateau de Merge <span class="mute tiny">· '+st.mergeBoard.filter(Boolean).length+'/'+c+'</span>');
  var rows=ORDER.filter(function(r){return REWARDS[r];}).map(function(r){var have=st.mergeBoard.indexOf(r)>=0,rw=REWARDS[r];return '<div class="itemRow"><div class="flex1"><div class="b small" style="color:'+COLORS[r]+'">'+NAMES[r]+'</div><div class="mute tiny">'+rewardText(rw)+'</div></div><button class="btn sm '+(have?'red':'dark')+'" data-sanct-v130="sacrifice" data-rarity="'+r+'" '+(have?'':'disabled')+'>Sacrifier</button></div>';}).join('');
  var extra='<div class="sect">Agrandissement du plateau</div><div class="card frame"><div class="between"><div><div class="b">'+c+' / 32 cases</div><div class="mute tiny">Permanent · prochain emplacement '+(n<16?fmt(cost)+' Or':'MAX')+'</div></div>'+(n<16?'<button class="btn sm gold" data-sanct-v130="expand" '+((S.gold||0)<cost?'disabled':'')+'>+1 case</button>':'<span class="pill">MAX</span>')+'</div></div><div class="sect">Sacrifices</div><div class="notice tiny">Sacrifier une pièce donne immédiatement sa récompense. Continuer à fusionner signifie renoncer aux récompenses des paliers précédents.</div>'+rows+'<div class="card frame mt8"><div class="between"><div><div class="tiny b" style="color:#FFB52E">PROGRESSION DIVINE</div><div class="b mt3">Jetons Divins : '+fmt(st.divineTokens||0)+'</div></div>'+(st.divineTitleUnlocked?'<span class="pill" style="color:#FFB52E;border-color:#FFB52E">Titre : DIVIN</span>':'')+'</div></div>';
  return h+extra;
};
if(typeof SCREENS!=='undefined')SCREENS.sanctuaire=scrSanctuaire;

document.getElementById('app').addEventListener('click',function(e){var b=e.target.closest('[data-sanct-v130]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.dataset.sanctV130==='expand')expand();else if(b.dataset.sanctV130==='sacrifice')sacrifice(b.dataset.rarity);},true);
try{dirty=true;if(typeof saveNow==='function')saveNow();render();}catch(e){console.warn('Sanctuaire v130 init',e);}
})();