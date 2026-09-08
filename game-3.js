/* =========================================================================
   ARENA RENDERER — port of src/ui/CombatArena.tsx
   Absolutely-positioned DOM sprites, driven by requestAnimationFrame with
   the same 0.22 lerp smoothing and layered-sine idle animation as the app.
   ========================================================================= */
const RANGED_IDS = ["arc", "arbalete", "baton"];
/* width-to-height of each sprite, so none of them stretch */
const WEAPON_ASPECT = { epee: 0.543, hache: 0.359, masse: 0.258, dague: 0.301, arc: 0.219, arbalete: 0.664, baton: 0.93 };
const WEAPON_SILVER = "#d6dae4";
/* Fighters are deliberately smaller in the same arena: this increases the
   perceived meeting distance and leaves more room to read projectiles/VFX. */
const ARENA_H = 286, CHAR = 64;   // sprite unit; scaled to the arena at draw time

const P = { hero: HERO_START, en: {} };   // smoothed positions
let arenaEl = null, arenaNodes = null, arenaT = 0;
let arenaCombatRef = null; // ARENA_STABILITY_V36
let lastTrack = "", lastSub = "", lastDecor = "";         // header caches, so rAF skips DOM writes
let floorFlash = null;                    // brief "ÉTAGE N" beat between floors

/* ---- scenery ---------------------------------------------------------------
   Props are picked to suit the biome and laid out one per horizontal third so
   they never stack. The layout is seeded off the floor, so it is stable for as
   long as you are on that floor and only changes when the scene does. */
const DECOR_BY_ENV = {
  env_forest:    ["stump", "bush", "rock_moss", "boulder", "dead_tree"],
  env_ruins:     ["column", "wall", "rock_moss", "brazier", "boulder"],
  env_ice:       ["crystal", "boulder", "rock_moss", "dead_tree"],
  env_demon:     ["bones", "brazier", "dead_tree", "boulder"],
  env_dragon:    ["bones", "dead_tree", "boulder", "rock_moss"],
  env_celestial: ["crystal", "column", "wall", "boulder"],
};
function decorHTML(bgKey, seed) {
  const list = (DECOR_BY_ENV[bgKey] || DECOR_BY_ENV.env_forest).slice();
  let st = Math.abs(seed * 2654435761) % 233280 + 7;
  const rnd = () => (st = (st * 9301 + 49297) % 233280) / 233280;
  // draw without replacement: picking independently collides far too often
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = list[i]; list[i] = list[j]; list[j] = t;
  }
  let h = "";
  for (let i = 0; i < 3; i++) {
    const x = 10 + i * 33 + rnd() * 16;          // % across, one per third
    const ht = 13 + rnd() * 13;                  // % of arena height
    const flip = rnd() < 0.5 ? " scaleX(-1)" : "";
    h += '<img src="' + ASSETS["prop_" + list[i]] + '" style="position:absolute;left:' + x.toFixed(1) +
      "%;bottom:" + (18.5 + rnd() * 3).toFixed(1) + "%;height:" + ht.toFixed(1) +
      "%;transform:translateX(-50%)" + flip + '">';
  }
  return h;
}

function arenaHTML() {
  return '' +
    '<div id="arenaBg"></div>' +
    '<div id="arenaShade"></div>' +
    '<div id="aDecor"></div>' +
    '<div class="floorTag"><div class="floorTxt" id="aLabel"></div>' +
      '<div class="fTrack" id="aTrack"></div><div class="row gap6" id="aSub"></div></div>' +
    '<div id="aLayer"></div>' +
    '<div id="banner" class="hide"></div>';
}

function mountArena(el) {
  arenaEl = el;
  el.innerHTML = arenaHTML();
  arenaNodes = {
    bg: el.querySelector("#arenaBg"),
    decor: el.querySelector("#aDecor"),
    label: el.querySelector("#aLabel"),
    track: el.querySelector("#aTrack"),
    sub: el.querySelector("#aSub"),
    layer: el.querySelector("#aLayer"),
    banner: el.querySelector("#banner"),
  };
  // ARENA_STABILITY_V36: a UI re-render must not reset fighter smoothing mid-combat.
  // Reset positions only when the actual combat instance changes. This removes
  // the occasional visible jump caused by remounting the arena for unrelated UI updates.
  if (arenaCombatRef !== combat) {
    P.hero = combat ? combat.heroX : HERO_START;
    P.en = {};
    arenaCombatRef = combat;
  }
  lastTrack = lastSub = lastDecor = "";   // fresh nodes, so force the next write
  arenaNodes.bg.style.backgroundImage = 'url("' + bgFor(combat && combat.bg) + '")';
}

