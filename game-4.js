/* =========================================================================
   SCREENS
   ========================================================================= */

/* ---------------- ACCUEIL ---------------- */
function scrAccueil() {
  const pendingBoss = Number(S.pendingBossFloor || 0);
  const canRetryBoss = pendingBoss === S.floor + 1 && isBoss(pendingBoss) && !(S.bossClears && S.bossClears[String(pendingBoss)]);
  const atMax = S.forge.level >= RULES.FORGE_MAX;
  const upgCost = forgeUpgCostFor(S);
  const upgTime = forgeUpgTimeFor(S);
  const upgrading = S.forge.upgradeEnd > Date.now();
  const upgRemain = upgrading ? (S.forge.upgradeEnd - Date.now()) / 1000 : 0;
  const upgDone = S.forge.upgradeEnd > 0 && !upgrading;

  // Une recommandation réelle, calculée à partir de l'état du joueur.
  // Elle reste actionnable même lorsque la fonctionnalité se trouve sur un autre écran.
  const readyEggCount = (S.eggs || []).filter((e) => eggIsHatching(e) && e.hatchEnd <= Date.now()).length;
  const readyResearch = !!(S.tree && S.tree.active && S.tree.activeEnd <= Date.now());
  const readyRaid = RAID_IDS.find((id) => S.raids[id] && S.raids[id].keys > 0);
  const affordableTree = !S.tree.active && TREE_NODES.some((n) => treeCanBuy(S, n));
  let recommended;
  if (canRetryBoss) {
    recommended = { icon: "skull", title: "Affronter le Boss " + pendingBoss,
      sub: "Le Boss bloque le prochain étage.", cls: "red", act: "bossRetry" };
  } else if (upgDone) {
    recommended = { icon: "hammer", title: "Récupérer la Forge",
      sub: "L’amélioration est terminée.", cls: "green", act: "forgeCollect" };
  } else if (readyEggCount > 0) {
    recommended = { icon: "egg", title: "Récupérer " + readyEggCount + " œuf" + (readyEggCount > 1 ? "s" : ""),
      sub: "Une éclosion terminée t’attend.", cls: "green", act: "go", arg: "familiers" };
  } else if (readyResearch) {
    recommended = { icon: "tree", title: "Récupérer la recherche",
      sub: "Le bonus de l’Arbre est prêt.", cls: "green", act: "go", arg: "arbre" };
  } else if (readyRaid) {
    recommended = { icon: "flame", title: "Utiliser une clé de Raid",
      sub: RAIDS[readyRaid].reward + " est disponible.", cls: "red", act: "go", arg: "defis" };
  } else if (!S.forge.autoForge && S.minerai >= forgeCost(S.forge.level)) {
    recommended = { icon: "hammer", title: "Forger une pièce",
      sub: "Tu as assez de minerai.", cls: "blue", act: "forge", arg: 1 };
  } else if (affordableTree) {
    recommended = { icon: "tree", title: "Développer un bonus",
      sub: "Une amélioration de l’Arbre est disponible.", cls: "green", act: "go", arg: "developpement" };
  } else {
    recommended = { icon: "swords", title: "Vérifier l’équipement",
      sub: "Optimise ton héros pendant sa progression.", cls: "blue", act: "go", arg: "equipement" };
  }
  const recommendedCard = '<div class="pad recommendedWrap"><div class="card recommendedActionCard">' +
    '<div class="recommendedKicker">' + ic("bolt", 11) + ' ACTION RECOMMANDÉE</div>' +
    '<div class="between gap8 mt4"><div class="flex1"><div class="bb recommendedTitle">' +
    esc(recommended.title) + '</div><div class="mute tiny mt3">' + esc(recommended.sub) + '</div></div>' +
    btn(ic(recommended.icon, 14) + ' OUVRIR', { cls: recommended.cls, small: true, act: recommended.act,
      arg: recommended.arg, primary: true, style: "width:auto;min-width:92px;flex:0 0 auto" }) +
    '</div></div></div>';

  const pet = S.pets.find((p) => p.id === S.activePetId);
  // Keep AUTO's visual phase continuous even though the home screen re-renders.
  // Negative delays resume the CSS animations at the real elapsed phase instead
  // of visibly restarting them after every game render.
  const forgeNow = Date.now();
  const forgeSweepDelay = -(forgeNow % 1500);
  const forgeHammerDelay = -(forgeNow % 480);

  // skill bar
  let sb = skillSlotsHTML();
  sb += '<div class="petMini" data-act="go" data-arg="familiers"><img src="' + petArt(pet) + '">' +
    '<div class="flex1"><div class="mute tiny b">FAMILIER</div><div class="bb" style="font-size:11.5px;color:' +
    (pet ? RARITY[pet.rarity].c : C.textMute) + '">' + (pet ? RARITY[pet.rarity].label : "Aucun") + "</div>" +
    (pet ? '<div class="tiny b" style="color:' + petElement(pet).c + '">' + esc(petFullName(pet)) + "</div>" : "") +
    "</div>" +
    ic("chevron", 11) + "</div>";

  // forge upgrade block — Gold + upgrade time only
  const goldOk = S.gold >= upgCost;
  const forgeAccels = ACCEL_DEFS.filter((a) => (S.accels[a.key] || 0) > 0).map((a) =>
    '<span class="pill" data-act="accel" data-arg="' + a.key + '" data-arg2="forge"' +
    ' style="cursor:pointer;color:#8FEFF4;border-color:var(--cyan)">' + ic("bolt", 10) + a.label + " ×" + S.accels[a.key] + "</span>").join("");

  let upg;
  if (atMax) {
    upg = '<div class="mute tiny center mt4"><b class="gt">Forge au niveau maximum</b></div>';
  } else if (upgrading) {
    upg = '<div class="card lit mt4" style="padding:4px 7px">' +
      '<div class="row gap8"><div class="flex1">' +
        '<div class="b" style="font-size:9px;color:var(--goldLit)">AMÉLIORATION → NIV.' + (S.forge.level + 1) + "</div>" +
        '<div class="mt4">' + bar(100 - (upgRemain / Math.max(1, upgTime)) * 100, C.gold, 5) + "</div></div>" +
      '<b class="row gap3" style="color:var(--goldLit);font-size:11px">' + ic("clock", 11) + fmtTime(upgRemain) + "</b></div>" +
      '<div class="row gap3 mt3" style="flex-wrap:nowrap;overflow-x:auto">' +
        (forgeAccels || '<span class="mute tiny">Aucun accélérateur</span>') + "</div></div>";
  } else if (upgDone) {
    upg = '<div class="mt6">' + btn(ic("check", 13) + "Récupérer Niv." + (S.forge.level + 1), { cls: "green", small: true, act: "forgeCollect" }) + "</div>";
  } else {
    const goldPct = Math.min(100, (S.gold / Math.max(1, upgCost)) * 100);
    const condBar = (okFlag, label, val, pct, col) =>
      '<div class="fgCond"><div class="lbl"><span class="mute">' + label + "</span>" +
      '<span style="color:' + (okFlag ? "var(--greenLit)" : "var(--textMute)") + '">' + val + "</span></div>" +
      bar(pct, okFlag ? C.green : col, 4) + "</div>";
    upg = '<div class="fgRow mt6">' +
        condBar(goldOk, "Or", fmt(S.gold) + "/" + fmt(upgCost), goldPct, C.gold) +
        btn('<span class="col" style="align-items:center;line-height:1.1">' +
          '<span class="row gap3">' + ic("hammer", 12) + "Niv." + (S.forge.level + 1) + "</span>" +
          '<span style="font-size:8.5px;opacity:.8">' + (upgTime <= 0 ? "INSTANT" : fmtTime(upgTime)) + "</span></span>",
          { small: true, cls: goldOk ? "green" : "", act: "forgeUpgradeAsk",
            style: "width:auto;padding:4px 9px;flex:0 0 auto" }) +
      "</div>";
  }
  const fCost = forgeCost(S.forge.level);
  // Navigation regroupée : Forge reste visible sur l'écran Combat; les systèmes
  // secondaires sont réunis dans des hubs cohérents au lieu de multiplier les fenêtres.
  const navBtns = [
    { label: "Équipement", icon: "swords", color: "#5A7099", go: "equipement", badge: S.inventory.length > 0 },
    { label: "Développement", icon: "tree", color: "#2F8A45", go: "developpement",
      badge: !S.tree.active && TREE_NODES.some((n) => treeCanBuy(S, n)) },
    { label: "Défis", icon: "flame", color: "#C22127", go: "defis",
      badge: RAID_IDS.some((r) => S.raids[r].keys > 0) || nextMegaBossFloor(S) !== null },
  ];
  const sysBtns = [
    { label: "Clan", icon: "banner", color: "#B0862C", go: "clan", lock: S.level < 10 ? 10 : 0 },
    { label: "Boutique", icon: "shop", color: "#3B7FC4", go: "boutique" },
    { label: "Progression", icon: "cycle", color: "#6B3AC4", go: "progression",
      badge: canRebirth() || S.ascensionAvailable },
    { label: "Événement", icon: "gift", color: "#C22127", go: "evenement", badge: true },
    { label: "Classement", icon: "trophy", color: "#5A7099", go: "classement" },
  ];
  const tile = (b) => {
    const art = ASSETS["nav_" + b.go];
    // a locked tile keeps its artwork, drained of colour, so it stays recognisable
    const inner = art
      ? '<div class="navInner art' + (b.lock ? " lk" : "") + '"><img src="' + art + '" alt="">' +
          (b.lock ? '<div class="lkIco">' + ic("lock", 22) + "</div>" : "") +
          (b.badge && !b.lock ? '<div class="dot"></div>' : "") + "</div>"
      : '<div class="navInner" style="background:linear-gradient(' + shade(b.color, 14) + "," + shade(b.color, -32) + ')">' +
          (b.lock ? ic("lock", 22) : ic(b.icon, 27)) +
          (b.badge && !b.lock ? '<div class="dot"></div>' : "") + "</div>";
    return '<div class="navBtn" data-act="' + (b.lock ? "locked" : "go") + '" data-arg="' + (b.lock || b.go) + '">' +
      inner + '<div class="navLbl">' + (b.lock ? "Niv." + b.lock : b.label) + "</div></div>";
  };

  const wtHome = WEAPON_TYPES[D.weapon] || WEAPON_TYPES.epee;
  const wArt = ASSETS["weapon_" + D.weapon];
  const wRar = S.equipped.arme ? RARITY[S.equipped.arme.rarity] : null;
  const wCol = wRar ? wRar.c : "#d6dae4";
  return recommendedCard + '<div id="arenaSlot"></div>' +
    '<div id="skillbar">' +
      '<div class="slot" data-act="go" data-arg="equipement" title="' + esc(wtHome.name) +
        '" style="border-color:' + wCol + '66">' +
        (wArt ? '<img src="' + wArt + '" style="width:26px;height:26px;object-fit:contain;' +
                "filter:drop-shadow(0 0 5px " + wCol + '99)">' : ic("sword", 22)) +
        '<i class="catBar" style="background:' + wCol + '"></i>' +
      "</div>" + sb + "</div>" +
    '<div id="fxbar"></div>' +
    '<div class="pad mt4"><div class="card frame homeForge">' +
      '<div class="fgRow">' +
        '<div class="imini" style="width:21px;height:21px;border-color:var(--goldDim);flex:0 0 auto">' + ic("hammer", 12) + "</div>" +
        '<span class="bb gt" style="font-size:11px;letter-spacing:.6px;flex:0 0 auto">FORGE NIV.' + S.forge.level + "</span>" +
        '<div class="iBtn" data-act="rarityInfo" title="Raretés">i</div>' +
        starRow("forge", "var(--goldLit)") +
        '<div class="flex1"></div>' +
        '<div class="row gap3 b" style="color:var(--blueLit);font-size:11px;flex:0 0 auto">' + ic("minerai", 12) + fmt(S.minerai) + "</div>" +
      "</div>" +
      upg +
      ascendCta("forge") +
      ((forgeAnimActive() || S.forge.autoForge)
        ? (S.forge.autoForge
          ? '<div class="forgeAnim autoLoop compactAuto mt6" style="--forgeSweepDelay:' + forgeSweepDelay + 'ms;--forgeHammerDelay:' + forgeHammerDelay + 'ms"><div class="forgeAnimBar"></div>' +
            '<div class="forgeAutoIcon">'+ic("hammer",18)+'</div><div class="forgeAutoText"><span class="b small">Auto-Forge active</span><span class="tiny mute">Forge en continu · inventaire mis à jour automatiquement</span></div>' +
            '<div class="tgl on" data-act="autoForge" style="position:relative;z-index:2;pointer-events:auto"><span>AUTO</span><i></i></div></div>'
          : '<div class="forgeAnim mt6"><div class="forgeAnimBar"></div><div class="forgeScene" style="position:relative;z-index:1"><div class="forgeAnvil"></div><div class="forgeHammerHit">'+ic("hammer",42)+'</div><div class="forgeSpark"></div></div><div class="row gap6" style="position:relative;z-index:1;justify-content:center"><span class="b small">Forge en cours · ' + forgeAnim.n + ' pièce' + (forgeAnim.n > 1 ? 's' : '') + '</span></div></div>')
        :
      '<div class="row gap6 mt6">' +
        btn('<span class="row gap6">' + ic("hammer", 14) + "Forger</span>" +
            '<span class="row gap4">' + ic("minerai", 12) + fmt(fCost) + "</span>",
          { cls: "blue", small: true, act: "forge", arg: 1, dis: S.minerai < fCost,
            style: "justify-content:space-between" }) +
        // a batch stops early when the Minerai runs out, so the total is marked
        // when you cannot cover the whole lot rather than promising all of it
        (forgeBatch(S) > 1 ? btn('<span class="col" style="align-items:center;line-height:1.1">' +
            "<span>x" + forgeBatch(S) + "</span>" +
            '<span class="row gap2" style="font-size:9px;opacity:' +
              (S.minerai >= fCost * forgeBatch(S) ? ".8" : ".95;color:#FFC7A0") + '">' +
              ic("minerai", 9) + fmt(fCost * forgeBatch(S)) + "</span></span>",
          { cls: "blue", small: true, act: "forge", arg: forgeBatch(S),
            dis: S.minerai < fCost, style: "max-width:76px" }) : "") +
        '<div class="tgl ' + (S.forge.autoForge ? "on" : "off") + '" data-act="autoForge">' +
          "<span>AUTO</span><i></i></div>" +
      "</div>") +
      // section 14: what the filter is doing, and a way in
      '<div class="fgFilter mt6" data-act="forgeFilter">' +
        ic("trash", 12) +
        '<span class="flex1 tiny b">' +
          (!S.forge.filter || !forgeDiscarded(S).length
            ? "Filtre · tout est conservé"
            : "Filtre · " + forgeDiscarded(S).map((r) => RARITY[r].label).join(", ") +
              " → poussière") + "</span>" +
        '<span class="pill" style="color:' + (S.forge.filter ? "var(--purpleLit)" : "var(--dim)") +
          ";border-color:" + (S.forge.filter ? "var(--purple)" : "var(--line)") + '">' +
          (S.forge.filter ? "ACTIF" : "INACTIF") + "</span>" +
      "</div>" +
    "</div></div>" +
    progressionGoalHTML(S) +
    '<div class="navGrid homeNavPrimary">' + navBtns.map(tile).join("") + "</div>" +
    '<details class="homeMore mt4" data-home-more="1"' + (homeMoreOpen ? ' open' : '') + '><summary>' + ic("menu", 12) + 'Plus' +
      (sysBtns.some((b) => b.badge && !b.lock) ? '<span class="dot"></span>' : '') +
      '</summary><div class="navGrid homeNavSecondary mt4">' + sysBtns.map(tile).join("") + "</div></details>" +
    '<div style="height:4px"></div>';
}

