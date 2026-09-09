/* Shadowreach V237 loader — Familiar render + compact active + balanced rarity curve + rates modal. */
(function(){
  'use strict';
  if(window.__srFamV237Loader)return;
  window.__srFamV237Loader=true;
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=function(){if(done)done();};
    document.body.appendChild(s);
  }
  load('familiars-rates-balance-v237.js?v=2026.09.09.237',function(){
    load('familiars-noscr-v234.js?v=2026.09.09.237',function(){
      load('familiars-compact-active-v235.js?v=2026.09.09.237',function(){
        load('familiars-rates-modal-v236.js?v=2026.09.09.237');
      });
    });
  });
})();