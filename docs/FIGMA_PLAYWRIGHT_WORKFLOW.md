# Shadowreach : Figma + Playwright (outillage de développement)

Ce dossier prépare la **revue graphique**, séparément du jeu en production et de la CI historique. Aucune mécanique, économie, sauvegarde ou route n'est changée par cette intégration.

## État confirmé au moment de l'installation

- Playwright est **déjà installé** via `package.json` et `package-lock.json`.
- L'ancienne CI obligatoire reste `.github/workflows/phase-1-ci.yml` : **ne pas la remplacer ni affaiblir**.
- Configuration existante : `tests/playwright.config.js` (Chromium desktop et WebKit iPhone).
- Figma (fichier de fondations) : https://www.figma.com/design/tujxGRidrSHDA9ogbon9aB
- Palette de départ : les **41 couleurs** présentes dans la première règle `:root` de `style.css`. Les styles ajoutés dynamiquement au lancement peuvent modifier l'apparence réelle.

## Captures UI sans toucher aux sauvegardes réelles

1. Sur GitHub : **Actions** → **Shadowreach - captures UI pour Figma** → **Run workflow**.
2. Récupérer l'artefact `shadowreach-design-review-<SHA>` après l'exécution.
3. Les captures PNG montrent **Accueil, Équipement, Paramètres**, séparément sur Chromium desktop et WebKit iPhone. Un échec produit des diagnostics de test plutôt qu'une fausse confirmation.
4. Utiliser les images comme **références visuelles** dans Figma. Ce workflow ne publie pas d'assets et n'importe pas automatiquement les écrans dans Figma.

Localement, depuis la racine du dépôt (Node 22, Python 3 et Playwright disponibles) :

```bash
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install chromium webkit
npx playwright test -c tests/playwright.visual.config.js
```

La suite manuelle `tests/visual-review.spec.js` reste volontairement **hors** du sélectionneur de tests obligatoires `tests/spec-kind.js` : elle complète les tests existants sans multiplier le temps de la CI de chaque PR.

## Couleurs / variables Figma

- Source de vérité **du socle de couleurs** : `style.css`, première règle `:root`.
- Export suivi dans Git : `design/shadowreach-tokens.json`.
- Script sans dépendance : `node scripts/export-design-tokens.js`.
- Vérification d'absence de dérive : `node scripts/export-design-tokens.js --check`.
- Le fichier Figma ci-dessus dispose de la collection de variables **Shadowreach / CSS base palette**, avec les mêmes noms CSS et leur syntaxe Web `var(--...)`.
- Après chaque modification volontaire de la palette CSS : relancer l'export, vérifier le diff et **mettre à jour les variables Figma**. Le lien est documenté, mais **la synchronisation GitHub ↔ Figma n'est pas automatique**.
- Les 41 couleurs ne sont **pas** un design system complet : pas de typographie, de composants, d'animations ni d'overrides runtime capturés par ce seul export.

## Principes avant d'intégrer une maquette

1. Consulter `AGENTS.md`, `ARCHITECTURE.md` et les PR en cours pour identifier les propriétaires de l'UI.
2. Travailler sur une **branche dédiée**, conserver `index.html`, `style.css` et les scripts du jeu intacts tant qu'une maquette n'est pas validée.
3. Une maquette Figma ne remplace **pas** un comportement réel. Implémenter ensuite chez le propriétaire canonique, pas dans une couche de surcharge.
4. Garder la CI de régression existante comme gate de publication. Valider le rendu sur mobile, le stockage local et les parcours majeurs avant fusion.
5. Ne jamais importer de sauvegardes réelles ni laisser des données personnelles dans les artefacts ou fichiers Figma.

## Limites

Les captures de ce workflow sont une **vérification visuelle à la demande**, pas une preuve de conformité pixel-perfect ou une génération automatique de graphismes. Les couleurs peuvent différer du rendu final à cause des overrides `premium-ui-v209.js` et d'autres sources chargées après `style.css`.
