
# HomeVision Smart Dashboard

Tableau de bord intelligent pour le suivi de l'énergie (Solaire, Batterie Victron, Tesla) et des capteurs domestiques.

## Fonctionnalités

- **Energy Center** : Monitoring en temps réel (Grille, Solaire, Batterie).
- **Détails de consommation** : Répartition Maison vs Annexe.
- **Widget Tesla** : État de la batterie, autonomie et charge.
- **Analyse IA** : Détection d'anomalies via Genkit.
- **Mode Simulation** : Pour tester l'interface sans connexion réelle.

## Déploiement sur GitHub

Pour envoyer ce code sur votre compte GitHub `jarvis5976/HomeVision`, suivez ces étapes :

1. **Créez un dépôt sur GitHub** : Allez sur [github.com/new](https://github.com/new) et créez un nouveau dépôt nommé `HomeVision`.
2. **Ouvrez votre terminal** dans le dossier de ce projet.
3. **Initialisez Git et envoyez le code** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit: HomeVision Dashboard"
   git branch -M main
   git remote add origin https://github.com/jarvis5976/HomeVision.git
   git push -u origin main
   ```

## Note importante sur les données réelles
L'application tente de contacter un endpoint local (`192.168.0.3`). 
Si vous hébergez cette application sur GitHub Pages ou un service Cloud (**HTTPS**), le navigateur bloquera par défaut les requêtes vers l'IP locale en **HTTP** (Erreur Mixed Content). 

**Solutions possibles :**
1. Utiliser un tunnel sécurisé (type Cloudflare Tunnel ou ngrok) pour exposer votre API locale en HTTPS.
2. Configurer votre navigateur pour autoriser le "contenu non sécurisé" sur votre domaine de déploiement.
3. Utiliser le mode **Simulation** pour la démonstration.
