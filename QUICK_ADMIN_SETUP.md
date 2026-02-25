# ⚡ Quick Setup - Utilisateur ADMIN

## 🚀 Setup Rapide (5 minutes)

### 1️⃣ Redémarrer UserService
Dans IntelliJ: Stop → Run `UserApplication.java`

### 2️⃣ Créer le Rôle ADMIN
1. http://localhost:9090 → Login (admin/admin)
2. Sélectionner realm: **wordly-realm**
3. **Realm roles** → **Create role**
4. Role name: `ADMIN` → Save

### 3️⃣ Créer l'Utilisateur
PowerShell:
```powershell
cd C:\Users\marwe\Desktop\e_learnig-platform
.\TEST_ADMIN_CREATION.ps1
```

### 4️⃣ Assigner le Rôle
1. Keycloak → **Users** → Chercher `admin`
2. **Role mapping** → **Assign role** → Cocher `ADMIN` → Assign

### 5️⃣ Tester
1. http://localhost:4200 → Sign In
2. Email: `admin@test.com` / Password: `Admin123!`
3. ✅ Redirection automatique vers http://localhost:4201/dashboard

---

## 📋 Commande Manuelle (Alternative)

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

---

## ❌ Erreur 500?

1. ✅ Vérifier que le rôle ADMIN existe dans Keycloak
2. ✅ Redémarrer UserService
3. ✅ Réessayer la commande

---

## 🎯 Redirection par Rôle

- **ADMIN** → http://localhost:4201/dashboard (Back-Office)
- **TEACHER/STUDENT** → http://localhost:4200 (Frontend)

---

## 📞 Identifiants de Test

| Rôle | Email | Password |
|------|-------|----------|
| ADMIN | admin@test.com | Admin123! |

---

## 🔧 Client Secret (Nouveau)

```
0FpWuzYfK7htdbBj3Dktsbh64deGQoWH
```

Déjà configuré dans:
- ✅ UserService/application.properties
- ✅ Frontend auth.service.ts
- ✅ Back-office auth.service.ts
