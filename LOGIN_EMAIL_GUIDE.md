# Guide - Login avec Email

## ✅ Modification Appliquée

Le login utilise maintenant **Email + Password** au lieu de Username + Password.

## 📝 Fichiers Modifiés

### Frontend

1. **Models** (`frontend/angular-app/src/app/models/user.model.ts`)
   ```typescript
   export interface LoginRequest {
     email: string;      // ← Changé de username à email
     password: string;
   }
   ```

2. **Auth Service** (`frontend/angular-app/src/app/services/auth.service.ts`)
   - Récupère d'abord l'utilisateur par email
   - Extrait le username
   - Login avec username vers Keycloak

3. **Auth Modal** (`frontend/angular-app/src/app/components/auth-modal/auth-modal.ts`)
   - loginData utilise email au lieu de username
   - Message d'erreur: "Invalid email or password"

4. **Auth Modal HTML** (`frontend/angular-app/src/app/components/auth-modal/auth-modal.html`)
   - Champ "Email" au lieu de "Username"
   - Type input: email
   - Placeholder: "Enter your email"

### Backend

**AuthController** (`UserService/src/main/java/tn/esprit/user/controller/AuthController.java`)
- Nouvel endpoint: `GET /api/auth/user-by-email?email=xxx`
- Retourne les infos utilisateur (incluant username)

## 🔄 Flux de Connexion

### AVANT (avec username)
```
1. User entre: username + password
2. Frontend → Keycloak avec username + password
3. Keycloak valide et retourne token
4. Frontend stocke token
```

### APRÈS (avec email)
```
1. User entre: email + password
2. Frontend → User Service: GET /api/auth/user-by-email?email=xxx
3. User Service retourne: { username: "xxx", ... }
4. Frontend → Keycloak avec username + password
5. Keycloak valide et retourne token
6. Frontend stocke token
```

## 🎯 Avantages

- ✅ Plus intuitif pour l'utilisateur (email au lieu de username)
- ✅ Cohérent avec le formulaire d'inscription
- ✅ Standard moderne (la plupart des sites utilisent email)
- ✅ Pas besoin de se souvenir du username

## 🔧 Détails Techniques

### Frontend - AuthService.login()

```typescript
login(request: LoginRequest): Observable<TokenResponse> {
  // 1. Récupérer l'utilisateur par email
  return this.http.get<User>(`${this.apiUrl}/user-by-email?email=${request.email}`).pipe(
    switchMap(user => {
      // 2. Login avec username vers Keycloak
      const body = new URLSearchParams();
      body.set('username', user.username);  // ← Utilise le username récupéré
      body.set('password', request.password);
      body.set('grant_type', 'password');
      body.set('client_id', 'wordly-client');
      body.set('client_secret', 'fFWjOZlxqLgrswbI9sfeiDj1xQbyw1DG');

      return this.http.post<TokenResponse>(this.keycloakUrl, body.toString(), { headers });
    }),
    tap(response => {
      // 3. Stocker le token
      this.saveToken(response.access_token);
      this.saveRefreshToken(response.refresh_token);
      this.isAuthenticatedSubject.next(true);
      this.loadCurrentUser();
    })
  );
}
```

### Backend - AuthController

```java
@GetMapping("/user-by-email")
public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
    try {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "User not found with email: " + email);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

## 🚀 Pour Tester

### 1. Créer un utilisateur
```
Via modal Register:
- Email: test@student.com
- Username: test_student
- Password: 123456
- Role: STUDENT
```

### 2. Se connecter
```
Via modal Login:
- Email: test@student.com  ← Utiliser l'email
- Password: 123456
```

### 3. Vérifier
- ✅ Connexion réussie
- ✅ Modal se ferme
- ✅ Header affiche l'utilisateur
- ✅ Token stocké dans localStorage

## 📊 Gestion des Erreurs

### Email non trouvé
```
Erreur: "User not found with email: xxx"
Message affiché: "Invalid email or password"
```

### Mot de passe incorrect
```
Erreur Keycloak: 401 Unauthorized
Message affiché: "Invalid email or password"
```

### Email invalide
```
Validation HTML5: "Please enter a valid email address"
```

## 🎨 Interface Utilisateur

### Modal Login

```
┌─────────────────────────────────────┐
│  [X]                                │
│                                     │
│  Sign in to your account            │
│                                     │
│  Email                              │
│  [test@student.com_______]          │
│                                     │
│  Password                           │
│  [••••••••••••••••]                 │
│                                     │
│  [Sign in]                          │
│                                     │
│  Don't have an account? Sign up     │
└─────────────────────────────────────┘
```

## ⚠️ Important

### Keycloak utilise toujours le username
Keycloak ne supporte pas nativement le login par email. C'est pourquoi nous:
1. Récupérons le username depuis notre base de données
2. Utilisons ce username pour l'authentification Keycloak

### Sécurité
- L'endpoint `/api/auth/user-by-email` est public
- Il ne retourne que les infos de base (pas de données sensibles)
- Le password n'est jamais exposé

## 📝 Exemples de Test

### Test 1: Login avec email existant
```
Email: test@student.com
Password: 123456
Résultat: ✅ Connexion réussie
```

### Test 2: Login avec email inexistant
```
Email: notfound@test.com
Password: 123456
Résultat: ❌ "Invalid email or password"
```

### Test 3: Login avec mauvais password
```
Email: test@student.com
Password: wrong
Résultat: ❌ "Invalid email or password"
```

### Test 4: Login avec email invalide
```
Email: notanemail
Password: 123456
Résultat: ❌ Validation HTML5
```

## ✅ Résultat Final

Login moderne et intuitif avec email + password, tout en conservant la compatibilité avec Keycloak qui utilise username en interne.

## 📚 Documentation

- `LOGIN_EMAIL_GUIDE.md` - Ce fichier
- `MODAL_AUTH_GUIDE.md` - Guide des modals
- `FRONTEND_AUTH_GUIDE.md` - Guide général authentification
