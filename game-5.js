/* ---------------------------- tree node types -----------------------------
   The reference sheet groups nodes by PURPOSE rather than by section, and
   colours both the node ring and the connecting path by that type. Every
   effect in the tree maps onto one of these.
   -------------------------------------------------------------------------- */
const TREE_TYPES = {
  COMBAT:      { label: "Combat",      c: "#E5484D", icon: "sword",   desc: "Augmente ta puissance offensive." },
  SURVIE:      { label: "Survie",      c: "#3FB950", icon: "heart",   desc: "Prolonge ton autonomie de récolte." },
  VITESSE:     { label: "Vitesse",     c: "#4A90D9", icon: "haste",   desc: "Réduit les temps d'attente." },
  RESSOURCES:  { label: "Ressources",  c: "#B15CF6", icon: "poussiere", desc: "Améliore tes gains et ton économie." },
  FAMILIERS:   { label: "Familiers",   c: "#F5C542", icon: "crown",   desc: "Renforce tes familiers et l'éclosion." },
  COMPETENCES: { label: "Compétences", c: "#3FE0C0", icon: "sparkle", desc: "Renforce tes compétences." },
  SPECIAL:     { label: "Nœuds spéciaux", c: "#FFD65E", icon: "key",  desc: "Gros bonus uniques et structurants." },
};
const TREE_TYPE_ORDER = ["COMBAT", "SURVIE", "VITESSE", "RESSOURCES", "FAMILIERS", "COMPETENCES", "SPECIAL"];
/* One entry per family in the official list, so a node never falls back to a
   default category and the colours on the graph mean something. */
const EFFECT_TYPE = {
  // the eight equipment bonuses split the way section 14 splits them
  eq_arme: "COMBAT", eq_gants: "COMBAT", eq_collier: "COMBAT", eq_anneau: "COMBAT",
  eq_casque: "SURVIE", eq_armure: "SURVIE", eq_bottes: "SURVIE", eq_ceinture: "SURVIE",
  passDmg: "COMBAT", skillDmg: "COMPETENCES", skillFree: "COMPETENCES",
  skillCost: "COMPETENCES", passHp: "SURVIE",
  petDmg: "FAMILIERS", petHp: "FAMILIERS", eggFree: "FAMILIERS", eggSlot: "FAMILIERS",
  hatch_COMMUN: "FAMILIERS", hatch_PEU_COMMUN: "FAMILIERS", hatch_RARE: "FAMILIERS", hatch_EPIQUE: "FAMILIERS",
  hatch_MYTHIQUE: "FAMILIERS", hatch_LEGENDAIRE: "FAMILIERS",
  forgeTime: "VITESSE", research: "VITESSE", afkTime: "VITESSE",
  forgeCost: "RESSOURCES", forgeFree: "RESSOURCES", techCost: "RESSOURCES",
  goldAll: "RESSOURCES", afkGain: "RESSOURCES", peRaid: "RESSOURCES",
  forgeMult: "SPECIAL", raidKey: "SPECIAL",
};
function nodeType(node) { return TREE_TYPES[EFFECT_TYPE[node.effect] || "RESSOURCES"]; }
function isSpecialNode(node) { return !!node.special; }

function hexPath(cx, cy, r) {
  const k = r * 0.866;
  return "M" + cx + " " + (cy - r) + "L" + (cx + k) + " " + (cy - r / 2) + "L" + (cx + k) + " " + (cy + r / 2) +
    "L" + cx + " " + (cy + r) + "L" + (cx - k) + " " + (cy + r / 2) + "L" + (cx - k) + " " + (cy - r / 2) + "Z";
}
/* node state: maxed | busy | part(Open) | open | wait | lock */
function treeState(s, n, active) {
  const lv = treeLv(s, n.id);
  if (active === n.id) return "busy";
  if (lv >= n.max) return "maxed";
  if (!treeReqOk(s, n)) return "lock";
  const affordable = !active && treeAfford(s, n);
  if (lv > 0) return affordable ? "partOpen" : "part";
  return affordable ? "open" : "wait";
}
/* The node art is greyscale with binary alpha: the metal's relief lives in the
   GREY, not the alpha, so masking it would flatten it. Instead each piece is
   multiplied by its colour -- feColorMatrix pulls luminance out of the red
   channel and scales it into RGB, which keeps the shading and the highlights.
   Filters are shared by colour, so the whole tree needs about a dozen. */
const TREE_TINT_GAIN = 1.85;          // mean luminance is ~0.43; this lands it near 0.8
function treeTint(col, reg) {
  const id = "tt" + col.replace("#", "");
  if (!reg[id]) {
    const c = (i) => (parseInt(col.slice(1 + i * 2, 3 + i * 2), 16) / 255 * TREE_TINT_GAIN).toFixed(4);
    reg[id] = '<filter id="' + id + '" x="-30%" y="-30%" width="160%" height="160%" ' +
      'color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="' +
      c(0) + ' 0 0 0 0  ' + c(1) + ' 0 0 0 0  ' + c(2) + ' 0 0 0 0  0 0 0 1 0"/></filter>';
  }
  return id;
}
function treePiece(key, cx, cy, size, col, reg, extra) {
  return '<image href="' + ASSETS["tree_" + key] + '" x="' + (cx - size / 2).toFixed(1) +
    '" y="' + (cy - size / 2).toFixed(1) + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) +
    '" filter="url(#' + treeTint(col, reg) + ')" preserveAspectRatio="xMidYMid meet"' +
    (extra || "") + "/>";
}

/* The four paliers, drawn as bands behind the nodes so the depth is readable
   at a glance, and the links that cross between them drawn differently so the
   routes from one palier to the next are the thing you notice first. */
const PALIER_BAND = [
  { label: "PROFONDEUR I",   c: "#3FA7FF" },
  { label: "PROFONDEUR II",  c: "#57E07A" },
  { label: "PROFONDEUR III", c: "#B15CF6" },
  { label: "PROFONDEUR IV",  c: "#E8B44A" },
];
function treeGraph(active, remain) {
  const R = 19, W = 400;
  const maxRow = TREE_NODES.reduce((m, n) => Math.max(m, n.row), 0);
  const H = TREE_ROW_Y(maxRow) + R + 46;

  let links = "", nodes = "", defs = "", beads = "", bands = "";
  const filters = {};

  // ---- one band per palier, with its name down the side ----
  for (let p = 1; p <= 4; p++) {
    const rows = TREE_NODES.filter((n) => n.tier === p).map((n) => n.row);
    if (!rows.length) continue;
    const y0 = TREE_ROW_Y(Math.min.apply(null, rows)) - R - 16;
    const y1 = TREE_ROW_Y(Math.max.apply(null, rows)) + R + 16;
    const b = PALIER_BAND[p - 1];
    bands += '<rect x="6" y="' + y0 + '" width="' + (W - 12) + '" height="' + (y1 - y0) +
      '" rx="16" fill="' + b.c + '" opacity="0.055"/>' +
      '<rect x="6" y="' + y0 + '" width="' + (W - 12) + '" height="' + (y1 - y0) +
      '" rx="16" fill="none" stroke="' + b.c + '" stroke-width="1" opacity="0.30"/>' +
      '<text x="16" y="' + (y0 + 15) + '" fill="' + b.c + '" opacity="0.85" font-size="10"' +
      ' font-weight="800" letter-spacing="1.4">' + b.label + " · 30 NŒUDS</text>";
  }

  // ---- paths take the colour of the node they lead to (reference sheet) ----
  TREE_NODES.forEach((n) => {
    const ty = nodeType(n);
    n.req.forEach((rq) => {
      const q = TREE_BY_ID[rq];
      if (!q) return;
      const lit = treeLv(S, rq) >= 1;          // prerequisite satisfied
      const done = treeLv(S, n.id) >= 1;       // this branch already taken
      const rq2 = isSpecialNode(n) ? R + 6 : R;
      const bow = Math.min(46, 26 + Math.abs(n.x - q.x) * 0.28);
      // a link that changes palier IS the passage: draw it as a road, not a twig
      const cross = q.tier !== n.tier;
      const pc = cross ? PALIER_BAND[n.tier - 1].c : ty.c;
      const d = "M" + q.x + " " + (q.y + R) + "C" + q.x + " " + (q.y + R + bow) +
        " " + n.x + " " + (n.y - rq2 - bow) + " " + n.x + " " + (n.y - rq2);
      if (cross) {
        links += '<path d="' + d + '" fill="none" stroke="' + pc +
          '" stroke-width="9" stroke-linecap="round" opacity="' + (done || lit ? 0.22 : 0.10) + '"/>';
      }
      links += '<path d="' + d + '" fill="none" stroke="' +
        (done || lit ? pc : cross ? "#3A4E74" : "#26344F") + '" stroke-width="' +
        (cross ? (done ? 4.2 : lit ? 3.4 : 2.6) : (done ? 3 : lit ? 2.2 : 1.6)) +
        '" stroke-linecap="round"' + (cross && !done && !lit ? ' stroke-dasharray="7 6"' : "") +
        ' opacity="' + (done ? 0.95 : lit ? 0.7 : cross ? 0.5 : 0.35) + '"/>';
      if (done || lit) {
        beads += treePiece("bead", (q.x + n.x) / 2, ((q.y + R) + (n.y - rq2)) / 2,
          done ? 11 : 8, done ? ty.c : "#54709E", filters);
      }
      if (done) {  // travelled paths get a soft glow
        links += '<path d="M' + q.x + " " + (q.y + R) + "C" + q.x + " " + (q.y + R + bow) +
          " " + n.x + " " + (n.y - rq2 - bow) + " " + n.x + " " + (n.y - rq2) +
          '" fill="none" stroke="' + ty.c + '" stroke-width="7" stroke-linecap="round" opacity="0.13"/>';
      }
    });
  });

  TREE_NODES.forEach((n) => {
    const st = treeState(S, n, active);
    const lv = treeLv(S, n.id);
    const ty = nodeType(n);
    const special = isSpecialNode(n);
    const r = special ? R + 6 : R;
    const locked = st === "lock";
    const clickable = st === "open" || st === "partOpen";

    // ring colour reports STATE, fill reports TYPE
    const ring = locked ? "#2E4269"
      : st === "maxed" ? "#3FB950"
      : st === "busy" ? "#E8B44A"
      : (st === "part" || st === "partOpen") ? "#7FD4FF"
      : clickable ? ty.c : "#4A6494";
    const op = locked ? 0.5 : st === "wait" ? 0.82 : 1;
    const glow = !locked && (st === "maxed" || st === "busy" || clickable);

    /* The reference sheet puts the bonus on the node itself, not its price, so
       you can read the tree without opening anything. The PE cost lives in the
       detail panel, which section 27 requires it to show regardless. */
    let sub;
    if (st === "busy") sub = fmtTime(remain);
    else if (st === "maxed") sub = "MAX";
    else if (special) sub = "0/1";
    else sub = treeEffectValue(n, n.max);
    const subCol = st === "maxed" ? "#84E891" : st === "busy" ? "#FBDD8C"
      : locked ? "#6A7B9C" : "#FBDD8C";

    // plate carries the CATEGORY colour, ring carries the STATE colour
    const plateCol = locked ? "#33415E" : shade(ty.c, st === "maxed" ? -26 : -20);
    const shape =
      treePiece(special ? "plate_oct" : "plate", n.x, n.y, r * 2, plateCol, filters) +
      treePiece(special ? "ring_oct" : (st === "maxed" ? "ring_max" : "ring"),
        n.x, n.y, r * 2 * (st === "maxed" && !special ? 1.34 : 1.06), ring, filters);
    const halo = treePiece("glow", n.x, n.y, (r + 13) * 2, ring, filters, ' opacity="0.5"');

    // every node opens its detail popup, locked ones included
    nodes += '<g data-act="treeNode" data-arg="' + n.id + '" style="cursor:pointer" opacity="' + op + '">' +
      (glow ? halo : "") + shape +
      // locked nodes show a padlock instead of their own glyph
      '<g transform="translate(' + (n.x - 9.5) + " " + (n.y - 10.5) + ') scale(0.79)">' +
        (locked ? "" : (ICO[n.icon] || "")) + "</g>" +
      (locked ? treePiece("lock", n.x, n.y, r * 1.15, "#8FA4CC", filters) : "") +
      // level pill
      '<rect x="' + (n.x + 1) + '" y="' + (n.y + r - 9) + '" width="27" height="13" rx="6.5" ' +
        'fill="#050A12" stroke="' + ring + '" stroke-width="1" opacity="0.96"/>' +
      '<text x="' + (n.x + 14.5) + '" y="' + (n.y + r + 0.6) + '" text-anchor="middle" font-size="8.5" ' +
        'font-weight="900" font-family="Segoe UI,Roboto,sans-serif" fill="' +
        (lv >= n.max ? "#84E891" : lv > 0 ? "#BFE6FF" : "#8496B8") + '">' + lv + "/" + n.max + "</text>" +
      '<text x="' + n.x + '" y="' + (n.y + r + 18) + '" text-anchor="middle" font-size="8.5" font-weight="800" ' +
        'font-family="Segoe UI,Roboto,sans-serif" fill="#EDF1FA">' + esc(n.short) + "</text>" +
      '<text x="' + n.x + '" y="' + (n.y + r + 28) + '" text-anchor="middle" font-size="7.5" font-weight="700" ' +
        'font-family="Segoe UI,Roboto,sans-serif" fill="' + subCol + '">' + esc(sub) + "</text>" +
      "</g>";
  });

  /* The old layout gave each lane a theme -- FORGE, ECLOSION, COMPET.,
     UTILITAIRE -- and printed it as a banner at the top. Sections 16 and 17 ask
     for the opposite: families deliberately scattered across the width, so a
     lane means nothing now and a heading claiming otherwise would be a lie. The
     palier bands carry the structure instead. */
  const caps = "";

  return '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" style="display:block">' +
    bands +
    "<defs>" + defs + Object.keys(filters).map((k) => filters[k]).join("") + "</defs>" +
    caps + links + beads + nodes + "</svg>";
}
/* ---------------- REBIRTH ---------------- */
function scrRebirth() {
  const ok = canRebirth();
  const prGainBonus = rb(S, "prgain");
  const pr = Math.floor(prFromFloor(S.floor) * (1 + prGainBonus / 100));
  const keepPct = rebirthKeepPct(S.rebirth.upgrades.keep || 0);
  const after = floorAfterRebirth(S);
  // only one reason to be blocked now: you are below the floor it needs

  let body;
  if (ok) {
    body = '<div class="dim tiny mt4" style="line-height:1.4">Renais pour gagner <b style="color:var(--purpleLit)">' +
        pr + " PR</b> · tu conserves " + keepPct + "% de ton étage (" + S.floor + " → " + after + ").</div>" +
      '<div class="mt6">' + btn(ic("cycle", 14) + "Renaître · +" + pr + " PR", { cls: "purple", small: true, act: "doRebirth" }) + "</div>";
  } else {
    body = '<div class="dim small mt6" style="line-height:1.55">Atteins l' + "’" + "étage " + RULES.REBIRTH_UNLOCK_FLOOR +
        " pour pouvoir renaître.<br>Étage actuel : " + S.floor + ".</div>" +
      '<div class="mt8">' + meter((S.floor / RULES.REBIRTH_UNLOCK_FLOOR) * 100, C.purple,
        S.floor + " / " + RULES.REBIRTH_UNLOCK_FLOOR) + "</div>" +
      '<div class="mt8">' + btn(ic("cycle", 15) + "Renaître", { cls: "purple", act: "doRebirth", dis: true }) + "</div>";
  }

  return topbar("Rebirth", '<span class="pill" style="color:var(--purpleLit);border-color:var(--purple)">' + ic("cycle", 11) + fmt(S.rebirth.pr) + " PR</span>") +
    '<div class="pad mt6">' +
      '<div class="card frame center">' + ic("cycle", 26) +
        '<div class="bb gt mt4" style="font-size:15px;letter-spacing:1.2px">REBIRTH ' + S.rebirth.count + "</div>" +
        body +
        '<div class="mute tiny mt10 row gap4" style="justify-content:center">' + ic("banner", 11) +
        "Points de Guerre : " + fmt(S.warScore) + " (" + RULES.WAR_POINTS_PER_PR + "/PR)</div>" +
      "</div>" +
      '<div class="sect" style="margin:16px 0 9px">Améliorations permanentes</div>' +
      '<div class="duo">' +
      REBIRTH_UPGRADES.map((u) => {
        const lvl = S.rebirth.upgrades[u.key] || 0;
        const maxed = lvl >= u.max;
        const cost = maxed ? 0 : rebirthUpgCost(u, lvl);
        const uc = maxed ? C.green : C.purple;
        // the level pill already says X / Y, so the duplicate progress bar goes
        return '<div class="itemRow" style="border-left-color:' + uc + ';gap:5px;padding:3px 6px">' +
          '<div class="imini" style="width:22px;height:22px;border-color:' + uc + '80;box-shadow:0 0 9px ' + uc + '33">' +
          ic(u.icon, 13) + "</div>" +
          '<div class="flex1" style="min-width:0"><div class="b" style="font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + u.label +
            ' <span class="mute">' + lvl + "/" + u.max + "</span></div>" +
          '<div class="mute b" style="font-size:9px">+' + (lvl * u.perLvl).toFixed(u.perLvl < 1 ? 2 : 0) + u.unit +
          (maxed ? "" : " → +" + ((lvl + 1) * u.perLvl).toFixed(u.perLvl < 1 ? 2 : 0) + u.unit) + "</div></div>" +
          (maxed ? '<span class="pill" style="padding:1px 6px;font-size:9px;color:' + C.green + ';border-color:' + C.green + '">MAX</span>'
            : btn(cost, { small: true, cls: "purple", act: "buyRebirth", arg: u.key,
                dis: S.rebirth.pr < cost, style: "padding:4px 7px;font-size:10px;width:auto" })) +
          "</div>";
      }).join("") + "</div>" +
    '<div style="height:2px"></div></div>';
}

