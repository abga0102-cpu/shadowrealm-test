/* SHADOWREACH · Rebirth removal V276
   Rebirth/PR are retired from active gameplay. Legacy save fields remain inert
   so old saves still load, but they grant no power and cannot be spent/earned.
   PR rewards are also removed from Accomplishments and Sanctuary/Fusion. */
(function(){
'use strict';
if(window.__srRebirthRemovalV276)return;
window.__srRebirthRemovalV276=true;

function norm(v){try{return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}catch(_){return String(v||'').toLowerCase();}}
function legacyOff(){
  try{if(typeof rb==='function')rb=function(){return 0;};}catch(_){}
  try{if(typeof prFromFloor==='function')prFromFloor=function(){return 0;};}catch(_){}
  try{if(typeof canRebirth==='function')canRebirth=function(){return false;};}catch(_){}
  try{if(typeof floorAfterRebirth==='function')floorAfterRebirth=function(s){return Math.max(1,Number(s&&s.floor)||1);};}catch(_){}
  try{if(typeof doRebirth==='function')doRebirth=function(){return 0;};}catch(_){}
  try{if(typeof buyRebirth==='function')buyRebirth=function(){return false;};}catch(_){}
  try{if(typeof REBIRTH_UPGRADES!=='undefined'&&Array.isArray(REBIRTH_UPGRADES))REBIRTH_UPGRADES.splice(0,REBIRTH_UPGRADES.length);}catch(_){}
}

function stripRebirthHtml(html){
  if(typeof html!=='string')return html;
  try{
    var t=document.createElement('template');t.innerHTML=html;
    Array.prototype.slice.call(t.content.querySelectorAll('[data-arg="rebirth"],[data-go="rebirth"]')).forEach(function(el){
      var host=el.closest&&el.closest('.navBtn');(host||el).remove();
    });
    return t.innerHTML;
  }catch(_){return html;}
}
function cleanText(html){
  if(typeof html!=='string')return html;
  return html
    .replace(/\b\d+\s+rebirths?\s*·\s*Asc\.\s*(\d+)/gi,'Asc. $1')
    .replace(/Rebirth\s*·\s*Asc\./gi,'Ascension')
    .replace(/,?\s*rebirth\s+et\s+ascension/gi,', ascension')
    .replace(/rebirth\s+et\s+ascension/gi,'ascension');
}
function wrapScreen(key, cleaner){
  try{
    if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS[key]!=='function')return;
    var cur=SCREENS[key];if(cur.__srNoRebirthV276)return;
    var w=function(){return cleaner(cur.apply(this,arguments));};w.__srNoRebirthV276=true;w.__srBase=cur;SCREENS[key]=w;
  }catch(_){}
}
function installScreens(){
  legacyOff();
  try{
    if(typeof progressionGoals==='function'&&!progressionGoals.__srNoRebirthV276){
      var oldGoals=progressionGoals;
      progressionGoals=function(st){
        var out=oldGoals(st)||[];
        return out.filter(function(g){return g&&g.id!=='rebirth1'&&g.id!=='rebirth5';}).map(function(g){
          if(g.id==='floor25'){
            g=Object.assign({},g,{title:'Atteindre l’étage 25',why:'Premier grand palier de progression permanente.'});
          }
          return g;
        });
      };
      progressionGoals.__srNoRebirthV276=true;
    }
  }catch(_){}
  try{
    if(typeof nextUnlockGoal==='function'&&!nextUnlockGoal.__srNoRebirthV276){
      nextUnlockGoal=function(st){
        var mega=st.megaBossClears?Object.keys(st.megaBossClears).some(function(k){return st.megaBossClears[k];}):false;
        var mu=typeof megaRaidUnlocked==='function'?megaRaidUnlocked(st):((st.recordFloor||1)>=50);
        var a=[
          {title:'Méga-Boss',note:'Vaincre le Boss 50',detail:'Affronte des versions extrêmes des Boss et ouvre la voie au Sanctuaire.',now:mu?1:0,max:1,done:mu,go:'mega'},
          {title:'Sanctuaire',note:'Vaincre un Méga-Boss',detail:'Fusionne tes ressources pour découvrir des recettes spéciales.',now:mega?1:0,max:1,done:mega,go:'sanctuaire'}
        ];
        return a.find(function(x){return !x.done;})||null;
      };
      nextUnlockGoal.__srNoRebirthV276=true;
    }
  }catch(_){}
  try{
    if(typeof tutorialGuideInfo==='function'&&!tutorialGuideInfo.__srNoRebirthV276){
      var oldGuide=tutorialGuideInfo;
      tutorialGuideInfo=function(key){return String(key)==='rebirth'?null:oldGuide.apply(this,arguments);};
      tutorialGuideInfo.__srNoRebirthV276=true;
    }
  }catch(_){}
  wrapScreen('accueil',function(h){return cleanText(stripRebirthHtml(h));});
  wrapScreen('classement',cleanText);wrapScreen('parametres',cleanText);
  try{
    if(typeof SCREENS!=='undefined'&&SCREENS){
      var progress=function(){
        if(typeof scrHub==='function')return scrHub('Progression',[{label:'Ascension',icon:'star',go:'ascension',desc:'Progression de haut niveau et étoiles d’Ascension.'}]);
        return typeof scrAscension==='function'?scrAscension():'';
      };
      progress.__srNoRebirthV276=true;SCREENS.progression=progress;SCREENS.rebirth=progress;
    }
  }catch(_){}
  try{
    if(typeof ACT!=='undefined'&&ACT){
      ACT.doRebirth=function(){try{if(typeof toast==='function')toast('Le Rebirth a été retiré du jeu');}catch(_){}return false;};
      ACT.buyRebirth=function(){return false;};
    }
  }catch(_){}
  try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
}

/* Remove obsolete PR boosts already present in old saves. No conversion/refund. */
function purgeSanctuaryPR(){
  try{
    if(typeof S==='undefined'||!S||!S.sanctuary)return;
    var st=S.sanctuary;
    if(st.boostItems&&Object.prototype.hasOwnProperty.call(st.boostItems,'pr50_60'))delete st.boostItems.pr50_60;
    if(st.activeBoosts&&Object.prototype.hasOwnProperty.call(st.activeBoosts,'pr'))delete st.activeBoosts.pr;
  }catch(_){}
}
function addAccel60(q){
  try{var d=typeof ACCEL_DEFS!=='undefined'&&ACCEL_DEFS.find(function(a){return Number(a.mins)===60;});if(d){S.accels=S.accels||{};S.accels[d.key]=(Number(S.accels[d.key])||0)+q;}}catch(_){}
}
function addBoost(st,key,q){st.boostItems=st.boostItems&&typeof st.boostItems==='object'?st.boostItems:{};st.boostItems[key]=(Number(st.boostItems[key])||0)+(Number(q)||1);}
function sacrificeSansPR(rarity){
  try{
    var st=typeof sanctMergeState==='function'?sanctMergeState():(S.sanctuary||{}),idx=(st.mergeBoard||[]).indexOf(rarity);if(idx<0)return false;
    var label=rarity==='DIVIN'?'Divin':'Immortel I';
    var reward=rarity==='DIVIN'?'25× Accélérateur 60 min + 5× +50% Or d’étage · 5 h + 5× +50% XP d’étage · 5 h + 50× Sceaux de stabilité + 15× Clés universelles + 1× Jeton Divin + Titre « Divin » (1re fois)':'5× Clés universelles + 15× Sceaux de stabilité + 3× +50% Or d’étage · 1 h + 3× +50% XP d’étage · 1 h';
    if(!confirm('Sacrifier '+label+' ?\n\nRécompense : '+reward+'\n\nLa pièce sera définitivement consommée.'))return true;
    st.mergeBoard[idx]=null;
    if(rarity==='DIVIN'){
      addAccel60(25);st.stabilitySeals=(Number(st.stabilitySeals)||0)+50;S.universalKeys=(Number(S.universalKeys)||0)+15;st.divineTokens=(Number(st.divineTokens)||0)+1;
      addBoost(st,'gold50_300',5);addBoost(st,'xp50_300',5);
      if(!st.divineTitleUnlocked){st.divineTitleUnlocked=true;S.titles=S.titles||{};S.titles.divin=true;}
    }else{
      S.universalKeys=(Number(S.universalKeys)||0)+5;st.stabilitySeals=(Number(st.stabilitySeals)||0)+15;addBoost(st,'gold50_60',3);addBoost(st,'xp50_60',3);
    }
    st.sacrifices=(Number(st.sacrifices)||0)+1;purgeSanctuaryPR();
    try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
    try{if(typeof toast==='function')toast(label+' sacrifié · récompenses obtenues',true);}catch(_){}
    try{if(typeof render==='function')render();}catch(_){}
    return true;
  }catch(_){return false;}
}

/* Capture before the Sanctuary app-level handler so the two former PR rewards
   can be granted identically minus PR / PR boost. */
window.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-sanct-v130]'):null;if(!b)return;
  var a=b.getAttribute('data-sanct-v130'),rar=b.getAttribute('data-rarity'),key=b.getAttribute('data-key');
  if(a==='boost'&&key==='pr50_60'){
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();purgeSanctuaryPR();try{dirty=true;if(typeof saveNow==='function')saveNow();if(typeof render==='function')render();}catch(_){}return;
  }
  if(a==='sacrifice'&&(rar==='DIVIN'||rar==='IMMORTEL_I')){
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();sacrificeSansPR(rar);
  }
},true);

