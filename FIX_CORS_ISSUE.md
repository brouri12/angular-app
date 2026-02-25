# CORS Issue Fix

## Problem
Error: "The 'Access-Control-Allow-Origin' header contains multiple values 'http://localhost:4200, *', but only one is allowed."

## Solution Applied

### 1. Removed Duplicate CORS Configuration
**File:** `UserService/src/main/java/tn/esprit/user/controller/PaymentController.java`

**Removed:** `@CrossOrigin(origins = "*")`

**Reason:** API Gateway already handles CORS. Having CORS on both Gateway and Controller causes duplicate headers.

### 2. Updated Security Configuration
**File:** `UserService/src/main/java/tn/esprit/user/config/SecurityConfig.java`

**Added payment endpoints to security rules:**
```java
.requestMatchers("/api/payments/**").authenticated()
.requestMatchers("/api/payments/receipt/**").permitAll()
```

## How to Fix

### Step 1: Restart UserService
1. Stop UserService if running
2. Run `UserService/src/main/java/tn/esprit/user/UserApplication.java` in IntelliJ
3. Wait for "Started UserApplication" message

### Step 2: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"

Or:
- Chrome: Ctrl+Shift+Delete → Clear cached images and files
- Firefox: Ctrl+Shift+Delete → Cached Web Content

### Step 3: Test Again
1. Go to http://localhost:4200/pricing
2. Login
3. Try to create a payment
4. Should work now!

## Verification

### Check Backend Logs
Look for these messages in UserService console:
```
Creating payment for user: ...
Payment created: ...
```

### Check Browser Console
Should NOT see:
- ❌ "Access-Control-Allow-Origin header contains multiple values"
- ❌ "CORS policy" errors

Should see:
- ✅ POST http://localhost:8888/user-service/api/payments 200 OK

### Check Network Tab
1. Open DevTools → Network tab
2. Try to create payment
3. Look for POST to `/api/payments`
4. Status should be 200 OK
5. Response should contain payment object

## CORS Rules Summary

### API Gateway (Handles CORS)
- **File:** `ApiGateway/src/main/java/tn/esprit/gateway/CorsConfig.java`
- Allows: `http://localhost:*` (all localhost ports)
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: All (*)
- Credentials: true

### UserService (NO CORS)
- **File:** `UserService/src/main/java/tn/esprit/user/config/SecurityConfig.java`
- CORS disabled: `.cors(cors -> cors.disable())`
- Reason: Gateway handles it

### Controllers (NO CORS)
- **All controllers:** No `@CrossOrigin` annotations
- Reason: Gateway handles it

## Common CORS Mistakes

### ❌ Wrong: CORS on Controller
```java
@RestController
@CrossOrigin(origins = "*")  // DON'T DO THIS!
public class PaymentController {
```

### ✅ Right: No CORS on Controller
```java
@RestController
public class PaymentController {
```

### ❌ Wrong: CORS on Service
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.cors(cors -> cors.configurationSource(...))  // DON'T DO THIS!
```

### ✅ Right: CORS Disabled on Service
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.cors(cors -> cors.disable())  // Gateway handles it
```

## Testing CORS

### Test with curl
```bash
curl -X OPTIONS http://localhost:8888/user-service/api/payments \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should see:
```
< Access-Control-Allow-Origin: http://localhost:4200
< Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
< Access-Control-Allow-Credentials: true
```

### Test with Browser
1. Open DevTools → Network tab
2. Filter: XHR
3. Try to create payment
4. Click on the request
5. Check "Response Headers"
6. Should see ONE `Access-Control-Allow-Origin` header

## If Still Not Working

### 1. Check All Services Running
```bash
# Check ports
netstat -ano | findstr "8761"  # Eureka
netstat -ano | findstr "8888"  # Gateway
netstat -ano | findstr "8085"  # UserService
```

### 2. Check Gateway Routes
Gateway should route `/user-service/**` to UserService on port 8085

### 3. Check Firewall
Make sure Windows Firewall isn't blocking ports

### 4. Restart Everything
```bash
# Stop all services
# Start in order:
1. Eureka (8761)
2. Gateway (8888)
3. UserService (8085)
4. Frontend (4200)
```

### 5. Check Browser Extensions
Disable any CORS-related browser extensions

## Success Checklist

- [ ] UserService restarted
- [ ] Browser cache cleared
- [ ] No CORS errors in console
- [ ] POST request returns 200 OK
- [ ] Payment created in database
- [ ] Can see payment in back-office

## Still Having Issues?

Check these files have correct configuration:
1. `ApiGateway/src/main/java/tn/esprit/gateway/CorsConfig.java` - CORS enabled
2. `UserService/src/main/java/tn/esprit/user/config/SecurityConfig.java` - CORS disabled
3. `UserService/src/main/java/tn/esprit/user/controller/PaymentController.java` - No @CrossOrigin

All controllers in UserService should have NO `@CrossOrigin` annotation!

