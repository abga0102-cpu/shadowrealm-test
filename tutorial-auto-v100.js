/* SHADOWREACH · tutorial sequencing + AUTO unlock v100 / V459 · Phase 2C
   - Tutorial cards never stack over a modal/result window.
   - V459 introductions are route-aware and trigger as soon as the destination system mounts.
   - Tutorial sequencing consumes the canonical modal lifecycle instead of DOM mutation.
   - Automatic skill casting unlocks at character level 10.
*/
(function(){
  'use strict';
  if (window.__srTutorialAutoV100) return;
  window.__srTutorialAutoV100 = true;
  window.__srTutorialModalPhase2C = true;

  if (typeof S === 'undefined') return;

  var AUTO_UNLOCK_LEVEL = 10;

  /* ---------- AUTO skills: level 10 gate ---------- */
  function enforceAutoGate(){
    if ((Number(S.level)||1) < AUTO_UNLOCK_LEVEL && S.autoSkills) {
      S.autoSkills = false;
      try { if (typeof saveNow === 'function') saveNow(); } catch(_) {}
    }
  }
  enforceAutoGate();

  if (typeof ACT !== 'undefined' && ACT) {
    ACT.autoSkills = function(){
      if ((Number(S.level)||1) < AUTO_UNLOCK_LEVEL) {
        if (S.autoSkills) {
          S.autoSkills = false;
          try { if (typeof saveNow === 'function') saveNow(); } catch(_) {}
        }
        if (typeof toast === 'function') toast('AUTO débloqué au niveau ' + AUTO_UNLOCK_LEVEL, false);
        if (typeof render === 'function') render();
        return;
      }
      if (typeof update === 'function') update(function(s){ s.autoSkills = !s.autoSkills; });
      else S.autoSkills = !S.autoSkills;
      if (typeof toast === 'function') toast(S.autoSkills ? 'Compétences automatiques' : 'Compétences manuelles', !!S.autoSkills);
      if (typeof render === 'function') render();
    };
  }

  if (typeof skillSlotsHTML === 'function') {
    var nativeSkillSlotsHTML = skillSlotsHTML;
    skillSlotsHTML = function(){
      enforceAutoGate();
      var html = nativeSkillSlotsHTML.apply(this, arguments);
      if ((Number(S.level)||1) >= AUTO_UNLOCK_LEVEL) return html;
      return String(html)
        .replace(/data-act="autoSkills"/g, 'data-act="locked" data-arg="10"')
        .replace(/title="Compétences manuelles"/g, 'title="AUTO débloqué au niveau 10"')
        .replace(/title="Compétences automatiques"/g, 'title="AUTO débloqué au niveau 10"')
        .replace('<span>AUTO</span>', '<span>NIV.10</span>');
    };
  }

  /* ---------- Tutorial: one UI step at a time ---------- */
  function blockingUiOpen(){
    if (typeof window.__srGetModalStatePhase2C === 'function') return !!window.__srGetModalStatePhase2C();
    return !!document.getElementById('overlay');
  }

  if (typeof checkTutorial === 'function') {
    var nativeCheckTutorial = checkTutorial;
    var tutorialTimer = 0;

    function scheduleTutorialCheck(delay){
      clearTimeout(tutorialTimer);
      var wait=Math.max(0,Number(delay)||0);
      tutorialTimer=setTimeout(function(){
        tutorialTimer=0;
        if(blockingUiOpen())return;
        nativeCheckTutorial();
      },wait);
    }

    checkTutorial = function(){
      /* A modal/result owns the screen until it closes. Otherwise the system
         renderer has already mounted the destination, so route-aware onboarding
         should appear immediately rather than waiting for a return to Home. */
      if (blockingUiOpen()) return;
      scheduleTutorialCheck(0);
    };

    function removeTutorialBehindModal(){
      var card = document.getElementById('tutorialCard');
      if (!card) return;
      if (typeof clearTutorialGuide === 'function') clearTutorialGuide();
      card.remove();
      /* Do NOT mark it seen: it will be proposed again after the modal. */
      if (typeof tutorialCurrentKey !== 'undefined') tutorialCurrentKey = null;
    }

    /* The modal owner emits one coalesced state transition after open/close.
       Tutorial reacts to that lifecycle instead of watching #app mutations. */
    window.addEventListener('sr:modal-state', function(e){
      var open = e && e.detail ? !!e.detail.open : blockingUiOpen();
      if (open) {
        clearTimeout(tutorialTimer);
        removeTutorialBehindModal();
      } else {
        scheduleTutorialCheck(0);
      }
    });

    /* Initial boot still waits for the first renderer; later navigation is immediate. */
    window.addEventListener('load', function(){ scheduleTutorialCheck(80); }, {once:true});
  }

  /* V446: permanent contextual help complements the one-time tutorial. It is
     loaded here so it stays independent from screen renderers and can be reused
     by every system without duplicating modal logic. */
  if (!window.__srSystemInfoV446 && !document.querySelector('script[data-sr-system-info-v446]')) {
    var helpScript = document.createElement('script');
    helpScript.src = 'system-info-v446.js?v=2026.09.24.446';
    helpScript.async = false;
    helpScript.setAttribute('data-sr-system-info-v446', '1');
    document.body.appendChild(helpScript);
  }
})();
