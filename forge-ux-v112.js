/* FORGE_UX_V112
   Additive Forge Master-inspired UX layer.
   - Forge animation remains fully visible inside the compact Home forge.
   - Equipped gear can be removed back to inventory.
   - Equipped gear can be dismantled directly to dust after confirmation.
   Existing test/preview, keep/equip and auto-forge systems stay intact. */
(function(){
'use strict';
if(window.__srForgeUxV112)return;window.__srForgeUxV112=true;

function rerender(){try{if(typeof saveNow==='function')saveNow();if(typeof render==='function')render();else if(typeof scheduleRender==='function')scheduleRender();}catch(_){}}
function equippedById(id){if(typeof S==='undefined'||!S.equipped)return null;var slots=Object.keys(S.equipped);for(var i=0;i<slots.length;i++){var it=S.equipped[slots[i]];if(it&&String(it.id)===String(id))return {slot:slots[i],item:it};}return null;}
function removeEquipped(id){var hit=equippedById(id);if(!hit)return false;S.inventory=S.inventory||[];S.inventory.push(hit.item);S.equipped[hit.slot]=null;try{S.power=computePower(S);}catch(_){}rerender();return true;}
function dustEquipped(id){var hit=equippedById(id);if(!hit)return false;var gain=0;try{gain=typeof recycleValue==='function'?recycleValue(hit.item):dustValue(S,hit.item);}catch(_){}S.equipped[hit.slot]=null;S.poussiere=(Number(S.poussiere)||0)+Math.max(0,Number(gain)||0);try{S.power=computePower(S);}catch(_){}rerender();if(typeof toast==='function')toast('Équipement réduit en poussière · +'+(typeof fmt==='function'?fmt(gain):gain),true);return true;}

if(typeof ACT!=='undefined'&&ACT){
 ACT.srUnequipGear=function(id){if(!removeEquipped(id)&&typeof toast==='function')toast('Équipement introuvable',false);};
 ACT.srAskDustGear=function(id){var hit=equippedById(id);if(!hit)return;var gain=0;try{gain=typeof recycleValue==='function'?recycleValue(hit.item):dustValue(S,hit.item);}catch(_){}
   if(typeof openModal==='function'&&typeof btn==='function')openModal('<div class="center">'+(typeof ic==='function'?ic('trash',30):'')+'</div><div class="modalT center mt6">RÉDUIRE EN POUSSIÈRE ?</div><div class="dim small center mt6">Cette pièce est actuellement équipée.<br>Tu récupères <b style="color:var(--purpleLit)">'+(typeof fmt==='function'?fmt(gain):gain)+'</b> poussière.</div><div class="mute tiny center mt6">Action irréversible.</div><div class="row gap6 mt8">'+btn('Annuler',{cls:'ghost',small:true,act:'closeModal'})+btn((typeof ic==='function'?ic('trash',12)+' ':'')+'Réduire',{cls:'red',small:true,act:'srDustGear',arg:id})+'</div>','Équipement porté');
 };
 ACT.srDustGear=function(id){if(typeof closeModal==='function')closeModal();dustEquipped(id);};
}

/* Add actions to the existing equipped-item detail modal without replacing it. */
document.addEventListener('click',function(ev){
 var target=ev.target&&ev.target.closest?ev.target.closest('[data-act="itemDetail"]'):null;if(!target)return;
 var id=target.getAttribute('data-arg');if(!id||!equippedById(id))return;
 setTimeout(function(){
   var overlay=document.getElementById('overlay');if(!overlay||overlay.querySelector('.srEquippedActions'))return;
   var box=overlay.querySelector('.modal')||overlay.firstElementChild;if(!box)return;
   var row=document.createElement('div');row.className='row gap6 mt8 srEquippedActions';
   row.innerHTML='<button class="btn dark small" data-act="srUnequipGear" data-arg="'+String(id).replace(/"/g,'&quot;')+'">Retirer</button><button class="btn red small" data-act="srAskDustGear" data-arg="'+String(id).replace(/"/g,'&quot;')+'">Réduire en poussière</button>';
   box.appendChild(row);
 },30);
},true);

var style=document.createElement('style');style.id='srForgeUxV112Style';style.textContent=`
/* The compact Forge previously clipped the hammer/anvil scene. Give the scene
   its own predictable viewport and scale the artwork to fit instead of hiding it. */
#app.srHomeFullArena{--srForgeH:198px!important}
#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto){display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:58px!important;max-height:70px!important;height:64px!important;padding:3px 8px!important;overflow:visible!important}
#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto) .forgeScene{height:39px!important;min-height:39px!important;transform:scale(.78)!important;transform-origin:center center!important;overflow:visible!important}
#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto) .forgeHammerHit{transform-origin:center bottom!important}
#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto) .row{min-height:14px!important;margin-top:-2px!important}
#app.srHomeFullArena .homeForge{overflow:visible!important}
.srEquippedActions{justify-content:center!important}.srEquippedActions>.btn{flex:1 1 0!important;min-width:0!important}
@media(max-height:720px){#app.srHomeFullArena{--srForgeH:178px!important}#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto){height:54px!important;min-height:50px!important;max-height:58px!important}#app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto) .forgeScene{height:32px!important;min-height:32px!important;transform:scale(.68)!important}}
`;document.head.appendChild(style);
})();
