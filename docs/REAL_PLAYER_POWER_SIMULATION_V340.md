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
- Familiar progression through the real paid summon path, real rarity/species/element rolls, the real fusion ladder and the authoritative flat Familiar DGT/PV calculation;
- the strongest resulting Familiar is activated, so its DGT/PV contribution is present in `computeDerived` and `computePower`;
- Skill progression through the real `summonSkill` path, including duplicate levelling, mastery advancement and the real automatic equipped slots;
- the equipped Skill loadout is recorded, with direct offensive Skill damage evaluated through the current V284 Skill authority;
- final DGT/PV, displayed power and a nominal direct-combat DPS reference are reported from the resulting complete character state.

Random equipment affixes are deliberately excluded from the baseline because they are luck/optimization upside. Familiar fusion is **not** excluded: it is normal obtainable progression and therefore has to be represented.

For this diagnostic, eggs affordable by a milestone are treated as already hatched. The hatch timer is a pacing axis rather than a permanent power source and can be modelled separately if needed. The important balance rule is that the Familiar obtained from those resources must not disappear from the player-power reference.

Equipped support/debuff/heal Skills remain in the simulated loadout even when they do not contribute to the simple direct-DPS number. Final enemy calibration must therefore use the resulting real Skill loadout in live combat rather than treating the direct-DPS number alone as total Skill value.

## Three activity profiles

The profiles are not difficulty modifiers and are never read by combat. They are offline simulation policies only.

| Profile | Raid Or clears / 100 floors | Minerai | Familiar | Skill | Resource spend policy |
| --- | ---: | ---: | ---: | ---: | --- |
| Low | 8 | 4 | 4 | 4 | Light spending / little system optimization |
| Normal | 16 | 8 | 8 | 8 | Regular use without exhausting every possible key/resource |
| Optimized | 24 | 16 | 16 | 16 | High activity and much heavier resource conversion |

The key calibration point is **internal floor 75 / Facile 4-15**. The Normal reference must land between **Forge 8 and Forge 12 inclusive**. Forge is only one part of that reference: the active Familiar and actually equipped Skills must also be present before the player's effective combat level is used to rebalance the monsters.

## Safety boundary

V340 is diagnostic only. It does **not** alter enemy HP, enemy damage, Boss values, rewards, saves, rarity rates or campaign progression.

Monster balance should be recalibrated only after this diagnostic has run against the current runtime and its milestone output has been reviewed. In particular, the old V313 profile ceilings must not be copied into the campaign enemy reference curve, and a Forge-only reference must not be used as a substitute for the complete player build.