/* thousands-separated integer, French thin space (sheet shows "ÉTAGE 4 281") */
function fmtInt(n) {
  return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
const MINI_SKULL = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 3c4.4 0 7.4 3 7.4 7 0 2.4-1 4-2.2 5v2c0 1.2-1 2-2.2 2H9c-1.2 0-2.2-.8-2.2-2v-2C5.6 14 4.6 12.4 4.6 10c0-4 3-7 7.4-7Z" fill="#FFF0F0"/>' +
  '<ellipse cx="9.1" cy="10.4" rx="2" ry="2.3" fill="#7A1216"/><ellipse cx="14.9" cy="10.4" rx="2" ry="2.3" fill="#7A1216"/>' +
  '<path d="M11.2 13.8h1.6l-.8 2.2Z" fill="#7A1216"/></svg>';
/* the 10-floor block leading to a boss, as a node track */
function floorTrack(floor) {
  const base = Math.floor((floor - 1) / RULES.BOSS_EVERY) * RULES.BOSS_EVERY + 1;
  let h = "";
  for (let i = 0; i < RULES.BOSS_EVERY; i++) {
    const f = base + i;
    if (i) h += '<i class="' + (f <= floor ? "on" : "") + '"></i>';
    let cls = "sdot";
    if (isBoss(f)) cls += " boss"; else if (isElite(f)) cls += " elite";
    if (f < floor) cls += " on";
    if (f === floor) cls += " cur";
    h += '<span class="' + cls + '">' + (isBoss(f) ? MINI_SKULL : "") + "</span>";
  }
  return h;
}


/* ---- weapon visual (port of WeaponVisual) ---- */
/* The weapon hangs off the hero's hand, and the hand moves with the pose. Each
   frame carries the hand position (as a fraction of the sprite box) and the
   angle the arm holds it at; the weapon's grip is planted on that point, so it
   stays attached instead of floating beside him.

   Anchors were read off the sprites directly -- see the decile grid used to
   place them. The idle entry doubles as the rest pose between swings. */
const HERO_HAND = [
  { x: 0.61, y: 0.62, rot: 24 },   // idle — hand at his side
  { x: 0.85, y: 0.58, rot: 12 },   // attack1 — arm out and down
  { x: 0.56, y: 0.34, rot: -55 },  // attack2 — wound up across the chest
  { x: 0.82, y: 0.62, rot: 28 },   // attack3 — coming down
  { x: 0.88, y: 0.43, rot: -6 },   // attack4 — fully extended
];
function heroHand(attacking) {
  if (!(attacking > 0)) return HERO_HAND[0];
  const p = Math.min(0.999, Math.max(0, 1 - attacking / ATTACK_WINDOW));
  // Exactly the frame the sprite is showing. Interpolating between anchors was
  // worse: the weapon drifted off the hand mid-frame and snapped back, because
  // the sprite itself steps between poses rather than tweening. Stepping with
  // it keeps the grip planted for every rendered frame.
  const f = attackFrames("hero");
  const n = f.length || HERO_HAND.length - 1;
  return HERO_HAND[1 + Math.min(n - 1, Math.floor(p * n))] || HERO_HAND[0];
}
function weaponHTML(weapon, color, attacking, t, size) {
  const art = ASSETS["weapon_" + weapon];
  const sway = Math.sin(t * 0.0034) * 2.5;
  if (!art) return staffHTML(color, attacking ? 55 : sway, size);

  const hand = heroHand(attacking);
  const ranged = RANGED_IDS.includes(weapon);
  const h = size * (ranged ? 0.70 : 0.64);
  const w = h * (WEAPON_ASPECT[weapon] || 0.4);
  const rot = hand.rot * (ranged ? 0.45 : 1) + (attacking ? 0 : sway);
  // the grip is the sprite's bottom centre, so plant that on the hand
  return '<div style="position:absolute;left:' + (hand.x * size - w / 2).toFixed(1) +
    "px;top:" + (hand.y * size - h).toFixed(1) + "px;width:" + w.toFixed(1) +
    "px;height:" + h.toFixed(1) + "px;transform-origin:50% 100%;transform:rotate(" + rot.toFixed(1) +
    'deg)"><img src="' + art + '" style="width:100%;height:100%;object-fit:contain;display:block;' +
    "filter:drop-shadow(0 0 5px " + color + '99)"></div>';
}
/* the one weapon still drawn by hand */
function staffHTML(color, swing, size) {
  const ax = size * 0.60, ay = size * 0.30;
  return '<div style="position:absolute;left:' + ax + "px;top:" + (ay - size * 0.12) +
    "px;transform:rotate(" + (swing * 0.25) + 'deg)">' +
    '<div style="width:4px;height:' + (size * 0.6) + 'px;background:#6b4b2a;border-radius:2px"></div>' +
    '<div style="position:absolute;top:-7px;left:-6px;width:16px;height:16px;border-radius:8px;' +
    "background:" + color + ";box-shadow:0 0 9px " + color + '"></div></div>';
}

/* ---------------------------- skill VFX -----------------------------------
   One effect family per `fx` tag on a skill, matching the reference sheet's
   VFX strips. Everything is vector/CSS driven off a single 0..1 progress value
   so the whole thing costs nothing and scales with the arena.
   -------------------------------------------------------------------------- */
/* Effects ran fast enough to read as a flicker. Everything is roughly half
   again as long, and the heavier the effect the more it gained -- a Cataclysme
   should take its time. */
const VFX_DUR = {
  // Effets plus réactifs : ils restent lisibles mais ne bloquent plus le rythme du combat.
  impact: 0.62, pierce: 0.72, vortex: 1.10, bolt: 0.70, wave: 0.96,
  meteor: 1.28, aura: 1.18, curse: 1.02, poison: 1.18, heal: 1.05, cataclysm: 1.65,
};
function vfxDur(kind) { return VFX_DUR[kind] || 0.4; }


/* Build the whole effect layer for the current frame. */
function skillVfxHTML(c, scale, groundY, uni, vs) {
  const cast = (c.skillFxs || []).map((fx) => oneVfxHTML(c, fx, scale, groundY, uni, vs)).join("");
  const now = Date.now();
  if (c.bursts && c.bursts.length) c.bursts = c.bursts.filter((b) => now - b.born < b.max * 1000);
  const burst = (c.bursts || []).map((b) => oneBurstHTML(b, scale, groundY, vs, uni)).join("");
  if (!cast && !burst) return "";
  return '<div class="vfx" style="position:absolute;inset:0;pointer-events:none;z-index:6">' +
    cast + burst + "</div>";
}
/* Painted VFX are pure white with an alpha falloff, so they are used as CSS
   MASKS rather than drawn directly: the mask carries the shape and the
   intensity, and the skill's own colour is painted underneath it. A second
   white layer rides the same mask, which turns the densest part of the sprite
   into a hot core for free. One sprite therefore serves all 18 skill colours. */
const VFX_STRETCH = { pierce: 1, bolt: 1 };   // span the hero-to-target gap
function vfxLayer(key, x, y, w, h, col, op, tf) {
  const m = "url(" + ASSETS["vfx_" + key] + ") center/" +
    (VFX_STRETCH[key] ? "100% 100%" : "contain") + " no-repeat";
  const box = "position:absolute;left:" + (x - w / 2).toFixed(1) + "px;top:" + (y - h / 2).toFixed(1) +
    "px;width:" + w.toFixed(1) + "px;height:" + h.toFixed(1) + "px;" +
    (tf ? "transform:" + tf + ";" : "") + "-webkit-mask:" + m + ";mask:" + m + ";";
  return '<div style="' + box + "background:" + col + ";opacity:" + op.toFixed(3) +
    ";filter:drop-shadow(0 0 " + (w * 0.05).toFixed(1) + "px " + col + ')"></div>' +
    '<div style="' + box + "background:#FFFFFF;opacity:" + (op * 0.4).toFixed(3) + '"></div>';
}

/* The basic attack reuses the same masked-sprite trick: the arc sweeps through
   the swing and fades as it goes, so it reads as a trail rather than a flash. */
/* A bow does not swing. The slash arc used to play for every weapon, so an
   archer drew a sword trail and a Baton cast by slashing. Ranged weapons get a
   release flash at the hand instead -- the projectile carries the rest. */
function releaseHTML(attacking, size, col) {
  const q = Math.min(1, Math.max(0, 1 - attacking / ATTACK_WINDOW));
  const hand = heroHand(attacking);
  const d = size * (0.20 + q * 0.30);
  const m = "url(" + ASSETS.vfx_spark + ") center/contain no-repeat";
  return '<div class="slash" style="left:' + (hand.x * size - d / 2).toFixed(1) +
    "px;top:" + (hand.y * size - d / 2 - size * 0.10).toFixed(1) + "px;width:" + d.toFixed(1) +
    "px;height:" + d.toFixed(1) + "px;opacity:" + ((1 - q) * 0.85).toFixed(3) +
    ";background:" + col + ";-webkit-mask:" + m + ";mask:" + m + '"></div>';
}
function slashHTML(attacking, size) {
  const q = Math.min(1, Math.max(0, 1 - attacking / ATTACK_WINDOW));
  const d = size * (0.95 + q * 0.45);
  const m = "url(" + ASSETS.vfx_slash + ") center/contain no-repeat";
  return '<div class="slash" style="left:' + (size * 0.86 - d / 2).toFixed(1) +
    "px;top:" + (size * 0.44 - d / 2).toFixed(1) + "px;width:" + d.toFixed(1) +
    "px;height:" + d.toFixed(1) + "px;opacity:" + (1 - q * q).toFixed(3) +
    ";transform:rotate(" + (-38 + q * 80).toFixed(0) + "deg) scaleX(-1);-webkit-mask:" + m +
    ";mask:" + m + '"></div>';
}

/* One-shot bursts sit outside the skill system: they are fired by events rather
   than by a cast, and a death has to outlive the enemy that caused it. */
const BURST_DUR = { hit: 0.30, crit: 0.50, death: 0.72 };
function addBurst(c, kind, x, color) {
  if (!c.bursts) c.bursts = [];
  c.bursts.push({ kind, x, color, born: Date.now(), max: BURST_DUR[kind] });
  if (c.bursts.length > 18) c.bursts.shift();
}
function oneBurstHTML(b, scale, groundY, vs, uni) {
  const p = Math.max(0, Math.min(1, (Date.now() - b.born) / (b.max * 1000)));
  const x = b.x * scale, y = groundY - (uni || CHAR) / 2;
  if (b.kind === "hit") {
    const d = (18 + p * 40) * scale;
    return vfxLayer("impact", x, y, d, d, b.color, (1 - p) * 0.75);
  }
  if (b.kind === "crit") {
    const d = (36 + p * 92) * scale;
    return vfxLayer("crit", x, y, d, d, b.color, 1 - p, "rotate(" + (p * 26).toFixed(0) + "deg)");
  }
  const d = (48 + p * 52) * scale;              // death: rises as it thins out
  return vfxLayer("death", x, y - p * 28 * scale, d, d, b.color, (1 - p) * 0.9);
}

/* The hit flash is the same sprite trick, driven off the flash timer the units
   already carry, so it needs no new state of its own. */
function sparkHTML(life, max, size, col) {
  const p = Math.max(0, Math.min(1, 1 - life / max));
  const d = size * (0.5 + p * 0.5);
  const m = "url(" + ASSETS.vfx_spark + ") center/contain no-repeat";
  return '<div class="slash" style="left:' + (size * 0.5 - d / 2).toFixed(1) +
    "px;top:" + (size * 0.46 - d / 2).toFixed(1) + "px;width:" + d.toFixed(1) +
    "px;height:" + d.toFixed(1) + "px;opacity:" + (1 - p).toFixed(3) +
    ";background:" + col + ";-webkit-mask:" + m + ";mask:" + m + '"></div>';
}

function oneVfxHTML(c, fx, scale, groundY, uni, vs) {
  const kind = fx.fx || "impact";
  const dur = fx.max || vfxDur(kind);
  const rawP = Math.max(0, Math.min(1, 1 - fx.life / dur));
  // Courbe d'animation continue : départ et fin sans cassure visuelle.
  const p = rawP * rawP * (3 - 2 * rawP);
  const col = fx.color;
  const fade = Math.pow(1 - rawP, 0.72);
  // A unit is drawn at left = x*scale - size/2, top = groundY - size, so its
  // centre is (x*scale, groundY - size/2). The old anchors were x + 26 and a
  // flat groundY - 30, which put every effect low and to the right of whatever
  // it was supposed to be hitting.
  const hx = P.hero * scale;
  const foes = c.enemies.filter((e) => e.alive);
  const fxs = foes.map((e) => (P.en[e.id] != null ? P.en[e.id] : e.x) * scale);
  const cx = fxs.length ? fxs.reduce((a, b) => a + b, 0) / fxs.length : hx + 120;
  const foeSize = foes.some((e) => e.boss) ? (uni || CHAR) * 1.45 : (uni || CHAR);
  const midY = groundY - foeSize / 2;
  const S = scale;                    // every effect stays proportional to the arena
  let h = "";

  if (kind === "impact") {
    // one burst per target, punching outward from nothing
    fxs.forEach((x) => { const d = (30 + p * 86) * S; h += vfxLayer("impact", x, midY, d, d, col, fade); });
  } else if (kind === "pierce") {
    // a lance driven from the hero out through the furthest target
    const far = Math.max.apply(null, fxs.concat([hx + 60 * S]));
    const w = Math.max(30 * S, (far - hx) * Math.min(1, p * 1.7)) + 34 * S;
    h += vfxLayer("pierce", hx + w / 2 - 16 * S, midY, w, w * 0.34, col, fade);
  } else if (kind === "bolt") {
    // a chain from the hero to each enemy, snapping taut then fading
    fxs.forEach((x) => {
      const w = Math.abs(x - hx) + 30 * S;
      h += vfxLayer("bolt", (hx + x) / 2, midY, w, w * 0.42, col, Math.min(1, p * 4) * fade);
    });
  } else if (kind === "wave") {
    // two ground rings, the second trailing the first, flattened into perspective
    for (let i = 0; i < 2; i++) {
      const q = Math.max(0, p - i * 0.22);
      if (q <= 0) continue;
      const d = q * 300 * S;
      h += vfxLayer("wave", hx, groundY - 10 * (vs || 1), d, d, col, (1 - q) * 0.95, "scaleY(0.36)");
    }
  } else if (kind === "vortex") {
    // spins up as it grows
    const d = (40 + p * 140) * S;
    h += vfxLayer("vortex", cx, midY, d, d, col, fade, "rotate(" + (p * 300).toFixed(0) + "deg)");
  } else if (kind === "meteor") {
    // comet falls in, then reuses the impact burst for the detonation
    if (p < 0.55) {
      const q = p / 0.55, d = 130 * S;
      h += vfxLayer("meteor", cx - 100 * S + q * 100 * S, -50 * S + q * (midY + 50 * S), d, d, col, 0.95);
    } else {
      const q = (p - 0.55) / 0.45, d = (50 + q * 130) * S;
      h += vfxLayer("impact", cx, midY, d, d, col, 1 - q);
    }
  } else if (kind === "cataclysm") {
    // full-arena wash, then a starburst over the whole wave
    const d = (70 + p * 260) * S;
    h += '<div style="position:absolute;inset:0;background:' + col +
      ";opacity:" + (fade * 0.22).toFixed(3) + '"></div>';
    h += vfxLayer("cataclysm", cx, midY - 8 * S, d, d, col, fade, "rotate(" + (p * 36).toFixed(0) + "deg)");
  } else if (kind === "aura" || kind === "heal") {
    // buffs sit on the hero for their whole duration, so they swell and settle
    const w = 84 * S, ht = 112 * S;
    h += vfxLayer(kind, hx, groundY - ht / 2 + 10 * S, w, ht, col, Math.sin(p * Math.PI) * 0.95);
  } else if (kind === "curse") {
    // a ring stamped over each target with its runes bearing down
    fxs.forEach((x) => { const d = (44 + p * 44) * S; h += vfxLayer("curse", x, midY, d, d, col, fade); });
  } else if (kind === "poison") {
    // a cloud that swells, drifts upward and thins out
    fxs.forEach((x) => {
      const d = (46 + p * 38) * S;
      h += vfxLayer("poison", x, midY - p * 18 * S, d, d, col, Math.sin(p * Math.PI) * 0.95);
    });
  }
  return h;
}

/* ---------------------------- sprite animation ----------------------------
   A sprite animates if ASSETS holds "<key>_attackN" entries. The swing plays
   across the unit's existing attack window, so timing needs no new state:
   heroAttacking / e.attacking already count down from ATTACK_WINDOW.
   Sprites with no frames simply keep their single image.
   -------------------------------------------------------------------------- */
const ATTACK_WINDOW = 0.2;
const FRAME_CACHE = {};
/* An attack frame is only ever named when a swing starts, so the browser had
   never fetched it: the <img> src changed to a cold URL and the sprite rendered
   nothing until the download finished. That is the character vanishing on the
   first blow. Two defences -- fetch the frames when the fighter appears, and
   fall back to the idle sprite for any frame that is not decoded yet, so a slow
   network degrades to "no attack pose" instead of "no character". */
const IMG_CACHE = {};
function preloadImg(url) {
  if (!url) return null;
  if (!IMG_CACHE[url]) { const im = new Image(); im.src = url; IMG_CACHE[url] = im; }
  return IMG_CACHE[url];
}
function imgReady(url) {
  const im = IMG_CACHE[url];
  return !!(im && im.complete && im.naturalWidth > 0);
}
function preloadFrames(key) {
  if (!key) return;
  preloadImg(ASSETS[key]);
  attackFrames(key).forEach(preloadImg);
}
function attackFrames(key) {
  if (FRAME_CACHE[key]) return FRAME_CACHE[key];
  const out = [];
  for (let i = 1; ASSETS[key + "_attack" + i]; i++) out.push(ASSETS[key + "_attack" + i]);
  FRAME_CACHE[key] = out;
  return out;
}
/* which image to draw for a unit right now */
function spriteFrame(key, attacking, t) {
  const f = attackFrames(key);
  if (!f.length || !(attacking > 0)) return ASSETS[key];
  // attacking counts DOWN, so progress runs 0 -> 1 across the swing
  const p = Math.min(0.999, Math.max(0, 1 - attacking / ATTACK_WINDOW));
  const url = f[Math.floor(p * f.length)];
  // never hand the DOM a frame that would render as a hole
  return imgReady(url) ? url : ASSETS[key];
}

/* Read of a fight, in the nameplate. Compares how long you need to put this
   enemy down against how long it needs to put you down, using the same derived
   stats the combat itself runs on. Under half the time it needs is comfortable,
   past four fifths is genuinely dangerous. Colour-blind players still have the
   tier colour on the pill and the health bars, so this adds a read rather than
   being the only one. */
const THREAT_C = { easy: "#57E07A", even: "#F5C542", hard: "#FF5A5A" };
function threatOf(c, e) {
  const d = D;
  const dps = Math.max(1, d.damage * d.attackSpeed * (1 + d.critChance / 100 * (d.critMult - 1)));
  const ttk = Math.max(0, e.maxHP) / dps;                       // seconds to kill it
  const foeDps = Math.max(0.01, (e.dmg || 1) / 1.4) * (1 - Math.min(85, d.dmgRed) / 100);
  const ttl = Math.max(0.01, (c.heroMaxHP || d.maxHP)) / foeDps; // seconds to be killed
  const r = ttk / ttl;
  return r < 0.45 ? "easy" : r < 1.05 ? "even" : "hard";
}
/* ---- the per-frame arena draw ---- */
function drawArena() {
  if (!arenaEl || !arenaNodes || !document.body.contains(arenaEl)) return;
  const c = combat;
  arenaT += 16;
  const t = arenaT;
  const w = arenaEl.clientWidth || 360;
  const scale = w / AW;
  // The arena became elastic, but the draw still used ARENA_H, so the ground
  // line sat at a fixed 228px. On a short arena that put every sprite below the
  // visible area -- the fight was being drawn off-screen. Both the ground line
  // and the sprite size now come from the height the arena actually has, and
  // the sprite is capped by whichever axis is tighter so it always fits.
  const h = arenaEl.clientHeight || ARENA_H;
  const vs = h / ARENA_H;
  const uni = CHAR * Math.min(scale, vs);
  const groundY = h - 22 * vs;
  {
    const sh = c && c.shake && c.shake.until > Date.now() ? c.shake : null;
    const k = sh ? (sh.until - Date.now()) / 170 : 0;
    const off = sh ? sh.mag * k : 0;
    const tf = off > 0.15
      ? "translate(" + (Math.sin(arenaT * 0.9) * off).toFixed(2) + "px," +
        (Math.cos(arenaT * 1.3) * off * 0.6).toFixed(2) + "px)"
      : "";
    if (arenaNodes.layer.style.transform !== tf) arenaNodes.layer.style.transform = tf;
  }

  if (!c) { arenaNodes.layer.innerHTML = ""; return; }

  // ---- header: title, floor-block track, status pills (sheet §4) ----
  const label = c.ctx === "campaign" ? "Étage " + fmtInt(c.floor)
    : c.ctx === "mega" ? "Méga " + megaLevelForFloor(c.floor) + " · Boss normal " + fmtInt(c.floor) + " ×10"
    : c.ctx === "arenaLive" ? "Arène · Duel réel"
    : c.raidId ? RAIDS[c.raidId].name : "Épreuve d'Ascension";
  if (arenaNodes.label.textContent !== label) arenaNodes.label.textContent = label;

  const track = c.ctx === "campaign" || c.ctx === "mega" ? floorTrack(c.floor) : "";
  if (lastTrack !== track) { arenaNodes.track.innerHTML = track; lastTrack = track; }

  const alive = c.enemies.filter((e) => e.alive).length;
  const total = c.enemies.length + c.pending;
  let sub;
  if (c.ctx === "campaign") {
    sub = '<span class="fPill">' + ic("swords", 10) + "Vague " + c.step + "/" + RULES.STEPS_PER_FLOOR + "</span>" +
      '<span class="fPill">Ennemis ' + (total - alive) + "/" + total + "</span>" +
      (c.boss ? '<span class="fPill boss">' + ic("skull", 10) + "BOSS</span>"
        : c.elite ? '<span class="fPill elite">' + ic("crown", 10) + "ÉLITE</span>" : "");
  } else if (c.ctx === "mega") {
    sub = '<span class="fPill boss">' + ic("skull", 10) + "MÉGA-BOSS ×10</span>" +
      '<span class="fPill">Étage ' + fmtInt(c.floor) + "</span>";
  } else if (c.ctx === "arenaLive") {
    const ae=c.enemies.find(e=>e.arenaProfile),ap=ae&&ae.arenaProfile;
    sub='<span class="fPill">'+ic("swords",10)+'TEMPS RÉEL</span>'+(ap?'<span class="fPill">'+esc(ARENA_BUILDS[ap.kind]?.label||"Bot")+' · '+fmt(ap.power||arenaProfilePower(ap))+' P</span>':'');
  } else if (c.raidId) {
    sub = '<span class="fPill">Niveau ' + c.raidLevel + "</span>" +
      (c.raidId === "or" ? '<span class="fPill">Vague ' + (5 - c.pending) + "/5</span>"
        : '<span class="fPill">Ennemis ' + (total - alive) + "/" + total + "</span>");
  } else {
    sub = '<span class="fPill elite">' + ic("star", 10) + "Gardien · Niveau " + S.level + "</span>";
  }
  if (lastSub !== sub) { arenaNodes.sub.innerHTML = sub; lastSub = sub; }
  const bgUrl = 'url("' + bgFor(c.bg) + '")';
  if (arenaNodes.bg.style.backgroundImage !== bgUrl) arenaNodes.bg.style.backgroundImage = bgUrl;
  const dKey = c.bg + "|" + (c.ctx === "campaign" ? c.floor : c.raidId || c.ctx);
  if (lastDecor !== dKey) { arenaNodes.decor.innerHTML = decorHTML(c.bg, c.floor || 1); lastDecor = dKey; }

  // smoothing toward the simulation snapshot
  // V154: slightly tighter visual follow reduces the last bit of skating without exposing simulation steps.
  P.hero += (c.heroX - P.hero) * 0.16;
  const live = {};
  c.enemies.forEach((e) => {
    live[e.id] = 1;
    if (P.en[e.id] == null) P.en[e.id] = e.x;
    P.en[e.id] += (e.x - P.en[e.id]) * 0.13;
  });
  Object.keys(P.en).forEach((id) => { if (!live[id]) delete P.en[id]; });

  const wt = WEAPON_TYPES[D.weapon] || WEAPON_TYPES.epee;
  const tgt = c.enemies.filter((e) => e.alive).sort((a, b) => a.x - b.x)[0];
  // the walk cycle now follows the same rule the movement does, so an archer
  // closing the gap is animated as walking rather than gliding
  const heroMoving = !!tgt && c.heroAttacking <= 0 && (tgt.x - c.heroX) > wt.range + 2;

  // best equipped rarity → aura
  let bestIdx = -1, auraRar = null;
  Object.values(S.equipped).forEach((it) => {
    if (it) { const i = equipRank(it.rarity); if (i > bestIdx) { bestIdx = i; auraRar = it.rarity; } }
  });
  const auraColor = (auraRar && auraRar !== "COMMUN") ? RARITY[auraRar].c : null;
  const weaponColor = S.equipped.arme ? RARITY[S.equipped.arme.rarity].c : WEAPON_SILVER;

  let html = "";

  // projectiles
  c.projs.forEach((p) => {
    const pa = ASSETS["proj_" + (p.kind || "arrow")];
    html += pa
      ? '<div class="proj" style="left:' + (p.x * scale - 11) + "px;top:" + (groundY - 30 * vs) +
        'px;width:22px;height:10px;background:none;box-shadow:none"><img src="' + pa +
        '" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 5px ' +
        p.color + ')"></div>'
      : '<div class="proj" style="left:' + (p.x * scale - 5) + "px;top:" + (groundY - 26 * vs) + "px;" +
        "background:" + p.color + ";box-shadow:0 0 7px " + p.color + '"></div>';
  });

  // ---- hero ----
  {
    const size = uni;
    // Marche naturelle : aucun saut vertical. Le déplacement vient de heroX,
    // avec seulement un léger transfert de poids pour éviter l'effet de glisse.
    const walkPhase = t * 0.0115;
    const idle = heroMoving ? 0 : Math.sin(t * 0.0036) * 0.8;
    const hop = 0;
    const tilt = heroMoving ? Math.sin(walkPhase) * 2.35 : Math.sin(t * 0.0030) * 0.8;
    const attackP = c.heroAttacking > 0 ? Math.max(0, Math.min(1, 1 - c.heroAttacking / ATTACK_WINDOW)) : 0;
    const lunge = c.heroAttacking > 0 ? Math.sin(attackP * Math.PI) * 9 : 0;
    const knock = c.heroHit > 0 ? -Math.min(5, c.heroHit * 16) : 0;
    const sc = 1;   // the hero holds one size: no breathing, no attack punch
    const auraPulse = 1 + Math.sin(t * 0.006) * 0.06;
    const hpPct = Math.max(0, (c.heroHP / c.heroMaxHP) * 100);

    html += '<div class="unit" style="left:' + (P.hero * scale - size / 2) + 'px;top:' + (groundY - size) + 'px;' +
      'width:' + size + 'px;height:' + size + 'px;transform:translate(' + (lunge + knock) + 'px,' + (idle + hop) + 'px);z-index:4">' +
      '<div class="ushadow" style="width:' + (size * 0.6) + 'px;left:' + (size * 0.2) + 'px;top:' + (size - 8) + 'px"></div>' +
      (auraColor ? '<div class="aura" style="left:' + (size * 0.05) + 'px;top:' + (size * 0.02) + 'px;width:' + (size * 0.9) + 'px;' +
        'height:' + (size * 0.94) + 'px;background:' + auraColor + '22;border-color:' + auraColor + '99;' +
        'transform:scale(' + auraPulse + ');box-shadow:0 0 14px ' + auraColor + '"></div>' : '') +

      '<img src="' + spriteFrame("hero", c.heroAttacking, t) + '" style="transform:rotate(' + tilt + 'deg) scale(' + sc + ')">' +
      weaponHTML(D.weapon, weaponColor, c.heroAttacking > 0, t, size) +
      (c.heroAttacking > 0
        ? (RANGED_IDS.includes(D.weapon)
            ? releaseHTML(c.heroAttacking, size, weaponColor)
            : slashHTML(c.heroAttacking, size))
        : '') +
      (c.heroHit > 0 ? sparkHTML(c.heroHit, 0.15, size, '#FF9A5A') : '') +
      '<div class="hpMini" style="top:-12px"><i style="width:' + hpPct + '%"></i></div>' +
      '</div>';
  }

  // ---- enemies ----
  c.enemies.filter((e) => e.alive || e.hitFlash > 0).forEach((e) => {
    const size = e.boss ? uni * 1.45 : (e.small ? uni * 0.5 : uni);
    const x = (P.en[e.id] != null ? P.en[e.id] : e.x) * scale;
    const phase = (x % 100) / 16;
    const idle = Math.sin(t * 0.0045 + phase) * 2 + Math.sin(t * 0.0019 + phase) * 1;
    const tilt = Math.sin(t * 0.0045 + phase) * 2.4;
    const enemyAttackP = e.attacking > 0 ? Math.max(0, Math.min(1, 1 - e.attacking / ATTACK_WINDOW)) : 0;
    const lunge = (e.attacking > 0 ? -Math.sin(enemyAttackP * Math.PI) * 10 : 0) + (e.recoil > 0 ? e.recoil * 44 : 0);
    const knock = e.hitFlash > 0 ? Math.min(5, e.hitFlash * 18) : 0;
    const hpPct = Math.max(0, (e.hp / e.maxHP) * 100);
    html += '<div class="unit" style="' + (e.vanish > 0 ? "opacity:.22;filter:brightness(.4);" : "") +
      (e.tint ? "filter:drop-shadow(0 0 7px " + e.tint + ") saturate(1.5);" : "") +
      "left:" + (x - size / 2) + 'px;top:' + (groundY - size - (e.flying > 0 ? 44 * vs : 0)) + 'px;' +
      'width:' + size + 'px;height:' + size + 'px;transform:translate(' + (lunge + knock) + 'px,' + idle + 'px);z-index:3">' +
      '<div class="ushadow" style="width:' + (size * 0.6) + 'px;left:' + (size * 0.2) + 'px;top:' + (size - 8) + 'px"></div>' +
      '<img src="' + (spriteFrame(e.type.img, e.attacking) || ASSETS.enemy_goblin) + '" ' +
      'style="transform:scaleX(-1) rotate(' + tilt + 'deg)">' +
      (e.hitFlash > 0 ? sparkHTML(e.hitFlash, 0.15, size, '#FFFFFF') : '') +
      '<div class="hpMini foe" style="top:-12px"><i style="width:' + hpPct + '%;background:' +
      (e.boss ? "#E5484D" : "#ff7b3f") + '"></i></div>' +
      // every enemy is named now, because the colour is the point
      '<div class="foeTag" style="color:' + THREAT_C[threatOf(c, e)] + '">' +
        esc(e.name || e.type.name) + "</div>" +
      (() => {
        return abilitiesOf(e).map((a) => {
          const st = a.state ? a.state(e) : "";
          return st ? '<div class="foeAbil" style="color:' + a.c + ";border-color:" + a.c + '">' + st + "</div>" : "";
        }).join("");
      })() +
      '</div>';
  });

  // ---- skill VFX layer ----
  html += skillVfxHTML(c, scale, groundY, uni, vs);

  // ---- damage floats ----
  const now = Date.now();
  c.floats.forEach((f) => {
    const age = (now - f.born) / 900;
    // CRITIQUE! / BLOCK! / ESQUIVE! headers over the number, per the sheet
    const lbl = f.text || (f.blocked ? "BLOCK !" : f.dodged ? "DODGE !" : f.crit ? "CRITIQUE !" : "");
    const lblCol = f.text ? f.color : f.blocked ? "#FF5A5F" : f.dodged ? "#4AA8FF" : "#FFC83D";
    const val = f.text || f.blocked || f.dodged ? "" : (f.heal ? "+" : "-") + fmt(f.val);
    html += '<div class="float" style="left:' + (f.x * scale - 34) + 'px;top:' + (groundY - (52 + age * 46) * vs) + 'px;' +
      'width:80px;opacity:' + (1 - age) + ';transform:scale(' + (f.crit ? 1.16 : 1) + ')">' +
      (lbl ? '<span class="fLbl" style="color:' + lblCol + '">' + lbl + "</span>" : "") +
      (val ? '<span class="fVal" style="color:' + (f.heal ? "#57E07A" : f.color) +
        ";font-size:" + (f.crit ? 21 : 15) + 'px">' + val + "</span>" : "") + "</div>";
  });

  arenaNodes.layer.innerHTML = html;

  // victory / defeat banner
  const b = arenaNodes.banner;
  const flashing = floorFlash && Date.now() < floorFlash.until;
  if (!flashing && floorFlash) floorFlash = null;
  if (flashing && c.status !== "lost") {
    b.className = ""; b.style.color = C.gold;
    b.textContent = "ÉTAGE " + fmtInt(floorFlash.floor);
  } else if (c.status === "won") {
    b.className = ""; b.textContent = "VICTOIRE"; b.style.color = C.gold;
  } else if (c.status === "lost") {
    b.className = ""; b.textContent = "VAINCU"; b.style.color = C.red;
  } else if (b.className !== "hide") {
    b.className = "hide";
  }
}

/* Skill cooldown rings and the active-effect chips have to move every frame,
   so they are driven from the render loop rather than the DOM re-render. */
function updateCombatHud() {
  const bar = document.getElementById("skillbar");
  if (bar) {
    bar.querySelectorAll(".slot[data-skill]").forEach((el) => {
      const id = el.dataset.skill;
      const left = combat && combat.skillCds ? Math.max(0, combat.skillCds[id] || 0) : 0;
      const max = (combat && combat.skillCdMax && combat.skillCdMax[id]) ||
        (SKILL_BY_ID[id] ? SKILL_BY_ID[id].cd : 1);
      const arc = el.querySelector(".cdArc");
      const txt = el.querySelector(".cdTxt");
      const frac = max > 0 ? Math.max(0, Math.min(1, left / max)) : 0;
      if (arc) arc.setAttribute("stroke-dashoffset", String(125.6 * (1 - frac)));
      if (txt) txt.textContent = left > 0.05 ? (left >= 10 ? left.toFixed(0) : left.toFixed(1)) : "";
      el.classList.toggle("cooling", left > 0.05);
    });
  }
  // an effect belongs to the skill that cast it, so it shows on that icon
  const live = {};
  [].concat(fxList(combat, "buffs"), fxList(combat, "debuffs")).forEach((b) => {
    const d = SKILL_BY_EFFKEY[b.key];
    if (d) live[d.id] = b.left;
  });
  document.querySelectorAll(".slot[data-skill]").forEach((el) => {
    const bub = el.querySelector(".fxBub");
    if (!bub) return;
    const left = live[el.dataset.skill];
    if (left > 0.05) {
      const t = left >= 10 ? Math.ceil(left) + "s" : left.toFixed(1) + "s";
      if (bub.textContent !== t) bub.textContent = t;
      bub.style.display = "";
    } else if (bub.style.display !== "none") {
      bub.style.display = "none";
    }
  });
}
function rafLoop() { drawArena(); updateCombatHud(); requestAnimationFrame(rafLoop); }

/* ---------------- SANCTUAIRE / FUSION ----------------
   Horizontal conversion system. No timer: a valid recipe resolves instantly.
   The Sanctuaire opens after the first Mega-Boss clear. Recipes use existing
   resources so this system does not create a second economy by itself. */
const SANCT_ING = {
  minerai:   { label: "Minerai", icon: "hammer", unit: "Minerai" },
  poussiere: { label: "Poussière", icon: "bag", unit: "Poussière" },
  eclat:     { label: "Éclats", icon: "book", unit: "Éclats" },
  essence:   { label: "Essence", icon: "flame", unit: "Essence" },
};
const SANCT_RECIPES = [
  { id:"r1", a:"minerai", aq:100, b:"minerai", bq:100, out:"a1", qty:1, name:"Étincelle temporelle", secret:false },
  { id:"r2", a:"eclat", aq:20, b:"essence", bq:20, out:"a5", qty:1, name:"Convergence mystique", secret:false },
  { id:"r3", a:"poussiere", aq:150, b:"minerai", bq:250, out:"a15", qty:1, name:"Sablier ancien", secret:false },
  { id:"r4", a:"eclat", aq:50, b:"essence", bq:50, out:"a30", qty:1, name:"Résonance parfaite", secret:true },
  { id:"r5", a:"poussiere", aq:500, b:"essence", bq:100, out:"a60", qty:1, name:"Cœur du temps", secret:true },
  { id:"r6", a:"minerai", aq:300, b:"eclat", bq:30, out:"seal", qty:1, name:"Sceau de stabilité", secret:false },
];
function sanctuaryUnlocked(st) {
  return !!(st && st.megaBossClears && Object.keys(st.megaBossClears).some((k) => st.megaBossClears[k]));
}
function sanctRecipeFor(a,b) {
  return SANCT_RECIPES.find((r) => (r.a===a && r.b===b) || (r.a===b && r.b===a)) || null;
}
function sanctNeedFor(r,key) {
  let n=0; if(r.a===key)n+=r.aq; if(r.b===key)n+=r.bq; return n;
}
function sanctFuse() {
  if (!sanctuaryUnlocked(S)) return {ok:false,msg:"Sanctuaire verrouillé"};
  const a=S.sanctuary.slotA, b=S.sanctuary.slotB;
  if(!a || !b) return {ok:false,msg:"Place deux ressources dans le cercle"};
  const r=sanctRecipeFor(a,b);
  if(!r) return {ok:false,msg:"Aucune réaction… Cette combinaison ne forme rien."};
  for(const k of Object.keys(SANCT_ING)) {
    const need=sanctNeedFor(r,k); if(need && (S[k]||0)<need) return {ok:false,msg:"Ressources insuffisantes"};
  }
  update((st)=>{
    for(const k of Object.keys(SANCT_ING)) { const need=sanctNeedFor(r,k); if(need) st[k]-=need; }
    if (r.out === "seal") st.sanctuary.stabilitySeals=(st.sanctuary.stabilitySeals||0)+r.qty;
    else st.accels[r.out]=(st.accels[r.out]||0)+r.qty;
    st.sanctuary.discovered[r.id]=true; st.sanctuary.fusions=(st.sanctuary.fusions||0)+1;
    st.sanctuary.slotA=null; st.sanctuary.slotB=null;
  });
  return {ok:true,recipe:r};
}
function sanctSetSlot(key) {
  if(!SANCT_ING[key]) return;
  update((st)=>{
    if(!st.sanctuary.slotA) st.sanctuary.slotA=key;
    else if(!st.sanctuary.slotB) st.sanctuary.slotB=key;
    else { st.sanctuary.slotA=st.sanctuary.slotB; st.sanctuary.slotB=key; }
  });
}
function sanctClearSlot(which){ update((st)=>{ if(which==='a') st.sanctuary.slotA=null; else st.sanctuary.slotB=null; }); }

/* =========================================================================
   UI — port of the app/ screens (expo-router) to a plain-DOM router
   ========================================================================= */
let route = "accueil";
// Preserve the compact Home "Plus" drawer across the 1s live HUD re-render.
let homeMoreOpen = false;
let goalDetailsOpen = false;
let renderQueued = false;
let raidResult = null;      // { raidId, won, reward } pending modal
let megaResult = null;      // first-clear state and Apple reward
let trialRunning = false;

/* Arena de simulation: laboratoire PvP local, sans récompenses ni données serveur.
   La population est synthétique tant que la télémétrie de vrais joueurs n'existe pas. */
let arenaSimCfg = { progression: "j7", ratio: "natural", build: "random", count: 100 };
let arenaSimResult = null;
let arenaMatrixResult = null;
let arenaMatrixProgress = null;
let arenaMatrixRun = null;

const TABS = [
  { id: "accueil",       label: "Accueil",       icon: "castle" },
  { id: "equipement",    label: "Équipement",    icon: "swords" },
  { id: "developpement", label: "Développement", icon: "tree" },
  { id: "parametres",    label: "Réglages",      icon: "gear" },
];
const TAB_IDS = TABS.map((t) => t.id);
const TIMER_SCREENS = ["accueil", "arbre", "familiers", "raid", "mega", "competences"];
function isTimerScreen() { return TIMER_SCREENS.includes(route); }

function nav(to) {
  if (to === "inventaire" || to === "personnage") to = "equipement";
  route = to;
  const sc = document.getElementById("screen");
  if (sc) sc.scrollTop = 0;
  render();
}
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; render(); });
}

