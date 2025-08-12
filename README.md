# 🏥 Mediai - Plateforme Médicale

Mediai est une plateforme médicale en ligne moderne développée avec React.js et Vite. Elle propose une solution complète pour la gestion des consultations médicales, la communication patient-médecin et l'administration de données de santé.

## 🚀 Fonctionnalités principales

### 🔐 Module Authentification
- Connexion et inscription sécurisées
- Gestion des rôles utilisateur (administrateur, médecin, patient, professionnel)
- Récupération de mot de passe
- Persistance de session

### 💬 Module Chat
- Messagerie en temps réel entre utilisateurs
- Chat avec IA médicale assistante
- Support des fichiers et médias
- Indicateurs de statut en ligne
- Historique des conversations

### 🩺 Module Consultation
- Prise de rendez-vous en ligne
- Gestion des fiches médicales
- Téléconsultations
- Historique des consultations
- Prescriptions et diagnostics

### 📊 Module Tableau de bord
- Statistiques personnalisées par rôle
- Suivi de l'activité
- Raccourcis vers les actions principales
- Prochains rendez-vous
- Notifications importantes

## 🛠️ Technologies utilisées

- **Frontend** : React.js 18 avec Vite
- **Styling** : Tailwind CSS (via CDN)
- **Routing** : React Router DOM v6
- **State Management** : Context API React
- **API Client** : Axios
- **Authentification** : JWT avec localStorage
- **Icons** : Emojis natifs pour une interface moderne

## 📁 Structure du projet

```
mediai-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/            # Composants réutilisables
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Layout.jsx
│   │   └── index.js
│   ├── contexts/              # Contextes React
│   │   └── AuthContext.jsx
│   ├── pages/                 # Pages principales
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Chat/
│   │   │   └── ChatPage.jsx
│   │   ├── Consultation/
│   │   │   └── ConsultationPage.jsx
│   │   └── Dashboard/
│   │       └── DashboardPage.jsx
│   ├── services/              # Services API
│   │   └── api.js
│   ├── routes/                # Configuration des routes
│   │   └── routes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .github/
│   └── copilot-instructions.md
├── package.json
├── vite.config.js
└── README.md
```

## 🚦 Installation et lancement

### Prérequis
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd frontend_mediai

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Scripts disponibles
```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Aperçu du build de production
npm run lint     # Vérification ESLint
```

## 👥 Rôles utilisateur

### 🔧 Administrateur (`administrator`)
- Accès complet à la plateforme
- Gestion des utilisateurs
- Statistiques globales
- Configuration système

### 👨‍⚕️ Médecin (`medecin`)
- Gestion des patients
- Consultations et téléconsultations
- Prescriptions et diagnostics
- Planning des rendez-vous

### 🙋‍♂️ Patient (`patient`)
- Prise de rendez-vous
- Chat avec médecins et IA
- Accès aux dossiers médicaux
- Suivi des prescriptions

### 👩‍⚕️ Professionnel (`profil`)
- Accès spécialisé selon le domaine
- Collaboration avec médecins
- Suivi des patients

## 🔑 Comptes de démonstration

Pour tester l'application, utilisez ces comptes :

```
Médecin : medecin@mediai.com / password123
Patient : patient@mediai.com / password123
Admin : admin@mediai.com / password123
```

## 🎨 Design System

### Couleurs principales
- **Primaire** : Bleu médical (`#3b82f6`)
- **Succès** : Vert (`#10b981`)
- **Attention** : Jaune (`#f59e0b`)
- **Erreur** : Rouge (`#ef4444`)
- **Neutre** : Grises (`#6b7280`, `#374151`)

### Composants réutilisables
- **Button** : Boutons avec variantes (primary, secondary, danger, etc.)
- **Input** : Champs de formulaire avec validation
- **Modal** : Fenêtres modales responsives
- **Layout** : Structure de page avec navigation

## 🔒 Sécurité

- Validation côté client et serveur
- Authentification JWT
- Protection des routes sensibles
- Gestion des erreurs d'authentification
- Nettoyage des données utilisateur

## 🌐 Responsive Design

L'interface est entièrement responsive et optimisée pour :
- 📱 Mobile (≥ 320px)
- 📱 Tablette (≥ 768px)
- 💻 Desktop (≥ 1024px)
- 🖥️ Large Desktop (≥ 1280px)

## 🚀 Prochaines fonctionnalités

- [ ] Notifications en temps réel
- [ ] Système de paiement intégré
- [ ] Géolocalisation des cabinets
- [ ] Application mobile (React Native)
- [ ] Intégration calendrier externe
- [ ] Rapports médicaux avancés

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les modifications (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Équipe de développement

- **Frontend** : React.js avec Vite
- **Design** : Tailwind CSS
- **Architecture** : SPA (Single Page Application)

---

🏥 **Mediai** - Votre santé, notre priorité
