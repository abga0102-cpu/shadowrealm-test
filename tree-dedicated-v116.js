/* SHADOWREACH · dedicated personal tree renderer v116
   Replaces the invalid v111 renderer. UI only: TREE_NODES, requirements, costs, levels,
   mastery, timers and saves remain authoritative. */
(function(){
'use strict';
if(window.__srTreeDedicatedV116)return;
window.__srTreeDedicatedV116=true;
if(typeof TREE_NODES==='undefined'||typeof treeLv!=='function'||typeof treeReqOk!=='function')return;
/* V117's naming-only gold labels now live with the canonical dedicated Tree renderer.
   This changes labels only; effects, requirements, costs, levels, timers and saves stay untouched. */
if(typeof TREE_BY_ID!=='undefined'){
  var clearerGoldLabels={n1_07:'Gain d’Or I',n2_07:'Gain d’Or II',n3_07:'Gain d’Or III',n4_07:'Gain d’Or IV'};
  Object.keys(clearerGoldLabels).forEach(function(id){var n=TREE_BY_ID[id];if(n){n.label=clearerGoldLabels[id];n.short=clearerGoldLabels[id];}});
}
var branches=[
{id:'familier',label:'Familier',sub:'Oeufs',icon:'🐾'},
{id:'or',label:'Or',sub:'Autonomie',icon:'●'},
{id:'minerai',label:'Minerais',sub:'Forge',icon:'⛏'},
{id:'pe',label:'PE',sub:'Recherche',icon:'◆'},
{id:'competence',label:'Compétence',sub:'Équipement',icon:'✦'}
];
var selected='familier';
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function branchId(n){var e=n.effect||'';if(n.masteryKey){if(n.raidTarget==='evolution')return'pe';return n.raidTarget||'pe';}if(e==='petDmg'||e==='petHp'||e==='eggFree'||e==='eggSlot'||e.indexOf('hatch_')===0)return'familier';if(e==='goldAll'||e==='afkGain'||e==='afkTime')return'or';if(e.indexOf('forge')===0)return'minerai';if(e==='peRaid'||e==='research'||e==='techCost')return'pe';if(e==='skillDmg'||e==='skillFree'||e==='skillCost'||e==='passDmg'||e==='passHp'||e.indexOf('eq_')===0)return'competence';return'pe';}
function masteryProgress(n){var r=n.masteryReq||[],d=0;for(var i=0;i<r.length;i++)if(treeLv(S,r[i])>=2)d++;return d+'/'+r.length;}
function nodeHTML(n,active,remain){var lv=treeLv(S,n.id),maxed=lv>=n.max,busy=active===n.id,open=treeReqOk(S,n),state=n.masteryKey?(lv?'OBTENUE':masteryProgress(n)):(lv+'/'+n.max);if(busy&&typeof fmtTime==='function')state=fmtTime(remain);return '<button class="srDNode '+(!open?'locked ':'')+(maxed?'maxed ':'')+(busy?'busy ':'')+'" data-act="treeNode" data-arg="'+esc(n.id)+'"><span class="ico">'+(n.masteryKey?'🔑':'◆')+'</span><span class="txt"><b>'+esc(n.short||n.label||n.id)+'</b></span><strong>'+esc(state)+'</strong></button>';}
function dedicatedGraph(active,remain){var groups={};for(var i=0;i<branches.length;i++)groups[branches[i].id]={1:[],2:[],3:[],4:[],key:[]};for(var j=0;j<TREE_NODES.length;j++){var n=TREE_NODES[j];if(n.deprecatedKey)continue;var id=branchId(n);if(!groups[id])continue;if(n.masteryKey)groups[id].key.push(n);else if(n.tier>=1&&n.tier<=4)groups[id][n.tier].push(n);}var branch=branches.filter(function(b){return b.id===selected;})[0]||branches[0],g=groups[branch.id];var h='<div class="srDedicatedTree"><div class="srDTop"><b>ARBRE PERSONNEL</b><span>'+esc(S&&S.pe!=null?S.pe:'')+' PE</span></div><div class="srDTabs">';for(i=0;i<branches.length;i++){var b=branches[i];h+='<button type="button" class="srDTab '+(b.id===branch.id?'on':'')+'" data-tree-tab="'+b.id+'"><span>'+b.icon+'</span><small>'+b.label+'</small></button>';}h+='</div><section class="srDPath"><header><span class="big">'+branch.icon+'</span><div><b>'+branch.label.toUpperCase()+'</b><small>Voie secondaire : '+branch.sub+'</small></div></header>';for(var t=1;t<=4;t++){var a=g[t];a.sort(function(x,y){return(x.row-y.row)||(x.lane-y.lane)||x.id.localeCompare(y.id);});h+='<div class="srDTier"><div class="srDTierTitle">PALIER '+t+'</div>';for(var k=0;k<a.length;k++)h+=nodeHTML(a[k],active,remain);h+='</div>';if(t===2&&g.key.length){h+='<div class="srDMaster"><div>MAÎTRISE DE LA VOIE</div>';for(k=0;k<g.key.length;k++)h+=nodeHTML(g.key[k],active,remain);h+='</div>';}}h+='</section></div>';return h;}
treeGraph=dedicatedGraph;try{window.treeGraph=dedicatedGraph;}catch(_){}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-tree-tab]'):null;if(!b)return;e.preventDefault();selected=b.getAttribute('data-tree-tab')||'familier';try{if(typeof render==='function')render();}catch(_){}},true);
function syncMode(){var s=document.getElementById('screen'),on=!!(s&&s.querySelector('.srDedicatedTree'));document.documentElement.classList.toggle('srTreeDedicatedMode',on);}
var style=document.createElement('style');
style.textContent=[
'html.srTreeDedicatedMode #hud,html.srTreeDedicatedMode #tabs{display:none!important}',
'html.srTreeDedicatedMode #screen{padding-top:max(6px,env(safe-area-inset-top))!important;padding-bottom:8px!important;min-height:100vh!important}',
'.srTreeDedicatedMode .screenHead{position:sticky!important;top:0!important;z-index:40!important;margin:0!important;padding:7px 9px!important;min-height:48px!important;background:#0b1425!important}',
'.srTreeDedicatedMode .screenHead .sub,.srTreeDedicatedMode .infoBox,.srTreeDedicatedMode .treeHelp,.srTreeDedicatedMode .hintBox{display:none!important}',
'.srDedicatedTree{padding:2px 7px 24px;color:#eef4ff}',
'.srDTop{display:flex;align-items:center;justify-content:space-between;padding:5px 3px 7px;border-bottom:1px solid #24344f}',
'.srDTop b{font-family:Georgia,serif;color:#f4d27b;font-size:16px;letter-spacing:1px}.srDTop span{font-size:11px;font-weight:900;color:#8ee7ef}',
'.srDTabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding:8px 0;position:sticky;top:48px;z-index:35;background:#0a1220}',
'.srDTab{min-width:0;padding:7px 2px 6px;border:1px solid #31415d;border-radius:10px;background:#111c2e;color:#9eabc1}.srDTab span{display:block;font-size:15px}.srDTab small{display:block;margin-top:3px;font-size:7.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.srDTab.on{border-color:#e9bd55;color:#ffd66f;background:#2a2418}',
'.srDPath{border:1px solid #344763;border-radius:15px;background:#09111e;padding:9px}.srDPath>header{display:flex;align-items:center;gap:10px;padding:3px 3px 10px;border-bottom:1px solid #223149}.srDPath .big{display:grid;place-items:center;width:38px;height:38px;border:1px solid #d9ae4d;border-radius:50%;font-size:19px}.srDPath header b{display:block;color:#f1c65e;font-size:16px}.srDPath header small{display:block;color:#8fa0ba;font-size:9px;margin-top:2px}',
'.srDTier{padding:11px 0 2px}.srDTierTitle{color:#f0c45d;font:900 10px/1 system-ui;letter-spacing:1.3px;margin:0 2px 8px}',
'.srDNode{width:100%;min-height:52px;margin:0 0 7px;padding:7px 9px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:8px;text-align:left;border:1px solid #49658c;border-radius:12px;background:#101b2c;color:#f5f7fb}.srDNode .ico{display:grid;place-items:center;width:31px;height:31px;border:1px solid #d7aa48;border-radius:50%;color:#efc55e}.srDNode .txt b{display:block;font-size:11px}.srDNode>strong{font-size:9px;color:#e9c05c}.srDNode.locked{opacity:.52;background:#080d16}.srDNode.maxed{border-color:#48ca7b;background:#102218}.srDNode.busy{border-color:#f2c44f;background:#28200d}',
'.srDMaster{margin:8px 0 2px;padding:8px;border:1px solid rgba(239,195,86,.4);border-radius:12px;background:rgba(239,195,86,.035);color:#f0c45d;font-size:9px;font-weight:900;letter-spacing:.8px}.srDMaster>div:first-child{margin-bottom:7px;text-align:center}',
'.srRadialTree,.srTreeClear{display:none!important}'
].join('');
document.head.appendChild(style);
/* V247/V250 was presentation-only. Keep its exact CSS and historical style marker with
   the canonical dedicated Tree renderer instead of paying for a separate runtime script. */
window.__srPersonalTreeSpectacleV250=true;
var oldSpectacle=document.getElementById('srPersonalTreeSpectacleV250Style');if(oldSpectacle)oldSpectacle.remove();
var spectacle=document.createElement('style');spectacle.id='srPersonalTreeSpectacleV250Style';spectacle.textContent=`
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
document.head.appendChild(spectacle);
/* BottomNav's canonical post-render lifecycle covers route rerenders deterministically.
   Keep direct startup sync after the initial synchronous render and avoid document-wide
   observation, polling, or a zero-delay bootstrap timer. */
var syncQueued=false;
function scheduleModeSync(){if(syncQueued)return;syncQueued=true;requestAnimationFrame(function(){syncQueued=false;syncMode();});}
window.addEventListener('sr:bottomnavrendered',scheduleModeSync);
try{if(typeof render==='function')render();}catch(_){}
syncMode();
})();