# Complete Guide to Fix Keycloak and Create Admin Account

## Problem
Keycloak database is corrupted because it's trying to use MySQL/MariaDB, which is incompatible with Keycloak's SQL syntax.

## Solution
Reset Keycloak to use H2 database (default embedded database) and reconfigure everything.

---

## Step 1: Clean Browser Storage (IMPORTANT!)

Before anything else, clear your browser's localStorage to remove old invalid tokens:

1. Open your browser (where you access http://localhost:4200)
2. Press `F12` to open Developer Tools
3. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Click on "Local Storage" → `http://localhost:4200`
5. Delete these keys:
   - `access_token`
   - `refresh_token`
6. Do the same for `http://localhost:4201` if you have it
7. Close Developer Tools
8. Refresh the page

---

## Step 2: Force Clean Keycloak to H2

Run this PowerShell script to completely reset Keycloak:

```powershell
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```

This script will:
- Stop Keycloak
- Delete ALL Keycloak data (including corrupted MySQL database)
- Configure Keycloak to use H2 (embedded database)
- Start Keycloak fresh

**IMPORTANT**: When prompted, type `DELETE` to confirm.

Wait for the script to complete. It will take about 60-90 seconds.

---

## Step 3: Create Initial Admin User in Keycloak

After the script completes:

1. Open http://localhost:9090 in your browser
2. You'll see "Welcome to Keycloak" page
3. Create initial admin user:
   - **Username**: `admin`
   - **Password**: `admin`
4. Click "Create"
5. Click "Administration Console"
6. Login with `admin` / `admin`

---

## Step 4: Configure Keycloak Automatically

Run this PowerShell script to configure realm, client, and roles:

```powershell
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

This script will:
- Create realm: `wordly-realm`
- Create client: `wordly-client` with secret `v9BVegPOBMnWfQHJHdswfY0EQXUIFSyy`
- Create roles: TEACHER, STUDENT, ADMIN
- Attempt to create admin user account

**If the script shows errors about creating the admin user**, that's OK! Continue to Step 5.

---

## Step 5: Restart UserService in IntelliJ

1. In IntelliJ, stop the UserService if it's running
2. Wait 5 seconds
3. Run `UserService/src/main/java/tn/esprit/user/UserApplication.java`
4. Wait for the console to show "Started UserApplication"

---

## Step 6: Create Admin Account

Run this PowerShell script to create the admin account:

```powershell
.\CREATE_ADMIN_ACCOUNT.ps1
```

This will create:
- **Email**: admin@wordly.com
- **Password**: Admin123!
- **Role**: ADMIN

If successful, you'll see "SUCCESS! Admin account created!"

---

## Step 7: Test Login

1. Open http://localhost:4200 in your browser
2. Click "Sign In"
3. Login with:
   - **Email**: admin@wordly.com
   - **Password**: Admin123!
4. You should be redirected to http://localhost:4201/dashboard

---

## Troubleshooting

### If Keycloak won't start:
- Check the Keycloak console window for errors
- Make sure port 9090 is not in use
- Try running manually: `cd C:\keycloak-23.0.0; bin\kc.bat start-dev --http-port=9090`

### If CREATE_ADMIN_ACCOUNT.ps1 fails with 500 error:
- Make sure Keycloak is running (http://localhost:9090)
- Make sure UserService is running (check IntelliJ console)
- Make sure API Gateway is running (port 8888)
- Check UserService logs in IntelliJ for detailed error messages

### If login shows 401 Unauthorized:
- Clear browser localStorage (see Step 1)
- Make sure you're using the correct credentials
- Check that Keycloak realm and client are configured correctly

### If you see "User already exists":
- The admin account was already created
- Try logging in with admin@wordly.com / Admin123!
- If you forgot the password, you can reset it in Keycloak admin console

---

## Summary of Ports

- **Frontend**: http://localhost:4200
- **Back-Office**: http://localhost:4201
- **API Gateway**: http://localhost:8888
- **UserService**: http://localhost:8085
- **AbonnementService**: http://localhost:8084
- **Eureka**: http://localhost:8761
- **Keycloak**: http://localhost:9090
- **MySQL**: localhost:3307

---

## Current Configuration

- **Keycloak Realm**: wordly-realm
- **Keycloak Client**: wordly-client
- **Client Secret**: v9BVegPOBMnWfQHJHdswfY0EQXUIFSyy
- **Roles**: TEACHER, STUDENT, ADMIN
- **Database**: H2 (embedded, no external database needed)

---

## Next Steps After Admin Account is Created

1. You can now create TEACHER and STUDENT accounts via the registration form
2. ADMIN can only be created via API (for security)
3. Test the complete flow:
   - Register as STUDENT
   - Login as STUDENT → stays on frontend
   - Login as ADMIN → redirects to back-office dashboard
