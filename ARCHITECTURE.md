# Architecture du backend Express + SQLite

## Vue d'ensemble

Ce projet est un backend Node.js base sur **Express** et **SQLite** via **sql.js**. Il expose une API HTTP sous `/api`, initialise automatiquement la base locale au demarrage, puis gere trois domaines metier principaux :

- la configuration des couleurs Kanban
- les **super couts** saisis lors de la fermeture d'un ticket
- les **couts de reouverture** calcules a partir du dernier super cout

L'architecture suit une separation simple en couches :

- **point d'entree** pour lancer le serveur
- **configuration** pour les variables d'environnement
- **application Express** pour les middlewares et le routage global
- **base de donnees** pour l'initialisation, la persistance et le schema SQLite
- **features** pour la logique metier
- **scripts** pour les operations d'initialisation manuelle

## Stack technique

- **Node.js** en CommonJS
- **Express 5** pour le serveur HTTP
- **SQLite** embarque via **sql.js**
- **dotenv** pour la configuration par environnement
- **cors** pour l'acces cross-origin

## Points d'entree

Le backend possede deux entrees principales :

1. `index.js` : point d'entree racine, qui charge le serveur
2. `src/server.js` : initialise la base SQLite puis demarre Express

### Chaine de demarrage

- `index.js` importe `src/server.js`
- `src/server.js` charge les variables d'environnement, initialise la base, puis appelle `app.listen()`
- `src/app.js` configure les middlewares, la route `/api` et les gestionnaires d'erreur

## Organisation de `src`

## `src/config`

La configuration runtime est centralisee dans `src/config/env.js`.

Ce module expose :

- `databaseFile` : chemin du fichier SQLite persistant
- `nodeEnv` : environnement d'execution
- `port` : port HTTP du serveur

Les valeurs peuvent provenir des variables d'environnement :

- `SQLITE_DATABASE_FILE`
- `NODE_ENV`
- `PORT`

## `src/database`

Cette couche gere le moteur SQLite, le chargement du fichier local et le schema initial.

### `src/database/database.js`

Responsabilites principales :

- charger le moteur `sql.js`
- creer le repertoire de stockage si besoin
- ouvrir la base depuis le fichier existant ou creer une base neuve
- initialiser le schema
- persister la base sur disque
- exposer l'instance SQLite courante

Fonctions cles :

- `initializeDatabase()`
- `getDatabase()`
- `persistDatabase()`

### `src/database/schema.js`

Ce module definit le schema et les donnees de depart.

Il cree notamment :

- `kanban_colors`
- `kanban_settings`
- `couts`

La table `couts` centralise maintenant tous les couts locaux de l'application, au lieu de multiplier les tables dediees.

Ce module gere aussi :

- les migrations simples, par exemple l'ajout de la colonne `title_mg`
- la suppression des anciennes tables `super_couts` et `reouverture_couts`
- le seed des couleurs Kanban par defaut
- le seed de la langue par defaut (`fr`)

## `src/features`

Les fonctionnalites metier sont isolees dans `src/features`.

### `features/kanbanColors`

Cette feature gere la configuration Kanban : couleurs, libelles et langue active.

#### `kanbanColors.constants.js`

Contient les contraintes metier :

- statuts autorises : `new`, `inProgress`, `done`
- langues autorisees : `fr`, `mg`
- format de couleur attendu : hexadecimal `#RRGGBB`

#### `kanbanColors.routes.js`

Definit les endpoints Express de la ressource Kanban :

- `GET /api/kanban-colors`
- `PUT /api/kanban-colors`
- `PUT /api/kanban-colors/:statusKey`

#### `kanbanColors.controller.js`

Role de couche HTTP :

- lire les parametres de requete et le body
- appeler la couche service
- renvoyer les reponses JSON

#### `kanbanColors.service.js`

Role metier :

- valider les entrees
- controler les statuts et la langue autorises
- verifier le format des couleurs
- preparer les donnees avant persistance

#### `kanbanColors.repository.js`

Role acces aux donnees :

- lire les colonnes Kanban depuis SQLite
- lire et mettre a jour la langue active
- mettre a jour une colonne ou la configuration complete
- persister les changements apres ecriture

### `features/couts`

Cette feature gere les couts complementaires stockes localement dans SQLite. Elle couvre :

- le **super cout** saisi lors du passage d'un ticket vers `done`
- le **cout de reouverture**, calcule a partir du dernier super cout du ticket
- l'annulation du dernier groupe de super cout saisi
- la lecture de tous les couts pour alimenter les pages de synthese

Le choix d'architecture retenu est de stocker tous ces couts dans une seule table `couts`, differencies par `type_cout`.

#### `couts.constants.js`

Contient les types de cout reconnus :

- `Cout saisi`
- `Reouverture`

#### `couts.routes.js`

Definit les endpoints Express de la ressource couts :

- `GET /api/couts`
- `POST /api/couts/saisie`
- `POST /api/couts/reouverture`
- `DELETE /api/couts/saisie/dernier/:ticketId`

#### `couts.controller.js`

Role de couche HTTP :

