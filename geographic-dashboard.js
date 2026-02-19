const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8081;

// Database setup
const db = new sqlite3.Database('./elearning.db');

// Enhanced tables with location data
db.serialize(() => {
    // Courses table with location
    db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseCode TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        teacherId INTEGER,
        teacherName TEXT,
        teacherLocation TEXT,
        durationHours INTEGER,
        price REAL,
        maxStudents INTEGER,
        level TEXT,
        status TEXT,
        city TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Students table with location
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE,
        city TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Enrollments table
    db.run(`CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        courseId INTEGER,
        enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'ACTIVE',
        completionPercentage REAL DEFAULT 0,
        FOREIGN KEY (studentId) REFERENCES students (id),
        FOREIGN KEY (courseId) REFERENCES courses (id)
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

    // Badges table with student location
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
        city TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses (id)
    )`);

    // Insert sample data with locations
    insertSampleData();
    
    console.log('🗄️ Enhanced database with location data created');
});

function insertSampleData() {
    // Insert sample courses with locations
    const courses = [
        ['JAVA101', 'Java Programming', 'Learn Java fundamentals', 1, 'Prof. Martin', 'Paris, France', 40, 299.99, 30, 'BEGINNER', 'ACTIVE', 'Paris', 'France', 48.8566, 2.3522],
        ['WEB202', 'Web Development', 'HTML, CSS, JavaScript', 2, 'Prof. Dubois', 'Lyon, France', 60, 399.99, 25, 'INTERMEDIATE', 'ACTIVE', 'Lyon', 'France', 45.7640, 4.8357],
        ['DATA303', 'Data Science', 'Python and Machine Learning', 3, 'Dr. Bernard', 'Marseille, France', 80, 599.99, 20, 'ADVANCED', 'ACTIVE', 'Marseille', 'France', 43.2965, 5.3698],
        ['MOBILE404', 'Mobile Development', 'iOS and Android', 1, 'Prof. Martin', 'Paris, France', 50, 449.99, 15, 'INTERMEDIATE', 'ACTIVE', 'Paris', 'France', 48.8566, 2.3522]
    ];

    courses.forEach(course => {
        db.run(`INSERT OR IGNORE INTO courses (courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, course);
    });

    // Insert sample students with locations
    const students = [
        ['Jean', 'Dupont', 'jean.dupont@email.com', 'Paris', 'France', 48.8566, 2.3522],
        ['Marie', 'Curie', 'marie.curie@email.com', 'Lyon', 'France', 45.7640, 4.8357],
        ['Pierre', 'Martin', 'pierre.martin@email.com', 'Marseille', 'France', 43.2965, 5.3698],
        ['Sophie', 'Bernard', 'sophie.bernard@email.com', 'Toulouse', 'France', 43.6047, 1.4442],
        ['Lucas', 'Petit', 'lucas.petit@email.com', 'Nice', 'France', 43.7102, 7.2620],
        ['Emma', 'Robert', 'emma.robert@email.com', 'Nantes', 'France', 47.2184, -1.5536],
        ['Hugo', 'Leroy', 'hugo.leroy@email.com', 'Strasbourg', 'France', 48.5846, 7.7507],
        ['Léa', 'Moreau', 'lea.moreau@email.com', 'Bordeaux', 'France', 44.8378, -0.5792]
    ];

    students.forEach(student => {
        db.run(`INSERT OR IGNORE INTO students (firstName, lastName, email, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)`, student);
    });

    // Insert sample enrollments
    const enrollments = [
        [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [6, 3], [7, 4], [8, 1]
    ];

    enrollments.forEach(enrollment => {
        db.run(`INSERT OR IGNORE INTO enrollments (studentId, courseId) VALUES (?, ?)`, enrollment);
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Main Map Interface
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>🗺️ E-Learning Geographic Dashboard</title>
    
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
        <p>Visualize your learning ecosystem on the map</p>
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
                                📍 \${student.city}, \${student.country}
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
                                💰 \${course.price}€
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
                                📅 \${badge.earnedDate}<br>
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

        // API endpoints for students
        app.get('/api/students', (req, res) => {
            db.all('SELECT * FROM students ORDER BY registrationDate DESC', (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json(rows);
            });
        });

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

// API Endpoints
app.get('/api/students', (req, res) => {
    db.all('SELECT * FROM students ORDER BY registrationDate DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
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
    const { courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude } = req.body;
    
    db.run(
        `INSERT INTO courses (courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [courseCode, title, description, teacherId, teacherName, teacherLocation, durationHours, price, maxStudents, level, status, city, country, latitude, longitude],
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

app.get('/api/enrollments', (req, res) => {
    db.all(`
        SELECT e.*, s.firstName as studentFirstName, s.lastName as studentLastName, c.title as courseTitle, c.courseCode
        FROM enrollments e
        LEFT JOIN students s ON e.studentId = s.id
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

app.get('/api/badges', (req, res) => {
    db.all(`
        SELECT b.*, s.firstName, s.lastName, s.city as studentCity, s.country as studentCountry, s.latitude, s.longitude
        FROM badges b
        LEFT JOIN students s ON b.studentId = s.id
        ORDER BY b.earnedDate DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/badges', (req, res) => {
    const { studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate } = req.body;
    
    // Get student location
    db.get('SELECT city, country, latitude, longitude FROM students WHERE id = ?', [studentId], (err, student) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        db.run(
            `INSERT INTO badges (studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate, city, country, latitude, longitude) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentId, badgeName, badgeType, description, iconUrl, courseId, criteriaMet, badgeLevel, earnedDate, student?.city, student?.country, student?.latitude, student?.longitude],
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
});

app.get('/api/database/info', (req, res) => {
    db.all(
        `SELECT 'students' as table_name, COUNT(*) as count FROM students
         UNION ALL
         SELECT 'courses' as table_name, COUNT(*) as count FROM courses
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
    console.log(`🗺️ E-Learning Geographic Dashboard running on http://localhost:${PORT}`);
    console.log(`🌐 Interactive Map: http://localhost:${PORT}/`);
    console.log(`📊 Geographic Analytics: http://localhost:${PORT}/`);
    console.log(`👥 Students API: http://localhost:${PORT}/api/students`);
    console.log(`📚 Courses API: http://localhost:${PORT}/api/courses`);
    console.log(`🏆 Badges API: http://localhost:${PORT}/api/badges`);
});
