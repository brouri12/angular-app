# 🔧 Fix Keycloak CORS Error

## The Problem

You're seeing this error:
```
Access to fetch at 'http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

This means Keycloak is either:
1. Not running
2. Not configured to allow requests from your frontend

---

## ✅ Solution

### Step 1: Check if Keycloak is Running

Open PowerShell and run:
```powershell
curl http://localhost:9090
```

**If you get an error**, Keycloak is NOT running. Start it:

```powershell
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

Wait for the message: "Keycloak started"

---

### Step 2: Configure Keycloak CORS

Keycloak needs to allow requests from `http://localhost:4200` and `http://localhost:4201`.

**Option A: Via Keycloak Admin Console (Recommended)**

1. Go to: http://localhost:9090/admin
2. Login with: `admin` / `admin`
3. Select realm: `wordly-realm` (top left dropdown)
4. Go to: **Clients** → **wordly-client**
5. Scroll to **Web Origins**
6. Add these URLs (one per line):
   ```
   http://localhost:4200
   http://localhost:4201
   *
   ```
7. Click **Save**

**Option B: Via Script (Automatic)**

Run this script:
```powershell
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

This will automatically configure CORS for you.

---

### Step 3: Verify Configuration

1. Go to: http://localhost:9090/admin
2. Login: `admin` / `admin`
3. Select realm: `wordly-realm`
4. Go to: **Clients** → **wordly-client**
5. Check **Web Origins** section
6. Should see:
   ```
   http://localhost:4200
   http://localhost:4201
   *
   ```

---

### Step 4: Test Login

1. Go to: http://localhost:4200
2. Click "Sign In"
3. Enter credentials
4. Should work now! ✅

---

## 🔍 Quick Diagnostic

Run this to check everything:

```powershell
# Check if Keycloak is running
curl http://localhost:9090

# Check if realm exists
curl http://localhost:9090/realms/wordly-realm

# Check if client exists
curl http://localhost:9090/realms/wordly-realm/.well-known/openid-configuration
```

All should return data (not errors).

---

## 🐛 Still Not Working?

### Issue: Keycloak Won't Start

**Error**: "Port 9090 already in use"

**Solution**:
```powershell
# Find process using port 9090
netstat -ano | findstr :9090

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F

# Start Keycloak again
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

### Issue: Database Lock Error

**Error**: "Sleep interrupted" or "Database locked"

**Solution**:
```powershell
.\FIX_KEYCLOAK_DATABASE.ps1
```

Or manually:
```powershell
# Stop Keycloak
taskkill /F /IM java.exe

# Delete lock files
cd C:\keycloak-23.0.0\data\h2
del keycloakdb.lock.db
del keycloakdb.trace.db

# Start Keycloak
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

### Issue: Realm Not Found

**Error**: "Realm does not exist"

**Solution**:
```powershell
# Reconfigure Keycloak
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

---

## 📋 Complete Checklist

- [ ] Keycloak is running on port 9090
- [ ] Can access http://localhost:9090
- [ ] Realm `wordly-realm` exists
- [ ] Client `wordly-client` exists
- [ ] Web Origins includes `http://localhost:4200`
- [ ] Web Origins includes `http://localhost:4201`
- [ ] Web Origins includes `*`
- [ ] Client secret matches in all configs
- [ ] Frontend can login successfully

---

## 🚀 Quick Fix Command

Run all fixes at once:

```powershell
# Stop any running Keycloak
taskkill /F /IM java.exe 2>$null

# Clean database locks
Remove-Item "C:\keycloak-23.0.0\data\h2\*.lock.db" -ErrorAction SilentlyContinue
Remove-Item "C:\keycloak-23.0.0\data\h2\*.trace.db" -ErrorAction SilentlyContinue

# Start Keycloak
cd C:\keycloak-23.0.0
Start-Process -FilePath "bin\kc.bat" -ArgumentList "start-dev","--http-port=9090"

# Wait 30 seconds for Keycloak to start
Write-Host "Waiting for Keycloak to start..."
Start-Sleep -Seconds 30

# Configure Keycloak
cd C:\Users\marwe\Desktop\e_learnig-platform
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

---

## ✅ Expected Result

After fixing, you should see:
- ✅ Keycloak running on http://localhost:9090
- ✅ Login modal works
- ✅ No CORS errors in console
- ✅ Can login successfully
- ✅ Token is saved
- ✅ User is authenticated

---

## 💡 Prevention

To avoid this issue in the future:

1. **Always start Keycloak first** before frontend
2. **Use the startup script**:
   ```powershell
   # Create START_ALL.ps1
   cd C:\keycloak-23.0.0
   Start-Process -FilePath "bin\kc.bat" -ArgumentList "start-dev","--http-port=9090"
   
   Start-Sleep -Seconds 30
   
   cd C:\Users\marwe\Desktop\e_learnig-platform\frontend\angular-app
   npm start
   ```

3. **Check Keycloak status** before testing:
   ```powershell
   curl http://localhost:9090
   ```

---

## 🎯 Summary

**Problem**: CORS error when logging in
**Cause**: Keycloak not running or not configured
**Solution**: 
1. Start Keycloak
2. Configure Web Origins
3. Test login

That's it! 🚀
