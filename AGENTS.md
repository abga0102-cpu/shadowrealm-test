# Shadowreach AI development operating standard

This repository is developed concurrently by multiple humans using AI coding agents. Every AI agent must follow this file before changing code, tests, runtime ownership, loaders, balance, or saves.

## Core rule

Work fast **locally first**, use GitHub as the integration gate, and never trade away regression safety for speed.

## Start-of-task protocol

1. Read `AGENTS.md`, `ARCHITECTURE.md`, and any task-specific roadmap such as `LEAN_CODE_PLAN.md`.
2. Fetch the latest `main` SHA immediately before starting.
3. Check open/recent PRs only for the subsystem/files/owners you intend to touch.
4. Choose a narrow workstream with a clear owner boundary. Do not start overlapping work when another active PR owns the same files or runtime responsibility unless the work is explicitly coordinated.
5. Record the exact starting `main` SHA.

## Fast local-first workflow

1. Pull/materialize only the files needed for the task.
2. Make and debug changes locally. Avoid iterative GitHub commits while still exploring.
3. Run the fastest relevant checks after meaningful edits: syntax/static checks first, then focused subsystem tests.
4. Before publishing, run a local preflight: relevant ownership/contracts, relevant browser/runtime tests where available, and final diff review for unrelated changes.
5. Re-fetch `main` once before publishing.
   - If `main` is unchanged: publish.
   - If it moved only in unrelated files/owners: continue without unnecessary rework.
   - If it intersects the task: integrate the intersecting delta locally and rerun affected tests.
6. Publish one coherent branch with one clean commit where practical. Open the PR only when the change is ready for CI.
7. GitHub CI is the final integration gate: moving smoke ratchet plus the full Chromium/WebKit regression suite.
8. If CI fails:
   - reproduce and fix real regressions locally before republishing;
   - if the failure is clearly unrelated/nondeterministic, rerun the exact same head once before changing code;
   - never weaken tests or alter production behavior merely to silence an unexplained flaky failure.
9. Immediately before merge, fetch `main` again and compare only the delta since the PR base.
10. Merge only the exact tested head SHA. After merge, verify the resulting `main` commit.

## Single-batch execution and CI polling discipline

The default operating mode is **one coherent execution batch per scoped task**, not a sequence of tiny GitHub actions separated by repeated status checks.

1. Implement the complete scoped change locally before publishing whenever practical.
2. Consolidate local validation into one meaningful preflight: syntax/static checks, focused subsystem/contracts, required local browser/runtime coverage, and diff review.
3. Push/update the branch once per meaningful implementation state. Do not create a stream of exploratory commits or PR updates for minor intermediate edits.
4. Trigger the required GitHub CI once for that meaningful head and treat that exact SHA as the candidate merge head.
5. Do **not** poll GitHub every 10–30 seconds while CI is merely running. Avoid repeated short waits followed by status-only checks.
6. While CI is running, only perform useful independent work that cannot invalidate the candidate head. Otherwise leave the workflow alone until a materially useful recheck is justified.
7. Recheck CI when there is a reasonable chance the required workflow has completed, or when GitHub reports a terminal state. Prefer one substantive recheck over many micro-checks.
8. If CI is still running at a recheck, do not enter a tight polling loop. Keep the current candidate head unchanged unless new evidence requires action.
9. If CI passes, verify the exact tested head and current `main`, then proceed directly to merge in the same work session when safe.
10. If CI fails, inspect the concrete failure before taking action. Fix the cause locally, publish one new meaningful head, and run the gate again.
11. Never skip the exact-head CI gate merely to make the workflow feel like a one-shot operation. The optimization is fewer unnecessary interactions, **not** less validation.

Preferred flow:

`complete scoped implementation -> local preflight -> one push/PR update -> one CI gate -> verify exact head + latest main -> merge -> verify post-merge main`

Avoid this pattern:

`small edit -> push -> wait 15s -> check -> wait 25s -> check -> tiny edit -> push -> repeat`

## Parallel work rules

- **One active owner per responsibility.** Use `ARCHITECTURE.md` as the source of truth for canonical runtime ownership.
- **Avoid file overlap by design.** Prefer separate subsystems, tests, docs, and modules rather than both agents editing the same files.
- **PR body = workstream declaration.** Every PR must state subsystem, files/owners touched, starting `main` SHA, behavior intentionally changed, behavior explicitly not changed, tests run, and known concurrent work checked.
- **Do not restart for unrelated commits.** If another developer moves `main`, inspect the delta. Rebase/rebuild only when the delta intersects the files or ownership touched by your branch.
- **Feature-sensitive areas require extra care.** Familiars, Forge/equipment/progression, Rebirth, combat progression, boss/enemy authority, save schema/migrations, and other areas marked sensitive in roadmaps should not be consolidated while another active branch is changing the same owner.
- **No mixed-purpose PRs.** Do not combine cleanup, balance, feature work, save migration, and unrelated UI changes unless they are inseparable.
- **Prefer small, independently shippable PRs.** A small safe PR may proceed in parallel with another subsystem's PR.
- **Never overwrite newer work.** If a file changed on `main` after the task started, compare the newer version before publishing or merging.

## Required testing standard

Every production-code PR must, at minimum:

- pass relevant focused tests for the changed subsystem;
- preserve or intentionally update ownership/architecture contracts;
- pass the moving legacy smoke ratchet;
- pass the full Chromium + WebKit regression suite;
- be tested at the exact PR head that is merged.

Docs-only changes may skip browser testing when they cannot affect runtime or test behavior, but must still be reviewed for consistency with the current architecture and workflow.

## Debugging standard

Classify failures before fixing them:

1. **Real regression caused by the branch** → reproduce locally, fix, rerun focused tests, then full gate.
2. **Stale contract/test after an intentional ownership transfer** → update the contract to assert the new architecture without weakening behavior coverage.
3. **Unrelated flaky/nondeterministic failure** → rerun the exact same commit once; do not change production code without evidence.
4. **Concurrent change conflict** → integrate only the intersecting delta, then rerun affected tests and the final gate.

## Shipment standard

A change is shipped only when:

- its PR scope is coherent and documented;
- the exact head SHA passed the required CI gate;
- latest `main` was checked immediately before merge;
- any intersecting concurrent changes were reconciled and retested;
- the exact tested head SHA was used for merge protection;
- post-merge `main` was verified.

## Communication standard

AI agents should work autonomously through routine local edits, debugging, and test cycles. Report back when the change is merged, when a real blocker requires human input, or when concurrent work materially changes the task. Avoid narrating every minor step, and do not send repetitive status updates caused only by CI still being in progress. Prefer one substantive update after a meaningful state change.
