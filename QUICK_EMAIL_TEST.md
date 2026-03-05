# ⚡ Quick Email Test - 3 Steps

## Step 1: Configure Gmail (5 min)

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy the 16-character password

## Step 2: Update Configuration (1 min)

Edit: `AbonnementService/src/main/resources/application.properties`

```properties
spring.mail.username=YOUR-EMAIL@gmail.com
spring.mail.password=YOUR-16-CHAR-PASSWORD
```

## Step 3: Test! (2 min)

### Option A: PowerShell Script (Easiest)
```powershell
.\TEST_EMAIL_NOW.ps1
```
Enter your email when prompted.

### Option B: Manual Command
```powershell
$body = @{
    email = "YOUR-EMAIL@gmail.com"
    name = "Your Name"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:8084/api/test/send-email" `
  -ContentType "application/json" -Body $body
```

### Option C: cURL
```bash
curl -X POST http://localhost:8084/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR-EMAIL@gmail.com","name":"Your Name"}'
```

---

## ✅ Expected Result

You should receive an email with:
- Subject: "⏰ Your Premium Subscription Expires Soon..."
- Promo code: RENEW-XXXXX
- 15% discount offer
- Beautiful HTML design

---

## ⚠️ Troubleshooting

**Email not received?**
1. Check spam folder
2. Verify email config in `application.properties`
3. Ensure AbonnementService is running: `mvn spring-boot:run`
4. Check console for errors

**Authentication failed?**
- Regenerate Gmail App Password
- Remove spaces from password
- Ensure 2-Step Verification is enabled

---

**Total Time**: 8 minutes  
**Files to edit**: 1 (`application.properties`)  
**Commands to run**: 1 (PowerShell script or cURL)