/* ---------------- small html helpers ---------------- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function bar(pct, color, h) {
  h = h || 6;
  // `color` doubles as currentColor so the fill picks up its own bloom
  return '<div class="bar" style="height:' + h + 'px"><i style="width:' + Math.max(0, Math.min(100, pct)) +
    "%;background:linear-gradient(180deg," + shade(color, 14) + "," + color + ");color:" + color + '"></i></div>';
}
/* labelled meter used by the pity / mastery readouts (sheet §14) */
function meter(pct, color, label) {
  return '<div class="meter"><i style="width:' + Math.max(0, Math.min(100, pct)) +
    "%;background:linear-gradient(180deg," + shade(color, 16) + "," + color + ')"></i>' +
    (label ? "<span>" + label + "</span>" : "") + "</div>";
}
function btn(label, opts) {
  opts = opts || {};
  const cls = "btn " + (opts.cls || "") + (opts.small ? " sm" : "");
  return '<button class="' + cls + '"' + (opts.act ? ' data-act="' + opts.act + '"' : "") +
    (opts.arg !== undefined ? ' data-arg="' + esc(opts.arg) + '"' : "") +
    (opts.arg2 !== undefined ? ' data-arg2="' + esc(opts.arg2) + '"' : "") +
    (opts.primary ? ' data-primary="true"' : "") +
    (opts.dis ? " disabled" : "") +
    (opts.style ? ' style="' + opts.style + '"' : "") + ">" + label + "</button>";
}
function rtag(r) {
  const c = RARITY[r].c;
  return '<span class="tag" style="color:' + c + ";border-color:" + c + "88;background:linear-gradient(180deg," + c +
    "26," + c + '0d);box-shadow:0 0 9px ' + c + '3d,inset 0 1px 0 #ffffff1a">' + RARITY[r].label + "</span>";
}
function topbar(title, right) {
  return '<div id="topbar"><div class="back" data-act="back">' + ic("back", 15) +
    '</div><h2 class="title flex1">' + title + "</h2>" + (right || "") + "</div>";
}
function ratesTable(rates, nextRates, curLabel, nextLabel, order) {
  // Without a next-level column this is just eight name/value pairs, so it
  // pairs up into two columns and costs half the height.
  const twoUp = !nextRates;
  let h = '<div class="rateBox' + (twoUp ? " twoUp" : "") + '"><div class="rateHead"><span class="nm">Rareté</span><b>' +
    curLabel + "</b>" + (nextRates ? "<b>" + nextLabel + '</b><b style="color:' + C.green + '">Gain</b>' : "") + "</div>";
  if (twoUp) h += '<div class="rateCols">';
  (order || RARITY_ORDER).forEach((r) => {
    const cur = rates[r], nxt = nextRates ? nextRates[r] : cur, delta = nxt - cur;
    if (cur < 0.05 && nxt < 0.05) return;
    h += '<div class="rateRow"><span class="nm"><i class="rdot" style="background:' + RARITY[r].c +
      ";color:" + RARITY[r].c + '"></i>' + RARITY[r].label + "</span>" +
      "<b>" + cur.toFixed(cur < 10 ? 1 : 0) + "%</b>" +
      (nextRates ? '<b style="color:' + RARITY[r].c + '">' + nxt.toFixed(nxt < 10 ? 1 : 0) + "%</b>" +
        '<b style="color:' + (delta >= 0.05 ? C.green : delta <= -0.05 ? C.red : C.textMute) + '">' +
        (Math.abs(delta) < 0.05 ? "—" : (delta >= 0.05 ? "+" : "") + delta.toFixed(1) + "%") + "</b>" : "") +
      "</div>";
  });
  return h + (twoUp ? "</div>" : "") + "</div>";
}

