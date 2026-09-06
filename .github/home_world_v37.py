from pathlib import Path

BUILD_OLD='2026.09.06.36'
BUILD_NEW='2026.09.06.37'

g4p=Path('game-4.js'); cssp=Path('style.css'); g2p=Path('game-2.js'); idxp=Path('index.html')
g4=g4p.read_text(); css=cssp.read_text(); g2=g2p.read_text(); idx=idxp.read_text()

if 'CAMPAIGN_WORLD_NAV_V37' not in g4:
    old_sys='''  const sysBtns = [\n    { label: "Clan", icon: "banner", color: "#B0862C", go: "clan", lock: S.level < 10 ? 10 : 0 },\n    { label: "Boutique", icon: "shop", color: "#3B7FC4", go: "boutique" },\n    { label: "Progression", icon: "cycle", color: "#6B3AC4", go: "progression",\n      badge: canRebirth() || S.ascensionAvailable },\n    { label: "Événement", icon: "gift", color: "#C22127", go: "evenement", badge: true },\n    { label: "Classement", icon: "trophy", color: "#5A7099", go: "classement" },\n  ];'''
    new_sys='''  // CAMPAIGN_WORLD_NAV_V37\n  // Les systèmes secondaires restent accessibles, mais ils ne prennent plus de\n  // hauteur sous la campagne. Le Rebirth devient une action du monde, directement\n  // visible dans l'arène, et l'Ascension reste dans le menu compact.\n  const sysBtns = [\n    { label: "Clan", icon: "banner", color: "#B0862C", go: "clan", lock: S.level < 10 ? 10 : 0 },\n    { label: "Boutique", icon: "shop", color: "#3B7FC4", go: "boutique" },\n    { label: "Ascension", icon: "star", color: "#6B3AC4", go: "ascension", badge: S.ascensionAvailable },\n    { label: "Événement", icon: "gift", color: "#C22127", go: "evenement", badge: true },\n    { label: "Classement", icon: "trophy", color: "#5A7099", go: "classement" },\n  ];'''
    if old_sys not in g4:
        raise SystemExit('sysBtns anchor missing')
    g4=g4.replace(old_sys,new_sys,1)

    marker='''  const wtHome = WEAPON_TYPES[D.weapon] || WEAPON_TYPES.epee;'''
    world_helper='''  const worldAction = (b, pos) => {\n    const art = ASSETS["nav_" + b.go];\n    const icoHtml = art\n      ? '<img src="' + art + '" alt="" draggable="false">'\n      : '<span class="worldActionIco">' + ic(b.icon, 18) + '</span>';\n    const lock = b.lock ? ' data-act="locked" data-arg="' + b.lock + '"' : ' data-act="go" data-arg="' + b.go + '"';\n    return '<button class="worldAction ' + pos + (b.lock ? ' locked' : '') + '"' + lock +\n      ' aria-label="' + esc(b.label) + '">' + icoHtml +\n      '<span>' + (b.lock ? 'Niv.' + b.lock : esc(b.label)) + '</span>' +\n      (b.badge && !b.lock ? '<i class="worldDot"></i>' : '') + '</button>';\n  };\n  const worldPrimary = [\n    { label:"Rebirth", icon:"cycle", go:"rebirth", badge:canRebirth() },\n    navBtns[0], navBtns[1], navBtns[2]\n  ];\n\n'''
    if marker not in g4:
        raise SystemExit('wtHome marker missing')
    g4=g4.replace(marker,world_helper+marker,1)

    old_start='''  return recommendedCard + '<div id="arenaSlot"></div>' +\n    '<div id="skillbar">' +'''
    new_start='''  return recommendedCard + '<div class="campaignWorld">' +\n      '<div id="arenaSlot"></div>' +\n      '<div class="worldNavLayer">' +\n        worldAction(worldPrimary[0], "worldRebirth") +\n        worldAction(worldPrimary[1], "worldEquip") +\n        worldAction(worldPrimary[2], "worldDev") +\n        worldAction(worldPrimary[3], "worldDefis") +\n        '<details class="worldMenu"><summary>' + ic("menu", 14) + '<span>Menu</span>' +\n          (sysBtns.some((b)=>b.badge && !b.lock) ? '<i class="worldDot"></i>' : '') +\n        '</summary><div class="worldMenuPanel">' + sysBtns.map(tile).join("") + '</div></details>' +\n      '</div>' +\n    '</div>' +\n    '<div id="skillbar">' +'''
    if old_start not in g4:
        raise SystemExit('home return start anchor missing')
    g4=g4.replace(old_start,new_start,1)

    old_bottom='''    "</div></div>" +\n    progressionGoalHTML(S) +\n    '<div class="navGrid homeNavPrimary">' + navBtns.map(tile).join("") + "</div>" +\n    '<details class="homeMore mt4" data-home-more="1"' + (homeMoreOpen ? ' open' : '') + '><summary>' + ic("menu", 12) + 'Plus' +\n      (sysBtns.some((b) => b.badge && !b.lock) ? '<span class="dot"></span>' : '') +\n      '</summary><div class="navGrid homeNavSecondary mt4">' + sysBtns.map(tile).join("") + "</div></details>" +\n    '<div style="height:4px"></div>';'''
    new_bottom='''    "</div></div>" +\n    '<div class="homeCompactEnd"></div>';'''
    if old_bottom not in g4:
        raise SystemExit('home bottom anchor missing')
    g4=g4.replace(old_bottom,new_bottom,1)

