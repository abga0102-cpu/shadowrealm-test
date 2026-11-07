# Shadowreach — Simulation de progression du Sanctuaire (10/10/2026)

## Sources vérifiées
- `sanctuary-endgame-v130.js` : 22 rangs, de COMMUN à DIVIN, dont 18 rangs d'ÉPIQUE_I à DIVIN (17 fusions successives).
- `game-4.js` : fusion de deux pièces de même rang, fournisseur avec progression `sanctSupplierNeed(level)=5+floor((level-1)/2)`.
- `sanctuary-pricing-v125.js` : ÉPIQUE_I vendu 4 800 / 4 600 / 4 400 or aux niveaux fournisseur 13/14/15.
- `sanctuary-divine-mastery-v132.js` : Marchandage -5 % de coût fournisseur par niveau, maximum -25 %.
- `sanctuary-endgame-v130.js` : plateau 16 à 32 cases, agrandissements successifs de 10 000 à 160 000 or (1 360 000 or au total).

## Modèle explicite (hypothétique, non basé sur la télémétrie)
On suppose le fournisseur niveau 15, aucun autre apport de pièces, pas de sacrifices intermédiaires, pas de pièces initiales, et achats illimités par jour si l'or est disponible. Les jours indiqués sont **une borne basse théorique** ; ils ne comptent pas les gestes de fusion ni les contraintes de plateau.

| Rang | Épiques I | Coût brut (or) | Jours à 20 achats/j | Jours à 100 achats/j | Jours à 500 achats/j |
|---|---:|---:|---:|---:|---:|
| MYTHIQUE_III | 16 | 70 400 | 0,8 | 0,16 | 0,032 |
| ARTEFACT_III | 128 | 563 200 | 6,4 | 1,28 | 0,256 |
| LEGENDAIRE_III | 1 024 | 4 505 600 | 51,2 | 10,24 | 2,048 |
| INFERNAL_III | 8 192 | 36 044 800 | 409,6 | 81,92 | 16,384 |
| IMMORTEL_III | 65 536 | 288 358 400 | 3 276,8 | 655,36 | 131,072 |
| DIVIN | 131 072 | 576 716 800 | 6 553,6 | 1 310,72 | 262,144 |

À 100 achats/jour, atteindre Divin prend au minimum ~3,59 ans. À 500 achats/jour, ~262 jours. À 1 000 achats/jour, ~131 jours, nécessitant **4 400 000 or/jour**. À 100 achats/jour, il faut **440 000 or/jour**.

Avec Marchandage 5/5, prix Épique I approximatif = 3 300 or, Divin = **432 537 600 or** hors agrandissement et progression du fournisseur. Le bonus change le coût en or mais **pas le nombre de pièces à fusionner**.

## Éléments à mesurer avant modification
1. Or net gagné par jour, selon les étapes de campagne et les boosts (séparer joueurs débutants/avancés).
2. Nombre de pièces ÉPIQUE_I achetées par jour après déblocage fournisseur 15.
3. Sources alternatives de pièces de rang élevé, éventuelles pièces offertes, récompenses et mécanismes d'accélération.
4. Nombre de fusions réalisables confortablement sur téléphone, et friction UI des 131 071 opérations théoriques pour un Divin depuis les Épiques I.
5. Progression réelle des joueurs, si une télémétrie consentie est disponible.

## Conclusions
- **Problème confirmé :** sans autre source de pièces de haut rang, la chaîne est exponentielle, et le nombre de manipulations est potentiellement colossal.
- **Non démontré :** temps réel pour atteindre Divin ; les données d'or/jour et d'acquisition des pièces ne sont pas encore établies.
- **Recommandation forte :** envisager des fusions en lot / automatisation déverrouillable pour réduire les interactions, sans augmenter artificiellement la vitesse de progression ; puis équilibrer la vitesse de génération des pièces en fonction de jalons cibles.
- **Décision réservée au propriétaire :** aucun changement aux prix, raretés ou récompenses sans validation après analyse des sources d'acquisition et de l'économie d'or.
