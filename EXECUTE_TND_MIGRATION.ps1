# ================================================
# Script: Executer la Migration TND
# ================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATION BASE DE DONNEES VERS TND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ce script va vous guider pour executer la migration SQL." -ForegroundColor Yellow
Write-Host ""

# Afficher les nouveaux prix
Write-Host "Nouveaux prix en TND:" -ForegroundColor Green
Write-Host "  - Basic:      30 TND  (au lieu de 9.99 USD)" -ForegroundColor White
Write-Host "  - Premium:    90 TND  (au lieu de 29.99 USD)" -ForegroundColor White
Write-Host "  - Enterprise: 300 TND (au lieu de 99.99 USD)" -ForegroundColor White
Write-Host ""

# Instructions
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ouvrez phpMyAdmin dans votre navigateur" -ForegroundColor White
Write-Host "   URL: http://localhost/phpmyadmin" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Selectionnez la base de donnees 'abonnement_db'" -ForegroundColor White
Write-Host ""
Write-Host "3. Cliquez sur l'onglet 'SQL'" -ForegroundColor White
Write-Host ""
Write-Host "4. Copiez et collez le SQL suivant:" -ForegroundColor White
Write-Host ""

# Afficher le SQL
Write-Host "-- ================================================" -ForegroundColor Cyan
Write-Host "-- MIGRATION VERS TND" -ForegroundColor Cyan
Write-Host "-- ================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "USE abonnement_db;" -ForegroundColor Green
Write-Host ""
Write-Host "-- Mise a jour des prix" -ForegroundColor Gray
Write-Host "UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';" -ForegroundColor Green
Write-Host "UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';" -ForegroundColor Green
Write-Host "UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';" -ForegroundColor Green
Write-Host ""
Write-Host "-- Verification" -ForegroundColor Gray
Write-Host "SELECT id_abonnement, nom, prix, duree_jours, statut FROM abonnements;" -ForegroundColor Green
Write-Host ""

Write-Host "5. Cliquez sur 'Executer' (bouton en bas a droite)" -ForegroundColor White
Write-Host ""
Write-Host "6. Verifiez que les prix ont ete mis a jour correctement" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APRES LA MIGRATION SQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Redemarrez les services:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd frontend/angular-app" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "  cd back-office" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testez les pages:" -ForegroundColor Yellow
Write-Host "  - http://localhost:4200/pricing" -ForegroundColor Cyan
Write-Host "  - http://localhost:4201/dashboard" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  PRET A MIGRER!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Demander confirmation
$response = Read-Host "Voulez-vous ouvrir phpMyAdmin maintenant? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Start-Process "http://localhost/phpmyadmin"
    Write-Host ""
    Write-Host "phpMyAdmin ouvert dans votre navigateur!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour plus de details, consultez: CURRENCY_MIGRATION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""
