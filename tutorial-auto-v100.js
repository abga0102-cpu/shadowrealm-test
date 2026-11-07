/* SHADOWREACH · tutorial sequencing + AUTO unlock v100 / V460 · Phase 2C
   - Tutorial cards never stack over a modal/result window.
   - V460 introductions trigger on the destination's first mounted frame, before interaction.
   - Delayed modal/boot checks are route-scoped so stale intros cannot appear after leaving.
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

    function scheduleTutorialCheck(delay, routeSnapshot){
      clearTimeout(tutorialTimer);
      var wait=Math.max(0,Number(delay)||0);
      var expected=routeSnapshot || (typeof route!=='undefined'?route:null);
      tutorialTimer=setTimeout(function(){
        tutorialTimer=0;
        if(blockingUiOpen())return;
        if(expected && typeof route!=='undefined' && route!==expected)return;
        nativeCheckTutorial(expected);
      },wait);
    }

    checkTutorial = function(expectedRoute){
      /* render() calls us only after the destination DOM is mounted. Run the
         contextual intro synchronously on that first frame; do not add another
         timer that lets the player interact before onboarding appears. */
      if (blockingUiOpen()) return;
      var expected=expectedRoute || (typeof route!=='undefined'?route:null);
      if(expected && typeof route!=='undefined' && route!==expected)return;
      nativeCheckTutorial(expected);
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
        scheduleTutorialCheck(0, typeof route!=='undefined'?route:null);
      }
    });

    /* Initial boot waits for the first renderer. The route snapshot prevents a
       boot/modal callback from resurrecting an intro after navigation changed. */
    window.addEventListener('load', function(){
      scheduleTutorialCheck(80, typeof route!=='undefined'?route:null);
    }, {once:true});
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
