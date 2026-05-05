# Library Service - Image & PDF Troubleshooting Guide

## Issue: Images and PDFs Not Displaying

### Quick Checklist

1. **Is the library-service running?**
   ```bash
   curl http://localhost:8078/library/books
   ```
   Should return JSON array of books.

2. **Check if files exist in uploads directory:**
   ```bash
   ls library-service/uploads/
   ```

3. **Test file endpoint directly:**
   ```bash
   # Replace {filename} with an actual file from uploads/
   curl -I http://localhost:8078/library/files/{filename}
   ```
   Should return `200 OK` with appropriate Content-Type.

4. **Check browser console for errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for 404 or CORS errors

5. **Check Network tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "Img" or "Doc"
   - Click on failed requests to see the URL being requested

### Common Issues & Solutions

#### 1. 404 Not Found on Image URLs

**Symptom:** Browser shows 404 errors for image URLs like:
- `http://localhost:8078/library/files/abc123.jpg`

**Possible Causes:**
- File doesn't exist in `uploads/` directory
- Database has incorrect URL (missing `/library/files/` prefix)
- Filename in database doesn't match actual file

**Solution:**
```sql
-- Check what's in the database
SELECT id, title, coverImageUrl, pdfUrl FROM book;

-- URLs should look like: /library/files/uuid-filename.jpg
-- NOT like: uploads/uuid-filename.jpg
-- NOT like: http://localhost:8078/library/files/uuid-filename.jpg
```

If URLs are wrong, update them:
```sql
-- Fix URLs that are missing the /library/files/ prefix
UPDATE book 
SET coverImageUrl = CONCAT('/library/files/', coverImageUrl)
WHERE coverImageUrl NOT LIKE '/library/files/%' 
  AND coverImageUrl NOT LIKE 'http%'
  AND coverImageUrl IS NOT NULL 
  AND coverImageUrl != '';

UPDATE book 
SET pdfUrl = CONCAT('/library/files/', pdfUrl)
WHERE pdfUrl NOT LIKE '/library/files/%' 
  AND pdfUrl NOT LIKE 'http%'
  AND pdfUrl IS NOT NULL 
  AND pdfUrl != '';
```

#### 2. CORS Errors

**Symptom:** Browser console shows:
```
Access to image at 'http://localhost:8078/library/files/...' from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution:**
- Ensure `CorsConfig.java` allows `http://localhost:*`
- Restart library-service after any config changes
- Clear browser cache (Ctrl+Shift+Delete)

#### 3. Images Load in Backend but Not Frontend

**Symptom:**
- Direct URL works: `http://localhost:8078/library/files/abc123.jpg`
- But doesn't show in Angular app

**Possible Causes:**
- Frontend is constructing URL incorrectly
- Environment configuration is wrong

**Solution:**
Check `frontend/angular-app/src/environments/environment.ts`:
```typescript
export const environment = {
  libraryServiceUrl: 'http://localhost:8078',  // Should NOT have trailing slash
  // ...
};
```

Check browser DevTools Network tab to see the actual URL being requested.

#### 4. PDFs Won't Open

**Symptom:** PDF links don't work or download instead of displaying

**Solution:**
The `FileUploadController` is configured to serve PDFs inline. Check:
1. PDF file exists in `uploads/` directory
2. URL in database is correct: `/library/files/filename.pdf`
3. Browser console for errors

Test PDF endpoint:
```bash
curl -I http://localhost:8078/library/files/your-file.pdf
```

Should return:
```
HTTP/1.1 200 
Content-Type: application/pdf
Content-Disposition: inline; filename="your-file.pdf"
```

### Database URL Format

**Correct formats:**
- Relative path: `/library/files/abc123-filename.jpg`
- Full URL: `http://localhost:8078/library/files/abc123-filename.jpg`
- External URL: `https://example.com/image.jpg`

