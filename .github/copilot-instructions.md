# Instructions Copilot pour Mediai

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## À propos du projet

Mediai est une plateforme médicale en ligne développée avec React.js et Vite. Elle comprend 4 modules principaux :

1. **Authentification** - Gestion des connexions et rôles (administrateur, médecin, patient, profils)
2. **Chat** - Messagerie en temps réel entre utilisateurs et IA médicale
3. **Consultation** - Gestion des rendez-vous et des fiches médicales
4. **Tableau de bord** - Affichage des statistiques et suivi de l'activité

## Architecture technique

- **Frontend** : React.js avec Vite
- **Styling** : Tailwind CSS (via CDN)
- **Routing** : React Router DOM
- **State Management** : Context API React
- **API Calls** : Axios
- **Authentification** : JWT avec localStorage

## Structure du projet

```
src/
├── components/         # Composants réutilisables (Button, Input, Modal, Layout)
├── contexts/          # Contextes React (AuthContext)
├── pages/             # Pages principales
│   ├── Auth/          # Pages d'authentification
│   ├── Chat/          # Pages de messagerie
│   ├── Consultation/  # Pages de consultation
│   └── Dashboard/     # Pages de tableau de bord
├── services/          # Services API (api.js)
├── routes/            # Configuration des routes
├── App.jsx            # Composant principal
└── main.jsx           # Point d'entrée
```

## Conventions de codage

### Composants React
- Utiliser la syntaxe des fonctions (function components)
- Déstructurer les props dans les paramètres
- Documenter les composants avec JSDoc
- Préfixer les hooks personnalisés par "use"

### Styling
- Utiliser Tailwind CSS pour tous les styles
- Respecter la hiérarchie responsive (mobile-first)
- Privilégier les classes utilitaires Tailwind
- Éviter les styles inline sauf exceptions

### État et données
- Utiliser useState pour l'état local
- Utiliser useContext pour l'état global partagé
- Implémenter la gestion d'erreur dans tous les appels API
- Afficher des états de chargement appropriés

### Routes et navigation
- Protéger les routes nécessitant une authentification
- Utiliser la navigation programmatique avec useNavigate
- Implémenter des redirections selon les rôles utilisateur

## Rôles utilisateur

1. **Administrator** (`administrator`) - Accès complet à la plateforme
2. **Médecin** (`medecin`) - Gestion des patients et consultations
3. **Patient** (`patient`) - Accès aux consultations et chat
4. **Profil** (`profil`) - Professionnel de santé

## Bonnes pratiques

### Sécurité
- Valider toutes les entrées utilisateur
- Nettoyer les données avant affichage
- Gérer les erreurs d'authentification
- Ne pas exposer d'informations sensibles côté client

### Performance
- Lazy loading pour les composants volumineux
- Mémorisation avec useMemo/useCallback si nécessaire
- Optimiser les re-rendus avec React.memo

### Accessibilité
- Utiliser des labels appropriés pour les formulaires
- Implémenter la navigation au clavier
- Respecter les contrastes de couleurs
- Ajouter des attributs ARIA si nécessaire

### UX/UI
- Fournir un feedback visuel pour les actions utilisateur
- Implémenter des états de chargement
- Afficher des messages d'erreur clairs
- Maintenir la cohérence visuelle

## Modules spécifiques

### Authentification
- Gérer la persistance de session avec localStorage
- Implémenter la déconnexion automatique en cas d'erreur 401
- Valider les formulaires côté client

### Chat
- Implémenter le scroll automatique vers les nouveaux messages
- Gérer les différents types de messages (texte, fichiers)
- Afficher les indicateurs de statut en ligne

### Consultations
- Gérer les différents statuts (confirmée, en attente, terminée, annulée)
- Implémenter la création/modification/suppression de rendez-vous
- Afficher l'historique des consultations

### Dashboard
- Afficher des statistiques adaptées au rôle de l'utilisateur
- Implémenter des graphiques simples si nécessaire
- Fournir des raccourcis vers les actions principales

## Tests et qualité

- Écrire des commentaires explicites pour les fonctions complexes
- Suivre les conventions de nommage consistantes
- Gérer tous les cas d'erreur possibles
- Tester manuellement tous les flux utilisateur

## Développement

Pour des suggestions de code, tenir compte de :
- La maintenabilité et la lisibilité du code
- La réutilisabilité des composants
- L'expérience utilisateur optimale
- Les bonnes pratiques React et Tailwind CSS
