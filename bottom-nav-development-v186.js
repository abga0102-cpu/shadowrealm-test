/* SHADOWREACH · Development bottom-nav position V186
   The fantasy replacement can be inserted directly under the Development tab
   instead of inside .ico. V185 then mistakes that span for the text label and
   pushes it down. This final owner excludes fantasy icons from label geometry
   and anchors direct icons to the same coordinates as the other three tabs. */
(function(){
  'use strict';
  if(window.__srDevelopmentNavV186)return;
  window.__srDevelopmentNavV186=true;

  var style=document.createElement('style');
  style.id='srDevelopmentNavV186';
  style.textContent=`
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{
  position:absolute!important;
  left:50%!important;
  top:3px!important;
  width:34px!important;height:34px!important;
  min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;
  margin:0!important;padding:0!important;
  transform:translateX(-50%)!important;
  display:block!important;
  line-height:0!important;
}
#app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon){
  position:absolute!important;
  left:0!important;right:0!important;top:40px!important;
  display:block!important;
  width:100%!important;height:14px!important;
  margin:0!important;padding:0!important;
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
    width:31px!important;height:31px!important;
    min-width:31px!important;min-height:31px!important;
    max-width:31px!important;max-height:31px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon){top:36px!important;font-size:9.5px!important}
}
`;
  document.head.appendChild(style);

  function imp(el,p,v){if(el)el.style.setProperty(p,v,'important');}
  function apply(){
    var app=document.getElementById('app');
    var tabs=document.getElementById('tabs');
    if(!app||!tabs||!app.classList.contains('srHomeFullArena'))return;

    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),function(tab){
      var directIcon=tab.querySelector(':scope > .fantasyNavIcon');
      if(directIcon){
        imp(directIcon,'position','absolute');imp(directIcon,'left','50%');imp(directIcon,'top','3px');
        imp(directIcon,'width','34px');imp(directIcon,'height','34px');imp(directIcon,'min-width','34px');imp(directIcon,'min-height','34px');
        imp(directIcon,'max-width','34px');imp(directIcon,'max-height','34px');imp(directIcon,'margin','0');imp(directIcon,'padding','0');
        imp(directIcon,'transform','translateX(-50%)');imp(directIcon,'display','block');imp(directIcon,'line-height','0');
      }
      var label=tab.querySelector(':scope > span:not(.ico):not(.fantasyNavIcon)');
      if(label){
        imp(label,'position','absolute');imp(label,'left','0');imp(label,'right','0');imp(label,'top','40px');
        imp(label,'display','block');imp(label,'width','100%');imp(label,'height','14px');imp(label,'margin','0');imp(label,'padding','0');
        imp(label,'transform','none');imp(label,'line-height','14px');imp(label,'font-size','10px');imp(label,'letter-spacing','.2px');
        imp(label,'text-align','center');imp(label,'white-space','nowrap');imp(label,'overflow','hidden');
      }
    });
  }

  var tabs=document.getElementById('tabs');
  if(tabs)new MutationObserver(apply).observe(tabs,{childList:true,subtree:true});
  var app=document.getElementById('app');
  if(app)new MutationObserver(apply).observe(app,{attributes:true,attributeFilter:['class']});
  apply();
})();