/* ---------------------------- info popups ---------------------------------
   Same shape as the Arbre's node popup: what it is, what it does, and where it
   comes from. Anything the player can see a number for should be able to
   explain itself without guesswork.
   -------------------------------------------------------------------------- */
const RESOURCE_INFO = {
  gold:      { icon: "gold", c: "#F5C542", label: "Or", get: (s) => s.gold,
    desc: "Sert uniquement à payer les améliorations de Forge, le seul puits d'Or du jeu.",
    from: ["Étages — petite source régulière", "Raid Or — source principale", "Récolte automatique"] },
  gems:      { icon: "gem", c: "#FF4D8D", label: "Gemmes", get: (s) => s.gems,
    desc: "Monnaie premium : offres de la Boutique et emplacements d'Œuf supplémentaires.",
    from: ["Boutique", "Paliers d'Ascension", "Événements"] },
  minerai:   { icon: "minerai", c: "#4A90D9", label: "Minerai", get: (s) => s.minerai,
    desc: "Sert à forger de l'équipement.",
    from: ["Raid Minerai", "Récolte automatique"] },
  poussiere: { icon: "poussiere", c: "#B15CF6", label: "Poussière", get: (s) => s.poussiere,
    desc: "Améliore le niveau d'un équipement déjà obtenu, sans toucher à ses bonus de stats.",
    from: ["Recyclage d'équipement"] },
  eclat:     { icon: "eclat", c: "#C79BFF", label: "Points de Compétence", get: (s) => s.eclat,
    desc: "Sert à invoquer des Compétences. Une invocation coûte " + skillSummonCost(S) + " points." + ((S.economyDebt && S.economyDebt.eclat) ? " Rééquilibrage en cours : les prochains Éclats remboursent d’abord " + fmt(S.economyDebt.eclat) + " Éclats historiques." : ""),
    from: ["Raid Compétence", "Récolte automatique — 25 % d'une entrée par heure"] },
  essence:   { icon: "essence", c: "#FFC29B", label: "Essence animale", get: (s) => s.essence,
    desc: "Sert à invoquer des œufs de Familier. Une invocation coûte " + PET_SUMMON_COST + " Essence." + ((S.economyDebt && S.economyDebt.essence) ? " Rééquilibrage en cours : les prochaines Essences remboursent d’abord " + fmt(S.economyDebt.essence) + " Essences historiques." : ""),
    from: ["Raid Familier", "Récolte automatique — 25 % d'une entrée par heure"] },
  apples:    { icon: "paw", c: "#8ED05A", label: "Pommes", get: (s) => s.apples || 0,
    desc: "Sert à améliorer le niveau des Familiers. Une récompense de première victoire uniquement.",
    from: ["Première victoire contre chaque Méga-Boss", "Bonus Rebirth Gain Pommes",
      "Remboursement des doublons fusionnés et de l’Ascension Familier"] },
  pa:        { icon: "pa", c: "#FFD65E", label: "Points de Statistique", get: (s) => s.statPoints,
    desc: "S'attribuent librement entre Santé, Dégâts, Chance critique et Réduction critique.",
    from: ["Montée de niveau — +" + RULES.STAT_POINTS_PER_LEVEL + " par niveau"] },
  pe:        { icon: "chart", c: "#3FCFD6", label: "Points d'Évolution", get: (s) => s.pe,
    desc: "Seule ressource de l'Arbre personnel : ouvre un nœud, puis paie chacun de ses niveaux suivants.",
    from: ["Raid Évolution — seule source, jamais la Récolte automatique"] },
  key:       { icon: "key", c: "#E8B44A", label: "Clés de Raid", get: (s) => s.universalKeys,
    desc: "Une clé est consommée uniquement après une victoire en Raid. En cas de défaite ou d’abandon, elle est conservée. La Récolte automatique n'en consomme aucune.",
    from: ["Recharge quotidienne", "Publicité", "Nœuds « Clé de Raid » de l'Arbre"] },
};
const STAT_INFO = {
  maxhp:      { label: "PV Max", c: "#E5484D", icon: "heart", get: () => fmt(D.maxHP),
    desc: "Points de vie totaux. Tomber à zéro fait échouer la vague en cours.",
    from: ["Points de Santé (+20 / point)", "Équipement (Casque, Armure, Chaussures)", "Familier actif", "Forge", "Rebirth"] },
  damage:     { label: "Dégâts", c: "#F0883E", icon: "flame", get: () => fmt(D.damage),
    desc: "Dégâts d'une attaque de base, avant critique.",
    from: ["Points de Dégâts (+2,2 / point)", "Équipement (Arme, Gants, Anneau)", "Familier actif", "Forge", "Maîtrises"] },
  atkspeed:   { label: "Vitesse d'attaque", c: "#F5C542", icon: "bolt", get: () => D.attackSpeed.toFixed(2),
    desc: "Nombre d'attaques par seconde.", from: ["Rebirth", "Bonus d'équipement", "Familier Électrique (+8 %)"] },
  movespeed:  { label: "Vitesse de déplacement", c: "#3FCFD6", icon: "haste", get: () => fmt(D.moveSpeed),
    desc: "Vitesse d'approche vers l'ennemi au début de chaque vague.", from: ["Bonus d'équipement"] },
  crit:       { label: "Chance Critique", c: "#F5C542", icon: "target", get: () => D.critChance.toFixed(1) + "%",
    desc: "Probabilité qu'une attaque soit critique. Plafonnée à " + CRIT_CHANCE_CAP + " %.",
    from: ["Points de Chance Critique (+0,2 / point)", "Bonus d'équipement"] },
  critmult:   { label: "Dégâts Critiques", c: "#FF5AA0", icon: "sparkle", get: () => "x" + D.critMult.toFixed(2),
    desc: "Multiplicateur appliqué aux dégâts lors d'un coup critique.", from: ["Rebirth", "Bonus d'équipement"] },
  critred:    { label: "Réduction Critique", c: "#4A90D9", icon: "shield", get: () => D.critRed.toFixed(1) + "%",
    desc: "Réduit la probabilité que les ennemis te touchent en critique. Plafonnée à " + CRIT_RED_CAP + " %.",
    from: ["Points de Réduc. Crit (+0,3 / point)"] },
  dmgred:     { label: "Réduction de Dégâts", c: "#4A90D9", icon: "shield", get: () => D.dmgRed.toFixed(1) + "%",
    desc: "Réduit tous les dégâts subis.", from: ["Rebirth"] },
  regen:      { label: "Régénération", c: "#3FB950", icon: "heal", get: () => D.regen.toFixed(2) + "%/s",
    desc: "Pourcentage de tes PV max régénéré chaque seconde en combat.", from: ["Rebirth"] },
  lifesteal:  { label: "Vol de Vie", c: "#3FA7FF", icon: "droplet", get: () => D.lifesteal.toFixed(2) + "%",
    desc: "Part des dégâts infligés qui te sont rendus en PV.", from: ["Rebirth", "Bonus d'équipement"] },
  bossdmg:    { label: "Dégâts Boss", c: "#E5484D", icon: "skull", get: () => "+" + D.bossDmg.toFixed(0) + "%",
    desc: "Dégâts supplémentaires contre les Boss et les Élites.", from: ["Rebirth"] },
  block:      { label: "Chance de blocage", c: "#72A7E8", icon: "shield", get: () => D.blockChance.toFixed(1) + "%",
    desc: "Chance de bloquer une attaque ennemie.", from: ["Bonus d'équipement"] },
  doubleatk:  { label: "Double attaque", c: "#F5C542", icon: "swords", get: () => D.doubleAtk.toFixed(1) + "%",
    desc: "Chance qu'une attaque de base frappe une seconde fois.", from: ["Bonus d'équipement"] },
  melee:      { label: "Dégâts mêlée", c: "#F0883E", icon: "sword", get: () => "+" + D.meleeDmg.toFixed(1) + "%",
    desc: "Bonus de dégâts quand ton arme est utilisée au corps à corps.", from: ["Bonus d'équipement"] },
  ranged:     { label: "Dégâts distance", c: "#8FEFF4", icon: "forward", get: () => "+" + D.rangedDmg.toFixed(1) + "%",
    desc: "Bonus de dégâts pour les attaques à distance.", from: ["Bonus d'équipement"] },
  skilldmg:   { label: "Dégâts des Compétences", c: "#C79BFF", icon: "eclat", get: () => "+" + D.skillDmgBonus.toFixed(1) + "%",
    desc: "Augmente les dégâts infligés par tes compétences actives.", from: ["Arbre personnel", "Bonus d'équipement"] },
  skillcd:    { label: "Recharge Compétences", c: "#B15CF6", icon: "clock", get: () => "-" + D.skillCdCut.toFixed(1) + "%",
    desc: "Réduit le temps de recharge de tes compétences actives.", from: ["Bonus d'équipement"] },
  weapon:     { label: "Arme", c: "#EDE9F5", icon: "sword", get: () => WEAPON_TYPES[D.weapon].name,
    desc: "Type d'arme équipée. Il détermine la portée, la cadence et le style d'attaque.",
    from: ["Arme équipée — chaque type a sa portée et sa vitesse"] },
};
function showInfoModal(title, icon, col, value, desc, from) {
  openModal(
    '<div class="row gap10" style="margin-bottom:11px">' +
      '<div class="imini" style="width:42px;height:42px;background:linear-gradient(180deg,' + col + '33,' + col +
        '0f);border-color:' + col + '80">' + ic(icon, 23) + "</div>" +
      '<div class="flex1"><div class="mute tiny b">ACTUEL</div>' +
        '<div class="bb" style="font-size:19px;color:' + col + '">' + value + "</div></div></div>" +
    '<div class="notice" style="border-left-color:' + col + '">' + esc(desc) + "</div>" +
    (from && from.length
      ? '<div class="mt10"><div class="mute tiny b" style="letter-spacing:.6px;margin-bottom:6px">PROVENANCE</div>' +
        from.map((l) => '<div class="row gap6 tiny b mt4" style="color:var(--textDim)">' +
          ic("chevron", 9) + esc(l) + "</div>").join("") + "</div>"
      : "") +
    '<div class="mt12">' + btn("Fermer", { cls: "dark", small: true, act: "closeModal" }) + "</div>",
    title);
}
function showResourceInfo(key) {
  const r = RESOURCE_INFO[key];
  if (r) showInfoModal(r.label, r.icon, r.c, fmt(r.get(S)), r.desc, r.from);
}
function showStatInfo(key) {
  const t = STAT_INFO[key];
  if (t) showInfoModal(t.label, t.icon, t.c, t.get(), t.desc, t.from);
}

