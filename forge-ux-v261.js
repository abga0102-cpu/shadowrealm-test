/* SHADOWREACH · Forge UX V265
   Single runtime authority for forged-card lifecycle after Auto-Forge V199.
   Owns card creation, entry, hold, exit and cleanup inside the elastic loot reserve.
   No viewport/body overlay, no MutationObserver, no hot-loader.
   No economy/progression/save changes.
*/
(function(){
'use strict';
if(window.__srForgeUXV261)return;window.__srForgeUXV261=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function')return;
var reduced=false;try{reduced=!!matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
var nativeForgeSummon=forgeSummon;
var nativeFilter=(typeof showForgeFilterPicker==='function')?showForgeFilterPicker:null;
var groups=[],busy=false,rootNode=null,activeWrap=null,holdTimer=0,removeTimer=0,watchTimer=0;
var ROOT='srForgeLoot261',BATCHES=[1,3,5,10];
var ENTRY_MS=reduced?100:240,STAGGER_MS=reduced?0:45;
function batch(){var n=Math.floor(Number(S.forge.autoBatch)||1);return BATCHES.indexOf(n)>=0?n:1;}
function persistBatch(n){n=Math.floor(Number(n)||1);if(BATCHES.indexOf(n)<0)n=1;S.forge.autoBatch=n;try{if(typeof saveNow==='function')saveNow();}catch(_){}try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){} }
var RARITY_C={COMMUN:'#9aa7bb',PEU_COMMUN:'#48c77a',RARE:'#4aa3ff',EPIQUE:'#b15cf6',MYTHIQUE:'#ff7a45',ARTEFACT:'#43c98b',LEGENDAIRE:'#f1c75b',INFERNAL:'#e5484d',IMMORTEL:'#d96cff',DIVIN:'#f7b52e'};
var SLOT_IMG={weapon:'art/icons/arme.png',arme:'art/icons/arme.png',helmet:'art/icons/casque.png',casque:'art/icons/casque.png',armor:'art/icons/armure.png',armure:'art/icons/armure.png',gloves:'art/icons/gants.png',gants:'art/icons/gants.png',boots:'art/icons/bottes.png',bottes:'art/icons/bottes.png',necklace:'art/icons/accessoire.png',collier:'art/icons/accessoire.png',ring:'art/icons/accessoire.png',anneau:'art/icons/accessoire.png',belt:'art/icons/accessoire.png',ceinture:'art/icons/accessoire.png',accessory:'art/icons/accessoire.png',accessoire:'art/icons/accessoire.png'};
var SLOT_LABEL={weapon:'Arme',arme:'Arme',helmet:'Casque',casque:'Casque',armor:'Armure',armure:'Armure',gloves:'Gants',gants:'Gants',boots:'Bottes',bottes:'Bottes',necklace:'Collier',collier:'Collier',ring:'Anneau',anneau:'Anneau',belt:'Ceinture',ceinture:'Ceinture',accessory:'Accessoire',accessoire:'Accessoire'};
function norm(v){return String(v==null?'':v).trim().toUpperCase().replace(/[ÉÈÊË]/g,'E').replace(/[ÀÂÄ]/g,'A').replace(/[ÙÛÜ]/g,'U').replace(/[ÎÏ]/g,'I').replace(/[ÔÖ]/g,'O').replace(/[^A-Z_]/g,'_');}
function col(v){var k=norm(v);if(k==='PEU__COMMUN')k='PEU_COMMUN';return RARITY_C[k]||'#8fa3bf';}
function img(slot){return SLOT_IMG[String(slot||'').toLowerCase()]||'art/icons/accessoire.png';}
function label(slot){return SLOT_LABEL[String(slot||'').toLowerCase()]||'Équipement';}
function fmt2(v){var n=Number(v||0);if(!isFinite(n))return String(v||'');if(Math.abs(n)>=1000000)return(n/1000000).toFixed(n>=10000000?0:1)+'M';if(Math.abs(n)>=1000)return(n/1000).toFixed(n>=10000?0:1)+'K';return Math.round(n).toLocaleString('fr-FR');}
function reserve(){return document.querySelector('#homeForge .srForgeLootReserve260');}
function forgeHost(){var r=reserve();return r?{reserve:r}:null;}
function ensureRoot(){var h=forgeHost();if(!h)return null;if(!rootNode){rootNode=document.createElement('div');rootNode.id=ROOT;rootNode.className='srForgeLootInline261';rootNode.setAttribute('aria-live','polite');}if(rootNode.parentNode!==h.reserve)h.reserve.replaceChildren(rootNode);return rootNode;}
function clearTimers(){if(holdTimer){clearTimeout(holdTimer);holdTimer=0;}if(removeTimer){clearTimeout(removeTimer);removeTimer=0;}}
function clearDisplay(clearQueue){clearTimers();busy=false;activeWrap=null;if(clearQueue)groups.length=0;if(rootNode&&rootNode.parentNode)rootNode.remove();}
function watch(){if(watchTimer)return;watchTimer=setInterval(function(){if(!busy&&!groups.length){clearInterval(watchTimer);watchTimer=0;return;}if(!forgeHost()){clearDisplay(true);clearInterval(watchTimer);watchTimer=0;return;}if(rootNode&&activeWrap)ensureRoot();},120);}
function particle(card,c){if(reduced)return;for(var i=0;i<6;i++){var p=document.createElement('i');p.className='srForgeDust261';var a=Math.PI*2*i/6,d=14+Math.random()*18;p.style.setProperty('--dx',(Math.cos(a)*d).toFixed(1)+'px');p.style.setProperty('--dy',(Math.sin(a)*d+6).toFixed(1)+'px');p.style.background=c;card.appendChild(p);}}
function cardFor(r){var recycle=!!r.recycled,c=col(r.rarity),d=document.createElement('div');d.className='srForgeCard261 '+(recycle?'recycled':'kept');d.style.setProperty('--r',c);d.innerHTML='<div class="srForgeState261">'+(recycle?'♻ RECYCLAGE':'FORGÉ')+'</div><div class="srForgeImg261"><img src="'+img(r.slot)+'" alt=""></div><div class="srForgeName261">'+label(r.slot)+'</div><div class="srForgeMeta261"><b>'+String(r.rarity||'').replace(/_/g,' ')+'</b>'+(r.power!=null?' · '+fmt2(r.power):'')+'</div>'+(recycle&&r.dust!=null?'<div class="srForgeGain261">+'+fmt2(r.dust)+' poussière</div>':'');if(recycle)particle(d,c);return d;}
function showNext(){
  if(busy||!groups.length)return;
  if(document.hidden||!forgeHost()){clearDisplay(true);return;}
  var root=ensureRoot();if(!root){clearDisplay(true);return;}
  busy=true;watch();
  var group=groups.shift(),wrap=document.createElement('div');wrap.className='srForgeGroup261';activeWrap=wrap;root.replaceChildren(wrap);
  var mobile=(innerWidth||0)<=430,limit=mobile?3:4,visible=group.slice(0,limit);
  visible.forEach(function(r,i){var c=cardFor(r);c.style.setProperty('--entryDelay',(i*STAGGER_MS)+'ms');wrap.appendChild(c);requestAnimationFrame(function(){c.classList.add('show');});});
  if(group.length>limit){var more=document.createElement('div');more.className='srForgeMore261';more.textContent='+'+(group.length-limit);wrap.appendChild(more);}
  var recycleOnly=visible.length&&visible.every(function(x){return !!x.recycled;});
  var visibleHold=reduced?900:(recycleOnly?2200:3200);
  var entryWindow=ENTRY_MS+Math.max(0,visible.length-1)*STAGGER_MS;
  holdTimer=setTimeout(function(){
    if(!forgeHost()){clearDisplay(true);return;}
    ensureRoot();
    wrap.querySelectorAll('.srForgeCard261').forEach(function(c){c.classList.add(c.classList.contains('recycled')?'recycleOut':'keepOut');});
    removeTimer=setTimeout(function(){if(wrap.parentNode)wrap.remove();activeWrap=null;busy=false;if(groups.length)showNext();else if(rootNode&&rootNode.parentNode)rootNode.remove();},reduced?180:520);
  },entryWindow+visibleHold);
}
function enqueue(res){if(!Array.isArray(res)||!res.length||document.hidden||!forgeHost())return;if(groups.length>6)groups.shift();groups.push(res.slice(0,20));showNext();}
forgeSummon=function(){var args=Array.prototype.slice.call(arguments),requested=Math.floor(Number(args[0])||1);if(S.forge.autoForge&&requested===1&&batch()>1){try{var cost=forgeCost(S.forge.level),aff=Math.max(1,Math.floor(Number(S.minerai||0)/Math.max(1,cost)));args[0]=Math.max(1,Math.min(batch(),aff));}catch(_){args[0]=batch();}}var out=nativeForgeSummon.apply(this,args);try{enqueue(out);}catch(e){console.warn('forge visual V265 skipped',e);}return out;};
try{window.forgeSummon=forgeSummon;}catch(_){}
if(typeof ACT!=='undefined'&&ACT){ACT.autoForgeBatch261=function(a){persistBatch(a);try{if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null){clearTimeout(autoForgeTimer);autoForgeTimer=null;}if(S.forge.autoForge&&typeof scheduleAutoForge==='function'&&!(window.__srAutoForgePausedForCompareV199&&window.__srAutoForgePausedForCompareV199()))scheduleAutoForge(180);}catch(_){}if(nativeFilter)showForgeFilterPicker();};}
function injectBatch(){var toggle=document.querySelector('[data-act="forgeFilterToggle"]');if(!toggle)return;var row=toggle.parentElement;if(!row||document.getElementById('srAutoBatch261'))return;var box=document.createElement('div');box.id='srAutoBatch261';box.innerHTML='<div class="b small">Auto-Forge simultanée</div><div class="mute tiny mt2">Nombre de pièces forgées à chaque cycle AUTO.</div><div class="srBatchBtns261">'+BATCHES.map(function(n){return '<button type="button" class="srBatch261 '+(batch()===n?'on':'')+'" data-act="autoForgeBatch261" data-arg="'+n+'">×'+n+'</button>';}).join('')+'</div><div class="mute tiny mt3">Le coût reste normal par pièce. Les valeurs non débloquées sont verrouillées par ta progression.</div>';row.insertAdjacentElement('afterend',box);}
if(nativeFilter){showForgeFilterPicker=function(){var r=nativeFilter.apply(this,arguments);requestAnimationFrame(injectBatch);return r;};try{window.showForgeFilterPicker=showForgeFilterPicker;}catch(_){} }
document.addEventListener('click',function(e){var go=e.target&&e.target.closest?e.target.closest('[data-act="go"],[data-act="nav"]'):null;if(go)setTimeout(function(){if(!forgeHost())clearDisplay(true);},0);},true);
document.addEventListener('visibilitychange',function(){if(document.hidden)clearDisplay(true);});window.addEventListener('pagehide',function(){clearDisplay(true);});
var oldEntry263=document.getElementById('srForgeEntryAnimationV263Style');if(oldEntry263)oldEntry263.remove();
var oldEntry264=document.getElementById('srForgeEntryAnimationV264Style');if(oldEntry264)oldEntry264.remove();
var st=document.createElement('style');st.id='srForgeUX261Style';st.textContent='\
#'+ROOT+'.srForgeLootInline261{position:relative;width:100%;height:100%;box-sizing:border-box;pointer-events:none;overflow:visible}\
#'+ROOT+' .srForgeGroup261{position:relative;width:100%;height:100%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;align-items:stretch;box-sizing:border-box}\
#'+ROOT+' .srForgeCard261{--r:#8fa3bf;--entryDelay:0ms;position:relative;min-width:0;height:100%;box-sizing:border-box;border:1.25px solid var(--r);border-radius:9px;background:linear-gradient(180deg,#14213af4,#09111ff4);box-shadow:0 3px 9px #0008,0 0 8px color-mix(in srgb,var(--r) 20%,transparent);text-align:center;opacity:0;transform:translateY(7px) scale(.965);filter:brightness(.88) saturate(.86);overflow:visible;padding-bottom:2px}\
#'+ROOT+' .srForgeCard261.show:not(.recycleOut):not(.keepOut){animation:srForgeEnter265 .24s cubic-bezier(.2,.85,.3,1.12) var(--entryDelay) backwards}\
#'+ROOT+' .srForgeCard261.kept.show:not(.keepOut){box-shadow:0 3px 9px #0008,0 0 11px color-mix(in srgb,var(--r) 28%,transparent)}\
#'+ROOT+' .srForgeCard261.show.recycleOut,#'+ROOT+' .srForgeCard261.show.keepOut{animation:none}\
#'+ROOT+' .srForgeCard261.show{opacity:1;transform:translateY(0) scale(1);filter:none}\
#'+ROOT+' .srForgeState261{font-size:5.8px;font-weight:1000;letter-spacing:.35px;padding:3px 2px 0;color:#dce8f8;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
#'+ROOT+' .recycled .srForgeState261{color:#7ee7a3}\
#'+ROOT+' .srForgeImg261{height:31px;display:grid;place-items:center;background:radial-gradient(circle,color-mix(in srgb,var(--r) 15%,transparent),transparent 68%)}\
#'+ROOT+' .srForgeImg261 img{width:29px;height:29px;object-fit:contain;filter:drop-shadow(0 3px 3px #0009)}\
#'+ROOT+' .srForgeName261{font:900 7.8px/1 Georgia,serif;color:#f4df9d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px}\
#'+ROOT+' .srForgeMeta261{font-size:5.7px;font-weight:800;color:#97a8c1;margin:2px 2px 1px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#'+ROOT+' .srForgeMeta261 b{color:var(--r)}\
#'+ROOT+' .srForgeGain261{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);white-space:nowrap;border:1px solid #557395;background:#111b2b;padding:1px 3px;border-radius:5px;color:#a8e8ff;font-size:5.5px;font-weight:900;z-index:2}\
#'+ROOT+' .recycleOut{opacity:0!important;transform:translateY(3px) scale(.6)!important;filter:grayscale(.75) blur(1px)!important;transition:opacity .32s ease,transform .42s ease,filter .42s ease}\
#'+ROOT+' .keepOut{opacity:0!important;transform:translateY(-6px) scale(.97)!important;filter:none!important;transition:opacity .32s ease,transform .38s ease}\
#'+ROOT+' .recycleOut .srForgeImg261 img{animation:srRecycle261 .46s ease-in both}\
#'+ROOT+' .srForgeDust261{position:absolute;left:50%;top:48%;width:3px;height:3px;border-radius:50%;opacity:0}#'+ROOT+' .recycleOut .srForgeDust261{animation:srDust261 .46s ease-out both}\
#'+ROOT+' .srForgeMore261{position:absolute;right:3px;top:-6px;border:1px solid #62799a;background:#101a2b;color:#dbe7f7;border-radius:7px;padding:2px 4px;font-size:6px;font-weight:900;z-index:4}\
#srAutoBatch261{margin-top:8px;padding:8px;border:1px solid #314a70;border-radius:12px;background:#0d1728}.srBatchBtns261{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:6px}.srBatch261{appearance:none;border:1px solid #405a80;background:#111d31;color:#b8c6dc;border-radius:9px;padding:7px 2px;font-size:10px;font-weight:900}.srBatch261.on{border-color:#e8b44a;color:#ffe2a0;background:#2a210d;box-shadow:0 0 0 1px #e8b44a55 inset}\
@keyframes srForgeEnter265{0%{opacity:0;transform:translateY(7px) scale(.965);filter:brightness(.88) saturate(.86)}72%{opacity:1;transform:translateY(-1px) scale(1.012);filter:brightness(1.08) saturate(1.04)}100%{opacity:1;transform:translateY(0) scale(1);filter:none}}\
@keyframes srRecycle261{0%{transform:scale(1);opacity:1}45%{transform:scale(.8);filter:brightness(1.7) saturate(.2)}100%{transform:scale(.14) rotate(16deg);opacity:0;filter:blur(3px)}}@keyframes srDust261{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}\
@media(max-width:430px){#'+ROOT+' .srForgeGroup261{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}}\
@media(max-height:720px){#'+ROOT+' .srForgeImg261{height:27px}#'+ROOT+' .srForgeImg261 img{width:25px;height:25px}#'+ROOT+' .srForgeName261{font-size:7px}}\
@media(prefers-reduced-motion:reduce){#'+ROOT+' .srForgeCard261{filter:none;transform:none}#'+ROOT+' .srForgeCard261.show:not(.recycleOut):not(.keepOut){animation:srForgeEnterReduced265 .1s linear var(--entryDelay) backwards}#'+ROOT+' .recycleOut,#'+ROOT+' .keepOut{transition:opacity .1s linear!important;transform:none!important;filter:none!important}@keyframes srForgeEnterReduced265{from{opacity:0}to{opacity:1}}}';document.head.appendChild(st);
window.__srForgeUXV261={batch:batch,enqueue:enqueue,clear:clearDisplay,version:265};
})();