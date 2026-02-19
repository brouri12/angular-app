/**
 * URL du backend API (projet pi - Node/Express sur le port 8081)
 */
export const API_BASE_URL = 'http://localhost:8081';

export const API_ENDPOINTS = {
  students: '/api/students',
  courses: '/api/courses',
  enrollments: '/api/enrollments',
  questions: '/api/questions',
  badges: '/api/badges',
  databaseInfo: '/api/database/info',
} as const;
