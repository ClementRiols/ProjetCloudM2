# Retrouvéo - site des objets perdus/trouvés

## 1) Architecture & rôles des composants

### Structure simplifiée du projet 
- `infra/`
  - `docker-compose.yml` : démarre **LocalStack** (AWS local) sur le port `4566`
  - `localstack/`
    - `main.tf` : **création des ressources** via OpenTofu/Terraform
    - `output.tf` : sorties utiles (ex. URL de la file SQS)
- `lambdas/`
  - `create-annonce/`
    - `create-annonce.zip` : **package Lambda** déjà prêt à déployer
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
- Table : `Annonces`
- Clé de partition (HASH) : `pk` (String)
- Clé de tri (RANGE) : `sk` (String)
- Mode : `PAY_PER_REQUEST`

**3) SQS**
- File : `annonce-events`

### Lambda (déploiement manuel)
Une fois les ressources créées :
- on **déploie manuellement** la Lambda depuis le zip existant :
  - `lambdas/create-annonce/create-annonce.zip`
- la fonction Lambda s’appelle :
  - `create-annonce`
- elle sert à **implémenter l’interface (endpoint côté logique)** pour créer une annonce (validation + écriture dans les ressources).

---

## 2) Première exécution (setup complet depuis un clone)

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
tofu output -json > output.json                   

### Étape D — Vérifier que les 3 ressources existent
Exécuter les commandes suivantes:

docker run --rm --network infra_default -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 amazon/aws-cli:2.15.40 s3api list-buckets --endpoint-url http://localstack:4566

docker run --rm --network infra_default -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 amazon/aws-cli:2.15.40 dynamodb list-tables --endpoint-url http://localstack:4566

docker run --rm --network infra_default -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 amazon/aws-cli:2.15.40 sqs list-queues --endpoint-url http://localstack:4566 --output json

Résultats attendus :

S3 : bucket lostfound-images

DynamoDB : table Annonces

SQS : file annonce-events

### Étape E — Déployer la Lambda (à partir du zip existant)
On utilise le zip déjà présent : lambdas/create-annonce/create-annonce.zip

Objectif : déployer la fonction create-annonce pour activer l’interface de création d’annonce.

#### 1.Vérifier que le zip est bien présent en local (Windows / PowerShell):

cd ProjetCloudM2
dir .\lambdas\create-annonce\create-annonce.zip

#### 2.Créer le rôle IAM lambda-role (si nécessaire):

LocalStack a besoin d’un rôle IAM pour créer la Lambda.
Si le rôle existe déjà, la création renverra une erreur (ce n’est pas bloquant), sinon il sera créé.

-Générer le fichier de trust policy :

cd ProjetCloudM2

@'
{
  "Version": "2012-10-17",
  "Statement": [{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]
}
'@ | Out-File -Encoding ascii .\trust.json

-Créer le rôle dans LocalStack :

docker run --rm --network infra_default `
  -v "${PWD}:/workspace" `
  -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 `
  amazon/aws-cli:2.15.40 iam create-role `
  --role-name lambda-role `
  --assume-role-policy-document file:///workspace/trust.json `
  --endpoint-url http://localstack:4566

#### 3.Vérifier si la Lambda existe déjà

docker run --rm --network infra_default `
  -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 `
  amazon/aws-cli:2.15.40 lambda get-function `
  --function-name create-annonce `
  --endpoint-url http://localstack:4566

#### 4A.Si vous obtenez ResourceNotFoundException → la fonction n’existe pas : créez-la

cd ProjetCloudM2

docker run --rm --network infra_default `
  -v "${PWD}:/workspace" `
  -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 `
  amazon/aws-cli:2.15.40 lambda create-function `
  --function-name create-annonce `
  --runtime nodejs18.x `
  --handler index.handler `
  --role arn:aws:iam::000000000000:role/lambda-role `
  --zip-file fileb:///workspace/lambdas/create-annonce/create-annonce.zip `
  --endpoint-url http://localstack:4566

#### 4B.Si la fonction existe déjà → mettez-la à jour

À utiliser quand vous avez un nouveau create-annonce.zip (nouveau build), sans recréer la fonction.

docker run --rm --network infra_default `
  -v "${PWD}:/workspace" `
  -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 `
  amazon/aws-cli:2.15.40 lambda update-function-code `
  --function-name create-annonce `
  --zip-file fileb:///workspace/lambdas/create-annonce/create-annonce.zip `
  --endpoint-url http://localstack:4566

#### 5.Attendre que la Lambda soit active

La commande est silencieuse en cas de succès (pas de sortie).

Une fois la Lambda déployée et active, elle peut être appelée

docker run --rm --network infra_default `
  -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_DEFAULT_REGION=us-east-1 `
  amazon/aws-cli:2.15.40 lambda wait function-active-v2 `
  --function-name create-annonce `
  --endpoint-url http://localstack:4566

### Étape F - Lancer Frontend et Backend
-Frontend: cd app/frontend || npm i || npm start

-Backend: cd app/backend-node || npm i || npm run dev