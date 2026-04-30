# ============================================================
#  Restart Docker Desktop
#  Use this if Docker is having issues
# ============================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Restarting Docker Desktop" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Stopping Docker Desktop..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

Write-Host "[2/3] Starting Docker Desktop..." -ForegroundColor Yellow
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "[3/3] Waiting for Docker to be ready..." -ForegroundColor Yellow
Write-Host "This may take 1-2 minutes..." -ForegroundColor White

$maxAttempts = 30
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    $attempt++
    Start-Sleep -Seconds 5
    
    try {
        $result = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "✓ Docker is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline
    }
}

if (-not $dockerReady) {
    Write-Host ""
    Write-Host "⚠ Docker Desktop is taking longer than expected to start" -ForegroundColor Yellow
    Write-Host "Please wait a bit longer and check Docker Desktop manually" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host " Docker Desktop is Ready!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run the migration script:" -ForegroundColor White
    Write-Host "  .\devops\monitoring\migrate-to-root-compose.ps1" -ForegroundColor Cyan
}
