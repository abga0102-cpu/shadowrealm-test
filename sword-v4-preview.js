/* Visual-only preview; no game state or saves modified. */
(function(){
'use strict';
if(new URLSearchParams(location.search).get('swordPreview')!=='1')return;
let dialog,viewer,button,status;
const originalURL=new URL('assets/armurerie-premium/Epee_ORIGINAL.glb',document.baseURI).href;
const thumbURL=new URL('assets/armurerie-premium/Epee_V4.webp',document.baseURI).href;
// Replace only existing legendary sword artwork. No item is created, modified or awarded.
if(typeof slotIcon==='function'){
 const previous=slotIcon;
 slotIcon=function(slot,size,item){
  if(slot==='arme'&&item&&item.weaponType==='epee'&&item.rarity==='LEGENDAIRE'){
   const n=Math.max(12,Math.min(200,Number(size)||24));
   return '<img src="'+thumbURL+'" alt="Épée légendaire" style="width:'+n+'px;height:'+n+'px;object-fit:contain;vertical-align:middle;display:inline-block">';
  }
  return previous.apply(this,arguments);
 };
}
const url=new URL('assets/armurerie-premium/Epee_JEU.glb',document.baseURI).href;
function open(){
 if(dialog){dialog.showModal();return;}
 dialog=document.createElement('dialog');
 dialog.style.cssText='width:min(92vw,460px);max-height:90vh;padding:14px;color:#f6e8c1;background:#101b2c;border:1px solid #d6ad61;border-radius:16px;box-sizing:border-box;overflow:auto';
 dialog.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between"><strong>ÉPÉE LÉGENDAIRE · V4</strong><button type="button" aria-label="Fermer">✕</button></div><p style="font-size:12px;color:#bac6db">Comparaison des matériaux · aucune modification de tes objets ou statistiques.</p><div data-preview style="height:min(55vh,410px);background:radial-gradient(ellipse,#39445a,#0c1422);border-radius:12px;overflow:hidden"></div><div style="display:flex;gap:8px;margin-top:8px"><button type="button" data-version="fixed" style="flex:1;padding:8px">Corrigée</button><button type="button" data-version="original" style="flex:1;padding:8px">Ancienne</button></div><p data-status role="status" style="font-size:12px">Chargement du modèle…</p><label style="display:block;font-size:12px">Si le modèle est absent, choisir Epee_JEU.glb : <input type="file" accept=".glb" style="max-width:100%"></label>';
 document.body.append(dialog);
 status=dialog.querySelector('[data-status]');
 dialog.querySelector('button').onclick=()=>dialog.close();
 dialog.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{viewer.src=b.dataset.version==='original'?originalURL:url;status.textContent='Chargement…';dialog.querySelectorAll('[data-version]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
 dialog.querySelector('[data-version="fixed"]').setAttribute('aria-pressed','true');
 dialog.addEventListener('close',()=>{if(viewer)viewer.removeAttribute('auto-rotate');});
 dialog.querySelector('input').onchange=function(){let f=this.files[0];if(!f)return;if(!/\.glb$/i.test(f.name)){status.textContent='Choisis un fichier GLB.';return;}if(viewer.dataset.local)URL.revokeObjectURL(viewer.dataset.local);viewer.dataset.local=URL.createObjectURL(f);viewer.src=viewer.dataset.local;status.textContent='Chargement…';};
 viewer=document.createElement('model-viewer');
 viewer.setAttribute('camera-controls','');viewer.setAttribute('touch-action','pan-y');viewer.setAttribute('shadow-intensity','0.7');viewer.setAttribute('exposure','0.95');viewer.setAttribute('environment-image','neutral');viewer.setAttribute('alt','Épée légendaire Shadowreach V4');viewer.style.cssText='width:100%;height:100%;display:block';viewer.addEventListener('load',()=>status.textContent='Fais glisser pour tourner · molette pour zoomer');viewer.addEventListener('error',()=>status.textContent='Modèle indisponible. Choisis le fichier GLB local.');
 dialog.querySelector('[data-preview]').append(viewer);
 if(!customElements.get('model-viewer')){const s=document.createElement('script');s.type='module';s.src='https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js';s.onerror=()=>status.textContent='Le lecteur 3D nécessite une connexion Internet.';document.head.append(s);}
 viewer.setAttribute('src',url);dialog.showModal();
}
function mount(){const forge=document.querySelector('#homeForge');const slots=document.querySelector('.slotGrid[data-equip-slots-scroll]');const host=forge||(slots&&slots.parentElement);if(!host||host.querySelector('[data-sr-sword-preview]'))return;button=document.createElement('button');button.type='button';button.dataset.srSwordPreview='1';button.textContent='⚔ Aperçu 3D · Épée légendaire V4';button.style.cssText='display:block;width:100%;margin:7px 0;padding:8px;color:#ffe4a0;background:#253149;border:1px solid #d6ad61;border-radius:9px;font:600 12px system-ui;cursor:pointer';button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open();});host.append(button);}
let queued=false;const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount();});};new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});queue();
})();