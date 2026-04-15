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


---

## 🔗 OpenFeign — Communication Inter-Services

### Fichiers créés (recrutement-service)
- `feign/ForumServiceClient.java` — Interface Feign
- `feign/ForumServiceClientFallback.java` — Fallback Circuit Breaker

### Comment ça marche

```java
@FeignClient(name = "forum-service", fallback = ForumServiceClientFallback.class)
public interface ForumServiceClient {
    @GetMapping("/api/forum/messages/count-by-email")
    int countMessagesByEmail(@RequestParam("email") String email);
}
```

- `@FeignClient(name = "forum-service")` → Eureka résout automatiquement l'URL du service
- `fallback` → si forum-service est down, retourne `0` sans planter
- `@EnableFeignClients` ajouté dans `RecrutementApplication.java`

### Tester OpenFeign
```
GET http://localhost:8083/api/recrutement/candidatures/doublon?email=test@gmail.com&specialite=francais
```

---

## 🔐 JWT Security

### Fichiers créés (recrutement-service)
- `security/JwtUtil.java` — Génère et valide les tokens HS256
- `security/JwtAuthFilter.java` — Filtre chaque requête HTTP (OncePerRequestFilter)
- `security/SecurityConfig.java` — Règles d'accès par rôle
- `controller/AuthController.java` — Endpoint de login

### Règles d'accès

| Endpoint | Accès |
|----------|-------|
| `GET /offres/**` | Public |
| `POST /candidatures/offre/**` | Public (candidats) |
| `GET /candidatures/*/cv` | Public |
| `POST /offres` | ADMIN seulement |
| `PUT/DELETE /offres/**` | ADMIN seulement |
| `PATCH /candidatures/*/statut` | ADMIN seulement |
| `/notifications/**` | ADMIN seulement |

### Obtenir un token JWT

```bash
POST http://localhost:8083/api/recrutement/auth/login
Content-Type: application/json

{"username": "admin", "password": "admin123"}
```

Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ADMIN",
  "message": "Connexion réussie"
}
```

### Utiliser le token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Comptes disponibles

| Username | Password | Rôle |
|----------|----------|------|
| `admin` | `admin123` | ADMIN |
| `user` | `user123` | USER |

---

## 🧪 Tests JUnit / Mockito

### Fichiers créés
- `recrutement-service/src/test/.../CandidatureServiceTest.java` — 8 tests
- `recrutement-service/src/test/.../OffreServiceTest.java` — 9 tests

### Lancer les tests

```bash
cd recrutement-service
mvn test
```

### Tests couverts

| Test | Scénario |
|------|----------|
| `postuler_Success` | Candidature créée avec succès |
| `postuler_OffreNotFound` | Offre inexistante → `Optional.empty()` |
| `postuler_DoublonDetecte` | Email déjà utilisé → `RuntimeException` |
| `changerStatut_Acceptee` | Email envoyé automatiquement |
| `changerStatut_Refusee` | Offre reste OUVERTE |
| `estCandidatDoublon_True` | Doublon détecté dans 30 jours |
| `fermerOffre` | Statut → FERMEE |
| `deleteOffre_NotFound` | Retourne `false` |
| `addOffre_SetsDatePublication` | Date auto + statut OUVERTE |
| `getAllOffres_ReturnsList` | Liste complète retournée |
| `rouvrirOffre` | Statut → OUVERTE |
| `getOffresByStatut` | Filtrage par statut |

---

## 🏗️ Architecture Complète

```
Angular Frontend (4300)          Angular Back-Office (4301)
        │                                    │
        └──────────────┬─────────────────────┘
                       │
              API Gateway (8086)
              ┌─────────────────┐
              │ JWT Validation  │
              │ CORS Config     │
              │ Load Balancing  │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
   Forum Service (8082)    Recrutement Service (8083)
   - Messages/Forums        - Offres/Candidatures
   - Multimedia             - JWT Security ✅
   - Email                  - OpenFeign ✅
                            - Scheduler ✅
                            - Email notifications ✅
          │                         │
          └────────────┬────────────┘
                       │
              Eureka Server (8761)
              Service Discovery
