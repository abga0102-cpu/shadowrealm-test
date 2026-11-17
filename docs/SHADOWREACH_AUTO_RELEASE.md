# SHADOWREACH AUTO-RELEASE

## Objectif
Accélérer la livraison sans confondre code prêt, PR fusionnée et version publique.

Le workflow GitHub Actions .github/workflows/shadowreach-auto-release.yml examine les résultats CI sur le SHA exact de chaque PR et le dernier main. Une PR expérimentale, en conflit ou contenant du gameplay ne doit jamais être fusionnée automatiquement.

## Trois modes
Depuis Actions > SHADOWREACH AUTO-RELEASE > Run workflow :

- inspect (par défaut) : saisir le numéro de PR pour voir les blocages, sans fusion.
- publish : saisir le numéro de PR pour fusionner uniquement une PR sûre de documentation ou de style.css, après CI complète verte et vérifications de fraîcheur. Le clic sur publish constitue l'accord explicite pour cette PR.
- verify : comparer le site GitHub Pages aux fichiers index.html, style.css et game-4.js de main. Aucun changement du jeu.

Pour déclencher une fusion automatique après CI verte, ajouter volontairement à la PR le label auto-release-approved. Ce label ne contourne aucune condition de sécurité. Sans ce label, un passage automatique inspecte uniquement.

## Garde-fous imposés

- PR ouverte, non DRAFT, interne au dépôt, sans conflit et actualisée sur main.
- Aucune mention « DO NOT MERGE », « experimental », « ne pas fusionner », ni label de blocage.
- CI Phase 1 regression guard réussie sur le SHA exact ; autres checks terminés et verts.
- Fusion automatique limitée aux modifications dans README.md, docs/*.md et style.css, sans suppression ni renommage. Aucun JavaScript du jeu, aucune migration de sauvegarde, aucun HTML, aucune configuration CI, aucune économie, aucune progression, aucun Sanctuaire, aucune guerre de clans expérimentale.
- Nouveau contrôle du HEAD et de main immédiatement avant fusion, sans force-push.
- Aucune exécution du code de la PR dans un contexte qui possède des droits d'écriture.

## Après la fusion
GitHub Actions provoquant une fusion avec GITHUB_TOKEN n'entraîne pas forcément les événements automatiques push et GitHub Pages. Le contrôleur redemande donc explicitement le workflow phase-1-ci.yml sur main et une nouvelle construction GitHub Pages. S'il ne peut pas effectuer ces demandes (droits, configuration Pages), il signale ce blocage et ne prétend pas que la version est LIVE.

Une fois la construction Pages terminée, il compare les fichiers réellement servis à ceux de main avec une URL anti-cache. Une comparaison réussie constitue une preuve de correspondance des fichiers contrôlés, pas un remplacement des tests de gameplay Chromium/WebKit.

## Limites et coûts
Le workflow ne remplace pas le responsable technique : les modifications de gameplay, les PR #491 (clans), #470/#471 (Sanctuaire), les récompenses, coûts, sauvegardes, équilibrages et nouveaux scripts passent toujours par la revue et fusion habituelles, sans automatisme. Il n'achète aucun service et ne crée aucun secret, mais utilise le quota GitHub Actions existant.

Le résultat complet est consultable dans le résumé de chaque exécution, afin de distinguer TESTÉ, FUSIONNÉ, BUILD DEMANDÉ et LIVE CONFIRMÉ.
