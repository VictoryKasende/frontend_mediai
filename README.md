# 🏥 Mediai - Plateforme Médicale en Ligne

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/VictoryKasende/frontend_mediai)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.0+-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC.svg)](https://tailwindcss.com/)

## 📋 À propos du projet

**Mediai** est une plateforme médicale moderne développée avec React.js et Vite, conçue pour faciliter la gestion des consultations médicales en ligne. Elle connecte patients et professionnels de santé à travers une interface intuitive et sécurisée.

### ✨ Fonctionnalités principales

- 🔐 **Authentification sécurisée** - Gestion des rôles (administrateur, médecin, patient, profils)
- 💬 **Chat en temps réel** - Messagerie entre utilisateurs et IA médicale
- 📋 **Gestion des consultations** - Rendez-vous et fiches médicales
- 📊 **Tableaux de bord** - Statistiques et suivi de l'activité adaptés par rôle

## 🚀 Technologies utilisées

- **Frontend** : React.js 18+ avec Vite
- **Styling** : Tailwind CSS (CDN)
- **Routing** : React Router DOM
- **État global** : Context API React
- **Requêtes API** : Axios
- **Authentification** : JWT avec localStorage

## 📁 Structure du projet

```
src/
├── components/         # Composants réutilisables
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Logo.jsx
│   └── Icons.jsx
├── contexts/          # Contextes React
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
├── pages/             # Pages principales
│   ├── Auth/          # Authentification
│   ├── Chat/          # Messagerie
│   ├── Consultation/  # Consultations
│   ├── Dashboard/     # Tableaux de bord
│   ├── Patient/       # Interface patient
│   └── Doctor/        # Interface médecin
├── services/          # Services API
│   └── api.js
├── routes/            # Configuration des routes
├── App.jsx            # Composant principal
└── main.jsx           # Point d'entrée
```

## 🎨 Design System

### Palette de couleurs Mediai
- **Primary** : `#2563eb` (Bleu médical)
- **Secondary** : `#7c3aed` (Violet médical)
- **Dark** : `#1e293b` (Gris foncé)
- **Success** : `#10b981` (Vert)
- **Warning** : `#f59e0b` (Orange)
- **Danger** : `#ef4444` (Rouge)

### Typographie
- **Heading** : Police pour les titres
- **Body** : Police pour le contenu
- **Medical** : Police spécialisée médicale
- **Mono** : Police monospace pour les données

## 👥 Rôles utilisateur

| Rôle | Code | Description |
|------|------|-------------|
| **Administrateur** | `administrator` | Accès complet à la plateforme |
| **Médecin** | `medecin` | Gestion des patients et consultations |
| **Patient** | `patient` | Accès aux consultations et chat |
| **Profil** | `profil` | Professionnel de santé |

## 🛠️ Installation et développement

### Prérequis
- Node.js 16+ 
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone https://github.com/VictoryKasende/frontend_mediai.git

# Accéder au dossier
cd frontend_mediai

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Scripts disponibles
```bash
npm run dev        # Démarrer le serveur de développement
npm run build      # Construire pour la production
npm run preview    # Prévisualiser la build de production
npm run lint       # Vérifier le code avec ESLint
```

## 🏗️ Architecture des modules

### 🔐 Module Authentification
- Gestion de session avec localStorage
- Déconnexion automatique sur erreur 401
- Validation des formulaires côté client
- Protection des routes par rôle

### 💬 Module Chat
- Messagerie en temps réel
- Support de différents types de messages
- Indicateurs de statut en ligne
- Scroll automatique vers nouveaux messages

### 📋 Module Consultations
- Statuts : confirmée, en attente, terminée, annulée
- CRUD complet des rendez-vous
- Historique des consultations
- Fiches médicales détaillées

### 📊 Module Dashboard
- Statistiques adaptées par rôle
- Graphiques et métriques
- Raccourcis vers actions principales
- Interface responsive

## 🎯 Bonnes pratiques

### Sécurité
- ✅ Validation des entrées utilisateur
- ✅ Nettoyage des données avant affichage
- ✅ Gestion des erreurs d'authentification
- ✅ Pas d'exposition d'informations sensibles

### Performance
- ✅ Lazy loading des composants
- ✅ Mémorisation avec useMemo/useCallback
- ✅ Optimisation des re-rendus avec React.memo

### Accessibilité
- ✅ Labels appropriés pour les formulaires
- ✅ Navigation au clavier
- ✅ Contrastes respectés
- ✅ Attributs ARIA

### UX/UI
- ✅ Feedback visuel pour les actions
- ✅ États de chargement
- ✅ Messages d'erreur clairs
- ✅ Cohérence visuelle

## 📱 Responsive Design

La plateforme est entièrement responsive et optimisée pour :
- 📱 **Mobile** : 320px - 768px
- 📱 **Tablette** : 768px - 1024px
- 💻 **Desktop** : 1024px+

## 🔧 Configuration

### Variables d'environnement
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Mediai
VITE_JWT_SECRET=your-secret-key
```

### Tailwind CSS
Le projet utilise Tailwind CSS via CDN pour un développement rapide et une cohérence de design.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Conventions de code

### Composants React
- Utiliser les fonctions (function components)
- Déstructurer les props dans les paramètres
- Documenter avec JSDoc
- Préfixer les hooks personnalisés par "use"

### Styling
- Utiliser exclusivement Tailwind CSS
- Approche mobile-first
- Classes utilitaires privilégiées
- Éviter les styles inline

## 🐛 Rapporter un bug

Utilisez les [Issues GitHub](https://github.com/VictoryKasende/frontend_mediai/issues) pour signaler des bugs ou proposer des améliorations.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Victory Kasende**
- GitHub: [@VictoryKasende](https://github.com/VictoryKasende)
- Email: victory.kasende@example.com

---

<div align="center">
  <p>Fait avec ❤️ pour améliorer l'accès aux soins de santé</p>
  <p><strong>Mediai</strong> - Connecter, Soigner, Innover</p>
</div>
