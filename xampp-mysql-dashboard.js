const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
// Charger .env depuis le dossier du script (pi/) pour HUGGINGFACE_API_KEY
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });
if (!process.env.HUGGINGFACE_API_KEY && !process.env.OPENAI_API_KEY) {
    require('dotenv').config({ path: path.join(process.cwd(), '.env') });
}
// Log au demarrage pour verifier la clé coach
(function logCoachEnv() {
    const hf = process.env.HUGGINGFACE_API_KEY;
    const openai = process.env.OPENAI_API_KEY;
    const hasOpenAI = !!(openai && openai.trim());
    const hasHF = !!(hf && hf.trim()) || !!(process.env.HF_TOKEN && String(process.env.HF_TOKEN).trim());
    const hasKey = hasOpenAI || hasHF;
    console.log('[Coach] .env path: ' + envPath + ' (exists: ' + fs.existsSync(envPath) + ')');
    console.log('[Coach] API key: ' + (hasKey ? 'HUGGINGFACE or OPENAI set' : 'NOT SET - add OPENAI_API_KEY= or HUGGINGFACE_API_KEY= in pi/.env'));
    console.log('[Coach] Provider available: OpenAI=' + (hasOpenAI ? 'yes' : 'no') + ' | HF=' + (hasHF ? 'yes' : 'no'));
})();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const nodemailer = require('nodemailer');
const quizCore = require(path.join(__dirname, 'services', 'quizCore'));
const { normalizeQuizAnswer, normalizeBooleanAnswer, scoreQuizAttempt } = quizCore;
const adminBiz = require(path.join(__dirname, 'services', 'adminBusinessModule'));
const { mountAdminBusinessApi } = require(path.join(__dirname, 'services', 'mountAdminBusinessApi'));
const { mountForumApi } = require(path.join(__dirname, 'services', 'mountForumApi'));
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'course-materials');
const UPLOAD_LESSONS_DIR = path.join(__dirname, 'uploads', 'lessons');
const BADGE_CERT_DIR = path.join(__dirname, 'uploads', 'badges', 'certificates');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_LESSONS_DIR)) fs.mkdirSync(UPLOAD_LESSONS_DIR, { recursive: true });
if (!fs.existsSync(BADGE_CERT_DIR)) fs.mkdirSync(BADGE_CERT_DIR, { recursive: true });

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

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
let mailTransporter = null;
let openaiClient = null;

function getOpenAIClient() {
    const key = process.env.OPENAI_API_KEY;
    if (!key || !String(key).trim()) {
        throw new Error('OPENAI_API_KEY not set (add it to pi/.env and restart)');
    }
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: String(key).trim() });
    }
    return openaiClient;
}

function getMailTransporter() {
    if (mailTransporter) return mailTransporter;
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
        return null;
    }
    mailTransporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: { user, pass }
    });
    return mailTransporter;
}

/** mysql2 refuse undefined dans les paramètres nommés (?). SQL NULL = JS null. */
function sanitizeSqlBindings(params) {
    if (!Array.isArray(params)) return params;
    return params.map((v) => (v === undefined ? null : v));
}

/**
 * Enveloppe pool.execute / pool.query et les connexions issues de getConnection(),
 * car le pool promis délègue au cœur mysql2 sans repasser par un seul point d'entrée.
 */
function installMysqlBindSanitizer(pool) {
    if (!pool || pool.__piSqlBindSanitizerInstalled) return;
    pool.__piSqlBindSanitizerInstalled = true;
    const wrapExecuteAndQuery = (target) => {
        if (!target || target.__piSqlBindingsWrapped) return;
        target.__piSqlBindingsWrapped = true;
        const origExecute = target.execute.bind(target);
        target.execute = function boundExecute(sql, params) {
            return origExecute(sql, sanitizeSqlBindings(params));
        };
        const origQuery = target.query.bind(target);
        target.query = function boundQuery(sql, params) {
            return origQuery(sql, sanitizeSqlBindings(params));
        };
    };
    wrapExecuteAndQuery(pool);
    if (typeof pool.getConnection === 'function') {
        const origGetConnection = pool.getConnection.bind(pool);
        pool.getConnection = function getConnectionSanitized() {
            const out = origGetConnection();
            if (out && typeof out.then === 'function') {
                return out.then((conn) => {
                    wrapExecuteAndQuery(conn);
                    return conn;
                });
            }
            wrapExecuteAndQuery(out);
            return out;
        };
    }
}

function escapeHtmlMail(v) {
    return String(v || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function sendEmailToAllStudents(subject, htmlBuilder) {
    try {
        const transporter = getMailTransporter();
        if (!transporter) {
            console.log('[MAIL] SMTP non configuré. Configurez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
            return { sent: 0, skipped: true };
        }
        const [rows] = await db.execute(
            "SELECT firstName, lastName, email FROM students WHERE email IS NOT NULL AND email <> '' AND email LIKE '%@%'"
        );
        const students = (rows || [])
            .map(r => ({
                firstName: String(r.firstName || '').trim(),
                lastName: String(r.lastName || '').trim(),
                email: String(r.email || '').trim()
            }))
            .filter(s => !!s.email);

        if (!students.length) {
            console.log('[MAIL] Aucun email étudiant trouvé.');
            return { sent: 0, skipped: false };
        }

        const from = process.env.MAIL_FROM || process.env.SMTP_USER;
        let sent = 0;
        for (const student of students) {
            const html = typeof htmlBuilder === 'function'
                ? htmlBuilder(student)
                : String(htmlBuilder || '');
            await transporter.sendMail({
                from,
                to: student.email,
                subject,
                html
            });
            sent += 1;
        }
        console.log(`[MAIL] Notification envoyée à ${sent} étudiant(s).`);
        return { sent, skipped: false };
    } catch (error) {
        console.error('[MAIL] Erreur envoi email:', error.message);
        return { sent: 0, skipped: false, error: error.message };
    }
}

async function notifyStudentsNewContent(contentType, title) {
    const safeTitle = String(title || '').trim() || (contentType === 'course' ? 'Nouveau cours' : 'Nouveau chapitre');
    const isCourse = contentType === 'course';
    const subject = isCourse
        ? `Jungle in English - Nouveau cours: ${safeTitle}`
        : `Jungle in English - Nouveau chapitre: ${safeTitle}`;
    const safeTitleEsc = escapeHtmlMail(safeTitle);
    const actionLabel = isCourse ? 'Nouveau cours disponible' : 'Nouveau chapitre disponible';
    const actionText = isCourse
        ? 'Un nouveau cours vient d’être publié'
        : 'Un nouveau chapitre vient d’être ajouté';

    return sendEmailToAllStudents(subject, (student) => {
        const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim();
        const studentName = escapeHtmlMail(fullName || 'Étudiant(e)');
        return `
          <div style="margin:0;padding:0;background:#f3f6fb;font-family:Segoe UI,Arial,sans-serif;color:#1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 14px 40px rgba(15,23,42,0.14);">
                    <tr>
                      <td style="background:linear-gradient(90deg,#00c897,#ff7f50);padding:22px 24px;color:#ffffff;">
                        <div style="font-size:24px;font-weight:800;letter-spacing:0.3px;">Jungle in English</div>
                        <div style="opacity:0.95;font-size:13px;margin-top:4px;">Plateforme E-Learning</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px;">
                        <div style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;">
                          ${actionLabel}
                        </div>
                        <h2 style="margin:16px 0 10px;font-size:22px;line-height:1.25;">Bonjour ${studentName},</h2>
                        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;">
                          ${actionText} sur votre espace étudiant.
                        </p>
                        <div style="margin:16px 0;padding:14px 16px;border:1px solid #bae6fd;background:#f0f9ff;border-radius:12px;">
                          <div style="font-size:12px;color:#0369a1;font-weight:700;letter-spacing:0.2px;">CONTENU AJOUTÉ</div>
                          <div style="font-size:18px;font-weight:800;color:#0f172a;margin-top:4px;">${safeTitleEsc}</div>
                        </div>
                        <p style="margin:0 0 18px;font-size:14px;color:#475569;">
                          Connectez-vous maintenant pour consulter ce nouveau contenu.
                        </p>
                        <a href="http://localhost:8083/front-office/student.html" style="display:inline-block;background:linear-gradient(90deg,#00c897,#ff7f50);color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:10px;font-weight:700;">
                          Ouvrir mon espace étudiant
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
                        Ceci est un email automatique de Jungle in English. Merci de ne pas répondre à ce message.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `;
    });
}

function isLikelyEnglish(text) {
    const s = String(text || '').trim();
    if (!s) return false;
    const words = s.toLowerCase().split(/[^a-zA-Z']+/).filter(Boolean);
    if (!words.length) return false;
    const enHints = ['the', 'is', 'are', 'can', 'how', 'what', 'why', 'when', 'where', 'please', 'english', 'learn', 'course', 'chapter', 'lesson', 'quiz', 'improve', 'practice', 'grammar', 'speaking', 'reading', 'writing'];
    const frHints = ['bonjour', 'salut', 'comment', 'pourquoi', 'chapitre', 'cours', 'le', 'la', 'les', 'est', 'suis', 'avec', 'vous', 'merci', 'francais', 'etudiant', 'ecole'];
    const enCount = words.filter(w => enHints.includes(w)).length;
    const frCount = words.filter(w => frHints.includes(w)).length;
    const asciiLetters = (s.match(/[a-zA-Z]/g) || []).length;
    const nonAsciiLetters = (s.match(/[À-ÿ]/g) || []).length;
    const ratioAscii = asciiLetters / Math.max(1, asciiLetters + nonAsciiLetters);
    const score = (enCount * 2) - (frCount * 2) + (ratioAscii * 2);
    return score >= 1.2;
}

async function askEnglishCoachAI(message, history, resourcesContext) {
    const openAiKey = process.env.OPENAI_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    const googleKey = process.env.GOOGLE_API_KEY;

    const useGoogle = !!googleKey;
    const useOpenAI = !useGoogle && !!openAiKey;
    const useHF = !useGoogle && !useOpenAI && !!hfKey;

    if (!useGoogle && !useOpenAI && !useHF) {
        throw new Error('Aucune clé IA configurée (GOOGLE_API_KEY, OPENAI_API_KEY ou HUGGINGFACE_API_KEY/HF_TOKEN)');
    }

    const safeHistory = Array.isArray(history) ? history.slice(-10).map(h => ({
        role: h && h.role === 'assistant' ? 'assistant' : 'user',
        content: String(h && h.content ? h.content : '').slice(0, 800)
    })).filter(h => h.content.trim().length > 0) : [];

    const systemPrompt =
        'You are an AI assistant for an e-learning platform focused on English learning.\n\n' +
        'STRICT RULES:\n\n' +
        '1. Language:\n' +
        '- You MUST always respond in English only.\n' +
        '- Even if the user writes in French or Arabic, respond in English.\n\n' +
        '2. Allowed topics:\n' +
        'You can ONLY answer questions about:\n' +
        '- English language (grammar, vocabulary, pronunciation)\n' +
        '- Translation to/from English\n' +
        '- Courses on the platform\n' +
        '- Lessons and learning content\n' +
        '- Quizzes and scores\n' +
        '- Prices and subscriptions\n' +
        '- Uploaded documents and course materials\n\n' +
        '3. Out-of-scope questions:\n' +
        'If the question is NOT related to English learning or the platform, you MUST refuse.\n\n' +
        'Use this exact response:\n' +
        '"Sorry, I can only answer questions related to English learning and the platform."\n\n' +
        '4. Unknown information:\n' +
        'If the answer is not found in the platform or documents, DO NOT invent.\n\n' +
        'Use this response:\n' +
        '"Sorry, I couldn\\u0027t find this information in the available resources."\n\n' +
        '5. Teaching behavior:\n' +
        '- Explain English clearly and simply\n' +
        '- Give examples when needed\n' +
        '- Keep answers short and helpful\n\n' +
        '6. Tone:\n' +
        '- Professional\n' +
        '- Clear\n' +
        '- Student-friendly\n\n' +
        '7. Priority:\n' +
        '- First use course content and uploaded documents\n' +
        '- Then general English knowledge';

    const resourcesBlock = (resourcesContext && String(resourcesContext).trim().length)
        ? ('\n\nAVAILABLE PLATFORM RESOURCES (authoritative; do not invent beyond this):\n' + String(resourcesContext).trim())
        : '';

    // --- Google Gemini branch ------------------------------------------------
    if (useGoogle) {
        // Note: certains alias "*-latest" ne sont pas supportés selon la version d'API.
        // Par défaut, utiliser un modèle stable.
        const baseUrl = process.env.GOOGLE_API_URL ||
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        const url = baseUrl + '?key=' + googleKey;

        const historyText = safeHistory.map(h => {
            const speaker = h.role === 'assistant' ? 'Coach' : 'Student';
            return `\n${speaker}: ${h.content}`;
        }).join('');

        const userText = String(message || '').slice(0, 1500);
        const fullText = `${systemPrompt}${resourcesBlock}\n\nConversation so far:${historyText}\n\nStudent question: ${userText}`;

        const payload = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: fullText }]
                }
            ]
        };

        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        try {
            const r = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: ctrl.signal
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
                const msg = data && data.error && data.error.message ? data.error.message : `HTTP ${r.status}`;
                throw new Error(msg);
            }
            const answer =
                data &&
                Array.isArray(data.candidates) &&
                data.candidates[0] &&
                data.candidates[0].content &&
                Array.isArray(data.candidates[0].content.parts)
                    ? data.candidates[0].content.parts.map(p => p.text || '').join('\n').trim()
                    : '';
            if (!answer) throw new Error('Réponse IA vide');
            return answer;
        } catch (e) {
            const msg = e && e.message ? e.message : String(e || 'Google error');
            console.warn('[Coach][Google] error:', msg);
            // fallback vers OpenAI/HF
        } finally {
            clearTimeout(t);
        }
    }

    // --- OpenAI branch (SDK officiel) ----------------------------------------
    if (useOpenAI) {
        const client = getOpenAIClient();
        const model = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
        const input = [
            { role: 'system', content: systemPrompt + resourcesBlock },
            ...safeHistory,
            { role: 'user', content: String(message || '').slice(0, 1500) }
        ];
        const started = Date.now();
        console.log('[Coach][OpenAI] request -> model=' + model + ' inputChars=' + JSON.stringify(input).length);
        try {
            const response = await client.responses.create({ model, input });
            const text = (response && response.output_text) ? String(response.output_text).trim() : '';
            console.log('[Coach][OpenAI] response <- ms=' + (Date.now() - started) + ' chars=' + (text ? text.length : 0));
            if (!text) throw new Error('Réponse IA vide');
            return text;
        } catch (error) {
            const msg = error && error.message ? error.message : String(error || 'OpenAI error');
            console.error('[Coach][OpenAI] error:', msg);
            // Fallback vers HuggingFace si disponible
            if (!(hfKey && String(hfKey).trim())) throw new Error('OpenAI: ' + msg);
            console.warn('[Coach] OpenAI failed; trying HuggingFace fallback...');
        }
    }

    // --- HuggingFace branch (fetch) -----------------------------------------
    const apiKey = hfKey;
    const baseUrl = (process.env.HUGGINGFACE_API_URL || 'https://router.huggingface.co/v1/chat/completions');
    const model = (process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct');

    const payload = {
        model,
        temperature: 0.4,
        messages: [
            { role: 'system', content: systemPrompt + resourcesBlock },
            ...safeHistory,
            { role: 'user', content: String(message || '').slice(0, 1500) }
        ]
    };

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const started = Date.now();
    console.log('[Coach][HF] request -> model=' + model);
    try {
        const r = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
            signal: ctrl.signal
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
            const msg = data && data.error && data.error.message ? data.error.message : `HTTP ${r.status}`;
            throw new Error('HF: ' + msg);
        }
        const answer = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
            ? String(data.choices[0].message.content).trim()
            : '';
        console.log('[Coach][HF] response <- ms=' + (Date.now() - started) + ' chars=' + (answer ? answer.length : 0));
        if (!answer) throw new Error('Réponse IA vide');
        return answer;
    } finally {
        clearTimeout(t);
    }
}

