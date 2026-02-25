# User Service - Microservice de Gestion des Utilisateurs

Microservice Spring Boot pour la gestion des utilisateurs avec authentification JWT.

## Caractéristiques

- ✅ Authentification JWT
- ✅ Gestion des rôles (ADMIN, TEACHER, STUDENT)
- ✅ CRUD complet des utilisateurs
- ✅ Attributs spécifiques par rôle
- ✅ Recherche et filtrage avancés
- ✅ Sécurité Spring Security
- ✅ Documentation Swagger
- ✅ Intégration Eureka

## Configuration

- **Port**: 8085
- **Base de données**: MySQL (port 3307)
- **Database**: user_db
- **Eureka**: http://localhost:8761

## Utilisateurs de test

| Username | Password | Rôle | Email |
|----------|----------|------|-------|
| admin | admin123 | ADMIN | admin@wordly.com |
| teacher1 | teacher123 | TEACHER | teacher1@wordly.com |
| student1 | student123 | STUDENT | student1@wordly.com |

## Endpoints

### Authentification (Public)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur connecté

### Utilisateurs (Protégé - JWT requis)
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/{id}` - Détails d'un utilisateur
- `GET /api/users/username/{username}` - Par username
- `GET /api/users/email/{email}` - Par email
- `GET /api/users/role/{role}` - Par rôle (ADMIN/TEACHER/STUDENT)
- `GET /api/users/enabled/{enabled}` - Par statut
- `GET /api/users/search?query=` - Recherche
- `GET /api/users/students/statut/{statut}` - Étudiants par statut
- `GET /api/users/teachers/specialite?specialite=` - Enseignants par spécialité
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `PATCH /api/users/{id}/toggle-status` - Activer/Désactiver
- `DELETE /api/users/{id}` - Supprimer
- `GET /api/users/stats` - Statistiques

## Démarrage

1. **MySQL** doit être démarré (port 3307)
2. **Eureka Server** doit être démarré (port 8761)
3. Exécuter `UserServiceApplication.java` dans IntelliJ

## Swagger

Documentation API: http://localhost:8085/swagger-ui.html

## Exemple d'utilisation

### 1. Inscription
```bash
POST http://localhost:8085/api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "STUDENT",
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+216 12 345 678",
  "date_naissance": "2000-01-01",
  "niveau_actuel": "Licence 1",
  "statut_etudiant": "Inscrit"
}
```

### 2. Connexion
```bash
POST http://localhost:8085/api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "admin",
  "password": "admin123"
}
```

Réponse:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "user": {
    "id_user": 1,
    "username": "admin",
    "email": "admin@wordly.com",
    "role": "ADMIN",
    ...
  }
}
```

### 3. Utiliser le token
```bash
GET http://localhost:8085/api/users
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

## Structure de la table User

Tous les attributs dans une seule table:

| Champ | Type | Description |
|-------|------|-------------|
| id_user | BIGINT | ID unique |
| username | VARCHAR(50) | Nom d'utilisateur |
| email | VARCHAR(100) | Email unique |
| password | VARCHAR(255) | Mot de passe chiffré |
| role | VARCHAR(20) | ADMIN/TEACHER/STUDENT |
| enabled | BOOLEAN | Compte actif |
| date_creation | DATETIME | Date de création |
| last_login | DATETIME | Dernière connexion |
| nom | VARCHAR(50) | Nom |
| prenom | VARCHAR(50) | Prénom |
| telephone | VARCHAR(20) | Téléphone |
| specialite | VARCHAR(100) | Spécialité (TEACHER) |
| experience | INT | Expérience (TEACHER) |
| disponibilite | VARCHAR(100) | Disponibilité (TEACHER) |
| date_naissance | DATE | Date de naissance (STUDENT) |
| niveau_actuel | VARCHAR(50) | Niveau (STUDENT) |
| statut_etudiant | VARCHAR(20) | Statut (STUDENT) |
| poste | VARCHAR(50) | Poste (ADMIN) |

## Sécurité

- Mots de passe chiffrés avec BCrypt
- Tokens JWT avec expiration (24h)
- Endpoints protégés par rôle
- CORS configuré
