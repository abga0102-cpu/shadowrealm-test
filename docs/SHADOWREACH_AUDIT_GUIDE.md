# SHADOWREACH — Guide d'audit et cohérence du game design
Date de création : 10 octobre 2026. Document de référence durable pour les futurs audits, à maintenir avec les versions.

## Règle fondamentale
Quand on demande « analyse le jeu », NE PAS se limiter aux bugs visibles ni à un fichier. Cartographier les interactions entre systèmes, vérifier les chiffres et les règles de progression, chercher activement les contradictions, puis produire un rapport avec preuves, sévérité, propositions et risques. Ne pas affirmer que tout le jeu a été étudié sans avoir inspecté tous les systèmes. Séparer « constat confirmé », « hypothèse » et « choix de design ».

## Incohérence CONFIRMÉE le 10/10/2026 — approvisionnement du sanctuaire
Fichiers : sanctuary-pricing-v125.js, sanctuary-endgame-v130.js.
- Fusion : deux pièces identiques produisent la rareté immédiatement supérieure. La chaîne est COMMUN → PEU_COMMUN → RARE_I → RARE_II → EPIQUE_I.
- Au niveau fournisseur 15 : Commun 225 or ; Peu commun 525 ; Rare I 1 050 ; Épique I 2 100.
- Épique I requiert 4 Rare I, soit 4 × 1 050 = 4 200 or, alors qu'un achat direct d'Épique I coûte 2 100 or (moitié du coût). Achat direct court-circuite la fusion et rend Rare I économiquement désavantageux pour obtenir Épique I.
- Autre anomalie potentielle : Peu commun 525 vs 2 × Commun 225 = 450 ; Rare I 1 050 vs 2 × Peu commun 525 = 1 050 (pas de prime de commodité). Les prix doivent être jugés avec les bénéfices du fournisseur et l'espace limité du plateau.
- Proposition à valider : prix Épique I au niveau 15 >= 4 200, avec prime de commodité éventuelle (exemple 4 500–4 700), recalculer la courbe des niveaux 13–15 et tester les impacts sur l'or. NE PAS modifier l'économie silencieusement sans validation.
- Vérifier si des systèmes plus tardifs remplacent à nouveau les fonctions de prix.

## Matrice d'audit systématique
1. **Économie** : tous les prix d'achat vs coût de fabrication/fusion ; prix de revente ; récompenses vs dépenses ; exploit d'arbitrage ; inflation or/gemmes/minerais/poussières/essences ; ratios de rendement par activité ; coûts marginaux ; déblocages de rareté.
2. **Progression** : courbes niveaux/stages/difficultés/raids/ascensions/forge/familiers/sanctuaire ; goulots ; récompenses promises vs reçues ; cohérence pré/post ascension ; cas limites (0, max, palier).
3. **Combat** : dégâts, PV, résistances, boss, élites, familiers, équipement ; comparer multiplicateurs effectivement exécutés, scripts d'autorité et empilements ; simuler différents profils de joueurs.
4. **Interfaces** : iPhone étroit, écran court, safe areas, clavier, scroll, touch, superpositions, menus, modales ; préserver scroll et focus lors des re-renders ; tester boutons masqués ; vérifier observer/timers qui provoquent des sauts.
5. **Sauvegardes** : migration idempotente, doubles récompenses, compatibilité anciennes sauvegardes, rechargement, offline/online, perte de ressources, arrondis, cas de déploiement.
6. **Architecture** : ordre de chargement des scripts, redéfinitions de fonctions globales, règles contradictoires entre autorités, performance, timers/observers, duplication de CSS, erreurs JS.
7. **Accomplissements** : conditions d'obtention = description = récompense réelle ; contrôle des doubles réclamations ; contrôle des unités et des seuils.
8. **UX / motivation** : chaque action doit avoir une utilité ; éviter qu'une option optimale écrase toutes les autres ; communiquer clairement les arbitrages, les coûts et les récompenses.
9. **Tests** : écrire des invariants automatisables (ex. prix direct >= coût d'assemblage lorsque l'achat direct ne doit pas être subventionné), simuler parcours débutant/intermédiaire/endgame, vérifier la régression et le statut Vercel après chaque livraison.
10. **Journal** : dater chaque modification, la classer par thème, décrire son impact en une phrase, mettre à jour updates-journal-v533.js.

## Sources de méthode / formation
- GDC, Matt Woodward, « Balancing the Economy for Albion Online » : ancres économiques et contraintes. https://www.gdcvault.com/play/1024070/Balancing-the-Economy-for-Albion
- GDC, Vili Lehdonvirta, « Economic Balancing and Improved Monetization Through Clever Sink Design » : simulation des sorties de ressources. https://www.gdcvault.com/play/1020524/Economic-Balancing-and-Improved-Monetization
- GDC 2025, Monica Fan, « Gameplay System Design for Indies » : modèles de sources et dépenses, progression, tableurs. https://media.gdcvault.com/gdc2025/Slides/Fan_Monica_Gameplay%2BSystem%2BDesign.pdf
- GDC, « Balancing Your Game Economy: Lessons Learned » : https://www.gdcvault.com/play/1015150/Balancing-Your-Game-Economy-Lessons

## Processus de chaque audit
Inventorier les fichiers → identifier les règles actives et leur ordre → tracer les dépendances → calculer les invariants → simuler les cas limites → distinguer bugs/choix → proposer priorités → corriger uniquement avec accord pour changements économiques importants → vérifier tests/déploiement → mettre à jour ce document et le journal.


## Principe directeur permanent — Free-to-play compétitif (validé le 10/10/2026)
- **Tout Shadowreach doit être conçu pour qu'un joueur free-to-play actif, habile et bien organisé reste utile et pertinent dans les guerres de clan.** Cela s'applique à toutes les mécaniques actuelles et futures : progression, équipement, Sanctuaire, forge, compétences, événements, combats et guerre de clan.
- Les dépenses en or, en gemmes ou les fonctionnalités de confort peuvent accélérer ou simplifier le jeu, mais **ne doivent pas acheter l'exclusivité d'une contribution significative aux guerres de clan**. Éviter les écarts de puissance impossibles à combler, les mécaniques pay-to-win obligatoires et les verrouillages permanents.
- Lors de chaque mise à jour importante, examiner explicitement les conséquences pour les joueurs gratuits : accès aux ressources, temps de progression, capacité de participer et d'apporter une contribution utile aux guerres de clan.
- Pour la **fusion automatique instantanée du Sanctuaire**, conserver un tarif de base par opération, mais envisager **un supplément modéré et progressif pour les raretés supérieures** ; ne pas rendre les hautes raretés prohibitives. La fusion manuelle reste gratuite. Les contrats du monstre fusionneur restent une option de confort, non une obligation de progression.
- **Les coefficients et prix finaux de cette majoration par rareté ne sont pas encore validés.** Les proposer et les tester en simulation avant implémentation ; ne pas inventer un barème présenté comme approuvé.
- Objectif transversal : **équité compétitive, utilité sociale en clan et monétisation du confort plutôt que de la victoire**.
