# PLAN D'INTÉGRATION ANGULAR - microservices

## STRUCTURE ACTUELLE

### Frontend angular-app (étudiant)
- **Port**: 4200
- **Pages**: feedbacks, reclamations, feedbacks-dashboard, reclamations-dashboard
- **Services**: feedback.service.ts, reclamation.service.ts, auth.service.ts

### Back-office (admin)
- **Port**: 4201
- **Pages**: feedbacks, reclamations, analytics, resolutions, users
- **Services**: feedback.service.ts, reclamation.service.ts

---

## ÉTAPE 1: Configuration CORS et URLs

### 1.1 Configurer les URLs des APIs
Dans `frontend/angular-app/src/app/app.config.ts`:
```typescript
export const API_URLS = {
  feedback: 'http://localhost:8082/api/feedbacks',
  reclamation: 'http://localhost:8082/api/reclamations',
  resolutions: 'http://localhost:8082/api/resolutions',
  reports: 'http://localhost:8082/api/reports',
  dashboard: 'http://localhost:8082/api/dashboard',
  user: 'http://localhost:8081/api/users'
};
```

---

## ÉTAPE 2: Mettre à jour les services

### ✅ Services créés pour Frontend (angular-app)
1. **feedback.service.ts** - CRUD + Stats + Sentiment
2. **reclamation.service.ts** - CRUD + Analytics + Status + Priorité
3. **resolution.service.ts** - CRUD Actions de résolution

### ✅ Services créés pour Back-office
1. **feedback.service.ts** - CRUD + Stats + Sentiment
2. **reclamation.service.ts** - CRUD + Analytics + Status + Priorité
3. **resolution-action.service.ts** - CRUD Actions de résolution

---

## ÉTAPE 3: Configuration app.config.ts

### Ajouter dans `app.config.ts` (frontend et back-office):
```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

---

## ÉTAPE 3: Configuration app.config.ts

### Ajouter dans `app.config.ts` (frontend et back-office):
```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

---

## ÉTAPE 4: Pages Frontend

### 3.1 Page Feedbacks (List + Create)
- Liste tous les feedbacks
- Afficher sentiment (POSITIF/NEGATIF/NEUTRE)
- Formulaire création feedback
- Analyse sentiment automatique

### 3.2 Page Réclamations (List + Create)
- Liste toutes les réclamations
- Afficher catégorie (TECHNIQUE, FACTURATION, etc.)
- Formulaire création réclamation
- Classification automatique IA

### 3.3 Dashboard Étudiant
- Statistiques personnelles
- Graphiques sentiment

---

## ÉTAPE 4: Back-office

### 4.1 Pages Admin
- **Feedbacks**: Liste + détails + sentiment
- **Réclamations**: Liste + détails + statut + priorité
- **Analytics**: Graphiques + exports
- **Résolutions**: Gérer les actions

### 4.2 Services Admin
- FeedbackService
- ReclamationService  
- ResolutionActionService

---

## ÉTAPE 5: Lancer les applications

### 5.1 Démarrer microservices
```powershell
# Terminal 1: Service User
cd microservices/service-user
mvn spring-boot:run

# Terminal 2: Service Feedback
cd microservices/service-feedback
mvn spring-boot:run
```

### 5.2 Démarrer Frontend Étudiant
```powershell
# Terminal 3
cd frontend/angular-app
npm start
# Ou: ng serve --port 4200
```

### 5.3 Démarrer Back-office
```powershell
# Terminal 4
cd back-office
npm start
# Ou: ng serve --port 4201
```

---

## ÉTAPE 6: Tester l'intégration

### 6.1 Vérifier Frontend Étudiant
- Ouvrir: http://localhost:4200
- Créer un feedback → Vérifier sentiment
- Créer une réclamation → Vérifier classification

### 6.2 Vérifier Back-office
- Ouvrir: http://localhost:4201
- Voir les feedbacks/réclamations
- Modifier statut/priorité
- Voir analytics

---

## RÉSUMÉ DES COMMANDES

| Action | Commande |
|--------|----------|
| Démarrer Service User | `cd microservices/service-user && mvn spring-boot:run` |
| Démarrer Service Feedback | `cd microservices/service-feedback && mvn spring-boot:run` |
| Démarrer Frontend | `cd frontend/angular-app && npm start` |
| Démarrer Back-office | `cd back-office && npm start` |

---

## ENDPOINTS UTILISÉS

### Service Feedback (8082)
- `/api/feedbacks` - CRUD
- `/api/feedbacks/with-user` - Avec user
- `/api/feedbacks/stats` - Statistiques
- `/api/reclamations` - CRUD
- `/api/reclamations/with-user` - Avec user
- `/api/reclamations/analytics` - Analytics
- `/api/resolutions` - Actions résolution

### Service User (8081)
- `/api/users` - CRUD utilisateurs
