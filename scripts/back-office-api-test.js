'use strict';

/**
 * Tests de fumée pour les API utilisées par le back-office (xampp-mysql-dashboard.js)
 * et contrôles optionnels des services externes (paiements, microservices).
 *
 * Usage:
 *   node scripts/back-office-api-test.js
 *   node scripts/back-office-api-test.js http://127.0.0.1:8090
 *   API_TEST_BASE=http://127.0.0.1:8090 node scripts/back-office-api-test.js
 *   node scripts/back-office-api-test.js --write   (crée puis supprime salle + groupe de test)
 *
 * Prérequis: Node 18+ (fetch intégré), serveur pi/xampp-mysql-dashboard.js démarré, MySQL (XAMPP).
 */

const DEFAULT_PORTS = [8088, 8089, 8090, 8083];

async function fetchReq(url, options = {}) {
    const timeoutMs = options.timeoutMs ?? 15000;
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            method: options.method || 'GET',
            headers: options.body
                ? { 'Content-Type': 'application/json', ...(options.headers || {}) }
                : { ...(options.headers || {}) },
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            signal: ctrl.signal,
        });
        const text = await res.text();
        let body = null;
        if (text) {
            try {
                body = JSON.parse(text);
            } catch {
                body = text;
            }
        }
        return { res, status: res.status, ok: res.ok, body, raw: text };
    } catch (e) {
        return { error: e, status: 0, ok: false, body: null };
    } finally {
        clearTimeout(id);
    }
}

function firstId(arr) {
    if (!Array.isArray(arr) || !arr.length) return null;
    const id = arr[0].id;
    return id != null ? id : null;
}

