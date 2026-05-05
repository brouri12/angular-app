# Start Game Service (JDK 17)
Write-Host "=== Starting Game Service (port 8077) ===" -ForegroundColor Cyan

# Use JDK 17 — adjust path if yours differs
$javaPath = "C:\Users\hsaya\.jdks\ms-17.0.14"

if (-not (Test-Path $javaPath)) {
    # Fallback: try system JAVA_HOME
    Write-Host "JDK 17 not found at $javaPath, using system JAVA_HOME" -ForegroundColor Yellow
} else {
    $env:JAVA_HOME = $javaPath
    $env:PATH = "$javaPath\bin;$env:PATH"
    Write-Host "Using Java: $javaPath" -ForegroundColor Green
}

# Verify Java version
Write-Host "`nJava version:" -ForegroundColor Cyan
java -version

Write-Host "`nStarting Game Service on port 8077..." -ForegroundColor Cyan
mvn spring-boot:run