// NOTE: duplicate isLikelyEnglish/askEnglishCoachAI removed.

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
        installMysqlBindSanitizer(db);

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
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
        `CREATE TABLE IF NOT EXISTS course_feedbacks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            courseId INT NOT NULL,
            studentId INT NULL,
            studentName VARCHAR(200) NULL,
            rating TINYINT NOT NULL,
            comment TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE SET NULL,
            CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
            UNIQUE KEY uk_course_student_feedback (courseId, studentId),
            INDEX idx_feedback_course (courseId),
            INDEX idx_feedback_student (studentId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        /* Structure pédagogique: Level → Chapter → Lesson → Quiz */
        `CREATE TABLE IF NOT EXISTS levels (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(10) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            imageUrl VARCHAR(1000) DEFAULT NULL,
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
        `CREATE TABLE IF NOT EXISTS chapter_feedbacks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            chapterId INT NOT NULL,
            studentId INT NULL,
            rating TINYINT NOT NULL,
            comment TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE SET NULL,
            CONSTRAINT chk_chapter_rating_range CHECK (rating >= 1 AND rating <= 5),
            UNIQUE KEY uk_chapter_student_feedback (chapterId, studentId),
            INDEX idx_chapter_feedback_chapter (chapterId),
            INDEX idx_chapter_feedback_student (studentId)
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
            timeLimitSeconds INT DEFAULT NULL,
            maxAttempts INT NULL DEFAULT NULL,
            minDelayMinutesBetweenAttempts INT NULL DEFAULT NULL,
            requireChapterLessonsCompleted TINYINT(1) NOT NULL DEFAULT 1,
            wrongAnswerPenaltyPoints INT NOT NULL DEFAULT 0,
            FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE,
            INDEX idx_chapter (chapterId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS quiz_questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            quizId INT NOT NULL,
            questionText TEXT NOT NULL,
            questionType ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER') DEFAULT 'MULTIPLE_CHOICE',
            points INT DEFAULT 10,
            wrongAnswerPenaltyPoints INT NULL DEFAULT NULL,
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
            status ENUM('IN_PROGRESS','COMPLETED','ABANDONED') DEFAULT 'COMPLETED',
            attemptNumber INT NULL DEFAULT NULL,
            startedAt DATETIME NULL DEFAULT NULL,
            submittedAt DATETIME NULL DEFAULT NULL,
            durationSeconds INT NULL DEFAULT NULL,
            correctCount INT NULL DEFAULT NULL,
            wrongCount INT NULL DEFAULT NULL,
            unansweredCount INT NULL DEFAULT NULL,
            maxPoints INT NULL DEFAULT NULL,
            quizSessionId INT NULL DEFAULT NULL,
            completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
            INDEX idx_student (studentId),
            INDEX idx_quiz (quizId),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        // Sessions quiz (autosave + reprise)
        `CREATE TABLE IF NOT EXISTS quiz_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            studentId INT NOT NULL,
            quizId INT NOT NULL,
            attemptId INT NULL DEFAULT NULL,
            status ENUM('IN_PROGRESS','COMPLETED','ABANDONED') DEFAULT 'IN_PROGRESS',
            startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            submittedAt TIMESTAMP NULL,
            durationSeconds INT DEFAULT 0,
            currentStep INT DEFAULT 0,
            answersJson LONGTEXT,
            lastError VARCHAR(500) DEFAULT NULL,
            INDEX idx_session_student (studentId),
            INDEX idx_session_quiz (quizId),
            INDEX idx_session_status (status),
            INDEX idx_session_attempt (attemptId),
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS quiz_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            attemptId INT NOT NULL,
            questionId INT NOT NULL,
            answerText TEXT,
            isCorrect TINYINT(1) NOT NULL DEFAULT 0,
            earnedPoints INT NOT NULL DEFAULT 0,
            timeSpentSeconds INT NOT NULL DEFAULT 0,
            markedForReview TINYINT(1) NOT NULL DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uk_attempt_question (attemptId, questionId),
            INDEX idx_question (questionId),
            FOREIGN KEY (attemptId) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
            FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS quiz_question_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            quizId INT NOT NULL,
            questionId INT NOT NULL,
            attempts INT NOT NULL DEFAULT 0,
            correctCount INT NOT NULL DEFAULT 0,
            wrongCount INT NOT NULL DEFAULT 0,
            totalTimeSeconds BIGINT NOT NULL DEFAULT 0,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_quiz_question (quizId, questionId),
            INDEX idx_quiz (quizId),
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
            FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS student_points (
            studentId INT PRIMARY KEY,
            totalPoints INT NOT NULL DEFAULT 0,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS course_analytics_daily (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            date DATE NOT NULL,
            enrollments INT NOT NULL DEFAULT 0,
            completions INT NOT NULL DEFAULT 0,
            avg_progress DECIMAL(5,2) DEFAULT NULL,
            avg_grade DECIMAL(5,2) DEFAULT NULL,
            UNIQUE KEY uk_course_date (course_id, date),
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            INDEX idx_date (date),
            INDEX idx_course (course_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(50) NOT NULL DEFAULT 'new_course',
            courseId INT NULL,
            courseTitle VARCHAR(255) NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created (createdAt),
            INDEX idx_type (type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS student_learning_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            studentId INT NOT NULL,
            eventType VARCHAR(50) NOT NULL,
            courseId INT NULL,
            enrollmentId INT NULL,
            quizId INT NULL,
            title VARCHAR(500) NOT NULL,
            detail TEXT NULL,
            scorePercent DECIMAL(5,2) NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            INDEX idx_student_created (studentId, createdAt DESC),
            INDEX idx_student_type (studentId, eventType)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS student_lesson_completion (
            studentId INT NOT NULL,
            lessonId INT NOT NULL,
            completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (studentId, lessonId),
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE,
            INDEX idx_lesson (lessonId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS groups_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            level ENUM('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL DEFAULT 'BEGINNER',
            teacherId INT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE SET NULL,
            INDEX idx_level (level),
            INDEX idx_teacher (teacherId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS group_students (
            groupId INT NOT NULL,
            studentId INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (groupId, studentId),
            FOREIGN KEY (groupId) REFERENCES groups_table(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
            INDEX idx_group (groupId),
            INDEX idx_student (studentId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS salles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nomSalle VARCHAR(120) NOT NULL,
            capacite INT NOT NULL DEFAULT 30,
            localisation VARCHAR(200) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_nom_salle (nomSalle)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS forums (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titre VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            date_creation DATE NOT NULL,
            cree_par INT NOT NULL DEFAULT 1,
            niveau VARCHAR(40) NOT NULL,
            groupe VARCHAR(100) NOT NULL,
            cours VARCHAR(200) NOT NULL,
            statut VARCHAR(20) NOT NULL DEFAULT 'OUVERT',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_forums_niveau (niveau),
            INDEX idx_forums_statut (statut)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS forum_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            forumId INT NOT NULL,
            contenu TEXT NOT NULL,
            date_message DATETIME DEFAULT CURRENT_TIMESTAMP,
            auteurId INT NOT NULL DEFAULT 1,
            type_auteur VARCHAR(20) NOT NULL DEFAULT 'ETUDIANT',
            statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
            FOREIGN KEY (forumId) REFERENCES forums(id) ON DELETE CASCADE,
            INDEX idx_forum_messages_forum (forumId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS forum_message_likes (
            messageId INT NOT NULL,
            utilisateurId INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (messageId, utilisateurId),
            FOREIGN KEY (messageId) REFERENCES forum_messages(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS forum_message_replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            messageParentId INT NOT NULL,
            auteurId INT NOT NULL,
            contenu TEXT NOT NULL,
            dateReponse DATETIME DEFAULT CURRENT_TIMESTAMP,
            statut VARCHAR(40) DEFAULT 'ACTIF',
            FOREIGN KEY (messageParentId) REFERENCES forum_messages(id) ON DELETE CASCADE,
            INDEX idx_reply_parent (messageParentId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS forum_signalements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            messageId INT NOT NULL,
            signalePar INT NOT NULL,
            motif VARCHAR(500),
            description TEXT,
            type VARCHAR(50),
            statut VARCHAR(40) DEFAULT 'EN_ATTENTE',
            traitePar INT NULL,
            commentaireModerateur TEXT NULL,
            dateTraitement DATETIME NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sig_message (messageId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];
    
    for (const table of tables) {
        await db.query(table);
    }
    // Backward compatibility for existing databases
    try {
        await db.query('ALTER TABLE levels ADD COLUMN imageUrl VARCHAR(1000) NULL');
    } catch (_) { /* already exists */ }
    try {
        await db.query('ALTER TABLE enrollments ADD COLUMN lastActivityAt TIMESTAMP NULL DEFAULT NULL');
    } catch (_) { /* already exists */ }
    try {
        await db.query('ALTER TABLE enrollments ADD COLUMN startedAt TIMESTAMP NULL DEFAULT NULL');
    } catch (_) { /* already exists */ }
    try {
        await db.query('ALTER TABLE enrollments ADD COLUMN parcoursContext VARCHAR(500) NULL');
    } catch (_) { /* already exists */ }

    await ensureQuizAdvancedSchema(db);
    await ensureAdminBusinessSchema(db);
    console.log('[DB] Tables et schema quiz avances verifies.');
}

async function ensureAdminBusinessSchema(db) {
    const alters = [
        'ALTER TABLE students ADD COLUMN lastLoginAt DATETIME NULL DEFAULT NULL',
        'ALTER TABLE students ADD INDEX idx_students_last_login (lastLoginAt)'
    ];
    for (const sql of alters) {
        try {
            await db.query(sql);
        } catch (_) {
            /* colonne ou index déjà présent */
        }
    }
}

async function ensureQuizAdvancedSchema(db) {
    const alters = [
        'ALTER TABLE quizzes ADD COLUMN timeLimitSeconds INT DEFAULT NULL',
        'ALTER TABLE quizzes ADD COLUMN minDelayMinutesBetweenAttempts INT NULL DEFAULT NULL',
        'ALTER TABLE quizzes ADD COLUMN requireChapterLessonsCompleted TINYINT(1) NOT NULL DEFAULT 1',
        'ALTER TABLE quizzes ADD COLUMN maxAttempts INT NULL DEFAULT NULL',
        'ALTER TABLE quizzes ADD COLUMN wrongAnswerPenaltyPoints INT NOT NULL DEFAULT 0',
        'ALTER TABLE quiz_questions ADD COLUMN wrongAnswerPenaltyPoints INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_sessions ADD COLUMN attemptId INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_sessions ADD INDEX idx_session_attempt (attemptId)',
        `ALTER TABLE quiz_attempts ADD COLUMN status ENUM('IN_PROGRESS','COMPLETED','ABANDONED') DEFAULT 'COMPLETED'`,
        'ALTER TABLE quiz_attempts ADD COLUMN attemptNumber INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN startedAt DATETIME NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN submittedAt DATETIME NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN durationSeconds INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN correctCount INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN wrongCount INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN unansweredCount INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN maxPoints INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD COLUMN quizSessionId INT NULL DEFAULT NULL',
        'ALTER TABLE quiz_attempts ADD INDEX idx_status (status)'
    ];
    for (const sql of alters) {
        try { await db.query(sql); } catch (_) { /* exists */ }
    }
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
        // Quiz for chapter 1 (durée 15 min, règles métier test)
        await db.query(
            "INSERT IGNORE INTO quizzes (chapterId, title, passingScorePercent, timeLimitSeconds, maxAttempts, requireChapterLessonsCompleted, minDelayMinutesBetweenAttempts) VALUES (1, 'Quiz Chapter 1', 50, 900, 3, 1, 0)"
        );
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

// Admin BI : monté juste avant le 404 /api/* (voir fin des routes) pour garantir l’enregistrement

const COACH_REFUSAL = 'Sorry, I can only answer questions related to English learning and the platform.';
const COACH_EMPTY = 'Please type your question and I will help you.';
const COACH_UNKNOWN = "Sorry, I couldn't find this information in the available resources.";

function isCoachInScope(text) {
    const s = String(text || '').toLowerCase().trim();
    if (!s) return false;
    // translation intents (EN <-> other languages)
    if (/\btranslate\b/.test(s) || /\btranslation\b/.test(s) || /\btradu(i|is|ire|ction)\b/.test(s)) return true;
    // English learning intents
    const english = [
        'english', 'grammar', 'vocabulary', 'pronunciation', 'spelling', 'sentence', 'correct', 'correction',
        'tense', 'past', 'present', 'future', 'modal', 'irregular', 'plural', 'singular',
        'speaking', 'listening', 'reading', 'writing', 'exercise', 'practice', 'quiz', 'score'
    ];
    if (english.some(k => s.includes(k))) return true;
    // platform intents
    const platform = [
        'course', 'courses', 'chapter', 'chapters', 'lesson', 'lessons', 'material', 'materials', 'document', 'documents',
        'upload', 'download', 'subscription', 'plan', 'price', 'pricing', 'payment', 'invoice', 'receipt',
        'badge', 'badges', 'enrollment', 'enroll', 'account', 'login'
    ];
    if (platform.some(k => s.includes(k))) return true;
    return false;
}

function isPlatformResourceQuestion(text) {
    const s = String(text || '').toLowerCase().trim();
    if (!s) return false;
    const platform = [
        'course', 'courses', 'chapter', 'chapters', 'lesson', 'lessons', 'material', 'materials', 'document', 'documents',
        'upload', 'download', 'subscription', 'plan', 'price', 'pricing', 'payment', 'invoice', 'receipt',
        'badge', 'badges', 'enrollment', 'enroll', 'account', 'login', 'formation', 'training'
    ];
    return platform.some(k => s.includes(k));
}

function extractQueryTerms(text) {
    const s = String(text || '').toLowerCase();
    const raw = s.split(/[^a-z0-9]+/i).filter(Boolean);
    const stop = new Set(['the','a','an','and','or','to','of','in','on','for','with','is','are','am','i','you','we','they','he','she','it','my','your','our','their','me']);
    const terms = [];
    for (const w of raw) {
        if (w.length < 3) continue;
        if (stop.has(w)) continue;
        if (!terms.includes(w)) terms.push(w);
        if (terms.length >= 8) break;
    }
    return terms.length ? terms : raw.slice(0, 5);
}

async function fetchPlatformResourcesContext(question) {
    if (!db) return '';
    const q = String(question || '').trim();
    const terms = extractQueryTerms(q);
    const likeAny = terms.map(t => '%' + t + '%');
    const codeMatch = (q.match(/\b[A-Z]{2,10}\d{2,6}\b/) || [])[0] || null; // ex: JAVA101, WEB202
    const parts = [];
    try {
        let courses = [];
        if (codeMatch) {
            const [rows] = await db.execute(
                `SELECT id, courseCode, title, description, price, level, status
                 FROM courses
                 WHERE UPPER(courseCode) = UPPER(?)
                 ORDER BY updatedAt DESC
                 LIMIT 4`,
                [codeMatch]
            );
            courses = rows || [];
        }
        if (!courses.length) {
            // Build OR conditions for each term
            const termConds = terms.map(() => `(title LIKE ? OR description LIKE ? OR courseCode LIKE ?)`).join(' OR ');
            const params = [];
            for (const t of likeAny) {
                params.push(t, t, t);
            }
            const [rows] = await db.execute(
                `SELECT id, courseCode, title, description, price, level, status
                 FROM courses
                 WHERE ${termConds}
                 ORDER BY status='ACTIVE' DESC, updatedAt DESC
                 LIMIT 4`,
                params
            );
            courses = rows || [];
        }
        if (Array.isArray(courses) && courses.length) {
            parts.push('COURSES:');
            for (const c of courses) {
                parts.push(`- [courseId:${c.id}] ${c.title} (${c.courseCode}) | level=${c.level || 'n/a'} | status=${c.status || 'n/a'} | price=${c.price != null ? c.price : 'n/a'}`);
                if (c.description) parts.push(`  description: ${String(c.description).slice(0, 400)}`);
            }
        }
    } catch (e) {
        console.warn('[Coach][DB] courses query failed:', e && e.message ? e.message : e);
    }
    try {
        const [materials] = await db.execute(
            `SELECT m.id, m.courseId, m.type, m.title, m.url, c.title as courseTitle
             FROM course_materials m
             LEFT JOIN courses c ON c.id = m.courseId
             WHERE ${terms.map(() => `(m.title LIKE ? OR c.title LIKE ?)`).join(' OR ')}
             ORDER BY m.courseId ASC, m.orderNumber ASC, m.id ASC
             LIMIT 6`,
            terms.flatMap((_, i) => [likeAny[i], likeAny[i]])
        );
        if (Array.isArray(materials) && materials.length) {
            parts.push('COURSE MATERIALS:');
            for (const m of materials) {
                parts.push(`- [materialId:${m.id}] ${m.title} (${m.type}) for courseId=${m.courseId}${m.courseTitle ? ` (${m.courseTitle})` : ''} | url=${m.url}`);
            }
        }
    } catch (e) {
        console.warn('[Coach][DB] materials query failed:', e && e.message ? e.message : e);
    }
    try {
        const [chapters] = await db.execute(
            `SELECT ch.id, ch.title, ch.levelId
             FROM chapters ch
             WHERE ${terms.map(() => `ch.title LIKE ?`).join(' OR ')}
             ORDER BY ch.levelId ASC, ch.sortOrder ASC, ch.id ASC
             LIMIT 6`,
            likeAny
        );
        if (Array.isArray(chapters) && chapters.length) {
            parts.push('CHAPTERS:');
            for (const ch of chapters) {
                parts.push(`- [chapterId:${ch.id}] ${ch.title} (levelId=${ch.levelId})`);
            }
        }
    } catch (e) {
        console.warn('[Coach][DB] chapters query failed:', e && e.message ? e.message : e);
    }
    try {
        const [lessons] = await db.execute(
            `SELECT l.id, l.chapterId, l.title, l.type, l.url, l.durationMinutes
             FROM lessons l
             WHERE ${terms.map(() => `l.title LIKE ?`).join(' OR ')}
             ORDER BY l.chapterId ASC, l.sortOrder ASC, l.id ASC
             LIMIT 6`,
            likeAny
        );
        if (Array.isArray(lessons) && lessons.length) {
            parts.push('LESSONS:');
            for (const l of lessons) {
                parts.push(`- [lessonId:${l.id}] ${l.title} (${l.type}) chapterId=${l.chapterId} duration=${l.durationMinutes || 0}min | url=${l.url}`);
            }
        }
    } catch (e) {
        console.warn('[Coach][DB] lessons query failed:', e && e.message ? e.message : e);
    }
    try {
        const [quizzes] = await db.execute(
            `SELECT q.id, q.chapterId, q.title, q.passingScorePercent
             FROM quizzes q
             WHERE ${terms.map(() => `q.title LIKE ?`).join(' OR ')}
             ORDER BY q.chapterId ASC, q.id ASC
             LIMIT 6`,
            likeAny
        );
        if (Array.isArray(quizzes) && quizzes.length) {
            parts.push('QUIZZES:');
            for (const q of quizzes) {
                parts.push(`- [quizId:${q.id}] ${q.title} chapterId=${q.chapterId} passing=${q.passingScorePercent || 0}%`);
            }
        }
    } catch (e) {
        console.warn('[Coach][DB] quizzes query failed:', e && e.message ? e.message : e);
    }

    return parts.join('\n').trim();
}

// Chatbot (AVANT le check BDD pour que le coach marche meme sans MySQL)
app.post('/api/chatbot/student', apiLog, async (req, res) => {
    try {
        const userServiceUrl = 'http://localhost:8085';
        const payload = { message: req.body && req.body.message ? req.body.message : '', history: Array.isArray(req.body && req.body.history) ? req.body.history : [] };
        const pathsToTry = ['/api/auth/chatbot/student', '/api/chatbot/student'];
        for (const p of pathsToTry) {
            try {
                const ac = new AbortController();
                const t = setTimeout(() => ac.abort(), 12000);
                const r = await fetch(userServiceUrl + p, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: ac.signal
                });
                clearTimeout(t);
                const j = await r.json().catch(() => ({}));
                const replyText = (j && (j.reply != null ? j.reply : j.error || j.message));
                // N'accepter UserService que si ce n'est pas une erreur "ok=false".
                // Sinon, on laisse le fallback local (OpenAI/HF via pi/.env) répondre.
                const okFromUserService = (j && j.ok !== false);
                if (r.ok && okFromUserService && replyText != null && replyText !== '') {
                    return res.json({ ok: true, reply: String(replyText) });
                }
            } catch (_) {}
        }
        const message = String(payload.message || '').trim();
        const history = payload.history || [];
        if (!message) return res.json({ ok: true, reply: COACH_EMPTY });
        // Enforce scope rules BEFORE any AI call (prevents answers like "instagram").
        if (!isCoachInScope(message)) {
            return res.json({ ok: true, reply: COACH_REFUSAL });
        }
        // If question is about platform resources, fetch DB context first.
        const needsResources = isPlatformResourceQuestion(message);
        const resourcesContext = needsResources ? await fetchPlatformResourcesContext(message) : '';
        if (needsResources && !resourcesContext) {
            return res.json({ ok: true, reply: COACH_UNKNOWN });
        }
        const hasApiKey = !!(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.trim()) ||
            !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
            !!(process.env.HF_TOKEN && process.env.HF_TOKEN.trim());
        let reply;
        if (!hasApiKey) {
            reply = 'To use the coach here: 1) Add one line in the file pi/.env: HUGGINGFACE_API_KEY=your_token (get a free token at huggingface.co/settings/tokens). 2) Restart the server (run DEMARRER_DASHBOARD.ps1 in the pi folder). Or start UserService on port 8085 (DEMARRER_USER_SERVICE.ps1 in UserService folder).';
        } else {
            try {
                reply = await askEnglishCoachAI(message, history, resourcesContext);
            } catch (err) {
                const msg = (err && err.message) ? String(err.message) : '';
                console.warn('[Chatbot] IA error:', msg);
                const debug = String(process.env.CHATBOT_DEBUG || '').toLowerCase() === 'true' || String(process.env.CHATBOT_DEBUG || '') === '1';
                const provider = (msg.includes(':') ? msg.split(':')[0].trim() : '');
                reply = debug
                    ? ('Coach error: ' + (msg || 'unknown_error') + '. (Provider: ' + (provider || 'unknown') + ')')
                    : 'Sorry, the coach could not answer right now. Try again in a moment, or start UserService on port 8085 (DEMARRER_USER_SERVICE.ps1).';
            }
        }
        res.json({ ok: true, reply });
    } catch (error) {
        res.json({ ok: false, reply: error.message || 'Coach unavailable' });
    }
});

// Simple English explanation for a selected word or short phrase
app.post(API_PREFIX + '/english/explain-word', apiLog, async (req, res) => {
    try {
        const text = String(req.body && req.body.text ? req.body.text : '').trim();
        if (!text) {
            return res.status(400).json({ ok: false, error: 'Missing text' });
        }
        if (!isLikelyEnglish(text)) {
            return res.status(400).json({ ok: false, error: 'Please select an English word or short phrase.' });
        }
        const hasApiKey = !!(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.trim()) ||
            !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
            !!(process.env.HF_TOKEN && process.env.HF_TOKEN.trim());
        if (!hasApiKey) {
            return res.status(503).json({
                ok: false,
                error: 'No AI key configured. Add HUGGINGFACE_API_KEY or OPENAI_API_KEY in pi/.env and restart the dashboard.'
            });
        }
        const prompt = 'Explain this English word or very short phrase in simple English for an A2/B1 student in an English language school. ' +
            'Do NOT translate to French. Use one or two short sentences, with a very clear and easy example if helpful.\n\nText: \"' +
            text.slice(0, 120) + '\"';
        const answer = await askEnglishCoachAI(prompt, [], '');
        res.json({ ok: true, text, explanation: answer });
    } catch (error) {
        console.error('[ExplainWord] error:', error && error.message ? error.message : error);
        res.status(500).json({ ok: false, error: 'Explain API unavailable' });
    }
});

// Vérifier que la BDD est prête pour les routes /api (sauf chatbot + explication déjà déclarés au-dessus)
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/chatbot') || req.path.startsWith('/auth/chatbot') || req.path.startsWith('/english/')) return next();
    if (!db) {
        return res.status(503).json({ error: 'Database not ready. Is MySQL (XAMPP) running?' });
    }
    next();
});

app.get(API_PREFIX + '/ping', apiLog, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
        ok: true,
        server: 'xampp-mysql-dashboard',
        message: 'API OK',
        /** Si absent / false : ancienne instance Node, redémarrer pour activer /api/forum */
        forumApi: true,
    });
});

// Forum back-office : monté tôt (évite 404 si une vieille instance n’a pas les routes en bas de fichier)
mountForumApi(app, { apiLog, getDb: () => db });

// Stubs recrutement (back-office AdminNotificationService) — évite 404 si le polling est réactivé
app.get('/api/recrutement/notifications/unread', apiLog, (req, res) => res.json([]));
app.patch('/api/recrutement/notifications/read-all', apiLog, (req, res) => res.status(204).send());
app.patch('/api/recrutement/notifications/:id/read', apiLog, (req, res) => res.status(204).send());

// API recrutement locale (fallback) — évite les 404 quand le microservice dédié n'est pas démarré
const recrutementStore = {
    offres: [],
    candidatures: [],
    nextOffreId: 1,
    nextCandidatureId: 1,
};

function normalizeRecrutementStatut(raw, fallback) {
    const v = (raw || fallback || '').toString().trim().toUpperCase();
    return v || fallback || 'OUVERTE';
}

app.get('/api/recrutement/offres', apiLog, (req, res) => {
    res.json(recrutementStore.offres);
});

app.get('/api/recrutement/offres/statut/:statut', apiLog, (req, res) => {
    const statut = normalizeRecrutementStatut(req.params.statut, 'OUVERTE');
    res.json(recrutementStore.offres.filter((o) => normalizeRecrutementStatut(o.statut, 'OUVERTE') === statut));
});

app.get('/api/recrutement/offres/specialite/:specialite', apiLog, (req, res) => {
    const specialite = (req.params.specialite || '').toString().trim().toLowerCase();
    res.json(
        recrutementStore.offres.filter((o) =>
            ((o.specialite || '').toString().trim().toLowerCase() === specialite)
        )
    );
});

app.get('/api/recrutement/offres/:id', apiLog, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const offre = recrutementStore.offres.find((o) => o.id === id);
    if (!offre) return res.status(404).json({ message: 'Offre introuvable' });
    res.json(offre);
});

app.post('/api/recrutement/offres', apiLog, (req, res) => {
    const body = req.body || {};
    const titre = (body.titre || '').toString().trim();
    const description = (body.description || '').toString().trim();
    const specialite = (body.specialite || '').toString().trim();
    const dateLimite = body.date_limite;
    if (!titre || !description || !specialite || !dateLimite) {
        return res.status(400).json({
            message: 'Champs requis manquants',
            errors: {
                ...(titre ? {} : { titre: 'Le titre est requis' }),
                ...(description ? {} : { description: 'La description est requise' }),
                ...(specialite ? {} : { specialite: 'La spécialité est requise' }),
                ...(dateLimite ? {} : { date_limite: 'La date limite est requise' }),
            },
        });
    }
    const offre = {
        id: recrutementStore.nextOffreId++,
        titre,
        description,
        specialite,
        niveau_requis: body.niveau_requis || 'LICENSE',
        type_contrat: body.type_contrat || 'CDI',
        experience_min: Number(body.experience_min || 0),
        date_publication: body.date_publication || new Date().toISOString().slice(0, 10),
        date_limite: body.date_limite,
        statut: normalizeRecrutementStatut(body.statut, 'OUVERTE'),
        salaire_min: body.salaire_min != null ? Number(body.salaire_min) : null,
        salaire_max: body.salaire_max != null ? Number(body.salaire_max) : null,
        nombre_postes: Number(body.nombre_postes || 1),
    };
    recrutementStore.offres.push(offre);
    res.status(201).json(offre);
});

app.put('/api/recrutement/offres/:id', apiLog, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = recrutementStore.offres.findIndex((o) => o.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Offre introuvable' });
    const current = recrutementStore.offres[idx];
    const next = {
        ...current,
        ...req.body,
        id,
        statut: normalizeRecrutementStatut(req.body?.statut, current.statut || 'OUVERTE'),
    };
    recrutementStore.offres[idx] = next;
    res.json(next);
});

app.patch('/api/recrutement/offres/:id/fermer', apiLog, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const offre = recrutementStore.offres.find((o) => o.id === id);
    if (!offre) return res.status(404).json({ message: 'Offre introuvable' });
    offre.statut = 'FERMEE';
    res.json(offre);
});

app.patch('/api/recrutement/offres/:id/rouvrir', apiLog, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const offre = recrutementStore.offres.find((o) => o.id === id);
    if (!offre) return res.status(404).json({ message: 'Offre introuvable' });
    offre.statut = 'OUVERTE';
    res.json(offre);
});

app.delete('/api/recrutement/offres/:id', apiLog, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const before = recrutementStore.offres.length;
    recrutementStore.offres = recrutementStore.offres.filter((o) => o.id !== id);
    if (recrutementStore.offres.length === before) {
        return res.status(404).json({ message: 'Offre introuvable' });
    }
    recrutementStore.candidatures = recrutementStore.candidatures.filter((c) => c.offreId !== id);
    res.status(204).send();
});

app.get('/api/recrutement/candidatures', apiLog, (req, res) => {
    res.json(recrutementStore.candidatures);
});

app.get('/api/recrutement/candidatures/offre/:offreId', apiLog, (req, res) => {
    const offreId = parseInt(req.params.offreId, 10);
    res.json(recrutementStore.candidatures.filter((c) => c.offreId === offreId));
});

app.post('/api/recrutement/candidatures/offre/:offreId', apiLog, (req, res) => {
    const offreId = parseInt(req.params.offreId, 10);
    const offre = recrutementStore.offres.find((o) => o.id === offreId);
    if (!offre) return res.status(404).json({ message: 'Offre introuvable' });
    const body = req.body || {};
    const email = (body.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email requis' });
    const duplicate = recrutementStore.candidatures.find((c) => c.offreId === offreId && (c.email || '').toLowerCase() === email);
    if (duplicate) {
        return res.status(409).send('Vous avez déjà postulé à cette offre.');
    }
    const cand = {
        id_candidature: recrutementStore.nextCandidatureId++,
        offreId,
        nom_candidat: body.nom_candidat || '',
        prenom_candidat: body.prenom_candidat || '',
        email: body.email || '',
        cv_pdf: body.cv_pdf || null,
        cv_filename: body.cv_filename || null,
        cv_content_type: body.cv_content_type || null,
        lettre_motivation: body.lettre_motivation || '',
        date_candidature: body.date_candidature || new Date().toISOString().slice(0, 10),
        statut: normalizeRecrutementStatut(body.statut, 'EN_ATTENTE'),
    };
    recrutementStore.candidatures.push(cand);
    res.status(201).json(cand);
});

app.patch('/api/recrutement/candidatures/:id/statut', apiLog, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const cand = recrutementStore.candidatures.find((c) => c.id_candidature === id);
    if (!cand) return res.status(404).json({ message: 'Candidature introuvable' });
    cand.statut = normalizeRecrutementStatut(req.query.statut || req.body?.statut, cand.statut || 'EN_ATTENTE');
    res.json(cand);
});

app.get('/api/recrutement/candidatures/:id/cv', apiLog, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const cand = recrutementStore.candidatures.find((c) => c.id_candidature === id);
    if (!cand || !cand.cv_pdf) return res.status(404).send('Aucun CV disponible');
    const contentType = cand.cv_content_type || 'application/pdf';
    const buffer = Buffer.from(cand.cv_pdf, 'base64');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${cand.cv_filename || `cv_${id}.pdf`}"`);
    res.send(buffer);
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
        const lessonId = result.insertId;
        const [rows] = await db.execute('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        const lessonTitle = (rows[0] && (rows[0].title || rows[0].Title)) || title || 'Nouvelle leçon';
        try {
            await db.execute('INSERT INTO notifications (`type`, `courseId`, `courseTitle`) VALUES (?, ?, ?)', ['new_lesson', lessonId, lessonTitle]);
            console.log('[Notif] Nouvelle leçon notifiée:', lessonId, lessonTitle);
        } catch (notifErr) {
            console.error('[Notif] Erreur leçon:', notifErr.message);
        }
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
                const qz = quizRows[0] || null;
                ch.quiz = qz;
                // Questions « étudiant » incluses ici : évite un 2e appel fragile (port, proxy, vieux serveur)
                if (qz && qz.id != null) {
                    try {
                        const [qqRows] = await db.execute(
                            'SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY orderNumber ASC, id ASC',
                            [qz.id]
                        );
                        ch.quiz.questions = (qqRows || []).map(({ correctAnswer, ...rest }) => rest);
                    } catch (_) {
                        ch.quiz.questions = [];
                    }
                }
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
// Récupérer un étudiant par email (pour lier la session après login)
app.get('/api/students/by-email', apiLog, async (req, res) => {
    try {
        const email = (req.query.email || '').toString().trim().toLowerCase();
        if (!email) return res.status(400).json({ error: 'Paramètre email requis' });
        const [rows] = await db.execute('SELECT * FROM students WHERE LOWER(TRIM(email)) = ?', [email]);
        if (!rows.length) return res.status(404).json({ error: 'Étudiant non trouvé pour cet email' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obtenir ou créer un étudiant à partir de l'email (session après login)
app.post('/api/students/ensure', apiLog, async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body || {};
        const em = (email || '').toString().trim();
        if (!em) return res.status(400).json({ error: 'email requis' });
        const [existing] = await db.execute('SELECT * FROM students WHERE LOWER(TRIM(email)) = ?', [em.toLowerCase()]);
        if (existing.length) return res.json(existing[0]);
        const [result] = await db.execute(
            `INSERT INTO students (firstName, lastName, email, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [(firstName || '').toString().trim(), (lastName || '').toString().trim(), em, null, null, null, null]
        );
        const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function logStudentLearningEvent(payload) {
    const { studentId, eventType, courseId, enrollmentId, quizId, title, detail, scorePercent } = payload || {};
    if (!studentId || !eventType || !title) return;
    try {
        const det = detail != null ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : null;
        await db.execute(
            `INSERT INTO student_learning_events (studentId, eventType, courseId, enrollmentId, quizId, title, detail, scorePercent) VALUES (?,?,?,?,?,?,?,?)`,
            [studentId, String(eventType).slice(0, 50), courseId || null, enrollmentId || null, quizId || null, String(title).slice(0, 500), det, scorePercent != null ? Number(scorePercent) : null]
        );
    } catch (e) {
        console.warn('[history] logStudentLearningEvent:', e.message);
    }
}

app.post('/api/students/learning-event', apiLog, async (req, res) => {
    try {
        const { studentId, eventType, title, detail, courseId, quizId, enrollmentId, scorePercent } = req.body || {};
        if (!studentId || !title) return res.status(400).json({ error: 'studentId et title requis' });
        await logStudentLearningEvent({
            studentId: parseInt(studentId, 10),
            eventType: eventType || 'ACTIVITY',
            courseId: courseId != null ? parseInt(courseId, 10) : null,
            quizId: quizId != null ? parseInt(quizId, 10) : null,
            enrollmentId: enrollmentId != null ? parseInt(enrollmentId, 10) : null,
            title,
            detail,
            scorePercent
        });
        res.status(201).json({ ok: true });
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

/** Heartbeat activité (dernière connexion) — appelé depuis l’espace étudiant */
app.post('/api/students/:id/activity-heartbeat', apiLog, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: 'ID invalide' });
        await db.execute('UPDATE students SET lastLoginAt = NOW() WHERE id = ?', [id]);
        res.json({ ok: true, at: new Date().toISOString() });
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

app.get('/api/notifications', apiLog, async (req, res) => {
    try {
        const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 50), 100);
        const [rows] = await db.execute(
            'SELECT id, type, courseId, courseTitle, createdAt FROM notifications ORDER BY createdAt DESC LIMIT ?',
            [limit]
        );
        const raw = Array.isArray(rows) ? rows : [];
        const normalized = raw.map(r => ({
            id: r.id,
            type: r.type || 'new_course',
            courseId: r.courseId ?? r.courseid ?? null,
            courseTitle: String(r.courseTitle ?? r.coursetitle ?? '').trim() || 'Nouveau cours',
            createdAt: r.createdAt ?? r.createdat ?? null
        }));
        if (normalized.length > 0) console.log('[API] GET /api/notifications ->', normalized.length, 'notification(s)');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(normalized);
    } catch (error) {
        console.error('[API] GET /api/notifications:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/notifications/:id', apiLog, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'ID notification invalide' });
        }
        const [result] = await db.execute('DELETE FROM notifications WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }
        res.json({ message: 'Notification supprimée', id });
    } catch (error) {
        console.error('[API] DELETE /api/notifications/:id:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/notifications', apiLog, async (req, res) => {
    try {
        await db.execute('DELETE FROM notifications');
        res.json({ message: 'Toutes les notifications ont été supprimées' });
    } catch (error) {
        console.error('[API] DELETE /api/notifications:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/courses', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.*,
                   ROUND(COALESCE(fs.avgRating, 0), 2) as averageRating,
                   COALESCE(fs.feedbackCount, 0) as feedbackCount
            FROM courses c
            LEFT JOIN (
                SELECT courseId, AVG(rating) as avgRating, COUNT(*) as feedbackCount
                FROM course_feedbacks
                GROUP BY courseId
            ) fs ON fs.courseId = c.id
            ORDER BY c.createdAt DESC
        `);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/courses/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.*,
                   ROUND(COALESCE(fs.avgRating, 0), 2) as averageRating,
                   COALESCE(fs.feedbackCount, 0) as feedbackCount
            FROM courses c
            LEFT JOIN (
                SELECT courseId, AVG(rating) as avgRating, COUNT(*) as feedbackCount
                FROM course_feedbacks
                GROUP BY courseId
            ) fs ON fs.courseId = c.id
            WHERE c.id = ?
        `, [req.params.id]);
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
        const courseId = result.insertId;
        const [rows] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
        const course = rows[0];
        const courseTitle = (course && (course.title || course.Title)) || title || 'Nouveau cours';
        try {
            await db.execute(
                'INSERT INTO notifications (`type`, `courseId`, `courseTitle`) VALUES (?, ?, ?)',
                ['new_course', courseId, courseTitle]
            );
            console.log('[Notif] Nouveau cours notifié pour tous les étudiants:', courseId, courseTitle);
        } catch (notifErr) {
            console.error('[Notif] Erreur:', notifErr.message);
        }
        // Déléguer l'envoi d'emails à UserService (8085)
        try {
            const ac = new AbortController();
            const t = setTimeout(() => ac.abort(), 8000);
            const payload = { type: 'new_course', courseId, courseTitle };
            const r = await fetch('http://localhost:8085/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: ac.signal
            });
            clearTimeout(t);
            if (!r.ok) {
                const txt = await r.text().catch(() => '');
                console.warn('[MAIL] UserService /api/notifications non OK:', r.status, txt);
            } else {
                console.log('[MAIL] UserService notifié pour nouveau cours', courseId);
            }
        } catch (mailErr) {
            console.error('[MAIL] Erreur appel UserService pour nouveau cours:', mailErr.message || mailErr);
        }
        // Envoi direct aux étudiants de la base Node (elearning.students) si SMTP est configuré.
        try {
            await notifyStudentsNewContent('course', courseTitle);
        } catch (mailNodeErr) {
            console.error('[MAIL] Erreur envoi direct nouveau cours:', mailNodeErr.message || mailNodeErr);
        }
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Course rating & feedback
app.get('/api/courses/:courseId/feedbacks', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT f.*,
                    s.firstName as studentFirstName,
                    s.lastName as studentLastName
             FROM course_feedbacks f
             LEFT JOIN students s ON s.id = f.studentId
             WHERE f.courseId = ?
             ORDER BY f.createdAt DESC, f.id DESC`,
            [req.params.courseId]
        );
        const mapped = (rows || []).map(r => ({
            ...r,
            displayName: (r.studentFirstName || r.studentLastName)
                ? `${r.studentFirstName || ''} ${r.studentLastName || ''}`.trim()
                : (r.studentName || 'Étudiant')
        }));
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/courses/:courseId/rating-summary', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT ROUND(COALESCE(AVG(rating), 0), 2) as averageRating,
                    COUNT(*) as feedbackCount
             FROM course_feedbacks
             WHERE courseId = ?`,
            [req.params.courseId]
        );
        const [distributionRows] = await db.execute(
            `SELECT rating, COUNT(*) as count
             FROM course_feedbacks
             WHERE courseId = ?
             GROUP BY rating`,
            [req.params.courseId]
        );
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        (distributionRows || []).forEach(r => {
            const key = Number(r.rating);
            if (distribution[key] != null) distribution[key] = Number(r.count || 0);
        });
        res.json({
            averageRating: Number(rows?.[0]?.averageRating || 0),
            feedbackCount: Number(rows?.[0]?.feedbackCount || 0),
            distribution
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/courses/:courseId/feedbacks', apiLog, async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId, 10);
        const rating = parseInt(req.body.rating, 10);
        const comment = String(req.body.comment || '').trim();
        const studentId = req.body.studentId != null && req.body.studentId !== ''
            ? parseInt(req.body.studentId, 10)
            : null;

        if (!Number.isFinite(courseId) || courseId <= 0) {
            return res.status(400).json({ error: 'courseId invalide' });
        }
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
        }
        if (!comment) {
            return res.status(400).json({ error: 'Le commentaire est requis' });
        }

        const [courseRows] = await db.execute('SELECT id FROM courses WHERE id = ?', [courseId]);
        if (!courseRows.length) return res.status(404).json({ error: 'Cours non trouvé' });

        let studentName = null;
        if (studentId != null && Number.isFinite(studentId)) {
            const [students] = await db.execute('SELECT id, firstName, lastName FROM students WHERE id = ?', [studentId]);
            if (!students.length) return res.status(404).json({ error: 'Étudiant non trouvé' });
            studentName = `${students[0].firstName || ''} ${students[0].lastName || ''}`.trim();
            await db.execute(
                `INSERT INTO course_feedbacks (courseId, studentId, studentName, rating, comment)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment), studentName=VALUES(studentName), updatedAt=NOW()`,
                [courseId, studentId, studentName || null, rating, comment]
            );
        } else {
            await db.execute(
                `INSERT INTO course_feedbacks (courseId, studentId, studentName, rating, comment)
                 VALUES (?, NULL, NULL, ?, ?)`,
                [courseId, rating, comment]
            );
        }

        res.status(201).json({ message: 'Avis enregistré avec succès' });
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
app.get('/api/materials/:id', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, courseId, type, title, url FROM course_materials WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Ressource non trouvée' });
        res.json(rows[0]);
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
        const { code, name, imageUrl, sortOrder } = req.body;
        const [result] = await db.execute('INSERT INTO levels (code, name, imageUrl, sortOrder) VALUES (?, ?, ?, ?)', [code || '', name || '', imageUrl || null, sortOrder != null ? sortOrder : 0]);
        const [rows] = await db.execute('SELECT * FROM levels WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/levels/:id', apiLog, async (req, res) => {
    try {
        const { code, name, imageUrl, sortOrder } = req.body;
        await db.execute('UPDATE levels SET code=?, name=?, imageUrl=?, sortOrder=? WHERE id=?', [code, name, imageUrl || null, sortOrder != null ? sortOrder : 0, req.params.id]);
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
app.post('/api/chapters/:chapterId/feedbacks', apiLog, async (req, res) => {
    try {
        const chapterId = parseInt(req.params.chapterId, 10);
        const rating = parseInt(req.body.rating, 10);
        const comment = String(req.body.comment || '').trim();
        const studentId = req.body.studentId != null && req.body.studentId !== ''
            ? parseInt(req.body.studentId, 10)
            : null;

        if (!Number.isFinite(chapterId) || chapterId <= 0) {
            return res.status(400).json({ error: 'chapterId invalide' });
        }
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
        }
        if (!comment) {
            return res.status(400).json({ error: 'Le commentaire est requis' });
        }
        const [chRows] = await db.execute('SELECT id FROM chapters WHERE id = ?', [chapterId]);
        if (!chRows.length) return res.status(404).json({ error: 'Chapitre non trouvé' });

        if (studentId != null && Number.isFinite(studentId)) {
            const [stRows] = await db.execute('SELECT id FROM students WHERE id = ?', [studentId]);
            if (!stRows.length) return res.status(404).json({ error: 'Étudiant non trouvé' });
            await db.execute(
                `INSERT INTO chapter_feedbacks (chapterId, studentId, rating, comment)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment), updatedAt=NOW()`,
                [chapterId, studentId, rating, comment]
            );
        } else {
            await db.execute(
                `INSERT INTO chapter_feedbacks (chapterId, studentId, rating, comment)
                 VALUES (?, NULL, ?, ?)`,
                [chapterId, rating, comment]
            );
        }
        res.status(201).json({ message: 'Feedback du chapitre enregistré avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/admin/reviews/overview', apiLog, async (req, res) => {
    try {
        const topLimitRaw = parseInt(req.query.top || '8', 10);
        const recentLimitRaw = parseInt(req.query.recent || '10', 10);
        const topLimit = Number.isFinite(topLimitRaw) ? Math.min(30, Math.max(1, topLimitRaw)) : 8;
        const recentLimit = Number.isFinite(recentLimitRaw) ? Math.min(50, Math.max(1, recentLimitRaw)) : 10;

        const [[courseSummary]] = await db.execute(
            `SELECT COUNT(*) as totalCount,
                    ROUND(COALESCE(AVG(rating), 0), 2) as averageRating
             FROM course_feedbacks`
        );
        const [[chapterSummary]] = await db.execute(
            `SELECT COUNT(*) as totalCount,
                    ROUND(COALESCE(AVG(rating), 0), 2) as averageRating
             FROM chapter_feedbacks`
        );

        const [distributionRows] = await db.execute(
            `SELECT rating, COUNT(*) as count
             FROM (
               SELECT rating FROM course_feedbacks
               UNION ALL
               SELECT rating FROM chapter_feedbacks
             ) x
             GROUP BY rating`
        );
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        (distributionRows || []).forEach((r) => {
            const key = Number(r.rating);
            if (distribution[key] != null) distribution[key] = Number(r.count || 0);
        });

        const [topCourses] = await db.execute(
            `SELECT c.id,
                    c.title,
                    c.level,
                    c.status,
                    COUNT(cf.id) as feedbackCount,
                    ROUND(COALESCE(AVG(cf.rating), 0), 2) as averageRating
             FROM courses c
             LEFT JOIN course_feedbacks cf ON cf.courseId = c.id
             GROUP BY c.id
             HAVING COUNT(cf.id) > 0
             ORDER BY feedbackCount DESC, averageRating DESC, c.id DESC
             LIMIT ?`,
            [topLimit]
        );

        const [topChapters] = await db.execute(
            `SELECT ch.id,
                    ch.title,
                    lv.code as levelCode,
                    lv.name as levelName,
                    COUNT(cf.id) as feedbackCount,
                    ROUND(COALESCE(AVG(cf.rating), 0), 2) as averageRating
             FROM chapters ch
             LEFT JOIN levels lv ON lv.id = ch.levelId
             LEFT JOIN chapter_feedbacks cf ON cf.chapterId = ch.id
             GROUP BY ch.id
             HAVING COUNT(cf.id) > 0
             ORDER BY feedbackCount DESC, averageRating DESC, ch.id DESC
             LIMIT ?`,
            [topLimit]
        );

        const [recentCourseFeedbacks] = await db.execute(
            `SELECT 'COURSE' as sourceType,
                    f.id,
                    f.rating,
                    f.comment,
                    f.createdAt,
                    c.id as targetId,
                    c.title as targetTitle,
                    COALESCE(NULLIF(TRIM(CONCAT(s.firstName, ' ', s.lastName)), ''), f.studentName, 'Étudiant') as author
             FROM course_feedbacks f
             LEFT JOIN courses c ON c.id = f.courseId
             LEFT JOIN students s ON s.id = f.studentId
             ORDER BY f.createdAt DESC, f.id DESC
             LIMIT ?`,
            [recentLimit]
        );

        const [recentChapterFeedbacks] = await db.execute(
            `SELECT 'CHAPTER' as sourceType,
                    f.id,
                    f.rating,
                    f.comment,
                    f.createdAt,
                    ch.id as targetId,
                    ch.title as targetTitle,
                    COALESCE(NULLIF(TRIM(CONCAT(s.firstName, ' ', s.lastName)), ''), 'Étudiant') as author
             FROM chapter_feedbacks f
             LEFT JOIN chapters ch ON ch.id = f.chapterId
             LEFT JOIN students s ON s.id = f.studentId
             ORDER BY f.createdAt DESC, f.id DESC
             LIMIT ?`,
            [recentLimit]
        );

        const recentFeedbacks = [...(recentCourseFeedbacks || []), ...(recentChapterFeedbacks || [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, recentLimit);

        const courseCount = Number(courseSummary?.totalCount || 0);
        const chapterCount = Number(chapterSummary?.totalCount || 0);
        const totalCount = courseCount + chapterCount;
        const weightedAvg = totalCount
            ? Number((((Number(courseSummary?.averageRating || 0) * courseCount) + (Number(chapterSummary?.averageRating || 0) * chapterCount)) / totalCount).toFixed(2))
            : 0;

        res.json({
            global: {
                totalFeedbacks: totalCount,
                averageRating: weightedAvg,
                courseFeedbacks: courseCount,
                chapterFeedbacks: chapterCount
            },
            distribution,
            topCourses,
            topChapters,
            recentFeedbacks
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/levels/:levelId/chapters', apiLog, async (req, res) => {
    try {
        const { title, sortOrder } = req.body;
        const [result] = await db.execute('INSERT INTO chapters (levelId, title, sortOrder) VALUES (?, ?, ?)', [req.params.levelId, title || '', sortOrder != null ? sortOrder : 0]);
        const chapterId = result.insertId;
        const [rows] = await db.execute('SELECT * FROM chapters WHERE id = ?', [chapterId]);
        const chapter = rows[0];
        const chapterTitle = (chapter && (chapter.title || chapter.Title)) || title || 'Nouveau chapitre';
        try {
            await db.execute(
                'INSERT INTO notifications (`type`, `courseId`, `courseTitle`) VALUES (?, ?, ?)',
                ['new_chapter', chapterId, chapterTitle]
            );
            console.log('[Notif] Nouveau chapitre notifié pour tous les étudiants:', chapterId, chapterTitle);
        } catch (notifErr) {
            console.error('[Notif] Erreur chapitre:', notifErr.message);
        }
        try {
            await notifyStudentsNewContent('chapter', chapterTitle);
        } catch (mailErr) {
            console.error('[MAIL] Erreur nouveau chapitre:', mailErr.message);
        }
        res.status(201).json(chapter);
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
        const lessonId = result.insertId;
        const [rows] = await db.execute('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        const lessonTitle = (rows[0] && (rows[0].title || rows[0].Title)) || title || 'Nouvelle leçon';
        try {
            await db.execute('INSERT INTO notifications (`type`, `courseId`, `courseTitle`) VALUES (?, ?, ?)', ['new_lesson', lessonId, lessonTitle]);
            console.log('[Notif] Nouvelle leçon notifiée:', lessonId, lessonTitle);
        } catch (notifErr) {
            console.error('[Notif] Erreur leçon:', notifErr.message);
        }
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

app.get('/api/chapters/:chapterId/quizzes', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE chapterId = ? ORDER BY id ASC', [req.params.chapterId]);
        res.json(rows || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/chapters/:chapterId/quiz', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE chapterId = ? ORDER BY id ASC LIMIT 1', [req.params.chapterId]);
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
        const {
            title,
            passingScorePercent,
            timeLimitMinutes,
            maxAttempts,
            minDelayMinutesBetweenAttempts,
            requireChapterLessonsCompleted
        } = req.body || {};
        const tlm = parseInt(timeLimitMinutes, 10);
        if (Number.isNaN(tlm) || tlm < 1) {
            return res.status(400).json({
                error: 'Durée du quiz obligatoire : indiquez timeLimitMinutes (nombre de minutes, minimum 1).',
                code: 'TIME_REQUIRED'
            });
        }
        const timeLimitSeconds = tlm * 60;
        const maxA =
            maxAttempts != null && maxAttempts !== '' && !Number.isNaN(parseInt(maxAttempts, 10))
                ? parseInt(maxAttempts, 10)
                : null;
        const minDel =
            minDelayMinutesBetweenAttempts != null &&
            minDelayMinutesBetweenAttempts !== '' &&
            !Number.isNaN(parseInt(minDelayMinutesBetweenAttempts, 10))
                ? parseInt(minDelayMinutesBetweenAttempts, 10)
                : null;
        const reqCh = requireChapterLessonsCompleted === false || requireChapterLessonsCompleted === 0 ? 0 : 1;
        const [result] = await db.execute(
            `INSERT INTO quizzes (chapterId, title, passingScorePercent, timeLimitSeconds, maxAttempts, minDelayMinutesBetweenAttempts, requireChapterLessonsCompleted)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.params.chapterId,
                title || 'Quiz',
                passingScorePercent != null ? passingScorePercent : 50,
                timeLimitSeconds,
                maxA,
                minDel,
                reqCh
            ]
        );
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/quizzes/:id', apiLog, async (req, res) => {
    try {
        const [curRows] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
        if (!curRows.length) return res.status(404).json({ error: 'Quiz non trouvé' });
        const cur = curRows[0];
        const b = req.body || {};
        const title = b.title != null ? b.title : cur.title != null ? cur.title : 'Quiz';
        const passingScorePercentRaw =
            b.passingScorePercent != null ? b.passingScorePercent : cur.passingScorePercent;
        const passingScorePercent =
            passingScorePercentRaw != null && passingScorePercentRaw !== ''
                ? passingScorePercentRaw
                : 50;
        let timeLimitSeconds =
            cur.timeLimitSeconds != null && cur.timeLimitSeconds !== '' ? cur.timeLimitSeconds : null;
        if (b.timeLimitMinutes != null && b.timeLimitMinutes !== '') {
            const tlm = parseInt(b.timeLimitMinutes, 10);
            if (Number.isNaN(tlm) || tlm < 1) {
                return res.status(400).json({
                    error: 'timeLimitMinutes doit être un nombre ≥ 1.',
                    code: 'TIME_REQUIRED'
                });
            }
            timeLimitSeconds = tlm * 60;
        }
        let maxAttempts =
            cur.maxAttempts !== undefined && cur.maxAttempts !== '' ? cur.maxAttempts : null;
        if (b.maxAttempts !== undefined) {
            maxAttempts =
                b.maxAttempts === null || b.maxAttempts === '' ? null : parseInt(b.maxAttempts, 10);
            if (Number.isNaN(maxAttempts)) maxAttempts = null;
        }
        let minDelayMinutesBetweenAttempts =
            cur.minDelayMinutesBetweenAttempts !== undefined && cur.minDelayMinutesBetweenAttempts !== ''
                ? cur.minDelayMinutesBetweenAttempts
                : null;
        if (b.minDelayMinutesBetweenAttempts !== undefined) {
            minDelayMinutesBetweenAttempts =
                b.minDelayMinutesBetweenAttempts === null || b.minDelayMinutesBetweenAttempts === ''
                    ? null
                    : parseInt(b.minDelayMinutesBetweenAttempts, 10);
            if (Number.isNaN(minDelayMinutesBetweenAttempts)) minDelayMinutesBetweenAttempts = null;
        }
        let requireChapterLessonsCompleted =
            cur.requireChapterLessonsCompleted !== undefined && cur.requireChapterLessonsCompleted !== null
                ? cur.requireChapterLessonsCompleted === false || cur.requireChapterLessonsCompleted === 0
                    ? 0
                    : 1
                : 1;
        if (b.requireChapterLessonsCompleted !== undefined) {
            requireChapterLessonsCompleted =
                b.requireChapterLessonsCompleted === false || b.requireChapterLessonsCompleted === 0 ? 0 : 1;
        }
        await db.execute(
            `UPDATE quizzes SET title=?, passingScorePercent=?, timeLimitSeconds=?, maxAttempts=?, minDelayMinutesBetweenAttempts=?, requireChapterLessonsCompleted=? WHERE id=?`,
            [
                title,
                passingScorePercent,
                timeLimitSeconds,
                maxAttempts,
                minDelayMinutesBetweenAttempts,
                requireChapterLessonsCompleted,
                req.params.id
            ]
        );
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
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
/** Questions sans bonne réponse (parcours étudiant / client) */
app.get('/api/quizzes/:quizId/questions/student', apiLog, async (req, res) => {
    try {
        const qid = parseInt(req.params.quizId, 10);
        if (Number.isNaN(qid)) return res.status(400).json({ error: 'quizId invalide' });
        const [rows] = await db.execute('SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY orderNumber ASC, id ASC', [qid]);
        const safe = (rows || []).map((r) => {
            const { correctAnswer, ...rest } = r;
            return rest;
        });
        res.json(safe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/quizzes/:quizId/questions', apiLog, async (req, res) => {
    try {
        const { questionText, questionType, points, correctAnswer, orderNumber } = req.body || {};
        const qid = parseInt(req.params.quizId, 10);
        if (Number.isNaN(qid)) return res.status(400).json({ error: 'quizId invalide' });
        const [result] = await db.execute(
            'INSERT INTO quiz_questions (quizId, questionText, questionType, points, correctAnswer, orderNumber) VALUES (?, ?, ?, ?, ?, ?)',
            [
                qid,
                questionText != null ? String(questionText) : '',
                questionType != null ? String(questionType) : 'MULTIPLE_CHOICE',
                points != null && points !== '' ? parseInt(points, 10) || 10 : 10,
                correctAnswer != null ? String(correctAnswer) : '',
                orderNumber != null && orderNumber !== '' ? parseInt(orderNumber, 10) || 0 : 0
            ]
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
        const { questionText, questionType, points, correctAnswer, orderNumber } = req.body || {};
        await db.execute('UPDATE quiz_questions SET questionText=?, questionType=?, points=?, correctAnswer=?, orderNumber=? WHERE id=?', [
            questionText != null ? questionText : '',
            questionType != null ? questionType : 'MULTIPLE_CHOICE',
            points != null ? points : 10,
            correctAnswer != null ? correctAnswer : '',
            orderNumber != null ? orderNumber : 0,
            req.params.id
        ]);
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

/** Marquer une leçon comme terminée (requis avant quiz si requireChapterLessonsCompleted). */
app.post('/api/students/:studentId/lessons/:lessonId/complete', apiLog, async (req, res) => {
    try {
        const sid = parseInt(req.params.studentId, 10);
        const lid = parseInt(req.params.lessonId, 10);
        if (Number.isNaN(sid) || Number.isNaN(lid)) {
            return res.status(400).json({ error: 'studentId ou lessonId invalide' });
        }
        const [les] = await db.execute('SELECT id FROM lessons WHERE id = ?', [lid]);
        if (!les.length) return res.status(404).json({ error: 'Leçon introuvable' });
        await db.execute(
            `INSERT INTO student_lesson_completion (studentId, lessonId) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE completedAt = CURRENT_TIMESTAMP`,
            [sid, lid]
        );
        res.json({ ok: true, studentId: sid, lessonId: lid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** Vérification des règles avant de démarrer un quiz (UI étudiant). */
app.get('/api/quizzes/:id/eligibility', apiLog, async (req, res) => {
    try {
        const qid = parseInt(req.params.id, 10);
        const sid = parseInt(req.query.studentId, 10);
        if (Number.isNaN(qid) || Number.isNaN(sid)) {
            return res.status(400).json({ error: 'quiz id et studentId requis' });
        }
        const [[quiz]] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [qid]);
        if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });
        const access = await assertStudentQuizAccess(db, sid, quiz, { ignoreMinDelay: false });
        const total = await countLessonsInChapter(db, quiz.chapterId);
        const done = await countCompletedLessonsForChapter(db, sid, quiz.chapterId);
        const completedAttempts = await countCompletedQuizAttempts(db, sid, qid);
        if (!access.ok) {
            return res.json({
                allowed: false,
                code: access.code,
                message: access.message,
                lessonsDone: access.lessonsDone != null ? access.lessonsDone : done,
                lessonsTotal: access.lessonsTotal != null ? access.lessonsTotal : total,
                retryAfterMs: access.retryAfterMs,
                completedAttempts,
                maxAttempts: quiz.maxAttempts,
                timeLimitSeconds: quiz.timeLimitSeconds
            });
        }
        res.json({
            allowed: true,
            lessonsDone: done,
            lessonsTotal: total,
            completedAttempts,
            maxAttempts: quiz.maxAttempts,
            timeLimitSeconds: quiz.timeLimitSeconds,
            minDelayMinutesBetweenAttempts: quiz.minDelayMinutesBetweenAttempts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Points de l'étudiant
app.get('/api/students/:studentId/points', apiLog, async (req, res) => {
    try {
        // Source de vérité: somme des pointsEarned sur toutes les tentatives de quiz
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(pointsEarned), 0) as totalPoints, MAX(completedAt) as updatedAt
             FROM quiz_attempts
             WHERE studentId = ? AND (status = 'COMPLETED' OR status IS NULL)`,
            [req.params.studentId]
        );
        res.json(rows[0] || { totalPoints: 0, updatedAt: null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Barème de badges (évolutif)
const BADGE_THRESHOLDS = [
    { points: 50, badgeLevel: 'BRONZE', badgeName: 'Bronze Explorer', iconUrl: '🧭', description: 'Reached 50 points through quizzes.' },
    { points: 100, badgeLevel: 'SILVER', badgeName: 'Silver Achiever', iconUrl: '🥈', description: 'Reached 100 points through quizzes.' },
    { points: 150, badgeLevel: 'GOLD', badgeName: 'Gold Master', iconUrl: '🏅', description: 'Reached 150 points through quizzes.' },
    { points: 200, badgeLevel: 'PLATINUM', badgeName: 'Platinum Champion', iconUrl: '💎', description: 'Reached 200 points through quizzes.' }
];

function serverElapsedSecondsSince(startedAt) {
    if (!startedAt) return 0;
    const t = new Date(startedAt).getTime();
    if (Number.isNaN(t)) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / 1000));
}

async function countCompletedQuizAttempts(dbConn, studentId, quizId) {
    const [[row]] = await dbConn.execute(
        `SELECT COUNT(*) AS c FROM quiz_attempts WHERE studentId = ? AND quizId = ? AND (status = 'COMPLETED' OR status IS NULL)`,
        [studentId, quizId]
    );
    return row ? Number(row.c) : 0;
}

async function countLessonsInChapter(dbConn, chapterId) {
    const [[row]] = await dbConn.execute('SELECT COUNT(*) AS c FROM lessons WHERE chapterId = ?', [chapterId]);
    return row ? Number(row.c) : 0;
}

async function countCompletedLessonsForChapter(dbConn, studentId, chapterId) {
    const [[row]] = await dbConn.execute(
        `SELECT COUNT(*) AS c FROM student_lesson_completion slc
         INNER JOIN lessons l ON l.id = slc.lessonId AND l.chapterId = ?
         WHERE slc.studentId = ?`,
        [chapterId, studentId]
    );
    return row ? Number(row.c) : 0;
}

async function getLastCompletedQuizAttemptTimeFixed(dbConn, studentId, quizId) {
    const [rows] = await dbConn.execute(
        `SELECT submittedAt, completedAt FROM quiz_attempts
         WHERE studentId = ? AND quizId = ? AND status = 'COMPLETED'
         ORDER BY COALESCE(submittedAt, completedAt) DESC LIMIT 1`,
        [studentId, quizId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    const d = r.submittedAt || r.completedAt;
    return d ? new Date(d) : null;
}

/**
 * Règles métier : leçons du chapitre terminées, max tentatives, délai entre tentatives.
 */
async function assertStudentQuizAccess(dbConn, studentId, quiz, options = {}) {
    if (!quiz || quiz.id == null) {
        return { ok: false, code: 'QUIZ_NOT_FOUND', message: 'Quiz introuvable.' };
    }
    const qid = quiz.id;
    const chapterId = quiz.chapterId;
    const requireLe =
        quiz.requireChapterLessonsCompleted == null || Number(quiz.requireChapterLessonsCompleted) !== 0;
    if (requireLe && chapterId != null) {
        const total = await countLessonsInChapter(dbConn, chapterId);
        const done = await countCompletedLessonsForChapter(dbConn, studentId, chapterId);
        if (total > 0 && done < total) {
            return {
                ok: false,
                code: 'LESSONS_INCOMPLETE',
                message: 'Terminez toutes les leçons du chapitre avant de passer le quiz.',
                lessonsDone: done,
                lessonsTotal: total
            };
        }
    }
    const completed = await countCompletedQuizAttempts(dbConn, studentId, qid);
    const maxA = quiz.maxAttempts != null ? Number(quiz.maxAttempts) : null;
    if (maxA != null && maxA > 0 && completed >= maxA) {
        return { ok: false, code: 'MAX_ATTEMPTS', message: 'Nombre maximum de tentatives atteint.' };
    }
    if (!options.ignoreMinDelay) {
        const minM = quiz.minDelayMinutesBetweenAttempts != null ? Number(quiz.minDelayMinutesBetweenAttempts) : 0;
        if (minM > 0) {
            const lastAt = await getLastCompletedQuizAttemptTimeFixed(dbConn, studentId, qid);
            if (lastAt) {
                const waitMs = minM * 60 * 1000;
                const elapsed = Date.now() - lastAt.getTime();
                if (elapsed < waitMs) {
                    const remainMin = Math.ceil((waitMs - elapsed) / 60000);
                    return {
                        ok: false,
                        code: 'MIN_DELAY',
                        message: `Délai entre deux tentatives : attendez encore environ ${remainMin} minute(s).`,
                        retryAfterMs: waitMs - elapsed
                    };
                }
            }
        }
    }
    return { ok: true };
}

async function replaceQuizAnswersRows(dbConn, attemptId, scored, answers) {
    await dbConn.execute('DELETE FROM quiz_answers WHERE attemptId = ?', [attemptId]);
    const metaByQ = new Map();
    for (const a of answers || []) {
        if (!a || a.questionId == null) continue;
        metaByQ.set(String(a.questionId), {
            timeSpentSeconds: Math.max(0, parseInt(a.timeSpentSeconds || 0, 10) || 0),
            markedForReview: !!a.markedForReview
        });
    }
    for (const pq of scored.perQuestion) {
        const m = metaByQ.get(String(pq.questionId)) || {};
        const ts = m.timeSpentSeconds != null ? m.timeSpentSeconds : (pq.timeSpentSeconds || 0);
        const mr = m.markedForReview != null ? !!m.markedForReview : !!pq.markedForReview;
        await dbConn.execute(
            `INSERT INTO quiz_answers (attemptId, questionId, answerText, isCorrect, earnedPoints, timeSpentSeconds, markedForReview)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                attemptId,
                pq.questionId,
                String(pq.userAnswer != null ? pq.userAnswer : ''),
                pq.correct ? 1 : 0,
                pq.earnedPoints != null ? Number(pq.earnedPoints) : 0,
                ts,
                mr ? 1 : 0
            ]
        );
    }
}

async function incrementQuizQuestionStats(dbConn, quizId, perQuestion) {
    for (const pq of perQuestion) {
        if (!pq || pq.questionId == null) continue;
        const incC = pq.correct ? 1 : 0;
        const incW = pq.correct ? 0 : 1;
        const t = Math.max(0, pq.timeSpentSeconds || 0);
        await dbConn.execute(
            `INSERT INTO quiz_question_stats (quizId, questionId, attempts, correctCount, wrongCount, totalTimeSeconds)
             VALUES (?, ?, 1, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               attempts = attempts + 1,
               correctCount = correctCount + VALUES(correctCount),
               wrongCount = wrongCount + VALUES(wrongCount),
               totalTimeSeconds = totalTimeSeconds + VALUES(totalTimeSeconds)`,
            [quizId, pq.questionId, incC, incW, t]
        );
    }
}

async function awardBadgesAfterQuiz(dbConn, studentId, pointsEarnedThisQuiz) {
    const [[row]] = await dbConn.execute(
        `SELECT COALESCE(SUM(pointsEarned), 0) as totalPoints
         FROM quiz_attempts
         WHERE studentId = ? AND (status = 'COMPLETED' OR status IS NULL)`,
        [studentId]
    );
    const totalPoints = row ? Number(row.totalPoints) : 0;
    const newBadges = [];
    for (const t of BADGE_THRESHOLDS) {
        if (totalPoints >= t.points) {
            const [existing] = await dbConn.execute(
                'SELECT id FROM badges WHERE studentId = ? AND badgeLevel = ?',
                [studentId, t.badgeLevel]
            );
            if (!existing.length) {
                const [studentRows] = await dbConn.execute('SELECT city, country, latitude, longitude FROM students WHERE id = ?', [studentId]);
                const s = studentRows[0];
                await dbConn.execute(
                    `INSERT INTO badges 
                        (studentId, badgeName, badgeType, iconUrl, badgeLevel, criteriaMet, description, earnedDate, city, country, latitude, longitude)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
                    [
                        studentId,
                        t.badgeName,
                        'QUIZ_MASTER',
                        t.iconUrl || null,
                        t.badgeLevel,
                        String(t.points),
                        t.description || ('Reached ' + t.points + ' points'),
                        s?.city || null,
                        s?.country || null,
                        s?.latitude ?? null,
                        s?.longitude ?? null
                    ]
                );
                newBadges.push({
                    badgeLevel: t.badgeLevel,
                    badgeName: t.badgeName,
                    earnedPoints: pointsEarnedThisQuiz
                });
            }
        }
    }
    for (const b of newBadges) {
        await logStudentLearningEvent({
            studentId,
            eventType: 'BADGE_EARNED',
            title: 'Badge obtenu : ' + (b.badgeName || b.badgeLevel),
            detail: b
        });
    }
    return { totalPoints, newBadges };
}

async function syncDraftQuizAnswers(dbConn, attemptId, answers) {
    for (const a of answers || []) {
        if (!a || a.questionId == null) continue;
        const ts = Math.max(0, parseInt(a.timeSpentSeconds || 0, 10) || 0);
        const mr = a.markedForReview ? 1 : 0;
        const txt = a.answerText != null ? String(a.answerText) : '';
        await dbConn.execute(
            `INSERT INTO quiz_answers (attemptId, questionId, answerText, isCorrect, earnedPoints, timeSpentSeconds, markedForReview)
             VALUES (?, ?, ?, 0, 0, ?, ?)
             ON DUPLICATE KEY UPDATE answerText = VALUES(answerText), timeSpentSeconds = VALUES(timeSpentSeconds), markedForReview = VALUES(markedForReview)`,
            [attemptId, a.questionId, txt, ts, mr]
        );
    }
}

app.post('/api/quiz-attempts', apiLog, async (req, res) => {
    try {
        const { studentId, quizId, answers, durationSeconds } = req.body; // answers: [{ questionId, answerText, timeSpentSeconds?, markedForReview? }]
        if (!studentId || !quizId) {
            res.status(400).json({ error: 'studentId et quizId requis' });
            return;
        }
        const sid = parseInt(studentId, 10);
        const qid = parseInt(quizId, 10);
        if (Number.isNaN(sid) || Number.isNaN(qid)) {
            res.status(400).json({ error: 'studentId/quizId invalides' });
            return;
        }
        const [[quiz]] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [qid]);
        if (!quiz) {
            res.status(404).json({ error: 'Quiz non trouvé' });
            return;
        }
        const access = await assertStudentQuizAccess(db, sid, quiz);
        if (!access.ok) {
            res.status(403).json({
                error: access.message,
                code: access.code,
                lessonsDone: access.lessonsDone,
                lessonsTotal: access.lessonsTotal,
                retryAfterMs: access.retryAfterMs
            });
            return;
        }
        const completed = await countCompletedQuizAttempts(db, sid, qid);
        const [questions] = await db.execute('SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY orderNumber ASC, id ASC', [qid]);
        if (!questions.length) {
            res.status(400).json({ error: 'Aucune question dans ce quiz' });
            return;
        }
        const scored = scoreQuizAttempt(questions, answers, { quizPenaltyPoints: quiz.wrongAnswerPenaltyPoints });
        const dur = Math.max(0, parseInt(durationSeconds || 0, 10) || 0);
        const attemptNum = completed + 1;
        const [insAttempt] = await db.execute(
            `INSERT INTO quiz_attempts (
                studentId, quizId, scorePercent, pointsEarned, status, attemptNumber, startedAt, submittedAt,
                durationSeconds, correctCount, wrongCount, unansweredCount, maxPoints
            ) VALUES (?, ?, ?, ?, 'COMPLETED', ?, NOW(), NOW(), ?, ?, ?, ?, ?)`,
            [
                sid,
                qid,
                scored.scorePercent,
                scored.earnedPoints,
                attemptNum,
                dur,
                scored.correctCount,
                scored.wrongCount,
                scored.unansweredCount,
                scored.maxPoints
            ]
        );
        const attemptId = insAttempt.insertId;
        await replaceQuizAnswersRows(db, attemptId, scored, answers);
        await incrementQuizQuestionStats(db, qid, scored.perQuestion);
        await db.execute(
            'INSERT INTO student_points (studentId, totalPoints) VALUES (?, ?) ON DUPLICATE KEY UPDATE totalPoints = totalPoints + ?, updatedAt = NOW()',
            [sid, scored.earnedPoints, scored.earnedPoints]
        );
        const { totalPoints, newBadges } = await awardBadgesAfterQuiz(db, sid, scored.earnedPoints);
        let quizMeta = { title: 'Quiz', levelCode: '', chapterTitle: '' };
        try {
            const [[qr]] = await db.execute(
                `SELECT q.title as quizTitle, ch.title as chapterTitle, l.code as levelCode, l.name as levelName
                 FROM quizzes q JOIN chapters ch ON ch.id = q.chapterId JOIN levels l ON l.id = ch.levelId WHERE q.id = ?`,
                [qid]
            );
            if (qr) {
                quizMeta = {
                    title: qr.quizTitle || 'Quiz',
                    chapterTitle: qr.chapterTitle || '',
                    levelCode: qr.levelCode || '',
                    levelName: qr.levelName || ''
                };
            }
        } catch (_) { /* ignore */ }
        await logStudentLearningEvent({
            studentId: sid,
            eventType: 'QUIZ_ATTEMPT',
            quizId: qid,
            title: 'Quiz « ' + quizMeta.title + ' » — ' + scored.scorePercent + '%',
            detail: { quizId: qid, chapter: quizMeta.chapterTitle, level: quizMeta.levelCode, passed: scored.scorePercent >= (quiz.passingScorePercent != null ? Number(quiz.passingScorePercent) : 50) },
            scorePercent: scored.scorePercent
        });
        res.status(201).json({
            attemptId,
            scorePercent: scored.scorePercent,
            pointsEarned: scored.earnedPoints,
            totalPoints,
            newBadges,
            passed: scored.scorePercent >= (quiz.passingScorePercent != null ? Number(quiz.passingScorePercent) : 50),
            correctCount: scored.correctCount,
            wrongCount: scored.wrongCount,
            unansweredCount: scored.unansweredCount,
            maxPoints: scored.maxPoints,
            perQuestion: scored.perQuestion,
            durationSeconds: dur
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Quiz sessions (autosave + resume) ---------------------------------------
app.post('/api/quiz-sessions/start', apiLog, async (req, res) => {
    try {
        const { studentId, quizId } = req.body || {};
        if (!studentId || !quizId) return res.status(400).json({ error: 'studentId et quizId requis' });
        const sid = parseInt(studentId, 10);
        const qid = parseInt(quizId, 10);
        if (Number.isNaN(sid) || Number.isNaN(qid)) return res.status(400).json({ error: 'studentId/quizId invalides' });

        const [[quiz]] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [qid]);
        if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });

        const [existing] = await db.execute(
            'SELECT * FROM quiz_sessions WHERE studentId=? AND quizId=? AND status = "IN_PROGRESS" ORDER BY updatedAt DESC LIMIT 1',
            [sid, qid]
        );
        if (existing && existing.length) {
            const s = existing[0];
            let attemptId = s.attemptId;
            if (!attemptId) {
                const completed = await countCompletedQuizAttempts(db, sid, qid);
                const attemptNum = completed + 1;
                const [attIns] = await db.execute(
                    `INSERT INTO quiz_attempts (studentId, quizId, scorePercent, pointsEarned, status, startedAt, attemptNumber, quizSessionId, maxPoints)
                     VALUES (?, ?, 0, 0, 'IN_PROGRESS', COALESCE(?, NOW()), ?, ?, NULL)`,
                    [sid, qid, s.startedAt || null, attemptNum, s.id]
                );
                attemptId = attIns.insertId;
                await db.execute('UPDATE quiz_sessions SET attemptId=? WHERE id=?', [attemptId, s.id]);
            }
            const elapsed = serverElapsedSecondsSince(s.startedAt);
            let remainingSeconds = null;
            if (quiz.timeLimitSeconds != null && quiz.timeLimitSeconds > 0) {
                remainingSeconds = Math.max(0, quiz.timeLimitSeconds - elapsed);
            }
            return res.json({
                id: s.id,
                attemptId,
                studentId: s.studentId,
                quizId: s.quizId,
                status: s.status,
                startedAt: s.startedAt,
                updatedAt: s.updatedAt,
                durationSeconds: s.durationSeconds || 0,
                currentStep: s.currentStep || 0,
                answers: s.answersJson ? JSON.parse(s.answersJson) : [],
                timeLimitSeconds: quiz.timeLimitSeconds,
                maxAttempts: quiz.maxAttempts,
                remainingSeconds,
                serverElapsedSeconds: elapsed
            });
        }

        const completed = await countCompletedQuizAttempts(db, sid, qid);
        const access = await assertStudentQuizAccess(db, sid, quiz);
        if (!access.ok) {
            return res.status(403).json({
                error: access.message,
                code: access.code,
                lessonsDone: access.lessonsDone,
                lessonsTotal: access.lessonsTotal,
                retryAfterMs: access.retryAfterMs
            });
        }
        const attemptNum = completed + 1;

        const [sessIns] = await db.execute(
            'INSERT INTO quiz_sessions (studentId, quizId, status, durationSeconds, currentStep, answersJson) VALUES (?, ?, "IN_PROGRESS", 0, 0, ?)',
            [sid, qid, JSON.stringify([])]
        );
        const newSessionId = sessIns.insertId;

        const [attIns] = await db.execute(
            `INSERT INTO quiz_attempts (studentId, quizId, scorePercent, pointsEarned, status, startedAt, attemptNumber, quizSessionId, maxPoints)
             VALUES (?, ?, 0, 0, 'IN_PROGRESS', NOW(), ?, ?, NULL)`,
            [sid, qid, attemptNum, newSessionId]
        );
        const attemptId = attIns.insertId;
        await db.execute('UPDATE quiz_sessions SET attemptId=? WHERE id=?', [attemptId, newSessionId]);

        const [[freshSess]] = await db.execute('SELECT * FROM quiz_sessions WHERE id=?', [newSessionId]);
        const s = freshSess || {};
        const elapsed = serverElapsedSecondsSince(s.startedAt);
        let remainingSeconds = null;
        if (quiz.timeLimitSeconds != null && quiz.timeLimitSeconds > 0) {
            remainingSeconds = Math.max(0, quiz.timeLimitSeconds - elapsed);
        }

        res.status(201).json({
            id: newSessionId,
            attemptId,
            studentId: sid,
            quizId: qid,
            status: 'IN_PROGRESS',
            startedAt: s.startedAt,
            updatedAt: s.updatedAt,
            durationSeconds: 0,
            currentStep: 0,
            answers: [],
            timeLimitSeconds: quiz.timeLimitSeconds,
            maxAttempts: quiz.maxAttempts,
            remainingSeconds,
            serverElapsedSeconds: elapsed
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/quiz-sessions', apiLog, async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const quizId = req.query.quizId;
        if (!studentId || !quizId) return res.status(400).json({ error: 'studentId et quizId requis' });
        const sid = parseInt(studentId, 10);
        const qid = parseInt(quizId, 10);
        const [rows] = await db.execute(
            'SELECT * FROM quiz_sessions WHERE studentId=? AND quizId=? ORDER BY updatedAt DESC LIMIT 1',
            [sid, qid]
        );
        if (!rows.length) return res.status(404).json({ error: 'session introuvable' });
        const s = rows[0];
        res.json({
            id: s.id,
            studentId: s.studentId,
            quizId: s.quizId,
            status: s.status,
            startedAt: s.startedAt,
            updatedAt: s.updatedAt,
            submittedAt: s.submittedAt,
            durationSeconds: s.durationSeconds || 0,
            currentStep: s.currentStep || 0,
            answers: s.answersJson ? JSON.parse(s.answersJson) : []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/quiz-sessions/:id', apiLog, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'id invalide' });
        const { studentId, quizId, answers, currentStep, durationSeconds } = req.body || {};
        if (!studentId || !quizId) return res.status(400).json({ error: 'studentId et quizId requis' });
        const sid = parseInt(studentId, 10);
        const qid = parseInt(quizId, 10);
        const dur = Math.max(0, parseInt(durationSeconds || 0, 10) || 0);
        const step = Math.max(0, parseInt(currentStep || 0, 10) || 0);
        const answersJson = JSON.stringify(Array.isArray(answers) ? answers : []);

        const [prev] = await db.execute('SELECT * FROM quiz_sessions WHERE id=?', [id]);
        if (!prev.length) return res.status(404).json({ error: 'session introuvable' });
        if (prev[0].status !== 'IN_PROGRESS') return res.status(409).json({ error: 'session déjà terminée' });

        await db.execute(
            'UPDATE quiz_sessions SET durationSeconds=?, currentStep=?, answersJson=?, lastError=NULL WHERE id=? AND studentId=? AND quizId=?',
            [dur, step, answersJson, id, sid, qid]
        );
        const aid = prev[0].attemptId;
        if (aid) {
            try {
                await syncDraftQuizAnswers(db, aid, Array.isArray(answers) ? answers : []);
            } catch (_) { /* schéma quiz_answers optionnel */ }
        }
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/quiz-sessions/:id/submit', apiLog, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'id invalide' });
        const { studentId, quizId, answers, durationSeconds } = req.body || {};
        if (!studentId || !quizId) return res.status(400).json({ error: 'studentId et quizId requis' });
        const sid = parseInt(studentId, 10);
        const qid = parseInt(quizId, 10);
        let dur = Math.max(0, parseInt(durationSeconds || 0, 10) || 0);

        const [sessRows] = await db.execute('SELECT * FROM quiz_sessions WHERE id=? AND studentId=? AND quizId=?', [id, sid, qid]);
        if (!sessRows.length) return res.status(404).json({ error: 'session introuvable' });
        const sess = sessRows[0];
        if (sess.status !== 'IN_PROGRESS') return res.status(409).json({ error: 'déjà soumis', code: 'DUPLICATE_SUBMIT' });

        const [[quiz]] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [qid]);
        if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });

        const serverElapsed = serverElapsedSecondsSince(sess.startedAt);
        const TIME_BUFFER_SEC = 20;
        if (quiz.timeLimitSeconds != null && quiz.timeLimitSeconds > 0 && serverElapsed > quiz.timeLimitSeconds + TIME_BUFFER_SEC) {
            await db.execute('UPDATE quiz_sessions SET status="ABANDONED", lastError=? WHERE id=?', ['TIME_EXPIRED', id]);
            if (sess.attemptId) {
                await db.execute(
                    'UPDATE quiz_attempts SET status="ABANDONED", durationSeconds=? WHERE id=? AND status="IN_PROGRESS"',
                    [serverElapsed, sess.attemptId]
                );
            }
            return res.status(403).json({ error: 'Temps imparti dépassé (validation serveur)', code: 'TIME_EXPIRED' });
        }
        if (dur > serverElapsed + 45) {
            dur = serverElapsed;
        }

        const [questions] = await db.execute('SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY orderNumber ASC, id ASC', [qid]);
        if (!questions.length) return res.status(400).json({ error: 'Aucune question dans ce quiz' });

        let attemptId = sess.attemptId;
        if (!attemptId) {
            const completed = await countCompletedQuizAttempts(db, sid, qid);
            const attemptNum = completed + 1;
            const [attIns] = await db.execute(
                `INSERT INTO quiz_attempts (studentId, quizId, scorePercent, pointsEarned, status, startedAt, attemptNumber, quizSessionId, maxPoints)
                 VALUES (?, ?, 0, 0, 'IN_PROGRESS', COALESCE(?, NOW()), ?, ?, NULL)`,
                [sid, qid, sess.startedAt || null, attemptNum, id]
            );
            attemptId = attIns.insertId;
            await db.execute('UPDATE quiz_sessions SET attemptId=? WHERE id=?', [attemptId, id]);
        }

        const [attCheck] = await db.execute('SELECT * FROM quiz_attempts WHERE id=? AND studentId=? AND quizId=?', [attemptId, sid, qid]);
        if (!attCheck.length) return res.status(404).json({ error: 'tentative introuvable' });
        if (attCheck[0].status !== 'IN_PROGRESS') {
            return res.status(409).json({ error: 'déjà soumis', code: 'DUPLICATE_SUBMIT' });
        }

        const scored = scoreQuizAttempt(questions, answers, { quizPenaltyPoints: quiz.wrongAnswerPenaltyPoints });
        const passThreshold = quiz.passingScorePercent != null ? Number(quiz.passingScorePercent) : 50;

        await replaceQuizAnswersRows(db, attemptId, scored, answers);
        await incrementQuizQuestionStats(db, qid, scored.perQuestion);

        await db.execute(
            `UPDATE quiz_attempts SET
                status = 'COMPLETED',
                submittedAt = NOW(),
                scorePercent = ?,
                pointsEarned = ?,
                durationSeconds = ?,
                correctCount = ?,
                wrongCount = ?,
                unansweredCount = ?,
                maxPoints = ?
             WHERE id = ?`,
            [
                scored.scorePercent,
                scored.earnedPoints,
                dur,
                scored.correctCount,
                scored.wrongCount,
                scored.unansweredCount,
                scored.maxPoints,
                attemptId
            ]
        );

        await db.execute(
            'UPDATE quiz_sessions SET status="COMPLETED", submittedAt=NOW(), durationSeconds=?, answersJson=? WHERE id=?',
            [dur, JSON.stringify(Array.isArray(answers) ? answers : []), id]
        );

        await db.execute(
            'INSERT INTO student_points (studentId, totalPoints) VALUES (?, ?) ON DUPLICATE KEY UPDATE totalPoints = totalPoints + ?, updatedAt = NOW()',
            [sid, scored.earnedPoints, scored.earnedPoints]
        );
        const { totalPoints, newBadges } = await awardBadgesAfterQuiz(db, sid, scored.earnedPoints);

        let quizMeta = { title: 'Quiz', levelCode: '', chapterTitle: '' };
        try {
            const [[qr]] = await db.execute(
                `SELECT q.title as quizTitle, ch.title as chapterTitle, l.code as levelCode, l.name as levelName
                 FROM quizzes q JOIN chapters ch ON ch.id = q.chapterId JOIN levels l ON l.id = ch.levelId WHERE q.id = ?`,
                [qid]
            );
            if (qr) quizMeta = { title: qr.quizTitle || 'Quiz', chapterTitle: qr.chapterTitle || '', levelCode: qr.levelCode || '', levelName: qr.levelName || '' };
        } catch (_) {}
        await logStudentLearningEvent({
            studentId: sid,
            eventType: 'QUIZ_ATTEMPT',
            quizId: qid,
            title: 'Quiz « ' + quizMeta.title + ' » — ' + scored.scorePercent + '%',
            detail: { quizId: qid, durationSeconds: dur, passed: scored.scorePercent >= passThreshold, attemptId },
            scorePercent: scored.scorePercent
        });

        res.status(201).json({
            attemptId,
            scorePercent: scored.scorePercent,
            pointsEarned: scored.earnedPoints,
            totalPoints,
            passed: scored.scorePercent >= passThreshold,
            durationSeconds: dur,
            correctCount: scored.correctCount,
            wrongCount: scored.wrongCount,
            unansweredCount: scored.unansweredCount,
            maxPoints: scored.maxPoints,
            perQuestion: scored.perQuestion,
            newBadges
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/quiz-attempts', apiLog, async (req, res) => {
    try {
        const studentId = req.query.studentId;
        if (studentId == null || studentId === '') {
            return res.status(400).json({ error: 'studentId requis' });
        }
        const sid = parseInt(studentId, 10);
        if (Number.isNaN(sid)) return res.status(400).json({ error: 'studentId invalide' });
        const [rows] = await db.execute(
            `SELECT qa.id, qa.studentId, qa.quizId, qa.scorePercent, qa.pointsEarned, qa.completedAt,
                    qa.status, qa.attemptNumber, qa.startedAt, qa.submittedAt, qa.durationSeconds,
                    qa.correctCount, qa.wrongCount, qa.unansweredCount, qa.maxPoints, qa.quizSessionId,
                    q.title as quizTitle, ch.title as chapterTitle, ch.id as chapterId,
                    l.code as levelCode, l.name as levelName
             FROM quiz_attempts qa
             INNER JOIN quizzes q ON q.id = qa.quizId
             INNER JOIN chapters ch ON ch.id = q.chapterId
             INNER JOIN levels l ON l.id = ch.levelId
             WHERE qa.studentId = ?
             ORDER BY COALESCE(qa.submittedAt, qa.completedAt, qa.startedAt) DESC`,
            [sid]
        );
        res.json(rows || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** Détail résultat d'une tentative (étudiant autorisé via studentId) */
app.get('/api/quiz-attempts/:attemptId/result', apiLog, async (req, res) => {
    try {
        const attemptId = parseInt(req.params.attemptId, 10);
        const studentId = req.query.studentId;
        if (Number.isNaN(attemptId) || studentId == null || studentId === '') {
            return res.status(400).json({ error: 'attemptId et studentId requis' });
        }
        const sid = parseInt(studentId, 10);
        if (Number.isNaN(sid)) return res.status(400).json({ error: 'studentId invalide' });
        const [attRows] = await db.execute('SELECT * FROM quiz_attempts WHERE id = ? AND studentId = ?', [attemptId, sid]);
        if (!attRows.length) return res.status(404).json({ error: 'Tentative introuvable' });
        const att = attRows[0];
        const attStatus = String(att.status == null ? 'COMPLETED' : att.status).toUpperCase();
        if (attStatus !== 'COMPLETED') {
            return res.status(400).json({ error: 'Résultat disponible uniquement pour une tentative terminée', status: att.status });
        }
        const [ansRows] = await db.execute(
            `SELECT qa.questionId, qa.answerText, qa.isCorrect, qa.earnedPoints, qa.timeSpentSeconds, qa.markedForReview,
                    qq.questionText, qq.questionType, qq.points AS maxQuestionPoints
             FROM quiz_answers qa
             INNER JOIN quiz_questions qq ON qq.id = qa.questionId
             WHERE qa.attemptId = ?
             ORDER BY qq.orderNumber ASC, qa.questionId ASC`,
            [attemptId]
        );
        const [[quizRow]] = await db.execute(
            `SELECT q.*, ch.title AS chapterTitle, l.code AS levelCode
             FROM quizzes q
             INNER JOIN chapters ch ON ch.id = q.chapterId
             INNER JOIN levels l ON l.id = ch.levelId
             WHERE q.id = ?`,
            [att.quizId]
        );
        res.json({
            attempt: att,
            quiz: quizRow || null,
            answers: ansRows || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** Analytics agrégées par quiz (tableaux de bord / rapports) */
app.get('/api/quizzes/:quizId/analytics', apiLog, async (req, res) => {
    try {
        const qid = parseInt(req.params.quizId, 10);
        if (Number.isNaN(qid)) return res.status(400).json({ error: 'quizId invalide' });
        const [statsRows] = await db.execute(
            `SELECT s.quizId, s.questionId, s.attempts, s.correctCount, s.wrongCount, s.totalTimeSeconds,
                    qq.questionText, qq.orderNumber, qq.points AS questionMaxPoints,
                    CASE WHEN s.attempts > 0 THEN ROUND(100 * s.correctCount / s.attempts, 2) ELSE NULL END AS successRatePercent,
                    CASE WHEN s.attempts > 0 THEN ROUND(s.totalTimeSeconds / s.attempts) ELSE NULL END AS avgTimeSecondsPerAttempt
             FROM quiz_question_stats s
             INNER JOIN quiz_questions qq ON qq.id = s.questionId AND qq.quizId = s.quizId
             WHERE s.quizId = ?
             ORDER BY qq.orderNumber ASC, s.questionId ASC`,
            [qid]
        );
        const [[agg]] = await db.execute(
            `SELECT
                COUNT(*) AS completedAttempts,
                AVG(qa.scorePercent) AS avgScorePercent,
                AVG(qa.durationSeconds) AS avgDurationSeconds,
                AVG(qa.correctCount) AS avgCorrectPerAttempt,
                AVG(qa.wrongCount) AS avgWrongPerAttempt,
                SUM(CASE WHEN qa.scorePercent >= COALESCE(q.passingScorePercent, 50) THEN 1 ELSE 0 END) AS passedCount
             FROM quiz_attempts qa
             INNER JOIN quizzes q ON q.id = qa.quizId
             WHERE qa.quizId = ? AND (qa.status = 'COMPLETED' OR qa.status IS NULL)`,
            [qid]
        );
        const stats = statsRows || [];
        const mostDifficult = [...stats]
            .filter((r) => r.attempts > 0)
            .sort((a, b) => (parseFloat(a.successRatePercent) || 100) - (parseFloat(b.successRatePercent) || 100))
            .slice(0, 15);
        const frequentMistakes = [...stats]
            .filter((r) => r.wrongCount > 0)
            .sort((a, b) => b.wrongCount - a.wrongCount)
            .slice(0, 15);
        res.json({
            quizId: qid,
            aggregate: agg || {},
            questionStats: stats,
            mostDifficultQuestions: mostDifficult,
            frequentMistakes
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
        const { status, completionPercentage, finalGrade, parcoursContext } = req.body;
        const [prev] = await db.execute('SELECT * FROM enrollments WHERE id = ?', [req.params.id]);
        if (!prev.length) return res.status(404).json({ error: 'Inscription non trouvée' });
        const p = prev[0];
        const pct = completionPercentage ?? p.completionPercentage ?? 0;
        const st = status || p.status || 'ACTIVE';
        try {
            await db.execute(
                `UPDATE enrollments SET status=?, completionPercentage=?, finalGrade=?, enrollmentDate=COALESCE(enrollmentDate, NOW()), lastActivityAt=NOW(), startedAt=COALESCE(startedAt, NOW()), parcoursContext=COALESCE(?, parcoursContext) WHERE id=?`,
                [st, pct, finalGrade ?? p.finalGrade, parcoursContext != null ? String(parcoursContext).slice(0, 500) : null, req.params.id]
            );
        } catch (e) {
            await db.execute(
                'UPDATE enrollments SET status=?, completionPercentage=?, finalGrade=?, enrollmentDate=COALESCE(enrollmentDate, NOW()) WHERE id=?',
                [st, pct, finalGrade ?? p.finalGrade, req.params.id]
            );
        }
        const [[ct]] = await db.execute('SELECT title FROM courses WHERE id = ?', [p.courseId]);
        const courseTitle = ct && ct.title ? ct.title : 'Cours';
        await logStudentLearningEvent({
            studentId: p.studentId,
            eventType: parseFloat(pct) >= 100 || st === 'COMPLETED' ? 'COURSE_COMPLETED' : 'PROGRESS_UPDATE',
            courseId: p.courseId,
            enrollmentId: p.id,
            title: (parseFloat(pct) >= 100 || st === 'COMPLETED') ? ('Cours terminé : ' + courseTitle) : ('Progression : ' + courseTitle + ' → ' + pct + '%'),
            detail: { completionPercentage: pct, status: st, parcoursContext: parcoursContext || undefined },
            scorePercent: null
        });
        const [rows] = await db.execute('SELECT * FROM enrollments WHERE id = ?', [req.params.id]);
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
        const enId = result.insertId;
        try {
            await db.execute(
                `UPDATE enrollments SET startedAt = COALESCE(startedAt, NOW()), lastActivityAt = NOW() WHERE id = ?`,
                [enId]
            );
        } catch (_) { /* colonnes optionnelles */ }
        const [[ct]] = await db.execute('SELECT title FROM courses WHERE id = ?', [courseId]);
        await logStudentLearningEvent({
            studentId,
            eventType: 'ENROLLMENT',
            courseId,
            enrollmentId: enId,
            title: 'Inscription au cours : ' + (ct && ct.title ? ct.title : 'Cours #' + courseId),
            detail: { courseId, enrollmentId: enId }
        });
        const [rows] = await db.execute('SELECT * FROM enrollments WHERE id = ?', [enId]);
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

// --- Salles CRUD (persistance MySQL locale) ---
app.get('/api/salles', apiLog, async (_req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id AS idSalle, nomSalle, capacite, localisation FROM salles ORDER BY id DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/salles', apiLog, async (req, res) => {
    try {
        const nomSalle = String(req.body?.nomSalle || '').trim();
        const capacite = Number(req.body?.capacite || 0);
        const localisation = String(req.body?.localisation || '').trim();
        if (!nomSalle || !localisation || !Number.isFinite(capacite) || capacite <= 0) {
            return res.status(400).json({ error: 'Champs invalides: nomSalle, capacite, localisation.' });
        }
        const [r] = await db.execute(
            'INSERT INTO salles (nomSalle, capacite, localisation) VALUES (?, ?, ?)',
            [nomSalle, capacite, localisation]
        );
        const [rows] = await db.execute(
            'SELECT id AS idSalle, nomSalle, capacite, localisation FROM salles WHERE id = ?',
            [r.insertId]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/salles/:id', apiLog, async (req, res) => {
    try {
        const nomSalle = String(req.body?.nomSalle || '').trim();
        const capacite = Number(req.body?.capacite || 0);
        const localisation = String(req.body?.localisation || '').trim();
        if (!nomSalle || !localisation || !Number.isFinite(capacite) || capacite <= 0) {
            return res.status(400).json({ error: 'Champs invalides: nomSalle, capacite, localisation.' });
        }
        const [r] = await db.execute(
            'UPDATE salles SET nomSalle = ?, capacite = ?, localisation = ? WHERE id = ?',
            [nomSalle, capacite, localisation, req.params.id]
        );
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Salle non trouvée' });
        const [rows] = await db.execute(
            'SELECT id AS idSalle, nomSalle, capacite, localisation FROM salles WHERE id = ?',
            [req.params.id]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/salles/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM salles WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Salle non trouvée' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Groups CRUD (persistance MySQL locale) ---
async function getGroupById(groupId) {
    const [rows] = await db.execute(
        'SELECT g.id, g.level, g.teacherId, GROUP_CONCAT(gs.studentId ORDER BY gs.studentId) AS studentIdsCsv FROM groups_table g LEFT JOIN group_students gs ON gs.groupId = g.id WHERE g.id = ? GROUP BY g.id, g.level, g.teacherId',
        [groupId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
        id: Number(r.id),
        level: r.level,
        teacherId: r.teacherId == null ? undefined : Number(r.teacherId),
        studentIds: r.studentIdsCsv ? String(r.studentIdsCsv).split(',').map((x) => Number(x)) : []
    };
}

app.get('/api/groups', apiLog, async (_req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT g.id, g.level, g.teacherId, GROUP_CONCAT(gs.studentId ORDER BY gs.studentId) AS studentIdsCsv FROM groups_table g LEFT JOIN group_students gs ON gs.groupId = g.id GROUP BY g.id, g.level, g.teacherId ORDER BY g.id DESC'
        );
        const payload = rows.map((r) => ({
            id: Number(r.id),
            level: r.level,
            teacherId: r.teacherId == null ? undefined : Number(r.teacherId),
            studentIds: r.studentIdsCsv ? String(r.studentIdsCsv).split(',').map((x) => Number(x)) : []
        }));
        res.json(payload);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/groups', apiLog, async (req, res) => {
    try {
        const level = String(req.body?.level || 'BEGINNER').toUpperCase();
        if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)) {
            return res.status(400).json({ error: 'Niveau invalide' });
        }
        const [r] = await db.execute('INSERT INTO groups_table (level, teacherId) VALUES (?, NULL)', [level]);
        const groupId = Number(r.insertId);
        const studentIds = Array.isArray(req.body?.studentIds) ? req.body.studentIds : [];
        for (const sid of studentIds) {
            await db.execute('INSERT IGNORE INTO group_students (groupId, studentId) VALUES (?, ?)', [groupId, Number(sid)]);
        }
        const payload = await getGroupById(groupId);
        res.status(201).json(payload);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/groups/:id', apiLog, async (req, res) => {
    try {
        const level = String(req.body?.level || '').toUpperCase();
        if (level && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)) {
            return res.status(400).json({ error: 'Niveau invalide' });
        }
        const [r] = await db.execute(
            'UPDATE groups_table SET level = COALESCE(?, level), teacherId = COALESCE(?, teacherId) WHERE id = ?',
            [level || null, req.body?.teacherId ?? null, req.params.id]
        );
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Groupe non trouvé' });
        const payload = await getGroupById(Number(req.params.id));
        res.json(payload);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/groups/:id', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('DELETE FROM groups_table WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Groupe non trouvé' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/groups/:groupId/teacher/:teacherId', apiLog, async (req, res) => {
    try {
        const [r] = await db.execute('UPDATE groups_table SET teacherId = ? WHERE id = ?', [req.params.teacherId, req.params.groupId]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Groupe non trouvé' });
        const payload = await getGroupById(Number(req.params.groupId));
        res.json(payload);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/groups/:groupId/student/:studentId', apiLog, async (req, res) => {
    try {
        await db.execute('INSERT IGNORE INTO group_students (groupId, studentId) VALUES (?, ?)', [req.params.groupId, req.params.studentId]);
        const payload = await getGroupById(Number(req.params.groupId));
        if (!payload) return res.status(404).json({ error: 'Groupe non trouvé' });
        res.json(payload);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/groups/:groupId/students', apiLog, async (req, res) => {
    try {
        const studentIds = Array.isArray(req.body) ? req.body : [];
        for (const sid of studentIds) {
            await db.execute('INSERT IGNORE INTO group_students (groupId, studentId) VALUES (?, ?)', [req.params.groupId, Number(sid)]);
        }
        const payload = await getGroupById(Number(req.params.groupId));
        if (!payload) return res.status(404).json({ error: 'Groupe non trouvé' });
        res.json(payload);
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
        let sql = `SELECT r.*, q.questionText, q.courseId, q.points as questionPoints, c.title as courseTitle, s.firstName as studentFirstName, s.lastName as studentLastName FROM responses r LEFT JOIN questions q ON r.questionId = q.id LEFT JOIN courses c ON c.id = q.courseId LEFT JOIN students s ON r.studentId = s.id WHERE 1=1`;
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

// Télécharger un certificat PDF pour un badge
app.get('/api/badges/:id/certificate', apiLog, async (req, res) => {
    try {
        const badgeId = parseInt(req.params.id, 10);
        if (Number.isNaN(badgeId)) return res.status(400).json({ error: 'id invalide' });

        // Empêche le navigateur de réutiliser un ancien PDF
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const [rows] = await db.execute(
            `SELECT b.*, s.firstName, s.lastName, s.email
             FROM badges b
             LEFT JOIN students s ON b.studentId = s.id
             WHERE b.id = ?`,
            [badgeId]
        );
        if (!rows.length) return res.status(404).json({ error: 'Badge non trouvé' });

        const b = rows[0];
        let studentFirstName = b.firstName || '';
        let studentLastName = b.lastName || '';
        const studentEmail = b.email || '';
        // Fallback: si le JOIN ne renvoie pas les noms (données incohérentes), on relit via studentId
        if ((!studentFirstName || !studentLastName) && b.studentId != null) {
            try {
                const [sRows] = await db.execute('SELECT firstName, lastName FROM students WHERE id = ?', [b.studentId]);
                if (sRows && sRows[0]) {
                    studentFirstName = sRows[0].firstName || studentFirstName;
                    studentLastName = sRows[0].lastName || studentLastName;
                }
            } catch (_) {}
        }
        const studentName = (studentFirstName + ' ' + studentLastName).trim() ||
            (studentEmail ? studentEmail.split('@')[0] : '') ||
            'Student';
        const badgeName = b.badgeName || b.badgeLevel || 'Badge';
        const badgeLevel = b.badgeLevel || '';
        const criteriaMetRaw = b.criteriaMet != null ? String(b.criteriaMet) : '';
        const pointsMatch = criteriaMetRaw.match(/\d+/);
        const achievedPoints = pointsMatch ? pointsMatch[0] : criteriaMetRaw;
        const obtainedAt = b.earnedDate || b.earnedAt || null;

        // Identifiant partageable et QR unique (liage vers l'endpoint)
        const shareUrl = `${req.protocol}://${req.get('host')}/api/badges/${badgeId}/certificate`;
        const qrPayload = `Badge:${badgeId}:${studentName}:${badgeLevel}`;

        // On génère directement le PDF vers la réponse HTTP pour éviter
        // toute histoire de cache / ancien fichier.

        const colors = {
            BRONZE: { accent: '#B56A2C', soft: '#F6EADB' },
            SILVER: { accent: '#7E8794', soft: '#EEF2F6' },
            GOLD: { accent: '#C78A06', soft: '#FFF3D9' },
            PLATINUM: { accent: '#0C98AD', soft: '#E0F6FA' }
        };
        const c = colors[String(badgeLevel).toUpperCase()] || { accent: '#0E9F6E', soft: '#E7F8F1' };

        res.setHeader('Content-Type', 'application/pdf');
        const safeBadge = String(badgeName || 'Badge').replace(/[^a-zA-Z0-9_-]+/g, '_');
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        res.setHeader('Content-Disposition', `attachment; filename="Certificate_${safeBadge}_${stamp}.pdf"`);

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        doc.pipe(res);

        // Fond général + bandeau propre (hex uniquement pour éviter rendu noir PDFKit)
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
        doc.rect(0, 0, doc.page.width, 114).fill(c.soft);
        doc.rect(0, 108, doc.page.width, 6).fill(c.accent);
        doc.fillColor('#0f172a').fontSize(24).font('Helvetica-Bold').text('Jungle in English', 50, 32);
        doc.fillColor('#334155').fontSize(13).font('Helvetica').text('Certificate of Quiz Achievement', 50, 62);

        // Helpers mise en forme
        const formatDate = (d) => {
            if (!d) return '';
            try {
                // Cas DATE 'YYYY-MM-DD'
                const s = String(d);
                const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (m) return `${m[3]}/${m[2]}/${m[1]}`;

                // Cas ISO 'YYYY-MM-DDTHH:mm:ssZ'
                const dt = d instanceof Date ? d : new Date(s);
                if (!isNaN(dt.getTime())) {
                    const yyyy = dt.getFullYear();
                    const mm = String(dt.getMonth() + 1).padStart(2, '0');
                    const dd = String(dt.getDate()).padStart(2, '0');
                    return `${dd}/${mm}/${yyyy}`;
                }

                // Fallback si format inattendu
                return s.slice(0, 10) || s;
            } catch (_) {
                return String(d || '');
            }
        };

        const marginX = 50;
        const qrW = 130;
        const qrH = 130;
        const gap = 20;
        const qrX = doc.page.width - marginX - qrW;
        const qrY = 165;
        const leftX = marginX;
        const leftW = qrX - leftX - gap;

        // Zone gauche : titre + texte (plus épuré, sans doublon)
        let y = 140;
        doc.fillColor('#0f172a').fontSize(34).font('Helvetica-Bold').text(badgeName, leftX, y, { width: leftW });
        y += 38;
        doc.fillColor('#64748b').fontSize(12).font('Helvetica-Bold').text(`Level: ${badgeLevel}`, leftX, y);
        y += 16;

        // Nom en évidence
        doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold').text(studentName || 'Student', leftX, y, { width: leftW });
        y = doc.y + 18;

        // Paragraphe unique
        doc.fillColor('#334155').fontSize(12).font('Helvetica').text(
            `This certificate confirms that ${studentName || 'Student'} has earned the ${badgeName} badge after reaching ${achievedPoints} points through quiz achievements.`,
            leftX,
            y,
            { width: leftW, lineGap: 4 }
        );

        y = doc.y + 14;
        const obtainedAtText = obtainedAt ? formatDate(obtainedAt) : '';
        if (obtainedAtText) {
            doc.fillColor('#64748b').fontSize(11).font('Helvetica').text(
                `Date of achievement: ${obtainedAtText}`,
                leftX,
                y,
                { width: leftW }
            );
            y += 16;
        }

        // Zone droite : QR code (réservation espace pour éviter chevauchement)
        const qrImg = await QRCode.toBuffer(qrPayload, { type: 'png', width: qrW });
        doc.roundedRect(qrX - 8, qrY - 8, qrW + 16, qrH + 16, 10).fill('#ffffff').stroke('#e2e8f0');
        doc.image(qrImg, qrX, qrY, { width: qrW, height: qrH });
        doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Scan to verify', qrX, qrY + qrH + 4, { width: qrW, align: 'center' });

        // Espace sous le QR pour que le bloc signature soit bien placé
        const signatureTop = Math.max(qrY + qrH + 18, y + 30);

        // Bloc signature (plus premium : cadre + typographie)
        const sigY = signatureTop + 35;
        const panelX = leftX;
        const panelW = leftW;
        const panelH = 120;
        const panelPad = 18;

        doc.save();
        doc.roundedRect(panelX, sigY, panelW, panelH, 10).fill('#f8fafc');
        doc.roundedRect(panelX, sigY, panelW, panelH, 10).stroke('#e2e8f0');

        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Official Signature', panelX + panelPad, sigY + 18);

        // Ligne signature
        const sigLineY = sigY + 55;
        doc.moveTo(panelX + panelPad, sigLineY).lineTo(panelX + panelW - panelPad, sigLineY).lineWidth(1).stroke('#0f172a');

        // "Signature" (style manuscrit)
        const cx = panelX + panelW / 2;
        doc.save();
        doc.rotate(-4, { origin: [cx, sigLineY] });
        doc.fillColor('#0f172a')
            .fontSize(24)
            .font('Times-Italic')
            .text('Jungle in English', panelX + panelPad, sigY + 48, { width: panelW - panelPad * 2, align: 'center' });
        doc.restore();

        // Légende officielle
        doc.fillColor('#334155').fontSize(10).font('Helvetica').text(
            'Authorized & verified by Jungle in English',
            panelX + panelPad,
            sigY + 88,
            { width: panelW - panelPad * 2 }
        );

        doc.restore();

        doc.end();
        return;
    } catch (error) {
        console.error('Badge certificate error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== Analytics avancés ==========
app.get('/api/analytics/funnel', apiLog, async (req, res) => {
    try {
        const [enrollments] = await db.execute(
            `SELECT COUNT(*) as total FROM enrollments`
        );
        const [started] = await db.execute(
            `SELECT COUNT(*) as total FROM enrollments WHERE completionPercentage > 0 OR status != 'ACTIVE'`
        );
        const [completed] = await db.execute(
            `SELECT COUNT(*) as total FROM enrollments WHERE completionPercentage >= 100 OR status = 'COMPLETED'`
        );
        const total = enrollments[0].total || 0;
        const startedCount = started[0].total || 0;
        const completedCount = completed[0].total || 0;
        res.json({
            inscription: total,
            demarrage: startedCount,
            completion: completedCount,
            tauxDemarrage: total ? Math.round((startedCount / total) * 100) : 0,
            tauxCompletion: total ? Math.round((completedCount / total) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/avg-completion-time', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT AVG(DATEDIFF(updatedAt, enrollmentDate)) as avgDays
            FROM enrollments
            WHERE (completionPercentage >= 100 OR status = 'COMPLETED')
              AND updatedAt IS NOT NULL AND enrollmentDate IS NOT NULL
        `);
        const avgDays = rows[0] && rows[0].avgDays != null ? Math.round(parseFloat(rows[0].avgDays) * 10) / 10 : null;
        res.json({ avgDaysToComplete: avgDays, unit: 'days' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/questions-most-failed', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT r.questionId as question_id, q.questionText, q.courseId, c.title as courseTitle,
                   COUNT(*) as fail_count,
                   (SELECT COUNT(*) FROM responses r2 WHERE r2.questionId = r.questionId) as total_answers
            FROM responses r
            JOIN questions q ON r.questionId = q.id
            LEFT JOIN courses c ON q.courseId = c.id
            WHERE r.isCorrect = 0 OR r.isCorrect IS NULL
            GROUP BY r.questionId, q.questionText, q.courseId, c.title
            ORDER BY fail_count DESC
            LIMIT 50
        `);
        const withPercent = (rows || []).map(r => ({
            ...r,
            fail_rate_percent: r.total_answers ? Math.round((r.fail_count / r.total_answers) * 100) : 0
        }));
        res.json(withPercent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/quiz-vs-completion', apiLog, async (req, res) => {
    try {
        const [enrollments] = await db.execute(`
            SELECT e.studentId, e.courseId, e.completionPercentage, e.finalGrade, c.title as courseTitle
            FROM enrollments e
            JOIN courses c ON e.courseId = c.id
            WHERE e.completionPercentage IS NOT NULL
        `);
        const [attempts] = await db.execute(`
            SELECT studentId, AVG(scorePercent) as avgQuizScore, COUNT(*) as attemptCount
            FROM quiz_attempts
            WHERE (status = 'COMPLETED' OR status IS NULL)
            GROUP BY studentId
        `);
        const attemptByStudent = new Map((attempts || []).map(a => [a.studentId, a]));
        const points = (enrollments || []).map(e => {
            const a = attemptByStudent.get(e.studentId);
            return {
                studentId: e.studentId,
                courseId: e.courseId,
                courseTitle: e.courseTitle,
                completionPercentage: parseFloat(e.completionPercentage) || 0,
                finalGrade: e.finalGrade != null ? parseFloat(e.finalGrade) : null,
                avgQuizScore: a ? parseFloat(a.avgQuizScore) : null,
                quizAttemptCount: a ? a.attemptCount : 0
            };
        });
        const withBoth = points.filter(p => p.avgQuizScore != null && p.completionPercentage != null);
        let correlation = null;
        if (withBoth.length >= 2) {
            const n = withBoth.length;
            const sumX = withBoth.reduce((s, p) => s + p.completionPercentage, 0);
            const sumY = withBoth.reduce((s, p) => s + p.avgQuizScore, 0);
            const sumXY = withBoth.reduce((s, p) => s + p.completionPercentage * p.avgQuizScore, 0);
            const sumX2 = withBoth.reduce((s, p) => s + p.completionPercentage * p.completionPercentage, 0);
            const sumY2 = withBoth.reduce((s, p) => s + p.avgQuizScore * p.avgQuizScore, 0);
            const num = n * sumXY - sumX * sumY;
            const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
            correlation = den ? Math.round((num / den) * 1000) / 1000 : null;
        }
        res.json({ points, correlation, description: 'Quiz score (parcours) vs completion % (cours)' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/teacher-performance', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.teacherId,
                   t.firstName, t.lastName,
                   COUNT(DISTINCT c.id) as course_count,
                   COUNT(DISTINCT e.id) as enrollment_count,
                   AVG(e.completionPercentage) as avg_completion,
                   AVG(e.finalGrade) as avg_grade
            FROM courses c
            LEFT JOIN teachers t ON c.teacherId = t.id
            LEFT JOIN enrollments e ON e.courseId = c.id
            WHERE c.teacherId IS NOT NULL
            GROUP BY c.teacherId, t.firstName, t.lastName
            ORDER BY enrollment_count DESC
        `);
        const out = (rows || []).map(r => ({
            teacher_id: r.teacherId,
            teacher_name: [r.firstName, r.lastName].filter(Boolean).join(' ') || 'Inconnu',
            course_count: r.course_count,
            enrollment_count: r.enrollment_count,
            avg_completion: r.avg_completion != null ? Math.round(parseFloat(r.avg_completion) * 10) / 10 : null,
            avg_grade: r.avg_grade != null ? Math.round(parseFloat(r.avg_grade) * 10) / 10 : null
        }));
        res.json(out);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/daily', apiLog, async (req, res) => {
    try {
        const courseId = req.query.courseId;
        let sql = `SELECT d.*, c.title as courseTitle FROM course_analytics_daily d LEFT JOIN courses c ON d.course_id = c.id WHERE 1=1`;
        const params = [];
        if (courseId) { sql += ' AND d.course_id = ?'; params.push(courseId); }
        sql += ' ORDER BY d.date DESC, d.course_id LIMIT 365';
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analytics/aggregate-daily', apiLog, async (req, res) => {
    try {
        const [courses] = await db.execute('SELECT id FROM courses');
        const today = new Date().toISOString().slice(0, 10);
        for (const c of courses || []) {
            const [e] = await db.execute(
                `SELECT COUNT(*) as enrollments,
                        SUM(CASE WHEN completionPercentage >= 100 OR status = 'COMPLETED' THEN 1 ELSE 0 END) as completions,
                        AVG(completionPercentage) as avg_progress,
                        AVG(finalGrade) as avg_grade
                 FROM enrollments WHERE courseId = ?`,
                [c.id]
            );
            const r = e[0];
            await db.execute(
                `INSERT INTO course_analytics_daily (course_id, date, enrollments, completions, avg_progress, avg_grade)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE enrollments=VALUES(enrollments), completions=VALUES(completions), avg_progress=VALUES(avg_progress), avg_grade=VALUES(avg_grade)`,
                [c.id, today, r.enrollments || 0, r.completions || 0, r.avg_progress || null, r.avg_grade || null]
            );
        }
        res.json({ ok: true, date: today, coursesUpdated: (courses || []).length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/database/info', apiLog, async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT 'teachers' as table_name, COUNT(*) as count FROM teachers UNION ALL SELECT 'students', COUNT(*) FROM students UNION ALL SELECT 'courses', COUNT(*) FROM courses UNION ALL SELECT 'course_materials', COUNT(*) FROM course_materials UNION ALL SELECT 'levels', COUNT(*) FROM levels UNION ALL SELECT 'chapters', COUNT(*) FROM chapters UNION ALL SELECT 'lessons', COUNT(*) FROM lessons UNION ALL SELECT 'quizzes', COUNT(*) FROM quizzes UNION ALL SELECT 'quiz_questions', COUNT(*) FROM quiz_questions UNION ALL SELECT 'quiz_attempts', COUNT(*) FROM quiz_attempts UNION ALL SELECT 'student_points', COUNT(*) FROM student_points UNION ALL SELECT 'questions', COUNT(*) FROM questions UNION ALL SELECT 'badges', COUNT(*) FROM badges UNION ALL SELECT 'enrollments', COUNT(*) FROM enrollments UNION ALL SELECT 'responses', COUNT(*) FROM responses UNION ALL SELECT 'course_analytics_daily', COUNT(*) FROM course_analytics_daily`);
        const totalRecords = rows.reduce((sum, row) => sum + row.count, 0);
        res.json({ database: 'MySQL (XAMPP)', host: dbConfig.host, database: dbConfig.database, tables: rows, totalRecords });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function handleStudentHistoryApi(req, res) {
    try {
        const studentId = req.query.studentId;
        if (studentId == null || studentId === '') {
            return res.status(400).json({ error: 'studentId requis' });
        }
        const sid = parseInt(studentId, 10);
        if (Number.isNaN(sid)) return res.status(400).json({ error: 'studentId invalide' });
        const [enrollments] = await db.execute(
            `SELECT e.*, c.title as courseTitle, c.courseCode
             FROM enrollments e
             LEFT JOIN courses c ON c.id = e.courseId
             WHERE e.studentId = ?
             ORDER BY e.enrollmentDate DESC`,
            [sid]
        );
        const [quizAttempts] = await db.execute(
            `SELECT qa.id, qa.studentId, qa.quizId, qa.scorePercent, qa.pointsEarned, qa.completedAt,
                    qa.status, qa.attemptNumber, qa.startedAt, qa.submittedAt, qa.durationSeconds,
                    qa.correctCount, qa.wrongCount, qa.unansweredCount, qa.maxPoints, qa.quizSessionId,
                    q.title as quizTitle, ch.title as chapterTitle, ch.id as chapterId,
                    l.code as levelCode, l.name as levelName
             FROM quiz_attempts qa
             INNER JOIN quizzes q ON q.id = qa.quizId
             INNER JOIN chapters ch ON ch.id = q.chapterId
             INNER JOIN levels l ON l.id = ch.levelId
             WHERE qa.studentId = ?
             ORDER BY COALESCE(qa.submittedAt, qa.completedAt, qa.startedAt) DESC`,
            [sid]
        );
        let events = [];
        try {
            const [ev] = await db.execute(
                `SELECT * FROM student_learning_events WHERE studentId = ? ORDER BY createdAt DESC LIMIT 250`,
                [sid]
            );
            events = ev || [];
        } catch (_) { /* table absente */ }
        const enr = enrollments || [];
        const qa = quizAttempts || [];
        const completedCourses = enr.filter(e => parseFloat(e.completionPercentage) >= 100 || e.status === 'COMPLETED').length;
        const inProgress = enr.filter(e => parseFloat(e.completionPercentage || 0) > 0 && parseFloat(e.completionPercentage) < 100 && e.status !== 'COMPLETED').length;
        const notStarted = enr.filter(e => parseFloat(e.completionPercentage || 0) <= 0 && e.status === 'ACTIVE').length;
        const qaForAvg = qa.filter((r) => !r.status || String(r.status).toUpperCase() === 'COMPLETED');
        const avgQuiz = qaForAvg.length
            ? Math.round(qaForAvg.reduce((s, r) => s + parseFloat(r.scorePercent || 0), 0) / qaForAvg.length)
            : null;
        let catalogByCourse = [];
        let totalCatalogResponses = 0;
        try {
            const [catRows] = await db.execute(
                `SELECT c.id as courseId, c.title as courseTitle,
                        COUNT(*) as responseCount,
                        SUM(CASE WHEN r.isCorrect = 1 THEN 1 ELSE 0 END) as correctCount,
                        MAX(r.submittedAt) as lastSubmittedAt
                 FROM responses r
                 INNER JOIN questions q ON q.id = r.questionId
                 INNER JOIN courses c ON c.id = q.courseId
                 WHERE r.studentId = ?
                 GROUP BY c.id, c.title
                 ORDER BY lastSubmittedAt DESC`,
                [sid]
            );
            catalogByCourse = catRows || [];
            totalCatalogResponses = catalogByCourse.reduce((s, row) => s + parseInt(row.responseCount, 10) || 0, 0);
        } catch (_) { /* responses/questions/courses */ }
        const catalogTimelineEvents = (catalogByCourse || []).map((row) => ({
            createdAt: row.lastSubmittedAt,
            eventType: 'Quiz catalogue',
            title: `${parseInt(row.responseCount, 10) || 0} réponse(s) sur « ${row.courseTitle || 'Cours'} » (${parseInt(row.correctCount, 10) || 0} correctes)`,
            scorePercent: null,
            _source: 'catalog'
        }));
        const mergedTimeline = [...(events || []), ...catalogTimelineEvents].sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        ).slice(0, 250);
        res.json({
            enrollments: enr,
            quizAttempts: qa,
            catalogQuizByCourse: catalogByCourse,
            timeline: mergedTimeline,
            summary: {
                totalEnrollments: enr.length,
                coursesCompleted: completedCourses,
                coursesInProgress: inProgress,
                coursesNotStarted: notStarted,
                totalQuizAttempts: qa.length,
                totalCatalogResponses,
                catalogCoursesCount: catalogByCourse.length,
                averageQuizScorePercent: avgQuiz
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
app.get('/api/history/student', apiLog, handleStudentHistoryApi);
app.get('/api/student/history', apiLog, handleStudentHistoryApi);
app.get('/api/student-history', apiLog, handleStudentHistoryApi);

// Business Intelligence (/api/admin/*) — après toutes les routes API explicites, avant le 404
mountAdminBusinessApi(app, { apiLog, adminBiz, getDb: () => db, PDFDocument });

// 404 pour toute autre requête /api/* (réponse JSON, pas HTML)
app.all('/api/*', apiLog, (req, res) =>
    res.status(404).json({
        error: 'Route API non trouvée',
        path: req.path,
        originalUrl: req.originalUrl,
        method: req.method,
        hint: 'Utilisez le serveur Node pi/xampp-mysql-dashboard.js. Testez GET /api/ping puis GET /api/admin/business-filters-meta'
    })
);

// Gestionnaire d'erreurs global : renvoyer du JSON au lieu de "Internal Server Error" HTML
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.message || err);
    if (res.headersSent) return next(err);
    res.status(500).set('Content-Type', 'application/json').json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------------
// Proxy "same-origin" vers l'API Gateway (évite CORS dans le navigateur).
// Le front back-office est servi sur http://localhost:PORT (ex: 8086)
// donc il appelle /user-service/* et /abonnement-service/* sur la même origine.
// Ici on forward en interne vers http://localhost:8080.
// ---------------------------------------------------------------------------
(function mountGatewayProxies() {
    // Par défaut, on vise le port 8888 (user-service / abonnement-service).
    // Sur certaines machines, 8080 est déjà occupé (ex: Oracle XML DB).
    const GATEWAY_BASE = process.env.API_GATEWAY_BASE || 'http://localhost:8888';
    const KEYCLOAK_BASE = process.env.KEYCLOAK_BASE || 'http://localhost:9090';

    function pickReqHeaders(req) {
        const h = { ...(req.headers || {}) };
        // Ces headers posent souvent problème en proxy fetch
        delete h.host;
        delete h.connection;
        delete h['content-length'];
        delete h['accept-encoding'];
        return h;
    }

    async function readBodyBuffer(req) {
        return await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
            req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : null));
            req.on('error', reject);
        });
    }

    function mount(prefix, base, opts) {
        const stripPrefix = !!(opts && opts.stripPrefix);
        app.options(prefix + '/*', (req, res) => {
            // Preflight côté même origine: on répond vite
            res.status(204).end();
        });

        app.use(prefix, async (req, res, next) => {
            try {
                const url = new URL(base);
                const original = req.originalUrl || (prefix + (req.url || ''));
                const forwardPath = stripPrefix ? original.replace(prefix, '') || '/' : original;
                const targetUrl = url.origin + forwardPath;

                const method = (req.method || 'GET').toUpperCase();
                const headers = pickReqHeaders(req);
                const body =
                    method === 'GET' || method === 'HEAD' ? null : await readBodyBuffer(req);

                const r = await fetch(targetUrl, {
                    method,
                    headers,
                    body: body || undefined,
                    redirect: 'manual',
                });

                res.status(r.status);
                // recopier quelques headers utiles
                r.headers.forEach((v, k) => {
                    const key = String(k || '').toLowerCase();
                    if (key === 'transfer-encoding') return;
                    if (key === 'content-encoding') return;
                    res.setHeader(k, v);
                });
                const ab = await r.arrayBuffer();
                res.send(Buffer.from(ab));
            } catch (e) {
                console.error('[Proxy]', prefix, e?.message || e);
                res.status(502).json({ error: 'Proxy error', detail: e?.message || String(e) });
            }
        });
    }

    mount('/user-service', GATEWAY_BASE);
    mount('/abonnement-service', GATEWAY_BASE);
    // Keycloak token endpoint (évite CORS + timeout côté navigateur)
    mount('/keycloak', KEYCLOAK_BASE, { stripPrefix: true });
})();

// Back-office Angular (SPA) : avant express.static('public') pour éviter toute ambiguïté de chemin (cwd).
(function mountBackOfficeSpa() {
    function resolveBackOfficeRoot() {
        const envDir = process.env.BACK_OFFICE_DIST && String(process.env.BACK_OFFICE_DIST).trim();
        if (envDir) {
            const r = path.resolve(envDir);
            if (fs.existsSync(path.join(r, 'index.html'))) return r;
            console.warn('[Back-office] BACK_OFFICE_DIST ignoré (pas d’index.html):', r);
        }
        const candidates = [
            path.join(__dirname, '..', 'angular-app-integration', 'back-office', 'dist', 'back-office', 'browser'),
            path.join(__dirname, 'angular-app-integration', 'back-office', 'dist', 'back-office', 'browser'),
            path.join(__dirname, 'back-office')
        ];
        for (const c of candidates) {
            const abs = path.resolve(c);
            if (fs.existsSync(path.join(abs, 'index.html'))) return abs;
        }
        return path.resolve(path.join(__dirname, 'back-office'));
    }

    const root = resolveBackOfficeRoot();
    const idx = path.resolve(root, 'index.html');
    console.log('[Back-office] fichiers statiques:', root);

    // Ne pas rediriger si l’URL est déjà /back-office/ : app.get('/back-office') matche aussi la variante avec slash (Express),
    // ce qui créait une boucle 302 → « invalid response » / échec dans le navigateur.
    app.get('/back-office', (req, res, next) => {
        const p = (req.originalUrl || '').split('?')[0];
        if (p === '/back-office') return res.redirect(302, '/back-office/');
        return next();
    });
    app.use('/back-office', express.static(root));
    app.use('/back-office', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (!fs.existsSync(idx)) {
            return res
                .status(503)
                .type('text/plain; charset=utf-8')
                .send(
                    'Back-office: aucun index.html trouvé. Build: cd angular-app-integration/back-office && npm run build\n' +
                        'Ou définissez BACK_OFFICE_DIST vers le dossier browser du build Angular.'
                );
        }
        res.sendFile(idx, (err) => {
            if (err) {
                console.error('[Back-office] sendFile:', err.message || err);
                if (!res.headersSent) {
                    res.status(500).type('text/plain; charset=utf-8').send('Erreur lecture index.html');
                }
            }
        });
    });
})();

const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
}
app.use('/front-office', express.static(path.join(__dirname, 'front-office')));

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

    const basePort = parseInt(PORT, 10) || 8083;
    const maxTries = 10;

    function tryListen(nextPort) {
        const server = app.listen(nextPort, '0.0.0.0', () => {
            console.log('🗺️ E-Learning running on http://localhost:' + nextPort);
            if (nextPort !== basePort) {
                console.log('   (port ' + basePort + ' occupé → port ' + nextPort + ')');
            }
            console.log('🌐 Back-office: http://localhost:' + nextPort + '/back-office/');
            console.log('👤 Étudiant: http://localhost:' + nextPort + '/front-office/student.html');
            console.log('🔌 API: http://localhost:' + nextPort + '/api/ping');
            console.log('📈 BI admin: http://localhost:' + nextPort + '/api/admin/business-filters-meta');
            const hasOpenAI = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
            const hasHF = !!(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.trim()) || !!(process.env.HF_TOKEN && process.env.HF_TOKEN.trim());
            if (hasOpenAI || hasHF) console.log('🤖 Coach (fallback): clé IA chargée depuis .env');
            else console.log('🤖 Coach (fallback): aucune clé IA (pi/.env : HUGGINGFACE_API_KEY= ou OPENAI_API_KEY=). Démarrez UserService sur 8085 pour le coach.');
            console.log('\n💡 XAMPP MySQL doit être démarré.');
        });

        server.on('error', (err) => {
            const nextPortToTry = nextPort + 1;
            const canRetry = (nextPortToTry - basePort) < maxTries;
            if ((err.code === 'EADDRINUSE' || err.code === 'EACCES') && canRetry) {
                console.warn('   Port ' + nextPort + ' ' + (err.code === 'EACCES' ? 'refusé (permission)' : 'occupé') + ', essai port ' + nextPortToTry + '...');
                tryListen(nextPortToTry);
            } else if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
                console.error('\n❌ Aucun port libre. Fermez une instance ou essayez un autre port (PORT=8086 node xampp-mysql-dashboard.js).\n');
                process.exit(1);
            } else {
                console.error(err);
                process.exit(1);
            }
        });
    }

    tryListen(basePort);
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
