# Lance TOUT : Eureka + microservices (formation, quiz-badge, gateway) + backend Node + ouvre les interfaces
# Usage: .\start-all-complete.ps1
# Libere d'abord les ports 8761, 8080, 8081, 8082, 8083 pour eviter "Port already in use".

$ErrorActionPreference = "Stop"
$piRoot = $PSScriptRoot
$PORT_NODE = 8083
$ports = @(8761, 8080, 8081, 8082, $PORT_NODE)

Set-Location $piRoot

# Important : servir le back-office Angular depuis ce dossier
$env:BACK_OFFICE_DIST = (Join-Path $piRoot 'back-office')

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  E-Learning - Demarrage complet (Eureka + Microservices + Node)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 0. Liberer les ports pour eviter "Port already in use"
Write-Host "[0/6] Liberation des ports (8761, 8080, 8081, 8082, $PORT_NODE)..." -ForegroundColor Yellow
foreach ($p in $ports) {
  $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($conn) {
    $conn | ForEach-Object {
      $procId = $_.OwningProcess
      $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
      if ($proc) {
        Write-Host "  Arret du processus sur port $p (PID $procId - $($proc.ProcessName))" -ForegroundColor Gray
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
    }
  }
}
Start-Sleep -Seconds 2

# 1. Eureka (doit demarrer en premier)
Write-Host "[1/6] Eureka Server (port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot\eureka-server'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 18

# 2. Formation-service
Write-Host "[2/6] Formation Service (port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot\formation-service'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 3

# 3. Quiz-badge-service
Write-Host "[3/6] Quiz-Badge Service (port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot\quiz-badge-service'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 3

# 4. API Gateway
Write-Host "[4/6] API Gateway (port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot\api-gateway'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 8

# 5. Backend Node (API + front/back-office)
Write-Host "[5/6] Backend Node (port $PORT_NODE)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot'; node xampp-mysql-dashboard.js"
Start-Sleep -Seconds 5

# 6. Ouvrir les interfaces dans le navigateur
Write-Host "[6/6] Ouverture des interfaces..." -ForegroundColor Yellow
Start-Process "http://localhost:8761"
Start-Sleep -Seconds 1
Start-Process "http://localhost:$PORT_NODE/back-office/"
Start-Sleep -Seconds 1
Start-Process "http://localhost:$PORT_NODE/front-office/student.html"
Start-Sleep -Seconds 1
Start-Process "http://localhost:$PORT_NODE/front-office/teacher.html"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Tous les services sont en cours de demarrage." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Eureka          : http://localhost:8761" -ForegroundColor White
Write-Host "  API Gateway     : http://localhost:8080" -ForegroundColor White
Write-Host "  Formation       : http://localhost:8081" -ForegroundColor White
Write-Host "  Quiz-Badge      : http://localhost:8082" -ForegroundColor White
Write-Host "  Backend Node    : http://localhost:$PORT_NODE" -ForegroundColor White
Write-Host "  Front Étudiant  : http://localhost:$PORT_NODE/front-office/student.html" -ForegroundColor White
Write-Host "  Front Enseignant: http://localhost:$PORT_NODE/front-office/teacher.html" -ForegroundColor White
Write-Host "  Back-office     : http://localhost:$PORT_NODE/back-office/" -ForegroundColor White
Write-Host ""
Write-Host "  Chaque service tourne dans une fenetre PowerShell separee." -ForegroundColor Gray
Write-Host "  Pour tout arreter : fermez chaque fenetre ou faites Ctrl+C." -ForegroundColor Gray
Write-Host ""
