/* SHADOWREACH · Arbre personnel radial v85
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
  var KEY_BY_ID = {};
  KEY_DEFS.forEach(function(k){ KEY_BY_ID[k.id] = k; });

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
    if (node && node.masteryKey) {
      return (node.masteryReq || []).every(function(id){ return treeLv(s,id) >= 2; });
    }
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

  var ANGLE={familier:-90,eggs:-126,or:-18,autonomie:-48,forge:30,pe:126,research:162,competence:198,equipment:234};
  var SECTOR_LABEL={familier:'FAMILIER',or:'OR',forge:'MINERAIS',pe:'PE',competence:'COMPÉTENCE'};
  var SECTOR_COLOR={familier:'#F5C542',or:'#E8B44A',forge:'#8FC4FF',pe:'#57E07A',competence:'#B15CF6'};
  var SAT_COLOR={eggs:'#8FEFF4',autonomie:'#6FA8DC',research:'#3FCFD6',equipment:'#FF7A5C'};

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

  function escSvg(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function pol(cx,cy,r,deg){var a=deg*Math.PI/180;return{x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r};}
  function routeColor(route){return SECTOR_COLOR[route]||SAT_COLOR[route]||'#7B8FB8';}
  function nodePos(n,idx,count){
    var route=placementOf(n),base=ANGLE[route]||-90;
    var ring=[0,190,330,470,610][Math.max(1,Math.min(4,n.tier))];
    var spread=Math.min(route==='equipment'||route==='eggs'?24:34,Math.max(10,count*3));
    var off=count<=1?0:(idx-(count-1)/2)*(spread/Math.max(1,count-1));
    return pol(700,700,ring,base+off);
  }
  function keyProgress(s,k){
    var done=k.mastery.filter(function(id){return treeLv(s,id)>=2;}).length;
    return done+'/'+k.mastery.length;
  }

  treeGraph=function(active,remain){
    var W=1400,H=1400,cx=700,cy=700,rings='';
    [190,330,470,610].forEach(function(r,i){
      var c=PALIER_BAND[i].c;
      rings+='<circle cx="700" cy="700" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="2" opacity=".24"/>'+
        '<text x="700" y="'+(700-r+18)+'" text-anchor="middle" fill="'+c+'" font-size="15" font-weight="900" opacity=".9">PALIER '+(i+1)+'</text>';
    });
    var sectors='';
    ['familier','or','forge','pe','competence'].forEach(function(f){
      var p=pol(cx,cy,680,ANGLE[f]);
      sectors+='<text x="'+p.x.toFixed(1)+'" y="'+p.y.toFixed(1)+'" text-anchor="middle" fill="'+SECTOR_COLOR[f]+'" font-size="22" font-weight="900" letter-spacing="1.4">'+SECTOR_LABEL[f]+'</text>';
    });
    [['eggs','ŒUFS'],['research','RECHERCHE'],['equipment','ÉQUIPEMENT'],['autonomie','AUTONOMIE']].forEach(function(x){
      var p=pol(cx,cy,665,ANGLE[x[0]]);
      sectors+='<text x="'+p.x.toFixed(1)+'" y="'+p.y.toFixed(1)+'" text-anchor="middle" fill="'+SAT_COLOR[x[0]]+'" font-size="12" font-weight="800" opacity=".85">'+x[1]+'</text>';
    });

    var pos={};
    routeNames.forEach(function(f){[1,2,3,4].forEach(function(t){
      var arr=groups[f][t];
      arr.forEach(function(n,i){pos[n.id]=nodePos(n,i,arr.length);n.x=pos[n.id].x;n.y=pos[n.id].y;});
    });});
    KEY_DEFS.forEach(function(k){var p=pol(cx,cy,400,k.angle);pos[k.id]=p;TREE_BY_ID[k.id].x=p.x;TREE_BY_ID[k.id].y=p.y;});

    var links='';
    TREE_NODES.forEach(function(n){
      if(n.deprecatedKey||!pos[n.id])return;
      (n.masteryKey?n.masteryReq:n.req||[]).forEach(function(rid){
        var q=pos[rid];if(!q)return;
        var lit=n.masteryKey?treeLv(S,rid)>=2:treeLv(S,rid)>=1;
        var col=n.masteryKey?KEY_COLOR:routeColor(placementOf(n));
        links+='<line x1="'+q.x.toFixed(1)+'" y1="'+q.y.toFixed(1)+'" x2="'+pos[n.id].x.toFixed(1)+'" y2="'+pos[n.id].y.toFixed(1)+'" stroke="'+(lit?col:'#26344F')+'" stroke-width="'+(lit?3:1.4)+'" opacity="'+(lit?.75:.35)+'"/>';
      });
    });

    var nodes='';
    TREE_NODES.forEach(function(n){
      if(n.deprecatedKey||!pos[n.id])return;
      var p=pos[n.id],lv=treeLv(S,n.id),ok=treeReqOk(S,n),max=lv>=n.max,busy=active===n.id;
      var route=n.masteryKey?'key':placementOf(n),col=n.masteryKey?KEY_COLOR:routeColor(route),r=n.masteryKey?31:22;
      var fill=max?'#14341F':busy?'#3A2D10':ok?'#101B2B':'#0A101B';
      var stroke=max?'#57E07A':busy?'#E8B44A':ok?col:'#344665';
      var sub=n.masteryKey?(lv?'OBTENUE':keyProgress(S,KEY_BY_ID[n.id])):(lv+'/'+n.max);
      nodes+='<g data-act="treeNode" data-arg="'+n.id+'" style="cursor:pointer">'+
        (ok&&!max?'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(r+8)+'" fill="'+stroke+'" opacity=".10"/>':'')+
        '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="3"/>'+
        '<text x="'+p.x+'" y="'+(p.y+5)+'" text-anchor="middle" font-size="'+(n.masteryKey?22:15)+'" fill="'+stroke+'" font-weight="900">'+(n.masteryKey?'🔑':escSvg(n.icon==='paw'?'🐾':n.icon==='gold'?'●':'◆'))+'</text>'+
        '<text x="'+p.x+'" y="'+(p.y+r+15)+'" text-anchor="middle" font-size="10.5" fill="#DDE7FA" font-weight="800">'+escSvg(n.short||n.label)+'</text>'+
        '<text x="'+p.x+'" y="'+(p.y+r+29)+'" text-anchor="middle" font-size="9.5" fill="'+stroke+'" font-weight="900">'+escSvg(busy?fmtTime(remain):sub)+'</text></g>';
    });

    var center='<circle cx="700" cy="700" r="76" fill="#0A1220" stroke="#8FEFF4" stroke-width="4"/>'+
      '<circle cx="700" cy="700" r="58" fill="#101D32" stroke="#3FCFD6" stroke-width="2" opacity=".95"/>'+
      '<text x="700" y="695" text-anchor="middle" fill="#EAF7FF" font-size="20" font-weight="900">NOYAU</text>'+
      '<text x="700" y="718" text-anchor="middle" fill="#8FEFF4" font-size="11" font-weight="800">CHOISIS TON CHEMIN</text>';
    return '<svg class="srRadialTree" viewBox="0 0 '+W+' '+H+'" width="1100" height="1100" style="display:block;max-width:none;margin:0 auto;touch-action:pan-x pan-y">'+
      '<defs><radialGradient id="srTreeBg"><stop offset="0" stop-color="#101C30"/><stop offset="1" stop-color="#050811"/></radialGradient></defs>'+
      '<rect width="1400" height="1400" rx="42" fill="url(#srTreeBg)"/>'+rings+sectors+links+nodes+center+'</svg>';
  };

  var style=document.createElement('style');
  style.textContent='.srRadialTree{min-width:1100px}.treeGraphWrap,.treeScroll,.treeCanvas{overflow:auto!important;-webkit-overflow-scrolling:touch}.srRadialTree text{font-family:Segoe UI,Roboto,sans-serif;pointer-events:none}';
  document.head.appendChild(style);
})();
