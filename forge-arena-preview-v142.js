/* SHADOWREACH · Forge arena preview v142
   Non-blocking presentation for equipment retained by the existing Forge filter.
   The Forge/filter/drop logic is untouched: this layer only replaces the old
   blocking result modal with an arena-safe comparison queue. */
(function(){
'use strict';
if(window.__srForgeArenaPreviewV142)return;
window.__srForgeArenaPreviewV142=true;
if(typeof showForgeResult!=='function'||typeof equipItem!=='function')return;

var queue=[];
var current=null;
var nativeShow=showForgeResult;

function byId(id){
 var eq=Object.values((typeof S!=='undefined'&&S.equipped)||{}).find(function(x){return x&&x.id===id;});
 return eq||(((typeof S!=='undefined'&&S.inventory)||[]).find(function(x){return x&&x.id===id;}))||null;
}
function base(it){
 if(!it)return 0;
 try{if(typeof MASTERY_STAT!=='undefined'&&MASTERY_STAT[it.slot]==='dmg')return Number(it.baseDamage!=null?it.baseDamage:(it.damage||0));}catch(_){}
 return Number(it.baseHp!=null?it.baseHp:(it.hp||0));
}
function baseLabel(it){
 try{return typeof MASTERY_STAT!=='undefined'&&MASTERY_STAT[it.slot]==='dmg'?'ATQ':'PV';}catch(_){return 'STAT';}
}
function powerDelta(it){
 if(!it||!it.slot||typeof computePower!=='function')return 0;
 try{
  var before=Number(S.power||computePower(S)||0);
  var e=Object.assign({},S.equipped||{});e[it.slot]=it;
  return Math.round(computePower(Object.assign({},S,{equipped:e}))-before);
 }catch(_){return 0;}
}
function signed(n){n=Math.round(Number(n)||0);return(n>0?'+':'')+(typeof fmt==='function'?fmt(n):n);}
function esc2(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}
function rarity(it){return (typeof RARITY!=='undefined'&&RARITY[it.rarity])||{c:'#9FB0C8',label:it.rarity||''};}
function slotName(it){return (typeof SLOT_LABEL!=='undefined'&&SLOT_LABEL[it.slot])||it.slot||'Équipement';}
function remove(){var x=document.getElementById('srForgeArenaPreview142');if(x)x.remove();}
function next(){current=queue.shift()||null;if(!current){remove();return;}render();}
function render(){
 remove();
 var it=byId(current&&current.id);if(!it){next();return;}
 var cur=(S.equipped||{})[it.slot]||null;
 var worn=cur&&cur.id===it.id;
 var nb=base(it),cb=cur&&!worn?base(cur):0,bd=cur&&!worn?Math.round(nb-cb):Math.round(nb);
 var pd=worn?0:powerDelta(it),r=rarity(it),cr=cur?rarity(cur):null;
 var more=queue.length;
 var root=document.createElement('div');root.id='srForgeArenaPreview142';
 root.style.cssText='position:fixed;z-index:8500;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 78px);width:min(94vw,430px);pointer-events:auto;font-family:inherit;';
 root.innerHTML='<div style="background:rgba(7,12,21,.96);border:1px solid '+r.c+'88;border-radius:14px;box-shadow:0 10px 34px #0009;padding:10px;overflow:hidden">'+
  '<div style="display:flex;align-items:center;gap:9px">'+
   '<div style="width:42px;height:42px;flex:0 0 42px;border:1px solid '+r.c+'99;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#0b1220">'+(typeof slotIcon==='function'?slotIcon(it.slot,27,it):'⚔')+'</div>'+
   '<div style="min-width:0;flex:1"><div style="font-size:10px;font-weight:900;letter-spacing:.7px;color:'+r.c+'">FORGE · '+esc2(r.label).toUpperCase()+'</div><div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc2(slotName(it))+'</div></div>'+
   (more?'<span style="font-size:10px;font-weight:800;padding:3px 7px;border:1px solid #40516d;border-radius:999px;color:#b8c5db">+'+more+'</span>':'')+
   '<button data-sr-fp="dismiss" aria-label="Fermer" style="border:0;background:transparent;color:#9dacbf;font-size:22px;padding:2px 5px">×</button></div>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">'+
   '<div style="padding:7px;border-radius:9px;background:#0b1220"><div style="font-size:9px;color:#8493aa;font-weight:800">NOUVEAU</div><div style="font-size:11px;font-weight:800;color:'+r.c+'">'+baseLabel(it)+' '+(typeof fmt==='function'?fmt(nb):nb)+'</div><div style="font-size:10px;color:'+(bd>0?'#6ee7a0':bd<0?'#ff7474':'#9dacbf')+'">'+signed(bd)+' stat</div></div>'+
   '<div style="padding:7px;border-radius:9px;background:#0b1220"><div style="font-size:9px;color:#8493aa;font-weight:800">PORTÉ</div>'+(cur&&!worn?'<div style="font-size:11px;font-weight:800;color:'+(cr?cr.c:'#9dacbf')+'">'+esc2(cr?cr.label:'')+' · '+baseLabel(cur)+' '+(typeof fmt==='function'?fmt(cb):cb)+'</div>':'<div style="font-size:11px;font-weight:800;color:#9dacbf">'+(worn?'Cet objet est équipé':'Aucun')+'</div>')+'<div style="font-size:10px;color:'+(pd>0?'#6ee7a0':pd<0?'#ff7474':'#9dacbf')+'">Puissance '+signed(pd)+'</div></div></div>'+
  '<div style="display:flex;gap:7px;margin-top:8px"><button data-sr-fp="dismiss" style="flex:1;min-height:38px;border-radius:9px;border:1px solid #35445e;background:#111a2a;color:#c2cce0;font-weight:800">'+(more?'Suivant':'Ignorer')+'</button>'+
  (worn?'<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#6ee7a0;font-weight:900">✓ ÉQUIPÉ</div>':'<button data-sr-fp="equip" style="flex:1;min-height:38px;border-radius:9px;border:1px solid #3fb950;background:#173d26;color:#8ff0aa;font-weight:900">ÉQUIPER</button>')+'</div></div>';
 document.body.appendChild(root);
}

/* v95 already gives each retained result the real inventory id. Recycled
   results never enter this queue, so the player's existing filter remains the
   sole authority for what deserves attention. */
showForgeResult=function(res){
 res=Array.isArray(res)?res:[];
 var kept=res.filter(function(r){return r&&!r.recycled&&r.id&&byId(r.id);});
 var melted=res.filter(function(r){return r&&r.recycled;});
 if(!kept.length){
  var dust=melted.reduce(function(a,r){return a+(Number(r.dust)||0);},0);
  try{if(typeof toast==='function')toast(melted.length+' pièce'+(melted.length>1?'s':'')+' recyclée'+(melted.length>1?'s':'')+' · +'+(typeof fmt==='function'?fmt(dust):dust)+' poussière',true);}catch(_){}
  return;
 }
 kept.forEach(function(r){queue.push(r);});
 if(!current)next();
};

document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest?e.target.closest('#srForgeArenaPreview142 [data-sr-fp]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();
 var a=b.getAttribute('data-sr-fp');
 if(a==='equip'&&current){var it=byId(current.id);if(it){try{equipItem(it.id);}catch(_){} } next();}
 else if(a==='dismiss')next();
},true);

/* Do not let a navigation render destroy the queue: the preview lives under
   body, outside #screen. If the item itself disappears, the next render skips it. */
})();
