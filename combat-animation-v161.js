/* Combat Animation V161
   Planted-step gait + weapon choreography.
   Visual-only: logical positions, movement speed, range, hit timing, damage, cooldowns,
   rewards, progression and saves remain untouched.
*/
(function () {
  "use strict";

  if (typeof drawArena !== "function" || typeof weaponHTML !== "function") return;

  const VISUAL_ATTACK = 0.28;
  const baseDrawArena161 = drawArena;
  const heroWalk161 = { lastX: null, distPx: 0 };
  const enemyWalk161 = new Map();

  function attackP161(left) {
    const n = Number(left || 0);
    if (!(n > 0)) return 0;
    return Math.max(0, Math.min(0.999, 1 - n / VISUAL_ATTACK));
  }

  function handForP161(p) {
    if (typeof HERO_HAND === "undefined" || !HERO_HAND.length) return {x:.61,y:.62,rot:24};
    if (p < .18) return HERO_HAND[0];
    const q = Math.max(0, Math.min(.999, (p - .18) / .82));
    const n = Math.max(1, HERO_HAND.length - 1);
    return HERO_HAND[1 + Math.min(n - 1, Math.floor(q * n))] || HERO_HAND[0];
  }

  function rangedHand161(weapon, p) {
    if (weapon === "arc") return {x:.66 + Math.min(1,p/.35)*.06, y:.57 - Math.min(1,p/.35)*.09, rot:-13};
    if (weapon === "arbalete") return {x:.69, y:.54, rot:-7};
    return {x:.64, y:.52, rot:-27};
  }

  weaponHTML = function (weapon, color, attacking, t, size) {
    const art = ASSETS["weapon_" + weapon];
    const left = attacking && typeof combat !== "undefined" && combat ? Number(combat.heroAttacking || 0) : 0;
    const p = attackP161(left);
    const ranged = RANGED_IDS.includes(weapon);
    const hand = attacking && ranged ? rangedHand161(weapon, p) : handForP161(p);
    const moving = typeof combat !== "undefined" && combat && Math.abs(Number(combat.heroX || 0) - Number(P.hero || 0)) > .3;
    const walkPhase = (heroWalk161.distPx / Math.max(6, size * .145)) * Math.PI * 2;
    const walkSway = moving && !attacking ? Math.sin(walkPhase) * 1.8 : Math.sin(t * .0034) * 1.5;

    if (!art) return staffHTML(color, attacking ? 45 : walkSway, size);

    const h = size * (ranged ? .70 : .64);
    const w = h * (WEAPON_ASPECT[weapon] || .4);
    let rot = Number(hand.rot || 0), tx = 0, ty = 0, sx = 1, sy = 1;

    if (attacking) {
      if (weapon === "arc") {
        const raise = Math.min(1, p / .30);
        const draw = p < .62 ? Math.max(0, Math.min(1, (p - .24) / .38)) : Math.max(0, 1 - (p - .62) / .22);
        rot = -20 + raise * 8;
        sx = 1 - draw * .065; sy = 1 + draw * .05;
        tx = -draw * size * .035; ty = -raise * size * .025;
      } else if (weapon === "arbalete") {
        const aim = Math.min(1, p / .35);
        const recoil = Math.max(0, 1 - Math.abs(p - .62) / .13);
        rot = -14 + aim * 6 + recoil * 5;
        tx = recoil * size * .025; ty = -aim * size * .018;
      } else if (weapon === "baton") {
        const cast = Math.sin(Math.min(1, p / .78) * Math.PI);
        rot = -38 + p * 28;
        ty = -cast * size * .045; tx = cast * size * .018;
      } else {
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
      const p = attackP161(attacking);
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
      const p = attackP161(attacking);
      const release = Math.max(0, 1 - Math.abs(p - .62) / .13);
      if (release <= .01) return "";
      const hand = rangedHand161((typeof D !== "undefined" && D.weapon) || "arc", p);
      const d = size * (.20 + release * .32);
      const m = "url(" + ASSETS.vfx_spark + ") center/contain no-repeat";
      return '<div class="slash" style="left:' + (hand.x * size - d / 2).toFixed(1) +
        'px;top:' + (hand.y * size - d / 2 - size * .08).toFixed(1) + 'px;width:' + d.toFixed(1) +
        'px;height:' + d.toFixed(1) + 'px;opacity:' + (release * .92).toFixed(3) +
        ';background:' + col + ';-webkit-mask:' + m + ';mask:' + m + '"></div>';
    };
  }

  /*
    A fixed-speed sprite always looks like it is skating, even if it bobs.
    The logical x remains continuous, but the visual root is re-timed inside each
    stride.  The sine offset makes visual velocity fall almost to zero during the
    stance/contact phase, then accelerate during push-off/swing.  This is the key
    difference between a planted step and a body sliding over the floor.
  */
  function plantedStep161(state, x, scale, size, dirHint, profile) {
    if (state.lastX == null) { state.lastX = x; return null; }
    const dxWorld = x - state.lastX;
    state.lastX = x;
    const dxPx = dxWorld * scale;
    const moving = Math.abs(dxPx) > .012;
    if (!moving) return null;
    state.distPx += Math.abs(dxPx);

    const strideMul = profile === "boss" ? .155 : profile === "small" ? .18 : .145;
    const stride = Math.max(profile === "small" ? 4.8 : 6.2, size * strideMul);
    const phase = (state.distPx / stride) % 1;
    const theta = phase * Math.PI * 2;
    const dir = dxPx > 0 ? 1 : dxPx < 0 ? -1 : dirHint;

    // amp ~= stride/(2π): derivative approaches zero at stance, ~2x at swing.
    const amp = stride / (Math.PI * 2) * (profile === "boss" ? .78 : .92);
    const stepX = dir * Math.sin(theta) * amp;

    // Two subtle body weight events per full cycle, no hopping.
    const contact = Math.abs(Math.cos(theta));
    const transfer = Math.sin(theta);
    const liftMax = profile === "boss" ? .55 : profile === "small" ? 1.05 : .78;
    const lift = -(1 - contact) * liftMax;
    const leanMax = profile === "boss" ? .48 : profile === "small" ? 1.35 : .88;
    const lean = transfer * leanMax;
    const squash = 1 - contact * (profile === "boss" ? .004 : .0065);

    return { stepX, lift, lean, squash, phase, contact };
  }

  drawArena = function () {
    baseDrawArena161();
    try {
      const c = typeof combat !== "undefined" ? combat : null;
      if (!c || !arenaNodes || !arenaNodes.layer || !arenaEl) return;
      const scale = (arenaEl.clientWidth || 360) / AW;
      const units = Array.from(arenaNodes.layer.querySelectorAll(":scope > .unit"));
      if (!units.length) return;
      let ui = 0;

      const heroUnit = units[ui++];
      if (heroUnit) {
        const img = heroUnit.querySelector(":scope > img");
        const size = parseFloat(heroUnit.style.width) || 64;
        const movingAllowed = !(c.heroAttacking > 0) && !(c.heroHit > 0) && !(c.heroStun > 0);
        const gait = plantedStep161(heroWalk161, Number(P.hero || 0), scale, size, 1, "hero");

        if (img && movingAllowed && gait) {
          // Replace the renderer root motion while walking: no old idle bob survives.
          heroUnit.style.transform = 'translate(' + gait.stepX.toFixed(2) + 'px,0px)';
          img.style.transform = 'translateY(' + gait.lift.toFixed(2) + 'px) rotate(' + gait.lean.toFixed(2) +
            'deg) scaleY(' + gait.squash.toFixed(4) + ')';
          const weapon = heroUnit.querySelector(":scope > .srWeapon");
          if (weapon) weapon.style.transform += ' translateY(' + (gait.lift * .32).toFixed(2) + 'px)';
          const shadow = heroUnit.querySelector(":scope > .ushadow");
          if (shadow) {
            const sx = 1 - (1 - gait.contact) * .035;
            shadow.style.transform = 'scaleX(' + sx.toFixed(3) + ')';
            shadow.style.opacity = (.54 + gait.contact * .08).toFixed(3);
          }
        }

        if (img && c.heroAttacking > 0 && RANGED_IDS.includes(D.weapon)) {
          if (ASSETS.hero) img.src = ASSETS.hero;
          const p = attackP161(c.heroAttacking);
          let lean = 0, y = 0, sx = 1, sy = 1;
          if (D.weapon === "arc") {
            const draw = p < .62 ? Math.max(0, Math.min(1, (p - .20) / .42)) : Math.max(0, 1 - (p - .62) / .28);
            lean = -2.2 + draw * 3.2; y = -draw * 1.2; sx = 1 - draw * .012; sy = 1 + draw * .008;
          } else if (D.weapon === "arbalete") {
            const aim = Math.min(1, p / .35);
            const recoil = Math.max(0, 1 - Math.abs(p - .62) / .14);
            lean = -1.4 + aim * 1.8 - recoil * 2.5; y = -aim * .7;
          } else {
            const cast = Math.sin(Math.min(1, p / .82) * Math.PI);
            lean = -2 + cast * 3.2; y = -cast * 1.8; sy = 1 + cast * .012;
          }
          img.style.transform = 'translateY(' + y.toFixed(2) + 'px) rotate(' + lean.toFixed(2) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
        }
      }

      const rendered = c.enemies.filter((e) => e.alive || e.hitFlash > 0);
      rendered.forEach((e) => {
        const unit = units[ui++];
        if (!unit) return;
        const img = unit.querySelector(":scope > img");
        if (!img) return;
        const size = parseFloat(unit.style.width) || 64;
        let state = enemyWalk161.get(e.id);
        if (!state) { state = {lastX:null, distPx:0}; enemyWalk161.set(e.id, state); }
        const x = Number(P.en[e.id] != null ? P.en[e.id] : e.x || 0);
        const gait = plantedStep161(state, x, scale, size, -1, e.boss ? "boss" : e.small ? "small" : "normal");
        const movingAllowed = !(e.attacking > 0) && !(e.hitFlash > 0) && !(e.flying > 0) && !(e.stagger > 0) && !(e.vanish > 0);
        if (!movingAllowed || !gait) return;

        // Remove game-3's permanent enemy idle bob while walking.
        unit.style.transform = 'translate(' + gait.stepX.toFixed(2) + 'px,0px)';
        img.style.transform = 'scaleX(-1) translateY(' + gait.lift.toFixed(2) + 'px) rotate(' + gait.lean.toFixed(2) +
          'deg) scaleY(' + gait.squash.toFixed(4) + ')';
        const shadow = unit.querySelector(":scope > .ushadow");
        if (shadow) {
          const sx = 1 - (1 - gait.contact) * (e.boss ? .018 : .03);
          shadow.style.transform = 'scaleX(' + sx.toFixed(3) + ')';
          shadow.style.opacity = (.52 + gait.contact * .09).toFixed(3);
        }
      });

      if (enemyWalk161.size > 24) {
        const live = new Set(c.enemies.map((e) => e.id));
        Array.from(enemyWalk161.keys()).forEach((id) => { if (!live.has(id)) enemyWalk161.delete(id); });
      }
    } catch (_) {}
  };

  const style = document.createElement("style");
  style.id = "combat-animation-v161-style";
  style.textContent = [
    ".unit>img{transform-origin:50% 92%;will-change:transform}",
    ".srWeapon,.unit{will-change:transform}",
    ".ushadow{transform-origin:50% 50%;will-change:transform,opacity}",
    "@media (prefers-reduced-motion:reduce){.unit>img,.srWeapon,.unit,.ushadow{will-change:auto}}"
  ].join("\n");
  document.head.appendChild(style);
})();
