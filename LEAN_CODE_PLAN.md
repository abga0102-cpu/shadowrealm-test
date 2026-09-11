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

The exact loader inventory is maintained in `RUNTIME_INVENTORY.md`. The post-V310 baseline recorded 97 static script entries plus 9 deferred core scripts, for 106 JavaScript files in a normal non-Social session. BottomNav consolidation reduced that to 105; Home V119 consolidation reduces the current normal runtime to **104** files while preserving the 97-script static count and lowering deferred core to **7**. Social and Bot Tester scripts remain conditional and are inventoried separately.

Completed:

- inventoried all scripts referenced by `index.html`, including deferred/conditional loader entries;
- classified loaded entries by runtime responsibility or explicit feature-owner-sensitive investigation queue;
- recorded active feature-owner-sensitive areas;
- retained architecture guardrails so removed owners cannot silently return;
- explicitly protected migration-only layers from being misclassified as dead code solely because they are historical.

Exit criteria met: every loaded script has a reason to exist or is explicitly queued for proof-based investigation.

### L1 — Dead-load removal
Status: IN PROGRESS

Stop requesting scripts that are provably inert or fully superseded. Keep source files in Git history/repository initially. Each unload is behavior-preserving and independently testable.

Do not classify one-time save compensation/migration code as dead merely because current saves commonly carry its processed marker. Required historical-save compatibility must first be transferred to a durable migration owner before such a loader entry can be removed.

Completed examples:

- retired Accomplishments marker sources V135/V136/V137 removed after their responsibilities were already owned by V138/V139;
- `bottom-nav-v53.js` unloaded after its active fantasy-decoration responsibility was absorbed into canonical V209 BottomNav ownership;
- `home-layout-fix-v119.js` unloaded after its active compatibility styling/decorating responsibilities were absorbed into canonical Home V219 ownership.

### L2 — Wrapper-chain collapse
Status: IN PROGRESS

Identify globals repeatedly wrapped by versioned patches. Move final intended behavior into the canonical owner and remove intermediate runtime wrappers or perpetual polling where deterministic lifecycle hooks already exist.

Completed so far:

- Accomplishments V121/V126 converted away from recurring render/polling ownership for the cleaned responsibilities; deterministic lifecycle hooks own those paths;
- Accomplishments V138 stopped wrapping `renderTabs` and now subscribes to canonical `sr:bottomnavrendered` lifecycle;
- Accomplishments V139 stopped wrapping global `openModal`; V121 claim refresh routes through canonical `ACT.accomplishments()`;
- Tree V116 removed its duplicate permanent 500 ms `syncMode` poller and then its document-wide `MutationObserver`; Tree mode synchronization now subscribes to canonical `sr:bottomnavrendered` lifecycle while retaining startup sync;
- Home V219 stopped wrapping `renderTabs` and now subscribes to the canonical `sr:bottomnavrendered` lifecycle while keeping resize/orientation/startup synchronization;
- Boot V115 removed its redundant permanent 500 ms wave-display poller while retaining the DOM-driven synchronization path and startup sync.

Continue with one behavior at a time. Do not remove migration/save compatibility responsibilities merely because their runtime path is infrequent.

### L3 — Subsystem consolidation
Status: IN PROGRESS

Consolidate stable areas into durable modules instead of versioned patch chains.

Completed so far:

- BottomNav fantasy decoration from `bottom-nav-v53.js` was absorbed into `bottom-nav-layout-v183.js`, leaving one canonical BottomNav runtime owner for decoration, geometry and render lifecycle while `premium-ui-v209.js` remains visual polish only;
- Home compatibility decoration from `home-layout-fix-v119.js` was absorbed into `home-layout-authority-v219.js`, leaving one canonical loaded Home owner for geometry, lifecycle, Forge info accessibility, reward-feed compatibility, equipment-filter readability, Settings stat cards and toast/tutorial positioning;
- Accomplishments Settings entry injection moved from legacy V121 into canonical `accomplishments-canonical-v139.js`, reducing V121 to state/event compatibility and reward-history responsibilities while preserving the same Settings entry behavior.

Remaining initial candidates:

1. Accomplishments durable consolidation / migration separation
2. Tree
3. Combat presentation/cadence
4. Forge / progression only after active feature work settles

### L4 — Shared utilities
Status: PLANNED

Deduplicate non-domain helpers such as formatting, DOM helpers, notifications, safe persistence, modal helpers, and common lifecycle utilities where this actually reduces coupling.

### L5 — Source retirement
Status: PLANNED

After scripts have remained unloaded and regression-covered across subsequent versions, delete obsolete source files from the working tree. Git history remains the archive.

## Change-size policy

Prefer coherent, reviewable batches. Multiple provably dormant scripts in one subsystem may be unloaded together when the ownership test and runtime regression suite cover the whole batch. Do not bundle unrelated active subsystems merely to reduce PR count.

## Current baseline

Program baseline: V295 (`0344193a490a0f12d017a9a9ce1696de0dea487b`) at program start.

Current integration baseline for the Home V119 consolidation: `main` `b5c43fedc700ffebc5eba076189f36c20927d9ff`. The candidate loader inventory is **104 JavaScript files** in the normal non-Social session. See `RUNTIME_INVENTORY.md` for the exhaustive loader list and conditional modes.

V295 added `familiar-ladder-authority-v295.js`, confirming that Familiars remains feature-owner sensitive and should not be an early consolidation target unless current work is rechecked first.