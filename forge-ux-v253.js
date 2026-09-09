/* SHADOWREACH · Forge UX V253
   Runtime authority: loaded after Auto-Forge V199.
   - Forge result cards stay visible longer.
   - Cards anchor to the Forge panel instead of the combat arena.
   - AUTO batch selector lives in the Forge filter modal.
   - The final forgeSummon wrapper enforces the selected AUTO batch even if an older
     cached V199 still calls forgeSummon(1), while V199 keeps comparison pause/resume.
*/
(function(){
'use strict';
if(window.__srForgeUXV253)return;window.__srForgeUXV253=true;
if(typeof S==='undefined'||!S.forge||typeof forgeSummon!=='function')return;

var reduced=false;try{reduced=!!matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
var nativeForgeSummon=forgeSummon;
var nativeFilter=(typeof showForgeFilterPicker==='function')?showForgeFilterPicker:null;
var groups=[];var busy=false;var ROOT='srForgeLoot253';
var BATCHES=[1,3,5,10,20];

function batch(){var n=Math.floor(Number(S.forge.autoBatch)||1);return BATCHES.indexOf(n)>=0?n:1;}
function persistBatch(n){n=Math.floor(Number(n)||1);if(BATCHES.indexOf(n)<0)n=1;S.forge.autoBatch=n;try{if(typeof saveNow==='function')saveNow();}catch(_){}try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){} }

var RARITY={COMMUN:'#9aa7bb',PEU_COMMUN:'#48c77a',RARE:'#4aa3ff',EPIQUE:'#b15cf6',MYTHIQUE:'#ff7a45',LEGENDAIRE:'#f1c75b',DIVIN:'#f7f1c8'};
var SLOT_IMG={weapon:'art/icons/arme.png',arme:'art/icons/arme.png',helmet:'art/icons/casque.png',casque:'art/icons/casque.png',armor:'art/icons/armure.png',armure:'art/icons/armure.png',gloves:'art/icons/gants.png',gants:'art/icons/gants.png',boots:'art/icons/bottes.png',bottes:'art/icons/bottes.png',necklace:'art/icons/accessoire.png',collier:'art/icons/accessoire.png',ring:'art/icons/accessoire.png',anneau:'art/icons/accessoire.png',belt:'art/icons/accessoire.png',ceinture:'art/icons/accessoire.png',accessory:'art/icons/accessoire.png',accessoire:'art/icons/accessoire.png'};
var SLOT_LABEL={weapon:'Arme',arme:'Arme',helmet:'Casque',casque:'Casque',armor:'Armure',armure:'Armure',gloves:'Gants',gants:'Gants',boots:'Bottes',bottes:'Bottes',necklace:'Collier',collier:'Collier',ring:'Anneau',anneau:'Anneau',belt:'Ceinture',ceinture:'Ceinture',accessory:'Accessoire',accessoire:'Accessoire'};
function norm(v){return String(v==null?'':v).trim().toUpperCase().replace(/[ÉÈÊË]/g,'E').replace(/[ÀÂÄ]/g,'A').replace(/[ÙÛÜ]/g,'U').replace(/[ÎÏ]/g,'I').replace(/[ÔÖ]/g,'O').replace(/[^A-Z_]/g,'_');}
function col(v){var k=norm(v);if(k==='PEU__COMMUN')k='PEU_COMMUN';return RARITY[k]||'#8fa3bf';}
function img(slot){return SLOT_IMG[String(slot||'').toLowerCase()]||'art/icons/accessoire.png';}
function label(slot){return SLOT_LABEL[String(slot||'').toLowerCase()]||'Équipement';}
function fmt(v){var n=Number(v||0);if(!isFinite(n))return String(v||'');if(Math.abs(n)>=1000000)return(n/1000000).toFixed(n>=10000000?0:1)+'M';if(Math.abs(n)>=1000)return(n/1000).toFixed(n>=10000?0:1)+'K';return Math.round(n).toLocaleString('fr-FR');}

function ensureRoot(){var r=document.getElementById(ROOT);if(r)return r;r=document.createElement('div');r.id=ROOT;r.setAttribute('aria-live','polite');r.style.cssText='position:fixed;z-index:10920;left:50%;top:76%;width:0;height:0;pointer-events:none;';document.body.appendChild(r);return r;}
function anchor(){var root=ensureRoot();var f=document.querySelector('[data-act="forgeFilter"]');var card=f&&f.closest('.card');if(card){var rc=card.getBoundingClientRect(),fr=f.getBoundingClientRect();var x=Math.max(74,Math.min(innerWidth-74,rc.left+rc.width/2));var y=Math.max(rc.top+86,Math.min(rc.bottom-92,fr.top-70));root.style.left=x+'px';root.style.top=y+'px';}else{root.style.left='50%';root.style.top='78%';}}
function particle(card,c){if(reduced)return;for(var i=0;i<7;i++){var p=document.createElement('i');p.className='srForgeDust253';var a=Math.PI*2*i/7,d=26+Math.random()*32;p.style.setProperty('--dx',(Math.cos(a)*d).toFixed(1)+'px');p.style.setProperty('--dy',(Math.sin(a)*d+12).toFixed(1)+'px');p.style.background=c;card.appendChild(p);}}
function cardFor(r){var recycle=!!r.recycled,c=col(r.rarity),d=document.createElement('div');d.className='srForgeCard253 '+(recycle?'recycled':'kept');d.style.setProperty('--r',c);d.innerHTML='<div class="srForgeState253">'+(recycle?'♻ RECYCLAGE':'ÉQUIPEMENT FORGÉ')+'</div><div class="srForgeImg253"><img src="'+img(r.slot)+'" alt=""></div><div class="srForgeName253">'+label(r.slot)+'</div><div class="srForgeMeta253"><b>'+String(r.rarity||'').replace(/_/g,' ')+'</b>'+(r.power!=null?' · '+fmt(r.power):'')+'</div>'+(recycle&&r.dust!=null?'<div class="srForgeGain253">+'+fmt(r.dust)+' poussière</div>':'');if(recycle)particle(d,c);return d;}
function showNext(){if(busy||!groups.length)return;if(document.hidden){groups.length=0;return;}busy=true;anchor();var root=ensureRoot(),group=groups.shift(),wrap=document.createElement('div');wrap.className='srForgeGroup253';root.appendChild(wrap);var visible=group.slice(0,5);visible.forEach(function(r){var c=cardFor(r);wrap.appendChild(c);requestAnimationFrame(function(){c.classList.add('show');});});if(group.length>5){var more=document.createElement('div');more.className='srForgeMore253';more.textContent='+'+(group.length-5);wrap.appendChild(more);}var recycleOnly=visible.length&&visible.every(function(x){return !!x.recycled;});var hold=reduced?650:(recycleOnly?1550:2300);setTimeout(function(){wrap.querySelectorAll('.srForgeCard253').forEach(function(c){c.classList.add(c.classList.contains('recycled')?'recycleOut':'keepOut');});setTimeout(function(){wrap.remove();busy=false;showNext();},reduced?180:580);},hold);}
function enqueue(res){if(!Array.isArray(res)||!res.length||document.hidden)return;if(groups.length>8)groups.shift();groups.push(res.slice(0,20));showNext();}
forgeSummon=function(){var args=Array.prototype.slice.call(arguments);var requested=Math.floor(Number(args[0])||1);if(S.forge.autoForge&&requested===1&&batch()>1){try{var cost=forgeCost(S.forge.level),aff=Math.max(1,Math.floor(Number(S.minerai||0)/Math.max(1,cost)));args[0]=Math.max(1,Math.min(batch(),aff));}catch(_){args[0]=batch();}}var out=nativeForgeSummon.apply(this,args);try{enqueue(out);}catch(e){console.warn('forge visual V253 skipped',e);}return out;};try{window.forgeSummon=forgeSummon;}catch(_){}

if(typeof ACT!=='undefined'&&ACT){ACT.autoForgeBatch253=function(a){persistBatch(a);try{if(typeof autoForgeTimer!=='undefined'&&autoForgeTimer!==null){clearTimeout(autoForgeTimer);autoForgeTimer=null;}if(S.forge.autoForge&&typeof scheduleAutoForge==='function'&&!(window.__srAutoForgePausedForCompareV199&&window.__srAutoForgePausedForCompareV199()))scheduleAutoForge(180);}catch(_){}if(nativeFilter)showForgeFilterPicker();};}
function injectBatch(){var toggle=document.querySelector('[data-act="forgeFilterToggle"]');if(!toggle)return;var row=toggle.parentElement;if(!row||document.getElementById('srAutoBatch253'))return;var box=document.createElement('div');box.id='srAutoBatch253';box.innerHTML='<div class="b small">Auto-Forge simultanée</div><div class="mute tiny mt2">Nombre de pièces forgées à chaque cycle AUTO.</div><div class="srBatchBtns253">'+BATCHES.map(function(n){return '<button type="button" class="srBatch253 '+(batch()===n?'on':'')+'" data-act="autoForgeBatch253" data-arg="'+n+'">×'+n+'</button>';}).join('')+'</div><div class="mute tiny mt3">Le coût reste normal par pièce. Si le minerai manque, seule la quantité possible est forgée.</div>';row.insertAdjacentElement('afterend',box);}
if(nativeFilter){showForgeFilterPicker=function(){var r=nativeFilter.apply(this,arguments);requestAnimationFrame(injectBatch);return r;};try{window.showForgeFilterPicker=showForgeFilterPicker;}catch(_){} }

var st=document.createElement('style');st.id='srForgeUX253Style';st.textContent='\
#'+ROOT+' .srForgeGroup253{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;gap:6px;transform:translate(-50%,-50%);max-width:min(94vw,520px)}\
#'+ROOT+' .srForgeCard253{--r:#8fa3bf;width:104px;min-height:132px;border:1.5px solid var(--r);border-radius:14px;background:linear-gradient(180deg,#14213af7,#09111ff7);box-shadow:0 10px 25px #000b,0 0 18px color-mix(in srgb,var(--r) 28%,transparent);text-align:center;opacity:0;transform:translateY(9px) scale(.82);transition:opacity .22s,transform .26s cubic-bezier(.2,.9,.25,1.15),filter .35s;overflow:visible}\
#'+ROOT+' .srForgeCard253.show{opacity:1;transform:translateY(0) scale(1)}\
#'+ROOT+' .srForgeState253{font-size:7px;font-weight:1000;letter-spacing:.8px;padding:7px 4px 2px;color:#dce8f8}\
#'+ROOT+' .recycled .srForgeState253{color:#ffb2b2}\
#'+ROOT+' .srForgeImg253{height:64px;display:grid;place-items:center;background:radial-gradient(circle,color-mix(in srgb,var(--r) 16%,transparent),transparent 68%)}\
#'+ROOT+' .srForgeImg253 img{width:56px;height:56px;object-fit:contain;filter:drop-shadow(0 6px 6px #0009)}\
#'+ROOT+' .srForgeName253{font:900 11px/1.1 Georgia,serif;color:#f4df9d}\
#'+ROOT+' .srForgeMeta253{font-size:8px;font-weight:800;color:#97a8c1;margin:4px 4px 7px}#'+ROOT+' .srForgeMeta253 b{color:var(--r)}\
#'+ROOT+' .srForgeGain253{position:absolute;left:50%;bottom:-19px;transform:translateX(-50%);white-space:nowrap;border:1px solid #557395;background:#111b2b;padding:3px 6px;border-radius:8px;color:#a8e8ff;font-size:8px;font-weight:900}\
#'+ROOT+' .recycleOut{opacity:0;transform:translateY(10px) scale(.45) rotate(-4deg);filter:grayscale(.8) blur(2px)}#'+ROOT+' .keepOut{opacity:0;transform:translateY(-16px) scale(.96)}\
#'+ROOT+' .recycleOut .srForgeImg253 img{animation:srRecycle253 .5s ease-in both}\
#'+ROOT+' .srForgeDust253{position:absolute;left:50%;top:50%;width:4px;height:4px;border-radius:50%;opacity:0}#'+ROOT+' .recycleOut .srForgeDust253{animation:srDust253 .5s ease-out both}\
#'+ROOT+' .srForgeMore253{position:absolute;right:-25px;top:50%;transform:translateY(-50%);border:1px solid #62799a;background:#101a2b;color:#dbe7f7;border-radius:10px;padding:5px 6px;font-size:9px;font-weight:900}\
#srAutoBatch253{margin-top:8px;padding:8px;border:1px solid #314a70;border-radius:12px;background:#0d1728}.srBatchBtns253{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:6px}.srBatch253{appearance:none;border:1px solid #405a80;background:#111d31;color:#b8c6dc;border-radius:9px;padding:7px 2px;font-size:10px;font-weight:900}.srBatch253.on{border-color:#e8b44a;color:#ffe2a0;background:#2a210d;box-shadow:0 0 0 1px #e8b44a55 inset}\
@keyframes srRecycle253{0%{transform:scale(1);opacity:1}45%{transform:scale(.78);filter:brightness(1.7) saturate(.2)}100%{transform:scale(.12) rotate(18deg);opacity:0;filter:blur(3px)}}@keyframes srDust253{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}\
@media(max-width:390px){#'+ROOT+' .srForgeCard253{width:92px;min-height:122px}#'+ROOT+' .srForgeImg253{height:57px}#'+ROOT+' .srForgeImg253 img{width:49px;height:49px}#'+ROOT+' .srForgeGroup253{gap:4px}.srBatchBtns253{gap:4px}.srBatch253{font-size:9px;padding:6px 1px}}\
@media(prefers-reduced-motion:reduce){#'+ROOT+' *{animation:none!important;transition:opacity .1s linear!important}}';document.head.appendChild(st);
window.__srForgeUXV253={batch:batch,enqueue:enqueue,version:253};
})();
