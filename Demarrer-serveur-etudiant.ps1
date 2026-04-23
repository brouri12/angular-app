# Lance le serveur E-Learning et ouvre l'espace etudiant dans le navigateur
# Usage: Clic droit > Executer avec PowerShell  OU  .\Demarrer-serveur-etudiant.ps1

$piRoot = $PSScriptRoot
$PORT = 8083

Set-Location $piRoot

Write-Host ""
Write-Host "  Demarrage du serveur E-Learning..." -ForegroundColor Cyan
Write-Host ""

# Demarrer le serveur dans une nouvelle fenetre (reste ouverte)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$piRoot'; node xampp-mysql-dashboard.js"

# Attendre que le serveur reponde
Start-Sleep -Seconds 5

# Ouvrir la page etudiant (si le serveur a pris 8084 car 8083 etait occupe, ouvrir les deux)
$url8083 = "http://localhost:8083/front-office/student.html"
$url8084 = "http://localhost:8084/front-office/student.html"
Write-Host "  Ouverture de l'espace etudiant dans le navigateur..." -ForegroundColor Green
Start-Process $url8083
Start-Sleep -Seconds 1
Start-Process $url8084

Write-Host ""
Write-Host "  Si une page ne charge pas, utilisez celle qui affiche le site." -ForegroundColor Yellow
Write-Host "  L'autre fenetre PowerShell affiche le port utilise (8083 ou 8084)." -ForegroundColor Yellow
Write-Host ""
