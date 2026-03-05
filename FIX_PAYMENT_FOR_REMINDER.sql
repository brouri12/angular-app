-- Fix Payment Data to Get Reminder for User 33
USE user_db;

-- Step 1: Check current status
SELECT 
    p.id_payment,
    p.id_user,
    p.date_paiement,
    p.date_validation,
    p.methode_paiement,
    p.statut,
    p.valide,
    a.duree_jours
FROM payments p
LEFT JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33;

-- Step 2: Update payment to be VALIDATED and set correct dates
UPDATE payments 
SET 
    valide = 1,                          -- MUST be validated
    statut = 'Active',                   -- Status should be Active
    date_paiement = '2026-03-02',        -- 3 days ago
    date_validation = '2026-03-02',      -- Same as payment date
    methode_paiement = 'carte'           -- Use card payment
WHERE id_user = 33;

-- Step 3: Update subscription duration to expire in 3 days
UPDATE abonnements 
SET duree_jours = 6                      -- 3 days ago + 6 days = expires in 3 days
WHERE id_abonnement = (
    SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1
);

-- Step 4: Verify the result
SELECT 
    p.id_payment,
    p.id_user,
    p.date_paiement,
    p.date_validation,
    p.methode_paiement,
    p.statut,
    p.valide,
    a.duree_jours,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_until_expiration,
    CASE 
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) < 0 THEN 'EXPIRED (RED)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) = 0 THEN 'EXPIRING_TODAY (ORANGE)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 1 AND 7 THEN 'EXPIRING_SOON (YELLOW)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 8 AND 14 THEN 'EXPIRING_SOON (YELLOW)'
        ELSE 'NO REMINDER'
    END as reminder_status
FROM payments p
LEFT JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33;

-- Expected result:
-- expiration_date: 2026-03-08
-- days_until_expiration: 3
-- reminder_status: EXPIRING_SOON (YELLOW)
