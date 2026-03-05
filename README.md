# 🎓 Plateforme Éducative - Frontend Angular

Application frontend moderne développée avec Angular 18 pour la plateforme éducative. Comprend une interface publique et un back-office d'administration.

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Applications](#applications)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure](#structure)

---

## 🎯 Vue d'ensemble

Ce projet contient deux applications Angular distinctes:
1. **Frontend Public** (port 4300) - Interface utilisateur pour étudiants
2. **Back-Office** (port 4301) - Interface d'administration

### Architecture Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Applications                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌─────────────────────┐     │
│  │   Public Frontend   │      │    Back-Office      │     │
│  │     (Port 4300)     │      │    (Port 4301)      │     │
│  ├─────────────────────┤      ├─────────────────────┤     │
│  │ - Forums publics    │      │ - Gestion forums    │     │
│  │ - Recrutement       │      │ - Gestion offres    │     │
│  │ - Chatbot           │      │ - Modération        │     │
│  │ - Préférences email │      │ - Analytics         │     │
│  │ - Multimédia        │      │ - Statistiques      │     │
│  └─────────────────────┘      └─────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   API Gateway    │
                    │   (Port 8888)    │
                    └──────────────────┘
```

---

## 🚀 Applications

### 1. Frontend Public (Port 4300)

Interface utilisateur principale pour les étudiants et visiteurs.

#### Pages Principales
- 🏠 **Accueil** - Page d'accueil avec présentation
- 🗣️ **Forums** - Forums de discussion interactifs
- 👔 **Recrutement** - Consultation et candidature aux offres
- 📚 **Cours** - Catalogue des cours disponibles
- 📧 **Préférences Email** - Gestion des notifications

#### Composants Spéciaux
- 💬 **Chatbot Widget** - Assistant virtuel flottant
- 🌐 **Language Switcher** - Changement de langue FR/EN
- 🎨 **Theme Switcher** - Dark mode / Light mode

### 2. Back-Office (Port 4301)

Interface d'administration pour la gestion de la plateforme.

#### Modules d'Administration
- 📊 **Dashboard** - Vue d'ensemble et statistiques
- 🗣️ **Gestion Forums** - CRUD forums et messages
- 👔 **Gestion Recrutement** - CRUD offres et candidatures
- 📈 **Analytics** - Statistiques détaillées
- 👥 **Utilisateurs** - Gestion des utilisateurs
- ⚙️ **Paramètres** - Configuration de la plateforme

---

## ✨ Fonctionnalités

### 🗣️ Forums Interactifs

#### Affichage des Messages
- ✅ Liste des forums par catégorie
- ✅ Messages avec auteur, date, contenu
- ✅ Système de likes et réactions
- ✅ Compteur de réponses
- ✅ Statuts visuels (actif, archivé, modéré)

#### Création de Messages
- ✅ Formulaire de création avec validation
- ✅ Éditeur de texte enrichi
- ✅ Upload de médias multiples
- ✅ Prévisualisation avant publication
- ✅ Brouillons automatiques

#### Interactions
- ✅ Liker/Unliker un message
- ✅ Répondre à un message
- ✅ Signaler un contenu inapproprié
- ✅ Partager un message
- ✅ Suivre un forum

### 📸 Système Multimédia

#### Upload de Fichiers
- 📷 **Images** (JPG, PNG, GIF, WebP)
  - Taille max: 5MB
  - Prévisualisation instantanée
  - Compression automatique
  - Génération de miniatures

- 🎵 **Audio** (MP3, WAV, OGG)
  - Taille max: 10MB
  - Lecteur intégré
  - Contrôles de lecture

- 📄 **Documents** (PDF, ZIP, DOC, XLS)
  - Taille max: 20MB
  - Icônes par type
  - Téléchargement sécurisé

- 🎬 **Vidéos** (YouTube, Vimeo)
  - Intégration par URL
  - Lecteur intégré
  - Responsive

#### Affichage des Médias
- ✅ Grille responsive sous chaque message
- ✅ Section "📎 Fichiers joints (X)"
- ✅ Prévisualisation d'images en modal
- ✅ Lecteur audio HTML5
- ✅ Boutons de téléchargement
- ✅ Lecteur YouTube intégré

### 💬 Chatbot Intelligent

#### Fonctionnalités
- 🤖 Assistant virtuel frontend-only
- 💾 Historique sauvegardé (localStorage)
- 🎯 Réponses contextuelles
- 🎨 Interface moderne et fluide
- 📱 Responsive mobile

#### Base de Connaissances
Le chatbot peut répondre sur:
- Comment créer un forum
- Comment postuler à une offre
- Où trouver les cours
- Comment s'inscrire
- Navigation sur la plateforme
- Fonctionnalités disponibles

#### Interface
- Widget flottant en bas à droite
- Bouton d'ouverture/fermeture
- Zone de chat avec historique
- Input avec envoi par Enter
- Bouton "Effacer l'historique"
- Popup personnalisé (pas natif)

### 📧 Préférences Email

#### Types de Notifications
- ✉️ Nouveaux messages dans forums suivis
- 💬 Réponses à vos messages
- ❤️ Likes sur vos publications
- 🔔 Mentions (@utilisateur)
- 📢 Annonces importantes
- 🎓 Nouveaux cours disponibles
- 👔 Nouvelles offres d'emploi

#### Gestion
- ✅ Activation/désactivation par type
- ✅ Sauvegarde automatique
- ✅ Synchronisation avec le backend
- ✅ Interface intuitive avec checkboxes

### 👔 Système de Recrutement

#### Consultation des Offres
- ✅ Liste des offres disponibles
- ✅ Filtrage par département
- ✅ Recherche par mots-clés
- ✅ Tri par date
- ✅ Détails complets de l'offre

#### Candidature
- ✅ Formulaire de candidature
- ✅ Upload de CV (PDF, DOC, DOCX)
- ✅ Lettre de motivation
- ✅ Validation en temps réel
- ✅ Confirmation de soumission

### 🌐 Internationalisation

#### Langues Supportées
- 🇫🇷 **Français** (langue par défaut)
- 🇬🇧 **Anglais**

#### Fonctionnalités i18n
- ✅ Changement de langue en temps réel
- ✅ Traductions complètes de l'interface
- ✅ Persistance du choix (localStorage)
- ✅ Bouton de changement dans le header
- ✅ Support ngx-translate

#### Fichiers de Traduction
```
public/i18n/
├── en.json  # Traductions anglaises
└── fr.json  # Traductions françaises
```

### 🎨 Interface Utilisateur

#### Design System
- ✅ **Tailwind CSS** - Utility-first CSS
- ✅ **Dark Mode** - Thème sombre/clair
- ✅ **Responsive** - Mobile, tablet, desktop
- ✅ **Animations** - Transitions fluides
- ✅ **Composants réutilisables**

#### Composants Personnalisés
- ✅ **Modals** - Popups personnalisés
- ✅ **Notifications** - Toast messages
- ✅ **Forms** - Formulaires avec validation
- ✅ **Tables** - Tables de données interactives
- ✅ **Cards** - Cartes d'information
- ✅ **Buttons** - Boutons stylisés

#### Navigation
- ✅ Header avec menu principal
- ✅ Footer avec liens utiles
- ✅ Sidebar pour back-office
- ✅ Breadcrumbs
- ✅ Pagination

---

## 🛠️ Technologies

### Framework & Core
- **Angular 18.0** - Framework TypeScript
- **TypeScript 5.5** - Langage typé
- **RxJS 7.8** - Programmation réactive
- **Zone.js** - Change detection

### UI & Styling
- **Tailwind CSS 3.4** - Framework CSS
- **PostCSS** - Transformations CSS
- **Autoprefixer** - Préfixes CSS automatiques

### Internationalisation
- **@ngx-translate/core 15.0** - Core i18n
- **@ngx-translate/http-loader** - Chargement traductions

### HTTP & State
- **HttpClient** - Requêtes HTTP
- **Observables** - Gestion asynchrone
- **Interceptors** - Gestion des requêtes/réponses

### Routing & Navigation
- **Angular Router** - Navigation
- **Route Guards** - Protection des routes
- **Lazy Loading** - Chargement à la demande

### Build & Dev Tools
- **Angular CLI 18.0** - Ligne de commande
- **Vite** - Build tool rapide
- **ESLint** - Linting TypeScript
- **Prettier** - Formatage du code

### Testing
- **Jasmine** - Framework de test
- **Karma** - Test runner
- **Protractor** - Tests E2E

---

## 📦 Installation

### Prérequis

- **Node.js 18+** - [Télécharger](https://nodejs.org/)
- **npm 9+** - Inclus avec Node.js
- **Angular CLI 18** - `npm install -g @angular/cli`

### Installation Frontend Public

```bash
# Cloner le repository
git clone https://github.com/brouri12/angular-app.git
cd angular-app
git checkout rahma

# Installer les dépendances
cd frontend/angular-app
npm install

# Démarrer le serveur de développement
ng serve --port 4300
```

**URL**: http://localhost:4300

### Installation Back-Office

```bash
# Depuis la racine du projet
cd back-office

# Installer les dépendances
npm install

# Démarrer le serveur de développement
ng serve --port 4301
```

**URL**: http://localhost:4301

---

## ⚙️ Configuration

### Environment Configuration

#### frontend/angular-app/src/environments/environment.ts

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/api/forum',
  recrutementApiUrl: 'http://localhost:8083/api/recrutement',
  gatewayUrl: 'http://localhost:8888',
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en']
};
```

#### frontend/angular-app/src/environments/environment.prod.ts

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.votre-domaine.com/forum',
  recrutementApiUrl: 'https://api.votre-domaine.com/recrutement',
  gatewayUrl: 'https://api.votre-domaine.com',
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en']
};
```

### App Configuration

#### frontend/angular-app/src/app/app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // Configuration ngx-translate
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLang: 'fr',
        fallbackLang: 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

---

## 🚀 Utilisation

### Démarrage Rapide

#### 1. Démarrer le Backend
```bash
# Assurez-vous que les services backend sont démarrés
# Forum Service: http://localhost:8082
# Recrutement Service: http://localhost:8083
# API Gateway: http://localhost:8888
```

#### 2. Démarrer le Frontend Public
```bash
cd frontend/angular-app
ng serve --port 4300
```

#### 3. Démarrer le Back-Office (optionnel)
```bash
cd back-office
ng serve --port 4301
```

### Commandes Utiles

```bash
# Développement
ng serve                    # Démarrer le serveur de dev
ng serve --port 4300        # Spécifier un port
ng serve --open             # Ouvrir le navigateur automatiquement

