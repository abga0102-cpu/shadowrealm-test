# Lean-code remaining-work audit

Audit date: 2026-09-12. L1 closure base: `231a8c81aa70f00f37cb66c9a7b1ffe2145a2733` (PR #151 merged). L2 ledger refreshed through merged PRs #153, #154, #155, #158, #161, #163, #164, #166, #168 and #171. L4 ledger refreshed through merged PRs #179 and #180.

This file records the disposition after the proof-based L1 source audit and the subsequent L2/L4 passes. **L1 is complete.** L2, L3, L4 and staged L5 work remain open. L4 now has one validated production ownership transfer; retaining local helpers where consolidation would add coupling or change semantics remains an intentional outcome.

## Verified runtime baseline

The default non-Social session remains **110 first-party JavaScript files**:

- 93 static loader entries;
- 7 deferred core entries;
- 10 scripts loaded transitively by `familiars-noscr-v231.js`.

Social raises the first-party count to 112 and Social + Bot Testers to 114. Optional third-party Social modules remain outside those totals.

The final L1 source retirements did not reduce this runtime count because those sources were already absent from all normal/deferred/conditional/transitive loader paths before deletion. The L2 lifecycle cleanups and proof work through PRs #153/#154/#155/#158/#161/#163/#164/#166/#168/#171 also do not change the runtime file count; they remove redundant timers/observers/wrappers, contract-lock responsibilities and complete scoped transfers inside still-required modules. PR #180 also leaves file count unchanged because it centralizes an existing conditional Social storage policy inside `social-v1.js` rather than adding or removing a runtime module. The loader inventory in `RUNTIME_INVENTORY.md` remains the authoritative loaded-file list.

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
- **PR #155 — Secondary HUD modal lifecycle:** removed the modal-state `MutationObserver` and consumes canonical `sr:modal-state` instead. Its separate `renderHUD` wrapper was intentionally left for a later isolated transfer and has since been retired by PR #171.
- **PR #158 — Social:** removed both the permanent 1-second launcher remount poller and the `#screen` `MutationObserver`. A single deferred `sr:bottomnavrendered` callback now runs `mountButton()` + `dockSocialUI()`. Startup, resize/orientation docking, the 15-second remote/bot cadence and the 800-ms arena-result cadence remain unchanged.
- **PR #153 — Sanctuary reserve rendering:** replaced V126's zero-delay reserve mount after `scrSanctuaire()` with `queueMicrotask(mountReserve)`. The focused contract proves initial entry, refill-to-board, rerender idempotency and post-render rarity normalization.
- **PR #161 — Accomplishments legacy migration synchronization:** removed V126's remaining 50 ms startup migration timer. Fresh boot now consumes the already-synchronous V127 compensation deterministically, while imported saves synchronize through the existing `migrate(...)` chain before the imported state becomes global. The focused Chromium/WebKit contract locks legacy pending-piece conservation, marker clearing and exact 50-piece board/reserve conservation across both fresh boot and import.
- **PR #163 — V83 responsibility contract:** locked the four responsibilities previously coalesced around the V83 `#app` observer before attempting further cleanup: overlay persistence tagging, `sr:modal-state` publication, queued-modal draining and campaign compact tagging.
- **PR #164 — V83 campaign lifecycle split:** moved campaign compact tagging off the broad `#app` observer and onto canonical `sr:bottomnavrendered` with one-frame deferral after the core screen commit. The observer now remains only for modal responsibilities. Chromium/WebKit coverage locks Home → Equipment → Home and the existing modal queue/state behavior.
- **PR #166 — V83 observerless modal proof:** booted the real game with only the remaining V83 `#app` observer removed in-memory. Chromium/WebKit coverage proves overlay persistence tagging, canonical `sr:modal-state` publication, FIFO queued-modal draining and Home → Equipment → Home behavior before the production block is retired.
- **PR #168 — V83 production observer retirement:** removed the remaining broad `#app` observer without adding a replacement wrapper, timer or observer. Guarded `openModal`/`closeModal` transitions and startup synchronization retain modal tagging, state publication and queue draining; the observerless proof now runs against production source and a static ownership contract protects the native overlay owner among directly loaded scripts.
- **PR #171 — Secondary HUD route lifecycle:** removed V279's remaining `renderHUD` wrapper. Route-context synchronization now consumes canonical `sr:bottomnavrendered`, modal-context synchronization remains on canonical `sr:modal-state`, and the existing synchronous startup `sync()` remains. Focused Chromium/WebKit coverage locks Home, modal open/close, secondary-route entry and return Home, with no replacement observer, timer or wrapper.

These changes reduce active polling/observation/wrapper work without changing runtime file count, gameplay values, saves or balance.

## L4 shared-utility disposition after PR #180

L4 now has one production transfer that satisfies the phase criterion and several explicit retained-local decisions.

- **PR #179 — lifecycle scheduling contract:** Home V219 and V83 both use coalesced one-frame scheduling, but sharing their tiny schedulers would add a production utility or cross-owner dependency. Weekly Mega is deliberately non-coalesced and Social uses trigger-specific scheduling. The four contracts remain local and are regression-locked.
- **PR #180 — Social message-store ownership:** `social-v1.js` is the canonical owner of the `shadowreach.social.v1.messages` key, 160-message retention, malformed/non-array read fallback and capped serialization. `social-p2p-v1.js`, `social-bot-testers-v5.js` and `social-bot-ui-v1.js` consume that contract while retaining their owner-specific write/error and same-tab notification behavior. No new utility module or loader dependency was introduced.
- **Formatting and escaping:** Base, Forge and Tree behavior remains intentionally different and is contract-locked in `L4_HELPER_SEMANTICS.md`; no mode-heavy shared abstraction is justified.

A fresh post-#180 neutral-owner scan then rechecked Tutorial V100, Boot V115, Secondary HUD V279 and Weekly Mega V71. It found no second production transfer that meets L4's reduction-without-extra-coupling rule:

- Tutorial's 180/220/300 ms scheduling encodes deliberate modal/tutorial sequencing rather than a generic timeout helper;
- Boot's queued animation-frame work is tied to a campaign-wave DOM observer and remains combat-lifecycle sensitive;
- Secondary HUD already uses direct canonical lifecycle subscriptions plus one local `sync()` and has no meaningful duplicate helper family to extract;
- Weekly Mega's one-frame injection is deliberately non-coalesced, while its remaining timer is the 60-second reward-grant cadence and therefore domain/economy behavior rather than a generic lifecycle utility.

**Current L4 disposition:** keep the Social store transfer, keep the contract-locked local helpers, and do not manufacture a generic utility layer. Reopen a production L4 transfer only when a newly discovered helper family has genuinely identical semantics and an existing natural owner/load-order relationship, or when a broader canonical owner emerges from later L2/L3 consolidation.

## Remaining Lean Code work

| Phase / responsibility | Current evidence | Next reviewable scope / exit condition |
| --- | --- | --- |
| L2 Accomplishments lifecycle | V126's zero-delay Sanctuary mount and 50 ms migration synchronization are both removed under PRs #153/#161. V127 remains the durable historical reward-migration owner and V140 remains the future claim payout owner. | Do not force further consolidation merely to reduce files. Reassess only if a concrete duplicate wrapper/timer or ownership seam is found with equivalent old-save and lifecycle proof. |
| L2 Secondary HUD lifecycle | COMPLETE under PRs #155/#171. V279 has no app observer and no `renderHUD` wrapper; route state follows `sr:bottomnavrendered`, modal state follows `sr:modal-state`, and startup synchronizes directly. | No current V279 lifecycle scope remains. Preserve the focused contract and reassess only if a concrete new ownership seam appears. |
| L2 Power Hint lifecycle | Earlier polling cleanup was corrected after campaign-death lifecycle interference; current owner must remain passive with respect to canonical combat-end recovery. PR #157 merged deterministic campaign-death recovery. | Reassess only from fresh `main`. Do not re-wrap `handleCombatEnd`; any future lifecycle change must preserve the merged campaign-death/checkpoint regression suite and requires a deterministic combat lifecycle hook. |
| L2 audio | V26 polls combat at 50 ms, runs a 520 ms music cadence after unlock, and also contains historical PE/save compatibility behavior. | Separate audio observation from migration/economy responsibilities with legacy-save contracts before changing lifecycle ownership. Do not treat the combat poller as an isolated UI timer. |
| L2 central modal observer | COMPLETE under PR #168. The broad `#app` observer is absent; guarded modal transitions and startup synchronization own overlay tagging, `sr:modal-state` publication and FIFO queue draining, while campaign compact tagging remains on `sr:bottomnavrendered`. | No current V83 observer scope remains. Preserve the #163/#164/#166/#168 contracts and reassess only if a concrete new ownership seam or direct overlay mutation appears. |
| L2 Boot wave observer | V115 retains a child-list observer for live campaign wave presentation after its permanent poller was removed. | Require an explicit deterministic wave-transition lifecycle hook plus exact wave-transition and campaign-death recovery coverage before any observer removal. |
| L3 durable domain owners | Home/BottomNav are consolidated; Accomplishments deliberately separates state/events, historical migrations, modal rendering and future payout responsibilities. Forge presentation ownership is explicit between V266 panel rendering and V273 loot UX. | Consolidate only when module boundaries reduce coupling; keep future claims separate from old-save compensation. Feature-sensitive Forge/Familiars/combat work requires a fresh owner check. |
| L4 Social message store | COMPLETE transfer under PR #180. `social-v1.js` owns key/retention/read/serialization policy; P2P, Bot Testers and Bot UI consume it. | Preserve the ownership contract. Revisit only if Social storage semantics themselves change. |
| L4 escaping / formatting / lifecycle helpers | Golden contracts prove semantic/timing differences or an unfavorable coupling tradeoff. | Retain local helpers. Reassess only when a broader natural owner emerges or a new family has identical semantics without a new runtime dependency. |
| L4 neutral follow-up | Post-#180 scan of Tutorial, Boot, Secondary HUD and Weekly Mega found no second safe transfer. | Do not force a utility layer. Resume only from a concrete new duplicate-helper family with measurable reduction. |
| L5 staged source retirement | The L1-derived retirement queue is exhausted. | New L5 candidates arise only after later L2/L3 ownership transfers have survived integration, or after a fresh source-reference audit identifies new obsolete source. |

## Next-step rule

The Accomplishments V126 timer work is complete under merged PRs #153 and #161, V83's broad observer cleanup is complete through #168, Secondary HUD V279's observer/wrapper cleanup is complete through #171, and the first L4 production transfer is complete under #180. The next safe scope should be selected from fresh `main` using this order:

1. prefer a newly discovered neutral UI/lifecycle/helper candidate only when the surviving hook/owner is deterministic and behavior-equivalent;
2. Power Hint and Boot wave lifecycle work may be reassessed, but remain combat-sensitive and must preserve deterministic campaign-death/checkpoint recovery; do not manufacture a replacement hook by re-wrapping canonical combat functions;
3. keep the audio combat poller deferred until its save/migration/economy responsibilities are separated and covered;
4. if no production transfer is evidence-safe, keep ownership/roadmap documentation current rather than forcing a cleanup whose replacement architecture is weaker than the code being removed.

The fresh post-#180 scan found no second neutral production transfer worth forcing. Tutorial timing is deliberate modal sequencing, Boot remains tied to campaign-wave observation, Secondary HUD is already lifecycle-direct with no meaningful extractable helper, and Weekly Mega's remaining timing is either deliberately non-coalesced rendering or domain reward cadence. Mobile UI remains feature-sensitive across Familiars/Rebirth, while Boss Gate and Runtime Performance cross the combat boundary.

## Phase status after this audit refresh

- **L0 — COMPLETE**
- **L1 — COMPLETE**
- **L2 — IN PROGRESS** — additional post-L1 lifecycle cleanups and the completed V83/Secondary HUD transfers merged through PRs #153/#154/#155/#158/#161/#163/#164/#166/#168/#171
- **L3 — IN PROGRESS**
- **L4 — IN PROGRESS** — first production ownership transfer merged under #180; current neutral follow-up scan has no second safe transfer to force
- **L5 — IN PROGRESS (staged retirements only; no current L1-derived queue)**

Every production scope continues to follow `AGENTS.md`: coherent local implementation, one meaningful preflight, no 10–30 second micro-polling, exact-head CI, fresh `main` intersection check, merge, then post-merge verification.
