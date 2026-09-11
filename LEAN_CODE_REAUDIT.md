# Lean-code remaining-work audit

Audit date: 2026-09-11. L1 closure base: `231a8c81aa70f00f37cb66c9a7b1ffe2145a2733` (PR #151 merged).

This file records the disposition after the proof-based L1 source audit. **L1 is complete.** L2, L3, L4 and staged L5 work remain open.

## Verified runtime baseline

The default non-Social session remains **110 first-party JavaScript files**:

- 93 static loader entries;
- 7 deferred core entries;
- 10 scripts loaded transitively by `familiars-noscr-v231.js`.

Social raises the first-party count to 112 and Social + Bot Testers to 114. Optional third-party Social modules remain outside those totals.

The final L1 source retirements did not reduce this runtime count because those sources were already absent from all normal/deferred/conditional/transitive loader paths before deletion. The loader inventory in `RUNTIME_INVENTORY.md` remains the authoritative loaded-file list.

## L1 closure

The original root-source investigation was corrected after discovering that ten scripts loaded transitively by `familiars-noscr-v231.js` were active dependencies rather than retirement candidates. The corrected queue was then reduced through staged, subsystem-specific ownership proof until no candidate remained.

Final closure sequence:

- PR #138: Hero Equipment V1 and notification V105 source retirement after integration proof;
- PR #140: Forge auto-batch history V254/V258/V260/V261 retired; loaded V266 remains canonical;
- PR #141: Rebirth V220 retired; loaded V221 remains the scroll-preservation owner;
- PR #142: Forge panel/entry-animation history V259/V260/V261/V263/V264 retired; V266/V273 remain canonical;
- PR #143: later Forge UX history V261/V266/V268/V269/V270/V271/V272 retired; loaded V273 remains event-driven loot authority;
- subsequent early Forge loot-UX retirement removed V252/V253/V258 after V273 + batch-gate V266 replacement proof;
- PR #146: Forge V148 power-feedback history retired;
- PR #147: Forge V112/V135 UI-action history retired;
- PR #148: Familiar V232 pagination history retired after integrated V234 runtime ownership was proven;
- PR #149: import progression V298 retired after corrected V299 imported-state normalization was behavior-locked;
- PR #150: historical progression-coherence V304 retired after its responsibilities were proven split between progression-stability V304 and progression-integration V305;
- PR #151: equipment dust-refund V238 retired after loaded V239 was proven to reconstruct legacy successful investment and own the current 50% normal / 100% infused refund model independently.

### Final candidate disposition

| Family | Final historical candidate | Surviving proof | Status |
| --- | --- | --- | --- |
| Forge / equipment | V112/V135 UI history | loaded V145/V266/V273 ownership contracts | RETIRED |
| Forge / equipment | V148 power feedback | current Forge power/presentation owners | RETIRED |
| Forge / equipment | V238 dust refund | loaded V239 reconstructs investment and owns refund/catalyst behavior | RETIRED |
| Familiars | V232 pagination | loaded V234 integrated pagination owner | RETIRED |
| Progression / import | V298 import authority | loaded V299 uses imported-state Forge stars and deterministic normalization | RETIRED |
| Progression / import | coherence V304 | stability V304 owns multipliers; V305 owns state-aware Familiar helper | RETIRED |

**Remaining L1 investigation candidates: 0.**

L1 completion means every script still requested in the current runtime inventory has an explicit active/compatibility/migration reason to remain loaded, while every unloaded root-level candidate from the corrected audit has received a proof-based disposition. It does not mean no source can ever become obsolete again; future removals require a fresh audit or a later ownership transfer.

## Remaining Lean Code work

| Phase / responsibility | Current evidence | Next reviewable scope / exit condition |
| --- | --- | --- |
| L2 Sanctuary reserve rendering | V126 retains a zero-delay `mountReserve` after `scrSanctuaire` returns HTML. | Prove a deterministic post-DOM-commit lifecycle covers initial entry, refill and rerender. Calling the mount directly before returned HTML is committed is not equivalent. |
| L2 Accomplishments migration startup | V126 retains a 50 ms startup synchronization; V127/V140 retain later compensation sequencing. | Lock legacy pending pieces, reward conservation and fresh-boot/import ordering before removing another delay. |
| L2 Power Hint lifecycle | Earlier polling cleanup was corrected after campaign-death lifecycle interference; current owner must remain passive with respect to canonical combat-end recovery. | Do not re-wrap `handleCombatEnd`; preserve campaign death/checkpoint regression coverage for any future Power Hint lifecycle change. |
| L2 audio | V26 polls combat at 50 ms, runs a 520 ms music cadence after unlock, and also contains historical PE/save compatibility behavior. | Separate audio observation from migration/economy responsibilities with legacy-save contracts before changing lifecycle ownership. |
| L3 durable domain owners | Home/BottomNav are consolidated; Accomplishments still separates state/events, migration, reserve, modal and payout responsibilities. Forge presentation ownership is explicit between V266 panel rendering and V273 loot UX. | Consolidate only when module boundaries reduce coupling; keep future claims separate from old-save compensation. Feature-sensitive Forge/Familiars/combat work requires a fresh owner check. |
| L4 escaping helpers | Base, Tree and Forge escaping helpers have different null/apostrophe semantics. | Specify input/output and HTML-context semantics first; preserve intentional differences with adapters or retain local helpers. |
| L4 number formatting | Base and Forge formatters differ in suffix, rounding and locale behavior. | Establish golden input/output cases before adopting any shared formatter. |
| L5 staged source retirement | The L1-derived retirement queue is exhausted. | New L5 candidates arise only after later L2/L3 ownership transfers have survived integration, or after a fresh source-reference audit identifies new obsolete source. |

## L2 recommended starting point

The preferred next production scope is **Sanctuary reserve rendering**. It is narrower than audio and less migration-sensitive than the remaining Accomplishments startup sequencing. The work should:

1. identify the exact DOM-commit/rerender lifecycle available after `scrSanctuaire` output is installed;
2. add behavior coverage for initial Sanctuary entry, reserve refill/state change and rerender;
3. prove the reserve UI mounts once without a zero-delay timing dependency;
4. remove only the redundant timer/lifecycle wrapper, without changing Sanctuary pricing, rarity, save state or merge behavior;
5. pass the exact-head moving smoke ratchet and full Chromium/WebKit gate before merge.

## Phase status after this audit

- **L0 — COMPLETE**
- **L1 — COMPLETE**
- **L2 — IN PROGRESS**
- **L3 — IN PROGRESS**
- **L4 — INVESTIGATION STARTED**
- **L5 — IN PROGRESS (staged retirements only; no current L1-derived queue)**

Every production scope continues to follow `AGENTS.md`: coherent local implementation, one meaningful preflight, no 10–30 second micro-polling, exact-head CI, fresh `main` intersection check, merge, then post-merge verification.
