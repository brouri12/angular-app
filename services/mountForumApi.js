/**
 * API Forum locale sous /api/forum (compatible avec back-office Angular).
 */
const express = require('express');

function mapForumRow(r) {
    const dc = r.date_creation;
    return {
        id: r.id,
        titre: r.titre,
        description: r.description,
        date_creation: dc instanceof Date ? dc.toISOString().slice(0, 10) : dc,
        cree_par: r.cree_par,
        niveau: r.niveau,
        groupe: r.groupe,
        cours: r.cours,
        statut: r.statut,
    };
}

function mapMessageRow(r) {
    const dm = r.date_message;
    return {
        id: r.id,
        contenu: r.contenu,
        date_message: dm instanceof Date ? dm.toISOString() : dm,
        auteurId: r.auteurId,
        type_auteur: r.type_auteur,
        statut: r.statut,
    };
}

function niveauBadgeFromPoints(points) {
    const p = Number(points) || 0;
    if (p >= 1000) return 'PLATINE';
    if (p >= 500) return 'OR';
    if (p >= 100) return 'ARGENT';
    return 'BRONZE';
}

function mountForumApi(app, { apiLog, getDb }) {
    // Diagnostic : si 404 ici, ce n’est pas le bon processus Node (ou route jamais chargée).
    app.get('/api/forum/__ok', apiLog, (req, res) =>
        res.json({ ok: true, forumModule: 'mountForumApi', path: req.originalUrl })
    );

    const router = express.Router();
    router.use(express.json({ limit: '2mb' }));

    function dbReady(req, res, next) {
        const database = getDb();
        if (!database) {
            return res.status(503).json({ error: 'Database not ready. Is MySQL (XAMPP) running?' });
        }
        req._forumDb = database;
        next();
    }

    // --- Forums (routes spécifiques avant /forums/:id) ---
    router.get('/forums', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(
                'SELECT * FROM forums ORDER BY id DESC'
            );
            res.json((rows || []).map(mapForumRow));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/forums/statut/:statut', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute('SELECT * FROM forums WHERE statut = ? ORDER BY id DESC', [
                req.params.statut,
            ]);
            res.json((rows || []).map(mapForumRow));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/forums/niveau/:niveau', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute('SELECT * FROM forums WHERE niveau = ? ORDER BY id DESC', [
                req.params.niveau,
            ]);
            res.json((rows || []).map(mapForumRow));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/forums/:id/statistiques', dbReady, async (req, res) => {
        try {
            const fid = parseInt(req.params.id, 10);
            if (Number.isNaN(fid)) return res.status(400).json({ error: 'id invalide' });
            const [[{ cnt }]] = await req._forumDb.execute(
                'SELECT COUNT(*) AS cnt FROM forum_messages WHERE forumId = ?',
                [fid]
            );
            res.json({ forumId: fid, nombreMessages: cnt || 0 });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/forums/:id', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'id invalide' });
            const [rows] = await req._forumDb.execute('SELECT * FROM forums WHERE id = ?', [id]);
            if (!rows.length) return res.status(404).json({ error: 'Forum non trouvé' });
            res.json(mapForumRow(rows[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.post('/forums', dbReady, async (req, res) => {
        try {
            const b = req.body || {};
            const titre = String(b.titre || '').trim();
            const description = String(b.description || '').trim();
            if (!titre || !description) {
                return res.status(400).json({ error: 'titre et description requis' });
            }
            const niveau = String(b.niveau || '').trim() || 'L1';
            const groupe = String(b.groupe || '').trim() || '-';
            const cours = String(b.cours || '').trim() || '-';
            const cree_par = parseInt(b.cree_par, 10) || 1;
            const statut = String(b.statut || 'OUVERT').toUpperCase();
            let date_creation = b.date_creation;
            if (!date_creation) {
                date_creation = new Date().toISOString().slice(0, 10);
            } else {
                date_creation = String(date_creation).slice(0, 10);
            }
            const [r] = await req._forumDb.execute(
                `INSERT INTO forums (titre, description, date_creation, cree_par, niveau, groupe, cours, statut)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [titre, description, date_creation, cree_par, niveau, groupe, cours, statut]
            );
            const [rows] = await req._forumDb.execute('SELECT * FROM forums WHERE id = ?', [r.insertId]);
            res.status(201).json(mapForumRow(rows[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.put('/forums/:id', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'id invalide' });
            const b = req.body || {};
            const [rows] = await req._forumDb.execute('SELECT * FROM forums WHERE id = ?', [id]);
            if (!rows.length) return res.status(404).json({ error: 'Forum non trouvé' });
            const cur = rows[0];
            const titre = b.titre != null ? String(b.titre).trim() : cur.titre;
            const description = b.description != null ? String(b.description).trim() : cur.description;
            const niveau = b.niveau != null ? String(b.niveau).trim() : cur.niveau;
            const groupe = b.groupe != null ? String(b.groupe).trim() : cur.groupe;
            const cours = b.cours != null ? String(b.cours).trim() : cur.cours;
            const statut = b.statut != null ? String(b.statut).toUpperCase() : cur.statut;
            const cree_par = b.cree_par != null ? parseInt(b.cree_par, 10) || cur.cree_par : cur.cree_par;
            await req._forumDb.execute(
                `UPDATE forums SET titre=?, description=?, niveau=?, groupe=?, cours=?, statut=?, cree_par=? WHERE id=?`,
                [titre, description, niveau, groupe, cours, statut, cree_par, id]
            );
            const [out] = await req._forumDb.execute('SELECT * FROM forums WHERE id = ?', [id]);
            res.json(mapForumRow(out[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.delete('/forums/:id', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            const [r] = await req._forumDb.execute('DELETE FROM forums WHERE id = ?', [id]);
            if (r.affectedRows === 0) return res.status(404).json({ error: 'Forum non trouvé' });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.patch('/forums/:id/fermer', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            await req._forumDb.execute("UPDATE forums SET statut='FERME' WHERE id=?", [id]);
            const [rows] = await req._forumDb.execute('SELECT * FROM forums WHERE id = ?', [id]);
            if (!rows.length) return res.status(404).json({ error: 'Forum non trouvé' });
            res.json(mapForumRow(rows[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.patch('/forums/:id/rouvrir', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            await req._forumDb.execute("UPDATE forums SET statut='OUVERT' WHERE id=?", [id]);
            const [rows] = await req._forumDb.execute('SELECT * FROM forums WHERE id = ?', [id]);
            if (!rows.length) return res.status(404).json({ error: 'Forum non trouvé' });
            res.json(mapForumRow(rows[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // --- Messages ---
    router.get('/messages', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(
                'SELECT * FROM forum_messages ORDER BY date_message DESC LIMIT 500'
            );
            res.json((rows || []).map(mapMessageRow));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/messages/search', dbReady, async (req, res) => {
        try {
            const kw = String(req.query.keyword || '').trim();
            if (!kw) return res.json([]);
            const like = `%${kw}%`;
            const [rows] = await req._forumDb.execute(
                'SELECT * FROM forum_messages WHERE contenu LIKE ? ORDER BY date_message DESC LIMIT 100',
                [like]
            );
            res.json((rows || []).map(mapMessageRow));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/messages/forum/:forumId', dbReady, async (req, res) => {
        try {
            const forumId = parseInt(req.params.forumId, 10);
            const [rows] = await req._forumDb.execute(
                'SELECT * FROM forum_messages WHERE forumId = ? ORDER BY date_message ASC',
                [forumId]
            );
            res.json((rows || []).map(mapMessageRow));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.post('/messages/forum/:forumId', dbReady, async (req, res) => {
        try {
            const forumId = parseInt(req.params.forumId, 10);
            const b = req.body || {};
            const contenu = String(b.contenu || '').trim();
            if (!contenu) return res.status(400).json({ error: 'contenu requis' });
            const auteurId = parseInt(b.auteurId, 10) || 1;
            const type_auteur = String(b.type_auteur || 'ETUDIANT').toUpperCase();
            const statut = String(b.statut || 'ACTIF').toUpperCase();
            const [r] = await req._forumDb.execute(
                `INSERT INTO forum_messages (forumId, contenu, auteurId, type_auteur, statut) VALUES (?, ?, ?, ?, ?)`,
                [forumId, contenu, auteurId, type_auteur, statut]
            );
            const [rows] = await req._forumDb.execute('SELECT * FROM forum_messages WHERE id = ?', [r.insertId]);
            res.status(201).json(mapMessageRow(rows[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.put('/messages/:id', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            const contenu = String((req.body && req.body.contenu) || '').trim();
            if (!contenu) return res.status(400).json({ error: 'contenu requis' });
            const [r] = await req._forumDb.execute('UPDATE forum_messages SET contenu=? WHERE id=?', [contenu, id]);
            if (r.affectedRows === 0) return res.status(404).json({ error: 'Message non trouvé' });
            const [rows] = await req._forumDb.execute('SELECT * FROM forum_messages WHERE id = ?', [id]);
            res.json(mapMessageRow(rows[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.delete('/messages/:id', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            const [r] = await req._forumDb.execute('DELETE FROM forum_messages WHERE id = ?', [id]);
            if (r.affectedRows === 0) return res.status(404).json({ error: 'Message non trouvé' });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.patch('/messages/:id/archiver', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            await req._forumDb.execute("UPDATE forum_messages SET statut='ARCHIVE' WHERE id=?", [id]);
            const [rows] = await req._forumDb.execute('SELECT * FROM forum_messages WHERE id = ?', [id]);
            if (!rows.length) return res.status(404).json({ error: 'Message non trouvé' });
            res.json(mapMessageRow(rows[0]));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // --- Likes ---
    router.post('/interactions/likes/:messageId/:utilisateurId', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const utilisateurId = parseInt(req.params.utilisateurId, 10);
            await req._forumDb.execute(
                'INSERT IGNORE INTO forum_message_likes (messageId, utilisateurId) VALUES (?, ?)',
                [messageId, utilisateurId]
            );
            res.json({ ok: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.delete('/interactions/likes/:messageId/:utilisateurId', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const utilisateurId = parseInt(req.params.utilisateurId, 10);
            await req._forumDb.execute(
                'DELETE FROM forum_message_likes WHERE messageId=? AND utilisateurId=?',
                [messageId, utilisateurId]
            );
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/interactions/likes/:messageId/count', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const [[{ c }]] = await req._forumDb.execute(
                'SELECT COUNT(*) AS c FROM forum_message_likes WHERE messageId=?',
                [messageId]
            );
            res.json({ count: c || 0 });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/interactions/likes/:messageId/check/:utilisateurId', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const utilisateurId = parseInt(req.params.utilisateurId, 10);
            const [rows] = await req._forumDb.execute(
                'SELECT 1 FROM forum_message_likes WHERE messageId=? AND utilisateurId=? LIMIT 1',
                [messageId, utilisateurId]
            );
            res.json({ aLike: rows.length > 0 });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/interactions/likes/:messageId', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const [rows] = await req._forumDb.execute(
                'SELECT messageId, utilisateurId, createdAt AS dateLike FROM forum_message_likes WHERE messageId=?',
                [messageId]
            );
            res.json(rows || []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // --- Réponses ---
    router.post('/interactions/reponses', dbReady, async (req, res) => {
        try {
            const b = req.body || {};
            const messageParentId = parseInt(b.messageParentId, 10);
            const auteurId = parseInt(b.auteurId, 10) || 1;
            const contenu = String(b.contenu || '').trim();
            if (!messageParentId || !contenu) return res.status(400).json({ error: 'messageParentId et contenu requis' });
            const statut = String(b.statut || 'ACTIF');
            const [r] = await req._forumDb.execute(
                `INSERT INTO forum_message_replies (messageParentId, auteurId, contenu, statut) VALUES (?, ?, ?, ?)`,
                [messageParentId, auteurId, contenu, statut]
            );
            const [rows] = await req._forumDb.execute('SELECT * FROM forum_message_replies WHERE id = ?', [
                r.insertId,
            ]);
            const row = rows[0];
            const dr = row.dateReponse;
            res.status(201).json({
                id: row.id,
                messageParentId: row.messageParentId,
                auteurId: row.auteurId,
                contenu: row.contenu,
                dateReponse: dr instanceof Date ? dr.toISOString() : dr,
                statut: row.statut,
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/interactions/reponses/:messageId/count', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const [[{ c }]] = await req._forumDb.execute(
                'SELECT COUNT(*) AS c FROM forum_message_replies WHERE messageParentId=?',
                [messageId]
            );
            res.json({ count: c || 0 });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/interactions/reponses/:messageId', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const [rows] = await req._forumDb.execute(
                'SELECT * FROM forum_message_replies WHERE messageParentId=? ORDER BY dateReponse ASC',
                [messageId]
            );
            res.json(
                (rows || []).map((row) => {
                    const dr = row.dateReponse;
                    return {
                        id: row.id,
                        messageParentId: row.messageParentId,
                        auteurId: row.auteurId,
                        contenu: row.contenu,
                        dateReponse: dr instanceof Date ? dr.toISOString() : dr,
                        statut: row.statut,
                    };
                })
            );
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.put('/interactions/reponses/:reponseId', dbReady, async (req, res) => {
        try {
            const reponseId = parseInt(req.params.reponseId, 10);
            const contenu = String(req.query.contenu || '').trim();
            const utilisateurId = parseInt(req.query.utilisateurId, 10);
            if (!contenu) return res.status(400).json({ error: 'contenu requis' });
            const [rows] = await req._forumDb.execute('SELECT * FROM forum_message_replies WHERE id=?', [
                reponseId,
            ]);
            if (!rows.length) return res.status(404).json({ error: 'Réponse non trouvée' });
            if (rows[0].auteurId !== utilisateurId) return res.status(403).json({ error: 'Non autorisé' });
            await req._forumDb.execute('UPDATE forum_message_replies SET contenu=? WHERE id=?', [contenu, reponseId]);
            const [out] = await req._forumDb.execute('SELECT * FROM forum_message_replies WHERE id=?', [reponseId]);
            const row = out[0];
            const dr = row.dateReponse;
            res.json({
                id: row.id,
                messageParentId: row.messageParentId,
                auteurId: row.auteurId,
                contenu: row.contenu,
                dateReponse: dr instanceof Date ? dr.toISOString() : dr,
                statut: row.statut,
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.delete('/interactions/reponses/:reponseId', dbReady, async (req, res) => {
        try {
            const reponseId = parseInt(req.params.reponseId, 10);
            const utilisateurId = parseInt(req.query.utilisateurId, 10);
            const [rows] = await req._forumDb.execute('SELECT * FROM forum_message_replies WHERE id=?', [reponseId]);
            if (!rows.length) return res.status(404).json({ error: 'Réponse non trouvée' });
            if (rows[0].auteurId !== utilisateurId) return res.status(403).json({ error: 'Non autorisé' });
            await req._forumDb.execute('DELETE FROM forum_message_replies WHERE id=?', [reponseId]);
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // --- Modération ---
    router.post('/moderation/signalements', dbReady, async (req, res) => {
        try {
            const b = req.body || {};
            const messageId = parseInt(b.messageId, 10);
            const signalePar = parseInt(b.signalePar, 10) || 1;
            const motif = String(b.motif || b.description || 'Signalement').slice(0, 500);
            const type = String(b.type || 'AUTRE').slice(0, 50);
            const description = b.description ? String(b.description).slice(0, 2000) : null;
            if (!messageId) return res.status(400).json({ error: 'messageId requis' });
            const [r] = await req._forumDb.execute(
                `INSERT INTO forum_signalements (messageId, signalePar, motif, description, type, statut) VALUES (?, ?, ?, ?, ?, 'EN_ATTENTE')`,
                [messageId, signalePar, motif, description, type]
            );
            res.status(201).json({ id: r.insertId, ok: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/moderation/signalements/en-attente', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(
                "SELECT * FROM forum_signalements WHERE statut='EN_ATTENTE' ORDER BY createdAt DESC LIMIT 200"
            );
            res.json(rows || []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/moderation/signalements/message/:messageId', dbReady, async (req, res) => {
        try {
            const messageId = parseInt(req.params.messageId, 10);
            const [rows] = await req._forumDb.execute(
                'SELECT * FROM forum_signalements WHERE messageId=? ORDER BY createdAt DESC',
                [messageId]
            );
            res.json(rows || []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.put('/moderation/signalements/:signalementId/traiter', dbReady, async (req, res) => {
        try {
            const id = parseInt(req.params.signalementId, 10);
            const decision = String(req.query.decision || 'FERME').slice(0, 40);
            const moderateurId = parseInt(req.query.moderateurId, 10) || 0;
            const commentaire = req.query.commentaire ? String(req.query.commentaire).slice(0, 1000) : null;
            await req._forumDb.execute(
                `UPDATE forum_signalements SET statut=?, traitePar=?, commentaireModerateur=?, dateTraitement=NOW() WHERE id=?`,
                [decision, moderateurId, commentaire, id]
            );
            res.json({ ok: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/moderation/signalements/multiples', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(`
                SELECT messageId, COUNT(*) AS nb FROM forum_signalements GROUP BY messageId HAVING nb >= 2
            `);
            res.json(rows || []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // --- Notifications forum (stub minimal) ---
    router.get('/notifications/utilisateur/:utilisateurId', dbReady, async (req, res) => {
        res.json([]);
    });
    router.get('/notifications/utilisateur/:utilisateurId/non-lues', dbReady, async (req, res) => {
        res.json([]);
    });
    router.get('/notifications/utilisateur/:utilisateurId/non-lues/count', dbReady, async (req, res) => {
        res.json({ count: 0 });
    });
    router.put('/notifications/:id/marquer-lue', dbReady, async (req, res) => {
        res.json({ ok: true });
    });
    router.put('/notifications/utilisateur/:utilisateurId/marquer-toutes-lues', dbReady, async (req, res) => {
        res.status(204).send();
    });
    router.delete('/notifications/:notificationId', dbReady, async (req, res) => {
        res.status(204).send();
    });

    // --- Badges forum (agrégats locaux) ---
    async function statsUtilisateur(db, utilisateurId) {
        const [[m]] = await db.execute(
            'SELECT COUNT(*) AS c FROM forum_messages WHERE auteurId=?',
            [utilisateurId]
        );
        const [[r]] = await db.execute(
            'SELECT COUNT(*) AS c FROM forum_message_replies WHERE auteurId=?',
            [utilisateurId]
        );
        const [[{ likes }]] = await db.execute(
            `SELECT COUNT(*) AS likes FROM forum_message_likes l
             INNER JOIN forum_messages fm ON fm.id = l.messageId WHERE fm.auteurId=?`,
            [utilisateurId]
        );
        const nombreMessages = m.c || 0;
        const nombreReponses = r.c || 0;
        const nombreLikesRecus = likes || 0;
        const points = nombreMessages * 10 + nombreLikesRecus * 5 + nombreReponses * 3;
        return {
            utilisateurId,
            points,
            niveauBadge: niveauBadgeFromPoints(points),
            nombreMessages,
            nombreLikesRecus,
            nombreReponses,
        };
    }

    router.get('/badges/utilisateur/:utilisateurId', dbReady, async (req, res) => {
        try {
            const utilisateurId = parseInt(req.params.utilisateurId, 10);
            const s = await statsUtilisateur(req._forumDb, utilisateurId);
            res.json({ ...s, derniereMiseAJour: new Date().toISOString() });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.post('/badges/utilisateur/:utilisateurId/points', dbReady, async (req, res) => {
        res.status(204).send();
    });
    router.delete('/badges/utilisateur/:utilisateurId/points', dbReady, async (req, res) => {
        res.status(204).send();
    });
    router.put('/badges/utilisateur/:utilisateurId/statistiques', dbReady, async (req, res) => {
        try {
            const utilisateurId = parseInt(req.params.utilisateurId, 10);
            const s = await statsUtilisateur(req._forumDb, utilisateurId);
            res.json(s);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/badges/top-contributeurs', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(`
                SELECT auteurId AS utilisateurId, COUNT(*) AS nombreMessages FROM forum_messages GROUP BY auteurId ORDER BY nombreMessages DESC LIMIT 20
            `);
            const out = [];
            for (const row of rows || []) {
                const uid = row.utilisateurId;
                const s = await statsUtilisateur(req._forumDb, uid);
                out.push({
                    utilisateurId: uid,
                    nombreMessages: s.nombreMessages,
                    nombreLikesRecus: s.nombreLikesRecus,
                    niveauBadge: s.niveauBadge,
                    points: s.points,
                });
            }
            res.json(out);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/badges/niveau/:niveau', dbReady, async (req, res) => {
        res.json([]);
    });

    // --- Analyse ---
    router.get('/analyse/statistiques/globales', dbReady, async (req, res) => {
        try {
            const [[{ nf }]] = await req._forumDb.execute('SELECT COUNT(*) AS nf FROM forums');
            const [[{ nm }]] = await req._forumDb.execute('SELECT COUNT(*) AS nm FROM forum_messages');
            const [[{ nl }]] = await req._forumDb.execute('SELECT COUNT(*) AS nl FROM forum_message_likes');
            const [[{ nr }]] = await req._forumDb.execute('SELECT COUNT(*) AS nr FROM forum_message_replies');
            const [[{ nu }]] = await req._forumDb.execute(`
                SELECT COUNT(DISTINCT x.uid) AS nu FROM (
                  SELECT auteurId AS uid FROM forum_messages
                  UNION SELECT auteurId FROM forum_message_replies
                ) x
            `);
            const [topRows] = await req._forumDb.execute(`
                SELECT auteurId AS utilisateurId, COUNT(*) AS nombreMessages FROM forum_messages GROUP BY auteurId ORDER BY nombreMessages DESC LIMIT 10
            `);
            const topContributeurs = [];
            for (const row of topRows || []) {
                const s = await statsUtilisateur(req._forumDb, row.utilisateurId);
                topContributeurs.push({
                    utilisateurId: row.utilisateurId,
                    nombreMessages: s.nombreMessages,
                    nombreLikesRecus: s.nombreLikesRecus,
                    niveauBadge: s.niveauBadge,
                    points: s.points,
                });
            }
            res.json({
                nombreForums: nf || 0,
                nombreMessages: nm || 0,
                nombreLikes: nl || 0,
                nombreReponses: nr || 0,
                nombreUtilisateurs: nu || 0,
                topContributeurs,
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/analyse/statistiques/par-forum', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(`
                SELECT f.id, f.titre, COUNT(m.id) AS messages FROM forums f
                LEFT JOIN forum_messages m ON m.forumId = f.id GROUP BY f.id, f.titre
            `);
            res.json(rows || []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/analyse/statistiques/par-niveau', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(`
                SELECT niveau, COUNT(*) AS nb FROM forums GROUP BY niveau
            `);
            res.json(rows || []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/analyse/forum-plus-actif', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(`
                SELECT f.id, f.titre, COUNT(m.id) AS c FROM forums f
                LEFT JOIN forum_messages m ON m.forumId = f.id
                GROUP BY f.id, f.titre ORDER BY c DESC LIMIT 1
            `);
            res.json(rows[0] || null);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/analyse/etudiant-plus-actif', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(`
                SELECT auteurId AS utilisateurId, COUNT(*) AS c FROM forum_messages GROUP BY auteurId ORDER BY c DESC LIMIT 1
            `);
            res.json(rows[0] || null);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/analyse/engagement/par-groupe', dbReady, async (req, res) => {
        try {
            const [rows] = await req._forumDb.execute(`
                SELECT groupe, COUNT(*) AS forums FROM forums GROUP BY groupe
            `);
            res.json(rows || []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get('/analyse/activite/periode', dbReady, async (req, res) => {
        res.json({ message: 'Non implémenté', from: req.query.dateDebut, to: req.query.dateFin });
    });

    app.use('/api/forum', apiLog, router);
    console.log('[API] Forum monté sur /api/forum');
}

module.exports = { mountForumApi };
