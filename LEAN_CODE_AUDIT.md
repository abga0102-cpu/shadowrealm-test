# Lean-code runtime audit

Working document for `LEAN_CODE_PLAN.md`. This file records facts discovered during L0 and subsequent lean-code iterations so developers and AI agents do not repeatedly rediscover stale runtime relationships.

Current coordination baseline: this notification consolidation started from `main` at `d83da74acda5112491745a6eda4d5bceb7fbeea6`. `RUNTIME_INVENTORY.md` is authoritative for the current loader list and `ARCHITECTURE.md` is authoritative for canonical ownership. The recent Tree/power retirement guards are now active in Phase 1 CI under the required `phase*.spec.js` match.

## Loader structure

`index.html` has two runtime-loading paths:

1. static `<script src>` entries for the base game and most gameplay/authority layers;
2. a deferred loader for Home, premium UI, Rebirth presentation, optional Social, and optional bot-testers.

Any dead-load analysis must inspect both paths. Searching only literal script tags is insufficient.

The current inventory records 93 static scripts plus 7 deferred default-core scripts: **100 JavaScript files in the normal non-Social runtime**, 102 with Social, and 104 with Social + Bot Testers.

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

The presentation/cadence chain is contract-locked but progression authority is still feature-sensitive. Do not collapse this group while concurrent combat/progression changes are active.

### Familiars — ACTIVE / FEATURE-OWNER SENSITIVE

The loaded Familiar chain remains explicitly excluded from early cleanup until concurrent feature work settles. Use `RUNTIME_INVENTORY.md` for the current exhaustive list; do not infer redundancy from version numbers alone.

### Forge / Sanctuary / equipment / progression — ACTIVE / FEATURE-OWNER SENSITIVE

This remains one of the largest eventual consolidation opportunities, but the current progression/Forge authority chain is feature-owner sensitive. Migration layers must remain until their old-save responsibilities are deliberately absorbed into a durable owner.

Equipment combat-stats collapse is owned by loaded `equipment-stats-collapse-v176.js`. The unloaded historical predecessor `equipment-stats-collapse-v175.js` was source-retired in PR #117 after a focused ownership guard proved V176 remained the sole loaded implementation. The obsolete one-off helper `.github/equipment_stats_collapse_v175.py` was subsequently retired in PR #119.

### Home / BottomNav / premium UI — STABLE / CONSOLIDATED

BottomNav has one canonical runtime owner: `bottom-nav-layout-v183.js` owns fantasy icon decoration, geometry and the sole `renderTabs` lifecycle wrapper. The unloaded historical `bottom-nav-v53.js` source has been retired. `premium-ui-v209.js` remains visual/material polish only.

Home has one canonical loaded runtime owner: `home-layout-authority-v219.js`. The active V119 compatibility responsibilities were transferred into V219: Forge info-button accessibility/geometry, reward-feed compatibility styling, equipment-filter readability, Settings stat-card layout, and toast/tutorial positioning. After remaining unloaded and contract-covered, obsolete `home-layout-fix-v119.js` and dormant `social-forge-layout-v1.js` working-tree sources were retired. V219 retains Home geometry and the event-driven `sr:bottomnavrendered` + resize/orientation/startup lifecycle without wrapping `renderTabs`.

### Reward notifications — STABLE / CSS CONSOLIDATED

The six compact presentation overrides formerly injected by `notification-compact-v105.js` now live in the existing canonical `#rewardFeed` and `.rewardPop` selectors in `style.css`. V105 remains in source for staged history but is unloaded, so the computed base presentation is unchanged while one static runtime request and one style-injection execution are removed. Home-specific reward-feed geometry remains scoped to V219.

### Accomplishments — STABLE / L2 SUBSTANTIALLY CLEANED / L5 STARTED

Loaded:

- `accomplishments-v121.js`
- `accomplishments-reward-fix-v127.js`
- `accomplishments-merge-v126.js`
- `accomplishments-stability-v138.js`
- `accomplishments-canonical-v139.js`
- `accomplishments-claim-v140.js`

Completed findings:

- V121/V126 no longer rely on perpetual render/polling ownership for the cleaned responsibilities; deterministic lifecycle hooks own those paths.
- V138 no longer wraps `renderTabs`; it subscribes to canonical `sr:bottomnavrendered` lifecycle.
- V139 no longer wraps global `openModal`; successful claim refreshes route through canonical `ACT.accomplishments()`.
- The Settings-screen Accomplishments entry is owned by canonical V139 rather than V121; V121 is reduced to historical state/event compatibility.
- V127 remains loaded because its historical-save responsibilities are still required. V141's floor make-good responsibility was transferred into V127 and V141 was later source-retired.
- `accomplishments-ui-v123.js`, `accomplishments-titles-v133.js`, V135/V136/V137 marker-era sources, V141, and the unloaded `accomplishments-merge-safe-v135.js` bridge have been retired from the working tree after their responsibilities were proven transferred or obsolete. Git history remains the archive.

