/* SHADOWREACH · Personal Tree Spectacle V249
   Visual authority for the CURRENT dedicated tree renderer (v116), with radial fallback.
   No economy, saves, requirements, timings, node levels or bonus values are changed. */
(function(){
'use strict';
if(window.__srPersonalTreeSpectacleV249)return;
window.__srPersonalTreeSpectacleV249=true;
if(typeof TREE_NODES==='undefined'||typeof TREE_BY_ID==='undefined'||typeof treeLv!=='function'||typeof treeGraph!=='function')return;

var STYLE='srPersonalTreeSpectacleV249Style';
var old=document.getElementById(STYLE);if(old)old.remove();
var style=document.createElement('style');style.id=STYLE;style.textContent=`
/* Dedicated renderer — this is the live tree UI in v116. */
.srDedicatedTree[data-sr-spectacle="249"]{position:relative;isolation:isolate}
.srDedicatedTree[data-sr-spectacle="249"]:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(circle at 50% 18%,rgba(63,207,214,.10),transparent 34%),radial-gradient(circle at 50% 78%,rgba(232,180,74,.07),transparent 38%)}
.srDedicatedTree[data-sr-spectacle="249"] .srDPath{box-shadow:0 18px 42px rgba(0,0,0,.34),inset 0 0 42px rgba(48,87,126,.055)}
.srDedicatedTree[data-sr-spectacle="249"] .srDTier{position:relative;padding-top:17px}
.srDedicatedTree[data-sr-spectacle="249"] .srDTier:not(:first-of-type):before{content:"";position:absolute;left:24px;top:-10px;width:2px;height:22px;background:linear-gradient(#365477,#7fd4ff);box-shadow:0 0 9px rgba(127,212,255,.46);opacity:.72}
.srDedicatedTree[data-sr-spectacle="249"] .srDTierTitle{display:flex;align-items:center;gap:8px}
.srDedicatedTree[data-sr-spectacle="249"] .srDTierTitle:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,rgba(240,196,93,.55),transparent)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode{position:relative;overflow:hidden;transition:transform .16s ease,border-color .2s ease,box-shadow .2s ease,background .2s ease}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode:active{transform:scale(.985)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Ready{border-color:#68cfe6;box-shadow:0 0 0 1px rgba(104,207,230,.10),0 0 16px rgba(63,207,214,.12)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Ready:before{content:"";position:absolute;inset:-70% -45%;background:linear-gradient(105deg,transparent 42%,rgba(133,230,242,.09) 50%,transparent 58%);animation:sr249Sweep 3.8s linear infinite;pointer-events:none}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Partial{border-color:#70a4cf;box-shadow:0 0 15px rgba(77,151,210,.13)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Busy{border-color:#f2c44f!important;box-shadow:0 0 0 1px rgba(242,196,79,.16),0 0 24px rgba(242,196,79,.23);animation:sr249Busy 1.35s ease-in-out infinite}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Max{border-color:#48ca7b!important;background:linear-gradient(135deg,#102218,#0e1a19)!important;box-shadow:0 0 0 1px rgba(72,202,123,.10),0 0 22px rgba(72,202,123,.19)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Max .ico{border-color:#72e59b;color:#a0f0bc;box-shadow:0 0 15px rgba(72,202,123,.24)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Special{border-color:#d7aa48;background:linear-gradient(135deg,rgba(51,39,18,.95),rgba(14,21,34,.98));box-shadow:0 0 0 1px rgba(255,214,94,.10),0 0 25px rgba(232,180,74,.16)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.sr249Special .ico{animation:sr249KeyPulse 1.9s ease-in-out infinite;box-shadow:0 0 18px rgba(255,214,94,.30)}
.srDedicatedTree[data-sr-spectacle="249"] .srDNode.locked{filter:saturate(.55);box-shadow:none!important}
.srDedicatedTree[data-sr-spectacle="249"] .srDMaster{position:relative;overflow:hidden;box-shadow:inset 0 0 28px rgba(239,195,86,.045),0 0 20px rgba(239,195,86,.07)}
.srDedicatedTree[data-sr-spectacle="249"] .srDTab.on{box-shadow:0 0 0 1px rgba(233,189,85,.10),0 0 16px rgba(233,189,85,.14)}

/* Radial fallback, retained for compatibility if the renderer changes later. */
.srRadialTree[data-sr-spectacle="249"]{overflow:visible;filter:drop-shadow(0 12px 28px rgba(0,0,0,.58)) drop-shadow(0 0 24px rgba(63,207,214,.18))}
.srRadialTree g[data-act="treeNode"].sr249Ready{filter:drop-shadow(0 0 10px rgba(127,212,255,.34))}
.srRadialTree g[data-act="treeNode"].sr249Busy{filter:drop-shadow(0 0 12px rgba(251,221,140,.62))}
.srRadialTree g[data-act="treeNode"].sr249Max{filter:drop-shadow(0 0 12px rgba(132,232,145,.72))}

.sr249UnlockBurst{position:fixed;z-index:99998;left:50%;top:42%;width:min(350px,88vw);transform:translate(-50%,-50%);pointer-events:none;text-align:center;padding:18px;border:1px solid rgba(251,221,140,.78);border-radius:17px;background:radial-gradient(circle at 50% 0%,rgba(232,180,74,.28),rgba(9,15,27,.96) 66%);box-shadow:0 0 0 1px rgba(255,255,255,.06),0 0 42px rgba(232,180,74,.36),0 20px 46px rgba(0,0,0,.60);animation:sr249Unlock 1s cubic-bezier(.16,.8,.25,1) both}
.sr249UnlockBurst:before,.sr249UnlockBurst:after{content:"";position:absolute;left:50%;top:50%;width:84px;height:84px;border:1px solid rgba(255,214,94,.62);border-radius:50%;transform:translate(-50%,-50%);animation:sr249Shock .92s ease-out both}.sr249UnlockBurst:after{animation-delay:.08s}
.sr249UnlockKicker{font:900 9px var(--fu);letter-spacing:2.2px;color:#E8B44A}.sr249UnlockTitle{margin-top:5px;font:900 19px var(--fd);color:#FBDD8C;text-shadow:0 0 18px rgba(232,180,74,.46)}.sr249UnlockSub{margin-top:5px;font:800 10px var(--fu);color:#D5DFEE}
@keyframes sr249Sweep{from{transform:translateX(-34%)}to{transform:translateX(34%)}}
@keyframes sr249Busy{0%,100%{box-shadow:0 0 0 1px rgba(242,196,79,.10),0 0 16px rgba(242,196,79,.16)}50%{box-shadow:0 0 0 1px rgba(242,196,79,.24),0 0 30px rgba(242,196,79,.32)}}
@keyframes sr249KeyPulse{0%,100%{transform:scale(.96);filter:brightness(.95)}50%{transform:scale(1.07);filter:brightness(1.18)}}
@keyframes sr249Unlock{0%{opacity:0;transform:translate(-50%,-43%) scale(.84)}28%{opacity:1;transform:translate(-50%,-50%) scale(1.045)}100%{opacity:0;transform:translate(-50%,-55%) scale(1)}}
@keyframes sr249Shock{0%{opacity:.85;transform:translate(-50%,-50%) scale(.25)}100%{opacity:0;transform:translate(-50%,-50%) scale(4.3)}}
@media(prefers-reduced-motion:reduce){.srDedicatedTree *,.srRadialTree *,.sr249UnlockBurst,.sr249UnlockBurst:before,.sr249UnlockBurst:after{animation:none!important;transition:none!important}}
`;
document.head.appendChild(style);

function state(n,active){try{return typeof treeState==='function'?treeState(S,n,active):((treeLv(S,n.id)>=n.max)?'maxed':(active===n.id?'busy':(treeLv(S,n.id)>0?'part':(treeReqOk(S,n)?'open':'lock'))));}catch(_){return'lock';}}
function classes(n,active){var st=state(n,active),lv=treeLv(S,n.id),cls='';if(st==='maxed'||lv>=n.max)cls+=' sr249Max';else if(st==='busy'||active===n.id)cls+=' sr249Busy';else if(st==='open'||st==='partOpen')cls+=' sr249Ready';else if(lv>0)cls+=' sr249Partial';if(n.masteryKey||n.special)cls+=' sr249Special';return cls;}

var baseGraph=treeGraph;
treeGraph=function(active,remain){
 var html=baseGraph(active,remain);
 try{
  if(html.indexOf('srDedicatedTree')>=0){
   html=html.replace('<div class="srDedicatedTree"','<div class="srDedicatedTree" data-sr-spectacle="249"');
   TREE_NODES.forEach(function(n){var token='data-act="treeNode" data-arg="'+n.id+'"';var idx=html.indexOf(token);if(idx<0)return;var start=html.lastIndexOf('<button',idx);var end=html.indexOf('>',start);if(start<0||end<0)return;var head=html.slice(start,end+1);if(head.indexOf('class="')<0)return;head=head.replace('class="','class="'+classes(n,active).trim()+' ');html=html.slice(0,start)+head+html.slice(end+1);});
  }else if(html.indexOf('srRadialTree')>=0){
   html=html.replace('<svg class="srRadialTree"','<svg class="srRadialTree" data-sr-spectacle="249"');
   TREE_NODES.forEach(function(n){var token='<g data-act="treeNode" data-arg="'+n.id+'"';html=html.replace(token,token+' class="'+classes(n,active).trim()+'"');});
  }
 }catch(_){}
 return html;
};
try{window.treeGraph=treeGraph;}catch(_){}

var snap={};TREE_NODES.forEach(function(n){snap[n.id]=treeLv(S,n.id);});
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function burst(n,lv){try{var old=document.querySelector('.sr249UnlockBurst');if(old)old.remove();var el=document.createElement('div');el.className='sr249UnlockBurst';el.innerHTML='<div class="sr249UnlockKicker">'+((n.masteryKey||n.special)?'NŒUD MAJEUR':'PUISSANCE AUGMENTÉE')+'</div><div class="sr249UnlockTitle">'+esc(n.short||n.label||'Pouvoir renforcé')+'</div><div class="sr249UnlockSub">'+(lv>=n.max?'MAÎTRISÉ · MAX':'NIVEAU '+lv+' / '+n.max)+'</div>';document.body.appendChild(el);setTimeout(function(){if(el.parentNode)el.remove();},1150);}catch(_){}}
function detect(){try{TREE_NODES.forEach(function(n){var lv=treeLv(S,n.id),b=Number(snap[n.id]||0);if(lv>b)burst(n,lv);snap[n.id]=lv;});}catch(_){}}
document.addEventListener('click',function(e){var t=e&&e.target;if(t&&t.closest&&t.closest('[data-act="treeNode"],.srDedicatedTree,.srRadialTree')){setTimeout(detect,90);setTimeout(detect,450);}},true);

/* Force one render after installing the wrapper so the already-open tree also receives V249. */
try{if(typeof render==='function')render();}catch(_){}
})();