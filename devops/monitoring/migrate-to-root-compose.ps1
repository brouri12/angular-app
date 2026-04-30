# ============================================================
#  Migrate from devops/monitoring to Root Docker Compose
#  This script consolidates all services to use the root
#  docker-compose.yml file only
# ============================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Migrating to Root Docker Compose" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop services in devops/monitoring
Write-Host "[1/5] Stopping services in devops/monitoring..." -ForegroundColor Yellow
Set-Location "C:\Users\marwe\Desktop\Nouveau dossier\devops\monitoring"
docker-compose down -v
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services stopped successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: Could not stop services (they may not be running)" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Return to root directory
Write-Host "[2/5] Navigating to root directory..." -ForegroundColor Yellow
Set-Location "C:\Users\marwe\Desktop\Nouveau dossier"
Write-Host "✓ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 3: Pull latest images
Write-Host "[3/5] Pulling latest Docker images..." -ForegroundColor Yellow
docker-compose pull
Write-Host ""

# Step 4: Start all services from root
Write-Host "[4/5] Starting all services from root docker-compose.yml..." -ForegroundColor Yellow
Write-Host "This will start:" -ForegroundColor White
Write-Host "  • 5 MySQL instances (main + 4 dedicated)" -ForegroundColor White
Write-Host "  • Keycloak" -ForegroundColor White
Write-Host "  • Eureka Server" -ForegroundColor White
Write-Host "  • API Gateway" -ForegroundColor White
Write-Host "  • 15 Microservices" -ForegroundColor White
Write-Host "  • 2 Frontend applications" -ForegroundColor White
Write-Host "  • Jenkins" -ForegroundColor White
Write-Host "  • SonarQube + PostgreSQL" -ForegroundColor White
Write-Host "  • Prometheus" -ForegroundColor White
Write-Host "  • Grafana" -ForegroundColor White
Write-Host ""

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All services started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Error starting services" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Wait for services to initialize
Write-Host "[5/5] Waiting for services to initialize..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor White
Start-Sleep -Seconds 30

# Check service status
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Service Status" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Migration Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your services at:" -ForegroundColor White
Write-Host "  • Jenkins:        http://localhost:8080" -ForegroundColor Cyan
Write-Host "  • SonarQube:      http://localhost:9000" -ForegroundColor Cyan
Write-Host "  • Prometheus:     http://localhost:9091" -ForegroundColor Cyan
Write-Host "  • Grafana:        http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • Eureka:         http://localhost:8761" -ForegroundColor Cyan
Write-Host "  • API Gateway:    http://localhost:8888" -ForegroundColor Cyan
Write-Host "  • Frontend:       http://localhost:4200" -ForegroundColor Cyan
Write-Host "  • Back-office:    http://localhost:4201" -ForegroundColor Cyan
Write-Host "  • Keycloak:       http://localhost:9090" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait 2-3 minutes for Jenkins to fully initialize" -ForegroundColor White
Write-Host "  2. Get Jenkins password: docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor White
Write-Host "  3. Configure Jenkins at http://localhost:8080" -ForegroundColor White
Write-Host "  4. Configure SonarQube at http://localhost:9000 (admin/admin)" -ForegroundColor White
Write-Host "  5. Access Grafana at http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host ""
Write-Host "To view logs: docker-compose logs -f [service-name]" -ForegroundColor White
Write-Host "To stop all:  docker-compose down" -ForegroundColor White
Write-Host ""
