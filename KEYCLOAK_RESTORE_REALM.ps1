param(
    [string]$Realm = "wordly-realm",
    [string]$KeycloakRoot = "C:\keycloak-23.0.0",
    [string]$BackupRoot = "",
    [string]$SourceDir = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($BackupRoot)) {
    $BackupRoot = Join-Path $PSScriptRoot "backups\keycloak"
}

if ([string]::IsNullOrWhiteSpace($SourceDir)) {
    if (-not (Test-Path $BackupRoot)) {
        throw "No backup directory found: $BackupRoot"
    }
    $latest = Get-ChildItem -Path $BackupRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) {
        throw "No Keycloak backup found in: $BackupRoot"
    }
    $SourceDir = $latest.FullName
}

if (-not (Test-Path $SourceDir)) {
    throw "Backup source directory not found: $SourceDir"
}

function Wait-Url {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$TimeoutSeconds = 120
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($r.StatusCode -eq 200) { return $true }
        } catch {}
        Start-Sleep -Seconds 2
    }
    return $false
}

$kcBat = Join-Path $KeycloakRoot "bin\kc.bat"
if (-not (Test-Path $kcBat)) {
    throw "kc.bat not found: $kcBat"
}

Write-Host "Restoring Keycloak realm from: $SourceDir" -ForegroundColor Cyan

$listeners = Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue
if ($listeners) {
    Write-Host "Stopping Keycloak before import..." -ForegroundColor Yellow
    $listeners | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 3
}

& $kcBat import --dir $SourceDir --override true
if ($LASTEXITCODE -ne 0) {
    throw "Keycloak import failed with exit code $LASTEXITCODE"
}

Write-Host "Starting Keycloak after import..." -ForegroundColor Yellow
$cmd = "$env:KEYCLOAK_ADMIN='admin'; $env:KEYCLOAK_ADMIN_PASSWORD='admin'; cd '$KeycloakRoot'; .\bin\kc.bat start-dev --http-port=9090"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd | Out-Null

if (-not (Wait-Url -Url "http://localhost:9090/realms/$Realm/.well-known/openid-configuration")) {
    Write-Host "Warning: Realm endpoint still unreachable after restore." -ForegroundColor DarkYellow
} else {
    Write-Host "Realm '$Realm' restored and available." -ForegroundColor Green
}
