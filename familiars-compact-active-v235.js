/* Shadowreach V235 — familier équipé compact, détails au tap. Aucun observer. */
(function(){
  'use strict';
  if(window.__srFamCompactActiveV235)return;
  window.__srFamCompactActiveV235=true;
  if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.familiers!=='function')return;

  var base=SCREENS.familiers;
  var expanded=false;

  function compactActive(){
    var p=(S.pets||[]).find(function(x){return x.id===S.activePetId;})||null;
    if(!p)return '<button class="famActiveCompact empty" data-fam-active-toggle="1"><span>'+ic('paw',18)+'</span><b>Aucun familier équipé</b><em>›</em></button>';
    var rc=RARITY[p.rarity].c;
    var pct=petBonus(p)*(1+treeSum(S,'petHp')/100);
    var hp=Math.round(pct);
    var dmg=Math.round(pct*(1+treeSum(S,'petDmg')/100)*(petElement(p).id==='normal'?1.10:1));
    return '<button class="famActiveCompact" data-fam-active-toggle="1" style="--rc:'+rc+'">'+
      '<span class="famActiveThumb"><img src="'+petArt(p)+'" alt=""></span>'+
      '<span class="famActiveTxt"><small>ÉQUIPÉ</small><b>'+esc(petFullName(p))+'</b><i>Niv. '+(p.level||0)+' · '+RARITY[p.rarity].label+'</i></span>'+
      '<span class="famActiveMini"><b>'+ic('sword',9)+' '+dmg+'%</b><i>'+ic('heart',9)+' '+hp+'%</i></span>'+
      '<em class="famActiveChevron">'+(expanded?'⌃':'⌄')+'</em></button>';
  }

  SCREENS.familiers=function(){
    var html=base();
    var tpl=document.createElement('template');
    tpl.innerHTML=html;
    var root=tpl.content.querySelector('.famNs234');
    var hero=root&&root.querySelector('.famNsHero');
    if(!root||!hero)return html;
    var compact=document.createElement('div');
    compact.innerHTML=compactActive();
    var compactNode=compact.firstElementChild;
    if(expanded){
      hero.classList.add('famActiveExpanded');
      hero.insertAdjacentElement('beforebegin',compactNode);
    }else{
      hero.replaceWith(compactNode);
    }
    return tpl.innerHTML;
  };

  var style=document.createElement('style');
  style.id='famCompactActiveV235Style';
  style.textContent=`
    .famActiveCompact{flex:0 0 auto;width:100%;height:56px;border:1px solid var(--rc,var(--border));border-radius:11px;background:linear-gradient(180deg,#18243a,#0d1626);display:grid;grid-template-columns:48px 1fr auto 20px;align-items:center;gap:7px;padding:4px 7px;color:var(--text);box-shadow:inset 0 1px 0 #ffffff14;cursor:pointer;text-align:left}
    .famActiveCompact.empty{grid-template-columns:36px 1fr 20px;color:var(--textDim)}
    .famActiveThumb{width:44px;height:44px;border-radius:9px;border:1px solid var(--rc);background:#0b1322;display:flex;align-items:center;justify-content:center;overflow:hidden}
    .famActiveThumb img{width:42px;height:42px;object-fit:contain;filter:drop-shadow(0 3px 6px #000a)}
    .famActiveTxt{min-width:0;display:flex;flex-direction:column;line-height:1.05}.famActiveTxt small{font-size:6.5px;font-weight:900;color:var(--goldLit);letter-spacing:.8px}.famActiveTxt b{font:900 11px var(--fd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}.famActiveTxt i{font-style:normal;font-size:7px;color:var(--textMute);margin-top:2px}
    .famActiveMini{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:8px;white-space:nowrap}.famActiveMini b{color:#ffb07c}.famActiveMini i{font-style:normal;color:var(--redLit);font-weight:800}
    .famActiveChevron{font-style:normal;font-size:18px;color:var(--goldLit);text-align:center}
    .famActiveExpanded{min-height:86px!important;grid-template-columns:78px 1fr!important;padding:5px!important}.famActiveExpanded>img{width:76px!important;height:76px!important}.famActiveExpanded .famNsName{font-size:12px!important}.famActiveExpanded .famNsHeroBtns{margin-top:4px!important}.famActiveExpanded .famNsStats{font-size:9px!important}
    @media(max-height:700px){.famActiveCompact{height:50px;grid-template-columns:42px 1fr auto 18px}.famActiveThumb{width:38px;height:38px}.famActiveThumb img{width:36px;height:36px}.famActiveTxt b{font-size:10px}.famActiveExpanded{min-height:76px!important;grid-template-columns:68px 1fr!important}.famActiveExpanded>img{width:66px!important;height:66px!important}}
  `;
  document.head.appendChild(style);

  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-fam-active-toggle]');
    if(!t)return;
    expanded=!expanded;
    if(typeof render==='function')render();
  },true);
})();
