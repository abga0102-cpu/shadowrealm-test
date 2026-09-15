/* Combat Animation V169 · V335 presentation refresh
   Consolidated locomotion + planted-foot articulated walk + weapon choreography.
   Adds canonical worn-equipment presentation, secondary hero motion and readable
   combat poses without changing combat speed, range, damage, cooldowns, rewards,
   progression or saves.
*/
(function(){
  "use strict";
  if(typeof drawArena!=="function"||typeof weaponHTML!=="function")return;

  const VISUAL_ATTACK=0.28;
  const baseDraw169=drawArena;
  const heroState={init:false,lastLogical:0,travel:0,visual:0,dir:0,phase:0,moving:false,deathAt:0,victoryAt:0};
  const enemyState=new Map();
  const PROFILES={
    hero:{upperBottom:40,splitTop:58,leftEnd:53,rightStart:47,step:0.040,lift:0.017},
    goblin:{upperBottom:43,splitTop:60,leftEnd:55,rightStart:45,step:0.036,lift:0.015},
    orc:{upperBottom:39,splitTop:57,leftEnd:54,rightStart:46,step:0.038,lift:0.014},
    skeleton:{upperBottom:42,splitTop:58,leftEnd:51,rightStart:49,step:0.043,lift:0.020}
  };

  function clamp01(v){return Math.max(0,Math.min(1,v));}
  function smooth01(v){v=clamp01(v);return v*v*(3-2*v);}
  function attackP(left){const n=Number(left||0);return n>0?clamp01(1-n/VISUAL_ATTACK):0;}
  function profileForEnemy(e,img){
    const t=e&&e.type||{};
    const k=[t.img,t.id,t.key,t.name,e&&e.img,e&&e.key,e&&e.name,e&&e.kind,e&&e.sprite,img&&img.src]
      .filter(Boolean).join(" ").toLowerCase();
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
    if(Math.abs(dx)>teleportWorld){st.visual=logicalX;st.travel=0;st.dir=0;st.phase=0;st.moving=false;return{x:logicalX,phase:0,moving:false,dir:0,teleport:true};}
    if(Math.abs(dx)>0.0005){
      const dir=dx>0?1:-1;
      if(st.dir&&dir!==st.dir){st.travel=0;st.phase=0;}
      st.dir=dir;st.travel+=Math.abs(dx);st.phase=(st.travel/Math.max(0.5,strideWorld))%1;
    }
    const moving=Math.abs(dx)>0.0005&&active;st.moving=moving;
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
    const q=phase*Math.PI*2,contact=(1-Math.cos(q))*0.5;
    const liftBase=profile==="boss"?0.38:(profile==="small"?0.72:0.52);
    const leanBase=profile==="boss"?0.30:(profile==="small"?0.88:0.58);
    const compression=profile==="boss"?0.0025:0.004;
    return{lift:-contact*liftBase,lean:Math.sin(q)*leanBase,squash:1-(1-contact)*compression,contact:1-contact};
  }
  function px(n){return Number(n||0).toFixed(2)+"px";}
  function disableLegs(unit,img){
    unit.classList.remove("srWalkPseudo169");
    if(img){img.style.clipPath="";img.style.zIndex="";img.style.position="";}
  }
  function footCycle(phase,offset,step,lift){
    const u=(phase+offset)%1;
    const stanceEnd=0.58;
    if(u<stanceEnd){
      const p=u/stanceEnd;
      const planted=smooth01(p);
      return{x:(0.46-planted*0.92)*step,y:0,rot:0};
    }
    const p=smooth01((u-stanceEnd)/(1-stanceEnd));
    const arc=Math.sin(p*Math.PI);
    const rot=Math.sin(p*Math.PI*2)*2.2;
    return{x:(-0.46+p*0.92)*step,y:-arc*lift,rot:rot};
  }
  function articulate(unit,img,phase,size,dir,flip,profile){
    if(!unit||!img||!profile)return;
    const localDir=dir<0?-1:1;
    const step=size*profile.step,lift=size*profile.lift;
    const left=footCycle(phase,0,step,lift);
    const right=footCycle(phase,0.5,step,lift);
    const lx=left.x*localDir,rx=right.x*localDir;
    const lr=left.rot*localDir,rr=right.rot*localDir;
    unit.classList.add("srWalkPseudo169");
    unit.style.setProperty("--sr-sprite",'url("'+String(img.src).replace(/"/g,"%22")+'")');
    unit.style.setProperty("--sr-split-top",profile.splitTop+"%");
    unit.style.setProperty("--sr-left-end",profile.leftEnd+"%");
    unit.style.setProperty("--sr-right-start",profile.rightStart+"%");
    unit.style.setProperty("--sr-lx",px(lx));unit.style.setProperty("--sr-ly",px(left.y));unit.style.setProperty("--sr-lr",lr.toFixed(2)+"deg");
    unit.style.setProperty("--sr-rx",px(rx));unit.style.setProperty("--sr-ry",px(right.y));unit.style.setProperty("--sr-rr",rr.toFixed(2)+"deg");
    unit.style.setProperty("--sr-flip",flip?"scaleX(-1)":"scaleX(1)");
    img.style.clipPath="inset(0 0 "+profile.upperBottom+"% 0)";img.style.position="relative";img.style.zIndex="2";
  }

  /* ---- canonical worn-equipment visuals ---------------------------------
     V1 used to replace the painted hero with a CSS mannequin. That bridge was
     correctly retired. V335 keeps the real hero sprite visible and adds one
     lightweight SVG overlay whose slot shapes are derived from S.equipped.
     Weapon art remains owned by weaponHTML, so all eight worn slots are visible
     without introducing a second equipment renderer or changing item data. */
  function worn(slot){
    try{return typeof S!=="undefined"&&S&&S.equipped?S.equipped[slot]||null:null;}catch(_){return null;}
  }
  function gearColor(it,fallback){
    try{return it&&typeof RARITY!=="undefined"&&RARITY[it.rarity]&&RARITY[it.rarity].c?RARITY[it.rarity].c:fallback;}catch(_){return fallback;}
  }
  function gearRank(it){
    try{return it&&typeof equipRank==="function"?Math.max(0,equipRank(it.rarity)):0;}catch(_){return 0;}
  }
  function gearClass(it){
    const r=gearRank(it);
    return "srGearPart169 "+(r>=7?"srGearDivine169":r>=5?"srGearEpic169":r>=3?"srGearRare169":"srGearBase169");
  }
  function gearStyle(it,fallback){return "--gear:"+gearColor(it,fallback)+";--gear-op:"+(0.68+Math.min(0.24,gearRank(it)*0.025)).toFixed(2);}
  function gearGroup(slot,it,shape,fallback){
    if(!it)return"";
    return '<g data-slot="'+slot+'" class="'+gearClass(it)+'" style="'+gearStyle(it,fallback)+'">'+shape+'</g>';
  }
  function heroGearSVG(){
    const helm=worn("casque"),armor=worn("armure"),gloves=worn("gants"),boots=worn("bottes"),belt=worn("ceinture"),neck=worn("collier"),ring=worn("anneau");
    if(!helm&&!armor&&!gloves&&!boots&&!belt&&!neck&&!ring)return"";
    const armorShape='<path class="srGearFill169" d="M31 31 L41 27 L50 31 L59 27 L69 31 L74 42 L69 62 L31 62 L26 42 Z"/><path class="srGearHi169" d="M36 34 L50 30 L64 34 L60 55 L50 59 L40 55 Z"/><path class="srGearEdge169" d="M50 31 L50 59 M31 39 L69 39"/>';
    const helmShape='<path class="srGearFill169" d="M34 22 L35 11 L42 5 L50 2 L58 5 L65 11 L66 22 L60 29 L55 24 L45 24 L40 29 Z"/><path class="srGearHi169" d="M39 12 L50 6 L61 12 L59 17 L41 17 Z"/><path class="srGearEdge169" d="M50 6 L50 22 M39 18 L61 18"/>';
    const gloveShape='<path class="srGearFill169" d="M20 51 L29 50 L32 59 L28 69 L20 67 L17 59 Z"/><path class="srGearFill169" d="M80 51 L71 50 L68 59 L72 69 L80 67 L83 59 Z"/><path class="srGearEdge169" d="M20 57 L30 57 M70 57 L80 57"/>';
    const bootShape='<path class="srGearFill169" d="M32 77 L44 77 L45 90 L42 98 L27 98 L29 91 Z"/><path class="srGearFill169" d="M56 77 L68 77 L71 91 L73 98 L58 98 L55 90 Z"/><path class="srGearHi169" d="M33 81 L43 81 L42 88 L31 88 Z M57 81 L67 81 L69 88 L58 88 Z"/>';
    const beltShape='<path class="srGearFill169" d="M30 58 L70 58 L69 65 L31 65 Z"/><rect class="srGearHi169" x="45" y="57" width="10" height="9" rx="2"/><rect class="srGearEdge169" x="47.5" y="59.5" width="5" height="4" rx="1"/>';
    const neckShape='<path class="srGearEdge169" d="M41 31 Q50 45 59 31"/><path class="srGearFill169" d="M46 41 L50 36 L54 41 L50 47 Z"/>';
    const ringShape='<circle class="srGearEdge169" cx="79" cy="62" r="3.2"/><circle class="srGearFill169" cx="79" cy="58.8" r="1.8"/>';
    return '<div class="srHeroGear169" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">'+
      gearGroup("armure",armor,armorShape,"#6f84a9")+
      gearGroup("casque",helm,helmShape,"#6f84a9")+
      gearGroup("gants",gloves,gloveShape,"#6f84a9")+
      gearGroup("bottes",boots,bootShape,"#6f84a9")+
      gearGroup("ceinture",belt,beltShape,"#d6aa4d")+
      gearGroup("collier",neck,neckShape,"#58d9e7")+
      gearGroup("anneau",ring,ringShape,"#58d9e7")+
      '</svg></div>';
  }
  function applyHeroGear(hero,img,c){
    if(!hero)return;
    const markup=heroGearSVG();
    if(markup){
      const anchor=hero.querySelector(":scope > .srWeapon")||hero.querySelector(":scope > .hpMini");
      if(anchor)anchor.insertAdjacentHTML("beforebegin",markup);else hero.insertAdjacentHTML("beforeend",markup);
      const gear=hero.querySelector(":scope > .srHeroGear169");
      if(gear){
        let tf=img&&img.style&&img.style.transform?img.style.transform:"";
        if(c&&c.heroHit>0)tf+=(tf?" ":"")+"translateX(-1.5px)";
        gear.style.transform=tf||"none";
      }
    }
    const slots=[];
    ["arme","casque","armure","gants","bottes","collier","anneau","ceinture"].forEach(function(slot){if(worn(slot))slots.push(slot);});
    if(slots.length)hero.setAttribute("data-equipped-slots",slots.join(","));else hero.removeAttribute("data-equipped-slots");
  }
  function applyHeroPresentationState(hero,img,c){
    if(!hero||!c)return;
    const now=typeof performance!=="undefined"&&performance.now?performance.now():Date.now();
    const lost=Number(c.heroHP||0)<=0||c.status==="lost";
    const victory=!lost&&c.status!=="fight"&&!(c.pending>0)&&!c.enemies.some(function(e){return e&&e.alive;});
    const casting=!lost&&Array.isArray(c.skillFxs)&&c.skillFxs.length>0;
    hero.classList.toggle("srHeroHit169",Number(c.heroHit||0)>0);
    hero.classList.toggle("srHeroCasting169",casting);
    hero.classList.toggle("srHeroLost169",lost);
    hero.classList.toggle("srHeroVictory169",victory);
    if(lost){
      if(!heroState.deathAt)heroState.deathAt=now;
      const p=smooth01((now-heroState.deathAt)/430);
      hero.style.transform="translate("+(-4*p).toFixed(2)+"px,"+(8*p).toFixed(2)+"px) rotate("+(-74*p).toFixed(1)+"deg) scale("+(1-p*0.06).toFixed(3)+")";
      if(img)img.style.filter="grayscale("+(p*0.55).toFixed(2)+") brightness("+(1-p*0.28).toFixed(2)+")";
    }else{
      heroState.deathAt=0;
      if(img)img.style.filter="";
    }
    if(victory){
      if(!heroState.victoryAt)heroState.victoryAt=now;
      const q=(now-heroState.victoryAt)/1000;
      const lift=Math.sin(Math.min(1,q)*Math.PI)*2.2+Math.sin(q*5.2)*0.45;
      hero.style.transform="translateY("+(-Math.max(0,lift)).toFixed(2)+"px) scale(1.025)";
    }else heroState.victoryAt=0;
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
    return '<div class="srWeapon" data-weapon="'+weapon+'" style="position:absolute;z-index:6;left:'+(hand.x*size-w/2+tx).toFixed(1)+'px;top:'+(hand.y*size-h+ty).toFixed(1)+'px;width:'+w.toFixed(1)+'px;height:'+h.toFixed(1)+'px;transform-origin:50% 100%;transform:rotate('+rot.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')"><img src="'+art+'" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 5px '+color+'99)"></div>';
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

  drawArena=function(){
    baseDraw169();
    try{
      const c=typeof combat!=="undefined"?combat:null;
      if(!c||!arenaEl||!arenaNodes||!arenaNodes.layer)return;
      const scale=(arenaEl.clientWidth||360)/AW;
      const units=Array.from(arenaNodes.layer.querySelectorAll(":scope > .unit"));
      if(!units.length)return;
      let ui=0;
      const hero=units[0];
      if(isHeroUnit(hero)){
        ui=1;
        const img=hero.querySelector(":scope > img"),size=parseFloat(hero.style.width)||64;
        const logical=Number(c.heroX||0),strideWorld=Math.max(5.8,size*0.155)/Math.max(0.01,scale);
        const active=!(c.heroAttacking>0)&&!(c.heroHit>0)&&!(c.heroStun>0)&&Number(c.heroHP||0)>0;
        const gait=gaitPhase(heroState,logical,strideWorld,Math.max(18,strideWorld*2.5),active);
        hero.style.left=(gait.x*scale-size/2).toFixed(2)+"px";
        if(img&&active&&gait.moving){
          const p=bodyPose(gait.phase,"hero");hero.style.transform="translate(0px,0px)";
          img.style.transform="translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          articulate(hero,img,gait.phase,size,gait.dir||1,false,PROFILES.hero);
          const shadow=hero.querySelector(":scope > .ushadow");if(shadow){shadow.style.transform="scaleX("+(0.968+p.contact*0.032).toFixed(3)+")";shadow.style.opacity=(0.54+p.contact*0.08).toFixed(3);}
        }else disableLegs(hero,img);
        if(img&&c.heroAttacking>0&&RANGED_IDS.includes(D.weapon)){
          if(ASSETS.hero)img.src=ASSETS.hero;
          const p=attackP(c.heroAttacking);let lean=0,y=0,sx=1,sy=1;
          if(D.weapon==="arc"){
            const draw=p<0.62?clamp01((p-0.20)/0.42):Math.max(0,1-(p-0.62)/0.28);lean=-2.2+draw*3.2;y=-draw*1.2;sx=1-draw*0.012;sy=1+draw*0.008;
          }else if(D.weapon==="arbalete"){
            const aim=Math.min(1,p/0.35),recoil=Math.max(0,1-Math.abs(p-0.62)/0.14);lean=-1.4+aim*1.8-recoil*2.5;y=-aim*0.7;
          }else{const cast=Math.sin(Math.min(1,p/0.82)*Math.PI);lean=-2+cast*3.2;y=-cast*1.8;sy=1+cast*0.012;}
          img.style.transform="translateY("+y.toFixed(2)+"px) rotate("+lean.toFixed(2)+"deg) scale("+sx.toFixed(3)+","+sy.toFixed(3)+")";
        }
        applyHeroPresentationState(hero,img,c);
        applyHeroGear(hero,img,c);
        const weapon=hero.querySelector(":scope > .srWeapon");if(weapon)weapon.style.zIndex="6";
        const hp=hero.querySelector(":scope > .hpMini");if(hp)hp.style.zIndex="8";
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
          const p=bodyPose(gait.phase,profile);unit.style.transform="translate(0px,0px)";
          img.style.transform="scaleX(-1) translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          const morph=profileForEnemy(e,img);if(morph)articulate(unit,img,gait.phase,size,1,true,morph);else disableLegs(unit,img);
          const shadow=unit.querySelector(":scope > .ushadow");if(shadow){const b=e.boss?0.985:0.972,r=e.boss?0.015:0.028;shadow.style.transform="scaleX("+(b+p.contact*r).toFixed(3)+")";shadow.style.opacity=(0.52+p.contact*0.09).toFixed(3);}
        }else disableLegs(unit,img);
      });
      if(enemyState.size>32){const live=new Set(c.enemies.map(e=>e.id));Array.from(enemyState.keys()).forEach(id=>{if(!live.has(id))enemyState.delete(id);});}
    }catch(err){if(typeof window!=="undefined")window.__srWalkV169Error=String(err&&err.message||err);}
  };

  const style=document.createElement("style");
  style.id="combat-animation-v169-style";
  style.textContent=[
    ".unit,.unit>img,.ushadow{transition:none!important}",
    ".unit>img{transform-origin:50% 92%;will-change:transform}",
    ".srWeapon{z-index:6!important}",
    ".srHeroGear169{position:absolute;inset:0;z-index:5;pointer-events:none;transform-origin:50% 92%;will-change:transform;isolation:isolate}",
    ".srHeroGear169>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 1px 1px #02081799)}",
    ".srGearPart169{opacity:var(--gear-op,.72);filter:drop-shadow(0 0 .8px var(--gear))}",
    ".srGearFill169{fill:var(--gear);stroke:#09111f;stroke-width:1.8;stroke-linejoin:round}",
    ".srGearHi169{fill:#fff;fill-opacity:.20;stroke:#fff;stroke-opacity:.18;stroke-width:.7}",
    ".srGearEdge169{fill:none;stroke:#f6df9b;stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:.86}",
    ".srGearRare169{filter:drop-shadow(0 0 1.4px var(--gear))}",
    ".srGearEpic169{filter:drop-shadow(0 0 2.1px var(--gear)) drop-shadow(0 0 .8px #fff8)}",
    ".srGearDivine169{filter:drop-shadow(0 0 3px var(--gear)) drop-shadow(0 0 1.2px #fff)}",
    ".srHeroCasting169>.srHeroGear169{filter:brightness(1.08) saturate(1.12)}",
    ".srHeroHit169>.srHeroGear169{filter:brightness(1.18)}",
    ".srHeroLost169>.srHeroGear169{opacity:.72;filter:saturate(.7) brightness(.78)}",
    ".srHeroVictory169>.srHeroGear169{filter:brightness(1.13) saturate(1.12)}",
    ".srWalkPseudo169::before,.srWalkPseudo169::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background-image:var(--sr-sprite);background-size:contain;background-position:center;background-repeat:no-repeat;transform-origin:50% 92%;will-change:transform}",
    ".srWalkPseudo169::before{clip-path:polygon(0 var(--sr-split-top),var(--sr-left-end) var(--sr-split-top),var(--sr-left-end) 100%,0 100%);transform:var(--sr-flip) translate(var(--sr-lx),var(--sr-ly)) rotate(var(--sr-lr))}",
    ".srWalkPseudo169::after{clip-path:polygon(var(--sr-right-start) var(--sr-split-top),100% var(--sr-split-top),100% 100%,var(--sr-right-start) 100%);transform:var(--sr-flip) translate(var(--sr-rx),var(--sr-ry)) rotate(var(--sr-rr))}",
    "@media (prefers-reduced-motion:reduce){.unit>img,.srHeroGear169,.srWalkPseudo169::before,.srWalkPseudo169::after{will-change:auto}}"
  ].join("\n");
  document.head.appendChild(style);
})();
