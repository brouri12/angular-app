# Set JAVA_HOME to Java 21
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "C:\Program Files\Java\jdk-21\bin;$env:PATH"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLEAN BUILD WITH JAVA 21" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nUsing Java version:" -ForegroundColor Yellow
java -version

Write-Host "`nUsing Maven version:" -ForegroundColor Yellow
mvn -version

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STEP 1: Cleaning project..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
mvn clean

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STEP 2: Installing with fresh dependencies..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
mvn install -U -DskipTests

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
