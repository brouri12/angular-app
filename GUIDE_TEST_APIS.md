# Guide de Test des APIs - Service Feedback & Service User

## Prérequis
- Assurez-vous que les services sont démarrés:
  - service-user sur port 8081
  - service-feedback sur port 8082
  - Eureka sur port 8761

---

## Scénario 1: Service User (Port 8081)

### 1.1 Créer un utilisateur
```
bash
curl -X POST http://localhost:8081/api/users -H "Content-Type: application/json" -d "{\"username\":\"john_doe\",\"email\":\"john@example.com\",\"role\":\"ETUDIANT\"}"
```

**Résultat attendu:**
```
json
{"id":1,"username":"john_doe","email":"john@example.com","role":"ETUDIANT"}
```

### 1.2 Lister tous les utilisateurs
```
bash
curl -X GET http://localhost:8081/api/users
```

### 1.3 Récupérer un utilisateur par ID
```
bash
curl -X GET http://localhost:8081/api/users/1
```

---

## Scénario 2: Feedbacks avec Analyse de Sentiment (Port 8082)

### 2.1 Créer un feedback (Analyse sentiment automatique)
```
bash
curl -X POST http://localhost:8082/api/feedbacks -H "Content-Type: application/json" -d "{\"userId\":1,\"moduleId\":101,\"note\":5,\"commentaire\":\"Excellent cours, j'apprends beaucoup!\"}"
```

**Résultat attendu:**
```
json
{
  "id":1,
  "userId":1,
  "moduleId":101,
  "note":5,
  "commentaire":"Excellent cours, j'apprends beaucoup!",
  "sentiment":"POSITIF"
}
```
✅ L'IA détecte automatiquement le sentiment POSITIF

### 2.2 Tester sentiment NÉGATIF
```
bash
curl -X POST http://localhost:8082/api/feedbacks -H "Content-Type: application/json" -d "{\"userId\":1,\"moduleId\":101,\"note\":1,\"commentaire\":\"C'est vraiment nul ce cours!\"}"
```

**Résultat attendu:** `"sentiment":"NEGATIF"`

### 2.3 Lister tous les feedbacks
```
bash
curl -X GET http://localhost:8082/api/feedbacks
```

---

## Scénario 3: Intégration Feign - Feedback avec Infos Utilisateur ⭐

### 3.1 Récupérer un feedback avec les infos utilisateur
```
bash
curl -X GET http://localhost:8082/api/feedbacks/1/with-user
```

**Résultat attendu:**
```
json
{
  "id":1,
  "userId":1,
  "moduleId":101,
  "note":5,
  "commentaire":"Excellent cours!",
  "sentiment":"POSITIF",
  "user":{
    "id":1,
    "username":"john_doe",
    "email":"john@example.com",
    "role":"ETUDIANT"
  }
}
```

✅ **EXPLICATION:** Cette endpoint appelle service-user via Feign Client pour récupérer les informations complètes de l'utilisateur!

### 3.2 Récupérer tous les feedbacks avec infos utilisateur
```
bash
curl -X GET http://localhost:8082/api/feedbacks/with-user
```

---

## Scénario 4: Réclamations avec Classification IA (Port 8082)

### 4.1 Créer une réclamation (Classification automatique)
```
bash
curl -X POST http://localhost:8082/api/reclamations -H "Content-Type: application/json" -d "{\"userId\":1,\"objet\":\"Probleme de note\",\"description\":\"Ma note d'examen n'est pas correcte\"}"
```

**Résultat attendu:**
```
json
{
  "id":1,
  "userId":1,
  "objet":"Probleme de note",
  "description":"Ma note d'examen n'est pas correcte",
  "status":"EN_ATTENTE",
  "priorite":"MOYENNE",
  "categorie":"NOTE"
}
```
✅ L'IA classifie automatiquement en "NOTE"

