/* SHADOWREACH V275 — Egg stock authority
   Fixes V274 being superseded by the later async Familiar renderer stack.
   - Stored eggs: strongest rarity first.
   - Summon x1/x10 controls live inside the Eggs tab.
   - Duplicate summon controls are removed from Progression.
   UI-only: costs, rates, timers, save format and hatch mechanics are untouched. */
(function(){
'use strict';
if(window.__srFamStockAuthorityV275)return;
window.__srFamStockAuthorityV275=true;

function install(){
  if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.familiers!=='function')return false;
  /* Wait for the final Familiar renderer chain (V240 + V241) so this layer
     cannot be overwritten a few milliseconds later. */
  if(!window.__srFamScrollLayoutV240||!window.__srFamTabsMergeV241)return false;
  if(SCREENS.familiers.__srFamStockAuthorityV275)return true;

  var base=SCREENS.familiers;
  function rank(r){return typeof PET_RARITY_ORDER!=='undefined'?PET_RARITY_ORDER.indexOf(r):-1;}
  function summonPanel(){
    var cost=Number(typeof PET_SUMMON_COST!=='undefined'?PET_SUMMON_COST:0)||0;
    return '<section class="fam275Summon">'+
      '<div class="fam275SummonHead"><b>Invoquer des œufs</b><span>'+ic('essence',10)+' '+fmt(S.essence||0)+'</span></div>'+
      '<div class="row gap6">'+
      btn(ic('egg',12)+' Invoquer · '+cost,{small:true,act:'summonEgg',arg:1,dis:(S.essence||0)<cost})+
      btn('x10 · '+(cost*10),{small:true,act:'summonEgg',arg:10,dis:(S.essence||0)<cost*10,style:'max-width:100px'})+
      '</div></section>';
  }

  function renderV275(){
    var html=base();
    try{
      var tpl=document.createElement('template');tpl.innerHTML=html;
      var root=tpl.content.querySelector('.famScroll240');
      if(!root)return html;
      var active=root.querySelector('.fam240Tab.on');
      var tab=active&&active.getAttribute('data-fam240-tab');
      var scroll=root.querySelector('.fam240Body .fam240Scroll');
      if(!scroll)return html;

      if(tab==='eggs'){
        var grid=scroll.querySelector('.fam240StoredGrid');
        if(grid){
          var stored=typeof eggsStored==='function'?eggsStored(S):[];
          var cards=Array.prototype.slice.call(grid.querySelectorAll(':scope > .fam240Stored'));
          var pairs=cards.map(function(node,i){return{node:node,egg:stored[i]||null,i:i};});
          pairs.sort(function(a,b){
            var d=rank(b.egg&&b.egg.rarity)-rank(a.egg&&a.egg.rarity);
            return d||a.i-b.i;
          });
          pairs.forEach(function(p){grid.appendChild(p.node);});
          var holder=document.createElement('div');holder.innerHTML=summonPanel();
          if(holder.firstElementChild)scroll.insertBefore(holder.firstElementChild,grid);
        }
      }else if(tab==='progress'){
        var summonBtns=scroll.querySelectorAll('[data-act="summonEgg"]');
        summonBtns.forEach(function(b){
          var row=b.closest('.row');
          if(row)row.remove();else b.remove();
        });
      }
      return tpl.innerHTML;
    }catch(_){return html;}
  }
  renderV275.__srFamStockAuthorityV275=true;
  SCREENS.familiers=renderV275;

  if(!document.getElementById('famStockAuthorityV275Style')){
    var st=document.createElement('style');st.id='famStockAuthorityV275Style';st.textContent=`
.fam275Summon{margin:2px 0 8px;padding:8px;border:1px solid rgba(232,180,74,.34);border-radius:10px;background:linear-gradient(145deg,#18170f,#101827)}
.fam275SummonHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}.fam275SummonHead b{font:900 10px var(--fd);color:var(--goldLit)}.fam275SummonHead span{font-size:8px;color:#ffc29b;font-weight:800}
`;
    document.head.appendChild(st);
  }
  if(typeof render==='function')render();
  return true;
}

var tries=0;
(function waitFinal(){
  if(install())return;
  if(++tries<120)setTimeout(waitFinal,50);
})();
})();