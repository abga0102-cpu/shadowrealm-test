# Shadowreach runtime inventory

This file records the scripts actually requested by `index.html` on the current lean-code baseline. It is the L0 loader inventory referenced by `LEAN_CODE_PLAN.md`.

Snapshot base before the Home V119 consolidation: `main` at `b5c43fedc700ffebc5eba076189f36c20927d9ff`.

## Loader totals

- 90 scripts are loaded synchronously through static `<script src>` entries.
- 7 additional core UI scripts are loaded after startup in the default non-Social session.
- Index-managed subtotal: **97 JavaScript files**.
- 10 additional scripts are loaded transitively by `familiars-noscr-v231.js`.
- Default first-party runtime total: **107 JavaScript files**.
- Social adds `social-v1.js` and `social-p2p-v1.js`: **109** first-party files when Social is enabled.
- Bot Testers adds `social-bot-testers-v5.js` and `social-bot-ui-v1.js` on top of Social: **111** first-party files in that optional mode.

The older 106-file V309-era baseline was reduced to 105 by BottomNav consolidation, then to 104 by Home V119 consolidation, then to 103 by unloading retired Accomplishments V141. After the staged V117 ownership transfer passed PR and post-merge regression, unloading inert Tree V117 reduced the static runtime to 95 entries and the normal non-Social runtime to 102 files. Unloading the retired Hero Equipment visual bridge reduces the static runtime to 94 entries and the normal non-Social runtime to 101 files.

Absorbing the V105 notification CSS into `style.css` then reduces the static runtime to 93 entries and the normal runtime to 100 index-managed files. Unloading superseded Dust chance authorities V292 and V300 leaves V301 as the sole loaded chance owner, reducing the static runtime again to 91 entries and the index-managed normal runtime to 98 files. Their obsolete source files were subsequently retired after the V301-only runtime passed the full regression gate. Unloading the superseded Familiar stock bridge V274 leaves V275 as the sole loaded stock/summon authority and reduces the static runtime to 90 entries and the index-managed normal runtime to 97 files. The obsolete V274 source was then retired after the V275-only runtime passed its full regression gate.

The earlier totals above counted only scripts managed by `index.html`; they omitted the ten-script nested Familiar loader. The full current normal-session first-party count is therefore 107. Social may additionally import third-party network modules; those are not included in the first-party counts.

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

### Familiars pre-authority chain — 4

Reason: active Familiar UI/stock compatibility and authority layers. V275 waits for the final V240/V241 renderer chain and owns stock ordering plus summon placement there. Superseded V274 is retired from both runtime and source after the V275-only contract passed the full regression gate.

- `familiars-ui-v229.js`
- `familiars-qa-v230.js`
- `familiars-noscr-v231.js`
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

### Tree, core UI and guidance — 15

Reason: active Tree/UI/tutorial/notification/raid guidance responsibilities. Known retired Tree mastery shells are already unloaded; `runtime-tree-stability-v216.js` is the active mastery owner. `tree-dedicated-v116.js` owns the clearer `Gain d’Or I–IV` labels; the inert V117 marker is now unloaded. BottomNav decoration/geometry/lifecycle are consolidated in one static canonical owner.

- `personal-tree-radial-v82.js`
- `tree-safety-v83.js`
- `weekly-mega-v71.js`
- `audio-v26.js`
- `bottom-nav-layout-v183.js`
- `ui-stability-v83.js`
- `tutorial-auto-v100.js`
- `boss-gate-v101.js`
- `tree-research-v122.js`
- `tree-dedicated-v116.js`
- `runtime-tree-stability-v216.js`
- `personal-tree-spectacle-v247.js`
- `raid-intro-balance-v107.js`
- `power-hint-v108.js`
- `boot-stability-v115.js`

### Accomplishments — 6

Reason: stable lower-conflict subsystem with canonical rendering/claims and one active legacy reward-migration owner. `accomplishments-reward-fix-v127.js` owns both Raid 100 and floor25/floor50/floor75 historical make-goods through bounded startup reconciliation plus the deterministic `migrate(...)` import lifecycle. Retired V141 remains in source history only and is no longer requested by the runtime.

