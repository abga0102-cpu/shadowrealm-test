/* SHADOWREACH AUDIO V26 */
(() => {
  let ctx=null, master=null, music=null, ready=false, musicTimer=null, step=0;
  let lastHeroAtk=false, lastStatus=null, lastSkillKeys=new Set(), enemyAtk=new Map();
  function unlock(){
    if(ready&&ctx){ if(ctx.state==='suspended') ctx.resume(); return true; }
    try{ const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return false; ctx=new Ctx(); master=ctx.createGain(); master.gain.value=.34; master.connect(ctx.destination); music=ctx.createGain(); music.gain.value=.20; music.connect(master); ready=true; if(ctx.state==='suspended')ctx.resume(); if(!musicTimer)musicTimer=setInterval(musicTick,520); return true; }catch(_){return false;}
  }
  function tone(freq,dur,vol,type='sine',slide=0,dest=master){ if(!ready||!ctx||!master)return; const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(Math.max(30,freq),t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t+dur); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(dest||master); o.start(t); o.stop(t+dur+.02); }
  function noise(dur,vol,cut=1800){ if(!ready||!ctx)return; const len=Math.max(64,Math.floor(ctx.sampleRate*dur)),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0); for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len); const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(); src.buffer=b; f.type='lowpass'; f.frequency.value=cut; g.gain.value=vol; src.connect(f); f.connect(g); g.connect(master); src.start(); }
  function sfx(kind,p=1){ if(!ready)return; p=Math.max(.35,Math.min(1.4,p)); if(kind==='ui'){tone(760,.045,.018,'sine',620);return;} if(kind==='swing'){noise(.09,.045*p,1200);tone(150,.08,.026*p,'triangle',92);return;} if(kind==='shot'){noise(.055,.025*p,2600);tone(520,.07,.025*p,'triangle',820);return;} if(kind==='enemySwing'){noise(.075,.023*p,900);tone(105,.09,.017*p,'sawtooth',72);return;} if(kind==='enemyShot'){tone(360,.08,.016*p,'square',520);return;} if(kind==='victory'){[523,659,784].forEach((n,i)=>setTimeout(()=>tone(n,.32,.035,'triangle',n*1.03),i*90));return;} if(kind==='defeat'){[220,174,130].forEach((n,i)=>setTimeout(()=>tone(n,.38,.035,'sine',n*.72),i*110));} }
  function skill(k){ if(!ready)return; k=k||'impact'; if(k==='heal'||k==='aura'){tone(440,.42,.030,'sine',880);setTimeout(()=>tone(660,.36,.022,'sine',990),70);} else if(k==='meteor'||k==='cataclysm'){tone(82,.48,.055,'sawtooth',42);noise(.28,.06,1000);} else if(k==='vortex'||k==='curse'||k==='poison'){tone(190,.38,.032,'triangle',95);tone(285,.30,.018,'sine',150);} else if(k==='bolt'||k==='pierce'){tone(620,.18,.035,'square',1120);noise(.08,.025,3000);} else if(k==='wave'){tone(260,.34,.032,'sine',520);noise(.13,.025,1800);} else {tone(330,.20,.032,'triangle',190);noise(.07,.03,1300);} }
  function getCombat(){try{return combat;}catch(_){return null;}}
  function getWeapon(){try{return WEAPON_TYPES[D.weapon]||WEAPON_TYPES.epee;}catch(_){return {attackType:'MELEE'};}}
  function musicTick(){ const c=getCombat(); if(!ready||!c||c.status!=='fight')return; const boss=!!c.boss,notes=boss?[55,65.4,73.4,49]:[73.4,82.4,98,82.4],n=notes[step++%notes.length]; tone(n,boss ? .42 : .32,boss ? .030 : .018,'triangle',n*.985,music); if(step%2===0)tone(n*2,boss ? .18 : .14,boss ? .012 : .008,'sine',n*1.96,music); }
  function poll(){ const c=getCombat(); if(!c){lastHeroAtk=false;lastStatus=null;lastSkillKeys.clear();enemyAtk.clear();return;} const heroNow=c.heroAttacking>0; if(heroNow&&!lastHeroAtk){const wt=getWeapon();sfx(wt.attackType==='RANGED'?'shot':'swing',.9);} lastHeroAtk=heroNow; const currentSkills=new Set(); (c.skillFxs||[]).forEach(f=>{const prefix=String(f.id)+'|'; const key=prefix+String(f.max)+'|'+String(Math.round((f.life||0)*100)); currentSkills.add(key); if(!Array.from(lastSkillKeys).some(x=>x.startsWith(prefix)))skill(f.fx);}); lastSkillKeys=currentSkills; (c.enemies||[]).forEach(e=>{const now=e.attacking>0,prev=enemyAtk.get(e.id)||false;if(now&&!prev)sfx(e.ranged?'enemyShot':'enemySwing',.62);enemyAtk.set(e.id,now);}); if(lastStatus==='fight'&&c.status!=='fight')sfx(c.status==='won'?'victory':'defeat',1); lastStatus=c.status; }
  document.addEventListener('pointerdown',e=>{unlock();if(e.target&&e.target.closest&&e.target.closest('[data-act],button'))sfx('ui',.55);},{capture:true,passive:true});
  document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlock();},{capture:true});
  setInterval(poll,50);
})();

/* PE economy rebase v6 migration only.
   Raid Évolution reward authority now lives exclusively in raid-pe-authority-v290.js.
   Old saves that never received v5 get the intended +40 PE per provable win.
   Saves that already received the temporary +90 v5 credit are corrected by
   removing at most the +50-per-win excess still present in their PE wallet.
   We never create negative PE or undo tree purchases already made. */
(() => {
  if (typeof S !== "object" || !S || typeof update !== "function") return;
  if (Object.prototype.hasOwnProperty.call(S, "economyRebaseV6")) return;
  update((st) => {
    if (Object.prototype.hasOwnProperty.call(st, "economyRebaseV6")) return;
    const r = (st.raids && st.raids.evolution) || {};
    const maxLevel = (typeof RULES === "object" && RULES && Number(RULES.RAID_MAX_LEVEL)) || 50;
    const stars = Math.max(0, Number(r.stars) || 0);
    const level = Math.max(1, Math.min(maxLevel, Number(r.level) || 1));
    const record = Math.max(0, Math.min(maxLevel, Number(r.record) || 0));
    const provenWins = stars > 0
      ? stars * maxLevel + Math.max(0, level - 1)
      : Math.max(Math.max(0, level - 1), record);
    let peDelta = 0;
    let excessRemoved = 0;
    if (Object.prototype.hasOwnProperty.call(st, "economyRebaseV5")) {
      const creditedV5 = Math.max(0, Number(st.economyRebaseNoticeV5 && st.economyRebaseNoticeV5.peCredited) || (provenWins * 90));
      const targetCredit = provenWins * 40;
      const excess = Math.max(0, creditedV5 - targetCredit);
      excessRemoved = Math.min(Math.max(0, Number(st.pe) || 0), excess);
      st.pe = Math.max(0, Number(st.pe) || 0) - excessRemoved;
      peDelta = -excessRemoved;
    } else {
      peDelta = provenWins * 40;
      st.pe = Math.max(0, Number(st.pe) || 0) + peDelta;
    }
    st.economyRebaseV6 = true;
    st.economyRebaseNoticeV6 = { evolutionWins: provenWins, peDelta, excessRemoved, bonusPerWin: 40 };
  });
})();
