/* SHADOWREACH · radial tree safety/economy v83
   - Audits the five mastery-key definitions after V82 owns their legacy-save restoration.
   - Raid Évolution PE reward ownership lives solely in raid-pe-authority-v290.js.
*/
(function(){
  'use strict';

  var MASTERY_IDS = ['mk_familier','mk_or','mk_minerai','mk_pe','mk_competence'];

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
