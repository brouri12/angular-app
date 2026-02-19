# Modèle de données – Plateforme E-Learning

## 1. Schéma relationnel et associations

### Entités principales

| Table | Rôle | Clés / Associations |
|-------|------|---------------------|
| **teachers** | Formateurs | Aucune FK entrante. `courses.teacherId` → teachers.id |
| **students** | Étudiants | Référencé par enrollments, responses, badges, quiz_attempts, student_points |
| **courses** | Cours / formations | teacherId → teachers.id ; référencé par enrollments, questions, course_materials, badges |
| **enrollments** | Affectation étudiant ↔ cours | studentId → students.id ; courseId → courses.id ; UNIQUE(studentId, courseId) |
| **questions** | Questions (par cours) | courseId → courses.id |
| **responses** | Réponses des étudiants | studentId → students.id ; questionId → questions.id ; enrollmentId → enrollments.id |
| **badges** | Badges obtenus par étudiant | studentId → students.id ; courseId → courses.id (optionnel) |
| **course_materials** | Supports (PDF/vidéo) d’un cours | courseId → courses.id |

### Structure pédagogique (niveaux → quiz)

| Table | Rôle | Associations |
|-------|------|----------------|
| **levels** | Niveaux (A1–C2) | Référencé par chapters |
| **chapters** | Chapitres d’un niveau | levelId → levels.id ; référencé par lessons, quizzes |
| **lessons** | Leçons (vidéo/PDF) d’un chapitre | chapterId → chapters.id |
| **quizzes** | Quiz d’un chapitre | chapterId → chapters.id |
| **quiz_questions** | Questions d’un quiz | quizId → quizzes.id |
| **quiz_attempts** | Tentative d’un étudiant à un quiz | studentId → students.id ; quizId → quizzes.id |
| **student_points** | Total de points par étudiant | studentId → students.id (PK) |

---

## 2. Diagramme des associations (résumé)

```
teachers (id, firstName, lastName, email, ...)
    ↑
    │ teacherId (optionnel)
courses (id, courseCode, title, teacherId, ...)
    ├── enrollments (studentId, courseId)  ←→ students
    ├── questions
    ├── course_materials
    └── badges (optionnel courseId)

students (id, firstName, lastName, email, ...)
    ├── enrollments (studentId, courseId)  ←→ courses
    ├── responses (questionId → questions)
    ├── badges
    ├── quiz_attempts (quizId → quizzes)
    └── student_points (1:1)

levels (id, code, name)
    └── chapters (levelId)
          ├── lessons (chapterId)
          └── quizzes (chapterId)
                └── quiz_questions (quizId)
```

---

## 3. Affectations

- **Affectation étudiant ↔ cours** : table **enrollments**  
  - Création : `POST /api/enrollments` { studentId, courseId }  
  - Suppression : `DELETE /api/enrollments/:id`  
  - Liste : `GET /api/enrollments?studentId=…` ou `?courseId=…`

- **Affectation formateur ↔ cours** : champ **courses.teacherId**  
  - Mise à jour : `PUT /api/courses/:id` { ..., teacherId } ou `PUT /api/courses/:id/assign-teacher` { teacherId }

---

## 4. Contraintes importantes

- **enrollments** : UNIQUE(studentId, courseId) — un étudiant ne peut s’inscrire qu’une fois par cours.
- **student_points** : PK = studentId — un seul enregistrement de points par étudiant.
- **badges** : studentId obligatoire ; courseId optionnel (badges globaux ou par cours).
- **levels** : code UNIQUE (ex. A1, A2, B1, …).

---

## 5. Fichier d’initialisation

Les tables sont créées au démarrage du backend dans `xampp-mysql-dashboard.js` (fonction `createTables`).  
La base utilisée est **MySQL**, schéma **elearning**.
