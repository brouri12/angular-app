-- ============================================================
-- 01_clear_data.sql
-- Clears all game and progress data
-- Paste in phpMyAdmin SQL tab → gamified_learning database
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE submission_answers;
TRUNCATE TABLE submissions;
TRUNCATE TABLE question_options;
TRUNCATE TABLE questions;
TRUNCATE TABLE games;
TRUNCATE TABLE player_session;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All data cleared successfully.' AS status;
