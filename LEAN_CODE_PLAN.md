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
9. Merge only the exact head SHA that passed the moving smoke ratchet and full Chromium/WebKit regression gate when that gate is required by `AGENTS.md`.
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

The exact loader inventory is maintained in `RUNTIME_INVENTORY.md`. The current normal non-Social first-party runtime is **103 JavaScript files**: **86 static** script entries, **7 deferred** core entries and **10 Familiar-transitive** scripts. The index-managed subtotal is **93**. Social raises the first-party total to 105 and Social + Bot Testers to 107. Historical reductions from the earlier V309/V310-era baseline are recorded in `RUNTIME_INVENTORY.md`; the latest reductions include the staged Tree V83 unload and the V247 presentation consolidation into canonical V116.

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

The corrected L1 source-reference investigation queue is now **zero**. Every normal, deferred, transitive and conditional runtime script in `RUNTIME_INVENTORY.md` has an explicit reason to remain loaded, and every previously queued unloaded root-level candidate has either been retired with surviving-owner proof or retained as an active owner. Subsequent L2/L3 ownership transfers have reduced the runtime further to the current **103-file** normal-session total; those later reductions do not reopen the completed L1 queue.

L1 exit criteria are met. Any future dead-load/source-retirement work requires a new reachability audit or a later L2/L3 ownership transfer; it is not part of the completed L1 queue.

### L2 — Wrapper-chain collapse
Status: IN PROGRESS

Identify globals repeatedly wrapped by versioned patches. Move final intended behavior into the canonical owner and remove intermediate runtime wrappers or perpetual polling where deterministic lifecycle hooks already exist.

Completed so far:

- Accomplishments V121/V126 converted away from recurring render/polling ownership for the cleaned responsibilities; deterministic lifecycle hooks own those paths;
- Accomplishments V138 stopped wrapping `renderTabs` and now subscribes to canonical `sr:bottomnavrendered` lifecycle;
- Accomplishments V139 stopped wrapping global `openModal`; canonical rendering routes through `ACT.accomplishments()`;
- Tree V116 removed its duplicate permanent 500 ms `syncMode` poller and then its document-wide `MutationObserver`; Tree mode synchronization now subscribes to canonical `sr:bottomnavrendered` lifecycle while retaining startup sync;
- Tree V83 stopped wrapping `raidReward` after V290 became the canonical Raid Évolution PE owner; subsequent Tree consolidation moved V83's remaining mastery-key raw-save restoration and historical `__srTreeAudit` API into V82, and V83 is now retired from both runtime and source;
- Home V219 stopped wrapping `renderTabs` and now subscribes to the canonical `sr:bottomnavrendered` lifecycle while keeping resize/orientation/startup synchronization;
- Boot V115 removed its redundant permanent 500 ms wave-display poller while retaining the DOM-driven synchronization path and startup sync;
- PR #154 removed Weekly Mega's permanent 1.2-second panel injection poller; the panel now follows `sr:bottomnavrendered` with one-frame deferral to respect core render ordering, while its separate 60-second reward-grant cadence remains unchanged;
- PR #155 removed Secondary HUD's modal-state `MutationObserver` and moved that responsibility to canonical `sr:modal-state`; its remaining HUD render wrapper was deliberately left for a later isolated transfer and is now retired under PR #171;
- PR #158 removed Social's permanent 1-second launcher remount poller and `#screen` `MutationObserver`; one deferred `sr:bottomnavrendered` callback now owns launcher remount/docking, while startup, resize/orientation, remote/bot and arena-result cadences remain unchanged;
- PR #153 replaced V126's zero-delay Sanctuary reserve mount with a deterministic microtask checkpoint after the synchronous screen DOM commit, preserving reserve/refill semantics;
- PR #161 removed V126's remaining 50 ms startup migration synchronization. Fresh-boot compensation now relies on the already-synchronous V127 ordering, and imported-save synchronization runs inside the existing deterministic `migrate(...)` chain before imported state becomes global. Focused Chromium/WebKit coverage locks legacy pending-piece conservation across both paths;
- PR #163 contract-locked the four previously coalesced V83 responsibilities before further lifecycle cleanup: overlay persistence tagging, `sr:modal-state` publication, queued-modal draining and campaign compact tagging;
- PR #164 moved only campaign compact tagging off V83's broad `#app` observer. `srHomeCompact` now follows `sr:bottomnavrendered` with one-frame deferral after core screen rendering, while the observer remains in place for modal-only responsibilities. Chromium/WebKit coverage locks Home → Equipment → Home behavior;
- PR #166 added an observerless Chromium/WebKit proof before changing production V83. The real game boots with only the remaining `#app` observer removed in-memory and preserves overlay persistence tagging, canonical `sr:modal-state` publication, FIFO queued-modal draining and Home → Equipment → Home campaign behavior;
- PR #168 removed the remaining broad V83 `#app` observer from production without adding a replacement hook. Guarded modal transitions and startup synchronization retain the surviving behavior, the #166 proof now runs against production source, and a static contract keeps direct overlay creation/removal in the native modal owner among directly loaded runtime scripts;
- PR #171 removed Secondary HUD V279's remaining `renderHUD` wrapper. Route context now follows canonical `sr:bottomnavrendered`, modal context remains on `sr:modal-state`, and startup still synchronizes immediately. No replacement observer, timer or wrapper was added.

