-- Create Test Data for Subscription Reminders
-- Current Date: 2026-03-05

-- First, check what we have for user 33
SELECT 
    p.id_user,
    p.date_paiement,
    a.duree_jours,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_until_expiration
FROM payments p
JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33;

-- ============================================
-- OPTION 1: Quick Test - Make User 33 Expire in 3 Days (YELLOW Alert)
-- ============================================
UPDATE abonnements 
SET duree_jours = 28 
WHERE id_abonnement = (
    SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1
);
-- Result: Expires 2026-03-08 (3 days from now)

-- ============================================
-- OPTION 2: Make User 33 Expire TODAY (ORANGE Alert)
-- ============================================
-- UPDATE abonnements 
-- SET duree_jours = 25 
-- WHERE id_abonnement = (
--     SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1
-- );
-- Result: Expires 2026-03-05 (today)

-- ============================================
-- OPTION 3: Make User 33 Already EXPIRED (RED Alert)
-- ============================================
-- UPDATE abonnements 
-- SET duree_jours = 20 
-- WHERE id_abonnement = (
--     SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1
-- );
-- Result: Expires 2026-02-28 (5 days ago)

-- ============================================
-- Verify the change
-- ============================================
SELECT 
    p.id_user,
    p.date_paiement,
    a.duree_jours,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_until_expiration,
    CASE 
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) < 0 THEN 'EXPIRED (RED)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) = 0 THEN 'EXPIRING_TODAY (ORANGE)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 1 AND 7 THEN 'EXPIRING_SOON 1-7 days (YELLOW)'
        WHEN DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) BETWEEN 8 AND 14 THEN 'EXPIRING_SOON 8-14 days (YELLOW)'
        ELSE 'NO REMINDER'
    END as reminder_status
FROM payments p
JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33;
