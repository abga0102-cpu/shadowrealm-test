# Lean-code remaining-work audit

Audit refreshed: 2026-09-13. L1 closure base: `231a8c81aa70f00f37cb66c9a7b1ffe2145a2733` (PR #151 merged). Current refresh base: `dd73f29902fe45a061adf7f4bee07247aad684cc` (PR #209 merged).

This file records the current remaining-work disposition after the proof-based L1 audit and subsequent L2/L3/L4/L5 passes. **L1 is complete.** L2, L3, L4 and staged L5 remain open and evidence-driven.

## Verified runtime baseline

`RUNTIME_INVENTORY.md` is authoritative. The current default non-Social session loads **105 first-party JavaScript files**:

- 88 static loader entries;
- 7 deferred core entries;
- 10 scripts loaded transitively by `familiars-noscr-v231.js`.

Index-managed subtotal: **95** files. Social raises the first-party total to **107** and Social + Bot Testers to **109**. Optional third-party Social modules remain outside those totals.

The previous 110-file prose baseline was stale. The reduction to 105 came from subsequent validated unloads after the L1 closure snapshot, including BottomNav/Home/Accomplishments/Tree cleanup already reflected in the runtime inventory plus later retirement of the Hero Equipment bridge, notification V105, superseded Dust chance layers V292/V300, Familiar stock V274, Familiar QA V230 and Familiar renderer V229. Source deletion by itself does not change the runtime count when a file was already unloaded.

## L1 closure

The original source-reference investigation was corrected after discovering that ten scripts loaded transitively by `familiars-noscr-v231.js` were active dependencies rather than retirement candidates. The corrected queue was reduced through subsystem-specific ownership proof until no candidate remained.

Final closure highlights include Forge/equipment historical chains, Familiar V232 pagination, import V298, progression-coherence V304 and equipment refund V238. Later proof-based unload/source-retirement work created new L5 candidates without reopening the completed L1 queue.

**Remaining L1 investigation candidates: 0.**

L1 completion means every currently loaded script has an explicit active/compatibility/migration reason to remain, while previously queued unloaded candidates received a proof-based disposition. Future removals require a fresh reachability audit or a later L2/L3 ownership transfer.

## L2 lifecycle consolidation

Completed lifecycle work includes:

- Accomplishments V126 deterministic Sanctuary reserve rendering and removal of its 50 ms startup migration synchronization;
- Weekly Mega removal of the permanent 1.2-second panel poller while preserving its separate 60-second reward cadence;
- Social removal of its launcher remount poller and screen observer in favor of canonical BottomNav lifecycle events;
- V83 campaign/modal lifecycle decomposition followed by retirement of the broad `#app` observer;
- Secondary HUD retirement of both its modal observer and `renderHUD` wrapper;
- Audio V26 proof sequence: PR #187 locked historical V5/V6 PE migration, PR #188 removed the obsolete Evolution reward wrapper, and PR #189 locked attack/skill/result observation edges.

The Audio 50 ms observer remains intentionally loaded. `combat-consolidated-v156.js` still publishes no deterministic attack/skill/result lifecycle with equivalent ordering. Replacing the observer now would require manufacturing a new wrapper/hook, which is weaker than the current evidence-backed design. The 520 ms music cadence and historical V6 migration remain in place as well.

Power Hint and Boot wave behavior also remain evidence-gated because they intersect campaign death/recovery and combat progression. Any future lifecycle transfer must preserve the existing campaign-death/checkpoint contracts and must use an already-existing deterministic lifecycle rather than wrapping combat functions simply to remove polling/observation.

## L3 subsystem consolidation

Stable ownership already consolidated includes:

- BottomNav decoration/geometry/render lifecycle in `bottom-nav-layout-v183.js`;
- Home geometry/render lifecycle/compatibility decoration in `home-layout-authority-v219.js`;
- Accomplishments modal/title rendering in V139, future claims in V140 and historical reward migration in V127;
- Tree dedicated rendering and clearer gold-node labels in V116;
- reward notification base styling in `style.css`;
- Forge presentation split explicitly between V266 panel/batch owners and V273 loot UX.

Do not collapse durable boundaries merely to reduce file count. In particular, keep future Accomplishments payouts separate from old-save compensation and avoid Forge/Familiar/combat ownership transfers while active feature work is changing the same owners.

## L4 shared-utility disposition

The first validated production transfer remains the Social message-store policy under PR #180: `social-v1.js` owns the storage key, retention, malformed-read fallback and capped serialization, while P2P/Bot consumers reuse that contract.

Formatting, escaping and lifecycle scheduling helpers remain local where their semantics differ or a shared abstraction would add coupling. Tutorial timing, Boot wave scheduling, Secondary HUD synchronization and Weekly Mega scheduling were rechecked and still do not justify a generic utility layer.

## L5 source retirement

L5 remains staged and evidence-driven. Subsequent post-L1 retirements include the already-documented Accomplishments/Tree/Home/BottomNav histories, Hero Equipment V1, notification V105, superseded Dust V292/V300, Familiar V274, Familiar QA V230 and Familiar renderer V229.

There is no standing L1-derived deletion queue. New L5 work begins only after a later ownership transfer survives integration or a fresh audit proves a source obsolete.

## Current concurrent-work constraints

At this refresh, open PRs #204 and #205 own Forge/progression behavior. Their active surface includes progression owners and, for #204, `index.html`. Lean Code work must not overlap those owners/loaders until the intersecting feature work resolves or is explicitly coordinated.

PR #210 is a test-only Tree spectacle ownership proof for `personal-tree-spectacle-v247.js`. Its exact head `f40c7f541a6f556fe8733080aff425bf68dc7ded` passed the moving smoke ratchet on both attempts but failed two different WebKit tests because the `Combat automatique` tutorial overlay remained active. The single unchanged exact-head retry allowed by `AGENTS.md` has therefore been consumed. No production or test weakening is justified from that evidence, so #210 remains intentionally unmerged.

The proposed V247 production consolidation stays deferred while #204 owns the loader. A later run may reassess folding V247's presentation-only CSS into the canonical Tree owner and removing the script request, but only after the loader intersection is gone and the ownership proof can pass its required validation path.

## Remaining Lean Code work

| Phase / responsibility | Current evidence | Next reviewable scope / exit condition |
| --- | --- | --- |
| L2 Accomplishments lifecycle | Current timer/observer cleanup is complete; V127/V139/V140 boundaries are deliberate. | Reassess only if a concrete duplicate wrapper/timer or ownership seam appears with old-save/lifecycle proof. |
| L2 Secondary HUD lifecycle | Complete under PRs #155/#171. | No current scope; preserve contracts. |
| L2 Power Hint lifecycle | Campaign-death recovery is deterministic; the owner must remain passive with respect to canonical combat-end recovery. | Require an existing deterministic combat lifecycle; do not re-wrap `handleCombatEnd`. |
| L2 Audio | Migration/reward/edge semantics are contract-locked; 50 ms combat observer remains. | Remove only when an existing canonical combat owner exposes equivalent attack/skill/result events and ordering. |
| L2 Boot wave observer | Child-list observation still supplies live wave presentation. | Require explicit deterministic wave-transition lifecycle plus wave/death recovery coverage. |
| L3 Tree presentation | V247 is presentation-only and has a proof PR, but loader removal intersects active #204. | Reassess after #204 resolves; then require focused ownership proof plus the production runtime gate. |
| L3 Forge/progression | Active PRs #204/#205 own this surface. | Defer until feature work settles, then refresh ownership from latest `main`. |
| L4 shared helpers | Social store transfer is complete; other audited helpers intentionally differ. | Reopen only for a genuinely identical helper family with measurable reduction and no new coupling. |
| L5 staged source retirement | Recent staged retirements are reflected in `ARCHITECTURE.md` / `RUNTIME_INVENTORY.md`. | New candidates only after later L2/L3 transfers or a fresh reachability audit. |

## Next-step rule

Select each new batch from fresh `main` in this order:

1. prefer a newly discovered neutral UI/lifecycle/helper candidate only when the surviving owner/hook is deterministic and behavior-equivalent;
2. if a staged unload/source retirement has already passed integration proof, finish that retirement without crossing an active feature owner;
3. keep Power Hint, Boot wave and Audio deferred until their required deterministic lifecycle evidence exists;
4. keep V247 loader consolidation deferred while #204 owns the intersecting loader surface;
5. if no production transfer is evidence-safe, keep the ownership/roadmap documentation synchronized with the authoritative runtime inventory instead of forcing a weaker architecture.

## Phase status

- **L0 — COMPLETE**
- **L1 — COMPLETE**
- **L2 — IN PROGRESS**
- **L3 — IN PROGRESS**
- **L4 — IN PROGRESS** — one validated production transfer; retained-local decisions are valid outcomes
- **L5 — IN PROGRESS** — staged retirements only; no standing L1 queue

Every production/runtime batch continues to follow `AGENTS.md`: fresh-main start, coherent scoped implementation, focused preflight, one meaningful publication state, exact-head CI, latest-main intersection check, exact-head merge and post-merge verification. Documentation-only corrections use the documented fast path and do not incur artificial browser CI.
