# Shadowreach — Audit économie du Sanctuaire, phase 2 (10/10/2026)

## P0 : récompenses obsolètes liées au Rebirth (CONFIRMÉ)
Sources : `sanctuary-endgame-v130.js` et `game-2.js`.
- `game-2.js` : `canRebirth()` retourne toujours `false`, `doRebirth()` retourne `0` et `buyRebirth()` retourne `false` ; le système est explicitement retiré.
- `sanctuary-endgame-v130.js` conserve le boost `pr50_60` (« +50% PR de Rebirth · 1 h »), offert dans le sacrifice **Immortel I**.
- Le sacrifice **Divin** offre **10 000 PR**. `grant()` crédite `S.rebirth.pr`, une ancienne ressource sans progression Rebirth active.
- Le joueur peut donc sacrifier des objets extrêmement rares pour des récompenses partiellement inutilisables. **Ne pas remplacer silencieusement ces récompenses :** définir avec le créateur une compensation à valeur comparable (gemmes, minerais, essences, bonus or/XP ou autre système réellement actif). Prévoir migration équitable pour les récompenses déjà réclamées, sans double-crédit.

## P1 : cohérence des récompenses de sacrifice (CONFIRMÉE dans la table)
| Rareté | Récompense |
|---|---|
| Rare I | 25 minerais |
| Rare II | 50 minerais |
| Épique I | 1 accélérateur 1 min |
| Épique II | 1 accélérateur 5 min |
| Mythique I | boost +10 % or 30 min |
| Mythique II | 200 poussières |
| Mythique III | 1 accélérateur 30 min + 1 500 minerais |
| Artefact I | 1 sceau + boost +20 % XP 30 min |
| Artefact II | 750 essences + 750 étincelles |
| Artefact III | 3 sceaux + 1 000 essences + 1 000 étincelles |
| Légendaire I | 15 000 minerais + boost +50 % or 30 min |
| Légendaire II | 1 500 essences + 1 500 étincelles + 5 accélérateurs 60 min |
| Légendaire III | 1 clé + 5 sceaux + 25 000 minerais |
| Infernal I | 10 sceaux + 25 000 minerais + boost +50 % XP 60 min |
| Infernal II | 5 clés + 5 sceaux + 10 accélérateurs 60 min |
| Infernal III | 5 clés + 15 sceaux + 15 000 essences + 15 000 étincelles |
| Immortel I | 5 clés + 15 sceaux + boosts or, XP **et PR obsolète** |
| Immortel II | 100 000 minerais + 10 000 essences + 20 accélérateurs 60 min |
| Immortel III | 150 sceaux |
| Divin | **10 000 PR obsolètes** + 25 accélérateurs 60 min + boosts or/XP + 50 sceaux + 15 clés + 1 jeton + titre |

## P1 : économies à modéliser
- La fusion requiert deux pièces de même rang par étape. L'approvisionnement n'offre que Commun, Peu commun, Rare I, Épique I. Les sacrifices de rangs supérieurs représentent un investissement exponentiel en pièces.
- Comparer la valeur réelle de chaque sacrifice avec le coût d'opportunité des pièces fusionnées, les gains horaires des autres activités et les dépenses utiles. Ne pas comparer uniquement les chiffres bruts de ressources différentes.
- Le plateau démarre à 16 cases et peut atteindre 32 cases. L'agrandissement coûte `(n+1) × 10 000` or : 10 000, 20 000, ..., 160 000, soit **1 360 000 or** au total pour 16 extensions. Tester si ce coût reste pertinent avec les revenus aux stades visés.
- Les bonus de même type ne se cumulent pas en puissance, mais prolongent la durée ou sont mis en file d'attente. Vérifier la progression de la file lors d'une longue période hors ligne.

## Décisions de game design recommandées
1. **Urgent :** remplacer les récompenses PR et boosts PR obsolètes par des récompenses utiles, après définition d'une équivalence économique.
2. **Important :** tracer les coûts de fusion depuis les quatre raretés achetables jusqu'au Divin, puis simuler les sacrifices avec les revenus réels du jeu.
3. **Important :** auditer les extensions de plateau et leur retour sur investissement.
4. **Avant livraison :** tests des sauvegardes historiques, des récompenses déjà réclamées et de l'absence de duplication.

Statut : audit statique partiel, **aucune modification des récompenses ou sauvegardes**.
