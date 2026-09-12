/* SHADOWREACH V315 · Forge -> Raid onboarding
   New-player flow:
   - A fresh hero starts with 250 Minerai (25 paid Forge crafts at 10 each).
   - Forge remains available immediately, so it can be discovered during floors 1-3.
   - When the hero can no longer afford one Forge craft, Raids unlock permanently.
   - The tutorial then guides the player to Defis -> Raids and explains that
     Raid Minerai is the renewable source for Forge resources.

   Existing saves are never reduced to 250 Minerai. Saves that had already
   reached the historical level-5 Raid gate keep Raid access automatically. */
(function(){
  'use strict';
  if (window.__srForgeRaidOnboardingV315) return;
  window.__srForgeRaidOnboardingV315 = true;

  var START_MINERAI = 250;
  var LEGACY_START_MINERAI = 400;
  var LEGACY_RAID_LEVEL = (typeof RULES !== 'undefined' && Number(RULES.RAID_UNLOCK_LEVEL)) || 5;
  var FRESH_WINDOW_MS = 5 * 60 * 1000;

  function craftCost(s){
    try { return Math.max(1, Number(forgeCost(s && s.forge ? s.forge.level : 1)) || 1); }
    catch (_) { return 10; }
  }

  function noEquipmentProgress(s){
    try {
      if ((s.inventory || []).length) return false;
      return !Object.keys(s.equipped || {}).some(function(k){ return !!s.equipped[k]; });
    } catch (_) { return false; }
  }

  function looksLikeBrandNewLegacyDefault(s){
    if (!s) return false;
    var age = Date.now() - (Number(s.firstSeen) || 0);
    return age >= 0 && age <= FRESH_WINDOW_MS &&
      Number(s.level || 1) === 1 && Number(s.floor || 1) === 1 &&
      Number(s.exp || 0) === 0 && Number(s.statPoints || 0) === 0 &&
      Number(s.minerai || 0) === LEGACY_START_MINERAI &&
      Number(s.forge && s.forge.summonCount || 0) === 0 &&
      noEquipmentProgress(s);
  }

  function hasRaidHistory(s){
    try {
      if (s.tutorial && s.tutorial.seen && s.tutorial.seen.raid) return true;
      var ids = (typeof RAID_IDS !== 'undefined' && RAID_IDS) || Object.keys(s.raids || {});
      return ids.some(function(id){
        var r = s.raids && s.raids[id];
        return !!r && (Number(r.record || 0) > 0 || Number(r.level || 1) > 1 || Number(r.stars || 0) > 0);
      });
    } catch (_) { return false; }
  }

  function ensureOnboarding(s){
    if (!s) return s;
    var changed = false;

    if (!s.onboardingV315 || typeof s.onboardingV315 !== 'object') {
      var legacyUnlocked = Number(s.level || 1) >= LEGACY_RAID_LEVEL || hasRaidHistory(s);
      s.onboardingV315 = {
        startMineralsApplied: false,
        raidUnlocked: !!legacyUnlocked,
        raidUnlockedReason: legacyUnlocked ? 'legacy' : ''
      };
      changed = true;
    }

    var o = s.onboardingV315;
    if (!o.startMineralsApplied && looksLikeBrandNewLegacyDefault(s)) {
      s.minerai = START_MINERAI;
      o.startMineralsApplied = true;
      changed = true;
    }

    /* New defaultState() calls already enter here at 250. Mark them as having
       received the new start without touching an older save that owns 250 by chance. */
    if (!o.startMineralsApplied && Number(s.minerai || 0) === START_MINERAI &&
        Number(s.level || 1) === 1 && Number(s.floor || 1) === 1 &&
        Number(s.forge && s.forge.summonCount || 0) === 0 &&
        (Date.now() - (Number(s.firstSeen) || 0)) <= FRESH_WINDOW_MS) {
      o.startMineralsApplied = true;
      changed = true;
    }

    if (!o.raidUnlocked && Number(s.minerai || 0) < craftCost(s)) {
      o.raidUnlocked = true;
      o.raidUnlockedReason = 'minerai';
      o.raidUnlockedAt = Date.now();
      changed = true;
    }

    return changed ? s : s;
  }

  function raidUnlocked(s){
    ensureOnboarding(s);
    return !!(s && s.onboardingV315 && s.onboardingV315.raidUnlocked);
  }

  function persistUnlockIfChanged(before){
    if (typeof S === 'undefined' || !S) return;
    ensureOnboarding(S);
    var after = raidUnlocked(S);
    if (!before && after) {
      try { if (typeof saveNow === 'function') saveNow(); } catch (_) {}
      try { if (typeof scheduleRender === 'function') scheduleRender(); } catch (_) {}
      try { if (typeof checkTutorial === 'function') setTimeout(checkTutorial, 180); } catch (_) {}
    }
  }

  /* Every future fresh state receives 250 directly. The live state is also
     normalized below because S may already have been created before this layer loads. */
  try {
    if (typeof defaultState === 'function' && !defaultState.__srV315) {
      var nativeDefaultState = defaultState;
      defaultState = function(name){
        var s = nativeDefaultState.apply(this, arguments);
        s.minerai = START_MINERAI;
        s.onboardingV315 = { startMineralsApplied:true, raidUnlocked:false, raidUnlockedReason:'' };
        return s;
      };
      defaultState.__srV315 = true;
    }
  } catch (_) {}

  /* Imported/loaded legacy saves get compatibility access without losing resources. */
  try {
    if (typeof migrate === 'function' && !migrate.__srV315) {
      var nativeMigrate = migrate;
      migrate = function(){ return ensureOnboarding(nativeMigrate.apply(this, arguments)); };
      migrate.__srV315 = true;
    }
  } catch (_) {}
  try {
    if (typeof loadSave === 'function' && !loadSave.__srV315) {
      var nativeLoadSave = loadSave;
      loadSave = function(){ var s = nativeLoadSave.apply(this, arguments); return s ? ensureOnboarding(s) : s; };
      loadSave.__srV315 = true;
    }
  } catch (_) {}

  /* Paid and AUTO Forge both pass through forgeSummon, so the exact craft that
     exhausts the 250 starting Minerai becomes the single authoritative unlock. */
  try {
    if (typeof forgeSummon === 'function' && !forgeSummon.__srV315) {
      var nativeForgeSummon = forgeSummon;
      forgeSummon = function(){
        var before = (typeof S !== 'undefined' && S) ? raidUnlocked(S) : false;
        var out = nativeForgeSummon.apply(this, arguments);
        persistUnlockIfChanged(before);
        return out;
      };
      forgeSummon.__srV315 = true;
    }
  } catch (_) {}

  function raidResourceTutorial(){
    return {
      key:'raid',
      title:'Raids débloqués',
      sub:"Tu n’as plus assez de Minerai pour forger. Ouvre Défis, puis Raids et lance le Raid Minerai pour refaire tes réserves."
    };
  }

  /* Keep the existing tutorial ordering. Only replace the old level-5 Raid
     condition with the resource-depletion trigger. */
  try {
    if (typeof pendingTutorialStep === 'function' && !pendingTutorialStep.__srV315) {
      var nativePendingTutorialStep = pendingTutorialStep;
      pendingTutorialStep = function(){
        ensureOnboarding(S);
        var step = nativePendingTutorialStep.apply(this, arguments);
        var unlocked = raidUnlocked(S);
        if (step && step.key === 'raid') {
          if (!unlocked) return null;
          return S.onboardingV315.raidUnlockedReason === 'minerai' ? raidResourceTutorial() : step;
        }
        if (step) return step;
        var seen = S.tutorial && S.tutorial.seen;
        if (unlocked && seen && !seen.raid && S.onboardingV315.raidUnlockedReason === 'minerai') {
          return raidResourceTutorial();
        }
        return null;
      };
      pendingTutorialStep.__srV315 = true;
    }
  } catch (_) {}

  /* scrRaid still contains the historical level-5 guard. Keep its full native
     implementation, but bypass that obsolete guard only for an already-unlocked
     V315 player. RULES is restored synchronously before returning. */
  try {
    if (typeof scrRaid === 'function' && !scrRaid.__srV315) {
      var nativeScrRaid = scrRaid;
      scrRaid = function(){
        ensureOnboarding(S);
        if (!raidUnlocked(S)) {
          return topbar('Raids') + '<div class="pad mt6"><div class="notice center">' +
            'Les Raids se débloquent quand tu n’as plus assez de Minerai pour forger.</div></div>';
        }
        if (Number(S.level || 1) >= LEGACY_RAID_LEVEL) return nativeScrRaid.apply(this, arguments);
        var oldGate = RULES.RAID_UNLOCK_LEVEL;
        try {
          RULES.RAID_UNLOCK_LEVEL = 1;
          return nativeScrRaid.apply(this, arguments);
        } finally {
          RULES.RAID_UNLOCK_LEVEL = oldGate;
        }
      };
      scrRaid.__srV315 = true;
      if (typeof SCREENS !== 'undefined' && SCREENS) SCREENS.raid = scrRaid;
    }
  } catch (_) {}

  /* Normalize whichever state already exists at script load without lowering
     a progressed/older save. */
  try {
    if (typeof S !== 'undefined' && S) {
      var had = !!(S.onboardingV315 && S.onboardingV315.raidUnlocked);
      ensureOnboarding(S);
      if (!had && raidUnlocked(S)) {
        try { if (typeof saveNow === 'function') saveNow(); } catch (_) {}
      }
    }
  } catch (_) {}

  window.__srV315EnsureOnboarding = ensureOnboarding;
  window.__srV315RaidUnlocked = raidUnlocked;
  window.__srForgeRaidOnboardingConfigV315 = {
    startMinerai: START_MINERAI,
    craftCost: 10,
    paidCraftsBeforeRaid: 25,
    legacyRaidLevel: LEGACY_RAID_LEVEL
  };
})();
