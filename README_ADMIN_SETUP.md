# 🎯 Configuration Utilisateur ADMIN - Guide Principal

## 📚 Vue d'Ensemble

Ce guide vous aide à configurer un utilisateur ADMIN avec redirection automatique vers le back-office.

---

## 🚀 Démarrage Rapide

**Temps estimé:** 5 minutes

### Option 1: Script Automatique (Recommandé)
```powershell
# 1. Redémarrer UserService dans IntelliJ
# 2. Créer le rôle ADMIN dans Keycloak (voir ci-dessous)
# 3. Exécuter le script
.\TEST_ADMIN_CREATION.ps1
```

### Option 2: Setup Manuel
Suivre le guide: **QUICK_ADMIN_SETUP.md**

---

## 📖 Guides Disponibles

### 1. QUICK_ADMIN_SETUP.md ⚡
**Pour qui:** Utilisateurs expérimentés
**Contenu:** Setup rapide en 5 étapes
**Temps:** 5 minutes

### 2. ETAPES_KEYCLOAK_ADMIN.md 📸
**Pour qui:** Débutants
**Contenu:** Guide visuel détaillé avec instructions pas à pas
**Temps:** 10-15 minutes

### 3. COMPLETE_ADMIN_SETUP.md 📋
**Pour qui:** Référence complète
**Contenu:** Documentation exhaustive avec dépannage
**Temps:** Référence

### 4. TEST_ADMIN_CREATION.ps1 🔧
**Pour qui:** Tous
**Contenu:** Script PowerShell pour tester et créer l'utilisateur
**Temps:** 2 minutes

---

## ✅ Ce Qui a Été Fait

### 1. Client Secret Mis à Jour
Le nouveau client secret Keycloak (`0FpWuzYfK7htdbBj3Dktsbh64deGQoWH`) a été configuré dans:
- ✅ UserService
- ✅ Frontend
- ✅ Back-Office

### 2. Redirection par Rôle Implémentée
- **ADMIN** → http://localhost:4201/dashboard (Back-Office)
- **TEACHER/STUDENT** → http://localhost:4200 (Frontend)

### 3. Documentation Complète
Quatre guides créés pour vous accompagner dans la configuration.

---

## 🎯 Ce Qu'il Reste à Faire

### Étape 1: Redémarrer UserService ⚠️
**Pourquoi:** Pour charger le nouveau client secret
**Comment:** IntelliJ → Stop → Run `UserApplication.java`

### Étape 2: Créer le Rôle ADMIN ⚠️
**Pourquoi:** Keycloak doit connaître le rôle ADMIN
**Comment:**
1. http://localhost:9090 → Login (admin/admin)
2. Realm: **wordly-realm**
3. **Realm roles** → **Create role** → Name: `ADMIN` → Save

### Étape 3: Créer l'Utilisateur ADMIN ⚠️
**Pourquoi:** Pour avoir un compte admin
**Comment:** Exécuter `.\TEST_ADMIN_CREATION.ps1`

### Étape 4: Assigner le Rôle ⚠️
**Pourquoi:** Pour que l'utilisateur ait les permissions admin
**Comment:**
1. Keycloak → **Users** → Chercher `admin`
2. **Role mapping** → **Assign role** → `ADMIN`

### Étape 5: Tester ✅
**Comment:**
1. http://localhost:4200 → Sign In
2. Email: `admin@test.com` / Password: `Admin123!`
3. Vérifier la redirection vers http://localhost:4201/dashboard

---

## 🔍 Vérification Rapide

### Tous les Services Sont-ils Démarrés?
```powershell
# Tester les services
curl http://localhost:9090/realms/wordly-realm  # Keycloak
curl http://localhost:8085/actuator/health      # UserService
curl http://localhost:8888/actuator/health      # API Gateway
curl http://localhost:4200                      # Frontend
curl http://localhost:4201                      # Back-Office
```

### Le Rôle ADMIN Existe-t-il?
1. http://localhost:9090
2. Realm: wordly-realm
3. Realm roles → Chercher "ADMIN"

---

## ❌ Problèmes Courants

