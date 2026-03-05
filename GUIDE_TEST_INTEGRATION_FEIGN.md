# GUIDE COMPLET - TEST DE L'INTÉGRATION SERVICE-FEEDBACK AVEC SERVICE-USER

## PRÉREQUIS

Assurez-vous que la compilation est réussie :
```powershell
cd C:\Users\MSI\Downloads\PI\Gestions_Ramzi\microservices\service-feedback
.\mvnw.cmd clean compile
```

---

## ÉTAPE 1 : DÉMARRAGE DES SERVICES

### Terminal 1 - service-user (port 8081)
```powershell
cd C:\Users\MSI\Downloads\PI\Gestions_Ramzi\microservices\service-user
.\mvnw.cmd spring-boot:run
```
**Attendre jusqu'à voir :** `Started ServiceUserApplication`

### Terminal 2 - service-feedback (port 8082)
```powershell
cd C:\Users\MSI\Downloads\PI\Gestions_Ramzi\microservices\service-feedback
.\mvnw.cmd spring-boot:run
```
**Attendre jusqu'à voir :** `Started ServiceFeedbackApplication`

---

## ÉTAPE 2 : TESTS API

### Test 1 : Créer un utilisateur
```powershell
Invoke-WebRequest -Uri "http://localhost:8081/api/users" -Method POST -ContentType "application/json" -Body '{"username":"john","email":"john@example.com","role":"ETUDIANT"}' -UseBasicParsing
```

**Résultat attendu :**
```json
{"id":1,"username":"john","email":"john@example.com","role":"ETUDIANT"}
```

---

### Test 2 : Créer un feedback (avec userId=1)
```powershell
Invoke-WebRequest -Uri "http://localhost:8082/api/feedbacks" -Method POST -ContentType "application/json" -Body '{"userId":1,"moduleId":1,"note":4,"commentaire":"Excellent cours!"}' -UseBasicParsing
```

**Résultat attendu :**
```json
{"id":1,"userId":1,"moduleId":1,"note":4,"commentaire":"Excellent cours!","date":"2026-03-05T12:00:00","sentiment":"POSITIF","user":null}
```

---

### Test 3 : Récupérer le feedback AVEC les infos utilisateur (ENDPOINT PRINCIPAL!)
```powershell
Invoke-WebRequest -Uri "http://localhost:8082/api/feedbacks/1/with-user" -Method GET -UseBasicParsing
```

**Résultat attendu (AVEC les infos utilisateur!) :**
```json
{
  "id": 1,
  "userId": 1,
  "moduleId": 1,
  "note": 4,
  "commentaire": "Excellent cours!",
  "date": "2026-03-05T12:00:00",
  "sentiment": "POSITIF",
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "role": "ETUDIANT"
  }
}
```

---

### Test 4 : Récupérer TOUS les feedbacks AVEC les infos utilisateur
```powershell
Invoke-WebRequest -Uri "http://localhost:8082/api/feedbacks/with-user" -Method GET -UseBasicParsing
```

---

## RÉSUMÉ DES ENDPOINTS

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `http://localhost:8081/api/users` | POST | Créer un utilisateur |
| `http://localhost:8081/api/users/1` | GET | Obtenir un utilisateur |
| `http://localhost:8082/api/feedbacks` | POST | Créer un feedback |
| `http://localhost:8082/api/feedbacks/1/with-user` | GET | **Feedback AVEC infos utilisateur** |
| `http://localhost:8082/api/feedbacks/with-user` | GET | **TOUS les feedbacks AVEC infos** |

---

## DÉPANNAGE

### Erreur : "Connection refused"
- Vérifier que les deux services sont démarrés
- Vérifier les ports : 8081 (user) et 8082 (feedback)

### Erreur : "user is null"
- C'est normal si l'utilisateur n'existe pas dans service-user
- Le système est conçu pour continuer sans les infos utilisateur

### Vérifier que service-user répond
```powershell
Invoke-WebRequest -Uri "http://localhost:8081/api/users" -Method GET -UseBasicParsing
```

### Vérifier que service-feedback répond
```powershell
Invoke-WebRequest -Uri "http://localhost:8082/api/feedbacks" -Method GET -UseBasicParsing
```

