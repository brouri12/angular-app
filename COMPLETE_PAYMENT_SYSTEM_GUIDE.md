# Complete Payment System - Implementation Guide

## ✅ What Has Been Implemented

### Backend (UserService)

#### 1. Payment Entity
- **File:** `UserService/src/main/java/tn/esprit/user/entity/Payment.java`
- Stores all payment information
- Includes receipt URL for bank transfers
- Tracks validation status and admin notes

#### 2. Payment Repository
- **File:** `UserService/src/main/java/tn/esprit/user/repository/PaymentRepository.java`
- Query methods for filtering payments by status, user, method

#### 3. Payment Service
- **File:** `UserService/src/main/java/tn/esprit/user/service/PaymentService.java`
- Business logic for creating, validating, rejecting payments
- Handles receipt URL updates

#### 4. File Storage Service
- **File:** `UserService/src/main/java/tn/esprit/user/service/FileStorageService.java`
- Stores uploaded receipt files
- Generates unique filenames
- Loads files for viewing/download
- Configurable upload directory

#### 5. Payment Controller
- **File:** `UserService/src/main/java/tn/esprit/user/controller/PaymentController.java`
- REST API endpoints:
  - `POST /api/payments` - Create payment
  - `POST /api/payments/{id}/upload-receipt` - Upload receipt
  - `GET /api/payments` - Get all payments
  - `GET /api/payments/pending` - Get pending payments
  - `GET /api/payments/user/{userId}` - Get user's payments
  - `PUT /api/payments/{id}/validate` - Validate payment (admin)
  - `PUT /api/payments/{id}/reject` - Reject payment (admin)
  - `GET /api/payments/receipt/{fileName}` - View/download receipt

#### 6. DTOs
- **PaymentRequest.java** - For creating payments
- **ValidationRequest.java** - For admin validation/rejection

#### 7. Configuration
- **application.properties** - File upload settings (max 5MB)

### Frontend (Angular App)

#### 1. Payment Service
- **File:** `frontend/angular-app/src/app/services/payment.service.ts`
- Methods for creating payments and uploading receipts
- Integration with AuthService for authentication

#### 2. Updated Pricing Component
- **File:** `frontend/angular-app/src/app/pages/pricing/pricing.ts`
- Uses new Payment API instead of HistoriqueAbonnement
- Uploads receipt files to server
- Proper error handling

### Back-Office (Admin Panel)

#### 1. Payment Service
- **File:** `back-office/src/app/services/payment.service.ts`
- Admin-specific methods for validation/rejection
- Receipt viewing

#### 2. Payments Management Page
- **File:** `back-office/src/app/pages/payments/payments.ts`
- List pending and all payments
- View payment details
- View receipts
- Approve/reject payments with notes
- Beautiful UI with tabs and modals

#### 3. Routes & Navigation
- Added `/payments` route
- Added "Payments" menu item in sidebar

### Database

#### 1. SQL Script
- **File:** `CREATE_PAYMENTS_TABLE.sql`
- Creates `payments` table with all necessary fields
- Includes indexes for performance
- Foreign key to users table

## 🚀 How to Deploy

### Step 1: Create Database Table

```bash
# Open MySQL (XAMPP)
# Run the SQL script
mysql -u root -p user_db < CREATE_PAYMENTS_TABLE.sql
```

Or manually in phpMyAdmin:
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Select `user_db` database
3. Go to SQL tab
4. Copy and paste content from `CREATE_PAYMENTS_TABLE.sql`
5. Click "Go"

### Step 2: Create Upload Directory

The application will create it automatically, but you can create it manually:

```bash
# In UserService directory
mkdir -p uploads/receipts
```

### Step 3: Restart Backend

```bash
# Stop UserService if running
# Run UserService/src/main/java/tn/esprit/user/UserApplication.java in IntelliJ
```

### Step 4: Restart Frontend

```bash
cd frontend/angular-app
# Stop if running (Ctrl+C)
ng serve
```

