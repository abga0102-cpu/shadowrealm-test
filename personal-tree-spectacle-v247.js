/* SHADOWREACH · Personal Tree Spectacle V247
   Loaded after the final tree runtime authority. Visual/feedback only:
   no economy, save, node coordinates, requirements, timings or bonus values change. */
(function(){
'use strict';
if(window.__srPersonalTreeSpectacleV247)return;
window.__srPersonalTreeSpectacleV247=true;
if(typeof TREE_NODES==='undefined'||typeof TREE_BY_ID==='undefined'||typeof treeLv!=='function'||typeof treeGraph!=='function')return;

var old=document.getElementById('srPersonalTreeSpectacleV247Style');if(old)old.remove();
var style=document.createElement('style');style.id='srPersonalTreeSpectacleV247Style';style.textContent=`
.srRadialTree[data-sr-spectacle="247"]{overflow:visible;filter:drop-shadow(0 12px 28px rgba(0,0,0,.58)) drop-shadow(0 0 24px rgba(63,207,214,.18))}
.srRadialTree .sr247Depth{mix-blend-mode:screen;animation:sr247Depth 4.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.srRadialTree .sr247LinkBase{fill:none;stroke-linecap:round;opacity:.22}
.srRadialTree .sr247LinkFlow{fill:none;stroke-linecap:round;stroke-dasharray:2 9;animation:sr247Flow 1.35s linear infinite;filter:drop-shadow(0 0 5px currentColor);opacity:.92}
.srRadialTree g[data-act="treeNode"].sr247Ready{animation:sr247Ready 1.85s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(255,255,255,.34))}
.srRadialTree g[data-act="treeNode"].sr247Partial{filter:drop-shadow(0 0 9px rgba(127,212,255,.36))}
.srRadialTree g[data-act="treeNode"].sr247Busy{animation:sr247Busy 1.15s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(251,221,140,.62))}
.srRadialTree g[data-act="treeNode"].sr247Max{filter:drop-shadow(0 0 12px rgba(132,232,145,.72)) drop-shadow(0 0 25px rgba(63,185,80,.28))}
.srRadialTree g[data-act="treeNode"].sr247Special{filter:drop-shadow(0 0 12px rgba(255,214,94,.56))}
.srRadialTree g[data-act="treeNode"].sr247Special.sr247Ready,.srRadialTree g[data-act="treeNode"].sr247Special.sr247Max{filter:drop-shadow(0 0 14px rgba(255,214,94,.86)) drop-shadow(0 0 30px rgba(255,166,24,.38))}
.srRadialTree .sr247Aura{fill:none;pointer-events:none;transform-box:fill-box;transform-origin:center}
.srRadialTree .sr247Aura.ready{animation:sr247Aura 1.8s ease-in-out infinite}
.srRadialTree .sr247Aura.max{animation:sr247AuraMax 2.6s ease-in-out infinite}
.srRadialTree .sr247Aura.busy{stroke-dasharray:4 7;animation:sr247Spin 2.2s linear infinite}
.srRadialTree .sr247KeyOuter{fill:none;pointer-events:none;stroke:#FFD65E;stroke-dasharray:3 5;filter:drop-shadow(0 0 8px rgba(255,214,94,.72));animation:sr247Spin 4.5s linear infinite;transform-box:fill-box;transform-origin:center}
.srRadialTree .sr247KeyInner{pointer-events:none;fill:rgba(255,214,94,.075);stroke:#FFF1A8;filter:drop-shadow(0 0 12px rgba(255,214,94,.54));animation:sr247KeyPulse 1.9s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.sr247UnlockBurst{position:fixed;z-index:99998;left:50%;top:42%;width:min(350px,88vw);transform:translate(-50%,-50%);pointer-events:none;text-align:center;padding:18px 18px;border:1px solid rgba(251,221,140,.78);border-radius:17px;background:radial-gradient(circle at 50% 0%,rgba(232,180,74,.28),rgba(9,15,27,.96) 66%);box-shadow:0 0 0 1px rgba(255,255,255,.06),0 0 42px rgba(232,180,74,.36),0 20px 46px rgba(0,0,0,.60);animation:sr247Unlock 1s cubic-bezier(.16,.8,.25,1) both}
.sr247UnlockBurst:before,.sr247UnlockBurst:after{content:"";position:absolute;left:50%;top:50%;width:84px;height:84px;border:1px solid rgba(255,214,94,.62);border-radius:50%;transform:translate(-50%,-50%);animation:sr247Shock .92s ease-out both}.sr247UnlockBurst:after{animation-delay:.08s}
.sr247UnlockKicker{font:900 9px var(--fu);letter-spacing:2.2px;color:#E8B44A}.sr247UnlockTitle{margin-top:5px;font:900 19px var(--fd);color:#FBDD8C;text-shadow:0 0 18px rgba(232,180,74,.46)}.sr247UnlockSub{margin-top:5px;font:800 10px var(--fu);color:#D5DFEE}
@keyframes sr247Flow{to{stroke-dashoffset:-34}}@keyframes sr247Ready{0%,100%{opacity:.88}50%{opacity:1}}@keyframes sr247Busy{0%,100%{opacity:.82}50%{opacity:1}}@keyframes sr247Aura{0%,100%{opacity:.18;transform:scale(.91)}50%{opacity:.78;transform:scale(1.13)}}@keyframes sr247AuraMax{0%,100%{opacity:.26;transform:scale(.95)}50%{opacity:.72;transform:scale(1.10)}}@keyframes sr247Spin{to{stroke-dashoffset:-46}}@keyframes sr247KeyPulse{0%,100%{opacity:.45;transform:scale(.92)}50%{opacity:1;transform:scale(1.10)}}@keyframes sr247Depth{0%,100%{opacity:.24}50%{opacity:.62}}@keyframes sr247Unlock{0%{opacity:0;transform:translate(-50%,-43%) scale(.84)}28%{opacity:1;transform:translate(-50%,-50%) scale(1.045)}100%{opacity:0;transform:translate(-50%,-55%) scale(1)}}@keyframes sr247Shock{0%{opacity:.85;transform:translate(-50%,-50%) scale(.25)}100%{opacity:0;transform:translate(-50%,-50%) scale(4.3)}}
@media(prefers-reduced-motion:reduce){.srRadialTree *,.sr247UnlockBurst,.sr247UnlockBurst:before,.sr247UnlockBurst:after{animation:none!important;transition:none!important}}
`;
document.head.appendChild(style);

function state(n,active){try{return typeof treeState==='function'?treeState(S,n,active):((treeLv(S,n.id)>=n.max)?'maxed':(treeLv(S,n.id)>0?'part':'open'));}catch(_){return'lock';}}
function color(n){try{return nodeType(n).c||'#7FD4FF';}catch(_){return'#7FD4FF';}}
function path(q,n){var R=19,rq2=n.special?R+6:R,b=Math.min(46,26+Math.abs(n.x-q.x)*.28);return'M'+q.x+' '+(q.y+R)+'C'+q.x+' '+(q.y+R+b)+' '+n.x+' '+(n.y-rq2-b)+' '+n.x+' '+(n.y-rq2);}
function overlay(active){var links='',auras='',depth='';
 for(var p=1;p<=4;p++){var ns=TREE_NODES.filter(function(n){return Number(n.tier)===p;});if(!ns.length)continue;var xs=ns.map(function(n){return+n.x||200;}),ys=ns.map(function(n){return+n.y||0;}),cx=(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2,cy=(Math.min.apply(null,ys)+Math.max.apply(null,ys))/2,rr=Math.max(48,(Math.max.apply(null,ys)-Math.min.apply(null,ys))/2+44),pc=(typeof PALIER_BAND!=='undefined'&&PALIER_BAND[p-1])?PALIER_BAND[p-1].c:'#4A90D9';depth+='<circle class="sr247Depth" cx="'+cx+'" cy="'+cy+'" r="'+rr+'" fill="none" stroke="'+pc+'" stroke-width="1.2" stroke-dasharray="2 11"/>';}
 TREE_NODES.forEach(function(n){var st=state(n,active),lv=treeLv(S,n.id),c=color(n);(n.req||[]).forEach(function(id){var q=TREE_BY_ID[id];if(!q||treeLv(S,id)<1)return;var d=path(q,n),hot=(st==='open'||st==='partOpen'||st==='busy');links+='<path class="sr247LinkBase" d="'+d+'" stroke="'+c+'" stroke-width="8"/><path class="sr247LinkFlow" d="'+d+'" stroke="'+c+'" stroke-width="'+(hot?'2.8':'2')+'"/>';});if(st==='lock'||st==='wait')return;var r=(n.special?30:24)+Math.min(3,lv)*1.7,cl=st==='maxed'?'max':st==='busy'?'busy':'ready',sc=st==='maxed'?'#84E891':st==='busy'?'#FBDD8C':c;auras+='<circle class="sr247Aura '+cl+'" cx="'+n.x+'" cy="'+n.y+'" r="'+r+'" stroke="'+sc+'" stroke-width="'+(n.special?'2.4':'1.6')+'" opacity=".48"/>';if(n.special)auras+='<circle class="sr247KeyInner" cx="'+n.x+'" cy="'+n.y+'" r="32" stroke-width="1.5"/><circle class="sr247KeyOuter" cx="'+n.x+'" cy="'+n.y+'" r="39" stroke-width="1.8"/>';});
 return depth+links+auras;}

var baseGraph=treeGraph;
treeGraph=function(active,remain){var html=baseGraph(active,remain);try{html=html.replace('<svg class="srRadialTree"','<svg class="srRadialTree" data-sr-spectacle="247"');html=html.replace('</svg>','<g class="sr247SpectacleLayer" pointer-events="none">'+overlay(active)+'</g></svg>');TREE_NODES.forEach(function(n){var st=state(n,active),lv=treeLv(S,n.id),cls='sr247Lv'+Math.min(5,Math.max(0,lv));if(st==='maxed')cls+=' sr247Max';else if(st==='busy')cls+=' sr247Busy';else if(st==='open'||st==='partOpen')cls+=' sr247Ready';else if(lv>0)cls+=' sr247Partial';if(n.special)cls+=' sr247Special';var token='<g data-act="treeNode" data-arg="'+n.id+'"';html=html.replace(token,token+' class="'+cls+'"');});}catch(_){}return html;};try{window.treeGraph=treeGraph;}catch(_){}

var snap={};TREE_NODES.forEach(function(n){snap[n.id]=treeLv(S,n.id);});
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function burst(n,lv){try{var old=document.querySelector('.sr247UnlockBurst');if(old)old.remove();var el=document.createElement('div');el.className='sr247UnlockBurst';el.innerHTML='<div class="sr247UnlockKicker">'+(n.special?'NŒUD MAJEUR':'PUISSANCE AUGMENTÉE')+'</div><div class="sr247UnlockTitle">'+esc(n.short||n.label||'Pouvoir renforcé')+'</div><div class="sr247UnlockSub">'+(lv>=n.max?'MAÎTRISÉ · MAX':'NIVEAU '+lv+' / '+n.max)+'</div>';document.body.appendChild(el);setTimeout(function(){if(el.parentNode)el.remove();},1150);}catch(_){}}
function detect(){try{TREE_NODES.forEach(function(n){var lv=treeLv(S,n.id),b=Number(snap[n.id]||0);if(lv>b)burst(n,lv);snap[n.id]=lv;});}catch(_){}}
document.addEventListener('click',function(e){var t=e&&e.target;if(t&&t.closest&&t.closest('[data-act="treeNode"],.srRadialTree')){setTimeout(detect,90);setTimeout(detect,450);}},true);
})();