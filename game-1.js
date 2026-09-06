/* Art lives in art/ as real files rather than base64 blobs: the browser can
   cache it separately from the code, and adding a sprite is a file drop.
   Any key missing from disk simply renders nothing, so partial sets are safe. */
const ASSETS = {
  hero:            "art/hero.png",
  enemy_goblin_attack1:      "art/frames/enemy_goblin_attack1.png",
  enemy_goblin_attack2:      "art/frames/enemy_goblin_attack2.png",
  enemy_orc_attack1:         "art/frames/enemy_orc_attack1.png",
  enemy_orc_attack2:         "art/frames/enemy_orc_attack2.png",
  enemy_skeleton_attack1:    "art/frames/enemy_skeleton_attack1.png",
  enemy_skeleton_attack2:    "art/frames/enemy_skeleton_attack2.png",
  enemy_mage_attack1:        "art/frames/enemy_mage_attack1.png",
  enemy_mage_attack2:        "art/frames/enemy_mage_attack2.png",
  elite_chevalier_attack1:   "art/frames/elite_chevalier_attack1.png",
  elite_chevalier_attack2:   "art/frames/elite_chevalier_attack2.png",
  elite_chaman_attack1:      "art/frames/elite_chaman_attack1.png",
  elite_chaman_attack2:      "art/frames/elite_chaman_attack2.png",
  elite_gardien_attack1:     "art/frames/elite_gardien_attack1.png",
  elite_gardien_attack2:     "art/frames/elite_gardien_attack2.png",
  elite_assassin_attack1:    "art/frames/elite_assassin_attack1.png",
  elite_assassin_attack2:    "art/frames/elite_assassin_attack2.png",
  elite_abyssal_attack1:     "art/frames/elite_abyssal_attack1.png",
  elite_abyssal_attack2:     "art/frames/elite_abyssal_attack2.png",
  boss_dragon_attack1:       "art/frames/boss_dragon_attack1.png",
  boss_dragon_attack2:       "art/frames/boss_dragon_attack2.png",
  elite_corrompue_attack1:   "art/frames/elite_corrompue_attack1.png",
  elite_corrompue_attack2:   "art/frames/elite_corrompue_attack2.png",
  elite_guerre_attack1:        "art/frames/elite_guerre_attack1.png",
  elite_guerre_attack2:        "art/frames/elite_guerre_attack2.png",
  elite_demoniaque_attack1:    "art/frames/elite_demoniaque_attack1.png",
  elite_demoniaque_attack2:    "art/frames/elite_demoniaque_attack2.png",
  boss_chefgobelin_attack1:    "art/frames/boss_chefgobelin_attack1.png",
  boss_chefgobelin_attack2:    "art/frames/boss_chefgobelin_attack2.png",
  boss_ogre_attack1:           "art/frames/boss_ogre_attack1.png",
  boss_ogre_attack2:           "art/frames/boss_ogre_attack2.png",
  boss_squelette_attack1:      "art/frames/boss_squelette_attack1.png",
  boss_squelette_attack2:      "art/frames/boss_squelette_attack2.png",
  hero_attack1:                "art/frames/hero_attack1.png",
  hero_attack2:                "art/frames/hero_attack2.png",
  hero_attack3:                "art/frames/hero_attack3.png",
  hero_attack4:                "art/frames/hero_attack4.png",
  raidboss_evolution_attack1:  "art/frames/raidboss_evolution_attack1.png",
  raidboss_evolution_attack2:  "art/frames/raidboss_evolution_attack2.png",

  /* scenery props, drawn into the arena's decor layer */
  prop_rock_moss:              "art/props/rock_moss.png",
  prop_boulder:                "art/props/boulder.png",
  prop_column:                 "art/props/column.png",
  prop_stump:                  "art/props/stump.png",
  prop_dead_tree:              "art/props/dead_tree.png",
  prop_crystal:                "art/props/crystal.png",
  prop_bones:                  "art/props/bones.png",
  prop_wall:                   "art/props/wall.png",
  prop_bush:                   "art/props/bush.png",
  prop_brazier:                "art/props/brazier.png",
  /* skill VFX: white-on-alpha sprites, used as CSS masks and tinted per skill */
  vfx_slash:                   "art/vfx/slash.png",
  vfx_impact:                  "art/vfx/impact.png",
  vfx_pierce:                  "art/vfx/pierce.png",
  vfx_bolt:                    "art/vfx/bolt.png",
  vfx_wave:                    "art/vfx/wave.png",
  vfx_vortex:                  "art/vfx/vortex.png",
  vfx_meteor:                  "art/vfx/meteor.png",
  vfx_cataclysm:               "art/vfx/cataclysm.png",
  vfx_aura:                    "art/vfx/aura.png",
  vfx_heal:                    "art/vfx/heal.png",
  vfx_curse:                   "art/vfx/curse.png",
  vfx_poison:                  "art/vfx/poison.png",
  vfx_spark:                   "art/vfx/spark.png",
  vfx_crit:                    "art/vfx/crit.png",
  vfx_death:                   "art/vfx/death.png",
  /* equipment slot icons, replacing the inline SVG glyphs */
  icon_arme:                   "art/icons/arme.png",
  icon_casque:                 "art/icons/casque.png",
  icon_armure:                 "art/icons/armure.png",
  icon_gants:                  "art/icons/gants.png",
  icon_bottes:                 "art/icons/bottes.png",
  // the accessory slot became Collier / Anneau / Ceinture; its art was a ring,
  // so the Anneau keeps it. The other two use vector glyphs for now.
  icon_anneau:                 "art/icons/accessoire.png",
  /* held weapons, one per type, and the three projectiles */
  weapon_epee:                 "art/weapons/epee.png",
  weapon_hache:                "art/weapons/hache.png",
  weapon_masse:                "art/weapons/masse.png",
  weapon_dague:                "art/weapons/dague.png",
  weapon_arc:                  "art/weapons/arc.png",
  weapon_arbalete:             "art/weapons/arbalete.png",
  weapon_baton:                "art/weapons/baton.png",
  proj_arrow:                  "art/weapons/proj_arrow.png",
  proj_bolt:                   "art/weapons/proj_bolt.png",
  proj_magic:                  "art/weapons/proj_magic.png",
  /* one painted egg per rarity */
  egg_commun:                  "art/eggs/commun.png",
  egg_rare:                    "art/eggs/rare.png",
  egg_epique:                  "art/eggs/epique.png",
  egg_mythique:                "art/eggs/mythique.png",
  egg_legendaire:              "art/eggs/legendaire.png",
  egg_divin:                   "art/eggs/divin.png",
  /* painted home-screen navigation tiles */
  nav_personnage:              "art/nav/personnage.png",
  nav_raid:                    "art/nav/raid.png",
  nav_arbre:                   "art/nav/arbre.png",
  nav_clan:                    "art/nav/clan.png",
  nav_boutique:                "art/nav/boutique.png",
  nav_familiers:               "art/nav/familiers.png",
  nav_ascension:               "art/nav/ascension.png",
  nav_rebirth:                 "art/nav/rebirth.png",
  nav_evenement:               "art/nav/evenement.png",
  nav_classement:              "art/nav/classement.png",
  /* skill-tree node pieces: greyscale, tinted per state and category */
  tree_ring:                   "art/tree/ring.png",
  tree_plate:                  "art/tree/plate.png",
  tree_ring_max:               "art/tree/ring_max.png",
  tree_glow:                   "art/tree/glow.png",
  tree_plate_oct:              "art/tree/plate_oct.png",
  tree_ring_oct:               "art/tree/ring_oct.png",
  tree_lock:                   "art/tree/lock.png",
  tree_bead:                   "art/tree/bead.png",
  tree_banner:                 "art/ui/tree_banner.png",
  boss_golem_attack1:            "art/frames/boss_golem_attack1.png",
  boss_golem_attack2:            "art/frames/boss_golem_attack2.png",
  raidboss_or_attack1:           "art/frames/raidboss_or_attack1.png",
  raidboss_or_attack2:           "art/frames/raidboss_or_attack2.png",
  raidboss_minerai_attack1:      "art/frames/raidboss_minerai_attack1.png",
  raidboss_minerai_attack2:      "art/frames/raidboss_minerai_attack2.png",
  raidboss_competence_attack1:   "art/frames/raidboss_competence_attack1.png",
  raidboss_competence_attack2:   "art/frames/raidboss_competence_attack2.png",
  raidboss_familier_attack1:     "art/frames/raidboss_familier_attack1.png",
  raidboss_familier_attack2:     "art/frames/raidboss_familier_attack2.png",
  elite_chevalier:  "art/elite_chevalier.png",
  elite_chaman:     "art/elite_chaman.png",
  elite_gardien:    "art/elite_gardien.png",
  elite_assassin:   "art/elite_assassin.png",
  elite_corrompue:  "art/elite_corrompue.png",
  elite_abyssal:    "art/elite_abyssal.png",
  elite_guerre:     "art/elite_guerre.png",
  elite_demoniaque: "art/elite_demoniaque.png",
  boss_chefgobelin: "art/boss_chefgobelin.png",
  boss_ogre:        "art/boss_ogre.png",
  boss_squelette:   "art/boss_squelette.png",
  boss_golem:       "art/boss_golem.png",
  boss_dragon:      "art/boss_dragon.png",
  raidboss_or:         "art/raidboss_or.png",
  raidboss_minerai:    "art/raidboss_minerai.png",
  raidboss_competence: "art/raidboss_competence.png",
  raidboss_familier:   "art/raidboss_familier.png",
  raidboss_evolution:  "art/raidboss_evolution.png",
  pet_dragonnet_normal:     "art/pet_dragonnet_normal.png",
  pet_dragonnet_feu:        "art/pet_dragonnet_feu.png",
  pet_dragonnet_glace:      "art/pet_dragonnet_glace.png",
  pet_dragonnet_electrique: "art/pet_dragonnet_electrique.png",
  pet_dragonnet_toxique:    "art/pet_dragonnet_toxique.png",
  pet_loup_normal:          "art/pet_loup_normal.png",
  pet_loup_feu:             "art/pet_loup_feu.png",
  pet_loup_glace:           "art/pet_loup_glace.png",
  pet_loup_electrique:      "art/pet_loup_electrique.png",
  pet_loup_toxique:         "art/pet_loup_toxique.png",
  pet_felin_normal:         "art/pet_felin_normal.png",
  pet_felin_feu:            "art/pet_felin_feu.png",
  pet_felin_glace:          "art/pet_felin_glace.png",
  pet_felin_electrique:     "art/pet_felin_electrique.png",
  pet_felin_toxique:        "art/pet_felin_toxique.png",
  pet_oiseau_normal:        "art/pet_oiseau_normal.png",
  pet_oiseau_feu:           "art/pet_oiseau_feu.png",
  pet_oiseau_glace:         "art/pet_oiseau_glace.png",
  pet_oiseau_electrique:    "art/pet_oiseau_electrique.png",
  pet_oiseau_toxique:       "art/pet_oiseau_toxique.png",
  enemy_orc:       "art/enemy_orc.png",
  enemy_mage:      "art/enemy_mage.png",
  enemy_goblin:    "art/enemy_goblin.png",
  enemy_skeleton:  "art/enemy_skeleton.png",
};
/* =========================================================================
   SHADOWREACH — single-file port of the Expo/React-Native game.
   Ported from frontend/src/game/{config,state}.ts, GameContext.tsx,
   src/ui/{theme,CombatArena}.tsx and the app/ screens.
   Save data lives in localStorage (no backend), key: shadowreach.save.local
   ========================================================================= */
"use strict";

/* ---------------------------- theme.ts ---------------------------- */
const RARITY = {
  COMMUN:     { c: "#9FB0C8", label: "Commun" },
  PEU_COMMUN: { c: "#57C785", label: "Peu commun" },
  RARE:       { c: "#3FA7FF", label: "Rare" },
  EPIQUE:     { c: "#B15CF6", label: "Épique" },
  MYTHIQUE:   { c: "#FF7A3D", label: "Mythique" },
  /* HEROIQUE / ANCESTRAL restent lisibles uniquement pour migrer les anciennes sauvegardes. */
  HEROIQUE:   { c: "#FF4D6A", label: "Héroïque" },
  ANCESTRAL:  { c: "#3FE0C0", label: "Ancestral" },
  ARTEFACT:   { c: "#43C98B", label: "Artefact" },
  LEGENDAIRE: { c: "#F5C542", label: "Légendaire" },
  INFERNAL:   { c: "#E5484D", label: "Infernal" },
  IMMORTEL:   { c: "#D96CFF", label: "Immortel" },
  DIVIN:      { c: "#FFB52E", label: "Divin" },
};
/* Core ladder — used by Skills. Familiars use their own ladder below. */
const RARITY_ORDER = ["COMMUN", "RARE", "EPIQUE", "MYTHIQUE", "LEGENDAIRE", "DIVIN"];
const PET_RARITY_ORDER = ["COMMUN", "PEU_COMMUN", "RARE", "EPIQUE", "MYTHIQUE", "LEGENDAIRE", "DIVIN"];
/* EQUIPMENT has its own, longer ladder with Héroïque and Ancestral inserted
   between Mythique and Légendaire. Only gear ever rolls these two. */
/* what each quarter of its health buys it */
const MUTATION_LABEL = ["MUTATION · CÉLÉRITÉ", "MUTATION · CARAPACE", "MUTATION · REPRÉSAILLES"];
/* The filter's default: every rarity kept. Declared beside the order it reads
   so the two can never drift apart. */
function forgeKeepAll() {
  const o = {};
  EQUIP_RARITY_ORDER.forEach((r) => { o[r] = true; });
  return o;
}
const EQUIP_RARITY_ORDER = ["COMMUN", "RARE", "EPIQUE", "MYTHIQUE", "ARTEFACT", "LEGENDAIRE", "INFERNAL", "IMMORTEL", "DIVIN"];
function orderFor(system) { return system === "forge" ? EQUIP_RARITY_ORDER : system === "pet" ? PET_RARITY_ORDER : RARITY_ORDER; }
function equipRank(rarity) { return EQUIP_RARITY_ORDER.indexOf(rarity); }
const C = {
  gold: "#E8B44A", purple: "#9B5CF6", red: "#E5484D", green: "#3FB950",
  blue: "#4A90D9", cyan: "#3FCFD6", exp: "#4A90D9",
  text: "#EDE9F5", textDim: "#A79FBC", textMute: "#6E6785",
};

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return "0";
  const neg = n < 0; n = Math.abs(n);
  let s;
  if (n < 1000) s = String(Math.floor(n));
  else {
    const units = ["", "K", "M", "b", "t", "q", "Q", "s", "S"];
    let i = 0;
    while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
    s = (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : String(Math.floor(n))) + units[i];
  }
  return neg ? "-" + s : s;
}
function fmtEquipStat(v) {
  const n = Number(v) || 0;
  if (Number.isInteger(n)) return fmt(n);
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTime(secs) {
  secs = Math.max(0, Math.floor(secs));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  if (h >= 24) return Math.floor(h / 24) + "j " + String(h % 24).padStart(2, "0") + "h";
  if (h > 0) return h + "h " + m + "m";
  if (m > 0) return m + "m " + s + "s";
  return s + "s";
}
function fmtDur(secs) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
  if (h >= 24) return Math.floor(h / 24) + "j " + String(h % 24).padStart(2, "0") + "h";
  return h > 0 ? h + "h " + m + "min" : m + "min";
}
// darken/lighten a hex colour (port of components.tsx `shade`)
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v + (pct / 100) * 255)));
  return "#" + [cl(n >> 16), cl((n >> 8) & 255), cl(n & 255)]
    .map((v) => v.toString(16).padStart(2, "0")).join("");
}

/* ---------------------------- icon atlas ----------------------------------
   Vector replacements for the emoji set, drawn to the art-direction sheet:
   saturated gem-cut shapes, one highlight facet, no raster dependency.
   Every glyph is authored on a 24x24 grid so it stays crisp at any size.
   -------------------------------------------------------------------------- */
