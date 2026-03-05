-- Final Fix for Reminder System - User 33
-- For CARD payment, only date_paiement is needed
USE user_db;

-- Update payment for user 33
UPDATE payments 
SET 
    statut = 'Validé',                     -- Must be "Validé" with accent
    date_paiement = '2026-03-02 10:00:00', -- 3 days ago (only this matters for card)
    methode_paiement = 'carte'             -- Card payment
WHERE id_user = 33;

-- Update subscription duration
UPDATE abonnements 
SET duree_jours = 6                        -- 6 days duration
WHERE id_abonnement = (
    SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1
);

-- Verify the result
SELECT 
    p.id_payment,
    p.id_user,
    p.statut,
    p.methode_paiement,
    p.date_paiement,
    p.date_validation,
    a.duree_jours,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_remaining,
    CASE 
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) < 0 THEN 'EXPIRED (RED)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) = 0 THEN 'EXPIRING_TODAY (ORANGE)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 1 AND 7 THEN 'EXPIRING_SOON (YELLOW)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 8 AND 14 THEN 'EXPIRING_SOON (YELLOW)'
        ELSE 'NO REMINDER'
    END as reminder_status
FROM payments p
JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33;

-- Expected result:
-- statut: Validé
-- methode_paiement: carte
-- date_paiement: 2026-03-02 10:00:00
-- duree_jours: 6
-- expiration_date: 2026-03-08
-- days_remaining: 3
-- reminder_status: EXPIRING_SOON (YELLOW)

-- Note: date_validation can be NULL for card payments, it's not used
