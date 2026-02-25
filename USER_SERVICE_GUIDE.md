# Guide Complet - User Service avec JWT

## Vue d'ensemble

Microservice complet de gestion des utilisateurs avec authentification JWT, sans Keycloak (JWT natif Spring Security).

## Architecture

```
UserService (Port 8085)
├── Authentification JWT
├── 3 Rôles: ADMIN, TEACHER, STUDENT
├── Attributs spécifiques par rôle
├── MySQL Database (user_db)
└── Eureka Client
```

## Structure de la Table User

Une seule table avec tous les attributs:

```sql
CREATE TABLE users (
    -- Authentification
    id_user BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    date_creation DATETIME NOT NULL,
    last_login DATETIME,
    
    -- Informations communes
    nom VARCHAR(50),
    prenom VARCHAR(50),
    telephone VARCHAR(20),
    
    -- Champs TEACHER
    specialite VARCHAR(100),
    experience INT,
    disponibilite VARCHAR(100),
    
    -- Champs STUDENT
    date_naissance DATE,
    niveau_actuel VARCHAR(50),
    statut_etudiant VARCHAR(20),
    
    -- Champs ADMIN
    poste VARCHAR(50)
);
```

## Fichiers Créés

```
UserService/
├── pom.xml
├── src/main/
│   ├── java/tn/esprit/user/
│   │   ├── UserServiceApplication.java
│   │   ├── entity/
│   │   │   └── User.java
│   │   ├── dto/
│   │   │   ├── UserDTO.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   └── AuthResponse.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   ├── service/
│   │   │   └── UserService.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   └── UserController.java
│   │   ├── security/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── CustomUserDetailsService.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   └── UserAlreadyExistsException.java
│   │   └── config/
│   └── resources/
│       └── application.properties
└── README.md
```

## Démarrage

### 1. Prérequis
- MySQL sur port 3307
- Eureka Server sur port 8761

### 2. Lancer le service
```bash
cd UserService
# Dans IntelliJ: Exécuter UserServiceApplication.java
```

### 3. Vérifier
- Service: http://localhost:8085/api/users/hello
- Swagger: http://localhost:8085/swagger-ui.html
- Eureka: http://localhost:8761 (vérifier USER-SERVICE)

## Utilisation

### 1. Inscription d'un étudiant

```bash
POST http://localhost:8085/api/auth/register
Content-Type: application/json

{
  "username": "student2",
  "email": "student2@wordly.com",
  "password": "password123",
  "role": "STUDENT",
  "nom": "Dupont",
  "prenom": "Alice",
  "telephone": "+216 98 765 432",
  "date_naissance": "2001-03-15",
  "niveau_actuel": "Licence 3",
  "statut_etudiant": "Inscrit"
}
```

### 2. Inscription d'un enseignant

```bash
POST http://localhost:8085/api/auth/register
Content-Type: application/json

{
  "username": "teacher2",
  "email": "teacher2@wordly.com",
  "password": "password123",
  "role": "TEACHER",
  "nom": "Martin",
  "prenom": "Pierre",
  "telephone": "+216 55 123 456",
  "specialite": "Informatique",
  "experience": 10,
  "disponibilite": "Mardi, Jeudi"
}
```

### 3. Connexion

```bash
POST http://localhost:8085/api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "admin",
  "password": "admin123"
}
```

