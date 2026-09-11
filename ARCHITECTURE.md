# Shadowreach runtime ownership

This file is the source-of-truth map for runtime ownership after the Phase 1–4 cleanup program. It is intentionally concise and should be updated whenever a change transfers ownership between loaded runtime layers.

For the active code-leaning program and cross-developer/AI coordination rules, also read `LEAN_CODE_PLAN.md`.

## Canonical owners

| Area | Canonical owner(s) | Notes |
| --- | --- | --- |
| Bottom navigation decoration / geometry / render lifecycle | `bottom-nav-layout-v183.js` | Despite the historical filename, this file contains the V209 BottomNav authority. It owns fantasy icon markup/decoration, canonical geometry, the sole `renderTabs` lifecycle wrapper, and publishes the post-render `sr:bottomnavrendered` event for scoped subscribers. |
| Premium interaction / BottomNav visual polish | `premium-ui-v209.js` | Visual/material styling only; also owns the final no-badge/no-halo recommendation presentation formerly layered by V243. Not the BottomNav geometry or render-lifecycle owner. |
| Home geometry / render lifecycle / compatibility decoration | `home-layout-authority-v219.js` | Sole loaded Home owner. Owns Home frame geometry, `srHomeFullArena`, Forge info accessibility/geometry, reward-feed compatibility, equipment-filter readability, Settings stat-card layout and toast/tutorial positioning. Lifecycle is a scoped subscriber to `sr:bottomnavrendered` plus resize/orientation/startup synchronization; it must not wrap `renderTabs`. |
| Combat cadence / impact compatibility | `combat-consolidated-v156.js` | Active combat compatibility owner. |
| Combat readability overlays | `combat-polish-v157.js` | Visual/readability responsibility only. |
| Combat animation | `combat-animation-v169.js` | Locomotion, weapon choreography, `drawArena` animation wrapping. |
| Campaign combat progression | `combat-progression-authority-v285.js` | Current enemy/boss HP progression authority. |
| Raid Évolution PE reward | `raid-pe-authority-v290.js` | Sole canonical Evolution raid PE reward owner: 100 PE at level 1, then +3 PE per raid level. `tree-safety-v83.js` only audits the final runtime value and must not wrap `raidReward`. |
| Save import | `import-save-guard-v207.js` | Sole authoritative `ACT.importSave` owner. |
| Forge item base power | `progression-overhaul-v283.js` | Current fixed-base equipment generation authority. |
| Forge Divine pre-Ascension lock | `game-balance-v224.js` | Retains the Divine rarity gate only; not current base-power owner. |
| Tree dedicated renderer / clearer gold-node labels | `tree-dedicated-v116.js` | Canonical dedicated Tree renderer and owner of the four clearer `Gain d’Or I–IV` labels formerly applied by V117. V117 is now unloaded. |
| Tree mastery gating / deep requirements / popup synchronization | `runtime-tree-stability-v216.js` | Sole active mastery owner; legacy V149 source has been retired. |
| Accomplishments Development entry lifecycle | `accomplishments-stability-v138.js` | Route-bound subscriber to V209's `sr:bottomnavrendered` lifecycle; no document-wide observer and no `renderTabs` wrapper. |
| Accomplishments modal / title rendering + title interaction / Settings entry | `accomplishments-canonical-v139.js` | Canonical `ACT.accomplishments` renderer, title owner and Settings-screen Accomplishments entry owner. It opens the canonical modal directly and must not wrap the global `openModal` function. |
| Canonical Accomplishments claims | `accomplishments-claim-v140.js` | Future claim payout authority. |
| Accomplishments merge reward / reserve synchronization | `accomplishments-merge-v126.js` | Event-driven owner: claim completion and Sanctuary screen lifecycle synchronize pending pieces/reserve; no global `render` wrapper or perpetual poller. |
| Accomplishments legacy reward migrations | `accomplishments-reward-fix-v127.js` | Sole active legacy reward-migration owner for Raid 100 and the floor25/floor50/floor75 make-good. It preserves persisted V127/V141 idempotency markers, runs bounded startup reconciliation, and chains the deterministic `migrate(...)` lifecycle for imported saves; no perpetual poller. |
| Floating Social launcher policy | `social-v1.js` | Owns launcher creation/remount and suppression policy when Social is enabled. |

## Retired / compatibility-only runtime layers

The following files may remain in source history, but must not regain active ownership. Where listed as unloaded, they should not be requested by either static script tags or the deferred loader in `index.html`.

- `social-forge-layout-v1.js` — dormant Home duplicate bundle; unloaded/non-executable.
- `premium-recommendation-cleanup-v243.js` — recommendation visual override absorbed into `premium-ui-v209.js`; retired from runtime and source.
- `bottom-nav-v53.js` — fantasy BottomNav decoration absorbed into canonical `bottom-nav-layout-v183.js`; source retained for history but unloaded from runtime.
- `home-layout-fix-v119.js` — Home compatibility decoration absorbed into canonical `home-layout-authority-v219.js`; source retained for history but unloaded from runtime.
- `accomplishments-titles-v133.js` — compatibility marker only; unloaded.
- `accomplishments-overview-v135.js` — compatibility marker only; unloaded.
- `accomplishments-home-scope-v136.js` — compatibility marker only; unloaded.
- `accomplishments-floors-v137.js` — compatibility marker only; unloaded.
- `accomplishments-ui-v123.js` — suppressed legacy UI; unloaded.
- `accomplishments-floor-comp-v141.js` — floor compensation ownership absorbed into V127; source retained as an inert compatibility marker and unloaded from runtime.
- `tree-labels-v117.js` — clearer gold-node label ownership absorbed into V116; inert source retained for history but unloaded from runtime.
- `tree-mastery-v120.js` — compatibility marker only; unloaded.
- `tree-mastery-ui-v128.js` — compatibility marker only; unloaded.
- `tree-mastery-v149.js` — retired from runtime and source; V216 owns active mastery behavior.

## Concurrency-safe workflow

1. Read `LEAN_CODE_PLAN.md` before ownership or loader changes while the lean-code program is active.
2. Fetch the current `main` SHA before starting work.
3. Branch from that exact SHA.
4. Determine the subsystem owners and files the task can touch before editing.
5. If `main` moves, inspect only the intervening commits that intersect those files/owners. Non-intersecting concurrent work should not automatically restart the task.
6. Run targeted ownership/runtime tests while iterating.
7. Run the moving smoke ratchet plus the full Chromium and iPhone/WebKit suite before merge.
8. Fetch `main` again immediately before merge. If the intervening delta intersects the task, rebuild/rebase and retest; otherwise confirm the exact tested head can still merge safely.
9. Merge only the exact tested head SHA.
10. Update this file whenever canonical ownership changes.

## Guardrail philosophy

Ownership tests are architectural regression tests, not a replacement for runtime behavior tests. They should fail when a retired owner is reintroduced, a canonical owner disappears from the loader, or a known duplicate wrapper/poller/observer returns. They should avoid brittle assumptions about unrelated gameplay values so concurrent balance/progression work can continue independently.