**Incorrect formats:**
- `uploads/abc123-filename.jpg` ❌
- `abc123-filename.jpg` ❌
- `/uploads/abc123-filename.jpg` ❌

### Testing File Upload

Test the upload endpoint:
```bash
curl -X POST http://localhost:8078/library/files/upload \
  -F "file=@/path/to/your/image.jpg"
```

Should return:
```json
{
  "url": "/library/files/uuid-image.jpg"
}
```

### Debugging Steps

1. **Check library-service logs:**
   Look for errors when accessing `/library/files/` endpoints

2. **Verify file permissions:**
   ```bash
   ls -la library-service/uploads/
   ```
   Files should be readable

3. **Test with a simple image:**
   - Download a small test image
   - Upload via back-office admin panel
   - Check if it appears in the table
   - Check browser DevTools Network tab

4. **Check database directly:**
   ```sql
   SELECT id, title, coverImageUrl, bookType, pdfUrl 
   FROM book 
   WHERE coverImageUrl IS NOT NULL OR pdfUrl IS NOT NULL;
   ```

5. **Verify FileUploadController is working:**
   ```bash
   # List files in uploads
   ls library-service/uploads/
   
   # Pick a filename and test
   curl http://localhost:8078/library/files/YOUR_FILENAME_HERE.jpg --output test.jpg
   
   # Check if test.jpg was downloaded successfully
   file test.jpg
   ```

### Still Not Working?

1. **Restart everything:**
   ```bash
   # Stop library-service
   # Stop frontend
   # Clear browser cache
   # Start library-service
   # Start frontend
   ```

2. **Check for port conflicts:**
   ```bash
   netstat -ano | findstr :8078
   ```

3. **Verify Java version:**
   ```bash
   java -version
   # Should show Java 17
   ```

4. **Check MySQL connection:**
   ```bash
   mysql -u root -p -h localhost -P 3307
   USE library_db;
   SHOW TABLES;
   ```

### Quick Fix Script

Run this SQL to fix common URL issues:
```sql
-- Backup first!
CREATE TABLE book_backup AS SELECT * FROM book;

-- Fix coverImageUrl
UPDATE book 
SET coverImageUrl = CASE
    WHEN coverImageUrl LIKE 'http%' THEN coverImageUrl
    WHEN coverImageUrl LIKE '/library/files/%' THEN coverImageUrl
    WHEN coverImageUrl LIKE 'uploads/%' THEN CONCAT('/library/files/', SUBSTRING(coverImageUrl, 9))
    WHEN coverImageUrl LIKE '/%' THEN CONCAT('/library/files', coverImageUrl)
    WHEN coverImageUrl IS NOT NULL AND coverImageUrl != '' THEN CONCAT('/library/files/', coverImageUrl)
    ELSE coverImageUrl
END
WHERE coverImageUrl IS NOT NULL;

-- Fix pdfUrl
UPDATE book 
SET pdfUrl = CASE
    WHEN pdfUrl LIKE 'http%' THEN pdfUrl
    WHEN pdfUrl LIKE '/library/files/%' THEN pdfUrl
    WHEN pdfUrl LIKE 'uploads/%' THEN CONCAT('/library/files/', SUBSTRING(pdfUrl, 9))
    WHEN pdfUrl LIKE '/%' THEN CONCAT('/library/files', pdfUrl)
    WHEN pdfUrl IS NOT NULL AND pdfUrl != '' THEN CONCAT('/library/files/', pdfUrl)
    ELSE pdfUrl
END
WHERE pdfUrl IS NOT NULL;

-- Verify
SELECT id, title, coverImageUrl, pdfUrl FROM book;
```

### Contact

If none of these solutions work, provide:
1. Browser console errors (screenshot)
2. Network tab showing failed requests (screenshot)
3. Output of `SELECT * FROM book LIMIT 1;`
4. Output of `ls library-service/uploads/ | head -5`
5. Library-service logs