# Build
ng build                    # Build de production
ng build --configuration=production  # Build optimisé

# Tests
ng test                     # Tests unitaires
ng e2e                      # Tests end-to-end

# Linting
ng lint                     # Vérifier le code

# Génération
ng generate component nom   # Créer un composant
ng generate service nom     # Créer un service
ng generate module nom      # Créer un module
```

### Utilisation des Fonctionnalités

#### 1. Utiliser le Chatbot
```typescript
// Le chatbot est automatiquement disponible sur toutes les pages
// Cliquez sur l'icône en bas à droite pour l'ouvrir

// Pour personnaliser les réponses, modifiez:
// src/app/services/chatbot.service.ts
```

#### 2. Ajouter des Traductions
```json
// public/i18n/fr.json
{
  "NOUVELLE_CLE": "Nouveau texte en français"
}

// public/i18n/en.json
{
  "NOUVELLE_CLE": "New text in English"
}
```

```html
<!-- Dans le template -->
<p>{{ 'NOUVELLE_CLE' | translate }}</p>
```

#### 3. Créer un Nouveau Service
```bash
ng generate service services/mon-service
```

```typescript
// src/app/services/mon-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/endpoint`);
  }
}
```

---

## 📁 Structure du Projet

### Frontend Public

```
frontend/angular-app/
├── public/
│   ├── i18n/                      # Fichiers de traduction
│   │   ├── en.json               # Anglais
│   │   └── fr.json               # Français
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── components/           # Composants réutilisables
│   │   │   ├── chatbot-widget/
│   │   │   │   └── chatbot-widget.component.ts
│   │   │   ├── email-preferences/
│   │   │   │   └── email-preferences.component.ts
│   │   │   ├── language-switcher/
│   │   │   │   └── language-switcher.component.ts
│   │   │   ├── modal/
│   │   │   │   └── modal.component.ts
│   │   │   ├── header/
│   │   │   │   ├── header.html
│   │   │   │   └── header.ts
│   │   │   └── footer/
│   │   │       ├── footer.html
│   │   │       └── footer.ts
│   │   │
│   │   ├── pages/                # Pages principales
│   │   │   ├── home/
│   │   │   │   ├── home.html
│   │   │   │   └── home.ts
│   │   │   ├── forums-public/
│   │   │   │   ├── forums-public.html
│   │   │   │   ├── forums-public.ts
│   │   │   │   └── forums-public.css
│   │   │   └── recrutement-public/
│   │   │       ├── recrutement-public.html
│   │   │       └── recrutement-public.ts
│   │   │
│   │   ├── services/             # Services Angular
│   │   │   ├── forum.service.ts
│   │   │   ├── multimedia.service.ts
│   │   │   ├── chatbot.service.ts
│   │   │   ├── email-preference.service.ts
│   │   │   ├── recrutement.service.ts
│   │   │   └── translation.service.ts
│   │   │
│   │   ├── models/               # Interfaces TypeScript
│   │   │   ├── forum.model.ts
│   │   │   └── recrutement.model.ts
│   │   │
│   │   ├── guards/               # Route Guards
│   │   │   └── auth.guard.ts
│   │   │
│   │   ├── interceptors/         # HTTP Interceptors
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   │
│   │   ├── app.config.ts         # Configuration app
│   │   ├── app.routes.ts         # Routes
│   │   ├── app.html              # Template principal
│   │   ├── app.ts                # Composant principal
│   │   └── app.css               # Styles globaux
│   │
│   ├── environments/             # Configuration environnements
│   │   ├── environment.ts        # Développement
│   │   └── environment.prod.ts   # Production
│   │
│   ├── assets/                   # Ressources statiques
│   │   ├── images/
│   │   └── i18n/                 # Traductions (backup)
│   │
│   ├── styles.css                # Styles globaux
│   ├── index.html                # Page HTML principale
│   └── main.ts                   # Point d'entrée
│
├── angular.json                  # Configuration Angular
├── package.json                  # Dépendances npm
├── tsconfig.json                 # Configuration TypeScript
├── tailwind.config.js            # Configuration Tailwind
└── README.md                     # Ce fichier
```

### Back-Office

```
back-office/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── sidebar/          # Menu latéral
│   │   │   ├── topbar/           # Barre supérieure
│   │   │   ├── language-switcher/
│   │   │   └── modal/
│   │   │
│   │   ├── pages/
│   │   │   ├── dashboard/        # Tableau de bord
│   │   │   ├── forum/            # Gestion forums
│   │   │   ├── recrutement/      # Gestion recrutement
│   │   │   ├── analytics/        # Statistiques
│   │   │   └── courses/          # Gestion cours
│   │   │
│   │   ├── services/
│   │   │   ├── forum.service.ts
│   │   │   ├── recrutement.service.ts
│   │   │   └── theme.service.ts
│   │   │
│   │   └── models/
│   │       ├── forum.model.ts
│   │       └── recrutement.model.ts
│   │
│   └── assets/
│       └── i18n/
│           ├── en.json
│           └── fr.json
│
└── (fichiers de configuration similaires)
```

---

## 🎨 Personnalisation

### Thème et Couleurs

#### tailwind.config.js

```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        },
        // Ajoutez vos couleurs personnalisées
      }
    }
  }
};
```

### Ajouter une Nouvelle Page

```bash
# Générer le composant
ng generate component pages/ma-nouvelle-page

