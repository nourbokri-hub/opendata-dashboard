# OpenData Dashboard

**Plateforme web full-stack de gestion, d'exploration et de visualisation de données ouvertes (Open Data).**

OpenData Dashboard permet d'importer, d'organiser et d'analyser des jeux de données CSV et JSON à travers une interface moderne et intuitive.

L'application combine un frontend React, une API REST Spring Boot et une base MongoDB pour proposer une expérience d'analyse de données avec authentification, visualisations interactives et gestion sécurisée des accès.

### Technologies principales

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Security-JWT-8B5CF6?logo=jsonwebtokens&logoColor=white)

---

## Présentation du projet

Les données ouvertes sont disponibles dans de nombreux formats, mais leur exploration nécessite souvent plusieurs outils et manipulations.

**OpenData Dashboard** vise à simplifier ce processus en regroupant dans une même application :

- L'import et la gestion des jeux de données.
- L'exploration des enregistrements.
- La recherche, le tri et le filtrage.
- La création de graphiques interactifs.
- Le calcul de statistiques descriptives.
- L'export et l'archivage des datasets.
- La gestion sécurisée des utilisateurs.

Le projet a été développé dans un contexte académique afin de mettre en pratique le développement web full-stack, la conception d'API REST, la gestion de données et la sécurité applicative.

## Aperçu de l'application

L'interface utilise une identité visuelle lavande, violet doux et rose poudré, avec une navigation organisée autour des principales fonctionnalités d'analyse.

*Les captures d'écran de l'application seront ajoutées prochainement.*

## Fonctionnalités

### Authentification et utilisateurs

- Inscription et connexion sécurisées par JWT.
- Gestion du profil utilisateur.
- Espace d'administration.
- Contrôle des accès selon les rôles et les propriétaires des datasets.

### Gestion des datasets

- Import de fichiers CSV et JSON.
- Stockage des datasets dans MongoDB.
- Consultation et prévisualisation des données.
- Recherche, tri et filtres.
- Modification, archivage, restauration et suppression.
- Recherche de jeux de données publics sur data.gouv.fr.

### Analyse et visualisation

- Graphiques en barres.
- Graphiques en courbes.
- Diagrammes en secteurs.
- Histogrammes.
- Sélection des colonnes à analyser.
- Statistiques descriptives pour les colonnes numériques.
- Export des données et visualisations.

### Sécurité des données

Chaque utilisateur peut consulter et gérer uniquement ses propres datasets.

Les administrateurs disposent d'autorisations étendues pour gérer les datasets de tous les utilisateurs, y compris les datasets historiques sans propriétaire.

Les contrôles d'accès sont appliqués par le backend. Les ressources non autorisées ne sont pas exposées aux utilisateurs ordinaires.

**Limitation actuelle :** les fichiers Excel ne sont pas pris en charge.

---

## Architecture technique

L'application suit une architecture client-serveur organisée en trois couches.

```text
                 OpenData Dashboard
                         |
                         v
                 Frontend React
             (Vite, Redux Toolkit)
                         |
                    API REST
                         |
                         v
              Backend Spring Boot
            (Spring Security, JWT)
                         |
                         v
                      MongoDB
```

Le frontend assure l'interface et les interactions utilisateur.

Le backend expose les API REST, applique les règles métier, valide les requêtes et contrôle les autorisations.

MongoDB assure la persistance des utilisateurs et des datasets.

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, Vite, JavaScript |
| Interface | Tailwind CSS |
| Navigation | React Router |
| Gestion d'état | Redux Toolkit |
| Visualisation | Chart.js |
| Backend | Java 17, Spring Boot 3.2.5 |
| API | REST |
| Sécurité | Spring Security, JWT |
| Accès aux données | Spring Data MongoDB |
| Base de données | MongoDB |
| Tests | Jest, tests Spring Boot |
| Versionnement | Git, GitHub |

## Structure du projet

```text
opendata-dashboard/
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- store/
|   |   |-- utils/
|   |   `-- __tests__/
|   |-- package.json
|   `-- vite.config.js
|
|-- Projet-Federateur/
|   |-- src/
|   |   |-- main/
|   |   |   |-- java/
|   |   |   `-- resources/
|   |   `-- test/
|   |-- pom.xml
|   `-- mvnw.cmd
|
|-- .gitignore
`-- README.md
```

---

## Installation et démarrage

