# Manual Payment System Setup

If the PowerShell script doesn't work, follow these manual steps:

## Step 1: Create Payments Table

### Option A: Using phpMyAdmin (Easiest)

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on `user_db` database in the left sidebar
3. Click on the "SQL" tab at the top
4. Copy and paste this SQL code:

```sql
CREATE TABLE IF NOT EXISTS payments (
    id_payment BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT,
    id_abonnement BIGINT,
    nom_client VARCHAR(255) NOT NULL,
    email_client VARCHAR(255) NOT NULL,
    type_abonnement VARCHAR(100) NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    methode_paiement VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'En attente',
    reference_transaction VARCHAR(255) NOT NULL UNIQUE,
    stripe_payment_id VARCHAR(255),
    receipt_url VARCHAR(500),
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP NULL,
    validated_by BIGINT,
    notes TEXT,
    INDEX idx_user (id_user),
    INDEX idx_statut (statut),
    INDEX idx_methode (methode_paiement),
    INDEX idx_date (date_paiement),
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. Click "Go" button
6. You should see "Query OK" message

### Option B: Using MySQL Command Line

1. Open Command Prompt
2. Navigate to MySQL bin directory:
```cmd
cd C:\xampp\mysql\bin
```

3. Login to MySQL:
```cmd
mysql -u root -p --port=3307
```

4. Press Enter (no password)

5. Select database:
```sql
USE user_db;
```

6. Copy and paste the CREATE TABLE statement from Option A above

7. Press Enter

8. Type `exit` to quit MySQL

## Step 2: Create Upload Directory

### Option A: Using File Explorer
1. Navigate to your project folder
2. Go to `UserService` folder
3. Create a new folder called `uploads`
4. Inside `uploads`, create a folder called `receipts`

Final path: `UserService/uploads/receipts`

### Option B: Using PowerShell
```powershell
New-Item -ItemType Directory -Path "UserService\uploads\receipts" -Force
```

### Option C: Using Command Prompt
```cmd
mkdir UserService\uploads\receipts
```

## Step 3: Verify Setup

### Check Database Table
1. Open phpMyAdmin
2. Select `user_db` database
3. You should see `payments` table in the list
4. Click on it to see the structure

### Check Upload Directory
1. Navigate to `UserService/uploads/receipts`
2. The folder should exist (it will be empty for now)

## Step 4: Restart Services

### Backend (UserService)
1. Stop UserService if it's running
2. In IntelliJ, run `UserService/src/main/java/tn/esprit/user/UserApplication.java`
3. Wait for "Started UserApplication" message in console

### Frontend
```bash
cd frontend/angular-app
ng serve
```

### Back-Office
```bash
cd back-office
ng serve --port 4201
```

## Step 5: Test

### Test Frontend Payment
1. Go to http://localhost:4200/pricing
2. Login as any user
3. Click "Subscribe Now" on any plan
4. Select "Bank Transfer"
5. Click "Continue"
6. Upload a test image (JPG or PNG)
7. Click "Submit"
8. You should see: "Bank transfer submitted successfully! Your payment is pending admin validation."

### Test Back-Office Admin Panel
1. Go to http://localhost:4201/payments
2. Login as admin (admin@wordly.com / Admin123!)
3. You should see the payment you just created
4. Click "Review"
5. Click "View Receipt" - your uploaded image should open
6. Add optional notes
7. Click "Approve"
8. Payment should disappear from pending list

### Verify in Database
1. Open phpMyAdmin
2. Select `user_db` database
3. Click on `payments` table
4. Click "Browse" tab
5. You should see your payment record with:
   - Status: "Validé" (if you approved it)
   - Receipt URL: filename of uploaded image
   - Date validation: current timestamp
   - Validated by: admin user ID

## Troubleshooting

### Issue: "Table already exists"
**Solution:** Table is already created, skip to Step 2

### Issue: "Cannot add foreign key constraint"
**Solution:** Make sure `users` table exists in `user_db` database

### Issue: "Access denied"
**Solution:** Check MySQL is running on port 3307 and user is `root` with no password

### Issue: "File upload fails"
**Solution:** 
1. Check `uploads/receipts` directory exists
2. Check directory has write permissions
3. Check backend logs for errors

### Issue: "Can't see payments in admin panel"
**Solution:**
1. Make sure you're logged in as ADMIN role
2. Check browser console for errors
3. Check backend is running on port 8085
4. Check API Gateway is running on port 8888

## Success Checklist

- [ ] `payments` table exists in `user_db` database
- [ ] `UserService/uploads/receipts` directory exists
- [ ] Backend (UserService) is running
- [ ] Frontend is running on port 4200
- [ ] Back-Office is running on port 4201
- [ ] Can create payment from frontend
- [ ] Can upload receipt
- [ ] Can see payment in back-office
- [ ] Can view receipt in back-office
- [ ] Can approve/reject payment

## Need Help?

If you're still having issues:
1. Check all services are running (MySQL, Eureka, Gateway, UserService)
2. Check browser console for JavaScript errors
3. Check backend console for Java errors
4. Verify database connection in `application.properties`
5. Make sure port 3307 is correct for your MySQL

## Quick Test SQL

To verify everything is working, run this in phpMyAdmin SQL tab:

```sql
-- Check if table exists
SHOW TABLES LIKE 'payments';

-- Check table structure
DESCRIBE payments;

-- Check if any payments exist
SELECT * FROM payments;

-- Check pending payments
SELECT * FROM payments WHERE statut = 'En attente';
```

You're all set! 🎉