/* ---------------- toast + modal ---------------- */
let toastTimer = null;
let powerDeltaPending = 0, powerDeltaTimer = null;
function queuePowerDelta(delta) {
  if (!Number.isFinite(delta) || !delta) return;
  powerDeltaPending += Math.round(delta);
  clearTimeout(powerDeltaTimer);
  powerDeltaTimer = setTimeout(() => {
    const value = powerDeltaPending; powerDeltaPending = 0;
    const old = document.getElementById("powerDelta"); if (old) old.remove();
    const el = document.createElement("div");
    el.id = "powerDelta"; el.className = "powerDelta " + (value > 0 ? "up" : "down");
    el.innerHTML = '<small>Puissance</small>' + (value > 0 ? "+" : "") + fmt(value);
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 1950);
  }, 90);
}
function toast(msg, ok, sub, icon) {
  const old = document.getElementById("toast");
  if (old) old.remove();
  const el = document.createElement("div");
  el.id = "toast";
  el.className = "nban " + (ok ? "green" : "gold");
  el.innerHTML = ic(icon || (ok ? "check" : "cross"), 20) +
    '<div><div class="nt">' + esc(msg) + "</div>" +
    (sub ? '<div class="ns">' + esc(sub) + "</div>" : "") + "</div>";
  document.getElementById("app").appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { const t = document.getElementById("toast"); if (t) t.remove(); }, 1700);
}
/* framed dialog: optional gold title bar + close chip, body below (sheet §6) */
/* Sections used to collapse behind a toggle. Nothing hides now: the header
   stays as a divider and the body is always on screen, so every screen reads at
   a glance and nothing costs an extra click to reach. */
