/* Shadowreach V236 loader — single Familiar render + compact active + rates modal. */
(function(){
  'use strict';
  if(window.__srFamV236Loader)return;
  window.__srFamV236Loader=true;
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=function(){if(done)done();};
    document.body.appendChild(s);
  }
  load('familiars-noscr-v234.js?v=2026.09.09.236',function(){
    load('familiars-compact-active-v235.js?v=2026.09.09.236',function(){
      load('familiars-rates-modal-v236.js?v=2026.09.09.236');
    });
  });
})();