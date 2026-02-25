# Script de nettoyage forcé de Keycloak

Write-Host "=== Nettoyage Forcé de Keycloak ===" -ForegroundColor Red
Write-Host ""

# Étape 1: Tuer TOUS les processus Java plusieurs fois
Write-Host "Étape 1: Arrêt forcé de tous les processus Java..." -ForegroundColor Yellow
for ($i = 1; $i -le 3; $i++) {
    Write-Host "  Tentative $i/3..." -ForegroundColor Gray
    taskkill /IM java.exe /F /T 2>$null
    Start-Sleep -Seconds 2
}

# Étape 2: Vérifier les processus restants
Write-Host "Étape 2: Vérification des processus Java restants..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "  Processus Java détectés, arrêt forcé..." -ForegroundColor Red
    $javaProcesses | Stop-Process -Force
    Start-Sleep -Seconds 3
} else {
    Write-Host "  Aucun processus Java détecté" -ForegroundColor Green
}

# Étape 3: Libérer le port 9090
Write-Host "Étape 3: Libération du port 9090..." -ForegroundColor Yellow
$connections = netstat -ano | Select-String ":9090"
if ($connections) {
    Write-Host "  Port 9090 utilisé, nettoyage..." -ForegroundColor Red
    foreach ($line in $connections) {
        $parts = $line -split '\s+'
        $pid = $parts[-1]
        if ($pid -match '^\d+$') {
            Write-Host "  Arrêt du processus PID: $pid" -ForegroundColor Gray
            taskkill /PID $pid /F /T 2>$null
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  Port 9090 libre" -ForegroundColor Green
}

# Étape 4: Attendre que tout se libère
Write-Host "Étape 4: Attente de libération des ressources..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Étape 5: Aller dans le dossier Keycloak
Write-Host "Étape 5: Navigation vers Keycloak..." -ForegroundColor Yellow
Set-Location C:\keycloak-23.0.0

# Étape 6: Supprimer les fichiers de verrouillage H2
Write-Host "Étape 6: Suppression des fichiers de verrouillage..." -ForegroundColor Yellow
if (Test-Path "data\h2") {
    Get-ChildItem -Path "data\h2" -Filter "*.lock" -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path "data\h2" -Filter "*.trace.db" -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  Fichiers de verrouillage supprimés" -ForegroundColor Green
}

# Étape 7: Supprimer complètement le dossier data
Write-Host "Étape 7: Suppression complète du dossier data..." -ForegroundColor Yellow
$maxAttempts = 5
$attempt = 0
$deleted = $false

while (-not $deleted -and $attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "  Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        if (Test-Path "data") {
            Remove-Item -Path "data" -Recurse -Force -ErrorAction Stop
            Write-Host "  Dossier 'data' supprimé avec succès" -ForegroundColor Green
            $deleted = $true
        } else {
            Write-Host "  Dossier 'data' n'existe pas" -ForegroundColor Green
            $deleted = $true
        }
    } catch {
        Write-Host "  Échec, nouvelle tentative..." -ForegroundColor Red
        Start-Sleep -Seconds 2
    }
}

if (-not $deleted) {
    Write-Host "  ATTENTION: Impossible de supprimer le dossier data" -ForegroundColor Red
    Write-Host "  Essayez de redémarrer votre ordinateur" -ForegroundColor Red
    exit 1
}

# Étape 8: Supprimer standalone si existe
Write-Host "Étape 8: Nettoyage du dossier standalone..." -ForegroundColor Yellow
if (Test-Path "standalone") {
    Remove-Item -Path "standalone" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Dossier 'standalone' supprimé" -ForegroundColor Green
}

# Étape 9: Attendre un peu
Write-Host "Étape 9: Attente finale..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Étape 10: Définir les variables d'environnement
Write-Host "Étape 10: Configuration des credentials..." -ForegroundColor Yellow
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
Write-Host "  Admin: admin / admin" -ForegroundColor Green

# Étape 11: Démarrer Keycloak
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Démarrage de Keycloak..." -ForegroundColor Green
Write-Host "URL: http://localhost:9090" -ForegroundColor Green
Write-Host "Admin: admin / admin" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Attendez 'Listening on: http://0.0.0.0:9090'" -ForegroundColor Yellow
Write-Host ""

.\bin\kc.bat start-dev --http-port=9090
