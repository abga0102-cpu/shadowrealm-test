# L4 helper semantics

This document records helper behavior before any Lean Code shared-utility consolidation. The rule is evidence first: helpers are not interchangeable merely because they have similar names or purposes.

## Number formatting

### Base `fmt` — `game-1.js`

The global `fmt(n)` is the general compact-number formatter used across the base game.

Behavior that must be preserved unless a caller is deliberately migrated:

- `undefined`, `null`, `NaN` and other non-numeric values that satisfy `isNaN(...)` become `"0"`.
- Values below 1,000 are floored rather than rounded.
- Compact suffixes continue beyond millions: `K`, `M`, `b`, `t`, `q`, `Q`, `s`, `S`.
- Compact precision depends on the scaled absolute magnitude:
  - below 10: two decimals;
  - below 100: one decimal;
  - 100 or above: integer.
- Negative values are formatted from their absolute magnitude and receive a leading `-` afterward.

Representative outputs:

| Input | Base `fmt` |
| ---: | --- |
| `999.9` | `999` |
| `1,000` | `1.00K` |
| `1,234` | `1.23K` |
| `10,000` | `10.0K` |
| `1,000,000` | `1.00M` |
| `1,000,000,000` | `1.00b` |
| `-1,000,000,000` | `-1.00b` |
| `"oops"` | `0` |

### Forge `fmt2` — `forge-ux-v273.js`

Forge V273 has a local presentation formatter with deliberately different behavior.

Behavior currently owned by V273:

- Nullish/falsy values normalize through `Number(v || 0)`.
- A value that becomes non-finite returns the original truthy value as text; for example `"oops"` stays `"oops"`.
- Below 1,000, values are rounded and localized with `toLocaleString('fr-FR')`, so grouping follows the French locale.
- Only `K` and `M` suffixes exist; billions remain expressed as millions.
- Positive `K` values use one decimal below 10,000 and zero decimals from 10,000 upward.
- Positive `M` values use one decimal below 10,000,000 and zero decimals from 10,000,000 upward.
- The precision threshold checks signed `n`, while the suffix threshold checks `Math.abs(n)`. Therefore large negative values retain one decimal even where the corresponding positive value has zero.

Representative outputs:

| Input | Forge `fmt2` |
| ---: | --- |
| `999.9` | French-locale rounded `1,000` |
| `1,000` | `1.0K` |
| `1,234` | `1.2K` |
| `10,000` | `10K` |
| `1,000,000` | `1.0M` |
| `1,000,000,000` | `1000M` |
| `-1,000,000,000` | `-1000.0M` |
| `"oops"` | `oops` |

The exact locale grouping character for the sub-1,000 branch is delegated to the runtime's `fr-FR` implementation; the regression contract compares against `toLocaleString('fr-FR')` rather than hard-coding a whitespace glyph.

## Number formatting consolidation decision

**Do not replace either formatter with the other.** Their current contracts are observably different. A future shared formatter is only safe if it exposes explicit modes/adapters and each caller is deliberately assigned to the correct semantics.

`tests/phase-l4-formatting-semantics.spec.js` is the golden contract for these differences. It is intentionally source-based so Forge's local helper does not need to be exposed globally merely for testing.

## Escaping helpers

The loaded escaping helpers have overlapping purposes but different input contracts. Those differences are now explicit before any shared HTML-escaping helper is proposed.

### Base `esc` — `game-3.js`

Base `esc(s)` first applies `String(s)`, then escapes `&`, `<`, `>` and the double quote `"`.

Current semantics:

- `null` becomes the literal text `"null"`.
- `undefined` becomes the literal text `"undefined"`.
- Numbers and booleans are stringified normally.
- Apostrophes remain unchanged.
- Existing call sites include ordinary HTML text plus `data-arg` / `data-arg2` values inside double-quoted attributes.

### Forge `esc2` — `forge-panel-authority-v266.js`

Forge `esc2(s)` normalizes nullish input with `s == null ? '' : s`, then escapes the same four characters as Base.

Current semantics:

- `null` and `undefined` become the empty string.
- Numbers and booleans are stringified normally.
- Apostrophes remain unchanged.
- Current V266 call sites cover accelerator labels and filter text, plus accelerator keys inserted into double-quoted `data-arg` attributes.

### Tree escaping — `tree-dedicated-v116.js`, `runtime-tree-stability-v216.js`, `personal-tree-radial-v82.js`

The active Tree layers currently share the stricter nullish/apostrophe contract. The dedicated renderer and runtime stability layer expose local `esc(...)` functions, while the radial layer uses `escSvg(...)` with the same behavior.

Current semantics:

- `null` and `undefined` become the empty string.
- Numbers and booleans are stringified normally.
- `&`, `<`, `>`, `"` and `'` are escaped.
- Apostrophes become `&#39;`.
- Current uses include Tree/SVG text content and double-quoted `data-arg` values.

Representative outputs:

| Input | Base `esc` | Forge `esc2` | Tree escaping |
| --- | --- | --- | --- |
| `null` | `null` | empty | empty |
| `undefined` | `undefined` | empty | empty |
| `0` | `0` | `0` | `0` |
| `false` | `false` | `false` | `false` |
| `A&B` | `A&amp;B` | `A&amp;B` | `A&amp;B` |
| `<b>` | `&lt;b&gt;` | `&lt;b&gt;` | `&lt;b&gt;` |
| `a"b` | `a&quot;b` | `a&quot;b` | `a&quot;b` |
| `O'Reilly` | `O'Reilly` | `O'Reilly` | `O&#39;Reilly` |

