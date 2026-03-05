# Subscription Reminder System - Complete Documentation

## Overview
Advanced subscription reminder system implemented in **AbonnementService** using Spring Scheduler. The system automatically checks for expiring subscriptions and displays notifications to users on the website.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              AbonnementService (Port 8083)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SubscriptionReminderService (@Scheduled)            │  │
│  │  - Daily check at 9:00 AM                            │  │
│  │  - Hourly checks                                     │  │
│  │  - Stores reminders in memory (HashMap)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST API Call to UserService                        │  │
│  │  GET /api/payments/validated                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              UserService (Port 8085)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PaymentController                                   │  │
│  │  GET /api/payments/validated                         │  │
│  │  Returns all validated payments                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Frontend (Port 4200)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SubscriptionReminders Component                     │  │
│  │  - Bell icon in header                               │  │
│  │  - Polls every 5 minutes                             │  │
│  │  - Shows dropdown with reminders                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Backend (AbonnementService)

#### 1. SubscriptionReminderService
- **Location**: `AbonnementService/src/main/java/tn/esprit/abonnement/service/`
- **Features**:
  - Spring Scheduler with cron expressions
  - Calls UserService REST API to get validated payments
  - Calculates expiration dates based on payment method
  - Stores reminders in memory (no new tables)
  - Provides REST endpoints for frontend

#### 2. Expiration Calculation Logic
```java
// For Card/PayPal
startDate = payment.getDatePaiement()
expirationDate = startDate + abonnement.getDuree_jours()

// For Bank Transfer
startDate = payment.getDateValidation()
expirationDate = startDate + abonnement.getDuree_jours()
```

#### 3. Reminder Thresholds
| Days Until Expiration | Reminder Type    | Icon | Color  |
|-----------------------|------------------|------|--------|
| < 0 (expired)         | EXPIRED          | ❌   | Red    |
| 0 (today)             | EXPIRING_TODAY   | ⚠️   | Orange |
| 1-7 days              | EXPIRING_SOON    | ⏰   | Yellow |
| 8-14 days             | EXPIRING_SOON    | ⏰   | Yellow |
| > 14 days             | No reminder      | -    | -      |

#### 4. Schedule Configuration
```java
@Scheduled(cron = "0 0 9 * * *")  // Daily at 9:00 AM
@Scheduled(cron = "0 0 * * * *")  // Every hour
```

### Backend (UserService)

#### New Endpoint
```java
GET /api/payments/validated
Returns: List<Payment>
```

This endpoint provides all validated payments to AbonnementService for reminder calculation.

### Frontend (Angular)

