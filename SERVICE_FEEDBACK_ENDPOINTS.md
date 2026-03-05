# 📋 RÉSUMÉ COMPLET DES ENDPOINTS ET FONCTIONNALITÉS DU SERVICE-FEEDBACK

## 📊 Résumé des Controllers

| Controller | Nombre d'Endpoints | Préfixe |
|------------|---------------------|---------|
| FeedbackController | 11 | `/api/feedbacks` |
| ReclamationController | 13 | `/api/reclamations` |
| ReportController | 5 | `/api/reports` |
| ResolutionActionController | 6 | `/api/resolutions` |
| StudentDashboardController | 3 | `/api/dashboard` |
| PieceJointeController | 4 | `/api/piecesjointes` |
| **TOTAL** | **42 endpoints** | - |

---

## 1. FeedbackController (`/api/feedbacks`)

### CRUD - Feedback:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/feedbacks` | Récupérer tous les feedbacks (avec filtres: userId, moduleId) |
| GET | `/api/feedbacks/{id}` | Récupérer un feedback par ID |
| POST | `/api/feedbacks` | Créer un nouveau feedback |
| PUT | `/api/feedbacks/{id}` | Mettre à jour un feedback |
| DELETE | `/api/feedbacks/{id}` | Supprimer un feedback |

### Fonctionnalités avancées - Feedback:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/feedbacks/with-user` | Récupérer tous les feedbacks AVEC les infos utilisateur |
| GET | `/api/feedbacks/{id}/with-user` | Récupérer un feedback AVEC les infos utilisateur |
| GET | `/api/feedbacks/stats` | Obtenir les statistiques des feedbacks |
| GET | `/api/feedbacks/sentiment-stats` | Obtenir les statistiques de sentiment |

---

## 2. ReclamationController (`/api/reclamations`)

### CRUD - Réclamation:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reclamations` | Récupérer toutes les réclamations (filtres: userId, status, priorite) |
| GET | `/api/reclamations/{id}` | Récupérer une réclamation par ID |
| POST | `/api/reclamations` | Créer une nouvelle réclamation |
| PUT | `/api/reclamations/{id}` | Mettre à jour une réclamation |
| DELETE | `/api/reclamations/{id}` | Supprimer une réclamation |

### Fonctionnalités avancées - Réclamation:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reclamations/with-user` | Récupérer toutes les réclamations AVEC les infos utilisateur |
| GET | `/api/reclamations/{id}/with-user` | Récupérer une réclamation AVEC les infos utilisateur |
| GET | `/api/reclamations/analytics` | Obtenir les analytiques des réclamations (par période) |
| PUT | `/api/reclamations/{id}/status` | Mettre à jour le statut d'une réclamation |
| PUT | `/api/reclamations/{id}/priorite` | Mettre à jour la priorité d'une réclamation |
| POST | `/api/reclamations` | **Classification automatique** de la catégorie via IA |

---

## 3. ReportController (`/api/reports`)

### Génération de rapports:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reports/health` | Health check du service de rapports |
| GET | `/api/reports/feedbacks/excel` | Télécharger le rapport Excel des feedbacks |
| GET | `/api/reports/feedbacks/pdf` | Télécharger le rapport PDF des feedbacks |
| GET | `/api/reports/reclamations/excel` | Télécharger le rapport Excel des réclamations |
| GET | `/api/reports/reclamations/pdf` | Télécharger le rapport PDF des réclamations |

---

## 4. ResolutionActionController (`/api/resolutions`)

### CRUD - Actions de résolution:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/resolutions` | Récupérer toutes les actions de résolution |
| GET | `/api/resolutions/{id}` | Récupérer une action par ID |
| GET | `/api/resolutions/reclamation/{reclamationId}` | Récupérer les actions d'une réclamation |
| POST | `/api/resolutions` | Créer une action de résolution |
| PUT | `/api/resolutions/{id}` | Mettre à jour une action |
| DELETE | `/api/resolutions/{id}` | Supprimer une action |

---

## 5. StudentDashboardController (`/api/dashboard`)

