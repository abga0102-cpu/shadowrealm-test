# Lean-code remaining-work audit

Audit date: 2026-09-11. Integration base: `d83da74` (PR #134); notification V105 consolidation reviewed on top of that base. This is a disposition of remaining work, not a declaration that L1–L5 are complete.

## Verified baseline

The notification candidate contains 93 static loader entries, 7 deferred core entries and 10 scripts loaded transitively by `familiars-noscr-v231.js`: **110 normal-session first-party JavaScript files**, 112 with Social, and 114 with Social + Bot Testers. Optional third-party Social modules are separate. Earlier counts omitted the transitive chain; 100 is only the index-managed subtotal. The notification change removes one request (111 → 110), not ten. A new browser contract verifies the complete set of successful first-party JS responses against the inventory.

The source-reference audit excluded ten active nested dependencies from the initial 39-file scan. They must not be source-retired. The corrected investigation list originally contained 29 files. Hero Equipment V1 and notification V105 then completed their staged unload/integration proof, reducing the list to 27. The next Forge history audit proves V254/V258/V260/V261 are superseded by the loaded V266 batch-gate authority, leaving **23 investigation candidates** after their source retirement.

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
- Forge auto-batch history audit: current `index.html` requests only `forge-auto-batch-gate-v266.js`, the V266 source declares itself the canonical progression authority with no dynamic loaders, and commit `c28c23b0` introduced it as “V266 consolidate Forge batch gate identifiers.” The superseded V254/V258/V260/V261 sources are therefore retired without changing active Forge behavior.

## Remaining work and evidence required

| Phase / responsibility | Current evidence | Next reviewable scope and exit condition |
| --- | --- | --- |
| L1 / L5 historical source retirement | 23 root-level tracked JS files remain absent from the index and transitive Familiar loader paths after the staged UI and Forge auto-batch history retirements. Absence alone does not prove no other references or active work. | Audit references, archived workflows, tests and concurrent owner work per family; delete only proven obsolete sources and preserve active contracts. |
| L2 Sanctuary reserve rendering | V126 retains a zero-delay `mountReserve` after `scrSanctuaire` returns HTML. | Prove a post-DOM-commit event covers initial entry, refill and rerender before transferring the mount. Calling it directly before HTML is inserted is not equivalent. |
| L2 Accomplishments migration startup | V126 retains 50 ms startup synchronization; V127/V140 have later compensation passes. | Capture legacy pending pieces and compensation sequencing across fresh boot and import before removing a delay. Migration markers and reward conservation must stay locked. |
| L2 power hints — MERGED ELSEWHERE | PR #135 replaced the 350 ms V108 poller with `handleCombatEnd` and landed as `f274995`. | Do not duplicate the implemented lifecycle transfer. Its current active tests cover installation and absence of polling; behavior-level threshold/reset coverage is a separate follow-up if that owner is changed again. |
| L2 audio | V26 polls combat at 50 ms, runs a 520 ms music cadence after unlock, and also contains a V6 PE save migration and historical raid reward wrapper. | Separate audio observation from historical economy responsibilities with legacy-save contracts before lifecycle changes. Do not retire the file as an audio-only patch. |
| L3 durable domain owners | Home/BottomNav are consolidated; Accomplishments still separates state/events, migration, reserve, modal and payout responsibilities. | Consolidate only where module boundaries reduce coupling. Keep canonical future claims separate from old-save compensation. Feature-sensitive Forge/Familiars/Rebirth/combat work requires an owner check. |
| L4 escaping helpers | Base `game-3.js` escape does not escape apostrophes and stringifies null; Tree helpers escape apostrophes and map null/undefined to empty text. Forge helpers have further differences. | First specify input/output semantics and HTML contexts; preserve those differences with explicit adapters or retain local helpers. Blindly replacing them with base `esc` changes behavior. |
| L4 number formatting | Base and Forge formatters use different suffix, rounding and locale rules. | Obtain golden input/output cases and decide which differences are intentional before adopting a common implementation. |
| L5 staged UI sources — COMPLETED | Hero Equipment V1 and notification V105 survived the #136 exact-head integration gate and the subsequent #137 integration while remaining unloaded. | Sources are retired and ownership contracts now require absence while continuing to verify the surviving canonical owners and runtime presentation. |
| L1/L5 Forge auto-batch gate history — CANDIDATE | V254/V258/V260/V261 are absent from all runtime loader paths. V254/V258 are transitional dynamic-loader bridges; V260/V261 are superseded gate revisions. Loaded V266 retains the same `forgeBatch(S)` unlock, sanitization, action-gating and picker-lock responsibilities and was introduced by the consolidation commit `c28c23b0`. | Keep V266 loaded/canonical, require the four historical sources to remain absent, and pass the exact-head regression gate with no active Forge runtime changes. |

## Unloaded root-source inventory by family

Counts and bytes below come from tracked root-level `.js` sources absent from the static/deferred/conditional and transitive Familiar loader strings. These are investigation candidates, not an automatic deletion list.

| Family | Files | Source bytes | Disposition |
| --- | ---: | ---: | --- |
| Forge / equipment | 19 | 218006 | Feature-owner and archived-reference audit required |
| Familiars | 1 | 5369 | Feature-owner and archived-reference audit required |
| Progression / import | 2 | 6333 | Save-compatibility and authority audit required |
| Rebirth | 1 | 3077 | Feature-owner and archived-reference audit required |

The remaining investigation total is **23 files** after retiring the four superseded Forge auto-batch gate sources. The two former staged UI candidates are also no longer counted because their sources were retired after subsequent integration proof.

L0 inventory correction is included in the notification batch; its browser guard prevents the ten nested dependencies from being omitted again. L1, L2, L3 and L5 remain in progress. L4 now has concrete investigation evidence but no shared-helper production consolidation is claimed complete. Each production scope must still pass the exact-head moving smoke ratchet and full Chromium/WebKit gate, followed by a fresh main intersection check.