### Step 5: Restart Back-Office

```bash
cd back-office
# Stop if running (Ctrl+C)
ng serve --port 4201
```

## 🧪 How to Test

### Test 1: Credit Card Payment (Frontend)

1. Go to http://localhost:4200/pricing
2. Login as any user
3. Click "Subscribe Now" on any plan
4. Verify name and email are auto-filled
5. Select "Credit Card"
6. Click "Purchase"
7. ✅ Should show success message
8. ✅ Check database: `SELECT * FROM payments WHERE methode_paiement='carte'`
9. ✅ Status should be "Validé"

### Test 2: Bank Transfer with Receipt (Frontend)

1. Go to http://localhost:4200/pricing
2. Login as any user
3. Click "Subscribe Now" on any plan
4. Select "Bank Transfer"
5. Click "Continue"
6. Upload a test image (JPG/PNG) or PDF
7. Click "Submit"
8. ✅ Should show "pending admin validation" message
9. ✅ Check database: `SELECT * FROM payments WHERE methode_paiement='virement'`
10. ✅ Status should be "En attente"
11. ✅ `receipt_url` should have a filename
12. ✅ Check file exists: `uploads/receipts/{filename}`

### Test 3: Admin Validation (Back-Office)

1. Go to http://localhost:4201
2. Login as admin
3. Click "Payments" in sidebar
4. ✅ Should see pending payments list
5. Click "Review" on a pending payment
6. ✅ Should see payment details modal
7. Click "View Receipt"
8. ✅ Should open receipt in new tab
9. Add notes (optional)
10. Click "Approve"
11. ✅ Should show success message
12. ✅ Payment should disappear from pending list
13. ✅ Check database: Status should be "Validé", `date_validation` should be set

### Test 4: Admin Rejection (Back-Office)

1. Go to http://localhost:4201/payments
2. Click "Review" on a pending payment
3. Add rejection reason in notes (required)
4. Click "Reject"
5. ✅ Should show rejection message
6. ✅ Check database: Status should be "Rejeté"

### Test 5: View All Payments (Back-Office)

1. Go to http://localhost:4201/payments
2. Click "All Payments" tab
3. ✅ Should see all payments (Validé, En attente, Rejeté)
4. ✅ Status badges should have different colors

## 📁 File Structure

```
UserService/
├── src/main/java/tn/esprit/user/
│   ├── entity/
│   │   └── Payment.java                    ✅ NEW
│   ├── repository/
│   │   └── PaymentRepository.java          ✅ NEW
│   ├── service/
│   │   ├── PaymentService.java             ✅ NEW
│   │   └── FileStorageService.java         ✅ NEW
│   ├── controller/
│   │   └── PaymentController.java          ✅ NEW
│   └── dto/
│       ├── PaymentRequest.java             ✅ NEW
│       └── ValidationRequest.java          ✅ NEW
├── src/main/resources/
│   └── application.properties              ✅ UPDATED
└── uploads/receipts/                       ✅ NEW (auto-created)

frontend/angular-app/
└── src/app/
    ├── services/
    │   └── payment.service.ts              ✅ NEW
    └── pages/pricing/
        └── pricing.ts                      ✅ UPDATED

back-office/
└── src/app/
    ├── services/
    │   └── payment.service.ts              ✅ NEW
    ├── pages/payments/
    │   ├── payments.ts                     ✅ NEW
    │   ├── payments.html                   ✅ NEW
    │   └── payments.css                    ✅ NEW
    ├── components/sidebar/
    │   └── sidebar.ts                      ✅ UPDATED
    └── app.routes.ts                       ✅ UPDATED

Root/
└── CREATE_PAYMENTS_TABLE.sql               ✅ NEW
```

## 🔧 Configuration

### File Upload Settings (application.properties)

```properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
file.upload-dir=uploads/receipts
```

### Accepted File Types
- JPG/JPEG
- PNG
- PDF

### Maximum File Size
- 5MB per file

