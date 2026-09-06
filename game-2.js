/* =========================================================================
   ENGINE — port of GameContext.tsx
   ========================================================================= */
const SAVE_KEY = "shadowreach.save.local";
// Build id is deliberately independent from SAVE_VERSION: changing the web build
// must never migrate or erase the player's local progression.
const APP_BUILD = document.querySelector('meta[name="shadowreach-build"]')?.content || "2026.09.06.20";
let freshnessCheckBusy = false;
let lastFreshnessCheck = 0;

function remoteBuildFromHTML(html) {
  const m = String(html || "").match(/<meta\s+name=["']shadowreach-build["']\s+content=["']([^"']+)["']/i)
    || String(html || "").match(/<meta\s+content=["']([^"']+)["']\s+name=["']shadowreach-build["']/i);
  return m ? m[1] : "";
}
function cacheBustedGameURL(build) {
  const u = new URL(location.href);
  u.searchParams.delete("__sr_probe");
  u.searchParams.set("v", build || Date.now().toString());
  return u.toString();
}
async function checkForFreshBuild(force) {
  if (SMOKE || freshnessCheckBusy) return false;
  const now = Date.now();
  if (!force && now - lastFreshnessCheck < 15000) return false;
  lastFreshnessCheck = now; freshnessCheckBusy = true;
  try {
    const probe = new URL(location.href);
    probe.searchParams.set("__sr_probe", String(now));
    const res = await fetch(probe.toString(), { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) return false;
    const remote = remoteBuildFromHTML(await res.text());
    if (remote && remote !== APP_BUILD) {
      saveNow();
      location.replace(cacheBustedGameURL(remote));
      return true;
    }
  } catch (e) {
    // Offline play remains available. A failed version probe must never block boot.
    console.warn("version check failed", e);
  } finally { freshnessCheckBusy = false; }
  return false;
}
function forceFreshReload() {
  saveNow();
  location.replace(cacheBustedGameURL(Date.now().toString()));
}


let S = defaultState("Héros");      // player state
let D = computeDerived(S);          // derived stats
let combat = null;                  // active Combat
let rewardAcc = { gold: 0, exp: 0 };
// Sommes RÉELLEMENT créditées pendant l'étage courant. Contrairement à rewardAcc
// (qui contient des récompenses brutes en attente), ce compteur survit aux flush de
// 500 ms afin que la notification de fin d'étage puisse afficher 100 % du gain.
let floorRewardPaid = { floor: null, gold: 0, exp: 0 };
let dirty = false;
let offlineRecap = null;

/* -------- state mutation -------- */
function update(fn) {
  const beforePower = Number(S.power || computePower(S) || 0);
  fn(S);
  S.power = computePower(S);
  D = computeDerived(S);
  const delta = Math.round(S.power - beforePower);
  if (delta) queuePowerDelta(delta);
  dirty = true;
  scheduleRender();
}
function refreshDerived() { D = computeDerived(S); }

/* -------- persistence -------- */
/* The regression harness runs the game in an iframe with ?smoke=1. It must
   start from the same state every time and must never touch a real save, so in
   that mode the game neither reads nor writes localStorage. Without this a run
   inherits whatever the browser happens to hold -- and a hand-edited save could
   make every combat check fail for reasons that have nothing to do with the
   code being tested. */
const SMOKE = /[?&]smoke=1(?:&|$)/.test(location.search);
function saveNow() {
  if (SMOKE) { dirty = false; return; }
  try {
    S.lastSeen = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
    dirty = false;
  } catch (e) { console.warn("save failed", e); }
}
function loadSave() {
  if (SMOKE) return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw), "Héros");
  } catch (e) { return null; }
}

/* -------- daily reset & offline -------- */
function applyDailyReset(s) {
  const t = todayStr();
  if (s.lastKeyReset !== t) {
    RAID_IDS.forEach((r) => {
      // tree-granted keys raise both the daily refill and the cap for that raid
      const bonus = (s.raidKeyAlloc || {})[r] || 0;
      s.raids[r].keys = Math.min(RULES.RAID_KEY_CAP + bonus,
        s.raids[r].keys + RULES.RAID_FREE_KEYS + bonus);
    });
    s.adKeysToday = 0;
    s.lastKeyReset = t;
  }
  if (s.eventDay !== t) { s.eventDay = t; s.eventClaims = {}; s.eventProgress = {}; }
  return s;
}
function applyOffline(s) {
  const now = Date.now();
  let elapsed = (now - (s.lastSeen || now)) / 1000;
  // a device clock moved backwards must never produce anything, and the
  // Autonomie cap means a clock moved forwards can at most fill the reserve
  // once -- there is no backend here to verify elapsed time against
  if (!isFinite(elapsed) || elapsed < 0) elapsed = 0;
  harvestAdvance(s, elapsed);
  s.lastSeen = now;
  return s;
}
function grantLevels(s) {
  while (s.level < RULES.MAX_LEVEL && s.exp >= expToNext(s.level)) {
    s.exp -= expToNext(s.level);
    s.level += 1;
    s.statPoints += RULES.STAT_POINTS_PER_LEVEL;
  }
  if (s.level >= RULES.MAX_LEVEL) { s.exp = 0; s.ascensionAvailable = true; }
  return s;
}

/* -------- enemy / wave construction -------- */
/* ---- elite abilities ------------------------------------------------------
   One per elite, taken from what its artwork already shows: the Chevalier has a
   shield, the Bete de Guerre is soaked in blood, the Seigneur burns. Each hooks
   the combat at one of four points and nowhere else, so an ability can never
   half-apply:

     tick(c, e, dt)          once a frame, for timers and thresholds
     filter(c, e, dmg, src, crit)  incoming damage, before it lands
     onLand(c, e)            when this enemy lands a blow on the hero
     state(e)                the one word shown under its name

   `src` is "weapon", "skill" or "dot", so a shield can stop steel and let
   sorcery through. Unimplemented ids simply resolve to nothing.
   -------------------------------------------------------------------------- */
const ELITE_ABIL = {
  // the spiked shield in the art, raised on a cycle
  garde: {
    label: "Garde", c: "#CFE0FF",
    tick(c, e, dt) {
      e.abilCd = (e.abilCd == null ? 1.5 : e.abilCd) - dt;
      if (e.abilCd <= 0) { e.abilCd = 11; e.guard = 5; addBurst(c, "hit", e.x, "#CFE0FF"); }
      if (e.guard > 0) e.guard = Math.max(0, e.guard - dt);
    },
    filter(c, e, dmg, src) {
      // steel stops on the shield; a spell goes around it
      return (e.guard > 0 && src === "weapon") ? Math.max(1, Math.floor(dmg * 0.2)) : dmg;
    },
    state(e) { return e.guard > 0 ? "GARDE" : ""; },
  },
  // blood-soaked, twin-axed: it gets worse as it dies
  furie: {
    label: "Furie", c: "#FF5A5A",
    tick(c, e) {
      if (!e.frenzy && e.hp <= e.maxHP * 0.4) { e.frenzy = true; addShake(c, 4); }
    },
    state(e) { return e.frenzy ? "FURIE" : ""; },
  },
  // spirit skulls circling his staff: they keep him standing until you cut them
  esprits: {
    label: "Esprits", c: "#7ED321",
    tick(c, e, dt, now) {
      const mine = c.enemies.filter((x) => x.alive && x.minionOf === e.id);
      // they pour life back into him for as long as one of them lives
      if (mine.length) {
        e._heal = (e._heal || 0) + dt;
        if (e._heal >= 1) {
          e._heal = 0;
          const h = Math.max(1, Math.floor(e.maxHP * 0.02 * mine.length));
          e.hp = Math.min(e.maxHP, e.hp + h);
          c.floats.push({ id: rid(), x: e.x, val: h, crit: false, color: "#7ED321", born: now, heal: true });
        }
      }
      e.abilCd = (e.abilCd == null ? 1.2 : e.abilCd) - dt;
      if (e.abilCd > 0 || mine.length >= 2) return;
      e.abilCd = 10;
      // summoning stops once he is nearly down, so a fight always terminates
      if (e.hp <= e.maxHP * 0.25) return;
      for (let k = mine.length; k < 2; k++) {
        c.enemies.push(spawnMinion(c, e, "Esprit", 0.10, 0.35, "#7ED321", 34 + k * 30));
      }
      addBurst(c, "hit", e.x, "#7ED321");
    },
    state(e) { return "ESPRITS"; },
  },
  // the four void orbs in the art are targets in their own right
  orbes: {
    label: "Orbes", c: "#B15CF6",
    tick(c, e, dt) {
      if (!e._orbs) {
        e._orbs = true;
        for (let k = 0; k < 4; k++) c.enemies.push(spawnMinion(c, e, "Orbe", 0.06, 0, "#B15CF6", 26 + k * 24));
      }
    },
    filter(c, e, dmg) {
      const left = c.enemies.filter((x) => x.alive && x.minionOf === e.id).length;
      return left ? Math.max(1, Math.floor(dmg * 0.4)) : dmg;
    },
    state(e) {
      const left = combat ? combat.enemies.filter((x) => x.alive && x.minionOf === e.id).length : 0;
      return left ? "ORBES " + left : "";
    },
  },
  // moss-covered stone shot through with blue crystal: it hardens, then returns
  // everything it swallowed on its next swing
  cristal: {
    label: "Cristallisation", c: "#3FA7FF",
    tick(c, e, dt) {
      e.abilCd = (e.abilCd == null ? 1.8 : e.abilCd) - dt;
      if (e.abilCd <= 0) { e.abilCd = 13; e.crystal = 4; addBurst(c, "hit", e.x, "#3FA7FF"); }
      if (e.crystal > 0) e.crystal = Math.max(0, e.crystal - dt);
    },
    filter(c, e, dmg) {
      if (e.crystal <= 0) return dmg;
      // swallowed, not avoided -- it comes back
      e.stored = (e.stored || 0) + dmg;
      c.floats.push({ id: rid(), x: e.x, val: dmg, crit: false, color: "#3FA7FF", born: Date.now(), blocked: true });
      return 0;
    },
    onLand(c, e) {
      if (!e.stored) return;
      // capped, so a long channel into the crystal cannot one-shot the hero
      const back = Math.min(Math.floor(c.heroMaxHP * 0.30), Math.floor(e.stored * 0.6));
      e.stored = 0;
      c.heroHP -= back;
      addShake(c, 6);
      c.floats.push({ id: rid(), x: c.heroX, val: back, crit: true, color: "#3FA7FF", born: Date.now() });
      if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
    },
    state(e) { return e.crystal > 0 ? "CRISTAL" : (e.stored ? "CHARGÉ" : ""); },
  },
  // crystal spikes erupting from its hide: crit it and they come back at you
  eclats: {
    label: "Éclats", c: "#B15CF6",
    tick(c, e, dt) { if (e.shardCd > 0) e.shardCd = Math.max(0, e.shardCd - dt); },
    filter(c, e, dmg, src, crit) {
      if (!crit || e.shardCd > 0 || !e.alive) return dmg;
      e.shardCd = 3;                       // so a high-crit build is not simply deleted
      const each = Math.max(1, Math.floor(c.heroMaxHP * 0.04));
      for (let k = 0; k < 3; k++) {
        c.projs.push({ id: rid(), x: e.x - 10, toX: c.heroX, color: "#B15CF6", kind: "magic", life: 0.35 });
        scheduleHit(c, 0.15 + k * 0.09, () => {
          if (c.status !== "fight") return;
          c.heroHP -= each;
          c.heroHit = 0.2;
          c.floats.push({ id: rid(), x: c.heroX, val: each, crit: false, color: "#B15CF6", born: Date.now() });
          if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        });
      }
      return dmg;
    },
    state(e) { return e.shardCd > 0 ? "ÉCLATS" : ""; },
  },
  // hooded, mid-lunge, wrapped in shadow flame: it disappears and comes back on you
  ombre: {
    label: "Pas d'ombre", c: "#B15CF6",
    tick(c, e, dt) {
      e.abilCd = (e.abilCd == null ? 2 : e.abilCd) - dt;
      if (e.abilCd <= 0 && !(e.vanish > 0)) {
        e.abilCd = 12; e.vanish = 1.5;
        addBurst(c, "hit", e.x, "#B15CF6");
      }
      if (e.vanish > 0) {
        e.vanish = Math.max(0, e.vanish - dt);
        if (e.vanish === 0) {
          // reappears on top of the hero, whatever the range was
          e.x = c.heroX + 40;
          e.nextCrit = true;
          e.atkCd = 0.15;
          addBurst(c, "crit", e.x, "#B15CF6");
          addShake(c, 4);
        }
      }
    },
    filter(c, e, dmg) { return e.vanish > 0 ? 0 : dmg; },
    state(e) { return e.vanish > 0 ? "OMBRE" : (e.nextCrit ? "EMBUSCADE" : ""); },
  },
  // lava armour, flaming greatsword: every blow leaves an ember
  /* ---------------- floor bosses: two mechanics each ----------------
     Bosses carry a list, so every one of these keeps its own cooldown field.
     Never reuse `abilCd` here -- that belongs to the elites, which only ever
     have one ability and would otherwise fight themselves for it. */

  // Chef Gobelin -- twin bloodied cleavers, bone armour, a chieftain's
  // war-feathers and trophy skulls. He fights with both blades, and a chieftain
  // does not fight alone. First boss of the climb, so these teach the idea:
  // something is winding up, and adds have to be dealt with.
  tranchant: {
    label: "Double tranchant", c: "#FF7A3D",
    tick(c, e, dt) {
      if (e.flurry > 0) e.flurry = Math.max(0, e.flurry - dt);
      e.flurryCd = (e.flurryCd == null ? 2.5 : e.flurryCd) - dt;
      if (e.flurryCd > 0) return;
      e.flurryCd = 9; e.flurry = 1.8;
      addBurst(c, "crit", e.x, "#FF7A3D");
      addShake(c, 4);
    },
    state(e) { return e.flurry > 0 ? "DOUBLE TRANCHANT" : ""; },
  },
  saignee: {
    label: "Saignée", c: "#FF5A5A",
    /* Both cleavers come away bloody in the art, and calling a warband made him
       read as a second Ogre Brute -- the Ogre already throws goblins. This is
       his own idea instead: every blow that lands opens another wound, and each
       wound makes the next blow bite deeper. Stop being hit for six seconds and
       they close. Distinct from the Seigneur's Braise, which ticks damage on a
       timer and is cleared by healing; these do no damage of their own, they
       just make his cleavers worse. */
    tick(c, e, dt) {
      if (!(e.bleedT > 0)) return;
      e.bleedT -= dt;
      if (e.bleedT <= 0) { e.bleedT = 0; e.bleed = 0; }
    },
    outgoing(c, e, dmg) { return Math.floor(dmg * (1 + 0.06 * (e.bleed || 0))); },
    onLand(c, e) {
      e.bleed = Math.min(5, (e.bleed || 0) + 1);
      e.bleedT = 6;
      c.floats.push({ id: rid(), x: c.heroX, val: 0, crit: false, color: "#FF5A5A",
        born: Date.now(), text: "SAIGNÉE ×" + e.bleed });
    },
    state(e) { return e.bleed ? "SAIGNÉE ×" + e.bleed : ""; },
  },

  // Ogre Brute -- a wall of muscle. He stamps you off your feet and throws a
  // goblin after you, and when he is nearly done he stops defending himself.
  pietinement: {
    label: "Piétinement", c: "#E8B44A",
    tick(c, e, dt) {
      // The first stomp lands half a second in, so the goblin is on the field
      // before the hero has closed the distance -- the fight opens on the
      // ogre's terms. Every stomp after that is on the usual 12 s cycle.
      e.stompCd = (e.stompCd == null ? 0.5 : e.stompCd) - dt;
      if (e.stompCd > 0) return;
      e.stompCd = 12;
      addShake(c, 9);
      addBurst(c, "crit", c.heroX, "#E8B44A");
      const hit = Math.max(1, Math.floor(c.heroMaxHP * 0.08));
      c.heroHP -= hit;
      c.floats.push({ id: rid(), x: c.heroX, val: hit, crit: true, color: "#E8B44A", born: Date.now() });
      // knocked back to the edge: melee has to walk the whole way in again,
      // which is the point -- a bow keeps firing, a dagger does not
      c.heroX = 24;
      if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; return; }
      const g = spawnMinion(c, e, "Gobelin", 0.10, 0.45, "#7ED321", 0, typeById("goblin"));
      g.small = false;
      g.x = Math.min(AW - 24, c.heroX + 90);      // thrown after him, not at the ogre
      c.enemies.push(g);
    },
    state(e) { return ""; },
  },
  dernierSouffle: {
    label: "Dernier souffle", c: "#FF5A5A",
    tick(c, e) {
      if (!e.lastBreath && e.hp <= e.maxHP * 0.25) {
        e.lastBreath = true;
        addShake(c, 6);
        addBurst(c, "crit", e.x, "#FF5A5A");
      }
    },
    outgoing(c, e, dmg) { return e.lastBreath ? dmg * 2 : dmg; },
    state(e) { return e.lastBreath ? "DERNIER SOUFFLE" : ""; },
  },

  // Squelette Geant -- a dead thing that should not be able to hold magic at
  // all, so it takes yours. Punishes casting a buff on cooldown, and punishes
  // stacking raw damage into a body made of bone spurs.
  absorption: {
    label: "Absorption", c: "#B15CF6",
    tick(c, e, dt) {
      if (e.stealCd > 0) e.stealCd = Math.max(0, e.stealCd - dt);
      if (e.stolen && Date.now() >= e.stolen.until) e.stolen = null;
    },
    filter(c, e, dmg) {
      // your Rempart, worn by him
      return (e.stolen && e.stolen.key === "rempart")
        ? Math.max(1, Math.floor(dmg * (1 - e.stolen.value / 100))) : dmg;
    },
    outgoing(c, e, dmg) {
      // your Force, swung at you
      return (e.stolen && e.stolen.key === "force")
        ? Math.floor(dmg * (1 + e.stolen.value / 100)) : dmg;
    },
    state(e) { return e.stolen ? "VOLÉ · " + e.stolen.label : ""; },
  },
  epines: {
    label: "Peau d'épines", c: "#CFE0FF",
    /* Physical blows only -- a skill or a damage-over-time passes straight
       through the spurs. And the critical part of a hit is not reflected: the
       spurs answer the swing, not how well it landed, so a crit is divided back
       down to what it would have been without one before the 5% is taken.
       Otherwise a crit build punished itself twice over. */
    filter(c, e, dmg, src, crit) {
      if (dmg <= 0 || src !== "weapon") return dmg;
      const mult = (D && D.critMult) || BASE.critMult;
      const physical = crit && mult > 1 ? dmg / mult : dmg;
      const back = Math.max(1, Math.floor(physical * 0.05));
      c.heroHP -= back;
      c.floats.push({ id: rid(), x: c.heroX, val: back, crit: false, color: "#CFE0FF", born: Date.now() });
      if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
      return dmg;
    },
    state(e) { return "ÉPINES"; },
  },

  // Golem de Fer -- it does not chase you, it makes standing near it expensive
  // and then drags you there anyway. The two are built to combine.
  zoneBrulante: {
    label: "Zone brûlante", c: "#FF7A3D",
    tick(c, e, dt) {
      if (e.x - c.heroX > 62) { e._zone = 0; return; }
      e._zone = (e._zone || 0) + dt;
      if (e._zone < 1) return;
      e._zone = 0;
      const b = Math.max(1, Math.floor(c.heroMaxHP * 0.02));
      c.heroHP -= b;
      c.floats.push({ id: rid(), x: c.heroX, val: b, crit: false, color: "#FF7A3D", born: Date.now() });
      if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
    },
    state(e) { return combat && e.x - combat.heroX <= 62 ? "ZONE" : ""; },
  },
  bouclier: {
    label: "Bouclier", c: "#8FEFF4",
    tick(c, e, dt) {
      if (e.shieldWind > 0) {
        e.shieldWind = Math.max(0, e.shieldWind - dt);
        if (e.shieldWind === 0) {
          e.shield = e.maxHP; e.shieldT = 8;
          addBurst(c, "crit", e.x, "#8FEFF4");
          addShake(c, 7);
        }
        return;
      }
      if (e.shield > 0) {
        // and it reels you in, onto the burning ground it is standing on
        c.heroX = Math.min(e.x - 30, c.heroX + 52 * dt);
        /* The shield has to end on its own as well as by breaking. Held open
           until broken, it pinned the hero in the burning zone for fifty
           seconds, and since that zone costs a share of his own maximum health,
           no amount of gear could out-scale it -- measured, floor 140 went from
           a 30.8s win to a loss at x1, x1.2 and x1.5 gear alike. Eight seconds
           makes it a phase: break it early and you stop burning early. */
        e.shieldT = Math.max(0, (e.shieldT == null ? 8 : e.shieldT) - dt);
        if (e.shieldT === 0) { e.shield = 0; e.shieldT = null; addBurst(c, "hit", e.x, "#8FEFF4"); }
        return;
      }
      e.shieldCd = (e.shieldCd == null ? 2 : e.shieldCd) - dt;
      if (e.shieldCd <= 0) { e.shieldCd = 26; e.shieldWind = 2; addBurst(c, "hit", e.x, "#8FEFF4"); }
    },
    filter(c, e, dmg) {
      if (!(e.shield > 0)) return dmg;
      const a = Math.min(e.shield, dmg);
      e.shield -= a;
      c.floats.push({ id: rid(), x: e.x, val: a, crit: false, color: "#8FEFF4", born: Date.now(), blocked: true });
      if (e.shield <= 0) { e.shield = 0; e.shieldT = null; addBurst(c, "death", e.x, "#8FEFF4"); }
      return dmg - a;
    },
    state(e) { return e.shieldWind > 0 ? "BOUCLIER…" : e.shield > 0 ? "BOUCLIER" : ""; },
  },

  // Dragon des Cendres -- the last of the five. A wind-up you must answer, a
  // phase that shuts melee out entirely, and a standing tax on your damage.
  souffle: {
    label: "Souffle balayant", c: "#FF7A3D",
    tick(c, e, dt) {
      if (e.breathWind > 0) {
        e.breathWind = Math.max(0, e.breathWind - dt);
        if (e.breathWind > 0) return;
        // two seconds of warning, then 40% of the hero's maximum, less whatever
        // he put up in the meantime -- Rempart or a heal is the answer
        const raw = Math.floor(c.heroMaxHP * 0.4);
        const d = Math.max(1, Math.floor(raw * (1 - heroDmgRed(c) / 100)));
        c.heroHP -= d;
        c.heroHit = 0.3;
        addShake(c, 11);
        addBurst(c, "crit", c.heroX, "#FF7A3D");
        c.floats.push({ id: rid(), x: c.heroX, val: d, crit: true, color: "#FF7A3D", born: Date.now() });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        return;
      }
      e.breathCd = (e.breathCd == null ? 4 : e.breathCd) - dt;
      if (e.breathCd <= 0) {
        e.breathCd = 17; e.breathWind = 2;
        addBurst(c, "hit", e.x, "#FF7A3D");
        addShake(c, 4);
      }
    },
    state(e) { return e.breathWind > 0 ? "SOUFFLE…" : ""; },
  },
  envol: {
    label: "Envol", c: "#B15CF6",
    tick(c, e, dt) {
      if (e.flying > 0) {
        e.flying = Math.max(0, e.flying - dt);
        if (e.flying === 0) { addBurst(c, "hit", e.x, "#B15CF6"); addShake(c, 5); return; }
        e._fb = (e._fb || 0) + dt;
        if (e._fb < 0.85) return;
        e._fb = 0;
        c.projs.push({ id: rid(), x: e.x - 10, toX: c.heroX, color: "#FF7A3D", kind: "magic", life: 0.35 });
        const d = Math.max(1, Math.floor(e.dmg * 0.8 * (1 - heroDmgRed(c) / 100)));
        scheduleHit(c, HIT_DELAY_RANGED, () => {
          if (c.status !== "fight") return;
          c.heroHP -= d;
          c.heroHit = 0.22;
          c.floats.push({ id: rid(), x: c.heroX, val: d, crit: false, color: "#FF7A3D", born: Date.now() });
          if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        });
        return;
      }
      e.flyCd = (e.flyCd == null ? 7 : e.flyCd) - dt;
      if (e.flyCd <= 0) {
        e.flyCd = 21; e.flying = 4;
        addBurst(c, "hit", e.x, "#B15CF6");
        addShake(c, 5);
      }
    },
    filter(c, e, dmg, src) {
      if (!(e.flying > 0)) return dmg;
      // Ranged weapons and skills keep full damage. Melee can still clip the Dragon
      // during Envol, but at only 30%, so the phase remains a meaningful disadvantage
      // without turning a melee build completely off for four seconds.
      if (src !== "weapon" || RANGED_IDS.indexOf(D.weapon) >= 0) return dmg;
      const glancing = Math.max(1, Math.floor(dmg * 0.30));
      c.floats.push({ id: rid(), x: e.x, val: glancing, crit: false, color: "#B15CF6",
        born: Date.now(), text: "ENVOL · 30%" });
      return glancing;
    },
    state(e) { return e.flying > 0 ? "ENVOL" : ""; },
  },
  intimidation: {
    label: "Intimidation", c: "#FF5A5A",
    tick(c, e, dt) {
      e.intimCd = (e.intimCd == null ? 3 : e.intimCd) - dt;
      if (e.intimCd > 0) return;
      e.intimCd = 18;
      fxAdd(c, "debuffs", { key: "intimide", value: 25, label: "Intimidation", dur: 8 }, Date.now());
      addBurst(c, "crit", c.heroX, "#FF5A5A");
      addShake(c, 5);
    },
    state(e) { return combat && fxVal(combat, "debuffs", "intimide") ? "INTIMIDATION" : ""; },
  },

  /* ---------------- raid bosses: three mechanics each ---------------- */

  // Titan des Abysses -- a mountain of dark stone veined with living blue
  // crystal, gold-banded and rune-marked. Plated, self-repairing, and it hits
  // the ground rather than you.
  carapace: {
    label: "Carapace de minerai", c: "#3FA7FF",
    tick(c, e, dt) {
      if (e.armor == null) e.armor = Math.floor(e.maxHP * 0.6);
      if (e.stagger > 0) e.stagger = Math.max(0, e.stagger - dt);
    },
    filter(c, e, dmg) {
      if (!(e.armor > 0)) return dmg;
      const through = Math.max(1, Math.floor(dmg * 0.3));
      const soaked = dmg - through;
      e.armor -= soaked;
      if (soaked > 0) {
        c.floats.push({ id: rid(), x: e.x, val: soaked, crit: false, color: "#3FA7FF",
          born: Date.now(), blocked: true });
      }
      // the plating comes off all at once, and it is reeling when it does
      if (e.armor <= 0) {
        e.armor = 0; e.stagger = 3;
        addBurst(c, "death", e.x, "#3FA7FF");
        addShake(c, 8);
      }
      return through;
    },
    state(e) { return e.stagger > 0 ? "BRISÉ" : e.armor > 0 ? "CARAPACE" : ""; },
  },
  regenCristal: {
    label: "Régénération cristalline", c: "#8FEFF4",
    tick(c, e, dt) {
      e.noHit = (e.noHit || 0) + dt;
      if (e.noHit < 2) return;               // only regrows in the quiet
      e._rg = (e._rg || 0) + dt;
      if (e._rg < 1) return;
      e._rg = 0;
      const h = Math.max(1, Math.floor(e.maxHP * 0.025));
      e.hp = Math.min(e.maxHP, e.hp + h);
      c.floats.push({ id: rid(), x: e.x, val: h, crit: false, color: "#8FEFF4",
        born: Date.now(), heal: true });
    },
    filter(c, e, dmg) { e.noHit = 0; return dmg; },
    state(e) { return (e.noHit || 0) >= 2 ? "RÉGÉNÈRE" : ""; },
  },
  sismique: {
    label: "Onde sismique", c: "#E8B44A",
    // Once per fight, and only when it is hurt: the Titan puts both fists
    // through the floor below 40% health. Two seconds of warning, then the hero
    // is thrown to the edge and left flat on his back.
    tick(c, e, dt) {
      if (e.quakeWind > 0) {
        e.quakeWind = Math.max(0, e.quakeWind - dt);
        if (e.quakeWind > 0) return;
        const d = Math.max(1, Math.floor(c.heroMaxHP * 0.25 * (1 - heroDmgRed(c) / 100)));
        c.heroHP -= d;
        c.heroHit = 0.3;
        c.heroX = 24;
        c.heroStun = 2;
        addShake(c, 14);
        addBurst(c, "crit", c.heroX, "#E8B44A");
        c.floats.push({ id: rid(), x: c.heroX, val: d, crit: true, color: "#E8B44A", born: Date.now() });
        c.floats.push({ id: rid(), x: c.heroX, val: 0, crit: false, color: "#E8B44A",
          born: Date.now() + 1, text: "ÉTOURDI" });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        return;
      }
      if (e.quaked || e.hp > e.maxHP * 0.4) return;
      e.quaked = true; e.quakeWind = 2;
      addBurst(c, "hit", e.x, "#E8B44A");
      addShake(c, 5);
    },
    state(e) {
      return e.quakeWind > 0 ? "SÉISME…" : combat && combat.heroStun > 0 ? "ÉTOURDI" : "";
    },
  },

  // Dragon Ancestral -- purple and molten gold, caught mid-breath. It burns you
  // in a sustained stream, beats you back with its wings, and being the boss of
  // the gold raid, it takes what you came for.
  souffleLave: {
    label: "Souffle de lave", c: "#FF7A3D",
    tick(c, e, dt) {
      if (e.channel > 0) {
        e.channel = Math.max(0, e.channel - dt);
        e._ch = (e._ch || 0) + dt;
        if (e._ch < 0.5) return;
        e._ch = 0;
        const d = Math.max(1, Math.floor(c.heroMaxHP * 0.07 * (1 - heroDmgRed(c) / 100)));
        c.heroHP -= d;
        c.heroHit = 0.2;
        c.projs.push({ id: rid(), x: e.x - 10, toX: c.heroX, color: "#FF7A3D", kind: "magic", life: 0.3 });
        c.floats.push({ id: rid(), x: c.heroX, val: d, crit: false, color: "#FF7A3D", born: Date.now() });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        return;
      }
      e.chanCd = (e.chanCd == null ? 1.5 : e.chanCd) - dt;
      if (e.chanCd <= 0) {
        e.chanCd = 16; e.channel = 3;
        addBurst(c, "hit", e.x, "#FF7A3D");
      }
    },
    state(e) { return e.channel > 0 ? "SOUFFLE" : ""; },
  },
  fee: {
    label: "Fée gardienne", c: "#8FEFF4",
    /* A single small attendant flies with the Dragon and keeps re-shielding it.
       She stands in front of him, so the hero's auto-target finds her first:
       the fight opens by chewing through her while the Dragon works on you.
       Kill her and the shields stop for good -- that is the reward for reading
       the fight rather than hitting the biggest health bar. */
    tick(c, e, dt) {
      const fay = c.enemies.find((x) => x.alive && x.minionOf === e.id);
      if (!e._fay) {
        e._fay = true;
        const f = spawnMinion(c, e, "Fée", 0.15, 0, "#8FEFF4", 46, FAIRY_TYPE);
        c.enemies.push(f);
        return;
      }
      if (!fay) return;                       // she is gone; so is the warding
      e.wardCd = (e.wardCd == null ? 1.5 : e.wardCd) - dt;
      if (e.wardCd > 0) return;
      e.wardCd = 5;
      const cap = Math.floor(e.maxHP * 0.5);
      e.ward = Math.min(cap, (e.ward || 0) + Math.floor(e.maxHP * 0.18));
      addBurst(c, "hit", e.x, "#8FEFF4");
      c.floats.push({ id: rid(), x: fay.x, val: 0, crit: false, color: "#8FEFF4",
        born: Date.now(), text: "BOUCLIER" });
    },
    filter(c, e, dmg) {
      if (!(e.ward > 0)) return dmg;
      const a = Math.min(e.ward, dmg);
      e.ward -= a;
      c.floats.push({ id: rid(), x: e.x, val: a, crit: false, color: "#8FEFF4",
        born: Date.now(), blocked: true });
      if (e.ward <= 0) { e.ward = 0; addBurst(c, "death", e.x, "#8FEFF4"); }
      return dmg - a;
    },
    state(e) {
      if (e.ward > 0) return "BOUCLIER " + Math.round(e.ward / e.maxHP * 100) + "%";
      return combat && combat.enemies.some((x) => x.alive && x.minionOf === e.id) ? "FÉE" : "";
    },
  },
  ailesCendre: {
    label: "Ailes de cendre", c: "#CFCFCF",
    tick(c, e, dt) {
      e.wingCd = (e.wingCd == null ? 2.5 : e.wingCd) - dt;
      if (e.wingCd > 0) return;
      e.wingCd = 17;
      c.heroX = 24;
      fxAdd(c, "debuffs", { key: "cendre", value: 30, label: "Cendres", dur: 6 }, Date.now());
      addShake(c, 7);
      addBurst(c, "hit", c.heroX, "#CFCFCF");
    },
    state() { return combat && fxVal(combat, "debuffs", "cendre") ? "CENDRES" : ""; },
  },

  // Lord Demoniaque -- black and gold armour wreathed in fire, a burning
  // greatsword in one hand and a fireball hanging in the other. Boss of the
  // skill raid, so he goes after your skills.
  sceau: {
    label: "Sceau de silence", c: "#B15CF6",
    tick(c, e, dt) {
      e.sealCd = (e.sealCd == null ? 1.5 : e.sealCd) - dt;
      if (e.sealCd > 0) return;
      e.sealCd = 15;
      const live = S.skillSlots.slice(0, skillSlotCount(S))
        .filter((sid) => sid && S.skills[sid] && !skillSealed(c, sid));
      if (!live.length) return;
      const sid = live[Math.floor(Math.random() * live.length)];
      c.sealed = c.sealed || {};
      c.sealed[sid] = Date.now() + 8000;
      const def = SKILL_BY_ID[sid];
      addBurst(c, "crit", c.heroX, "#B15CF6");
      c.floats.push({ id: rid(), x: c.heroX, val: 0, crit: false, color: "#B15CF6",
        born: Date.now(), text: "SCELLÉ · " + (def ? def.name : sid) });
    },
    state(c2) {
      if (!combat || !combat.sealed) return "";
      const n = Object.keys(combat.sealed).filter((k) => skillSealed(combat, k)).length;
      return n ? "SCEAU " + n : "";
    },
  },
  lameArdente: {
    label: "Lame ardente", c: "#FF7A3D",
    // the greatsword: every fourth swing is the one that matters
    outgoing(c, e, dmg) {
      e.swings = (e.swings || 0) + 1;
      if ((e.swings + 2) % 4 !== 0) return dmg;
      e.blazing = 0.5;
      addShake(c, 8);
      addBurst(c, "crit", e.x, "#FF7A3D");
      return dmg * 3;
    },
    tick(c, e, dt) { if (e.blazing > 0) e.blazing = Math.max(0, e.blazing - dt); },
    state(e) { return e.blazing > 0 ? "LAME ARDENTE" : ""; },
  },
  orbeInfernal: {
    label: "Orbe infernal", c: "#FF5A5A",
    tick(c, e, dt) {
      if (e.orbWind > 0) {
        e.orbWind = Math.max(0, e.orbWind - dt);
        if (e.orbWind > 0) return;
        // it detonates where he stands: the closer you are, the worse it is
        const dist = Math.max(0, e.x - c.heroX);
        const near = Math.max(0, Math.min(1, 1 - dist / 220));
        const d = Math.max(1, Math.floor(c.heroMaxHP * (0.05 + 0.25 * near) * (1 - heroDmgRed(c) / 100)));
        c.heroHP -= d;
        c.heroHit = 0.3;
        addShake(c, 10);
        addBurst(c, "crit", c.heroX, "#FF5A5A");
        c.floats.push({ id: rid(), x: c.heroX, val: d, crit: near > 0.5, color: "#FF5A5A", born: Date.now() });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        return;
      }
      e.orbCd = (e.orbCd == null ? 2 : e.orbCd) - dt;
      if (e.orbCd <= 0) {
        e.orbCd = 14; e.orbWind = 1.5;
        c.projs.push({ id: rid(), x: e.x - 10, toX: e.x - 10, color: "#FF5A5A", kind: "magic", life: 1.5 });
        addBurst(c, "hit", e.x, "#FF5A5A");
      }
    },
    state(e) { return e.orbWind > 0 ? "ORBE…" : ""; },
  },

  // Bete Corrompue -- a wolf wrapped in violet flame, armoured at the shoulder,
  // trailing shards. Boss of the familiar raid, so it turns yours.
  corruption: {
    label: "Corruption", c: "#B15CF6",
    tick(c, e, dt) {
      if (c.petCorrupt > 0) {
        c.petCorrupt = Math.max(0, c.petCorrupt - dt);
        if (!S.activePetId) return;
        e._claw = (e._claw || 0) + dt;
        if (e._claw < 1) return;
        e._claw = 0;
        // your own familiar, clawing at you
        const d = Math.max(1, Math.floor(c.heroMaxHP * 0.03));
        c.heroHP -= d;
        c.floats.push({ id: rid(), x: c.heroX, val: d, crit: false, color: "#B15CF6", born: Date.now() });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        return;
      }
      e.corrCd = (e.corrCd == null ? 1.5 : e.corrCd) - dt;
      if (e.corrCd <= 0) {
        e.corrCd = 18; c.petCorrupt = 10;
        addBurst(c, "crit", c.heroX, "#B15CF6");
        c.floats.push({ id: rid(), x: c.heroX, val: 0, crit: false, color: "#B15CF6",
          born: Date.now(), text: S.activePetId ? "FAMILIER CORROMPU" : "CORRUPTION" });
      }
    },
    state() { return combat && combat.petCorrupt > 0 ? "CORRUPTION" : ""; },
  },
  bond: {
    label: "Bond", c: "#B15CF6",
    tick(c, e, dt) {
      if (e.leapWind > 0) {
        e.leapWind = Math.max(0, e.leapWind - dt);
        if (e.leapWind > 0) return;
        e.x = c.heroX + 34;                       // lands on top of him
        const d = Math.max(1, Math.floor(c.heroMaxHP * 0.18 * (1 - heroDmgRed(c) / 100)));
        c.heroHP -= d;
        c.heroHit = 0.3;
        addShake(c, 10);
        addBurst(c, "crit", e.x, "#B15CF6");
        c.floats.push({ id: rid(), x: c.heroX, val: d, crit: true, color: "#B15CF6", born: Date.now() });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        return;
      }
      e.leapCd = (e.leapCd == null ? 1.5 : e.leapCd) - dt;
      if (e.leapCd <= 0) { e.leapCd = 13; e.leapWind = 1.2; addBurst(c, "hit", e.x, "#B15CF6"); }
    },
    state(e) { return e.leapWind > 0 ? "BOND…" : ""; },
  },
  meute: {
    label: "Meute d'ombres", c: "#9B5CF6",
    tick(c, e, dt) {
      const mine = c.enemies.filter((x) => x.alive && x.minionOf === e.id);
      e.packCd = (e.packCd == null ? 1.5 : e.packCd) - dt;
      if (e.packCd > 0 || mine.length >= 3) return;
      e.packCd = 16;
      if (e.hp <= e.maxHP * 0.2) return;
      for (let k = mine.length; k < 3; k++) {
        // thin and fast, not another health bar: they are a burst, not a siege
        const w = spawnMinion(c, e, "Ombre", 0.05, 0.30, "#9B5CF6", 30 + k * 26);
        w.atkCd = 0.3;
        c.enemies.push(w);
      }
      addBurst(c, "hit", e.x, "#9B5CF6");
    },
    state() { return ""; },
  },

  // Souverain du Vide -- a robed thing of tentacles and open eyes, crowned and
  // masked, orbited by its own stare. Boss of the evolution raid, so it evolves
  // while you fight it.
  mutation: {
    label: "Mutation", c: "#8FEFF4",
    tick(c, e) {
      const want = Math.min(3, Math.floor((1 - e.hp / e.maxHP) / 0.25));
      while ((e.mutations || 0) < want) {
        e.mutations = (e.mutations || 0) + 1;
        addBurst(c, "crit", e.x, "#8FEFF4");
        addShake(c, 9);
        c.floats.push({ id: rid(), x: e.x, val: 0, crit: false, color: "#8FEFF4",
          born: Date.now(), text: MUTATION_LABEL[e.mutations - 1] });
      }
    },
    filter(c, e, dmg, src) {
      if ((e.mutations || 0) >= 2) dmg = Math.max(1, Math.floor(dmg * 0.65));
      if ((e.mutations || 0) >= 3 && dmg > 0 && src !== "dot") {
        const back = Math.max(1, Math.floor(dmg * 0.3));
        c.heroHP -= back;
        c.floats.push({ id: rid(), x: c.heroX, val: back, crit: false, color: "#8FEFF4", born: Date.now() });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
      }
      return dmg;
    },
    state(e) { return e.mutations ? "MUTATION " + e.mutations + "/3" : ""; },
  },
  regard: {
    label: "Regard du vide", c: "#B15CF6",
    tick(c, e, dt) {
      if (e.gaze > 0) { e.gaze = Math.max(0, e.gaze - dt); return; }
      e.gazeCd = (e.gazeCd == null ? 2 : e.gazeCd) - dt;
      if (e.gazeCd > 0) return;
      e.gazeCd = 16; e.gaze = 4;
      addBurst(c, "crit", e.x, "#B15CF6");
      addShake(c, 5);
      c.floats.push({ id: rid(), x: c.heroX, val: 0, crit: false, color: "#B15CF6",
        born: Date.now(), text: "REGARD DU VIDE" });
    },
    state(e) { return e.gaze > 0 ? "REGARD" : ""; },
  },
  etreinte: {
    label: "Étreinte des tentacules", c: "#8FEFF4",
    tick(c, e, dt) {
      if (e.grip > 0) {
        e.grip = Math.max(0, e.grip - dt);
        // held against it: dragged in and unable to act
        c.heroX = Math.max(24, Math.min(AW - 40, e.x - 34));
        c.heroStun = Math.max(c.heroStun || 0, 0.12);
        e._grip = (e._grip || 0) + dt;
        if (e._grip < 0.5) return;
        e._grip = 0;
        const d = Math.max(1, Math.floor(c.heroMaxHP * 0.04 * (1 - heroDmgRed(c) / 100)));
        c.heroHP -= d;
        c.heroHit = 0.2;
        c.floats.push({ id: rid(), x: c.heroX, val: d, crit: false, color: "#8FEFF4", born: Date.now() });
        if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        return;
      }
      e.gripCd = (e.gripCd == null ? 3 : e.gripCd) - dt;
      if (e.gripCd <= 0) {
        e.gripCd = 15; e.grip = 2;
        addBurst(c, "hit", c.heroX, "#8FEFF4");
        addShake(c, 6);
      }
    },
    state(e) { return e.grip > 0 ? "ÉTREINTE" : ""; },
  },

  braise: {
    label: "Braise", c: "#FF7A3D",
    tick(c, e, dt) { if (e.emberCd > 0) e.emberCd = Math.max(0, e.emberCd - dt); },
    onLand(c) { c.burn = Math.min(6, (c.burn || 0) + 1); },
    // It only stacked embers with its own swings, so at floors 15 and 60 it died
    // first and the mechanic was never once seen. The armour is molten: striking
    // it burns you too, which fires from the opening exchange.
    filter(c, e, dmg, src) {
      if (src === "weapon" && !(e.emberCd > 0)) {
        e.emberCd = 1.5;
        c.burn = Math.min(6, (c.burn || 0) + 1);
        addBurst(c, "hit", c.heroX, "#FF7A3D");
      }
      return dmg;
    },
    state(e) { return e.emberCd > 0 ? "BRAISE" : ""; },
  },
};
/* An elite carries one ability, a boss carries several, so everything reads a
   list. `abil` stays for the elites rather than rewriting eight definitions. */
function abilitiesOf(e) {
  if (!e) return [];
  const ids = e.abils || (e.abil ? [e.abil] : []);
  return ids.map((id) => ELITE_ABIL[id]).filter(Boolean);
}
/* A minion is its parent drawn small: the Chaman's spirits look like the Chaman,
   the Abyssal's orbs like the Abyssal, so neither needs new art. hpFrac and
   dmgFrac are shares of the parent, and dmgFrac 0 means it never attacks.
   `ahead` places it that far in front of its summoner: they screen it, and
   spreading them out is the whole point -- offsets behind it all collapsed onto
   the arena's right-hand clamp and stacked into one sprite. */
function spawnMinion(c, owner, label, hpFrac, dmgFrac, tint, ahead, typeOverride) {
  const m = makeEnemy(c.ctx === "raid" ? "raid" : "campaign", {
    type: typeOverride || owner.type, name: owner.name, tier: owner.tier,
    floor: c.floor, raidId: c.raidId, raidLevel: c.raidLevel,
    x: Math.max(c.heroX + 58, Math.min(AW - 24, owner.x - ahead)),
  });
  m.hp = m.maxHP = Math.max(1, Math.floor(owner.maxHP * hpFrac));
  m.dmg = Math.max(0, Math.floor(owner.dmg * dmgFrac));
  m.name = label;
  m.minionOf = owner.id;
  m.small = true;
  m.tint = tint;
  m.abil = null;                 // a minion never carries the parent's ability
  m.ranged = dmgFrac > 0 && !!owner.ranged;
  return m;
}
/* Spirits and orbs are held together by their summoner: when it falls, so do
   they. Without this a fight could stall on a minion the player cannot reach. */
function cullMinions(c) {
  if (!c || !c.enemies) return;
  c.enemies.forEach((m) => {
    if (m.minionOf && m.alive && !c.enemies.some((o) => o.id === m.minionOf && o.alive)) {
      m.alive = false; m.hp = 0;
      addBurst(c, "death", m.x, m.tint || "#B15CF6");
    }
  });
}
function campaignBossStatMul(floor) {
  // La rareté du Boss reste visuelle et thématique, mais ne provoque plus de
  // saut brutal de statistiques. Boss 10 à 100 suivent une échelle régulière.
  const bossNo = Math.max(1, Math.min(10, Math.floor((Number(floor) || 10) / RULES.BOSS_EVERY)));
  return 1 + 0.06 * (bossNo - 1);
}

function makeEnemy(mode, opts) {
  const t = opts.type;
  const tierKey = opts.tier || (mode === "campaign" ? enemyTierFor(opts.floor) : "RARE");
  const tier = ENEMY_TIERS[tierKey] || ENEMY_TIERS.COMMUN;
  let hp, dmg;
  if (mode === "campaign") {
    const mulH = opts.boss ? (opts.floor === 40 ? 5.1 : 6) : opts.elite ? 2.3 : 1;
    const mulD = opts.boss ? (opts.floor === 40 ? 1.7 : 1.8) : opts.elite ? 1.4 : 1;
    const statMul = opts.boss ? campaignBossStatMul(opts.floor) : tier.mul;
    // Le Chef Gobelin est le premier checkpoint majeur : -20 % PV et dégâts.
    // noFastback est utilisé par le Méga-Boss construit depuis ce Boss, ce qui
    // garantit que Méga 1 conserve sa puissance de référence et son ×10.
    const firstBossMul = opts.boss && opts.floor === 10 && !opts.noFastback ? 0.80 : 1;
    hp = Math.floor(enemyHP(opts.floor) * t.hpMul * mulH * statMul * firstBossMul);
    dmg = Math.floor(enemyDamage(opts.floor) * t.dmgMul * mulD * statMul * firstBossMul);
    // Campaign difficulty is fixed by floor and enemy identity, never by player gear.
  } else {
    hp = Math.floor(raidEnemyHP(opts.raidId, opts.raidLevel) * t.hpMul);
    dmg = Math.floor(raidEnemyDamage(opts.raidId, opts.raidLevel) * t.dmgMul);
  }
  preloadFrames(t.img);
  return {
    id: rid(), type: t, x: opts.x, hp, maxHP: hp, dmg, abil: opts.abil || null,
    abils: opts.abils || null,
    tier: tierKey, name: opts.name || t.name,
    ranged: t.ranged, boss: !!opts.boss, elite: !!opts.elite, alive: true,
    atkCd: 0.6 + Math.random() * 1.0, hitFlash: 0, attacking: 0,
    speedVar: 0.8 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2,
  };
}

function campaignWaveCount(floor) {
  // Boss = combat unique. Élite = une vague normale puis l’Élite. Les étages
  // standards conservent les 3 vagues historiques.
  if (isBoss(floor)) return 1;
  if (isElite(floor)) return 2;
  return RULES.STEPS_PER_FLOOR;
}
function spawnCampaign(s) {
  const floor = s.floor, step = s.step;
  const boss = isBoss(floor);
  const elite = !boss && isElite(floor) && step === campaignWaveCount(floor);
  const count = (boss || elite) ? 1 : enemyCount(floor, step);
  const dv = computeDerived(s);
  const enemies = [];
  const bossDef = boss ? bossFor(floor) : null;
  const eliteDef = elite ? eliteFor(floor) : null;
  for (let i = 0; i < count; i++) {
    let type, name, tier;
    if (boss) {
      type = Object.assign({}, ENEMY_TYPES[1], { id: bossDef.id, name: bossDef.name, img: bossDef.img,
        ranged: !!bossDef.ranged, proj: bossDef.proj || "magic" });
      name = bossDef.name; tier = bossDef.tier;
    } else if (elite) {
      const base = typeById(eliteDef.base);
      // the base lends its numbers; how the elite fights is its own business
      type = Object.assign({}, base, { id: eliteDef.id, name: eliteDef.name,
        img: eliteDef.img || base.img, ranged: !!eliteDef.ranged, proj: eliteDef.proj || "arrow" });
      name = eliteDef.name; tier = eliteDef.tier;
    } else {
      type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      name = type.name; tier = enemyTierFor(floor);
    }
    enemies.push(makeEnemy("campaign", { type, name, tier, floor, elite, boss,
      abils: boss && bossDef ? bossDef.abils : null,
      abil: elite && eliteDef ? eliteDef.ability : null, x: AW - 46 - i * 44 }));
  }
  const bg = ENV_KEYS[Math.floor((floor - 1) / 10) % ENV_KEYS.length];
  return {
    ctx: "campaign", floor, step, elite, boss, enemies, pending: 0, startAt: Date.now(),
    heroX: HERO_START, heroHP: dv.maxHP, heroMaxHP: dv.maxHP, heroAtkCd: 0.6,
    heroAttacking: 0, heroHit: 0, skillCds: {}, skillCdMax: {}, buffs: {}, debuffs: {}, skillFxs: [], floats: [], projs: [],
    bg, status: "fight",
  };
}

function spawnRaidWave(raidId, level) {
  if (raidId === "or") {
    const t = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    return { enemies: [makeEnemy("raid", { type: t, raidId, raidLevel: level, x: AW - 60 })], pending: 4 };
  }
  if (raidId === "minerai") {
    const rb2 = RAID_BOSSES[raidId];
    const t = Object.assign({}, ENEMY_TYPES[1], { id: "boss", name: rb2.name,
      img: rb2.img || "boss_golem", ranged: !!rb2.ranged, proj: rb2.proj || "magic" });
    return { enemies: [makeEnemy("raid", { type: t, name: rb2.name, tier: rb2.tier,
      abils: rb2.abils, raidId, raidLevel: level, x: AW - 60, boss: true })], pending: 0 };
  }
  const n = raidEnemyCount(raidId, level);
  const rb3 = RAID_BOSSES[raidId];
  const enemies = [];
  for (let i = 0; i < n; i++) {
    // the lead enemy of the wave is the raid's named boss; the rest are escorts
    if (i === 0 && rb3) {
      const bt = Object.assign({}, ENEMY_TYPES[1],
        { id: "raidboss", name: rb3.name, img: rb3.img, ranged: !!rb3.ranged, proj: rb3.proj || "magic" });
      enemies.push(makeEnemy("raid", { type: bt, name: rb3.name, tier: rb3.tier,
        abils: rb3.abils, raidId, raidLevel: level, x: AW - 50, boss: true }));
      continue;
    }
    const t = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    enemies.push(makeEnemy("raid", { type: t, raidId, raidLevel: level, x: AW - 50 - i * 44 }));
  }
  return { enemies, pending: 0 };
}

function startCampaign() {
  const pending = Number(S.pendingBossFloor || 0);
  if (pending && S.floor >= pending) update((st) => { st.floor = Math.max(1, pending - 1); st.step = 1; });
  combat = spawnCampaign(S);
}
function retryPendingBoss() {
  const floor = Number(S.pendingBossFloor || 0);
  if (!floor || floor !== S.floor + 1 || !isBoss(floor) || (S.bossClears && S.bossClears[String(floor)])) return false;
  update((s) => { s.floor = floor; s.step = 1; });
  combat = spawnCampaign(S);
  return true;
}

function megaBossFloors(s) {
  if (!megaRaidUnlocked(s)) return [];
  return Object.keys((s && s.bossClears) || {}).filter((k) => s.bossClears[k])
    .map((k) => parseInt(k, 10))
    .filter((f) => Number.isFinite(f) && isBoss(f))
    .sort((a, b) => a - b);
}
function nextMegaBossFloor(s) {
  if (!megaRaidUnlocked(s)) return null;
  const claimed = (s && s.megaBossClears) || {};
  return megaBossFloors(s).find((f) => !claimed[String(f)]) || null;
}
/* Build from the exact campaign Boss path, then multiply its two combat power
   axes. noFastback is deliberate: a Mega-Boss is a fresh challenge even when
   its normal counterpart sits below the current campaign record. */
function makeMegaBossEnemy(floor) {
  const def = bossFor(floor);
  const type = Object.assign({}, ENEMY_TYPES[1], { id: "mega_" + def.id,
    name: "Méga-" + def.name, img: def.img, ranged: !!def.ranged,
    proj: def.proj || "magic" });
  const enemy = makeEnemy("campaign", { type, name: type.name, tier: def.tier,
    floor, boss: true, abils: def.abils, noFastback: true, x: AW - 60 });
  enemy.hp = enemy.maxHP = Math.max(1, Math.floor(enemy.maxHP * 10));
  enemy.dmg = Math.max(1, Math.floor(enemy.dmg * 10));
  enemy.mega = true;
  return enemy;
}

function startMegaBoss(floor, onEnd) {
  floor = parseInt(floor, 10);
  const key = String(floor);
  const claimed = !!(S.megaBossClears && S.megaBossClears[key]);
  if (!megaRaidUnlocked(S) || !Number.isFinite(floor) || !isBoss(floor) || !S.bossClears[key] ||
      (!claimed && floor !== nextMegaBossFloor(S))) return false;
  flushRewards();
  const enemy = makeMegaBossEnemy(floor);
  const dv = D;
  combat = {
    ctx: "mega", megaFloor: floor, floor, step: 1, startAt: Date.now(),
    elite: false, boss: true, enemies: [enemy], pending: 0,
    heroX: HERO_START, heroHP: dv.maxHP, heroMaxHP: dv.maxHP, heroAtkCd: 0.6,
    heroAttacking: 0, heroHit: 0, skillCds: {}, skillCdMax: {}, buffs: {}, debuffs: {},
    skillFxs: [], floats: [], projs: [],
    bg: ENV_KEYS[Math.floor((floor - 1) / 10) % ENV_KEYS.length], status: "fight",
    onEnd: (won) => {
      let result = { floor, won, firstClear: false, apples: 0, accel: null };
      if (won) {
        update((st) => {
          st.megaBossClears = st.megaBossClears || {};
          if (!st.megaBossClears[key]) {
            const apples = megaAppleFirstClearReward(floor, st);
            const accel = megaAccelReward(floor);
            st.megaBossClears[key] = true;
            st.apples = (st.apples || 0) + apples;
            if (accel) st.accels[accel.key] = (st.accels[accel.key] || 0) + accel.qty;
            result = { floor, won: true, firstClear: true, apples, accel };
          }
        });
      }
      if (onEnd) onEnd(won, result);
    },
  };
  return true;
}

function startRaid(raidId, useUniversal, onEnd) {
  const raid = S.raids[raidId];
  if (!useUniversal && raid.keys <= 0) return false;
  if (useUniversal && S.universalKeys <= 0) return false;
  const level = raid.level;
  const dv = D;
  const wave = spawnRaidWave(raidId, level);
  const reward = raidReward(raidId, level);
  combat = {
    ctx: "raid", raidId, raidLevel: level, floor: level, step: 1, startAt: Date.now(),
    elite: false, boss: raidId === "minerai",
    enemies: wave.enemies, pending: wave.pending,
    heroX: HERO_START, heroHP: dv.maxHP, heroMaxHP: dv.maxHP, heroAtkCd: 0.6,
    heroAttacking: 0, heroHit: 0, skillCds: {}, skillCdMax: {}, buffs: {}, debuffs: {}, skillFxs: [], floats: [], projs: [],
    bg: raidId === "minerai" ? "env_ice" : raidId === "or" ? "env_dragon"
      : raidId === "competence" ? "env_celestial" : "env_forest", status: "fight",
    onEnd: (won) => {
      let payout = { gross: reward, credited: reward, repaid: 0 };
      if (won) {
        update((st) => {
          if (useUniversal) st.universalKeys -= 1; else st.raids[raidId].keys -= 1;
          st.raids[raidId].level = Math.min(RULES.RAID_MAX_LEVEL, level + 1);
          st.raids[raidId].record = Math.max(st.raids[raidId].record, level);
          // Tree bonuses land here, where the resource is actually granted.
          if (raidId === "or") {
            const amount = Math.floor(reward * goldMul(st));
            st.gold += amount; payout = { gross: amount, credited: amount, repaid: 0 };
          } else if (raidId === "minerai") {
            const amount = Math.floor(reward * (1 + (treeSum(st, "minerai") + treeSum(st, "raidMinerai")) / 100));
            st.minerai += amount; payout = { gross: amount, credited: amount, repaid: 0 };
          } else if (raidId === "competence") {
            const amount = Math.floor(reward * (1 + treeSum(st, "skillPts") / 100));
            const pay = creditRebalancedResource(st, "eclat", amount);
            payout = { gross: amount, credited: pay.credited, repaid: pay.repaid };
          } else if (raidId === "evolution") {
            const amount = Math.floor(reward * (1 + treeSum(st, "peRaid") / 100));
            st.pe += amount; payout = { gross: amount, credited: amount, repaid: 0 };
          } else {
            const amount = Math.floor(reward * (1 + treeSum(st, "essence") / 100));
            const pay = creditRebalancedResource(st, "essence", amount);
            payout = { gross: amount, credited: pay.credited, repaid: pay.repaid };
          }
        });
      } else {
        // Défaite/abandon : aucune clé n'est consommée.
        // La clé n'est débitée qu'après une victoire, pour éviter une double punition.
      }
      onEnd(won, payout);
    },
  };
  return true;
}

function startAscensionTrial(onEnd) {
  const dv = D;
  const t = Object.assign({}, ENEMY_TYPES[1], { id: "boss", name: "Gardien de l'Ascension",
    img: "boss_golem", ranged: false });
  const e = makeEnemy("campaign", { type: t, floor: S.floor + 20, boss: true, x: AW - 60 });
  e.hp = e.maxHP = Math.floor(e.maxHP * 1.5);
  combat = {
    ctx: "raid", raidId: null, trial: true, floor: S.level, step: 1, elite: false, boss: true, startAt: Date.now(),
    enemies: [e], pending: 0, heroX: HERO_START, heroHP: dv.maxHP, heroMaxHP: dv.maxHP,
    heroAtkCd: 0.6, heroAttacking: 0, heroHit: 0, skillCds: {}, skillCdMax: {}, buffs: {}, debuffs: {}, skillFxs: [],
    floats: [], projs: [], bg: "env_celestial", status: "fight",
    onEnd: (won) => onEnd(won),
  };
}

/* -------- damage -------- */
/* ---- timed buffs (hero) and debuffs (enemies), per the reference sheet ----
   Both live on the combat object, so they clear when the fight ends. */
function fxAdd(c, bag, eff, now) {
  c[bag] = c[bag] || {};
  c[bag][eff.key] = { value: eff.value, label: eff.label, until: now + eff.dur * 1000, dur: eff.dur };
}
/* Buffs pass through here on their way to the hero, so something on the field
   can take one first. Both cast paths call it, which is the point -- the
   automatic and the manual route cannot drift apart. */
/* Absorption takes Force, Hate and Rempart and nothing else. Naming the three
   rather than testing the bag matters: Regeneration also lands in "buffs", and
   any future skill that both deals damage and grants a buff would otherwise be
   swallowed whole. */
const STEALABLE = { force: 1, hate: 1, rempart: 1 };
function applyHeroEffect(c, bag, eff, now) {
  if (bag === "buffs" && STEALABLE[eff.key]) {
    const thief = c.enemies.find((e) => e.alive && !e.stolen && !(e.stealCd > 0) &&
      (e.abils || []).indexOf("absorption") >= 0);
    if (thief) {
      thief.stolen = { key: eff.key, value: eff.value, label: eff.label, until: now + 8000 };
      thief.stealCd = 14;
      addBurst(c, "crit", thief.x, "#B15CF6");
      c.floats.push({ id: rid(), x: thief.x, val: 0, crit: false, color: "#B15CF6",
        born: now, text: "VOL !" });
      return;
    }
  }
  fxAdd(c, bag, eff, now);
}
function fxVal(c, bag, key) {
  const b = c && c[bag] && c[bag][key];
  return b && Date.now() < b.until ? b.value : 0;
}
/* The same reduction an ordinary blow goes through, so Rempart genuinely
   answers a boss ability instead of only answering basic attacks. */
/* A sealed skill still counts its cooldown down; it simply cannot be spent.
   Both cast paths ask here, so manual and automatic stay in step. */
/* While the Souverain has its eyes open nothing cast lands, so both cast paths
   ask here rather than each deciding for itself. */
function skillsFizzle(c) {
  return !!(c && c.enemies && c.enemies.some((e) => e.alive && e.gaze > 0));
}
function skillSealed(c, sid) {
  return !!(c && c.sealed && c.sealed[sid] && Date.now() < c.sealed[sid]);
}
/* The Bete Corrompue turns a familiar against its owner, so every read of the
   pet's element goes through this instead of dv.petElem directly. */
function petElemOf(c, dv) {
  return c && c.petCorrupt > 0 ? null : dv.petElem;
}
function heroDmgRed(c) {
  return Math.min(85, (D.dmgRed || 0) + fxVal(c, "buffs", "rempart"));
}
function fxList(c, bag) {
  const out = [], now = Date.now();
  const src = (c && c[bag]) || {};
  Object.keys(src).forEach((k) => {
    const b = src[k];
    if (now < b.until) out.push({ key: k, label: b.label, left: (b.until - now) / 1000, dur: b.dur });
  });
  return out;
}
/* Damage used to apply on the same frame the swing started, so a bow dealt its
   damage while the arrow was still leaving the string and Cataclysme killed the
   wave before the fireball touched anything. A hit is now queued and lands when
   the visual reaches the sprite.

   Targets are captured at cast time, so a hit can never leak into the next wave
   after the enemies are replaced, and anything that died in between is skipped
   -- which is what an area effect should do anyway. */
function scheduleHit(c, delay, fn) {
  if (delay <= 0) { fn(); return; }
  (c.hits = c.hits || []).push({ at: Date.now() + delay * 1000, fn: fn });
}
function runDueHits(c, now) {
  if (!c.hits || !c.hits.length) return;
  const due = c.hits.filter((h) => now >= h.at);
  if (!due.length) return;
  c.hits = c.hits.filter((h) => now < h.at);
  due.forEach((h) => h.fn());
}
/* how long the visual needs to reach the sprite */
const HIT_DELAY_MELEE = 0.12;   // mid-swing of the 0.2s attack window
const HIT_DELAY_RANGED = 0.15;  // the projectile converges in about 5 frames
function skillHitDelay(kind) { return Math.min(0.3, vfxDur(kind) * 0.4); }
/* A hit that only tints a sprite for 150ms reads as nothing happened. Every
   landed blow now shoves the target, and the heavier ones kick the whole arena
   for a moment -- the shake decays on wall-clock so a paused fight cannot leave
   the board off-centre. */
function addShake(c, mag) {
  const now = Date.now();
  c.shake = { mag: Math.max(mag, (c.shake && c.shake.until > now) ? c.shake.mag : 0), until: now + 170 };
}
/* Skills outscale enemy health badly: at floor 60 an opening Taillade lands
   269716 on an elite with 14471 health, so every elite died to a single blow and
   not one of their mechanics ever got a turn. Raising elite health cannot fix
   it -- measured, floor 15 still dies in 0.7s at sixteen times the health, while
   floor 140 stretches to 70s. So instead a champion caps what one blow can take:
   four hits minimum, which is the room its ability needs. It costs nothing in
   fights that were already fights, because there no single hit was ever that
   large. */
const ELITE_HIT_CAP = 0.3, BOSS_HIT_CAP = 0.2;
function capChampionHit(e, dmg) {
  const cap = e.boss ? BOSS_HIT_CAP : e.elite ? ELITE_HIT_CAP : 0;
  if (!cap || e.minionOf) return dmg;
  return Math.min(dmg, Math.max(1, Math.floor(e.maxHP * cap)));
}
function applyDamageToEnemy(c, e, dmg, crit, color, src) {
  /* Malédiction et le Familier Toxique annoncent tous deux un bonus valable sur
     toutes les sources. Les coups d’arme appliquent déjà Vulnérabilité dans leur
     calcul de swing ; compétences et DoT la reçoivent ici. Toxique, lui, est
     centralisé ici afin de renforcer arme, compétences, Poison et brûlure sans
     risque d’oubli selon la source. */
  const damageSrc = src || "weapon";
  if (e.arenaProfile) {
    const ap=e.arenaProfile;
    if(damageSrc==="weapon" && Math.random()*100<(ap.blockChance||0)){
      c.floats.push({id:rid(),x:e.x,val:0,crit:false,color:"#8FEFF4",born:Date.now(),blocked:true});return;
    }
    if(damageSrc==="weapon" && crit && (D.critMult||1)>1){
      const eff=1+Math.max(0,(D.critMult||1)-1)*(1-Math.min(80,ap.critRed||0)/100);
      dmg=dmg/Math.max(1,D.critMult||1)*eff;
    }
    const extraRed=(e._arenaRempart&&Date.now()<e._arenaRempart.until)?e._arenaRempart.value:0;
    dmg*=1-Math.min(85,Math.max(0,(ap.dmgRed||0)+extraRed))/100;
  }
  if (damageSrc !== "weapon") dmg *= 1 + fxVal(c, "debuffs", "vuln") / 100;
  if (petElemOf(c, D) === "toxique") dmg *= 1.10;
  dmg = capChampionHit(e, dmg);
  abilitiesOf(e).forEach((a) => {
    if (a.filter) dmg = Math.max(0, a.filter(c, e, dmg, src || "weapon", !!crit));
  });
  e.hp -= dmg;
  e.hitFlash = 0.28;
  e.recoil = 0.22;
  addShake(c, crit ? 5 : 2.5);
  // an ordinary blow used to be a tint and nothing else
  addBurst(c, "hit", e.x, color || "#FFE9A8");
  c.floats.push({ id: rid(), x: e.x, val: dmg, crit, color, born: Date.now() });
  if (crit) addBurst(c, "crit", e.x, color);
  if (e.hp <= 0 && e.alive) {
    e.alive = false;
    addBurst(c, "death", e.x, (e.tier && ENEMY_TIERS[e.tier] && ENEMY_TIERS[e.tier].c) || "#CFE0FF");
    if (c.ctx === "campaign") {
      rewardAcc.gold += goldReward(c.floor);
      rewardAcc.exp += expReward(c.floor);
    }
  }
}

function resolveArenaBotBasicHit(c,e,dv,abs,delayExtra=0) {
  if(!e||!e.arenaProfile||c.status!=="fight") return;
  const ap=e.arenaProfile,now=Date.now();
  const dodgePct=fxVal(c,"buffs","hate")*0.5;
  if(Math.random()*100<dodgePct){
    c.floats.push({id:rid(),x:c.heroX,val:0,crit:false,color:"#8FC4FF",born:now,dodged:true});
    return;
  }
  if(Math.random()*100<(dv.blockChance||0)){
    c.heroHit=0.1;
    c.floats.push({id:rid(),x:c.heroX,val:0,crit:false,color:"#8FEFF4",born:now,blocked:true});
    return;
  }
  let dmg=ap.damage*(ap.hit||1)*(1+Math.max(0,ap.styleBonus||0)/100);
  if(e._arenaForce&&now<e._arenaForce.until)dmg*=1+e._arenaForce.value/100;
  if(ap.petElem==="toxique")dmg*=1.10;
  if(c._arenaHeroVuln&&now<c._arenaHeroVuln.until)dmg*=1+c._arenaHeroVuln.value/100;
  abs.forEach((a)=>{if(a.outgoing)dmg=a.outgoing(c,e,dmg);});
  let crit=e.nextCrit?true:Math.random()*100<(ap.critChance||0);
  if(e.nextCrit){e.nextCrit=false;dmg*=1.5;}
  if(crit)dmg*=1+Math.max(0,(ap.critMult||1)-1)*(1-dv.critRed/100);
  const totalRed=Math.min(85,dv.dmgRed+fxVal(c,"buffs","rempart"));
  dmg=Math.max(1,Math.floor(dmg*(1-totalRed/100)*(0.9+Math.random()*0.2)));
  if(e.ranged){
    const pk=e.type.proj||"arrow";
    c.projs.push({id:rid(),x:e.x-10,toX:c.heroX,color:pk==="magic"?"#B15CF6":"#CFCFCF",kind:pk,life:0.35});
  }
  scheduleHit(c,(e.ranged?HIT_DELAY_RANGED:HIT_DELAY_MELEE)+delayExtra,()=>{
    if(c.status!=="fight")return;
    c.heroHP-=dmg;
    if(ap.lifesteal>0)e.hp=Math.min(e.maxHP,e.hp+dmg*ap.lifesteal/100);
    c.heroHit=0.22;
    abs.forEach((a)=>{if(a.onLand)a.onLand(c,e);});
    addShake(c,crit?4:2);
    c.floats.push({id:rid(),x:c.heroX,val:dmg,crit,color:"#FF6B6B",born:Date.now()});
    if(c.heroHP<=0){c.heroHP=0;c.status="lost";}
  });
}

/* -------- main simulation tick (33ms, as in the app) -------- */
let lastTick = Date.now();
function tick() {
  const now = Date.now();
  const dt = Math.min(0.1, (now - lastTick) / 1000);
  lastTick = now;
  const c = combat;
  if (!c) return;
  // ---- settle phase: the fight is decided, hold on the banner a beat so the
  // kill and the victory actually get drawn before the reward screen ----
  if (c.status !== "fight") {
    if (!c._ended && now >= (c.endAt || 0)) { c._ended = true; handleCombatEnd(c); }
    return;
  }
  // ---- entry phase: enemy lands, nobody swings yet ----
  if (now - (c.startAt || 0) < RULES.FIGHT_ENTRY_MS) return;
  const dv = D;
  const wt = WEAPON_TYPES[dv.weapon] || WEAPON_TYPES.epee;

  const regenPct = dv.regen + fxVal(c, "buffs", "regen");
  if (regenPct > 0 && c.heroHP < c.heroMaxHP) {
    c.heroHP = Math.min(c.heroMaxHP, c.heroHP + regenPct / 100 * c.heroMaxHP * dt);
  }
  if(c.ctx==="arenaLive"){
    const ae=c.enemies.find(e=>e.alive&&e.arenaProfile);
    if(ae){
      const ap=ae.arenaProfile,nowA=Date.now();
      const regBuff=(ae._arenaRegen&&nowA<ae._arenaRegen.until)?ae._arenaRegen.value:0;
      const reg=(ap.regen||0)+regBuff;if(reg>0)ae.hp=Math.min(ae.maxHP,ae.hp+ae.maxHP*(reg/100)*dt);
      if(ap.petElem==="feu"){c._arenaBotBurn=(c._arenaBotBurn||0)+dt;if(c._arenaBotBurn>=1){c._arenaBotBurn=0;let bd=ap.damage*.06*(ap.petElem==="toxique"?1.10:1);bd*=1-heroDmgRed(c)/100;c.heroHP-=Math.max(1,Math.floor(bd));if(c.heroHP<=0){c.heroHP=0;c.status="lost";}}}
      const poison=(c._arenaHeroPoison&&nowA<c._arenaHeroPoison.until)?c._arenaHeroPoison.value:0;
      if(poison>0){c._arenaPoisonTick=(c._arenaPoisonTick||0)+dt;if(c._arenaPoisonTick>=1){c._arenaPoisonTick=0;let pd=c.heroMaxHP*(poison/100)/8*(ap.petElem==="toxique"?1.10:1);pd*=1-heroDmgRed(c)/100;c.heroHP-=Math.max(1,Math.floor(pd));if(c.heroHP<=0){c.heroHP=0;c.status="lost";}}}
      (ap.skills||[]).forEach((entry,i)=>{const def=entry.def||entry;if(!def)return;const key='b'+i;if(c.botSkillCds[key]==null)c.botSkillCds[key]=.8+i*.55;c.botSkillCds[key]-=dt;if(c.botSkillCds[key]>0)return;const lv=entry.level||1,stars=entry.stars||0,cd=Math.max(1,def.cd*(1-Math.min(80,ap.skillCd||0)/100));c.botSkillCds[key]=cd;
        if(def.mult){const mult=skillMult(def)*(1+(lv-1)*SKILL_LEVEL_GROWTH)*ascendPowerMul(stars,'skill');let sd=ap.damage*mult*(1+(ap.skillDmg||0)/100);sd*=1-heroDmgRed(c)/100;if(ap.petElem==='toxique')sd*=1.10;const vuln=(c._arenaHeroVuln&&nowA<c._arenaHeroVuln.until)?c._arenaHeroVuln.value:0;sd*=1+vuln/100;c.heroHP-=Math.max(1,Math.floor(sd));c.floats.push({id:rid(),x:c.heroX,val:Math.floor(sd),crit:false,color:def.color||'#C79BFF',born:nowA,text:def.name});if(c.heroHP<=0){c.heroHP=0;c.status='lost';}}
        if(def.heal){const h=ae.maxHP*skillHeal(def,lv)/100;ae.hp=Math.min(ae.maxHP,ae.hp+h);}
        if(def.eff){const ef=skillEff(def,lv),until=nowA+ef.dur*1000;if(ef.stat==='dmg')ae._arenaForce={value:ef.value,until};else if(ef.stat==='dmgRed')ae._arenaRempart={value:ef.value,until};else if(ef.stat==='haste')ae._arenaHaste={value:ef.value,until};else if(ef.stat==='regen')ae._arenaRegen={value:ef.value,until};else if(ef.stat==='slow')c._arenaHeroSlow={value:ef.value,until};else if(ef.stat==='vuln')c._arenaHeroVuln={value:ef.value,until};else if(ef.stat==='poison')c._arenaHeroPoison={value:ef.value,until};}
      });
    }
  }
  // Poison ticks on the whole wave for as long as the debuff lasts
  // Feu familiars burn the wave once a second
  if (petElemOf(c, dv) === "feu") {
    c._burnAcc = (c._burnAcc || 0) + dt;
    if (c._burnAcc >= 1) {
      c._burnAcc = 0;
      c.enemies.filter((e) => e.alive).forEach((e) =>
        applyDamageToEnemy(c, e, Math.max(1, Math.floor(dv.damage * 0.06)), false, "#FF7A3D", "dot"));
    }
  }
  // Braise: embers stack on the hero and only a heal clears them
  if (c.burn > 0) {
    c._burnHero = (c._burnHero || 0) + dt;
    if (c._burnHero >= 1) {
      c._burnHero = 0;
      const b = Math.max(1, Math.floor(c.heroMaxHP * 0.005 * c.burn));
      c.heroHP -= b;
      c.floats.push({ id: rid(), x: c.heroX, val: b, crit: false, color: "#FF7A3D", born: now });
      if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
    }
  }
  const poisonPct = fxVal(c, "debuffs", "poison");
  if (poisonPct > 0) {
    c._poisonAcc = (c._poisonAcc || 0) + dt;
    if (c._poisonAcc >= 1) {
      c._poisonAcc = 0;
      c.enemies.filter((e) => e.alive).forEach((e) =>
        applyDamageToEnemy(c, e, Math.max(1, Math.floor(e.maxHP * poisonPct / 100 / 8)), false, "#7ED321", "dot"));
    }
  }
  c.heroAttacking = Math.max(0, c.heroAttacking - dt);
  c.heroHit = Math.max(0, c.heroHit - dt);

  const alive = c.enemies.filter((e) => e.alive);
  const target = alive.sort((a, b) => a.x - b.x)[0];

  // ---- HERO ----
  // Stunned means stunned: no step, no swing, no skill. Cooldowns keep running,
  // so a stun costs you the window rather than resetting your rotation.
  c.heroStun = Math.max(0, (c.heroStun || 0) - dt);
  if (target && !(c.heroStun > 0)) {
    const dist = target.x - c.heroX;
    const inRange = dist <= wt.range + 2;
    // Range used to be checked for melee only, so a bow with 220 of reach still
    // fired at a target 240 away. Everyone closes to their own range now.
    if (!inRange) {
      const wob = 0.88 + 0.2 * Math.sin(now / 230);
      c.heroX = Math.min(target.x - wt.range, c.heroX + dv.moveSpeed * dt * wob);
    } else {
      c.heroAtkCd -= dt;
      if (c.heroAtkCd <= 0) {
        c.heroAtkCd = (1 / (dv.attackSpeed * wt.speed * (1 + fxVal(c, "buffs", "hate") / 100)))
          * (0.88 + Math.random() * 0.24) * (target.arenaProfile && target.arenaProfile.petElem === "glace" ? 1.12 : 1)
          * (c._arenaHeroSlow && Date.now()<c._arenaHeroSlow.until ? 1+c._arenaHeroSlow.value/100 : 1);
        c.heroAttacking = 0.2;
        // weapon-type affixes only apply to the matching attack type
        const styleMul = wt.attackType === "MELEE"
          ? 1 + (dv.meleeDmg || 0) / 100
          : 1 + (dv.rangedDmg || 0) / 100;
        // "Double attaque": the swing may immediately land a second time
        const swings = Math.random() * 100 < (dv.doubleAtk || 0) ? 2 : 1;
        const buffDmg = 1 + fxVal(c, "buffs", "force") / 100;
        const vuln = 1 + fxVal(c, "debuffs", "vuln") / 100;
        const swingDelay = wt.attackType === "MELEE" ? HIT_DELAY_MELEE : HIT_DELAY_RANGED;
        for (let sw = 0; sw < swings; sw++) {
          // anything that blunts the hero's swing stacks here, floored at 30%
          // of his damage so no combination can read as doing nothing at all
          const blunt = Math.min(70, fxVal(c, "debuffs", "intimide") + fxVal(c, "debuffs", "cendre"));
          let dmg = dv.damage * (wt.hit || 1) * styleMul * buffDmg * vuln * (1 - blunt / 100);
          const crit = Math.random() * 100 < dv.critChance;
          if (crit) dmg *= dv.critMult;
          if (c.boss) dmg *= (1 + dv.bossDmg / 100);
          dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));
          const col = sw ? "#FFC29B" : "#FFE9A8";
          const steal = dv.lifesteal;
          scheduleHit(c, swingDelay, () => {
            if (!target.alive) return;
            applyDamageToEnemy(c, target, dmg, crit, col, "weapon");
            if (steal > 0) c.heroHP = Math.min(c.heroMaxHP, c.heroHP + dmg * steal / 100);
          });
        }
        if (wt.attackType === "RANGED") {
          c.projs.push({ id: rid(), x: c.heroX + 20, toX: target.x,
            color: wt.projectile === "magic" ? "#9B5CF6" : "#E8B44A",
            kind: wt.projectile || "arrow", life: 0.35 });
        }
      }
    }
    // ---- SKILLS ----
    // Cooldowns always run; whether a ready skill fires by itself is the
    // player's call. Manual casting goes through castSkill(), which reuses this
    // very block, so the two paths can never drift apart.
    S.skillSlots.slice(0, skillSlotCount(S)).forEach((sid) => {
      if (!sid || !S.skills[sid]) return;
      const def = SKILL_DEFS.find((x) => x.id === sid);
      if (!def) return;
      c.skillCds[sid] = (c.skillCds[sid] || 0) - dt;
      if (c.skillCds[sid] <= 0 && S.autoSkills && !skillSealed(c, sid) && !skillsFizzle(c)) {
        c.skillCds[sid] = def.cd * (1 - (dv.skillCdCut || 0) / 100);
        c.skillCdMax[sid] = c.skillCds[sid];
        const fxKind = def.fx || "impact";
        // keep a few concurrent effects so a multi-skill burst reads properly,
        // but cap the list so a fast build cannot flood the arena
        c.skillFxs.push({ id: def.id, color: def.color, fx: fxKind,
          life: vfxDur(fxKind), max: vfxDur(fxKind) });
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
          c.burn = 0;   // a heal smothers the embers
          c.floats.push({ id: rid(), x: c.heroX, val: amt, crit: false, color: "#84E891", born: now, heal: true });
        }
        if (def.eff) {
          // buffs land on the hero, debuffs on the wave
          applyHeroEffect(c, def.cat === "DEBUFF" ? "debuffs" : "buffs", skillEff(def, S.skills[sid].level), now);
        }
      }
    });
  }
  c.heroX = Math.max(24, Math.min(AW - 40, c.heroX));

  // ---- ENEMIES ----
  c.enemies.forEach((e) => {
    if (!e.alive) return;
    const abs = abilitiesOf(e);
    abs.forEach((a) => { if (a.tick) a.tick(c, e, dt, now); });
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.recoil = Math.max(0, (e.recoil || 0) - dt);
    e.attacking = Math.max(0, e.attacking - dt);
    if (e.vanish > 0 || e.flying > 0 || e.stagger > 0) return;   // gone, airborne or reeling
    const dist = e.x - c.heroX;
    /* Section 19: a ranged enemy used to hold at 150, more than three times a
       sword's reach, and the hero walks at 24 against its 34. Measured, that
       cost a melee hero 7.6 s to land a first blow while being shot from 3.0 s
       -- four and a half seconds of taking fire with no answer. Holding at 110
       leaves the archer its advantage and its stand-off, without making melee a
       spectator. */
    const fireRange = e.ranged ? ENEMY_FIRE_RANGE : 40;
    // e.x is clamped to heroX + fireRange, but (x + 40) - x is not exactly 40
    // for every float, so dist could settle at 40.000000000000014 and keep the
    // enemy in the approach branch for ever -- walking on the spot, its attack
    // cooldown never ticking. It only bit melee enemies, because a ranged one
    // is still being closed on by the hero and never comes to rest.
    if (dist > fireRange + 0.01) {
      const wob = 0.86 + 0.24 * Math.sin(now / 250 + e.phase);
      e.x = Math.max(c.heroX + fireRange, e.x - ENEMY_SPEED * e.speedVar * dt * wob);
    } else {
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = (e.arenaProfile ? (1/Math.max(.1,e.arenaProfile.attackSpeed||1))*(.88+Math.random()*.24)/(e._arenaHaste&&Date.now()<e._arenaHaste.until?1+e._arenaHaste.value/100:1) : (1.15 + Math.random() * 0.5)) * (1 + fxVal(c, "debuffs", "slow") / 100)
          * (petElemOf(c, dv) === "glace" ? 1.12 : 1) * (e.frenzy ? 0.5 : 1)
          * (e.flurry > 0 ? 0.34 : 1)
          * (e.stolen && e.stolen.key === "hate" ? 1 / (1 + e.stolen.value / 100) : 1)
          * ((e.mutations || 0) >= 1 ? 0.7 : 1);
        e.attacking = 0.2;
        // Arena rivals use true hit events. Double attaque therefore creates
        // a second swing instead of doubling one damage packet.
        if(e.arenaProfile){
          const hits=Math.random()*100<(e.arenaProfile.doubleAtk||0)?2:1;
          resolveArenaBotBasicHit(c,e,dv,abs,0);
          if(hits===2)resolveArenaBotBasicHit(c,e,dv,abs,0.09);
          return;
        }
        // Hâte also grants a window to dodge outright
        const dodgePct = fxVal(c, "buffs", "hate") * 0.5;
        if (Math.random() * 100 < dodgePct) {
          c.floats.push({ id: rid(), x: c.heroX, val: 0, crit: false,
            color: "#8FC4FF", born: now, dodged: true });
          return;
        }
        // "Chance de blocage": the attack is negated outright
        if (Math.random() * 100 < (dv.blockChance || 0)) {
          c.heroHit = 0.1;
          c.floats.push({ id: rid(), x: c.heroX, val: 0, crit: false,
            color: "#8FEFF4", born: now, blocked: true });
        } else {
        let dmg = e.dmg;
        abs.forEach((a) => { if (a.outgoing) dmg = a.outgoing(c, e, dmg); });
        const crit = e.nextCrit ? true : Math.random() * 100 < 8;
        if (e.nextCrit) { e.nextCrit = false; dmg *= 1.5; }
        if (crit) dmg*=1.6*(1-dv.critRed/100);
        const totalRed = Math.min(85, dv.dmgRed + fxVal(c, "buffs", "rempart"));
        dmg = Math.floor(dmg * (1 - totalRed / 100) * (0.9 + Math.random() * 0.2));
        if (e.ranged) {
          const pk = e.type.proj || "arrow";
          c.projs.push({ id: rid(), x: e.x - 10, toX: c.heroX,
            color: pk === "magic" ? "#B15CF6" : "#CFCFCF", kind: pk, life: 0.35 });
        }
        // the hero's blows already waited for their animation; the enemy's did
        // not, so a mage's bolt landed before it had left his hand
        scheduleHit(c, e.ranged ? HIT_DELAY_RANGED : HIT_DELAY_MELEE, () => {
          if (c.status !== "fight") return;
          c.heroHP -= dmg;
          c.heroHit = 0.22;
          abs.forEach((a) => { if (a.onLand) a.onLand(c, e); });
          addShake(c, crit ? 4 : 2);
          c.floats.push({ id: rid(), x: c.heroX, val: dmg, crit, color: "#FF6B6B", born: Date.now() });
          if (c.heroHP <= 0) { c.heroHP = 0; c.status = "lost"; }
        });
        }
      }
    }
    e.x = Math.max(c.heroX + 30, Math.min(AW - 24, e.x));
  });

  // hits land before the win check, so a killing blow ends the wave on its frame
  runDueHits(c, now);
  cullMinions(c);

  // ---- projectiles / floats / fx ----
  c.projs = c.projs.map((p) => {
    p.x += (p.toX - p.x) * 0.5; p.life -= dt; return p;
  }).filter((p) => p.life > 0);
  c.floats = c.floats.filter((f) => now - f.born < 900);
  if (c.skillFxs.length) {
    c.skillFxs.forEach((f) => { f.life -= dt; });
    c.skillFxs = c.skillFxs.filter((f) => f.life > 0);
  }

  // ---- win check ----
  if (c.status === "fight" && !c.enemies.some((e) => e.alive)) {
    if (c.pending > 0) {
      c.pending -= 1;
      const rbw = c.pending === 0 ? RAID_BOSSES[c.raidId] : null;   // final wave = the boss
      const t = rbw
        ? Object.assign({}, ENEMY_TYPES[1], { id: "raidboss", name: rbw.name, img: rbw.img,
            ranged: !!rbw.ranged, proj: rbw.proj || "magic" })
        : ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      c.enemies = [makeEnemy("raid", { type: t, name: rbw ? rbw.name : undefined,
        tier: rbw ? rbw.tier : undefined, boss: !!rbw, abils: rbw ? rbw.abils : null,
        raidId: c.raidId, raidLevel: c.raidLevel, x: AW - 60 })];
      c.startAt = now;   // short entry beat between waves too
    } else {
      c.status = "won";
    }
  }

  // decided this tick? start the hold rather than ending immediately.
  // The step that completes a floor holds longer so the climb stays legible.
  if (c.status === "won" || c.status === "lost") {
    const clearsFloor = c.status === "won" && c.ctx === "campaign" &&
      c.step >= RULES.STEPS_PER_FLOOR;
    c.endAt = now + RULES.FIGHT_HOLD_MS + (clearsFloor ? RULES.FLOOR_CLEAR_MS : 0);
  }
}

