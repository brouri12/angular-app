-- Create payments table for storing payment transactions
-- This table stores all payment information including bank transfer receipts

USE user_db;

CREATE TABLE IF NOT EXISTS payments (
    id_payment BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT,
    id_abonnement BIGINT,
    nom_client VARCHAR(255) NOT NULL,
    email_client VARCHAR(255) NOT NULL,
    type_abonnement VARCHAR(100) NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    methode_paiement VARCHAR(50) NOT NULL COMMENT 'carte, paypal, virement',
    statut VARCHAR(50) NOT NULL DEFAULT 'En attente' COMMENT 'Validé, En attente, Rejeté',
    reference_transaction VARCHAR(255) NOT NULL UNIQUE,
    stripe_payment_id VARCHAR(255),
    receipt_url VARCHAR(500) COMMENT 'Path to uploaded receipt file for bank transfers',
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP NULL COMMENT 'When admin validated/rejected the payment',
    validated_by BIGINT COMMENT 'Admin user ID who validated/rejected',
    notes TEXT COMMENT 'Admin notes about the payment',
    
    INDEX idx_user (id_user),
    INDEX idx_statut (statut),
    INDEX idx_methode (methode_paiement),
    INDEX idx_date (date_paiement),
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some sample data for testing (optional)
-- INSERT INTO payments (id_user, nom_client, email_client, type_abonnement, montant, methode_paiement, statut, reference_transaction)
-- VALUES 
-- (1, 'John Doe', 'john@example.com', 'Pro Plan', 29.00, 'carte', 'Validé', 'STRIPE-1234567890'),
-- (2, 'Jane Smith', 'jane@example.com', 'Premium Plan', 99.00, 'virement', 'En attente', 'BANK-9876543210');

SELECT 'Payments table created successfully!' AS message;
