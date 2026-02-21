# HomeVision Smart Dashboard

Tableau de bord intelligent pour le suivi de l'énergie (Solaire, Batterie Victron, Tesla) et des capteurs domestiques.

## 🚨 Fix "Access Denied" on GitHub Actions

Si vous voyez l'erreur `requested access to the resource is denied` dans vos GitHub Actions, c'est que vous n'avez pas encore ajouté vos identifiants Docker Hub à votre dépôt GitHub. **C'est une étape obligatoire pour que GitHub puisse publier l'image sur votre compte Docker Hub.**

1. Allez sur votre dépôt GitHub : `https://github.com/jarvis5976/HomeVision`
2. Cliquez sur l'onglet **Settings** (en haut à droite).
3. Dans le menu de gauche, allez dans **Secrets and variables** > **Actions**.
4. Cliquez sur le bouton vert **New repository secret**.
5. Ajoutez les deux secrets suivants :
   - **Name:** `DOCKERHUB_USERNAME`  / **Value:** `jarvis5976`
   - **Name:** `DOCKERHUB_TOKEN`     / **Value:** (Votre jeton d'accès Docker Hub, généré dans Account Settings > Security sur Docker Hub)

Une fois ces secrets ajoutés, relancez l'action ou faites un nouveau "push" pour que le déploiement réussisse.

## Fonctionnalités

- **Energy Center** : Monitoring en temps réel (Grille, Solaire, Batterie).
- **Détails de consommation** : Répartition Maison vs Annexe (Chauffage, Cumulus).
- **Widget Tesla** : État de la batterie, autonomie, température et charge (Modèle Y).
- **Mode Simulation/Réel** : Basculez entre des données simulées et votre endpoint local via le bouton dans la barre latérale.

## Déploiement Docker (Local)

1. **Construire l'image** :
   ```bash
   docker build -t jarvis5976/home-vision:latest .
   ```
2. **Lancer le conteneur** :
   ```bash
   docker run -p 3000:3000 jarvis5976/home-vision:latest
   ```

## Note sur les données réelles (HTTPS vs HTTP)
L'application tente de contacter `http://192.168.0.3`. Si vous hébergez cette application en HTTPS (Vercel, GitHub Pages, etc.), le navigateur bloquera la requête par défaut ("Mixed Content"). 

**Solution :**
Autorisez le "contenu non sécurisé" dans les paramètres de votre navigateur pour l'URL de votre tableau de bord HomeVision.
