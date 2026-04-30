# Formation Service

Service de gestion des formations, cours et leçons pour la plateforme Wordly.

## 🎯 Fonctionnalités

- Gestion des formations (CRUD)
- Gestion des cours par formation
- Gestion des leçons par cours
- Organisation hiérarchique : Formation → Cours → Leçons
- Support des catégories et niveaux
- Suivi de la durée et progression

## 🚀 Démarrage

### Prérequis
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Eureka Server en cours d'exécution

### Configuration

Le service utilise le port **8081** et se connecte à :
- MySQL sur `localhost:3308` (base: `formation_db`)
- Eureka Server sur `localhost:8761`

### Démarrage en développement

```bash
# Avec Maven
mvn spring-boot:run

# Avec Docker
docker-compose up formation-service
```

### Démarrage avec le script PowerShell

```powershell
.\START_FORMATION_SERVICES.ps1
```

## 📊 Modèle de données

### Formation
```json
{
  "id": 1,
  "title": "Introduction à Angular",
  "description": "Apprenez les bases d'Angular",
  "category": "Web Development",
  "level": "Beginner",
  "duration": 120,
  "imageUrl": "https://...",
  "teacherId": "teacher-123"
}
```

### Course
```json
{
  "id": 1,
  "formationId": 1,
  "title": "Les composants Angular",
  "description": "Comprendre les composants",
  "order": 1,
  "duration": 30
}
```

### Lesson
```json
{
  "id": 1,
  "courseId": 1,
  "title": "Créer votre premier composant",
  "content": "Dans cette leçon...",
  "videoUrl": "https://...",
  "order": 1,
  "duration": 15
}
```

## 🔗 Endpoints API

### Formations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/formations` | Liste toutes les formations |
| GET | `/api/formations/{id}` | Détails d'une formation |
| POST | `/api/formations` | Créer une formation |
| PUT | `/api/formations/{id}` | Modifier une formation |
| DELETE | `/api/formations/{id}` | Supprimer une formation |
| GET | `/api/formations/category/{category}` | Formations par catégorie |
| GET | `/api/formations/teacher/{teacherId}` | Formations par enseignant |

### Courses

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/courses` | Liste tous les cours |
| GET | `/api/courses/{id}` | Détails d'un cours |
| GET | `/api/courses/formation/{formationId}` | Cours d'une formation |
| POST | `/api/courses` | Créer un cours |
| PUT | `/api/courses/{id}` | Modifier un cours |
| DELETE | `/api/courses/{id}` | Supprimer un cours |

### Lessons

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/lessons` | Liste toutes les leçons |
| GET | `/api/lessons/{id}` | Détails d'une leçon |
| GET | `/api/lessons/course/{courseId}` | Leçons d'un cours |
| POST | `/api/lessons` | Créer une leçon |
| PUT | `/api/lessons/{id}` | Modifier une leçon |
| DELETE | `/api/lessons/{id}` | Supprimer une leçon |

## 🔧 Configuration

### application.properties

```properties
server.port=8081
spring.application.name=formation-service

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3308/formation_db
spring.datasource.username=root
spring.datasource.password=root

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

## 🧪 Tests

```bash
# Exécuter les tests
mvn test

# Avec couverture
mvn test jacoco:report
```

## 📦 Build

```bash
# Build JAR
mvn clean package

# Build Docker image
docker build -t wordly-formation-service .
```

## 🐛 Troubleshooting

### Le service ne démarre pas
- Vérifiez que MySQL est accessible sur le port 3308
- Vérifiez que la base `formation_db` existe
- Vérifiez qu'Eureka Server est en cours d'exécution

### Erreur de connexion à Eureka
- Vérifiez que le port 8761 est accessible
- Vérifiez les logs d'Eureka Server

## 📝 Logs

```bash
# Voir les logs en temps réel
docker-compose logs -f formation-service

# Logs des 100 dernières lignes
docker-compose logs --tail=100 formation-service
```

## 🔗 Liens utiles

- [Documentation Spring Boot](https://spring.io/projects/spring-boot)
- [Documentation Eureka](https://spring.io/projects/spring-cloud-netflix)
- [Documentation MySQL](https://dev.mysql.com/doc/)