let treeRefund = 0;      // PE handed back when the tree was rebuilt
let bossReward = null;   // surfaced by the UI right after a first Boss clear
let notable = null;      // milestone worth a toast, drained on the next render
let rewardNotice = null;  // récompenses de combat, affichées sans interrompre le jeu
let skipNotice = null;    // détail d’un étage sauté
let timerNoticeSeen = { tree: null, eggs: {} }; // évite de répéter les notifications de fin

function addPaidFloorRewards(floor, gold, exp) {
  if (floorRewardPaid.floor !== floor) {
    floorRewardPaid = { floor, gold: 0, exp: 0 };
  }
  floorRewardPaid.gold += Math.max(0, Math.floor(gold || 0));
  floorRewardPaid.exp += Math.max(0, Math.floor(exp || 0));
}
function takePaidFloorRewards(floor) {
  if (floorRewardPaid.floor !== floor) return { gold: 0, exp: 0 };
  const out = { gold: floorRewardPaid.gold, exp: floorRewardPaid.exp };
  floorRewardPaid = { floor: null, gold: 0, exp: 0 };
  return out;
}

function handleCombatEnd(c) {
  if (c.ctx === "arenaLive") {
    const won=c.status==="won",cb=c.onEnd;
    if(cb)cb(won);
    return;
  }
  if (c.ctx === "raid" || c.ctx === "mega") {
    const won = c.status === "won";
    const cb = c.onEnd;
    combat = null;
    if (cb) cb(won);
    return;
  }
  const won = c.status === "won";
  update((s) => {
    const dv = computeDerived(s);
    const earnedGold = Math.floor(rewardAcc.gold * (1 + dv.goldBonus / 100) * goldMul(s));
    const earnedExp = Math.floor(rewardAcc.exp * (1 + dv.expBonus / 100));
    s.gold += earnedGold;
    s.exp += earnedExp;
    addPaidFloorRewards(c.floor, earnedGold, earnedExp);
    rewardAcc.gold = 0; rewardAcc.exp = 0;
    grantLevels(s);

    // Une seule notification par étage : les flush intermédiaires ont déjà crédité
    // le joueur, mais leurs montants sont conservés dans floorRewardPaid.
    const floorFinished = won && c.step >= RULES.STEPS_PER_FLOOR;
    if (floorFinished || !won) {
      const paid = takePaidFloorRewards(c.floor);
      rewardNotice = { gold: paid.gold, exp: paid.exp, boss: !!c.boss, floor: c.floor };
    }
    if (won) {
      // a floor clears every half minute, so only the milestones get a toast
      if (c.elite && !c.boss) {
        notable = { msg: "Élite vaincue · étage " + c.floor, icon: "swords" };
      }
      if (s.floor + 1 > s.recordFloor) notable = { msg: "Nouveau record · étage " + (s.floor + 1), icon: "trophy" };
      if (c.boss) {
        const bk = String(c.floor);
        s.bossClears[bk] = true;
        notable = c.floor === 50
          ? { msg: "Boss 50 vaincu · MÉGA BOSS débloqué !", icon: "crown" }
          : { msg: "Boss vaincu · étage " + c.floor, icon: "trophy" };
        // the accelerator is tied to the FIRST clear and never repeats
        if (!s.bossRewardsClaimed[bk]) {
          s.bossRewardsClaimed[bk] = true;
          const rw = bossFirstClearReward(c.floor);
          if (rw) {
            s.accels[rw.key] = (s.accels[rw.key] || 0) + rw.qty;
            bossReward = { floor: c.floor, key: rw.key, qty: rw.qty, megaFloor: false };
          }
        }
        s.eventProgress.hard = (s.eventProgress.hard || 0) + 1;
      }
      s.eventProgress.floors = (s.eventProgress.floors || 0) + 1;
      if (c.boss) {
        s.pendingBossFloor = 0; s.step = 1; s.floor += 1;
      } else if (s.step < campaignWaveCount(s.floor)) s.step += 1;
      else {
        const clearedFloor = s.floor;
        s.step = 1;
        const pendingBoss = Number(s.pendingBossFloor || 0);
        if (!(pendingBoss && pendingBoss === s.floor + 1)) s.floor += 1;
        // Saut d'étage : uniquement après un étage dont tous les ennemis étaient verts,
        // et jamais si l'étage à sauter est un Élite, un Boss ou un Méga Étage.
        const nextFloor = s.floor;
        const weakFight = !c.boss && !c.elite && c.enemies.length > 0 &&
          c.enemies.every((e) => threatOf(c, e) === "easy");
        const skipPct = rb(s, "floorSkip");
        if (!(pendingBoss && pendingBoss === s.floor + 1) && weakFight && skipPct > 0 && !isElite(nextFloor) && !isBoss(nextFloor) && !isMegaFloor(nextFloor) &&
            Math.random() * 100 < skipPct) {
          let kills = 0;
          for (let stp = 1; stp <= RULES.STEPS_PER_FLOOR; stp++) kills += enemyCount(nextFloor, stp);
          const skipGoldBase = kills * goldReward(nextFloor);
          const skipExpBase = kills * expReward(nextFloor);
          const skipGold = Math.floor(skipGoldBase * (1 + dv.goldBonus / 100) * goldMul(s));
          const skipExp = Math.floor(skipExpBase * (1 + dv.expBonus / 100));
          s.gold += skipGold; s.exp += skipExp; grantLevels(s);
          s.eventProgress.floors = (s.eventProgress.floors || 0) + 1;
          skipNotice = { floor: nextFloor, gold: skipGold, exp: skipExp };
          s.floor += 1;
        }
        floorFlash = { floor: s.floor, until: Date.now() + RULES.FLOOR_FLASH_MS };
      }
      s.recordFloor = Math.max(s.recordFloor, s.floor);
      if (isCheckpoint(s.floor)) s.checkpoint = Math.max(s.checkpoint, s.floor);
    } else {
      const cp = Math.max(s.checkpoint, 1);
      if (c.boss) { s.pendingBossFloor = s.floor; s.floor = Math.max(1, s.floor - 1); }
      else s.floor = Math.max(cp, s.floor - 1);
      s.step = 1;
    }
  });
  setTimeout(startCampaign, 40);
}

