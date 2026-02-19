/**
 * Serveur de test API sur le port 8081 - inclut /api/enrollments
 * À lancer pour tester Postman sans MySQL : node server-api-8081.js
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());

// Données en mémoire pour les tests
const enrollments = [
  { id: 1, studentId: 1, courseId: 1, status: 'ACTIVE', completionPercentage: 0, enrollmentDate: new Date().toISOString() }
];

app.get('/api/enrollments', (req, res) => {
  res.json(enrollments);
});

app.post('/api/enrollments', (req, res) => {
  const { studentId, courseId, status, completionPercentage } = req.body || {};
  if (studentId == null || courseId == null) {
    res.status(400).json({ error: 'studentId et courseId sont requis' });
    return;
  }
  const newEnrollment = {
    id: enrollments.length + 1,
    studentId: Number(studentId),
    courseId: Number(courseId),
    status: status || 'ACTIVE',
    completionPercentage: completionPercentage ?? 0,
    enrollmentDate: new Date().toISOString()
  };
  enrollments.push(newEnrollment);
  res.status(201).json(newEnrollment);
});

app.get('/api/students', (req, res) => res.json([]));
app.get('/api/courses', (req, res) => res.json([]));
app.get('/api/database/info', (req, res) => {
  res.json({ server: 'server-api-8081.js', enrollments: enrollments.length });
});

// Pour vérifier quel serveur répond
app.get('/api/qui', (req, res) => {
  res.json({ server: 'server-api-8081.js', enrollments: 'OK' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  API de test sur http://localhost:' + PORT);
  console.log('  GET  /api/enrollments  -> liste');
  console.log('  POST /api/enrollments   -> créer');
  console.log('  GET  /api/qui            -> vérifier ce serveur');
  console.log('========================================');
  console.log('');
});
