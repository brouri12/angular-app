# Fix Registration 500 Error

## 🔍 Problem

You can login with the admin account (which means it was created successfully), but when you try to register a NEW user, you get a 500 Internal Server Error.

## 🎯 Most Likely Cause

Keycloak is having issues creating new users. This usually happens when:
1. Keycloak database is corrupted
2. Keycloak admin credentials are wrong
3. Keycloak realm/client configuration is incomplete

## 🚀 Quick Fix (5 minutes)

### Step 1: Check System Status

Run this to see what's wrong:
```powershell
.\CHECK_SYSTEM_STATUS.ps1
```

Look for:
- ✗ Keycloak connection fails
- ✗ UserService cannot connect to Keycloak

### Step 2: Test Registration Directly

Run this to see the actual error:
```powershell
.\TEST_REGISTRATION.ps1
```

This will show you the exact error message from the server.

### Step 3: Check UserService Logs

Look at the IntelliJ console where UserService is running. You should see error messages like:
- `Failed to create user in Keycloak`
- `HTTP 500 Internal Server Error`
- `TokenManager.grantToken`
- Connection refused
- Authentication failed

### Step 4: Fix Based on Error

**If you see "Connection refused" or "Cannot connect to Keycloak":**
```powershell
# Keycloak is not running - start it
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

**If you see "Authentication failed" or "401 Unauthorized":**
```powershell
# Keycloak admin credentials are wrong
# Run the complete reset
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```

**If you see "Internal Server Error" or database errors:**
```powershell
# Keycloak database is corrupted
# Run the complete reset
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```

## 🔧 Complete Reset (Recommended)

If you're not sure what's wrong, just reset everything:

### 1. Stop Everything
```powershell
# Stop all Java processes
Get-Process java | Stop-Process -Force
```

### 2. Reset Keycloak
```powershell
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```
Type `DELETE` when prompted.

### 3. Create Keycloak Admin
1. Open http://localhost:9090
2. Create admin: `admin` / `admin`

### 4. Configure Keycloak
```powershell
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

### 5. Restart UserService
1. Stop UserService in IntelliJ
2. Run `UserApplication.java` again
3. Wait for "Started UserApplication"

### 6. Test Registration
```powershell
.\TEST_REGISTRATION.ps1
```

Should show "✓ SUCCESS! User registered"

## 🔍 Detailed Troubleshooting

### Check 1: Is Keycloak Running?

Open http://localhost:9090 in browser.

**If it doesn't open:**
- Keycloak is not running
- Start it: `cd C:\keycloak-23.0.0; bin\kc.bat start-dev --http-port=9090`

**If it shows an error page:**
- Keycloak has internal errors
- Run `.\FORCE_CLEAN_KEYCLOAK_H2.ps1`

### Check 2: Can UserService Connect to Keycloak?

Open http://localhost:8085/api/auth/test-keycloak in browser.

**If it shows "Connected to Keycloak":**
- Connection is OK
- Problem is elsewhere

**If it shows error:**
- UserService cannot connect to Keycloak
- Check Keycloak is running
- Check application.properties has correct Keycloak URL

### Check 3: Are Realm and Client Configured?

1. Open http://localhost:9090
2. Login with admin/admin
3. Check if `wordly-realm` exists
4. Go to Clients → Check if `wordly-client` exists
5. Check client secret is `v9BVegPOBMnWfQHJHdswfY0EQXUIFSyy`

**If realm or client is missing:**
```powershell
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

### Check 4: Are Roles Configured?

1. In Keycloak admin console
2. Go to Realm roles
3. Check if TEACHER, STUDENT, ADMIN exist

**If roles are missing:**
```powershell
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

## 🎯 Common Error Messages

### "Failed to create user in Keycloak"
**Cause:** Keycloak rejected the user creation request
**Fix:** Check Keycloak logs, usually means realm/client not configured

### "User already exists in Keycloak"
**Cause:** Username or email already exists
**Fix:** Use a different username/email, or delete the user in Keycloak admin

### "HTTP 500 Internal Server Error"
**Cause:** Keycloak internal error, usually database corruption
**Fix:** Run `.\FORCE_CLEAN_KEYCLOAK_H2.ps1`

### "Connection refused"
**Cause:** Keycloak is not running
**Fix:** Start Keycloak

### "401 Unauthorized"
**Cause:** Keycloak admin credentials are wrong
**Fix:** Check application.properties has admin/admin

## 📋 Verification Checklist

After fixing, verify:
- [ ] Keycloak opens at http://localhost:9090
- [ ] Can login to Keycloak admin with admin/admin
- [ ] Realm `wordly-realm` exists
- [ ] Client `wordly-client` exists
- [ ] Roles TEACHER, STUDENT, ADMIN exist
- [ ] UserService running in IntelliJ
- [ ] http://localhost:8085/api/auth/test-keycloak shows "Connected"
- [ ] `.\TEST_REGISTRATION.ps1` shows "SUCCESS"
- [ ] Can register new user in frontend

## 🚨 If Nothing Works

1. **Complete clean slate:**
```powershell
# Stop everything
Get-Process java | Stop-Process -Force

# Delete Keycloak data
Remove-Item C:\keycloak-23.0.0\data -Recurse -Force

# Start fresh
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```

2. **Check IntelliJ console** for UserService errors

3. **Check Keycloak console window** for startup errors

4. **Make sure ports are not in use:**
```powershell
netstat -ano | findstr "9090"  # Should show Keycloak
netstat -ano | findstr "8085"  # Should show UserService
```

## 📞 Next Steps

Once registration works:
1. Test creating STUDENT account
2. Test creating TEACHER account
3. Test login with new accounts
4. Verify role-based redirection

---

**Quick command to fix everything:**
```powershell
Get-Process java | Stop-Process -Force
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
# Then follow the prompts
```
