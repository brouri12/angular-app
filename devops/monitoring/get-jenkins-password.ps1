# ============================================================
#  Get Jenkins Initial Admin Password
# ============================================================

Write-Host ""
Write-Host "Getting Jenkins Initial Admin Password..." -ForegroundColor Cyan
Write-Host ""

# Check if Jenkins container is running
$jenkinsRunning = docker ps --filter "name=wordly-jenkins" --format "{{.Names}}" 2>$null

if (-not $jenkinsRunning) {
    Write-Host "[ERROR] Jenkins container is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Start Jenkins with:" -ForegroundColor Yellow
    Write-Host "  cd devops/monitoring" -ForegroundColor Gray
    Write-Host "  docker-compose up -d jenkins" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "[INFO] Jenkins container is running" -ForegroundColor Green
Write-Host "[INFO] Waiting for password file to be created..." -ForegroundColor Blue
Write-Host ""

$maxAttempts = 60
$attempt = 0
$password = $null

while (-not $password -and $attempt -lt $maxAttempts) {
    try {
        $password = docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
        
        if ($password) {
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host "  Jenkins Initial Admin Password" -ForegroundColor Green
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "  $password" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Use this password to unlock Jenkins at:" -ForegroundColor Cyan
            Write-Host "  http://localhost:8080" -ForegroundColor White
            Write-Host ""
            break
        }
    }
    catch {
        # Ignore error
    }
    
    $attempt++
    Write-Host "." -NoNewline -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if (-not $password) {
    Write-Host ""
    Write-Host ""
    Write-Host "[WARNING] Password file not found yet" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Jenkins may still be initializing. This can take 2-3 minutes." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Wait a bit longer and run this script again" -ForegroundColor White
    Write-Host "2. Check Jenkins logs:" -ForegroundColor White
    Write-Host "   docker logs wordly-jenkins" -ForegroundColor Gray
    Write-Host "3. Try manually:" -ForegroundColor White
    Write-Host "   docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor Gray
    Write-Host ""
}
