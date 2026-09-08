/* SHADOWREACH · Boost UX V174
   - Personnage/Équipement is the only activation surface.
   - Sanctuary may display stored/active boost information, but never an activation button.
   - Legacy queued boosts remain valid until consumed; no new queue can be created here.
   - Boost inventory is moved near the top of the unified character screen. */
(function(){
'use strict';
if(window.__srBoostUxV174)return;window.__srBoostUxV174=true;
if(typeof S==='undefined'||typeof sanctMergeState!=='function'||!window.SRBoostInventoryV173)return;

function extractBlock(html,id){
  var needle='id="'+id+'"', hit=html.indexOf(needle);if(hit<0)return null;
  var start=html.lastIndexOf('<div',hit);if(start<0)return null;
  var re=/<\/?div\b[^>]*>/gi,m,depth=0,end=-1;re.lastIndex=start;
  while((m=re.exec(html))){
    if(/^<div\b/i.test(m[0]))depth++;else depth--;
    if(depth===0){end=re.lastIndex;break;}
  }
  return end>start?{start:start,end:end,html:html.slice(start,end)}:null;
}
function moveBoostPanelTop(html){
  var block=extractBlock(html,'boostInventoryV173');if(!block)return html;
  var without=html.slice(0,block.start)+html.slice(block.end);
  var pos=without.indexOf('<div class="pad');
  if(pos<0){var tb=without.indexOf('</div>');pos=tb>=0?tb+6:0;}
  return without.slice(0,pos)+block.html+without.slice(pos);
}
function sanctuaryReadOnly(html){
  if(!html)return html;
  html=html.replace(/<button\b[^>]*data-sanct-v130="boost"[^>]*>[\s\S]*?<\/button>/gi,
    '<span class="pill" style="color:var(--cyanLit);border-color:var(--cyan)">Dans Personnage</span>');
  html=html.replace('Les bonus d’un même type ne se cumulent jamais en puissance. Ils prolongent leur durée ou passent en file d’attente.',
    'Les boosts sont stockés ici, mais leur activation se fait uniquement depuis Personnage.');
  return html;
}
function wrapScreens(){
  if(typeof SCREENS==='undefined')return;
  var eq=SCREENS.equipement;
  if(typeof eq==='function'&&!eq.__boostUxV174){
    var e=function(){return moveBoostPanelTop(eq());};e.__boostUxV174=true;
    SCREENS.equipement=e;SCREENS.personnage=e;SCREENS.inventaire=e;
  }
  var sanct=SCREENS.sanctuaire;
  if(typeof sanct==='function'&&!sanct.__boostUxV174){
    var s=function(){return sanctuaryReadOnly(sanct());};s.__boostUxV174=true;SCREENS.sanctuaire=s;
  }
}

/* Safety net: even if an old Sanctuary boost button is injected by another late
   renderer, disable it before the player can use it. The legacy handler never
   receives a valid activation control from the current UI. */
function scrubSanctuaryButtons(){
  if(typeof route!=='undefined'&&route!=='sanctuaire')return;
  var nodes=document.querySelectorAll('[data-sanct-v130="boost"]');
  for(var i=0;i<nodes.length;i++){
    var b=nodes[i];b.removeAttribute('data-sanct-v130');b.removeAttribute('data-key');
    b.disabled=true;b.textContent='Dans Personnage';
  }
}

wrapScreens();
if(typeof render==='function'){
  var oldRender=render;
  render=function(){var r=oldRender.apply(this,arguments);requestAnimationFrame(scrubSanctuaryButtons);return r;};
}
requestAnimationFrame(scrubSanctuaryButtons);
})();
