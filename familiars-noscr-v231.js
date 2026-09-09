/* Shadowreach V246 loader — infusion recycling + Familiar 3-tab layout + natural scroll + Personal Tree spectacle. */
(function(){
  'use strict';
  if(window.__srFamV246Loader)return;
  window.__srFamV246Loader=true;
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=function(){if(done)done();};
    document.body.appendChild(s);
  }
  load('equipment-recycle-infusion-v239.js?v=2026.09.09.246',function(){
    load('familiars-rates-balance-v237.js?v=2026.09.09.246',function(){
      load('familiars-noscr-v234.js?v=2026.09.09.246',function(){
        load('familiars-compact-active-v235.js?v=2026.09.09.246',function(){
          load('familiars-rates-modal-v236.js?v=2026.09.09.246',function(){
            load('familiars-scroll-layout-v240.js?v=2026.09.09.246',function(){
              load('familiars-tabs-merge-v241.js?v=2026.09.09.246',function(){
                load('familiars-scroll-safearea-v242.js?v=2026.09.09.246',function(){
                  load('familiars-scroll-viewport-v245.js?v=2026.09.09.246',function(){
                    load('familiars-scroll-natural-v246.js?v=2026.09.09.246',function(){
                      load('personal-tree-spectacle-v246.js?v=2026.09.09.246');
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
})();