### Dashboard Étudiant:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/dashboard/student/{userId}/feedbacks` | Statistiques de feedback pour un étudiant |
| GET | `/api/dashboard/student/{userId}/reclamations` | Statistiques de réclamation pour un étudiant |
| GET | `/api/dashboard/student/{userId}/summary` | Résumé complet du dashboard étudiant |

---

## 6. PieceJointeController (`/api/piecesjointes`)

### Gestion des fichiers joints:
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/piecesjointes/reclamation/{reclamationId}` | Liste des fichiers d'une réclamation |
| POST | `/api/piecesjointes/upload` | Uploader un fichier |
| GET | `/api/piecesjointes/{id}/download` | Télécharger un fichier |
| DELETE | `/api/piecesjointes/{id}` | Supprimer un fichier |

---

## 7. Fonctionnalités Avancées Implémentées

### 🔍 Analyse de Sentiment (AI/ML)
- **Classification automatique** des sentiments: POSITIF, NEGATIF, NEUTRE
- Service: `SentimentAnalysisService`
- Statistiques de sentiment par feedback

### 🏷️ Classification Automatique des Réclamations
- **Détection automatique** de la catégorie via IA
- Catégories: TECHNIQUE, FACTURATION, QUALITE, ADMINISTRATIF, AUTRE
- Service: `ClassificationReclamationService`

### 📊 Analytics et Statistiques
- Statistiques globales des feedbacks
- Analytiques des réclamations (par statut, priorité, catégorie)
- Temps de résolution moyen
- Répartition par note/sentiment

### 🔔 Notifications
- Notification pour nouveaux feedbacks
- Notification pour feedbacks négatifs
- Notification pour nouvelles réclamations
- Notification pour réclamations urgentes (priorité HAUTE/CRITIQUE)
- Notification lors de la résolution d'une réclamation
- Service: `NotificationService`

### 📎 Gestion des Pièces Jointes
- Upload et gestion de fichiers pour les réclamations
- Controller: `PieceJointeController`
- Service: `PieceJointeService`

### 🔗 Intégration Microservices (Feign)
- Communication avec `service-user` pour récupérer les infos utilisateur
- Intercepteur de token Feign pour propager les headers d'authentification
- Client: `UserClient`

### 📑 Priorités des Réclamations
- BASSE, MOYENNE, HAUTE, CRITIQUE
- Mise à jour séparée de la priorité

---

## 8. Entités principales

| Entité | Description |
|--------|-------------|
| Feedback | Retour d'expérience avec note (1-5), commentaire, sentiment |
| Reclamation | Réclamation avec objet, description, statut, priorité, catégorie |
| ResolutionAction | Actions de résolution associées aux réclamations |
| PieceJointe | Fichiers joints aux réclamations |
| Sentiment | Enum: POSITIF, NEGATIF, NEUTRE |
| Priorite | Enum: BASSE, MOYENNE, HAUTE, CRITIQUE |
| CategorieReclamation | Enum: TECHNIQUE, FACTURATION, QUALITE, ADMINISTRATIF, AUTRE |

---

## 📌 URLs de base

- **Feedbacks**: `http://localhost:8082/api/feedbacks`
- **Réclamations**: `http://localhost:8082/api/reclamations`
- **Rapports**: `http://localhost:8082/api/reports`
- **Résolutions**: `http://localhost:8082/api/resolutions`
- **Pièces jointes**: `http://localhost:8082/api/pieces-jointes`

---

## 🔧 Services implémentés

| Service | Description |
|---------|-------------|
| FeedbackService | Gestion des feedbacks (CRUD + stats + sentiment) |
| ReclamationService | Gestion des réclamations (CRUD + analytics + classification auto) |
| SentimentAnalysisService | Analyse de sentiment AI/ML |
| ClassificationReclamationService | Classification automatique des catégories |
| NotificationService | Système de notifications |
| ReportService | Génération de rapports PDF/Excel |
| ResolutionActionService | Gestion des actions de résolution |
| PieceJointeService | Gestion des fichiers joints |
| UserService | Communication avec service-user (Feign) |

