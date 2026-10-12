# OpenData Dashboard — frontend

Interface React/Vite pour importer et analyser des jeux de données enregistrés
par l'API Spring Boot. Les métriques et visualisations du dashboard sont calculées
à partir des réponses de l'API; aucun jeu fictif n'est injecté.

## Fonctionnalités

- Authentification JWT et gestion du profil.
- Import CSV et JSON, aperçu, sauvegarde persistante dans MongoDB.
- Recherche, filtrage par dimensions, tri et pagination des datasets.
- Visualisations filtrables et exports CSV, PNG et PDF.
- Archives MongoDB et recherche complémentaire de datasets sur data.gouv.fr.

Les fichiers Excel ne sont pas pris en charge pour le moment.

## Démarrage

```powershell
npm install
$env:VITE_API_URL = "http://localhost:8080/api"
npm run dev
```

Le backend doit être démarré et configuré avec MongoDB et une clé `JWT_SECRET`.
Voir le [`HELP.md` du backend](../Projet-Federateur/HELP.md) pour les variables
d'environnement obligatoires.

## Vérifications

```powershell
npm test -- --runInBand
npm run lint
npm run build
```
