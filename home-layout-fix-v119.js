/* SHADOWREACH · Home layout fix v119
   Fixes Forge panel clipping on tall iPhones and keeps bottom navigation labels,
   especially "Développement", fully inside the safe area. UI only. */
(function(){
  'use strict';
  if(window.__srHomeLayoutFixV119)return;
  window.__srHomeLayoutFixV119=true;
  var s=document.createElement('style');
  s.id='srHomeLayoutFixV119';
  s.textContent=`
#app.srHomeFullArena{--srForgeH:216px!important}
#app.srHomeFullArena #screen.fixed>.pad.mt4{
  flex:0 0 var(--srForgeH)!important;
  height:var(--srForgeH)!important;
  min-height:var(--srForgeH)!important;
  max-height:var(--srForgeH)!important;
  padding:2px 8px 6px!important;
  overflow:hidden!important;
}
#app.srHomeFullArena .homeForge{
  height:100%!important;
  max-height:100%!important;
  overflow:hidden!important;
  padding:5px 7px 7px!important;
}
#app.srHomeFullArena .homeForge .compactAuto{
  flex:0 0 auto!important;
  min-height:34px!important;
  max-height:38px!important;
  margin-top:4px!important;
  padding:4px 7px!important;
}
#app.srHomeFullArena .homeForge .fgFilter{
  flex:0 0 auto!important;
  min-height:28px!important;
  margin-top:4px!important;
  padding:4px 7px!important;
  overflow:hidden!important;
}
#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto){
  flex:0 0 auto!important;
  min-height:42px!important;
  max-height:54px!important;
}
#app.srHomeFullArena>#tabs{
  box-sizing:border-box!important;
  flex:0 0 calc(72px + env(safe-area-inset-bottom))!important;
  height:calc(72px + env(safe-area-inset-bottom))!important;
  min-height:calc(72px + env(safe-area-inset-bottom))!important;
  max-height:calc(72px + env(safe-area-inset-bottom))!important;
  padding-bottom:env(safe-area-inset-bottom)!important;
  overflow:visible!important;
}
#app.srHomeFullArena>#tabs .tab{
  min-width:0!important;
  min-height:72px!important;
  padding:5px 0 4px!important;
  gap:1px!important;
  justify-content:flex-start!important;
  overflow:visible!important;
  line-height:1.05!important;
  font-size:11.5px!important;
  color:#8C9BB6!important;
}
#app.srHomeFullArena>#tabs .tab span{
  font-size:11px!important;
  line-height:1.12!important;
}
#app.srHomeFullArena>#tabs .tab.on{color:var(--goldLit)!important}
#app.srHomeFullArena>#tabs .fantasyNavIcon{
  width:34px!important;
  height:34px!important;
  margin:0 auto 1px!important;
}
#app.srHomeFullArena>#tabs .tab:nth-child(3){
  font-size:10.5px!important;
}
@media(max-width:370px){
  #app.srHomeFullArena{--srForgeH:204px!important}
  #app.srHomeFullArena>#tabs{
    flex-basis:calc(68px + env(safe-area-inset-bottom))!important;
    height:calc(68px + env(safe-area-inset-bottom))!important;
    min-height:calc(68px + env(safe-area-inset-bottom))!important;
    max-height:calc(68px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs .tab{min-height:68px!important;font-size:10.5px!important}
  #app.srHomeFullArena>#tabs .tab span{font-size:10px!important}
  #app.srHomeFullArena>#tabs .fantasyNavIcon{width:31px!important;height:31px!important}
}
@media(max-height:720px){
  #app.srHomeFullArena{--srForgeH:184px!important}
  #app.srHomeFullArena .homeForge .compactAuto{min-height:31px!important;max-height:34px!important}
  #app.srHomeFullArena .homeForge .fgFilter{min-height:24px!important}
  #app.srHomeFullArena>#tabs{
    flex-basis:calc(66px + env(safe-area-inset-bottom))!important;
    height:calc(66px + env(safe-area-inset-bottom))!important;
    min-height:calc(66px + env(safe-area-inset-bottom))!important;
    max-height:calc(66px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs .tab{min-height:66px!important;padding-top:3px!important}
}
`;
  document.head.appendChild(s);
})();
