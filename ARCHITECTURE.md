# Shadowreach runtime ownership

This file is the source-of-truth map for runtime ownership after the Phase 1–4 cleanup program. It is intentionally concise and should be updated whenever a change transfers ownership between loaded runtime layers.

## Canonical owners

| Area | Canonical owner(s) | Notes |
| --- | --- | --- |
| Bottom navigation geometry | `bottom-nav-v209.js` | Sole BottomNav geometry authority. |
| Home geometry / render lifecycle | `home-layout-authority-v219.js` | Owns Home frame geometry, `srHomeFullArena`, and Home render lifecycle. |
| Home compatibility decoration | `home-layout-fix-v119.js` | Decoration/compatibility only; must not own Home or BottomNav geometry. |
| Combat cadence / impact compatibility | `combat-consolidated-v156.js` | Active combat compatibility owner. |
| Combat readability overlays | `combat-polish-v157.js` | Visual/readability responsibility only. |
| Combat animation | `combat-animation-v169.js` | Locomotion, weapon choreography, `drawArena` animation wrapping. |
| Campaign combat progression | `combat-progression-authority-v285.js` | Current enemy/boss HP progression authority. |
| Save import | `import-save-guard-v207.js` | Sole authoritative `ACT.importSave` owner. |
| Forge item base power | `progression-overhaul-v283.js` | Current fixed-base equipment generation authority. |
| Forge Divine pre-Ascension lock | `game-balance-v224.js` | Retains the Divine rarity gate only; not current base-power owner. |
| Tree mastery level-3 gating / popup requirements | `tree-mastery-v149.js` | Sole loaded mastery gating/popup authority. |
| Accomplishments Development entry lifecycle | `accomplishments-stability-v138.js` | Route-bound lifecycle owner; no document-wide observer. |
| Accomplishments modal / title rendering + title interaction | `accomplishments-canonical-v139.js` | Canonical Accomplishments renderer and title owner. |
| Canonical Accomplishments claims | `accomplishments-claim-v140.js` | Future claim payout authority. |
| Raid 100 legacy compensation | `accomplishments-reward-fix-v127.js` | Migration/startup compatibility only; no perpetual poller. |
| Floating Social launcher policy | `social-v1.js` | Owns launcher creation/remount and suppression policy. |

## Retired / compatibility-only runtime layers

The following files may remain in source history, but must not regain active ownership. Where listed as unloaded, they should not be requested by `index.html`.

- `social-forge-layout-v1.js` — dormant Home duplicate bundle; unloaded/non-executable.
- `accomplishments-titles-v133.js` — compatibility marker only; unloaded.
- `accomplishments-overview-v135.js` — compatibility marker only; unloaded.
- `accomplishments-home-scope-v136.js` — compatibility marker only; unloaded.
- `accomplishments-floors-v137.js` — compatibility marker only; unloaded.
- `accomplishments-ui-v123.js` — suppressed legacy UI; unloaded.
- `tree-mastery-v120.js` — compatibility marker only; unloaded.
- `tree-mastery-ui-v128.js` — compatibility marker only; unloaded.

## Concurrency-safe workflow

1. Fetch the current `main` SHA before starting work.
2. Branch from that exact SHA.
3. Determine the subsystem owners and files the task can touch before editing.
4. If `main` moves, inspect only the intervening commits that intersect those files/owners. Non-intersecting concurrent work should not automatically restart the task.
5. Run targeted ownership/runtime tests while iterating.
6. Run the moving smoke ratchet plus the full Chromium and iPhone/WebKit suite before merge.
7. Fetch `main` again immediately before merge. If the intervening delta intersects the task, rebase/rebuild and retest; otherwise confirm the exact tested head can still merge safely.
8. Merge only the exact tested head SHA.
9. Update this file whenever canonical ownership changes.

## Guardrail philosophy

Ownership tests are architectural regression tests, not a replacement for runtime behavior tests. They should fail when a retired owner is reloaded, a canonical owner disappears, or a known duplicate wrapper/poller/observer is reintroduced. They should avoid brittle assumptions about unrelated gameplay values so concurrent balance/progression work can continue independently.
