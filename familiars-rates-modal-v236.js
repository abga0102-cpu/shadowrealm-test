/* Shadowreach V236 — probabilités Familiers dans une fenêtre d'information compacte. */
(function(){
  'use strict';
  if(window.__srFamRatesModalV236)return;
  window.__srFamRatesModalV236=true;
  if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.familiers!=='function')return;

  var base=SCREENS.familiers;

  function ratesButton(){
    return '<button class="famRatesInfoBtn" data-fam-rates-open="1" aria-label="Voir les probabilités d’invocation">'+
      '<span class="famRatesInfoIcon">i</span><span><b>Taux d’invocation</b><small>Voir les probabilités</small></span><em>›</em></button>';
  }

  SCREENS.familiers=function(){
    var html=base();
    var tpl=document.createElement('template');
    tpl.innerHTML=html;
    var rates=tpl.content.querySelector('.famNsRates');
    if(rates){
      var wrap=document.createElement('div');
      wrap.innerHTML=ratesButton();
      rates.replaceWith(wrap.firstElementChild);
    }
    return tpl.innerHTML;
  };

  function buildModal(){
    var old=document.getElementById('famRatesModalV236');
    if(old)old.remove();
    var rates=getRates('pet',S.petMastery.level,S.ascension,starsOf(S,'pet'));
    var next=S.petMastery.level<RULES.MASTERY_MAX?getRates('pet',S.petMastery.level+1,S.ascension,starsOf(S,'pet')):null;
    var rows=PET_RARITY_ORDER.map(function(r){
      var c=RARITY[r].c,label=RARITY[r].label,now=Number(rates[r]||0),nxt=next?Number(next[r]||0):null;
      return '<div class="famRatesRow" style="--rc:'+c+'"><span class="famRatesDot"></span><b>'+esc(label)+'</b><strong>'+now.toFixed(1)+'%</strong>'+(nxt!==null?'<small>Prochain niv. '+nxt.toFixed(1)+'%</small>':'')+'</div>';
    }).join('');
    var modal=document.createElement('div');
    modal.id='famRatesModalV236';
    modal.className='famRatesOverlay';
    modal.innerHTML='<div class="famRatesDialog" role="dialog" aria-modal="true" aria-label="Probabilités d’invocation">'+
      '<div class="famRatesHead"><div><small>MAÎTRISE NIV. '+S.petMastery.level+'</small><h3>Probabilités d’invocation</h3></div><button data-fam-rates-close="1" aria-label="Fermer">×</button></div>'+
      '<div class="famRatesRows">'+rows+'</div>'+
      '<div class="famRatesFoot">Les taux affichés sont ceux utilisés actuellement par le jeu.</div>'+
      '</div>';
    document.body.appendChild(modal);
  }

  var style=document.createElement('style');
  style.id='famRatesModalV236Style';
  style.textContent=`
    .famRatesInfoBtn{width:100%;margin-top:7px;min-height:42px;border:1px solid var(--border);border-radius:10px;background:linear-gradient(180deg,#17243a,#0d1626);color:var(--text);display:grid;grid-template-columns:30px 1fr 18px;align-items:center;gap:7px;padding:5px 8px;text-align:left;cursor:pointer}
    .famRatesInfoIcon{width:26px;height:26px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;color:var(--goldLit);font:900 14px var(--fd);background:#1d1a10}
    .famRatesInfoBtn span:nth-child(2){display:flex;flex-direction:column;min-width:0}.famRatesInfoBtn b{font-size:9px}.famRatesInfoBtn small{font-size:7px;color:var(--textMute);margin-top:1px}.famRatesInfoBtn em{font-style:normal;color:var(--goldLit);font-size:18px;text-align:right}
    .famRatesOverlay{position:fixed;inset:0;z-index:100000;background:#02050bd9;display:flex;align-items:center;justify-content:center;padding:18px}
    .famRatesDialog{width:min(390px,100%);max-height:min(620px,86vh);overflow:hidden;border:1px solid var(--goldDim);border-radius:16px;background:linear-gradient(180deg,#17243a,#0b1322);box-shadow:0 18px 60px #000c,inset 0 1px 0 #ffffff16;padding:12px}
    .famRatesHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:8px;border-bottom:1px solid #ffffff12}.famRatesHead small{font-size:7px;color:var(--goldLit);letter-spacing:.8px;font-weight:900}.famRatesHead h3{margin:2px 0 0;font:900 16px var(--fd);color:var(--text)}.famRatesHead button{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);background:#202d45;color:#fff;font-size:22px;line-height:1;cursor:pointer}
    .famRatesRows{display:grid;gap:6px;margin-top:10px}.famRatesRow{display:grid;grid-template-columns:10px 1fr auto;grid-template-areas:'dot name val' '. next next';align-items:center;gap:2px 7px;border:1px solid color-mix(in srgb,var(--rc) 65%,#20304b);border-radius:9px;background:#0d1727;padding:7px 9px}.famRatesDot{grid-area:dot;width:8px;height:8px;border-radius:50%;background:var(--rc);box-shadow:0 0 8px var(--rc)}.famRatesRow b{grid-area:name;font-size:10px;color:var(--rc)}.famRatesRow strong{grid-area:val;font-size:11px}.famRatesRow small{grid-area:next;text-align:right;font-size:6.5px;color:var(--textMute)}
    .famRatesFoot{margin-top:9px;text-align:center;font-size:7px;color:var(--textMute)}
    @media(max-height:700px){.famRatesDialog{max-height:90vh;padding:10px}.famRatesRows{gap:4px}.famRatesRow{padding:5px 8px}.famRatesHead h3{font-size:14px}}
  `;
  document.head.appendChild(style);

  document.addEventListener('click',function(e){
    var open=e.target.closest&&e.target.closest('[data-fam-rates-open]');
    if(open){buildModal();return;}
    var close=e.target.closest&&e.target.closest('[data-fam-rates-close]');
    if(close){var modal=document.getElementById('famRatesModalV236');if(modal)modal.remove();return;}
    var overlay=document.getElementById('famRatesModalV236');
    if(overlay&&e.target===overlay)overlay.remove();
  },true);
})();