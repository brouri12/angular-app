# GUIDE COMPLET DE TEST DES APIS - Service Feedback

## PRÉREQUIS
- Service User démarré sur port **8081**
- Service Feedback démarré sur port **8082**

---

# 🔷 SERVICE USER (Port 8081)

## 1. UTILISATEURS - CRUD

### 1.1 Créer un utilisateur
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/users" -Method Post -ContentType "application/json" -Body '{"username":"john_doe","email":"john@example.com","role":"ETUDIANT"}'
```

### 1.2 Lister tous les utilisateurs
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/users" -Method Get
```

### 1.3 Récupérer un utilisateur par ID
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/users/1" -Method Get
```

### 1.4 Mettre à jour un utilisateur
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/users/1" -Method Put -ContentType "application/json" -Body '{"username":"john_updated","email":"john.updated@example.com","role":"ENSEIGNANT"}'
```

### 1.5 Supprimer un utilisateur
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/users/1" -Method Delete
```

---

# 🔷 SERVICE FEEDBACK (Port 8082)

## 2. FEEDBACKS - CRUD + SENTIMENT

### 2.1 Créer un feedback (avec analyse sentiment auto)
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks" -Method Post -ContentType "application/json" -Body '{"userId":1,"moduleId":101,"note":5,"commentaire":"Excellent cours, j apprends beaucoup!"}'
```

### 2.2 Créer un feedback NÉGATIF
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks" -Method Post -ContentType "application/json" -Body '{"userId":1,"moduleId":101,"note":1,"commentaire":"C est vraiment nul ce cours!"}'
```

### 2.3 Créer un feedback NEUTRE
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks" -Method Post -ContentType "application/json" -Body '{"userId":1,"moduleId":101,"note":3,"commentaire":"Cours correct mais peut mieux faire"}'
```

### 2.4 Lister tous les feedbacks
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks" -Method Get
```

### 2.5 Lister feedbacks par userId
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks?userId=1" -Method Get
```

### 2.6 Lister feedbacks par moduleId
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks?moduleId=101" -Method Get
```

### 2.7 Récupérer un feedback par ID
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/1" -Method Get
```

### 2.8 Mettre à jour un feedback
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/1" -Method Put -ContentType "application/json" -Body '{"note":4,"commentaire":"Bon cours mais un peu long"}'
```

### 2.9 Supprimer un feedback
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/1" -Method Delete
```

---

## 3. FEEDBACKS - INTÉGRATION FEIGN (AVEC USER)

### 3.1 Récupérer TOUS les feedbacks AVEC infos utilisateur
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/with-user" -Method Get
```

### 3.2 Récupérer UN feedback AVEC infos utilisateur
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/1/with-user" -Method Get
```

---

## 4. FEEDBACKS - STATISTIQUES

### 4.1 Statistiques globales des feedbacks
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/stats" -Method Get
```

### 4.2 Statistiques par module
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/stats?moduleId=101" -Method Get
```

### 4.3 Statistiques des sentiments
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/feedbacks/sentiment-stats" -Method Get
```

---

## 5. RÉCLAMATIONS - CRUD + CLASSIFICATION IA

### 5.1 Créer une réclamation (classification automatique)
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations" -Method Post -ContentType "application/json" -Body '{"userId":1,"objet":"Probleme de note","description":"Ma note d examen n est pas correcte"}'
```

### 5.2 Créer réclamation - Type TECHNIQUE
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations" -Method Post -ContentType "application/json" -Body '{"userId":1,"objet":"Site HS","description":"Je n arrive pas a me connecter a la plateforme"}'
```

### 5.3 Créer réclamation - Type ADMINISTRATIF
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations" -Method Post -ContentType "application/json" -Body '{"userId":1,"objet":"Certificat","description":"Comment obtenir mon certificat de scolarite?"}'
```

### 5.4 Créer réclamation - Type FACTURATION
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations" -Method Post -ContentType "application/json" -Body '{"userId":1,"objet":"Remboursement","description":"Je voudrais etre rembourse pour le cours"}'
```

### 5.5 Créer réclamation - Type QUALITÉ
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations" -Method Post -ContentType "application/json" -Body '{"userId":1,"objet":"Mauvais professeur","description":"Le professeur n est pas competent"}'
```

### 5.6 Lister toutes les réclamations
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations" -Method Get
```

### 5.7 Lister réclamations par userId
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations?userId=1" -Method Get
```

### 5.8 Lister réclamations par status
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations?status=en attente" -Method Get
```

### 5.9 Lister réclamations par priorité
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations?priorite=HAUTE" -Method Get
```

### 5.10 Récupérer une réclamation par ID
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/1" -Method Get
```

### 5.11 Mettre à jour une réclamation
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/1" -Method Put -ContentType "application/json" -Body '{"objet":"Nouveau titre","description":"Nouvelle description"}'
```

