# 🎯 Test Real Renewal Email System

## What This Tests

The automatic renewal email system that:
1. Checks for subscriptions expiring in 7 days
2. Generates unique promo codes (15% discount)
3. Sends emails from marwenazouzi44@gmail.com
4. Runs automatically every day at 9 AM

---

## ✅ Quick Test (Manual Trigger)

### Step 1: Make sure AbonnementService is running

```bash
cd AbonnementService
mvn spring-boot:run
```

### Step 2: Trigger the renewal check manually

```powershell
.\TEST_RENEWAL_SCHEDULER.ps1
```

This will:
- Trigger the renewal check immediately
- Show you the results
- Check console logs for details

### Step 3: Check the console output

Look for messages like:
```
🔍 Checking for expiring subscriptions...
📋 Found X validated payments from UserService
⏰ Payment X expires on YYYY-MM-DD (X days from now)
✅ Renewal reminder sent to: email@example.com | Promo: RENEW-XXXXX
```

---

## 📊 What Gets Checked

The system checks all validated payments and:

1. **Card/PayPal payments**: Uses `date_paiement` as start date
2. **Bank transfer**: Uses `date_validation` as start date
3. **Calculates expiration**: Start date + subscription duration
4. **Sends email if**: Expires in exactly 7 days

---

## 🧪 Create Test Data (Expires in 7 Days)

To test with real data that expires in 7 days, you need to:

### Option 1: Update existing payment in database

```sql
-- Find a payment to update
SELECT id_payment, email_client, date_paiement, id_abonnement 
FROM user_db.payments 
WHERE statut = 'Validé';

-- Update it to expire in 7 days (for 30-day subscription)
UPDATE user_db.payments 
SET date_paiement = DATE_SUB(NOW(), INTERVAL 23 DAY)
WHERE id_payment = YOUR_PAYMENT_ID;

-- Now it will expire in 7 days (23 + 7 = 30)
```

### Option 2: Create new test payment

```sql
INSERT INTO user_db.payments (
    id_user, id_abonnement, montant, methode_paiement, 
    statut, date_paiement, email_client, nom_client
) VALUES (
    33, -- Your user ID
    2,  -- Premium subscription (30 days)
    90.0,
    'carte',
    'Validé',
    DATE_SUB(NOW(), INTERVAL 23 DAY), -- Expires in 7 days
    'freaksboysstreetboys@gmail.com',
    'Test User'
);
```

---

## 🔄 Test the Automatic Scheduler

### Current Schedule
- **Runs**: Every day at 9:00 AM
- **Checks**: All validated payments
- **Sends**: Emails for subscriptions expiring in 7 days

### To Test Immediately

Change the schedule in `RenewalReminderService.java`:

```java
// Change from:
@Scheduled(cron = "0 0 9 * * *") // Every day at 9 AM

// To (for testing - every 2 minutes):
@Scheduled(fixedRate = 120000) // Every 2 minutes
```

Then restart AbonnementService and wait 2 minutes.

---

## 📧 Email Details

**From**: E-Learning Platform <marwenazouzi44@gmail.com>  
**To**: User's email from payment record  
**Subject**: ⏰ Your [Subscription] Subscription Expires Soon - Special Offer Inside!

**Content**:
- Expiration date warning
- 15% discount offer
- Unique promo code (RENEW-XXXXX)
- Renew button linking to pricing page
- Instructions on how to use the code

---

## 🎯 Test Checklist

- [ ] AbonnementService is running
- [ ] Run `.\TEST_RENEWAL_SCHEDULER.ps1`
- [ ] Check console for "Checking for expiring subscriptions"
- [ ] Verify emails sent count
- [ ] Check email inbox (freaksboysstreetboys@gmail.com)
- [ ] Verify promo code in email
- [ ] Test promo code works (optional)

---

## 🔍 Troubleshooting

### No emails sent?
- Check if any payments expire in exactly 7 days
- Verify payments have status "Validé"
- Check console logs for errors
- Verify email configuration in application.properties

### Email not received?
- Check spam folder
- Wait 1-2 minutes
- Verify sender email: marwenazouzi44@gmail.com
- Check AbonnementService console for email sending logs

### Want to test with different expiration days?
- Change the check in `RenewalReminderService.java`:
```java
if (daysUntilExpiration == 7) { // Change 7 to any number
```

---

## 📊 Monitoring

### Check how many reminders were sent:
```powershell
# Trigger and see results
.\TEST_RENEWAL_SCHEDULER.ps1
```

### Clear cache to resend emails:
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8084/api/renewal/clear-cache"
```

### Check service health:
```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8084/api/renewal/health"
```

---

## ✅ Success Indicators

You'll know it's working when you see:

1. **Console logs**:
   ```
   ✅ Renewal reminder sent to: email@example.com
   Promo: RENEW-A7B2C
   ```

2. **Email received** with:
   - Beautiful HTML design
   - Correct expiration date
   - Unique promo code
   - Working "Renew Now" button

3. **No errors** in console

---

## 🎉 Next Steps

Once tested:

1. **Set schedule back to daily**: `@Scheduled(cron = "0 0 9 * * *")`
2. **Monitor logs** for automatic sends
3. **Integrate promo codes** in pricing page
4. **Track conversions** (optional)

---

**Status**: Ready to test!  
**Sender**: marwenazouzi44@gmail.com  
**Recipient**: freaksboysstreetboys@gmail.com (for testing)
