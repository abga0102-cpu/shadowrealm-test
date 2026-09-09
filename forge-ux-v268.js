/* SHADOWREACH · Forge UX V268
   Persistent stacked loot authority inside Forge.
   Keeps the same loot DOM across Home rerenders so animations cannot be cut by renderer replacement.
   Kept items accumulate as compact overlapping cards; recycled items animate then disappear.
   No economy/progression/save changes. No overlay, no MutationObserver, no hot-loader.
*/
(function(){
'use strict';
if(window.__srForgeUXV268)return;window.__srForgeUXV268=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function')return;

var reduced=false;try{reduced=!!matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
var nativeForgeSummon=forgeSummon;
var nativeFilter=(typeof showForgeFilterPicker==='function')?showForgeFilterPicker:null;
var BATCHES=[1,3,5,10],MAX_VISIBLE=7,KEEP_LIMIT=30,STAGGER=reduced?0:85,MAX_TRANSIENT=5;
var kept=[],activeTransients=[],timers=new Set(),rootNode=null,stackNode=null,transientNode=null,overflowNode=null,watchTimer=0;
var RARITY_C={COMMUN:'#9aa7bb',PEU_COMMUN:'#48c77a',RARE:'#4aa3ff',EPIQUE:'#b15cf6',MYTHIQUE:'#ff7a45',ARTEFACT:'#43c98b',LEGENDAIRE:'#f1c75b',INFERNAL:'#e5484d',IMMORTEL:'#d96cff',DIVIN:'#f7b52e'};
var SLOT_IMG={weapon:'art/icons/arme.png',arme:'art/icons/arme.png',helmet:'art/icons/casque.png',casque:'art/icons/casque.png',armor:'art/icons/armure.png',armure:'art/icons/armure.png',gloves:'art/icons/gants.png',gants:'art/icons/gants.png',boots:'art/icons/bottes.png',bottes:'art/icons/bottes.png',necklace:'art/icons/accessoire.png',collier:'art/icons/accessoire.png',ring:'art/icons/accessoire.png',anneau:'art/icons/accessoire.png',belt:'art/icons/accessoire.png',ceinture:'art/icons/accessoire.png',accessory:'art/icons/accessoire.png',accessoire:'art/icons/accessoire.png'};
var SLOT_LABEL={weapon:'Arme',arme:'Arme',helmet:'Casque',casque:'Casque',armor:'Armure',armure:'Armure',gloves:'Gants',gants:'Gants',boots:'Bottes',bottes:'Bottes',necklace:'Collier',collier:'Collier',ring:'Anneau',anneau:'Anneau',belt:'Ceinture',ceinture:'Ceinture',accessory:'Accessoire',accessoire:'Accessoire'};

function batch(){var n=Math.floor(Number(S.forge.autoBatch)||1);return BATCHES.indexOf(n)>=0?n:1;}
function persistBatch(n){n=Math.floor(Number(n)||1);if(BATCHES.indexOf(n)<0)n=1;S.forge.autoBatch=n;try{if(typeof saveNow==='function')saveNow();}catch(_){}try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){} }
function norm(v){return String(v==null?'':v).trim().toUpperCase().replace(/[ÉÈÊË]/g,'E').replace(/[ÀÂÄ]/g,'A').replace(/[ÙÛÜ]/g,'U').replace(/[ÎÏ]/g,'I').replace(/[ÔÖ]/g,'O').replace(/[^A-Z_]/g,'_');}
function col(v){var k=norm(v);if(k==='PEU__COMMUN')k='PEU_COMMUN';return RARITY_C[k]||'#8fa3bf';}
function img(slot){return SLOT_IMG[String(slot||'').toLowerCase()]||'art/icons/accessoire.png';}
function label(slot){return SLOT_LABEL[String(slot||'').toLowerCase()]||'Équipement';}
function fmt2(v){var n=Number(v||0);if(!isFinite(n))return String(v||'');if(Math.abs(n)>=1000000)return(n/1000000).toFixed(n>=10000000?0:1)+'M';if(Math.abs(n)>=1000)return(n/1000).toFixed(n>=10000?0:1)+'K';return Math.round(n).toLocaleString('fr-FR');}
function reserve(){return document.querySelector('#homeForge .srForgeLootReserve266');}
function later(fn,ms){var id=setTimeout(function(){timers.delete(id);fn();},ms);timers.add(id);return id;}
function clearTimers(){timers.forEach(function(id){clearTimeout(id);});timers.clear();}

function buildRoot(){
  if(rootNode)return rootNode;
  rootNode=document.createElement('div');rootNode.id='srForgeLoot268';rootNode.className='srForgeLootZone268';rootNode.setAttribute('aria-live','polite');
  rootNode.innerHTML='<div class="srForgeStack268"></div><div class="srForgeTransient268"></div><div class="srForgeOverflow268" hidden></div>';
  stackNode=rootNode.querySelector('.srForgeStack268');transientNode=rootNode.querySelector('.srForgeTransient268');overflowNode=rootNode.querySelector('.srForgeOverflow268');
  return rootNode;
}
function mountRoot(){
  var h=reserve();if(!h)return null;
  var root=buildRoot();
  if(root.parentNode!==h){h.replaceChildren(root);}
  return root;
}
function layoutStack(newNode){
  if(!stackNode)return;
  var total=kept.length,start=Math.max(0,total-MAX_VISIBLE),visible=kept.slice(start),hidden=start;
  kept.forEach(function(entry,i){
    var show=i>=start;entry.node.hidden=!show;if(!show)return;
    var vi=i-start;entry.node.style.left=(4+vi*17)+'px';entry.node.style.top=(5+Math.min(vi,3))+'px';entry.node.style.zIndex=String(vi+1);
  });
  if(overflowNode){overflowNode.hidden=hidden<=0;overflowNode.textContent=hidden>0?'+'+hidden:'';}
  if(newNode&&!reduced){newNode.classList.remove('join');void newNode.offsetWidth;newNode.classList.add('join');later(function(){newNode.classList.remove('join');},240);}
}
function stackCard(r){
  var d=document.createElement('div');d.className='srForgeStackCard268';d.style.setProperty('--r',col(r.rarity));d.title=label(r.slot)+' · '+String(r.rarity||'').replace(/_/g,' ');
  d.innerHTML='<img src="'+img(r.slot)+'" alt=""><span>'+String(r.rarity||'').replace(/_/g,' ').slice(0,3)+'</span>';
  return d;
}
function addKept(r){
  if(!mountRoot())return;
  var node=stackCard(r);stackNode.appendChild(node);kept.push({data:r,node:node});
  if(kept.length>KEEP_LIMIT){var old=kept.shift();if(old&&old.node&&old.node.parentNode)old.node.remove();}
  layoutStack(node);startWatch();
}
function transientCard(r){
  var rec=!!r.recycled,d=document.createElement('div');d.className='srForgeTransientCard268 '+(rec?'recycled':'kept');d.style.setProperty('--r',col(r.rarity));
  d.innerHTML='<div class="srForgeTransientIcon268"><img src="'+img(r.slot)+'" alt=""></div><div class="srForgeTransientText268"><b>'+label(r.slot)+'</b><small>'+String(r.rarity||'').replace(/_/g,' ')+(r.power!=null?' · '+fmt2(r.power):'')+'</small>'+(rec&&r.dust!=null?'<em>+'+fmt2(r.dust)+' poussière</em>':'')+'</div>';
  return d;
}
function layoutTransients(){
  activeTransients.forEach(function(entry,i){var slot=Math.max(0,Math.min(MAX_TRANSIENT-1,i));entry.node.style.setProperty('--tx',(slot*11)+'px');entry.node.style.setProperty('--ty',(slot*2)+'px');entry.node.style.zIndex=String(20+slot);});
}
function removeTransient(entry){
  var i=activeTransients.indexOf(entry);if(i>=0)activeTransients.splice(i,1);if(entry&&entry.node&&entry.node.parentNode)entry.node.remove();layoutTransients();
}
function makeRoom(){
  while(activeTransients.length>=MAX_TRANSIENT){var old=activeTransients.shift();if(old&&old.node&&old.node.parentNode)old.node.remove();}
  layoutTransients();
}
function animateResult(r,delay){
  later(function(){
    if(document.hidden||!mountRoot())return;
    makeRoom();
    var d=transientCard(r),entry={data:r,node:d};activeTransients.push(entry);transientNode.appendChild(d);layoutTransients();
    requestAnimationFrame(function(){requestAnimationFrame(function(){if(d.isConnected)d.classList.add('enter');});});
    if(r.recycled){
      later(function(){if(!d.isConnected)return;d.classList.add('recycleOut');later(function(){removeTransient(entry);},reduced?120:430);},reduced?160:520);
    }else{
      later(function(){if(!d.isConnected)return;d.classList.add('merge');later(function(){removeTransient(entry);addKept(r);},reduced?100:210);},reduced?170:540);
    }
  },delay);
}
function enqueue(res){
  if(!Array.isArray(res)||!res.length||document.hidden||!reserve())return;
  res.slice(0,20).forEach(function(r,i){animateResult(r,i*STAGGER);});startWatch();
}
function clearTransientOnly(){
  clearTimers();activeTransients.forEach(function(e){if(e.node&&e.node.parentNode)e.node.remove();});activeTransients.length=0;
}
function resetUI(clearKept){
  clearTransientOnly();
  if(clearKept){kept.forEach(function(e){if(e.node&&e.node.parentNode)e.node.remove();});kept.length=0;}
  if(rootNode&&rootNode.parentNode)rootNode.remove();
  if(clearKept){rootNode=stackNode=transientNode=overflowNode=null;}
}
function startWatch(){
  if(watchTimer)return;
  watchTimer=setInterval(function(){
    var h=reserve();
    if(!h){resetUI(true);clearInterval(watchTimer);watchTimer=0;return;}
    if(rootNode&&rootNode.parentNode!==h)mountRoot();
    if(!kept.length&&!activeTransients.length&&!timers.size){clearInterval(watchTimer);watchTimer=0;}
  },140);
}

forgeSummon=function(){
  var args=Array.prototype.slice.call(arguments),requested=Math.floor(Number(args[0])||1);
  if(S.forge.autoForge&&requested===1&&batch()>1){try{var cost=forgeCost(S.forge.level),aff=Math.max(1,Math.floor(Number(S.minerai||0)/Math.max(1,cost)));args[0]=Math.max(1,Math.min(batch(),aff));}catch(_){args[0]=batch();}}
  var out=nativeForgeSummon.apply(this,args);try{enqueue(out);}catch(e){console.warn('forge persistent loot V268 skipped',e);}return out;
};
try{window.forgeSummon=forgeSummon;}catch(_){}

if(typeof ACT!=='undefined'&&ACT){ACT.autoForgeBatch266=function(a){persistBatch(a);try{if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null){clearTimeout(autoForgeTimer);autoForgeTimer=null;}if(S.forge.autoForge&&typeof scheduleAutoForge==='function'&&!(window.__srAutoForgePausedForCompareV199&&window.__srAutoForgePausedForCompareV199()))scheduleAutoForge(180);}catch(_){}if(nativeFilter)showForgeFilterPicker();};}
function injectBatch(){var toggle=document.querySelector('[data-act="forgeFilterToggle"]');if(!toggle)return;var row=toggle.parentElement;if(!row||document.getElementById('srAutoBatch266'))return;var box=document.createElement('div');box.id='srAutoBatch266';box.innerHTML='<div class="b small">Auto-Forge simultanée</div><div class="mute tiny mt2">Nombre de pièces forgées à chaque cycle AUTO.</div><div class="srBatchBtns266">'+BATCHES.map(function(n){return '<button type="button" class="srBatch266 '+(batch()===n?'on':'')+'" data-act="autoForgeBatch266" data-arg="'+n+'">×'+n+'</button>';}).join('')+'</div><div class="mute tiny mt3">Le coût reste normal par pièce. Les valeurs non débloquées sont verrouillées par ta progression.</div>';row.insertAdjacentElement('afterend',box);}
if(nativeFilter){showForgeFilterPicker=function(){var r=nativeFilter.apply(this,arguments);requestAnimationFrame(injectBatch);return r;};try{window.showForgeFilterPicker=showForgeFilterPicker;}catch(_){} }

document.addEventListener('click',function(e){var go=e.target&&e.target.closest?e.target.closest('[data-act="go"],[data-act="nav"]'):null;if(go)later(function(){if(!reserve())resetUI(true);},0);},true);
document.addEventListener('visibilitychange',function(){if(document.hidden)clearTransientOnly();else if(reserve()&&kept.length){mountRoot();startWatch();}});
window.addEventListener('pagehide',function(){resetUI(true);});
['srForgeUX261Style','srForgeUX266Style','srForgeUX267Style','srForgeEntryAnimationV263Style','srForgeEntryAnimationV264Style'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});

