# Lance Eureka + API Gateway puis ouvre les URLs pour VOIR l'API Gateway
# Usage: .\start-gateway.ps1

$ErrorActionPreference = "Stop"
$piRoot = $PSScriptRoot

Set-Location $piRoot

# Liberer les ports 8761 et 8080
foreach ($p in @(8761, 8080)) {
  $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($conn) {
    $conn | ForEach-Object {
      $procId = $_.OwningProcess
      $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
      if ($proc) {
        Write-Host "  Arret du processus sur port $p (PID $procId)" -ForegroundColor Gray
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
    }
  }
}
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Demarrage Eureka + API Gateway" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Eureka (obligatoire avant la Gateway)
Write-Host "[1/2] Eureka Server (port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot\eureka-server'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 18

# 2. API Gateway
Write-Host "[2/2] API Gateway (port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot\api-gateway'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 12

# Ouvrir dans le navigateur : Eureka + Actuator Gateway (voir les routes)
Write-Host "Ouverture des pages dans le navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:8761"
Start-Sleep -Seconds 1
Start-Process "http://localhost:8080/actuator/gateway/routes"
Start-Sleep -Seconds 1
Start-Process "http://localhost:8080/actuator/health"
Start-Sleep -Seconds 1
Start-Process "http://localhost:8080/api/ping"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  API Gateway demarree." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Eureka (services enregistres) : http://localhost:8761" -ForegroundColor White
Write-Host "  Routes de la Gateway           : http://localhost:8080/actuator/gateway/routes" -ForegroundColor White
Write-Host "  Sante Gateway                  : http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host "  Test API via Gateway (ping)    : http://localhost:8080/api/ping" -ForegroundColor White
Write-Host ""
Write-Host "  Pour que /api/students, /api/courses etc. repondent," -ForegroundColor Gray
Write-Host "  demarre aussi le backend Node (port 8083) : node xampp-mysql-dashboard.js" -ForegroundColor Gray
Write-Host ""
