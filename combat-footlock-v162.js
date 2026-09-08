/* Combat Foot-Lock V162
   Final locomotion pass over V161.
   Uses logical combat positions (c.heroX / e.x), not smoothed P positions, and
   remaps each stride with real flat stance phases so the displayed root truly
   stops during foot contact instead of continuously skating forward.
   Visual-only: combat simulation, speed, ranges, timing, damage and saves untouched.
*/
(function(){
  "use strict";
  if (typeof drawArena !== "function") return;

  const baseDrawArena162 = drawArena;
  const heroState = { init:false, lastLogical:0, anchor:0, travel:0, dir:0, visual:0, still:0 };
  const enemyState = new Map();

  function smooth01(t){ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); }
  function strideEase(phase){
    // 18% planted stance, 64% transfer/push, 18% planted landing.
    if (phase <= .18) return 0;
    if (phase >= .82) return 1;
    return smooth01((phase-.18)/.64);
  }

  function resetState(st,x){
    st.init=true; st.lastLogical=x; st.anchor=x; st.travel=0; st.dir=0; st.visual=x; st.still=0;
  }

  function footLock(st, logicalX, strideWorld, teleportWorld){
    if (!st.init) { resetState(st,logicalX); return {x:logicalX,phase:0,contact:1,moving:false}; }
    const dx = logicalX - st.lastLogical;
    st.lastLogical = logicalX;

    // Boss leaps, knock teleports, forced resets: never turn those into giant steps.
    if (Math.abs(dx) > teleportWorld) {
      resetState(st,logicalX);
      return {x:logicalX,phase:0,contact:1,moving:false,teleport:true};
    }

    if (Math.abs(dx) < .0005) {
      st.still++;
      // Finish the final foot placement exactly on the logical position.
      if (st.still >= 2) { st.visual = logicalX; st.anchor = logicalX; st.travel=0; st.dir=0; }
      return {x:st.visual,phase:0,contact:1,moving:false};
    }
    st.still=0;

    const dir = dx > 0 ? 1 : -1;
    if (!st.dir || dir !== st.dir) {
      st.dir=dir; st.anchor=st.visual; st.travel=0;
    }
    st.travel += Math.abs(dx);

    const stride = Math.max(.5, strideWorld);
    const cycles = Math.floor(st.travel / stride);
    const phase = (st.travel - cycles*stride) / stride;
    const eased = strideEase(phase);
    const progressed = (cycles + eased) * stride;
    st.visual = st.anchor + st.dir * progressed;

    // Never drift more than one half-step away from simulation truth.
    const maxLag = stride * .52;
    if (Math.abs(st.visual-logicalX) > maxLag) st.visual = logicalX - st.dir*maxLag;

    const contact = phase <= .18 ? 1 : phase >= .82 ? 1 : Math.abs(phase-.5)/.32;
    return {x:st.visual,phase,contact:Math.max(0,Math.min(1,contact)),moving:true};
  }

  function bodyPose(phase, contact, profile){
    const q = phase*Math.PI*2;
    const push = Math.sin(q);
    const liftBase = profile==="boss"?.48:profile==="small"?.95:.68;
    const leanBase = profile==="boss"?.42:profile==="small"?1.18:.78;
    // During planted intervals the torso is almost still; motion lives in transfer.
    const free = 1-contact;
    return {
      lift: -Math.abs(Math.sin(q))*liftBase*free,
      lean: push*leanBase*free,
      squash: 1-contact*(profile==="boss"?.0035:.0055)
    };
  }

  function isHeroUnit(unit){
    if (!unit) return false;
    const img=unit.querySelector(":scope > img");
    if (!img || !ASSETS || !ASSETS.hero) return false;
    try {
      const a=new URL(img.src,location.href).pathname;
      const b=new URL(ASSETS.hero,location.href).pathname;
      return a===b || /hero/.test(a);
    } catch(_){ return /hero/.test(img.getAttribute("src")||""); }
  }

  drawArena = function(){
    baseDrawArena162();
    try{
      const c = typeof combat!=="undefined" ? combat : null;
      if(!c || !arenaEl || !arenaNodes || !arenaNodes.layer) return;
      const scale=(arenaEl.clientWidth||360)/AW;
      const units=Array.from(arenaNodes.layer.querySelectorAll(":scope > .unit"));
      if(!units.length) return;

      let ui=0;
      // Harden defeat/hero-absent case: only consume first unit if it is actually hero.
      const maybeHero=units[0];
      if(isHeroUnit(maybeHero)){
        ui=1;
        const unit=maybeHero, img=unit.querySelector(":scope > img");
        const size=parseFloat(unit.style.width)||64;
        const strideWorld=Math.max(5.8, size*.155)/Math.max(.01,scale);
        const logical=Number(c.heroX||0);
        const movingAllowed=!(c.heroAttacking>0)&&!(c.heroHit>0)&&!(c.heroStun>0);
        const gait=footLock(heroState,logical,strideWorld,Math.max(18,strideWorld*2.5));

        // Root left is now ours. P.hero smoothing no longer defines walking motion.
        unit.style.left=(gait.x*scale-size/2).toFixed(2)+"px";
        if(img && movingAllowed && gait.moving){
          const p=bodyPose(gait.phase,gait.contact,"hero");
          unit.style.transform="translate(0px,0px)";
          img.style.transform="translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          const shadow=unit.querySelector(":scope > .ushadow");
          if(shadow){ shadow.style.transform="scaleX("+(0.965+gait.contact*.035).toFixed(3)+")"; shadow.style.opacity=(.54+gait.contact*.08).toFixed(3); }
        }
      } else if (c.status!=="fight") {
        resetState(heroState,Number(c.heroX||0));
      }

      const rendered=c.enemies.filter(e=>e.alive||e.hitFlash>0);
      rendered.forEach(e=>{
        const unit=units[ui++]; if(!unit) return;
        const img=unit.querySelector(":scope > img"); if(!img) return;
        const size=parseFloat(unit.style.width)||64;
        let st=enemyState.get(e.id);
        if(!st){ st={init:false,lastLogical:0,anchor:0,travel:0,dir:0,visual:0,still:0}; enemyState.set(e.id,st); }
        const profile=e.boss?"boss":e.small?"small":"normal";
        const stridePx=e.boss?Math.max(8,size*.17):e.small?Math.max(4.5,size*.21):Math.max(6,size*.16);
        const strideWorld=stridePx/Math.max(.01,scale);
        const logical=Number(e.x||0);
        const gait=footLock(st,logical,strideWorld,Math.max(20,strideWorld*(e.boss?2.2:2.8)));
        const movingAllowed=!(e.attacking>0)&&!(e.hitFlash>0)&&!(e.flying>0)&&!(e.stagger>0)&&!(e.vanish>0);

        unit.style.left=(gait.x*scale-size/2).toFixed(2)+"px";
        if(movingAllowed&&gait.moving){
          const p=bodyPose(gait.phase,gait.contact,profile);
          unit.style.transform="translate(0px,0px)";
          img.style.transform="scaleX(-1) translateY("+p.lift.toFixed(2)+"px) rotate("+p.lean.toFixed(2)+"deg) scaleY("+p.squash.toFixed(4)+")";
          const shadow=unit.querySelector(":scope > .ushadow");
          if(shadow){ shadow.style.transform="scaleX("+(e.boss?.985:.97 + gait.contact*(e.boss?.015:.03)).toFixed(3)+")"; shadow.style.opacity=(.52+gait.contact*.09).toFixed(3); }
        }
      });

      if(enemyState.size>32){
        const live=new Set(c.enemies.map(e=>e.id));
        Array.from(enemyState.keys()).forEach(id=>{ if(!live.has(id)) enemyState.delete(id); });
      }
    }catch(_){}
  };

  const style=document.createElement("style");
  style.id="combat-footlock-v162-style";
  style.textContent=".unit{transition:none!important}.unit>img{transition:none!important;transform-origin:50% 92%}.ushadow{transition:none!important;transform-origin:50% 50%}";
  document.head.appendChild(style);
})();