/* ---------------- ASCENSION ---------------- */
function scrAscension() {
  const running = combat && combat.trial;
  if (running) {
    return topbar("Épreuve d'Ascension") + '<div id="arenaSlot"></div>' + combatBarHTML() +
      '<div class="pad mt6"><div class="card frame center">' +
      '<div class="row gap8" style="justify-content:center">' + ic("crown", 22) +
      '<span class="bb gt" style="font-size:14px;letter-spacing:1.2px">LE GARDIEN DE L\'ASCENSION</span></div>' +
      '<div class="mute small mt6">Bats-le pour ascensionner.</div></div></div>';
  }
  const done = S.ascension >= 3;
  const gems = done ? 0 : ASCENSION_GEMS[S.ascension];
  return topbar("Ascension", '<span class="pill" style="color:#FF9BC1;border-color:#FF4D8D">' + ic("star", 11) + "Palier " + S.ascension + "/3</span>") +
    '<div class="pad mt6">' +
      '<div class="card frame center">' + ic("star", 42) +
        '<div class="bb gt mt6" style="font-size:17px;letter-spacing:1.4px">' +
        (done ? "ASCENSION MAXIMALE" : ASCENSION_NAMES[S.ascension].toUpperCase()) + "</div>" +
        (done ? '<div class="dim small mt6">Tu as atteint le palier maximum d\'Ascension.</div>'
        : !S.ascensionAvailable ? '<div class="dim small mt6" style="line-height:1.55">Atteins le <b>niveau ' + RULES.MAX_LEVEL +
            "</b> pour tenter l'Épreuve d'Ascension.<br>Niveau actuel : " + S.level + ".</div>" +
            '<div class="mt8">' + meter((S.level / RULES.MAX_LEVEL) * 100, "#FF4D8D", S.level + " / " + RULES.MAX_LEVEL) + "</div>"
        : '<div class="dim small mt6" style="line-height:1.55">Bats le Gardien, puis ascensionne :<br>' +
            "· ton niveau repart à 1, les bonus permanents restent<br>· +<b>" + gems + "</b> gemmes et +2 accélérateurs 30 min<br>" +
            "· +2 clés par raid · taux <b>Divin</b> débloqués</div>" +
          '<div class="mt10">' + btn(ic("swords", 15) + "Tenter l'Épreuve", { cls: "purple", act: "startTrial" }) + "</div>") +
      "</div>" +
      '<div class="sect" style="margin:16px 0 9px">Paliers</div>' +
      ASCENSION_NAMES.map((n, i) => {
        const got = S.ascension > i, col = got ? C.green : "#FF4D8D";
        return '<div class="itemRow" style="border-left-color:' + col + '">' +
        '<div class="imini" style="width:30px;height:30px;border-color:' + col + '80;box-shadow:0 0 9px ' + col + '33">' +
        ic(got ? "check" : "star", 17) + "</div>" +
        '<div class="flex1"><div class="b small">' + n + "</div>" +
        '<div class="mute tiny b row gap4">' + ic("gem", 10) + "+" + ASCENSION_GEMS[i] + " · reset niveau · taux Divin</div></div>" +
        '<span class="pill"' + (got ? ' style="color:var(--greenLit);border-color:#3FB950"' : "") + ">" +
        (got ? "Acquis" : "—") + "</span></div>"; }).join("") +
      '<div class="notice tiny mt6">Les taux Divin n\'apparaissent qu\'après une Ascension (jusqu\'à 6% à maîtrise maximale).</div>' +
    '<div style="height:2px"></div></div>';
}

/* ---------------- BOUTIQUE ---------------- */
const GEM_DEALS = [
  { id: "key",     label: "+1 Clé Universelle",      cost: 100, icon: "key",     color: C.gold },
  { id: "acc15",   label: "5× Accélérateur 15 min",  cost: 200, icon: "bolt",    color: C.cyan },
  { id: "acc60",   label: "2× Accélérateur 1 h",     cost: 500, icon: "clock",   color: C.purple },
  { id: "minerai", label: "Sac de 5000 Minerai",     cost: 300, icon: "minerai", color: C.blue },
];
function scrBoutique() {
  const medal = (icon, color) => '<div class="imini" style="width:27px;height:27px;background:linear-gradient(180deg,' +
    color + '33,' + color + '0f);border-color:' + color + '80;box-shadow:0 0 11px ' + color + '3d">' + ic(icon, 16) + "</div>";
  return topbar("Boutique", '<span class="pill" data-act="resInfo" data-arg="gems" style="cursor:pointer;color:#FF9BC1;border-color:#FF4D8D">' + ic("gem", 11) + fmt(S.gems) + "</span>") +
    '<div class="pad mt6">' +
      '<div class="sect" style="margin:0 0 9px">Gemmes</div>' +
      '<div class="row gap8">' + GEM_PACKS.map((p, i) =>
        '<div class="card frame flex1 center" style="padding:6px 5px">' + ic("gem", 19) +
        '<div class="bb" style="font-size:15px;margin:3px 0 5px;color:#FF9BC1">' + fmt(p.gems) + "</div>" +
        btn(p.price, { small: true, cls: "green", act: "buyPack" }) + "</div>").join("") + "</div>" +
      '<div class="mute tiny mt6">Les Gemmes s\'obtiennent aussi via l\'Ascension (1000 / 1500 / 2000).</div>' +
      '<div class="sect" style="margin:16px 0 9px">Dépenser tes Gemmes</div>' +
      GEM_DEALS.map((d) =>
        '<div class="card mt6" style="padding:5px 8px"><div class="between"><div class="row gap10">' + medal(d.icon, d.color) +
        '<div class="b small">' + d.label + "</div></div>" +
        btn(ic("gem", 12) + d.cost, { small: true, cls: "purple", act: "buyDeal", arg: d.id, dis: S.gems < d.cost, style: "width:auto;padding:5px 10px" }) +
        "</div></div>").join("") +
      '<div class="card mt6" style="padding:5px 8px"><div class="between"><div class="row gap10">' + medal("egg", C.gold) +
        '<div><div class="b small">+1 Slot d\'Œuf</div><div class="mute tiny">' +
        (S.eggSlotGemBought ? "Achat unique effectué · " + S.eggSlots + "/" + RULES.EGG_SLOT_MAX
          : S.level < 10 ? "Niveau 10 requis" : S.eggSlots + "/" + RULES.EGG_SLOT_MAX) + "</div></div></div>" +
        (S.eggSlotGemBought
          ? '<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Acheté</span>'
          : btn(ic("gem", 12) + "300", { small: true, cls: "purple", act: "buyEggSlot",
              dis: S.level < 10 || S.eggSlots >= RULES.EGG_SLOT_MAX || S.gems < 300,
              style: "width:auto;padding:5px 10px" })) +
      "</div></div>" +
      '<div class="mute tiny center mt8" style="font-style:italic">F2P : tout reste accessible avec le temps ; les achats ne font qu\'accélérer.</div>' +
    '<div style="height:2px"></div></div>';
}

/* ---------------- ÉVÉNEMENT ---------------- */
function scrEvenement() {
  const progText = (id) => {
    const p = S.eventProgress;
    if (id === "floors") return Math.min(5, p.floors || 0) + "/5";
    if (id === "forge") return Math.min(3, p.forge || 0) + "/3";
    if (id === "hatch") return Math.min(2, p.hatch || 0) + "/2";
    if (id === "hard") return Math.min(1, p.hard || 0) + "/1";
    if (id === "mission") return ["login", "floors", "forge", "hatch"].filter((k) => S.eventClaims[k]).length + "/4";
    return "Prêt";
  };
  const doneCount = EVENT_MISSIONS.filter((m) => S.eventClaims[m.id]).length;
  return topbar("Événement") +
    '<div class="pad mt6">' +
      '<div class="card frame center">' + ic("bolt", 27) +
        '<div class="bb gt mt4" style="font-size:14px;letter-spacing:1.2px">LUNDI D\'ACCÉLÉRATION</div>' +
        '<div class="dim tiny center mt4" style="line-height:1.4">24h de récompenses en Accélérateurs — ' +
        "Arbre, Forge et éclosion des Œufs.</div>" +
        '<div class="mt6">' + meter((doneCount / EVENT_MISSIONS.length) * 100, C.cyan,
          doneCount + " / " + EVENT_MISSIONS.length + " missions") + "</div></div>" +
      '<div class="sect" style="margin:16px 0 9px">Missions</div>' +
      EVENT_MISSIONS.map((m) => {
        const claimed = S.eventClaims[m.id];
        const ready = eventDone(m.id);
        return '<div class="itemRow" style="border-left-color:' + (claimed ? C.green : ready ? C.gold : C.cyan) + '">' +
          '<div class="imini" style="width:26px;height:26px;border-color:' + (claimed ? "#3FB950" : C.cyan) +
          '80">' + ic(claimed ? "check" : "gift", 15) + "</div>" +
          '<div class="flex1"><div class="b small">' + m.label + "</div>" +
          '<div class="tiny b row gap4" style="color:#8FEFF4;margin-top:1px">' + ic("bolt", 10) + m.reward + "</div></div>" +
          (claimed ? '<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Réclamé</span>'
            : btn(ready ? "Réclamer" : progText(m.id), { small: true, cls: ready ? "green" : "dark",
                act: "claimEvent", arg: m.id, dis: !ready, style: "width:auto;padding:5px 10px" })) +
          "</div>";
      }).join("") +
      '<div class="mute tiny center mt8">Objectif global : ≈ 1h à 1h30 d\'accélération selon ton activité.</div>' +
    '<div style="height:2px"></div></div>';
}

/* ---------------- CLASSEMENT ---------------- */
function scrClassement() {
  return topbar("Classement") +
    '<div class="pad mt6">' +
      '<div class="card frame"><div class="row gap10">' +
        '<div class="avatar" style="width:46px;height:46px"><img src="' + ASSETS.hero + '"></div>' +
        '<div class="flex1"><div class="mute tiny b" style="letter-spacing:.6px">TA POSITION</div>' +
        '<div class="between"><b style="font-size:15px">' + esc(S.playerName) + "</b>" +
        '<b class="gt row gap4" style="font-size:15px">' + ic("castle", 14) + "Étage " + S.recordFloor + "</b></div>" +
        '<div class="between mt6"><span class="mute small">Niveau ' + S.level + " · Puissance " + fmt(S.power) + "</span>" +
        '<span class="mute small">' + S.rebirth.count + " rebirth · Asc. " + S.ascension + "</span></div></div></div></div>" +
      '<div class="sect" style="margin:16px 0 9px">Meilleurs joueurs</div>' +
      '<div class="notice">Le classement mondial vient du serveur FastAPI (<b>GET /api/leaderboard</b>), ' +
      "qui n'est pas disponible dans cette version fichier-unique. Tes records restent suivis localement.</div>" +
      '<div class="sect" style="margin:16px 0 9px">Tes records</div>' +
      '<div class="card"><div class="row" style="flex-wrap:wrap">' +
        '<div class="kv"><span class="dim row gap6">' + ic("castle", 13) + 'Étage record</span><b style="color:var(--goldLit)">' + S.recordFloor + "</b></div>" +
        '<div class="kv"><span class="dim row gap6">' + ic("target", 13) + "Dernier checkpoint</span><b>" + S.checkpoint + "</b></div>" +
        '<div class="kv"><span class="dim row gap6">' + ic("skull", 13) + "Boss vaincus</span><b>" + Object.keys(S.bossClears).length + "</b></div>" +
        RAID_IDS.map((id) => '<div class="kv"><span class="dim row gap6">' + ic(RAIDS[id].icon, 13) + RAIDS[id].name +
          '</span><b>niv. ' + S.raids[id].record + "</b></div>").join("") +
        '<div class="kv"><span class="dim row gap6">' + ic("banner", 13) + 'Points de Guerre</span><b style="color:var(--purpleLit)">' + fmt(S.warScore) + "</b></div>" +
      "</div></div>" +
    '<div style="height:2px"></div></div>';
}

/* ---------------- CHAT / CLAN (server-only) ---------------- */
function scrServerOnly(title, endpoints, blurb) {
  return topbar(title) +
    '<div class="pad mt6"><div class="card frame center">' + ic("plug", 38) +
      '<div class="bb gt mt6" style="font-size:14px;letter-spacing:1.2px">FONCTION SERVEUR</div>' +
      '<div class="dim small mt6" style="line-height:1.6">' + blurb + "</div></div>" +
      '<div class="sect" style="margin:16px 0 9px">Routes concernées</div>' +
      '<div class="card">' + endpoints.map((e) =>
        '<div class="kv"><code class="small" style="color:#8FEFF4">' + e[0] + '</code><span class="mute tiny">' + e[1] + "</span></div>").join("") + "</div>" +
      '<div class="notice mt10">Pour activer ces écrans, lance le backend du projet (<b>backend/server.py</b>, FastAPI + MongoDB) ' +
      "et l'app Expo — cette version fichier-unique est purement locale.</div>" +
    "</div>";
}

/* ---------------- PARAMÈTRES ---------------- */
function scrParametres() {
  return topbar("Réglages") +
    '<div class="pad mt6">' +
      '<div class="card frame"><div class="between"><div class="row gap10">' +
        '<div class="avatar" style="width:44px;height:44px"><img src="' + ASSETS.hero + '"></div>' +
        '<div><div class="mute tiny b" style="letter-spacing:.6px">JOUEUR</div>' +
        '<b style="font-size:15px">' + esc(S.playerName) + "</b></div></div>" +
        btn("Renommer", { small: true, cls: "ghost", act: "rename", style: "width:auto;padding:5px 10px" }) + "</div>" +
        '<div class="divider"></div>' +
        '<div class="row" style="flex-wrap:wrap">' + [
          ["Niveau", S.level + " / " + RULES.MAX_LEVEL, ""],
          ["Étage · record", S.floor + " · " + S.recordFloor, ""],
          ["Puissance", fmt(S.power), "color:var(--goldLit)"],
          ["Rebirth · Asc.", S.rebirth.count + " · " + S.ascension, ""],
          ["Environnement", ENV_NAMES[combat && combat.bg] || "—", ""],
          ["Jour", String(daysElapsed(S)), "color:var(--goldLit)"],
          ["Jours simulés", String(S.testDays || 0), ""],
        ].map((r) => '<div style="width:50%"><div class="kv" style="border:none;padding:2px 0">' +
          '<span class="dim">' + r[0] + '</span><b style="' + r[2] + '">' + r[1] + "</b></div></div>").join("") + "</div>" +
      "</div>" +
      fold("save", "Sauvegarde", '<div class="card"><div class="dim small" style="line-height:1.5">Progression enregistrée dans le ' +
        "<b>localStorage</b> du navigateur (clé <code>" + SAVE_KEY + "</code>), toutes les 8 s et à la fermeture. " +
        "Pas de sauvegarde cloud sans le serveur.</div>" +
        '<div class="row gap6 mt10">' +
          btn(ic("save", 14) + "Sauver", { small: true, cls: "green", act: "saveNow" }) +
          btn(ic("upload", 14) + "Exporter", { small: true, cls: "ghost", act: "exportSave" }) +
          btn(ic("download", 14) + "Importer", { small: true, cls: "ghost", act: "importSave" }) +
        '</div><div class="divider"></div><div class="between"><span class="dim tiny">Version web · ' + APP_BUILD + '</span>' +
          btn("Forcer la mise à jour", { small: true, cls: "blue", act: "freshReload", style: "width:auto;padding:5px 10px" }) +
        "</div></div>") +
      fold("tools", "Outils de test", '<div class="card"><div class="dim small">Comme dans l\'app d\'origine : avance d\'une journée complète ' +
        "(recharge les clés, termine les recherches et les œufs, applique les gains AFK plafonnés).</div>" +
        '<div class="mt10">' + btn(ic("forward", 14) + "Simuler 1 jour", { cls: "blue", small: true, act: "warpDay" }) + "</div></div>") +
      fold("account", "Compte", '<div class="card"><div class="dim small" style="line-height:1.5">L\'app d\'origine gère un mode invité et ' +
        "« Continuer avec Google » via le backend Emergent, avec migration de progression. " +
        "Cette version est locale et anonyme.</div>" +
        '<div class="mt10">' + btn(ic("trash", 14) + "Réinitialiser la progression", { cls: "red", small: true, act: "askReset" }) + "</div></div>") +
      fold("about", "À propos", '<div class="card"><div class="dim small" style="line-height:1.6">' +
        "<b>Shadowreach</b> — portage fichier-unique du projet Expo/React&nbsp;Native + FastAPI. " +
        "Moteur de combat, forge, compétences, familiers, raids, arbre, rebirth et ascension repris " +
        "des mêmes formules (<code>src/game/config.ts</code>).<br><br>" +
        "Non inclus, car nécessitant le serveur : chat monde/clan, clans, classement mondial, " +
        "connexion Google, sauvegarde cloud, achats intégrés." +
      "</div></div>") +
    '<div style="height:2px"></div></div>';
}


const ARENA_PROGRESSION = {
  /* Ces profils restent des hypothèses de rythme tant qu'aucune télémétrie réelle
     n'existe. La V3 leur donne cependant une progression interne cohérente avec
     les systèmes du jeu : Forge, Rebirth, Arbre, Familiers et niveaux de Compétences. */
  j1:  { label:"J1",  forge:6,  crafts:5,  petRarity:"COMMUN",   petLevel:4,  petStars:0,
         skillRarity:0, skillLevel:2, skillStars:0, statPts:12, spread:.14,
         rebirth:{}, tree:{passDmg:0,passHp:0,skillDmg:0,petDmg:0,petHp:0}, globalAscension:0, forgeStars:0 },
  j7:  { label:"J7",  forge:18, crafts:12, petRarity:"RARE",     petLevel:7,  petStars:0,
         skillRarity:1, skillLevel:6, skillStars:0, statPts:35, spread:.11,
         rebirth:{damage:2,life:2,atkspeed:1,critdmg:1,dmgred:1},
         tree:{passDmg:4,passHp:4,skillDmg:4,petDmg:4,petHp:4}, globalAscension:0, forgeStars:0 },
  j30: { label:"J30", forge:35, crafts:28, petRarity:"EPIQUE",   petLevel:10, petStars:0,
         skillRarity:2, skillLevel:16, skillStars:0, statPts:85, spread:.09,
         rebirth:{damage:7,life:7,atkspeed:3,critdmg:3,dmgred:5,regen:2,lifesteal:2},
         tree:{passDmg:12,passHp:12,skillDmg:12,petDmg:10,petHp:10}, globalAscension:0, forgeStars:0 },
  j90: { label:"J90", forge:50, crafts:60, petRarity:"MYTHIQUE", petLevel:14, petStars:1,
         skillRarity:3, skillLevel:30, skillStars:0, statPts:170,spread:.07,
         rebirth:{damage:15,life:15,atkspeed:5,critdmg:5,dmgred:10,regen:4,lifesteal:4},
         tree:{passDmg:24,passHp:24,skillDmg:24,petDmg:20,petHp:20}, globalAscension:1, forgeStars:0 },
};
const ARENA_BUILDS = {
  random:{label:"Aléatoire"}, equilibre:{label:"Équilibré"}, dps:{label:"DPS"},
  tank:{label:"Tank"}, crit:{label:"Critique"}, sustain:{label:"Vol de vie"}, skills:{label:"Compétences"}
};
const ARENA_SKILL_RANK={COMMUN:0,RARE:1,EPIQUE:2,MYTHIQUE:3,LEGENDAIRE:4,DIVIN:5};
function arenaRbValue(prog,key){
  const def=REBIRTH_UPGRADES.find(u=>u.key===key);return def?((prog.rebirth&&prog.rebirth[key])||0)*def.perLvl:0;
}
function arenaPlayerProfile() {
  const wt=WEAPON_TYPES[D.weapon]||WEAPON_TYPES.epee;
  const active=S.skillSlots.slice(0,skillSlotCount(S)).map(id=>SKILL_BY_ID[id]&&S.skills[id]?{def:SKILL_BY_ID[id],level:S.skills[id].level||1,stars:starsOf(S,"skill")}:null)
    .filter(Boolean);
  return {name:S.playerName||"Héros",maxHP:Math.max(1,D.maxHP),damage:Math.max(1,D.damage),
    attackSpeed:Math.max(.1,D.attackSpeed*(wt.speed||1)),hit:wt.hit||1,critChance:Math.max(0,D.critChance||0),
    critMult:Math.max(1,D.critMult||1.5),critRed:Math.max(0,D.critRed||0),dmgRed:Math.min(85,Math.max(0,D.dmgRed||0)),
    blockChance:Math.min(75,Math.max(0,D.blockChance||0)),doubleAtk:Math.min(100,Math.max(0,D.doubleAtk||0)),
    lifesteal:Math.max(0,D.lifesteal||0),regen:Math.max(0,D.regen||0),
    styleBonus:wt.attackType==="MELEE"?(D.meleeDmg||0):(D.rangedDmg||0),skillDmg:D.skillDmgBonus||0,skillCd:D.skillCdCut||0,
    skills:active,petElem:D.petElem||null,source:"joueur"};
}
function arenaProfilePower(p) {
  const crit=1+(p.critChance/100)*Math.max(0,p.critMult-1), dbl=1+Math.min(100,p.doubleAtk)/100;
  const style=1+Math.max(0,p.styleBonus)/100, skill=1+(Math.max(0,p.skillDmg)/100)*.25+(Math.max(0,p.skillCd)/100)*.25;
  const offense=p.damage*p.attackSpeed*(p.hit||1)*crit*dbl*style*skill;
  const mitigation=1/Math.max(.15,1-Math.min(85,p.dmgRed)/100), block=1+Math.min(75,p.blockChance)/200;
  const sustain=1+Math.min(50,p.lifesteal)/200+Math.min(50,p.regen)/250;
  return Math.max(1,Math.floor(Math.sqrt(Math.max(1,offense)*Math.max(1,p.maxHP*mitigation*block*sustain))*1.5));
}
function arenaRollRarity(forge,ascension){
  const rates=gateForgeRates(getRates("forge",forge,ascension||0,0),forge); return rollRarity(rates,EQUIP_RARITY_ORDER);
}
function arenaItem(slot,rar,forge,forgeStars){
  const mul=RARITY_MUL[rar]||1,base=(6+forge*2)*ascendPowerMul(forgeStars||0,"forge"),roll=SINGLE_STAT_MUL*(.9+Math.random()*.4);
  return {slot,rarity:rar,weaponType:slot==="arme"?WEAPON_LIST[Math.floor(Math.random()*WEAPON_LIST.length)]:null,
    damage:MASTERY_STAT[slot]==="dmg"?Math.floor(base*mul*roll):0,hp:MASTERY_STAT[slot]==="hp"?Math.floor(base*mul*4*roll):0,affixes:rollAffixes(rar)};
}
/* Sélectionne l'équipement selon sa contribution de build complète, et non plus
   uniquement Dégâts*12 + PV*.15. Les affixes et le type d'arme peuvent donc
   réellement faire gagner une pièce pourtant un peu plus faible en stat brute. */