/* -------- periodic reward flush (live gold, as in the app) -------- */
function flushRewards() {
  const c = combat;
  if (!c || c.ctx !== "campaign") return;
  if (rewardAcc.gold <= 0 && rewardAcc.exp <= 0) return;
  update((st) => {
    const dv = computeDerived(st);
    const paidGold = Math.floor(rewardAcc.gold * (1 + dv.goldBonus / 100) * goldMul(st));
    const paidExp = Math.floor(rewardAcc.exp * (1 + dv.expBonus / 100));
    st.gold += paidGold;
    st.exp += paidExp;
    addPaidFloorRewards(c.floor, paidGold, paidExp);
    rewardAcc.gold = 0; rewardAcc.exp = 0;
    grantLevels(st);
  });
}

/* =========================================================================
   ACTIONS
   ========================================================================= */
function allocStat(key, pts) {
  update((s) => {
    const n = Math.min(pts, s.statPoints);
    if (n <= 0) return;
    s.stats[key] += n; s.statPoints -= n;
  });
}

/* Mastery raised the odds of a high rarity, but nothing stopped one appearing
   at Forge 3 -- a lucky early roll handed out a Mythique that outclassed
   everything the next twenty levels could forge, and the climb lost its point.
   Each tier now has a floor. A roll above what the Forge can produce steps down
   to the best tier it can, so the odds are never wasted, they just land lower. */
