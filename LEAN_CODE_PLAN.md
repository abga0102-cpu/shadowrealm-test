# Shadowreach Lean Code program

**Status: COMPLETE — formally closed 2026-09-15.**

Lean Code is closed at the V339-era architecture baseline after the final evidence audit. The program achieved its intended goal: remove provably dead/superseded runtime layers, collapse evidence-safe wrapper/observer chains, consolidate stable responsibilities into canonical owners, share utilities only where semantics genuinely match, and retire obsolete sources without changing gameplay, saves, balance, or features.

`AGENTS.md` remains the repository-wide development standard and `ARCHITECTURE.md` remains the canonical runtime ownership map. `RUNTIME_INVENTORY.md` is the authoritative loader inventory. `LEAN_CODE_REAUDIT.md` records the final disposition and the intentionally retained lifecycle mechanisms.

## Final phase disposition

- **L0 — Runtime inventory and coordination: COMPLETE.** Every loaded script has an explicit runtime reason or conditional responsibility.
- **L1 — Dead-load removal: COMPLETE.** The corrected source-reference investigation queue reached zero; superseded layers with proven surviving owners were unloaded/retired.
- **L2 — Wrapper-chain collapse: COMPLETE FOR CURRENT ARCHITECTURE.** Evidence-safe wrappers, pollers and observers were removed or transferred. Audio V26, Power Hint and Boot wave synchronization are intentionally retained because the current architecture does not expose deterministic lifecycle hooks with equivalent attack/skill/result or death/recovery ordering. Their retention is a closure decision, not unfinished Lean Code work.
- **L3 — Subsystem consolidation: COMPLETE FOR CURRENT ARCHITECTURE.** Stable areas have durable documented owners. Distinct live owners are not collapsed merely to reduce file count.
- **L4 — Shared utilities: COMPLETE FOR CURRENT ARCHITECTURE.** The Social message-store policy was consolidated. Other audited formatting, escaping and lifecycle helpers remain local where semantics differ or sharing would increase coupling.
- **L5 — Source retirement: COMPLETE FOR CURRENT ARCHITECTURE.** All evidence-ready staged retirements are complete and there is no standing deletion queue.

## Final operating rule

Do not continue Lean Code merely to increase a percentage, reduce line count, or delete files that still own live behavior. Future cleanup is ordinary architecture maintenance and must start from fresh evidence under `AGENTS.md`.

A future deterministic combat/wave lifecycle may make the retained Audio V26, Power Hint or Boot synchronization mechanisms removable. If that happens, treat it as a new architecture/refactor task with focused equivalence proof and the normal exact-head regression gate; it does not reopen this initiative automatically.

Likewise, future feature work may create genuinely superseded owners. Retire them only when reachability, surviving ownership and compatibility are proven. Preserve migration/save compatibility even when a path is infrequent.

## What Lean Code accomplished

The program consolidated and retired historical layers across Accomplishments, BottomNav, Home, Tree, Forge, Rebirth, Equipment, Familiar, notifications, import/progression compatibility and related UI/runtime ownership. It also removed multiple permanent pollers, broad MutationObservers and wrapper chains where deterministic lifecycle events already existed.

The normal non-Social first-party runtime baseline recorded by the final audit is **103 JavaScript files** (**93 index-managed + 10 transitively loaded**). That count is not itself a cleanup target: remaining files are legitimate runtime owners unless a future audit proves otherwise.

## Successor architecture direction

Any further large reduction in browser-request/file count should be treated as a separate modernization initiative rather than Lean Code. The preferred direction is stable feature modules, explicit dependencies/lifecycle events and eventually a lightweight module/build/bundling layer. Modernization must remain incremental and regression-gated; it must not recreate versioned patch-file accumulation.

Historical implementation detail, PR sequencing and proof notes remain available in Git history and the final `LEAN_CODE_REAUDIT.md` snapshot.