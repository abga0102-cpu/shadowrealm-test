/* SHADOWREACH · Personal Tree spectacle V250
   Final visual layer targets the live dedicated-tree DOM directly.
   No renderer wrapper, economy, progression, save, timing or bonus changes. */
(function(){
'use strict';
if(window.__srPersonalTreeSpectacleV250)return;
window.__srPersonalTreeSpectacleV250=true;
var old=document.getElementById('srPersonalTreeSpectacleV250Style');if(old)old.remove();
var s=document.createElement('style');s.id='srPersonalTreeSpectacleV250Style';s.textContent=`
html:has(.srDedicatedTree) #screen{background:radial-gradient(circle at 50% 8%,#153651 0,#08111f 36%,#050a12 78%)!important}
.srDedicatedTree{position:relative!important;isolation:isolate!important;padding-bottom:36px!important;filter:drop-shadow(0 16px 34px rgba(0,0,0,.42))}
.srDedicatedTree:before{content:"";position:absolute;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(circle at 12% 22%,rgba(63,207,214,.13),transparent 28%),radial-gradient(circle at 86% 62%,rgba(177,92,246,.11),transparent 30%),radial-gradient(circle at 48% 92%,rgba(232,180,74,.09),transparent 30%)}
.srDedicatedTree .srDTop{padding:9px 5px 11px!important;border-bottom-color:#3a5879!important;box-shadow:0 10px 30px rgba(63,207,214,.07)}
.srDedicatedTree .srDTop b{font-size:18px!important;text-shadow:0 0 18px rgba(232,180,74,.32)!important}
.srDedicatedTree .srDTop span{padding:5px 9px!important;border:1px solid #41747e!important;border-radius:999px!important;background:#0d2631!important;box-shadow:0 0 18px rgba(63,207,214,.24)!important}
.srDedicatedTree .srDTab{transition:transform .16s ease,box-shadow .2s ease,border-color .2s ease!important;background:linear-gradient(180deg,#13223a,#0d1728)!important}
.srDedicatedTree .srDTab.on{transform:translateY(-1px)!important;border-color:#efc85f!important;background:linear-gradient(180deg,#3d2f16,#211b10)!important;box-shadow:0 0 24px rgba(232,180,74,.26)!important}
.srDedicatedTree .srDPath{border-color:#3b5475!important;background:linear-gradient(180deg,rgba(9,19,34,.97),rgba(5,11,20,.99))!important;box-shadow:0 18px 50px #0009,inset 0 0 58px rgba(63,207,214,.05),0 0 30px rgba(63,207,214,.06)!important}
.srDedicatedTree .srDPath .big{width:44px!important;height:44px!important;background:radial-gradient(circle,#3a2e16,#101727 70%)!important;box-shadow:0 0 0 5px rgba(232,180,74,.08),0 0 27px rgba(232,180,74,.28)!important;animation:sr250Core 2.6s ease-in-out infinite!important}
.srDedicatedTree .srDTier{position:relative!important;padding-top:18px!important}
.srDedicatedTree .srDTier:not(:first-of-type):before{content:"";position:absolute;left:24px;top:-10px;width:2px;height:25px;background:linear-gradient(#365477,#79dce4);box-shadow:0 0 11px rgba(99,219,228,.48)}
.srDedicatedTree .srDTierTitle{display:flex!important;align-items:center!important;gap:8px!important}
.srDedicatedTree .srDTierTitle:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,rgba(232,180,74,.62),rgba(63,207,214,.16),transparent);box-shadow:0 0 7px rgba(232,180,74,.2)}
.srDedicatedTree .srDNode{min-height:59px!important;position:relative!important;overflow:hidden!important;background:linear-gradient(135deg,#112039,#0d1728)!important;box-shadow:inset 0 1px 0 #ffffff08,0 7px 18px #0004!important;transition:transform .16s ease,border-color .2s ease,box-shadow .2s ease!important}
.srDedicatedTree .srDNode:active{transform:scale(.985)}
.srDedicatedTree .srDNode:not(.locked):not(.maxed):not(.busy){border-color:#59d9e5!important;box-shadow:0 0 0 1px rgba(89,217,229,.10),0 0 22px rgba(63,207,214,.18),inset 0 0 22px rgba(63,207,214,.04)!important}
.srDedicatedTree .srDNode:not(.locked):not(.maxed):not(.busy):before{content:"";position:absolute;inset:-80% -45%;background:linear-gradient(105deg,transparent 43%,rgba(159,244,245,.14) 50%,transparent 57%);animation:sr250Sweep 3s linear infinite;pointer-events:none}
.srDedicatedTree .srDNode:not(.locked):not(.maxed):not(.busy) .ico{border-color:#72e9ee!important;color:#a8fbff!important;box-shadow:0 0 18px rgba(63,207,214,.34)!important}
.srDedicatedTree .srDNode.busy{border-color:#f2c44f!important;background:linear-gradient(135deg,#2d240f,#16190f)!important;box-shadow:0 0 30px rgba(242,196,79,.30)!important;animation:sr250Busy 1.25s ease-in-out infinite!important}
.srDedicatedTree .srDNode.maxed{border-color:#4bd67f!important;background:linear-gradient(135deg,#102a1b,#0b1716)!important;box-shadow:0 0 28px rgba(72,202,123,.25)!important}
.srDedicatedTree .srDNode.maxed .ico{border-color:#72e59b!important;color:#a0f0bc!important;box-shadow:0 0 20px rgba(72,202,123,.34)!important}
.srDedicatedTree .srDNode.locked{opacity:.42!important;background:#070c14!important;filter:saturate(.4)!important;box-shadow:none!important}
.srDedicatedTree .srDMaster{position:relative!important;overflow:hidden!important;border-color:rgba(232,180,74,.52)!important;background:radial-gradient(circle at 50% 0,rgba(74,53,19,.24),#120f0a 42%,#0b111c 100%)!important;box-shadow:0 0 32px rgba(232,180,74,.19),inset 0 0 38px rgba(232,180,74,.06)!important}
.srDedicatedTree .srDMaster:before{content:"";position:absolute;inset:-120% -40%;pointer-events:none;background:conic-gradient(from 0deg,transparent,rgba(232,180,74,.10),transparent 30%);animation:sr250Spin 7s linear infinite}
.srDedicatedTree .srDMaster .srDNode{border-color:#efc85f!important;box-shadow:0 0 26px rgba(232,180,74,.20)!important}
.srDedicatedTree .srDMaster .srDNode .ico{animation:sr250Key 1.8s ease-in-out infinite!important;box-shadow:0 0 20px rgba(232,180,74,.34)!important}
@keyframes sr250Sweep{from{transform:translateX(-38%)}to{transform:translateX(38%)}}@keyframes sr250Busy{0%,100%{filter:brightness(.96)}50%{filter:brightness(1.16)}}@keyframes sr250Key{0%,100%{transform:scale(.96);filter:brightness(.95)}50%{transform:scale(1.09);filter:brightness(1.22)}}@keyframes sr250Core{0%,100%{transform:scale(.97)}50%{transform:scale(1.06)}}@keyframes sr250Spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.srDedicatedTree *{animation:none!important;transition:none!important}}
`;
document.head.appendChild(s);
})();