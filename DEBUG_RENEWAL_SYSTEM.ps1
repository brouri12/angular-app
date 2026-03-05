# Debug the renewal email system
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEBUGGING RENEWAL EMAIL SYSTEM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: Check if UserService is running
Write-Host "`n[1/4] Checking UserService..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8085/api/users/hello" -Method Get -TimeoutSec 5
    Write-Host "✅ UserService is running" -ForegroundColor Green
} catch {
    Write-Host "❌ UserService is NOT running!" -ForegroundColor Red
    Write-Host "Start it with: cd UserService; mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check /validated endpoint
Write-Host "`n[2/4] Testing /validated endpoint..." -ForegroundColor Yellow
try {
    $payments = Invoke-RestMethod -Uri "http://localhost:8085/api/payments/validated" -Method Get
    Write-Host "✅ Endpoint works! Found $($payments.Count) validated payments" -ForegroundColor Green
    
    if ($payments.Count -gt 0) {
        Write-Host "`nPayment details:" -ForegroundColor Cyan
        foreach ($p in $payments) {
            $expDays = "N/A"
            if ($p.datePaiement) {
                $startDate = [DateTime]::Parse($p.datePaiement)
                $expDate = $startDate.AddDays(30) # Assuming 30 days
                $daysLeft = ($expDate - (Get-Date)).Days
                $expDays = "$daysLeft days"
            }
            Write-Host "  - ID: $($p.id_payment) | Email: $($p.emailClient) | Expires in: $expDays" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Check if AbonnementService is running
Write-Host "`n[3/4] Checking AbonnementService..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8086/actuator/health" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ AbonnementService is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️ AbonnementService might not be running" -ForegroundColor Yellow
    Write-Host "Start it with: cd AbonnementService; mvn spring-boot:run" -ForegroundColor Yellow
}

# Test 4: Trigger manual check
Write-Host "`n[4/4] Triggering manual renewal check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8086/api/renewal/trigger" -Method Post
    Write-Host "✅ Manual check triggered!" -ForegroundColor Green
    Write-Host "Check AbonnementService logs for results" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Could not trigger manual check" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`nThe scheduler will run automatically every 2 minutes" -ForegroundColor Cyan
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Check AbonnementService logs for renewal check results" -ForegroundColor White
Write-Host "2. Wait 2 minutes for automatic scheduler to run" -ForegroundColor White
Write-Host "3. Check email inbox: marwenazouzi44@gmail.com" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
