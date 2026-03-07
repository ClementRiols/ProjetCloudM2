# Retrouvéo - site des objets perdus/trouvés

## À propos du site

**Retrouvéo** est un site de **signalement d’objets perdus et trouvés**.  
Les utilisateurs peuvent **créer une annonce** (perdu/trouvé) avec un titre, une description, un lieu, une date et, si besoin, une **image**, puis **consulter la liste des annonces** pour faciliter la restitution des objets.  
Un système de **connexion/inscription** permet d’accéder aux fonctionnalités principales du site.

## 1) Architecture & Configuration

### Structure simplifiée du projet 
- `infra/`
  - `docker-compose.yml` : démarre **LocalStack** (AWS local) sur le port `4566`
  - `localstack/`
    - `main.tf` : **création des ressources** via OpenTofu/Terraform
    - `output.tf` : sorties utiles (ex. URL de la file SQS)
- `lambdas/`
  - `create-annonce/`
    - `create-annonce.zip` : **package Lambda** 
- `app/` (front/back de l’application)
  - l’API de l’application appelle les services AWS locaux (ou la Lambda) via LocalStack

### LocalStack (configuration des services AWS locaux)
LocalStack émule des services AWS en local. Dans ce projet, on utilise :
- **S3** (stockage d’images)
- **DynamoDB** (stockage des annonces)
- **SQS** (événements / messages)
- **Lambda** + **IAM/STS** (exécution et rôle Lambda)

LocalStack est exposé en local :
- Endpoint : `http://localhost:4566`

### OpenTofu / Terraform (création des ressources via `infra/localstack/main.tf`)
Dans `main.tf`, on crée précisément :

**1) S3**
- Bucket : `lostfound-images`
- Configuration CORS sur le bucket :
  - Origins autorisées : `http://localhost:3000`, `http://localhost:3001`
  - Méthodes : `GET`, `PUT`, `POST`, `HEAD`
  - Headers : `*`
  - Expose : `ETag`
  - `MaxAgeSeconds = 3000`

**2) DynamoDB**
- Table : `Users`
- Table : `Annonces`


**3) SQS**
- File : `annonce-events`

**4)IAM + Lambda**
- Role : `lambda-role`
- Lambda : `create-annonce`

### Backend(Nodejs)

### Frontend(React)
---

## 2) Déroulement du projet

### Fonctionalités réaliées

- Inscription
- Connexion (JWT)
- Création d'une annonce
- Affichage de la liste des annonces
- Clôturer une annonce en modifiant l'état de l'annonce

### Chaîne d’exécution (Front → Back → LocalStack / Lambda)

Le fonctionnement global peut se résumer ainsi :

- **Front-end** → appelle une **API du back-end** (via `fetch`).
- **Back-end** → selon la fonctionnalité :
  - soit il **accède directement à LocalStack** via l’**AWS SDK** (ex. lecture des données, authentification/connexion),
  - soit il **invoke une Lambda** (ex. création d’une annonce).
- **Lambda** (si utilisée) → exécute la logique métier puis **écrit dans DynamoDB** et/ou **publie un événement dans SQS**.
---

## 3) Première exécution (setup complet depuis un clone)

### Étape A — Récupérer le projet
git clone <URL_DU_DEPOT>
cd ProjetCloudM2

### Étape B — Démarrer LocalStack
cd infra
docker compose up -d
docker compose ps

### Étape C — Créer les ressources avec OpenTofu (main.tf)
cd localstack
tofu init
tofu apply -auto-approve
tofu output -json > output.json (optionel)              

### Étape D — Vérifier que les 3 ressources existent
Exécuter les commandes suivantes:

docker run --rm --network infra_default -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 amazon/aws-cli:2.15.40 s3api list-buckets --endpoint-url http://localstack:4566

docker run --rm --network infra_default -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 amazon/aws-cli:2.15.40 dynamodb list-tables --endpoint-url http://localstack:4566

docker run --rm --network infra_default -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 amazon/aws-cli:2.15.40 sqs list-queues --endpoint-url http://localstack:4566 --output json

Résultats attendus :

S3 : bucket lostfound-images

DynamoDB : table Annonces

SQS : file annonce-events

### Étape E - Lancer Frontend et Backend
-Frontend: cd app/frontend || npm i || npm start

-Backend: cd app/backend-node || npm i || npm run dev
---

## 4) Remarques

### S'il y a des modifications du lambda, on aura besoin de le rezipper et l'actualiser (zip et update)
- Command pour zipper le package lambda:
cd ProjetCloudM2

docker run --rm `
  -v "${PWD}:/workspace" `
  -w /workspace/lambdas/create-annonce `
  node:20-alpine sh -lc `
  "apk add --no-cache zip >/dev/null && npm install && npm run build:zip && ls -la && test -f create-annonce.zip"

- Command pour actualiser le déployement du lambda:
cd ProjetCloudM2

docker run --rm --network infra_default `
  -v "${PWD}:/workspace" `
  -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 `
  amazon/aws-cli:2.15.40 lambda update-function-code `
  --function-name create-annonce `
  --zip-file fileb:///workspace/lambdas/create-annonce/create-annonce.zip `
  --endpoint-url http://localstack:4566

