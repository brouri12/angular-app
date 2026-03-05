-- Create Test Data for Subscription Reminders
-- This script creates test payments with different expiration dates

USE elearning_db;

-- Note: Make sure you have:
-- 1. A user in the users table (get the id_user)
-- 2. Subscriptions in the abonnements table (get the id_abonnement)

-- First, let's check what we have
SELECT 'Current Users:' as Info;
SELECT id_user, username, email FROM users LIMIT 5;

SELECT 'Current Subscriptions:' as Info;
SELECT id_abonnement, nom, duree_jours FROM abonnements;

SELECT 'Current Validated Payments:' as Info;
SELECT id_payment, id_user, type_abonnement, methode_paiement, date_paiement, date_validation 
FROM payments WHERE statut = 'Validé';

-- ============================================================================
-- CREATE TEST PAYMENTS
-- ============================================================================
-- IMPORTANT: Replace the values below with actual IDs from your database
-- - Replace id_user (1) with an actual user ID
-- - Replace id_abonnement (1) with an actual subscription ID
-- - The examples assume a 30-day subscription duration
-- ============================================================================

-- Test 1: EXPIRED subscription (expired 5 days ago)
-- Payment date: 35 days ago (30 days + 5 days expired)
INSERT INTO payments (
    id_user, 
    id_abonnement, 
    montant, 
    methode_paiement, 
    statut, 
    date_paiement, 
    nom_client, 
    email_client, 
    type_abonnement
) VALUES (
    1,  -- ⚠️ CHANGE THIS to your user ID
    1,  -- ⚠️ CHANGE THIS to your subscription ID
    29.99, 
    'carte', 
    'Validé', 
    DATE_SUB(NOW(), INTERVAL 35 DAY), 
    'Test User - Expired', 
    'expired@test.com', 
    'Premium'
);

-- Test 2: EXPIRING TODAY
-- Payment date: 30 days ago (expires today)
INSERT INTO payments (
    id_user, 
    id_abonnement, 
    montant, 
    methode_paiement, 
    statut, 
    date_paiement, 
    nom_client, 
    email_client, 
    type_abonnement
) VALUES (
    1,  -- ⚠️ CHANGE THIS to your user ID
    1,  -- ⚠️ CHANGE THIS to your subscription ID
    29.99, 
    'paypal', 
    'Validé', 
    DATE_SUB(NOW(), INTERVAL 30 DAY), 
    'Test User - Today', 
    'today@test.com', 
    'Premium'
);

-- Test 3: EXPIRING IN 7 DAYS
-- Payment date: 23 days ago (expires in 7 days)
INSERT INTO payments (
    id_user, 
    id_abonnement, 
    montant, 
    methode_paiement, 
    statut, 
    date_paiement, 
    nom_client, 
    email_client, 
    type_abonnement
) VALUES (
    1,  -- ⚠️ CHANGE THIS to your user ID
    1,  -- ⚠️ CHANGE THIS to your subscription ID
    29.99, 
    'carte', 
    'Validé', 
    DATE_SUB(NOW(), INTERVAL 23 DAY), 
    'Test User - 7 Days', 
    '7days@test.com', 
    'Premium'
);

-- Test 4: EXPIRING IN 14 DAYS
-- Payment date: 16 days ago (expires in 14 days)
INSERT INTO payments (
    id_user, 
    id_abonnement, 
    montant, 
    methode_paiement, 
    statut, 
    date_paiement, 
    nom_client, 
    email_client, 
    type_abonnement
) VALUES (
    1,  -- ⚠️ CHANGE THIS to your user ID
    1,  -- ⚠️ CHANGE THIS to your subscription ID
    29.99, 
    'carte', 
    'Validé', 
    DATE_SUB(NOW(), INTERVAL 16 DAY), 
    'Test User - 14 Days', 
    '14days@test.com', 
    'Premium'
);

-- Test 5: BANK TRANSFER with validation date (expiring in 5 days)
-- Payment date: 30 days ago, Validation date: 25 days ago
INSERT INTO payments (
    id_user, 
    id_abonnement, 
    montant, 
    methode_paiement, 
    statut, 
    date_paiement, 
    date_validation,
    nom_client, 
    email_client, 
    type_abonnement
) VALUES (
    1,  -- ⚠️ CHANGE THIS to your user ID
    1,  -- ⚠️ CHANGE THIS to your subscription ID
    29.99, 
    'virement', 
    'Validé', 
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    DATE_SUB(NOW(), INTERVAL 25 DAY), 
    'Test User - Bank Transfer', 
    'bank@test.com', 
    'Premium'
);

-- Test 6: NO REMINDER (expires in 20 days - outside threshold)
-- Payment date: 10 days ago (expires in 20 days)
INSERT INTO payments (
    id_user, 
    id_abonnement, 
    montant, 
    methode_paiement, 
    statut, 
    date_paiement, 
    nom_client, 
    email_client, 
    type_abonnement
) VALUES (
    1,  -- ⚠️ CHANGE THIS to your user ID
    1,  -- ⚠️ CHANGE THIS to your subscription ID
    29.99, 
    'carte', 
    'Validé', 
    DATE_SUB(NOW(), INTERVAL 10 DAY), 
    'Test User - No Reminder', 
    'noreminder@test.com', 
    'Premium'
);

-- ============================================================================
-- VERIFY TEST DATA
-- ============================================================================

SELECT 
    '=== Test Payments Created ===' as Info;

SELECT 
    id_payment,
    id_user,
    nom_client,
    type_abonnement,
    methode_paiement,
    date_paiement,
    date_validation,
    CASE 
        WHEN methode_paiement = 'virement' THEN DATE_ADD(date_validation, INTERVAL 30 DAY)
        ELSE DATE_ADD(date_paiement, INTERVAL 30 DAY)
    END as expiration_date,
    CASE 
        WHEN methode_paiement = 'virement' THEN DATEDIFF(DATE_ADD(date_validation, INTERVAL 30 DAY), NOW())
        ELSE DATEDIFF(DATE_ADD(date_paiement, INTERVAL 30 DAY), NOW())
    END as days_until_expiration,
    CASE 
        WHEN CASE 
            WHEN methode_paiement = 'virement' THEN DATEDIFF(DATE_ADD(date_validation, INTERVAL 30 DAY), NOW())
            ELSE DATEDIFF(DATE_ADD(date_paiement, INTERVAL 30 DAY), NOW())
        END < 0 THEN 'EXPIRED'
        WHEN CASE 
            WHEN methode_paiement = 'virement' THEN DATEDIFF(DATE_ADD(date_validation, INTERVAL 30 DAY), NOW())
            ELSE DATEDIFF(DATE_ADD(date_paiement, INTERVAL 30 DAY), NOW())
        END = 0 THEN 'EXPIRING_TODAY'
        WHEN CASE 
            WHEN methode_paiement = 'virement' THEN DATEDIFF(DATE_ADD(date_validation, INTERVAL 30 DAY), NOW())
            ELSE DATEDIFF(DATE_ADD(date_paiement, INTERVAL 30 DAY), NOW())
        END <= 14 THEN 'EXPIRING_SOON'
        ELSE 'NO_REMINDER'
    END as expected_reminder_type
FROM payments
WHERE nom_client LIKE 'Test User%'
ORDER BY days_until_expiration;

-- ============================================================================
-- CLEANUP (Run this to remove test data)
-- ============================================================================
-- DELETE FROM payments WHERE nom_client LIKE 'Test User%';
