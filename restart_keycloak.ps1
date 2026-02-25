# Script de Redémarrage Sécurisé de Keycloak

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REDEMARRAGE KEYCLOAK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Trouver le processus Keycloak
Write-Host "Recherche du processus Keycloak..." -ForegroundColor Yellow

$keycloakProcess = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue | Select-Object -First 1

if ($keycloakProcess) {
    $pid = $keycloakProcess.OwningProcess
    Write-Host "✅ Keycloak trouve (PID: $pid)" -ForegroundColor Green
    Write-Host ""
    
    # Étape 2: Arrêter proprement
    Write-Host "Arret de Keycloak..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $pid -Force
        Start-Sleep -Seconds 3
        Write-Host "✅ Keycloak arrete" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de l'arret: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  Keycloak n'est pas en cours d'execution" -ForegroundColor Gray
}

Write-Host ""

# Étape 3: Redémarrer
Write-Host "Redemarrage de Keycloak..." -ForegroundColor Yellow
Write-Host ""

$keycloakPath = "C:\keycloak-23.0.0"

if (-not (Test-Path $keycloakPath)) {
    Write-Host "❌ Keycloak introuvable dans: $keycloakPath" -ForegroundColor Red
    Write-Host ""
    $customPath = Read-Host "Entrez le chemin vers Keycloak"
    $keycloakPath = $customPath
}

Write-Host "Demarrage depuis: $keycloakPath" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Une nouvelle fenetre va s'ouvrir avec Keycloak" -ForegroundColor Yellow
Write-Host "Ne fermez pas cette fenetre!" -ForegroundColor Yellow
Write-Host ""

try {
    # Démarrer Keycloak dans une nouvelle fenêtre
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$keycloakPath'; bin\kc.bat start-dev --http-port=9090"
    
    Write-Host "✅ Keycloak demarre dans une nouvelle fenetre" -ForegroundColor Green
    Write-Host ""
    Write-Host "Attente du demarrage (30 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Vérifier que Keycloak est accessible
    Write-Host "Verification de Keycloak..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:9090/realms/wordly-realm" -Method GET -TimeoutSec 5
        Write-Host "✅ Keycloak est accessible!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "REDEMARRAGE REUSSI!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Keycloak: http://localhost:9090" -ForegroundColor Cyan
        Write-Host "Login: admin / admin" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "⚠️  Keycloak demarre mais n'est pas encore pret" -ForegroundColor Yellow
        Write-Host "Attendez quelques secondes et verifiez: http://localhost:9090" -ForegroundColor Gray
        Write-Host ""
    }
    
} catch {
    Write-Host "❌ Erreur lors du demarrage: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Demarrage manuel:" -ForegroundColor Yellow
    Write-Host "cd $keycloakPath" -ForegroundColor Gray
    Write-Host "bin\kc.bat start-dev --http-port=9090" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
