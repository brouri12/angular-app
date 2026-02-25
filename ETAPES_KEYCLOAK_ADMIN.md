# 🔐 Guide Visuel - Configuration Keycloak pour ADMIN

## 📋 Prérequis

Avant de commencer, assurez-vous que:
- ✅ Keycloak est démarré sur http://localhost:9090
- ✅ UserService est démarré dans IntelliJ (port 8085)
- ✅ Le nouveau client secret est configuré: `0FpWuzYfK7htdbBj3Dktsbh64deGQoWH`

---

## 🎯 Étape 1: Créer le Rôle ADMIN dans Keycloak

### 1.1 Accéder à Keycloak
1. Ouvrir votre navigateur
2. Aller sur: **http://localhost:9090**
3. Cliquer sur **Administration Console**
4. Se connecter avec:
   - Username: `admin`
   - Password: `admin`

### 1.2 Sélectionner le Realm
1. En haut à gauche, cliquer sur le menu déroulant
2. Sélectionner **wordly-realm**
3. (Si vous voyez "master", c'est que vous n'êtes pas dans le bon realm)

### 1.3 Créer le Rôle ADMIN
1. Dans le menu de gauche, cliquer sur **Realm roles**
2. Cliquer sur le bouton **Create role** (en haut à droite)
3. Remplir le formulaire:
   ```
   Role name: ADMIN
   Description: Administrator role with full access
   ```
4. Cliquer sur **Save**

### 1.4 Vérifier les Rôles
Vous devriez maintenant voir 3 rôles:
- ✅ TEACHER
- ✅ STUDENT
- ✅ ADMIN (nouveau)

---

## 👤 Étape 2: Créer l'Utilisateur ADMIN

### 2.1 Via PowerShell (Méthode Recommandée)

1. Ouvrir PowerShell
2. Naviguer vers le dossier du projet:
   ```powershell
   cd C:\Users\marwe\Desktop\e_learnig-platform
   ```

3. Exécuter le script de test:
   ```powershell
   .\TEST_ADMIN_CREATION.ps1
   ```

4. Le script va:
   - ✅ Vérifier que tous les services sont accessibles
   - ✅ Tester la connexion Keycloak
   - ✅ Créer l'utilisateur ADMIN

### 2.2 Commande Manuelle (Alternative)

Si vous préférez créer l'utilisateur manuellement:

```powershell
$body = @{
    username = "admin"
    email = "admin@test.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Admin"
    prenom = "System"
    telephone = "00000000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" -Method POST -ContentType "application/json" -Body $body
```

### 2.3 Résultat Attendu

Si tout fonctionne, vous devriez voir:
```
✅ Utilisateur ADMIN créé avec succès!
```

---

## 🔗 Étape 3: Assigner le Rôle ADMIN dans Keycloak

### 3.1 Trouver l'Utilisateur
1. Dans Keycloak, cliquer sur **Users** (menu de gauche)
2. Dans la barre de recherche, taper: `admin`
3. Cliquer sur l'utilisateur **admin** dans les résultats

### 3.2 Assigner le Rôle
1. Cliquer sur l'onglet **Role mapping**
2. Cliquer sur le bouton **Assign role**
3. Dans la liste, cocher **ADMIN**
4. Cliquer sur **Assign**

### 3.3 Vérifier l'Attribution
Vous devriez maintenant voir:
- **Assigned roles:** ADMIN

---

## 🧪 Étape 4: Tester la Connexion

### 4.1 Test depuis le Frontend

1. Ouvrir: **http://localhost:4200**
2. Cliquer sur **Sign In**
3. Entrer les identifiants:
   ```
   Email: admin@test.com
   Password: Admin123!
   ```
4. Cliquer sur **Sign In**

### 4.2 Résultat Attendu

Après la connexion, vous devriez être **automatiquement redirigé** vers:
```
http://localhost:4201/dashboard
```

