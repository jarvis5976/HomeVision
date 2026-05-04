# HomeVision Smart Dashboard

Tableau de bord intelligent pour le suivi de l'énergie (Solaire, Batterie Victron, Tesla) et des capteurs domestiques.

## 🚨 Résoudre l'erreur Git "Authentication failed"

Si vous voyez l'erreur `Invalid username or token. Password authentication is not supported`, c'est que vous essayez d'utiliser votre mot de passe GitHub au lieu d'un jeton d'accès (token).

### 1. Générer un Token sur GitHub
1. Allez dans **Settings** (de votre compte, pas du dépôt) > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
2. Cliquez sur **Generate new token**.
3. Donnez un nom (ex: "HomeVision CLI"), cochez la case **repo**, et générez le token.
4. **Copiez le token immédiatement** (vous ne pourrez plus le voir).

### 2. Mettre à jour vos identifiants en local
Utilisez cette commande pour mettre à jour l'URL de votre dépôt avec votre nom d'utilisateur et votre nouveau token :
```bash
git remote set-url origin https://VOTRE_USERNAME:VOTRE_TOKEN@github.com/jarvis5976/HomeVision.git
```
Ensuite, réessayez votre `git push`.

## 🚨 Configuration GitHub Actions (Déploiement Docker)

Si l'erreur survient lors du déploiement automatique sur Docker Hub :

1. Allez sur votre dépôt GitHub : `https://github.com/jarvis5976/HomeVision`
2. Allez dans **Settings** > **Secrets and variables** > **Actions**.
3. Ajoutez les deux secrets suivants :
   - **Name:** `DOCKERHUB_USERNAME`  / **Value:** `jarvis5976`
   - **Name:** `DOCKERHUB_TOKEN`     / **Value:** (Votre jeton d'accès Docker Hub)

## Fonctionnalités

- **Energy Center** : Monitoring en temps réel via `instant_from_mqtt.php`.
- **Historique Global** : Utilisation de `totalStart` pour les compteurs cumulés.
- **Analyse Solaire** : Graphique de puissance par quart d'heure avec détection automatique des pics de production (icône soleil).
- **Tableau de bord filtrable** : Historique journalier avec filtres par année et par mois.

## Déploiement Local

1. **Construire** : `docker build -t jarvis5976/home-vision:latest .`
2. **Lancer** : `docker run -p 3000:3000 jarvis5976/home-vision:latest`
