# 🎓 Gestions_Ramzi - Plateforme de Gestion des Feedbacks et Réclamations

![Java](https://img.shields.io/badge/Java-17+-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen.svg)
![Angular](https://img.shields.io/badge/Angular-17+-red.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)

## 📋 Présentation du Projet

**Gestions_Ramzi** est une plateforme d'apprentissage moderne basée sur une architecture microservices permettant de gérer les feedbackset les réclamations des étudiants. Le projet comprend un backend Spring Boot et un frontend Angular, avec une intégration optionnelle Keycloak pour l'authentification sécurisée.

---

## 🏗️ Architecture du Projet

### Architecture Microservices

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Angular)                           │
│  ┌──────────────────────┐        ┌────────────────────────────┐   │
│  │   Frontend Étudiant  │        │     Back-Office Admin      │   │
│  │    (Port 4200)      │        │       (Port 4201)         │   │
│  └──────────────────────┘        └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GATEWAY (Spring Cloud Gateway)                   │
│                         Port 8080                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌─────────────────────────────┐     ┌─────────────────────────────────┐
│      DISCOVERY SERVICE      │     │        SERVICE-FEEDBACK         │
│     (Eureka Server)         │     │          Port 8082              │
│        Port 8761            │     │                                 │
└─────────────────────────────┘     │  - Feedbacks                   │
                                    │  - Reclamations                 │
                                    │  - Résolutions                  │
                                    │  - Analytics                    │
                                    │  - Rapports PDF/Excel           │
                                    │  - Analyse de Sentiment (AI)    │
                                    └─────────────────────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────────────────────┐
                                    │         SERVICE-USER            │
                                    │          Port 8081              │
                                    │                                 │
                                    │  - Gestion des utilisateurs     │
                                    │  - Authentification             │
                                    └─────────────────────────────────┘
```

---

## 📁 Structure du Projet

```
Gestions_Ramzi/
├── README.md                    # Ce fichier
├── microservices/               # Backend Spring Boot
│   ├── discovery-service/      # Eureka Server (Service Discovery)
│   ├── gateway-service/        # API Gateway
│   ├── config-server/          # Configuration Server
│   ├── service-user/           # Service Gestion Utilisateurs
│   ├── service-feedback/       # Service Feedback & Réclamations
│   └── service-pronunciation/ # Service Prononciation
├── frontend/                   # Frontend Angular
│   └── angular-app/            # Application Étudiant (Port 4200)
├── back-office/                # Application Admin (Port 4201)
└── UI_UX Design/               # Design UI/UX Figma
```

---

## 🚀 Fonctionnalités Implémentées

### 📊 Gestion des Feedbacks

| Fonctionnalité | Description |
|---------------|-------------|
| ✅ CRUD Complet | Créer, Lire, Mettre à jour, Supprimer des feedbacks |
| ✅ Analyse de Sentiment | Classification automatique POSITIF/NEGATIF/NEUTRE via IA |
| ✅ Statistiques | Notes moyennes, répartition par sentiment |
| ✅ Export PDF/Excel | Génération de rapports détaillés |
| ✅ Filtrage | Par utilisateur, par module |

### 🎫 Gestion des Réclamations

| Fonctionnalité | Description |
|---------------|-------------|
| ✅ CRUD Complet | Gestion complète des réclamations |
| ✅ Classification Automatique | Détection automatique de catégorie (TECHNIQUE, FACTURATION, QUALITÉ, ADMINISTRATIF) |
| ✅ Priorités | BASSE, MOYENNE, HAUTE, CRITIQUE |
| ✅ Statuts | OUVERTE, EN_COURS, RESOLUE, FERMEE |
| ✅ Pièces Jointes | Upload et gestion de fichiers |
| ✅ Analytics | Statistiques par période, catégorie, priorité |
| ✅ Résolutions | Suivi des actions de résolution |

### 👨‍💼 Dashboard Administrateur

- Vue d'ensemble avec statistiques globales
- Gestion des feedbacks et réclamations
- Tableau de bord analytique
- Export des données (PDF/Excel)

### 👨‍🎓 Dashboard Étudiant

- Soumission de feedbacks
- Création de réclamations
- Suivi de mes activités
- Statistiques personnelles

### 🔐 Sécurité (Optionnelle)

- Intégration Keycloak possible
- Authentification OAuth2/JWT
- Gestion des rôles (ADMIN, ENSEIGNANT, ETUDIANT)

---

## 💻 Technologies Utilisées

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Java | 17+ | Langage principal |
| Spring Boot | 3.2.2 | Framework Backend |
| Spring Cloud | 2023.0.1 | Microservices |
| Spring Data JPA | - | Accès données |
| MySQL | 8.0 | Base de données |
| Eureka | - | Service Discovery |
| OpenFeign | - | Communication inter-services |
| Apache POI | 5.2.5 | Génération Excel |
| iText7 | 7.2.5 | Génération PDF |

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Angular | 17+ | Framework frontend |
| TypeScript | 5.x | Langage |
| Tailwind CSS | 3.x | Styling |
| RxJS | - | Programmation réactive |

### Outils

| Outil | Usage |
|-------|-------|
| Maven | Build backend |
| npm | Gestion dépendances frontend |
| Git | Contrôle de version |
| IntelliJ IDEA / VSCode | IDE |

---

## 📋 Guide de Démarrage

### Prérequis

- **Java JDK** 17+
- **Node.js** 18+ et **npm**
- **MySQL** 8.0+ (port 3306)
- **Maven** 3.8+

### Étape 1: Base de données

Créer une base de données MySQL :

```sql
CREATE DATABASE gestions_ramzi_feedback;
```

### Étape 2: Backend - Lancer les Microservices

#### 2.1 Discovery Service (Eureka)
```bash
cd microservices/discovery-service
./mvnw.cmd spring-boot:run
```

#### 2.2 Gateway Service
```bash
# Nouveau terminal
cd microservices/gateway-service
./mvnw.cmd spring-boot:run
```

#### 2.3 Service User
```bash
# Nouveau terminal
cd microservices/service-user
./mvnw.cmd spring-boot:run
```

#### 2.4 Service Feedback
```bash
# Nouveau terminal
cd microservices/service-feedback
./mvnw.cmd clean compile
./mvnw.cmd spring-boot:run
```

### Étape 3: Frontend

#### 3.1 Application Étudiant
```bash
cd frontend/angular-app
npm install
ng serve
# Accès: http://localhost:4200
```

#### 3.2 Back-Office Admin
```bash
cd back-office
npm install
ng serve --port 4201
# Accès: http://localhost:4201
```

---

## 🔌 API Endpoints

### Feedbacks (`/api/feedbacks`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/feedbacks` | Liste des feedbacks |
| GET | `/api/feedbacks/{id}` | Détail d'un feedback |
| POST | `/api/feedbacks` | Créer un feedback |
| PUT | `/api/feedbacks/{id}` | Modifier un feedback |
| DELETE | `/api/feedbacks/{id}` | Supprimer un feedback |
| GET | `/api/feedbacks/stats` | Statistiques |
| GET | `/api/feedbacks/sentiment-stats` | Stats sentiment |

### Réclamations (`/api/reclamations`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reclamations` | Liste des réclamations |
| GET | `/api/reclamations/{id}` | Détail d'une réclamation |
| POST | `/api/reclamations` | Créer une réclamation |
| PUT | `/api/reclamations/{id}` | Modifier une réclamation |
| PUT | `/api/reclamations/{id}/status` | Changer le statut |
| PUT | `/api/reclamations/{id}/priorite` | Changer la priorité |
| GET | `/api/reclamations/analytics` | Analytiques |

### Résolutions (`/api/resolutions`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/resolutions` | Liste des résolutions |
| POST | `/api/resolutions` | Créer une résolution |
| GET | `/api/resolutions/reclamation/{id}` | Résolutions par réclamation |

### Rapports (`/api/reports`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reports/health` | Health check |
| GET | `/api/reports/feedbacks/pdf` | Export PDF feedbacks |
| GET | `/api/reports/feedbacks/excel` | Export Excel feedbacks |
| GET | `/api/reports/reclamations/pdf` | Export PDF réclamations |
| GET | `/api/reports/reclamations/excel` | Export Excel réclamations |

---

## 🧪 Tests API

```bash
# Health check
curl http://localhost:8082/api/reports/health

# Liste feedbacks
curl http://localhost:8082/api/feedbacks

# Liste réclamations
curl http://localhost:8082/api/reclamations

# Analytics réclamations
curl http://localhost:8082/api/reclamations/analytics

# Stats feedbacks
curl http://localhost:8082/api/feedbacks/stats
```

---

## 📱 Interfaces

### Frontend Étudiant (Port 4200)
- Page d'accueil
- Formulaire de feedback
- Gestion des réclamations
- Dashboard personnel

### Back-Office Admin (Port 4201)
- Dashboard avec statistiques
- Gestion des feedbacks
- Gestion des réclamations
- Gestion des résolutions
- Analytics

---

## 🔧 Configuration

### Ports par défaut

| Service | Port |
|---------|------|
| Discovery (Eureka) | 8761 |
| Gateway | 8080 |
| Service User | 8081 |
| Service Feedback | 8082 |
| Frontend Étudiant | 4200 |
| Back-Office | 4201 |

### Base de données

```properties
# service-feedback/src/main/resources/application.yml
spring.datasource.url=jdbc:mysql://localhost:3306/gestions_ramzi_feedback
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

---

## 📝 Entités Principales

### Feedback
- `id`: Long
- `userId`: Long
- `moduleId`: Long
- `note`: Integer (1-5)
- `commentaire`: String
- `sentiment`: Enum (POSITIF, NEGATIF, NEUTRE)
- `dateCreation`: LocalDateTime

### Reclamation
- `id`: Long
- `userId`: Long
- `objet`: String
- `description`: String
- `statut`: Enum (OUVERTE, EN_COURS, RESOLUE, FERMEE)
- `priorite`: Enum (BASSE, MOYENNE, HAUTE, CRITIQUE)
- `categorie`: Enum (TECHNIQUE, FACTURATION, QUALITE, ADMINISTRATIF, AUTRE)
- `dateCreation`: LocalDateTime
- `dateResolution`: LocalDateTime

### ResolutionAction
- `id`: Long
- `reclamationId`: Long
- `description`: String
- `dateCreation`: LocalDateTime

---

## 🚢 Déploiement

### Build Backend

```bash
# Compiler les microservices
cd microservices/service-feedback
mvn clean package -DskipTests

# Lancer le JAR
java -jar target/service-feedback-0.0.1-SNAPSHOT.jar
```

### Build Frontend

```bash
# Frontend étudiant
cd frontend/angular-app
ng build

# Back-office
cd back-office
ng build
```

---

## 📄 License

Ce projet est développé dans le cadre d'un projet académique.

---

## 👥 Auteurs

- **Ramzi** - Développeur principal

---

## 📞 Support

Pour toute question ou problème, veuillez consulter la documentation dans le dossier `GUIDE_*` ou contacter l'équipe de développement.

---

*Dernière mise à jour: 2025*

