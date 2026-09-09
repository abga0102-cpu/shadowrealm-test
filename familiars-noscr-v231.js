/* Shadowreach V238 loader — equipment dust refund + Familiar render/rates. */
(function(){
  'use strict';
  if(window.__srFamV238Loader)return;
  window.__srFamV238Loader=true;
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=function(){if(done)done();};
    document.body.appendChild(s);
  }
  load('equipment-dust-refund-v238.js?v=2026.09.09.238',function(){
    load('familiars-rates-balance-v237.js?v=2026.09.09.238',function(){
      load('familiars-noscr-v234.js?v=2026.09.09.238',function(){
        load('familiars-compact-active-v235.js?v=2026.09.09.238',function(){
          load('familiars-rates-modal-v236.js?v=2026.09.09.238');
        });
      });
    });
  });
})();