/* Shadowreach v121 - Accomplissements retroactifs
   Legacy state/event compatibility only. Canonical UI and claim/payout ownership
   live in accomplishments-canonical-v139.js and accomplishments-claim-v140.js. */
(function(){
  'use strict';
  const RANK={COMMUN:0,PEU_COMMUN:1,RARE:2,EPIQUE:3,MYTHIQUE:4,LEGENDAIRE:5,DIVIN:6};
  function ensure(s){
    if(!s.accomplishments||typeof s.accomplishments!=='object')s.accomplishments={};
    const x=s.accomplishments;
    if(!x.claimed||typeof x.claimed!=='object')x.claimed={};
    if(!x.mergePieces||typeof x.mergePieces!=='object')x.mergePieces={};
    if(typeof x.raidWins!=='number'){
      /* Anciennes sauvegardes n'avaient pas le total de victoires. Les records
         de raid sont un minimum prouve, jamais une estimation superieure. */
      x.raidWins=Object.values(s.raids||{}).reduce((n,r)=>n+Math.max(0,Number(r&&r.record)||0),0);
    }
    if(typeof x.fusedPetRank!=='number')x.fusedPetRank=-1;
    if(!x.v121Migrated)x.v121Migrated=true;
    return x;
  }
  /* Initialize/migrate accomplishment state once at module startup. The state is
     also normalized at every accomplishments/event entry point, so V121 does not
     need to wrap the global render lifecycle. */
  try{if(typeof S!=='undefined'&&S)ensure(S);}catch(_){}
  /* A raid victory is recorded exactly when its result is presented. This keeps
     the original result-time semantics without a permanent 500 ms observer. */
  if(typeof showRaidResult==='function'){
    const oldShowRaidResult=showRaidResult;
    const seenRaidResults=new WeakSet();
    showRaidResult=function(r){
      if(r&&typeof r==='object'&&r.won&&!seenRaidResults.has(r)){
        seenRaidResults.add(r);
        update(s=>ensure(s).raidWins++);
      }
      return oldShowRaidResult.apply(this,arguments);
    };
  }
  const oldFuse=ACT.fuse;
  ACT.fuse=(a)=>{const before=(S.pets||[]).map(p=>p.id);oldFuse(a);const after=(S.pets||[]).filter(p=>before.indexOf(p.id)<0);if(after.length){const best=Math.max.apply(null,after.map(p=>RANK[p.rarity]??-1));if(best>=0)update(s=>{const x=ensure(s);x.fusedPetRank=Math.max(x.fusedPetRank,best);});}};
  /* V121 intentionally owns no Accomplishments renderer or payout path. */
})();
