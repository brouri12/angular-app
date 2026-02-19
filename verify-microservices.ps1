#!/usr/bin/env pwsh

# SCRIPT DE VÉRIFICATION - ARCHITECTURE MICROSERVICES SPRING BOOT E-LEARNING
# Version: 1.0 (PowerShell)
# Description: Vérification complète de l'architecture microservices

# ============================================================================
# CONFIGURATION
# ============================================================================
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = $SCRIPT_DIR
$REPORT_FILE = "$PROJECT_ROOT\verification-report.txt"
$START_TIME = Get-Date

# Compteurs
$TOTAL_CHECKS = 0
$SUCCESS_COUNT = 0
$FAIL_COUNT = 0
$SKIP_COUNT = 0

# Options
$VERBOSE = $false
$SKIP_DB = $false
$SKIP_MAVEN = $false

# Microservices
$SERVICES = @("api-gateway", "eureka-server", "formation-service", "quiz-badge-service")

# Configuration Java
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Fonctions utilitaires
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Check-Condition {
    param([bool]$Condition, [string]$SuccessMsg, [string]$FailMsg)
    $script:TOTAL_CHECKS++
    if ($Condition) {
        Write-ColorOutput "  ✅ $SuccessMsg" "Green"
        $script:SUCCESS_COUNT++
    } else {
        Write-ColorOutput "  ❌ $FailMsg" "Red"
        $script:FAIL_COUNT++
    }
}

function Test-ServiceBuild {
    param([string]$Service)
    Write-ColorOutput "Compilation de $Service..." "Yellow"
    $servicePath = "$PROJECT_ROOT\$Service"
    
    if (Test-Path "$servicePath\pom.xml") {
        try {
            Push-Location $servicePath
            $output = & .\mvnw.cmd clean compile 2>&1
            $exitCode = $LASTEXITCODE
            Pop-Location
            
            if ($exitCode -eq 0) {
                Check-Condition $true "BUILD SUCCESS: $Service" "BUILD FAILED: $Service"
            } else {
                Check-Condition $false "BUILD SUCCESS: $Service" "BUILD FAILED: $Service"
                if ($VERBOSE) {
                    Write-ColorOutput "    Erreur: $output" "Red"
                }
            }
        } catch {
            Check-Condition $false "BUILD SUCCESS: $Service" "BUILD FAILED: $Service"
            Write-ColorOutput "    Exception: $($_.Exception.Message)" "Red"
        }
    } else {
        Check-Condition $false "pom.xml exists in $Service" "pom.xml not found in $Service"
    }
}

# ============================================================================
# VÉRIFICATION
# ============================================================================

Write-ColorOutput @"
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ██╗   ██╗███████╗██████╗ ██╗███████╗██╗   ██╗                      ║
║   ██║   ██║██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝                      ║
║   ██║   ██║█████╗  ██████╔╝██║█████╗   ╚████╔╝                       ║
║   ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝    ╚██╔╝                        ║
║    ╚████╔╝ ███████╗██║  ██║██║██║        ██║                         ║
║     ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝                         ║
║                                                                      ║
║   Microservices Spring Boot E-Learning - Vérification Complète       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
"@ "Cyan"

Write-ColorOutput "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Démarrage de la vérification..." "White"

# ÉTAPE 1: STRUCTURE DES DOSSIERS
Write-ColorOutput "`n📁 ÉTAPE 1: STRUCTURE DES DOSSIERS" "Magenta"
Write-ColorOutput "────────────────────────────────────────────────────────────────" "Gray"

foreach ($service in $SERVICES) {
    $servicePath = "$PROJECT_ROOT\$service"
    Check-Condition (Test-Path $servicePath) "Dossier $service existe" "Dossier $service manquant"
    
    if (Test-Path $servicePath) {
        Check-Condition (Test-Path "$servicePath\src\main\java") "Structure Maven src/main/java dans $service" "Structure Maven src/main/java manquante dans $service"
        Check-Condition (Test-Path "$servicePath\src\main\resources") "Structure Maven src/main/resources dans $service" "Structure Maven src/main/resources manquante dans $service"
        Check-Condition (Test-Path "$servicePath\src\test\java") "Structure Maven src/test/java dans $service" "Structure Maven src/test/java manquante dans $service"
        Check-Condition (Test-Path "$servicePath\pom.xml") "pom.xml dans $service" "pom.xml manquant dans $service"
        
        # Vérification des packages spécifiques
        if ($service -in @("formation-service", "quiz-badge-service")) {
            Check-Condition (Test-Path "$servicePath\src\main\java\com\elearning\$service.Replace('-service','')\entity") "Package model/entity dans $service" "Package model/entity manquant dans $service"
            Check-Condition (Test-Path "$servicePath\src\main\java\com\elearning\$service.Replace('-service','')\repository") "Package repository/ dans $service" "Package repository/ manquant dans $service"
            Check-Condition (Test-Path "$servicePath\src\main\java\com\elearning\$service.Replace('-service','')\service") "Package service/ dans $service" "Package service/ manquant dans $service"
            Check-Condition (Test-Path "$servicePath\src\main\java\com\elearning\$service.Replace('-service','')\controller") "Package controller/ dans $service" "Package controller/ manquant dans $service"
            Check-Condition (Test-Path "$servicePath\src\main\java\com\elearning\$service.Replace('-service','')\dto") "Package dto/ dans $service" "Package dto/ manquant dans $service"
        }
    }
}

# ÉTAPE 10: COMPILATION MAVEN
if (-not $SKIP_MAVEN) {
    Write-ColorOutput "`n🚀 ÉTAPE 10: COMPILATION MAVEN" "Magenta"
    Write-ColorOutput "────────────────────────────────────────────────────────────────" "Gray"
    
    foreach ($service in $SERVICES) {
        Test-ServiceBuild $service
    }
}

# RAPPORT FINAL
$END_TIME = Get-Date
$DURATION = $END_TIME - $START_TIME

Write-ColorOutput "`n✅ ÉTAPE 15: RAPPORT FINAL" "Magenta"
Write-ColorOutput "════════════════════════════════════════════════════════════════" "Gray"

Write-ColorOutput @"
┌─────────────────────────────────────────────────────────┐
│              RÉSUMÉ DE LA VÉRIFICATION                    │
├─────────────────────────────────────────────────────────┤
│  Total vérifications:    $TOTAL_CHECKS                     │
│  Succès:               $SUCCESS_COUNT                     │
│  Échecs:               $FAIL_COUNT                       │
│  Ignorés:              $SKIP_COUNT                       │
│  Pourcentage complétion: $([math]::Round(($SUCCESS_COUNT/$TOTAL_CHECKS)*100)) %                          │
│  Temps d'exécution:      $($DURATION.TotalSeconds)  secondes                     │
└─────────────────────────────────────────────────────────┘
"@ -Color White

if ($FAIL_COUNT -gt 0) {
    Write-ColorOutput "`n❌ PROBLÈMES TROUVÉS:" "Red"
    # Les problèmes seraient listés ici
}

Write-ColorOutput "`n📋 PROCHAINES ÉTAPES:" "Yellow"
Write-ColorOutput "  1. Corriger les problèmes identifiés ci-dessus" "White"
Write-ColorOutput "  2. Démarrer Eureka Server (port 8761)" "White"
Write-ColorOutput "  3. Démarrer les microservices (formation, quiz-badge)" "White"
Write-ColorOutput "  4. Démarrer API Gateway (port 8080)" "White"
Write-ColorOutput "  5. Tester les endpoints via l'API Gateway" "White"

Write-ColorOutput "`n[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Vérification terminée." "Green"