/* ---------------- PERSONNAGE ---------------- */
const STAT_META = [
  { key: "sante",   label: "Santé",              icon: "heart",  color: "#E5484D", desc: "+20 PV max / point" },
  { key: "degats",  label: "Dégâts",             icon: "flame",  color: "#FF7A3D", desc: "+2.2 dégâts / point (mêlée &amp; distance)" },
  { key: "crit",    label: "Chance Critique",    icon: "bolt",   color: "#F5C542", desc: "+0.2% critique / point" },
  { key: "critred", label: "Réduc. Dégâts Crit.",icon: "shield", color: "#4A90D9", desc: "-0.3% dégâts crit. reçus / point" },
];
/* The four skill slots, shared by the home screen and by any screen that shows
   the arena. updateCombatHud() drives the cooldown rings off whatever
   #skillbar is in the DOM, so a raid gets live cooldowns for free. */
/* How many slots the player has actually earned. The fifth was advertised on a
   locked tile but nothing ever granted it -- reaching level 100 now does. */
function skillSlotCount(s) {
  return RULES.SKILL_SLOTS_BASE;
}
/* Manual cast: same effect path as the automatic one, refused when the skill is
   on cooldown or there is nothing to hit. Returns why it failed so the UI can
   say something useful rather than going quiet. */
function castSkill(sid) {
  const c = combat;
  if (!c || c.status !== "fight") return "pas de combat";
  if (!sid || !S.skills[sid]) return "aucune compétence";
  const def = SKILL_BY_ID[sid];
  if (!def) return "aucune compétence";
  if (skillsFizzle(c)) return "le regard annule tout sort";
  if (skillSealed(c, sid)) return "compétence scellée";
  if ((c.skillCds[sid] || 0) > 0.05) return "en recharge";
  const dv = D;
  const target = c.enemies.filter((e) => e.alive).sort((a, b) => a.x - b.x)[0];
  if (!target) return "aucune cible";
  const now = Date.now();
  c.skillCds[sid] = def.cd * (1 - (dv.skillCdCut || 0) / 100);
  c.skillCdMax[sid] = c.skillCds[sid];
  const fxKind = def.fx || "impact";
  c.skillFxs.push({ id: def.id, color: def.color, fx: fxKind, life: vfxDur(fxKind), max: vfxDur(fxKind) });
  if (c.skillFxs.length > 4) c.skillFxs.shift();
  if (def.mult > 0) {
    const sdmg = Math.floor(skillDamageMult(dv.damage * skillMult(def), S.skills[sid].level)
      * (1 + (dv.skillDmgBonus || 0) / 100));
    const wide = def.type === "AOE" || def.type === "CHAINE" || def.type === "DEBUFF";
    const struck = wide ? c.enemies.filter((e) => e.alive) : [target];
    scheduleHit(c, skillHitDelay(fxKind), () => {
      struck.forEach((e) => { if (e && e.alive) applyDamageToEnemy(c, e, sdmg, true, def.color, "skill"); });
    });
  }
  if (def.heal) {
    const amt = Math.floor(c.heroMaxHP * skillHeal(def, S.skills[sid].level) / 100);
    c.heroHP = Math.min(c.heroMaxHP, c.heroHP + amt);
    c.burn = 0;
    c.floats.push({ id: rid(), x: c.heroX, val: amt, crit: false, color: "#84E891", born: now, heal: true });
  }
  if (def.eff) applyHeroEffect(c, def.cat === "DEBUFF" ? "debuffs" : "buffs", skillEff(def, S.skills[sid].level), now);
  return null;
}
function skillSlotsHTML() {
  let sb = "";
  const open = skillSlotCount(S);
  for (let i = 0; i < open; i++) {
    const sid = S.skillSlots[i];
    const def = sid ? SKILL_DEFS.find((x) => x.id === sid) : null;
    const cat = def ? SKILL_CATS[def.cat] : null;
    // a filled slot casts; an empty one still takes you to the roster
    const sealed = def && skillSealed(combat, def.id);
    sb += '<div class="slot' + (sealed ? " sealed" : "") + '" data-act="' + (def ? "castSkill" : "go") +
      '" data-arg="' + (def ? def.id : "competences") + '"' +
      (def ? ' data-skill="' + def.id + '"' : "") + ">" + (def
      ? '<div class="skfx" style="background:linear-gradient(' + shade(def.color, 26) + "," + shade(def.color, -34) + ')">' +
        ic(def.icon, 24) + "</div>" +
        '<svg class="cdRing" viewBox="0 0 46 46"><circle cx="23" cy="23" r="20" stroke="#050A12" stroke-width="3" opacity="0"/>' +
        '<circle class="cdArc" cx="23" cy="23" r="20" stroke="' + (cat ? cat.c : def.color) +
          '" stroke-width="3" stroke-dasharray="125.6" stroke-dashoffset="125.6"/></svg>' +
        '<div class="cdTxt"></div>' +
        '<div class="fxBub" style="display:none;color:' + (cat ? cat.c : def.color) + '"></div>' +
        '<i class="catBar" style="background:' + (cat ? cat.c : def.color) + '"></i>' +
        '<span class="lv">' + (S.skills[sid] ? S.skills[sid].level : 1) + "</span>"
      : ic("plus", 18)) + "</div>";
  }
  sb += '<div class="autoSk ' + (S.autoSkills ? "on" : "off") + '" data-act="autoSkills" ' +
    'title="' + (S.autoSkills ? "Compétences automatiques" : "Compétences manuelles") + '">' +
    ic("bolt", 12) + "<span>AUTO</span><i></i></div>";
  return sb;
}
/* compact combat strip: what you are fighting with, plus the skill cooldowns */
function combatBarHTML() {
  const wt = WEAPON_TYPES[D.weapon] || WEAPON_TYPES.epee;
  const art = ASSETS["weapon_" + D.weapon];
  const rar = S.equipped.arme ? RARITY[S.equipped.arme.rarity] : null;
  const col = rar ? rar.c : "#d6dae4";
  return '<div id="skillbar">' +
    '<div class="slot" data-act="go" data-arg="equipement" style="border-color:' + col + '66">' +
      (art ? '<img src="' + art + '" style="width:26px;height:26px;object-fit:contain;' +
             "filter:drop-shadow(0 0 5px " + col + '99)">' : ic("sword", 22)) +
      '<i class="catBar" style="background:' + col + '"></i>' +
    "</div>" + skillSlotsHTML() + "</div>" +
    '<div id="fxbar"></div>';
}

/* Ancien écran Personnage supprimé : les routes Personnage/Inventaire utilisent désormais l’écran Équipement unifié. */

/* ---------------- ÉQUIPEMENT / INVENTAIRE ---------------- */

/* Bulk recycle. S.inventory only ever holds UNEQUIPPED gear -- equipItem moves
   the item into S.equipped and pushes the replaced one back -- so this can
   never eat what the hero is wearing. It still confirms first: it is the only
   irreversible action in the game that can touch dozens of items at once. */
