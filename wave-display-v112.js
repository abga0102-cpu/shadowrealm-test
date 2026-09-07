/* SHADOWREACH · wave display consistency v112
   Elite floors have 2 waves, bosses 1, normal floors use the configured count.
   UI-only: combat/progression logic already uses campaignWaveCount(). */
(function(){
'use strict';
if(window.__srWaveDisplayV112)return;window.__srWaveDisplayV112=true;
function totalFor(c){
  if(!c||c.ctx!=='campaign')return 0;
  if(typeof campaignWaveCount==='function')return campaignWaveCount(c.floor);
  if(c.boss)return 1;if(c.elite)return 2;
  return (typeof RULES!=='undefined'&&RULES.STEPS_PER_FLOOR)||3;
}
function sync(){
  try{
    if(!combat||combat.ctx!=='campaign')return;
    var sub=document.getElementById('aSub');if(!sub)return;
    var pills=sub.querySelectorAll('.fPill');if(!pills.length)return;
    var p=pills[0],txt=p.textContent||'';if(txt.indexOf('Vague')<0)return;
    var total=totalFor(combat),step=Math.min(Number(combat.step||1),total);
    var nodes=[];for(var i=0;i<p.childNodes.length;i++)if(p.childNodes[i].nodeType===3)nodes.push(p.childNodes[i]);
    if(nodes.length)nodes[nodes.length-1].nodeValue='Vague '+step+'/'+total;
    else p.textContent='Vague '+step+'/'+total;
  }catch(_){}
}
if(typeof MutationObserver!=='undefined')new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,characterData:true});
setInterval(sync,250);setTimeout(sync,0);
})();