function arenaItemScore(it){
  const af={};(it.affixes||[]).forEach(a=>af[a.key]=(af[a.key]||0)+a.value);const A=k=>af[k]||0;
  const wt=WEAPON_TYPES[it.weaponType]||WEAPON_TYPES.epee;
  const p={maxHP:Math.max(1,BASE.hp+it.hp),damage:Math.max(1,BASE.damage+it.damage),
    attackSpeed:BASE.attackSpeed*(1+Math.min(20,A("atkspeed"))/100)*(wt.speed||1),hit:wt.hit||1,
    critChance:Math.min(CRIT_CHANCE_CAP,BASE.critChance+A("crit")),critMult:BASE.critMult+A("critdmg")/100,critRed:0,
    dmgRed:0,blockChance:Math.min(75,A("block")),doubleAtk:Math.min(100,A("double")),lifesteal:Math.max(0,A("lifesteal")),regen:0,
    styleBonus:wt.attackType==="MELEE"?A("melee"):A("ranged"),skillDmg:A("skilldmg"),skillCd:Math.min(80,A("skillcd"))};
  p.maxHP=Math.floor(p.maxHP*(1+A("hp")/100));p.damage=Math.floor(p.damage*(1+A("dmg")/100));return arenaProfilePower(p);
}
function arenaSyntheticGear(prog){
  const out={};
  SLOTS.forEach(slot=>{let best=null,bp=-1;for(let i=0;i<prog.crafts;i++){
    const it=arenaItem(slot,arenaRollRarity(prog.forge,prog.globalAscension),prog.forge,prog.forgeStars),p=arenaItemScore(it);
    if(p>bp){best=it;bp=p;}
  }out[slot]=best;});
  return out;
}
function arenaSyntheticSkills(prog,kind){
  let pool=SKILL_DEFS.filter(d=>(ARENA_SKILL_RANK[d.rarity]||0)<=prog.skillRarity && (d.rarity!=="DIVIN"||prog.globalAscension>0));
  if(kind==="skills") pool=pool.filter(d=>d.cat==="ATTAQUE"||d.cat==="AOE"||d.cat==="BUFF"||d.cat==="SOIN"||d.cat==="DEBUFF");
  const score=d=>kind==="tank"?(d.cat==="SOIN"||d.id==="rempart"||d.id==="lenteur"?5:1):kind==="skills"?(d.mult||0)*2+1/Math.max(1,d.cd):kind==="dps"||kind==="crit"?(d.mult||0)*2:1;
  return pool.slice().sort((a,b)=>score(b)-score(a)+(.4-Math.random()*.8)).slice(0,RULES.SKILL_SLOTS_BASE)
    .map(def=>({def,level:Math.max(1,Math.round(prog.skillLevel*(.85+Math.random()*.3))),stars:prog.skillStars||0}));
}
function arenaSyntheticBase(prog,kind){
  const gear=arenaSyntheticGear(prog);let hp=BASE.hp,dmg=BASE.damage,af={};let weapon="epee";
  Object.values(gear).forEach(it=>{hp+=it.hp;dmg+=it.damage;if(it.slot==="arme")weapon=it.weaponType||weapon;(it.affixes||[]).forEach(a=>af[a.key]=(af[a.key]||0)+a.value);});
  const A=k=>af[k]||0, pts=prog.statPts;
  let hpPts=.42,dmgPts=.42,critPts=.16;if(kind==="tank"){hpPts=.68;dmgPts=.25;critPts=.07}else if(kind==="dps"||kind==="crit"||kind==="skills"){hpPts=.27;dmgPts=.55;critPts=.18}
  hp+=pts*hpPts*STATS.SANTE.perPoint;dmg+=pts*dmgPts*STATS.DEGATS.perPoint;
  const tree=prog.tree||{};
  const petBase=petBonusAt(prog.petRarity,Math.min(prog.petLevel,petMaxLevel(prog.petRarity)),prog.petStars||0);
  const petHpPct=petBase*(1+(tree.petHp||0)/100), elem=PET_ELEMENTS[Math.floor(Math.random()*PET_ELEMENTS.length)].id;
  const petDmgPct=petHpPct*(1+(tree.petDmg||0)/100)*(elem==="normal"?1.10:1);
  const forgePct=prog.forge*2;
  hp*=(1+arenaRbValue(prog,"life")/100+petHpPct/100+forgePct/200+(tree.passHp||0)/100);
  dmg*=(1+arenaRbValue(prog,"damage")/100+petDmgPct/100+forgePct/100+(tree.passDmg||0)/100);
  const wt=WEAPON_TYPES[weapon]||WEAPON_TYPES.epee;
  let p={name:"Bot",maxHP:Math.max(1,Math.floor(hp*(1+A("hp")/100))),damage:Math.max(1,Math.floor(dmg*(1+A("dmg")/100))),
    attackSpeed:BASE.attackSpeed*(1+arenaRbValue(prog,"atkspeed")/100)*(1+Math.min(20,A("atkspeed"))/100)*(elem==="electrique"?1.08:1)*(wt.speed||1),hit:wt.hit||1,
    critChance:Math.min(CRIT_CHANCE_CAP,BASE.critChance+pts*critPts*STATS.CRIT.perPoint+A("crit")),critMult:BASE.critMult+arenaRbValue(prog,"critdmg")/100+A("critdmg")/100,critRed:0,
    dmgRed:Math.min(85,arenaRbValue(prog,"dmgred")),blockChance:Math.min(75,A("block")),doubleAtk:Math.min(100,A("double")),
    lifesteal:Math.max(0,arenaRbValue(prog,"lifesteal")+A("lifesteal")),regen:Math.max(0,arenaRbValue(prog,"regen")),
    styleBonus:wt.attackType==="MELEE"?A("melee"):A("ranged"),skillDmg:(tree.skillDmg||0)+A("skilldmg"),skillCd:Math.min(80,A("skillcd")),
    skills:arenaSyntheticSkills(prog,kind),petElem:elem,gear,source:prog.label};
  if(kind==="dps"){p.damage*=1.12;p.maxHP*=.92} if(kind==="tank"){p.maxHP*=1.18;p.damage*=.92;p.dmgRed=Math.min(85,p.dmgRed+8);p.blockChance=Math.min(75,p.blockChance+6)}
  if(kind==="crit"){p.critChance=Math.min(CRIT_CHANCE_CAP,p.critChance+10);p.critMult+=.25;p.maxHP*=.94}
  if(kind==="sustain"){p.lifesteal+=10;p.regen+=2;p.maxHP*=1.04} if(kind==="skills"){p.skillDmg+=18;p.skillCd=Math.min(80,p.skillCd+6)}
  return p;
}
function arenaBotProfile(kind){
  const prog=ARENA_PROGRESSION[arenaSimCfg.progression]||ARENA_PROGRESSION.j7;
  if(kind==="random"){const pool=["equilibre","dps","tank","crit","sustain","skills"];kind=pool[Math.floor(Math.random()*pool.length)];}
  const p=arenaSyntheticBase(prog,kind),natural=arenaSimCfg.ratio==="natural";
  if(natural){const organic=1+(Math.random()*2-1)*prog.spread;p.maxHP=Math.max(1,Math.floor(p.maxHP*organic));p.damage=Math.max(1,Math.floor(p.damage*organic));}
  else {const target=Math.max(1,(S.power||arenaProfilePower(arenaPlayerProfile()))*(Number(arenaSimCfg.ratio)/100)*(1+(Math.random()*2-1)*prog.spread));
    const now=arenaProfilePower(p),k=Math.max(.2,Math.min(5,target/Math.max(1,now)));p.maxHP=Math.max(1,Math.floor(p.maxHP*k));p.damage=Math.max(1,Math.floor(p.damage*k));}
  p.power=arenaProfilePower(p);p.kind=kind;p.name="Bot "+ARENA_BUILDS[kind].label+" · "+prog.label;return p;
}
function arenaExpectedBasicDps(att, def){
  const critChance=Math.min(100,Math.max(0,att.critChance||0))/100;
  const critExtra=Math.max(0,(att.critMult||1)-1)*(1-Math.min(80,Math.max(0,def.critRed||0))/100);
  const critMul=1+critChance*critExtra;
  const doubleMul=1+Math.min(100,Math.max(0,att.doubleAtk||0))/100;
  const blockMul=1-Math.min(75,Math.max(0,def.blockChance||0))/100;
  const mitigation=1-Math.min(85,Math.max(0,def.dmgRed||0))/100;
  const tox=att.petElem==="toxique"?1.10:1;
  return Math.max(0,(att.damage||1)*(att.hit||1)*Math.max(.1,att.attackSpeed||1)*
    (1+Math.max(0,att.styleBonus||0)/100)*critMul*doubleMul*blockMul*mitigation*tox);
}
function arenaSkillPressure(p){
  /* V3.2: les effets continus restent moyennés pour garder 1 000 simulations
     instantanées, mais les soins immédiats redeviennent de vrais événements.
     Poison reste dépendant des PV de la cible et Vulnérabilité est appliquée à
     toutes les sources offensives comme l’annonce Malédiction. */
  let skillDps=0,heal=0,red=0,haste=0,slow=0,force=0,vuln=0,poison=0;
  const instantHeals=[];
  (p.skills||[]).forEach(entry=>{const d=entry.def||entry,lv=entry.level||1,stars=entry.stars||0;
    const cd=Math.max(1,d.cd*(1-Math.min(80,p.skillCd)/100));
    if(d.mult){const mult=skillMult(d)*(1+(lv-1)*SKILL_LEVEL_GROWTH)*ascendPowerMul(stars,"skill");skillDps+=p.damage*mult*(1+p.skillDmg/100)/cd;}
    if(d.heal)instantHeals.push({amount:p.maxHP*(skillHeal(d,lv)/100),cd});
    if(d.eff){const e=skillEff(d,lv),uptime=Math.min(1,e.dur/cd);
      if(e.stat==="dmg")force+=e.value*uptime;
      if(e.stat==="dmgRed")red+=e.value*uptime;
      if(e.stat==="haste")haste+=e.value*uptime;
      if(e.stat==="regen")heal+=p.maxHP*(e.value/100)*uptime;
      if(e.stat==="poison")poison+=e.value*uptime;
      if(e.stat==="vuln")vuln+=e.value*uptime;
      if(e.stat==="slow")slow+=e.value*uptime;
    }}
  );
  return {skillDps,heal,instantHeals,red:Math.min(85,red),haste:Math.min(80,haste),slow:Math.min(80,slow),
    force:Math.max(0,force),vuln:Math.max(0,vuln),poison:Math.max(0,poison)};
}
function arenaStrike(att,def){
  if(Math.random()*100<def.blockChance)return{dmg:0,heal:0};
  let dmg=att.damage*(att.hit||1)*(1+Math.max(0,att.styleBonus)/100);
  if(Math.random()*100<att.critChance)dmg*=1+Math.max(0,att.critMult-1)*(1-Math.min(80,def.critRed)/100);
  dmg*=1-Math.min(85,def.dmgRed)/100;dmg*=.90+Math.random()*.20;if(Math.random()*100<att.doubleAtk)dmg*=2;dmg=Math.max(1,dmg);
  return{dmg,heal:dmg*Math.max(0,att.lifesteal)/100};
}
function arenaDuel(player,bot){
  let ah=player.maxHP,bh=bot.maxHP,t=0,an=Math.random()*.25,bn=Math.random()*.25;const aps=arenaSkillPressure(player),bps=arenaSkillPressure(bot);
  const aHeals=(aps.instantHeals||[]).map(h=>({amount:h.amount,cd:h.cd,next:0}));
  const bHeals=(bps.instantHeals||[]).map(h=>({amount:h.amount,cd:h.cd,next:0}));
  const nextHeal=(arr)=>arr.length?Math.min(...arr.map(h=>h.next)):Infinity;
  const fireHeals=(arr,isPlayer)=>{arr.forEach(h=>{if(h.next<=t+1e-9){if(isPlayer)ah=Math.min(player.maxHP,ah+h.amount);else bh=Math.min(bot.maxHP,bh+h.amount);h.next+=h.cd;}});};
  /* Glace suit la règle du moteur principal : +12% sur l'intervalle d'attaque
     adverse. Lenteur et Hâte gardent leur uptime moyen pour cette simulation rapide. */
  const aSlow=(bot.petElem==="glace"?12:0)+bps.slow,bSlow=(player.petElem==="glace"?12:0)+aps.slow;
  const aInt=(1/Math.max(.1,player.attackSpeed*(1+aps.haste/100)))*(1+aSlow/100),bInt=(1/Math.max(.1,bot.attackSpeed*(1+bps.haste/100)))*(1+bSlow/100);
  const aDef={...bot,dmgRed:Math.min(85,bot.dmgRed+bps.red)},bDef={...player,dmgRed:Math.min(85,player.dmgRed+aps.red)};
  while(ah>0&&bh>0&&t<60){const nt=Math.min(an,bn,nextHeal(aHeals),nextHeal(bHeals),60),dt=Math.max(0,nt-t);t=nt;if(dt>0){
    /* Base regen + Régénération restent continus et plafonnés aux PV max. */
    ah=Math.min(player.maxHP,ah+player.maxHP*(Math.max(0,player.regen)/100)*dt+aps.heal*dt);
    bh=Math.min(bot.maxHP,bh+bot.maxHP*(Math.max(0,bot.regen)/100)*dt+bps.heal*dt);

    const aMit=1-Math.min(85,aDef.dmgRed)/100,bMit=1-Math.min(85,bDef.dmgRed)/100;
    const aVuln=1+aps.vuln/100,bVuln=1+bps.vuln/100;
    const aTox=player.petElem==="toxique"?1.10:1,bTox=bot.petElem==="toxique"?1.10:1;
    /* V3.3 : Malédiction et Toxique amplifient toutes les sources offensives,
       y compris compétences, brûlure et poison. */
    const aSkill=aps.skillDps*aMit*aVuln*aTox,bSkill=bps.skillDps*bMit*bVuln*bTox;
    const aFire=(player.petElem==="feu"?player.damage*.06*aMit:0)*aVuln*aTox;
    const bFire=(bot.petElem==="feu"?bot.damage*.06*bMit:0)*bVuln*bTox;
    const aPoison=bot.maxHP*(aps.poison/100)/8*aVuln*aTox,bPoison=player.maxHP*(bps.poison/100)/8*bVuln*bTox;
    bh-=(aSkill+aFire+aPoison)*dt;ah-=(bSkill+bFire+bPoison)*dt;
  }
  if(ah<=0||bh<=0)break;
  /* Soin/Bénédiction : cast immédiat, même s'il est gaspillé à PV pleins, puis
     nouvelle disponibilité après leur vrai cooldown. */
  if(nextHeal(aHeals)<=t+1e-9)fireHeals(aHeals,true);
  if(nextHeal(bHeals)<=t+1e-9)fireHeals(bHeals,false);
  if(an<=bn&&an<=t+1e-9&&an<=60){const r=arenaStrike({...player,damage:player.damage*(1+aps.force/100)},aDef);bh-=r.dmg*(1+aps.vuln/100)*(player.petElem==="toxique"?1.10:1);ah=Math.min(player.maxHP,ah+r.heal);an+=aInt*(.88+Math.random()*.24);}if(bh<=0)break;
  if(bn<=an&&bn<=t+1e-9&&bn<=60){const r=arenaStrike({...bot,damage:bot.damage*(1+bps.force/100)},bDef);ah-=r.dmg*(1+bps.vuln/100)*(bot.petElem==="toxique"?1.10:1);bh=Math.min(bot.maxHP,bh+r.heal);bn+=bInt*(.88+Math.random()*.24);}
  }
  const won=ah>0&&bh<=0,lost=bh>0&&ah<=0;return{won,lost,draw:!won&&!lost,time:t,hpPct:Math.max(0,ah)/player.maxHP*100};
}
function arenaBatch(player, progression, ratio, build, n){
  const prev={progression:arenaSimCfg.progression,ratio:arenaSimCfg.ratio,build:arenaSimCfg.build};
  arenaSimCfg.progression=progression;arenaSimCfg.ratio=ratio;arenaSimCfg.build=build;
  let wins=0,losses=0,draws=0,totalT=0,totalHp=0,totalPower=0;
  for(let i=0;i<n;i++){const bot=arenaBotProfile(build);totalPower+=bot.power;const r=arenaDuel(player,bot);totalT+=r.time;totalHp+=r.hpPct;if(r.won)wins++;else if(r.lost)losses++;else draws++;}
  arenaSimCfg.progression=prev.progression;arenaSimCfg.ratio=prev.ratio;arenaSimCfg.build=prev.build;
  return {n,wins,losses,draws,winRate:wins/n*100,avgTime:totalT/n,avgHp:totalHp/n,avgBotPower:Math.round(totalPower/n)};
}
let arenaLiveResult = null;
let arenaLiveBot = null;
function arenaLiveBuildKey(){
  if(arenaSimCfg.build!=="random") return arenaSimCfg.build;
  const ks=["equilibre","dps","tank","crit","sustain","skills"];return ks[Math.floor(Math.random()*ks.length)];
}
function startArenaLiveFight(){
  if(arenaMatrixRun)return false;
  refreshDerived();
  const kind=arenaLiveBuildKey(),bot=arenaBotProfile(kind),wt=WEAPON_TYPES[bot.weapon]||WEAPON_TYPES.epee;
  const type={id:"arena_rival",name:"Rival",img:"hero",ranged:wt.attackType==="RANGED",proj:wt.projectile||"arrow"};
  const e=makeEnemy("campaign",{type,name:"Rival · "+(ARENA_BUILDS[kind]?.label||kind),tier:"COMMUN",floor:Math.max(1,S.floor),x:AW-52});
  e.hp=e.maxHP=Math.max(1,Math.floor(bot.maxHP));e.dmg=Math.max(1,Math.floor(bot.damage));e.boss=false;e.elite=false;e.ranged=type.ranged;e.arenaProfile=bot;e.arenaBotWeapon=bot.weapon;e.tint="#8FEFF4";
  arenaLiveBot=bot;arenaLiveResult=null;
  combat={ctx:"arenaLive",floor:S.floor,step:1,startAt:Date.now(),elite:false,boss:false,enemies:[e],pending:0,heroX:HERO_START,heroHP:D.maxHP,heroMaxHP:D.maxHP,heroAtkCd:.6,heroAttacking:0,heroHit:0,skillCds:{},skillCdMax:{},botSkillCds:{},buffs:{},debuffs:{},skillFxs:[],floats:[],projs:[],bg:"env_celestial",status:"fight",onEnd:(won)=>{
    arenaLiveResult={won,bot:arenaLiveBot,heroHp:combat?combat.heroHP:0};arenaLiveBot=null;startCampaign();scheduleRender();
  }};
  render();return true;
}
function abortArenaLive(){
  if(combat&&combat.ctx==="arenaLive")combat=null;arenaLiveBot=null;startCampaign();render();
}
function runArenaSimulation(){refreshDerived();const player=arenaPlayerProfile(),n=Math.max(1,Math.min(1000,parseInt(arenaSimCfg.count,10)||100));let wins=0,losses=0,draws=0,totalT=0,totalHp=0,totalPower=0;const kinds={};for(let i=0;i<n;i++){const bot=arenaBotProfile(arenaSimCfg.build);kinds[bot.kind]=(kinds[bot.kind]||0)+1;totalPower+=bot.power;const r=arenaDuel(player,bot);totalT+=r.time;totalHp+=r.hpPct;if(r.won)wins++;else if(r.lost)losses++;else draws++;}arenaSimResult={n,wins,losses,draws,winRate:wins/n*100,avgTime:totalT/n,avgHp:totalHp/n,avgBotPower:Math.round(totalPower/n),kinds,playerPower:arenaProfilePower(player)};render();}
function arenaMatrixAcc(){return{n:0,wins:0,losses:0,draws:0,totalT:0,totalHp:0,totalPower:0};}
function arenaMatrixAdd(acc,r,oppPower){acc.n++;acc.totalT+=r.time;acc.totalHp+=r.hpPct;acc.totalPower+=oppPower||0;if(r.won)acc.wins++;else if(r.lost)acc.losses++;else acc.draws++;}
function arenaMatrixFinish(acc){const n=Math.max(1,acc.n);return{n:acc.n,wins:acc.wins,losses:acc.losses,draws:acc.draws,winRate:acc.wins/n*100,avgTime:acc.totalT/n,avgHp:acc.totalHp/n,avgBotPower:Math.round(acc.totalPower/n)};}
function arenaNormalizeProfile(p,target){
  const now=Math.max(1,arenaProfilePower(p)),k=Math.max(.2,Math.min(5,target/now));
  p.maxHP=Math.max(1,Math.floor(p.maxHP*k));p.damage=Math.max(1,Math.floor(p.damage*k));p.power=arenaProfilePower(p);return p;
}
function arenaSyntheticMatchProfile(pg,kind,target){
  const prog=ARENA_PROGRESSION[pg]||ARENA_PROGRESSION.j7,p=arenaSyntheticBase(prog,kind);
  arenaNormalizeProfile(p,target);p.kind=kind;p.name=(ARENA_BUILDS[kind]?.label||kind)+' · '+prog.label;return p;
}
function arenaBotFor(pg,ratio,kind){
  const prev={progression:arenaSimCfg.progression,ratio:arenaSimCfg.ratio,build:arenaSimCfg.build};
  arenaSimCfg.progression=pg;arenaSimCfg.ratio=ratio;arenaSimCfg.build=kind;
  const bot=arenaBotProfile(kind);
  arenaSimCfg.progression=prev.progression;arenaSimCfg.ratio=prev.ratio;arenaSimCfg.build=prev.build;
  return bot;
}
function runArenaMatrix(){
  if(arenaMatrixRun)return;
  refreshDerived();
  const player=arenaPlayerProfile(),playerPower=arenaProfilePower(player),builds=["equilibre","dps","tank","crit","sustain","skills"],pg=arenaSimCfg.progression;
  const equal={},natural={},versus={};builds.forEach(k=>equal[k]=arenaMatrixAcc());
  Object.keys(ARENA_PROGRESSION).forEach(k=>{natural[k]={};builds.forEach(b=>natural[k][b]=arenaMatrixAcc());});
  builds.forEach(a=>{versus[a]={};builds.forEach(d=>versus[a][d]=arenaMatrixAcc());});
  const tasks=[];
  builds.forEach(k=>tasks.push({type:'equal',build:k,count:500,acc:equal[k]}));
  Object.keys(ARENA_PROGRESSION).forEach(pgx=>builds.forEach(k=>tasks.push({type:'natural',pg:pgx,build:k,count:375,acc:natural[pgx][k]})));
  builds.forEach(a=>builds.forEach(d=>tasks.push({type:'versus',att:a,def:d,count:500,acc:versus[a][d]})));
  arenaMatrixRun={player,playerPower,builds,progression:pg,equal,natural,versus,tasks,taskIndex:0,taskDone:0,done:0,total:30000,cancelled:false,lastPaint:0};
  arenaMatrixProgress={done:0,total:30000,pct:0,label:'Préparation de la matrice…'};arenaMatrixResult=null;render();
  setTimeout(arenaMatrixStep,0);
}
function arenaMatrixStep(){
  const run=arenaMatrixRun;if(!run)return;
  if(run.cancelled){arenaMatrixRun=null;arenaMatrixProgress=null;render();return;}
  const started=performance.now();let processed=0;
  while(run.taskIndex<run.tasks.length && processed<150 && performance.now()-started<14){
    const t=run.tasks[run.taskIndex];let r,oppPower=0;
    if(t.type==='equal'){
      const bot=arenaBotFor(run.progression,100,t.build);r=arenaDuel(run.player,bot);oppPower=bot.power;
    }else if(t.type==='natural'){
      const bot=arenaBotFor(t.pg,'natural',t.build);r=arenaDuel(run.player,bot);oppPower=bot.power;
    }else{
      const att=arenaSyntheticMatchProfile(run.progression,t.att,run.playerPower),def=arenaSyntheticMatchProfile(run.progression,t.def,run.playerPower);
      r=arenaDuel(att,def);oppPower=def.power;
    }
    arenaMatrixAdd(t.acc,r,oppPower);t.count--;run.done++;run.taskDone++;processed++;
    if(t.count<=0){run.taskIndex++;run.taskDone=0;}
  }
  const pct=Math.min(100,run.done/run.total*100),task=run.tasks[run.taskIndex];
  let label='Finalisation…';if(task){if(task.type==='versus')label=(ARENA_BUILDS[task.att]?.label||task.att)+' vs '+(ARENA_BUILDS[task.def]?.label||task.def);else if(task.type==='natural')label=(ARENA_PROGRESSION[task.pg]?.label||task.pg)+' · '+(ARENA_BUILDS[task.build]?.label||task.build);else label='100 % · '+(ARENA_BUILDS[task.build]?.label||task.build);}
  arenaMatrixProgress={done:run.done,total:run.total,pct,label};
  if(run.taskIndex>=run.tasks.length){
    const finEqual={},finNatural={},finVersus={};run.builds.forEach(k=>finEqual[k]=arenaMatrixFinish(run.equal[k]));
    Object.keys(ARENA_PROGRESSION).forEach(pgx=>{finNatural[pgx]={};run.builds.forEach(k=>finNatural[pgx][k]=arenaMatrixFinish(run.natural[pgx][k]));});
    run.builds.forEach(a=>{finVersus[a]={};run.builds.forEach(d=>finVersus[a][d]=arenaMatrixFinish(run.versus[a][d]));});
    arenaMatrixResult={equalN:500,naturalN:375,versusN:500,total:run.total,equal:finEqual,natural:finNatural,versus:finVersus,playerPower:run.playerPower,progression:run.progression};
    arenaMatrixRun=null;arenaMatrixProgress=null;render();return;
  }
  if(run.done-run.lastPaint>=750){run.lastPaint=run.done;render();}
  setTimeout(arenaMatrixStep,0);
}
function cancelArenaMatrix(){if(arenaMatrixRun){arenaMatrixRun.cancelled=true;arenaMatrixProgress={...arenaMatrixProgress,label:'Annulation…'};}}
function scrArenaSim(){
  if(combat&&combat.ctx==="arenaLive"){
    const ae=combat.enemies.find(e=>e.arenaProfile),ap=ae&&ae.arenaProfile;
    return topbar("Arène",'<span class="pill" style="color:#57E07A;border-color:#3FB950">COMBAT RÉEL</span>')+'<div id="arenaSlot"></div>'+combatBarHTML()+'<div class="pad mt6"><div class="card"><div class="between"><div><div class="b">'+esc(ae?ae.name:"Rival")+'</div><div class="dim tiny mt2">'+(ap?esc((ARENA_BUILDS[ap.kind]?.label||ap.kind)+' · '+ap.source+' · '+fmt(ap.power||arenaProfilePower(ap))+' puissance'):'Adversaire de test')+'</div></div><button class="btn dark" data-act="arenaLiveAbort">Abandonner</button></div></div></div>';
  }
  const prog=ARENA_PROGRESSION[arenaSimCfg.progression]||ARENA_PROGRESSION.j7;
  const builds=["equilibre","dps","tank","crit","sustain","skills"];
  const seg=(items,act,current)=>'<div class="seg" style="flex-wrap:wrap">'+items.map(x=>'<span class="'+(String(current)===String(x[0])?'on':'')+'" data-act="'+act+'" data-arg="'+x[0]+'">'+x[1]+'</span>').join('')+'</div>';
  let result='';if(arenaSimResult){const r=arenaSimResult,wr=r.winRate,col=wr>=55?'#57E07A':wr>=45?'#F5C542':'#FF6B6B',mix=Object.entries(r.kinds).map(([k,n])=>(ARENA_BUILDS[k]?.label||k)+' '+n).join(' · ');result='<div class="card mt8" style="border-color:'+col+'66"><div class="between"><div><div class="dim tiny">RÉSULTAT · '+r.n+' COMBATS</div><div class="big b" style="color:'+col+'">'+wr.toFixed(1)+'% victoires</div></div><div class="right"><div class="b">'+r.wins+' V</div><div class="dim tiny">'+r.losses+' D · '+r.draws+' N</div></div></div><div class="duo mt8"><div class="kv"><span>Combat moyen</span><b>'+r.avgTime.toFixed(1)+' s</b></div><div class="kv"><span>PV restants</span><b>'+r.avgHp.toFixed(1)+'%</b></div><div class="kv"><span>Puissance héros</span><b>'+fmt(r.playerPower)+'</b></div><div class="kv"><span>Puissance bots</span><b>'+fmt(r.avgBotPower)+'</b></div></div><div class="dim tiny mt8">Population : '+esc(mix)+'</div></div>';}
  let progress='';if(arenaMatrixProgress){const q=arenaMatrixProgress;progress='<div class="card mt8" style="border-color:#3F8FA077"><div class="between"><div><div class="b">Analyse en cours</div><div class="dim tiny mt2">'+esc(q.label)+'</div></div><b>'+q.pct.toFixed(0)+'%</b></div><div style="height:8px;background:#ffffff12;border-radius:999px;overflow:hidden;margin-top:10px"><div style="height:100%;width:'+q.pct.toFixed(2)+'%;background:#8FEFF4"></div></div><div class="between mt6"><span class="dim tiny">'+fmt(q.done)+' / '+fmt(q.total)+' combats</span><span class="dim tiny">Calcul par petits lots pour éviter de bloquer le mobile</span></div><button class="btn mt8" style="width:100%" data-act="arenaMatrixCancel">Annuler l’analyse</button></div>';}
  let matrix='';if(arenaMatrixResult){const m=arenaMatrixResult;const ccol=v=>v>=55?'#57E07A':v>=45?'#F5C542':'#FF6B6B';const cell=r=>'<td style="padding:6px;text-align:center;color:'+ccol(r.winRate)+'"><b>'+r.winRate.toFixed(0)+'%</b></td>';
    const equalRows=builds.map(k=>'<tr><td style="padding:6px"><b>'+ARENA_BUILDS[k].label+'</b></td>'+cell(m.equal[k])+'</tr>').join('');
    const naturalRows=Object.keys(ARENA_PROGRESSION).map(pgx=>'<tr><td style="padding:6px;white-space:nowrap"><b>'+ARENA_PROGRESSION[pgx].label+'</b></td>'+builds.map(k=>cell(m.natural[pgx][k])).join('')+'</tr>').join('');
    const versusRows=builds.map(a=>'<tr><td style="padding:6px;white-space:nowrap"><b>'+ARENA_BUILDS[a].label+'</b></td>'+builds.map(d=>cell(m.versus[a][d])).join('')+'</tr>').join('');
    matrix='<div class="card mt8"><div class="b">Analyse complète · '+fmt(m.total)+' combats</div><div class="dim tiny mt4">Calcul asynchrone par lots · aucun impact sur ta sauvegarde.</div><div class="sect mt12">Ton héros · 100 % Puissance</div><div style="overflow:auto"><table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:6px">Build bot</th><th style="padding:6px">Tes victoires</th></tr>'+equalRows+'</table></div><div class="sect mt12">Progression naturelle détaillée</div><div style="overflow:auto"><table style="min-width:650px;width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:6px">Profil</th>'+builds.map(k=>'<th style="padding:6px">'+ARENA_BUILDS[k].label+'</th>').join('')+'</tr>'+naturalRows+'</table></div><div class="sect mt12">Matrice 6×6 · archétypes</div><div class="dim tiny mt2">Ligne = attaquant · colonne = défenseur · tous normalisés au même benchmark de Puissance ('+fmt(m.playerPower)+').</div><div style="overflow:auto" class="mt6"><table style="min-width:650px;width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:6px">Att. ↓ / Déf. →</th>'+builds.map(k=>'<th style="padding:6px">'+ARENA_BUILDS[k].label+'</th>').join('')+'</tr>'+versusRows+'</table></div><div class="dim tiny mt8">Lecture : ~50 % indique un matchup proche. Une ligne très souvent au-dessus de 55 % signale un archétype potentiellement dominant ; une colonne très souvent sous 45 % signale un défenseur particulièrement difficile à battre.</div></div>';}
  const natural=arenaSimCfg.ratio==="natural",busy=!!arenaMatrixRun;
  return topbar("Arène",'<span class="pill" style="color:#8FEFF4;border-color:#3F8FA0">ARÈNE V4</span>')+'<div class="pad"><div class="card" style="border-color:#3F8FA055"><div class="b">Laboratoire PvP</div><div class="dim small mt4" style="line-height:1.45">Les bots utilisent une progression synthétique indépendante : Forge, raretés, affixes, Rebirth, Arbre, familiers et niveaux de Compétences. J1/J7/J30/J90 restent des hypothèses tant que nous n’avons pas de télémétrie réelle.</div></div><div class="sect mt12">Progression simulée</div>'+seg(Object.entries(ARENA_PROGRESSION).map(([k,v])=>[k,v.label]),'arenaProg',arenaSimCfg.progression)+'<div class="dim tiny mt4">'+prog.label+' · Forge '+prog.forge+' · familier '+RARITY[prog.petRarity].label+' niv.'+prog.petLevel+' · compétences niv.~'+prog.skillLevel+' · '+prog.crafts+' tirages/slot.</div><div class="sect mt12">Matchmaking de test</div>'+seg([['natural','Naturel'],[50,'50%'],[75,'75%'],[100,'100%'],[125,'125%'],[150,'150%'],[200,'200%']],'arenaRatio',arenaSimCfg.ratio)+'<div class="dim tiny mt4">'+(natural?'Naturel : aucune normalisation sur ta Puissance. Le bot conserve la puissance produite par sa progression J1/J7/J30/J90.':'Pourcentage : la population est normalisée vers ta Puissance afin d’isoler l’efficacité des builds à puissance comparable.')+'</div><div class="sect mt12">Type de build</div>'+seg(Object.entries(ARENA_BUILDS).map(([k,v])=>[k,v.label]),'arenaBuild',arenaSimCfg.build)+'<div class="sect mt12">Nombre de combats</div>'+seg([[1,'1'],[100,'100'],[1000,'1 000']],'arenaCount',arenaSimCfg.count)+(arenaLiveResult?'<div class="card mt8" style="border-color:'+(arenaLiveResult.won?'#3FB950':'#E5484D')+'66"><div class="b" style="color:'+(arenaLiveResult.won?'#57E07A':'#FF6B72')+'">'+(arenaLiveResult.won?'Victoire en duel':'Défaite en duel')+'</div><div class="dim tiny mt2">Dernier combat réel contre '+esc(arenaLiveResult.bot?.name||'un bot')+'. Aucun gain ni perte.</div></div>':'')+'<button class="btn green mt12" style="width:100%" data-act="arenaLiveStart" '+(busy?'disabled':'')+'>'+ic('swords',14)+' Lancer un combat réel</button><button class="btn blue mt8" style="width:100%" data-act="arenaRun" '+(busy?'disabled':'')+'>Simuler '+fmt(arenaSimCfg.count)+' combat'+(arenaSimCfg.count>1?'s':'')+'</button><button class="btn mt8" style="width:100%" data-act="arenaMatrix" '+(busy?'disabled':'')+'>Analyser le méta · 30 000 combats</button>'+progress+result+matrix+'<div class="card mt8"><div class="dim tiny" style="line-height:1.5"><b style="color:var(--text)">V4 :</b> le duel temps réel utilise le moteur de combat visible ; la grande analyse s’exécute désormais par petits lots pour préserver la fluidité mobile. Elle inclut une vraie matrice 6×6 entre archétypes, plus le détail J1/J7/J30/J90.</div></div></div>';
}

