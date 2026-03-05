# ================================================
# Script: Ouvrir phpMyAdmin et Afficher le SQL
# ================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  CORRECTION IMMEDIATE DES PRIX" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "PROBLEME ACTUEL:" -ForegroundColor Yellow
Write-Host "  Basic:      " -NoNewline -ForegroundColor White
Write-Host "`$9.99 TND" -ForegroundColor Red -NoNewline
Write-Host "  (devrait etre 30 TND)" -ForegroundColor Gray

Write-Host "  Premium:    " -NoNewline -ForegroundColor White
Write-Host "`$29.99 TND" -ForegroundColor Red -NoNewline
Write-Host " (devrait etre 90 TND)" -ForegroundColor Gray

Write-Host "  Enterprise: " -NoNewline -ForegroundColor White
Write-Host "`$99.99 TND" -ForegroundColor Red -NoNewline
Write-Host " (devrait etre 300 TND)" -ForegroundColor Gray

Write-Host ""
Write-Host "CAUSE:" -ForegroundColor Yellow
Write-Host "  La base de donnees contient toujours les anciens prix USD" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SQL A EXECUTER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sql = @"
USE abonnement_db;

UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';

SELECT id_abonnement, nom, prix, duree_jours, statut FROM abonnements;
"@

Write-Host $sql -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. phpMyAdmin va s'ouvrir dans votre navigateur" -ForegroundColor White
Write-Host "2. Selectionnez la base 'abonnement_db' a gauche" -ForegroundColor White
Write-Host "3. Cliquez sur l'onglet 'SQL' en haut" -ForegroundColor White
Write-Host "4. Copiez-collez le SQL ci-dessus" -ForegroundColor White
Write-Host "5. Cliquez sur 'Executer'" -ForegroundColor White
Write-Host "6. Rafraichissez la page pricing (Ctrl+Shift+R)" -ForegroundColor White
Write-Host ""

# Copier le SQL dans le presse-papiers
$sql | Set-Clipboard
Write-Host "Le SQL a ete copie dans votre presse-papiers!" -ForegroundColor Green
Write-Host "Vous pouvez le coller directement dans phpMyAdmin (Ctrl+V)" -ForegroundColor Green
Write-Host ""

# Demander confirmation
$response = Read-Host "Voulez-vous ouvrir phpMyAdmin maintenant? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "Ouverture de phpMyAdmin..." -ForegroundColor Cyan
    Start-Process "http://localhost/phpmyadmin"
    Write-Host ""
    Write-Host "phpMyAdmin ouvert!" -ForegroundColor Green
    Write-Host "Le SQL est deja dans votre presse-papiers, collez-le avec Ctrl+V" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APRES L'EXECUTION DU SQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Allez sur: http://localhost:4200/pricing" -ForegroundColor Cyan
Write-Host "2. Appuyez sur Ctrl+Shift+R (rafraichissement force)" -ForegroundColor Cyan
Write-Host "3. Vous devriez voir:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Basic:      " -NoNewline -ForegroundColor White
Write-Host "30 TND" -ForegroundColor Green

Write-Host "   Premium:    " -NoNewline -ForegroundColor White
Write-Host "90 TND" -ForegroundColor Green

Write-Host "   Enterprise: " -NoNewline -ForegroundColor White
Write-Host "300 TND" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PRET A CORRIGER!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
