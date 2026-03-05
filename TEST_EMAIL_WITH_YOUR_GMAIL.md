# 📧 Test Renewal Email with Your Gmail - Step by Step

## 🎯 Goal
Send a test renewal email to your own Gmail address to see how it looks.

---

## 📋 Prerequisites
- Gmail account
- Chrome/Firefox browser
- AbonnementService running
- UserService running (for payment data)

---

## 🚀 Step-by-Step Guide

### Step 1: Get Gmail App Password (5 minutes)

1. **Open Gmail Settings**:
   - Go to: https://myaccount.google.com/security
   - Sign in with your Gmail account

2. **Enable 2-Step Verification** (if not already enabled):
   - Scroll to "How you sign in to Google"
   - Click "2-Step Verification"
   - Follow the setup wizard
   - Verify with your phone

3. **Generate App Password**:
   - Go back to: https://myaccount.google.com/security
   - Scroll to "How you sign in to Google"
   - Click "App passwords" (or search for "App passwords")
   - Select "Mail" as the app
   - Select "Windows Computer" as the device
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`

---

### Step 2: Configure Email in AbonnementService (2 minutes)

1. **Open the configuration file**:
   ```
   AbonnementService/src/main/resources/application.properties
   ```

2. **Update these lines**:
   ```properties
   # Replace with YOUR email
   spring.mail.username=your-email@gmail.com
   
   # Replace with YOUR app password (16 characters, no spaces)
   spring.mail.password=abcdefghijklmnop
   ```

3. **Example**:
   ```properties
   spring.mail.username=marwen.test@gmail.com
   spring.mail.password=xyzw1234abcd5678
   ```

4. **Save the file**

---

### Step 3: Create Test Payment in Database (3 minutes)

We need a payment that expires in exactly 7 days.

1. **Open phpMyAdmin**: http://localhost/phpmyadmin

2. **Select `user_db` database**

3. **Go to SQL tab**

4. **Execute this SQL** (replace with YOUR email):

```sql
-- Calculate date 7 days from now
SET @expiration_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY);
SET @payment_date = DATE_SUB(@expiration_date, INTERVAL 30 DAY);

-- Insert test payment
INSERT INTO payments (
    id_user,
    id_abonnement,
    nom_client,
    email_client,
    type_abonnement,
    montant,
    methode_paiement,
    reference_transaction,
    statut,
    date_paiement,
    created_at
) VALUES (
    999,                              -- Test user ID
    2,                                -- Premium subscription (ID 2)
    'Test User',                      -- Your name
    'YOUR-EMAIL@gmail.com',           -- ⚠️ REPLACE WITH YOUR EMAIL
    'Premium',
    90.00,
    'carte',
    'TEST-RENEWAL-001',
    'Validé',                         -- Must be 'Validé' with accent
    @payment_date,                    -- 23 days ago (expires in 7 days)
    NOW()
);

-- Verify the payment
SELECT 
    id_payment,
    email_client,
    type_abonnement,
    date_paiement,
    DATE_ADD(date_paiement, INTERVAL 30 DAY) as expiration_date,
    DATEDIFF(DATE_ADD(date_paiement, INTERVAL 30 DAY), CURDATE()) as days_until_expiration
