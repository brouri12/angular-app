# 📧 Renewal Email with Promo Code - Setup Guide

## ✅ What Was Created

### Backend Files (AbonnementService)
1. ✅ `EmailService.java` - Sends HTML emails
2. ✅ `PromoCodeService.java` - Generates and validates promo codes
3. ✅ `RenewalReminderService.java` - Scheduled task to check expiring subscriptions
4. ✅ `PromoCodeController.java` - REST API for promo codes
5. ✅ `RenewalController.java` - REST API for manual triggers
6. ✅ `pom.xml` - Added spring-boot-starter-mail dependency
7. ✅ `application.properties` - Added email configuration

---

## 🎯 How It Works

### 1. Automated Daily Check
- **Schedule**: Every day at 9 AM (configurable)
- **Action**: Checks all validated payments
- **Trigger**: Sends email if subscription expires in exactly 7 days

### 2. Email Content
- **Subject**: "⏰ Your [Plan] Subscription Expires Soon - Special Offer Inside!"
- **Content**:
  - Personalized greeting
  - Expiration warning
  - Unique promo code (15% discount)
  - Call-to-action button
  - Benefits reminder
  - Renewal instructions

### 3. Promo Codes
- **Format**: `RENEW-XXXXX` (e.g., RENEW-A7B2C)
- **Discount**: 15% off
- **Validity**: 14 days
- **Usage**: One-time per user

---

## ⚙️ Configuration Steps

### Step 1: Configure Email (Gmail)

1. **Get Gmail App Password**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to "App passwords"
   - Generate password for "Mail"
   - Copy the 16-character password

2. **Update `application.properties`**:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
```

### Step 2: Build and Run

```bash
cd AbonnementService
mvn clean install
mvn spring-boot:run
```

### Step 3: Verify Service is Running

```bash
# Check health
curl http://localhost:8084/api/renewal/health

# Expected response:
{
  "status": "healthy",
  "service": "Renewal Reminder Service",
  "message": "Service is running"
}
```

---

## 🧪 Testing

### Test 1: Generate Promo Code
```bash
curl http://localhost:8084/api/promo/generate
```

**Response**:
```json
{
  "code": "RENEW-A7B2C",
  "discount": 15.0,
  "message": "New promo code generated"
}
```

### Test 2: Validate Promo Code
```bash
curl "http://localhost:8084/api/promo/validate?code=RENEW-A7B2C"
```

**Response**:
```json
{
  "valid": true,
  "code": "RENEW-A7B2C",
  "discount": 15.0,
  "message": "Promo code is valid!"
}
```

### Test 3: Apply Promo Code
```bash
curl -X POST http://localhost:8084/api/promo/apply \
  -H "Content-Type: application/json" \
  -d '{"code":"RENEW-A7B2C","amount":90.00}'
```

**Response**:
```json
{
  "originalAmount": 90.0,
  "discountedAmount": 76.5,
  "savings": 13.5,
  "discountPercentage": 15.0,
  "code": "RENEW-A7B2C"
}
```

### Test 4: Manual Trigger (for testing)
```bash
curl -X POST http://localhost:8084/api/renewal/trigger
```

This will immediately check for expiring subscriptions and send emails.

---

## 📊 Promo Codes Available

| Code | Discount | Description |
|------|----------|-------------|
| `RENEW-XXXXX` | 15% | Auto-generated renewal codes |
| `WELCOME10` | 10% | Welcome discount for new users |
| `STUDENT20` | 20% | Student discount |
| `SUMMER50` | 50% | Summer promotion |

---

## 🎨 Email Preview

```
┌─────────────────────────────────────────┐
│   ⏰ Subscription Expiring Soon!        │
├─────────────────────────────────────────┤
│                                         │
│ Hi John Doe,                            │
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
│ ✨ What You'll Keep:                   │
│ ✅ Unlimited access to all courses     │
│ ✅ Priority support 24/7               │
│ ✅ All certificates included           │
│ ✅ No interruption in learning         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Customization

