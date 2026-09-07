/* SHADOWREACH · Floor accomplishments v137
   Additive UI restoration: Etages belongs in Accomplissements alongside
   Forge, Rebirth and Raids. Legacy v121 remains authoritative for claims
   and rewards, so no economy or save state is duplicated here. */
(function(){
'use strict';
if(window.__srAccomplishmentsFloorsV137)return;window.__srAccomplishmentsFloorsV137=true;
if(typeof S==='undefined'||typeof ACT==='undefined'||typeof ACT.accomplishments!=='function'||typeof openModal!=='function')return;

var FLOORS=[
 {id:'floor25',floor:25,reward:'250 Essences'},
 {id:'floor50',floor:50,reward:'2 000 Minerais + 5 000 Or'},
 {id:'floor75',floor:75,reward:'1 000 PR + 30 Pièces de fusion Communes'},
 {id:'floor100',floor:100,reward:'500 Étincelles + 500 Essences + 30 Pièces de fusion Communes'}
];
function claimed(id){return !!(S.accomplishments&&S.accomplishments.claimed&&S.accomplishments.claimed[id]);}
function row(x){
 var done=(Number(S.recordFloor)||0)>=x.floor,got=claimed(x.id),action='';
 if(got)action='<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Récupéré</span>';
 else if(done)action='<button class="btn sm green" data-ach="'+x.id+'">Récupérer</button>';
 else action='<span class="pill">En cours</span>';
 return '<div class="itemRow"><div class="flex1"><div class="b small">Atteindre l’étage '+x.floor+'</div><div class="mute tiny">'+x.reward+'</div></div>'+action+'</div>';
}
function floorSection(){return '<div data-ach-floors-v137="1"><div class="sect" style="margin:12px 0 6px">Étages</div>'+FLOORS.map(row).join('')+'</div>';}
function overviewCard(){
 var v=Math.max(0,Number(S.recordFloor)||0),steps=[25,50,75,100],done=0,next=null;
 for(var i=0;i<steps.length;i++){if(v>=steps[i])done++;else if(next===null)next=steps[i];}
 var complete=done===steps.length;
 return '<div class="card frame" data-ach-floor-overview-v137="1" style="margin:6px 0"><div class="between"><div><div class="b">Étages</div><div class="mute tiny">'+(complete?done+' / '+steps.length+' jalons atteints':'Prochain jalon : '+next+' · '+done+' / '+steps.length+' atteints')+'</div></div><span class="pill"'+(complete?' style="color:var(--greenLit);border-color:#3FB950"':'')+'>'+(complete?'Terminé':v+' / '+next)+'</span></div></div>';
}

var base=ACT.accomplishments;
ACT.accomplishments=function(){
 var old=openModal;
 openModal=function(html,title){
  html=String(html);
  if(String(title||'').toLowerCase()==='accomplissements'){
    if(html.indexOf('data-ach-floor-overview-v137')<0){
      var ovEnd=html.indexOf('</div><div class="sect" style="margin:12px 0 6px">Forge</div>');
      if(ovEnd>=0)html=html.slice(0,ovEnd)+'</div>'+overviewCard()+html.slice(ovEnd+6);
      else html=overviewCard()+html;
    }
    if(html.indexOf('data-ach-floors-v137')<0){
      var close='<div class="mt10"><button class="btn ghost" data-act="closeModal">Fermer</button></div>';
      if(html.indexOf(close)>=0)html=html.replace(close,floorSection()+close);
      else html+=floorSection();
    }
  }
  return old(html,title);
 };
 try{return base();}finally{openModal=old;}
};
})();
