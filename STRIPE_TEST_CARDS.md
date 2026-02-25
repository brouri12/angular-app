# 💳 Stripe Test Cards

## Basic Test Cards

### ✅ Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/28)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```
Use this card for testing successful payments.

### ✅ Successful Payment (Visa Debit)
```
Card Number: 4000 0566 5566 5556
Expiry: Any future date
CVC: Any 3 digits
```

### ✅ Successful Payment (Mastercard)
```
Card Number: 5555 5555 5555 4444
Expiry: Any future date
CVC: Any 3 digits
```

---

## 3D Secure Authentication

### 🔐 Requires Authentication (Success)
```
Card Number: 4000 0025 0000 3155
Expiry: Any future date
CVC: Any 3 digits
```
This card requires 3D Secure authentication. Complete the authentication to succeed.

### 🔐 Requires Authentication (Failure)
```
Card Number: 4000 0000 0000 9995
Expiry: Any future date
CVC: Any 3 digits
```
This card requires authentication, but the authentication will fail.

---

## Declined Cards

### ❌ Generic Decline
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```
The card will be declined with a generic decline code.

### ❌ Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry: Any future date
CVC: Any 3 digits
```
The card will be declined due to insufficient funds.

### ❌ Lost Card
```
Card Number: 4000 0000 0000 9987
Expiry: Any future date
CVC: Any 3 digits
```
The card will be declined as lost.

### ❌ Stolen Card
```
Card Number: 4000 0000 0000 9979
Expiry: Any future date
CVC: Any 3 digits
```
The card will be declined as stolen.

### ❌ Expired Card
```
Card Number: 4000 0000 0000 0069
Expiry: Any date in the past
CVC: Any 3 digits
```
The card will be declined as expired.

### ❌ Incorrect CVC
```
Card Number: 4000 0000 0000 0127
Expiry: Any future date
CVC: Any 3 digits
```
The card will be declined due to incorrect CVC.

### ❌ Processing Error
```
Card Number: 4000 0000 0000 0119
Expiry: Any future date
CVC: Any 3 digits
```
The card will be declined with a processing error.

---

## International Cards

### 🌍 Brazil (Successful)
```
Card Number: 4000 0007 6000 0002
Expiry: Any future date
CVC: Any 3 digits
```

### 🌍 Mexico (Successful)
```
Card Number: 4000 0048 4000 0008
Expiry: Any future date
CVC: Any 3 digits
```

### 🌍 India (Successful)
```
Card Number: 4000 0035 6000 0008
Expiry: Any future date
CVC: Any 3 digits
```

---

## Special Test Cases

### 🔄 Charge Succeeds, Dispute Later
```
Card Number: 4000 0000 0000 0259
Expiry: Any future date
CVC: Any 3 digits
```
Payment succeeds, but can be disputed later for testing.

### 🔄 Charge Succeeds, Refund Fails
```
Card Number: 4000 0000 0000 3220
Expiry: Any future date
CVC: Any 3 digits
```
Payment succeeds, but refunds will fail.

### ⚡ Instant Charge
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```
Fastest processing for testing.

---

## How to Use in Your App

1. Go to: http://localhost:4200/pricing
2. Select any plan (Basic, Pro, or Premium)
3. Click "Subscribe Now"
4. Choose "Credit Card" payment method
5. Enter one of the test cards above
6. Fill in:
   - **Expiry**: Any future date (e.g., 12/28)
   - **CVC**: Any 3 digits (e.g., 123)
7. Click "Pay Now"

---

## Testing Different Scenarios

### Test Successful Payment
Use: `4242 4242 4242 4242`
Expected: Payment processes successfully, status "Validé"

### Test 3D Secure
Use: `4000 0025 0000 3155`
Expected: Shows authentication modal, complete to succeed

### Test Declined Payment
Use: `4000 0000 0000 0002`
Expected: Shows error message "Card declined"

### Test Insufficient Funds
Use: `4000 0000 0000 9995`
Expected: Shows error "Insufficient funds"

---

## Important Notes

1. **Test Mode Only**: These cards only work in test mode with your test API keys
2. **Any Future Date**: For expiry, use any date in the future (e.g., 12/28, 01/30)
3. **Any CVC**: Use any 3-digit number (e.g., 123, 456, 789)
4. **Any ZIP**: Use any 5-digit ZIP code (e.g., 12345)
5. **Real Cards**: Never use real card numbers in test mode

---

## Quick Reference

**Most Used Cards:**
- ✅ Success: `4242 4242 4242 4242`
- 🔐 3D Secure: `4000 0025 0000 3155`
- ❌ Declined: `4000 0000 0000 0002`
- ❌ Insufficient Funds: `4000 0000 0000 9995`

---

## More Test Cards

For a complete list of Stripe test cards, visit:
https://stripe.com/docs/testing

Or check your Stripe Dashboard:
https://dashboard.stripe.com/test/payments

---

## Your Stripe Test Account

Your test API keys are configured:
- **Publishable Key**: `pk_test_51T4T13CmhqMbGh2r...`
- **Secret Key**: `sk_test_51T4T13CmhqMbGh2r...`

View your test payments at:
https://dashboard.stripe.com/test/payments

---

## Troubleshooting

### Card Not Working?
1. Make sure you're using test mode keys
2. Check that services are restarted
3. Verify expiry date is in the future
4. Check browser console for errors

### Payment Not Showing in Dashboard?
1. Make sure you're viewing TEST mode in Stripe Dashboard
2. Check that the payment was successful
3. Verify API keys are correct

### 3D Secure Not Showing?
1. Use card: `4000 0025 0000 3155`
2. Make sure Stripe.js is loaded
3. Check browser console for errors

---

## Testing Workflow

1. **Test Success**: Use `4242 4242 4242 4242` → Should work
2. **Test Decline**: Use `4000 0000 0000 0002` → Should show error
3. **Test 3D Secure**: Use `4000 0025 0000 3155` → Should show auth modal
4. **Check Dashboard**: Go to Stripe Dashboard → See test payments
5. **Check Database**: Payments should be saved in your database

---

## 🎉 Happy Testing!

Use these cards to test all payment scenarios in your application.
