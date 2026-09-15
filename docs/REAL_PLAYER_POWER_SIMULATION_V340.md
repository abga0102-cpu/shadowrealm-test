# Real-player power simulation V340

## Why this exists

The historical V313 combat profiles are useful max-build regression fixtures, but they are not valid campaign progression references. In the early semantic runway they instantiate level 100 characters with Forge 35 or 50, upgraded gear, advanced Familiars and developed Skills. A real fresh-save player can reach the same campaign area far earlier than those systems can reasonably be developed.

V340 therefore separates two questions:

1. **Can a deliberately constructed late-game build beat a boss?** V313 remains useful for that regression question.
2. **What power can a real fresh-save player plausibly own when reaching a campaign floor?** V340 owns this diagnostic question.

## Simulation rules

The V340 browser diagnostic starts from `defaultState()` and reads the live runtime functions and economies instead of a hand-authored damage/HP table.

For every milestone it derives:

- campaign Gold and EXP from the real `goldReward`, `expReward`, wave count and enemy count;
- player level from the real `expToNext` curve and +5 stat points per level;
- Forge level from Gold actually earned through campaign + a bounded number of Raid Or clears, spending the available Gold greedily on the real 1→50 upgrade ladder;
- Forge mastery and equipment from a deterministic sequence of real rarity rolls and real `makeItem` output;
- Familiar rarity from real summon rates and a resource-limited number of paid summons;
- Skill mastery / highest direct rarity from real summon rates and a resource-limited number of paid summons;
- final basic combat DGT/PV and displayed power through the real `computeDerived` / `computePower` authority.

Random affixes and Familiar fusion are deliberately excluded from the baseline. Both are upside. This keeps the diagnostic from inventing a lucky or heavily optimized character.

## Three activity profiles

The profiles are not difficulty modifiers and are never read by combat. They are offline simulation policies only.

| Profile | Raid Or clears / 100 floors | Minerai | Familiar | Skill | Resource spend policy |
| --- | ---: | ---: | ---: | ---: | --- |
| Low | 8 | 4 | 4 | 4 | Light spending / little system optimization |
| Normal | 16 | 8 | 8 | 8 | Regular use without exhausting every possible key/resource |
| Optimized | 24 | 16 | 16 | 16 | High activity and much heavier resource conversion |

The key calibration point is **internal floor 75 / Facile 4-15**. The Normal profile has 12 Raid Or clears by that point. Even when every Gold coin available to the model is allowed to fund Forge upgrades, the reference must remain below Forge 15. This matches observed real play much more closely than the old Forge 35/50 fixtures.

## Safety boundary

V340 is diagnostic only. It does **not** alter enemy HP, enemy damage, Boss values, rewards, saves, rarity rates or campaign progression.

Monster balance should be recalibrated only after this diagnostic has been run against the current runtime and its milestone output has been reviewed. In particular, the old V313 profile ceilings must not be copied into the campaign enemy reference curve.