### 1. Prérequis

Assurez-vous d'avoir installé :

- Java 17
- Node.js et npm
- MongoDB
- Git

### 2. Cloner le dépôt

```bash
git clone https://github.com/nourbokri-hub/opendata-dashboard.git
cd opendata-dashboard
```

### 3. Configurer le backend

Ouvrir un terminal PowerShell :

```powershell
cd Projet-Federateur
```

Configurer les variables d'environnement :

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017/dashboarddb"
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
$env:ADMIN_EMAIL = "admin@opendata.tn"
$adminPassword = Read-Host "Mot de passe du compte administrateur initial" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $adminPassword).Password
```

Démarrer le backend :

```powershell
.\mvnw.cmd spring-boot:run
```

L'API démarre par défaut sur :

`http://localhost:8080`

**Important :** la clé JWT doit contenir au moins 64 octets UTF-8. Conservez la même clé entre les redémarrages pour maintenir la validité des sessions.

Le mot de passe administrateur est nécessaire lors de l'initialisation du compte. Ne stockez jamais de secrets dans le dépôt Git.

### 4. Démarrer le frontend

Dans un deuxième terminal PowerShell :

```powershell
cd frontend
npm install
npm run dev
```

Ouvrir l'adresse affichée par Vite, généralement :

`http://localhost:5173`

### 5. Configuration des API

En développement, Vite transmet par défaut les requêtes `/api` au backend sur `http://localhost:8080`.

Les variables suivantes peuvent être utilisées selon l'environnement :

| Variable | Utilisation |
|---|---|
| `MONGODB_URI` | Connexion MongoDB |
| `JWT_SECRET` | Signature des tokens JWT |
| `JWT_EXPIRATION` | Durée de validité des tokens |
| `ADMIN_EMAIL` | Adresse du compte administrateur initial |
| `ADMIN_PASSWORD` | Mot de passe administrateur initial |
| `ADMIN_NAME` | Nom affiché du compte administrateur |
| `VITE_BACKEND_URL` | Destination du proxy Vite |
| `VITE_API_URL` | URL de l'API appelée directement par le navigateur |

Un exemple de configuration frontend est disponible dans `frontend/.env.example`.

Si le navigateur appelle directement le backend, les origines CORS doivent également être configurées côté serveur.

---

## Tests et qualité du code

### Frontend

Depuis le dossier `frontend/` :

```powershell
npm test -- --runInBand
npm run lint
npm run build
```

Ces commandes permettent respectivement d'exécuter les tests, de vérifier le code et de générer le build de production.

### Backend

Les tests d'intégration utilisent MongoDB et peuvent supprimer les données de leurs collections de test.

**N'exécutez jamais ces tests sur une base contenant des données à conserver.**

Depuis `Projet-Federateur/`, utiliser une base dédiée :

```powershell
$testDatabase = "opendata_dashboard_test_$([guid]::NewGuid().ToString('N'))"
.\mvnw.cmd "-Dspring.data.mongodb.uri=mongodb://localhost:27017/$testDatabase" test
```

Le projet comprend des tests concernant notamment les autorisations, la validation des API et les opérations sur les datasets.

## Sécurité et bonnes pratiques

Les principales mesures mises en œuvre comprennent :

- Authentification basée sur JWT.
- Autorisation selon les rôles et la propriété des datasets.
- Validation des entrées côté backend.
- Limitation de la taille des requêtes.
- Gestion structurée des erreurs API.
- Protection des configurations sensibles par variables d'environnement.
- Isolation des bases utilisées pour les tests d'intégration.

Les fichiers `.env`, les mots de passe, les clés privées et les identifiants de production ne doivent jamais être versionnés.

## Perspectives d'amélioration

Le projet peut être enrichi progressivement avec :

- Une prise en charge des fichiers Excel.
- Des analyses statistiques plus avancées.
- De nouveaux types de visualisations.
- Des optimisations pour l'exploration de datasets volumineux.
- Des améliorations continues de l'interface et de l'expérience utilisateur.

Ces éléments constituent des pistes d'évolution et non des fonctionnalités déjà disponibles.

---

## Auteur

**Nour Bokri**

Étudiante en ingénierie informatique, spécialisée en Big Data et Intelligence Artificielle.

[GitHub](https://github.com/nourbokri-hub)

---

*Projet académique — Développement full-stack et exploration de données Open Data.*
