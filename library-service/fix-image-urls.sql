-- ============================================================================
-- Fix Book Image and PDF URLs in Database
-- ============================================================================
-- This script fixes common URL format issues in the book table
-- Run this if images/PDFs are not displaying in the frontend
-- ============================================================================

USE library_db;

-- 1. Backup the book table first (IMPORTANT!)
DROP TABLE IF EXISTS book_backup;
CREATE TABLE book_backup AS SELECT * FROM book;

SELECT 'Backup created. Original data saved in book_backup table.' AS status;

-- 2. Show current URLs before fixing
SELECT '=== BEFORE FIX ===' AS status;
SELECT id, title, 
       coverImageUrl AS cover_before, 
       pdfUrl AS pdf_before 
FROM book 
WHERE coverImageUrl IS NOT NULL OR pdfUrl IS NOT NULL
LIMIT 10;

-- 3. Fix coverImageUrl
UPDATE book 
SET coverImageUrl = CASE
    -- Already correct: full HTTP URL
    WHEN coverImageUrl LIKE 'http%' THEN coverImageUrl
    
    -- Already correct: relative path with /library/files/
    WHEN coverImageUrl LIKE '/library/files/%' THEN coverImageUrl
    
    -- Fix: starts with 'uploads/' -> add /library/files/ prefix
    WHEN coverImageUrl LIKE 'uploads/%' THEN 
        CONCAT('/library/files/', SUBSTRING(coverImageUrl, 9))
    
    -- Fix: starts with '/' but not '/library/files/' -> prepend /library/files
    WHEN coverImageUrl LIKE '/%' THEN 
        CONCAT('/library/files', coverImageUrl)
    
    -- Fix: just filename -> add /library/files/ prefix
    WHEN coverImageUrl IS NOT NULL AND coverImageUrl != '' THEN 
        CONCAT('/library/files/', coverImageUrl)
    
    -- Leave NULL or empty as is
    ELSE coverImageUrl
END
WHERE coverImageUrl IS NOT NULL;

SELECT 'coverImageUrl fixed.' AS status;

-- 4. Fix pdfUrl
UPDATE book 
SET pdfUrl = CASE
    -- Already correct: full HTTP URL
    WHEN pdfUrl LIKE 'http%' THEN pdfUrl
    
    -- Already correct: relative path with /library/files/
    WHEN pdfUrl LIKE '/library/files/%' THEN pdfUrl
    
    -- Fix: starts with 'uploads/' -> add /library/files/ prefix
    WHEN pdfUrl LIKE 'uploads/%' THEN 
        CONCAT('/library/files/', SUBSTRING(pdfUrl, 9))
    
    -- Fix: starts with '/' but not '/library/files/' -> prepend /library/files
    WHEN pdfUrl LIKE '/%' THEN 
        CONCAT('/library/files', pdfUrl)
    
    -- Fix: just filename -> add /library/files/ prefix
    WHEN pdfUrl IS NOT NULL AND pdfUrl != '' THEN 
        CONCAT('/library/files/', pdfUrl)
    
    -- Leave NULL or empty as is
    ELSE pdfUrl
END
WHERE pdfUrl IS NOT NULL;

SELECT 'pdfUrl fixed.' AS status;

-- 5. Show URLs after fixing
SELECT '=== AFTER FIX ===' AS status;
SELECT id, title, 
       coverImageUrl AS cover_after, 
       pdfUrl AS pdf_after 
FROM book 
WHERE coverImageUrl IS NOT NULL OR pdfUrl IS NOT NULL
LIMIT 10;

-- 6. Verify all URLs are in correct format
SELECT '=== VERIFICATION ===' AS status;
SELECT 
    COUNT(*) AS total_books,
    SUM(CASE WHEN coverImageUrl IS NOT NULL AND coverImageUrl != '' THEN 1 ELSE 0 END) AS books_with_cover,
    SUM(CASE WHEN pdfUrl IS NOT NULL AND pdfUrl != '' THEN 1 ELSE 0 END) AS books_with_pdf,
    SUM(CASE WHEN coverImageUrl LIKE '/library/files/%' OR coverImageUrl LIKE 'http%' THEN 1 ELSE 0 END) AS correct_cover_urls,
    SUM(CASE WHEN pdfUrl LIKE '/library/files/%' OR pdfUrl LIKE 'http%' THEN 1 ELSE 0 END) AS correct_pdf_urls
FROM book;

-- 7. Show any remaining incorrect URLs (should be empty)
SELECT '=== REMAINING ISSUES (should be empty) ===' AS status;
SELECT id, title, coverImageUrl, pdfUrl
FROM book
WHERE (coverImageUrl IS NOT NULL 
       AND coverImageUrl != '' 
       AND coverImageUrl NOT LIKE '/library/files/%' 
       AND coverImageUrl NOT LIKE 'http%')
   OR (pdfUrl IS NOT NULL 
       AND pdfUrl != '' 
       AND pdfUrl NOT LIKE '/library/files/%' 
       AND pdfUrl NOT LIKE 'http%');

SELECT 'Done! If you need to rollback, run: DROP TABLE book; RENAME TABLE book_backup TO book;' AS status;
