# Lean-code runtime audit

Working document for `LEAN_CODE_PLAN.md`. This file records facts discovered during L0 so developers and AI agents do not repeatedly rediscover the same runtime relationships.

Baseline for this audit: V295 plus the shared roadmap bootstrap (`f95f7fa385b244b97b1d0c74a5209d838f036aca`).

## Loader structure

`index.html` has two runtime-loading paths:

1. static `<script src>` entries for the base game and most gameplay/authority layers;
2. a deferred loader for Home, BottomNav/premium UI, Rebirth presentation, optional Social, and optional bot-testers.

Any dead-load analysis must inspect both paths. Searching only literal script tags is insufficient.

## Current subsystem classification

### Base engine / core — KEEP, consolidation later

- `game-1.js`
- `game-2.js`
- `game-3.js`
- `game-4.js`
- `game-5.js`
- `runtime-performance-v217.js`
- `boot-stability-v115.js`

These are not first-pass unload targets. Future work should identify which responsibilities in versioned extensions can eventually move into stable core/subsystem modules.

### Combat — ACTIVE / OWNER-SENSITIVE

- `combat-consolidated-v156.js`
- `combat-polish-v157.js`
- `combat-animation-v169.js`
- `combat-progression-authority-v285.js`
- `boss-final-authority-v288.js`
- `enemy-damage-authority-v289.js`

The presentation/cadence chain is contract-locked but progression authority is still evolving. Do not collapse this group while concurrent combat/progression changes are active.

### Familiars — ACTIVE / FEATURE-OWNER SENSITIVE

- `familiars-ui-v229.js`
- `familiars-qa-v230.js`
- `familiars-noscr-v231.js`
- `familiars-stock-v274.js`
- `familiars-stock-authority-v275.js`
- `familiar-flat-stats-v286.js`
- `familiar-ladder-authority-v295.js`

V295 added the Ancestral ladder authority. This group is explicitly excluded from first cleanup batches until concurrent feature work settles.

### Forge / Sanctuary / equipment / progression — ACTIVE / FEATURE-OWNER SENSITIVE

Current runtime includes multiple historical and current layers, including:

- `sanctuary-pricing-v125.js`
- `sanctuary-rarities-v129.js`
- `sanctuary-endgame-v130.js`
- `sanctuary-legacy-merge-fix-v212.js`
- `sanctuary-divine-rollback-v131.js`
- `sanctuary-divine-mastery-v132.js`
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
- `progression-overhaul-v283.js`
- `dust-chance-floor-v292.js`
- `dust-economy-authority-v293.js`
- `forge-star-global-authority-v294.js`

This is likely the largest eventual consolidation opportunity, but V283–V294 show that it is actively changing. Audit only until the feature owner is stable.

### Home / BottomNav / premium UI — STABLE ENOUGH FOR EARLY LEANING

Deferred runtime includes:

- `home-layout-fix-v119.js` — compatibility/decorative layer;
- `home-layout-authority-v219.js` — Home geometry/render owner;
- `bottom-nav-layout-v183.js` — actual V209 BottomNav geometry authority despite filename;
- `premium-ui-v209.js` — visual/material polish, not geometry authority;
- `premium-recommendation-cleanup-v243.js`;
- `mobile-ui-stability-v210.js`.

L0 finding: the architecture map previously mislabeled `premium-ui-v209.js` as the BottomNav geometry owner. The implementation proves `bottom-nav-layout-v183.js` owns `__srBottomNavGeometryV209` and `__srApplyBottomNavGeometryV209`; the ownership map/test are corrected in the L0 branch.

This group is a strong candidate for the first wrapper-chain consolidation after dead-load checks.

### Accomplishments — STABLE BUT WRAPPER/POLLER HEAVY

Loaded:

- `accomplishments-v121.js`
- `accomplishments-reward-fix-v127.js`
- `accomplishments-merge-v126.js`
- `accomplishments-stability-v138.js`
- `accomplishments-canonical-v139.js`
- `accomplishments-claim-v140.js`
- `accomplishments-floor-comp-v141.js`

Already retired/unloaded:

- `accomplishments-ui-v123.js`
- `accomplishments-titles-v133.js`
- `accomplishments-overview-v135.js`
- `accomplishments-home-scope-v136.js`
- `accomplishments-floors-v137.js`

L0 findings:

- V121 still wraps `render`, wraps `ACT.fuse`, and polls raid-result state every 500 ms.
- V126 wraps `render` again and runs a 700 ms interval to synchronize Merge rewards/reserve UI.
- These are active behaviors, so they are not dead-load candidates; they are prime L2 wrapper/poller-collapse targets.

Target direction: preserve the underlying reward/migration behavior while moving event-driven responsibilities into the canonical Accomplishments/Merge owners and eliminating perpetual polling where deterministic lifecycle hooks exist.

### Tree — STABLE / EARLY CONSOLIDATION CANDIDATE

Loaded:

- `personal-tree-radial-v82.js`
- `tree-safety-v83.js`
- `tree-research-v122.js`
- `tree-dedicated-v116.js`
- `tree-labels-v117.js`
- `tree-mastery-v149.js`
- `runtime-tree-stability-v216.js`
- `personal-tree-spectacle-v247.js`

Already retired/unloaded:

- `tree-mastery-v120.js`
- `tree-mastery-ui-v128.js`

V149 remains the mastery gate/popup authority. This subsystem should be audited for wrapper chains before any module consolidation.

### Rebirth — ACTIVE / OWNER-SENSITIVE

Loaded/deferred layers include:

- `rebirth-upgrades-cleanup-v223.js`
- `rebirth-floor-skip-balance-v225.js`
- `secondary-hud-selective-v279.js`
- `rebirth-removal-v276.js`
- `rebirth-removal-ui-v279.js`
- `rebirth-spectacle-v222.js`
- `rebirth-scroll-natural-v221.js`
- `rebirth-ui-cleanup-v224.js`
- `rebirth-removal-authority-v281.js`

Do not consolidate while feature/progression work intersects this area.

### Social — CONDITIONAL OPTIONAL FEATURE

Deferred only when Social is enabled:

- `social-v1.js`
- `social-p2p-v1.js`

Bot-tester scripts are separately conditional. Do not classify conditional absence from a normal session as dead code.

## First prioritized investigation queue

1. **Home/BottomNav:** determine whether any compatibility layer is now fully redundant under V219/V209; no unload until behavior is proved duplicated/inert.
2. **Accomplishments:** replace V121/V126 polling/wrapper chains with deterministic lifecycle hooks, one behavior at a time.
3. **Tree:** map wrappers around render/actions and identify logic that can move directly into V149 or another durable Tree module.
4. **Shared helpers:** only after repeated helper implementations are confirmed across stable subsystems.
5. **Forge/Familiars/Rebirth/combat progression:** postpone consolidation until active AI-driven feature work stops intersecting their owners.

## Safety rule for candidates

A script becomes an L1 dead-load candidate only when all of the following are true:

- its surviving code is unreachable, guarded out, or completely superseded;
- removing the loader reference does not transfer an unrecorded responsibility;
- save migration/backward compatibility remains intact;
- a focused regression test proves the canonical owner still provides the behavior;
- the full moving ratchet + Chromium/WebKit suite passes;
- latest `main` is rechecked immediately before merge.