### 5.12 Mettre à jour le STATUT d'une réclamation
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/1/status" -Method Put -ContentType "application/json" -Body '{"status":"en cours"}'
```

### 5.13 Mettre à jour la PRIORITÉ d'une réclamation
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/1/priorite" -Method Put -ContentType "application/json" -Body '{"priorite":"HAUTE"}'
```

### 5.14 Supprimer une réclamation
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/1" -Method Delete
```

---

## 6. RÉCLAMATIONS - INTÉGRATION FEIGN (AVEC USER)

### 6.1 Récupérer TOUTES les réclamations AVEC infos utilisateur
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/with-user" -Method Get
```

### 6.2 Récupérer UNE réclamation AVEC infos utilisateur
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/1/with-user" -Method Get
```

---

## 7. RÉCLAMATIONS - ANALYTICS

### 7.1 Analytics global
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/analytics" -Method Get
```

### 7.2 Analytics par période
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reclamations/analytics?dateDebut=2024-01-01&dateFin=2024-12-31" -Method Get
```

---

## 8. DASHBOARD ÉTUDIANT

### 8.1 Statistiques feedbacks d'un étudiant
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/dashboard/student/1/feedbacks" -Method Get
```

### 8.2 Statistiques réclamations d'un étudiant
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/dashboard/student/1/reclamations" -Method Get
```

### 8.3 Résumé complet dashboard
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/dashboard/student/1/summary" -Method Get
```

---

## 9. RAPPORTS

### 9.1 Rapport feedbacks Excel
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reports/feedbacks/excel" -Method Get
```

### 9.2 Rapport feedbacks PDF
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reports/feedbacks/pdf" -Method Get
```

### 9.3 Rapport réclamations Excel
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reports/reclamations/excel" -Method Get
```

### 9.4 Rapport réclamations PDF
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reports/reclamations/pdf" -Method Get
```

### 9.5 Health check
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/reports/health" -Method Get
```

---

## 10. ACTIONS DE RÉSOLUTION

### 10.1 Lister toutes les actions
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/resolutions" -Method Get
```

### 10.2 Récupérer une action par ID
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/resolutions/1" -Method Get
```

### 10.3 Actions pour une réclamation
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/resolutions/reclamation/1" -Method Get
```

### 10.4 Créer une action de résolution
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/resolutions" -Method Post -ContentType "application/json" -Body '{"reclamationId":1,"description":"Action prise","typeAction":"RESOLU"}'
```

### 10.5 Mettre à jour une action
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/resolutions/1" -Method Put -ContentType "application/json" -Body '{"description":"Description mise a jour"}'
```

### 10.6 Supprimer une action
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/resolutions/1" -Method Delete
```

---

## 11. PIÈCES JOINTES

### 11.1 Pièces jointes d'une réclamation
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/piecesjointes/reclamation/1" -Method Get
```

---

# ⚠️ EN CAS D'ERREUR

Si une commande retourne une erreur :
1. Copiez le message d'erreur
2. Envoyez-le moi
3. Je debuggerai et corrigerai le problème

---

# ✅ RÉSUMÉ DES ENDPOINTS

| Service | Ressource | Méthodes |
|---------|-----------|----------|
| User | /api/users | GET, POST, PUT, DELETE |
| Feedback | /api/feedbacks | GET, POST, PUT, DELETE |
| Feedback | /api/feedbacks/with-user | GET |
| Feedback | /api/feedbacks/{id}/with-user | GET |
| Feedback | /api/feedbacks/stats | GET |
| Feedback | /api/feedbacks/sentiment-stats | GET |
| Reclamation | /api/reclamations | GET, POST, PUT, DELETE |
| Reclamation | /api/reclamations/with-user | GET |
| Reclamation | /api/reclamations/{id}/with-user | GET |
| Reclamation | /api/reclamations/analytics | GET |
| Reclamation | /api/reclamations/{id}/status | PUT |
| Reclamation | /api/reclamations/{id}/priorite | PUT |
| Dashboard | /api/dashboard/student/{id}/feedbacks | GET |
| Dashboard | /api/dashboard/student/{id}/reclamations | GET |
| Dashboard | /api/dashboard/student/{id}/summary | GET |
| Reports | /api/reports/feedbacks/excel | GET |
| Reports | /api/reports/feedbacks/pdf | GET |
| Reports | /api/reports/reclamations/excel | GET |
| Reports | /api/reports/reclamations/pdf | GET |
| Reports | /api/reports/health | GET |
| Resolutions | /api/resolutions | GET, POST, PUT, DELETE |
| Resolutions | /api/resolutions/reclamation/{id} | GET |
| Pièces jointes | /api/piecesjointes/reclamation/{id} | GET |
