'use strict';

/**
 * Insère un forum d’exemple dans MySQL (même schéma que l’API /api/forum/forums).
 *
 * Usage (depuis le dossier pi/) :
 *   node scripts/seed-forum-example.js
 *
 * Prérequis : XAMPP MySQL démarré, base elearning existante (lancez une fois xampp-mysql-dashboard.js si besoin).
 */

const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : '',
    database: process.env.MYSQL_DATABASE || 'elearning',
    charset: 'utf8mb4',
};

async function main() {
    const conn = await mysql.createConnection(dbConfig);
    try {
        const today = new Date().toISOString().slice(0, 10);
        const row = {
            titre: 'Club conversation — Jungle in English',
            description:
                "Forum officiel pour échanger en anglais, demander de l'aide sur les cours et partager des ressources. Soyez respectueux et privilégiez l'anglais dans les messages.",
            date_creation: today,
            cree_par: 1,
            niveau: 'L3',
            groupe: 'INFO-A',
            cours: 'English Communication Skills',
            statut: 'OUVERT',
        };
        const [r] = await conn.execute(
            `INSERT INTO forums (titre, description, date_creation, cree_par, niveau, groupe, cours, statut)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                row.titre,
                row.description,
                row.date_creation,
                row.cree_par,
                row.niveau,
                row.groupe,
                row.cours,
                row.statut,
            ]
        );
        const id = r.insertId;
        const [rows] = await conn.execute('SELECT * FROM forums WHERE id = ?', [id]);
        console.log('Forum créé avec id =', id);
        console.log(JSON.stringify(rows[0], null, 2));
    } finally {
        await conn.end();
    }
}

main().catch((e) => {
    console.error(e.message || e);
    process.exitCode = 1;
});
