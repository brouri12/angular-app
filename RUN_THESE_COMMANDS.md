# Run These Commands (Copy & Paste)

## 🎯 Quick Start - Just Copy and Run These

### Step 1: Clear Browser (Manual)
1. Press `F12` in browser
2. Application → Local Storage → http://localhost:4200
3. Delete `access_token` and `refresh_token`
4. Close browser

---

### Step 2: Reset Keycloak
```powershell
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```
When prompted, type: `DELETE`

Wait for: "✓ Keycloak is UP and running!"

---

### Step 3: Create Keycloak Admin (Manual)
1. Open: http://localhost:9090
2. Username: `admin`
3. Password: `admin`
4. Click "Create"

---

### Step 4: Configure Keycloak
```powershell
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

Wait for: "CONFIGURATION TERMINEE!"

---

### Step 5: Start Services in IntelliJ (Manual)
1. Run `EurekaServerApplication.java`
2. Run `ApiGatewayApplication.java`
3. Run `UserApplication.java`
4. Run `AbonnementApplication.java`

---

### Step 6: Create Admin Account
```powershell
.\CREATE_ADMIN_ACCOUNT.ps1
```

Wait for: "SUCCESS! Admin account created!"

---

### Step 7: Test Login (Manual)
1. Open: http://localhost:4200
2. Click "Sign In"
3. Email: `admin@wordly.com`
4. Password: `Admin123!`
5. Should redirect to: http://localhost:4201/dashboard

---

## 🔥 If Something Goes Wrong

### Keycloak won't start?
```powershell
Get-Process java | Stop-Process -Force
Remove-Item C:\keycloak-23.0.0\data -Recurse -Force
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```

### Need to check if services are running?
```powershell
# Check Java processes
Get-Process java

# Check ports
netstat -ano | findstr "8761"  # Eureka
netstat -ano | findstr "8888"  # Gateway
netstat -ano | findstr "8085"  # UserService
netstat -ano | findstr "9090"  # Keycloak
```

### Need to restart everything?
```powershell
# Stop all Java processes
Get-Process java | Stop-Process -Force

# Start Keycloak
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090

# Then start services in IntelliJ
```

---

## 📋 Credentials Reference

**Keycloak Admin Console:**
- URL: http://localhost:9090
- User: `admin`
- Pass: `admin`

**Application Admin:**
- URL: http://localhost:4200
- Email: `admin@wordly.com`
- Pass: `Admin123!`

---

## ✅ Success Indicators

After each command, you should see:

**FORCE_CLEAN_KEYCLOAK_H2.ps1:**
```
✓ Keycloak stopped
✓ Data folder deleted
✓ Old config removed
✓ H2 configuration created
✓ Keycloak is UP and running!
```

**AUTO_CONFIGURE_KEYCLOAK.ps1:**
```
OK - Token obtenu
OK - Realm cree
OK - Role 'TEACHER' cree
OK - Role 'STUDENT' cree
OK - Role 'ADMIN' cree
OK - Client cree
CONFIGURATION TERMINEE!
```

**CREATE_ADMIN_ACCOUNT.ps1:**
```
SUCCESS! Admin account created!
Admin Details:
  ID: 1
  Username: admin
  Email: admin@wordly.com
  Role: ADMIN
```

---

## 🚨 Common Errors and Fixes

### Error: "Could not get admin token"
**Fix:** Keycloak not ready yet. Wait 30 seconds and run the command again.

### Error: "Le serveur distant a retourné une erreur : (500)"
**Fix:** UserService not running. Start UserService in IntelliJ.

### Error: "User already exists"
**Fix:** Admin already created. Try logging in with admin@wordly.com / Admin123!

### Error: "401 Unauthorized"
**Fix:** Clear browser localStorage (Step 1) and try again.

---

## 📞 Need More Help?

See detailed guides:
- **QUICK_FIX_STEPS.md** - Quick reference
- **FIX_KEYCLOAK_COMPLETE_GUIDE.md** - Detailed guide
- **CHECKLIST.md** - Step-by-step checklist
- **SOLUTION_SUMMARY.md** - Technical details