const ICO = {
  /* --- currencies & resources (sheet §9) --- */
  gold:'<circle cx="12" cy="12.6" r="8.6" fill="#7A5411"/><circle cx="12" cy="11.6" r="8.2" fill="#E8B44A"/><circle cx="12" cy="11.6" r="5.4" fill="#C8901F"/><circle cx="12" cy="11.6" r="4.2" fill="#FBDD8C"/><path d="M6.4 7.6A8 8 0 0 1 16.6 5.4 9 9 0 0 0 5.2 10Z" fill="#fff" opacity=".5"/>',
  gem:'<path d="M12 1.6 21 9l-9 13.4L3 9Z" fill="#8C1440"/><path d="M12 2.6 19.7 9 12 21 4.3 9Z" fill="#FF4D8D"/><path d="M12 2.6 19.7 9H4.3Z" fill="#FF9BC1"/><path d="M12 2.6 15.6 9 12 21 8.4 9Z" fill="#FFD3E5" opacity=".65"/>',
  minerai:'<path d="M4 14.5 8 6h8l4 8.5-8 7.5Z" fill="#173A63"/><path d="M5.4 14 8.8 6.8h6.4L18.6 14 12 20.2Z" fill="#4A90D9"/><path d="M8.8 6.8h6.4L12 13Z" fill="#BFE0FF"/><path d="M5.4 14 12 13l-6.6 1Z" fill="#93C6FF"/><path d="M12 13 18.6 14 12 20.2Z" fill="#2C6BAA"/>',
  poussiere:'<path d="M12 2 13.9 9.3 21 11.5l-7.1 2.2L12 21l-1.9-7.3L3 11.5l7.1-2.2Z" fill="#9B5CF6"/><path d="M12 5.6 13.1 10.6 18 11.5l-4.9 1.1L12 17l-1.1-4.4L6 11.5l4.9-.9Z" fill="#E3CEFF"/><circle cx="19.4" cy="5" r="1.5" fill="#C79BFF"/><circle cx="5" cy="18.4" r="1.2" fill="#C79BFF"/>',
  eclat:'<path d="M12 2 19 6.5v11L12 22 5 17.5v-11Z" fill="#41236F"/><path d="M12 3.4 17.7 7.2v9.6L12 20.6 6.3 16.8V7.2Z" fill="#9B5CF6"/><path d="M12 3.4 17.7 7.2 12 10.8 6.3 7.2Z" fill="#D9BCFF"/><path d="M12 10.8v9.8l-5.7-3.8V7.2Z" fill="#7B41D6" opacity=".8"/>',
  essence:'<path d="M9 2h6v3.4l3.2 9.4A4.2 4.2 0 0 1 14.2 21H9.8a4.2 4.2 0 0 1-4-6.2L9 5.4Z" fill="#5E2A0C"/><path d="M9.9 3h4.2v2.6l3 8.8a3.2 3.2 0 0 1-3 4.6H9.9a3.2 3.2 0 0 1-3-4.6l3-8.8Z" fill="#2A1608"/><path d="M8.2 12.6h7.6l1.4 4a2.6 2.6 0 0 1-2.5 3.4H9.3a2.6 2.6 0 0 1-2.5-3.4Z" fill="#FF7A3D"/><path d="M8.6 14.4h6.8l.4 1.2H8.2Z" fill="#FFC29B" opacity=".8"/><rect x="8.4" y="1.4" width="7.2" height="2.2" rx="1.1" fill="#C4711E"/>',
  key:'<circle cx="8" cy="8" r="5.4" fill="#8A6522"/><circle cx="8" cy="8" r="4" fill="#E8B44A"/><circle cx="8" cy="8" r="1.7" fill="#0B1220"/><path d="M11.4 11.4 20 20l-1.6 1.6-1.8-1.8-1.5 1.5-1.6-1.6 1.5-1.5-1.4-1.4-1.5 1.5-1.6-1.6 1.5-1.5-1.7-1.7Z" fill="#E8B44A"/><path d="M5.4 5.6a3.6 3.6 0 0 1 4.4-.9A4.4 4.4 0 0 0 4.6 8Z" fill="#FBDD8C"/>',
  pa:'<circle cx="12" cy="12" r="9.4" fill="#42300D"/><circle cx="12" cy="12" r="8" fill="#E8B44A"/><path d="M12 5.6 14 10.2l5 .4-3.8 3.3 1.2 4.9L12 16.2l-4.4 2.6 1.2-4.9L5 10.6l5-.4Z" fill="#3A2A08"/><path d="M12 6.8 13.6 10.6l4 .3-3 2.6.9 3.9L12 15.2Z" fill="#FFF0CB"/>',

  /* --- equipment slots (sheet §11) --- */
  sword:'<path d="m19.6 2.6-1.2 6L9.7 17.3l-3-3L15.4 5.6Z" fill="#C9D4E6"/><path d="m19.6 2.6-1.2 6-1.6-1.6 1.5-4.2Z" fill="#F2F6FF"/><path d="m8.6 13.2 2.2 2.2-4.2 4.2-2.2-2.2Z" fill="#8A6522"/><path d="m3.4 18.4 2.2 2.2-1.5 1.5-2.2-2.2Z" fill="#E8B44A"/><path d="m9.4 11 3.6 3.6-1.3 1.3-3.6-3.6Z" fill="#E8B44A"/>',
  helm:'<path d="M12 2.4c4.6 0 7.6 3.2 7.6 7.6v4.4l-2 1v3.4c0 1.6-2.4 2.8-5.6 2.8s-5.6-1.2-5.6-2.8v-3.4l-2-1V10c0-4.4 3-7.6 7.6-7.6Z" fill="#26344F"/><path d="M12 3.8c3.8 0 6.2 2.6 6.2 6.2v3.6l-1.8.9H7.6l-1.8-.9V10c0-3.6 2.4-6.2 6.2-6.2Z" fill="#5A7099"/><path d="M11 3.9C8.4 4.4 6.8 6.4 6.4 9.4L6 13.2 5.8 10c0-3.2 1.9-5.6 5.2-6.1Z" fill="#8CA3C9"/><path d="M11.2 8.6h1.6v6h-1.6Z" fill="#0B1220"/><path d="M8.4 15.6h7.2v2.2c0 .9-1.6 1.6-3.6 1.6s-3.6-.7-3.6-1.6Z" fill="#3E5279"/>',
  armor:'<path d="M12 2.6 19.4 5v6.6c0 4.4-3 7.6-7.4 9.8-4.4-2.2-7.4-5.4-7.4-9.8V5Z" fill="#26344F"/><path d="M12 4 18 6v5.6c0 3.6-2.4 6.3-6 8.2-3.6-1.9-6-4.6-6-8.2V6Z" fill="#5A7099"/><path d="M12 4 18 6v1.6l-6-2-6 2V6Z" fill="#8CA3C9"/><path d="M12 8.2 15 10v3.4L12 16l-3-2.6V10Z" fill="#E8B44A"/><path d="M12 9.4 13.8 10.6v2.2L12 14.2Z" fill="#FBDD8C"/>',
  glove:'<path d="M6.4 9.4V5.6a1.7 1.7 0 0 1 3.4 0v3.2h.8V4a1.7 1.7 0 0 1 3.4 0v4.8h.8V5.6a1.6 1.6 0 0 1 3.2 0v7.6c0 4.4-2.4 7.8-6.2 7.8s-6-2.8-6-6.6V9.4Z" fill="#3E5279"/><path d="M7.8 9.6V6a.6.6 0 0 1 1.2 0v4h2.4V4.4a.6.6 0 0 1 1.2 0V10h2.4V6a.5.5 0 0 1 1 0v7.2c0 3.6-1.8 6.4-5 6.4s-4.8-2.2-4.8-5.4V9.6Z" fill="#6D85AD"/><path d="M6.8 14.4h9.8v2.2H6.6Z" fill="#E8B44A"/>',
  boot:'<path d="M6.4 2.6h4.4v8.2h3.4c3 0 5.4 2.4 5.4 5.4v3.2c0 1.2-1 2-2.2 2H6.4c-1.3 0-2.2-.8-2.2-2Z" fill="#2A1608"/><path d="M7.6 3.8h2v8.2h4.6c2.3 0 4.2 1.9 4.2 4.2v1.4H7.6Z" fill="#7A4A22"/><path d="M7.6 3.8h2v3.4h-2Z" fill="#A5703B"/><path d="M4.2 18.2h15.4v1.6c0 1.2-1 2-2.2 2H6.4c-1.3 0-2.2-.8-2.2-2Z" fill="#E8B44A"/>',
  ring:'<ellipse cx="12" cy="14.6" rx="6.6" ry="6.4" fill="#8A6522"/><ellipse cx="12" cy="14.6" rx="4.6" ry="4.4" fill="#0F1A2C"/><path d="M12 2.4 16.4 6.6 12 11.6 7.6 6.6Z" fill="#3FCFD6"/><path d="M12 2.4 16.4 6.6H7.6Z" fill="#B9F7FA"/><path d="M6.2 12a6.4 6.4 0 0 1 4.2-3.6A7.6 7.6 0 0 0 5.6 14Z" fill="#FBDD8C" opacity=".8"/>',

  /* --- navigation & systems (sheet §7) --- */
  castle:'<path d="M2.6 21V8.6h2.6V5.4h2.6v3.2h2.6V5.4h2.6v3.2h2.6V5.4h2.6v3.2h2.2V21Z" fill="#26344F"/><path d="M4 19.6V10h16v9.6Z" fill="#4A6494"/><path d="M9.4 13h5.2v6.6H9.4Z" fill="#101A2C"/><path d="M12 14.2a1.6 1.6 0 0 1 1.6 1.6v3.8h-3.2v-3.8A1.6 1.6 0 0 1 12 14.2Z" fill="#E8B44A"/><path d="M5.4 12.4h2.4v2.4H5.4Zm10.8 0h2.4v2.4h-2.4Z" fill="#8CA3C9"/><path d="M12 1.4 13.4 4h-2.8Z" fill="#E8B44A"/>',
  swords:'<path d="M4.6 3 3 4.6l9 9 1.6-1.6Z" fill="#C9D4E6"/><path d="M19.4 3 21 4.6l-9 9-1.6-1.6Z" fill="#8CA3C9"/><path d="M8.8 14.4 12 11.2l3.2 3.2L12 22Z" fill="#E8B44A"/><path d="M12 11.2 15.2 14.4 12 22Z" fill="#C8901F"/><path d="M4.6 3 8 4l-.6 2.4L6 5Z" fill="#F2F6FF"/>',
  book:'<path d="M3.6 4.4c2.8-1.4 5.6-1.4 8.4 0v15c-2.8-1.4-5.6-1.4-8.4 0Z" fill="#173A63"/><path d="M20.4 4.4c-2.8-1.4-5.6-1.4-8.4 0v15c2.8-1.4 5.6-1.4 8.4 0Z" fill="#26558C"/><path d="M4.8 6.2c2.2-.9 4.4-.9 6.4 0v11.4c-2-.9-4.2-.9-6.4 0Z" fill="#4A90D9" opacity=".55"/><path d="M15.8 2.4 17 6l3.6 1.2L17 8.4l-1.2 3.6-1.2-3.6L11 7.2 14.6 6Z" fill="#FBDD8C"/>',
  bag:'<path d="M4.4 8h15.2l1 12.6H3.4Z" fill="#5E2A0C"/><path d="M5.6 9.4h12.8l.8 9.8H4.8Z" fill="#A5703B"/><path d="M8 9V6.4a4 4 0 0 1 8 0V9h-2.2V6.4a1.8 1.8 0 0 0-3.6 0V9Z" fill="#E8B44A"/><path d="M4.9 12.4h14.2l.2 2.4H4.7Z" fill="#7A4A22"/><circle cx="12" cy="13.6" r="1.6" fill="#FBDD8C"/>',
  gear:'<path d="m9.8 2.4h4.4l.6 2.6 2 1.2 2.6-.7 2.2 3.8-2 1.8v2.3l2 1.8-2.2 3.8-2.6-.7-2 1.2-.6 2.6H9.8l-.6-2.6-2-1.2-2.6.7-2.2-3.8 2-1.8v-2.3l-2-1.8 2.2-3.8 2.6.7 2-1.2Z" fill="#3E5279"/><circle cx="12" cy="12" r="5" fill="#101A2C"/><circle cx="12" cy="12" r="3.4" fill="#8CA3C9"/><path d="M9.8 2.4h2.4l-.4 2.8-2 .4Z" fill="#B9C8E2"/>',
  flame:'<path d="M12 1.6c4.4 4.2 7.4 7.6 7.4 12A7.4 7.4 0 0 1 4.6 13.6C4.6 9.2 7.6 5.8 12 1.6Z" fill="#8C2A08"/><path d="M12 4.6c3.2 3.2 5.4 5.8 5.4 9A5.4 5.4 0 0 1 6.6 13.6c0-3.2 2.2-5.8 5.4-9Z" fill="#FF7A3D"/><path d="M12 10c1.6 1.8 2.6 3 2.6 4.6a2.6 2.6 0 0 1-5.2 0C9.4 13 10.4 11.8 12 10Z" fill="#FFE2A8"/>',
  banner:'<path d="M4.6 2h14.8v13.4L12 21.4 4.6 15.4Z" fill="#5E171B"/><path d="M6 3.4h12v11.4L12 19.6 6 14.8Z" fill="#C22127"/><path d="M6 3.4h12v2.2H6Z" fill="#E8B44A"/><path d="M12 7 13.4 10.2 17 10.6l-2.7 2.3.8 3.5L12 14.6 8.9 16.4l.8-3.5L7 10.6l3.6-.4Z" fill="#FBDD8C"/>',
  hammer:'<path d="M13.6 8.4 6 16l-1.4 4.8L9.4 19.4 17 11.8Z" fill="#7A4A22"/><path d="M13.6 9.8 8 15.4l-2 4.4 4.4-2 5.6-5.6Z" fill="#A5703B"/><path d="M12.4 2.6 21.4 11.6l-3 3-9-9Z" fill="#3E5279"/><path d="M13.4 3.6 20.4 10.6l-1.6 1.6-7-7Z" fill="#8CA3C9"/><path d="M12.4 2.6 15 5.2l-1.4 1.4-2.6-2.6Z" fill="#B9C8E2"/>',
  star:'<path d="M12 1.4 15 8.8l8 .6-6.1 5.2 1.9 7.8L12 18.2 5.2 22.4l1.9-7.8L1 9.4l8-.6Z" fill="#42300D"/><path d="M12 3 14.6 9.6l6.6.5-5 4.3 1.5 6.5L12 17.4l-5.7 3.5 1.5-6.5-5-4.3 6.6-.5Z" fill="#E8B44A"/><path d="M12 4.6 13.9 9.8l4.7.4-3.6 3.1.5 2.2L12 13.8Z" fill="#FFF0CB"/>',
  cycle:'<path d="M12 3.4a8.6 8.6 0 0 1 8.4 6.8l-2.6.6A6 6 0 0 0 12 6V3.4Z" fill="#C79BFF"/><path d="M20.6 8.6 22 13.4l-4.8-1.2Z" fill="#C79BFF"/><path d="M12 20.6A8.6 8.6 0 0 1 3.6 13.8l2.6-.6A6 6 0 0 0 12 18v2.6Z" fill="#9B5CF6"/><path d="M3.4 15.4 2 10.6l4.8 1.2Z" fill="#9B5CF6"/><circle cx="12" cy="12" r="3" fill="#E3CEFF"/>',
  gift:'<path d="M3 9.6h18V21H3Z" fill="#5E171B"/><path d="M4.4 11h15.2v8.6H4.4Z" fill="#C22127"/><path d="M2.4 6.4h19.2v4.2H2.4Z" fill="#E8B44A"/><path d="M10.2 6.4h3.6V21h-3.6Z" fill="#FBDD8C"/><path d="M12 6.4C10.4 3 8.6 2 7.2 2.6c-1.6.7-1.4 3 1 3.8Zm0 0C13.6 3 15.4 2 16.8 2.6c1.6.7 1.4 3-1 3.8Z" fill="#E8B44A"/>',
  chat:'<path d="M3 5.4h18v11H9.8L5.4 20.6v-4.2H3Z" fill="#26344F"/><path d="M4.4 6.8h15.2v8.2H9.2l-2.4 2.4V15H4.4Z" fill="#4A6494"/><circle cx="8.6" cy="11" r="1.3" fill="#B9C8E2"/><circle cx="12" cy="11" r="1.3" fill="#B9C8E2"/><circle cx="15.4" cy="11" r="1.3" fill="#B9C8E2"/>',
  lock:'<path d="M7 10V7.4a5 5 0 0 1 10 0V10h-2.4V7.4a2.6 2.6 0 0 0-5.2 0V10Z" fill="#8CA3C9"/><path d="M4.6 10h14.8v11.4H4.6Z" fill="#3E5279"/><path d="M6 11.4h12v8.6H6Z" fill="#26344F"/><circle cx="12" cy="14.6" r="1.8" fill="#E8B44A"/><path d="M11.2 15.6h1.6l.5 3h-2.6Z" fill="#E8B44A"/>',
  plus:'<path d="M10.4 3.6h3.2v6.8h6.8v3.2h-6.8v6.8h-3.2v-6.8H3.6v-3.2h6.8Z" fill="#6A7B9C"/>',
  check:'<path d="M9.6 18.6 3 12l2.4-2.4 4.2 4.2L18.6 4.8 21 7.2Z" fill="#3FB950"/>',
  cross:'<path d="M5.6 3.4 12 9.8l6.4-6.4 2.2 2.2L14.2 12l6.4 6.4-2.2 2.2L12 14.2l-6.4 6.4-2.2-2.2L9.8 12 3.4 5.6Z" fill="#E5484D"/>',
  chevron:'<path d="M8.6 3.8 17 12l-8.4 8.2-2.2-2.2L12.6 12 6.4 6Z" fill="#6A7B9C"/>',
  back:'<path d="M15.4 3.8 7 12l8.4 8.2 2.2-2.2L11.4 12l6.2-6Z" fill="#A3B2CE"/>',
  menu:'<path d="M3.4 5h17.2v2.8H3.4Zm0 5.6h17.2v2.8H3.4Zm0 5.6h17.2V19H3.4Z" fill="#A3B2CE"/>',

  /* --- stats & skills (sheet §10) --- */
  heart:'<path d="M12 21.4C6.4 17.2 2.4 13.8 2.4 9.4A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.6 3.4c0 4.4-4 7.8-9.6 12Z" fill="#7A1216"/><path d="M12 19.4C7.4 15.8 4.2 13 4.2 9.6A3.8 3.8 0 0 1 12 7.6a3.8 3.8 0 0 1 7.8 2c0 3.4-3.2 6.2-7.8 9.8Z" fill="#E5484D"/><path d="M7.4 8c1-.8 2.4-.9 3.4-.2-1.8.2-3 1.4-3.4 3.2Z" fill="#FFB6B8" opacity=".9"/>',
  bolt:'<path d="M13.6 1.4 5 13.4h5l-1.4 9.2L19 9.8h-5.2Z" fill="#8A6522"/><path d="M13.2 3 6.8 12.4h4.6l-1 6.6 6.8-9.2h-4.6Z" fill="#F5C542"/><path d="M13.2 3 11.4 8l-2.6 4h1.8Z" fill="#FFF0CB"/>',
  shield:'<path d="M12 1.8 20.6 4.6v7.2c0 4.6-3.4 8.2-8.6 10.4-5.2-2.2-8.6-5.8-8.6-10.4V4.6Z" fill="#173A63"/><path d="M12 3.4 19.2 5.6v6.2c0 3.8-2.8 6.9-7.2 8.8-4.4-1.9-7.2-5-7.2-8.8V5.6Z" fill="#4A90D9"/><path d="M12 3.4v17.2c-4.4-1.9-7.2-5-7.2-8.8V5.6Z" fill="#93C6FF" opacity=".5"/><path d="M12 7 13.6 10.4 17 10.8l-2.6 2.2.8 3.4L12 14.6 8.8 16.4l.8-3.4L7 10.8l3.4-.4Z" fill="#FBDD8C"/>',
  skull:'<path d="M12 2c5 0 8.4 3.4 8.4 8 0 2.8-1.2 4.6-2.6 5.8v2.4c0 1.4-1.2 2.4-2.6 2.4H8.8c-1.4 0-2.6-1-2.6-2.4v-2.4C4.8 14.6 3.6 12.8 3.6 10c0-4.6 3.4-8 8.4-8Z" fill="#3E5279"/><path d="M12 3.4c4.2 0 7 2.8 7 6.6 0 2.4-1 4-2.4 5v2.6H7.4v-2.6C6 14 5 12.4 5 10c0-3.8 2.8-6.6 7-6.6Z" fill="#C9D4E6"/><ellipse cx="8.8" cy="10.4" rx="2.1" ry="2.4" fill="#0B1220"/><ellipse cx="15.2" cy="10.4" rx="2.1" ry="2.4" fill="#0B1220"/><path d="M11.2 13.6h1.6l-.8 2.4Z" fill="#0B1220"/><path d="M8.4 17.4h1.4v3.2H8.4Zm2.9 0h1.4v3.2h-1.4Zm2.9 0h1.4v3.2h-1.4Z" fill="#8CA3C9"/>',
  spiral:'<path d="M12 2.4a9.6 9.6 0 1 1-9.6 9.6h3.2A6.4 6.4 0 1 0 12 5.6Z" fill="#41236F"/><path d="M12 5.6a6.4 6.4 0 1 1-6.4 6.4h2.8A3.6 3.6 0 1 0 12 8.4Z" fill="#9B5CF6"/><path d="M12 8.4a3.6 3.6 0 1 1-3.6 3.6h2.2A1.4 1.4 0 1 0 12 10.6Z" fill="#E3CEFF"/>',
  chain:'<path d="M6.6 17.4a4.6 4.6 0 0 1 0-6.5l2.6-2.6 2 2-2.6 2.6a1.8 1.8 0 0 0 0 2.5 1.8 1.8 0 0 0 2.5 0l2.6-2.6 2 2-2.6 2.6a4.6 4.6 0 0 1-6.5 0Z" fill="#12484C"/><path d="M17.4 6.6a4.6 4.6 0 0 1 0 6.5l-2.6 2.6-2-2 2.6-2.6a1.8 1.8 0 0 0 0-2.5 1.8 1.8 0 0 0-2.5 0l-2.6 2.6-2-2 2.6-2.6a4.6 4.6 0 0 1 6.5 0Z" fill="#3FCFD6"/><path d="m9.4 12.6 1.4-1.4 2.2 2.2-1.4 1.4Z" fill="#B9F7FA"/>',
  sparkle:'<path d="M12 1.4 14.2 8.6 21.4 11l-7.2 2.4L12 20.6 9.8 13.4 2.6 11l7.2-2.4Z" fill="#8A6522"/><path d="M12 4 13.6 9.4 19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-1.6Z" fill="#F5C542"/><path d="M12 6.4 13 10.2 16.6 11 13 11.8 12 15.6 11 11.8 7.4 11 11 10.2Z" fill="#FFF6DC"/><circle cx="19.6" cy="4.6" r="1.4" fill="#FBDD8C"/><circle cx="4.6" cy="18.4" r="1.1" fill="#FBDD8C"/>',
  slash:'<path d="M20.6 2.6C15.4 4 9.6 7.4 3.4 14l3 1.4C10.8 9.8 15.4 5.8 20.6 2.6Z" fill="#8C2A08"/><path d="M21.4 5.4C16 7.4 10.4 11.6 4.6 18.6l3.4.8C13 13.2 17.4 8.8 21.4 5.4Z" fill="#FF7A3D"/><path d="M20.4 9.6c-4.4 2.4-8.4 6-12 10.8l3.6-.4c3.2-4 6-7.4 8.4-10.4Z" fill="#FFC29B"/>',
  paw:'<ellipse cx="12" cy="15.4" rx="5.2" ry="4.4" fill="#FF7A3D"/><ellipse cx="5.6" cy="11.6" rx="2.5" ry="3" fill="#C4711E"/><ellipse cx="18.4" cy="11.6" rx="2.5" ry="3" fill="#C4711E"/><ellipse cx="9" cy="6.4" rx="2.5" ry="3.2" fill="#FF7A3D"/><ellipse cx="15" cy="6.4" rx="2.5" ry="3.2" fill="#FF7A3D"/><ellipse cx="11" cy="13.6" rx="2" ry="1.6" fill="#FFC29B" opacity=".7"/>',
  egg:'<ellipse cx="12" cy="13.6" rx="7.2" ry="8.4" fill="#8A6522"/><ellipse cx="12" cy="13.2" rx="6.4" ry="7.8" fill="#F5C542"/><path d="M8.4 7.4a6.6 6.6 0 0 1 3.4-1.8c-2.4 1-4 3.4-4.2 6.6Z" fill="#FFF0CB"/><path d="M6.4 14.6c1.4-1.2 2.6.8 4-.2s2.4 1.4 3.6.2 2.4.8 3.6-.4l-.2 2c-1.2 1-2.4-.6-3.6.4s-2.4-1-3.6.2-2.6-1-4 .2Z" fill="#C8901F" opacity=".75"/>',
  moon:'<path d="M14.4 2.4A9.6 9.6 0 1 0 21.6 15 7.6 7.6 0 0 1 14.4 2.4Z" fill="#173A63"/><path d="M13.6 4.6A7.6 7.6 0 1 0 19.4 14 6 6 0 0 1 13.6 4.6Z" fill="#4A90D9"/><path d="M9 7.4a5.4 5.4 0 0 0-2.2 6.2A6 6 0 0 1 9 7.4Z" fill="#BFE0FF" opacity=".8"/><circle cx="19" cy="4.6" r="1.3" fill="#FBDD8C"/>',
  cap:'<path d="M12 3 22.4 8.2 12 13.4 1.6 8.2Z" fill="#17411E"/><path d="M12 4.6 19.4 8.2 12 11.8 4.6 8.2Z" fill="#3FB950"/><path d="M5.6 10.2v4.6c0 2 2.9 3.4 6.4 3.4s6.4-1.4 6.4-3.4v-4.6L12 13.4Z" fill="#26344F"/><path d="M20.6 9.2v6.4l-1.6 3.6-1.6-3.6V9.9Z" fill="#E8B44A"/>',
  potion:'<path d="M9.4 2.4h5.2v3.4a6.6 6.6 0 1 1-5.2 0Z" fill="#26344F"/><path d="M10.6 3.6h2.8v3.2a5.2 5.2 0 1 1-2.8 0Z" fill="#101A2C"/><path d="M7.6 12.6a5.2 5.2 0 0 0 8.8 3.8 5.2 5.2 0 0 0 1.4-3.8Z" fill="#3FB950"/><ellipse cx="10.4" cy="15" rx="1.2" ry="1" fill="#A8F0B4" opacity=".8"/><rect x="8.6" y="1.4" width="6.8" height="2.2" rx="1.1" fill="#8CA3C9"/>',
  droplet:'<path d="M12 1.6c4 5 6.6 8 6.6 11.4A6.6 6.6 0 0 1 5.4 13C5.4 9.6 8 6.6 12 1.6Z" fill="#173A63"/><path d="M12 4.6c3 3.8 4.8 6 4.8 8.4a4.8 4.8 0 0 1-9.6 0c0-2.4 1.8-4.6 4.8-8.4Z" fill="#3FA7FF"/><path d="M9.6 11.4c.6-1.2 1.4-2.2 2-3-1.4 1.2-2.4 2.8-2.6 4.6Z" fill="#BFE0FF"/>',
  chart:'<path d="M3 19.4h18v2.2H3Z" fill="#3E5279"/><path d="M5 12.6h3.2v6.2H5Zm4.8-4.2H13v10.4H9.8Zm4.8-4.2h3.2v14.6h-3.2Z" fill="#3FB950"/><path d="M5 12.6h3.2v1.8H5Zm4.8-4.2H13v1.8H9.8Zm4.8-4.2h3.2V6H14.6Z" fill="#A8F0B4"/>',
  forward:'<path d="M2.6 4.6 12 12l-9.4 7.4Z" fill="#3FCFD6"/><path d="M12 4.6 21.4 12 12 19.4Z" fill="#B9F7FA"/>',
  cards:'<path d="M6.4 2.6h11.2v14.8H6.4Z" fill="#41236F" transform="rotate(-9 12 10)"/><path d="M7.6 4.4h9.6v13.2H7.6Z" fill="#9B5CF6"/><path d="M8.8 5.6h7.2v10.8H8.8Z" fill="#41236F"/><path d="M12 7 13.2 10 16 10.4l-2.1 1.8.7 2.8L12 13.6 9.4 15l.7-2.8L8 10.4l2.8-.4Z" fill="#E3CEFF"/>',
  tv:'<path d="M2.6 6.6h18.8v12.8H2.6Z" fill="#26344F"/><path d="M4 8h16v10H4Z" fill="#4A90D9"/><path d="M4 8h16l-16 10Z" fill="#93C6FF" opacity=".45"/><path d="M9.6 2.4 12 5.8l2.4-3.4 1.6 1.2-2.2 3h-3.6l-2.2-3Z" fill="#8CA3C9"/><path d="M6 20.4h12v1.6H6Z" fill="#3E5279"/>',
  save:'<path d="M3.4 3.4h13.2l4 4v13.2H3.4Z" fill="#173A63"/><path d="M7.4 3.4h8v6h-8Z" fill="#B9C8E2"/><path d="M12.4 4.6h2v3.6h-2Z" fill="#26344F"/><path d="M6.4 13h11.2v7.6H6.4Z" fill="#4A90D9"/><path d="M8 14.6h8v1.4H8Zm0 2.6h5.4v1.4H8Z" fill="#0F1A2C" opacity=".5"/>',
  upload:'<path d="M12 2.4 18 9h-4v7h-4V9H6Z" fill="#3FB950"/><path d="M3.6 17.4h16.8v4.2H3.6Z" fill="#3E5279"/><path d="M12 2.4 15 5.6h-6Z" fill="#A8F0B4"/>',
  download:'<path d="M10 2.4h4v7h4l-6 6.6L6 9.4h4Z" fill="#4A90D9"/><path d="M3.6 17.4h16.8v4.2H3.6Z" fill="#3E5279"/><path d="M10 2.4h4v4h-4Z" fill="#93C6FF"/>',
  trash:'<path d="M5.6 6.6h12.8l-1.2 15H6.8Z" fill="#5E171B"/><path d="M7 8h10l-1 12.2H8Z" fill="#C22127"/><path d="M9.4 10h1.6v8.4H9.4Zm3.6 0h1.6v8.4H13Z" fill="#5E171B"/><path d="M4 3.6h16v2.6H4Z" fill="#E5484D"/><path d="M9.4 1.6h5.2v2h-5.2Z" fill="#E5484D"/>',
  clock:'<circle cx="12" cy="12" r="9.6" fill="#26344F"/><circle cx="12" cy="12" r="8" fill="#4A6494"/><circle cx="12" cy="12" r="6.4" fill="#101A2C"/><path d="M11.2 6.4h1.6v6.4h-1.6Z" fill="#E8B44A"/><path d="M11.2 11.4h5.4v1.6h-5.4Z" fill="#FBDD8C"/>',
  plug:'<path d="M9 2.4h2.2v5H9Zm3.8 0H15v5h-2.2Z" fill="#8CA3C9"/><path d="M6.4 7.4h11.2v4.2a5.6 5.6 0 0 1-11.2 0Z" fill="#4A90D9"/><path d="M10.8 16.6h2.4v5h-2.4Z" fill="#8CA3C9"/><path d="M6.4 7.4h11.2v1.8H6.4Z" fill="#BFE0FF" opacity=".7"/>',
  crown:'<path d="M2.6 7 7 11l5-7.4 5 7.4 4.4-4-1.6 11.6H4.2Z" fill="#8A6522"/><path d="M4.6 8.8 7.4 11.4 12 5.6l4.6 5.8 2.8-2.6-1.2 8.4H5.8Z" fill="#E8B44A"/><path d="M12 5.6 14 8.4l-4 3Z" fill="#FBDD8C"/><path d="M4.6 18.6h14.8v2.6H4.6Z" fill="#C8901F"/>',
  blade:'<path d="M21 3q-9 1-15.5 9.5L3 21l8.5-2.5Q20 12 21 3Z" fill="#8C2A08"/><path d="M20 4.4Q12.6 5.6 7 12.8L5.2 19l6.2-1.8Q18.6 11.6 20 4.4Z" fill="#FF9C6B"/><path d="M20 4.4Q14 5.6 9.4 10.6l1.4 1.2Q15.6 7 20 4.4Z" fill="#FFE0CF"/>',
  pierce:'<path d="m20.8 3.2-9.6 9.6-2.4-2.4L18.4 1Z" fill="#C9D4E6"/><path d="m20.8 3.2-4.6 4.6-1.2-1.2 4.4-4.6Z" fill="#F2F6FF"/><path d="m9.6 11.2 3.2 3.2-2 2-3.2-3.2Z" fill="#8A6522"/><path d="m6.4 14.4 3.2 3.2L4 23l-2-2Z" fill="#FF6B4A"/><path d="M2.6 2.6 7 6.2 6.2 7 2.6 2.6Z" fill="#FF6B4A"/>',
  execute:'<path d="M4 2.6 9 4l9 9-4 4-9-9Z" fill="#7A1216"/><path d="M5 4.4 9.2 5.6l7.4 7.4-2 2L7.2 7.6Z" fill="#E5484D"/><path d="M15.6 15.6 21 21l-2 2-5.4-5.4Z" fill="#3E2010"/><circle cx="17.6" cy="6.4" r="3.4" fill="#C9D4E6"/><circle cx="16.4" cy="5.8" r="1" fill="#0B1220"/><circle cx="18.9" cy="5.8" r="1" fill="#0B1220"/>',
  wave:'<path d="M12 21a9 9 0 0 1 0-18 9 9 0 0 1 0 18Z" fill="none" stroke="#173A63" stroke-width="2.4"/><path d="M12 18.4A6.4 6.4 0 1 1 12 5.6a6.4 6.4 0 0 1 0 12.8Z" fill="none" stroke="#4A90D9" stroke-width="2.4"/><circle cx="12" cy="12" r="3.2" fill="#BFE0FF"/>',
  meteor:'<path d="M21.4 2.6 12 12l-1.6-1.6Z" fill="#FFE0B0"/><circle cx="9" cy="15" r="5.4" fill="#8C2A08"/><circle cx="9" cy="15" r="4" fill="#FF7A3D"/><circle cx="7.6" cy="13.6" r="1.6" fill="#FFE2A8"/><path d="M14.6 6.4 21 2.6l-3.6 6.6Zm2.2 5.2 4.6-2-2.4 4.4Z" fill="#FFB37A" opacity=".9"/>',
  power:'<path d="M6.4 10.4V6.6a1.8 1.8 0 0 1 3.6 0v3.2h.8V4.8a1.8 1.8 0 0 1 3.6 0v5h.8V6.6a1.7 1.7 0 0 1 3.4 0v7.2c0 4.4-2.6 7.8-6.4 7.8s-6.2-2.8-6.2-6.6v-4.6Z" fill="#17411E"/><path d="M7.8 10.6V7a.6.6 0 0 1 1.2 0v4h2.4V5.4a.6.6 0 0 1 1.2 0V11h2.4V7a.5.5 0 0 1 1 0v6.8c0 3.6-1.8 6.4-5 6.4s-4.8-2.2-4.8-5.4v-4.2Z" fill="#3FB950"/><path d="M6.8 14.6h9.8v2.2H6.6Z" fill="#A8F0B4"/>',
  haste:'<path d="M13.8 1.4 5.6 13h5.2l-1.4 9.6L19 10.2h-5.4Z" fill="#17411E"/><path d="M13.2 3.6 7.6 11.6h4.6l-1 6 5.6-7.6h-4.4Z" fill="#84E891"/><path d="M1.6 7h5v1.8h-5Zm0 4.6h3.4v1.8H1.6Zm0 4.6h4.4V18H1.6Z" fill="#3FB950" opacity=".85"/>',
  slow:'<path d="M6 2.4h12v3.2l-4 6.4 4 6.4v3.2H6v-3.2l4-6.4-4-6.4Z" fill="#41236F"/><path d="M7.6 4h8.8v1.2l-4.4 6.8 4.4 6.8V20H7.6v-1.2L12 12 7.6 5.2Z" fill="#8B6BD6"/><path d="M9.6 17.4h4.8L12 13.8Z" fill="#D9BCFF"/>',
  poison:'<circle cx="8" cy="14" r="4.4" fill="#4E7A14"/><circle cx="15.6" cy="16" r="3.4" fill="#4E7A14"/><circle cx="13" cy="9.6" r="3.8" fill="#5E9418"/><circle cx="8" cy="14" r="3" fill="#7ED321"/><circle cx="15.6" cy="16" r="2.3" fill="#7ED321"/><circle cx="13" cy="9.6" r="2.6" fill="#9BEF3F"/><circle cx="6.8" cy="12.6" r="1" fill="#D9FFA8"/><circle cx="12.2" cy="8.4" r="0.9" fill="#D9FFA8"/>',
  heal:'<path d="M9.4 2.6h5.2v6.8h6.8v5.2h-6.8v6.8H9.4v-6.8H2.6V9.4h6.8Z" fill="#12484C"/><path d="M10.6 3.8h2.8v6.8h6.8v2.8h-6.8v6.8h-2.8v-6.8H3.8v-2.8h6.8Z" fill="#3FE0C0"/><path d="M10.6 3.8h2.8v3h-2.8Z" fill="#B9FFF2"/>',
  regen:'<path d="M12 21.4C6.4 17.2 2.4 13.8 2.4 9.4A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.6 3.4c0 4.4-4 7.8-9.6 12Z" fill="#12484C"/><path d="M12 19.4C7.4 15.8 4.2 13 4.2 9.6A3.8 3.8 0 0 1 12 7.6a3.8 3.8 0 0 1 7.8 2c0 3.4-3.2 6.2-7.8 9.8Z" fill="#5CE8B0"/><path d="M10.9 8h2.2v2.8h2.8v2.2h-2.8v2.8h-2.2v-2.8H8.1v-2.2h2.8Z" fill="#0B2E24"/>',
  cataclysm:'<path d="M12 1 14.4 8 21.4 5.6 17.6 12l3.8 6.4L14.4 16 12 23l-2.4-7-7 2.4L6.4 12 2.6 5.6 9.6 8Z" fill="#8A6522"/><path d="M12 4.2 13.7 9.3 18.8 7.6 16 12l2.8 4.4-5.1-1.7L12 19.8l-1.7-5.1L5.2 16.4 8 12 5.2 7.6l5.1 1.7Z" fill="#F5C542"/><circle cx="12" cy="12" r="3.2" fill="#FFF6DC"/>',
  target:'<circle cx="12" cy="12" r="9.6" fill="#5E171B"/><circle cx="12" cy="12" r="7.4" fill="#F0F4FA"/><circle cx="12" cy="12" r="5.2" fill="#E5484D"/><circle cx="12" cy="12" r="3" fill="#F0F4FA"/><circle cx="12" cy="12" r="1.4" fill="#E5484D"/>',
};
/* inline an atlas glyph at the requested pixel size */
/* Painted replacements for the inline glyph atlas. ic() prefers art when it
   exists, so every one of the ~460 call sites upgrades without being touched;
   anything without art keeps its SVG glyph. */
const ICON_ART = {
  gold:       "art/ui/gold.png",
  gem:        "art/ui/gem.png",
  minerai:    "art/ui/minerai.png",
  poussiere:  "art/ui/poussiere.png",
  eclat:      "art/ui/eclat.png",
  essence:    "art/ui/essence.png",
  key:        "art/ui/key.png",
  pa:         "art/ui/pa.png",
  chart:      "art/ui/chart.png",
  gift:       "art/ui/gift.png",
  castle:     "art/ui/castle.png",
  swords:     "art/ui/swords.png",
  book:       "art/ui/book.png",
  bag:        "art/ui/bag.png",
  gear:       "art/ui/gear.png",
  heart:      "art/ui/heart.png",
  heal:       "art/ui/heart.png",
  haste:      "art/ui/bolt.png",
  sword:      "art/ui/sword.png",
  bolt:       "art/ui/bolt.png",
  shield:     "art/ui/shield.png",
  target:     "art/ui/target.png",
  slash:      "art/ui/slash.png",
  blade:      "art/ui/blade.png",
  pierce:     "art/ui/pierce.png",
  execute:    "art/ui/execute.png",
  spiral:     "art/ui/spiral.png",
  chain:      "art/ui/chain.png",
  wave:       "art/ui/wave.png",
  meteor:     "art/ui/meteor.png",
  power:      "art/ui/power.png",
};
const ICON_MASK = {
  cataclysm: { m: "cataclysm", c: "#F5C542" },
  sparkle:   { m: "crit",      c: "#F5C542" },   // four-point flare = a blessing
  // the death VFX is a spray of rising motes; tinted mint it reads as healing
  // over time, and it is never used as an icon anywhere else
  regen:     { m: "death",     c: "#5CE8B0" },
  poison:    { m: "poison",    c: "#7ED321" },
  skull:     { m: "curse",     c: "#B15CF6" },
  slow:      { m: "curse",     c: "#8B6BD6" },
};
/* every size in the game funnels through here, so scaling it scales the lot */
function px(n) { return "calc(" + n + "px * var(--s))"; }
function ic(name, size, style) {
  const s = px(size || 18);
  const mk = ICON_MASK[name];
  if (mk) {
    const u = "url(art/vfx/" + mk.m + ".png) center/contain no-repeat";
    return '<i class="ico" style="width:' + s + ";height:" + s + (style ? ";" + style : "") +
      '"><span style="display:block;width:100%;height:100%;background:' + mk.c +
      ";-webkit-mask:" + u + ";mask:" + u + '"></span></i>';
  }
  const art = ICON_ART[name];
  if (art) {
    return '<i class="ico" style="width:' + s + ";height:" + s + (style ? ";" + style : "") +
      '"><img src="' + art + '" style="width:100%;height:100%;object-fit:contain;display:block" alt=""></i>';
  }
  const g = ICO[name];
  if (!g) return '<i class="ico" style="width:' + s + ";height:" + s + '"></i>';
  return '<i class="ico" style="width:' + s + ";height:" + s + (style ? ";" + style : "") + '">' +
    '<svg width="100%" height="100%" viewBox="0 0 24 24" aria-hidden="true">' + g + "</svg></i>";
}

/* ---------------------------- environments --------------------------------
   The six biomes from the sheet's "environnements & decors" strip, now painted
   backdrops instead of layered vector art. Served as JPEG: they are fully
   opaque, so an alpha channel would only add weight.
   -------------------------------------------------------------------------- */
const SCENES = {
  env_forest:    "art/env_forest.jpg",     /* Foret Enchantee        */
  env_ruins:     "art/env_ruins.jpg",      /* Ruines Oubliees        */
  env_ice:       "art/env_ice.jpg",        /* Royaume Glace          */
  env_demon:     "art/env_demon.jpg",      /* Forteresse Demoniaque  */
  env_dragon:    "art/env_dragon.jpg",     /* Royaume du Dragon      */
  env_celestial: "art/env_celestial.jpg",  /* Royaume Celeste        */
};
const ENV_KEYS = ["env_forest", "env_ruins", "env_ice", "env_demon", "env_dragon", "env_celestial"];
const ENV_NAMES = {
  env_forest: "Forêt Enchantée", env_ruins: "Ruines Oubliées", env_ice: "Royaume Glacé",
  env_demon: "Forteresse Démoniaque", env_dragon: "Royaume du Dragon", env_celestial: "Royaume Céleste",
};
/* scenes first, then the original raster assets as a fallback */
function bgFor(key) { return SCENES[key] || ASSETS[key] || SCENES.env_forest; }

/* ---------------------------- config.ts ---------------------------- */
const SAVE_VERSION = 4;

