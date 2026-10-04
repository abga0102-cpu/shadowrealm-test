/* SHADOWREACH V495 · Comparateur Forge contextuel
   Couche UI uniquement. Les métriques sont dérivées d'un essai complet du build
   avec remplacement temporaire de la pièce, sans muter S, le combat ou la sauvegarde. */
(function(){
'use strict';
if(window.__srForgeContextComparatorV495)return;
window.__srForgeContextComparatorV495=true;
if(typeof showForgeResult!=='function'||typeof computePower!=='function')return;

var nativeShowForgeResult=showForgeResult;
function num(v){v=Number(v);return Number.isFinite(v)?v:0;}
function cloneStateWithItem(it){
 var eq=Object.assign({},S.equipped||{});eq[it.slot]=it;
 return Object.assign({},S,{equipped:eq});
}
function derived(s){
 try{return typeof computeDerived==='function'?computeDerived(s):null;}catch(_){return null;}
}
function firstNumber(o,keys){
 if(!o)return null;
 for(var i=0;i<keys.length;i++){var v=Number(o[keys[i]]);if(Number.isFinite(v))return v;}
 return null;
}
function equipmentFallback(s,kind){
 var total=0;
 Object.values((s&&s.equipped)||{}).forEach(function(it){
  if(!it)return;
  if(kind==='offense')total+=num(it.damage!=null?it.damage:it.baseDamage);
  else total+=num(it.hp!=null?it.hp:it.baseHp);
 });
 return total;
}
function buildMetrics(s){
 var d=derived(s);
 var off=firstNumber(d,['damage','dmg','attack','atk','heroDamage','totalDamage']);
 var surv=firstNumber(d,['maxHP','hp','health','heroMaxHP','totalHp']);
 if(off==null)off=equipmentFallback(s,'offense');
 if(surv==null)surv=equipmentFallback(s,'survival');
 return {power:Math.round(num(computePower(s))),offense:off,survival:surv};
}
function metrics(it){
 var cur=(S.equipped||{})[it.slot]||null,equippedNow=cur&&cur.id===it.id;
 if(equippedNow)return {equippedNow:true,power:0,offense:0,survival:0};
 var before=buildMetrics(S),after=buildMetrics(cloneStateWithItem(it));
 return {equippedNow:false,power:after.power-before.power,offense:after.offense-before.offense,survival:after.survival-before.survival};
}
function verdict(m){
 if(m.equippedNow)return {text:'Équipé actuellement',tone:'var(--textMute)'};
 if(m.power>0&&m.offense>=0&&m.survival>=0)return {text:'Amélioration nette',tone:'var(--greenLit)'};
 if(m.power<0&&m.offense<=0&&m.survival<=0)return {text:'Moins performant globalement',tone:'var(--redLit)'};
 if(m.offense>0&&m.survival<0)return {text:'Plus offensif, moins résistant',tone:'#F3C969'};
 if(m.survival>0&&m.offense<0)return {text:'Plus résistant, moins offensif',tone:'#F3C969'};
 if(m.power>0)return {text:'Gain global malgré un compromis',tone:'var(--greenLit)'};
 if(m.power<0)return {text:'Perte globale malgré un avantage',tone:'#F3C969'};
 return {text:'Impact global neutre',tone:'var(--textMute)'};
}
function signed(v){v=Math.round(num(v));return (v>0?'+':'')+(typeof fmt==='function'?fmt(v):String(v));}
function metric(label,value){var c=value>0?'var(--greenLit)':value<0?'var(--redLit)':'var(--textMute)';return '<div class="tiny b" style="color:'+c+'">'+label+' · '+signed(value)+'</div>';}
function panel(it){var m=metrics(it),v=verdict(m);return '<div class="sr-v495-compare tiny" style="margin-top:7px;padding:7px 8px;border-radius:9px;background:#070C15;border:1px solid #1E2B43"><div class="between gap6"><b>IMPACT SI ÉQUIPÉ</b><b style="color:'+v.tone+'">'+v.text+'</b></div><div class="col gap3 mt6">'+metric('PUISSANCE GLOBALE',m.power)+metric('OFFENSE',m.offense)+metric('SURVIE',m.survival)+'</div></div>';}
function inject(){
 var root=document.querySelector('.modal,.modalBox,[role="dialog"]')||document.body;
 root.querySelectorAll('.card.rf').forEach(function(card){
  if(card.querySelector('.sr-v495-compare'))return;
  var title=card.textContent||'',candidates=(S.inventory||[]).concat(Object.values(S.equipped||{}));
  var it=candidates.find(function(x){return x&&title.indexOf((RARITY[x.rarity]&&RARITY[x.rarity].label)||'§§§')>=0&&title.indexOf(SLOT_LABEL[x.slot]||x.slot)>=0;});
  if(!it)return;
  var actions=card.querySelector('.row.gap6.mt8');if(actions)actions.insertAdjacentHTML('beforebegin',panel(it));else card.insertAdjacentHTML('beforeend',panel(it));
 });
}
showForgeResult=function(){var r=nativeShowForgeResult.apply(this,arguments);try{inject();}catch(e){console.warn('[V495] comparator UI',e);}return r;};
window.__srForgeContextComparatorV495={version:495,uiOnly:true,fullBuildTrial:true,combatFormulaChanged:false,saveChanged:false};
})();