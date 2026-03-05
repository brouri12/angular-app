-- Create Keycloak database
CREATE DATABASE IF NOT EXISTS keycloak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for Keycloak (optional, you can use root)
-- CREATE USER 'keycloak'@'localhost' IDENTIFIED BY 'keycloak123';
-- GRANT ALL PRIVILEGES ON keycloak_db.* TO 'keycloak'@'localhost';
-- FLUSH PRIVILEGES;

-- Show databases to verify
SHOW DATABASES;
