/* Shadowreach v121 - Accomplissements retroactifs
   Les jalons deja atteints restent reclamables: aucune sauvegarde existante
   n'est marquee comme payee par la migration. */
(function(){
  'use strict';
  const RANK={COMMUN:0,PEU_COMMUN:1,RARE:2,EPIQUE:3,MYTHIQUE:4,LEGENDAIRE:5,DIVIN:6};
  const A=[
    ['forge5','Forge','Forge niveau 5',s=>s.forge.level>=5,{gold:5000}],
    ['forge10','Forge','Forge niveau 10',s=>s.forge.level>=10,{gold:10000}],
    ['forge15','Forge','Forge niveau 15',s=>s.forge.level>=15,{merge:{COMMUN:15}}],
    ['forge20','Forge','Forge niveau 20',s=>s.forge.level>=20,{merge:{COMMUN:30}}],
    ['forge30','Forge','Forge niveau 30',s=>s.forge.level>=30,{gold:50000,merge:{COMMUN:20}}],
    ['forge35','Forge','Forge niveau 35',s=>s.forge.level>=35,{raidKey:'minerai',pr:500}],
    ['forge40','Forge','Forge niveau 40',s=>s.forge.level>=40,{raidKey:'minerai',gold:100000}],
    ['forge50','Forge','Forge niveau 50',s=>s.forge.level>=50,{raidKeyQty:2,raidKey:'minerai',merge:{PEU_COMMUN:50}}],
    ['rb5','Rebirth','5 Rebirths',s=>s.rebirth.count>=5,{accel:{a5:2}}],
    ['rb15','Rebirth','15 Rebirths',s=>s.rebirth.count>=15,{accel:{a5:5}}],
    ['rb30','Rebirth','30 Rebirths',s=>s.rebirth.count>=30,{merge:{COMMUN:30}}],
    ['rb50','Rebirth','50 Rebirths',s=>s.rebirth.count>=50,{accel:{a10:5},merge:{PEU_COMMUN:20}}],
    ['rb100','Rebirth','100 Rebirths',s=>s.rebirth.count>=100,{universal:1,merge:{RARE:20},essence:500,eclat:500}],
    ['raid10','Raids','10 Raids accomplis',s=>raidCount(s)>=10,{gold:5000}],
    ['raid20','Raids','20 Raids accomplis',s=>raidCount(s)>=20,{merge:{COMMUN:30}}],
    ['raid50','Raids','50 Raids accomplis',s=>raidCount(s)>=50,{merge:{RARE:20},choice:true}],
    ['raid100','Raids','100 Raids accomplis',s=>raidCount(s)>=100,{gold:1000000,eclat:750,essence:750,merge:{RARE:30}}],
    ['floor25','Etages','Atteindre l’etage 25',s=>s.recordFloor>=25,{essence:250}],
    ['floor50','Etages','Atteindre l’etage 50',s=>s.recordFloor>=50,{minerai:2000,gold:5000}],
    ['floor75','Etages','Atteindre l’etage 75',s=>s.recordFloor>=75,{pr:1000,merge:{COMMUN:30}}],
    ['floor100','Etages','Atteindre l’etage 100',s=>s.recordFloor>=100,{eclat:500,essence:500,merge:{COMMUN:30}}],
    ['petRare','Familiers','Fusionner un familier Rare',s=>fusedRank(s)>=2,{apples:30}],
    ['petEpic','Familiers','Fusionner un familier Epique',s=>fusedRank(s)>=3,{merge:{COMMUN:30}}],
    ['petMythic','Familiers','Fusionner un familier Mythique',s=>fusedRank(s)>=4,{raidKey:'familier'}],
    ['petLegend','Familiers','Fusionner un familier Legendaire',s=>fusedRank(s)>=5,{universal:2,merge:{RARE:30}}]
  ];
  function raidCount(s){return Number(s.accomplishments&&s.accomplishments.raidWins)||0;}
  function fusedRank(s){return Number(s.accomplishments&&s.accomplishments.fusedPetRank)||-1;}
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
  function rewardText(r){
    const p=[];
    if(r.gold)p.push(r.gold.toLocaleString('fr-FR')+' Or');
    if(r.minerai)p.push(r.minerai.toLocaleString('fr-FR')+' Minerais');
    if(r.pr)p.push(r.pr.toLocaleString('fr-FR')+' PR');
    if(r.essence)p.push(r.essence.toLocaleString('fr-FR')+' Essences');
    if(r.eclat)p.push(r.eclat.toLocaleString('fr-FR')+' Etincelles');
    if(r.apples)p.push(r.apples+' Pommes');
    if(r.universal)p.push(r.universal+' Cle'+(r.universal>1?'s':'')+' universelle'+(r.universal>1?'s':''));
    if(r.raidKey)p.push((r.raidKeyQty||1)+' Cle'+((r.raidKeyQty||1)>1?'s':'')+' '+(r.raidKey==='minerai'?'Minerais':'Essence'));
    if(r.accel)Object.keys(r.accel).forEach(k=>p.push(r.accel[k]+'x accelerateur '+k.slice(1)+' min'));
    if(r.merge)Object.keys(r.merge).forEach(k=>{const q=r.merge[k],n=k==='PEU_COMMUN'?'Peu communes':k==='RARE'?'Rares':'Communes';p.push(q+' Pieces de fusion '+n);});
    if(r.choice)p.push('Choix : 500 Etincelles OU 500 Essences');
    return p.join(' + ');
  }
  function grant(s,r,choice){
    if(r.gold)s.gold=(s.gold||0)+r.gold;
    if(r.minerai)s.minerai=(s.minerai||0)+r.minerai;
    if(r.pr)s.rebirth.pr=(s.rebirth.pr||0)+r.pr;
    if(r.essence)s.essence=(s.essence||0)+r.essence;
    if(r.eclat)s.eclat=(s.eclat||0)+r.eclat;
    if(r.apples)s.apples=(s.apples||0)+r.apples;
    if(r.universal)s.universalKeys=(s.universalKeys||0)+r.universal;
    if(r.raidKey){const rr=s.raids[r.raidKey];if(rr)rr.keys=(rr.keys||0)+(r.raidKeyQty||1);}
    if(r.accel)Object.keys(r.accel).forEach(k=>s.accels[k]=(s.accels[k]||0)+r.accel[k]);
    if(r.merge){const x=ensure(s);Object.keys(r.merge).forEach(k=>x.mergePieces[k]=(x.mergePieces[k]||0)+r.merge[k]);}
    if(r.choice==='dummy'){}
    if(choice==='eclat')s.eclat=(s.eclat||0)+500;
    if(choice==='essence')s.essence=(s.essence||0)+500;
  }
  function row(a){
    const x=ensure(S),done=a[3](S),claimed=!!x.claimed[a[0]],r=a[4];
    let action='';
    if(claimed)action='<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Recupere</span>';
    else if(!done)action='<span class="pill">En cours</span>';
    else if(r.choice)action='<div class="row gap4"><button class="btn sm blue" data-ach-choice="eclat" data-ach="'+a[0]+'">500 Etincelles</button><button class="btn sm purple" data-ach-choice="essence" data-ach="'+a[0]+'">500 Essences</button></div>';
    else action='<button class="btn sm green" data-ach="'+a[0]+'">Recuperer</button>';
    return '<div class="itemRow"><div class="flex1"><div class="b small">'+a[2]+'</div><div class="mute tiny">'+rewardText(r)+'</div></div>'+action+'</div>';
  }
  function open(){
    ensure(S);const cats=['Forge','Rebirth','Raids','Etages','Familiers'];
    openModal(cats.map(c=>'<div class="sect" style="margin:12px 0 6px">'+c+'</div>'+A.filter(a=>a[1]===c).map(row).join('')).join('')+'<div class="mt10"><button class="btn ghost" data-act="closeModal">Fermer</button></div>','Accomplissements');
  }
  function claim(id,choice){
    const a=A.find(z=>z[0]===id);if(!a)return;const x=ensure(S);
    if(x.claimed[id]||!a[3](S))return;
    if(a[4].choice&&choice!=='eclat'&&choice!=='essence')return;
    update(s=>{const y=ensure(s);grant(s,a[4],choice);y.claimed[id]=true;if(choice)y.choices=y.choices||{},y.choices[id]=choice;});
    toast('Accomplissement recupere !',true);
    if(typeof ACT!=='undefined'&&typeof ACT.accomplishments==='function')ACT.accomplishments();else open();
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
  ACT.accomplishments=()=>open();
  /* Canonical claim clicks are owned by accomplishments-claim-v140.js. Keep V121
     focused on legacy state/event compatibility instead of installing a second handler. */
})();