const RARITY_MIN_FORGE = {
  COMMUN: 1, RARE: 1, EPIQUE: 6, MYTHIQUE: 14,
  ARTEFACT: 22, LEGENDAIRE: 30, INFERNAL: 37, IMMORTEL: 43, DIVIN: 48,
};
function rarityAllowed(rarity, forgeLevel) {
  return forgeLevel >= (RARITY_MIN_FORGE[rarity] || 1);
}
/* The gate was real in the roll but not in the rates: getRates still handed a
   locked tier its share, capRarityForForge quietly stepped that roll down, and
   every panel went on printing the ungated number. So the Forge promised 2.7%
   Epique at level 8 and delivered 4.2%, and the upgrade preview listed Mythique
   odds six levels before Mythique could exist -- a blockade you could only see,
   never feel. Fold a locked tier's weight into the highest unlocked one here,
   once, and let the roll and every display read the same table. */
function gateForgeRates(rates, forgeLevel) {
  const out = Object.assign({}, rates);
  let top = EQUIP_RARITY_ORDER[0];
  EQUIP_RARITY_ORDER.forEach((r) => { if (rarityAllowed(r, forgeLevel)) top = r; });
  EQUIP_RARITY_ORDER.forEach((r) => {
    if (rarityAllowed(r, forgeLevel)) return;
    out[top] = (out[top] || 0) + (out[r] || 0);
    out[r] = 0;
  });
  return out;
}
/* Kept as a guard rather than a step: with gated rates a roll can no longer
   land on a locked tier, but nothing downstream should depend on that. */