function recycleValue(it) { return dustValue(S, it); }
function recycleBatch(rarity) {
  const hit = S.inventory.filter((x) => x.rarity === rarity);
  if (!hit.length) return { n: 0, dust: 0 };
  const dust = hit.reduce((a, x) => a + recycleValue(x), 0);
  update((st) => {
    st.inventory = st.inventory.filter((x) => x.rarity !== rarity);
    st.poussiere += dust;
  });
  return { n: hit.length, dust: dust };
}
function showRecyclePicker() {
  const rows = EQUIP_RARITY_ORDER.map((r) => {
    const hit = S.inventory.filter((x) => x.rarity === r);
    const dust = hit.reduce((a, x) => a + recycleValue(x), 0);
    const c = RARITY[r].c;
    return '<div class="itemRow" style="border-left-color:' + c + ";opacity:" + (hit.length ? 1 : 0.4) +
      '" data-act="setRecycleRarity" data-arg="' + r + '">' +
      '<div class="imini" style="width:22px;height:22px;border-color:' + c + '80">' + ic("bag", 12) + "</div>" +
      '<div class="flex1"><div class="b small" style="color:' + c + '">' + RARITY[r].label + "</div>" +
      '<div class="mute tiny b">' + hit.length + " objet" + (hit.length > 1 ? "s" : "") +
        (hit.length ? " · +" + fmt(dust) + " poussière" : "") + "</div></div>" +
      (recycleRarity === r ? '<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Choisi</span>' : "") +
      "</div>";
  }).join("");
  openModal(rows + '<div class="mt6">' + btn("Fermer", { cls: "ghost", small: true, act: "closeModal" }) + "</div>",
    "Choisir une rareté");
}
function askRecycleBatch() {
  const hit = S.inventory.filter((x) => x.rarity === recycleRarity);
  const c = RARITY[recycleRarity].c;
  if (!hit.length) { toast("Aucun objet " + RARITY[recycleRarity].label); return; }
  const dust = hit.reduce((a, x) => a + recycleValue(x), 0);
  const best = hit.slice().sort((a, b) => b.power - a.power)[0];
  openModal('<div class="center" style="margin-bottom:6px">' + ic("trash", 30) + "</div>" +
    '<div class="modalT center" style="color:' + c + '">' + hit.length + " OBJET" + (hit.length > 1 ? "S" : "") + "</div>" +
    '<div class="dim small center" style="margin:4px 0 8px;line-height:1.5">Recycler tous tes objets <b style="color:' +
      c + '">' + RARITY[recycleRarity].label + "</b> ?<br>Tu récupères <b style=\"color:var(--purpleLit)\">" +
      fmt(dust) + '</b> poussière.</div>' +
    '<div class="card" style="padding:7px 9px"><div class="kv"><span class="dim">Meilleur objet concerné</span><b>' +
      esc(SLOT_LABEL[best.slot] || best.slot) + " · " + fmt(best.power) + "</b></div>" +
    '<div class="kv"><span class="dim">Équipement porté</span><b style="color:var(--greenLit)">jamais touché</b></div></div>' +
    '<div class="mute tiny center mt6">Action irréversible.</div>' +
    '<div class="row gap6 mt8">' +
      btn("Annuler", { cls: "ghost", small: true, act: "closeModal" }) +
      btn(ic("trash", 13) + "Recycler", { cls: "red", small: true, act: "doRecycleBatch" }) +
    "</div>", "Recyclage groupé");
}
/* ---------------- INVENTAIRE ---------------- */
let invFilter = "ALL";
let equipPreviewSet = {};
let skillFilter = "ALL";
let recycleRarity = "COMMUN";
let recycleSelectMode = false;
let recycleSelectedIds = new Set();
let recycleSlots = new Set();
function selectedRecycleItems() { return S.inventory.filter((x) => recycleSelectedIds.has(x.id)); }
function recycleItemsByIds(ids) {
  const set = new Set(ids);
  const hit = S.inventory.filter((x) => set.has(x.id));
  const dust = hit.reduce((a,x)=>a+recycleValue(x),0);
  if (!hit.length) return {n:0,dust:0};
  update((st)=>{ st.inventory=st.inventory.filter((x)=>!set.has(x.id)); st.poussiere+=dust; });
  return {n:hit.length,dust};
}
function showRecycleSlotsPicker() {
  const rows=SLOTS.map((slot)=>{ const hit=S.inventory.filter(x=>x.slot===slot); const on=recycleSlots.has(slot); return '<div class="itemRow" data-act="toggleRecycleSlot" data-arg="'+slot+'" style="cursor:pointer;border-left-color:'+(on?'var(--purple)':'var(--line)')+'"><div class="flex1"><div class="b small">'+SLOT_LABEL[slot]+'</div><div class="mute tiny">'+hit.length+' objet'+(hit.length>1?'s':'')+'</div></div><span class="pill" style="color:'+(on?'var(--greenLit)':'var(--textMute)')+';border-color:'+(on?'#3FB950':'var(--line)')+'">'+(on?'Sélectionnée':'Choisir')+'</span></div>'; }).join('');
  const hit=S.inventory.filter(x=>recycleSlots.has(x.slot)); const dust=hit.reduce((a,x)=>a+recycleValue(x),0);
  openModal(rows+'<div class="notice mt6">'+hit.length+' objet'+(hit.length>1?'s':'')+' · +'+fmt(dust)+' poussière</div><div class="row gap6 mt8">'+btn('Fermer',{cls:'ghost',small:true,act:'closeModal'})+btn(ic('trash',12)+' Recycler catégories',{cls:'red',small:true,act:'askRecycleSlots',dis:!hit.length})+'</div>','Recycler par catégories');
}
function askRecycleIds(ids,title) {
  const hit=S.inventory.filter(x=>ids.includes(x.id)); if(!hit.length){toast('Aucun objet sélectionné');return;}
  const dust=hit.reduce((a,x)=>a+recycleValue(x),0);
  openModal('<div class="center">'+ic('trash',30)+'</div><div class="modalT center mt6">'+hit.length+' OBJET'+(hit.length>1?'S':'')+'</div><div class="dim small center mt6">Tu récupères <b style="color:var(--purpleLit)">'+fmt(dust)+'</b> poussière.<br>L’équipement porté ne sera jamais touché.</div><div class="mute tiny center mt6">Action irréversible.</div><div class="row gap6 mt8">'+btn('Annuler',{cls:'ghost',small:true,act:'closeModal'})+btn(ic('trash',12)+' Recycler',{cls:'red',small:true,act:'doRecycleSelected',arg:ids.join(',')})+'</div>',title);
}
function scrInventaire() {
  const list = invFilter === "ALL" ? S.inventory : S.inventory.filter((i) => i.slot === invFilter);
  const sorted = list.slice().sort((a, b) =>
    (equipRank(b.rarity) - equipRank(a.rarity)) || (b.power - a.power));
  const res = [
    { icon: "gold", label: "Or", v: S.gold, c: C.gold },
    { icon: "minerai", label: "Minerai", v: S.minerai, c: C.blue },
    { icon: "poussiere", label: "Poussière", v: S.poussiere, c: "#B15CF6" },
    { icon: "eclat", label: "Éclat", v: S.eclat, c: "#9B5CF6" },
    { icon: "essence", label: "Essence", v: S.essence, c: "#FF7A3D" },
    { icon: "gem", label: "Gemmes", v: S.gems, c: "#FF4D8D" },
    { icon: "chart", label: "PE", v: S.pe || 0, c: "#3FCFD6" },
  ];
  const filters = ["ALL"].concat(SLOTS);

  return topbar("Inventaire", '<span class="pill">' + S.inventory.length + " objets</span>") +
    '<div class="pad mt6">' +
      '<div class="card frame"><div class="row" style="flex-wrap:wrap">' + res.map((r) =>
        '<div class="row gap6" style="width:33.33%;padding:6px 0">' + ic(r.icon, 20) +
        '<div><div class="mute tiny b" style="letter-spacing:.3px">' + r.label.toUpperCase() +
        '</div><div class="bb" style="font-size:13px;color:' + r.c + '">' + fmt(r.v) + "</div></div></div>").join("") + "</div></div>" +
      '<div class="seg mt10">' + filters.map((f) =>
        '<span class="' + (invFilter === f ? "on" : "") + '" data-act="invFilter" data-arg="' + f + '">' +
        (f === "ALL" ? "Tout" : SLOT_LABEL[f]) + "</span>").join("") + "</div>" +
      // pick a rarity, then clear every unequipped item of it in one go
      (() => {
        const n = S.inventory.filter((x) => x.rarity === recycleRarity).length;
        const c = RARITY[recycleRarity].c;
        return '<div class="row gap6 mt6">' +
          btn('<span class="row gap4" style="min-width:0"><i class="rdot" style="background:' + c + ";color:" + c +
              '"></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
              RARITY[recycleRarity].label + "</span></span>" +
              '<span class="mute" style="font-weight:700">' + n + "</span>",
            { small: true, cls: "ghost", act: "pickRecycleRarity",
              style: "flex:1;justify-content:space-between;padding:5px 9px" }) +
          btn(ic("trash", 12) + "Recycler tout",
            { small: true, cls: "dark", act: "askRecycleBatch", dis: n === 0,
              style: "width:auto;padding:5px 9px" }) +
        "</div>";
      })() +
      '<div class="sect" style="margin:16px 0 9px">Objets<div class="iBtn" data-act="rarityInfo" title="Raretés">i</div></div>' +
      (sorted.length === 0 ? '<div class="notice center">Aucun objet. Forge de l\'équipement depuis l\'Accueil.</div>'
        : sorted.map((it) =>
        '<div class="itemRow" style="border-left-color:' + RARITY[it.rarity].c + '">' +
          '<div class="imini" style="width:32px;height:32px;border-color:' + RARITY[it.rarity].c +
          '80;box-shadow:0 0 10px ' + RARITY[it.rarity].c + '3d">' + slotIcon(it.slot, 20, it) + "</div>" +
          '<div class="flex1"><div class="b small">' + esc(it.name) + (it.level ? ' <span style="color:var(--goldLit)">+' + it.level + "</span>" : "") + "</div>" +
          '<div class="mute tiny b row gap4">' +
          (MASTERY_STAT[it.slot] === "dmg" ? ic("sword", 9) + "+" + fmtEquipStat(it.damage)
            : ic("heart", 9) + "+" + fmtEquipStat(it.hp)) +
          (it.weaponType ? ' <span style="opacity:.8">· ' + WEAPON_TYPES[it.weaponType].name + "</span>" : "") + "</div>" +
          (it.affixes && it.affixes.length
            ? '<div class="row gap4 mt6" style="flex-wrap:wrap">' + it.affixes.map((a) =>
                '<span class="tag" style="color:' + affixColor(a) + ";border-color:" + affixColor(a) +
                '66;background:#0A101Ccc">' + affixText(a) + "</span>").join("") + "</div>"
            : "") + "</div>" +
          rtag(it.rarity) +
          '<div class="col gap4">' +
            btn("Équiper", { small: true, cls: "green", act: "equip", arg: it.id, style: "padding:5px 8px;font-size:10.5px" }) +
            btn(ic("cycle", 10) + Math.floor((equipRank(it.rarity) + 1) * 5 + it.power * 0.2),
              { small: true, cls: "dark", act: "recycle", arg: it.id, style: "padding:5px 8px;font-size:10.5px" }) +
          "</div></div>").join("")) +
    '<div style="height:2px"></div></div>';
}


/* ---------------- ÉQUIPEMENT UNIFIÉ ---------------- */
function scrHerosStats() {
  return topbar("Héros", '<span class="pill" style="color:var(--greenLit);border-color:#3FB950">' +
      ic("chart", 11) + fmt(S.statPoints || 0) + " point" + ((S.statPoints || 0) > 1 ? "s" : "") + "</span>") +
    '<div class="pad mt8">' +
      '<div class="sect" style="margin:4px 0 8px">Points de statistiques</div>' +
      '<div class="duo">' + STAT_META.map((m) =>
        '<div class="card" style="padding:9px 9px"><div class="between"><div class="b small" style="color:' + m.color + '">' +
          m.label + '</div><b>' + S.stats[m.key] + '</b></div><div class="row gap4 mt8">' +
          btn("+1", { small:true, act:"alloc", arg:m.key, arg2:1, dis:S.statPoints<1 }) +
          btn("+5", { small:true, act:"alloc", arg:m.key, arg2:5, dis:S.statPoints<5 }) +
          btn("Max", { small:true, act:"alloc", arg:m.key, arg2:"max", dis:S.statPoints<1 }) +
        '</div></div>').join('') + '</div>' +
      '<div class="mute tiny center mt10">' + fmt(S.statPoints || 0) + ' point' + ((S.statPoints || 0) > 1 ? 's' : '') + ' disponible' + ((S.statPoints || 0) > 1 ? 's' : '') + '.</div>' +
    '<div style="height:8px"></div></div>';
}