var st=document.createElement('style');st.id='srForgeUX268Style';st.textContent='\
#srForgeLoot268{position:relative;width:100%;height:60px;max-height:60px;box-sizing:border-box;pointer-events:none;overflow:hidden}\
#srForgeLoot268 .srForgeStack268,#srForgeLoot268 .srForgeTransient268{position:absolute;inset:0}\
#srForgeLoot268 .srForgeStack268{z-index:1}#srForgeLoot268 .srForgeTransient268{z-index:8}\
#srForgeLoot268 .srForgeStackCard268{--r:#8fa3bf;position:absolute;width:46px;height:50px;border:1.5px solid var(--r);border-radius:9px;background:linear-gradient(180deg,#18263cf7,#09111ff7);box-shadow:0 3px 8px #0009,0 0 7px color-mix(in srgb,var(--r) 24%,transparent);display:grid;place-items:center;overflow:hidden;transform-origin:50% 80%}\
#srForgeLoot268 .srForgeStackCard268.join{animation:srStackJoin268 .22s cubic-bezier(.2,.85,.3,1.12) both}\
#srForgeLoot268 .srForgeStackCard268 img{width:30px;height:30px;object-fit:contain;filter:drop-shadow(0 2px 2px #0009)}#srForgeLoot268 .srForgeStackCard268 span{position:absolute;bottom:2px;left:3px;right:3px;text-align:center;font:900 5.5px/1 system-ui;color:var(--r);text-transform:uppercase;white-space:nowrap;overflow:hidden}\
#srForgeLoot268 .srForgeOverflow268{position:absolute;z-index:7;right:4px;top:18px;min-width:27px;height:24px;padding:0 5px;border:1px solid #5b7190;border-radius:999px;background:#101a2bed;color:#e6eef9;display:grid;place-items:center;font:900 8px system-ui;box-sizing:border-box}\
#srForgeLoot268 .srForgeTransientCard268{--r:#8fa3bf;--tx:0px;--ty:0px;position:absolute;left:5px;top:3px;height:52px;width:118px;border:1.5px solid var(--r);border-radius:10px;background:linear-gradient(180deg,#182840fa,#091321fa);box-shadow:0 4px 11px #000b,0 0 10px color-mix(in srgb,var(--r) 28%,transparent);display:flex;align-items:center;gap:6px;padding:5px 7px;box-sizing:border-box;opacity:0;transform:translate(var(--tx),calc(var(--ty) + 6px)) scale(.95);filter:brightness(.9);overflow:hidden}\
#srForgeLoot268 .srForgeTransientCard268.enter{animation:srForgeEnter268 .22s cubic-bezier(.2,.85,.3,1.12) both}\
#srForgeLoot268 .srForgeTransientIcon268{width:34px;height:34px;flex:0 0 34px;border-radius:8px;background:radial-gradient(circle,color-mix(in srgb,var(--r) 17%,transparent),transparent 72%);display:grid;place-items:center}#srForgeLoot268 .srForgeTransientIcon268 img{width:31px;height:31px;object-fit:contain;filter:drop-shadow(0 2px 2px #0009)}\
#srForgeLoot268 .srForgeTransientText268{min-width:0;display:flex;flex-direction:column;gap:2px}.srForgeTransientText268 b{font:900 8px/1 Georgia,serif;color:#f4df9d;white-space:nowrap}.srForgeTransientText268 small{font:800 6px/1 system-ui;color:var(--r);white-space:nowrap}.srForgeTransientText268 em{font:900 6px/1 system-ui;color:#a8e8ff;font-style:normal;white-space:nowrap}\
#srForgeLoot268 .srForgeTransientCard268.merge{animation:none;opacity:0;transform:translate(calc(var(--tx) + 25px),var(--ty)) scale(.60);filter:brightness(1.15);transition:opacity .17s ease,transform .21s cubic-bezier(.3,.7,.4,1),filter .17s}\
#srForgeLoot268 .srForgeTransientCard268.recycleOut{animation:none;opacity:0;transform:translate(var(--tx),calc(var(--ty) - 4px)) scale(.58) rotate(-5deg);filter:grayscale(.7) blur(1px);transition:opacity .30s ease,transform .40s ease,filter .38s ease}\
@keyframes srForgeEnter268{0%{opacity:0;transform:translate(var(--tx),calc(var(--ty) + 6px)) scale(.95);filter:brightness(.9)}72%{opacity:1;transform:translate(var(--tx),calc(var(--ty) - 1px)) scale(1.018);filter:brightness(1.08)}100%{opacity:1;transform:translate(var(--tx),var(--ty)) scale(1);filter:none}}@keyframes srStackJoin268{0%{opacity:0;transform:translateX(-8px) scale(.82)}100%{opacity:1;transform:none}}\
#srAutoBatch266{margin-top:8px;padding:8px;border:1px solid #314a70;border-radius:12px;background:#0d1728}.srBatchBtns266{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:6px}.srBatch266{appearance:none;border:1px solid #405a80;background:#111d31;color:#b8c6dc;border-radius:9px;padding:7px 2px;font-size:10px;font-weight:900}.srBatch266.on{border-color:#e8b44a;color:#ffe2a0;background:#2a210d;box-shadow:0 0 0 1px #e8b44a55 inset}\
@media(max-width:390px){#srForgeLoot268{height:56px;max-height:56px}#srForgeLoot268 .srForgeStackCard268{width:43px;height:47px}#srForgeLoot268 .srForgeStackCard268 img{width:28px;height:28px}#srForgeLoot268 .srForgeTransientCard268{height:49px;width:110px}#srForgeLoot268 .srForgeTransientIcon268{width:31px;height:31px;flex-basis:31px}#srForgeLoot268 .srForgeTransientIcon268 img{width:28px;height:28px}}\
@media(prefers-reduced-motion:reduce){#srForgeLoot268 *{animation:none!important;transition:opacity .1s linear!important}.srForgeTransientCard268.enter{opacity:1!important;transform:none!important;filter:none!important}}';document.head.appendChild(st);

window.__srForgeUXV268={batch:batch,enqueue:enqueue,clear:function(){resetUI(true);},kept:function(){return kept.map(function(e){return e.data;});},version:268};
})();