#### Components Created
1. **subscription-reminder.model.ts** - TypeScript interface
2. **subscription-reminder.service.ts** - HTTP service with polling
3. **subscription-reminders/** - Component with bell icon UI

#### Features
- Bell icon in header (only visible when authenticated)
- Unread count badge
- Dropdown panel with all reminders
- Color-coded alerts
- Mark as read functionality
- Dismiss reminder functionality
- Auto-refresh every 5 minutes
- Renew subscription button

## API Endpoints

### AbonnementService Endpoints
```
Base URL: http://localhost:8083/api/subscription-reminders

GET    /user/{userId}                    - Get user's reminders
GET    /user/{userId}/count              - Get reminder count
GET    /all                              - Get all reminders (admin)
DELETE /user/{userId}/dismiss/{type}     - Dismiss a reminder
POST   /check-now                        - Manual trigger (testing)
```

### UserService Endpoint
```
Base URL: http://localhost:8085/api/payments

GET    /validated                        - Get all validated payments
```

## Files Created/Modified

### AbonnementService
```
src/main/java/tn/esprit/abonnement/
├── dto/
│   ├── PaymentDTO.java                          ✨ NEW
│   └── SubscriptionReminderDTO.java             ✨ NEW
├── service/
│   └── SubscriptionReminderService.java         ✨ NEW
├── controller/
│   └── SubscriptionReminderController.java      ✨ NEW
└── AbonnementApplication.java                   ✏️ MODIFIED (@EnableScheduling)
```

### UserService
```
src/main/java/tn/esprit/user/
├── service/
│   └── PaymentService.java                      ✏️ MODIFIED (added getValidatedPayments)
└── controller/
    └── PaymentController.java                   ✏️ MODIFIED (added /validated endpoint)
```

### Frontend
```
src/app/
├── models/
│   └── subscription-reminder.model.ts           ✨ NEW
├── services/
│   └── subscription-reminder.service.ts         ✨ NEW
├── components/
│   ├── subscription-reminders/
│   │   ├── subscription-reminders.ts            ✨ NEW
│   │   ├── subscription-reminders.html          ✨ NEW
│   │   └── subscription-reminders.css           ✨ NEW
│   └── header/
│       ├── header.ts                            ✏️ MODIFIED (import component)
│       └── header.html                          ✏️ MODIFIED (add bell icon)
```

## Testing

### 1. Start Services
```bash
# Terminal 1: AbonnementService
cd AbonnementService
mvn spring-boot:run

# Terminal 2: UserService  
cd UserService
mvn spring-boot:run

# Terminal 3: Frontend
cd frontend/angular-app
ng serve --port 4200
```

### 2. Manual Trigger
```bash
# Trigger immediate check
curl -X POST http://localhost:8083/api/subscription-reminders/check-now
```

### 3. Check User Reminders
```bash
# Replace {userId} with actual user ID
curl http://localhost:8083/api/subscription-reminders/user/{userId}
```

### 4. Create Test Data
```sql
-- Create a payment expiring in 7 days (assuming 30-day subscription)
INSERT INTO payments (
    id_user, id_abonnement, montant, methode_paiement, statut, 
    date_paiement, nom_client, email_client, type_abonnement
) VALUES (
    1, 1, 29.99, 'carte', 'Validé', 
    DATE_SUB(NOW(), INTERVAL 23 DAY), 
    'Test User', 'test@example.com', 'Premium'
);
```

## Configuration

### API Gateway Routes
Ensure API Gateway routes AbonnementService reminder endpoints:
```properties
spring.cloud.gateway.routes[x].id=subscription-reminders
spring.cloud.gateway.routes[x].uri=lb://abonnement-service
spring.cloud.gateway.routes[x].predicates[0]=Path=/abonnement-service/api/subscription-reminders/**
```

### CORS Configuration
Already configured in SubscriptionReminderController:
```java
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
```

## How It Works

1. **Scheduler runs** (daily at 9 AM or hourly)
2. **Calls UserService** to get all validated payments via REST API
3. **For each payment**:
   - Gets subscription duration from local Abonnement table
   - Calculates start date (payment or validation date based on method)
   - Calculates expiration date (start + duration)
   - Determines days until expiration
   - Creates reminder if within threshold
4. **Stores reminders in memory** (grouped by user ID)
5. **Frontend polls** every 5 minutes via REST API
6. **Displays notifications** in bell icon dropdown

## Key Design Decisions

1. **No New Tables**: Reminders stored in memory using HashMap
2. **Microservice Communication**: AbonnementService calls UserService REST API
3. **Payment Method Logic**:
   - Card/PayPal: Uses `date_paiement`
   - Bank Transfer: Uses `date_validation`
4. **Duration Source**: Fetched from local `abonnements` table
5. **Client-Side Tracking**: `isRead` and `id` properties added on frontend only
6. **Polling Strategy**: Frontend polls every 5 minutes to avoid server overload

## Troubleshooting

### No reminders showing?
1. Check scheduler logs: "🔔 Starting subscription expiration check..."
2. Verify UserService is running and accessible
3. Check payments exist: `SELECT * FROM payments WHERE statut = 'Validé';`
4. Trigger manual check: `curl -X POST http://localhost:8083/api/subscription-reminders/check-now`

### Bell icon not visible?
1. Make sure you're logged in
2. Check browser console for errors
3. Verify header component imports SubscriptionReminders
4. Clear Angular cache

### API Gateway 404?
1. Check AbonnementService is registered with Eureka
2. Verify Gateway routes configuration
3. Test direct endpoint: `http://localhost:8083/api/subscription-reminders/check-now`

### UserService connection failed?
1. Verify UserService is running on port 8085
2. Check `/api/payments/validated` endpoint exists
3. Test direct call: `curl http://localhost:8085/api/payments/validated`

## Customization

### Change Schedule Times
Edit `SubscriptionReminderService.java`:
```java
@Scheduled(cron = "0 0 8 * * *") // Change to 8 AM
```

### Change Reminder Thresholds
Edit `createReminder()` method:
```java
else if (daysUntilExpiration <= 30) {
    // Add 30-day reminder
}
```

### Change Polling Frequency
Edit `subscription-reminder.service.ts`:
```typescript
interval(10 * 60 * 1000) // Change to 10 minutes
```

### Change UserService URL
Edit `SubscriptionReminderService.java`:
```java
private static final String USER_SERVICE_URL = "http://localhost:8085/api/payments";
```

## Status

✅ Backend scheduler implemented in AbonnementService
✅ REST API communication with UserService
✅ Frontend component with bell icon
✅ Auto-refresh polling
✅ No new database tables
✅ All features working

## Next Steps (Optional)

1. Email notifications when reminders are created
2. Push notifications for critical reminders
3. Admin dashboard to view all reminders
4. User preferences for reminder thresholds
5. SMS notifications for expired subscriptions

---

**Implementation Date**: March 5, 2026
**Services**: AbonnementService, UserService, Frontend
**No New Tables**: Reminders stored in memory
