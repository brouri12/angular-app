# 🚀 GUIDE DE LANCEMENT DU PROJET AVEC KEYCLOAK

## Prérequis
- MySQL démarré sur port 3306
- Java JDK 17+
- Node.js et npm

---

## ÉTAPE 1: Installer et Démarrer Keycloak

### 1.1 Télécharger Keycloak
Allez sur: https://github.com/keycloak/keycloak/releases/tag/23.0.7
Téléchargez `keycloak-23.0.7.zip`

### 1.2 Extraire
```
Clic droit → Extraire vers C:\keycloak
```

### 1.3 Démarrer Keycloak
```cmd
# NOUVEAU TERMINAL
cd C:\keycloak\keycloak-23.0.7
bin\kc.bat start-dev --http-port=8180
```

### 1.4 Configurer Admin
- Ouvrir: http://localhost:8180
- Cliquer "Administration Console"
- Login: **admin** / **admin123** (ou créer un nouveau)

---

## ÉTAPE 2: Configurer Keycloak

### 2.1 Créer le Realm
1. Menu déroulant master → "Create realm"
2. Nom: `gestions-ramzi`
3. Cliquer "Create"

### 2.2 Créer les Rôles
1. **Realm roles** → Create
2. Créer un par un:
   - `ADMIN`
   - `ENSEIGNANT`
   - `ETUDIANT`

### 2.3 Créer le Client
1. **Clients** → Create
2. **Client ID**: `frontend-app`
3. **Client Protocol**: `openid-connect`
4. **Next**
5. **Access Type**: `public`
6. **Valid Redirect URIs**: `http://localhost:4200/*`
7. **Web Origins**: `http://localhost:4200`
8. **Save**

### 2.4 Ajouter les rôles au client
1. Client `frontend-app` → **Roles** → Add Role
2. Ajouter: `ADMIN`, `ENSEIGNANT`, `ETUDIANT`

### 2.5 Créer un Utilisateur Étudiant
1. **Users** → Add User
2. **Username**: `etudiant1`
3. **Email**: `etudiant@test.com`
4. **Create**
5. Onglet **Credentials**: Password = `password123`, Temporary = OFF
6. Onglet **Role mapping** → Assign Role → `ETUDIANT`

### 2.6 Créer un Utilisateur Admin
1. **Users** → Add User
2. **Username**: `admin`
3. **Email**: `admin@test.com`
4. **Create**
5. **Credentials**: Password = `admin123`, Temporary = OFF
6. **Role mapping** → Assign Role → `ADMIN`

---

## ÉTAPE 3: Démarrer les Microservices

### 3.1 Discovery Service (Eureka)
```cmd
cd microservices\discovery-service
.\mvnw.cmd spring-boot:run
```

### 3.2 Gateway Service
```cmd
# NOUVEAU TERMINAL
cd microservices\gateway-service
.\mvnw.cmd spring-boot:run
```

### 3.3 Service User
```cmd
# NOUVEAU TERMINAL
cd microservices\service-user
.\mvnw.cmd spring-boot:run
```

### 3.4 Service Feedback
```cmd
# NOUVEAU TERMINAL
cd microservices\service-feedback
.\mvnw.cmd clean compile
.\mvnw.cmd spring-boot:run
```

---

## ÉTAPE 4: Démarrer les Frontends

### 4.1 Frontend Étudiant
```cmd
# NOUVEAU TERMINAL
cd frontend\angular-app
npm install
ng serve
```

### 4.2 Frontend Admin
```cmd
# NOUVEAU TERMINAL
cd back-office
npm install
ng serve --port 4201
```

---

## 🌐 URLs d'Accès

| Service | URL |
|---------|-----|
| **Keycloak Admin** | http://localhost:8180/admin |
| **Frontend Étudiant** | http://localhost:4200 |
| **Frontend Admin** | http://localhost:4201 |
| **Eureka** | http://localhost:8761 |

---

## 👨‍🎓 SCÉNARIO: Connexion Étudiant

### 1. Ouvrir le frontend étudiant
Aller sur: **http://localhost:4200**

### 2. Cliquer sur "Connexion"
- Redirection vers Keycloak: http://localhost:8180/realms/gestions-ramzi/login-actions/authenticate

### 3. S'authentifier
- Username: **etudiant1**
- Password: **password123**

### 4. Accéder aux fonctionnalités
Après login, l'étudiant peut:
- ✅ Donner un feedback (note + commentaire)
- ✅ Créer une réclamation
- ✅ Voir son historique

---

## 👨‍💼 SCÉNARIO: Connexion Admin

### 1. Ouvrir le back-office
Aller sur: **http://localhost:4201**

### 2. Login
- Username: **admin**
- Password: **admin123**

### 3. Fonctionnalités Admin
- ✅ Tableau de bord analytique
- ✅ Gérer les réclamations (statut, priorité)
- ✅ Voir les statistiques globales

---

## ⚠️ Dépannage

### Erreur "Invalid parameter: redirect_uri"
→ Vérifier dans Keycloak → Client → Settings:
- Valid Redirect URIs: `http://localhost:4200/*`

### Erreur CORS
→ Dans Keycloak, client → Web Origins:
- Doit être: `http://localhost:4200`

### Frontend ne trouve pas le login
→ Vérifier que auth.service.ts pointe vers le bon issuer:
```typescript
issuer: 'http://localhost:8180/realms/gestions-ramzi'
```

---

## 📋 Résumé des Commandes

```cmd
# TERMINAL 1: Keycloak
cd C:\keycloak\keycloak-23.0.7
bin\kc.bat start-dev --http-port=8180

# TERMINAL 2: Eureka
cd microservices\discovery-service && .\mvnw.cmd spring-boot:run

# TERMINAL 3: Gateway
cd microservices\gateway-service && .\mvnw.cmd spring-boot:run

# TERMINAL 4: Service User
cd microservices\service-user && .\mvnw.cmd spring-boot:run

# TERMINAL 5: Service Feedback
cd microservices\service-feedback && .\mvnw.cmd spring-boot:run

# TERMINAL 6: Frontend
cd frontend\angular-app && ng serve
```

---

## ✅ Checklist de Validation

- [ ] Keycloak démarre sur port 8180
- [ ] Realm "gestions-ramzi" créé
- [ ] Rôles: ADMIN, ENSEIGNANT, ETUDIANT créés
- [ ] Client "frontend-app" configuré
- [ ] Utilisateurs créés avec rôles
- [ ] Eureka: tous services UP
- [ ] Frontend: accessible sur port 4200
- [ ] Login étudiant fonctionne
- [ ] Login admin fonctionne
