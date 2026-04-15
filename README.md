# 🌿 JUNGLE IN ENGLISH — Angular Applications

[![Esprit](https://img.shields.io/badge/Esprit-School%20of%20Engineering-red)](https://esprit.tn)
[![Academic Year](https://img.shields.io/badge/Academic%20Year-2025--2026-blue)](https://esprit.tn)
[![PIDEV](https://img.shields.io/badge/Project-PIDEV-green)](https://esprit.tn)
[![Angular](https://img.shields.io/badge/Angular-21.x-red)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://typescriptlang.org)

> Plateforme éducative développée à **Esprit School of Engineering** — PIDEV 2025-2026

---

## 📁 Structure du Projet

```
angular-app/
├── frontend/angular-app/     # Application publique (Port 4300)
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── chatbot-widget/       # Chatbot IA intégré
│   │   │   ├── header/               # Navigation principale
│   │   │   ├── footer/               # Pied de page
│   │   │   ├── language-switcher/    # Changement FR/EN
│   │   │   ├── modal/                # Composant modal réutilisable
│   │   │   └── notification/         # Notifications toast
│   │   ├── pages/
│   │   │   ├── forums-public/        # Forums de discussion
│   │   │   ├── recrutement-public/   # Offres d'emploi & candidatures
│   │   │   ├── home/                 # Page d'accueil
│   │   │   ├── courses/              # Cours
│   │   │   ├── about/                # À propos
│   │   │   └── pricing/              # Tarifs
│   │   ├── services/
│   │   │   ├── chatbot-improved.service.ts   # Service chatbot avancé
│   │   │   ├── multimedia.service.ts          # Upload/affichage médias
│   │   │   ├── recrutement.service.ts         # API recrutement
│   │   │   ├── notification.service.ts        # Notifications
│   │   │   └── translation.service.ts         # i18n FR/EN
│   │   └── interceptors/
│   │       └── http-error.interceptor.ts      # Gestion erreurs HTTP
│   └── public/i18n/
│       ├── fr.json                   # Traductions françaises
│       └── en.json                   # Traductions anglaises
│
└── back-office/              # Application admin (Port 4301)
    ├── src/app/
    │   ├── components/
    │   │   ├── topbar/               # Barre supérieure + notifications
    │   │   ├── sidebar/              # Navigation latérale
    │   │   └── language-switcher/    # Changement FR/EN
    │   ├── pages/
    │   │   ├── recrutement/          # Gestion recrutement admin
    │   │   ├── forum/                # Gestion forums admin
    │   │   ├── dashboard/            # Tableau de bord
    │   │   ├── analytics/            # Analytiques
    │   │   ├── courses/              # Gestion cours
    │   │   └── users/                # Gestion utilisateurs
    │   └── services/
    │       ├── admin-notification.service.ts  # Notifications temps réel
    │       ├── recrutement.service.ts          # API recrutement admin
    │       └── theme.service.ts               # Dark/Light mode
    └── public/i18n/
        ├── fr.json
        └── en.json
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm 9+
- Angular CLI 21+

### Installation & Lancement

```bash
# Frontend Public (Port 4300)
cd frontend/angular-app
npm install
npm start
# → http://localhost:4300

# Back-Office Admin (Port 4301)
cd back-office
npm install
npm start
# → http://localhost:4301
```

---

## ✨ Fonctionnalités Implémentées

### 🎓 Module Forum (Frontend Public)

#### Fonctionnalités de base
- ✅ Affichage des forums et messages
- ✅ Création de messages avec titre et contenu
- ✅ Système de likes (❤️) sur les messages
- ✅ Réponses aux messages
- ✅ Signalement de contenu inapproprié
- ✅ Badges utilisateurs (Étudiant, Enseignant, Admin)
- ✅ Statistiques globales (forums, messages, likes)
- ✅ Classement des contributeurs

#### Upload Multimédia
- ✅ Upload d'images (JPG, PNG, GIF, WebP — max 5MB)
- ✅ Upload d'audio (MP3, WAV, OGG — max 10MB)
- ✅ Upload de documents (PDF, ZIP, DOC — max 20MB)
- ✅ Intégration vidéos YouTube par URL
- ✅ Affichage automatique des médias sous les messages
- ✅ Prévisualisation avant envoi

### 💼 Module Recrutement (Frontend Public)

- ✅ Affichage des offres ouvertes avec filtrage par spécialité
- ✅ Formulaire de candidature (nom, prénom, email, CV, lettre de motivation)
- ✅ Upload CV (PDF, DOC, DOCX — max 5MB)
- ✅ Modal "Traitement en cours" pendant l'envoi
- ✅ **Popup personnalisé** pour doublon de candidature (409 Conflict)
- ✅ Redirection vers accueil après candidature réussie
- ✅ Détection des offres expirées

### 🤖 Chatbot Virtuel

- ✅ Widget chatbot flottant (coin bas-droit)
- ✅ Base de connaissances avec 50+ mots-clés
- ✅ Réponses contextuelles (forums, médias, recrutement, navigation)
- ✅ Animation de frappe (typing indicator)
- ✅ Historique persistant (localStorage)
- ✅ Popup de confirmation personnalisé pour effacer l'historique
- ✅ Support FR/EN
- ✅ Temps de réponse optimisé (150ms)

### 🌐 Internationalisation (i18n)

- ✅ Support Français / Anglais
- ✅ Changement de langue en temps réel
- ✅ Fichiers de traduction complets (`fr.json`, `en.json`)
- ✅ Persistance de la langue (localStorage)
- ✅ `@ngx-translate/core` intégré

### 🎨 Interface & UX

- ✅ Dark Mode / Light Mode
- ✅ Design responsive (Tailwind CSS)
- ✅ Notifications toast (succès, erreur, info, warning)
- ✅ Animations et transitions fluides
- ✅ Popups personnalisés (remplace les `alert()` natifs)

---

## 🏢 Module Back-Office Admin

### Gestion Recrutement

- ✅ Tableau de bord des offres (OUVERTE / FERMEE / POURVUE)
- ✅ Création / Modification / Suppression d'offres
- ✅ Fermeture et réouverture d'offres
- ✅ Affichage des candidatures par offre
- ✅ Changement de statut (EN_ATTENTE → ACCEPTEE / REFUSEE)
- ✅ Téléchargement des CVs
- ✅ **Réaffectation automatique** : popup avec liste des offres disponibles
- ✅ **Popup doublon** personnalisé pour les conflits
- ✅ Suppression des colonnes ID (interface épurée)

### 🔔 Système de Notifications Temps Réel

- ✅ Badge de notification dans la topbar
- ✅ Polling automatique toutes les **10 secondes** (sans refresh)
- ✅ Dropdown avec liste des notifications non lues
- ✅ Clic sur notification → navigation vers la page recrutement
- ✅ Auto-sélection de l'offre concernée + scroll automatique
- ✅ Marquer comme lu (individuel ou tout)
- ✅ Fermeture dropdown au clic extérieur (`@HostListener`)

### ⏰ Scheduler (Backend)

- ✅ Vérification quotidienne à **13:30** (configurable)
- ✅ Détecte les candidatures EN_ATTENTE sur offres actives
- ✅ Crée une notification par offre avec candidatures en attente
- ✅ Arrêt automatique quand l'offre expire

### Gestion Forums (Back-Office)

- ✅ Affichage des forums et messages
- ✅ Modération des messages
- ✅ Gestion des signalements

---

## 🔧 Architecture Technique

### Stack Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Angular | 21.x | Framework principal |
| TypeScript | 5.9 | Langage |
| Tailwind CSS | 3.x | Styling |
| @ngx-translate | 17.x | Internationalisation |
| RxJS | 7.8 | Programmation réactive |

### Communication Backend
| Service | Port | Description |
|---------|------|-------------|
| Forum Service | 8082 | Messages, médias, email |
| Recrutement Service | 8083 | Offres, candidatures, notifications |
| API Gateway | 8086 | Routage centralisé |
| Eureka Server | 8761 | Service Discovery |

### Patterns Utilisés
- **Polling** : `timer(0, 10000)` pour les notifications temps réel
- **Signal** : Angular Signals pour l'état des notifications
- **Interceptor** : Gestion centralisée des erreurs HTTP
- **Lazy Loading** : Chargement optimisé des composants
- **Standalone Components** : Architecture Angular moderne

---

## 📡 Endpoints API Utilisés

### Forum Service (8082)
```
GET    /api/forum/forums                    # Liste des forums
GET    /api/forum/messages/forum/{id}       # Messages d'un forum
POST   /api/forum/messages                  # Créer un message
POST   /api/forum/likes/{messageId}         # Liker un message
POST   /api/forum/multimedia/upload         # Upload fichier
GET    /api/forum/multimedia/message/{id}   # Médias d'un message
```

### Recrutement Service (8083)
```
GET    /api/recrutement/offres/statut/OUVERTE           # Offres ouvertes
POST   /api/recrutement/candidatures/offre/{id}         # Postuler
GET    /api/recrutement/candidatures/{id}/cv            # Télécharger CV
GET    /api/recrutement/candidatures/doublon            # Vérifier doublon
GET    /api/recrutement/candidatures/{id}/offre-compatible  # Réaffectation
GET    /api/recrutement/notifications/unread            # Notifications non lues
PATCH  /api/recrutement/notifications/{id}/read         # Marquer comme lu
PATCH  /api/recrutement/candidatures/{id}/statut        # Changer statut
```

---

## 🧪 Tests

```bash
# Frontend
cd frontend/angular-app
npm test

# Back-office
cd back-office
npm test
```

---

## 📝 Variables d'Environnement

```typescript
// frontend/angular-app/src/environments/environment.ts
export const environment = {
  production: false,
  forumServiceUrl: 'http://localhost:8082/api/forum',
  recrutementServiceUrl: 'http://localhost:8083/api/recrutement'
};
```

---

## 🎓 Contexte Académique

| Champ | Valeur |
|-------|--------|
| Institution | Esprit School of Engineering |
| Projet | PIDEV (Projet Intégré de Développement) |
| Classe | 3ème Année |
| Année | 2025–2026 |
| Localisation | Tunis, Tunisie |

---

*© 2025-2026 Esprit School of Engineering — Tunisie*
