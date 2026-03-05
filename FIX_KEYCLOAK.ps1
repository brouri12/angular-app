# Script pour Reparer Keycloak
Write-Host ""
Write-Host "========================================"
Write-Host "REPARATION KEYCLOAK"
Write-Host "========================================"
Write-Host ""

$keycloakPath = "C:\keycloak-23.0.0"
$dbPath = "$keycloakPath\data\h2"

Write-Host "ATTENTION: Suppression de la base de donnees" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Continuer? (O/N)"
if ($continue -ne "O" -and $continue -ne "o") {
    exit 0
}

Write-Host ""
Write-Host "Arret de Keycloak..." -ForegroundColor Yellow
$proc = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($proc) {
    Stop-Process -Id $proc.OwningProcess -Force
    Start-Sleep -Seconds 3
    Write-Host "OK" -ForegroundColor Green
}

Write-Host "Suppression base de donnees..." -ForegroundColor Yellow
if (Test-Path $dbPath) {
    Remove-Item -Path "$dbPath\*" -Force -Recurse
    Write-Host "OK" -ForegroundColor Green
}

Write-Host "Redemarrage..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$keycloakPath'; bin\kc.bat start-dev --http-port=9090"
Write-Host "OK - Keycloak demarre dans une nouvelle fenetre" -ForegroundColor Green
Write-Host ""
Write-Host "Attendez 30 secondes puis configurez Keycloak"
Write-Host "http://localhost:9090"
Write-Host ""
