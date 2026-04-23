/**
 * Couche « services » quiz — documentation de l’architecture.
 * La logique HTTP et MySQL reste dans `xampp-mysql-dashboard.js` ;
 * les calculs de score fiables côté serveur sont dans `quizCore.js`.
 *
 * QuizService          → CRUD quiz / questions (routes /api/quizzes)
 * QuizAttemptService   → tentatives complétées (POST /api/quiz-attempts, historique)
 * QuizProgressService  → sessions IN_PROGRESS (POST/PUT /api/quiz-sessions)
 * QuizScoringService   → scoreQuizAttempt (quizCore) + persistance réponses
 * QuizHistoryService   → GET /api/quiz-attempts, historique étudiant
 * QuizAnalyticsService → GET /api/quizzes/:id/analytics
 */

const quizCore = require('./quizCore');

module.exports = {
    ...quizCore,
    architectureNote: 'Voir commentaires en tête de fichier.'
};