function scrHub(title, entries) {
  const cards = entries.map((e) => '<div class="card mt8" data-act="go" data-arg="'+e.go+'" style="cursor:pointer">' +
    '<div class="row gap10"><div class="imini">'+ic(e.icon,18)+'</div><div class="flex1"><div class="b">'+e.label+'</div>' +
    '<div class="dim tiny mt2">'+e.desc+'</div></div>'+ic("chevron",12)+'</div></div>').join("");
  return topbar(title, "") + '<div class="pad">'+cards+'</div>';
}
function scrDeveloppement(){ return scrHub("Développement", [
  {label:"Compétences",icon:"book",go:"competences",desc:"Invocation, équipement et amélioration des compétences."},
  {label:"Familiers",icon:"paw",go:"familiers",desc:"Œufs, éclosion et progression des familiers."},
  {label:"Arbre personnel",icon:"tree",go:"arbre",desc:"Bonus permanents et recherches."}
]); }
function scrDefis(){ return scrHub("Défis", [
  {label:"Arène",icon:"swords",go:"arena",desc:"Affronte des bots en temps réel ou analyse des milliers de combats sans récompense."},
  {label:"Raids",icon:"flame",go:"raid",desc:"Raids spécialisés et ressources ciblées."},
  {label:"Méga-Boss",icon:"skull",go:"mega",desc:"Combats majeurs et récompenses de progression."},
  {label:"Sanctuaire",icon:"flame",go:"sanctuaire",desc:"Fusion de ressources et recettes découvertes."}
]); }
function scrProgression(){ return scrHub("Progression", [
  {label:"Rebirth",icon:"cycle",go:"rebirth",desc:"Réinitialisation stratégique contre des PR permanents."},
  {label:"Ascension",icon:"star",go:"ascension",desc:"Progression de haut niveau et étoiles d'Ascension."}
]); }

