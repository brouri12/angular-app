-- Clean up test users from database
-- Run this in MySQL Workbench or command line

USE user_db;

-- Show current users
SELECT id_user, username, email, role FROM users;

-- Delete test users (adjust the email/username as needed)
-- DELETE FROM users WHERE email LIKE '%test%';
-- DELETE FROM users WHERE email = 'your-test-email@example.com';

-- Or delete all users to start fresh (CAREFUL!)
-- DELETE FROM users;

-- Reset auto increment
-- ALTER TABLE users AUTO_INCREMENT = 1;
