# Push du backend Spring Boot vers https://github.com/brouri12/spring-app.git
# Usage: .\push-backend-spring-app.ps1

$ErrorActionPreference = "Stop"
$piRoot = $PSScriptRoot
$remote = "https://github.com/brouri12/spring-app.git"
$cloneDir = Join-Path $env:TEMP "spring-app-push"

Write-Host "=== Backend Spring Boot -> spring-app ===" -ForegroundColor Cyan
Write-Host ""

# Nettoyer un ancien clone
if (Test-Path $cloneDir) {
    Remove-Item -Recurse -Force $cloneDir
}

Write-Host "[1/4] Clone de $remote ..." -ForegroundColor Yellow
git clone $remote $cloneDir
Set-Location $cloneDir

Write-Host "[2/4] Copie des dossiers et fichiers backend Spring ..." -ForegroundColor Yellow
$backendItems = @(
    "eureka-server",
    "api-gateway",
    "formation-service",
    "quiz-badge-service",
    "simple-formation-service",
    "test-service",
    "Dockerfile.eureka-server",
    "Dockerfile.api-gateway",
    "Dockerfile.formation-service",
    "Dockerfile.quiz-badge-service",
    "docker-compose.yml"
)
foreach ($item in $backendItems) {
    $src = Join-Path $piRoot $item
    if (Test-Path $src) {
        if (Test-Path (Join-Path $cloneDir $item)) { Remove-Item -Recurse -Force (Join-Path $cloneDir $item) -ErrorAction SilentlyContinue }
        Copy-Item -Path $src -Destination $cloneDir -Recurse -Force
        Write-Host "  + $item" -ForegroundColor Gray
    }
}
Copy-Item -Path (Join-Path $piRoot "README-SPRING-BACKEND.md") -Destination (Join-Path $cloneDir "README.md") -Force
Copy-Item -Path (Join-Path $piRoot "MICROSERVICES.md") -Destination $cloneDir -Force -ErrorAction SilentlyContinue
$gitignoreBackend = Join-Path $piRoot ".gitignore-spring-backend"
if (Test-Path $gitignoreBackend) {
    Copy-Item $gitignoreBackend (Join-Path $cloneDir ".gitignore") -Force
}

Write-Host "[3/4] Commit ..." -ForegroundColor Yellow
git config user.email "brouri12@users.noreply.github.com"
git config user.name "brouri12"
git add -A
git status --short
git commit -m "Backend Spring Boot: Eureka, Gateway, Formation, Quiz-Badge, Docker"

Write-Host "[4/4] Push vers origin main ..." -ForegroundColor Yellow
git push -u origin main

Set-Location $piRoot
Write-Host ""
Write-Host "Terminé. Backend disponible sur: $remote" -ForegroundColor Green