function scrEquipement() {
  const previewItems = Object.values(equipPreviewSet).map((id) => S.inventory.find((x) => x.id === id)).filter(Boolean);
  const previewBySlot = {};
  previewItems.forEach((it) => { previewBySlot[it.slot] = it; });
  const hasPreview = previewItems.length > 0;
  let previewState = null, PD = null, previewPower = S.power;
  if (hasPreview) {
    const eq = Object.assign({}, S.equipped);
    previewItems.forEach((it) => { eq[it.slot] = it; });
    previewState = Object.assign({}, S, { equipped: eq });
    PD = computeDerived(previewState);
    previewPower = computePower(previewState);
  }
  const cells = SLOTS.map((slot) => {
    const it = S.equipped[slot], prev = previewBySlot[slot], shown = prev || it;
    const col = shown ? RARITY[shown.rarity].c : "var(--border)";
    return '<div class="eqSlot' + (shown ? " rf" : "") + '" data-act="itemDetail" data-arg="' + (shown ? shown.id : "") + '" data-arg2="' + slot + '" style="border-color:' + col + (shown ? ';--rc:' + col : ';opacity:.7') + (prev ? ';box-shadow:0 0 0 2px #78B7FF,0 0 18px #78B7FF66' : '') + '">' +
      slotIcon(slot, 27, shown) + '<div class="nm" style="color:' + (shown ? RARITY[shown.rarity].c : 'var(--textMute)') + '">' + SLOT_LABEL[slot] + '</div>' +
      (shown ? '<div class="st row gap4" style="justify-content:center">' + (MASTERY_STAT[slot] === "dmg" ? ic("sword",9)+fmtEquipStat(shown.damage) : ic("heart",9)+fmtEquipStat(shown.hp)) + '</div>' +
       (prev ? '<div class="st bb" style="color:#78B7FF">TEST</div>' : (shown.level ? '<div class="st bb" style="color:var(--goldLit)">+'+shown.level+'</div>' : '')) : '<div class="st">vide</div>') + '</div>';
  }).join('');

  const statCell = (label, cur, next, color, key) => {
    const changed = next != null && String(next) !== String(cur);
    return '<div class="col" style="width:25%;padding:6px 2px;cursor:pointer" data-act="statInfo" data-arg="'+key+'">' +
      '<div class="mute tiny b" style="letter-spacing:.3px;text-transform:uppercase">'+label+'</div>' +
      '<div class="bb" style="font-size:13.5px;color:'+color+'">'+cur+'</div>' +
      (changed ? '<div class="tiny bb" style="color:#78B7FF">→ '+next+'</div>' : '') + '</div>';
  };
  const d2 = PD || D;
  const stats = [
    ["PV Max",fmt(D.maxHP),fmt(d2.maxHP),"#E5484D","maxhp"],["Dégâts",fmt(D.damage),fmt(d2.damage),"#F0883E","damage"],
    ["Vit. Attaque",D.attackSpeed.toFixed(2),d2.attackSpeed.toFixed(2),"#F5C542","atkspeed"],["Crit.",D.critChance.toFixed(1)+"%",d2.critChance.toFixed(1)+"%","#F5C542","crit"],
    ["Dégâts Crit.","x"+D.critMult.toFixed(2),"x"+d2.critMult.toFixed(2),"#FF5AA0","critmult"],["Réduc. Dégâts",D.dmgRed.toFixed(1)+"%",d2.dmgRed.toFixed(1)+"%","#4A90D9","dmgred"],
    ["Vol de Vie",D.lifesteal.toFixed(2)+"%",d2.lifesteal.toFixed(2)+"%","#3FA7FF","lifesteal"],["Double attaque",D.doubleAtk.toFixed(1)+"%",d2.doubleAtk.toFixed(1)+"%","#F5C542","doubleatk"],
    ["Vit. Déplac.",fmt(D.moveSpeed),fmt(d2.moveSpeed),"#3FCFD6","movespeed"],["Réduc. Crit.",D.critRed.toFixed(1)+"%",d2.critRed.toFixed(1)+"%","#4A90D9","critred"],
    ["Régén.",D.regen.toFixed(2)+"%/s",d2.regen.toFixed(2)+"%/s","#3FB950","regen"],["Dégâts Boss","+"+D.bossDmg.toFixed(0)+"%","+"+d2.bossDmg.toFixed(0)+"%","#E5484D","bossdmg"],
    ["Blocage",D.blockChance.toFixed(1)+"%",d2.blockChance.toFixed(1)+"%","#72A7E8","block"],
    ["Dégâts mêlée","+"+D.meleeDmg.toFixed(1)+"%","+"+d2.meleeDmg.toFixed(1)+"%","#F0883E","melee"],
    ["Dégâts distance","+"+D.rangedDmg.toFixed(1)+"%","+"+d2.rangedDmg.toFixed(1)+"%","#8FEFF4","ranged"],
    ["Dégâts compétences","+"+D.skillDmgBonus.toFixed(1)+"%","+"+d2.skillDmgBonus.toFixed(1)+"%","#C79BFF","skilldmg"],
    ["Recharge compétences","-"+D.skillCdCut.toFixed(1)+"%","-"+d2.skillCdCut.toFixed(1)+"%","#B15CF6","skillcd"],
    ["Arme",WEAPON_TYPES[D.weapon].name,WEAPON_TYPES[d2.weapon].name,"#EDE9F5","weapon"]
  ];
  const list = invFilter === "ALL" ? S.inventory : S.inventory.filter((i)=>i.slot===invFilter);
  const sorted = list.slice().sort((a,b)=>(equipRank(b.rarity)-equipRank(a.rarity)) || (b.power-a.power));
  const filters=["ALL"].concat(SLOTS);
  const previewDelta = hasPreview ? Math.round(previewPower - S.power) : 0;
  const dockStat = (label,cur,next) => '<div class="dockStat"><div class="n">'+label+'</div><div class="v" style="color:#78B7FF">'+cur+' → '+next+'</div></div>';
  // Surface the most meaningful changes first instead of merely the first four
  // fields. Relative change makes differently-scaled stats comparable.
  const statImportance = (x) => {
    const key=x[4];
    if(key==='weapon') return String(x[1])===String(x[2])?0:0.35;
    const raw={
      maxhp:[D.maxHP,d2.maxHP],damage:[D.damage,d2.damage],atkspeed:[D.attackSpeed,d2.attackSpeed],crit:[D.critChance,d2.critChance],
      critmult:[D.critMult,d2.critMult],dmgred:[D.dmgRed,d2.dmgRed],lifesteal:[D.lifesteal,d2.lifesteal],doubleatk:[D.doubleAtk,d2.doubleAtk],
      movespeed:[D.moveSpeed,d2.moveSpeed],critred:[D.critRed,d2.critRed],regen:[D.regen,d2.regen],bossdmg:[D.bossDmg,d2.bossDmg],
      block:[D.blockChance,d2.blockChance],melee:[D.meleeDmg,d2.meleeDmg],ranged:[D.rangedDmg,d2.rangedDmg],skilldmg:[D.skillDmgBonus,d2.skillDmgBonus],skillcd:[D.skillCdCut,d2.skillCdCut]
    }[key];
    if(!raw) return 0;
    const a=Number(raw[0])||0,b=Number(raw[1])||0,delta=Math.abs(b-a);
    const pctKeys=['crit','dmgred','lifesteal','doubleatk','critred','regen','bossdmg','block','melee','ranged','skilldmg','skillcd'];
    const base=pctKeys.includes(key)?Math.max(10,Math.abs(a)):Math.max(1,Math.abs(a));
    return delta/base;
  };
  const changedStats = stats.filter((x)=>String(x[1])!==String(x[2])).sort((a,b)=>statImportance(b)-statImportance(a));
  const dockPrimary = changedStats.slice(0,4);
  const dockExtra = changedStats.slice(4);
  const testDock = hasPreview ? '<div class="equipTestDock"><div class="between"><div><div class="tiny bb" style="color:#78B7FF">TEST EN DIRECT · '+previewItems.length+' PIÈCE'+(previewItems.length>1?'S':'')+'</div><div class="row gap6"><b>'+fmt(S.power)+'</b><span style="color:var(--textMute)">→</span><b style="color:'+(previewDelta>=0?'#63E889':'#FF6B72')+'">'+fmt(previewPower)+' ('+(previewDelta>=0?'+':'')+fmt(previewDelta)+')</b></div></div><div class="row gap4">'+btn("Annuler",{small:true,cls:"ghost",act:"clearEquipPreview"})+btn("Équiper",{small:true,cls:"green",act:"equipPreviewSet"})+'</div></div>'+
    (dockPrimary.length?'<div class="dockStats">'+dockPrimary.map((x)=>dockStat(x[0],x[1],x[2])).join('')+'</div>':'<div class="mute tiny center mt6">Aucune statistique affichée ne change.</div>')+
    (dockExtra.length?'<details class="equipDockMore"><summary>Détails · '+dockExtra.length+' autre'+(dockExtra.length>1?'s':'')+' changement'+(dockExtra.length>1?'s':'')+'</summary><div class="dockStats">'+dockExtra.map((x)=>dockStat(x[0],x[1],x[2])).join('')+'</div></details>':'')+
    '</div>' : '';

  return topbar("Équipement", '<span class="pill">'+S.inventory.length+' objets</span>') + '<div class="pad mt6">' +
    '<div class="sect" style="margin:4px 0 6px">Équipement porté</div><div class="slotGrid">'+cells+'</div>' +
    (hasPreview ? '<div class="notice mt8"><div class="between"><span><b style="color:#78B7FF">Mode test :</b> '+previewItems.length+' pièce'+(previewItems.length>1?'s':'')+'</span><span class="row gap4">'+btn("Annuler",{small:true,cls:"ghost",act:"clearEquipPreview"})+btn("Équiper le set",{small:true,cls:"green",act:"equipPreviewSet"})+'</span></div><div class="mute tiny mt4">Tu peux tester une pièce par emplacement avant de valider tout le set.</div></div>' : '') +
    '<div class="equipCompareSticky">' +
    '<div class="card frame"><div class="between"><div><div class="mute tiny b">PUISSANCE TOTALE</div><div class="bb gt" style="font-size:22px">'+fmt(S.power)+'</div></div>' +
    (hasPreview ? '<div class="col" style="align-items:flex-end"><div class="mute tiny b">APRÈS TEST</div><div class="bb" style="font-size:20px;color:'+(previewDelta>=0?'#63E889':'#FF6B72')+'">'+fmt(previewPower)+' ('+(previewDelta>=0?'+':'')+fmt(previewDelta)+')</div></div>' : '') + '</div></div>' +
    '<div class="sect" style="margin:10px 0 6px">Statistiques de combat</div><div class="card frame" style="padding:6px 8px"><div class="row" style="flex-wrap:wrap">'+stats.slice(0,8).map(x=>statCell(...x)).join('')+'</div>' +
    '<details class="equipStatsMore"'+(hasPreview && stats.slice(8).some(x=>String(x[1])!==String(x[2]))?' open':'')+'><summary>Voir toutes les statistiques</summary><div class="row" style="flex-wrap:wrap">'+stats.slice(8).map(x=>statCell(...x)).join('')+'</div></details></div></div>' +
    '<div class="sect" style="margin:14px 0 8px">Équipements stockés</div><div class="seg">'+filters.map((f)=>'<span class="'+(invFilter===f?'on':'')+'" data-act="invFilter" data-arg="'+f+'">'+(f==='ALL'?'Tout':SLOT_LABEL[f])+'</span>').join('')+'</div>' +
    '<div class="row gap6 mt6">'+btn(recycleSelectMode?'Annuler sélection':'Sélection manuelle',{small:true,cls:recycleSelectMode?'blue':'ghost',act:'toggleRecycleSelect'})+btn('Recycler catégories',{small:true,cls:'dark',act:'recycleSlotsPicker'})+'</div>' +
    (recycleSelectMode ? '<div class="row gap6 mt6">'+btn('Tout sélectionner'+(invFilter==='ALL'?'':' · '+SLOT_LABEL[invFilter]),{small:true,cls:'ghost',act:'selectVisibleRecycle',dis:!sorted.length})+btn(ic('trash',11)+' Recycler '+recycleSelectedIds.size+' · +'+fmt(selectedRecycleItems().reduce((a,x)=>a+recycleValue(x),0))+' Poussière',{small:true,cls:'red',act:'askRecycleSelected',dis:!recycleSelectedIds.size})+'</div>' : '') +
    (sorted.length===0 ? '<div class="notice center mt8">Aucun objet disponible.</div>' : sorted.map((it)=>'<div class="itemRow" '+(recycleSelectMode?'data-act="toggleRecycleItem" data-arg="'+it.id+'" ':'')+'style="border-left-color:'+RARITY[it.rarity].c+(recycleSelectedIds.has(it.id)?';box-shadow:inset 0 0 0 2px #B15CF6':'')+'"><div class="imini" style="width:32px;height:32px;border-color:'+RARITY[it.rarity].c+'80">'+slotIcon(it.slot,20,it)+'</div><div class="flex1"><div class="b small">'+esc(it.name)+(it.level?' <span style="color:var(--goldLit)">+'+it.level+'</span>':'')+'</div><div class="mute tiny">'+(MASTERY_STAT[it.slot]==='dmg'?ic('sword',9)+'+'+fmtEquipStat(it.damage):ic('heart',9)+'+'+fmtEquipStat(it.hp))+(it.weaponType?' · '+esc(WEAPON_TYPES[it.weaponType]?.name||it.weaponType):'')+'</div>'+(it.affixes&&it.affixes.length?'<div class="equipAffixes">'+it.affixes.slice(0,3).map((a)=>'<span class="tag" style="color:'+affixColor(a)+';border-color:'+affixColor(a)+'66">'+affixText(a)+'</span>').join('')+'</div>':'')+'</div>'+rtag(it.rarity)+(recycleSelectMode?'<span class="pill" style="color:'+(recycleSelectedIds.has(it.id)?'var(--greenLit)':'var(--textMute)')+';border-color:'+(recycleSelectedIds.has(it.id)?'#3FB950':'var(--line)')+'">'+(recycleSelectedIds.has(it.id)?'Choisi':'Choisir')+'</span>':'<div class="col gap4">'+btn(previewBySlot[it.slot]&&previewBySlot[it.slot].id===it.id?"Testé":"Tester",{small:true,cls:"blue",act:"previewEquip",arg:it.id,style:"padding:5px 8px;font-size:10.5px"})+btn("Équiper",{small:true,cls:"green",act:"equip",arg:it.id,style:"padding:5px 8px;font-size:10.5px"})+btn(ic("cycle",10)+recycleValue(it),{small:true,cls:"dark",act:"recycle",arg:it.id,style:"padding:5px 8px;font-size:10.5px"})+'</div>')+'</div>').join('')) +
    (hasPreview ? '<div class="equipPreviewSpacer"></div>' : '<div style="height:8px"></div>') + '</div>' + testDock;
}

/* ---------------- COMPÉTENCES ---------------- */
/* Skill sheet: what it does in words, what it does in numbers right now, what
   the next level changes, and how far the duplicates have got. Same shape as
   the tree-node sheet so the two read alike. */
const SKILL_TYPE_LABEL = { MONO: "Cible unique", AOE: "Toute la vague", CHAINE: "Rebonds en chaîne",
  BUFF: "Bonus sur le héros", DEBUFF: "Malus sur la vague", HEAL: "Soin immédiat" };
