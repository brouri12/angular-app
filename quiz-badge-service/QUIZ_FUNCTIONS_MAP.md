# Quiz Functions Map (Spring + Front + Legacy)

Ce fichier sert de carte rapide: **quoi fait quoi**, et **où se trouve le code**.

## 1) Spring Boot pur (quiz avancé)

### Controller
- `src/main/java/com/elearning/quizbadge/controller/QuizAdvancedController.java`
  - `eligibility(...)` -> `GET /api/quizzes/{id}/eligibility`
  - `start(...)` -> `POST /api/quiz-sessions/start`
  - `save(...)` -> `PUT /api/quiz-sessions/{id}`
  - `submit(...)` -> `POST /api/quiz-sessions/{id}/submit`

### Service métier
- `src/main/java/com/elearning/quizbadge/service/QuizAdvancedService.java`
  - `checkEligibility(...)` : règles d'accès (tentatives + délai)
  - `startOrResume(...)` : reprise session IN_PROGRESS
  - `saveProgress(...)` : autosave (step, durée, réponses)
  - `submit(...)` : scoring final, contrôle temps, per-question stats
  - `toStartResponse(...)` : payload front de reprise

### Entités quiz
- `src/main/java/com/elearning/quizbadge/entity/Quiz.java`
- `src/main/java/com/elearning/quizbadge/entity/QuizQuestion.java`
- `src/main/java/com/elearning/quizbadge/entity/QuizSession.java`
- `src/main/java/com/elearning/quizbadge/entity/QuizAnswer.java`

### Repositories
- `src/main/java/com/elearning/quizbadge/repository/QuizRepository.java`
- `src/main/java/com/elearning/quizbadge/repository/QuizQuestionRepository.java`
- `src/main/java/com/elearning/quizbadge/repository/QuizSessionRepository.java`
- `src/main/java/com/elearning/quizbadge/repository/QuizAnswerRepository.java`

## 2) Spring quiz "compat" (questions/réponses)

- `src/main/java/com/elearning/quizbadge/controller/QuestionController.java`
  - `createQuestion(...)`
  - `getQuestionById(...)`
  - `getQuestionsByCourseQuery(...)` (compat `/api/questions?courseId=...`)
  - `getAllQuestions(...)`
  - `getQuestionsByCourse(...)`
  - `updateQuestion(...)`
  - `deleteQuestion(...)`

- `src/main/java/com/elearning/quizbadge/controller/ResponseController.java`
  - `getResponses(...)` (compat `/api/responses?...`)
  - `submitResponse(...)`
  - `getResponsesByStudent(...)`
  - `getResponsesByQuestion(...)`
  - `getResponsesByEnrollment(...)`

- `src/main/java/com/elearning/quizbadge/service/QuestionService.java`
- `src/main/java/com/elearning/quizbadge/service/ResponseService.java`

## 3) Frontend quiz (student)

- `../front-office/student.html`
  - `api(...)` : routing Spring/Node + fallback
  - `openGlobalQuizTodoList(...)` : navigation To-do Review
  - `createQuizSecurityGuard(...)` : anti-triche (copy, Ctrl+C/A/X, tab switch)
  - `collectAnswers(...)`
  - `startOrResume(...)`
  - `triggerAutoSubmitWhenTimeUp(...)`

- `../../_integration/angular-app/front-office-html/student.html`
  - mêmes fonctions (version intégration)

## 4) Frontend quiz (teacher)

- `../front-office/teacher.html`
  - `api(...)` : routing Spring/Node + fallback
  - `pedagogyCreateQuiz(...)`
  - `pedagogyEditQuiz(...)`
  - `pedagogySubmitQuizEdit(...)`
  - `pedagogyAddQuizQuestion(...)`
  - `pedagogyQuizQuestionSubmit(...)`

- `../../_integration/angular-app/front-office-html/teacher.html`
  - mêmes fonctions (version intégration)

## 5) Legacy Node quiz (encore présent)

- `../xampp-mysql-dashboard.js`
  - routes historiques quiz avancé (eligibility, sessions, submit, etc.)
  - utile comme fallback pendant migration.

---

## "Quiz API, c'est quoi purement Spring Boot ?"

Dans ce projet, la partie purement Spring Boot est ce qui est dans:
- `controller/QuizAdvancedController.java`
- `service/QuizAdvancedService.java`
- `entity/Quiz*.java`
- `repository/Quiz*.java`

Le frontend appelle ces routes HTTP, mais la logique métier est exécutée dans les services Spring.

---

## Résumé Spring Boot (rapport / PPT — 10 points)

1. Le backend Spring Boot gère les quiz, les sessions et les résultats.
2. L’étudiant démarre un quiz via une API sécurisée.
3. Les questions sont servies au frontend ; les réponses sont renvoyées au backend.
4. Spring Boot corrige, calcule le score et enregistre la tentative.
5. La sécurité d’accès repose sur Spring Security (et Keycloak / JWT selon la configuration du projet).
6. Le frontend applique des règles d’intégrité (anti-copie, changement d’onglet).
7. Ces événements peuvent être transmis au backend dans le cadre de la session de quiz.
8. Le backend peut marquer une session comme suspecte ou forcer la fin du quiz selon les règles métier.
9. Une détection « caméra » (autre personne, téléphone) nécessiterait un module d’analyse vidéo / ML en complément ; ce dépôt ne l’intègre pas nativement dans Spring Boot.
10. En cas d’alerte fraude (si un tel module est branché), le backend peut terminer le quiz et refuser de nouvelles soumissions pour la session concernée.
