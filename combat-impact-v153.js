/* Combat Impact V153
   Visual-only combat feedback layer.
   - Stronger but still compact hit / crit / death bursts.
   - Slightly longer arena shake so heavy hits read clearly.
   - No changes to damage, HP, cooldowns, rewards, enemy scaling or progression.
*/
(function () {
  "use strict";

  const IMPACT_DUR = { hit: 0.34, crit: 0.62, death: 0.90 };

  // Reuse the existing burst renderer. Only the lifetime/intensity envelope is changed.
  if (typeof addBurst === "function") {
    addBurst = function (c, kind, x, color) {
      if (!c) return;
      if (!c.bursts) c.bursts = [];
      const max = IMPACT_DUR[kind] || 0.34;
      c.bursts.push({ kind: kind, x: x, color: color, born: Date.now(), max: max });
      if (c.bursts.length > 20) c.bursts.shift();

      // Crits and deaths get a tiny visual kick only. This never touches combat math.
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

  // Sharpen damage readability without adding new DOM nodes or expensive filters.
  const style = document.createElement("style");
  style.id = "combat-impact-v153-style";
  style.textContent = [
    ".float{letter-spacing:.1px;text-shadow:0 2px 4px #000,0 0 8px #0009}",
    ".fLbl{font-weight:950;letter-spacing:.45px}",
    ".proj{will-change:transform,left}",
    ".unit img{backface-visibility:hidden;transform:translateZ(0)}"
  ].join("\n");
  document.head.appendChild(style);
})();
