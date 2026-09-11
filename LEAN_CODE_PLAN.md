# Shadowreach lean-code program

This roadmap is the shared source of truth for reducing runtime complexity without interrupting active feature development. It is written for both human developers and AI coding agents working concurrently on the repository.

**Repository-wide development standard:** `AGENTS.md` governs the fast local-first workflow, concurrent work rules, testing/debugging classification, and shipment gate for every AI-assisted change. This roadmap adds lean-code-specific boundaries on top of that standard.

## Goal

Reduce runtime layers, wrapper chains, duplicate ownership, and dead script loads while preserving gameplay, saves, balance, UI behavior, and active feature work.

Success is measured primarily by:

- fewer scripts requested at runtime;
- fewer layered wrappers around the same global functions;
- one clear owner per subsystem responsibility;
- smaller and clearer canonical modules;
- no regression in the moving smoke ratchet or Chromium/WebKit suite.

Line count alone is not a target.

## Mandatory concurrency protocol

All developers and AI agents must first follow `AGENTS.md`, then apply these lean-code-specific rules:

1. Read `ARCHITECTURE.md` and this file before editing runtime ownership or script loading.
2. Fetch the current `main` SHA immediately before branching.
3. Work from that exact SHA; never assume a previously inspected version is still current.
4. Declare the subsystem/files being changed in the PR body using the repository PR template.
5. Treat actively evolving feature areas as feature-owner sensitive. If another branch/commit changes the same owner or loader entry, re-evaluate before continuing.
6. If `main` moves, compare the intervening delta. Rebuild/rebase and retest only when it intersects the files/owners touched by the cleanup.
7. Do not combine feature/balance changes with lean-code cleanup unless the feature itself requires an ownership transfer.
8. Before merge, fetch `main` again and verify the exact tested head is still safe.
9. Merge only the exact head SHA that passed the moving smoke ratchet and full Chromium/WebKit regression gate.
10. Update `ARCHITECTURE.md`, this roadmap, and relevant ownership tests whenever ownership changes.

The dated remaining-work disposition is in `LEAN_CODE_REAUDIT.md`. It records concrete scopes, required compatibility proof and deferred owner-sensitive work; it does not mark the whole program complete.

## Workstream boundaries

### Feature-owner sensitive

These areas are changing rapidly and should not be consolidated while another feature branch is actively modifying them:

- Familiars
- Forge / equipment / progression
- Rebirth progression
- combat progression and boss/enemy authority

Cleanup in these areas starts only after checking current `main` and current/open work.

### Lower-conflict cleanup candidates

Prefer these first when their behavior is already contract-locked:

- retired/unloaded compatibility layers;
- Accomplishments legacy shells;
- Tree legacy shells;
- Home/BottomNav compatibility wrappers already superseded by canonical owners;
- generic duplicate utilities that do not own gameplay state.

## Phases

### L0 — Runtime inventory and coordination
Status: COMPLETE

The exact loader inventory is maintained in `RUNTIME_INVENTORY.md`. The post-V310 baseline recorded 97 static script entries plus 9 deferred core scripts, for 106 JavaScript files in a normal non-Social session. BottomNav consolidation reduced that to 105; Home V119 consolidation reduced it to 104; unloading retired Accomplishments V141 reduced it to 103; unloading inert Tree V117 reduced it to 102; unloading the retired Hero Equipment bridge reduced it to 101; absorbing the V105 reward-notification CSS into `style.css` reduces the index-managed subtotal to **100** files with **93 static script entries** and 7 deferred core scripts. The older counts omitted ten active scripts loaded transitively by `familiars-noscr-v231.js`; the complete normal-session first-party runtime is **110**, down from **111** before V105. Social and Bot Tester scripts remain conditional and are inventoried separately.

Completed:

- inventoried all scripts referenced by `index.html`, including deferred/conditional loader entries;
- classified loaded entries by runtime responsibility or explicit feature-owner-sensitive investigation queue;
- recorded active feature-owner-sensitive areas;
- retained architecture guardrails so removed owners cannot silently return;
- explicitly protected migration-only layers from being misclassified as dead code solely because they are historical.

Exit criteria met: every loaded script has a reason to exist or is explicitly queued for proof-based investigation.

### L1 — Dead-load removal
Status: COMPLETE

Stop requesting scripts that are provably inert or fully superseded, then retire their source only after surviving ownership is explicit and regression-locked. One-time save compensation/migration code is never classified as dead merely because most current saves already carry its marker; historical compatibility must be proven in a durable owner first.

Completed examples include:

