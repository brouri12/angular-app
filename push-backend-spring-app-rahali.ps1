# Push du backend Spring Boot vers la branche "rahali" de https://github.com/brouri12/spring-app.git
# Usage: .\push-backend-spring-app-rahali.ps1

$ErrorActionPreference = "Stop"
$piRoot = $PSScriptRoot
$remote = "https://github.com/brouri12/spring-app.git"
$branch = "rahali"
$cloneDir = Join-Path $env:TEMP "spring-app-push-rahali"

Write-Host "=== Backend Spring Boot -> spring-app (branche: $branch) ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $cloneDir) {
    Remove-Item -Recurse -Force $cloneDir
}

Write-Host "[1/5] Clone de $remote ..." -ForegroundColor Yellow
git clone $remote $cloneDir
Set-Location $cloneDir

Write-Host "[2/5] Passage sur la branche $branch ..." -ForegroundColor Yellow
cmd /c "git fetch origin"
cmd /c "git checkout $branch"
if ($LASTEXITCODE -ne 0) {
    cmd /c "git checkout -b $branch"
}

Write-Host "[3/5] Copie des dossiers et fichiers backend Spring ..." -ForegroundColor Yellow
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
        $destPath = Join-Path $cloneDir $item
        if (Test-Path $destPath) { Remove-Item -Recurse -Force $destPath -ErrorAction SilentlyContinue }
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

Write-Host "[4/5] Commit ..." -ForegroundColor Yellow
git config user.email "brouri12@users.noreply.github.com"
git config user.name "brouri12"
git add -A
git status --short
git commit -m "Backend Spring Boot (rahali): Eureka, Gateway, Formation, Quiz-Badge, Docker"

Write-Host "[5/5] Push vers origin $branch ..." -ForegroundColor Yellow
git push -u origin $branch

Set-Location $piRoot
Write-Host ""
Write-Host "Terminé. Backend sur la branche '$branch': $remote (branch: $branch)" -ForegroundColor Green
