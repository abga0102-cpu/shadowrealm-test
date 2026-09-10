/* SHADOWREACH V309 · Familiar flat-stat UI authority
   QA/UX correction for the already-approved V286/V305 Familiar model.

   The late Familiar UI stack (V234/V240/V241...) can finish loading after the
   static progression authorities. Those renderers still expose the retired
   Apple/level model and calculate visible bonuses through petBonus(), which V286
   intentionally neutralized to 0. The gameplay stats are correct; the screen can
   therefore show 0% / 0%, Niv. 0 and an Apple resource that no longer exists.

   V309 changes presentation only:
   - removes every live Apple control/counter from the Familiar screen;
   - removes inert Familiar levels from the live UI;
   - displays the authoritative flat DGT/PV contribution from V305;
   - tolerates the asynchronous Familiar renderer chain by re-wrapping only when
     SCREENS.familiers ownership actually changes.
   No economy, save schema, owned Familiar, rarity, fusion or combat value changes. */
(function(){'use strict';
if(window.__srFamiliarFlatUIV309)return;
window.__srFamiliarFlatUIV309=true;

var installs=0,lastOwner=null;

function activePet(){
  try{return (S.pets||[]).find(function(p){return p&&p.id===S.activePetId;})||null;}catch(_){return null;}
}
function flatStats(p){
  if(!p)return {damage:0,hp:0};
  try{
    if(typeof window.__srV305PetStats==='function')return window.__srV305PetStats(p,S);
    if(typeof window.__srV286PetStats==='function')return window.__srV286PetStats(p,S);
  }catch(_){ }
  return {damage:0,hp:0};
}
function compact(n){
  n=Math.max(0,Math.round(Number(n)||0));
  try{if(typeof fmt==='function')return fmt(n);}catch(_){ }
  try{return new Intl.NumberFormat('fr-FR').format(n);}catch(_){return String(n);}
}
function rarityLabel(p){
  try{return RARITY[p.rarity].label;}catch(_){return String((p&&p.rarity)||'');}
}
function petById(id){
  try{return (S.pets||[]).find(function(p){return p&&p.id===id;})||null;}catch(_){return null;}
}
function starsLabel(){
  var st=0;try{st=Math.max(0,Math.floor(Number(S.stars&&S.stars.pet)||0));}catch(_){ }
  return st>0?' · '+st+'★':'';
}
function markStats(node,ps,mode){
  if(!node)return;
  node.setAttribute('data-fam-flat-damage',String(Math.round(ps.damage||0)));
  node.setAttribute('data-fam-flat-hp',String(Math.round(ps.hp||0)));
  if(mode==='compact'){
    node.innerHTML='<b>'+ic('sword',9)+' +'+compact(ps.damage)+' DGT</b><i>'+ic('heart',9)+' +'+compact(ps.hp)+' PV</i>';
  }else if(mode==='legacy'){
    node.innerHTML='<b>'+ic('sword',12)+' +'+compact(ps.damage)+' DGT</b><b>'+ic('heart',12)+' +'+compact(ps.hp)+' PV</b>';
  }else{
    node.innerHTML='<b>'+ic('sword',11)+' +'+compact(ps.damage)+' DGT</b><b>'+ic('heart',11)+' +'+compact(ps.hp)+' PV</b>';
  }
}
function rewriteLevelNode(node,p){
  if(!node||!p)return;
  node.textContent=rarityLabel(p)+starsLabel();
}
function modernize(html){
  if(typeof html!=='string')return html;
  var tpl=document.createElement('template');
  try{tpl.innerHTML=html;}catch(_){return html;}
  var root=tpl.content;

  /* Retired Apple entry points: resource pills and upgrade actions. */
  Array.prototype.slice.call(root.querySelectorAll('[data-arg="apples"],.fam240Res.apple,[data-act="upgradePet"]')).forEach(function(el){el.remove();});

  /* Old fusion copy can survive in fallback renderers. */
  Array.prototype.slice.call(root.querySelectorAll('.famDetailsBody,.mute,.tiny')).forEach(function(el){
    if(/Pommes? investies/i.test(el.textContent||'')){
      el.textContent='La progression des Familiers se fait par rareté, fusion et Ascension.';
    }
  });

  var active=activePet(),ps=flatStats(active);
  if(active){
    /* Current V240/V241 owner. */
    markStats(root.querySelector('.fam240HeroStats'),ps,'current');
    rewriteLevelNode(root.querySelector('.fam240HeroInfo span'),active);

    /* Earlier wrappers remain covered if the async chain partially loads. */
    markStats(root.querySelector('.famActiveMini'),ps,'compact');
    rewriteLevelNode(root.querySelector('.famActiveTxt i'),active);
    markStats(root.querySelector('.famNsStats'),ps,'legacy');
    Array.prototype.slice.call(root.querySelectorAll('.famNsHero .pill')).forEach(function(el){if(/^\s*Niv\./i.test(el.textContent||''))el.remove();});
    var bonus=root.querySelector('.famBonusMain');
    if(bonus){
      bonus.setAttribute('data-fam-flat-damage',String(Math.round(ps.damage||0)));
      bonus.setAttribute('data-fam-flat-hp',String(Math.round(ps.hp||0)));
      bonus.innerHTML='<div class="famSubtle">BONUS FAMILIER</div><b>'+ic('sword',14)+' +'+compact(ps.damage)+' DGT</b><div class="tiny" style="color:var(--redLit);margin-top:3px">'+ic('heart',10)+' +'+compact(ps.hp)+' PV</div>';
    }
  }

  /* Collection tiles must no longer advertise the inert legacy level. */
  Array.prototype.slice.call(root.querySelectorAll('.fam240Pet,.famNsPet,.famTile')).forEach(function(tile){
    var p=petById(tile.getAttribute('data-arg'));
    if(!p)return;
    var lv=tile.querySelector('small,.famTileLv');
    if(lv)rewriteLevelNode(lv,p);
  });
  /* Very old comparison cards do not expose a stable pet id; remove their inert
     level line instead of guessing which Familiar the card represents. */
  Array.prototype.slice.call(root.querySelectorAll('.famComparePet')).forEach(function(card){
    var lv=Array.prototype.slice.call(card.querySelectorAll('.tiny')).find(function(el){return /^\s*Niv\./i.test(el.textContent||'');});
    if(lv)lv.remove();
  });

  return tpl.innerHTML;
}

function install(){
  try{
    if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.familiers!=='function')return false;
    var current=SCREENS.familiers;
    if(current.__srV309){lastOwner=current;return true;}
    if(current===lastOwner)return true;
    var base=current;
    var wrapped=function(){return modernize(base.apply(this,arguments));};
    wrapped.__srV309=true;
    wrapped.__srPrevious=base;
    SCREENS.familiers=wrapped;
    lastOwner=wrapped;
    installs++;
    window.__srFamiliarFlatUIInstallCountV309=installs;
    return true;
  }catch(_){return false;}
}

/* The Familiar renderer chain is dynamically injected by V231 and can replace
   SCREENS.familiers after this static file executes. Re-check a bounded set of
   times; each pass is a no-op unless ownership changed. No MutationObserver. */
[0,40,120,260,520,900,1500,2400,3600].forEach(function(ms){setTimeout(function(){
  install();
  try{if(route==='familiers'&&typeof scheduleRender==='function')scheduleRender();}catch(_){ }
},ms);});
try{window.addEventListener('load',install,{once:true});}catch(_){ }
install();

window.__srFamiliarFlatUIConfigV309={
  applesVisible:false,
  legacyLevelsVisible:false,
  flatStatsVisible:true,
  asyncRendererSafe:true,
  destructiveMigration:false,
  economyRebalanced:false,
  saveSchemaChanged:false
};
})();
