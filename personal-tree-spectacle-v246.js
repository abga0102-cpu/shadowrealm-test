/* SHADOWREACH · Personal Tree Spectacle V246
   Visual/feedback layer only. No economy, save, node coordinates, requirements,
   research duration or bonus values are changed. No MutationObserver. */
(function(){
'use strict';
if(window.__srPersonalTreeSpectacleV246)return;
window.__srPersonalTreeSpectacleV246=true;
if(typeof TREE_NODES==='undefined'||typeof TREE_BY_ID==='undefined'||typeof treeLv!=='function')return;

var STYLE_ID='srPersonalTreeSpectacleV246Style';
var oldStyle=document.getElementById(STYLE_ID);if(oldStyle)oldStyle.remove();
var style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
/* The tree should feel like a living power network, but remain readable on mobile. */
.srRadialTree{overflow:visible;filter:drop-shadow(0 12px 24px rgba(0,0,0,.52)) drop-shadow(0 0 18px rgba(63,207,214,.10))}
.srRadialTree .sr246DepthAura{mix-blend-mode:screen;opacity:.42;animation:sr246DepthBreath 5.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.srRadialTree .sr246EnergyBase{fill:none;stroke-linecap:round;opacity:.16;filter:blur(.35px)}
.srRadialTree .sr246EnergyLive{fill:none;stroke-linecap:round;stroke-dasharray:2 10;animation:sr246EnergyFlow 1.75s linear infinite;filter:drop-shadow(0 0 4px currentColor);opacity:.78}
.srRadialTree .sr246EnergyHot{stroke-dasharray:1 7;animation-duration:1.1s;opacity:.95}
.srRadialTree g[data-act="treeNode"]{transform-box:fill-box;transform-origin:center;transition:filter .22s ease,opacity .22s ease}
.srRadialTree g[data-act="treeNode"].sr246Open{filter:drop-shadow(0 0 7px rgba(255,255,255,.24));animation:sr246NodeReady 2.2s ease-in-out infinite}
.srRadialTree g[data-act="treeNode"].sr246Partial{filter:drop-shadow(0 0 6px rgba(127,212,255,.24))}
.srRadialTree g[data-act="treeNode"].sr246Max{filter:drop-shadow(0 0 8px rgba(132,232,145,.46)) drop-shadow(0 0 17px rgba(63,185,80,.20))}
.srRadialTree g[data-act="treeNode"].sr246Busy{filter:drop-shadow(0 0 9px rgba(251,221,140,.50));animation:sr246BusyPulse 1.35s ease-in-out infinite}
.srRadialTree g[data-act="treeNode"].sr246Special{filter:drop-shadow(0 0 9px rgba(255,214,94,.28))}
.srRadialTree g[data-act="treeNode"].sr246Special.sr246Open,.srRadialTree g[data-act="treeNode"].sr246Special.sr246Max{filter:drop-shadow(0 0 10px rgba(255,214,94,.66)) drop-shadow(0 0 24px rgba(255,180,25,.30))}
.srRadialTree .sr246NodeAura{pointer-events:none;fill:none;transform-box:fill-box;transform-origin:center}
.srRadialTree .sr246NodeAura.ready{animation:sr246Aura 2.15s ease-in-out infinite}
.srRadialTree .sr246NodeAura.max{animation:sr246MaxAura 3.1s ease-in-out infinite}
.srRadialTree .sr246NodeAura.busy{stroke-dasharray:5 7;animation:sr246RingSpin 3s linear infinite}
.srRadialTree .sr246KeyCrown{pointer-events:none;fill:none;stroke:#FFD65E;stroke-linecap:round;stroke-dasharray:3 5;filter:drop-shadow(0 0 7px rgba(255,214,94,.62));animation:sr246RingSpin 5.5s linear infinite;transform-box:fill-box;transform-origin:center}
.srRadialTree .sr246KeyCore{pointer-events:none;fill:rgba(255,214,94,.045);stroke:#FFF1A8;filter:drop-shadow(0 0 10px rgba(255,214,94,.40));animation:sr246KeyPulse 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.sr246UnlockBurst{position:fixed;z-index:99998;left:50%;top:42%;width:min(340px,88vw);transform:translate(-50%,-50%);pointer-events:none;text-align:center;padding:16px 18px;border:1px solid rgba(251,221,140,.72);border-radius:16px;background:radial-gradient(circle at 50% 0%,rgba(232,180,74,.22),rgba(10,16,28,.94) 62%);box-shadow:0 0 0 1px rgba(255,255,255,.05),0 0 34px rgba(232,180,74,.28),0 18px 40px rgba(0,0,0,.55);animation:sr246Unlock .95s cubic-bezier(.16,.8,.25,1) both}
.sr246UnlockBurst:before,.sr246UnlockBurst:after{content:"";position:absolute;left:50%;top:50%;border:1px solid rgba(255,214,94,.52);border-radius:50%;width:80px;height:80px;transform:translate(-50%,-50%);animation:sr246Shock .9s ease-out both}
.sr246UnlockBurst:after{animation-delay:.08s}
.sr246UnlockKicker{font:900 9px var(--fu);letter-spacing:2px;color:#E8B44A;text-transform:uppercase}
.sr246UnlockTitle{margin-top:5px;font:900 18px var(--fd);color:#FBDD8C;text-shadow:0 0 15px rgba(232,180,74,.38)}
.sr246UnlockSub{margin-top:4px;font:800 10px var(--fu);color:#C8D3E5}
@keyframes sr246EnergyFlow{to{stroke-dashoffset:-36}}
@keyframes sr246NodeReady{0%,100%{opacity:.92}50%{opacity:1}}
@keyframes sr246BusyPulse{0%,100%{opacity:.84}50%{opacity:1}}
@keyframes sr246Aura{0%,100%{opacity:.18;transform:scale(.92)}50%{opacity:.64;transform:scale(1.10)}}
@keyframes sr246MaxAura{0%,100%{opacity:.22;transform:scale(.96)}50%{opacity:.58;transform:scale(1.08)}}
@keyframes sr246RingSpin{to{stroke-dashoffset:-48}}
@keyframes sr246KeyPulse{0%,100%{opacity:.44;transform:scale(.94)}50%{opacity:1;transform:scale(1.07)}}
@keyframes sr246DepthBreath{0%,100%{opacity:.23}50%{opacity:.52}}
@keyframes sr246Unlock{0%{opacity:0;transform:translate(-50%,-44%) scale(.86)}28%{opacity:1;transform:translate(-50%,-50%) scale(1.035)}100%{opacity:0;transform:translate(-50%,-54%) scale(1)}}
@keyframes sr246Shock{0%{opacity:.75;transform:translate(-50%,-50%) scale(.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(4)}}
@media(prefers-reduced-motion:reduce){.srRadialTree .sr246DepthAura,.srRadialTree .sr246EnergyLive,.srRadialTree g[data-act="treeNode"],.srRadialTree .sr246NodeAura,.srRadialTree .sr246KeyCrown,.srRadialTree .sr246KeyCore,.sr246UnlockBurst,.sr246UnlockBurst:before,.sr246UnlockBurst:after{animation:none!important;transition:none!important}}
`;
document.head.appendChild(style);

function safeState(n){
 try{
  var active=S&&S.tree&&S.tree.active;
  if(typeof treeState==='function')return treeState(S,n,active);
  var lv=treeLv(S,n.id);if(lv>=n.max)return'maxed';if(active===n.id)return'busy';
  if(typeof treeReqOk==='function'&&!treeReqOk(S,n))return'lock';
  if(lv>0)return'part';return'open';
 }catch(_){return'lock';}
}
function col(n){try{return nodeType(n).c||'#7FD4FF';}catch(_){return'#7FD4FF';}}
function pathD(q,n,R){
 var rq2=(n&&n.special)?R+6:R,bow=Math.min(46,26+Math.abs(n.x-q.x)*.28);
 return'M'+q.x+' '+(q.y+R)+'C'+q.x+' '+(q.y+R+bow)+' '+n.x+' '+(n.y-rq2-bow)+' '+n.x+' '+(n.y-rq2);
}
function overlays(){
 if(!S)return'';
 var R=19,links='',auras='',depth='';
 /* restrained atmospheric rings by tier: spectacle without hiding the graph */
 var maxRow=0;TREE_NODES.forEach(function(n){maxRow=Math.max(maxRow,Number(n.row)||0);});
 for(var p=1;p<=4;p++){
  var ns=TREE_NODES.filter(function(n){return Number(n.tier)===p;});if(!ns.length)continue;
  var xs=ns.map(function(n){return Number(n.x)||200;}),ys=ns.map(function(n){return Number(n.y)||0;});
  var cx=(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2,cy=(Math.min.apply(null,ys)+Math.max.apply(null,ys))/2;
  var rr=Math.max(42,(Math.max.apply(null,ys)-Math.min.apply(null,ys))/2+38);
  var pc=(typeof PALIER_BAND!=='undefined'&&PALIER_BAND[p-1])?PALIER_BAND[p-1].c:'#4A90D9';
  depth+='<circle class="sr246DepthAura" cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+rr.toFixed(1)+'" fill="none" stroke="'+pc+'" stroke-width="1" stroke-dasharray="2 12"/>';
 }
 TREE_NODES.forEach(function(n){
  var st=safeState(n),lv=treeLv(S,n.id),c=col(n);
  (n.req||[]).forEach(function(id){var q=TREE_BY_ID[id];if(!q)return;var live=treeLv(S,id)>=1,hot=live&&(st==='open'||st==='partOpen'||st==='busy');if(!live)return;var d=pathD(q,n,R);links+='<path class="sr246EnergyBase" d="'+d+'" stroke="'+c+'" stroke-width="7"/>';links+='<path class="sr246EnergyLive '+(hot?'sr246EnergyHot':'')+'" d="'+d+'" stroke="'+c+'" stroke-width="'+(hot?'2.5':'1.8')+'"/>';});
  if(st==='lock'||st==='wait')return;
  var r=(n.special?29:24)+(Math.min(3,lv)*1.5),cl=st==='maxed'?'max':st==='busy'?'busy':'ready',sc=st==='maxed'?'#84E891':st==='busy'?'#FBDD8C':c;
  auras+='<circle class="sr246NodeAura '+cl+'" cx="'+n.x+'" cy="'+n.y+'" r="'+r.toFixed(1)+'" stroke="'+sc+'" stroke-width="'+(n.special?'2':'1.35')+'" opacity=".45"/>';
  if(n.special){auras+='<circle class="sr246KeyCore" cx="'+n.x+'" cy="'+n.y+'" r="31" stroke-width="1.4"/>'+'<circle class="sr246KeyCrown" cx="'+n.x+'" cy="'+n.y+'" r="37" stroke-width="1.5"/>';}
 });
 return depth+links+auras;
}

if(typeof treeGraph==='function'){
 var baseGraph=treeGraph;
 treeGraph=function(active,remain){
  var html=baseGraph(active,remain);
  try{
   html=html.replace('<svg class="srRadialTree"','<svg class="srRadialTree" data-sr-spectacle="246"');
   html=html.replace('</svg>','<g class="sr246SpectacleLayer" pointer-events="none">'+overlays()+'</g></svg>');
   TREE_NODES.forEach(function(n){
    var st=safeState(n),lv=treeLv(S,n.id),cls='sr246Lv'+Math.min(5,Math.max(0,lv));
    if(st==='maxed')cls+=' sr246Max';else if(st==='busy')cls+=' sr246Busy';else if(st==='open'||st==='partOpen')cls+=' sr246Open';else if(lv>0)cls+=' sr246Partial';
    if(n.special)cls+=' sr246Special';
    var token='<g data-act="treeNode" data-arg="'+n.id+'"';
    html=html.replace(token,token+' class="'+cls+'"');
   });
  }catch(_){}
  return html;
 };
 try{window.treeGraph=treeGraph;}catch(_){}
}

var snapshot={};
function takeSnapshot(){TREE_NODES.forEach(function(n){snapshot[n.id]=treeLv(S,n.id);});}
function burst(n,newLv){
 try{
  var old=document.querySelector('.sr246UnlockBurst');if(old)old.remove();
  var el=document.createElement('div');el.className='sr246UnlockBurst';
  var title=(n.short||n.label||'Pouvoir renforcé');
  var special=!!n.special;
  el.innerHTML='<div class="sr246UnlockKicker">'+(special?'NŒUD MAJEUR':'PUISSANCE AUGMENTÉE')+'</div><div class="sr246UnlockTitle">'+String(title).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];})+'</div><div class="sr246UnlockSub">'+(newLv>=n.max?'MAÎTRISÉ · MAX':'NIVEAU '+newLv+' / '+n.max)+'</div>';
  document.body.appendChild(el);setTimeout(function(){if(el.parentNode)el.remove();},1100);
 }catch(_){}
}
function detectUpgrade(){
 try{TREE_NODES.forEach(function(n){var lv=treeLv(S,n.id),before=Number(snapshot[n.id]||0);if(lv>before)burst(n,lv);snapshot[n.id]=lv;});}catch(_){}
}
takeSnapshot();
document.addEventListener('click',function(e){var t=e&&e.target;if(!t||!t.closest)return;if(!t.closest('[data-act="treeNode"],.srRadialTree'))return;setTimeout(detectUpgrade,80);setTimeout(detectUpgrade,420);},true);
})();
