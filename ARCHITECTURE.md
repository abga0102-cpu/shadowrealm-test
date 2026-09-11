# Shadowreach runtime ownership

This file is the source-of-truth map for runtime ownership after the Phase 1–4 cleanup program. It is intentionally concise and should be updated whenever a change transfers ownership between loaded runtime layers.

For the active code-leaning program and cross-developer/AI coordination rules, also read `LEAN_CODE_PLAN.md`.

## Canonical owners

| Area | Canonical owner(s) | Notes |
| --- | --- | --- |
| Bottom navigation decoration / geometry / render lifecycle | `bottom-nav-layout-v183.js` | Despite the historical filename, this file contains the V209 BottomNav authority. It owns fantasy icon markup/decoration, canonical geometry, the sole `renderTabs` lifecycle wrapper, and publishes the post-render `sr:bottomnavrendered` event for scoped subscribers. |
| Premium interaction / BottomNav visual polish | `premium-ui-v209.js` | Visual/material styling only; also owns the final no-badge/no-halo recommendation presentation formerly layered by V243. Not the BottomNav geometry or render-lifecycle owner. |
| Home geometry / render lifecycle / compatibility decoration | `home-layout-authority-v219.js` | Sole loaded Home owner. Owns Home frame geometry, `srHomeFullArena`, Forge info accessibility/geometry, reward-feed compatibility, equipment-filter readability, Settings stat-card layout and toast/tutorial positioning. Lifecycle is a scoped subscriber to `sr:bottomnavrendered` plus resize/orientation/startup synchronization; it must not wrap `renderTabs`. |
| Reward notification base presentation | `style.css` | Owns the compact base `#rewardFeed` / `.rewardPop` presentation formerly injected by V105. Home-only reward-feed geometry remains scoped to `home-layout-authority-v219.js`. |
| Combat cadence / impact compatibility | `combat-consolidated-v156.js` | Active combat compatibility owner. |
| Combat readability overlays | `combat-polish-v157.js` | Visual/readability responsibility only. |
| Combat animation | `combat-animation-v169.js` | Locomotion, weapon choreography, `drawArena` animation wrapping. |
| Campaign combat progression | `combat-progression-authority-v285.js` | Current enemy/boss HP progression authority. |
| Raid Évolution PE reward | `raid-pe-authority-v290.js` | Sole canonical Evolution raid PE reward owner: 100 PE at level 1, then +3 PE per raid level. `tree-safety-v83.js` only audits the final runtime value and must not wrap `raidReward`. |
| Save import | `import-save-guard-v207.js` | Sole authoritative `ACT.importSave` owner. |
| Forge item base power | `progression-overhaul-v283.js` | Current fixed-base equipment generation authority. |
| Forge Divine pre-Ascension lock | `game-balance-v224.js` | Retains the Divine rarity gate only; not current base-power owner. |
| Forge auto-batch unlock gating | `forge-auto-batch-gate-v266.js` | Canonical loaded owner for allowed batch choices, persisted selection sanitization, action gating and picker lock state. Historical V254/V258/V260/V261 gate sources are retired. |
| Forge Home panel presentation | `forge-panel-authority-v266.js` | Canonical renderer-level Home Forge owner for panel structure, accelerator presentation, loot reserve, Forge actions/AUTO state, filter placement and mobile geometry. Historical compact/panel V259/V260/V261 sources are retired. |
| Forge loot presentation / entry animation | `forge-ux-v273.js` | Current event-driven Forge loot authority. Owns the live loot zone, bounded/background-safe transient and kept-result lifecycle, comparison-aware AUTO feedback and idle watcher shutdown. Early V252/V253/V258, entry-animation V263/V264 and later V261/V266/V268–V272 presentation predecessors are retired. |
| Forge comparison / power-delta presentation | `forge-comparison-authority-v146.js` | Current loaded comparison-card owner. Owns inline worn-vs-forged comparison and power-delta presentation (`powDelta` / `srCmpPow`). The historical center-screen V148 feedback popup/kill-switch is retired. |
| Rebirth scroll preservation | `rebirth-scroll-natural-v221.js` | Sole loaded Rebirth scroll-preservation owner. V221 explicitly replaces V220 with continuous position preservation and suppresses the older V220 layer if it is ever encountered. |
| Tree dedicated renderer / clearer gold-node labels | `tree-dedicated-v116.js` | Canonical dedicated Tree renderer and owner of the four clearer `Gain d’Or I–IV` labels formerly applied by V117. V117 is now unloaded. |
| Tree mastery gating / deep requirements / popup synchronization | `runtime-tree-stability-v216.js` | Sole active mastery owner; legacy V149 source has been retired. |
| Accomplishments Development entry lifecycle | `accomplishments-stability-v138.js` | Route-bound subscriber to V209's `sr:bottomnavrendered` lifecycle; no document-wide observer and no `renderTabs` wrapper. |
| Accomplishments modal / title rendering + title interaction / Settings entry | `accomplishments-canonical-v139.js` | Canonical `ACT.accomplishments` renderer, title owner and Settings-screen Accomplishments entry owner. It opens the canonical modal directly and must not wrap the global `openModal` function. |
| Canonical Accomplishments claims | `accomplishments-claim-v140.js` | Future claim payout authority. |
| Accomplishments merge reward / reserve synchronization | `accomplishments-merge-v126.js` | Event-driven owner: claim completion and Sanctuary screen lifecycle synchronize pending pieces/reserve; no global `render` wrapper or perpetual poller. |
| Accomplishments legacy reward migrations | `accomplishments-reward-fix-v127.js` | Sole active legacy reward-migration owner for Raid 100 and the floor25/floor50/floor75 make-good. It preserves persisted V127/V141 idempotency markers, runs bounded startup reconciliation, and chains the deterministic `migrate(...)` lifecycle for imported saves; no perpetual poller. |
| Floating Social launcher policy | `social-v1.js` | Owns launcher creation/remount and suppression policy when Social is enabled. |

