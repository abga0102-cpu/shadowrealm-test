/* SHADOWREACH · Equipment presentation authority V176 / V450
   UI-only: combat statistics are collapsed by default and can be expanded on demand.
   V450/V455: equipment displays the Hero-synchronised item.level in Roman numerals.
   Dust enhancement is separate in item.upgradeLevel and never changes this label. */
(function(){
'use strict';
if(window.__srEquipmentStatsCollapseV176)return;
window.__srEquipmentStatsCollapseV176=true;
var KEY='sr:equipmentCombatStatsExpanded:v176';
function pref(){try{return localStorage.getItem(KEY)==='1';}catch(_){return false;}}
function setPref(v){try{localStorage.setItem(KEY,v?'1':'0');}catch(_){}}
function textOf(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();}
/* V454: equipment names are now rendered canonically by game-4/game-5.
   Keep this compatibility API for tests/other callers, but do not rewrite the DOM. */
window.__srEquipmentDisplayV450={
 version:455,
 roman:function(n){return typeof equipmentRomanLevel==='function'?equipmentRomanLevel(n):'';},
 name:function(it){return typeof equipmentDisplayName==='function'?equipmentDisplayName(it):String(it&&it.name||'Équipement');},
 freshHasSuffix:false,
 canonicalRenderer:true
};
function apply(){
  if(typeof route!=='undefined'&&route!=='equipement'&&route!=='personnage'&&route!=='inventaire')return;
  var root=document.getElementById('screen');if(!root)return;
  var sections=Array.prototype.slice.call(root.querySelectorAll('.sect'));
  var title=sections.find(function(el){return textOf(el).indexOf('statistiques de combat')!==-1;});
  if(!title||title.getAttribute('data-stats-v176')==='1')return;
  var card=title.nextElementSibling;if(!card||!card.classList.contains('card'))return;
  title.setAttribute('data-stats-v176','1');title.style.cursor='pointer';title.style.display='flex';title.style.alignItems='center';title.style.justifyContent='space-between';title.style.gap='8px';
  var action=document.createElement('span');action.className='pill';action.style.cursor='pointer';action.style.flex='0 0 auto';action.style.color='var(--cyanLit,#8FEFF4)';action.style.borderColor='var(--cyan,#3FCFD6)';title.appendChild(action);
  function sync(open){card.style.display=open?'':'none';action.textContent=open?'Masquer ▲':'Afficher ▼';title.setAttribute('aria-expanded',open?'true':'false');}
  var nativeMore=card.querySelector('.equipStatsMore');
  if(nativeMore&&typeof equipmentUiStateV439!=='undefined') nativeMore.open=!!equipmentUiStateV439.statsMoreOpen;
  sync(pref());
  title.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var open=card.style.display==='none';setPref(open);sync(open);});
}
var scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;apply();});}
new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',schedule,{once:true});window.addEventListener('load',schedule,{once:true});schedule();
})();
