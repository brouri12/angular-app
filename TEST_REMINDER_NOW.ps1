# Quick test to trigger reminder check and see results

Write-Host ""
Write-Host "=== TRIGGERING REMINDER CHECK ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Trigger the check
    $reminders = Invoke-RestMethod -Uri "http://localhost:8084/api/subscription-reminders/check-now" -Method POST
    
    Write-Host "✓ Check completed!" -ForegroundColor Green
    Write-Host ""
    
    if ($reminders.Count -eq 0) {
        Write-Host "No reminders found." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Check AbonnementService console for details." -ForegroundColor Cyan
    } else {
        Write-Host "Found $($reminders.Count) reminder(s):" -ForegroundColor Green
        Write-Host ""
        
        foreach ($r in $reminders) {
            Write-Host "User $($r.userId): $($r.subscriptionType) - $($r.reminderType)" -ForegroundColor Yellow
            Write-Host "  Expires in $($r.daysUntilExpiration) days" -ForegroundColor White
            Write-Host "  $($r.message)" -ForegroundColor Gray
            Write-Host ""
        }
        
        Write-Host "Now check the frontend at http://localhost:4200" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure AbonnementService is running on port 8084" -ForegroundColor Yellow
}

Write-Host ""