function capRarityForForge(rarity, forgeLevel) {
  let i = EQUIP_RARITY_ORDER.indexOf(rarity);
  while (i > 0 && !rarityAllowed(EQUIP_RARITY_ORDER[i], forgeLevel)) i -= 1;
  return EQUIP_RARITY_ORDER[i];
}
/* What the eight tiers mean, in one place, behind the (i). */
/* Section 14's filter, one row per rarity. Tapping a row keeps or discards it;
   discarded rarities are recycled the moment the Forge strikes them. A rarity
   the current Forge level cannot roll is shown greyed, because turning it off
   would change nothing today and everything the day it unlocks. */
function showForgeFilterPicker() {
  const lv = S.forge.level;
  const rows = EQUIP_RARITY_ORDER.map((r) => {
    const c = RARITY[r].c;
    const kept = S.forge.keep[r] !== false;
    const reachable = rarityAllowed(r, lv);
    return '<div class="itemRow" style="border-left-color:' + c + ";opacity:" + (reachable ? 1 : 0.45) +
      '" data-act="forgeKeep" data-arg="' + r + '">' +
      '<div class="imini" style="width:22px;height:22px;border-color:' + c + '80">' +
        ic(kept ? "bag" : "trash", 12) + "</div>" +
      '<div class="flex1"><div class="b small" style="color:' + c + '">' + RARITY[r].label + "</div>" +
      '<div class="mute tiny b">' + (kept ? "gardé · va dans l'Inventaire"
        : "recyclé en poussière") +
        (reachable ? "" : " · hors de portée à la Forge " + lv) + "</div></div>" +
      '<div class="tgl ' + (kept ? "on" : "off") + '" style="pointer-events:none"><i></i></div>' +
      "</div>";
  }).join("");
  openModal(
    '<div class="mute tiny" style="line-height:1.45;margin-bottom:2px">' +
      "Les raretés décochées sont recyclées dès la sortie de la Forge, " +
      "pour la même poussière que l'Inventaire aurait payée.</div>" +
    '<div class="row gap6 mt8">' +
      btn(ic(S.forge.filter ? "check" : "cross", 13) +
          (S.forge.filter ? "Filtre actif" : "Filtre inactif"),
        { cls: S.forge.filter ? "purple" : "dark", small: true, act: "forgeFilterToggle" }) +
      btn("Tout garder", { cls: "ghost", small: true, act: "forgeKeepAll" }) +
    "</div>" +
    '<div class="mt6">' + rows + "</div>" +
    '<div class="mt6">' + btn("Fermer", { cls: "ghost", small: true, act: "closeModal" }) + "</div>",
    "Filtre de Forge");
}
function showRarityInfo() {
  const lv = S.forge.level;
  const rates = gateForgeRates(getRates("forge", lv, S.ascension, starsOf(S, "forge")), lv);
  const rows = EQUIP_RARITY_ORDER.map((r) => {
    const c = RARITY[r].c;
    const min = RARITY_MIN_FORGE[r] || 1;
    const ok = rarityAllowed(r, lv);
    const rate = ok ? (rates[r] || 0) : 0;
    return '<div class="itemRow" style="border-left-color:' + c + ";opacity:" + (ok ? 1 : 0.45) + '">' +
      '<div class="imini" style="width:22px;height:22px;border-color:' + c + '80;box-shadow:0 0 8px ' + c + '3d">' +
        ic("swords", 12) + "</div>" +
      '<div class="flex1"><div class="b small" style="color:' + c + '">' + RARITY[r].label +
        '<span class="mute" style="font-weight:700"> ×' + RARITY_MUL[r] + " puissance</span></div>" +
      '<div class="mute tiny b">' + (ok
        ? "Forge " + min + "+ · " + rate.toFixed(rate < 10 ? 1 : 0) + "% par forge"
        : "Débloqué à Forge " + min) + "</div></div>" +
      (ok ? '<span class="pill" style="color:' + c + ";border-color:" + c + '99">' +
        rate.toFixed(rate < 10 ? 1 : 0) + "%</span>"
          : '<span class="pill">' + ic("lock", 9) + min + "</span>") +
      "</div>";
  }).join("");
  openModal(
    '<div class="dim tiny" style="margin-bottom:6px;line-height:1.45">La rareté fixe la puissance de base d\'un objet. ' +
      "Chaque palier demande un niveau de Forge minimum : monter la Forge ouvre les paliers, " +
      "monter sa Maîtrise améliore les chances à l\'intérieur de ceux déjà ouverts.</div>" +
    rows +
    '<div class="mute tiny center mt6">Forge niv.' + lv + " · " +
      EQUIP_RARITY_ORDER.filter((r) => rarityAllowed(r, lv)).length + " paliers sur " +
      EQUIP_RARITY_ORDER.length + " ouverts</div>" +
    '<div class="mt8">' + btn("Fermer", { cls: "ghost", small: true, act: "closeModal" }) + "</div>",
    "Raretés d\'équipement");
}
function forgeSummon(n) {
  const results = [];
  update((st) => {
    for (let i = 0; i < n; i++) {
      const cost = forgeCost(st.forge.level);
      if (st.minerai < cost) break;
      st.minerai -= cost;
      const rates = gateForgeRates(
        getRates("forge", st.forge.level, st.ascension, starsOf(st, "forge")), st.forge.level);
      // one paid forge; the tree's "Forge gratuite" nodes may add a second
      // result at no extra cost
      const extra = Math.random() * 100 < treeSum(st, "forgeFree") ? 1 : 0;
      for (let k = 0; k <= extra; k++) {
        const rar = capRarityForForge(rollRarity(rates, EQUIP_RARITY_ORDER), st.forge.level);
        const item = makeItem(SLOTS[Math.floor(Math.random() * SLOTS.length)], rar, st.forge.level);
        // a rarity the filter does not keep never reaches the bag
        if (forgeKeeps(st, rar)) {
          st.inventory.push(item);
          results.push({ rarity: rar, slot: item.slot, power: item.power, free: k > 0 });
        } else {
          const dust = dustValue(st, item);
          st.poussiere += dust;
          results.push({ rarity: rar, slot: item.slot, power: item.power, free: k > 0,
            recycled: true, dust: dust });
        }
      }
      st.forge.summonCount += 1;
    }
    st.eventProgress.forge = (st.eventProgress.forge || 0) + results.length;
  });
  return results;
}

