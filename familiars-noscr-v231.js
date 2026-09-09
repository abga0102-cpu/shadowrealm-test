/* Shadowreach V235 loader — V231 runtime removed. */
(function(){
  'use strict';
  if(window.__srFamV235Loader)return;
  window.__srFamV235Loader=true;
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=function(){if(done)done();};
    document.body.appendChild(s);
  }
  load('familiars-noscr-v234.js?v=2026.09.09.235',function(){
    load('familiars-compact-active-v235.js?v=2026.09.09.235');
  });
})();