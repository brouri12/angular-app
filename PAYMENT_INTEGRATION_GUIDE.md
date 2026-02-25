# Payment Integration Implementation Guide

## Overview
This guide explains the payment system implementation with Stripe integration and bank transfer receipt upload.

## Implementation Status

### ✅ Completed Features
1. ✅ Auto-fill email and full name from current user
2. ✅ Payment methods: Credit Card, PayPal, Bank Transfer
3. ✅ Bank transfer receipt upload UI with validation
4. ✅ Payment status management (En attente for bank transfers, Validé for card/PayPal)
5. ✅ Receipt file validation (JPG, PNG, PDF, max 5MB)
6. ✅ Different payment flows based on method selection

### ⏳ Pending Implementation
1. ⏳ Actual Stripe API integration (currently simulated)
2. ⏳ Backend file storage for receipts
3. ⏳ Admin validation page for bank transfers
4. ⏳ Payment history page for users

## Current Functionality

### Purchase Flow

#### For Credit Card / PayPal:
1. User clicks "Subscribe Now" on a plan
2. Modal opens with auto-filled name and email (if logged in)
3. User selects "Credit Card" or "PayPal"
4. User clicks "Purchase"
5. Payment is processed (currently simulated)
6. Payment record created with status "Validé"
7. Success message shown

#### For Bank Transfer:
1. User clicks "Subscribe Now" on a plan
2. Modal opens with auto-filled name and email (if logged in)
3. User selects "Bank Transfer"
4. User clicks "Continue"
5. Receipt upload screen appears
6. User uploads receipt (JPG, PNG, or PDF)
7. User clicks "Submit"
8. Payment record created with status "En attente"
9. Message shown: "Your payment is pending admin validation"

## Files Modified

### Frontend
- ✅ `frontend/angular-app/src/app/pages/pricing/pricing.ts` - Added payment logic
- ✅ `frontend/angular-app/src/app/pages/pricing/pricing.html` - Added receipt upload UI

### Documentation
- ✅ `STRIPE_INTEGRATION_NEXT_STEPS.md` - Complete Stripe integration guide
- ✅ `PAYMENT_INTEGRATION_GUIDE.md` - This file (updated)

## How It Works

### Auto-Fill User Data
```typescript
const user = this.currentUser();
if (user) {
  this.purchaseForm.nom_client = `${user.prenom || ''} ${user.nom || ''}`.trim();
  this.purchaseForm.email_client = user.email;
}
```

### Payment Method Routing
```typescript
submitPurchase() {
  const methode = this.purchaseForm.methode_paiement;
  
  if (methode === 'virement') {
    this.showReceiptUpload.set(true); // Show receipt upload
  } else {
    this.processStripePayment(abonnement); // Process card/PayPal
  }
}
```

### Receipt Validation
- File types: JPG, PNG, PDF only
- Max size: 5MB
- Validation happens on file selection

## Next Steps

See `STRIPE_INTEGRATION_NEXT_STEPS.md` for:
1. Installing Stripe SDK
2. Getting API keys
3. Implementing actual Stripe payment
4. Backend file storage
5. Admin validation page

## Testing

### Test the Current Implementation

1. **Start the application**
2. **Navigate to Pricing page** (http://localhost:4200/pricing)
3. **Test Credit Card payment:**
   - Click "Subscribe Now" on any plan
   - Verify name and email are auto-filled (if logged in)
   - Select "Credit Card"
   - Click "Purchase"
   - Should show success message

4. **Test Bank Transfer:**
   - Click "Subscribe Now" on any plan
   - Select "Bank Transfer"
   - Click "Continue"
   - Upload a receipt file (JPG, PNG, or PDF)
   - Click "Submit"
   - Should show pending validation message

### Expected Behavior

- ✅ User data auto-fills when logged in
- ✅ Different flows for different payment methods
- ✅ Receipt upload validates file type and size
- ✅ Bank transfers create "En attente" status
- ✅ Card/PayPal creates "Validé" status (simulated)

## Database Schema (Future)

When implementing backend storage, create:

```sql
CREATE TABLE payments (
    id_payment BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_abonnement BIGINT,
    id_user BIGINT,
    nom_client VARCHAR(255),
    email_client VARCHAR(255),
    montant DECIMAL(10,2),
    methode_paiement VARCHAR(50),
    statut VARCHAR(50),
    stripe_payment_id VARCHAR(255),
    receipt_url VARCHAR(500),
    reference_transaction VARCHAR(255),
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP,
    validated_by BIGINT,
    notes TEXT,
    FOREIGN KEY (id_abonnement) REFERENCES abonnements(id_abonnement),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);
```

## Admin Features (To Be Implemented)

Admin should be able to:
1. View all payments with status "En attente"
2. Click to view uploaded receipt
3. Approve payment (change status to "Validé")
4. Reject payment (change status to "Rejeté")
5. Add notes explaining decision
6. Send email notification to user