C'est le back-office (dashboard admin).

### 4.3 Vérifier le Menu

Dans le back-office, vous devriez voir:
- ✅ Sidebar avec: Dashboard, Subscriptions, Courses, Users, Analytics
- ✅ Topbar avec: Search, Notifications, Theme toggle, User menu
- ✅ Votre nom "System Admin" dans le user menu

---

## ❌ Dépannage

### Erreur 500 lors de la création

**Symptôme:**
```
❌ Erreur lors de la création de l'utilisateur
Code d'erreur: 500
```

**Solutions:**

1. **Le rôle ADMIN n'existe pas**
   - Vérifier dans Keycloak → Realm roles
   - Créer le rôle ADMIN si nécessaire
   - Réessayer la création

2. **UserService n'est pas démarré**
   - Ouvrir IntelliJ
   - Vérifier que UserApplication.java est en cours d'exécution
   - Vérifier les logs pour "Started UserApplication"

3. **Client secret incorrect**
   - Ouvrir `UserService/src/main/resources/application.properties`
   - Vérifier: `keycloak.credentials.secret=0FpWuzYfK7htdbBj3Dktsbh64deGQoWH`
   - Redémarrer UserService

### Erreur 409 (Conflit)

**Symptôme:**
```
Code d'erreur: 409
```

**Cause:** L'utilisateur existe déjà

**Solutions:**
1. Essayer de se connecter avec: admin@test.com / Admin123!
2. Ou supprimer l'utilisateur dans Keycloak et recréer

### Pas de redirection après login

**Symptôme:** La modal se ferme mais reste sur la même page

**Solutions:**

1. **Vérifier le rôle dans Keycloak**
   - Users → admin → Role mapping
   - Le rôle ADMIN doit être assigné

2. **Vider le cache du navigateur**
   - Appuyer sur Ctrl+Shift+Delete
   - Vider le cache et les cookies
   - Réessayer

3. **Vérifier le token JWT**
   - Ouvrir la console du navigateur (F12)
   - Onglet Console
   - Chercher les logs de connexion
   - Le token doit contenir `realm_access.roles: ["ADMIN"]`

### Redirection vers le frontend au lieu du back-office

**Symptôme:** Redirigé vers http://localhost:4200 au lieu de 4201

**Cause:** Le rôle ADMIN n'est pas dans le token JWT

**Solutions:**
1. Vérifier que le rôle ADMIN est assigné dans Keycloak
2. Se déconnecter complètement
3. Se reconnecter
4. Le nouveau token devrait contenir le rôle ADMIN

---

## 📝 Checklist Complète

Avant de tester, vérifiez:

### Services
- [ ] Keycloak démarré (http://localhost:9090)
- [ ] UserService démarré (port 8085)
- [ ] API Gateway démarré (port 8888)
- [ ] Frontend démarré (http://localhost:4200)
- [ ] Back-Office démarré (http://localhost:4201)

### Configuration Keycloak
- [ ] Realm "wordly-realm" créé
- [ ] Rôle ADMIN créé dans Realm roles
- [ ] Rôles TEACHER et STUDENT existent
- [ ] Client "wordly-client" configuré
- [ ] Client secret: 0FpWuzYfK7htdbBj3Dktsbh64deGQoWH

### Utilisateur ADMIN
- [ ] Utilisateur créé via API
- [ ] Rôle ADMIN assigné dans Keycloak
- [ ] Test de connexion réussi
- [ ] Redirection vers back-office fonctionne

---

## 🎉 Succès!

Si tout fonctionne:
- ✅ Vous pouvez vous connecter avec admin@test.com
- ✅ Vous êtes redirigé vers le dashboard (port 4201)
- ✅ Vous voyez le menu admin complet
- ✅ Les utilisateurs TEACHER/STUDENT vont sur le frontend (port 4200)

**Félicitations! La configuration est terminée! 🚀**