/* =========================================================================
   RENDER
   ========================================================================= */
const SCREENS = {
  heros: scrHerosStats,
  accueil: scrAccueil, personnage: scrEquipement, equipement: scrEquipement,
  inventaire: scrEquipement, competences: scrCompetences, familiers: scrFamiliers,
  raid: scrRaid, mega: scrMegaRaid, sanctuaire: scrSanctuaire, arena: scrArenaSim, arbre: scrArbre, rebirth: scrRebirth, ascension: scrAscension,
  boutique: scrBoutique, evenement: scrEvenement, classement: scrClassement,
  developpement: scrDeveloppement, defis: scrDefis, progression: scrProgression,
  parametres: scrParametres,
  chat: () => scrServerOnly("Chat", [["GET /api/chat?channel=world", "messages monde"],
    ["GET /api/chat?channel=clan", "messages du clan"], ["POST /api/chat", "envoyer"],
    ["POST /api/chat/report", "signaler"]],
    "Le chat Monde et Clan fonctionne par sondage HTTP contre le backend, avec blocage, signalement et anti-spam."),
  clan: () => scrServerOnly("Clan", [["GET /api/clans", "liste des clans"], ["POST /api/clans", "créer"],
    ["POST /api/clans/join", "rejoindre"], ["POST /api/clans/leave", "quitter"],
    ["POST /api/clans/war", "points de guerre"]],
    "Les clans (création, adhésion, points de guerre issus du Rebirth) sont stockés côté serveur dans MongoDB."),
};

/* ---- level-up celebration (sheet §14) ---- */
let seenLevel = null;
function showLevelUp(from, to) {
  const gained = to - from;
  const row = (label, val, col) => '<div class="kv"><span class="dim">' + label +
    '</span><b style="color:' + col + '">' + val + "</b></div>";
  openModal('<div class="center" style="position:relative;margin-bottom:10px">' +
      '<svg width="190" height="98" viewBox="0 0 190 98" style="display:inline-block">' +
        '<defs><linearGradient id="lvW" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#FFF0CB"/><stop offset="1" stop-color="#D89C2C"/></linearGradient></defs>' +
        '<g fill="url(#lvW)">' +
          '<path d="M63 46q-16-13-34-14 7 6 10 11-9-2-16 1 9 3 14 9-7 1-12 5 14 1 24-2 8-2 14-5Z"/>' +
          '<path d="M127 46q16-13 34-14-7 6-10 11 9-2 16 1-9 3-14 9 7 1 12 5-14 1-24-2-8-2-14-5Z"/>' +
        '</g>' +
        '<g opacity="0.5" fill="#8A6522">' +
          '<path d="M65 56q-14-6-28-6 8 4 12 8 12 1 16-2Zm60 0q14-6 28-6-8 4-12 8-12 1-16-2Z"/></g>' +
        '<circle cx="95" cy="49" r="41" fill="#42300D"/>' +
        '<circle cx="95" cy="49" r="37" fill="none" stroke="url(#lvW)" stroke-width="4"/>' +
        '<circle cx="95" cy="49" r="31" fill="#0E1726" stroke="#8A6522" stroke-width="1.5"/>' +
        '<path d="M95 4 99 12h-8Z" fill="url(#lvW)"/>' +
        '<text x="95" y="61" text-anchor="middle" font-size="30" font-weight="900" ' +
          'font-family="Georgia,serif" fill="#FBDD8C">' + to + '</text></svg></div>' +
    '<div class="card" style="padding:9px 11px">' +
      row("Niveaux gagnés", "+" + gained, "var(--goldLit)") +
      row("Points de statistiques", "+" + gained * RULES.STAT_POINTS_PER_LEVEL, "var(--greenLit)") +
    "</div>" +
    (to >= RULES.MAX_LEVEL ? '<div class="notice mt10 center"><b class="gt">Épreuve d\'Ascension débloquée</b></div>' : "") +
    '<div class="mt10">' + btn("OK", { cls: "green", act: "closeModal" }) + "</div>",
    "Niveau supérieur !");
}
/* a first-Boss-clear accelerator is announced as soon as the fight settles */
function checkNotable() {
  if (!notable) return;
  const n = notable; notable = null;
  toast(n.msg, true, null, n.icon);
}
function rewardPop(title, sub, boss, action, arg, ttl, kind) {
  let feed = document.getElementById("rewardFeed");
  if (!feed) {
    feed = document.createElement("div");
    feed.id = "rewardFeed";
    document.getElementById("app").appendChild(feed);
  }
  const el = document.createElement("div");
  el.className = "rewardPop" + (boss ? " boss" : "") + (kind ? " " + kind : "") + (action ? " clickable" : "");
  el.innerHTML = '<div class="rpT">' + esc(title) + '</div>' + (sub ? '<div class="rpS">' + esc(sub) + '</div>' : "");
  if (action) {
    el.addEventListener("click", () => {
      const fn = ACT[action];
      if (fn) fn(arg);
      if (el.parentNode) el.remove();
    });
  }
  feed.prepend(el);
  while (feed.children.length > 5) feed.lastElementChild.remove();
  setTimeout(() => { if (el && el.parentNode) el.remove(); }, ttl || (boss ? 5200 : 3800));
}
function checkBossReward() {
  if (!bossReward) return;
  const r = bossReward; bossReward = null;
  const def = ACCEL_DEFS.find((a) => a.key === r.key);
  rewardPop("★ Récompense de Boss " + r.floor,
    "+" + r.qty + " Accélérateur " + (def ? def.label : ""), true);
}
function checkRewardNotice() {
  if (!rewardNotice) return;
  const r = rewardNotice; rewardNotice = null;
  // Chaque ressource gagnée a sa propre information.
  if (r.gold > 0) rewardPop((r.boss ? "★ " : "") + "Or obtenu", "+" + fmt(r.gold) + " Or", !!r.boss, null, null, null, "gold");
  if (r.exp > 0) rewardPop((r.boss ? "★ " : "") + "EXP obtenue", "+" + fmt(r.exp) + " EXP", !!r.boss, null, null, null, "exp");
}
function checkSkipNotice() {
  if (!skipNotice) return;
  const r = skipNotice; skipNotice = null;
  rewardPop("Saut d'étage · Étage " + r.floor,
    "+" + fmt(r.gold) + " Or · +" + fmt(r.exp) + " EXP conservés", false);
}
function showEggFinished(id) {
  const e = S.eggs.find((x) => x.id === id);
  if (!e || !eggIsHatching(e) || e.hatchEnd > Date.now()) return;
  const el = petElement(e);
  openModal(
    '<div class="center">' + (ASSETS["egg_" + String(e.rarity).toLowerCase()]
      ? '<img src="' + ASSETS["egg_" + String(e.rarity).toLowerCase()] + '" style="width:72px;height:72px;object-fit:contain">'
      : ic("egg", 54)) + '</div>' +
    '<div class="center mt6">' + rtag(e.rarity) + '</div>' +
    '<div class="card mt10" style="padding:9px 11px">' +
      '<div class="kv"><span class="dim">Rareté</span><b>' + esc(e.rarity) + '</b></div>' +
      '<div class="kv"><span class="dim">Espèce</span><b>' + esc(e.species || "Familier") + '</b></div>' +
      '<div class="kv"><span class="dim">Élément</span><b style="color:' + el.c + '">' + esc(el.label) + '</b></div>' +
    '</div>' +
    '<div class="col gap6 mt10">' +
      btn("Faire éclore", { cls:"green", act:"collectEggPopup", arg:id }) +
      btn("Plus tard", { cls:"dark", act:"closeModal" }) +
    '</div>',
    "Œuf prêt");
}
function showResearchFinished(id) {
  const node = TREE_BY_ID[id];
  if (!node) return;
  const lv = S.tree.active === id ? (S.tree.activeLevel || treeLv(S, id) + 1) : treeLv(S, id);
  const current = Math.max(0, lv - 1);
  openModal(
    '<div class="center">' + ic(node.icon, 38) + '</div>' +
    '<div class="bb center mt6" style="color:' + node.color + '">' + esc(node.label) + '</div>' +
    '<div class="notice mt10">La recherche est terminée. L’amélioration est prête à être récupérée.</div>' +
    '<div class="card mt10" style="padding:9px 11px">' +
      '<div class="kv"><span class="dim">Niveau terminé</span><b>' + lv + ' / ' + node.max + '</b></div>' +
      '<div class="kv"><span class="dim">Avant</span><b>' + treeEffectValue(node, current) + '</b></div>' +
      '<div class="kv"><span class="dim">Après</span><b style="color:var(--greenLit)">' + treeEffectValue(node, lv) + '</b></div>' +
      '<div class="kv"><span class="dim">Effet</span><b>' + esc(TREE_EFFECT_INFO[node.effect] || node.label) + '</b></div>' +
    '</div>' +
    '<div class="col gap6 mt10">' +
      btn("Récupérer l’amélioration", { cls:"green", act:"collectResearchPopup" }) +
      btn("Voir dans l’Arbre", { cls:"dark", act:"goTreeFromNotice", arg:id }) +
    '</div>',
    "Recherche terminée");
}
function checkTimerNotifications() {
  const now = Date.now();

  // Recherche de l'Arbre : notification cliquable -> popup complet au centre.
  if (S.tree.active && S.tree.activeEnd > 0 && S.tree.activeEnd <= now) {
    const id = S.tree.active;
    if (timerNoticeSeen.tree !== id) {
      timerNoticeSeen.tree = id;
      const node = TREE_BY_ID[id];
      rewardPop("Recherche terminée", node ? node.label : "Amélioration de l’Arbre prête",
        false, "researchFinished", id, 9000);
    }
  } else if (!S.tree.active) {
    timerNoticeSeen.tree = null;
  }

  // Chaque œuf terminé reçoit sa propre notification.
  const alive = {};
  S.eggs.forEach((e) => {
    if (!eggIsHatching(e)) return;
    alive[e.id] = true;
    if (e.hatchEnd <= now && !timerNoticeSeen.eggs[e.id]) {
      timerNoticeSeen.eggs[e.id] = true;
      rewardPop("Œuf prêt à éclore", e.rarity + " · " + (e.species || "Familier"),
        false, "eggFinished", e.id, 9000);
    }
  });
  Object.keys(timerNoticeSeen.eggs).forEach((id) => {
    if (!alive[id]) delete timerNoticeSeen.eggs[id];
  });
}

let tutorialCurrentKey = null;
let tutorialGuideTarget = null;

/* Guided tutorial flows. Grouped systems deliberately use two visual steps:
   first the parent hub on Combat, then the exact sub-feature inside that hub. */
const TUTORIAL_FLOWS = {
  competence: { parent: "developpement", parentLabel: "Développement", child: "competences", childLabel: "Compétences" },
  familier:   { parent: "developpement", parentLabel: "Développement", child: "familiers", childLabel: "Familiers" },
  tree:       { parent: "developpement", parentLabel: "Développement", child: "arbre", childLabel: "Arbre personnel" },
  raid:       { parent: "defis", parentLabel: "Défis", child: "raid", childLabel: "Raids" },
  megaBoss:   { parent: "defis", parentLabel: "Défis", child: "mega", childLabel: "Méga-Boss" },
  rebirth:    { parent: "progression", parentLabel: "Progression", child: "rebirth", childLabel: "Rebirth" }
};

function tutorialGuideInfo(key) {
  const flow = TUTORIAL_FLOWS[key];
  if (flow) {
    if (route === flow.parent) {
      return { selector: '[data-act="go"][data-arg="' + flow.child + '"]', next: flow.child, label: "Ouvrir " + flow.childLabel };
    }
    if (route === flow.child) return { selector: null, next: null, label: "Compris" };
    return { selector: '[data-act="go"][data-arg="' + flow.parent + '"]', next: flow.parent, label: "Ouvrir " + flow.parentLabel };
  }
  const direct = {
    combat: { selector: '#arenaSlot', next: null, label: "Compris" },
    equipement: route === "equipement"
      ? { selector: null, next: null, label: "Compris" }
      : { selector: '[data-act="go"][data-arg="equipement"]', next: "equipement", label: "Ouvrir Équipement" },
    forge: { selector: '[data-act="forge"][data-arg="1"]', next: null, label: "Compris" }
  };
  return direct[key] || { selector: null, next: null, label: "Compris" };
}
function clearTutorialGuide() {
  if (tutorialGuideTarget) tutorialGuideTarget.classList.remove('tutorialTarget');
  tutorialGuideTarget = null;
  const g = document.getElementById('tutorialGuide');
  if (g) g.remove();
}
function updateTutorialGuide() {
  clearTutorialGuide();
  if (!tutorialCurrentKey || !document.getElementById('tutorialCard')) return;
  const info = tutorialGuideInfo(tutorialCurrentKey);
  const cardBtn = document.querySelector('#tutorialCard [data-act="tutorialNext"]');
  if (cardBtn) cardBtn.textContent = info.label || "Compris";
  if (!info.selector) return;
  const target = document.querySelector(info.selector);
  if (!target) return;
  tutorialGuideTarget = target;
  target.classList.add('tutorialTarget');
  const r = target.getBoundingClientRect();
  const g = document.createElement('div');
  g.id = 'tutorialGuide';
  const above = r.top > 65;
  g.style.left = (r.left + r.width / 2 - 17) + 'px';
  g.style.top = (above ? r.top - 48 : r.bottom + 12) + 'px';
  g.innerHTML = '<div class="arrow' + (above ? '' : ' down') + '"></div>';
  document.body.appendChild(g);
}
function checkTutorial() {
  if (!S.tutorial || document.getElementById("tutorialCard")) return;
  // Start a new guided lesson from Combat so the first arrow always has a real
  // parent control to point at. Once started, the card follows the player into
  // the hub and then points at the exact child feature.
  if (route !== "accueil") return;
  const seen = S.tutorial.seen || (S.tutorial.seen = {});
  let key = null, title = null, sub = null;
  if (!seen.combat) { key="combat"; title="Combat automatique"; sub="Bats les ennemis pour monter les étages et gagner Or + EXP."; }
  else if (!seen.equipement && (S.inventory.length || SLOTS.some((k)=>S.equipped[k]))) { key="equipement"; title="Équipement"; sub="Ouvre Équipement : inventaire, pièces portées et statistiques sont réunis au même endroit. Utilise Tester pour comparer avant d’équiper."; }
  else if (!seen.competence && Object.keys(S.skills || {}).length) { key="competence"; title="Compétences"; sub="Suis les flèches : ouvre Développement, puis Compétences. Tu disposes de 3 emplacements actifs."; }
  else if (!seen.familier && ((S.pets||[]).length || (S.eggs||[]).length)) { key="familier"; title="Familiers"; sub="Suis les flèches : ouvre Développement, puis Familiers. Tes œufs sont stockés individuellement avec leur vraie rareté."; }
  else if (!seen.forge && S.minerai >= FORGE_CRAFT_COST) { key="forge"; title="Forge"; sub="Le Minerai fabrique l'équipement. L'Or améliore le niveau de Forge."; }
  else if (!seen.raid && S.level >= RULES.RAID_UNLOCK_LEVEL) { key="raid"; title="Raids"; sub="Suis les flèches : ouvre Défis, puis Raids pour utiliser tes clés et obtenir des ressources spécialisées."; }
  else if (!seen.rebirth && S.floor >= RULES.REBIRTH_UNLOCK_FLOOR) { key="rebirth"; title="Rebirth"; sub="Suis les flèches : ouvre Progression, puis Rebirth pour voir tes PR permanents et les conséquences de la renaissance."; }
  else if (!seen.megaBoss && megaRaidUnlocked(S)) { key="megaBoss"; title="Méga Boss"; sub="Suis les flèches : ouvre Défis, puis Méga-Boss. Chaque Méga reprend un ancien Boss avec une puissance fortement augmentée."; }
  else if (!seen.tree && (S.pe||0) > 0) { key="tree"; title="Arbre personnel"; sub="Suis les flèches : ouvre Développement, puis Arbre personnel. Les PE du Raid Évolution servent à améliorer ses nœuds."; }
  if (!key) return;
  tutorialCurrentKey = key;
  const el = document.createElement("div");
  el.id = "tutorialCard";
  el.innerHTML = '<div class="tt">TUTORIEL · ' + esc(title) + '</div><div class="ts">' + esc(sub) +
    '</div><div class="td"><button class="btn sm green" data-act="tutorialNext">Continuer</button></div>';
  document.getElementById("app").appendChild(el);
  requestAnimationFrame(updateTutorialGuide);
}
function tutorialNext() {
  if (!tutorialCurrentKey) return;
  const info = tutorialGuideInfo(tutorialCurrentKey);
  if (info.next) {
    nav(info.next);
    requestAnimationFrame(updateTutorialGuide);
    return;
  }
  dismissTutorial();
}
function dismissTutorial() {
  clearTutorialGuide();
  if (tutorialCurrentKey) {
    S.tutorial.seen[tutorialCurrentKey] = true;
    tutorialCurrentKey = null;
    saveNow();
  }
  const el = document.getElementById("tutorialCard");
  if (el) el.remove();
  setTimeout(checkTutorial, 120);
}

function checkLevelUp() {
  if (seenLevel === null) { seenLevel = S.level; return; }
  if (S.level > seenLevel) {
    const from = seenLevel;
    seenLevel = S.level;
    if (!document.getElementById("overlay")) showLevelUp(from, S.level);
  } else if (S.level < seenLevel) {
    seenLevel = S.level;   // rebirth / ascension reset the level
  }
}

function syncEquipPreviewSpacer() {
  const dock=document.querySelector('.equipTestDock'),spacer=document.querySelector('.equipPreviewSpacer');
  if(!dock||!spacer) return;
  const h=Math.ceil(dock.getBoundingClientRect().height);
  spacer.style.height=Math.max(90,h+72)+'px';
}

function render() {
  // Objective tracking belongs to the global state/render layer, not to Home.
  // This keeps progress coherent when goals are completed from Skills, Pets,
  // Raids, the Tree, etc. and the player has not returned Home yet.
  trackGoalProgress(S);
  renderHUD();
  renderTabs();
  checkRewardNotice();
  checkBossReward();
  checkNotable();
  checkSkipNotice();
  checkTutorial();
  checkLevelUp();
  const sc = document.getElementById("screen");
  const keep = sc.scrollTop;
  const fn = SCREENS[route] || scrAccueil;
  sc.className = (route === "accueil" || (route === "arena" && combat && combat.ctx === "arenaLive")) ? "fixed" : "";
  sc.innerHTML = fn();
  attachArena();
  sc.scrollTop = keep;
  requestAnimationFrame(syncEquipPreviewSpacer);
  if (tutorialCurrentKey) requestAnimationFrame(updateTutorialGuide);
}

