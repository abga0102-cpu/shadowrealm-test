/* SHADOWREACH · dedicated personal tree renderer v116
   Replaces the invalid v111 renderer. UI only: TREE_NODES, requirements, costs, levels,
   mastery, timers and saves remain authoritative. */
(function(){
'use strict';
if(window.__srTreeDedicatedV116)return;
window.__srTreeDedicatedV116=true;
if(typeof TREE_NODES==='undefined'||typeof treeLv!=='function'||typeof treeReqOk!=='function')return;
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
function nodeHTML(n,active,remain){var lv=treeLv(S,n.id),maxed=lv>=n.max,busy=active===n.id,open=treeReqOk(S,n),state=n.masteryKey?(lv?'OBTENUE':masteryProgress(n)):(lv+'/'+n.max);if(busy&&typeof fmtTime==='function')state=fmtTime(remain);return '<button class="srDNode '+(!open?'locked ':'')+(maxed?'maxed ':'')+(busy?'busy':'')+'" data-act="treeNode" data-arg="'+esc(n.id)+'"><span class="ico">'+(n.masteryKey?'🔑':'◆')+'</span><span class="txt"><b>'+esc(n.short||n.label||n.id)+'</b></span><strong>'+esc(state)+'</strong></button>';}
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
/* BottomNav's canonical post-render lifecycle covers route rerenders deterministically.
   Keep startup sync for the initial DOM and avoid document-wide observation/polling. */
var syncQueued=false;
function scheduleModeSync(){if(syncQueued)return;syncQueued=true;requestAnimationFrame(function(){syncQueued=false;syncMode();});}
window.addEventListener('sr:bottomnavrendered',scheduleModeSync);
setTimeout(syncMode,0);try{if(typeof render==='function')render();}catch(_){}
})();