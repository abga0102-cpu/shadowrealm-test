/* SHADOWREACH · Forge preview test v144
   One-time, save-safe UI verification for the non-blocking Forge comparison panel.
   This file NEVER creates an item, NEVER calls update/equipItem, and NEVER touches S.
   It only renders a synthetic preview once per browser session so mobile UX can be
   verified without waiting for Forge RNG. Previous Forge layers stay loaded. */
(function(){
'use strict';
if(window.__srForgePreviewTestV144)return;
window.__srForgePreviewTestV144=true;

var SESSION_KEY='sr.forgePreviewTestV144.seen';
var ROOT_ID='srForgePreviewTest144';

function esc2(v){
 return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});
}
function remove(){var x=document.getElementById(ROOT_ID);if(x)x.remove();}
function position(root){
 var vw=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
 var vh=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);
 var ar=null;
 try{if(typeof arenaEl!=='undefined'&&arenaEl&&arenaEl.getBoundingClientRect)ar=arenaEl.getBoundingClientRect();}catch(_){}
 var w=Math.min(vw-16,390);
 root.style.width=w+'px';root.style.left=Math.max(8,(vw-w)/2)+'px';root.style.transform='none';
 if(ar&&ar.height>60){
  var below=ar.bottom+6,needed=184;
  if(below+needed<vh-68){root.style.top=Math.max(8,below)+'px';root.style.bottom='auto';return;}
  root.style.top=Math.max(8,Math.min(vh-needed-72,ar.top+8))+'px';root.style.bottom='auto';return;
 }
 root.style.bottom='calc(env(safe-area-inset-bottom) + 76px)';root.style.top='auto';
}
function render(){
 remove();
 var root=document.createElement('div');root.id=ROOT_ID;
 root.style.cssText='position:fixed;z-index:8600;pointer-events:auto;font-family:inherit;max-width:calc(100vw - 16px);';
 root.innerHTML='<div style="background:rgba(7,12,21,.97);border:1px solid #B15CF688;border-radius:13px;box-shadow:0 10px 30px #0009;padding:9px;overflow:hidden">'+
  '<div style="display:flex;align-items:center;gap:8px">'+
   '<div style="width:38px;height:38px;flex:0 0 38px;border:1px solid #B15CF699;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#0b1220;font-size:20px">⚔</div>'+
   '<div style="min-width:0;flex:1"><div style="font-size:9px;font-weight:900;letter-spacing:.7px;color:#B15CF6">APERÇU TEST · FORGE</div><div style="font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Arme mythique simulée</div></div>'+
   '<span style="font-size:8px;font-weight:900;padding:3px 6px;border:1px solid #40516d;border-radius:999px;color:#b8c5db">AUCUN GAIN</span>'+
   '<button data-sr-fptest144="close" aria-label="Fermer" style="border:0;background:transparent;color:#9dacbf;font-size:21px;padding:2px 5px">×</button></div>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px">'+
   '<div style="padding:6px;border-radius:8px;background:#0b1220"><div style="font-size:8px;color:#8493aa;font-weight:900">NOUVEAU</div><div style="font-size:11px;font-weight:900;color:#B15CF6">ATQ 1 280</div><div style="font-size:9px;font-weight:800;color:#6ee7a0">+180 stat</div></div>'+
   '<div style="padding:6px;border-radius:8px;background:#0b1220"><div style="font-size:8px;color:#8493aa;font-weight:900">PORTÉ</div><div style="font-size:10px;font-weight:900;color:#4A90D9">Rare · ATQ 1 100</div><div style="font-size:9px;font-weight:900;color:#6ee7a0">Puissance +2 450</div></div></div>'+
  '<div style="font-size:9px;color:#8ea1bd;margin-top:4px">Épée · mêlée · vitesse ×1.05</div>'+
  '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">'+
   '<span style="font-size:9px;font-weight:800;padding:3px 6px;border:1px solid #34445f;border-radius:999px;color:#c9d4e6;background:#0b1220">Critique +8%</span>'+
   '<span style="font-size:9px;font-weight:800;padding:3px 6px;border:1px solid #34445f;border-radius:999px;color:#c9d4e6;background:#0b1220">Vitesse +6%</span>'+
   '<span style="font-size:9px;font-weight:800;padding:3px 6px;border:1px solid #34445f;border-radius:999px;color:#c9d4e6;background:#0b1220">Vol de vie +4%</span></div>'+
  '<div style="display:flex;gap:6px;margin-top:8px">'+
   '<button data-sr-fptest144="close" style="flex:1;min-height:36px;border-radius:8px;border:1px solid #35445e;background:#111a2a;color:#c2cce0;font-weight:900">FERMER LE TEST</button>'+
   '<button disabled style="flex:1;min-height:36px;border-radius:8px;border:1px solid #3fb95055;background:#173d2666;color:#8ff0aa88;font-weight:900">ÉQUIPER · TEST</button></div>'+
  '<div style="font-size:8px;color:#73839b;text-align:center;margin-top:6px">Prévisualisation uniquement · aucun objet ni ressource modifié</div></div>';
 document.body.appendChild(root);position(root);
}

window.__srShowForgePreviewTestV144=render;
document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest?e.target.closest('#'+ROOT_ID+' [data-sr-fptest144]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();remove();
},true);
window.addEventListener('resize',function(){var r=document.getElementById(ROOT_ID);if(r)position(r);});

function maybeShow(){
 var seen=false;try{seen=sessionStorage.getItem(SESSION_KEY)==='1';}catch(_){}
 if(seen)return;
 try{sessionStorage.setItem(SESSION_KEY,'1');}catch(_){}
 setTimeout(render,900);
}
if(document.readyState==='complete')maybeShow();else window.addEventListener('load',maybeShow,{once:true});
})();