### Erreur 500 lors de la création
➡️ **Solution:** Le rôle ADMIN n'existe pas dans Keycloak
📖 **Voir:** ETAPES_KEYCLOAK_ADMIN.md → Section "Dépannage"

### Pas de redirection après login
➡️ **Solution:** Le rôle n'est pas assigné dans Keycloak
📖 **Voir:** COMPLETE_ADMIN_SETUP.md → Section "Dépannage"

### UserService ne démarre pas
➡️ **Solution:** Vérifier les logs dans IntelliJ
📖 **Voir:** COMPLETE_ADMIN_SETUP.md → Section "Dépannage"

---

## 📞 Identifiants de Test

### Utilisateur ADMIN
```
Email: admin@test.com
Password: Admin123!
Redirection: http://localhost:4201/dashboard
```

### Utilisateurs TEACHER/STUDENT
```
Créer via le formulaire d'inscription
Redirection: http://localhost:4200
```

---

## 🎓 Comprendre la Redirection

### Comment ça Marche?

1. **Login:** L'utilisateur entre email + password
2. **Keycloak:** Génère un JWT token avec les rôles
3. **Frontend:** Décode le token et lit les rôles
4. **Redirection:**
   - Si `ADMIN` dans les rôles → Back-Office (port 4201)
   - Sinon → Frontend (port 4200)

### Code de Redirection
```typescript
// Dans auth-modal.ts
const payload = this.decodeToken(response.access_token);
const roles = payload.realm_access?.roles || [];

if (roles.includes('ADMIN')) {
  window.location.href = 'http://localhost:4201/dashboard';
} else {
  window.location.href = 'http://localhost:4200';
}
```

---

## 📊 Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ Login (email + password)
       ▼
┌─────────────┐
│  Frontend   │ Port 4200
│ (Angular)   │
└──────┬──────┘
       │ POST /api/auth/register
       │ GET /api/auth/user-by-email
       ▼
┌─────────────┐
│ API Gateway │ Port 8888
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ UserService │ Port 8085
└──────┬──────┘
       │ Create user
       │ Assign role
       ▼
┌─────────────┐
│  Keycloak   │ Port 9090
│  (Auth)     │
└─────────────┘
       │
       │ JWT Token with roles
       ▼
┌─────────────┐
│  Frontend   │ Decode token → Redirect
└─────────────┘
       │
       ├─ ADMIN → http://localhost:4201/dashboard
       └─ TEACHER/STUDENT → http://localhost:4200
```

---

## 🎯 Checklist Complète

### Avant de Commencer
- [ ] Keycloak démarré (port 9090)
- [ ] UserService démarré (port 8085)
- [ ] API Gateway démarré (port 8888)
- [ ] Frontend démarré (port 4200)
- [ ] Back-Office démarré (port 4201)

### Configuration
- [ ] Client secret mis à jour (déjà fait ✅)
- [ ] UserService redémarré
- [ ] Rôle ADMIN créé dans Keycloak
- [ ] Utilisateur admin créé via API
- [ ] Rôle ADMIN assigné dans Keycloak

### Tests
- [ ] Login ADMIN → Redirection vers back-office
- [ ] Login TEACHER → Redirection vers frontend
- [ ] Login STUDENT → Redirection vers frontend
- [ ] Menu utilisateur visible
- [ ] Déconnexion fonctionne

---

## 🚀 Commencer Maintenant

**Étape suivante:** Ouvrir **QUICK_ADMIN_SETUP.md** et suivre les 5 étapes

Ou exécuter directement:
```powershell
.\TEST_ADMIN_CREATION.ps1
```

---

## 📚 Ressources

- **QUICK_ADMIN_SETUP.md** - Setup rapide (5 min)
- **ETAPES_KEYCLOAK_ADMIN.md** - Guide visuel détaillé
- **COMPLETE_ADMIN_SETUP.md** - Documentation complète
- **TEST_ADMIN_CREATION.ps1** - Script de test automatique
- **STATUS_FINAL_ADMIN.md** - Status et changements effectués

---

**Bonne configuration! 🎉**
