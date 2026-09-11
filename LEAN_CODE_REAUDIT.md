# Lean-code remaining-work audit

Audit date: 2026-09-11. Integration base: `d83da74` (PR #134); notification V105 consolidation reviewed on top of that base. This is a disposition of remaining work, not a declaration that L1–L5 are complete.

## Verified baseline

The notification candidate contains 93 static loader entries, 7 deferred core entries and 10 scripts loaded transitively by `familiars-noscr-v231.js`: **110 normal-session first-party JavaScript files**, 112 with Social, and 114 with Social + Bot Testers. Optional third-party Social modules are separate. Earlier counts omitted the transitive chain; 100 is only the index-managed subtotal. The notification change removes one request (111 → 110), not ten. A new browser contract verifies the complete set of successful first-party JS responses against the inventory.

The source-reference audit excluded ten active nested dependencies from the initial 39-file scan. They must not be source-retired. The corrected investigation list contains 29 files.

## Completed work missing from the older roadmap narrative

- PR #127: V127 retains immediate + 700/1800 ms legacy reconciliation; removed 50/80 ms passes. Imported-save migration remains deterministic.
- PR #129: V116 renders initially, then synchronizes mode directly; no zero-delay startup timer.
- PR #130: V216 popup synchronization runs directly at startup.
- PR #131: Boot V115 calls its existing safe startup synchronization directly.
- PR #132: Home V219 synchronizes directly at startup.
- PR #133: Hero Equipment bridge unloaded; active hero presentation remains in the base arena and V169 animation owners.
- PR #134: V138 places its entry directly at startup; bounded retry remains for an unavailable entry host.
- PR #135: the other workstream merged the Power Hint combat-end lifecycle as `f274995`; its changes are disjoint from notification/inventory work.

## Remaining work and evidence required

| Phase / responsibility | Current evidence | Next reviewable scope and exit condition |
| --- | --- | --- |
| L1 / L5 historical source retirement | 29 root-level tracked JS files are absent from the index and transitive Familiar loader paths on the notification candidate. Absence alone does not prove no other references or active work. | Audit references, archived workflows, tests and concurrent owner work per family; delete only proven obsolete sources and preserve active contracts. |
| L2 Sanctuary reserve rendering | V126 retains a zero-delay `mountReserve` after `scrSanctuaire` returns HTML. | Prove a post-DOM-commit event covers initial entry, refill and rerender before transferring the mount. Calling it directly before HTML is inserted is not equivalent. |
| L2 Accomplishments migration startup | V126 retains 50 ms startup synchronization; V127/V140 have later compensation passes. | Capture legacy pending pieces and compensation sequencing across fresh boot and import before removing a delay. Migration markers and reward conservation must stay locked. |
| L2 power hints — MERGED ELSEWHERE | PR #135 replaced the 350 ms V108 poller with `handleCombatEnd` and landed as `f274995`. | Do not duplicate the implemented lifecycle transfer. Its current active tests cover installation and absence of polling; behavior-level threshold/reset coverage is a separate follow-up if that owner is changed again. |
| L2 audio | V26 polls combat at 50 ms, runs a 520 ms music cadence after unlock, and also contains a V6 PE save migration and historical raid reward wrapper. | Separate audio observation from historical economy responsibilities with legacy-save contracts before lifecycle changes. Do not retire the file as an audio-only patch. |
| L3 durable domain owners | Home/BottomNav are consolidated; Accomplishments still separates state/events, migration, reserve, modal and payout responsibilities. | Consolidate only where module boundaries reduce coupling. Keep canonical future claims separate from old-save compensation. Feature-sensitive Forge/Familiars/Rebirth/combat work requires an owner check. |
| L4 escaping helpers | Base `game-3.js` escape does not escape apostrophes and stringifies null; Tree helpers escape apostrophes and map null/undefined to empty text. Forge helpers have further differences. | First specify input/output semantics and HTML contexts; preserve those differences with explicit adapters or retain local helpers. Blindly replacing them with base `esc` changes behavior. |
| L4 number formatting | Base and Forge formatters use different suffix, rounding and locale rules. | Obtain golden input/output cases and decide which differences are intentional before adopting a common implementation. |
| L5 newly unloaded UI sources | Hero Equipment V1 and notification V105 are retained for staged proof. | After subsequent integration validation, retire each source with its ownership contract updated; do not remove source-presence guards without replacement. |

## Unloaded root-source inventory by family

Counts and bytes below come from tracked root-level `.js` sources absent from the static/deferred/conditional and transitive Familiar loader strings. These are investigation candidates, not an automatic deletion list.

| Family | Files | Source bytes | Disposition |
| --- | ---: | ---: | --- |
| Forge / equipment | 23 | 231658 | Feature-owner and archived-reference audit required |
| Familiars | 1 | 5369 | Feature-owner and archived-reference audit required |
| Progression / import | 2 | 6333 | Save-compatibility and authority audit required |
| Rebirth | 1 | 3077 | Feature-owner and archived-reference audit required |
| Staged UI sources | 2 | 2056 | Retain until subsequent integration proof |

L0 inventory correction is included in the notification batch; its new browser guard prevents the ten nested dependencies from being omitted again. L1, L2, L3 and L5 remain in progress. L4 now has concrete investigation evidence but no shared-helper production consolidation is claimed complete. Each production scope must still pass the exact-head moving smoke ratchet and full Chromium/WebKit gate, followed by a fresh main intersection check.