function sanitizeAccomplishments(html){
  if(typeof html!=='string')return html;
  html=html.replace(/1(?:[\s\u202f])000\s*PR\s*\+\s*/gi,'');
  try{
    var t=document.createElement('template');t.innerHTML=html;
    Array.prototype.slice.call(t.content.querySelectorAll('.card.frame')).forEach(function(c){var b=c.querySelector('.b');if(b&&norm(b.textContent).trim()==='rebirth')c.remove();});
    Array.prototype.slice.call(t.content.querySelectorAll('.sect')).forEach(function(s){if(norm(s.textContent).trim()==='rebirth'){var p=s.parentElement;if(p)p.remove();}});
    return t.innerHTML;
  }catch(_){return html;}
}
function installAccomplishments(){
  try{
    if(typeof openModal==='function'&&!openModal.__srNoRebirthV276){
      var oldOpen=openModal;
      var wrapped=function(content,title){if(norm(title).trim()==='accomplissements')content=sanitizeAccomplishments(content);return oldOpen(content,title);};
      wrapped.__srNoRebirthV276=true;openModal=wrapped;
    }
  }catch(_){}
}
/* floor75 previously granted 1,000 PR + 30 common fusion pieces. Keep only the
   non-PR reward and mark the accomplishment normally. Window capture precedes
   the older document-level claim handler. */
