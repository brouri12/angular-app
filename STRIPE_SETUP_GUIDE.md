# Stripe Integration Setup Guide

## ✅ What's Been Implemented

The Stripe payment form is now fully integrated! Here's what was added:

### Backend
- ✅ Stripe Java SDK added to pom.xml
- ✅ StripeService created for payment intent creation
- ✅ Payment intent endpoint added to PaymentController
- ✅ SecurityConfig updated to allow payment intent creation

### Frontend
- ✅ @stripe/stripe-js installed
- ✅ StripeService created for Stripe integration
- ✅ Stripe payment form modal added to pricing page
- ✅ Card element with Stripe styling
- ✅ Payment processing with loading state
- ✅ Error handling and success messages

## 🔑 Get Your Stripe API Keys

### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Click "Sign up" (top right)
3. Fill in your email and create password
4. Verify your email

### Step 2: Get Test API Keys
1. Login to Stripe Dashboard
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 3: Add Keys to Your Project

#### Backend (UserService)
**File:** `UserService/src/main/resources/application.properties`

Replace these lines:
```properties
stripe.secret.key=sk_test_51QcVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
stripe.publishable.key=pk_test_51QcVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

With your actual keys:
```properties
stripe.secret.key=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
stripe.publishable.key=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
```

#### Frontend (Angular)
**File:** `frontend/angular-app/src/app/services/stripe.service.ts`

Replace this line (around line 13):
```typescript
private publishableKey = 'pk_test_51QcVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
```

With your actual publishable key:
```typescript
private publishableKey = 'pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE';
```

## 🧪 Test the Integration

### Step 1: Restart Services
1. **Backend:** Restart UserService in IntelliJ
2. **Frontend:** Restart Angular (Ctrl+C, then `ng serve`)

### Step 2: Test Payment
1. Go to http://localhost:4200/pricing
2. Login as any user
3. Click "Subscribe Now" on any plan
4. Select "Credit Card"
5. Click "Purchase"
6. You'll see the Stripe payment form!

### Step 3: Use Test Card
Use these test card details:
- **Card Number:** 4242 4242 4242 4242
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Step 4: Complete Payment
1. Fill in the card details
2. Click "Pay $XX"
3. Wait for processing (you'll see a spinner)
4. Success! Payment is recorded in database

## 🎯 Test Cards

Stripe provides various test cards for different scenarios:

### Success
- **4242 4242 4242 4242** - Always succeeds

### Requires Authentication (3D Secure)
- **4000 0025 0000 3155** - Requires authentication

### Declined
- **4000 0000 0000 0002** - Always declined
- **4000 0000 0000 9995** - Insufficient funds

### Specific Errors
- **4000 0000 0000 9987** - Lost card
- **4000 0000 0000 9979** - Stolen card

## 🔍 Verify Payment

### Check Database
```sql
SELECT * FROM payments 
WHERE methode_paiement = 'carte' 
ORDER BY date_paiement DESC 
LIMIT 5;
```

You should see:
- `stripe_payment_id` - Starts with `pi_`
- `statut` - "Validé"
- `montant` - Correct amount

### Check Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. You'll see your test payment!
3. Click on it to see details

## 🎨 Payment Flow

```
User clicks "Subscribe Now"
  ↓
Modal opens (auto-filled)
  ↓
Select "Credit Card"
  ↓
Click "Purchase"
  ↓
Stripe form appears
  ↓
Enter card details
  ↓
Click "Pay $XX"
  ↓
Frontend creates payment intent (backend)
  ↓
Stripe confirms payment
  ↓
Payment record saved to database
  ↓
Success message shown
```

## 🔐 Security Features

✅ **PCI Compliance** - Card details never touch your server  
✅ **Tokenization** - Stripe handles sensitive data  
✅ **3D Secure** - Supports authentication when required  
✅ **Fraud Detection** - Stripe's built-in fraud prevention  
✅ **Encrypted** - All communication is encrypted  

## 💰 Currency Support

Currently set to USD. To change:

**Backend:** `StripeService.java`
```java
public Map<String, String> createPaymentIntent(BigDecimal amount, String currency)
```

**Frontend:** `stripe.service.ts`
```typescript
createPaymentIntent(amount: number, currency: string = 'eur')
```

Supported currencies: USD, EUR, GBP, CAD, AUD, and 135+ more!

## 🚀 Going Live (Production)

When ready for production:

### 1. Activate Your Stripe Account
- Complete business verification
- Add bank account details
- Verify your identity

### 2. Switch to Live Keys
- Toggle to **LIVE MODE** in Stripe Dashboard
- Get live API keys (start with `pk_live_` and `sk_live_`)
- Replace test keys with live keys

### 3. Update Configuration
```properties
# Production keys
stripe.secret.key=sk_live_YOUR_LIVE_SECRET_KEY
stripe.publishable.key=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

### 4. Test with Real Card
- Use your own card for testing
- Small amount (like $1)
- Verify it works end-to-end

## 📊 Monitoring

### Stripe Dashboard
- View all payments
- See success/failure rates
- Monitor disputes
- Export data

### Your Database
- All payments stored locally
- Stripe payment ID for reference
- Easy reconciliation

## 🐛 Troubleshooting

### Issue: "Failed to load Stripe"
**Solution:** Check publishable key is correct in `stripe.service.ts`

### Issue: "Payment intent creation failed"
**Solution:** Check secret key in `application.properties` and restart backend

### Issue: "Card declined"
**Solution:** Use test card 4242 4242 4242 4242 in test mode

### Issue: "Authentication required"
**Solution:** This is normal for some test cards. Follow the 3D Secure flow.

## 📚 Resources

- **Stripe Docs:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing
- **API Reference:** https://stripe.com/docs/api
- **Dashboard:** https://dashboard.stripe.com

## ✅ Checklist

- [ ] Stripe account created
- [ ] Test API keys obtained
- [ ] Keys added to backend (application.properties)
- [ ] Keys added to frontend (stripe.service.ts)
- [ ] Backend restarted
- [ ] Frontend restarted
- [ ] Test payment successful with 4242 4242 4242 4242
- [ ] Payment visible in database
- [ ] Payment visible in Stripe Dashboard

## 🎉 You're Done!

Your Stripe integration is complete! Users can now make real credit card payments.

**Next steps:**
- Test with different cards
- Customize payment form styling
- Add webhook handling for payment events
- Set up email receipts

