/* SHADOWREACH V353 · Campaign rank ladder + smooth late-Looser balance
   - Smooths monster growth from floor 61 (old 4-1) through floor 100.
   - Removes the abrupt V352 floor-82 cut: every base floor keeps growing.
   - Campaign ranks by real floor:
     1-25 Looser, 26-49 Débutant, 50-99 Aventurier, 100-249 Prodige,
     250-499 Héros, 500-699 Légende, 700+ Divin. */
(function(){
  'use strict';
  if(window.__srCampaignTierBalanceV353)return;
  window.__srCampaignTierBalanceV353=true;

  var SMOOTH_START=61;
  var SMOOTH_END=100;

  function clamp01(v){return Math.max(0,Math.min(1,Number(v)||0));}
  function lerp(a,b,t){return a+(b-a)*clamp01(t);}
  function smoothT(floor){return clamp01((Number(floor)-SMOOTH_START)/(SMOOTH_END-SMOOTH_START));}
  function smoothHpMul(floor,isBoss){
    var t=smoothT(floor);
    return isBoss?lerp(1,0.45,t):lerp(1,0.52,t);
  }
  function smoothDamageMul(floor){return lerp(1,0.60,smoothT(floor));}

  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignTierBalanceV353){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!enemy)return enemy;
        var floor=Number(opts.floor)||0;
        if(floor<SMOOTH_START||floor>SMOOTH_END)return enemy;

        /* V334 already softened 76..100. Undo that curve first so this layer
           owns one continuous 61..100 progression instead of stacking nerfs. */
        var old=enemy.__srLateEasyBalanceV334;
        if(old){
          var oldHp=Math.max(0.000001,Number(old.hpMul)||1);
          var oldDmg=Math.max(0.000001,Number(old.dmgMul)||1);
          enemy.maxHP=Math.max(1,Math.round(Number(enemy.maxHP||enemy.hp||1)/oldHp));
          enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.round(Number(enemy.hp||enemy.maxHP||1)/oldHp)));
          enemy.dmg=Math.max(1,Math.round(Number(enemy.dmg||1)/oldDmg));
        }

        var hpMul=smoothHpMul(floor,!!opts.boss);
        var dmgMul=smoothDamageMul(floor);
        enemy.maxHP=Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1)*hpMul));
        enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||enemy.maxHP||1)*hpMul)));
        enemy.dmg=Math.max(1,Math.floor(Number(enemy.dmg||1)*dmgMul));
        enemy.__srSmoothLooserBalanceV353={hpMul:hpMul,dmgMul:dmgMul};
        return enemy;
      };
      makeEnemy.__srCampaignTierBalanceV353=true;
    }
  }catch(_){ }

  var RANKS=[
    {min:1,max:25,label:'Looser'},
    {min:26,max:49,label:'Débutant'},
    {min:50,max:99,label:'Aventurier'},
    {min:100,max:249,label:'Prodige'},
    {min:250,max:499,label:'Héros'},
    {min:500,max:699,label:'Légende'},
    {min:700,max:Infinity,label:'Divin'}
  ];

  function rankForFloor(floor){
    floor=Math.max(1,Math.floor(Number(floor)||1));
    for(var i=0;i<RANKS.length;i++){
      if(floor>=RANKS[i].min&&floor<=RANKS[i].max)return RANKS[i].label;
    }
    return 'Divin';
  }
  window.__srCampaignRankForFloor=rankForFloor;

  function installRankUI(){
    try{
      if(!document.getElementById('srCampaignRankV353Style')){
        var style=document.createElement('style');
        style.id='srCampaignRankV353Style';
        style.textContent='#aLabel[data-sr-rank]::before{content:attr(data-sr-rank) " · ";}';
        document.head.appendChild(style);
      }

      var pending=false;
      function sync(){
        pending=false;
        var label=document.getElementById('aLabel');
        if(!label)return;
        var floor=0;
        try{
          if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign')floor=Number(combat.floor)||0;
        }catch(_){ }
        if(!floor){
          var m=String(label.textContent||'').match(/Étage\s+([\d\s ]+)/i);
          if(m)floor=Number(m[1].replace(/[\s ]/g,''))||0;
        }
        if(floor>0)label.setAttribute('data-sr-rank',rankForFloor(floor));
        else label.removeAttribute('data-sr-rank');
      }

      var observer=new MutationObserver(function(){
        if(pending)return;
        pending=true;
        requestAnimationFrame(sync);
      });
      observer.observe(document.body,{subtree:true,childList:true,characterData:true});
      window.__srCampaignRankObserverV353=observer;
      sync();
    }catch(_){ }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installRankUI,{once:true});
  else installRankUI();

  window.__srCampaignTierBalanceConfigV353={
    smoothStartFloor:SMOOTH_START,
    smoothEndFloor:SMOOTH_END,
    normalHpMulEnd:0.52,
    bossHpMulEnd:0.45,
    damageMulEnd:0.60,
    ranks:RANKS
  };
})();