FROM payments
WHERE email_client = 'YOUR-EMAIL@gmail.com';
```

5. **Verify the result shows**: `days_until_expiration = 7`

---

### Step 4: Build and Start AbonnementService (2 minutes)

1. **Open terminal/PowerShell**

2. **Navigate to AbonnementService**:
   ```bash
   cd AbonnementService
   ```

3. **Build the project**:
   ```bash
   mvn clean install -DskipTests
   ```

4. **Start the service**:
   ```bash
   mvn spring-boot:run
   ```

5. **Wait for**:
   ```
   ✅ Microservice Abonnement démarré avec succès!
   📍 Port: 8084
   ```

---

### Step 5: Trigger Email Manually (1 minute)

1. **Open a new terminal/PowerShell**

2. **Send manual trigger**:
   ```bash
   curl -X POST http://localhost:8084/api/renewal/trigger
   ```

   Or in PowerShell:
   ```powershell
   Invoke-RestMethod -Method POST -Uri "http://localhost:8084/api/renewal/trigger"
   ```

3. **Check the response**:
   ```json
   {
     "status": "success",
     "message": "Renewal reminder check triggered successfully"
   }
   ```

---

### Step 6: Check Your Email! (1 minute)

1. **Open your Gmail inbox**

2. **Look for email with subject**:
   ```
   ⏰ Your Premium Subscription Expires Soon - Special Offer Inside!
   ```

3. **Check spam folder** if not in inbox

4. **The email should contain**:
   - Your name
   - Expiration date (7 days from now)
   - Unique promo code (e.g., `RENEW-A7B2C`)
   - 15% discount offer
   - Renewal button
   - Benefits list

---

### Step 7: Verify in Logs (Optional)

1. **Check AbonnementService console output**:
   ```
   🔍 Checking for expiring subscriptions...
   ✅ Renewal reminder sent to: YOUR-EMAIL@gmail.com
   ✓ Renewal reminder email sent to: YOUR-EMAIL@gmail.com
   ```

2. **If you see errors**, check:
   - Email configuration is correct
   - App password has no spaces
   - Gmail account has 2-Step Verification enabled

---

## 🧪 Alternative: Test with Simple Email

If you want to test quickly without the full renewal logic:

### Create a Test Endpoint

1. **Create this file**: `AbonnementService/src/main/java/tn/esprit/abonnement/controller/TestEmailController.java`

```java
package tn.esprit.abonnement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.abonnement.service.EmailService;
import tn.esprit.abonnement.service.PromoCodeService;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private PromoCodeService promoCodeService;

    @PostMapping("/send-email")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.getOrDefault("name", "Test User");
        
        String promoCode = promoCodeService.generateRenewalPromoCode();
        
        emailService.sendRenewalReminderWithPromo(
            email,
            name,
            "Premium",
            "12/03/2026",
            promoCode,
            15.0
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Test email sent to: " + email);
        response.put("promoCode", promoCode);
        
        return ResponseEntity.ok(response);
    }
}
```

2. **Restart AbonnementService**

3. **Send test email**:
```bash
curl -X POST http://localhost:8084/api/test/send-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"YOUR-EMAIL@gmail.com\",\"name\":\"Your Name\"}"
```

Or PowerShell:
```powershell
$body = @{
    email = "YOUR-EMAIL@gmail.com"
    name = "Your Name"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:8084/api/test/send-email" `
  -ContentType "application/json" -Body $body
```

4. **Check your email!**

---

## ⚠️ Troubleshooting

### Problem: Email not received

**Check 1: Spam folder**
- Gmail might mark it as spam first time

**Check 2: Email configuration**
```properties
# Verify these are correct
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
```

**Check 3: App password**
- Must be 16 characters
- No spaces
- Generated from Google Account settings

**Check 4: 2-Step Verification**
- Must be enabled in Google Account

**Check 5: Logs**
```
# Look for errors in console
✗ Failed to send email to: ...
```

### Problem: Authentication failed

**Solution**: Regenerate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Delete old password
3. Generate new one
4. Update `application.properties`
5. Restart service

### Problem: Connection timeout

**Solution**: Check firewall/antivirus
- Allow Java to access internet
- Allow port 587 (SMTP)

---

## 📊 Expected Result

You should receive an email that looks like this:

```
┌─────────────────────────────────────────┐
│   ⏰ Subscription Expiring Soon!        │
├─────────────────────────────────────────┤
│                                         │
│ Hi Your Name,                           │
│                                         │
│ Your Premium subscription is expiring   │
│ soon!                                   │
│                                         │
│ ⚠️ Expiration Date: 12/03/2026         │
│    (in 7 days)                          │
│                                         │
│ 🎁 Special Renewal Offer               │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │      15% OFF                     │   │
│ │                                  │   │
│ │   Your Promo Code:               │   │
│ │   RENEW-A7B2C                    │   │
│ │                                  │   │
│ │   Valid for 14 days              │   │
│ └─────────────────────────────────┘   │
│                                         │
│      [🔄 Renew Now & Save]             │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Gmail App Password generated
- [ ] `application.properties` updated with your email
- [ ] Test payment created in database (expires in 7 days)
- [ ] AbonnementService built and running
- [ ] Manual trigger sent
- [ ] Email received in Gmail inbox
- [ ] Promo code visible in email
- [ ] Email looks good (HTML formatted)

---

## 🎉 Next Steps

Once you receive the test email:

1. **Test the promo code**:
   ```bash
   curl "http://localhost:8084/api/promo/validate?code=RENEW-A7B2C"
   ```

2. **Apply the discount**:
   ```bash
   curl -X POST http://localhost:8084/api/promo/apply \
     -H "Content-Type: application/json" \
     -d '{"code":"RENEW-A7B2C","amount":90.00}'
   ```

3. **Set up automatic daily checks**:
   - The scheduler runs automatically at 9 AM every day
   - No manual trigger needed in production

---

**Total Time**: ~15 minutes  
**Difficulty**: Easy 🟢  
**Result**: Beautiful renewal email in your inbox! 📧
