/* SHADOWREACH · Runtime tree stability V216
   Additive runtime authority loaded before V212/V213.
   - Preserves the V212/V213 tree rules and visuals in one consolidated layer.
   - Prevents the two legacy body-wide MutationObservers from installing.
   - Popup mastery text is refreshed only after tree interactions.
   - No save schema, economy, acquired bonuses or node coordinates are changed. */
(function(){
'use strict';
if(window.__srRuntimeTreeStabilityV216)return;
window.__srRuntimeTreeStabilityV216=true;

/* V212/V213 stay in the build, but their duplicate runtime observers/wrappers
   must not install. V216 reproduces their intended behavior below. */
window.__srPersonalTreeSpectacleV212=true;
window.__srPersonalTreeMasteryClarityV213=true;

if(typeof TREE_NODES==='undefined'||typeof TREE_BY_ID==='undefined'||typeof treeLv!=='function'||typeof treeReqOk!=='function')return;
var LEVEL=3,COST=100;
var keys=TREE_NODES.filter(function(n){return n&&n.masteryKey&&!n.deprecatedKey;});
function route(n){
 var e=String((n&&n.effect)||'');
 if(e==='petDmg'||e==='petHp')return 'familier';
 if(e==='eggFree'||e==='eggSlot'||e.indexOf('hatch_')===0)return 'eggs';
 if(e==='goldAll'||e==='afkGain')return 'or';
 if(e==='afkTime')return 'autonomie';
 if(e==='forgeTime'||e==='forgeCost'||e==='forgeFree'||e==='forgeMult')return 'forge';
 if(e==='peRaid')return 'pe';
 if(e==='research'||e==='techCost')return 'research';
 if(e==='skillDmg'||e==='skillFree'||e==='skillCost'||e==='passDmg'||e==='passHp')return 'competence';
 if(e.indexOf('eq_')===0)return 'equipment';
 return 'other';
}
var ROUTES={
 mk_familier:['familier','eggs'],
 mk_or:['or','autonomie'],
 mk_minerai:['forge'],
 mk_pe:['pe','research'],
 mk_competence:['competence','equipment']
};
function unique(a){var o={},r=[];a.forEach(function(x){if(x&&!o[x]){o[x]=1;r.push(x);}});return r;}
function baseReq(k){return unique((k.masteryBaseReq&&k.masteryBaseReq.length?k.masteryBaseReq:(k.masteryReq||k.req||[])).slice());}
function chooseExtras(k,base){
 var allowed=ROUTES[k.id]||[],baseTier=0;
 base.forEach(function(id){var n=TREE_BY_ID[id];if(n)baseTier=Math.max(baseTier,Number(n.tier||0));});
 var candidates=TREE_NODES.filter(function(n){
  return n&&!n.masteryKey&&!n.deprecatedKey&&base.indexOf(n.id)<0&&allowed.indexOf(route(n))>=0&&Number(n.tier||0)>=Math.max(3,baseTier);
 });
 candidates.sort(function(a,b){return Number(a.tier||0)-Number(b.tier||0)||Number(a.row||0)-Number(b.row||0)||Number(a.lane||0)-Number(b.lane||0)||String(a.id).localeCompare(String(b.id));});
 return candidates.slice(0,3).map(function(n){return n.id;});
}
keys.forEach(function(k){
 var base=baseReq(k),extra=chooseExtras(k,base);
 k.cost=COST;k.masteryBaseReq=base;k.masteryDeepReq=extra;k.masteryReq=base.concat(extra);k.req=k.masteryReq.slice();k.masteryLevelRequired=LEVEL;
 k.note='Maîtrise avancée : tous les prérequis affichés doivent atteindre le niveau 3/5. Coût : 100 PE. Recherche de base : 7 jours.';
});
var prevReq=treeReqOk;
treeReqOk=function(s,node){
 if(node&&node.deprecatedKey)return false;
 if(node&&node.masteryKey)return (node.masteryReq||node.req||[]).every(function(id){return treeLv(s,id)>=LEVEL;});
 return prevReq(s,node);
};
try{window.treeReqOk=treeReqOk;}catch(_){}
function doneCount(k){var req=k.masteryReq||[];return req.filter(function(id){return treeLv(S,id)>=LEVEL;}).length;}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function label(id){var n=TREE_BY_ID[id];return n?(n.short||n.label||id):id;}
function halo(k){
 if(!Number.isFinite(Number(k.x))||!Number.isFinite(Number(k.y)))return '';
 var req=k.masteryReq||[],n=req.length;if(!n)return '';
 var x=Number(k.x),y=Number(k.y),r=43,s='';
 for(var i=0;i<n;i++){
  var a=(-90+(360/n)*i)*Math.PI/180,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r,ok=treeLv(S,req[i])>=LEVEL;
  s+='<circle class="srKeyReqDot216" cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="3.8" fill="'+(ok?'#FFD65E':'#26344F')+'" stroke="'+(ok?'#FFF1A8':'#51617C')+'" stroke-width="1.2" opacity="'+(ok?'1':'.72')+'"/>';
 }
 var complete=doneCount(k)===n;
 s+='<circle class="srKeyMasteryRing216" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="38" fill="none" stroke="'+(complete?'#FFD65E':'#384862')+'" stroke-width="1.5" opacity="'+(complete?'.9':'.48')+'"/>';
 return s;
}
var style=document.createElement('style');style.id='srRuntimeTreeStability216Style';style.textContent='\
.srRadialTree{filter:drop-shadow(0 0 16px rgba(63,207,214,.12));overflow:visible}\
.srRadialTree g[data-act="treeNode"] circle{transition:filter .22s ease,stroke-width .22s ease,transform .22s ease;transform-box:fill-box;transform-origin:center}\
.srRadialTree g[data-act="treeNode"]:active circle{transform:scale(1.09)}\
.srRadialTree g[data-act="treeNode"] circle[opacity=".10"]{animation:srTreePulse216 1.8s ease-in-out infinite;filter:drop-shadow(0 0 9px currentColor)}\
.srRadialTree line[stroke-width="3"]{filter:drop-shadow(0 0 4px rgba(143,239,244,.5));stroke-dasharray:8 5;animation:srTreeFlow216 2.4s linear infinite}\
.srRadialTree .srTreeCorePulse216{animation:srTreeCore216 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}\
.srRadialTree .srKeyReqDot216{filter:drop-shadow(0 0 4px rgba(255,214,94,.55))}\
.srRadialTree .srKeyMasteryRing216{filter:drop-shadow(0 0 7px rgba(255,214,94,.28))}\
@keyframes srTreePulse216{0%,100%{opacity:.08}50%{opacity:.28}}\
@keyframes srTreeFlow216{to{stroke-dashoffset:-26}}\
@keyframes srTreeCore216{0%,100%{opacity:.10;transform:scale(.96)}50%{opacity:.32;transform:scale(1.08)}}\
@media (prefers-reduced-motion:reduce){.srRadialTree *{animation:none!important;transition:none!important}}';document.head.appendChild(style);

if(typeof treeGraph==='function'){
 var oldGraph=treeGraph;
 treeGraph=function(active,remain){
  var html=oldGraph(active,remain);
  try{
   html=html.replace('<svg class="srRadialTree"','<svg class="srRadialTree" data-sr-runtime="216"');
   html=html.replace(/(<circle cx="700" cy="700" r="76"[^>]*>)/,'<circle class="srTreeCorePulse216" cx="700" cy="700" r="92" fill="none" stroke="#3FCFD6" stroke-width="1.5" opacity=".22"/>$1');
   var overlays='';
   keys.forEach(function(k){
    overlays+=halo(k);
    var req=k.masteryReq||[],sub=treeLv(S,k.id)>=1?'OBTENUE':(doneCount(k)+'/'+req.length+' · 3/5');
    var re=new RegExp('(<g data-act="treeNode" data-arg="'+k.id+'"[\\s\\S]*?<text[^>]*>[\\s\\S]*?<\\/text>[\\s\\S]*?<text[^>]*>[\\s\\S]*?<\\/text>[\\s\\S]*?<text[^>]*>)([^<]*)(<\\/text><\\/g>)');
    html=html.replace(re,'$1'+esc(sub)+'$3');
   });
   html=html.replace('</svg>',overlays+'</svg>');
  }catch(_){}
  return html;
 };
 try{window.treeGraph=treeGraph;}catch(_){}
}
function syncPopup(){
 try{
  var roots=document.querySelectorAll('.modal,.popup,.overlay,.sheet,.dialog,[role="dialog"]');
  for(var a=0;a<roots.length;a++){
   var root=roots[a],txt=String(root.textContent||'').toLowerCase(),k=null;
   for(var i=0;i<keys.length;i++)if(txt.indexOf(String(keys[i].label||'').toLowerCase())>=0){k=keys[i];break;}
   if(!k)continue;
   var req=k.masteryReq||[],missing=req.filter(function(id){return treeLv(S,id)<LEVEL;}),done=req.length-missing.length;
   var wanted=missing.length?'Maîtrise '+done+'/'+req.length+' · niveau 3/5 requis · Manque : '+missing.slice(0,3).map(label).join(', ')+(missing.length>3?'…':''):'Maîtrise '+req.length+'/'+req.length+' complète · clé disponible pour 100 PE.';
   var leaves=root.querySelectorAll('*');
   for(var j=0;j<leaves.length;j++){
    var el=leaves[j];if(el.children.length)continue;var t=String(el.textContent||'').trim();if(!t)continue;
    if(t.indexOf("Requiert d'abord")>=0||t.indexOf('Requiert d’abord')>=0||t.indexOf('Maîtrise ')===0){if(el.textContent!==wanted)el.textContent=wanted;}
   }
  }
 }catch(_){}
}
var popupQueued=false;
function queuePopupSync(){if(popupQueued)return;popupQueued=true;requestAnimationFrame(function(){popupQueued=false;syncPopup();});}
/* No document-wide MutationObserver. Only actual tree interaction schedules sync. */
document.addEventListener('click',function(e){
 var t=e&&e.target;if(!t||!t.closest)return;
 if(t.closest('.srRadialTree,[data-act="treeNode"]')){queuePopupSync();setTimeout(queuePopupSync,40);}
},true);
document.addEventListener('pointerup',function(e){
 var t=e&&e.target;if(t&&t.closest&&t.closest('.srRadialTree,[data-act="treeNode"]'))queuePopupSync();
},true);
setTimeout(syncPopup,0);
})();
