param(
    [string]$Realm = "wordly-realm",
    [string]$KeycloakRoot = "C:\keycloak-23.0.0",
    [string]$BackupRoot = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($BackupRoot)) {
    $BackupRoot = Join-Path $PSScriptRoot "backups\keycloak"
}

function Wait-Url {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$TimeoutSeconds = 90
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 4
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
        } catch {}
        Start-Sleep -Seconds 2
    }
    return $false
}

if (-not (Test-Path $KeycloakRoot)) {
    throw "Keycloak root not found: $KeycloakRoot"
}

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetDir = Join-Path $BackupRoot "$Realm-$timestamp"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$kcBat = Join-Path $KeycloakRoot "bin\kc.bat"
$keycloakWasRunning = (Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue) -ne $null

if ($keycloakWasRunning) {
    Write-Host "Keycloak running on 9090 -> stopping for consistent export..." -ForegroundColor Yellow
    $listeners = Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue
    if ($listeners) {
        $listeners | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 3
    }
}

Write-Host "Exporting realm '$Realm' to: $targetDir" -ForegroundColor Cyan
& $kcBat export --dir $targetDir --realm $Realm --users realm_file
if ($LASTEXITCODE -ne 0) {
    throw "Keycloak export failed with exit code $LASTEXITCODE"
}

if ($keycloakWasRunning) {
    Write-Host "Restarting Keycloak..." -ForegroundColor Yellow
    $cmd = "$env:KEYCLOAK_ADMIN='admin'; $env:KEYCLOAK_ADMIN_PASSWORD='admin'; cd '$KeycloakRoot'; .\bin\kc.bat start-dev --http-port=9090"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd | Out-Null
    if (-not (Wait-Url -Url "http://localhost:9090/realms/master")) {
        Write-Host "Warning: Keycloak did not come back quickly after export." -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "Backup finished." -ForegroundColor Green
Write-Host "Backup folder: $targetDir" -ForegroundColor Green
