# Shadowreach runtime ownership

This file is the source-of-truth map for runtime ownership after the Phase 1–4 cleanup program. It is intentionally concise and should be updated whenever a change transfers ownership between loaded runtime layers.

For the active code-leaning program and cross-developer/AI coordination rules, also read `LEAN_CODE_PLAN.md`.

## Canonical owners

| Area | Canonical owner(s) | Notes |
| --- | --- | --- |
| Bottom navigation decoration / geometry / render lifecycle | `bottom-nav-layout-v183.js` | Despite the historical filename, this file contains the V209 BottomNav authority. It owns fantasy icon markup/decoration, canonical geometry, the sole `renderTabs` lifecycle wrapper, permanent navigation taxonomy, duplicate-free Progression/Menu hub composition, and publishes the post-render `sr:bottomnavrendered` event for scoped subscribers. |
| Premium interaction / BottomNav visual polish | `premium-ui-v209.js` | Visual/material styling only; owns the final no-badge/no-halo recommendation presentation formerly layered by V243 and the current cleaner arcade-RPG visual language (dark navy/gold identity, restrained tactile controls, semantic CTA hierarchy and quieter cards/HUD/nav styling). Not the BottomNav geometry, navigation taxonomy or render-lifecycle owner. |
| Home geometry / render lifecycle / compatibility decoration | `home-layout-authority-v219.js` | Sole loaded Home owner. Owns Home frame geometry, `srHomeFullArena`, Forge info accessibility/geometry, reward-feed compatibility, and V463's measured starter-roadmap placement below the full campaign stage tag (title, progress and wave chips), plus compact mobile sizing. Also owns equipment-filter readability, Settings stat-card layout, toast/tutorial positioning and suppression of redundant permanent Home shortcuts that are now owned by BottomNav/Progression/Menu. Lifecycle is a scoped subscriber to `sr:bottomnavrendered` plus resize/orientation/startup synchronization; it must not wrap `renderTabs`. |
| Modal lifecycle stability / campaign compact tagging | `ui-stability-v83.js` | Owns the guarded `openModal`/`closeModal` lifecycle, queued-modal draining, overlay persistence tagging and canonical `sr:modal-state` publication. Campaign compact tagging follows `sr:bottomnavrendered` with one animation-frame deferral after the core screen commit. PR #168 retired the remaining broad `#app` child-list observer after #166's observerless Chromium/WebKit proof; modal transitions now remain on the guarded lifecycle plus startup synchronization, with no replacement observer or timer. |
| Reward notification base presentation | `style.css` | Owns the compact base `#rewardFeed` / `.rewardPop` presentation formerly injected by V105. Home-only reward-feed geometry remains scoped to `home-layout-authority-v219.js`. |
| Combat cadence / impact compatibility | `combat-consolidated-v156.js` | Active combat compatibility owner. |
| Combat readability overlays | `combat-polish-v157.js` | Visual/readability responsibility only. |
| Combat animation | `combat-animation-v169.js` | Locomotion, weapon choreography, `drawArena` animation wrapping. |
| Starter Minerai / Forge teaching reward | `combat-progression-authority-v285.js` | Owns the one-time 100 Minerai reward after the teaching defeat at 1-2, protected by the existing V323 grant marker. `game-1.js` and `progression-integration-pack-v305.js` start new states at zero; stage-gold no longer wraps starter defaults. Existing saved balances remain intact. |
| Campaign combat progression | `combat-progression-authority-v285.js` | Current enemy/boss HP progression authority. |
| Live enemy pressure / first-Boss onboarding pressure | `enemy-damage-authority-v289.js` | Owns the currently loaded Campaign/Raid HP and damage reductions and early-pressure window. V462 adds a campaign-only Facile 1-5 Boss modifier (+40% HP, +20% damage) after canonical construction; Mega-Boss construction is explicitly excluded. |
| Facile → Difficile difficulty bridge | `campaign-tier-balance-v352.js` | V473 preserves the Facile floor-61→100 smoothing, then adds a post-Boss bridge through Difficile 2-10 (floor 130). Normal HP begins at 0.52; Difficile Boss HP uses a 0.42 bridge start and damage 0.50, both returning progressively to 1.00. This calibrates Difficile 1-5 near +55–60% over the Facile 5-20 Boss instead of the previous multi-fold jump. No Raid/Mega scaling is changed. |
| Mega-Boss encounter identity / progression display | `game-2.js`, `game-3.js`, `game-4.js` | V480 makes the Mega route explicitly Boss-only. Eligible challenges still come only from cleared Campaign Boss floors, `startMegaBoss` remains a single-enemy Boss encounter, and `makeMegaBossEnemy` hardens `boss=true` / `elite=false`. The arena uses a dedicated Mega track where every stage is rendered as a Boss; Campaign Elite markers are never reused. HP/damage ×10 rules are unchanged. |
| Final early-Facile spawn rebalance | `campaign-early-rebalance-v449.js` | V479 restores this runtime file byte-for-byte to its pre-V478/V465 behavior. It applies the approved Facile 1-2→5-4 and 5-5→5-19 bands, then immediately returns untouched enemies outside those bands. It must not be extended with diagnostic state or a generic final-rule wrapper. Campaign power auditing lives in tests only so observation cannot change live enemy values. |
| Starter Build → Familiar pacing | `progression-integration-pack-v305.js`, `game-5.js`, `game-4.js` | Progression owns milestone timing/state: Build intro at Facile 1-5, starter egg grant at Facile 1-8, and completion only after the player manually starts that egg. `game-5.js` renders/gates the route intros; `game-4.js` renders the stored egg CTA and starter 30 s duration. Existing completed starter saves are not re-enrolled. |
| Familiar hatch timers / Tree hatch speed | `game-1.js`, `progression-batch-qa-v307.js`, `game-5.js` | V476 timers: Commun 10 min, Peu commun 30 min, Rare 2 h, Épique 8 h, Mythique 24 h, Ancestral 2 j, Légendaire 6 j, Divin 21 j. Ancestral and Divin now have hatch-speed Tree families. Every rarity has four 5-level nodes at +6%/level and a hard +120% speed cap. |
| Tree research pacing / 0→1 specials | `game-1.js`, `tree-research-v122.js` | V477 fixes the late runtime authority so the approved V476 ladders survive full boot: Palier I 4/8/14/22/32 min; Palier II 3h/3h05/3h10/3h15/3h20; Palier III 10h/10h05/10h10/10h15/10h20; Palier IV 3j/3j05h/3j10h/3j15h/3j20h. A normal Palier special node with max=1 takes the full 0→5 duration of its tier; mastery keys retain their dedicated 7-day timer. Research already running before V477 keeps its scheduled end time. |
| Split Autonomy yield | `game-1.js`, `familiar-ladder-authority-v295.js`, `game-4.js`, `game-5.js` | V476 replaces the universal yield branch with independent Or, Minéraux, Essence and Étincelles branches. Each resource is 5%/h base and can independently reach 20%/h (+15 points from Tree). Existing universal nX_07 investment is copied once into the three new branches while nX_07 becomes Autonomie Or, preserving old-save output. |
| Raid Évolution PE reward | `raid-pe-authority-v290.js` | Sole canonical Evolution raid PE reward owner: 100 PE at level 1, then +3 PE per raid level. Historical Tree auditing now lives in `personal-tree-radial-v82.js` and must remain observational; retired `tree-safety-v83.js` must not regain `raidReward` ownership. |
| Raid Minerai reward | `raid-reward-authority-v396.js`, `raid-minerai-active-balance-v282.js` | V471 final curve: level 1 = 500; +25/level through 10 = 725; +10/level through 50 = 1 125; +5/level afterward = 1 225 at level 70. V396 remains the final live reward owner; V282 mirrors the curve for compatibility. |
| Save import | `import-save-guard-v207.js` | Sole authoritative `ACT.importSave` owner. |
| Forge item base power | `progression-overhaul-v283.js` | Current fixed-base equipment generation authority. |
| Forge Gold payout / Global Gold tree | `game-2.js`, `game-1.js`, `familiar-ladder-authority-v295.js` | V476 keeps the rarity-based paid-Forge Gold table 10/15/18/33/45/60/105/180/300/450/650 and restores the four `goldAll` nodes to +5/+10/+15/+20% max by tier, exactly +50% total. Bonus free Forge results still mint no Gold. `goldMul` applies the same bonus to Campaign, Gold Raid and Forge Gold. |
| Equipment Dust upgrade cost | `progression-overhaul-v283.js` | V469 is the sole live cost authority: `15 + 9 × upgradeLevel` Dust, exactly half of the prior `30 + 18 × upgradeLevel` curve. |
| Equipment Dust upgrade power | `game-2.js`, `progression-qa-authority-v287.js`, `game-5.js` | V472 raises a successful Dust enhancement from +1% to +3% of the item's reference stat per upgrade level. V287 is the late runtime authority and migrates already-upgraded gear upward only (`Math.max`), never reducing owned stats. `upgradeItem` reports the true resulting global-Power delta and V5 displays it in the success toast. Upgrade chance remains unchanged. |
| Dust acquisition / recycling | `dust-economy-authority-v293.js`, `forge-dust-integrity-v344.js`, `sanctuary-endgame-v130.js` | V467 doubles all new Dust acquisition without multiplying owned balances. V469 separately halves equipment upgrade costs. Recycling values are rarity-based at 2/4/8/16/24/40/70/120/200/320/500; the integrity layer keeps manual and Auto-Forge recycling identical. Sanctuary Mythique II grants 200 Dust. |
| Equipment Mastery rank / Dust rank rewards | `game-1.js`, `game-2.js`, `forge-panel-authority-v266.js` | `game-1.js` owns the unchanged Roman thresholds, doubled per-rank Dust table (100→900) and persisted `masteryDustClaimedRank` claim contract. Already-claimed ranks are never paid again; unclaimed ranks use the current V467 amounts. `game-2.js` pays only on future paid-Forge rank crossings; bonus free Forge results never advance or pay mastery. The Forge panel only previews the next reward. |
| Forge Divine pre-Ascension lock | `game-balance-v224.js` | Retains the Divine rarity gate only; not current base-power owner. |
| Forge auto-batch unlock gating | `forge-auto-batch-gate-v266.js` | Canonical loaded owner for allowed batch choices, persisted selection sanitization, action gating and picker lock state. Historical V254/V258/V260/V261 gate sources are retired. |
| Forge Home panel presentation | `forge-panel-authority-v266.js` | Canonical renderer-level Home Forge owner for panel structure, accelerator presentation, loot reserve, Forge actions/AUTO state, filter placement and mobile geometry. Historical compact/panel V259/V260/V261 sources are retired. |
| Forge loot presentation / entry animation | `forge-ux-v273.js` | Current event-driven Forge loot authority. Owns the live loot zone, bounded/background-safe transient and kept-result lifecycle, comparison-aware AUTO feedback and idle watcher shutdown. Early V252/V253/V258, entry-animation V263/V264 and later V261/V266/V268–V272 presentation predecessors are retired. |
| Rebirth scroll preservation | `rebirth-scroll-natural-v221.js` | Sole loaded Rebirth scroll-preservation owner. V221 explicitly replaces V220 with continuous position preservation and suppresses the older V220 layer if it is ever encountered. |
| Tree topology / mastery-key compatibility | `personal-tree-radial-v82.js` | Owns Tree route topology rewriting, mastery-key node construction, deprecated historical key save compatibility, bridge requirements, mastery-key acquisition compatibility, raw-save restoration for the five official mastery keys, and the historical observational `__srTreeAudit` API. PRs #213/#214 removed V82's duplicate renderer, renderer helpers, injected presentation CSS and renderer-only angle metadata; rendering remains owned by V116 and live mastery gating/popup synchronization by V216. |
| Tree dedicated renderer / presentation | `tree-dedicated-v116.js` | Canonical dedicated Tree renderer and owner of the four clearer `Gain d’Or I–IV` labels formerly applied by V117. PR #230 also folded the presentation-only V247/V250 spectacle CSS into V116, so the standalone V247 presentation layer is retired. |
| Tree mastery gating / deep requirements / popup synchronization | `runtime-tree-stability-v216.js` | Sole active mastery owner; legacy V149 source has been retired. |
| Accomplishments Development entry lifecycle / presentation layer | `accomplishments-stability-v138.js` | Route-bound subscriber to V209's `sr:bottomnavrendered` lifecycle; no document-wide observer and no `renderTabs` wrapper. Also owns the Arena launcher and the presentation-only Pass decoration. V481 is the effective visible redesign owner: it decorates the real post-render DOM with status ribbons, reward-lane labels, stronger claimable/done hierarchy, and a stacked mobile floor-card layout. It does not change payouts or progression. |
| Accomplishments modal / title rendering + title interaction / Progression entry | `accomplishments-canonical-v139.js` | Canonical `ACT.accomplishments` renderer, title owner and Progression-screen Accomplishments entry owner. It exposes the V481 visual marker plus the existing global stats, per-objective progress markup, claimable/done state classes and transient claim feedback while preserving all completion/reward semantics. It opens the canonical modal directly, inserts the entry structurally into the canonical Progression pad, refuses duplicate entries, and must not wrap the global `openModal` function. |
| Fusion milestone payouts | `fusion-gold-rewards-v352.js` | V468 is the live Fusion reward authority loaded by `accomplishments-launcher-compact-v332.js`: free 50/150/250/350/500 milestones pay 500/750/1 000/1 500/2 000 Minerai; Premium stays 10k/20k/30k/40k/60k Gold. 1 000/1 500 Fusion payouts remain Gold. Claim state is persistent and no milestone is reset repeatedly. |
| Canonical Accomplishments claims | `accomplishments-claim-v140.js` | Fallback claim authority aligned with the live Fusion ladder plus the other accomplishment categories. |
| Accomplishments merge reward / reserve synchronization | `accomplishments-merge-v126.js` | Event-driven owner: claim completion and Sanctuary screen lifecycle synchronize pending pieces/reserve; no global `render` wrapper or perpetual poller. |
| Accomplishments legacy reward migrations | `accomplishments-reward-fix-v127.js` | Sole active legacy reward-migration owner for Raid 100 and the floor25/floor50/floor75 make-good. It preserves persisted V127/V141 idempotency markers, runs bounded startup reconciliation, and chains the deterministic `migrate(...)` lifecycle for imported saves; no perpetual poller. |
| Floating Social launcher policy | `social-v1.js` | Owns launcher creation/remount and suppression policy when Social is enabled. |
| Social message-store policy | `social-v1.js` | Canonical owner of the `shadowreach.social.v1.messages` key, 160-message retention, malformed/non-array read fallback, and capped serialization. `social-p2p-v1.js`, `social-bot-testers-v5.js`, and `social-bot-ui-v1.js` consume this contract while retaining their own write-error and same-tab notification behavior where applicable. |

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

