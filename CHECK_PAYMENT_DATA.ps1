# Script to check payment data for user 33
# This verifies the payment exists and has correct data for reminders

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHECK PAYMENT DATA FOR USER 33" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# MySQL connection details
$mysqlHost = "127.0.0.1"
$mysqlPort = "3307"
$mysqlUser = "root"
$mysqlPassword = ""

Write-Host "Checking payment data..." -ForegroundColor Yellow
Write-Host ""

# Check if mysql is available
$mysqlPath = "mysql"
try {
    $null = & $mysqlPath --version 2>&1
} catch {
    Write-Host "✗ MySQL client not found in PATH" -ForegroundColor Red
    Write-Host "  Please install MySQL client or add it to PATH" -ForegroundColor Yellow
    exit 1
}

# Query payment data
$query = @"
SELECT 
    p.id_payment,
    p.id_user,
    p.id_abonnement,
    p.nom_client,
    p.email_client,
    p.type_abonnement,
    p.montant,
    p.methode_paiement,
    p.statut,
    p.date_paiement,
    p.date_validation,
    DATEDIFF(DATE_ADD(p.date_paiement, INTERVAL 30 DAY), CURDATE()) as days_until_expiration
FROM user_db.payments p
WHERE p.id_user = 33 AND p.statut = 'Validé'
ORDER BY p.date_paiement DESC;
"@

Write-Host "Executing query..." -ForegroundColor Yellow
$result = & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -e $query 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host $result
    Write-Host ""
    Write-Host "✓ Query executed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "What to check:" -ForegroundColor Cyan
    Write-Host "  1. statut should be 'Validé' (with accent é)" -ForegroundColor White
    Write-Host "  2. methode_paiement should be 'carte', 'paypal', or 'virement'" -ForegroundColor White
    Write-Host "  3. date_paiement should be a valid date" -ForegroundColor White
    Write-Host "  4. days_until_expiration should be between 0 and 14 for reminder" -ForegroundColor White
    Write-Host ""
    Write-Host "If days_until_expiration is negative, subscription is EXPIRED" -ForegroundColor Red
    Write-Host "If days_until_expiration is 0, subscription expires TODAY" -ForegroundColor Magenta
    Write-Host "If days_until_expiration is 1-14, subscription is EXPIRING_SOON" -ForegroundColor Yellow
    Write-Host "If days_until_expiration is > 14, no reminder is shown" -ForegroundColor Gray
} else {
    Write-Host "✗ Error executing query:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
