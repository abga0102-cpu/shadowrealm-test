/* Shadowreach V232 — pagination/compaction pour Familiers V231. */
(function(){
  'use strict';
  if(window.__srFamPageV232)return;window.__srFamPageV232=true;
  var petPage=0,eggPage=0,PAGE=8,scheduled=false;
  function pager(kind,page,total){
    var pages=Math.max(1,Math.ceil(total/PAGE));
    if(pages<=1)return '';
    page=Math.min(page,pages-1);
    return '<div class="famV232Pager"><button data-fam-v232-page="'+kind+'" data-dir="-1" '+(page<=0?'disabled':'')+'>‹</button><span>'+(page+1)+' / '+pages+'</span><button data-fam-v232-page="'+kind+'" data-dir="1" '+(page>=pages-1?'disabled':'')+'>›</button></div>';
  }
  function compactRates(root){
    var box=root.querySelector('.famNsRates');
    if(!box||box.dataset.v232==='1')return;
    var rates=getRates('pet',S.petMastery.level,S.ascension,starsOf(S,'pet'));
    box.dataset.v232='1';
    box.innerHTML='<div class="famV232Rates">'+PET_RARITY_ORDER.map(function(r){return '<span style="--rc:'+RARITY[r].c+'"><b>'+RARITY[r].label+'</b><em>'+Number(rates[r]||0).toFixed(1)+'%</em></span>';}).join('')+'</div>';
  }
  function paginateGrid(root,selector,kind,page){
    var items=Array.from(root.querySelectorAll(selector));
    if(!items.length)return;
    var pages=Math.max(1,Math.ceil(items.length/PAGE));
    page=Math.min(page,pages-1);
    items.forEach(function(el,i){el.style.display=(i>=page*PAGE&&i<(page+1)*PAGE)?'':'none';});
    var grid=items[0].parentElement;if(!grid)return;
    var old=grid.parentElement.querySelector('.famV232Pager[data-kind="'+kind+'"]');if(old)old.remove();
    if(pages>1){var wrap=document.createElement('div');wrap.innerHTML=pager(kind,page,items.length);var p=wrap.firstElementChild;p.dataset.kind=kind;grid.insertAdjacentElement('afterend',p);}
  }
  function enhance(){
    scheduled=false;
    if(typeof route==='undefined'||route!=='familiers')return;
    var root=document.querySelector('.famNs231');if(!root)return;
    compactRates(root);
    paginateGrid(root,'.famNsPet','pet',petPage);
    paginateGrid(root,'.famNsStored','egg',eggPage);
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance);}
  var style=document.createElement('style');style.textContent='.famNsRates{overflow:hidden!important;max-height:none!important}.famV232Rates{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}.famV232Rates span{border:1px solid var(--rc);border-radius:7px;background:#101a2c;padding:4px;text-align:center;display:flex;flex-direction:column}.famV232Rates b{font-size:7px;color:var(--rc)}.famV232Rates em{font-style:normal;font-size:8px}.famV232Pager{height:24px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:8px}.famV232Pager button{width:30px;height:22px;border:1px solid var(--border);border-radius:6px;background:#162034;color:var(--goldLit);font-weight:900}.famV232Pager button:disabled{opacity:.3}';document.head.appendChild(style);
  var screen=document.getElementById('screen');if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:true});
  document.addEventListener('click',function(e){var p=e.target.closest&&e.target.closest('[data-fam-v232-page]');if(!p){schedule();return;}var d=Number(p.dataset.dir)||0;if(p.dataset.famV232Page==='pet')petPage=Math.max(0,petPage+d);else eggPage=Math.max(0,eggPage+d);schedule();},true);
  schedule();
})();