### 4.2 Tester classification TECHNIQUE
```
bash
curl -X POST http://localhost:8082/api/reclamations -H "Content-Type: application/json" -d "{\"userId\":1,\"objet\":\"Site HS\",\"description\":\"Je n'arrive pas à me connecter à la plateforme\"}"
```

**Résultat attendu:** `"categorie":"TECHNIQUE"`

### 4.3 Tester classification ADMINISTRATIF
```
bash
curl -X POST http://localhost:8082/api/reclamations -H "Content-Type: application/json" -d "{\"userId\":1,\"objet\":\"Certificat\",\"description\":\"Comment obtenir mon certificat de scolarité?\"}"
```

**Résultat attendu:** `"categorie":"ADMINISTRATIF"`

---

## Scénario 5: Intégration Feign - Réclamation avec User ⭐

### 5.1 Récupérer une réclamation avec infos utilisateur
```
bash
curl -X GET http://localhost:8082/api/reclamations/1/with-user
```

**Résultat attendu:**
```
json
{
  "id":1,
  "userId":1,
  "objet":"Probleme de note",
  "status":"EN_ATTENTE",
  "categorie":"NOTE",
  "user":{
    "id":1,
    "username":"john_doe",
    "email":"john@example.com",
    "role":"ETUDIANT"
  }
}
```

### 5.2 Récupérer toutes les réclamations avec user
```
bash
curl -X GET http://localhost:8082/api/reclamations/with-user
```

---

## Scénario 6: Fonctionnalités Avancées

### 6.1 Statistiques feedbacks par étudiant
```bash
curl -X GET "http://localhost:8082/api/dashboard/student/1/feedbacks"
```

**Résultat attendu:**
```
json
{
  "userId":1,
  "totalFeedbacks":5,
  "noteMoyenne":4.2,
  "feedbacksParSentiment":{"POSITIF":3,"NEUTRE":1,"NEGATIF":1}
}
```

### 6.2 Statistiques réclamations par étudiant
```
bash
curl -X GET "http://localhost:8082/api/dashboard/student/1/reclamations"
```

### 6.3 Statistiques sentiments globaux
```
bash
curl -X GET http://localhost:8082/api/feedbacks/stats/sentiments
```

### 6.4 Statistiques par cours
```
bash
curl -X GET "http://localhost:8082/api/feedbacks/stats/module/101"
```

---

## Scénario 7: Pièces Jointes

### 7.1 Upload un fichier
```
bash
curl -X POST http://localhost:8082/api/piecesjointes/upload -F "file=@fichier.pdf" -F "reclamationId=1"
```

### 7.2 Télécharger un fichier
```
bash
curl -X GET http://localhost:8082/api/piecesjointes/1/download
```

---

## Résumé des Endpoints Clés

| Fonction | Endpoint | Méthode |
|----------|----------|---------|
| Créer user | /api/users | POST |
| Lister users | /api/users | GET |
| Créer feedback | /api/feedbacks | POST |
| Feedback + user | /api/feedbacks/{id}/with-user | GET |
| Tous + user | /api/feedbacks/with-user | GET |
| Créer réclamation | /api/reclamations | POST |
| Réclamation + user | /api/reclamations/{id}/with-user | GET |
| Stats étudiant | /api/dashboard/student/{id}/* | GET |
| Stats sentiments | /api/feedbacks/stats/sentiments | GET |

---

## Explication de l'Intégration

### Qu'est-ce que Feign?
Feign est un client HTTP déclaratif qui permet aux microservices de communiquer entre eux facilement.

### Comment ça marche?
1. **service-feedback** a un `UserClient` (interface Feign)
2. Quand vous appelez `/api/feedbacks/1/with-user`, le service:
   - Récupère le feedback de sa propre base de données
   - Appelle `service-user` via Feign pour obtenir les infos utilisateur
   - Combine les deux dans la réponse

### Pourquoi c'est utile?
- Plus besoin de dupliquer les données utilisateur
- Un seul endroit pour gérer les utilisateurs
- Communication faiblement couplée entre services
