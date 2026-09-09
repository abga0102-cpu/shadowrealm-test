/* Shadowreach V237 — courbe de rareté Familiers inspirée de Forge Master, adaptée aux fusions.
   Maîtrise 1 = 100% Commun. Mythique verrouillé <25. Légendaire = Ascension Familier 1.
   Divin = Ascension personnage. Les autres systèmes conservent getRates() d'origine. */
(function(){
  'use strict';
  if(window.__srFamRatesBalanceV237)return;
  window.__srFamRatesBalanceV237=true;
  if(typeof getRates!=='function')return;

  var baseGetRates=getRates;
  var ANCHORS=[
    {m:1,  COMMUN:100, PEU_COMMUN:0,  RARE:0,  EPIQUE:0,   MYTHIQUE:0},
    {m:10, COMMUN:74,  PEU_COMMUN:16, RARE:9,  EPIQUE:1,   MYTHIQUE:0},
    {m:15, COMMUN:66,  PEU_COMMUN:18, RARE:14, EPIQUE:2,   MYTHIQUE:0},
    {m:20, COMMUN:60,  PEU_COMMUN:20, RARE:17, EPIQUE:3,   MYTHIQUE:0},
    {m:25, COMMUN:56,  PEU_COMMUN:20, RARE:19, EPIQUE:4,   MYTHIQUE:1},
    {m:30, COMMUN:52,  PEU_COMMUN:21, RARE:22, EPIQUE:4,   MYTHIQUE:1},
    {m:40, COMMUN:47,  PEU_COMMUN:23, RARE:24, EPIQUE:4.5, MYTHIQUE:1.5},
    {m:50, COMMUN:44,  PEU_COMMUN:25, RARE:25, EPIQUE:4.5, MYTHIQUE:1.5}
  ];
  var BASE_KEYS=['COMMUN','PEU_COMMUN','RARE','EPIQUE','MYTHIQUE'];

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function lerp(a,b,t){return a+(b-a)*t;}

  function curveAt(m){
    m=clamp(Number(m)||0,1,50);
    var lo=ANCHORS[0],hi=ANCHORS[ANCHORS.length-1];
    for(var i=1;i<ANCHORS.length;i++){
      if(m<=ANCHORS[i].m){lo=ANCHORS[i-1];hi=ANCHORS[i];break;}
    }
    var t=hi.m===lo.m?0:(m-lo.m)/(hi.m-lo.m);
    var out={};
    BASE_KEYS.forEach(function(k){out[k]=lerp(lo[k],hi[k],t);});
    return out;
  }

  function effectiveMastery(m,stars){
    m=clamp(Number(m)||0,1,50);
    var st=Math.max(0,Number(stars)||0);
    if(!st)return m;
    var head=0.22,cap=0.66;
    try{
      if(typeof ASCENSION!=='undefined'&&ASCENSION.pet&&Number.isFinite(ASCENSION.pet.headStart))head=ASCENSION.pet.headStart;
      if(typeof STAR_HEADSTART_CAP!=='undefined'&&Number.isFinite(STAR_HEADSTART_CAP))cap=STAR_HEADSTART_CAP;
    }catch(_){}
    var boost=Math.min(cap,st*head);
    var climb=m/50;
    return clamp(50*(boost+(1-boost)*climb),1,50);
  }

  getRates=function(system,mastery,ascension,stars){
    if(system!=='pet')return baseGetRates.apply(this,arguments);

    var actual=clamp(Number(mastery)||0,1,50);
    var st=Math.max(0,Number(stars)||0);
    var legacy=baseGetRates.apply(this,arguments)||{};
    var eff=effectiveMastery(actual,st);
    var out=curveAt(eff);

    // Paliers stricts : les head-starts d'Ascension ne contournent jamais les déblocages de maîtrise.
    if(actual<10)out.EPIQUE=0;
    if(actual<25)out.MYTHIQUE=0;

    // Légendaire : uniquement après au moins 1 Ascension Familier.
    var legendary=st>=1?Math.max(0,Number(legacy.LEGENDAIRE)||0):0;
    // Divin : uniquement après l'Ascension personnage ; conserver ensuite la courbe déjà validée.
    var divine=(Number(ascension)||0)>0?Math.max(0,Number(legacy.DIVIN)||0):0;
    var available=Math.max(0,100-legendary-divine);

    // Les catégories autorisées absorbent proportionnellement l'espace restant.
    // Avant les seuils, Épique/Mythique à 0 ne peuvent donc jamais être tirés indirectement.
    var sum=BASE_KEYS.reduce(function(n,k){return n+Math.max(0,Number(out[k])||0);},0)||1;
    BASE_KEYS.forEach(function(k){out[k]=Math.max(0,out[k])*available/sum;});
    out.LEGENDAIRE=legendary;
    out.DIVIN=divine;

    // Correction numérique : total strictement 100 sans gonfler les raretés hautes.
    var total=PET_RARITY_ORDER.reduce(function(n,k){return n+(Number(out[k])||0);},0);
    out.COMMUN=Math.max(0,(out.COMMUN||0)+(100-total));
    return out;
  };
})();