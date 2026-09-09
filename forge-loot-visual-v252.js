/* SHADOWREACH · Forge Loot Visual V252
   Visual-only feedback for every forged equipment result.
   - Kept results appear as an equipment card, then settle away.
   - Filtered results appear briefly, then dissolve into Dust with a recycle cue.
   - No economy, inventory, forge odds, filter rules, saves or power formulas are changed.
   Runtime authority: wraps the final global forgeSummon after Auto-Forge V199 is loaded.
*/
(function(){
'use strict';
if(window.__srForgeLootVisualV252)return;
window.__srForgeLootVisualV252=true;
if(typeof forgeSummon!=='function')return;

var nativeForgeSummon=forgeSummon;
var queue=[];
var busy=false;
var ROOT='srForgeLootVisual252';
var reduced=false;
try{reduced=!!window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}

var RARITY={
  COMMUN:'#9aa7bb',
  PEU_COMMUN:'#48c77a',
  RARE:'#4aa3ff',
  EPIQUE:'#b15cf6',
  MYTHIQUE:'#ff7a45',
  LEGENDAIRE:'#f1c75b',
  DIVIN:'#f7f1c8'
};
var SLOT_IMG={
  weapon:'art/icons/arme.png',arme:'art/icons/arme.png',
  helmet:'art/icons/casque.png',casque:'art/icons/casque.png',
  armor:'art/icons/armure.png',armure:'art/icons/armure.png',
  gloves:'art/icons/gants.png',gants:'art/icons/gants.png',
  boots:'art/icons/bottes.png',bottes:'art/icons/bottes.png',
  necklace:'art/icons/accessoire.png',collier:'art/icons/accessoire.png',
  ring:'art/icons/accessoire.png',anneau:'art/icons/accessoire.png',
  belt:'art/icons/accessoire.png',ceinture:'art/icons/accessoire.png',
  accessory:'art/icons/accessoire.png',accessoire:'art/icons/accessoire.png'
};
var SLOT_LABEL={weapon:'Arme',arme:'Arme',helmet:'Casque',casque:'Casque',armor:'Armure',armure:'Armure',gloves:'Gants',gants:'Gants',boots:'Bottes',bottes:'Bottes',necklace:'Collier',collier:'Collier',ring:'Anneau',anneau:'Anneau',belt:'Ceinture',ceinture:'Ceinture',accessory:'Accessoire',accessoire:'Accessoire'};

function norm(v){return String(v==null?'':v).trim().toUpperCase().replace(/[ÉÈÊË]/g,'E').replace(/[ÀÂÄ]/g,'A').replace(/[ÙÛÜ]/g,'U').replace(/[ÎÏ]/g,'I').replace(/[ÔÖ]/g,'O').replace(/[^A-Z_]/g,'_');}
function color(r){var k=norm(r);if(k==='PEU__COMMUN')k='PEU_COMMUN';return RARITY[k]||'#8fa3bf';}
function imgFor(slot){var k=String(slot||'').toLowerCase();return SLOT_IMG[k]||'art/icons/accessoire.png';}
function labelFor(slot){var k=String(slot||'').toLowerCase();return SLOT_LABEL[k]||'Équipement';}
function fmt(v){var n=Number(v||0);if(!isFinite(n))return String(v||'');if(Math.abs(n)>=1000000)return (n/1000000).toFixed(n>=10000000?0:1)+'M';if(Math.abs(n)>=1000)return (n/1000).toFixed(n>=10000?0:1)+'K';return Math.round(n).toLocaleString('fr-FR');}
function ensureRoot(){
 var root=document.getElementById(ROOT);if(root)return root;
 root=document.createElement('div');root.id=ROOT;root.setAttribute('aria-live','polite');root.style.cssText='position:fixed;z-index:11050;left:50%;top:56%;width:0;height:0;pointer-events:none;';
 document.body.appendChild(root);return root;
}
function dustParticles(card,c){
 if(reduced)return;
 for(var i=0;i<9;i++){
  var p=document.createElement('i');p.className='srForgeDust252';
  var a=(Math.PI*2*i/9)+(Math.random()*.45-.225),d=42+Math.random()*48;
  p.style.setProperty('--dx',(Math.cos(a)*d).toFixed(1)+'px');
  p.style.setProperty('--dy',(Math.sin(a)*d+18).toFixed(1)+'px');
  p.style.background=c;
  p.style.animationDelay=(Math.random()*70).toFixed(0)+'ms';
  card.appendChild(p);
 }
}
function makeCard(r){
 var recycled=!!r.recycled,c=color(r.rarity),card=document.createElement('div');
 card.className='srForgeLootCard252 '+(recycled?'recycled':'kept');card.style.setProperty('--rarity',c);
 var dust=recycled&&r.dust!=null?'<div class="srForgeDustGain252">+'+fmt(r.dust)+' Poussière</div>':'';
 card.innerHTML='<div class="srForgeLootAura252"></div><div class="srForgeLootState252">'+(recycled?'♻ RECYCLAGE':'NOUVEL ÉQUIPEMENT')+'</div><div class="srForgeLootImgWrap252"><img src="'+imgFor(r.slot)+'" alt=""></div><div class="srForgeLootName252">'+labelFor(r.slot)+'</div><div class="srForgeLootMeta252"><b>'+String(r.rarity||'Équipement').replace(/_/g,' ')+'</b>'+(r.power!=null?' · '+fmt(r.power):'')+'</div>'+dust;
 if(recycled)dustParticles(card,c);
 return card;
}
function next(){
 if(busy||!queue.length)return;
 if(document.hidden){queue.length=0;return;}
 busy=true;var r=queue.shift(),root=ensureRoot(),card=makeCard(r),recycled=!!r.recycled;
 root.appendChild(card);
 requestAnimationFrame(function(){card.classList.add('show');});
 var hold=reduced?220:(recycled?340:700);
 setTimeout(function(){
  card.classList.add(recycled?'recycleOut':'keepOut');
  setTimeout(function(){if(card.parentNode)card.remove();busy=false;next();},reduced?120:(recycled?520:320));
 },hold);
}
function enqueue(results){
 if(!Array.isArray(results)||!results.length||document.hidden)return;
 /* Keep the visual queue bounded during long AUTO sessions / x20 forging. */
 var room=Math.max(0,24-queue.length-(busy?1:0));
 for(var i=0;i<results.length&&i<room;i++)queue.push(results[i]);
 next();
}

forgeSummon=function(){
 var out=nativeForgeSummon.apply(this,arguments);
 try{enqueue(out);}catch(err){console.warn('forge loot visual skipped',err);}
 return out;
};
try{window.forgeSummon=forgeSummon;}catch(_){}

var style=document.createElement('style');style.id='srForgeLootVisual252Style';style.textContent='\
#'+ROOT+' .srForgeLootCard252{--rarity:#8fa3bf;position:absolute;left:0;top:0;width:154px;min-height:184px;transform:translate(-50%,-42%) scale(.72);opacity:0;border:1.5px solid var(--rarity);border-radius:18px;background:linear-gradient(180deg,rgba(18,31,51,.98),rgba(7,13,24,.98));box-shadow:0 18px 42px #000b,0 0 0 1px #ffffff0a,0 0 24px color-mix(in srgb,var(--rarity) 32%,transparent);text-align:center;overflow:visible;font-family:system-ui,-apple-system,sans-serif;will-change:transform,opacity,filter;transition:transform .22s cubic-bezier(.2,.9,.25,1.15),opacity .18s ease,filter .28s ease}\
#'+ROOT+' .srForgeLootCard252.show{transform:translate(-50%,-50%) scale(1);opacity:1}\
#'+ROOT+' .srForgeLootAura252{position:absolute;inset:-22px;border-radius:28px;background:radial-gradient(circle,var(--rarity) 0%,transparent 66%);opacity:.12;filter:blur(10px);z-index:-1}\
#'+ROOT+' .srForgeLootState252{padding:8px 8px 4px;font-size:8px;font-weight:1000;letter-spacing:1.2px;color:#dbe7f7}\
#'+ROOT+' .srForgeLootCard252.recycled .srForgeLootState252{color:#ffb2b2}\
#'+ROOT+' .srForgeLootImgWrap252{width:88px;height:88px;margin:0 auto 1px;display:grid;place-items:center;border-radius:18px;background:radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--rarity) 18%,transparent),transparent 72%);position:relative}\
#'+ROOT+' .srForgeLootImgWrap252:after{content:"";position:absolute;inset:6px;border:1px solid color-mix(in srgb,var(--rarity) 50%,transparent);border-radius:50%;opacity:.55}\
#'+ROOT+' .srForgeLootImgWrap252 img{width:72px;height:72px;object-fit:contain;filter:drop-shadow(0 7px 8px #0009);position:relative;z-index:2}\
#'+ROOT+' .srForgeLootName252{font:900 13px/1.1 Georgia,serif;color:#f6e2a7;margin-top:1px}\
#'+ROOT+' .srForgeLootMeta252{font-size:9px;font-weight:800;color:#9eacc3;margin:5px 7px 8px;text-transform:capitalize}\
#'+ROOT+' .srForgeLootMeta252 b{color:var(--rarity)}\
#'+ROOT+' .srForgeDustGain252{position:absolute;left:50%;bottom:-23px;transform:translateX(-50%);white-space:nowrap;padding:4px 8px;border-radius:10px;background:#121b2c;border:1px solid #5b7091;color:#a8e8ff;font-size:9px;font-weight:900;opacity:0;animation:srDustGain252 .6s .18s both}\
#'+ROOT+' .srForgeLootCard252.recycleOut{transform:translate(-50%,-46%) scale(.72) rotate(-3deg);opacity:0;filter:grayscale(.8) blur(2px)}\
#'+ROOT+' .srForgeLootCard252.recycleOut .srForgeLootImgWrap252 img{animation:srRecycleImg252 .46s ease-in both}\
#'+ROOT+' .srForgeLootCard252.keepOut{transform:translate(-50%,-62%) scale(.96);opacity:0}\
#'+ROOT+' .srForgeDust252{position:absolute;left:50%;top:50%;width:5px;height:5px;border-radius:50%;opacity:0;z-index:5}\
#'+ROOT+' .srForgeLootCard252.recycleOut .srForgeDust252{animation:srForgeDust252 .48s ease-out both}\
@keyframes srRecycleImg252{0%{transform:scale(1);opacity:1;filter:none}45%{transform:scale(.86) rotate(4deg);filter:brightness(1.8) saturate(.3)}100%{transform:scale(.18) rotate(15deg);opacity:0;filter:blur(3px)}}\
@keyframes srForgeDust252{0%{transform:translate(0,0) scale(.5);opacity:0}22%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.08);opacity:0}}\
@keyframes srDustGain252{0%{opacity:0;transform:translate(-50%,7px)}35%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-12px)}}\
@media(max-width:390px){#'+ROOT+'{top:54%}#'+ROOT+' .srForgeLootCard252{width:144px;min-height:174px}#'+ROOT+' .srForgeLootImgWrap252{width:82px;height:82px}#'+ROOT+' .srForgeLootImgWrap252 img{width:67px;height:67px}}\
@media(prefers-reduced-motion:reduce){#'+ROOT+' .srForgeLootCard252,#'+ROOT+' .srForgeLootCard252 *{animation:none!important;transition:opacity .1s linear!important}}';document.head.appendChild(style);

window.__srForgeLootVisualV252={enqueue:enqueue,version:252};
})();