function fold(key, title, body, style) {
  return '<section class="fold" data-fold="' + key + '"' +
    (style ? ' style="' + style + '"' : "") + '><div class="foldT">' + title + "</div>" + body + "</section>";
}
function openModal(html, title) {
  closeModal();
  const ov = document.createElement("div");
  ov.id = "overlay";
  ov.innerHTML = '<div class="card frame">' +
    (title ? '<div class="mhead"><span class="mt">' + title + '</span>' +
      '<div class="mx" data-act="closeModal">' + ic("cross", 10) + "</div></div>" : "") +
    '<div class="mbody">' + html + "</div></div>";
  ov.addEventListener("click", (e) => { if (e.target === ov) closeModal(); });
  document.getElementById("app").appendChild(ov);
}
function isHarvestOpen() {
  const ov = document.getElementById("overlay");
  return !!(ov && ov.getAttribute("data-modal") === "harvest");
}
function refreshHarvestModal() {
  const ov = document.getElementById("overlay");
  if (!ov) return;
  const body = ov.querySelector(".mbody");
  if (body) body.innerHTML = harvestModalHTML();
  if (typeof queueDecisionHierarchyV30 === "function") queueDecisionHierarchyV30();
}
function closeModal() {
  const ov = document.getElementById("overlay");
  if (ov) ov.remove();
}
/* a rate can legitimately be fractional (12.5 Compétence/h), so keep one
   decimal below 100 and drop it once the number is big enough not to care */
