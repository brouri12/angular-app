# Fix Keycloak H2 Database Lock Issue

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Keycloak Database Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$keycloakPath = "C:\keycloak-23.0.0"
$dbPath = "$keycloakPath\data\h2"

Write-Host "Step 1: Stopping any running Keycloak processes..." -ForegroundColor Yellow
$keycloakProcesses = Get-Process | Where-Object { $_.ProcessName -like "*java*" -and $_.CommandLine -like "*keycloak*" }
if ($keycloakProcesses) {
    foreach ($proc in $keycloakProcesses) {
        Write-Host "  Stopping process $($proc.Id)..." -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Processes stopped" -ForegroundColor Green
} else {
    Write-Host "  No Keycloak processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 2: Removing database lock files..." -ForegroundColor Yellow

# Remove lock files
$lockFiles = @(
    "$dbPath\keycloakdb.lock.db",
    "$dbPath\keycloakdb.trace.db",
    "$dbPath\*.lock"
)

foreach ($pattern in $lockFiles) {
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    if ($files) {
        foreach ($file in $files) {
            Write-Host "  Removing: $($file.Name)" -ForegroundColor Yellow
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "  ✓ Lock files removed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Checking database file..." -ForegroundColor Yellow
$dbFile = "$dbPath\keycloakdb.mv.db"
if (Test-Path $dbFile) {
    $fileSize = (Get-Item $dbFile).Length
    Write-Host "  Database file exists: $([math]::Round($fileSize/1MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "  Database file not found - will be created on first start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can start Keycloak:" -ForegroundColor Cyan
Write-Host "  cd C:\keycloak-23.0.0" -ForegroundColor White
Write-Host "  bin\kc.bat start-dev --http-port=9090" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