const RULES = {
  STEPS_PER_FLOOR: 3, CHECKPOINT_EVERY: 5, ELITE_EVERY: 5, BOSS_EVERY: 10,
  MAX_LEVEL: 100, STAT_POINTS_PER_LEVEL: 5, REBIRTH_UNLOCK_FLOOR: 25,
  SKILL_SLOTS_BASE: 3, SKILL_SLOT_5_LEVEL: 100,
  RAID_UNLOCK_LEVEL: 5, CHAT_UNLOCK_LEVEL: 3, MAX_ENEMIES: 3,
  FORGE_MAX: 50, SKILL_MAX_LEVEL: 50, MASTERY_MAX: 50, EGG_SLOT_MAX: 5,
  RAID_MAX_LEVEL: 50, RAID_FREE_KEYS: 2, RAID_KEY_CAP: 6, RAID_ASCEND_MAX_STARS: 1,
  UNIVERSAL_KEY_DAILY: 3, UNIVERSAL_KEY_CAP: 6, AFK_BASE_HOURS: 8,
  WAR_POINTS_PER_PR: 30,
  FORGE_BATCH_BASE: 1, FORGE_BATCH_MAX: 10,
  // a fight is never resolved instantly, however overpowered the player is:
  // ENTRY = enemy walks in before anyone swings, HOLD = victory/defeat beat.
  FIGHT_ENTRY_MS: 420, FIGHT_HOLD_MS: 820,
  // clearing the last step of a floor gets a longer beat plus an on-screen
  // floor banner, so a post-Rebirth sprint stays readable instead of a blur
  FLOOR_CLEAR_MS: 700, FLOOR_FLASH_MS: 900,
  // Kept for the screen, which still tells you where a Rebirth would land you.
  // It is no longer a condition: section 4A gates on the current floor alone.
  REBIRTH_MIN_FLOOR_AFTER: 25,
};

const STATS = {
  SANTE:   { key: "sante",   label: "Santé",           perPoint: 20,  icon: "heart" },
  DEGATS:  { key: "degats",  label: "Dégâts",          perPoint: 2.2, icon: "flame" },
  CRIT:    { key: "crit",    label: "Chance Critique", perPoint: 0.2, icon: "bolt" },
  CRITRED: { key: "critred", label: "Réduc. Crit",     perPoint: 0.3, icon: "shield" },
};
const CRIT_CHANCE_CAP = 60, CRIT_RED_CAP = 80;
const SKILL_SUMMON_COST = 25;  // base cost per Compétence invocation; Tree reductions apply afterwards
const PET_SUMMON_COST = 25;    // fixed cost per Familier egg invocation
/* "Compétence Invoquer Coût" reduces the 25-Éclat base price. The tree is capped at 60%, so the absolute floor is 10 Éclats. */
function skillSummonCost(s) {
  return Math.max(1, Math.round(SKILL_SUMMON_COST *
    (1 - Math.min(60, Math.abs(treeSum(s || S, "skillCost"))) / 100)));
}
/* Combat pacing: slower movement gives melee/ranged encounters a clearer
   approach phase without changing damage, range or attack speed. */
const BASE = { hp: 100, damage: 12, attackSpeed: 0.9, moveSpeed: 16, critChance: 5, critMult: 1.5 };

/* ---------------------------- levelling ------------------------------------
   A level has to feel like an event, so the curve is deliberately slow and it
   keeps getting slower: every level costs 5.5% more than the last on top of a
   level^1.6 base.

   The old curve was piecewise and did the opposite of what it looked like. Up
   to level 30 it asked for less than one floor's worth of EXP per level, so
   levels arrived faster than floors did. Past level 60 it compounded at 1.16,
   which reached 271M for the last level -- roughly 9,900 floors, a wall rather
   than a climb. One smooth formula replaces both halves.
   -------------------------------------------------------------------------- */
function expToNext(level) {
  return Math.floor(60 * Math.pow(level, 1.6) * Math.pow(1.055, level));
}
/* ---------------------------- floor economy -------------------------------
   Floors are the MAIN PROGRESSION and only a small, steady trickle of gold.
   The bulk of gold comes from the Raid Or (see raidReward below), because gold
   is what pays for Forge level upgrades and it has to stay worth managing.

   The old curve compounded at 1.135 per floor past 25, which walled the player
   at ~floor 70-100 (15.6M HP at floor 100). It now compounds at 1.075, so the
   climb keeps flowing and only starts to bite again far later.
   -------------------------------------------------------------------------- */
const FLOOR_KNEE = 25;
/* A second knee. 1.075 compounding forever put floor 200 at 209.7M health
   against a realistic 316k of player damage -- red enemies were not hard, they
   were arithmetic walls. Past floor 90 the curve eases to 1.045, which keeps
   the deep floors punishing without putting them out of reach. */
const FLOOR_KNEE2 = 90, FLOOR_G1 = 1.075, FLOOR_G2 = 1.045;
function enemyHP(floor) {
  if (floor <= FLOOR_KNEE) return Math.floor(10 * Math.pow(floor, 1.30) + 12);
  const anchor = 10 * Math.pow(FLOOR_KNEE, 1.30) + 12;
  if (floor <= FLOOR_KNEE2) return Math.floor(anchor * Math.pow(FLOOR_G1, floor - FLOOR_KNEE));
  const mid = anchor * Math.pow(FLOOR_G1, FLOOR_KNEE2 - FLOOR_KNEE);
  return Math.floor(mid * Math.pow(FLOOR_G2, floor - FLOOR_KNEE2));
}
const FLOOR_DMG_G1 = 1.055, FLOOR_DMG_G2 = 1.035;
function enemyDamage(floor) {
  if (floor <= FLOOR_KNEE) return Math.floor(1.8 * Math.pow(floor, 1.10) + 2);
  const anchor = 1.8 * Math.pow(FLOOR_KNEE, 1.10) + 2;
  if (floor <= FLOOR_KNEE2) return Math.floor(anchor * Math.pow(FLOOR_DMG_G1, floor - FLOOR_KNEE));
  const mid = anchor * Math.pow(FLOOR_DMG_G1, FLOOR_KNEE2 - FLOOR_KNEE);
  return Math.floor(mid * Math.pow(FLOOR_DMG_G2, floor - FLOOR_KNEE2));
}
/* Campaign Gold economy. Floors 1-25 keep the original early curve.
   After floor 25, growth slows progressively at floors 300, 500 and 750.
   Elite floors pay +20%; Boss floors +40%. The Rebirth Gold bonus applies
   only when campaign Gold is awarded, not inside this base reward function. */
const GOLD_KNEE = 25;
/* Gold progression is intentionally tiered at deep floors so the economy keeps
   growing without an endless exponential explosion. The value is continuous
   across every knee: no tier resets the reward. Elite floors pay +20% and Boss
   floors +40% for every campaign enemy on that floor. */
function goldReward(floor) {
  const early = 0.8 * Math.pow(Math.min(floor, GOLD_KNEE), 0.72) + 3;
  if (floor <= GOLD_KNEE) return Math.floor(early);

  const at25 = 0.8 * Math.pow(GOLD_KNEE, 0.72) + 3;
  let value;
  if (floor <= 300) {
    value = at25 * Math.pow(1.02, floor - 25);
  } else {
    const at300 = at25 * Math.pow(1.02, 300 - 25);
    if (floor <= 500) {
      value = at300 * Math.pow(1.006, floor - 300);
    } else {
      const at500 = at300 * Math.pow(1.006, 500 - 300);
      if (floor <= 750) {
        value = at500 * Math.pow(1.001, floor - 500);
      } else {
        const at750 = at500 * Math.pow(1.001, 750 - 500);
        value = at750 * Math.pow(1.0005, floor - 750);
      }
    }
  }
  if (isBoss(floor)) value *= 1.40;
  else if (isElite(floor)) value *= 1.20;
  return Math.floor(value);
}
/* cut to roughly a third, and flattened, so deep floors cannot outrun the
   curve above. AFK EXP is derived from this, so it scales down with it. */
function expReward(floor)  { return Math.floor(4.5 * Math.pow(floor, 1.05) + 4); }
const ENEMY_SPEED = 22;

function isCheckpoint(f) { return f % RULES.CHECKPOINT_EVERY === 0; }
function isElite(f) { return f % RULES.ELITE_EVERY === 0 && f % RULES.BOSS_EVERY !== 0; }
function isBoss(f) { return f % RULES.BOSS_EVERY === 0; }
function lastCheckpoint(f) {
  return Math.floor((f - 1) / RULES.CHECKPOINT_EVERY) * RULES.CHECKPOINT_EVERY || 1;
}
function enemyCount(floor, step) {
  if (floor < 8) return 1;
  if (floor < 20) return step === 3 ? 2 : 1;
  if (floor < 45) return 1 + (step >= 2 ? 1 : 0);
  const r = (floor * 7 + step * 13) % 3;
  return Math.min(RULES.MAX_ENEMIES, 1 + r);
}

/* `proj` decides what a ranged enemy actually throws. It used to be inferred
   from the sprite name -- anything that was not enemy_mage fired an arrow --
   so a Mage Abyssal shot arrows. */
/* There is no fairy asset, so the Dragon's attendant borrows the smallest
   flying sprite the game owns and is drawn at half size with a cyan glow.
   Swap `img` here the day a real one exists. */
const FAIRY_TYPE = { id: "fee", name: "Fée", img: "pet_oiseau_glace",
  ranged: false, hpMul: 1, dmgMul: 0 };
const ENEMY_TYPES = [
  { id: "goblin",   name: "Gobelin",          img: "enemy_goblin",   ranged: false, hpMul: 0.9,  dmgMul: 0.95 },
  { id: "orc",      name: "Orc",              img: "enemy_orc",      ranged: false, hpMul: 1.2,  dmgMul: 1.1 },
  { id: "skeleton", name: "Archer Squelette", img: "enemy_skeleton", ranged: true,  proj: "arrow", hpMul: 0.8,  dmgMul: 1.0 },
  { id: "mage",     name: "Mage Noir",        img: "enemy_mage",     ranged: true,  proj: "magic", hpMul: 0.85, dmgMul: 1.15 },
];
/* ---------------------------- bestiary ------------------------------------
   Enemies now have a rarity tier, and elites / bosses have real identities
   instead of being "a normal enemy with more HP".

   Tier multipliers are centred on ~1.0 so the floor difficulty calibration
   still holds: a Commun is slightly softer than the old flat enemy, a Mythique
   noticeably harder, and rewards scale by the same factor.
   -------------------------------------------------------------------------- */
const ENEMY_TIERS = {
  COMMUN:     { label: "Commun",     c: "#9FB0C8", mul: 0.90 },
  RARE:       { label: "Rare",       c: "#3FA7FF", mul: 1.00 },
  EPIQUE:     { label: "Épique",     c: "#B15CF6", mul: 1.10 },
  LEGENDAIRE: { label: "Légendaire", c: "#F5C542", mul: 1.25 },
  MYTHIQUE:   { label: "Mythique",   c: "#FF4D6A", mul: 1.45 },
};
const ENEMY_TIER_ORDER = ["COMMUN", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"];
/* which tier band a floor sits in, with a chance to spawn one step above */
function enemyTierFor(floor) {
  const band = floor < 15 ? 0 : floor < 35 ? 1 : floor < 60 ? 2 : floor < 90 ? 3 : 4;
  const bump = Math.random() < 0.2 ? 1 : 0;
  return ENEMY_TIER_ORDER[Math.min(ENEMY_TIER_ORDER.length - 1, band + bump)];
}

/* Named elites — one per 5-floor elite step, cycling as you climb. */
/* `base` picks the stat profile, and it used to drag the attack behaviour along
   with it -- so the Chevalier Squelette, built on the archer for its stats, drew
   a sword and shot arrows. A Chaman stood in melee and an Assassin sniped from
   the back. Each elite now states how it fights, independently of whose numbers
   it borrows. */
const ELITE_DEFS = [
  { id: "chevalier",  name: "Chevalier Squelette", base: "skeleton", tier: "RARE",       img: "elite_chevalier",  ranged: false, ability: "garde" },
  { id: "chaman",     name: "Chaman Gobelin",      base: "goblin",   tier: "RARE",       img: "elite_chaman",     ranged: true,  proj: "magic", ability: "esprits" },
  { id: "gardien",    name: "Gardien de Pierre",   base: "orc",      tier: "EPIQUE",     img: "elite_gardien",    ranged: false, ability: "cristal" },
  { id: "assassin",   name: "Assassin des Ombres", base: "mage",     tier: "EPIQUE",     img: "elite_assassin",   ranged: false, ability: "ombre" },
  { id: "corrompue",  name: "Bête Corrompue",      base: "orc",      tier: "EPIQUE",     img: "elite_corrompue",  ranged: false, ability: "eclats" },
  { id: "abyssal",    name: "Mage Abyssal",        base: "mage",     tier: "LEGENDAIRE", img: "elite_abyssal",    ranged: true,  proj: "magic", ability: "orbes" },
  { id: "guerre",     name: "Bête de Guerre",      base: "orc",      tier: "LEGENDAIRE", img: "elite_guerre",     ranged: false, ability: "furie" },
  { id: "demoniaque", name: "Seigneur Démoniaque", base: "orc",      tier: "MYTHIQUE",   img: "elite_demoniaque", ranged: false, ability: "braise" },
];
/* Named floor bosses, rotating every 10 floors. */
const BOSS_DEFS = [
  { id: "chefgobelin", name: "Chef Gobelin",       img: "boss_chefgobelin", tier: "RARE",
    abils: ["tranchant", "saignee"] },
  { id: "ogre",        name: "Ogre Brute",         img: "boss_ogre",        tier: "EPIQUE",
    abils: ["pietinement", "dernierSouffle"] },
  { id: "squelette",   name: "Squelette Géant",    img: "boss_squelette",   tier: "EPIQUE",
    abils: ["absorption", "epines"] },
  { id: "golem",       name: "Golem de Fer",       img: "boss_golem",       tier: "LEGENDAIRE",
    abils: ["zoneBrulante", "bouclier"] },
  // a dragon that has to walk up and bite you is not a dragon
  { id: "dragon",      name: "Dragon des Cendres", img: "boss_dragon",      tier: "MYTHIQUE", ranged: true, proj: "magic",
    abils: ["souffle", "envol", "intimidation"] },
];
/* Raid bosses — one identity per raid. */
/* Raid bosses were spawned with a hard-coded ranged:false at every one of the
   three sites, so the Dragon Ancestral walked up to bite and the Lord
   Demoniaque swung his fists. They state how they fight here, like the floor
   bosses and the elites do. */
const RAID_BOSSES = {
  minerai:    { name: "Titan des Abysses",  tier: "LEGENDAIRE", img: "raidboss_minerai",
    abils: ["carapace", "regenCristal", "sismique"] },
  or:         { name: "Dragon Ancestral",   tier: "LEGENDAIRE", img: "raidboss_or",         ranged: true, proj: "magic",
    abils: ["souffleLave", "fee", "ailesCendre"] },
  competence: { name: "Lord Démoniaque",    tier: "MYTHIQUE",   img: "raidboss_competence", ranged: true, proj: "magic",
    abils: ["sceau", "lameArdente", "orbeInfernal"] },
  familier:   { name: "Bête Corrompue",     tier: "EPIQUE",     img: "raidboss_familier",
    abils: ["corruption", "bond", "meute"] },
  // It shared "Titan des Abysses" with the minerai boss while its art is a
  // tentacled, many-eyed thing in a crown -- two different bosses, one name.
  evolution:  { name: "Souverain du Vide",  tier: "MYTHIQUE",   img: "raidboss_evolution",
    abils: ["mutation", "regard", "etreinte"] },
};
/* Elite floors are always ODD multiples of 5 (the even ones are Boss floors),
   so indexing on floor/5 only ever reached half the roster. Count elite
   encounters instead: floors 5, 15, 25 ... map to 0, 1, 2 ... */
function eliteIndex(floor) { return Math.floor((floor - RULES.ELITE_EVERY) / RULES.BOSS_EVERY); }
function eliteFor(floor) { return ELITE_DEFS[Math.max(0, eliteIndex(floor)) % ELITE_DEFS.length]; }
function bossFor(floor) { return BOSS_DEFS[Math.floor(floor / RULES.BOSS_EVERY - 1) % BOSS_DEFS.length]; }
function typeById(id) { return ENEMY_TYPES.find((t) => t.id === id) || ENEMY_TYPES[0]; }


/* Only `speed` varied, so a Dague swung 1.5x as often as an Épée for identical
   damage and was simply the best weapon in the game. `hit` is the weight of one
   blow, set against the speed so the DPS lands in a narrow band and the choice
   is about feel and range rather than one right answer.

     Épée      1.00 x 1.00 = 1.00     Arc       1.05 x 0.90 = 0.95
     Hache     0.85 x 1.24 = 1.05     Arbalète  0.90 x 1.10 = 0.99
     Masse     0.80 x 1.35 = 1.08     Bâton     1.00 x 0.95 = 0.95
     Dague     1.50 x 0.70 = 1.05

   Melee sits about 8% above ranged because it has to walk into reach and stand
   in the enemy's swing to earn it. */
const WEAPON_TYPES = {
  epee:     { id: "epee",     name: "Épée",     attackType: "MELEE",  range: 46,  speed: 1.0,  hit: 1.00 },
  hache:    { id: "hache",    name: "Hache",    attackType: "MELEE",  range: 48,  speed: 0.85, hit: 1.24 },
  masse:    { id: "masse",    name: "Masse",    attackType: "MELEE",  range: 46,  speed: 0.8,  hit: 1.35 },
  dague:    { id: "dague",    name: "Dague",    attackType: "MELEE",  range: 42,  speed: 1.5,  hit: 0.70 },
  /* Section 19. The arena is 320 wide and the hero starts at 34, so a reach of
     210 to 240 covered everything that could ever be spawned: a bow was in
     range before it moved, every fight, and "portée" was a number with no
     consequence. Brought inside the arena, a ranged weapon still opens first
     and still opens from further than any enemy can answer -- it simply has to
     take up its position first. */
  arc:      { id: "arc",      name: "Arc",      attackType: "RANGED", range: 130, speed: 1.05, hit: 0.90, projectile: "arrow" },
  arbalete: { id: "arbalete", name: "Arbalète", attackType: "RANGED", range: 145, speed: 0.9,  hit: 1.10, projectile: "bolt" },
  baton:    { id: "baton",    name: "Bâton",    attackType: "RANGED", range: 120, speed: 1.0,  hit: 0.95, projectile: "magic" },
};
const WEAPON_LIST = Object.keys(WEAPON_TYPES);

/* Eight pieces, exactly the eight the design names. "accessoire" was one
   generic slot doing the work of Collier, Anneau and Ceinture, which left
   three tree families pointing at gear that did not exist. */
const SLOTS = ["arme", "casque", "armure", "gants", "bottes", "collier", "anneau", "ceinture"];
const SLOT_LABEL = { arme: "Arme", casque: "Casque", armure: "Armure", gants: "Gants",
  bottes: "Chaussures", collier: "Collier", anneau: "Anneau", ceinture: "Ceinture" };
/* An equipped weapon carries its own type, so the Arme slot has to show THAT
   weapon rather than a generic sword — a Bâton was being drawn as an épée
   everywhere in the inventory and on the equipment screen. */
function slotIcon(slot, size, item) {
  const a = (slot === "arme" && item && item.weaponType && ASSETS["weapon_" + item.weaponType])
    || ASSETS["icon_" + slot];
  return a ? '<img src="' + a + '" style="width:' + size + "px;height:" + size +
    'px;object-fit:contain;vertical-align:middle;display:inline-block">' : ic(SLOT_ICON[slot] || "sword", size);
}
/* Which stat each piece is built around -- section 14, verbatim. makeItem
   reads this table rather than repeating the split. */
const MASTERY_STAT = { arme: "dmg", gants: "dmg", collier: "dmg", anneau: "dmg",
  casque: "hp", armure: "hp", bottes: "hp", ceinture: "hp" };
const SLOT_ICON  = { arme: "sword", casque: "helm", armure: "armor", gants: "glove",
  bottes: "boot", collier: "gem", anneau: "ring", ceinture: "chain" };
/* La rareté porte surtout la STAT DE BASE. Les bonus secondaires restent fortement
   chevauchants afin qu'un excellent Mythique puisse battre les bonus d'un Infernal
   médiocre, tout en laissant l'Infernal très tentant grâce à sa base. */
const RARITY_MUL = { COMMUN: 1, RARE: 1.45, EPIQUE: 1.95, MYTHIQUE: 2.60,
  ARTEFACT: 3.45, LEGENDAIRE: 4.55, INFERNAL: 6.00, IMMORTEL: 7.90, DIVIN: 10.40,
  /* legacy */ HEROIQUE: 3.45, ANCESTRAL: 6.00 };

/* Section 18 brings the high rarities down. The ladder above Épique used to
   halve at each step, which at full Maîtrise handed out a Mythique every 8
   forges and an Ancestral every 33. Each tier is now 60 % as likely as the one
   below it instead of 50 %, which -- with the top of the ladder pinned -- pulls
   the middle down hard: a Mythique every 14 forges, an Héroïque every 24, an
   Ancestral every 40.

   Légendaire and Divin are left exactly as they were, because their odds are
   tied to Ascension and that is a later update's subject. Two consequences of
   holding them fixed, both deliberate. The freed probability goes to Commun
   rather than being spread, so the row still sums to 100 and the normalisation
   at the end of getRates cannot quietly raise Légendaire. And the gap between
   Ancestral and Légendaire narrows -- 40 forges against 67, where it was 33
   against 67 -- because pinning one end of a ladder while lowering the rest
   compresses what is next to it. */
const RATE_ANCHORS = {
  forge: {
    m0:  { COMMUN: 100, RARE: 0, EPIQUE: 0, MYTHIQUE: 0, ARTEFACT: 0, LEGENDAIRE: 0, INFERNAL: 0, IMMORTEL: 0, DIVIN: 0 },
    m50: { COMMUN: 35.0, RARE: 28, EPIQUE: 21, MYTHIQUE: 8, ARTEFACT: 4, LEGENDAIRE: 2.2, INFERNAL: 1.1, IMMORTEL: 0.7, DIVIN: 0 },
  },
  skill: {
    m0:  { COMMUN: 100,  RARE: 0,  EPIQUE: 0,  MYTHIQUE: 0,   LEGENDAIRE: 0, DIVIN: 0 },
    m50: { COMMUN: 29.7, RARE: 30, EPIQUE: 27, MYTHIQUE: 8.3, LEGENDAIRE: 5, DIVIN: 0 },
  },
  pet: {
    m0:  { COMMUN: 100, PEU_COMMUN: 0, RARE: 0, EPIQUE: 0, MYTHIQUE: 0, LEGENDAIRE: 0, DIVIN: 0 },
    m50: { COMMUN: 27, PEU_COMMUN: 29, RARE: 25, EPIQUE: 14, MYTHIQUE: 5, LEGENDAIRE: 0, DIVIN: 0 },
  },
};
function masteryReq(level) { return Math.round(5 + level * 1.6); }
/* Total paid summons needed to climb a fresh mastery ladder from 0 to max.
   `skillMastery.count` / `petMastery.count` reset on Ascension, so lifetime
   summon reconstruction must include completed ladders represented by stars. */
function masteryPaidToMax() {
  let total = 0;
  for (let level = 0; level < RULES.MASTERY_MAX; level++) total += masteryReq(level);
  return total;
}
function reconstructedPaidSummons(s, sys) {
  const cur = sys === "pet" ? s.petMastery : s.skillMastery;
  return Math.max(0, Number(cur && cur.count) || 0) +
    Math.max(0, starsOf(s, sys)) * masteryPaidToMax();
}

/* ---------------------------- Ascension de Maîtrise ------------------------
   Each of the three systems runs its own Maîtrise ladder. Topping it out lets
   the player Ascend: the ladder resets to 1, the system gains a star, and its
   BASE values are permanently multiplied. Stars are never lost.

   Two dials per system, both here so the whole thing can be retuned from one
   block: `statMul` is the permanent base multiplier a star grants (it
   compounds), and `headStart` is how much of the rarity ladder a star hands
   you back so Maîtrise 1 with a star beats Maîtrise 1 without one.

   headStart is deliberately capped: however many stars you hold, the last
   third of the rarity curve still has to be climbed. */
const ASCENSION = {
  /* Familiar stars control their own x1/x2/x3/x4 power and Legendary curve.
     They never unlock Divine: only the character's global Ascension does. */
  pet:   { key: "pet",   label: "Familier",   headStart: 0.22 },
  forge: { key: "forge", label: "Forge",      headStart: 0.22, divin: 1.0 },
  skill: { key: "skill", label: "Compétence", headStart: 0.22, divin: 1.1 },
};
const STAR_HEADSTART_CAP = 0.66;

function starsOf(s, sys) { return (s.stars && s.stars[sys]) || 0; }
/* permanent multiplier on that system's base values */
/* Forge and Skill retain their original defined first star. Familiars have a
   complete three-star ladder: 0★ x1, 1★ x2, 2★ x3, 3★ x4. */
const ASCEND_POWER_MUL = [1, 2];
const PET_ASCEND_POWER_MUL = [1, 2, 3, 4];
const PET_ASCEND_MAX_STARS = 3;
function ascendPowerMul(stars, sys) {
  const table = sys === "pet" ? PET_ASCEND_POWER_MUL : ASCEND_POWER_MUL;
  return table[Math.min(Math.max(0, stars || 0), table.length - 1)];
}
function starMul(s, sys) { return ascendPowerMul(starsOf(s, sys), sys); }
function masteryMax(sys) { return sys === "forge" ? RULES.FORGE_MAX : RULES.MASTERY_MAX; }
function masteryLevel(s, sys) {
  return sys === "forge" ? s.forge.level
    : sys === "pet" ? s.petMastery.level : s.skillMastery.level;
}
function canAscend(s, sys) {
  const stars = starsOf(s, sys);
  const belowStarCap = sys === "pet" ? stars < PET_ASCEND_MAX_STARS : stars < (ASCEND_POWER_MUL.length - 1);
  return masteryLevel(s, sys) >= masteryMax(sys) && belowStarCap;
}

/* ---------------------------- Ascension de Raid ----------------------------
   The fourth track. Each raid keeps its own level from 1 to 50, and section 5
   measures the new difficulty against "le niveau 1 du meme Raid", so each raid
   carries its own star and ascends on its own. Ascending one leaves the other
   four exactly where they were.

   What it takes: the level, and only the level. Keys are what you spend to
   enter a raid, so they survive for the same reason Essence and Minerai do --
   a player who ascends should be able to start climbing again immediately. The
   record stands as well; it is history, not progress. */
function raidStars(s, rid) { return (s.raids[rid] && s.raids[rid].stars) || 0; }
function canAscendRaid(s, rid) {
  const r = s.raids[rid];
  return !!r && r.level >= RULES.RAID_MAX_LEVEL && raidStars(s, rid) < RULES.RAID_ASCEND_MAX_STARS;
}
function doAscendRaid(rid) {
  if (!canAscendRaid(S, rid)) return { ok: false, maxed: raidStars(S, rid) >= RULES.RAID_ASCEND_MAX_STARS };
  update((st) => {
    const r = st.raids[rid];
    r.stars = (r.stars || 0) + 1;
    r.level = 1;
    // r.keys and r.record are deliberately untouched
  });
  return { ok: true, stars: raidStars(S, rid) };
}

/* What each Ascension costs and what it spares. The rule from the brief: every
   resource and every piece of progress the system produced is wiped, EXCEPT the
   currency used to summon or craft with it -- so the player can start rebuilding
   the moment they Ascend rather than being stranded. */
/* Stars sit right on the Maîtrise line, so two players at the same Maîtrise
   are instantly distinguishable by their tier. */
function starRow(sys, col) {
  const n = starsOf(S, sys);
  if (n <= 0) return "";
  const one = '<span style="color:' + col + ';font-size:11px;text-shadow:0 0 8px ' + col + '">★</span>';
  const shown = n <= 3 ? one.repeat(n)
    : one + '<b style="color:' + col + ';font-size:10px;margin-left:1px">×' + n + "</b>";
  return '<div class="row gap2" style="line-height:1">' + shown + "</div>";
}
function ascendCta(sys, col) {
  if (sys === "pet" && starsOf(S, "pet") >= PET_ASCEND_MAX_STARS) {
    return '<div class="mt6 center"><span class="pill" style="color:var(--goldLit);border-color:var(--goldDim)">' +
      ic("star", 12) + "Ascension Familier maximale · ★★★</span></div>";
  }
  if (!canAscend(S, sys)) return "";
  return '<div class="mt6">' + btn(ic("star", 14) + "ASCENSION ★ — maîtrise au maximum",
    { cls: "purple", small: true, act: "ascendAsk", arg: sys }) + "</div>";
}

function ascensionPreview(s, sys) {
  const st = starsOf(s, sys);
  const mul = ascendPowerMul(st + 1, sys) / ascendPowerMul(st, sys);
  const common = { stars: st, nextStars: st + 1,
    baseNow: Math.round(ascendPowerMul(st, sys) * 100),
    baseAfter: Math.round(ascendPowerMul(st + 1, sys) * 100),
    masteryFrom: masteryLevel(s, sys), masteryTo: sys === "forge" ? 1 : 0 };
  if (sys === "pet") return Object.assign(common, {
    label: "Familier",
    reset: [["Maîtrise Familier", masteryLevel(s, "pet") + " → 0"],
            ["Familiers possédés", fmt(s.pets.length)],
            ["Œufs en cours", fmt(s.eggs.length)]],
    keep: [["Essence animale", fmt(s.essence)],
           ["Pommes après remboursement", fmt((s.apples || 0) + petAppleInvestmentTotal(s))],
           ["Emplacements d'Œuf", fmt(s.eggSlots)]],
    gain: "Statistiques de base des Familiers ×" + mul });
  if (sys === "forge") return Object.assign(common, {
    label: "Forge",
    reset: [["Niveau de Forge", s.forge.level + " → 1"],
            ["Équipement (sac + porté)", fmt(s.inventory.length + SLOTS.filter((k) => s.equipped[k]).length)]],
    keep: [["Minerai", fmt(s.minerai)], ["Poussière", fmt(s.poussiere)]],
    gain: "Puissance de base des équipements ×" + mul });
  return Object.assign(common, {
    label: "Compétence",
    reset: [["Maîtrise Compétence", masteryLevel(s, "skill") + " → 0"],
            ["Compétences possédées", fmt(Object.keys(s.skills).length)],
            ["Emplacements équipés", fmt(s.skillSlots.filter(Boolean).length)]],
    keep: [["Points de Compétence", fmt(s.eclat)]],
    gain: "Statistiques de base des Compétences ×" + mul });
}

function doAscendMastery(sys) {
  if (!canAscend(S, sys)) return { ok: false, reason: "notMax" };
  let appleRefund = 0;
  update((st) => {
    st.stars[sys] = starsOf(st, sys) + 1;
    if (sys === "pet") {
      appleRefund = petAppleInvestmentTotal(st);
      st.apples = (st.apples || 0) + appleRefund;
      // section 1: the ladder comes back at 0/50, which is where a new save starts
      st.petMastery = { level: 0, count: 0, progress: 0 };
      st.pets = []; st.eggs = []; st.activePetId = null;
      // Essence, every slot source and every Apple ever invested all survive.
    } else if (sys === "forge") {
      st.forge.level = 1; st.forge.summonCount = 0;
      st.forge.upgradeEnd = 0; st.forge.masteryLevel = 0; st.forge.masteryProgress = 0;
      st.inventory = [];
      SLOTS.forEach((k) => { st.equipped[k] = null; });
      // Minerai and Poussiere both survive: one buys the forging, the other buys
      // the upgrading. Section 2 spares the currency, not just the one it names.
    } else {
      st.skillMastery = { level: 0, count: 0, progress: 0 };
      st.skills = {};
      st.skillSlots = st.skillSlots.map(() => null);
      // eclat survives
    }
  });
  return { ok: true, stars: starsOf(S, sys), appleRefund };
}
function petLegendaryChance(mastery, stars) {
  if ((stars || 0) < 1) return 0;
  const pts = [[0,0],[10,0.10],[20,0.50],[30,1.25],[40,2.50],[45,3.50],[50,5.00]];
  const m = Math.max(0, Math.min(50, mastery || 0));
  for (let i = 1; i < pts.length; i++) {
    if (m <= pts[i][0]) {
      const a=pts[i-1], b=pts[i], t=(m-a[0])/(b[0]-a[0]);
      return a[1] + (b[1]-a[1])*t;
    }
  }
  return 5;
}
function getRates(system, mastery, ascension, stars) {
  const a = RATE_ANCHORS[system];
  const order = orderFor(system);
  const cfg = ASCENSION[system];
  const st = stars || 0;
  // A star lifts the FLOOR of the ladder, not the ceiling: Maîtrise 1 with a
  // star beats Maîtrise 1 without one, but the top is still only reached at
  // full Maîtrise. Adding the boost to t instead would have let 5 stars max the
  // curve out by Maîtrise 25, making the rest of the climb pointless.
  const boost = cfg ? Math.min(STAR_HEADSTART_CAP, st * cfg.headStart) : 0;
  const climb = Math.max(0, Math.min(1, mastery / masteryMax(system)));
  const t = boost + (1 - boost) * climb;
  const EASE = { COMMUN: 1, PEU_COMMUN: 0.82, RARE: 0.7, EPIQUE: 1.15, MYTHIQUE: 1.55,
    ARTEFACT: 1.85, LEGENDAIRE: 2.15, INFERNAL: 2.45, IMMORTEL: 2.75, DIVIN: 1,
    HEROIQUE: 1.85, ANCESTRAL: 2.45 };
  const out = {};
  order.forEach((r) => { out[r] = a.m0[r] + (a.m50[r] - a.m0[r]) * Math.pow(t, EASE[r]); });
  // Familiar Ascension unlocks Legendary, never Divine. Divine Familiars only
  // enter the table after the character completes its own global Ascension.
  const divinPush = (ascension || 0) * 2 +
    (system === "pet" ? 0 : st * ((ASCENSION[system] || {}).divin || 0));
  if (divinPush > 0) {
    const divin = Math.min(9, divinPush * t);
    out.DIVIN = divin;
    out.MYTHIQUE = Math.max(0, out.MYTHIQUE - divin * 0.6);
    out.LEGENDAIRE = Math.max(0, (out.LEGENDAIRE || 0) - divin * 0.4);
  }
  if (system === "pet") {
    // Direct Legendary familiars are locked before the first Familiar Ascension.
    // After ★, mastery progressively unlocks them up to exactly 5% at 50/50.
    const target = petLegendaryChance(mastery, st);
    out.LEGENDAIRE = 0;
    const pool = ["COMMUN","PEU_COMMUN","RARE","EPIQUE","MYTHIQUE"];
    const poolSum = pool.reduce((n,r) => n + (out[r] || 0), 0) || 1;
    const div = Math.max(0, out.DIVIN || 0);
    const available = Math.max(0, 100 - div - target);
    pool.forEach((r) => { out[r] = (out[r] || 0) / poolSum * available; });
    out.LEGENDAIRE = target;
  }
  const sum = order.reduce((s, r) => s + (out[r] || 0), 0) || 1;
  order.forEach((r) => { out[r] = ((out[r] || 0) / sum) * 100; });
  return out;
}
function rollRarity(rates, order) {
  const list = order || RARITY_ORDER;
  const roll = Math.random() * 100;
  let acc = 0;
  for (const r of list) { acc += rates[r]; if (roll <= acc) return r; }
  return "COMMUN";
}

/* Section 9: forging one piece costs exactly 10 Minerai, whatever the Forge
   level. It used to be 20 x 1.14^level + 10, which read 32 at level 1 and 14014
   at level 50 -- the single largest Minerai sink in the game. A batch simply
   pays ten a piece: x20 costs 200.

   The parameter stays so the three call sites keep reading the same way, and so
   the day a level is meant to matter again there is somewhere obvious to put
   it. Note this is not the tree's "Forge Amelioration Cout", which discounts the
   gold price of an upgrade and is untouched. */
function forgeCost(forgeLevel) { return FORGE_CRAFT_COST; }
const FORGE_CRAFT_COST = 10;
/* Exact Forge Gold ladder. Levels 1 -> 50 cost 15,000,000 Gold in total.
   The early levels stay cheap, then the curve rises smoothly so long upgrade
   timers double as time to farm the next payment. */
const FORGE_UPGRADE_GOLD_COSTS = [3350,3800,4350,4950,5650,6450,7400,8400,9600,10950,12500,14250,16250,18550,21150,24100,27500,31350,35750,40800,46550,53100,60550,69050,78750,89850,102500,116900,133300,152050,173450,197850,225650,257400,293600,334850,381950,435650,496900,566800,646500,737400,841100,959350,1094250,1248100,1423600,1623800,1852100];
function forgeUpgradeCost(level) {
  const i = Math.max(0, Math.min(FORGE_UPGRADE_GOLD_COSTS.length - 1, level - 1));
  return FORGE_UPGRADE_GOLD_COSTS[i];
}
const FORGE_UPGRADE_TIMES = { 1: 0, 2: 0, 3: 0, 4: 300, 5: 600, 6: 900, 7: 1200, 8: 1800, 9: 3000, 10: 3600 };
function forgeUpgradeTime(level) {
  if (level <= 3) return 0;
  if (level <= 10) return FORGE_UPGRADE_TIMES[level];
  return 3600 + (level - 10) * 900;
}

/* Per-rarity hatch reduction. Three tiers stack (3 + 4 + 5 % a level over
   5 levels each = 60% at most), so a fully researched rarity hatches in 40% of
   its base time -- a real gain that still leaves a wait. */
/* Speed, not a cut. Four nodes at +50% make hatching three times as fast, so
   the timer is divided rather than shaved -- no ceiling, and the fourth node is
   worth as much as the first. hatchCutFor still answers in "percent removed"
   because that is what its callers want. */
function hatchSpeedFor(s, rarity) { return 1 + treeSum(s, "hatch_" + rarity) / 100; }
function hatchCutFor(s, rarity) {
  return Math.round((1 - 1 / hatchSpeedFor(s, rarity)) * 1000) / 10;
}
const EGG_TIMERS = { COMMUN: 10 * 60, PEU_COMMUN: 30 * 60, RARE: 90 * 60, EPIQUE: 4 * 3600, MYTHIQUE: 10 * 3600, LEGENDAIRE: 24 * 3600, DIVIN: 72 * 3600 };

/* ---------------------------- familiars -----------------------------------
   Every balance number for pets lives here so the curve can be retuned in one
   place. A pet grants the SAME percentage to damage and to HP.

   PET_BASE is the power a pet has the moment it reaches that rarity.
   PET_UP is the existing internal upgrade track available inside each rarity.
   Its caps remain rarity-specific: there is no universal familiar level 50.
   -------------------------------------------------------------------------- */
/* Species is flavour + icon; ELEMENT carries a light combat effect on top of
   the rarity bonus, so two pets of the same rarity can still play differently. */
const PET_SPECIES = [
  { id: "dragonnet", label: "Dragonnet", icon: "flame" },
  { id: "loup",      label: "Loup",      icon: "paw" },
  { id: "felin",     label: "Félin",     icon: "target" },
  { id: "oiseau",    label: "Oiseau",    icon: "haste" },
];
const PET_ELEMENTS = [
  { id: "normal",     label: "Normal",     c: "#9FB0C8", icon: "paw",     desc: "+10% aux dégâts du Familier" },
  { id: "feu",        label: "Feu",        c: "#FF7A3D", icon: "flame",   desc: "Brûle les ennemis chaque seconde" },
  { id: "glace",      label: "Glace",      c: "#3FA7FF", icon: "minerai", desc: "Ralentit les attaques ennemies de 12%" },
  { id: "electrique", label: "Électrique", c: "#F5C542", icon: "bolt",    desc: "+8% vitesse d'attaque" },
  { id: "toxique",    label: "Toxique",    c: "#7ED321", icon: "poison",  desc: "Les ennemis subissent +10% de dégâts" },
];
const PET_SPECIES_BY_ID = {}; PET_SPECIES.forEach((p) => { PET_SPECIES_BY_ID[p.id] = p; });
const PET_ELEM_BY_ID = {};    PET_ELEMENTS.forEach((p) => { PET_ELEM_BY_ID[p.id] = p; });
function randSpecies() { return PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)].id; }
function randElement() { return PET_ELEMENTS[Math.floor(Math.random() * PET_ELEMENTS.length)].id; }
function petSpecies(p) { return (p && PET_SPECIES_BY_ID[p.species]) || PET_SPECIES[0]; }
function petElement(p) { return (p && PET_ELEM_BY_ID[p.element]) || PET_ELEMENTS[0]; }
function petFullName(p) { return p ? petSpecies(p).label + " · " + petElement(p).label : "Aucun"; }
/* Art for a familiar. Species that have no art yet fall back to the dragonnet
   of the SAME element, so the element always reads correctly on screen. */
