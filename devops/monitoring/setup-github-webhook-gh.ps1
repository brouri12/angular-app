# ============================================================
#  Auto Setup GitHub Webhook -> Jenkins (using gh CLI)
# ============================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$PublicJenkinsUrl,

    [Parameter(Mandatory = $false)]
    [string]$Repo = "brouri12/angular-app",

    [Parameter(Mandatory = $false)]
    [string]$Secret = ""
)

$ErrorActionPreference = "Stop"
$env:GH_PAGER = "cat"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  GitHub Webhook Auto Setup (gh CLI)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

try {
    gh --version | Out-Null
}
catch {
    Write-Host "[ERROR] gh CLI n'est pas installe." -ForegroundColor Red
    Write-Host "Installez GitHub CLI: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

try {
    gh auth status | Out-Null
}
catch {
    Write-Host "[ERROR] Vous n'etes pas connecte a GitHub CLI." -ForegroundColor Red
    Write-Host "Executez: gh auth login" -ForegroundColor Yellow
    exit 1
}

$normalized = $PublicJenkinsUrl.TrimEnd("/")
$webhookUrl = "$normalized/github-webhook/"

Write-Host "[INFO] Webhook URL cible: $webhookUrl" -ForegroundColor Yellow

$existingHooks = gh api "repos/$Repo/hooks" --jq '.[] | {id: .id, url: .config.url}' 2>$null | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Impossible de lire les webhooks du repo '$Repo'." -ForegroundColor Red
    Write-Host "Verifiez que le repo existe et que votre compte a les droits admin webhook." -ForegroundColor Yellow
    exit 1
}
if ($existingHooks -match [regex]::Escape($webhookUrl)) {
    Write-Host "[INFO] Un webhook existe deja pour cette URL. Aucune creation necessaire." -ForegroundColor Green
    exit 0
}

if ($Secret -ne "") {
    gh api "repos/$Repo/hooks" `
        --method POST `
        -f name='web' `
        -F active=true `
        -f events[]='push' `
        -f config[url]="$webhookUrl" `
        -f config[content_type]='json' `
        -f config[insecure_ssl]='0' `
        -f config[secret]="$Secret" | Out-Null
}
else {
    gh api "repos/$Repo/hooks" `
        --method POST `
        -f name='web' `
        -F active=true `
        -f events[]='push' `
        -f config[url]="$webhookUrl" `
        -f config[content_type]='json' `
        -f config[insecure_ssl]='0' | Out-Null
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Echec de creation du webhook sur '$Repo'." -ForegroundColor Red
    Write-Host "Assurez-vous d'avoir les scopes et droits admin webhook sur le depot." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Webhook GitHub cree avec succes." -ForegroundColor Green
Write-Host ""
Write-Host "Etapes restantes dans Jenkins:" -ForegroundColor Cyan
Write-Host "1. Ouvrir votre job Jenkins" -ForegroundColor White
Write-Host "2. Configure -> Build Triggers" -ForegroundColor White
Write-Host "3. Cocher 'GitHub hook trigger for GITScm polling'" -ForegroundColor White
Write-Host "4. Save" -ForegroundColor White
Write-Host ""