function skillEffectLine(def, level) {
  const e = skillEff(def, level);
  if (def.mult > 0) {
    const d = computeDerived(S);
    const raw = skillDamageMult(d.damage * skillMult(def), level) * (1 + (d.skillDmgBonus || 0) / 100);
    return fmt(Math.floor(raw)) + " dégâts" + (def.type === "MONO" ? "" : " à chaque ennemi");
  }
  if (def.heal) return "+" + skillHeal(def, level).toFixed(1) + "% des PV max, immédiat";
  if (e) {
    const unit = e.stat === "regen" ? "%/s" : "%";
    const what = e.stat === "dmg" ? "dégâts du héros" : e.stat === "dmgRed" ? "dégâts subis en moins"
      : e.stat === "haste" ? "vitesse d'attaque" : e.stat === "vuln" ? "dégâts subis par les ennemis"
      : e.stat === "slow" ? "lenteur des ennemis" : e.stat === "poison" ? "dégâts de poison par seconde"
      : e.stat === "regen" ? "régénération" : e.stat;
    return "+" + e.value + unit + " " + what + " pendant " + e.dur + "s";
  }
  return "—";
}
function showSkillCard(id) {
  const def = SKILL_BY_ID[id];
  if (!def) return;
  const sk = S.skills[id];
  const rc = RARITY[def.rarity].c;
  const cat = SKILL_CATS[def.cat];
  const lv = sk ? sk.level : 0;
  const maxed = lv >= RULES.SKILL_MAX_LEVEL;
  const need = sk ? skillDupesNeeded(lv) : 0;
  const slotIdx = S.skillSlots.indexOf(id);
  const equipped = slotIdx >= 0;
  const openSlots = skillSlotCount(S);
  const freeSlot = S.skillSlots.slice(0, openSlots).indexOf(null);

  let action, note = "";
  if (!sk) {
    action = btn(ic("lock", 13) + "Non possédée", { cls: "ghost", small: true, dis: true });
    note = "Invoque des compétences avec des Éclats. " + RARITY[def.rarity].label +
      " : " + (getRates("skill", S.skillMastery.level, S.ascension, starsOf(S, "skill"))[def.rarity] || 0).toFixed(1) +
      "% par invocation à ta Maîtrise actuelle.";
  } else if (equipped) {
    action = btn(ic("cross", 13) + "Retirer de l'emplacement " + (slotIdx + 1),
      { cls: "dark", small: true, act: "unequipSkill", arg: id });
  } else if (freeSlot >= 0) {
    action = btn(ic("check", 13) + "Équiper · emplacement " + (freeSlot + 1),
      { cls: "green", small: true, act: "autoEquipSkill", arg: id });
  } else {
    action = btn(ic("swords", 13) + "Remplacer une compétence", { cls: "blue", small: true, act: "skillSlot", arg: "0" });
    note = "Tous les emplacements sont occupés — choisis lequel remplacer.";
  }

  openModal(
    '<div class="row gap10" style="margin-bottom:9px">' +
      '<div class="imini" style="width:44px;height:44px;background:linear-gradient(180deg,' + shade(def.color, 20) + "," +
        shade(def.color, -40) + ');border-color:' + rc + ';box-shadow:0 0 12px ' + rc + '4d">' + ic(def.icon, 25) + "</div>" +
      '<div class="flex1"><div class="bb" style="font-size:14px;color:' + def.color + '">' + esc(def.name) + "</div>" +
      '<div class="row gap4 mt4" style="flex-wrap:wrap">' + rtag(def.rarity) +
        '<span class="pill" style="color:' + cat.c + ";border-color:" + cat.c + '99">' + cat.label + "</span>" +
        '<span class="pill">' + (SKILL_TYPE_LABEL[def.type] || def.type) + "</span>" +
        (sk ? '<span class="pill" style="color:' + (maxed ? "var(--greenLit)" : "var(--text)") + ";border-color:" +
          (maxed ? "#3FB950" : "#33486F") + '">Niv. ' + lv + " / " + RULES.SKILL_MAX_LEVEL + "</span>" : "") +
      "</div></div></div>" +

    '<div class="notice" style="border-left-color:' + def.color + '">' + esc(def.desc) + "</div>" +

    '<div class="card mt6" style="padding:8px 10px">' +
      '<div class="kv"><span class="dim">Effet actuel</span><b style="color:' + def.color + '">' +
        (sk ? skillEffectLine(def, lv) : "—") + "</b></div>" +
      (sk && !maxed ? '<div class="kv"><span class="dim">Au niveau ' + (lv + 1) + '</span><b style="color:var(--greenLit)">' +
        skillEffectLine(def, lv + 1) + "</b></div>" : "") +
      '<div class="kv"><span class="dim">Recharge</span><b class="row gap4">' + ic("clock", 12) + def.cd + "s</b></div>" +
      '<div class="kv"><span class="dim">Bonus de rareté</span><b style="color:' + rc + '">×' +
        skillRarityMul(def).toFixed(2) + "</b></div>" +
    "</div>" +

    (sk && !maxed
      ? '<div class="mt6"><div class="between tiny b" style="margin-bottom:3px">' +
          '<span class="mute">DOUBLONS POUR LE NIVEAU ' + (lv + 1) + "</span>" +
          '<span style="color:' + def.color + '">' + sk.count + " / " + need + "</span></div>" +
          meter((sk.count / need) * 100, def.color, "") + "</div>"
      : sk && maxed ? '<div class="mute tiny center mt6">Niveau maximum atteint.</div>' : "") +

    '<div class="mt8">' + action + "</div>" +
    (note ? '<div class="mute tiny mt6" style="line-height:1.45">' + note + "</div>" : "") +
    '<div class="mt6">' + btn("Fermer", { cls: "ghost", small: true, act: "closeModal" }) + "</div>",
    esc(def.name));
}
function scrCompetences() {
  const rates = getRates("skill", S.skillMastery.level, S.ascension, starsOf(S, "skill"));
  const mreq = masteryReq(S.skillMastery.level);
  const owned = SKILL_DEFS.filter((d) => S.skills[d.id]);

  let slots = "";
  const openSlots = skillSlotCount(S);
  for (let i = 0; i < openSlots; i++) {
    const sid = S.skillSlots[i];
    const def = sid ? SKILL_DEFS.find((x) => x.id === sid) : null;
    slots += '<div class="slot" data-act="skillSlot" data-arg="' + i + '">' + (def
      ? '<div class="skfx" style="background:linear-gradient(' + shade(def.color, 26) + "," + shade(def.color, -34) + ')">' +
        ic(def.icon, 24) + '</div><span class="lv">' + S.skills[sid].level + "</span>"
      : ic("plus", 18)) + "</div>";
  }

  return topbar("Compétences", '<span class="pill" data-act="resInfo" data-arg="eclat" style="cursor:pointer;color:#C79BFF;border-color:#9B5CF6">' + ic("eclat", 11) + fmt(S.eclat) + "</span>") +
    '<div class="pad mt6">' +
      '<div class="card frame"><div class="between"><div style="min-width:0"><div class="row gap4"><div class="bb gt" style="font-size:13px;letter-spacing:1px">MAÎTRISE COMPÉTENCE</div>' +
        starRow("skill", "#C79BFF") + "</div>" +
        '<div class="mute tiny b">' + S.skillMastery.progress + "/" + mreq + " invocations</div></div>" +
        '<b style="color:var(--purpleLit);font-size:18px;text-shadow:0 0 12px #9B5CF680">' + S.skillMastery.level + "/" + RULES.MASTERY_MAX + "</b></div>" +
        '<div class="mt8">' + meter((S.skillMastery.progress / mreq) * 100, C.purple, S.skillMastery.progress + " / " + mreq) + "</div>" +
        ascendCta("skill") +
        fold("skillRates", "Taux de rareté",
          ratesTable(rates, S.skillMastery.level < RULES.MASTERY_MAX ? getRates("skill", S.skillMastery.level + 1, S.ascension, starsOf(S, "skill")) : null,
            "Actuel", "Niv." + (S.skillMastery.level + 1)), "margin:2px 0 0") +
        '<div class="row gap6 mt6">' +
          btn(ic("sparkle", 14) + "Invoquer · " + skillSummonCost(S), { cls: "purple", small: true, act: "summonSkill", arg: 1, dis: S.eclat < skillSummonCost(S) }) +
          btn("x10 · " + skillSummonCost(S) * 10, { cls: "purple", small: true, act: "summonSkill", arg: 10, dis: S.eclat < skillSummonCost(S) * 10, style: "max-width:96px" }) +
        "</div></div>" +
      '<div class="sect" style="margin:16px 0 9px">Emplacements actifs</div>' +
      '<div class="row gap6">' + slots + "</div>" +
      '<div class="mute tiny mt4">Les compétences équipées se déclenchent seules dès que leur recharge est finie.</div>' +
      '<div class="sect">Collection (' + owned.length + "/" + SKILL_DEFS.length + ")</div>" +
      // one tab per category, plus Tout; the count tells you what is left to find
      '<div class="seg">' + ["ALL"].concat(Object.keys(SKILL_CATS)).map((k) => {
        const inCat = k === "ALL" ? SKILL_DEFS : SKILL_DEFS.filter((d) => d.cat === k);
        const have = inCat.filter((d) => S.skills[d.id]).length;
        return '<span class="' + (skillFilter === k ? "on" : "") + '" data-act="skillFilter" data-arg="' + k + '">' +
          (k === "ALL" ? "Tout" : SKILL_CATS[k].label) +
          '<b style="opacity:.6;font-weight:700"> ' + have + "/" + inCat.length + "</b></span>";
      }).join("") + "</div>" +
      '<div class="skGrid mt6">' + SKILL_DEFS
        .filter((d) => skillFilter === "ALL" || d.cat === skillFilter)
        .map((def) => {
          const sk = S.skills[def.id];
          const rc = RARITY[def.rarity].c;
          const equipped = sk && S.skillSlots.includes(def.id);
          return '<div class="skTile' + (sk ? "" : " locked") + '" data-act="skillCard" data-arg="' + def.id +
            '" title="' + esc(def.name) + " · " + RARITY[def.rarity].label + '" style="border-color:' + rc + (sk ? ";box-shadow:inset 0 1px 0 #ffffff1a,0 0 9px " + rc + "44" : "") + '">' +
            (equipped ? '<div class="skEq"></div>' : "") +
            '<div style="color:' + def.color + '">' + ic(def.icon, 20) + "</div>" +
            '<div class="skNm" style="color:' + (sk ? "var(--text)" : "var(--textMute)") + '">' + def.name + "</div>" +
            (sk ? '<span class="skLv">' + sk.level + "</span>" : "") +
            "</div>";
        }).join("") + "</div>" +
      (owned.length === 0 ? '<div class="mute tiny center mt4">Aucune compétence — invoque avec des Éclats.</div>' : "") +
    '<div style="height:2px"></div></div>';
}

