/* Combat Consolidation V156
   Single compatibility layer replacing V152 + V153.
   - Preserves smoother combat sampling and attack anticipation.
   - Preserves stronger hit/crit/death readability.
   - Aligns wave/floor pacing with 0.90s death readability.
   - Makes campaign defeat recovery deterministic instead of timer-dependent.
   - No changes to damage, HP, rewards, enemy scaling, economy or progression.
*/
(function () {
  "use strict";

  if (typeof RULES !== "undefined" && RULES) {
    RULES.FIGHT_ENTRY_MS = 300;
    RULES.FIGHT_HOLD_MS = 550;
    RULES.FLOOR_CLEAR_MS = 400;
    RULES.FLOOR_FLASH_MS = 800;
  }

  const nativeSetInterval = window.setInterval.bind(window);
  const nativeSetTimeout = window.setTimeout.bind(window);
  const VISUAL_ATTACK_WINDOW = 0.28;
  let hooked = false;
  let lastRun = performance.now();

  /* Core campaign loss handling already rolls state back to the checkpoint, then
     asks for startCampaign() through a 40 ms timer. A throttled/dropped timer can
     therefore leave the processed dead combat installed forever. Keep the same
     settle/reward/state lifecycle, but make that one loss-only restart immediate.
     Victories, Rebirth, raids and every other timeout keep native scheduling. */
  window.setTimeout = function (fn, delay) {
    const extra = Array.prototype.slice.call(arguments, 2);
    try {
      const lostCampaign = typeof combat !== "undefined" && combat &&
        combat.ctx === "campaign" && combat.status === "lost";
      if (lostCampaign && delay === 40 && typeof startCampaign === "function" && fn === startCampaign) {
        fn.apply(window, extra);
        return 0;
      }
    } catch (_) {}
    return nativeSetTimeout.apply(window, [fn, delay].concat(extra));
  };
  window.__srCampaignLossImmediateRestartV156 = true;

  function heroCadenceBase(c) {
    try {
      if (!c || c.status !== "fight") return 0;
      const alive = (c.enemies || []).filter((e) => e && e.alive).sort((a, b) => a.x - b.x);
      const target = alive[0];
      if (!target) return 0;
      const dv = D;
      const wt = WEAPON_TYPES[dv.weapon] || WEAPON_TYPES.epee;
      const speed = Math.max(0.001, Number(dv.attackSpeed || 0) * Number(wt.speed || 1) *
        (1 + Number(fxVal(c, "buffs", "hate") || 0) / 100));
      let base = 1 / speed;
      if (target.arenaProfile && target.arenaProfile.petElem === "glace") base *= 1.12;
      if (c._arenaHeroSlow && Date.now() < c._arenaHeroSlow.until) {
        base *= 1 + Number(c._arenaHeroSlow.value || 0) / 100;
      }
      return base;
    } catch (_) { return 0; }
  }

  function smoothProjectileStep(c, before, frameMs) {
    if (!c || !Array.isArray(c.projs) || !c.projs.length) return;
    const alpha = 1 - Math.pow(0.5, Math.max(1, frameMs) / 33);
    c.projs.forEach((p) => {
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.toX)) return;
      let from = before.get(p.id);
      if (!Number.isFinite(from)) from = 2 * p.x - p.toX;
      p.x = from + (p.toX - from) * alpha;
    });
  }

  window.setInterval = function (fn, delay) {
    const extra = Array.prototype.slice.call(arguments, 2);
    if (!hooked && delay === 33 && typeof fn === "function" && fn.name === "tick") {
      hooked = true;
      const wrappedTick = function () {
        const nowPerf = performance.now();
        const frameMs = Math.min(100, Math.max(1, nowPerf - lastRun));
        lastRun = nowPerf;

        const c0 = (typeof combat !== "undefined") ? combat : null;
        const heroWasAttacking = c0 ? Number(c0.heroAttacking || 0) : 0;
        const enemyWasAttacking = new Map();
        const projectileBefore = new Map();
        if (c0) {
          (c0.enemies || []).forEach((e) => enemyWasAttacking.set(e.id, Number(e.attacking || 0)));
          (c0.projs || []).forEach((p) => projectileBefore.set(p.id, Number(p.x)));
        }

        fn();

        const c = (typeof combat !== "undefined") ? combat : null;
        if (!c || c.status !== "fight") return;

        if (Number(c.heroAttacking || 0) >= 0.18 && heroWasAttacking <= 0.02) {
          c.heroAttacking = VISUAL_ATTACK_WINDOW;
          const base = heroCadenceBase(c);
          if (base > 0 && Number.isFinite(c.heroAtkCd)) {
            const rawFactor = c.heroAtkCd / base;
            if (rawFactor >= 0.80 && rawFactor <= 1.20) {
              c.heroAtkCd = base * (1 + (rawFactor - 1) * 0.25);
            }
          }
        }

        (c.enemies || []).forEach((e) => {
          const was = enemyWasAttacking.get(e.id) || 0;
          if (Number(e.attacking || 0) >= 0.18 && was <= 0.02) e.attacking = VISUAL_ATTACK_WINDOW;
        });
        smoothProjectileStep(c, projectileBefore, frameMs);
      };
      const id = nativeSetInterval.apply(window, [wrappedTick, 16].concat(extra));
      window.setInterval = nativeSetInterval;
      return id;
    }
    return nativeSetInterval.apply(window, [fn, delay].concat(extra));
  };

  const IMPACT_DUR = { hit: 0.34, crit: 0.62, death: 0.90 };
  if (typeof addBurst === "function") {
    addBurst = function (c, kind, x, color) {
      if (!c) return;
      if (!c.bursts) c.bursts = [];
      const max = IMPACT_DUR[kind] || 0.34;
      c.bursts.push({ kind: kind, x: x, color: color, born: Date.now(), max: max });
      if (c.bursts.length > 20) c.bursts.shift();
      if (typeof addShake === "function") {
        if (kind === "crit") addShake(c, 3.2);
        else if (kind === "death") addShake(c, c.boss ? 4.6 : 3.4);
      }
    };
  }

  if (typeof addShake === "function") {
    addShake = function (c, mag) {
      if (!c) return;
      const now = Date.now();
      const prev = (c.shake && c.shake.until > now) ? Number(c.shake.mag || 0) : 0;
      c.shake = { mag: Math.max(Number(mag || 0), prev), until: now + 190 };
    };
  }

  const style = document.createElement("style");
  style.id = "combat-consolidated-v156-style";
  style.textContent = [
    ".float{letter-spacing:.1px;text-shadow:0 2px 4px #000,0 0 8px #0009}",
    ".fLbl{font-weight:950;letter-spacing:.45px}",
    ".proj{will-change:transform,left}",
    ".unit img{backface-visibility:hidden;transform:translateZ(0)}"
  ].join("\n");
  document.head.appendChild(style);
})();
