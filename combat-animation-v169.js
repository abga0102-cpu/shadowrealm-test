/* Combat Animation V169 · V338 visual equipment atlas
   Consolidated locomotion + planted-foot articulated walk + weapon choreography.
   V338 adds a modular, rarity-driven worn-equipment renderer based on the approved
   hero equipment atlas. Visual-only: combat speed, range, damage, cooldowns,
   rewards, progression and saves stay untouched.
*/
(function(){
  "use strict";
  if(typeof drawArena!=="function"||typeof weaponHTML!=="function")return;

  const VISUAL_ATTACK=0.28;
  const baseDraw169=drawArena;
  const heroState={init:false,lastLogical:0,travel:0,visual:0,dir:0,phase:0,moving:false};
  const enemyState=new Map();
  const PROFILES={
    hero:{upperBottom:40,splitTop:58,leftEnd:53,rightStart:47,step:0.040,lift:0.017},
    goblin:{upperBottom:43,splitTop:60,leftEnd:55,rightStart:45,step:0.036,lift:0.015},
    orc:{upperBottom:39,splitTop:57,leftEnd:54,rightStart:46,step:0.038,lift:0.014},
    skeleton:{upperBottom:42,splitTop:58,leftEnd:51,rightStart:49,step:0.043,lift:0.020}
  };

  /* Visual ladder only. The Forge economy/drop ladder remains owned by the
     progression systems. PEU_COMMUN and HEROIQUE are supported here so legacy
     or future equipment can render with the approved 11-step art direction. */
  const GEAR_VISUAL_ORDER=[
    "COMMUN","PEU_COMMUN","RARE","EPIQUE","MYTHIQUE","HEROIQUE",
    "ARTEFACT","LEGENDAIRE","INFERNAL","IMMORTEL","DIVIN"
  ];
  const GEAR_VISUAL={
    COMMUN:     {base:"#45362f",trim:"#8a7158",gem:"#7d6a55",cloth:"#a92828",glow:0},
    PEU_COMMUN: {base:"#2f4436",trim:"#63a66e",gem:"#7fdc8f",cloth:"#b42f2f",glow:.35},
    RARE:       {base:"#18375e",trim:"#4aa7ff",gem:"#8bd0ff",cloth:"#c53232",glow:.65},
    EPIQUE:     {base:"#3c245e",trim:"#b15cf6",gem:"#deb8ff",cloth:"#cc3037",glow:.9},
    MYTHIQUE:   {base:"#4c234d",trim:"#dd66f2",gem:"#ffb5ff",cloth:"#d33035",glow:1.1},
    HEROIQUE:   {base:"#4b2725",trim:"#efc36c",gem:"#ffe5a0",cloth:"#d52b2b",glow:1.25},
    ARTEFACT:   {base:"#073c43",trim:"#39c9c1",gem:"#9bfff3",cloth:"#c92d2d",glow:1.45},
    LEGENDAIRE: {base:"#611b12",trim:"#f5c542",gem:"#fff0a6",cloth:"#e02a20",glow:1.8},
    INFERNAL:   {base:"#19070a",trim:"#ff352a",gem:"#ff8a60",cloth:"#a80f18",glow:2.2},
    IMMORTEL:   {base:"#d9e8f7",trim:"#62b7ff",gem:"#fff2ad",cloth:"#d74444",glow:2.6},
    DIVIN:      {base:"#fff4d7",trim:"#ffc83d",gem:"#6fd8ff",cloth:"#e64b42",glow:3.2}
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

  function worn(slot){
    try{return typeof S!=="undefined"&&S&&S.equipped?S.equipped[slot]||null:null;}catch(_){return null;}
  }
  function gearTier(item){
    const r=item&&item.rarity||"COMMUN";
    const i=GEAR_VISUAL_ORDER.indexOf(r);
    return i<0?0:i;
  }
  function gearCfg(item){return GEAR_VISUAL[item&&item.rarity]||GEAR_VISUAL.COMMUN;}
  function escAttr(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");}
  function gearGroup(slot,item,inner,extra){
    if(!item)return"";
    const c=gearCfg(item),t=gearTier(item),r=item.rarity||"COMMUN";
    return '<g data-slot="'+slot+'" data-rarity="'+escAttr(r)+'" data-tier="'+t+'" class="srGearPart338 srGearTier'+t+' '+(extra||"")+'" style="--sr-base:'+c.base+';--sr-trim:'+c.trim+';--sr-gem:'+c.gem+';--sr-cloth:'+c.cloth+';--sr-glow:'+c.glow+'px">'+inner+'</g>';
  }
  function helmetArt(t){
    let s='<path class="srGearFill338" d="M34 24 L35 12 L42 6 L50 4 L58 6 L65 12 L66 24 L60 29 L55 24 L45 24 L40 29 Z"/>'+
      '<path class="srGearTrim338" d="M38 17 L50 10 L62 17 M50 9 L50 24"/>';
    if(t>=2)s+='<path class="srGearGem338" d="M46 15 L50 11 L54 15 L50 20 Z"/>';
    if(t>=4)s+='<path class="srGearTrim338" d="M36 12 L31 8 L35 19 M64 12 L69 8 L65 19"/>';
    if(t>=7)s+='<path class="srGearTrim338" d="M42 7 L45 1 L50 6 L55 1 L58 7"/>';
    if(t>=8)s+='<path class="srGearGlow338" d="M31 21 L24 15 L31 13 M69 21 L76 15 L69 13"/>';
    if(t>=9)s+='<path class="srGearWing338" d="M30 18 Q20 10 16 20 Q22 18 28 25 M70 18 Q80 10 84 20 Q78 18 72 25"/>';
    if(t>=10)s+='<path class="srGearHalo338" d="M33 5 Q50 -5 67 5"/>';
    return s;
  }
  function armorArt(t){
    let s='<path class="srGearFill338" d="M32 32 L41 28 L50 31 L59 28 L68 32 L73 43 L68 62 L32 62 L27 43 Z"/>'+
      '<path class="srGearFill338" d="M27 33 L18 36 L16 45 L26 47 L33 40 Z M73 33 L82 36 L84 45 L74 47 L67 40 Z"/>'+
      '<path class="srGearTrim338" d="M37 34 L50 31 L63 34 L60 55 L50 59 L40 55 Z M26 38 L18 41 M74 38 L82 41"/>';
    if(t>=1)s+='<path class="srGearTrim338" d="M31 39 L69 39 M35 47 L65 47"/>';
    if(t>=2)s+='<path class="srGearGem338" d="M46 37 L50 33 L54 37 L50 43 Z"/>';
    if(t>=4)s+='<path class="srGearTrim338" d="M36 31 L30 27 L27 34 M64 31 L70 27 L73 34"/>';
    if(t>=6)s+='<path class="srGearSigil338" d="M50 44 L55 49 L50 56 L45 49 Z"/>';
    if(t>=7)s+='<path class="srGearGlow338" d="M19 36 L13 31 L18 30 M81 36 L87 31 L82 30"/>';
    if(t>=8)s+='<path class="srGearSpike338" d="M18 39 L9 36 L16 45 M82 39 L91 36 L84 45"/>';
    if(t>=9)s+='<path class="srGearWing338" d="M23 33 Q12 23 8 34 Q15 31 21 42 M77 33 Q88 23 92 34 Q85 31 79 42"/>';
    if(t>=10)s+='<path class="srGearHalo338" d="M22 28 Q50 14 78 28"/>';
    return s;
  }
  function gloveArt(t){
    let s='<path class="srGearFill338" d="M18 51 L28 50 L32 58 L28 70 L19 68 L16 59 Z M82 51 L72 50 L68 58 L72 70 L81 68 L84 59 Z"/>'+
      '<path class="srGearTrim338" d="M19 57 L29 57 M71 57 L81 57"/>';
    if(t>=2)s+='<circle class="srGearGem338" cx="24" cy="60" r="2"/><circle class="srGearGem338" cx="76" cy="60" r="2"/>';
    if(t>=7)s+='<path class="srGearGlow338" d="M17 54 L12 50 M83 54 L88 50"/>';
    if(t>=8)s+='<path class="srGearSpike338" d="M19 51 L14 44 L24 49 M81 51 L86 44 L76 49"/>';
    return s;
  }
  function beltArt(t){
    let s='<path class="srGearFill338" d="M30 58 L70 58 L69 66 L31 66 Z"/>'+
      '<rect class="srGearTrim338" x="44" y="57" width="12" height="10" rx="2"/>'+
      '<path class="srGearCloth338" d="M37 65 L48 65 L45 84 L34 76 Z M52 65 L63 65 L66 76 L55 84 Z"/>';
    if(t>=2)s+='<rect class="srGearGem338" x="47" y="59" width="6" height="5" rx="1"/>';
    if(t>=6)s+='<path class="srGearSigil338" d="M50 68 L54 74 L50 80 L46 74 Z"/>';
    if(t>=8)s+='<path class="srGearGlow338" d="M32 64 L25 69 M68 64 L75 69"/>';
    return s;
  }
  function bootArt(t){
    let s='<path class="srGearFill338" d="M31 70 L44 70 L45 89 L42 99 L27 99 L29 91 Z M56 70 L69 70 L71 91 L73 99 L58 99 L55 89 Z"/>'+
      '<path class="srGearTrim338" d="M32 77 L43 77 M57 77 L68 77 M30 89 L44 89 M56 89 L70 89"/>';
    if(t>=2)s+='<path class="srGearGem338" d="M34 80 L38 77 L42 80 L38 84 Z M58 80 L62 77 L66 80 L62 84 Z"/>';
    if(t>=4)s+='<path class="srGearTrim338" d="M31 72 L27 66 L36 70 M69 72 L73 66 L64 70"/>';
    if(t>=8)s+='<path class="srGearSpike338" d="M29 85 L23 81 L29 93 M71 85 L77 81 L71 93"/>';
    if(t>=9)s+='<path class="srGearWing338" d="M28 75 Q20 69 18 78 M72 75 Q80 69 82 78"/>';
    return s;
  }
  function neckArt(t){
    let s='<path class="srGearTrim338" d="M42 31 Q50 43 58 31"/>'+
      '<path class="srGearGem338" d="M46 41 L50 36 L54 41 L50 48 Z"/>';
    if(t>=4)s+='<circle class="srGearGlow338" cx="50" cy="42" r="8"/>';
    if(t>=8)s+='<path class="srGearHalo338" d="M45 42 L39 38 M55 42 L61 38 M50 36 L50 30"/>';
    return s;
  }
  function ringArt(t){
    let s='<circle class="srGearTrim338" cx="78" cy="63" r="4"/><circle class="srGearGem338" cx="78" cy="59" r="2"/>';
    if(t>=4)s+='<path class="srGearGlow338" d="M78 52 L78 56 M71 59 L75 59 M81 59 L85 59"/>';
    if(t>=8)s+='<path class="srGearHalo338" d="M74 55 L70 51 M82 55 L86 51"/>';
    return s;
  }
  function capeArt(t){
    let s='<path class="srGearCloth338" d="M35 29 Q28 38 24 52 Q20 68 25 84 Q34 77 40 88 Q48 72 52 45 Q47 35 35 29 Z"/>';
    if(t>=2)s+='<path class="srGearTrim338" d="M34 32 Q29 48 27 71"/>';
    if(t>=5)s+='<path class="srGearSigil338" d="M31 48 L36 55 L31 65 L26 55 Z"/>';
    if(t>=7)s+='<path class="srGearGlow338" d="M25 82 Q34 75 40 86"/>';
    if(t>=8)s+='<path class="srGearSpike338" d="M24 51 L17 47 L23 60"/>';
    if(t>=9)s+='<path class="srGearWing338" d="M28 36 Q15 27 10 42 Q19 38 24 52"/>';
    if(t>=10)s+='<path class="srGearHalo338" d="M26 31 Q17 22 12 31 M37 27 Q30 17 24 23"/>';
    return s;
  }
  function gearMarkup(){
    const armor=worn("armure"),helmet=worn("casque"),gloves=worn("gants"),boots=worn("bottes"),belt=worn("ceinture"),neck=worn("collier"),ring=worn("anneau");
    if(!armor&&!helmet&&!gloves&&!boots&&!belt&&!neck&&!ring)return"";
    let back="",front="";
    if(armor)back+=gearGroup("armure",armor,capeArt(gearTier(armor)),"srGearCape338");
    front+=gearGroup("armure",armor,armorArt(gearTier(armor)),"");
    front+=gearGroup("casque",helmet,helmetArt(gearTier(helmet)),"");
    front+=gearGroup("gants",gloves,gloveArt(gearTier(gloves)),"");
    front+=gearGroup("ceinture",belt,beltArt(gearTier(belt)),"");
    front+=gearGroup("bottes",boots,bootArt(gearTier(boots)),"");
    front+=gearGroup("collier",neck,neckArt(gearTier(neck)),"");
    front+=gearGroup("anneau",ring,ringArt(gearTier(ring)),"");
    return '<div class="srHeroGear338 srHeroGearBack338" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none">'+back+'</svg></div>'+
      '<div class="srHeroGear338 srHeroGearFront338" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none">'+front+'</svg></div>';
  }
  function syncHeroGear(hero,img,c){
    if(!hero)return;
    hero.querySelectorAll(":scope > .srHeroGear338").forEach(n=>n.remove());
    const markup=gearMarkup();
    if(markup)hero.insertAdjacentHTML("beforeend",markup);
    const slots=[];
    ["arme","casque","armure","gants","bottes","collier","anneau","ceinture"].forEach(slot=>{if(worn(slot))slots.push(slot);});
    if(slots.length)hero.setAttribute("data-equipped-slots",slots.join(","));else hero.removeAttribute("data-equipped-slots");
    const bodyTransform=img&&img.style.transform?img.style.transform:"none";
    hero.querySelectorAll(":scope > .srHeroGear338").forEach(n=>{n.style.transform=bodyTransform;});
    const cape=hero.querySelector(".srGearCape338");
    if(cape){
      let rot=0,shift=0;
      if(c&&c.heroAttacking>0){const p=attackP(c.heroAttacking);rot=-4-Math.sin(p*Math.PI)*10;shift=-1.3;}
      else if(heroState.moving){rot=-5-Math.sin(heroState.phase*Math.PI*2)*7;shift=-1;}
      else rot=-1.5;
      cape.style.transform="translate("+shift.toFixed(1)+"px,0) rotate("+rot.toFixed(1)+"deg)";
    }
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
    const item=worn("arme"),cfg=gearCfg(item),tier=gearTier(item),rarity=item&&item.rarity||"COMMUN";
    const glow=item?Math.max(1.5,2.5+cfg.glow*1.6):2.5;
    const filter='drop-shadow(0 0 '+glow.toFixed(1)+'px '+(item?cfg.trim:color)+'99)'+(tier>=7?' brightness(1.08) saturate(1.18)':'');
    return '<div class="srWeapon srGearWeapon338 srGearTier'+tier+'" data-slot="arme" data-weapon="'+escAttr(weapon)+'" data-rarity="'+escAttr(rarity)+'" data-tier="'+tier+'" style="--sr-trim:'+(item?cfg.trim:color)+';position:absolute;z-index:6;left:'+(hand.x*size-w/2+tx).toFixed(1)+'px;top:'+(hand.y*size-h+ty).toFixed(1)+'px;width:'+w.toFixed(1)+'px;height:'+h.toFixed(1)+'px;transform-origin:50% 100%;transform:rotate('+rot.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')"><img src="'+art+'" style="width:100%;height:100%;object-fit:contain;display:block;filter:'+filter+'"></div>';
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
        const active=!(c.heroAttacking>0)&&!(c.heroHit>0)&&!(c.heroStun>0);
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
        syncHeroGear(hero,img,c);
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
    ".unit>img{position:relative;z-index:2;transform-origin:50% 92%;will-change:transform}",
    ".srWeapon{z-index:6!important}",
    ".srHeroGear338{position:absolute;inset:0;pointer-events:none;transform-origin:50% 92%;will-change:transform}",
    ".srHeroGear338>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}",
    ".srHeroGearBack338{z-index:1}",
    ".srHeroGearFront338{z-index:5}",
    ".srGearPart338{filter:drop-shadow(0 0 var(--sr-glow) var(--sr-trim));transform-origin:50% 55%}",
    ".srGearFill338{fill:var(--sr-base);stroke:#0a0e18;stroke-width:1.5;stroke-linejoin:round}",
    ".srGearTrim338{fill:none;stroke:var(--sr-trim);stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}",
    ".srGearGem338{fill:var(--sr-gem);stroke:var(--sr-trim);stroke-width:.75}",
    ".srGearCloth338{fill:var(--sr-cloth);stroke:#3b0b14;stroke-width:1.1;stroke-linejoin:round}",
    ".srGearGlow338{fill:none;stroke:var(--sr-trim);stroke-width:1.4;stroke-linecap:round;opacity:.8}",
    ".srGearSigil338{fill:var(--sr-gem);stroke:var(--sr-trim);stroke-width:1;opacity:.92}",
    ".srGearSpike338{fill:var(--sr-base);stroke:var(--sr-trim);stroke-width:1.25;stroke-linejoin:round}",
    ".srGearWing338{fill:none;stroke:var(--sr-trim);stroke-width:2.1;stroke-linecap:round;opacity:.82}",
    ".srGearHalo338{fill:none;stroke:var(--sr-trim);stroke-width:2.2;stroke-linecap:round;opacity:.92}",
    ".srGearTier0{opacity:.78;filter:none}",
    ".srGearTier1{opacity:.82}",
    ".srGearTier2,.srGearTier3{opacity:.87}",
    ".srGearTier4,.srGearTier5,.srGearTier6{opacity:.91}",
    ".srGearTier7,.srGearTier8{opacity:.96}",
    ".srGearTier9,.srGearTier10{opacity:1}",
    ".srGearTier8{filter:drop-shadow(0 0 2px var(--sr-trim)) saturate(1.14)}",
    ".srGearTier9{filter:drop-shadow(0 0 2.5px var(--sr-trim)) brightness(1.08) saturate(1.1)}",
    ".srGearTier10{filter:drop-shadow(0 0 3.2px var(--sr-trim)) brightness(1.12) saturate(1.14)}",
    ".srGearCape338{transform-origin:39% 30%;will-change:transform}",
    ".srGearWeapon338[data-tier='8'] img{filter:drop-shadow(0 0 5px #ff352acc) brightness(1.08) saturate(1.18)!important}",
    ".srGearWeapon338[data-tier='9'] img{filter:drop-shadow(0 0 6px #62b7ffcc) brightness(1.12)!important}",
    ".srGearWeapon338[data-tier='10'] img{filter:drop-shadow(0 0 7px #ffc83ddd) drop-shadow(0 0 3px #6fd8ffcc) brightness(1.15)!important}",
    ".srWalkPseudo169::before,.srWalkPseudo169::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background-image:var(--sr-sprite);background-size:contain;background-position:center;background-repeat:no-repeat;transform-origin:50% 92%;will-change:transform}",
    ".srWalkPseudo169::before{clip-path:polygon(0 var(--sr-split-top),var(--sr-left-end) var(--sr-split-top),var(--sr-left-end) 100%,0 100%);transform:var(--sr-flip) translate(var(--sr-lx),var(--sr-ly)) rotate(var(--sr-lr))}",
    ".srWalkPseudo169::after{clip-path:polygon(var(--sr-right-start) var(--sr-split-top),100% var(--sr-split-top),100% 100%,var(--sr-right-start) 100%);transform:var(--sr-flip) translate(var(--sr-rx),var(--sr-ry)) rotate(var(--sr-rr))}",
    "@media (prefers-reduced-motion:reduce){.unit>img,.srHeroGear338,.srGearCape338,.srWalkPseudo169::before,.srWalkPseudo169::after{will-change:auto}}"
  ].join("\n");
  document.head.appendChild(style);
})();
