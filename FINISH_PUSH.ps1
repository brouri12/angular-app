# Finish the rebase and push
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINISHING GIT PUSH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Add resolved files
Write-Host "`n[1/3] Adding resolved files..." -ForegroundColor Yellow
git add .

# Continue rebase
Write-Host "`n[2/3] Continuing rebase..." -ForegroundColor Yellow
git rebase --continue

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Rebase failed!" -ForegroundColor Red
    Write-Host "Check for remaining conflicts with: git status" -ForegroundColor Yellow
    exit 1
}

# Push to remote
Write-Host "`n[3/3] Pushing to remote..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "✅ SUCCESS! All changes pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Push failed" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Yellow
}
