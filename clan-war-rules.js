/* Shadowreach Clan War foundations.
 * Pure deterministic rules, no rewards, network calls or saved-state writes.
 * A trusted backend must validate participation, actions and score settlement.
 */
(function (root, factory) {
  'use strict';
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  if (root) root.ShadowreachClanWarRules = rules;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VICTORY_TARGET = 7;
  const ATTACK_TICKETS = 5;
  const WAR_DAYS = Object.freeze([
    Object.freeze({ day: 1, phase: 'contribution', victoryPoints: 1, actions: Object.freeze(['forge_item', 'raid_key', 'skill_summon', 'skill_upgrade']) }),
    Object.freeze({ day: 2, phase: 'contribution', victoryPoints: 2, actions: Object.freeze(['forge_gold', 'tree_research']) }),
    Object.freeze({ day: 3, phase: 'contribution', victoryPoints: 2, actions: Object.freeze(['forge_item', 'skill_summon', 'skill_upgrade', 'familiar_hatch', 'familiar_merge']) }),
    Object.freeze({ day: 4, phase: 'contribution', victoryPoints: 2, actions: Object.freeze(['forge_gold', 'raid_key']) }),
    Object.freeze({ day: 5, phase: 'contribution', victoryPoints: 2, actions: Object.freeze(['forge_item', 'tree_research', 'familiar_hatch', 'familiar_merge']) }),
    Object.freeze({ day: 6, phase: 'combat', victoryPoints: 4, actions: Object.freeze(['clan_attack', 'clan_brawl']) }),
    Object.freeze({ day: 7, phase: 'claim', victoryPoints: 0, actions: Object.freeze([]) })
  ]);

  function dayConfig(day) {
    return Number.isInteger(day) && day >= 1 && day <= 7 ? WAR_DAYS[day - 1] : null;
  }

  // Informational only. The server, not the client's clock, sets the live day.
  function utcPreviewDay(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return null;
    // Tuesday = 1; Monday = 7. UTC avoids device timezone drift.
    return ((date.getUTCDay() + 5) % 7) + 1;
  }

  function canContribute(day, action) {
    const cfg = dayConfig(day);
    return !!cfg && cfg.actions.includes(action);
  }

  // Eligible only when the member joined BEFORE the war started.
  // The backend must additionally check current membership and lockouts.
  function preWarMember(joinedAt, warStartsAt) {
    const joined = new Date(joinedAt).getTime();
    const begins = new Date(warStartsAt).getTime();
    return Number.isFinite(joined) && Number.isFinite(begins) && joined < begins;
  }

  function remainingTickets(used) {
    if (!Number.isInteger(used) || used < 0 || used > ATTACK_TICKETS) {
      throw new RangeError('Invalid war attack ticket count');
    }
    return ATTACK_TICKETS - used;
  }

  function checkedScore(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError('War score must be a non-negative safe integer');
    }
    return value;
  }

  // Only finalized server-supplied daily scores may award victory points.
  // Client-supplied event/score values MUST NOT be accepted by the backend.
  function summarizeDays(serverDays) {
    if (!Array.isArray(serverDays)) throw new TypeError('Days must be an array');
    const seen = new Set();
    let homeVictoryPoints = 0;
    let awayVictoryPoints = 0;
    let settledDays = 0;
    const details = [];
    for (const day of serverDays) {
      if (!day || !Number.isInteger(day.day) || day.day < 1 || day.day > 6 || seen.has(day.day)) {
        throw new RangeError('Invalid or repeated war day');
      }
      seen.add(day.day);
      if (typeof day.closed !== 'boolean') throw new TypeError('Day closed flag required');
      if (!day.closed) {
        details.push(Object.freeze({ day: day.day, status: 'open', victoryPoints: 0 }));
        continue;
      }
      const home = checkedScore(day.homePoints);
      const away = checkedScore(day.awayPoints);
      const weight = dayConfig(day.day).victoryPoints;
      const victor = home === away ? 'tie' : home > away ? 'home' : 'away';
      if (victor === 'home') homeVictoryPoints += weight;
      if (victor === 'away') awayVictoryPoints += weight;
      settledDays++;
      details.push(Object.freeze({ day: day.day, status: victor, victoryPoints: victor === 'tie' ? 0 : weight }));
    }
    const status = homeVictoryPoints >= VICTORY_TARGET ? 'home'
      : awayVictoryPoints >= VICTORY_TARGET ? 'away'
      : settledDays === 6 ? 'tie' : 'pending';
    return Object.freeze({
      homeVictoryPoints, awayVictoryPoints, settledDays, status,
      details: Object.freeze(details.sort((a, b) => a.day - b.day))
    });
  }

  return Object.freeze({
    VICTORY_TARGET,
    ATTACK_TICKETS,
    WAR_DAYS,
    dayConfig,
    utcPreviewDay,
    canContribute,
    preWarMember,
    remainingTickets,
    summarizeDays
  });
});
