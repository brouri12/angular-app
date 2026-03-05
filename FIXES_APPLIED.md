# Corrections Appliquées - User Service

## Date: 19 Février 2026

## Problèmes Identifiés et Résolus

### 1. Erreur "Password is required" ✅

**Problème**: 
```
ConstraintViolationImpl{interpolatedMessage='Password is required', propertyPath=password}
```

**Cause**: 
- Le champ `password` dans l'entité `User.java` avait une validation `@NotBlank`
- Cette validation échouait car le UserService définit le password à "" (vide) après création dans Keycloak

**Solution**:
- Supprimé la validation `@NotBlank` du champ password
- Le password est maintenant géré uniquement par Keycloak
- MySQL stocke une chaîne vide pour le password

**Fichier modifié**: `UserService/src/main/java/tn/esprit/user/entity/User.java`

---

### 2. Erreur "Conflict" lors de la création d'utilisateur ✅

**Problème**:
```
Failed to create user in Keycloak: Conflict
```

**Cause**:
- Tentative de créer un utilisateur avec username "string" ou email déjà existant
- Keycloak retourne un code 409 (Conflict) mais le message n'était pas clair

**Solution**:
- Ajout de vérifications AVANT la création dans `KeycloakService.createKeycloakUser()`:
  - Vérification si username existe déjà
  - Vérification si email existe déjà
- Messages d'erreur plus explicites
- Création du script `CLEANUP_TEST_USERS.ps1` pour nettoyer les utilisateurs de test

**Fichier modifié**: `UserService/src/main/java/tn/esprit/user/service/KeycloakService.java`

---

### 3. Messages d'erreur peu informatifs ✅

**Problème**:
- Les erreurs retournaient seulement "No details"
- Difficile de déboguer les problèmes

**Solution**:
- Amélioration du gestionnaire d'erreurs dans `AuthController.register()`
- Ajout du type d'exception dans la réponse
- Ajout de logs console pour le débogage
- Message de succès plus clair avec les données de l'utilisateur créé

**Fichier modifié**: `UserService/src/main/java/tn/esprit/user/controller/AuthController.java`

---

## Modifications de Code

### User.java
```java
// AVANT
@Column(length = 255)
@NotBlank(message = "Password is required")
private String password;

// APRÈS
@Column(length = 255)
private String password; // Géré par Keycloak, stocké vide dans MySQL
```

### KeycloakService.java
```java
// AJOUTÉ au début de createKeycloakUser()
// Vérifier si l'utilisateur existe déjà
var existingUsers = usersResource.search(request.getUsername(), true);
if (!existingUsers.isEmpty()) {
    throw new RuntimeException("User already exists in Keycloak with username: " + request.getUsername());
}

// Vérifier si l'email existe déjà
var existingEmails = usersResource.search(null, request.getEmail(), null, null, 0, 1);
if (!existingEmails.isEmpty()) {
    throw new RuntimeException("User already exists in Keycloak with email: " + request.getEmail());
}

// MODIFIÉ la gestion d'erreur
if (response.getStatus() != 201) {
    String errorMessage = "Failed to create user in Keycloak: " + response.getStatusInfo();
    if (response.getStatus() == 409) {
        errorMessage = "User already exists in Keycloak (username or email conflict)";
    }
    throw new RuntimeException(errorMessage);
}
```

