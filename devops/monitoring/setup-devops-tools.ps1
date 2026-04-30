# ============================================================
#  Setup DevOps Tools - Jenkins, SonarQube, Prometheus, Grafana
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  DevOps Tools Setup" -ForegroundColor Cyan
Write-Host "  Jenkins | SonarQube | Prometheus | Grafana" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Navigate to monitoring directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Step 1: Starting DevOps Tools Stack..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host ""

# Start all services
docker-compose up -d

Write-Host ""
Write-Host "Step 2: Waiting for services to initialize..." -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host ""

# Wait for services to be healthy
$services = @(
    @{Name="Jenkins"; Port=8080; Container="wordly-jenkins"},
    @{Name="SonarQube"; Port=9000; Container="wordly-sonarqube"},
    @{Name="Prometheus"; Port=9090; Container="wordly-prometheus"},
    @{Name="Grafana"; Port=3000; Container="wordly-grafana"}
)

foreach ($service in $services) {
    Write-Host "Waiting for $($service.Name) to be ready..." -ForegroundColor Blue
    
    $maxAttempts = 60
    $attempt = 0
    $ready = $false
    
    while (-not $ready -and $attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 403) {
                $ready = $true
                Write-Host "[OK] $($service.Name) is ready!" -ForegroundColor Green
            }
        }
        catch {
            $attempt++
            Write-Host "." -NoNewline -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
    
    if (-not $ready) {
        Write-Host ""
        Write-Host "[WARNING] $($service.Name) is taking longer than expected" -ForegroundColor Yellow
        Write-Host "Check logs: docker logs $($service.Container)" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host ""
Write-Host "Step 3: Configuring Services..." -ForegroundColor Yellow
Write-Host "--------------------------------"
Write-Host ""

# Wait a bit more for SonarQube to fully initialize
Write-Host "Waiting for SonarQube to fully initialize (this may take 2-3 minutes)..." -ForegroundColor Blue
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Access your DevOps tools:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Jenkins" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:8080" -ForegroundColor White
Write-Host "   Initial Admin Password:" -ForegroundColor White

# Wait for Jenkins to create the password file
$passwordAttempts = 0
$maxPasswordAttempts = 30
$jenkinsPassword = $null

while (-not $jenkinsPassword -and $passwordAttempts -lt $maxPasswordAttempts) {
    try {
        $jenkinsPassword = docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
        if ($jenkinsPassword) {
            Write-Host "   $jenkinsPassword" -ForegroundColor Green
            break
        }
    }
    catch {
        # Ignore error
    }
    
    $passwordAttempts++
    if ($passwordAttempts -eq 1) {
        Write-Host "   Waiting for Jenkins to initialize..." -ForegroundColor Yellow
    }
    Write-Host "." -NoNewline -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if (-not $jenkinsPassword) {
    Write-Host ""
    Write-Host "   Jenkins is still initializing. Get password later with:" -ForegroundColor Yellow
    Write-Host "   docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor Gray
}
Write-Host ""

Write-Host "2. SonarQube" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:9000" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin (change on first login)" -ForegroundColor White
Write-Host ""

Write-Host "3. Prometheus" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:9090" -ForegroundColor White
Write-Host "   No authentication required" -ForegroundColor White
Write-Host ""

Write-Host "4. Grafana" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin (change on first login)" -ForegroundColor White
Write-Host ""

Write-Host "Additional Services:" -ForegroundColor Cyan
Write-Host "  • Node Exporter: http://localhost:9100" -ForegroundColor Gray
Write-Host "  • cAdvisor: http://localhost:8081" -ForegroundColor Gray
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure Jenkins with plugins and credentials" -ForegroundColor White
Write-Host "2. Create SonarQube projects for code analysis" -ForegroundColor White
Write-Host "3. Import Grafana dashboards for monitoring" -ForegroundColor White
Write-Host "4. Run: .\configure-tools.ps1 (to auto-configure)" -ForegroundColor White
Write-Host ""

Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor Gray
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f <service-name>" -ForegroundColor Gray
Write-Host ""
