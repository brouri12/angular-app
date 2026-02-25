-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    abonnement_id BIGINT NOT NULL,
    abonnement_name VARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    auto_renew BOOLEAN DEFAULT FALSE,
    payment_id BIGINT,
    price DOUBLE,
    billing_cycle VARCHAR(20),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    cancelled_at DATETIME,
    cancellation_reason VARCHAR(500),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments
ALTER TABLE user_subscriptions 
COMMENT = 'Stores user subscription information with start/end dates and status';
