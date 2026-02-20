
# HomeVision Smart Dashboard

Tableau de bord intelligent pour le suivi de l'énergie (Solaire, Batterie Victron, Tesla) et des capteurs domestiques.

## Fonctionnalités

- **Energy Center** : Monitoring en temps réel (Grille, Solaire, Batterie).
- **Détails de consommation** : Répartition Maison vs Annexe.
- **Widget Tesla** : État de la batterie, autonomie et charge (Modèle Y).
- **Analyse IA** : Détection d'anomalies via Genkit.
- **Mode Simulation/Réel** : Basculez entre des données simulées et votre endpoint local.

## Déploiement Docker

Pour construire et lancer l'application avec Docker :

1. **Construire l'image** :
   ```bash
   docker build -t homevision .
   ```
2. **Lancer le conteneur** :
   ```bash
   docker run -p 3000:3000 homevision
   ```
L'application sera accessible sur `http://localhost:3000`.

## Déploiement sur GitHub

Pour envoyer ce code sur votre compte GitHub `jarvis5976/HomeVision` :

1. **Initialisez Git** :
   ```bash
   git init
   ```
2. **Ajoutez les fichiers** :
   ```bash
   git add .
   ```
3. **Créez le commit** :
   ```bash
   git commit -m "Initial commit: HomeVision Dashboard complete"
   ```
4. **Configurez le dépôt distant** :
   ```bash
   git branch -M main
   git remote add origin https://github.com/jarvis5976/HomeVision.git
   ```
5. **Envoyez le code** :
   ```bash
   git push -u origin main
   ```

## Note sur les données réelles (HTTP vs HTTPS)
L'application tente de contacter `http://192.168.0.3`. 
Si vous hébergez cette application sur GitHub (HTTPS), le navigateur bloquera la requête par défaut ("Mixed Content"). 

**Pour tester en réel :**
Configurez votre navigateur (Chrome/Edge) pour autoriser le "contenu non sécurisé" spécifiquement pour l'URL de votre déploiement.
# Test workflow
