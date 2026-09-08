/* Combat Animation V163
   Final consolidated locomotion + weapon choreography.
   Visual-only: logical movement speed, range, hit timing, damage, cooldowns,
   rewards, progression and saves are untouched.
*/
(function(){
  "use strict";
  if (typeof drawArena !== "function" || typeof weaponHTML !== "function") return;

  const VISUAL_ATTACK = .28;
  const baseDrawArena163 = drawArena;
  const heroState = {init:false,lastLogical:0,travel:0,visual:0,dir:0,phase:0};
  const enemyState = new Map();

  function clamp01(v){ return Math.max(0,Math.min(1,v)); }
  function smooth01(v){ v=clamp01(v); return v*v*(3-2*v); }
  function attackP(left){ const n=Number(left||0); return n>0?clamp01(1-n/VISUAL_ATTACK):0; }

  function handForP(p){
    if (typeof HERO_HAND === "undefined" || !HERO_HAND.length) return {x:.61,y:.62,rot:24};
    if (p<.18) return HERO_HAND[0];
    const q=clamp01((p-.18)/.82), n=Math.max(1,HERO_HAND.length-1);
    return HERO_HAND[1+Math.min(n-1,Math.floor(q*n))]||HERO_HAND[0];
  }
  function rangedHand(weapon,p){
    if(weapon==="arc") return {x:.66+Math.min(1,p/.35)*.06,y:.57-Math.min(1,p/.35)*.09,rot:-13};
    if(weapon==="arbalete") return {x:.69,y:.54,rot:-7};
    return {x:.64,y:.52,rot:-27};
  }

  function gaitPhase(st,logicalX,strideWorld,teleportWorld,active){
    if(!st.init){ st.init=true; st.lastLogical=logicalX; st.visual=logicalX; st.travel=0; st.dir=0; st.phase=0; }
    const dx=logicalX-st.lastLogical; st.lastLogical=logicalX;
    if(Math.abs(dx)>teleportWorld){ st.visual=logicalX; st.travel=0; st.dir=0; st.phase=0; return {x:logicalX,phase:0,moving:false,teleport:true}; }

    if(Math.abs(dx)>.0005){
      const dir=dx>0?1:-1;
      if(st.dir && dir!==st.dir){ st.travel=0; st.phase=0; }
      st.dir=dir; st.travel+=Math.abs(dx);
      st.phase=(st.travel/Math.max(.5,strideWorld))%1;
    }

    const moving=Math.abs(dx)>.0005 && active;
    if(moving){
      /* Keep centre-of-mass continuous. A small periodic offset reduces apparent
         foot slip at contact, but never freezes the whole body. */
      const q=st.phase*Math.PI*2;
      const contactWave=(1-Math.cos(q))*.5;          // 0 contact, 1 mid-swing
      const slipComp=Math.sin(q)*strideWorld*.075;  // subtle, bounded compensation
      const target=logicalX-st.dir*slipComp;
      st.visual += (target-st.visual)*.62;
      const maxLag=strideWorld*.22;
      if(Math.abs(st.visual-logicalX)>maxLag) st.visual=logicalX-Math.sign(logicalX-st.visual)*maxLag;
      return {x:st.visual,phase:st.phase,moving:true,contact:1-contactWave};
    }

    /* When stopping / entering attack, converge quickly but smoothly to logical x
       so no visible snap occurs before attack lunge/recoil takes over. */
    st.visual += (logicalX-st.visual)*.72;
    if(Math.abs(logicalX-st.visual)<.015) st.visual=logicalX;
    return {x:st.visual,phase:st.phase,moving:false,contact:1};
  }

  function bodyPose(phase,profile){
    const q=phase*Math.PI*2;
    const contact=(1-Math.cos(q))*.5;
    const liftBase=profile==="boss"?.42:profile==="small"?.82:.58;
    const leanBase=profile==="boss"?.35:profile==="small"?1.0:.66;
    const compression=profile==="boss"?.003:.0045;
    const push=Math.sin(q);
    return {
      lift:-contact*liftBase,
      lean:push*leanBase,
      squash:1-(1-contact)*compression,
      contact:1-contact
    };
  }

  weaponHTML=function(weapon,color,attacking,t,size){
    const art=ASSETS["weapon_"+weapon];
    const left=attacking&&typeof combat!=="undefined"&&combat?Number(combat.heroAttacking||0):0;
    const p=attackP(left), ranged=RANGED_IDS.includes(weapon);
    const hand=attacking&&ranged?rangedHand(weapon,p):handForP(p);
    const walkSway=!attacking&&heroState.init?Math.sin(heroState.phase*Math.PI*2)*1.5:Math.sin(t*.0034)*1.2;
    if(!art) return staffHTML(color,attacking?45:walkSway,size);
    const h=size*(ranged?.70:.64), w=h*(WEAPON_ASPECT[weapon]||.4);
    let rot=Number(hand.rot||0),tx=0,ty=0,sx=1,sy=1;
    if(attacking){
      if(weapon==="arc"){
        const raise=Math.min(1,p/.30), draw=p<.62?clamp01((p-.24)/.38):Math.max(0,1-(p-.62)/.22);
        rot=-20+raise*8; sx=1-draw*.065; sy=1+draw*.05; tx=-draw*size*.035; ty=-raise*size*.025;
      }else if(weapon==="arbalete"){
        const aim=Math.min(1,p/.35), recoil=Math.max(0,1-Math.abs(p-.62)/.13);
        rot=-14+aim*6+recoil*5; tx=recoil*size*.025; ty=-aim*size*.018;
      }else if(weapon==="baton"){
        const cast=Math.sin(Math.min(1,p/.78)*Math.PI); rot=-38+p*28; ty=-cast*size*.045; tx=cast*size*.018;
      }else{
        const q=clamp01((p-.16)/.70), strike=Math.sin(q*Math.PI);
        const extra=weapon==="dague"?16:weapon==="hache"?30:weapon==="masse"?26:34;
        rot=hand.rot+(q<.43?-extra*(1-q/.43):extra*strike*.16); tx=strike*size*.022;
      }
    }else rot=hand.rot*(ranged?.45:1)+walkSway;
    return '<div class="srWeapon" style="position:absolute;left:'+(hand.x*size-w/2+tx).toFixed(1)+'px;top:'+(hand.y*size-h+ty).toFixed(1)+'px;width:'+w.toFixed(1)+'px;height:'+h.toFixed(1)+'px;transform-origin:50% 100%;transform:rotate('+rot.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')"><img src="'+art+'" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 5px '+color+'99)"></div>';
  };

  if(typeof slashHTML==="function") slashHTML=function(attacking,size){
    const p=attackP(attacking),q=clamp01((p-.18)/.66),peak=Math.sin(q*Math.PI); if(peak<=.01)return "";
    const d=size*(.92+q*.52),m="url("+ASSETS.vfx_slash+") center/contain no-repeat";
    return '<div class="slash" style="left:'+(size*.88-d/2).toFixed(1)+'px;top:'+(size*.44-d/2).toFixed(1)+'px;width:'+d.toFixed(1)+'px;height:'+d.toFixed(1)+'px;opacity:'+(peak*.92).toFixed(3)+';transform:rotate('+(-58+q*122).toFixed(0)+'deg) scaleX(-1);-webkit-mask:'+m+';mask:'+m+'"></div>';
  };
  if(typeof releaseHTML==="function") releaseHTML=function(attacking,size,col){
    const p=attackP(attacking),release=Math.max(0,1-Math.abs(p-.62)/.13); if(release<=.01)return "";
    const hand=rangedHand((typeof D!=="undefined"&&D.weapon)||"arc",p),d=size*(.20+release*.32),m="url("+ASSETS.vfx_spark+") center/contain no-repeat";
    return '<div class="slash" style="left:'+(hand.x*size-d/2).toFixed(1)+'px;top:'+(hand.y*size-d/2-size*.08).toFixed(1)+'px;width:'+d.toFixed(1)+'px;height:'+d.toFixed(1)+'px;opacity:'+(release*.92).toFixed(3)+';background:'+col+';-webkit-mask:'+m+';mask:'+m+'"></div>';
  };

  function isHeroUnit(unit){
    if(!unit)return false;
    if(String(unit.style.zIndex||"")==="4")return true;
    const hp=unit.querySelector(":scope > .hpMini");
    return !!(hp&&!hp.classList.contains("foe"));
  }

  drawArena=function(){
    baseDrawArena163();
    try{
      const c=typeof combat!=="undefined"?combat:null;
      if(!c||!arenaEl||!arenaNodes||!arenaNodes.layer)return;
      const scale=(arenaEl.clientWidth||360)/AW;
      const units=Array.from(arenaNodes.layer.querySelectorAll(":scope > .unit"));
      if(!units.length)return;
      let ui=0;
      const maybeHero=units[0];
      if(isHeroUnit(maybeHero)){
        ui=1;
        const unit=maybeHero,img=unit.querySelector(":scope > img"),size=parseFloat(unit.style.width)||64;
        const logical=Number(c.heroX||0),strideWorld=Math.max(5.8,size*.155)/Math.max(.01,scale);
        const active=!(c.heroAttacking>0)&&!(c.heroHit>0)&&!(c.heroStun>0);
        const gait=gaitPhase(heroState,logical,strideWorld,Math.max(18,strideWorld*2.5),active);
        unit.style.left=(gait.x*scale-size/2).toFixed(2)+"px";
        if(img&&active&&gait.moving){
          const p=bodyPose(gait.phase,"hero");
          unit.style.transform="translate(0px,0px)";
          img.style.transform="translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          const shadow=unit.querySelector(":scope > .ushadow");
          if(shadow){shadow.style.transform="scaleX("+(.968+p.contact*.032).toFixed(3)+")";shadow.style.opacity=(.54+p.contact*.08).toFixed(3);}
        }
        if(img&&c.heroAttacking>0&&RANGED_IDS.includes(D.weapon)){
          if(ASSETS.hero)img.src=ASSETS.hero;
          const p=attackP(c.heroAttacking); let lean=0,y=0,sx=1,sy=1;
          if(D.weapon==="arc"){
            const draw=p<.62?clamp01((p-.20)/.42):Math.max(0,1-(p-.62)/.28); lean=-2.2+draw*3.2;y=-draw*1.2;sx=1-draw*.012;sy=1+draw*.008;
          }else if(D.weapon==="arbalete"){
            const aim=Math.min(1,p/.35),recoil=Math.max(0,1-Math.abs(p-.62)/.14);lean=-1.4+aim*1.8-recoil*2.5;y=-aim*.7;
          }else{
            const cast=Math.sin(Math.min(1,p/.82)*Math.PI);lean=-2+cast*3.2;y=-cast*1.8;sy=1+cast*.012;
          }
          img.style.transform="translateY("+y.toFixed(2)+"px) rotate("+lean.toFixed(2)+"deg) scale("+sx.toFixed(3)+","+sy.toFixed(3)+")";
        }
      }

      const rendered=c.enemies.filter(e=>e.alive||e.hitFlash>0);
      rendered.forEach(e=>{
        const unit=units[ui++]; if(!unit)return;
        const img=unit.querySelector(":scope > img"); if(!img)return;
        const size=parseFloat(unit.style.width)||64,profile=e.boss?"boss":e.small?"small":"normal";
        let st=enemyState.get(e.id); if(!st){st={init:false,lastLogical:0,travel:0,visual:0,dir:0,phase:0};enemyState.set(e.id,st);}
        const stridePx=e.boss?Math.max(8,size*.17):e.small?Math.max(4.5,size*.21):Math.max(6,size*.16);
        const strideWorld=stridePx/Math.max(.01,scale),logical=Number(e.x||0);
        const active=!(e.attacking>0)&&!(e.hitFlash>0)&&!(e.flying>0)&&!(e.stagger>0)&&!(e.vanish>0);
        const gait=gaitPhase(st,logical,strideWorld,Math.max(20,strideWorld*(e.boss?2.2:2.8)),active);
        unit.style.left=(gait.x*scale-size/2).toFixed(2)+"px";
        if(active&&gait.moving){
          const p=bodyPose(gait.phase,profile);
          unit.style.transform="translate(0px,0px)";
          img.style.transform="scaleX(-1) translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          const shadow=unit.querySelector(":scope > .ushadow");
          if(shadow){const b=e.boss?.985:.972,r=e.boss?.015:.028;shadow.style.transform="scaleX("+(b+p.contact*r).toFixed(3)+")";shadow.style.opacity=(.52+p.contact*.09).toFixed(3);}
        }
      });

      if(enemyState.size>32){const live=new Set(c.enemies.map(e=>e.id));Array.from(enemyState.keys()).forEach(id=>{if(!live.has(id))enemyState.delete(id);});}
    }catch(_){}
  };

  const style=document.createElement("style");
  style.id="combat-animation-v163-style";
  style.textContent=".unit,.unit>img,.ushadow{transition:none!important}.unit>img{transform-origin:50% 92%;will-change:transform}.unit,.srWeapon,.ushadow{will-change:transform}.ushadow{transform-origin:50% 50%}";
  document.head.appendChild(style);
})();