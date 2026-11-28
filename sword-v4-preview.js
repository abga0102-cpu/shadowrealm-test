/* Legendary sword artwork and lazy 3D inspection; no game-state writes. */
(function(){
'use strict';
const qs=new URLSearchParams(location.search);
if(qs.get('swordPreview')!=='1')return;
const root=new URL('assets/armurerie-premium/',document.baseURI);
const thumb=new URL('Epee_V4.webp',root).href, model=new URL('Epee_60K.glb',root).href;
const isSword=it=>!!it&&it.slot==='arme'&&it.weaponType==='epee'&&it.rarity==='LEGENDAIRE';
let dialog=null,viewer=null,library=null,trigger=null;
function libraryReady(){
 if(customElements.get('model-viewer'))return Promise.resolve();
 if(!library)library=import('https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js').then(()=>customElements.whenDefined('model-viewer')).catch(e=>{library=null;throw e;});
 return library;
}
const oldIcon=typeof slotIcon==='function'?slotIcon:null;
let ready=false;
if(oldIcon)slotIcon=function(slot,size,item){
 if(!ready||slot!=='arme'||!isSword(item))return oldIcon.apply(this,arguments);
 const n=Math.max(12,Math.min(200,Number(size)||24));
 return '<img data-sr-sword-v4="1" src="'+thumb+'" alt="Épée légendaire" title="Inspecter en 3D" style="width:'+n+'px;height:'+n+'px;object-fit:contain;vertical-align:middle;display:inline-block;cursor:zoom-in">';
};
function close(){
 if(dialog&&dialog.open)dialog.close();
}
function inspect(from){
 if(dialog&&dialog.open)return;
 trigger=from||document.activeElement;
 dialog=document.createElement('dialog');
 dialog.style.cssText='width:min(92vw,460px);max-height:88dvh;box-sizing:border-box;overflow:auto;background:#101b2c;color:#f6e8c1;border:1px solid #d6ad61;border-radius:16px;padding:14px;';
 dialog.innerHTML='<header style="display:flex;align-items:center;justify-content:space-between;gap:8px"><strong>ÉPÉE LÉGENDAIRE</strong><button type="button" data-close aria-label="Fermer" style="padding:8px;border-radius:7px">✕</button></header><div data-view style="height:min(55dvh,410px);min-height:180px;background:radial-gradient(ellipse,#39445a,#0c1422);border-radius:12px;overflow:hidden;margin-top:12px"></div><p data-status role="status" style="font-size:12px;margin:8px 0">Chargement du modèle…</p>';
 const d=dialog,view=d.querySelector('[data-view]'),status=d.querySelector('[data-status]');
 d.querySelector('[data-close]').onclick=close;
 d.addEventListener('close',()=>{if(viewer){viewer.removeAttribute('src');viewer.remove();viewer=null;}d.remove();dialog=null;if(trigger&&trigger.isConnected)trigger.focus?.();},{once:true});
 document.body.append(d);d.showModal();
 libraryReady().then(()=>{
 if(dialog!==d||!d.open)return;
 viewer=document.createElement('model-viewer');
 for(const [k,v] of Object.entries({'camera-controls':'','touch-action':'pan-y','environment-image':'neutral','exposure':'0.95','shadow-intensity':'0','camera-orbit':'0deg 90deg 105%','field-of-view':'30deg','alt':'Épée légendaire Shadowreach'}))viewer.setAttribute(k,v);
 viewer.style.cssText='width:100%;height:100%;display:block';
 viewer.addEventListener('load',()=>status.textContent='Glisse pour tourner · molette pour zoomer.');
 viewer.addEventListener('error',()=>status.textContent='Modèle indisponible. Relance le test.');
 view.append(viewer);viewer.setAttribute('src',model);
 }).catch(()=>{if(dialog===d)status.textContent='Lecteur 3D indisponible. Vérifie ta connexion Internet.';});
}
function owned(){
 try{return isSword(S.equipped?.arme)||(Array.isArray(S.inventory)&&S.inventory.some(isSword));}catch(_){return false;}
}
// The arena is a 2D sprite renderer. Keep its exact animation and gameplay.
const combatArt=new URL('Epee_COMBAT.webp',root).href;
const testMode=qs.get('swordReference')==='1';
let combatReady=false,combatDemo=false;
const originalWeapon=typeof weaponHTML==='function'?weaponHTML:null;
function currentWeapon(){try{return S.equipped?.arme||null;}catch(_){return null;}}
function useCombatArt(weapon,it,demo){return weapon==='epee'&&(isSword(it)||(testMode&&demo&&(!it||it.weaponType==='epee')));}
function replaceCombatArt(html){
 const original=ASSETS.weapon_epee;
 return typeof html==='string'&&original?html.replace('src="'+original+'"','src="'+combatArt+'"'):html;
}
if(originalWeapon)weaponHTML=function(weapon,color,attacking,t,size){
 const html=originalWeapon.apply(this,arguments);
 return combatReady&&useCombatArt(weapon,currentWeapon(),combatDemo)?replaceCombatArt(html):html;
};
// In local reference mode only, show a cosmetic sword even on an unarmed hero.
// This is an overlay, not an equipped item: no attack effects, damage or state change.
if(typeof drawArena==='function'&&originalWeapon){
 const oldDraw=drawArena;
 drawArena=function(){
  const result=oldDraw.apply(this,arguments);
  if(!combatReady||!testMode||!combatDemo||currentWeapon())return result;
  try{
   const hero=arenaNodes?.layer?.querySelector(':scope > .unit');
   if(!hero||String(hero.style.zIndex)!=='4'||hero.querySelector(':scope > .srWeapon'))return result;
   const size=parseFloat(hero.style.width)||64;
   hero.insertAdjacentHTML('beforeend',replaceCombatArt(originalWeapon('epee','#e4b85e',combat.heroAttacking>0,performance.now(),size)));
  }catch(_){}
  return result;
 };
}
const combatProbe=new Image();combatProbe.onload=()=>{combatReady=true;queue();};combatProbe.src=combatArt;
function mountCombatTest(forge){
 if(!testMode||!forge||!combatReady)return;
 let b=forge.querySelector('[data-sr-combat-demo]');
 if(!b){
  b=document.createElement('button');b.type='button';b.dataset.srCombatDemo='1';
  b.style.cssText='display:block;width:100%;margin:8px 0;padding:9px;color:#ffe4a0;background:#253149;border:1px solid #d6ad61;border-radius:9px;font:600 12px system-ui;cursor:pointer';
  b.onclick=e=>{e.preventDefault();e.stopPropagation();combatDemo=!combatDemo;mountCombatTest(forge);};
  forge.append(b);
 }
 const it=currentWeapon(),blocked=!!it&&it.weaponType!=='epee';
 const label=blocked?'Test visuel : équipe une épée':isSword(it)?'Épée légendaire équipée · visuel actif':combatDemo?'Désactiver le test visuel en combat':'Voir l’épée sur le héros · test visuel';
 if(b.textContent!==label)b.textContent=label;
 b.disabled=blocked||isSword(it);b.setAttribute('aria-pressed',String(combatDemo&&!blocked));
}

function mount(){
 if(!ready)return;
 // The combat slot has its own icon path; preserve its original navigation and art.
 let equipped=false;try{equipped=isSword(S.equipped?.arme);}catch(_){}
 document.querySelectorAll('.srWeaponSlotV392 img').forEach(im=>{
 if(equipped){if(!im.dataset.srOldArt)im.dataset.srOldArt=im.getAttribute('src')||'';if(im.src!==thumb)im.src=thumb;}
 else if(im.dataset.srOldArt!==undefined){im.setAttribute('src',im.dataset.srOldArt);delete im.dataset.srOldArt;}
 });
 // Only the isolated local test provides a read-only reference, even at forge level 1.
 const forge=document.querySelector('#homeForge');
 mountCombatTest(forge);
 const demo=forge&&forge.querySelector('[data-sr-sword-reference]');
 if(demo&&owned())demo.remove();
 if(qs.get('swordReference')==='1'&&forge&&!demo&&!owned()&&oldIcon){
 const ref=document.createElement('button');ref.type='button';ref.dataset.srSwordReference='1';
 ref.style.cssText='display:flex;align-items:center;gap:10px;width:100%;margin:8px 0;padding:8px;text-align:left;background:#18273c;color:#f5dd9f;border:1px solid #aa8748;border-radius:9px;cursor:pointer;';
 ref.innerHTML=slotIcon('arme',46,{slot:'arme',weaponType:'epee',rarity:'LEGENDAIRE'})+'<span><b>Épée légendaire</b><small style="display:block;color:#bbc8da">Modèle de référence · non obtenu</small><small>Inspecter en 3D</small></span>';
 ref.onclick=e=>{e.preventDefault();e.stopPropagation();inspect(ref);};forge.append(ref);
 }
 document.querySelectorAll('img[data-sr-sword-v4]').forEach(im=>{
 if(im.closest('[data-sr-sword-reference]')||im.closest('[data-act="toggleRecycleItem"]'))return;
 if(im.getAttribute('role')!=='button'){im.setAttribute('role','button');im.tabIndex=0;im.setAttribute('aria-label','Inspecter cette épée légendaire en 3D');}
 });
}
function activate(e){
 const im=e.target?.closest?.('img[data-sr-sword-v4]');
 if(!im||im.closest('[data-sr-sword-reference],[data-act="toggleRecycleItem"]'))return;
 if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;
 e.preventDefault();e.stopImmediatePropagation();inspect(im);
}
document.addEventListener('click',activate,true);document.addEventListener('keydown',activate,true);
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount();});}
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});
const probe=new Image();probe.onload=()=>{ready=true;queue();try{if(typeof scheduleRender==='function')scheduleRender();else if(typeof render==='function')render();}catch(_){}};probe.src=thumb;
})();