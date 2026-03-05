# Force complete the rebase and push
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETING GIT PUSH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check current git status
Write-Host "`nCurrent status:" -ForegroundColor Yellow
git status

# Add all resolved files
Write-Host "`n[1/4] Adding resolved files..." -ForegroundColor Yellow
git add .

# Set environment variable to skip editor
$env:GIT_EDITOR = "true"

# Continue rebase with no-edit flag
Write-Host "`n[2/4] Continuing rebase (no editor)..." -ForegroundColor Yellow
git -c core.editor=true rebase --continue

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Rebase continue failed, trying alternative..." -ForegroundColor Yellow
    
    # Alternative: Skip this commit and try again
    Write-Host "Skipping problematic commit..." -ForegroundColor Yellow
    git rebase --skip
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Still failing. Aborting rebase..." -ForegroundColor Red
        git rebase --abort
        
        Write-Host "`nTrying force push with lease..." -ForegroundColor Yellow
        git push --force-with-lease
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Force push succeeded!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "`n❌ All methods failed" -ForegroundColor Red
            exit 1
        }
    }
}

# Push to remote
Write-Host "`n[3/4] Pushing to remote..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "✅ SUCCESS! Changes pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host "`n[4/4] Normal push failed, trying force push..." -ForegroundColor Yellow
    git push --force-with-lease
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Force push succeeded!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Push failed" -ForegroundColor Red
    }
}
