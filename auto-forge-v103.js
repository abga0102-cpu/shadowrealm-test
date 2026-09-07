/* SHADOWREACH · Auto-Forge unlock v103
   Auto-Forge is unavailable before character level 10.
   This is additive: previous tutorial/boss/tree patches remain untouched.
*/
(function(){
  'use strict';
  if (window.__srAutoForgeV103) return;
  window.__srAutoForgeV103 = true;

  var AUTO_FORGE_UNLOCK_LEVEL = 10;

  function belowUnlock(){
    return typeof S !== 'undefined' && (Number(S.level) || 1) < AUTO_FORGE_UNLOCK_LEVEL;
  }

  function enforceState(){
    if (typeof S === 'undefined' || !S.forge) return;
    if (belowUnlock() && S.forge.autoForge) {
      S.forge.autoForge = false;
      try {
        if (typeof autoForgeTimer !== 'undefined' && autoForgeTimer !== null) {
          clearTimeout(autoForgeTimer);
          autoForgeTimer = null;
        }
      } catch(_) {}
      try { if (typeof saveNow === 'function') saveNow(); } catch(_) {}
    }
  }

  function lockAutoForgeControls(){
    if (!belowUnlock()) return;
    document.querySelectorAll('[data-act="autoForge"]').forEach(function(el){
      el.setAttribute('data-act','locked');
      el.setAttribute('data-arg',String(AUTO_FORGE_UNLOCK_LEVEL));
      el.setAttribute('title','Auto-Forge débloquée au niveau 10');
      var label = el.querySelector('span');
      if (label) label.textContent = 'NIV.10';
      el.classList.remove('on');
      el.classList.add('off');
    });
  }

  enforceState();

  if (typeof toggleAutoForge === 'function') {
    var nativeToggleAutoForge = toggleAutoForge;
    toggleAutoForge = function(){
      if (belowUnlock()) {
        enforceState();
        if (typeof toast === 'function') toast('Auto-Forge débloquée au niveau 10', false);
        if (typeof render === 'function') render();
        return false;
      }
      return nativeToggleAutoForge.apply(this, arguments);
    };
  }

  if (typeof ACT !== 'undefined' && ACT) {
    ACT.autoForge = function(){
      if (belowUnlock()) {
        enforceState();
        if (typeof toast === 'function') toast('Auto-Forge débloquée au niveau 10', false);
        if (typeof render === 'function') render();
        return;
      }
      if (typeof toggleAutoForge === 'function') toggleAutoForge();
      if (typeof toast === 'function') toast('Auto-Forge ' + (S.forge.autoForge ? 'activée' : 'désactivée'), !!S.forge.autoForge);
    };
  }

  var observer = new MutationObserver(function(){
    enforceState();
    lockAutoForgeControls();
  });
  observer.observe(document.getElementById('app') || document.body, {childList:true, subtree:true});

  window.addEventListener('load', function(){
    enforceState();
    lockAutoForgeControls();
  }, {once:true});

  setTimeout(function(){
    enforceState();
    lockAutoForgeControls();
  }, 0);
})();
