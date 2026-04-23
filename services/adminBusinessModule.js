/**
 * Module Business / Analytics admin — cartographie, KPI, alertes, exports.
 * Utilisé par xampp-mysql-dashboard.js (routes /api/admin/*).
 */

const COUNTRY_CENTROIDS = {
    France: [46.5, 2.5],
    Tunisia: [34.0, 9.0],
    'United States': [39.8, -98.5],
    USA: [39.8, -98.5],
    Canada: [56.0, -96.0],
    Germany: [51.2, 10.5],
    Spain: [40.4, -3.7],
    Italy: [42.6, 12.6],
    UK: [54.0, -2.5],
    Morocco: [32.0, -6.0],
    Algeria: [28.0, 3.0],
    Belgium: [50.5, 4.5],
    Switzerland: [46.8, 8.2],
    Portugal: [39.4, -8.2],
    Netherlands: [52.2, 5.3],
    Brazil: [-14.2, -51.9],
    Mexico: [23.6, -102.5],
    India: [22.6, 79.0],
    China: [35.0, 104.0],
    Japan: [36.2, 138.3],
    Australia: [-25.3, 133.8],
    'South Africa': [-30.6, 22.9],
    Egypt: [26.8, 30.8],
    Senegal: [14.5, -14.5],
    'Ivory Coast': [7.5, -5.5],
    'United Arab Emirates': [24.0, 54.0],
    'Saudi Arabia': [24.0, 45.0],
    Turkey: [39.0, 35.0],
    Russia: [61.5, 105.3],
    Poland: [51.9, 19.1],
    Sweden: [62.0, 15.0],
    Norway: [64.0, 10.0],
    Denmark: [56.0, 10.0],
    Greece: [39.0, 22.0],
    'New Zealand': [-41.0, 174.0],
    Argentina: [-38.4, -63.6],
    Chile: [-35.7, -71.5],
    Colombia: [4.0, -72.0],
    Peru: [-9.2, -75.0],
    Inconnu: [20, 0]
};

const COUNTRY_TO_ISO = {
    France: 'FR',
    Tunisia: 'TN',
    'United States': 'US',
    Canada: 'CA',
    Germany: 'DE',
    Spain: 'ES',
    Italy: 'IT',
    UK: 'GB',
    Morocco: 'MA',
    Algeria: 'DZ',
    Belgium: 'BE',
    Switzerland: 'CH',
    Portugal: 'PT',
    Netherlands: 'NL',
    Brazil: 'BR',
    Mexico: 'MX',
    India: 'IN',
    China: 'CN',
    Japan: 'JP',
    Australia: 'AU',
    'South Africa': 'ZA',
    Egypt: 'EG',
    Senegal: 'SN',
    'Ivory Coast': 'CI',
    'United Arab Emirates': 'AE',
    'Saudi Arabia': 'SA',
    Turkey: 'TR',
    Russia: 'RU',
    Poland: 'PL',
    Sweden: 'SE',
    Norway: 'NO',
    Denmark: 'DK',
    Greece: 'GR',
    'New Zealand': 'NZ',
    Argentina: 'AR',
    Chile: 'CL',
    Colombia: 'CO',
    Peru: 'PE'
};

