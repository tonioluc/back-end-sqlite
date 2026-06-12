# Architecture du backend Express + SQLite

## Vue d'ensemble

Ce projet est un backend Node.js basé sur **Express** et **SQLite** via **sql.js**. Il expose une API HTTP sous `/api`, initialise automatiquement la base locale au démarrage, puis orchestre la logique métier autour d'une feature principale : la configuration des couleurs Kanban.

L'architecture suit une séparation simple en couches :

- **point d'entrée** pour lancer le serveur
- **configuration** pour les variables d'environnement
- **application Express** pour les middlewares et le routage global
- **base de données** pour l'initialisation, la persistance et le schéma SQLite
- **features** pour la logique métier
- **scripts** pour les opérations d'initialisation manuelle

## Stack technique

- **Node.js** en CommonJS
- **Express 5** pour le serveur HTTP
- **SQLite** embarqué via **sql.js**
- **dotenv** pour la configuration par environnement
- **cors** pour l'accès cross-origin

## Points d'entrée

Le backend possède deux entrées principales :

1. `index.js` : point d'entrée racine, qui charge le serveur
2. `src/server.js` : initialise la base SQLite puis démarre Express

### Chaîne de démarrage

- `index.js` importe `src/server.js`
- `src/server.js` charge les variables d'environnement, initialise la base, puis appelle `app.listen()`
- `src/app.js` configure les middlewares, la route `/api` et les gestionnaires d'erreur

## Organisation de `src`

## `src/config`

La configuration runtime est centralisée dans `src/config/env.js`.

Ce module expose :

- `databaseFile` : chemin du fichier SQLite persistant
- `nodeEnv` : environnement d'exécution
- `port` : port HTTP du serveur

Les valeurs peuvent provenir des variables d'environnement :

- `SQLITE_DATABASE_FILE`
- `NODE_ENV`
- `PORT`

## `src/database`

Cette couche gère le moteur SQLite, le chargement du fichier local et le schéma initial.

### `src/database/database.js`

Responsabilités principales :

- charger le moteur `sql.js`
- créer le répertoire de stockage si besoin
- ouvrir la base depuis le fichier existant ou créer une base neuve
- initialiser le schéma
- persister la base sur disque
- exposer l'instance SQLite courante

Fonctions clés :

- `initializeDatabase()`
- `getDatabase()`
- `persistDatabase()`

### `src/database/schema.js`

Ce module définit le schéma et les données de départ.

Il crée notamment :

- `kanban_colors`
- `kanban_settings`

Il gère aussi :

- les migrations simples, par exemple l'ajout de la colonne `title_mg`
- le seed des couleurs Kanban par défaut
- le seed de la langue par défaut (`fr`)

## `src/features`

Les fonctionnalités métiers sont isolées dans `src/features`.

### `features/kanbanColors`

C'est la feature principale du backend actuel. Elle gère la configuration Kanban : couleurs, libellés et langue active.

#### `kanbanColors.constants.js`

Contient les contraintes métier :

- statuts autorisés : `new`, `inProgress`, `done`
- langues autorisées : `fr`, `mg`
- format de couleur attendu : hexadécimal `#RRGGBB`

#### `kanbanColors.routes.js`

Définit les endpoints Express de la ressource Kanban :

- `GET /api/kanban-colors`
- `PUT /api/kanban-colors`
- `PUT /api/kanban-colors/:statusKey`

#### `kanbanColors.controller.js`

Rôle de couche HTTP :

- lire les paramètres de requête et le body
- appeler la couche service
- renvoyer les réponses JSON

#### `kanbanColors.service.js`

Rôle métier :

- valider les entrées
- contrôler les statuts et la langue autorisés
- vérifier le format des couleurs
- préparer les données avant persistance

La validation est volontairement strictement centralisée ici pour éviter de dupliquer les règles entre les routes.

#### `kanbanColors.repository.js`

Rôle accès aux données :

- lire les colonnes Kanban depuis SQLite
- lire et mettre à jour la langue active
- mettre à jour une colonne ou la configuration complète
- persister les changements après écriture

Cette couche parle directement à l'instance SQLite retournée par `getDatabase()`.

## `src/routes`

`src/routes/index.js` agrège les routes de l'API.

Il expose :

- `GET /api/health` pour vérifier que le serveur répond
- `/api/kanban-colors` pour la configuration Kanban

Cette couche sert de routeur principal et conserve la hiérarchie d'URL au même endroit.

## `src/scripts`

Les scripts contiennent les opérations d'administration ou d'initialisation.

### `src/scripts/initDatabase.js`

Ce script permet d'initialiser explicitement la base SQLite en dehors du démarrage normal du serveur.

Il :

- charge les variables d'environnement
- initialise la base
- force la persistance du fichier SQLite
- affiche le chemin du fichier généré

## Flux de démarrage

Le démarrage complet suit ce scénario :

1. `dotenv` charge l'environnement
2. `initializeDatabase()` crée ou charge la base SQLite
3. `initializeSchema()` applique le schéma et les valeurs par défaut
4. `persistDatabase()` écrit la base sur disque
5. `app.listen()` démarre le serveur Express

## Flux de requête

Pour une requête métier typique :

1. la requête arrive sur Express
2. `src/app.js` applique `cors()` et `express.json()`
3. le routeur principal délègue vers la feature concernée
4. le controller extrait les données HTTP
5. le service valide les règles métier
6. le repository lit ou écrit dans SQLite
7. la réponse JSON repart vers le client

## Gestion des erreurs

`src/app.js` définit deux niveaux de gestion :

- un handler `404` pour les routes inconnues
- un handler d'erreur global qui renvoie un statut adapté et un message JSON

Les erreurs métier peuvent porter un `statusCode`, par exemple `400` pour une validation invalide.

## Données et persistance

La base est stockée dans un fichier local, par défaut :

- `data/app.sqlite`

Le fichier peut être remplacé via `SQLITE_DATABASE_FILE`.

Le fonctionnement retenu est le suivant :

- la base est chargée en mémoire au démarrage
- chaque écriture importante appelle `persistDatabase()`
- le fichier SQLite reste la source de vérité entre deux redémarrages

## Conventions d'architecture

- garder le point d'entrée minimal
- centraliser les variables d'environnement dans `src/config`
- isoler la logique HTTP dans les controllers
- isoler les règles métier dans les services
- réserver le repository à l'accès SQLite
- persister explicitement la base après modification
- valider les données avant toute écriture

## Résumé

Le backend repose sur une architecture modulaire simple et lisible : Express gère le transport HTTP, SQLite stocke l'état, et la feature `kanbanColors` concentre la logique métier actuelle. Cette séparation permet d'ajouter d'autres domaines métier sans remettre en cause la structure générale.