# Ajouter la route dans app.routes.ts
{
  path: 'ma-page',
  component: MaNouvellePageComponent
}

# Ajouter le lien dans le header
<a routerLink="/ma-page">Ma Page</a>
```

---

## 🧪 Tests

### Tests Unitaires

```bash
# Exécuter tous les tests
ng test

# Tests avec couverture
ng test --code-coverage

# Tests en mode watch
ng test --watch
```

### Tests E2E

```bash
# Exécuter les tests end-to-end
ng e2e
```

---

## 🚀 Déploiement

### Build de Production

```bash
# Build optimisé
ng build --configuration=production

# Les fichiers sont générés dans dist/
```

### Déploiement sur Serveur

```bash
# Copier les fichiers du dossier dist/ vers votre serveur
scp -r dist/* user@server:/var/www/html/
```

---

## 📊 Performance

### Optimisations Appliquées

- ✅ Lazy loading des modules
- ✅ OnPush change detection
- ✅ TrackBy dans les ngFor
- ✅ Compression des images
- ✅ Minification du code
- ✅ Tree shaking
- ✅ AOT compilation

---

## 🐛 Dépannage

### Problème: Port déjà utilisé
```bash
# Utiliser un autre port
ng serve --port 4302
```

### Problème: Erreur de compilation
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Problème: Traductions non chargées
```bash
# Vérifier que les fichiers existent
ls public/i18n/

# Vérifier la configuration dans app.config.ts
```

---

## 📝 Contributeurs

- **Équipe Frontend** - Développement Angular
- **Branche**: `rahma`
- **Repository**: https://github.com/brouri12/angular-app

---

## 📞 Support

Pour toute question:
1. Consultez la documentation
2. Vérifiez les issues GitHub
3. Contactez l'équipe de développement

---

**Développé avec ❤️ et Angular 18**
