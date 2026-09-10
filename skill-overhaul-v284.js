/* SHADOWREACH V284 · Intrinsic skill progression
   Skills use their own fixed power, duplicate gauge and +5%/level growth.
   Existing cooldowns are preserved. Kameha is the new Artefact MULTI skill. */
(function(){'use strict';if(window.__srSkillOverhaulV284)return;window.__srSkillOverhaulV284=true;
var BASE={taillade:2000,frappe:10000,percee:50000,meteore:5000000,kameha:50000000,execution:250000000,cataclysme:1000000000};
var RAR={COMMUN:2000,RARE:10000,EPIQUE:50000,MYTHIQUE:5000000,ARTEFACT:50000000,LEGENDAIRE:250000000,DIVIN:1000000000};
function stars(){try{return Number(starsOf(S,'skill'))||0;}catch(_){return 0;}}
function starMulSkill(){var s=stars();return s<=0?1:s===1?1.5:1.5*Math.pow(1.35,s-1);}
function growth(level){return 1+Math.max(0,(Number(level)||1)-1)*.05;}
function baseFor(def){return BASE[def&&def.id]||RAR[def&&def.rarity]||2000;}
window.__srV284SkillDamage=function(def,level){return Math.floor(baseFor(def)*growth(level)*starMulSkill());};
window.__srV284DupesNeeded=function(level){level=Math.max(1,Math.floor(Number(level)||1));if(level===1)return 2;if(level===2)return 4;if(level===3)return 6;if(level===4)return 8;return 10;};
try{if(typeof skillDupesNeeded==='function')skillDupesNeeded=window.__srV284DupesNeeded;}catch(_){ }
/* Keep the old function callable for UI/support code, but its argument is now intrinsic base power. */
try{if(typeof skillDamageMult==='function')skillDamageMult=function(base,level){return (Number(base)||0)*growth(level)*starMulSkill();};}catch(_){ }
/* Extend rarity registries without changing existing cooldowns. */
try{if(typeof RARITY_ORDER!=='undefined'&&RARITY_ORDER.indexOf('ARTEFACT')<0){var li=RARITY_ORDER.indexOf('LEGENDAIRE');RARITY_ORDER.splice(li<0?RARITY_ORDER.length:li,0,'ARTEFACT');}}catch(_){ }
try{if(typeof SKILL_RARITY_MUL!=='undefined')SKILL_RARITY_MUL.ARTEFACT=1;}catch(_){ }
try{if(typeof SKILL_DEFS!=='undefined'&&!SKILL_DEFS.some(function(d){return d.id==='kameha';})){
 var k={id:'kameha',name:'Kameha',cat:'ATTAQUE',type:'MULTI',rarity:'ARTEFACT',cd:10,mult:1,color:'#43C98B',icon:'sparkle',fx:'bolt',desc:'Une décharge concentrée qui frappe jusqu’à 3 ennemis.'};
 var pos=SKILL_DEFS.findIndex(function(d){return d.id==='execution';});SKILL_DEFS.splice(pos<0?SKILL_DEFS.length:pos,0,k);
 try{SKILL_BY_ID.kameha=k;(SKILLS_BY_RARITY.ARTEFACT=SKILLS_BY_RARITY.ARTEFACT||[]).push(k);}catch(_){ }
}}catch(_){ }
/* Skill rate authority. Legendary remains locked before Skill 1★. Divine remains advanced progression. */
var A={0:{COMMUN:100,RARE:0,EPIQUE:0,MYTHIQUE:0,ARTEFACT:0,LEGENDAIRE:0,DIVIN:0},10:{COMMUN:65,RARE:27,EPIQUE:8,MYTHIQUE:0,ARTEFACT:0,LEGENDAIRE:0,DIVIN:0},20:{COMMUN:45,RARE:30,EPIQUE:20,MYTHIQUE:5,ARTEFACT:0,LEGENDAIRE:0,DIVIN:0},30:{COMMUN:35,RARE:27,EPIQUE:24,MYTHIQUE:12,ARTEFACT:2,LEGENDAIRE:0,DIVIN:0},40:{COMMUN:30,RARE:25,EPIQUE:24,MYTHIQUE:16,ARTEFACT:5,LEGENDAIRE:0,DIVIN:0},50:{COMMUN:27,RARE:25,EPIQUE:23,MYTHIQUE:18,ARTEFACT:7,LEGENDAIRE:0,DIVIN:0}};
function interp(m){m=Math.max(0,Math.min(50,Number(m)||0));var ks=[0,10,20,30,40,50],lo=0,hi=0;for(var i=1;i<ks.length;i++){if(m<=ks[i]){lo=ks[i-1];hi=ks[i];break;}}if(m===0){lo=hi=0;}var t=hi===lo?0:(m-lo)/(hi-lo),o={};Object.keys(A[lo]).forEach(function(r){o[r]=A[lo][r]+(A[hi][r]-A[lo][r])*t;});if(stars()>=1&&m>=50){o={COMMUN:25,RARE:23,EPIQUE:22,MYTHIQUE:18,ARTEFACT:7,LEGENDAIRE:5,DIVIN:0};}return o;}
try{if(typeof getRates==='function'&&!getRates.__srV284){var oldRates=getRates;getRates=function(system,m,a,s){if(system==='skill')return interp(m);return oldRates(system,m,a,s);};getRates.__srV284=true;}}catch(_){ }
window.__srSkillOverhaulConfigV284={base:BASE,rarityBase:RAR,rates:A,kameha:{targets:3,cooldown:10}};
})();