function attachArena() {
  const slot = document.getElementById("arenaSlot");
  if (!slot) return;
  if (!arenaEl) {
    const el = document.createElement("div");
    el.id = "arena";
    mountArena(el);
  }
  slot.appendChild(arenaEl);
}

/* =========================================================================
   ACTIONS (delegated click handling)
   ========================================================================= */
function showForgeResult(res) {
  const rates = gateForgeRates(
    getRates("forge", S.forge.level, S.ascension, starsOf(S, "forge")), S.forge.level);
  /* The filter can melt part of a batch, or all of it. The window headlines the
     best piece actually kept; if nothing was kept there is no piece to show, so
     the melt is reported on its own. */
  const kept = res.filter((r) => !r.recycled);
  const melted = res.filter((r) => r.recycled);
  const dust = melted.reduce((a, r) => a + (r.dust || 0), 0);
  if (!kept.length) {
    toast(melted.length + " pièce" + (melted.length > 1 ? "s" : "") +
      " recyclée" + (melted.length > 1 ? "s" : "") + " · +" + fmt(dust) + " poussière", true);
    return;
  }
  const best = kept.reduce((a, b) => equipRank(b.rarity) > equipRank(a.rarity) ? b : a, kept[0]);
  const bc = RARITY[best.rarity].c;
  // eight sparks around the impact point
  const sparks = Array.from({ length: 8 }, (_, i) =>
    '<i style="transform:rotate(' + (i * 45) + 'deg) translateY(-19px)"></i>').join("");
  openModal('<div class="fgStage" style="--rc:' + bc + '">' +
      '<div class="fgPlate"></div>' +
      '<div class="fgRing"></div>' +
      '<div class="fgSpark">' + sparks + "</div>" +
      '<div class="fgHammer">' + ic("hammer", 25) + "</div>" +
      '<div class="fgItem">' + slotIcon(best.slot, 46, best) + "</div>" +
    "</div>" +
    '<div class="modalT" style="color:' + bc + ';text-shadow:0 2px 0 #000,0 0 18px ' + bc + '80">' +
      RARITY[best.rarity].label.toUpperCase() + " OBTENU</div>" +
    '<div class="mute tiny center b" style="letter-spacing:.5px;margin-top:2px">' +
      esc(SLOT_LABEL[best.slot] || best.slot) + " · " + fmt(best.power) + " puissance</div>" +
    // the batch fans in behind the reveal rather than all at once
    '<div class="resGrid">' + kept.map((r, i) =>
      '<div class="resItem rf fgCard" style="animation-delay:' + (0.5 + i * 0.06).toFixed(2) +
      "s;border-color:" + RARITY[r.rarity].c + ";--rc:" + RARITY[r.rarity].c + '">' +
      '<span style="position:relative;z-index:1">' + slotIcon(r.slot, 22, r) + "</span>" + rtag(r.rarity) + "</div>").join("") + "</div>" +
    '<div class="dim small center" style="margin-bottom:' + (melted.length ? "4px" : "10px") +
      '">Équipement ajouté à l\'Inventaire.</div>' +
    (melted.length
      ? '<div class="small center b" style="color:var(--purpleLit);margin-bottom:10px">' +
        ic("trash", 11) + " " + melted.length + " pièce" + (melted.length > 1 ? "s" : "") +
        " recyclée" + (melted.length > 1 ? "s" : "") + " par le filtre · +" + fmt(dust) +
        " poussière</div>"
      : "") +
    '<div class="mute tiny center b" style="letter-spacing:.6px">TAUX ACTUELS · FORGE NIV.' + S.forge.level + "</div>" +
    '<div class="row gap4 mt6" style="flex-wrap:wrap;justify-content:center;margin-bottom:12px">' +
      EQUIP_RARITY_ORDER.filter((r) => rates[r] >= 0.05).map((r) =>
        '<span class="pill" style="color:' + RARITY[r].c + '"><i class="rdot" style="background:' + RARITY[r].c +
        ';color:' + RARITY[r].c + '"></i>' + rates[r].toFixed(rates[r] < 10 ? 1 : 0) + "%</span>").join("") + "</div>" +
    btn("Continuer", { cls: "blue", act: "closeModal" }), "Forge réussie");
}

function showItemDetail(id, slot) {
  const it = id ? (Object.values(S.equipped).find((x) => x && x.id === id) || S.inventory.find((x) => x.id === id)) : null;
  if (!it) {
    openModal('<div class="center" style="margin-bottom:8px">' + slotIcon(slot, 34) + "</div>" +
      '<div class="dim small center" style="margin-bottom:12px">Emplacement vide. Forge de l\'équipement puis équipe-le depuis l\'Inventaire.</div>' +
      btn("Ouvrir Équipement", { cls: "blue", act: "goModal", arg: "equipement" }) +
      '<div class="mt6">' + btn("Fermer", { cls: "ghost", act: "closeModal" }) + "</div>",
      SLOT_LABEL[slot]);
    return;
  }
  const cost = itemUpgradeCost(it);
  const equipped = Object.values(S.equipped).some((x) => x && x.id === it.id);
  const rc = RARITY[it.rarity].c;
  const wt = it.weaponType ? WEAPON_TYPES[it.weaponType] : null;
  // stat line, styled like the sheet's item tooltip (§11)
  const st = (label, val, col) => '<div class="kv"><span class="dim" style="letter-spacing:.4px">' + label +
    '</span><b style="color:' + (col || "var(--text)") + '">' + val + "</b></div>";
  const equipStat = fmtEquipStat;
  const upgradePreview = itemUpgradePreview(it);
  const isWeaponStat = !!it.baseDamage;
  const basePrimary = Number(isWeaponStat ? (it.baseDamage || it.damage || 0) : (it.baseHp || it.hp || 0));
  const currentPrimary = Number(isWeaponStat ? (it.damage || 0) : (it.hp || 0));
  const addedPrimary = Math.max(0, currentPrimary - basePrimary);
  openModal('<div class="row gap10" style="margin-bottom:10px">' +
      '<div class="imini rf" style="width:46px;height:46px;border-color:' + rc + ";--rc:" + rc + '">' +
      '<span style="position:relative;z-index:1">' + slotIcon(it.slot, 27, it) + "</span></div>" +
      '<div class="flex1"><div class="bb" style="font-size:14px;color:' + rc + ';text-shadow:0 0 12px ' + rc + '66">' +
      esc(it.name) + (it.level ? ' <span style="color:var(--goldLit)">+' + it.level + "</span>" : "") + "</div>" +
      '<div class="mt6">' + rtag(it.rarity) + '<span class="pill" style="margin-left:5px">' + SLOT_LABEL[it.slot] + "</span></div></div></div>" +
    '<div class="card" style="padding:9px 11px">' +
      (MASTERY_STAT[it.slot] === "dmg"
        ? st("ATTAQUE DE BASE", "+" + equipStat(basePrimary), "#FF9C6B")
        : st("SANTÉ DE BASE", "+" + equipStat(basePrimary), "var(--redLit)")) +
      st(it.baseDamage ? "BONUS D'ATTAQUE" : "BONUS DE SANTÉ", "+" + equipStat(addedPrimary), "var(--greenLit)") +
      st("PUISSANCE TOTALE", equipStat(it.power), "var(--goldLit)") +
      (wt ? st("TYPE D'ARME", wt.name + " · " + (wt.attackType === "MELEE" ? "mêlée" : "distance"), "var(--blueLit)") +
        st("PORTÉE · VITESSE", wt.range + " · ×" + wt.speed, "var(--blueLit)") : "") +
    "</div>" +
    (it.affixes && it.affixes.length
      ? '<div class="orn"><i></i><b></b><i></i></div>' +
        '<div class="mute tiny b" style="letter-spacing:.6px;margin-bottom:5px">BONUS DE STATS</div>' +
        it.affixes.map((a) => {
          const def = AFFIX_BY_KEY[a.key]; if (!def) return "";
          const col = affixColor(a);
          return '<div class="row gap8" style="padding:4px 0">' +
            '<div class="imini" style="width:24px;height:24px;border-color:' + col + '80">' + ic(def.icon, 14) + "</div>" +
            '<span class="flex1 small b">' + def.label + "</span>" +
            '<b class="small" style="color:' + col + '">' + (def.negative ? "-" : "+") + a.value + "%</b>" +
            '<span class="mute tiny">/' + def.cap + "</span></div>";
        }).join("") +
        '<div class="mute tiny mt6">Ces bonus sont fixés à la création et ne changent jamais avec la Poussière.</div>'
      : "") +
    '<div class="orn"><i></i><b></b><i></i></div>' +
    (itemUpgradeChance(it)<100 ? (function(){
      const base=itemUpgradeChance(it), planned=itemSealCount(it.id), owned=(S.sanctuary&&S.sanctuary.stabilitySeals)||0;
      const used=Math.min(planned,owned,Math.ceil((100-base)/5)), chance=Math.min(100,base+used*5);
      return '<div class="card" style="padding:8px 9px;border-color:#9B5CF666"><div class="between"><div><div class="b small">CHANCE DE RÉUSSITE</div><div class="mute tiny">À partir de +100 · échec = niveau conservé</div></div><b style="color:'+(chance>=90?'#57C785':chance>=70?'#F5C542':'#FF7A3D')+'">'+chance+'%</b></div>'+meter(chance,'#9B5CF6')+
        '<div class="between mt6"><span class="tiny b">🛡️ Sceaux de stabilité · '+owned+'</span><div class="row gap4">'+
        btn('−',{cls:'dark',small:true,act:'itemSealMinus',arg:it.id,dis:used<=0,style:'width:34px'})+
        '<span class="pill">'+used+' utilisé'+(used>1?'s':'')+' · +'+(used*5)+'%</span>'+ 
        btn('+',{cls:'purple',small:true,act:'itemSealPlus',arg:it.id,dis:used>=owned||chance>=100,style:'width:34px'})+'</div></div></div>';
    })() : '<div class="notice tiny"><b>Réussite garantie à 100 %</b> jusqu’au niveau +100.</div>') +
    '<div class="orn"><i></i><b></b><i></i></div>' +
    '<div class="card" style="padding:8px 9px;border-color:#3FA7FF66">' +
      '<div class="between"><div><div class="mute tiny b">PROCHAINE AMÉLIORATION</div><div class="b small mt4">' + upgradePreview.label + ' · ' + equipStat(upgradePreview.current) + ' → <span style="color:#78B7FF">' + equipStat(upgradePreview.next) + '</span></div></div>' +
      '<span class="pill" style="color:var(--greenLit);border-color:#3FB95066">+' + equipStat(upgradePreview.gain) + '</span></div>' +
    '</div>' +
    '<div class="orn"><i></i><b></b><i></i></div>' +
    '<div class="row between" style="font-size:10.5px;font-weight:800">' +
      '<span class="mute">COÛT D\'AMÉLIORATION</span>' +
      '<span class="row gap4" style="color:' + (S.poussiere >= cost ? "#C79BFF" : "var(--textMute)") + '">' +
      ic("poussiere", 12) + fmt(cost) + " / " + fmt(S.poussiere) + "</span></div>" +
    '<div class="mt6">' + meter(Math.min(100, (S.poussiere / cost) * 100), "#9B5CF6") + "</div>" +
    '<div class="col gap6 mt10">' +
      btn(ic("sparkle", 14) + "Améliorer", { cls: "blue", small: true, act: "upgradeItem", arg: it.id, dis: S.poussiere < cost }) +
      '<div class="row gap6">' +
      (equipped ? btn("Démonter", { cls: "ghost", small: true, act: "unequip", arg: it.slot })
                : btn("Équiper", { cls: "green", small: true, act: "equip", arg: it.id })) +
      btn("Fermer", { cls: "dark", small: true, act: "closeModal" }) + "</div>" +
    "</div>", "Détail de l'objet");
}

/* plain-language description of what each tree effect actually does */
const TREE_EFFECT_INFO = {
  minerai:     "Minerais obtenus (Forge et Raid Minerai)",
  essence:     "Essence animale obtenue",
  skillPts:    "Éclats de Compétence obtenus",
  dust:        "Poussière obtenue au recyclage",
  raidMinerai: "Minerais gagnés spécifiquement au Raid Minerai",
  research:    "Réduit la durée des recherches de l’Arbre",
  forgeTime:   "Réduit le temps d’amélioration de la Forge",
  forgeCost:   "Réduit le coût en Or des améliorations de Forge",
  forgeFree:   "Chance de forger un équipement supplémentaire gratuitement",
  forgeMulti:  "Augmente le nombre de forges lancées en une fois",
  forgeMult:   "Pousse le multiplicateur de Forge au-delà de ×5, jusqu’à ×10",
  hatch_COMMUN: "Réduit le temps d'éclosion des Œufs Communs uniquement",
  hatch_PEU_COMMUN: "Réduit le temps d'éclosion des Œufs Peu communs uniquement",
  hatch_RARE: "Réduit le temps d'éclosion des Œufs Rares uniquement",
  hatch_EPIQUE: "Réduit le temps d'éclosion des Œufs Épiques uniquement",
  hatch_MYTHIQUE: "Réduit le temps d'éclosion des Œufs Mythiques uniquement",
  hatch_LEGENDAIRE: "Réduit le temps d'éclosion des Œufs Légendaires uniquement",
  petDmg:      "Dégâts apportés par le Familier actif",
  eggFree:     "Chance d’obtenir un Œuf supplémentaire gratuitement",
  eggSlot:     "Ajoute un emplacement d’éclosion permanent",
  skillTime:   "Réduit les temps liés aux améliorations de Compétences",
  skillDmg:    "Dégâts infligés par les Compétences",
  skillFree:   "Chance de double invocation de Compétence",
  accel:       "Efficacité des Accélérateurs sur tous les minuteurs",
  afk:         "Durée maximale d'accumulation de la Récolte automatique",
  harvestEff:  "Quantité de ressources produites par la Récolte automatique",
  mast_arme:       "Dégâts apportés par ton Arme",
  mast_gants:      "Dégâts apportés par tes Gants",
  mast_collier:  "Dégâts apportés par ton Collier",
  mast_anneau:   "Dégâts apportés par ton Anneau",
  mast_ceinture: "Santé apportée par ta Ceinture",
  mast_casque:     "Santé apportée par ton Casque",
  mast_armure:     "Santé apportée par ton Armure",
  mast_bottes:     "Santé apportée par tes Chaussures",
  raidKey:     "+1 clé quotidienne, à attribuer au Raid de ton choix",
};
/* format one level's worth of this node's effect */
/* Cost families carry a negative `per` (-5% total means per = -1), so the old
   unconditional sign prefix printed "--2%". A value that is already signed
   prints itself; only the families whose number is positive but means a
   reduction still need the minus put in front. */
function treeEffectValue(node, level) {
  const v = node.per * level;
  if (node.unit === "×") return "×" + (RULES.FORGE_BATCH_BASE + v);
  if (node.unit === "") return level > 0 ? "Actif" : "—";
  const r = Math.round(v * 10) / 10;
  /* The sign comes from the number itself and nothing else. The three cost
     families carry a negative `per` and read as -5%; everything else is a gain
     and reads as +. Speed families are written +20% and +50% in the list, so
     they must show that way -- section 12 is explicit that none of these are
     ever to be presented as a penalty, even though the engine spends them as
     time cuts. */
  if (node.unit === "h") return (r < 0 ? "" : "+") + r + " h";
  return (r < 0 ? "" : "+") + r + node.unit;
}

/* Inspection popup — opens for EVERY node, bought or not, so the player can
   always see what a node does before spending anything on it. */
function showTreeNode(id) {
  const node = TREE_BY_ID[id];
  if (!node) return;
  const lv = treeLv(S, id);
  const maxed = lv >= node.max;
  const busy = S.tree.active === id;
  const otherBusy = !!S.tree.active && !busy;
  const reqOk = treeReqOk(S, node);
  const price = maxed ? null : treeNextCost(S, node);
  const afford = maxed ? false : treeAfford(S, node);
  const dur = maxed ? 0 : treeTime(S, node, lv + 1);
  const col = node.color;

  const missing = node.req.filter((r) => treeLv(S, r) < 1)
    .map((r) => (TREE_BY_ID[r] || {}).label || r);
  const reqNames = node.req.map((r) => {
    const q = TREE_BY_ID[r];
    const ok = treeLv(S, r) >= 1;
    return '<span class="row gap4 tiny b" style="color:' + (ok ? "var(--greenLit)" : "var(--textMute)") + '">' +
      ic(ok ? "check" : "lock", 10) + esc(q ? q.label : r) + " ≥ 1</span>";
  }).join("");

  // headline: what you have now, and what the next level makes it
  const nowTxt = treeEffectValue(node, lv);
  const nextTxt = maxed ? nowTxt : treeEffectValue(node, lv + 1);
  const branchTotal = treeSum(S, node.effect);

  let action, note = "";
  if (maxed) {
    action = btn("Niveau maximum", { cls: "ghost", small: true, dis: true });
    note = "Ce bonus est entièrement débloqué.";
  } else if (busy) {
    action = btn("Recherche en cours", { cls: "ghost", small: true, dis: true });
    note = "Termine ou accélère cette recherche depuis l’Arbre.";
  } else if (!reqOk) {
    action = btn(ic("lock", 13) + "Verrouillé", { cls: "ghost", small: true, dis: true });
    note = "Requiert d’abord : " + missing.join(", ") + ".";
  } else if (otherBusy) {
    action = btn("Une recherche est déjà active", { cls: "ghost", small: true, dis: true });
    note = "Une seule recherche à la fois.";
  } else if (!afford) {
    action = btn(ic("chart", 13) + "Rechercher · " + price.amount + " PE",
      { cls: "purple", small: true, dis: true });
    note = "Il te manque " + (price.amount - (S.pe || 0)) + " PE — gagne-en au Raid Évolution.";
  } else {
    action = btn(ic("chart", 13) + "Rechercher · " + price.amount + " PE",
      { cls: "purple", small: true, act: "research", arg: id });
  }

  openModal(
    '<div class="row gap10" style="margin-bottom:10px">' +
      '<div class="imini" style="width:44px;height:44px;background:linear-gradient(180deg,' + shade(col, 18) + "," +
        shade(col, -40) + ');border-color:' + col + ';box-shadow:0 0 12px ' + col + '4d">' + ic(node.icon, 25) + "</div>" +
      '<div class="flex1"><div class="bb" style="font-size:14px;color:' + col + '">' + esc(node.label) + "</div>" +
      '<div class="row gap4 mt6" style="flex-wrap:wrap"><span class="pill">' + esc(node.sect) + "</span>" +
      '<span class="pill" style="color:' + nodeType(node).c + ";border-color:" + nodeType(node).c +
        '99">' + ic(nodeType(node).icon, 10) + nodeType(node).label + "</span>" +
      '<span class="pill" style="color:' + (maxed ? "var(--greenLit)" : "var(--text)") +
        ";border-color:" + (maxed ? "#3FB950" : "#33486F") + '">' + lv + " / " + node.max + "</span></div></div></div>" +

    '<div class="notice" style="border-left-color:' + col + '">' +
      esc(TREE_EFFECT_INFO[node.effect] || node.label) + "</div>" +

    '<div class="mt10">' + meter((lv / node.max) * 100, maxed ? C.green : col, lv + " / " + node.max) + "</div>" +

    '<div class="card mt10" style="padding:9px 11px">' +
      '<div class="kv"><span class="dim">Effet actuel</span><b>' + nowTxt + "</b></div>" +
      (maxed ? "" : '<div class="kv"><span class="dim">' +
        (busy ? "À la fin de la recherche" : "Après cette recherche") + "</span>" +
        '<b style="color:var(--greenLit)">' + nextTxt + "</b></div>") +
      '<div class="kv"><span class="dim">Maximum (' + node.max + " niv.)</span><b style=\"color:var(--goldLit)\">" +
        treeEffectValue(node, node.max) + "</b></div>" +
      (node.effect !== "raidKey" && node.effect !== "eggSlot"
        ? '<div class="kv"><span class="dim">Total de la branche</span><b style="color:var(--goldLit)">' +
          (Math.round(branchTotal * 10) / 10) + (node.unit === "h" ? " h" : node.unit === "×" ? "" : "%") + "</b></div>"
        : "") +
      (maxed ? ""
        : busy
          // already running: the cost is spent, what matters is the countdown
          ? '<div class="kv"><span class="dim">Temps restant</span><b class="row gap4" style="color:var(--goldLit)">' +
            ic("clock", 12) + fmtTime(Math.max(0, (S.tree.activeEnd - Date.now()) / 1000)) + "</b></div>"
          : '<div class="kv"><span class="dim">Coût</span><b class="row gap4" style="color:' +
            (afford ? "var(--goldLit)" : "var(--textMute)") + '">' +
            ic("chart", 12) + price.amount + " PE</b></div>" +
          // section 27: no invented timer on nodes that do not research
          (dur > 0 ? '<div class="kv"><span class="dim">Durée</span><b class="row gap4">' +
            ic("clock", 12) + fmtDur(dur) + "</b></div>" : "")) +
    "</div>" +

    (node.req.length
      ? '<div class="mt10"><div class="mute tiny b" style="letter-spacing:.6px;margin-bottom:5px">PRÉREQUIS</div>' +
        '<div class="row gap8" style="flex-wrap:wrap">' + reqNames + "</div></div>"
      : "") +

    (note ? '<div class="mute tiny mt10" style="line-height:1.5">' + note + "</div>" : "") +

    '<div class="col gap6 mt10">' + action +
      btn("Fermer", { cls: "dark", small: true, act: "closeModal" }) + "</div>",
    esc(node.label));
}

