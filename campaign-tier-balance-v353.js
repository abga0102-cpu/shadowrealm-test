/* SHADOWREACH V353 · smooth late-Looser balance + floor-based campaign ranks
   - Monster growth is softened progressively from old Facile 4-1 (floor 61) to floor 100.
   - The old abrupt cut at 5-2 is removed: each normal floor remains stronger than the previous one.
   - Campaign ranks by real floor:
     Looser 1-25, Débutant 26-49, Aventurier 50-99, Prodige 100-249,
     Héros 250-499, Légende 500-699, Divin 700+.
*/
(function(){
  'use strict';
  if(window.__srCampaignTierBalanceV353)return;
  window.__srCampaignTierBalanceV353=true;

  var SMOOTH_START=61;  /* ancien 4-1 */
  var SMOOTH_END=100;
  var END_MUL=0.85;

  function clamp01(v){return Math.max(0,Math.min(1,Number(v)||0));}
  function lerp(a,b,t){return a+(b-a)*clamp01(t);}
  function smoothMul(floor){
    if(floor<=SMOOTH_START)return 1;
    if(floor>=SMOOTH_END)return END_MUL;
    return lerp(1,END_MUL,(floor-SMOOTH_START)/(SMOOTH_END-SMOOTH_START));
  }

  /* V334 already softened 76..100. Undo that older taper first, then apply
     one continuous V353 curve from 61 to 100 so no two nerfs stack. */
  function oldLateEasyHpMul(floor,isBoss){
    if(floor<76||floor>100)return 1;
    var t=(floor-76)/(100-76);
    return isBoss?lerp(0.70,0.35,t):lerp(0.90,0.52,t);
  }
  function oldLateEasyDamageMul(floor){
    if(floor<76||floor>100)return 1;
    return lerp(0.98,0.30,(floor-76)/(100-76));
  }

  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignTierBalanceV353){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!enemy)return enemy;
        var floor=Math.max(1,Math.floor(Number(opts.floor)||1));
        if(floor<SMOOTH_START||floor>SMOOTH_END)return enemy;

        var target=smoothMul(floor);
        var undoHp=oldLateEasyHpMul(floor,!!opts.boss);
        var undoDmg=oldLateEasyDamageMul(floor);
        var hpCorrection=target/Math.max(0.0001,undoHp);
        var dmgCorrection=target/Math.max(0.0001,undoDmg);

        enemy.maxHP=Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1)*hpCorrection));
        enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||enemy.maxHP||1)*hpCorrection)));
        enemy.dmg=Math.max(1,Math.floor(Number(enemy.dmg||1)*dmgCorrection));
        enemy.__srSmoothLooserV353={targetMul:target,hpCorrection:hpCorrection,dmgCorrection:dmgCorrection};
        return enemy;
      };
      makeEnemy.__srCampaignTierBalanceV353=true;
    }
  }catch(_){ }

  var TIERS=[
    {min:1,max:25,name:'Looser'},
    {min:26,max:49,name:'Débutant'},
    {min:50,max:99,name:'Aventurier'},
    {min:100,max:249,name:'Prodige'},
    {min:250,max:499,name:'Héros'},
    {min:500,max:699,name:'Légende'},
    {min:700,max:Infinity,name:'Divin'}
  ];

  function tierForFloor(floor){
    floor=Math.max(1,Math.floor(Number(floor)||1));
    for(var i=0;i<TIERS.length;i++){
      if(floor>=TIERS[i].min&&floor<=TIERS[i].max)return TIERS[i].name;
    }
    return 'Divin';
  }
  window.__srCampaignTierForFloor=tierForFloor;
  window.__srCampaignFloorLabel=function(floor){return tierForFloor(floor)+' · Étage '+Math.max(1,Math.floor(Number(floor)||1));};

  /* The combat renderer rewrites #aLabel itself. Keep its real text untouched
     and add the rank visually with CSS, avoiding a render/observer tug-of-war. */
  function ensureStyle(){
    if(document.getElementById('srCampaignRankV353Style'))return;
    var style=document.createElement('style');
    style.id='srCampaignRankV353Style';
    style.textContent='#aLabel[data-sr-rank]::before{content:attr(data-sr-rank) " · ";}';
    document.head.appendChild(style);
  }

  function floorFromLabel(label){
    var m=String(label&&label.textContent||'').match(/[ÉE]tage\s+([\d\s ]+)/i);
    return m?Number(m[1].replace(/[\s ]/g,''))||0:0;
  }

  function syncArenaRank(){
    try{
      var label=document.getElementById('aLabel');
      if(!label)return;
      var floor=0;
      try{
        if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign')floor=Number(combat.floor)||0;
      }catch(_){ }
      if(!floor)floor=floorFromLabel(label);
      if(floor>0)label.setAttribute('data-sr-rank',tierForFloor(floor));
      else label.removeAttribute('data-sr-rank');
    }catch(_){ }
  }

  function relabelStaticText(root){
    try{
      root=root||document.body;
      if(!root)return;
      var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
      var node;
      while((node=walker.nextNode())){
        var parent=node.parentNode;
        if(!parent||/^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.nodeName||''))continue;
        if(parent.id==='aLabel')continue;
        var value=String(node.nodeValue||'');
        var m=value.match(/^\s*[ÉE]tage\s+(\d+)\s*$/i);
        if(m){
          var floor=Number(m[1]);
          node.nodeValue=tierForFloor(floor)+' · Étage '+floor;
        }
      }
    }catch(_){ }
  }

  function installRankUI(){
    ensureStyle();
    relabelStaticText(document.body);
    syncArenaRank();
    try{
      var pending=false;
      var observer=new MutationObserver(function(){
        if(pending)return;
        pending=true;
        requestAnimationFrame(function(){
          pending=false;
          relabelStaticText(document.body);
          syncArenaRank();
        });
      });
      observer.observe(document.body,{subtree:true,childList:true,characterData:true});
      window.__srCampaignTierObserverV353=observer;
    }catch(_){ }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installRankUI,{once:true});
  else installRankUI();

  window.__srCampaignTierBalanceConfigV353={
    smoothStartFloor:SMOOTH_START,
    smoothStartLegacyStage:'ancien 4-1',
    smoothEndFloor:SMOOTH_END,
    endMultiplier:END_MUL,
    tiers:TIERS
  };
})();
