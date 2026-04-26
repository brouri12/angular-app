# Demarre la plateforme e-learning + SonarQube + monitoring, puis affiche les conteneurs et les URLs.
# Usage : depuis n'importe quel repertoire
#   powershell -ExecutionPolicy Bypass -File "C:\chemin\vers\pi\scripts\devops\START_ALL_DOCKER.ps1"

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $Root

Write-Host "`n=== Docker Compose : stack principale (eureka, mysql, microservices, gateway) ===" -ForegroundColor Cyan
docker compose -f docker-compose.yml up -d

Write-Host "`n=== Docker Compose : SonarQube ===" -ForegroundColor Cyan
docker compose -f docker-compose.sonar.yml up -d

Write-Host "`n=== Docker Compose : monitoring (Prometheus, Grafana, node-exporter) ===" -ForegroundColor Cyan
docker compose -f docker-compose.monitoring.yml up -d

Write-Host "`n=== Conteneurs (nom, image, statut, ports) ===" -ForegroundColor Green
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n=== Acces rapide (hote Windows) ===" -ForegroundColor Green
$gw = if (Test-Path (Join-Path $Root ".env")) {
    $line = Get-Content (Join-Path $Root ".env") -ErrorAction SilentlyContinue | Where-Object { $_ -match '^\s*API_GATEWAY_HOST_PORT\s*=' } | Select-Object -First 1
    if ($line -match '=\s*(\d+)') { $Matches[1] } else { "8080" }
} else { "8080" }

@"

  API Gateway     http://localhost:$gw
  Eureka          http://localhost:8761
  Formation       http://localhost:8081
  Quiz / badges   http://localhost:8082
  Review todos    http://localhost:8091
  Membre          http://localhost:8092
  Recrutement     http://localhost:8093
  Forum           http://localhost:8094
  Evenements      http://localhost:8095
  Club            http://localhost:8089
  Reservation     http://localhost:8083
  Abonnement      http://localhost:8084
  Challenge       http://localhost:8086
  Planification   http://localhost:8087
  User            http://localhost:8100
  Formation simple http://localhost:8101
  Test service    http://localhost:8102
  MySQL e-learning 3307, 3308, 3309 + agrégé Esprit 3310
  SonarQube       http://localhost:9000
  Grafana         http://localhost:3000
  Prometheus UI   http://localhost:9091
  Node exporter   http://localhost:9100/metrics

"@ | Write-Host
