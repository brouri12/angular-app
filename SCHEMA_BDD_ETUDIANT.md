# Schéma base de données – Étudiant et intégrité des données

Ce document décrit les tables et relations utilisées pour associer **chaque étudiant** à ses données (cours, quiz, scores, progression, historique).

## Tables principales

### 1. `students`
- **id** (PK), firstName, lastName, **email** (UNIQUE), city, country, latitude, longitude, registrationDate
- Identifiant unique : **id** ou **email** pour lier la session après login.

### 2. `courses`
- **id** (PK), courseCode, title, description, teacherId, level, status, price, etc.
- Catalogue des cours créés par les professeurs.

### 3. `enrollments` (inscriptions)
- **id** (PK), **studentId** (FK → students.id), **courseId** (FK → courses.id), status, completionPercentage, finalGrade, enrollmentDate
- **UNIQUE (studentId, courseId)** : un étudiant ne s’inscrit qu’une fois par cours.
- Chaque inscription est liée à un étudiant via **studentId**.

### 4. `quizzes` / `quiz_questions`
- quizzes : **id** (PK), chapterId, title, passingScorePercent
- quiz_questions : questions d’un quiz (quizId → quizzes.id)

### 5. `quiz_attempts` (tentatives de quiz)
- **id** (PK), **studentId** (FK → students.id), **quizId** (FK → quizzes.id), scorePercent, pointsEarned, completedAt
- Chaque tentative est enregistrée avec l’**ID de l’étudiant**.

### 6. `student_points`
- **studentId** (PK, FK → students.id), totalPoints, updatedAt
- Total des points par étudiant (quiz, badges, etc.).

### 7. `badges`
- **id** (PK), **studentId** (FK → students.id), badgeName, badgeType, courseId, badgeLevel, earnedDate, etc.
- Chaque badge est attribué à un étudiant via **studentId**.

### 8. `responses` (réponses aux questions)
- **studentId** (FK → students.id), questionId, enrollmentId, answerText, isCorrect, pointsEarned
- Chaque réponse est liée à un étudiant.

### 9. `course_feedbacks` / `chapter_feedbacks`
- **studentId** (FK → students.id) : avis et commentaires liés à l’étudiant.

## Relations (foreign keys)

- **enrollments.studentId** → students(id) ON DELETE CASCADE  
- **enrollments.courseId** → courses(id) ON DELETE CASCADE  
- **quiz_attempts.studentId** → students(id) ON DELETE CASCADE  
- **quiz_attempts.quizId** → quizzes(id) ON DELETE CASCADE  
- **student_points.studentId** → students(id) ON DELETE CASCADE  
- **badges.studentId** → students(id)  
- **responses.studentId** → students(id) ON DELETE CASCADE  
- **course_feedbacks.studentId** → students(id) ON DELETE SET NULL  
- **chapter_feedbacks.studentId** → students(id) ON DELETE SET NULL  

## Logique métier

- **Identifiant unique** : après login, l’étudiant est identifié par **email** ; le backend trouve ou crée un enregistrement dans `students` et renvoie **id**.
- Toutes les opérations (inscription à un cours, passage d’un quiz, score, badge, feedback) utilisent ce **studentId**.
- Les APIs filtrent par `studentId` :  
  `GET /api/enrollments?studentId=...`,  
  `GET /api/badges?studentId=...`,  
  `POST /api/quiz-attempts` avec `studentId` dans le body,  
  `POST /api/enrollments` avec `studentId` et `courseId`.

### 10. `student_learning_events` (historique / fil d’activité)

- **id**, **studentId** (FK → students), **eventType** (ex. ENROLLMENT, PROGRESS_UPDATE, QUIZ_ATTEMPT, COURSE_COMPLETED, BADGE_EARNED),
- **courseId**, **enrollmentId**, **quizId** (optionnels), **title**, **detail** (JSON texte), **scorePercent**, **createdAt**.

### Colonnes supplémentaires sur `enrollments`

- **lastActivityAt**, **startedAt**, **parcoursContext** (libellé niveau/chapitre courant, optionnel).

## Objectif

Un **profil unique par étudiant** avec toutes les activités associées (cours inscrits, quiz effectués, scores, progression, badges, historique), et une base de données cohérente grâce aux clés étrangères.

**API :** `GET /api/student-history?studentId=` agrège inscriptions, tentatives de quiz et événements. **POST /api/students/learning-event** permet d’enregistrer une activité personnalisée (ex. parcours).