/* Summon results as framed cards, mirroring the sheet RESULTAT D INVOCATION */
function showSkillResult(res) {
  const best = res.reduce((a, b) =>
    RARITY_ORDER.indexOf(b.rarity) > RARITY_ORDER.indexOf(a.rarity) ? b : a, res[0]);
  const bc = RARITY[best.rarity].c;
  const card = (r) => {
    const def = SKILL_BY_ID[r.id];
    const col = RARITY[r.rarity].c;
    const cat = def ? SKILL_CATS[def.cat] : null;
    return '<div class="resItem rf" style="width:58px;border-color:' + col + ";--rc:" + col + '">' +
      '<span style="position:relative;z-index:1">' + ic(def ? def.icon : "sparkle", 18) + "</span>" +
      '<div class="tiny bb" style="color:' + col + ';line-height:1.1">' + esc(def ? def.name : r.id) + "</div>" +
      (cat ? '<span class="tag" style="color:' + cat.c + ";border-color:" + cat.c + '66">' + cat.label + "</span>" : "") +
      '<div class="tiny b" style="color:' + (r.dup ? "var(--textMute)" : "var(--greenLit)") + '">' +
        (r.dup ? "Doublon" : "Nouveau") + "</div></div>";
  };
  const news = res.filter((r) => !r.dup).length;
  openModal('<div class="center" style="margin-bottom:6px">' + ic("sparkle", 32) + "</div>" +
    '<div class="modalT" style="color:' + bc + ';text-shadow:0 2px 0 #000,0 0 18px ' + bc + '80">' +
      res.length + " INVOCATION" + (res.length > 1 ? "S" : "") + "</div>" +
    '<div class="resGrid">' + res.slice(0, 12).map(card).join("") + "</div>" +
    '<div class="dim small center" style="margin-bottom:10px">' +
      (news ? news + " nouvelle" + (news > 1 ? "s" : "") + " compétence" + (news > 1 ? "s" : "")
            : "Doublons — ils font monter le niveau des compétences possédées") + "</div>" +
    btn("Continuer", { cls: "purple", act: "closeModal" }), "Résultat d’invocation");
}
function showSkillSlotPicker(idx) {
  const owned = SKILL_DEFS.filter((d) => S.skills[d.id]);
  openModal((owned.length === 0 ? '<div class="dim small center" style="margin-bottom:12px">Aucune compétence possédée.</div>'
      : '<div class="scroller">' + owned.map((d) =>
        '<div class="itemRow" style="border-left-color:' + d.color + ';cursor:pointer" data-act="setSkill" data-arg="' + idx +
        '" data-arg2="' + d.id + '">' +
        '<div class="imini" style="width:32px;height:32px;background:linear-gradient(180deg,' + shade(d.color, 18) + "," +
        shade(d.color, -38) + ');border-color:' + d.color + '">' + ic(d.icon, 20) + "</div>" +
        '<div class="flex1">' +
        '<div class="b small">' + d.name + '</div><div class="mute tiny b">Niv.' + S.skills[d.id].level + " · CD " + d.cd + "s</div></div>" +
        (S.skillSlots[idx] === d.id ? '<span class="pill" style="color:var(--greenLit);border-color:#3FB950">Actuelle</span>'
          : ic("chevron", 11)) + "</div>").join("") + "</div>") +
    '<div class="col gap6 mt10">' +
      (S.skillSlots[idx] ? btn("Vider l'emplacement", { cls: "dark", small: true, act: "setSkill", arg: idx, arg2: "" }) : "") +
      btn("Fermer", { cls: "ghost", small: true, act: "closeModal" }) + "</div>",
    "Emplacement " + (idx + 1));
}

function showRaidResult(r) {
  const meta = RAIDS[r.raidId];
  const col = r.won ? C.gold : C.red;
  const pay = (r.reward && typeof r.reward === "object") ? r.reward : { gross: Number(r.reward) || 0, credited: Number(r.reward) || 0, repaid: 0 };
  const rewardLine = pay.repaid > 0
    ? 'Récompense produite : <b style="color:' + meta.color + '">+' + fmt(pay.gross) + " " + meta.reward + '</b><br>' +
      '<span style="color:var(--goldLit)">Ajustement de progression : -' + fmt(pay.repaid) + " " + meta.reward + '</span><br>' +
      (pay.credited > 0 ? 'Crédité : <b style="color:' + meta.color + '">+' + fmt(pay.credited) + " " + meta.reward + '</b><br>' : '')
    : 'Récompense : <b style="color:' + meta.color + '">+' + fmt(pay.credited) + " " + meta.reward + '</b><br>';
  openModal('<div class="center">' + ic(r.won ? "trophy" : "skull", 40) + "</div>" +
    '<div class="modalT mt6" style="color:' + (r.won ? "var(--goldLit)" : "var(--redLit)") +
      ';text-shadow:0 2px 0 #000,0 0 18px ' + col + '80">' + (r.won ? "VICTOIRE" : "DÉFAITE") + "</div>" +
    '<div class="dim small center" style="margin-bottom:12px;line-height:1.55">' + meta.name + " · niveau " + r.level + "<br>" +
    (r.won ? rewardLine + "Niveau de raid suivant débloqué."
      : "Aucune clé consommée. Renforce ton personnage et réessaie.") + "</div>" +
    btn("Continuer", { cls: r.won ? "green" : "ghost", act: "closeRaid" }),
    r.won ? "Raid terminé" : "Raid échoué");
}

function showMegaResult(r) {
  const def = bossFor(r.floor);
  const won = !!r.won;
  openModal('<div class="center">' + ic(won ? "trophy" : "skull", 40) + "</div>" +
    '<div class="modalT mt6" style="color:' + (won ? "var(--goldLit)" : "var(--redLit)") + '">' +
      (won ? "VICTOIRE" : "DÉFAITE") + "</div>" +
    '<div class="dim small center" style="margin-bottom:12px;line-height:1.6">Méga niveau ' + megaLevelForFloor(r.floor) +
      " · Méga-" + esc(def.name) + "<br>Référence : Boss normal étage " + fmtInt(r.floor) + " · puissance ×10<br>" +
      (won && r.firstClear
        ? 'Première victoire : <b style="color:#A9E06F">+' + fmt(r.apples) + " 🍎</b>" +
          (r.accel ? '<br><b style="color:var(--goldLit)">+' + fmt(r.accel.qty) + " Accélérateur " +
            esc((ACCEL_DEFS.find((a) => a.key === r.accel.key) || {}).label || r.accel.key) + "</b> (×2 Boss normal)" : "") +
          "<br>Récompense enregistrée définitivement." + (Object.keys(S.megaBossClears || {}).length === 1 ? "<br><b style=\"color:var(--purpleLit)\">🏛️ Sanctuaire débloqué !</b>" : "")
        : won ? "Méga-Boss déjà vaincu : <b>0 Pomme</b>."
        : "Aucune clé ni récompense perdue. Renforce-toi et réessaie.") + "</div>" +
    btn("Continuer", { cls: won ? "green" : "ghost", act: "closeMega" }),
    won ? "Méga-Boss vaincu" : "Méga Boss échoué");
}

function askReset() {
  openModal('<div class="center">' + ic("trash", 34) + "</div>" +
    '<div class="dim small center mt6" style="margin-bottom:14px;line-height:1.55">Toute la progression locale sera effacée : ' +
    "niveau, étage, équipement, compétences, familiers, rebirth et ascension. <b>Action irréversible.</b></div>" +
    '<div class="row gap6">' + btn("Annuler", { cls: "ghost", act: "closeModal" }) +
    btn("Tout effacer", { cls: "red", act: "doReset" }) + "</div>", "Réinitialiser ?");
}

