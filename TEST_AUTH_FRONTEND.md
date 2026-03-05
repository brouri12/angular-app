# Test Authentification Frontend - Guide Rapide

## 🎯 Objectif
Tester les pages Login et Register du frontend Angular

## ⚠️ IMPORTANT: Démarrer Keycloak d'abord!

Le User Service nécessite Keycloak pour fonctionner.

### Démarrer Keycloak
```powershell
cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0\bin
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
.\kc.bat start-dev --http-port=9090
```

Attendre le message: `Listening on: http://0.0.0.0:9090`

## ✅ Checklist des Services

- [ ] MySQL démarré (port 3307)
- [ ] Keycloak démarré (port 9090) ← **IMPORTANT!**
- [ ] Eureka Server démarré (port 8761)
- [ ] API Gateway démarré (port 8888)
- [ ] User Service démarré (port 8085)
- [ ] Frontend démarré (port 44510 ou autre)

## 🚀 Tests à Effectuer

### Test 1: Page de Register

1. **Ouvrir le frontend**
   ```
   http://localhost:44510 (ou votre port)
   ```

2. **Cliquer sur "Get Started"** dans le header
   - Ou aller directement sur `/register`

3. **Remplir le formulaire**
   ```
   Role: STUDENT
   Username: test_student
   Email: test@student.com
   Password: 123456
   Confirm Password: 123456
   First Name: John
   Last Name: Doe
   Phone: +216 12345678
   Date of Birth: 2000-01-01
   Current Level: Intermediate
   ```

4. **Cliquer sur "Create Account"**

5. **Vérifier**:
   - ✅ Message de succès affiché
   - ✅ Redirection vers /login après 2 secondes
   - ✅ Pas d'erreur dans la console

### Test 2: Page de Login

1. **Sur la page /login**

2. **Entrer les identifiants**
   ```
   Username: test_student
   Password: 123456
   ```

3. **Cliquer sur "Sign in"**

4. **Vérifier**:
   - ✅ Redirection vers la page d'accueil
   - ✅ Header affiche le nom de l'utilisateur
   - ✅ Menu utilisateur disponible
   - ✅ Pas d'erreur dans la console

### Test 3: Menu Utilisateur

1. **Cliquer sur le nom dans le header**

2. **Vérifier le menu déroulant**:
   - ✅ Username affiché
   - ✅ Email affiché
   - ✅ Rôle affiché (badge STUDENT)
   - ✅ Bouton "Sign Out" présent

3. **Cliquer sur "Sign Out"**

4. **Vérifier**:
   - ✅ Redirection vers la page d'accueil
   - ✅ Header affiche "Sign In" et "Get Started"
   - ✅ Utilisateur déconnecté

### Test 4: Register avec Différents Rôles

#### Teacher
```
Role: TEACHER
Username: test_teacher
Email: test@teacher.com
Password: 123456
First Name: Jane
Last Name: Smith
Specialization: English
Experience: 5
Availability: Monday-Friday 9AM-5PM
```

### Test 5: Validation des Erreurs

1. **Tester mot de passe court**
   - Password: 123
   - ✅ Erreur: "Password must be at least 6 characters"

2. **Tester mots de passe différents**
   - Password: 123456
   - Confirm: 654321
   - ✅ Erreur: "Passwords do not match"

3. **Tester email invalide**
   - Email: test@
   - ✅ Erreur: "Please enter a valid email address"

4. **Tester username existant**
   - Username: test_student (déjà créé)
   - ✅ Erreur: "Username already exists"

5. **Tester login avec mauvais mot de passe**
   - Username: test_student
   - Password: wrong
   - ✅ Erreur: "Invalid username or password"

## 🔍 Vérifications dans la Console

### Console Navigateur (F12)

**Après Register**:
```
✅ POST http://localhost:8888/user-service/api/auth/register - 201 Created
✅ Pas d'erreur CORS
```

**Après Login**:
```
✅ POST http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token - 200 OK
✅ GET http://localhost:8888/user-service/api/auth/me - 200 OK
✅ Token stocké dans localStorage
```

### Vérifier localStorage

1. Ouvrir F12 → Application → Local Storage
2. Vérifier:
   - ✅ `access_token` présent
   - ✅ `refresh_token` présent

## 🐛 Erreurs Courantes

### Erreur: "Connect to localhost:9090 failed"
**Cause**: Keycloak n'est pas démarré
**Solution**: Démarrer Keycloak (voir commandes ci-dessus)

### Erreur: "User already exists"
**Cause**: Username ou email déjà utilisé
**Solution**: Utiliser un username/email différent ou nettoyer Keycloak
```powershell
.\CLEANUP_TEST_USERS.ps1
```

### Erreur CORS
**Cause**: API Gateway pas démarré ou pas configuré
**Solution**: Redémarrer API Gateway

### Page blanche après login
**Cause**: Token invalide ou User Service inaccessible
**Solution**: 
1. Vérifier que User Service tourne
2. Vérifier la console pour les erreurs
3. Effacer localStorage et réessayer

## 📊 Résultat Attendu

### Avant Connexion
```
Header:
[Logo] Courses | Pricing | About | [Theme] [Sign In] [Get Started]
```

### Après Connexion
```
Header:
[Logo] Courses | Pricing | About | [Theme] [Avatar John ▼]

Menu déroulant:
┌─────────────────────┐
│ test_student        │
│ test@student.com    │
│ [STUDENT]           │
├─────────────────────┤
│ Sign Out            │
└─────────────────────┘
```

## ✅ Checklist Complète

- [ ] Keycloak démarré
- [ ] Tous les services démarrés
- [ ] Frontend accessible
- [ ] Page Register fonctionne
- [ ] Création d'un STUDENT réussie
- [ ] Création d'un TEACHER réussie
- [ ] Page Login fonctionne
- [ ] Connexion réussie
- [ ] Header affiche l'utilisateur
- [ ] Menu utilisateur fonctionne
- [ ] Déconnexion fonctionne
- [ ] Validations d'erreurs fonctionnent

## 🎉 Succès!

Si tous les tests passent:
- ✅ Authentification complète fonctionnelle
- ✅ Intégration User Service + Keycloak OK
- ✅ Frontend prêt pour la production

## 📚 Documentation

- `FRONTEND_AUTH_GUIDE.md` - Guide complet
- `DEMARRER_KEYCLOAK.md` - Démarrer Keycloak
- `USER_SERVICE_TEST_GUIDE.md` - Guide User Service
