# Reminder System Flow Explained

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    SCHEDULED TASKS                          │
│  - Daily at 9:00 AM                                         │
│  - Every hour on the hour                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  SubscriptionReminderService.checkExpiringSubscriptions()  │
│                                                             │
│  1. Fetch validated payments from UserService               │
│     GET http://localhost:8085/api/payments/validated        │
│                                                             │
│  2. For each payment:                                       │
│     - Get abonnement from local database                    │
│     - Get duration (duree_jours)                            │
│     - Calculate start date:                                 │
│       * carte/paypal → use date_paiement                    │
│       * virement → use date_validation                      │
│     - Calculate expiration: startDate + duration            │
│     - Calculate days until expiration                       │
│                                                             │
│  3. Create reminders based on days:                         │
│     - < 0 days: EXPIRED (RED)                               │
│     - 0 days: EXPIRING_TODAY (ORANGE)                       │
│     - 1-7 days: EXPIRING_SOON (YELLOW)                      │
│     - 8-14 days: EXPIRING_SOON (YELLOW)                     │
│     - > 14 days: No reminder                                │
│                                                             │
│  4. Store reminders in memory (HashMap)                     │
│     Map<userId, List<ReminderDTO>>                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   IN-MEMORY STORAGE                         │
│                                                             │
│  activeReminders = {                                        │
│    33: [                                                    │
│      {                                                      │
│        userId: 33,                                          │
│        userName: "System Admin",                            │
│        subscriptionType: "Premium",                         │
│        expirationDate: "2026-03-10",                        │
│        daysUntilExpiration: 5,                              │
│        reminderType: "EXPIRING_SOON",                       │
│        message: "Your subscription expires in 5 days..."    │
│      }                                                      │
│    ]                                                        │
│  }                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND REQUESTS                          │
│                                                             │
│  User logs in → Frontend calls:                             │
│  GET http://localhost:8888/abonnement-service/              │
│      api/subscription-reminders/user/33                     │
│                                                             │
│  SubscriptionReminderController.getUserReminders(33)        │
│  → Returns reminders from memory for user 33                │
└─────────────────────────────────────────────────────────────┘
```

## Your Current Situation

```
Payment Data (user_db.payments):
┌──────────────────────────────────────────────────────┐
│ id_payment: 26                                       │
│ id_user: 33                                          │
│ id_abonnement: 2                                     │
│ methode_paiement: carte                              │
│ statut: Validé                                       │
│ date_paiement: 2026-02-08 01:02:15                   │
│ date_validation: NULL                                │
└──────────────────────────────────────────────────────┘
                     │
                     ▼
Abonnement Data (abonnement_db.abonnements):
┌──────────────────────────────────────────────────────┐
│ id_abonnement: 2                                     │
│ nom: Premium                                         │
│ duree_jours: 30                                      │
└──────────────────────────────────────────────────────┘
                     │
                     ▼
Calculation:
┌──────────────────────────────────────────────────────┐
│ Start Date: 2026-02-08 (date_paiement)              │
│ Duration: 30 days                                    │
│ Expiration: 2026-03-10                               │
│ Current Date: 2026-03-05                             │
│ Days Until Expiration: 5 days                        │
│                                                      │
│ Result: EXPIRING_SOON (YELLOW)                       │
└──────────────────────────────────────────────────────┘
```

## Why You See "No Reminders"

```
Service Startup:
┌──────────────────────────────────────────────────────┐
│ AbonnementService starts                             │
│ activeReminders = {} (empty HashMap)                 │
└──────────────────────────────────────────────────────┘
                     │
                     ▼
Frontend Request (immediately after login):
┌──────────────────────────────────────────────────────┐
│ GET /api/subscription-reminders/user/33              │
│ → Returns: [] (empty array)                          │
│ → Log: "No reminders found for user: 33"             │
└──────────────────────────────────────────────────────┘

Why? Because scheduled task hasn't run yet!
```

## The Fix

```
Manual Trigger:
┌──────────────────────────────────────────────────────┐
│ POST /api/subscription-reminders/check-now           │
│                                                      │
│ This forces the scheduled task to run immediately    │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ Fetches payments → Calculates → Stores in memory     │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│ activeReminders = {                                  │
│   33: [EXPIRING_SOON reminder]                       │
│ }                                                    │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
Frontend Request (after trigger):
┌──────────────────────────────────────────────────────┐
│ GET /api/subscription-reminders/user/33              │
│ → Returns: [reminder object]                         │
│ → Log: "Found 1 subscription reminder(s) for user 33"│
└──────────────────────────────────────────────────────┘
```

## Key Points

1. **In-Memory Storage**: Reminders are NOT stored in database
   - Faster access
   - No database overhead
   - But requires scheduled task to populate

2. **Scheduled Tasks**: Run automatically
   - Daily at 9:00 AM
   - Every hour
   - Can be triggered manually via `/check-now` endpoint

3. **Payment Method Logic**:
   - `carte` or `paypal` → use `date_paiement`
   - `virement` → use `date_validation`

4. **Reminder Thresholds**:
   - Only creates reminders for subscriptions expiring within 14 days
   - Different types based on urgency

5. **Service Communication**:
   - AbonnementService calls UserService REST API
   - No direct database access between services
   - Follows microservice architecture

## Testing Flow

```
1. Restart AbonnementService
   └─> Memory is empty

2. Run: .\TEST_REMINDER_NOW.ps1
   └─> Triggers check
       └─> Fetches payments
           └─> Calculates expiration
               └─> Stores in memory

3. Check console logs
   └─> See detailed processing

4. Test frontend
   └─> Login
       └─> See bell icon with badge
           └─> Click to see reminder
```

That's the complete flow!
