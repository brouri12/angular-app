# Quick Test Guide - Subscription Reminder System

## Prerequisites
- MySQL running on port 3307
- Java/Maven installed
- Node.js/Angular CLI installed

## Step-by-Step Testing

### Step 1: Start Backend Services

Open 3 separate terminals:

**Terminal 1 - AbonnementService:**
```bash
cd AbonnementService
mvn spring-boot:run
```
Wait for: `✅ Microservice Abonnement démarré avec succès!`

**Terminal 2 - UserService:**
```bash
cd UserService
mvn spring-boot:run
```
Wait for: Service started successfully

**Terminal 3 - ApiGateway (Optional):**
```bash
cd ApiGateway
mvn spring-boot:run
```

### Step 2: Create Test Data

**Option A: Using PowerShell Script (Recommended)**
```powershell
.\CREATE_TEST_REMINDER_DATA.ps1
```
- Enter MySQL credentials
- Select a user ID and subscription ID
- Script will create 5 test payments with different expiration dates

**Option B: Using SQL Script**
```bash
# Edit the file first to set your user ID and subscription ID
mysql -u root -p -P 3307 < CREATE_TEST_REMINDER_DATA.sql
```

### Step 3: Test the Reminder System

**Option A: Using Test Script (Recommended)**
```powershell
.\TEST_REMINDER_SYSTEM.ps1
```

This will:
- ✓ Check if all services are running
- ✓ Test UserService /validated endpoint
- ✓ Trigger manual reminder check
- ✓ Test user-specific reminders
- ✓ Test API Gateway routing

**Option B: Manual API Testing**

1. **Check validated payments:**
```bash
curl http://localhost:8085/api/payments/validated
```

2. **Trigger reminder check:**
```bash
curl -X POST http://localhost:8083/api/subscription-reminders/check-now
```

3. **Get reminders for a user:**
```bash
curl http://localhost:8083/api/subscription-reminders/user/1
```
Replace `1` with your actual user ID.

4. **Get all reminders:**
```bash
curl http://localhost:8083/api/subscription-reminders/all
```

### Step 4: Test Frontend

**Terminal 4 - Frontend:**
```bash
cd frontend/angular-app
ng serve --port 4200
```

**Then:**
1. Open browser: http://localhost:4200
2. Login with your user account
3. Look for the bell icon 🔔 in the top right header
4. Click the bell to see the reminders dropdown
5. You should see reminders with different colors:
   - 🔴 Red: Expired subscriptions
   - 🟠 Orange: Expiring today
   - 🟡 Yellow: Expiring soon (7-14 days)

## Expected Results

### Test Data Created
You should have 5 test payments:
1. **Expired** - 5 days past expiration (Red alert)
2. **Expiring Today** - Expires today (Orange alert)
3. **Expiring in 7 days** - Yellow alert
4. **Expiring in 14 days** - Yellow alert
5. **Bank Transfer** - Expiring in 5 days (Yellow alert)

### API Responses

**GET /api/payments/validated** should return:
```json
[
  {
    "id_payment": 1,
    "idUser": 1,
    "typeAbonnement": "Premium",
    "methodePaiement": "carte",
    "datePaiement": "2026-01-30T10:00:00",
    "statut": "Validé"
  }
]
```

**POST /api/subscription-reminders/check-now** should return:
```json
[
  {
    "userId": 1,
    "userName": "Test User - Expired",
    "userEmail": "expired@test.com",
    "subscriptionName": "Premium",
    "expirationDate": "2026-02-28T10:00:00",
    "daysUntilExpiration": -5,
    "reminderType": "EXPIRED",
    "message": "Your subscription has expired. Renew now to continue accessing premium features!"
  }
]
```

### Frontend Bell Icon
- Bell icon appears in header (only when logged in)
- Red badge shows number of unread reminders
- Clicking bell shows dropdown with all reminders
- Each reminder shows:
  - Icon (❌, ⚠️, or ⏰)
  - Message
  - Subscription name
  - Days until expiration
  - "Renew Subscription" button

## Troubleshooting

### No reminders showing?

**Check 1: Services running?**
```powershell
.\TEST_REMINDER_SYSTEM.ps1
```

**Check 2: Payments exist?**
```bash
mysql -u root -p -P 3307 -D elearning_db -e "SELECT * FROM payments WHERE statut = 'Validé';"
```

**Check 3: Subscriptions exist?**
```bash
mysql -u root -p -P 3307 -D elearning_db -e "SELECT * FROM abonnements;"
```

**Check 4: Scheduler logs**
Look for in AbonnementService console:
```
🔔 Starting subscription expiration check...
✅ Subscription check complete. Found X reminders
```

### Bell icon not visible?

1. Make sure you're logged in
2. Check browser console for errors (F12)
3. Verify component is imported in header.ts
4. Clear Angular cache:
```bash
cd frontend/angular-app
Remove-Item -Recurse -Force .angular
ng serve --port 4200
```

### API errors?

**UserService not responding:**
```bash
curl http://localhost:8085/actuator/health
```

**AbonnementService not responding:**
```bash
curl http://localhost:8083/actuator/health
```

**Connection refused:**
- Check if services are running
- Check port numbers (8083, 8085)
- Check firewall settings

### Database errors?

**Check MySQL is running:**
```bash
mysql -u root -p -P 3307 -e "SELECT 1;"
```

**Check database exists:**
```bash
mysql -u root -p -P 3307 -e "SHOW DATABASES LIKE 'elearning_db';"
```

## Scheduler Testing

The scheduler runs:
- **Daily at 9:00 AM**: `@Scheduled(cron = "0 0 9 * * *")`
- **Every hour**: `@Scheduled(cron = "0 0 * * * *")`

To test without waiting:
```bash
curl -X POST http://localhost:8083/api/subscription-reminders/check-now
```

## Cleanup Test Data

To remove test payments:
```bash
mysql -u root -p -P 3307 -D elearning_db -e "DELETE FROM payments WHERE nom_client LIKE 'Test User%';"
```

## API Endpoints Reference

### AbonnementService (Direct)
```
GET    http://localhost:8083/api/subscription-reminders/user/{userId}
GET    http://localhost:8083/api/subscription-reminders/user/{userId}/count
GET    http://localhost:8083/api/subscription-reminders/all
DELETE http://localhost:8083/api/subscription-reminders/user/{userId}/dismiss/{type}
POST   http://localhost:8083/api/subscription-reminders/check-now
```

### Via API Gateway
```
GET    http://localhost:8888/abonnement-service/api/subscription-reminders/user/{userId}
GET    http://localhost:8888/abonnement-service/api/subscription-reminders/all
POST   http://localhost:8888/abonnement-service/api/subscription-reminders/check-now
```

### UserService
```
GET    http://localhost:8085/api/payments/validated
```

## Success Criteria

✅ All services start without errors
✅ Test data created successfully
✅ Manual trigger returns reminders
✅ User-specific endpoint works
✅ Bell icon appears in frontend
✅ Clicking bell shows dropdown
✅ Reminders display with correct colors
✅ Dismiss functionality works
✅ Auto-refresh works (check after 5 minutes)

## Next Steps

1. Test with real user data
2. Adjust reminder thresholds if needed
3. Configure API Gateway routes
4. Add email notifications (optional)
5. Deploy to production

---

**Need Help?**
- Check logs in service consoles
- Run `.\TEST_REMINDER_SYSTEM.ps1` for diagnostics
- See `SUBSCRIPTION_REMINDER_SYSTEM.md` for full documentation
