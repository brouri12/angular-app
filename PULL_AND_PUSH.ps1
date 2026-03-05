# Pull remote changes and push local changes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SYNC WITH REMOTE REPOSITORY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Pull remote changes
Write-Host "`n[1/3] Pulling remote changes..." -ForegroundColor Yellow
git pull --rebase

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Merge conflicts detected!" -ForegroundColor Red
    Write-Host "You need to resolve conflicts manually:" -ForegroundColor Yellow
    Write-Host "1. Check conflicted files: git status" -ForegroundColor White
    Write-Host "2. Edit files to resolve conflicts" -ForegroundColor White
    Write-Host "3. Add resolved files: git add ." -ForegroundColor White
    Write-Host "4. Continue rebase: git rebase --continue" -ForegroundColor White
    Write-Host "5. Push: git push" -ForegroundColor White
    exit 1
}

# Step 2: Verify everything is good
Write-Host "`n[2/3] Checking status..." -ForegroundColor Yellow
git status

# Step 3: Push changes
Write-Host "`n[3/3] Pushing to remote..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "✅ SUCCESS! All changes pushed" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "❌ Push failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
}
