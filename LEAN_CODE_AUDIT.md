# Lean-code runtime audit

Working document for `LEAN_CODE_PLAN.md`. This file records facts discovered during L0 and subsequent lean-code iterations so developers and AI agents do not repeatedly rediscover stale runtime relationships.

Current coordination baseline: `main` `333c9b12e33e01e656856f08c5fe225b9b091257`. `RUNTIME_INVENTORY.md` is authoritative for the current loader list and `ARCHITECTURE.md` is authoritative for canonical ownership.

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

The loaded Familiar chain remains explicitly excluded from early cleanup until concurrent feature work settles. Use `RUNTIME_INVENTORY.md` for the current exhaustive list; do not infer redundancy from version numbers alone.

### Forge / Sanctuary / equipment / progression — ACTIVE / FEATURE-OWNER SENSITIVE

This remains one of the largest eventual consolidation opportunities, but the current progression/Forge authority chain is still feature-owner sensitive. Audit only until current/open work proves the area stable.

### Home / BottomNav / premium UI — STABLE ENOUGH FOR EARLY LEANING

Deferred runtime includes active compatibility and canonical ownership layers. L0 corrected the architecture map so `bottom-nav-layout-v183.js` is the BottomNav geometry/render lifecycle owner and `premium-ui-v209.js` remains visual/material polish only.

`home-layout-fix-v119.js` has been re-audited after the Accomplishments cleanup and is not a dead load: it still supplies active Forge info-button accessibility/geometry, reward-feed compatibility styling, equipment-filter readability, Settings stat-card layout, and toast/tutorial positioning.

### Accomplishments — STABLE / L2 SUBSTANTIALLY CLEANED

Loaded:

- `accomplishments-v121.js`
- `accomplishments-reward-fix-v127.js`
- `accomplishments-merge-v126.js`
- `accomplishments-stability-v138.js`
- `accomplishments-canonical-v139.js`
- `accomplishments-claim-v140.js`
- `accomplishments-floor-comp-v141.js`

Already retired/unloaded or source-retired examples are tracked in `ARCHITECTURE.md`.

Completed L2 findings:

- V121/V126 no longer rely on perpetual render/polling ownership for the cleaned responsibilities; deterministic lifecycle hooks own those paths.
- V138 no longer wraps `renderTabs`; it subscribes to canonical `sr:bottomnavrendered` lifecycle.
- V139 no longer wraps global `openModal`; successful V121 claim refreshes route through canonical `ACT.accomplishments()` with its local legacy open path retained only as fallback.
- Migration/startup compatibility layers such as V127 and V141 remain loaded because historical-save responsibilities are still required.

Do not reintroduce wrapper chains merely because older source contracts once expected them.

### Tree — STABLE / EARLY CONSOLIDATION CANDIDATE

Loaded Tree runtime is inventoried in `RUNTIME_INVENTORY.md`. Current ownership corrections:

- `runtime-tree-stability-v216.js` is the sole active mastery owner.
- legacy `tree-mastery-v149.js` is retired from runtime and source; it must not be treated as the active mastery authority.
- `tree-dedicated-v116.js` still owns the dedicated Tree renderer/mode presentation, but its duplicate permanent `setInterval(syncMode,500)` poller has been removed. The existing body `MutationObserver` plus startup sync remain responsible for mode synchronization.
- `tree-labels-v117.js` still performs active label mutations and is not a dead load merely because it is small.
- `tree-safety-v83.js` still contains active raid-reward compatibility and historical mastery-save restoration, so it is not a safe dead-load candidate.
- `tree-research-v122.js` still changes future research-time tables and therefore remains active gameplay configuration, not cleanup-only code.

Continue mapping Tree wrappers/actions one behavior at a time before any module consolidation.

### Rebirth — ACTIVE / OWNER-SENSITIVE

Rebirth remains feature/progression sensitive. Do not consolidate while current/open work intersects the area.

### Social — CONDITIONAL OPTIONAL FEATURE

Social and bot-tester scripts are conditional. Do not classify absence from a normal non-Social session as dead code.

## Prioritized investigation queue

1. **Home/BottomNav:** continue proof-based checks for compatibility behavior that is genuinely duplicated by V219/V209 owners; do not unload `home-layout-fix-v119.js` based on naming alone.
2. **Accomplishments:** major wrapper/poller targets have been cleaned; future work should focus on durable subsystem consolidation and migration separation, not recreating retired wrapper ownership.
3. **Tree:** continue mapping wrappers/actions after the V116 polling removal; prefer deterministic lifecycle hooks and the V216 mastery owner.
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
