# ============================================================
#  Restart All DevOps Services
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Restarting All DevOps Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to monitoring directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Step 1: Stopping all services..." -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host ""

docker-compose down

Write-Host ""
Write-Host "[OK] All services stopped" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Starting all services..." -ForegroundColor Yellow
Write-Host "----------------------------------"
Write-Host ""

docker-compose up -d

Write-Host ""
Write-Host "[OK] All services started" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Waiting for services to initialize..." -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host ""

Write-Host "Waiting 60 seconds for services to start..." -ForegroundColor Blue
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "Step 4: Checking service status..." -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host ""

docker-compose ps

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Services Restarted!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Checking service health..." -ForegroundColor Cyan
Write-Host ""

# Check each service
$services = @(
    @{Name="Jenkins"; Port=8080; URL="http://localhost:8080"},
    @{Name="SonarQube"; Port=9000; URL="http://localhost:9000"},
    @{Name="Prometheus"; Port=9090; URL="http://localhost:9090"},
    @{Name="Grafana"; Port=3000; URL="http://localhost:3000"}
)

foreach ($service in $services) {
    Write-Host "Checking $($service.Name)..." -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 403) {
            Write-Host "[OK] $($service.Name) is accessible at $($service.URL)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "[WARNING] $($service.Name) is still starting up..." -ForegroundColor Yellow
        Write-Host "         Wait 1-2 minutes and try: $($service.URL)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  • Jenkins:    http://localhost:8080" -ForegroundColor White
Write-Host "  • SonarQube:  http://localhost:9000" -ForegroundColor White
Write-Host "  • Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  • Grafana:    http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2-3 minutes for all services to fully initialize" -ForegroundColor White
Write-Host "2. Test Jenkins webhook by pushing code to GitHub" -ForegroundColor White
Write-Host "3. Check ngrok is still running (restart if needed)" -ForegroundColor White
Write-Host ""

Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f <service-name>" -ForegroundColor Gray
Write-Host ""
