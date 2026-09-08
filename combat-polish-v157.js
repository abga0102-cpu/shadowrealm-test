/* Combat Polish V157
   Boss + skill readability layer.
   Visual-only: no damage, HP, cooldown, range, reward or progression changes.
*/
(function () {
  "use strict";

  if (typeof skillVfxHTML !== "function") return;
  const baseSkillVfxHTML = skillVfxHTML;

  function ring(x, y, w, h, col, op, stroke, extra) {
    return '<div class="srTelegraph" style="position:absolute;left:' + (x - w / 2).toFixed(1) +
      'px;top:' + (y - h / 2).toFixed(1) + 'px;width:' + w.toFixed(1) + 'px;height:' + h.toFixed(1) +
      'px;border:' + (stroke || 2) + 'px solid ' + col + ';border-radius:50%;opacity:' + op.toFixed(3) +
      ';box-shadow:0 0 12px ' + col + '66,inset 0 0 10px ' + col + '33;' + (extra || '') + '"></div>';
  }

  function bossTelegraphs(c, scale, groundY, uni) {
    if (!c || !Array.isArray(c.enemies)) return "";
    let h = "";
    c.enemies.forEach((e) => {
      if (!e || !e.alive || !e.boss) return;
      const sx = ((typeof P !== "undefined" && P.en && P.en[e.id] != null) ? P.en[e.id] : e.x) * scale;
      const size = (uni || 64) * 1.45;
      const y = groundY - Math.max(5, size * 0.08);

      // Short pre-swing warning from the existing attack cooldown. Purely visual.
      const cd = Number(e.atkCd);
      if (Number.isFinite(cd) && cd > 0 && cd <= 0.34 && !(e.attacking > 0)) {
        const q = 1 - cd / 0.34;
        const d = size * (0.82 + q * 0.30);
        h += ring(sx, y, d, d * 0.34, '#FFB52E', 0.20 + q * 0.55, 2,
          'transform:scale(' + (0.96 + q * 0.05).toFixed(3) + ');');
      }

      // Existing boss wind-up states already precede their real hit. Surface them.
      const windKeys = ['breathWind','quakeWind','orbWind','leapWind','channel','gaze','grip'];
      let wind = 0;
      windKeys.forEach((k) => { const v = Number(e[k] || 0); if (v > wind) wind = v; });
      if (wind > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.016);
        const d = size * (1.10 + pulse * 0.10);
        h += ring(sx, y, d, d * 0.36, '#E5484D', 0.45 + pulse * 0.28, 3);
      }
    });
    return h;
  }

  function skillCastCues(c, scale, groundY, uni) {
    if (!c || !Array.isArray(c.skillFxs) || !c.skillFxs.length) return "";
    let h = "";
    const hx = ((typeof P !== "undefined" && Number.isFinite(P.hero)) ? P.hero : c.heroX) * scale;
    const heroY = groundY - (uni || 64) * 0.12;

    c.skillFxs.forEach((fx) => {
      if (!fx) return;
      const kind = fx.fx || 'impact';
      const dur = Number(fx.max || (typeof vfxDur === 'function' ? vfxDur(kind) : 0.6)) || 0.6;
      const life = Number(fx.life || 0);
      const p = Math.max(0, Math.min(1, 1 - life / dur));
      const col = fx.color || '#8FEFF4';

      // Cast cue: brief ring at the hero so a skill reads as a deliberate action.
      if (p < 0.18) {
        const q = p / 0.18;
        const d = (uni || 64) * (0.62 + q * 0.42);
        h += ring(hx, heroY, d, d * 0.30, col, (1 - q) * 0.72, 2);
      }

      // Heavy area skills also warn the target zone before their visual impact.
      if ((kind === 'meteor' || kind === 'cataclysm' || kind === 'vortex') && p < 0.30) {
        const alive = (c.enemies || []).filter((e) => e && e.alive);
        if (!alive.length) return;
        const xs = alive.map((e) => ((typeof P !== 'undefined' && P.en && P.en[e.id] != null) ? P.en[e.id] : e.x) * scale);
        const cx = xs.reduce((a,b) => a+b, 0) / xs.length;
        const q = p / 0.30;
        const d = (uni || 64) * (1.15 + q * 0.38);
        h += ring(cx, groundY - 5, d, d * 0.32, col, 0.18 + q * 0.42, 2,
          'transform:scale(' + (0.96 + q * 0.04).toFixed(3) + ');');
      }
    });
    return h;
  }

  skillVfxHTML = function (c, scale, groundY, uni, vs) {
    const base = baseSkillVfxHTML(c, scale, groundY, uni, vs);
    const extra = bossTelegraphs(c, scale, groundY, uni) + skillCastCues(c, scale, groundY, uni);
    if (!extra) return base;
    return base + '<div class="srCombatPolish" style="position:absolute;inset:0;pointer-events:none;z-index:5">' + extra + '</div>';
  };

  const style = document.createElement('style');
  style.id = 'combat-polish-v157-style';
  style.textContent = [
    '.srTelegraph{box-sizing:border-box;will-change:transform,opacity}',
    '.srCombatPolish{contain:layout paint style}'
  ].join('\n');
  document.head.appendChild(style);
})();
