# Script to manually trigger the subscription reminder check
# This will force the system to check for expiring subscriptions immediately

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TRIGGER SUBSCRIPTION REMINDER CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AbonnementService is running
Write-Host "Checking if AbonnementService is running..." -ForegroundColor Yellow
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8084/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✓ AbonnementService is running" -ForegroundColor Green
} catch {
    Write-Host "✗ AbonnementService is NOT running on port 8084" -ForegroundColor Red
    Write-Host "  Please start AbonnementService first" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Triggering reminder check..." -ForegroundColor Yellow

try {
    $result = Invoke-RestMethod -Uri "http://localhost:8084/api/subscription-reminders/check-now" -Method POST -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✓ Reminder check completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    if ($result.Count -eq 0) {
        Write-Host "No reminders found." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "This could mean:" -ForegroundColor Cyan
        Write-Host "  1. No subscriptions are expiring soon (within 14 days)" -ForegroundColor White
        Write-Host "  2. No validated payments exist in the database" -ForegroundColor White
        Write-Host "  3. Payment dates are too far in the future" -ForegroundColor White
        Write-Host ""
        Write-Host "Check the AbonnementService console logs for details." -ForegroundColor Yellow
    } else {
        Write-Host "Found $($result.Count) reminder(s):" -ForegroundColor Green
        Write-Host ""
        
        foreach ($reminder in $result) {
            $color = switch ($reminder.reminderType) {
                "EXPIRED" { "Red" }
                "EXPIRING_TODAY" { "Magenta" }
                "EXPIRING_SOON" { "Yellow" }
                default { "White" }
            }
            
            Write-Host "  User: $($reminder.userName) (ID: $($reminder.userId))" -ForegroundColor $color
            Write-Host "  Type: $($reminder.subscriptionType)" -ForegroundColor $color
            Write-Host "  Status: $($reminder.reminderType)" -ForegroundColor $color
            Write-Host "  Days until expiration: $($reminder.daysUntilExpiration)" -ForegroundColor $color
            Write-Host "  Message: $($reminder.message)" -ForegroundColor $color
            Write-Host ""
        }
    }
    
    Write-Host ""
    Write-Host "Now test the frontend:" -ForegroundColor Cyan
    Write-Host "  1. Open http://localhost:4200" -ForegroundColor White
    Write-Host "  2. Login as admin@wordly.com" -ForegroundColor White
    Write-Host "  3. Check the bell icon in the header" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "✗ Error triggering reminder check:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. AbonnementService is running on port 8084" -ForegroundColor White
    Write-Host "  2. UserService is running on port 8085" -ForegroundColor White
    Write-Host "  3. MySQL is running on port 3307" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
