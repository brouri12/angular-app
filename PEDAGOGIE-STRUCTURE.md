# Structure pédagogique – Plateforme e-learning d'anglais

## Vision globale

**Level → Chapter → Lesson (Video/PDF) → Quiz → Score → Points → Total Points → Badge**

---

## 1. Hiérarchie (tables)

| Table | Rôle |
|-------|------|
| **levels** | Niveaux A1, A2, B1, B2, C1, C2 |
| **chapters** | Chapitres d’un niveau (ex. A2 : Present Simple, Past Simple, Vocabulary Travel) |
| **lessons** | Cours d’un chapitre : **VIDEO** ou **PDF** (url, durée) |
| **quizzes** | Un quiz par chapitre (seuil de réussite en %) |
| **quiz_questions** | Questions d’un quiz (texte, type, points, bonne réponse) |
| **quiz_attempts** | Tentative d’un étudiant (score %, points obtenus, date) |
| **student_points** | Total de points cumulés par étudiant |

---

## 2. Parcours étudiant

1. Choisir un **niveau** (ex. A2)
2. Suivre les **chapitres** du niveau
3. Consulter les **cours** (vidéo / PDF) de chaque chapitre
4. Passer le **quiz** du chapitre
5. Obtenir un **score** (0–100 %)
6. Le score est converti en **points** (voir ci‑dessous)
7. Les points s’**additionnent** au total de l’étudiant
8. Quand le **total** atteint un seuil → **badge** attribué

---

## 3. Conversion score → points (par quiz)

| Score | Points |
|-------|--------|
| 0–49 % | 0 |
| 50–69 % | 10 |
| 70–89 % | 20 |
| 90–100 % | 30 |

---

## 4. Seuils de points → badges

| Total points | Badge |
|--------------|--------|
| 100 | Bronze |
| 200 | Silver |
| 300 | Gold |
| 500 | Master (Platinum) |

---

## 5. API principales

- **GET** `/api/pedagogy/tree` — Arbre complet : niveaux → chapitres → leçons + quiz (pour l’étudiant)
- **GET** `/api/levels`, **POST** `/api/levels`, **PUT** `/api/levels/:id`, **DELETE** `/api/levels/:id`
- **GET** `/api/levels/:levelId/chapters`, **POST** `/api/levels/:levelId/chapters`, **PUT/DELETE** `/api/chapters/:id`
- **GET** `/api/chapters/:chapterId/lessons`, **POST** `/api/chapters/:chapterId/lessons`, **PUT/DELETE** `/api/lessons/:id`
- **GET** `/api/chapters/:chapterId/quiz`, **POST** `/api/chapters/:chapterId/quizzes`, **PUT/DELETE** `/api/quizzes/:id`
- **GET** `/api/quizzes/:quizId/questions`, **POST** `/api/quizzes/:quizId/questions`, **PUT/DELETE** `/api/quiz-questions/:id`
- **POST** `/api/quiz-attempts` — Body : `{ studentId, quizId, answers: [{ questionId, answerText }] }`  
  → Réponse : `scorePercent`, `pointsEarned`, `totalPoints`, `newBadges`, `passed`
- **GET** `/api/students/:studentId/points` — Total de points de l’étudiant

---

## 6. Schéma relationnel (résumé)

```
levels (id, code, name, sortOrder)
  └── chapters (id, levelId, title, sortOrder)
        ├── lessons (id, chapterId, title, type VIDEO|PDF, url, durationMinutes, sortOrder)
        └── quizzes (id, chapterId, title, passingScorePercent)
              └── quiz_questions (id, quizId, questionText, questionType, points, correctAnswer, orderNumber)

students (id, ...)
  ├── quiz_attempts (id, studentId, quizId, scorePercent, pointsEarned, completedAt)
  └── student_points (studentId PK, totalPoints, updatedAt)

badges (studentId, badgeName, badgeLevel, ...) — attribués quand totalPoints atteint 100/200/300/500
```

Les interfaces étudiant et enseignant (front) pour exploiter ce parcours et cette logique seront branchées sur ces API.