/* tree-adjusted forge upgrade cost & duration. The cost branch is 5 levels of
   -5%, so -25% is the real ceiling; the old 70 cap was never reachable. */
const FORGE_COST_CUT_CAP = 25;
function forgeUpgCostFor(s) {
  // the family stores a negative per level; the discount is its magnitude
  const cut = Math.min(FORGE_COST_CUT_CAP, Math.abs(treeSum(s, "forgeCost")));
  return Math.max(1, Math.floor(forgeUpgradeCost(s.forge.level) * (1 - cut / 100)));
}
/* Section 11: past Forge 20 an upgrade takes a multiple of its normal time, by
   tier. A single lookup, so the tiers can never stack -- level 30 is x5 flat,
   not x3 then x5. forgeUpgradeTime is left exactly as it was: the multiplier is
   applied to what it returns, not folded into it. */
function forgeTimeTierMul(level) {
  return level >= 50 ? 9 : level >= 40 ? 7 : level >= 30 ? 5 : level >= 20 ? 3 : 1;
}
function forgeUpgTimeFor(s) {
  const normal = forgeUpgradeTime(s.forge.level) * forgeTimeTierMul(s.forge.level);
  // speed, like the research and hatch families: divide, do not shave
  return Math.max(0, Math.round(normal / (1 + treeSum(s, "forgeTime") / 100)));
}
function upgradeForge() {
  if (S.forge.level >= RULES.FORGE_MAX) return { ok: false, reason: "max" };
  if (S.forge.upgradeEnd > Date.now()) return { ok: false, reason: "busy" };
  const cost = forgeUpgCostFor(S);
  if (S.gold < cost) return { ok: false, reason: "gold" };
  const time = forgeUpgTimeFor(S);
  update((st) => {
    st.gold -= cost;
    if (time <= 0) st.forge.level += 1;
    else st.forge.upgradeEnd = Date.now() + time * 1000;
  });
  return { ok: true, instant: time <= 0 };
}
function collectForgeUpgrade() {
  update((s) => {
    if (!s.forge.upgradeEnd || Date.now() < s.forge.upgradeEnd) return;
    s.forge.level += 1; s.forge.upgradeEnd = 0;
  });
}
/* Auto-Forge has its own persistent scheduler. It is deliberately independent
   from the result/filter logic: finding or keeping a wanted item must NEVER
   stop the loop. The scheduler keeps polling even when Minerai is temporarily
   insufficient, so passive/claimed Minerai can make it resume automatically. */