- `accomplishments-v121.js`
- `accomplishments-reward-fix-v127.js`
- `accomplishments-merge-v126.js`
- `accomplishments-stability-v138.js`
- `accomplishments-canonical-v139.js`
- `accomplishments-claim-v140.js`

### V276–V309 progression authority chain — 28

Reason: currently active progression, Rebirth, raid, dust, Forge, Familiar, skill and QA authority layers. V301 is now the sole loaded Dust upgrade-chance authority; superseded V292 and temporary V300 are retired from both runtime and source after the V301-only contract passed the full regression gate. The remaining files are loaded intentionally while the recently stabilized progression work remains feature-owner sensitive.

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
- `dust-economy-authority-v293.js`
- `forge-star-global-authority-v294.js`
- `familiar-ladder-authority-v295.js`
- `familiar-ancestral-rate-v296.js`
- `skill-semantics-authority-v297.js`
- `import-progression-authority-v299.js`
- `dust-chance-floor-v301.js`
- `familiar-state-stars-authority-v303.js`
- `progression-stability-authority-v304.js`
- `progression-integration-pack-v305.js`
- `apple-system-retirement-v306.js`
- `progression-batch-qa-v307.js`
- `progression-state-safety-v308.js`
- `familiar-flat-ui-authority-v309.js`

## Deferred default core — 7

Reason: loaded after startup by the deferred `core` chain. Home V219 is now the sole loaded Home owner; the remaining entries are active Premium/mobile/Rebirth owners or compatibility layers, not unconditional dead loads.

- `home-layout-authority-v219.js`
- `premium-ui-v209.js`
- `mobile-ui-stability-v210.js`
- `rebirth-spectacle-v222.js`
- `rebirth-scroll-natural-v221.js`
- `rebirth-ui-cleanup-v224.js`
- `rebirth-removal-authority-v281.js`

## Transitive Familiar / recycling loader — 10

`familiars-noscr-v231.js` loads these scripts sequentially during normal startup. They are active feature-sensitive dependencies, not unloaded source-retirement candidates.

- `equipment-recycle-infusion-v239.js`
- `familiars-rates-balance-v237.js`
- `familiars-noscr-v234.js`
- `familiars-compact-active-v235.js`
- `familiars-rates-modal-v236.js`
- `familiars-scroll-layout-v240.js`
- `familiars-tabs-merge-v241.js`
- `familiars-scroll-safearea-v242.js`
- `familiars-scroll-viewport-v245.js`
- `familiars-scroll-natural-v246.js`

## Conditional optional loader entries — 4

Reason: loaded only when their feature flag is enabled and therefore excluded from the 107-file first-party normal-session total.

- Social: `social-v1.js`, `social-p2p-v1.js`
- Bot Testers, only with Social: `social-bot-testers-v5.js`, `social-bot-ui-v1.js`

## Already retired/unloaded

The retired list remains authoritative in `ARCHITECTURE.md`. Known unloaded examples include Accomplishments legacy shells including V141, Tree mastery V120/V128/V213, Tree labels V117, the historical V90 renderer, `hero-equipment-v1.js` (retired visual safety bridge; source retired after staged proof), `social-forge-layout-v1.js`, `bottom-nav-v53.js`, `home-layout-fix-v119.js`, `notification-compact-v105.js` (source retired after staged proof), the retired recommendation override, the superseded Dust chance layers V292/V300 (both runtime loads and source files retired after V301-only regression proof), and the superseded Familiar stock layer V274 (both runtime load and source file retired after V275-only regression proof). They must not silently re-enter either the static loader or deferred chains.

## L0 conclusion

Every script currently requested by `index.html` is now represented in this loader inventory as a foundational owner, active extension, compatibility/migration responsibility, feature-owner-sensitive layer, deferred core layer, or optional feature. L1 may therefore focus on **proof-based dead-load removal**. Historical save migrations are not dead code merely because most current saves have already processed them.
