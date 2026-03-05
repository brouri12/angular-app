# Script pour vérifier les données utilisateur dans MySQL

Write-Host "Verification des donnees utilisateur dans MySQL..." -ForegroundColor Cyan
Write-Host ""

# Requête SQL pour voir les données de student1aaz
$query = "SELECT id_user, username, email, role, nom, prenom, telephone, date_naissance, niveau_actuel, statut_etudiant, specialite, experience, disponibilite FROM users WHERE username = 'student1aaz';"

Write-Host "Requete SQL:" -ForegroundColor Yellow
Write-Host $query -ForegroundColor Gray
Write-Host ""

Write-Host "Executez cette commande dans MySQL:" -ForegroundColor Yellow
Write-Host "1. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)" -ForegroundColor Gray
Write-Host "2. Selectionnez la base 'user_db'" -ForegroundColor Gray
Write-Host "3. Allez dans l'onglet SQL" -ForegroundColor Gray
Write-Host "4. Collez et executez:" -ForegroundColor Gray
Write-Host ""
Write-Host $query -ForegroundColor White
Write-Host ""
Write-Host "OU utilisez la ligne de commande MySQL:" -ForegroundColor Yellow
Write-Host 'mysql -u root -P 3307 -e "USE user_db; ' + $query + '"' -ForegroundColor White
Write-Host ""
