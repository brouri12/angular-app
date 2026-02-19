# Architecture microservices – Plateforme E-Learning

## Vue d’ensemble

- **API Node (monolith)** : port **8083** (ou 8081 selon config) – students, courses, enrollments, teachers, questions, badges, pédagogie (levels, chapters, lessons, quizzes), etc.
- **Eureka** : port **8761** – découverte des services.
- **API Gateway (Spring)** : port **8080** – route vers l’API Node et les microservices Spring.
- **Formation Service** (Spring) : enregistré dans Eureka.
- **Quiz-Badge Service** (Spring) : enregistré dans Eureka.

## Ordre de démarrage

1. **MySQL** (XAMPP) – base `elearning`.
2. **Eureka** : `cd eureka-server && .\mvnw.cmd spring-boot:run`
3. **Formation Service** : `cd formation-service && .\mvnw.cmd spring-boot:run`
4. **Quiz-Badge Service** : `cd quiz-badge-service && .\mvnw.cmd spring-boot:run`
5. **API Node** : `node xampp-mysql-dashboard.js` (port 8083 par défaut).
6. **API Gateway** : `cd api-gateway && .\mvnw.cmd spring-boot:run`

Important : dans `api-gateway/src/main/resources/application.yml`, l’URI de l’API Node doit correspondre au port utilisé (ex. `http://localhost:8083` si le backend tourne sur 8083, ou `http://localhost:8081` sinon).

## Routes exposées via la Gateway (8080)

| Préfixe / Path | Cible |
|----------------|--------|
| `/api/students`, `/api/courses`, `/api/enrollments`, `/api/questions`, `/api/badges`, `/api/database/**` | API Node |
| `/api/teachers`, `/api/pedagogy/**`, `/api/levels/**`, `/api/chapters/**`, `/api/lessons/**`, `/api/quizzes/**`, `/api/quiz-questions/**`, `/api/quiz-attempts/**`, `/api/materials/**` | API Node (à ajouter dans gateway si besoin) |
| `/api/formation/**` | Formation Service (Eureka) |
| `/api/quiz/**` | Quiz-Badge Service (Eureka) |
| `/api/badge/**` | Quiz-Badge Service (Eureka) |

## Configuration Gateway

Fichier : `api-gateway/src/main/resources/application.yml`.  
Pour que la Gateway envoie toutes les routes API vers l’API Node, vous pouvez utiliser un prédicat large, par exemple :

```yaml
- id: node-api
  uri: http://localhost:8083
  predicates:
    - Path=/api/**
  filters:
    # Exclure les paths déjà gérés par les microservices (formation, quiz, badge)
    - name: SetPath
      args:
        # ou gérer les exclusions selon votre besoin
```

Ajustez les `Path` selon les routes réellement utilisées par le front (students, courses, enrollments, teachers, pedagogy, etc.).
