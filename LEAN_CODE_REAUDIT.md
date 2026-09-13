# Lean-code remaining-work audit

Audit refreshed: 2026-09-13. L1 closure base: `231a8c81aa70f00f37cb66c9a7b1ffe2145a2733` (PR #151 merged). Current refresh base: `b5346318a65a95e02bbe71e9bf4c9e8214b036fb` (PR #222 merged).

This file records the current remaining-work disposition after the proof-based L1 audit and subsequent L2/L3/L4/L5 passes. **L1 is complete.** L2, L3, L4 and staged L5 remain open and evidence-driven.

## Verified runtime baseline

`RUNTIME_INVENTORY.md` remains authoritative. The default non-Social session loads **105 first-party JavaScript files**:

- 88 static loader entries;
- 7 deferred core entries;
- 10 scripts loaded transitively by `familiars-noscr-v231.js`.

Index-managed subtotal: **95** files. Social raises the first-party total to **107** and Social + Bot Testers to **109**. Optional third-party Social modules remain outside those totals.

## L1 closure

The corrected L1 source-reference investigation queue remains **zero**. Every currently loaded script has an explicit active, compatibility, migration or feature-owner-sensitive reason to remain. Future removals require a fresh reachability audit or a later L2/L3 ownership transfer.

## L2 lifecycle consolidation

Completed lifecycle work includes Accomplishments V126 deterministic reserve synchronization, Weekly Mega panel-poller removal, Social launcher lifecycle transfer, V83 modal/campaign observer retirement, Secondary HUD observer/wrapper retirement, and the Audio V26 migration/reward/edge proof sequence.

The remaining evidence-gated lifecycle areas are unchanged:

- **Audio V26:** retain the 50 ms combat observer until an existing canonical combat owner exposes equivalent attack/skill/result lifecycle ordering. The 520 ms music cadence and historical migration remain compatibility behavior.
- **Power Hint:** do not re-wrap combat-end behavior merely to remove passive observation; require an already-existing deterministic lifecycle that preserves campaign-death recovery.
- **Boot wave synchronization:** require an explicit deterministic wave-transition lifecycle plus death/recovery coverage before removing the remaining DOM-driven observation path.

## L3 subsystem consolidation

Stable consolidated ownership includes BottomNav, Home, Accomplishments UI/claims/migrations, Tree rendering/mastery boundaries, reward-notification base styling, and the documented Forge presentation split.

### Tree

PRs #213/#214 removed V82's duplicate renderer, renderer helpers, injected presentation CSS and renderer-only angle metadata. PR #216 moved mastery-key raw-save restoration into V82. PR #219 then moved the historical `window.__srTreeAudit` diagnostic into V82, leaving `tree-safety-v83.js` as an inert compatibility marker.

Current Tree boundaries are therefore:

- `personal-tree-radial-v82.js` — topology, mastery-key construction/acquisition, deprecated-key compatibility, raw-save mastery restoration and the historical audit API;
- `tree-dedicated-v116.js` — canonical Tree rendering;
- `runtime-tree-stability-v216.js` — live mastery gating and popup synchronization;
- `tree-safety-v83.js` — inert marker only, pending loader retirement.

The V83 loader retirement remains mechanical but cannot proceed while an active feature PR owns `index.html`.

### Accomplishments

PR #222 moved the remaining historical Accomplishments progress normalization (`raidWins`, `fusedPetRank`, `v121Migrated`) from V121 into the durable V127 boot/import migration owner. V121 is now event-compatibility-only for raid-result and fusion progression tracking; V139/V140 remain canonical UI/claim owners.

Do not collapse V121 into payout/UI owners merely to reduce file count. Reassess only if an evidence-backed event-lifecycle consolidation produces a clearer durable owner without changing progression semantics.

## L4 shared-utility disposition

The Social message-store policy transfer remains the validated L4 production consolidation. Formatting, escaping and lifecycle-scheduling helpers remain local where their semantics differ or a shared abstraction would increase coupling. Retaining intentionally different helpers is a valid L4 outcome.

## L5 source retirement

There is no standing L1-derived deletion queue. New source retirement begins only after a later L2/L3 transfer survives integration or a fresh audit proves a source obsolete.

The next staged Tree candidate is `tree-safety-v83.js`, but source retirement must follow runtime unload and integration proof; it is not ready while the loader entry remains active.

## Current concurrent-work constraints

Open feature work at this refresh:

- **PR #220** owns Forge equipment-safety lifecycle/performance behavior in V151.
- **PR #223** owns Forge-to-Raid onboarding and `progression-integration-pack-v305.js`; it replaces the older #204 path after V316.

Lean Code must avoid Forge/equipment/progression ownership while those branches are active. PR #223 also keeps loader-adjacent progression work active, so Tree V83/V247 loader changes remain deferred until the current loader ownership is clear.

The earlier V247 proof PR #210 remains intentionally unmerged after its exact-head smoke ratchet passed but two different WebKit runs were blocked by the `Combat automatique` tutorial overlay; its permitted unchanged-head retry was consumed. No test weakening or production workaround is justified from that evidence.

## Remaining Lean Code work

| Phase / responsibility | Current evidence | Next reviewable scope / exit condition |
| --- | --- | --- |
| L2 Accomplishments lifecycle | Timer/observer cleanup and durable migration separation are complete through #222. | Reassess only if a concrete duplicate wrapper/event seam appears with save/lifecycle proof. |
| L2 Secondary HUD lifecycle | Complete under PRs #155/#171. | No current scope; preserve contracts. |
| L2 Power Hint lifecycle | Campaign-death recovery is deterministic; current owner must remain passive. | Require an existing deterministic combat lifecycle; do not re-wrap `handleCombatEnd`. |
| L2 Audio | Migration/reward/edge semantics are locked; 50 ms combat observer remains. | Remove only when an existing canonical combat owner exposes equivalent attack/skill/result events and ordering. |
| L2 Boot wave observation | DOM-driven synchronization still supplies live wave presentation. | Require explicit deterministic wave-transition lifecycle plus wave/death recovery coverage. |
| L3 Tree topology/compatibility | V82 now owns topology, mastery compatibility, raw-save restoration and audit; V116/V216 retain renderer/live mastery boundaries. | Preserve these durable boundaries. |
| L3 Tree V83 retirement | V83 is behavior-free and contract-locked as inert. | Remove loader entry after active loader work resolves; run focused Tree ownership proof + full runtime gate; retire source only after integration proof. |
| L3 Tree V247 presentation | Presentation-only consolidation remains proven conceptually but loader removal is deferred. | Reassess after active loader work resolves and only with a clean ownership/test path. |
| L3 Forge/progression | Active #220/#223 own this surface. | Defer until feature work settles, then refresh ownership from latest `main`. |
| L4 shared helpers | Social store transfer complete; other audited helpers intentionally differ. | Reopen only for genuinely identical semantics with measurable reduction and no new coupling. |
| L5 staged source retirement | No standing queue; V83 becomes eligible only after unload proof. | New candidates only after later L2/L3 transfers or a fresh reachability audit. |

## Next-step rule

Select each new batch from fresh `main` in this order:

1. prefer a newly discovered neutral UI/lifecycle/helper candidate only when the surviving owner/hook is deterministic and behavior-equivalent;
2. if a staged unload/source retirement has already passed integration proof, finish that retirement without crossing an active feature owner;
3. keep Power Hint, Boot wave and Audio deferred until their required deterministic lifecycle evidence exists;
4. keep Tree V83/V247 loader changes deferred while active feature work owns or intersects the loader surface;
5. keep Forge/equipment/progression deferred while #220/#223 are active;
6. if no production transfer is evidence-safe, synchronize ownership/roadmap documentation rather than forcing a weaker architecture.

## Phase status

- **L0 — COMPLETE**
- **L1 — COMPLETE**
- **L2 — IN PROGRESS**
- **L3 — IN PROGRESS**
- **L4 — IN PROGRESS** — one validated production transfer; retained-local decisions are valid outcomes
- **L5 — IN PROGRESS** — staged retirements only; no standing L1 queue

Every production/runtime batch continues to follow `AGENTS.md`: fresh-main start, coherent scoped implementation, focused preflight, one meaningful publication state, exact-head CI, latest-main intersection check, exact-head merge and post-merge verification. Documentation-only corrections use the documented fast path and do not incur artificial browser CI.
