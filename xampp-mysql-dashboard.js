const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, 'uploads', 'course-materials');
const UPLOAD_LESSONS_DIR = path.join(__dirname, 'uploads', 'lessons');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_LESSONS_DIR)) fs.mkdirSync(UPLOAD_LESSONS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = (path.extname(file.originalname) || '').toLowerCase() || '.bin';
        const safe = (req.params.courseId || '0') + '-' + Date.now() + ext;
        cb(null, safe);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const type = (file.mimetype || '').toLowerCase();
        const ok = type === 'application/pdf' || type.startsWith('video/');
        if (ok) cb(null, true); else cb(new Error('Fichier non autorisé. Utilisez un PDF ou une vidéo.'), false);
    }
});

const lessonStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_LESSONS_DIR),
    filename: (req, file, cb) => {
        const ext = (path.extname(file.originalname) || '').toLowerCase() || '.bin';
        const safe = (req.params.chapterId || '0') + '-' + Date.now() + ext;
        cb(null, safe);
    }
});
const lessonUpload = multer({
    storage: lessonStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const type = (file.mimetype || '').toLowerCase();
        const ok = type === 'application/pdf' || type.startsWith('video/');
        if (ok) cb(null, true); else cb(new Error('Fichier non autorisé. Utilisez un PDF ou une vidéo.'), false);
    }
});

const app = express();
// Port 8083 pour éviter conflit avec un autre programme sur 8081 (ouvrir http://localhost:8083/back-office/)
const PORT = process.env.PORT || 8083;

// MySQL configuration for XAMPP
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // XAMPP default MySQL password is empty
    database: 'elearning',
    charset: 'utf8mb4'
};

let db;

