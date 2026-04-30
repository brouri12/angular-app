# ============================================================
#  Complete DevOps Tools Setup - Master Script
#  Sets up Jenkins, SonarQube, Prometheus, and Grafana
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Wordly DevOps Tools - Complete Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will set up:" -ForegroundColor White
Write-Host "  • Jenkins (CI/CD)" -ForegroundColor Gray
Write-Host "  • SonarQube (Code Quality)" -ForegroundColor Gray
Write-Host "  • Prometheus (Metrics)" -ForegroundColor Gray
Write-Host "  • Grafana (Visualization)" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Continue? (yes/no)"
if ($continue -ne "yes") {
    Write-Host "Setup cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "=========================================="  -ForegroundColor Yellow
Write-Host "  Phase 1: Starting Services" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

.\setup-devops-tools.ps1

Write-Host ""
Write-Host "=========================================="  -ForegroundColor Yellow
Write-Host "  Phase 2: Configuring SonarQube" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$configureSonar = Read-Host "Configure SonarQube now? (yes/no)"
if ($configureSonar -eq "yes") {
    .\configure-sonarqube.ps1
} else {
    Write-Host "[SKIPPED] SonarQube configuration" -ForegroundColor Yellow
    Write-Host "Run later: .\configure-sonarqube.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================="  -ForegroundColor Yellow
Write-Host "  Phase 3: Jenkins Configuration Guide" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$configureJenkins = Read-Host "Show Jenkins configuration guide? (yes/no)"
if ($configureJenkins -eq "yes") {
    .\configure-jenkins.ps1
} else {
    Write-Host "[SKIPPED] Jenkins configuration guide" -ForegroundColor Yellow
    Write-Host "Run later: .\configure-jenkins.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================="  -ForegroundColor Yellow
Write-Host "  Phase 4: Grafana Configuration Guide" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

$configureGrafana = Read-Host "Show Grafana configuration guide? (yes/no)"
if ($configureGrafana -eq "yes") {
    .\configure-grafana.ps1
} else {
    Write-Host "[SKIPPED] Grafana configuration guide" -ForegroundColor Yellow
    Write-Host "Run later: .\configure-grafana.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "All DevOps tools are now running!" -ForegroundColor Green
Write-Host ""

Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  • Jenkins:    http://localhost:8080" -ForegroundColor White
Write-Host "  • SonarQube:  http://localhost:9000" -ForegroundColor White
Write-Host "  • Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  • Grafana:    http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Default Credentials:" -ForegroundColor Cyan
Write-Host "  • Jenkins:   See initial password above" -ForegroundColor White
Write-Host "  • SonarQube: admin / admin" -ForegroundColor White
Write-Host "  • Grafana:   admin / admin" -ForegroundColor White
Write-Host ""

Write-Host "Configuration Files:" -ForegroundColor Cyan
Write-Host "  • SonarQube tokens: sonarqube-tokens.json" -ForegroundColor White
Write-Host "  • Prometheus config: ../prometheus/prometheus.yml" -ForegroundColor White
Write-Host "  • Grafana dashboards: ../grafana/dashboards/" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Complete Jenkins setup wizard (http://localhost:8080)" -ForegroundColor White
Write-Host "2. Login to SonarQube and change password (http://localhost:9000)" -ForegroundColor White
Write-Host "3. Login to Grafana and import dashboards (http://localhost:3000)" -ForegroundColor White
Write-Host "4. Configure Jenkins credentials and create pipeline jobs" -ForegroundColor White
Write-Host "5. Run your first build!" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  • Complete guide: SETUP_GUIDE.md" -ForegroundColor White
Write-Host "  • Troubleshooting: See SETUP_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  • View logs:        docker-compose logs -f <service>" -ForegroundColor Gray
Write-Host "  • Restart service:  docker-compose restart <service>" -ForegroundColor Gray
Write-Host "  • Stop all:         docker-compose down" -ForegroundColor Gray
Write-Host "  • Start all:        docker-compose up -d" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy DevOps! 🚀" -ForegroundColor Green
Write-Host ""
