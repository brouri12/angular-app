# Quiz Badge Service

Service de gestion des quiz, questions et badges pour la plateforme Wordly.

## 🎯 Fonctionnalités

### Quiz
- Création et gestion de quiz
- Questions à choix multiples, vrai/faux, réponses courtes
- Système de notation et score de passage
- Limite de temps configurable
- Historique des tentatives

### Badges
- Système de badges et récompenses
- Niveaux de rareté (Common, Rare, Epic, Legendary)
- Génération de certificats PDF avec QR code
- Critères d'obtention personnalisables
- Statistiques et classement

### Chatbot (Optionnel)
- Assistant d'apprentissage IA
- Support OpenAI et Hugging Face
- Aide contextuelle pour les étudiants

## 🚀 Démarrage

### Prérequis
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Eureka Server en cours d'exécution

### Configuration

Le service utilise le port **8082** (mappé sur 8092 en externe) et se connecte à :
- MySQL sur `localhost:3309` (base: `quiz_badge_db`)
- Eureka Server sur `localhost:8761`

### Démarrage en développement

```bash
# Avec Maven
mvn spring-boot:run

# Avec Docker
docker-compose up quiz-badge-service
```

### Démarrage avec le script PowerShell

```powershell
.\START_FORMATION_SERVICES.ps1
```

## 📊 Modèle de données

### Quiz
```json
{
  "id": 1,
  "title": "Quiz Angular Basics",
  "description": "Testez vos connaissances",
  "formationId": 1,
  "courseId": 1,
  "difficulty": "MEDIUM",
  "passingScore": 70,
  "timeLimit": 30
}
```

### Question
```json
{
  "id": 1,
  "quizId": 1,
  "questionText": "Qu'est-ce qu'un composant Angular?",
  "questionType": "MULTIPLE_CHOICE",
  "points": 10,
  "order": 1,
  "options": [
    {
      "id": 1,
      "optionText": "Une classe TypeScript",
      "isCorrect": true,
      "order": 1
    }
  ]
}
```

### Badge
```json
{
  "id": 1,
  "name": "Angular Master",
  "description": "Complété tous les quiz Angular",
  "imageUrl": "https://...",
  "criteria": "Complete 10 Angular quizzes",
  "points": 100,
  "category": "Web Development",
  "rarity": "EPIC"
}
```

## 🔗 Endpoints API

### Quiz

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/quizzes` | Liste tous les quiz |
| GET | `/api/quizzes/{id}` | Détails d'un quiz |
| POST | `/api/quizzes` | Créer un quiz |
| PUT | `/api/quizzes/{id}` | Modifier un quiz |
| DELETE | `/api/quizzes/{id}` | Supprimer un quiz |
| GET | `/api/quizzes/formation/{id}` | Quiz d'une formation |
| GET | `/api/quizzes/course/{id}` | Quiz d'un cours |
| POST | `/api/quizzes/{id}/start` | Démarrer une tentative |
| POST | `/api/quizzes/{id}/submit` | Soumettre un quiz |
| GET | `/api/quizzes/{id}/my-attempts` | Mes tentatives |
| GET | `/api/quizzes/{id}/statistics` | Statistiques du quiz |

### Questions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/quizzes/{id}/questions` | Questions d'un quiz |
| POST | `/api/quizzes/questions` | Créer une question |
| PUT | `/api/quizzes/questions/{id}` | Modifier une question |
| DELETE | `/api/quizzes/questions/{id}` | Supprimer une question |

### Badges

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/badges` | Liste tous les badges |
| GET | `/api/badges/{id}` | Détails d'un badge |
| POST | `/api/badges` | Créer un badge |
| PUT | `/api/badges/{id}` | Modifier un badge |
| DELETE | `/api/badges/{id}` | Supprimer un badge |
| GET | `/api/badges/my-badges` | Mes badges |
| GET | `/api/badges/user/{userId}` | Badges d'un utilisateur |
| POST | `/api/badges/{id}/award` | Attribuer un badge |
| GET | `/api/badges/{id}/certificate` | Télécharger certificat PDF |
| GET | `/api/badges/{id}/progress` | Progression vers un badge |
| GET | `/api/badges/leaderboard` | Classement des badges |

### Chatbot

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/chatbot/student` | Poser une question au chatbot |

## 🔧 Configuration

### application.properties

```properties
server.port=8082
spring.application.name=quiz-badge-service

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3309/quiz_badge_db
spring.datasource.username=root
spring.datasource.password=root

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# Certificat PDF
elearning.certificate.brand-title=Jungle in English
elearning.certificate.subtitle=Certificate of Quiz Achievement
elearning.certificate.footer=Authorized & verified by Jungle in English

# Chatbot (Optionnel)
# chatbot.openai.api-key=YOUR_KEY
# chatbot.openai.model=gpt-4o-mini
# chatbot.huggingface.api-key=YOUR_KEY
# chatbot.huggingface.model=Qwen/Qwen2.5-7B-Instruct
```

### Configuration du Chatbot

Pour activer le chatbot, ajoutez une clé API dans `application.properties` :

**Option 1 : OpenAI**
```properties
chatbot.openai.api-key=sk-...
chatbot.openai.model=gpt-4o-mini
```

**Option 2 : Hugging Face**
```properties
chatbot.huggingface.api-key=hf_...
chatbot.huggingface.model=Qwen/Qwen2.5-7B-Instruct
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
docker build -t wordly-quiz-badge-service .
```

## 🎨 Génération de Certificats

Le service génère automatiquement des certificats PDF pour les badges obtenus :
- Design professionnel avec logo
- QR code de vérification
- Informations du badge et de l'utilisateur
- Téléchargeable via `/api/badges/{id}/certificate`

## 🐛 Troubleshooting

### Le service ne démarre pas
- Vérifiez que MySQL est accessible sur le port 3309
- Vérifiez que la base `quiz_badge_db` existe
- Vérifiez qu'Eureka Server est en cours d'exécution

### Le chatbot ne répond pas
- Vérifiez que vous avez configuré une clé API (OpenAI ou Hugging Face)
- Vérifiez les logs pour les erreurs d'API

### Erreur lors de la génération de certificat
- Vérifiez que PDFBox est correctement installé
- Vérifiez les permissions d'écriture

## 📝 Logs

```bash
# Voir les logs en temps réel
docker-compose logs -f quiz-badge-service

# Logs des 100 dernières lignes
docker-compose logs --tail=100 quiz-badge-service
```

## 🔗 Liens utiles

- [Documentation Spring Boot](https://spring.io/projects/spring-boot)
- [Documentation PDFBox](https://pdfbox.apache.org/)
- [Documentation ZXing (QR Code)](https://github.com/zxing/zxing)
- [OpenAI API](https://platform.openai.com/docs)
- [Hugging Face API](https://huggingface.co/docs/api-inference)