/* ---------------- FAMILIERS ---------------- */
function scrFamiliers() {
  const rates = getRates("pet", S.petMastery.level, S.ascension, starsOf(S, "pet"));
  const mreq = masteryReq(S.petMastery.level);
  const now = Date.now();
  const accelBtns = (targetType, id) => ACCEL_DEFS.filter((a) => (S.accels[a.key] || 0) > 0).map((a) =>
    '<span class="pill" data-act="accel" data-arg="' + a.key + '" data-arg2="' + (targetType === "egg" ? "egg:" + id : "tree") +
    '" style="cursor:pointer;color:#8FEFF4;border-color:var(--cyan)">' + ic("bolt", 10) + a.label + " ×" + S.accels[a.key] + "</span>").join("");

  let eggCells = "";
  const hatching = eggsHatching(S);
  const stored = eggsStored(S);
  for (let i = 0; i < S.eggSlots; i++) {
    const egg = hatching[i];
    const eggArt = (r) => ASSETS["egg_" + String(r).toLowerCase()];
    if (!egg) { eggCells += '<div class="eggCard mute" style="opacity:.35">' +
      (eggArt("commun") ? '<img src="' + eggArt("commun") + '" style="width:22px;height:22px;object-fit:contain;filter:grayscale(1)">' : ic("egg", 20)) +
      '<div class="tiny b mt4">Vide</div></div>'; continue; }
    const remain = (egg.hatchEnd - now) / 1000;
    const ready = remain <= 0;
    eggCells += '<div class="eggCard rf" style="border-color:' + RARITY[egg.rarity].c + ";--rc:" + RARITY[egg.rarity].c + '">' +
      '<div style="position:relative;z-index:1">' +
        (eggArt(egg.rarity) ? '<img src="' + eggArt(egg.rarity) +
          '" style="width:32px;height:32px;object-fit:contain;display:block;margin:0 auto;' +
          "filter:drop-shadow(0 2px 5px #000a)\">" : ic("egg", 28)) + "</div>" + rtag(egg.rarity) +
      '<div class="tiny b" style="color:' + petElement(egg).c + ';margin-top:3px">' +
        ic(petElement(egg).icon, 9) + petElement(egg).label + "</div>" +
      '<div class="mt6">' + (ready
        ? btn("Éclore", { small: true, cls: "green", act: "collectEgg", arg: egg.id })
        : '<div class="b tiny row gap4" style="color:var(--goldLit);justify-content:center">' + ic("clock", 10) + fmtTime(remain) + "</div>" +
          '<div class="row gap4 mt6" style="flex-wrap:wrap;justify-content:center">' + accelBtns("egg", egg.id) + "</div>") +
      "</div></div>";
  }

  const byRar = {};
  S.pets.forEach((p) => { byRar[p.rarity] = (byRar[p.rarity] || []).concat([p]); });

  const ORANGE = "#FF7A3D";
  return topbar("Familiers", '<div class="row gap4"><span class="pill" data-act="resInfo" data-arg="essence" style="cursor:pointer;color:#FFC29B;border-color:' + ORANGE + '">' + ic("essence", 11) + fmt(S.essence) + '</span><span class="pill" data-act="resInfo" data-arg="apples" style="cursor:pointer;color:#A9E06F;border-color:#6FA83C">🍎 ' + fmt(S.apples || 0) + "</span></div>") +
    '<div class="pad mt6">' +
      (() => {
        const p = S.pets.find((x) => x.id === S.activePetId);
        if (!p) {
          return '<div class="mute tiny b row gap6" style="margin-bottom:4px"><img src="' + petArt(null) +
            '" style="width:18px;height:18px;object-fit:contain;filter:grayscale(1);opacity:.5">' +
            "Aucun familier actif</div>";
        }
        const rc = RARITY[p.rarity].c;
        const lv = p.level || 0;
        const mx = petMaxLevel(p.rarity);
        const pct = petBonus(p);
        const nextPct = lv < mx ? petBonusAt(p.rarity, lv + 1, starsOf(S, "pet")) : pct;
        const cost = petUpgradeCost(p.rarity, lv);
        const treeDmg = treeSum(S, "petDmg");
        return '<div class="card frame rf" style="border-color:' + rc + ";--rc:" + rc + '">' +
          '<div class="row gap10"><img src="' + petArt(p) +
            '" style="width:66px;height:66px;object-fit:contain;filter:drop-shadow(0 4px 10px #000c)">' +
          '<div class="flex1"><div class="row gap6" style="flex-wrap:wrap">' + rtag(p.rarity) +
            '<span class="pill">' + ic(petSpecies(p).icon, 10) + petSpecies(p).label + "</span>" +
            '<span class="pill" style="color:' + petElement(p).c + ";border-color:" + petElement(p).c +
              '99">' + ic(petElement(p).icon, 10) + petElement(p).label + "</span>" +
            '<span class="pill">Niv. ' + lv + "/" + mx + "</span></div>" +
          '<div class="row gap10 mt6">' +
            '<span class="b small row gap4" style="color:#FF9C6B">' + ic("sword", 12) + "+" + fmt(Math.round(pct * (1 + treeDmg / 100))) + "%</span>" +
            '<span class="b small row gap4" style="color:var(--redLit)">' + ic("heart", 12) + "+" + fmt(Math.round(pct)) + "%</span>" +
          "</div>" +
          '<div class="mt6">' + meter((lv / mx) * 100, rc, lv + " / " + mx) + "</div></div></div>" +
          '<div class="tiny b mt6 row gap4" style="color:' + petElement(p).c + '">' +
            ic(petElement(p).icon, 11) + petElement(p).desc + "</div>" +
          (treeDmg > 0 ? '<div class="tiny b mt6 row gap4" style="color:#8FEFF4">' + ic("bolt", 10) +
            "Arbre : +" + treeDmg + "% aux dégâts des Familiers</div>" : "") +
          '<div class="divider"></div>' +
          (lv >= mx
            ? '<div class="center"><span class="pill" style="border-color:#3FB950;color:var(--greenLit)">Amélioration maximale</span>' +
              '<div class="mute tiny mt6">Fusionne pour atteindre la rareté suivante</div></div>'
            : '<div class="between"><div class="mute tiny b">PROCHAIN NIVEAU</div>' +
              '<div class="b tiny" style="color:var(--greenLit)">+' + fmt(Math.round(pct)) + "% → +" + fmt(Math.round(nextPct)) + "%</div></div>" +
              '<div class="mt6">' + btn("🍎 Améliorer · " + fmt(cost),
                { small: true, act: "upgradePet", arg: p.id, dis: (S.apples || 0) < cost,
                  style: "--bA:#FFA872;--bB:#DB6224;--bS:#7A310C;--bE:#FFD9C0;--bT:#2A0F03" }) + "</div>") +
        "</div>";
      })() +
      '<div class="card mt6"><div class="between"><div style="min-width:0"><div class="row gap4"><div class="bb gt" style="font-size:13px;letter-spacing:1px">MAÎTRISE FAMILIER</div>' +
        starRow("pet", "#FFC29B") + "</div>" +
        '<div class="mute tiny b">' + S.petMastery.progress + "/" + mreq + " invocations</div></div>" +
        '<b style="color:#FFC29B;font-size:18px;text-shadow:0 0 12px ' + ORANGE + '80">' + S.petMastery.level + "/" + RULES.MASTERY_MAX + "</b></div>" +
        '<div class="mt6">' + meter((S.petMastery.progress / mreq) * 100, ORANGE, S.petMastery.progress + " / " + mreq) + "</div>" +
        ascendCta("pet") +
        ratesTable(rates, S.petMastery.level < RULES.MASTERY_MAX ? getRates("pet", S.petMastery.level + 1, S.ascension, starsOf(S, "pet")) : null,
          "Actuel", "Niv." + (S.petMastery.level + 1), PET_RARITY_ORDER) +
        '<div class="row gap6 mt6">' +
          btn(ic("egg", 14) + "Invoquer · " + PET_SUMMON_COST, { small: true, act: "summonEgg", arg: 1,
            dis: S.essence < PET_SUMMON_COST,
            style: "--bA:#FFA872;--bB:#DB6224;--bS:#7A310C;--bE:#FFD9C0;--bT:#2A0F03" }) +
          btn("x10 · " + (PET_SUMMON_COST * 10), { small: true, act: "summonEgg", arg: 10,
            dis: S.essence < PET_SUMMON_COST * 10,
            style: "--bA:#FFA872;--bB:#DB6224;--bS:#7A310C;--bE:#FFD9C0;--bT:#2A0F03;max-width:62px" }) +
        "</div>" +
        // the nest being full is no longer a reason not to summon
        (stored.length ? '<div class="mute tiny center mt6">' + stored.length +
          " œuf" + (stored.length > 1 ? "s" : "") + " en stock · choisis manuellement lequel faire éclore</div>" : "") +
      "</div>" +
      '<div class="sect" style="margin:16px 0 9px">Œufs en stock (' + stored.length + ")</div>" +
      (stored.length ? '<div class="slotGrid">' + stored.map((e) => {
        const full = hatching.length >= S.eggSlots;
        const r = e.rarity;
        const art = ASSETS["egg_" + String(r).toLowerCase()];
        return '<div class="eggCard rf" style="border-color:' + RARITY[r].c + ';--rc:' + RARITY[r].c + '">' +
          '<div style="position:relative;z-index:1">' +
            (art ? '<img src="' + art + '" style="width:34px;height:34px;object-fit:contain;display:block;margin:0 auto;filter:drop-shadow(0 2px 5px #000a)">' : ic("egg", 28)) +
          '</div>' + rtag(r) +
          '<div class="tiny b mt4" style="color:' + petElement(e).c + '">' + ic(petElement(e).icon, 9) + petElement(e).label + '</div>' +
          '<div class="mute tiny mt4">' + fmtTime(EGG_TIMERS[r] / hatchSpeedFor(S,r)) + '</div>' +
          '<div class="mt6">' + btn("Éclore", { small:true, cls:"green", act:"startEgg", arg:e.id, dis:full, style:"padding:5px 9px;font-size:10.5px" }) + '</div>' +
        '</div>';
      }).join("") + '</div>' : '<div class="mute tiny center">Aucun œuf en stock.</div>') +
      '<div class="sect" style="margin:16px 0 9px">Éclosion (' + hatching.length + "/" + S.eggSlots +
        (stored.length ? ") · " + stored.length + " en réserve" : ")") + "</div>" +
      '<div class="slotGrid">' + eggCells + "</div>" +
      (!S.eggSlotGemBought && S.eggSlots < RULES.EGG_SLOT_MAX ? '<div class="mt4" style="margin-top:4px">' +
        btn("+1 Emplacement · " + ic("gem", 12) + "300" + (S.level < 10 ? " · niv. 10" : ""),
          { cls: "purple", small: true, act: "buyEggSlot",
            dis: S.level < 10 || S.gems < 300, style: "padding:4px 9px;font-size:10.5px" }) + "</div>" : "") +
      (S.eggSlotGemBought && S.eggSlots < RULES.EGG_SLOT_MAX
        ? '<div class="mute tiny center mt6">Emplacement Gemmes acheté · les suivants se débloquent dans l’Arbre.</div>' : "") +
      '<div class="sect" style="margin:16px 0 9px">Collection (' + S.pets.length + ")</div>" +
      '<div class="mute tiny" style="margin-bottom:2px;line-height:1.35">Fusion : ' +
        PET_RARITY_ORDER.slice(0, -1).map((r, i) => petFuseNeed(r) + " " + RARITY[r].label +
          " → 1 " + RARITY[PET_RARITY_ORDER[i + 1]].label).join(" · ") +
        ". Le Familier le plus avancé conserve son niveau, son espèce, son élément et ses Pommes investies ; " +
        "celles des doublons consommés sont remboursées.</div>" +
      (S.pets.length === 0 ? '<div class="mute tiny center" style="padding:6px 0">Aucun familier. Fais éclore un œuf.</div>'
        : PET_RARITY_ORDER.filter((r) => byRar[r]).map((r) => {
        const list = byRar[r];
        const rc = RARITY[r].c;
        const need = petFuseNeed(r);
        const isTop = PET_RARITY_ORDER.indexOf(r) >= PET_RARITY_ORDER.length - 1;
        const canFuse = need > 0 && list.length >= need;
        const best = list.slice().sort((a, b) => (b.level || 0) - (a.level || 0))[0];
        const activeHere = list.some((p) => p.id === S.activePetId);
        return '<div class="itemRow" style="border-left-color:' + rc + ';flex-wrap:wrap">' +
          '<div class="imini" style="width:32px;height:32px;border-color:' + rc + '80;box-shadow:0 0 10px ' +
            rc + '3d">' + ic("paw", 19) + "</div>" +
          '<div class="flex1"><div class="b small" style="color:' + rc + '">' + RARITY[r].label + " ×" + list.length + "</div>" +
          '<div class="mute tiny b row gap6">' +
            '<span>' + ic("sword", 9) + " base +" + fmt(PET_BASE[r]) + "%</span>" +
            '<span>' + ic("heart", 9) + " base +" + fmt(PET_BASE[r]) + "%</span>" +
            '<span>max +' + fmt(Math.round(petBonusAt(r, petMaxLevel(r), starsOf(S, "pet")))) + "%</span>" +
          "</div>" +
          (best ? '<div class="mute tiny b">Meilleur : ' + esc(petFullName(best)) +
            " · niv. " + (best.level || 0) + "/" + petMaxLevel(r) + "</div>" : "") +
          '<div class="row gap4 mt6" style="flex-wrap:wrap">' +
            PET_ELEMENTS.map((el) => {
              const cnt = list.filter((p) => petElement(p).id === el.id).length;
              return cnt ? '<span class="tag" style="color:' + el.c + ";border-color:" + el.c +
                '66">' + ic(el.icon, 9) + el.label + " ×" + cnt + "</span>" : "";
            }).join("") + "</div>" +
          "</div>" +
          '<div class="col gap4">' +
          (activeHere
            ? '<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Actif</span>'
            : btn("Activer", { small: true, cls: "ghost", act: "setPet", arg: best.id, style: "padding:5px 8px;font-size:10.5px" })) +
          (isTop ? "" : btn("Fusion", { small: true, cls: "purple", act: "fuse", arg: r,
            dis: !canFuse, style: "padding:5px 8px;font-size:10.5px" })) +
          "</div>" +
          (isTop ? "" : '<div style="width:100%;margin-top:7px">' +
            '<div class="between tiny b" style="margin-bottom:3px">' +
              '<span class="mute">DOUBLONS POUR FUSION</span>' +
              '<span style="color:' + (canFuse ? "var(--greenLit)" : "var(--textMute)") + '">' +
              Math.min(list.length, need) + " / " + need + "</span></div>" +
            meter((Math.min(list.length, need) / need) * 100, canFuse ? C.green : rc) + "</div>") +
          "</div>";
      }).join("")) +
    '<div style="height:2px"></div></div>';
}
/* ---------------- RAID ---------------- */
function scrRaid() {
  const running = combat && combat.ctx === "raid" && !combat.trial;
  if (S.level < RULES.RAID_UNLOCK_LEVEL) {
    return topbar("Raids") + '<div class="pad mt6"><div class="notice center">Les Raids se débloquent au Niveau ' +
      RULES.RAID_UNLOCK_LEVEL + ".</div></div>";
  }
  if (running) {
    const rm = RAIDS[combat.raidId];
    return topbar(rm.name) + '<div id="arenaSlot"></div>' + combatBarHTML() +
      '<div class="pad mt6"><div class="card frame center">' +
      '<div class="row gap8" style="justify-content:center">' + ic(rm.icon, 22) +
      '<span class="bb gt" style="font-size:14px;letter-spacing:1.2px">RAID EN COURS</span></div>' +
      '<div class="mute small mt6">Niveau ' + combat.raidLevel + " · récompense " +
      '<b style="color:' + rm.color + '">' + fmt(raidReward(combat.raidId, combat.raidLevel)) + " " + rm.reward + "</b></div>" +
      '<div class="mt10">' + btn("Abandonner", { cls: "dark", small: true, act: "abortRaid" }) + "</div></div></div>";
  }
  const cards = RAID_IDS.map((id) => {
    const r = S.raids[id], meta = RAIDS[id];
    const bonus = (S.raidKeyAlloc || {})[id] || 0;
    const cap = RULES.RAID_KEY_CAP + bonus;
    const st = raidStars(S, id);
    const detail = (st ? "★" + st + " · " : "") +
      "Niv " + r.level + "/" + RULES.RAID_MAX_LEVEL + " · rec " + r.record +
      " · " + raidEnemyCount(id, r.level) + " ennemis · " + fmt(raidEnemyHP(id, r.level)) + " PV";
    return '<div class="raidCard" style="border-left-color:' + meta.color + '" title="' + esc(detail) +
      " · " + fmt(raidEnemyDamage(id, r.level)) + ' dégâts">' +
      '<div class="row gap8">' +
        '<div class="imini" style="width:28px;height:28px;background:linear-gradient(180deg,' + meta.color + '33,' + meta.color +
        '0f);border-color:' + meta.color + ';box-shadow:0 0 11px ' + meta.color + '47">' + ic(meta.icon, 16) + "</div>" +
        '<div class="flex1"><div class="b small row gap4" style="justify-content:space-between">' +
          '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + meta.name + "</span>" +
          '<span style="color:' + meta.color + ';flex:0 0 auto">+' + fmt(raidReward(id, r.level)) + " " + meta.reward + "</span></div>" +
        '<div class="mute tiny b row gap4">' + ic("key", 10) + r.keys + "/" + cap + " · " + detail + "</div></div>" +
        btn(ic("key", 12) + "Lancer", { small: true, cls: "green", act: "startRaid", arg: id, arg2: "0",
          dis: r.keys <= 0, style: "width:auto;padding:5px 9px" }) +
        btn(ic("star", 12), { small: true, cls: "ghost", act: "startRaid", arg: id, arg2: "1",
          dis: S.universalKeys <= 0, style: "width:auto;padding:5px 8px" }) +
      "</div>" +
      // a raid at its ceiling offers its own Ascension, and only that raid's
      (canAscendRaid(S, id)
        ? '<div class="mt6">' + btn(ic("star", 13) + "ASCENSION ★ — niveau maximum",
            { cls: "purple", small: true, act: "ascendRaidAsk", arg: id }) + "</div>"
        : (st >= RULES.RAID_ASCEND_MAX_STARS && r.level >= RULES.RAID_MAX_LEVEL
          ? '<div class="mt6"><div class="notice center tiny b" style="padding:6px;color:var(--goldLit)">★ Ascension maximale atteinte</div></div>'
          : "")) +
      "</div>";
  }).join("");

  return topbar("Raids", '<span class="pill" data-act="resInfo" data-arg="key" style="cursor:pointer;color:var(--goldLit);border-color:var(--goldDim)">' + ic("key", 11) + S.universalKeys + "</span>") +
    '<div class="pad mt6">' +
      '<div class="card frame"><div class="between"><div><div class="bb small">Clés universelles</div>' +
        '<div class="mute tiny b">' + S.universalKeys + "/" + RULES.UNIVERSAL_KEY_CAP + " · " +
        (RULES.UNIVERSAL_KEY_DAILY - S.adKeysToday) + " pub restantes aujourd'hui</div></div>" +
        btn(ic("tv", 14) + "+1 clé", { small: true, cls: "blue", act: "adKey",
          dis: S.universalKeys >= RULES.UNIVERSAL_KEY_CAP || S.adKeysToday >= RULES.UNIVERSAL_KEY_DAILY,
          style: "width:auto;padding:7px 10px" }) + "</div>" +
        '<div class="mt8">' + meter((S.universalKeys / RULES.UNIVERSAL_KEY_CAP) * 100, C.gold,
          S.universalKeys + " / " + RULES.UNIVERSAL_KEY_CAP) + "</div>" +
        '<div class="mute tiny mt6">' + RULES.RAID_FREE_KEYS + " clés gratuites par raid chaque jour, plafond " +
        RULES.RAID_KEY_CAP + ". L\'étoile lance avec une clé universelle.</div></div>" +
      '<div class="sect">Raids disponibles</div>' + cards +
      '<div class="mute tiny center mt6">Victoire : la clé est consommée, +1 niveau et la récompense. Défaite ou abandon : clé conservée, niveau inchangé.</div>' +
    '<div style="height:2px"></div></div>';
}

