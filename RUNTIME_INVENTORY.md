# Shadowreach runtime inventory

This file records the scripts actually requested by `index.html` on the current lean-code baseline. It is the L0 loader inventory referenced by `LEAN_CODE_PLAN.md`.

Snapshot base before the BottomNav consolidation: `main` at `2dadc3cd23b106792557d8cc7c6912aefb352353`.

## Loader totals

- 97 scripts are loaded synchronously through static `<script src>` entries.
- 8 additional core UI scripts are loaded after startup in the default non-Social session.
- Default runtime total: **105 JavaScript files**.
- Social adds `social-v1.js` and `social-p2p-v1.js`: **107** files when Social is enabled.
- Bot Testers adds `social-bot-testers-v5.js` and `social-bot-ui-v1.js` on top of Social: **109** files in that optional mode.

The V309-era baseline reached 106 files after V307, V308 and V309 each added one static progression/Familiar authority layer. The BottomNav consolidation then absorbed `bottom-nav-v53.js` into the canonical `bottom-nav-layout-v183.js` owner and removed one runtime request without changing the 97-script static count: the canonical owner moved from deferred loading into V53's former static slot while the deferred duplicate entry was removed.

## Static loader inventory

The classification below records why each currently loaded file remains in the runtime or why it is intentionally deferred from lean cleanup. It does not declare every historical filename to be a permanent canonical module.

### Base engine — 5

Reason: foundational runtime split; treat as canonical engine until a dedicated engine consolidation project proves otherwise.

- `game-1.js`
- `game-2.js`
- `game-3.js`
- `game-4.js`
- `game-5.js`

### Combat and runtime presentation — 4

Reason: active canonical/extension responsibilities already mapped in `ARCHITECTURE.md`; not dead loads.

- `combat-consolidated-v156.js`
- `combat-polish-v157.js`
- `combat-animation-v169.js`
- `runtime-performance-v217.js`

### Familiars pre-authority chain — 5

Reason: active Familiar UI/stock compatibility and authority layers. Familiars is feature-owner sensitive, so these are explicitly queued for later consolidation rather than blind unloading.

- `familiars-ui-v229.js`
- `familiars-qa-v230.js`
- `familiars-noscr-v231.js`
- `familiars-stock-v274.js`
- `familiars-stock-authority-v275.js`

### Rebirth and save import — 3

Reason: active Rebirth behavior plus canonical save-import protection. Rebirth is feature-owner sensitive.

- `rebirth-upgrades-cleanup-v223.js`
- `rebirth-floor-skip-balance-v225.js`
- `import-save-guard-v207.js`

### Sanctuary, Forge and equipment — 25

Reason: active Sanctuary/Forge presentation, migration, balance and equipment authority chain. Forge/progression is feature-owner sensitive; migration layers must remain until their old-save responsibilities are deliberately absorbed into a durable migration owner.

- `sanctuary-pricing-v125.js`
- `sanctuary-rarities-v129.js`
- `sanctuary-endgame-v130.js`
- `sanctuary-legacy-merge-fix-v212.js`
- `boost-inventory-v173.js`
- `sanctuary-divine-rollback-v131.js`
- `sanctuary-divine-mastery-v132.js`
- `equipment-stats-collapse-v176.js`
- `sanctuary-merge-fx-v178.js`
- `sanctuary-touch-polish-v181.js`
- `forge-rarity-balance-v96.js`
- `forge-rarity-balance-v98.js`
- `game-balance-v224.js`
- `forge-compare-v95.js`
- `forge-arena-preview-v142.js`
- `forge-arena-stability-v143.js`
- `forge-worn-details-v145.js`
- `forge-comparison-authority-v146.js`
- `forge-equipment-safety-v151.js`
- `power-source-integrity-v256.js`
- `auto-forge-v103.js`
- `auto-forge-compare-v199.js`
- `forge-ux-v273.js`
- `forge-panel-authority-v266.js`
- `forge-auto-batch-gate-v266.js`

### Tree, core UI and guidance — 18

Reason: active Tree/UI/tutorial/notification/raid guidance responsibilities. Known retired Tree mastery shells are already unloaded; `runtime-tree-stability-v216.js` is the active mastery owner. BottomNav decoration/geometry/lifecycle are now consolidated in one static canonical owner. Remaining compatibility utilities require behavior proof before any L1 unload.

