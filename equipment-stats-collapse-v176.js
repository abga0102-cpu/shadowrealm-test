/* SHADOWREACH · Equipment combat stats collapse V176
   UI-only: combat statistics are collapsed by default and can be expanded on demand.
   The player's display preference is kept locally on the device. */
(function(){
'use strict';
if(window.__srEquipmentStatsCollapseV176)return;
window.__srEquipmentStatsCollapseV176=true;
var KEY='sr:equipmentCombatStatsExpanded:v176';
function pref(){try{return localStorage.getItem(KEY)==='1';}catch(_){return false;}}
function setPref(v){try{localStorage.setItem(KEY,v?'1':'0');}catch(_){}}
function textOf(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();}
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
  sync(pref());
  title.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var open=card.style.display==='none';setPref(open);sync(open);});
}
var scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;apply();});}
new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',schedule,{once:true});window.addEventListener('load',schedule,{once:true});schedule();
})();
