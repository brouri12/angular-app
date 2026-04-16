# Start Game Service with correct Java version
Write-Host "=== Starting Game Service ===" -ForegroundColor Cyan

# Use Java 21
$javaPath = "C:\Program Files\Java\jdk-21"

if (-not (Test-Path $javaPath)) {
    Write-Host "❌ Java 21 not found at $javaPath" -ForegroundColor Red
    exit 1
}

Write-Host "Using Java: $javaPath" -ForegroundColor Green

# Set JAVA_HOME temporarily for this session
$env:JAVA_HOME = $javaPath
$env:PATH = "$javaPath\bin;$env:PATH"

# Verify Java version
Write-Host "`nJava version:" -ForegroundColor Cyan
& "$javaPath\bin\java.exe" -version

Write-Host "`nStarting Maven build..." -ForegroundColor Cyan
mvn clean spring-boot:run