Continue with one behavior at a time. Do not remove migration/save compatibility responsibilities merely because their runtime path is infrequent. Tree V83 lifecycle/compatibility retirement is complete; Secondary HUD's V279 lifecycle cleanup is complete through #171. Prefer a newly discovered neutral UI lifecycle candidate with an existing deterministic hook. Power Hint, Boot wave and Audio V26 remain evidence-gated because their current behavior intersects combat/death or historical save responsibilities.

### L3 — Subsystem consolidation
Status: IN PROGRESS

Consolidate stable areas into durable modules instead of versioned patch chains.

Completed so far:

- BottomNav fantasy decoration from `bottom-nav-v53.js` was absorbed into `bottom-nav-layout-v183.js`, leaving one canonical BottomNav runtime owner for decoration, geometry and render lifecycle while `premium-ui-v209.js` remains visual polish only;
- Home compatibility decoration from `home-layout-fix-v119.js` was absorbed into `home-layout-authority-v219.js`, leaving one canonical loaded Home owner for geometry, lifecycle, Forge info accessibility, reward-feed compatibility, equipment-filter readability, Settings stat cards and toast/tutorial positioning;
- Accomplishments Settings entry injection moved from legacy V121 into canonical `accomplishments-canonical-v139.js`; later navigation consolidation moved the canonical Accomplishments entry under Progression while preserving V139/V140 as UI/claim owners and V127 as the durable legacy migration owner;
- Accomplishments legacy floor25/floor50/floor75 make-good logic moved from standalone V141 into `accomplishments-reward-fix-v127.js`, preserving the exact V141 persisted idempotency markers and payout values while giving Raid 100 and floor compensation one durable boot/import migration owner;
- Tree clearer gold-node labels from `tree-labels-v117.js` were absorbed into canonical dedicated renderer `tree-dedicated-v116.js`;
- Tree mastery-key raw-save restoration and the historical observational `__srTreeAudit` API were consolidated into `personal-tree-radial-v82.js`; V83 is now retired from runtime and source;
- Tree V247/V250 spectacle presentation was folded into canonical `tree-dedicated-v116.js`; V247 is now retired from runtime and source after subsequent integration proof;
- compact reward-notification presentation from CSS-only `notification-compact-v105.js` was absorbed directly into the canonical `#rewardFeed` / `.rewardPop` rules in `style.css`;
- Forge presentation ownership is explicit: `forge-panel-authority-v266.js` owns the Home panel renderer, `forge-ux-v273.js` owns current event-driven loot presentation and entry animation, and `forge-auto-batch-gate-v266.js` owns batch progression gating. Historical panel, entry-animation and loot-UX predecessors covered by the L1 audit are source-retired.