window.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('.srAch139 [data-ach="floor75"]'):null;if(!b)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  try{
    if(Number(S.recordFloor)<75)return;
    var grant=function(s){s.accomplishments=s.accomplishments&&typeof s.accomplishments==='object'?s.accomplishments:{};var ac=s.accomplishments;ac.claimed=ac.claimed&&typeof ac.claimed==='object'?ac.claimed:{};if(ac.claimed.floor75)return;ac.mergePieces=ac.mergePieces&&typeof ac.mergePieces==='object'?ac.mergePieces:{};ac.mergePieces.COMMUN=(Number(ac.mergePieces.COMMUN)||0)+30;ac.claimed.floor75=true;};
    if(typeof update==='function')update(grant);else{grant(S);dirty=true;if(typeof saveNow==='function')saveNow();}
    if(typeof toast==='function')toast('Récompense reçue !',true);
    if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();
  }catch(_){}
},true);

purgeSanctuaryPR();installScreens();installAccomplishments();
/* Dynamic UI layers load shortly after window load. Re-assert the retirement a
   few times, then stop: no observer/permanent timer is left behind. */
var tries=0,t=setInterval(function(){tries++;purgeSanctuaryPR();installScreens();installAccomplishments();if(tries>=18)clearInterval(t);},150);
})();
