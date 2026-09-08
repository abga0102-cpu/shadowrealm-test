/* SHADOWREACH · Development bottom-nav position V186 · visual-only revision
   Keep the direct Development fantasy icon aligned with the other tabs.
   No DOM writes, MutationObservers, route changes, or interaction handlers. */
(function(){
  'use strict';
  if(window.__srDevelopmentNavV186)return;
  window.__srDevelopmentNavV186=true;

  var old=document.getElementById('srDevelopmentNavV186');
  if(old)old.remove();

  var style=document.createElement('style');
  style.id='srDevelopmentNavV186';
  style.textContent=`
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{
  position:absolute!important;
  left:50%!important;
  top:3px!important;
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  margin:0!important;
  padding:0!important;
  transform:translateX(-50%)!important;
  display:block!important;
  line-height:0!important;
}
#app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon):not(.dot){
  position:absolute!important;
  left:0!important;
  right:0!important;
  top:40px!important;
  display:block!important;
  width:100%!important;
  height:14px!important;
  margin:0!important;
  padding:0!important;
  transform:none!important;
  line-height:14px!important;
  font-size:10px!important;
  letter-spacing:.2px!important;
  text-align:center!important;
  white-space:nowrap!important;
  overflow:hidden!important;
}
@media(max-width:370px),(max-height:720px){
  #app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{
    top:2px!important;
    width:31px!important;
    height:31px!important;
    min-width:31px!important;
    min-height:31px!important;
    max-width:31px!important;
    max-height:31px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon):not(.dot){
    top:36px!important;
    font-size:9.5px!important;
  }
}
`;
  document.head.appendChild(style);
})();
