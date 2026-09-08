/* Combat Walk Stability V165
   Stabilises V164 articulated walk without touching combat simulation.
   - profile-specific lower-body masks for validated humanoids
   - weapon layering guarantee
   - pseudo-element leg rendering to avoid per-frame DOM insertion/layout for leg clones
   Visual-only: speed, range, damage, cooldowns, rewards, progression and saves untouched.
*/
(function(){
  "use strict";
  if(typeof drawArena!=="function")return;

  const baseDraw165=drawArena;
  const PROFILES={
    hero:{upperBottom:40,splitTop:58,leftEnd:53,rightStart:47,step:0.040,lift:0.017},
    goblin:{upperBottom:43,splitTop:60,leftEnd:55,rightStart:45,step:0.036,lift:0.015},
    orc:{upperBottom:39,splitTop:57,leftEnd:54,rightStart:46,step:0.038,lift:0.014},
    skeleton:{upperBottom:42,splitTop:58,leftEnd:51,rightStart:49,step:0.043,lift:0.020}
  };

  function profileForEnemy(e){
    const k=String(e&&e.type&&e.type.img||"").toLowerCase();
    if(k.includes("goblin"))return PROFILES.goblin;
    if(k.includes("orc"))return PROFILES.orc;
    if(k.includes("skeleton")||k.includes("squelette"))return PROFILES.skeleton;
    return null;
  }
  function isHeroUnit(unit){
    if(!unit)return false;
    if(String(unit.style.zIndex||"")==="4")return true;
    const hp=unit.querySelector(":scope > .hpMini");
    return!!(hp&&!hp.classList.contains("foe"));
  }
  function px(n){return Number(n||0).toFixed(2)+"px";}
  function applyPseudo(unit,img,profile,frame,dir,flip){
    const size=parseFloat(unit.style.width)||64;
    const step=size*profile.step;
    const lift=size*profile.lift;
    const f=((Number(frame)||0)%4+4)%4;
    const phase=[
      {lx:-0.15,ly:0,lr:0,rx:0.52,ry:-0.55,rr:-1.5},
      {lx:-0.35,ly:0,lr:0,rx:0.18,ry:-0.18,rr:-0.5},
      {lx:0.52,ly:-0.55,lr:1.5,rx:-0.15,ry:0,rr:0},
      {lx:0.18,ly:-0.18,lr:0.5,rx:-0.35,ry:0,rr:0}
    ][f];
    const s=dir<0?-1:1;
    unit.classList.add("srWalkPseudo");
    unit.style.setProperty("--sr-sprite",'url("'+String(img.src).replace(/"/g,"%22")+'")');
    unit.style.setProperty("--sr-upper-bottom",profile.upperBottom+"%");
    unit.style.setProperty("--sr-split-top",profile.splitTop+"%");
    unit.style.setProperty("--sr-left-end",profile.leftEnd+"%");
    unit.style.setProperty("--sr-right-start",profile.rightStart+"%");
    unit.style.setProperty("--sr-lx",px(phase.lx*step*s));
    unit.style.setProperty("--sr-ly",px(phase.ly*lift));
    unit.style.setProperty("--sr-lr",(phase.lr*s).toFixed(2)+"deg");
    unit.style.setProperty("--sr-rx",px(phase.rx*step*s));
    unit.style.setProperty("--sr-ry",px(phase.ry*lift));
    unit.style.setProperty("--sr-rr",(phase.rr*s).toFixed(2)+"deg");
    unit.style.setProperty("--sr-flip",flip?"scaleX(-1)":"scaleX(1)");
    img.style.clipPath="inset(0 0 "+profile.upperBottom+"% 0)";
    img.style.position="relative";
    img.style.zIndex="2";
  }
  function disablePseudo(unit,img){
    unit.classList.remove("srWalkPseudo");
    if(img){img.style.clipPath="";img.style.zIndex="";img.style.position="";}
  }

  drawArena=function(){
    /* V164 creates two detached leg clones each frame. Suppress their actual DOM
       insertion; V165 renders the same idea with ::before/::after instead. */
    const oldAppend=Element.prototype.appendChild;
    Element.prototype.appendChild=function(node){
      if(node&&node.classList&&node.classList.contains("srWalkLeg"))return node;
      return oldAppend.call(this,node);
    };
    try{baseDraw165();}finally{Element.prototype.appendChild=oldAppend;}

    try{
      const c=typeof combat!=="undefined"?combat:null;
      if(!c||!arenaNodes||!arenaNodes.layer)return;
      const units=Array.from(arenaNodes.layer.querySelectorAll(":scope > .unit"));
      if(!units.length)return;
      let ui=0;
      const hero=units[0];
      if(isHeroUnit(hero)){
        ui=1;
        const img=hero.querySelector(":scope > img");
        const moving=hero.dataset.walkFrame!==undefined&&c.heroAttacking<=0&&c.heroHit<=0&&!(c.heroStun>0);
        if(moving&&img)applyPseudo(hero,img,PROFILES.hero,hero.dataset.walkFrame,1,false);
        else disablePseudo(hero,img);
        const weapon=hero.querySelector(":scope > .srWeapon");
        if(weapon){weapon.style.zIndex="6";weapon.style.position="absolute";}
        const aura=hero.querySelector(":scope > .aura");if(aura)aura.style.zIndex="0";
        const hp=hero.querySelector(":scope > .hpMini");if(hp)hp.style.zIndex="8";
      }

      const rendered=c.enemies.filter(e=>e.alive||e.hitFlash>0);
      rendered.forEach(e=>{
        const unit=units[ui++];if(!unit)return;
        const img=unit.querySelector(":scope > img");if(!img)return;
        const p=profileForEnemy(e);
        const active=p&&unit.dataset.walkFrame!==undefined&&!(e.attacking>0)&&!(e.hitFlash>0)&&!(e.flying>0)&&!(e.stagger>0)&&!(e.vanish>0);
        if(active)applyPseudo(unit,img,p,unit.dataset.walkFrame,-1,true);
        else disablePseudo(unit,img);
      });
    }catch(err){
      if(typeof window!=="undefined")window.__srWalkV165Error=String(err&&err.message||err);
    }
  };

  const style=document.createElement("style");
  style.id="combat-walk-stability-v165-style";
  style.textContent=[
    ".srWeapon{z-index:6!important}",
    ".srWalkPseudo::before,.srWalkPseudo::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background-image:var(--sr-sprite);background-size:contain;background-position:center;background-repeat:no-repeat;transform-origin:50% 92%;will-change:transform}",
    ".srWalkPseudo::before{clip-path:polygon(0 var(--sr-split-top),var(--sr-left-end) var(--sr-split-top),var(--sr-left-end) 100%,0 100%);transform:var(--sr-flip) translate(var(--sr-lx),var(--sr-ly)) rotate(var(--sr-lr))}",
    ".srWalkPseudo::after{clip-path:polygon(var(--sr-right-start) var(--sr-split-top),100% var(--sr-split-top),100% 100%,var(--sr-right-start) 100%);transform:var(--sr-flip) translate(var(--sr-rx),var(--sr-ry)) rotate(var(--sr-rr))}",
    "@media (prefers-reduced-motion:reduce){.srWalkPseudo::before,.srWalkPseudo::after{will-change:auto}}"
  ].join("\n");
  document.head.appendChild(style);
})();