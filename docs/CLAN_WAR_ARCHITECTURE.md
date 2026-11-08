# Shadowreach : fondation des guerres de clans

Statut : **proposition technique isolée, NON activée dans le jeu**.

## Étude de référence

Forge Master utilise une semaine de guerre : cinq jours d'actions de progression, un sixième jour d'assauts entre membres de clans adverses et un septième jour de récupération des récompenses. Les victoires quotidiennes valent respectivement 1, 2, 2, 2, 2 et 4 points, soit 13 au total ; 7 points gagnent la guerre. Le jour des assauts, chaque membre dispose de cinq tickets. Les récompenses sont liées à la contribution personnelle et au palier du clan.

Références consultées le 8 novembre 2026 :
- https://forgemaster.pro/clans/war.html
- https://forgemaster.pro/clans/war-rewards.html
- https://forgemaster.pro/clans/

Certaines pages communautaires plus anciennes décrivent une rotation différente. Ce document suit les règles plus récentes de forgemaster.pro, sans reprendre son interface, ses personnages ou ses valeurs économiques.

## Adaptation proposée à Shadowreach (non validée côté économie)

| Jour | Points de victoire | Activités proposées |
| --- | ---: | --- |
| 1 | 1 | Forge, clés de raid, invocation/amélioration de compétences |
| 2 | 2 | Investissement d'or dans la Forge, recherches de l'Arbre |
| 3 | 2 | Forge, compétences, éclosion et fusion de familiers |
| 4 | 2 | Investissement d'or dans la Forge, clés de raid |
| 5 | 2 | Forge, recherches et familiers |
| 6 | 4 | Assauts contre joueurs adverses, combat collectif ; cinq tickets/joueur |
| 7 | 0 | Résultats, réclamation des récompenses |

Ces activités sont un brouillon de conception, pas une règle active. Les valeurs de points d'action, récompenses, coûts, paliers, cooldowns et effets sur la progression restent à approuver après simulation d'économie. Aucune monnaie premium ne rapporte de points dans cette proposition.

## Réalités techniques vérifiées dans le dépôt

- La version web charge un jeu HTML/JS statique. Les sauvegardes sont locales.
- La route Clan dans game-5.js est aujourd'hui un écran serveur non disponible qui mentionne FastAPI/MongoDB sans fournir un backend exécutable dans ce dépôt.
- La couche social-v1.js est facultative, avec stockage local et éventuel relais distant ; ce n'est pas une autorité fiable pour les guerres.
- Le laboratoire Arène local teste des bots ; il ne prouve pas l'existence de combats PvP sécurisés entre vrais comptes.
- La PR #479 ouverte touche game-5.js et index.html : éviter ces fichiers jusqu'à coordination/fusion.

## Contrat minimal du futur serveur (pas encore implémenté)

1. Comptes et identité de joueur vérifiés, adhésion à un clan, responsable du clan et permissions.
2. Snapshots d'effectifs avant le démarrage de la guerre ; inscription tardive non éligible.
3. Appariement de deux clans et calendrier officiel UTC gérés par le serveur.
4. Événements d'activité issus d'actions de jeu validées côté serveur, dédupliqués par identifiant unique ; jamais de score calculé sur les déclarations du navigateur.
5. Clôture quotidienne atomique et idempotente, scores de victoire immuables et résolution du conflit/tie-break définie avant la première saison.
6. Assauts avec cinq tickets contrôlés en base, validation anti-triche des snapshots de combat, résolution reproductible et impossibilité de double dépense.
7. Récompenses attribuées exactement une fois dans un ledger serveur, avec suivi de réclamation ; aucun crédit sur sauvegarde locale sans protocole de migration/confiance.
8. Tests de concurrence (double clic, multi-appareils, reconnexion), anti-spam, fuseaux horaires, saisie corrompue, perte réseau et navigation iPhone.

## Limites du présent lot

clan-war-rules.js expose uniquement des règles déterministes pures : calendrier UTC d'aperçu, activités proposées par jour, éligibilité temporelle d'un membre, cinq tickets et résultat des journées clôturées. Ce module ne déclenche aucun combat, ne crée aucun clan, ne persiste aucune donnée et ne donne aucune récompense. Il n'est pas encore chargé dans index.html : le joueur ne voit donc aucune nouvelle fonctionnalité pour l'instant.

Après validation du modèle économique et la mise à disposition d'un backend sécurisé, procéder par PR séparées pour serveur, interface de Clan et événements métier, sans fusionner cette branche expérimentalement avec les PR automatiques.

## Clans de bots : première interface testable

- Prototype indépendant accessible par `clan-bots-preview.html` sur la branche expérimentale.
- Six clans prédéfinis, douze bots fictifs déterministes chacun; possibilité de rejoindre, quitter ou créer son propre clan avec huit bots. Rôles, effectifs et puissance sont présentés sans tromper sur leur caractère simulé.
- Seule la clé locale `shadowreach.clan.bot-preview.v1` est modifiée. La clé `shadowreach.save.local` et les ressources du jeu ne sont jamais touchées.
- `game-5.js` et `index.html` restent inchangés pour éviter de chevaucher la PR #479. L'intégration dans le véritable écran Clan doit attendre la coordination et une passe QA complète.
- Tests Node (`tests/phase-clan-bot-rosters.spec.js`) et Chromium/iPhone (`tests/phase-clan-bot-preview.spec.js`). Le statut des CI doit être vérifié avant toute proposition de fusion.
- Pas encore de multijoueur réel, de guerres résolues, de scores serveur, de récompenses, d'adhésion persistante entre appareils ou de création de comptes.

## Ordres du chef de simulation aux bots (prototype isolé)

L'onglet `Mes ordres` permet de choisir un ordre collectif ou un ordre individuel parmi : objectif du jour, Forge, Raids, Compétences, Familiers, économie de ressources, attaque, défense et repos. Dans le bac à sable, tout joueur ayant rejoint un clan fictif peut tester les directives : **cela n'accorde aucun droit de chef dans un clan réel**.

Une ronde manuelle exécute une action par bot uniquement si l'action correspond au jour défini par `clan-war-rules.js`. Lorsqu'un ordre n'est pas compatible, le bot reste en attente, il ne change pas silencieusement de tâche. Les jours 1–5 limitent les contributions à 8 par bot/jour ; le J6 limite les assauts à 5 tickets par bot ; le J7 est en lecture seule.

La clé indépendante `shadowreach.clan.bot-orders.v1` sauvegarde les ordres, compteurs plafonnés et un journal limité à 36 événements fictifs. Ces données sont validées au chargement, liées à l'ID du clan, et effacées lors d'un changement/abandon de clan. Aucune interaction avec `shadowreach.save.local`, ni monnaie, ni récompense, ni PvP réel, ni processus de fond lorsque la page est fermée. Les points des rapports sont explicitement **fictifs** et n'interviennent pas dans la victoire de guerre.
