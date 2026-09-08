/* SHADOWREACH · Forge comparison authority v146
   Additive final presentation authority loaded after v145.
   Keeps every previous Forge file in place, but future Forge results are handled here.
   One visible candidate per equipment slot, dynamic re-ranking after equip, clearer
   upgrade labels, icon + affixes for worn gear, and defensive affix formatting.
   No drop rates, filters, recycling, inventory ownership, equipment persistence or economy are changed. */
(function(){
'use strict';
if(window.__srForgeComparisonAuthorityV146)return;
window.__srForgeComparisonAuthorityV146=true;
if(typeof showForgeResult!=='function'||typeof equipItem!=='function')return;

var ROOT='srForgeArenaPreview146';
var pending={};
var current=null;

function byId(id){
 var eq=Object.values((typeof S!=='undefined'&&S.equipped)||{}).find(function(x){return x&&x.id===id;});
 return eq||(((typeof S!=='undefined'&&S.inventory)||[]).find(function(x){return x&&x.id===id;}))||null;
}
function rarity(it){return (typeof RARITY!=='undefined'&&RARITY[it.rarity])||{c:'#9FB0C8',label:it.rarity||''};}
function slotName(it){return (typeof SLOT_LABEL!=='undefined'&&SLOT_LABEL[it.slot])||it.slot||'Équipement';}
function primary(it){
 if(!it)return 0;
 try{if(typeof MASTERY_STAT!=='undefined'&&MASTERY_STAT[it.slot]==='dmg')return Number(it.baseDamage!=null?it.baseDamage:(it.damage||0));}catch(_){}
 return Number(it.baseHp!=null?it.baseHp:(it.hp||0));
}
function primaryLabel(it){try{return typeof MASTERY_STAT!=='undefined'&&MASTERY_STAT[it.slot]==='dmg'?'ATQ':'PV';}catch(_){return 'STAT';}}
function powerDelta(it){
 if(!it||!it.slot||typeof computePower!=='function')return 0;
 try{
  var before=Number(S.power||computePower(S)||0),eq=Object.assign({},S.equipped||{});eq[it.slot]=it;
  return Math.round(computePower(Object.assign({},S,{equipped:eq}))-before);
 }catch(_){return 0;}
}
function score(it){
 if(!it)return -Infinity;
 var p=powerDelta(it),r=0;
 try{r=typeof equipRank==='function'?equipRank(it.rarity):0;}catch(_){}
 return p*100000+r*1000+primary(it);
}
function fmt2(v){return typeof fmt==='function'?fmt(v):String(v);}
function signed(v){v=Math.round(Number(v)||0);return(v>0?'+':'')+fmt2(v);}
function esc2(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'})[c];});}
function iconHtml(it,size){if(!it)return '';try{if(typeof slotIcon==='function')return slotIcon(it.slot,size||22,it);}catch(_){}return '⚔';}
function upgradeText(it){var lv=Math.max(0,Number(it&&it.level)||0);return lv===0?'Non amélioré':'+'+lv+' amélioration'+(lv>1?'s':'');}
function affixValue(a,def){
 try{if(typeof formatAffixValue==='function')return formatAffixValue(a,def);}catch(_){}
 if(a&&a.display!=null)return String(a.display);
 var n=Number(a&&a.value);if(!Number.isFinite(n))return String((a&&a.value)||'');
 var sign=n>0?'+':n<0?'':'+';
 if(def&&def.negative)sign='-';
 if(def&&def.unit)return sign+Math.abs(n)+String(def.unit);
 return sign+Math.abs(n)+'%';
}
function affixChip(a){
 var def=(typeof AFFIX_BY_KEY!=='undefined'&&AFFIX_BY_KEY[a.key])||null;
 var label=def&&def.label?def.label:a.key;
 return '<span style="font-size:8px;font-weight:800;padding:2px 5px;border:1px solid #34445f;border-radius:999px;color:#c9d4e6;background:#0b1220;white-space:nowrap">'+esc2(label)+' '+esc2(affixValue(a,def))+'</span>';
}
function affixHtml(it){
 var list=(it&&Array.isArray(it.affixes)?it.affixes:[]).slice(0,3);
 if(!list.length)return '<span style="font-size:8px;color:#65758d">Aucun bonus</span>';
 return '<div style="display:flex;gap:4px;flex-wrap:wrap">'+list.map(affixChip).join('')+'</div>';
}
function weaponHtml(it){
 if(!it||it.slot!=='arme'||!it.weaponType)return '';
 try{var wt=(typeof WEAPON_TYPES!=='undefined'&&WEAPON_TYPES[it.weaponType])||null;if(!wt)return '';return '<div style="font-size:9px;color:#8ea1bd;margin-top:4px">'+esc2(wt.name||it.weaponType)+' · '+esc2(wt.attackType==='MELEE'?'mêlée':'distance')+' · vitesse ×'+esc2(wt.speed||1)+'</div>';}catch(_){return '';}
}
function remove(){['srForgeArenaPreview142','srForgeArenaPreview143','srForgeArenaPreview145',ROOT].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});}
function position(root){
 var vw=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0),vh=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0),ar=null;
 try{if(typeof arenaEl!=='undefined'&&arenaEl&&arenaEl.getBoundingClientRect)ar=arenaEl.getBoundingClientRect();}catch(_){}
 var w=Math.min(vw-16,390);root.style.width=w+'px';root.style.left=Math.max(8,(vw-w)/2)+'px';root.style.transform='none';
 if(ar&&ar.height>60){var below=ar.bottom+6,needed=230;if(below+needed<vh-68){root.style.top=Math.max(8,below)+'px';root.style.bottom='auto';return;}root.style.top=Math.max(8,Math.min(vh-needed-72,ar.top+8))+'px';root.style.bottom='auto';return;}
 root.style.bottom='calc(env(safe-area-inset-bottom) + 76px)';root.style.top='auto';
}
function cleanPending(){Object.keys(pending).forEach(function(slot){var r=pending[slot],it=byId(r&&r.id);if(!it||it.slot!==slot)delete pending[slot];});}
function pendingCount(){cleanPending();return Object.keys(pending).length;}
function takeBest(){
 cleanPending();var slots=Object.keys(pending);if(!slots.length)return null;
 slots.sort(function(a,b){return score(byId(pending[b].id))-score(byId(pending[a].id));});
 var slot=slots[0],r=pending[slot];delete pending[slot];return r;
}
function next(){current=takeBest();if(!current){remove();return;}render();}
function clearAll(){pending={};current=null;remove();}
function ingest(r){
 var it=byId(r&&r.id);if(!it||!it.slot)return;
 if(current){var curIt=byId(current.id);if(curIt&&curIt.slot===it.slot){if(score(it)>score(curIt)){current=r;render();}return;}}
 var old=pending[it.slot],oldIt=old&&byId(old.id);if(!oldIt||score(it)>score(oldIt))pending[it.slot]=r;
}
function wornCard(cur,pd){
 if(!cur)return '<div style="padding:6px;border-radius:8px;background:#0b1220"><div style="font-size:8px;color:#8493aa;font-weight:900">PORTÉ</div><div style="font-size:10px;font-weight:900;color:#9dacbf;margin-top:4px">Aucun</div></div>';
 var cr=rarity(cur);
 return '<div style="padding:6px;border-radius:8px;background:#0b1220;min-width:0">'+
  '<div style="font-size:8px;color:#8493aa;font-weight:900">PORTÉ</div>'+
  '<div style="display:flex;gap:6px;align-items:center;margin-top:3px"><div style="width:30px;height:30px;flex:0 0 30px;border:1px solid '+cr.c+'88;border-radius:7px;display:flex;align-items:center;justify-content:center;background:#08101d">'+iconHtml(cur,20)+'</div>'+
  '<div style="min-width:0;flex:1"><div style="font-size:9px;font-weight:900;color:'+cr.c+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc2(cr.label)+' · '+primaryLabel(cur)+' '+fmt2(primary(cur))+'</div><div style="font-size:8px;font-weight:900;color:#f0c96a">'+esc2(upgradeText(cur))+'</div></div></div>'+
  '<div style="font-size:9px;font-weight:900;color:'+(pd>0?'#6ee7a0':pd<0?'#ff7474':'#9dacbf')+';margin-top:3px">Puissance '+signed(pd)+'</div>'+
  '<div style="font-size:8px;color:#8493aa;font-weight:900;margin:4px 0 3px">BONUS</div>'+affixHtml(cur)+'</div>';
}
function render(){
 remove();var it=byId(current&&current.id);if(!it){next();return;}
 var cur=(S.equipped||{})[it.slot]||null,worn=cur&&cur.id===it.id,nb=primary(it),cb=cur&&!worn?primary(cur):0,bd=cur&&!worn?Math.round(nb-cb):Math.round(nb),pd=worn?0:powerDelta(it),r=rarity(it),more=pendingCount();
 var root=document.createElement('div');root.id=ROOT;root.style.cssText='position:fixed;z-index:8800;pointer-events:auto;font-family:inherit;max-width:calc(100vw - 16px);';
 root.innerHTML='<div style="background:rgba(7,12,21,.97);border:1px solid '+r.c+'88;border-radius:13px;box-shadow:0 10px 30px #0009;padding:9px;overflow:hidden">'+
  '<div style="display:flex;align-items:center;gap:8px"><div style="width:38px;height:38px;flex:0 0 38px;border:1px solid '+r.c+'99;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#0b1220">'+iconHtml(it,24)+'</div><div style="min-width:0;flex:1"><div style="font-size:9px;font-weight:900;letter-spacing:.7px;color:'+r.c+'">FORGE · '+esc2(r.label).toUpperCase()+'</div><div style="font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc2(slotName(it))+'</div></div>'+(more?'<span style="font-size:9px;font-weight:900;padding:3px 6px;border:1px solid #40516d;border-radius:999px;color:#b8c5db">+'+more+'</span>':'')+'<button data-sr-fp146="closeAll" aria-label="Fermer toute la file" style="border:0;background:transparent;color:#9dacbf;font-size:21px;padding:2px 5px">×</button></div>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px"><div style="padding:6px;border-radius:8px;background:#0b1220"><div style="font-size:8px;color:#8493aa;font-weight:900">NOUVEAU</div><div style="font-size:11px;font-weight:900;color:'+r.c+'">'+primaryLabel(it)+' '+fmt2(nb)+'</div><div style="font-size:9px;font-weight:800;color:'+(bd>0?'#6ee7a0':bd<0?'#ff7474':'#9dacbf')+'">'+signed(bd)+' stat</div><div style="font-size:8px;color:#8493aa;font-weight:900;margin:5px 0 3px">BONUS</div>'+affixHtml(it)+'</div>'+wornCard(cur,pd)+'</div>'+weaponHtml(it)+
  '<div style="display:flex;gap:6px;margin-top:8px"><button data-sr-fp146="keep" style="flex:1;min-height:36px;border-radius:8px;border:1px solid #35445e;background:#111a2a;color:#c2cce0;font-weight:900">'+(more?'GARDER · SUIVANT':'GARDER')+'</button>'+(worn?'<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#6ee7a0;font-weight:900;font-size:11px">✓ ÉQUIPÉ</div>':'<button data-sr-fp146="equip" style="flex:1;min-height:36px;border-radius:8px;border:1px solid #3fb950;background:#173d26;color:#8ff0aa;font-weight:900">ÉQUIPER</button>')+'</div></div>';
 document.body.appendChild(root);position(root);
}

showForgeResult=function(res){
 res=Array.isArray(res)?res:[];
 var kept=res.filter(function(r){return r&&!r.recycled&&r.id&&byId(r.id);});
 var melted=res.filter(function(r){return r&&r.recycled;});
 if(!kept.length){var dust=melted.reduce(function(a,r){return a+(Number(r.dust)||0);},0);try{if(typeof toast==='function')toast(melted.length+' pièce'+(melted.length>1?'s':'')+' recyclée'+(melted.length>1?'s':'')+' · +'+fmt2(dust)+' poussière',true);}catch(_){}return;}
 kept.forEach(ingest);if(!current)next();else render();
};

document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest?e.target.closest('#'+ROOT+' [data-sr-fp146]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
 var a=b.getAttribute('data-sr-fp146');
 if(a==='equip'&&current){var it=byId(current.id);if(it){try{equipItem(it.id);}catch(_){}}current=null;next();}
 else if(a==='keep'){current=null;next();}
 else if(a==='closeAll')clearAll();
},true);
window.addEventListener('resize',function(){var r=document.getElementById(ROOT);if(r)position(r);});
})();