const COUNTRY_ALIASES = {
    fr: 'France',
    france: 'France',
    francee: 'France',
    franceee: 'France',
    francaise: 'France',
    tunisie: 'Tunisia',
    tunisia: 'Tunisia',
    tunisiee: 'Tunisia',
    tn: 'Tunisia',
    maroc: 'Morocco',
    morocco: 'Morocco',
    ma: 'Morocco',
    algerie: 'Algeria',
    algeria: 'Algeria',
    dz: 'Algeria',
    usa: 'United States',
    us: 'United States',
    unitedstates: 'United States',
    etatsunis: 'United States',
    etasunis: 'United States',
    royaumeuni: 'UK',
    unitedkingdom: 'UK',
    gb: 'UK',
    uk: 'UK',
    angleterre: 'UK',
    allemagne: 'Germany',
    germany: 'Germany',
    espagne: 'Spain',
    spain: 'Spain',
    italie: 'Italy',
    italy: 'Italy',
    belgique: 'Belgium',
    belgie: 'Belgium',
    suisse: 'Switzerland',
    switzerland: 'Switzerland',
    portugal: 'Portugal',
    paysbas: 'Netherlands',
    netherlands: 'Netherlands',
    holland: 'Netherlands',
    bresil: 'Brazil',
    brazil: 'Brazil',
    mexique: 'Mexico',
    mexico: 'Mexico',
    inde: 'India',
    india: 'India',
    chine: 'China',
    china: 'China',
    japon: 'Japan',
    japan: 'Japan',
    australie: 'Australia',
    australia: 'Australia',
    egypte: 'Egypt',
    egypt: 'Egypt',
    senegal: 'Senegal',
    coteivoire: 'Ivory Coast',
    ivorycoast: 'Ivory Coast',
    emiratsarabesunis: 'United Arab Emirates',
    saudiarabia: 'Saudi Arabia',
    arabiesaoudite: 'Saudi Arabia',
    turquie: 'Turkey',
    turkey: 'Turkey',
    russie: 'Russia',
    russia: 'Russia',
    pologne: 'Poland',
    poland: 'Poland',
    suede: 'Sweden',
    sweden: 'Sweden',
    norvege: 'Norway',
    norway: 'Norway',
    danemark: 'Denmark',
    denmark: 'Denmark',
    grece: 'Greece',
    greece: 'Greece',
    nouvellezelande: 'New Zealand',
    newzealand: 'New Zealand',
    argentine: 'Argentina',
    argentina: 'Argentina',
    chili: 'Chile',
    chile: 'Chile',
    colombie: 'Colombia',
    colombia: 'Colombia',
    perou: 'Peru',
    peru: 'Peru'
};

function simplifyCountryToken(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
}

function normalizeCountryName(name) {
    const raw = String(name || '').trim();
    const token = simplifyCountryToken(raw);
    if (!token) return 'Inconnu';
    if (COUNTRY_ALIASES[token]) return COUNTRY_ALIASES[token];
    if (token.length <= 2) return 'Inconnu';
    for (const country of Object.keys(COUNTRY_CENTROIDS)) {
        if (country === 'Inconnu' || country === 'USA') continue;
        const base = simplifyCountryToken(country);
        if (token === base) return country;
        if (base.length >= 4 && token.startsWith(base)) return country;
    }
    if (/^franc/.test(token)) return 'France';
    if (/^tun/.test(token)) return 'Tunisia';
    return raw;
}

function countryFlagEmoji(name) {
    const code = COUNTRY_TO_ISO[normalizeCountryName(name)];
    if (!code) return '🌍';
    return code
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
        .join('');
}

function centroidForCountry(name) {
    if (!name || !String(name).trim()) return [...COUNTRY_CENTROIDS.Inconnu];
    const n = normalizeCountryName(name);
    if (COUNTRY_CENTROIDS[n]) return [...COUNTRY_CENTROIDS[n]];
    const lower = n.toLowerCase();
    for (const [k, v] of Object.entries(COUNTRY_CENTROIDS)) {
        if (k !== 'Inconnu' && (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower.slice(0, Math.min(4, lower.length))))) {
            return [...v];
        }
    }
    return [...COUNTRY_CENTROIDS.Inconnu];
}

function parseFilters(q) {
    const f = {
        courseId: q.courseId ? parseInt(q.courseId, 10) : null,
        courseLevel: q.courseLevel || null,
        badgeLevel: q.badgeLevel || null,
        scoreMin: q.scoreMin != null && q.scoreMin !== '' ? Number(q.scoreMin) : null,
        scoreMax: q.scoreMax != null && q.scoreMax !== '' ? Number(q.scoreMax) : null,
        progressMin: q.progressMin != null && q.progressMin !== '' ? Number(q.progressMin) : null,
        progressMax: q.progressMax != null && q.progressMax !== '' ? Number(q.progressMax) : null,
        activeStatus: q.activeStatus || null,
        activeDays: q.activeDays != null ? Math.min(90, Math.max(1, parseInt(q.activeDays, 10) || 7)) : 7,
        regFrom: q.regFrom || null,
        regTo: q.regTo || null,
        lastLoginSince: q.lastLoginSince || null,
        lastLoginBefore: q.lastLoginBefore || null
    };
    return f;
}

