# Lean-code remaining-work audit

Audit refreshed: 2026-09-15. Current refresh base: `1b0c0f166419e57b38f059361ff90fb5025b2219` (latest `main`, V339 campaign gold compensation loader state).

This file records the current remaining-work disposition after the proof-based L1 audit and subsequent L2/L3/L4/L5 passes. **L1 is complete.** L2, L3, L4 and staged L5 remain evidence-driven.

## Verified runtime baseline

`RUNTIME_INVENTORY.md` remains authoritative. The default non-Social session loads **103 first-party JavaScript files**. Future removals require a fresh reachability audit or a proven L2/L3 ownership transfer.

## L2 lifecycle consolidation

Completed lifecycle work includes Accomplishments deterministic reserve synchronization, Weekly Mega panel-poller removal, Social launcher lifecycle transfer, V83 modal/campaign observer retirement, Secondary HUD observer/wrapper retirement, and the Audio V26 migration/reward/edge proof sequence.

The remaining evidence-gated lifecycle areas are unchanged:

- **Audio V26:** retain the 50 ms combat observer until an existing canonical combat owner exposes equivalent attack/skill/result lifecycle ordering.
- **Power Hint:** require an already-existing deterministic combat lifecycle that preserves campaign-death recovery before removing passive observation.
- **Boot wave synchronization:** require an explicit deterministic wave-transition lifecycle plus death/recovery coverage before removing the remaining DOM-driven observation path.

The V331/V332 Progression Pass presentation changes and the current V339 campaign-gold compensation loader state do not add the missing combat/wave lifecycle evidence and therefore do not unblock any of these removals.

## L3 subsystem consolidation

Stable consolidated ownership includes BottomNav, Home, Accomplishments, Tree, reward notifications and the documented Forge presentation split.

### Familiar rates

PR #269 completed the Familiar rate-policy consolidation. `familiar-ancestral-rate-v296.js` is now the single durable Familiar `getRates()` policy owner: it preserves valid pre-max tables, repairs invalid tables when necessary, keeps Ancestral at 0% before max mastery, and applies exactly 5% direct Ancestral summons at max mastery. The competing Familiar rate wrappers were removed from V295 and V307. V307 retains only its distinct hatch timer, invalid egg guard, generic rarity-roll fallback, Tree diagnostic and QA snapshot responsibilities.

This transfer does **not** create an L5 retirement candidate: V295 and V307 still own distinct live responsibilities.

### Forge/progression

PR #245 settled the Forge rarity/progression surface on `main`. The durable split is:

- `game-balance-v224.js` owns Forge rarity-rate progression and star-aware rarity availability;
- `progression-stability-authority-v304.js` owns Forge Ascension availability/preview plus the stable progression multipliers and Raid/Dust stability rules;
- later Forge presentation owners remain presentation-only and should not acquire rate/economy authority.

The approved Forge behavior is explicit: 0★ ends at Artefact; stars 1–4 unlock Légendaire, Infernal, Immortel and Divin; Forge power reaches ×2 at the first star and later stars unlock rarity access rather than adding hidden power.

A fresh ownership scan after #245 found no second Forge `getRates()` policy wrapper that can be safely deleted immediately. Do not force V224 and V304 together: their responsibilities are rate/equipment balance versus cross-system Ascension/progression stability.

### Tree

Tree boundaries remain stable: V82 owns topology/compatibility/raw-save restoration/audit, V116 owns rendering/presentation, and V216 owns live mastery gating/popup synchronization. V83 and V247 remain retired.

## L4 shared-utility disposition

The Social message-store policy transfer remains the validated L4 production consolidation. Formatting, escaping and lifecycle-scheduling helpers remain local where semantics differ or a shared abstraction would increase coupling. Retaining intentionally different helpers is a valid L4 outcome.

No new identical-semantics helper with a measurable net reduction was exposed by the latest presentation/balance changes.

## L5 source retirement

V83 and V247 remain fully retired. The Familiar consolidation does not make V295/V307 obsolete, and the Forge settlement does not make V224/V304 obsolete. There is therefore no new evidence-ready source deletion from these transfers.

## Current concurrent-work constraints

Current open work includes multiple hero-equipment/combat-presentation branches, including #288 and #289, both modifying canonical `combat-animation-v169.js` and related loader/test surfaces. Do not use that owner as a Lean Code lifecycle consolidation vehicle while those branches remain active. Their equipment-rendering work is presentation-only and does not by itself provide the deterministic attack/skill/result lifecycle required to retire Audio V26 observation.

Other open feature work must likewise be treated as owner-sensitive when it intersects Familiar, onboarding, campaign/progression, combat, loaders, or save/economy responsibilities. Re-fetch current `main` and the relevant open PR immediately before selecting or merging any such batch.

V339 on `main` updates campaign gold compensation loading. It does not create a proven Lean Code retirement/lifecycle candidate by itself. No additional visual cleanup is justified without a concrete inconsistency; avoid cosmetic churn while active combat-equipment presentation work is already in flight.

## Remaining Lean Code work

| Phase / responsibility | Current evidence | Next reviewable scope / exit condition |
| --- | --- | --- |
| L2 Power Hint lifecycle | Current owner must remain passive. | Require deterministic combat lifecycle preserving campaign-death recovery. |
| L2 Audio | Edge semantics are locked; 50 ms observer remains. | Remove only when canonical combat exposes equivalent attack/skill/result ordering. |
| L2 Boot wave observation | DOM synchronization still supplies live wave presentation. | Require explicit wave-transition lifecycle plus death/recovery coverage. |
| L3 Familiar rates | Consolidated in V296 under #269. | Preserve single rate owner; V295/V307 remain for distinct responsibilities; avoid active overlapping Familiar work. |
| L3 Forge/progression | #245 settled rarity/Ascension ownership in V224/V304. | Reopen only for a concrete duplicate authority seam; do not collapse distinct rate and progression owners. |
| L3 Tree | Durable V82/V116/V216 boundaries; V83/V247 retired. | Preserve boundaries. |
| L4 shared helpers | Social transfer complete; other audited helpers intentionally differ. | Reopen only for genuinely identical semantics with measurable reduction. |
| L5 staged retirement | V83/V247 complete; no new candidate from Familiar/Forge transfers. | Rescan after the next proven ownership transfer. |

## Next-step rule

Select each new batch from fresh `main` in this order:

1. finish a staged unload/source retirement when canonical ownership and integration proof already exist;
2. prefer a newly discovered lifecycle/helper/authority seam only when the surviving owner is deterministic and behavior-equivalent;
3. keep Power Hint, Boot wave and Audio deferred until their deterministic lifecycle evidence exists;
4. reconcile active feature branches independently, then re-audit their settled owners;
5. if no production transfer is evidence-safe, update ownership documentation rather than manufacturing a deletion.

## Phase status

- **L0 — COMPLETE**
- **L1 — COMPLETE**
- **L2 — IN PROGRESS / evidence-gated**
- **L3 — ADVANCED; Familiar rates and Forge progression consolidated**
- **L4 — ADVANCED; targeted transfers only**
- **L5 — ADVANCED; staged retirements only**
