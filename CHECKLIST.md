# Keycloak Fix Checklist

## Pre-Flight Check
- [ ] All Spring Boot services stopped in IntelliJ
- [ ] Browser closed (or at least all localhost tabs)
- [ ] PowerShell open in project directory

---

## Step-by-Step Checklist

### 1. Clear Browser Storage
- [ ] Open browser
- [ ] Press F12
- [ ] Go to Application tab
- [ ] Local Storage → http://localhost:4200
- [ ] Delete `access_token`
- [ ] Delete `refresh_token`
- [ ] Repeat for http://localhost:4201 if exists
- [ ] Close browser

### 2. Reset Keycloak
- [ ] Run: `.\FORCE_CLEAN_KEYCLOAK_H2.ps1`
- [ ] Type `DELETE` when prompted
- [ ] Wait for "Keycloak is UP and running!" message
- [ ] See new Keycloak console window open

### 3. Create Keycloak Admin
- [ ] Open http://localhost:9090
- [ ] See "Welcome to Keycloak" page
- [ ] Enter username: `admin`
- [ ] Enter password: `admin`
- [ ] Click "Create"
- [ ] See "User created" message
- [ ] Click "Administration Console"
- [ ] Login with admin/admin
- [ ] See Keycloak admin dashboard

### 4. Configure Keycloak
- [ ] Run: `.\AUTO_CONFIGURE_KEYCLOAK.ps1`
- [ ] See "Connexion a Keycloak... OK"
- [ ] See "Realm cree" or "Realm existe deja"
- [ ] See "Role TEACHER cree"
- [ ] See "Role STUDENT cree"
- [ ] See "Role ADMIN cree"
- [ ] See "Client cree"
- [ ] See "CONFIGURATION TERMINEE!"

### 5. Start Services
- [ ] Open IntelliJ
- [ ] Start EurekaServer (port 8761)
- [ ] Wait for "Started EurekaServerApplication"
- [ ] Start ApiGateway (port 8888)
- [ ] Wait for "Started ApiGatewayApplication"
- [ ] Start UserService (port 8085)
- [ ] Wait for "Started UserApplication"
- [ ] Start AbonnementService (port 8084)
- [ ] Wait for "Started AbonnementApplication"

### 6. Create Admin Account
- [ ] Run: `.\CREATE_ADMIN_ACCOUNT.ps1`
- [ ] See "Sending request to: http://localhost:8888/user-service/api/auth/register"
- [ ] See "SUCCESS! Admin account created!"
- [ ] See admin details displayed
- [ ] Note credentials: admin@wordly.com / Admin123!

### 7. Test Login
- [ ] Open browser
- [ ] Go to http://localhost:4200
- [ ] Click "Sign In" button
- [ ] Enter email: `admin@wordly.com`
- [ ] Enter password: `Admin123!`
- [ ] Click "Sign In"
- [ ] See "Signing in..." message
- [ ] Wait for redirect
- [ ] Should redirect to http://localhost:4201/dashboard
- [ ] See dashboard with admin menu

---

## Verification Checklist

### Services Running
- [ ] Keycloak: http://localhost:9090 (shows Keycloak page)
- [ ] Eureka: http://localhost:8761 (shows Eureka dashboard)
- [ ] API Gateway: http://localhost:8888 (shows error page - normal)
- [ ] UserService: http://localhost:8085/swagger-ui.html (shows Swagger)
- [ ] AbonnementService: http://localhost:8084/swagger-ui.html (shows Swagger)
- [ ] Frontend: http://localhost:4200 (shows home page)
- [ ] Back-Office: http://localhost:4201 (shows login or dashboard)

### Keycloak Configuration
- [ ] Realm `wordly-realm` exists
- [ ] Client `wordly-client` exists
- [ ] Client secret is `v9BVegPOBMnWfQHJHdswfY0EQXUIFSyy`
- [ ] Roles exist: TEACHER, STUDENT, ADMIN
- [ ] User `admin` exists in Keycloak

### Database
- [ ] MySQL running on port 3307 (XAMPP)
- [ ] Database `user_db` exists
- [ ] Database `abonnement_db` exists
- [ ] Keycloak using H2 (no external database)

### Admin Account
- [ ] Admin user exists in MySQL `user_db.users` table
- [ ] Admin user exists in Keycloak
- [ ] Can login with admin@wordly.com / Admin123!
- [ ] Login redirects to dashboard
- [ ] Dashboard shows admin menu

---

## Troubleshooting

### If Keycloak won't start:
- [ ] Kill all Java processes: `Get-Process java | Stop-Process -Force`
- [ ] Delete data: `Remove-Item C:\keycloak-23.0.0\data -Recurse -Force`
- [ ] Run FORCE_CLEAN_KEYCLOAK_H2.ps1 again

### If AUTO_CONFIGURE fails:
- [ ] Check Keycloak is running (http://localhost:9090)
- [ ] Check you created admin/admin user in Keycloak
- [ ] Try running the script again

### If CREATE_ADMIN_ACCOUNT fails:
- [ ] Check UserService is running in IntelliJ
- [ ] Check API Gateway is running
- [ ] Check Keycloak is running
- [ ] Check UserService logs for errors
- [ ] Try running the script again

### If login fails:
- [ ] Clear browser localStorage again
- [ ] Check all services are running
- [ ] Check you're using admin@wordly.com (not admin)
- [ ] Check password is Admin123! (case sensitive)
- [ ] Check browser console for errors (F12)

---

## Success Criteria

✅ All checkboxes above are checked
✅ Can login as admin and see dashboard
✅ No errors in browser console
✅ No errors in IntelliJ console
✅ All services registered in Eureka

---

## Time Estimate

- Steps 1-4: ~5 minutes
- Step 5: ~2 minutes
- Steps 6-7: ~1 minute
- **Total: ~8 minutes**
