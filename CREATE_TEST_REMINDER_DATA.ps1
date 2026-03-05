# Create Test Data for Subscription Reminders
# This script helps you create test payments with expiring subscriptions

Write-Host "=== Create Test Reminder Data ===" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is accessible
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow
$mysqlPath = "mysql"
$mysqlPort = "3307"
$mysqlDb = "elearning_db"

# Prompt for MySQL credentials
$mysqlUser = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) {
    $mysqlUser = "root"
}

$mysqlPassword = Read-Host "Enter MySQL password" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword))

Write-Host ""
Write-Host "Fetching existing data..." -ForegroundColor Yellow

# Get users
$getUsersQuery = "SELECT id_user, username, email FROM users LIMIT 5;"
try {
    $usersOutput = & mysql -u $mysqlUser -p"$mysqlPasswordPlain" -P $mysqlPort -D $mysqlDb -e $getUsersQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Available Users:" -ForegroundColor Cyan
        Write-Host $usersOutput
    } else {
        Write-Host "Failed to connect to MySQL. Please check your credentials." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Get subscriptions
$getSubsQuery = "SELECT id_abonnement, nom, duree_jours, prix FROM abonnements;"
$subsOutput = & mysql -u $mysqlUser -p"$mysqlPasswordPlain" -P $mysqlPort -D $mysqlDb -e $getSubsQuery 2>&1
Write-Host ""
Write-Host "Available Subscriptions:" -ForegroundColor Cyan
Write-Host $subsOutput

Write-Host ""
Write-Host "Enter the IDs to use for test data:" -ForegroundColor Yellow
$userId = Read-Host "User ID (from the list above)"
$subId = Read-Host "Subscription ID (from the list above)"

if ([string]::IsNullOrWhiteSpace($userId) -or [string]::IsNullOrWhiteSpace($subId)) {
    Write-Host "Error: User ID and Subscription ID are required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating test payments..." -ForegroundColor Yellow

# Create test payments
$testPayments = @"
-- Test 1: EXPIRED (5 days ago)
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, nom_client, email_client, type_abonnement)
VALUES ($userId, $subId, 29.99, 'carte', 'Validé', DATE_SUB(NOW(), INTERVAL 35 DAY), 'Test User - Expired', 'expired@test.com', 'Premium');

-- Test 2: EXPIRING TODAY
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, nom_client, email_client, type_abonnement)
VALUES ($userId, $subId, 29.99, 'paypal', 'Validé', DATE_SUB(NOW(), INTERVAL 30 DAY), 'Test User - Today', 'today@test.com', 'Premium');

-- Test 3: EXPIRING IN 7 DAYS
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, nom_client, email_client, type_abonnement)
VALUES ($userId, $subId, 29.99, 'carte', 'Validé', DATE_SUB(NOW(), INTERVAL 23 DAY), 'Test User - 7 Days', '7days@test.com', 'Premium');

-- Test 4: EXPIRING IN 14 DAYS
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, nom_client, email_client, type_abonnement)
VALUES ($userId, $subId, 29.99, 'carte', 'Validé', DATE_SUB(NOW(), INTERVAL 16 DAY), 'Test User - 14 Days', '14days@test.com', 'Premium');

-- Test 5: BANK TRANSFER (expiring in 5 days)
INSERT INTO payments (id_user, id_abonnement, montant, methode_paiement, statut, date_paiement, date_validation, nom_client, email_client, type_abonnement)
VALUES ($userId, $subId, 29.99, 'virement', 'Validé', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), 'Test User - Bank', 'bank@test.com', 'Premium');
"@

# Save to temp file
$tempFile = [System.IO.Path]::GetTempFileName()
$testPayments | Out-File -FilePath $tempFile -Encoding UTF8

# Execute SQL
& mysql -u $mysqlUser -p"$mysqlPasswordPlain" -P $mysqlPort -D $mysqlDb < $tempFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Test payments created successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create test payments" -ForegroundColor Red
    Remove-Item $tempFile
    exit 1
}

Remove-Item $tempFile

# Verify
Write-Host ""
Write-Host "Verifying test data..." -ForegroundColor Yellow
$verifyQuery = @"
SELECT 
    id_payment,
    nom_client,
    methode_paiement,
    date_paiement,
    CASE 
        WHEN methode_paiement = 'virement' THEN DATE_ADD(date_validation, INTERVAL 30 DAY)
        ELSE DATE_ADD(date_paiement, INTERVAL 30 DAY)
    END as expiration_date,
    CASE 
        WHEN methode_paiement = 'virement' THEN DATEDIFF(DATE_ADD(date_validation, INTERVAL 30 DAY), NOW())
        ELSE DATEDIFF(DATE_ADD(date_paiement, INTERVAL 30 DAY), NOW())
    END as days_until_expiration
FROM payments
WHERE nom_client LIKE 'Test User%'
ORDER BY days_until_expiration;
"@

$verifyOutput = & mysql -u $mysqlUser -p"$mysqlPasswordPlain" -P $mysqlPort -D $mysqlDb -e $verifyQuery 2>&1
Write-Host ""
Write-Host "Test Payments Created:" -ForegroundColor Cyan
Write-Host $verifyOutput

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Run the test script to trigger reminder check:" -ForegroundColor Yellow
Write-Host "   .\TEST_REMINDER_SYSTEM.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2. Or manually trigger via API:" -ForegroundColor Yellow
Write-Host "   curl -X POST http://localhost:8083/api/subscription-reminders/check-now" -ForegroundColor White
Write-Host ""
Write-Host "3. Check reminders for your user:" -ForegroundColor Yellow
Write-Host "   curl http://localhost:8083/api/subscription-reminders/user/$userId" -ForegroundColor White
Write-Host ""
Write-Host "4. Start frontend and login to see the bell icon:" -ForegroundColor Yellow
Write-Host "   cd frontend/angular-app && ng serve --port 4200" -ForegroundColor White
Write-Host ""

Write-Host "To cleanup test data later, run:" -ForegroundColor Yellow
Write-Host "  mysql -u $mysqlUser -p -P $mysqlPort -D $mysqlDb -e `"DELETE FROM payments WHERE nom_client LIKE 'Test User%';`"" -ForegroundColor Gray
Write-Host ""
