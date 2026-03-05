-- Simple Test Data Creation
-- Run this with: mysql -u root -p -P 3307 elearning_db < SIMPLE_TEST_DATA.sql

USE elearning_db;

-- First, check what user and subscription IDs exist
SELECT 'Available Users:' as Info;
SELECT id_user, username, email FROM users LIMIT 3;

SELECT 'Available Subscriptions:' as Info;
SELECT id_abonnement, nom, duree_jours FROM abonnements LIMIT 3;

-- Create test payments
-- IMPORTANT: Change @user_id and @sub_id to match your actual IDs

SET @user_id = 1;  -- ⚠️ CHANGE THIS
SET @sub_id = 1;   -- ⚠️ CHANGE THIS

-- Test 1: EXPIRED (5 days ago)
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, nom_client, email_client, type_abonnement)
VALUES (@user_id, @sub_id, 29.99, 'carte', 'Validé', DATE_SUB(NOW(), INTERVAL 35 DAY), 'Test Expired', 'expired@test.com', 'Premium');

-- Test 2: EXPIRING TODAY
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, nom_client, email_client, type_abonnement)
VALUES (@user_id, @sub_id, 29.99, 'paypal', 'Validé', DATE_SUB(NOW(), INTERVAL 30 DAY), 'Test Today', 'today@test.com', 'Premium');

-- Test 3: EXPIRING IN 7 DAYS
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, nom_client, email_client, type_abonnement)
VALUES (@user_id, @sub_id, 29.99, 'carte', 'Validé', DATE_SUB(NOW(), INTERVAL 23 DAY), 'Test 7Days', '7days@test.com', 'Premium');

-- Verify
SELECT 
    id_payment,
    nom_client,
    DATE_ADD(date_paiement, INTERVAL 30 DAY) as expiration_date,
    DATEDIFF(DATE_ADD(date_paiement, INTERVAL 30 DAY), NOW()) as days_until_expiration
FROM payments
WHERE nom_client LIKE 'Test%'
ORDER BY days_until_expiration;
