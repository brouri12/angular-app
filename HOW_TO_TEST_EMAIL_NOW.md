# 🚀 How to Test Email Service - Quick Guide

## The Problem
You got a 500 error because **AbonnementService is not running yet**.

---

## ✅ Solution (2 Steps)

### Step 1: Start AbonnementService

Open a **NEW terminal** and run:

```bash
cd AbonnementService
mvn clean install -DskipTests
mvn spring-boot:run
```

**Wait for this message:**
```
✅ Microservice Abonnement démarré avec succès!
📍 Port: 8084
```

This takes about 30-60 seconds.

---

### Step 2: Test Email (in your current terminal)

Once the service is running, run:

```powershell
.\START_AND_TEST_EMAIL.ps1
```

This will:
- ✅ Check if service is running
- ✅ Send test email to marwenazouzi44@gmail.com
- ✅ Show you the promo code generated
- ✅ Tell you to check your inbox

---

## 📧 What to Expect

You'll receive an email with:
- **Subject**: "⏰ Your Premium Subscription Expires Soon - Special Offer Inside!"
- **From**: E-Learning Platform <marwenazouzi44@gmail.com>
- **Content**: Beautiful HTML email with 15% discount promo code
- **Promo Code**: RENEW-XXXXX (unique each time)

---

## 🔧 Alternative: Manual Test

If you prefer to test manually:

```powershell
# 1. Check if service is running
Invoke-WebRequest -Uri "http://localhost:8084/actuator/health"

# 2. Send test email
$body = @{
    email = "marwenazouzi44@gmail.com"
    name = "Marwen Azouzi"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:8084/api/test/send-email" `
  -ContentType "application/json" -Body $body
```

---

## ⚠️ Troubleshooting

### Service won't start?
Check console for errors. Common issues:
- MySQL not running on port 3307
- Port 8084 already in use
- Eureka server not running (not critical for email testing)

### Email not received?
1. Check spam folder
2. Wait 1-2 minutes (Gmail can be slow)
3. Check AbonnementService console for email sending logs
4. Verify Gmail app password is correct: `joqcqyezefbxhbzd`

### Still getting 500 error?
The service needs to be fully started. Look for:
```
Started AbonnementApplication in X.XXX seconds
```

---

## 📊 Email Configuration

Already configured in `application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=marwenazouzi44@gmail.com
spring.mail.password=joqcqyezefbxhbzd
```

Sender is set to: **marwenazouzi44@gmail.com**

---

## 🎯 Next Steps After Testing

Once email works:

1. **Test automatic scheduler**: Wait until 9 AM tomorrow, or change cron to test sooner
2. **Create test data**: Add a payment that expires in 7 days
3. **Verify promo codes**: Check that codes work in pricing page
4. **Monitor logs**: Watch for automatic email sending

---

## ✅ Quick Checklist

- [ ] Open new terminal
- [ ] `cd AbonnementService`
- [ ] `mvn clean install -DskipTests`
- [ ] `mvn spring-boot:run`
- [ ] Wait for "démarré avec succès"
- [ ] Run `.\START_AND_TEST_EMAIL.ps1`
- [ ] Check email inbox
- [ ] Celebrate! 🎉

---

**Total Time**: 2-3 minutes

**Status**: Ready to test once service is running!