- `social-forge-layout-v1.js` — dormant Home duplicate bundle; retired from runtime and source.
- `premium-recommendation-cleanup-v243.js` — recommendation visual override absorbed into `premium-ui-v209.js`; retired from runtime and source.
- `bottom-nav-v53.js` — fantasy BottomNav decoration absorbed into canonical `bottom-nav-layout-v183.js`; retired from runtime and source.
- `home-layout-fix-v119.js` — Home compatibility decoration absorbed into canonical `home-layout-authority-v219.js`; retired from runtime and source.
- `hero-equipment-v1.js` — retired visual safety bridge formerly cleaning obsolete Hero Equipment artifacts after `drawArena`; retired from runtime and source after staged integration proof. Active hero animation/weapon presentation remains owned by the base arena renderer plus `combat-animation-v169.js`.
- `notification-compact-v105.js` — its six compact reward-notification overrides are absorbed into `style.css`; retired from runtime and source after staged integration proof.
- `forge-auto-batch-gate-v254.js`, `forge-auto-batch-gate-v258.js`, `forge-auto-batch-gate-v260.js`, `forge-auto-batch-gate-v261.js` — superseded Forge auto-batch gate chain retired from runtime and source; `forge-auto-batch-gate-v266.js` is the sole loaded gate owner.
- `forge-loot-visual-v252.js`, `forge-ux-v253.js`, `forge-ux-v258.js` — superseded early Forge result-presentation chain retired from source; `forge-ux-v273.js` owns current loot presentation while `forge-auto-batch-gate-v266.js` owns progression-gated batch choices.
- `forge-panel-compact-v259.js`, `forge-panel-authority-v260.js`, `forge-panel-authority-v261.js` — superseded Forge Home-panel presentation history retired from runtime and source; `forge-panel-authority-v266.js` is the canonical loaded renderer owner.
- `forge-entry-animation-v263.js`, `forge-entry-animation-v264.js` — superseded standalone Forge loot-entry animation history retired from runtime and source; `forge-ux-v273.js` owns current loot presentation and explicitly clears their historical style IDs.
- `forge-ux-v261.js`, `forge-ux-v266.js`, `forge-ux-v268.js`, `forge-ux-v269.js`, `forge-ux-v270.js`, `forge-ux-v271.js`, `forge-ux-v272.js` — superseded later Forge loot-presentation lineage retired from source; loaded `forge-ux-v273.js` is the current event-driven owner.
- `rebirth-scroll-stability-v220.js` — superseded Rebirth scroll-preservation layer retired from runtime and source; loaded `rebirth-scroll-natural-v221.js` explicitly replaces and suppresses V220.
- `accomplishments-titles-v133.js` — compatibility marker only; retired from runtime and source.
- `accomplishments-overview-v135.js` — compatibility marker only; retired from runtime and source.
- `accomplishments-home-scope-v136.js` — compatibility marker only; retired from runtime and source.
- `accomplishments-floors-v137.js` — compatibility marker only; retired from runtime and source.
- `accomplishments-ui-v123.js` — suppressed legacy UI; retired from runtime and source.
- `accomplishments-floor-comp-v141.js` — floor compensation ownership absorbed into V127; retired from runtime and source after migration ownership moved to V127.
- `tree-safety-v83.js` — inert compatibility marker whose final mastery-save/audit responsibilities moved into V82; retired from runtime and source after staged unload/integration proof. It must not regain runtime ownership.
- `personal-tree-spectacle-v247.js` — presentation-only V247/V250 spectacle layer absorbed into canonical V116 and unloaded under #230; source retired in the subsequent staged L5 cleanup after #232 supplied post-unload integration proof.
- `tree-labels-v117.js` — clearer gold-node label ownership absorbed into V116; retired from runtime and source.
- `tree-mastery-v120.js` — compatibility marker only; retired from runtime and source.
- `tree-mastery-ui-v128.js` — compatibility marker only; retired from runtime and source.
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
