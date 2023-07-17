<p align="center">
  <img src="./docs/llm-structurizer-page.png" alt="Main Page of Swagger Interface" />
</p>

# LLM-Structurizer

Ce projet fait partie d'un Travail de Bachelor réalisé à l'[HEIG-VD](https://heig-vd.ch/), dans la filière Informatique et systèmes de communication (ISC) par Lazar Pavicevic et supervisé par le Professeur Marcel Graf.

Le Travail de Bachelor est également composé d'une application web accessible sur ce repository :

#### [`✨ Structurizer`](https://github.com/Lazzzer/structurizer)

LLM-Structurizer est une API suivant la spécification [OpenAPI 3](https://swagger.io/specification/), qui propose des outils pour faciliter l'extraction et la structuration de données issues du langage naturel. L'API met à disposition deux catégories d'endpoints :

- Les `Parsers` : endpoints pour lire et récupérer le texte de certains types de fichiers comme les _pdf_, _csv_ ou les _docx_.
- Les `Structurizers`: endpoints pour manipuler et extraire des données structurées selon un format de sortie voulu comme le _json_ ou le _xml_.

L'API est au stade de _Proof of Concept_, elle propose actuellement la récupération du texte des fichiers pdf sans reconnaissance optique de caractères (OCR) avec `poppler-utils` et l'extraction de données au format json.

## Stack

- [Typescript](https://www.typescriptlang.org)
- [NestJS](https://docs.nestjs.com)
- [PostgreSQL](https://www.postgresql.org/docs/15/index.html)
- [Prisma](https://www.prisma.io/docs/getting-started)
- [LangChain](https://js.langchain.com/docs)

## LLMs utilisés

L'API a été principalement développée avec les modèles d'[OpenAI](https://platform.openai.com/docs/models) et fonctionne avec :

- `gpt-3.5-turbo`
- `gpt-3.5-turbo-16k`
- `gpt-4`

La communication avec les LLMs se fait avec la librairie [LangChain](https://js.langchain.com/docs). Une famille de modèles de langage supportée par la librairie peut être intégrée facilement au projet.

## Prérequis

- [NodeJS](https://nodejs.org/en/download/) >= version 16
- [NPM](https://docs.npmjs.com/getting-started) >= version 8
- [Poppler-utils](https://poppler.freedesktop.org/) disponible sur Ubuntu/Debian et macOS via Homebrew
- [PostgreSQL](https://www.postgresql.org/docs/15/index.html) version 15
- [Docker](https://docs.docker.com/get-started/)

#### Optionnel

- [Clé d'API OpenAI](https://platform.openai.com/account/api-keys) pour le lancement des tests unitaires

## Environnement de développement

### Clonage du repository

```bash
git clone git@github.com:Lazzzer/llm-structurizer.git
```

### Installation des dépendances

```bash
cd llm-structurizer
npm install
```

### Ajout des variables d'environnement

Créer un fichier `.env` à partir du fichier [.env.example](https://github.com/Lazzzer/llm-structurizer/blob/main/.env.example) et mettez-y vos valeurs.

Exemple:

```bash
NODE_ENV=development

# Valeurs à disposition: 'log, warn, error, debug, verbose'
LOG_LEVEL='debug, verbose'

# Format: postgresql://[POSTGRES_USER]:[POSTGRES_PASSWORD]@[DB_HOST]:[DB_PORT]/[DB_NAME]?schema=[DB_SCHEMA]&connect_timeout=300
DATABASE_URL=postgresql://postgres:root@localhost:5432/llm-structurizer?schema=public&connect_timeout=300

# Chemin de l'exécutable de poppler-utils
# Pour macOS: /opt/homebrew/bin
POPPLER_BIN_PATH=/usr/bin

# Optionnel, pour lancer les tests
OPENAI_API_KEY=sk-...
```

### Initialisation de la base de données

```bash
npx prisma db push

# Optionnel : seeding de la base de données pour avoir une clé d'API prête à l'emploi
npx prisma db seed
```

### Lancement du serveur de développement

> **Note**  
> La base de données doit être initialisée et accessible par le serveur de l'API.

```bash
npm run start:dev
```

Les liens suivants sont disponibles :

- [Interface Swagger](http://localhost:3000/api)
- [Schéma OpenAPI](http://localhost:3000/api-json)

### Lancement des tests

> **Note**  
> La clé d'API OpenAI doit figurer dans le fichier `.env`.

```bash
npm run test
```

## Environnement de production en local

> **Note**  
> Docker est nécessaire pour cette étape.

L'environnement de production se lance à l'aide de docker compose, dont un template est disponible dans le fichier [docker-compose.example.yml](https://github.com/Lazzzer/llm-structurizer/blob/main/docker-compose.example.yml). Il ne dépend pas de l'installation précédente.

Vous pouvez créer un nouveau fichier à partir du template ou tout simplement lancer directement cette dernière, toutes les variables d'environnement sont déjà configurées correctement.

### Création des images

```bash
cd llm-structurizer

# Ajoutez -f docker-compose.example.yml si vous utilisez le template
docker compose [-f docker-compose.example.yml] build
```

L'image du serveur se trouve dans le fichier [Dockerfile](https://github.com/Lazzzer/llm-structurizer/blob/main/Dockerfile), basée sur Debian 10 avec `poppler-utils` d'installé.

### Lancement des images

```bash
docker compose up
```

Il est préférable que la base de données soit initialisée avant de lancer l'image du serveur. Dans ce cas, vous pouvez lancer les commandes suivantes:

```bash
# Lancement de la base de données [en background s'il le faut]
docker compose up db [-d]

# Lancement de l'application
docker compose up app [-d]
```

### Lancement des migrations

Le serveur de l'API est initialisé, si ce dernier ne tourne pas en fond, ouvrez une nouvelle instance de votre terminal et lancer les commandes suivantes:

```bash
docker exec -it llm-structurizer-app npx prisma migrate deploy
docker exec -it llm-structurizer-app npx prisma db seed
```

La base de données reste accessible localement avec les valeurs présentes dans `DATABASE_URL`.

L'API est maintenant disponible sur les mêmes liens que précédemment :

- [Interface Swagger](http://localhost:3000/api)
- [Schéma OpenAPI](http://localhost:3000/api-json)

### Arrêt des images

```bash
docker compose down
```

## Considérations pour la mise en production

Le [Dockerfile](https://github.com/Lazzzer/llm-structurizer/blob/main/Dockerfile) avec ses variables d'environnement suffit pour avoir une API fonctionnelle.
L'image n'est actuellement pas dans un container registry.

Lors du premier déploiement, il faut s'assurer que la base de données associée ait bien reçu les migrations avec `npx prisma migrate deploy`. La commande peut se lancer depuis un container actif du serveur. Il est également possible de lancer la commande localement depuis la racine du projet, après avoir modifié la variable d'environnement `DATABASE_URL` avec la _connection string_ de la base de données de production.

Le déploiement du projet a été testé sur [App Platform](https://www.digitalocean.com/products/app-platform) de Digital Ocean.
