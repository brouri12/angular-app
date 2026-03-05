# Start Challenge Service - Quick Guide

## 🚨 Problem: 404 Error

You're getting a 404 error because the Challenge Service is either:
1. Not running
2. Not registered with Eureka
3. API Gateway hasn't picked up the registration

---

## ✅ Solution: Start Services in Correct Order

### Step 1: Start Eureka Server (FIRST)
```
1. Open IntelliJ
2. Navigate to: EurekaServer/src/main/java/.../EurekaServerApplication.java
3. Right-click → Run 'EurekaServerApplication'
4. Wait for: "Started EurekaServerApplication"
5. Open browser: http://localhost:8761
6. You should see Eureka dashboard
```

### Step 2: Start Challenge Service (SECOND)
```
1. In IntelliJ
2. Navigate to: ChallengeService/src/main/java/tn/esprit/challenge/ChallengeApplication.java
3. Right-click → Run 'ChallengeApplication'
4. Wait for these messages:
   - "Started ChallengeApplication in X seconds"
   - "Registering application CHALLENGE-SERVICE with eureka"
   - "DiscoveryClient_CHALLENGE-SERVICE - registration status: 204"
5. Check console for port: "Tomcat started on port(s): 8086"
```

### Step 3: Verify Registration
```
1. Open: http://localhost:8761
2. Look for "Instances currently registered with Eureka"
3. You should see: CHALLENGE-SERVICE
4. Status should be: UP (1) - localhost:challenge-service:8086
```

### Step 4: Start API Gateway (THIRD)
```
1. In IntelliJ
2. Navigate to: ApiGateway/src/main/java/tn/esprit/gateway/ApiGatewayApplication.java
3. Right-click → Run 'ApiGatewayApplication'
4. Wait for: "Started ApiGatewayApplication"
5. Check console for port: "Tomcat started on port(s): 8888"
```

### Step 5: Test the Connection
Run the PowerShell script:
```powershell
.\CHECK_CHALLENGE_SERVICE.ps1
```

Or test manually:
```powershell
# Test Challenge Service directly
curl http://localhost:8086/api/challenges

# Test through API Gateway
curl http://localhost:8888/challenge-service/api/challenges
```

---

## 🔍 Troubleshooting

### Issue 1: Challenge Service Won't Start

**Error**: Port 8086 already in use
```powershell
# Find and kill process on port 8086
netstat -ano | findstr :8086
taskkill /PID <PID_NUMBER> /F
```

**Error**: MySQL connection failed
```
1. Make sure MySQL is running on port 3307
2. Check password in application.properties (currently empty)
3. MySQL will auto-create challenge_db database
```

### Issue 2: Not Registering with Eureka

**Check application.properties**:
```properties
spring.application.name=challenge-service
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

**Restart in order**:
1. Stop Challenge Service
2. Make sure Eureka is running
3. Start Challenge Service
4. Wait 30 seconds
5. Check http://localhost:8761

### Issue 3: API Gateway Returns 404

**Verify Gateway Configuration**:
```java
// In GatewayConfig.java, you should have:
.route("challenge-service", r -> r
    .path("/challenge-service/**")
    .filters(f -> f.stripPrefix(1))
    .uri("lb://CHALLENGE-SERVICE"))
```

**Restart API Gateway**:
1. Stop API Gateway
2. Make sure Challenge Service is registered in Eureka
3. Start API Gateway
4. Test: http://localhost:8888/challenge-service/api/challenges

### Issue 4: CORS Errors

**Check CorsConfig.java in API Gateway**:
```java
.allowedOrigins("http://localhost:4200", "http://localhost:4201")
```

---

## 📋 Checklist

Before testing in frontend:
- [ ] Eureka running on 8761
- [ ] Challenge Service running on 8086
- [ ] Challenge Service registered in Eureka (check dashboard)
- [ ] API Gateway running on 8888
- [ ] Direct test works: `curl http://localhost:8086/api/challenges`
- [ ] Gateway test works: `curl http://localhost:8888/challenge-service/api/challenges`
- [ ] MySQL running on 3307
- [ ] Database `challenge_db` exists (auto-created)

---

## 🎯 Expected Console Output

### Challenge Service Console:
```
2024-XX-XX 08:30:00.000  INFO --- [main] t.e.c.ChallengeApplication : Starting ChallengeApplication
2024-XX-XX 08:30:05.000  INFO --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat started on port(s): 8086
2024-XX-XX 08:30:05.100  INFO --- [main] c.n.e.DiscoveryClient : Registering application CHALLENGE-SERVICE with eureka
2024-XX-XX 08:30:05.200  INFO --- [main] c.n.e.DiscoveryClient : DiscoveryClient_CHALLENGE-SERVICE - registration status: 204
2024-XX-XX 08:30:06.000  INFO --- [main] t.e.c.ChallengeApplication : Started ChallengeApplication in 6.5 seconds
```

### API Gateway Console:
```
2024-XX-XX 08:31:00.000  INFO --- [main] t.e.g.ApiGatewayApplication : Starting ApiGatewayApplication
2024-XX-XX 08:31:05.000  INFO --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat started on port(s): 8888
2024-XX-XX 08:31:05.100  INFO --- [main] t.e.g.ApiGatewayApplication : Started ApiGatewayApplication in 5.2 seconds
```

---

## 🚀 Quick Test Commands

After all services are running:

```powershell
# Test 1: Challenge Service directly
Invoke-WebRequest -Uri "http://localhost:8086/api/challenges" -Method GET

# Test 2: Through API Gateway
Invoke-WebRequest -Uri "http://localhost:8888/challenge-service/api/challenges" -Method GET

# Test 3: Create a challenge
$body = @{
    title = "Test Challenge"
    description = "Testing"
    type = "VOCABULARY"
    skillFocus = "VOCABULARY"
    level = "A1"
    category = "Test"
    points = 10
    isPublic = $true
    questions = @(
        @{
            type = "MULTIPLE_CHOICE"
            questionText = "Test question?"
            options = @("A", "B", "C", "D")
            correctAnswer = "A"
            explanation = "Test explanation"
            points = 10
            orderIndex = 0
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:8888/challenge-service/api/challenges" -Method POST -Body $body -ContentType "application/json"
```

---

## 💡 Pro Tips

1. **Always start Eureka first** - Other services need it to register
2. **Wait 30 seconds** after starting a service before starting the next
3. **Check Eureka dashboard** at http://localhost:8761 to verify registration
4. **Restart API Gateway** if you start a new service after Gateway is already running
5. **Check IntelliJ console** for error messages
6. **Use the CHECK_CHALLENGE_SERVICE.ps1 script** to diagnose issues

---

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ Eureka dashboard shows CHALLENGE-SERVICE
2. ✅ `curl http://localhost:8086/api/challenges` returns `[]` (empty array)
3. ✅ `curl http://localhost:8888/challenge-service/api/challenges` returns `[]`
4. ✅ Frontend at http://localhost:4200/challenges loads without errors
5. ✅ Back-office at http://localhost:4201/challenges loads without errors

---

## 📞 Still Having Issues?

Run the diagnostic script:
```powershell
.\CHECK_CHALLENGE_SERVICE.ps1
```

This will check:
- Port availability
- Service status
- Eureka registration
- API Gateway routing
- Direct connectivity

And provide specific instructions for your situation!