function petArt(p) {
  if (!p) return ASSETS.pet_dragonnet_normal;
  const el = petElement(p).id;
  return ASSETS["pet_" + petSpecies(p).id + "_" + el]
      || ASSETS["pet_dragonnet_" + el]
      || ASSETS.pet_dragonnet_normal;
}

const PET_BASE = { COMMUN: 3, PEU_COMMUN: 9, RARE: 18, EPIQUE: 108, MYTHIQUE: 648, LEGENDAIRE: 2200, DIVIN: 6408 };
/* Existing caps and per-level power gains are preserved. Peu commun is simply
   inserted between Commun and Rare and follows the same 10-level track as
   Commun. Upgrade PRICES are deliberately absent here: at an equal level every
   rarity pays the same number of Apples. */
const PET_UP = {
  COMMUN:     { max: 10, per: 0.6 },
  PEU_COMMUN: { max: 10, per: 0.6 },
  RARE:       { max: 12, per: 3.0 },
  EPIQUE:     { max: 15, per: 14.4 },
  MYTHIQUE:   { max: 18, per: 34.5 },
  LEGENDAIRE: { max: 20, per: 84 },
  DIVIN:      { max: 25, per: 150 },
};
/* Every rarity uses this same Apple curve. The first levels are inexpensive,
   then the price rises progressively; higher rarities only cost more in total
   when their existing level cap is higher. */
const PET_UPGRADE_BASE = 2;
const PET_UPGRADE_GROWTH = 1.29;
/* How many identical familiars fuse into the next rarity. */
const PET_FUSE_NEED = { COMMUN: 6, PEU_COMMUN: 6, RARE: 7, EPIQUE: 8, MYTHIQUE: 9, LEGENDAIRE: 10 };

function petMaxLevel(rarity) { return PET_UP[rarity].max; }
function petBonusAt(rarity, level, stars) {
  const u = PET_UP[rarity];
  const base = PET_BASE[rarity] + Math.min(level || 0, u.max) * u.per;
  return base * ascendPowerMul(stars, "pet");
}
function petBonus(pet) { return pet ? petBonusAt(pet.rarity, pet.level || 0, starsOf(S, "pet")) : 0; }
function petUpgradeCost(rarity, level) {
  if (!PET_UP[rarity]) return 0;
  return Math.max(1, Math.round(PET_UPGRADE_BASE * Math.pow(PET_UPGRADE_GROWTH, level || 0)));
}
function petAppleInvestmentAtLevel(rarity, level) {
  let total = 0;
  const max = PET_UP[rarity] ? Math.min(Math.max(0, level || 0), petMaxLevel(rarity)) : 0;
  for (let lv = 0; lv < max; lv++) total += petUpgradeCost(rarity, lv);
  return total;
}
function petAppleInvestment(pet) {
  return pet && Number.isFinite(pet.applesInvested)
    ? Math.max(0, Math.floor(pet.applesInvested))
    : pet ? petAppleInvestmentAtLevel(pet.rarity, pet.level || 0) : 0;
}
function petAppleInvestmentTotal(s) {
  return (s.pets || []).reduce((total, pet) => total + petAppleInvestment(pet), 0);
}
function petFuseNeed(rarity) { return PET_FUSE_NEED[rarity] || 0; }
/* Fusion preserves the core familiar's level. At every transferable level the
   destination rarity must therefore be stronger than the source rarity. */
function petFusionBalanceOk() {
  for (let i = 0; i < PET_RARITY_ORDER.length - 1; i++) {
    const r = PET_RARITY_ORDER[i], nx = PET_RARITY_ORDER[i + 1];
    const level = Math.min(petMaxLevel(r), petMaxLevel(nx));
    if (petBonusAt(nx, level) <= petBonusAt(r, level)) return false;
  }
  return true;
}

/* ---------------------------- skill catalogue -----------------------------
   Organised into the categories from the reference sheet. Each category has
   its own frame colour, so the skill bar reads at a glance:

     ATTAQUE  single target      AOE      hits every enemy
     BUFF     timed self buff    DEBUFF   timed enemy debuff
     SOIN     healing            ULTIME   long cooldown, huge payoff

   `fx` selects the on-screen effect; `eff` drives the timed buff/debuff engine.
   -------------------------------------------------------------------------- */
const SKILL_CATS = {
  ATTAQUE: { label: "Attaque",  c: "#FF7A3D" },
  AOE:     { label: "Zone",     c: "#9B5CF6" },
  BUFF:    { label: "Bonus",    c: "#3FB950" },
  DEBUFF:  { label: "Malus",    c: "#B15CF6" },
  SOIN:    { label: "Soin",     c: "#3FE0C0" },
  ULTIME:  { label: "Ultime",   c: "#F5C542" },
};
/* Every skill carries a FIXED rarity. It is not a label: it sets how strong the
   skill is (SKILL_RARITY_MUL below) and how hard it is to draw, because the
   summon rolls a rarity from the mastery table and then picks a skill from
   that tier. Duplicates still level whatever you already own.

   The tiers narrow on purpose -- 4 / 4 / 4 / 4 / 1 / 1. Commun holds a
   self-sufficient starter kit (a hit, an AoE, a heal, a debuff) because a
   player at Maitrise 0 draws Commun 100% of the time. Divin holds Cataclysme
   alone and its rate stays at 0% until the first Ascension, which makes the
   ultimate a real prize rather than a lucky roll. */
const SKILL_RARITY_MUL = { COMMUN: 1, RARE: 1.12, EPIQUE: 1.28, MYTHIQUE: 1.5, LEGENDAIRE: 1.8, DIVIN: 2.2 };
function skillRarityMul(def) { return SKILL_RARITY_MUL[def.rarity] || 1; }
/* The three power reads, so combat and UI can never disagree. All three take
   the owned level: damage already scaled with it, but healing and buff/debuff
   effects did not, so levelling a Rempart from 1 to 50 changed nothing at all.
   Support now grows in both strength and duration, gently enough that the 85%
   damage-reduction cap is still the thing that bounds it. */
function skillMult(def) { return (def.mult || 0) * skillRarityMul(def); }
function skillHeal(def, level) {
  return def.heal ? def.heal * skillRarityMul(def) * (1 + ((level || 1) - 1) * 0.02) : 0;
}
function skillEff(def, level) {
  if (!def.eff) return null;
  const g = (level || 1) - 1;
  return Object.assign({}, def.eff, {
    value: Math.round(def.eff.value * skillRarityMul(def) * (1 + g * 0.008) * 10) / 10,
    dur: Math.round(def.eff.dur * (1 + g * 0.012) * 10) / 10,
  });
}
const SKILL_DEFS = [
  /* ---- ATTAQUE : single target ---- */
  { id: "taillade",    name: "Taillade",         cat: "ATTAQUE", type: "MONO",   rarity: "COMMUN",     cd: 3,  mult: 1.6, color: "#FF9C6B", icon: "blade",     fx: "impact",
    desc: "Un coup rapide et sans fioriture. Peu de dégâts, mais il revient sans arrêt." },
  { id: "frappe",      name: "Frappe Sombre",    cat: "ATTAQUE", type: "MONO",   rarity: "RARE",       cd: 4,  mult: 2.0, color: "#F0883E", icon: "slash",     fx: "impact",
    desc: "Une frappe unique chargée d'ombre. Bon compromis entre dégâts et recharge." },
  { id: "percee",      name: "Percée",           cat: "ATTAQUE", type: "MONO",   rarity: "EPIQUE",     cd: 6,  mult: 2.6, color: "#FF6B4A", icon: "pierce",    fx: "pierce",
    desc: "Un estoc qui traverse l'armure. Lourds dégâts sur une seule cible." },
  { id: "execution",   name: "Exécution",        cat: "ATTAQUE", type: "MONO",   rarity: "LEGENDAIRE", cd: 11, mult: 4.0, color: "#E5484D", icon: "execute",   fx: "impact",
    desc: "Le coup de grâce. Les plus gros dégâts mono-cible du jeu, au prix d'une longue recharge." },

  /* ---- AOE : every enemy ---- */
  { id: "chaine",      name: "Chaîne Foudre",    cat: "AOE",     type: "CHAINE", rarity: "COMMUN",     cd: 5,  mult: 1.2, color: "#3FCFD6", icon: "chain",     fx: "bolt",
    desc: "Un arc électrique qui rebondit d'un ennemi à l'autre et touche toute la vague." },
  { id: "vortex",      name: "Vortex Arcanique", cat: "AOE",     type: "AOE",    rarity: "RARE",       cd: 6,  mult: 1.4, color: "#9B5CF6", icon: "spiral",    fx: "vortex",
    desc: "Une spirale d'énergie qui aspire et broie tous les ennemis présents." },
  { id: "onde",        name: "Onde de Choc",     cat: "AOE",     type: "AOE",    rarity: "EPIQUE",     cd: 7,  mult: 1.6, color: "#4A90D9", icon: "wave",      fx: "wave",
    desc: "Une déflagration circulaire qui balaie tout ce qui entoure le héros." },
  { id: "meteore",     name: "Météore",          cat: "AOE",     type: "AOE",    rarity: "MYTHIQUE",   cd: 9,  mult: 2.2, color: "#FF7A3D", icon: "meteor",    fx: "meteor",
    desc: "Un bloc incandescent s'écrase sur l'arène. La zone la plus dévastatrice hors Ultime." },

  /* ---- BUFF : timed, on the hero ---- */
  { id: "force",       name: "Force",            cat: "BUFF",    type: "BUFF",   rarity: "RARE",       cd: 10, mult: 0,   color: "#3FB950", icon: "power",     fx: "aura",
    desc: "Décuple la puissance de frappe du héros pendant quelques secondes.",
    eff: { key: "force",   stat: "dmg",      value: 40, dur: 8, label: "Force" } },
  { id: "rempart",     name: "Rempart",          cat: "BUFF",    type: "BUFF",   rarity: "EPIQUE",     cd: 12, mult: 0,   color: "#4A90D9", icon: "shield",    fx: "aura",
    desc: "Un bouclier de lumière qui absorbe une partie des dégâts subis.",
    eff: { key: "rempart", stat: "dmgRed",   value: 35, dur: 8, label: "Rempart" } },
  { id: "hate",        name: "Hâte",             cat: "BUFF",    type: "BUFF",   rarity: "MYTHIQUE",   cd: 13, mult: 0,   color: "#84E891", icon: "haste",     fx: "aura",
    desc: "Accélère les attaques du héros : plus de coups portés sur la même durée.",
    eff: { key: "hate",    stat: "haste",    value: 30, dur: 8, label: "Hâte" } },

  /* ---- DEBUFF : timed, on the enemies ---- */
  { id: "poison",      name: "Poison",           cat: "DEBUFF",  type: "DEBUFF", rarity: "COMMUN",     cd: 8,  mult: 0.3, color: "#7ED321", icon: "poison",    fx: "poison",
    desc: "Empoisonne la vague : des dégâts continus qui s'ajoutent à tout le reste.",
    eff: { key: "poison",  stat: "poison",   value: 22, dur: 8, label: "Poison" } },
  { id: "malediction", name: "Malédiction",      cat: "DEBUFF",  type: "DEBUFF", rarity: "EPIQUE",     cd: 8,  mult: 0.6, color: "#B15CF6", icon: "skull",     fx: "curse",
    desc: "Marque les ennemis : ils encaissent davantage de dégâts de toutes tes sources.",
    eff: { key: "vuln",    stat: "vuln",     value: 30, dur: 7, label: "Vulnérable" } },
  { id: "lenteur",     name: "Lenteur",          cat: "DEBUFF",  type: "DEBUFF", rarity: "MYTHIQUE",   cd: 9,  mult: 0,   color: "#8B6BD6", icon: "slow",      fx: "curse",
    desc: "Ralentit les ennemis, qui frappent nettement moins souvent.",
    eff: { key: "slow",    stat: "slow",     value: 40, dur: 8, label: "Lenteur" } },

  /* ---- SOIN ---- */
  { id: "soin",        name: "Soin",             cat: "SOIN",    type: "HEAL",   rarity: "COMMUN",     cd: 7,  mult: 0,   color: "#3FE0C0", icon: "heal",      fx: "heal",  heal: 9,
    desc: "Referme les blessures. Rapide et fiable." },
  { id: "benediction", name: "Bénédiction",      cat: "SOIN",    type: "HEAL",   rarity: "RARE",       cd: 10, mult: 0,   color: "#F5C542", icon: "sparkle",   fx: "heal",  heal: 14,
    desc: "Une vague de lumière qui restaure une large part des points de vie d'un coup." },
  { id: "regeneration",name: "Régénération",     cat: "SOIN",    type: "BUFF",   rarity: "MYTHIQUE",   cd: 14, mult: 0,   color: "#5CE8B0", icon: "regen",     fx: "heal",
    desc: "Régénère des points de vie en continu pendant toute la durée de l'effet.",
    eff: { key: "regen",   stat: "regen",    value: 3, dur: 10, label: "Régén." } },

  /* ---- ULTIME : the Ascension prize ---- */
  { id: "cataclysme",  name: "Cataclysme",       cat: "ULTIME",  type: "AOE",    rarity: "DIVIN",      cd: 22, mult: 5.5, color: "#F5C542", icon: "cataclysm", fx: "cataclysm",
    desc: "L'arène entière s'embrase. Les dégâts les plus dévastateurs du jeu, sur tous les ennemis à la fois." },
];
/* an active effect knows its eff.key, so it can find its way back to the icon
   that cast it instead of living in a detached row of chips */
const SKILL_BY_EFFKEY = {};
SKILL_DEFS.forEach((d) => { if (d.eff) SKILL_BY_EFFKEY[d.eff.key] = d; });
const SKILLS_BY_RARITY = {};
SKILL_DEFS.forEach((d) => { (SKILLS_BY_RARITY[d.rarity] = SKILLS_BY_RARITY[d.rarity] || []).push(d); });
const SKILL_BY_ID = {};
SKILL_DEFS.forEach((d) => { SKILL_BY_ID[d.id] = d; });

function skillDupesNeeded(level) { return Math.min(12, 1 + Math.floor(level / 5)); }
/* Section 17. Measured at character 100 with a full Épique set, comparing a
   cast against what auto-attacks deal during that skill's own cooldown:

     level 1     Taillade 0.83   Percée 1.02   Exécution 1.30   Cataclysme 1.16
     level 50    Taillade 3.3    Percée 4.1    Exécution 5.1    Cataclysme 4.6

   At level 1 the numbers are right -- a cast is worth roughly its downtime. The
   base multipliers are therefore not the problem; the per-level growth is, and
   it alone multiplied every skill by 3.94 while nothing else about the hero
   moved. Halving it to 3 % puts a maxed skill at 2.47x its level-1 value, so a
   cast lands at 2 to 3 times its cooldown in auto-attacks: a burst worth
   pressing, not a replacement for the fight. */
const SKILL_LEVEL_GROWTH = 0.03;
function skillDamageMult(base, level) {
  return base * (1 + (level - 1) * SKILL_LEVEL_GROWTH) * starMul(S, "skill");
}

const RAIDS = {
  or:         { name: "Raid Or",         icon: "gold",    color: "#F5C542", reward: "Or" },
  minerai:    { name: "Raid Minerai",    icon: "minerai", color: "#4A90D9", reward: "Minerai" },
  competence: { name: "Raid Compétence", icon: "eclat",   color: "#B15CF6", reward: "Éclat" },
  familier:   { name: "Raid Familier",   icon: "paw",     color: "#F0883E", reward: "Essence" },
  evolution:  { name: "Raid Évolution",  icon: "chart",   color: "#3FCFD6", reward: "PE" },
};
const RAID_IDS = ["or", "minerai", "competence", "familier", "evolution"];
/* ---------------------------- raid difficulty -----------------------------
   Calibrated so raid level L is roughly the ceiling for a character at level
   2L — i.e. raid 25 around character 50, raid 50 (the cap) around character
   100. Measured against a reference build (40/40/10/10 stat split, forge at
   level/2, a full set of level-appropriate gear and one un-upgraded pet):

     player DPS  grows ~1.079 per character level
     player HP   grows ~1.074 per character level

   so at char 2L that is 1.079^2L = RAID_HP_GROWTH^L. The wave is then sized
   to take TTK_TARGET seconds of that DPS while leaving the player about
   TTD_TARGET seconds of life — a ~20% margin at the intended level.

   Everything below is a knob; nothing else in the file hardcodes raid scaling.
   -------------------------------------------------------------------------- */
/* Recalibrated against the REAL combat engine (headless tick loop), not a
   closed-form model. Measured ceilings for a DEVELOPED character-100 build
   (4 skills, pet maxed inside its rarity, tree partly grown):
       damage 620k   HP 1.30M
   versus a BARE character-100 build (stats + gear only):
       damage 113k   HP 467k
   The wave budget is sized so raid 50 is the ceiling for the developed build,
   which puts a bare build around raid 33 — raids are now a real check on how
   built your character is, not just on level. Growth is steep rather than the
   base being large, so raid 1 stays approachable for a new character. */
const RAID_HP_BASE = 464, RAID_HP_GROWTH = 1.2723;
const RAID_DMG_BASE = 38.1, RAID_DMG_GROWTH = 1.1806;
const RAID_TUNE = {
  // "or" runs five SEQUENTIAL single-enemy waves, so the player only ever
  // faces one at a time — it needs a bigger HP budget to gate at the same level
  or:         { hp: 2.00, dmg: 0.70 },
  // Évolution is the gate on the personal tree, so it is the stiffest raid
  evolution:  { hp: 1.45, dmg: 1.20 },
  minerai:    { hp: 1.25, dmg: 1.15 },   // one tanky golem
  competence: { hp: 1.00, dmg: 1.00 },
  familier:   { hp: 1.00, dmg: 1.00 },
};
/* Section 6 makes Raid Minerai linear: a flat base, then ten more a level. The
   base is the only thing an Ascension changes -- 750 unstarred, 1275 after the
   first -- so level 15 with a star lands on 990, which was the unstarred
   ceiling, and level 16 is the first to beat it. The second star is left
   undefined and the base holds, as everywhere else in this update. */
const RAID_MINERAI_BASE = [750, 1275];
const RAID_MINERAI_PER_LEVEL = 15;
function raidMineraiBase(s) {
  const st = (s && s.raids && s.raids.minerai && s.raids.minerai.stars) || 0;
  return RAID_MINERAI_BASE[Math.min(Math.max(0, st), RAID_MINERAI_BASE.length - 1)];
}
function raidReward(raid, level) {
  // Mise à jour 10 : progression lisible et linéaire pour les trois ressources demandées.
  // Évolution : 10 au niveau 1, puis +3 par niveau.
  if (raid === "evolution") return 10 + 3 * Math.max(0, level - 1);
  // Raids Compétence et Familier : 125 au niveau 1, puis +5 par niveau.
  // Une victoire de niveau 1 finance 5 invocations de base à 25.
  if (raid === "competence") return 125 + 5 * Math.max(0, level - 1);
  if (raid === "familier") return 125 + 5 * Math.max(0, level - 1);
  // Raid Or conserve sa courbe dédiée.
  if (raid === "or") return Math.floor(RAID_OR_BASE * Math.pow(RAID_OR_GROWTH, level - 1));
  if (raid === "minerai") return raidMineraiBase(S) + RAID_MINERAI_PER_LEVEL * (level - 1);
  const base = RAID_BASE[raid] || 8;
  return Math.floor(base * Math.pow(RAID_GROWTH, level - 1));
}
/* Section 5: a raid's first Ascension makes its level 1 exactly five times the
   difficulty of the same raid's un-starred level 1. It applies here, on the
   wave budget, because that is where this system already expresses "how hard is
   this wave" -- raidEnemyHP and raidEnemyDamage then split the budget across
   however many enemies are present, exactly as before. No individual statistic
   is multiplied, and the per-level growth curve is untouched, so the existing
   progression carries on from the new base.

   Like the power multiplier, the second star is deliberately left undefined and
   the value holds rather than compounding into a number nobody chose. */