let autoForgeTimer = null;
function scheduleAutoForge(delay) {
  if (autoForgeTimer !== null) return;
  autoForgeTimer = setTimeout(() => {
    autoForgeTimer = null;
    if (!S.forge.autoForge) return;
    try {
      if (S.minerai >= forgeCost(S.forge.level)) forgeSummon(1);
    } catch (err) {
      console.error("auto-forge tick failed", err);
    } finally {
      // Re-arm unconditionally while AUTO is enabled. A good drop, a filter
      // match, a modal or a temporary lack of Minerai cannot cancel AUTO.
      if (S.forge.autoForge) scheduleAutoForge(1500);
    }
  }, Math.max(0, delay == null ? 1500 : delay));
}
function toggleAutoForge() {
  update((s) => { s.forge.autoForge = !s.forge.autoForge; });
  if (S.forge.autoForge) scheduleAutoForge(0);
  else if (autoForgeTimer !== null) { clearTimeout(autoForgeTimer); autoForgeTimer = null; }
}

/* ------------------------------ filtre de Forge ------------------------------
   Section 14. Mass forging buries the bag in Commun. The filter lets the player
   name the rarities worth keeping; everything else is recycled the moment it is
   struck, for the same Poussiere the Inventory would have paid.

   It is off by default and every rarity starts kept, so nothing is ever
   destroyed until the player asks for it. It applies to whatever the Forge
   produces -- the x20, the single press, and the automatic forge alike, since
   the point is not to have to sort afterwards. */
function forgeFilterOn(s) { return !!s.forge.filter; }
function forgeKeeps(s, rar) { return !forgeFilterOn(s) || s.forge.keep[rar] !== false; }
function forgeDiscarded(s) { return EQUIP_RARITY_ORDER.filter((r) => s.forge.keep[r] === false); }
function toggleForgeFilter() {
  update((s) => { s.forge.filter = !s.forge.filter; });
}
function toggleForgeKeep(rar) {
  update((s) => {
    const next = s.forge.keep[rar] === false;
    // refuse to let the filter throw away everything: one rarity must remain
    if (!next && EQUIP_RARITY_ORDER.every((r) => r === rar || s.forge.keep[r] === false)) return;
    s.forge.keep[rar] = next;
  });
}
function setForgeKeepAll(v) {
  update((s) => { EQUIP_RARITY_ORDER.forEach((r) => { s.forge.keep[r] = v; }); });
}

/* Section 13: a batch plays ONE animation and then produces everything at once.
   forgeAnim holds the batch that is in flight; while it is set the buttons are
   replaced by the animation and a second press is ignored, so a x20 can never
   become twenty animations. Nothing is rolled until it finishes -- the pieces
   are generated together, at the end. */
const FORGE_ANIM_MS = 2000;
let forgeAnim = null;
function forgeAnimActive() { return !!forgeAnim; }
function startForgeBatch(n) {
  if (forgeAnim) return false;
  const count = Math.max(1, parseInt(n, 10) || 1);
  if (S.minerai < forgeCost(S.forge.level)) { toast("Minerai insuffisant"); return false; }
  const mine = { n: count, until: Date.now() + FORGE_ANIM_MS };
  forgeAnim = mine;
  scheduleRender();
  setTimeout(() => {
    // if this batch was cleared or replaced meanwhile, it produces nothing
    if (forgeAnim !== mine) return;
    forgeAnim = null;
    const r = forgeSummon(mine.n);
    if (r.length) showForgeResult(r); else toast("Minerai insuffisant");
    scheduleRender();
  }, FORGE_ANIM_MS);
  return true;
}

function equipItem(id) {
  update((s) => {
    const it = s.inventory.find((x) => x.id === id);
    if (!it) return;
    s.inventory = s.inventory.filter((x) => x.id !== id);
    const prev = s.equipped[it.slot];
    s.equipped[it.slot] = it;
    if (prev) s.inventory.push(prev);
  });
}
function unequipItem(slot) {
  update((s) => {
    const it = s.equipped[slot];
    if (!it) return;
    s.equipped[slot] = null;
    s.inventory.push(it);
  });
}
/* What a piece is worth as Poussiere. The Inventory and the Forge filter must
   pay the same, so the formula lives here and takes the state it reads. */
function dustValue(s, it) {
  /* Le recyclage se base sur la puissance originale, jamais sur la puissance
     gonflée par les améliorations Poussière : aucune boucle de remboursement. */
  const original = Math.max(0, it.originalPower != null ? it.originalPower :
    ((it.baseDamage || 0) + (it.baseHp || 0)) || it.power || 0);
  return Math.floor(((equipRank(it.rarity) + 1) * 5 + original * 0.2)
    * (1 + treeSum(s, "dust") / 100));
}
function recycleItem(id) {
  const it = S.inventory.find((x) => x.id === id);
  if (!it) return 0;
  const dust = dustValue(S, it);
  update((st) => {
    st.inventory = st.inventory.filter((x) => x.id !== id);
    st.poussiere += dust;
  });
  return dust;
}
function itemUpgradeCost(it) { return Math.round(20 + it.level * 12); }
function itemUpgradePreview(it) {
  if (!it) return { label:"Stat", current:0, next:0, gain:0 };
  const anchorLevel = it.upgradeBaseLevel || 0;
  const steps = Math.max(0, (it.level || 0) + 1 - anchorLevel);
  let current, next, label;
  if (it.baseDamage) {
    current = Number(it.damage || 0);
    next = Math.round(Number(it.baseDamage || 0) * (1 + steps * 0.005) * 100) / 100;
    label = "ATQ";
  } else {
    current = Number(it.hp || 0);
    next = Math.round(Number(it.baseHp || 0) * (1 + steps * 0.005) * 100) / 100;
    label = "PV";
  }
  return { label, current, next, gain: Math.round((next - current) * 100) / 100 };
}
/* Jusqu'à +99, l'amélioration est garantie. À partir de +100, -5 points de
   réussite tous les 10 niveaux, avec un plancher de 35 %. Les Sceaux de
   stabilité ajoutent +5 points chacun. Un échec ne détruit ni l'objet ni son
   niveau : seule la Poussière (et les Sceaux choisis) est consommée. */
function itemUpgradeChance(it) {
  if ((it.level || 0) < 100) return 100;
  return Math.max(35, 95 - Math.floor(((it.level || 0) - 100) / 10) * 5);
}
const itemSealPlan = {};
function itemSealCount(id) { return Math.max(0, itemSealPlan[id] || 0); }
function upgradeItem(id) {
  let result = { ok:false, reason:"missing", chance:0 };
  update((s) => {
    let it = Object.values(s.equipped).find((x) => x && x.id === id) || s.inventory.find((x) => x.id === id);
    if (!it) return;
    const cost = itemUpgradeCost(it);
    if (s.poussiere < cost) { result.reason="dust"; return; }
    const baseChance=itemUpgradeChance(it);
    const want=Math.min(itemSealCount(id), Math.ceil((100-baseChance)/5));
    const seals=Math.min(want, (s.sanctuary && s.sanctuary.stabilitySeals) || 0);
    const chance=Math.min(100, baseChance + seals*5);
    s.poussiere -= cost;
    if (seals) s.sanctuary.stabilitySeals -= seals;
    itemSealPlan[id]=0;
    const beforeDamage = Number(it.damage || 0);
    const beforeHp = Number(it.hp || 0);
    result={ok:true, success:Math.random()*100 < chance, chance:chance, seals:seals};
    if (!result.success) return;
    it.level += 1;
    /* Poussière additive : +0,35 % de la stat de référence par niveau réussi.
       Les anciennes pièces gardent leur puissance acquise : leur valeur au moment
       de la migration devient l'ancre des améliorations futures. */
    const anchorLevel = it.upgradeBaseLevel || 0;
    const steps = Math.max(0, it.level - anchorLevel);
    if (it.baseDamage) it.damage = Math.round(it.baseDamage * (1 + steps * 0.0035) * 100) / 100;
    if (it.baseHp) it.hp = Math.round(it.baseHp * (1 + steps * 0.0035) * 100) / 100;
    it.power = Math.round((it.damage + it.hp) * 100) / 100;
    result.statGain = Math.round(((it.damage - beforeDamage) + (it.hp - beforeHp)) * 100) / 100;
    result.statLabel = it.baseDamage ? "ATQ" : "PV";
  });
  return result;
}

function summonSkill(n) {
  const results = [];
  update((s) => {
    // "Double invocation": one paid summon, a chance at a second free result.
    // Mastery still advances once per PAID summon — the tree never speeds the gauge.
    const dblChance = treeSum(s, "skillFree");
    for (let i = 0; i < n; i++) {
      const sc = skillSummonCost(s);
      if (s.eclat < sc) break;
      s.eclat -= sc;
      const rolls = Math.random() * 100 < dblChance ? 2 : 1;
      for (let r = 0; r < rolls; r++) {
        const rates = getRates("skill", s.skillMastery.level, s.ascension, starsOf(s, "skill"));
        let rar = rollRarity(rates);
        // Starter protection: the player now starts with 0 Éclat and must first earn
        // them in Raid Compétence. Its level-1 reward (75) finances exactly three
        // paid summons at the 25-Éclat base price. While Maîtrise is still 0,
        // those first summons prioritise missing Common skills until the player
        // owns three different skills. This prevents a duplicate roll from
        // blocking the 3 active slots/tutorial without giving free starter currency.
        const ownedIds = new Set(Object.keys(s.skills || {}));
        const starterMissing = (SKILLS_BY_RARITY.COMMUN || []).filter((d) => !ownedIds.has(d.id));
        let def = null;
        if (ownedIds.size < 3 && s.skillMastery.level === 0 && starterMissing.length) {
          rar = "COMMUN";
          def = starterMissing[Math.floor(Math.random() * starterMissing.length)];
        } else {
          // a tier can legitimately be empty of skills; step down rather than fail
          let ri = RARITY_ORDER.indexOf(rar);
          while (ri > 0 && !(SKILLS_BY_RARITY[rar] || []).length) { ri -= 1; rar = RARITY_ORDER[ri]; }
          const pool = SKILLS_BY_RARITY[rar] || SKILL_DEFS;
          def = pool[Math.floor(Math.random() * pool.length)];
        }
        const existing = s.skills[def.id];
        if (existing) {
          const need = skillDupesNeeded(existing.level);
          existing.count += 1;
          if (existing.count >= need && existing.level < RULES.SKILL_MAX_LEVEL) {
            existing.count -= need; existing.level += 1;
          }
          results.push({ id: def.id, rarity: rar, dup: true });
        } else {
          s.skills[def.id] = { level: 1, count: 0 };
          const empty = s.skillSlots.slice(0, skillSlotCount(s)).indexOf(null);
          if (empty >= 0) s.skillSlots[empty] = def.id;
          results.push({ id: def.id, rarity: rar, dup: false });
        }
      }
      s.skillMastery.count += 1; s.skillMastery.progress += 1;
      const mreq = masteryReq(s.skillMastery.level);
      if (s.skillMastery.progress >= mreq && s.skillMastery.level < RULES.MASTERY_MAX) {
        s.skillMastery.progress -= mreq; s.skillMastery.level += 1;
      }
    }
  });
  return results;
}
function equipSkill(slotIdx, skillId) {
  update((s) => {
    if (skillId) s.skillSlots = s.skillSlots.map((x) => (x === skillId ? null : x));
    s.skillSlots[slotIdx] = skillId;
  });
}

