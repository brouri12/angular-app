# Demarre le dashboard Node (e-learning) et ouvre la page etudiant dans le navigateur
# Utilisation: .\DEMARRER_DASHBOARD.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host ""
Write-Host "=== Demarrage du dashboard E-Learning ===" -ForegroundColor Cyan
Write-Host "   Dossier: $scriptDir" -ForegroundColor Gray
Write-Host ""

# Arreter tout serveur deja en cours sur 8083/8084 pour repartir a jour (nouveau code + .env)
foreach ($port in @(8083, 8084)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $owningPid = $conn.OwningProcess
        Write-Host "Arret de l'ancien serveur sur le port $port (PID $owningPid)..." -ForegroundColor Yellow
        Stop-Process -Id $owningPid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Write-Host "Lancement du serveur... Verifiez la ligne [Coach] API key: pour le chatbot." -ForegroundColor Gray
Write-Host "Le navigateur s'ouvrira dans 5 secondes. Arret: Ctrl+C" -ForegroundColor Gray
Write-Host ""

$job = Start-Job -ScriptBlock { Start-Sleep -Seconds 5; Start-Process "http://localhost:8083/front-office/student.html" }
node xampp-mysql-dashboard.js
Remove-Job $job -Force -ErrorAction SilentlyContinue
