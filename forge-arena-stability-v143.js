/* SHADOWREACH · Forge arena stability v143
   Final non-blocking Forge presentation layer.
   Keeps v142's concept, but makes the queue bounded, slot-aware and clearer.
   Drop rates, filters, recycling rules, inventory and equipment persistence are untouched. */
(function(){
'use strict';
if(window.__srForgeArenaStabilityV143)return;
window.__srForgeArenaStabilityV143=true;
if(typeof showForgeResult!=='function'||typeof equipItem!=='function')return;

var MAX_QUEUE=8;
var queue=[];
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
 var p=powerDelta(it),r=0;
 try{r=typeof equipRank==='function'?equipRank(it.rarity):0;}catch(_){}
 return p*100000+r*1000+primary(it);
}
function fmt2(v){return typeof fmt==='function'?fmt(v):String(v);}
function signed(v){v=Math.round(Number(v)||0);return(v>0?'+':'')+fmt2(v);}
function esc2(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}
function remove(){['srForgeArenaPreview142','srForgeArenaPreview143'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});}
function affixHtml(it){
 var list=(it&&Array.isArray(it.affixes)?it.affixes:[]).slice(0,3);
 if(!list.length)return '';
 return '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">'+list.map(function(a){
  var def=(typeof AFFIX_BY_KEY!=='undefined'&&AFFIX_BY_KEY[a.key])||null;
  var label=def&&def.label?def.label:a.key;
  var neg=!!(def&&def.negative),val=(neg?'-':'+')+a.value+'%';
  return '<span style="font-size:9px;font-weight:800;padding:3px 6px;border:1px solid #34445f;border-radius:999px;color:#c9d4e6;background:#0b1220">'+esc2(label)+' '+esc2(val)+'</span>';
 }).join('')+'</div>';
}
function weaponHtml(it){
 if(!it||it.slot!=='arme'||!it.weaponType)return '';
 try{
  var wt=(typeof WEAPON_TYPES!=='undefined'&&WEAPON_TYPES[it.weaponType])||null;
  if(!wt)return '';
  return '<div style="font-size:9px;color:#8ea1bd;margin-top:4px">'+esc2(wt.name||it.weaponType)+' · '+esc2(wt.attackType==='MELEE'?'mêlée':'distance')+' · vitesse ×'+esc2(wt.speed||1)+'</div>';
 }catch(_){return '';}
}
function position(root){
 var vw=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0),vh=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);
 var ar=null;try{if(typeof arenaEl!=='undefined'&&arenaEl&&arenaEl.getBoundingClientRect)ar=arenaEl.getBoundingClientRect();}catch(_){}
 var w=Math.min(vw-16,390);root.style.width=w+'px';root.style.left=Math.max(8,(vw-w)/2)+'px';root.style.transform='none';
 if(ar&&ar.height>60){
  var below=ar.bottom+6,needed=170;
  if(below+needed<vh-68){root.style.top=Math.max(8,below)+'px';root.style.bottom='auto';return;}
  root.style.top=Math.max(8,Math.min(vh-needed-72,ar.top+8))+'px';root.style.bottom='auto';return;
 }
 root.style.bottom='calc(env(safe-area-inset-bottom) + 76px)';root.style.top='auto';
}
function next(){current=queue.shift()||null;if(!current){remove();return;}render();}
function clearAll(){queue=[];current=null;remove();}
function enqueue(r){
 var it=byId(r&&r.id);if(!it)return;
 var idx=-1;
 for(var i=0;i<queue.length;i++){var qi=byId(queue[i].id);if(qi&&qi.slot===it.slot){idx=i;break;}}
 if(idx>=0){var old=byId(queue[idx].id);if(!old||score(it)>score(old))queue[idx]=r;return;}
 queue.push(r);
 if(queue.length>MAX_QUEUE){
  queue.sort(function(a,b){var ia=byId(a.id),ib=byId(b.id);return score(ib)-score(ia);});
  queue=queue.slice(0,MAX_QUEUE);
 }
}
function render(){
 remove();var it=byId(current&&current.id);if(!it){next();return;}
 var cur=(S.equipped||{})[it.slot]||null,worn=cur&&cur.id===it.id;
 var nb=primary(it),cb=cur&&!worn?primary(cur):0,bd=cur&&!worn?Math.round(nb-cb):Math.round(nb),pd=worn?0:powerDelta(it);
 var r=rarity(it),cr=cur?rarity(cur):null,more=queue.length;
 var root=document.createElement('div');root.id='srForgeArenaPreview143';root.style.cssText='position:fixed;z-index:8500;pointer-events:auto;font-family:inherit;max-width:calc(100vw - 16px);';
 root.innerHTML='<div style="background:rgba(7,12,21,.965);border:1px solid '+r.c+'88;border-radius:13px;box-shadow:0 10px 30px #0009;padding:9px;overflow:hidden">'+
  '<div style="display:flex;align-items:center;gap:8px">'+
   '<div style="width:38px;height:38px;flex:0 0 38px;border:1px solid '+r.c+'99;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#0b1220">'+(typeof slotIcon==='function'?slotIcon(it.slot,24,it):'⚔')+'</div>'+
   '<div style="min-width:0;flex:1"><div style="font-size:9px;font-weight:900;letter-spacing:.7px;color:'+r.c+'">FORGE · '+esc2(r.label).toUpperCase()+'</div><div style="font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc2(slotName(it))+'</div></div>'+
   (more?'<span style="font-size:9px;font-weight:900;padding:3px 6px;border:1px solid #40516d;border-radius:999px;color:#b8c5db">+'+more+'</span>':'')+
   '<button data-sr-fp143="closeAll" aria-label="Fermer toute la file" title="Fermer toute la file" style="border:0;background:transparent;color:#9dacbf;font-size:21px;padding:2px 5px">×</button></div>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px">'+
   '<div style="padding:6px;border-radius:8px;background:#0b1220"><div style="font-size:8px;color:#8493aa;font-weight:900">NOUVEAU</div><div style="font-size:11px;font-weight:900;color:'+r.c+'">'+primaryLabel(it)+' '+fmt2(nb)+'</div><div style="font-size:9px;font-weight:800;color:'+(bd>0?'#6ee7a0':bd<0?'#ff7474':'#9dacbf')+'">'+signed(bd)+' stat</div></div>'+
   '<div style="padding:6px;border-radius:8px;background:#0b1220"><div style="font-size:8px;color:#8493aa;font-weight:900">PORTÉ</div>'+(cur&&!worn?'<div style="font-size:10px;font-weight:900;color:'+(cr?cr.c:'#9dacbf')+'">'+esc2(cr?cr.label:'')+' · '+primaryLabel(cur)+' '+fmt2(cb)+'</div>':'<div style="font-size:10px;font-weight:900;color:#9dacbf">'+(worn?'Cet objet est équipé':'Aucun')+'</div>')+'<div style="font-size:9px;font-weight:900;color:'+(pd>0?'#6ee7a0':pd<0?'#ff7474':'#9dacbf')+'">Puissance '+signed(pd)+'</div></div></div>'+weaponHtml(it)+affixHtml(it)+
  '<div style="display:flex;gap:6px;margin-top:8px"><button data-sr-fp143="keep" style="flex:1;min-height:36px;border-radius:8px;border:1px solid #35445e;background:#111a2a;color:#c2cce0;font-weight:900">'+(more?'GARDER · SUIVANT':'GARDER')+'</button>'+
  (worn?'<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#6ee7a0;font-weight:900;font-size:11px">✓ ÉQUIPÉ</div>':'<button data-sr-fp143="equip" style="flex:1;min-height:36px;border-radius:8px;border:1px solid #3fb950;background:#173d26;color:#8ff0aa;font-weight:900">ÉQUIPER</button>')+'</div></div>';
 document.body.appendChild(root);position(root);
}

showForgeResult=function(res){
 res=Array.isArray(res)?res:[];
 var kept=res.filter(function(r){return r&&!r.recycled&&r.id&&byId(r.id);});
 var melted=res.filter(function(r){return r&&r.recycled;});
 if(!kept.length){var dust=melted.reduce(function(a,r){return a+(Number(r.dust)||0);},0);try{if(typeof toast==='function')toast(melted.length+' pièce'+(melted.length>1?'s':'')+' recyclée'+(melted.length>1?'s':'')+' · +'+fmt2(dust)+' poussière',true);}catch(_){}return;}
 kept.forEach(enqueue);if(!current)next();else render();
};

document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest?e.target.closest('#srForgeArenaPreview143 [data-sr-fp143]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
 var a=b.getAttribute('data-sr-fp143');
 if(a==='equip'&&current){var it=byId(current.id);if(it){try{equipItem(it.id);}catch(_){} }next();}
 else if(a==='keep')next();
 else if(a==='closeAll')clearAll();
},true);
window.addEventListener('resize',function(){var r=document.getElementById('srForgeArenaPreview143');if(r)position(r);});
})();
