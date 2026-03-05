# Script pour changer en Dinar Tunisien (TND)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATION VERS DINAR TUNISIEN (TND)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$files = @(
    "frontend/angular-app/src/app/pages/pricing/pricing.html",
    "frontend/angular-app/src/app/pages/pricing/pricing.ts",
    "back-office/src/app/pages/dashboard/dashboard.html",
    "back-office/src/app/pages/dashboard/dashboard.ts"
)

Write-Host "Fichiers a modifier:" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  X $file (non trouve)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTRUCTIONS MANUELLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Base de Donnees:" -ForegroundColor Yellow
Write-Host "   Executez le script SQL: MIGRATE_TO_TND.sql" -ForegroundColor White
Write-Host ""

Write-Host "2. Frontend - Pricing Page:" -ForegroundColor Yellow
Write-Host "   Fichier: frontend/angular-app/src/app/pages/pricing/pricing.html" -ForegroundColor White
Write-Host "   Cherchez le symbole dollar et remplacez par TND" -ForegroundColor White
Write-Host ""

Write-Host "3. Frontend - Pricing Component:" -ForegroundColor Yellow
Write-Host "   Fichier: frontend/angular-app/src/app/pages/pricing/pricing.ts" -ForegroundColor White
Write-Host "   Dans getPrice(), retournez le prix sans dollar" -ForegroundColor White
Write-Host ""

Write-Host "4. Dashboard:" -ForegroundColor Yellow
Write-Host "   Fichier: back-office/src/app/pages/dashboard/dashboard.html" -ForegroundColor White
Write-Host "   Cherchez tous les dollars et remplacez par TND" -ForegroundColor White
Write-Host ""

Write-Host "5. Dashboard Component:" -ForegroundColor Yellow
Write-Host "   Fichier: back-office/src/app/pages/dashboard/dashboard.ts" -ForegroundColor White
Write-Host "   Changez dollar en TND" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NOUVEAUX PRIX SUGGERES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Basic:      " -NoNewline -ForegroundColor White
Write-Host "30 TND" -ForegroundColor Green -NoNewline
Write-Host "  /mois (au lieu de 9.99 USD)" -ForegroundColor Gray

Write-Host "Premium:    " -NoNewline -ForegroundColor White
Write-Host "90 TND" -ForegroundColor Green -NoNewline
Write-Host "  /mois (au lieu de 29.99 USD)" -ForegroundColor Gray

Write-Host "Enterprise: " -NoNewline -ForegroundColor White
Write-Host "300 TND" -ForegroundColor Green -NoNewline
Write-Host " /mois (au lieu de 99.99 USD)" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Executer MIGRATE_TO_TND.sql dans phpMyAdmin" -ForegroundColor White
Write-Host "2. Modifier pricing.html (symbole dollar)" -ForegroundColor White
Write-Host "3. Modifier pricing.ts (getPrice method)" -ForegroundColor White
Write-Host "4. Modifier dashboard.html (tous les dollars)" -ForegroundColor White
Write-Host "5. Modifier dashboard.ts (analytics display)" -ForegroundColor White
Write-Host "6. Redemarrer les services" -ForegroundColor White
Write-Host "7. Tester affichage des prix" -ForegroundColor White
Write-Host "8. Verifier les paiements" -ForegroundColor White

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pour plus de details, consultez: TND_QUICK_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
