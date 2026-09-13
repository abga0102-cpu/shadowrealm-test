/* SHADOWREACH · Arbre personnel radial v86
   Topologie libre: spécialisations + satellites, sans modifier les valeurs existantes.
   1/5 ouvre les routes normales. Les clés de maîtrise demandent 2/5 sur leurs
   nœuds désignés puis une recherche de 7 jours (réduction Recherche incluse).
*/
(function(){
  'use strict';
  if (typeof TREE_NODES === 'undefined' || typeof TREE_BY_ID === 'undefined') return;

  var KEY_BASE_SECONDS = 7 * 24 * 60 * 60;
  var KEY_COLOR = '#FFD65E';
  var KEY_DEFS = [
    { id:'mk_familier', label:'Clé Raid Familier', short:'Clé Familier', raid:'familier', angle:-90,
      mastery:['n1_13','n1_14','n2_13','n2_14'] },
    { id:'mk_or', label:'Clé Raid Or', short:'Clé Or', raid:'or', angle:-18,
      mastery:['n1_06','n1_07','n2_06','n2_07'] },
    /* Le jeu n'a pas de bonus Minerai direct dans cet arbre. La Forge reste donc
       la maîtrise Minerais par nécessité économique, mais son placement reste
       celui d'un satellite afin de ne pas prétendre que Forge = Minerais. */
    { id:'mk_minerai', label:'Clé Raid Minerais', short:'Clé Minerais', raid:'minerai', angle:54,
      mastery:['n1_01','n1_02','n2_01','n2_02'] },
    /* PE possède moins de familles réelles que les autres spécialisations. On
       utilise donc ses trois occurrences réelles I-II-III plutôt que d'imposer
       un satellite Recherche qui rendrait cette route artificiellement obligatoire. */
    { id:'mk_pe', label:'Clé Raid PE', short:'Clé PE', raid:'evolution', angle:126,
      mastery:['n1_30','n2_30','n3_30'] },
    { id:'mk_competence', label:'Clé Raid Compétence', short:'Clé Compétence', raid:'competence', angle:198,
      mastery:['n1_09','n1_12','n2_09','n2_12'] }
  ];

  TREE_NODES.forEach(function(n){
    if (n.effect === 'raidKey' && /^sp_key/.test(n.id)) {
      n.deprecatedKey = true;
      n.req = ['__mastery_keys_replaced__'];
      n.note = 'Ancienne clé conservée pour compatibilité de sauvegarde.';
    }
  });

  function addMasteryKey(k){
    if (TREE_BY_ID[k.id]) return;
    var n = {
      id:k.id, sect:'Maîtrise', label:k.label, short:k.short, icon:'key', color:KEY_COLOR,
      tier:3, effect:'typedRaidKey', per:1, unit:'', max:1, times:[KEY_BASE_SECONDS],
      req:k.mastery.slice(), special:true, masteryKey:true, raidTarget:k.raid,
      masteryReq:k.mastery.slice(), note:'Tous les nœuds indiqués doivent être au niveau 2/5. Recherche de base : 7 jours.'
    };
    n.cost = Math.max(1, Math.round(PE_TIER_COST[2] * PE_FIRST_MUL));
    TREE_NODES.push(n);
    TREE_BY_ID[n.id] = n;
  }
  KEY_DEFS.forEach(addMasteryKey);

  var oldTreeReqOk = treeReqOk;
  treeReqOk = function(s,node){
    if (node && node.deprecatedKey) return false;
    if (node && node.bridgeAny) {
      return (node.req || []).some(function(id){ return treeLv(s,id) >= 1; });
    }
    return oldTreeReqOk(s,node);
  };

  var oldApplyTreeLevel = applyTreeLevel;
  applyTreeLevel = function(st,node){
    if (!node || !node.masteryKey) return oldApplyTreeLevel(st,node);
    st.tree.levels[node.id] = Math.min(1,(st.tree.levels[node.id] || 0) + 1);
    st.raidKeyAlloc = st.raidKeyAlloc || {};
    st.raidKeyAlloc[node.raidTarget] = (st.raidKeyAlloc[node.raidTarget] || 0) + 1;
  };

  function placementOf(n){
    var e=n.effect||'';
    if(n.masteryKey) return 'key';
    if(e==='petDmg'||e==='petHp') return 'familier';
    if(e==='eggFree'||e==='eggSlot'||e.indexOf('hatch_')===0) return 'eggs';
    if(e==='goldAll'||e==='afkGain') return 'or';
    if(e==='afkTime') return 'autonomie';
    if(e==='forgeTime'||e==='forgeCost'||e==='forgeFree'||e==='forgeMult') return 'forge';
    if(e==='peRaid') return 'pe';
    if(e==='research'||e==='techCost') return 'research';
    if(e==='skillDmg'||e==='skillFree'||e==='skillCost'||e==='passDmg'||e==='passHp') return 'competence';
    if(e.indexOf('eq_')===0) return 'equipment';
    return 'autonomie';
  }

  var visible=TREE_NODES.filter(function(n){return !n.deprecatedKey&&!n.masteryKey;});
  var routeNames=['familier','eggs','or','autonomie','forge','pe','research','competence','equipment'];
  var groups={};
  routeNames.forEach(function(f){groups[f]={1:[],2:[],3:[],4:[]};});
  visible.forEach(function(n){groups[placementOf(n)][n.tier].push(n);});

  routeNames.forEach(function(f){
    var g=groups[f];
    [1,2,3,4].forEach(function(t){
      var arr=g[t];
      arr.sort(function(a,b){return (a.row-b.row)||(a.lane-b.lane)||a.id.localeCompare(b.id);});
      if(!arr.length) return;
      var prev=(g[t-1]||[]);
      arr.forEach(function(n,i){
        n.bridgeAny=false;
        if(t===1 && i<Math.min(2,arr.length)) n.req=[];
        else if(i<2 && prev.length) n.req=[prev[Math.min(i,prev.length-1)].id];
        else {
          var parentIndex=(i%2===0)?0:1;
          parentIndex=Math.min(parentIndex,Math.max(0,i-1));
          n.req=[arr[parentIndex].id];
        }
      });
    });
  });

  function bridge(a,b){
    var n=TREE_BY_ID[b];
    if(!TREE_BY_ID[a]||!n) return;
    if(n.req.indexOf(a)<0)n.req.push(a);
    n.bridgeAny=true;
  }
  bridge('n1_28','n1_13');
  bridge('n1_04','n1_06');
  bridge('n1_30','n1_12');
  bridge('n1_01','n1_15');
  bridge('n1_15','n1_09');
  bridge('n1_07','n1_01');
  bridge('n2_28','n2_13');
  bridge('n2_04','n2_30');
  bridge('n2_01','n2_15');
  bridge('n2_15','n2_09');
})();