const RAID_ASCEND_DIFF_MUL = [1, 5];
function raidDiffMul(s, raid) {
  const st = (s && s.raids && s.raids[raid] && s.raids[raid].stars) || 0;
  return RAID_ASCEND_DIFF_MUL[Math.min(Math.max(0, st), RAID_ASCEND_DIFF_MUL.length - 1)];
}
/* total HP / damage-per-second budget for the whole wave at this raid level */
function raidIntroDifficultyMul(raid, level) {
  // Les deux premiers niveaux servent d’introduction. Dès le niveau 3, la
  // courbe historique reprend exactement à 100 %, donc le développement futur
  // et la difficulté des niveaux avancés restent inchangés.
  if (raid !== "evolution" && raid !== "competence" && raid !== "familier") return 1;
  if (level <= 1) return 0.65;
  if (level === 2) return 0.80;
  return 1;
}
function raidWaveHP(raid, level) {
  return RAID_HP_BASE * Math.pow(RAID_HP_GROWTH, level) * RAID_TUNE[raid].hp * raidDiffMul(S, raid) * raidIntroDifficultyMul(raid, level);
}
function raidWaveDamage(raid, level) {
  return RAID_DMG_BASE * Math.pow(RAID_DMG_GROWTH, level) * RAID_TUNE[raid].dmg * raidDiffMul(S, raid) * raidIntroDifficultyMul(raid, level);
}
function raidEnemyCount(raid, level) {
  if (raid === "or") return 5;
  if (raid === "evolution") return level < 10 ? 1 : level < 30 ? 2 : 3;
  if (raid === "minerai") return 1;
  if (level < 6) return 1;
  if (level < 20) return 2;
  return 3;
}
/* the budget split across the enemies actually present */
function raidEnemyHP(raid, level) {
  return Math.max(1, Math.floor(raidWaveHP(raid, level) / raidEnemyCount(raid, level)));
}
function raidEnemyDamage(raid, level) {
  return Math.max(1, Math.floor(raidWaveDamage(raid, level) / raidEnemyCount(raid, level)));
}
/* PR per rebirth. Same shape as before, scaled up so the Rebirth upgrades
   (whose costs are unchanged) buy at a satisfying pace. */
/* Section 4B: more PR per Rebirth, same formula and same factors. The formula
   is floor x rate x (1 + Gain PR), so the rate is the only thing that moves --
   nothing about how a Rebirth is calculated changes.

   Sized against the actual economy rather than picked: the whole Rebirth tree
   costs 12993 PR, and a Rebirth paid floor x 3. That is 174 loops from the new
   floor-25 minimum, or 29 from floor 150. Doubling the rate halves both, and
   makes the first Rebirth a player can now take at floor 25 worth 150 PR
   instead of 75 -- enough to buy something the same evening. */
const PR_PER_FLOOR = 6;
function prFromFloor(floor) { return Math.floor(floor * PR_PER_FLOOR); }
const REBIRTH_UPGRADES = [
  // Values roughly doubled so PR spent buys a permanent gain worth feeling.
  // "Vit. Déplac." was removed outright — it did almost nothing for the player.
  //
  // The five combat bonuses run to 20 levels (5 for Vol de Vie) on a ladder
  // that starts at 3 PR and ends at 422. The step ratio decays smoothly from
  // 2.0 to 1.17, so the early levels stay impulse-buys while the last few are
  // a deliberate saving goal, rather than a cliff at the end.
  /* Section 4C takes these two to 50. The effect per level is untouched -- 5%
     and 6% -- so the ceilings become 250% and 300%.

     The cost ladder is extended by its own rule rather than a new one. It is
     not an exponential: its second difference climbs by 2 every couple of
     levels, which is a polynomial, and continuing that is what "conserver le
     systeme de progression" means here. Reading it as an exponential and
     holding the 1.17 tail ratio would have cost 320000 PR a line instead of
     95000, for no reason anyone chose. Levels 1-20 are byte-identical. */
  { key: "damage",     label: "Dégâts",         icon: "flame",   max: 50, perLvl: 5,    unit: "%",   costs: [
      10,20,32,46,64,86,112,142,178,220,
      270,328,396,474,564,668,788,926,1084,1266,
      1474,1708,1970,2260,2580,2930,3312,3726,4174,4656,
      5174,5728,6320,6950,7620,8330,9082,9876,10714,11596,
      12524,13498,14520,15590,16710,17880,19102,20376,21704,23086] },
  { key: "life",       label: "Vie",            icon: "heart",   max: 50, perLvl: 6,    unit: "%",   costs: [
      10,20,32,46,64,86,112,142,178,220,
      270,328,396,474,564,668,788,926,1084,1266,
      1474,1708,1970,2260,2580,2930,3312,3726,4174,4656,
      5174,5728,6320,6950,7620,8330,9082,9876,10714,11596,
      12524,13498,14520,15590,16710,17880,19102,20376,21704,23086] },
  { key: "atkspeed",   label: "Vit. Attaque",   icon: "bolt",    max: 5,  perLvl: 3,    unit: "%",   costs: [10,20,30,50,75] },
  { key: "critdmg",    label: "Dégâts Crit.",   icon: "sparkle", max: 5,  perLvl: 8,    unit: "%",   costs: [10,20,30,50,75] },
  { key: "dmgred",     label: "Réduc. Dégâts",  icon: "shield",  max: 20, perLvl: 2,    unit: "%",   costs: [10,20,32,46,64,86,112,142,178,220,270,328,396,474,564,668,788,926,1084,1266] },
  { key: "regen",      label: "Régénération",   icon: "potion",  max: 5,  perLvl: 0.6,  unit: "%/s", costs: [10,20,30,50,75] },
  { key: "lifesteal",  label: "Vol de Vie",     icon: "droplet", max: 5,  perLvl: 1,    unit: "%",   costs: [10,20,32,46,64] },
  { key: "bossdmg",    label: "Dégâts Boss",    icon: "skull",   max: 20, perLvl: 8,    unit: "%",   costs: [10,20,32,46,64,86,112,142,178,220,270,328,396,474,564,668,788,926,1084,1266] },
  { key: "exp",        label: "EXP",            icon: "cap",     max: 10, perLvl: 5,    unit: "%",   costs: [10,20,30,50,75,110,160,230,320,450] },
  { key: "gold",       label: "Or",             icon: "gold",    max: 50, perLvl: 4,    unit: "%", costDiv: 1,
    // Prix REELS affichés/payés. Total exact des 50 niveaux : 135 000 PR.
    costs: [100,150,200,250,300,350,400,500,550,600,700,800,850,950,1050,1150,1250,1350,1450,1600,1700,1800,1950,2100,2200,2350,2500,2650,2800,2950,3100,3250,3450,3600,3750,3950,4150,4300,4500,4700,4900,5100,5300,5500,5750,5950,6150,6400,6650,7000] },
  { key: "apples",     label: "Gain Pommes",     icon: "paw",     max: 20, perLvl: 5, unit: "%", costDiv: 1,
    costs: [200,300,400,500,650,800,950,1100,1300,1500,1700,1900,2100,2300,2500,2800,3100,3400,3700,3800] },
  { key: "prgain",     label: "Gain PR",        icon: "chart",   max: 50, perLvl: 8,    unit: "%", costDiv: 1,
    // Total exact pour maxer les 50 niveaux : 35 000 PR.
    costs: [50,77,103,130,156,183,209,236,262,289,315,342,368,395,421,448,474,501,528,554,581,607,634,660,687,713,740,766,793,819,846,872,899,926,952,979,1005,1032,1058,1085,1111,1138,1164,1191,1217,1244,1270,1297,1323,1350] },
  { key: "keep",       label: "Conservation",   icon: "cycle",   max: 5,  perLvl: 2,    unit: "%",   costs: [100,200,350,550,800] },
  { key: "floorSkip",  label: "Saut d'étage",  icon: "forward", max: 25, perLvl: 0.8,  unit: "%", costDiv: 1,
    // 25 niveaux, 20% au maximum, 50 000 PR au total.
    costs: [100,258,417,575,733,892,1050,1208,1367,1525,1683,1842,2000,2158,2317,2475,2633,2792,2950,3108,3267,3425,3583,3742,3900] },
];
function rebirthKeepPct(keepLevel) { return 50 + keepLevel; }
const REBIRTH_COST_DIV = 3;
function rebirthUpgCost(def, lvl) {
  const div = def.costDiv || REBIRTH_COST_DIV;
  return Math.max(1, Math.round(def.costs[lvl] / div));
}

/* ---------------------------- personal tree -------------------------------
   One continuous DAG of MULTI-LEVEL nodes. A node counts as "activated" for
   its children the moment it reaches level 1, so a player can spend one point
   in several bonuses to push deeper and come back later to max them out.
   Every node is reachable eventually — branches set the ORDER, never a
   permanent lock-out. Every price is a PE price derived from the node's tier,
   centralised in PE_TIER_COST so the tree rebalances from one line.
   -------------------------------------------------------------------------- */
/* ---- tree economy -------------------------------------------------------
   Points d'Évolution (PE) from the Raid Évolution are the ONLY currency the
   tree accepts: they open a node and they pay for every level after it.
   Opening is deliberately cheaper than levelling, so breadth stays affordable
   and depth is what the Raid has to fund.
   ------------------------------------------------------------------------ */
const PE_TIER_COST  = [8, 14, 26, 45];      // base PE cost of a node's levels, by tier
const PE_FIRST_MUL  = 0.6;                  // opening a node costs less than levelling it
const PA_TO_PE = 8;                         // legacy: 105 PA of unlocks buys 780 PE of unlocks
const PE_LEVEL_GROWTH = 1.22;               // each further level costs more
const PE_REWARD_BASE = 20, PE_REWARD_PER_LEVEL = 6;
/* First-clear reward for a major Boss (floor 10, 20, 30, ...). Deeper bosses
   hand out better accelerators, and more of them, but the ladder is capped so
   it cannot flood the economy. Claimed once per boss, FOREVER — the record
   survives Rebirth, so re-killing a boss pays the normal rewards only. */
function bossFirstClearReward(floor) {
  const tier = Math.floor(floor / RULES.BOSS_EVERY);        // 1 at floor 10, 5 at 50...
  if (tier <= 0) return null;
  const key = tier >= 16 ? "a60" : tier >= 10 ? "a30" : tier >= 6 ? "a15" : tier >= 3 ? "a5" : "a1";
  const qty = Math.min(5, 1 + Math.floor((tier - 1) / 4));  // 1..5 of them
  return { key, qty };
}
/* Le Méga Boss se déverrouille après la victoire contre le Boss normal de
   l'étage 50. Il n'existe PAS de « Méga Étage » automatique dans la campagne.
   Les niveaux du Méga Boss réutilisent les Boss normaux comme références :
   Méga 1 = Boss normal 10 ×10, Méga 2 = Boss normal 20 ×10, etc. */
function isMegaFloor(floor) { return false; }
function megaLevelForFloor(floor) { return Math.max(1, Math.floor((floor || 10) / 10)); }
function megaAccelReward(floor) {
  const base = bossFirstClearReward(floor);
  return base ? { key: base.key, qty: base.qty * 2, refBossFloor: floor } : null;
}
function megaRaidUnlocked(s) {
  return !!(s && s.bossClears && s.bossClears["50"]);
}
/* Apples have one source: the first clear of each Mega-Boss. One reward every
   ten floors replaces the old Elite + Boss pair without turning Rebirth or a
   replay into a farming loop. Rebirth's Gain Pommes only scales that first
   clear; at 20/20 it doubles the amount. */
function megaAppleBaseReward(floor) {
  return 33 + 7 * Math.floor(Math.max(0, floor) / 25);
}
function megaAppleFirstClearReward(floor, s) {
  return Math.floor(megaAppleBaseReward(floor) * (1 + rb(s, "apples") / 100));
}
/* The primary gold faucet: one Raid Or run should be worth a solid stretch of
   floors. 1.17 over 50 levels was 2566x, which outran every cost curve the
   Forge could carry and pushed the Raid to 100% of late income. 1.14 is 758x --
   still the dominant source, but floors and the Récolte keep a visible share. */
const RAID_OR_BASE = 3000, RAID_OR_GROWTH = 1.057;
/* Raid level 1 rewards. These also set the Récolte automatique's hourly
   rates: Minerai 100% of an entry, Essence and Compétence 25% each. */
/* minerai is no longer here: section 6 gives it its own linear curve. */
const RAID_BASE = { familier: 120, competence: 50 };
const RAID_GROWTH = 1.16;
const mn = (a) => a.map((v) => Math.round(v * 60));
const hr = (a) => a.map((v) => Math.round(v * 3600));
// shared duration ladders straight from the design brief
const T10_MIN = mn([5, 7, 9, 12, 15, 18, 21, 24, 27, 30]); // tier I over 10 levels
const T5_MIN  = mn([6, 12, 18, 24, 30]);                 // tier I: minutes
const T10_H   = hr([6, 9, 12, 16, 20, 24, 30, 36, 42, 48]); // tier III: hours → 2 days
const T3_D    = hr([40, 60, 96]);                        // 1j16h, 2j12h, 4j
const T5_D    = hr([24, 40, 48, 68, 96]);                // tier III top: 1j → 4j
const T5_D4   = hr([48, 72, 96, 120, 144]);              // tier IV: 2j → 6j
const MASTERY_T1 = mn([5, 10, 15, 20, 25]);
const MASTERY_T2 = mn([15, 30, 45, 60, 75]);
const HATCH_T2 = mn([30, 60, 90, 120, 150]);        // 30min → 2h30
const HATCH_T3 = hr([4, 8, 16, 32, 60]);            // 4h → 2j12h
/* Tier II used to top out at 5h30 a level, which made that whole band of the
   tree a slog. These are cut hard at the top while staying above the 60 min
   ceiling of tier I, so the ordering between the bands still holds. */
const T10_H2  = hr([1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5]);  // was 1 → 5h30
const T3_H2   = hr([1.5, 2, 2.5]);                                        // was 3 → 5h
const T5_H2   = mn([90, 105, 120, 135, 150]);                             // was 2h40 → 4h

/* Five lanes per palier now, and rows run right through the four paliers with
   a gap between each, so a node's row already says which palier it sits in. */
const TREE_LANE_X = [44, 122, 200, 278, 356];
const TREE_ROW_Y = (row) => 44 + row * 84;
/* How long a level of a node takes to research, by palier. */
const PAL_T = [mn([4, 8, 14, 22, 32]), mn([10, 18, 30, 46, 66]),
               mn([24, 42, 68, 100, 145]), mn([50, 88, 140, 210, 300])];

