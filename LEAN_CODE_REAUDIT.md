# Lean-code remaining-work audit

Audit date: 2026-09-12. L1 closure base: `231a8c81aa70f00f37cb66c9a7b1ffe2145a2733` (PR #151 merged). L2 ledger refreshed through merged PRs #153, #154, #155, #158, #161, #163, #164, #166 and #168.

This file records the disposition after the proof-based L1 source audit and the subsequent L2 lifecycle passes. **L1 is complete.** L2, L3, L4 and staged L5 work remain open.

## Verified runtime baseline

The default non-Social session remains **110 first-party JavaScript files**:

- 93 static loader entries;
- 7 deferred core entries;
- 10 scripts loaded transitively by `familiars-noscr-v231.js`.

Social raises the first-party count to 112 and Social + Bot Testers to 114. Optional third-party Social modules remain outside those totals.

The final L1 source retirements did not reduce this runtime count because those sources were already absent from all normal/deferred/conditional/transitive loader paths before deletion. The L2 lifecycle cleanups and proof work through PRs #153/#154/#155/#158/#161/#163/#164/#166/#168 also do not change the runtime file count; they remove redundant timers/observers, contract-lock responsibilities and complete scoped transfers inside still-required modules. The loader inventory in `RUNTIME_INVENTORY.md` remains the authoritative loaded-file list.

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

## L2 lifecycle consolidation completed after L1 closure

The post-L1 passes continued the same evidence-first rule: remove only lifecycle machinery whose behavior is covered by a deterministic surviving hook.

- **PR #154 — Weekly Mega:** removed the permanent 1.2-second panel injection poller. The panel now follows canonical `sr:bottomnavrendered` and defers injection one animation frame because BottomNav publishes before core `render()` commits the new `#screen`. The separate 60-second weekly reward-grant cadence remains unchanged.
- **PR #155 — Secondary HUD:** removed the modal-state `MutationObserver` and consumes canonical `sr:modal-state` instead. The existing HUD render wrapper remains; the PR did not broaden into a second ownership transfer.
- **PR #158 — Social:** removed both the permanent 1-second launcher remount poller and the `#screen` `MutationObserver`. A single deferred `sr:bottomnavrendered` callback now runs `mountButton()` + `dockSocialUI()`. Startup, resize/orientation docking, the 15-second remote/bot cadence and the 800-ms arena-result cadence remain unchanged.
- **PR #153 — Sanctuary reserve rendering:** replaced V126's zero-delay reserve mount after `scrSanctuaire()` with `queueMicrotask(mountReserve)`. The focused contract proves initial entry, refill-to-board, rerender idempotency and post-render rarity normalization.
- **PR #161 — Accomplishments legacy migration synchronization:** removed V126's remaining 50 ms startup migration timer. Fresh boot now consumes the already-synchronous V127 compensation deterministically, while imported saves synchronize through the existing `migrate(...)` chain before the imported state becomes global. The focused Chromium/WebKit contract locks legacy pending-piece conservation, marker clearing and exact 50-piece board/reserve conservation across both fresh boot and import.
- **PR #163 — V83 responsibility contract:** locked the four responsibilities previously coalesced around the V83 `#app` observer before attempting further cleanup: overlay persistence tagging, `sr:modal-state` publication, queued-modal draining and campaign compact tagging.
- **PR #164 — V83 campaign lifecycle split:** moved campaign compact tagging off the broad `#app` observer and onto canonical `sr:bottomnavrendered` with one-frame deferral after the core screen commit. The observer now remains only for modal responsibilities. Chromium/WebKit coverage locks Home → Equipment → Home and the existing modal queue/state behavior.
- **PR #166 — V83 observerless modal proof:** booted the real game with only the remaining V83 `#app` observer removed in-memory. Chromium/WebKit coverage proves overlay persistence tagging, canonical `sr:modal-state` publication, FIFO queued-modal draining and Home → Equipment → Home behavior before the production block is retired.
- **PR #168 — V83 production observer retirement:** removed the remaining broad `#app` observer without adding a replacement wrapper, timer or observer. Guarded `openModal`/`closeModal` transitions and startup synchronization retain modal tagging, state publication and queue draining; the observerless proof now runs against production source and a static ownership contract protects the native overlay owner among directly loaded scripts.

These changes reduce active polling/observation work without changing runtime file count, gameplay values, saves or balance.

## Remaining Lean Code work

| Phase / responsibility | Current evidence | Next reviewable scope / exit condition |
| --- | --- | --- |
| L2 Accomplishments lifecycle | V126's zero-delay Sanctuary mount and 50 ms migration synchronization are both removed under PRs #153/#161. V127 remains the durable historical reward-migration owner and V140 remains the future claim payout owner. | Do not force further consolidation merely to reduce files. Reassess only if a concrete duplicate wrapper/timer or ownership seam is found with equivalent old-save and lifecycle proof. |
| L2 Power Hint lifecycle | Earlier polling cleanup was corrected after campaign-death lifecycle interference; current owner must remain passive with respect to canonical combat-end recovery. PR #157 merged deterministic campaign-death recovery. | Reassess only from fresh `main`. Do not re-wrap `handleCombatEnd`; any future lifecycle change must preserve the merged campaign-death/checkpoint regression suite and requires a deterministic combat lifecycle hook. |
| L2 audio | V26 polls combat at 50 ms, runs a 520 ms music cadence after unlock, and also contains historical PE/save compatibility behavior. | Separate audio observation from migration/economy responsibilities with legacy-save contracts before changing lifecycle ownership. Do not treat the combat poller as an isolated UI timer. |
| L2 central modal observer | COMPLETE under PR #168. The broad `#app` observer is absent; guarded modal transitions and startup synchronization own overlay tagging, `sr:modal-state` publication and FIFO queue draining, while campaign compact tagging remains on `sr:bottomnavrendered`. | No current V83 observer scope remains. Preserve the #163/#164/#166/#168 contracts and reassess only if a concrete new ownership seam or direct overlay mutation appears. |
| L2 Boot wave observer | V115 retains a child-list observer for live campaign wave presentation after its permanent poller was removed. | Require an explicit deterministic wave-transition lifecycle hook plus exact wave-transition and campaign-death recovery coverage before any observer removal. |
| L3 durable domain owners | Home/BottomNav are consolidated; Accomplishments deliberately separates state/events, historical migrations, modal rendering and future payout responsibilities. Forge presentation ownership is explicit between V266 panel rendering and V273 loot UX. | Consolidate only when module boundaries reduce coupling; keep future claims separate from old-save compensation. Feature-sensitive Forge/Familiars/combat work requires a fresh owner check. |
| L4 escaping helpers | Base, Tree and Forge escaping helpers have different null/apostrophe semantics. | Specify input/output and HTML-context semantics first; preserve intentional differences with adapters or retain local helpers. |
| L4 number formatting | Base and Forge formatters differ in suffix, rounding and locale behavior. | Establish golden input/output cases before adopting any shared formatter. |
| L5 staged source retirement | The L1-derived retirement queue is exhausted. | New L5 candidates arise only after later L2/L3 ownership transfers have survived integration, or after a fresh source-reference audit identifies new obsolete source. |

## L2 next-step rule

The Accomplishments V126 timer work is complete under merged PRs #153 and #161, and V83's broad observer cleanup is complete through #168. The next safe scope should be selected from fresh `main` using this order:

1. prefer another newly discovered neutral UI lifecycle candidate when its replacement hook is deterministic and behavior-equivalent;
2. Power Hint and Boot wave lifecycle work may be reassessed, but remain combat-sensitive and must preserve deterministic campaign-death/checkpoint recovery; do not manufacture a replacement hook by re-wrapping canonical combat functions;
3. keep the audio combat poller deferred until its save/migration/economy responsibilities are separated and covered;
4. if no production transfer is evidence-safe, keep ownership/roadmap documentation current rather than forcing a cleanup whose replacement lifecycle is weaker than the code being removed.

## Phase status after this audit refresh

- **L0 — COMPLETE**
- **L1 — COMPLETE**
- **L2 — IN PROGRESS** — additional post-L1 lifecycle cleanups and the completed V83 observer retirement merged through PRs #153/#154/#155/#158/#161/#163/#164/#166/#168
- **L3 — IN PROGRESS**
- **L4 — INVESTIGATION STARTED**
- **L5 — IN PROGRESS (staged retirements only; no current L1-derived queue)**

Every production scope continues to follow `AGENTS.md`: coherent local implementation, one meaningful preflight, no 10–30 second micro-polling, exact-head CI, fresh `main` intersection check, merge, then post-merge verification.
