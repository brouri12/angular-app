CREATE TABLE IF NOT EXISTS review_todos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    chapter_title VARCHAR(255) NOT NULL,
    question_title VARCHAR(255) NOT NULL,
    review_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'TODO',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_review_todos_user (user_id),
    INDEX idx_review_todos_review_date (review_date),
    INDEX idx_review_todos_status (status)
);
