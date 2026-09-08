/* Combat Animation V159
   Single visual choreography pass over V158.
   - Replaces stacked walk sway with one distance-driven gait.
   - Gives ranged weapons a distinct body pose instead of melee attack sprites.
   - Uses the full 0.28s visual attack window as anticipation -> strike/release -> recovery.
   Visual only: no damage, range, cooldown, movement speed, rewards or save changes.
*/
(function () {
  "use strict";

  if (typeof drawArena !== "function" || typeof weaponHTML !== "function") return;

  const VISUAL_ATTACK = 0.28;
  const baseDrawArena159 = drawArena;
  let lastHeroX159 = null;
  let heroGait159 = 0;
  const lastEnemyX159 = new Map();
  const enemyGait159 = new Map();

  function attackP159(left) {
    const n = Number(left || 0);
    if (!(n > 0)) return 0;
    return Math.max(0, Math.min(0.999, 1 - n / VISUAL_ATTACK));
  }

  function handForP159(p) {
    if (typeof HERO_HAND === "undefined" || !HERO_HAND.length) return {x:.61,y:.62,rot:24};
    if (p < 0.18) return HERO_HAND[0];
    const q = Math.max(0, Math.min(.999, (p - .18) / .82));
    const n = Math.max(1, HERO_HAND.length - 1);
    return HERO_HAND[1 + Math.min(n - 1, Math.floor(q * n))] || HERO_HAND[0];
  }

  function rangedHand159(weapon, p) {
    if (weapon === "arc") {
      return {x:.66 + Math.min(1,p/.35)*.06, y:.57 - Math.min(1,p/.35)*.09, rot:-13};
    }
    if (weapon === "arbalete") return {x:.69, y:.54, rot:-7};
    return {x:.64, y:.52, rot:-27};
  }

  // Replace V158 weapon choreography with one driven by the real 0.28 visual window.
  weaponHTML = function (weapon, color, attacking, t, size) {
    const art = ASSETS["weapon_" + weapon];
    const left = attacking && typeof combat !== "undefined" && combat ? Number(combat.heroAttacking || 0) : 0;
    const p = attackP159(left);
    const ranged = RANGED_IDS.includes(weapon);
    const hand = attacking && ranged ? rangedHand159(weapon, p) : handForP159(p);
    const moving = typeof combat !== "undefined" && combat && Math.abs(Number(combat.heroX || 0) - Number(P.hero || 0)) > .3;
    const walkSway = moving && !attacking ? Math.sin(heroGait159) * 2.2 : Math.sin(t * .0034) * 1.5;

    if (!art) return staffHTML(color, attacking ? 45 : walkSway, size);

    const h = size * (ranged ? .70 : .64);
    const w = h * (WEAPON_ASPECT[weapon] || .4);
    let rot = Number(hand.rot || 0), tx = 0, ty = 0, sx = 1, sy = 1;

    if (attacking) {
      if (weapon === "arc") {
        // 0-.30 raise, .30-.62 draw/hold, .62 release, then settle.
        const raise = Math.min(1, p / .30);
        const draw = p < .62 ? Math.max(0, Math.min(1, (p - .24) / .38)) : Math.max(0, 1 - (p - .62) / .22);
        rot = -20 + raise * 8;
        sx = 1 - draw * .065;
        sy = 1 + draw * .05;
        tx = -draw * size * .035;
        ty = -raise * size * .025;
      } else if (weapon === "arbalete") {
        const aim = Math.min(1, p / .35);
        const recoil = Math.max(0, 1 - Math.abs(p - .62) / .13);
        rot = -14 + aim * 6 + recoil * 5;
        tx = recoil * size * .025;
        ty = -aim * size * .018;
      } else if (weapon === "baton") {
        const cast = Math.sin(Math.min(1, p / .78) * Math.PI);
        rot = -38 + p * 28;
        ty = -cast * size * .045;
        tx = cast * size * .018;
      } else {
        // Anticipation then a decisive melee arc, with a short recovery.
        const q = Math.max(0, Math.min(1, (p - .16) / .70));
        const strike = Math.sin(q * Math.PI);
        const extra = weapon === "dague" ? 16 : weapon === "hache" ? 30 : weapon === "masse" ? 26 : 34;
        rot = hand.rot + (q < .43 ? -extra * (1 - q / .43) : extra * strike * .16);
        tx = strike * size * .022;
      }
    } else {
      rot = hand.rot * (ranged ? .45 : 1) + walkSway;
    }

    return '<div class="srWeapon" style="position:absolute;left:' + (hand.x * size - w / 2 + tx).toFixed(1) +
      'px;top:' + (hand.y * size - h + ty).toFixed(1) + 'px;width:' + w.toFixed(1) +
      'px;height:' + h.toFixed(1) + 'px;transform-origin:50% 100%;transform:rotate(' + rot.toFixed(1) +
      'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')"><img src="' + art +
      '" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 5px ' + color + '99)"></div>';
  };

  if (typeof slashHTML === "function") {
    slashHTML = function (attacking, size) {
      const p = attackP159(attacking);
      const q = Math.max(0, Math.min(1, (p - .18) / .66));
      const peak = Math.sin(q * Math.PI);
      if (peak <= .01) return "";
      const d = size * (.92 + q * .52);
      const m = "url(" + ASSETS.vfx_slash + ") center/contain no-repeat";
      return '<div class="slash" style="left:' + (size * .88 - d / 2).toFixed(1) +
        'px;top:' + (size * .44 - d / 2).toFixed(1) + 'px;width:' + d.toFixed(1) +
        'px;height:' + d.toFixed(1) + 'px;opacity:' + (peak * .92).toFixed(3) +
        ';transform:rotate(' + (-58 + q * 122).toFixed(0) + 'deg) scaleX(-1);-webkit-mask:' + m + ';mask:' + m + '"></div>';
    };
  }

  if (typeof releaseHTML === "function") {
    releaseHTML = function (attacking, size, col) {
      const p = attackP159(attacking);
      const release = Math.max(0, 1 - Math.abs(p - .62) / .13);
      if (release <= .01) return "";
      const hand = rangedHand159((typeof D !== "undefined" && D.weapon) || "arc", p);
      const d = size * (.20 + release * .32);
      const m = "url(" + ASSETS.vfx_spark + ") center/contain no-repeat";
      return '<div class="slash" style="left:' + (hand.x * size - d / 2).toFixed(1) +
        'px;top:' + (hand.y * size - d / 2 - size * .08).toFixed(1) + 'px;width:' + d.toFixed(1) +
        'px;height:' + d.toFixed(1) + 'px;opacity:' + (release * .92).toFixed(3) +
        ';background:' + col + ';-webkit-mask:' + m + ';mask:' + m + '"></div>';
    };
  }

  function gaitStep159(map, id, delta, factor) {
    let p = map.get(id) || 0;
    p += Math.max(0, delta) * factor;
    map.set(id, p);
    return p;
  }

  drawArena = function () {
    baseDrawArena159();
    try {
      const c = typeof combat !== "undefined" ? combat : null;
      if (!c || !arenaNodes || !arenaNodes.layer) return;

      const units = Array.from(arenaNodes.layer.querySelectorAll(":scope > .unit"));
      if (!units.length) return;
      let ui = 0;

      // Hero: replace, do not append to, the old walk tilt.
      const heroUnit = units[ui++];
      if (heroUnit) {
        const img = heroUnit.querySelector(":scope > img");
        const nowX = Number(P.hero || 0);
        const delta = lastHeroX159 == null ? 0 : Math.abs(nowX - lastHeroX159);
        lastHeroX159 = nowX;
        const moving = delta > .012 && !(c.heroAttacking > 0) && !(c.heroHit > 0);
        if (moving) heroGait159 += delta * .52;

        if (img && moving) {
          const foot = Math.sin(heroGait159);
          const contact = Math.abs(Math.cos(heroGait159));
          const lift = -Math.abs(foot) * 1.15;
          const lean = foot * 1.25;
          const squash = 1 - contact * .008;
          img.style.transform = 'translateY(' + lift.toFixed(2) + 'px) rotate(' + lean.toFixed(2) + 'deg) scaleY(' + squash.toFixed(3) + ')';
          const weapon = heroUnit.querySelector(":scope > .srWeapon");
          if (weapon) weapon.style.transform += ' translateY(' + (lift * .35).toFixed(2) + 'px)';
        }

        // Ranged attacks no longer use sword-swing body frames. Keep the idle body
        // and pose it as aim/draw/release while the weapon carries the detailed action.
        if (img && c.heroAttacking > 0 && RANGED_IDS.includes(D.weapon)) {
          if (ASSETS.hero) img.src = ASSETS.hero;
          const p = attackP159(c.heroAttacking);
          let lean = 0, y = 0, sx = 1, sy = 1;
          if (D.weapon === "arc") {
            const draw = p < .62 ? Math.max(0, Math.min(1, (p - .20) / .42)) : Math.max(0, 1 - (p - .62) / .28);
            lean = -2.2 + draw * 3.2;
            y = -draw * 1.2;
            sx = 1 - draw * .012;
            sy = 1 + draw * .008;
          } else if (D.weapon === "arbalete") {
            const aim = Math.min(1, p / .35);
            const recoil = Math.max(0, 1 - Math.abs(p - .62) / .14);
            lean = -1.4 + aim * 1.8 - recoil * 2.5;
            y = -aim * .7;
          } else {
            const cast = Math.sin(Math.min(1, p / .82) * Math.PI);
            lean = -2 + cast * 3.2;
            y = -cast * 1.8;
            sy = 1 + cast * .012;
          }
          img.style.transform = 'translateY(' + y.toFixed(2) + 'px) rotate(' + lean.toFixed(2) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
        }
      }

      // Enemies: replace the renderer's permanent idle bob while they are actually walking.
      const rendered = c.enemies.filter((e) => e.alive || e.hitFlash > 0);
      rendered.forEach((e) => {
        const unit = units[ui++];
        if (!unit) return;
        const img = unit.querySelector(":scope > img");
        if (!img) return;
        const x = Number(P.en[e.id] != null ? P.en[e.id] : e.x || 0);
        const before = lastEnemyX159.has(e.id) ? lastEnemyX159.get(e.id) : x;
        const delta = Math.abs(x - before);
        lastEnemyX159.set(e.id, x);
        const moving = delta > .010 && !(e.attacking > 0) && !(e.hitFlash > 0) && !(e.flying > 0);
        if (!moving) return;

        const factor = e.boss ? .27 : e.small ? .70 : .48;
        const phase = gaitStep159(enemyGait159, e.id, delta, factor);
        const foot = Math.sin(phase);
        const contact = Math.abs(Math.cos(phase));
        const lift = -Math.abs(foot) * (e.boss ? .65 : e.small ? 1.35 : 1.0);
        const lean = foot * (e.boss ? .55 : e.small ? 1.8 : 1.15);
        const squash = 1 - contact * (e.boss ? .006 : .009);
        img.style.transform = 'scaleX(-1) translateY(' + lift.toFixed(2) + 'px) rotate(' + lean.toFixed(2) + 'deg) scaleY(' + squash.toFixed(3) + ')';
      });

      if (lastEnemyX159.size > 24) {
        const live = new Set(c.enemies.map((e) => e.id));
        Array.from(lastEnemyX159.keys()).forEach((id) => {
          if (!live.has(id)) { lastEnemyX159.delete(id); enemyGait159.delete(id); }
        });
      }
    } catch (_) {}
  };

  const style = document.createElement("style");
  style.id = "combat-animation-v159-style";
  style.textContent = [
    ".unit>img{transform-origin:50% 92%;will-change:transform}",
    ".srWeapon{will-change:transform}",
    "@media (prefers-reduced-motion:reduce){.unit>img,.srWeapon{will-change:auto}}"
  ].join("\n");
  document.head.appendChild(style);
})();