function lastActivityDate(row) {
    const a = row.lastLoginAt ? new Date(row.lastLoginAt).getTime() : 0;
    const b = row.lastEventAt ? new Date(row.lastEventAt).getTime() : 0;
    const c = row.registrationDate ? new Date(row.registrationDate).getTime() : 0;
    return Math.max(a, b, c);
}

function isStudentActive(row, activeDays) {
    const ms = activeDays * 86400000;
    return Date.now() - lastActivityDate(row) <= ms;
}

async function fetchStudentRowsForAdmin(db, filters) {
    const params = [];
    const where = ['1=1'];
    if (filters.courseId && !Number.isNaN(filters.courseId)) {
        where.push('EXISTS (SELECT 1 FROM enrollments e WHERE e.studentId = s.id AND e.courseId = ?)');
        params.push(filters.courseId);
    }
    if (filters.courseLevel) {
        where.push(`EXISTS (SELECT 1 FROM enrollments e INNER JOIN courses c ON c.id = e.courseId WHERE e.studentId = s.id AND c.level = ?)`);
        params.push(filters.courseLevel);
    }
    if (filters.badgeLevel) {
        where.push('EXISTS (SELECT 1 FROM badges b WHERE b.studentId = s.id AND b.badgeLevel = ?)');
        params.push(filters.badgeLevel);
    }
    if (filters.regFrom) {
        where.push('s.registrationDate >= ?');
        params.push(filters.regFrom);
    }
    if (filters.regTo) {
        where.push('s.registrationDate <= ?');
        params.push(filters.regTo + ' 23:59:59');
    }
    if (filters.lastLoginSince) {
        where.push('(s.lastLoginAt IS NOT NULL AND s.lastLoginAt >= ?)');
        params.push(filters.lastLoginSince);
    }
    if (filters.lastLoginBefore) {
        where.push('(s.lastLoginAt IS NOT NULL AND s.lastLoginAt <= ?)');
        params.push(filters.lastLoginBefore + ' 23:59:59');
    }

    const sql = `
        SELECT
            s.id,
            s.firstName,
            s.lastName,
            s.email,
            s.city,
            s.country,
            s.latitude,
            s.longitude,
            s.registrationDate,
            s.lastLoginAt,
            (SELECT COALESCE(AVG(e.completionPercentage), 0) FROM enrollments e WHERE e.studentId = s.id) AS avgCourseProgress,
            (SELECT COALESCE(SUM(qa.pointsEarned), 0) FROM quiz_attempts qa
                WHERE qa.studentId = s.id AND (qa.status = 'COMPLETED' OR qa.status IS NULL)) AS totalPoints,
            (SELECT COUNT(*) FROM badges b WHERE b.studentId = s.id) AS badgeCount,
            (SELECT COALESCE(AVG(qa.scorePercent), 0) FROM quiz_attempts qa
                WHERE qa.studentId = s.id AND (qa.status = 'COMPLETED' OR qa.status IS NULL)) AS avgQuizScore,
            (SELECT MAX(le.createdAt) FROM student_learning_events le WHERE le.studentId = s.id) AS lastEventAt
        FROM students s
        WHERE ${where.join(' AND ')}
        ORDER BY s.id DESC
    `;
    const [rows] = await db.execute(sql, params);
    let list = rows || [];

    list = list.map((r) => ({
        ...r,
        country: normalizeCountryName(r.country),
        latitude: r.latitude != null && r.latitude !== '' ? Number(r.latitude) : null,
        longitude: r.longitude != null && r.longitude !== '' ? Number(r.longitude) : null,
        avgCourseProgress: Number(r.avgCourseProgress) || 0,
        totalPoints: Number(r.totalPoints) || 0,
        badgeCount: Number(r.badgeCount) || 0,
        avgQuizScore: Number(r.avgQuizScore) || 0
    }));

    if (filters.scoreMin != null) list = list.filter((r) => r.avgQuizScore >= filters.scoreMin);
    if (filters.scoreMax != null) list = list.filter((r) => r.avgQuizScore <= filters.scoreMax);
    if (filters.progressMin != null) list = list.filter((r) => r.avgCourseProgress >= filters.progressMin);
    if (filters.progressMax != null) list = list.filter((r) => r.avgCourseProgress <= filters.progressMax);

    const ad = filters.activeDays || 7;
    if (filters.activeStatus === 'active') list = list.filter((r) => isStudentActive(r, ad));
    if (filters.activeStatus === 'inactive') list = list.filter((r) => !isStudentActive(r, ad));

    return list;
}

