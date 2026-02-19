const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8081;

// Database setup
const db = new sqlite3.Database('./elearning.db');

// Create tables
db.serialize(() => {
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
app.use(express.static('public'));

// Web Interface
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>E-Learning Database Viewer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { flex: 1; background: #007bff; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        tr:hover { background: #f5f5f5; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .empty { text-align: center; color: #666; padding: 40px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ E-Learning Database Viewer</h1>
        
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-number" id="coursesCount">-</div>
                <div>Courses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="questionsCount">-</div>
                <div>Questions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="badgesCount">-</div>
                <div>Badges</div>
            </div>
        </div>

        <div class="section">
            <h2>📚 Courses</h2>
            <button class="btn" onclick="loadCourses()">Refresh</button>
            <button class="btn" onclick="showAddCourse()">Add Course</button>
            <div id="coursesTable"></div>
        </div>

        <div class="section">
            <h2>❓ Questions</h2>
            <button class="btn" onclick="loadQuestions()">Refresh</button>
            <button class="btn" onclick="showAddQuestion()">Add Question</button>
            <div id="questionsTable"></div>
        </div>

        <div class="section">
            <h2>🏆 Badges</h2>
            <button class="btn" onclick="loadBadges()">Refresh</button>
            <button class="btn" onclick="showAddBadge()">Add Badge</button>
            <div id="badgesTable"></div>
        </div>
    </div>

    <script>
        async function loadStats() {
            try {
                const response = await fetch('/api/database/info');
                const data = await response.json();
                
                data.tables.forEach(table => {
                    const countElement = document.getElementById(table.table_name + 'Count');
                    if (countElement) {
                        countElement.textContent = table.count;
                    }
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadCourses() {
            try {
                const response = await fetch('/api/courses');
                const courses = await response.json();
                
                const tableDiv = document.getElementById('coursesTable');
                if (courses.length === 0) {
                    tableDiv.innerHTML = '<div class="empty">No courses found</div>';
                    return;
                }

                let html = '<table><tr><th>ID</th><th>Code</th><th>Title</th><th>Teacher</th><th>Duration</th><th>Price</th><th>Level</th><th>Status</th><th>Actions</th></tr>';
                courses.forEach(course => {
                    html += \`<tr>
                        <td>\${course.id}</td>
                        <td>\${course.courseCode}</td>
                        <td>\${course.title}</td>
                        <td>\${course.teacherId}</td>
                        <td>\${course.durationHours}h</td>
                        <td>\${course.price}€</td>
                        <td>\${course.level}</td>
                        <td>\${course.status}</td>
                        <td><button class="btn btn-danger" onclick="deleteCourse(\${course.id})">Delete</button></td>
                    </tr>\`;
                });
                html += '</table>';
                tableDiv.innerHTML = html;
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        }

        async function loadQuestions() {
            try {
                const response = await fetch('/api/questions');
                const questions = await response.json();
                
                const tableDiv = document.getElementById('questionsTable');
                if (questions.length === 0) {
                    tableDiv.innerHTML = '<div class="empty">No questions found</div>';
                    return;
                }

                let html = '<table><tr><th>ID</th><th>Course ID</th><th>Question</th><th>Type</th><th>Points</th><th>Difficulty</th><th>Actions</th></tr>';
                questions.forEach(question => {
                    html += \`<tr>
                        <td>\${question.id}</td>
                        <td>\${question.courseId}</td>
                        <td>\${question.questionText}</td>
                        <td>\${question.questionType}</td>
                        <td>\${question.points}</td>
                        <td>\${question.difficultyLevel}</td>
                        <td><button class="btn btn-danger" onclick="deleteQuestion(\${question.id})">Delete</button></td>
                    </tr>\`;
                });
                html += '</table>';
                tableDiv.innerHTML = html;
            } catch (error) {
                console.error('Error loading questions:', error);
            }
        }

        async function loadBadges() {
            try {
                const response = await fetch('/api/badges');
                const badges = await response.json();
                
                const tableDiv = document.getElementById('badgesTable');
                if (badges.length === 0) {
                    tableDiv.innerHTML = '<div class="empty">No badges found</div>';
                    return;
                }

                let html = '<table><tr><th>ID</th><th>Student ID</th><th>Name</th><th>Type</th><th>Level</th><th>Course ID</th><th>Actions</th></tr>';
                badges.forEach(badge => {
                    html += \`<tr>
                        <td>\${badge.id}</td>
                        <td>\${badge.studentId}</td>
                        <td>\${badge.badgeName}</td>
                        <td>\${badge.badgeType}</td>
                        <td>\${badge.badgeLevel}</td>
                        <td>\${badge.courseId}</td>
                        <td><button class="btn btn-danger" onclick="deleteBadge(\${badge.id})">Delete</button></td>
                    </tr>\`;
                });
                html += '</table>';
                tableDiv.innerHTML = html;
            } catch (error) {
                console.error('Error loading badges:', error);
            }
        }

        async function deleteCourse(id) {
            if (confirm('Delete this course?')) {
                await fetch(\`/api/courses/\${id}\`, { method: 'DELETE' });
                loadCourses();
                loadStats();
            }
        }

        async function deleteQuestion(id) {
            if (confirm('Delete this question?')) {
                await fetch(\`/api/questions/\${id}\`, { method: 'DELETE' });
                loadQuestions();
                loadStats();
            }
        }

        async function deleteBadge(id) {
            if (confirm('Delete this badge?')) {
                await fetch(\`/api/badges/\${id}\`, { method: 'DELETE' });
                loadBadges();
                loadStats();
            }
        }

        function showAddCourse() {
            const code = prompt('Course Code:');
            const title = prompt('Title:');
            if (code && title) {
                fetch('/api/courses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        courseCode: code,
                        title: title,
                        description: 'Course description',
                        teacherId: 1,
                        durationHours: 40,
                        price: 299.99,
                        maxStudents: 30,
                        level: 'BEGINNER',
                        status: 'ACTIVE'
                    })
                }).then(() => {
                    loadCourses();
                    loadStats();
                });
            }
        }

        function showAddQuestion() {
            const courseId = prompt('Course ID:');
            const question = prompt('Question:');
            if (courseId && question) {
                fetch('/api/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        courseId: parseInt(courseId),
                        questionText: question,
                        questionType: 'MULTIPLE_CHOICE',
                        points: 10,
                        difficultyLevel: 'EASY',
                        correctAnswer: 'Answer',
                        explanation: 'Explanation',
                        orderNumber: 1,
                        isActive: true
                    })
                }).then(() => {
                    loadQuestions();
                    loadStats();
                });
            }
        }

        function showAddBadge() {
            const studentId = prompt('Student ID:');
            const name = prompt('Badge Name:');
            if (studentId && name) {
                fetch('/api/badges', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: parseInt(studentId),
                        badgeName: name,
                        badgeType: 'COURSE_COMPLETION',
                        description: 'Badge description',
                        courseId: 1,
                        criteriaMet: 'Criteria',
                        badgeLevel: 'BRONZE',
                        earnedDate: new Date().toISOString().split('T')[0]
                    })
                }).then(() => {
                    loadBadges();
                    loadStats();
                });
            }
        }

        // Load initial data
        loadStats();
        loadCourses();
        loadQuestions();
        loadBadges();
    </script>
</body>
</html>
    `);
});

// API Endpoints (same as before)
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

app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Course deleted', changes: this.changes });
    });
});

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

app.delete('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Question deleted', changes: this.changes });
    });
});

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

app.delete('/api/badges/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM badges WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Badge deleted', changes: this.changes });
    });
});

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
    console.log(`🚀 E-Learning API Server with Web Interface running on http://localhost:${PORT}`);
    console.log(`🌐 Web Interface: http://localhost:${PORT}/`);
    console.log(`📚 API Courses: http://localhost:${PORT}/api/courses`);
    console.log(`❓ API Questions: http://localhost:${PORT}/api/questions`);
    console.log(`🏆 API Badges: http://localhost:${PORT}/api/badges`);
    console.log(`🗄️ Database Info: http://localhost:${PORT}/api/database/info`);
    console.log(`🏥 Health: http://localhost:${PORT}/actuator/health`);
});