Current reviewable areas:

1. Accomplishments only if a new evidence-backed lifecycle/event seam produces a clearer durable owner without changing progression or save semantics;
2. Combat presentation/cadence only where deterministic lifecycle equivalence is already available;
3. Forge / progression only after active feature work settles and a fresh-main re-audit identifies a narrow ownership seam;
4. Tree has no current consolidation scope beyond preserving V82/V116/V216 boundaries and retired-owner contracts.

### L4 — Shared utilities
Status: IN PROGRESS

The formatting, escaping and lifecycle-scheduling audits found intentionally different semantics or an unfavorable coupling tradeoff, so those helpers remain local and are contract-locked in `L4_HELPER_SEMANTICS.md`.

The first production transfer is the Social message-store policy: `social-v1.js` owns the message key, 160-message retention, malformed/non-array read fallback and capped serialization, while `social-p2p-v1.js` and `social-bot-testers-v5.js` reuse that contract and retain their owner-specific write/error and same-tab notification behavior. This uses an existing feature-owner/load-order relationship rather than introducing a generic utility module.

Continue deduplicating non-domain helpers such as formatting, DOM helpers, notifications, safe persistence, modal helpers, and common lifecycle utilities only where semantic agreement is proven and the transfer measurably reduces duplication without extra coupling. Retaining intentionally different helpers remains a valid L4 outcome.

### L5 — Source retirement
Status: IN PROGRESS

After scripts have remained unloaded and regression-covered across subsequent versions, delete obsolete source files from the working tree. Git history remains the archive.

Completed examples include the retired Accomplishments marker families, V135 bridge and V141 layer, BottomNav V53, Home V119, Tree renderer/bridge history through V90/V92/V102/V213, Power Integrity V255, Equipment V175, Hero Equipment V1, notification V105, the Forge auto-batch history, Rebirth V220, Forge panel/entry-animation history, later and early Forge loot-UX history, Forge V148, Forge V112/V135, Familiar V232, import V298, progression-coherence V304, equipment-refund V238, Tree V83 and Tree V247.

The staged Tree retirement sequence is complete:

- `tree-safety-v83.js` was unloaded only after V82 owned its final compatibility/audit behavior, then source-retired after integration proof;
- `personal-tree-spectacle-v247.js` was unloaded after V247/V250 presentation moved into V116, then source-retired after subsequent full-gate integration proof.

There is **no current evidence-ready staged L5 source candidate** and no standing L1-derived deletion queue. Future L5 work starts only when a later L2/L3 ownership transfer has survived integration long enough to justify source deletion, or when a fresh reachability audit proves a new source obsolete.

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

Current first-party runtime is **103 JavaScript files** (**93 index-managed + 10 transitively loaded**) in the normal non-Social session. Tree V83 and V247 are retired from both runtime and source. See `RUNTIME_INVENTORY.md` for the exhaustive loader list and conditional modes.

L1 is complete at `main` after PR #151 (`231a8c81aa70f00f37cb66c9a7b1ffe2145a2733`). The L2/L3 completion ledger now also includes the later Tree and navigation work: V83 compatibility transfer/retirement through #219/#226, Accomplishments migration separation through #222, V247/V250 presentation consolidation under #230, permanent navigation/action-hierarchy consolidation under #231, and V247 source retirement under #237. The requested arcade-clean visual pass landed separately under #232 in canonical `premium-ui-v209.js`; it did not introduce a new runtime owner. L4 has its first production ownership transfer in the Social message-store family, with formatting, escaping and lifecycle helpers retained locally where consolidation would change semantics or increase coupling.

Future lean-code production work should continue from fresh `main`. Power Hint, Boot wave and Audio V26 still require their existing combat/save protections. Forge/progression and combat progression remain feature-owner sensitive and must not be consolidated while active work is changing the same owners. If no new production transfer is evidence-safe, keep the roadmap synchronized rather than forcing a weaker architecture.