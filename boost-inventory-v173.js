/* SHADOWREACH · Boost inventory V228
   Consolidates V173 + V174 behavior without wrapping the global render loop.
   Temporary Sanctuary rewards are stored on claim and activated manually from
   the unified Personnage / Équipement screen. Sanctuary stays read-only for boosts.
   Active boosts remain visible on Home. */
(function(){
'use strict';
if(window.__srBoostInventoryV173)return;window.__srBoostInventoryV173=true;
if(typeof S==='undefined'||typeof sanctMergeState!=='function')return;

var DEFS={
 gold10_30:{type:'gold',pct:10,mins:30,label:'Or',icon:'gold'},
 xp20_30:{type:'xp',pct:20,mins:30,label:'XP',icon:'chart'},
 gold50_30:{type:'gold',pct:50,mins:30,label:'Or',icon:'gold'},
 xp50_60:{type:'xp',pct:50,mins:60,label:'XP',icon:'chart'},
 gold50_60:{type:'gold',pct:50,mins:60,label:'Or',icon:'gold'},
 pr50_60:{type:'pr',pct:50,mins:60,label:'PR',icon:'cycle'},
 gold50_300:{type:'gold',pct:50,mins:300,label:'Or',icon:'gold'},
 xp50_300:{type:'xp',pct:50,mins:300,label:'XP',icon:'chart'}
};
function st(){return sanctMergeState();}
function clean(type){
 var s=st(),a=s.activeBoosts[type],now=Date.now();if(!a)return null;
 a.queue=Array.isArray(a.queue)?a.queue:[];
 while(a&&Number(a.end||0)<=now){
   if(!a.queue.length){delete s.activeBoosts[type];return null;}
   var n=a.queue.shift(),start=Number(a.end)||now;
   a={pct:Number(n.pct)||0,end:start+(Number(n.mins)||0)*60000,queue:a.queue};s.activeBoosts[type]=a;
 }
 return a;
}
function duration(mins){if(mins>=60&&mins%60===0)return (mins/60)+' h';return mins+' min';}
function left(a){var sec=Math.max(0,Math.ceil((a.end-Date.now())/1000));return typeof fmtTime==='function'?fmtTime(sec):Math.ceil(sec/60)+' min';}
function activate(key){
 var d=DEFS[key],s=st();if(!d||!(Number(s.boostItems[key])>0))return false;
 var a=clean(d.type);
 if(a){if(typeof toast==='function')toast('Un bonus '+d.label+' est déjà actif');return false;}
 s.boostItems[key]=Math.max(0,(Number(s.boostItems[key])||0)-1);
 s.activeBoosts[d.type]={pct:d.pct,end:Date.now()+d.mins*60000,queue:[]};
 if(typeof dirty!=='undefined')dirty=true;if(typeof saveNow==='function')saveNow();
 if(typeof toast==='function')toast(d.label+' +'+d.pct+'% activé · '+duration(d.mins),true);
 if(typeof render==='function')render();return true;
}
function ownedRows(){
 var s=st(),keys=Object.keys(DEFS).filter(function(k){return (Number(s.boostItems[k])||0)>0;});
 if(!keys.length)return '<div class="mute tiny">Aucun boost en réserve.</div>';
 return keys.map(function(k){var d=DEFS[k],n=Number(s.boostItems[k])||0,a=clean(d.type);return '<div class="itemRow" style="border-left-color:'+(d.type==='gold'?'#F5C542':d.type==='xp'?'#3FCFD6':'#B15CF6')+'"><div class="row gap6 flex1">'+(typeof ic==='function'?ic(d.icon,18):'')+'<div><div class="b small">'+d.label+' +'+d.pct+'%</div><div class="mute tiny">'+duration(d.mins)+' · en réserve ×'+n+'</div></div></div>'+(a?'<span class="pill">Déjà actif</span>':'<button class="btn sm gold" data-boost-v173="activate" data-key="'+k+'">ACTIVER</button>')+'</div>';}).join('');
}
function activeRows(){
 return ['gold','xp','pr'].map(function(type){var a=clean(type);if(!a)return '';var label=type==='gold'?'Or':type==='xp'?'XP':'PR',icon=type==='gold'?'gold':type==='xp'?'chart':'cycle';return '<div class="row gap6" style="padding:4px 0">'+(typeof ic==='function'?ic(icon,15):'')+'<div class="flex1 b small">'+label+' +'+a.pct+'%</div><span class="pill" style="color:var(--greenLit);border-color:#3FB950">ACTIF · '+left(a)+'</span></div>';}).join('');
}
function panel(){
 var active=activeRows();return '<div id="boostInventoryV173"><div class="sect" style="margin-top:14px">Boosts</div><div class="card frame">'+(active?'<div class="tiny b" style="margin-bottom:5px">BONUS ACTIFS</div>'+active+'<div style="height:8px"></div>':'')+'<div class="tiny b" style="margin-bottom:5px">EN RÉSERVE</div>'+ownedRows()+'<div class="mute tiny mt6">Le chrono démarre uniquement quand tu appuies sur ACTIVER.</div></div></div>';
}
function homePills(){
 var rows=['gold','xp','pr'].map(function(type){var a=clean(type);if(!a)return '';var label=type==='gold'?'Or':type==='xp'?'XP':'PR',icon=type==='gold'?'gold':type==='xp'?'chart':'cycle';return '<span class="pill" data-act="go" data-arg="equipement" style="cursor:pointer;color:var(--greenLit);border-color:#3FB950">'+(typeof ic==='function'?ic(icon,11):'')+' +'+a.pct+'% '+label+' · '+left(a)+'</span>';}).join('');
 return rows?'<div id="activeBoostsV173" class="row gap6" style="padding:5px 10px;flex-wrap:wrap">'+rows+'</div>':'';
}
function extractBlock(html,id){
 var needle='id="'+id+'"',hit=html.indexOf(needle);if(hit<0)return null;
 var start=html.lastIndexOf('<div',hit);if(start<0)return null;
 var re=/<\/?div\b[^>]*>/gi,m,depth=0,end=-1;re.lastIndex=start;
 while((m=re.exec(html))){if(/^<div\b/i.test(m[0]))depth++;else depth--;if(depth===0){end=re.lastIndex;break;}}
 return end>start?{start:start,end:end,html:html.slice(start,end)}:null;
}
function moveBoostPanelTop(html){
 var block=extractBlock(html,'boostInventoryV173');if(!block)return html;
 var without=html.slice(0,block.start)+html.slice(block.end),pos=without.indexOf('<div class="pad');
 if(pos<0){var tb=without.indexOf('</div>');pos=tb>=0?tb+6:0;}
 return without.slice(0,pos)+block.html+without.slice(pos);
}
function sanctuaryReadOnly(html){
 if(!html)return html;
 html=html.replace(/<button\b[^>]*data-sanct-v130="boost"[^>]*>[\s\S]*?<\/button>/gi,'<span class="pill" style="color:var(--cyanLit);border-color:var(--cyan)">Dans Personnage</span>');
 html=html.replace('Les bonus d’un même type ne se cumulent jamais en puissance. Ils prolongent leur durée ou passent en file d’attente.','Les boosts sont stockés ici, mais leur activation se fait uniquement depuis Personnage.');
 return html;
}
function hookScreens(){
 if(typeof SCREENS==='undefined')return;
 var equip=SCREENS.equipement;
 if(typeof equip==='function'&&!equip.__boostV228){var e=function(){return moveBoostPanelTop(equip()+panel());};e.__boostV173=true;e.__boostV228=true;SCREENS.equipement=e;SCREENS.personnage=e;SCREENS.inventaire=e;}
 var sanct=SCREENS.sanctuaire;
 if(typeof sanct==='function'&&!sanct.__boostV228){var s=function(){return sanctuaryReadOnly(sanct());};s.__boostV228=true;SCREENS.sanctuaire=s;try{scrSanctuaire=s;}catch(_){} }
 var home=SCREENS.accueil;
 if(typeof home==='function'&&!home.__boostV173){var h=function(){var out=home();var p=homePills();if(!p)return out;var pos=out.indexOf('</div>');return pos>=0?out.slice(0,pos+6)+p+out.slice(pos+6):p+out;};h.__boostV173=true;SCREENS.accueil=h;}
 if(typeof TIMER_SCREENS!=='undefined'&&Array.isArray(TIMER_SCREENS)&&TIMER_SCREENS.indexOf('equipement')<0)TIMER_SCREENS.push('equipement');
}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-boost-v173="activate"]'):null;if(!b)return;e.preventDefault();e.stopPropagation();activate(b.getAttribute('data-key'));},true);
hookScreens();
window.SRBoostInventoryV173={defs:DEFS,activate:activate,panel:panel};
})();
