# Lean-code remaining-work audit

Audit refreshed: 2026-09-14. L1 closure base: `231a8c81aa70f00f37cb66c9a7b1ffe2145a2733` (PR #151 merged). Current refresh base: `71e3d3476b7275d6dfed6c520e741595808828b3` (PR #232 merged).

This file records the current remaining-work disposition after the proof-based L1 audit and subsequent L2/L3/L4/L5 passes. **L1 is complete.** L2, L3, L4 and staged L5 remain evidence-driven.

## Verified runtime baseline

`RUNTIME_INVENTORY.md` remains authoritative. The default non-Social session loads **103 first-party JavaScript files**:

- 86 static loader entries;
- 7 deferred core entries;
- 10 scripts loaded transitively by `familiars-noscr-v231.js`.

Index-managed subtotal: **93** files. Social raises the first-party total to **105** and Social + Bot Testers to **107**. Optional third-party Social modules remain outside those totals.

## L1 closure

The corrected L1 source-reference investigation queue remains **zero**. Every currently loaded script has an explicit active, compatibility, migration or feature-owner-sensitive reason to remain. Future removals require a fresh reachability audit or a later L2/L3 ownership transfer.

## L2 lifecycle consolidation

Completed lifecycle work includes Accomplishments V126 deterministic reserve synchronization, Weekly Mega panel-poller removal, Social launcher lifecycle transfer, V83 modal/campaign observer retirement, Secondary HUD observer/wrapper retirement, and the Audio V26 migration/reward/edge proof sequence.

The remaining evidence-gated lifecycle areas are unchanged:

- **Audio V26:** retain the 50 ms combat observer until an existing canonical combat owner exposes equivalent attack/skill/result lifecycle ordering. The 520 ms music cadence and historical migration remain compatibility behavior.
- **Power Hint:** do not re-wrap combat-end behavior merely to remove passive observation; require an already-existing deterministic lifecycle that preserves campaign-death recovery.
- **Boot wave synchronization:** require an explicit deterministic wave-transition lifecycle plus death/recovery coverage before removing the remaining DOM-driven observation path.

## L3 subsystem consolidation

Stable consolidated ownership includes BottomNav, Home, Accomplishments UI/claims/migrations, Tree rendering/mastery/presentation boundaries, reward-notification base styling, and the documented Forge presentation split.

### Tree

PRs #213/#214 removed V82's duplicate renderer, renderer helpers, injected presentation CSS and renderer-only angle metadata. PR #216 moved mastery-key raw-save restoration into V82. PR #219 moved the historical `window.__srTreeAudit` diagnostic into V82, leaving V83 inert. PR #226 then completed V83 source retirement after its staged unload/integration proof.

PR #230 rebuilt the V247 consolidation from fresh `main`, folded the presentation-only V247/V250 spectacle CSS into canonical `tree-dedicated-v116.js`, unloaded V247 from `index.html`, and passed the moving smoke ratchet plus the full Chromium/WebKit regression gate. PR #232 subsequently passed the same full gate on top of that mainline, providing the required post-unload integration proof for staged L5 source retirement.

Current Tree boundaries are therefore:

- `personal-tree-radial-v82.js` — topology, mastery-key construction/acquisition, deprecated-key compatibility, raw-save mastery restoration and the historical audit API;
- `tree-dedicated-v116.js` — canonical Tree rendering, clearer gold-node labels and V247/V250 spectacle presentation;
- `runtime-tree-stability-v216.js` — live mastery gating and popup synchronization;
- V83 — retired from runtime and source;
- V247 — retired from runtime; its obsolete source is now eligible for deletion after subsequent integration proof.

### Accomplishments / navigation

PR #222 moved the remaining historical Accomplishments progress normalization (`raidWins`, `fusedPetRank`, `v121Migrated`) from V121 into the durable V127 boot/import migration owner. V121 remains event-compatibility-only for raid-result and fusion progression tracking; V139/V140 remain canonical UI/claim owners.

PR #231 consolidated permanent navigation and action hierarchy on current `main`: BottomNav owns the permanent `Accueil / Équipement / Progression / Menu` taxonomy and duplicate-free Progression/Menu hubs, Home suppresses redundant permanent shortcuts, and V139 now owns the Accomplishments entry under Progression rather than Settings. No save, balance or progression semantics changed.

Do not collapse V121 into payout/UI owners merely to reduce file count. Reassess only if an evidence-backed event-lifecycle consolidation produces a clearer durable owner without changing progression semantics.

## Visual ownership

PR #232 completed the requested arcade-clean visual pass in existing canonical `premium-ui-v209.js`: flatter/quieter cards, restrained tactile controls, semantic CTA hierarchy, quieter HUD/navigation presentation and simpler interaction feedback while retaining the dark-navy/burnished-gold RPG identity. This was visual-only and introduced no new runtime owner or patch layer.

Future visual work should extend existing canonical owners and should be driven by concrete visual inconsistencies rather than adding versioned overlay files.

## L4 shared-utility disposition

The Social message-store policy transfer remains the validated L4 production consolidation. Formatting, escaping and lifecycle-scheduling helpers remain local where their semantics differ or a shared abstraction would increase coupling. Retaining intentionally different helpers is a valid L4 outcome.

## L5 source retirement

There is no standing L1-derived deletion queue. New source retirement begins only after a later L2/L3 transfer survives integration or a fresh audit proves a source obsolete.

- `tree-safety-v83.js` completed staged L5 retirement under PR #226 and is absent from source.
- `personal-tree-spectacle-v247.js` is the current staged L5 candidate: it has been unloaded since #230, canonical presentation lives in V116, and #232 supplied subsequent full-gate integration proof. Its source can now be deleted with the retirement contract updated to require absence.

## Current concurrent-work constraints

Open work at this refresh:

- **PR #233** changes Weekly Mega gameplay/rewards in `weekly-mega-v71.js` and related tests.

Lean Code must not touch Weekly Mega gameplay/reward semantics while #233 is active. The current Tree V247 source-retirement batch is disjoint: V247 is already unloaded, its canonical presentation owner is V116, and neither file/responsibility intersects #233.

No current open PR owns Forge/equipment/progression or the Tree loader/owners at this refresh, but those areas remain feature-sensitive and must always be rechecked from latest `main` before a new batch.

## Remaining Lean Code work

| Phase / responsibility | Current evidence | Next reviewable scope / exit condition |
| --- | --- | --- |
| L2 Accomplishments lifecycle | Timer/observer cleanup and durable migration separation are complete through #222. | Reassess only if a concrete duplicate wrapper/event seam appears with save/lifecycle proof. |
| L2 Secondary HUD lifecycle | Complete under PRs #155/#171. | No current scope; preserve contracts. |
| L2 Power Hint lifecycle | Campaign-death recovery is deterministic; current owner must remain passive. | Require an existing deterministic combat lifecycle; do not re-wrap `handleCombatEnd`. |
| L2 Audio | Migration/reward/edge semantics are locked; 50 ms combat observer remains. | Remove only when an existing canonical combat owner exposes equivalent attack/skill/result events and ordering. |
| L2 Boot wave observation | DOM-driven synchronization still supplies live wave presentation. | Require explicit deterministic wave-transition lifecycle plus wave/death recovery coverage. |
| L3 Tree topology/compatibility | V82/V116/V216 now own topology/compatibility, renderer/presentation and live mastery respectively. | Preserve these durable boundaries. |
| L3 Tree V83 | Runtime unload and source retirement complete. | No current scope; keep retired-owner contracts. |
| L3 Tree V247 presentation | V247/V250 presentation is in V116 and V247 is unloaded under #230. | Complete staged L5 source deletion after post-unload proof; preserve V116 presentation contract. |
| L3 Forge/progression | No open owner at this refresh, but area remains feature-sensitive. | Re-audit from latest main before any consolidation; require a narrow, proven ownership seam. |
| L4 shared helpers | Social store transfer complete; other audited helpers intentionally differ. | Reopen only for genuinely identical semantics with measurable reduction and no new coupling. |
| L5 staged source retirement | V83 complete; V247 now has post-unload integration proof. | Retire V247 source, then rescan for a newly eligible staged candidate. |

## Next-step rule

Select each new batch from fresh `main` in this order:

1. finish a staged unload/source retirement when canonical ownership and subsequent integration proof are already present;
2. prefer a newly discovered neutral UI/lifecycle/helper candidate only when the surviving owner/hook is deterministic and behavior-equivalent;
3. keep Power Hint, Boot wave and Audio deferred until their required deterministic lifecycle evidence exists;
4. re-audit Forge/equipment/progression from latest `main` before touching that feature-sensitive surface;
5. avoid Weekly Mega gameplay/rewards while #233 is active;
6. if no production transfer is evidence-safe, synchronize ownership/roadmap documentation rather than forcing a weaker architecture.

## Phase status

- **L0 — COMPLETE**
- **L1 — COMPLETE**
- **L2 — IN PROGRESS**
- **L3 — IN PROGRESS**
- **L4 — IN PROGRESS** — one validated production transfer; retained-local decisions are valid outcomes
- **L5 — IN PROGRESS** — staged retirements only; V247 is the current evidence-ready candidate

Every production/runtime batch continues to follow `AGENTS.md`: fresh-main start, coherent scoped implementation, focused preflight, one meaningful publication state, exact-head CI, latest-main intersection check, exact-head merge and post-merge verification. Documentation-only corrections use the documented fast path and do not incur artificial browser CI.
