# Library & Game Services - Fixed Issues

## Overview
This project contains microservices for a library management system and game service, built with Spring Boot (backend) and Angular (frontend).

## Fixed Issues

### 1. ✅ Library Service Compilation Errors (JDK 17 Compatibility)

**Problem:**
- Library service failed to compile with 36 errors
- Lombok version 1.18.34 was incompatible with the system's JDK 21
- Missing getters/setters for entity classes (Book, Loan, Reservation, Purchase)

**Root Cause:**
- System was using JDK 21, but Lombok 1.18.34 doesn't support JDK 21
- The `error.log` showed: `java.lang.NoSuchFieldException: com.sun.tools.javac.code.TypeTag :: UNKNOWN`

**Solution:**
- Downgraded Lombok to version 1.18.30 (compatible with JDK 17)
- Fixed corrupted `pom.xml` (missing `<properties>` tag)
- Created build script `build-with-jdk17.ps1` to enforce JDK 17 usage
- Configured Maven compiler plugin to use JDK 17 with `release` parameter

**Files Modified:**
- `library-service/pom.xml` - Updated Lombok version and compiler configuration
- `library-service/build-with-jdk17.ps1` - New build script for JDK 17

**Build Command:**
```powershell
# Use the provided script
.\build-with-jdk17.ps1

# Or manually set JAVA_HOME
$env:JAVA_HOME="C:\Users\hsaya\.jdk\jdk-17.0.16"
mvn clean install
```

### 2. ✅ Book Cover Images Not Displaying

**Problem:**
- Book cover images were not appearing in the library frontend
- Images were not showing in the back-office admin panel table

**Root Cause:**
- Frontend was checking if `coverImageUrl` starts with 'http', otherwise returning empty string
- Relative URLs from backend (e.g., `/library/files/uuid.jpg`) were being ignored
- Back-office was using raw `book.coverImageUrl` without converting to full URL

**Solution:**
- Updated `frontend/angular-app/src/app/pages/library/library.ts`:
  - Changed `getCoverUrl()` to use `libraryService.getFileUrl()` helper
  - This properly converts relative paths to full URLs
- Updated `back-office/src/app/pages/library-admin/library-admin.html`:
  - Changed image src from `book.coverImageUrl` to `getFilePreviewUrl(book.coverImageUrl)`
  - This ensures proper URL construction for both relative and absolute paths

**Files Modified:**
- `frontend/angular-app/src/app/pages/library/library.ts`
- `back-office/src/app/pages/library-admin/library-admin.html`

### 3. ✅ Removed Extra Markdown Files

**Problem:**
- Multiple .md files existed beyond README.md

**Solution:**
- Removed `game-service/BACKEND_IMPROVEMENTS.md`
- Removed `game-service/QUICK_BUILD_GUIDE.md`
- Removed `game-service/POM_CHANGES.md`
- Kept only README.md files as requested

## Project Structure

```
├── ApiGateway/              # API Gateway service
├── EurekaServer/            # Service discovery
├── library-service/         # Library management backend
│   ├── src/                 # Java source code
│   ├── pom.xml             # Maven configuration (FIXED)
│   └── build-with-jdk17.ps1 # Build script for JDK 17 (NEW)
├── game-service/            # Game service backend
├── frontend/                # Angular frontend (user-facing)
│   └── angular-app/
├── back-office/             # Angular admin panel
└── sql-seeds/               # Database seed files
```

## Requirements

### Backend (Java Services)
- **JDK 17.0.16** (Required for library-service)
- Maven 3.6+
- MySQL 8.0+

### Frontend (Angular)
- Node.js 18+
- npm 11.8.0
- Angular CLI 21.1.4

## Running the Services

### 1. Start Backend Services

#### Library Service (with JDK 17)
```powershell
cd library-service
.\build-with-jdk17.ps1
```

Or manually:
```powershell
$env:JAVA_HOME="C:\Users\hsaya\.jdk\jdk-17.0.16"
$env:PATH="C:\Users\hsaya\.jdk\jdk-17.0.16\bin;$env:PATH"
mvn spring-boot:run
```

#### Game Service
```bash
cd game-service
mvn spring-boot:run
```

#### Eureka Server
```bash
cd EurekaServer
mvn spring-boot:run
```

#### API Gateway
```bash
cd ApiGateway
mvn spring-boot:run
```

### 2. Start Frontend Applications

#### User Frontend
```bash
cd frontend/angular-app
npm install
npm start
```
Access at: http://localhost:4200

#### Back Office Admin
```bash
cd back-office
npm install
npm start
```
Access at: http://localhost:4201

## Service Ports

| Service | Port |
|---------|------|
| Eureka Server | 8761 |
| API Gateway | 8888 |
| Library Service | 8078 |
| Game Service | 9001 |
| Frontend | 4200 |
| Back Office | 4201 |

## Database Configuration

Update `application.yml` or `application.properties` in each service:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/library_db
    username: your_username
    password: your_password
```

## File Uploads

Book cover images and PDFs are stored in:
- Default: `library-service/uploads/`
- Configurable via `file.upload-dir` property

Files are served at: `http://localhost:8078/library/files/{filename}`

## API Endpoints

### Library Service
- `GET /library/books` - Get all books
- `GET /library/books/{id}` - Get book by ID
- `POST /library/books` - Create book (admin)
- `PUT /library/books/{id}` - Update book (admin)
- `DELETE /library/books/{id}` - Delete book (admin)
- `POST /library/files/upload` - Upload file
- `GET /library/files/{filename}` - Serve file

### Game Service
- `GET /api/games` - List all games
- `GET /api/games/{id}/play` - Get game content
- `POST /api/games/{id}/submit` - Submit answers
- `GET /api/leaderboard/xp` - Top players by XP
- `GET /api/achievements` - Get achievements
- `GET /api/statistics/platform` - Platform statistics

## Troubleshooting

### Library Service Won't Compile
- Ensure you're using JDK 17 (not JDK 21)
- Run `java -version` to verify
- Use the provided `build-with-jdk17.ps1` script
- Clear Maven cache: `mvn clean`

### Images and PDFs Not Loading ⚠️

**This is the most common issue!** If book cover images or PDFs don't appear:

#### Quick Fix:
1. **Check if library-service is running:**
   ```bash
   curl http://localhost:8078/library/books
   ```

2. **Fix database URLs:**
   ```bash
   cd library-service
   mysql -u root -p -P 3307 < fix-image-urls.sql
   ```
   This script will:
   - Backup your book table
   - Fix all image and PDF URLs to the correct format
   - Show before/after comparison

3. **Restart library-service:**
   ```bash
   cd library-service
   .\build-with-jdk17.ps1
   mvn spring-boot:run
   ```

4. **Clear browser cache** (Ctrl+Shift+Delete) and refresh

#### Detailed Troubleshooting:
See `library-service/TROUBLESHOOTING.md` for:
- Step-by-step debugging guide
- Common issues and solutions
- How to test file endpoints
- Database URL format requirements

#### Test File Endpoint:
```bash
# List uploaded files
ls library-service/uploads/

# Test a specific file (replace filename)
curl -I http://localhost:8078/library/files/YOUR_FILENAME.jpg
```

Should return `200 OK` with `Content-Type: image/jpeg`

### Frontend Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Angular cache: `rm -rf .angular/cache`

## Development Notes

- **Lombok**: Version 1.18.30 is used for JDK 17 compatibility
- **Spring Boot**: Version 3.2.5
- **Angular**: Version 21.1.0
- **TypeScript**: Version 5.9.2

## License

[Your License Here]

## Contributors

[Your Contributors Here]
