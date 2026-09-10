/* SHADOWREACH V297 · Skill semantics authority
   Additive QA authority for the three offensive skill semantics audited after V296.
   - Percee is explicitly a PERFORATION skill (single target, armour-piercing identity).
   - Cataclysme remains global AOE and therefore hits every living enemy.
   - Kameha remains MULTI with a hard design cap of 3 targets (V287 owns the hit replication).
   No save schema or numerical power curve is changed. */
(function(){'use strict';
if(window.__srSkillSemanticsV297)return;window.__srSkillSemanticsV297=true;
function byId(id){try{return (typeof SKILL_BY_ID!=='undefined'&&SKILL_BY_ID&&SKILL_BY_ID[id])||(typeof SKILL_DEFS!=='undefined'&&SKILL_DEFS.find(function(d){return d&&d.id===id;}))||null;}catch(_){return null;}}
try{
  var p=byId('percee');if(p){p.type='PERFORATION';p.desc="Un estoc qui traverse l'armure. Lourds dégâts sur une seule cible.";}
  var c=byId('cataclysme');if(c){c.type='AOE';c.cat='ULTIME';}
  var k=byId('kameha');if(k){k.type='MULTI';k.cd=10;}
}catch(_){ }
try{
  if(window.__srSkillOverhaulConfigV284&&window.__srSkillOverhaulConfigV284.kameha){window.__srSkillOverhaulConfigV284.kameha.targets=3;window.__srSkillOverhaulConfigV284.kameha.cooldown=10;}
  if(window.__srProgressionQAConfigV287)window.__srProgressionQAConfigV287.kamehaTargets=3;
}catch(_){ }
try{if(typeof S!=='undefined'&&S){S.skillSemanticsVersion=297;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srSkillSemanticsConfigV297={percee:{type:'PERFORATION',targets:1},cataclysme:{type:'AOE',targets:'ALL'},kameha:{type:'MULTI',targets:3,cooldown:10}};
})();