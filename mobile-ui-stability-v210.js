/* SHADOWREACH · Mobile UI stability V211
   - Preserve Familiar scroll continuously across every rerender, not only pet activation.
   - Scope Rebirth layout fixes to the actual Rebirth route.
   UI-only: no economy, save schema or gameplay values are changed. */
(function(){
  'use strict';
  if(window.__srMobileUiStabilityV211)return;
  window.__srMobileUiStabilityV211=true;

  var screen=document.getElementById('screen');
  if(!screen)return;

  /* Tag the actual route output instead of guessing from visible text. */
  try{
    if(typeof SCREENS!=='undefined'&&SCREENS){
      if(typeof SCREENS.familiers==='function'&&!SCREENS.familiers.__srV211){
        var oldFam=SCREENS.familiers;
        var famWrap=function(){return '<div data-sr-route="familiers">'+oldFam()+'</div>';};
        famWrap.__srV211=true;
        SCREENS.familiers=famWrap;
      }
      if(typeof SCREENS.rebirth==='function'&&!SCREENS.rebirth.__srV211){
        var oldRb=SCREENS.rebirth;
        var rbWrap=function(){return '<div data-sr-route="rebirth" class="srRebirthV211">'+oldRb()+'</div>';};
        rbWrap.__srV211=true;
        SCREENS.rebirth=rbWrap;
      }
    }
  }catch(_){ }

  var oldStyle=document.getElementById('srMobileUiStabilityV210');
  if(oldStyle)oldStyle.remove();
  var style=document.createElement('style');
  style.id='srMobileUiStabilityV211';
  style.textContent=`
[data-sr-route="rebirth"],
[data-sr-route="rebirth"] *{box-sizing:border-box;}
[data-sr-route="rebirth"] .card,
[data-sr-route="rebirth"] .itemRow,
[data-sr-route="rebirth"] .between,
[data-sr-route="rebirth"] .row{min-width:0;max-width:100%;}
[data-sr-route="rebirth"] .between,
[data-sr-route="rebirth"] .itemRow{gap:8px;}
[data-sr-route="rebirth"] .between>.flex1,
[data-sr-route="rebirth"] .itemRow>.flex1,
[data-sr-route="rebirth"] .between>div:first-child,
[data-sr-route="rebirth"] .itemRow>div:first-child{
  min-width:0!important;
  flex:1 1 0!important;
}
[data-sr-route="rebirth"] .pill,
[data-sr-route="rebirth"] .btn{
  max-width:46%!important;
  white-space:normal!important;
  overflow-wrap:anywhere!important;
  text-align:center!important;
  flex:0 0 auto!important;
}
[data-sr-route="rebirth"] .between>.pill,
[data-sr-route="rebirth"] .itemRow>.pill,
[data-sr-route="rebirth"] .between>.btn,
[data-sr-route="rebirth"] .itemRow>.btn{margin-left:auto!important;}
[data-sr-route="rebirth"] .mute,
[data-sr-route="rebirth"] .tiny,
[data-sr-route="rebirth"] .small,
[data-sr-route="rebirth"] .b,
[data-sr-route="rebirth"] .bb{
  min-width:0!important;
  max-width:100%!important;
  overflow-wrap:anywhere!important;
}
@media(max-width:430px){
  [data-sr-route="rebirth"] .card{overflow:hidden;}
  [data-sr-route="rebirth"] .between,
  [data-sr-route="rebirth"] .itemRow{align-items:center!important;}
  [data-sr-route="rebirth"] .pill{font-size:10px!important;line-height:1.25!important;}
  [data-sr-route="rebirth"] .btn{font-size:11px!important;}
}
`;
  document.head.appendChild(style);

  var lastFamTop=0;
  var restoring=false;
  var lastRouteFam=false;

  function isFamScreen(){
    return !!screen.querySelector('[data-sr-route="familiers"]');
  }
  function remember(){
    if(restoring||!isFamScreen())return;
    lastFamTop=screen.scrollTop;
    lastRouteFam=true;
  }
  function restoreIfNeeded(){
    var fam=isFamScreen();
    if(!fam){lastRouteFam=false;return;}
    if(!lastRouteFam){
      lastFamTop=screen.scrollTop;
      lastRouteFam=true;
      return;
    }
    var max=Math.max(0,screen.scrollHeight-screen.clientHeight);
    var wanted=Math.max(0,Math.min(lastFamTop,max));
    if(Math.abs(screen.scrollTop-wanted)<1)return;
    restoring=true;
    screen.scrollTop=wanted;
    restoring=false;
  }

  /* Every genuine user scroll updates the desired position continuously. */
  screen.addEventListener('scroll',remember,{passive:true});
  screen.addEventListener('touchmove',remember,{passive:true});
  screen.addEventListener('pointermove',function(e){if(e.pointerType==='touch')remember();},{passive:true});

  /* A game rerender can replace the whole Familiar DOM. MutationObserver runs
     before the next paint, so restoring here prevents the visible upward jump. */
  var mo=new MutationObserver(function(){
    if(!isFamScreen()){lastRouteFam=false;return;}
    restoreIfNeeded();
  });
  mo.observe(screen,{childList:true,subtree:true});

  /* Activation also rerenders, but no delayed multi-restore that fights scrolling. */
  screen.addEventListener('pointerdown',function(){if(isFamScreen())remember();},true);
  screen.addEventListener('touchstart',function(){if(isFamScreen())remember();},{capture:true,passive:true});
  screen.addEventListener('click',function(){if(isFamScreen())remember();},true);
})();