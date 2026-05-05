# Complete build and run script for Game Service with Java 21
# This script will:
# 1. Set Java 21 environment
# 2. Clean build with fresh dependencies
# 3. Run the Spring Boot application

$javaPath = "C:\Program Files\Java\jdk-21"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GAME SERVICE - BUILD & RUN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Check Java 21 installation
if (-not (Test-Path $javaPath)) {
    Write-Host "`n❌ ERROR: Java 21 not found at $javaPath" -ForegroundColor Red
    Write-Host "Please install Java 21 or update the path in this script" -ForegroundColor Yellow
    exit 1
}

# Set environment variables
$env:JAVA_HOME = $javaPath
$env:PATH = "$javaPath\bin;$env:PATH"

Write-Host "`n✓ Java 21 configured" -ForegroundColor Green
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan

# Verify versions
Write-Host "`nJava version:" -ForegroundColor Yellow
java -version

Write-Host "`nMaven version:" -ForegroundColor Yellow
mvn -version

# Clean build
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STEP 1: Clean Build" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
mvn clean install -U -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✓ Build successful!" -ForegroundColor Green

# Run the application
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STEP 2: Starting Application" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Game Service will start on port 9001" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the service`n" -ForegroundColor Yellow

mvn spring-boot:run
