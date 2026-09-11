# Lean-code runtime audit

Working document for `LEAN_CODE_PLAN.md`. This file records facts discovered during L0 and subsequent lean-code iterations so developers and AI agents do not repeatedly rediscover stale runtime relationships.

Current coordination baseline before Home V119 consolidation: `main` `b5c43fedc700ffebc5eba076189f36c20927d9ff`. `RUNTIME_INVENTORY.md` is authoritative for the current loader list and `ARCHITECTURE.md` is authoritative for canonical ownership.

## Loader structure

`index.html` has two runtime-loading paths:

1. static `<script src>` entries for the base game and most gameplay/authority layers;
2. a deferred loader for Home, premium UI, Rebirth presentation, optional Social, and optional bot-testers.

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

### Home / BottomNav / premium UI — STABLE / CONSOLIDATED

BottomNav has one canonical runtime owner: `bottom-nav-layout-v183.js` owns fantasy icon decoration, geometry and the sole `renderTabs` lifecycle wrapper. It is loaded statically in the former V53 slot so initial mobile decoration timing is preserved. The deferred duplicate load was removed. `bottom-nav-v53.js` remains in source history but is no longer requested at runtime. `premium-ui-v209.js` remains visual/material polish only.

Home now has one canonical loaded runtime owner: `home-layout-authority-v219.js`. The active V119 compatibility responsibilities were transferred into V219: Forge info-button accessibility/geometry, reward-feed compatibility styling, equipment-filter readability, Settings stat-card layout, and toast/tutorial positioning. `home-layout-fix-v119.js` remains in source history but is no longer requested at runtime. V219 retains Home geometry and the event-driven `sr:bottomnavrendered` + resize/orientation/startup lifecycle without wrapping `renderTabs`.

### Accomplishments — STABLE / L3 CONSOLIDATING

Loaded:

- `accomplishments-v121.js`
- `accomplishments-reward-fix-v127.js`
- `accomplishments-merge-v126.js`
- `accomplishments-stability-v138.js`
- `accomplishments-canonical-v139.js`
- `accomplishments-claim-v140.js`
- `accomplishments-floor-comp-v141.js`

Already retired/unloaded or source-retired examples are tracked in `ARCHITECTURE.md`.

Completed L2/L3 findings:

- V121/V126 no longer rely on perpetual render/polling ownership for the cleaned responsibilities; deterministic lifecycle hooks own those paths.
- V138 no longer wraps `renderTabs`; it subscribes to canonical `sr:bottomnavrendered` lifecycle.
- V139 no longer wraps global `openModal`; canonical Accomplishments presentation is owned directly by `ACT.accomplishments()` in V139.
- The Settings-screen Accomplishments entry is owned by canonical V139 rather than V121. V121 no longer wraps `scrParametres`.
- V121's obsolete milestone table, reward text, payout helpers, modal renderer and fallback claim path have been removed. V121 is now compatibility-only: it normalizes historical accomplishment state and records raid-win/familiar-fusion history needed by existing saves. Canonical UI remains V139 and canonical payouts remain V140.
- Migration/startup compatibility layers such as V127 and V141 remain loaded because historical-save responsibilities are still required.

Do not reintroduce wrapper chains or duplicate reward/UI definitions merely because older source contracts once expected them.

### Tree — STABLE / EARLY CONSOLIDATION CANDIDATE

Loaded Tree runtime is inventoried in `RUNTIME_INVENTORY.md`. Current ownership corrections:

- `runtime-tree-stability-v216.js` is the sole active mastery owner.
- legacy `tree-mastery-v149.js` is retired from runtime and source; it must not be treated as the active mastery authority.
- `tree-dedicated-v116.js` still owns the dedicated Tree renderer/mode presentation. Its duplicate permanent `setInterval(syncMode,500)` poller and document-wide `MutationObserver` have both been removed; canonical `sr:bottomnavrendered` lifecycle plus startup sync now own mode synchronization.
- `tree-labels-v117.js` still performs active label mutations and is not a dead load merely because it is small.
- `tree-safety-v83.js` still contains active raid-reward compatibility and historical mastery-save restoration, so it is not a safe dead-load candidate.
- `tree-research-v122.js` still changes future research-time tables and therefore remains active gameplay configuration, not cleanup-only code.

Continue mapping Tree wrappers/actions one behavior at a time before any module consolidation.

### Rebirth — ACTIVE / OWNER-SENSITIVE

Rebirth remains feature/progression sensitive. Do not consolidate while current/open work intersects the area.

### Social — CONDITIONAL OPTIONAL FEATURE

Social and bot-tester scripts are conditional. Do not classify absence from a normal non-Social session as dead code.

## Prioritized investigation queue

1. **Accomplishments:** continue separating durable canonical UI/claim owners from migration/compatibility layers; preserve V121/V127/V141 historical-save duties until proven transferable.
2. **Tree:** continue mapping wrappers/actions after the V116 polling/observer removal; prefer deterministic lifecycle hooks and the V216 mastery owner.
3. **Shared helpers:** only after repeated helper implementations are confirmed across stable subsystems.
4. **Forge/Familiars/Rebirth/combat progression:** postpone consolidation until active AI-driven feature work stops intersecting their owners.

## Safety rule for candidates

A script becomes an L1 dead-load candidate only when all of the following are true:

- its surviving code is unreachable, guarded out, or completely superseded;
- removing the loader reference does not transfer an unrecorded responsibility;
- save migration/backward compatibility remains intact;
- a focused regression test proves the canonical owner still provides the behavior;
- the full moving ratchet + Chromium/WebKit suite passes;
- latest `main` is rechecked immediately before merge.