async function resolveBase(argv) {
    const fromEnv = process.env.API_TEST_BASE && String(process.env.API_TEST_BASE).trim();
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    const fromArg = argv.find((a) => /^https?:\/\//i.test(a));
    if (fromArg) return fromArg.replace(/\/$/, '');
    for (const port of DEFAULT_PORTS) {
        const base = `http://127.0.0.1:${port}`;
        const r = await fetchReq(`${base}/api/ping`, { timeoutMs: 2500 });
        if (!r.error && r.status === 200) {
            return base;
        }
    }
    throw new Error(
        'Aucun serveur API local trouvé (GET /api/ping). Démarrez pi/xampp-mysql-dashboard.js ou définissez API_TEST_BASE.'
    );
}

async function getJson(base, path) {
    const r = await fetchReq(`${base}${path}`);
    if (r.error) return { ok: false, status: 0, data: null, err: r.error };
    if (!r.ok) return { ok: false, status: r.status, data: r.body, err: null };
    return { ok: true, status: r.status, data: r.body, err: null };
}

async function collectContext(base) {
    const ctx = {
        studentId: null,
        teacherId: null,
        courseId: null,
        levelId: null,
        chapterId: null,
        lessonId: null,
        quizId: null,
        enrollmentId: null,
        questionId: null,
        attemptId: null,
        materialId: null,
        badgeId: null,
        salleId: null,
        groupId: null,
    };

    const [st, te, co, lv, en, qu, bd, sal, grp] = await Promise.all([
        getJson(base, '/api/students'),
        getJson(base, '/api/teachers'),
        getJson(base, '/api/courses'),
        getJson(base, '/api/levels'),
        getJson(base, '/api/enrollments'),
        getJson(base, '/api/questions'),
        getJson(base, '/api/badges'),
        getJson(base, '/api/salles'),
        getJson(base, '/api/groups'),
    ]);

    if (st.ok && Array.isArray(st.data)) ctx.studentId = firstId(st.data);
    if (te.ok && Array.isArray(te.data)) ctx.teacherId = firstId(te.data);
    if (co.ok && Array.isArray(co.data)) ctx.courseId = firstId(co.data);
    if (lv.ok && Array.isArray(lv.data)) ctx.levelId = firstId(lv.data);
    if (en.ok && Array.isArray(en.data)) ctx.enrollmentId = firstId(en.data);
    if (qu.ok && Array.isArray(qu.data)) ctx.questionId = firstId(qu.data);
    if (bd.ok && Array.isArray(bd.data)) ctx.badgeId = firstId(bd.data);
    if (sal.ok && Array.isArray(sal.data)) ctx.salleId = firstId(sal.data);
    if (grp.ok && Array.isArray(grp.data)) ctx.groupId = firstId(grp.data);

    if (ctx.levelId) {
        const ch = await getJson(base, `/api/levels/${ctx.levelId}/chapters`);
        if (ch.ok && Array.isArray(ch.data) && ch.data.length) ctx.chapterId = ch.data[0].id;
    }
    if (ctx.chapterId) {
        const [lessons, quizzes] = await Promise.all([
            getJson(base, `/api/chapters/${ctx.chapterId}/lessons`),
            getJson(base, `/api/chapters/${ctx.chapterId}/quizzes`),
        ]);
        if (lessons.ok && Array.isArray(lessons.data) && lessons.data.length) ctx.lessonId = lessons.data[0].id;
        if (quizzes.ok && Array.isArray(quizzes.data) && quizzes.data.length) ctx.quizId = quizzes.data[0].id;
    }
    if (ctx.studentId) {
        const qa = await getJson(base, `/api/quiz-attempts?studentId=${ctx.studentId}`);
        if (qa.ok && Array.isArray(qa.data) && qa.data.length) ctx.attemptId = qa.data[0].id;
    }
    if (ctx.courseId) {
        const mats = await getJson(base, `/api/courses/${ctx.courseId}/materials`);
        if (mats.ok && Array.isArray(mats.data) && mats.data.length) ctx.materialId = mats.data[0].id;
    }

    return ctx;
}

function expectOk(status, expected) {
    return expected.includes(status);
}

async function runOne(base, t, ctx) {
    const path = typeof t.path === 'function' ? t.path(ctx) : t.path;
    if (path == null) {
        return { ...t, outcome: 'SKIP', detail: 'données exemple manquantes', ms: 0 };
    }
    const url = `${base}${path}`;
    const t0 = Date.now();
    const r = await fetchReq(url, {
        method: t.method || 'GET',
        body: t.body,
        timeoutMs: t.timeoutMs ?? 15000,
    });
    const ms = Date.now() - t0;
    const expected = t.expect || [200];
    if (r.error) {
        if (t.optional) {
            return { ...t, outcome: 'SKIP', detail: `réseau: ${r.error.message}`, ms };
        }
        return { ...t, outcome: 'FAIL', detail: `réseau: ${r.error.message}`, ms };
    }
    if (t.allow404 && r.status === 404) {
        return {
            ...t,
            outcome: 'SKIP',
            detail: '404 — route absente sur ce port (serveur à jour: pi/xampp-mysql-dashboard.js, ou API_TEST_BASE sur le bon port)',
            ms,
        };
    }
    if (expectOk(r.status, expected)) {
        return { ...t, outcome: 'PASS', detail: '', ms };
    }
    if (t.optional) {
        return { ...t, outcome: 'SKIP', detail: `HTTP ${r.status}`, ms };
    }
    return { ...t, outcome: 'FAIL', detail: `HTTP ${r.status}`, ms };
}

function buildStaticTests() {
    const m = {
        health: 'Santé',
        dashboard: 'Dashboard',
        users: 'Utilisateurs',
        courses: 'Cours',
        enrollments: 'Inscriptions',
        notifications: 'Notifications',
        analytics: 'Analytics',
        reviews: 'Reviews',
        bi: 'Business Intel',
        materials: 'PDF / Vidéo',
        questions: 'Manage Questions',
        responses: 'Quiz Responses',
        quiz: 'Quiz',
        badges: 'Award Badge',
        salles: 'Salles',
        groups: 'Groupes',
        forum: 'Forum (local /api/forum)',
        recrutement: 'Recrutement (stub)',
        contracts: 'Contrats API',
    };

    return [
        { module: m.health, name: 'GET /api/ping', path: '/api/ping', expect: [200] },
        { module: m.health, name: 'GET /api/database/info', path: '/api/database/info', expect: [200] },
        { module: m.dashboard, name: 'GET /api/database/info (tables)', path: '/api/database/info', expect: [200] },
        { module: m.users, name: 'GET /api/students', path: '/api/students', expect: [200] },
        { module: m.users, name: 'GET /api/teachers', path: '/api/teachers', expect: [200] },
        { module: m.courses, name: 'GET /api/courses', path: '/api/courses', expect: [200] },
        { module: m.courses, name: 'GET /api/pedagogy/tree', path: '/api/pedagogy/tree', expect: [200] },
        { module: m.courses, name: 'GET /api/levels', path: '/api/levels', expect: [200] },
        { module: m.enrollments, name: 'GET /api/enrollments', path: '/api/enrollments', expect: [200] },
        { module: m.notifications, name: 'GET /api/notifications', path: '/api/notifications', expect: [200] },
        { module: m.questions, name: 'GET /api/questions', path: '/api/questions', expect: [200] },
        { module: m.responses, name: 'GET /api/responses', path: '/api/responses', expect: [200] },
        { module: m.badges, name: 'GET /api/badges', path: '/api/badges', expect: [200] },
        {
            module: m.salles,
            name: 'GET /api/salles',
            path: '/api/salles',
            expect: [200],
            allow404: true,
        },
        {
            module: m.groups,
            name: 'GET /api/groups',
            path: '/api/groups',
            expect: [200],
            allow404: true,
        },
        { module: m.reviews, name: 'GET /api/admin/reviews/overview', path: '/api/admin/reviews/overview', expect: [200] },
        { module: m.analytics, name: 'GET /api/analytics/funnel', path: '/api/analytics/funnel', expect: [200] },
        { module: m.analytics, name: 'GET /api/analytics/avg-completion-time', path: '/api/analytics/avg-completion-time', expect: [200] },
        { module: m.analytics, name: 'GET /api/analytics/questions-most-failed', path: '/api/analytics/questions-most-failed', expect: [200] },
        { module: m.analytics, name: 'GET /api/analytics/quiz-vs-completion', path: '/api/analytics/quiz-vs-completion', expect: [200] },
        { module: m.analytics, name: 'GET /api/analytics/teacher-performance', path: '/api/analytics/teacher-performance', expect: [200] },
        { module: m.analytics, name: 'GET /api/analytics/daily', path: '/api/analytics/daily', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/business-filters-meta', path: '/api/admin/business-filters-meta', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/student-map', path: '/api/admin/student-map', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/student-map/countries', path: '/api/admin/student-map/countries', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/student-analytics', path: '/api/admin/student-analytics', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/activity-heatmap', path: '/api/admin/activity-heatmap', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/live-overview', path: '/api/admin/live-overview', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/student-leaderboard', path: '/api/admin/student-leaderboard', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/student-alerts', path: '/api/admin/student-alerts', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/student-progression', path: '/api/admin/student-progression', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/reports', path: '/api/admin/reports', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/reports/export/excel', path: '/api/admin/reports/export/excel?type=students_by_country', expect: [200] },
        { module: m.bi, name: 'GET /api/admin/reports/export/pdf', path: '/api/admin/reports/export/pdf?type=summary', expect: [200] },
        {
            module: m.forum,
            name: 'GET /api/forum/__ok',
            path: '/api/forum/__ok',
            expect: [200],
            allow404: true,
        },
        {
            module: m.forum,
            name: 'GET /api/forum/forums',
            path: '/api/forum/forums',
            expect: [200],
            allow404: true,
        },
        {
            module: m.forum,
            name: 'GET /api/forum/analyse/statistiques/globales',
            path: '/api/forum/analyse/statistiques/globales',
            expect: [200],
            allow404: true,
        },
        {
            module: m.recrutement,
            name: 'GET /api/recrutement/notifications/unread',
            path: '/api/recrutement/notifications/unread',
            expect: [200],
            allow404: true,
        },
        {
            module: m.recrutement,
            name: 'PATCH /api/recrutement/notifications/read-all',
            path: '/api/recrutement/notifications/read-all',
            method: 'PATCH',
            expect: [204],
            allow404: true,
        },
        { module: m.contracts, name: 'GET /api/quiz-attempts sans studentId → 400', path: '/api/quiz-attempts', expect: [400] },
        { module: m.contracts, name: 'GET /api/students/by-email sans email → 400', path: '/api/students/by-email', expect: [400] },
        { module: m.contracts, name: 'GET /api/history/student sans studentId → 400', path: '/api/history/student', expect: [400] },
    ];
}

function buildDynamicTests(ctx) {
    const m = {
        users: 'Utilisateurs',
        courses: 'Cours',
        enrollments: 'Inscriptions',
        materials: 'PDF / Vidéo',
        quiz: 'Quiz',
        badges: 'Award Badge',
        salles: 'Salles',
        groups: 'Groupes',
    };
    const tests = [];
    if (ctx.studentId) {
        tests.push({
            module: m.users,
            name: `GET /api/students/${ctx.studentId}`,
            path: `/api/students/${ctx.studentId}`,
            expect: [200],
        });
        tests.push({
            module: m.users,
            name: 'GET /api/quiz-attempts?studentId=…',
            path: `/api/quiz-attempts?studentId=${ctx.studentId}`,
            expect: [200],
        });
        tests.push({
            module: m.users,
            name: 'GET /api/student/history?studentId=…',
            path: `/api/student/history?studentId=${ctx.studentId}`,
            expect: [200],
        });
    }
    if (ctx.teacherId) {
        tests.push({
            module: m.users,
            name: `GET /api/teachers/${ctx.teacherId}`,
            path: `/api/teachers/${ctx.teacherId}`,
            expect: [200],
        });
    }
    if (ctx.courseId) {
        tests.push({
            module: m.courses,
            name: `GET /api/courses/${ctx.courseId}`,
            path: `/api/courses/${ctx.courseId}`,
            expect: [200],
        });
        tests.push({
            module: m.courses,
            name: `GET /api/courses/${ctx.courseId}/feedbacks`,
            path: `/api/courses/${ctx.courseId}/feedbacks`,
            expect: [200],
        });
        tests.push({
            module: m.courses,
            name: `GET /api/courses/${ctx.courseId}/rating-summary`,
            path: `/api/courses/${ctx.courseId}/rating-summary`,
            expect: [200],
        });
        tests.push({
            module: m.materials,
            name: `GET /api/courses/${ctx.courseId}/materials`,
            path: `/api/courses/${ctx.courseId}/materials`,
            expect: [200],
        });
    }
    if (ctx.materialId) {
        tests.push({
            module: m.materials,
            name: `GET /api/materials/${ctx.materialId}`,
            path: `/api/materials/${ctx.materialId}`,
            expect: [200],
        });
    }
    if (ctx.enrollmentId) {
        tests.push({
            module: m.enrollments,
            name: `GET /api/enrollments/${ctx.enrollmentId}`,
            path: `/api/enrollments/${ctx.enrollmentId}`,
            expect: [200],
        });
    }
    if (ctx.levelId) {
        tests.push({
            module: m.courses,
            name: `GET /api/levels/${ctx.levelId}`,
            path: `/api/levels/${ctx.levelId}`,
            expect: [200],
        });
        tests.push({
            module: m.courses,
            name: `GET /api/levels/${ctx.levelId}/chapters`,
            path: `/api/levels/${ctx.levelId}/chapters`,
            expect: [200],
        });
    }
    if (ctx.chapterId) {
        tests.push({
            module: m.courses,
            name: `GET /api/chapters/${ctx.chapterId}`,
            path: `/api/chapters/${ctx.chapterId}`,
            expect: [200],
        });
        tests.push({
            module: m.courses,
            name: `GET /api/chapters/${ctx.chapterId}/lessons`,
            path: `/api/chapters/${ctx.chapterId}/lessons`,
            expect: [200],
        });
        tests.push({
            module: m.quiz,
            name: `GET /api/chapters/${ctx.chapterId}/quizzes`,
            path: `/api/chapters/${ctx.chapterId}/quizzes`,
            expect: [200],
        });
    }
    if (ctx.lessonId) {
        tests.push({
            module: m.courses,
            name: `GET /api/lessons/${ctx.lessonId}`,
            path: `/api/lessons/${ctx.lessonId}`,
            expect: [200],
        });
    }
    if (ctx.quizId) {
        tests.push({
            module: m.quiz,
            name: `GET /api/quizzes/${ctx.quizId}`,
            path: `/api/quizzes/${ctx.quizId}`,
            expect: [200],
        });
        tests.push({
            module: m.quiz,
            name: `GET /api/quizzes/${ctx.quizId}/questions`,
            path: `/api/quizzes/${ctx.quizId}/questions`,
            expect: [200],
        });
        tests.push({
            module: m.quiz,
            name: `GET /api/quizzes/${ctx.quizId}/analytics`,
            path: `/api/quizzes/${ctx.quizId}/analytics`,
            expect: [200],
        });
    }
    if (ctx.questionId) {
        tests.push({
            module: m.courses,
            name: `GET /api/questions/${ctx.questionId}`,
            path: `/api/questions/${ctx.questionId}`,
            expect: [200],
        });
    }
    if (ctx.badgeId) {
        tests.push({
            module: m.badges,
            name: `GET /api/badges/${ctx.badgeId}/certificate`,
            path: `/api/badges/${ctx.badgeId}/certificate`,
            expect: [200],
        });
    }
    if (ctx.studentId && ctx.quizId) {
        tests.push({
            module: m.quiz,
            name: 'GET /api/quiz-sessions?studentId&quizId (200 ou 404)',
            path: `/api/quiz-sessions?studentId=${ctx.studentId}&quizId=${ctx.quizId}`,
            expect: [200, 404],
        });
    }
    if (ctx.attemptId && ctx.studentId) {
        tests.push({
            module: m.quiz,
            name: 'GET /api/quiz-attempts/:id/result',
            path: `/api/quiz-attempts/${ctx.attemptId}/result?studentId=${ctx.studentId}`,
            expect: [200, 400, 404],
        });
    }
    return tests;
}

async function runExternalOptional() {
    const m = {
        payments: 'Paiements (8085)',
        forum: 'Forum (microservice 8082, optionnel)',
        planif: 'Planification (8888)',
    };
    const bases = [
        { module: m.payments, name: 'GET http://127.0.0.1:8085/api/payments', url: 'http://127.0.0.1:8085/api/payments' },
        { module: m.forum, name: 'GET http://127.0.0.1:8082/api/forums (exemple)', url: 'http://127.0.0.1:8082/api/forums' },
        { module: m.planif, name: 'GET http://127.0.0.1:8888/api/health (exemple)', url: 'http://127.0.0.1:8888/actuator/health' },
    ];
    const results = [];
    for (const t of bases) {
        const r = await fetchReq(t.url, { timeoutMs: 2000 });
        if (r.error || !r.ok) {
            results.push({ ...t, outcome: 'SKIP', detail: r.error ? r.error.message : `HTTP ${r.status}`, ms: 0 });
        } else {
            results.push({ ...t, outcome: 'PASS', detail: 'service joignable', ms: 0 });
        }
    }
    return results;
}

async function runWriteRoundTrip(base) {
    const results = [];
    const tag = `api-test-${Date.now()}`;
    const t0 = Date.now();
    const createSalle = await fetchReq(`${base}/api/salles`, {
        method: 'POST',
        body: { nomSalle: tag, capacite: 10, localisation: 'Test auto' },
    });
    if (createSalle.error || createSalle.status !== 201) {
        results.push({
            module: 'Écriture',
            name: 'POST /api/salles',
            outcome: 'FAIL',
            detail: createSalle.error ? createSalle.error.message : `HTTP ${createSalle.status}`,
            ms: Date.now() - t0,
        });
    } else {
        const body = createSalle.body || {};
        const sid = body.idSalle ?? body.id;
        const del = await fetchReq(`${base}/api/salles/${sid}`, { method: 'DELETE' });
        results.push({
            module: 'Écriture',
            name: 'POST+DELETE /api/salles',
            outcome: del.status === 200 || del.status === 204 ? 'PASS' : 'FAIL',
            detail: del.status === 200 || del.status === 204 ? '' : `delete HTTP ${del.status}`,
            ms: Date.now() - t0,
        });
    }

    const t1 = Date.now();
    const createGrp = await fetchReq(`${base}/api/groups`, {
        method: 'POST',
        body: { level: 'BEGINNER', studentIds: [] },
    });
    if (createGrp.error || (createGrp.status !== 200 && createGrp.status !== 201)) {
        results.push({
            module: 'Écriture',
            name: 'POST /api/groups',
            outcome: 'FAIL',
            detail: createGrp.error ? createGrp.error.message : `HTTP ${createGrp.status}`,
            ms: Date.now() - t1,
        });
    } else {
        const gid = createGrp.body && (createGrp.body.id || createGrp.body.groupId);
        const delg = await fetchReq(`${base}/api/groups/${gid}`, { method: 'DELETE' });
        results.push({
            module: 'Écriture',
            name: 'POST+DELETE /api/groups',
            outcome: delg.status === 200 || delg.status === 204 ? 'PASS' : 'FAIL',
            detail: delg.status === 200 || delg.status === 204 ? '' : `delete HTTP ${delg.status}`,
            ms: Date.now() - t1,
        });
    }

    const t2 = Date.now();
    const createForum = await fetchReq(`${base}/api/forum/forums`, {
        method: 'POST',
        body: {
            titre: `forum-${tag}`,
            description: 'Test automatique scripts/back-office-api-test.js (min 10 chars)',
            niveau: 'L1',
            groupe: 'TEST',
            cours: 'TEST',
            cree_par: 1,
            statut: 'OUVERT',
        },
    });
    if (createForum.error || createForum.status !== 201) {
        results.push({
            module: 'Écriture',
            name: 'POST /api/forum/forums',
            outcome: 'FAIL',
            detail: createForum.error ? createForum.error.message : `HTTP ${createForum.status}`,
            ms: Date.now() - t2,
        });
    } else {
        const fid = createForum.body && createForum.body.id;
        const delf = await fetchReq(`${base}/api/forum/forums/${fid}`, { method: 'DELETE' });
        results.push({
            module: 'Écriture',
            name: 'POST+DELETE /api/forum/forums',
            outcome: delf.status === 200 || delf.status === 204 ? 'PASS' : 'FAIL',
            detail: delf.status === 200 || delf.status === 204 ? '' : `delete HTTP ${delf.status}`,
            ms: Date.now() - t2,
        });
    }
    return results;
}

function printRow(r) {
    const icon =
        r.outcome === 'PASS' ? '[OK]' : r.outcome === 'FAIL' ? '[KO]' : r.outcome === 'SKIP' ? '[--]' : '[i]';
    const ms = r.ms != null ? ` ${r.ms}ms` : '';
    const det = r.detail ? ` — ${r.detail}` : '';
    const label = r.name || r.url || '';
    console.log(`${icon} [${r.module}] ${label}${ms}${det}`);
}

async function main() {
    const argv = process.argv.slice(2).filter((a) => a !== '--write');
    const doWrite = process.argv.includes('--write');
    const base = await resolveBase(argv);
    console.log(`\nBack-office API — base: ${base}\n`);

    const staticResults = [];
    for (const t of buildStaticTests()) {
        staticResults.push(await runOne(base, t, {}));
    }

    console.log('— Contexte (IDs exemple) —');
    const ctx = await collectContext(base);
    console.log(JSON.stringify(ctx, null, 2));

    const dynamicResults = [];
    for (const t of buildDynamicTests(ctx)) {
        dynamicResults.push(await runOne(base, t, ctx));
    }

    const external = await runExternalOptional();

    let writeResults = [];
    if (doWrite) {
        console.log('\n— Mode --write (round-trip DB) —');
        writeResults = await runWriteRoundTrip(base);
    }

    console.log('\n— Résultats tests API locales —');
    for (const r of staticResults) printRow(r);
    for (const r of dynamicResults) printRow(r);

    console.log('\n— Services externes (optionnel) —');
    for (const r of external) printRow(r);

    if (doWrite) {
        for (const r of writeResults) printRow(r);
    }

    const all = [...staticResults, ...dynamicResults, ...writeResults];
    const fail = all.filter((r) => r.outcome === 'FAIL').length;
    const pass = all.filter((r) => r.outcome === 'PASS').length;
    const skip = all.filter((r) => r.outcome === 'SKIP').length;
    console.log(
        `\nRésumé (API locale + écritures): ${pass} OK, ${fail} échec(s), ${skip} ignoré(s). Les lignes [i] sont informatives.\n`
    );

    if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
