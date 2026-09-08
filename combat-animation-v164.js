/* Combat Animation V164
   Articulated 4-phase walk built from existing sprites.
   Uses one locomotion authority and preserves V163 weapon choreography.
   Visual-only: combat speed, range, hit timing, damage, rewards and saves untouched.
*/
(function(){
  "use strict";
  if(typeof drawArena!=="function"||typeof weaponHTML!=="function")return;

  const VISUAL_ATTACK=0.28;
  const baseDrawArena164=drawArena;
  const heroState={init:false,lastLogical:0,travel:0,visual:0,dir:0,phase:0,moving:false};
  const enemyState=new Map();

  function clamp01(v){return Math.max(0,Math.min(1,v));}
  function smooth01(v){v=clamp01(v);return v*v*(3-2*v);}
  function attackP(left){const n=Number(left||0);return n>0?clamp01(1-n/VISUAL_ATTACK):0;}

  function handForP(p){
    if(typeof HERO_HAND==="undefined"||!HERO_HAND.length)return{x:0.61,y:0.62,rot:24};
    if(p<0.18)return HERO_HAND[0];
    const q=clamp01((p-0.18)/0.82),n=Math.max(1,HERO_HAND.length-1);
    return HERO_HAND[1+Math.min(n-1,Math.floor(q*n))]||HERO_HAND[0];
  }
  function rangedHand(weapon,p){
    if(weapon==="arc")return{x:0.66+Math.min(1,p/0.35)*0.06,y:0.57-Math.min(1,p/0.35)*0.09,rot:-13};
    if(weapon==="arbalete")return{x:0.69,y:0.54,rot:-7};
    return{x:0.64,y:0.52,rot:-27};
  }

  function gaitPhase(st,logicalX,strideWorld,teleportWorld,active){
    if(!st.init){st.init=true;st.lastLogical=logicalX;st.visual=logicalX;st.travel=0;st.dir=0;st.phase=0;}
    const dx=logicalX-st.lastLogical;st.lastLogical=logicalX;
    if(Math.abs(dx)>teleportWorld){st.visual=logicalX;st.travel=0;st.dir=0;st.phase=0;st.moving=false;return{x:logicalX,phase:0,moving:false,teleport:true,dir:0};}
    if(Math.abs(dx)>0.0005){
      const dir=dx>0?1:-1;
      if(st.dir&&dir!==st.dir){st.travel=0;st.phase=0;}
      st.dir=dir;st.travel+=Math.abs(dx);st.phase=(st.travel/Math.max(0.5,strideWorld))%1;
    }
    const moving=Math.abs(dx)>0.0005&&active;
    st.moving=moving;
    if(moving){
      const q=st.phase*Math.PI*2;
      const slipComp=Math.sin(q)*strideWorld*0.105;
      const target=logicalX-st.dir*slipComp;
      st.visual+=(target-st.visual)*0.68;
      const maxLag=strideWorld*0.18;
      if(Math.abs(st.visual-logicalX)>maxLag)st.visual=logicalX-Math.sign(logicalX-st.visual)*maxLag;
      return{x:st.visual,phase:st.phase,moving:true,dir:st.dir};
    }
    st.visual+=(logicalX-st.visual)*0.78;
    if(Math.abs(logicalX-st.visual)<0.012)st.visual=logicalX;
    return{x:st.visual,phase:st.phase,moving:false,dir:st.dir||1};
  }

  function bodyPose(phase,profile){
    const q=phase*Math.PI*2;
    const contact=(1-Math.cos(q))*0.5;
    const liftBase=profile==="boss"?0.38:(profile==="small"?0.72:0.52);
    const leanBase=profile==="boss"?0.30:(profile==="small"?0.88:0.58);
    const compression=profile==="boss"?0.0025:0.004;
    return{lift:-contact*liftBase,lean:Math.sin(q)*leanBase,squash:1-(1-contact)*compression,contact:1-contact};
  }

  function canSplitEnemy(e){
    if(!e||e.boss||e.flying>0)return false;
    const k=String(e.type&&e.type.img||"").toLowerCase();
    return !/(mage|dragon|golem|corrompue|abyssal|chaman)/.test(k);
  }

  function makeLegClone(img,clip,dx,dy,rot,flip,z){
    const leg=img.cloneNode(false);
    leg.removeAttribute("style");
    leg.className="srWalkLeg";
    leg.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;pointer-events:none;transform-origin:50% 92%;z-index:"+z+";clip-path:"+clip+";transform:"+(flip?"scaleX(-1) ":"")+"translate("+dx.toFixed(2)+"px,"+dy.toFixed(2)+"px) rotate("+rot.toFixed(2)+"deg)";
    return leg;
  }

  function articulateLegs(unit,img,phase,size,dir,flip,intensity){
    if(!unit||!img)return;
    const frame=Math.floor(((phase%1)+1)%1*4)%4;
    const half=(phase*2)%1;
    const leftStance=phase<0.5;
    const prog=smooth01(half);
    const step=size*(0.042*(intensity||1));
    const lift=size*(0.018*(intensity||1));
    const stanceX=(0.5-half)*step*0.95*dir;
    const swingX=(-0.5+prog)*step*1.20*dir;
    const swingY=-Math.sin(prog*Math.PI)*lift;
    const swingRot=Math.sin((prog-0.5)*Math.PI)*2.2*(intensity||1)*dir;
    const leftX=leftStance?stanceX:swingX;
    const rightX=leftStance?swingX:stanceX;
    const leftY=leftStance?0:swingY;
    const rightY=leftStance?swingY:0;
    const leftRot=leftStance?0:swingRot;
    const rightRot=leftStance?swingRot:0;

    // Four explicit phases are exposed as a data marker for debugging/tuning.
    unit.dataset.walkFrame=String(frame);
    img.style.clipPath="inset(0 0 41% 0)";
    img.style.zIndex="2";
    img.style.position="relative";

    const leftClip="polygon(0 56%,54% 56%,54% 100%,0 100%)";
    const rightClip="polygon(46% 56%,100% 56%,100% 100%,46% 100%)";
    unit.appendChild(makeLegClone(img,leftClip,leftX,leftY,leftRot,flip,1));
    unit.appendChild(makeLegClone(img,rightClip,rightX,rightY,rightRot,flip,1));
  }

  weaponHTML=function(weapon,color,attacking,t,size){
    const art=ASSETS["weapon_"+weapon];
    const left=attacking&&typeof combat!=="undefined"&&combat?Number(combat.heroAttacking||0):0;
    const p=attackP(left),ranged=RANGED_IDS.includes(weapon);
    const hand=attacking&&ranged?rangedHand(weapon,p):handForP(p);
    const walkSway=!attacking&&heroState.moving?Math.sin(heroState.phase*Math.PI*2)*1.6:Math.sin(t*0.0034)*1.0;
    if(!art)return staffHTML(color,attacking?45:walkSway,size);
    const h=size*(ranged?0.70:0.64),w=h*(WEAPON_ASPECT[weapon]||0.4);
    let rot=Number(hand.rot||0),tx=0,ty=0,sx=1,sy=1;
    if(attacking){
      if(weapon==="arc"){
        const raise=Math.min(1,p/0.30),draw=p<0.62?clamp01((p-0.24)/0.38):Math.max(0,1-(p-0.62)/0.22);
        rot=-20+raise*8;sx=1-draw*0.065;sy=1+draw*0.05;tx=-draw*size*0.035;ty=-raise*size*0.025;
      }else if(weapon==="arbalete"){
        const aim=Math.min(1,p/0.35),recoil=Math.max(0,1-Math.abs(p-0.62)/0.13);
        rot=-14+aim*6+recoil*5;tx=recoil*size*0.025;ty=-aim*size*0.018;
      }else if(weapon==="baton"){
        const cast=Math.sin(Math.min(1,p/0.78)*Math.PI);rot=-38+p*28;ty=-cast*size*0.045;tx=cast*size*0.018;
      }else{
        const q=clamp01((p-0.16)/0.70),strike=Math.sin(q*Math.PI);
        const extra=weapon==="dague"?16:(weapon==="hache"?30:(weapon==="masse"?26:34));
        rot=hand.rot+(q<0.43?-extra*(1-q/0.43):extra*strike*0.16);tx=strike*size*0.022;
      }
    }else rot=hand.rot*(ranged?0.45:1)+walkSway;
    return '<div class="srWeapon" style="position:absolute;left:'+(hand.x*size-w/2+tx).toFixed(1)+'px;top:'+(hand.y*size-h+ty).toFixed(1)+'px;width:'+w.toFixed(1)+'px;height:'+h.toFixed(1)+'px;transform-origin:50% 100%;transform:rotate('+rot.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')"><img src="'+art+'" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 5px '+color+'99)"></div>';
  };

  if(typeof slashHTML==="function")slashHTML=function(attacking,size){
    const p=attackP(attacking),q=clamp01((p-0.18)/0.66),peak=Math.sin(q*Math.PI);if(peak<=0.01)return"";
    const d=size*(0.92+q*0.52),m="url("+ASSETS.vfx_slash+") center/contain no-repeat";
    return '<div class="slash" style="left:'+(size*0.88-d/2).toFixed(1)+'px;top:'+(size*0.44-d/2).toFixed(1)+'px;width:'+d.toFixed(1)+'px;height:'+d.toFixed(1)+'px;opacity:'+(peak*0.92).toFixed(3)+';transform:rotate('+(-58+q*122).toFixed(0)+'deg) scaleX(-1);-webkit-mask:'+m+';mask:'+m+'"></div>';
  };
  if(typeof releaseHTML==="function")releaseHTML=function(attacking,size,col){
    const p=attackP(attacking),release=Math.max(0,1-Math.abs(p-0.62)/0.13);if(release<=0.01)return"";
    const hand=rangedHand((typeof D!=="undefined"&&D.weapon)||"arc",p),d=size*(0.20+release*0.32),m="url("+ASSETS.vfx_spark+") center/contain no-repeat";
    return '<div class="slash" style="left:'+(hand.x*size-d/2).toFixed(1)+'px;top:'+(hand.y*size-d/2-size*0.08).toFixed(1)+'px;width:'+d.toFixed(1)+'px;height:'+d.toFixed(1)+'px;opacity:'+(release*0.92).toFixed(3)+';background:'+col+';-webkit-mask:'+m+';mask:'+m+'"></div>';
  };

  function isHeroUnit(unit){
    if(!unit)return false;
    if(String(unit.style.zIndex||"")==="4")return true;
    const hp=unit.querySelector(":scope > .hpMini");
    return!!(hp&&!hp.classList.contains("foe"));
  }

  drawArena=function(){
    baseDrawArena164();
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
        const logical=Number(c.heroX||0),strideWorld=Math.max(5.8,size*0.155)/Math.max(0.01,scale);
        const active=!(c.heroAttacking>0)&&!(c.heroHit>0)&&!(c.heroStun>0);
        const gait=gaitPhase(heroState,logical,strideWorld,Math.max(18,strideWorld*2.5),active);
        unit.style.left=(gait.x*scale-size/2).toFixed(2)+"px";
        if(img&&active&&gait.moving){
          const p=bodyPose(gait.phase,"hero");
          unit.style.transform="translate(0px,0px)";
          img.style.transform="translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          articulateLegs(unit,img,gait.phase,size,gait.dir||1,false,1);
          const shadow=unit.querySelector(":scope > .ushadow");
          if(shadow){shadow.style.transform="scaleX("+(0.968+p.contact*0.032).toFixed(3)+")";shadow.style.opacity=(0.54+p.contact*0.08).toFixed(3);}
        }
        if(img&&c.heroAttacking>0&&RANGED_IDS.includes(D.weapon)){
          if(ASSETS.hero)img.src=ASSETS.hero;
          const p=attackP(c.heroAttacking);let lean=0,y=0,sx=1,sy=1;
          if(D.weapon==="arc"){
            const draw=p<0.62?clamp01((p-0.20)/0.42):Math.max(0,1-(p-0.62)/0.28);lean=-2.2+draw*3.2;y=-draw*1.2;sx=1-draw*0.012;sy=1+draw*0.008;
          }else if(D.weapon==="arbalete"){
            const aim=Math.min(1,p/0.35),recoil=Math.max(0,1-Math.abs(p-0.62)/0.14);lean=-1.4+aim*1.8-recoil*2.5;y=-aim*0.7;
          }else{
            const cast=Math.sin(Math.min(1,p/0.82)*Math.PI);lean=-2+cast*3.2;y=-cast*1.8;sy=1+cast*0.012;
          }
          img.style.transform="translateY("+y.toFixed(2)+"px) rotate("+lean.toFixed(2)+"deg) scale("+sx.toFixed(3)+","+sy.toFixed(3)+")";
        }
      }

      const rendered=c.enemies.filter(e=>e.alive||e.hitFlash>0);
      rendered.forEach(e=>{
        const unit=units[ui++];if(!unit)return;
        const img=unit.querySelector(":scope > img");if(!img)return;
        const size=parseFloat(unit.style.width)||64,profile=e.boss?"boss":(e.small?"small":"normal");
        let st=enemyState.get(e.id);if(!st){st={init:false,lastLogical:0,travel:0,visual:0,dir:0,phase:0,moving:false};enemyState.set(e.id,st);}
        const stridePx=e.boss?Math.max(8,size*0.17):(e.small?Math.max(4.5,size*0.21):Math.max(6,size*0.16));
        const strideWorld=stridePx/Math.max(0.01,scale),logical=Number(e.x||0);
        const active=!(e.attacking>0)&&!(e.hitFlash>0)&&!(e.flying>0)&&!(e.stagger>0)&&!(e.vanish>0);
        const gait=gaitPhase(st,logical,strideWorld,Math.max(20,strideWorld*(e.boss?2.2:2.8)),active);
        unit.style.left=(gait.x*scale-size/2).toFixed(2)+"px";
        if(active&&gait.moving){
          const p=bodyPose(gait.phase,profile);
          unit.style.transform="translate(0px,0px)";
          img.style.transform="scaleX(-1) translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          if(canSplitEnemy(e))articulateLegs(unit,img,gait.phase,size,gait.dir||-1,true,e.small?0.82:0.92);
          const shadow=unit.querySelector(":scope > .ushadow");
          if(shadow){const b=e.boss?0.985:0.972,r=e.boss?0.015:0.028;shadow.style.transform="scaleX("+(b+p.contact*r).toFixed(3)+")";shadow.style.opacity=(0.52+p.contact*0.09).toFixed(3);}
        }
      });

      if(enemyState.size>32){const live=new Set(c.enemies.map(e=>e.id));Array.from(enemyState.keys()).forEach(id=>{if(!live.has(id))enemyState.delete(id);});}
    }catch(err){
      if(!window.__srWalk164Error){window.__srWalk164Error=true;console.warn("combat walk V164",err);}
    }
  };

  const style=document.createElement("style");
  style.id="combat-animation-v164-style";
  style.textContent=".unit,.unit>img,.ushadow,.srWalkLeg{transition:none!important}.unit>img{transform-origin:50% 92%;will-change:transform}.unit,.srWeapon,.ushadow,.srWalkLeg{will-change:transform}.ushadow{transform-origin:50% 50%}.srWalkLeg{image-rendering:auto}";
  document.head.appendChild(style);
})();