**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcwODExNjAwMCwiZXhwIjoxNzA4MjAyNDAwfQ...",
  "type": "Bearer",
  "user": {
    "id_user": 1,
    "username": "admin",
    "email": "admin@wordly.com",
    "role": "ADMIN",
    "enabled": true,
    "nom": "Admin",
    "prenom": "System",
    "poste": "Directeur"
  }
}
```

### 4. Utiliser le token JWT

Pour tous les endpoints protégés, ajouter le header:
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

### 5. Récupérer tous les utilisateurs

```bash
GET http://localhost:8085/api/users
Authorization: Bearer <votre_token>
```

### 6. Récupérer les étudiants

```bash
GET http://localhost:8085/api/users/role/STUDENT
Authorization: Bearer <votre_token>
```

### 7. Rechercher des utilisateurs

```bash
GET http://localhost:8085/api/users/search?query=martin
Authorization: Bearer <votre_token>
```

### 8. Statistiques

```bash
GET http://localhost:8085/api/users/stats
Authorization: Bearer <votre_token>
```

**Réponse:**
```json
{
  "totalUsers": 3,
  "totalAdmins": 1,
  "totalTeachers": 1,
  "totalStudents": 1,
  "activeUsers": 3,
  "inactiveUsers": 0
}
```

## Endpoints Complets

### Authentification (Public)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Utilisateur connecté |

### Utilisateurs (Protégé - JWT requis)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users` | Liste tous |
| GET | `/api/users/{id}` | Par ID |
| GET | `/api/users/username/{username}` | Par username |
| GET | `/api/users/email/{email}` | Par email |
| GET | `/api/users/role/{role}` | Par rôle |
| GET | `/api/users/enabled/{enabled}` | Par statut |
| GET | `/api/users/search?query=` | Recherche |
| GET | `/api/users/students/statut/{statut}` | Étudiants par statut |
| GET | `/api/users/teachers/specialite?specialite=` | Enseignants par spécialité |
| POST | `/api/users` | Créer |
| PUT | `/api/users/{id}` | Modifier |
| PATCH | `/api/users/{id}/toggle-status` | Toggle statut |
| DELETE | `/api/users/{id}` | Supprimer |
| GET | `/api/users/stats` | Statistiques |

## Intégration avec API Gateway

Ajouter la route dans `ApiGateway/src/main/resources/application.properties`:

```properties
# Route pour le service User
spring.cloud.gateway.routes[1].id=user-service
spring.cloud.gateway.routes[1].uri=lb://USER-SERVICE
spring.cloud.gateway.routes[1].predicates[0]=Path=/user-service/**
spring.cloud.gateway.routes[1].filters[0]=StripPrefix=1
```

Accès via Gateway:
```
http://localhost:8888/user-service/api/auth/login
http://localhost:8888/user-service/api/users
```

## Sécurité

### JWT Configuration
- **Secret**: Configurable dans `application.properties`
- **Expiration**: 24 heures (86400000 ms)
- **Algorithme**: HS512

### Password Encoding
- **BCrypt** avec force 10

### Endpoints Publics
- `/api/auth/**` - Authentification
- `/swagger-ui/**` - Documentation
- `/api/users/hello` - Test

### Endpoints Protégés
- Tous les autres endpoints nécessitent un token JWT valide

## Tests avec Postman

1. **Créer une collection** "User Service"

2. **Ajouter une variable** `token`:
   - Après login, copier le token
   - Utiliser `{{token}}` dans les headers

3. **Header pour endpoints protégés**:
   ```
   Authorization: Bearer {{token}}
   ```

## Données de Test

| Username | Password | Rôle | Description |
|----------|----------|------|-------------|
| admin | admin123 | ADMIN | Directeur |
| teacher1 | teacher123 | TEACHER | Prof de Maths |
| student1 | student123 | STUDENT | Étudiant L2 |

## Troubleshooting

### Erreur 401 Unauthorized
- Vérifier que le token est valide
- Vérifier que le header Authorization est présent
- Le token expire après 24h

### Erreur 409 Conflict
- Username ou email déjà existant
- Choisir un autre username/email

### Erreur de connexion MySQL
- Vérifier que MySQL tourne sur port 3307
- Vérifier les credentials dans `application.properties`

## Prochaines Étapes

1. ✅ Microservice User avec JWT complet
2. 🔄 Intégration avec le frontend Angular
3. 🔄 Intégration avec le back-office
4. 🔄 Gestion des rôles et permissions
5. 🔄 Refresh tokens
6. 🔄 Réinitialisation de mot de passe
7. 🔄 Vérification email
