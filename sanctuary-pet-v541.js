/* Shadowreach V541 — paid convenience only; manual merges remain free. */
(function(){
'use strict';
const COSTS={'10-gold':{ms:600000,amount:100000,currency:'gold'},'10-gems':{ms:600000,amount:10,currency:'gems'},'20-gold':{ms:1200000,amount:150000,currency:'gold'},'20-gems':{ms:1200000,amount:15,currency:'gems'}};
function petTick(){
  if(typeof S==='undefined'||typeof sanctMergeState!=='function'||typeof sanctMergePair!=='function')return;
  const st=S.sanctuary;if(!st||!st.mergePetUntil)return;
  const now=Date.now(),until=Number(st.mergePetUntil)||0;
  const previous=Number(st.mergePetTick)||Math.min(now,until);
  const effective=Math.min(now,until);
  const cycles=Math.min(600,Math.floor(Math.max(0,effective-previous)/2000));
  let merged=0;
  for(let n=0;n<cycles;n++){
    const pair=sanctMergePair(st);if(!pair)break;
    const next=sanctMergeNext(pair[2]);if(!next)break;
    st.mergeBoard[pair[0]]=null;st.mergeBoard[pair[1]]=next;
    st.mergeFusions=(st.mergeFusions||0)+1;st.fusions=(st.fusions||0)+1;
    sanctMergeDiscover(st,next);merged++;
  }
  if(cycles)st.mergePetTick=previous+cycles*2000;
  if(now>=until){st.mergePetUntil=0;st.mergePetTick=0;}
  if(merged||now>=until&&until>0){
    dirty=true;if(typeof saveNow==='function')saveNow();
    if(merged&&typeof route!=='undefined'&&route==='sanctuaire'&&typeof render==='function')render();
  }
}
if(typeof ACT!=='undefined'){
  ACT.sanctPetHire=function(key){
    const offer=COSTS[key];if(!offer)return;
    const st=sanctMergeState();petTick();
    if(st.mergePetUntil>Date.now())return toast('Le petit fusionneur travaille déjà !');
    if((Number(S[offer.currency])||0)<offer.amount)return toast('Ressources insuffisantes');
    if(!confirm('Engager le petit fusionneur pour '+offer.ms/60000+' minutes ?\\nCoût : '+offer.amount.toLocaleString('fr-FR')+' '+(offer.currency==='gold'?'Or':'gemmes')+'\\nIl fusionnera gratuitement les paires présentes, une toutes les 2 secondes.'))return;
    if((Number(S[offer.currency])||0)<offer.amount)return toast('Ressources insuffisantes');
    S[offer.currency]-=offer.amount;
    st.mergePetUntil=Date.now()+offer.ms;st.mergePetTick=Date.now();
    dirty=true;if(typeof saveNow==='function')saveNow();
    toast('🐲 Ton petit fusionneur est au travail !',true);render();
  };
}
setInterval(petTick,2000);
window.addEventListener('focus',petTick);
document.addEventListener('visibilitychange',function(){if(!document.hidden)petTick();});
})();
