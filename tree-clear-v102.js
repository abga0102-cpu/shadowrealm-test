/* SHADOWREACH - Personal tree clear renderer v102
   UI only. Keeps TREE_NODES, requirements, costs, levels, timers and saves. */
(function () {
  'use strict';
  if (typeof TREE_NODES === 'undefined' || typeof treeLv !== 'function' || typeof treeReqOk !== 'function') return;

  var BRANCHES = [
    { id: 'familier', label: 'FAMILIER', sub: 'Oeufs', color: '#F5C542', icon: '🐾' },
    { id: 'or', label: 'OR', sub: 'Autonomie', color: '#E8B44A', icon: '●' },
    { id: 'minerai', label: 'MINERAIS', sub: 'Forge', color: '#8FC4FF', icon: '⛏' },
    { id: 'pe', label: 'PE', sub: 'Recherche', color: '#57E07A', icon: '◆' },
    { id: 'competence', label: 'COMPETENCE', sub: 'Equipement', color: '#B15CF6', icon: '✦' }
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[c];
    });
  }

  function branchId(n) {
    var e = n.effect || '';
    if (n.masteryKey) {
      if (n.raidTarget === 'evolution') return 'pe';
      return n.raidTarget || 'pe';
    }
    if (e === 'petDmg' || e === 'petHp' || e === 'eggFree' || e === 'eggSlot' || e.indexOf('hatch_') === 0) return 'familier';
    if (e === 'goldAll' || e === 'afkGain' || e === 'afkTime') return 'or';
    if (e.indexOf('forge') === 0) return 'minerai';
    if (e === 'peRaid' || e === 'research' || e === 'techCost') return 'pe';
    if (e === 'skillDmg' || e === 'skillFree' || e === 'skillCost' || e === 'passDmg' || e === 'passHp' || e.indexOf('eq_') === 0) return 'competence';
    return 'pe';
  }

  function subLabel(n, id) {
    var e = n.effect || '';
    if (id === 'familier' && (e === 'eggFree' || e === 'eggSlot' || e.indexOf('hatch_') === 0)) return 'OEUFS';
    if (id === 'or' && e === 'afkTime') return 'AUTONOMIE';
    if (id === 'minerai') return 'FORGE';
    if (id === 'pe' && (e === 'research' || e === 'techCost')) return 'RECHERCHE';
    if (id === 'competence' && e.indexOf('eq_') === 0) return 'EQUIPEMENT';
    return '';
  }

  function masteryProgress(n) {
    var req = n.masteryReq || [];
    var done = 0;
    for (var i = 0; i < req.length; i++) if (treeLv(S, req[i]) >= 2) done++;
    return done + '/' + req.length;
  }

  function nodeCard(n, branch, active, remain) {
    var lv = treeLv(S, n.id);
    var maxed = lv >= n.max;
    var busy = active === n.id;
    var open = treeReqOk(S, n);
    var border = open ? branch.color : '#34435E';
    if (maxed) border = '#57E07A';
    if (busy) border = '#FFD65E';
    var state = lv + '/' + n.max;
    if (n.masteryKey) state = lv ? 'OBTENUE' : masteryProgress(n);
    if (busy && typeof fmtTime === 'function') state = fmtTime(remain);
    var sub = subLabel(n, branch.id);
    var cls = 'srTreeNode';
    if (!open) cls += ' locked';
    if (maxed) cls += ' maxed';
    if (busy) cls += ' busy';
    return '<button class="' + cls + '" data-act="treeNode" data-arg="' + esc(n.id) + '" style="--branch:' + border + '">' +
      '<span class="srTreeNodeIcon">' + (n.masteryKey ? '🔑' : '◆') + '</span>' +
      '<span class="srTreeNodeText"><strong>' + esc(n.short || n.label || n.id) + '</strong>' +
      (sub ? '<small>' + sub + '</small>' : '') + '</span>' +
      '<span class="srTreeNodeState">' + esc(state) + '</span>' +
      '</button>';
  }

  function forgeTreeGraph(active, remain) {
    var groups = {};
    for (var b = 0; b < BRANCHES.length; b++) groups[BRANCHES[b].id] = { 1: [], 2: [], 3: [], 4: [], key: [] };
    for (var i = 0; i < TREE_NODES.length; i++) {
      var n = TREE_NODES[i];
      if (n.deprecatedKey) continue;
      var id = branchId(n);
      if (!groups[id]) continue;
      if (n.masteryKey) groups[id].key.push(n);
      else if (n.tier >= 1 && n.tier <= 4) groups[id][n.tier].push(n);
    }

    var html = '<div class="srTreeClear"><div class="srTreeCore"><b>NOYAU</b><span>5 voies de progression</span></div>';
    for (var bi = 0; bi < BRANCHES.length; bi++) {
      var branch = BRANCHES[bi];
      var g = groups[branch.id];
      html += '<section class="srTreeBranch" style="--branch:' + branch.color + '">';
      html += '<header><span class="srTreeBranchIcon">' + branch.icon + '</span><div><b>' + branch.label + '</b><small>Voie secondaire : ' + branch.sub + '</small></div></header>';
      for (var tier = 1; tier <= 4; tier++) {
        var arr = g[tier];
        arr.sort(function (a, z) { return (a.row - z.row) || (a.lane - z.lane) || a.id.localeCompare(z.id); });
        html += '<div class="srTreeTier"><div class="srTreeTierTitle"><span></span>PALIER ' + tier + '</div>';
        for (var ni = 0; ni < arr.length; ni++) html += nodeCard(arr[ni], branch, active, remain);
        html += '</div>';
        if (tier === 2 && g.key.length) {
          html += '<div class="srTreeMastery"><div class="srTreeMasteryTitle">MAITRISE DE LA VOIE</div>';
          for (var ki = 0; ki < g.key.length; ki++) html += nodeCard(g.key[ki], { id: branch.id, color: '#FFD65E' }, active, remain);
          html += '</div>';
        }
      }
      html += '</section>';
    }
    html += '</div>';
    return html;
  }

  treeGraph = forgeTreeGraph;
  try { window.treeGraph = forgeTreeGraph; } catch (e) {}

  var style = document.createElement('style');
  style.textContent =
    '.srTreeClear{padding:10px 8px 28px;background:linear-gradient(180deg,#060A12,#0A1020);border-radius:18px;color:#EEF4FF}' +
    '.srTreeCore{margin:4px auto 18px;max-width:330px;padding:15px;text-align:center;border:1px solid #52DDE5;border-radius:18px;background:linear-gradient(135deg,#142A40,#09111E);box-shadow:0 0 24px rgba(82,221,229,.08)}' +
    '.srTreeCore b{display:block;font-size:18px}.srTreeCore span{display:block;margin-top:3px;color:#82E9EE;font-size:11px;font-weight:800}' +
    '.srTreeBranch{margin:0 0 18px;padding:10px;border:1px solid color-mix(in srgb,var(--branch) 45%,#26344F);border-radius:18px;background:#0A111D}' +
    '.srTreeBranch>header{display:flex;align-items:center;gap:11px;padding:8px 7px 13px;border-bottom:1px solid #1D2A3F}' +
    '.srTreeBranchIcon{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:color-mix(in srgb,var(--branch) 14%,#09111E);color:var(--branch);font-size:21px}' +
    '.srTreeBranch header b{display:block;color:var(--branch);font-size:16px;letter-spacing:.6px}.srTreeBranch header small{display:block;color:#8D9DB8;margin-top:2px}' +
    '.srTreeTier{position:relative;padding:12px 0 1px}.srTreeTierTitle{display:flex;align-items:center;gap:7px;color:#9FB0CA;font-size:10px;font-weight:900;letter-spacing:1px;margin:0 4px 8px}.srTreeTierTitle span{width:7px;height:7px;border-radius:50%;background:var(--branch)}' +
    '.srTreeNode{width:100%;min-height:58px;margin:0 0 8px;padding:8px 10px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:8px;text-align:left;border:1.5px solid var(--branch);border-radius:14px;background:#101A2A;color:#F4F7FC;box-shadow:none}' +
    '.srTreeNode.locked{opacity:.58;background:#080D16}.srTreeNode.maxed{background:#10251A}.srTreeNode.busy{background:#28200D}' +
    '.srTreeNodeIcon{display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--branch);border-radius:50%;color:var(--branch);background:#070C14}' +
    '.srTreeNodeText strong{display:block;font-size:12px;line-height:1.2}.srTreeNodeText small{display:block;margin-top:4px;color:var(--branch);font-size:8px;font-weight:900;letter-spacing:.7px}' +
    '.srTreeNodeState{color:var(--branch);font-size:11px;font-weight:900;white-space:nowrap}' +
    '.srTreeMastery{margin:9px 0 3px;padding:9px;border:1px solid rgba(255,214,94,.35);border-radius:14px;background:rgba(255,214,94,.04)}.srTreeMasteryTitle{text-align:center;color:#FFD65E;font-size:9px;font-weight:900;letter-spacing:1px;margin-bottom:8px}' +
    '.srRadialTree{display:none!important}';
  document.head.appendChild(style);
  window.__srTreeClearV102 = true;
  try { if (typeof render === 'function') render(); } catch (e) {}
})();