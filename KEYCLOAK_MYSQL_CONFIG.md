# Configure Keycloak with MySQL

## Step 1: Create MySQL Database

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on "SQL" tab
3. Run this SQL:

```sql
CREATE DATABASE IF NOT EXISTS keycloak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use the command line:
```bash
mysql -u root -p -P 3307 -h localhost
CREATE DATABASE keycloak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

## Step 2: Download MySQL JDBC Driver

1. Download MySQL Connector/J from:
   https://dev.mysql.com/downloads/connector/j/

   Or direct link for version 8.0.33:
   https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-8.0.33.zip

2. Extract the ZIP file

3. Copy the JAR file `mysql-connector-j-8.0.33.jar` to:
   ```
   C:\keycloak-23.0.0\providers\
   ```

## Step 3: Configure Keycloak to Use MySQL

Create a configuration file at: `C:\keycloak-23.0.0\conf\keycloak.conf`

Add these lines:

```properties
# Database configuration
db=mysql
db-url=jdbc:mysql://localhost:3307/keycloak_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
db-username=root
db-password=

# Hostname configuration
hostname-strict=false
hostname-strict-https=false

# HTTP configuration
http-enabled=true
http-port=9090
```

## Step 4: Build Keycloak Configuration

Run this command to build the configuration:

```powershell
cd C:\keycloak-23.0.0
bin\kc.bat build
```

## Step 5: Start Keycloak with MySQL

```powershell
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

## Step 6: Create Admin User (First Time Only)

If you haven't created an admin user yet, set environment variables before starting:

```powershell
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
bin\kc.bat start-dev --http-port=9090
```

## Verification

1. Check MySQL database:
   - Open phpMyAdmin
   - Select `keycloak_db` database
   - You should see many Keycloak tables created automatically

2. Access Keycloak:
   - URL: http://localhost:9090
   - Login: admin/admin

## Troubleshooting

### Error: "Driver not found"
- Make sure the MySQL connector JAR is in `C:\keycloak-23.0.0\providers\`
- Run `bin\kc.bat build` again

### Error: "Access denied for user"
- Check your MySQL credentials in `keycloak.conf`
- Make sure MySQL is running on port 3307

### Error: "Unknown database"
- Create the database first using phpMyAdmin or MySQL command line

### Port 3307 vs 3306
- Your MySQL is on port 3307 (not default 3306)
- Make sure the db-url uses port 3307

## Quick Commands

```powershell
# Navigate to Keycloak directory
cd C:\keycloak-23.0.0

# Build configuration
bin\kc.bat build

# Start Keycloak
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
bin\kc.bat start-dev --http-port=9090
```
