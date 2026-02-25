# Check payment data in database

Write-Host "Checking Payment Data in Database" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$host = "localhost"
$port = "3307"
$user = "root"
$database = "user_db"

if (-not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL not found at $mysqlPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Querying payments table..." -ForegroundColor Yellow
Write-Host ""

$query = @"
SELECT 
    id_payment,
    nom_client,
    type_abonnement,
    montant,
    methode_paiement,
    statut,
    receipt_url,
    date_paiement
FROM payments
ORDER BY date_paiement DESC
LIMIT 5;
"@

try {
    $result = & $mysqlPath --host=$host --port=$port --user=$user $database -e $query 2>&1
    
    Write-Host $result
    Write-Host ""
    
    # Check for receipts
    $receiptQuery = "SELECT id_payment, receipt_url FROM payments WHERE receipt_url IS NOT NULL;"
    $receipts = & $mysqlPath --host=$host --port=$port --user=$user $database -e $receiptQuery 2>&1
    
    Write-Host "Payments with receipts:" -ForegroundColor Cyan
    Write-Host $receipts
    Write-Host ""
    
    # Check if files exist
    Write-Host "Checking if receipt files exist:" -ForegroundColor Cyan
    $files = Get-ChildItem -Path "UserService\uploads\receipts" -File -ErrorAction SilentlyContinue
    if ($files) {
        foreach ($file in $files) {
            Write-Host "  ✓ $($file.Name) ($([math]::Round($file.Length/1KB, 2)) KB)" -ForegroundColor Green
        }
    } else {
        Write-Host "  No files found in uploads/receipts" -ForegroundColor Yellow
    }
    Write-Host ""
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
