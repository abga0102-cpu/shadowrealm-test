/* SHADOWREACH · Forge + social UX corrections v135
   - Keeps Forge animation fully visible in the compact Home layout.
   - Equipped gear can be removed or directly dismantled into dust after confirmation.
   - Floating chat bubble is hidden outside Home but remains available in the Home arena. */
(function(){
'use strict';
if(window.__srForgeSocialFixV135)return;window.__srForgeSocialFixV135=true;

function equipped(id){if(typeof S==='undefined'||!S.equipped)return null;for(var slot in S.equipped){var it=S.equipped[slot];if(it&&String(it.id)===String(id))return {slot:slot,item:it};}return null;}
function dustValueSafe(it){try{return typeof recycleValue==='function'?recycleValue(it):(typeof dustValue==='function'?dustValue(S,it):0);}catch(_){return 0;}}
function refresh(){try{if(typeof dirty!=='undefined')dirty=true;if(typeof saveNow==='function')saveNow();if(typeof render==='function')render();else if(typeof scheduleRender==='function')scheduleRender();}catch(_){} }

if(typeof ACT!=='undefined'&&ACT){
 ACT.recycleEquippedV135=function(id){
   var hit=equipped(id);if(!hit)return;
   var val=dustValueSafe(hit.item);
   try{if(typeof unequipItem==='function')unequipItem(hit.slot);else{S.inventory=S.inventory||[];S.inventory.push(hit.item);S.equipped[hit.slot]=null;}}
   catch(_){return;}
   var got=0;try{got=typeof recycleItem==='function'?recycleItem(id):0;}catch(_){}
   if(!got&&val>0){var ix=(S.inventory||[]).findIndex(function(x){return x&&String(x.id)===String(id);});if(ix>=0){S.inventory.splice(ix,1);S.poussiere=(Number(S.poussiere)||0)+val;got=val;}}
   if(typeof closeModal==='function')closeModal();refresh();if(typeof toast==='function')toast('+'+(typeof fmt==='function'?fmt(got):got)+' poussière',true);
 };
 ACT.askRecycleEquippedV135=function(id){
   var hit=equipped(id);if(!hit)return;var val=dustValueSafe(hit.item);
   if(typeof openModal==='function'&&typeof btn==='function')openModal('<div class="center">'+(typeof ic==='function'?ic('trash',30):'')+'</div><div class="modalT center mt6">RÉDUIRE EN POUSSIÈRE ?</div><div class="dim small center mt6">Cette pièce est actuellement équipée.<br>Tu récupères <b style="color:var(--purpleLit)">'+(typeof fmt==='function'?fmt(val):val)+'</b> poussière.</div><div class="mute tiny center mt6">Action irréversible.</div><div class="row gap6 mt8">'+btn('Annuler',{cls:'ghost',small:true,act:'closeModal'})+btn((typeof ic==='function'?ic('trash',12)+' ':'')+'Réduire',{cls:'red',small:true,act:'recycleEquippedV135',arg:id})+'</div>','Équipement porté');
 };
}

/* The base item detail already supports unequip; clarify the wording and add direct dust action. */
document.addEventListener('click',function(e){
 var src=e.target&&e.target.closest?e.target.closest('[data-act="itemDetail"]'):null;if(!src)return;var id=src.getAttribute('data-arg');if(!id||!equipped(id))return;
 setTimeout(function(){
   var ov=document.getElementById('overlay');if(!ov)return;
   var un=ov.querySelector('[data-act="unequip"]');if(un)un.textContent='Retirer';
   if(ov.querySelector('[data-act="askRecycleEquippedV135"]'))return;
   var close=ov.querySelector('[data-act="closeModal"]');if(!close)return;
   var b=document.createElement('button');b.className='btn sm red';b.setAttribute('data-act','askRecycleEquippedV135');b.setAttribute('data-arg',id);b.textContent='Réduire en poussière';
   close.parentElement.insertBefore(b,close);
 },35);
},true);

var st=document.createElement('style');st.id='srForgeSocialFixV135Style';st.textContent=`
/* Higher specificity than the dynamically-loaded Home layout keeps the Forge scene visible. */
html body #app.srHomeFullArena{--srForgeH:194px!important}
html body #app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto){display:flex!important;flex-direction:column!important;justify-content:center!important;height:62px!important;min-height:58px!important;max-height:66px!important;padding:3px 8px!important;overflow:visible!important}
html body #app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto) .forgeScene{height:38px!important;min-height:38px!important;transform:scale(.76)!important;transform-origin:center center!important;overflow:visible!important}
html body #app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto) .row{min-height:14px!important;margin-top:-2px!important}
/* v134 hid chat globally. Restore only the legitimate Home-arena access. */
html body #app.srHomeFullArena #srChatBtn{display:block!important}
html body #app:not(.srHomeFullArena)>#srChatBtn{display:none!important}
html body #overlay #srChatBtn{display:none!important}
@media(max-height:720px){html body #app.srHomeFullArena{--srForgeH:176px!important}html body #app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto){height:52px!important;min-height:48px!important;max-height:56px!important}html body #app.srHomeFullArena .homeForge .forgeAnim:not(.compactAuto) .forgeScene{height:31px!important;min-height:31px!important;transform:scale(.66)!important}}
`;document.head.appendChild(st);
})();