## 🎨 Features

### User Features (Frontend)
- ✅ Auto-fill name and email from profile
- ✅ Select payment method
- ✅ Instant payment for card/PayPal (simulated)
- ✅ Upload receipt for bank transfer
- ✅ File validation (type and size)
- ✅ Clear status messages

### Admin Features (Back-Office)
- ✅ View pending payments
- ✅ View all payments
- ✅ Filter by status (tabs)
- ✅ View payment details
- ✅ View/download receipts
- ✅ Approve payments
- ✅ Reject payments with notes
- ✅ Track validation date and admin
- ✅ Beautiful UI with color-coded status badges

## 🔐 Security

- ✅ File upload validation (type and size)
- ✅ Unique filename generation (UUID)
- ✅ Path traversal protection
- ✅ Authentication required for all endpoints
- ✅ Admin-only endpoints for validation

## 📊 Database Schema

```sql
payments (
    id_payment BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT,
    id_abonnement BIGINT,
    nom_client VARCHAR(255),
    email_client VARCHAR(255),
    type_abonnement VARCHAR(100),
    montant DECIMAL(10,2),
    methode_paiement VARCHAR(50),      -- carte, paypal, virement
    statut VARCHAR(50),                -- Validé, En attente, Rejeté
    reference_transaction VARCHAR(255),
    stripe_payment_id VARCHAR(255),
    receipt_url VARCHAR(500),
    date_paiement TIMESTAMP,
    date_validation TIMESTAMP,
    validated_by BIGINT,
    notes TEXT
)
```

## 🚧 Future Enhancements

### Priority 1: Stripe Integration
- Install Stripe SDK
- Get API keys
- Replace simulated payment with real Stripe calls
- Handle payment intents
- Handle webhooks

### Priority 2: Email Notifications
- Send email when payment is validated
- Send email when payment is rejected
- Include payment details and notes

### Priority 3: User Payment History
- Create payment history page for users
- Show all their payments
- Download receipts
- View status

### Priority 4: Analytics
- Payment statistics dashboard
- Revenue charts
- Payment method breakdown
- Pending payments count

## 🐛 Troubleshooting

### Issue: File upload fails
**Solution:** Check that `uploads/receipts` directory exists and has write permissions

### Issue: Receipt not showing
**Solution:** Check that `receipt_url` in database matches actual filename in `uploads/receipts`

### Issue: Admin can't validate
**Solution:** Ensure user is logged in as ADMIN role

### Issue: Payment not created
**Solution:** Check backend logs for errors, verify database connection

## 📝 API Endpoints

### Public Endpoints
- `POST /api/payments` - Create payment
- `POST /api/payments/{id}/upload-receipt` - Upload receipt

### User Endpoints
- `GET /api/payments/user/{userId}` - Get user's payments

### Admin Endpoints
- `GET /api/payments` - Get all payments
- `GET /api/payments/pending` - Get pending payments
- `PUT /api/payments/{id}/validate` - Validate payment
- `PUT /api/payments/{id}/reject` - Reject payment

### Public (View Only)
- `GET /api/payments/receipt/{fileName}` - View receipt

## ✅ Checklist

- [x] Backend Payment entity created
- [x] Backend Payment repository created
- [x] Backend Payment service created
- [x] Backend File storage service created
- [x] Backend Payment controller created
- [x] Backend DTOs created
- [x] Backend configuration updated
- [x] Frontend Payment service created
- [x] Frontend Pricing component updated
- [x] Back-office Payment service created
- [x] Back-office Payments page created
- [x] Back-office Routes updated
- [x] Back-office Sidebar updated
- [x] SQL script created
- [x] Documentation created

## 🎉 Success!

The complete payment system is now implemented with:
- ✅ Backend file storage
- ✅ Admin validation page
- ✅ Receipt upload and viewing
- ✅ Payment status management
- ✅ Beautiful admin UI

Next step: Integrate real Stripe API for card payments!

