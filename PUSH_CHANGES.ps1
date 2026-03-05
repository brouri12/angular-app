# Push all changes to Git
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PUSHING CHANGES TO GIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check git status
Write-Host "`n[1/4] Checking git status..." -ForegroundColor Yellow
git status

# Add all changes
Write-Host "`n[2/4] Adding all changes..." -ForegroundColor Yellow
git add .

# Commit with message
Write-Host "`n[3/4] Committing changes..." -ForegroundColor Yellow
$commitMessage = "feat: Add renewal email system with promo codes and currency migration to TND

- Implemented automated renewal email system in AbonnementService
- Sends emails 7 days before subscription expiration
- Generates unique promo codes (RENEW-XXXXX) with 15% discount
- Scheduler runs daily at 9 AM
- Fixed PaymentController endpoint routing issue
- Migrated all currency displays from USD to TND
- Updated pricing: Basic 30 TND, Premium 90 TND, Enterprise 300 TND
- Updated Keycloak client secret configuration"

git commit -m "$commitMessage"

# Push to remote
Write-Host "`n[4/4] Pushing to remote..." -ForegroundColor Yellow
git push

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ DONE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
