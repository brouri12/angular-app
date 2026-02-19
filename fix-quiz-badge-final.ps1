# Script de correction finale pour quiz-badge-service
Write-Host "🔧 CORRECTION FINALE QUIZ-BADGE-SERVICE" -ForegroundColor Green

# Arrêter le service actuel
Write-Host "Arrêt du service quiz-badge-service..." -ForegroundColor Yellow
Stop-Process -Name java -Force -ErrorAction SilentlyContinue

# Nettoyer et recompiler
Write-Host "Nettoyage et recompilation..." -ForegroundColor Yellow
Set-Location quiz-badge-service
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

# Compilation propre
.\mvnw.cmd clean compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de compilation" -ForegroundColor Red
    exit 1
}

# Création du jar
Write-Host "Création du JAR..." -ForegroundColor Yellow
.\mvnw.cmd package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de création du JAR" -ForegroundColor Red
    exit 1
}

# Démarrage du service
Write-Host "Démarrage du service..." -ForegroundColor Yellow
java -jar target/quiz-badge-service-1.0.0.jar

Write-Host "✅ Service quiz-badge-service démarré!" -ForegroundColor Green