Do not reintroduce wrapper chains merely because older source contracts once expected them.

### Tree — STABLE / HISTORICAL SOURCES PRUNED

Loaded Tree runtime is inventoried in `RUNTIME_INVENTORY.md`. Current ownership corrections:

- `runtime-tree-stability-v216.js` is the sole active mastery owner.
- legacy mastery shells are retired from runtime/source; do not treat them as active authority.
- `tree-dedicated-v116.js` owns the dedicated Tree renderer/mode presentation and the four presentation-only `Gain d’Or I–IV` labels.
- V116's duplicate permanent `setInterval(syncMode,500)` poller and document-wide `MutationObserver` were removed; canonical `sr:bottomnavrendered` lifecycle plus startup sync own mode synchronization.
- `tree-labels-v117.js` completed its staged ownership transfer, passed the regression soak, and is now unloaded. The later V105 CSS consolidation reduces the normal non-Social runtime to 100 files.
- historical renderer/bridge sources V88, V102, V87 and V92 were source-retired after V116 ownership was contract-locked.
- the unloaded V90 simple renderer and V213 mastery/observer layer were source-retired after V116/V216 ownership was contract-locked; V216 keeps the historical V213 guard claimed so stale legacy code cannot reinstall its observer.
- `tree-safety-v83.js` no longer wraps canonical Evolution `raidReward`; V290 owns that reward rule while V83 retains historical mastery-save restoration and audit behavior.
- `tree-research-v122.js` still changes future research-time tables and therefore remains active gameplay configuration, not cleanup-only code.

Do not restart V117 unload work or recreate retired renderer ownership. The recent Tree source-retirement guards are now active Phase 1 tests after PR #121.

### Power integrity — STABLE OWNER

`power-source-integrity-v256.js` is the loaded authority. The unloaded V255 retirement loader source was removed after a focused contract confirmed V256 still owns cleanup of the V255 synthetic compensation fields and localStorage key. Its retirement guard is now active in Phase 1 CI after PR #121.

### Rebirth — ACTIVE / OWNER-SENSITIVE

Rebirth remains feature/progression sensitive. Do not consolidate while current/open work intersects the area.

### Social — CONDITIONAL OPTIONAL FEATURE

Social and bot-tester scripts are conditional. Do not classify absence from a normal non-Social session as dead code.

## L1 source-pruning status

Straightforward runtime/source pruning is now close to exhaustion. Completed examples include:

- retired Accomplishments marker/source families and V135 bridge;
- BottomNav V53;
- wave-display V112;
- conditional bot-test historical source;
- duplicate legacy `index 2.html` (~498 KB);
- Tree V117 unload and V88/V102/V87/V92 historical renderer/bridge sources;
- Tree V90 historical renderer and V213 mastery/observer source;
- power integrity V255 historical retirement source;
- equipment stats V175 historical predecessor source and its obsolete V175 helper.

A file existing with an older version number is not enough evidence for deletion. The current `RUNTIME_INVENTORY.md` explicitly classifies every requested runtime file as foundational, active, compatibility/migration, feature-sensitive, deferred or optional.

Historical `.github` patch helpers also require caution. Some are referenced by archived workflows under `.github/workflow-archive/`; deleting a helper alone would make the archive internally broken even though the workflow is inactive. Treat those as an archival-tooling package, not ad hoc dead files.

## Prioritized investigation queue

1. **Final L1 proof scan:** retire only additional unloaded historical sources with explicit reachability and ownership evidence. Do not force deletions merely to continue L1.
2. **L2 lifecycle consolidation:** when no clear L1 candidate remains, audit stable loaded subsystems for redundant wrappers, observers, polling loops and duplicate lifecycle hooks; add/strengthen contracts before changing live behavior.
3. **Shared helpers / ownership consolidation:** only after repeated helper implementations are confirmed across stable subsystems.
4. **Forge/Familiars/Rebirth/combat progression:** postpone deeper consolidation until active AI-driven feature work stops intersecting their owners.

## Safety rule for candidates

A script becomes an L1 dead-load/source-retirement candidate only when all of the following are true:

- its surviving code is unreachable, guarded out, already unloaded, or completely superseded;
- removing the loader/source does not transfer an unrecorded responsibility;
- save migration/backward compatibility remains intact;
- a focused regression contract proves the canonical owner still provides the behavior where such a contract is needed;
- the relevant guard is actually included by Phase 1's `phase*.spec.js` test match;
- the full moving ratchet + Chromium/WebKit suite passes on the exact PR head;
- latest `main` and concurrent PR ownership are rechecked immediately before merge.
