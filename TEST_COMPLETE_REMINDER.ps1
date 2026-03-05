# Complete Test for Reminder System
Write-Host "=== Complete Reminder System Test ===" -ForegroundColor Cyan

# Step 1: Verify data in database
Write-Host "`n1. Verifying database data..." -ForegroundColor Yellow
Write-Host "Expected:" -ForegroundColor Gray
Write-Host "  - Payment: user 33, abonnement 2, date 2026-02-08, statut Validé" -ForegroundColor Gray
Write-Host "  - Abonnement: id 2, duree_jours 30" -ForegroundColor Gray
Write-Host "  - Expiration: 2026-03-10 (5 days from now)" -ForegroundColor Gray
Write-Host "  - Should generate: YELLOW reminder (EXPIRING_SOON)" -ForegroundColor Gray

# Step 2: Check if services are running
Write-Host "`n2. Checking if services are running..." -ForegroundColor Yellow

$services = @{
    "AbonnementService" = "http://localhost:8084"
    "UserService" = "http://localhost:8085"
    "API Gateway" = "http://localhost:8888"
}

foreach ($service in $services.GetEnumerator()) {
    try {
        $null = Invoke-WebRequest -Uri $service.Value -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  OK $($service.Key) is running" -ForegroundColor Green
    } catch {
        Write-Host "  ERROR $($service.Key) is NOT running!" -ForegroundColor Red
        Write-Host "  Please start $($service.Key) first" -ForegroundColor Yellow
    }
}

# Step 3: Test UserService /validated endpoint
Write-Host "`n3. Testing UserService /validated endpoint..." -ForegroundColor Yellow
try {
    $url = "http://localhost:8085/api/payments/validated"
    $payments = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "  OK Found $($payments.Count) validated payment(s)" -ForegroundColor Green
    
    $user33Payment = $payments | Where-Object { $_.idUser -eq 33 }
    if ($user33Payment) {
        Write-Host "  OK Payment for user 33 found:" -ForegroundColor Green
        Write-Host "    - ID Abonnement: $($user33Payment.idAbonnement)" -ForegroundColor Gray
        Write-Host "    - Date Paiement: $($user33Payment.datePaiement)" -ForegroundColor Gray
        Write-Host "    - Methode: $($user33Payment.methodePaiement)" -ForegroundColor Gray
    } else {
        Write-Host "  ERROR No payment found for user 33!" -ForegroundColor Red
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Trigger manual check
Write-Host "`n4. Triggering manual reminder check..." -ForegroundColor Yellow
try {
    $url = "http://localhost:8888/abonnement-service/api/subscription-reminders/check-now"
    $reminders = Invoke-RestMethod -Uri $url -Method POST
    Write-Host "  OK Manual check completed" -ForegroundColor Green
    Write-Host "  Found $($reminders.Count) reminder(s)" -ForegroundColor Gray
    
    if ($reminders.Count -gt 0) {
        foreach ($reminder in $reminders) {
            Write-Host "    - User: $($reminder.userId), Type: $($reminder.reminderType), Days: $($reminder.daysUntilExpiration)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Check reminders for user 33
Write-Host "`n5. Checking reminders for user 33..." -ForegroundColor Yellow
try {
    $url = "http://localhost:8888/abonnement-service/api/subscription-reminders/user/33"
    $userReminders = Invoke-RestMethod -Uri $url -Method GET
    
    if ($userReminders.Count -gt 0) {
        Write-Host "  SUCCESS Found $($userReminders.Count) reminder(s) for user 33!" -ForegroundColor Green
        foreach ($reminder in $userReminders) {
            Write-Host "    - Type: $($reminder.reminderType)" -ForegroundColor Gray
            Write-Host "    - Message: $($reminder.message)" -ForegroundColor Gray
            Write-Host "    - Expiration: $($reminder.expirationDate)" -ForegroundColor Gray
            Write-Host "    - Days remaining: $($reminder.daysUntilExpiration)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  WARNING No reminders found for user 33" -ForegroundColor Yellow
        Write-Host "  This means the system is working but no reminders match the criteria" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Check backend logs for AbonnementService" -ForegroundColor White
Write-Host "2. Look for: 'Subscription check complete. Found X reminders'" -ForegroundColor White
Write-Host "3. If no reminders, check the calculation logic" -ForegroundColor White
Write-Host "4. Login to frontend and check bell icon" -ForegroundColor White
