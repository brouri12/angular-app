/**
 * Routes Business Intelligence sous /api/admin via express.Router.
 * Montage avec app.use('/api/admin', ...) AVANT app.use('/api', dbMiddleware) dans xampp-mysql-dashboard.js
 */
const express = require('express');

function mountAdminBusinessApi(app, { apiLog, adminBiz, getDb, PDFDocument }) {
    const router = express.Router();

    function adminDbReady(req, res, next) {
        if (!getDb()) {
            return res.status(503).json({ error: 'Database not ready. Is MySQL (XAMPP) running?' });
        }
        next();
    }

    router.get('/business-filters-meta', async (req, res) => {
        try {
            const db = getDb();
            const [courses] = await db.execute(
                'SELECT id, title, courseCode, level FROM courses ORDER BY title ASC LIMIT 500'
            );
            let courseLevels = [];
            try {
                const [lv] = await db.execute(
                    `SELECT DISTINCT level AS code FROM courses WHERE level IS NOT NULL AND TRIM(level) <> '' ORDER BY level`
                );
                courseLevels = (lv || []).map((r) => r.code);
            } catch (_) {
                courseLevels = [];
            }
            res.json({
                courses: courses || [],
                courseLevels,
                badgeLevels: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/student-map', async (req, res) => {
        try {
            const db = getDb();
            const f = adminBiz.parseFilters(req.query || {});
            const rows = await adminBiz.fetchStudentRowsForAdmin(db, f);
            const countries = adminBiz.aggregateByCountry(rows, f.activeDays || 7);
            res.json({
                generatedAt: new Date().toISOString(),
                filters: f,
                countries,
                studentCount: rows.length
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/student-map/countries', async (req, res) => {
        try {
            const db = getDb();
            const list = await adminBiz.listDistinctCountries(db);
            res.json({ countries: list });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/student-analytics', async (req, res) => {
        try {
            const db = getDb();
            const f = adminBiz.parseFilters(req.query || {});
            const data = await adminBiz.getStudentAnalytics(db, f);
            res.json({ generatedAt: new Date().toISOString(), filters: f, ...data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/activity-heatmap', async (req, res) => {
        try {
            const data = await adminBiz.getActivityHeatmap(getDb());
            res.json({ generatedAt: new Date().toISOString(), ...data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/live-overview', async (req, res) => {
        try {
            const data = await adminBiz.getLiveOverview(getDb());
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/student-leaderboard', async (req, res) => {
        try {
            const data = await adminBiz.getLeaderboards(getDb());
            res.json({ generatedAt: new Date().toISOString(), ...data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/student-alerts', async (req, res) => {
        try {
            const data = await adminBiz.getAlerts(getDb());
            res.json({ generatedAt: new Date().toISOString(), ...data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/student-progression', async (req, res) => {
        try {
            const db = getDb();
            const f = adminBiz.parseFilters(req.query || {});
            const data = await adminBiz.getProgressionMonitoring(db, f);
            res.json({ generatedAt: new Date().toISOString(), filters: f, ...data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/reports', async (req, res) => {
        res.json({
            exports: [
                { id: 'students_by_country', label: 'Étudiants par pays', formats: ['csv', 'pdf'] },
                { id: 'active_inactive', label: 'Actifs vs inactifs (7j)', formats: ['csv', 'pdf'] },
                { id: 'progress', label: 'Progression agrégée', formats: ['csv', 'pdf'] },
                { id: 'quiz_performance', label: 'Performance quiz', formats: ['csv', 'pdf'] },
                { id: 'badges', label: 'Badges', formats: ['csv', 'pdf'] },
                { id: 'growth', label: 'Croissance inscriptions', formats: ['csv', 'pdf'] },
                { id: 'leaderboard', label: 'Leaderboards', formats: ['csv', 'pdf'] },
                { id: 'alerts', label: 'Alertes', formats: ['csv', 'pdf'] }
            ],
            note: 'Exports Excel = CSV UTF-8 avec séparateur ; (ouvre dans Excel).'
        });
    });

    router.get('/reports/export/excel', async (req, res) => {
        try {
            const db = getDb();
            const type = String(req.query.type || 'students_by_country').toLowerCase();
            const f = adminBiz.parseFilters(req.query || {});
            const rows = await adminBiz.fetchStudentRowsForAdmin(db, f);
            const countries = adminBiz.aggregateByCountry(rows, f.activeDays || 7);
            let csv = '';
            const fname = `export-${type}`;

            if (type === 'students_by_country') {
                csv = adminBiz.toCsv(countries, [
                    { key: 'country', label: 'Pays' },
                    { key: 'totalStudents', label: 'Total étudiants' },
                    { key: 'activeStudents', label: 'Actifs' },
                    { key: 'inactiveStudents', label: 'Inactifs' },
                    { key: 'avgProgress', label: 'Progression moyenne %' },
                    { key: 'avgQuizScore', label: 'Score quiz moyen' },
                    { key: 'totalBadgesEarned', label: 'Badges cumulés' }
                ]);
            } else if (type === 'active_inactive') {
                const ad = f.activeDays || 7;
                const list = rows.map((r) => ({
                    id: r.id,
                    nom: `${r.firstName} ${r.lastName}`,
                    email: r.email || '',
                    pays: r.country || '',
                    actif: adminBiz.isStudentActive(r, ad) ? 'oui' : 'non',
                    progression: r.avgCourseProgress,
                    scoreQuiz: r.avgQuizScore
                }));
                csv = adminBiz.toCsv(list, [
                    { key: 'id', label: 'ID' },
                    { key: 'nom', label: 'Nom' },
                    { key: 'email', label: 'Email' },
                    { key: 'pays', label: 'Pays' },
                    { key: 'actif', label: `Actif (${ad}j)` },
                    { key: 'progression', label: 'Progression %' },
                    { key: 'scoreQuiz', label: 'Score quiz moyen' }
                ]);
            } else if (type === 'progress') {
                const list = rows.map((r) => ({
                    id: r.id,
                    nom: `${r.firstName} ${r.lastName}`,
                    pays: r.country || '',
                    progression: r.avgCourseProgress,
                    points: r.totalPoints,
                    badges: r.badgeCount
                }));
                csv = adminBiz.toCsv(list, [
                    { key: 'id', label: 'ID' },
                    { key: 'nom', label: 'Nom' },
                    { key: 'pays', label: 'Pays' },
                    { key: 'progression', label: 'Progression %' },
                    { key: 'points', label: 'Points' },
                    { key: 'badges', label: 'Badges' }
                ]);
            } else if (type === 'quiz_performance') {
                const list = rows.map((r) => ({
                    id: r.id,
                    nom: `${r.firstName} ${r.lastName}`,
                    scoreMoyen: r.avgQuizScore,
                    points: r.totalPoints
                }));
                csv = adminBiz.toCsv(list, [
                    { key: 'id', label: 'ID' },
                    { key: 'nom', label: 'Nom' },
                    { key: 'scoreMoyen', label: 'Score moyen %' },
                    { key: 'points', label: 'Points cumulés' }
                ]);
            } else if (type === 'badges') {
                const [bdRows] = await db.execute(
                    `SELECT b.id, b.studentId, s.firstName, s.lastName, b.badgeName, b.badgeLevel, b.earnedDate
                     FROM badges b
                     LEFT JOIN students s ON s.id = b.studentId
                     ORDER BY b.earnedDate DESC, b.id DESC
                     LIMIT 2000`
                );
                csv = adminBiz.toCsv(bdRows || [], [
                    { key: 'id', label: 'Badge ID' },
                    { key: 'studentId', label: 'Étudiant ID' },
                    { key: 'firstName', label: 'Prénom' },
                    { key: 'lastName', label: 'Nom' },
                    { key: 'badgeName', label: 'Badge' },
                    { key: 'badgeLevel', label: 'Niveau' },
                    { key: 'earnedDate', label: 'Date' }
                ]);
            } else if (type === 'growth') {
                const list = rows.map((r) => ({
                    id: r.id,
                    nom: `${r.firstName} ${r.lastName}`,
                    inscription: r.registrationDate || '',
                    pays: r.country || ''
                }));
                csv = adminBiz.toCsv(list, [
                    { key: 'id', label: 'ID' },
                    { key: 'nom', label: 'Nom' },
                    { key: 'inscription', label: 'Date inscription' },
                    { key: 'pays', label: 'Pays' }
                ]);
            } else if (type === 'leaderboard') {
                const lb = await adminBiz.getLeaderboards(db);
                const flat = (lb.topByPoints || []).map((r, i) => ({
                    rang: i + 1,
                    id: r.id,
                    nom: `${r.firstName} ${r.lastName}`,
                    pays: r.country || '',
                    points: r.totalPoints
                }));
                csv = adminBiz.toCsv(flat, [
                    { key: 'rang', label: 'Rang' },
                    { key: 'id', label: 'ID' },
                    { key: 'nom', label: 'Nom' },
                    { key: 'pays', label: 'Pays' },
                    { key: 'points', label: 'Points' }
                ]);
            } else if (type === 'alerts') {
                const { alerts } = await adminBiz.getAlerts(db);
                csv = adminBiz.toCsv(alerts || [], [
                    { key: 'type', label: 'Type' },
                    { key: 'severity', label: 'Gravité' },
                    { key: 'studentId', label: 'Étudiant ID' },
                    { key: 'name', label: 'Nom' },
                    { key: 'message', label: 'Message' }
                ]);
            } else {
                return res.status(400).json({ error: 'Type de rapport inconnu' });
            }

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${fname}.csv"`);
            res.send(csv);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/reports/export/pdf', async (req, res) => {
        try {
            const db = getDb();
            const type = String(req.query.type || 'summary').toLowerCase();
            const f = adminBiz.parseFilters(req.query || {});
            const rows = await adminBiz.fetchStudentRowsForAdmin(db, f);
            const countries = adminBiz.aggregateByCountry(rows, f.activeDays || 7);
            const analytics = await adminBiz.getStudentAnalytics(db, f);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="rapport-${type}-${Date.now()}.pdf"`);

            const doc = new PDFDocument({ size: 'A4', margin: 48 });
            doc.pipe(res);
            doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Jungle in English — Rapport admin', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Généré le ${new Date().toLocaleString('fr-FR')} — type: ${type}`);
            doc.moveDown();

            const writeTable = (title, lines) => {
                doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(title);
                doc.moveDown(0.3);
                doc.fontSize(9).font('Helvetica').fillColor('#334155');
                lines.forEach((ln) => {
                    doc.text(ln, { width: 500 });
                });
                doc.moveDown();
            };

            if (type === 'summary' || type === 'students_by_country') {
                const t = analytics.totals || {};
                writeTable('Synthèse', [
                    `Étudiants (filtres): ${rows.length}`,
                    `Inscriptions totales: ${t.totalEnrollments ?? '-'}`,
                    `Taux complétion cours: ${t.courseCompletionRatePercent ?? '-'} %`,
                    `Score quiz moyen: ${t.avgQuizScore ?? '-'}`,
                    `Progression moyenne: ${t.avgStudentProgress ?? '-'} %`,
                    `Nouveaux cette semaine: ${t.newThisWeek ?? '-'}`,
                    `Actifs aujourd’hui: ${t.activeToday ?? '-'}`
                ]);
                writeTable(
                    'Top pays',
                    countries.slice(0, 12).map((c) => `${c.country}: ${c.totalStudents} étudiants (${c.activeStudents} actifs)`)
                );
            } else if (type === 'countries') {
                writeTable(
                    'Par pays',
                    countries.map((c) => `${c.country} — total ${c.totalStudents}, actifs ${c.activeStudents}, inactifs ${c.inactiveStudents}, prog. moy. ${c.avgProgress}%`)
                );
            } else if (type === 'active_inactive') {
                const ad = f.activeDays || 7;
                const sample = rows.slice(0, 60).map(
                    (r) =>
                        `${r.id} ${r.firstName} ${r.lastName} — ${adminBiz.isStudentActive(r, ad) ? 'ACTIF' : 'INACTIF'} (${ad}j)`
                );
                writeTable(`Échantillon actif/inactif (max 60)`, sample);
            } else if (type === 'progress') {
                writeTable(
                    'Progression',
                    rows.slice(0, 80).map((r) => `${r.id} ${r.firstName} ${r.lastName} — ${Math.round(r.avgCourseProgress)}% — ${r.totalPoints} pts`)
                );
            } else if (type === 'quiz_performance') {
                writeTable(
                    'Performance quiz',
                    rows.slice(0, 80).map((r) => `${r.id} ${r.firstName} ${r.lastName} — score moyen ${Math.round(r.avgQuizScore)}%`)
                );
            } else if (type === 'alerts') {
                const { alerts } = await adminBiz.getAlerts(db);
                writeTable(
                    'Alertes',
                    (alerts || []).slice(0, 40).map((a) => `[${a.severity}] ${a.type}: ${a.message}`)
                );
            } else if (type === 'leaderboard') {
                const lb = await adminBiz.getLeaderboards(db);
                writeTable(
                    'Top points',
                    (lb.topByPoints || []).slice(0, 20).map((r, i) => `${i + 1}. ${r.firstName} ${r.lastName} — ${r.totalPoints} pts`)
                );
            } else {
                doc.text('Type PDF non reconnu. Utilisez: summary, countries, active_inactive, progress, quiz_performance, alerts, leaderboard.');
            }

            doc.end();
        } catch (error) {
            if (!res.headersSent) res.status(500).json({ error: error.message });
        }
    });

    // IMPORTANT : monter AVANT app.use('/api', dbMiddleware) sur l’app principal
    app.use('/api/admin', apiLog, adminDbReady, router);

    console.log('[API] Module admin Business Intelligence monté sur /api/admin (Router)');
}

module.exports = { mountAdminBusinessApi };
