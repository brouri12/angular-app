#!/usr/bin/env pwsh

# SCRIPT DE VÉRIFICATION SIMPLE - MICROSERVICES SPRING BOOT E-LEARNING
# Version: 1.0 (PowerShell)

# Configuration
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$SERVICES = @("api-gateway", "eureka-server", "formation-service", "quiz-badge-service")

# Configuration Java
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Verification des microservices..." -ForegroundColor Cyan
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow

$TOTAL_CHECKS = 0
$SUCCESS_COUNT = 0

foreach ($service in $SERVICES) {
    Write-Host "`nVerification de $service..." -ForegroundColor Magenta
    $servicePath = "$PROJECT_ROOT\$service"
    
    if (Test-Path "$servicePath\pom.xml") {
        $TOTAL_CHECKS++
        Write-Host "  Compilation de $service..." -ForegroundColor Yellow
        
        try {
            Push-Location $servicePath
            $output = & .\mvnw.cmd clean compile 2>&1
            $exitCode = $LASTEXITCODE
            Pop-Location
            
            if ($exitCode -eq 0) {
                Write-Host "  ✅ BUILD SUCCESS: $service" -ForegroundColor Green
                $SUCCESS_COUNT++
            } else {
                Write-Host "  ❌ BUILD FAILED: $service" -ForegroundColor Red
                Write-Host "    Error: $output" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ❌ BUILD FAILED: $service" -ForegroundColor Red
            Write-Host "    Exception: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ pom.xml not found in $service" -ForegroundColor Red
        $TOTAL_CHECKS++
    }
}

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Total vérifications: $TOTAL_CHECKS" -ForegroundColor White
Write-Host "Succès: $SUCCESS_COUNT" -ForegroundColor Green
Write-Host "Échecs: $($TOTAL_CHECKS - $SUCCESS_COUNT)" -ForegroundColor Red

if ($SUCCESS_COUNT -eq $TOTAL_CHECKS) {
    Write-Host "`n🎉 Tous les services compilent avec succès!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Certains services ont des erreurs de compilation." -ForegroundColor Yellow
}

Write-Host "`nProchaines étapes:" -ForegroundColor Yellow
Write-Host "1. Démarrer Eureka Server (port 8761)" -ForegroundColor White
Write-Host "2. Démarrer les microservices (formation, quiz-badge)" -ForegroundColor White
Write-Host "3. Démarrer API Gateway (port 8080)" -ForegroundColor White
