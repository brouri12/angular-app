# Restart Services to Fix Email System

## What Was Fixed

1. **UserService PaymentController**: Reordered endpoints so `/validated` comes BEFORE `/{id}` path variable
   - This prevents Spring from trying to convert "validated" to a Long
   
2. **AbonnementService RenewalReminderService**: Added better logging to track the API call

## How to Restart

### Option 1: Stop and Restart (Recommended)

1. **Stop UserService** (press Ctrl+C in its terminal)
2. **Restart UserService**:
   ```powershell
   cd UserService
   mvn spring-boot:run
   ```

3. **Stop AbonnementService** (press Ctrl+C in its terminal)
4. **Restart AbonnementService**:
   ```powershell
   cd AbonnementService
   mvn spring-boot:run
   ```

### Option 2: Test First

Run the debug script to verify the fix:
```powershell
.\DEBUG_RENEWAL_SYSTEM.ps1
```

## What to Expect

After restarting, the scheduler will run every 2 minutes and:

1. Call `http://localhost:8085/api/payments/validated` ✅
2. Get all validated payments
3. Check which ones expire in 4 days (for testing)
4. Send renewal email with promo code
5. Log: "✅ Renewal reminders sent: X"

## Check Logs

Look for these messages in AbonnementService logs:

```
🔍 Checking for expiring subscriptions...
📞 Calling UserService: http://localhost:8085/api/payments/validated
📦 Received X payments from UserService
✅ Renewal reminder sent to: email@example.com | Subscription: Premium | Promo: RENEW-XXXXX
✅ Renewal reminders sent: 1
```

## After Testing

Once you confirm emails are sending, change back to 7 days:

In `RenewalReminderService.java` line 77:
```java
if (daysUntilExpiration == 7) { // Changed back to 7 for production
```
