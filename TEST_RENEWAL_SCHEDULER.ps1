Write-Host "========================================"
Write-Host "TESTING RENEWAL EMAIL SCHEDULER"
Write-Host "========================================"

Write-Host "`n[1/3] Triggering manual renewal check..."

try {
    $response = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:8084/api/renewal/trigger" `
        -TimeoutSec 30

    Write-Host ""
    Write-Host "✅ Scheduler triggered successfully!" -ForegroundColor Green
    Write-Host "========================================"
    Write-Host "Response: $($response.message)"
    Write-Host "Status: $($response.status)"
    Write-Host "========================================"
    
} catch {
    Write-Host ""
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n[2/3] Check AbonnementService console for:"
Write-Host "  - Number of payments checked"
Write-Host "  - Emails sent"
Write-Host "  - Promo codes generated"

Write-Host "`n[3/3] To create a test payment that expires in 7 days:"
Write-Host "  Run the SQL script: FIX_PAYMENT_FOR_REMINDER.sql"
Write-Host "  Or create a payment manually in the database"

Write-Host "`n========================================"
Write-Host "SCHEDULER INFO"
Write-Host "========================================"
Write-Host "Current schedule: Every day at 9:00 AM"
Write-Host "Checks for: Subscriptions expiring in exactly 7 days"
Write-Host "Sends: Email with 15% discount promo code"
Write-Host "From: marwenazouzi44@gmail.com"
Write-Host ""
