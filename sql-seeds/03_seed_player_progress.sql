-- ============================================================
-- 03_seed_player_progress.sql
-- Creates a test player session with XP and progress
-- Import AFTER 02_seed_games_and_questions.sql
-- ============================================================

USE gamified_learning;

-- Test player session (default-user)
INSERT INTO player_session (user_id, lives, level, progress_bar, games_won, games_lost, total_games_played, total_x_p, win_streak, best_streak, total_stars, created_at, updated_at)
VALUES ('default-user', 3, 3, 45, 8, 3, 11, 245, 2, 5, 24, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  level = 3, progress_bar = 45, games_won = 8, games_lost = 3,
  total_games_played = 11, total_x_p = 245, win_streak = 2, best_streak = 5,
  total_stars = 24, updated_at = NOW();

-- Sample submissions for testing stats
INSERT INTO submissions (game_id, user_id, status, score, correct_answers, total_questions, completion_time, feedback, submitted_at) VALUES
(1, 'default-user', 'PASSED',  90, 9, 10, 45,  'Excellent! 9/10 correct (90.0%). You passed!',          NOW() - INTERVAL 5 DAY),
(1, 'default-user', 'PASSED',  80, 8, 10, 52,  'Good job! 8/10 correct (80.0%). You passed!',           NOW() - INTERVAL 4 DAY),
(2, 'default-user', 'PARTIAL', 60, 4,  8, 120, 'Not bad! 4/8 correct (50.0%). Review and try again!',   NOW() - INTERVAL 3 DAY),
(3, 'default-user', 'PASSED',  70, 6,  8, 90,  'Good job! 6/8 correct (75.0%). You passed!',            NOW() - INTERVAL 2 DAY),
(4, 'default-user', 'PASSED', 100, 10, 10, 38, 'Excellent! 10/10 correct (100.0%). Perfect score!',     NOW() - INTERVAL 1 DAY),
(1, 'default-user', 'FAILED',  30, 3, 10, 200, 'You got 3/10 correct (30.0%). Don''t give up!',         NOW() - INTERVAL 6 HOUR);

SELECT CONCAT('Player sessions: ', COUNT(*)) AS status FROM player_session;
SELECT CONCAT('Submissions: ', COUNT(*)) AS status FROM submissions;