function fmtRate(v) {
  if (v >= 100) return fmt(Math.round(v));
  return (Math.round(v * 10) / 10).toString().replace(".", ",");
}
function harvestModalHTML() {
  const h = S.harvest, cap = harvestCapSeconds(S), eff = harvestEfficiency(S);
  const rates = harvestRates(S);
  const full = h.secs >= cap;
  const pct = Math.min(100, (h.secs / cap) * 100);

  const row = (icon, col, label, amount, rate) =>
    '<div class="itemRow" style="border-left-color:' + col + '">' +
      '<div class="imini" style="width:30px;height:30px;border-color:' + col + '80">' + ic(icon, 17) + "</div>" +
      '<div class="flex1"><div class="b small">' + label + "</div>" +
        '<div class="mute tiny b">' + fmtRate(rate) + " / heure</div></div>" +
      '<div class="bb" style="font-size:15px;color:' + col + '">+' + fmt(Math.floor(amount)) + "</div>" +
    "</div>";

  return '<div class="between tiny b" style="margin-bottom:5px">' +
      '<span class="mute">Temps accumulé</span>' +
      '<span style="color:' + (full ? "var(--goldLit)" : "var(--textDim)") + '">' +
        fmtDur(Math.floor(h.secs)) + " / " + afkCapHours(S) + "h</span></div>" +
    '<div style="margin-bottom:10px">' + meter(pct, full ? C.gold : C.blue,
      full ? "Réserve pleine" : Math.round(pct) + "%") + "</div>" +

    '<div class="row gap6" style="margin-bottom:12px">' +
      '<div class="card flex1 center" style="padding:8px 6px">' +
        '<div class="mute tiny b">AUTONOMIE</div>' +
        '<div class="bb" style="font-size:15px;color:var(--blueLit)">' + afkCapHours(S) + "h</div>" +
        '<div class="mute tiny">durée max de stockage</div></div>' +
      '<div class="card flex1 center" style="padding:8px 6px">' +
        '<div class="mute tiny b">EFFICACITÉ</div>' +
        '<div class="bb" style="font-size:15px;color:#8FEFF4">+' + eff + "%</div>" +
        '<div class="mute tiny">quantité produite</div></div>' +
    "</div>" +

    '<div class="sect" style="margin:0 0 8px">Ressources accumulées</div>' +
    row("minerai", "#4A90D9", "Minerai", h.minerai, rates.minerai) +
    row("essence", "#F0883E", "Essence animale", h.essence, rates.essence) +
    row("eclat", "#B15CF6", "Points de Compétence", h.eclat, rates.eclat) +
    row("gold", "#F5C542", "Or", h.gold, rates.gold) +

    (full ? '<div class="notice center mt8 tiny b" style="color:var(--goldLit)">' +
      "Réserve pleine — réclame pour relancer la production</div>" : "") +

    '<div class="mt10">' + btn(ic("check", 14) + "RÉCLAMER",
      { cls: "green", act: "harvestClaim", dis: harvestIsEmpty(S) }) + "</div>";
}

/* Nothing here is reversible, so the dialog spells out every consequence and
   the confirm button is deliberately the second step, not the first. */
