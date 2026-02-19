const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoints
app.get('/api/courses/test', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Formation Service',
        port: '8081',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/questions/test', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Quiz Badge Service',
        port: '8081',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/enrollments', (req, res) => {
    res.json([
        { id: 1, studentId: 1, courseId: 1, status: 'ACTIVE', completionPercentage: 0, enrollmentDate: new Date().toISOString() }
    ]);
});

app.post('/api/enrollments', (req, res) => {
    const { studentId, courseId, status, completionPercentage } = req.body || {};
    res.status(201).json({
        id: 1,
        studentId: studentId ?? 1,
        courseId: courseId ?? 1,
        status: status || 'ACTIVE',
        completionPercentage: completionPercentage ?? 0,
        enrollmentDate: new Date().toISOString()
    });
});

app.get('/actuator/health', (req, res) => {
    res.json({ status: 'UP' });
});

app.post('/api/courses', (req, res) => {
    console.log('Received course:', req.body);
    res.status(201).json({
        id: 1,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
});

app.post('/api/questions', (req, res) => {
    console.log('Received question:', req.body);
    res.status(201).json({
        id: 1,
        ...req.body,
        createdAt: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log(`📚 Courses test: http://localhost:${PORT}/api/courses/test`);
    console.log(`❓ Questions test: http://localhost:${PORT}/api/questions/test`);
    console.log(`🏥 Health check: http://localhost:${PORT}/actuator/health`);
});
