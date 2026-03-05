-- Diagnostic Script for Reminder Issue
-- User 33 should have a reminder but doesn't

-- ============================================
-- Step 1: Check Payment in user_db
-- ============================================
USE user_db;

SELECT 
    'PAYMENT CHECK' as step,
    p.id_payment,
    p.id_user,
    p.id_abonnement,
    p.statut,
    p.methode_paiement,
    p.date_paiement,
    p.date_validation
FROM payments p
WHERE p.id_user = 33;

-- Expected: statut = 'Validé', date_paiement = 2026-02-08

-- ============================================
-- Step 2: Check if payment is in validated list
-- ============================================
SELECT 
    'VALIDATED PAYMENTS' as step,
    p.*
FROM payments p
WHERE p.statut = 'Validé' AND p.id_user = 33;

-- Expected: Should return the payment

-- ============================================
-- Step 3: Check Abonnement in user_db (if exists)
-- ============================================
SELECT 
    'ABONNEMENT IN USER_DB' as step,
    a.*
FROM abonnements a
WHERE a.id_abonnement = 2;

-- ============================================
-- Step 4: Check Abonnement in abonnement_db
-- ============================================
USE abonnement_db;

SELECT 
    'ABONNEMENT IN ABONNEMENT_DB' as step,
    a.*
FROM abonnements a
WHERE a.id_abonnement = 2;

-- ============================================
-- Step 5: Calculate expected expiration
-- ============================================
USE user_db;

SELECT 
    'EXPIRATION CALCULATION' as step,
    p.id_user,
    p.date_paiement,
    a.duree_jours,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_remaining,
    CASE 
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) < 0 THEN 'EXPIRED'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) = 0 THEN 'EXPIRING_TODAY'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 1 AND 7 THEN 'EXPIRING_SOON (1-7 days)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 8 AND 14 THEN 'EXPIRING_SOON (8-14 days)'
        ELSE 'NO REMINDER (>14 days)'
    END as reminder_status
FROM payments p
LEFT JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33 AND p.statut = 'Validé';

-- Expected: 
-- expiration_date: 2026-03-10
-- days_remaining: 5
-- reminder_status: EXPIRING_SOON (1-7 days)

-- ============================================
-- Step 6: Check if abonnement exists in BOTH databases
-- ============================================
SELECT 
    'CROSS-DATABASE CHECK' as step,
    'user_db' as database_name,
    COUNT(*) as count
FROM user_db.abonnements 
WHERE id_abonnement = 2

UNION ALL

SELECT 
    'CROSS-DATABASE CHECK' as step,
    'abonnement_db' as database_name,
    COUNT(*) as count
FROM abonnement_db.abonnements 
WHERE id_abonnement = 2;

-- ============================================
-- DIAGNOSIS RESULTS
-- ============================================
-- If abonnement is ONLY in user_db:
--   Problem: AbonnementService looks in abonnement_db
--   Solution: Copy abonnement to abonnement_db OR change service logic

-- If abonnement is in BOTH databases:
--   Problem: Might be a service issue
--   Solution: Check backend logs and restart services

-- If payment statut is NOT 'Validé':
--   Problem: Only validated payments are checked
--   Solution: UPDATE payments SET statut = 'Validé' WHERE id_user = 33