- retired Accomplishments marker sources V135/V136/V137 after their responsibilities were already owned by V138/V139;
- `bottom-nav-v53.js` after its fantasy-decoration responsibility moved into canonical BottomNav ownership;
- `home-layout-fix-v119.js` after its compatibility styling/decorating responsibilities moved into Home V219;
- `accomplishments-floor-comp-v141.js` after its historical floor-reward migration responsibility and persisted markers moved into V127;
- `tree-labels-v117.js` after its naming-only labels moved into V116;
- `notification-compact-v105.js` after its CSS-only reward-notification overrides moved into `style.css`;
- Forge auto-batch history V254/V258/V260/V261 after loaded V266 was proven to own the surviving gate behavior;
- Rebirth scroll history V220 after loaded V221 was proven to be its explicit replacement;
- Forge panel/entry-animation history V259/V260/V261/V263/V264 after V266/V273 were proven to be the loaded presentation owners;
- later Forge UX history V261/V266/V268–V272 after V273 was contract-locked as the event-driven loot authority;
- early Forge loot UX history V252/V253/V258 after V273 and batch-gate V266 were proven to own the surviving presentation/gating behavior;
- Forge V148 power-feedback history, V112/V135 UI-action history, Familiar V232 pagination history, import progression V298, progression-coherence V304, and equipment dust-refund V238 after each replacement chain was behavior-locked in dedicated regression contracts.

Final closure sequence:

- PR #146 retired Forge V148 power-feedback history;
- PR #147 retired Forge V112/V135 UI history;
- PR #148 retired Familiar V232 pagination history in favor of integrated V234;
- PR #149 retired import progression V298 in favor of corrected V299 imported-state normalization;
- PR #150 retired the historical progression-coherence V304 pack after multiplier ownership was proven in progression-stability V304 and Familiar helper ownership in V305;
- PR #151 retired equipment dust-refund V238 after loaded V239 was proven to reconstruct legacy investment and own the current 50%/100% refund model independently.

The corrected L1 source-reference investigation queue is now **zero**. Every normal, deferred, transitive and conditional runtime script in `RUNTIME_INVENTORY.md` has an explicit reason to remain loaded, and every previously queued unloaded root-level candidate has either been retired with surviving-owner proof or retained as an active owner. The final source retirements do not change the **110-file** normal-session runtime count because those files were already unloaded before deletion.

L1 exit criteria are met. Any future dead-load/source-retirement work requires a new reachability audit or a later L2/L3 ownership transfer; it is not part of the completed L1 queue.

### L2 — Wrapper-chain collapse
Status: IN PROGRESS

Identify globals repeatedly wrapped by versioned patches. Move final intended behavior into the canonical owner and remove intermediate runtime wrappers or perpetual polling where deterministic lifecycle hooks already exist.

Completed so far:

- Accomplishments V121/V126 converted away from recurring render/polling ownership for the cleaned responsibilities; deterministic lifecycle hooks own those paths;
- Accomplishments V138 stopped wrapping `renderTabs` and now subscribes to canonical `sr:bottomnavrendered` lifecycle;
- Accomplishments V139 stopped wrapping global `openModal`; canonical rendering routes through `ACT.accomplishments()`;
- Tree V116 removed its duplicate permanent 500 ms `syncMode` poller and then its document-wide `MutationObserver`; Tree mode synchronization now subscribes to canonical `sr:bottomnavrendered` lifecycle while retaining startup sync;
- Tree V83 stopped wrapping `raidReward` for Raid Évolution PE after V290 was confirmed as the later canonical owner with the identical 100 PE + 3/level rule; V83 retains only mastery-save restoration and audit behavior;
- Home V219 stopped wrapping `renderTabs` and now subscribes to the canonical `sr:bottomnavrendered` lifecycle while keeping resize/orientation/startup synchronization;
- Boot V115 removed its redundant permanent 500 ms wave-display poller while retaining the DOM-driven synchronization path and startup sync.

Continue with one behavior at a time. Do not remove migration/save compatibility responsibilities merely because their runtime path is infrequent. The current preferred next scope is Sanctuary reserve rendering, where V126 still uses a zero-delay mount after `scrSanctuaire` returns HTML; replace it only after proving an equivalent post-DOM-commit lifecycle for initial entry, refill and rerender.

### L3 — Subsystem consolidation
Status: IN PROGRESS

Consolidate stable areas into durable modules instead of versioned patch chains.

Completed so far:

