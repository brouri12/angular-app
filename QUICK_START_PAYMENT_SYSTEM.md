# 🚀 Quick Start - Payment System

## Current Status

All configurations have been updated with your actual credentials:
- ✅ Stripe API keys configured
- ✅ Keycloak client secret updated
- ✅ Receipt endpoint security configured
- ✅ Payment system fully implemented

---

## 1️⃣ Verify Configuration

Run this script to check everything is configured correctly:

```powershell
.\VERIFY_CONFIGURATION.ps1
```

This will check:
- Stripe keys in backend and frontend
- Keycloak secrets in all services
- Receipt endpoint security
- All services running status

---

## 2️⃣ Restart Services (If Needed)

If services are already running, you MUST restart them for changes to take effect:

### Stop All Services
1. UserService: Stop in IntelliJ (red square button)
2. Frontend: Ctrl+C in terminal
3. Back-Office: Ctrl+C in terminal

### Start All Services

**UserService:**
- In IntelliJ: Right-click `UserApplication.java` → Run

**Frontend:**
```powershell
cd frontend/angular-app
npm start
```

**Back-Office:**
```powershell
cd back-office
npm start
```

See detailed instructions: `RESTART_SERVICES_NOW.md`

---

## 3️⃣ Test the System

### Test A: Stripe Credit Card Payment

1. Go to: http://localhost:4200/pricing
2. Select any plan (Basic, Pro, or Premium)
3. Choose "Credit Card" payment method
4. Fill in Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/28` (any future date)
   - CVC: `123` (any 3 digits)
5. Click "Pay Now"
6. ✅ Should see success message and payment is validated immediately

### Test B: Bank Transfer Payment

1. Go to: http://localhost:4200/pricing
2. Select any plan
3. Choose "Bank Transfer" payment method
4. Upload a test image (JPG, PNG, or PDF)
5. Click "Submit Payment"
6. ✅ Payment created with status "En attente" (pending)

### Test C: Admin Payment Validation

1. Go to: http://localhost:4201/payments
2. Login with admin credentials
3. See list of all payments
4. Click "View Receipt" on a bank transfer payment
5. ✅ Receipt opens in new tab (no 401 error)
6. Click "Approve" or "Reject" to validate payment
7. ✅ Payment status updates

### Test D: Receipt Endpoint

Run the automated test:
```powershell
.\TEST_RECEIPT_ENDPOINT.ps1
```
✅ Should open receipt in browser without authentication error

---

## 🎯 What's Implemented

### Backend (UserService)
- `Payment` entity with all fields
- `PaymentService` for business logic
- `PaymentController` with REST endpoints
- `FileStorageService` for receipt uploads
- `StripeService` for payment processing
- Receipt storage in `uploads/receipts/`

### Frontend (Angular)
- Payment form in pricing page
- Stripe payment modal with card input
- Bank transfer with receipt upload
- Real-time payment processing

### Back-Office (Admin)
- Complete payments management page
- Pending/All payments tabs
- Receipt viewing in new tab
- Approve/Reject functionality
- Payment status tracking

### Security
- Receipt endpoint public for viewing
- Payment endpoints require authentication
- CORS handled by API Gateway only
- Keycloak integration for auth

---

## 📋 API Endpoints

All through API Gateway: `http://localhost:8888/user-service/api/payments`

- `POST /` - Create payment
- `POST /upload-receipt/{paymentId}` - Upload receipt
- `POST /validate/{paymentId}` - Validate payment (admin)
- `POST /reject/{paymentId}` - Reject payment (admin)
- `GET /user/{userId}` - Get user payments
- `GET /pending` - Get pending payments (admin)
- `GET /` - Get all payments (admin)
- `GET /receipt/{fileName}` - View receipt (public)
- `POST /create-payment-intent` - Create Stripe payment intent

---

## 🔑 Credentials

### Stripe (Test Mode)
- **Publishable**: `pk_test_51T4T13CmhqMbGh2rgELLpfm9qBwyRj8CrJTISITJkWaPLmZk1mYj7zO55JNIEpq38yWPaiMWxIVnkMOLaixK0FGB00RGj3bUrQ`
- **Secret**: `sk_test_51T4T13CmhqMbGh2ri2eV8M6dUtEkhJEDQT9YNcPmvE4x4kHstlLaxOs4UrCSRlm6UQwtWDzTiaGkRngTaPlxqC1700z6SRofIx`

### Keycloak
- **Client Secret**: `wBCcaBhZbarCcZovTzSniLtjCrYoidvl`
- **Realm**: `wordly-realm`
- **Client**: `wordly-client`

### Test Cards
- **Success**: `4242 4242 4242 4242`
- **3D Secure**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

---

## 🐛 Troubleshooting

### Receipt Shows 401 Error
→ UserService not restarted after SecurityConfig change
→ Solution: Restart UserService in IntelliJ

### Stripe Payment Fails
→ Check browser console for errors
→ Verify Stripe keys in `application.properties`
→ Check UserService logs for Stripe initialization

### Keycloak Auth Fails
→ Verify Keycloak running on port 9090
→ Check client secret matches in all files
→ Clear browser cache

### Services Not Starting
→ Check ports not already in use
→ Verify MySQL running on port 3307
→ Check Eureka running on port 8761

---

## 📚 Documentation Files

- `RESTART_SERVICES_NOW.md` - Detailed restart instructions
- `VERIFY_CONFIGURATION.ps1` - Configuration verification script
- `TEST_RECEIPT_ENDPOINT.ps1` - Receipt endpoint test
- `STRIPE_SETUP_GUIDE.md` - Stripe integration guide
- `STRIPE_IMPLEMENTATION_COMPLETE.md` - Implementation details
- `FIX_CORS_ISSUE.md` - CORS troubleshooting

---

## ✅ Success Checklist

- [ ] Run `.\VERIFY_CONFIGURATION.ps1` - All checks pass
- [ ] All services running (UserService, Gateway, Frontend, Back-Office, Keycloak)
- [ ] Stripe payment works with test card
- [ ] Bank transfer creates pending payment
- [ ] Receipt uploads successfully
- [ ] Admin can view receipts without 401 error
- [ ] Admin can approve/reject payments
- [ ] Payment status updates correctly

---

## 🎉 You're Ready!

Your complete payment system is now configured and ready to use. Test all features and enjoy!

For any issues, run `.\VERIFY_CONFIGURATION.ps1` to diagnose problems.
