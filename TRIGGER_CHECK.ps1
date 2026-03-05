# Trigger Manual Reminder Check
Write-Host "=== Triggering Manual Reminder Check ===" -ForegroundColor Cyan

Write-Host "`nTriggering check..." -ForegroundColor Yellow
try {
    $url = "http://localhost:8888/abonnement-service/api/subscription-reminders/check-now"
    $response = Invoke-RestMethod -Uri $url -Method POST
    
    Write-Host "SUCCESS Check completed!" -ForegroundColor Green
    Write-Host "Reminders found: $($response.Count)" -ForegroundColor White
    
    if ($response.Count -gt 0) {
        Write-Host "`nReminder details:" -ForegroundColor Cyan
        foreach ($reminder in $response) {
            Write-Host "  - User: $($reminder.userId)" -ForegroundColor Gray
            Write-Host "    Type: $($reminder.reminderType)" -ForegroundColor Gray
            Write-Host "    Days: $($reminder.daysUntilExpiration)" -ForegroundColor Gray
            Write-Host "    Message: $($reminder.message)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "`nNo reminders generated." -ForegroundColor Yellow
        Write-Host "Check AbonnementService logs for details." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nCheck AbonnementService logs for:" -ForegroundColor Cyan
Write-Host "  - 'Failed to fetch payments from UserService: 401'" -ForegroundColor Gray
Write-Host "  - 'Subscription check complete. Found X reminders'" -ForegroundColor Gray
