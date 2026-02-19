/**
 * Configuration de l'API backend pour l'intégration Front Office / Back Office
 * Utiliser cette base URL dans vos apps (front-office, back-office).
 */
module.exports = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:8081',
  endpoints: {
    students: '/api/students',
    courses: '/api/courses',
    enrollments: '/api/enrollments',
    questions: '/api/questions',
    badges: '/api/badges',
    databaseInfo: '/api/database/info'
  }
};
