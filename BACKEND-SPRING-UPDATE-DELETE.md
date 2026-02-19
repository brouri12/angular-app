# Vérification backend Spring Boot – Update & Delete

## Résumé

Les services Spring Boot **formation-service** et **quiz-badge-service** exposent bien des endpoints **PUT (update)** et **DELETE** avec gestion d’erreurs (404, 400, etc.). Un endpoint **DELETE** manquant a été ajouté dans **BadgeController**.

---

## 1. Formation Service (Cours & Enrollments)

### CourseController (`/api/courses`)

| Méthode | Endpoint        | Service              | Statut |
|---------|-----------------|----------------------|--------|
| **PUT** | `PUT /api/courses/{id}`  | `CourseService.updateCourse`  | OK |
| **DELETE** | `DELETE /api/courses/{id}` | `CourseService.deleteCourse` | OK |

- **Update** : vérification d’existence du cours, unicité du `courseCode`, puis `save`.
- **Delete** : vérification d’existence puis `deleteById`.
- **404** : `ResourceNotFoundException` → géré par `GlobalExceptionHandler` (réponse JSON).

### EnrollmentController (`/api/enrollments`)

| Méthode | Endpoint        | Service                | Statut |
|---------|-----------------|------------------------|--------|
| **PUT** | `PUT /api/enrollments/{id}`  | `EnrollmentService.updateEnrollment`  | OK |
| **DELETE** | `DELETE /api/enrollments/{id}` | `EnrollmentService.deleteEnrollment` | OK |

- Même principe : existence, mise à jour / suppression, 404 géré en JSON.

---

## 2. Quiz-Badge Service (Questions & Badges)

### QuestionController (`/api/questions`)

| Méthode | Endpoint        | Service                 | Statut |
|---------|-----------------|-------------------------|--------|
| **PUT** | `PUT /api/questions/{id}`  | `QuestionService.updateQuestion`  | OK |
| **DELETE** | `DELETE /api/questions/{id}` | `QuestionService.deleteQuestion` | OK |

### BadgeController (`/api/badges`)

| Méthode | Endpoint        | Service              | Statut |
|---------|-----------------|----------------------|--------|
| **DELETE** | `DELETE /api/badges/{id}` | `BadgeService.deleteBadge` | Ajouté (manquait) |

- **Update** pour les badges : non implémenté (pas de `updateBadge` dans le service). Seul **DELETE** a été ajouté au controller.

---

## 3. Passage par la Gateway (port 8080)

Dans `api-gateway` (application.yml) :

- Les chemins **`/api/students`**, **`/api/courses`**, **`/api/enrollments`**, **`/api/questions`**, **`/api/badges`** sont routés vers l’**API Node (port 8081)**.
- Le **formation-service** Spring est exposé sous **`/api/formation/**`** (et non `/api/courses`).
- Le **quiz-badge-service** est exposé sous **`/api/quiz/**`** et **`/api/badge/**`** (avec StripPrefix=1).

Donc :

- Le **front/back office** qui appellent `http://localhost:8081/api/courses` (ou via la gateway sur 8080) utilisent en pratique l’**API Node** pour courses/students/enrollments/questions/badges.
- Les **update/delete** Spring (formation-service, quiz-badge-service) sont utilisés quand on appelle les services via leurs propres URLs (ou via la gateway sur les chemins `/api/formation/**`, `/api/quiz/**`, `/api/badge/**`).

---

## 4. Fichiers modifiés

- **quiz-badge-service** : `BadgeController.java` – ajout de `@DeleteMapping("/{id}")` et appel à `badgeService.deleteBadge(id)`.

---

## 5. Récap technique

- **formation-service** : `CourseController`, `EnrollmentController` → PUT + DELETE OK, 404 gérés en JSON.
- **quiz-badge-service** : `QuestionController` → PUT + DELETE OK ; `BadgeController` → DELETE ajouté, pas d’update.
- **formation-service** : `GlobalExceptionHandler` → `ResourceNotFoundException` → 404 JSON.
- **quiz-badge-service** : idem, `GlobalExceptionHandler` présent.
