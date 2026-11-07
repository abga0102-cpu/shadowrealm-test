# Shadowreach equipment assets V2

Corrected extraction from the supplied atlas.

## What changed from V1
- Tight row boundaries: no equipment from the row above/below.
- Fixed canvas dimensions per visual part across all 11 rarities.
- Better preservation of white/gold Immortel and Divin pieces.
- Removal of small JPEG/grid/adjacent-column fragments.
- Added front/back visual sublayers where the atlas provides them.
- Explicit distinction between SOURCE rarity order and RUNTIME rarity order.

## Runtime rarity order
Commun → Peu commun → Rare → Épique → Héroïque → Mythique → Artefact → Légendaire → Infernal → Immortel → Divin.

The source atlas places Mythique before Héroïque. Always select folders by rarity name.

## Current gameplay-slot mapping
- casque -> casque.png
- armure -> armure_torse_arriere.png + armure_epaules.png + armure_torse_avant.png
- gants -> gants.png
- bottes -> bottes_jambieres.png + bottes.png
- ceinture -> ceinture_arriere.png + ceinture_avant.png
- collier -> collier.png
- anneau -> anneau.png
- arme -> KEEP the existing art/weapons renderer

No new gameplay slot is introduced.

## Hero with no equipment
Bare torso/body + white shorts.

## Important integration note
These are normalized visual layers extracted from a JPEG reference atlas.
They are not pre-aligned to the live hero sprite. The canonical renderer must
attach/scale them to the hero's current pose, and should preload/cache only
the layers actually needed.
