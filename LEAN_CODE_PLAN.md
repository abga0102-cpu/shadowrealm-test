# Shadowreach lean-code program

This roadmap is the shared source of truth for reducing runtime complexity without interrupting active feature development. It is written for both human developers and AI coding agents working concurrently on the repository.

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

All developers and AI agents must follow these rules while this program is active:

1. Read `ARCHITECTURE.md` and this file before editing runtime ownership or script loading.
2. Fetch the current `main` SHA immediately before branching.
3. Work from that exact SHA; never assume a previously inspected version is still current.
4. Declare the subsystem/files being changed in the PR body.
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
Status: IN PROGRESS

- inventory all scripts referenced by `index.html`, including deferred/conditional loader entries;
- classify each as canonical owner, active extension, compatibility-only, migration-only, conditional optional feature, or candidate dead load;
- record active feature-owner-sensitive areas;
- add/refine architecture tests so removed owners cannot silently return.

Exit criteria: every loaded script has a reason to exist or is explicitly queued for investigation.

### L1 — Dead-load removal
Status: PLANNED

Stop requesting scripts that are provably inert or fully superseded. Keep source files in Git history/repository initially. Each unload is behavior-preserving and independently testable.

### L2 — Wrapper-chain collapse
Status: PLANNED

Identify globals repeatedly wrapped by versioned patches. Move final intended behavior into the canonical owner and remove intermediate runtime wrappers.

### L3 — Subsystem consolidation
Status: PLANNED

Consolidate stable areas into durable modules instead of versioned patch chains. Initial candidates:

1. Home / BottomNav
2. Accomplishments
3. Tree
4. Combat presentation/cadence
5. Forge / progression only after active feature work settles

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

V295 added `familiar-ladder-authority-v295.js`, confirming that Familiars is currently feature-owner sensitive and should not be the first consolidation target.
