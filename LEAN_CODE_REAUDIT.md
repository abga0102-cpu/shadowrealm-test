# Lean-code remaining-work audit

Audit date: 2026-09-11. Integration base: `d83da74` (PR #134); notification V105 consolidation reviewed on top of that base. This is a disposition of remaining work, not a declaration that L1–L5 are complete.

## Verified baseline

The notification candidate contains 93 static loader entries, 7 deferred core entries and 10 scripts loaded transitively by `familiars-noscr-v231.js`: **110 normal-session first-party JavaScript files**, 112 with Social, and 114 with Social + Bot Testers. Optional third-party Social modules are separate. Earlier counts omitted the transitive chain; 100 is only the index-managed subtotal. The notification change removes one request (111 → 110), not ten. A new browser contract verifies the complete set of successful first-party JS responses against the inventory.

The source-reference audit excluded ten active nested dependencies from the initial 39-file scan. They must not be source-retired. The corrected investigation list originally contained 29 files. Hero Equipment V1 and notification V105 then completed staged source retirement, reducing the list to 27. Forge auto-batch history V254/V258/V260/V261 reduced it to 23, and Rebirth V220 reduced it to 22. The current Forge presentation-history candidate retires five further unloaded sources after surviving-owner proof, leaving **17 investigation candidates** if merged.

## Completed work missing from the older roadmap narrative

- PR #127: V127 retains immediate + 700/1800 ms legacy reconciliation; removed 50/80 ms passes. Imported-save migration remains deterministic.
- PR #129: V116 renders initially, then synchronizes mode directly; no zero-delay startup timer.
- PR #130: V216 popup synchronization runs directly at startup.
- PR #131: Boot V115 calls its existing safe startup synchronization directly.
- PR #132: Home V219 synchronizes directly at startup.
- PR #133: Hero Equipment bridge unloaded; active hero presentation remains in the base arena and V169 animation owners.
- PR #134: V138 places its entry directly at startup; bounded retry remains for an unavailable entry host.
- PR #135: the other workstream merged the Power Hint combat-end lifecycle as `f274995`; its changes are disjoint from notification/inventory work.
- PR #136: Hero Equipment V1 and notification V105 remained unloaded through the corrected runtime-inventory integration gate; V105 presentation is owned by `style.css` and active hero presentation remains with the base arena plus V169.
- PR #137: remaining-work audit integrated after #136 without production changes, providing the subsequent integration proof required before staged source retirement.
- PR #138: Hero Equipment V1 and notification V105 completed source retirement; ownership contracts now require source absence.
- PR #140: Forge auto-batch history V254/V258/V260/V261 completed source retirement after the exact-head regression gate; loaded V266 remains the canonical batch-gate authority.
- PR #141: Rebirth V220 completed source retirement after exact-head regression proof; loaded V221 remains the sole scroll-preservation owner and explicitly suppresses V220.
- Forge presentation audit: V259 was the compact decoration layer; V260 moved Forge panel construction into the renderer and removed the V259 style; V261/V262 iterated that renderer; commit `ccf0d037` introduced V266 as the consolidated panel authority. Current `forge-panel-authority-v266.js` identifies itself as the canonical renderer-level Home Forge authority.
- Forge entry-animation audit: V263/V264 were standalone presentation-only entry styles. Current `forge-ux-v273.js` owns the event-driven loot presentation and explicitly clears both historical style IDs before installing its own current Forge UX style.

## Remaining work and evidence required

| Phase / responsibility | Current evidence | Next reviewable scope and exit condition |
| --- | --- | --- |
| L1 / L5 historical source retirement | 17 root-level tracked JS investigation candidates remain after the staged UI, Forge auto-batch, Rebirth V220 and current five-file Forge presentation-history retirements. Absence alone does not prove no other references or active work. | Audit references, archived workflows, tests and concurrent owner work per family; delete only proven obsolete sources and preserve active contracts. |
| L2 Sanctuary reserve rendering | V126 retains a zero-delay `mountReserve` after `scrSanctuaire` returns HTML. | Prove a post-DOM-commit event covers initial entry, refill and rerender before transferring the mount. Calling it directly before HTML is inserted is not equivalent. |
| L2 Accomplishments migration startup | V126 retains 50 ms startup synchronization; V127/V140 have later compensation passes. | Capture legacy pending pieces and compensation sequencing across fresh boot and import before removing a delay. Migration markers and reward conservation must stay locked. |
| L2 power hints — MERGED ELSEWHERE | PR #135 replaced the 350 ms V108 poller with `handleCombatEnd` and landed as `f274995`. | Do not duplicate the implemented lifecycle transfer. Its current active tests cover installation and absence of polling; behavior-level threshold/reset coverage is a separate follow-up if that owner is changed again. |
| L2 audio | V26 polls combat at 50 ms, runs a 520 ms music cadence after unlock, and also contains a V6 PE save migration and historical raid reward wrapper. | Separate audio observation from historical economy responsibilities with legacy-save contracts before lifecycle changes. Do not retire the file as an audio-only patch. |
| L3 durable domain owners | Home/BottomNav are consolidated; Accomplishments still separates state/events, migration, reserve, modal and payout responsibilities. Forge presentation ownership is now explicit between V266 panel rendering and V273 loot UX. | Consolidate only where module boundaries reduce coupling. Keep canonical future claims separate from old-save compensation. Feature-sensitive Forge/Familiars/combat work requires an owner check. |
| L4 escaping helpers | Base `game-3.js` escape does not escape apostrophes and stringifies null; Tree helpers escape apostrophes and map null/undefined to empty text. Forge helpers have further differences. | First specify input/output semantics and HTML contexts; preserve those differences with explicit adapters or retain local helpers. Blindly replacing them with base `esc` changes behavior. |
| L4 number formatting | Base and Forge formatters use different suffix, rounding and locale rules. | Obtain golden input/output cases and decide which differences are intentional before adopting a common implementation. |
| L5 staged UI sources — COMPLETED | Hero Equipment V1 and notification V105 survived the #136 exact-head integration gate and the subsequent #137 integration while remaining unloaded. | Sources are retired and ownership contracts now require absence while continuing to verify the surviving canonical owners and runtime presentation. |
| L1/L5 Forge auto-batch gate history — COMPLETED | V254/V258/V260/V261 were absent from all runtime loader paths and superseded by loaded V266; PR #140 retired their sources after exact-head regression proof. | Keep V266 loaded/canonical and the historical sources absent. |
| L1/L5 Rebirth V220 scroll history — COMPLETED | V220 was absent from runtime loaders. Loaded V221 explicitly replaces/suppresses it and PR #141 passed exact-head regression before merge. | Keep V221 exactly once in the loader, V220 source absent, and the V221 replacement/suppression contract intact. |
| L1/L5 Forge presentation history — CANDIDATE | V259/V260/V261 panel sources and V263/V264 entry-animation sources are absent from runtime loaders and current references. V266 owns the Home Forge panel; V273 owns current loot presentation and explicitly removes the V263/V264 historical style IDs. | Retire the five historical sources, keep V266/V273 loaded and unchanged, enforce source absence + surviving-owner contracts in the existing Forge test, and pass the exact-head regression gate. |

## Unloaded root-source inventory by family

Counts and bytes below come from tracked root-level `.js` sources absent from the static/deferred/conditional and transitive Familiar loader strings. These are investigation candidates, not an automatic deletion list.

| Family | Files | Source bytes | Disposition |
| --- | ---: | ---: | --- |
| Forge / equipment | 14 | 184233 | Feature-owner and archived-reference audit required |
| Familiars | 1 | 5369 | Feature-owner and archived-reference audit required |
| Progression / import | 2 | 6333 | Save-compatibility and authority audit required |
| Rebirth | 0 | 0 | V220 source retired after explicit V221 replacement proof |

The remaining investigation total is **17 files** if the current five-file Forge presentation-history retirement lands. That batch removes 33,773 bytes of already-unloaded presentation history; the normal-session runtime count remains 110 because none of those files are currently requested.

L0 inventory correction is included in the notification batch; its browser guard prevents the ten nested dependencies from being omitted again. L1, L2, L3 and L5 remain in progress. L4 now has concrete investigation evidence but no shared-helper production consolidation is claimed complete. Each production scope must still pass the exact-head moving smoke ratchet and full Chromium/WebKit gate, followed by a fresh main intersection check.
