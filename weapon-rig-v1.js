/* Reusable 2D weapon rig, visual-only. Five actual hero sprite poses, normalized grip anchors. */
(function(){
'use strict';
const qs=new URLSearchParams(location.search);
if(qs.get('swordPreview')!=='1')return;
const local=qs.get('swordReference')==='1';
const key='sr.visual.weaponRig.epee.v1';
const paths=['hero','hero_attack1','hero_attack2','hero_attack3','hero_attack4'];
const names=['Repos / marche','Attaque 1','Attaque 2','Attaque 3','Attaque 4'];
// Positions measured against 358×348 artwork, fitted into a square aligned at bottom.
const defaults={version:1,weapon:'epee',grip:{x:.5,y:.85},aspect:139/256,length:.73,poses:[
{x:.74,y:.61,angle:48},{x:.83,y:.60,angle:62},{x:.44,y:.24,angle:-62},{x:.71,y:.59,angle:123},{x:.91,y:.45,angle:78}]};
const copy=o=>JSON.parse(JSON.stringify(o));
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function valid(p){return p&&p.version===1&&p.weapon==='epee'&&p.grip&&finite(p.grip.x,0,1)&&finite(p.grip.y,0,1)&&finite(p.aspect,.1,2)&&finite(p.length,.3,1.3)&&Array.isArray(p.poses)&&p.poses.length===5&&p.poses.every(q=>q&&finite(q.x,0,1)&&finite(q.y,0,1)&&finite(q.angle,-180,180));}
let profile=copy(defaults);
if(local){try{const p=JSON.parse(localStorage.getItem(key));if(valid(p))profile=p;}catch(_){}}
function geometry(size,pose,p=profile){
 const a=p.poses[pose]||p.poses[0],h=size*p.length,w=h*p.aspect;
 return {left:a.x*size-p.grip.x*w,top:a.y*size-p.grip.y*h,width:w,height:h,originX:p.grip.x*100,originY:p.grip.y*100,angle:a.angle};
}
function style(g){return 'position:absolute;z-index:6;pointer-events:none;left:'+g.left.toFixed(2)+'px;top:'+g.top.toFixed(2)+'px;width:'+g.width.toFixed(2)+'px;height:'+g.height.toFixed(2)+'px;transform-origin:'+g.originX+'% '+g.originY+'%;transform:rotate('+g.angle+'deg)';}
function poseFor(attack,t){
 try{const actual=spriteFrame('hero',attack?(Number(combat.heroAttacking)||0):0,t);const i=paths.findIndex(k=>ASSETS[k]===actual);return i>=0?i:-1;}catch(_){return -1;}
}
function html(src,color,attack,t,size){
 const pose=poseFor(attack,t);
 if(pose<0)return null;
 const safeColor=/^#[0-9a-f]{6}$/i.test(color)?color:'#e4b85e';
 return '<div class="srWeapon" data-sr-rig="epee" style="'+style(geometry(size,pose))+'"><img src="'+src+'" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 3px '+safeColor+'99)"></div>';
}
let editor=null;
function open(src){
 if(!local||editor)return;
 let index=0,playing=false,anim=0,last=0;
 const d=document.createElement('dialog');editor=d;
 d.style.cssText='width:min(94vw,560px);max-height:92dvh;overflow:auto;box-sizing:border-box;padding:14px;border:1px solid #d6ad61;border-radius:14px;background:#101b2c;color:#f6e8c1';
 d.innerHTML='<header style="display:flex;justify-content:space-between;align-items:center"><b>ATELIER DE PLACEMENT · ÉPÉE</b><button type="button" data-close>✕</button></header><p style="font-size:12px;color:#c5d0df">Les 5 poses réelles du héros. Le point doré représente la prise du manche. Les corrections sont visibles immédiatement, uniquement dans le test.</p><div data-tabs style="display:flex;flex-wrap:wrap;gap:4px"></div><div data-stage style="position:relative;width:min(100%,290px);aspect-ratio:1;margin:8px auto;background:radial-gradient(#38465b,#152132);border-radius:8px;touch-action:none;overflow:hidden"><img data-hero style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom;pointer-events:none"><div data-weapon><img style="width:100%;height:100%;object-fit:contain;display:block"></div><div data-dot style="position:absolute;width:15px;height:15px;border:2px solid #ffe2a1;border-radius:50%;transform:translate(-50%,-50%);box-sizing:border-box;z-index:9;pointer-events:none"></div></div><div data-controls style="display:grid;gap:5px"></div><div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px"><button type="button" data-play>Lire les poses</button><button type="button" data-save>Enregistrer sur cet appareil</button><button type="button" data-reset>Réinitialiser</button><button type="button" data-export>Exporter JSON</button></div><p data-info role="status" style="font-size:12px"></p>';
 document.body.append(d);
 const stage=d.querySelector('[data-stage]'),hero=d.querySelector('[data-hero]'),weapon=d.querySelector('[data-weapon]'),dot=d.querySelector('[data-dot]'),info=d.querySelector('[data-info]');
 weapon.querySelector('img').src=src;
 const controls=d.querySelector('[data-controls]'),tabs=d.querySelector('[data-tabs]');
 const sliders={};
 const rows=[['x','Main X',0,1,.005],['y','Main Y',0,1,.005],['angle','Angle',-180,180,1],['length','Taille',.3,1.3,.01],['gripY','Prise sur le manche',0,1,.005]];
 for(const [k,label,min,max,step] of rows){
 const row=document.createElement('label');row.style.cssText='display:grid;grid-template-columns:110px 1fr 50px;align-items:center;gap:6px;font-size:12px';
 row.innerHTML='<span>'+label+'</span><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" style="width:100%;min-width:0"><output></output>';controls.append(row);
 const input=row.querySelector('input'),out=row.querySelector('output');sliders[k]={input,out};
 input.oninput=()=>{stop();const v=Number(input.value);if(k==='length')profile.length=v;else if(k==='gripY')profile.grip.y=v;else profile.poses[index][k]=v;draw();};
 }
 names.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.style.cssText='padding:5px;font-size:11px';b.onclick=()=>{stop();index=i;draw();};tabs.append(b);});
 function draw(){
 const a=profile.poses[index],size=stage.clientWidth||290;
 hero.src=ASSETS[paths[index]];
 weapon.style.cssText=style(geometry(size,index));
 dot.style.left=(a.x*100)+'%';dot.style.top=(a.y*100)+'%';
 for(const [k,o] of Object.entries(sliders)){const v=k==='length'?profile.length:k==='gripY'?profile.grip.y:a[k];o.input.value=v;o.out.textContent=k==='angle'?v+'°':Math.round(v*100)+'%';}
 [...tabs.children].forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.style.background=i===index?'#d6ad61':'#31435a';b.style.color=i===index?'#121b2c':'white';});
 }
 function stop(){playing=false;cancelAnimationFrame(anim);d.querySelector('[data-play]').textContent='Lire les poses';}
 function tick(now){if(!playing)return;if(now-last>140){last=now;index=(index+1)%5;draw();}anim=requestAnimationFrame(tick);}
 d.querySelector('[data-play]').onclick=()=>{if(playing){stop();return;}playing=true;last=0;d.querySelector('[data-play]').textContent='Pause';anim=requestAnimationFrame(tick);};
 let pointer=null;
 function drag(e){const r=stage.getBoundingClientRect();const clamp=v=>Math.max(0,Math.min(1,v));profile.poses[index].x=clamp((e.clientX-r.left)/r.width);profile.poses[index].y=clamp((e.clientY-r.top)/r.height);draw();}
 stage.onpointerdown=e=>{stop();pointer=e.pointerId;stage.setPointerCapture(pointer);drag(e);};
 stage.onpointermove=e=>{if(pointer===e.pointerId)drag(e);};
 stage.onpointerup=stage.onpointercancel=()=>{pointer=null;};
 d.querySelector('[data-save]').onclick=()=>{try{localStorage.setItem(key,JSON.stringify(profile));info.textContent='Profil enregistré pour ce navigateur de test.';}catch(_){info.textContent='Enregistrement indisponible. Exporte le JSON.';}};
 d.querySelector('[data-reset]').onclick=()=>{stop();profile=copy(defaults);draw();info.textContent='Valeurs initiales restaurées. Enregistre pour les conserver.';};
 d.querySelector('[data-export]').onclick=()=>{const blob=new Blob([JSON.stringify(profile,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='Shadowreach_Profil_Epee.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 const imp=document.createElement('input');imp.type='file';imp.accept='.json,application/json';imp.setAttribute('aria-label','Importer un profil JSON');imp.style.cssText='max-width:100%;font-size:12px;margin-top:6px';d.append(imp);
 imp.onchange=async()=>{try{const f=imp.files[0];if(!f||f.size>20000)throw Error();const p=JSON.parse(await f.text());if(!valid(p))throw Error();stop();profile=p;draw();info.textContent='Profil importé, visible immédiatement.';}catch(_){info.textContent='Profil JSON invalide.';}};
 const ro=typeof ResizeObserver==='function'?new ResizeObserver(draw):null;ro?.observe(stage);
 d.querySelector('[data-close]').onclick=()=>d.close();
 d.addEventListener('close',()=>{stop();ro?.disconnect();d.remove();editor=null;},{once:true});
 d.showModal();draw();
}
window.SRWeaponRig={html,open,geometry,poseFor,valid,defaults:()=>copy(defaults)};
})();