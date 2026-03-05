-- ================================================
-- MISE A JOUR IMMEDIATE DES PRIX EN TND
-- Executez ce script dans phpMyAdmin MAINTENANT
-- ================================================

USE abonnement_db;

-- Mise a jour des prix
UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';

-- Verification
SELECT 
    id_abonnement as 'ID',
    nom as 'Plan',
    prix as 'Prix TND',
    duree_jours as 'Duree',
    statut as 'Statut'
FROM abonnements
ORDER BY prix ASC;
