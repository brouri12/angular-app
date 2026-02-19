const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8081;

// Database setup
const db = new sqlite3.Database('./elearning.db');

// Create tables
db.serialize(() => {
    // Courses table
    db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseCode TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        teacherId INTEGER,
        durationHours INTEGER,
        price REAL,
        maxStudents INTEGER,
        level TEXT,
        status TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Enrollments table
    db.run(`CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER NOT NULL,
        enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'ACTIVE',
        completionPercentage REAL DEFAULT 0,
        FOREIGN KEY (courseId) REFERENCES courses (id),
        UNIQUE(studentId, courseId)
    )`);

    // Questions table
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER,
        questionText TEXT NOT NULL,
        questionType TEXT,
        points INTEGER,
        difficultyLevel TEXT,
        correctAnswer TEXT,
        explanation TEXT,
        orderNumber INTEGER,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses (id)
    )`);

    // Badges table
    db.run(`CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        badgeName TEXT NOT NULL,
        badgeType TEXT NOT NULL,
        description TEXT,
        iconUrl TEXT,
        courseId INTEGER,
        criteriaMet TEXT,
        badgeLevel TEXT,
        earnedDate DATE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses (id)
    )`);

    console.log('🗄️ Database tables created/verified');
});

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoints
app.get('/api/courses/test', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Formation Service',
        port: '8081',
        timestamp: new Date().toISOString(),
        database: 'SQLite - elearning.db'
    });
});

app.get('/api/questions/test', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Quiz Badge Service',
        port: '8081',
        timestamp: new Date().toISOString(),
        database: 'SQLite - elearning.db'
    });
});

app.get('/actuator/health', (req, res) => {
    res.json({ 
        status: 'UP',
        database: 'Connected to SQLite'
    });
});

// === COURSES ENDPOINTS ===
app.get('/api/courses', (req, res) => {
    db.all('SELECT * FROM courses ORDER BY createdAt DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/courses', (req, res) => {
    const { courseCode, title, description, teacherId, durationHours, price, maxStudents, level, status } = req.body;
    
    db.run(
        `INSERT INTO courses (courseCode, title, description, teacherId, durationHours, price, maxStudents, level, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [courseCode, title, description, teacherId, durationHours, price, maxStudents, level, status],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Return the created course
            db.get('SELECT * FROM courses WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json(row);
            });
        }
    );
});

app.get('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json(row);
    });
});

// === ENROLLMENTS ENDPOINTS ===
app.get('/api/enrollments', (req, res) => {
    db.all(`
        SELECT e.*, c.title as courseTitle, c.courseCode
        FROM enrollments e
        LEFT JOIN courses c ON e.courseId = c.id
        ORDER BY e.enrollmentDate DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/enrollments', (req, res) => {
    const { studentId, courseId, status, completionPercentage } = req.body;
    if (studentId == null || courseId == null) {
        res.status(400).json({ error: 'studentId et courseId sont requis' });
        return;
    }
    const st = status || 'ACTIVE';
    const pct = completionPercentage != null ? completionPercentage : 0;
    db.run(
        `INSERT INTO enrollments (studentId, courseId, status, completionPercentage) VALUES (?, ?, ?, ?)`,
        [studentId, courseId, st, pct],
        function(err) {
            if (err) {
                if (err.message && err.message.includes('UNIQUE')) {
                    res.status(409).json({ error: 'Cet étudiant est déjà inscrit à ce cours', code: 'DUPLICATE_ENROLLMENT' });
                    return;
                }
                res.status(500).json({ error: err.message });
                return;
            }
            db.get('SELECT * FROM enrollments WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json(row);
            });
        }
    );
});

// === QUESTIONS ENDPOINTS ===
app.get('/api/questions', (req, res) => {
    db.all('SELECT * FROM questions ORDER BY createdAt DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/questions', (req, res) => {
    const { courseId, questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive } = req.body;
    
    db.run(
        `INSERT INTO questions (courseId, questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [courseId, questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            db.get('SELECT * FROM questions WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json(row);
            });
        }
    );
});

// === BADGES ENDPOINTS ===
app.get('/api/badges', (req, res) => {
    db.all('SELECT * FROM badges ORDER BY earnedDate DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/badges', (req, res) => {
    const { studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate } = req.body;
    
    db.run(
        `INSERT INTO badges (studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            db.get('SELECT * FROM badges WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json(row);
            });
        }
    );
});

// === DATABASE INFO ENDPOINT ===
app.get('/api/database/info', (req, res) => {
    db.all(
        `SELECT 'courses' as table_name, COUNT(*) as count FROM courses
         UNION ALL
         SELECT 'enrollments' as table_name, COUNT(*) as count FROM enrollments
         UNION ALL
         SELECT 'questions' as table_name, COUNT(*) as count FROM questions
         UNION ALL
         SELECT 'badges' as table_name, COUNT(*) as count FROM badges`,
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                database: 'SQLite',
                file: './elearning.db',
                tables: rows,
                totalRecords: rows.reduce((sum, row) => sum + row.count, 0)
            });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 E-Learning API Server with Database running on http://localhost:${PORT}`);
    console.log(`📚 Courses: http://localhost:${PORT}/api/courses`);
    console.log(`❓ Questions: http://localhost:${PORT}/api/questions`);
    console.log(`🏆 Badges: http://localhost:${PORT}/api/badges`);
    console.log(`🗄️ Database Info: http://localhost:${PORT}/api/database/info`);
    console.log(`🏥 Health: http://localhost:${PORT}/actuator/health`);
});
