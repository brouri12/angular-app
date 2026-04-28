-- Advanced Forum Features Database Migration
-- Creates tables for: Multimedia Integration, Email Notifications, AI Chatbot

-- ============================================================================
-- MULTIMEDIA INTEGRATION TABLES
-- ============================================================================

-- MediaFile table: Stores metadata for uploaded images, videos, audio, and documents
CREATE TABLE IF NOT EXISTS media_file (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    media_type VARCHAR(20) NOT NULL COMMENT 'IMAGE, VIDEO, AUDIO, DOCUMENT',
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    video_platform VARCHAR(20) COMMENT 'YOUTUBE, VIMEO',
    video_identifier VARCHAR(100),
    transcription TEXT,
    transcription_language VARCHAR(10),
    upload_date DATETIME NOT NULL,
    uploader_id BIGINT NOT NULL,
    malware_scanned BOOLEAN DEFAULT FALSE,
    scan_result VARCHAR(50),
    INDEX idx_message_id (message_id),
    INDEX idx_media_type (media_type),
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EMAIL NOTIFICATION TABLES
-- ============================================================================

-- EmailPreference table: Stores user email notification preferences
CREATE TABLE IF NOT EXISTS email_preference (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    welcome_emails BOOLEAN DEFAULT TRUE,
    reply_notifications BOOLEAN DEFAULT TRUE,
    weekly_digests BOOLEAN DEFAULT TRUE,
    mention_alerts BOOLEAN DEFAULT TRUE,
    daily_summaries BOOLEAN DEFAULT FALSE,
    unread_reminders BOOLEAN DEFAULT TRUE,
    unsubscribe_all BOOLEAN DEFAULT FALSE,
    created_date DATETIME NOT NULL,
    updated_date DATETIME,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EmailLog table: Logs all email delivery attempts
CREATE TABLE IF NOT EXISTS email_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    email_type VARCHAR(20) NOT NULL COMMENT 'WELCOME, REPLY, MENTION, DIGEST, SUMMARY, REMINDER',
    subject VARCHAR(255),
    sent_date DATETIME NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_email_type (email_type),
    INDEX idx_sent_date (sent_date),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AI CHATBOT TABLES
-- ============================================================================

-- ChatbotConversation table: Stores conversation history for context management
CREATE TABLE IF NOT EXISTS chatbot_conversation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'USER, ASSISTANT',
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    session_id VARCHAR(100),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ChatbotLog table: Logs all chatbot interactions for monitoring and analytics
CREATE TABLE IF NOT EXISTS chatbot_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    response_time_ms BIGINT,
    helpful BOOLEAN,
    flagged_for_review BOOLEAN DEFAULT FALSE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_flagged (flagged_for_review)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ChatbotKnowledgeBase table: Indexes forum content for chatbot training
CREATE TABLE IF NOT EXISTS chatbot_knowledge_base (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_faq BOOLEAN DEFAULT FALSE,
    indexed_date DATETIME NOT NULL,
    last_updated DATETIME,
    INDEX idx_message_id (message_id),
    INDEX idx_is_faq (is_faq),
    INDEX idx_indexed_date (indexed_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- NOTES
-- ============================================================================
-- Foreign key constraints are intentionally omitted to avoid circular dependencies
-- with existing tables (message_forum, user). The application layer will enforce
-- referential integrity.
-- 
-- Indexes are added for:
-- - Foreign key columns for join performance
-- - Frequently queried columns (dates, types, flags)
-- - Columns used in WHERE clauses and ORDER BY
