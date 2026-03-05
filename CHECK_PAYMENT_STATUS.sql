-- Check Payment Status for User 33
USE user_db;

-- Check if payment exists and is validated
SELECT 
    p.id_payment,
    p.id_user,
    p.id_abonnement,
    p.date_paiement,
    p.date_validation,
    p.methode_paiement,
    p.statut,
    p.valide,
    a.duree_jours,
    CASE 
        WHEN p.methode_paiement = 'virement' THEN DATE_ADD(p.date_validation, INTERVAL a.duree_jours DAY)
        ELSE DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY)
    END as expiration_date,
    CASE 
        WHEN p.methode_paiement = 'virement' THEN DATEDIFF(DATE_ADD(p.date_validation, INTERVAL a.duree_jours DAY), CURDATE())
        ELSE DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE())
    END as days_until_expiration
FROM payments p
LEFT JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.id_user = 33;

-- Check what the /validated endpoint would return
SELECT 
    p.*
FROM payments p
WHERE p.valide = 1 OR p.valide = true
  AND p.id_user = 33;
