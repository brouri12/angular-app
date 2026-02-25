# Quick Fix Steps - Keycloak & Admin Account

## 🚨 QUICK STEPS (5 minutes)

### 1️⃣ Clear Browser Storage
- Press `F12` → Application → Local Storage
- Delete `access_token` and `refresh_token` from `http://localhost:4200` and `http://localhost:4201`

### 2️⃣ Reset Keycloak
```powershell
.\FORCE_CLEAN_KEYCLOAK_H2.ps1
```
Type `DELETE` when prompted. Wait 60 seconds.

### 3️⃣ Create Keycloak Admin
- Open http://localhost:9090
- Create admin user: `admin` / `admin`

### 4️⃣ Configure Keycloak
```powershell
.\AUTO_CONFIGURE_KEYCLOAK.ps1
```

### 5️⃣ Restart UserService
- Stop UserService in IntelliJ
- Run `UserApplication.java` again

### 6️⃣ Create Admin Account
```powershell
.\CREATE_ADMIN_ACCOUNT.ps1
```

### 7️⃣ Test Login
- Go to http://localhost:4200
- Sign In with: `admin@wordly.com` / `Admin123!`
- Should redirect to http://localhost:4201/dashboard

---

## ✅ Success Indicators

- ✓ Keycloak shows "Keycloak started" in console
- ✓ http://localhost:9090 opens Keycloak admin
- ✓ AUTO_CONFIGURE_KEYCLOAK.ps1 shows "CONFIGURATION TERMINEE!"
- ✓ CREATE_ADMIN_ACCOUNT.ps1 shows "SUCCESS! Admin account created!"
- ✓ Login redirects to dashboard

---

## ❌ If Something Fails

**Keycloak won't start?**
- Kill all Java processes: `Get-Process java | Stop-Process -Force`
- Delete data: `Remove-Item C:\keycloak-23.0.0\data -Recurse -Force`
- Start manually: `cd C:\keycloak-23.0.0; bin\kc.bat start-dev --http-port=9090`

**CREATE_ADMIN_ACCOUNT fails?**
- Check UserService is running in IntelliJ
- Check Keycloak is running (http://localhost:9090)
- Check API Gateway is running (port 8888)

**Login shows 401?**
- Clear browser localStorage again (Step 1)
- Make sure you're using `admin@wordly.com` (not `admin`)

---

## 📋 Credentials

**Keycloak Admin Console:**
- URL: http://localhost:9090
- Username: `admin`
- Password: `admin`

**Application Admin:**
- URL: http://localhost:4200
- Email: `admin@wordly.com`
- Password: `Admin123!`

---

## 🔧 Configuration

- **Client Secret**: `v9BVegPOBMnWfQHJHdswfY0EQXUIFSyy`
- **Realm**: `wordly-realm`
- **Client**: `wordly-client`
- **Database**: H2 (embedded)
