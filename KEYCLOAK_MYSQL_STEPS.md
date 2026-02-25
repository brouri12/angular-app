# Keycloak MySQL Setup - Simple Steps

## Step 1: Create MySQL Database

Open phpMyAdmin: http://localhost/phpmyadmin

Click "SQL" tab and run:
```sql
CREATE DATABASE IF NOT EXISTS keycloak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Download MySQL Connector

1. Download from: https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-8.0.33.zip
2. Extract the ZIP file
3. Find the file: `mysql-connector-j-8.0.33.jar`
4. Copy it to: `C:\keycloak-23.0.0\providers\`

## Step 3: Copy Configuration File

Copy the file `keycloak.conf` from your project to:
```
C:\keycloak-23.0.0\conf\keycloak.conf
```

PowerShell command:
```powershell
Copy-Item keycloak.conf C:\keycloak-23.0.0\conf\keycloak.conf
```

## Step 4: Build Keycloak

Open PowerShell and run:
```powershell
cd C:\keycloak-23.0.0
bin\kc.bat build
```

Wait for it to complete (should take 10-30 seconds).

## Step 5: Start Keycloak

```powershell
cd C:\keycloak-23.0.0
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
bin\kc.bat start-dev --http-port=9090
```

Wait for the message: "Listening on: http://0.0.0.0:9090"

## Step 6: Access Keycloak

Open browser: http://localhost:9090

Login with:
- Username: `admin`
- Password: `admin`

## Verify MySQL Connection

In phpMyAdmin, select the `keycloak_db` database. You should see many tables created by Keycloak (like `USER_ENTITY`, `REALM`, `CLIENT`, etc.).

---

## Quick Reference

| Item | Value |
|------|-------|
| Keycloak URL | http://localhost:9090 |
| Admin Username | admin |
| Admin Password | admin |
| MySQL Database | keycloak_db |
| MySQL Port | 3307 |
| MySQL User | root |
| MySQL Password | (empty) |

---

## Troubleshooting

### "Driver not found"
- Make sure `mysql-connector-j-8.0.33.jar` is in `C:\keycloak-23.0.0\providers\`
- Run `bin\kc.bat build` again

### "Access denied"
- Check MySQL is running (XAMPP)
- Verify port 3307 in keycloak.conf

### "Unknown database"
- Create keycloak_db in phpMyAdmin first

### Database still locked (H2 error)
- Delete the old H2 database: `C:\keycloak-23.0.0\data\h2\`
- Or just ignore it - Keycloak will use MySQL now
