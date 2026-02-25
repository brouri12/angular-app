# Service Status Check

## Issue
Login is stuck on "Signing in..." - this usually means one or more backend services are not running.

## Required Services

### 1. Keycloak (Port 9090)
```bash
# Check if running
curl http://localhost:9090

# Start Keycloak (if not running)
cd C:\keycloak-23.0.0\bin
.\kc.bat start-dev
```

### 2. MySQL (Port 3307)
```bash
# Check if running
netstat -ano | findstr :3307

# Start MySQL service if needed
net start MySQL
```

### 3. Eureka Server (Port 8761)
- Open in IntelliJ: `EurekaServer/src/main/java/tn/esprit/eureka/EurekaServerApplication.java`
- Click Run button

### 4. API Gateway (Port 8888)
- Open in IntelliJ: `ApiGateway/src/main/java/tn/esprit/gateway/ApiGatewayApplication.java`
- Click Run button

### 5. User Service (Port 8085)
- Open in IntelliJ: `UserService/src/main/java/tn/esprit/user/UserApplication.java`
- Click Run button

### 6. Abonnement Service (Port 8084)
- Open in IntelliJ: `AbonnementService/src/main/java/tn/esprit/abonnement/AbonnementApplication.java`
- Click Run button

## Quick Check Commands

```powershell
# Check all ports at once
netstat -ano | findstr "9090 3307 8761 8888 8085 8084"
```

## Startup Order
1. Start MySQL
2. Start Keycloak
3. Start Eureka Server (wait 30 seconds)
4. Start API Gateway
5. Start User Service
6. Start Abonnement Service

## Test Endpoints

```powershell
# Test Keycloak
curl http://localhost:9090

# Test Eureka
curl http://localhost:8761

# Test API Gateway
curl http://localhost:8888

# Test User Service (through Gateway)
curl http://localhost:8888/user-service/api/auth/test-keycloak

# Test Abonnement Service (through Gateway)
curl http://localhost:8888/abonnement-service/api/abonnements
```

## Common Issues

### Issue: 404 Not Found
- **Cause**: Service not registered with Eureka or Gateway routing issue
- **Solution**: Check Eureka dashboard at http://localhost:8761 to see registered services

### Issue: Connection Refused
- **Cause**: Service not running
- **Solution**: Start the service in IntelliJ

### Issue: Login Stuck
- **Cause**: User Service or Keycloak not responding
- **Solution**: 
  1. Check User Service logs in IntelliJ
  2. Check Keycloak is running on port 9090
  3. Verify Keycloak realm "wordly-realm" exists

## Current Error Analysis

Based on the screenshot, I see:
- Multiple 404 errors in console
- Login stuck on "Signing in..."

This indicates:
1. **User Service might not be running** - Check port 8085
2. **API Gateway might not be routing correctly** - Check port 8888
3. **Keycloak might not be accessible** - Check port 9090

## Action Required

Please check which services are running:
```powershell
netstat -ano | findstr "9090 3307 8761 8888 8085 8084"
```

And start any missing services.
