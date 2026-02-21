# HomeVision Smart Dashboard

Tableau de bord intelligent pour le suivi de l'énergie (Solaire, Batterie Victron, Tesla) et des capteurs domestiques.

## Fonctionnalités

- **Energy Center** : Monitoring en temps réel (Grille, Solaire, Batterie).
- **Détails de consommation** : Répartition Maison vs Annexe (Chauffage, Cumulus).
- **Widget Tesla** : État de la batterie, autonomie, température et charge (Modèle Y).
- **Mode Simulation/Réel** : Basculez entre des données simulées et votre endpoint local.

## Fix "Access Denied" on GitHub Actions

Si vous voyez l'erreur `requested access to the resource is denied` dans vos GitHub Actions, c'est que vous n'avez pas encore ajouté vos identifiants Docker Hub à votre dépôt GitHub.

1. Allez sur votre dépôt GitHub : `jarvis5976/HomeVision`
2. Cliquez sur **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret** et ajoutez :
   - `DOCKERHUB_USERNAME` : Votre nom d'utilisateur Docker Hub (ex: `jarvis5976`)
   - `DOCKERHUB_TOKEN` : Votre jeton d'accès Docker Hub (créé dans Docker Hub > Account Settings > Security)

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
L'application tente de contacter `http://192.168.0.3`. Si vous hébergez cette application en HTTPS (GitHub Pages, Vercel, etc.), le navigateur bloquera la requête par défaut ("Mixed Content"). 

**Solution :**
Autorisez le "contenu non sécurisé" dans les paramètres de votre navigateur pour l'URL de votre tableau de bord.