```

---

## 📋 Fonctionnalités Avancées — Récapitulatif

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Détection doublons | Vérifie email + spécialité dans 30 jours | ✅ |
| Réaffectation automatique | Popup avec offres disponibles après refus | ✅ |
| Scheduler 13:30 | Notifie l'admin des candidatures EN_ATTENTE | ✅ |
| Notifications in-app | Badge temps réel sans refresh (polling 10s) | ✅ |
| Email acceptation | Email HTML envoyé quand admin accepte | ✅ |
| Popup doublon | 409 Conflict avec popup personnalisé | ✅ |
| Téléchargement CV | Endpoint dédié `/candidatures/{id}/cv` | ✅ |
| OpenFeign | Communication recrutement → forum via Eureka | ✅ |
| JWT Security | Protection endpoints sensibles par rôle | ✅ |
| Tests Mockito | 17 tests unitaires (CandidatureService + OffreService) | ✅ |
| Language Switcher | FR/EN temps réel avec persistance | ✅ |
| Dark Mode | Toggle light/dark avec persistance | ✅ |
| Chatbot IA | 50+ mots-clés, historique localStorage | ✅ |
| Upload Multimédia | Images, audio, documents, YouTube | ✅ |


---

## 🏆 Innovation — Fonctionnalités Originales à Haute Complexité

### 1. Scoring Automatique des Candidatures (0-100)

**Fichier** : `recrutement-service/.../service/ScoringService.java`

Algorithme multi-critères qui calcule un score pour chaque candidature :

| Critère | Points | Logique |
|---------|--------|---------|
| Expérience | 40 pts | Proportionnel à l'expérience requise |
| Qualité lettre | 35 pts | NLP : longueur, vocabulaire, mots-clés |
| Rapidité | 15 pts | Candidature dans les 2 premiers jours = 15 pts |
| Complétude | 10 pts | CV présent, email, nom, prénom |

**Endpoint** :
```
GET http://localhost:8083/api/recrutement/offres/{id}/classement
```

**Réponse** :
```json
[
  { "rang": 1, "nom": "Dupont", "prenom": "Jean", "score": 87, "niveauScore": "EXCELLENT", "qualiteLettre": "EXCELLENTE" },
  { "rang": 2, "nom": "Azouzi", "prenom": "Marwen", "score": 62, "niveauScore": "BON", "qualiteLettre": "BONNE" }
]
```

### 2. Analyse NLP de la Lettre de Motivation

**Analyse automatique** de la qualité d'une lettre selon :
- Richesse du vocabulaire (ratio mots uniques)
- Présence de 25 mots-clés pédagogiques (pédagogie, enseignement, encadrement...)
- Structure (introduction + conclusion)
- Longueur et densité

**Endpoint** :
```
POST http://localhost:8083/api/recrutement/analyse-lettre
Body: { "lettre": "Madame, Monsieur, je suis très motivé..." }
```

**Réponse** :
```json
{
  "qualite": "BONNE",
  "score": 22,
  "scoreMax": 35,
  "nbMots": 187,
  "ratioUnicite": 0.68,
  "motsClesPedagogiques": ["pédagogie", "enseignement", "formation"],
  "aIntroduction": true,
  "aConclusion": true,
  "conseil": "Enrichissez votre vocabulaire avec des termes pédagogiques."
}
```

### 3. Classement Visuel dans le Back-Office

Bouton **"🏆 Classement"** dans la section candidatures :
- Barre de progression colorée (vert ≥75, bleu ≥50, jaune ≥25, rouge <25)
- Médailles 🥇🥈🥉 pour les 3 premiers
- Badge qualité lettre (EXCELLENTE / BONNE / CORRECTE / INSUFFISANTE)
- Score individuel `/100` affiché

### 4. Score Détaillé d'une Candidature

```
GET http://localhost:8083/api/recrutement/candidatures/{id}/scoring
```

Retourne le détail complet : score total, niveau, analyse complète de la lettre.


---

## 🔧 Correction CORS — Spring Security

### Problème
Après l'ajout de Spring Security + JWT, les requêtes `POST` depuis Angular (port 4300) vers le recrutement-service (port 8083) étaient bloquées :
```
Access to XMLHttpRequest blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

### Cause
Spring Security interceptait les requêtes `OPTIONS` (preflight CORS) **avant** que la configuration CORS ne puisse répondre avec les headers appropriés.

### Solution appliquée dans `SecurityConfig.java`

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of("*"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}

// Dans filterChain :
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
    .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ← clé du fix
        ...
    )
```

**3 fixes combinés :**
1. `CorsConfigurationSource` bean dédié avec `setAllowedOriginPatterns("*")`
2. `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` — preflight toujours autorisé
3. `.cors(cors -> cors.configurationSource(...))` — CORS appliqué avant le filtre JWT