- BottomNav fantasy decoration from `bottom-nav-v53.js` was absorbed into `bottom-nav-layout-v183.js`, leaving one canonical BottomNav runtime owner for decoration, geometry and render lifecycle while `premium-ui-v209.js` remains visual polish only;
- Home compatibility decoration from `home-layout-fix-v119.js` was absorbed into `home-layout-authority-v219.js`, leaving one canonical loaded Home owner for geometry, lifecycle, Forge info accessibility, reward-feed compatibility, equipment-filter readability, Settings stat cards and toast/tutorial positioning;
- Accomplishments Settings entry injection moved from legacy V121 into canonical `accomplishments-canonical-v139.js`; V121's duplicate claim/payout path and legacy modal/reward renderer were removed, leaving V121 with state migration plus raid/fusion event compatibility while V139/V140 remain the sole UI and payout owners;
- Accomplishments legacy floor25/floor50/floor75 make-good logic moved from standalone V141 into `accomplishments-reward-fix-v127.js`, preserving the exact V141 persisted idempotency markers and payout values while giving Raid 100 and floor compensation one durable boot/import migration owner;
- Tree clearer gold-node labels from `tree-labels-v117.js` were absorbed into canonical dedicated renderer `tree-dedicated-v116.js`;
- compact reward-notification presentation from CSS-only `notification-compact-v105.js` was absorbed directly into the canonical `#rewardFeed` / `.rewardPop` rules in `style.css`;
- Forge presentation ownership is explicit: `forge-panel-authority-v266.js` owns the Home panel renderer, `forge-ux-v273.js` owns current event-driven loot presentation and entry animation, and `forge-auto-batch-gate-v266.js` owns batch progression gating. Historical panel, entry-animation and loot-UX predecessors covered by the L1 audit are source-retired.

Remaining initial candidates:

1. Accomplishments durable consolidation / migration separation
2. Tree
3. Combat presentation/cadence
4. Forge / progression only after active feature work settles

### L4 — Shared utilities
Status: INVESTIGATION STARTED

The initial audit found different null/apostrophe escaping and numeric-formatting semantics across owners. See `LEAN_CODE_REAUDIT.md`; no shared-helper production transfer is complete.

Deduplicate non-domain helpers such as formatting, DOM helpers, notifications, safe persistence, modal helpers, and common lifecycle utilities where this actually reduces coupling.

### L5 — Source retirement
Status: IN PROGRESS

After scripts have remained unloaded and regression-covered across subsequent versions, delete obsolete source files from the working tree. Git history remains the archive.

Completed examples include the retired Accomplishments marker families, V135 bridge and V141 layer, BottomNav V53, Home V119, Tree renderer/bridge history through V90/V92/V102/V213, Power Integrity V255, Equipment V175, Hero Equipment V1, notification V105, the Forge auto-batch history, Rebirth V220, Forge panel/entry-animation history, later and early Forge loot-UX history, Forge V148, Forge V112/V135, Familiar V232, import V298, progression-coherence V304 and equipment-refund V238.

There is **no current L1-derived source-retirement candidate**. Future L5 work starts only when a later L2/L3 ownership transfer has survived integration long enough to justify staged source deletion, or when a fresh audit finds new obsolete source.

## Change-size policy

Prefer coherent, reviewable batches. Multiple provably dormant scripts in one subsystem may be unloaded together when the ownership test and runtime regression suite cover the whole batch. Do not bundle unrelated active subsystems merely to reduce PR count.

## Completion criteria for remaining phases

- L1: **MET** — every proposed unload/source retirement has reachability and surviving-owner evidence; remaining active or conditional files have an explicit reason to stay loaded.
- L2: each proposed timer/wrapper removal has equivalent startup, rerender and state-transition coverage, including old saves where applicable.
- L3: canonical modules own each transferred responsibility without replacing required migration compatibility or crossing active feature ownership.
- L4: helper candidates have agreed input/output semantics and a measurable reduction in duplication without extra coupling. Retaining intentionally different helpers is valid.
- L5: staged retired sources have subsequent integration proof, no remaining executable/archive dependency, and active ownership guards before deletion.

These later phases remain open until their evidence is recorded. A source count or a green test run alone is not enough to declare the entire program complete.

## Current baseline

Program baseline: V295 (`0344193a490a0f12d017a9a9ce1696de0dea487b`) at program start.

Current first-party runtime remains **110 JavaScript files** (100 index-managed + 10 transitively loaded) in the normal non-Social session. See `RUNTIME_INVENTORY.md` for the exhaustive loader list and conditional modes.

L1 is complete at `main` after PR #151 (`231a8c81aa70f00f37cb66c9a7b1ffe2145a2733`). Future lean-code production work should now prioritize L2 lifecycle/wrapper collapse, beginning with the lowest-risk deterministic lifecycle opportunities and continuing to respect current feature-owner reservations.
