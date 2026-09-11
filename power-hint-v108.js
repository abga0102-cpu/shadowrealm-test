/* POWER_HINT_V108
   Contextual, non-intrusive progression hint.
   A hint is shown only after two consecutive defeats on the SAME campaign
   floor/boss. It never auto-opens before that and can be dismissed.
   A victory clears the streak. Raid/PvP losses are ignored.
   Critical recovery rule: this auxiliary hint must never wrap or intercept the
   canonical combat-end function. Observe the terminal combat state instead so
   campaign death/checkpoint recovery remains owned entirely by the engine. */
(function(){
  'use strict';
  if (window.__srPowerHintV108) return;
  window.__srPowerHintV108 = true;

  var lastCombat = null, handled = null;
  var KEY = 'shadowreach.powerHint.v108';
  function read(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_){return{};} }
  function write(v){ try{localStorage.setItem(KEY,JSON.stringify(v));}catch(_){} }
  function campaign(c){ return c && !c.raidId && !c.pvp && (c.floor || (typeof S!=='undefined'&&S.floor)); }
  function key(c){ var f=Number(c.floor || (S&&S.floor) || 1); return (c.boss?'boss:':'floor:')+f; }
  function close(){ var n=document.getElementById('srPowerHint'); if(n)n.remove(); }
  function show(c){
    close();
    var boss=!!c.boss, n=document.createElement('div'); n.id='srPowerHint';
    n.innerHTML='<button type="button" aria-label="Fermer">×</button><b>Puissance insuffisante ?</b><span>'+(boss?'Ce Boss t’a résisté deux fois.':'Cet étage t’a résisté deux fois.')+' Améliore ton équipement, tes compétences, tes familiers ou tes statistiques avant de retenter.</span>';
    n.querySelector('button').onclick=close; document.body.appendChild(n);
    setTimeout(close,9000);
  }
  function finish(c){
    if(!campaign(c)) return;
    var k=key(c), d=read();
    if(c.status==='lost'){
      d[k]=(Number(d[k])||0)+1; write(d);
      if(d[k]===2) show(c);
    } else if(c.status==='won'){
      if(d[k]){delete d[k];write(d);} close();
    }
  }
  function watch(){
    try{
      if(typeof combat!=='undefined' && combat){
        lastCombat=combat;
        if((combat.status==='lost'||combat.status==='won') && handled!==combat){handled=combat;finish(combat);}
      } else if(lastCombat && (lastCombat.status==='lost'||lastCombat.status==='won') && handled!==lastCombat){
        handled=lastCombat;finish(lastCombat);
      }
    }catch(_){}
  }

  var st=document.createElement('style');
  st.textContent='#srPowerHint{position:fixed;z-index:9998;right:10px;top:calc(env(safe-area-inset-top) + 68px);width:min(245px,calc(100vw - 20px));padding:9px 28px 9px 10px;border:1px solid rgba(232,180,74,.42);border-radius:10px;background:rgba(13,20,34,.82);box-shadow:0 3px 12px rgba(0,0,0,.24);color:#edf1fa;font:600 10.5px/1.35 system-ui;animation:srHintIn .18s ease-out}#srPowerHint b{display:block;color:#fbdd8c;font-size:11px;margin-bottom:2px}#srPowerHint span{color:#c8d2e5}#srPowerHint button{position:absolute;right:5px;top:3px;border:0;background:transparent;color:#9eabc1;font:700 18px/1 system-ui;padding:3px 5px;cursor:pointer}@keyframes srHintIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}';
  document.head.appendChild(st);
  window.__srPowerHintCombatEndLifecycleV108=true;
  setInterval(watch,350);
})();