if 'CAMPAIGN_WORLD_NAV_V37' not in css:
    css += r'''

/* CAMPAIGN_WORLD_NAV_V37
   La campagne garde exactement la taille de son arène. Les accès principaux
   flottent maintenant dans le décor au lieu d'ajouter des fenêtres sous le combat. */
.campaignWorld{position:relative;width:100%;isolation:isolate}
.campaignWorld #arenaSlot{position:relative;z-index:1}
.worldNavLayer{position:absolute;inset:0;z-index:12;pointer-events:none}
.worldAction,.worldMenu>summary{
  position:absolute;pointer-events:auto;min-width:44px;height:44px;padding:3px 6px;border-radius:11px;
  border:1px solid #8a6522;background:linear-gradient(180deg,#26334aee,#101827ee);
  box-shadow:inset 0 1px 0 #ffffff2e,inset 0 -2px 0 #0008,0 3px 8px #0009,0 0 10px #e8b44a20;
  color:#f6e6b7;font:800 8.5px var(--fu);letter-spacing:.2px;text-shadow:0 1px 2px #000;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;
  backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)
}
.worldAction img{width:25px;height:25px;object-fit:contain;display:block;filter:drop-shadow(0 1px 2px #000)}
.worldActionIco{height:23px;display:flex;align-items:center}
.worldAction.locked{filter:grayscale(.85);opacity:.7}
.worldRebirth{left:8px;top:8px;border-color:#9b5cf6;color:#e6d4ff;box-shadow:inset 0 1px 0 #ffffff2e,0 0 12px #9b5cf633,0 3px 8px #0009}
.worldEquip{right:8px;top:8px}
.worldDev{right:8px;top:62px;border-color:#3fb950;color:#c7f6ce}
.worldDefis{right:8px;top:116px;border-color:#e5484d;color:#ffd0d2}
.worldDot{position:absolute;right:3px;top:3px;width:8px;height:8px;border-radius:50%;background:#ff5e62;border:1px solid #fff;box-shadow:0 0 7px #ff4d4d}
.worldMenu{position:absolute;left:8px;bottom:8px;pointer-events:auto;z-index:14}
.worldMenu>summary{position:relative;left:auto;bottom:auto;list-style:none;width:50px;height:43px}
.worldMenu>summary::-webkit-details-marker{display:none}
.worldMenuPanel{position:absolute;left:0;bottom:49px;width:214px;padding:7px;border-radius:12px;border:1px solid #8a6522;
  background:linear-gradient(180deg,#101827f5,#070b13f7);box-shadow:0 10px 24px #000d,inset 0 1px 0 #ffffff1c;
  display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.worldMenuPanel .navBtn{margin:0;min-width:0}
.worldMenuPanel .navInner{height:44px}
.worldMenuPanel .navLbl{font-size:8px;line-height:1.05}
.homeCompactEnd{height:3px}
.homeNavPrimary,.homeMore{display:none!important}
@media(max-height:700px){
  .worldAction,.worldMenu>summary{transform:scale(.9);transform-origin:top left}
  .worldEquip,.worldDev,.worldDefis{transform-origin:top right}
  .worldMenu{bottom:4px}
  .homeForge{padding-top:6px!important;padding-bottom:6px!important}
}
'''

for old,new in [(BUILD_OLD,BUILD_NEW)]:
    g2=g2.replace(old,new)
    idx=idx.replace(old,new)

home=g4[g4.find('function scrAccueil()'):g4.find('/* ---------------- PERSONNAGE')]
assert 'CAMPAIGN_WORLD_NAV_V37' in g4
assert 'worldRebirth' in g4 and 'go:"rebirth"' in g4
assert 'progressionGoalHTML(S) +' not in home
assert 'CAMPAIGN_WORLD_NAV_V37' in css
assert BUILD_NEW in g2 and BUILD_NEW in idx

g4p.write_text(g4); cssp.write_text(css); g2p.write_text(g2); idxp.write_text(idx)
print('Campaign world navigation v37 applied')