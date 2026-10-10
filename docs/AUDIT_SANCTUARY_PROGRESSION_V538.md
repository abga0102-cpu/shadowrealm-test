# Shadowreach V538 — Valeur des sacrifices et maîtrise divine (audit du 10/10/2026)

## Défaut confirmé et corrigé
- V537 a remplacé les 10 000 PR obsolètes du sacrifice Divin par 25 000 minerais dans `sanctuary-endgame-v130.js`.
- `sanctuary-divine-mastery-v132.js` possède sa propre table de bonus `rewardDelta`, séparée de la table de récompenses. Elle ne connaissait pas le nouveau gain de minerais du Divin.
- V538 ajoute `DIVIN: 25 000 minerais` dans cette table afin que la maîtrise « Abondance » (+5 % par niveau) s'applique à cette nouvelle récompense.
- **Risque structurel** : deux tables de récompenses dupliquées doivent être mises à jour ensemble. Recommandation future : source de données unique, test automatisé de cohérence.

## Coût théorique en pièces à partir de l'Épique I
Fusion de deux pièces identiques par rang, d'après `sanctuary-endgame-v130.js`. Épique I est le plus haut rang vendu par le fournisseur.
- Épique I : 1 unité achetée.
- Épique II : 2 Épiques I.
- Mythique I : 4 Épiques I.
- Mythique II : 8 Épiques I.
- Mythique III : 16 Épiques I.
- Artefact I : 32 Épiques I.
- Artefact II : 64 Épiques I.
- Artefact III : 128 Épiques I.
- Légendaire I : 256 Épiques I.
- Légendaire II : 512 Épiques I.
- Légendaire III : 1 024 Épiques I.
- Infernal I : 2 048 Épiques I.
- Infernal II : 4 096 Épiques I.
- Infernal III : 8 192 Épiques I.
- Immortel I : 16 384 Épiques I.
- Immortel II : 32 768 Épiques I.
- Immortel III : 65 536 Épiques I.
- Divin : 131 072 Épiques I.

Au prix de 4 400 or / Épique I (fournisseur niveau 15, hors maîtrise et autres réductions), la valeur d'achat théorique d'un Divin serait **576 716 800 or**. Il s'agit d'un équivalent purement théorique, pas du coût réel d'un joueur, qui peut utiliser d'autres sources, bonus, cadeaux et prix réduits.

## Signalement de game design — P0
Une progression strictement doublée sur 17 étapes depuis Épique I crée une barrière exponentielle extrême. Avant d'augmenter les récompenses des sacrifices de haut rang, déterminer si l'atteinte du Divin est réellement possible dans une durée de jeu acceptable. Les coûts de pièces et la valeur des récompenses ne peuvent être évalués isolément.

## Recommandations
1. Mesurer les Épiques I acquis par jour, le coût d'or journalier et la vitesse de fusion des joueurs.
2. Fixer un objectif de temps réaliste pour Mythique, Artefact, Légendaire, Immortel et Divin.
3. Vérifier les bonus de maîtrise divine et autres mécanismes réduisant les coûts.
4. Ne pas changer arbitrairement les récompenses sans connaître la durée de progression et les autres sources de pièces.
5. Ajouter un test comparant les champs de la table de récompenses et ceux de la maîtrise divine.

Statut : **une incohérence technique corrigée** ; progression et récompenses à rééquilibrer après simulation. Aucun ancien inventaire ni ancienne sauvegarde modifié.
