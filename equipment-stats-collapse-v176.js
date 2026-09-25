/* SHADOWREACH · Equipment presentation authority V176 / V450
   UI-only: combat statistics are collapsed by default and can be expanded on demand.
   V450: a fresh equipment item has no level suffix. Upgraded equipment is displayed
   as "Nom | I", "Nom | II", etc. The saved numeric item.level remains unchanged. */
(function(){
'use strict';
if(window.__srEquipmentStatsCollapseV176)return;
window.__srEquipmentStatsCollapseV176=true;
var KEY='sr:equipmentCombatStatsExpanded:v176';
function pref(){try{return localStorage.getItem(KEY)==='1';}catch(_){return false;}}
function setPref(v){try{localStorage.setItem(KEY,v?'1':'0');}catch(_){}}
function textOf(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();}
function roman(n){
 n=Math.max(0,Math.floor(Number(n)||0));if(!n)return '';
 var map=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']],out='';
 for(var i=0;i<map.length;i++)while(n>=map[i][0]){out+=map[i][1];n-=map[i][0];}
 return out;
}
function equipmentDisplayName(it){
 if(!it)return '';var name=String(it.name||'Équipement'),lv=Math.max(0,Math.floor(Number(it.level)||0));
 return lv>0?name+' | '+roman(lv):name;
}
window.__srEquipmentDisplayV450={version:450,roman:roman,name:equipmentDisplayName,freshHasSuffix:false};
function itemById(id){
 try{var eq=Object.values((typeof S!=='undefined'&&S.equipped)||{}).find(function(x){return x&&String(x.id)===String(id);});if(eq)return eq;return ((typeof S!=='undefined'&&S.inventory)||[]).find(function(x){return x&&String(x.id)===String(id);})||null;}catch(_){return null;}
}
function decorateEquipmentNames(){
 var root=document.getElementById('screen');if(!root)return;
 Array.prototype.forEach.call(root.querySelectorAll('.itemRow'),function(row){
  var action=row.querySelector('[data-act="equip"][data-arg], [data-act="itemDetail"][data-arg], [data-act="equipPreview"][data-arg]');
  if(!action)return;var it=itemById(action.getAttribute('data-arg'));if(!it)return;
  var name=row.querySelector('.flex1 > .b.small');if(!name)return;
  var label=equipmentDisplayName(it);if(name.textContent!==label)name.textContent=label;
 });
}
function apply(){
  decorateEquipmentNames();
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
