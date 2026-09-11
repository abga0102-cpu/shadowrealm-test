/* SHADOWREACH · radial tree safety/economy v83
   - Preserves the five mastery keys when legacy migration order would otherwise drop them.
   - Raid Évolution PE reward ownership now lives solely in raid-pe-authority-v290.js.
*/
(function(){
  'use strict';

  var MASTERY_IDS = ['mk_familier','mk_or','mk_minerai','mk_pe','mk_competence'];

  /* game-2 peut charger/migrer avant personal-tree-radial-v82.js. La migration
     supprime normalement les ids qu'elle ne connaît pas encore. On relit donc
     uniquement les cinq ids officiels depuis le JSON brut et on les restaure.
     Aucun autre champ de sauvegarde n'est réécrit ici. */
  function restoreMasteryProgress(){
    if (typeof S === 'undefined' || !S || !S.tree || typeof localStorage === 'undefined') return;
    try {
      var rawText = localStorage.getItem('shadowreach.save.local');
      if (!rawText) return;
      var raw = JSON.parse(rawText);
      var rt = raw && raw.tree;
      if (!rt) return;
      var levels = rt.levels || {};
      S.tree.levels = S.tree.levels || {};
      MASTERY_IDS.forEach(function(id){
        var saved = Number(levels[id] || 0);
        if (saved > 0 && typeof TREE_BY_ID !== 'undefined' && TREE_BY_ID[id]) {
          S.tree.levels[id] = Math.min(1, saved);
        }
      });

      /* Une recherche de clé en cours doit elle aussi survivre au redémarrage. */
      if (!S.tree.active && MASTERY_IDS.indexOf(rt.active) >= 0 &&
          typeof TREE_BY_ID !== 'undefined' && TREE_BY_ID[rt.active]) {
        var end = Number(rt.activeEnd || 0);
        if (end > 0) {
          S.tree.active = rt.active;
          S.tree.activeLevel = 1;
          S.tree.activeEnd = end;
        }
      }
    } catch(e) {
      console.warn('radial mastery restore skipped', e);
    }
  }
  restoreMasteryProgress();

  /* Audit léger, sans modifier la partie. Le PE Raid Évolution est validé
     contre l'autorité canonique V290 une fois le runtime chargé. */
  window.__srTreeAudit = function(){
    var issues = [];
    if (typeof TREE_BY_ID === 'undefined') issues.push('TREE_BY_ID absent');
    MASTERY_IDS.forEach(function(id){
      var n = typeof TREE_BY_ID !== 'undefined' ? TREE_BY_ID[id] : null;
      if (!n) { issues.push(id + ': absent'); return; }
      if (!n.masteryKey || n.max !== 1) issues.push(id + ': définition invalide');
      if (!Array.isArray(n.masteryReq) || !n.masteryReq.length) issues.push(id + ': prérequis absents');
      (n.masteryReq || []).forEach(function(req){ if (!TREE_BY_ID[req]) issues.push(id + ': prérequis inconnu ' + req); });
      if (!Array.isArray(n.times) || n.times[0] !== 604800) issues.push(id + ': durée base != 7 jours');
    });
    var pe1 = typeof raidReward === 'function' ? raidReward('evolution',1) : null;
    var pe2 = typeof raidReward === 'function' ? raidReward('evolution',2) : null;
    if (pe1 !== 100) issues.push('PE Raid Evolution niv1=' + pe1);
    if (pe2 !== 103) issues.push('PE Raid Evolution niv2=' + pe2);
    return { ok: issues.length === 0, issues: issues, peEvolution:[pe1,pe2] };
  };
})();