// Initialize database connection and tables
async function initializeDatabase() {
    try {
        // Connect to MySQL without database first
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        console.log('🔗 Connected to MySQL (XAMPP)');
        
        // Create database if not exists
        await connection.query('CREATE DATABASE IF NOT EXISTS elearning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('📊 Database "elearning" created/verified');
        
        // Close connection and reconnect with database
        await connection.end();
        
        // Connect to the elearning database
        db = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        console.log('🔗 Connected to elearning database');
        
        // Create tables
        await createTables(db);
        
        // Insert sample data
        await insertSampleData(db);
        
        console.log('🚀 Database connection pool ready');
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        process.exit(1);
    }
}

async function createTables(db) {
    const tables = [
        `CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(100) NOT NULL,
            lastName VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE,
            city VARCHAR(100),
            country VARCHAR(100),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_location (city, country)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS teachers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(100) NOT NULL,
            lastName VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE,
            city VARCHAR(100),
            country VARCHAR(100),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            courseCode VARCHAR(20) UNIQUE NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            teacherId INT,
            teacherName VARCHAR(150),
            teacherLocation VARCHAR(200),
            durationHours INT,
            price DECIMAL(10,2),
            maxStudents INT,
            level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
            status ENUM('ACTIVE', 'INACTIVE', 'COMPLETED') DEFAULT 'ACTIVE',
            city VARCHAR(100),
            country VARCHAR(100),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_code (courseCode),
            INDEX idx_teacher (teacherId),
            INDEX idx_location (city, country),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS enrollments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            studentId INT NOT NULL,
            courseId INT NOT NULL,
            enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('ACTIVE', 'COMPLETED', 'DROPPED') DEFAULT 'ACTIVE',
            completionPercentage DECIMAL(5,2) DEFAULT 0.00,
            finalGrade DECIMAL(5,2),
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
            UNIQUE KEY unique_enrollment (studentId, courseId),
            INDEX idx_student (studentId),
            INDEX idx_course (courseId),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            courseId INT NOT NULL,
            questionText TEXT NOT NULL,
            questionType ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'),
            points INT DEFAULT 10,
            difficultyLevel ENUM('EASY', 'MEDIUM', 'HARD'),
            correctAnswer TEXT,
            explanation TEXT,
            orderNumber INT,
            isActive BOOLEAN DEFAULT TRUE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
            INDEX idx_course (courseId),
            INDEX idx_difficulty (difficultyLevel),
            INDEX idx_active (isActive)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS badges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            studentId INT NOT NULL,
            badgeName VARCHAR(150) NOT NULL,
            badgeType ENUM('COURSE_COMPLETION', 'QUIZ_MASTER', 'PERFECT_SCORE', 'SPEED_STAR', 'STREAK', 'EXPERT', 'FIRST_ATTEMPT', 'TOP_STUDENT'),
            description TEXT,
            iconUrl VARCHAR(500),
            courseId INT,
            criteriaMet TEXT,
            badgeLevel ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'),
            earnedDate DATE,
            city VARCHAR(100),
            country VARCHAR(100),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL,
            INDEX idx_student (studentId),
            INDEX idx_type (badgeType),
            INDEX idx_level (badgeLevel),
            INDEX idx_earned (earnedDate),
            INDEX idx_location (city, country)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS responses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            studentId INT NOT NULL,
            questionId INT NOT NULL,
            enrollmentId INT NULL,
            answerText TEXT,
            isCorrect BOOLEAN DEFAULT NULL,
            pointsEarned DECIMAL(5,2) DEFAULT NULL,
            submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (enrollmentId) REFERENCES enrollments(id) ON DELETE SET NULL,
            INDEX idx_student (studentId),
            INDEX idx_question (questionId),
            INDEX idx_enrollment (enrollmentId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS course_materials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            courseId INT NOT NULL,
            type ENUM('PDF', 'VIDEO') NOT NULL,
            title VARCHAR(200) NOT NULL,
            url VARCHAR(1000) NOT NULL,
            orderNumber INT DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
            INDEX idx_course (courseId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        /* Structure pédagogique: Level → Chapter → Lesson → Quiz */
        `CREATE TABLE IF NOT EXISTS levels (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(10) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            sortOrder INT DEFAULT 0,
            INDEX idx_sort (sortOrder)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS chapters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            levelId INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            sortOrder INT DEFAULT 0,
            FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE CASCADE,
            INDEX idx_level (levelId),
            INDEX idx_sort (sortOrder)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS lessons (
            id INT AUTO_INCREMENT PRIMARY KEY,
            chapterId INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            type ENUM('VIDEO', 'PDF') NOT NULL,
            url VARCHAR(1000) NOT NULL,
            durationMinutes INT DEFAULT 0,
            sortOrder INT DEFAULT 0,
            FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE,
            INDEX idx_chapter (chapterId),
            INDEX idx_sort (sortOrder)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS quizzes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            chapterId INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            passingScorePercent INT DEFAULT 50,
            FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE,
            INDEX idx_chapter (chapterId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS quiz_questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            quizId INT NOT NULL,
            questionText TEXT NOT NULL,
            questionType ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER') DEFAULT 'MULTIPLE_CHOICE',
            points INT DEFAULT 10,
            correctAnswer TEXT,
            orderNumber INT DEFAULT 0,
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
            INDEX idx_quiz (quizId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            studentId INT NOT NULL,
            quizId INT NOT NULL,
            scorePercent DECIMAL(5,2) NOT NULL,
            pointsEarned INT NOT NULL DEFAULT 0,
            completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
            INDEX idx_student (studentId),
            INDEX idx_quiz (quizId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS student_points (
            studentId INT PRIMARY KEY,
            totalPoints INT NOT NULL DEFAULT 0,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];
    
    for (const table of tables) {
        await db.query(table);
    }
    
    console.log('� Database tables created/verified');
}

async function insertSampleData(db) {
    try {
        // Insert sample teachers
        const teachers = [
            ['Martin', 'Jean', 'prof.martin@email.com', 'Paris', 'France'],
            ['Dubois', 'Marie', 'prof.dubois@email.com', 'Lyon', 'France'],
            ['Bernard', 'Pierre', 'dr.bernard@email.com', 'Marseille', 'France']
        ];
        for (const t of teachers) {
            await db.query(`INSERT IGNORE INTO teachers (firstName, lastName, email, city, country) VALUES (?, ?, ?, ?, ?)`, t);
        }
        // Insert sample courses with French locations (teacherId 1,2,3)
        const courses = [
            ['JAVA101', 'Java Programming', 'Learn Java fundamentals from scratch', 1, 'Prof. Martin', 'Paris, France', 40, 299.99, 30, 'BEGINNER', 'ACTIVE', 'Paris', 'France', 48.8566, 2.3522],
            ['WEB202', 'Web Development', 'HTML, CSS, JavaScript full stack', 2, 'Prof. Dubois', 'Lyon, France', 60, 399.99, 25, 'INTERMEDIATE', 'ACTIVE', 'Lyon', 'France', 45.7640, 4.8357],
            ['DATA303', 'Data Science', 'Python, Machine Learning, AI', 3, 'Dr. Bernard', 'Marseille, France', 80, 599.99, 20, 'ADVANCED', 'ACTIVE', 'Marseille', 'France', 43.2965, 5.3698],
            ['MOBILE404', 'Mobile Development', 'iOS and Android development', 1, 'Prof. Martin', 'Paris, France', 50, 449.99, 15, 'INTERMEDIATE', 'ACTIVE', 'Paris', 'France', 48.8566, 2.3522],
            ['CLOUD505', 'Cloud Computing', 'AWS, Azure, Google Cloud', 2, 'Prof. Dubois', 'Lyon, France', 70, 699.99, 18, 'ADVANCED', 'ACTIVE', 'Lyon', 'France', 45.7640, 4.8357]
        ];
        
        for (const course of courses) {
            await db.query(`
                INSERT IGNORE INTO courses 
                (courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, course);
        }
        
        // Insert sample students with French locations
        const students = [
            ['Jean', 'Dupont', 'jean.dupont@email.com', 'Paris', 'France', 48.8566, 2.3522],
            ['Marie', 'Curie', 'marie.curie@email.com', 'Lyon', 'France', 45.7640, 4.8357],
            ['Pierre', 'Martin', 'pierre.martin@email.com', 'Marseille', 'France', 43.2965, 5.3698],
            ['Sophie', 'Bernard', 'sophie.bernard@email.com', 'Toulouse', 'France', 43.6047, 1.4442],
            ['Lucas', 'Petit', 'lucas.petit@email.com', 'Nice', 'France', 43.7102, 7.2620],
            ['Emma', 'Robert', 'emma.robert@email.com', 'Nantes', 'France', 47.2184, -1.5536],
            ['Hugo', 'Leroy', 'hugo.leroy@email.com', 'Strasbourg', 'France', 48.5846, 7.7507],
            ['Léa', 'Moreau', 'lea.moreau@email.com', 'Bordeaux', 'France', 44.8378, -0.5792],
            ['Gabriel', 'Rousseau', 'gabriel.rousseau@email.com', 'Lille', 'France', 50.6292, 3.0573],
            ['Chloé', 'Fournier', 'chloe.fournier@email.com', 'Grenoble', 'France', 45.1885, 5.7245]
        ];
        
        for (const student of students) {
            await db.query(`
                INSERT IGNORE INTO students 
                (firstName, lastName, email, city, country, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, student);
        }
        
        // Insert sample enrollments
        const enrollments = [
            [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [6, 3], [7, 4], [8, 1], [9, 2], [10, 3]
        ];
        
        for (const enrollment of enrollments) {
            await db.query(`INSERT IGNORE INTO enrollments (studentId, courseId) VALUES (?, ?)`, enrollment);
        }
        
        // Insert sample questions
        const questions = [
            [1, 'What is Java?', 'MULTIPLE_CHOICE', 10, 'EASY', 'Programming language', 'Java is a high-level programming language', 1, true],
            [1, 'What is JVM?', 'MULTIPLE_CHOICE', 15, 'MEDIUM', 'Java Virtual Machine', 'JVM executes Java bytecode', 2, true],
            [2, 'What is HTML?', 'MULTIPLE_CHOICE', 5, 'EASY', 'Markup language', 'HTML structures web content', 1, true],
            [3, 'What is Machine Learning?', 'MULTIPLE_CHOICE', 20, 'HARD', 'AI subset', 'ML enables computers to learn from data', 1, true]
        ];
        
        for (const question of questions) {
            await db.query(`
                INSERT IGNORE INTO questions 
                (courseId, questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, question);
        }
        
        // Insert pedagogy: levels A1–C2
        const levelRows = [
            ['A1', 'Débutant', 1], ['A2', 'Élémentaire', 2], ['B1', 'Intermédiaire', 3],
            ['B2', 'Intermédiaire+', 4], ['C1', 'Avancé', 5], ['C2', 'Maîtrise', 6]
        ];
        for (const row of levelRows) {
            await db.query('INSERT IGNORE INTO levels (code, name, sortOrder) VALUES (?, ?, ?)', row);
        }
        // Chapters for A1 and A2
        const chapterRows = [
            [1, 'Present Simple', 1], [1, 'Vocabulary: Greetings', 2],
            [2, 'Past Simple', 1], [2, 'Vocabulary: Travel', 2]
        ];
        for (const row of chapterRows) {
            await db.query('INSERT IGNORE INTO chapters (levelId, title, sortOrder) VALUES (?, ?, ?)', row);
        }
        // Lessons (video/pdf) for first chapter
        await db.query(`INSERT IGNORE INTO lessons (chapterId, title, type, url, durationMinutes, sortOrder) VALUES
            (1, 'Present Simple - Introduction', 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 10, 1),
            (1, 'Exercises PDF', 'PDF', '/uploads/course-materials/sample.pdf', 5, 2)`);
        // Quiz for chapter 1
        await db.query("INSERT IGNORE INTO quizzes (chapterId, title, passingScorePercent) VALUES (1, 'Quiz Chapter 1', 50)");
        const [[qRes]] = await db.query('SELECT id FROM quizzes WHERE chapterId = 1 LIMIT 1');
        if (qRes) {
            await db.query(`INSERT IGNORE INTO quiz_questions (quizId, questionText, questionType, points, correctAnswer, orderNumber) VALUES
                (?, 'What is the correct form for he/she/it in Present Simple?', 'MULTIPLE_CHOICE', 10, 'adds -s', 1),
                (?, 'Choose the correct sentence.', 'MULTIPLE_CHOICE', 10, 'She works every day.', 2)`, [qRes.id, qRes.id]);
        }

        // Insert sample badges
        const badges = [
            [1, 'First Steps', 'COURSE_COMPLETION', 'Completed first course', '🎓', 1, 'Completed JAVA101', 'BRONZE', '2025-02-15'],
            [2, 'Quick Learner', 'COURSE_COMPLETION', 'Completed course in record time', '⚡', 2, 'Completed WEB202 quickly', 'SILVER', '2025-02-14'],
            [3, 'Data Expert', 'COURSE_COMPLETION', 'Mastered data science fundamentals', '📊', 3, 'Completed DATA303', 'GOLD', '2025-02-13'],
            [4, 'Quiz Master', 'PERFECT_SCORE', 'Perfect score on all quizzes', '🏆', null, '100% on all questions', 'PLATINUM', '2025-02-12'],
            [5, 'Mobile Developer', 'COURSE_COMPLETION', 'Completed mobile development course', '📱', 4, 'Completed MOBILE404', 'SILVER', '2025-02-11']
        ];
        
        for (const badge of badges) {
            await db.query(`
                INSERT IGNORE INTO badges 
                (studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, badge);
        }
        
        console.log('📊 Sample data inserted successfully');
        
    } catch (error) {
        console.error('⚠️ Error inserting sample data:', error.message);
    }
}

// Middleware
app.use(cors());
app.use(express.json());

const API_PREFIX = '/api';
function apiLog(req, res, next) {
    console.log('[API]', req.method, req.originalUrl);
    next();
}

app.get(API_PREFIX + '/ping', apiLog, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ ok: true, server: 'xampp-mysql-dashboard', message: 'API OK' });
});

// Upload de fichiers (PDF/vidéo) — déclaré en premier pour éviter 404
app.post('/api/courses/:courseId/materials/upload', apiLog, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Aucun fichier envoyé. Choisissez un PDF ou une vidéo.' });
            return;
        }
        const courseId = req.params.courseId;
        const type = (req.body.type || '').toUpperCase() === 'VIDEO' ? 'VIDEO' : 'PDF';
        const title = (req.body.title || req.file.originalname || 'Document').trim().slice(0, 200);
        const fileUrl = '/uploads/course-materials/' + req.file.filename;
        const [result] = await db.execute(
            'INSERT INTO course_materials (courseId, type, title, url, orderNumber) VALUES (?, ?, ?, ?, ?)',
            [courseId, type, title, fileUrl, 0]
        );
        const [rows] = await db.execute('SELECT * FROM course_materials WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload leçon (PDF/vidéo) — déclaré tôt pour éviter 404
app.post('/api/chapters/:chapterId/lessons/upload', apiLog, lessonUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Aucun fichier envoyé. Choisissez un PDF ou une vidéo.' });
            return;
        }
        const chapterId = req.params.chapterId;
        const title = (req.body.title || req.file.originalname || 'Leçon').trim().slice(0, 200);
        const type = (req.body.type || '').toUpperCase() === 'PDF' ? 'PDF' : 'VIDEO';
        const durationMinutes = parseInt(req.body.durationMinutes, 10) || 0;
        const fileUrl = '/uploads/lessons/' + req.file.filename;
        const [result] = await db.execute(
            'INSERT INTO lessons (chapterId, title, type, url, durationMinutes, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
            [chapterId, title, type, fileUrl, durationMinutes, 0]
        );
        const [rows] = await db.execute('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Arbre pédagogique (étudiant) — déclaré tôt pour éviter 404
app.get('/api/pedagogy/tree', apiLog, async (req, res) => {
    try {
        const [levels] = await db.execute('SELECT * FROM levels ORDER BY sortOrder ASC');
        for (const level of levels) {
            const [chapters] = await db.execute('SELECT * FROM chapters WHERE levelId = ? ORDER BY sortOrder ASC', [level.id]);
            level.chapters = chapters;
            for (const ch of chapters) {
                const [lessons] = await db.execute('SELECT * FROM lessons WHERE chapterId = ? ORDER BY sortOrder ASC', [ch.id]);
                const [quizRows] = await db.execute('SELECT * FROM quizzes WHERE chapterId = ? LIMIT 1', [ch.id]);
                ch.lessons = lessons;
                ch.quiz = quizRows[0] || null;
            }
        }
        res.json(levels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/students', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM students ORDER BY registrationDate DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/students/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Étudiant non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/students/:id', apiLog, async (req, res) => {
    try {
        const { firstName, lastName, email, city, country, latitude, longitude } = req.body;
        await db.execute(
            'UPDATE students SET firstName=?, lastName=?, email=?, city=?, country=?, latitude=?, longitude=? WHERE id=?',
            [firstName, lastName, email, city, country, latitude, longitude, req.params.id]
        );
        const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Étudiant non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/students/:id', apiLog, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Étudiant non trouvé' });
        res.json({ message: 'Étudiant supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/students', apiLog, async (req, res) => {
    try {
        const { firstName, lastName, email, city, country, latitude, longitude } = req.body;
        const [result] = await db.execute(
            `INSERT INTO students (firstName, lastName, email, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, city, country, latitude, longitude]
        );
        const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/courses', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM courses ORDER BY createdAt DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/courses/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Cours non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/courses/:id', apiLog, async (req, res) => {
    try {
        const { courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude } = req.body;
        await db.execute(
            `UPDATE courses SET courseCode=?, title=?, description=?, teacherId=?, teacherName=?, teacherLocation=?, durationHours=?, price=?, maxStudents=?, level=?, status=?, city=?, country=?, latitude=?, longitude=?, updatedAt=NOW() WHERE id=?`,
            [courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude, req.params.id]
        );
        const [rows] = await db.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Cours non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/courses/:id', apiLog, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Cours non trouvé' });
        res.json({ message: 'Cours supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/courses', apiLog, async (req, res) => {
    try {
        const { courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude } = req.body;
        const [result] = await db.execute(
            `INSERT INTO courses (courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude]
        );
        const [rows] = await db.execute('SELECT * FROM courses WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Course materials (PDF, Video) - like Blackboard / e-learning
app.get('/api/courses/:courseId/materials', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM course_materials WHERE courseId = ? ORDER BY orderNumber ASC, id ASC', [req.params.courseId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/courses/:courseId/materials', apiLog, async (req, res) => {
    try {
        const { type, title, url, orderNumber } = req.body;
        if (!type || !title || !url) {
            res.status(400).json({ error: 'type, title et url sont requis' });
            return;
        }
        const ord = orderNumber != null ? orderNumber : 0;
        const [result] = await db.execute(
            'INSERT INTO course_materials (courseId, type, title, url, orderNumber) VALUES (?, ?, ?, ?, ?)',
            [req.params.courseId, type, title, url.trim(), ord]
        );
        const [rows] = await db.execute('SELECT * FROM course_materials WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/materials/:id', apiLog, async (req, res) => {
    try {
        const { type, title, url, orderNumber } = req.body;
        await db.execute(
            'UPDATE course_materials SET type=?, title=?, url=?, orderNumber=? WHERE id=?',
            [type, title, url, orderNumber != null ? orderNumber : 0, req.params.id]
        );
        const [rows] = await db.execute('SELECT * FROM course_materials WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Ressource non trouvée' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/materials/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT url FROM course_materials WHERE id = ?', [req.params.id]);
        if (rows.length) {
            const url = rows[0].url || '';
            if (url.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, url.replace(/^\//, ''));
                try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
            }
        }
        const [r] = await db.execute('DELETE FROM course_materials WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Ressource non trouvée' });
        res.json({ message: 'Ressource supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== Pédagogie: Level → Chapter → Lesson → Quiz ==========
app.get('/api/levels', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM levels ORDER BY sortOrder ASC, id ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/levels/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM levels WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Niveau non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/levels', apiLog, async (req, res) => {
    try {
        const { code, name, sortOrder } = req.body;
        const [result] = await db.execute('INSERT INTO levels (code, name, sortOrder) VALUES (?, ?, ?)', [code || '', name || '', sortOrder != null ? sortOrder : 0]);
        const [rows] = await db.execute('SELECT * FROM levels WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/levels/:id', apiLog, async (req, res) => {
    try {
        const { code, name, sortOrder } = req.body;
        await db.execute('UPDATE levels SET code=?, name=?, sortOrder=? WHERE id=?', [code, name, sortOrder != null ? sortOrder : 0, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM levels WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Niveau non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/levels/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM levels WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Niveau non trouvé' });
        res.json({ message: 'Niveau supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/levels/:levelId/chapters', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM chapters WHERE levelId = ? ORDER BY sortOrder ASC, id ASC', [req.params.levelId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/chapters/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM chapters WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Chapitre non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/levels/:levelId/chapters', apiLog, async (req, res) => {
    try {
        const { title, sortOrder } = req.body;
        const [result] = await db.execute('INSERT INTO chapters (levelId, title, sortOrder) VALUES (?, ?, ?)', [req.params.levelId, title || '', sortOrder != null ? sortOrder : 0]);
        const [rows] = await db.execute('SELECT * FROM chapters WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/chapters/:id', apiLog, async (req, res) => {
    try {
        const { title, sortOrder } = req.body;
        await db.execute('UPDATE chapters SET title=?, sortOrder=? WHERE id=?', [title, sortOrder != null ? sortOrder : 0, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM chapters WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Chapitre non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/chapters/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM chapters WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Chapitre non trouvé' });
        res.json({ message: 'Chapitre supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chapters/:chapterId/lessons', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM lessons WHERE chapterId = ? ORDER BY sortOrder ASC, id ASC', [req.params.chapterId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/lessons/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Cours non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/chapters/:chapterId/lessons', apiLog, async (req, res) => {
    try {
        const { title, type, url, durationMinutes, sortOrder } = req.body;
        const [result] = await db.execute(
            'INSERT INTO lessons (chapterId, title, type, url, durationMinutes, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.chapterId, title || '', type || 'VIDEO', url || '', durationMinutes != null ? durationMinutes : 0, sortOrder != null ? sortOrder : 0]
        );
        const [rows] = await db.execute('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/lessons/:id', apiLog, async (req, res) => {
    try {
        const { title, type, url, durationMinutes, sortOrder } = req.body;
        await db.execute('UPDATE lessons SET title=?, type=?, url=?, durationMinutes=?, sortOrder=? WHERE id=?', [title, type, url, durationMinutes != null ? durationMinutes : 0, sortOrder != null ? sortOrder : 0, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Cours non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/lessons/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM lessons WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Cours non trouvé' });
        res.json({ message: 'Cours supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chapters/:chapterId/quiz', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE chapterId = ? LIMIT 1', [req.params.chapterId]);
        if (!rows.length) return res.json(null);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/quizzes/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Quiz non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/chapters/:chapterId/quizzes', apiLog, async (req, res) => {
    try {
        const { title, passingScorePercent } = req.body;
        const [result] = await db.execute('INSERT INTO quizzes (chapterId, title, passingScorePercent) VALUES (?, ?, ?)', [req.params.chapterId, title || 'Quiz', passingScorePercent != null ? passingScorePercent : 50]);
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/quizzes/:id', apiLog, async (req, res) => {
    try {
        const { title, passingScorePercent } = req.body;
        await db.execute('UPDATE quizzes SET title=?, passingScorePercent=? WHERE id=?', [title, passingScorePercent != null ? passingScorePercent : 50, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Quiz non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/quizzes/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Quiz non trouvé' });
        res.json({ message: 'Quiz supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/quizzes/:quizId/questions', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY orderNumber ASC, id ASC', [req.params.quizId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/quizzes/:quizId/questions', apiLog, async (req, res) => {
    try {
        const { questionText, questionType, points, correctAnswer, orderNumber } = req.body;
        const [result] = await db.execute(
            'INSERT INTO quiz_questions (quizId, questionText, questionType, points, correctAnswer, orderNumber) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.quizId, questionText || '', questionType || 'MULTIPLE_CHOICE', points != null ? points : 10, correctAnswer || '', orderNumber != null ? orderNumber : 0]
        );
        const [rows] = await db.execute('SELECT * FROM quiz_questions WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/quiz-questions/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM quiz_questions WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Question non trouvée' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/quiz-questions/:id', apiLog, async (req, res) => {
    try {
        const { questionText, questionType, points, correctAnswer, orderNumber } = req.body;
        await db.execute('UPDATE quiz_questions SET questionText=?, questionType=?, points=?, correctAnswer=?, orderNumber=? WHERE id=?', [questionText, questionType, points != null ? points : 10, correctAnswer, orderNumber != null ? orderNumber : 0, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM quiz_questions WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Question non trouvée' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/quiz-questions/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM quiz_questions WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Question non trouvée' });
        res.json({ message: 'Question supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Points de l'étudiant
app.get('/api/students/:studentId/points', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT totalPoints, updatedAt FROM student_points WHERE studentId = ?', [req.params.studentId]);
        res.json(rows[0] || { totalPoints: 0, updatedAt: null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Soumettre un quiz: score → points (0-49%=0, 50-69%=10, 70-89%=20, 90-100%=30) → totalPoints → badge si seuil
function pointsFromScore(scorePercent) {
    if (scorePercent >= 90) return 30;
    if (scorePercent >= 70) return 20;
    if (scorePercent >= 50) return 10;
    return 0;
}
const BADGE_THRESHOLDS = [
    { points: 100, badgeLevel: 'BRONZE', badgeName: 'Badge Bronze' },
    { points: 200, badgeLevel: 'SILVER', badgeName: 'Badge Silver' },
    { points: 300, badgeLevel: 'GOLD', badgeName: 'Badge Gold' },
    { points: 500, badgeLevel: 'PLATINUM', badgeName: 'Badge Master' }
];
app.post('/api/quiz-attempts', apiLog, async (req, res) => {
    try {
        const { studentId, quizId, answers } = req.body; // answers: [{ questionId, answerText }]
        if (!studentId || !quizId) {
            res.status(400).json({ error: 'studentId et quizId requis' });
            return;
        }
        const [questions] = await db.execute('SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY orderNumber ASC', [quizId]);
        if (!questions.length) {
            res.status(400).json({ error: 'Aucune question dans ce quiz' });
            return;
        }
        let correct = 0;
        const answerMap = new Map((answers || []).map(a => [String(a.questionId), (a.answerText || '').toString().trim().toLowerCase()]));
        for (const q of questions) {
            const userAnswer = answerMap.get(String(q.id)) || '';
            const correctAnswer = (q.correctAnswer || '').toString().trim().toLowerCase();
            if (userAnswer === correctAnswer) correct++;
        }
        const scorePercent = Math.round((correct / questions.length) * 100);
        const pointsEarned = pointsFromScore(scorePercent);
        await db.execute(
            'INSERT INTO quiz_attempts (studentId, quizId, scorePercent, pointsEarned) VALUES (?, ?, ?, ?)',
            [studentId, quizId, scorePercent, pointsEarned]
        );
        await db.execute(
            'INSERT INTO student_points (studentId, totalPoints) VALUES (?, ?) ON DUPLICATE KEY UPDATE totalPoints = totalPoints + ?, updatedAt = NOW()',
            [studentId, pointsEarned, pointsEarned]
        );
        const [[row]] = await db.execute('SELECT totalPoints FROM student_points WHERE studentId = ?', [studentId]);
        const totalPoints = row ? row.totalPoints : pointsEarned;
        const newBadges = [];
        for (const t of BADGE_THRESHOLDS) {
            if (totalPoints >= t.points) {
                const [existing] = await db.execute(
                    'SELECT id FROM badges WHERE studentId = ? AND badgeLevel = ?',
                    [studentId, t.badgeLevel]
                );
                if (!existing.length) {
                    const [studentRows] = await db.execute('SELECT city, country FROM students WHERE id = ?', [studentId]);
                    const s = studentRows[0];
                    await db.execute(
                        'INSERT INTO badges (studentId, badgeName, badgeType, badgeLevel, description, earnedDate, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, NULL, NULL)',
                        [studentId, t.badgeName, 'COURSE_COMPLETION', t.badgeLevel, 'Atteint ' + t.points + ' points', s?.city, s?.country]
                    );
                    newBadges.push({ badgeLevel: t.badgeLevel, badgeName: t.badgeName });
                }
            }
        }
        res.status(201).json({
            scorePercent,
            pointsEarned,
            totalPoints,
            newBadges,
            passed: scorePercent >= 50
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/enrollments', apiLog, async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const courseId = req.query.courseId;
        let sql = `SELECT e.*, s.firstName as studentFirstName, s.lastName as studentLastName, c.title as courseTitle, c.courseCode FROM enrollments e LEFT JOIN students s ON e.studentId = s.id LEFT JOIN courses c ON e.courseId = c.id`;
        const params = [];
        if (studentId) { sql += ' WHERE e.studentId = ?'; params.push(studentId); }
        if (courseId) { sql += (params.length ? ' AND' : ' WHERE') + ' e.courseId = ?'; params.push(courseId); }
        sql += ' ORDER BY e.enrollmentDate DESC';
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/enrollments/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT e.*, s.firstName as studentFirstName, s.lastName as studentLastName, c.title as courseTitle, c.courseCode FROM enrollments e LEFT JOIN students s ON e.studentId = s.id LEFT JOIN courses c ON e.courseId = c.id WHERE e.id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Inscription non trouvée' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/enrollments/:id', apiLog, async (req, res) => {
    try {
        const { status, completionPercentage, finalGrade } = req.body;
        await db.execute('UPDATE enrollments SET status=?, completionPercentage=?, finalGrade=?, enrollmentDate=COALESCE(enrollmentDate, NOW()) WHERE id=?', [status || 'ACTIVE', completionPercentage ?? 0, finalGrade ?? null, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM enrollments WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Inscription non trouvée' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/enrollments', apiLog, async (req, res) => {
    try {
        const { studentId, courseId, status, completionPercentage, finalGrade } = req.body;
        if (studentId == null || courseId == null) {
            res.status(400).json({ error: 'studentId et courseId sont requis' });
            return;
        }
        const [result] = await db.execute(
            `INSERT INTO enrollments (studentId, courseId, status, completionPercentage, finalGrade) VALUES (?, ?, ?, ?, ?)`,
            [studentId, courseId, status || 'ACTIVE', completionPercentage ?? 0, finalGrade ?? null]
        );
        const [rows] = await db.execute('SELECT * FROM enrollments WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            res.status(409).json({ error: 'Cet étudiant est déjà inscrit à ce cours', code: 'DUPLICATE_ENROLLMENT' });
            return;
        }
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/enrollments/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Inscription non trouvée' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// --- Teachers CRUD et affectation formateur ↔ cours ---
app.get('/api/teachers', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM teachers ORDER BY lastName, firstName');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/teachers/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Formateur non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/teachers', apiLog, async (req, res) => {
    try {
        const { firstName, lastName, email, city, country } = req.body;
        const [result] = await db.execute(
            'INSERT INTO teachers (firstName, lastName, email, city, country) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email || null, city || null, country || null]
        );
        const [rows] = await db.execute('SELECT * FROM teachers WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/teachers/:id', apiLog, async (req, res) => {
    try {
        const { firstName, lastName, email, city, country } = req.body;
        await db.execute(
            'UPDATE teachers SET firstName=?, lastName=?, email=?, city=?, country=? WHERE id=?',
            [firstName, lastName, email, city, country, req.params.id]
        );
        const [rows] = await db.execute('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Formateur non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/teachers/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM teachers WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Formateur non trouvé' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/courses/:id/assign-teacher', apiLog, async (req, res) => {
    try {
        const teacherId = req.body.teacherId != null ? req.body.teacherId : null;
        const [teacherRows] = teacherId ? await db.execute('SELECT firstName, lastName, city, country FROM teachers WHERE id = ?', [teacherId]) : [[]];
        const teacher = teacherRows[0];
        const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : null;
        const teacherLocation = teacher && (teacher.city || teacher.country) ? [teacher.city, teacher.country].filter(Boolean).join(', ') : null;
        await db.execute(
            'UPDATE courses SET teacherId=?, teacherName=?, teacherLocation=? WHERE id=?',
            [teacherId, teacherName, teacherLocation, req.params.id]
        );
        const [rows] = await db.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Cours non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/questions', apiLog, async (req, res) => {
    try {
        const courseId = req.query.courseId;
        const includeInactive = req.query.includeInactive === '1';
        let sql = 'SELECT * FROM questions WHERE 1=1';
        const params = [];
        if (!includeInactive) sql += ' AND isActive = 1';
        if (courseId) { sql += ' AND courseId = ?'; params.push(courseId); }
        sql += ' ORDER BY orderNumber ASC, createdAt ASC';
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/questions/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM questions WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Question non trouvée' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/questions', apiLog, async (req, res) => {
    try {
        const { courseId, questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive } = req.body;
        const [result] = await db.execute(
            `INSERT INTO questions (courseId, questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [courseId, questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive]
        );
        const [rows] = await db.execute('SELECT * FROM questions WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/questions/:id', apiLog, async (req, res) => {
    try {
        const { questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive } = req.body;
        await db.execute(
            'UPDATE questions SET questionText=?, questionType=?, points=?, difficultyLevel=?, correctAnswer=?, explanation=?, orderNumber=?, isActive=? WHERE id=?',
            [questionText, questionType, points, difficultyLevel, correctAnswer, explanation, orderNumber, isActive, req.params.id]
        );
        const [rows] = await db.execute('SELECT * FROM questions WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Question non trouvée' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/questions/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM questions WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Question non trouvée' });
        res.json({ message: 'Question supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/responses', apiLog, async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const questionId = req.query.questionId;
        const courseId = req.query.courseId;
        let sql = `SELECT r.*, q.questionText, q.courseId, q.points as questionPoints, s.firstName as studentFirstName, s.lastName as studentLastName FROM responses r LEFT JOIN questions q ON r.questionId = q.id LEFT JOIN students s ON r.studentId = s.id WHERE 1=1`;
        const params = [];
        if (studentId) { sql += ' AND r.studentId = ?'; params.push(studentId); }
        if (questionId) { sql += ' AND r.questionId = ?'; params.push(questionId); }
        if (courseId) { sql += ' AND q.courseId = ?'; params.push(courseId); }
        sql += ' ORDER BY r.submittedAt DESC';
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/responses', apiLog, async (req, res) => {
    try {
        const { studentId, questionId, enrollmentId, answerText, isCorrect, pointsEarned } = req.body;
        if (!studentId || !questionId) {
            res.status(400).json({ error: 'studentId et questionId sont requis' });
            return;
        }
        const [result] = await db.execute(
            `INSERT INTO responses (studentId, questionId, enrollmentId, answerText, isCorrect, pointsEarned) VALUES (?, ?, ?, ?, ?, ?)`,
            [studentId, questionId, enrollmentId || null, answerText || null, isCorrect ?? null, pointsEarned ?? null]
        );
        const [rows] = await db.execute('SELECT * FROM responses WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/badges', apiLog, async (req, res) => {
    try {
        const studentId = req.query.studentId;
        let sql = `SELECT b.*, s.firstName, s.lastName FROM badges b LEFT JOIN students s ON b.studentId = s.id`;
        const params = [];
        if (studentId) { sql += ' WHERE b.studentId = ?'; params.push(studentId); }
        sql += ' ORDER BY b.earnedDate DESC';
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/badges', apiLog, async (req, res) => {
    try {
        const { studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate } = req.body;
        const [studentRows] = await db.execute('SELECT city, country, latitude, longitude FROM students WHERE id = ?', [studentId]);
        const student = studentRows[0];
        const [result] = await db.execute(
            `INSERT INTO badges (studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate, student?.city, student?.country, student?.latitude, student?.longitude]
        );
        const [rows] = await db.execute('SELECT * FROM badges WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/badges/:id', apiLog, async (req, res) => {
    try {
        const { badgeName, badgeType, description, badgeLevel, earnedDate } = req.body;
        await db.execute(
            'UPDATE badges SET badgeName=COALESCE(?, badgeName), badgeType=COALESCE(?, badgeType), description=?, badgeLevel=COALESCE(?, badgeLevel), earnedDate=COALESCE(?, earnedDate) WHERE id=?',
            [badgeName, badgeType, description, badgeLevel, earnedDate, req.params.id]
        );
        const [rows] = await db.execute('SELECT * FROM badges WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Badge non trouvé' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/badges/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM badges WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Badge non trouvé' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/database/info', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT 'teachers' as table_name, COUNT(*) as count FROM teachers UNION ALL SELECT 'students' as table_name, COUNT(*) as count FROM students UNION ALL SELECT 'courses' as table_name, COUNT(*) as count FROM courses UNION ALL SELECT 'course_materials' as table_name, COUNT(*) as count FROM course_materials UNION ALL SELECT 'levels' as table_name, COUNT(*) as count FROM levels UNION ALL SELECT 'chapters' as table_name, COUNT(*) as count FROM chapters UNION ALL SELECT 'lessons' as table_name, COUNT(*) as count FROM lessons UNION ALL SELECT 'quizzes' as table_name, COUNT(*) as count FROM quizzes UNION ALL SELECT 'quiz_questions' as table_name, COUNT(*) as count FROM quiz_questions UNION ALL SELECT 'quiz_attempts' as table_name, COUNT(*) as count FROM quiz_attempts UNION ALL SELECT 'student_points' as table_name, COUNT(*) as count FROM student_points UNION ALL SELECT 'questions' as table_name, COUNT(*) as count FROM questions UNION ALL SELECT 'badges' as table_name, COUNT(*) as count FROM badges UNION ALL SELECT 'enrollments' as table_name, COUNT(*) as count FROM enrollments UNION ALL SELECT 'responses' as table_name, COUNT(*) as count FROM responses`);
        const totalRecords = rows.reduce((sum, row) => sum + row.count, 0);
        res.json({ database: 'MySQL (XAMPP)', host: dbConfig.host, database: dbConfig.database, tables: rows, totalRecords });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 404 pour toute autre requête /api/* (réponse JSON, pas HTML)
app.all('/api/*', apiLog, (req, res) => res.status(404).json({ error: 'Route API non trouvée', path: req.path, method: req.method }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));
app.use('/front-office', express.static(path.join(__dirname, 'front-office')));
app.use('/back-office', express.static(path.join(__dirname, 'back-office')));

// Main Geographic Dashboard
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>🗺️ E-Learning Geographic Dashboard - XAMPP MySQL</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .database-info {
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin-top: 10px;
            font-size: 0.9em;
        }
        
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .stat-label {
            color: #666;
            margin-top: 5px;
            font-size: 1.1em;
        }
        
        .main-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .map-section {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        #map {
            height: 600px;
            width: 100%;
        }
        
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .info-panel {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .info-panel h3 {
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        
        .location-list {
            max-height: 200px;
            overflow-y: auto;
        }
        
        .location-item {
            padding: 10px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: background 0.3s ease;
        }
        
        .location-item:hover {
            background: #e9ecef;
        }
        
        .location-name {
            font-weight: bold;
            color: #333;
        }
        
        .location-count {
            color: #666;
            font-size: 0.9em;
        }
        
        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            height: 300px;
        }
        
        .controls {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .btn.active {
            background: #28a745;
            color: white;
        }
        
        .legend {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-top: 10px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            margin: 5px 0;
        }
        
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .mysql-status {
            background: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        
        @media (max-width: 768px) {
            .main-container {
                grid-template-columns: 1fr;
            }
            
            .stats-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🗺️ E-Learning Geographic Dashboard</h1>
        <div class="database-info">
            🗄️ XAMPP MySQL Database <span class="mysql-status">● Connected</span>
        </div>
    </div>

    <div class="stats-container">
        <div class="stat-card">
            <div class="stat-number" id="totalStudents">0</div>
            <div class="stat-label">👥 Total Students</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="totalCourses">0</div>
            <div class="stat-label">📚 Total Courses</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="totalCities">0</div>
            <div class="stat-label">🏙️ Cities Covered</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="totalBadges">0</div>
            <div class="stat-label">🏆 Badges Awarded</div>
        </div>
    </div>

    <div class="controls">
        <div class="btn-group">
            <button class="btn btn-primary active" onclick="showLayer('students')">👥 Students</button>
            <button class="btn btn-primary" onclick="showLayer('courses')">📚 Courses</button>
            <button class="btn btn-primary" onclick="showLayer('badges')">🏆 Badges</button>
            <button class="btn btn-secondary" onclick="showAllLayers()">🌍 Show All</button>
            <button class="btn btn-secondary" onclick="refreshData()">🔄 Refresh</button>
            <button class="btn btn-secondary" onclick="window.open('/phpmyadmin', '_blank')">📊 phpMyAdmin</button>
        </div>
        
        <div class="legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #FF6B6B;"></div>
                <span>Students</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #4ECDC4;"></div>
                <span>Courses</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #45B7D1;"></div>
                <span>Badges</span>
            </div>
        </div>
    </div>

    <div class="main-container">
        <div class="map-section">
            <div id="map"></div>
        </div>
        
        <div class="sidebar">
            <div class="info-panel">
                <h3>📍 Locations</h3>
                <div class="location-list" id="locationList">
                    <div class="location-item">
                        <div class="location-name">Loading...</div>
                        <div class="location-count">Please wait</div>
                    </div>
                </div>
            </div>
            
            <div class="info-panel">
                <h3>📊 Distribution</h3>
                <div class="chart-container">
                    <canvas id="distributionChart"></canvas>
                </div>
            </div>
            
            <div class="info-panel">
                <h3>🏆 Recent Badges</h3>
                <div class="location-list" id="recentBadges">
                    <div class="location-item">
                        <div class="location-name">Loading...</div>
                        <div class="location-count">Please wait</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <script>
        let map;
        let markers = {
            students: [],
            courses: [],
            badges: []
        };
        let activeLayers = new Set(['students']);

        // Initialize map
        function initMap() {
            map = L.map('map').setView([46.6034, 1.8883], 6); // Center of France
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        }

        // Custom icons
        const icons = {
            student: L.divIcon({
                html: '👤',
                iconSize: [25, 25],
                className: 'custom-div-icon'
            }),
            course: L.divIcon({
                html: '📚',
                iconSize: [25, 25],
                className: 'custom-div-icon'
            }),
            badge: L.divIcon({
                html: '🏆',
                iconSize: [25, 25],
                className: 'custom-div-icon'
            })
        };

        // Load data from API
        async function loadData() {
            try {
                const [students, courses, badges] = await Promise.all([
                    fetch('/api/students').then(r => r.json()),
                    fetch('/api/courses').then(r => r.json()),
                    fetch('/api/badges').then(r => r.json())
                ]);

                updateMap(students, courses, badges);
                updateStats(students, courses, badges);
                updateLocationList(students, courses, badges);
                updateDistributionChart(students, courses, badges);
                updateRecentBadges(badges);
            } catch (error) {
                console.error('Error loading data:', error);
                document.getElementById('locationList').innerHTML = '<div class="location-item"><div class="location-name">Error loading data</div><div class="location-count">Check console</div></div>';
            }
        }

        // Update map with markers
        function updateMap(students, courses, badges) {
            // Clear existing markers
            Object.values(markers).forEach(markerArray => {
                markerArray.forEach(marker => map.removeLayer(marker));
            });
            
            markers = { students: [], courses: [], badges: [] };

            // Add student markers
            if (activeLayers.has('students')) {
                students.forEach(student => {
                    if (student.latitude && student.longitude) {
                        const marker = L.marker([student.latitude, student.longitude], { icon: icons.student })
                            .bindPopup(\`
                                <strong>\${student.firstName} \${student.lastName}</strong><br>
                                📧 \${student.email}<br>
                                📍 \${student.city}, \${student.country}<br>
                                📅 Registered: \${new Date(student.registrationDate).toLocaleDateString()}
                            \`);
                        marker.addTo(map);
                        markers.students.push(marker);
                    }
                });
            }

            // Add course markers
            if (activeLayers.has('courses')) {
                courses.forEach(course => {
                    if (course.latitude && course.longitude) {
                        const marker = L.marker([course.latitude, course.longitude], { icon: icons.course })
                            .bindPopup(\`
                                <strong>\${course.title}</strong><br>
                                📖 \${course.courseCode}<br>
                                👨‍🏫 \${course.teacherName}<br>
                                📍 \${course.city}, \${course.country}<br>
                                💰 \${course.price}€<br>
                                📊 \${course.level} | \${course.status}
                            \`);
                        marker.addTo(map);
                        markers.courses.push(marker);
                    }
                });
            }

            // Add badge markers
            if (activeLayers.has('badges')) {
                badges.forEach(badge => {
                    if (badge.latitude && badge.longitude) {
                        const marker = L.marker([badge.latitude, badge.longitude], { icon: icons.badge })
                            .bindPopup(\`
                                <strong>\${badge.badgeName}</strong><br>
                                🎖️ \${badge.badgeType}<br>
                                🎓 \${badge.badgeLevel}<br>
                                📅 Earned: \${badge.earnedDate}<br>
                                📍 \${badge.city}, \${badge.country}
                            \`);
                        marker.addTo(map);
                        markers.badges.push(marker);
                    }
                });
            }
        }

        // Update statistics
        function updateStats(students, courses, badges) {
            document.getElementById('totalStudents').textContent = students.length;
            document.getElementById('totalCourses').textContent = courses.length;
            document.getElementById('totalBadges').textContent = badges.length;
            
            const cities = new Set([
                ...students.map(s => s.city).filter(Boolean),
                ...courses.map(c => c.city).filter(Boolean)
            ]);
            document.getElementById('totalCities').textContent = cities.size;
        }

        // Update location list
        function updateLocationList(students, courses, badges) {
            const locationMap = new Map();
            
            students.forEach(student => {
                if (student.city) {
                    const key = \`\${student.city}, \${student.country}\`;
                    locationMap.set(key, {
                        name: key,
                        students: (locationMap.get(key)?.students || 0) + 1,
                        courses: locationMap.get(key)?.courses || 0,
                        badges: locationMap.get(key)?.badges || 0
                    });
                }
            });
            
            courses.forEach(course => {
                if (course.city) {
                    const key = \`\${course.city}, \${course.country}\`;
                    locationMap.set(key, {
                        name: key,
                        students: locationMap.get(key)?.students || 0,
                        courses: (locationMap.get(key)?.courses || 0) + 1,
                        badges: locationMap.get(key)?.badges || 0
                    });
                }
            });
            
            const locationList = document.getElementById('locationList');
            locationList.innerHTML = Array.from(locationMap.values())
                .map(loc => \`
                    <div class="location-item">
                        <div class="location-name">\${loc.name}</div>
                        <div class="location-count">
                            👥 \${loc.students} | 📚 \${loc.courses} | 🏆 \${loc.badges}
                        </div>
                    </div>
                \`).join('');
        }

        // Update distribution chart
        function updateDistributionChart(students, courses, badges) {
            const ctx = document.getElementById('distributionChart').getContext('2d');
            
            const cityData = new Map();
            students.forEach(student => {
                if (student.city) {
                    cityData.set(student.city, (cityData.get(student.city) || 0) + 1);
                }
            });
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Array.from(cityData.keys()),
                    datasets: [{
                        data: Array.from(cityData.values()),
                        backgroundColor: [
                            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 10,
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
        }

        // Update recent badges
        function updateRecentBadges(badges) {
            const recentBadges = document.getElementById('recentBadges');
            const sortedBadges = badges
                .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate))
                .slice(0, 5);
                
            recentBadges.innerHTML = sortedBadges.map(badge => \`
                <div class="location-item">
                    <div class="location-name">\${badge.badgeName}</div>
                    <div class="location-count">
                        🎖️ \${badge.badgeLevel} | 📅 \${badge.earnedDate}
                    </div>
                </div>
            \`).join('');
        }

        // Layer controls
        function showLayer(layerName) {
            activeLayers.clear();
            activeLayers.add(layerName);
            
            // Update button states
            document.querySelectorAll('.btn-primary').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            loadData();
        }

        function showAllLayers() {
            activeLayers = new Set(['students', 'courses', 'badges']);
            
            document.querySelectorAll('.btn-primary').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            loadData();
        }

        function refreshData() {
            loadData();
        }

        // Initialize everything
        document.addEventListener('DOMContentLoaded', () => {
            initMap();
            loadData();
        });
    </script>
</body>
</html>
    `);
});

// Start server
async function startServer() {
    await initializeDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('🗺️ E-Learning Geographic Dashboard with XAMPP MySQL running on http://localhost:' + PORT);
        console.log('📁 Dossier serveur (à utiliser pour lancer): ' + __dirname);
        console.log('🌐 Back-office: http://localhost:' + PORT + '/back-office/');
        console.log('🔌 Test API (doit renvoyer du JSON): http://localhost:' + PORT + '/api/ping');
        console.log('👥 Students: /api/students  |  📚 Courses: /api/courses');
        console.log('\n⚠️  Si Modifier/Supprimer renvoie 404 ou HTML: netstat -ano | findstr ":' + PORT + '" puis taskkill /PID <PID> /F');
        console.log('\n💡 XAMPP MySQL doit être démarré.');
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error('\n❌ ERREUR: Le port ' + PORT + ' est déjà utilisé.');
            console.error('   Un autre programme écoute sur 8081. Ferme-le ou tue le processus:');
            console.error('   netstat -ano | findstr ":8081"');
            console.error('   taskkill /PID <numero> /F\n');
        } else {
            console.error(err);
        }
        process.exit(1);
    });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    if (db) {
        await db.end();
    }
    process.exit(0);
});

startServer().catch(console.error);
