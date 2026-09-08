/* Combat Motion V158
   Walk + weapon choreography polish.
   Visual-only: preserves real positions, movement speed, hit timing, damage and cooldowns.
*/
(function () {
  "use strict";

  if (typeof drawArena !== "function" || typeof weaponHTML !== "function") return;

  const baseDrawArena = drawArena;
  const prevEnemyX = new Map();
  const enemyStep = new Map();
  let prevHeroX = null;
  let heroStep = 0;

  function attackProgress(left) {
    const n = Number(left || 0);
    if (!(n > 0)) return 0;
    return Math.max(0, Math.min(1, 1 - n / ATTACK_WINDOW));
  }

  // The renderer used to pass only true/false to weaponHTML. Recover the real
  // countdown from combat so the weapon follows the same attack frames as the hero.
  weaponHTML = function (weapon, color, attacking, t, size) {
    const art = ASSETS["weapon_" + weapon];
    const liveLeft = attacking && typeof combat !== "undefined" && combat
      ? Number(combat.heroAttacking || 0) : 0;
    const p = attackProgress(liveLeft);
    const hand = heroHand(liveLeft);
    const ranged = RANGED_IDS.includes(weapon);
    const moving = typeof combat !== "undefined" && combat && Math.abs(Number(combat.heroX || 0) - Number(P.hero || 0)) > 0.35;
    const walkSway = moving && !attacking ? Math.sin(heroStep) * 4.0 : Math.sin(t * 0.0034) * 2.0;

    if (!art) return staffHTML(color, attacking ? 55 : walkSway, size);

    const h = size * (ranged ? 0.70 : 0.64);
    const w = h * (WEAPON_ASPECT[weapon] || 0.4);
    let rot = hand.rot;
    let sx = 1, sy = 1, tx = 0, ty = 0;

    if (attacking) {
      if (weapon === "arc") {
        // Raise, draw, then release. The projectile still decides the real hit.
        const draw = p < 0.52 ? p / 0.52 : Math.max(0, 1 - (p - 0.52) / 0.48);
        rot = -18 + p * 14;
        sx = 1 - draw * 0.055;
        sy = 1 + draw * 0.045;
        tx = -draw * size * 0.025;
      } else if (weapon === "arbalete") {
        rot = -10 + p * 8;
        ty = -Math.sin(p * Math.PI) * size * 0.018;
      } else if (weapon === "baton") {
        rot = -34 + p * 28;
        ty = -Math.sin(p * Math.PI) * size * 0.035;
      } else {
        // Melee follows the actual hand anchor, with a little extra blade speed
        // through the middle of the strike so the weapon visibly performs the hit.
        const strike = Math.sin(p * Math.PI);
        const extra = weapon === "dague" ? 18 : weapon === "hache" ? 28 : weapon === "masse" ? 24 : 32;
        rot = hand.rot + (p < 0.48 ? -extra * (1 - p / 0.48) : extra * strike * 0.18);
        tx = strike * size * 0.018;
      }
    } else {
      rot = hand.rot * (ranged ? 0.45 : 1) + walkSway;
    }

    return '<div class="srWeapon" style="position:absolute;left:' + (hand.x * size - w / 2 + tx).toFixed(1) +
      'px;top:' + (hand.y * size - h + ty).toFixed(1) + 'px;width:' + w.toFixed(1) +
      'px;height:' + h.toFixed(1) + 'px;transform-origin:50% 100%;transform:rotate(' + rot.toFixed(1) +
      'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')"><img src="' + art +
      '" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 5px ' + color + '99)"></div>';
  };

  // Blade trail now peaks during the strike instead of appearing at full power
  // at the first attack frame.
  if (typeof slashHTML === "function") {
    slashHTML = function (attacking, size) {
      const p = attackProgress(attacking);
      const d = size * (0.92 + p * 0.48);
      const m = "url(" + ASSETS.vfx_slash + ") center/contain no-repeat";
      const peak = Math.max(0, Math.sin(Math.min(1, p / 0.82) * Math.PI));
      return '<div class="slash" style="left:' + (size * 0.88 - d / 2).toFixed(1) +
        'px;top:' + (size * 0.44 - d / 2).toFixed(1) + 'px;width:' + d.toFixed(1) +
        'px;height:' + d.toFixed(1) + 'px;opacity:' + (peak * 0.92).toFixed(3) +
        ';transform:rotate(' + (-55 + p * 118).toFixed(0) + 'deg) scaleX(-1);-webkit-mask:' + m +
        ';mask:' + m + '"></div>';
    };
  }

  // Ranged release flash appears around the actual release portion of the pose.
  if (typeof releaseHTML === "function") {
    releaseHTML = function (attacking, size, col) {
      const p = attackProgress(attacking);
      const hand = heroHand(attacking);
      const release = Math.max(0, 1 - Math.abs(p - 0.58) / 0.20);
      if (release <= 0.01) return "";
      const d = size * (0.22 + release * 0.28);
      const m = "url(" + ASSETS.vfx_spark + ") center/contain no-repeat";
      return '<div class="slash" style="left:' + (hand.x * size - d / 2).toFixed(1) +
        'px;top:' + (hand.y * size - d / 2 - size * 0.10).toFixed(1) + 'px;width:' + d.toFixed(1) +
        'px;height:' + d.toFixed(1) + 'px;opacity:' + (release * 0.9).toFixed(3) +
        ';background:' + col + ';-webkit-mask:' + m + ';mask:' + m + '"></div>';
    };
  }

  function gaitForEnemy(e, delta) {
    let s = enemyStep.get(e.id) || 0;
    const weight = e.boss ? 0.62 : e.small ? 1.42 : 1;
    if (delta > 0.015 && !(e.attacking > 0)) s += delta * 0.34 * weight;
    enemyStep.set(e.id, s);
    return s;
  }

  function appendTransform(img, extra) {
    if (!img || !extra) return;
    img.style.transform = (img.style.transform || "") + " " + extra;
  }

  drawArena = function () {
    baseDrawArena();
    try {
      const c = (typeof combat !== "undefined") ? combat : null;
      if (!c || !arenaNodes || !arenaNodes.layer) return;

      const heroNow = Number(P.hero || 0);
      const heroDelta = prevHeroX == null ? 0 : Math.abs(heroNow - prevHeroX);
      prevHeroX = heroNow;
      const heroMoving = heroDelta > 0.015 && !(c.heroAttacking > 0) && !(c.heroHit > 0);
      if (heroMoving) heroStep += heroDelta * 0.38;

      const units = Array.from(arenaNodes.layer.querySelectorAll(":scope > .unit"));
      let ui = 0;

      // Hero is rendered before enemies whenever alive/present.
      const heroUnit = units[ui];
      if (heroUnit) {
        const img = heroUnit.querySelector(":scope > img");
        if (img && heroMoving) {
          const foot = Math.sin(heroStep);
          const lift = Math.abs(foot) * -1.7;
          const lean = foot * 1.6;
          const compress = 1 - Math.abs(Math.cos(heroStep)) * 0.012;
          appendTransform(img, "translateY(" + lift.toFixed(2) + "px) rotate(" + lean.toFixed(2) + "deg) scaleY(" + compress.toFixed(3) + ")");
          const weapon = heroUnit.querySelector(":scope > .srWeapon");
          if (weapon) weapon.style.transform += " translateY(" + (lift * 0.45).toFixed(2) + "px)";
        }
        ui++;
      }

      const renderedEnemies = c.enemies.filter((e) => e.alive || e.hitFlash > 0);
      renderedEnemies.forEach((e) => {
        const unit = units[ui++];
        if (!unit) return;
        const nowX = Number(P.en[e.id] != null ? P.en[e.id] : e.x || 0);
        const beforeX = prevEnemyX.has(e.id) ? prevEnemyX.get(e.id) : nowX;
        const delta = Math.abs(nowX - beforeX);
        prevEnemyX.set(e.id, nowX);
        const moving = delta > 0.012 && !(e.attacking > 0) && !(e.hitFlash > 0) && !(e.flying > 0);
        if (!moving) return;
        const phase = gaitForEnemy(e, delta);
        const weight = e.boss ? 0.58 : e.small ? 1.35 : 1;
        const foot = Math.sin(phase);
        const lift = -Math.abs(foot) * (e.boss ? 1.0 : e.small ? 2.0 : 1.5);
        const lean = foot * (e.boss ? 0.8 : e.small ? 2.5 : 1.7);
        const squash = 1 - Math.abs(Math.cos(phase)) * 0.014 * weight;
        const img = unit.querySelector(":scope > img");
        appendTransform(img, "translateY(" + lift.toFixed(2) + "px) rotate(" + lean.toFixed(2) + "deg) scaleY(" + squash.toFixed(3) + ")");
      });

      // Forget units that left combat so long sessions do not grow the maps.
      if (prevEnemyX.size > 24) {
        const live = new Set(c.enemies.map((e) => e.id));
        Array.from(prevEnemyX.keys()).forEach((id) => { if (!live.has(id)) { prevEnemyX.delete(id); enemyStep.delete(id); } });
      }
    } catch (_) {}
  };

  const style = document.createElement("style");
  style.id = "combat-motion-v158-style";
  style.textContent = [
    ".srWeapon{will-change:transform}",
    ".unit>img{transform-origin:50% 92%}",
    "@media (prefers-reduced-motion:reduce){.srWeapon{will-change:auto}}"
  ].join("\n");
  document.head.appendChild(style);
})();
