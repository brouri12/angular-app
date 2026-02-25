# 👤 Ajouter un Compte ADMIN - Guide Simple

## 🎯 Objectif
Créer un compte administrateur qui redirige vers le back-office (port 4201)

---

## ⚡ Méthode Rapide (3 Étapes)

### Étape 1: Démarrer les Services

#### A. Démarrer UserService dans IntelliJ
1. Ouvrir IntelliJ IDEA
2. Ouvrir le fichier: `UserService/src/main/java/tn/esprit/user/UserApplication.java`
3. Clic droit sur le fichier → **Run 'UserApplication'**
4. Attendre dans les logs: `Started UserApplication in X.XXX seconds`

#### B. Vérifier que Keycloak est démarré
- Ouvrir: http://localhost:9090
- Si ça ne marche pas, démarrer Keycloak:
  ```cmd
  cd C:\keycloak-23.0.0
  bin\kc.bat start-dev --http-port=9090
  ```

#### C. Vérifier que API Gateway est démarré
- Démarrer dans IntelliJ: `ApiGateway/src/main/java/tn/esprit/gateway/ApiGatewayApplication.java`

---

### Étape 2: Créer le Rôle ADMIN dans Keycloak

1. Ouvrir: http://localhost:9090
2. Login: `admin` / `admin`
3. En haut à gauche, sélectionner: **wordly-realm**
4. Menu gauche: **Realm roles**
5. Bouton: **Create role**
6. Entrer:
   - Role name: `ADMIN`
   - Description: `Administrator role`
7. Cliquer: **Save**

✅ Le rôle ADMIN est créé!

---

### Étape 3: Créer le Compte ADMIN

#### A. Exécuter le Script PowerShell

Ouvrir PowerShell dans le dossier du projet:
```powershell
.\CREATE_ADMIN_NOW.ps1
```

Le script va:
- ✅ Vérifier que tous les services sont démarrés
- ✅ Créer l'utilisateur admin
- ✅ Afficher les instructions suivantes

#### B. Ou Créer Manuellement

Si vous préférez créer manuellement:

```powershell
$body = @{
    username = "admin"
    email = "admin@wordly.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Administrator"
    prenom = "System"
    telephone = "00000000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" -Method POST -ContentType "application/json" -Body $body
```

✅ L'utilisateur est créé!

---

### Étape 4: Assigner le Rôle ADMIN

1. Retourner dans Keycloak: http://localhost:9090
2. Menu gauche: **Users**
3. Chercher: `admin`
4. Cliquer sur l'utilisateur **admin**
5. Onglet: **Role mapping**
6. Bouton: **Assign role**
7. Cocher: **ADMIN**
8. Bouton: **Assign**

✅ Le rôle est assigné!

---

### Étape 5: Tester la Connexion

1. Ouvrir: http://localhost:4200
2. Cliquer: **Sign In**
3. Entrer:
   - Email: `admin@wordly.com`
   - Password: `Admin123!`
4. Cliquer: **Sign In**

**Résultat attendu:**
- ✅ Vous êtes automatiquement redirigé vers: http://localhost:4201/dashboard
- ✅ Vous voyez le back-office avec le menu admin

---

## 📋 Identifiants du Compte ADMIN

```
Email: admin@wordly.com
Password: Admin123!
Redirection: http://localhost:4201/dashboard
```

---

## ❌ Problèmes Courants

### Erreur: UserService n'est pas accessible

**Solution:**
1. Ouvrir IntelliJ
2. Démarrer `UserApplication.java`
3. Attendre "Started UserApplication"
4. Relancer le script

### Erreur 500: Failed to create user

**Cause:** Le rôle ADMIN n'existe pas dans Keycloak

**Solution:**
1. Keycloak → Realm roles → Create role → ADMIN
2. Relancer le script

### Erreur 409: User already exists

**Cause:** L'utilisateur existe déjà

**Solution:**
- Essayer de se connecter avec: admin@wordly.com / Admin123!
- Ou supprimer l'utilisateur dans Keycloak et recréer

### Pas de redirection après login

**Cause:** Le rôle n'est pas assigné dans Keycloak

**Solution:**
1. Keycloak → Users → admin
2. Role mapping → Assign role → ADMIN
3. Se déconnecter et se reconnecter

---

## 🎯 Vérification Rapide

### Tous les services sont-ils démarrés?

Ouvrir ces URLs dans le navigateur:
- http://localhost:9090 (Keycloak) ✅
- http://localhost:8085/actuator/health (UserService) ✅
- http://localhost:8888/actuator/health (API Gateway) ✅
- http://localhost:4200 (Frontend) ✅
- http://localhost:4201 (Back-Office) ✅

### Le rôle ADMIN existe-t-il?

1. http://localhost:9090
2. Realm: wordly-realm
3. Realm roles → Chercher "ADMIN"

---

## 🚀 Commencer Maintenant

**Étape suivante:** Exécuter le script
```powershell
.\CREATE_ADMIN_NOW.ps1
```

Ou suivre les étapes manuellement ci-dessus.

---

## 📞 Besoin d'Aide?

Si vous rencontrez des problèmes:
1. Vérifier que tous les services sont démarrés
2. Vérifier que le rôle ADMIN existe dans Keycloak
3. Consulter les logs de UserService dans IntelliJ
4. Relancer le script CREATE_ADMIN_NOW.ps1

---

**Bonne création! 🎉**