/* ---------------- MÉGA BOSS ---------------- */
function scrMegaRaid() {
  const running = combat && combat.ctx === "mega";
  if (running) {
    const def = bossFor(combat.floor);
    const already = !!S.megaBossClears[String(combat.floor)];
    return topbar("Méga Boss", '<span class="pill" style="color:#A9E06F;border-color:#6FA83C">🍎 ' +
      fmt(S.apples || 0) + "</span>") + '<div id="arenaSlot"></div>' + combatBarHTML() +
      '<div class="pad mt6"><div class="card frame center" style="border-left-color:#E5484D">' +
        '<div class="row gap8" style="justify-content:center">' + ic("skull", 22) +
          '<span class="bb gt" style="font-size:14px;letter-spacing:1.2px">MÉGA-BOSS EN COURS</span></div>' +
        '<div class="mute small mt6">Méga niveau ' + megaLevelForFloor(combat.floor) + " · Méga-" + esc(def.name) +
          " · référence Boss normal étage " + fmtInt(combat.floor) +
          ' · <b style="color:var(--redLit)">PV ×10 · dégâts ×10</b></div>' +
        '<div class="tiny b mt6" style="color:#A9E06F">' +
          (already ? "Boss déjà vaincu · replay : 0 Pomme"
            : "Première victoire : +" + fmt(megaAppleFirstClearReward(combat.floor, S)) + " 🍎") + "</div>" +
        '<div class="mt10">' + btn("Abandonner", { cls: "dark", small: true, act: "abortMega" }) +
          "</div></div></div>";
  }

  const floors = megaBossFloors(S);
  const cleared = floors.filter((f) => S.megaBossClears[String(f)]);
  const next = nextMegaBossFloor(S);
  const appleBoost = rb(S, "apples");
  let challenge;
  if (!floors.length) {
    challenge = '<div class="card frame center" style="border-left-color:#E5484D">' + ic("lock", 30) +
      '<div class="bb gt mt6" style="font-size:14px">MÉGA BOSS VERROUILLÉ</div>' +
      '<div class="mute small mt6">Atteins l’étage normal 50 et vaincs son Boss pour déverrouiller le Méga Boss.</div></div>';
  } else if (next !== null) {
    const def = bossFor(next);
    const preview = makeMegaBossEnemy(next);
    const reward = megaAppleFirstClearReward(next, S);
    challenge = '<div class="card frame" style="border-left-color:#E5484D">' +
      '<div class="between"><div class="row gap9">' +
        '<div class="imini" style="width:38px;height:38px;border-color:#E5484D;background:#E5484D1f">' + ic("skull", 22) + "</div>" +
        '<div><div class="bb" style="color:var(--redLit);font-size:14px">Méga niveau ' + megaLevelForFloor(next) + " · Méga-" + esc(def.name) + "</div>" +
        '<div class="mute tiny b">Référence : Boss normal étage ' + fmtInt(next) + " · prochain défi</div></div></div>" +
        '<span class="pill" style="color:#A9E06F;border-color:#6FA83C">+' + fmt(reward) + " 🍎</span></div>" +
      '<div class="row gap6 mt8" style="flex-wrap:wrap">' +
        '<span class="pill">' + ic("heart", 10) + fmt(preview.maxHP) + " PV</span>" +
        '<span class="pill">' + ic("flame", 10) + fmt(preview.dmg) + " dégâts</span>" +
        '<span class="pill" style="color:var(--redLit);border-color:#E5484D">PV ×10 · dégâts ×10</span></div>' +
      '<div class="notice mt8 tiny">Méga niveau ' + megaLevelForFloor(next) + " = 10× la puissance du Boss normal de l’étage " + fmtInt(next) + ". " +
        "Aucune clé requise. La première victoire donne les Pommes et 2× les accélérateurs de ce Boss normal.</div>" +
      '<div class="mt8">' + btn(ic("skull", 14) + "Affronter", { cls: "red", act: "startMega", arg: next }) +
        "</div></div>";
  } else {
    const nextNormal = (floors[floors.length - 1] || 0) + RULES.BOSS_EVERY;
    challenge = '<div class="card frame center" style="border-left-color:#3FB950">' + ic("trophy", 30) +
      '<div class="bb gt mt6" style="font-size:14px">TOUS LES MÉGA-BOSS DISPONIBLES SONT VAINCUS</div>' +
      '<div class="mute small mt6">Vaincs le Boss normal de l’étage ' + fmtInt(nextNormal) +
        " pour rendre disponible le Méga niveau " + megaLevelForFloor(nextNormal) + ".</div></div>";
  }

  const history = cleared.slice().reverse().slice(0, 5).map((floor) => {
    const def = bossFor(floor);
    return '<div class="card mt6" style="padding:6px 8px"><div class="between"><div>' +
      '<div class="b small">Méga niveau ' + megaLevelForFloor(floor) + " · Méga-" + esc(def.name) +
      " · réf. étage " + fmtInt(floor) + "</div>" +
      '<div class="mute tiny">Première récompense récupérée · replay : 0 Pomme</div></div>' +
      btn("Rejouer", { small: true, cls: "ghost", act: "startMega", arg: floor,
        style: "width:auto;padding:5px 9px" }) + "</div></div>";
  }).join("");

  return topbar("Méga Boss", '<span class="pill" data-act="resInfo" data-arg="apples" ' +
    'style="cursor:pointer;color:#A9E06F;border-color:#6FA83C">🍎 ' + fmt(S.apples || 0) + "</span>") +
    '<div class="pad mt6">' +
      '<div class="card"><div class="between"><div><div class="bb small">Progression Méga Boss</div>' +
        '<div class="mute tiny b">' + cleared.length + "/" + floors.length + " premières victoires</div></div>" +
        '<span class="pill" style="color:#A9E06F;border-color:#6FA83C">Gain Pommes +' + appleBoost + "%</span></div>" +
        '<div class="mt8">' + meter(floors.length ? cleared.length / floors.length * 100 : 0, C.red,
          cleared.length + " / " + floors.length) + "</div>" +
        '<div class="mute tiny mt6">Récompense par première victoire : 33 + 7 tous les 25 étages. ' +
          "Le Rebirth peut la doubler à 20/20. Les replays ne donnent jamais de Pomme.</div></div>" +
      '<div class="sect">Prochain défi</div>' + challenge +
      (history ? '<div class="sect">Méga-Boss vaincus</div>' + history : "") +
    '<div style="height:2px"></div></div>';
}


/* ---------------- SANCTUAIRE ---------------- */
function sanctRecipeAffordableUI(r) {
  if (!r) return false;
  return Object.keys(SANCT_ING).every((k) => (S[k] || 0) >= sanctNeedFor(r, k));
}
function sanctRecipeOutputUI(r) {
  if (!r) return "";
  if (r.out === "seal") return r.qty + "× Sceau de stabilité";
  const a = ACCEL_DEFS.find((x) => x.key === r.out);
  return r.qty + "× Accél. " + (a ? a.label : r.out);
}
function sanctRecipeCostUI(r) {
  return Object.keys(SANCT_ING).filter((k) => sanctNeedFor(r,k)).map((k) =>
    sanctNeedFor(r,k) + " " + SANCT_ING[k].label).join(" + ");
}
function scrSanctuaire() {
  const unlocked=sanctuaryUnlocked(S);
  const st=S.sanctuary || {slotA:null,slotB:null,discovered:{},fusions:0};
  const accelTotal=ACCEL_DEFS.reduce((n,a)=>n+(S.accels[a.key]||0)*a.mins,0);
  const discovered=SANCT_RECIPES.filter((r)=>!!st.discovered[r.id]);
  const knownReady=discovered.filter(sanctRecipeAffordableUI);
  const recommendation=knownReady[0] || discovered[0] || null;
  const resPills='<div class="row gap4" style="flex-wrap:wrap">'+
    '<span class="pill">⛏️ '+fmt(S.minerai)+'</span><span class="pill">✨ '+fmt(S.eclat)+'</span>'+
    '<span class="pill">🔥 '+fmt(S.essence)+'</span><span class="pill">🌫️ '+fmt(S.poussiere)+'</span></div>';
  if(!unlocked) return topbar("Sanctuaire",resPills)+
    '<div class="pad mt8"><div class="card frame center" style="padding:18px 12px;border-left-color:#9B5CF6">'+ic("lock",36)+
    '<div class="bb gt mt8" style="font-size:16px">SANCTUAIRE SCELLÉ</div>'+
    '<div class="dim small mt8" style="line-height:1.55">Vaincs ton premier Méga-Boss pour réveiller le Sanctuaire.<br>Il transformera ensuite tes surplus de ressources en accélérateurs et Sceaux de stabilité.</div></div></div>';

  const slot=(key,which)=> key ? '<div class="card center" data-act="sanctClear" data-arg="'+which+'" style="flex:1;min-height:86px;cursor:pointer;border-color:#9B5CF6">'+
      '<div style="font-size:25px">'+(key==='minerai'?'⛏️':key==='eclat'?'✨':key==='essence'?'🔥':'🌫️')+'</div><div class="b small mt6">'+SANCT_ING[key].label+'</div><div class="mute tiny">Toucher pour retirer</div></div>'
    : '<div class="card center" style="flex:1;min-height:86px;border-style:dashed"><div style="font-size:26px;opacity:.45">＋</div><div class="mute tiny mt6">Emplacement '+(which==='a'?'I':'II')+'</div></div>';

  const ingredients=Object.keys(SANCT_ING).map((k)=>'<div class="card" data-act="sanctAdd" data-arg="'+k+'" style="cursor:pointer;padding:8px;flex:1;min-width:46%"><div class="between"><div><div class="b small">'+
    (k==='minerai'?'⛏️':k==='eclat'?'✨':k==='essence'?'🔥':'🌫️')+' '+SANCT_ING[k].label+'</div><div class="mute tiny">Stock : '+fmt(S[k]||0)+'</div></div>'+ic("plus",15)+'</div></div>').join('');

  const recipe=sanctRecipeFor(st.slotA,st.slotB);
  const affordable=recipe ? sanctRecipeAffordableUI(recipe) : false;
  const preview=recipe ? '<div class="notice mt8 tiny" style="border-color:'+(affordable?'#3FB95066':'#E5484D66')+'"><div class="between"><div><b style="color:var(--goldLit)">'+esc(recipe.name)+'</b><div class="mute tiny mt3">'+esc(sanctRecipeCostUI(recipe))+'</div></div><div style="text-align:right"><b style="color:'+(affordable?'var(--greenLit)':'#FF9A9A')+'">'+esc(sanctRecipeOutputUI(recipe))+'</b><div class="tiny '+(affordable?'gt':'rt')+' mt3">'+(affordable?'PRÊT':'RESSOURCES INSUFFISANTES')+'</div></div></div></div>'
    : (st.slotA&&st.slotB?'<div class="notice mt8 tiny" style="border-color:#E8B44A55"><b>Combinaison inconnue</b><div class="mute mt3">Tu peux tenter la Fusion : si aucune recette ne correspond, aucune ressource ne sera consommée.</div></div>':'');

  const known=SANCT_RECIPES.map((r)=>{
    const d=!!st.discovered[r.id];
    if(!d && r.secret) return '<div class="card mt6" style="padding:8px 9px;opacity:.78"><div class="between"><div><div class="b small">❓ Recette secrète</div><div class="mute tiny">Une combinaison reste à découvrir.</div></div><span class="pill">???</span></div></div>';
    if(!d) return '<div class="card mt6" style="padding:8px 9px;opacity:.78"><div class="between"><div><div class="b small">Recette non découverte</div><div class="mute tiny">Expérimente dans le Cercle de Fusion.</div></div><span class="pill">???</span></div></div>';
    const ok=sanctRecipeAffordableUI(r);
    return '<div class="card mt6" style="padding:8px 9px;border-color:'+(ok?'#3FB95055':'var(--line)')+'"><div class="between gap8"><div class="flex1"><div class="row gap4"><span class="b small">✓ '+esc(r.name)+'</span>'+(ok?'<span class="pill" style="color:var(--greenLit);border-color:#3FB950">PRÊT</span>':'')+'</div><div class="mute tiny mt3">'+esc(sanctRecipeCostUI(r))+' → '+esc(sanctRecipeOutputUI(r))+'</div></div>'+btn('Préparer',{small:true,cls:ok?'green':'ghost',act:'sanctPrepare',arg:r.id,style:'width:auto;padding:5px 8px'})+'</div></div>';
  }).join('');

  const recommendCard = recommendation
    ? '<div class="card lit mt8" style="padding:9px 10px;border-left:3px solid '+(sanctRecipeAffordableUI(recommendation)?'#3FB950':'#9B5CF6')+'"><div class="between gap8"><div class="flex1"><div class="tiny b" style="color:#8FEFF4">ACTION RECOMMANDÉE</div><div class="b small mt3">'+esc(recommendation.name)+'</div><div class="mute tiny mt3">'+(sanctRecipeAffordableUI(recommendation)?'Tu as déjà toutes les ressources nécessaires.':'Recette connue, mais il te manque encore des ressources.')+'</div></div>'+btn('Préparer',{small:true,cls:sanctRecipeAffordableUI(recommendation)?'green':'purple',act:'sanctPrepare',arg:recommendation.id,primary:true,style:'width:auto'})+'</div></div>'
    : '<div class="notice mt8 tiny"><b>Première découverte</b> · Choisis deux ressources différentes ou identiques et expérimente. Une combinaison invalide ne consomme rien.</div>';

  return topbar("Sanctuaire",'<span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">⏱️ '+fmtTime(accelTotal*60)+'</span><span class="pill">🛡️ '+fmt(st.stabilitySeals||0)+'</span>')+
    '<div class="pad mt6">'+
    '<div class="card" style="padding:8px 10px"><div class="between"><div><div class="tiny b" style="color:#8FEFF4">MAÎTRISE DU SANCTUAIRE</div><div class="bb gt mt3">'+discovered.length+' / '+SANCT_RECIPES.length+' recettes découvertes</div></div><div style="text-align:right"><div class="b">'+fmt(st.fusions||0)+'</div><div class="mute tiny">fusions</div></div></div>'+bar(SANCT_RECIPES.length?discovered.length/SANCT_RECIPES.length*100:0,'#9B5CF6',5)+'</div>'+
    recommendCard+
    '<div class="card frame mt8"><div class="between"><div><div class="bb gt">CERCLE DE FUSION</div><div class="mute tiny b">Fusion instantanée · aucun timer</div></div><span class="pill">'+(recipe?(affordable?'PRÊT':'À COMPLÉTER'):'2 ingrédients')+'</span></div>'+
    '<div class="row gap8 mt10">'+slot(st.slotA,'a')+'<div class="bb gt">＋</div>'+slot(st.slotB,'b')+'</div>'+preview+
    '<div class="mt8">'+btn(ic("flame",14)+' FUSIONNER',{cls:recipe&&affordable?'purple':'dark',act:'sanctFuse',dis:!(st.slotA&&st.slotB)||(recipe&&!affordable)})+'</div></div>'+
    '<div class="sect">Ressources</div><div class="row gap6" style="flex-wrap:wrap">'+ingredients+'</div>'+
    '<div class="sect">Livre de Fusion <span class="mute tiny">· '+discovered.length+'/'+SANCT_RECIPES.length+'</span></div>'+known+
    '<div class="notice mt8 tiny">Les recettes découvertes restent inscrites dans le Livre. Les coûts et récompenses du Sanctuaire n’ont pas été modifiés.</div></div>';
}

