# ============================================================
#  Configure Grafana - Setup Dashboards and Datasources
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Grafana Configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$GRAFANA_URL = "http://localhost:3000"
$GRAFANA_USER = "admin"
$GRAFANA_PASS = "admin"

Write-Host "Step 1: Checking Grafana availability..." -ForegroundColor Yellow
Write-Host "-----------------------------------------"
Write-Host ""

$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "$GRAFANA_URL/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $ready = $true
            Write-Host "[OK] Grafana is ready" -ForegroundColor Green
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
    Write-Host "[ERROR] Grafana is not responding" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Grafana Setup Instructions" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host ""

Write-Host "1. Open Grafana: $GRAFANA_URL" -ForegroundColor White
Write-Host ""
Write-Host "2. Login with:" -ForegroundColor White
Write-Host "   Username: $GRAFANA_USER" -ForegroundColor Gray
Write-Host "   Password: $GRAFANA_PASS" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Change password when prompted" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Verify Datasource" -ForegroundColor Yellow
Write-Host "-------------------------"
Write-Host ""

Write-Host "Prometheus datasource should be auto-configured:" -ForegroundColor White
Write-Host "  • Name: Prometheus" -ForegroundColor Gray
Write-Host "  • Type: Prometheus" -ForegroundColor Gray
Write-Host "  • URL: http://prometheus:9090" -ForegroundColor Gray
Write-Host "  • Access: Server (default)" -ForegroundColor Gray
Write-Host ""
Write-Host "To verify:" -ForegroundColor White
Write-Host "  1. Go to Configuration → Data Sources" -ForegroundColor Gray
Write-Host "  2. Click on 'Prometheus'" -ForegroundColor Gray
Write-Host "  3. Click 'Test' button" -ForegroundColor Gray
Write-Host "  4. Should see 'Data source is working'" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 4: Import Dashboards" -ForegroundColor Yellow
Write-Host "-------------------------"
Write-Host ""

Write-Host "A. Wordly Platform Overview (Pre-configured)" -ForegroundColor Cyan
Write-Host "   • Should be automatically available" -ForegroundColor Gray
Write-Host "   • Go to Dashboards → Browse" -ForegroundColor Gray
Write-Host "   • Look for 'Wordly Platform Overview'" -ForegroundColor Gray
Write-Host ""

Write-Host "B. Import Community Dashboards" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. JVM (Micrometer) Dashboard:" -ForegroundColor White
Write-Host "      • Click '+' → Import" -ForegroundColor Gray
Write-Host "      • Dashboard ID: 4701" -ForegroundColor Gray
Write-Host "      • Select Prometheus datasource" -ForegroundColor Gray
Write-Host "      • Click Import" -ForegroundColor Gray
Write-Host ""

Write-Host "   2. Node Exporter Full:" -ForegroundColor White
Write-Host "      • Dashboard ID: 1860" -ForegroundColor Gray
Write-Host "      • Shows system metrics" -ForegroundColor Gray
Write-Host ""

Write-Host "   3. Spring Boot Statistics:" -ForegroundColor White
Write-Host "      • Dashboard ID: 6756" -ForegroundColor Gray
Write-Host "      • Shows Spring Boot metrics" -ForegroundColor Gray
Write-Host ""

Write-Host "   4. Docker Container & Host Metrics:" -ForegroundColor White
Write-Host "      • Dashboard ID: 179" -ForegroundColor Gray
Write-Host "      • Shows Docker metrics from cAdvisor" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 5: Create Custom Dashboard" -ForegroundColor Yellow
Write-Host "--------------------------------"
Write-Host ""

Write-Host "Create a dashboard for your microservices:" -ForegroundColor White
Write-Host ""
Write-Host "1. Click '+' → Dashboard" -ForegroundColor Gray
Write-Host "2. Add panel" -ForegroundColor Gray
Write-Host "3. Select Prometheus datasource" -ForegroundColor Gray
Write-Host "4. Enter query (examples below)" -ForegroundColor Gray
Write-Host "5. Configure visualization" -ForegroundColor Gray
Write-Host "6. Save dashboard" -ForegroundColor Gray
Write-Host ""

Write-Host "Useful Prometheus Queries:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Request Rate:" -ForegroundColor White
Write-Host "  rate(http_server_requests_seconds_count[5m])" -ForegroundColor Gray
Write-Host ""
Write-Host "Response Time (95th percentile):" -ForegroundColor White
Write-Host "  histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))" -ForegroundColor Gray
Write-Host ""
Write-Host "Error Rate:" -ForegroundColor White
Write-Host "  rate(http_server_requests_seconds_count{status=~`"5..`"}[5m])" -ForegroundColor Gray
Write-Host ""
Write-Host "JVM Memory:" -ForegroundColor White
Write-Host "  jvm_memory_used_bytes" -ForegroundColor Gray
Write-Host ""
Write-Host "CPU Usage:" -ForegroundColor White
Write-Host "  rate(process_cpu_seconds_total[5m])" -ForegroundColor Gray
Write-Host ""
Write-Host "Database Connections:" -ForegroundColor White
Write-Host "  hikaricp_connections_active" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 6: Configure Alerts (Optional)" -ForegroundColor Yellow
Write-Host "------------------------------------"
Write-Host ""

Write-Host "Set up alerts for critical metrics:" -ForegroundColor White
Write-Host ""
Write-Host "1. Edit a panel" -ForegroundColor Gray
Write-Host "2. Go to Alert tab" -ForegroundColor Gray
Write-Host "3. Create alert rule" -ForegroundColor Gray
Write-Host "4. Set conditions (e.g., error rate > 5%)" -ForegroundColor Gray
Write-Host "5. Configure notification channel" -ForegroundColor Gray
Write-Host "6. Save" -ForegroundColor Gray
Write-Host ""

Write-Host "Example Alert Conditions:" -ForegroundColor Cyan
Write-Host "  • Error rate > 5% for 5 minutes" -ForegroundColor Gray
Write-Host "  • Response time > 1s for 5 minutes" -ForegroundColor Gray
Write-Host "  • Service down for 1 minute" -ForegroundColor Gray
Write-Host "  • Memory usage > 90%" -ForegroundColor Gray
Write-Host "  • CPU usage > 80% for 10 minutes" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Configuration Guide Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Quick Access:" -ForegroundColor Cyan
Write-Host "  • Grafana: $GRAFANA_URL" -ForegroundColor White
Write-Host "  • Username: $GRAFANA_USER" -ForegroundColor White
Write-Host "  • Password: $GRAFANA_PASS (change on first login)" -ForegroundColor White
Write-Host ""

Write-Host "Recommended Dashboards to Import:" -ForegroundColor Yellow
Write-Host "  • 4701 - JVM (Micrometer)" -ForegroundColor White
Write-Host "  • 1860 - Node Exporter Full" -ForegroundColor White
Write-Host "  • 6756 - Spring Boot Statistics" -ForegroundColor White
Write-Host "  • 179 - Docker Container Metrics" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Login to Grafana" -ForegroundColor White
Write-Host "2. Change default password" -ForegroundColor White
Write-Host "3. Verify Prometheus datasource" -ForegroundColor White
Write-Host "4. Import recommended dashboards" -ForegroundColor White
Write-Host "5. Create custom dashboards" -ForegroundColor White
Write-Host "6. Set up alerts" -ForegroundColor White
Write-Host ""