### AuthController.java
```java
// MODIFIÉ la méthode register()
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    try {
        UserDTO user = userService.createUser(request);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("user", user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        error.put("details", e.getCause() != null ? e.getCause().getMessage() : "No details");
        error.put("type", e.getClass().getSimpleName());
        
        // Log pour débogage
        System.err.println("Registration error: " + e.getMessage());
        if (e.getCause() != null) {
            System.err.println("Cause: " + e.getCause().getMessage());
        }
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

---

## Nouveaux Fichiers Créés

### 1. CLEANUP_TEST_USERS.ps1
Script PowerShell pour supprimer les utilisateurs de test de Keycloak.

**Usage**:
```powershell
.\CLEANUP_TEST_USERS.ps1
```

**Fonctionnalités**:
- Se connecte à Keycloak avec les credentials admin
- Liste tous les utilisateurs du realm wordly-realm
- Supprime les utilisateurs avec username de test (string, test, testuser, etc.)
- Supprime les utilisateurs avec email de test (contenant test, example, temp)

### 2. USER_SERVICE_TEST_GUIDE.md
Guide complet de test du User Service avec Keycloak.

**Contenu**:
- Explication des problèmes résolus
- Étapes de test détaillées
- Exemples de requêtes pour chaque rôle (ADMIN, TEACHER, STUDENT)
- Commandes SQL pour vérifier MySQL
- Instructions pour vérifier Keycloak
- Guide d'authentification JWT
- Résolution des problèmes courants

### 3. QUICK_TEST_COMMANDS.md
Référence rapide avec les commandes essentielles.

**Contenu**:
- Commande de nettoyage
- JSON pour créer des utilisateurs (Admin, Teacher, Student)
- Commande pour obtenir un token JWT
- Commande pour tester avec le token
- Requêtes SQL de vérification

### 4. FIXES_APPLIED.md (ce fichier)
Documentation des corrections appliquées.

---

## Architecture Finale

### Stockage des Données

**Keycloak** (Authentication):
- username
- email
- password (hashé)
- role (dans les attributs)
- enabled

**MySQL user_db** (Profil complet):
- id_user (PK)
- keycloak_id (lien avec Keycloak)
- username
- email
- password (vide)
- role
- enabled
- date_creation
- last_login
- nom, prenom, telephone
- Champs spécifiques TEACHER: specialite, experience, disponibilite
- Champs spécifiques STUDENT: date_naissance, niveau_actuel, statut_etudiant
- Champs spécifiques ADMIN: poste

### Flux de Création d'Utilisateur

1. Client → POST /api/auth/register
2. AuthController → UserService.createUser()
3. UserService → Vérification MySQL (username, email uniques)
4. UserService → KeycloakService.createKeycloakUser()
5. KeycloakService → Vérification Keycloak (username, email uniques)
6. KeycloakService → Création dans Keycloak (username, email, password, role)
7. KeycloakService → Retourne keycloak_id
8. UserService → Création dans MySQL (TOUS les attributs + keycloak_id)
9. UserService → Retourne UserDTO
10. AuthController → Retourne réponse au client

---

## Instructions pour Tester

### Étape 1: Redémarrer le User Service
1. Dans IntelliJ, arrêter le User Service
2. Relancer `UserApplication.java`
3. Attendre que le service démarre sur le port 8085

### Étape 2: Nettoyer les Utilisateurs de Test (optionnel)
```powershell
.\CLEANUP_TEST_USERS.ps1
```

### Étape 3: Tester l'Inscription
1. Ouvrir Swagger: http://localhost:8085/swagger-ui.html
2. Utiliser l'endpoint POST /api/auth/register
3. Utiliser les exemples de QUICK_TEST_COMMANDS.md
4. Vérifier la réponse 201 Created

### Étape 4: Vérifier la Création
- **MySQL**: `SELECT * FROM users;`
- **Keycloak**: http://localhost:9090 → wordly-realm → Users

### Étape 5: Tester l'Authentification
1. Obtenir un token avec les commandes de QUICK_TEST_COMMANDS.md
2. Utiliser le token pour accéder à /api/auth/me

---

## Statut Final

✅ Erreur "Password is required" - CORRIGÉE
✅ Erreur "Conflict" - CORRIGÉE avec vérifications et messages clairs
✅ Messages d'erreur - AMÉLIORÉS avec plus de détails
✅ Script de nettoyage - CRÉÉ
✅ Documentation - COMPLÈTE
✅ Aucune erreur de compilation

## Prochaines Étapes

1. Redémarrer le User Service dans IntelliJ
2. Tester l'inscription avec les exemples fournis
3. Vérifier la synchronisation Keycloak ↔ MySQL
4. Tester l'authentification JWT
5. Intégrer avec le frontend Angular
