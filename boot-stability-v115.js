/* BOOT_STABILITY_V115
   Additive boot-safety layer.
   wave-display-v112 observed characterData and rewrote that same characterData,
   which could create a self-triggering MutationObserver loop on campaign render.
   Keep the old file in the build, but mark its guard before it loads and install
   the same UI correction with idempotent writes + child-list-only observation. */
(function(){
'use strict';
if(window.__srBootStabilityV115)return;
window.__srBootStabilityV115=true;

/* Prevent the legacy v112 observer from installing when its script loads next. */
window.__srWaveDisplayV112=true;

function totalFor(c){
  if(!c||c.ctx!=='campaign')return 0;
  if(typeof campaignWaveCount==='function')return campaignWaveCount(c.floor);
  if(c.boss)return 1;
  if(c.elite)return 2;
  return (typeof RULES!=='undefined'&&RULES.STEPS_PER_FLOOR)||3;
}
function syncWaveDisplay(){
  try{
    if(typeof combat==='undefined'||!combat||combat.ctx!=='campaign')return;
    var sub=document.getElementById('aSub');
    if(!sub)return;
    var pills=sub.querySelectorAll('.fPill');
    if(!pills.length)return;
    var p=pills[0], current=p.textContent||'';
    if(current.indexOf('Vague')<0)return;
    var total=totalFor(combat);
    if(!total)return;
    var step=Math.min(Number(combat.step||1),total);
    var wanted='Vague '+step+'/'+total;
    if(current.trim()===wanted)return;
    var nodes=[];
    for(var i=0;i<p.childNodes.length;i++)if(p.childNodes[i].nodeType===3)nodes.push(p.childNodes[i]);
    if(nodes.length){
      var n=nodes[nodes.length-1];
      if(String(n.nodeValue||'').trim()!==wanted)n.nodeValue=wanted;
    }else if(p.textContent!==wanted){
      p.textContent=wanted;
    }
  }catch(_){}
}

if(typeof MutationObserver!=='undefined'){
  var queued=false;
  new MutationObserver(function(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;syncWaveDisplay();});
  }).observe(document.body,{childList:true,subtree:true});
}
setTimeout(syncWaveDisplay,0);
})();
