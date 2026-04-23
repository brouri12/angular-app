# Lance le backend (Node API + serveur des pages) et ouvre le front dans le navigateur
# Usage: .\start-all.ps1

$piRoot = $PSScriptRoot
$PORT = 8083

Set-Location $piRoot

# Important : servir le back-office Angular depuis ce dossier
$env:BACK_OFFICE_DIST = (Join-Path $piRoot 'back-office')

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  E-Learning - Backend + Front" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Démarrer le backend (API + front-office + back-office servis par le même serveur)
Write-Host "[1/2] Demarrage du backend (API + pages) sur le port $PORT..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot'; node xampp-mysql-dashboard.js"

Start-Sleep -Seconds 4

Write-Host "[2/2] Ouverture du front dans le navigateur..." -ForegroundColor Yellow
$frontOffice = "http://localhost:$PORT/front-office/"
$backOffice  = "http://localhost:$PORT/back-office/"
Start-Process $backOffice
Start-Sleep -Seconds 1
Start-Process $frontOffice

Write-Host ""
Write-Host "  Backend (API) : http://localhost:$PORT" -ForegroundColor Green
Write-Host "  Back-office   : $backOffice" -ForegroundColor Green
Write-Host "  Front-office  : $frontOffice" -ForegroundColor Green
Write-Host ""
Write-Host "  Test API      : http://localhost:$PORT/api/ping" -ForegroundColor Gray
Write-Host ""
