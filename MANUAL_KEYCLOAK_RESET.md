# Manual Keycloak Reset - Step by Step

If the PowerShell scripts are not working, follow these manual steps.

## Step 1: Stop Keycloak

Open PowerShell and run:
```powershell
Get-Process java | Stop-Process -Force
```

Wait 5 seconds.

## Step 2: Delete Keycloak Data

Open PowerShell and run:
```powershell
Remove-Item C:\keycloak-23.0.0\data -Recurse -Force
```

If you get an error, that's OK - the folder might not exist.

## Step 3: Delete Old Config

Open PowerShell and run:
```powershell
Remove-Item C:\keycloak-23.0.0\conf\keycloak.conf -Force
```

If you get an error, that's OK - the file might not exist.

## Step 4: Create New Config

1. Open Notepad
2. Copy and paste this text:
```
hostname-strict=false
hostname-strict-https=false
http-enabled=true
http-port=9090
```
3. Save as: `C:\keycloak-23.0.0\conf\keycloak.conf`
4. Make sure "Save as type" is "All Files" (not .txt)

## Step 5: Start Keycloak

Open PowerShell and run:
```powershell
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

Wait for the message: "Keycloak 23.0.0 started in XXXms"

This will take 1-2 minutes. Don't close the window!

## Step 6: Create Admin User

1. Open browser
2. Go to: http://localhost:9090
3. You should see "Welcome to Keycloak"
4. Enter:
   - Username: `admin`
   - Password: `admin`
5. Click "Create"
6. Click "Administration Console"
7. Login with admin/admin

## Step 7: Configure Keycloak

Open a NEW PowerShell window (don't close the Keycloak one!) and run:
```powershell
cd C:\Users\marwe\Desktop\e_learnig-platform
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

Wait for "CONFIGURATION TERMINEE!"

## Step 8: Restart UserService

1. In IntelliJ, stop UserService
2. Wait 5 seconds
3. Run `UserApplication.java` again
4. Wait for "Started UserApplication"

## Step 9: Test Registration

Open PowerShell and run:
```powershell
.\TEST_REGISTRATION.ps1
```

Should show "SUCCESS! User registered"

## Step 10: Test in Browser

1. Open http://localhost:4200
2. Click "Sign In"
3. Click "Don't have an account? Register"
4. Fill the form with:
   - Username: testuser123
   - Email: test123@example.com
   - Password: Test123!
   - Role: STUDENT
   - Fill other fields
5. Click "Register"

Should show success message!

---

## If Step 5 Fails (Keycloak Won't Start)

Check the error message in the console. Common issues:

### "Port 9090 is already in use"
```powershell
# Find what's using port 9090
netstat -ano | findstr "9090"

# Kill the process (replace XXXX with the PID from above)
taskkill /PID XXXX /F

# Try starting Keycloak again
```

### "JAVA_HOME is not set"
This is just a warning, ignore it. Keycloak will still work.

### Database errors
If you see SQL errors or database errors, make sure you deleted the data folder:
```powershell
Remove-Item C:\keycloak-23.0.0\data -Recurse -Force
```

Then try starting Keycloak again.

---

## Verification

After all steps, verify:
- [ ] Keycloak console shows "Keycloak started"
- [ ] http://localhost:9090 opens Keycloak
- [ ] Can login to Keycloak admin with admin/admin
- [ ] Realm `wordly-realm` exists
- [ ] Client `wordly-client` exists
- [ ] Roles TEACHER, STUDENT, ADMIN exist
- [ ] UserService running in IntelliJ
- [ ] TEST_REGISTRATION.ps1 shows SUCCESS
- [ ] Can register in browser

---

## Quick Commands Summary

```powershell
# Stop Java
Get-Process java | Stop-Process -Force

# Delete data
Remove-Item C:\keycloak-23.0.0\data -Recurse -Force

# Delete config
Remove-Item C:\keycloak-23.0.0\conf\keycloak.conf -Force

# Start Keycloak
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090

# In NEW PowerShell window:
cd C:\Users\marwe\Desktop\e_learnig-platform
.\AUTO_CONFIGURE_KEYCLOAK.ps1

# Test
.\TEST_REGISTRATION.ps1
```
