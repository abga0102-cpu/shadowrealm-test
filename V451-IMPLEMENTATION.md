# V451 Forge mastery drop level

- New Forge drops inherit the current permanent Equipment Mastery rank.
- Rank 0 stays level 0; rank I..IX maps to item level 1..9.
- `upgradeBaseLevel` is set to the inherited rank so the inherited mastery level is not treated as Dust upgrades.
- Existing inventory/equipped items are not rewritten by V451.
- The authority is loaded after `game-2.js`, where `forgeSummon` is defined, and before later UI modules.
