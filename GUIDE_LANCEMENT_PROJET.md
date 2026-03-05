# 🚀 GUIDE COMPLET POUR LANCER LE PROJET

## 📋 Prérequis

- **MySQL** installé et démarré sur le port 3306
- **Node.js** et **npm** installés
- **Java JDK** 17+ installé

---

## ÉTAPE 1: Démarrer les Services Backend (Microservices)

### 1.1 Discovery Service (Eureka) - Port 8761
```bash
cd microservices/discovery-service
./mvnw.cmd spring-boot:run
```
> Laisser ce terminal ouvert!

### 1.2 Gateway Service - Port 8080
```bash
# NOUVEAU TERMINAL
cd microservices/gateway-service
./mvnw.cmd spring-boot:run
```

### 1.3 Service User - Port 8081
```bash
# NOUVEAU TERMINAL
cd microservices/service-user
./mvnw.cmd spring-boot:run
```

### 1.4 Service Feedback - Port 8082
```bash
# NOUVEAU TERMINAL
cd microservices/service-feedback
./mvnw.cmd clean compile
./mvnw.cmd spring-boot:run
```

---

## ÉTAPE 2: Vérifier que les Services sont UP

Ouvrir http://localhost:8761 dans votre navigateur et vérifier:
- ✅ GATEWAY-SERVICE: UP
- ✅ SERVICE-USER: UP
- ✅ SERVICE-FEEDBACK: UP

---

## ÉTAPE 3: Démarrer les Frontends

### 3.1 Frontend Étudiant (angular-app) - Port 4200
```bash
# NOUVEU TERMINAL
cd frontend/angular-app
npm install
ng serve
```

### 3.2 Frontend Admin (back-office) - Port 4201
```bash
# NOUVEU TERMINAL
cd back-office
npm install
ng serve --port 4201
```

---

## 🌐 URLs d'Accès

| Application | URL |
|------------|-----|
| **Frontend Étudiant** | http://localhost:4200 |
| **Frontend Admin** | http://localhost:4201 |
| **Eureka Dashboard** | http://localhost:8761 |
| **API Feedback** | http://localhost:8082/api |

---

## 👨‍🎓 SCÉNARIO DE TEST: UTILISATEUR ÉTUDIANT

### Option A: Sans authentification Keycloak (Développement)

L'application fonctionne **sans login** en mode développement. Les étudiants peuvent directement:

1. **Accéder à http://localhost:4200**
2. **Soumettre un Feedback**:
   - Cliquer sur "Donner un feedback"
   - Remplir la note (1-5)
   - Écrire un commentaire
   - Valider

3. **Créer une Réclamation**:
   - Cliquer sur "Mes Réclamations"
   - Cliquer sur "Nouvelle réclamation"
   - Remplir l'objet et la description
   - Valider

### Option B: Avec Keycloak (Production)

Si Keycloak est configuré:

1. **Créer un utilisateur dans Keycloak**:
   - Aller sur http://localhost:8180/admin
   - Menu: Users → Add User
   - Remplir username, email
   - Définir le rôle: **ETUDIANT**
   - Créer un mot de passe temporaire

2. **Login étudiant**:
   - Aller sur http://localhost:4200
   - Cliquer sur "Connexion"
   - Redirection vers Keycloak
   - Entrer username et mot de passe

---

## 📱 Fonctionnalités Étudiant

### Tableau de Bord (Dashboard)
- `/dashboard` - Vue d'ensemble de mes activités
- `/feedbacks` - Mes feedbacks soumis
- `/reclamations` - Mes réclamations

### Soumettre un Feedback
```http
POST http://localhost:8082/api/feedbacks
Content-Type: application/json

{
  "userId": 1,
  "moduleId": 1,
  "note": 4,
  "commentaire": "Excellents cours!",
  "sentiment": "POSITIF"
}
```

### Créer une Réclamation
```http
POST http://localhost:8082/api/reclamations
Content-Type: application/json

{
  "userId": 1,
  "objet": "Problème avec le cours",
  "description": "Je n'arrive pas à accéder aux vidéos",
  "priorite": "MOYENNE"
}
```

---

## 👨‍💼 Scénario: Administrateur

1. **Accéder à http://localhost:4201**
2. **Menu Analytiques**: Voir les statistiques globales
3. **Gérer les Réclamations**: Modifier le statut, la priorité

---

## 🧪 Tests API Rapides

```bash
# Health check
curl http://localhost:8082/api/reports/health

# Liste feedbacks
curl http://localhost:8082/api/feedbacks

# Liste réclamations
curl http://localhost:8082/api/reclamations

# Analytics
curl http://localhost:8082/api/reclamations/analytics
```

---

## ⚠️ Dépannage

### Erreur: "Cannot connect to database"
→ Vérifier que MySQL est démarré et que la base existe

### Erreur: "Service unavailable"
→ Vérifier Eureka (http://localhost:8761)

### Erreur CORS sur le frontend
→ Les services backend sont bien démarrés

### Frontend angular-app ne démarre pas
```bash
cd frontend/angular-app
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Résumé des Commandes de Démarrage

```bash
# Terminal 1: Eureka
cd microservices/discovery-service && ./mvnw.cmd spring-boot:run

# Terminal 2: Gateway
cd microservices/gateway-service && ./mvnw.cmd spring-boot:run

# Terminal 3: Service User
cd microservices/service-user && ./mvnw.cmd spring-boot:run

# Terminal 4: Service Feedback
cd microservices/service-feedback && ./mvnw.cmd spring-boot:run

# Terminal 5: Frontend Étudiant
cd frontend/angular-app && ng serve

# Terminal 6: Frontend Admin
cd back-office && ng serve --port 4201
```

---

*Guide de lancement - Projet Gestions_Ramzi*
