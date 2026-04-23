# Push du front (e_learnig-platform) vers la branche "rahali" de https://github.com/brouri12/angular-app.git
# Usage: .\push-front-angular-app-rahali.ps1

$ErrorActionPreference = "Stop"
$piRoot = $PSScriptRoot
$remote = "https://github.com/brouri12/angular-app.git"
$branch = "rahali"
$cloneDir = Join-Path $env:TEMP "angular-app-push-rahali"
$frontSource = Join-Path $piRoot "e_learnig-platform"

Write-Host "=== Front (Angular + back-office) -> angular-app (branche: $branch) ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $frontSource)) {
    Write-Host "Erreur: dossier e_learnig-platform introuvable." -ForegroundColor Red
    exit 1
}

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

Write-Host "[3/5] Copie du contenu front (back-office, frontend, UI_UX Design) ..." -ForegroundColor Yellow
$folders = @("back-office", "frontend", "UI_UX Design for Learning Platform")
foreach ($f in $folders) {
    $src = Join-Path $frontSource $f
    if (Test-Path $src) {
        $dest = Join-Path $cloneDir $f
        if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
        Copy-Item -Path $src -Destination $cloneDir -Recurse -Force
        Write-Host "  + $f" -ForegroundColor Gray
    }
}
$frontGitignore = Join-Path $frontSource ".gitignore"
if (Test-Path $frontGitignore) {
    Copy-Item $frontGitignore (Join-Path $cloneDir ".gitignore") -Force
}
$frontReadme = Join-Path $frontSource "README.md"
if (Test-Path $frontReadme) {
    Copy-Item $frontReadme (Join-Path $cloneDir "README.md") -Force -ErrorAction SilentlyContinue
}

Write-Host "[4/5] Commit ..." -ForegroundColor Yellow
git config user.email "brouri12@users.noreply.github.com"
git config user.name "brouri12"
git add -A
git status --short
git commit -m "Front (rahali): back-office, frontend/angular-app, UI_UX Design for Learning Platform"

Write-Host "[5/5] Push vers origin $branch ..." -ForegroundColor Yellow
git push -u origin $branch

Set-Location $piRoot
Write-Host ""
Write-Host "Terminé. Front sur la branche '$branch': $remote" -ForegroundColor Green
