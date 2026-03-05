# Stripe Integration - Next Steps

## Current Implementation Status

✅ **Completed:**
- Auto-fill email and full name from current user in purchase form
- Payment method selection (Credit Card, PayPal, Bank Transfer)
- Bank transfer receipt upload UI
- Bank transfer status set to "En attente" (Pending)
- Receipt file validation (JPG, PNG, PDF, max 5MB)

⏳ **To Be Implemented:**
- Actual Stripe API integration for credit card/PayPal payments
- Backend receipt file storage
- Admin panel for payment validation

## How to Complete Stripe Integration

### 1. Install Stripe in Frontend

```bash
cd frontend/angular-app
npm install @stripe/stripe-js
```

### 2. Get Stripe API Keys

1. Create account at https://stripe.com
2. Get your **Publishable Key** and **Secret Key** from Dashboard
3. For testing, use test mode keys (they start with `pk_test_` and `sk_test_`)

### 3. Add Stripe Keys to Environment

**frontend/angular-app/src/environments/environment.ts:**
```typescript
export const environment = {
  production: false,
  stripePublishableKey: 'pk_test_YOUR_KEY_HERE'
};
```

**UserService/src/main/resources/application.properties:**
```properties
stripe.secret.key=sk_test_YOUR_SECRET_KEY_HERE
```

### 4. Create Stripe Service (Frontend)

**frontend/angular-app/src/app/services/stripe.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    // Call your backend to create payment intent
    // Return client secret
  }

  async confirmPayment(clientSecret: string) {
    const stripe = await this.stripePromise;
    if (!stripe) throw new Error('Stripe not loaded');
    
    return await stripe.confirmCardPayment(clientSecret);
  }
}
```

### 5. Update processStripePayment() Method

Replace the TODO in `pricing.ts`:

```typescript
async processStripePayment(abonnement: Abonnement) {
  try {
    const amount = this.billingCycle() === 'monthly' 
      ? abonnement.prix 
      : abonnement.prix * 10;

    // Create payment intent on backend
    const { clientSecret } = await this.paymentService.createPaymentIntent(amount).toPromise();

    // Confirm payment with Stripe
    const result = await this.stripeService.confirmPayment(clientSecret);

    if (result.error) {
      alert('Payment failed: ' + result.error.message);
      return;
    }

    // Save payment record
    const paiement: HistoriqueAbonnement = {
      nom_client: this.purchaseForm.nom_client,
      email_client: this.purchaseForm.email_client,
      type_abonnement: abonnement.nom,
      montant: amount,
      methode_paiement: this.purchaseForm.methode_paiement,
      reference_transaction: result.paymentIntent.id,
      statut: 'Validé'
    };

    this.abonnementService.addPaiement(paiement).subscribe({
      next: () => {
        alert('Payment successful!');
        this.closePurchaseModal();
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  }
}
```

### 6. Backend Payment Entity

Create `Payment.java` entity to store payment details and receipt URLs.

### 7. Backend File Upload

Create endpoint to handle receipt file uploads:
- Store files in a secure location
- Save file URL in database
- Return file URL to frontend

### 8. Admin Payment Validation

Create admin page to:
- List all payments with status "En attente"
- View uploaded receipts
- Approve or reject payments
- Add admin notes

## Test Cards (Stripe Test Mode)

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

## Current Behavior

### Credit Card / PayPal
- Shows payment form
- Simulates successful payment (no actual Stripe call yet)
- Creates payment record with status "Validé"

### Bank Transfer
- Shows payment form
- Shows receipt upload screen
- Validates file type and size
- Creates payment record with status "En attente"
- Receipt file stored in memory (not persisted yet)

## Next Implementation Priority

1. **Backend file storage** for receipts
2. **Admin payment management page** in back-office
3. **Stripe API integration** for card payments
4. **Payment history page** for users

