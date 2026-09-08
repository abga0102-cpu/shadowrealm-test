/* SHADOWREACH · Mobile UI source fix V180
   Final-pass fixes for the live home screen: exact HUD alignment, a true circular
   Forge info control, tighter Forge header spacing, and compact non-blocking
   reward/egg notifications. UI only; no gameplay state is touched. */
(function(){
  'use strict';
  if(window.__srMobileFixV180)return;
  window.__srMobileFixV180=true;

  var style=document.createElement('style');
  style.id='srMobileFixV180Style';
  style.textContent=`
#app.srHomeFullArena .homeForge>.fgRow:first-child{
  min-height:30px!important;
  align-items:center!important;
  gap:6px!important;
}
#app.srHomeFullArena .homeForge>.fgRow:first-child .gt{
  line-height:28px!important;
}
#app.srHomeFullArena .homeForge>.fgRow:first-child .iBtn{
  font-family:var(--fd)!important;
  font-size:13px!important;
  font-weight:900!important;
  color:var(--goldLit)!important;
  background:linear-gradient(180deg,#18253d,#0d1627)!important;
  border:1px solid var(--goldDim)!important;
  box-shadow:inset 0 1px 0 #ffffff20,0 1px 3px #0008!important;
}

/* Reward notices remain readable but no longer occupy the middle of combat. */
#app.srHomeFullArena #rewardFeed{
  right:8px!important;
  top:86px!important;
  width:min(176px,46%)!important;
  gap:3px!important;
  z-index:66!important;
  pointer-events:none!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop{
  padding:4px 7px!important;
  min-height:0!important;
  border-radius:8px!important;
  background:linear-gradient(180deg,#17263ee8,#0b1425df)!important;
  box-shadow:0 2px 6px #0006!important;
  backdrop-filter:blur(3px)!important;
  -webkit-backdrop-filter:blur(3px)!important;
  pointer-events:auto!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop .rpT{
  font-size:10px!important;
  line-height:1.15!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop .rpS{
  font-size:8.5px!important;
  line-height:1.15!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop.clickable::after{display:none!important}

@media(max-width:370px){
  #app.srHomeFullArena #rewardFeed{width:min(164px,48%)!important;right:6px!important}
}
`;
  document.head.appendChild(style);

  function important(el,prop,value){
    if(el)el.style.setProperty(prop,value,'important');
  }

  function fixForgeInfo(screen){
    var info=screen&&screen.querySelector('.homeForge .iBtn');
    if(!info)return;
    important(info,'box-sizing','border-box');
    important(info,'width','28px');
    important(info,'height','28px');
    important(info,'min-width','28px');
    important(info,'min-height','28px');
    important(info,'max-width','28px');
    important(info,'max-height','28px');
    important(info,'flex','0 0 28px');
    important(info,'padding','0');
    important(info,'margin','0');
    important(info,'border-radius','50%');
    important(info,'display','inline-flex');
    important(info,'align-items','center');
    important(info,'justify-content','center');
    important(info,'line-height','1');
    important(info,'aspect-ratio','1 / 1');
    info.setAttribute('role','button');
    info.setAttribute('tabindex','0');
    info.setAttribute('aria-label','Informations sur les raretés');
  }

  function alignHud(app){
    if(!app||!app.classList.contains('srHomeFullArena'))return;
    var hud=document.getElementById('hud');
    if(!hud)return;
    var hero=hud.querySelector(':scope > .pbox');
    var actions=hud.querySelector(':scope > .col');
    if(!hero||!actions)return;

    important(hud,'align-items','flex-start');
    important(hero,'margin-top','0');
    important(hero,'align-self','flex-start');
    important(actions,'margin-top','0');
    important(actions,'align-self','flex-start');
    important(actions,'align-items','flex-end');

    /* Mobile rules from earlier revisions can still offset .pbox. Measure the
       rendered boxes and cancel that residual offset exactly. */
    important(hero,'transform','none');
    var a=actions.getBoundingClientRect();
    var h=hero.getBoundingClientRect();
    var dy=a.top-h.top;
    if(Math.abs(dy)>0.5)important(hero,'transform','translateY('+dy.toFixed(1)+'px)');
  }

  var pending=false;
  function apply(){
    pending=false;
    var app=document.getElementById('app');
    var screen=document.getElementById('screen');
    if(!app||!screen)return;
    fixForgeInfo(screen);
    alignHud(app);
  }
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(apply);
  }

  var app=document.getElementById('app');
  if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('resize',schedule);
  schedule();
})();