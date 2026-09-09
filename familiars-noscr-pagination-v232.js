/* Shadowreach V233 — pagination/compaction pour Familiers sans scroll. */
(function(){
  'use strict';
  if(window.__srFamPageV233)return;window.__srFamPageV233=true;
  var petPage=0,eggPage=0,hatchPage=0,accelPage=0,fusionPage=0,scheduled=false;
  function compactRates(root){
    var box=root.querySelector('.famNsRates');
    if(!box||box.dataset.v233==='1')return;
    var rates=getRates('pet',S.petMastery.level,S.ascension,starsOf(S,'pet'));
    box.dataset.v233='1';
    box.innerHTML='<div class="famV232Rates">'+PET_RARITY_ORDER.map(function(r){return '<span style="--rc:'+RARITY[r].c+'"><b>'+RARITY[r].label+'</b><em>'+Number(rates[r]||0).toFixed(1)+'%</em></span>';}).join('')+'</div>';
  }
  function setPage(kind,page){if(kind==='pet')petPage=page;else if(kind==='egg')eggPage=page;else if(kind==='hatch')hatchPage=page;else if(kind==='accel')accelPage=page;else if(kind==='fusion')fusionPage=page;}
  function syncPager(root,kind,page,pages,anchor){
    var p=root.querySelector('.famV232Pager[data-kind="'+kind+'"]');
    if(pages<=1){if(p)p.remove();return;}
    if(!p){
      p=document.createElement('div');p.className='famV232Pager';p.dataset.kind=kind;
      p.innerHTML='<button data-fam-v232-page="'+kind+'" data-dir="-1">‹</button><span></span><button data-fam-v232-page="'+kind+'" data-dir="1">›</button>';
      if(anchor)anchor.insertAdjacentElement('afterend',p);
    }
    var prev=p.querySelector('[data-dir="-1"]'),next=p.querySelector('[data-dir="1"]'),label=p.querySelector('span');
    if(label)label.textContent=(page+1)+' / '+pages;
    if(prev)prev.disabled=page<=0;
    if(next)next.disabled=page>=pages-1;
  }
  function paginate(root,selector,kind,page,pageSize,after){
    var items=Array.from(root.querySelectorAll(selector));
    if(!items.length){syncPager(root,kind,0,1,null);return;}
    var pages=Math.max(1,Math.ceil(items.length/pageSize));
    page=Math.min(page,pages-1);setPage(kind,page);
    items.forEach(function(el,i){var show=i>=page*pageSize&&i<(page+1)*pageSize;el.style.display=show?'':'none';});
    syncPager(root,kind,page,pages,after||items[0].parentElement);
  }
  function enhance(){
    scheduled=false;
    if(typeof route==='undefined'||route!=='familiers')return;
    var root=document.querySelector('.famNs231');if(!root)return;
    compactRates(root);
    paginate(root,'.famNsPet','pet',petPage,8);
    paginate(root,'.famNsStored','egg',eggPage,8);
    var hatchRow=root.querySelector('.famNsHatchRow');if(hatchRow)paginate(root,'.famNsEgg','hatch',hatchPage,2,hatchRow);else syncPager(root,'hatch',0,1,null);
    var utility=root.querySelector('.famNsUtility');
    if(utility){
      var accelAnchor=utility.querySelector('.famNsAccelRow');if(accelAnchor)paginate(root,'.famNsAccelRow','accel',accelPage,2,accelAnchor.parentElement);else syncPager(root,'accel',0,1,null);
      var fusion=root.querySelector('.famNsFusion');if(fusion)paginate(root,'.famNsFusion>div','fusion',fusionPage,4,fusion);else syncPager(root,'fusion',0,1,null);
    }else{syncPager(root,'accel',0,1,null);syncPager(root,'fusion',0,1,null);}
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance);}
  var style=document.createElement('style');style.id='famV233PaginationStyle';style.textContent=`
    #screen:has(.famNs231){display:flex!important;flex-direction:column!important;overflow:hidden!important;overscroll-behavior:none}
    #screen:has(.famNs231)>#topbar{flex:0 0 auto!important}
    .famNs231{height:auto!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden!important}
    .famNsRates{overflow:hidden!important;max-height:none!important}
    .famV232Rates{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
    .famV232Rates span{border:1px solid var(--rc);border-radius:7px;background:#101a2c;padding:4px;text-align:center;display:flex;flex-direction:column;min-width:0}
    .famV232Rates b{font-size:7px;color:var(--rc);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .famV232Rates em{font-style:normal;font-size:8px}
    .famV232Pager{height:22px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:8px;flex:0 0 auto}
    .famV232Pager button{width:30px;height:20px;border:1px solid var(--border);border-radius:6px;background:#162034;color:var(--goldLit);font-weight:900;padding:0}
    .famV232Pager button:disabled{opacity:.3}
    .famNsHatch+.famV232Pager{margin-top:-2px}
    .famNsUtility>.famV232Pager{margin:1px 0 3px}
    @media(max-height:700px){.famV232Pager{height:18px}.famV232Pager button{height:18px}.famV232Rates{gap:3px}.famV232Rates span{padding:3px}}
  `;document.head.appendChild(style);
  var screen=document.getElementById('screen');if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:true});
  document.addEventListener('click',function(e){
    var p=e.target.closest&&e.target.closest('[data-fam-v232-page]');
    if(!p){schedule();return;}
    var d=Number(p.dataset.dir)||0,kind=p.dataset.famV232Page;
    if(kind==='pet')petPage=Math.max(0,petPage+d);
    else if(kind==='egg')eggPage=Math.max(0,eggPage+d);
    else if(kind==='hatch')hatchPage=Math.max(0,hatchPage+d);
    else if(kind==='accel')accelPage=Math.max(0,accelPage+d);
    else if(kind==='fusion')fusionPage=Math.max(0,fusionPage+d);
    schedule();
  },true);
  schedule();
})();