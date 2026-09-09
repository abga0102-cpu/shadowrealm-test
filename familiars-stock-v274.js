/* SHADOWREACH V274 — Egg stock authority
   - Strongest stored eggs first.
   - Summoning lives directly in the stored-egg section.
   - Removes duplicate summon controls from the mastery details panel.
   UI-only: no rates, costs, timers, save shape or hatch mechanics changed. */
(function(){
'use strict';
if(window.__srFamiliarsStockV274)return;
window.__srFamiliarsStockV274=true;

function patch(){
  if(typeof window.scrFamiliers!=='function' || typeof SCREENS==='undefined')return false;
  var previous=window.scrFamiliers;
  if(previous.__srV274)return true;

  function render(){
    var html=previous();
    try{
      /* V229 already renders stored eggs from eggsStored(S). Sort the backing
         stored list only for this render, strongest rarity first, while keeping
         equal-rarity acquisition order stable. */
      var stored=typeof eggsStored==='function'?eggsStored(S):[];
      var rank=function(r){return typeof PET_RARITY_ORDER!=='undefined'?PET_RARITY_ORDER.indexOf(r):-1;};
      stored.sort(function(a,b){return rank(b.rarity)-rank(a.rarity);});

      /* The previous render has already produced the stock cards, so reorder
         their complete card HTML using the egg ids is not available in markup.
         Instead rebuild the stock shelf from the same canonical V229 helper
         when it is globally exposed; otherwise DOM post-sort below is used. */
      var cost=typeof PET_SUMMON_COST!=='undefined'?PET_SUMMON_COST:0;
      var summon='<div class="famStockSummonV274" style="grid-column:1/-1;margin-bottom:2px">'+
        '<div class="between" style="margin-bottom:6px"><span class="famSubtle">INVOQUER DES ŒUFS</span><span class="famSubtle">'+(typeof ic==='function'?ic('essence',10):'')+' '+(typeof fmt==='function'?fmt(S.essence||0):(S.essence||0))+'</span></div>'+
        '<div class="row gap6">'+
        btn((typeof ic==='function'?ic('egg',13):'')+' Invoquer · '+cost,{small:true,act:'summonEgg',arg:1,dis:(S.essence||0)<cost})+
        btn('x10 · '+(cost*10),{small:true,act:'summonEgg',arg:10,dis:(S.essence||0)<cost*10,style:'max-width:86px'})+
        '</div></div>';
      html=html.replace(/(<div class="famSectionHead"><span>Œufs stockés \([^<]*<\/span>[\s\S]*?<\/div>\s*<div class="famEggShelf">)/,function(m){return m+summon;});

      /* Remove the old duplicate invocation row from Maîtrise & invocations.
         Rates/mastery stay there; only the summon buttons move to stock. */
      html=html.replace(/<div class="row gap6 mt8"><button[\s\S]*?data-act="summonEgg"[\s\S]*?data-arg="10"[\s\S]*?<\/button><\/div>/,'');
    }catch(_){ }
    return html;
  }
  render.__srV274=true;
  window.scrFamiliers=render;
  SCREENS.familiers=render;

  /* Stable post-render sort: cards carry startEgg + egg id. We map ids back to
     canonical stored eggs, then reorder only cards, leaving summon controls first. */
  var screen=document.getElementById('screen');
  if(screen&&!window.__srFamStockObserverV274){
    window.__srFamStockObserverV274=true;
    var busy=false;
    var sortDom=function(){
      if(busy)return;var root=screen.querySelector('.famV229');if(!root)return;
      var heads=root.querySelectorAll('.famSectionHead'),head=null;
      for(var i=0;i<heads.length;i++)if((heads[i].textContent||'').indexOf('Œufs stockés')>=0){head=heads[i];break;}
      if(!head)return;var shelf=head.nextElementSibling;if(!shelf||!shelf.classList.contains('famEggShelf'))return;
      var stored=typeof eggsStored==='function'?eggsStored(S):[];
      var byId={};stored.forEach(function(e){byId[String(e.id)]=e;});
      var order=typeof PET_RARITY_ORDER!=='undefined'?PET_RARITY_ORDER:[];
      var cards=Array.prototype.slice.call(shelf.querySelectorAll('.famEgg')).filter(function(el){return el.querySelector('[data-act="startEgg"]');});
      cards.sort(function(a,b){
        var aa=a.querySelector('[data-act="startEgg"]'),bb=b.querySelector('[data-act="startEgg"]');
        var ea=aa&&byId[String(aa.getAttribute('data-arg'))],eb=bb&&byId[String(bb.getAttribute('data-arg'))];
        return order.indexOf(eb&&eb.rarity)-order.indexOf(ea&&ea.rarity);
      });
      busy=true;cards.forEach(function(c){shelf.appendChild(c);});busy=false;
    };
    var mo=new MutationObserver(sortDom);mo.observe(screen,{childList:true,subtree:true});
    setTimeout(sortDom,0);
  }
  return true;
}
if(!patch())setTimeout(patch,0);
})();