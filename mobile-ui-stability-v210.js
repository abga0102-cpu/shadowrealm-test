/* SHADOWREACH · Mobile UI stability V210
   - Preserve Familiar screen scroll position when activating a pet.
   - Prevent Rebirth values/actions from overflowing on narrow screens.
   UI-only: no economy, save schema or gameplay values are changed. */
(function(){
  'use strict';
  if(window.__srMobileUiStabilityV210)return;
  window.__srMobileUiStabilityV210=true;

  var screen=document.getElementById('screen');
  if(!screen)return;

  var style=document.createElement('style');
  style.id='srMobileUiStabilityV210';
  style.textContent=`
#screen.srRebirthV210,
#screen.srRebirthV210 *{box-sizing:border-box;}
#screen.srRebirthV210 .card,
#screen.srRebirthV210 .itemRow,
#screen.srRebirthV210 .between,
#screen.srRebirthV210 .row{min-width:0;max-width:100%;}
#screen.srRebirthV210 .between,
#screen.srRebirthV210 .itemRow{flex-wrap:wrap!important;}
#screen.srRebirthV210 .between>.flex1,
#screen.srRebirthV210 .itemRow>.flex1,
#screen.srRebirthV210 .between>div:first-child,
#screen.srRebirthV210 .itemRow>div:first-child{
  min-width:0!important;
  flex:1 1 170px!important;
}
#screen.srRebirthV210 .pill,
#screen.srRebirthV210 .btn{
  max-width:100%!important;
  white-space:normal!important;
  overflow-wrap:anywhere!important;
}
#screen.srRebirthV210 .between>.pill,
#screen.srRebirthV210 .itemRow>.pill,
#screen.srRebirthV210 .between>.btn,
#screen.srRebirthV210 .itemRow>.btn{
  margin-left:auto!important;
  flex:0 1 auto!important;
}
#screen.srRebirthV210 .mute,
#screen.srRebirthV210 .tiny,
#screen.srRebirthV210 .small,
#screen.srRebirthV210 .b,
#screen.srRebirthV210 .bb{
  min-width:0!important;
  max-width:100%!important;
  overflow-wrap:anywhere!important;
}
@media(max-width:430px){
  #screen.srRebirthV210 .card{overflow:hidden;}
  #screen.srRebirthV210 .between{gap:6px!important;align-items:flex-start!important;}
  #screen.srRebirthV210 .itemRow{gap:7px!important;align-items:center!important;}
  #screen.srRebirthV210 .pill{font-size:10px!important;line-height:1.25!important;}
}
`;
  document.head.appendChild(style);

  function norm(s){
    try{return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
    catch(_){return String(s||'').toLowerCase();}
  }
  function classify(){
    var t=norm(screen.textContent);
    screen.classList.toggle('srRebirthV210',t.indexOf('rebirth')>=0);
  }

  var pending=null;
  function isPetActivationTarget(target){
    var ctl=target&&target.closest&&target.closest('button,[role="button"],[data-act]');
    if(!ctl||!screen.contains(ctl))return false;
    var page=norm(screen.textContent);
    if(page.indexOf('familier')<0)return false;
    var label=norm(ctl.textContent);
    if(label.indexOf('activer')>=0)return true;
    var act=norm(ctl.getAttribute('data-act'));
    return act.indexOf('pet')>=0&&(act.indexOf('active')>=0||act.indexOf('equip')>=0||act.indexOf('select')>=0);
  }
  function snapshot(target){
    if(!isPetActivationTarget(target))return;
    pending={
      top:screen.scrollTop,
      left:screen.scrollLeft,
      at:Date.now()
    };
  }
  function restore(){
    if(!pending)return;
    if(Date.now()-pending.at>700){pending=null;return;}
    var p=pending;
    function apply(){
      screen.scrollTop=p.top;
      screen.scrollLeft=p.left;
    }
    requestAnimationFrame(function(){
      apply();
      requestAnimationFrame(apply);
      setTimeout(apply,40);
      setTimeout(function(){apply();pending=null;},120);
    });
  }

  screen.addEventListener('pointerdown',function(e){snapshot(e.target);},true);
  screen.addEventListener('touchstart',function(e){snapshot(e.target);},{capture:true,passive:true});
  screen.addEventListener('click',function(e){
    if(!pending&&isPetActivationTarget(e.target))snapshot(e.target);
    if(pending){
      try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}catch(_){}
      restore();
    }
  },true);

  var mo=new MutationObserver(function(){
    classify();
    if(pending)restore();
  });
  mo.observe(screen,{childList:true,subtree:true});
  classify();
})();