## Architecture-first file placement

The canonical owner map is also the default placement map for new work. **Existing owners are extended before new production modules are introduced.**

Use this decision order for every production-code change:

1. Identify the canonical owner for the requested responsibility from the table above and inspect that file first.
2. Search adjacent active owners when the responsibility crosses a documented boundary such as lifecycle vs presentation, canonical behavior vs migration, or shared state vs UI.
3. If the requested behavior belongs to an existing owner's responsibility, place it there. Do not create a sibling patch file merely to avoid editing the owner.
4. If an owner has become too broad, refactor or transfer a coherent responsibility deliberately instead of stacking a wrapper/override layer.
5. Admit a new production JavaScript file only when the responsibility is genuinely new, durable, and cannot fit an existing owner without breaking cohesion or creating worse coupling.

A new production module is therefore an **architecture exception**, not the default implementation pattern. Its PR must name the existing owner(s) considered, explain why they are unsuitable, register the new file as a canonical owner here, and add/update ownership and behavior contracts. If the file is loaded at runtime, update `RUNTIME_INVENTORY.md` and the loader documentation as part of the same change.

New version-suffixed patch files such as `*-v123.js` are prohibited by default. A versioned filename requires a concrete compatibility or external-versioning reason in the PR; “new iteration,” “safer patch,” or “easier than editing the owner” is not sufficient justification.

`tests/architecture-file-placement-guard.js` enforces this admission rule in CI for newly added production JavaScript. Test, fixture, documentation, and CI/tooling files remain free to use their established directories because they are not runtime ownership modules.

## Retired / compatibility-only runtime layers

The following files may remain in source history, but must not regain active ownership. Where listed as unloaded, they should not be requested by either static script tags or the deferred loader in `index.html`.

- `social-forge-layout-v1.js` — dormant Home duplicate bundle; unloaded/non-executable.
- `premium-recommendation-cleanup-v243.js` — recommendation visual override absorbed into `premium-ui-v209.js`; retired from runtime and source.
- `bottom-nav-v53.js` — fantasy BottomNav decoration absorbed into canonical `bottom-nav-layout-v183.js`; source retained for history but unloaded from runtime.
- `home-layout-fix-v119.js` — Home compatibility decoration absorbed into canonical `home-layout-authority-v219.js`; source retained for history but unloaded from runtime.
- `hero-equipment-v1.js` — retired visual safety bridge formerly cleaning obsolete Hero Equipment artifacts after `drawArena`; retired from runtime and source after staged integration proof. Active hero animation/weapon presentation remains owned by the base arena renderer plus `combat-animation-v169.js`.
- `notification-compact-v105.js` — its six compact reward-notification overrides are absorbed into `style.css`; retired from runtime and source after staged integration proof.
- `forge-auto-batch-gate-v254.js`, `forge-auto-batch-gate-v258.js`, `forge-auto-batch-gate-v260.js`, `forge-auto-batch-gate-v261.js` — superseded Forge auto-batch gate chain retired from runtime and source; `forge-auto-batch-gate-v266.js` is the sole loaded gate owner.
- `forge-loot-visual-v252.js`, `forge-ux-v253.js`, `forge-ux-v258.js` — superseded early Forge result-presentation chain retired from source; `forge-ux-v273.js` owns current loot presentation while `forge-auto-batch-gate-v266.js` owns progression-gated batch choices.
- `forge-panel-compact-v259.js`, `forge-panel-authority-v260.js`, `forge-panel-authority-v261.js` — superseded Forge Home-panel presentation history retired from runtime and source; `forge-panel-authority-v266.js` is the canonical loaded renderer owner.
- `forge-entry-animation-v263.js`, `forge-entry-animation-v264.js` — superseded standalone Forge loot-entry animation history retired from runtime and source; `forge-ux-v273.js` owns current loot presentation and explicitly clears their historical style IDs.
- `forge-ux-v261.js`, `forge-ux-v266.js`, `forge-ux-v268.js`, `forge-ux-v269.js`, `forge-ux-v270.js`, `forge-ux-v271.js`, `forge-ux-v272.js` — superseded later Forge loot-presentation lineage retired from source; loaded `forge-ux-v273.js` is the current event-driven owner.
- `forge-power-feedback-v148.js` — bounded kill-switch for a retired center-screen Forge power popup; source retired after no active hook/reference remained. Current comparison power deltas are owned inline by `forge-comparison-authority-v146.js`.
- `rebirth-scroll-stability-v220.js` — superseded Rebirth scroll-preservation layer retired from runtime and source; loaded `rebirth-scroll-natural-v221.js` explicitly replaces and suppresses V220.
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
- `tree-simple-v90.js` — unloaded historical simple renderer retired from source; V116 remains the sole dedicated Tree renderer.
- `personal-tree-mastery-clarity-v213.js` — unloaded legacy mastery/observer layer retired from source; V216 owns its surviving mastery gating, visuals and popup synchronization.

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
