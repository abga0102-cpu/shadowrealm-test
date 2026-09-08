/* Combat Fluidity V152
   - Raises only the simulation sampling rate (33ms -> ~16ms) without changing dt-based balance.
   - Extends the visual attack pose to 280ms while hit timing remains authoritative.
   - Preserves projectile wall-clock travel while smoothing intermediate positions.
   - Compresses hero attack cadence jitter from 88-112% to ~97-103% around the same mean.
*/
(function () {
  "use strict";

  const nativeSetInterval = window.setInterval.bind(window);
  const VISUAL_ATTACK_WINDOW = 0.28;
  let hooked = false;
  let lastRun = performance.now();

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
    } catch (_) {
      return 0;
    }
  }

  function smoothProjectileStep(c, before, frameMs) {
    if (!c || !Array.isArray(c.projs) || !c.projs.length) return;
    const alpha = 1 - Math.pow(0.5, Math.max(1, frameMs) / 33);
    c.projs.forEach((p) => {
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.toX)) return;
      let from = before.get(p.id);
      // Newly spawned projectiles were already advanced by the legacy 0.5 step.
      // Recover their pre-step origin algebraically, then apply the frame-rate-safe step.
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

        // Visual anticipation/return lasts longer, but damage still lands on the engine's existing schedule.
        if (Number(c.heroAttacking || 0) >= 0.18 && heroWasAttacking <= 0.02) {
          c.heroAttacking = VISUAL_ATTACK_WINDOW;

          // Preserve the original mean attack interval while reducing cadence wobble.
          const base = heroCadenceBase(c);
          if (base > 0 && Number.isFinite(c.heroAtkCd)) {
            const rawFactor = c.heroAtkCd / base;
            if (rawFactor >= 0.80 && rawFactor <= 1.20) {
              const compressed = 1 + (rawFactor - 1) * 0.25;
              c.heroAtkCd = base * compressed;
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
      // One-shot hook: all other timers retain their exact original cadence.
      window.setInterval = nativeSetInterval;
      return id;
    }
    return nativeSetInterval.apply(window, [fn, delay].concat(extra));
  };
})();
