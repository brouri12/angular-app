# Guide d'Authentification Frontend - Angular

## ✅ Ce qui a été créé

### 1. Modèles (Models)
- `frontend/angular-app/src/app/models/user.model.ts`
  - Interface `User` - Données utilisateur
  - Interface `RegisterRequest` - Requête d'inscription
  - Interface `LoginRequest` - Requête de connexion
  - Interface `TokenResponse` - Réponse token Keycloak

### 2. Service d'Authentification
- `frontend/angular-app/src/app/services/auth.service.ts`
  - `register()` - Inscription via User Service
  - `login()` - Connexion via Keycloak
  - `getCurrentUser()` - Récupérer l'utilisateur connecté
  - `logout()` - Déconnexion
  - Gestion des tokens JWT (localStorage)
  - Observables pour l'état d'authentification

### 3. Page de Login
- `frontend/angular-app/src/app/pages/login/login.ts`
- `frontend/angular-app/src/app/pages/login/login.html`
- `frontend/angular-app/src/app/pages/login/login.css`
  - Formulaire de connexion (username, password)
  - Gestion des erreurs
  - Redirection après connexion
  - Lien vers Register

### 4. Page de Register
- `frontend/angular-app/src/app/pages/register/register.ts`
- `frontend/angular-app/src/app/pages/register/register.html`
- `frontend/angular-app/src/app/pages/register/register.css`
  - Sélection du rôle (STUDENT, TEACHER uniquement)
  - Formulaire adaptatif selon le rôle
  - Validation des champs
  - Confirmation du mot de passe
  - Champs spécifiques par rôle

### 5. Header Mis à Jour
- `frontend/angular-app/src/app/components/header/header.ts`
- `frontend/angular-app/src/app/components/header/header.html`
  - Boutons Login/Register (si non connecté)
  - Menu utilisateur (si connecté)
  - Affichage du nom et rôle
  - Bouton de déconnexion

### 6. Routes Mises à Jour
- `frontend/angular-app/src/app/app.routes.ts`
  - `/login` - Page de connexion
  - `/register` - Page d'inscription

## 🎯 Fonctionnalités

### Inscription (Register)
1. Choisir le rôle (Student ou Teacher)
2. Remplir les informations de base
3. Remplir les informations spécifiques au rôle
4. Validation automatique
5. Création du compte dans User Service + Keycloak
6. Redirection vers Login

### Connexion (Login)
1. Entrer username et password
2. Authentification via Keycloak
3. Récupération du token JWT
4. Stockage du token dans localStorage
5. Récupération des infos utilisateur
6. Redirection vers Home

### État d'Authentification
- Header affiche Login/Register si non connecté
- Header affiche le menu utilisateur si connecté
- Menu utilisateur montre: nom, email, rôle
- Bouton de déconnexion disponible

## 🔧 Configuration

### URLs des Services
```typescript
// Dans auth.service.ts
private apiUrl = 'http://localhost:8888/user-service/api/auth';
private keycloakUrl = 'http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token';
```

### Client Keycloak
```typescript
client_id: 'wordly-client'
client_secret: 'fFWjOZlxqLgrswbI9sfeiDj1xQbyw1DG'
```

## 🚀 Utilisation

### Démarrer le Frontend
```bash
cd frontend/angular-app
npm start
```

### Tester l'Inscription
1. Ouvrir http://localhost:44510 (ou votre port)
2. Cliquer sur "Get Started" ou aller sur /register
3. Choisir un rôle
4. Remplir le formulaire
5. Cliquer sur "Create Account"

### Tester la Connexion
1. Aller sur /login
2. Entrer username et password
3. Cliquer sur "Sign in"
4. Vérifier que le header affiche votre nom

## 📊 Flux d'Authentification

### Inscription
```
Frontend (Register Page)
    │
    │ POST /api/auth/register
    ▼
API Gateway (8888)
    │
    ▼
User Service (8085)
    │
    ├─> MySQL (user_db) - Stocke toutes les données
    │
    └─> Keycloak (9090) - Stocke username, email, password, role
    │
    ▼
Succès → Redirection vers Login
```

### Connexion
```
Frontend (Login Page)
    │
    │ POST /realms/wordly-realm/protocol/openid-connect/token
    ▼
Keycloak (9090)
    │
    │ Valide username/password
    │ Génère JWT token
    ▼
Frontend
    │
    │ Stocke token dans localStorage
    │ GET /api/auth/me (avec token)
    ▼
User Service (8085)
    │
    │ Valide token JWT
    │ Retourne données utilisateur
    ▼
Frontend
    │
    │ Affiche utilisateur dans header
    │ Redirection vers Home
    ▼
Utilisateur connecté ✅
```

## 🎨 Design

### Couleurs
- Primary: `rgb(0,200,151)` (vert)
- Accent: `rgb(255,127,80)` (orange)
- Gradient: from-primary to-accent

### Responsive
- Desktop: Menu complet dans header
- Mobile: Menu hamburger avec liens

### Dark Mode
- Supporte le thème sombre
- Transitions fluides

## ⚠️ Prérequis

### Services Requis
1. ✅ MySQL (port 3307)
2. ✅ Keycloak (port 9090) - **IMPORTANT!**
3. ✅ Eureka Server (port 8761)
4. ✅ API Gateway (port 8888)
5. ✅ User Service (port 8085)

### Démarrer Keycloak
```powershell
cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0\bin
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
.\kc.bat start-dev --http-port=9090
```

## 🐛 Dépannage

### Erreur: "Connect to localhost:9090 failed"
**Solution**: Démarrer Keycloak (voir DEMARRER_KEYCLOAK.md)

### Erreur: "Invalid username or password"
**Vérifications**:
1. L'utilisateur existe dans Keycloak
2. Le mot de passe est correct
3. Keycloak est accessible

### Erreur CORS
**Solution**: Vérifier que API Gateway est démarré et configuré

### Token expiré
**Solution**: Se reconnecter (le token expire après un certain temps)

## 📝 Exemples de Test

### Créer un Student
```
Role: STUDENT
Username: student_test
Email: student@test.com
Password: 123456
First Name: John
Last Name: Doe
Date of Birth: 2000-01-01
Current Level: Intermediate
```

### Créer un Teacher
```
Role: TEACHER
Username: teacher_test
Email: teacher@test.com
Password: 123456
First Name: Jane
Last Name: Smith
Specialization: English
Experience: 5
Availability: Monday-Friday 9AM-5PM
```

## 🔐 Sécurité

### Tokens JWT
- Stockés dans localStorage
- Envoyés dans header Authorization
- Validés par User Service

### Mots de Passe
- Minimum 6 caractères
- Gérés par Keycloak (hashés)
- Jamais stockés en clair

### CORS
- Géré par API Gateway
- Autorise localhost:*

## 🎉 Résultat Final

Après avoir tout configuré:
- ✅ Page de Register fonctionnelle
- ✅ Page de Login fonctionnelle
- ✅ Header affiche l'état d'authentification
- ✅ Menu utilisateur avec déconnexion
- ✅ Intégration complète avec User Service et Keycloak

## 📚 Documentation Complémentaire

- `DEMARRER_KEYCLOAK.md` - Démarrer Keycloak
- `USER_SERVICE_TEST_GUIDE.md` - Guide User Service
- `QUICK_TEST_COMMANDS.md` - Exemples de requêtes
- `ARCHITECTURE_SERVICES.md` - Architecture complète