/* ---------------- ARBRE ---------------- */
function scrArbre() {
  const now = Date.now();
  const active = S.tree.active;
  const remain = active ? (S.tree.activeEnd - now) / 1000 : 0;
  const activeNode = active ? TREE_BY_ID[active] : null;
  const activeLv = S.tree.activeLevel || 1;
  const activeTotal = activeNode ? treeTime(S, activeNode, activeLv) : 1;
  const accelBtns = ACCEL_DEFS.filter((a) => (S.accels[a.key] || 0) > 0).map((a) =>
    '<span class="pill" data-act="accel" data-arg="' + a.key + '" data-arg2="tree"' +
    ' style="cursor:pointer;color:#8FEFF4;border-color:var(--cyan)">' + ic("bolt", 10) + a.label + " ×" + S.accels[a.key] + "</span>").join("");

  const owned = TREE_NODES.reduce((t, n) => t + treeLv(S, n.id), 0);
  const accelPct = treeSum(S, "accel");
  const freeKeys = raidKeyFree(S);
  const alloc = RAID_IDS.filter((r) => (S.raidKeyAlloc[r] || 0) > 0)
    .map((r) => RAIDS[r].reward + " +" + S.raidKeyAlloc[r]).join(" · ");

  /* One line per family that is actually invested, named exactly as the family
     is named, so this panel and the nodes cannot say different things. */
  const bonusRows = [
    ["forgeTime", "Forge · vitesse du minuteur", "+"],
    ["forgeCost", "Forge · coût", ""],
    ["forgeFree", "Chance de forge gratuite", "+"],
    ["research", "Recherche technologique · vitesse", "+"],
    ["techCost", "Nœud technologique · coût", ""],
    ["goldAll", "Or global", "+"],
    ["afkGain", "Récompense Autonomie", "+"],
    ["afkTime", "Temps Récompense Autonomie", "+"],
    ["skillDmg", "Compétence · dégâts", "+"],
    ["passDmg", "Compétence passive · base dégâts", "+"],
    ["passHp", "Compétence passive · base santé", "+"],
    ["skillCost", "Compétence · coût d'invocation", ""],
    ["petDmg", "Animal · dégâts", "+"],
    ["petHp", "Animal · santé", "+"],
    ["eq_arme", "Arme · dégâts", "+"],
    ["eq_casque", "Casque · santé", "+"],
    ["eq_gants", "Gants · dégâts", "+"],
    ["eq_collier", "Collier · dégâts", "+"],
    ["eq_armure", "Armure · santé", "+"],
    ["eq_anneau", "Anneau · dégâts", "+"],
    ["eq_bottes", "Chaussures · santé", "+"],
    ["eq_ceinture", "Ceinture · santé", "+"],
    ["hatch_COMMUN", "Œuf Commun · éclosion", "+"],
    ["hatch_PEU_COMMUN", "Œuf Peu commun · éclosion", "+"],
    ["hatch_RARE", "Œuf Rare · éclosion", "+"],
    ["hatch_EPIQUE", "Œuf Épique · éclosion", "+"],
    ["hatch_MYTHIQUE", "Œuf Mythique · éclosion", "+"],
    ["hatch_LEGENDAIRE", "Œuf Légendaire · éclosion", "+"],
    ["eggFree", "Chance d'œuf supplémentaire", "+"],
    ["skillFree", "Chance de compétence supplémentaire", "+"],
    ["peRaid", "PE du Raid Évolution", "+"]
  ].map((r) => {
    const v = treeSum(S, r[0]);
    if (v === 0) return "";
    const shown = Math.round(Math.abs(v) * 10) / 10;
    return '<div class="kv"><span class="dim">' + r[1] +
      '</span><b style="color:var(--goldLit)">' + (r[2] || (v < 0 ? "-" : "+")) +
      shown + "%</b></div>";
  }).join("");

  const intro = "Les <b>PE</b> gagnés au <b>Raid Évolution</b> sont la <b>seule</b> ressource de l’Arbre : " +
    "ils ouvrent un nœud, puis paient chacun de ses niveaux suivants. Ouvrir coûte moins cher que monter. " +
    "Un nœud compte comme activé dès <b>1/X</b> : tu peux ouvrir la suite immédiatement et revenir le maxer plus tard.";

  return topbar("Arbre Personnel",
      '<span class="pill" data-act="resInfo" data-arg="pe" style="cursor:pointer;color:#8FEFF4;border-color:var(--cyan)">' + ic("chart", 11) + fmt(S.pe || 0) + " PE</span>") +
    '<div class="pad mt6">' +
      (activeNode ? '<div class="card lit frame">' +
        '<div class="between"><div><div class="bb small" style="color:var(--goldLit)">' + esc(activeNode.label) +
          " · niv." + activeLv + "/" + activeNode.max + "</div>" +
        '<div class="mute tiny b">' + esc(activeNode.sect) + " — une seule recherche à la fois</div></div>" +
        '<b class="row gap4" style="color:var(--goldLit)">' + ic("clock", 12) + fmtTime(remain) + "</b></div>" +
        '<div class="mt8">' + meter(100 - (remain / (activeTotal || 1)) * 100, C.gold, fmtTime(remain)) + "</div>" +
        (remain <= 0 ? '<div class="mt10">' + btn(ic("check", 13) + "Récupérer", { cls: "green", small: true, act: "collectResearch" }) + "</div>"
          : '<div class="row gap4 mt8" style="flex-wrap:wrap">' + (accelBtns || '<span class="mute tiny">Aucun accélérateur</span>') + "</div>") +
        "</div>"
        : '<div class="notice">' + intro + "</div>") +

      (freeKeys > 0 ? '<div class="card lit mt10"><div class="between"><div>' +
        '<div class="bb small" style="color:var(--goldLit)">' + freeKeys + " clé quotidienne à attribuer</div>" +
        '<div class="mute tiny b">Choisis le raid qui gagne la clé</div></div>' + ic("key", 22) + "</div>" +
        '<div class="row gap6 mt8" style="flex-wrap:wrap">' + RAID_IDS.map((r) =>
          btn(ic(RAIDS[r].icon, 12) + RAIDS[r].reward, { small: true, cls: "ghost", act: "raidKeyAdd", arg: r,
            style: "width:auto;padding:6px 9px" })).join("") + "</div></div>" : "") +

      '<div class="sect" style="margin:16px 0 9px">Arbre (' + owned + "/" + TREE_TOTAL_LEVELS + " niveaux)</div>" +
      '<div class="card" style="padding:8px 4px;overflow:hidden">' +
        '<div id="treeWrap">' + treeGraph(active, remain) + "</div></div>" +

      // node types, colour-matched to the rings and the connecting paths
      '<div class="card mt8" style="padding:9px 11px">' +
        '<div class="mute tiny b" style="letter-spacing:.6px;margin-bottom:6px">TYPES DE NŒUDS</div>' +
        '<div class="col gap4">' + TREE_TYPE_ORDER.map((k) => {
          const t = TREE_TYPES[k];
          return '<div class="row gap8">' +
            '<i style="width:13px;height:13px;border-radius:50%;flex:0 0 auto;background:' + shade(t.c, -34) +
              ";border:2px solid " + t.c + ";box-shadow:0 0 7px " + t.c + '80"></i>' +
            '<span class="b tiny" style="color:' + t.c + ';min-width:74px">' + t.label + "</span>" +
            '<span class="mute tiny flex1">' + t.desc + "</span></div>";
        }).join("") + "</div>" +
        '<div class="divider"></div>' +
        '<div class="mute tiny b" style="letter-spacing:.6px;margin-bottom:6px">ÉTAT</div>' +
        '<div class="row gap6" style="flex-wrap:wrap">' +
        ['<span class="pill" style="border-color:#3FB950;color:var(--greenLit)">Maxé</span>',
         '<span class="pill" style="border-color:#7FD4FF;color:#BFE6FF">Activé</span>',
         '<span class="pill" style="border-color:var(--gold);color:var(--goldLit)">En cours</span>',
         '<span class="pill" style="border-color:var(--purpleLit);color:var(--purpleLit)">Disponible</span>',
         '<span class="pill" style="opacity:.55">Verrouillé</span>'].join("") + "</div></div>" +

      /* the sheet's bottom bar: what the tree is made of, and where you are */
      '<div class="card mt8" style="padding:9px 11px">' +
        '<div class="mute tiny b" style="letter-spacing:.6px;margin-bottom:6px">RÉCAPITULATIF</div>' +
        [["31 familles × 4 profondeurs", TREE_NODES.filter((n) => !n.special).length + " / 124 nœuds"],
         ["Clés Raid", TREE_NODES.filter((n) => n.effect === "raidKey").length + " × +1"],
         ["Slots d'Éclosion", TREE_NODES.filter((n) => n.effect === "eggSlot").length + " × +1"],
         ["Multiplicateurs Forge", "+1 → +3 → +5 → +10"],
         ["Total", TREE_NODES.length + " nœuds"]].map((r) =>
          '<div class="kv"><span class="dim">' + r[0] + '</span><b style="color:var(--goldLit)">' +
          r[1] + "</b></div>").join("") +
        '<div class="divider"></div>' +
        '<div class="row gap6" style="flex-wrap:wrap">' + PALIER_BAND.map((b, i) => {
          const pal = TREE_NODES.filter((n) => n.tier === i + 1 && !n.special);
          const got = pal.filter((n) => treeLv(S, n.id) >= 1).length;
          return '<span class="pill" style="color:' + b.c + ";border-color:" + b.c + '99">' +
            b.label.replace("PROFONDEUR ", "") + " · " + got + "/" + pal.length + "</span>";
        }).join("") + "</div></div>" +

      '<div class="sect" style="margin:16px 0 9px">Bonus actifs</div>' +
      '<div class="card">' + bonusRows +
        '<div class="kv"><span class="dim">Multiplicateur de Forge</span><b style="color:var(--goldLit)">×' + forgeBatch(S) + "</b></div>" +
        '<div class="kv"><span class="dim">Plafond AFK</span><b style="color:var(--goldLit)">' + afkCapHours(S) + " h</b></div>" +
        '<div class="kv"><span class="dim">Slots éclosion</span><b style="color:var(--goldLit)">' + S.eggSlots + "/" + RULES.EGG_SLOT_MAX + "</b></div>" +
        (raidKeyGrants(S) > 0
          ? '<div class="kv"><span class="dim">Clés quotidiennes</span><b style="color:var(--goldLit)">' +
            (alloc || "non attribuées") + "</b></div>" : "") +
      "</div>" +

      '<div class="sect" style="margin:16px 0 9px">Points d’Évolution</div>' +
      '<div class="card"><div class="between"><div>' +
        '<div class="bb small" style="color:#8FEFF4">' + fmt(S.pe || 0) + " PE disponibles</div>" +
        '<div class="mute tiny b">Gagnés au Raid Évolution · ouvrent les nœuds et paient leurs niveaux</div></div>' + ic("chart", 22) + "</div>" +
        '<div class="mt8">' + meter(Math.min(100, ((S.pe || 0) / Math.max(1, treeTotalPE())) * 100), C.cyan,
          fmt(S.pe || 0) + " / " + fmt(treeTotalPE()) + " PE pour tout maxer") + "</div>" +
        '<div class="mt8">' + btn(ic("chart", 13) + "Aller au Raid Évolution", { cls: "ghost", small: true, act: "go", arg: "raid" }) + "</div>" +
      "</div>" +
      '<div class="sect" style="margin:16px 0 9px">Accélérateurs</div>' +
      '<div class="card"><div class="row gap6" style="flex-wrap:wrap">' + ACCEL_DEFS.map((a) =>
        '<span class="pill">' + ic("bolt", 10) + a.label + " × " + (S.accels[a.key] || 0) + "</span>").join("") + "</div>" +
        (accelPct > 0 ? '<div class="tiny b mt6 row gap4" style="color:#8FEFF4">' + ic("bolt", 11) +
          "Bonus Arbre : accélérateurs +" + accelPct + "% efficacité</div>" : "") +
      "</div>" +
    '<div style="height:2px"></div></div>';
}