### Escaping consolidation decision

**Do not replace Base, Forge or Tree escaping helpers with one another yet.** Base has different nullish semantics, and Tree has stricter apostrophe escaping than both Base and Forge.

A future shared helper is only safe after each caller is deliberately assigned to an explicit HTML context and nullish policy. The current evidence covers text nodes and double-quoted attributes; it does not authorize using these helpers as a generic sanitizer for URLs, CSS, JavaScript, raw HTML, or single-quoted attribute contexts.

`tests/phase-l4-escaping-semantics.spec.js` is the golden behavior contract. It also verifies that the currently loaded Tree helpers remain semantically aligned without exposing any of them globally for testing.

## First-pass L4 disposition

The formatting and escaping candidates are now contract-locked, but neither currently satisfies L4's production-transfer criterion of a measurable duplication reduction **without extra coupling**.

- Base and Forge number formatters intentionally differ in invalid-input handling, rounding, suffix vocabulary, locale behavior and negative-value precision. A mode-based shared formatter would add configuration/adapter surface before it removes meaningful complexity.
- Base, Forge and Tree escaping intentionally differ in nullish and apostrophe behavior. Treating one as a generic replacement would change observable output or silently broaden its HTML-context contract.
- The three Tree escaping helpers are behaviorally aligned, but their current runtime order matters: `personal-tree-radial-v82.js` loads before `tree-dedicated-v116.js` and `runtime-tree-stability-v216.js`. Making one of those feature owners the shared escaping authority would create a new cross-owner load-order dependency solely to remove three tiny local functions.
- Introducing a new production utility module for these helpers would increase runtime/module surface and contradict the architecture-first rule unless it owned a broader, durable shared responsibility.

**Decision:** retain the current local helpers for this first L4 pass. This is an intentional Lean Code outcome, not an unfinished deduplication: the evidence shows that consolidating these helpers now would increase coupling or change semantics. Revisit only if a broader shared-utility owner emerges naturally from future consolidation, or if a newly discovered helper family has identical semantics and can be reduced without adding a runtime dependency.

The next L4 investigation should therefore prefer another neutral helper family (for example a genuinely identical DOM/persistence/lifecycle utility) rather than forcing formatting or escaping into a shared abstraction.

## Lifecycle scheduling helpers

The second L4 pass inspected the small scheduling helpers around the canonical `sr:bottomnavrendered` lifecycle. These helpers look similar because they all defer UI work, but their trigger and coalescing contracts are not identical.

### Home layout — `home-layout-authority-v219.js`

Home uses a single queued animation-frame scheduler for three triggers: `sr:bottomnavrendered`, `resize` and `orientationchange`.

- Repeated triggers before the next animation frame are coalesced into one `sync()` call.
- The queued flag is cleared immediately before `sync()` runs, so a new trigger during/after that sync may schedule the following frame.
- Startup synchronization is immediate through `sync()` rather than animation-frame deferred.

### Campaign compact tagging — `ui-stability-v83.js`

V83 uses the same one-frame coalescing pattern for campaign compact tagging, but only for `sr:bottomnavrendered`.

- Repeated BottomNav lifecycle events before the next frame are coalesced.
- Startup synchronization is immediate through `syncCampaignCompact()`.
- This helper belongs to the modal/campaign stability owner and does not own Home resize/orientation geometry.

### Weekly Mega injection — `weekly-mega-v71.js`

Weekly Mega intentionally uses a simpler one-frame deferral: `queueInject()` always calls `requestAnimationFrame(inject)` and does not keep a queued flag.

- Multiple lifecycle events may therefore schedule multiple callbacks.
- `inject()` is independently idempotent for an already-mounted `#megaWeeklyV117` box.
- Boot still performs its own direct `inject()` once state is ready.

### Social docking — `social-v1.js`

Social uses different scheduling semantics per trigger.

- `sr:bottomnavrendered` defers `mountButton()` and `dockSocialUI()` by one animation frame.
- `resize` docks immediately.
- `orientationchange` uses a 120 ms timeout before docking.
- Startup mounts and docks directly through the existing boot path.

### Lifecycle scheduling consolidation decision

**Do not replace these owner-local schedulers with one shared helper in the current L4 pass.** Weekly Mega and Social are observably different from the coalesced Home/V83 contract. Home and V83 are algorithmically aligned, but sharing the tiny queued-frame helper would require either a new production utility module or a cross-owner dependency solely to remove two local flags/functions. Both options add more architecture surface than they remove.

The earlier post-screen lifecycle proofs also showed that inventing a broader shared render-complete event is not yet justified: later route ownership can still replace screen DOM after an earlier core render commit. L4 should therefore preserve the existing canonical `sr:bottomnavrendered` subscriber contracts rather than manufacture a new lifecycle abstraction from helper similarity alone.

`tests/phase-l4-lifecycle-scheduling-semantics.spec.js` locks the current trigger/coalescing contracts without exposing new globals or modifying production runtime behavior.

## Second-pass L4 disposition

The lifecycle scheduling family does not currently satisfy the production-transfer criterion either. This is another intentional no-transfer result: similarity exists, but a shared abstraction would either change scheduling semantics or introduce a dependency whose cost is larger than the duplicated code.

**Decision:** keep Home, V83, Weekly Mega and Social scheduling local to their canonical owners. The next L4 investigation should prefer persistence or genuinely identical DOM helpers with no feature-sensitive timing semantics. If no such helper family yields a net reduction, L4 can be considered complete with documented retained locals rather than forcing a utility layer.
