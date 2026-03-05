# Guide de Test - Configuration Actuelle

## ✅ Ce qui est Prêt

- ✅ Abonnement Service fonctionne SANS authentification
- ✅ Frontend et Back-Office peuvent utiliser Abonnement Service
- ✅ User Service est prêt pour tests Swagger UNIQUEMENT
- ✅ Pas de relation entre les services
- ✅ CORS corrigé (supprimé de AbonnementRestAPI)

## 🚀 Tests à Faire Maintenant

### 1. Redémarrer Abonnement Service (Important!)

**Pourquoi?** On a supprimé `@CrossOrigin` du controller.

**Comment?**
1. Dans IntelliJ, arrêter AbonnementService
2. Relancer `AbonnementApplication.java`
3. Attendre le message "Started AbonnementApplication"

### 2. Tester Abonnement Service avec Frontend/Back-Office

#### Option A: Via Back-Office (Recommandé)
```
1. Ouvrir http://localhost:4201
2. Aller dans "Subscriptions"
3. Essayer de créer un abonnement
4. Vérifier qu'il n'y a PLUS d'erreur CORS
```

#### Option B: Via Frontend
```
1. Ouvrir http://localhost:4200
2. Aller dans "Pricing"
3. Cliquer sur "Get Started" sur un plan
4. Remplir le formulaire
5. Vérifier qu'il n'y a PLUS d'erreur CORS
```

### 3. Tester User Service via Swagger

**Prérequis**:
- MySQL démarré sur port 3307
- Keycloak démarré sur port 9090
- User Service démarré sur port 8085

**Étapes**:

#### A. Nettoyer les utilisateurs de test (si nécessaire)
```powershell
.\CLEANUP_TEST_USERS.ps1
```

#### B. Ouvrir Swagger
```
http://localhost:8085/swagger-ui.html
```

#### C. Tester la connexion Keycloak
```
Endpoint: GET /api/auth/test-keycloak
Cliquer "Try it out" puis "Execute"
Vérifier: Status 200 OK
```

#### D. Créer un utilisateur ADMIN
```
Endpoint: POST /api/auth/register
Cliquer "Try it out"
Copier ce JSON:

{
  "username": "admin_marwen",
  "email": "admin.marwen@wordly.com",
  "password": "Admin123!",
  "role": "ADMIN",
  "nom": "Marwen",
  "prenom": "Admin",
  "telephone": "+216 12345678",
  "poste": "Directeur"
}

Cliquer "Execute"
Vérifier: Status 201 Created
```

#### E. Créer un utilisateur TEACHER
```
Endpoint: POST /api/auth/register

{
  "username": "prof_ahmed",
  "email": "ahmed.prof@wordly.com",
  "password": "Prof123!",
  "role": "TEACHER",
  "nom": "Ahmed",
  "prenom": "Ben Ali",
  "telephone": "+216 23456789",
  "specialite": "Anglais",
  "experience": 5,
  "disponibilite": "Lundi-Vendredi 9h-17h"
}
```

#### F. Créer un utilisateur STUDENT
```
Endpoint: POST /api/auth/register

{
  "username": "etudiant_sara",
  "email": "sara.etudiant@wordly.com",
  "password": "Student123!",
  "role": "STUDENT",
  "nom": "Sara",
  "prenom": "Trabelsi",
  "telephone": "+216 34567890",
  "date_naissance": "2000-05-15",
  "niveau_actuel": "Intermédiaire",
  "statut_etudiant": "Inscrit"
}
```

#### G. Vérifier dans MySQL
```sql
USE user_db;
SELECT id_user, username, email, role, enabled, nom, prenom FROM users;
```

#### H. Vérifier dans Keycloak
```
1. Ouvrir http://localhost:9090
2. Login: admin / admin
3. Sélectionner realm: wordly-realm
4. Menu: Users
5. Vérifier que les 3 utilisateurs sont créés
```

## ✅ Résultats Attendus

### Abonnement Service
- ✅ Frontend peut créer des abonnements
- ✅ Back-Office peut gérer les abonnements
- ✅ Pas d'erreur CORS
- ✅ Tout fonctionne comme avant

### User Service
- ✅ Inscription fonctionne via Swagger
- ✅ Utilisateurs créés dans MySQL (user_db)
- ✅ Utilisateurs créés dans Keycloak
- ✅ Pas d'erreur "Password is required"
- ✅ Pas d'erreur "Conflict" (si username/email uniques)

## 🐛 Si Problèmes

### Erreur CORS sur Abonnement Service
```
Solution: Vérifier que AbonnementService a été redémarré après suppression de @CrossOrigin
```

### Erreur "User already exists" sur User Service
```powershell
# Nettoyer les utilisateurs de test
.\CLEANUP_TEST_USERS.ps1

# Puis réessayer avec des username/email différents
```

### Erreur "Failed to connect to Keycloak"
```
1. Vérifier que Keycloak tourne sur port 9090
2. Vérifier que le realm "wordly-realm" existe
3. Redémarrer Keycloak si nécessaire
```

### Erreur "Communications link failure" (MySQL)
```
1. Démarrer MySQL via XAMPP/WAMP
2. Vérifier que MySQL écoute sur port 3307
```

## 📋 Checklist Complète

### Avant de Tester
- [ ] MySQL démarré (port 3307)
- [ ] Keycloak démarré (port 9090)
- [ ] Eureka Server démarré (port 8761)
- [ ] API Gateway démarré (port 8888)
- [ ] Abonnement Service REDÉMARRÉ (port 8084)
- [ ] User Service démarré (port 8085)
- [ ] Frontend démarré (port 4200) - optionnel
- [ ] Back-Office démarré (port 4201) - optionnel

### Tests Abonnement Service
- [ ] Back-Office peut lister les abonnements
- [ ] Back-Office peut créer un abonnement
- [ ] Back-Office peut modifier un abonnement
- [ ] Pas d'erreur CORS
- [ ] Frontend peut voir les plans (Pricing page)

### Tests User Service
- [ ] Swagger accessible (http://localhost:8085/swagger-ui.html)
- [ ] Test Keycloak fonctionne (GET /api/auth/test-keycloak)
- [ ] Inscription ADMIN fonctionne
- [ ] Inscription TEACHER fonctionne
- [ ] Inscription STUDENT fonctionne
- [ ] Utilisateurs visibles dans MySQL
- [ ] Utilisateurs visibles dans Keycloak

## 🎉 Succès!

Si tous les tests passent:
- ✅ Abonnement Service fonctionne parfaitement sans authentification
- ✅ User Service fonctionne pour les tests Swagger
- ✅ Les deux services sont complètement indépendants
- ✅ Prêt pour la démonstration!

## 📚 Documentation

Pour plus de détails:
- `ARCHITECTURE_SERVICES.md` - Architecture complète
- `QUICK_TEST_COMMANDS.md` - Commandes rapides User Service
- `USER_SERVICE_TEST_GUIDE.md` - Guide détaillé User Service
- `FIXES_APPLIED.md` - Corrections appliquées
