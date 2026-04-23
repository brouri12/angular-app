# Push du front (e_learnig-platform) vers https://github.com/brouri12/angular-app.git
# Structure du repo angular-app: back-office, frontend/angular-app, UI_UX Design for Learning Platform
# Usage: .\push-front-angular-app.ps1

$ErrorActionPreference = "Stop"
$piRoot = $PSScriptRoot
$remote = "https://github.com/brouri12/angular-app.git"
$cloneDir = Join-Path $env:TEMP "angular-app-push"
$frontSource = Join-Path $piRoot "e_learnig-platform"

Write-Host "=== Front (Angular + back-office) -> angular-app ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $frontSource)) {
    Write-Host "Erreur: dossier e_learnig-platform introuvable." -ForegroundColor Red
    exit 1
}

# Nettoyer un ancien clone
if (Test-Path $cloneDir) {
    Remove-Item -Recurse -Force $cloneDir
}

Write-Host "[1/4] Clone de $remote ..." -ForegroundColor Yellow
git clone $remote $cloneDir
Set-Location $cloneDir

Write-Host "[2/4] Copie du contenu front (back-office, frontend, UI_UX Design) ..." -ForegroundColor Yellow
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
# .gitignore front si présent
$frontGitignore = Join-Path $frontSource ".gitignore"
if (Test-Path $frontGitignore) {
    Copy-Item $frontGitignore (Join-Path $cloneDir ".gitignore") -Force
}
# README
$frontReadme = Join-Path $frontSource "README.md"
if (Test-Path $frontReadme) {
    Copy-Item $frontReadme (Join-Path $cloneDir "README.md") -Force -ErrorAction SilentlyContinue
}

Write-Host "[3/4] Commit ..." -ForegroundColor Yellow
git config user.email "brouri12@users.noreply.github.com"
git config user.name "brouri12"
git add -A
git status --short
git commit -m "Front: back-office, frontend/angular-app, UI_UX Design for Learning Platform"

Write-Host "[4/4] Push vers origin main ..." -ForegroundColor Yellow
git push -u origin main

Set-Location $piRoot
Write-Host ""
Write-Host "Terminé. Front disponible sur: $remote" -ForegroundColor Green
