/* Shadowreach v121 - Accomplissements retroactifs
   Legacy raid/fusion event compatibility only. Historical state migration lives
   in accomplishments-reward-fix-v127.js; canonical UI and claim/payout ownership
   live in accomplishments-canonical-v139.js and accomplishments-claim-v140.js. */
(function(){
  'use strict';
  const RANK={COMMUN:0,PEU_COMMUN:1,RARE:2,EPIQUE:3,MYTHIQUE:4,LEGENDAIRE:5,DIVIN:6};
  function acc(s){
    if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
    return s.accomplishments;
  }
  /* A raid victory is recorded exactly when its result is presented. This keeps
     the original result-time semantics without a permanent 500 ms observer. */
  if(typeof showRaidResult==='function'){
    const oldShowRaidResult=showRaidResult;
    const seenRaidResults=new WeakSet();
    showRaidResult=function(r){
      if(r&&typeof r==='object'&&r.won&&!seenRaidResults.has(r)){
        seenRaidResults.add(r);
        update(s=>{const x=acc(s);x.raidWins=(Number(x.raidWins)||0)+1;});
      }
      return oldShowRaidResult.apply(this,arguments);
    };
  }
  const oldFuse=ACT.fuse;
  ACT.fuse=(a)=>{const before=(S.pets||[]).map(p=>p.id);oldFuse(a);const after=(S.pets||[]).filter(p=>before.indexOf(p.id)<0);if(after.length){const best=Math.max.apply(null,after.map(p=>RANK[p.rarity]??-1));if(best>=0)update(s=>{const x=acc(s);const current=typeof x.fusedPetRank==='number'?x.fusedPetRank:-1;x.fusedPetRank=Math.max(current,best);});}};
  /* V121 intentionally owns no Accomplishments renderer or payout path.
     Durable save migration is owned by V127; V121 has no save migration path. */
})();