const ACT = {
  tutorialOk: () => dismissTutorial(),
  tutorialNext: () => tutorialNext(),
  researchFinished: (a) => showResearchFinished(a),
  eggFinished: (a) => { nav("familier"); setTimeout(() => showEggFinished(a), 30); },
  collectEggPopup: (a) => { collectEgg(a); closeModal(); rewardPop("Œuf éclos", "Nouveau familier obtenu.", false); scheduleRender(); },
  collectResearchPopup: () => { collectResearch(); closeModal(); rewardPop("Amélioration récupérée", "Le bonus de l’Arbre est maintenant actif.", false); scheduleRender(); },
  goTreeFromNotice: (a) => { closeModal(); nav("arbre"); setTimeout(() => showTreeNode(a), 40); },
  goalUnlockInfo: () => {
    const u = nextUnlockGoal(S);
    if (!u) return;
    openModal('<div class="modalT">' + esc(u.title) + '</div>' +
      '<div class="card mt8"><div class="b small">Déblocage · ' + esc(u.note) + '</div>' +
      '<div class="mute small mt6">' + esc(u.detail) + '</div>' +
      '<div class="goalBar mt8"><i style="width:' + goalProgressPct(u) + '%"></i></div>' +
      '<div class="goalMeta"><span>' + Math.floor(u.now) + ' / ' + Math.floor(u.max) + '</span><b>' + goalProgressPct(u) + '%</b></div></div>' +
      btn('Compris',{cls:'blue',act:'closeModal'}));
  },
  go: (a) => nav(a),
  goModal: (a) => { closeModal(); nav(a); },
  harvest: () => showHarvestModal(),
  ascendAsk: (a) => showAscendModal(a),
  ascendRaidAsk: (a) => showRaidAscendModal(a),
  ascendRaidDo: (a) => {
    const r = doAscendRaid(a);
    closeModal();
    if (!r.ok) {
      toast(r.maxed ? "Ascension Raid déjà au maximum (★" + RULES.RAID_ASCEND_MAX_STARS + ")"
        : "Ce raid n'est pas encore au niveau " + RULES.RAID_MAX_LEVEL);
      return;
    }
    toast("Ascension " + RAIDS[a].reward + " ★ " + r.stars, true);
  },
  ascendDo: (a) => {
    const r = doAscendMastery(a);
    closeModal();
    if (!r.ok) {
      toast(a === "pet" && starsOf(S, "pet") >= PET_ASCEND_MAX_STARS
        ? "Ascension Familier déjà au maximum" : "Maîtrise pas encore au maximum");
      return;
    }
    const cfg = ASCENSION[a];
    toast("Ascension " + cfg.label + " ★ " + r.stars + " — base ×" + ascendPowerMul(r.stars, a) +
      (r.appleRefund ? " · +" + fmt(r.appleRefund) + " 🍎 remboursées" : ""), true);
  },
  resInfo: (a) => showResourceInfo(a),
  statInfo: (a) => showStatInfo(a),
  harvestClaim: () => {
    let got = null;
    update((st) => { got = harvestClaim(st); });
    if (!got) return;
    const bits = [];
    if (got.minerai) bits.push(fmt(got.minerai) + " Minerai");
    if (got.essence) bits.push(fmt(got.essence) + " Essence");
    if (got.eclat) bits.push(fmt(got.eclat) + " Compét.");
    if (got.gold) bits.push(fmt(got.gold) + " Or");
    toast(bits.length ? "+" + bits.join(" · ") : "Rien à réclamer", bits.length > 0);
    closeModal();
  },
  back: () => nav(TAB_IDS.includes(route) ? "accueil" : "accueil"),
  closeModal: () => closeModal(),
  locked: (a) => toast("Débloqué au niveau " + a),

  // forge
  forge: (a) => { startForgeBatch(a); },
  forgeUpgradeAsk: () => showForgeUpgrade(),
  forgeUpgrade: () => {
    closeModal();
    const r = upgradeForge();
    if (r.ok) toast(r.instant ? "Forge améliorée !" : "Amélioration lancée", true);
    else toast(r.reason === "gold" ? "Or insuffisant"
      : r.reason === "max" ? "Forge au maximum" : "Amélioration en cours");
  },
  forgeCollect: () => { collectForgeUpgrade(); toast("Forge améliorée !", true); },
  autoForge: () => { toggleAutoForge(); toast("Auto-forge " + (S.forge.autoForge ? "activée" : "désactivée"), S.forge.autoForge); },
  forgeFilter: () => showForgeFilterPicker(),
  forgeFilterToggle: () => {
    toggleForgeFilter();
    toast("Filtre de Forge " + (S.forge.filter ? "activé" : "désactivé"), S.forge.filter);
    showForgeFilterPicker();
  },
  forgeKeep: (a) => {
    const before = S.forge.keep[a] !== false;
    toggleForgeKeep(a);
    if (before && S.forge.keep[a] !== false) toast("Il faut garder au moins une rareté");
    showForgeFilterPicker();
  },
  forgeKeepAll: () => { setForgeKeepAll(true); showForgeFilterPicker(); },

  // stats
  alloc: (a, b) => { allocStat(a, b === "max" ? S.statPoints : parseInt(b, 10)); },

  // items
  itemDetail: (a, b) => showItemDetail(a, b),
  previewEquip: (a) => {
    const it = S.inventory.find((x) => x.id === a); if (!it) return;
    equipPreviewSet[it.slot] = it.id; render();
  },
  clearEquipPreview: () => { equipPreviewSet = {}; render(); },
  equipPreviewSet: () => {
    const ids = Object.values(equipPreviewSet); equipPreviewSet = {};
    ids.forEach((id) => equipItem(id)); closeModal(); toast(ids.length > 1 ? "Set équipé" : "Équipé", true);
  },
  equip: (a) => { equipPreviewSet = {}; equipItem(a); closeModal(); toast("Équipé", true); },
  unequip: (a) => { unequipItem(a); closeModal(); toast("Déséquipé"); },
  recycle: (a) => { const d = recycleItem(a); toast(d ? "+" + d + " poussière" : "Objet introuvable", !!d); },
  upgradeItem: (a) => {
    const r=upgradeItem(a);
    if (!r.ok) { toast(r.reason==="dust" ? "Poussière insuffisante" : "Objet introuvable"); return; }
    showItemDetail(a, null);
    toast(r.success ? "Amélioration réussie · " + (r.statLabel || "Stat") + " +" + (r.statGain || 0).toLocaleString("fr-FR", {minimumFractionDigits:2, maximumFractionDigits:2}) : "Échec · objet conservé", r.success);
  },
  itemSealMinus: (a) => { itemSealPlan[a]=Math.max(0,itemSealCount(a)-1); showItemDetail(a,null); },
  itemSealPlus: (a) => {
    const it=Object.values(S.equipped).find(x=>x&&x.id===a)||S.inventory.find(x=>x.id===a);
    if(!it)return;
    const maxNeed=Math.ceil((100-itemUpgradeChance(it))/5);
    const owned=(S.sanctuary&&S.sanctuary.stabilitySeals)||0;
    itemSealPlan[a]=Math.min(maxNeed,owned,itemSealCount(a)+1); showItemDetail(a,null);
  },
  rarityInfo: () => showRarityInfo(),
  autoSkills: () => {
    update((s) => { s.autoSkills = !s.autoSkills; });
    toast(S.autoSkills ? "Compétences automatiques" : "Compétences manuelles", S.autoSkills);
    render();
  },
  castSkill: (a) => {
    const why = castSkill(a);
    if (why) toast(why);
  },
  invFilter: (a) => { invFilter = a; if(recycleSelectMode) recycleSelectedIds.clear(); render(); },
  toggleRecycleSelect: () => { recycleSelectMode=!recycleSelectMode; recycleSelectedIds.clear(); render(); },
  toggleRecycleItem: (a) => { if(!recycleSelectMode)return; recycleSelectedIds.has(a)?recycleSelectedIds.delete(a):recycleSelectedIds.add(a); render(); },
  selectVisibleRecycle: () => { const list=invFilter==='ALL'?S.inventory:S.inventory.filter(x=>x.slot===invFilter); list.forEach(x=>recycleSelectedIds.add(x.id)); render(); },
  askRecycleSelected: () => askRecycleIds(Array.from(recycleSelectedIds),'Recycler la sélection'),
  doRecycleSelected: (a) => { const ids=String(a||'').split(',').filter(Boolean); const r=recycleItemsByIds(ids); recycleSelectedIds.clear(); recycleSelectMode=false; recycleSlots.clear(); closeModal(); toast(r.n?r.n+' objet'+(r.n>1?'s':'')+' recyclé'+(r.n>1?'s':'')+' · +'+fmt(r.dust)+' poussière':'Rien à recycler',!!r.n); render(); },
  recycleSlotsPicker: () => { recycleSlots.clear(); showRecycleSlotsPicker(); },
  toggleRecycleSlot: (a) => { recycleSlots.has(a)?recycleSlots.delete(a):recycleSlots.add(a); showRecycleSlotsPicker(); },
  askRecycleSlots: () => { const ids=S.inventory.filter(x=>recycleSlots.has(x.slot)).map(x=>x.id); askRecycleIds(ids,'Recycler les catégories'); },
  pickRecycleRarity: () => showRecyclePicker(),
  setRecycleRarity: (a) => { recycleRarity = a; closeModal(); render(); },
  askRecycleBatch: () => askRecycleBatch(),
  doRecycleBatch: () => {
    const r = recycleBatch(recycleRarity);
    closeModal();
    toast(r.n ? r.n + " objet" + (r.n > 1 ? "s" : "") + " recyclé" + (r.n > 1 ? "s" : "") + " · +" + fmt(r.dust) + " poussière" : "Rien à recycler", !!r.n);
    render();
  },
  skillFilter: (a) => { skillFilter = a; render(); },
  skillCard: (a) => showSkillCard(a),
  unequipSkill: (a) => {
    update((s) => { const i = s.skillSlots.indexOf(a); if (i >= 0) s.skillSlots[i] = null; });
    closeModal(); toast("Déséquipé"); render();
  },

  // skills
  summonSkill: (a) => {
    const r = summonSkill(parseInt(a, 10));
    if (!r.length) { toast("Éclats insuffisants"); return; }
    showSkillResult(r);
  },
  skillSlot: (a) => showSkillSlotPicker(parseInt(a, 10)),
  setSkill: (a, b) => { equipSkill(parseInt(a, 10), b || null); closeModal(); },
  autoEquipSkill: (a) => {
    const empty = S.skillSlots.slice(0, skillSlotCount(S)).indexOf(null);
    equipSkill(empty >= 0 ? empty : 0, a);
    closeModal();
    toast("Compétence équipée", true);
  },

  // pets
  summonEgg: (a) => {
    const r = summonEgg(parseInt(a, 10));
    if (!r.length) toast("Essence insuffisante");
    else toast(r.length + " œuf" + (r.length > 1 ? "s" : "") + " ajouté" + (r.length > 1 ? "s" : "") + " au stock", true);
  },
  startEgg: (a) => { if (startEgg(a)) toast("Œuf placé en éclosion", true); else toast("Aucun emplacement libre"); },
  collectEgg: (a) => { collectEgg(a); toast("Familier obtenu !", true); },
  fuse: (a) => {
    const r = fusePets(a);
    if (r.ok) toast("Fusion réussie !" + (r.refund ? " · +" + fmt(r.refund) + " 🍎 remboursées" : ""), true);
    else toast(petFuseNeed(a) + " Familiers de rareté " + RARITY[a].label + " requis");
  },
  setPet: (a) => { setActivePet(a); toast("Familier actif", true); },
  upgradePet: (a) => {
    if (upgradePet(a)) toast("Familier amélioré !", true); else toast("Pommes insuffisantes");
  },
  raidKeyAdd: (a) => {
    if (assignRaidKey(a, 1)) toast("Cle quotidienne attribuee a " + RAIDS[a].name, true);
    else toast("Aucune cle disponible");
  },
  buyEggSlot: () => { if (buyEggSlot()) toast("Emplacement ajouté !", true); else toast("Conditions non remplies"); },

  // arène de simulation
  arenaProg: (a) => { if (ARENA_PROGRESSION[a]) { arenaSimCfg.progression=a; arenaSimResult=null; render(); } },
  arenaRatio: (a) => { arenaSimCfg.ratio=(a==="natural"?"natural":Math.max(50,Math.min(200,parseInt(a,10)||100))); arenaSimResult=null; render(); },
  arenaBuild: (a) => { if (ARENA_BUILDS[a]) { arenaSimCfg.build=a; arenaSimResult=null; render(); } },
  arenaCount: (a) => { arenaSimCfg.count=Math.max(1,Math.min(1000,parseInt(a,10)||100)); arenaSimResult=null; render(); },
  arenaLiveStart: () => { if(!startArenaLiveFight()) toast("Analyse en cours"); },
  arenaLiveAbort: () => abortArenaLive(),
  arenaRun: () => runArenaSimulation(),
  arenaMatrix: () => runArenaMatrix(),
  arenaMatrixCancel: () => cancelArenaMatrix(),

  // raids
  startRaid: (a, b) => {
    const ok = startRaid(a, b === "1", (won, reward) => {
      raidResult = { raidId: a, won, reward, level: S.raids[a].record || S.raids[a].level };
      showRaidResult(raidResult);
      scheduleRender();
    });
    if (!ok) toast("Aucune clé disponible");
    else { nav("raid"); }
  },
  bossRetry: () => { if (retryPendingBoss()) { nav("accueil"); toast("Boss relancé", true); } else toast("Boss non disponible"); },
  abortRaid: () => { combat = null; startCampaign(); nav("accueil"); toast("Raid abandonné"); },
  closeRaid: () => { closeModal(); raidResult = null; startCampaign(); nav("raid"); },
  adKey: () => { if (watchAdForKey()) toast("+1 clé universelle", true); else toast("Plafond atteint"); },

  // mega raid
  startMega: (a) => {
    const ok = startMegaBoss(a, (won, result) => {
      megaResult = result;
      showMegaResult(result);
      scheduleRender();
    });
    if (!ok) toast("Méga-Boss non disponible");
    else nav("mega");
  },
  abortMega: () => { combat = null; startCampaign(); nav("mega"); toast("Méga Boss abandonné"); },
  closeMega: () => { closeModal(); megaResult = null; startCampaign(); nav("mega"); },

  // sanctuaire
  sanctAdd: (a) => { sanctSetSlot(a); render(); },
  sanctClear: (a) => { sanctClearSlot(a); render(); },
  sanctFuse: () => {
    const r=sanctFuse();
    if(!r.ok) toast(r.msg);
    else { toast("Fusion réussie · "+r.recipe.name, true); render(); }
  },

  // tree
  treeNode: (a) => showTreeNode(a),
  research: (a) => {
    if (startResearch(a)) { closeModal(); toast("Recherche lancée", true); }
    else toast("Conditions non remplies");
  },
  collectResearch: () => { collectResearch(); toast("Nœud débloqué !", true); },
  accel: (a, b) => {
    const target = b === "tree" ? { type: "tree" }
      : b === "forge" ? { type: "forge" }
      : { type: "egg", id: b.split(":")[1] };
    if (useAccelerator(target, a)) toast("Accélérateur utilisé", true); else toast("Impossible ici");
  },

  // rebirth / ascension
  doRebirth: () => {
    const pr = doRebirth();
    if (pr) { toast("+" + pr + " PR", true); nav("rebirth"); }
    else toast("Rebirth impossible : étage " + RULES.REBIRTH_UNLOCK_FLOOR + " requis");
  },
  buyRebirth: (a) => { if (buyRebirth(a)) toast("Amélioration achetée", true); else toast("PR insuffisants"); },
  startTrial: () => {
    startAscensionTrial((won) => {
      if (won) {
        doAscension();
        openModal('<div class="center">' + ic("crown", 44) + "</div>" +
          '<div class="modalT mt6" style="color:var(--goldLit);text-shadow:0 2px 0 #000,0 0 20px #E8B44A99">ASCENSION !</div>' +
          '<div class="dim small center" style="margin-bottom:12px;line-height:1.55">Palier ' + S.ascension +
          " atteint.<br>+" + ASCENSION_GEMS[Math.max(0, S.ascension - 1)] + " gemmes, +2 accélérateurs 30 min, +2 clés par raid.<br>" +
          "Ton niveau repart à 1 — les bonus permanents restent.</div>" +
          btn("Continuer", { cls: "green", act: "closeTrial" }), "Palier franchi");
      } else {
        openModal('<div class="center">' + ic("skull", 38) + "</div>" +
          '<div class="modalT mt6" style="color:var(--redLit)">ÉPREUVE ÉCHOUÉE</div>' +
          '<div class="dim small center" style="margin:0 0 12px;line-height:1.55">Le Gardien est trop fort. Renforce-toi et réessaie.</div>' +
          btn("Continuer", { cls: "ghost", act: "closeTrial" }), "Épreuve d'Ascension");
      }
      scheduleRender();
    });
    nav("ascension");
  },
  closeTrial: () => { closeModal(); startCampaign(); nav("ascension"); },

  // shop
  buyPack: () => toast("Paiement bientôt disponible"),
  buyDeal: (a) => {
    const d = GEM_DEALS.find((x) => x.id === a);
    const ok = spendGems(d.cost, (s) => {
      if (a === "key") s.universalKeys = Math.min(RULES.UNIVERSAL_KEY_CAP, s.universalKeys + 1);
      if (a === "acc15") s.accels.a15 = (s.accels.a15 || 0) + 5;
      if (a === "acc60") s.accels.a60 = (s.accels.a60 || 0) + 2;
      if (a === "minerai") s.minerai += 5000;
    });
    toast(ok ? "Acheté !" : "Gemmes insuffisantes", ok);
  },

  // event
  claimEvent: (a) => { claimEvent(a); toast(S.eventClaims[a] ? "Récompense réclamée" : "Objectif non atteint", S.eventClaims[a]); },

  // settings
  saveNow: () => { saveNow(); toast("Sauvegardé", true); },
  freshReload: () => forceFreshReload(),
  warpDay: () => { warpDay(); toast("+1 jour simulé", true); },
  rename: () => {
    const n = prompt("Nom du héros :", S.playerName);
    if (n && n.trim()) { update((s) => { s.playerName = n.trim().slice(0, 18); }); toast("Renommé", true); }
  },
  askReset: () => askReset(),
  doReset: () => { closeModal(); resetGame(); nav("accueil"); toast("Progression réinitialisée", true); },
  exportSave: () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shadowreach-save.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("Sauvegarde exportée", true);
  },
  importSave: () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const fr = new FileReader();
      fr.onload = () => {
        try {
          S = migrate(JSON.parse(String(fr.result)), "Héros");
          applyDailyReset(S);
          S.power = computePower(S);
          refreshDerived();
          saveNow();
          startCampaign();
          nav("accueil");
          toast("Sauvegarde importée", true);
        } catch (e) { toast("Fichier invalide"); }
      };
      fr.readAsText(f);
    };
    inp.click();
  },
};

// Native <details> state would otherwise be lost whenever the Home screen is
// rebuilt for its live timers/HUD. Keep that UI-only state outside the DOM.
document.getElementById("app").addEventListener("toggle", (e) => {
  const d = e.target;
  if (d && d.matches && d.matches('details[data-home-more="1"]')) homeMoreOpen = d.open;
  if (d && d.matches && d.matches('details[data-goal-details="1"]')) goalDetailsOpen = d.open;
}, true);

document.getElementById("app").addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (!fn) return;
  e.stopPropagation();
  fn(el.dataset.arg, el.dataset.arg2);
});

/* Test handle, and only that. `S`, `D`, `combat` and `lastTick` are top-level
   let bindings, so another window cannot see them however hard it looks --
   only function declarations land on `window`. smoke-test.html needs to read
   and drive them, so they are exposed here behind an explicit query flag. A
   normal load has no ?smoke=1 and therefore no handle at all. */
if (SMOKE) {
  window.__smoke = {
    get S() { return S; },
    get D() { return D; },          set D(v) { D = v; },
    get combat() { return combat; }, set combat(v) { combat = v; },
    get lastTick() { return lastTick; }, set lastTick(v) { lastTick = v; },
    // the data tables are `const` too, so they are just as invisible
    SLOTS, SKILL_DEFS, SCREENS, RESOURCE_INFO, TREE_NODES, TREE_BY_ID,
    ENEMY_TYPES, ELITE_DEFS, BOSS_DEFS, RAID_BOSSES, EGG_TIMERS, AW,
    MASTERY_STAT, ASCENSION, RULES, PET_SPECIES, PET_UP, PR_PER_FLOOR, REBIRTH_UPGRADES, RAID_IDS,
    megaBossFloors, nextMegaBossFloor, megaAppleBaseReward, megaAppleFirstClearReward, megaLevelForFloor, megaRaidUnlocked, megaAccelReward,
    makeMegaBossEnemy, startMegaBoss, petAppleInvestmentAtLevel, petAppleInvestmentTotal,
    TREE_NODES,
    get forgeAnim() { return forgeAnim; }, set forgeAnim(v) { forgeAnim = v; },
    FORGE_ANIM_MS, EQUIP_RARITY_ORDER, PET_RARITY_ORDER, RARITY_MUL, SINGLE_STAT_MUL,
    BASE, AFFIX_BY_KEY, AFFIX_DEFS, AFFIX_EXCEPTIONAL_PCT, WEAPON_TYPES,
    SPEED_AFFIX_CAP, SKILL_LEVEL_GROWTH, RATE_ANCHORS, SKILL_RARITY_MUL,
    HERO_START, ENEMY_FIRE_RANGE, ENEMY_SPEED,
  };
}

// SCROLL_PRESERVE_V24
// Conserve la position de #screen pendant les rafraichissements live.
const renderBaseV24=render;
render=function(){
  const screen=document.getElementById("screen");
  const beforeRoute=typeof route!=="undefined"?route:null;
  const beforeTop=screen?screen.scrollTop:0;
  const beforeMax=screen?Math.max(0,screen.scrollHeight-screen.clientHeight):0;
  const wasNearBottom=screen?beforeMax-beforeTop<=24:false;
  const out=renderBaseV24.apply(this,arguments);
  const restore=function(){
    const sc=document.getElementById("screen");
    if(!sc||beforeRoute!==(typeof route!=="undefined"?route:null))return;
    const max=Math.max(0,sc.scrollHeight-sc.clientHeight);
    sc.scrollTop=wasNearBottom?max:Math.min(beforeTop,max);
  };
  restore();
  requestAnimationFrame(restore);
  return out;
};

/* ---------------- go ---------------- */
boot();
// the hero is in every fight, so his frames are worth having up front
preloadFrames("hero");
render();
rafLoop();

// ACCESSIBILITY_KEYBOARD_V20
function isNativeKeyboardControl(el) {
  if (!el || !el.tagName) return false;
  return el.tagName === "BUTTON" || el.tagName === "A" || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA";
}
function accessibilityDisabled(el) {
  return !el || el.disabled === true || el.getAttribute("aria-disabled") === "true" || el.hasAttribute("disabled");
}
document.addEventListener("keydown", function accessibilityActivate(e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  const target = e.target && e.target.closest ? e.target.closest("[data-act]") : null;
  if (!target || accessibilityDisabled(target) || isNativeKeyboardControl(target)) return;
  e.preventDefault();
  target.click();
});
function enhanceInteractiveAccessibility(root) {
  if (!root || root.nodeType !== 1) return;
  const nodes=[];
  if (root.matches && root.matches("[data-act]")) nodes.push(root);
  if (root.querySelectorAll) root.querySelectorAll("[data-act]").forEach(function(el){ nodes.push(el); });
  nodes.forEach(function(el){
    if (!isNativeKeyboardControl(el)) {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex","0");
      if (!el.hasAttribute("role")) el.setAttribute("role","button");
    }
    if (!el.hasAttribute("aria-label") || el.getAttribute("data-auto-aria") === "true") {
      const label=(el.getAttribute("title") || el.textContent || "").replace(/\s+/g," ").trim();
      if (label) { el.setAttribute("aria-label",label.slice(0,120)); el.setAttribute("data-auto-aria","true"); }
    }
  });
}
function startAccessibilityEnhancements(){
  enhanceInteractiveAccessibility(document.body);
  const observer=new MutationObserver(function(mutations){
    const roots=new Set();
    mutations.forEach(function(m){
      m.addedNodes.forEach(function(node){ if(node && node.nodeType===1) roots.add(node); });
      if(m.target && m.target.nodeType===1 && m.target.closest){ const changed=m.target.closest("[data-act]"); if(changed) roots.add(changed); }
    });
    roots.forEach(enhanceInteractiveAccessibility);
  });
  observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",startAccessibilityEnhancements,{once:true});
else startAccessibilityEnhancements();
// DECISION_HIERARCHY_V23
// Une seule hiérarchie contextuelle : aucun empilement V21/V22, aucune fonction cachée.
const DECISION_SECONDARY_V23=/aperçu|apercu|détail|detail|info|fermer|annuler|retour/i;
function decisionTextV23(el){return ((el&&(el.getAttribute("aria-label")||el.getAttribute("title")||el.textContent))||"").replace(/\s+/g," ").trim();}
function decisionActV23(el){return ((el&&el.getAttribute("data-act"))||"").toLowerCase();}
function decisionVisibleV23(el){if(!el||el.disabled||el.getAttribute("aria-disabled")==="true")return false;const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.display!=="none"&&cs.visibility!=="hidden";}
function decisionGroupV23(el){return el.closest(".modal,.popup,.panel,.card,.screen,.page,.view,section,main")||el.parentElement||document.body;}
function decisionScoreV23(el){
  const text=decisionTextV23(el),act=decisionActV23(el),st=(typeof S!=="undefined"&&S)||{};
  let score=0;
  if(el.getAttribute("data-primary")==="true")score+=1200;
  if(/confirmer|valider|réclamer|reclamer/.test(text))score+=900;
  if(typeof combat!=="undefined"&&combat&&combat.status==="lost"&&/réessayer|reessayer|rejouer/.test(text))score+=1000;
  if(st.pendingBossFloor&&/boss|réessayer|reessayer/.test(text+" "+act))score+=980;
  if(st.forge&&st.forge.upgradeEnd&&st.forge.upgradeEnd<=Date.now()&&/forge|forger|améliorer|ameliorer|récupérer|recuperer/.test(text+" "+act))score+=820;
  if(Array.isArray(st.eggs)&&st.eggs.some(function(e){return e&&((e.end&&e.end<=Date.now())||(e.hatchEnd&&e.hatchEnd<=Date.now())||(e.ready===true));})&&/œuf|oeuf|éclore|eclore|ouvrir/.test(text+" "+act))score+=820;
  if(/raid/.test(act)&&/lancer|combat|entrer|raid/.test(text+" "+act))score+=760;
  if(/recherche|research/.test(act)&&/rechercher|lancer|améliorer|ameliorer/.test(text+" "+act))score+=720;
  if(/continuer|combattre|combat|prochain étage|prochain etage/.test(text))score+=650;
  if(/invoquer|forger|améliorer|ameliorer|équiper|equiper/.test(text))score+=520;
  if(DECISION_SECONDARY_V23.test(text))score-=700;
  return score;
}
function refreshDecisionHierarchyV23(){
  document.querySelectorAll("[data-primary-action=true],[data-secondary-action=true]").forEach(function(el){el.removeAttribute("data-primary-action");el.removeAttribute("data-secondary-action");});
  const groups=new Map();
  document.querySelectorAll("[data-act],button").forEach(function(el){if(!decisionVisibleV23(el))return;const g=decisionGroupV23(el);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(el);});
  groups.forEach(function(actions){if(actions.length<2)return;let best=null,bestScore=-Infinity;actions.forEach(function(el){const score=decisionScoreV23(el);if(score>bestScore){best=el;bestScore=score;}});if(best&&bestScore>0)best.setAttribute("data-primary-action","true");actions.forEach(function(el){if(el!==best&&(DECISION_SECONDARY_V23.test(decisionTextV23(el))||(actions.length>=5&&decisionScoreV23(el)<=0)))el.setAttribute("data-secondary-action","true");});});
}
let decisionRefreshQueuedV23=false;
function queueDecisionHierarchyV23(){if(decisionRefreshQueuedV23)return;decisionRefreshQueuedV23=true;requestAnimationFrame(function(){decisionRefreshQueuedV23=false;refreshDecisionHierarchyV23();});}
function startDecisionHierarchyV23(){refreshDecisionHierarchyV23();new MutationObserver(queueDecisionHierarchyV23).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["disabled","aria-disabled","class","style"]});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startDecisionHierarchyV23,{once:true});else startDecisionHierarchyV23();
