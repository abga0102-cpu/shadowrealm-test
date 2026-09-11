## Workstream

- Subsystem:
- Canonical owner(s):
- Files/owners touched:
- Starting `main` SHA:

## Architecture / file placement

- Existing canonical owner considered:
- Placement decision: existing owner / new module
- New production `.js` files: none
- Why existing owner cannot safely contain this code: n/a
- `ARCHITECTURE.md` owner entry added/updated: n/a
- Versioned filename exception: n/a

> Default rule: put new behavior into the existing canonical owner. Create a production JavaScript file only when no existing owner can take the responsibility cleanly. New `*-vNNN.js` patch layers require an explicit exception rationale.

## Intent

- Behavior intentionally changed:
- Behavior explicitly not changed:
- Why this scope is independently shippable:

## Concurrent work check

- Open/recent overlapping PRs checked:
- Did `main` move during development? If yes, summarize the intersecting delta:
- Any feature-sensitive owner touched? If yes, explain coordination:

## Testing

- Local/static checks:
- Focused subsystem tests:
- Browser/runtime tests:
- Moving smoke ratchet:
- Full Chromium/WebKit gate:

## Merge safety

- Final PR head SHA:
- Latest `main` SHA checked immediately before merge:
- Intersecting delta reconciled and retested: yes / no / n/a
- Merge only this exact tested head SHA: yes
