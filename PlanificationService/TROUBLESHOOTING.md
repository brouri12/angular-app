# PlanificationService Troubleshooting Guide

## Problem: "Failed to load salles. Run backend."

This means the Angular frontend cannot connect to the PlanificationService backend.

## Quick Fix Steps

### Step 1: Check if PlanificationService is Running

Open your browser and go to:
```
http://localhost:8086/api/salles
```

**If you see JSON data or an empty array `[]`**: Service is running! ✅
**If you see "This site can't be reached"**: Service is NOT running ❌

### Step 2: Start PlanificationService

#### Option A: Using IntelliJ IDEA (Recommended)

1. Open IntelliJ IDEA
2. Open the `PlanificationService` folder as a project
3. Wait for Maven to download dependencies (first time: 5-10 minutes)
4. Find `PlanificationApplication.java` in:
   ```
   src/main/java/tn/esprit/planification/PlanificationApplication.java
   ```
5. Right-click on the file
6. Click "Run 'PlanificationApplication'"
7. Wait for the console to show:
   ```
   Started PlanificationApplication in X seconds
   ```

#### Option B: Using Command Line

1. Open Command Prompt
2. Navigate to PlanificationService folder:
   ```cmd
   cd C:\Users\jasse\OneDrive\Desktop\pi4\angular-app\PlanificationService
   ```
3. Run the startup script:
   ```cmd
   START_PLANIFICATION_SERVICE.bat
   ```

### Step 3: Verify Service is Running

After starting, check these URLs:

1. **Swagger UI**: http://localhost:8086/swagger-ui.html
   - Should show API documentation

2. **Eureka Dashboard**: http://localhost:8761
   - Should show "PLANIFICATION-SERVICE" in the list

3. **Test API**: http://localhost:8086/api/salles
   - Should return `[]` or list of rooms

## Common Issues

### Issue 1: Port 8086 Already in Use

**Error**: "Port 8086 is already in use"

**Solution**:
```cmd
netstat -ano | findstr :8086
taskkill /PID <PID_NUMBER> /F
```

### Issue 2: MySQL Not Running

**Error**: "Could not connect to database"

**Solution**:
1. Open XAMPP Control Panel
2. Start MySQL
3. Verify it's running on port 3306

### Issue 3: EurekaServer Not Running

**Error**: "Connection refused to localhost:8761"

**Solution**:
1. Start EurekaServer first
2. Wait for it to fully start (30 seconds)
3. Then start PlanificationService

### Issue 4: Maven Dependencies Not Downloaded

**Error**: "Cannot resolve symbol" or compilation errors

**Solution**:
1. In IntelliJ, right-click on `pom.xml`
2. Click "Maven" → "Reload Project"
3. Wait for dependencies to download
4. Try running again

### Issue 5: Database Connection Error

**Error**: "Access denied for user 'root'@'localhost'"

**Solution**:
Check `application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=
```

If your MySQL has a password, add it:
```properties
spring.datasource.password=your_password
```

## Verify Everything is Working

Run this PowerShell command to check all services:

```powershell
# Check MySQL
netstat -an | findstr ":3306"

# Check EurekaServer
netstat -an | findstr ":8761"

# Check PlanificationService
netstat -an | findstr ":8086"

# Test API
curl http://localhost:8086/api/salles
```

## Service Startup Order

Always start services in this order:
1. **MySQL** (XAMPP)
2. **EurekaServer** (port 8761)
3. **ApiGateway** (port 8888)
4. **UserService** (port 8085)
5. **PlanificationService** (port 8086)
6. **AbonnementService** (port 8087)

## Still Not Working?

### Check IntelliJ Console

Look for these error messages:

1. **"Address already in use"**
   - Port 8086 is taken
   - Kill the process using that port

2. **"Communications link failure"**
   - MySQL is not running
   - Start XAMPP MySQL

3. **"Connection refused"**
   - EurekaServer is not running
   - Start EurekaServer first

4. **"ClassNotFoundException"**
   - Maven dependencies not downloaded
   - Reload Maven project

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - `ERR_CONNECTION_REFUSED` - Service not running
   - `404 Not Found` - Wrong URL
   - `CORS error` - CORS configuration issue

## Quick Test Script

Save this as `test-planification.ps1`:

```powershell
Write-Host "Testing PlanificationService..." -ForegroundColor Cyan

# Test Salles endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8086/api/salles" -Method GET
    Write-Host "✓ Salles API working!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "✗ Salles API failed!" -ForegroundColor Red
    Write-Host "Error: $_"
}

# Test Groups endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8086/api/groups" -Method GET
    Write-Host "✓ Groups API working!" -ForegroundColor Green
} catch {
    Write-Host "✗ Groups API failed!" -ForegroundColor Red
}

# Test Planifications endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8086/api/planifications" -Method GET
    Write-Host "✓ Planifications API working!" -ForegroundColor Green
} catch {
    Write-Host "✗ Planifications API failed!" -ForegroundColor Red
}
```

Run it:
```cmd
powershell -ExecutionPolicy Bypass -File test-planification.ps1
```

## Need More Help?

1. Check IntelliJ console for error messages
2. Check browser console (F12) for network errors
3. Verify all prerequisites are running
4. Try restarting all services in the correct order
