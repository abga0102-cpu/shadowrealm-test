/* SHADOWREACH · Sanctuary Merge FX V178
   Presentation only: preserves every merge rule, cost, reward and save value. */
(function(){
'use strict';
if(window.__srSanctMergeFxV178)return;window.__srSanctMergeFxV178=true;
if(typeof sanctMergeDrop!=='function'||typeof sanctMergeState!=='function'||typeof sanctMergeNext!=='function')return;

var ORDER=['COMMUN','PEU_COMMUN','RARE_I','RARE_II','EPIQUE_I','EPIQUE_II','MYTHIQUE_I','MYTHIQUE_II','MYTHIQUE_III','ARTEFACT_I','ARTEFACT_II','ARTEFACT_III','LEGENDAIRE_I','LEGENDAIRE_II','LEGENDAIRE_III','INFERNAL_I','INFERNAL_II','INFERNAL_III','IMMORTEL_I','IMMORTEL_II','IMMORTEL_III','DIVIN'];
function col(r){try{return (SANCT_MERGE_COLOR&&SANCT_MERGE_COLOR[r])||'#F5C542';}catch(_){return '#F5C542';}}
function name(r){try{return (SANCT_MERGE_NAME&&SANCT_MERGE_NAME[r])||r;}catch(_){return r;}}
function rank(r){var i=ORDER.indexOf(r);return i<0?0:i;}
function reduced(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
function css(){if(document.getElementById('srMergeFx178Style'))return;var s=document.createElement('style');s.id='srMergeFx178Style';s.textContent='\
#srMergeFx178{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center}\
#srMergeFx178 .veil{position:absolute;inset:0;background:radial-gradient(circle at 50% 47%,var(--mc) 0,transparent 13%,transparent 100%);animation:srMFVeil .52s ease-out both}\
#srMergeFx178 .core{position:relative;width:88px;height:88px;border-radius:50%;border:2px solid var(--mc);box-shadow:0 0 18px var(--mc),0 0 48px var(--mc);animation:srMFCore .68s cubic-bezier(.17,.86,.27,1.14) both}\
#srMergeFx178 .ring{position:absolute;left:50%;top:50%;width:78px;height:78px;margin:-39px;border-radius:50%;border:2px solid var(--mc);animation:srMFRing .72s ease-out both}\
#srMergeFx178 .ring.r2{animation-delay:.08s}\
#srMergeFx178 .spark{position:absolute;left:50%;top:50%;width:5px;height:22px;margin-left:-2.5px;margin-top:-11px;border-radius:6px;background:linear-gradient(#fff,var(--mc));box-shadow:0 0 9px var(--mc);transform-origin:2.5px calc(50% + var(--d));animation:srMFSpark .72s ease-out both}\
#srMergeFx178 .label{position:absolute;left:16px;right:16px;top:calc(50% + 68px);text-align:center;font-weight:1000;letter-spacing:.8px;text-shadow:0 2px 4px #000,0 0 18px var(--mc);animation:srMFLabel .82s ease-out both}\
#srMergeFx178 .label .up{font-size:11px;color:#fff;opacity:.9}\
#srMergeFx178 .label .rar{font-size:20px;color:var(--mc);margin-top:2px}\
#app.srMergeImpact178{animation:srMFShake .28s ease-out}\
@keyframes srMFCore{0%{transform:scale(.25) rotate(-10deg);opacity:0}35%{transform:scale(1.18);opacity:1}100%{transform:scale(.72);opacity:0}}\
@keyframes srMFRing{0%{transform:scale(.25);opacity:.95}100%{transform:scale(4.2);opacity:0}}\
@keyframes srMFSpark{0%{transform:rotate(var(--a)) translateY(0) scale(.3);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(var(--d) * -1)) scale(1);opacity:0}}\
@keyframes srMFVeil{0%{opacity:0}18%{opacity:.34}100%{opacity:0}}\
@keyframes srMFLabel{0%{transform:translateY(12px) scale(.94);opacity:0}24%{transform:translateY(0) scale(1.05);opacity:1}76%{opacity:1}100%{transform:translateY(-7px);opacity:0}}\
@keyframes srMFShake{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(-2px,1px,0)}50%{transform:translate3d(2px,-1px,0)}75%{transform:translate3d(-1px,0,0)}}\
@media(prefers-reduced-motion:reduce){#srMergeFx178 .spark,#srMergeFx178 .ring{display:none}#srMergeFx178 .core,#srMergeFx178 .veil,#srMergeFx178 .label{animation-duration:.25s!important}#app.srMergeImpact178{animation:none}}';document.head.appendChild(s);}
function fx(r){css();var old=document.getElementById('srMergeFx178');if(old)old.remove();var c=col(r),lv=rank(r),n=reduced()?0:Math.min(28,10+Math.floor(lv*.85)),box=document.createElement('div');box.id='srMergeFx178';box.style.setProperty('--mc',c);var h='<div class="veil"></div><div class="ring"></div><div class="ring r2"></div><div class="core"></div>';for(var i=0;i<n;i++){var a=(360/n*i)+(Math.random()*12-6),d=48+Math.random()*(28+lv*1.8);h+='<i class="spark" style="--a:'+a+'deg;--d:'+d+'px"></i>'; }h+='<div class="label"><div class="up">FUSION RÉUSSIE</div><div class="rar">'+name(r)+'</div></div>';box.innerHTML=h;document.body.appendChild(box);var app=document.getElementById('app');if(app&&!reduced()){app.classList.remove('srMergeImpact178');void app.offsetWidth;app.classList.add('srMergeImpact178');setTimeout(function(){app.classList.remove('srMergeImpact178');},320);}if(navigator.vibrate&&!reduced()){try{navigator.vibrate(lv>=18?[24,28,45]:lv>=12?[18,22,30]:[16,16,24]);}catch(_){}}setTimeout(function(){if(box.parentNode)box.remove();},900);}
var base=sanctMergeDrop;
sanctMergeDrop=function(from,to){var st=sanctMergeState(),f=Number(from),t=Number(to),src=Number.isInteger(f)&&Number.isInteger(t)?st.mergeBoard[f]:null,dst=Number.isInteger(f)&&Number.isInteger(t)?st.mergeBoard[t]:null,nx=(src&&dst===src)?sanctMergeNext(src):null,res=base.apply(this,arguments);if(res&&nx)setTimeout(function(){fx(nx);},0);return res;};
})();
