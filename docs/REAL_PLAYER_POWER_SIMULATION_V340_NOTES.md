# V340 calibration note

The current campaign reference curve and the historical V313 combat-profile fixture answer different questions.

At internal floor 75, the old V313 fixture is already testing profiles such as level 100 / Forge 35+ with manually injected upgraded gear and developed systems. That is intentionally a build-strength regression fixture, not a fresh-save progression model.

The V340 diagnostic instead uses fresh-save campaign EXP, campaign Gold, current Raid reward curves, current Forge upgrade costs, current rarity rolls, current equipment generation, current Familiar summon rates and `computeDerived()`.

Primary acceptance point: the Normal resource-earned profile at internal floor 75 must remain below Forge 15, and even the Optimized profile must remain below Forge 20. This prevents future balance work from treating Facile 4-15 as if the player had already maxed the Forge.
