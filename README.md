# OpenData Dashboard

Application web full-stack d'exploration de données Open Data. Elle permet
d'importer des fichiers CSV ou JSON, de gérer des datasets et d'explorer leurs
données avec des filtres, des statistiques et des graphiques.

## Fonctionnalités

- Inscription et connexion avec authentification JWT.
- Gestion des profils et espace d'administration.
- Import de fichiers CSV et JSON et stockage des datasets dans MongoDB.
- Recherche, tri, filtres, aperçu des données et exports.
- Visualisations en barres, courbes, secteurs et histogrammes, avec statistiques
  descriptives sur les colonnes numériques.
- Archivage, restauration et suppression des datasets.
- Contrôle d'accès appliqué par le backend : les utilisateurs gèrent leurs
  propres datasets et les administrateurs peuvent tous les gérer. Les datasets
  sans propriétaire ne sont pas exposés aux utilisateurs ordinaires.
- Recherche de jeux de données publics sur data.gouv.fr.

Les fichiers Excel ne sont pas pris en charge actuellement.

## Technologies

| Partie | Technologies |
| --- | --- |
| Frontend | React 19, Vite, Redux Toolkit, React Router, Tailwind CSS, Chart.js |
| Backend | Java 17, Spring Boot 3.2.5, Spring Security, Spring Data MongoDB |
| Sécurité | JWT, validation des entrées, contrôle des rôles et des propriétaires |
| Base de données | MongoDB |

## Structure du depot

```text
.
├── frontend/          # Application React/Vite
└── Projet-Federateur/ # API REST Spring Boot
```

## Prerequis

- Java 17.
- Node.js et npm.
- MongoDB démarré localement ou accessible via une URI.

## Configuration et demarrage

Le backend utilise `MONGODB_URI` pour MongoDB et `JWT_SECRET` pour signer les
tokens. La clé JWT doit contenir au moins 64 octets UTF-8. Conservez la même clé
entre les redémarrages ; la remplacer invalide les tokens déjà émis.

Sous PowerShell, depuis `Projet-Federateur/` :

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017/dashboarddb"
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
$env:ADMIN_EMAIL = "admin@opendata.tn"
$adminPassword = Read-Host "Mot de passe du compte administrateur initial" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $adminPassword).Password
.\mvnw.cmd spring-boot:run
```

`ADMIN_PASSWORD` est nécessaire lors de la création initiale du compte
administrateur. La clé JWT générée ci-dessus est propre à la session PowerShell :
pour un environnement persistant, stockez-la dans un gestionnaire de secrets
local et réutilisez-la. Ne l'ajoutez jamais au dépôt.

Dans un second terminal, depuis `frontend/` :

```powershell
npm install
npm run dev
```

Vite transmet les requêtes `/api` au backend sur `http://localhost:8080` par
défaut. Pour utiliser une autre origine, configurez `VITE_BACKEND_URL` pour le
proxy de développement. `VITE_API_URL` ne doit être défini que si le navigateur
appelle directement une API ; dans ce cas, configurez aussi les origines CORS
autorisées côté backend. Le fichier `frontend/.env.example` donne un exemple
sans secret.

## Tests et vérification

Frontend, depuis `frontend/` :

```powershell
npm test -- --runInBand
npm run lint
npm run build
```

Backend, depuis `Projet-Federateur/` : les tests d'intégration suppriment les
données de leurs repositories avant chaque scénario. Utilisez donc une base de
test dédiée et jamais votre base de développement ou de production.

```powershell
$testDatabase = "opendata_dashboard_test_$([guid]::NewGuid().ToString('N'))"
.\mvnw.cmd "-Dspring.data.mongodb.uri=mongodb://localhost:27017/$testDatabase" test
```

## Sécurité et données

- Ne versionnez jamais `.env`, des clés privées, des mots de passe ou des
  identifiants de production.
- Les fichiers de configuration sensibles doivent être fournis par
  l'environnement d'exécution.
- Les tests backend doivent toujours viser une base MongoDB isolée.
- Les données des datasets sont conservées dans MongoDB ; aucun jeu de données
  fictif n'est utilisé comme résultat de l'API.
