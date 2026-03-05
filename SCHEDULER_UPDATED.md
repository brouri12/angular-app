# Scheduler Updated to Every 2 Minutes

## Changes Made

Updated the subscription reminder scheduler in `SubscriptionReminderService.java`:

### Before:
```java
@Scheduled(cron = "0 0 9 * * *")  // Daily at 9:00 AM
public void checkExpiringSubscriptions() { ... }

@Scheduled(cron = "0 0 * * * *")  // Every hour
public void checkImmediateReminders() { ... }
```

### After:
```java
@Scheduled(cron = "0 */2 * * * *")  // Every 2 minutes
public void checkExpiringSubscriptions() { ... }

// Hourly check disabled (commented out)
```

## Cron Expression Explained

`0 */2 * * * *` means:
- `0` - At second 0
- `*/2` - Every 2 minutes
- `*` - Every hour
- `*` - Every day
- `*` - Every month
- `*` - Every day of week

So it runs: 00:00, 00:02, 00:04, 00:06, etc.

## What This Means

1. **Automatic Checks**: The system will now check for expiring subscriptions every 2 minutes
2. **No Manual Trigger Needed**: After restarting the service, wait max 2 minutes for the first check
3. **Real-time Updates**: Reminders will be updated every 2 minutes

## Testing

### Step 1: Restart AbonnementService
Stop and restart the service to apply the change.

### Step 2: Wait 2 Minutes
The scheduler will run automatically within 2 minutes.

### Step 3: Check Logs
You'll see in the console every 2 minutes:
```
🔔 Starting subscription expiration check...
📋 Found X validated payments from UserService
...
✅ Subscription check complete. Found X reminders
```

### Step 4: Test Frontend
Login at http://localhost:4200 and check the bell icon.

## For Production

**Important**: For production, you should change this back to a more reasonable interval:

```java
// For production - check once per day
@Scheduled(cron = "0 0 9 * * *")  // Daily at 9:00 AM

// OR check every hour
@Scheduled(cron = "0 0 * * * *")  // Every hour

// OR check every 30 minutes
@Scheduled(cron = "0 */30 * * * *")  // Every 30 minutes
```

Checking every 2 minutes is good for testing but may be too frequent for production.

## Common Cron Patterns

```java
// Every minute
@Scheduled(cron = "0 * * * * *")

// Every 5 minutes
@Scheduled(cron = "0 */5 * * * *")

// Every 10 minutes
@Scheduled(cron = "0 */10 * * * *")

// Every 30 minutes
@Scheduled(cron = "0 */30 * * * *")

// Every hour
@Scheduled(cron = "0 0 * * * *")

// Every day at 9:00 AM
@Scheduled(cron = "0 0 9 * * *")

// Every day at midnight
@Scheduled(cron = "0 0 0 * * *")

// Every Monday at 9:00 AM
@Scheduled(cron = "0 0 9 * * MON")
```

## Next Steps

1. Restart AbonnementService
2. Wait 2 minutes
3. Check console logs
4. Test frontend
5. You should see reminders automatically!

No need to run `TEST_REMINDER_NOW.ps1` anymore - the scheduler will do it automatically every 2 minutes.
