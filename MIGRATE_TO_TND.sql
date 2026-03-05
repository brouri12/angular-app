-- ================================================
-- Migration des Prix vers Dinar Tunisien (TND)
-- Date: 2026-03-05
-- Taux de conversion: 1 USD = 3.15 TND
-- ================================================

USE abonnement_db;

-- ================================================
-- 1. BACKUP DES DONNÉES ACTUELLES
-- ================================================

-- Créer une table de backup (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS abonnements_backup_usd (
    id_abonnement BIGINT,
    nom VARCHAR(100),
    prix_usd DOUBLE,
    date_backup TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sauvegarder les prix actuels en USD
INSERT INTO abonnements_backup_usd (id_abonnement, nom, prix_usd)
SELECT id_abonnement, nom, prix FROM abonnements;

-- ================================================
-- 2. MISE À JOUR DES PRIX EN TND
-- ================================================

-- Option A: Conversion automatique (1 USD = 3.15 TND)
-- UPDATE abonnements SET prix = ROUND(prix * 3.15, 2);

-- Option B: Prix arrondis recommandés (RECOMMANDÉ)
UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';

-- ================================================
-- 3. VÉRIFICATION DES CHANGEMENTS
-- ================================================

SELECT 
    '=== VÉRIFICATION DES PRIX ===' as 'Status';

SELECT 
    id_abonnement as 'ID',
    nom as 'Plan',
    prix as 'Prix TND',
    duree_jours as 'Durée (jours)',
    ROUND(prix / duree_jours, 2) as 'Prix/jour TND',
    statut as 'Statut'
FROM abonnements
ORDER BY prix ASC;

-- ================================================
-- 4. COMPARAISON AVANT/APRÈS
-- ================================================

SELECT 
    '=== COMPARAISON USD vs TND ===' as 'Status';

SELECT 
    a.nom as 'Plan',
    b.prix_usd as 'Ancien Prix (USD)',
    a.prix as 'Nouveau Prix (TND)',
    ROUND(a.prix / 3.15, 2) as 'Équivalent USD',
    ROUND(((a.prix / 3.15) - b.prix_usd) / b.prix_usd * 100, 2) as 'Différence %'
FROM abonnements a
JOIN abonnements_backup_usd b ON a.id_abonnement = b.id_abonnement
ORDER BY a.prix ASC;

-- ================================================
-- 5. STATISTIQUES
-- ================================================

SELECT 
    '=== STATISTIQUES ===' as 'Status';

SELECT 
    COUNT(*) as 'Nombre de plans',
    MIN(prix) as 'Prix minimum (TND)',
    MAX(prix) as 'Prix maximum (TND)',
    AVG(prix) as 'Prix moyen (TND)',
    SUM(prix) as 'Total (TND)'
FROM abonnements
WHERE statut = 'Active';

-- ================================================
-- 6. ROLLBACK (EN CAS DE PROBLÈME)
-- ================================================

-- Si vous voulez revenir aux prix USD, exécutez:
-- UPDATE abonnements a
-- JOIN abonnements_backup_usd b ON a.id_abonnement = b.id_abonnement
-- SET a.prix = b.prix_usd;

-- ================================================
-- FIN DE LA MIGRATION
-- ================================================

SELECT 
    '✅ Migration terminée avec succès!' as 'Status',
    NOW() as 'Date/Heure';