- lire les donnees du body ou des parametres
- appeler la couche service
- renvoyer les reponses JSON

Les creations utilisent un code `201`, tandis que la lecture et la suppression renvoient `200`.

#### `couts.service.js`

Role metier :

- valider `ticketId`, `group`, `items`, `cout` et `pourcentage`
- repartir un super cout sur tous les items lies a un ticket
- retrouver le dernier groupe de lignes `Cout saisi` d'un ticket
- calculer un cout de reouverture en appliquant un pourcentage sur ce dernier groupe
- annuler le dernier groupe de super cout si besoin

La logique importante est la suivante :

1. un super cout saisi est reparti sur tous les items lies au ticket
2. chaque insertion cree plusieurs lignes partageant le meme champ `"group"`
3. une reouverture ne repart pas de zero : elle reutilise le dernier groupe `Cout saisi`
4. l'annulation supprime uniquement le dernier groupe correspondant

#### `couts.repository.js`

Role acces aux donnees :

- lire les lignes de `couts`
- inserer plusieurs lignes d'un meme groupe
- retrouver le dernier groupe par `ticketId` et `typeCout`
- supprimer le dernier groupe
- purger toute la table lors d'un reset

Le champ `"group"` sert a rattacher plusieurs lignes a une meme operation utilisateur.

### `features/reset`

Cette feature gere la reinitialisation des donnees locales du backend.

Elle peut notamment supprimer les couts SQLite via `DELETE /api/reset/couts`.

## `src/routes`

`src/routes/index.js` agrege les routes de l'API.

Il expose :

- `GET /api/health` pour verifier que le serveur repond
- `/api/kanban-colors` pour la configuration Kanban
- `/api/couts` pour les super couts et couts de reouverture
- `/api/reset` pour les operations de reinitialisation

## `src/scripts`

Les scripts contiennent les operations d'administration ou d'initialisation.

### `src/scripts/initDatabase.js`

Ce script permet d'initialiser explicitement la base SQLite en dehors du demarrage normal du serveur.

Il :

- charge les variables d'environnement
- initialise la base
- force la persistance du fichier SQLite
- affiche le chemin du fichier genere

## Flux de demarrage

Le demarrage complet suit ce scenario :

1. `dotenv` charge l'environnement
2. `initializeDatabase()` cree ou charge la base SQLite
3. `initializeSchema()` applique le schema et les valeurs par defaut
4. `persistDatabase()` ecrit la base sur disque
5. `app.listen()` demarre le serveur Express

## Flux de requete

Pour une requete metier typique :

1. la requete arrive sur Express
2. `src/app.js` applique `cors()` et `express.json()`
3. le routeur principal delegue vers la feature concernee
4. le controller extrait les donnees HTTP
5. le service valide les regles metier
6. le repository lit ou ecrit dans SQLite
7. la reponse JSON repart vers le client

### Exemple : saisie d'un super cout

1. le client appelle `POST /api/couts/saisie`
2. le controller transmet `ticketId`, `cout`, `items` et `group`
3. le service valide la charge utile
4. le service calcule `cout / nombre d'items`
5. le repository insere une ligne par item dans `couts`
6. la base est persistee
7. les lignes creees sont renvoyees au client

### Exemple : creation d'un cout de reouverture

1. le client appelle `POST /api/couts/reouverture`
2. le service retrouve le dernier groupe `Cout saisi` du ticket
3. il applique le pourcentage de reouverture sur chaque ligne du groupe
4. le repository enregistre un nouveau groupe de type `Reouverture`
5. la reponse revient au client

## Gestion des erreurs

`src/app.js` definit deux niveaux de gestion :

- un handler `404` pour les routes inconnues
- un handler d'erreur global qui renvoie un statut adapte et un message JSON

Les erreurs metier peuvent porter un `statusCode`, par exemple `400` pour une validation invalide.

## Donnees et persistance

La base est stockee dans un fichier local, par defaut :

- `data/app.sqlite`

Le fichier peut etre remplace via `SQLITE_DATABASE_FILE`.

Le fonctionnement retenu est le suivant :

- la base est chargee en memoire au demarrage
- chaque ecriture importante appelle `persistDatabase()`
- le fichier SQLite reste la source de verite entre deux redemarrages

La table `couts` sert de source de verite pour :

- les super couts saisis manuellement
- les couts de reouverture derives d'un pourcentage
- les annulations du dernier groupe de super cout

## Conventions d'architecture

- garder le point d'entree minimal
- centraliser les variables d'environnement dans `src/config`
- isoler la logique HTTP dans les controllers
- isoler les regles metier dans les services
- reserver le repository a l'acces SQLite
- persister explicitement la base apres modification
- valider les donnees avant toute ecriture

## Resume

Le backend repose sur une architecture modulaire simple et lisible : Express gere le transport HTTP, SQLite stocke l'etat, et les features `kanbanColors`, `couts` et `reset` encapsulent chacune leur logique. L'ajout des super couts et des couts de reouverture s'integre naturellement dans cette structure grace a une separation claire entre routes, controllers, services et repository.
