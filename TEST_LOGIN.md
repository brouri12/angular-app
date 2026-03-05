# Login Issue Diagnosis

## Current Status
✅ All services are running:
- MySQL: Port 3307 ✓
- Keycloak: Port 9090 ✓
- Eureka: Port 8761 ✓
- API Gateway: Port 8888 ✓
- User Service: Port 8085 ✓
- Abonnement Service: Port 8084 ✓

## Issue
Login is stuck on "Signing in..." button

## Root Cause
The Angular application needs to be restarted to pick up the code changes we made to the auth-modal component.

## Solution

### Step 1: Stop Angular Dev Server
In the terminal where Angular is running, press `Ctrl+C` to stop the server.

### Step 2: Restart Angular Dev Server
```bash
cd frontend/angular-app
npm start
```

Or if using ng serve:
```bash
cd frontend/angular-app
ng serve
```

### Step 3: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click on the refresh button
3. Select "Empty Cache and Hard Reload"

Or simply:
- Press `Ctrl+Shift+Delete`
- Clear cached images and files
- Click "Clear data"

### Step 4: Test Login Again
1. Go to http://localhost:4200
2. Click "Sign In"
3. Enter credentials:
   - Email: student1@test.com
   - Password: (the password you used during registration)
4. Click "Sign in to your account"

## What We Fixed

1. **Added `cdr.detectChanges()` in success handler** - Ensures UI updates when login succeeds
2. **Improved error messages** - Now shows "Please check if all services are running" for connection errors
3. **Added better error handling** - Catches all error types including network errors

## Test Credentials

If you need to register a new user:
1. Click "Get Started"
2. Fill in the form with unique email and username
3. Choose role (STUDENT or TEACHER)
4. Submit

Example:
- Username: testuser123
- Email: testuser123@test.com
- Password: Test123!
- Role: STUDENT
- First Name: Test
- Last Name: User
- Phone: 12345678

## Verify Services Manually

### Test User Service
```powershell
# Test if user service is accessible
curl http://localhost:8888/user-service/api/auth/test-keycloak
```

### Test Keycloak
```powershell
# Test if Keycloak is accessible
curl http://localhost:9090
```

### Check Eureka Dashboard
Open browser: http://localhost:8761

You should see:
- USER-SERVICE registered
- ABONNEMENT-SERVICE registered
- API-GATEWAY registered

## If Still Stuck

1. **Check browser console** (F12 → Console tab)
   - Look for specific error messages
   - Note the HTTP status codes (404, 500, etc.)

2. **Check Network tab** (F12 → Network tab)
   - Look for failed requests
   - Check which endpoint is failing
   - Verify request/response details

3. **Check User Service logs** in IntelliJ
   - Look for errors when login is attempted
   - Check if request is reaching the service

4. **Verify Keycloak realm**
   - Go to http://localhost:9090/admin
   - Login with admin credentials
   - Check "wordly-realm" exists
   - Check "wordly-client" is configured
   - Check roles (TEACHER, STUDENT) exist

## Common Issues

### Issue: "User not found with this email"
- User doesn't exist in database
- Register a new user first

### Issue: "Invalid email or password"
- Wrong credentials
- Password might be incorrect
- Try registering a new user

### Issue: Network error / Connection refused
- Service not running
- Check service status with netstat command
- Restart the service in IntelliJ

### Issue: CORS error
- API Gateway CORS configuration issue
- Already fixed in our code
- Restart API Gateway if needed
