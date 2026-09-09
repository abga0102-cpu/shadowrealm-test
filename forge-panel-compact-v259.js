/* SHADOWREACH · Forge Panel Compact V259
   Presentation-only authority loaded after Forge UX/Batch Gate.
   Goals:
   - Keep the Forge panel short enough that forged gear cards are fully visible on mobile.
   - Collapse accelerator/speed chips behind an explicit "Vitesse" control.
   - Preserve every existing accelerator action and Forge progression rule.
   - Keep AUTO readable but compact; no overlay, no MutationObserver.
*/
(function(){
'use strict';
if(window.__srForgePanelCompactV259)return;
window.__srForgePanelCompactV259=true;

var speedOpen=false;
var applying=false;

function forgeCard(){
  var f=document.querySelector('.fgFilter[data-act="forgeFilter"], [data-act="forgeFilter"].fgFilter');
  if(!f)return null;
  var p=f.parentElement;
  if(!p)return null;
  return p;
}
function textHas(el,s){return !!(el&&String(el.textContent||'').indexOf(s)>=0);}
function findUpgradeBox(card){
  if(!card)return null;
  var kids=card.querySelectorAll('.card.lit, .card');
  for(var i=0;i<kids.length;i++)if(textHas(kids[i],'AMÉLIORATION → NIV.'))return kids[i];
  return null;
}
function findSpeedRow(box){
  if(!box)return null;
  var rows=box.querySelectorAll('.row');
  for(var i=rows.length-1;i>=0;i--){
    var t=String(rows[i].textContent||'');
    if(/1\s*min|5\s*min|15\s*min|30\s*min/i.test(t))return rows[i];
  }
  return null;
}
function installSpeedButton(box,row){
  if(!box||!row)return;
  row.classList.add('srForgeSpeedRow259');
  row.classList.toggle('open',speedOpen);
  var btn=box.querySelector('.srForgeSpeedBtn259');
  if(!btn){
    btn=document.createElement('button');
    btn.type='button';
    btn.className='srForgeSpeedBtn259';
    btn.setAttribute('aria-expanded',speedOpen?'true':'false');
    btn.innerHTML='<span>⚡</span><b>Vitesse</b><span class="srForgeSpeedChevron259">⌄</span>';
    var first=box.firstElementChild;
    if(first)first.insertAdjacentElement('afterend',btn);else box.prepend(btn);
  }
  btn.setAttribute('aria-expanded',speedOpen?'true':'false');
  btn.classList.toggle('open',speedOpen);
}
function apply(){
  if(applying)return;
  applying=true;
  try{
    var card=forgeCard();
    if(!card)return;
    card.classList.add('srForgeCompact259');
    var box=findUpgradeBox(card);
    if(box){
      box.classList.add('srForgeUpgradeBox259');
      var row=findSpeedRow(box);
      if(row)installSpeedButton(box,row);
    }
    var auto=card.querySelector('.forgeAnim.autoLoop.compactAuto');
    if(auto)auto.classList.add('srForgeAutoCompact259');
    var loot=document.getElementById('srForgeLoot258');
    if(loot)loot.classList.add('srForgeLootExpanded259');
  }finally{applying=false;}
}

/* Render lifecycle authority: decorate after every canonical render without observing the DOM. */
if(typeof render==='function'){
  var nativeRender=render;
  render=function(){var r=nativeRender.apply(this,arguments);try{apply();}catch(_){}return r;};
  try{window.render=render;}catch(_){}
}
if(typeof scheduleRender==='function'){
  var nativeSchedule=scheduleRender;
  scheduleRender=function(){var r=nativeSchedule.apply(this,arguments);requestAnimationFrame(apply);return r;};
  try{window.scheduleRender=scheduleRender;}catch(_){}
}

document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('.srForgeSpeedBtn259'):null;
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  speedOpen=!speedOpen;
  var card=forgeCard(),box=findUpgradeBox(card),row=findSpeedRow(box);
  if(row){row.classList.toggle('open',speedOpen);installSpeedButton(box,row);}
},true);

var st=document.createElement('style');
st.id='srForgePanelCompact259Style';
st.textContent='\
.srForgeCompact259 .srForgeUpgradeBox259{padding:5px 7px!important;margin-top:4px!important} \
.srForgeCompact259 .srForgeUpgradeBox259>.row:first-child{min-height:24px!important} \
.srForgeSpeedBtn259{width:100%;height:31px;margin-top:5px;border:1px solid #2f7287;border-radius:10px;background:linear-gradient(180deg,#102b38,#0a1b27);color:#a9eff8;display:flex;align-items:center;justify-content:center;gap:6px;font:900 10px/1 system-ui;letter-spacing:.2px} \
.srForgeSpeedBtn259 .srForgeSpeedChevron259{margin-left:2px;transition:transform .18s ease}.srForgeSpeedBtn259.open .srForgeSpeedChevron259{transform:rotate(180deg)} \
.srForgeSpeedRow259{display:none!important;margin-top:5px!important;padding-top:5px;border-top:1px solid #26435a;gap:4px!important} \
.srForgeSpeedRow259.open{display:flex!important} \
.srForgeCompact259 .srForgeAutoCompact259{min-height:54px!important;padding:5px 8px!important;margin-top:5px!important} \
.srForgeCompact259 .srForgeAutoCompact259 .forgeAutoText .tiny{display:none!important} \
.srForgeCompact259 .srForgeAutoCompact259 .forgeAutoText{min-width:0!important} \
#srForgeLoot258.srForgeLootExpanded259{margin:6px 0 12px!important;padding-bottom:6px!important;overflow:visible!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeGroup258{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeCard258{min-height:136px!important;border-radius:12px!important;padding-bottom:7px!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeState258{font-size:7.5px!important;padding-top:7px!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeImg258{height:67px!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeImg258 img{width:61px!important;height:61px!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeName258{font-size:10.5px!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeMeta258{font-size:7.5px!important;margin:4px 2px 8px!important} \
#srForgeLoot258.srForgeLootExpanded259 .srForgeGain258{bottom:-10px!important;font-size:7px!important} \
@media(max-width:430px){.srForgeSpeedBtn259{height:29px}.srForgeCompact259 .srForgeAutoCompact259{min-height:50px!important}#srForgeLoot258.srForgeLootExpanded259 .srForgeCard258{min-height:130px!important}#srForgeLoot258.srForgeLootExpanded259 .srForgeImg258{height:62px!important}#srForgeLoot258.srForgeLootExpanded259 .srForgeImg258 img{width:56px!important;height:56px!important}} \
@media(prefers-reduced-motion:reduce){.srForgeSpeedBtn259 .srForgeSpeedChevron259{transition:none!important}}';
document.head.appendChild(st);

requestAnimationFrame(apply);
setTimeout(apply,120);
window.__srForgePanelCompactV259={version:259,apply:apply};
})();
