/* Shadowreach V242 loader — infusion recycling + Familiar full-screen scroll layout + 3-tab merge + safe bottom scroll. */
(function(){
  'use strict';
  if(window.__srFamV242Loader)return;
  window.__srFamV242Loader=true;
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=function(){if(done)done();};
    document.body.appendChild(s);
  }
  load('equipment-recycle-infusion-v239.js?v=2026.09.09.242',function(){
    load('familiars-rates-balance-v237.js?v=2026.09.09.242',function(){
      load('familiars-noscr-v234.js?v=2026.09.09.242',function(){
        load('familiars-compact-active-v235.js?v=2026.09.09.242',function(){
          load('familiars-rates-modal-v236.js?v=2026.09.09.242',function(){
            load('familiars-scroll-layout-v240.js?v=2026.09.09.242',function(){
              load('familiars-tabs-merge-v241.js?v=2026.09.09.242',function(){
                load('familiars-scroll-safearea-v242.js?v=2026.09.09.242');
              });
            });
          });
        });
      });
    });
  });
})();