const TREE_NODES = [

  /* ---------------- PALIER I ---------------- */
  { id: "n1_09", sect: "Palier I", label: "Compétence Dégâts I", short: "Comp. Dég. I", icon: "sparkle", color: "#9B5CF6", tier: 1, effect: "skillDmg", per: 2, unit: "%", max: 5, times: PAL_T[0], req: [], lane: 0, row: 0 },
  { id: "n1_28", sect: "Palier I", label: "Chance d'obtenir 1 Œuf supplémentaire gratuitement I", short: "Œuf Suppl. I", icon: "egg", color: "#8FEFF4", tier: 1, effect: "eggFree", per: 1, unit: "%", max: 5, times: PAL_T[0], req: [], lane: 1, row: 0 },
  { id: "n1_16", sect: "Palier I", label: "Casque Bonus Santé I", short: "Casque I", icon: "helm", color: "#57E07A", tier: 1, effect: "eq_casque", per: 2, unit: "%", max: 5, times: PAL_T[0], req: [], lane: 2, row: 0 },
  { id: "n1_22", sect: "Palier I", label: "Ceinture Bonus Santé I", short: "Ceinture I", icon: "chain", color: "#57E07A", tier: 1, effect: "eq_ceinture", per: 2, unit: "%", max: 5, times: PAL_T[0], req: [], lane: 3, row: 0 },
  { id: "n1_05", sect: "Palier I", label: "Amélioration de Nœud Technologique Coût I", short: "Tech Coût I", icon: "gear", color: "#3FCFD6", tier: 1, effect: "techCost", per: -2, unit: "%", max: 5, times: PAL_T[0], req: [], lane: 4, row: 0 },
  { id: "n1_19", sect: "Palier I", label: "Armure Bonus Santé I", short: "Armure I", icon: "armor", color: "#57E07A", tier: 1, effect: "eq_armure", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_28", "n1_16", "n1_09"], lane: 0, row: 1 },
  { id: "n1_01", sect: "Palier I", label: "Forge Amélioration Vitesse du minuteur I", short: "Forge Vit. I", icon: "hammer", color: "#E8B44A", tier: 1, effect: "forgeTime", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_09", "n1_22"], lane: 1, row: 1 },
  { id: "n1_30", sect: "Palier I", label: "PE obtenus dans le Raid Évolution I", short: "PE Raid I", icon: "gem", color: "#3FB950", tier: 1, effect: "peRaid", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_16"], lane: 2, row: 1 },
  { id: "n1_04", sect: "Palier I", label: "Recherche Technologique Vitesse du minuteur I", short: "Rech. Vit. I", icon: "clock", color: "#3FCFD6", tier: 1, effect: "research", per: 4, unit: "%", max: 5, times: PAL_T[0], req: ["n1_05"], lane: 3, row: 1 },
  { id: "n1_29", sect: "Palier I", label: "Chance d'obtenir 1 Compétence supplémentaire gratuitement I", short: "Comp. Suppl. I", icon: "sparkle", color: "#8FEFF4", tier: 1, effect: "skillFree", per: 1, unit: "%", max: 5, times: PAL_T[0], req: ["n1_22", "n1_16"], lane: 4, row: 1 },
  { id: "n1_13", sect: "Palier I", label: "Animal Bonus Dégâts I", short: "Animal Dég. I", icon: "paw", color: "#FF7A3D", tier: 1, effect: "petDmg", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_01", "n1_28"], lane: 0, row: 2 },
  { id: "n1_10", sect: "Palier I", label: "Compétence Passive Base Dégâts I", short: "Pass. Dég. I", icon: "swords", color: "#9B5CF6", tier: 1, effect: "passDmg", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_09", "n1_16"], lane: 1, row: 2 },
  { id: "n1_23", sect: "Palier I", label: "Œuf Commun Vitesse d'éclosion I", short: "Œuf Commun I", icon: "egg", color: "#9FB0C8", tier: 1, effect: "hatch_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[0], req: ["n1_28", "n1_19"], lane: 2, row: 2 },
  { id: "n1_15", sect: "Palier I", label: "Arme Bonus Dégâts I", short: "Arme I", icon: "swords", color: "#FF5A5A", tier: 1, effect: "eq_arme", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_29"], lane: 3, row: 2 },
  { id: "n1_17", sect: "Palier I", label: "Gants Bonus Dégâts I", short: "Gants I", icon: "glove", color: "#FF5A5A", tier: 1, effect: "eq_gants", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_29"], lane: 4, row: 2 },
  { id: "n1_24", sect: "Palier I", label: "Œuf Rare Vitesse d'éclosion I", short: "Œuf Rare I", icon: "egg", color: "#3FA7FF", tier: 1, effect: "hatch_RARE", per: 10, unit: "%", max: 5, times: PAL_T[0], req: ["n1_23", "n1_10"], lane: 0, row: 3 },
  { id: "n1_18", sect: "Palier I", label: "Collier Bonus Dégâts I", short: "Collier I", icon: "gem", color: "#FF5A5A", tier: 1, effect: "eq_collier", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_13"], lane: 1, row: 3 },
  { id: "n1_12", sect: "Palier I", label: "Compétence Invoquer Coût I", short: "Invoq. Coût I", icon: "sparkle", color: "#B15CF6", tier: 1, effect: "skillCost", per: -1, unit: "%", max: 5, times: PAL_T[0], req: ["n1_30"], lane: 2, row: 3 },
  { id: "n1_11", sect: "Palier I", label: "Compétence Passive Base Santé I", short: "Pass. Santé I", icon: "heart", color: "#57E07A", tier: 1, effect: "passHp", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_23"], lane: 3, row: 3 },
  { id: "n1_06", sect: "Palier I", label: "Bonus Or global I", short: "Or Global I", icon: "gold", color: "#F5C542", tier: 1, effect: "goldAll", per: 1, unit: "%", max: 5, times: PAL_T[0], req: ["n1_04"], lane: 4, row: 3 },
  { id: "n1_08", sect: "Palier I", label: "Temps Récompense Autonomie I", short: "Tps Auton. I", icon: "cycle", color: "#8FC4FF", tier: 1, effect: "afkTime", per: 10, unit: "%", max: 5, times: PAL_T[0], req: ["n1_18", "n1_10"], lane: 0, row: 4 },
  { id: "n1_14", sect: "Palier I", label: "Animal Bonus Santé I", short: "Animal Santé I", icon: "paw", color: "#57E07A", tier: 1, effect: "petHp", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_12"], lane: 1, row: 4 },
  { id: "n1_26", sect: "Palier I", label: "Œuf Mythique Vitesse d'éclosion I", short: "Œuf Mythique I", icon: "egg", color: "#FF4D6A", tier: 1, effect: "hatch_MYTHIQUE", per: 10, unit: "%", max: 5, times: PAL_T[0], req: ["n1_24"], lane: 2, row: 4 },
  { id: "n1_02", sect: "Palier I", label: "Forge Amélioration Coût I", short: "Forge Coût I", icon: "hammer", color: "#E8B44A", tier: 1, effect: "forgeCost", per: -1, unit: "%", max: 5, times: PAL_T[0], req: ["n1_12", "n1_06", "n1_18"], lane: 3, row: 4 },
  { id: "n1_25", sect: "Palier I", label: "Œuf Épique Vitesse d'éclosion I", short: "Œuf Épique I", icon: "egg", color: "#B15CF6", tier: 1, effect: "hatch_EPIQUE", per: 10, unit: "%", max: 5, times: PAL_T[0], req: ["n1_11", "n1_15", "n1_17"], lane: 4, row: 4 },
  { id: "n1_21", sect: "Palier I", label: "Chaussures Bonus Santé I", short: "Chaussures I", icon: "boot", color: "#57E07A", tier: 1, effect: "eq_bottes", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_26"], lane: 0, row: 5 },
  { id: "n1_07", sect: "Palier I", label: "Récompense Autonomie I", short: "Autonomie I", icon: "moon", color: "#8FC4FF", tier: 1, effect: "afkGain", per: 1, unit: "%", max: 5, times: PAL_T[0], req: ["n1_08", "n1_26"], lane: 1, row: 5 },
  { id: "n1_20", sect: "Palier I", label: "Anneau Bonus Dégâts I", short: "Anneau I", icon: "ring", color: "#FF5A5A", tier: 1, effect: "eq_anneau", per: 2, unit: "%", max: 5, times: PAL_T[0], req: ["n1_25"], lane: 2, row: 5 },
  { id: "n1_27", sect: "Palier I", label: "Œuf Légendaire Vitesse d'éclosion I", short: "Œuf Légend. I", icon: "egg", color: "#F5C542", tier: 1, effect: "hatch_LEGENDAIRE", per: 10, unit: "%", max: 5, times: PAL_T[0], req: ["n1_11", "n1_25", "n1_26", "n1_14"], lane: 3, row: 5 },
  { id: "n1_03", sect: "Palier I", label: "Chance de forger gratuitement I", short: "Forge Grat. I", icon: "hammer", color: "#F5C542", tier: 1, effect: "forgeFree", per: 1, unit: "%", max: 5, times: PAL_T[0], req: ["n1_02"], lane: 4, row: 5 },
  { id: "sp_slot1", sect: "Palier I", label: "+1 Slot d'Éclosion", short: "+1 Slot Éclosion", icon: "egg", color: "#57E07A", tier: 1, effect: "eggSlot", per: 1, unit: "", max: 1, times: PAL_T[0], req: ["n1_21"], lane: 0, row: 6, special: true },
  { id: "sp_forge1", sect: "Palier I", label: "Forge multiple ×2", short: "Forge ×2", icon: "hammer", color: "#E8B44A", tier: 1, effect: "forgeMult", per: 1, unit: "", max: 1, times: PAL_T[0], req: ["n1_14"], lane: 1, row: 6, special: true },
  { id: "n1_pc", sect: "Palier I", label: "Œuf Peu commun Vitesse d'éclosion I", short: "Œuf Peu com. I", icon: "egg", color: "#57E07A", tier: 1, effect: "hatch_PEU_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[0], req: ["n1_23"], lane: 2, row: 6 },
  { id: "sp_key1", sect: "Palier I", label: "+1 Clé Raid", short: "+1 Clé Raid", icon: "key", color: "#3FA7FF", tier: 1, effect: "raidKey", per: 1, unit: "", max: 1, times: PAL_T[0], req: ["n1_27"], lane: 3, row: 6, special: true, note: "Choix du Raid" },

  /* ---------------- PALIER II ---------------- */
  { id: "n2_06", sect: "Palier II", label: "Bonus Or global II", short: "Or Global II", icon: "gold", color: "#F5C542", tier: 2, effect: "goldAll", per: 1, unit: "%", max: 5, times: PAL_T[1], req: ["n1_14", "n1_03"], lane: 0, row: 7 },
  { id: "n2_16", sect: "Palier II", label: "Casque Bonus Santé II", short: "Casque II", icon: "helm", color: "#57E07A", tier: 2, effect: "eq_casque", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n1_21"], lane: 1, row: 7 },
  { id: "n2_05", sect: "Palier II", label: "Amélioration de Nœud Technologique Coût II", short: "Tech Coût II", icon: "gear", color: "#3FCFD6", tier: 2, effect: "techCost", per: -2, unit: "%", max: 5, times: PAL_T[1], req: ["n1_14", "n1_02", "n1_20"], lane: 2, row: 7 },
  { id: "n2_03", sect: "Palier II", label: "Chance de forger gratuitement II", short: "Forge Grat. II", icon: "hammer", color: "#F5C542", tier: 2, effect: "forgeFree", per: 1, unit: "%", max: 5, times: PAL_T[1], req: ["n1_02"], lane: 3, row: 7 },
  { id: "n2_26", sect: "Palier II", label: "Œuf Mythique Vitesse d'éclosion II", short: "Œuf Mythique II", icon: "egg", color: "#FF4D6A", tier: 2, effect: "hatch_MYTHIQUE", per: 10, unit: "%", max: 5, times: PAL_T[1], req: ["n1_02"], lane: 4, row: 7 },
  { id: "n2_21", sect: "Palier II", label: "Chaussures Bonus Santé II", short: "Chaussures II", icon: "boot", color: "#57E07A", tier: 2, effect: "eq_bottes", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_05", "n2_16"], lane: 0, row: 8 },
  { id: "n2_10", sect: "Palier II", label: "Compétence Passive Base Dégâts II", short: "Pass. Dég. II", icon: "swords", color: "#9B5CF6", tier: 2, effect: "passDmg", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_06", "n2_16", "n2_05"], lane: 1, row: 8 },
  { id: "n2_28", sect: "Palier II", label: "Chance d'obtenir 1 Œuf supplémentaire gratuitement II", short: "Œuf Suppl. II", icon: "egg", color: "#8FEFF4", tier: 2, effect: "eggFree", per: 1, unit: "%", max: 5, times: PAL_T[1], req: ["n2_16", "n2_06"], lane: 2, row: 8 },
  { id: "n2_08", sect: "Palier II", label: "Temps Récompense Autonomie II", short: "Tps Auton. II", icon: "cycle", color: "#8FC4FF", tier: 2, effect: "afkTime", per: 10, unit: "%", max: 5, times: PAL_T[1], req: ["n2_26"], lane: 3, row: 8 },
  { id: "n2_15", sect: "Palier II", label: "Arme Bonus Dégâts II", short: "Arme II", icon: "swords", color: "#FF5A5A", tier: 2, effect: "eq_arme", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_05", "n2_03", "n2_26"], lane: 4, row: 8 },
  { id: "n2_02", sect: "Palier II", label: "Forge Amélioration Coût II", short: "Forge Coût II", icon: "hammer", color: "#E8B44A", tier: 2, effect: "forgeCost", per: -1, unit: "%", max: 5, times: PAL_T[1], req: ["n2_28", "n2_10", "n2_06"], lane: 0, row: 9 },
  { id: "n2_19", sect: "Palier II", label: "Armure Bonus Santé II", short: "Armure II", icon: "armor", color: "#57E07A", tier: 2, effect: "eq_armure", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_21"], lane: 1, row: 9 },
  { id: "n2_13", sect: "Palier II", label: "Animal Bonus Dégâts II", short: "Animal Dég. II", icon: "paw", color: "#FF7A3D", tier: 2, effect: "petDmg", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_08", "n2_15"], lane: 2, row: 9 },
  { id: "n2_04", sect: "Palier II", label: "Recherche Technologique Vitesse du minuteur II", short: "Rech. Vit. II", icon: "clock", color: "#3FCFD6", tier: 2, effect: "research", per: 4, unit: "%", max: 5, times: PAL_T[1], req: ["n2_08"], lane: 3, row: 9 },
  { id: "n2_07", sect: "Palier II", label: "Récompense Autonomie II", short: "Autonomie II", icon: "moon", color: "#8FC4FF", tier: 2, effect: "afkGain", per: 1, unit: "%", max: 5, times: PAL_T[1], req: ["n2_08"], lane: 4, row: 9 },
  { id: "n2_25", sect: "Palier II", label: "Œuf Épique Vitesse d'éclosion II", short: "Œuf Épique II", icon: "egg", color: "#B15CF6", tier: 2, effect: "hatch_EPIQUE", per: 10, unit: "%", max: 5, times: PAL_T[1], req: ["n2_21", "n2_13", "n2_19"], lane: 0, row: 10 },
  { id: "n2_12", sect: "Palier II", label: "Compétence Invoquer Coût II", short: "Invoq. Coût II", icon: "sparkle", color: "#B15CF6", tier: 2, effect: "skillCost", per: -1, unit: "%", max: 5, times: PAL_T[1], req: ["n2_28", "n2_02"], lane: 1, row: 10 },
  { id: "n2_22", sect: "Palier II", label: "Ceinture Bonus Santé II", short: "Ceinture II", icon: "chain", color: "#57E07A", tier: 2, effect: "eq_ceinture", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_28", "n2_10"], lane: 2, row: 10 },
  { id: "n2_29", sect: "Palier II", label: "Chance d'obtenir 1 Compétence supplémentaire gratuitement II", short: "Comp. Suppl. II", icon: "sparkle", color: "#8FEFF4", tier: 2, effect: "skillFree", per: 1, unit: "%", max: 5, times: PAL_T[1], req: ["n2_08"], lane: 3, row: 10 },
  { id: "n2_09", sect: "Palier II", label: "Compétence Dégâts II", short: "Comp. Dég. II", icon: "sparkle", color: "#9B5CF6", tier: 2, effect: "skillDmg", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_04", "n2_13"], lane: 4, row: 10 },
  { id: "n2_24", sect: "Palier II", label: "Œuf Rare Vitesse d'éclosion II", short: "Œuf Rare II", icon: "egg", color: "#3FA7FF", tier: 2, effect: "hatch_RARE", per: 10, unit: "%", max: 5, times: PAL_T[1], req: ["n2_12", "n2_22"], lane: 0, row: 11 },
  { id: "n2_30", sect: "Palier II", label: "PE obtenus dans le Raid Évolution II", short: "PE Raid II", icon: "gem", color: "#3FB950", tier: 2, effect: "peRaid", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_29"], lane: 1, row: 11 },
  { id: "n2_01", sect: "Palier II", label: "Forge Amélioration Vitesse du minuteur II", short: "Forge Vit. II", icon: "hammer", color: "#E8B44A", tier: 2, effect: "forgeTime", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_25", "n2_12"], lane: 2, row: 11 },
  { id: "n2_20", sect: "Palier II", label: "Anneau Bonus Dégâts II", short: "Anneau II", icon: "ring", color: "#FF5A5A", tier: 2, effect: "eq_anneau", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_12", "n2_09"], lane: 3, row: 11 },
  { id: "n2_14", sect: "Palier II", label: "Animal Bonus Santé II", short: "Animal Santé II", icon: "paw", color: "#57E07A", tier: 2, effect: "petHp", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_22", "n2_07"], lane: 4, row: 11 },
  { id: "n2_11", sect: "Palier II", label: "Compétence Passive Base Santé II", short: "Pass. Santé II", icon: "heart", color: "#57E07A", tier: 2, effect: "passHp", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_01", "n2_30"], lane: 0, row: 12 },
  { id: "n2_27", sect: "Palier II", label: "Œuf Légendaire Vitesse d'éclosion II", short: "Œuf Légend. II", icon: "egg", color: "#F5C542", tier: 2, effect: "hatch_LEGENDAIRE", per: 10, unit: "%", max: 5, times: PAL_T[1], req: ["n2_20"], lane: 1, row: 12 },
  { id: "n2_18", sect: "Palier II", label: "Collier Bonus Dégâts II", short: "Collier II", icon: "gem", color: "#FF5A5A", tier: 2, effect: "eq_collier", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_24"], lane: 2, row: 12 },
  { id: "n2_23", sect: "Palier II", label: "Œuf Commun Vitesse d'éclosion II", short: "Œuf Commun II", icon: "egg", color: "#9FB0C8", tier: 2, effect: "hatch_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[1], req: ["n2_30"], lane: 3, row: 12 },
  { id: "n2_17", sect: "Palier II", label: "Gants Bonus Dégâts II", short: "Gants II", icon: "glove", color: "#FF5A5A", tier: 2, effect: "eq_gants", per: 2, unit: "%", max: 5, times: PAL_T[1], req: ["n2_20", "n2_14"], lane: 4, row: 12 },
  { id: "sp_forge3", sect: "Palier II", label: "Forge multiple ×4", short: "Forge ×4", icon: "hammer", color: "#E8B44A", tier: 2, effect: "forgeMult", per: 2, unit: "", max: 1, times: PAL_T[1], req: ["sp_forge1", "n2_18"], lane: 2, row: 13, special: true },
  { id: "n2_pc", sect: "Palier II", label: "Œuf Peu commun Vitesse d'éclosion II", short: "Œuf Peu com. II", icon: "egg", color: "#57E07A", tier: 2, effect: "hatch_PEU_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[1], req: ["n1_pc", "n2_23"], lane: 3, row: 13 },
  { id: "sp_key2", sect: "Palier II", label: "+1 Clé Raid", short: "+1 Clé Raid", icon: "key", color: "#3FA7FF", tier: 2, effect: "raidKey", per: 1, unit: "", max: 1, times: PAL_T[1], req: ["n2_17"], lane: 4, row: 13, special: true, note: "Choix du Raid" },

  /* ---------------- PALIER III ---------------- */
  { id: "n3_28", sect: "Palier III", label: "Chance d'obtenir 1 Œuf supplémentaire gratuitement III", short: "Œuf Suppl. III", icon: "egg", color: "#8FEFF4", tier: 3, effect: "eggFree", per: 1, unit: "%", max: 5, times: PAL_T[2], req: ["n2_11"], lane: 0, row: 14 },
  { id: "n3_03", sect: "Palier III", label: "Chance de forger gratuitement III", short: "Forge Grat. III", icon: "hammer", color: "#F5C542", tier: 3, effect: "forgeFree", per: 1, unit: "%", max: 5, times: PAL_T[2], req: ["n2_11"], lane: 1, row: 14 },
  { id: "n3_04", sect: "Palier III", label: "Recherche Technologique Vitesse du minuteur III", short: "Rech. Vit. III", icon: "clock", color: "#3FCFD6", tier: 3, effect: "research", per: 4, unit: "%", max: 5, times: PAL_T[2], req: ["n2_18"], lane: 2, row: 14 },
  { id: "n3_21", sect: "Palier III", label: "Chaussures Bonus Santé III", short: "Chaussures III", icon: "boot", color: "#57E07A", tier: 3, effect: "eq_bottes", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n2_17", "n2_30"], lane: 3, row: 14 },
  { id: "n3_12", sect: "Palier III", label: "Compétence Invoquer Coût III", short: "Invoq. Coût III", icon: "sparkle", color: "#B15CF6", tier: 3, effect: "skillCost", per: -1, unit: "%", max: 5, times: PAL_T[2], req: ["n2_20"], lane: 4, row: 14 },
  { id: "n3_14", sect: "Palier III", label: "Animal Bonus Santé III", short: "Animal Santé III", icon: "paw", color: "#57E07A", tier: 3, effect: "petHp", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_03", "n3_04"], lane: 0, row: 15 },
  { id: "n3_06", sect: "Palier III", label: "Bonus Or global III", short: "Or Global III", icon: "gold", color: "#F5C542", tier: 3, effect: "goldAll", per: 1, unit: "%", max: 5, times: PAL_T[2], req: ["n3_21", "n3_04", "n3_28"], lane: 1, row: 15 },
  { id: "n3_19", sect: "Palier III", label: "Armure Bonus Santé III", short: "Armure III", icon: "armor", color: "#57E07A", tier: 3, effect: "eq_armure", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_21"], lane: 2, row: 15 },
  { id: "n3_24", sect: "Palier III", label: "Œuf Rare Vitesse d'éclosion III", short: "Œuf Rare III", icon: "egg", color: "#3FA7FF", tier: 3, effect: "hatch_RARE", per: 10, unit: "%", max: 5, times: PAL_T[2], req: ["n3_12"], lane: 3, row: 15 },
  { id: "n3_01", sect: "Palier III", label: "Forge Amélioration Vitesse du minuteur III", short: "Forge Vit. III", icon: "hammer", color: "#E8B44A", tier: 3, effect: "forgeTime", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_21"], lane: 4, row: 15 },
  { id: "n3_22", sect: "Palier III", label: "Ceinture Bonus Santé III", short: "Ceinture III", icon: "chain", color: "#57E07A", tier: 3, effect: "eq_ceinture", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_06", "n3_14"], lane: 0, row: 16 },
  { id: "n3_23", sect: "Palier III", label: "Œuf Commun Vitesse d'éclosion III", short: "Œuf Commun III", icon: "egg", color: "#9FB0C8", tier: 3, effect: "hatch_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[2], req: ["n3_24"], lane: 1, row: 16 },
  { id: "n3_07", sect: "Palier III", label: "Récompense Autonomie III", short: "Autonomie III", icon: "moon", color: "#8FC4FF", tier: 3, effect: "afkGain", per: 1, unit: "%", max: 5, times: PAL_T[2], req: ["n3_21", "n3_24"], lane: 2, row: 16 },
  { id: "n3_02", sect: "Palier III", label: "Forge Amélioration Coût III", short: "Forge Coût III", icon: "hammer", color: "#E8B44A", tier: 3, effect: "forgeCost", per: -1, unit: "%", max: 5, times: PAL_T[2], req: ["n3_19", "n3_12", "n3_01"], lane: 3, row: 16 },
  { id: "n3_20", sect: "Palier III", label: "Anneau Bonus Dégâts III", short: "Anneau III", icon: "ring", color: "#FF5A5A", tier: 3, effect: "eq_anneau", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_24"], lane: 4, row: 16 },
  { id: "n3_17", sect: "Palier III", label: "Gants Bonus Dégâts III", short: "Gants III", icon: "glove", color: "#FF5A5A", tier: 3, effect: "eq_gants", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_23"], lane: 0, row: 17 },
  { id: "n3_09", sect: "Palier III", label: "Compétence Dégâts III", short: "Comp. Dég. III", icon: "sparkle", color: "#9B5CF6", tier: 3, effect: "skillDmg", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_07"], lane: 1, row: 17 },
  { id: "n3_25", sect: "Palier III", label: "Œuf Épique Vitesse d'éclosion III", short: "Œuf Épique III", icon: "egg", color: "#B15CF6", tier: 3, effect: "hatch_EPIQUE", per: 10, unit: "%", max: 5, times: PAL_T[2], req: ["n3_02", "n3_22"], lane: 2, row: 17 },
  { id: "n3_05", sect: "Palier III", label: "Amélioration de Nœud Technologique Coût III", short: "Tech Coût III", icon: "gear", color: "#3FCFD6", tier: 3, effect: "techCost", per: -2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_07"], lane: 3, row: 17 },
  { id: "n3_16", sect: "Palier III", label: "Casque Bonus Santé III", short: "Casque III", icon: "helm", color: "#57E07A", tier: 3, effect: "eq_casque", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_02", "n3_20"], lane: 4, row: 17 },
  { id: "n3_30", sect: "Palier III", label: "PE obtenus dans le Raid Évolution III", short: "PE Raid III", icon: "gem", color: "#3FB950", tier: 3, effect: "peRaid", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_25", "n3_23"], lane: 0, row: 18 },
  { id: "n3_18", sect: "Palier III", label: "Collier Bonus Dégâts III", short: "Collier III", icon: "gem", color: "#FF5A5A", tier: 3, effect: "eq_collier", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_25", "n3_23", "n3_17"], lane: 1, row: 18 },
  { id: "n3_29", sect: "Palier III", label: "Chance d'obtenir 1 Compétence supplémentaire gratuitement III", short: "Comp. Suppl. III", icon: "sparkle", color: "#8FEFF4", tier: 3, effect: "skillFree", per: 1, unit: "%", max: 5, times: PAL_T[2], req: ["n3_05"], lane: 2, row: 18 },
  { id: "n3_11", sect: "Palier III", label: "Compétence Passive Base Santé III", short: "Pass. Santé III", icon: "heart", color: "#57E07A", tier: 3, effect: "passHp", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_07", "n3_16"], lane: 3, row: 18 },
  { id: "n3_26", sect: "Palier III", label: "Œuf Mythique Vitesse d'éclosion III", short: "Œuf Mythique III", icon: "egg", color: "#FF4D6A", tier: 3, effect: "hatch_MYTHIQUE", per: 10, unit: "%", max: 5, times: PAL_T[2], req: ["n3_20"], lane: 4, row: 18 },
  { id: "n3_27", sect: "Palier III", label: "Œuf Légendaire Vitesse d'éclosion III", short: "Œuf Légend. III", icon: "egg", color: "#F5C542", tier: 3, effect: "hatch_LEGENDAIRE", per: 10, unit: "%", max: 5, times: PAL_T[2], req: ["n3_09"], lane: 0, row: 19 },
  { id: "n3_15", sect: "Palier III", label: "Arme Bonus Dégâts III", short: "Arme III", icon: "swords", color: "#FF5A5A", tier: 3, effect: "eq_arme", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_30"], lane: 1, row: 19 },
  { id: "n3_10", sect: "Palier III", label: "Compétence Passive Base Dégâts III", short: "Pass. Dég. III", icon: "swords", color: "#9B5CF6", tier: 3, effect: "passDmg", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_18"], lane: 2, row: 19 },
  { id: "n3_13", sect: "Palier III", label: "Animal Bonus Dégâts III", short: "Animal Dég. III", icon: "paw", color: "#FF7A3D", tier: 3, effect: "petDmg", per: 2, unit: "%", max: 5, times: PAL_T[2], req: ["n3_18", "n3_26"], lane: 3, row: 19 },
  { id: "n3_08", sect: "Palier III", label: "Temps Récompense Autonomie III", short: "Tps Auton. III", icon: "cycle", color: "#8FC4FF", tier: 3, effect: "afkTime", per: 10, unit: "%", max: 5, times: PAL_T[2], req: ["n3_11", "n3_29"], lane: 4, row: 19 },
  { id: "sp_forge5", sect: "Palier III", label: "Forge multiple ×5", short: "Forge ×5", icon: "hammer", color: "#E8B44A", tier: 3, effect: "forgeMult", per: 1, unit: "", max: 1, times: PAL_T[2], req: ["sp_forge3", "n3_15"], lane: 1, row: 20, special: true },
  { id: "sp_forge10", sect: "Palier III", label: "Forge multiple ×10", short: "Forge ×10", icon: "hammer", color: "#F5C542", tier: 3, effect: "forgeMult", per: 5, unit: "", max: 1, times: PAL_T[2], req: ["sp_forge5", "n3_10"], lane: 2, row: 20, special: true },
  { id: "n3_pc", sect: "Palier III", label: "Œuf Peu commun Vitesse d'éclosion III", short: "Œuf Peu com. III", icon: "egg", color: "#57E07A", tier: 3, effect: "hatch_PEU_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[2], req: ["n2_pc", "n3_23"], lane: 3, row: 20 },
  { id: "sp_key3", sect: "Palier III", label: "+1 Clé Raid", short: "+1 Clé Raid", icon: "key", color: "#3FA7FF", tier: 3, effect: "raidKey", per: 1, unit: "", max: 1, times: PAL_T[2], req: ["n3_08"], lane: 4, row: 20, special: true, note: "Choix du Raid" },

  /* ---------------- PALIER IV ---------------- */
  { id: "n4_26", sect: "Palier IV", label: "Œuf Mythique Vitesse d'éclosion IV", short: "Œuf Mythique IV", icon: "egg", color: "#FF4D6A", tier: 4, effect: "hatch_MYTHIQUE", per: 10, unit: "%", max: 5, times: PAL_T[3], req: ["n3_27"], lane: 0, row: 21 },
  { id: "n4_06", sect: "Palier IV", label: "Bonus Or global IV", short: "Or Global IV", icon: "gold", color: "#F5C542", tier: 4, effect: "goldAll", per: 1, unit: "%", max: 5, times: PAL_T[3], req: ["n3_27"], lane: 1, row: 21 },
  { id: "n4_15", sect: "Palier IV", label: "Arme Bonus Dégâts IV", short: "Arme IV", icon: "swords", color: "#FF5A5A", tier: 4, effect: "eq_arme", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n3_10"], lane: 2, row: 21 },
  { id: "n4_16", sect: "Palier IV", label: "Casque Bonus Santé IV", short: "Casque IV", icon: "helm", color: "#57E07A", tier: 4, effect: "eq_casque", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n3_08", "n3_11"], lane: 3, row: 21 },
  { id: "n4_01", sect: "Palier IV", label: "Forge Amélioration Vitesse du minuteur IV", short: "Forge Vit. IV", icon: "hammer", color: "#E8B44A", tier: 4, effect: "forgeTime", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n3_08", "n3_18"], lane: 4, row: 21 },
  { id: "n4_02", sect: "Palier IV", label: "Forge Amélioration Coût IV", short: "Forge Coût IV", icon: "hammer", color: "#E8B44A", tier: 4, effect: "forgeCost", per: -1, unit: "%", max: 5, times: PAL_T[3], req: ["n4_06", "n4_15", "n4_26"], lane: 0, row: 22 },
  { id: "n4_17", sect: "Palier IV", label: "Gants Bonus Dégâts IV", short: "Gants IV", icon: "glove", color: "#FF5A5A", tier: 4, effect: "eq_gants", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_15", "n4_16"], lane: 1, row: 22 },
  { id: "n4_12", sect: "Palier IV", label: "Compétence Invoquer Coût IV", short: "Invoq. Coût IV", icon: "sparkle", color: "#B15CF6", tier: 4, effect: "skillCost", per: -1, unit: "%", max: 5, times: PAL_T[3], req: ["n4_06", "n4_26"], lane: 2, row: 22 },
  { id: "n4_25", sect: "Palier IV", label: "Œuf Épique Vitesse d'éclosion IV", short: "Œuf Épique IV", icon: "egg", color: "#B15CF6", tier: 4, effect: "hatch_EPIQUE", per: 10, unit: "%", max: 5, times: PAL_T[3], req: ["n4_15", "n4_01"], lane: 3, row: 22 },
  { id: "n4_14", sect: "Palier IV", label: "Animal Bonus Santé IV", short: "Animal Santé IV", icon: "paw", color: "#57E07A", tier: 4, effect: "petHp", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_15"], lane: 4, row: 22 },
  { id: "n4_19", sect: "Palier IV", label: "Armure Bonus Santé IV", short: "Armure IV", icon: "armor", color: "#57E07A", tier: 4, effect: "eq_armure", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_17", "n4_06", "n4_02"], lane: 0, row: 23 },
  { id: "n4_04", sect: "Palier IV", label: "Recherche Technologique Vitesse du minuteur IV", short: "Rech. Vit. IV", icon: "clock", color: "#3FCFD6", tier: 4, effect: "research", per: 4, unit: "%", max: 5, times: PAL_T[3], req: ["n4_12"], lane: 1, row: 23 },
  { id: "n4_30", sect: "Palier IV", label: "PE obtenus dans le Raid Évolution IV", short: "PE Raid IV", icon: "gem", color: "#3FB950", tier: 4, effect: "peRaid", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_25"], lane: 2, row: 23 },
  { id: "n4_09", sect: "Palier IV", label: "Compétence Dégâts IV", short: "Comp. Dég. IV", icon: "sparkle", color: "#9B5CF6", tier: 4, effect: "skillDmg", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_14"], lane: 3, row: 23 },
  { id: "n4_22", sect: "Palier IV", label: "Ceinture Bonus Santé IV", short: "Ceinture IV", icon: "chain", color: "#57E07A", tier: 4, effect: "eq_ceinture", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_25", "n4_12", "n4_14"], lane: 4, row: 23 },
  { id: "n4_07", sect: "Palier IV", label: "Récompense Autonomie IV", short: "Autonomie IV", icon: "moon", color: "#8FC4FF", tier: 4, effect: "afkGain", per: 1, unit: "%", max: 5, times: PAL_T[3], req: ["n4_04"], lane: 0, row: 24 },
  { id: "n4_23", sect: "Palier IV", label: "Œuf Commun Vitesse d'éclosion IV", short: "Œuf Commun IV", icon: "egg", color: "#9FB0C8", tier: 4, effect: "hatch_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[3], req: ["n4_12", "n4_19"], lane: 1, row: 24 },
  { id: "n4_27", sect: "Palier IV", label: "Œuf Légendaire Vitesse d'éclosion IV", short: "Œuf Légend. IV", icon: "egg", color: "#F5C542", tier: 4, effect: "hatch_LEGENDAIRE", per: 10, unit: "%", max: 5, times: PAL_T[3], req: ["n4_25", "n4_22"], lane: 2, row: 24 },
  { id: "n4_03", sect: "Palier IV", label: "Chance de forger gratuitement IV", short: "Forge Grat. IV", icon: "hammer", color: "#F5C542", tier: 4, effect: "forgeFree", per: 1, unit: "%", max: 5, times: PAL_T[3], req: ["n4_04"], lane: 3, row: 24 },
  { id: "n4_29", sect: "Palier IV", label: "Chance d'obtenir 1 Compétence supplémentaire gratuitement IV", short: "Comp. Suppl. IV", icon: "sparkle", color: "#8FEFF4", tier: 4, effect: "skillFree", per: 1, unit: "%", max: 5, times: PAL_T[3], req: ["n4_09", "n4_25", "n4_30"], lane: 4, row: 24 },
  { id: "n4_05", sect: "Palier IV", label: "Amélioration de Nœud Technologique Coût IV", short: "Tech Coût IV", icon: "gear", color: "#3FCFD6", tier: 4, effect: "techCost", per: -2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_19", "n4_23"], lane: 0, row: 25 },
  { id: "n4_10", sect: "Palier IV", label: "Compétence Passive Base Dégâts IV", short: "Pass. Dég. IV", icon: "swords", color: "#9B5CF6", tier: 4, effect: "passDmg", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_07", "n4_23"], lane: 1, row: 25 },
  { id: "n4_18", sect: "Palier IV", label: "Collier Bonus Dégâts IV", short: "Collier IV", icon: "gem", color: "#FF5A5A", tier: 4, effect: "eq_collier", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_29", "n4_07"], lane: 2, row: 25 },
  { id: "n4_08", sect: "Palier IV", label: "Temps Récompense Autonomie IV", short: "Tps Auton. IV", icon: "cycle", color: "#8FC4FF", tier: 4, effect: "afkTime", per: 10, unit: "%", max: 5, times: PAL_T[3], req: ["n4_27", "n4_03"], lane: 3, row: 25 },
  { id: "n4_21", sect: "Palier IV", label: "Chaussures Bonus Santé IV", short: "Chaussures IV", icon: "boot", color: "#57E07A", tier: 4, effect: "eq_bottes", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_09", "n4_03"], lane: 4, row: 25 },
  { id: "n4_20", sect: "Palier IV", label: "Anneau Bonus Dégâts IV", short: "Anneau IV", icon: "ring", color: "#FF5A5A", tier: 4, effect: "eq_anneau", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_18"], lane: 0, row: 26 },
  { id: "n4_13", sect: "Palier IV", label: "Animal Bonus Dégâts IV", short: "Animal Dég. IV", icon: "paw", color: "#FF7A3D", tier: 4, effect: "petDmg", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_18", "n4_05"], lane: 1, row: 26 },
  { id: "n4_11", sect: "Palier IV", label: "Compétence Passive Base Santé IV", short: "Pass. Santé IV", icon: "heart", color: "#57E07A", tier: 4, effect: "passHp", per: 2, unit: "%", max: 5, times: PAL_T[3], req: ["n4_18", "n4_10", "n4_21"], lane: 2, row: 26 },
  { id: "n4_24", sect: "Palier IV", label: "Œuf Rare Vitesse d'éclosion IV", short: "Œuf Rare IV", icon: "egg", color: "#3FA7FF", tier: 4, effect: "hatch_RARE", per: 10, unit: "%", max: 5, times: PAL_T[3], req: ["n4_10"], lane: 3, row: 26 },
  { id: "n4_28", sect: "Palier IV", label: "Chance d'obtenir 1 Œuf supplémentaire gratuitement IV", short: "Œuf Suppl. IV", icon: "egg", color: "#8FEFF4", tier: 4, effect: "eggFree", per: 1, unit: "%", max: 5, times: PAL_T[3], req: ["n4_29", "n4_08"], lane: 4, row: 26 },
  { id: "n4_pc", sect: "Palier IV", label: "Œuf Peu commun Vitesse d'éclosion IV", short: "Œuf Peu com. IV", icon: "egg", color: "#57E07A", tier: 4, effect: "hatch_PEU_COMMUN", per: 10, unit: "%", max: 5, times: PAL_T[3], req: ["n3_pc", "n4_23"], lane: 1, row: 27 },
  { id: "sp_key4", sect: "Palier IV", label: "+1 Clé Raid", short: "+1 Clé Raid", icon: "key", color: "#3FA7FF", tier: 4, effect: "raidKey", per: 1, unit: "", max: 1, times: PAL_T[3], req: ["n4_11"], lane: 2, row: 27, special: true, note: "Choix du Raid" },
  { id: "sp_slot2", sect: "Palier IV", label: "+1 Slot d'Éclosion", short: "+1 Slot Éclosion", icon: "egg", color: "#57E07A", tier: 4, effect: "eggSlot", per: 1, unit: "", max: 1, times: PAL_T[3], req: ["n4_28"], lane: 4, row: 27, special: true },
];





const TREE_BY_ID = {};
TREE_NODES.forEach((n) => {
  n.cost = Math.max(1, Math.round(PE_TIER_COST[n.tier - 1] * PE_FIRST_MUL));
  n.x = TREE_LANE_X[n.lane];
  n.y = TREE_ROW_Y(n.row);
  TREE_BY_ID[n.id] = n;
});
const TREE_TOTAL_LEVELS = TREE_NODES.reduce((a, n) => a + n.max, 0);

const ACCEL_DEFS = [
  { key: "a1",  mins: 1,  label: "1 min" },
  { key: "a5",  mins: 5,  label: "5 min" },
  { key: "a15", mins: 15, label: "15 min" },
  { key: "a30", mins: 30, label: "30 min" },
  { key: "a60", mins: 60, label: "1 h" },
];

const ASCENSION_GEMS = [1000, 1500, 2000];
const ASCENSION_NAMES = ["Ascension I", "Ascension II", "Ascension III"];

const GEM_PACKS = [
  { gems: 290,  price: "1,99 €" },
  { gems: 980,  price: "5,99 €" },
  { gems: 2040, price: "11,99 €" },
];

const EVENT_MISSIONS = [
  { id: "login",   label: "Se connecter",              reward: "3× Accél. 1 min",  accel: "a1x3" },
  { id: "floors",  label: "Monter 5 étages",           reward: "5× Accél. 1 min",  accel: "a1x5" },
  { id: "forge",   label: "Forger 3 fois",             reward: "3× Accél. 5 min",  accel: "a5x3" },
  { id: "hatch",   label: "Éclore / fusionner 2 fois", reward: "2× Accél. 5 min",  accel: "a5x2" },
  { id: "mission", label: "Terminer les missions",     reward: "1× Accél. 15 min", accel: "a15x1" },
  { id: "hard",    label: "Battre un Boss majeur",     reward: "1× Accél. 30 min", accel: "a30x1" },
];

/* ----------------------- guided progression -----------------------
   Milestones are intentionally derived from real save data. They do not add a
   second quest economy: the reward is the unlock/progression itself. */
function hasEquipRarity(st, rarity) {
  return Object.values(st.equipped || {}).some((it) => it && it.rarity === rarity) ||
    (st.inventory || []).some((it) => it && it.rarity === rarity);
}
function hasEquipAtLeast(st, rarity) {
  const order = ["COMMUN","RARE","EPIQUE","MYTHIQUE","ARTEFACT","LEGENDAIRE","INFERNAL","IMMORTEL","DIVIN"];
  const need = order.indexOf(rarity);
  return Object.values(st.equipped || {}).concat(st.inventory || []).some((it) => it && order.indexOf(it.rarity) >= need);
}
function hasPetAtLeast(st, rarity) {
  const order = ["COMMUN","PEU_COMMUN","RARE","EPIQUE","MYTHIQUE","LEGENDAIRE","DIVIN"];
  const need = order.indexOf(rarity);
  return (st.pets || []).some((pet) => pet && order.indexOf(pet.rarity) >= need);
}
function progressionGoals(st) {
  const raidEvo = st.raids && st.raids.evolution ? st.raids.evolution.record || 0 : 0;
  const mega = st.megaBossClears ? Object.keys(st.megaBossClears).filter((k) => st.megaBossClears[k]).length : 0;
  const fusions = st.sanctuary ? st.sanctuary.fusions || 0 : 0;
  const skillEquipped = (st.skillSlots || []).slice(0, 3).filter(Boolean).length;
  const skillMax = Object.values(st.skills || {}).reduce((m, x) => Math.max(m, Number(x && x.level) || 0), 0);
  const treeNodes = Object.values((st.tree && st.tree.levels) || {}).filter((lv) => Number(lv) > 0).length;
  const floor = st.recordFloor || 1, forge = (st.forge && st.forge.level) || 1;
  const rebirths = (st.rebirth && st.rebirth.count) || 0;
  const goal = (id,title,why,now,max,category,go,priority,prereq=true) => ({
    id,title,why,now:Math.min(Number(now)||0,max),max,done:(Number(now)||0)>=max,category,go,priority,prereq
  });
  return [
    goal("floor5","Atteindre l’étage 5","Progresse dans la campagne et prépare les premiers Élites.",floor,5,"campagne","accueil",100),
    goal("forge3","Forge niveau 3","Renforce l’équipement avant les premiers vrais paliers.",forge,3,"developpement","accueil",96),
    goal("floor10","Vaincre le Boss de l’étage 10","Premier grand jalon de la campagne.",floor,10,"campagne","accueil",94),
    goal("skills3","Équiper 3 compétences","Construis une vraie rotation de combat.",skillEquipped,3,"developpement","competences",88,floor>=5),
    goal("rareGear","Obtenir un équipement Rare","Commence à construire un build avec des affixes.",hasEquipAtLeast(st,"RARE")?1:0,1,"developpement","equipement",86,forge>=2),
    goal("floor25","Atteindre l’étage 25","Débloque le Rebirth et la progression permanente.",floor,25,"campagne","accueil",92,floor>=10),
    goal("rebirth1","Effectuer ton premier Rebirth","Transforme la campagne en progression permanente.",rebirths,1,"progression","rebirth",91,floor>=25),
    goal("raidEvo3","Raid Évolution niveau 3","Obtiens des PE pour développer ton Arbre personnel.",raidEvo,3,"defi","raid",82,floor>=10),
    goal("tree3","Activer 3 nœuds de l’Arbre","Commence à spécialiser durablement ta progression.",treeNodes,3,"developpement","arbre",80,raidEvo>=1 || treeNodes>0),
    goal("skill5","Améliorer une compétence niveau 5","Fais progresser une compétence clé de ton build.",skillMax,5,"developpement","competences",74,skillEquipped>=3),
    goal("forge10","Forge niveau 10","Accède plus régulièrement aux équipements puissants.",forge,10,"developpement","accueil",76,floor>=20),
    goal("epicGear","Obtenir un équipement Épique","Fais évoluer ton build au-delà des premiers affixes.",hasEquipAtLeast(st,"EPIQUE")?1:0,1,"developpement","equipement",72,forge>=6),
    goal("rarePet","Obtenir un Familier Rare","Ajoute une spécialisation élémentaire à ton build.",hasPetAtLeast(st,"RARE")?1:0,1,"developpement","familiers",70,floor>=20),
    goal("floor50","Atteindre l’étage 50","Débloque les Méga-Boss.",floor,50,"campagne","accueil",90,floor>=25),
    goal("mega1","Vaincre ton premier Méga-Boss","Débloque le Sanctuaire et ses fusions.",mega,1,"defi","mega",89,floor>=50),
    goal("fusion1","Réussir une fusion au Sanctuaire","Transforme les ressources accumulées en nouvelles récompenses.",fusions,1,"developpement","sanctuaire",89,mega>=1),
    goal("floor100","Atteindre l’étage 100","Entre dans la progression avancée de Shadowreach.",floor,100,"campagne","accueil",88,floor>=50),
    goal("rebirth5","Effectuer 5 Rebirth","Consolide tes bonus permanents avant l’endgame.",rebirths,5,"progression","rebirth",73,rebirths>=1),
    goal("forge25","Forge niveau 25","Atteins le cœur de la progression d’équipement.",forge,25,"developpement","accueil",68,forge>=10),
  ];
}
function goalProgressPct(g) { return Math.max(0,Math.min(100,Math.round((Number(g.now)||0)/Math.max(1,Number(g.max)||1)*100))); }
function goalScore(g) {
  // Priority decides importance; progress gently favours a goal the player is already close to.
  return (g.priority || 0) + goalProgressPct(g) * .015;
}
function currentPrimaryGoal(st) {
  const candidates = progressionGoals(st).filter((g) => !g.done && g.prereq);
  if (candidates.length) return candidates.sort((a,b) => goalScore(b)-goalScore(a))[0];
  return {id:"mastery",title:"Repousser ton record",why:"Perfectionne ton build et pousse la campagne plus loin.",now:st.recordFloor||1,max:Math.max(100,(st.recordFloor||1)+10),done:false,category:"campagne",go:"accueil"};
}
function secondaryGoals(st, primaryId) {
  const pool = progressionGoals(st).filter((g) => !g.done && g.prereq && g.id !== primaryId);
  const primary = progressionGoals(st).find((g)=>g.id===primaryId);
  const wanted = ["developpement","defi","progression","campagne"].filter((c)=>!primary || c!==primary.category);
  const out=[];
  wanted.forEach((cat)=>{
    if(out.length>=2)return;
    const matches=pool.filter((g)=>g.category===cat).sort((a,b)=>goalScore(b)-goalScore(a));
    if(matches[0]&&!out.some((x)=>x.id===matches[0].id))out.push(matches[0]);
  });
  if(out.length<2) pool.sort((a,b)=>goalScore(b)-goalScore(a)).forEach((g)=>{if(out.length<2&&!out.some((x)=>x.id===g.id))out.push(g);});
  return out;
}
function nextUnlockGoal(st) {
  const mega = st.megaBossClears ? Object.keys(st.megaBossClears).some((k) => st.megaBossClears[k]) : false;
  const candidates = [
    {title:"Rebirth", note:"Étage 25", detail:"Convertis une partie de ta progression en PR permanents.", now:Math.min(st.recordFloor||1,25), max:25, done:(st.recordFloor||1)>=25, go:"rebirth"},
    {title:"Méga-Boss", note:"Étage 50", detail:"Affronte des versions extrêmes des Boss et ouvre la voie au Sanctuaire.", now:Math.min(st.recordFloor||1,50), max:50, done:(st.recordFloor||1)>=50, go:"mega"},
    {title:"Sanctuaire", note:"Vaincre un Méga-Boss", detail:"Fusionne tes ressources pour découvrir des recettes spéciales.", now:mega?1:0, max:1, done:mega, go:"sanctuaire"},
  ];
  return candidates.find((x) => !x.done) || null;
}
let goalNoticeTimer = 0;
let observedGoal = null;
let observedGoalDone = null;
function queueGoalAdvance(before, after, completed) {
  if (!before || !after || before.id === after.id) return;
  clearTimeout(goalNoticeTimer);
  // A primary objective may change simply because another objective became more
  // relevant. Only announce completion when the previous objective is actually
  // complete in the current state. Priority changes stay silent.
  if (completed) {
    toast("✓ Objectif terminé · " + before.title, true);
    goalNoticeTimer = setTimeout(() => toast("Nouvel objectif · " + after.title, true), 1350);
  }
}
function trackGoalProgress(st) {
  const goals = progressionGoals(st);
  const now = currentPrimaryGoal(st);
  const doneNow = new Set(goals.filter((g) => g.done).map((g) => g.id));
  if (!observedGoal) {
    observedGoal = {id:now.id,title:now.title};
    observedGoalDone = doneNow;
    return;
  }
  if (observedGoal.id !== now.id) {
    const before = observedGoal;
    const completed = doneNow.has(before.id);
    observedGoal = {id:now.id,title:now.title};
    observedGoalDone = doneNow;
    queueGoalAdvance(before, now, completed);
    return;
  }
  observedGoalDone = doneNow;
}
function goalCategoryLabel(cat){return cat==="developpement"?"Développement":cat==="defi"?"Défi":cat==="progression"?"Progression":"Campagne";}
function progressionGoalHTML(st) {
  const g = currentPrimaryGoal(st), pct = goalProgressPct(g), subs = secondaryGoals(st,g.id), unlock = nextUnlockGoal(st);
  return '<details class="goalCard" data-goal-details="1"' + (goalDetailsOpen ? ' open' : '') + '>' +
    '<summary style="list-style:none;cursor:pointer">' +
      '<div class="goalHead">' + ic("target",11) + ' Objectif actuel <span class="flex1"></span><span style="color:var(--textDim);font-size:8px">DÉTAILS ›</span></div>' +
      '<div class="goalTitle">' + esc(g.title) + '</div>' +
      '<div class="goalBar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="goalMeta"><span>' + Math.floor(g.now) + ' / ' + Math.floor(g.max) + '</span><b>' + pct + '%</b></div>' +
      '<div class="goalWhy" style="margin-top:5px">' + (subs.length ? subs.length + ' objectifs conseillés' : 'Progression libre') + (unlock ? ' · Prochain : ' + esc(unlock.title) + ' · ' + esc(unlock.note) : '') + '</div>' +
    '</summary>' +
    '<div style="padding-top:7px;border-top:1px solid #263958;margin-top:7px">' +
      '<div class="goalWhy">' + esc(g.why) + '</div>' +
      (g.go ? '<button class="btn blue sm" data-act="go" data-arg="' + esc(g.go) + '" data-primary="true" style="width:100%;margin-top:7px">ALLER À L’OBJECTIF</button>' : '') +
      (subs.length ? '<div class="goalSub">' + subs.map((x) => '<div class="goalChip" data-act="go" data-arg="' + esc(x.go||"accueil") + '" style="cursor:pointer"><b>' + esc(goalCategoryLabel(x.category)) + ' · ' + esc(x.title) + '</b><span>' + Math.floor(x.now) + ' / ' + Math.floor(x.max) + ' · ouvrir ›</span></div>').join('') + '</div>' : '') +
      (unlock ? '<div class="goalUnlock" data-act="goalUnlockInfo" style="cursor:pointer">' + ic("lock",13) + '<div class="flex1"><b>PROCHAIN DÉBLOCAGE · ' + esc(unlock.title) + '</b><br><span>' + esc(unlock.note) + ' · ' + Math.floor(unlock.now) + ' / ' + Math.floor(unlock.max) + ' · détails ›</span></div></div>' : '') +
    '</div></details>';
}

/* ---------------------------- state.ts ---------------------------- */
const AW = 320;          // logical arena width
const HERO_START = 34;
/* How far a ranged enemy stops from the hero. Section 19; see the tick loop. */
const ENEMY_FIRE_RANGE = 110;

function todayStr() { return new Date().toISOString().slice(0, 10); }
function rid() { return Math.random().toString(36).slice(2, 9); }

function defaultState(name) {
  return {
    version: SAVE_VERSION, playerName: name,
    level: 1, exp: 0, statPoints: 0,
    stats: { sante: 0, degats: 0, crit: 0, critred: 0 },
    gold: 100, gems: 0, minerai: 400, poussiere: 0, eclat: 0, essence: 0, apples: 0,
    floor: 1, step: 1, recordFloor: 1, checkpoint: 1, bossClears: {}, megaBossClears: {},
    equipped: { arme: null, casque: null, armure: null, gants: null, bottes: null,
      collier: null, anneau: null, ceinture: null },
    inventory: [],
    forge: { level: 1, summonCount: 0, masteryLevel: 0, masteryProgress: 0, autoForge: false, upgradeEnd: 0,
      // section 14: nothing is filtered out until the player says so
      filter: false, keep: forgeKeepAll() },
    skills: {}, skillSlots: [null, null, null, null, null],
    skillMastery: { level: 0, count: 0, progress: 0 },
    pets: [], eggs: [], eggSlots: 2, eggSlotGemBought: false, eggSlotModelV2: true, activePetId: null,
    petMastery: { level: 0, count: 0, progress: 0 },
    /* one Ascension star count per system, never lost */
    stars: { pet: 0, forge: 0, skill: 0 },
    raids: {
      or:         { level: 1, keys: 2, record: 0, stars: 0 },
      minerai:    { level: 1, keys: 2, record: 0, stars: 0 },
      competence: { level: 1, keys: 2, record: 0, stars: 0 },
      familier:   { level: 1, keys: 2, record: 0, stars: 0 },
      evolution:  { level: 1, keys: 2, record: 0, stars: 0 },
    },
    pe: 0,
    universalKeys: 3, adKeysToday: 0, lastKeyReset: todayStr(),
    bossRewardsClaimed: {}, megaFloorRewardsClaimed: {},
    sanctuary: { slotA: null, slotB: null, discovered: {}, fusions: 0, stabilitySeals: 0 },
    tree: { levels: {}, active: null, activeLevel: 0, activeEnd: 0 },
    raidKeyAlloc: { or: 0, minerai: 0, competence: 0, familier: 0, evolution: 0 },
    rebirth: { pr: 0, upgrades: {}, count: 0 },
    warScore: 0, ascension: 0, ascensionAvailable: false,
    accels: { a1: 2, a5: 1, a15: 0, a30: 0, a60: 0 },
    lastSeen: Date.now(),
    /* Récolte automatique: a live reserve, not an offline bonus. Amounts are
       kept as floats so fractional per-hour rates never round away. */
    harvest: { secs: 0, minerai: 0, essence: 0, eclat: 0, gold: 0 },
    economyDebt: { eclat: 0, essence: 0 },
    economyRebaseV2: true,
    economyRebaseV3: true,
    economyRebaseV4: true,
    eventDay: todayStr(), eventClaims: {}, eventProgress: {},
    testDays: 0, power: 0,
    autoSkills: true, firstSeen: Date.now(), tutorial: { version: 3, seen: {} },
    raidKeyLossCompensationV1: true,
  };
}

function treePointsForLevel(level) {
  let total = 0;
  for (let l = 2; l <= level; l++) total += l % 5 === 0 ? 2 : 1;
  return total;
}

function migrate(s, name) {
  const base = defaultState(name);
  if (!s || typeof s !== "object") return base;
  const merged = Object.assign({}, base, s, {
    version: SAVE_VERSION,
    stats: Object.assign({}, base.stats, s.stats || {}),
    forge: Object.assign({}, base.forge, s.forge || {}),
    raids: Object.assign({}, base.raids, s.raids || {}),
    // every raid carries its own Ascension star now
    _raidStars: 1,
    rebirth: Object.assign({}, base.rebirth, s.rebirth || {}),
    tree: Object.assign({}, base.tree, s.tree || {}),
    sanctuary: Object.assign({}, base.sanctuary, s.sanctuary || {}),
    accels: Object.assign({}, base.accels, s.accels || {}),
    equipped: Object.assign({}, base.equipped, s.equipped || {}),
    raidKeyAlloc: Object.assign({}, base.raidKeyAlloc, s.raidKeyAlloc || {}),
    skillSlots: (function () {
      const a = Array.isArray(s.skillSlots) ? s.skillSlots.slice(0, 5) : [];
      while (a.length < 5) a.push(null);
      return a;
    })(),
    harvest: Object.assign({}, base.harvest, s.harvest || {}),
    economyDebt: Object.assign({}, base.economyDebt, s.economyDebt || {}),
    stars: Object.assign({}, base.stars, s.stars || {}),
  });

  // ---- tree: the old save held a flat `unlocked` id list of single-level nodes.
  // Those ids no longer exist, so refund their points rather than dropping them.
  /* The generic "accessoire" became Collier, Anneau and Ceinture. An accessory
     was a damage piece, and so is the Anneau, so anything held or worn in that
     slot moves there -- its stats keep meaning what they meant. */
  if (merged.equipped && merged.equipped.accessoire !== undefined) {
    const acc = merged.equipped.accessoire;
    if (acc && !merged.equipped.anneau) { acc.slot = "anneau"; merged.equipped.anneau = acc; }
    else if (acc) { acc.slot = "anneau"; merged.inventory.push(acc); }
    delete merged.equipped.accessoire;
  }
  SLOTS.forEach((k) => { if (merged.equipped[k] === undefined) merged.equipped[k] = null; });
  /* Anything worn in a slot the game does not have is dropped. computeDerived
     sums over every value in `equipped`, so one stray key -- a slot removed by
     an older version, or a save edited by hand -- turns the hero's damage into
     NaN, and a NaN hero neither hits nor dies. A wearable piece is kept, in the
     bag; anything else goes. */
  Object.keys(merged.equipped).forEach((k) => {
    if (SLOTS.indexOf(k) !== -1) return;
    const it = merged.equipped[k];
    if (it && typeof it === "object" && SLOTS.indexOf(it.slot) !== -1) merged.inventory.push(it);
    delete merged.equipped[k];
  });
  if (Array.isArray(merged.inventory)) {
    merged.inventory.forEach((it) => { if (it && it.slot === "accessoire") it.slot = "anneau"; });
  }
  /* Nouvelle échelle d'équipement : les deux anciens paliers sont convertis sans
     supprimer les objets ni leurs bonus. */
  const migrateGearRarity = (it) => {
    if (!it) return;
    if (it.rarity === "HEROIQUE") it.rarity = "ARTEFACT";
    if (it.rarity === "ANCESTRAL") it.rarity = "INFERNAL";
  };
  Object.keys(merged.equipped).forEach((k) => migrateGearRarity(merged.equipped[k]));
  if (Array.isArray(merged.inventory)) merged.inventory.forEach(migrateGearRarity);

  /* Gear forged before section 15 carries both stats. It is converted the same
     way the roll was: the lead stat absorbs the secondary at 14/11 and the
     secondary goes to zero, so a full set keeps the value it had. Upgrade
     levels ride along, since they are already baked into the stat. */
  const fixStat = (it) => {
    if (!it || !MASTERY_STAT[it.slot]) return;
    if (MASTERY_STAT[it.slot] === "dmg") {
      if (!it.hp) return;
      it.damage = Math.round(it.damage * SINGLE_STAT_MUL); it.hp = 0;
    } else {
      if (!it.damage) return;
      it.hp = Math.round(it.hp * SINGLE_STAT_MUL); it.damage = 0;
    }
    it.power = it.damage + it.hp;
  };
  Object.keys(merged.equipped).forEach((k) => fixStat(merged.equipped[k]));
  if (Array.isArray(merged.inventory)) merged.inventory.forEach(fixStat);

  /* A save from before the filter has no keep map, and one written by hand may
     have a partial one. Anything missing is kept -- the safe direction. */
  if (!merged.forge.keep || typeof merged.forge.keep !== "object") merged.forge.keep = forgeKeepAll();
  EQUIP_RARITY_ORDER.forEach((r) => {
    if (typeof merged.forge.keep[r] !== "boolean") merged.forge.keep[r] = true;
  });
  merged.forge.filter = !!merged.forge.filter;

  delete merged._raidStars;
  Object.keys(merged.raids).forEach((rid) => {
    if (typeof merged.raids[rid].stars !== "number") merged.raids[rid].stars = 0;
  });

  if (!merged.tree.levels || typeof merged.tree.levels !== "object") merged.tree.levels = {};
  merged.stars.pet = Math.min(PET_ASCEND_MAX_STARS, Math.max(0, merged.stars.pet || 0));
  /* The tree was rebuilt from 74 thematic nodes to 130 laid out as four
     paliers, so every old node id is gone. Rather than quietly voiding what a
     player spent, refund it exactly: the old tiers are kept here purely so the
     PE paid can be recomputed once, then the old levels are dropped. */
  if (!merged.treeRebuilt) {
    const legacyTier = { b_min: 1, b_ess: 1, b_skl: 1, b_res: 1, f1_min: 1, f1_time: 1, f1_cost: 1, f2_free: 2, f2_multi: 2, f2_raid: 2, f3_dust: 3, f3_time: 3, f3_free: 3, f3_min: 3, f_mult: 4, f4_key: 4, e1_ess: 1, e1_dmg: 1, e2_free: 2, e2_ess: 2, e2_dmg: 2, e2_slot: 3, e3_free: 3, e3_ess: 3, e3_dmg: 3, e3_slot: 4, e4_key: 4, c1_pts: 1, c1_time: 1, c1_dmg: 1, c2_free: 2, c2_pts: 2, c2_dmg: 2, c3_free: 3, c3_pts: 3, c3_dmg: 3, c4_key: 4, r_res2: 2, r_res3: 3, r_res4: 4, a_acc1: 1, a_acc2: 2, a_acc3: 3, k_afk1: 1, k_afk2: 2, k_eff1: 1, k_eff3: 3, m_arme: 1, m_gants: 1, m_anneau: 1, m_casque: 1, m_arme2: 2, m_gants2: 2, m_anneau2: 2, m_casque2: 2, m_armure: 1, m_bottes: 1, m_armure2: 2, h1_COMMUN: 1, h1_RARE: 1, h1_EPIQUE: 1, h1_MYTHIQUE: 1, h1_LEGENDAIRE: 1, h2_COMMUN: 2, h2_RARE: 2, h2_EPIQUE: 2, h2_MYTHIQUE: 2, h3_COMMUN: 3, h3_RARE: 3, h3_EPIQUE: 3, h3_MYTHIQUE: 3, h2_LEGENDAIRE: 2, h3_LEGENDAIRE: 3, m_bottes2: 2 };
    let back = 0;
    Object.keys((merged.tree && merged.tree.levels) || {}).forEach((id) => {
      const t = legacyTier[id];
      if (!t) return;
      const lv = merged.tree.levels[id] || 0;
      const first = Math.max(1, Math.round(PE_TIER_COST[t - 1] * PE_FIRST_MUL));
      if (lv >= 1) back += first;
      for (let k = 1; k < lv; k++) {
        back += Math.round(PE_TIER_COST[t - 1] * Math.pow(PE_LEVEL_GROWTH, k - 1));
      }
    });
    merged.tree = { levels: {}, active: null, activeLevel: 0, activeEnd: 0 };
    merged.pe = (merged.pe || 0) + back;
    merged.treeRebuilt = true;
    if (back > 0) treeRefund = back;
  }

  // the global hatch node became one node per rarity; refund the point it cost
  const hadGlobalHatch = !!merged.tree.levels.e1_time;
  const legacy = Array.isArray(s.tree && s.tree.unlocked) ? s.tree.unlocked : null;
  if (legacy) {
    let refund = 0;
    legacy.forEach((id) => { if (!TREE_BY_ID[id]) refund += 2; });
    merged.treePoints = (merged.treePoints || 0) + refund;
    delete merged.tree.unlocked;
  }
  if (typeof merged.tree.active === "string" && !TREE_BY_ID[merged.tree.active]) {
    merged.tree.active = null; merged.tree.activeEnd = 0;
  }
  merged.tree.activeLevel = merged.tree.activeLevel || 0;
  // drop levels for ids that no longer exist, keep the rest
  Object.keys(merged.tree.levels).forEach((id) => {
    if (!TREE_BY_ID[id]) delete merged.tree.levels[id];
    else merged.tree.levels[id] = Math.min(merged.tree.levels[id], TREE_BY_ID[id].max);
  });
  // PA is retired — PE is the tree's only currency now. Convert whatever this
  // save still holds, at the rate that preserves its buying power. Only a save
  // that actually carried PA is converted, so this can never become a faucet:
  // a state written by this version has no treePoints and no tree.unlocked.
  if (typeof merged.pe !== "number") merged.pe = 0;
  if (typeof merged.autoSkills !== "boolean") merged.autoSkills = true;
  if (typeof merged.firstSeen !== "number") merged.firstSeen = Date.now();
  let paCarry = typeof s.treePoints === "number"
    ? (merged.treePoints || 0)
    : (legacy ? treePointsForLevel(merged.level) + (merged.treePoints || 0) : 0);
  if (hadGlobalHatch) paCarry += 1;
  if (paCarry > 0) merged.pe += Math.round(paCarry * PA_TO_PE);
  delete merged.treePoints;
  if (!merged.bossRewardsClaimed || typeof merged.bossRewardsClaimed !== "object") {
    // older saves only had bossClears — treat those as already rewarded
    merged.bossRewardsClaimed = Object.assign({}, merged.bossClears || {});
  }
  if (!merged.megaFloorRewardsClaimed || typeof merged.megaFloorRewardsClaimed !== "object")
    merged.megaFloorRewardsClaimed = {};

  /* Économie V2 : réaligne aussi les sauvegardes déjà jouées sur les nouvelles règles
     sans demander une réinitialisation. L'ancien départ donnait 80 Éclats et 60 Essences,
     les invocations coûtaient 5 Éclats / 10 Essences. On retire donc l'avantage historique
     et on refacture les invocations payantes enregistrées par les deux maîtrises.
     Si le solde ne suffit pas, le reliquat devient une dette de rééquilibrage : les prochains
     gains de la ressource la remboursent avant de créditer le portefeuille. Cela préserve
     les objets déjà tirés, dont l'historique exact (doublons, œufs éclos/fusions, tirages
     gratuits) n'est pas reconstructible de façon fiable à partir d'une ancienne sauvegarde. */
  if (!Object.prototype.hasOwnProperty.call(s, "economyRebaseV2")) {
    if (!merged.economyDebt || typeof merged.economyDebt !== "object") merged.economyDebt = { eclat: 0, essence: 0 };
    const cut = Math.min(60, Math.abs(treeSum(merged, "skillCost"))) / 100;
    const oldSkillCost = Math.max(1, Math.round(5 * (1 - cut)));
    const newSkillCost = Math.max(1, Math.round(25 * (1 - cut)));
    const skillPaid = Math.max(0, Number(merged.skillMastery && merged.skillMastery.count) || 0);
    const petPaid = Math.max(0, Number(merged.petMastery && merged.petMastery.count) || 0);
    const charges = {
      eclat: 80 + skillPaid * Math.max(0, newSkillCost - oldSkillCost),
      essence: 60 + petPaid * 15,
    };
    ["eclat", "essence"].forEach((key) => {
      const have = Math.max(0, Number(merged[key]) || 0);
      const pay = Math.min(have, charges[key]);
      merged[key] = have - pay;
      merged.economyDebt[key] = Math.max(0, (Number(merged.economyDebt[key]) || 0) + charges[key] - pay);
    });
    merged.economyRebaseV2 = true;
    merged.economyRebaseNoticeV2 = {
      skillPaid, petPaid, eclatDebt: merged.economyDebt.eclat || 0, essenceDebt: merged.economyDebt.essence || 0
    };
  }

  /* Économie V3 : V2 utilisait seulement `mastery.count`. Or ce compteur est
     remis à zéro à chaque Ascension de Maîtrise. Une sauvegarde ayant déjà
     Ascensionné avait donc payé trop peu de rattrapage. Les étoiles prouvent
     qu'un ladder complet a été parcouru ; on refacture uniquement ces ladders
     oubliés, sans toucher une seconde fois aux ressources de départ ni aux
     invocations du ladder courant déjà traitées par V2. */
  if (!Object.prototype.hasOwnProperty.call(s, "economyRebaseV3")) {
    if (!merged.economyDebt || typeof merged.economyDebt !== "object") merged.economyDebt = { eclat: 0, essence: 0 };
    const completedPerStar = masteryPaidToMax();
    const cut = Math.min(60, Math.abs(treeSum(merged, "skillCost"))) / 100;
    const oldSkillCost = Math.max(1, Math.round(5 * (1 - cut)));
    const newSkillCost = Math.max(1, Math.round(25 * (1 - cut)));
    const skillAscPaid = Math.max(0, starsOf(merged, "skill")) * completedPerStar;
    const petAscPaid = Math.max(0, starsOf(merged, "pet")) * completedPerStar;
    const charges = {
      eclat: skillAscPaid * Math.max(0, newSkillCost - oldSkillCost),
      essence: petAscPaid * 15,
    };
    ["eclat", "essence"].forEach((key) => {
      const have = Math.max(0, Number(merged[key]) || 0);
      const pay = Math.min(have, charges[key]);
      merged[key] = have - pay;
      merged.economyDebt[key] = Math.max(0, (Number(merged.economyDebt[key]) || 0) + charges[key] - pay);
    });
    merged.economyRebaseV3 = true;
    merged.economyRebaseNoticeV3 = {
      skillAscPaid, petAscPaid, eclatDebt: merged.economyDebt.eclat || 0, essenceDebt: merged.economyDebt.essence || 0
    };
  }

  /* V4 — Raid Compétence/Familier passent de 75 à 125 au niveau 1.
     On rééquilibre les anciennes sauvegardes comme si cette valeur avait été
     active depuis le début, mais uniquement sur les victoires que la sauvegarde
     permet de prouver. Une étoile prouve un ladder 1→50 complet. Sur le ladder
     courant, le niveau atteint prouve les niveaux précédents. Sans étoile, le
     record permet aussi de reconnaître une victoire au niveau 50. On ne fabrique
     pas de gains pour d'éventuels raids 50 farmés ni pour un historique AFK que
     la sauvegarde ne journalise pas. Le bonus de +50 par victoire passe par le
     même multiplicateur d'Arbre et rembourse d'abord une éventuelle dette. */
  if (!Object.prototype.hasOwnProperty.call(s, "economyRebaseV4")) {
    if (!merged.economyDebt || typeof merged.economyDebt !== "object") merged.economyDebt = { eclat: 0, essence: 0 };
    const provenRaidWins = (rid) => {
      const r = (merged.raids && merged.raids[rid]) || {};
      const stars = Math.max(0, Number(r.stars) || 0);
      const level = Math.max(1, Math.min(RULES.RAID_MAX_LEVEL, Number(r.level) || 1));
      if (stars > 0) return stars * RULES.RAID_MAX_LEVEL + Math.max(0, level - 1);
      return Math.max(Math.max(0, level - 1), Math.max(0, Math.min(RULES.RAID_MAX_LEVEL, Number(r.record) || 0)));
    };
    const skillWins = provenRaidWins("competence");
    const petWins = provenRaidWins("familier");
    const skillBonusGross = Math.floor(skillWins * 50 * (1 + treeSum(merged, "skillPts") / 100));
    const petBonusGross = Math.floor(petWins * 50 * (1 + treeSum(merged, "petPts") / 100));
    const skillPay = creditRebalancedResource(merged, "eclat", skillBonusGross);
    const petPay = creditRebalancedResource(merged, "essence", petBonusGross);
    merged.economyRebaseV4 = true;
    merged.economyRebaseNoticeV4 = {
      skillWins, petWins,
      eclatGross: skillBonusGross, eclatCredited: skillPay.credited, eclatDebtRepaid: skillPay.repaid,
      essenceGross: petBonusGross, essenceCredited: petPay.credited, essenceDebtRepaid: petPay.repaid
    };
  }

  if (!merged.tutorial || typeof merged.tutorial !== "object") merged.tutorial = { version: 0, seen: {} };
  if (!merged.tutorial.seen || typeof merged.tutorial.seen !== "object") merged.tutorial.seen = {};
  // Tutoriel v3 : le parcours guidé avec flèches/surbrillance doit être rejouable
  // sur les sauvegardes ayant déjà terminé l'ancien tutoriel v2.
  if ((merged.tutorial.version || 0) < 3) {
    merged.tutorial.version = 3;
    merged.tutorial.seen = {};
  }
  // Compensation unique : une clé perdue sous l'ancien système est rendue une seule fois.
  // On privilégie une clé universelle; si elle est déjà au plafond, on crédite le Raid
  // qui possède actuellement le moins de clés et qui a encore de la place.
  if (!Object.prototype.hasOwnProperty.call(s, "raidKeyLossCompensationV1")) {
    if ((merged.universalKeys || 0) < RULES.UNIVERSAL_KEY_CAP) {
      merged.universalKeys = (merged.universalKeys || 0) + 1;
    } else {
      const candidates = RAID_IDS.map((rid) => {
        const bonus = (merged.raidKeyAlloc || {})[rid] || 0;
        const cap = RULES.RAID_KEY_CAP + bonus;
        const keys = (merged.raids[rid] && merged.raids[rid].keys) || 0;
        return { rid, keys, cap };
      }).filter((x) => x.keys < x.cap).sort((a, b) => a.keys - b.keys);
      if (candidates.length) merged.raids[candidates[0].rid].keys += 1;
    }
    merged.raidKeyLossCompensationV1 = true;
  }
  // L'ancien Retour Rapide est retiré du jeu. On conserve les PR déjà dépensés
  // sans tenter de les recalculer automatiquement, pour ne pas inventer un remboursement.
  if (merged.rebirth && merged.rebirth.upgrades) delete merged.rebirth.upgrades.fastback;
  if (typeof merged.apples !== "number") merged.apples = 0;
  /* A v1 save may already have received Apples from campaign Bosses. Mirror
     those exact claims into Mega-Boss clears so the update cannot pay twice.
     Older saves without an Apple claim map have never received them and may
     earn them normally in the new activity. */
  if (s.megaBossClears && typeof s.megaBossClears === "object") {
    merged.megaBossClears = Object.assign({}, s.megaBossClears);
  } else if (s.bossAppleClaimed && typeof s.bossAppleClaimed === "object") {
    merged.megaBossClears = Object.assign({}, s.bossAppleClaimed);
  } else merged.megaBossClears = {};
  delete merged.eliteAppleClaimed;
  delete merged.bossAppleClaimed;
  merged.equipped = merged.equipped || {};
  // gear made before affixes existed simply has none; never retro-roll it
  Object.keys(merged.equipped).forEach((k) => {
    if (merged.equipped[k] && !merged.equipped[k].affixes) merged.equipped[k].affixes = [];
  });
  (merged.inventory || []).forEach((it) => { if (it && !it.affixes) it.affixes = []; });
  /* Migration Poussière additive : ne jamais rétro-nerfer un objet déjà amélioré. */
  const anchorGear = (it) => {
    if (!it) return;
    if (it.baseDamage == null) it.baseDamage = it.damage || 0;
    if (it.baseHp == null) it.baseHp = it.hp || 0;
    if (it.upgradeBaseLevel == null) it.upgradeBaseLevel = it.level || 0;
    if (it.originalPower == null) it.originalPower = (it.baseDamage || 0) + (it.baseHp || 0);
  };
  Object.keys(merged.equipped).forEach((k) => anchorGear(merged.equipped[k]));
  (merged.inventory || []).forEach(anchorGear);
  if (s.raidKeyBonus) {   // legacy single-raid key bonus -> allocation table
    merged.raidKeyAlloc[s.raidKeyBonus] = (merged.raidKeyAlloc[s.raidKeyBonus] || 0) + 1;
    delete merged.raidKeyBonus;
  }
  /* Exactly five hatching slots exist: 2 base, one unique 300-Gem purchase,
     and the two tree nodes. Old saves could repeat the Gem purchase; keep one,
     refund every impossible extra purchase, then rebuild the count by source. */
  const treeEggSlots = ["sp_slot1", "sp_slot2"].reduce((n, id) =>
    n + (merged.tree.levels[id] >= 1 ? 1 : 0), 0);
  const oldEggSlots = Math.min(RULES.EGG_SLOT_MAX,
    Math.max(2, Number.isFinite(s.eggSlots) ? Math.floor(s.eggSlots) : 2));
  if (s.eggSlotModelV2) {
    merged.eggSlotGemBought = !!s.eggSlotGemBought;
  } else {
    const paidSlots = Math.max(0, oldEggSlots - 2 - treeEggSlots);
    merged.eggSlotGemBought = paidSlots > 0;
    if (paidSlots > 1) merged.gems += (paidSlots - 1) * 300;
  }
  merged.eggSlots = Math.min(RULES.EGG_SLOT_MAX,
    2 + treeEggSlots + (merged.eggSlotGemBought ? 1 : 0));
  merged.eggSlotModelV2 = true;

  // Pets from before investment tracking reconstruct the exact cost of their levels.
  merged.pets = (merged.pets || []).map((p) => {
    const q = Object.assign({ level: 0, species: randSpecies(), element: randElement() }, p);
    q.level = Math.min(Math.max(0, q.level || 0), petMaxLevel(q.rarity));
    q.applesInvested = Number.isFinite(p.applesInvested)
      ? Math.max(0, Math.floor(p.applesInvested))
      : petAppleInvestmentAtLevel(q.rarity, q.level);
    return q;
  });
  merged.eggs = (merged.eggs || []).map((e) =>
    Object.assign({ species: randSpecies(), element: randElement() }, e));

  // ECONOMY_REFUND_V31
  // Remboursement automatique du Sanctuaire historique. L'ancienne sauvegarde
  // mémorisait seulement les recettes découvertes et le nombre total de fusions,
  // pas la recette de chaque fusion répétée. On rembourse donc exactement ce qui
  // est prouvé par les découvertes, sans inventer la composition des extras.
  if (!Object.prototype.hasOwnProperty.call(s, "sanctuaryMergeRefundV31")) {
    const oldSanct = (s.sanctuary && typeof s.sanctuary === "object") ? s.sanctuary : {};
    const disc = (oldSanct.discovered && typeof oldSanct.discovered === "object") ? oldSanct.discovered : {};
    const refund = { minerai: 0, poussiere: 0, eclat: 0, essence: 0 };
    if (disc.r1) refund.minerai += 200;
    if (disc.r2) { refund.eclat += 20; refund.essence += 20; }
    if (disc.r3) { refund.poussiere += 150; refund.minerai += 250; }
    if (disc.r4) { refund.eclat += 50; refund.essence += 50; }
    if (disc.r5) { refund.poussiere += 500; refund.essence += 100; }
    Object.keys(refund).forEach((k) => { merged[k] = Math.max(0, Number(merged[k]) || 0) + refund[k]; });
    const discoveredCount = ["r1","r2","r3","r4","r5"].filter((id) => !!disc[id]).length;
    const totalFusions = Math.max(0, Math.floor(Number(oldSanct.fusions) || 0));
    merged.sanctuaryMergeRefundV31 = true;
    merged.sanctuaryMergeRefundNoticeV31 = {
      refund, totalFusions, provenFusions: discoveredCount,
      untraceableFusions: Math.max(0, totalFusions - discoveredCount)
    };
  }

  // Revalorise uniquement l'Or d'Autonomie encore présent dans la réserve.
  // Les encaissements historiques déjà réclamés ne sont pas reconstructibles,
  // mais aucune réserve actuelle ne doit rester valorisée sous l'ancien taux.
  if (!Object.prototype.hasOwnProperty.call(s, "autonomyGoldRebaseV31")) {
    if (merged.harvest && Number(merged.harvest.secs) > 0) {
      const secs = Math.max(0, Number(merged.harvest.secs) || 0);
      const due = harvestRates(merged).gold * secs / 3600;
      const before = Math.max(0, Number(merged.harvest.gold) || 0);
      if (due > before) merged.harvest.gold = due;
      merged.autonomyGoldRebaseNoticeV31 = { before, after: Math.max(before, due), added: Math.max(0, due - before) };
    }
    merged.autonomyGoldRebaseV31 = true;
  }
  return merged;
}

function rb(s, key) {
  const def = REBIRTH_UPGRADES.find((u) => u.key === key);
  if (!def) return 0;
  return (s.rebirth.upgrades[key] || 0) * def.perLvl;
}
/* ---- tree accessors: level 1 == activated, so children open immediately ---- */
function treeLv(s, id) { return (s.tree.levels && s.tree.levels[id]) || 0; }
function hasTree(s, id) { return treeLv(s, id) >= 1; }
/* summed value of every node feeding one effect, e.g. tsum(s,"minerai") -> 85 (%) */
function goldMul(s) { return 1 + treeSum(s, "goldAll") / 100; }
function treeSum(s, effect) {
  let t = 0;
  for (let i = 0; i < TREE_NODES.length; i++) {
    const n = TREE_NODES[i];
    if (n.effect === effect) t += treeLv(s, n.id) * n.per;
  }
  return t;
}
/* a node's prerequisites are met when each listed node is at level >= 1 */
function treeReqOk(s, node) { return node.req.every((r) => treeLv(s, r) >= 1); }
function treeNextLevel(s, node) { return treeLv(s, node.id) + 1; }
/* what the NEXT level of this node costs — always PE: {kind:"PE", amount} */
function treeCostCut(s) { return Math.min(60, Math.abs(treeSum(s, "techCost"))); }
function treeNextCost(s, node) {
  const lv = treeLv(s, node.id);
  const cut = 1 - treeCostCut(s) / 100;
  if (lv === 0) return { kind: "PE", amount: Math.max(1, Math.round(node.cost * cut)) };
  const base = PE_TIER_COST[node.tier - 1];
  return { kind: "PE", amount: Math.max(1, Math.round(base * Math.pow(PE_LEVEL_GROWTH, lv - 1) * cut)) };
}
function treeAfford(s, node) { return (s.pe || 0) >= treeNextCost(s, node).amount; }
function treeCanBuy(s, node) {
  return !s.tree.active && treeLv(s, node.id) < node.max &&
    treeReqOk(s, node) && treeAfford(s, node);
}
/* total PE needed to open AND max every node */
function treeTotalPE() {
  let t = 0;
  TREE_NODES.forEach((nd) => {
    const base = PE_TIER_COST[nd.tier - 1];
    t += nd.cost;
    for (let lv = 1; lv < nd.max; lv++) t += Math.round(base * Math.pow(PE_LEVEL_GROWTH, lv - 1));
  });
  return t;
}
/* duration of the level being researched, cut by the Recherche branch */
function treeTime(s, node, level) {
  const raw = node.times[Math.min(level - 1, node.times.length - 1)] || 0;
  // same rule as the eggs: research speed divides the timer, so all four nodes
  // keep paying and no ceiling discards the last of them
  return Math.max(0, Math.round(raw / (1 + treeSum(s, "research") / 100)));
}
/* total daily raid keys granted by the tree, and how many are still unassigned */
function raidKeyGrants(s) { return treeSum(s, "raidKey"); }
function raidKeyAssigned(s) {
  const a = s.raidKeyAlloc || {};
  return RAID_IDS.reduce((t, r) => t + (a[r] || 0), 0);
}
function raidKeyFree(s) { return Math.max(0, raidKeyGrants(s) - raidKeyAssigned(s)); }
function raidKeyCapFor(s, raid) {
  return RULES.RAID_KEY_CAP + ((s.raidKeyAlloc || {})[raid] || 0);
}
/* forge batch size: the game reaches x5 on its own, the tree finishes x10 */
function forgeBatch(s) {
  return Math.min(RULES.FORGE_BATCH_MAX,
    RULES.FORGE_BATCH_BASE + treeSum(s, "forgeMulti") + treeSum(s, "forgeMult"));
}
/* ---------------------------- Récolte automatique --------------------------
   A permanent passive production. It runs while the game is open, while it is
   in the background and while it is closed -- the player never has to quit to
   earn it. Resources land in a reserve that is claimed on demand.

   AUTONOMIE caps how long the reserve can keep filling. It does NOT change the
   rate. EFFICACITÉ D'AUTONOMIE changes the rate and nothing else.
   -------------------------------------------------------------------------- */
/* Two different families: one lengthens the window, the other fattens what it
   pays. They used to be the same flat "afk" number. */
function afkCapHours(s) { return RULES.AFK_BASE_HOURS * (1 + treeSum(s, "afkTime") / 100); }
function afkGainMul(s) { return 1 + treeSum(s, "afkGain") / 100; }
function harvestCapSeconds(s) { return afkCapHours(s) * 3600; }
function harvestEfficiency(s) { return Math.min(100, treeSum(s, "harvestEff")); }

/* Per hour, efficiency already applied. The three raid-referenced resources use
   the level the player has actually reached -- no key is spent, no raid is won
   and no level is ever unlocked by this. PE is deliberately absent: it stays
   exclusive to the Raid Évolution. */
function harvestRates(s) {
  const eff = 1 + harvestEfficiency(s) / 100;
  return {
    // Section 7: half of what the Raid Minerai currently pays, per hour. It
    // already read the real reward at the level the player has reached, so an
    // Ascension is picked up on its own -- only the share changed, 1.00 -> 0.50.
    minerai: raidReward("minerai", s.raids.minerai.level) * 0.50 * eff,
    essence: raidReward("familier", s.raids.familier.level) * 0.25 * eff,
    eclat: raidReward("competence", s.raids.competence.level) * 0.25 * eff,
    gold: raidReward("or", s.raids.or.level) * 0.25 * eff * afkGainMul(s),
  };
}
/* Gold Autonomy pays 25% of the player's current Raid Or reward per hour.
   It spends no key and never receives the Rebirth Gold bonus. */

function harvestAdvance(s, seconds) {
  const h = s.harvest;
  if (!h) return 0;
  const room = Math.max(0, harvestCapSeconds(s) - h.secs);
  const dt = Math.min(Math.max(0, seconds), room);
  if (dt <= 0) return 0;
  const r = harvestRates(s), frac = dt / 3600;
  h.minerai += r.minerai * frac;
  h.essence += r.essence * frac;
  h.eclat += r.eclat * frac;
  h.gold += r.gold * frac;
  h.secs += dt;
  return dt;
}
/* A played save can carry a one-time economic rebalancing debt after costs
   change. New gains repay that debt first, so the player reaches the same net
   resource position without deleting irreversible summon outcomes. */
function creditRebalancedResource(s, key, amount) {
  amount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!amount) return { credited: 0, repaid: 0 };
  if (!s.economyDebt || typeof s.economyDebt !== "object") s.economyDebt = { eclat: 0, essence: 0 };
  const debt = Math.max(0, Number(s.economyDebt[key]) || 0);
  const repaid = Math.min(debt, amount);
  s.economyDebt[key] = debt - repaid;
  const credited = amount - repaid;
  s[key] = Math.max(0, Number(s[key]) || 0) + credited;
  return { credited, repaid };
}

/* whole numbers are paid out, the sub-unit remainder stays in the reserve so
   a 12.5/h rate never loses its halves across repeated claims */
function harvestClaim(s) {
  const h = s.harvest;
  const got = { minerai: Math.floor(h.minerai), essence: Math.floor(h.essence),
    eclat: Math.floor(h.eclat), gold: Math.floor(h.gold), secs: Math.floor(h.secs) };
  s.minerai += got.minerai; h.minerai -= got.minerai;
  const essencePay = creditRebalancedResource(s, "essence", got.essence); h.essence -= got.essence;
  const eclatPay = creditRebalancedResource(s, "eclat", got.eclat);       h.eclat -= got.eclat;
  got.essence = essencePay.credited; got.eclat = eclatPay.credited;
  got.essenceRepaid = essencePay.repaid; got.eclatRepaid = eclatPay.repaid;
  s.gold += got.gold;       h.gold -= got.gold;
  h.secs = 0;
  return got;
}
/* The badge is a call to action, not a running total. A trickle of Minerai two
   minutes after the last claim is not worth interrupting anyone for, so the
   button only lights up once the reserve is half its cap. Claiming stays
   available the whole time -- harvestIsEmpty still gates the button itself. */
const HARVEST_NOTIFY_AT = 0.5;
function harvestNotify(s) {
  const cap = harvestCapSeconds(s);
  return !harvestIsEmpty(s) && cap > 0 && (s.harvest.secs || 0) >= cap * HARVEST_NOTIFY_AT;
}
function harvestIsEmpty(s) {
  const g = s.harvest;
  return !g || (Math.floor(g.minerai) + Math.floor(g.essence) + Math.floor(g.eclat) + Math.floor(g.gold)) <= 0;
}

/* Section 16: everything worn together may add at most 20 % to either speed.
   The one exception is the exceptional roll -- a bonus that came out above its
   cap raises the ceiling to its own value, which is what makes such a piece
   worth wearing at all. Rebirth's attack speed is not equipment and is not
   capped here. */
const SPEED_AFFIX_CAP = 20;
function speedCapFor(s, key) {
  let cap = SPEED_AFFIX_CAP;
  Object.values(s.equipped).forEach((it) => {
    if (!it || !it.affixes) return;
    it.affixes.forEach((a) => {
      if (a.key === key && affixIsExceptional(a)) cap = Math.max(cap, a.value);
    });
  });
  return cap;
}
function computeDerived(s) {
  let equipHP = 0, equipDmg = 0;
  Object.keys(s.equipped).forEach((slot) => {
    const it = s.equipped[slot];
    if (!it) return;
    /* "Arme Bonus Degats" scales your weapon, not your total damage. It read as
       a flat percentage while there were no slots to attach it to; now that all
       eight exist it belongs on the piece it names. Both branches scale the one
       stat the slot is built around, never both, and an empty slot gets nothing
       -- the bonus is on the gear, not on you. */
    const m = 1 + (treeSum(s, "mast_" + slot) + treeSum(s, "eq_" + slot)) / 100;
    if (MASTERY_STAT[slot] === "dmg") { equipDmg += it.damage * m; equipHP += it.hp; }
    else { equipHP += it.hp * m; equipDmg += it.damage; }
  });
  const pet = s.pets.find((p) => p.id === s.activePetId);
  // the pet grants the same % to damage and HP; the tree's "Dégâts des
  // Familiers" branch scales only the damage half; "Animal Bonus Sante" scales
  // the health half the same way
  const petPct = petBonus(pet) * (1 + treeSum(s, "petHp") / 100);
  const el = pet ? petElement(pet).id : null;
  // the pet element adds a light twist on top of the rarity bonus
  const petDmgPct = petPct * (1 + treeSum(s, "petDmg") / 100) * (el === "normal" ? 1.10 : 1);
  const forgePct = s.forge.level * 2;

  // the eight equipment families now live on their own slots, above; what stays
  // global here is the passive base, which is not equipment
  const lifeMul = 1 + rb(s, "life") / 100 + petPct / 100 + forgePct / 200
    + treeSum(s, "passHp") / 100;
  const dmgMul  = 1 + rb(s, "damage") / 100 + petDmgPct / 100 + forgePct / 100
    + treeSum(s, "passDmg") / 100;

  // random bonuses carried by equipped gear
  const af = equippedAffixes(s);
  const A = (k) => af[k] || 0;

  const maxHP = Math.floor((BASE.hp + s.stats.sante * STATS.SANTE.perPoint + equipHP) * lifeMul * (1 + A("hp") / 100));
  const damage = Math.floor((BASE.damage + s.stats.degats * STATS.DEGATS.perPoint + equipDmg) * dmgMul * (1 + A("dmg") / 100));
  const critChance = Math.min(CRIT_CHANCE_CAP, BASE.critChance + s.stats.crit * STATS.CRIT.perPoint + A("crit"));
  const critMult = BASE.critMult + rb(s, "critdmg") / 100 + A("critdmg") / 100;
  const critRed = Math.min(CRIT_RED_CAP, s.stats.critred * STATS.CRITRED.perPoint);
  const atkSpeedAffix = Math.min(speedCapFor(s, "atkspeed"), A("atkspeed"));
  const moveSpeedAffix = Math.min(speedCapFor(s, "movespeed"), A("movespeed"));
  const attackSpeed = BASE.attackSpeed * (1 + rb(s, "atkspeed") / 100) * (1 + atkSpeedAffix / 100)
    * (el === "electrique" ? 1.08 : 1);
  const moveSpeed = BASE.moveSpeed * (1 + moveSpeedAffix / 100);
  const weapon = (s.equipped.arme && s.equipped.arme.weaponType) || "epee";

  /* Puissance = estimation du build réellement porté. Les systèmes de progression
     comptent via les statistiques de combat qu’ils produisent, pas comme bonus arbitraire. */
  const weaponDef = WEAPON_TYPES[weapon] || WEAPON_TYPES.epee;
  const weaponBonus = weaponDef.attackType === "MELEE" ? A("melee") : A("ranged");
  const critFactor = 1 + (critChance / 100) * Math.max(0, critMult - 1);
  const doubleFactor = 1 + Math.min(100, A("double")) / 100;
  const skillFactor = 1 + ((treeSum(s, "skillDmg") + A("skilldmg")) / 100) * 0.25;
  const cooldownFactor = 1 + (Math.min(80, A("skillcd")) / 100) * 0.25;
  const offense = damage * attackSpeed * weaponDef.speed * weaponDef.hit *
    critFactor * doubleFactor * (1 + weaponBonus / 100) * skillFactor * cooldownFactor;
  const dmgRedNow = Math.min(85, rb(s, "dmgred"));
  const blockNow = Math.min(75, A("block"));
  const lifeStealNow = Math.max(0, rb(s, "lifesteal") + A("lifesteal"));
  const regenNow = Math.max(0, rb(s, "regen"));
  const mitigation = 1 / Math.max(0.15, 1 - dmgRedNow / 100);
  const blockFactor = 1 + blockNow / 200;
  const sustainFactor = 1 + Math.min(50, lifeStealNow) / 200 + Math.min(50, regenNow) / 250;
  const effectiveHP = maxHP * mitigation * blockFactor * sustainFactor;
  const power = Math.floor(Math.sqrt(Math.max(1, offense) * Math.max(1, effectiveHP)) * 1.5);

  return {
    maxHP, damage, attackSpeed, moveSpeed, critChance, critMult, critRed,
    dmgRed: rb(s, "dmgred"), regen: rb(s, "regen"),
    lifesteal: rb(s, "lifesteal") + A("lifesteal"),
    bossDmg: rb(s, "bossdmg"),
    // affix-only combat stats
    blockChance: blockNow,
    doubleAtk: Math.min(100, A("double")),
    meleeDmg: A("melee"), rangedDmg: A("ranged"),
    skillCdCut: Math.min(80, A("skillcd")),
    affixes: af,
    // gold / exp scaling belongs to Rebirth — the tree deliberately has no
    // blanket "more of every resource" node
    goldBonus: rb(s, "gold"),
    expBonus: rb(s, "exp"),
    // tree-driven multipliers, applied at the point each resource is granted
    petPct, petDmgPct, petElem: el,
    skillDmgBonus: treeSum(s, "skillDmg") + A("skilldmg"),
    mineraiBonus: treeSum(s, "minerai"),
    essenceBonus: treeSum(s, "essence"),
    eclatBonus: treeSum(s, "skillPts"),
    dustBonus: treeSum(s, "dust"),
    raidMineraiBonus: treeSum(s, "raidMinerai"),
    forgeFree: treeSum(s, "forgeFree"),
    eggFree: treeSum(s, "eggFree"),
    skillFree: treeSum(s, "skillFree"),
    weapon, _power: power,
  };
}
function computePower(s) { return computeDerived(s)._power || 0; }

/* ---------------------------- equipment affixes ---------------------------
   Gear from RARE upward carries random stat bonuses on top of its main stats.
   Rarity drives TWO things independently: the base power of the item, and how
   good its random bonuses can roll — so two items of the same rarity can be
   worth very different amounts.

   `cap` is an ABSOLUTE ceiling that no roll may ever exceed.
   These values are frozen when the item is created and are never touched by
   Poussière upgrades (see upgradeItem).
   -------------------------------------------------------------------------- */
const AFFIX_DEFS = [
  { key: "dmg",       label: "Dégâts",                 icon: "flame",   cap: 30 },
  { key: "block",     label: "Chance de blocage",      icon: "shield",  cap: 7 },
  { key: "lifesteal", label: "Vol de vie",             icon: "droplet", cap: 20 },
  { key: "hp",        label: "Santé",                  icon: "heart",   cap: 25 },
  { key: "melee",     label: "Dégâts corps à corps",   icon: "sword",   cap: 60 },
  { key: "crit",      label: "Chance critique",        icon: "target",  cap: 16 },
  { key: "ranged",    label: "Dégâts à distance",      icon: "forward", cap: 20 },
  /* Section 16: both speed bonuses cap at 20 rather than 50 and 30. The cap is
     per bonus, and a full set of eight lands close to the stated ceiling --
     measured at +19.6 % on a DIVIN set for each of the two, against +49.1 % and
     +29.4 % before. `exceptional` is the old ceiling, still reachable, but now
     only on the rare roll below. */
  { key: "atkspeed",  label: "Vitesse d'attaque",      icon: "bolt",    cap: 20, exceptional: 50 },
  { key: "critdmg",   label: "Dégâts critiques",       icon: "sparkle", cap: 100 },
  { key: "skilldmg",  label: "Dégâts des Compétences", icon: "eclat",   cap: 50 },
  { key: "skillcd",   label: "Recharge Compétences",   icon: "clock",   cap: 10, negative: true },
  { key: "movespeed", label: "Vitesse de déplacement", icon: "boot",    cap: 20, exceptional: 30 },
  { key: "double",    label: "Double attaque",         icon: "swords",  cap: 20 },
];
const AFFIX_BY_KEY = {};
AFFIX_DEFS.forEach((a) => { AFFIX_BY_KEY[a.key] = a; });

/* Nombre de bonus par rareté + probabilité d’entrer dans la zone de roll élevé.
   `high` n’est PAS une chance d’atteindre le maximum : il choisit seulement
   entre la zone normale et la zone haute, puis la valeur est encore tirée au hasard. */
const AFFIX_TIERS = {
  COMMUN:     { count: 0, high: 0.00 },
  RARE:       { count: 1, high: 0.06 },
  EPIQUE:     { count: 2, high: 0.10 },
  MYTHIQUE:   { count: 2, high: 0.15 },
  ARTEFACT:   { count: 2, high: 0.20 },
  LEGENDAIRE: { count: 2, high: 0.26 },
  INFERNAL:   { count: 2, high: 0.31 },
  IMMORTEL:   { count: 2, high: 0.35 },
  DIVIN:      { count: 2, high: 0.40 },
  /* legacy */ HEROIQUE: { count: 2, high: 0.20 }, ANCESTRAL: { count: 2, high: 0.31 },
}
function affixRound(def, v) {
  return def.cap <= 20 ? Math.round(v * 10) / 10 : Math.round(v);
}
/* Section 16: one roll in two thousand ignores the cap. It is the only way to
   pass it, it applies to the two bonuses the section caps, and it reaches no
   further than the ceiling those bonuses used to have -- so the old maximum
   still exists, as something you find rather than something you accumulate. */
const AFFIX_EXCEPTIONAL_PCT = 0.05;
function affixIsExceptional(a) {
  const def = AFFIX_BY_KEY[a.key];
  return !!def && !!def.exceptional && a.value > def.cap;
}
/* roll one bonus value for a given rarity, never above the absolute cap */
function rollAffixValue(def, rarity) {
  const t = AFFIX_TIERS[rarity] || AFFIX_TIERS.COMMUN;
  /* La rareté augmente la CHANCE d'entrer dans une zone haute, pas le cap.
     Normal : 10-70 % du cap. Haut : 65-100 %, avec chevauchement volontaire.
     Même un Divin peut donc sortir moyen; le maximum reste un roll rare. */
  const high = Math.random() < (t.high || 0);
  const lo = high ? 0.65 : 0.10;
  const hi = high ? 1.00 : 0.70;
  const bias = high ? 1.35 : 1.45;
  const q = Math.pow(Math.random(), bias);
  const frac = lo + (hi - lo) * q;
  const v = Math.max(affixRound(def, def.cap * lo),
    Math.min(def.cap, affixRound(def, def.cap * frac)));
  if (def.exceptional && Math.random() * 100 < AFFIX_EXCEPTIONAL_PCT) {
    // above the cap, up to what the bonus used to be able to reach
    return affixRound(def, def.cap + (def.exceptional - def.cap) * Math.random());
  }
  return v;
}
/* draw `count` DISTINCT bonus types, each with its own independent value */
function rollAffixes(rarity) {
  const t = AFFIX_TIERS[rarity] || AFFIX_TIERS.COMMUN;
  if (!t.count) return [];
  const pool = AFFIX_DEFS.slice();
  const out = [];
  for (let i = 0; i < t.count && pool.length; i++) {
    const def = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    out.push({ key: def.key, value: rollAffixValue(def, rarity) });
  }
  return out;
}
/* how close to the cap a roll landed — drives the quality tint in the UI */
function affixQuality(a) {
  const def = AFFIX_BY_KEY[a.key];
  return def ? a.value / def.cap : 0;
}
function affixColor(a) {
  const q = affixQuality(a);
  return q >= 0.95 ? "#FF4D8D" : q >= 0.8 ? "#F5C542" : q >= 0.55 ? "#B15CF6"
    : q >= 0.3 ? "#3FA7FF" : "#9FB0C8";
}
function affixText(a) {
  const def = AFFIX_BY_KEY[a.key];
  if (!def) return "";
  return (def.negative ? "-" : "+") + a.value + "% " + def.label +
    (affixIsExceptional(a) ? " ✦" : "");
}
/* every affix on equipped gear, summed by key */
function equippedAffixes(s) {
  const t = {};
  Object.values(s.equipped).forEach((it) => {
    if (!it || !it.affixes) return;
    it.affixes.forEach((a) => { t[a.key] = (t[a.key] || 0) + a.value; });
  });
  return t;
}

const RARITY_NAMES = ["Rouillé", "Aiguisé", "Runique", "Spectral", "Artefact", "Légendaire", "Infernal", "Immortel", "Divin"];
/* Section 15: one stat per piece. The secondary stat a piece used to carry --
   1.2 HP on a damage slot, 0.3 damage on an HP slot -- is folded into the lead
   stat instead of being dropped, so a full set is worth exactly what it was.
   Both stats work out to the same factor: 5.6/4.4 = 22.4/17.6 = 14/11. */
const SINGLE_STAT_MUL = 14 / 11;
function makeItem(slot, rarity, forgeLevel) {
  const mul = RARITY_MUL[rarity];
  // Forge stars raise the power of everything it can produce
  const base = (6 + forgeLevel * 2) * starMul(S, "forge");
  const wt = slot === "arme" ? WEAPON_LIST[Math.floor(Math.random() * WEAPON_LIST.length)] : undefined;
  // which stat a piece leads with comes from one table now, so a new slot
  // cannot be added without deciding what it is for
  const roll = SINGLE_STAT_MUL * (0.9 + Math.random() * 0.4);
  const dmg = MASTERY_STAT[slot] === "dmg" ? Math.floor(base * mul * roll) : 0;
  const hp = MASTERY_STAT[slot] === "hp" ? Math.floor(base * mul * 4 * roll) : 0;
  const name = SLOT_LABEL[slot] + " " + (RARITY_NAMES[equipRank(rarity)] || "");
  return { id: rid(), slot, rarity, weaponType: wt, damage: dmg, hp, level: 0,
    baseDamage: dmg, baseHp: hp, upgradeBaseLevel: 0, originalPower: dmg + hp,
    power: dmg + hp, name: name.trim(), affixes: rollAffixes(rarity) };
}
