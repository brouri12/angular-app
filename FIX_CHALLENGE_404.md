# Fix Challenge Service 404 Error

## 🚨 Problem
Getting 404 error when trying to access Challenge Service through API Gateway:
```
POST http://localhost:8888/challenge-service/api/challenges 404 (Not Found)
```

## ✅ Solution

The issue is that the API Gateway was updated with the Challenge Service route, but it needs to be restarted to pick up the changes.

### Step 1: Restart API Gateway

**In IntelliJ:**
1. Find the running "ApiGatewayApplication" in the Run panel (bottom)
2. Click the red stop button (■)
3. Wait for it to fully stop
4. Right-click on `ApiGateway/src/main/java/tn/esprit/gateway/ApiGatewayApplication.java`
5. Select "Run 'ApiGatewayApplication'"
6. Wait for "Started ApiGatewayApplication" message

### Step 2: Verify Challenge Service is Registered

1. Open browser: http://localhost:8761
2. Look for "Instances currently registered with Eureka"
3. You should see:
   - **CHALLENGE-SERVICE** - UP (1) - localhost:challenge-service:8086
   - **API-GATEWAY** - UP (1) - localhost:api-gateway:8888

If CHALLENGE-SERVICE is not listed:
1. Stop Challenge Service in IntelliJ
2. Start it again
3. Wait 30 seconds
4. Refresh Eureka dashboard

### Step 3: Test the Connection

**Option A: Use PowerShell**
```powershell
# Test through API Gateway
Invoke-WebRequest -Uri "http://localhost:8888/challenge-service/api/challenges" -Method GET
```

**Option B: Use Browser**
```
http://localhost:8888/challenge-service/api/challenges
```

You should get: `[]` (empty array) or a list of challenges

### Step 4: Test in Back-Office

1. Make sure back-office is running: `cd back-office && npm start`
2. Open: http://localhost:4201
3. Login as admin
4. Click "Challenges" in sidebar
5. Try to create a new challenge
6. Should work without 404 error!

---

## 🔍 If Still Getting 404

### Check 1: Verify GatewayConfig.java

Open: `ApiGateway/src/main/java/tn/esprit/gateway/GatewayConfig.java`

Should contain:
```java
.route("challenge-service", r -> r
    .path("/challenge-service/**")
    .filters(f -> f.stripPrefix(1))
    .uri("lb://CHALLENGE-SERVICE"))
```

### Check 2: Verify Challenge Service Name

Open: `ChallengeService/src/main/resources/application.properties`

Should have:
```properties
spring.application.name=challenge-service
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

**Important**: The name in `spring.application.name` should be lowercase `challenge-service`, but Eureka registers it as uppercase `CHALLENGE-SERVICE`.

### Check 3: Restart Everything in Order

If nothing else works, restart all services:

1. **Stop all services** in IntelliJ (stop buttons)
2. **Start Eureka** first
3. Wait 10 seconds
4. **Start Challenge Service**
5. Wait 30 seconds
6. Check Eureka dashboard - should see CHALLENGE-SERVICE
7. **Start API Gateway**
8. Wait 10 seconds
9. Test: http://localhost:8888/challenge-service/api/challenges

---

## 🎯 Quick Fix Commands

```powershell
# Check what's running
Get-NetTCPConnection -LocalPort 8761,8086,8888 | Select LocalPort,State

# Test Challenge Service directly
curl http://localhost:8086/api/challenges

# Test through Gateway
curl http://localhost:8888/challenge-service/api/challenges

# Create a test challenge
$body = '{"title":"Test","description":"Test","type":"VOCABULARY","skillFocus":"VOCABULARY","level":"A1","category":"Test","points":10,"isPublic":true,"questions":[{"type":"MULTIPLE_CHOICE","questionText":"Test?","options":["A","B"],"correctAnswer":"A","explanation":"Test","points":10,"orderIndex":0}]}'

Invoke-WebRequest -Uri "http://localhost:8888/challenge-service/api/challenges" -Method POST -Body $body -ContentType "application/json"
```

---

## 💡 Why This Happens

The API Gateway caches route configurations. When you:
1. Add a new route to GatewayConfig.java
2. The Gateway needs to be restarted to load the new route
3. Even if Challenge Service is running, Gateway won't route to it without restart

**Solution**: Always restart API Gateway after adding new service routes!

---

## ✅ Success Checklist

After restarting API Gateway, verify:
- [ ] Eureka shows CHALLENGE-SERVICE as UP
- [ ] Eureka shows API-GATEWAY as UP
- [ ] `curl http://localhost:8086/api/challenges` returns `[]`
- [ ] `curl http://localhost:8888/challenge-service/api/challenges` returns `[]`
- [ ] Back-office Challenges page loads without errors
- [ ] Can create a challenge in back-office
- [ ] Frontend Challenges page loads without errors

---

## 🎉 You're Done!

Once API Gateway is restarted and routing correctly, you can:
1. Create challenges in back-office (http://localhost:4201/challenges)
2. View challenges in frontend (http://localhost:4200/challenges)
3. Take challenges and get results
4. Use the sample challenges from HOW_TO_CREATE_SAMPLE_CHALLENGES.md

Happy testing! 🚀