/* An egg is hatching when it carries a hatchEnd, and stored when it does not.
   Hatch slots limit simultaneous timers only. Stored eggs never start by themselves. */
function eggIsHatching(e) { return !!e && e.hatchEnd > 0; }
function eggsHatching(s) { return s.eggs.filter(eggIsHatching); }
function eggsStored(s) { return s.eggs.filter((e) => !eggIsHatching(e)); }
function startEgg(id) {
  let ok = false;
  update((s) => {
    if (eggsHatching(s).length >= s.eggSlots) return;
    const e = s.eggs.find((x) => x.id === id);
    if (!e || eggIsHatching(e)) return;
    const secs = EGG_TIMERS[e.rarity] / hatchSpeedFor(s, e.rarity);
    e.hatchEnd = Date.now() + secs * 1000;
    ok = true;
  });
  return ok;
}
function summonEgg(n) {
  const results = [];
  update((s) => {
    // "Double Œuf": one paid summon may yield 2 EGGS (not a double hatch) —
    // each egg keeps its own independent timer.
    const dblChance = treeSum(s, "eggFree");
    // each rarity carries its own reduction; a Rare upgrade must never touch
    // an Épique egg
    for (let i = 0; i < n; i++) {
      // Essence is the only thing that can stop a summon now
      if (s.essence < PET_SUMMON_COST) break;
      s.essence -= PET_SUMMON_COST;
      const eggsToMake = Math.random() * 100 < dblChance ? 2 : 1;
      for (let e = 0; e < eggsToMake; e++) {
        const rates = getRates("pet", s.petMastery.level, s.ascension, starsOf(s, "pet"));
        const rar = rollRarity(rates, PET_RARITY_ORDER);
        // every summoned egg enters unlimited storage; the player chooses when to hatch it
        s.eggs.push({ id: rid(), rarity: rar, species: randSpecies(), element: randElement(),
          hatchEnd: 0 });
        results.push({ rarity: rar, free: e > 0 });
      }
      s.petMastery.count += 1; s.petMastery.progress += 1;
      const mreq = masteryReq(s.petMastery.level);
      if (s.petMastery.progress >= mreq && s.petMastery.level < RULES.MASTERY_MAX) {
        s.petMastery.progress -= mreq; s.petMastery.level += 1;
      }
    }
  });
  return results;
}
function collectEgg(id) {
  update((s) => {
    const egg = s.eggs.find((e) => e.id === id);
    if (!egg || !eggIsHatching(egg) || Date.now() < egg.hatchEnd) return;
    s.eggs = s.eggs.filter((e) => e.id !== id);
    const pet = { id: rid(), rarity: egg.rarity, level: 0, applesInvested: 0,
      species: egg.species || randSpecies(), element: egg.element || randElement(),
      name: ("Familier " + (PET_RARITY_ORDER.indexOf(egg.rarity) >= 3 ? "Élite" : "")).trim() };
    s.pets.push(pet);
    if (!s.activePetId) s.activePetId = pet.id;
    s.eventProgress.hatch = (s.eventProgress.hatch || 0) + 1;
    // slot is now free; stored eggs remain waiting for a manual choice
  });
}
/* Fusion is instant. The most advanced familiar is the core: its level,
   species and element survive. Only the required extra copies are consumed,
   starting with the least upgraded, so Apple investment is never discarded. */
function fusePets(rarity) {
  const idx = PET_RARITY_ORDER.indexOf(rarity);
  const need = petFuseNeed(rarity);
  if (!need || idx < 0 || idx >= PET_RARITY_ORDER.length - 1) return { ok: false, refund: 0 };
  if (S.pets.filter((p) => p.rarity === rarity).length < need) return { ok: false, refund: 0 };
  let appleRefund = 0;
  update((st) => {
    const pool = st.pets.filter((p) => p.rarity === rarity)
      .sort((a, b) => (b.level || 0) - (a.level || 0) ||
        petAppleInvestment(b) - petAppleInvestment(a));
    const core = pool[0];
    const extras = pool.slice(1).sort((a, b) => petAppleInvestment(a) - petAppleInvestment(b) ||
      (a.level || 0) - (b.level || 0)).slice(0, need - 1);
    const consumed = [core].concat(extras);
    const eaten = consumed.map((p) => p.id);
    appleRefund = extras.reduce((sum, p) => sum + petAppleInvestment(p), 0);
    st.apples = (st.apples || 0) + appleRefund;
    st.pets = st.pets.filter((p) => eaten.indexOf(p.id) < 0);
    const nextRarity = PET_RARITY_ORDER[idx + 1];
    const np = { id: rid(), rarity: nextRarity,
      level: Math.min(core.level || 0, petMaxLevel(nextRarity)),
      applesInvested: petAppleInvestment(core),
      species: core.species || randSpecies(), element: core.element || randElement(),
      name: core.name || "Familier Fusionné" };
    st.pets.push(np);
    if (eaten.indexOf(st.activePetId || "") >= 0) st.activePetId = np.id;
    st.eventProgress.hatch = (st.eventProgress.hatch || 0) + 1;
  });
  return { ok: true, refund: appleRefund };
}
/* internal upgrade inside a rarity, paid in Apples */
function upgradePet(id) {
  const pet = S.pets.find((p) => p.id === id);
  if (!pet) return false;
  const lv = pet.level || 0;
  if (lv >= petMaxLevel(pet.rarity)) return false;
  const cost = petUpgradeCost(pet.rarity, lv);
  if ((S.apples || 0) < cost) return false;
  update((st) => {
    const p = st.pets.find((x) => x.id === id);
    if (!p) return;
    const invested = petAppleInvestment(p);
    st.apples -= cost;
    p.level = (p.level || 0) + 1;
    p.applesInvested = invested + cost;
  });
  return true;
}
function setActivePet(id) { update((s) => { s.activePetId = id; }); }
function buyEggSlot() {
  if (S.level < 10 || S.eggSlotGemBought || S.eggSlots >= RULES.EGG_SLOT_MAX || S.gems < 300) return false;
  update((st) => {
    st.gems -= 300;
    st.eggSlotGemBought = true;
    st.eggSlots = Math.min(RULES.EGG_SLOT_MAX, st.eggSlots + 1);
  });
  return true;
}

function watchAdForKey() {
  if (S.universalKeys >= RULES.UNIVERSAL_KEY_CAP || S.adKeysToday >= RULES.UNIVERSAL_KEY_DAILY) return false;
  update((st) => {
    st.universalKeys = Math.min(RULES.UNIVERSAL_KEY_CAP, st.universalKeys + 1);
    st.adKeysToday += 1;
  });
  return true;
}

/* apply the payload of one tree level — called on instant and on collect */
function applyTreeLevel(st, node) {
  st.tree.levels[node.id] = (st.tree.levels[node.id] || 0) + 1;
  if (node.effect === "eggSlot") {
    st.eggSlots = Math.min(RULES.EGG_SLOT_MAX, st.eggSlots + 1);
  }
  // raidKey grants an unassigned daily key; the player picks the raid later
}
function startResearch(id) {
  const node = TREE_BY_ID[id];
  if (!node || S.tree.active) return false;
  const lv = treeLv(S, id);
  if (lv >= node.max || !treeReqOk(S, node) || !treeAfford(S, node)) return false;
  const price = treeNextCost(S, node);
  update((st) => {
    st.pe -= price.amount;
    const t = treeTime(st, node, lv + 1);
    if (t <= 0) {
      applyTreeLevel(st, node);
    } else {
      st.tree.active = id;
      st.tree.activeLevel = lv + 1;
      st.tree.activeEnd = Date.now() + t * 1000;
    }
  });
  return true;
}
function collectResearch() {
  update((s) => {
    if (!s.tree.active || Date.now() < s.tree.activeEnd) return;
    const node = TREE_BY_ID[s.tree.active];
    s.tree.active = null; s.tree.activeLevel = 0; s.tree.activeEnd = 0;
    if (node) applyTreeLevel(s, node);
  });
}
/* assign / unassign one of the tree's bonus daily raid keys */
function assignRaidKey(raid, delta) {
  if (!RAID_IDS.includes(raid)) return false;
  const cur = (S.raidKeyAlloc || {})[raid] || 0;
  if (delta > 0 && raidKeyFree(S) <= 0) return false;
  if (delta < 0 && cur <= 0) return false;
  update((st) => { st.raidKeyAlloc[raid] = ((st.raidKeyAlloc[raid] || 0) + delta); });
  return true;
}
function useAccelerator(target, key) {
  if ((S.accels[key] || 0) <= 0) return false;
  if (target.type === "tree" && (!S.tree.active || S.tree.activeEnd <= Date.now())) return false;
  if (target.type === "egg" && !S.eggs.find((e) => e.id === target.id && e.hatchEnd > Date.now())) return false;
  if (target.type === "forge" && S.forge.upgradeEnd <= Date.now()) return false;
  update((st) => {
    const def = ACCEL_DEFS.find((a) => a.key === key);
    const secs = def.mins * 60 * (1 + treeSum(st, "accel") / 100);
    st.accels[key] -= 1;
    if (target.type === "tree") {
      st.tree.activeEnd = Math.max(Date.now(), st.tree.activeEnd - secs * 1000);
    } else if (target.type === "forge") {
      st.forge.upgradeEnd = Math.max(Date.now(), st.forge.upgradeEnd - secs * 1000);
    } else {
      const egg = st.eggs.find((e) => e.id === target.id);
      if (egg && eggIsHatching(egg)) egg.hatchEnd = Math.max(Date.now(), egg.hatchEnd - secs * 1000);
    }
  });
  return true;
}

/* floor you would land on after a rebirth */
function floorAfterRebirth(s) {
  const keepPct = rebirthKeepPct(s.rebirth.upgrades.keep || 0);
  return Math.max(1, Math.floor(s.floor * keepPct / 100));
}
/* Section 4A: the requirement is the floor you are standing on, and it is 25.
   There used to be a second rule on top -- a Rebirth must also leave you at 25
   or above -- and since you keep half your floor, that pushed the real gate out
   to 50: at floor 25 you would land at 12 and never qualify. The stated rule
   wins. Where you land afterwards is what the Conservation upgrade is for. */
function canRebirth() {
  return S.floor >= RULES.REBIRTH_UNLOCK_FLOOR;
}
function doRebirth() {
  if (!canRebirth()) return 0;
  const prGainBonus = rb(S, "prgain");
  const pr = Math.floor(prFromFloor(S.floor) * (1 + prGainBonus / 100));
  const keepPct = rebirthKeepPct(S.rebirth.upgrades.keep || 0);
  update((st) => {
    st.rebirth.pr += pr;
    st.rebirth.count += 1;
    st.warScore += pr * RULES.WAR_POINTS_PER_PR;
    st.floor = Math.max(1, Math.floor(st.floor * keepPct / 100));
    st.step = 1;
    st.checkpoint = lastCheckpoint(st.floor);
  });
  setTimeout(startCampaign, 40);
  return pr;
}
function buyRebirth(key) {
  const def = REBIRTH_UPGRADES.find((u) => u.key === key);
  const lvl = S.rebirth.upgrades[key] || 0;
  if (lvl >= def.max) return false;
  const cost = rebirthUpgCost(def, lvl);
  if (S.rebirth.pr < cost) return false;
  update((st) => { st.rebirth.pr -= cost; st.rebirth.upgrades[key] = lvl + 1; });
  return true;
}

function doAscension() {
  update((s) => {
    if (s.ascension >= 3) return;
    const gems = ASCENSION_GEMS[s.ascension];
    s.ascension += 1;
    s.gems += gems;
    s.accels.a30 = (s.accels.a30 || 0) + 2;
    RAID_IDS.forEach((r) => { s.raids[r].keys = Math.min(raidKeyCapFor(s, r), s.raids[r].keys + 2); });
    s.level = 1; s.exp = 0; s.ascensionAvailable = false;
  });
}

function eventDone(id) {
  const p = S.eventProgress;
  if (id === "login") return true;
  if (id === "floors") return (p.floors || 0) >= 5;
  if (id === "forge") return (p.forge || 0) >= 3;
  if (id === "hatch") return (p.hatch || 0) >= 2;
  if (id === "hard") return (p.hard || 0) >= 1;
  if (id === "mission") return ["login", "floors", "forge", "hatch"].every((k) => S.eventClaims[k]);
  return false;
}
function claimEvent(id) {
  update((s) => {
    if (s.eventClaims[id]) return;
    const m = EVENT_MISSIONS.find((x) => x.id === id);
    const prog = s.eventProgress;
    if (id === "floors" && (prog.floors || 0) < 5) return;
    if (id === "forge" && (prog.forge || 0) < 3) return;
    if (id === "hatch" && (prog.hatch || 0) < 2) return;
    if (id === "hard" && (prog.hard || 0) < 1) return;
    if (id === "mission" && !["login", "floors", "forge", "hatch"].every((k) => s.eventClaims[k])) return;
    s.eventClaims[id] = true;
    const map = { a1x3: ["a1", 3], a1x5: ["a1", 5], a5x3: ["a5", 3], a5x2: ["a5", 2], a15x1: ["a15", 1], a30x1: ["a30", 1] };
    const pair = map[m.accel];
    s.accels[pair[0]] = (s.accels[pair[0]] || 0) + pair[1];
  });
}

function spendGems(amount, cb) {
  if (S.gems < amount) return false;
  update((st) => { st.gems -= amount; cb(st); });
  return true;
}

function resetGame() {
  S = defaultState("Héros");
  S.power = computePower(S);
  refreshDerived();
  offlineRecap = null;
  saveNow();
  startCampaign();
  scheduleRender();
}

// TEST-ONLY: simulate one full day of time-based progress.
/* Days the save has lived through: real time since it was created, plus every
   day skipped with the test button. */
function daysElapsed(s) {
  const real = Math.floor((Date.now() - (s.firstSeen || Date.now())) / 86400000);
  return Math.max(0, real) + (s.testDays || 0) + 1;
}
function warpDay() {
  S.testDays = (S.testDays || 0) + 1;
  if (S.tree.active) S.tree.activeEnd = Date.now();
  S.eggs = S.eggs.map((e) => eggIsHatching(e)
    ? Object.assign({}, e, { hatchEnd: Date.now() }) : e);
  if (S.forge.upgradeEnd) S.forge.upgradeEnd = Date.now();
  S.lastKeyReset = ""; S.eventDay = "";
  applyDailyReset(S);
  S.lastSeen = Date.now() - 24 * 3600 * 1000;
  applyOffline(S);
  delete S._offline;
  S.power = computePower(S);
  refreshDerived();
  dirty = true;
  scheduleRender();
}

/* -------- boot -------- */
function boot() {
  const loaded = loadSave();
  S = loaded || defaultState("Héros");
  applyDailyReset(S);
  applyOffline(S);
  if (S._offline) { offlineRecap = S._offline; delete S._offline; }
  S.power = computePower(S);
  refreshDerived();
  startCampaign();

  setInterval(tick, 33);
  setInterval(flushRewards, 500);
  setInterval(checkTimerNotifications, 500); // fins d’éclosion et de recherche

  setInterval(() => { if (dirty) saveNow(); }, 8000);
  // the Récolte automatique never stops just because the player is connected
  let harvestClock = Date.now();
  setInterval(() => {
    const now = Date.now();
    const dt = (now - harvestClock) / 1000;
    harvestClock = now;
    if (dt > 0 && harvestAdvance(S, dt) > 0) dirty = true;
    if (isHarvestOpen()) refreshHarvestModal();
  }, 1000);
  // Persistent Auto-Forge scheduler. It never stops because a wanted/rare item
  // was found; only the player switching AUTO off cancels it.
  if (S.forge.autoForge) scheduleAutoForge(0);
  setInterval(() => { if (isTimerScreen()) scheduleRender(); }, 1000); // live countdowns
  window.addEventListener("beforeunload", saveNow);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveNow();
    else checkForFreshBuild(false);
  });
  // Home-screen shortcuts / standalone WebViews can keep an old document alive
  // much longer than Safari. Probe GitHub Pages on boot and whenever the page
  // is restored from the back-forward cache, without touching localStorage.
  window.addEventListener("pageshow", () => checkForFreshBuild(false));
  setTimeout(() => checkForFreshBuild(true), 1200);

  if (S.harvest && S.harvest.secs > 120) showHarvestModal();
}
