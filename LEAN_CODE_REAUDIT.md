# Lean-code remaining-work audit

Audit date: 2026-09-11. Integration base: `d83da74` (PR #134); notification V105 consolidation reviewed on top of that base. This is a disposition of remaining work, not a declaration that L1–L5 are complete.

## Verified baseline

The notification candidate contains 93 static loader entries, 7 deferred core entries and 10 scripts loaded transitively by `familiars-noscr-v231.js`: **110 normal-session first-party JavaScript files**, 112 with Social, and 114 with Social + Bot Testers. Optional third-party Social modules are separate. Earlier counts omitted the transitive chain; 100 is only the index-managed subtotal. The notification change removes one request (111 → 110), not ten. A new browser contract verifies the complete set of successful first-party JS responses against the inventory.

The source-reference audit excluded ten active nested dependencies from the initial 39-file scan. They must not be source-retired. The corrected investigation list originally contained 29 files. Hero Equipment V1 and notification V105 reduced it to 27, Forge auto-batch history to 23, Rebirth V220 to 22, PR #142 Forge panel/entry history to 17, and PR #143 later Forge UX history to **10**. The current early Forge loot-UX history candidate retires V252/V253/V258, leaving **7 investigation candidates** if merged.

## Completed work missing from the older roadmap narrative

- PR #127: V127 retains immediate + 700/1800 ms legacy reconciliation; removed 50/80 ms passes. Imported-save migration remains deterministic.
- PR #129: V116 renders initially, then synchronizes mode directly; no zero-delay startup timer.
- PR #130: V216 popup synchronization runs directly at startup.
- PR #131: Boot V115 calls its existing safe startup synchronization directly.
- PR #132: Home V219 synchronizes directly at startup.
- PR #133: Hero Equipment bridge unloaded; active hero presentation remains in the base arena and V169 animation owners.
- PR #134: V138 places its entry directly at startup; bounded retry remains for an unavailable entry host.
- PR #135: the other workstream merged the Power Hint combat-end lifecycle as `f274995`; its changes are disjoint from notification/inventory work.
- PR #136: Hero Equipment V1 and notification V105 remained unloaded through the corrected runtime-inventory integration gate.
- PR #137: remaining-work audit integrated after #136 without production changes, providing the subsequent integration proof required before staged source retirement.
- PR #138: Hero Equipment V1 and notification V105 completed source retirement; ownership contracts now require source absence.
- PR #140: Forge auto-batch history V254/V258/V260/V261 completed source retirement; loaded V266 remains the canonical batch-gate authority.
- PR #141: Rebirth V220 completed source retirement; loaded V221 remains the sole scroll-preservation owner and explicitly suppresses V220.
- PR #142: Forge panel history V259/V260/V261 and standalone entry-animation history V263/V264 completed source retirement; loaded panel V266 and Forge UX V273 remain the canonical presentation owners.
- PR #143: later Forge UX history V261/V266/V268/V269/V270/V271/V272 completed source retirement after exact-head regression proof. Loaded V273 remains the event-driven loot authority with bounded/background-safe queueing, comparison-aware AUTO feedback and no permanent idle watcher.
- Early Forge UX audit: V252 was a visual-only fixed/body loot popup. V253/V257 moved results into the Forge panel and carried the then-current V254 batch selector. V258 consolidated that inline result authority. Later V261→V273 revisions superseded the loot lifecycle, while loaded `forge-auto-batch-gate-v266.js` separately owns progression gating. V252/V253/V258 are therefore historical predecessors, not active compatibility owners.

## Remaining work and evidence required

| Phase / responsibility | Current evidence | Next reviewable scope and exit condition |
| --- | --- | --- |
| L1 / L5 historical source retirement | 7 root-level tracked JS investigation candidates remain if the current three-file early Forge UX-history retirement lands. Absence alone does not prove no other references or active work. | Audit references, archived workflows, tests and concurrent owner work per family; delete only proven obsolete sources and preserve active contracts. |
| L2 Sanctuary reserve rendering | V126 retains a zero-delay `mountReserve` after `scrSanctuaire` returns HTML. | Prove a post-DOM-commit event covers initial entry, refill and rerender before transferring the mount. Calling it directly before HTML is inserted is not equivalent. |
| L2 Accomplishments migration startup | V126 retains 50 ms startup synchronization; V127/V140 have later compensation passes. | Capture legacy pending pieces and compensation sequencing across fresh boot and import before removing a delay. Migration markers and reward conservation must stay locked. |
| L2 power hints — MERGED ELSEWHERE | PR #135 replaced the 350 ms V108 poller with `handleCombatEnd` and landed as `f274995`. | Do not duplicate the implemented lifecycle transfer. Its current active tests cover installation and absence of polling; behavior-level threshold/reset coverage is a separate follow-up if that owner is changed again. |
| L2 audio | V26 polls combat at 50 ms, runs a 520 ms music cadence after unlock, and also contains a V6 PE save migration and historical raid reward wrapper. | Separate audio observation from historical economy responsibilities with legacy-save contracts before lifecycle changes. Do not retire the file as an audio-only patch. |
| L3 durable domain owners | Home/BottomNav are consolidated; Accomplishments still separates state/events, migration, reserve, modal and payout responsibilities. Forge presentation ownership is explicit between V266 panel rendering and V273 loot UX. | Consolidate only where module boundaries reduce coupling. Keep canonical future claims separate from old-save compensation. Feature-sensitive Forge/Familiars/combat work requires an owner check. |
| L4 escaping helpers | Base `game-3.js` escape does not escape apostrophes and stringifies null; Tree helpers escape apostrophes and map null/undefined to empty text. Forge helpers have further differences. | First specify input/output semantics and HTML contexts; preserve those differences with explicit adapters or retain local helpers. Blindly replacing them with base `esc` changes behavior. |
| L4 number formatting | Base and Forge formatters use different suffix, rounding and locale rules. | Obtain golden input/output cases and decide which differences are intentional before adopting a common implementation. |
| L5 staged UI sources — COMPLETED | Hero Equipment V1 and notification V105 survived the #136 exact-head integration gate and the subsequent #137 integration while remaining unloaded. | Sources are retired and ownership contracts now require absence while continuing to verify the surviving canonical owners and runtime presentation. |
| L1/L5 Forge auto-batch gate history — COMPLETED | V254/V258/V260/V261 were absent from all runtime loader paths and superseded by loaded V266; PR #140 retired their sources after exact-head regression proof. | Keep V266 loaded/canonical and the historical sources absent. |
| L1/L5 Rebirth V220 scroll history — COMPLETED | V220 was absent from runtime loaders. Loaded V221 explicitly replaces/suppresses it and PR #141 passed exact-head regression before merge. | Keep V221 exactly once in the loader, V220 source absent, and the V221 replacement/suppression contract intact. |
| L1/L5 Forge panel / entry-animation history — COMPLETED | V259/V260/V261 panel sources and V263/V264 entry-animation sources were absent from runtime loaders and active references. PR #142 retired them after V266/V273 surviving-owner proof and an exact-head regression gate. | Keep V266/V273 loaded and the five historical sources absent. |
| L1/L5 later Forge UX history — COMPLETED | V261/V266/V268/V269/V270/V271/V272 were unloaded historical Forge loot-presentation predecessors. PR #143 retired them after exact-head proof while keeping V273 unchanged. | Keep V273 loaded exactly once and preserve its bounded/background-safe event-driven lifecycle. |
| L1/L5 early Forge loot UX history — CANDIDATE | V252 is visual-only; V253/V257 and V258 are earlier inline Forge-result owners. Loaded V273 owns current loot presentation, while loaded batch-gate V266 owns the progression gating formerly coupled into the old selectors. | Retire V252/V253/V258, require source absence in the existing Forge contract, keep V273 + batch-gate V266 loaded exactly once, and pass the exact-head regression gate. |

## Unloaded root-source inventory by family

Counts and bytes below come from tracked root-level `.js` sources absent from the static/deferred/conditional and transitive Familiar loader strings. These are investigation candidates, not an automatic deletion list.

| Family | Files | Source bytes | Disposition |
| --- | ---: | ---: | --- |
| Forge / equipment | 4 | 14405 | V112/V135 UI-action history, V148 power-feedback kill-switch and V238 refund migration require separate proof |
| Familiars | 1 | 5369 | Feature-owner and archived-reference audit required |
| Progression / import | 2 | 6333 | Save-compatibility and authority audit required |
| Rebirth | 0 | 0 | V220 source retired after explicit V221 replacement proof |

The remaining investigation total is **7 files** if the current three-file early Forge loot-UX retirement lands. That batch removes **36,052 bytes** of already-unloaded source history; the normal-session runtime count remains 110 because none of those files are currently requested.

L0 inventory correction is included in the notification batch; its browser guard prevents the ten nested dependencies from being omitted again. L1, L2, L3 and L5 remain in progress. L4 now has concrete investigation evidence but no shared-helper production consolidation is claimed complete. Each production scope must still pass the exact-head moving smoke ratchet and full Chromium/WebKit gate, followed by a fresh main intersection check.
