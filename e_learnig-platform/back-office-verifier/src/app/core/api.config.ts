/**
 * URL du backend API.
 * On utilise l'origine courante (même domaine/port que le back-office Node),
 * donc on laisse vide pour appeler `/api/...` en relatif.
 */
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  students: '/api/students',
  courses: '/api/courses',
  enrollments: '/api/enrollments',
  questions: '/api/questions',
  badges: '/api/badges',
  databaseInfo: '/api/database/info',
} as const;
