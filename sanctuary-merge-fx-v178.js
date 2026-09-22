/* SHADOWREACH · Sanctuary Merge FX V424
   Presentation only: preserves every merge rule, cost, reward and save value.
   Restores a visible local fusion spectacle and scales it with resulting rarity. */
(function(){
'use strict';
if(window.__srSanctMergeFxV178)return;window.__srSanctMergeFxV178=true;
if(typeof sanctMergeDrop!=='function'||typeof sanctMergeState!=='function'||typeof sanctMergeNext!=='function')return;

var ORDER=['COMMUN','PEU_COMMUN','RARE_I','RARE_II','EPIQUE_I','EPIQUE_II','MYTHIQUE_I','MYTHIQUE_II','MYTHIQUE_III','ARTEFACT_I','ARTEFACT_II','ARTEFACT_III','LEGENDAIRE_I','LEGENDAIRE_II','LEGENDAIRE_III','INFERNAL_I','INFERNAL_II','INFERNAL_III','IMMORTEL_I','IMMORTEL_II','IMMORTEL_III','DIVIN'];
function col(r){try{return (SANCT_MERGE_COLOR&&SANCT_MERGE_COLOR[r])||'#F5C542';}catch(_){return '#F5C542';}}
function name(r){try{return (SANCT_MERGE_NAME&&SANCT_MERGE_NAME[r])||r;}catch(_){return r;}}
function rank(r){var i=ORDER.indexOf(r);return i<0?0:i;}
function reduced(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function anchorForSlot(slot){
  try{
    var el=document.querySelector('.sanctMergeCell[data-sanct-slot="'+slot+'"]');
    if(!el)return null;
    var r=el.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2};
  }catch(_){return null;}
}
function css(){
  if(document.getElementById('srMergeFx178Style'))return;
  var s=document.createElement('style');s.id='srMergeFx178Style';s.textContent='\
#srMergeFx178{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;--x:50vw;--y:50vh;--mc:#F5C542;--size:78px;--veil:.26;--shake:2px}\
#srMergeFx178 .veil{position:absolute;inset:0;background:radial-gradient(circle at var(--x) var(--y),color-mix(in srgb,var(--mc) 72%,white) 0,color-mix(in srgb,var(--mc) 45%,transparent) 7%,transparent 30%);animation:srMFVeil .72s ease-out both;opacity:var(--veil)}\
#srMergeFx178 .beam{position:absolute;left:var(--x);top:calc(var(--y) - 42vh);width:2px;height:84vh;transform:translateX(-50%) scaleY(.2);transform-origin:50% 50%;background:linear-gradient(transparent,color-mix(in srgb,var(--mc) 82%,white),transparent);box-shadow:0 0 15px var(--mc),0 0 38px color-mix(in srgb,var(--mc) 65%,transparent);animation:srMFBeam .68s ease-out both}\
#srMergeFx178 .core{position:absolute;left:var(--x);top:var(--y);width:var(--size);height:var(--size);border-radius:50%;border:2px solid color-mix(in srgb,var(--mc) 75%,white);background:radial-gradient(circle,color-mix(in srgb,var(--mc) 35%,white) 0,color-mix(in srgb,var(--mc) 72%,transparent) 30%,transparent 72%);box-shadow:0 0 18px var(--mc),0 0 52px color-mix(in srgb,var(--mc) 72%,transparent);animation:srMFCore .78s cubic-bezier(.17,.86,.27,1.14) both}\
#srMergeFx178 .ring{position:absolute;left:var(--x);top:var(--y);width:var(--size);height:var(--size);border-radius:50%;border:2px solid var(--mc);box-shadow:0 0 10px color-mix(in srgb,var(--mc) 70%,transparent);animation:srMFRing var(--rd,.78s) ease-out var(--delay,0s) both}\
#srMergeFx178 .spark{position:absolute;left:var(--x);top:var(--y);width:4px;height:18px;margin-left:-2px;margin-top:-9px;border-radius:8px;background:linear-gradient(#fff,var(--mc));box-shadow:0 0 8px var(--mc);transform-origin:2px calc(50% + var(--d));animation:srMFSpark var(--sd,.78s) ease-out var(--delay,0s) both}\
#srMergeFx178 .star{position:absolute;left:var(--x);top:var(--y);width:7px;height:7px;margin:-3.5px;background:#fff;clip-path:polygon(50% 0,61% 36%,100% 50%,61% 64%,50% 100%,39% 64%,0 50%,39% 36%);filter:drop-shadow(0 0 5px var(--mc));animation:srMFStar var(--td,.9s) ease-out var(--delay,0s) both}\
#srMergeFx178 .label{position:absolute;left:12px;right:12px;top:clamp(74px,calc(var(--y) + 62px),calc(100vh - 92px));text-align:center;font-weight:1000;letter-spacing:.8px;text-shadow:0 2px 4px #000,0 0 20px var(--mc);animation:srMFLabel .96s ease-out both}\
#srMergeFx178 .label .up{font-size:10px;color:#fff;opacity:.92}\
#srMergeFx178 .label .rar{font-size:var(--label,18px);color:var(--mc);margin-top:2px}\
#app.srMergeImpact178{animation:srMFShake .34s ease-out}\
@keyframes srMFCore{0%{transform:translate(-50%,-50%) scale(.15) rotate(-12deg);opacity:0}28%{transform:translate(-50%,-50%) scale(1.24);opacity:1}62%{transform:translate(-50%,-50%) scale(.92);opacity:.95}100%{transform:translate(-50%,-50%) scale(.58);opacity:0}}\
@keyframes srMFRing{0%{transform:translate(-50%,-50%) scale(.25);opacity:.96}100%{transform:translate(-50%,-50%) scale(var(--rs,4.1));opacity:0}}\
@keyframes srMFSpark{0%{transform:rotate(var(--a)) translateY(0) scale(.35);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(var(--d) * -1)) scale(var(--ss,1));opacity:0}}\
@keyframes srMFStar{0%{transform:rotate(var(--a)) translateY(0) scale(.2);opacity:1}70%{opacity:1}100%{transform:rotate(var(--a)) translateY(calc(var(--d) * -1)) rotate(180deg) scale(var(--ts,1.2));opacity:0}}\
@keyframes srMFBeam{0%{transform:translateX(-50%) scaleY(.1);opacity:0}20%{transform:translateX(-50%) scaleY(1);opacity:.92}100%{transform:translateX(-50%) scaleY(.55);opacity:0}}\
@keyframes srMFVeil{0%{opacity:0}16%{opacity:var(--veil)}100%{opacity:0}}\
@keyframes srMFLabel{0%{transform:translateY(12px) scale(.93);opacity:0}20%{transform:translateY(0) scale(1.06);opacity:1}72%{opacity:1}100%{transform:translateY(-9px) scale(1);opacity:0}}\
@keyframes srMFShake{0%,100%{transform:translate3d(0,0,0)}20%{transform:translate3d(var(--srMergeShakeNeg,-2px),1px,0)}42%{transform:translate3d(var(--srMergeShake,2px),-1px,0)}66%{transform:translate3d(var(--srMergeShakeHalfNeg,-1px),0,0)}82%{transform:translate3d(var(--srMergeShakeThird,1px),0,0)}}\
@media(prefers-reduced-motion:reduce){#srMergeFx178 .spark,#srMergeFx178 .ring,#srMergeFx178 .star,#srMergeFx178 .beam{display:none}#srMergeFx178 .core,#srMergeFx178 .veil,#srMergeFx178 .label{animation-duration:.25s!important}#app.srMergeImpact178{animation:none}}';
  document.head.appendChild(s);
}
function fx(r,anchor){
  css();
  var old=document.getElementById('srMergeFx178');if(old)old.remove();
  var c=col(r),lv=rank(r),p=lv/Math.max(1,ORDER.length-1),box=document.createElement('div');
  var x=anchor&&Number.isFinite(anchor.x)?anchor.x:window.innerWidth/2;
  var y=anchor&&Number.isFinite(anchor.y)?anchor.y:window.innerHeight/2;
  var n=reduced()?0:Math.round(clamp(8+lv*1.18,8,34));
  var rings=reduced()?0:(2+Math.floor(lv/6));
  var stars=reduced()?0:(lv>=5?Math.round(clamp((lv-3)*.7,2,14)):0);
  var size=Math.round(62+lv*1.9);
  var veil=(.18+p*.34).toFixed(2);
  var duration=Math.round(760+lv*16);
  var shake=(1.6+lv*.13).toFixed(2)+'px';
  var label=Math.round(17+lv*.22)+'px';

  box.id='srMergeFx178';
  box.style.setProperty('--mc',c);
  box.style.setProperty('--x',x+'px');
  box.style.setProperty('--y',y+'px');
  box.style.setProperty('--size',size+'px');
  box.style.setProperty('--veil',veil);
  box.style.setProperty('--shake',shake);
  box.style.setProperty('--label',label);

  var h='<div class="veil"></div>';
  if(lv>=12)h+='<div class="beam"></div>';
  for(var rr=0;rr<rings;rr++){
    h+='<i class="ring" style="--delay:'+(rr*.055)+'s;--rd:'+(0.72+rr*.07)+'s;--rs:'+(3.5+rr*.75+p*1.2)+'"></i>';
  }
  h+='<div class="core"></div>';
  for(var i=0;i<n;i++){
    var a=(360/n*i)+(Math.random()*10-5),d=42+Math.random()*(34+lv*2.1);
    h+='<i class="spark" style="--a:'+a+'deg;--d:'+d+'px;--delay:'+(Math.random()*.08).toFixed(3)+'s;--sd:'+(0.68+Math.random()*.22+p*.16).toFixed(2)+'s;--ss:'+(0.8+p*.7).toFixed(2)+'"></i>';
  }
  for(var j=0;j<stars;j++){
    var aa=(360/stars*j)+(Math.random()*20-10),dd=56+Math.random()*(38+lv*2.4);
    h+='<i class="star" style="--a:'+aa+'deg;--d:'+dd+'px;--delay:'+(0.03+Math.random()*.14).toFixed(3)+'s;--td:'+(0.78+Math.random()*.3+p*.18).toFixed(2)+'s;--ts:'+(0.9+p*.8).toFixed(2)+'"></i>';
  }
  h+='<div class="label"><div class="up">FUSION RÉUSSIE</div><div class="rar">'+name(r)+'</div></div>';
  box.innerHTML=h;
  document.body.appendChild(box);

  var app=document.getElementById('app');
  if(app&&!reduced()){
    app.style.setProperty('--srMergeShake',shake);app.style.setProperty('--srMergeShakeNeg',(-parseFloat(shake))+'px');app.style.setProperty('--srMergeShakeHalfNeg',(-parseFloat(shake)*.55)+'px');app.style.setProperty('--srMergeShakeThird',(parseFloat(shake)*.35)+'px');
    app.classList.remove('srMergeImpact178');void app.offsetWidth;app.classList.add('srMergeImpact178');
    setTimeout(function(){app.classList.remove('srMergeImpact178');app.style.removeProperty('--srMergeShake');app.style.removeProperty('--srMergeShakeNeg');app.style.removeProperty('--srMergeShakeHalfNeg');app.style.removeProperty('--srMergeShakeThird');},380);
  }
  if(navigator.vibrate&&!reduced()){
    try{
      if(lv>=18)navigator.vibrate([28,22,34,20,52]);
      else if(lv>=12)navigator.vibrate([22,20,34]);
      else if(lv>=6)navigator.vibrate([18,16,26]);
      else navigator.vibrate(18);
    }catch(_){}
  }
  setTimeout(function(){if(box.parentNode)box.remove();},duration);
}

var base=sanctMergeDrop;
sanctMergeDrop=function(from,to){
  var st=sanctMergeState(),f=Number(from),t=Number(to);
  var src=Number.isInteger(f)&&Number.isInteger(t)?st.mergeBoard[f]:null;
  var dst=Number.isInteger(f)&&Number.isInteger(t)?st.mergeBoard[t]:null;
  var nx=(src&&dst===src)?sanctMergeNext(src):null;
  var anchor=nx?anchorForSlot(t):null;
  var res=base.apply(this,arguments);
  if(res&&nx)setTimeout(function(){fx(nx,anchor);},0);
  return res;
};
})();