function aggregateByCountry(rows, activeDays) {
    const map = new Map();
    for (const r of rows) {
        const key = (r.country && String(r.country).trim()) || 'Inconnu';
        if (!map.has(key)) {
            map.set(key, {
                country: key,
                students: [],
                lat: centroidForCountry(key)[0],
                lng: centroidForCountry(key)[1]
            });
        }
        map.get(key).students.push(r);
    }
    const out = [];
    for (const [, v] of map) {
        const total = v.students.length;
        const active = v.students.filter((s) => isStudentActive(s, activeDays)).length;
        const sumProg = v.students.reduce((a, s) => a + s.avgCourseProgress, 0);
        const sumQuiz = v.students.reduce((a, s) => a + s.avgQuizScore, 0);
        const sumBadges = v.students.reduce((a, s) => a + s.badgeCount, 0);
        out.push({
            country: v.country,
            flagEmoji: countryFlagEmoji(v.country),
            lat: v.lat,
            lng: v.lng,
            totalStudents: total,
            activeStudents: active,
            inactiveStudents: total - active,
            avgProgress: total ? Math.round((sumProg / total) * 10) / 10 : 0,
            avgQuizScore: total ? Math.round((sumQuiz / total) * 10) / 10 : 0,
            totalBadgesEarned: sumBadges,
            cities: aggregateCities(v.students, activeDays),
            sampleStudents: buildStudentSamples(v.students, activeDays),
            locations: aggregateLocations(v.students, activeDays)
        });
    }
    out.sort((a, b) => b.totalStudents - a.totalStudents);
    return out;
}

function aggregateCities(students, activeDays) {
    const m = new Map();
    for (const s of students) {
        const c = (s.city && String(s.city).trim()) || '—';
        if (!m.has(c)) m.set(c, { city: c, count: 0, active: 0 });
        const o = m.get(c);
        o.count++;
        if (isStudentActive(s, activeDays)) o.active++;
    }
    return [...m.values()].sort((a, b) => b.count - a.count).slice(0, 12);
}