function showRaidAscendModal(rid) {
  if (!canAscendRaid(S, rid)) return;
  const meta = RAIDS[rid], r = S.raids[rid];
  const line = (icon, col, label, val) =>
    '<div class="kv"><span class="dim row gap6">' + ic(icon, 11) + esc(label) + "</span>" +
    '<b style="color:' + col + '">' + esc(val) + "</b></div>";
  openModal(
    '<div class="center" style="margin-bottom:10px">' +
      '<div class="bb" style="font-size:22px;color:var(--goldLit);letter-spacing:2px">★</div>' +
      '<div class="mute tiny b mt4">' + raidStars(S, rid) + " ★ → " + (raidStars(S, rid) + 1) + " ★</div></div>" +
    '<div class="notice" style="border-left-color:' + meta.color + '">' +
      esc(meta.name) + " repart au niveau 1.</div>" +
    '<div class="sect" style="margin:12px 0 6px">Réinitialisé</div>' +
    line("cross", "var(--redLit)", "Niveau du raid", r.level + " → 1") +
    '<div class="sect" style="margin:12px 0 6px">Conservé</div>' +
    line("check", "var(--greenLit)", "Clés de ce raid", String(r.keys)) +
    line("check", "var(--greenLit)", "Record", String(r.record)) +
    line("check", "var(--greenLit)", "Les quatre autres raids", "intacts") +
    '<div class="notice center mt10 tiny b" style="color:var(--redLit);border-left-color:var(--red)">' +
      "Cette action est définitive.</div>" +
    '<div class="col gap6 mt10">' +
      btn(ic("star", 14) + "Ascensionner " + esc(meta.name), { cls: "purple", small: true,
        act: "ascendRaidDo", arg: rid }) +
      btn("Annuler", { cls: "dark", small: true, act: "closeModal" }) + "</div>",
    "Ascension · " + esc(meta.name));
}
function showAscendModal(sys) {
  if (!ASCENSION[sys] || !canAscend(S, sys)) return;
  const p = ascensionPreview(S, sys);
  const line = (icon, col, label, val) =>
    '<div class="kv"><span class="dim row gap6">' + ic(icon, 11) + esc(label) + "</span>" +
    '<b style="color:' + col + '">' + esc(val) + "</b></div>";
  openModal(
    '<div class="center" style="margin-bottom:10px">' +
      '<div class="bb" style="font-size:22px;color:var(--goldLit);letter-spacing:2px">★'.repeat(1) +
      '</div><div class="mute tiny b mt4">' + p.stars + " ★ → " + p.nextStars + " ★</div></div>" +
    '<div class="notice" style="border-left-color:#B15CF6">' + esc(p.gain) +
      ' — base permanente ' + p.baseNow + "% → <b>" + p.baseAfter + "%</b></div>" +
    /* Section 3 defines the first star and nothing beyond it, so the multiplier
       holds rather than being invented. That leaves a trap: a second Ascension
       would wipe everything and grant no extra power. Say so plainly instead of
       letting the player find out afterwards. */
    (p.baseAfter === p.baseNow
      ? '<div class="notice mt6" style="border-left-color:var(--red);color:var(--redLit)">' +
        "Aucun gain de puissance supplémentaire n'est défini au-delà de la première " +
        "étoile. Cette Ascension réinitialiserait tout sans rien ajouter.</div>"
      : "") +
    '<div class="sect" style="margin:12px 0 6px">Réinitialisé</div>' +
    p.reset.map((r) => line("cross", "var(--redLit)", r[0], r[1])).join("") +
    '<div class="sect" style="margin:12px 0 6px">Conservé</div>' +
    p.keep.map((r) => line("check", "var(--greenLit)", r[0], r[1])).join("") +
    '<div class="notice center mt10 tiny b" style="color:var(--redLit);border-left-color:var(--red)">' +
      "Cette action est définitive.</div>" +
    '<div class="col gap6 mt10">' +
      btn(ic("star", 14) + "Confirmer l'Ascension", { cls: "purple", act: "ascendDo", arg: sys }) +
      btn("Annuler", { cls: "dark", small: true, act: "closeModal" }) + "</div>",
    "Ascension " + p.label);
}

function showHarvestModal() {
  openModal(harvestModalHTML(), "Récolte automatique");
  const ov = document.getElementById("overlay");
  if (ov) ov.setAttribute("data-modal", "harvest");
}

/* The upgrade sheet answers "what does this buy me?" before it asks for the
   gold. The rarity table used to sit permanently on the home panel, where it
   was reference material nobody reads twice; here it is the whole point --
   current rates against the ones the next level unlocks. The confirm at the
   foot is the only place the upgrade actually fires. */
function showForgeUpgrade() {
  const lv = S.forge.level;
  const atMax = lv >= RULES.FORGE_MAX;
  const cost = forgeUpgCostFor(S);
  const time = forgeUpgTimeFor(S);
  const goldOk = S.gold >= cost;
  const busy = S.forge.upgradeEnd > Date.now();
  const cut = Math.min(FORGE_COST_CUT_CAP, Math.abs(treeSum(S, "forgeCost")));
  const cur = gateForgeRates(getRates("forge", lv, S.ascension, starsOf(S, "forge")), lv);
  const nxt = atMax ? null
    : gateForgeRates(getRates("forge", lv + 1, S.ascension, starsOf(S, "forge")), lv + 1);

  let action, note = "";
  if (atMax) {
    action = btn("Forge au niveau maximum", { cls: "ghost", small: true, dis: true });
  } else if (busy) {
    action = btn(ic("clock", 13) + "Amélioration en cours", { cls: "ghost", small: true, dis: true });
    note = "Termine ou accélère l'amélioration en cours depuis l'Accueil.";
  } else if (!goldOk) {
    action = btn(ic("hammer", 13) + "Améliorer · " + fmt(cost) + " Or", { small: true, dis: true });
    note = "Il te manque " + fmt(cost - S.gold) + " Or — tente le Raid Or.";
  } else {
    action = btn(ic("hammer", 14) + "Améliorer · " + fmt(cost) + " Or",
      { cls: "green", small: true, act: "forgeUpgrade" });
  }

  openModal(
    '<div class="center" style="margin-bottom:6px">' + ic("hammer", 28) + "</div>" +
    '<div class="modalT center" style="color:var(--goldLit)">NIV.' + lv +
      (atMax ? "" : ' <span style="color:var(--textMute)">→</span> NIV.' + (lv + 1)) + "</div>" +
    '<div class="dim tiny center" style="margin:3px 0 7px">' +
      (atMax ? "La Forge ne peut plus progresser."
        : "Chaque niveau améliore les taux de rareté de tout ce que tu forges.") + "</div>" +

    (atMax ? "" :
      '<div class="mute tiny b center" style="letter-spacing:.5px;margin-bottom:2px">CE QUE CE NIVEAU CHANGE</div>' +
      ratesTable(cur, nxt, "Niv." + lv, "Niv." + (lv + 1), EQUIP_RARITY_ORDER)) +

    '<div class="card mt6" style="padding:7px 9px">' +
      (atMax ? "" :
        '<div class="kv"><span class="dim">Coût</span><b class="row gap4" style="color:' +
          (goldOk ? "var(--goldLit)" : "var(--textMute)") + '">' + ic("gold", 12) + fmt(cost) + "</b></div>" +
        (cut > 0 ? '<div class="kv"><span class="dim">Réduction de l\'Arbre</span><b style="color:var(--greenLit)">−' +
          cut + "%</b></div>" : "") +
        '<div class="kv"><span class="dim">Durée</span><b class="row gap4">' + ic("clock", 12) +
          (time <= 0 ? "Instantané" : fmtTime(time)) + "</b></div>") +
    "</div>" +

    '<div class="mt8">' + action + "</div>" +
    (note ? '<div class="mute tiny center mt6" style="line-height:1.45">' + note + "</div>" : "") +
    '<div class="mt6">' + btn("Fermer", { cls: "ghost", small: true, act: "closeModal" }) + "</div>",
    "Améliorer la Forge");
}
/* ---------------- HUD ---------------- */
function renderHUD() {
  const hud = document.getElementById("hud");
  const need = expToNext(S.level);
  hud.innerHTML =
    '<div class="pbox" data-act="go" data-arg="heros" title="Héros · Points de statistiques">' +
      '<div class="avatar"><img src="' + ASSETS.hero + '"></div>' +
      '<div class="flex1" style="margin-left:8px">' +
        '<div class="row gap6"><span class="pname flex1">' + esc(S.playerName) + "</span>" +
          '<span class="power">' + ic("swords", 11) + fmt(S.power) + "</span>" +
          (S.statPoints > 0 ? '<span class="dot" style="position:static;flex:0 0 auto" title="Points de statistiques disponibles"></span>' : "") + "</div>" +
        '<div class="pbar mt6">' +
          '<span class="cap" style="background:linear-gradient(180deg,#B884FF,#7A34DC);' +
            'font-weight:900;font-size:12px;color:#fff;text-shadow:0 1px 2px #0008">' + S.level + "</span>" +
          '<span class="trk"><i style="width:' + Math.max(0, Math.min(100, (S.exp / need) * 100)) +
            '%;background:linear-gradient(180deg,#C79BFF,#7A34DC)"></i>' +
          "<span>" + fmt(S.exp) + " / " + fmt(need) + "</span></span></div>" +
      "</div></div>" +
    '<div class="col gap6" style="align-items:flex-end">' +
      '<div class="row gap4">' +
        '<div class="curr" data-act="resInfo" data-arg="gold" style="cursor:pointer">' + ic("gold", 15) + "<b>" + fmt(S.gold) + "</b>" +
          '<span class="plus" data-act="go" data-arg="raid">' + ic("plus", 10) + "</span></div>" +
        '<div class="curr" data-act="resInfo" data-arg="gems" style="cursor:pointer">' + ic("gem", 15) + "<b>" + fmt(S.gems) + "</b>" +
          '<span class="plus" data-act="go" data-arg="boutique">' + ic("plus", 10) + "</span></div>" +
      "</div>" +
      '<div class="row gap4">' +
        '<div class="curr" data-act="resInfo" data-arg="minerai" style="cursor:pointer">' + ic("minerai", 15) + "<b>" + fmt(S.minerai) + "</b>" +
          '<span class="plus" data-act="go" data-arg="accueil">' + ic("plus", 10) + "</span></div>" +
        '<div class="hudBtn' + (harvestNotify(S) ? " ready" : "") + '" data-act="harvest" title="Récolte automatique">' +
          ic("moon", 14) + (harvestNotify(S) ? '<span class="dot"></span>' : "") + "</div>" +
        '<div class="hudBtn" data-act="go" data-arg="chat" title="Chat Monde &amp; Clan">' + ic("chat", 14) + "</div>" +
        '<div class="menuBtn" data-act="go" data-arg="parametres">' + ic("menu", 15) + "</div>" +
      "</div>" +
    "</div>";
}

/* ---------------- tabs ---------------- */
function renderTabs() {
  const el = document.getElementById("tabs");
  const active = TAB_IDS.includes(route) ? route : null;
  el.innerHTML = TABS.map((t) => {
    let badge = false;
    if (t.id === "developpement") badge = S.eclat >= skillSummonCost(S) || (!S.tree.active && TREE_NODES.some((n) => treeCanBuy(S, n)));
    if (t.id === "equipement") badge = S.inventory.length > 0 || S.statPoints > 0;
    if (t.id === "accueil") badge = false;
    return '<div class="tab' + (active === t.id ? " on" : "") + '" data-act="go" data-arg="' + t.id + '">' +
      ic(t.icon, 21) + "<span>" + t.label + "</span>" +
      (badge ? '<div class="dot"></div>' : "") + "</div>";
  }).join("");
}
