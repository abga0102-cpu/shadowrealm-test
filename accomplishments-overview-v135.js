/* SHADOWREACH · Development accomplishments canonical overview v135 */
(function(){
'use strict';
if(window.__srAccomplishmentsOverviewV135)return;window.__srAccomplishmentsOverviewV135=true;
if(typeof S==='undefined'||typeof ACT==='undefined'||typeof openModal!=='function')return;

var CATS=[
 {name:'Forge',value:function(){return Number(S.forge&&S.forge.level)||0;},steps:[5,10,15,20,30,35,40,50]},
 {name:'Rebirth',value:function(){return Number(S.rebirth&&S.rebirth.count)||0;},steps:[5,15,30,50,100]},
 {name:'Raids',value:function(){return Number(S.accomplishments&&S.accomplishments.raidWins)||0;},steps:[10,20,50,100]}
];
function esc(s){return String(s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function summary(c){var v=Math.max(0,c.value()),next=null,done=0;for(var i=0;i<c.steps.length;i++){if(v>=c.steps[i])done++;else if(next===null)next=c.steps[i];}var complete=done===c.steps.length;
 var status=complete?'Terminé':v+' / '+next;
 var detail=complete?done+' / '+c.steps.length+' jalons atteints':'Prochain jalon : '+next+' · '+done+' / '+c.steps.length+' atteints';
 return '<div class="card frame" style="margin:6px 0"><div class="between"><div><div class="b">'+esc(c.name)+'</div><div class="mute tiny">'+detail+'</div></div><span class="pill"'+(complete?' style="color:var(--greenLit);border-color:#3FB950"':'')+'>'+status+'</span></div></div>';
}
function overview(){return '<div data-ach-overview-v135="1"><div class="sect" style="margin:0 0 6px">Vue d’ensemble</div>'+CATS.map(summary).join('')+'</div>';}

/* v121 remains the reward/claim engine so existing claimed states and migrations are preserved.
   We only canonicalise the Development modal: approved categories + real current progress. */
var base=ACT.accomplishments;
ACT.accomplishments=function(){
 var old=openModal,used=false;
 openModal=function(html,title){
   if(String(title||'').toLowerCase()==='accomplissements'){
     used=true;html=String(html);
     /* Remove the obsolete, unapproved Etages/Familiers blocks from the displayed modal. */
     var cut=html.indexOf('<div class="sect" style="margin:12px 0 6px">Etages</div>');
     if(cut>=0){var close=html.lastIndexOf('<div class="mt10"><button class="btn ghost" data-act="closeModal">Fermer</button></div>');html=html.slice(0,cut)+(close>=0?html.slice(close):'');}
     /* Remove the mistaken player-title section from v134 if another wrapper inserts it. */
     html=html.replace(/<div data-ach-titles-v134="1">[\s\S]*?<\/div><\/div>/,'');
     html=overview()+html;
   }
   return old(html,title);
 };
 try{return base();}finally{openModal=old;if(!used){try{old(overview()+'<div class="mute tiny">Les récompenses détaillées sont temporairement indisponibles.</div>','Accomplissements');}catch(_){}}}
};
})();