### Change Schedule
Edit `RenewalReminderService.java`:

```java
// Daily at 9 AM
@Scheduled(cron = "0 0 9 * * *")

// Every 2 minutes (for testing)
@Scheduled(fixedRate = 120000)

// Every hour
@Scheduled(cron = "0 0 * * * *")
```

### Change Discount
Edit `PromoCodeService.java`:

```java
if (code.startsWith("RENEW-")) {
    return originalAmount * 0.85; // 15% off
    // Change to 0.80 for 20% off
    // Change to 0.90 for 10% off
}
```

### Change Email Template
Edit `EmailService.java` - method `buildRenewalEmailHtml()`

---

## 📈 Monitoring

### Check Logs
```bash
# View logs
tail -f AbonnementService/logs/application.log

# Look for:
✓ Renewal reminder sent to: user@email.com
✓ Applied RENEW promo code: RENEW-A7B2C
```

### Database Queries
```sql
-- Check payments expiring in 7 days
SELECT 
    p.id_payment,
    p.email_client,
    p.type_abonnement,
    p.date_paiement,
    DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY) as expiration_date,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) as days_until_expiration
FROM payments p
JOIN abonnements a ON p.id_abonnement = a.id_abonnement
WHERE p.statut = 'Validé'
AND DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL a.duree_jours DAY), CURDATE()) = 7;
```

---

## 🚀 Frontend Integration

### Add Promo Code Input to Pricing Page

```typescript
// In pricing.ts
promoCode = signal<string>('');
discount = signal<number>(0);

async validatePromoCode() {
  const code = this.promoCode();
  const response = await fetch(`http://localhost:8084/api/promo/validate?code=${code}`);
  const data = await response.json();
  
  if (data.valid) {
    this.discount.set(data.discount);
    this.notificationService.success('Promo Code Applied!', `You saved ${data.discount}%`);
  } else {
    this.notificationService.error('Invalid Code', 'Please check your promo code');
  }
}
```

```html
<!-- In pricing.html -->
<div class="promo-code-input">
  <input 
    type="text" 
    [(ngModel)]="promoCode"
    placeholder="Enter promo code"
    class="px-4 py-2 border rounded">
  <button (click)="validatePromoCode()" class="btn-primary">
    Apply
  </button>
</div>

@if (discount() > 0) {
  <div class="discount-badge">
    🎉 {{ discount() }}% OFF Applied!
  </div>
}
```

---

## ⚠️ Important Notes

1. **Email Configuration**: Must use Gmail App Password, not regular password
2. **Scheduler**: Runs daily at 9 AM by default
3. **Duplicate Prevention**: Tracks sent emails to avoid duplicates
4. **Testing**: Use manual trigger endpoint for testing
5. **Production**: Change schedule to daily, not every 2 minutes

---

## 📞 Troubleshooting

### Problem: Emails not sending
**Solution**: Check email configuration in `application.properties`

### Problem: No reminders sent
**Solution**: Check if payments expire in exactly 7 days

### Problem: Promo code not working
**Solution**: Verify code format (must start with "RENEW-")

### Problem: Scheduler not running
**Solution**: Ensure `@EnableScheduling` is in main application class

---

## ✅ Checklist

- [ ] Configure Gmail App Password
- [ ] Update `application.properties`
- [ ] Build project (`mvn clean install`)
- [ ] Run service (`mvn spring-boot:run`)
- [ ] Test promo code generation
- [ ] Test promo code validation
- [ ] Test manual trigger
- [ ] Verify email received
- [ ] Integrate with frontend
- [ ] Test end-to-end flow

---

**Status**: ✅ Ready to use  
**Complexity**: ⭐⭐⭐  
**Impact**: 🔥🔥🔥🔥🔥 (High - Reduces churn, increases renewals)
