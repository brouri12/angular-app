# Script pour configurer le dépôt GitHub selon les directives Esprit

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION GITHUB - ESPRIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans un dépôt Git
if (-not (Test-Path ".git")) {
    Write-Host "X Ce n'est pas un dépôt Git!" -ForegroundColor Red
    Write-Host "  Initialisez d'abord avec: git init" -ForegroundColor Yellow
    exit 1
}

Write-Host "Verification du depot Git..." -ForegroundColor Green
Write-Host ""

# Obtenir l'URL du remote actuel
$remoteUrl = git remote get-url origin 2>$null

if ($remoteUrl) {
    Write-Host "Remote actuel:" -ForegroundColor Cyan
    Write-Host "  $remoteUrl" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Aucun remote configure" -ForegroundColor Yellow
    Write-Host ""
}

# Proposer le nouveau nom
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NOUVEAU NOM DE DEPOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Format requis: Esprit-[PI]-[Classe]-[AU]-[NomDuProjet]" -ForegroundColor Yellow
Write-Host ""
Write-Host "Exemple pour ce projet:" -ForegroundColor Cyan
Write-Host "  Esprit-PIDEV-3A-2026-Wordly-ELearning" -ForegroundColor Green
Write-Host ""

$newRepoName = Read-Host "Entrez le nouveau nom du depot (ou appuyez sur Entree pour utiliser l'exemple)"

if ([string]::IsNullOrWhiteSpace($newRepoName)) {
    $newRepoName = "Esprit-PIDEV-3A-2026-Wordly-ELearning"
    Write-Host "Utilisation du nom par defaut: $newRepoName" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INFORMATIONS A AJOUTER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Description du depot:" -ForegroundColor Cyan
Write-Host "Developed at Esprit School of Engineering - Tunisia | Academic Year: 2025-2026 | Technologies: Angular, Spring Boot, MySQL, Keycloak, Stripe" -ForegroundColor White
Write-Host ""

Write-Host "Topics a ajouter:" -ForegroundColor Cyan
$topics = @(
    "esprit-school-of-engineering",
    "academic-project",
    "esprit-pidev",
    "2025-2026",
    "angular",
    "spring-boot",
    "microservices",
    "e-learning",
    "mysql",
    "keycloak",
    "stripe"
)

foreach ($topic in $topics) {
    Write-Host "  - $topic" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACTIONS A EFFECTUER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Renommer le depot sur GitHub:" -ForegroundColor Yellow
Write-Host "   - Allez sur Settings > Repository name" -ForegroundColor White
Write-Host "   - Changez en: $newRepoName" -ForegroundColor Green
Write-Host ""

Write-Host "2. Ajouter la description:" -ForegroundColor Yellow
Write-Host "   - Cliquez sur l'icone Settings (roue dentee) a cote de 'About'" -ForegroundColor White
Write-Host "   - Collez la description ci-dessus" -ForegroundColor White
Write-Host ""

Write-Host "3. Ajouter les topics:" -ForegroundColor Yellow
Write-Host "   - Dans la meme fenetre 'About'" -ForegroundColor White
Write-Host "   - Ajoutez chaque topic liste ci-dessus" -ForegroundColor White
Write-Host ""

Write-Host "4. Mettre a jour le remote local:" -ForegroundColor Yellow
Write-Host "   git remote set-url origin https://github.com/your-username/$newRepoName.git" -ForegroundColor Green
Write-Host ""

Write-Host "5. Pousser le README.md:" -ForegroundColor Yellow
Write-Host "   git add README.md" -ForegroundColor Green
Write-Host "   git commit -m `"docs: Add Esprit-compliant README`"" -ForegroundColor Green
Write-Host "   git push origin main" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Apres avoir effectue ces actions, verifiez:" -ForegroundColor Yellow
Write-Host "  [x] Nom du depot conforme" -ForegroundColor White
Write-Host "  [x] Description ajoutee" -ForegroundColor White
Write-Host "  [x] Topics ajoutes (au moins 5)" -ForegroundColor White
Write-Host "  [x] README.md visible sur GitHub" -ForegroundColor White
Write-Host "  [x] Mention 'Esprit School of Engineering' en gras" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FICHIERS CREES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "README.md") {
    Write-Host "README.md - Cree" -ForegroundColor Green
} else {
    Write-Host "README.md - Manquant!" -ForegroundColor Red
}

if (Test-Path "GITHUB_SETUP_GUIDE.md") {
    Write-Host "GITHUB_SETUP_GUIDE.md - Cree" -ForegroundColor Green
} else {
    Write-Host "GITHUB_SETUP_GUIDE.md - Manquant!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pour plus de details, consultez: GITHUB_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