- `personal-tree-radial-v82.js`
- `tree-safety-v83.js`
- `weekly-mega-v71.js`
- `hero-equipment-v1.js`
- `audio-v26.js`
- `bottom-nav-layout-v183.js`
- `ui-stability-v83.js`
- `tutorial-auto-v100.js`
- `boss-gate-v101.js`
- `tree-research-v122.js`
- `tree-dedicated-v116.js`
- `tree-labels-v117.js`
- `runtime-tree-stability-v216.js`
- `personal-tree-spectacle-v247.js`
- `notification-compact-v105.js`
- `raid-intro-balance-v107.js`
- `power-hint-v108.js`
- `boot-stability-v115.js`

### Accomplishments — 7

Reason: stable lower-conflict subsystem with canonical rendering/claims plus explicit legacy-save migration layers. `accomplishments-reward-fix-v127.js` and `accomplishments-floor-comp-v141.js` are not dead loads: they still protect unprocessed historical saves. Future lean work should collapse stable runtime ownership without deleting required migrations.

- `accomplishments-v121.js`
- `accomplishments-reward-fix-v127.js`
- `accomplishments-merge-v126.js`
- `accomplishments-stability-v138.js`
- `accomplishments-canonical-v139.js`
- `accomplishments-claim-v140.js`
- `accomplishments-floor-comp-v141.js`

### V276–V309 progression authority chain — 30

Reason: currently active progression, Rebirth, raid, dust, Forge, Familiar, skill and QA authority layers. These files are loaded intentionally while the recently stabilized progression work remains feature-owner sensitive. L1 must not unload them merely because a newer version number exists.

- `secondary-hud-selective-v279.js`
- `rebirth-removal-v276.js`
- `rebirth-removal-ui-v279.js`
- `raid-minerai-active-balance-v282.js`
- `legacy-equipment-preflight-v302.js`
- `progression-overhaul-v283.js`
- `skill-overhaul-v284.js`
- `combat-progression-authority-v285.js`
- `familiar-flat-stats-v286.js`
- `progression-qa-authority-v287.js`
- `boss-final-authority-v288.js`
- `enemy-damage-authority-v289.js`
- `raid-pe-authority-v290.js`
- `raid-summon-economy-v291.js`
- `dust-chance-floor-v292.js`
- `dust-economy-authority-v293.js`
- `forge-star-global-authority-v294.js`
- `familiar-ladder-authority-v295.js`
- `familiar-ancestral-rate-v296.js`
- `skill-semantics-authority-v297.js`
- `import-progression-authority-v299.js`
- `dust-chance-authority-v300.js`
- `dust-chance-floor-v301.js`
- `familiar-state-stars-authority-v303.js`
- `progression-stability-authority-v304.js`
- `progression-integration-pack-v305.js`
- `apple-system-retirement-v306.js`
- `progression-batch-qa-v307.js`
- `progression-state-safety-v308.js`
- `familiar-flat-ui-authority-v309.js`

## Deferred default core — 8

Reason: loaded after startup by the deferred `core` chain. These are active Home/Premium/mobile/Rebirth owners or compatibility layers, not unconditional dead loads.

- `home-layout-fix-v119.js`
- `home-layout-authority-v219.js`
- `premium-ui-v209.js`
- `mobile-ui-stability-v210.js`
- `rebirth-spectacle-v222.js`
- `rebirth-scroll-natural-v221.js`
- `rebirth-ui-cleanup-v224.js`
- `rebirth-removal-authority-v281.js`

## Conditional optional loader entries — 4

Reason: loaded only when their feature flag is enabled and therefore excluded from the 105-file normal-session total.

- Social: `social-v1.js`, `social-p2p-v1.js`
- Bot Testers, only with Social: `social-bot-testers-v5.js`, `social-bot-ui-v1.js`

## Already retired/unloaded

The retired list remains authoritative in `ARCHITECTURE.md`. Known unloaded examples include Accomplishments legacy shells, Tree mastery V120/V128, `social-forge-layout-v1.js`, `bottom-nav-v53.js`, and the retired recommendation override. They must not silently re-enter either the static loader or deferred chains.

## L0 conclusion

Every script currently requested by `index.html` is now represented in this loader inventory as a foundational owner, active extension, compatibility/migration responsibility, feature-owner-sensitive layer, deferred core layer, or optional feature. L1 may therefore focus on **proof-based dead-load removal**, starting with lower-conflict stable areas. Historical save migrations are not dead code merely because most current saves have already processed them.