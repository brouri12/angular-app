# Test Dates for Subscription Reminders

## Current Date: 2026-03-05

## Reminder Types and Test Dates

### 1. EXPIRED (Already Expired)
**Date to set:** Any date BEFORE today (2026-03-05)
- Example: `2026-02-08` (already expired - will show RED alert)
- Example: `2026-03-01` (4 days ago)

### 2. EXPIRING_TODAY (Expires Today)
**Date to set:** Exactly today
- Set: `2026-03-05` (will show ORANGE alert)

### 3. EXPIRING_SOON (1-7 days)
**Dates to set:** Between tomorrow and 7 days from now
- `2026-03-06` (tomorrow - 1 day)
- `2026-03-08` (3 days)
- `2026-03-12` (7 days - will show YELLOW alert)

### 4. EXPIRING_SOON (8-14 days)
**Dates to set:** Between 8 and 14 days from now
- `2026-03-13` (8 days)
- `2026-03-19` (14 days - will show YELLOW alert)

### 5. NO REMINDER (More than 14 days)
**Date to set:** More than 14 days from now
- `2026-03-20` (15 days - NO reminder)
- `2026-04-05` (31 days - NO reminder)

## How to Calculate Expiration Date

The system calculates expiration as:
```
Expiration Date = Payment Date + Duration (duree_jours)
```

### Example for User 33:
- **Payment Date (date_paiement):** 2026-02-08
- **Duration (duree_jours):** Let's say 30 days
- **Expiration Date:** 2026-02-08 + 30 days = 2026-03-10

## SQL Commands to Update Test Data

### Option 1: Update Payment Date (Recommended)
```sql
-- For EXPIRED reminder (already expired)
UPDATE payments 
SET date_paiement = '2026-02-08' 
WHERE id_user = 33;

-- For EXPIRING_TODAY reminder
UPDATE payments 
SET date_paiement = DATE_SUB(CURDATE(), INTERVAL 30 DAY)
WHERE id_user = 33;
-- If duration is 30 days, this will expire today

-- For EXPIRING_SOON (7 days) reminder
UPDATE payments 
SET date_paiement = DATE_SUB(CURDATE(), INTERVAL 23 DAY)
WHERE id_user = 33;
-- If duration is 30 days, this will expire in 7 days

-- For EXPIRING_SOON (3 days) reminder
UPDATE payments 
SET date_paiement = DATE_SUB(CURDATE(), INTERVAL 27 DAY)
WHERE id_user = 33;
-- If duration is 30 days, this will expire in 3 days
```

### Option 2: Update Duration
```sql
-- Check current payment date
SELECT id_user, date_paiement, DATEDIFF(CURDATE(), date_paiement) as days_since_payment
FROM payments 
WHERE id_user = 33;

-- If payment was on 2026-02-08, that's 25 days ago
-- To expire in 7 days, set duration to 32 days (25 + 7)
UPDATE abonnements 
SET duree_jours = 32 
WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33);
```

## Quick Test Script

Create different test scenarios:

```sql
-- Scenario 1: EXPIRED (User 33)
UPDATE payments SET date_paiement = '2026-02-01' WHERE id_user = 33;
UPDATE abonnements SET duree_jours = 30 WHERE id_abonnement = 
  (SELECT id_abonnement FROM payments WHERE id_user = 33);
-- Expires: 2026-03-03 (2 days ago) - RED

-- Scenario 2: EXPIRING_TODAY (User 34)
UPDATE payments SET date_paiement = '2026-02-03' WHERE id_user = 34;
UPDATE abonnements SET duree_jours = 30 WHERE id_abonnement = 
  (SELECT id_abonnement FROM payments WHERE id_user = 34);
-- Expires: 2026-03-05 (today) - ORANGE

-- Scenario 3: EXPIRING_SOON 7 days (User 35)
UPDATE payments SET date_paiement = '2026-02-05' WHERE id_user = 35;
UPDATE abonnements SET duree_jours = 37 WHERE id_abonnement = 
  (SELECT id_abonnement FROM payments WHERE id_user = 35);
-- Expires: 2026-03-12 (7 days) - YELLOW

-- Scenario 4: NO REMINDER (User 36)
UPDATE payments SET date_paiement = '2026-02-20' WHERE id_user = 36;
UPDATE abonnements SET duree_jours = 30 WHERE id_abonnement = 
  (SELECT id_abonnement FROM payments WHERE id_user = 36);
-- Expires: 2026-03-22 (17 days) - NO REMINDER
```

## Recommended Test for User 33

Since user 33 already has payment date `2026-02-08`:

```sql
-- Option A: Make it expire in 3 days (YELLOW alert)
UPDATE abonnements 
SET duree_jours = 28 
WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
-- Expiration: 2026-02-08 + 28 = 2026-03-08 (3 days from now)

-- Option B: Make it expire today (ORANGE alert)
UPDATE abonnements 
SET duree_jours = 25 
WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
-- Expiration: 2026-02-08 + 25 = 2026-03-05 (today)

-- Option C: Make it already expired (RED alert)
UPDATE abonnements 
SET duree_jours = 20 
WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
-- Expiration: 2026-02-08 + 20 = 2026-02-28 (5 days ago)
```

## After Updating

1. Restart AbonnementService (or wait for next scheduled check)
2. Or trigger manual check: `POST http://localhost:8888/abonnement-service/api/subscription-reminders/check-now`
3. Login to frontend and check bell icon
4. Check console logs for reminder messages
