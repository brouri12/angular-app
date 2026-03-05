-- Fix: Copy abonnement from user_db to abonnement_db
-- The AbonnementService looks in abonnement_db, not user_db

-- Step 1: Check if abonnement exists in abonnement_db
USE abonnement_db;
SELECT * FROM abonnements WHERE id_abonnement = 2;

-- Step 2: If it doesn't exist, copy it from user_db
INSERT INTO abonnement_db.abonnements 
SELECT * FROM user_db.abonnements WHERE id_abonnement = 2;

-- Step 3: Verify it was copied
SELECT * FROM abonnement_db.abonnements WHERE id_abonnement = 2;

-- Step 4: Now test the full query that the service would use
SELECT 
    p.id_user,
    p.date_paiement,
    p.methode_paiement,
    a.duree_jours,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_remaining
FROM user_db.payments p
JOIN abonnement_db.abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33 AND p.statut = 'Validé';

-- Expected result:
-- expiration_date: 2026-03-10
-- days_remaining: 5
-- This should trigger a YELLOW reminder (EXPIRING_SOON)
