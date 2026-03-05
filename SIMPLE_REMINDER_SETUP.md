# Simple Reminder Setup Guide

## How the System Works

### For CARD or PAYPAL payments:
```
Expiration Date = date_paiement + duree_jours
```
- ✅ Uses: `date_paiement`
- ❌ Ignores: `date_validation` (can be NULL)

### For VIREMENT (bank transfer):
```
Expiration Date = date_validation + duree_jours
```
- ❌ Ignores: `date_paiement`
- ✅ Uses: `date_validation`

## Quick Setup for User 33

### Step 1: Run This SQL
```sql
USE user_db;

-- For CARD payment (recommended for testing)
UPDATE payments 
SET 
    statut = 'Validé',
    date_paiement = '2026-03-02 10:00:00',
    methode_paiement = 'carte'
WHERE id_user = 33;

UPDATE abonnements 
SET duree_jours = 6
WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
```

**Result:** Expires 2026-03-08 (3 days from now) → YELLOW reminder

### Step 2: Trigger Check
```bash
curl -X POST http://localhost:8888/abonnement-service/api/subscription-reminders/check-now
```

### Step 3: Refresh Browser
Open console (F12) and you should see:
```
✓ Found 1 subscription reminder(s) for user 33
📬 Displaying 1 reminder(s) for user 33
```

## Different Test Scenarios

### EXPIRED (RED Alert)
```sql
UPDATE payments SET date_paiement = '2026-02-20 10:00:00' WHERE id_user = 33;
UPDATE abonnements SET duree_jours = 10 WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
-- Expires: 2026-03-02 (3 days ago)
```

### EXPIRING TODAY (ORANGE Alert)
```sql
UPDATE payments SET date_paiement = '2026-02-28 10:00:00' WHERE id_user = 33;
UPDATE abonnements SET duree_jours = 5 WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
-- Expires: 2026-03-05 (today)
```

### EXPIRING IN 7 DAYS (YELLOW Alert)
```sql
UPDATE payments SET date_paiement = '2026-02-28 10:00:00' WHERE id_user = 33;
UPDATE abonnements SET duree_jours = 12 WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
-- Expires: 2026-03-12 (7 days)
```

### NO REMINDER (More than 14 days)
```sql
UPDATE payments SET date_paiement = '2026-02-20 10:00:00' WHERE id_user = 33;
UPDATE abonnements SET duree_jours = 30 WHERE id_abonnement = (SELECT id_abonnement FROM payments WHERE id_user = 33 LIMIT 1);
-- Expires: 2026-03-22 (17 days)
```

## Important Notes

1. **statut MUST be "Validé"** (with accent é)
2. **For card/PayPal:** Only `date_paiement` matters
3. **For virement:** Only `date_validation` matters
4. **date_validation can be NULL** for card payments

## Troubleshooting

### No reminders showing?
Check:
1. Is `statut = 'Validé'`? (not "Valide", not "Active")
2. Is `date_paiement` set correctly?
3. Is `duree_jours` set correctly?
4. Did you trigger the check?

### Check backend logs:
```
✅ Subscription check complete. Found X reminders
```

If it says "Found 0 reminders", run this SQL to debug:
```sql
SELECT * FROM payments WHERE id_user = 33 AND statut = 'Validé';
```