function buildStudentSamples(students, activeDays) {
    return [...students]
        .sort((a, b) => {
            const activeDelta = Number(isStudentActive(b, activeDays)) - Number(isStudentActive(a, activeDays));
            if (activeDelta) return activeDelta;
            return (b.totalPoints || 0) - (a.totalPoints || 0);
        })
        .slice(0, 5)
        .map((s) => ({
            id: s.id,
            name: [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || ('Étudiant #' + s.id),
            city: (s.city && String(s.city).trim()) || 'Ville inconnue',
            active: isStudentActive(s, activeDays),
            avgQuizScore: Math.round(Number(s.avgQuizScore || 0) * 10) / 10,
            avgCourseProgress: Math.round(Number(s.avgCourseProgress || 0) * 10) / 10
        }));
}

function aggregateLocations(students, activeDays) {
    const spots = new Map();
    for (const s of students) {
        const lat = Number(s.latitude);
        const lng = Number(s.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        const city = (s.city && String(s.city).trim()) || 'Ville inconnue';
        const key = `${lat.toFixed(3)}|${lng.toFixed(3)}|${city}`;
        if (!spots.has(key)) {
            spots.set(key, {
                city,
                lat,
                lng,
                studentCount: 0,
                activeStudents: 0,
                sampleStudents: []
            });
        }
        const spot = spots.get(key);
        spot.studentCount += 1;
        if (isStudentActive(s, activeDays)) spot.activeStudents += 1;
        if (spot.sampleStudents.length < 4) {
            spot.sampleStudents.push({
                id: s.id,
                name: [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || ('Étudiant #' + s.id),
                active: isStudentActive(s, activeDays)
            });
        }
    }
    return [...spots.values()].sort((a, b) => b.studentCount - a.studentCount).slice(0, 20);
}

const BADGE_THRESHOLDS = [50, 100, 150, 200];

async function getStudentAnalytics(db, filters) {
    const rows = await fetchStudentRowsForAdmin(db, filters);
    const now = new Date();
    const dayMs = 86400000;
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday - 7 * dayMs);
    const startMonth = new Date(startToday - 30 * dayMs);

    const totalStudents = rows.length;
    const activeToday = rows.filter((r) => Date.now() - lastActivityDate(r) <= dayMs).length;
    const newThisWeek = rows.filter((r) => r.registrationDate && new Date(r.registrationDate) >= startWeek).length;
    const newThisMonth = rows.filter((r) => r.registrationDate && new Date(r.registrationDate) >= startMonth).length;

    const [[enr]] = await db.execute('SELECT COUNT(*) AS c FROM enrollments');
    const [[done]] = await db.execute(
        `SELECT COUNT(*) AS c FROM enrollments WHERE completionPercentage >= 100 OR status = 'COMPLETED'`
    );
    const enrollTotal = enr ? Number(enr.c) : 0;
    const enrollDone = done ? Number(done.c) : 0;
    const completionRate = enrollTotal ? Math.round((enrollDone / enrollTotal) * 1000) / 10 : 0;

    const avgProgress = totalStudents ? rows.reduce((a, r) => a + r.avgCourseProgress, 0) / totalStudents : 0;
    const avgQuiz = totalStudents ? rows.reduce((a, r) => a + r.avgQuizScore, 0) / totalStudents : 0;

    const byCountry = aggregateByCountry(rows, 30);
    const topCountries = byCountry.slice(0, 8);

    const popularCourses = [];
    try {
        const [pcRows] = await db.execute(`
            SELECT c.id, c.title, COUNT(e.id) AS enrCount
            FROM enrollments e
            INNER JOIN courses c ON c.id = e.courseId
            GROUP BY c.id, c.title
            ORDER BY enrCount DESC
            LIMIT 8
        `);
        popularCourses.push(...(pcRows || []));
    } catch (_) { /* */ }

    let popularLevels = [];
    try {
        const [lv] = await db.execute(`
            SELECT c.level AS code, c.level AS name, COUNT(e.id) AS enrollmentCount
            FROM enrollments e
            INNER JOIN courses c ON c.id = e.courseId
            WHERE c.level IS NOT NULL AND TRIM(c.level) <> ''
            GROUP BY c.level
            ORDER BY enrollmentCount DESC
            LIMIT 12
        `);
        popularLevels = lv || [];
    } catch (_) {
        try {
            const [lv2] = await db.execute(`SELECT code, name FROM levels ORDER BY sortOrder ASC LIMIT 12`);
            popularLevels = lv2 || [];
        } catch (_) {
            popularLevels = [];
        }
    }

    let badgeDist = [];
    try {
        const [bd] = await db.execute(
            `SELECT badgeLevel, COUNT(*) AS c FROM badges GROUP BY badgeLevel ORDER BY c DESC`
        );
        badgeDist = bd || [];
    } catch (_) { /* */ }

    const retained = totalStudents
        ? Math.round(
              (rows.filter((r) => r.registrationDate && new Date(r.registrationDate) <= startMonth && isStudentActive(r, 30)).length /
                  Math.max(1, rows.filter((r) => r.registrationDate && new Date(r.registrationDate) <= startMonth).length)) *
                  1000
          ) / 10
        : 0;

    return {
        totals: {
            totalStudents,
            activeToday,
            newThisWeek,
            newThisMonth,
            totalEnrollments: enrollTotal,
            completedEnrollments: enrollDone,
            courseCompletionRatePercent: completionRate,
            avgQuizScore: Math.round(avgQuiz * 10) / 10,
            avgStudentProgress: Math.round(avgProgress * 10) / 10,
            retentionApproxPercent: retained
        },
        topCountries,
        popularCourses,
        popularLevels,
        badgeDistribution: badgeDist
    };
}

async function getActivityHeatmap(db) {
    try {
        const [byDow] = await db.execute(`
            SELECT DAYOFWEEK(createdAt) AS dow, COUNT(*) AS c
            FROM student_learning_events
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            GROUP BY DAYOFWEEK(createdAt)
        `);
        const [byHour] = await db.execute(`
            SELECT HOUR(createdAt) AS hr, COUNT(*) AS c
            FROM student_learning_events
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY HOUR(createdAt)
        `);
        const [trend] = await db.execute(`
            SELECT DATE(createdAt) AS d, COUNT(*) AS c
            FROM student_learning_events
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY d ASC
        `);
        return {
            byDayOfWeek: byDow || [],
            byHour: byHour || [],
            trendLast30Days: trend || [],
            note: 'Basé sur student_learning_events (90j / 30j selon série).'
        };
    } catch (e) {
        return { byDayOfWeek: [], byHour: [], trendLast30Days: [], error: e.message };
    }
}

async function getLiveOverview(db) {
    const windowMin = 15;
    let onlineApprox = 0;
    try {
        const [[o]] = await db.execute(
            `
            SELECT COUNT(DISTINCT studentId) AS c FROM student_learning_events
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `,
            [windowMin]
        );
        onlineApprox = o ? Number(o.c) : 0;
    } catch (_) { /* */ }

    let quizzesInProgress = 0;
    try {
        const [[q]] = await db.execute(`SELECT COUNT(*) AS c FROM quiz_sessions WHERE status = 'IN_PROGRESS'`);
        quizzesInProgress = q ? Number(q.c) : 0;
    } catch (_) { /* */ }

    let recentEnrollments = [];
    try {
        const [re] = await db.execute(`
            SELECT e.id, e.studentId, e.courseId, e.enrollmentDate, c.title AS courseTitle,
                   s.firstName, s.lastName
            FROM enrollments e
            LEFT JOIN courses c ON c.id = e.courseId
            LEFT JOIN students s ON s.id = e.studentId
            ORDER BY e.enrollmentDate DESC
            LIMIT 8
        `);
        recentEnrollments = re || [];
    } catch (_) { /* */ }

    let latestQuizzes = [];
    try {
        const [lq] = await db.execute(`
            SELECT qa.id, qa.studentId, qa.quizId, qa.scorePercent, qa.submittedAt, qa.completedAt, q.title AS quizTitle,
                   s.firstName, s.lastName
            FROM quiz_attempts qa
            LEFT JOIN quizzes q ON q.id = qa.quizId
            LEFT JOIN students s ON s.id = qa.studentId
            WHERE qa.status = 'COMPLETED' OR qa.status IS NULL
            ORDER BY COALESCE(qa.submittedAt, qa.completedAt) DESC
            LIMIT 8
        `);
        latestQuizzes = lq || [];
    } catch (_) { /* */ }

    let latestBadges = [];
    try {
        const [lb] = await db.execute(`
            SELECT b.id, b.studentId, b.badgeName, b.badgeLevel, b.earnedDate, s.firstName, s.lastName
            FROM badges b
            LEFT JOIN students s ON s.id = b.studentId
            ORDER BY b.earnedDate DESC, b.id DESC
            LIMIT 8
        `);
        latestBadges = lb || [];
    } catch (_) { /* */ }

    let recentStudents = [];
    try {
        const [rs] = await db.execute(`
            SELECT s.id, s.firstName, s.lastName, s.lastLoginAt,
                   (SELECT MAX(le.createdAt) FROM student_learning_events le WHERE le.studentId = s.id) AS lastEvent
            FROM students s
            ORDER BY GREATEST(COALESCE(s.lastLoginAt, '1970-01-01'), COALESCE((SELECT MAX(le.createdAt) FROM student_learning_events le WHERE le.studentId = s.id), '1970-01-01')) DESC
            LIMIT 10
        `);
        recentStudents = rs || [];
    } catch (_) { /* */ }

    return {
        generatedAt: new Date().toISOString(),
        onlineStudentsApprox: onlineApprox,
        onlineWindowMinutes: windowMin,
        quizzesInProgress,
        recentEnrollments,
        latestCompletedQuizzes: latestQuizzes,
        latestBadges,
        recentlyActiveStudents: recentStudents
    };
}

async function getLeaderboards(db) {
    const [byPoints] = await db.execute(`
        SELECT s.id, s.firstName, s.lastName, s.country,
               COALESCE(SUM(qa.pointsEarned), 0) AS totalPoints
        FROM students s
        LEFT JOIN quiz_attempts qa ON qa.studentId = s.id AND (qa.status = 'COMPLETED' OR qa.status IS NULL)
        GROUP BY s.id, s.firstName, s.lastName, s.country
        ORDER BY totalPoints DESC
        LIMIT 15
    `);
    const [byQuiz] = await db.execute(`
        SELECT s.id, s.firstName, s.lastName,
               COALESCE(AVG(qa.scorePercent), 0) AS avgScore,
               COUNT(qa.id) AS attemptCount
        FROM students s
        INNER JOIN quiz_attempts qa ON qa.studentId = s.id AND (qa.status = 'COMPLETED' OR qa.status IS NULL)
        GROUP BY s.id, s.firstName, s.lastName
        HAVING attemptCount >= 1
        ORDER BY avgScore DESC
        LIMIT 15
    `);
    const [byCompletion] = await db.execute(`
        SELECT s.id, s.firstName, s.lastName,
               COALESCE(AVG(e.completionPercentage), 0) AS avgCompletion,
               COUNT(e.id) AS n
        FROM students s
        INNER JOIN enrollments e ON e.studentId = s.id
        GROUP BY s.id, s.firstName, s.lastName
        HAVING n >= 1
        ORDER BY avgCompletion DESC
        LIMIT 15
    `);
    const [byCountry] = await db.execute(`
        SELECT s.country, COUNT(DISTINCT s.id) AS studentCount,
               COUNT(le.id) AS eventCount
        FROM students s
        LEFT JOIN student_learning_events le ON le.studentId = s.id AND le.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY s.country
        ORDER BY eventCount DESC
        LIMIT 12
    `);
    const [badgeLeaders] = await db.execute(`
        SELECT s.id, s.firstName, s.lastName, s.country, COUNT(b.id) AS badgeCount
        FROM students s
        INNER JOIN badges b ON b.studentId = s.id
        GROUP BY s.id, s.firstName, s.lastName, s.country
        ORDER BY badgeCount DESC
        LIMIT 15
    `);
    return {
        topByPoints: byPoints || [],
        topByAvgQuizScore: byQuiz || [],
        topByCourseCompletion: byCompletion || [],
        topCountriesByActivity: byCountry || [],
        topByBadges: badgeLeaders || []
    };
}

async function getAlerts(db) {
    const alerts = [];
    const rows = await fetchStudentRowsForAdmin(db, parseFilters({}));

    for (const s of rows) {
        const inactiveMs = 7 * 86400000;
        if (Date.now() - lastActivityDate(s) > inactiveMs) {
            alerts.push({
                type: 'INACTIVE_7D',
                severity: 'warning',
                studentId: s.id,
                name: `${s.firstName} ${s.lastName}`,
                message: 'Aucune activité détectée depuis 7 jours (login / événements).'
            });
        }
        const pts = s.totalPoints;
        for (const th of BADGE_THRESHOLDS) {
            if (pts >= th - 8 && pts < th) {
                alerts.push({
                    type: 'NEAR_BADGE',
                    severity: 'info',
                    studentId: s.id,
                    name: `${s.firstName} ${s.lastName}`,
                    message: `Proche du palier ${th} pts (${pts} pts actuels).`
                });
                break;
            }
        }
        if (s.avgCourseProgress >= 85 && s.avgCourseProgress < 100) {
            alerts.push({
                type: 'NEAR_COURSE_COMPLETION',
                severity: 'info',
                studentId: s.id,
                name: `${s.firstName} ${s.lastName}`,
                message: 'Progression cours moyenne élevée (>85%).'
            });
        }
    }

    try {
        const [fails] = await db.execute(`
            SELECT studentId, COUNT(*) AS c
            FROM quiz_attempts
            WHERE (status = 'COMPLETED' OR status IS NULL) AND scorePercent < 50
              AND COALESCE(submittedAt, completedAt) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY studentId
            HAVING c >= 3
        `);
        for (const f of fails || []) {
            const st = rows.find((r) => r.id === f.studentId);
            alerts.push({
                type: 'MULTIPLE_QUIZ_FAIL',
                severity: 'danger',
                studentId: f.studentId,
                name: st ? `${st.firstName} ${st.lastName}` : `#${f.studentId}`,
                message: `${f.c} quiz < 50% sur 30 jours.`
            });
        }
    } catch (_) { /* */ }

    try {
        const [lowRows] = await db.execute(`
            SELECT c.id, c.title,
                   AVG(e.completionPercentage) AS avgPct,
                   COUNT(e.id) AS n
            FROM enrollments e
            INNER JOIN courses c ON c.id = e.courseId
            GROUP BY c.id, c.title
            HAVING n >= 3 AND avgPct < 35
            LIMIT 8
        `);
        for (const low of lowRows || []) {
            alerts.push({
                type: 'LOW_PERFORMING_COURSE',
                severity: 'warning',
                courseId: low.id,
                message: `Cours « ${low.title} » : progression moyenne faible (${Math.round(Number(low.avgPct))}%).`
            });
        }
    } catch (_) { /* */ }

    return { alerts: alerts.slice(0, 80), total: alerts.length };
}

/** Suivi progression : étudiants bloqués, inactifs, proches fin de parcours / badge */
async function getProgressionMonitoring(db, filters) {
    const rows = await fetchStudentRowsForAdmin(db, filters);
    const blocked = rows
        .filter((r) => r.avgQuizScore < 40 && r.avgCourseProgress < 25)
        .slice(0, 40)
        .map((r) => ({
            studentId: r.id,
            name: `${r.firstName} ${r.lastName}`,
            avgQuizScore: r.avgQuizScore,
            avgCourseProgress: r.avgCourseProgress
        }));
    const inactive14 = rows
        .filter((r) => !isStudentActive(r, 14))
        .slice(0, 40)
        .map((r) => ({
            studentId: r.id,
            name: `${r.firstName} ${r.lastName}`,
            lastActivity: new Date(lastActivityDate(r)).toISOString()
        }));
    const nearCompleting = rows
        .filter((r) => r.avgCourseProgress >= 75 && r.avgCourseProgress < 100)
        .slice(0, 40)
        .map((r) => ({
            studentId: r.id,
            name: `${r.firstName} ${r.lastName}`,
            avgCourseProgress: r.avgCourseProgress
        }));
    const nearBadge = [];
    for (const r of rows) {
        const pts = r.totalPoints;
        for (const th of BADGE_THRESHOLDS) {
            if (pts >= th - 15 && pts < th) {
                nearBadge.push({
                    studentId: r.id,
                    name: `${r.firstName} ${r.lastName}`,
                    totalPoints: pts,
                    nextThreshold: th
                });
                break;
            }
        }
    }
    return {
        summary: {
            totalConsidered: rows.length,
            blockedOrStrugglingCount: blocked.length,
            inactive14dCount: inactive14.length,
            nearLevelCompletionCount: nearCompleting.length,
            nearBadgeCount: nearBadge.length
        },
        blockedOrLowProgress: blocked,
        inactive14Days: inactive14,
        nearCompletingLevel: nearCompleting,
        nearUnlockingBadge: nearBadge.slice(0, 40)
    };
}

async function listDistinctCountries(db) {
    try {
        const [rows] = await db.execute(`
            SELECT DISTINCT TRIM(country) AS country
            FROM students
            WHERE country IS NOT NULL AND TRIM(country) <> ''
            ORDER BY country ASC
        `);
        return [...new Set((rows || []).map((r) => normalizeCountryName(r.country)).filter(Boolean))].sort();
    } catch (_) {
        return [];
    }
}

function csvEscape(v) {
    const s = v == null ? '' : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function toCsv(rows, columns) {
    const header = columns.map((c) => c.label).join(';');
    const lines = rows.map((row) => columns.map((c) => csvEscape(row[c.key])).join(';'));
    return '\uFEFF' + header + '\n' + lines.join('\n');
}

module.exports = {
    parseFilters,
    fetchStudentRowsForAdmin,
    aggregateByCountry,
    getStudentAnalytics,
    getActivityHeatmap,
    getLiveOverview,
    getLeaderboards,
    getAlerts,
    getProgressionMonitoring,
    listDistinctCountries,
    toCsv,
    centroidForCountry,
    normalizeCountryName,
    countryFlagEmoji,
    lastActivityDate,
    isStudentActive,
    BADGE_THRESHOLDS
};
