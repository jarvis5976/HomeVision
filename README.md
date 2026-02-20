# HomeSense Smart Dashboard

Tableau de bord intelligent pour le suivi de l'énergie (Solaire, Batterie Victron, Tesla) et des capteurs domestiques.

## Fonctionnalités

- **Energy Center** : Monitoring en temps réel (Grille, Solaire, Batterie).
- **Détails de consommation** : Répartition Maison vs Annexe.
- **Widget Tesla** : État de la batterie, autonomie et charge.
- **Analyse IA** : Détection d'anomalies via Genkit.
- **Mode Simulation** : Pour tester l'interface sans connexion réelle.

## Déploiement sur GitHub

Pour envoyer ce code sur votre compte GitHub :

1. Créez un nouveau dépôt vide sur GitHub.
2. Ouvrez votre terminal dans le dossier du projet.
3. Exécutez les commandes suivantes :

```bash
git init
git add .
git commit -m "Initial commit: HomeSense Dashboard"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/VOTRE_DEPOT.git
git push -u origin main
```

## Note importante sur les données réelles
L'application tente de contacter un endpoint local (`192.168.0.3`). 
Si vous hébergez cette application sur une URL sécurisée (**HTTPS**), le navigateur bloquera les requêtes vers l'IP locale en **HTTP** (Mixed Content Error). 

Pour utiliser les données réelles en ligne, vous devrez :
1. Soit sécuriser votre serveur local avec un certificat SSL (**HTTPS**).
2. Soit utiliser un tunnel (type Cloudflare Tunnel ou ngrok) pour exposer votre API locale en HTTPS.
