# Guide Complet - Configuration Admin

## ✅ Étape 1: Client Secret Mis à Jour
Le nouveau client secret `0FpWuzYfK7htdbBj3Dktsbh64deGQoWH` a été mis à jour dans:
- ✅ UserService/application.properties
- ✅ Frontend auth.service.ts
- ✅ Back-office auth.service.ts

## 📋 Étape 2: Redémarrer UserService

**Dans IntelliJ IDEA:**
1. Arrêter UserService s'il est en cours d'exécution (bouton Stop rouge)
2. Relancer `UserApplication.java` (clic droit → Run)
3. Attendre que le service démarre sur le port 8085
4. Vérifier dans les logs: "Started UserApplication"

## 🔧 Étape 3: Configurer Keycloak

### 3.1 Créer le rôle ADMIN dans Keycloak

1. Ouvrir Keycloak: http://localhost:9090
2. Se connecter avec admin/admin
3. Sélectionner le realm "wordly-realm"
4. Aller dans **Realm roles** (menu gauche)
5. Cliquer sur **Create role**
6. Entrer:
   - Role name: `ADMIN`
   - Description: `Administrator role`
7. Cliquer sur **Save**

### 3.2 Vérifier les autres rôles

Assurez-vous que ces rôles existent aussi:
- ✅ TEACHER
- ✅ STUDENT
- ✅ ADMIN (nouveau)

## 👤 Étape 4: Créer l'utilisateur ADMIN

### 4.1 Via API (Recommandé)

Ouvrir PowerShell et exécuter:

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

**Si vous obtenez une erreur 500:**
- Vérifiez que UserService est bien démarré
- Vérifiez que le rôle ADMIN existe dans Keycloak
- Vérifiez les logs de UserService dans IntelliJ

### 4.2 Assigner le rôle ADMIN dans Keycloak

1. Dans Keycloak, aller dans **Users** (menu gauche)
2. Chercher l'utilisateur "admin"
3. Cliquer sur l'utilisateur
4. Aller dans l'onglet **Role mapping**
5. Cliquer sur **Assign role**
6. Cocher **ADMIN**
7. Cliquer sur **Assign**

## 🧪 Étape 5: Tester la Connexion

### 5.1 Test Frontend (TEACHER/STUDENT)

1. Ouvrir http://localhost:4200
2. Cliquer sur "Sign In"
3. Se connecter avec un compte TEACHER ou STUDENT
4. **Résultat attendu:** Redirection vers http://localhost:4200 (page d'accueil)

### 5.2 Test Back-Office (ADMIN)

1. Ouvrir http://localhost:4200
2. Cliquer sur "Sign In"
3. Se connecter avec:
   - Email: `admin@test.com`
   - Password: `Admin123!`
4. **Résultat attendu:** Redirection vers http://localhost:4201/dashboard

## 🔍 Vérification de la Redirection

La logique de redirection est basée sur le rôle dans le JWT token:

```typescript
// Dans auth-modal.ts
const roles = payload.realm_access?.roles || [];
if (roles.includes('ADMIN')) {
  window.location.href = 'http://localhost:4201/dashboard';
} else {
  window.location.href = 'http://localhost:4200';
}
```

## ❌ Dépannage

### Erreur 500 lors de la création d'utilisateur

**Cause possible:** Le rôle ADMIN n'existe pas dans Keycloak

**Solution:**
1. Vérifier que le rôle ADMIN est créé dans Keycloak (Realm roles)
2. Redémarrer UserService
3. Réessayer la création d'utilisateur

### L'utilisateur ne peut pas se connecter

**Cause possible:** Le rôle n'est pas assigné dans Keycloak

**Solution:**
1. Aller dans Keycloak → Users → admin
2. Role mapping → Assign role → ADMIN
3. Réessayer la connexion

### Pas de redirection après login

**Cause possible:** Le token JWT ne contient pas les rôles

**Solution:**
1. Vérifier dans Keycloak: Clients → wordly-client → Client scopes
2. Vérifier que "roles" est inclus dans le token
3. Se déconnecter et se reconnecter

## 📝 Résumé des Ports

- Frontend: http://localhost:4200
- Back-Office: http://localhost:4201
- API Gateway: http://localhost:8888
- UserService: http://localhost:8085
- AbonnementService: http://localhost:8084
- Eureka: http://localhost:8761
- Keycloak: http://localhost:9090
- MySQL: localhost:3307

## ✅ Checklist Finale

- [ ] UserService redémarré avec nouveau client secret
- [ ] Rôle ADMIN créé dans Keycloak
- [ ] Utilisateur admin créé via API
- [ ] Rôle ADMIN assigné à l'utilisateur dans Keycloak
- [ ] Test connexion TEACHER/STUDENT → Frontend
- [ ] Test connexion ADMIN → Back-Office
