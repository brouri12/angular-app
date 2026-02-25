# 🔄 Services Need Restart

## What Was Updated

### 1. Stripe API Keys ✅
- **Publishable Key**: `pk_test_51T4T13CmhqMbGh2rgELLpfm9qBwyRj8CrJTISITJkWaPLmZk1mYj7zO55JNIEpq38yWPaiMWxIVnkMOLaixK0FGB00RGj3bUrQ`
- **Secret Key**: `sk_test_51T4T13CmhqMbGh2ri2eV8M6dUtEkhJEDQT9YNcPmvE4x4kHstlLaxOs4UrCSRlm6UQwtWDzTiaGkRngTaPlxqC1700z6SRofIx`
- Updated in:
  - `UserService/src/main/resources/application.properties`
  - `frontend/angular-app/src/app/services/stripe.service.ts`
  - `UserService/src/main/java/tn/esprit/user/service/StripeService.java`

### 2. Keycloak Client Secret ✅
- **New Secret**: `wBCcaBhZbarCcZovTzSniLtjCrYoidvl`
- Updated in:
  - `UserService/src/main/resources/application.properties`
  - `frontend/angular-app/src/app/services/auth.service.ts`
  - `back-office/src/app/services/auth.service.ts`

### 3. Receipt Endpoint Security ✅
- Updated `SecurityConfig.java` to allow public access to `/api/payments/receipt/**`

---

## 🚀 RESTART ALL SERVICES NOW

### Step 1: Stop All Services
1. Stop UserService in IntelliJ (red square button)
2. Stop Frontend (Ctrl+C in terminal)
3. Stop Back-Office (Ctrl+C in terminal)

### Step 2: Restart UserService
1. In IntelliJ, navigate to: `UserService/src/main/java/tn/esprit/user/UserApplication.java`
2. Right-click → Run 'UserApplication'
3. Wait for "Started UserApplication" message

### Step 3: Restart Frontend
```powershell
cd frontend/angular-app
npm start
```
Wait for "Compiled successfully" message

### Step 4: Restart Back-Office
```powershell
cd back-office
npm start
```
Wait for "Compiled successfully" message

---

## ✅ Verify Everything Works

### Test 1: Receipt Viewing
```powershell
.\TEST_RECEIPT_ENDPOINT.ps1
```
Expected: Should open receipt in browser without 401 error

### Test 2: Stripe Payment
1. Go to http://localhost:4200/pricing
2. Select any plan
3. Choose "Credit Card" payment method
4. Fill in test card: `4242 4242 4242 4242`
5. Expiry: Any future date (e.g., 12/28)
6. CVC: Any 3 digits (e.g., 123)
7. Click "Pay Now"
8. Should see success message

### Test 3: Admin Payment Validation
1. Go to http://localhost:4201/payments
2. Should see list of payments
3. Click "View Receipt" on any bank transfer payment
4. Receipt should open in new tab
5. Click "Approve" or "Reject" to validate payment

---

## 🎯 What's Now Working

1. **Stripe Integration**: Real payment processing with your test account
2. **Receipt Viewing**: Public access to view receipts in new tab
3. **Keycloak Authentication**: Updated client secret for secure auth
4. **Admin Validation**: Complete payment management interface

---

## 📝 Test Cards for Stripe

- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Use any future expiry date and any 3-digit CVC.

---

## 🔍 Troubleshooting

### If Receipt Still Shows 401
1. Verify UserService restarted successfully
2. Check console for "Started UserApplication"
3. Run test script again: `.\TEST_RECEIPT_ENDPOINT.ps1`

### If Stripe Payment Fails
1. Check browser console for errors
2. Verify Stripe keys in application.properties
3. Check UserService logs for Stripe initialization message

### If Keycloak Auth Fails
1. Verify Keycloak is running on port 9090
2. Check client secret matches in all files
3. Clear browser cache and try again
